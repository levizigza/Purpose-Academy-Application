/**
 * Training wheels, then English.
 *
 * The chosen language sits beside English for the opening questions and the
 * greetings set in Workplace Words (not a retake). Workplace pictures — the
 * end of that first vocab station — and every later station are English only.
 * The coach does not speak a home-language explanation before the action.
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
  if (place === 'organize' || place === 'tools') return false
  if (place === 'vocab' && opts?.retake) return false
  if (readDone()[place]) return false
  return true
}

/** Hub card beside today's station. Bilingual only while that early station is still in its one round. */
export function hubSpeaksChosenLanguage(step: number): boolean {
  if (step >= 4 && step <= 5) return supplementaryLanguageOn('opening')
  if (step === 6) return supplementaryLanguageOn('vocab')
  if (step === 7) return supplementaryLanguageOn('organize')
  return false
}

/**
 * First-example coach. A written home-language line only on the greetings
 * example in Workplace Words. Later stations stay in English, and nothing
 * here speaks that line ahead of the action.
 */
export function coachSpeaksChosenLanguage(stationId: string): boolean {
  if (stationId === 'workplace-words') return supplementaryLanguageOn('vocab')
  return false
}
