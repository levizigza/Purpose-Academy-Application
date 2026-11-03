import { useEffect, useState } from 'react'
import { EXTRA_LANG_EVENT, getLearnerExtraLang } from '../practice/learnerLang'
import type { HearLanguage } from './hearLanguages'
import { hearVocabInLanguage, translateVocabWord } from './universalHear'

/** Live "More languages" pick (step 3) — re-renders when the learner changes it. */
export function useLearnerExtraLang(): HearLanguage | null {
  const [lang, setLang] = useState<HearLanguage | null>(() => getLearnerExtraLang())
  useEffect(() => {
    const sync = () => setLang(getLearnerExtraLang())
    window.addEventListener(EXTRA_LANG_EVENT, sync)
    window.addEventListener('pa-learner-store-changed', sync)
    return () => {
      window.removeEventListener(EXTRA_LANG_EVENT, sync)
      window.removeEventListener('pa-learner-store-changed', sync)
    }
  }, [])
  return lang
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; text: string }
  | { kind: 'error' }

/**
 * Translated line under English copy for a learner who picked a language from
 * "More languages". Renders nothing when no extra language is set.
 */
export function ExtraLangLine({
  english,
  compact = false,
}: {
  english: string
  compact?: boolean
}) {
  const lang = useLearnerExtraLang()
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!lang || !english.trim()) {
      setState({ kind: 'idle' })
      return
    }
    let alive = true
    setState({ kind: 'loading' })
    translateVocabWord(english, lang)
      .then((r) => alive && setState({ kind: 'ready', text: r.translated }))
      .catch(() => alive && setState({ kind: 'error' }))
    return () => {
      alive = false
    }
  }, [english, lang])

  if (!lang || state.kind === 'idle') return null

  return (
    <p
      className={`extra-lang-line${compact ? ' is-compact' : ''}${state.kind === 'error' ? ' is-soft-miss' : ''}`}
      aria-live="polite"
    >
      <span className="extra-lang-tag">{lang.name}</span>
      {state.kind === 'loading' && <span className="extra-lang-text is-loading">Translating…</span>}
      {state.kind === 'error' && (
        <span className="extra-lang-text">Translation is resting — English is above.</span>
      )}
      {state.kind === 'ready' && (
        <>
          <span className="extra-lang-text" lang={lang.bcp47} dir="auto">
            {state.text}
          </span>
          <button
            type="button"
            className="extra-lang-hear"
            disabled={playing}
            aria-label={`Hear in ${lang.name}`}
            onClick={() => {
              setPlaying(true)
              void hearVocabInLanguage(english, lang).finally(() => setPlaying(false))
            }}
          >
            {playing ? '…' : '▶ Hear'}
          </button>
        </>
      )}
    </p>
  )
}
