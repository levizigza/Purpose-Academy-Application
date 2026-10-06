/**
 * Practice change loop — feedback → isolated preview → approve / iterate → ship.
 *
 * Safety rules:
 * - Raw feedback never mutates the live site for everyone.
 * - Previews apply only in this browser session (Practice reviewers).
 * - Only allowlisted patch fields (copy keys, CSS vars, vocab term fields).
 * - One sitewide/shared in-flight change per scope; local page patches may run in parallel.
 */

export type ChangeStatus =
  | 'noted'
  | 'queued'
  | 'in_progress'
  | 'preview_ready'
  | 'needs_iteration'
  | 'approved'
  | 'shipped'
  | 'dismissed'

export type ChangeImpact = 'local' | 'shared' | 'sitewide'

export type ChangeRoundKind =
  | 'feedback'
  | 'queued'
  | 'proposal'
  | 'iteration_request'
  | 'approval'
  | 'ship'
  | 'dismiss'

export type ChangeRound = {
  id: string
  at: string
  by: string
  kind: ChangeRoundKind
  note: string
  previewUrl?: string
  patchSummary?: string
}

/** Safe, allowlisted preview overlay — no arbitrary HTML/JS. */
export type PreviewPatch = {
  id: string
  summary: string
  /** CSS custom properties on :root (must start with --) */
  cssVars?: Record<string, string>
  /** Text for elements marked [data-pa-copy="key"] */
  copy?: Record<string, string>
  /** Logistics/construction/community vocab field overrides (session-only) */
  vocab?: {
    pathway?: 'logistics' | 'construction' | 'community'
    termId: string
    definition?: string
    sentence?: string
    english?: string
    gloss?: Partial<Record<'am' | 'ti' | 'ar' | 'es' | 'hi', string>>
    imageKey?: string
  }[]
}

export type PracticeChangeTicket = {
  status: ChangeStatus
  impact: ChangeImpact
  /** Scope tags used for conflict detection, e.g. vocab:cart, page:/journey */
  scopes: string[]
  rounds: ChangeRound[]
  previewUrl?: string
  patch?: PreviewPatch
  githubIssueUrl?: string
  agentBrief?: string
  updated_at: string
}

const ACTIVE_PATCH_KEY = 'pa-active-preview-patch-v1'
const ACTIVE_TICKET_KEY = 'pa-active-preview-ticket-v1'

const CSS_VAR_RE = /^--[a-z0-9-]+$/i
const HEX_OR_CSS_VALUE_RE = /^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z0-9%.\s_-]+)$/i

export function inferScopes(page: string, body: string): string[] {
  const scopes = new Set<string>()
  const path = (page || '/').split('?')[0] || '/'
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
    if (new RegExp(`\\b${word}\\b`, 'i').test(body)) scopes.add(`vocab:${word}`)
  }
  return [...scopes]
}

export function inferImpact(scopes: string[]): ChangeImpact {
  if (scopes.some((s) => s === 'domain:chrome' || s.startsWith('page:/') && s === 'page:/')) {
    return 'sitewide'
  }
  if (scopes.some((s) => s.startsWith('domain:'))) return 'shared'
  return 'local'
}

export function buildAgentBrief(input: {
  id: string
  author: string
  page: string
  pageTitle: string
  body: string
  scopes: string[]
  impact: ChangeImpact
}): string {
  return [
    `Practice change request ${input.id}`,
    `Author: ${input.author}`,
    `Page: ${input.pageTitle} (${input.page})`,
    `Impact: ${input.impact}`,
    `Scopes: ${input.scopes.join(', ') || 'none'}`,
    '',
    'Feedback:',
    input.body,
    '',
    'Required workflow:',
    '1. Implement on an isolated branch (do not push unreviewed changes to main).',
    '2. Keep the change scoped to the scopes above; avoid unrelated refactors.',
    '3. Attach a preview URL and/or a safe PreviewPatch on this ticket.',
    '4. Set status to preview_ready and wait for Practice approve / needs_iteration.',
    '5. Iterate until approved, then merge and mark shipped.',
  ].join('\n')
}

export function sanitizePreviewPatch(raw: unknown): PreviewPatch | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const src = raw as Record<string, unknown>
  const id = String(src.id || `patch-${Date.now().toString(36)}`).slice(0, 80)
  const summary = String(src.summary || 'Proposed fix').slice(0, 240)
  const patch: PreviewPatch = { id, summary }

  if (src.cssVars && typeof src.cssVars === 'object') {
    const cssVars: Record<string, string> = {}
    for (const [k, v] of Object.entries(src.cssVars as Record<string, unknown>)) {
      if (!CSS_VAR_RE.test(k)) continue
      const value = String(v).slice(0, 80)
      if (!HEX_OR_CSS_VALUE_RE.test(value)) continue
      cssVars[k] = value
    }
    if (Object.keys(cssVars).length) patch.cssVars = cssVars
  }

  if (src.copy && typeof src.copy === 'object') {
    const copy: Record<string, string> = {}
    for (const [k, v] of Object.entries(src.copy as Record<string, unknown>)) {
      const key = k.replace(/[^a-z0-9._-]/gi, '').slice(0, 80)
      if (!key) continue
      copy[key] = String(v).slice(0, 500)
    }
    if (Object.keys(copy).length) patch.copy = copy
  }

  if (Array.isArray(src.vocab)) {
    const vocab: NonNullable<PreviewPatch['vocab']> = []
    for (const row of src.vocab.slice(0, 40)) {
      if (!row || typeof row !== 'object') continue
      const r = row as Record<string, unknown>
      const termId = String(r.termId || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40)
      if (!termId) continue
      const entry: NonNullable<PreviewPatch['vocab']>[number] = { termId }
      const pathway = String(r.pathway || '')
      if (pathway === 'logistics' || pathway === 'construction' || pathway === 'community') {
        entry.pathway = pathway
      }
      if (typeof r.definition === 'string') entry.definition = r.definition.slice(0, 400)
      if (typeof r.sentence === 'string') entry.sentence = r.sentence.slice(0, 240)
      if (typeof r.english === 'string') entry.english = r.english.slice(0, 80)
      if (typeof r.imageKey === 'string') {
        entry.imageKey = r.imageKey.replace(/[^a-z0-9_-]/gi, '').slice(0, 40)
      }
      if (r.gloss && typeof r.gloss === 'object') {
        const gloss: NonNullable<typeof entry.gloss> = {}
        for (const lang of ['am', 'ti', 'ar', 'es', 'hi'] as const) {
          const g = (r.gloss as Record<string, unknown>)[lang]
          if (typeof g === 'string' && g.trim()) gloss[lang] = g.slice(0, 80)
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

export function ticketsConflict(aScopes: string[], bScopes: string[], aImpact: ChangeImpact, bImpact: ChangeImpact) {
  if (aImpact === 'sitewide' || bImpact === 'sitewide') return true
  if (aImpact === 'shared' && bImpact === 'shared') {
    return aScopes.some((s) => bScopes.includes(s) && s.startsWith('domain:'))
  }
  return aScopes.some((s) => bScopes.includes(s) && (s.startsWith('vocab:') || s.startsWith('domain:')))
}

export function getActivePreviewTicketId(): string | null {
  try {
    return sessionStorage.getItem(ACTIVE_TICKET_KEY)
  } catch {
    return null
  }
}

export function getActivePreviewPatch(): PreviewPatch | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_PATCH_KEY)
    if (!raw) return null
    return sanitizePreviewPatch(JSON.parse(raw)) || null
  } catch {
    return null
  }
}

export function setActivePreview(ticketId: string, patch: PreviewPatch | null) {
  try {
    if (!patch) {
      sessionStorage.removeItem(ACTIVE_PATCH_KEY)
      sessionStorage.removeItem(ACTIVE_TICKET_KEY)
    } else {
      sessionStorage.setItem(ACTIVE_PATCH_KEY, JSON.stringify(patch))
      sessionStorage.setItem(ACTIVE_TICKET_KEY, ticketId)
    }
  } catch {
    /* ignore */
  }
  applyPreviewPatchToDom(patch)
  window.dispatchEvent(new CustomEvent('pa-preview-patch-changed', { detail: { ticketId, patch } }))
}

export function clearActivePreview() {
  setActivePreview('', null)
}

/** Apply allowlisted CSS vars + data-pa-copy text. Vocab overrides are read by pack helpers. */
export function applyPreviewPatchToDom(patch: PreviewPatch | null) {
  const root = document.documentElement
  // Clear previous vars we may have set
  for (const attr of [...root.attributes]) {
    if (attr.name.startsWith('data-pa-preview-var-')) {
      const varName = attr.name.slice('data-pa-preview-var-'.length)
      root.style.removeProperty(`--${varName}`)
      root.removeAttribute(attr.name)
    }
  }
  root.removeAttribute('data-pa-previewing')

  if (!patch) {
    document.querySelectorAll('[data-pa-copy][data-pa-copy-original]').forEach((el) => {
      const original = el.getAttribute('data-pa-copy-original')
      if (original != null) el.textContent = original
      el.removeAttribute('data-pa-copy-original')
    })
    return
  }

  root.setAttribute('data-pa-previewing', patch.id)
  if (patch.cssVars) {
    for (const [name, value] of Object.entries(patch.cssVars)) {
      root.style.setProperty(name, value)
      root.setAttribute(`data-pa-preview-var-${name.slice(2)}`, '1')
    }
  }
  if (patch.copy) {
    for (const [key, text] of Object.entries(patch.copy)) {
      const safeKey = key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      document.querySelectorAll(`[data-pa-copy="${safeKey}"]`).forEach((el) => {
        if (!el.hasAttribute('data-pa-copy-original')) {
          el.setAttribute('data-pa-copy-original', el.textContent || '')
        }
        el.textContent = text
      })
    }
  }
}

export function vocabOverridesFromActivePatch(pathway?: string) {
  const patch = getActivePreviewPatch()
  if (!patch?.vocab?.length) return [] as NonNullable<PreviewPatch['vocab']>
  return patch.vocab.filter((v) => !v.pathway || !pathway || v.pathway === pathway)
}

export function statusLabel(status: ChangeStatus): string {
  switch (status) {
    case 'noted':
      return 'Noted'
    case 'queued':
      return 'Queued for fix'
    case 'in_progress':
      return 'Fix in progress'
    case 'preview_ready':
      return 'Preview ready — review'
    case 'needs_iteration':
      return 'Needs another pass'
    case 'approved':
      return 'Approved'
    case 'shipped':
      return 'Shipped live'
    case 'dismissed':
      return 'Dismissed'
    default:
      return status
  }
}
