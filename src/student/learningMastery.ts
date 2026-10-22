/**
 * Mastery tracking for the Purpose Academy journey.
 * Pattern: Khan Academy style levels: attempted → familiar → proficient → mastered.
 * Practice marks and “days showed up” serve craft (L4) — not streak FOMO.
 * Persisted in sessionStorage so Practice Mode and student runs keep progress.
 */

export type MasteryLevel = 'locked' | 'attempted' | 'familiar' | 'proficient' | 'mastered'

export type SkillId =
  | 'language'
  | 'career-assessment'
  | 'vocab'
  | 'vocab-organize'
  | 'sentence-cloze'
  | 'word-action'
  | 'matching'
  | 'eye-spy'
  | 'instructions'
  | 'site-phrases'
  | 'digital'
  | 'safety'
  | 'tools'
  | 'systems'
  | 'equipment-videos'
  | 'observation'
  | 'site-log'
  | 'final-exam'
  | 'employment'
  | 'unit-checkpoint'

type SkillRecord = {
  correct: number
  wrong: number
  streak: number
  level: MasteryLevel
  xp: number
}

type PlatformStats = {
  xp: number
  dayStreak: number
  lastActiveDay: string
  lessonsCompleted: number
  perfectRounds: number
}

const KEY = 'pa-learning-mastery-v1'
const STATS_KEY = 'pa-learning-stats-v1'

const EMPTY_SKILL = (): SkillRecord => ({ correct: 0, wrong: 0, streak: 0, level: 'locked', xp: 0 })

const EMPTY: Record<SkillId, SkillRecord> = {
  language: EMPTY_SKILL(),
  'career-assessment': EMPTY_SKILL(),
  vocab: EMPTY_SKILL(),
  'vocab-organize': EMPTY_SKILL(),
  'sentence-cloze': EMPTY_SKILL(),
  'word-action': EMPTY_SKILL(),
  matching: EMPTY_SKILL(),
  'eye-spy': EMPTY_SKILL(),
  instructions: EMPTY_SKILL(),
  'site-phrases': EMPTY_SKILL(),
  digital: EMPTY_SKILL(),
  safety: EMPTY_SKILL(),
  tools: EMPTY_SKILL(),
  systems: EMPTY_SKILL(),
  'equipment-videos': EMPTY_SKILL(),
  observation: EMPTY_SKILL(),
  'site-log': EMPTY_SKILL(),
  'final-exam': EMPTY_SKILL(),
  employment: EMPTY_SKILL(),
  'unit-checkpoint': EMPTY_SKILL(),
}

export const SKILL_BY_STEP: Record<number, SkillId> = {
  3: 'language',
  4: 'career-assessment',
  5: 'career-assessment',
  6: 'vocab',
  /** Standalone match: complete language group + picture. */
  7: 'vocab-organize',
  /** After Visual Vocabulary + language organize: find every picture again. */
  8: 'eye-spy',
  /** Sentence Structure first when the pack has a cloze bank; Word → Action follows in-station. */
  9: 'sentence-cloze',
  10: 'matching',
  11: 'instructions',
  12: 'site-phrases',
  /** After practice: RIASEC interest inventory for specialization. */
  13: 'career-assessment',
  14: 'digital',
  15: 'safety',
  16: 'tools',
  17: 'systems',
  /** After systems: equipment familiarization videos, then hands-on observation. */
  18: 'equipment-videos',
  19: 'observation',
  20: 'site-log',
  21: 'final-exam',
  22: 'employment',
}

/** Steps that need at least "familiar" mastery before Continue unlocks (real platform gate). */
export const GATED_SKILL_STEPS = new Set([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])

const LEVEL_WEIGHT: Record<MasteryLevel, number> = {
  locked: 0,
  attempted: 25,
  familiar: 50,
  proficient: 80,
  mastered: 100,
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadAll(): Record<SkillId, SkillRecord> {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return structuredCloneSafe()
    const parsed = JSON.parse(raw) as Record<string, SkillRecord>
    const base = structuredCloneSafe()
    for (const id of Object.keys(base) as SkillId[]) {
      if (parsed[id]) base[id] = { ...EMPTY_SKILL(), ...parsed[id] }
    }
    return base
  } catch {
    return structuredCloneSafe()
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

function loadStats(): PlatformStats {
  try {
    const raw = sessionStorage.getItem(STATS_KEY)
    if (!raw) return { xp: 0, dayStreak: 0, lastActiveDay: '', lessonsCompleted: 0, perfectRounds: 0 }
    return { xp: 0, dayStreak: 0, lastActiveDay: '', lessonsCompleted: 0, perfectRounds: 0, ...JSON.parse(raw) }
  } catch {
    return { xp: 0, dayStreak: 0, lastActiveDay: '', lessonsCompleted: 0, perfectRounds: 0 }
  }
}

function saveStats(stats: PlatformStats) {
  try {
    sessionStorage.setItem(STATS_KEY, JSON.stringify(stats))
    window.dispatchEvent(new Event('pa-mastery-changed'))
  } catch {
    /* ignore */
  }
}

function touchStreak() {
  const stats = loadStats()
  const today = todayKey()
  if (stats.lastActiveDay === today) return stats
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = yesterday.toISOString().slice(0, 10)
  stats.dayStreak = stats.lastActiveDay === yKey ? stats.dayStreak + 1 : Math.max(1, stats.dayStreak || 1)
  stats.lastActiveDay = today
  saveStats(stats)
  return stats
}

function deriveLevel(rec: SkillRecord): MasteryLevel {
  if (rec.correct === 0 && rec.wrong === 0) return 'locked'
  if (rec.correct >= 10 && rec.streak >= 5) return 'mastered'
  if (rec.correct >= 6 && rec.wrong <= rec.correct) return 'proficient'
  if (rec.correct >= 3) return 'familiar'
  return 'attempted'
}

export function getSkillRecord(id: SkillId): SkillRecord {
  return loadAll()[id] || EMPTY_SKILL()
}

export function getMasteryLevel(id: SkillId): MasteryLevel {
  return getSkillRecord(id).level
}

/** Average mastery across a skill domain (student dashboard progress bars). */
export function domainMasteryPercent(skills: SkillId[]): number {
  if (!skills.length) return 0
  const sum = skills.reduce((acc, id) => acc + LEVEL_WEIGHT[getMasteryLevel(id)], 0)
  return Math.round(sum / skills.length)
}

export const SKILL_DOMAINS = {
  vocabulary: ['vocab', 'vocab-organize', 'eye-spy', 'sentence-cloze', 'word-action', 'matching'] as SkillId[],
  safety: ['safety', 'instructions'] as SkillId[],
  tools: ['tools', 'equipment-videos', 'site-phrases'] as SkillId[],
  systems: ['systems', 'observation', 'site-log', 'digital'] as SkillId[],
}

export function getPlatformStats(): PlatformStats {
  return loadStats()
}

function isFamiliarOrBetter(level: MasteryLevel) {
  return level === 'familiar' || level === 'proficient' || level === 'mastered'
}

export function recordSkillAttempt(id: SkillId, correct: boolean, xpAward = 10) {
  const all = loadAll()
  const rec = { ...all[id] }
  const prevLevel = rec.level
  if (correct) {
    rec.correct += 1
    rec.streak += 1
    rec.xp += xpAward
  } else {
    rec.wrong += 1
    rec.streak = 0
  }
  rec.level = deriveLevel(rec)
  all[id] = rec
  saveAll(all)

  const stats = touchStreak()
  if (correct) {
    stats.xp += xpAward
    if (rec.streak >= 5) stats.perfectRounds += 1
    saveStats(stats)
  }

  /* First time this skill clears the Familiar gate — theater cue for the journey shell. */
  if (!isFamiliarOrBetter(prevLevel) && isFamiliarOrBetter(rec.level)) {
    try {
      window.dispatchEvent(
        new CustomEvent('pa-familiar-earned', { detail: { skill: id, level: rec.level } }),
      )
    } catch {
      /* ignore */
    }
  }
  return rec
}

export function markLessonCompleted(step: number) {
  const stats = touchStreak()
  stats.lessonsCompleted += 1
  stats.xp += 25
  saveStats(stats)
  const skill = SKILL_BY_STEP[step]
  if (skill) {
    const all = loadAll()
    const rec = { ...all[skill] }
    const prevLevel = rec.level
    rec.xp += 25
    if (rec.level === 'locked' || rec.level === 'attempted') {
      rec.correct = Math.max(rec.correct, 3)
      rec.level = deriveLevel(rec)
    }
    all[skill] = rec
    saveAll(all)
    if (!isFamiliarOrBetter(prevLevel) && isFamiliarOrBetter(rec.level)) {
      try {
        window.dispatchEvent(
          new CustomEvent('pa-familiar-earned', { detail: { skill, level: rec.level } }),
        )
      } catch {
        /* ignore */
      }
    }
  }
}

export function markSkillOpened(id: SkillId) {
  const all = loadAll()
  const rec = { ...all[id] }
  if (rec.level === 'locked') {
    rec.level = 'attempted'
    all[id] = rec
    saveAll(all)
  }
  touchStreak()
}

export function resetMastery() {
  try {
    sessionStorage.removeItem(KEY)
    sessionStorage.removeItem(STATS_KEY)
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

/** Short station name for Familiar theater / mastery chrome. */
export function skillStationLabel(id: SkillId): string {
  switch (id) {
    case 'language':
      return 'Your Language'
    case 'career-assessment':
      return 'Career Path'
    case 'vocab':
      return 'Visual Vocabulary'
    case 'vocab-organize':
      return 'Language Organize'
    case 'sentence-cloze':
      return 'Sentence Structure'
    case 'word-action':
      return 'Word → Action'
    case 'matching':
      return 'Supported Practice'
    case 'eye-spy':
      return 'English Eye Spy'
    case 'instructions':
      return 'Workplace Instructions'
    case 'site-phrases':
      return 'Workplace Language'
    case 'digital':
      return 'Basic Computer Skills'
    case 'safety':
      return 'Safety Training'
    case 'tools':
      return 'Tools & Equipment'
    case 'systems':
      return 'Workplace Systems'
    case 'equipment-videos':
      return 'Equipment Familiarization'
    case 'observation':
      return 'Instructor Observation'
    case 'site-log':
      return 'Floor Training'
    case 'final-exam':
      return 'Final Exam'
    case 'employment':
      return 'Employment'
    case 'unit-checkpoint':
      return 'Unit Checkpoint'
    default:
      return 'This skill'
  }
}

export function unitMasteryPercent(stepRange: number[]): number {
  const skills = [...new Set(stepRange.map((s) => SKILL_BY_STEP[s]).filter(Boolean))] as SkillId[]
  if (!skills.length) return 0
  const sum = skills.reduce((acc, id) => acc + LEVEL_WEIGHT[getMasteryLevel(id)], 0)
  return Math.round(sum / skills.length)
}

export function overallMasteryPercent(): number {
  const skills = Object.keys(EMPTY).filter((id) => id !== 'unit-checkpoint') as SkillId[]
  const sum = skills.reduce((acc, id) => acc + LEVEL_WEIGHT[getMasteryLevel(id)], 0)
  return Math.round(sum / skills.length)
}

/** True when the learner has earned enough skill signal to leave this lesson. */
export function canAdvanceFromStep(step: number): boolean {
  if (!GATED_SKILL_STEPS.has(step)) return true
  const skill = SKILL_BY_STEP[step]
  if (!skill) return true
  const level = getMasteryLevel(skill)
  return level === 'familiar' || level === 'proficient' || level === 'mastered'
}

export function advanceBlockedReason(step: number): string | null {
  if (canAdvanceFromStep(step)) return null
  const skill = SKILL_BY_STEP[step]
  if (!skill) return null
  return `Keep practising until this skill is Familiar (${masteryLabel(getMasteryLevel(skill))} now).`
}

/** Soft credit toward Familiar when a learner marks a vocab word as already known. */
export function creditKnownVocabMastery() {
  return recordSkillAttempt('vocab', true, 6)
}
