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
  /** Still frame so the clip is visible before autoplay */
  poster: string
}

function clip(id: string, sentence: string, file: string): SupportedPracticeItem {
  const stem = file.replace(/\.mp4$/, '')
  return {
    id,
    sentence,
    video: `media/supported-practice/${file}`,
    poster: `media/supported-practice/posters/${stem}.jpg`,
  }
}

const CONSTRUCTION: SupportedPracticeItem[] = [
  clip('sp-c-hammer', 'He hammers a nail into the wood.', 'hammer.mp4'),
  clip('sp-c-drill', 'The drill makes a hole in the wood.', 'drill.mp4'),
  clip('sp-c-hat', 'He puts on a hard hat.', 'hard-hat.mp4'),
  clip('sp-c-measure', 'She marks the wood for cutting.', 'measure.mp4'),
  clip('sp-c-saw', 'The saw cuts the wood.', 'saw.mp4'),
  clip('sp-c-brick', 'Workers build a brick wall.', 'brick.mp4'),
  clip('sp-c-concrete', 'They work with wet concrete.', 'concrete.mp4'),
]

const LOGISTICS: SupportedPracticeItem[] = [
  clip('sp-l-forklift', 'He drives a forklift in the warehouse.', 'forklift.mp4'),
  clip('sp-l-clipboard', 'He writes on a clipboard.', 'clipboard.mp4'),
  clip('sp-l-truck', 'A truck arrives at the warehouse.', 'truck.mp4'),
  clip('sp-l-warehouse', 'He moves through the warehouse.', 'warehouse.mp4'),
  clip('sp-l-hammer', 'He hammers a nail into the wood.', 'hammer.mp4'),
  clip('sp-l-hat', 'He puts on a hard hat.', 'hard-hat.mp4'),
]

const COMMUNITY: SupportedPracticeItem[] = [
  clip('sp-m-nurse', 'The nurse helps the woman in bed.', 'nurse-help.mp4'),
  clip('sp-m-sofa', 'The nurse stands with the patient.', 'nurse-sofa.mp4'),
  clip('sp-m-phone', 'He talks on the phone at his desk.', 'phone.mp4'),
  clip('sp-m-clipboard', 'He writes on a clipboard.', 'clipboard.mp4'),
  clip('sp-m-hat', 'He puts on a hard hat.', 'hard-hat.mp4'),
  clip('sp-m-truck', 'A truck arrives at the warehouse.', 'truck.mp4'),
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
