#!/usr/bin/env python3
"""
Bake Eye Spy boards into single workplace photos with tool callouts composited in.

Output: public/media/eye-spy/{pathway}-{sceneId}.jpg
Eye Spy then uses transparent tap regions on these floors (true single-photo hotspots).
"""
from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/media/eye-spy"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1280, 960

ATMOSPHERE = {
    "construction": [
        ROOT / "src/assets/photos/path-construction.jpg",
        ROOT / "src/assets/photos/hero-work.jpg",
        ROOT / "src/assets/photos/stage-apprenticeship.jpg",
    ],
    "logistics": [
        ROOT / "src/assets/photos/logistics/log-warehouse.jpg",
        ROOT / "src/assets/photos/logistics/log-aisle.jpg",
        ROOT / "src/assets/photos/logistics/log-dock.jpg",
        ROOT / "src/assets/photos/path-logistics.jpg",
    ],
    "community": [
        ROOT / "src/assets/photos/path-community.jpg",
        ROOT / "src/assets/photos/community/com-welcome.jpg",
        ROOT / "src/assets/photos/community/com-hygiene.jpg",
        ROOT / "src/assets/photos/community/com-shopping.jpg",
    ],
}

TOOL_PHOTOS = {
    "hammer": ROOT / "src/assets/photos/tools/hammer-clear.jpg",
    "drill": ROOT / "src/assets/photos/tools/drill-clear.jpg",
    "saw": ROOT / "src/assets/photos/tools/saw-photo.jpg",
    "tape-measure": ROOT / "src/assets/photos/tools/tape-photo.jpg",
    "hard-hat": ROOT / "src/assets/photos/tools/hardhat-photo.jpg",
    "level": ROOT / "src/assets/photos/tools/level-photo.jpg",
    "ppe": ROOT / "src/assets/photos/tools/ppe-clear.jpg",
}

REMASTER = {
    "com-hygiene": ROOT / "src/assets/photos/community/com-hygiene.jpg",
    "com-consent": ROOT / "src/assets/photos/community/com-consent.jpg",
    "com-wheelchair": ROOT / "src/assets/photos/community/com-wheelchair.jpg",
    "com-walker": ROOT / "src/assets/photos/community/com-walker.jpg",
    "com-bus": ROOT / "src/assets/photos/community/com-bus.jpg",
    "com-gloves": ROOT / "src/assets/photos/community/com-gloves.jpg",
    "com-clipboard": ROOT / "src/assets/photos/community/com-clipboard.jpg",
    "com-schedule": ROOT / "src/assets/photos/community/com-schedule.jpg",
    "com-phone": ROOT / "src/assets/photos/community/com-phone.jpg",
    "com-keys": ROOT / "src/assets/photos/community/com-keys.jpg",
    "com-badge": ROOT / "src/assets/photos/community/com-badge.jpg",
    "com-first-aid": ROOT / "src/assets/photos/community/com-first-aid.jpg",
    "com-welcome": ROOT / "src/assets/photos/community/com-welcome.jpg",
    "com-support-plan": ROOT / "src/assets/photos/community/com-support-plan.jpg",
    "com-backpack": ROOT / "src/assets/photos/community/com-backpack.jpg",
    "com-shopping": ROOT / "src/assets/photos/community/com-shopping.jpg",
}

PACKS = {
    "construction": ROOT / "src/pathways/packs/constructionPractice.ts",
    "logistics": ROOT / "src/pathways/packs/logisticsPractice.ts",
    "community": ROOT / "src/pathways/packs/communityPractice.ts",
}


def resolve_image(key: str) -> Path | None:
    if key in TOOL_PHOTOS and TOOL_PHOTOS[key].exists():
        return TOOL_PHOTOS[key]
    if key in REMASTER and REMASTER[key].exists():
        return REMASTER[key]
    if key.startswith("con-vv-"):
        p = ROOT / f"public/media/construction-vv/{key}.jpg"
        return p if p.exists() else None
    if key.startswith("log-vv-"):
        p = ROOT / f"public/media/logistics-vv/{key}.jpg"
        return p if p.exists() else None
    if key.startswith("com-vv-"):
        p = ROOT / f"public/media/community-vv/{key}.jpg"
        return p if p.exists() else None
    if key.startswith("com-"):
        p = ROOT / f"src/assets/photos/community/{key}.jpg"
        return p if p.exists() else None
    if key.startswith("log-"):
        p = ROOT / f"src/assets/photos/logistics/{key}.jpg"
        return p if p.exists() else None
    return None


def parse_scenes(path: Path) -> list[dict]:
    text = path.read_text()
    scenes = []
    for block in re.split(r"\n  \{\n", text):
        id_m = re.search(r"id: '([^']+)'", block)
        if not id_m or "hotspots:" not in block:
            continue
        spots = []
        for m in re.finditer(
            r"spot\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)",
            block,
        ):
            spots.append(
                {
                    "id": m.group(1),
                    "label": m.group(2),
                    "imageKey": m.group(3),
                    "x": float(m.group(4)),
                    "y": float(m.group(5)),
                    "w": float(m.group(6)),
                    "h": float(m.group(7)),
                }
            )
        if spots:
            scenes.append({"id": id_m.group(1), "hotspots": spots})
    return scenes


def cover(im: Image.Image, tw: int, th: int) -> Image.Image:
    im = im.convert("RGB")
    scale = max(tw / im.width, th / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


def contain_pad(im: Image.Image, tw: int, th: int, margin=0.08) -> Image.Image:
    im = im.convert("RGBA")
    iw, ih = im.size
    box_w = int(tw * (1 - 2 * margin))
    box_h = int(th * (1 - 2 * margin))
    scale = min(box_w / iw, box_h / ih)
    nw, nh = max(1, int(iw * scale)), max(1, int(ih * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (tw, th), (255, 255, 255, 255))
    canvas.paste(im, ((tw - nw) // 2, (th - nh) // 2), im if im.mode == "RGBA" else None)
    return canvas


def rounded_mat(im: Image.Image, radius=18) -> Image.Image:
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=radius, fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0))
    out.putalpha(mask)
    # soft shadow
    shadow = Image.new("RGBA", (im.width + 16, im.height + 16), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 90))
    sh.putalpha(mask.point(lambda p: int(p * 0.55)))
    shadow.paste(sh, (8, 10), sh)
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))
    return shadow, out


def bake_scene(pathway: str, scene: dict, atmosphere: Path) -> Path:
    base = cover(Image.open(atmosphere), W, H).convert("RGBA")
    # slight darken so white mats pop
    veil = Image.new("RGBA", (W, H), (4, 21, 38, 40))
    base = Image.alpha_composite(base, veil)

    for spot in scene["hotspots"]:
        src = resolve_image(spot["imageKey"])
        if not src:
            print(f"  ! missing {spot['imageKey']} for {scene['id']}")
            continue
        bw = max(int(W * max(spot["w"], 16) / 100), 120)
        bh = max(int(H * max(spot["h"], 14) / 100), 110)
        tile = contain_pad(Image.open(src), bw, bh)
        shadow, mat = rounded_mat(tile, radius=16)
        x = int(W * spot["x"] / 100)
        y = int(H * spot["y"] / 100)
        # clamp into frame
        x = min(max(0, x), W - bw)
        y = min(max(0, y), H - bh)
        base.paste(shadow, (max(0, x - 8), max(0, y - 6)), shadow)
        base.paste(mat, (x, y), mat)

    out = OUT / f"{pathway}-{scene['id']}.jpg"
    base.convert("RGB").save(out, "JPEG", quality=88, optimize=True)
    return out


def main() -> None:
    written = 0
    for pathway, pack in PACKS.items():
        scenes = parse_scenes(pack)
        atmos = [p for p in ATMOSPHERE[pathway] if p.exists()]
        if not atmos:
            raise SystemExit(f"No atmosphere for {pathway}")
        print(f"{pathway}: {len(scenes)} scenes")
        for i, scene in enumerate(scenes):
            path = bake_scene(pathway, scene, atmos[i % len(atmos)])
            print(f"  wrote {path.name}")
            written += 1
    print(f"done — {written} baked scenes → {OUT}")


if __name__ == "__main__":
    main()
