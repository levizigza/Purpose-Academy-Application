/**
 * Tracks which entry sequences a visitor has completed on this browser.
 * Stored in localStorage so progress stays visible on the site after refresh.
 */

export type SequenceId =
  | 'contact'
  | 'student'
  | 'admin-contact'
  | 'admin-guest'
  | 'instructor'
  | 'future-app'

export type SequenceRecord = {
  id: SequenceId
  completedAt: string
  label?: string
  detail?: string
}

const STORAGE_KEY = 'pa-sequence-progress-v1'
const STUDENT_STEP_KEY = 'pa-student-journey-step-v1'

const listeners = new Set<() => void>()

export const SEQUENCE_CATALOG: {
  id: SequenceId
  label: string
  help: string
  to: string
  group: 'contact' | 'student' | 'admin' | 'instructor' | 'app'
  /** Reserved slot — link exists on the site but has no destination yet. */
  placeholder?: boolean
}[] = [
  {
    id: 'contact',
    label: 'Contact Us',
    help: 'Ask a question',
    to: '/contact',
    group: 'contact',
  },
  {
    id: 'student',
    label: 'Student sequence',
    help: '20 steps from login to employment connection',
    to: '/journey',
    group: 'student',
  },
  {
    id: 'admin-contact',
    label: 'Admin · Contact Admin',
    help: 'Sequence 1 — message the admin team',
    to: '/enter/admin/contact',
    group: 'admin',
  },
  {
    id: 'admin-guest',
    label: 'Admin · Employed / Guest',
    help: 'Sequence 2 — employer or guest request',
    to: '/enter/admin/guest',
    group: 'admin',
  },
  {
    id: 'instructor',
    label: 'Instructor · ID entry',
    help: 'Enter with instructor ID number',
    to: '/enter/instructor',
    group: 'instructor',
  },
  {
    id: 'future-app',
    label: 'Purpose Academy Application',
    help: 'Future full application — link reserved (not live yet)',
    to: '',
    group: 'app',
    placeholder: true,
  },
]

function readAll(): SequenceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SequenceRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records: SequenceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function subscribeSequenceProgress(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSequenceProgress(): SequenceRecord[] {
  return readAll()
}

export function isSequenceComplete(id: SequenceId): boolean {
  return readAll().some((r) => r.id === id)
}

export function markSequenceComplete(
  id: SequenceId,
  meta?: { label?: string; detail?: string },
) {
  const next = readAll().filter((r) => r.id !== id)
  next.push({
    id,
    completedAt: new Date().toISOString(),
    label: meta?.label,
    detail: meta?.detail,
  })
  writeAll(next)
}

export function clearSequenceProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function getStudentJourneyStep(): number {
  try {
    const n = Number(sessionStorage.getItem(STUDENT_STEP_KEY) || '0')
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

export function completedCount(): number {
  const trackable = new Set(
    SEQUENCE_CATALOG.filter((s) => !s.placeholder).map((s) => s.id),
  )
  return readAll().filter((r) => trackable.has(r.id)).length
}
