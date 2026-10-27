# Grant TL;DR assets — Purpose Academy

Concise showcase materials for grant / partnership review. Honest about current product.

## Downloads (working)

| Asset | Size | Download |
|-------|------|----------|
| **Explainer video** (~71s, H.264 + AAC VO) | ~7.9 MB | [`purpose-academy-grant-explainer.mp4`](./purpose-academy-grant-explainer.mp4) |
| **PowerPoint overview** (9 slides) | ~4.6 MB | [`purpose-academy-grant-overview.pptx`](./purpose-academy-grant-overview.pptx) |

Direct raw links (right-click → Save As, or `curl -LO`):

```text
https://raw.githubusercontent.com/levizigza/Purpose-Academy-Application/cursor/app-toolbox-emulator-f7c6/docs/grant/purpose-academy-grant-overview.pptx
https://raw.githubusercontent.com/levizigza/Purpose-Academy-Application/cursor/app-toolbox-emulator-f7c6/docs/grant/purpose-academy-grant-explainer.mp4
```

On GitHub: open the file → use the **Download raw file** button (not “View raw” alone). Both files are normal git blobs (not Git LFS pointers).

Cloud agent copies (same bytes) also live under `/opt/cursor/artifacts/` for the Cursor artifacts UI; those absolute paths and `cursor.com/agents/.../artifacts?path=...` links are **not** public file downloads.

## Voiceover

- Engine: **Piper** neural TTS
- Voice: **en_US-lessac-medium** (`tools/piper-voices/`)
- Tone: calm adult English; length-scale ~1.06
- Script: [`voiceover-script.txt`](./voiceover-script.txt)

## Slide list

1. Purpose Academy  
2. Who it’s for  
3. Three pathways  
4. Practice loop  
5. Clear the board  
6. Desktop experience  
7. Learner dignity  
8. Progress & Skills Passport  
9. Built in Calgary  

## Regenerate locally

Needs Vite preview on `:4180`, Piper Lessac voice under `tools/piper-voices/`:

```bash
node scripts/capture-grant-desktop.mjs
python3 scripts/grant/build-grant-video.py
python3 scripts/grant/build-grant-pptx.py
```

## Product truth (do not overclaim)

Practice marks and Skills Passport stages are not Red Seal, apprenticeship certification, or an employment guarantee. Competent still needs a real instructor.
