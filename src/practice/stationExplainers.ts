/**
 * Short how-it-works explainers before each Practice station.
 * Videos live in public/explainers/ — Edge neural VO (Jenny), not robotic Piper.
 */

import { learnerGet, learnerSet } from './learnerStore'

const KEY = 'pa-station-explainers-seen-v1'

export type StationExplainer = {
  id: string
  /** Journey steps that share this explainer (first match wins). */
  steps: number[]
  title: string
  lede: string
  /** Path under BASE_URL, e.g. explainers/workplace-words.mp4 */
  video: string
}

export const STATION_EXPLAINERS: StationExplainer[] = [
  {
    id: 'workplace-words',
    steps: [6],
    title: 'Workplace Words',
    lede: 'See the picture. Hear your language. Hear English. Type the word.',
    video: 'explainers/workplace-words.mp4',
  },
  {
    id: 'language-organize',
    steps: [7],
    title: 'Language Organize',
    lede: 'Match each picture to its word board. Soft try again if not yet.',
    video: 'explainers/language-organize.mp4',
  },
  {
    id: 'eye-spy',
    steps: [8],
    title: 'English Eye Spy',
    lede: 'Tap a picture, then its English name. Clear the board.',
    video: 'explainers/eye-spy.mp4',
  },
  {
    id: 'sentence-structure',
    steps: [9],
    title: 'Sentence Structure',
    lede: 'Four word choices stay visible. Type the matching word.',
    video: 'explainers/sentence-structure.mp4',
  },
  {
    id: 'word-action',
    steps: [10],
    title: 'Word → Action',
    lede: 'See the action. Pick which tool it uses.',
    video: 'explainers/word-action.mp4',
  },
  {
    id: 'supported-practice',
    steps: [11],
    title: 'Supported Practice',
    lede: 'Match words to pictures with help. Mistakes teach.',
    video: 'explainers/supported-practice.mp4',
  },
  {
    id: 'computer-skills',
    steps: [12],
    title: 'Basic Computer Skills',
    lede: 'Watch a short lesson, then try a simple computer task.',
    video: 'explainers/computer-skills.mp4',
  },
  {
    id: 'site-language',
    steps: [13],
    title: 'Site Language',
    lede: 'Hear a job-site phrase. Choose what it means.',
    video: 'explainers/site-language.mp4',
  },
  {
    id: 'safety',
    steps: [15],
    title: 'Safety Training',
    lede: 'Safety words with clear pictures. Needed on the job.',
    video: 'explainers/safety.mp4',
  },
  {
    id: 'tools',
    steps: [16],
    title: 'Tools & Equipment',
    lede: 'Learn each tool group. Answer one check.',
    video: 'explainers/tools.mp4',
  },
  {
    id: 'systems',
    steps: [17],
    title: 'Workplace Systems',
    lede: 'Learn each system. Answer one check.',
    video: 'explainers/systems.mp4',
  },
  {
    id: 'equipment-video',
    steps: [18],
    title: 'Equipment Videos',
    lede: 'Watch each equipment lesson, then continue.',
    video: 'explainers/equipment-video.mp4',
  },
]

type SeenMap = Record<string, true>

function loadSeen(): SeenMap {
  try {
    const raw = learnerGet(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SeenMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveSeen(map: SeenMap) {
  try {
    learnerSet(KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('pa-station-explainers-changed'))
  } catch {
    /* ignore */
  }
}

export function explainerForStep(step: number): StationExplainer | null {
  return STATION_EXPLAINERS.find((e) => e.steps.includes(step)) ?? null
}

export function hasWatchedExplainer(id: string): boolean {
  return Boolean(loadSeen()[id])
}

export function markExplainerWatched(id: string) {
  const map = loadSeen()
  if (map[id]) return
  map[id] = true
  saveSeen(map)
}

export function videoSrc(rel: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${rel.replace(/^\//, '')}`
}
