# Security

Purpose Academy API security controls (free/open-source, no paid WAF required for this demo).

## Controls in place

| Control | Where |
|---------|--------|
| Password hashing (bcrypt) | `server/src/db.js`, auth routes |
| JWT auth + role guards | `server/src/auth.js`, routes |
| Rate limiting (API + auth) | `server/src/security.js` |
| Security headers | `X-Frame-Options`, `nosniff`, CSP, Referrer-Policy |
| CORS allowlist | `server/src/index.js` (`CORS_ORIGINS`) |
| JSON body size limit | 64kb |
| Input sanitization | strips controls / HTML-like chars |
| Prompt-injection blocking | free-text fields via `guardUserText` |
| Audit events | login failures, injection blocks, approvals, grades, safety overrides |

## Prompt-injection protection

Free-text fields (assignment answers, feedback, observation notes, announcements, names/addresses) are scanned for common override / jailbreak patterns such as:

- “ignore previous instructions”
- “reveal system prompt”
- role-play jailbreaks / DAN-style prompts
- fake `system` / `assistant` tags

Blocked submissions return `400` with `code: PROMPT_INJECTION_BLOCKED` and are audited.

This is a **defense-in-depth filter**, not a guarantee. When you add an LLM tutor later, keep:

1. This server-side gate
2. Strict system prompts that treat user text as untrusted data
3. No tool/admin privileges available to model output

## Test scan endpoint

Authenticated:

`POST /api/security/scan-text` `{ "text": "..." }`

## Production next steps

- HTTPS termination + managed secrets (`JWT_SECRET`)
- MFA for admin
- Postgres + backups
- WAF / bot protection at the edge
- Dependency scanning in CI
