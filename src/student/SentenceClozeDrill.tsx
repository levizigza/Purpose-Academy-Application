import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { pathwayImage } from '../pathways'
import type { SentenceClozeItem } from '../pathways/packs/constructionSentenceCloze560'
import { isPracticeMode } from '../practice/PracticeMode'
import { speakEnglish } from './speech'
import { playFoley } from '../audio/foley'
import { firePlayClear, softMissLine } from '../practice/PlayClear'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'
import { recordSkillAttempt } from './learningMastery'
import { normalizeEnglishAnswer } from './VocabSheet'

/** Worksheet tile from public/sentence-cloze/ when extracted from the PPTX. */
function sentenceImageUrl(file?: string) {
  if (!file) return undefined
  const base = import.meta.env.BASE_URL || '/'
  return `${base}sentence-cloze/${file}`
}

/** Prefer PPTX tile; fall back to Visual Vocabulary photo (pathway imageKey). */
function resolveClozeImage(item: SentenceClozeItem) {
  return sentenceImageUrl(item.imageFile) || pathwayImage(item.imageKey)
}

/** Construction Questions PPTX: 10 items per worksheet page (1–10, 11–20, …). */
export const SENTENCE_PAGE_SIZE = 10

/** Pass a page with honest effort — 8 of 10 first-try (same 80% bar as the old 16/20). */
const PASS_SCORE = 8

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function fillBlank(prompt: string, word: string) {
  return prompt.replace('______', word)
}

type Phase = 'drill' | 'result' | 'repair' | 'passed'

function normWord(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function answerPictured(answer: string, pictured: Set<string>) {
  const n = normWord(answer)
  if (pictured.has(n)) return true
  if (n.endsWith('s') && pictured.has(n.slice(0, -1))) return true
  if (pictured.has(`${n}s`)) return true
  return false
}

/**
 * Prefer pictured Visual Vocabulary answers (ladder honesty).
 * When `picturedOnly`, orphan cloze rows (no VV picture) are purged from the bank —
 * never shown on later pages either.
 */
function orderForLadder(
  items: SentenceClozeItem[],
  picturedAnswers?: string[],
  picturedOnly?: boolean,
) {
  if (!picturedAnswers?.length) return items
  const pictured = new Set(picturedAnswers.map(normWord))
  const hit: SentenceClozeItem[] = []
  const miss: SentenceClozeItem[] = []
  for (const item of items) {
    ;(answerPictured(item.answer, pictured) ? hit : miss).push(item)
  }
  if (picturedOnly) return hit.length ? hit : items
  return hit.length >= SENTENCE_PAGE_SIZE ? [...hit, ...miss] : items
}

type Props = {
  items: SentenceClozeItem[]
  /**
   * English terms the learner has already seen as pictures (Visual Vocabulary).
   * When provided, Level-1 pages prefer these answers so sentences follow pictures.
   */
  picturedAnswers?: string[]
  /** Drop cloze rows whose answers are not in pictured Visual Vocabulary. */
  picturedOnlyBank?: boolean
  /**
   * Document brand shown in kickers / help copy
   * (e.g. "Construction Questions" or "Logistics Questions").
   */
  documentLabel?: string
  /** First honest page pass — unlocks Word → Action (more pages stay open). */
  onLevel1Passed: () => void
  onContinueToActions: () => void
  continueLabel?: string
  /** Practice quality-review: leave Sentence Structure without finishing the page. */
  onSkipToActions?: () => void
}

/**
 * Sentence Structure — Purpose Academy Questions mold (Construction / Logistics / Community).
 *
 * Play craft: picture + cloze + **four word choices always visible** → type the matching
 * word (Type / Go) → soft miss with rapid retry → firePlayClear joy.
 * Choices are a reference board — not tap-to-answer (typing is the clear).
 */
export function SentenceClozeDrill({
  items,
  picturedAnswers,
  picturedOnlyBank,
  documentLabel = 'Construction Questions',
  onLevel1Passed,
  onContinueToActions,
  continueLabel = 'Continue to Word → Action',
  onSkipToActions,
}: Props) {
  const englishBrand = documentLabel.replace(/\s+Questions$/i, ' English')
  /** Docs order is PPTX 1–560. Only reorder when a caller explicitly asks. */
  const bank = useMemo(
    () =>
      picturedAnswers?.length || picturedOnlyBank
        ? orderForLadder(items, picturedAnswers, picturedOnlyBank)
        : items,
    [items, picturedAnswers, picturedOnlyBank],
  )
  const pageCount = Math.max(1, Math.ceil(bank.length / SENTENCE_PAGE_SIZE))
  const [page, setPage] = useState(0)
  const [phase, setPhase] = useState<Phase>('drill')
  const [idx, setIdx] = useState(0)
  const [resolved, setResolved] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [filled, setFilled] = useState(false)
  const [flying, setFlying] = useState(false)
  const [scoreCorrect, setScoreCorrect] = useState(0)
  const [missed, setMissed] = useState<SentenceClozeItem[]>([])
  const [repairDeck, setRepairDeck] = useState<SentenceClozeItem[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [level1Unlocked, setLevel1Unlocked] = useState(false)
  const [draft, setDraft] = useState('')
  const [typeFeedback, setTypeFeedback] = useState<'retry' | null>(null)
  const practice = isPracticeMode()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const pageItems = useMemo(() => {
    const start = page * SENTENCE_PAGE_SIZE
    return bank.slice(start, start + SENTENCE_PAGE_SIZE)
  }, [bank, page])

  const deck = phase === 'repair' ? repairDeck : pageItems
  const item = deck[Math.min(idx, Math.max(0, deck.length - 1))]
  const isLast = idx >= deck.length - 1

  useEffect(() => {
    if (!item || phase === 'passed' || phase === 'result') return
    setOptions([...item.options])
    setResolved(false)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setDraft('')
    setTypeFeedback(null)
  }, [item?.id, phase, page])

  useEffect(() => {
    if (!item || resolved || phase === 'passed' || phase === 'result') return
    const t = window.setTimeout(() => inputRef.current?.focus(), 160)
    return () => window.clearTimeout(t)
  }, [item?.id, resolved, phase, page])

  function finishPagePass(finalScore: number) {
    setPhase('passed')
    firePlayClear({
      label: 'Page clear',
      remnant: 'Sentences done — next door can open',
      kind: 'board',
    })
    if (!level1Unlocked) {
      setLevel1Unlocked(true)
      onLevel1Passed()
    }
    void finalScore
  }

  function resetItemChrome() {
    setResolved(false)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setDraft('')
    setTypeFeedback(null)
  }

  function advanceAfterResolve(wasCorrect: boolean, newScore: number, nextMissed: SentenceClozeItem[]) {
    window.setTimeout(() => {
      if (!isLast) {
        setIdx((i) => i + 1)
        resetItemChrome()
        return
      }

      if (phase === 'repair') {
        if (nextMissed.length) {
          setRepairDeck(shuffle(nextMissed))
          setMissed([])
          setIdx(0)
          resetItemChrome()
          playFoley('whoosh')
          return
        }
        finishPagePass(newScore)
        return
      }

      const passed = newScore >= PASS_SCORE
      if (!passed) {
        setPhase('result')
        playFoley('wrong')
        return
      }
      if (nextMissed.length > 0) {
        setRepairDeck(shuffle(nextMissed))
        setMissed([])
        setIdx(0)
        setPhase('repair')
        resetItemChrome()
        playFoley('whoosh')
        return
      }
      finishPagePass(newScore)
    }, wasCorrect ? 900 : 1200)
  }

  /** Lock the item after a correct typed clear. */
  function resolveItem(ok: boolean) {
    if (!item || resolved) return
    setResolved(true)
    setCorrect(ok)
    setFlying(true)
    setTypeFeedback(null)
    recordSkillAttempt('sentence-cloze', ok, ok ? 12 : 0)
    if (ok) {
      const leftAfter = deck.length - (idx + 1)
      firePlayClear({
        label: 'Sentence clear',
        remnant: leftAfter > 0 ? `${leftAfter} left on this page` : 'Page almost clear',
        kind: 'micro',
      })
    } else {
      playFoley('wrong')
    }

    const newScore = scoreCorrect + (ok ? 1 : 0)
    const nextMissed = ok ? missed : [...missed, item]
    setScoreCorrect(newScore)
    setMissed(nextMissed)

    window.setTimeout(() => {
      setFilled(true)
      setFlying(false)
      void speakEnglish(fillBlank(item.prompt, item.answer))
    }, 280)

    advanceAfterResolve(ok, newScore, nextMissed)
  }

  const coachFirst = phase === 'drill' && page === 0 && idx === 0

  function checkType(e: FormEvent) {
    e.preventDefault()
    if (!item || resolved) return
    const ok = normalizeEnglishAnswer(draft) === normalizeEnglishAnswer(item.answer)
    if (ok) {
      if (coachFirst) advanceStationCoach('sentence-structure')
      resolveItem(true)
      return
    }
    playFoley('wrong')
    setTypeFeedback('retry')
    setDraft('')
    inputRef.current?.focus()
  }

  function retryPage() {
    setIdx(0)
    setScoreCorrect(0)
    setMissed([])
    setRepairDeck([])
    resetItemChrome()
    setPhase('drill')
    playFoley('whoosh')
  }

  function nextPage() {
    jumpToPage(page + 1)
  }

  function jumpToPage(next: number) {
    if (next < 0 || next >= pageCount) return
    setPage(next)
    setIdx(0)
    setScoreCorrect(0)
    setMissed([])
    setRepairDeck([])
    resetItemChrome()
    setPhase('drill')
    playFoley('whoosh')
  }

  function WorksheetPageJump({ id }: { id: string }) {
    return (
      <label className="sentence-cloze-page-jump" htmlFor={id}>
        <span>Worksheet page</span>
        <select
          id={id}
          value={page}
          onChange={(e) => jumpToPage(Number(e.target.value))}
          aria-label={`Jump to any ${documentLabel} page`}
        >
          {Array.from({ length: pageCount }, (_, i) => {
            const from = i * SENTENCE_PAGE_SIZE + 1
            const to = Math.min((i + 1) * SENTENCE_PAGE_SIZE, bank.length)
            return (
              <option key={i} value={i}>
                {from}–{to} / {bank.length}
              </option>
            )
          })}
        </select>
      </label>
    )
  }

  if (!bank.length) {
    return (
      <div className="alert warn">Sentence Structure is not loaded for this pathway yet.</div>
    )
  }

  if (phase === 'passed') {
    const from = page * SENTENCE_PAGE_SIZE + 1
    const to = Math.min((page + 1) * SENTENCE_PAGE_SIZE, bank.length)
    return (
      <article className="sentence-cloze-card sentence-cloze-pass" aria-live="polite">
        <p className="section-kicker">Sentence Structure</p>
        <div className="sentence-cloze-pass-badge" aria-hidden>
          ✓
        </div>
        <h2>Page complete</h2>
        <p className="lede">
          Sentences {from}–{to} clear. {scoreCorrect} of {pageItems.length} landed in the blank — keep the words
          working for you on site.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onContinueToActions}>
            {continueLabel}
          </button>
          {page + 1 < pageCount ? (
            <button type="button" className="btn btn-secondary on-light" onClick={nextPage}>
              Keep practising · questions {page * SENTENCE_PAGE_SIZE + 11}–{Math.min((page + 2) * SENTENCE_PAGE_SIZE, bank.length)}
            </button>
          ) : null}
        </div>
        <WorksheetPageJump id="sentence-page-jump-pass" />
      </article>
    )
  }

  if (phase === 'result') {
    return (
      <article className="sentence-cloze-card" aria-live="polite">
        <p className="section-kicker">Sentence Structure</p>
        <h2>Keep learning this page</h2>
        <p className="lede">
          {scoreCorrect} of {pageItems.length} clear so far. Clear {PASS_SCORE} on this page to keep moving.
          Read the four words, then type the one that fits — soft try again when it is not yet. No rush.
        </p>
        <button type="button" className="btn btn-primary" onClick={retryPage}>
          Not yet · practice this page again
        </button>
        {practice && onSkipToActions ? (
          <button type="button" className="btn btn-secondary on-light" onClick={onSkipToActions}>
            Skip to Word → Action
          </button>
        ) : null}
        <WorksheetPageJump id="sentence-page-jump-result" />
      </article>
    )
  }

  if (!item) {
    return <div className="alert warn">Loading sentences…</div>
  }

  const showWord = Boolean(filled || (resolved && correct))
  const displayWord = showWord ? item.answer : null
  const before = item.prompt.split('______')[0] ?? ''
  const after = item.prompt.split('______')[1] ?? ''
  const imageSrc = resolveClozeImage(item)
  const choiceLetters = ['A', 'B', 'C', 'D'] as const
  const typingOpen = !resolved

  return (
    <article className="sentence-cloze-card">
      <div className="sentence-cloze-head-row">
        <div>
          <p className="section-kicker">Sentence Structure</p>
          <p className="sentence-cloze-doc-kicker">{englishBrand} · Type the matching word</p>
        </div>
        {practice && onSkipToActions ? (
          <button
            type="button"
            className="btn btn-ghost sentence-cloze-skip"
            onClick={onSkipToActions}
          >
            Skip to Word → Action
          </button>
        ) : null}
      </div>
      <p className="play-nearby-objective" aria-live="polite">
        {phase === 'repair'
          ? `Repair · ${deck.length - idx} left · type the matching word`
          : `Clear this page · ${deck.length - idx} left · type the matching word`}
      </p>
      <p className="train-vocab-counter">
        {phase === 'repair' ? 'Repair round · ' : ''}
        All {bank.length} {documentLabel} · Item {idx + 1} of {deck.length}
        {phase === 'drill' ? ` · ${scoreCorrect} clear so far` : ''}
        {level1Unlocked ? ' · First page done' : ''}
      </p>
      <WorksheetPageJump id="sentence-page-jump-drill" />
      <p className="lede sentence-cloze-help">
        Four words below. Type the one that fits the blank — soft try again if not yet. No exam, no rush.
      </p>

      <div
        className={`sentence-cloze-item${showWord ? ' is-filled' : ''}${correct && showWord ? ' is-correct' : ''}${
          resolved && !correct && filled ? ' is-wrong' : ''
        }`}
      >
        <figure className="sentence-cloze-photo">
          {imageSrc ? (
            <img src={imageSrc} alt="" />
          ) : (
            <span className="sentence-cloze-photo-fallback">{item.answer}</span>
          )}
        </figure>

        <div
          className={`sentence-cloze-line${showWord ? ' is-filled' : ''}${correct && showWord ? ' is-correct' : ''}${
            resolved && !correct && filled ? ' is-wrong' : ''
          }`}
          aria-live="polite"
        >
          <span className="sentence-cloze-num">{item.n}.</span>
          <span>{before}</span>
          <span className={`sentence-cloze-blank${displayWord ? ' has-word' : ''}`}>
            {displayWord ? (
              <span className={`sentence-cloze-word${flying ? ' is-landing' : ' is-set'}`}>{displayWord}</span>
            ) : (
              <span className="sentence-cloze-slot">______</span>
            )}
          </span>
          <span>{after}</span>
        </div>
      </div>

      {typingOpen ? (
        <form className="sentence-cloze-type" data-coach="sent-type" onSubmit={checkType}>
          <p className="sentence-cloze-type-prompt">
            <span className="sentence-cloze-type-kicker">Your turn</span>
            Type the matching word from the four choices.
          </p>
          <div className="sentence-cloze-type-row">
            <label className="sr-only" htmlFor={inputId}>
              Missing word
            </label>
            <input
              ref={inputRef}
              id={inputId}
              className="sentence-cloze-type-input"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                if (typeFeedback === 'retry') setTypeFeedback(null)
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              placeholder="Type here…"
              aria-invalid={typeFeedback === 'retry'}
              aria-describedby={typeFeedback ? `${inputId}-fb` : undefined}
            />
            <button type="submit" className="btn btn-primary sentence-cloze-type-go" disabled={!draft.trim()}>
              Go
            </button>
          </div>
          {typeFeedback === 'retry' ? (
            <p id={`${inputId}-fb`} className="play-soft-miss" role="status">
              {softMissLine('try again. Look at the four words.')}
            </p>
          ) : null}
        </form>
      ) : null}

      <div
        className="train-choice-grid sentence-cloze-choices"
        role="list"
        data-coach="sent-choices"
        aria-label="Word choices — type the correct one"
      >
        {options.map((opt, i) => {
          const letter = choiceLetters[i] ?? String(i + 1)
          const showAnswer = resolved && opt === item.answer
          return (
            <div
              key={opt}
              role="listitem"
              className={`sentence-cloze-chip state-${showAnswer ? 'correct' : 'idle'}${
                showAnswer && flying ? ' is-flying' : ''
              }${resolved && !showAnswer ? ' is-dim' : ''} is-reference`}
            >
              <span className="sentence-cloze-chip-letter">{letter}.</span>{' '}
              <span>{opt}</span>
            </div>
          )
        })}
      </div>

      {resolved && correct ? (
        <div className="alert ok">Yes — the word completes the sentence.</div>
      ) : null}
      {coachFirst ? (
        <StationCoach
          stationId="sentence-structure"
          layoutKey={`${item.id}-${resolved}-${typingOpen}`}
        />
      ) : null}
    </article>
  )
}
