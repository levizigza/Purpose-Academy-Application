/**
 * Written mother-tongue line under English Practice instructions.
 * Explains the task (type in the box, pick a match) — never replaces English production.
 */

import { useEffect, useState } from 'react'
import {
  EXTRA_LANG_EVENT,
  learnerWantsL1Narration,
  resolveLearnerHearLanguage,
} from './learnerLang'
import { lookupInstructionGloss } from './instructionGloss'
import { level4InstructionEnglish } from '../student/instructionNarration'
import { translateVocabWord } from '../student/universalHear'
import type { HearLanguage } from '../student/hearLanguages'

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; text: string; lang: HearLanguage }
  | { kind: 'error' }

/**
 * Always shows a translated instruction when the learner’s preferred language
 * is not English (Your Language chip or More languages). Soft-fails to quiet.
 */
export function InstructionL1Line({
  english,
  compact = false,
  className = '',
}: {
  english: string
  compact?: boolean
  className?: string
}) {
  const [lang, setLang] = useState<HearLanguage>(() => resolveLearnerHearLanguage())
  const [state, setState] = useState<State>({ kind: 'idle' })

  useEffect(() => {
    const sync = () => setLang(resolveLearnerHearLanguage())
    window.addEventListener('pa-support-lang-changed', sync)
    window.addEventListener(EXTRA_LANG_EVENT, sync)
    window.addEventListener('pa-learner-store-changed', sync)
    return () => {
      window.removeEventListener('pa-support-lang-changed', sync)
      window.removeEventListener(EXTRA_LANG_EVENT, sync)
      window.removeEventListener('pa-learner-store-changed', sync)
    }
  }, [])

  useEffect(() => {
    const source = level4InstructionEnglish(english)
    if (!source || !learnerWantsL1Narration(lang)) {
      setState({ kind: 'idle' })
      return
    }
    const gloss = lookupInstructionGloss(source, lang)
    if (gloss) {
      setState({ kind: 'ready', text: gloss, lang })
      return
    }
    let alive = true
    setState({ kind: 'loading' })
    translateVocabWord(source, lang)
      .then((r) => {
        if (!alive) return
        setState({ kind: 'ready', text: r.translated, lang })
      })
      .catch(() => {
        if (alive) setState({ kind: 'error' })
      })
    return () => {
      alive = false
    }
  }, [english, lang])

  if (state.kind === 'idle') return null

  return (
    <p
      className={`instruction-l1-line${compact ? ' is-compact' : ''}${
        state.kind === 'error' ? ' is-soft-miss' : ''
      }${className ? ` ${className}` : ''}`}
      aria-live="polite"
    >
      <span className="instruction-l1-tag">{lang.name}</span>
      {state.kind === 'loading' && (
        <span className="instruction-l1-text is-loading">Finding your language…</span>
      )}
      {state.kind === 'error' && (
        <span className="instruction-l1-text">Translation is resting — English is above.</span>
      )}
      {state.kind === 'ready' && (
        <span className="instruction-l1-text" lang={state.lang.bcp47} dir="auto">
          {state.text}
        </span>
      )}
    </p>
  )
}
