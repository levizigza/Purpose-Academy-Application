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
  term: VocabTerm
  supportLang: SupportLang
  speaking: boolean
  heard: boolean
  onPlayEnglish: () => void
  onPlayLang: (lang: SupportLang) => void
}

/** One worksheet-style visual vocabulary card: English + translations + audio. */
export function VocabSheetCard({
  index,
  term,
  supportLang,
  speaking,
  heard,
  onPlayEnglish,
  onPlayLang,
}: CardProps) {
  const img = toolImage(term.imageKey)
  return (
    <article className={`vocab-sheet-card${heard ? ' is-heard' : ''}`}>
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

      <div className="vocab-sheet-body">
        <figure className="vocab-sheet-photo">
          {img ? (
            <img src={img} alt="" />
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

type SheetProps = {
  terms: VocabTerm[]
  supportLang: SupportLang
  speakingId: string | null
  heard: Record<string, boolean>
  onPlayEnglish: (term: VocabTerm) => void
  onPlayLang: (term: VocabTerm, lang: SupportLang) => void
}

/** Full visual vocabulary sheet — English word with home-language glosses + audio. */
export function VocabSheet({
  terms,
  supportLang,
  speakingId,
  heard,
  onPlayEnglish,
  onPlayLang,
}: SheetProps) {
  return (
    <section className="vocab-sheet" aria-label="Visual vocabulary sheet">
      <header className="vocab-sheet-banner">
        <div>
          <p className="vocab-sheet-brand">Purpose Academy</p>
          <h2 className="vocab-sheet-title">Construction Visual Vocabulary</h2>
        </div>
        <p className="vocab-sheet-badge">
          Words 1–{terms.length} · English + home languages · No French
        </p>
      </header>
      <p className="vocab-sheet-lede">
        See the picture. Read your language. Hear the English word. Tap any translation to listen.
      </p>
      <div className="vocab-sheet-grid">
        {terms.map((term, i) => (
          <VocabSheetCard
            key={term.id}
            index={i + 1}
            term={term}
            supportLang={supportLang}
            speaking={speakingId === term.id}
            heard={!!heard[term.id]}
            onPlayEnglish={() => onPlayEnglish(term)}
            onPlayLang={(lang) => onPlayLang(term, lang)}
          />
        ))}
      </div>
    </section>
  )
}
