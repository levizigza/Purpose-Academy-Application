# Connect purposeacademy.ca (Cloudflare Workers)

The site is a **Vite SPA** deployed with **Wrangler** (`wrangler.jsonc` → `dist/`).
The Express API stays on Render; Cloudflare only hosts the front end + DNS.

## Workers Builds — Create and deploy form

Use these values on [Create an app → Create and deploy](https://dash.cloudflare.com/8d69471dc50a4e0ac0e62180cb887eaa/workers-and-pages/create):

| Field | Value |
|------|--------|
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| **Preview command** | `npx wrangler preview` |
| **Enable Preview builds** | On |
| **Protect with Cloudflare Access** | Off (public student site) |

### Build variables (Workers Builds → Variables / Environment variables)

Add for **Production** (and Preview if you want API calls there):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://purpose-academy-api.onrender.com` |
| `PAGES_BASE` | `/` |

Node: use **22** (or leave default if it is already 22+).

Then click **Deploy**.

## After first deploy — custom domain

1. Workers & Pages → project **`purpose-academy`** → **Settings → Domains**
2. Add `purposeacademy.ca` and optionally `www.purposeacademy.ca`
3. Cloudflare will create/update DNS for the zone automatically when the zone is already on this account

**SSL/TLS → Overview:** **Full** or **Full (strict)**.

**Optional:** Redirect Rule `www.purposeacademy.ca` → `https://purposeacademy.ca` (301).

## Render API CORS

Live API: `https://purpose-academy-api.onrender.com`

In the Render dashboard for `purpose-academy-api`, set:

```text
CORS_ORIGINS=https://purposeacademy.ca,https://www.purposeacademy.ca,https://purpose-academy.<your-subdomain>.workers.dev,https://levizigza.github.io,http://localhost:5173,http://127.0.0.1:5173
```

Replace the `workers.dev` host with the exact URL shown after the first Workers deploy (or omit it once the custom domain is live).

(`render.yaml` already lists the apex / www origins for Blueprint deploys.)

## Local check

```bash
npm run build
npx wrangler deploy   # requires `npx wrangler login` once
# or
npm run deploy:cf
```

```bash
curl -sI https://purposeacademy.ca/ | head -5
# HTML should reference /assets/... (site root)
```

## Notes

- GitHub Pages may still deploy from `.github/workflows/deploy-pages.yml`; Cloudflare Workers is the intended production host for `purposeacademy.ca`.
- Baked `/tts` audio ships inside `dist/` and does not need a Worker API.
- Do **not** point DNS at `levizigza.github.io` if the custom domain is attached to this Workers project.
