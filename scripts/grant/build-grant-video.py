#!/usr/bin/env python3
"""Build Purpose Academy grant TL;DR explainer video with Piper Lessac VO."""
from __future__ import annotations

import json
import shutil
import subprocess
import wave
from pathlib import Path

ROOT = Path("/tmp/grant-build")
SHOTS = ROOT / "shots"
WORK = ROOT / "video-work"
WORK.mkdir(parents=True, exist_ok=True)

PIPER = Path.home() / ".local" / "bin" / "piper"
VOICE = Path("/workspace/tools/piper-voices/en_US-lessac-medium.onnx")
VOICE_CFG = Path("/workspace/tools/piper-voices/en_US-lessac-medium.onnx.json")
PIPER_LENGTH_SCALE = "1.06"

W, H, FPS = 1440, 900, 30

# (image stem, narration text)
# Images must exist under SHOTS as {stem}.png
BEATS: list[tuple[str, str]] = [
    (
        "01-mode-chooser",
        "Purpose Academy is a Calgary trades school learning app — for newcomers and first-time trades learners who want workplace English with adult dignity.",
    ),
    (
        "02-splash",
        "Three pathways open the door: Construction, Logistics, and Community Support Foundations.",
    ),
    (
        "03b-toolbox-trays",
        "On desktop, you open the toolbox — Practice, Student, Instructor, or Admin — then step onto a calm night stage.",
    ),
    (
        "04-practice-hub",
        "Practice keeps one station in focus. Finite path. No rush. No exam theatre.",
    ),
    (
        "06-visual-vocab",
        "The vocabulary loop is simple. See the picture. Hear it in your home language. Hear the English workplace word. Then type it.",
    ),
    (
        "07-eye-spy",
        "Or clear an Eye Spy board — tap the picture, name it in English, until the board is empty.",
    ),
    (
        "09-dignity",
        "Soft learner chrome. Done for now when you need to stop. Built for adults who may fear school — never childish gamification.",
    ),
    (
        "05-passport",
        "Progress points toward employment readiness and a Skills Passport: learned, practised, competent. Practice alone is not a trade ticket or a job guarantee. Competent still needs a real instructor.",
    ),
    (
        "08-programs",
        "Purpose Academy. Built in Calgary — one station at a time.",
    ),
]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / float(w.getframerate())


def synth(text: str, out_wav: Path) -> float:
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run(
        [
            str(PIPER),
            "-m",
            str(VOICE),
            "-c",
            str(VOICE_CFG),
            "--length-scale",
            PIPER_LENGTH_SCALE,
            "--sentence-silence",
            "0.35",
            "-f",
            str(out_wav),
        ],
        input=text.encode("utf-8"),
        check=True,
        capture_output=True,
    )
    if proc.stderr:
        # piper prints progress to stderr
        pass
    return wav_duration(out_wav)


def make_still_clip(img: Path, seconds: float, out: Path, zoom: bool = True) -> None:
    """Ken Burns-ish slow zoom on a still."""
    # zoompan: start at 1.0, end ~1.06 over frames
    frames = max(int(seconds * FPS), 1)
    if zoom:
        zexpr = f"min(1.06,1+0.06*on/{frames})"
        vf = (
            f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
            f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,"
            f"zoompan=z='{zexpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS},"
            f"format=yuv420p"
        )
    else:
        vf = (
            f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
            f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,fps={FPS},format=yuv420p"
        )
    run(
        [
            "ffmpeg",
            "-y",
            "-loop",
            "1",
            "-i",
            str(img),
            "-vf",
            vf,
            "-t",
            f"{seconds:.3f}",
            "-an",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "veryfast",
            "-crf",
            "18",
            str(out),
        ]
    )


def main() -> None:
    missing = [stem for stem, _ in BEATS if not (SHOTS / f"{stem}.png").exists()]
    if missing:
        raise SystemExit(f"Missing shots: {missing}")

    timed: list[dict] = []
    clips: list[Path] = []
    wavs: list[Path] = []
    t = 0.0
    gap = 0.28

    for i, (stem, text) in enumerate(BEATS):
        wav = WORK / f"line_{i:02d}.wav"
        dur = synth(text, wav)
        # Hold still a touch longer than speech for breath
        hold = dur + gap + 0.15
        clip = WORK / f"clip_{i:02d}.mp4"
        make_still_clip(SHOTS / f"{stem}.png", hold, clip, zoom=(i % 2 == 0))
        clips.append(clip)
        wavs.append(wav)
        timed.append({"start": t, "end": t + dur, "hold": hold, "stem": stem, "text": text})
        t += hold

    # Concat video
    concat_v = WORK / "vlist.txt"
    concat_v.write_text("".join(f"file '{c}'\n" for c in clips), encoding="utf-8")
    silent = WORK / "video_silent.mp4"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_v),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "veryfast",
            "-crf",
            "18",
            str(silent),
        ]
    )

    # Build narration with gaps matching hold lengths
    # Strategy: place each wav at beat start with apad/adelay via filter_complex
    # Simpler: for each beat, pad wav to hold length then concat
    padded: list[Path] = []
    for i, (wav, beat) in enumerate(zip(wavs, timed)):
        pad = WORK / f"pad_{i:02d}.wav"
        hold = beat["hold"]
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(wav),
                "-af",
                f"apad=whole_dur={hold:.3f}",
                "-ar",
                "22050",
                "-ac",
                "1",
                str(pad),
            ]
        )
        padded.append(pad)

    alist = WORK / "alist.txt"
    alist.write_text("".join(f"file '{p}'\n" for p in padded), encoding="utf-8")
    narr = WORK / "narration.wav"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(alist),
            "-c",
            "copy",
            str(narr),
        ]
    )

    out_final = Path("/opt/cursor/artifacts/purpose-academy-grant-explainer.mp4")
    out_demo = Path("/opt/cursor/artifacts/recording_demo.mp4")
    # Soft ducking not needed — VO only
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(silent),
            "-i",
            str(narr),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(out_final),
        ]
    )
    shutil.copy(out_final, out_demo)

    # Also keep VO wav for review
    shutil.copy(narr, ROOT / "narration.wav")
    (WORK / "timed.json").write_text(json.dumps(timed, indent=2), encoding="utf-8")

    # Duration
    probe = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(out_final),
        ],
        text=True,
    ).strip()
    print(json.dumps({"out": str(out_final), "demo": str(out_demo), "duration_sec": float(probe), "beats": len(BEATS)}))


if __name__ == "__main__":
    main()
