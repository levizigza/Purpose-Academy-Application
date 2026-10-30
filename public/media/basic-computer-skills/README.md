# Basic Computer Skills videos

Royalty-free teaching clips for Purpose Academy Unit 6 / journey step 12.

- Hardware lessons use Pexels / Mixkit close-up action footage.
- Software lessons use recorded practice-desktop demos (folder, email, save, safety).
- Each MP4 includes warm English narration via **Piper** open-source neural TTS
  (`en_US-lessac-medium`) and burned-in Level-4 captions.

Rebuild (full — needs `/tmp` action clips + demos):

```bash
node scripts/bcs-demos/record-bcs-demos.mjs
python3 scripts/build-basic-computer-skills-videos.py
```

Rebuild one software demo (folder / subfolder beat-lock):

```bash
node scripts/bcs-demos/record-bcs-demos.mjs --only=folder,subfolder
python3 scripts/build-basic-computer-skills-videos.py --only=04,05
```

Refresh narration only (reuses shipped visuals):

```bash
pip install --user piper-tts
python3 scripts/build-basic-computer-skills-videos.py --narration-refresh
```

**Beat-lock rule:** folder demos must hold on each UI beat ≈ Piper VO windows. Do not stretch a short take across a long narration track (`normalize_demo` setpts) — that is the mid-lesson stretch defect.
