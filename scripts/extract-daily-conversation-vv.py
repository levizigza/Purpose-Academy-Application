#!/usr/bin/env python3
"""
Extract Purpose Academy Daily Conversation Vocabulary (pages 1–10, words 1–200).

Crops object photos from worksheet page PNGs, OCRs language panels, merges
curated English/sentences + gloss overrides, writes:
  public/media/daily-conversation-vv/dc-vv-NNN.jpg
  /cursor/stores/self/daily-conversation-vv/vocab200.json
  src/pathways/packs/dailyConversationVocab200.ts
"""
from __future__ import annotations

import json
import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PAGES = Path("/cursor/stores/self/daily-conversation-vv/pages")
STORE = Path("/cursor/stores/self/daily-conversation-vv")
OUT_MEDIA = ROOT / "public/media/daily-conversation-vv"
OUT_TS = ROOT / "src/pathways/packs/dailyConversationVocab200.ts"
OUT_JSON = STORE / "vocab200.json"
OVERRIDES = STORE / "gloss-overrides.json"
DEFS_PATH = STORE / "definitions.json"

X0, Y0 = 28.0, 108.0
X1, Y1 = 2972.0, 1978.0
COLS, ROWS = 5, 4
CW = (X1 - X0) / COLS
CH = (Y1 - Y0) / ROWS
PAD_T, PAD_B, PAD_L, PHOTO_FRAC = 172, 58, 20, 0.42

LANGS = ["Amharic", "Tigrinya", "Arabic", "Spanish", "Hindi"]


def slugify(english: str, n: int) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", english.lower()).strip("-")
    return f"{(s or f'word-{n}')[:40]}-{n:03d}"


def emoji_for(english: str) -> str:
    parts = re.findall(r"[A-Za-z0-9]+", english)
    if not parts:
        return "DC"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[1][0]).upper()


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def card_box(r: int, c: int):
    x0 = X0 + c * CW
    y0 = Y0 + r * CH
    return x0, y0, x0 + CW, y0 + CH


def photo_box(r: int, c: int):
    x0, y0, _, y1 = card_box(r, c)
    return (
        int(x0 + PAD_L),
        int(y0 + PAD_T),
        int(x0 + CW * PHOTO_FRAC),
        int(y1 - PAD_B),
    )


def lang_panel_box(r: int, c: int):
    x0, y0, x1, y1 = card_box(r, c)
    return (int(x0 + CW * 0.43), int(y0 + 70), int(x1 - 12), int(y1 - 55))


def studio_pad(im: Image.Image, tw=720, th=720, margin=0.06) -> Image.Image:
    im = im.convert("RGB")
    canvas = Image.new("RGB", (tw, th), (255, 255, 255))
    max_w = int(tw * (1 - 2 * margin))
    max_h = int(th * (1 - 2 * margin))
    img = im.copy()
    img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    canvas.paste(img, ((tw - img.width) // 2, (th - img.height) // 2))
    return canvas


def ocr_image(im: Image.Image, langs: str) -> str:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        path = Path(f.name)
    try:
        big = im.resize((im.width * 2, im.height * 2), Image.Resampling.LANCZOS)
        big.save(path)
        proc = subprocess.run(
            ["tesseract", str(path), "stdout", "-l", langs, "--psm", "6"],
            capture_output=True,
            text=True,
            check=False,
        )
        return (proc.stdout or "").strip()
    finally:
        path.unlink(missing_ok=True)


def parse_lang_panel(text: str) -> dict[str, str]:
    out = {k: "" for k in LANGS}
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    label_re = re.compile(r"^(Amharic|Tigrinya|Arabic|Spanish|Hindi)\s*[:\-]?\s*(.*)$", re.I)
    i = 0
    while i < len(lines):
        m = label_re.match(lines[i])
        if m:
            key = m.group(1).title()
            rest = m.group(2).strip()
            if rest:
                out[key] = rest
            elif i + 1 < len(lines) and not label_re.match(lines[i + 1]):
                out[key] = lines[i + 1]
                i += 1
        i += 1
    return out


def eth_lines(text: str) -> list[str]:
    return [ln.strip() for ln in text.splitlines() if re.search(r"[\u1200-\u137F]", ln)]


# Exact worksheet English + sentences (pages 1–10).
WORDS = [
    (1, "Hi", "Hi, I'm Sara."),
    (2, "Hello", "Hello, everyone."),
    (3, "Hey", "Hey! Over here!"),
    (4, "Good morning", "Good morning, boss."),
    (5, "Good afternoon", "Good afternoon, class."),
    (6, "Good evening", "Good evening. Come in."),
    (7, "How are you?", "Hi Tom, how are you?"),
    (8, "How's it going?", "Hey, how's it going?"),
    (9, "What's up?", "What's up, man?"),
    (10, "I'm good", "I'm good, thanks."),
    (11, "Not bad", "Not bad. And you?"),
    (12, "Pretty good", "I'm pretty good today."),
    (13, "How about you?", "I'm fine. How about you?"),
    (14, "Nice to meet you", "Nice to meet you, Ali."),
    (15, "What's your name?", "Hi! What's your name?"),
    (16, "My name is...", "My name is Daniel."),
    (17, "Where are you from?", "Where are you from, Maria?"),
    (18, "I'm from...", "I'm from Canada."),
    (19, "Long time no see", "Long time no see, friend!"),
    (20, "Welcome", "Welcome to our school."),
    (21, "Please", "Please sit down."),
    (22, "Thank you", "Thank you for your help."),
    (23, "Thanks", "Thanks, see you tomorrow."),
    (24, "Thanks a lot", "Thanks a lot for the ride."),
    (25, "You're welcome", "Thanks! You're welcome."),
    (26, "No problem", "No problem, I can help."),
    (27, "Excuse me", "Excuse me, where is the bus?"),
    (28, "Sorry", "Sorry, I'm late."),
    (29, "I'm sorry", "I'm sorry, I forgot."),
    (30, "That's okay", "That's okay, don't worry."),
    (31, "Don't worry", "Don't worry, it's fine."),
    (32, "After you", "Please, after you."),
    (33, "Go ahead", "Go ahead and ask."),
    (34, "May I...?", "May I come in?"),
    (35, "Could you...?", "Could you help me?"),
    (36, "Would you mind...?", "Would you mind closing the door?"),
    (37, "I appreciate it", "Thank you. I appreciate it."),
    (38, "Of course", "Of course I can help."),
    (39, "Sure", "Sure, no problem."),
    (40, "No, thank you", "No, thank you. I'm full."),
    (41, "Yes", "Yes, I understand."),
    (42, "No", "No, I don't."),
    (43, "Maybe", "Maybe tomorrow."),
    (44, "I don't understand", "Sorry, I don't understand."),
    (45, "Please repeat", "Please repeat that."),
    (46, "Speak slowly", "Please speak slowly."),
    (47, "What does it mean?", 'What does "shift" mean?'),
    (48, "I need", "I need a pen."),
    (49, "I want", "I want some coffee."),
    (50, "I would like", "I would like water, please."),
    (51, "How much?", "How much is this?"),
    (52, "Where?", "Where is the bathroom?"),
    (53, "When?", "When does class start?"),
    (54, "Today", "I work today."),
    (55, "Tomorrow", "See you tomorrow."),
    (56, "Yesterday", "I was sick yesterday."),
    (57, "Now", "Come now, please."),
    (58, "Later", "I'll call you later."),
    (59, "Busy", "Sorry, I'm busy now."),
    (60, "Hungry", "I'm hungry. Let's eat."),
    (61, "Tired", "I'm tired after work."),
    (62, "See you later", "Bye! See you later."),
    (63, "Take care", "Goodbye, take care."),
    (64, "Good night", "Good night, sleep well."),
    (65, "Have a good day", "Thanks! Have a good day."),
    (66, "Goodbye", "Goodbye, see you Monday."),
    (67, "See you soon", "See you soon, friend."),
    (68, "Take a break", "Let's take a break."),
    (69, "Let's go", "Let's go to lunch."),
    (70, "Come here", "Come here, please."),
    (71, "Wait", "Wait for me!"),
    (72, "Stop", "Stop! A car is coming."),
    (73, "Look", "Look at the board."),
    (74, "Listen", "Listen to the teacher."),
    (75, "Read", "Read page five."),
    (76, "Write", "Write your name here."),
    (77, "Open", "Open the door, please."),
    (78, "Close", "Close the window."),
    (79, "Sit down", "Please sit down."),
    (80, "Stand up", "Stand up, everyone."),
    (81, "Sit here", "You can sit here."),
    (82, "Stand here", "Stand here and wait."),
    (83, "Turn left", "Turn left at the light."),
    (84, "Turn right", "Turn right after the bank."),
    (85, "Straight ahead", "Go straight ahead."),
    (86, "Next", "Next, please!"),
    (87, "Before", "Wash your hands before eating."),
    (88, "After", "We rest after lunch."),
    (89, "First", "First, read the question."),
    (90, "Last", "This is the last one."),
    (91, "Again", "Say it again, please."),
    (92, "Together", "Let's work together."),
    (93, "Separate", "Keep them separate."),
    (94, "Same", "These two are the same."),
    (95, "Different", "An apple is different."),
    (96, "More", "Can I have more water?"),
    (97, "Less", "Use less salt."),
    (98, "Everything", "Everything is ready."),
    (99, "Nothing", "There is nothing in the box."),
    (100, "Enough", "That's enough, thank you."),
    (101, "Too much", "This is too much food."),
    (102, "Too little", "This is too little."),
    (103, "Big", "An elephant is big."),
    (104, "Small", "The kitten is small."),
    (105, "Hot", "The coffee is hot."),
    (106, "Cold", "The water is cold."),
    (107, "Happy", "I'm happy today."),
    (108, "Sad", "Why are you sad?"),
    (109, "Angry", "Don't be angry."),
    (110, "Excited", "I'm excited for the trip!"),
    (111, "Bored", "I'm bored at home."),
    (112, "Surprised", "Wow! I'm surprised."),
    (113, "Scared", "I'm scared of dogs."),
    (114, "Confused", "I'm confused. Help me."),
    (115, "Ready", "Are you ready? Let's go!"),
    (116, "Not ready", "Wait, I'm not ready."),
    (117, "Easy", "This test is easy."),
    (118, "Difficult", "English is difficult."),
    (119, "Important", "This is important."),
    (120, "Not important", "Don't worry, it's not important."),
    (121, "Good", "Good job!"),
    (122, "Bad", "The weather is bad."),
    (123, "Better", "I feel better today."),
    (124, "Worse", "The traffic is worse today."),
    (125, "Best", "You are the best!"),
    (126, "Worst", "That was the worst day."),
    (127, "Early", "I wake up early."),
    (128, "Late", "Don't be late."),
    (129, "On time", "Please come on time."),
    (130, "Delay", "The flight has a delay."),
    (131, "Plan", "What's your plan today?"),
    (132, "Decide", "I can't decide."),
    (133, "Choose", "Choose A or B."),
    (134, "Change", "I need to change my shirt."),
    (135, "Keep", "Keep this book."),
    (136, "Give", "Give me the gift, please."),
    (137, "Get", "I got a gift."),
    (138, "Take", "Take this book."),
    (139, "Bring", "Bring some food."),
    (140, "Carry", "Carry the box, please."),
    (141, "Put", "Put the book on the table."),
    (142, "Hold", "Hold the cup."),
    (143, "Drop", "Don't drop the cup!"),
    (144, "Pick up", "Pick up the book."),
    (145, "Use", "Use the computer."),
    (146, "Turn on", "Turn on the light."),
    (147, "Turn off", "Turn off the light."),
    (148, "Plug in", "Plug in the phone."),
    (149, "Unplug", "Unplug it before you clean."),
    (150, "Charge", "Charge your phone."),
    (151, "Call", "Call me tonight."),
    (152, "Text", "Text me the address."),
    (153, "Check", "Check the time."),
    (154, "Wait", "Wait for the bus."),
    (155, "Hurry", "Hurry! We're late."),
    (156, "Leave", "I leave at 8 o'clock."),
    (157, "Arrive", "We arrive at noon."),
    (158, "Stay", "Stay at home today."),
    (159, "Live", "I live in Calgary."),
    (160, "Work", "I work at a construction site."),
    (161, "Study", "I study every night."),
    (162, "Learn", "I learn new words."),
    (163, "Understand", "Do you understand?"),
    (164, "Remember", "Remember your keys."),
    (165, "Forget", "Don't forget your lunch."),
    (166, "Know", "I know the answer."),
    (167, "Try", "Try again."),
    (168, "Practice", "Practice every day."),
    (169, "Improve", "My English will improve."),
    (170, "Start", "Let's start the class."),
    (171, "Finish", "Finish your work."),
    (172, "Continue", "Please continue."),
    (173, "Stop", "Stop the music."),
    (174, "Pause", "Pause the video."),
    (175, "Restart", "Restart the computer."),
    (176, "Save", "Save the file."),
    (177, "Delete", "Delete the old photos."),
    (178, "Send", "Send me an email."),
    (179, "Receive", "I received your letter."),
    (180, "Share", "Share the photo with me."),
    (181, "Help", "Can you help me?"),
    (182, "Support", "We support each other."),
    (183, "Cooperate", "Let's cooperate as a team."),
    (184, "Communicate", "We communicate every day."),
    (185, "Listen", "Listen carefully."),
    (186, "Speak", "Speak English in class."),
    (187, "Ask", "Ask the teacher."),
    (188, "Answer", "Answer the question."),
    (189, "Agree", "I agree with you."),
    (190, "Disagree", "Sorry, I disagree."),
    (191, "Problem", "We have a problem."),
    (192, "Solution", "I found a solution."),
    (193, "Idea", "That's a good idea!"),
    (194, "Plan", "Make a plan for the week."),
    (195, "Goal", "My goal is to learn English."),
    (196, "Success", "Hard work brings success."),
    (197, "Challenge", "This job is a challenge."),
    (198, "Opportunity", "This is a great opportunity."),
    (199, "Future", "I have a bright future."),
    (200, "Thank you", "Thank you for learning with us!"),
]


def default_definition(english: str, sentence: str) -> str:
    return f"Daily conversation English: {english}. Used as in: “{sentence.rstrip('.')}.”"


def main() -> None:
    assert len(WORDS) == 200
    OUT_MEDIA.mkdir(parents=True, exist_ok=True)
    STORE.mkdir(parents=True, exist_ok=True)

    overrides: dict[str, dict[str, str]] = {}
    if OVERRIDES.exists():
        raw = json.loads(OVERRIDES.read_text(encoding="utf-8"))
        overrides = {str(k): v for k, v in raw.items()}

    defs: dict[str, str] = {}
    if DEFS_PATH.exists():
        defs = json.loads(DEFS_PATH.read_text(encoding="utf-8"))

    terms = []
    incomplete = 0
    for page_n in range(1, 11):
        page_path = PAGES / f"page-{page_n:02d}-words-{(page_n-1)*20+1:03d}-{page_n*20:03d}.png"
        page = Image.open(page_path).convert("RGB")
        for r in range(ROWS):
            for c in range(COLS):
                n = (page_n - 1) * 20 + r * COLS + c + 1
                _, english, sentence = WORDS[n - 1]
                photo = studio_pad(page.crop(photo_box(r, c)))
                photo_path = OUT_MEDIA / f"dc-vv-{n:03d}.jpg"
                photo.save(photo_path, quality=90, optimize=True)

                gloss = {k: "" for k in LANGS}
                panel = page.crop(lang_panel_box(r, c))
                parsed = parse_lang_panel(ocr_image(panel, "eng+spa+ara+hin"))
                eth = ocr_image(panel, "amh+eng")
                parsed_eth = parse_lang_panel(eth)
                for k in LANGS:
                    gloss[k] = (parsed.get(k) or parsed_eth.get(k) or "").strip()
                elines = eth_lines(eth)
                if not gloss["Amharic"] and elines:
                    gloss["Amharic"] = elines[0]
                if not gloss["Tigrinya"] and len(elines) >= 2:
                    gloss["Tigrinya"] = elines[1]
                elif not gloss["Tigrinya"] and gloss["Amharic"]:
                    # Temporary fallback; override JSON should replace when available.
                    gloss["Tigrinya"] = gloss["Amharic"]

                ov = overrides.get(str(n)) or overrides.get(n)  # type: ignore[arg-type]
                if ov:
                    for k, v in ov.items():
                        if v:
                            gloss[k] = v

                if not all(gloss.values()):
                    incomplete += 1

                terms.append(
                    {
                        "n": n,
                        "id": slugify(english, n),
                        "english": english,
                        "emoji": emoji_for(english),
                        "imageKey": f"dc-vv-{n:03d}",
                        "definition": defs.get(english) or default_definition(english, sentence),
                        "sentence": sentence,
                        "gloss": gloss,
                    }
                )
                print(f"[{n:03d}] {english}")

    OUT_JSON.write_text(json.dumps(terms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    header = (
        "/**\n"
        " * Purpose Academy Daily Conversation Vocabulary — words 1–200.\n"
        " * Shared across Construction, Logistics, and Community Support streams.\n"
        " * Exact worksheet translations (Amharic, Tigrinya, Arabic, Spanish, Hindi — no French)\n"
        " * and example sentences from Daily Conversation Vocabulary (pages 1–10).\n"
        " * Images: public/media/daily-conversation-vv/dc-vv-NNN.jpg\n"
        " * Generated by scripts/extract-daily-conversation-vv.py — do not hand-edit bulk rows.\n"
        " */\n"
        "import type { VocabTerm } from '../../student/journeyCurriculum'\n"
        "import { gloss } from '../packHelpers'\n\n"
        "export const DAILY_CONVERSATION_VOCAB_200: VocabTerm[] = [\n"
    )
    parts = []
    for t in terms:
        g = t["gloss"]
        parts.append(
            "  {\n"
            f"    id: '{esc(t['id'])}',\n"
            f"    english: '{esc(t['english'])}',\n"
            f"    emoji: '{esc(t['emoji'])}',\n"
            f"    imageKey: '{esc(t['imageKey'])}',\n"
            f"    definition: '{esc(t['definition'])}',\n"
            f"    sentence: '{esc(t['sentence'])}',\n"
            f"    gloss: gloss('{esc(g.get('Spanish',''))}', '{esc(g.get('Arabic',''))}', "
            f"'{esc(g.get('Hindi',''))}', '{esc(g.get('Amharic',''))}', '{esc(g.get('Tigrinya',''))}'),\n"
            "  },\n"
        )
    OUT_TS.write_text(header + "".join(parts) + "]\n", encoding="utf-8")
    print(f"Wrote {OUT_TS} ({len(terms)} terms); incomplete gloss rows: {incomplete}")


if __name__ == "__main__":
    main()
