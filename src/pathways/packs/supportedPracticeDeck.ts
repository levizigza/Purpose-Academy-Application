/**
 * Supported Practice media deck — Level-4 sentences matched to Mixkit RF clips.
 * Video Match: hear sentence → tap the matching clip (3 options).
 * Copycat: watch clip → tap words in order to rebuild the sentence.
 */
import type { PathwayId } from '../types'

export type SupportedPracticeItem = {
  id: string
  sentence: string
  /** Path under public/, e.g. media/supported-practice/hammer.mp4 */
  video: string
}

const CONSTRUCTION: SupportedPracticeItem[] = [
  { id: 'sp-c-hammer', sentence: 'He hammers a nail into the wood.', video: 'media/supported-practice/hammer.mp4' },
  { id: 'sp-c-drill', sentence: 'The drill makes a hole in the wood.', video: 'media/supported-practice/drill.mp4' },
  { id: 'sp-c-hat', sentence: 'He puts on a hard hat.', video: 'media/supported-practice/hard-hat.mp4' },
  { id: 'sp-c-measure', sentence: 'She marks the wood for cutting.', video: 'media/supported-practice/measure.mp4' },
  { id: 'sp-c-saw', sentence: 'The saw cuts the wood.', video: 'media/supported-practice/saw.mp4' },
  { id: 'sp-c-brick', sentence: 'Workers build a brick wall.', video: 'media/supported-practice/brick.mp4' },
  { id: 'sp-c-concrete', sentence: 'They work with wet concrete.', video: 'media/supported-practice/concrete.mp4' },
]

const LOGISTICS: SupportedPracticeItem[] = [
  { id: 'sp-l-forklift', sentence: 'He drives a forklift in the warehouse.', video: 'media/supported-practice/forklift.mp4' },
  { id: 'sp-l-clipboard', sentence: 'He writes on a clipboard.', video: 'media/supported-practice/clipboard.mp4' },
  { id: 'sp-l-truck', sentence: 'A truck arrives at the warehouse.', video: 'media/supported-practice/truck.mp4' },
  { id: 'sp-l-warehouse', sentence: 'He moves through the warehouse.', video: 'media/supported-practice/warehouse.mp4' },
  { id: 'sp-l-hammer', sentence: 'He hammers a nail into the wood.', video: 'media/supported-practice/hammer.mp4' },
  { id: 'sp-l-hat', sentence: 'He puts on a hard hat.', video: 'media/supported-practice/hard-hat.mp4' },
]

const COMMUNITY: SupportedPracticeItem[] = [
  { id: 'sp-m-nurse', sentence: 'The nurse helps the woman in bed.', video: 'media/supported-practice/nurse-help.mp4' },
  { id: 'sp-m-sofa', sentence: 'The nurse stands with the patient.', video: 'media/supported-practice/nurse-sofa.mp4' },
  { id: 'sp-m-phone', sentence: 'He talks on the phone at his desk.', video: 'media/supported-practice/phone.mp4' },
  { id: 'sp-m-clipboard', sentence: 'He writes on a clipboard.', video: 'media/supported-practice/clipboard.mp4' },
  { id: 'sp-m-hat', sentence: 'He puts on a hard hat.', video: 'media/supported-practice/hard-hat.mp4' },
  { id: 'sp-m-truck', sentence: 'A truck arrives at the warehouse.', video: 'media/supported-practice/truck.mp4' },
]

export const SUPPORTED_PRACTICE_DECK: Record<PathwayId, readonly SupportedPracticeItem[]> = {
  construction: CONSTRUCTION,
  logistics: LOGISTICS,
  community: COMMUNITY,
}

export function supportedPracticeDeck(pathway: PathwayId): readonly SupportedPracticeItem[] {
  return SUPPORTED_PRACTICE_DECK[pathway] || CONSTRUCTION
}

export function supportedVideoSrc(rel: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${rel.replace(/^\//, '')}`
}

/** Split a Level-4 sentence into tap chips (keep punctuation with last word). */
export function sentenceChips(sentence: string): string[] {
  return sentence
    .trim()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
}
