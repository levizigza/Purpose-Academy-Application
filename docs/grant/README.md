# Grant TL;DR assets — Purpose Academy

Concise showcase materials for grant / partnership review. Honest about current product.

## Deliverables

| Asset | Path |
|-------|------|
| Explainer video (~71s) | Cloud artifact: `purpose-academy-grant-explainer.mp4` (also `recording_demo.mp4`) |
| PowerPoint overview | [`purpose-academy-grant-overview.pptx`](./purpose-academy-grant-overview.pptx) |

Regenerate locally (needs Vite preview on `:4180`, Piper Lessac voice under `tools/piper-voices/`):

```bash
node scripts/capture-grant-desktop.mjs
python3 scripts/grant/build-grant-video.py   # if copied into repo
python3 scripts/grant/build-grant-pptx.py
```

## Voiceover

- Engine: **Piper** neural TTS
- Voice: **en_US-lessac-medium** (`tools/piper-voices/`)
- Tone: calm adult English; length-scale ~1.06

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

## Product truth (do not overclaim)

Practice marks and Skills Passport stages are not Red Seal, apprenticeship certification, or an employment guarantee. Competent still needs a real instructor.
