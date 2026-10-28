/**
 * Shared learner progress across Desktop and Phone shells.
 *
 * Presentation mode (shell) can change; history (journey step, vocab, pathway,
 * mastery, employment prep) stays one store in localStorage so both modes
 * read and write the same data.
 */

function migrateFromSession(key: string): string | null {
  try {
    const fromSession = sessionStorage.getItem(key)
    if (fromSession == null) return null
    localStorage.setItem(key, fromSession)
    return fromSession
  } catch {
    return null
  }
}

/** Read learner progress — localStorage first, one-time migrate from sessionStorage. */
export function learnerGet(key: string): string | null {
  try {
    const local = localStorage.getItem(key)
    if (local != null) return local
    return migrateFromSession(key)
  } catch {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  }
}

/** Write learner progress to localStorage (and mirror session for transitional readers). */
export function learnerSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode / quota */
  }
  try {
    sessionStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

export function learnerRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
