import type { VocabTerm } from './journeyCurriculum'

/** Worksheet Level-1 page size (shared with VocabSheet / Sentence Structure). */
export const LEVEL1_PAGE_SIZE = 20

/** Daily Conversation rows use dc-vv-* studio mats — never use them as specialty distractors. */
export function isDailyConversationTerm(term: VocabTerm): boolean {
  return typeof term.imageKey === 'string' && term.imageKey.startsWith('dc-vv-')
}

/** Prefer specialty-domain terms; fall back to full vocab only if the specialty pool is too thin. */
export function specialtyVocabPool(vocab: readonly VocabTerm[]): VocabTerm[] {
  const specialty = vocab.filter((t) => !isDailyConversationTerm(t))
  return specialty.length >= 4 ? specialty : [...vocab]
}

/** Home language through the greetings and the first half of the workplace words, then English only. */
export type VocabLanguageStage = 'wheels' | 'english'

/** First card that is English only: after the greetings, halfway through the workplace words. */
export function vocabEnglishCutoff(terms: readonly VocabTerm[]): number {
  let start = -1
  let workplace = 0
  for (let i = 0; i < terms.length; i += 1) {
    if (isDailyConversationTerm(terms[i])) continue
    if (start < 0) start = i
    workplace += 1
  }
  if (start < 0 || workplace === 0) return terms.length
  return start + Math.floor(workplace / 2)
}

export function vocabLanguageStage(index: number, cutoff: number): VocabLanguageStage {
  if (index >= cutoff) return 'english'
  return 'wheels'
}

/**
 * Student-practice order for every stream.
 * Greetings first, then the workplace pictures, then any later conversation words.
 * Halfway through the workplace pictures the cards become English only.
 */
export function orderVocabSection(vocab: readonly VocabTerm[]): VocabTerm[] {
  const greetings = vocab.filter(isDailyConversationTerm)
  const workplace = vocab.filter((term) => !isDailyConversationTerm(term))
  return [
    ...greetings.slice(0, LEVEL1_PAGE_SIZE),
    ...workplace,
    ...greetings.slice(LEVEL1_PAGE_SIZE),
  ]
}

export function sentenceLadderGateTerms(vocab: readonly VocabTerm[]): VocabTerm[] {
  const dc = vocab.filter(isDailyConversationTerm).slice(0, LEVEL1_PAGE_SIZE)
  const specialty = specialtyVocabPool(vocab).slice(0, LEVEL1_PAGE_SIZE)
  const seen = new Set<string>()
  const out: VocabTerm[] = []
  for (const term of [...dc, ...specialty]) {
    if (seen.has(term.id)) continue
    seen.add(term.id)
    out.push(term)
  }
  return out.length ? out : vocab.slice(0, LEVEL1_PAGE_SIZE)
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

/**
 * Pick distractors from the specialty-domain pool (Construction / Logistics / Community craft words),
 * optionally preferring Word→Action term ids so drills stay inside the action deck.
 */
export function pickSpecialtyDistractors(
  vocab: readonly VocabTerm[],
  correctId: string,
  count = 3,
  preferIds?: ReadonlySet<string> | readonly string[],
): VocabTerm[] {
  const pool = specialtyVocabPool(vocab).filter((t) => t.id !== correctId)
  if (!pool.length) return []

  const prefer = preferIds
    ? preferIds instanceof Set
      ? preferIds
      : new Set(preferIds)
    : null

  const preferred = prefer ? pool.filter((t) => prefer.has(t.id)) : []
  const rest = prefer ? pool.filter((t) => !prefer.has(t.id)) : pool
  const ordered = [...shuffleInPlace([...preferred]), ...shuffleInPlace([...rest])]

  const seen = new Set<string>()
  const out: VocabTerm[] = []
  for (const term of ordered) {
    if (seen.has(term.id)) continue
    seen.add(term.id)
    out.push(term)
    if (out.length >= count) break
  }
  return out
}

/**
 * Worksheet-sized pictured vocab deck (unknown specialty first).
 * Kept for residual callers / future drills — Supported Practice now uses sentence cloze photos.
 */
export function matchPracticeDeck(
  vocab: readonly VocabTerm[],
  knownIds: readonly string[],
  pageSize = LEVEL1_PAGE_SIZE,
): VocabTerm[] {
  const known = new Set(knownIds)
  const specialty = specialtyVocabPool(vocab)
  const unknownSpecialty = specialty.filter((t) => !known.has(t.id))
  const unknown = vocab.filter((t) => !known.has(t.id))
  const pool =
    unknownSpecialty.length >= 4
      ? unknownSpecialty
      : unknown.length >= 4
        ? unknown
        : specialty.length
          ? specialty
          : vocab
  return pool.slice(0, Math.min(pageSize, pool.length))
}

/** Shuffle a choice list for display (correct + distractors). */
export function shuffleChoices<T>(items: readonly T[]): T[] {
  return shuffleInPlace([...items])
}

/** Stable key for “never the same choice order twice in a row.” */
export function choiceOrderKey(items: readonly string[]): string {
  return items.join('\0')
}

/**
 * Shuffle until the order differs from `prevKey` (when more than one item).
 * Used by VV pick bank so position memory cannot clear a word.
 */
export function shuffleChoicesFresh(
  items: readonly string[],
  prevKey: string | null,
  attempts = 8,
): string[] {
  if (items.length <= 1) return [...items]
  let next = shuffleChoices(items)
  let key = choiceOrderKey(next)
  let tries = 0
  while (prevKey && key === prevKey && tries < attempts) {
    next = shuffleChoices(items)
    key = choiceOrderKey(next)
    tries += 1
  }
  return next
}

/**
 * Build a ~5-word VV pick bank: correct English + distractors from the same
 * worksheet page / station pool (same language level). Dedupes by normalized
 * English so twin spellings never appear as fake choices.
 */
export function buildVocabPickBank(
  correct: VocabTerm,
  pool: readonly VocabTerm[],
  size = 5,
): string[] {
  const need = Math.max(0, size - 1)
  const correctNorm = correct.english.trim().toLowerCase()
  const seen = new Set<string>([correctNorm])
  const distractors: string[] = []
  for (const term of shuffleChoices(pool.filter((t) => t.id !== correct.id))) {
    const norm = term.english.trim().toLowerCase()
    if (!norm || seen.has(norm)) continue
    seen.add(norm)
    distractors.push(term.english)
    if (distractors.length >= need) break
  }
  return [correct.english, ...distractors]
}
