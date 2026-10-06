import { api } from '../data/api'
import { isLocalMode } from '../data/store'
import {
  buildAgentBrief,
  inferImpact,
  inferScopes,
  sanitizePreviewPatch,
  statusLabel,
  type ChangeImpact,
  type ChangeRound,
  type ChangeStatus,
  type PracticeChangeTicket,
  type PreviewPatch,
} from './changeLoop'

export type PracticeFeedbackItem = {
  id: string
  author: string
  page: string
  pageTitle: string
  body: string
  kind: 'page' | 'quiz'
  created_at: string
  synced?: boolean
  /** Change-loop fields (optional on legacy notes) */
  status?: ChangeStatus
  impact?: ChangeImpact
  scopes?: string[]
  rounds?: ChangeRound[]
  previewUrl?: string
  patch?: PreviewPatch
  githubIssueUrl?: string
  agentBrief?: string
  updated_at?: string
}

const STORE_KEY = 'pa-practice-feedback-v1'
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribePracticeFeedback(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function readAll(): PracticeFeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PracticeFeedbackItem[]
    return Array.isArray(parsed) ? parsed.map(normalizeItem) : []
  } catch {
    return []
  }
}

function writeAll(items: PracticeFeedbackItem[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
  notify()
}

function id() {
  return `pf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function roundId() {
  return `rd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function normalizeItem(f: PracticeFeedbackItem): PracticeFeedbackItem {
  const scopes = f.scopes?.length ? f.scopes : inferScopes(f.page, f.body)
  const impact = f.impact || inferImpact(scopes)
  const status = f.status || 'queued'
  const rounds =
    f.rounds?.length
      ? f.rounds
      : [
          {
            id: roundId(),
            at: f.created_at,
            by: f.author,
            kind: 'feedback' as const,
            note: f.body,
          },
        ]
  return {
    ...f,
    status,
    impact,
    scopes,
    rounds,
    patch: f.patch ? sanitizePreviewPatch(f.patch) : undefined,
    updated_at: f.updated_at || f.created_at,
    agentBrief:
      f.agentBrief ||
      buildAgentBrief({
        id: f.id,
        author: f.author,
        page: f.page,
        pageTitle: f.pageTitle,
        body: f.body,
        scopes,
        impact,
      }),
  }
}

export function listPracticeFeedback(): PracticeFeedbackItem[] {
  return readAll().sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export function getPracticeFeedback(id: string): PracticeFeedbackItem | undefined {
  return readAll().find((f) => f.id === id)
}

function upsertLocal(item: PracticeFeedbackItem) {
  const all = readAll()
  const idx = all.findIndex((f) => f.id === item.id)
  if (idx >= 0) all[idx] = normalizeItem(item)
  else all.unshift(normalizeItem(item))
  writeAll(all)
  return normalizeItem(item)
}

export async function submitPracticeFeedback(input: {
  author: string
  page: string
  pageTitle: string
  body: string
  kind?: 'page' | 'quiz'
}): Promise<PracticeFeedbackItem> {
  const author = input.author.trim()
  const body = input.body.trim()
  if (!author) throw new Error('Choose your name first.')
  if (!body) throw new Error('Write a short note before sending.')
  if (body.length > 4000) throw new Error('Keep feedback under 4000 characters.')

  const scopes = inferScopes(input.page, body)
  const impact = inferImpact(scopes)
  const created = new Date().toISOString()
  const itemId = id()
  const item: PracticeFeedbackItem = normalizeItem({
    id: itemId,
    author,
    page: input.page.slice(0, 200),
    pageTitle: input.pageTitle.slice(0, 160) || input.page,
    body,
    kind: input.kind || 'page',
    created_at: created,
    synced: false,
    status: 'queued',
    impact,
    scopes,
    rounds: [
      {
        id: roundId(),
        at: created,
        by: author,
        kind: 'feedback',
        note: body,
      },
      {
        id: roundId(),
        at: created,
        by: 'system',
        kind: 'queued',
        note: `Queued as a ${impact} change (${scopes.join(', ') || 'general'}). A fix will open here for your approval before it goes live for everyone.`,
      },
    ],
    updated_at: created,
  })

  upsertLocal(item)

  if (!isLocalMode() || import.meta.env.VITE_API_URL) {
    try {
      const data = await api<{ feedback: PracticeFeedbackItem }>('/api/practice/feedback', {
        method: 'POST',
        json: {
          author: item.author,
          page: item.page,
          pageTitle: item.pageTitle,
          body: item.body,
          kind: item.kind,
          clientId: item.id,
          scopes: item.scopes,
          impact: item.impact,
        },
      })
      const merged = normalizeItem({ ...item, ...data.feedback, synced: true })
      upsertLocal(merged)
      return merged
    } catch {
      /* keep local copy */
    }
  }

  return item
}

export async function fetchPracticeFeedbackFromServer(): Promise<PracticeFeedbackItem[]> {
  if (isLocalMode() && !import.meta.env.VITE_API_URL) {
    return listPracticeFeedback()
  }
  try {
    const data = await api<{ feedback: PracticeFeedbackItem[] }>('/api/practice/feedback')
    const remote = data.feedback || []
    const byId = new Map<string, PracticeFeedbackItem>()
    for (const f of listPracticeFeedback()) byId.set(f.id, f)
    for (const f of remote) byId.set(f.id, normalizeItem({ ...f, synced: true }))
    const merged = [...byId.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    writeAll(merged)
    return merged
  } catch {
    return listPracticeFeedback()
  }
}

/** Public poll for a reviewer's open change tickets (no admin auth). */
export async function fetchMyChangeTickets(author: string): Promise<PracticeFeedbackItem[]> {
  const name = author.trim()
  if (!name) return []
  if (isLocalMode() && !import.meta.env.VITE_API_URL) {
    return listPracticeFeedback().filter(
      (f) => f.author === name && f.status && !['shipped', 'dismissed'].includes(f.status),
    )
  }
  try {
    const data = await api<{ feedback: PracticeFeedbackItem[] }>(
      `/api/practice/feedback/mine?author=${encodeURIComponent(name)}`,
    )
    const remote = (data.feedback || []).map((f) => normalizeItem({ ...f, synced: true }))
    for (const f of remote) upsertLocal(f)
    return remote
  } catch {
    return listPracticeFeedback().filter(
      (f) => f.author === name && f.status && !['shipped', 'dismissed'].includes(f.status),
    )
  }
}

export async function reviewPracticeChange(input: {
  id: string
  author: string
  action: 'approve' | 'iterate'
  note?: string
}): Promise<PracticeFeedbackItem> {
  const author = input.author.trim()
  const note = (input.note || '').trim()
  if (!author) throw new Error('Choose your name first.')
  if (input.action === 'iterate' && !note) {
    throw new Error('Say what still needs to change.')
  }

  const local = getPracticeFeedback(input.id)
  if (!local) throw new Error('Change request not found on this device.')

  if (!isLocalMode() || import.meta.env.VITE_API_URL) {
    try {
      const data = await api<{ feedback: PracticeFeedbackItem }>(
        `/api/practice/feedback/${encodeURIComponent(input.id)}/review`,
        {
          method: 'POST',
          json: { author, action: input.action, note },
        },
      )
      return upsertLocal({ ...data.feedback, synced: true })
    } catch (err) {
      // Fall through to local-only update when API unreachable
      if (!(isLocalMode() && !import.meta.env.VITE_API_URL)) {
        // still allow local iteration offline
      }
    }
  }

  const now = new Date().toISOString()
  const rounds = [...(local.rounds || [])]
  if (input.action === 'approve') {
    rounds.push({
      id: roundId(),
      at: now,
      by: author,
      kind: 'approval',
      note: note || 'Approved — ready to ship to the live site.',
    })
    return upsertLocal({
      ...local,
      status: 'approved',
      rounds,
      updated_at: now,
      synced: false,
    })
  }
  rounds.push({
    id: roundId(),
    at: now,
    by: author,
    kind: 'iteration_request',
    note,
  })
  return upsertLocal({
    ...local,
    status: 'needs_iteration',
    rounds,
    updated_at: now,
    synced: false,
  })
}

export async function adminUpdatePracticeChange(input: {
  id: string
  status?: ChangeStatus
  previewUrl?: string
  patch?: PreviewPatch | null
  note?: string
  by?: string
}): Promise<PracticeFeedbackItem> {
  const data = await api<{ feedback: PracticeFeedbackItem }>(
    `/api/practice/feedback/${encodeURIComponent(input.id)}`,
    {
      method: 'PATCH',
      json: {
        status: input.status,
        previewUrl: input.previewUrl,
        patch: input.patch === null ? null : input.patch,
        note: input.note,
        by: input.by || 'admin',
      },
    },
  )
  return upsertLocal({ ...data.feedback, synced: true })
}

/** Local-only propose (when API offline) for Practice demo / Pages static mode. */
export function localProposePracticeChange(input: {
  id: string
  previewUrl?: string
  patch?: PreviewPatch
  note?: string
  by?: string
}): PracticeFeedbackItem {
  const local = getPracticeFeedback(input.id)
  if (!local) throw new Error('Change request not found.')
  const now = new Date().toISOString()
  const patch = input.patch ? sanitizePreviewPatch(input.patch) : local.patch
  const rounds = [...(local.rounds || [])]
  rounds.push({
    id: roundId(),
    at: now,
    by: input.by || 'builder',
    kind: 'proposal',
    note: input.note || patch?.summary || 'Preview ready for review.',
    previewUrl: input.previewUrl,
    patchSummary: patch?.summary,
  })
  return upsertLocal({
    ...local,
    status: 'preview_ready',
    previewUrl: input.previewUrl || local.previewUrl,
    patch: patch || undefined,
    rounds,
    updated_at: now,
    synced: false,
  })
}

export function exportPracticeFeedbackJson(): string {
  return JSON.stringify(listPracticeFeedback(), null, 2)
}

export function clearLocalPracticeFeedback() {
  writeAll([])
}

/** Local status bump when API is unreachable (Practice / Pages). */
export function localSetChangeStatus(id: string, status: ChangeStatus, by = 'admin'): PracticeFeedbackItem {
  const local = getPracticeFeedback(id)
  if (!local) throw new Error('Change request not found.')
  const now = new Date().toISOString()
  const rounds = [...(local.rounds || [])]
  rounds.push({
    id: roundId(),
    at: now,
    by,
    kind: status === 'shipped' ? 'ship' : status === 'dismissed' ? 'dismiss' : 'queued',
    note: `Status → ${status}`,
  })
  return upsertLocal({
    ...local,
    status,
    rounds,
    updated_at: now,
    synced: false,
  })
}

export function describeChangeTicket(f: PracticeFeedbackItem): string {
  const status = statusLabel(f.status || 'queued')
  return `${status} · ${f.impact || 'local'} · ${(f.scopes || []).slice(0, 3).join(', ')}`
}

export type { PracticeChangeTicket, PreviewPatch, ChangeStatus }
