import type { VocabTerm } from './journeyCurriculum'

/** Daily Conversation rows use dc-vv-* studio mats — never use them as specialty distractors. */
export function isDailyConversationTerm(term: VocabTerm): boolean {
  return typeof term.imageKey === 'string' && term.imageKey.startsWith('dc-vv-')
}

/** Prefer specialty-domain terms; fall back to full vocab only if the specialty pool is too thin. */
export function specialtyVocabPool(vocab: readonly VocabTerm[]): VocabTerm[] {
  const specialty = vocab.filter((t) => !isDailyConversationTerm(t))
  return specialty.length >= 4 ? specialty : [...vocab]
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
