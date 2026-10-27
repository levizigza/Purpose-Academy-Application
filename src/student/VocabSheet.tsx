import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { HomeLang, SupportLang, VocabTerm } from './journeyCurriculum'
import { SUPPORT_LANGUAGES } from './journeyCurriculum'
import { pathwayImage } from '../pathways'
import { firePlayClear } from '../practice/PlayClear'
import { playFoley } from '../audio/foley'

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

/** Soft match: ignore case, extra spaces, light punctuation — never shame typos. */
export function normalizeEnglishAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, '')
    .replace(/\s+/g, ' ')
}

function SpeakerIconSmall() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M4 10v4h3l5 4V6L7 10H4zm11.5 2a3.5 3.5 0 0 0-1.8-3.1v6.2A3.5 3.5 0 0 0 15.5 12z"
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
  typedEnglish: boolean
  /** Language the learner pressed to bridge meaning → English */
  connectedLang: HomeLang | null
  alreadyKnown: boolean
  onPlayEnglish: () => void
  onConnectLang: (lang: HomeLang) => void
  onMarkKnown: () => void
  onTypedCorrect: () => void
}

/**
 * Visual vocabulary card — Purpose Academy worksheet mold (one word per page):
 * picture → home language → Hear English → type English (reps that stick).
 */
export function VocabSheetCard({
  index,
  total,
  term,
  speaking,
  heardEnglish,
  typedEnglish,
  connectedLang,
  alreadyKnown,
  onPlayEnglish,
  onConnectLang,
  onMarkKnown,
  onTypedCorrect,
}: CardProps) {
  const img = pathwayImage(term.imageKey)
  const bridged = !!connectedLang || alreadyKnown
  const ready = bridged && heardEnglish && typedEnglish
  const typingPhase = bridged && heardEnglish && !typedEnglish
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<'ok' | 'retry' | null>(null)

  useEffect(() => {
    setDraft('')
    setFeedback(null)
  }, [term.id])

  useEffect(() => {
    if (!typingPhase) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 180)
    return () => window.clearTimeout(t)
  }, [typingPhase, term.id])

  /** Worksheet / studio-white object cards — keep the mat light for all VV streams. */
  const studioPhoto =
    term.imageKey.startsWith('log-') ||
    term.imageKey.startsWith('dc-vv-') ||
    term.imageKey.startsWith('con-vv-') ||
    term.imageKey.startsWith('com-vv-') ||
    term.imageKey.startsWith('com-') ||
    term.imageKey.startsWith('con-')

  function checkType(e: FormEvent) {
    e.preventDefault()
    const ok = normalizeEnglishAnswer(draft) === normalizeEnglishAnswer(term.english)
    if (ok) {
      setFeedback('ok')
      const leftAfter = total - index
      firePlayClear({
        label: 'Word clear',
        remnant: leftAfter > 0 ? `${leftAfter} left in this set` : 'Set clear',
        kind: leftAfter === 0 ? 'board' : 'micro',
      })
      onTypedCorrect()
      return
    }
    playFoley('wrong')
    setFeedback('retry')
    setDraft('')
    inputRef.current?.focus()
  }

  const progressLine = (() => {
    if (ready) return ' · Done ✓'
    if (typingPhase) return ' · Now type the English word'
    if (alreadyKnown) return ' · Already known — hear English, then type it'
    if (connectedLang) return ` · Heard: ${connectedLang} → English — type it next`
    return ' · Press the language you understand'
  })()

  return (
    <article
      className={`vocab-sheet-card vocab-sheet-card-focus${heardEnglish ? ' is-heard' : ''}${bridged ? ' is-connected' : ''}${typedEnglish ? ' is-typed' : ''}${alreadyKnown ? ' is-known' : ''}${studioPhoto ? ' vocab-sheet-studio' : ''}`}
    >
      <header className="vocab-sheet-card-head">
        <span className={`vocab-sheet-num tone-${(index % 4) + 1}`}>{index}</span>
        {typingPhase ? (
          <strong className="vocab-sheet-en is-hidden-for-type" aria-label="Type the English word you heard">
            Type it
          </strong>
        ) : (
          <strong className={`vocab-sheet-en${bridged ? ' is-linked' : ''}`}>{term.english}</strong>
        )}
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
            {speaking
              ? '…'
              : heardEnglish
                ? typingPhase
                  ? 'Hear again'
                  : 'Heard ✓'
                : bridged
                  ? 'Hear English'
                  : 'Language first'}
          </span>
        </button>
      </header>

      <p className="vocab-sheet-progress" aria-live="polite">
        Word {index} of {total}
        {progressLine}
      </p>

      <div className="vocab-sheet-body vocab-sheet-body-focus">
        <figure className={`vocab-sheet-photo vocab-sheet-photo-focus${studioPhoto ? ' is-studio' : ''}`}>
          {img ? (
            <img src={img} alt={typingPhase ? 'Workplace object — type the English name' : `Photo of ${term.english}`} />
          ) : (
            <span className="vocab-sheet-fallback" aria-hidden>
              {term.emoji}
            </span>
          )}
          <figcaption className="vocab-sheet-photo-caption">
            {typingPhase
              ? 'Look. Hear your language. Hear English. Type what you heard.'
              : studioPhoto
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
                  disabled={speaking || alreadyKnown || typingPhase || typedEnglish}
                  onClick={() => onConnectLang(lang)}
                  aria-pressed={selected}
                  aria-label={`Hear ${term.gloss[lang]} in ${lang}, then English ${term.english}`}
                >
                  <span className="vocab-sheet-flag" aria-hidden>
                    {FLAG[lang]}
                  </span>
                  <span className="vocab-sheet-lang-meta">
                    <span className="vocab-sheet-lang-name">{lang}</span>
                    <span className="vocab-sheet-lang-word">{term.gloss[lang]}</span>
                  </span>
                  {selected && (
                    <span className="vocab-sheet-lang-link">
                      {typedEnglish ? `→ ${term.english}` : '→ heard'}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {typingPhase && (
        <form className="vocab-sheet-type" onSubmit={checkType}>
          <p className="play-nearby-objective" aria-live="polite">
            Clear this word · type what you heard
          </p>
          <p className="vocab-sheet-type-prompt">
            <span className="vocab-sheet-type-kicker">Your turn</span>
            Type the English word you just heard.
          </p>
          <div className="vocab-sheet-type-row">
            <label className="sr-only" htmlFor={inputId}>
              English word
            </label>
            <input
              ref={inputRef}
              id={inputId}
              className="vocab-sheet-type-input"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                if (feedback === 'retry') setFeedback(null)
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              placeholder="Type here…"
              aria-invalid={feedback === 'retry'}
              aria-describedby={feedback ? `${inputId}-fb` : undefined}
            />
            <button type="submit" className="btn btn-primary vocab-sheet-type-check" disabled={!draft.trim()}>
              Go
            </button>
          </div>
          <div className="vocab-sheet-type-tools">
            <button
              type="button"
              className="btn btn-ghost vocab-sheet-type-replay"
              disabled={speaking}
              onClick={onPlayEnglish}
            >
              <SpeakerIconSmall />
              Hear English again
            </button>
          </div>
          {feedback === 'retry' && (
            <p id={`${inputId}-fb`} className="vocab-sheet-type-fb is-retry" role="status">
              Not yet — hear it again, then type what you heard. No rush.
            </p>
          )}
        </form>
      )}

      {typedEnglish && (
        <p className="vocab-sheet-type-fb is-ok" role="status">
          Yes — <strong>{term.english}</strong>.
        </p>
      )}

      {!typingPhase && (
        <>
          <p className="vocab-sheet-definition">{term.definition}</p>
          <p className="vocab-sheet-sentence">{term.sentence}</p>
        </>
      )}

      {!alreadyKnown && !typingPhase && !typedEnglish && (
        <button type="button" className="btn btn-ghost vocab-known-btn" onClick={onMarkKnown}>
          I already know this word
        </button>
      )}
      {alreadyKnown && !typedEnglish && (
        <p className="vocab-known-note">
          Marked known — hear English once, then type it so it sticks.
        </p>
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
  /** English spelling typed correctly for each term id */
  typed: Record<string, boolean>
  /** Adaptive: term ids the learner already knows */
  knownIds: string[]
  onIndexChange: (index: number) => void
  onPlayEnglish: (term: VocabTerm) => void
  onConnectLang: (term: VocabTerm, lang: HomeLang) => void
  onMarkKnown: (term: VocabTerm) => void
  onTypedCorrect: (term: VocabTerm) => void
  /**
   * How many linked words unlock the journey “Continue” control.
   * Defaults to the full deck. Construction and Logistics use Level-1 (first
   * page / 20 words) so the shared Practice skeleton stays even while large
   * worksheet tables remain available page by page.
   */
  journeyGateCount?: number
  /**
   * Explicit gate term ids (e.g. DC Level-1 + specialty Level-1). When set,
   * overrides prefix `journeyGateCount` so the ladder can skip the middle of
   * the Daily Conversation table.
   */
  journeyGateIds?: string[]
}

export function termLinked(
  term: VocabTerm,
  heard: Record<string, boolean>,
  connected: Record<string, HomeLang>,
  typed: Record<string, boolean>,
  knownSet: Set<string>,
) {
  return (
    !!heard[term.id] &&
    !!typed[term.id] &&
    (!!connected[term.id] || knownSet.has(term.id))
  )
}

/**
 * One-by-one vocabulary deck (worksheet mold).
 * Pattern: see picture → hear your language → hear English → type English → next.
 * Large tables page in worksheet banks of 20.
 */
export function VocabSheet({
  terms,
  index,
  speakingId,
  heard,
  connected,
  typed,
  knownIds,
  onIndexChange,
  onPlayEnglish,
  onConnectLang,
  onMarkKnown,
  onTypedCorrect,
  journeyGateCount,
  journeyGateIds,
}: DeckProps) {
  const knownSet = new Set(knownIds)
  const idx = Math.min(Math.max(0, index), Math.max(0, terms.length - 1))
  const term = terms[idx]
  const atEnd = idx >= terms.length - 1
  const heardEnglish = !!heard[term.id]
  const typedEnglish = !!typed[term.id]
  const connectedLang = connected[term.id] ?? null
  const alreadyKnown = knownSet.has(term.id)
  const bridged = !!connectedLang || alreadyKnown
  const linkedCount = terms.filter((t) => termLinked(t, heard, connected, typed, knownSet)).length
  const allLinked = linkedCount >= terms.length
  const wordReady = bridged && heardEnglish && typedEnglish

  const paged = terms.length > VOCAB_PAGE_SIZE
  const pageCount = paged ? Math.ceil(terms.length / VOCAB_PAGE_SIZE) : 1
  const page = paged ? Math.floor(idx / VOCAB_PAGE_SIZE) : 0
  const pageStart = page * VOCAB_PAGE_SIZE
  const pageEnd = Math.min(terms.length, pageStart + VOCAB_PAGE_SIZE)
  const pageLinked = terms
    .slice(pageStart, pageEnd)
    .filter((t) => termLinked(t, heard, connected, typed, knownSet)).length
  const pageTotal = pageEnd - pageStart

  const gateIdSet =
    journeyGateIds && journeyGateIds.length > 0 ? new Set(journeyGateIds) : null
  const gateTerms = gateIdSet
    ? terms.filter((t) => gateIdSet.has(t.id))
    : terms.slice(0, Math.min(journeyGateCount ?? terms.length, terms.length))
  const gate = gateTerms.length
  const gateLinked = gateTerms.filter((t) => termLinked(t, heard, connected, typed, knownSet)).length
  const gateReady = gate > 0 && gateLinked >= gate
  const gateLabel = gateIdSet
    ? `Finish the first greetings and workplace words (${gateLinked} of ${gate})`
    : `Finish words 1–${gate} to keep going`

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
        One word at a time. Hear it in your language. Hear it in English. Type it.
        Repeat until it feels easy — like practice on the job.
        {paged
          ? ` This set has ${terms.length} words in pages of ${VOCAB_PAGE_SIZE}.`
          : ''}
      </p>

      {paged && (
        <div className="vocab-sheet-pages" role="navigation" aria-label="Vocabulary worksheet pages">
          <p className="vocab-sheet-page-label">
            Page {page + 1} of {pageCount} · Words {pageStart + 1}–{pageEnd}
            {gate > 0 && gate < terms.length
              ? gateReady
                ? ' · First set done — keep practising pages if you want'
                : ` · ${gateLabel}`
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
              Done on this page {pageLinked} of {pageTotal}
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
        typedEnglish={typedEnglish}
        connectedLang={connectedLang}
        alreadyKnown={alreadyKnown}
        onPlayEnglish={() => onPlayEnglish(term)}
        onConnectLang={(lang) => onConnectLang(term, lang)}
        onMarkKnown={() => onMarkKnown(term)}
        onTypedCorrect={() => onTypedCorrect(term)}
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
              : !typedEnglish
                ? 'Type it next'
                : atEnd
                  ? allLinked
                    ? 'All words done ✓'
                    : 'Last word done ✓'
                  : 'Next word →'}
        </button>
      </div>
    </section>
  )
}
