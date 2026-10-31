/**
 * One-time first-example coach per station — highlight the real control,
 * say what to do, advance after the learner acts. Then stay quiet forever
 * (until Start over). Shared Desktop ↔ Phone via learnerStore.
 */

import { learnerGet, learnerSet } from './learnerStore'

const KEY = 'pa-station-coach-seen-v1'

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
    window.dispatchEvent(new CustomEvent('pa-station-coach-changed'))
  } catch {
    /* ignore */
  }
}

export function stationCoachSeen(stationId: string): boolean {
  return Boolean(load()[stationId])
}

export function markStationCoachSeen(stationId: string) {
  if (!stationId) return
  const map = load()
  if (map[stationId]) return
  map[stationId] = true
  save(map)
  clearCoachProgress(stationId)
}

/** In-flight step index — survives React remounts when the first action re-renders the card. */
const progress = new Map<string, number>()

export function getCoachProgress(stationId: string): number {
  return progress.get(stationId) ?? 0
}

export function setCoachProgress(stationId: string, step: number) {
  progress.set(stationId, step)
}

export function clearCoachProgress(stationId?: string) {
  if (stationId) progress.delete(stationId)
  else progress.clear()
}

export type CoachStep = {
  /** CSS selector for the live control to spotlight */
  target: string
  /** Plain crew instruction — e.g. "Press your language" */
  say: string
}

export const STATION_COACH: Record<string, CoachStep[]> = {
  'workplace-words': [
    /* English auto-plays after the language bridge — coach lang, then pick + type. */
    { target: '[data-coach="vv-lang"]', say: 'Press a language you know' },
    { target: '[data-coach="vv-pick"]', say: 'Pick the matching English word' },
    { target: '[data-coach="vv-type"]', say: 'Type that word · then Go' },
  ],
  'language-organize': [
    { target: '[data-coach="org-pic"]', say: 'Press a picture' },
    { target: '[data-coach="org-drop"]', say: 'Drop it on the empty box' },
  ],
  'eye-spy': [
    { target: '[data-coach="spy-pic"]', say: 'Press a picture on the board' },
    { target: '[data-coach="spy-word"]', say: 'Press the matching English word — they clear together' },
  ],
  'sentence-structure': [
    { target: '[data-coach="sent-pick"]', say: 'Pick the full sentence that fits' },
    { target: '[data-coach="sent-hear"]', say: 'Hear the sentence' },
    { target: '[data-coach="sent-type"]', say: 'Type the full sentence · then Go' },
  ],
  'word-action': [
    { target: '[data-coach="choice-opt"]', say: 'Press the answer that fits' },
  ],
  'video-match': [
    { target: '[data-coach="sp-video"]', say: 'Hear the sentence. Tap the matching video.' },
  ],
  copycat: [
    { target: '[data-coach="sp-copycat"]', say: 'Watch the video. Then tap the words in order.' },
  ],
  'workplace-instructions': [
    { target: '[data-coach="instr-hear"]', say: 'Press Hear English' },
    { target: '[data-coach="instr-choice"]', say: 'Press what you should do' },
  ],
  'computer-skills': [
    { target: '[data-coach="comp-watch"]', say: 'Press play on the lesson video' },
    { target: '[data-coach="comp-try"]', say: 'Try the task. Then check your answer' },
  ],
  'site-language': [
    { target: '[data-coach="phrase-hear"]', say: 'Press Hear English' },
    { target: '[data-coach="choice-opt"]', say: 'Press what the phrase means' },
  ],
  'safety': [
    { target: '[data-coach="choice-opt"]', say: 'Press the safety answer' },
  ],
  'tools': [
    { target: '[data-coach="choice-opt"]', say: 'Press the tool answer' },
  ],
  'systems': [
    { target: '[data-coach="choice-opt"]', say: 'Press the systems answer' },
  ],
  'equipment-video': [
    { target: '[data-coach="equip-watch"]', say: 'Press play on the equipment video' },
    { target: '[data-coach="equip-next"]', say: 'After the video, answer the practice questions' },
    { target: '[data-coach="equip-answer"]', say: 'Choose the answer that matches the video' },
  ],
}
