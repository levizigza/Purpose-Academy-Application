import type { HomeLang, SupportLang, VocabTerm } from './journeyCurriculum'
import { SUPPORT_LANGUAGES } from './journeyCurriculum'
import { pathwayImage } from '../pathways'

/**
 * Official Purpose Academy visual-vocabulary language order
 * (Logistics Visual Vocabulary worksheet — No French).
 * All five languages are always shown; the learner presses the one they understand
 * and connects it to the English word.
 */
export const VOCAB_SHEET_LANGS: HomeLang[] = [
  'Amharic',
  'Tigrinya',
  'Arabic',
  'Spanish',
  'Hindi',
]

/** Worksheet page size used by Purpose Academy visual vocabulary PDFs. */
export const VOCAB_PAGE_SIZE = 20

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
  speaking: boolean
  heardEnglish: boolean
  /** Language the learner pressed to bridge meaning → English */
  connectedLang: HomeLang | null
  alreadyKnown: boolean
  onPlayEnglish: () => void
  onConnectLang: (lang: HomeLang) => void
  onMarkKnown: () => void
}

/**
 * Visual vocabulary card — Purpose Academy worksheet mold (one word per page):
 * English · object photo · five home-language glosses · definition · contextual sentence.
 * Learner presses the language they understand, then hears English.
 */
export function VocabSheetCard({
  index,
  total,
  term,
  speaking,
  heardEnglish,
  connectedLang,
  alreadyKnown,
  onPlayEnglish,
  onConnectLang,
  onMarkKnown,
}: CardProps) {
  const img = pathwayImage(term.imageKey)
  const bridged = !!connectedLang || alreadyKnown
  const ready = bridged && heardEnglish
  /** Logistics worksheet photos are studio-white object cards — keep the mat light. */
  const studioPhoto = term.imageKey.startsWith('log-')

  return (
    <article
      className={`vocab-sheet-card vocab-sheet-card-focus${heardEnglish ? ' is-heard' : ''}${bridged ? ' is-connected' : ''}${alreadyKnown ? ' is-known' : ''}${studioPhoto ? ' vocab-sheet-studio' : ''}`}
    >
      <header className="vocab-sheet-card-head">
        <span className={`vocab-sheet-num tone-${(index % 4) + 1}`}>{index}</span>
        <strong className={`vocab-sheet-en${bridged ? ' is-linked' : ''}`}>{term.english}</strong>
        <button
          type="button"
          className={`vocab-sheet-audio${heardEnglish ? ' is-done' : ''}`}
          aria-label={`Listen to ${term.english}`}
          disabled={speaking || !bridged}
          onClick={onPlayEnglish}
          title={bridged ? 'Listen to English' : 'Press your language first'}
        >
          <SpeakerIcon />
          <span>
            {speaking ? '…' : heardEnglish ? 'Heard ✓' : bridged ? 'Hear English' : 'Language first'}
          </span>
        </button>
      </header>

      <p className="vocab-sheet-progress" aria-live="polite">
        Word {index} of {total}
        {alreadyKnown
          ? ' · Already known — confirm English'
          : connectedLang
            ? ` · Connected: ${connectedLang} → English`
            : ' · Press the language you understand'}
        {ready ? ' · Linked ✓' : ''}
      </p>

      <div className="vocab-sheet-body vocab-sheet-body-focus">
        <figure className={`vocab-sheet-photo vocab-sheet-photo-focus${studioPhoto ? ' is-studio' : ''}`}>
          {img ? (
            <img src={img} alt={`Photo of ${term.english}`} />
          ) : (
            <span className="vocab-sheet-fallback" aria-hidden>
              {term.emoji}
            </span>
          )}
          <figcaption className="vocab-sheet-photo-caption">
            {studioPhoto
              ? 'Look at the object. Press your language. Then hear English.'
              : 'Look at the picture. Connect it to English.'}
          </figcaption>
        </figure>
        <ul className="vocab-sheet-langs" aria-label="Press the language you understand">
          {VOCAB_SHEET_LANGS.map((lang) => {
            const selected = connectedLang === lang
            return (
              <li key={lang} className={selected ? 'is-connected-lang' : ''}>
                <button
                  type="button"
                  className={`vocab-sheet-lang-btn${selected ? ' is-selected' : ''}`}
                  disabled={speaking || alreadyKnown}
                  onClick={() => onConnectLang(lang)}
                  aria-pressed={selected}
                  aria-label={`Connect ${term.gloss[lang]} (${lang}) to English ${term.english}`}
                >
                  <span className="vocab-sheet-flag" aria-hidden>
                    {FLAG[lang]}
                  </span>
                  <span className="vocab-sheet-lang-meta">
                    <span className="vocab-sheet-lang-name">{lang}</span>
                    <span className="vocab-sheet-lang-word">{term.gloss[lang]}</span>
                  </span>
                  {selected && <span className="vocab-sheet-lang-link">→ {term.english}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="vocab-sheet-definition">{term.definition}</p>
      <p className="vocab-sheet-sentence">{term.sentence}</p>

      {!alreadyKnown && (
        <button type="button" className="btn btn-ghost vocab-known-btn" onClick={onMarkKnown}>
          I already know this word
        </button>
      )}
      {alreadyKnown && (
        <p className="vocab-known-note">Marked known — hear English once to confirm, then continue.</p>
      )}
    </article>
  )
}

type DeckProps = {
  terms: VocabTerm[]
  index: number
  speakingId: string | null
  /** English audio completed for each term id */
  heard: Record<string, boolean>
  /** Home language pressed for each term id (bridge to English) */
  connected: Record<string, HomeLang>
  /** Adaptive: term ids the learner already knows */
  knownIds: string[]
  onIndexChange: (index: number) => void
  onPlayEnglish: (term: VocabTerm) => void
  onConnectLang: (term: VocabTerm, lang: HomeLang) => void
  onMarkKnown: (term: VocabTerm) => void
  /**
   * How many linked words unlock the journey “Continue” control.
   * Defaults to the full deck. Construction and Logistics use Level-1 (first
   * page / 20 words) so the shared Practice skeleton stays even while large
   * worksheet tables remain available page by page.
   */
  journeyGateCount?: number
}

function termLinked(
  term: VocabTerm,
  heard: Record<string, boolean>,
  connected: Record<string, HomeLang>,
  knownSet: Set<string>,
) {
  return !!heard[term.id] && (!!connected[term.id] || knownSet.has(term.id))
}

/**
 * One-by-one vocabulary deck (worksheet mold).
 * Pattern: see picture → press your language (or mark known) → hear English → next.
 * Large tables (Logistics 500, Construction 660) page in worksheet banks of 20.
 */
export function VocabSheet({
  terms,
  index,
  speakingId,
  heard,
  connected,
  knownIds,
  onIndexChange,
  onPlayEnglish,
  onConnectLang,
  onMarkKnown,
  journeyGateCount,
}: DeckProps) {
  const knownSet = new Set(knownIds)
  const idx = Math.min(Math.max(0, index), Math.max(0, terms.length - 1))
  const term = terms[idx]
  const atEnd = idx >= terms.length - 1
  const heardEnglish = !!heard[term.id]
  const connectedLang = connected[term.id] ?? null
  const alreadyKnown = knownSet.has(term.id)
  const bridged = !!connectedLang || alreadyKnown
  const linkedCount = terms.filter((t) => termLinked(t, heard, connected, knownSet)).length
  const allLinked = linkedCount >= terms.length
  const wordReady = bridged && heardEnglish

  const paged = terms.length > VOCAB_PAGE_SIZE
  const pageCount = paged ? Math.ceil(terms.length / VOCAB_PAGE_SIZE) : 1
  const page = paged ? Math.floor(idx / VOCAB_PAGE_SIZE) : 0
  const pageStart = page * VOCAB_PAGE_SIZE
  const pageEnd = Math.min(terms.length, pageStart + VOCAB_PAGE_SIZE)
  const pageLinked = terms
    .slice(pageStart, pageEnd)
    .filter((t) => termLinked(t, heard, connected, knownSet)).length
  const pageTotal = pageEnd - pageStart

  const gate = Math.min(journeyGateCount ?? terms.length, terms.length)
  const gateLinked = terms.slice(0, gate).filter((t) => termLinked(t, heard, connected, knownSet)).length
  const gateReady = gateLinked >= gate

  function goPrev() {
    onIndexChange(Math.max(0, idx - 1))
  }

  function goNext() {
    if (!wordReady) return
    if (!atEnd) onIndexChange(idx + 1)
  }

  function goPage(nextPage: number) {
    const clamped = Math.min(Math.max(0, nextPage), pageCount - 1)
    onIndexChange(clamped * VOCAB_PAGE_SIZE)
  }

  return (
    <section className="vocab-sheet vocab-sheet-deck" aria-label="Visual vocabulary">
      <div className="vocab-lesson-bar" aria-hidden>
        <span style={{ width: `${Math.round((linkedCount / Math.max(1, terms.length)) * 100)}%` }} />
      </div>
      <p className="vocab-sheet-lede">
        See the picture. Press the language you understand — or mark a word you already know — then hear English.
        Read the short sentence so the word stays in context.
        {paged
          ? ` This table has ${terms.length} words in worksheet pages of ${VOCAB_PAGE_SIZE}.`
          : ''}
      </p>

      {paged && (
        <div className="vocab-sheet-pages" role="navigation" aria-label="Vocabulary worksheet pages">
          <p className="vocab-sheet-page-label">
            Page {page + 1} of {pageCount} · Words {pageStart + 1}–{pageEnd}
            {gate < terms.length
              ? gateReady
                ? ' · Level-1 complete — journey unlocked; keep practising pages if you want'
                : ` · Link words 1–${gate} to continue the journey`
              : ''}
          </p>
          <div className="vocab-sheet-page-nav">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={page === 0}
              onClick={() => goPage(page - 1)}
            >
              ← Page
            </button>
            <span className="vocab-sheet-page-progress">
              Page linked {pageLinked} of {pageTotal}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={page >= pageCount - 1}
              onClick={() => goPage(page + 1)}
            >
              Page →
            </button>
          </div>
        </div>
      )}

      <VocabSheetCard
        key={term.id}
        index={idx + 1}
        total={terms.length}
        term={term}
        speaking={speakingId === term.id}
        heardEnglish={heardEnglish}
        connectedLang={connectedLang}
        alreadyKnown={alreadyKnown}
        onPlayEnglish={() => onPlayEnglish(term)}
        onConnectLang={(lang) => onConnectLang(term, lang)}
        onMarkKnown={() => onMarkKnown(term)}
      />

      <div className="vocab-sheet-nav">
        <button type="button" className="btn btn-ghost" disabled={idx === 0} onClick={goPrev}>
          ← Previous
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!wordReady || (atEnd && allLinked)}
          onClick={goNext}
        >
          {!bridged
            ? 'Press your language first'
            : !heardEnglish
              ? 'Hear English next'
              : atEnd
                ? allLinked
                  ? 'All words linked ✓'
                  : 'Last word linked ✓'
                : 'Next word →'}
        </button>
      </div>
    </section>
  )
}
