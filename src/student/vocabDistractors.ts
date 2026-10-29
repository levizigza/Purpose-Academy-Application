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

/**
 * Ladder gate before Construction Sentence Structure:
 * Daily Conversation Level-1 (greetings page) + specialty Visual Vocabulary Level-1
 * (first workplace picture page). Sentences must not unlock on greetings alone.
 */
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
 * Supported Practice matching deck — worksheet-sized, not the full ~800-word dump.
 * Prefer unknown specialty pictures; fall back to unknown then specialty Level-1.
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
