#!/usr/bin/env python3
"""Merge page gloss JSON dumps into vocab660.json for TS generation."""
from __future__ import annotations

import json
import re
from pathlib import Path

STORE = Path("/cursor/stores/self/construction-vv")
OUT = Path("/tmp/con-vv-extract/vocab660.json")
PAGE_FILES = [
    "gloss-pages-01.json",
    "gloss-pages-02-05.json",
    "gloss-pages-06-10.json",
    "gloss-pages-11-15.json",
    "gloss-pages-16-20.json",
    "gloss-pages-21-25.json",
    "gloss-pages-26-30.json",
]


def slugify(e: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", e.lower()).strip("-")[:40]


def make_row(item: dict) -> dict:
    e = item["english"]
    g = item.get("gloss") or {}
    gloss = {
        "Amharic": (g.get("Amharic") or g.get("amharic") or "").strip(),
        "Tigrinya": (g.get("Tigrinya") or g.get("tigrinya") or "").strip(),
        "Arabic": (g.get("Arabic") or g.get("arabic") or "").strip(),
        "Spanish": (g.get("Spanish") or g.get("spanish") or "").strip(),
        "Hindi": (g.get("Hindi") or g.get("hindi") or "").strip(),
    }
    return {
        "n": item["n"],
        "id": f"{slugify(e)}-{item['n']:03d}",
        "english": e,
        "emoji": "".join(w[0] for w in re.findall(r"[A-Za-z0-9]+", e)[:2]).upper()[:2] or "VV",
        "imageKey": f"con-vv-{item['n']:03d}",
        "definition": f"A construction workplace word: {e}.",
        "sentence": item["sentence"],
        "gloss": gloss,
    }


def main() -> None:
    by_n: dict[int, dict] = {}
    for name in PAGE_FILES:
        path = STORE / name
        data = json.loads(path.read_text(encoding="utf-8"))
        print(f"{name}: {len(data)} ({data[0]['n']}–{data[-1]['n']})")
        for item in data:
            by_n[item["n"]] = make_row(item)

    index = {
        i["n"]: i
        for i in json.loads((STORE / "words-001-660-full-index.json").read_text(encoding="utf-8"))[
            "englishIndex"
        ]
    }
    missing = [n for n in range(1, 661) if n not in by_n]
    print("missing", len(missing))
    for n in missing:
        meta = index[n]
        by_n[n] = make_row(
            {"n": n, "english": meta["english"], "sentence": meta["sentence"], "gloss": {}}
        )

    merged = [by_n[n] for n in range(1, 661)]
    empty_lang = {k: 0 for k in ["Amharic", "Tigrinya", "Arabic", "Spanish", "Hindi"]}
    incomplete = 0
    for t in merged:
        miss = False
        for k in empty_lang:
            if not t["gloss"].get(k):
                empty_lang[k] += 1
                miss = True
        if miss:
            incomplete += 1
    print("incomplete", incomplete, empty_lang)
    for n in (1, 100, 201, 411, 660):
        t = by_n[n]
        print(n, t["english"], "|", t["gloss"]["Spanish"], "|", (t["gloss"]["Amharic"] or "EMPTY")[:24])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(merged, ensure_ascii=False, indent=2) + "\n"
    OUT.write_text(text, encoding="utf-8")
    (STORE / "gloss-overrides.json").write_text(text, encoding="utf-8")
    print("wrote", OUT, len(merged))


if __name__ == "__main__":
    main()
