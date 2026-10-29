import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import type { HomeLang, SupportLang, VocabTerm } from './journeyCurriculum'
import { SUPPORT_LANGUAGES } from './journeyCurriculum'
import { pathwayImage } from '../pathways'
import { firePlayClear, softMissLine } from '../practice/PlayClear'
import { playFoley } from '../audio/foley'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'
import { NavCueTarget, NavGlowRegion } from '../practice/NavCue'
import { markNavCueSeen, NAV_CUE } from '../practice/navCues'
import {
  buildVocabPickBank,
  choiceOrderKey,
  shuffleChoicesFresh,
} from './vocabDistractors'
import type { HearLanguage } from './hearLanguages'
import type { UniversalBridge, UniversalHearStatus } from './universalHear'
import { UniversalHearControl } from './UniversalHear'

/**
 * Official Purpose Academy visual-vocabulary mother-tongue order
 * (Logistics Visual Vocabulary worksheet — No French).
 * Used by Language Organize and as the non-English hear chips.
 */
export const VOCAB_SHEET_LANGS: HomeLang[] = [
  'Amharic',
  'Tigrinya',
  'Arabic',
  'Spanish',
  'Hindi',
]

/**
 * Workplace Words hear row — English first so EN-only learners can bridge,
 * then the five mother tongues. Press plays that tongue (or English once),
 * then pick + type. English pick skips a redundant second Hear English.
 */
export const VOCAB_HEAR_LANGS: SupportLang[] = ['English', ...VOCAB_SHEET_LANGS]

/** Gloss or English title for a hear-row language chip. */
export function vocabHearWord(term: VocabTerm, lang: SupportLang): string {
  return lang === 'English' ? term.english : term.gloss[lang]
}

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

/** How many English choices appear under the type panel (correct + distractors). */
const VV_PICK_BANK_SIZE = 5

type CardProps = {
  index: number
  total: number
  term: VocabTerm
  /**
   * Same worksheet page / station pool for distractors (same language level).
   * Never includes only the current term — peers from the page feed the bank.
   */
  choicePool: VocabTerm[]
  speaking: boolean
  heardEnglish: boolean
  typedEnglish: boolean
  /** Language the learner pressed to bridge meaning → English (may be English itself) */
  connectedLang: SupportLang | null
  /** Universal translator bridge (any searchable language). */
  universalBridge: UniversalBridge | null
  universalBusy: boolean
  universalStatus: UniversalHearStatus
  alreadyKnown: boolean
  /**
   * Retake only: show “I already know this word”.
   * Hidden on the first go so every learner types through the set.
   */
  allowSkipKnown: boolean
  onPlayEnglish: () => void
  onConnectLang: (lang: SupportLang) => void
  onUniversalHear: (lang: HearLanguage) => void
  onClearUniversalStatus: () => void
  onMarkKnown: () => void
  onTypedCorrect: () => void
}

/**
 * Visual vocabulary card — Purpose Academy worksheet mold (one word per page):
 * picture → home language → Hear English → pick match + type English (reps that stick).
 * English spelling stays hidden until the learner types it — no spoiler title.
 * Pick bank is required (wrong pick reshuffles); typing remains the production clear.
 */
export function VocabSheetCard({
  index,
  total,
  term,
  choicePool,
  speaking,
  heardEnglish,
  typedEnglish,
  connectedLang,
  universalBridge,
  universalBusy,
  universalStatus,
  alreadyKnown,
  allowSkipKnown,
  onPlayEnglish,
  onConnectLang,
  onUniversalHear,
  onClearUniversalStatus,
  onMarkKnown,
  onTypedCorrect,
}: CardProps) {
  const img = pathwayImage(term.imageKey)
  const bridged = !!connectedLang || !!universalBridge || alreadyKnown
  const ready = bridged && heardEnglish && typedEnglish
  /** After bridge: listen → pick + type. Typing unlocks once English was offered (heard). */
  const listeningPhase = bridged && !heardEnglish && !typedEnglish
  const typingPhase = bridged && heardEnglish && !typedEnglish
  const productionPhase = bridged && !typedEnglish
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<'ok' | 'retry' | 'need-pick' | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [pickMiss, setPickMiss] = useState(false)
  const prevOrderKeyRef = useRef<string | null>(null)
  const coachFirst = index === 1
  const pickLetters = ['A', 'B', 'C', 'D', 'E'] as const
  const pickReady =
    !!picked && normalizeEnglishAnswer(picked) === normalizeEnglishAnswer(term.english)

  function dealPickBank() {
    const bank = buildVocabPickBank(term, choicePool, VV_PICK_BANK_SIZE)
    const next = shuffleChoicesFresh(bank, prevOrderKeyRef.current)
    prevOrderKeyRef.current = choiceOrderKey(next)
    setOptions(next)
    setPicked(null)
    setPickMiss(false)
  }

  useEffect(() => {
    setDraft('')
    setFeedback(null)
    setPicked(null)
    setPickMiss(false)
    prevOrderKeyRef.current = null
    if (heardEnglish && !typedEnglish) {
      const bank = buildVocabPickBank(term, choicePool, VV_PICK_BANK_SIZE)
      const next = shuffleChoicesFresh(bank, null)
      prevOrderKeyRef.current = choiceOrderKey(next)
      setOptions(next)
    } else {
      setOptions([])
    }
    /* choicePool is the worksheet page — rebuild only when the card / hear-type gate changes. */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid reshuffling on parent re-renders
  }, [term.id, heardEnglish, typedEnglish])

  useEffect(() => {
    if (!typingPhase) return
    const t = window.setTimeout(() => {
      inputRef.current?.focus()
      /* Desktop night: tall photo can push Type/Go below the fold — bring the beat in. */
      inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 180)
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

  function onPickOption(opt: string) {
    if (!typingPhase || typedEnglish) return
    if (normalizeEnglishAnswer(opt) === normalizeEnglishAnswer(term.english)) {
      setPicked(opt)
      setPickMiss(false)
      if (feedback === 'need-pick') setFeedback(null)
      if (coachFirst) advanceStationCoach('workplace-words')
      return
    }
    /* Wrong pick: soft miss + reshuffle so position tapping cannot clear. */
    playFoley('wrong')
    setPicked(null)
    setPickMiss(true)
    setFeedback(null)
    setDraft('')
    dealPickBank()
  }

  function checkType(e: FormEvent) {
    e.preventDefault()
    if (!pickReady) {
      playFoley('wrong')
      setFeedback('need-pick')
      setPickMiss(true)
      return
    }
    const ok = normalizeEnglishAnswer(draft) === normalizeEnglishAnswer(term.english)
    if (ok) {
      setFeedback('ok')
      setPickMiss(false)
      const leftAfter = total - index
      firePlayClear({
        label: 'Word clear',
        remnant: leftAfter > 0 ? `${leftAfter} left in this set` : 'Set clear',
        kind: leftAfter === 0 ? 'board' : 'micro',
      })
      if (coachFirst) advanceStationCoach('workplace-words')
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
    if (typingPhase) {
      return pickReady
        ? ' · Now type the English word'
        : ' · Pick the match, then type it'
    }
    if (listeningPhase) {
      return speaking
        ? ' · Listening — then pick and type the English word'
        : ' · Hear English, then pick and type it'
    }
    if (alreadyKnown) return ' · Already known — hear English, then pick and type it'
    return ' · Press a language you understand — or More languages'
  })()

  const caption = (() => {
    if (typedEnglish) return `Yes — ${term.english}.`
    if (typingPhase) return 'Look. Hear. Pick the match. Type it.'
    if (listeningPhase) {
      if (connectedLang === 'English' && !universalBridge) {
        return 'Listening to English… Then pick the match and type it.'
      }
      if (universalBridge) {
        return `Heard in ${universalBridge.name}. Listening… Then pick and type the English word.`
      }
      return 'Listening… Then pick the match and type the English word so it sticks.'
    }
    if (studioPhoto) {
      return 'Look at the object. Press a language you know — or More languages. Pick and type the English word.'
    }
    return 'Look at the picture. Press a language you know — English included, or More languages. Pick and type it.'
  })()

  const langsToShow =
    productionPhase && connectedLang
      ? [connectedLang]
      : productionPhase
        ? []
        : VOCAB_HEAR_LANGS

  const typeForm = typingPhase ? (
    <form className="vocab-sheet-type" data-coach="vv-type" onSubmit={checkType}>
      <p className="play-nearby-objective" aria-live="polite">
        Clear this word · pick the match, then type it
      </p>
      <p className="vocab-sheet-type-prompt">
        <span className="vocab-sheet-type-kicker">Your turn</span>
        {pickReady
          ? 'Type the English word you picked and heard.'
          : 'Pick the matching English word below, then type it.'}
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
            if (feedback === 'retry' || feedback === 'need-pick') setFeedback(null)
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder="Type here…"
          aria-invalid={feedback === 'retry' || feedback === 'need-pick'}
          aria-describedby={feedback ? `${inputId}-fb` : undefined}
        />
        <button
          type="submit"
          className="btn btn-primary vocab-sheet-type-check"
          disabled={!draft.trim()}
        >
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
      {options.length > 0 && (
        <div
          className="train-choice-grid vocab-sheet-pick-bank"
          role="group"
          data-coach="vv-pick"
          aria-label="English word choices — pick the match, then type it"
        >
          {options.map((opt, i) => {
            const letter = pickLetters[i] ?? String(i + 1)
            const selected =
              !!picked && normalizeEnglishAnswer(picked) === normalizeEnglishAnswer(opt)
            const isAnswer =
              normalizeEnglishAnswer(opt) === normalizeEnglishAnswer(term.english)
            return (
              <button
                key={`${opt}-${i}`}
                type="button"
                className={`vocab-sheet-pick-chip${selected && isAnswer ? ' is-picked' : ''}${
                  pickReady && !isAnswer ? ' is-dim' : ''
                }`}
                aria-pressed={selected}
                disabled={pickReady && !isAnswer}
                onClick={() => onPickOption(opt)}
              >
                <span className="vocab-sheet-pick-letter">{letter}.</span>{' '}
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
      )}
      {feedback === 'need-pick' && (
        <p id={`${inputId}-fb`} className="play-soft-miss vocab-sheet-type-fb is-retry" role="status">
          {softMissLine('pick the matching word below, then type it. No rush.')}
        </p>
      )}
      {feedback === 'retry' && (
        <p id={`${inputId}-fb`} className="play-soft-miss vocab-sheet-type-fb is-retry" role="status">
          Not yet — hear it again, then type what you heard. No rush.
        </p>
      )}
      {pickMiss && feedback !== 'need-pick' && feedback !== 'retry' && (
        <p className="play-soft-miss vocab-sheet-type-fb is-retry" role="status">
          {softMissLine('not that one. Choices switched — pick again. No rush.')}
        </p>
      )}
    </form>
  ) : null

  const listenStatus = listeningPhase ? (
    <div className="vocab-sheet-listen" role="status" aria-live="polite">
      <p className="play-nearby-objective">
        Clear this word · listen, then pick and type
      </p>
      <p className="vocab-sheet-listen-prompt">
        {speaking
          ? connectedLang === 'English'
            ? 'Hear English…'
            : 'Hear your language, then English…'
          : 'Press Hear English if you need it again — then pick and type the word.'}
      </p>
      {!speaking && (
        <button
          type="button"
          data-coach="vv-hear"
          className="btn btn-secondary vocab-sheet-listen-go"
          onClick={() => {
            /* Hear is not a coach step (English auto-plays after language). */
            onPlayEnglish()
          }}
        >
          <SpeakerIconSmall />
          Hear English
        </button>
      )}
    </div>
  ) : null

  return (
    <article
      className={`vocab-sheet-card vocab-sheet-card-focus${heardEnglish ? ' is-heard' : ''}${bridged ? ' is-connected' : ''}${typedEnglish ? ' is-typed' : ''}${alreadyKnown ? ' is-known' : ''}${productionPhase ? ' is-production' : ''}${studioPhoto ? ' vocab-sheet-studio' : ''}`}
    >
      <header className="vocab-sheet-card-head">
        <span className={`vocab-sheet-num tone-${(index % 4) + 1}`}>{index}</span>
        {typedEnglish ? (
          <strong className="vocab-sheet-en is-linked">{term.english}</strong>
        ) : (
          <strong
            className="vocab-sheet-en is-hidden-for-type"
            aria-label={
              typingPhase
                ? 'Pick the matching English word, then type it'
                : listeningPhase
                  ? 'Listen, then pick and type the English word'
                  : 'English word hidden until you pick and type it'
            }
          >
            {typingPhase ? (pickReady ? 'Type it' : 'Pick · type') : listeningPhase ? 'Listen…' : '???'}
          </strong>
        )}
        <button
          type="button"
          data-coach="vv-hear"
          className={`vocab-sheet-audio${heardEnglish ? ' is-done' : ''}`}
          aria-label="Listen to the English workplace word"
          disabled={speaking || !bridged}
          onClick={() => {
            onPlayEnglish()
          }}
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

      {!productionPhase && !typedEnglish && (
        <p className="play-nearby-objective vocab-sheet-nearby-pre" aria-live="polite">
          Clear this word · press a language you know (or More languages), then pick and type
        </p>
      )}

      <div className={`vocab-sheet-body vocab-sheet-body-focus${productionPhase ? ' is-production' : ''}`}>
        <figure className={`vocab-sheet-photo vocab-sheet-photo-focus${studioPhoto ? ' is-studio' : ''}`}>
          {img ? (
            <img
              src={img}
              alt={
                typedEnglish
                  ? `Photo of ${term.english}`
                  : 'Workplace object — hear it, then type the English name'
              }
            />
          ) : (
            <span className="vocab-sheet-fallback" aria-hidden>
              {term.emoji}
            </span>
          )}
          <figcaption className="vocab-sheet-photo-caption">{caption}</figcaption>
        </figure>

        {/* Type / listen sit beside (desktop) or under (phone) the photo — before the lang stack so the beat is first-viewport. */}
        {productionPhase && (
          <div className="vocab-sheet-production">
            {listenStatus}
            {typeForm}
          </div>
        )}

        {(() => {
          const showLangCue = !productionPhase && langsToShow.length > 0
          const langList = (
            <ul
              className={`vocab-sheet-langs${productionPhase ? ' is-collapsed' : ''}`}
              data-coach="vv-lang"
              aria-label="Press a language you understand — English included"
            >
              {langsToShow.map((lang) => {
                const selected = connectedLang === lang
                const hearWord = vocabHearWord(term, lang)
                const enBridge = lang === 'English'
                return (
                  <li key={lang} className={selected ? 'is-connected-lang' : ''}>
                    <button
                      type="button"
                      className={`vocab-sheet-lang-btn${selected ? ' is-selected' : ''}${enBridge ? ' is-en-hear' : ''}`}
                      disabled={speaking || alreadyKnown || productionPhase}
                      onClick={() => {
                        markNavCueSeen(NAV_CUE.vocabLang)
                        if (coachFirst) advanceStationCoach('workplace-words')
                        onConnectLang(lang)
                      }}
                      aria-pressed={selected}
                      aria-label={
                        enBridge
                          ? `Hear ${hearWord} in English, then pick and type it`
                          : `Hear ${hearWord} in ${lang}, then hear, pick, and type English`
                      }
                    >
                      <span className="vocab-sheet-flag" aria-hidden>
                        {FLAG[lang]}
                      </span>
                      <span className="vocab-sheet-lang-meta">
                        <span className="vocab-sheet-lang-name">{lang}</span>
                        <span className="vocab-sheet-lang-word">{hearWord}</span>
                      </span>
                      {selected && (
                        <span className="vocab-sheet-lang-link">
                          {typedEnglish ? `→ ${term.english}` : speaking ? '→ …' : '→ pick · type'}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )
          const universal = !typedEnglish ? (
            <UniversalHearControl
              english={term.english}
              disabled={alreadyKnown || (productionPhase && !universalBridge)}
              bridge={universalBridge}
              busy={universalBusy || speaking}
              status={universalStatus}
              onPick={(lang) => {
                markNavCueSeen(NAV_CUE.vocabLang)
                if (coachFirst) advanceStationCoach('workplace-words')
                onUniversalHear(lang)
              }}
              onCloseStatus={onClearUniversalStatus}
            />
          ) : null
          /* Nav cue: once-then-quiet arrow/glow at hear chips (same grammar as Mode/Hub). */
          if (!showLangCue) {
            return (
              <>
                {langList}
                {universal}
              </>
            )
          }
          return (
            <>
              <NavCueTarget
                cueId={NAV_CUE.vocabLang}
                arrowLabel="Languages here"
                arrowSide="above"
                className="vocab-lang-cue"
              >
                <NavGlowRegion cueId={NAV_CUE.vocabLang} dismissOnClick={false}>
                  {langList}
                </NavGlowRegion>
              </NavCueTarget>
              {universal}
            </>
          )
        })()}
      </div>

      {typedEnglish && (
        <p className="vocab-sheet-type-fb is-ok" role="status">
          Yes — <strong>{term.english}</strong>.
        </p>
      )}

      {typedEnglish && (
        <>
          <p className="vocab-sheet-definition">{term.definition}</p>
          <p className="vocab-sheet-sentence">{term.sentence}</p>
        </>
      )}

      {allowSkipKnown && !alreadyKnown && !productionPhase && !typedEnglish && (
        <button type="button" className="btn btn-ghost vocab-known-btn" onClick={onMarkKnown}>
          I already know this word
        </button>
      )}
      {alreadyKnown && !typedEnglish && (
        <p className="vocab-known-note">
          Marked known — hear English once, then pick and type it so it sticks.
        </p>
      )}
      {coachFirst ? (
        <StationCoach
          stationId="workplace-words"
          layoutKey={`${bridged}-${heardEnglish}-${typingPhase}-${pickReady}-${typedEnglish}`}
        />
      ) : null}
    </article>
  )
}

type DeckProps = {
  terms: VocabTerm[]
  index: number
  speakingId: string | null
  /** English audio completed for each term id */
  heard: Record<string, boolean>
  /** Language pressed for each term id (mother tongue or English bridge) */
  connected: Record<string, SupportLang>
  /** Universal translator bridges per term id */
  universal: Record<string, UniversalBridge>
  universalBusyId: string | null
  universalStatus: UniversalHearStatus
  /** English spelling typed correctly for each term id */
  typed: Record<string, boolean>
  /** Adaptive: term ids the learner already knows */
  knownIds: string[]
  onIndexChange: (index: number) => void
  onPlayEnglish: (term: VocabTerm) => void
  onConnectLang: (term: VocabTerm, lang: SupportLang) => void
  onUniversalHear: (term: VocabTerm, lang: HearLanguage) => void
  onClearUniversalStatus: () => void
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
  /**
   * After the station was finished once: retake framing + skip-known control.
   * First go stays hear → hear → pick → type with no skip shortcut.
   */
  allowSkipKnown?: boolean
}

export function termLinked(
  term: VocabTerm,
  heard: Record<string, boolean>,
  connected: Record<string, SupportLang>,
  typed: Record<string, boolean>,
  knownSet: Set<string>,
  universal?: Record<string, UniversalBridge>,
) {
  return (
    !!heard[term.id] &&
    !!typed[term.id] &&
    (!!connected[term.id] || !!universal?.[term.id] || knownSet.has(term.id))
  )
}

/**
 * One-by-one vocabulary deck (worksheet mold).
 * Pattern: see picture → hear a language (incl. English / More languages) → pick + type.
 * Large tables page in worksheet banks of 20.
 */
export function VocabSheet({
  terms,
  index,
  speakingId,
  heard,
  connected,
  universal,
  universalBusyId,
  universalStatus,
  typed,
  knownIds,
  onIndexChange,
  onPlayEnglish,
  onConnectLang,
  onUniversalHear,
  onClearUniversalStatus,
  onMarkKnown,
  onTypedCorrect,
  journeyGateCount,
  journeyGateIds,
  allowSkipKnown = false,
}: DeckProps) {
  const knownSet = new Set(knownIds)
  const idx = Math.min(Math.max(0, index), Math.max(0, terms.length - 1))
  const term = terms[idx]
  const atEnd = idx >= terms.length - 1
  const heardEnglish = !!heard[term.id]
  const typedEnglish = !!typed[term.id]
  const connectedLang = connected[term.id] ?? null
  const universalBridge = universal[term.id] ?? null
  const alreadyKnown = knownSet.has(term.id)
  const bridged = !!connectedLang || !!universalBridge || alreadyKnown
  const linkedCount = terms.filter((t) =>
    termLinked(t, heard, connected, typed, knownSet, universal),
  ).length
  const allLinked = linkedCount >= terms.length
  const wordReady = bridged && heardEnglish && typedEnglish

  const paged = terms.length > VOCAB_PAGE_SIZE
  const pageCount = paged ? Math.ceil(terms.length / VOCAB_PAGE_SIZE) : 1
  const page = paged ? Math.floor(idx / VOCAB_PAGE_SIZE) : 0
  const pageStart = page * VOCAB_PAGE_SIZE
  const pageEnd = Math.min(terms.length, pageStart + VOCAB_PAGE_SIZE)
  /** Same worksheet page = same language level for VV pick distractors. */
  const choicePool = useMemo(
    () => terms.slice(pageStart, pageEnd),
    [terms, pageStart, pageEnd],
  )
  const pageLinked = choicePool.filter((t) =>
    termLinked(t, heard, connected, typed, knownSet, universal),
  ).length
  const pageTotal = pageEnd - pageStart

  const gateIdSet =
    journeyGateIds && journeyGateIds.length > 0 ? new Set(journeyGateIds) : null
  const gateTerms = gateIdSet
    ? terms.filter((t) => gateIdSet.has(t.id))
    : terms.slice(0, Math.min(journeyGateCount ?? terms.length, terms.length))
  const gate = gateTerms.length
  const gateLinked = gateTerms.filter((t) =>
    termLinked(t, heard, connected, typed, knownSet, universal),
  ).length
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
      {allowSkipKnown ? (
        <div className="vocab-retake" role="status">
          <p className="vocab-retake-kicker">Another round</p>
          <p className="vocab-retake-lede">
            Same words, same loop — hear, hear, pick, type. This time you can mark ones you already know;
            you still hear English once, pick the match, and type it so it sticks.
          </p>
        </div>
      ) : (
        <p className="vocab-sheet-lede">
          One word at a time. Press a language you understand (English is included), or More languages to hear a translation. Pick the match. Type it.
          Choices switch when you miss — so the word sticks, not the button.
          {paged
            ? ` This set has ${terms.length} words in pages of ${VOCAB_PAGE_SIZE}.`
            : ''}
        </p>
      )}

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
        choicePool={choicePool}
        speaking={speakingId === term.id}
        heardEnglish={heardEnglish}
        typedEnglish={typedEnglish}
        connectedLang={connectedLang}
        universalBridge={universalBridge}
        universalBusy={universalBusyId === term.id}
        universalStatus={universalStatus}
        alreadyKnown={alreadyKnown}
        allowSkipKnown={allowSkipKnown}
        onPlayEnglish={() => onPlayEnglish(term)}
        onConnectLang={(lang) => onConnectLang(term, lang)}
        onUniversalHear={(lang) => onUniversalHear(term, lang)}
        onClearUniversalStatus={onClearUniversalStatus}
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
            ? 'Press a language first'
            : !heardEnglish
              ? 'Hear English next'
              : !typedEnglish
                ? 'Pick · type next'
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
