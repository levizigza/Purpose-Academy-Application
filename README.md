# Purpose Academy — Construction School

Calgary construction school platform:

- **Foundations + apprenticeship pathway** for construction learners
- **Frontend:** Vite + React + TypeScript
- **Backend:** Express (Node) + persistent JSON database
- **Auth:** JWT + bcrypt password hashes

Public site structure (inspired by Alberta trade schools such as SAIT): Programs · Admissions · About · Give · Contact.

## Security & UX

- Security controls: see [SECURITY.md](./SECURITY.md)
- Honest UX review + fixes: see [UX_REVIEW.md](./UX_REVIEW.md)

## Run the full stack

```bash
npm install
npm install --prefix server
npm run dev
```

- Web: `http://localhost:5173` (Vite proxies `/api` → API)
- API: `http://localhost:8787`

Useful checks:

- `GET http://localhost:8787/api/health`
- `GET http://localhost:8787/api/enrich/quote`
- `GET http://localhost:8787/api/enrich/calgary`

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Student (approved) | `student@purposeacademy.ca` | `student123` |
| Student (pending) | `pending@purposeacademy.ca` | `pending123` |
| Instructor | `instructor@purposeacademy.ca` | `instructor123` |
| Admin | `admin@purposeacademy.ca` | `admin123` |

## Login troubleshooting

1. Run **both** API and web: `npm run dev` (not `dev:web` alone).
2. Open `http://127.0.0.1:5173/login` — the splash screen no longer blocks sign-in links.
3. API health: `http://127.0.0.1:8787/api/health`
4. On GitHub Pages, the site runs in **browser demo mode** (no server). Use the demo accounts, or click **Reset demo data** on the sign-in page if local storage got corrupted.
5. Smoke tests: `npm run smoke:auth` (API) and `npm run test:e2e` (browser, with `npm run dev` running).

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | API + web together |
| `npm run dev:api` | API only |
| `npm run dev:web` | Vite only (needs API for login) |
| `npm run build` | Typecheck + production web build |
| `npm run start:api` | Production API start |
| `npm run smoke:auth` | API auth smoke test |
| `npm run test:e2e` | Browser login/register/approve E2E |
| `npm run test:site` | Browser route coverage E2E |
| `npm run seed --prefix server` | Reseed the JSON database |

## Public APIs wired in

| API | Use in Purpose Academy |
|-----|------------------------|
| [Free Dictionary](https://dictionaryapi.dev/) | Live definitions + pronunciation audio for vocabulary |
| [MyMemory Translation](https://mymemory.translated.net/) | Support-language bridge for definitions |
| [Lorem Picsum](https://picsum.photos/) | Visual anchors for vocabulary cards |
| [Quotable](https://github.com/lukePeavey/quotable) | Learner home encouragement quote |
| [Nominatim](https://nominatim.org/) + [Open-Meteo](https://open-meteo.com/) | Calgary place + weather on public/home screens |
| [Zippopotam.us](http://www.zippopotam.us) | Canadian postal lookup (`/api/enrich/postal/:code`) |
| [Universities List](https://github.com/Hipo/university-domains-list) | Canadian institutions (`/api/enrich/universities`) |
| [Httpbin](https://httpbin.org/) | API health connectivity probe |

## Architecture

```
Browser (React)  --/api-->  Express API  -->  server/data/purpose-academy.json
                                |
                                +--> Free public APIs (dictionary, translate, weather, …)
```

Server data file is created on first boot from the Construction-first curriculum seed.

## Notes

- Competent status still requires instructor observation (PA-TECH-003 rule).
- Construction is the active pathway; Logistics / Community remain gated.
- For true production later: swap JSON file for Postgres, add HTTPS hosting, MFA, and PIPA controls.
