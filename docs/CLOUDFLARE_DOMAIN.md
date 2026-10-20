# Connect purposeacademy.ca (Cloudflare → GitHub Pages)

The site builds for the **apex domain** (`base: /`, `public/CNAME` → `purposeacademy.ca`).
GitHub Actions still deploys the static build; Cloudflare only owns DNS + optional CDN proxy.

## 1. Cloudflare DNS

Open: [Cloudflare → purposeacademy.ca](https://dash.cloudflare.com/8d69471dc50a4e0ac0e62180cb887eaa/purposeacademy.ca)

**DNS → Records** — add or edit:

| Type | Name | Target / content | Proxy |
|------|------|------------------|-------|
| **CNAME** | `@` | `levizigza.github.io` | Proxied (orange) — Cloudflare flattens apex |
| **CNAME** | `www` | `levizigza.github.io` | Proxied (orange) |

If Cloudflare rejects apex CNAME, use GitHub Pages A records instead for `@`:

| Type | Name | IPv4 |
|------|------|------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Remove any old parking / placeholder A/AAAA records that conflict.

**SSL/TLS → Overview:** set encryption mode to **Full** (or **Full (strict)** after GitHub finishes the cert).

**Optional:** Rules → Redirect `www.purposeacademy.ca` → `https://purposeacademy.ca` (301).

## 2. GitHub Pages custom domain

Repo: [Purpose-Academy-Application](https://github.com/levizigza/Purpose-Academy-Application) → **Settings → Pages**

1. Under **Custom domain**, enter `purposeacademy.ca` → **Save**
2. Wait until DNS check is green (can take a few minutes after Cloudflare records propagate)
3. Enable **Enforce HTTPS**

`public/CNAME` in this repo keeps the domain attached on each deploy.

## 3. Render API CORS

Live API: `https://purpose-academy-api.onrender.com`

In the Render dashboard for `purpose-academy-api`, set:

```text
CORS_ORIGINS=https://purposeacademy.ca,https://www.purposeacademy.ca,https://levizigza.github.io,http://localhost:5173,http://127.0.0.1:5173
```

(`render.yaml` already lists these for new Blueprint deploys.)

## 4. Verify

```bash
curl -sI https://purposeacademy.ca/ | head -5
curl -sI https://www.purposeacademy.ca/ | head -5
# HTML should reference /assets/... (not /Purpose-Academy-Application/assets/...)
```

Open `https://purposeacademy.ca/` — splash, Practice, and API calls should work.

## Notes

- Until the custom domain is saved in GitHub Pages, the old project URL `https://levizigza.github.io/Purpose-Academy-Application/` may 404 asset paths (build now uses `/`). Finish steps 1–2 soon after merging.
- Baked `/tts` audio and the static SPA do not require Cloudflare Workers.
