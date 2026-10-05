/**
 * Adaptive vocabulary — Purpose Academy narration mold.
 * If a learner already knows a word, do not force repeated teaching.
 * Known words still count toward the unit once English is confirmed.
 */

import type { PathwayId } from '../pathways/types'

const KEY = 'pa-vocab-known-v1'

type KnownMap = Record<string, string[]> // pathway -> term ids

function load(): KnownMap {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as KnownMap
  } catch {
    return {}
  }
}

function save(map: KnownMap) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('pa-vocab-known-changed'))
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
