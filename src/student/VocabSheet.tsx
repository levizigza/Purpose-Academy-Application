import type { SupportLang, VocabTerm } from './journeyCurriculum'
import { SUPPORT_LANGUAGES } from './journeyCurriculum'
import { toolImage } from './toolImages'

/** Worksheet language order (matches Purpose Academy visual vocabulary sheets). No French. */
export const VOCAB_SHEET_LANGS: SupportLang[] = [
  'Amharic',
  'Tigrinya',
  'Arabic',
  'Spanish',
  'Hindi',
]

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
  heard: boolean
  onPlayEnglish: () => void
  onPlayLang: (lang: SupportLang) => void
}

/**
 * Singular visual-vocabulary card template:
 * English word · clear object photo · home-language glosses with audio.
 * Used one word at a time — not as a full worksheet grid.
 */
export function VocabSheetCard({
  index,
  total,
  term,
  supportLang,
  speaking,
  heard,
  onPlayEnglish,
  onPlayLang,
}: CardProps) {
  const img = toolImage(term.imageKey)
  return (
    <article className={`vocab-sheet-card vocab-sheet-card-focus${heard ? ' is-heard' : ''}`}>
      <header className="vocab-sheet-card-head">
        <span className={`vocab-sheet-num tone-${(index % 4) + 1}`}>{index}</span>
        <strong className="vocab-sheet-en">{term.english}</strong>
        <button
          type="button"
          className="vocab-sheet-audio"
          aria-label={`Listen to ${term.english}`}
          disabled={speaking}
          onClick={onPlayEnglish}
          title="Listen"
        >
          <SpeakerIcon />
          <span>{speaking ? '…' : 'Listen'}</span>
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

      <p className="vocab-sheet-sentence">{term.sentence}</p>
    </article>
  )
}

type DeckProps = {
  terms: VocabTerm[]
  index: number
  supportLang: SupportLang
  speakingId: string | null
  heard: Record<string, boolean>
  onIndexChange: (index: number) => void
  onPlayEnglish: (term: VocabTerm) => void
  onPlayLang: (term: VocabTerm, lang: SupportLang) => void
  onSeen: (termId: string) => void
}

/**
 * One-by-one vocabulary deck: same singular card template, every word in sequence.
 * Learners must move through the full set before the journey continues.
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
  onSeen,
}: DeckProps) {
  const idx = Math.min(Math.max(0, index), Math.max(0, terms.length - 1))
  const term = terms[idx]
  const atEnd = idx >= terms.length - 1
  const seenCount = terms.filter((t) => heard[t.id]).length
  const allSeen = seenCount >= terms.length

  function goPrev() {
    onIndexChange(Math.max(0, idx - 1))
  }

  function goNext() {
    onSeen(term.id)
    if (!atEnd) onIndexChange(idx + 1)
  }

  return (
    <section className="vocab-sheet vocab-sheet-deck" aria-label="Visual vocabulary">
      <header className="vocab-sheet-banner">
        <div>
          <p className="vocab-sheet-brand">Purpose Academy</p>
          <h2 className="vocab-sheet-title">Construction Visual Vocabulary</h2>
        </div>
        <p className="vocab-sheet-badge">
          {seenCount}/{terms.length} words · one picture at a time
        </p>
      </header>
      <p className="vocab-sheet-lede">
        See the picture. Read your language. Hear the English word. Go through every word — one by one.
      </p>

      <VocabSheetCard
        key={term.id}
        index={idx + 1}
        total={terms.length}
        term={term}
        supportLang={supportLang}
        speaking={speakingId === term.id}
        heard={!!heard[term.id]}
        onPlayEnglish={() => {
          onSeen(term.id)
          onPlayEnglish(term)
        }}
        onPlayLang={(lang) => {
          onSeen(term.id)
          onPlayLang(term, lang)
        }}
      />

      <div className="vocab-sheet-nav">
        <button type="button" className="btn btn-ghost" disabled={idx === 0} onClick={goPrev}>
          ← Previous word
        </button>
        <button type="button" className="btn btn-primary" onClick={goNext}>
          {atEnd ? (allSeen || heard[term.id] ? 'All words done ✓' : 'Mark this word done') : 'Next word →'}
        </button>
      </div>
    </section>
  )
}
