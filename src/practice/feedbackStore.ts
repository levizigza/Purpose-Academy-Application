import { api } from '../data/api'
import { isLocalMode } from '../data/store'

export type PracticeFeedbackItem = {
  id: string
  author: string
  page: string
  pageTitle: string
  body: string
  kind: 'page' | 'quiz'
  created_at: string
  synced?: boolean
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
    return Array.isArray(parsed) ? parsed : []
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

export function listPracticeFeedback(): PracticeFeedbackItem[] {
  return readAll().sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
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

  const item: PracticeFeedbackItem = {
    id: id(),
    author,
    page: input.page.slice(0, 200),
    pageTitle: input.pageTitle.slice(0, 160) || input.page,
    body,
    kind: input.kind || 'page',
    created_at: new Date().toISOString(),
    synced: false,
  }

  const all = readAll()
  all.unshift(item)
  writeAll(all)

  // Always try API when not pure static Pages, or when VITE_API_URL is set.
  if (!isLocalMode() || import.meta.env.VITE_API_URL) {
    try {
      await api<{ feedback: PracticeFeedbackItem }>('/api/practice/feedback', {
        method: 'POST',
        json: {
          author: item.author,
          page: item.page,
          pageTitle: item.pageTitle,
          body: item.body,
          kind: item.kind,
          clientId: item.id,
        },
      })
      item.synced = true
      writeAll(readAll().map((f) => (f.id === item.id ? { ...f, synced: true } : f)))
    } catch {
      /* keep local copy; admin can still see device store / later sync */
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
    // Merge remote into local so Pages/admin see a combined view when possible
    const byId = new Map<string, PracticeFeedbackItem>()
    for (const f of listPracticeFeedback()) byId.set(f.id, f)
    for (const f of remote) byId.set(f.id, { ...f, synced: true })
    const merged = [...byId.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    writeAll(merged)
    return merged
  } catch {
    return listPracticeFeedback()
  }
}

export function exportPracticeFeedbackJson(): string {
  return JSON.stringify(listPracticeFeedback(), null, 2)
}

export function clearLocalPracticeFeedback() {
  writeAll([])
}
