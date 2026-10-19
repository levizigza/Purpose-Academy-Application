import { useEffect, useMemo, useState } from 'react'
import type { SentenceClozeItem } from '../pathways/packs/constructionSentenceCloze560'
import { isPracticeMode } from '../practice/PracticeMode'
import { speakEnglish } from './speech'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import {
  SentenceSiteStage,
  consequenceFor,
  type Consequence,
  type StageMood,
} from './SentenceSiteStage'

/** Worksheet-sized pages — same bank size as visual vocabulary PDFs. */
export const SENTENCE_PAGE_SIZE = 20

/** Pass a page with honest effort — not by tapping every choice. */
const PASS_SCORE = 16

/** Hold the stage so SITEWISE-style consequence motion can land. */
const ADVANCE_OK_MS = 1100
/** Fail: bounce + consequence, then teach-lock correct word, then advance. */
const FAIL_CONSEQUENCE_MS = 1200
const FAIL_TEACH_MS = 1100
const ADVANCE_FAIL_MS = FAIL_CONSEQUENCE_MS + FAIL_TEACH_MS

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
 * When `picturedOnly`, orphan cloze rows (no VV picture) stay out of the drill bank.
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
  if (picturedOnly && hit.length >= SENTENCE_PAGE_SIZE) return hit
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
  /** First honest page pass — unlocks Word → Action (more pages stay open). */
  onLevel1Passed: () => void
  onContinueToActions: () => void
  continueLabel?: string
  /** Practice quality-review: leave Sentence Structure without finishing the page. */
  onSkipToActions?: () => void
}

/**
 * Construction Sentence Structure — visual site stage (not VocabSheet).
 *
 * Different from vocabulary:
 * - Sentence lives on a SITEWISE-style job board + crew stage
 * - Correct word locks into the board with motion
 * - Wrong word bounces off (never written into the sentence); absurd consequence; then teach the right word
 * - One attempt per item (no answer shopping)
 */
export function SentenceClozeDrill({
  items,
  picturedAnswers,
  picturedOnlyBank,
  onLevel1Passed,
  onContinueToActions,
  continueLabel = 'Continue to Word → Action',
  onSkipToActions,
}: Props) {
  const bank = useMemo(
    () => orderForLadder(items, picturedAnswers, picturedOnlyBank),
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
  const [mood, setMood] = useState<StageMood>('idle')
  const [consequence, setConsequence] = useState<Consequence | null>(null)
  /** After a miss: correct word locked for the teach beat (board never shows the wrong word). */
  const [teachWord, setTeachWord] = useState<string | null>(null)
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
    setOptions(shuffle([...item.options]))
    setPicked(null)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setMood('idle')
    setConsequence(null)
    setTeachWord(null)
  }, [item?.id, phase, page])

  function finishPagePass(finalScore: number) {
    setPhase('passed')
    playFoley('correct')
    if (!level1Unlocked) {
      setLevel1Unlocked(true)
      onLevel1Passed()
    }
    void finalScore
  }

  function advanceAfterResolve(wasCorrect: boolean, newScore: number, nextMissed: SentenceClozeItem[]) {
    window.setTimeout(
      () => {
        if (!isLast) {
          setIdx((i) => i + 1)
          setPicked(null)
          setCorrect(false)
          setFilled(false)
          setFlying(false)
          setMood('idle')
          setConsequence(null)
          setTeachWord(null)
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
            setMood('idle')
            setConsequence(null)
            setTeachWord(null)
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
          setMood('idle')
          setConsequence(null)
          setTeachWord(null)
          playFoley('whoosh')
          return
        }
        finishPagePass(newScore)
      },
      wasCorrect ? ADVANCE_OK_MS : ADVANCE_FAIL_MS,
    )
  }

  function pick(opt: string) {
    if (!item || picked) return
    const ok = opt === item.answer
    setPicked(opt)
    setCorrect(ok)
    setFlying(true)
    setTeachWord(null)
    recordSkillAttempt('sentence-cloze', ok, ok ? 12 : 0)
    playFoley(ok ? 'correct' : 'wrong')

    const newScore = scoreCorrect + (ok ? 1 : 0)
    const nextMissed = ok ? missed : [...missed, item]
    setScoreCorrect(newScore)
    setMissed(nextMissed)

    if (ok) {
      window.setTimeout(() => {
        setFilled(true)
        setFlying(false)
        setMood('success')
        setConsequence(null)
        void speakEnglish(fillBlank(item.prompt, item.answer))
      }, 260)
    } else {
      const c = consequenceFor(item.prompt, opt, item.answer)
      setConsequence(c)
      setMood('fail')
      setFlying(false)
      /* Consequence first — blank stays empty. Then lock the true word + speak it. */
      window.setTimeout(() => {
        setTeachWord(item.answer)
        setFilled(true)
        setMood('success')
        setConsequence(null)
        void speakEnglish(fillBlank(item.prompt, item.answer))
      }, FAIL_CONSEQUENCE_MS)
    }

    advanceAfterResolve(ok, newScore, nextMissed)
  }

  function retryPage() {
    setIdx(0)
    setPicked(null)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setMood('idle')
    setConsequence(null)
    setTeachWord(null)
    setScoreCorrect(0)
    setMissed([])
    setRepairDeck([])
    setPhase('drill')
    playFoley('whoosh')
  }

  function nextPage() {
    if (page + 1 >= pageCount) return
    setPage((p) => p + 1)
    setIdx(0)
    setPicked(null)
    setCorrect(false)
    setFilled(false)
    setFlying(false)
    setMood('idle')
    setConsequence(null)
    setTeachWord(null)
    setScoreCorrect(0)
    setMissed([])
    setRepairDeck([])
    setPhase('drill')
    playFoley('whoosh')
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
      <article className="sentence-site sentence-site-pass" aria-live="polite">
        <p className="section-kicker">Sentence Structure · Site stage</p>
        <div className="sentence-cloze-pass-badge" aria-hidden>
          ✓
        </div>
        <h2>Page passed</h2>
        <p className="lede">
          Sentences {from}–{to} complete. First-try score {scoreCorrect} of {pageItems.length}.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onContinueToActions}>
            {continueLabel}
          </button>
          {page + 1 < pageCount ? (
            <button type="button" className="btn btn-secondary on-light" onClick={nextPage}>
              Keep practising · page {page + 2} of {pageCount}
            </button>
          ) : null}
        </div>
      </article>
    )
  }

  if (phase === 'result') {
    return (
      <article className="sentence-site" aria-live="polite">
        <p className="section-kicker">Sentence Structure · Site stage</p>
        <h2>Keep learning this page</h2>
        <p className="lede">
          Score {scoreCorrect} of {pageItems.length}. You need {PASS_SCORE} correct on the first try to pass.
          One try each — wrong words bounce off the board.
        </p>
        <button type="button" className="btn btn-primary" onClick={retryPage}>
          Retry this page
        </button>
        {practice && onSkipToActions ? (
          <button type="button" className="btn btn-secondary on-light" onClick={onSkipToActions}>
            Skip to Word → Action
          </button>
        ) : null}
      </article>
    )
  }

  if (!item) {
    return <div className="alert warn">Loading sentences…</div>
  }

  const lockedWord =
    teachWord || (filled && correct ? item.answer : mood === 'success' ? item.answer : null)
  const rejectedWord = mood === 'fail' && picked && !correct && !teachWord ? picked : null
  const showingTeach = Boolean(teachWord && picked && !correct)

  return (
    <article className="sentence-site">
      <header className="sentence-site-head">
        <div className="sentence-site-head-row">
          <p className="section-kicker">Sentence Structure · Site stage</p>
          {practice && onSkipToActions ? (
            <button
              type="button"
              className="btn btn-ghost sentence-site-skip"
              onClick={onSkipToActions}
            >
              Skip to Word → Action
            </button>
          ) : null}
        </div>
        <p className="train-vocab-counter">
          {phase === 'repair' ? 'Repair · ' : ''}
          {idx + 1}/{deck.length}
          {' · '}
          Page {page + 1}/{pageCount}
          {' · '}
          Bank 1–{bank.length}
          {phase === 'drill' ? ` · ${scoreCorrect} first-try` : ''}
          {level1Unlocked ? ' · Level-1 open' : ''}
        </p>
      </header>

      <SentenceSiteStage
        mood={mood}
        consequence={consequence}
        rejectedWord={rejectedWord}
        lockedWord={lockedWord}
        prompt={item.prompt}
        flying={flying && correct}
      />

      <div className="train-choice-grid sentence-cloze-choices">
        {options.map((opt) => {
          const isPick = picked === opt
          const showAnswer = !!picked && opt === item.answer
          const state = !picked ? 'idle' : showAnswer ? 'correct' : isPick ? 'wrong' : 'idle'
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
              {opt}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className={`sentence-site-feedback ${correct ? 'is-ok' : 'is-bad'}`} role="status">
          {correct
            ? 'Yes — the word locks on the job board.'
            : showingTeach
              ? `Not “${picked}.” The sentence needs “${item.answer}.”`
              : `Not “${picked}.” Watch what guessing cost the crew.`}
        </div>
      )}
    </article>
  )
}
