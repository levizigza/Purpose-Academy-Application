#!/usr/bin/env python3
"""OCR gloss panels for Construction VV cards (one multi-lang pass per card)."""
from __future__ import annotations

import json
import re
import concurrent.futures
from pathlib import Path

import pytesseract
from PIL import Image, ImageEnhance

STORE = Path("/cursor/stores/self/construction-vv")
INDEX = STORE / "words-001-660-full-index.json"
OUT_JSON = Path("/tmp/con-vv-extract/vocab660.json")
OUT_JSON.parent.mkdir(parents=True, exist_ok=True)

LANG_ORDER = ["Amharic", "Tigrinya", "Arabic", "Spanish", "Hindi"]
MX, MY0, MY1 = 36, 155, 20


def clean_spaces(t: str) -> str:
    t = t.replace("\u00a0", " ").replace("\u200f", "").replace("\u200e", "")
    t = t.replace("‏", "").replace("‎", "")
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s*/\s*", " / ", t)
    return t.strip(" /")


def parse_glosses(text: str) -> dict[str, str]:
    values = {n: "" for n in LANG_ORDER}
    pattern = re.compile(r"(Amharic|Tigrinya|Arabic|Spanish|Hindi)\s*[:：]\s*", re.I)
    parts = pattern.split(text.replace("\r", "\n"))
    i = 1
    while i + 1 < len(parts):
        label = parts[i].strip().title()
        raw = parts[i + 1]
        lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
        buf = []
        for ln in lines:
            if re.match(r"^(Amharic|Tigrinya|Arabic|Spanish|Hindi)\b", ln, re.I):
                break
            buf.append(ln)
        if label in values:
            values[label] = clean_spaces(" ".join(buf) if buf else raw.split("\n")[0])
        i += 2
    return values


def page_jobs(start_n: int, end_n: int):
    full = json.loads(INDEX.read_text(encoding="utf-8"))
    by_n = {item["n"]: item for item in full["englishIndex"]}
    jobs = []
    for p in range(1, 31):
        path = next(STORE.glob(f"page-{p:02d}-words-*.png"))
        m = re.search(r"words-(\d+)-(\d+)", path.name)
        a, b = int(m.group(1)), int(m.group(2))
        count = b - a + 1
        rows, cols = (4, 5) if count == 20 else (5, 5)
        im_meta = Image.open(path)
        w, h = im_meta.size
        cw = (w - 2 * MX) / cols
        ch = (h - MY0 - MY1) / rows
        for r in range(rows):
            for c in range(cols):
                n = a + r * cols + c
                if n < start_n or n > end_n:
                    continue
                meta = by_n[n]
                x0 = MX + c * cw
                y0 = MY0 + r * ch
                jobs.append((str(path), x0, y0, x0 + cw, y0 + ch, n, meta["english"], meta["sentence"]))
    return jobs


def process(job):
    path, x0, y0, x1, y1, n, english, sentence = job
    im = Image.open(path).convert("RGB")
    card = im.crop((int(x0), int(y0), int(x1), int(y1)))
    cw, ch = card.size
    lang = card.crop((int(cw * 0.40), 36, cw - 8, int(ch * 0.78)))
    lang = lang.resize((lang.width * 2, lang.height * 2), Image.Resampling.LANCZOS)
    lang = ImageEnhance.Contrast(lang).enhance(1.55)
    raw = pytesseract.image_to_string(lang, lang="eng+amh+ara+hin+spa", config="--psm 6")
    gloss = parse_glosses(raw)
    return {
        "n": n,
        "id": re.sub(r"[^a-z0-9]+", "-", english.lower()).strip("-")[:48] + f"-{n:03d}",
        "english": english,
        "emoji": "".join(w[0] for w in re.findall(r"[A-Za-z0-9]+", english)[:2]).upper()[:2] or "VV",
        "imageKey": f"con-vv-{n:03d}",
        "definition": f"A construction workplace word: {english}.",
        "sentence": sentence,
        "gloss": gloss,
        "ocrRaw": raw,
    }


def main():
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--end", type=int, default=660)
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--out", type=Path, default=OUT_JSON)
    args = ap.parse_args()

    jobs = page_jobs(args.start, args.end)
    print(f"OCR {len(jobs)} cards n={args.start}-{args.end} workers={args.workers}", flush=True)
    results = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers) as ex:
        for i, term in enumerate(ex.map(process, jobs, chunksize=1), 1):
            results.append(term)
            miss = [k for k, v in term["gloss"].items() if not v]
            print(f"  {i}/{len(jobs)} n={term['n']} miss={miss}", flush=True)

    # Merge with existing out if partial
    existing = []
    if args.out.exists():
        try:
            existing = json.loads(args.out.read_text(encoding="utf-8"))
        except Exception:
            existing = []
    by_n = {t["n"]: t for t in existing}
    for t in results:
        by_n[t["n"]] = t
    merged = [by_n[k] for k in sorted(by_n)]
    args.out.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    empty = {lang: sum(1 for t in merged if not t["gloss"].get(lang)) for lang in LANG_ORDER}
    print("Wrote", args.out, "terms", len(merged), "empty", empty)


if __name__ == "__main__":
    main()
