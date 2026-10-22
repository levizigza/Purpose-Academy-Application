#!/usr/bin/env python3
"""
Build Purpose Academy Basic Computer Skills teaching videos.

Each lesson pairs action-matched visuals with natural Edge TTS narration
(en-US-JennyNeural) and large Level-4 English captions (ASS).

Visual sources:
  - Hardware lessons: royalty-free Pexels / Mixkit close-up action clips
  - Software lessons: Playwright recordings of scripts/bcs-demos/desktop.html

License: Mixkit Stock Video Free License; Pexels License; teaching copy © Purpose Academy.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import tempfile
import time
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
EDGE_TTS = Path.home() / ".local" / "bin" / "edge-tts"
VOICE = "en-US-JennyNeural"
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
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 1 — Turn the computer on and off"),
            (10, 18, "Find the power button on the computer or laptop."),
            (18, 26, "Press it one time to turn the computer ON."),
            (26, 34, "Wait. The screen will light up."),
            (34, 42, "To turn OFF: click the Start button,"),
            (42, 50, "then click Power, then click Shut down."),
            (50, 58, "Do not pull the plug while it is working."),
            (58, 66, "Remember: On with the button. Off with Shut down."),
        ],
    },
    {
        "file": "02_Use_the_mouse.mp4",
        "title": "Use the mouse",
        "parts": [{"kind": "clip", "src": "mouse-17669.mp4", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 2 — Use the mouse"),
            (10, 18, "Move the mouse. The arrow on the screen moves too."),
            (18, 26, "One click = select. Press the left button one time."),
            (26, 34, "Double-click = open. Click two times fast."),
            (34, 42, "Right-click = more choices. Press the right button."),
            (42, 50, "Scroll = move the page. Roll the wheel."),
            (50, 58, "Remember: Point. Click. Open. Scroll."),
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
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 3 — Use the keyboard"),
            (10, 18, "Letters and numbers type words on the screen."),
            (18, 26, "Space bar = make a space between words."),
            (26, 34, "Enter = go to the next line or say OK."),
            (34, 42, "Backspace = erase the letter behind the cursor."),
            (42, 50, "Shift + letter = make a CAPITAL letter."),
            (50, 58, "Remember: Type. Space. Enter. Backspace."),
        ],
    },
    {
        "file": "04_Create_a_folder.mp4",
        "title": "Create a folder",
        "parts": [{"kind": "demo", "name": "folder", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 4 — Create a folder"),
            (10, 18, "A folder holds your files in one place."),
            (18, 26, "Right-click on an empty place on the desktop."),
            (26, 34, "Click New, then click Folder."),
            (34, 42, "Type a clear name. Example: School Work."),
            (42, 50, "Press Enter to keep the name."),
            (50, 58, "Remember: New, Folder, type a clear name."),
        ],
    },
    {
        "file": "05_Create_a_subfolder.mp4",
        "title": "Create a subfolder",
        "parts": [{"kind": "demo", "name": "subfolder", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 5 — Create a subfolder"),
            (10, 18, "A subfolder is a folder inside another folder."),
            (18, 26, "Open your main folder. Example: School Work."),
            (26, 34, "Right-click inside it. Click New, then Folder."),
            (34, 42, "Name it. Example: Week 1."),
            (42, 50, "Now Week 1 lives inside School Work."),
            (50, 58, "Remember: Open folder, New, Folder, name it."),
        ],
    },
    {
        "file": "06_Save_file_with_name.mp4",
        "title": "Save a file with a name",
        "parts": [{"kind": "demo", "name": "save-name", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 6 — Save a file with a name"),
            (10, 18, "Saving keeps your work so you can find it later."),
            (18, 26, "Click File, then click Save As."),
            (26, 34, "Choose a folder. Example: School Work."),
            (34, 42, "Type a clear name. Example: Safety Notes."),
            (42, 50, "Click Save."),
            (50, 58, "Remember: Save As, folder, clear name, Save."),
        ],
    },
    {
        "file": "07_Write_short_paragraph.mp4",
        "title": "Write a short paragraph",
        "parts": [{"kind": "demo", "name": "paragraph", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 7 — Write a short paragraph"),
            (10, 18, "Open a document program. Example: Word or Docs."),
            (18, 26, "Click in the white page. Type slowly."),
            (26, 34, "Write 2 or 3 short sentences."),
            (34, 42, "Use Enter to start a new line when you need it."),
            (42, 50, "Check spelling. Fix mistakes with Backspace."),
            (50, 58, "Remember: Open, type short sentences, check."),
        ],
    },
    {
        "file": "08_Save_your_document.mp4",
        "title": "Save your document",
        "parts": [{"kind": "demo", "name": "save-doc", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 8 — Save your document"),
            (10, 18, "Save often so you do not lose your work."),
            (18, 26, "Click File, Save, or press Ctrl and S."),
            (26, 34, "If it asks for a name, type one and click Save."),
            (34, 42, "Look at the top of the window. You should see the name."),
            (42, 50, "Save again after you add more words."),
            (50, 58, "Remember: Save often. Ctrl and S is fast."),
        ],
    },
    {
        "file": "09_Write_and_send_email.mp4",
        "title": "Write and send an email",
        "parts": [{"kind": "demo", "name": "email-send", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 9 — Write and send an email"),
            (10, 18, "Open your email. Click Compose or New."),
            (18, 26, "To: type the other person's email address."),
            (26, 34, "Subject: write a short title. Example: Homework."),
            (34, 42, "Type your message in clear, short sentences."),
            (42, 50, "Click Send."),
            (50, 58, "Remember: To, Subject, message, Send."),
        ],
    },
    {
        "file": "10_Reply_to_email.mp4",
        "title": "Reply to an email",
        "parts": [{"kind": "demo", "name": "email-reply", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 10 — Reply to an email"),
            (10, 18, "Open the email you want to answer."),
            (18, 26, "Click Reply. Do not start a brand new email."),
            (26, 34, "Type your answer under their message."),
            (34, 42, "Check the To box still has the right person."),
            (42, 50, "Click Send."),
            (50, 58, "Remember: Open, Reply, type, Send."),
        ],
    },
    {
        "file": "11_Attach_and_save_files.mp4",
        "title": "Attach a file and save an attachment",
        "parts": [{"kind": "demo", "name": "attach-save", "seconds": 66}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 11 — Attach and save files"),
            (10, 18, "To send a file: click Attach or the paperclip."),
            (18, 26, "Choose your file. Wait until you see its name."),
            (26, 34, "Then click Send."),
            (34, 42, "To keep a file someone sent you: open the email."),
            (42, 50, "Click the file. Click Download or Save."),
            (50, 58, "Choose your folder. Click Save."),
            (58, 66, "Remember: Attach before Send. Save attachments to a folder."),
        ],
    },
    {
        "file": "12_Stay_safe_online.mp4",
        "title": "Stay safe online",
        "parts": [{"kind": "demo", "name": "safe", "seconds": 58}],
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 12 — Stay safe online"),
            (10, 18, "Keep your password private. Do not share it."),
            (18, 26, "Do not click strange links in email."),
            (26, 34, "Ask your instructor if you are not sure."),
            (34, 42, "Log out when you finish on a shared computer."),
            (42, 50, "Only upload YOUR school work — never passwords."),
            (50, 58, "Remember: Private password. Careful clicks. Ask for help."),
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


TTS_CACHE = Path("/tmp/bcs-tts-cache")


def synth_line(text: str, out_mp3: Path) -> None:
    if not EDGE_TTS.exists():
        raise FileNotFoundError(f"edge-tts not found at {EDGE_TTS}")
    TTS_CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(f"{VOICE}|-5%|{text}".encode("utf-8")).hexdigest()
    cached = TTS_CACHE / f"{key}.mp3"
    if cached.exists() and cached.stat().st_size > 500:
        shutil.copy(cached, out_mp3)
        return
    last_err: Exception | None = None
    for attempt in range(1, 6):
        try:
            run(
                [
                    str(EDGE_TTS),
                    "--voice",
                    VOICE,
                    "--rate=-5%",
                    "--text",
                    text,
                    "--write-media",
                    str(out_mp3),
                ]
            )
            if out_mp3.exists() and out_mp3.stat().st_size > 500:
                shutil.copy(out_mp3, cached)
                return
        except Exception as exc:  # noqa: BLE001 — retry transient DNS/network
            last_err = exc
            time.sleep(2 * attempt)
    raise RuntimeError(f"TTS failed for: {text!r}") from last_err


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


def build_lesson(lesson: dict) -> Path:
    BUILD.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="bcs_lesson_", dir=str(BUILD)))
    print("BUILD", lesson["file"])

    narr, timed = build_narration(work, lesson["lines"])
    audio_dur = ffprobe_duration(narr)
    visual = compose_visual(work, lesson, audio_dur)

    ass_path = work / "captions.ass"
    write_ass(ass_path, timed)
    ass_esc = str(ass_path).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},setsar=1,"
        f"drawbox=x=0:y=0:w=iw:h=64:color=0x0B2F5C@0.88:t=fill,"
        f"drawbox=x=0:y=ih-160:w=iw:h=160:color=black@0.55:t=fill,"
        f"subtitles={ass_esc}"
    )

    out = OUT / lesson["file"]
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(visual),
            "-i",
            str(narr),
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
    print("  ->", out, f"({ffprobe_duration(out):.1f}s, {out.stat().st_size // 1024} KB)")
    return out


def main() -> None:
    built = []
    for lesson in LESSONS:
        path = build_lesson(lesson)
        built.append(
            {
                "file": lesson["file"],
                "title": lesson["title"],
                "bytes": path.stat().st_size,
                "seconds": round(ffprobe_duration(path), 1),
                "has_audio": True,
            }
        )
    (OUT / "manifest.json").write_text(json.dumps(built, indent=2) + "\n")
    readme = OUT / "README.md"
    readme.write_text(
        """# Basic Computer Skills videos

Royalty-free teaching clips for Purpose Academy Unit 6 / journey step 12.

- Hardware lessons use Pexels / Mixkit close-up action footage.
- Software lessons use recorded practice-desktop demos (folder, email, save, safety).
- Each MP4 includes natural English narration (Edge neural TTS) and burned-in Level-4 captions.

Rebuild:

```bash
node scripts/bcs-demos/record-bcs-demos.mjs
python3 scripts/build-basic-computer-skills-videos.py
```
""",
        encoding="utf-8",
    )
    print("Wrote", len(built), "videos to", OUT)


if __name__ == "__main__":
    main()
