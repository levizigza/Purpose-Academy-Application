/**
 * Multi-language instruction narrations — Level-4 simple English → translate → speak.
 *
 * Reuses Workplace Words universalHear stack (PA API / LibreTranslate / MyMemory +
 * speakLangCode / speechSynthesis). Session-cached. Soft status — never silent-fail,
 * never blocks English practice chrome.
 *
 * Scope: coach prompts, explainer ledes, computer/equipment video instruction chrome.
 * Does not replace EN chip or More languages on Workplace Words cards.
 */

import type { HearLanguage } from './hearLanguages'
import { speakLangCode } from './speech'
import { translateVocabWord } from './universalHear'
import {
  learnerWantsL1Narration,
  resolveLearnerHearLanguage,
} from '../practice/learnerLang'

export type InstructionNarrationStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; phase: 'translate' | 'speak' }
  | {
      kind: 'ready'
      english: string
      spoken: string
      lang: HearLanguage
      source: string
      played: boolean
      /** True when preferred lang is English — spoke Level-4 source as-is. */
      englishOnly: boolean
    }
  | { kind: 'unsupported'; lang: HearLanguage; detail: string }
  | { kind: 'error'; detail: string }

export type NarrateOptions = {
  /** Override preferred hear language (defaults to learner support lang). */
  lang?: HearLanguage
  /**
   * When true (default), skip translate+speak if preferred is English —
   * English text is already on screen. Pass false to force English TTS.
   */
  skipEnglishPreferred?: boolean
}

/**
 * Level-4 simple English source before translate.
 * Collapse whitespace; keep under MyMemory-friendly length.
 */
export function level4InstructionEnglish(text: string): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[·•]/g, '.')
    .trim()
    .slice(0, 420)
}

/**
 * Translate + speak a short instruction in the learner language.
 * Always returns a status — soft errors never throw to the UI.
 */
export async function narrateInstruction(
  englishSource: string,
  opts: NarrateOptions = {},
): Promise<InstructionNarrationStatus> {
  const english = level4InstructionEnglish(englishSource)
  if (!english) {
    return { kind: 'error', detail: 'No instruction to speak.' }
  }

  const lang = opts.lang ?? resolveLearnerHearLanguage()
  const skipEn = opts.skipEnglishPreferred !== false

  if (skipEn && !learnerWantsL1Narration(lang)) {
    return {
      kind: 'ready',
      english,
      spoken: english,
      lang,
      source: 'passthrough',
      played: false,
      englishOnly: true,
    }
  }

  try {
    const { translated, source } = await translateVocabWord(english, lang)
    const played = await speakLangCode(translated, lang.code, lang.bcp47)
    return {
      kind: 'ready',
      english,
      spoken: translated,
      lang,
      source,
      played,
      englishOnly: lang.code === 'en' || lang.bcp47.toLowerCase().startsWith('en'),
    }
  } catch (e) {
    const err = e as Error & { unsupported?: boolean }
    const detail = err?.message || 'Could not speak that language right now.'
    if (err?.unsupported) {
      return { kind: 'unsupported', lang, detail }
    }
    return { kind: 'error', detail }
  }
}

/** Force speak Level-4 English (keeps English available beside L1). */
export async function narrateInstructionEnglish(englishSource: string): Promise<boolean> {
  const english = level4InstructionEnglish(englishSource)
  if (!english) return false
  return speakLangCode(english, 'en', 'en-US')
}
