#!/usr/bin/env python3
"""
Build Purpose Academy Basic Computer Skills teaching videos.

Each lesson pairs action-matched visuals with warm open-source Piper TTS
narration (en_US-lessac-medium) and large Level-4 English captions (ASS).

Why Piper (not Edge JennyNeural): local, open neural voice — clearer, more
human presence for absolute beginners. Lessac medium reads as a patient
instructor, not a stock assistant.

Visual sources:
  - Hardware lessons: royalty-free Pexels / Mixkit close-up action clips
  - Software lessons: Playwright recordings of scripts/bcs-demos/desktop.html

Modes:
  Full rebuild (needs /tmp clips + demos):
    python3 scripts/build-basic-computer-skills-videos.py
  Narration-only refresh (reuses shipped MP4 visuals, reburns captions):
    python3 scripts/build-basic-computer-skills-videos.py --narration-refresh

License: Mixkit Stock Video Free License; Pexels License; Piper voices
(rhasspy/piper-voices); teaching copy © Purpose Academy.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media" / "basic-computer-skills"
BUILD = Path("/tmp/bcs-build")
DEMO_DIR = Path("/tmp/bcs-demos")
ACTION_DIRS = [
    Path("/tmp/bcs-action"),
    Path("/tmp/bcs-action2"),
    Path("/tmp/bcs-broll"),
    Path("/tmp/bcs-broll2"),
]
VOICE_DIR = ROOT / "tools" / "piper-voices"
VOICE_MODEL = VOICE_DIR / "en_US-lessac-medium.onnx"
VOICE_CONFIG = VOICE_DIR / "en_US-lessac-medium.onnx.json"
VOICE_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
    "en/en_US/lessac/medium/en_US-lessac-medium.onnx"
)
VOICE_CFG_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
    "en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"
)
# Slightly slower than default so Level-4 learners can follow
PIPER_LENGTH_SCALE = "1.08"
PIPER_BIN = Path.home() / ".local" / "bin" / "piper"
FONT_NAME = "DejaVu Sans"
W, H = 1280, 720
FPS = 24


def resolve_clip(name: str) -> Path:
    for folder in ACTION_DIRS:
        path = folder / name
        if path.exists():
            return path
    raise FileNotFoundError(name)


def resolve_demo(name: str) -> Path:
    path = DEMO_DIR / f"{name}.mp4"
    if not path.exists():
        raise FileNotFoundError(f"Missing demo {path} — run scripts/bcs-demos/record-bcs-demos.mjs first")
    return path


# lines: (start_hint_unused, end_hint_unused, caption/narration text)
# Visual plan drives what the learner sees; TTS + captions use `lines`.
LESSONS: list[dict] = [
    {
        "file": "01_Turn_computer_on_off.mp4",
        "title": "Turn the computer on and off",
        # Power-button close-up, then Start → Shut down screen demo
        "parts": [
            {"kind": "clip", "src": "pexels-power.mp4", "seconds": 28},
            {"kind": "demo", "name": "power", "seconds": 32},
        ],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson one — turning the computer on and off."),
            (10, 18, "First, find the power button on your computer or laptop."),
            (18, 26, "Press it once. That turns the computer on."),
            (26, 34, "Give it a moment — the screen will light up."),
            (34, 42, "When you are ready to turn it off, click Start,"),
            (42, 50, "then Power, then Shut down."),
            (50, 58, "Please do not pull the plug while it is still working."),
            (58, 66, "You have got this: on with the button, off with Shut down."),
        ],
    },
    {
        "file": "02_Use_the_mouse.mp4",
        "title": "Use the mouse",
        "parts": [{"kind": "clip", "src": "mouse-17669.mp4", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson two — using the mouse."),
            (10, 18, "Move the mouse, and the arrow on the screen moves with you."),
            (18, 26, "One click selects. Press the left button one time."),
            (26, 34, "Double-click opens. Two quick clicks."),
            (34, 42, "Right-click shows more choices. Use the right button."),
            (42, 50, "To scroll the page, gently roll the wheel."),
            (50, 58, "Take your time: point, click, open, and scroll."),
        ],
    },
    {
        "file": "03_Use_the_keyboard.mp4",
        "title": "Use the keyboard",
        # Hands on keys, then on-screen typing that shows Space / Enter / Backspace / Shift
        "parts": [
            {"kind": "clip", "src": "keyboard-only.mp4", "seconds": 18},
            {"kind": "demo", "name": "keyboard", "seconds": 40},
        ],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson three — using the keyboard."),
            (10, 18, "Letters and numbers put your words on the screen."),
            (18, 26, "The space bar makes a space between words."),
            (26, 34, "Enter starts a new line, or says O K."),
            (34, 42, "Backspace erases the letter behind the cursor."),
            (42, 50, "Hold Shift and a letter to make a capital."),
            (50, 58, "You can do this: type, space, Enter, and Backspace."),
        ],
    },
    {
        "file": "04_Create_a_folder.mp4",
        "title": "Create a folder",
        "parts": [{"kind": "demo", "name": "folder", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson four — creating a folder."),
            (10, 18, "A folder keeps your files together in one place."),
            (18, 26, "Right-click on an empty spot on the desktop."),
            (26, 34, "Click New, then Folder."),
            (34, 42, "Type a clear name — something like School Work."),
            (42, 50, "Press Enter to keep that name."),
            (50, 58, "Nice work: New, Folder, then a clear name."),
        ],
    },
    {
        "file": "05_Create_a_subfolder.mp4",
        "title": "Create a subfolder",
        "parts": [{"kind": "demo", "name": "subfolder", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson five — creating a subfolder."),
            (10, 18, "A subfolder is simply a folder inside another folder."),
            (18, 26, "Open your main folder — for example, School Work."),
            (26, 34, "Right-click inside it. Click New, then Folder."),
            (34, 42, "Name it something clear, like Week One."),
            (42, 50, "Now Week One lives safely inside School Work."),
            (50, 58, "You did it: open the folder, New, Folder, name it."),
        ],
    },
    {
        "file": "06_Save_file_with_name.mp4",
        "title": "Save a file with a name",
        "parts": [{"kind": "demo", "name": "save-name", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson six — saving a file with a name."),
            (10, 18, "Saving keeps your work so you can find it later."),
            (18, 26, "Click File, then click Save As."),
            (26, 34, "Choose a folder you know — School Work works well."),
            (34, 42, "Type a clear name, like Safety Notes."),
            (42, 50, "Then click Save."),
            (50, 58, "Remember the rhythm: Save As, folder, clear name, Save."),
        ],
    },
    {
        "file": "07_Write_short_paragraph.mp4",
        "title": "Write a short paragraph",
        "parts": [{"kind": "demo", "name": "paragraph", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson seven — writing a short paragraph."),
            (10, 18, "Open a document program — Word or Docs is fine."),
            (18, 26, "Click in the white page, then type at your own pace."),
            (26, 34, "Write two or three short sentences."),
            (34, 42, "Press Enter when you want a new line."),
            (42, 50, "Check your spelling. Fix mistakes with Backspace."),
            (50, 58, "You are writing: open, type short sentences, then check."),
        ],
    },
    {
        "file": "08_Save_your_document.mp4",
        "title": "Save your document",
        "parts": [{"kind": "demo", "name": "save-doc", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson eight — saving your document."),
            (10, 18, "Save often so you do not lose your hard work."),
            (18, 26, "Click File, then Save — or press Control and S."),
            (26, 34, "If it asks for a name, type one and click Save."),
            (34, 42, "Glance at the top of the window — you should see the name."),
            (42, 50, "Save again after you add more words."),
            (50, 58, "A good habit: save often. Control and S is quick."),
        ],
    },
    {
        "file": "09_Write_and_send_email.mp4",
        "title": "Write and send an email",
        "parts": [{"kind": "demo", "name": "email-send", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson nine — writing and sending an email."),
            (10, 18, "Open your email, then click Compose or New."),
            (18, 26, "In To, type the other person's email address."),
            (26, 34, "In Subject, write a short title — like Homework."),
            (34, 42, "Type your message in clear, short sentences."),
            (42, 50, "When you are ready, click Send."),
            (50, 58, "That is the path: To, Subject, message, then Send."),
        ],
    },
    {
        "file": "10_Reply_to_email.mp4",
        "title": "Reply to an email",
        "parts": [{"kind": "demo", "name": "email-reply", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson ten — replying to an email."),
            (10, 18, "Open the email you want to answer."),
            (18, 26, "Click Reply — no need to start a brand new email."),
            (26, 34, "Type your answer under their message."),
            (34, 42, "Quick check: the To box still has the right person."),
            (42, 50, "Then click Send."),
            (50, 58, "You are set: open, Reply, type, and Send."),
        ],
    },
    {
        "file": "11_Attach_and_save_files.mp4",
        "title": "Attach a file and save an attachment",
        "parts": [{"kind": "demo", "name": "attach-save", "seconds": 66}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson eleven — attaching and saving files."),
            (10, 18, "To send a file, click Attach or the paperclip."),
            (18, 26, "Choose your file, then wait until you see its name."),
            (26, 34, "After that, click Send."),
            (34, 42, "To keep a file someone sent you, open the email."),
            (42, 50, "Click the file, then Download or Save."),
            (50, 58, "Choose your folder, then click Save."),
            (58, 66, "Keep it simple: attach before Send, and save attachments to a folder."),
        ],
    },
    {
        "file": "12_Stay_safe_online.mp4",
        "title": "Stay safe online",
        "parts": [{"kind": "demo", "name": "safe", "seconds": 58}],
        "lines": [
            (0, 4, "Welcome to Basic Computer Skills."),
            (4, 10, "Lesson twelve — staying safe online."),
            (10, 18, "Keep your password private. Please do not share it."),
            (18, 26, "Do not click strange links in email."),
            (26, 34, "If you are not sure, ask your instructor — that is wise."),
            (34, 42, "Log out when you finish on a shared computer."),
            (42, 50, "Only upload your school work — never passwords."),
            (50, 58, "Stay safe: private password, careful clicks, and ask for help."),
        ],
    },
]


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kwargs)


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)


def ass_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def write_ass(path: Path, lines: list[tuple[float, float, str]]) -> None:
    end = max(e for _, e, _ in lines) + 1.5
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Brand,{FONT_NAME},22,&H0018C5F5,&H000000FF,&H001F1F1F,&HAA000000,1,0,0,0,100,100,0,0,1,2,0,7,28,28,18,1
Style: Caption,{FONT_NAME},32,&H00FFFFFF,&H000000FF,&H00101010,&H99000000,0,0,0,0,100,100,0,0,1,3,0,2,40,40,48,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,{ass_time(end)},Brand,,0,0,0,,PURPOSE ACADEMY
"""
    events = []
    for start, end_t, text in lines:
        safe = text.replace("{", "(").replace("}", ")")
        events.append(
            f"Dialogue: 0,{ass_time(start)},{ass_time(end_t)},Caption,,0,0,0,,{safe}"
        )
    path.write_text(header + "\n".join(events) + "\n", encoding="utf-8")


TTS_CACHE = Path("/tmp/bcs-tts-cache-piper-lessac")


def ensure_piper_voice() -> Path:
    """Download the open-source Lessac medium voice once into tools/piper-voices/."""
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    if not VOICE_MODEL.exists() or VOICE_MODEL.stat().st_size < 1_000_000:
        print("Downloading Piper voice en_US-lessac-medium …")
        urllib.request.urlretrieve(VOICE_URL, VOICE_MODEL)
    if not VOICE_CONFIG.exists():
        urllib.request.urlretrieve(VOICE_CFG_URL, VOICE_CONFIG)
    piper = PIPER_BIN if PIPER_BIN.exists() else Path(shutil.which("piper") or "")
    if not piper or not piper.exists():
        raise FileNotFoundError(
            "piper CLI not found. Install with: pip install --user piper-tts"
        )
    return piper


def synth_line(text: str, out_mp3: Path) -> None:
    """Synthesize one caption line with Piper Lessac (open neural TTS)."""
    piper = ensure_piper_voice()
    TTS_CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(
        f"lessac-medium|{PIPER_LENGTH_SCALE}|{text}".encode("utf-8")
    ).hexdigest()
    cached = TTS_CACHE / f"{key}.wav"
    wav = out_mp3.with_suffix(".wav")
    if cached.exists() and cached.stat().st_size > 500:
        shutil.copy(cached, wav)
    else:
        last_err: Exception | None = None
        for attempt in range(1, 4):
            try:
                proc = subprocess.run(
                    [
                        str(piper),
                        "--model",
                        str(VOICE_MODEL),
                        "--length-scale",
                        PIPER_LENGTH_SCALE,
                        "--output_file",
                        str(wav),
                    ],
                    input=text + "\n",
                    text=True,
                    check=True,
                    capture_output=True,
                )
                if wav.exists() and wav.stat().st_size > 500:
                    shutil.copy(wav, cached)
                    break
                last_err = RuntimeError(proc.stderr[-400:] if proc.stderr else "empty wav")
            except Exception as exc:  # noqa: BLE001
                last_err = exc
                time.sleep(attempt)
        else:
            raise RuntimeError(f"Piper TTS failed for: {text!r}") from last_err

    # Encode to mp3 for the concat pipeline
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(wav),
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(out_mp3),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if not out_mp3.exists() or out_mp3.stat().st_size < 400:
        raise RuntimeError(f"mp3 encode failed for: {text!r}")


def build_narration(
    work: Path, lines: list[tuple[int, int, str]]
) -> tuple[Path, list[tuple[float, float, str]]]:
    """Synthesize each caption line; return mixed audio + real timed caption list."""
    audio_parts: list[Path] = []
    timed: list[tuple[float, float, str]] = []
    t = 0.0
    gap = 0.35
    for i, (_, _, text) in enumerate(lines):
        mp3 = work / f"line_{i:02d}.mp3"
        synth_line(text, mp3)
        dur = ffprobe_duration(mp3)
        # Short intro lines can feel abrupt — keep a little air
        start = t
        end = t + dur
        timed.append((start, end, text))
        audio_parts.append(mp3)
        t = end + gap

    # Concat mp3s with silence gaps via ffmpeg
    list_file = work / "audio_concat.txt"
    silence = work / "silence.mp3"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=24000:cl=mono",
            "-t",
            str(gap),
            "-q:a",
            "9",
            "-acodec",
            "libmp3lame",
            str(silence),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    with list_file.open("w", encoding="utf-8") as fh:
        for i, part in enumerate(audio_parts):
            fh.write(f"file '{part}'\n")
            if i < len(audio_parts) - 1:
                fh.write(f"file '{silence}'\n")

    narr = work / "narration.mp3"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(narr),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    # Trailing half-second of silence for a soft ending
    narr_pad = work / "narration_pad.mp3"
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(narr),
            "-af",
            "apad=pad_dur=0.8",
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(narr_pad),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return narr_pad, timed


def normalize_clip(src: Path, seconds: float, dest: Path) -> None:
    """Loop/trim a source clip to exact seconds at 1280x720, no audio."""
    run(
        [
            "ffmpeg",
            "-y",
            "-stream_loop",
            "-1",
            "-i",
            str(src),
            "-t",
            f"{seconds:.3f}",
            "-vf",
            f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps={FPS}",
            "-an",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def normalize_demo(src: Path, seconds: float, dest: Path) -> None:
    """Fit a demo recording to target seconds by gently slowing playback (keeps action visible)."""
    dur = max(ffprobe_duration(src), 0.1)
    factor = seconds / dur
    # Cap extreme slowdown; if still short, loop after slowing
    if factor > 2.8:
        factor = 2.8
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
        f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,setsar=1,"
        f"setpts={factor:.4f}*PTS,fps={FPS}"
    )
    slowed = dest.with_name(dest.stem + "_slow.mp4")
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-vf",
            vf,
            "-an",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(slowed),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    # Loop if still shorter than target (after cap)
    run(
        [
            "ffmpeg",
            "-y",
            "-stream_loop",
            "-1",
            "-i",
            str(slowed),
            "-t",
            f"{seconds:.3f}",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-an",
            str(dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    slowed.unlink(missing_ok=True)


def compose_visual(work: Path, lesson: dict, total_seconds: float) -> Path:
    parts = lesson["parts"]
    # Scale part lengths so sum matches narration length
    planned = sum(p["seconds"] for p in parts)
    scale = total_seconds / planned if planned else 1.0
    segment_files: list[Path] = []
    for i, part in enumerate(parts):
        sec = part["seconds"] * scale
        seg = work / f"seg_{i:02d}.mp4"
        if part["kind"] == "clip":
            normalize_clip(resolve_clip(part["src"]), sec, seg)
        elif part["kind"] == "demo":
            normalize_demo(resolve_demo(part["name"]), sec, seg)
        else:
            raise ValueError(part)
        segment_files.append(seg)

    if len(segment_files) == 1:
        visual = work / "visual.mp4"
        shutil.copy(segment_files[0], visual)
        return visual

    list_file = work / "visual_concat.txt"
    with list_file.open("w", encoding="utf-8") as fh:
        for seg in segment_files:
            fh.write(f"file '{seg}'\n")
    visual = work / "visual.mp4"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-c",
            "copy",
            str(visual),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return visual


def mux_visual_narration(visual: Path, narr: Path, timed: list[tuple[float, float, str]], out: Path) -> None:
    """Burn captions + mux Piper narration onto a silent (or ignored-audio) visual."""
    ass_path = visual.parent / "captions.ass"
    write_ass(ass_path, timed)
    ass_esc = str(ass_path).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},setsar=1,"
        f"drawbox=x=0:y=0:w=iw:h=64:color=0x0B2F5C@0.88:t=fill,"
        f"drawbox=x=0:y=ih-160:w=iw:h=160:color=black@0.55:t=fill,"
        f"subtitles={ass_esc}"
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(visual),
            "-i",
            str(narr),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-vf",
            vf,
            "-r",
            str(FPS),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(out),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def build_lesson(lesson: dict) -> Path:
    BUILD.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="bcs_lesson_", dir=str(BUILD)))
    print("BUILD", lesson["file"])

    narr, timed = build_narration(work, lesson["lines"])
    audio_dur = ffprobe_duration(narr)
    visual = compose_visual(work, lesson, audio_dur)
    out = OUT / lesson["file"]
    mux_visual_narration(visual, narr, timed, out)
    print("  ->", out, f"({ffprobe_duration(out):.1f}s, {out.stat().st_size // 1024} KB)")
    return out


def refresh_narration(lesson: dict) -> Path:
    """
    Reuse the shipped MP4 as the visual bed. Cover the old caption strip,
    burn new Level-4 captions, and replace audio with Piper Lessac.
    """
    BUILD.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    src = OUT / lesson["file"]
    if not src.exists():
        raise FileNotFoundError(f"Missing shipped video for refresh: {src}")

    work = Path(tempfile.mkdtemp(prefix="bcs_refresh_", dir=str(BUILD)))
    print("REFRESH", lesson["file"])

    narr, timed = build_narration(work, lesson["lines"])
    audio_dur = ffprobe_duration(narr)
    video_dur = ffprobe_duration(src)

    # Stretch or loop the existing visual so it covers the new narration length
    visual = work / "visual.mp4"
    if abs(video_dur - audio_dur) < 0.35:
        # Drop old audio; keep frames
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(src),
                "-an",
                "-c:v",
                "copy",
                str(visual),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    elif video_dur < audio_dur:
        # Loop the bed until narration ends
        run(
            [
                "ffmpeg",
                "-y",
                "-stream_loop",
                "-1",
                "-i",
                str(src),
                "-t",
                f"{audio_dur:.3f}",
                "-an",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                str(visual),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        # Gently slow the bed so action still fills the narration
        factor = audio_dur / max(video_dur, 0.1)
        factor = min(max(factor, 0.85), 1.35)
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(src),
                "-vf",
                f"setpts={factor:.4f}*PTS,fps={FPS}",
                "-an",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                str(visual),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    out = OUT / lesson["file"]
    mux_visual_narration(visual, narr, timed, out)
    print("  ->", out, f"({ffprobe_duration(out):.1f}s, {out.stat().st_size // 1024} KB)")
    return out


def write_manifest(built: list[dict]) -> None:
    (OUT / "manifest.json").write_text(json.dumps(built, indent=2) + "\n")
    (OUT / "README.md").write_text(
        """# Basic Computer Skills videos

Royalty-free teaching clips for Purpose Academy Unit 6 / journey step 12.

- Hardware lessons use Pexels / Mixkit close-up action footage.
- Software lessons use recorded practice-desktop demos (folder, email, save, safety).
- Each MP4 includes warm English narration via **Piper** open-source neural TTS
  (`en_US-lessac-medium`) and burned-in Level-4 captions.

Rebuild (full — needs `/tmp` action clips + demos):

```bash
node scripts/bcs-demos/record-bcs-demos.mjs
python3 scripts/build-basic-computer-skills-videos.py
```

Refresh narration only (reuses shipped visuals):

```bash
pip install --user piper-tts
python3 scripts/build-basic-computer-skills-videos.py --narration-refresh
```
""",
        encoding="utf-8",
    )


def main() -> None:
    refresh = "--narration-refresh" in sys.argv
    ensure_piper_voice()
    built = []
    for lesson in LESSONS:
        path = refresh_narration(lesson) if refresh else build_lesson(lesson)
        built.append(
            {
                "file": lesson["file"],
                "title": lesson["title"],
                "bytes": path.stat().st_size,
                "seconds": round(ffprobe_duration(path), 1),
                "has_audio": True,
                "voice": "piper:en_US-lessac-medium",
            }
        )
    write_manifest(built)
    print("Wrote", len(built), "videos to", OUT, "(refresh)" if refresh else "(full)")


if __name__ == "__main__":
    main()
