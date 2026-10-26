#!/usr/bin/env python3
"""
Replace interim Community word-card tiles with workplace object photos.

Roles/places map to existing remastered com-* object photos (clipboard, badge,
first-aid, etc.) so Eye Spy + early VV pages show real objects, not text cards.
Also studio-pads remasters into matching com-vv-NNN.jpg files used by imageKeys.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
COM = ROOT / "src/assets/photos/community"
OUT = ROOT / "public/media/community-vv"
OUT.mkdir(parents=True, exist_ok=True)

# Eye Spy + early practice roles/places → workplace object cue photos
ROLE_TO_PHOTO = {
    # People / roles → object that stands for the job
    1: "com-welcome",  # Volunteer
    2: "com-clipboard",  # Social worker
    3: "com-gloves",  # Caregiver
    4: "com-phone",  # Counsellor
    5: "com-support-plan",  # Mentor
    6: "com-schedule",  # Facilitator
    7: "com-clipboard",  # Coordinator
    8: "com-schedule",  # Organizer
    9: "com-support-plan",  # Advocate
    10: "com-badge",  # Leader
    11: "com-clipboard",  # Assistant
    12: "com-schedule",  # Trainer
    13: "com-clipboard",  # Educator
    14: "com-first-aid",  # Nurse
    15: "com-hygiene",  # Health worker
    16: "com-backpack",  # Outreach worker
    17: "com-support-plan",  # Caseworker
    18: "com-phone",  # Mediator
    19: "com-badge",  # Support staff
    20: "com-badge",  # Supervisor
    # Places / programs
    43: "com-welcome",  # Shelter
    44: "com-first-aid",  # Clinic
    45: "com-clipboard",  # School
    46: "com-schedule",  # Program
    49: "com-support-plan",  # Initiative
    51: "com-gloves",  # Support
    52: "com-wheelchair",  # Assistance
    55: "com-backpack",  # Outreach
    59: "com-walker",  # Inclusion
    175: "com-schedule",  # Awareness day
    177: "com-wheelchair",  # Challenge
    178: "com-walker",  # Barrier
    179: "com-clipboard",  # Solution
    180: "com-support-plan",  # Strategy
    258: "com-gloves",  # Clean-up campaign
    494: "com-welcome",  # Public initiative
    495: "com-backpack",  # Community service
    496: "com-badge",  # Social responsibility
    # Exact remaster titles already in pack
    87: "com-hygiene",
    413: "com-consent",
}


def studio_pad(im: Image.Image, tw=960, th=720, margin=0.06) -> Image.Image:
    im = im.convert("RGB")
    iw, ih = im.size
    box_w = int(tw * (1 - 2 * margin))
    box_h = int(th * (1 - 2 * margin))
    scale = min(box_w / iw, box_h / ih)
    nw, nh = max(1, int(iw * scale)), max(1, int(ih * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (tw, th), (244, 247, 251))
    canvas.paste(im, ((tw - nw) // 2, (th - nh) // 2))
    return canvas


def main() -> None:
    written = 0
    for n, photo in sorted(ROLE_TO_PHOTO.items()):
        src = COM / f"{photo}.jpg"
        if not src.exists():
            print(f"! missing {src}")
            continue
        dest = OUT / f"com-vv-{n:03d}.jpg"
        studio_pad(Image.open(src)).save(dest, "JPEG", quality=90, optimize=True)
        written += 1
        print(f"  {dest.name} ← {photo}")
    # Keep exact remaster keys as files too for pathwayImage('com-hygiene') etc. — already in assets
    print(f"done — upgraded {written} Community VV tiles to object photos")


if __name__ == "__main__":
    main()
