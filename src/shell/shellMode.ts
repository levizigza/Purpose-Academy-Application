/**
 * Presentation shell for demos.
 *
 * Flow:
 * 1. Mode chooser (Desktop | Phone) — no shell yet
 * 2a. Desktop → opening animation → toolbox → Practice / Student / …
 * 2b. Phone → home with PA icon → opening animation on device → toolbox → Practice / …
 *
 * Shell choice is presentation-only. Learner progress lives in learnerStore
 * (localStorage) and is shared across Desktop and Phone.
 */

export type ShellMode = 'phone' | 'course'
export type PhonePhase = 'home' | 'splash' | 'toolbox' | 'app'

const MODE_KEY = 'pa-shell-mode-v2'
const PHASE_KEY = 'pa-phone-phase-v1'
const EVENT = 'pa-shell-mode'
const PHASE_EVENT = 'pa-phone-phase'

function storeGet(key: string): string | null {
  try {
    const local = localStorage.getItem(key)
    if (local != null) return local
    const sess = sessionStorage.getItem(key)
    if (sess != null) {
      localStorage.setItem(key, sess)
      return sess
    }
  } catch {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  }
  return null
}

function storeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function storeRemove(key: string) {
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

export function getShellMode(): ShellMode | null {
  try {
    const v = storeGet(MODE_KEY)
    if (v === 'phone' || v === 'course') return v
  } catch {
    /* private mode */
  }
  return null
}

export function setShellMode(mode: ShellMode | null) {
  try {
    if (mode) storeSet(MODE_KEY, mode)
    else {
      storeRemove(MODE_KEY)
      storeRemove(PHASE_KEY)
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { mode } }))
}

export function clearShellMode() {
  setShellMode(null)
}

export function subscribeShellMode(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === MODE_KEY || e.key === PHASE_KEY) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener(PHASE_EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener(PHASE_EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}

export function getPhonePhase(): PhonePhase {
  try {
    const v = storeGet(PHASE_KEY)
    if (v === 'home' || v === 'splash' || v === 'toolbox' || v === 'app') return v
  } catch {
    /* ignore */
  }
  return 'home'
}

export function setPhonePhase(phase: PhonePhase) {
  try {
    storeSet(PHASE_KEY, phase)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(PHASE_EVENT, { detail: { phase } }))
}

export function subscribePhonePhase(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === PHASE_KEY) cb()
  }
  window.addEventListener(PHASE_EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(PHASE_EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
