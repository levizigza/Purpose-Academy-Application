# Splash craft versions — backups & revert

Feedback decisions get overturned. This archive keeps **restore points** for the opening animation so we can walk a climb back without digging through git archaeology.

## What is snapshotted

| File | Why |
|------|-----|
| `splash.css` | Threshold / doorway / pathways / hammer block from `src/styles.css` (between `SPLASH_CRAFT_*` markers) |
| `OpeningDoor.tsx` | Door architecture + light SVG |
| `EntryPages.tsx` | Timeline, session key, composition shell |

## Commands

```bash
# List restore points
node scripts/splash-version.mjs list

# Freeze the current splash as a named version (run BEFORE a risky climb)
node scripts/splash-version.mjs snapshot v40 --note "centered paths + light spill on cool floor"

# Walk back to that decision
node scripts/splash-version.mjs restore v40

# Read notes for one version
node scripts/splash-version.mjs show v40
```

After a restore: bump `ENTERED_KEY` in `EntryPages.tsx` if returning visitors should replay, commit, ship, confirm live.

## When to snapshot

- Before overturning a composition that someone loved (paths, settle angle, stage color)
- After a climb locks and is confirmed live (tag the win)
- Before experiments that might look worse on the phone

## Doctrine

See `docs/CRAFTSMANSHIP.md` §1 (builder+critic) and the splash version note in the changelog. Git history remains the source of truth for the whole repo; this archive is the **fast, intentional** revert for splash craft only.
