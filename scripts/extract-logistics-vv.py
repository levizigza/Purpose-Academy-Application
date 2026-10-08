#!/usr/bin/env python3
"""Extract all 500 Logistics Visual Vocabulary cards into JSON + public images."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import pymupdf
from PIL import Image

PDF = Path("/home/ubuntu/.cursor/projects/workspace/uploads/Logistics_Visual_Vocabulary__2__24b1.pdf")
OUT_JSON = Path("/tmp/log-vv-extract/vocab500.json")
CURATED_PATH = Path("/tmp/log-vv-extract/curated20.json")
OUT_IMG = Path("public/media/logistics-vv")
TMP = Path("/tmp/log-vv-extract")
OUT_IMG.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

CARD_W, CARD_H, ORIGIN_Y = 237.0, 178.5, 75.0
COLS, ROWS = 5, 4
LANG_ORDER = ["Amharic", "Tigrinya", "Arabic", "Spanish", "Hindi"]
SCALE = 2.5

REMASTER = {
    1: "log-box", 2: "log-bag", 3: "log-bin", 4: "log-shelf", 5: "log-rack",
    6: "log-pallet", 7: "log-cart", 8: "log-dolly", 9: "log-truck", 10: "log-van",
    11: "log-trailer", 12: "log-door", 13: "log-gate", 14: "log-floor", 15: "log-wall",
    16: "log-aisle", 17: "log-ramp", 18: "log-dock", 19: "log-office", 20: "log-warehouse",
}


def clean_spaces(t: str) -> str:
    t = t.replace("\u00a0", " ")
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s*/\s*", " / ", t)
    t = re.sub(r"\s+", " ", t).strip(" /")
    t = re.sub(r"([\u093e-\u094c\u0902\u0903\u093c])\1+", r"\1", t)
    return t


def all_spans(page):
    out = []
    d = page.get_text("dict")
    for b in d["blocks"]:
        if b.get("type") != 0:
            continue
        for line in b["lines"]:
            for s in line["spans"]:
                if not s["text"].strip():
                    continue
                x0, y0, x1, y1 = s["bbox"]
                out.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "size": s["size"], "text": s["text"]})
    return out


def in_rect(spans, rect):
    return [
        s for s in spans
        if rect.x0 <= (s["x0"] + s["x1"]) / 2 <= rect.x1
        and rect.y0 <= (s["y0"] + s["y1"]) / 2 <= rect.y1
    ]


def extract_langs_text(card_spans):
    labs = {}
    for s in card_spans:
        t = s["text"].strip()
        for name in LANG_ORDER:
            if t == f"{name}:" or t == name:
                labs[name] = s
    ordered = [(n, labs[n]) for n in LANG_ORDER if n in labs]
    values = {}
    for i, (name, lab) in enumerate(ordered):
        y_min = lab["y0"] - 3
        y_max = ordered[i + 1][1]["y0"] - 2 if i + 1 < len(ordered) else lab["y0"] + 24
        vals = [
            s for s in card_spans
            if s is not lab
            and y_min <= (s["y0"] + s["y1"]) / 2 <= y_max
            and s["x0"] >= lab["x1"] - 4
            and s["text"].strip() not in LANG_ORDER
            and not s["text"].strip().endswith(":")
        ]
        lines = {}
        for v in vals:
            key = round(v["y0"] / 2.5)
            lines.setdefault(key, []).append(v)
        parts = []
        for key in sorted(lines):
            line = "".join(v["text"] for v in sorted(lines[key], key=lambda z: z["x0"]))
            parts.append(line.strip())
        text = " ".join(p for p in parts if p)
        text = re.sub(r"/\s*", "/ ", text)
        values[name] = clean_spaces(text)
    return values


def extract_english(card_spans, card_y0):
    band = [
        s for s in card_spans
        if card_y0 <= s["y0"] <= card_y0 + 28
        and s["size"] >= 11
        and re.search(r"[A-Za-z]", s["text"])
    ]
    band = [s for s in band if not re.search(r"Purpose|Logistics|WORDS|Page|French", s["text"])]
    band = [s for s in band if not re.fullmatch(r"\d+", s["text"].strip())]
    if not band:
        return ""
    max_size = max(s["size"] for s in band)
    band = [s for s in band if s["size"] >= max_size - 1]
    return clean_spaces(" ".join(s["text"].strip() for s in sorted(band, key=lambda z: z["x0"])))


def extract_sentence(card_spans, card_y0):
    band = [
        s for s in card_spans
        if s["y0"] >= card_y0 + CARD_H - 38 and re.search(r"[A-Za-z]", s["text"])
    ]
    band = [s for s in band if not any(k in s["text"] for k in LANG_ORDER)]
    return clean_spaces(" ".join(s["text"].strip() for s in sorted(band, key=lambda z: (z["y0"], z["x0"]))))


def ocr_arabic(page_img, lab_bbox, card_x1):
    lx0, ly0, lx1, ly1 = lab_bbox
    rx0, ry0, rx1, ry1 = lx1 + 1, ly0 - 3, card_x1 - 3, ly0 + 18
    crop = page_img.crop((int(rx0 * SCALE), int(ry0 * SCALE), int(rx1 * SCALE), int(ry1 * SCALE)))
    if crop.width < 4 or crop.height < 4:
        return ""
    crop = crop.resize((max(1, crop.width * 2), max(1, crop.height * 2)), Image.Resampling.LANCZOS)
    path = str(TMP / "_ara.png")
    crop.save(path)
    best = ""
    for psm in (7, 8, 6):
        try:
            out = subprocess.check_output(
                ["tesseract", path, "stdout", "-l", "ara", "--psm", str(psm)],
                stderr=subprocess.DEVNULL,
                text=True,
            ).strip()
        except Exception:
            out = ""
        out = clean_spaces(out)
        out = re.sub(r"^[\d|.\s]+", "", out)
        out = re.sub(r"[\d|.\s]+$", "", out)
        out = clean_spaces(out)
        if re.search(r"[\u0600-\u06FF]", out) and len(out) > len(best):
            best = out
            if psm == 7 and len(out) >= 2:
                return out
    return best


def slugify(english: str, n: int) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", english.lower()).strip("-")
    return (s or f"word-{n}")[:48]


def make_definition(english: str, sentence: str) -> str:
    sent = sentence.rstrip(".")
    return f"Logistics workplace word: {english}. Used as in: \"{sent}.\""


def studio_pad(im: Image.Image, tw=960, th=1170, margin=0.06) -> Image.Image:
    im = im.convert("RGB")
    canvas = Image.new("RGB", (tw, th), (255, 255, 255))
    max_w = int(tw * (1 - 2 * margin))
    max_h = int(th * (1 - 2 * margin))
    img = im.copy()
    img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    canvas.paste(img, ((tw - img.width) // 2, (th - img.height) // 2))
    return canvas


def main():
    curated_raw = json.loads(CURATED_PATH.read_text(encoding="utf-8"))
    curated = {int(k): v for k, v in curated_raw.items()}

    doc = pymupdf.open(PDF)
    entries = []
    used_ids = set()

    for pi in range(doc.page_count):
        page = doc[pi]
        spans = all_spans(page)
        mat = pymupdf.Matrix(SCALE, SCALE)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        page_img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        infos = sorted(
            page.get_image_info(xrefs=True),
            key=lambda im: (round(im["bbox"][1], 1), round(im["bbox"][0], 1)),
        )
        for r in range(ROWS):
            for c in range(COLS):
                n = pi * 20 + r * COLS + c + 1
                x0 = c * CARD_W
                y0 = ORIGIN_Y + r * CARD_H
                rect = pymupdf.Rect(x0 + 1, y0, x0 + CARD_W - 1, y0 + CARD_H - 1)
                cs = in_rect(spans, rect)
                eng = extract_english(cs, y0)
                langs = extract_langs_text(cs)
                sent = extract_sentence(cs, y0)

                if n in curated:
                    for key in ("Spanish", "Arabic", "Hindi", "Amharic", "Tigrinya"):
                        langs[key] = curated[n][key]
                else:
                    labs = [s for s in cs if s["text"].strip().startswith("Arabic")]
                    if labs:
                        lab = labs[0]
                        ara = ocr_arabic(
                            page_img,
                            (lab["x0"], lab["y0"], lab["x1"], lab["y1"]),
                            x0 + CARD_W,
                        )
                        if ara:
                            langs["Arabic"] = ara

                card_imgs = [
                    im for im in infos
                    if x0 < (im["bbox"][0] + im["bbox"][2]) / 2 < x0 + CARD_W
                    and y0 < (im["bbox"][1] + im["bbox"][3]) / 2 < y0 + CARD_H
                ]
                img_path = None
                if card_imgs:
                    iminfo = card_imgs[0]
                    try:
                        pixi = pymupdf.Pixmap(doc, iminfo["xref"])
                        if pixi.n >= 5:
                            pixi = pymupdf.Pixmap(pymupdf.csRGB, pixi)
                        raw = Image.frombytes("RGB", (pixi.width, pixi.height), pixi.samples)
                    except Exception:
                        b = iminfo["bbox"]
                        raw = page_img.crop(
                            (int(b[0] * SCALE), int(b[1] * SCALE), int(b[2] * SCALE), int(b[3] * SCALE))
                        )
                    studio = studio_pad(raw)
                    fname = f"{n:03d}-{slugify(eng or f'word-{n}', n)}.jpg"
                    studio.save(OUT_IMG / fname, quality=88, optimize=True)
                    img_path = fname

                base_id = slugify(eng or f"word-{n}", n)
                tid = base_id
                k = 2
                while tid in used_ids:
                    tid = f"{base_id}-{k}"
                    k += 1
                used_ids.add(tid)

                entries.append({
                    "n": n,
                    "id": tid,
                    "english": eng,
                    "sentence": sent,
                    "gloss": {
                        "Spanish": langs.get("Spanish", ""),
                        "Arabic": langs.get("Arabic", ""),
                        "Hindi": langs.get("Hindi", ""),
                        "Amharic": langs.get("Amharic", ""),
                        "Tigrinya": langs.get("Tigrinya", ""),
                    },
                    "imageKey": REMASTER.get(n) or f"log-vv-{n:03d}",
                    "imageFile": img_path,
                    "definition": make_definition(eng, sent),
                })
                if n % 20 == 0:
                    print(f"page {pi + 1}: through word {n} ({eng})", flush=True)

    OUT_JSON.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
    print("DONE", len(entries), "->", OUT_JSON)
    missing_ara = [e for e in entries if not re.search(r"[\u0600-\u06FF]", e["gloss"]["Arabic"])]
    missing_en = [e for e in entries if not e["english"]]
    missing_sent = [e for e in entries if not e["sentence"]]
    print("missing arabic", len(missing_ara), "english", len(missing_en), "sentence", len(missing_sent))
    if missing_ara[:15]:
        print("ara missing:", [(e["n"], e["english"], e["gloss"]["Arabic"]) for e in missing_ara[:15]])
    for idx in (20, 99, 499):
        print(f"sample {idx+1}", json.dumps(entries[idx], ensure_ascii=False))


if __name__ == "__main__":
    main()
