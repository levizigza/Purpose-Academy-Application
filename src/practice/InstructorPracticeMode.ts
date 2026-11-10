/**
 * Instructor Practice Mode — demo / feedback path for teaching sessions.
 * Mirrors Student Practice Mode: named reviewer, resume, start over, feedback acks.
 * Does not wipe Student Practice history (separate flag + progress keys).
 */

import { learnerGet, learnerRemove, learnerSet } from './learnerStore'

export const INSTRUCTOR_FILM_SEEN_KEY = 'pa-instructor-film-seen-v1'

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
const PATHWAY_KEY = 'pa-instructor-practice-pathway-v1'

export type InstructorStreamId = 'construction' | 'logistics' | 'community'

export type InstructorPracticePhase = 'prepare' | 'model' | 'practise' | 'observe'
export type InstructorPracticeView = 'roots' | 'hub' | 'session' | 'workbooks'

export const INSTRUCTOR_PRACTICE_PHASES: InstructorPracticePhase[] = [
  'prepare',
  'model',
  'practise',
  'observe',
]

export const INSTRUCTOR_PRACTICE_TRAY_HELP =
  'Three streams — Construction, Logistics, and Community Support. Each one branches into its own months, weeks, documents, and reviews.'

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
    if (raw === 'roots' || raw === 'session' || raw === 'workbooks' || raw === 'hub') return raw
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

export function getInstructorPracticePathway(): InstructorStreamId | null {
  try {
    const raw = learnerGet(PATHWAY_KEY)
    if (raw === 'construction' || raw === 'logistics' || raw === 'community') return raw
  } catch {
    /* ignore */
  }
  return null
}

export function setInstructorPracticePathway(id: InstructorStreamId | null) {
  try {
    if (id) learnerSet(PATHWAY_KEY, id)
    else learnerRemove(PATHWAY_KEY)
    learnerSet(VIEW_KEY, 'hub')
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed', { detail: { pathway: id } }))
  } catch {
    /* ignore */
  }
}

export function getInstructorPracticeSession(): number {
  try {
    const n = Number(learnerGet(SESSION_KEY) || '1')
    return Number.isFinite(n) && n >= 1 ? Math.min(32, Math.floor(n)) : 1
  } catch {
    return 1
  }
}

export function setInstructorPracticeSession(n: number) {
  const target = Math.min(32, Math.max(1, Math.floor(n)))
  try {
    learnerSet(SESSION_KEY, String(target))
    window.dispatchEvent(
      new CustomEvent('pa-instructor-practice-changed', { detail: { session: target } }),
    )
  } catch {
    /* ignore */
  }
}

export function getInstructorPracticeStep(maxSteps = 8): number {
  try {
    const raw = learnerGet(PHASE_KEY) || ''
    if (raw === 'prepare') return 0
    if (raw === 'model') return 1
    if (raw === 'practise') return 2
    if (raw === 'observe') return 3
    const n = Number(raw)
    if (Number.isFinite(n) && n >= 0) return Math.min(Math.floor(n), Math.max(0, maxSteps - 1))
  } catch {
    /* ignore */
  }
  return 0
}

export function setInstructorPracticeStep(step: number) {
  const target = Math.max(0, Math.floor(step))
  try {
    learnerSet(PHASE_KEY, String(target))
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed', { detail: { step: target } }))
  } catch {
    /* ignore */
  }
}

export function getInstructorPracticePhase(): InstructorPracticePhase {
  return INSTRUCTOR_PRACTICE_PHASES[Math.min(3, getInstructorPracticeStep())]
}

export function setInstructorPracticePhase(phase: InstructorPracticePhase) {
  setInstructorPracticeStep(INSTRUCTOR_PRACTICE_PHASES.indexOf(phase))
}

type ClearedMap = Record<string, number[]>

function readClearedMap(): ClearedMap {
  try {
    const raw = learnerGet(CLEARED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as number[] | ClearedMap
    if (Array.isArray(parsed)) {
      return { community: parsed.filter((n) => Number.isFinite(n)) }
    }
    if (parsed && typeof parsed === 'object') {
      const out: ClearedMap = {}
      for (const [key, value] of Object.entries(parsed)) {
        if (Array.isArray(value)) out[key] = value.filter((n) => Number.isFinite(n))
      }
      return out
    }
  } catch {
    /* ignore */
  }
  return {}
}

function writeClearedMap(map: ClearedMap) {
  try {
    learnerSet(CLEARED_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function clearedFor(pathway: string): number[] {
  return readClearedMap()[pathway] || []
}

export function isInstructorSessionCleared(pathway: string, n: number): boolean {
  return clearedFor(pathway).includes(n)
}

export function markInstructorSessionCleared(pathway: string, n: number) {
  const map = readClearedMap()
  const next = map[pathway] ? [...map[pathway]] : []
  if (!next.includes(n)) next.push(n)
  map[pathway] = [...new Set(next)].sort((a, b) => a - b)
  writeClearedMap(map)
  window.dispatchEvent(
    new CustomEvent('pa-instructor-practice-changed', { detail: { pathway, cleared: n } }),
  )
}

export function instructorSessionsClearedCount(pathway: string): number {
  return clearedFor(pathway).length
}

export function restartInstructorPathway(pathway: string) {
  const map = readClearedMap()
  delete map[pathway]
  writeClearedMap(map)
  try {
    learnerSet(SESSION_KEY, '1')
    learnerSet(PHASE_KEY, '0')
    learnerSet(VIEW_KEY, 'hub')
    window.dispatchEvent(new CustomEvent('pa-instructor-practice-changed', { detail: { pathway } }))
    window.dispatchEvent(new Event('pa-instructor-practice-restarted'))
  } catch {
    /* ignore */
  }
}

function resetProgress() {
  learnerRemove(ACK_KEY)
  learnerRemove(CLEARED_KEY)
  learnerRemove(PATHWAY_KEY)
  learnerRemove(INSTRUCTOR_FILM_SEEN_KEY)
  learnerSet(SESSION_KEY, '1')
  learnerSet(PHASE_KEY, '0')
  learnerSet(VIEW_KEY, 'roots')
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
    /* Every entry starts at the three streams. A saved pathway stays marked on that root. */
    learnerSet(VIEW_KEY, 'roots')
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

export function instructorPracticeFeedbackKey(session?: number, pathway?: string | null) {
  if (session && session > 0) return `instructor-session:${pathway || 'stream'}:${session}`
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
  return session > 0 && session % 4 === 0
}
