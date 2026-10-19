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

/** Shuffle a choice list for display (correct + distractors). */
export function shuffleChoices<T>(items: readonly T[]): T[] {
  return shuffleInPlace([...items])
}
