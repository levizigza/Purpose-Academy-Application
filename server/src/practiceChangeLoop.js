/** Server-side Practice change-loop helpers (mirrors client safety rules). */

const OPEN_STATUSES = new Set([
  'noted',
  'queued',
  'in_progress',
  'preview_ready',
  'needs_iteration',
  'approved',
])

const CSS_VAR_RE = /^--[a-z0-9-]+$/i
const HEX_OR_CSS_VALUE_RE = /^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z0-9%.\s_-]+)$/i

export function inferScopes(page, body) {
  const scopes = new Set()
  const path = String(page || '/').split('?')[0] || '/'
  scopes.add(`page:${path}`)
  const text = `${page} ${body}`.toLowerCase()
  if (/vocab|word|translation|gloss|sentence|definition|cart|dolly|image|photo|picture/.test(text)) {
    scopes.add('domain:vocab')
  }
  if (/nav|header|footer|banner|layout|homepage|hero/.test(text)) {
    scopes.add('domain:chrome')
  }
  if (/tts|audio|speak|voice|sound/.test(text)) {
    scopes.add('domain:audio')
  }
  if (/quiz|eye.?spy|assessment/.test(text)) {
    scopes.add('domain:quiz')
  }
  for (const word of ['cart', 'dolly', 'bag', 'bin', 'pallet', 'rack', 'shelf']) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(body || '')) scopes.add(`vocab:${word}`)
  }
  return [...scopes]
}

export function inferImpact(scopes) {
  if (scopes.some((s) => s === 'domain:chrome' || s === 'page:/')) return 'sitewide'
  if (scopes.some((s) => s.startsWith('domain:'))) return 'shared'
  return 'local'
}

export function buildAgentBrief({ id, author, page, pageTitle, body, scopes, impact }) {
  return [
    `Practice change request ${id}`,
    `Author: ${author}`,
    `Page: ${pageTitle} (${page})`,
    `Impact: ${impact}`,
    `Scopes: ${(scopes || []).join(', ') || 'none'}`,
    '',
    'Feedback:',
    body,
    '',
    'Required workflow:',
    '1. Implement on an isolated branch (do not push unreviewed changes to main).',
    '2. Keep the change scoped to the scopes above; avoid unrelated refactors.',
    '3. Attach a preview URL and/or a safe PreviewPatch on this ticket.',
    '4. Set status to preview_ready and wait for Practice approve / needs_iteration.',
    '5. Iterate until approved, then merge and mark shipped.',
  ].join('\n')
}

export function sanitizePreviewPatch(raw) {
  if (!raw || typeof raw !== 'object') return undefined
  const id = String(raw.id || `patch-${Date.now().toString(36)}`).slice(0, 80)
  const summary = String(raw.summary || 'Proposed fix').slice(0, 240)
  const patch = { id, summary }

  if (raw.cssVars && typeof raw.cssVars === 'object') {
    const cssVars = {}
    for (const [k, v] of Object.entries(raw.cssVars)) {
      if (!CSS_VAR_RE.test(k)) continue
      const value = String(v).slice(0, 80)
      if (!HEX_OR_CSS_VALUE_RE.test(value)) continue
      cssVars[k] = value
    }
    if (Object.keys(cssVars).length) patch.cssVars = cssVars
  }

  if (raw.copy && typeof raw.copy === 'object') {
    const copy = {}
    for (const [k, v] of Object.entries(raw.copy)) {
      const key = String(k).replace(/[^a-z0-9._-]/gi, '').slice(0, 80)
      if (!key) continue
      copy[key] = String(v).slice(0, 500)
    }
    if (Object.keys(copy).length) patch.copy = copy
  }

  if (Array.isArray(raw.vocab)) {
    const vocab = []
    for (const row of raw.vocab.slice(0, 40)) {
      if (!row || typeof row !== 'object') continue
      const termId = String(row.termId || '')
        .replace(/[^a-z0-9_-]/gi, '')
        .slice(0, 40)
      if (!termId) continue
      const entry = { termId }
      if (['logistics', 'construction', 'community'].includes(row.pathway)) entry.pathway = row.pathway
      if (typeof row.definition === 'string') entry.definition = row.definition.slice(0, 400)
      if (typeof row.sentence === 'string') entry.sentence = row.sentence.slice(0, 240)
      if (typeof row.english === 'string') entry.english = row.english.slice(0, 80)
      if (typeof row.imageKey === 'string') {
        entry.imageKey = String(row.imageKey)
          .replace(/[^a-z0-9_-]/gi, '')
          .slice(0, 40)
      }
      if (row.gloss && typeof row.gloss === 'object') {
        const gloss = {}
        for (const lang of ['am', 'ti', 'ar', 'es', 'hi']) {
          if (typeof row.gloss[lang] === 'string' && row.gloss[lang].trim()) {
            gloss[lang] = row.gloss[lang].slice(0, 80)
          }
        }
        if (Object.keys(gloss).length) entry.gloss = gloss
      }
      vocab.push(entry)
    }
    if (vocab.length) patch.vocab = vocab
  }

  if (!patch.cssVars && !patch.copy && !patch.vocab) return undefined
  return patch
}

export function ticketsConflict(aScopes, bScopes, aImpact, bImpact) {
  if (aImpact === 'sitewide' || bImpact === 'sitewide') return true
  if (aImpact === 'shared' && bImpact === 'shared') {
    return (aScopes || []).some((s) => (bScopes || []).includes(s) && s.startsWith('domain:'))
  }
  return (aScopes || []).some(
    (s) => (bScopes || []).includes(s) && (s.startsWith('vocab:') || s.startsWith('domain:')),
  )
}

export function findBlockingTicket(db, candidate, ignoreId) {
  const list = Array.isArray(db.practice_feedback) ? db.practice_feedback : []
  return list.find((f) => {
    if (!f || f.id === ignoreId) return false
    if (!OPEN_STATUSES.has(f.status) || f.status === 'queued' || f.status === 'noted') return false
    if (!['in_progress', 'preview_ready', 'needs_iteration', 'approved'].includes(f.status)) return false
    return ticketsConflict(candidate.scopes, f.scopes, candidate.impact, f.impact)
  })
}

export function roundId() {
  return `rd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export async function maybeCreateGithubIssue(entry) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  const repo = process.env.GITHUB_REPO || process.env.GH_REPO
  if (!token || !repo) return undefined
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'purpose-academy-practice-loop',
      },
      body: JSON.stringify({
        title: `[Practice] ${entry.pageTitle}: ${String(entry.body).slice(0, 72)}`,
        body: entry.agentBrief || entry.body,
        labels: ['practice-feedback', 'change-request', `impact:${entry.impact}`],
      }),
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return data.html_url
  } catch {
    return undefined
  }
}

export { OPEN_STATUSES }
