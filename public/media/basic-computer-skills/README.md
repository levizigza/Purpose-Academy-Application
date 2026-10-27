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

Refresh narration only (reuses shipped visuals):

```bash
pip install --user piper-tts
python3 scripts/build-basic-computer-skills-videos.py --narration-refresh
```
