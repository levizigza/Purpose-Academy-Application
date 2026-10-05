import type { HomeLang, SupportLang, VocabTerm } from './journeyCurriculum'
import { HOME_LANGUAGES, SUPPORT_LANGUAGES } from './journeyCurriculum'
import { pathwayImage } from '../pathways'

/** Worksheet language order (matches Purpose Academy visual vocabulary sheets). No French. */
export const VOCAB_SHEET_LANGS: HomeLang[] = HOME_LANGUAGES

const FLAG: Record<SupportLang, string> = Object.fromEntries(
  SUPPORT_LANGUAGES.map((l) => [l.id, l.flag]),
) as Record<SupportLang, string>

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M4 10v4h3l5 4V6L7 10H4zm11.5 2a3.5 3.5 0 0 0-1.8-3.1v6.2A3.5 3.5 0 0 0 15.5 12zM13.7 5.1v1.8a5.5 5.5 0 0 1 0 10.2v1.8a7.3 7.3 0 0 0 0-13.8z"
      />
    </svg>
  )
}

type CardProps = {
  index: number
  total: number
  term: VocabTerm
  supportLang: SupportLang
  speaking: boolean
  heardEnglish: boolean
  onPlayEnglish: () => void
  onPlayLang: (lang: HomeLang) => void
}

/**
 * Singular visual-vocabulary card template on the train chrome:
 * English word · clear object photo · home-language glosses with audio.
 */
export function VocabSheetCard({
  index,
  total,
  term,
  supportLang,
  speaking,
  heardEnglish,
  onPlayEnglish,
  onPlayLang,
}: CardProps) {
  const img = pathwayImage(term.imageKey)
  return (
    <article className={`vocab-sheet-card vocab-sheet-card-focus${heardEnglish ? ' is-heard' : ''}`}>
      <header className="vocab-sheet-card-head">
        <span className={`vocab-sheet-num tone-${(index % 4) + 1}`}>{index}</span>
        <strong className="vocab-sheet-en">{term.english}</strong>
        <button
          type="button"
          className={`vocab-sheet-audio${heardEnglish ? ' is-done' : ''}`}
          aria-label={`Listen to ${term.english}`}
          disabled={speaking}
          onClick={onPlayEnglish}
          title="Listen to English"
        >
          <SpeakerIcon />
          <span>{speaking ? '…' : heardEnglish ? 'Heard ✓' : 'Hear English'}</span>
        </button>
      </header>

      <p className="vocab-sheet-progress" aria-live="polite">
        Word {index} of {total}
      </p>

      <div className="vocab-sheet-body vocab-sheet-body-focus">
        <figure className="vocab-sheet-photo vocab-sheet-photo-focus">
          {img ? (
            <img src={img} alt={term.english} />
          ) : (
            <span className="vocab-sheet-fallback" aria-hidden>
              {term.emoji}
            </span>
          )}
        </figure>
        <ul className="vocab-sheet-langs" aria-label="Translations">
          {VOCAB_SHEET_LANGS.map((lang) => (
            <li key={lang} className={lang === supportLang ? 'is-support' : ''}>
              <button
                type="button"
                className="vocab-sheet-lang-btn"
                disabled={speaking}
                onClick={() => onPlayLang(lang)}
                aria-label={`Listen to ${term.english} in ${lang}`}
              >
                <span className="vocab-sheet-flag" aria-hidden>
                  {FLAG[lang]}
                </span>
                <span className="vocab-sheet-lang-meta">
                  <span className="vocab-sheet-lang-name">{lang}</span>
                  <span className="vocab-sheet-lang-word">{term.gloss[lang]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="vocab-sheet-definition">{term.definition}</p>
      <p className="vocab-sheet-sentence">{term.sentence}</p>
    </article>
  )
}

type DeckProps = {
  terms: VocabTerm[]
  index: number
  supportLang: SupportLang
  speakingId: string | null
  /** English audio completed for each term id */
  heard: Record<string, boolean>
  onIndexChange: (index: number) => void
  onPlayEnglish: (term: VocabTerm) => void
  onPlayLang: (term: VocabTerm, lang: HomeLang) => void
}

/**
 * One-by-one vocabulary deck.
 * Pattern: see → hear English (required) → next — finish the full set.
 */
export function VocabSheet({
  terms,
  index,
  supportLang,
  speakingId,
  heard,
  onIndexChange,
  onPlayEnglish,
  onPlayLang,
}: DeckProps) {
  const idx = Math.min(Math.max(0, index), Math.max(0, terms.length - 1))
  const term = terms[idx]
  const atEnd = idx >= terms.length - 1
  const heardEnglish = !!heard[term.id]
  const heardCount = terms.filter((t) => heard[t.id]).length
  const allHeard = heardCount >= terms.length

  function goPrev() {
    onIndexChange(Math.max(0, idx - 1))
  }

  function goNext() {
    if (!heardEnglish) return
    if (!atEnd) onIndexChange(idx + 1)
  }

  return (
    <section className="vocab-sheet vocab-sheet-deck" aria-label="Visual vocabulary">
      <div className="vocab-lesson-bar" aria-hidden>
        <span style={{ width: `${Math.round((heardCount / Math.max(1, terms.length)) * 100)}%` }} />
      </div>
      <p className="vocab-sheet-lede">
        See the picture. Read your language. Hear the English word, then go to the next one.
      </p>

      <VocabSheetCard
        key={term.id}
        index={idx + 1}
        total={terms.length}
        term={term}
        supportLang={supportLang}
        speaking={speakingId === term.id}
        heardEnglish={heardEnglish}
        onPlayEnglish={() => onPlayEnglish(term)}
        onPlayLang={(lang) => onPlayLang(term, lang)}
      />

      <div className="vocab-sheet-nav">
        <button type="button" className="btn btn-ghost" disabled={idx === 0} onClick={goPrev}>
          ← Previous
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!heardEnglish || (atEnd && allHeard)}
          onClick={goNext}
        >
          {!heardEnglish
            ? 'Hear English first'
            : atEnd
              ? allHeard
                ? 'All words done ✓'
                : 'Last word heard ✓'
              : 'Next word →'}
        </button>
      </div>
    </section>
  )
}
