#!/usr/bin/env python3
"""
Site-wide training image framing fix.

Worksheet extractors letterboxed royalty-free photos onto oversized white
canvases (960×1170 / 720×720), so object drills showed tiny subjects.
This script:

1. Autocrops near-white letterboxing (keeps a modest margin)
2. Upscales soft/tiny results so the long edge is at least TARGET_LONG
3. Pads ultra-wide tool photos onto calm square mats
4. Rewrites the extract helpers so future pulls stay tight

Run from repo root:  python3 scripts/fix-training-image-framing.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]

# Long-edge target after crop (readable on VocabSheet / Eye Spy / Organize)
TARGET_LONG = 960
MIN_MARGIN_RATIO = 0.05  # keep ~5% breathing room around the subject
WHITE_THRESH = 248
JPEG_QUALITY = 90

FOLDERS = [
    ROOT / "public/media/construction-vv",
    ROOT / "public/media/logistics-vv",
    ROOT / "public/media/daily-conversation-vv",
    ROOT / "src/assets/photos/logistics",
]

CLOZE_DIR = ROOT / "public/sentence-cloze"
CLOZE_MIN_LONG = 720

WIDE_TOOLS = [
    ROOT / "src/assets/photos/tools/saw-photo.jpg",
    ROOT / "src/assets/photos/tools/tape-photo.jpg",
]


def content_bbox(im: Image.Image, thresh: int = WHITE_THRESH) -> tuple[int, int, int, int] | None:
    arr = np.asarray(im.convert("RGB"))
    # Near-white = all channels high
    mask = ~((arr[:, :, 0] >= thresh) & (arr[:, :, 1] >= thresh) & (arr[:, :, 2] >= thresh))
    if not mask.any():
        return None
    ys, xs = np.where(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def expand_bbox(
    bb: tuple[int, int, int, int],
    size: tuple[int, int],
    margin_ratio: float = MIN_MARGIN_RATIO,
) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = bb
    w, h = size
    cw, ch = x1 - x0, y1 - y0
    pad = max(8, int(max(cw, ch) * margin_ratio))
    return max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)


def upscale_long_edge(im: Image.Image, target: int = TARGET_LONG) -> Image.Image:
    w, h = im.size
    long = max(w, h)
    if long >= target:
        return im
    scale = target / long
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def fill_ratio(im: Image.Image, bb: tuple[int, int, int, int] | None) -> float:
    if not bb:
        return 1.0
    w, h = im.size
    return ((bb[2] - bb[0]) * (bb[3] - bb[1])) / float(w * h)


def process_letterboxed(path: Path, dry: bool = False) -> str:
    with Image.open(path) as src:
        im = ImageOps.exif_transpose(src).convert("RGB")
        bb = content_bbox(im)
        ratio = fill_ratio(im, bb)
        # Skip if already filling most of the canvas
        if bb is None or ratio >= 0.88:
            return "skip-full"

        x0, y0, x1, y1 = expand_bbox(bb, im.size)
        cropped = im.crop((x0, y0, x1, y1))
        out = upscale_long_edge(cropped, TARGET_LONG)

        if dry:
            return f"would-crop fill={ratio:.1%} → {out.size[0]}x{out.size[1]}"

        suffix = path.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            out.save(path, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        elif suffix == ".png":
            out.save(path, format="PNG", optimize=True)
        elif suffix == ".webp":
            out.save(path, format="WEBP", quality=JPEG_QUALITY, method=4)
        else:
            out.save(path)
        return f"cropped fill={ratio:.1%} → {out.size[0]}x{out.size[1]}"


def process_cloze(path: Path, dry: bool = False) -> str:
    with Image.open(path) as src:
        im = ImageOps.exif_transpose(src)
        # Preserve alpha for PNG illustrations
        mode = "RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB"
        im = im.convert(mode)
        w, h = im.size
        long = max(w, h)
        if long >= CLOZE_MIN_LONG:
            return "skip-ok"
        out = upscale_long_edge(im.convert("RGB") if mode == "RGB" else im.convert("RGBA"), CLOZE_MIN_LONG)
        if dry:
            return f"would-upscale {w}x{h} → {out.size[0]}x{out.size[1]}"
        if path.suffix.lower() == ".png":
            out.save(path, format="PNG", optimize=True)
        else:
            out.convert("RGB").save(path, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        return f"upscaled {w}x{h} → {out.size[0]}x{out.size[1]}"


def pad_wide_tool(path: Path, dry: bool = False) -> str:
    """Ultra-wide tool photos → square mat so contain boxes stay readable."""
    with Image.open(path) as src:
        im = ImageOps.exif_transpose(src).convert("RGB")
        w, h = im.size
        ar = w / h if h else 1
        if ar < 2.0:
            return "skip-ar-ok"
        side = max(w, int(h * 1.35), 960)
        canvas = Image.new("RGB", (side, side), (244, 247, 251))
        # Scale tool to ~88% of width with vertical breathing room
        target_w = int(side * 0.9)
        scale = target_w / w
        nw, nh = target_w, max(1, int(round(h * scale)))
        scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(scaled, ((side - nw) // 2, (side - nh) // 2))
        if dry:
            return f"would-pad {w}x{h} → {side}x{side}"
        canvas.save(path, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        return f"padded {w}x{h} → {side}x{side}"


def main() -> int:
    dry = "--dry" in sys.argv
    stats = {"cropped": 0, "upscaled": 0, "padded": 0, "skipped": 0}

    print("== Letterboxed VV / pathway photos ==")
    for folder in FOLDERS:
        if not folder.exists():
            print(f"  missing {folder}")
            continue
        files = sorted(
            p
            for p in folder.iterdir()
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} and p.is_file()
        )
        print(f"  {folder.relative_to(ROOT)} ({len(files)} files)")
        for path in files:
            msg = process_letterboxed(path, dry=dry)
            if msg.startswith("crop") or msg.startswith("would-crop"):
                stats["cropped"] += 1
            else:
                stats["skipped"] += 1
            if stats["cropped"] <= 3 or stats["cropped"] % 100 == 0:
                if msg.startswith("crop") or msg.startswith("would-crop"):
                    print(f"    {path.name}: {msg}")

    print("== Sentence cloze upscale ==")
    if CLOZE_DIR.exists():
        files = sorted(
            p
            for p in CLOZE_DIR.iterdir()
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} and p.is_file()
        )
        for path in files:
            msg = process_cloze(path, dry=dry)
            if msg.startswith("upscale") or msg.startswith("would-upscale"):
                stats["upscaled"] += 1
                if stats["upscaled"] <= 3:
                    print(f"    {path.name}: {msg}")
            else:
                stats["skipped"] += 1

    print("== Wide tool mats ==")
    for path in WIDE_TOOLS:
        if not path.exists():
            continue
        msg = pad_wide_tool(path, dry=dry)
        print(f"    {path.name}: {msg}")
        if msg.startswith("pad") or msg.startswith("would-pad"):
            stats["padded"] += 1
        else:
            stats["skipped"] += 1

    print(
        f"\nDone{' (dry)' if dry else ''}: "
        f"cropped={stats['cropped']} upscaled={stats['upscaled']} "
        f"padded={stats['padded']} skipped={stats['skipped']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
