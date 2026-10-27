import { useEffect, useMemo, useState } from 'react'
import { pathwayImage } from '../pathways'
import type { SentenceClozeItem } from '../pathways/packs/constructionSentenceCloze560'
import { isPracticeMode } from '../practice/PracticeMode'
import { speakEnglish } from './speech'
import { playFoley } from '../audio/foley'
import { firePlayClear, softMissLine } from '../practice/PlayClear'
import { recordSkillAttempt } from './learningMastery'

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
 * Sentence Structure — Purpose Academy Questions PPTX mold (Construction / Logistics).
 *
 * Matches Purpose Academy English • Multiple Choice:
 * - Object illustration beside the cloze sentence (PPTX tile or Visual Vocabulary photo)
 * - White worksheet card + four word choices
 * - One attempt per item (no answer shopping)
 * - Correct word slides into the blank
 * - Wrong → show the answer, then move on
 * - Level-1 = first PPTX page (items 1–10) with ≥8 first-try correct (+ repair for misses)
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
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(false)
  const [filled, setFilled] = useState(false)
  const [flying, setFlying] = useState(false)
  const [scoreCorrect, setScoreCorrect] = useState(0)
  const [missed, setMissed] = useState<SentenceClozeItem[]>([])
  const [repairDeck, setRepairDeck] = useState<SentenceClozeItem[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [level1Unlocked, setLevel1Unlocked] = useState(false)
  const practice = isPracticeMode()

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
    setPicked(null)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
  }, [item?.id, phase, page])

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

  function advanceAfterResolve(wasCorrect: boolean, newScore: number, nextMissed: SentenceClozeItem[]) {
    window.setTimeout(() => {
      if (!isLast) {
        setIdx((i) => i + 1)
        setPicked(null)
        setCorrect(false)
        setFilled(false)
        setFlying(false)
        return
      }

      if (phase === 'repair') {
        if (nextMissed.length) {
          setRepairDeck(shuffle(nextMissed))
          setMissed([])
          setIdx(0)
          setPicked(null)
          setCorrect(false)
          setFilled(false)
          setFlying(false)
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
        setPicked(null)
        setCorrect(false)
        setFilled(false)
        setFlying(false)
        playFoley('whoosh')
        return
      }
      finishPagePass(newScore)
    }, wasCorrect ? 900 : 1200)
  }

  function pick(opt: string) {
    if (!item || picked) return
    const ok = opt === item.answer
    setPicked(opt)
    setCorrect(ok)
    setFlying(true)
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

  function retryPage() {
    setIdx(0)
    setPicked(null)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setScoreCorrect(0)
    setMissed([])
    setRepairDeck([])
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
    setPicked(null)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setScoreCorrect(0)
    setMissed([])
    setRepairDeck([])
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
          Misses move on — one try each, then we show the word. Read each sentence and try the page again. No rush.
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

  const showWord = Boolean(filled || (picked && correct))
  const displayWord = showWord ? item.answer : null
  const before = item.prompt.split('______')[0] ?? ''
  const after = item.prompt.split('______')[1] ?? ''
  const imageSrc = resolveClozeImage(item)
  const choiceLetters = ['A', 'B', 'C', 'D'] as const

  return (
    <article className="sentence-cloze-card">
      <div className="sentence-cloze-head-row">
        <div>
          <p className="section-kicker">Sentence Structure</p>
          <p className="sentence-cloze-doc-kicker">{englishBrand} · Pick the word</p>
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
          ? `Repair · ${deck.length - idx} left`
          : `Clear this page · ${deck.length - idx} left`}
      </p>
      <p className="train-vocab-counter">
        {phase === 'repair' ? 'Repair round · ' : ''}
        All {bank.length} {documentLabel} · Item {idx + 1} of {deck.length}
        {phase === 'drill' ? ` · ${scoreCorrect} clear so far` : ''}
        {level1Unlocked ? ' · First page done' : ''}
      </p>
      <WorksheetPageJump id="sentence-page-jump-drill" />
      <p className="lede sentence-cloze-help">
        Pick the word that fits the blank. One try each — if it is not yet, we show the answer and keep going.
      </p>

      <div
        className={`sentence-cloze-item${showWord ? ' is-filled' : ''}${correct && showWord ? ' is-correct' : ''}${
          picked && !correct && filled ? ' is-wrong' : ''
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
            picked && !correct && filled ? ' is-wrong' : ''
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

      <div className="train-choice-grid sentence-cloze-choices" role="group" aria-label="Answer choices">
        {options.map((opt, i) => {
          const isPick = picked === opt
          const showAnswer = !!picked && opt === item.answer
          const state = isPick ? (correct ? 'correct' : 'wrong') : showAnswer ? 'correct' : 'idle'
          const letter = choiceLetters[i] ?? String(i + 1)
          return (
            <button
              key={opt}
              type="button"
              className={`sentence-cloze-chip state-${state}${isPick && flying ? ' is-flying' : ''}${
                picked && !isPick && !showAnswer ? ' is-dim' : ''
              }`}
              disabled={!!picked}
              onClick={() => pick(opt)}
            >
              <span className="sentence-cloze-chip-letter">{letter}.</span>{' '}
              <span>{opt}</span>
            </button>
          )
        })}
      </div>

      {picked &&
        (correct ? (
          <div className="alert ok">Yes — the word completes the sentence.</div>
        ) : (
          <p className="play-soft-miss" role="status">
            {softMissLine(`The sentence needs “${item.answer}.” Keep going.`)}
          </p>
        ))}
    </article>
  )
}
