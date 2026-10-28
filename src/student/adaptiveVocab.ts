/**
 * Adaptive vocabulary — Purpose Academy narration mold.
 * Skip-known is a *retake* affordance only: first go through Visual Vocabulary
 * always does hear → hear → type. After the station is cleared once, a later
 * visit may mark words already known (still hear English + type so it sticks).
 */

import type { PathwayId } from '../pathways/types'
import { learnerGet, learnerSet } from '../practice/learnerStore'

const KEY = 'pa-vocab-known-v1'
/** Pathways where the learner has finished Workplace Words / Visual Vocab once. */
const CLEARED_KEY = 'pa-vocab-station-cleared-v1'

type KnownMap = Record<string, string[]> // pathway -> term ids
type ClearedMap = Record<string, true>

function load(): KnownMap {
  try {
    const raw = learnerGet(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as KnownMap
  } catch {
    return {}
  }
}

function save(map: KnownMap) {
  try {
    learnerSet(KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('pa-vocab-known-changed'))
  } catch {
    /* ignore */
  }
}

function loadCleared(): ClearedMap {
  try {
    const raw = learnerGet(CLEARED_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ClearedMap
  } catch {
    return {}
  }
}

function saveCleared(map: ClearedMap) {
  try {
    learnerSet(CLEARED_KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('pa-vocab-station-cleared-changed'))
  } catch {
    /* ignore */
  }
}

export function getKnownVocabIds(pathway: PathwayId): string[] {
  return load()[pathway] ?? []
}

export function markVocabKnown(pathway: PathwayId, termId: string) {
  const map = load()
  const list = new Set(map[pathway] ?? [])
  list.add(termId)
  map[pathway] = [...list]
  save(map)
}

export function isVocabKnown(pathway: PathwayId, termId: string) {
  return getKnownVocabIds(pathway).includes(termId)
}

export function clearKnownVocab(pathway?: PathwayId) {
  if (!pathway) {
    save({})
    return
  }
  const map = load()
  delete map[pathway]
  save(map)
}

/** Count of known terms for a pathway (adaptive drill sizing). */
export function knownVocabCount(pathway: PathwayId) {
  return getKnownVocabIds(pathway).length
}

/**
 * True after Workplace Words / Visual Vocabulary was finished once for this pathway.
 * Drives retake framing + “I already know this word” (hidden on day-one intake).
 */
export function hasClearedVocabStation(pathway: PathwayId): boolean {
  return !!loadCleared()[pathway]
}

/** Call when the learner leaves Visual Vocabulary after the first-set gate is clear. */
export function markVocabStationCleared(pathway: PathwayId) {
  const map = loadCleared()
  if (map[pathway]) return
  map[pathway] = true
  saveCleared(map)
}

export function clearVocabStationCleared(pathway?: PathwayId) {
  if (!pathway) {
    saveCleared({})
    return
  }
  const map = loadCleared()
  delete map[pathway]
  saveCleared(map)
}
