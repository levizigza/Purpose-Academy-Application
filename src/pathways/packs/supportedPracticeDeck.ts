/**
 * Supported Practice deck — short Level-4 sentences + royalty-free object photos.
 * Uses the same pathway photo keys as Workplace Words / Eye Spy (contain framing).
 * Not the 560 cloze worksheet tiles (those are denser and look like clipart).
 */
import type { PathwayId } from '../types'

export type SupportedPracticeItem = {
  id: string
  /** Full simple English sentence (no blanks). */
  sentence: string
  /** Key for pathwayImage() / tool photos. */
  imageKey: string
}

const CONSTRUCTION: SupportedPracticeItem[] = [
  { id: 'sp-c-hammer', sentence: 'This is a hammer.', imageKey: 'hammer' },
  { id: 'sp-c-hat', sentence: 'Wear a hard hat.', imageKey: 'hard-hat' },
  { id: 'sp-c-drill', sentence: 'Use the drill carefully.', imageKey: 'drill' },
  { id: 'sp-c-tape', sentence: 'Measure with the tape.', imageKey: 'tape-measure' },
  { id: 'sp-c-saw', sentence: 'The saw cuts wood.', imageKey: 'saw' },
  { id: 'sp-c-level', sentence: 'Check with a level.', imageKey: 'level' },
  { id: 'sp-c-ppe', sentence: 'Wear your safety gear.', imageKey: 'ppe' },
  { id: 'sp-c-crew', sentence: 'The crew works on site.', imageKey: 'path-construction' },
]

const LOGISTICS: SupportedPracticeItem[] = [
  { id: 'sp-l-box', sentence: 'Lift the box carefully.', imageKey: 'log-box' },
  { id: 'sp-l-cart', sentence: 'Push the cart slowly.', imageKey: 'log-cart' },
  { id: 'sp-l-dolly', sentence: 'Use the dolly for heavy loads.', imageKey: 'log-dolly' },
  { id: 'sp-l-pallet', sentence: 'Stack boxes on the pallet.', imageKey: 'log-pallet' },
  { id: 'sp-l-truck', sentence: 'The truck is ready.', imageKey: 'log-truck' },
  { id: 'sp-l-vest', sentence: 'Wear a safety vest.', imageKey: 'log-vest' },
  { id: 'sp-l-label', sentence: 'Read the label first.', imageKey: 'log-label' },
  { id: 'sp-l-dock', sentence: 'Meet at the dock.', imageKey: 'log-dock' },
]

const COMMUNITY: SupportedPracticeItem[] = [
  { id: 'sp-m-phone', sentence: 'Answer the phone politely.', imageKey: 'com-phone' },
  { id: 'sp-m-badge', sentence: 'Show your name badge.', imageKey: 'com-badge' },
  { id: 'sp-m-clipboard', sentence: 'Write on the clipboard.', imageKey: 'com-clipboard' },
  { id: 'sp-m-gloves', sentence: 'Wear clean gloves.', imageKey: 'com-gloves' },
  { id: 'sp-m-aid', sentence: 'Get the first-aid kit.', imageKey: 'com-first-aid' },
  { id: 'sp-m-keys', sentence: 'Keep the keys safe.', imageKey: 'com-keys' },
  { id: 'sp-m-walker', sentence: 'Help with the walker.', imageKey: 'com-walker' },
  { id: 'sp-m-welcome', sentence: 'Welcome people kindly.', imageKey: 'com-welcome' },
]

export const SUPPORTED_PRACTICE_DECK: Record<PathwayId, readonly SupportedPracticeItem[]> = {
  construction: CONSTRUCTION,
  logistics: LOGISTICS,
  community: COMMUNITY,
}

export function supportedPracticeDeck(pathway: PathwayId): readonly SupportedPracticeItem[] {
  return SUPPORTED_PRACTICE_DECK[pathway] || CONSTRUCTION
}
