#!/usr/bin/env python3
"""
Ingest Community Service Visual Vocabulary + Sentence Practice Cursor.md
into pathway packs matching Construction / Logistics structure.

Sources (uploads):
  Community_Visual_Vocabulary_Cursor_*.md
  Community_Sentence_Practice_Cursor_*.md

Outputs:
  src/pathways/packs/communityVocab500.ts
  src/pathways/packs/communitySentenceCloze499.ts
  /tmp/community-ingest/summary.json
"""
from __future__ import annotations

import json
import re
from pathlib import Path

UPLOADS = Path("/home/ubuntu/.cursor/projects/workspace/uploads")
VV_MD = next(UPLOADS.glob("Community_Visual_Vocabulary_Cursor*.md"))
SENT_MD = next(UPLOADS.glob("Community_Sentence_Practice_Cursor*.md"))
OUT_VOCAB = Path("src/pathways/packs/communityVocab500.ts")
OUT_CLOZE = Path("src/pathways/packs/communitySentenceCloze499.ts")
SUMMARY = Path("/tmp/community-ingest/summary.json")
SUMMARY.parent.mkdir(parents=True, exist_ok=True)

# Remastered object photos already in src/assets/photos/community/
REMASTER_BY_TITLE = {
    "hygiene": "com-hygiene",
    "consent": "com-consent",
    "wheelchair": "com-wheelchair",
    "walker": "com-walker",
    "bus": "com-bus",
    "gloves": "com-gloves",
    "clipboard": "com-clipboard",
    "schedule": "com-schedule",
    "phone": "com-phone",
    "keys": "com-keys",
    "badge": "com-badge",
    "name badge": "com-badge",
    "first aid kit": "com-first-aid",
    "first aid": "com-first-aid",
    "welcome desk": "com-welcome",
    "support plan": "com-support-plan",
    "day bag": "com-backpack",
    "backpack": "com-backpack",
    "shopping bag": "com-shopping",
}


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def emoji_for(english: str) -> str:
    words = re.findall(r"[A-Za-z0-9]+", english)
    if not words:
        return "CS"
    if len(words) == 1:
        return words[0][:2].upper()
    return (words[0][0] + words[1][0]).upper()


def definition_from_sentence(english: str, sentence: str) -> str:
    """Worksheet gives definitional sentences; keep a short definition for the card."""
    s = sentence.strip()
    if not s:
        return f"{english} — a community support workplace word."
    # Prefer the sentence itself (already CLB-4 clear) as definition.
    if not s.endswith("."):
        s += "."
    return s


def image_key_for(n: int, title: str) -> str:
    t = title.strip().lower()
    if t in REMASTER_BY_TITLE:
        return REMASTER_BY_TITLE[t]
    # Exact single-word remasters only — avoid "Abuse" matching "Bus"
    for key, photo in REMASTER_BY_TITLE.items():
        if t == key:
            return photo
    return f"com-vv-{n:03d}"


def parse_vocab(md: str) -> list[dict]:
    blocks = re.split(r"\n(?=### \d+\. )", md)
    out: list[dict] = []
    for block in blocks:
        m = re.match(r"### (\d+)\. (.+)", block)
        if not m:
            continue
        n = int(m.group(1))
        title = m.group(2).strip()
        status_m = re.search(r"\*\*Status:\*\* `([^`]+)`", block)
        status = status_m.group(1) if status_m else "available"
        id_m = re.search(r"\*\*ID:\*\* `([^`]+)`", block)
        vid = id_m.group(1) if id_m else f"community-{n:03d}"
        if status == "missing_source" or title.startswith("["):
            out.append(
                {
                    "n": n,
                    "id": vid,
                    "english": None,
                    "status": "missing_source",
                }
            )
            continue
        sent_m = re.search(r"\*\*English sentence:\*\* (.+)", block)
        sentence = (sent_m.group(1).strip() if sent_m else "").strip()
        langs = {}
        for code, label in [
            ("am", "Amharic"),
            ("ti", "Tigrinya"),
            ("ar", "Arabic"),
            ("es", "Spanish"),
            ("hi", "Hindi"),
        ]:
            lm = re.search(rf"\*\*{label} \({code}\):\*\* (.+)", block)
            langs[label] = lm.group(1).strip() if lm else ""
        out.append(
            {
                "n": n,
                "id": vid,
                "english": title,
                "status": status,
                "sentence": sentence,
                "definition": definition_from_sentence(title, sentence),
                "emoji": emoji_for(title),
                "imageKey": image_key_for(n, title),
                "gloss": {
                    "Spanish": langs["Spanish"],
                    "Arabic": langs["Arabic"],
                    "Hindi": langs["Hindi"],
                    "Amharic": langs["Amharic"],
                    "Tigrinya": langs["Tigrinya"],
                },
            }
        )
    return out


def parse_sentences(md: str) -> list[dict]:
    blocks = re.split(r"\n(?=### \d+\. )", md)
    out: list[dict] = []
    for block in blocks:
        m = re.match(r"### (\d+)\. (.+)", block)
        if not m:
            continue
        n = int(m.group(1))
        prompt = m.group(2).strip()
        if "Not assessed" in prompt or "missing source" in prompt.lower():
            continue
        qid_m = re.search(r"\*\*Question ID:\*\* `([^`]+)`", block)
        vid_m = re.search(r"\*\*Vocabulary ID:\*\* `([^`]+)`", block)
        opts = {}
        for letter in "ABCD":
            om = re.search(rf"^- \*\*{letter}\.\*\* (.+)$", block, re.M)
            if om:
                opts[letter] = om.group(1).strip()
        if len(opts) != 4:
            continue
        corr_m = re.search(r"\*\*Correct answer:\*\* ([A-D]) — (.+)", block)
        if not corr_m:
            continue
        letter = corr_m.group(1)
        answer = corr_m.group(2).strip()
        # Prefer option text for exact match
        answer = opts[letter]
        out.append(
            {
                "n": n,
                "id": qid_m.group(1) if qid_m else f"csy-{n}",
                "vocabId": vid_m.group(1) if vid_m else None,
                "prompt": prompt,
                "options": [opts["A"], opts["B"], opts["C"], opts["D"]],
                "answer": answer,
                "correctOptionId": letter,
            }
        )
    return out


def write_vocab_ts(terms: list[dict]) -> None:
    live = [t for t in terms if t.get("english")]
    header = (
        "/**\n"
        " * Purpose Academy Community Support Visual Vocabulary — words 1–500.\n"
        " * Exact worksheet translations (Amharic, Tigrinya, Arabic, Spanish, Hindi — no French)\n"
        " * and workplace sentences from Community Service Visual Vocabulary.\n"
        " * Source: Community_Visual_Vocabulary_Cursor.md (499 populated; slot 176 reserved/missing).\n"
        " * Images: remastered com-* photos when available; else public/media/community-vv/com-vv-NNN.jpg.\n"
        " * Generated by scripts/ingest-community-cursor-md.py — do not hand-edit bulk rows.\n"
        " */\n"
        "import type { VocabTerm } from '../../student/journeyCurriculum'\n"
        "import { gloss } from '../packHelpers'\n\n"
        "export const COMMUNITY_VOCAB_500: VocabTerm[] = [\n"
    )
    parts = []
    for t in live:
        g = t["gloss"]
        parts.append(
            "  {\n"
            f"    id: '{esc(t['id'])}',\n"
            f"    english: '{esc(t['english'])}',\n"
            f"    emoji: '{esc(t['emoji'])}',\n"
            f"    imageKey: '{esc(t['imageKey'])}',\n"
            f"    definition: '{esc(t['definition'])}',\n"
            f"    sentence: '{esc(t['sentence'])}',\n"
            f"    gloss: gloss('{esc(g['Spanish'])}', '{esc(g['Arabic'])}', "
            f"'{esc(g['Hindi'])}', '{esc(g['Amharic'])}', '{esc(g['Tigrinya'])}'),\n"
            "  },\n"
        )
    OUT_VOCAB.write_text(header + "".join(parts) + "]\n", encoding="utf-8")


def write_cloze_ts(items: list[dict], vocab_by_id: dict[str, dict]) -> None:
    header = (
        "/**\n"
        " * Community Support Foundations — Sentence Structure (cloze) bank.\n"
        " * Source: Community Service Sentence Practice (Cursor.md) questions 1–500.\n"
        " * Slot 176 reserved (missing source). Four options; one correct specialty word.\n"
        " * Generated by scripts/ingest-community-cursor-md.py — do not hand-edit bulk rows.\n"
        " */\n"
        "import type { SentenceClozeItem } from './constructionSentenceCloze560'\n\n"
        "export const COMMUNITY_SENTENCE_CLOZE_499: SentenceClozeItem[] = [\n"
    )
    parts = []
    for it in items:
        vid = it.get("vocabId")
        image_key = None
        if vid and vid in vocab_by_id:
            image_key = vocab_by_id[vid].get("imageKey")
        elif vid:
            # community-001 → com-vv-001
            m = re.search(r"community-(\d+)", vid)
            if m:
                image_key = f"com-vv-{int(m.group(1)):03d}"
        opts = it["options"]
        assert len(opts) == 4
        img_field = f", imageKey: '{esc(image_key)}'" if image_key else ""
        parts.append(
            "  {"
            f" id: 'csy-{it['n']}', n: {it['n']}, "
            f"prompt: '{esc(it['prompt'])}', "
            f"options: ['{esc(opts[0])}', '{esc(opts[1])}', '{esc(opts[2])}', '{esc(opts[3])}'], "
            f"answer: '{esc(it['answer'])}'"
            f"{img_field}"
            " },\n"
        )
    OUT_CLOZE.write_text(header + "".join(parts) + "]\n", encoding="utf-8")


def main() -> None:
    vocab = parse_vocab(VV_MD.read_text(encoding="utf-8"))
    sentences = parse_sentences(SENT_MD.read_text(encoding="utf-8"))
    live = [t for t in vocab if t.get("english")]
    missing = [t for t in vocab if t.get("status") == "missing_source"]
    vocab_by_id = {t["id"]: t for t in live}

    # Drop cloze whose vocab is missing
    cloze = [s for s in sentences if s.get("vocabId") in vocab_by_id or s.get("vocabId") is None]
    # Prefer only those with known vocab
    cloze = [s for s in cloze if s.get("vocabId") in vocab_by_id]

    write_vocab_ts(vocab)
    write_cloze_ts(cloze, vocab_by_id)

    remastered = sum(1 for t in live if not str(t["imageKey"]).startswith("com-vv-"))
    summary = {
        "vvSource": str(VV_MD),
        "sentenceSource": str(SENT_MD),
        "vocabSlots": len(vocab),
        "vocabLive": len(live),
        "vocabMissing": [t["n"] for t in missing],
        "clozeCount": len(cloze),
        "remasteredImageKeys": remastered,
        "level1": [t["english"] for t in live[:20]],
        "outVocab": str(OUT_VOCAB),
        "outCloze": str(OUT_CLOZE),
    }
    SUMMARY.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
