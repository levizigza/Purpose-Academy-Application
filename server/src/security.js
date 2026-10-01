/**
 * Purpose Academy security controls
 * - HTTP hardening headers
 * - Rate limiting
 * - Input length / type validation
 * - XSS-oriented text sanitization
 * - Prompt-injection detection for free-text fields
 */

import { randomUUID } from 'node:crypto'

const RATE_WINDOW_MS = 60_000
const RATE_MAX_DEFAULT = Number(process.env.API_RATE_MAX) || 300
const RATE_MAX_AUTH = Number(process.env.AUTH_RATE_MAX) || 60

const buckets = new Map()

function clientKey(req) {
  return (
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

export function rateLimit({ max = RATE_MAX_DEFAULT, windowMs = RATE_WINDOW_MS, name = 'default' } = {}) {
  return (req, res, next) => {
    const key = `${name}:${clientKey(req)}`
    const now = Date.now()
    let entry = buckets.get(key)
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 }
      buckets.set(key, entry)
    }
    entry.count += 1
    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)))
    if (entry.count > max) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a minute and try again.',
        code: 'RATE_LIMITED',
      })
    }
    next()
  }
}

export const authRateLimit = rateLimit({ max: RATE_MAX_AUTH, name: 'auth' })
export const apiRateLimit = rateLimit({ max: RATE_MAX_DEFAULT, name: 'api' })

export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
    ].join('; '),
  )
  // API responses are JSON; browsers still benefit from these headers.
  next()
}

/** Strip control chars and HTML/script-looking markup from plain text. */
export function sanitizeText(input, { maxLen = 5000 } = {}) {
  if (input == null) return ''
  let text = String(input)
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  text = text.replace(/[<>]/g, (ch) => (ch === '<' ? '‹' : '›'))
  text = text.replace(/javascript:/gi, 'blocked:')
  text = text.replace(/data:text\/html/gi, 'blocked:')
  if (text.length > maxLen) text = text.slice(0, maxLen)
  return text.trim()
}

/**
 * Prompt-injection patterns aimed at instruction override / jailbreak /
 * system-prompt exfiltration. Applied to learner free text before storage
 * or before any future LLM enrichment.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /forget\s+(everything|all|your)\s+(instructions|rules|prompt)/i,
  /you\s+are\s+now\s+(dan|jailbroken|unrestricted|developer\s+mode)/i,
  /\bdo\s+anything\s+now\b/i,
  /\bjailbreak\b/i,
  /system\s*prompt/i,
  /reveal\s+(your|the)\s+(system|hidden)\s+(prompt|instructions)/i,
  /<\/?\s*(system|assistant|instruction)\s*>/i,
  /\[\[\s*system\s*\]\]/i,
  /begin\s+system\s+message/i,
  /new\s+instructions\s*:/i,
  /override\s+(safety|policy|guardrails)/i,
  /act\s+as\s+if\s+you\s+have\s+no\s+restrictions/i,
  /prompt\s*injection/i,
  /exfiltrate/i,
]

export function scanPromptInjection(text) {
  const value = String(text || '')
  const hits = INJECTION_PATTERNS.filter((re) => re.test(value)).map((re) => re.source)
  return {
    blocked: hits.length > 0,
    hits,
    risk: hits.length === 0 ? 'none' : hits.length === 1 ? 'medium' : 'high',
  }
}

/**
 * Sanitize + block prompt injection for user-authored content.
 * Returns { ok, value, error?, scan }
 */
export function guardUserText(input, { field = 'text', maxLen = 5000, allowEmpty = false } = {}) {
  const value = sanitizeText(input, { maxLen })
  if (!value && !allowEmpty) {
    return { ok: false, value: '', error: `${field} is required.`, scan: { blocked: false, hits: [], risk: 'none' } }
  }
  const scan = scanPromptInjection(value)
  if (scan.blocked) {
    return {
      ok: false,
      value: '',
      error:
        'That text looks like an instruction override or prompt-injection attempt. Please rewrite your answer in plain language about your learning work only.',
      scan,
      code: 'PROMPT_INJECTION_BLOCKED',
    }
  }
  return { ok: true, value, scan }
}

export function requireJsonObject(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next()
  // Empty POSTs (e.g. admin reset) arrive with undefined body from express.json —
  // treat as {}. Reject only non-objects / arrays.
  if (req.body == null) {
    req.body = {}
  }
  if (typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.', code: 'INVALID_BODY' })
  }
  next()
}

/** Simple email shape check — not a full RFC validator. */
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function clampNumber(value, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.min(max, Math.max(min, n))
}

export function auditSecurityEvent(db, actor_uid, action, detail) {
  db.audit_events.unshift({
    id: `sec-${randomUUID().slice(0, 8)}`,
    actor_uid: actor_uid || 'anonymous',
    action,
    target: 'security',
    previous_value: '',
    new_value: detail,
    reason: 'automated security control',
    at: new Date().toISOString(),
  })
}
