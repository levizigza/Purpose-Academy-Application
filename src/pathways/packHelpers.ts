import type { HomeLang } from '../student/journeyCurriculum'

/** Compact gloss helper for pathway vocab packs. */
export function gloss(
  Spanish: string,
  Arabic: string,
  Hindi: string,
  Amharic: string,
  Tigrinya: string,
): Record<HomeLang, string> {
  return { Spanish, Arabic, Hindi, Amharic, Tigrinya }
}

export function hint(
  English: string,
  Spanish: string,
  Arabic: string,
  Hindi: string,
  Amharic: string,
  Tigrinya: string,
) {
  return { English, Spanish, Arabic, Hindi, Amharic, Tigrinya }
}
