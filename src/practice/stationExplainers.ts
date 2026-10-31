/**
 * Short how-it-works explainers before each Practice station.
 * Videos live in public/explainers/ — Edge neural VO (Jenny), not robotic Piper.
 */

import { learnerGet, learnerSet } from './learnerStore'

const KEY = 'pa-station-explainers-seen-v1'

export type StationExplainer = {
  id: string
  /**
   * Journey steps that open this explainer (first match wins).
   * Empty = only via explicit stationId (e.g. Word→Action after Sentence on step 9).
   */
  steps: number[]
  title: string
  lede: string
  /** Path under BASE_URL, e.g. explainers/workplace-words.mp4 */
  video: string
}

export const STATION_EXPLAINERS: StationExplainer[] = [
  {
    id: 'your-language',
    steps: [3],
    title: 'Your Language',
    lede: 'We start in English. An arrow points at the language buttons one time — stay in English, or press the language you know best.',
    video: 'explainers/your-language.mp4',
  },
  {
    id: 'workplace-words',
    steps: [6],
    title: 'Workplace Words',
    lede: 'See the picture. Press a language you know — English is on the row. Pick and type the word.',
    video: 'explainers/workplace-words.mp4',
  },
  {
    id: 'language-organize',
    steps: [7],
    title: 'Language Organize',
    lede: 'Match each picture to its word. Wrong? Try again.',
    video: 'explainers/language-organize.mp4',
  },
  {
    id: 'eye-spy',
    steps: [8],
    title: 'English Eye Spy',
    lede: 'Tap a picture, then its English name. Pairs clear. Empty the board.',
    video: 'explainers/eye-spy.mp4',
  },
  {
    id: 'sentence-structure',
    steps: [9],
    title: 'Sentence Structure',
    lede: 'Pick the full sentence. Hear it. Type it.',
    video: 'explainers/sentence-structure.mp4',
  },
  {
    /* Same journey step as Sentence Structure (phase 2). Gate via stationId override. */
    id: 'word-action',
    steps: [],
    title: 'Word → Action',
    lede: 'See the action. Pick which tool it uses.',
    video: 'explainers/word-action.mp4',
  },
  {
    /* Step 10 — own dropdown station (like Eye Spy). */
    id: 'video-match',
    steps: [10],
    title: 'Video Match',
    lede: 'Hear the sentence. Tap the video that matches. Three short clips. Wrong? Try again.',
    video: 'explainers/video-match.mp4',
  },
  {
    /* Step 11 — own dropdown station (like Language Organize). */
    id: 'copycat',
    steps: [11],
    title: 'Copycat',
    lede: 'Watch the video. Hear the sentence. Tap the words in order — say it back.',
    video: 'explainers/copycat.mp4',
  },
  {
    id: 'workplace-instructions',
    steps: [12],
    title: 'Workplace Instructions',
    lede: 'Hear a short direction. Show you understood.',
    video: 'explainers/workplace-instructions.mp4',
  },
  {
    id: 'computer-skills',
    steps: [13],
    title: 'Basic Computer Skills',
    lede: 'Watch a short lesson, then try a simple computer task.',
    video: 'explainers/computer-skills.mp4',
  },
  {
    id: 'site-language',
    steps: [14],
    title: 'Site Language',
    lede: 'Hear a job-site phrase. Choose what it means.',
    video: 'explainers/site-language.mp4',
  },
  {
    id: 'safety',
    steps: [16],
    title: 'Safety Training',
    lede: 'Safety words with clear pictures. Needed on the job.',
    video: 'explainers/safety.mp4',
  },
  {
    id: 'tools',
    steps: [17],
    title: 'Tools & Equipment',
    lede: 'Learn each tool group. Answer one check.',
    video: 'explainers/tools.mp4',
  },
  {
    id: 'systems',
    steps: [18],
    title: 'Workplace Systems',
    lede: 'Learn each system. Answer one check.',
    video: 'explainers/systems.mp4',
  },
  {
    id: 'equipment-video',
    steps: [19],
    title: 'Equipment Videos',
    lede: 'Watch each warehouse machine, then answer practice questions.',
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

export function explainerById(id: string): StationExplainer | null {
  return STATION_EXPLAINERS.find((e) => e.id === id) ?? null
}

export function explainerForStep(step: number, stationId?: string | null): StationExplainer | null {
  if (stationId) return explainerById(stationId)
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
