/**
 * One round of the chosen language beside English, then English only.
 *
 * Window: the opening questions, Workplace Words (not a retake),
 * Language Organize once, and the first half of Tools & Equipment.
 * Later stations, the second half of tools, and every repeat stay in English.
 */

import { learnerGet, learnerSet } from './learnerStore'
import { learnerWantsL1Narration } from './learnerLang'

const KEY = 'pa-supp-lang-round-v1'

export type SupplementaryPlace = 'opening' | 'vocab' | 'organize' | 'tools'

function readDone(): Partial<Record<SupplementaryPlace, true>> {
  try {
    const raw = learnerGet(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<Record<SupplementaryPlace, true>>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function markSupplementaryRound(place: SupplementaryPlace) {
  const done = readDone()
  if (done[place]) return
  done[place] = true
  try {
    learnerSet(KEY, JSON.stringify(done))
  } catch {
    /* ignore */
  }
}

export function supplementaryLanguageOn(
  place: SupplementaryPlace,
  opts?: { retake?: boolean; toolIndex?: number; toolCount?: number },
): boolean {
  if (!learnerWantsL1Narration()) return false
  if (place === 'vocab' && opts?.retake) return false
  if (readDone()[place]) return false
  if (place === 'tools') {
    const count = Math.max(1, opts?.toolCount ?? 1)
    const half = Math.ceil(count / 2)
    return (opts?.toolIndex ?? 0) < half
  }
  return true
}
