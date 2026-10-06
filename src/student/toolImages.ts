/**
 * Clear single-object images for vocabulary / quiz prompts.
 * Prefer unmistakable product photos of the exact object —
 * never busy site atmosphere photos.
 */
import hardHatSvg from '../assets/photos/tools/hard-hat.svg'
import hammerSvg from '../assets/photos/tools/hammer.svg'
import tapeSvg from '../assets/photos/tools/tape-measure.svg'
import sawSvg from '../assets/photos/tools/saw.svg'
import drillSvg from '../assets/photos/tools/drill.svg'
import levelSvg from '../assets/photos/tools/level.svg'
import ppeSvg from '../assets/photos/tools/ppe.svg'

import hammerPhoto from '../assets/photos/tools/hammer-clear.jpg'
import drillPhoto from '../assets/photos/tools/drill-clear.jpg'
import sawPhoto from '../assets/photos/tools/saw-photo.jpg'
import tapePhoto from '../assets/photos/tools/tape-photo.jpg'
import hardHatPhoto from '../assets/photos/tools/hardhat-photo.jpg'
import levelPhoto from '../assets/photos/tools/level-photo.jpg'
import ppePhoto from '../assets/photos/tools/ppe-clear.jpg'

export type ToolImageKey =
  | 'hard-hat'
  | 'hammer'
  | 'tape-measure'
  | 'saw'
  | 'drill'
  | 'level'
  | 'ppe'
  | 'safety-check'

/**
 * Every identify prompt maps to one clear object image.
 * Photos when the subject alone fills the frame; SVG only as backup.
 */
const TOOL_IMAGES: Record<ToolImageKey, string> = {
  'hard-hat': hardHatPhoto,
  hammer: hammerPhoto,
  'tape-measure': tapePhoto,
  saw: sawPhoto,
  drill: drillPhoto,
  level: levelPhoto, // wooden spirit level with visible bubble
  ppe: ppePhoto,
  'safety-check': ppePhoto,
}

export const TOOL_ICONS = {
  'hard-hat': hardHatSvg,
  hammer: hammerSvg,
  'tape-measure': tapeSvg,
  saw: sawSvg,
  drill: drillSvg,
  level: levelSvg,
  ppe: ppeSvg,
} as const

const NAME_TO_KEY: Record<string, ToolImageKey> = {
  'hard hat': 'hard-hat',
  hardhat: 'hard-hat',
  hammer: 'hammer',
  'tape measure': 'tape-measure',
  tape: 'tape-measure',
  saw: 'saw',
  drill: 'drill',
  level: 'level',
  ppe: 'ppe',
  'personal protective equipment': 'ppe',
  'safety gear (ppe)': 'ppe',
  'safety gear': 'ppe',
  'safety check': 'safety-check',
}

export function toolImage(key?: ToolImageKey | string | null): string | undefined {
  if (!key) return undefined
  if (key in TOOL_IMAGES) return TOOL_IMAGES[key as ToolImageKey]
  const mapped = NAME_TO_KEY[String(key).trim().toLowerCase()]
  return mapped ? TOOL_IMAGES[mapped] : undefined
}

export function imageForAnswer(answer: string): string | undefined {
  return toolImage(answer)
}
