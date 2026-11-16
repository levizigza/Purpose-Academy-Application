# Craft lock — before Wave 9

**Locked:** 2026-11-16 (America/Denver)  
**Commit:** `9442585b` (`main`)  
**Live site:** https://levizigza.github.io/Purpose-Academy-Application/  
**Splash restore point:** `docs/splash-versions/v45` (session key at snapshot: v51)

This file freezes the product truth that Wave 9 must **not** overturn unless the customer explicitly asks. Prior climbs already burned us by flipping Modes ↔ splash order and by shipping changes that never reached the site link.

## Locked entry flow (do not invert)

```
Site link → Desktop | Phone (first screen)
  Desktop → opening (door → logo-full → Enter under logo) → toolbox
  Phone → home PA icon → in-device opening → toolbox
Toolbox trays: Student Practice → Student → Instructor → Instructor Practice (nested under Instructor) → Admin → Contact
```

- Mode chooser is session-scoped (`pa-entry-chosen-v1`). Fresh visit → Modes first.
- Desktop opening is armed by ModeChooser (`desktopPhase: opening`), not by forcing splash before Modes.
- Enter finishes to toolbox (`desktopPhase: ready`) — never `clearShellMode()` on Enter.
- Auth / legal / portal paths must never be trapped behind the splash.

## Locked Practice craft

- **Student Practice:** name gate · hub/stations · Feedback chat · Start over · Done for now.
- **Instructor Practice:** nested under Instructor · same practice-mode craft (name gate · hub → Prepare/Model/Practise/Observe · feedback) · public `/teacher-practice` · portal `/app/instructor/practice`.
- Phone mounts Practice banner + Feedback dock inside the device.
- Mother-tongue lines explain *instructions* (what to do), never replace English production typing.
- Learner-fear lexicon: no exam/quiz/mastery/% theatre in learner chrome.

## Locked deploy integrity

- Ship via `main` → Deploy GitHub Pages Actions workflow.
- `npm run build` must write `dist/404.html` + `.nojekyll` (SPA deep links).
- Verify in a private window after deploy — Actions green alone is not enough.
- Restore splash with: `node scripts/splash-version.mjs restore v45`

## Wave 9 status

**Wave 9 is not defined in this repository, prior agent transcript, or attached plans.**  
Do not invent a Wave 9 scope. Wait for an explicit Wave 9 brief (checklist / plan file) before product changes.

When Wave 9 arrives, re-read this lock + `docs/CRAFTSMANSHIP.md` §7 + `docs/LEARNER_FEAR.md` + `docs/PLAY_CRAFT.md`, then implement for usability **without** breaking the flow above.
