#!/usr/bin/env python3
"""
Build Purpose Academy Basic Computer Skills teaching videos.

Each lesson: royalty-free Mixkit B-roll + large Level-4 English captions (ASS).
License note: Mixkit Stock Video Free License (commercial use). Teaching
copy and composition © Purpose Academy.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media" / "basic-computer-skills"
BROLL_DIRS = [Path("/tmp/bcs-broll2"), Path("/tmp/bcs-broll")]
BUILD = Path("/tmp/bcs-build")
FONT_NAME = "DejaVu Sans"

W, H = 1280, 720
FPS = 24


def resolve_broll(name: str) -> Path:
    for folder in BROLL_DIRS:
        path = folder / name
        if path.exists():
            return path
    raise FileNotFoundError(name)


LESSONS: list[dict] = [
    {
        "file": "01_Turn_computer_on_off.mp4",
        "title": "Turn the computer on and off",
        "broll": "914-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 1 — Turn the computer on and off"),
            (10, 18, "Find the power button on the computer or laptop."),
            (18, 26, "Press it one time to turn the computer ON."),
            (26, 34, "Wait. The screen will light up."),
            (34, 42, "To turn OFF: click the Start button,"),
            (42, 50, "then click Power, then click Shut down."),
            (50, 58, "Do not pull the plug while it is working."),
            (58, 66, "Remember: On with the button. Off with Shut down."),
        ],
    },
    {
        "file": "02_Use_the_mouse.mp4",
        "title": "Use the mouse",
        "broll": "50609-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 2 — Use the mouse"),
            (10, 18, "Move the mouse. The arrow on the screen moves too."),
            (18, 26, "One click = select. Press the left button one time."),
            (26, 34, "Double-click = open. Click two times fast."),
            (34, 42, "Right-click = more choices. Press the right button."),
            (42, 50, "Scroll = move the page. Roll the wheel."),
            (50, 58, "Remember: Point. Click. Open. Scroll."),
        ],
    },
    {
        "file": "03_Use_the_keyboard.mp4",
        "title": "Use the keyboard",
        "broll": "242-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 3 — Use the keyboard"),
            (10, 18, "Letters and numbers type words on the screen."),
            (18, 26, "Space bar = make a space between words."),
            (26, 34, "Enter = go to the next line or say OK."),
            (34, 42, "Backspace = erase the letter behind the cursor."),
            (42, 50, "Shift + letter = make a CAPITAL letter."),
            (50, 58, "Remember: Type. Space. Enter. Backspace."),
        ],
    },
    {
        "file": "04_Create_a_folder.mp4",
        "title": "Create a folder",
        "broll": "4801-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 4 — Create a folder"),
            (10, 18, "A folder holds your files in one place."),
            (18, 26, "Right-click on an empty place on the desktop."),
            (26, 34, "Click New, then click Folder."),
            (34, 42, "Type a clear name. Example: School Work."),
            (42, 50, "Press Enter to keep the name."),
            (50, 58, "Remember: New, Folder, type a clear name."),
        ],
    },
    {
        "file": "05_Create_a_subfolder.mp4",
        "title": "Create a subfolder",
        "broll": "4872-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 5 — Create a subfolder"),
            (10, 18, "A subfolder is a folder inside another folder."),
            (18, 26, "Open your main folder. Example: School Work."),
            (26, 34, "Right-click inside it. Click New, then Folder."),
            (34, 42, "Name it. Example: Week 1."),
            (42, 50, "Now Week 1 lives inside School Work."),
            (50, 58, "Remember: Open folder, New, Folder, name it."),
        ],
    },
    {
        "file": "06_Save_file_with_name.mp4",
        "title": "Save a file with a name",
        "broll": "308-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 6 — Save a file with a name"),
            (10, 18, "Saving keeps your work so you can find it later."),
            (18, 26, "Click File, then click Save As."),
            (26, 34, "Choose a folder. Example: School Work."),
            (34, 42, "Type a clear name. Example: Safety Notes."),
            (42, 50, "Click Save."),
            (50, 58, "Remember: Save As, folder, clear name, Save."),
        ],
    },
    {
        "file": "07_Write_short_paragraph.mp4",
        "title": "Write a short paragraph",
        "broll": "1781-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 7 — Write a short paragraph"),
            (10, 18, "Open a document program. Example: Word or Docs."),
            (18, 26, "Click in the white page. Type slowly."),
            (26, 34, "Write 2 or 3 short sentences."),
            (34, 42, "Use Enter to start a new line when you need it."),
            (42, 50, "Check spelling. Fix mistakes with Backspace."),
            (50, 58, "Remember: Open, type short sentences, check."),
        ],
    },
    {
        "file": "08_Save_your_document.mp4",
        "title": "Save your document",
        "broll": "1808-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 8 — Save your document"),
            (10, 18, "Save often so you do not lose your work."),
            (18, 26, "Click File, Save, or press Ctrl and S."),
            (26, 34, "If it asks for a name, type one and click Save."),
            (34, 42, "Look at the top of the window. You should see the name."),
            (42, 50, "Save again after you add more words."),
            (50, 58, "Remember: Save often. Ctrl and S is fast."),
        ],
    },
    {
        "file": "09_Write_and_send_email.mp4",
        "title": "Write and send an email",
        "broll": "918-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 9 — Write and send an email"),
            (10, 18, "Open your email. Click Compose or New."),
            (18, 26, "To: type the other persons email address."),
            (26, 34, "Subject: write a short title. Example: Homework."),
            (34, 42, "Type your message in clear, short sentences."),
            (42, 50, "Click Send."),
            (50, 58, "Remember: To, Subject, message, Send."),
        ],
    },
    {
        "file": "10_Reply_to_email.mp4",
        "title": "Reply to an email",
        "broll": "4872-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 10 — Reply to an email"),
            (10, 18, "Open the email you want to answer."),
            (18, 26, "Click Reply. Do not start a brand new email."),
            (26, 34, "Type your answer under their message."),
            (34, 42, "Check the To box still has the right person."),
            (42, 50, "Click Send."),
            (50, 58, "Remember: Open, Reply, type, Send."),
        ],
    },
    {
        "file": "11_Attach_and_save_files.mp4",
        "title": "Attach a file and save an attachment",
        "broll": "4801-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 11 — Attach and save files"),
            (10, 18, "To send a file: click Attach or the paperclip."),
            (18, 26, "Choose your file. Wait until you see its name."),
            (26, 34, "Then click Send."),
            (34, 42, "To keep a file someone sent you: open the email."),
            (42, 50, "Click the file. Click Download or Save."),
            (50, 58, "Choose your folder. Click Save."),
            (58, 66, "Remember: Attach before Send. Save attachments to a folder."),
        ],
    },
    {
        "file": "12_Stay_safe_online.mp4",
        "title": "Stay safe online",
        "broll": "914-720.mp4",
        "lines": [
            (0, 4, "Basic Computer Skills"),
            (4, 10, "Lesson 12 — Stay safe online"),
            (10, 18, "Keep your password private. Do not share it."),
            (18, 26, "Do not click strange links in email."),
            (26, 34, "Ask your instructor if you are not sure."),
            (34, 42, "Log out when you finish on a shared computer."),
            (42, 50, "Only upload YOUR school work — never passwords."),
            (50, 58, "Remember: Private password. Careful clicks. Ask for help."),
        ],
    },
]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def ass_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def write_ass(path: Path, lines: list[tuple[int, int, str]]) -> None:
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Brand,{FONT_NAME},22,&H0018C5F5,&H000000FF,&H001F1F1F,&HAA000000,1,0,0,0,100,100,0,0,1,2,0,7,28,28,18,1
Style: Caption,{FONT_NAME},32,&H00FFFFFF,&H000000FF,&H00101010,&H99000000,0,0,0,0,100,100,0,0,1,3,0,2,40,40,48,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,{ass_time(max(e for _, e, _ in lines) + 2)},Brand,,0,0,0,,PURPOSE ACADEMY
"""
    events = []
    for start, end, text in lines:
        safe = text.replace("{", "(").replace("}", ")")
        events.append(
            f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Caption,,0,0,0,,{safe}"
        )
    path.write_text(header + "\n".join(events) + "\n", encoding="utf-8")


def build_lesson(lesson: dict) -> Path:
    BUILD.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    src = resolve_broll(lesson["broll"])

    duration = max(line[1] for line in lesson["lines"]) + 2
    out = OUT / lesson["file"]
    ass_path = BUILD / (lesson["file"] + ".ass")
    write_ass(ass_path, lesson["lines"])

    # Escape path for ffmpeg subtitles filter (Windows-style escaping not needed on linux,
    # but colons/commas in path need escaping — ours are simple)
    ass_esc = str(ass_path).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},setsar=1,"
        f"drawbox=x=0:y=0:w=iw:h=64:color=0x0B2F5C@0.88:t=fill,"
        f"drawbox=x=0:y=ih-160:w=iw:h=160:color=black@0.55:t=fill,"
        f"subtitles={ass_esc}"
    )
    cmd = [
        "ffmpeg",
        "-y",
        "-stream_loop",
        "-1",
        "-i",
        str(src),
        "-t",
        str(duration),
        "-vf",
        vf,
        "-r",
        str(FPS),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-an",
        "-movflags",
        "+faststart",
        str(out),
    ]
    print("BUILD", lesson["file"], f"({duration}s)")
    run(cmd)
    return out


def main() -> None:
    built = []
    for lesson in LESSONS:
        path = build_lesson(lesson)
        built.append(
            {
                "file": lesson["file"],
                "title": lesson["title"],
                "bytes": path.stat().st_size,
            }
        )
    (OUT / "manifest.json").write_text(json.dumps(built, indent=2) + "\n")
    print("Wrote", len(built), "videos to", OUT)


if __name__ == "__main__":
    main()
