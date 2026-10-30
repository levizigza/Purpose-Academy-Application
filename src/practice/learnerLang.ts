/**
 * Learner preferred support language — shared Desktop ↔ Phone via learnerStore.
 * Used for instruction narrations (coach, explainer ledes, video chrome).
 * Does not replace Workplace Words EN chip / More languages — those stay on-card.
 */

import { learnerGet, learnerSet } from './learnerStore'
import type { SupportLang } from '../student/journeyCurriculum'
import { SUPPORT_LANGUAGES } from '../student/journeyCurriculum'
import { findHearLanguage, HEAR_LANGUAGES, type HearLanguage } from '../student/hearLanguages'
import { SUPPORT_LANG_CODE, SUPPORT_TTS_LANG } from '../student/speech'

const KEY = 'pa-support-lang-v1'

const SUPPORT_IDS = new Set(SUPPORT_LANGUAGES.map((l) => l.id))

export function isSupportLang(value: string): value is SupportLang {
  return SUPPORT_IDS.has(value as SupportLang)
}

export function getLearnerSupportLang(): SupportLang {
  try {
    const raw = learnerGet(KEY)
    if (raw && isSupportLang(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'English'
}

export function setLearnerSupportLang(lang: SupportLang) {
  try {
    learnerSet(KEY, lang)
    window.dispatchEvent(
      new CustomEvent('pa-support-lang-changed', { detail: { lang } }),
    )
  } catch {
    /* ignore */
  }
}

/** Map SupportLang (or free-text preferred_language) → HearLanguage for translate+TTS. */
export function hearLanguageFromPreferred(preferred: string): HearLanguage {
  const clean = String(preferred || '').trim()
  if (!clean || /^english$/i.test(clean) || clean.toLowerCase() === 'en') {
    return HEAR_LANGUAGES[0] // English
  }
  if (isSupportLang(clean)) {
    return {
      code: SUPPORT_TTS_LANG[clean],
      bcp47: SUPPORT_LANG_CODE[clean],
      name: clean,
    }
  }
  const byName = HEAR_LANGUAGES.find(
    (l) =>
      l.name.toLowerCase() === clean.toLowerCase() ||
      (l.native && l.native.toLowerCase() === clean.toLowerCase()),
  )
  if (byName) return byName
  const byCode = findHearLanguage(clean)
  if (byCode) return byCode
  /* Soft fallback — still English so callers can speak Level-4 source. */
  return HEAR_LANGUAGES[0]
}

/** Current learner hear language for instruction narrations. */
export function resolveLearnerHearLanguage(): HearLanguage {
  return hearLanguageFromPreferred(getLearnerSupportLang())
}

export function learnerWantsL1Narration(lang?: HearLanguage): boolean {
  const hear = lang ?? resolveLearnerHearLanguage()
  return hear.code !== 'en' && !hear.bcp47.toLowerCase().startsWith('en')
}
