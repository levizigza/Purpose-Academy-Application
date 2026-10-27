# Purpose Academy — downloadable overview assets

Clear product showcase materials. Honest about what exists today. Not grant theatre.

## Primary download — PowerPoint

| Asset | Size | Path |
|-------|------|------|
| **Product overview PowerPoint** (10 slides, 16:9) | ~4.9 MB | [`purpose-academy-overview.pptx`](./purpose-academy-overview.pptx) |

**Raw download URL** (right-click → Save As, or `curl -LO`):

```text
https://raw.githubusercontent.com/levizigza/Purpose-Academy-Application/main/docs/grant/purpose-academy-overview.pptx
```

On GitHub: open the file → **Download raw file** (not “View raw” alone). Normal git blob — not Git LFS.

### Slide list

1. Purpose Academy  
2. Who it’s for  
3. Desktop and phone  
4. Three pathways  
5. Visual Vocabulary  
6. Stations that stay clear  
7. Eye Spy  
8. Learner dignity  
9. Skills Passport  
10. Built in Calgary  

## Also available

| Asset | Size | Download |
|-------|------|----------|
| Grant-flavoured overview (9 slides) | ~4.6 MB | [`purpose-academy-grant-overview.pptx`](./purpose-academy-grant-overview.pptx) |
| Explainer video (~71s, H.264 + AAC VO) | ~7.9 MB | [`purpose-academy-grant-explainer.mp4`](./purpose-academy-grant-explainer.mp4) |

```text
https://raw.githubusercontent.com/levizigza/Purpose-Academy-Application/main/docs/grant/purpose-academy-grant-overview.pptx
https://raw.githubusercontent.com/levizigza/Purpose-Academy-Application/main/docs/grant/purpose-academy-grant-explainer.mp4
```

Cloud agent copies under `/opt/cursor/artifacts/` are for the Cursor artifacts UI only — those absolute paths and `cursor.com/agents/.../artifacts?path=...` links are **not** public file downloads.

## Voiceover (video)

- Engine: **Piper** neural TTS  
- Voice: **en_US-lessac-medium** (`tools/piper-voices/`)  
- Script: [`voiceover-script.txt`](./voiceover-script.txt)

## Regenerate locally

Needs Vite preview on `:4180` for fresh desktop captures; product PPTX can reuse existing shots:

```bash
node scripts/capture-grant-desktop.mjs
python3 scripts/grant/build-product-pptx.py
python3 scripts/grant/build-grant-pptx.py
python3 scripts/grant/build-grant-video.py
```

## Product truth (do not overclaim)

Practice marks and Skills Passport stages are not Red Seal, apprenticeship certification, or an employment guarantee. Competent still needs a real instructor.
