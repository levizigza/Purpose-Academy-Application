/**
 * TEMPORARY developer preview helpers.
 * Delete this file (and its imports) when real registration is the only path.
 */

const FLAG_KEY = 'pa-dev-preview-v1'
const NAME_KEY = 'pa-dev-preview-name-v1'

export function isDevPreview(): boolean {
  try {
    return sessionStorage.getItem(FLAG_KEY) === '1'
  } catch {
    return false
  }
}

export function getDevPreviewName(): string {
  try {
    return sessionStorage.getItem(NAME_KEY) || 'Developer'
  } catch {
    return 'Developer'
  }
}

export function startDevPreview(fullName: string) {
  const name = fullName.trim() || 'Developer'
  try {
    sessionStorage.setItem(FLAG_KEY, '1')
    sessionStorage.setItem(NAME_KEY, name)
    sessionStorage.setItem('pa-student-journey-step-v1', '1')
  } catch {
    /* ignore */
  }
}

export function clearDevPreview() {
  try {
    sessionStorage.removeItem(FLAG_KEY)
    sessionStorage.removeItem(NAME_KEY)
  } catch {
    /* ignore */
  }
}
