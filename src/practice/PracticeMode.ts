/** Practice mode — full-site preview for reviewers (no registration). */

export const PRACTICE_REVIEWERS = ['ChuChu', 'Yonas', 'Kinfe', 'Saba', 'Levi'] as const
export type PracticeReviewer = (typeof PRACTICE_REVIEWERS)[number] | string

/** First training step after skipping registration (Language). */
export const PRACTICE_ENTRY_STEP = 3

const FLAG_KEY = 'pa-practice-mode-v1'
const NAME_KEY = 'pa-practice-name-v1'
const ACK_KEY = 'pa-practice-feedback-ack-v1'
/** Migrate older developer-preview keys once. */
const LEGACY_FLAG = 'pa-dev-preview-v1'
const LEGACY_NAME = 'pa-dev-preview-name-v1'

function migrateLegacy() {
  try {
    if (sessionStorage.getItem(FLAG_KEY) !== '1' && sessionStorage.getItem(LEGACY_FLAG) === '1') {
      sessionStorage.setItem(FLAG_KEY, '1')
      const n = sessionStorage.getItem(LEGACY_NAME)
      if (n) sessionStorage.setItem(NAME_KEY, n)
    }
  } catch {
    /* ignore */
  }
}

export function isPracticeMode(): boolean {
  migrateLegacy()
  try {
    return sessionStorage.getItem(FLAG_KEY) === '1'
  } catch {
    return false
  }
}

export function getPracticeName(): string {
  migrateLegacy()
  try {
    return sessionStorage.getItem(NAME_KEY) || ''
  } catch {
    return ''
  }
}

/** Clear journey progress / feedback acks so a reviewer can run the path again from the top. */
export function resetPracticeProgress() {
  try {
    sessionStorage.removeItem(ACK_KEY)
    sessionStorage.removeItem('pa-student-observation-v1')
    sessionStorage.removeItem('pa-student-daily-log-v1')
    sessionStorage.removeItem('pa-student-employment-v1')
    sessionStorage.removeItem('pa-learning-mastery-v1')
    sessionStorage.setItem('pa-student-journey-step-v1', String(PRACTICE_ENTRY_STEP))
    window.dispatchEvent(new CustomEvent('pa-journey-step', { detail: { step: PRACTICE_ENTRY_STEP } }))
    window.dispatchEvent(new Event('pa-practice-restarted'))
    window.dispatchEvent(new Event('pa-mastery-changed'))
  } catch {
    /* ignore */
  }
}

/** Ask for reviewer feedback only at unit boundaries so learning stays continuous. */
export const PRACTICE_FEEDBACK_STEPS = new Set([6, 8, 12, 16, 19, 20])

export function shouldAskPracticeFeedback(step: number) {
  return PRACTICE_FEEDBACK_STEPS.has(step)
}

export function startPracticeMode(fullName: string) {
  const name = fullName.trim()
  try {
    sessionStorage.setItem(FLAG_KEY, '1')
    if (name) sessionStorage.setItem(NAME_KEY, name)
    /* Fresh run every time — skip registration, land on language / real training process */
    resetPracticeProgress()
    window.dispatchEvent(new CustomEvent('pa-practice-started', { detail: { name } }))
  } catch {
    /* ignore */
  }
}

/** Keep reviewer name, wipe progress, and jump back to the first training step. */
export function restartPracticeFromTop() {
  const name = getPracticeName()
  try {
    sessionStorage.setItem(FLAG_KEY, '1')
    if (name) sessionStorage.setItem(NAME_KEY, name)
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
    sessionStorage.setItem(NAME_KEY, name)
    sessionStorage.setItem(FLAG_KEY, '1')
    window.dispatchEvent(new CustomEvent('pa-practice-started', { detail: { name } }))
  } catch {
    /* ignore */
  }
}

export function clearPracticeMode() {
  try {
    sessionStorage.removeItem(FLAG_KEY)
    sessionStorage.removeItem(NAME_KEY)
    sessionStorage.removeItem(LEGACY_FLAG)
    sessionStorage.removeItem(LEGACY_NAME)
    sessionStorage.removeItem(ACK_KEY)
  } catch {
    /* ignore */
  }
}

function readAcks(): Record<string, boolean> {
  try {
    const raw = sessionStorage.getItem(ACK_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAcks(map: Record<string, boolean>) {
  try {
    sessionStorage.setItem(ACK_KEY, JSON.stringify(map))
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
  'Full school learning path for reviewers. Same units, mastery, and checks learners will use. Pick your name, skip registration, learn through every station, and leave feedback at unit ends.'
