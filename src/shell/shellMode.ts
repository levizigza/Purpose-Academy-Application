/**
 * Presentation shell for the learner experience.
 * After the opening animation, the toolbox chooses Phone or Desktop Course.
 * Both wrap the same `/journey` curriculum so demos stay reliable.
 */

export type ShellMode = 'phone' | 'course'

const MODE_KEY = 'pa-shell-mode-v1'
const EVENT = 'pa-shell-mode'

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
    else sessionStorage.removeItem(MODE_KEY)
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
    if (e.key === MODE_KEY) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
