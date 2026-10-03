/** Practice mode — full-site preview for reviewers (no registration). */

export const PRACTICE_REVIEWERS = ['Chu Chu', 'Yonas', 'Kinfe', 'Saba', 'Levi'] as const
export type PracticeReviewer = (typeof PRACTICE_REVIEWERS)[number] | string

const FLAG_KEY = 'pa-practice-mode-v1'
const NAME_KEY = 'pa-practice-name-v1'
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

export function startPracticeMode(fullName: string) {
  const name = fullName.trim()
  try {
    sessionStorage.setItem(FLAG_KEY, '1')
    if (name) sessionStorage.setItem(NAME_KEY, name)
    sessionStorage.setItem('pa-student-journey-step-v1', '1')
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
  } catch {
    /* ignore */
  }
}

export const PRACTICE_TRAY_HELP =
  'For Chu Chu, Yonas, Kinfe, Saba & Levi — view the full site without registration, catch issues, and send feedback.'
