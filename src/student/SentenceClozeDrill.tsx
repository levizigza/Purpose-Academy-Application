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
import { choiceOrderKey, shuffleChoicesFresh } from './vocabDistractors'

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

/** Brief hold after success TTS so the filled sentence stays readable before advance. */
const SUCCESS_SETTLE_MS = 320

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

/** Full-sentence choice bank from the cloze stem + A–D option words. */
function buildSentenceOptions(item: SentenceClozeItem): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const word of item.options) {
    const sentence = fillBlank(item.prompt, word)
    const key = normalizeEnglishAnswer(sentence)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(sentence)
  }
  const correct = fillBlank(item.prompt, item.answer)
  const correctKey = normalizeEnglishAnswer(correct)
  if (correctKey && !seen.has(correctKey)) out.unshift(correct)
  return out
}

type Phase = 'drill' | 'result' | 'repair' | 'passed'

/** Per-item beat: pick full sentence → hear → type → hold while success audio ends. */
type Beat = 'pick' | 'hear' | 'type' | 'clearing'

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

function SpeakerIconSmall() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M4 10v4h3l5 4V6L7 10H4zm11.5 2a3.5 3.5 0 0 0-1.8-3.1v6.2A3.5 3.5 0 0 0 15.5 12z"
      />
      <path
        fill="currentColor"
        d="M15.5 12a5.5 5.5 0 0 0-2.8-4.8v1.7a3.8 3.8 0 0 1 0 6.2v1.7A5.5 5.5 0 0 0 15.5 12z"
        opacity="0.85"
      />
    </svg>
  )
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
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
 * Play craft: picture + incomplete stem → **~4 shuffled full-sentence options** → pick →
 * hear the sentence → type the full sentence → hold the clear while success TTS ends → advance.
 * Soft miss + reshuffle on wrong pick (VV anti-cheat). Soft miss on type. Dual-shell night + paper.
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
  const [beat, setBeat] = useState<Beat>('pick')
  const [resolved, setResolved] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [filled, setFilled] = useState(false)
  const [flying, setFlying] = useState(false)
  const [scoreCorrect, setScoreCorrect] = useState(0)
  const [missed, setMissed] = useState<SentenceClozeItem[]>([])
  const [repairDeck, setRepairDeck] = useState<SentenceClozeItem[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [pickMiss, setPickMiss] = useState(false)
  const [heard, setHeard] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [level1Unlocked, setLevel1Unlocked] = useState(false)
  const [draft, setDraft] = useState('')
  const [typeFeedback, setTypeFeedback] = useState<'retry' | 'need-pick' | 'need-hear' | null>(null)
  const practice = isPracticeMode()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const prevOrderKeyRef = useRef<string | null>(null)
  const itemTokenRef = useRef(0)
  const mountedRef = useRef(true)

  const pageItems = useMemo(() => {
    const start = page * SENTENCE_PAGE_SIZE
    return bank.slice(start, start + SENTENCE_PAGE_SIZE)
  }, [bank, page])

  const deck = phase === 'repair' ? repairDeck : pageItems
  const item = deck[Math.min(idx, Math.max(0, deck.length - 1))]
  const isLast = idx >= deck.length - 1
  const correctSentence = item ? fillBlank(item.prompt, item.answer) : ''
  const pickReady =
    !!picked && normalizeEnglishAnswer(picked) === normalizeEnglishAnswer(correctSentence)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  function dealSentenceBank(nextItem: SentenceClozeItem, prevKey: string | null) {
    const bankOpts = buildSentenceOptions(nextItem)
    const next = shuffleChoicesFresh(bankOpts, prevKey)
    prevOrderKeyRef.current = choiceOrderKey(next)
    setOptions(next)
  }

  useEffect(() => {
    if (!item || phase === 'passed' || phase === 'result') return
    itemTokenRef.current += 1
    setBeat('pick')
    setResolved(false)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setDraft('')
    setTypeFeedback(null)
    setPicked(null)
    setPickMiss(false)
    setHeard(false)
    setSpeaking(false)
    prevOrderKeyRef.current = null
    dealSentenceBank(item, null)
  }, [item?.id, phase, page])

  useEffect(() => {
    if (!item || beat !== 'type' || resolved || phase === 'passed' || phase === 'result') return
    const t = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 160)
    return () => window.clearTimeout(t)
  }, [item?.id, beat, resolved, phase, page])

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
    setBeat('pick')
    setResolved(false)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setDraft('')
    setTypeFeedback(null)
    setPicked(null)
    setPickMiss(false)
    setHeard(false)
    setSpeaking(false)
  }

  function advanceAfterClear(newScore: number, nextMissed: SentenceClozeItem[]) {
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
  }

  async function playSentenceAudio(sentence: string, token: number) {
    if (!mountedRef.current || token !== itemTokenRef.current) return false
    setSpeaking(true)
    const ok = await speakEnglish(sentence)
    if (!mountedRef.current || token !== itemTokenRef.current) return false
    setSpeaking(false)
    return ok
  }

  async function onPickOption(sentence: string) {
    if (!item || beat !== 'pick' || resolved) return
    if (normalizeEnglishAnswer(sentence) === normalizeEnglishAnswer(correctSentence)) {
      setPicked(sentence)
      setPickMiss(false)
      setFilled(true)
      setFlying(true)
      setTypeFeedback(null)
      if (coachFirst) advanceStationCoach('sentence-structure')
      setBeat('hear')
      const token = itemTokenRef.current
      window.setTimeout(() => setFlying(false), 420)
      await playSentenceAudio(correctSentence, token)
      if (!mountedRef.current || token !== itemTokenRef.current) return
      setHeard(true)
      setBeat('type')
      if (coachFirst) advanceStationCoach('sentence-structure')
      return
    }
    /* Wrong pick: soft miss + reshuffle so position tapping cannot clear. */
    playFoley('wrong')
    setPicked(null)
    setPickMiss(true)
    setTypeFeedback(null)
    setDraft('')
    dealSentenceBank(item, prevOrderKeyRef.current)
  }

  /** Lock the item after a correct typed clear — hold UI until success TTS ends. */
  async function clearItem() {
    if (!item || resolved) return
    const token = itemTokenRef.current
    setResolved(true)
    setCorrect(true)
    setFilled(true)
    setFlying(true)
    setBeat('clearing')
    setTypeFeedback(null)
    recordSkillAttempt('sentence-cloze', true, 12)

    const leftAfter = deck.length - (idx + 1)
    firePlayClear({
      label: 'Sentence clear',
      remnant: leftAfter > 0 ? `${leftAfter} left on this page` : 'Page almost clear',
      kind: 'micro',
    })

    const newScore = scoreCorrect + 1
    const nextMissed = missed
    setScoreCorrect(newScore)

    /* Keep the completed sentence on screen while success audio plays — then advance. */
    await playSentenceAudio(correctSentence, token)
    if (!mountedRef.current || token !== itemTokenRef.current) return
    await sleep(SUCCESS_SETTLE_MS)
    if (!mountedRef.current || token !== itemTokenRef.current) return
    setFlying(false)
    advanceAfterClear(newScore, nextMissed)
  }

  const coachFirst = phase === 'drill' && page === 0 && idx === 0

  function checkType(e: FormEvent) {
    e.preventDefault()
    if (!item || resolved) return
    if (!pickReady) {
      playFoley('wrong')
      setTypeFeedback('need-pick')
      setPickMiss(true)
      return
    }
    if (!heard) {
      playFoley('wrong')
      setTypeFeedback('need-hear')
      return
    }
    const ok = normalizeEnglishAnswer(draft) === normalizeEnglishAnswer(correctSentence)
    if (ok) {
      if (coachFirst) advanceStationCoach('sentence-structure')
      void clearItem()
      return
    }
    playFoley('wrong')
    setTypeFeedback('retry')
    setDraft('')
    inputRef.current?.focus()
  }

  async function replayHear() {
    if (!item || resolved || speaking) return
    const token = itemTokenRef.current
    await playSentenceAudio(correctSentence, token)
    if (!mountedRef.current || token !== itemTokenRef.current) return
    setHeard(true)
    if (beat === 'hear') setBeat('type')
    if (typeFeedback === 'need-hear') setTypeFeedback(null)
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
          Sentences {from}–{to} clear. {scoreCorrect} of {pageItems.length} landed — keep the words
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
          Pick the full sentence, hear it, then type it — soft try again when it is not yet. No rush.
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

  const showWord = Boolean(filled || (resolved && correct) || pickReady)
  const displayWord = showWord ? item.answer : null
  const before = item.prompt.split('______')[0] ?? ''
  const after = item.prompt.split('______')[1] ?? ''
  const imageSrc = resolveClozeImage(item)
  const choiceLetters = ['A', 'B', 'C', 'D'] as const
  const typingOpen = beat === 'type' && !resolved
  const pickOpen = beat === 'pick' && !resolved
  const nearbyLine =
    beat === 'clearing'
      ? 'Sentence clear — listen, then next'
      : beat === 'hear'
        ? 'Listen to the sentence'
        : beat === 'type'
          ? pickReady
            ? 'Type the full sentence you heard'
            : 'Pick the match, hear it, then type it'
          : phase === 'repair'
            ? `Repair · ${deck.length - idx} left · pick · hear · type`
            : `Clear this page · ${deck.length - idx} left · pick · hear · type`

  return (
    <article className="sentence-cloze-card">
      <div className="sentence-cloze-head-row">
        <div>
          <p className="section-kicker">Sentence Structure</p>
          <p className="sentence-cloze-doc-kicker">{englishBrand} · Pick · hear · type</p>
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
        {nearbyLine}
      </p>
      <p className="train-vocab-counter">
        {phase === 'repair' ? 'Repair round · ' : ''}
        All {bank.length} {documentLabel} · Item {idx + 1} of {deck.length}
        {phase === 'drill' ? ` · ${scoreCorrect} clear so far` : ''}
        {level1Unlocked ? ' · First page done' : ''}
      </p>
      <WorksheetPageJump id="sentence-page-jump-drill" />
      <p className="lede sentence-cloze-help">
        Incomplete sentence above. Pick the full sentence that fits, hear it, then type it — soft try
        again if not yet. No exam, no rush.
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

      {beat === 'hear' ? (
        <div className="sentence-cloze-hear" data-coach="sent-hear" role="status" aria-live="polite">
          <p className="sentence-cloze-hear-line">
            {speaking ? 'Listening…' : 'Hear the sentence, then type it.'}
          </p>
          <button
            type="button"
            className="btn btn-ghost sentence-cloze-hear-btn"
            disabled={speaking}
            onClick={() => void replayHear()}
          >
            <SpeakerIconSmall />
            {speaking ? 'Playing…' : 'Hear again'}
          </button>
        </div>
      ) : null}

      {typingOpen ? (
        <form className="sentence-cloze-type" data-coach="sent-type" onSubmit={checkType}>
          <p className="sentence-cloze-type-prompt">
            <span className="sentence-cloze-type-kicker">Your turn</span>
            Type the full sentence you picked and heard.
          </p>
          <div className="sentence-cloze-type-row">
            <label className="sr-only" htmlFor={inputId}>
              Full sentence
            </label>
            <input
              ref={inputRef}
              id={inputId}
              className="sentence-cloze-type-input"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                if (typeFeedback) setTypeFeedback(null)
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              placeholder="Type the full sentence…"
              aria-invalid={typeFeedback === 'retry' || typeFeedback === 'need-pick' || typeFeedback === 'need-hear'}
              aria-describedby={typeFeedback ? `${inputId}-fb` : undefined}
            />
            <button type="submit" className="btn btn-primary sentence-cloze-type-go" disabled={!draft.trim()}>
              Go
            </button>
          </div>
          <div className="sentence-cloze-type-tools">
            <button
              type="button"
              className="btn btn-ghost sentence-cloze-hear-btn"
              disabled={speaking}
              onClick={() => void replayHear()}
            >
              <SpeakerIconSmall />
              {speaking ? 'Playing…' : 'Hear again'}
            </button>
          </div>
          {typeFeedback === 'need-pick' ? (
            <p id={`${inputId}-fb`} className="play-soft-miss" role="status">
              {softMissLine('pick the matching sentence below, then type it. No rush.')}
            </p>
          ) : null}
          {typeFeedback === 'need-hear' ? (
            <p id={`${inputId}-fb`} className="play-soft-miss" role="status">
              {softMissLine('hear the sentence first, then type it. No rush.')}
            </p>
          ) : null}
          {typeFeedback === 'retry' ? (
            <p id={`${inputId}-fb`} className="play-soft-miss" role="status">
              {softMissLine('try again. Hear it, then type the full sentence.')}
            </p>
          ) : null}
        </form>
      ) : null}

      {(pickOpen || pickReady) && !resolved ? (
        <div
          className="train-choice-grid sentence-cloze-choices sentence-cloze-sentence-bank"
          role="group"
          data-coach="sent-pick"
          aria-label="Full sentence choices — pick the match, then hear and type it"
        >
          {options.map((opt, i) => {
            const letter = choiceLetters[i] ?? String(i + 1)
            const selected =
              !!picked && normalizeEnglishAnswer(picked) === normalizeEnglishAnswer(opt)
            const isAnswer =
              normalizeEnglishAnswer(opt) === normalizeEnglishAnswer(correctSentence)
            const locked = pickReady && !isAnswer
            return (
              <button
                key={`${opt}-${i}`}
                type="button"
                className={`sentence-cloze-chip sentence-cloze-sentence-chip${
                  selected && isAnswer ? ' is-picked state-correct' : ' state-idle'
                }${pickReady && !isAnswer ? ' is-dim' : ''}`}
                aria-pressed={selected}
                disabled={!pickOpen || locked}
                onClick={() => void onPickOption(opt)}
              >
                <span className="sentence-cloze-chip-letter">{letter}.</span>{' '}
                <span className="sentence-cloze-sentence-text">{opt}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      {pickMiss && beat === 'pick' && !typeFeedback ? (
        <p className="play-soft-miss" role="status">
          {softMissLine('not that one. Choices switched — pick again. No rush.')}
        </p>
      ) : null}

      {resolved && correct ? (
        <div className="alert ok">Yes — that sentence is clear.</div>
      ) : null}
      {coachFirst ? (
        <StationCoach
          stationId="sentence-structure"
          layoutKey={`${item.id}-${beat}-${resolved}-${typingOpen}-${pickOpen}`}
        />
      ) : null}
    </article>
  )
}
