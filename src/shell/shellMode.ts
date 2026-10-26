/**
 * Presentation shell for demos.
 *
 * Flow:
 * 1. Mode chooser (Desktop | Phone) — no shell yet
 * 2a. Desktop → opening animation → toolbox → Practice / Student / …
 * 2b. Phone → home with PA icon → opening animation on device → toolbox → Practice / …
 */

export type ShellMode = 'phone' | 'course'
export type PhonePhase = 'home' | 'splash' | 'toolbox' | 'app'

const MODE_KEY = 'pa-shell-mode-v2'
const PHASE_KEY = 'pa-phone-phase-v1'
const EVENT = 'pa-shell-mode'
const PHASE_EVENT = 'pa-phone-phase'

export function getShellMode(): ShellMode | null {
  try {
    const v = sessionStorage.getItem(MODE_KEY)
    if (v === 'phone' || v === 'course') return v
  } catch {
    /* private mode */
  }
  return null
}

export function setShellMode(mode: ShellMode | null) {
  try {
    if (mode) sessionStorage.setItem(MODE_KEY, mode)
    else {
      sessionStorage.removeItem(MODE_KEY)
      sessionStorage.removeItem(PHASE_KEY)
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
    const v = sessionStorage.getItem(PHASE_KEY)
    if (v === 'home' || v === 'splash' || v === 'toolbox' || v === 'app') return v
  } catch {
    /* ignore */
  }
  return 'home'
}

export function setPhonePhase(phase: PhonePhase) {
  try {
    sessionStorage.setItem(PHASE_KEY, phase)
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
