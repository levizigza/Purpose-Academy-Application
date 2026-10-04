/**
 * Mastery tracking for the Purpose Academy journey.
 * Pattern: Khan Academy style levels — attempted → familiar → proficient → mastered.
 * Persisted in sessionStorage so Practice Mode and student runs keep progress.
 */

export type MasteryLevel = 'locked' | 'attempted' | 'familiar' | 'proficient' | 'mastered'

export type SkillId =
  | 'language'
  | 'career-assessment'
  | 'vocab'
  | 'word-action'
  | 'matching'
  | 'eye-spy'
  | 'instructions'
  | 'site-phrases'
  | 'digital'
  | 'safety'
  | 'tools'
  | 'systems'
  | 'observation'
  | 'site-log'
  | 'final-exam'
  | 'employment'

type SkillRecord = {
  correct: number
  wrong: number
  streak: number
  level: MasteryLevel
}

const KEY = 'pa-learning-mastery-v1'

const EMPTY: Record<SkillId, SkillRecord> = {
  language: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  'career-assessment': { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  vocab: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  'word-action': { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  matching: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  'eye-spy': { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  instructions: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  'site-phrases': { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  digital: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  safety: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  tools: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  systems: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  observation: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  'site-log': { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  'final-exam': { correct: 0, wrong: 0, streak: 0, level: 'locked' },
  employment: { correct: 0, wrong: 0, streak: 0, level: 'locked' },
}

export const SKILL_BY_STEP: Record<number, SkillId> = {
  3: 'language',
  4: 'career-assessment',
  5: 'career-assessment',
  6: 'career-assessment',
  7: 'vocab',
  8: 'word-action',
  9: 'matching',
  10: 'eye-spy',
  11: 'instructions',
  12: 'site-phrases',
  13: 'digital',
  14: 'safety',
  15: 'tools',
  16: 'systems',
  17: 'observation',
  18: 'site-log',
  19: 'final-exam',
  20: 'employment',
}

function loadAll(): Record<SkillId, SkillRecord> {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return { ...EMPTY, ...structuredCloneSafe() }
    return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    return { ...EMPTY, ...structuredCloneSafe() }
  }
}

function structuredCloneSafe(): Record<SkillId, SkillRecord> {
  return JSON.parse(JSON.stringify(EMPTY)) as Record<SkillId, SkillRecord>
}

function saveAll(data: Record<SkillId, SkillRecord>) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data))
    window.dispatchEvent(new Event('pa-mastery-changed'))
  } catch {
    /* ignore */
  }
}

function deriveLevel(rec: SkillRecord): MasteryLevel {
  if (rec.correct === 0 && rec.wrong === 0) return 'locked'
  if (rec.correct >= 8 && rec.streak >= 4) return 'mastered'
  if (rec.correct >= 5 && rec.wrong <= rec.correct) return 'proficient'
  if (rec.correct >= 2) return 'familiar'
  return 'attempted'
}

export function getSkillRecord(id: SkillId): SkillRecord {
  return loadAll()[id] || EMPTY[id]
}

export function getMasteryLevel(id: SkillId): MasteryLevel {
  return getSkillRecord(id).level
}

export function recordSkillAttempt(id: SkillId, correct: boolean) {
  const all = loadAll()
  const rec = { ...all[id] }
  if (correct) {
    rec.correct += 1
    rec.streak += 1
  } else {
    rec.wrong += 1
    rec.streak = 0
  }
  rec.level = deriveLevel(rec)
  all[id] = rec
  saveAll(all)
  return rec
}

export function markSkillOpened(id: SkillId) {
  const all = loadAll()
  const rec = { ...all[id] }
  if (rec.level === 'locked') {
    rec.level = 'attempted'
    all[id] = rec
    saveAll(all)
  }
}

export function resetMastery() {
  try {
    sessionStorage.removeItem(KEY)
    window.dispatchEvent(new Event('pa-mastery-changed'))
  } catch {
    /* ignore */
  }
}

export function masteryLabel(level: MasteryLevel): string {
  switch (level) {
    case 'mastered':
      return 'Mastered'
    case 'proficient':
      return 'Proficient'
    case 'familiar':
      return 'Familiar'
    case 'attempted':
      return 'Started'
    default:
      return 'Locked'
  }
}

export function unitMasteryPercent(stepRange: number[]): number {
  const skills = [...new Set(stepRange.map((s) => SKILL_BY_STEP[s]).filter(Boolean))] as SkillId[]
  if (!skills.length) return 0
  const weights: Record<MasteryLevel, number> = {
    locked: 0,
    attempted: 25,
    familiar: 50,
    proficient: 80,
    mastered: 100,
  }
  const sum = skills.reduce((acc, id) => acc + weights[getMasteryLevel(id)], 0)
  return Math.round(sum / skills.length)
}
