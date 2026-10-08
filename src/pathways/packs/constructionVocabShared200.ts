/**
 * Shared Construction Visual Vocabulary words 1–200 for Logistics (+200 → 700)
 * and Community Support (foundational bank until community-specific docs arrive).
 */
import type { VocabTerm } from '../../student/journeyCurriculum'
import { CONSTRUCTION_VOCAB_660 } from './constructionVocab660'

export const CONSTRUCTION_VOCAB_SHARED_200: VocabTerm[] = CONSTRUCTION_VOCAB_660.slice(0, 200).map((t) => ({
  ...t,
  id: `shared-${t.id}`,
}))
