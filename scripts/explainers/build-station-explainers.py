#!/usr/bin/env python3
"""
Build short station how-it-works videos for Purpose Academy Practice.

Craft notes (editing):
- VO leads picture by a breath (~0.15–0.25s) — classic documentary cut
- Hold still on the instruction beat; slow Ken Burns only between ideas
- Hard cuts on sentence ends, not mid-word (Walter Murch: cut on emotion/breath)
- No flashy transitions — adult dignity, first-computer clarity
- Edge neural TTS (Jenny) — conversational, not robotic Piper

Voice: en-US-JennyNeural (Friendly / Considerate / Comfort), slight slow + lower pitch.
"""
from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "public" / "explainers"
OUT.mkdir(parents=True, exist_ok=True)
ART = Path("/opt/cursor/artifacts")
W, H, FPS = 1280, 720, 30
VOICE = "en-US-JennyNeural"
# Slightly slower + warmer — reads more human than default Piper
RATE = "-8%"
PITCH = "-2Hz"

# (id, title card color accent, shots, narration beats)
# Each beat: (image_key | None for title, text)
STATIONS: list[dict] = [
    {
        "id": "workplace-words",
        "title": "Workplace Words",
        "beats": [
            (None, "Workplace Words. One picture. One word. No rush."),
            ("grant_visual_vocab", "First, press the language you understand. Hear it."),
            ("grant_visual_vocab", "Then hear the English workplace word."),
            ("grant_visual_vocab", "Type what you heard. Soft try again if not yet. That is the whole loop."),
        ],
    },
    {
        "id": "language-organize",
        "title": "Language Organize",
        "beats": [
            (None, "Language Organize. Match pictures to their words."),
            ("grant_practice_hub", "Pick a picture. Place it on the empty box for that word."),
            ("grant_practice_hub", "Wrong place? Soft shake — try again. Clear the round, then the next."),
        ],
    },
    {
        "id": "eye-spy",
        "title": "English Eye Spy",
        "beats": [
            (None, "English Eye Spy. Clear the board."),
            ("grant_eye_spy", "Tap a picture on the job site. Then tap its English name."),
            ("grant_eye_spy", "A correct pair disappears. Soft try again if not yet. Clear every pair to continue."),
        ],
    },
    {
        "id": "sentence-structure",
        "title": "Sentence Structure",
        "beats": [
            (None, "Sentence Structure. Four words. Type the match."),
            ("grant_visual_vocab", "Read the sentence. Look at the four choices at the bottom."),
            ("grant_visual_vocab", "Type the word that fits the blank. Soft try again if not yet."),
        ],
    },
    {
        "id": "word-action",
        "title": "Word to Action",
        "beats": [
            (None, "Word to Action. Connect the tool to the job."),
            ("grant_toolbox", "See the action. Choose which tool it uses."),
            ("grant_toolbox", "One clear pick. Soft try again. Then continue."),
        ],
    },
    {
        "id": "supported-practice",
        "title": "Supported Practice",
        "beats": [
            (None, "Supported Practice. Match with help."),
            ("grant_practice_hub", "Match words to pictures. Help is there if you need it."),
            ("grant_practice_hub", "Mistakes teach. Soft try again. No exam theatre."),
        ],
    },
    {
        "id": "computer-skills",
        "title": "Basic Computer Skills",
        "beats": [
            (None, "Basic Computer Skills. Watch, then try."),
            ("grant_toolbox", "Watch a short captioned lesson."),
            ("grant_toolbox", "Then try a simple task — mouse, folders, save, Word, or email."),
            ("grant_toolbox", "One check at the end. First-computer friendly."),
        ],
    },
    {
        "id": "site-language",
        "title": "Site Language",
        "beats": [
            (None, "Site Language. Phrases you will hear on site."),
            ("grant_practice_hub", "Hear a job-site phrase. Choose what it means."),
            ("grant_practice_hub", "Soft try again. Then move on."),
        ],
    },
    {
        "id": "safety",
        "title": "Safety Training",
        "beats": [
            (None, "Safety Training. Words that keep crews safe."),
            ("grant_practice_hub", "Look at the picture. Choose the safety word."),
            ("grant_practice_hub", "Soft try again. Safety first — no rush."),
        ],
    },
    {
        "id": "tools",
        "title": "Tools and Equipment",
        "beats": [
            (None, "Tools and Equipment. Name it before you use it."),
            ("grant_toolbox", "Learn each tool group. Answer one check."),
            ("grant_toolbox", "Soft try again. Then continue."),
        ],
    },
    {
        "id": "systems",
        "title": "Workplace Systems",
        "beats": [
            (None, "Workplace Systems. How the whole job fits together."),
            ("grant_practice_hub", "Learn each system. Answer one check."),
            ("grant_practice_hub", "Soft try again. Your task feeds the whole site."),
        ],
    },
    {
        "id": "equipment-video",
        "title": "Equipment Videos",
        "beats": [
            (None, "Equipment Videos. Watch before you touch."),
            ("grant_toolbox", "Watch each equipment lesson. Know it. Inspect it."),
            ("grant_toolbox", "When the lesson is clear, continue to hands-on with an instructor."),
        ],
    },
]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def synth(text: str, out_mp3: Path) -> float:
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "edge-tts",
            f"--voice={VOICE}",
            f"--rate={RATE}",
            f"--pitch={PITCH}",
            f"--text={text}",
            f"--write-media={out_mp3}",
        ]
    )
    # duration via ffprobe
    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(out_mp3),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(json.loads(probe.stdout)["format"]["duration"])


def title_png(title: str, out: Path) -> None:
    # Use ffmpeg lavfi for a clean title card (navy + amber — night brand)
    # Escape for drawtext
    safe = title.replace(":", "\\:").replace("'", "\\'")
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"color=c=0x041526:s={W}x{H}:d=1",
            "-vf",
            (
                f"drawtext=text='PURPOSE ACADEMY':fontcolor=0xe8a317:fontsize=28:"
                f"x=(w-text_w)/2:y=h*0.28:font=Sans,"
                f"drawtext=text='{safe}':fontcolor=0xf5f8fc:fontsize=48:"
                f"x=(w-text_w)/2:y=h*0.42:font=Sans,"
                f"drawtext=text='How this station works':fontcolor=0xc9d8e8:fontsize=26:"
                f"x=(w-text_w)/2:y=h*0.58:font=Sans"
            ),
            "-frames:v",
            "1",
            str(out),
        ]
    )


def still_clip(img: Path, seconds: float, out: Path, zoom: bool) -> None:
    # Slow Ken Burns — Murch: move only when the idea moves
    if zoom:
        z_end = 1.08
        vf = (
            f"scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},"
            f"zoompan=z='min(zoom+0.0004,{z_end})':d={max(1, int(seconds * FPS))}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
            f"format=yuv420p"
        )
    else:
        vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},format=yuv420p"
    run(
        [
            "ffmpeg",
            "-y",
            "-loop",
            "1",
            "-i",
            str(img),
            "-i",
            str(out.with_suffix(".mp3")) if False else str(img),  # placeholder overwritten below
        ]
    )


def make_beat_clip(img: Path, audio: Path, seconds: float, out: Path, zoom: bool) -> None:
    # Pad audio with 0.2s lead-in silence so VO leads the cut
    pad = 0.18
    total = seconds + pad + 0.25
    frames = max(int(total * FPS), FPS)
    if zoom:
        vf = (
            f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"zoompan=z='min(1.0+on*0.00035,1.07)':d={frames}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},format=yuv420p"
        )
    else:
        vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=yuv420p"
    # adelay for breath before VO
    af = f"adelay={int(pad * 1000)}|{int(pad * 1000)},apad=pad_dur={total}"
    run(
        [
            "ffmpeg",
            "-y",
            "-loop",
            "1",
            "-i",
            str(img),
            "-i",
            str(audio),
            "-filter_complex",
            f"[0:v]{vf}[v];[1:a]{af}[a]",
            "-map",
            "[v]",
            "-map",
            "[a]",
            "-t",
            f"{total:.3f}",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            str(out),
        ]
    )


def resolve_image(key: str | None, title: str, work: Path, idx: int) -> Path:
    if key:
        for ext in (".png", ".jpg", ".webp"):
            p = ART / f"{key}{ext}"
            if p.exists():
                return p
    out = work / f"title-{idx}.png"
    title_png(title if idx == 0 or key is None else title, out)
    return out


def build_station(station: dict) -> Path:
    sid = station["id"]
    title = station["title"]
    work = Path(tempfile.mkdtemp(prefix=f"explainer-{sid}-"))
    clips: list[Path] = []
    for i, (img_key, text) in enumerate(station["beats"]):
        audio = work / f"beat-{i}.mp3"
        dur = synth(text, audio)
        img = resolve_image(img_key, title if i == 0 else title, work, i)
        if img_key is None:
            # regenerate title card with station title always
            img = work / f"title-{i}.png"
            title_png(title, img)
        clip = work / f"clip-{i}.mp4"
        make_beat_clip(img, audio, dur, clip, zoom=(img_key is not None))
        clips.append(clip)

    concat = work / "list.txt"
    concat.write_text("".join(f"file '{c}'\n" for c in clips))
    out = OUT / f"{sid}.mp4"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            str(out),
        ]
    )
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")
    return out


def main() -> None:
    for station in STATIONS:
        build_station(station)
    print("done", len(STATIONS), "explainers →", OUT)


if __name__ == "__main__":
    main()
