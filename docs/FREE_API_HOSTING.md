# Free live API hosting (neural TTS + auth)

GitHub Pages only serves the static site. The Express API (`server/`) needs a free host so `/api/enrich/tts` and the other public APIs work live.

## Best option: Render (recommended)

**Why:** Real free web service, no credit card, HTTPS URL, GitHub deploy. Free instances sleep after ~15 minutes idle (cold start ~30–60s). Baked `public/tts` clips keep vocab audio instant while the API wakes.

**Live service (already deployed):** `https://purpose-academy-api.onrender.com`

GitHub Pages builds pick this up from `.env.production` / the Pages workflow (`VITE_API_URL`). Override with a repo Actions variable named `VITE_API_URL` if the URL changes.

One-click Blueprint (uses `render.yaml`) if you need to recreate the service:

[Deploy to Render](https://render.com/deploy?repo=https://github.com/levizigza/Purpose-Academy-Application)

Smoke test:

```bash
curl -sI "https://purpose-academy-api.onrender.com/api/health"
curl -sI "https://purpose-academy-api.onrender.com/api/enrich/tts?lang=en&text=Hammer"
# Expect: X-PA-TTS-Voice: en-US-JennyNeural
```

## Other free / freemium hosts

| Host | Free credentials? | Card? | Notes for this API |
|------|-------------------|-------|--------------------|
| **[Render](https://render.com/docs/free)** | Yes — GitHub login | No | Best fit. Blueprint in `render.yaml`. Sleeps when idle. |
| **[Railway](https://railway.com/pricing)** | Trial `$5` then `$1`/mo credit | No for trial | Not enough credit for always-on; OK for short demos. |
| **[Fly.io](https://fly.io)** | No free tier for new users | Yes | Skip unless you already have an account. |
| **[Koyeb](https://www.koyeb.com)** | Free instance | Often card verify | Works, more signup friction. |
| **[Cloudflare Workers](https://workers.cloudflare.com)** | Free | No | Not a drop-in for Express + `msedge-tts` WebSockets. |
| **Railway `ssh railway.new`** | Temp VM, no account | No | Preview locked to your IP; expires unless claimed. Not for GitHub Pages users. |

`public-apis` lists **data** APIs (dictionary, weather, etc.) — not places that give you a free server. Those stay called **from** our Express API once it is hosted.

## What this repo already wires

- `render.yaml` — free Render web service for `server/`
- Pages workflow reads `vars.VITE_API_URL` at build time
- Student audio order: baked Edge MP3s → live `/api/enrich/tts` → dictionary → browser speech

After you deploy Render and set `VITE_API_URL`, the live Pages app uses the hosted API for neural TTS and the other enrich endpoints.
