#!/usr/bin/env python3
"""Extract Construction Visual Vocabulary (30 PNG pages → JSON + public tiles).

Fast path: crop studio tiles, then OCR each gloss line with a single language pack.
"""
from __future__ import annotations

import json
import re
import concurrent.futures
from pathlib import Path

import pytesseract
from PIL import Image, ImageEnhance, ImageOps

STORE = Path("/cursor/stores/self/construction-vv")
INDEX = STORE / "words-001-660-full-index.json"
OUT_JSON = Path("/tmp/con-vv-extract/vocab660.json")
OUT_IMG = Path("public/media/construction-vv")
TMP = Path("/tmp/con-vv-extract")
OUT_IMG.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

LANG_ORDER = ["Amharic", "Tigrinya", "Arabic", "Spanish", "Hindi"]
# Single-lang OCR is much faster/accurate than eng+amh+ara+hin+spa
LANG_OCR = {
    "Amharic": "amh",
    "Tigrinya": "amh",  # Ge'ez script; no dedicated Tigrinya pack
    "Arabic": "ara",
    "Spanish": "spa",
    "Hindi": "hin",
}
TILE_W, TILE_H = 960, 1170
MX, MY0, MY1 = 36, 155, 20


def page_specs():
    specs = []
    for p in range(1, 31):
        path = next(STORE.glob(f"page-{p:02d}-words-*.png"))
        m = re.search(r"words-(\d+)-(\d+)", path.name)
        a, b = int(m.group(1)), int(m.group(2))
        count = b - a + 1
        im = Image.open(path)
        w, h = im.size
        rows, cols = (4, 5) if count == 20 else (5, 5)
        if count not in (20, 25):
            raise SystemExit(f"Unexpected card count {count} on {path.name}")
        specs.append((path, a, rows, cols, w, h))
    return specs


def slugify(english: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", english.lower()).strip("-")
    return (s[:48] or "term")


def clean_spaces(t: str) -> str:
    t = t.replace("\u00a0", " ").replace("\u200f", "").replace("\u200e", "")
    t = t.replace("‏", "").replace("‎", "")
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s*/\s*", " / ", t)
    # Drop leftover Latin label fragments
    t = re.sub(r"^(Amharic|Tigrinya|Arabic|Spanish|Hindi)\s*[:：]\s*", "", t, flags=re.I)
    return t.strip(" /:·-")


def studio_pad(photo: Image.Image) -> Image.Image:
    photo = photo.convert("RGB")
    gray = ImageOps.invert(ImageOps.grayscale(photo))
    bbox = gray.getbbox()
    if bbox:
        pad = 8
        photo = photo.crop(
            (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(photo.width, bbox[2] + pad),
                min(photo.height, bbox[3] + pad),
            )
        )
    canvas = Image.new("RGB", (TILE_W, TILE_H), (255, 255, 255))
    max_w, max_h = int(TILE_W * 0.86), int(TILE_H * 0.82)
    scale = min(max_w / max(1, photo.width), max_h / max(1, photo.height))
    nw, nh = max(1, int(photo.width * scale)), max(1, int(photo.height * scale))
    photo = photo.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(photo, ((TILE_W - nw) // 2, (TILE_H - nh) // 2))
    return canvas


def card_rects(page_w: int, page_h: int, rows: int, cols: int):
    cw = (page_w - 2 * MX) / cols
    ch = (page_h - MY0 - MY1) / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            x0 = MX + c * cw
            y0 = MY0 + r * ch
            out.append((x0, y0, x0 + cw, y0 + ch))
    return out


def ocr_value(img: Image.Image, lang: str) -> str:
    img = img.convert("RGB")
    img = img.resize((max(1, int(img.width * 1.8)), max(1, int(img.height * 1.8))), Image.Resampling.LANCZOS)
    img = ImageEnhance.Contrast(img).enhance(1.7)
    text = pytesseract.image_to_string(img, lang=lang, config="--psm 7")
    return clean_spaces(text)


def find_label_ys(lang_panel: Image.Image) -> dict[str, int]:
    """Locate language label baselines via quick English OCR with boxes."""
    big = lang_panel.resize((lang_panel.width * 2, lang_panel.height * 2), Image.Resampling.LANCZOS)
    data = pytesseract.image_to_data(big, lang="eng", config="--psm 6", output_type=pytesseract.Output.DICT)
    found: dict[str, int] = {}
    n = len(data["text"])
    for i in range(n):
        raw = (data["text"][i] or "").strip().rstrip(":")
        if not raw:
            continue
        key = raw.title()
        if key in LANG_ORDER and key not in found and int(data["conf"][i]) > 40:
            # y in original panel coords
            found[key] = int(data["top"][i] / 2)
    # Fallback evenly spaced bands if OCR missed labels
    if len(found) < 3:
        h = lang_panel.height
        for i, name in enumerate(LANG_ORDER):
            found.setdefault(name, int(8 + i * (h - 16) / 5))
    return found


def extract_glosses(lang_panel: Image.Image) -> dict[str, str]:
    ys = find_label_ys(lang_panel)
    ordered = sorted(((ys[n], n) for n in LANG_ORDER if n in ys), key=lambda z: z[0])
    gloss = {n: "" for n in LANG_ORDER}
    # Approximate value column starts after labels (~38% of panel width)
    vx0 = int(lang_panel.width * 0.34)
    for i, (y, name) in enumerate(ordered):
        y0 = max(0, y - 2)
        y1 = ordered[i + 1][0] - 2 if i + 1 < len(ordered) else min(lang_panel.height, y + int(lang_panel.height / 5))
        if y1 <= y0 + 4:
            y1 = y0 + max(18, int(lang_panel.height / 6))
        band = lang_panel.crop((vx0, y0, lang_panel.width - 2, y1))
        gloss[name] = ocr_value(band, LANG_OCR[name])
    return gloss


def process_card(job):
    page_path, rect, n, english, sentence = job
    im = Image.open(page_path).convert("RGB")
    x0, y0, x1, y1 = rect
    card = im.crop((int(x0), int(y0), int(x1), int(y1)))
    cw, ch = card.size

    photo = card.crop((10, 38, int(cw * 0.44), int(ch * 0.78)))
    key = f"con-vv-{n:03d}"
    studio_pad(photo).save(OUT_IMG / f"{key}.jpg", "JPEG", quality=90, optimize=True)

    lang_panel = card.crop((int(cw * 0.40), 36, cw - 8, int(ch * 0.78)))
    gloss = extract_glosses(lang_panel)

    return {
        "n": n,
        "id": f"{slugify(english)}-{n:03d}",
        "english": english,
        "emoji": "".join(w[0] for w in re.findall(r"[A-Za-z0-9]+", english)[:2]).upper()[:2] or "VV",
        "imageKey": key,
        "definition": f"A construction workplace word: {english}.",
        "sentence": sentence,
        "gloss": gloss,
    }


def main():
    full = json.loads(INDEX.read_text(encoding="utf-8"))
    by_n = {item["n"]: item for item in full["englishIndex"]}
    jobs = []
    for path, first, rows, cols, page_w, page_h in page_specs():
        rects = card_rects(page_w, page_h, rows, cols)
        for i, rect in enumerate(rects):
            n = first + i
            meta = by_n[n]
            jobs.append((str(path), rect, n, meta["english"], meta["sentence"]))

    print(f"Processing {len(jobs)} cards with process pool…", flush=True)
    results = []
    # Processes avoid GIL; cap workers so tesseract doesn't thrash
    with concurrent.futures.ProcessPoolExecutor(max_workers=4) as ex:
        for i, term in enumerate(ex.map(process_card, jobs, chunksize=2), 1):
            results.append(term)
            if i % 10 == 0 or i == len(jobs):
                miss = [k for k, v in term["gloss"].items() if not v]
                print(f"  {i}/{len(jobs)} n={term['n']} {term['english']!r} miss={miss}", flush=True)

    results.sort(key=lambda t: t["n"])
    OUT_JSON.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    empty = {lang: sum(1 for t in results if not t["gloss"].get(lang)) for lang in LANG_ORDER}
    print("Wrote", OUT_JSON)
    print("Images", len(list(OUT_IMG.glob("con-vv-*.jpg"))))
    print("Empty gloss counts:", empty)


if __name__ == "__main__":
    main()
