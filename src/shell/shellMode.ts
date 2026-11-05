/**
 * Presentation shell for demos.
 *
 * Flow:
 * 1. Brand opening (door → logo → Enter) — first screen
 * 2. Mode chooser (Desktop | Phone)
 * 3a. Desktop → toolbox → Student Practice / Student / …
 * 3b. Phone → home with PA icon → toolbox → Student Practice / …
 *
 * Shell choice is presentation-only. Learner progress lives in learnerStore
 * (localStorage) and is shared across Desktop and Phone.
 */

export type ShellMode = 'phone' | 'course'
export type PhonePhase = 'home' | 'splash' | 'toolbox' | 'app'
/** Desktop: opening = legacy (pre splash-first); ready = toolbox / course. */
export type DesktopPhase = 'opening' | 'ready'

const MODE_KEY = 'pa-shell-mode-v2'
const PHASE_KEY = 'pa-phone-phase-v1'
const DESKTOP_PHASE_KEY = 'pa-desktop-phase-v1'
const EVENT = 'pa-shell-mode'
const PHASE_EVENT = 'pa-phone-phase'
const DESKTOP_PHASE_EVENT = 'pa-desktop-phase'

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
      storeRemove(DESKTOP_PHASE_KEY)
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
    if (e.key === MODE_KEY || e.key === PHASE_KEY || e.key === DESKTOP_PHASE_KEY) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener(PHASE_EVENT, cb)
  window.addEventListener(DESKTOP_PHASE_EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener(PHASE_EVENT, cb)
    window.removeEventListener(DESKTOP_PHASE_EVENT, cb)
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

export function getDesktopPhase(): DesktopPhase | null {
  try {
    const v = storeGet(DESKTOP_PHASE_KEY)
    if (v === 'opening' || v === 'ready') return v
  } catch {
    /* ignore */
  }
  return null
}

export function setDesktopPhase(phase: DesktopPhase | null) {
  try {
    if (phase) storeSet(DESKTOP_PHASE_KEY, phase)
    else storeRemove(DESKTOP_PHASE_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(DESKTOP_PHASE_EVENT, { detail: { phase } }))
}

/**
 * Cold-load hygiene for Desktop:
 * - course + ready → toolbox
 * - course + opening (legacy) → ready if entered, else clear for splash-first
 * - course with no phase → ready if entered, else clear so ModeChooser can show after splash
 */
export function reconcileDesktopShellOnBoot(hasCrossedThreshold: boolean) {
  if (getShellMode() !== 'course') return
  const phase = getDesktopPhase()
  if (phase === 'ready') return
  if (phase === 'opening') {
    if (hasCrossedThreshold) {
      setDesktopPhase('ready')
      return
    }
    clearShellMode()
    return
  }
  if (hasCrossedThreshold) {
    setDesktopPhase('ready')
    return
  }
  clearShellMode()
}

export function subscribeDesktopPhase(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === DESKTOP_PHASE_KEY) cb()
  }
  window.addEventListener(DESKTOP_PHASE_EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(DESKTOP_PHASE_EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
