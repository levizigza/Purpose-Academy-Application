/**
 * Instructor Practice Mode — demo / feedback path for teaching sessions.
 * Mirrors Student Practice Mode: named reviewer, resume, start over, feedback acks.
 * Does not wipe Student Practice history (separate flag + progress keys).
 */

import { learnerGet, learnerRemove, learnerSet } from './learnerStore'

export const INSTRUCTOR_PRACTICE_REVIEWERS = [
  'Yonas',
  'ChuChu',
  'Kinfe',
  'Saba',
  'Levi',
  'Teklish',
  'Henok',
] as const

const FLAG_KEY = 'pa-instructor-practice-mode-v1'
const NAME_KEY = 'pa-instructor-practice-name-v1'
const ACK_KEY = 'pa-instructor-practice-feedback-ack-v1'
const SESSION_KEY = 'pa-instructor-practice-session-v1'
const PHASE_KEY = 'pa-instructor-practice-phase-v1'
const CLEARED_KEY = 'pa-instructor-practice-cleared-v1'
const VIEW_KEY = 'pa-instructor-practice-view-v1'

export type InstructorPracticePhase = 'prepare' | 'model' | 'practise' | 'observe'
export type InstructorPracticeView = 'hub' | 'session' | 'workbooks'

export const INSTRUCTOR_PRACTICE_PHASES: InstructorPracticePhase[] = [
  'prepare',
  'model',
  'practise',
  'observe',
]

export const INSTRUCTOR_PRACTICE_TRAY_HELP =
  'Walk three teaching sessions the way an instructor would — prepare, model, practise, observe. Leave a note if something is unclear.'

export function isInstructorPracticeMode(): boolean {
  try {
    return learnerGet(FLAG_KEY) === '1'
  } catch {
    return false
  }
}

export function getInstructorPracticeName(): string {
  try {
    return learnerGet(NAME_KEY) || ''
  } catch {
    return ''
  }
}

export function getInstructorPracticeView(): InstructorPracticeView {
  try {
    const raw = learnerGet(VIEW_KEY)
    if (raw === 'session' || raw === 'workbooks' || raw === 'hub') return raw
  } catch {
    /* ignore */
  }
  return 'hub'
}

export function setInstructorPracticeView(view: InstructorPracticeView) {
  try {
    learnerSet(VIEW_KEY, view)
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed', { detail: { view } }))
  } catch {
    /* ignore */
  }
}

export function getInstructorPracticeSession(): number {
  try {
    const n = Number(learnerGet(SESSION_KEY) || '1')
    return Number.isFinite(n) && n >= 1 ? Math.min(3, Math.floor(n)) : 1
  } catch {
    return 1
  }
}

export function setInstructorPracticeSession(n: number) {
  const target = Math.min(3, Math.max(1, Math.floor(n)))
  try {
    learnerSet(SESSION_KEY, String(target))
    window.dispatchEvent(
      new CustomEvent('pa-instructor-practice-changed', { detail: { session: target } }),
    )
  } catch {
    /* ignore */
  }
}

export function getInstructorPracticePhase(): InstructorPracticePhase {
  try {
    const raw = learnerGet(PHASE_KEY)
    if (raw === 'prepare' || raw === 'model' || raw === 'practise' || raw === 'observe') return raw
  } catch {
    /* ignore */
  }
  return 'prepare'
}

export function setInstructorPracticePhase(phase: InstructorPracticePhase) {
  try {
    learnerSet(PHASE_KEY, phase)
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed', { detail: { phase } }))
  } catch {
    /* ignore */
  }
}

function readCleared(): number[] {
  try {
    const raw = learnerGet(CLEARED_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as number[]
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

function writeCleared(ids: number[]) {
  try {
    learnerSet(CLEARED_KEY, JSON.stringify([...new Set(ids)].sort((a, b) => a - b)))
  } catch {
    /* ignore */
  }
}

export function isInstructorSessionCleared(n: number): boolean {
  return readCleared().includes(n)
}

export function markInstructorSessionCleared(n: number) {
  const next = readCleared()
  if (!next.includes(n)) next.push(n)
  writeCleared(next)
  window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed', { detail: { cleared: n } }))
}

export function instructorSessionsClearedCount(): number {
  return readCleared().length
}

function resetProgress() {
  learnerRemove(ACK_KEY)
  learnerRemove(CLEARED_KEY)
  learnerSet(SESSION_KEY, '1')
  learnerSet(PHASE_KEY, 'prepare')
  learnerSet(VIEW_KEY, 'hub')
}

export function startInstructorPracticeMode(fullName: string) {
  const name = fullName.trim()
  try {
    learnerSet(FLAG_KEY, '1')
    if (name) learnerSet(NAME_KEY, name)
    resetProgress()
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-started', { detail: { name } }))
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed'))
  } catch {
    /* ignore */
  }
}

export function resumeOrEnterInstructorPractice(fullName: string) {
  const name = fullName.trim()
  try {
    learnerSet(FLAG_KEY, '1')
    if (name) learnerSet(NAME_KEY, name)
    if (!learnerGet(SESSION_KEY)) learnerSet(SESSION_KEY, '1')
    if (!learnerGet(PHASE_KEY)) learnerSet(PHASE_KEY, 'prepare')
    if (!learnerGet(VIEW_KEY)) learnerSet(VIEW_KEY, 'hub')
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-started', { detail: { name } }))
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed'))
  } catch {
    /* ignore */
  }
}

export function restartInstructorPracticeFromTop() {
  const name = getInstructorPracticeName()
  try {
    learnerSet(FLAG_KEY, '1')
    if (name) learnerSet(NAME_KEY, name)
    resetProgress()
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-started', { detail: { name } }))
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed'))
    window.dispatchEvent(new Event('pa-instructor-practice-restarted'))
  } catch {
    /* ignore */
  }
}

export function clearInstructorPracticeMode() {
  try {
    learnerRemove(FLAG_KEY)
    learnerRemove(NAME_KEY)
    learnerRemove(ACK_KEY)
  } catch {
    /* ignore */
  }
}

function readAcks(): Record<string, boolean> {
  try {
    const raw = learnerGet(ACK_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAcks(map: Record<string, boolean>) {
  try {
    learnerSet(ACK_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function instructorPracticeFeedbackKey(session?: number) {
  if (session && session > 0) return `instructor-session:${session}`
  return 'instructor:hub'
}

export function hasInstructorPracticeFeedbackAck(key: string): boolean {
  return Boolean(readAcks()[key])
}

export function markInstructorPracticeFeedbackAck(key: string) {
  if (!key) return
  const map = readAcks()
  map[key] = true
  writeAcks(map)
  window.dispatchEvent(new CustomEvent('pa-instructor-practice-feedback-ack', { detail: { key } }))
}

export function openInstructorPracticeChat() {
  window.dispatchEvent(new Event('pa-practice-open-chat'))
}

export function shouldAskInstructorPracticeFeedback(session: number) {
  return session >= 1 && session <= 3
}
