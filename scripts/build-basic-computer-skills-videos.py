#!/usr/bin/env python3
"""
Build Basic Computer Skills videos — narration and on-screen action are beat-locked.

Every lesson lives in scripts/bcs-render/lessons.json (simple Level-4 lines).
Pipeline per lesson:
  1. Piper (open neural TTS, en_US-lessac-medium) speaks each line → real durations.
  2. Timing table [start, duration, text] — lines never overlap, short pauses between.
  3. scripts/bcs-render/scene.html renders the practice desktop frame by frame:
     each click / key / highlight is pinned to the word in the line that names it.
  4. ffmpeg muxes frames + narration → public/media/basic-computer-skills/<file>.
  5. Writes manifest.json and src/pathways/packs/basicComputerSkillsTiming.ts
     (replay windows for practice questions).

  python3 scripts/build-basic-computer-skills-videos.py            # all lessons
  python3 scripts/build-basic-computer-skills-videos.py power save # some lessons

Needs: pip install --user piper-tts · ffmpeg · npx playwright install chromium.
License: Piper voices (rhasspy/piper-voices, MIT); teaching copy © Purpose Academy.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ROOT / "scripts/bcs-render/lessons.json"
RENDER = ROOT / "scripts/bcs-render/render.mjs"
OUT = ROOT / "public/media/basic-computer-skills"
TIMING_TS = ROOT / "src/pathways/packs/basicComputerSkillsTiming.ts"
VOICE_DIR = ROOT / "tools" / "piper-voices"
VOICE_MODEL = VOICE_DIR / "en_US-lessac-medium.onnx"
VOICE_CONFIG = VOICE_DIR / "en_US-lessac-medium.onnx.json"
VOICE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx"
PIPER_BIN = Path.home() / ".local" / "bin" / "piper"
LENGTH_SCALE = "1.12"  # a little slower than default — first-computer learners
TTS_CACHE = Path.home() / ".cache" / "bcs-tts-piper-lessac"
LEAD_IN = 0.9
GAP = 1.0
TAIL = 1.8
FPS = 12


def ensure_voice() -> Path:
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    if not VOICE_MODEL.exists() or VOICE_MODEL.stat().st_size < 1_000_000:
        urllib.request.urlretrieve(VOICE_URL, VOICE_MODEL)
    if not VOICE_CONFIG.exists():
        urllib.request.urlretrieve(VOICE_URL + ".json", VOICE_CONFIG)
    piper = PIPER_BIN if PIPER_BIN.exists() else Path(shutil.which("piper") or "")
    if not piper or not piper.exists():
        raise FileNotFoundError("piper CLI not found. Install with: pip install --user piper-tts")
    return piper


def synth(text: str) -> Path:
    TTS_CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(f"lessac|{LENGTH_SCALE}|{text}".encode()).hexdigest()
    wav = TTS_CACHE / f"{key}.wav"
    if not wav.exists() or wav.stat().st_size < 500:
        subprocess.run(
            [str(ensure_voice()), "--model", str(VOICE_MODEL), "--length-scale", LENGTH_SCALE, "--output_file", str(wav)],
            input=text + "\n", text=True, check=True, capture_output=True,
        )
    return wav


def build(lesson: dict, tmp: Path) -> dict:
    clips = [synth(line) for line in lesson["lines"]]
    rate, width, frames = None, None, []
    for c in clips:
        with wave.open(str(c)) as w:
            rate, width = w.getframerate(), w.getsampwidth()
            frames.append(w.readframes(w.getnframes()))
    timing, t = [], LEAD_IN
    for line, data in zip(lesson["lines"], frames):
        dur = len(data) / (rate * width)
        timing.append([round(t, 3), round(dur, 3), line])
        t += dur + GAP
    total = round(t - GAP + TAIL, 2)
    buf = bytearray(int(total * rate) * width)
    for (start, _, _), data in zip(timing, frames):
        off = int(start * rate) * width
        buf[off : off + len(data)] = data
    audio = tmp / "audio.wav"
    with wave.open(str(audio), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(width)
        w.setframerate(rate)
        w.writeframes(bytes(buf))

    (tmp / "lesson.json").write_text(json.dumps(lesson))
    (tmp / "timing.json").write_text(json.dumps(timing))
    frames_dir = tmp / "frames"
    subprocess.run(
        ["node", str(RENDER), str(tmp / "lesson.json"), str(tmp / "timing.json"), str(frames_dir), str(total), str(FPS)],
        check=True,
    )
    out = OUT / lesson["file"]
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(frames_dir / "f_%05d.jpg"),
            "-i", str(audio), "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p",
            "-r", "24", "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", str(out),
        ],
        check=True,
    )
    print(f"✓ {lesson['file']}  {total:.1f}s  {len(timing)} lines")
    return {"file": lesson["file"], "seconds": total, "beats": timing}


def write_outputs(results: dict[str, dict]) -> None:
    manifest_path = OUT / "manifest.json"
    manifest = {"voice": "Piper en_US-lessac-medium", "fps": FPS, "lessons": {}}
    if manifest_path.exists():
        old = json.loads(manifest_path.read_text())
        if isinstance(old, dict) and isinstance(old.get("lessons"), dict):
            manifest["lessons"].update(old["lessons"])
    for lid, r in results.items():
        manifest["lessons"][lid] = {"file": r["file"], "seconds": r["seconds"], "hasAudio": True}
    manifest_path.write_text(json.dumps(manifest, indent=1) + "\n")

    timing = {}
    if TIMING_TS.exists():
        src = TIMING_TS.read_text()
        start = src.find("}> = ") + 5
        try:
            timing = json.loads(src[start : src.rindex("}") + 1])
        except Exception:  # noqa: BLE001
            timing = {}
    for lid, r in results.items():
        timing[lid] = {
            "seconds": r["seconds"],
            "beats": [{"start": s, "end": round(s + d, 3), "text": text} for s, d, text in r["beats"]],
        }
    TIMING_TS.write_text(
        "/** Generated by scripts/build-basic-computer-skills-videos.py — do not edit by hand. */\n"
        "export type ComputerBeat = { start: number; end: number; text: string }\n"
        "export const BASIC_COMPUTER_TIMING: Record<string, { seconds: number; beats: ComputerBeat[] }> = "
        + json.dumps(dict(sorted(timing.items())), indent=1)
        + "\n"
    )


def main() -> None:
    lessons = json.loads(LESSONS.read_text())
    want = set(sys.argv[1:])
    results = {}
    for lesson in lessons:
        if want and lesson["slug"] not in want and lesson["id"] not in want:
            continue
        with tempfile.TemporaryDirectory(prefix="bcs-") as d:
            results[lesson["id"]] = build(lesson, Path(d))
    write_outputs(results)


if __name__ == "__main__":
    main()
