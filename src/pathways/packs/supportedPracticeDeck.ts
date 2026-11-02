/**
 * Supported Practice deck — Level-4 sentences on royalty-free photos.
 * Picture Match: hear sentence → tap the matching photo (3 options).
 * Copycat: look at the photo, hear the sentence → tap words in order.
 *
 * Photos: action stills from Mixkit royalty-free clips (media/supported-practice/posters)
 * plus the pathway object photos used in Workplace Words / Eye Spy.
 */
import { pathwayImage } from '../images'
import type { PathwayId } from '../types'

export type SupportedPracticeItem = {
  id: string
  /** Short Level-4 sentence that says what the photo shows. */
  sentence: string
  /** Action still under public/media/supported-practice/posters (stem only). */
  still?: string
  /** Pathway object photo key (pathwayImage) when there is no action still. */
  imageKey?: string
}

function still(id: string, sentence: string, stem: string): SupportedPracticeItem {
  return { id, sentence, still: stem }
}

function object(id: string, sentence: string, imageKey: string): SupportedPracticeItem {
  return { id, sentence, imageKey }
}

const CONSTRUCTION: SupportedPracticeItem[] = [
  still('sp-c-hammer', 'He hammers a nail into the wood.', 'hammer'),
  still('sp-c-drill', 'The drill makes a hole in the wood.', 'drill'),
  still('sp-c-hat', 'He puts on a hard hat.', 'hard-hat'),
  still('sp-c-saw', 'The saw cuts the wood.', 'saw'),
  still('sp-c-brick', 'He builds a brick wall.', 'brick'),
  still('sp-c-concrete', 'They work with wet concrete.', 'concrete'),
  object('sp-c-tape', 'Measure it with the tape.', 'tape-measure'),
  object('sp-c-level', 'Check it with a level.', 'level'),
]

const LOGISTICS: SupportedPracticeItem[] = [
  still('sp-l-forklift', 'He drives a forklift.', 'forklift'),
  still('sp-l-clipboard', 'He writes on a clipboard.', 'clipboard'),
  still('sp-l-truck', 'A truck arrives at the warehouse.', 'truck'),
  object('sp-l-box', 'Lift the box carefully.', 'log-box'),
  object('sp-l-cart', 'Push the cart slowly.', 'log-cart'),
  object('sp-l-pallet', 'Stack the boxes on the pallet.', 'log-pallet'),
  object('sp-l-vest', 'Wear a safety vest.', 'log-vest'),
  object('sp-l-scanner', 'Scan the label.', 'log-scanner'),
]

const COMMUNITY: SupportedPracticeItem[] = [
  still('sp-m-nurse', 'The nurse helps the woman in bed.', 'nurse-help'),
  still('sp-m-sofa', 'The nurse stands with the patient.', 'nurse-sofa'),
  still('sp-m-phone', 'He talks on the phone at his desk.', 'phone'),
  object('sp-m-gloves', 'Wear clean gloves.', 'com-gloves'),
  object('sp-m-aid', 'Get the first aid kit.', 'com-first-aid'),
  object('sp-m-chair', 'Push the wheelchair slowly.', 'com-wheelchair'),
  object('sp-m-badge', 'Show your name badge.', 'com-badge'),
  object('sp-m-keys', 'Keep the keys safe.', 'com-keys'),
]

export const SUPPORTED_PRACTICE_DECK: Record<PathwayId, readonly SupportedPracticeItem[]> = {
  construction: CONSTRUCTION,
  logistics: LOGISTICS,
  community: COMMUNITY,
}

export function supportedPracticeDeck(pathway: PathwayId): readonly SupportedPracticeItem[] {
  return SUPPORTED_PRACTICE_DECK[pathway] || CONSTRUCTION
}

/** Resolved photo URL for a deck item (action still or pathway object photo). */
export function supportedPhotoSrc(item: SupportedPracticeItem): string {
  if (item.still) {
    const base = import.meta.env.BASE_URL || '/'
    return `${base}media/supported-practice/posters/${item.still}.jpg`
  }
  return pathwayImage(item.imageKey) || ''
}

/** Split a Level-4 sentence into tap chips (keep punctuation with last word). */
export function sentenceChips(sentence: string): string[] {
  return sentence
    .trim()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
}
