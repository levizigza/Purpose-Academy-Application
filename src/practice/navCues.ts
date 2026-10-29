/**
 * First-computer navigational cues — soft glow + arrows that teach where to go,
 * then quiet down once the learner has used that door. Shared Desktop ↔ Phone.
 * See docs/PLAY_CRAFT.md + CRAFTSMANSHIP §7 (L3 info display, L4 attention ethics).
 */

import { learnerGet, learnerSet } from './learnerStore'

const KEY = 'pa-nav-cues-seen-v1'

type SeenMap = Record<string, true>

function load(): SeenMap {
  try {
    const raw = learnerGet(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SeenMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function save(map: SeenMap) {
  try {
    learnerSet(KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('pa-nav-cues-changed'))
  } catch {
    /* ignore */
  }
}

/** True until the learner has followed this cue once. */
export function navCueActive(id: string): boolean {
  if (!id) return false
  return !load()[id]
}

export function markNavCueSeen(id: string) {
  if (!id) return
  const map = load()
  if (map[id]) return
  map[id] = true
  save(map)
}

export function resetNavCues() {
  try {
    learnerSet(KEY, '{}')
    window.dispatchEvent(new CustomEvent('pa-nav-cues-changed'))
  } catch {
    /* ignore */
  }
}

/** Stable cue ids used across shells. */
export const NAV_CUE = {
  modeDesktop: 'mode-desktop',
  modePhone: 'mode-phone',
  toolboxPractice: 'toolbox-practice',
  hubContinue: 'hub-continue',
  /** Step 3 mother-tongue picker — point at the language chip grid once. */
  langPick: 'lang-pick',
  /** Workplace Words hear row — EN + mother-tongue chips (once-then-quiet). */
  vocabLang: 'vocab-lang',
  stationContinue: (step: number) => `station-continue-${step}`,
  explainerWatch: (stationId: string) => `explainer-${stationId}`,
} as const
