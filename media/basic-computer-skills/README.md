# Basic Computer Skills videos

Purpose Academy Unit 6 / journey step 12. 5 Basic lessons (required) + 8 Extra lessons.

Every MP4 is rendered frame by frame from `scripts/bcs-render/scene.html` (a simple practice
desktop) and narrated with **Piper** open-source neural TTS (`en_US-lessac-medium`).
Narration lines live in `scripts/bcs-render/lessons.json` (Level-4 English, one action per line).

**Beat-lock rule:** each click, key press and highlight is pinned to the word in the spoken
line that names it (`at(line, 'word')` in `scene.html`). Captions show the line being spoken.
Nothing is stretched or re-timed after rendering.

Rebuild:

```bash
pip install --user piper-tts && npx playwright install chromium   # once
python3 scripts/build-basic-computer-skills-videos.py              # all 13
python3 scripts/build-basic-computer-skills-videos.py window save  # some lessons (slug or id)
```

The build also writes `manifest.json` and `src/pathways/packs/basicComputerSkillsTiming.ts`
(line start/end times — the practice questions use them for "Watch that part again").
