/** Student Practice Mode: full-site student path preview (no registration). */
import { JOURNEY_STEP_COUNT } from '../student/journeyCurriculum'
import { learnerGet, learnerRemove, learnerSet } from './learnerStore'

export const PRACTICE_REVIEWERS = ['ChuChu', 'Yonas', 'Kinfe', 'Saba', 'Levi', 'Teklish', 'Henok'] as const
export type PracticeReviewer = (typeof PRACTICE_REVIEWERS)[number] | string

/** First training step after skipping registration (Language). */
export const PRACTICE_ENTRY_STEP = 3

const FLAG_KEY = 'pa-practice-mode-v1'
const NAME_KEY = 'pa-practice-name-v1'
const ACK_KEY = 'pa-practice-feedback-ack-v1'
const JOURNEY_STEP_KEY = 'pa-student-journey-step-v1'
/** When set, /journey opens the lesson view instead of the Practice hub. */
const FORCE_LESSON_KEY = 'pa-practice-force-lesson-v1'
/** Migrate older developer-preview keys once. */
const LEGACY_FLAG = 'pa-dev-preview-v1'
const LEGACY_NAME = 'pa-dev-preview-name-v1'

const PROGRESS_KEYS = [
  ACK_KEY,
  'pa-student-observation-v1',
  'pa-student-daily-log-v1',
  'pa-student-employment-v1',
  'pa-employment-followup-v1',
  'pa-vocab-known-v1',
  'pa-vocab-station-cleared-v1',
  'pa-learning-mastery-v1',
  'pa-learning-stats-v1',
  'pa-active-pathway-v1',
  'pa-recommended-pathway-v1',
  'pa-basic-computer-skills-watched-v1',
  'pa-basic-computer-skills-done-v1',
  'pa-warehouse-equipment-watched-v1',
  'pa-play-clears-day-v1',
  'pa-nav-cues-seen-v1',
  'pa-station-explainers-seen-v1',
  'pa-station-coach-seen-v1',
] as const

function migrateLegacy() {
  try {
    if (learnerGet(FLAG_KEY) !== '1' && learnerGet(LEGACY_FLAG) === '1') {
      learnerSet(FLAG_KEY, '1')
      const n = learnerGet(LEGACY_NAME)
      if (n) learnerSet(NAME_KEY, n)
    }
  } catch {
    /* ignore */
  }
}

export function isPracticeMode(): boolean {
  migrateLegacy()
  try {
    return learnerGet(FLAG_KEY) === '1'
  } catch {
    return false
  }
}

export function getPracticeName(): string {
  migrateLegacy()
  try {
    return learnerGet(NAME_KEY) || ''
  } catch {
    return ''
  }
}

/** Clear journey progress / feedback acks so a reviewer can run the path again from the top. */
export function resetPracticeProgress() {
  try {
    for (const key of PROGRESS_KEYS) learnerRemove(key)
    learnerSet(JOURNEY_STEP_KEY, String(PRACTICE_ENTRY_STEP))
    void import('./stationCoach').then((m) => m.clearCoachProgress())
    /* Match coach: Start over re-activates once-then-quiet nav marks (Mode/tray/lang/hub). */
    window.dispatchEvent(new CustomEvent('pa-nav-cues-changed'))
    window.dispatchEvent(new CustomEvent('pa-journey-step', { detail: { step: PRACTICE_ENTRY_STEP } }))
    window.dispatchEvent(new CustomEvent('pa-employment-followup-changed'))
    window.dispatchEvent(new CustomEvent('pa-vocab-known-changed'))
    window.dispatchEvent(new CustomEvent('pa-vocab-station-cleared-changed'))
    window.dispatchEvent(new CustomEvent('pa-pathway-changed', { detail: { pathway: 'construction' } }))
    window.dispatchEvent(new Event('pa-practice-restarted'))
    window.dispatchEvent(new Event('pa-mastery-changed'))
  } catch {
    /* ignore */
  }
}

/** Ask for reviewer feedback only at unit boundaries so learning stays continuous. */
export const PRACTICE_FEEDBACK_STEPS = new Set([6, 8, 9, 13, 17, 18, 21, 22])

export function shouldAskPracticeFeedback(step: number) {
  return PRACTICE_FEEDBACK_STEPS.has(step)
}

/** Fresh Practice run (Start over / new reviewer name with wipe). */
export function startPracticeMode(fullName: string) {
  const name = fullName.trim()
  try {
    learnerSet(FLAG_KEY, '1')
    if (name) learnerSet(NAME_KEY, name)
    resetPracticeProgress()
    window.dispatchEvent(new CustomEvent('pa-practice-started', { detail: { name } }))
  } catch {
    /* ignore */
  }
}

/**
 * Open Student Practice from the toolbox without wiping history.
 * Desktop ↔ Phone share the same local store — resume where they left off.
 */
export function resumeOrEnterPractice(fullName: string) {
  const name = fullName.trim()
  try {
    learnerSet(FLAG_KEY, '1')
    if (name) learnerSet(NAME_KEY, name)
    const raw = learnerGet(JOURNEY_STEP_KEY)
    const step = Number(raw)
    if (!raw || !Number.isFinite(step) || step < PRACTICE_ENTRY_STEP) {
      learnerSet(JOURNEY_STEP_KEY, String(PRACTICE_ENTRY_STEP))
    }
    window.dispatchEvent(new CustomEvent('pa-practice-started', { detail: { name } }))
  } catch {
    /* ignore */
  }
}

/** Keep reviewer name, wipe progress, and jump back to the first training step. */
export function restartPracticeFromTop() {
  const name = getPracticeName()
  try {
    learnerSet(FLAG_KEY, '1')
    if (name) learnerSet(NAME_KEY, name)
    resetPracticeProgress()
    window.dispatchEvent(new CustomEvent('pa-practice-started', { detail: { name } }))
  } catch {
    /* ignore */
  }
}

export function setPracticeName(fullName: string) {
  const name = fullName.trim()
  if (!name) return
  try {
    learnerSet(NAME_KEY, name)
    learnerSet(FLAG_KEY, '1')
    window.dispatchEvent(new CustomEvent('pa-practice-started', { detail: { name } }))
  } catch {
    /* ignore */
  }
}

export function getJourneyStep(): number {
  try {
    const n = Number(learnerGet(JOURNEY_STEP_KEY) || '0')
    return Number.isFinite(n) && n > 0 ? Math.min(JOURNEY_STEP_COUNT, Math.max(1, Math.floor(n))) : PRACTICE_ENTRY_STEP
  } catch {
    return PRACTICE_ENTRY_STEP
  }
}

export function setJourneyStep(step: number) {
  const target = Math.min(JOURNEY_STEP_COUNT, Math.max(PRACTICE_ENTRY_STEP, Math.floor(step)))
  try {
    learnerSet(JOURNEY_STEP_KEY, String(target))
    window.dispatchEvent(new CustomEvent('pa-journey-step', { detail: { step: target } }))
  } catch {
    /* ignore */
  }
}

/**
 * Open the shared Practice spine from the student portal without wiping
 * existing journey progress.
 */
export function openPracticeSpine(fullName: string) {
  resumeOrEnterPractice(fullName)
}

/** Enter a specific spine lesson from the portal School path (skip double hub). */
export function enterPracticeLesson(fullName: string, step: number) {
  openPracticeSpine(fullName)
  setJourneyStep(step)
  try {
    learnerSet(FORCE_LESSON_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function peekForcePracticeLesson(): boolean {
  try {
    return learnerGet(FORCE_LESSON_KEY) === '1'
  } catch {
    return false
  }
}

export function consumeForcePracticeLesson(): boolean {
  try {
    if (learnerGet(FORCE_LESSON_KEY) === '1') {
      learnerRemove(FORCE_LESSON_KEY)
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

/** Leave Practice UI flag only — does not wipe journey history (shared across modes). */
export function clearPracticeMode() {
  try {
    learnerRemove(FLAG_KEY)
    learnerRemove(NAME_KEY)
    learnerRemove(LEGACY_FLAG)
    learnerRemove(LEGACY_NAME)
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

/** Page/step key used to track whether feedback was given or confirmed. */
export function practiceFeedbackKey(pathname: string, journeyStep?: number) {
  if (pathname === '/journey' && journeyStep && journeyStep > 0) {
    return `journey:${journeyStep}`
  }
  return `page:${pathname}`
}

export function hasPracticeFeedbackAck(key: string): boolean {
  return Boolean(readAcks()[key])
}

export function markPracticeFeedbackAck(key: string) {
  if (!key) return
  const map = readAcks()
  map[key] = true
  writeAcks(map)
  try {
    window.dispatchEvent(new CustomEvent('pa-practice-feedback-ack', { detail: { key } }))
  } catch {
    /* ignore */
  }
}

export function openPracticeChat() {
  try {
    window.dispatchEvent(new Event('pa-practice-open-chat'))
  } catch {
    /* ignore */
  }
}

/** Routes where the feedback chatbot should not appear. */
export function shouldHidePracticeFeedback(pathname: string, journeyStep?: number) {
  if (
    pathname === '/register' ||
    pathname === '/login' ||
    pathname === '/welcome' ||
    pathname === '/roles' ||
    pathname === '/forgot-password' ||
    pathname === '/app/student/registration'
  ) {
    return true
  }
  if (pathname === '/journey' && journeyStep != null && journeyStep <= 2) {
    return true
  }
  return false
}

export const PRACTICE_TRAY_HELP =
  'Walk the same path a student walks — one station at a time. Leave a note if something is unclear.'
