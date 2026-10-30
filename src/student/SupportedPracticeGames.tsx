import { useEffect, useMemo, useState } from 'react'
import { pathwayImage } from '../pathways'
import type { SentenceClozeItem } from '../pathways/packs/constructionSentenceCloze560'
import { playFoley } from '../audio/foley'
import { firePlayClear, softMissLine, SOFT_RETRY_LABEL } from '../practice/PlayClear'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'
import { recordSkillAttempt } from './learningMastery'
import { speakEnglish, stopSpeech } from './speech'
import type { VocabTerm } from './journeyCurriculum'
import { matchPracticeDeck, shuffleChoices } from './vocabDistractors'

/** Worksheet tile from public/sentence-cloze/ when extracted from the PPTX. */
function sentenceImageUrl(file?: string) {
  if (!file) return undefined
  const base = import.meta.env.BASE_URL || '/'
  return `${base}sentence-cloze/${file}`
}

function resolveClozeImage(item: SentenceClozeItem) {
  return sentenceImageUrl(item.imageFile) || pathwayImage(item.imageKey)
}

function fillBlank(prompt: string, word: string) {
  return prompt.replace('______', word)
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/** Split a filled sentence into tap-order chips. */
function sentenceTokens(filled: string): string[] {
  return filled
    .trim()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
}

export type SupportedGameKind = 'memory' | 'order' | 'listen' | 'fill'

const GAME_META: Record<
  SupportedGameKind,
  { title: string; help: string; nearby: (left: number) => string }
> = {
  memory: {
    title: 'Memory match',
    help: 'Flip two cards. Find the picture and its English word.',
    nearby: (left) =>
      left <= 0 ? 'Board clear — every pair found' : `Clear this board · ${left} pair${left === 1 ? '' : 's'} left`,
  },
  order: {
    title: 'Order the words',
    help: 'Tap the words in order. Build the sentence.',
    nearby: (left) =>
      left <= 0 ? 'Sentence clear' : `Clear this sentence · ${left} word${left === 1 ? '' : 's'} left`,
  },
  listen: {
    title: 'Listen and choose',
    help: 'Hear the sentence. Tap the missing word.',
    nearby: () => 'Hear English · then tap the missing word',
  },
  fill: {
    title: 'Fill the blank',
    help: 'Look at the picture. Tap the word that fits. Soft race — no rush.',
    nearby: (left) => (left <= 0 ? 'Blanks clear' : `Clear these blanks · ${left} left · soft race`),
  },
}

type MemoryCard =
  | { id: string; kind: 'pic'; termId: string; imageKey: string; english: string }
  | { id: string; kind: 'word'; termId: string; english: string }

type Props = {
  vocab: readonly VocabTerm[]
  knownIds: readonly string[]
  cloze: readonly SentenceClozeItem[]
  onComplete: () => void
}

/**
 * Supported Practice — familiar sentence games after Sentence Structure / Word → Action.
 * Level-4 English: one short help line, soft miss, finite boards. Dual-shell chrome.
 * Authority: presentation clears only; skill attempts still write as `matching`.
 */
export function SupportedPracticeGames({ vocab, knownIds, cloze, onComplete }: Props) {
  const memoryTerms = useMemo(() => {
    const deck = matchPracticeDeck(vocab, knownIds, 4)
    if (deck.length >= 2) return deck.slice(0, 4)
    return shuffle([...vocab]).slice(0, Math.min(4, vocab.length))
  }, [vocab, knownIds])

  const clozeDeck = useMemo(() => (cloze.length ? cloze.slice(0, 8) : []), [cloze])

  const boards = useMemo(() => {
    const list: SupportedGameKind[] = []
    if (memoryTerms.length >= 2) list.push('memory')
    if (clozeDeck[0]) list.push('order')
    if (clozeDeck[1] || clozeDeck[0]) list.push('listen')
    if (clozeDeck.length >= 3) list.push('fill')
    if (!list.length && memoryTerms.length) list.push('memory')
    return list
  }, [memoryTerms.length, clozeDeck])

  const [boardIdx, setBoardIdx] = useState(0)
  const [boardClear, setBoardClear] = useState(false)
  const kind = boards[Math.min(boardIdx, Math.max(0, boards.length - 1))] || 'memory'
  const lastBoard = boardIdx >= boards.length - 1
  const coachFirst = boardIdx === 0 && !boardClear

  const orderItem = clozeDeck[0]
  const listenItem = clozeDeck[1] || clozeDeck[0]
  const fillItems = useMemo(() => clozeDeck.slice(2, 5), [clozeDeck])
  const fillFirstId = fillItems[0]?.id

  /* Memory */
  const [memoryDeal, setMemoryDeal] = useState(0)
  const memoryCards = useMemo(() => {
    const pics: MemoryCard[] = memoryTerms.map((t) => ({
      id: `pic-${t.id}`,
      kind: 'pic',
      termId: t.id,
      imageKey: t.imageKey,
      english: t.english,
    }))
    const words: MemoryCard[] = memoryTerms.map((t) => ({
      id: `word-${t.id}`,
      kind: 'word',
      termId: t.id,
      english: t.english,
    }))
    return shuffle([...pics, ...words])
    // memoryDeal forces reshuffle when the board resets
  }, [memoryTerms, memoryDeal])

  const [flipped, setFlipped] = useState<string[]>([])
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [lockFlip, setLockFlip] = useState(false)
  const [memoryMiss, setMemoryMiss] = useState(false)

  /* Order */
  const [orderBank, setOrderBank] = useState<string[]>([])
  const [orderBuilt, setOrderBuilt] = useState<string[]>([])
  const [orderMiss, setOrderMiss] = useState(false)
  const orderTarget = useMemo(
    () => (orderItem ? sentenceTokens(fillBlank(orderItem.prompt, orderItem.answer)) : []),
    [orderItem],
  )

  /* Listen */
  const [listenHeard, setListenHeard] = useState(false)
  const [listenPick, setListenPick] = useState<string | null>(null)
  const [listenOk, setListenOk] = useState(false)
  const [listenOptions, setListenOptions] = useState<string[]>([])

  /* Fill soft-race */
  const [fillIdx, setFillIdx] = useState(0)
  const [fillPick, setFillPick] = useState<string | null>(null)
  const [fillOk, setFillOk] = useState(false)
  const [fillCleared, setFillCleared] = useState(0)
  const [fillMiss, setFillMiss] = useState(false)
  const [fillOptions, setFillOptions] = useState<string[]>([])
  const [racePulse, setRacePulse] = useState(0)
  const fillItem = fillItems[Math.min(fillIdx, Math.max(0, fillItems.length - 1))]

  useEffect(() => {
    stopSpeech()
    setBoardClear(false)
    setFlipped([])
    setMatchedIds([])
    setLockFlip(false)
    setMemoryMiss(false)
    setMemoryDeal((n) => n + 1)

    if (orderItem) {
      setOrderBank(shuffle(sentenceTokens(fillBlank(orderItem.prompt, orderItem.answer))))
      setOrderBuilt([])
      setOrderMiss(false)
    }
    if (listenItem) {
      setListenHeard(false)
      setListenPick(null)
      setListenOk(false)
      setListenOptions(shuffleChoices([...listenItem.options]))
    }
    setFillIdx(0)
    setFillPick(null)
    setFillOk(false)
    setFillCleared(0)
    setFillMiss(false)
    setRacePulse(0)
    const firstFill = fillItems[0]
    setFillOptions(firstFill ? shuffleChoices([...firstFill.options]) : [])
  }, [boardIdx, kind, orderItem?.id, listenItem?.id, fillFirstId])

  /* Soft race meter — encouragement only; never locks the board. */
  useEffect(() => {
    if (kind !== 'fill' || boardClear || fillOk) return
    const t = window.setInterval(() => {
      setRacePulse((n) => (n >= 100 ? 100 : n + 1.2))
    }, 200)
    return () => window.clearInterval(t)
  }, [kind, boardClear, fillOk, fillIdx])

  const pairsLeft = Math.max(0, memoryTerms.length - matchedIds.length)
  const orderLeft = Math.max(0, orderTarget.length - orderBuilt.length)
  const fillLeft = Math.max(0, fillItems.length - fillCleared)

  const nearby =
    kind === 'memory'
      ? GAME_META.memory.nearby(pairsLeft)
      : kind === 'order'
        ? GAME_META.order.nearby(orderLeft)
        : kind === 'listen'
          ? GAME_META.listen.nearby(0)
          : GAME_META.fill.nearby(fillLeft)

  function finishBoard(label: string) {
    setBoardClear(true)
    firePlayClear({
      label,
      remnant: lastBoard ? 'Station clear — continue when ready' : 'Board clear — next game next',
      kind: 'board',
    })
  }

  function nextBoard() {
    if (!boardClear) return
    if (lastBoard) {
      onComplete()
      return
    }
    setBoardIdx((i) => i + 1)
    playFoley('whoosh')
  }

  function flipCard(card: MemoryCard) {
    if (lockFlip || boardClear || matchedIds.includes(card.termId)) return
    if (flipped.includes(card.id)) return
    if (coachFirst) advanceStationCoach('supported-practice')
    const next = [...flipped, card.id]
    setFlipped(next)
    setMemoryMiss(false)
    playFoley('whoosh')
    if (next.length < 2) return
    setLockFlip(true)
    const [aId, bId] = next
    const a = memoryCards.find((c) => c.id === aId)
    const b = memoryCards.find((c) => c.id === bId)
    const ok = Boolean(a && b && a.termId === b.termId && a.kind !== b.kind)
    window.setTimeout(() => {
      if (ok && a) {
        const nextMatched = [...matchedIds, a.termId]
        setMatchedIds(nextMatched)
        setFlipped([])
        setLockFlip(false)
        recordSkillAttempt('matching', true, 8)
        const left = memoryTerms.length - nextMatched.length
        if (left <= 0) finishBoard('Match board clear')
        else {
          firePlayClear({
            label: 'Pair clear',
            remnant: left === 1 ? '1 pair left' : `${left} pairs left`,
            kind: 'micro',
          })
        }
      } else {
        playFoley('wrong')
        recordSkillAttempt('matching', false)
        setMemoryMiss(true)
        setFlipped([])
        setLockFlip(false)
      }
    }, 520)
  }

  function tapOrderWord(word: string, bankIndex: number) {
    if (boardClear || !orderItem) return
    if (coachFirst) advanceStationCoach('supported-practice')
    const expect = orderTarget[orderBuilt.length]
    if (word !== expect) {
      playFoley('wrong')
      recordSkillAttempt('matching', false)
      setOrderMiss(true)
      return
    }
    setOrderMiss(false)
    const nextBuilt = [...orderBuilt, word]
    setOrderBuilt(nextBuilt)
    setOrderBank((bank) => bank.filter((_, i) => i !== bankIndex))
    recordSkillAttempt('matching', true, 6)
    if (nextBuilt.length >= orderTarget.length) {
      void speakEnglish(fillBlank(orderItem.prompt, orderItem.answer))
      finishBoard('Sentence clear')
    } else {
      firePlayClear({
        label: 'Word clear',
        remnant: `${orderTarget.length - nextBuilt.length} left`,
        kind: 'micro',
      })
    }
  }

  function resetOrder() {
    if (!orderItem || boardClear) return
    setOrderBank(shuffle(sentenceTokens(fillBlank(orderItem.prompt, orderItem.answer))))
    setOrderBuilt([])
    setOrderMiss(false)
    playFoley('whoosh')
  }

  async function hearListen() {
    if (!listenItem) return
    if (coachFirst) advanceStationCoach('supported-practice')
    await speakEnglish(fillBlank(listenItem.prompt, listenItem.answer))
    setListenHeard(true)
  }

  function pickListen(opt: string) {
    if (!listenItem || !listenHeard || listenPick || boardClear) return
    if (coachFirst) advanceStationCoach('supported-practice')
    const ok = opt === listenItem.answer
    setListenPick(opt)
    setListenOk(ok)
    recordSkillAttempt('matching', ok, ok ? 10 : 0)
    if (ok) finishBoard('Listen clear')
    else playFoley('wrong')
  }

  function retryListen() {
    setListenPick(null)
    setListenOk(false)
    setListenOptions(shuffleChoices(listenItem ? [...listenItem.options] : []))
    playFoley('whoosh')
  }

  function pickFill(opt: string) {
    if (!fillItem || fillPick || boardClear) return
    if (coachFirst) advanceStationCoach('supported-practice')
    const ok = opt === fillItem.answer
    setFillPick(opt)
    setFillOk(ok)
    setFillMiss(!ok)
    recordSkillAttempt('matching', ok, ok ? 10 : 0)
    if (ok) {
      const nextCleared = fillCleared + 1
      setFillCleared(nextCleared)
      setRacePulse(0)
      void speakEnglish(fillBlank(fillItem.prompt, fillItem.answer))
      if (nextCleared >= fillItems.length) {
        finishBoard('Fill board clear')
      } else {
        firePlayClear({
          label: 'Blank clear',
          remnant: `${fillItems.length - nextCleared} left · soft race`,
          kind: 'micro',
        })
        window.setTimeout(() => {
          const nextIdx = fillIdx + 1
          const nextItem = fillItems[nextIdx]
          setFillIdx(nextIdx)
          setFillPick(null)
          setFillOk(false)
          setFillMiss(false)
          setFillOptions(nextItem ? shuffleChoices([...nextItem.options]) : [])
        }, 700)
      }
    } else {
      playFoley('wrong')
    }
  }

  function retryFill() {
    setFillPick(null)
    setFillOk(false)
    setFillMiss(false)
    if (fillItem) setFillOptions(shuffleChoices([...fillItem.options]))
    playFoley('whoosh')
  }

  if (!boards.length) {
    return <div className="alert warn">Supported Practice needs pictured words or sentences.</div>
  }

  return (
    <article className={`supported-games is-${kind}${boardClear ? ' is-board-clear' : ''}`}>
      <header className="supported-games-head">
        <p className="section-kicker">
          Supported Practice · Game {boardIdx + 1} of {boards.length}
        </p>
        <ol className="supported-games-beads" aria-label="Games in this station">
          {boards.map((b, i) => (
            <li
              key={`${b}-${i}`}
              className={`supported-games-bead${i < boardIdx || (i === boardIdx && boardClear) ? ' is-done' : ''}${
                i === boardIdx ? ' is-now' : ''
              }`}
              title={GAME_META[b].title}
            >
              <span className="sr-only">
                {GAME_META[b].title}
                {i < boardIdx || (i === boardIdx && boardClear) ? ' · clear' : i === boardIdx ? ' · now' : ''}
              </span>
            </li>
          ))}
        </ol>
        <h2 className="supported-games-title">{GAME_META[kind].title}</h2>
        <p className="play-nearby-objective" aria-live="polite">
          {boardClear ? (lastBoard ? 'Station clear — continue when ready' : 'Board clear — next game next') : nearby}
        </p>
        <p className="supported-games-help">{GAME_META[kind].help}</p>
      </header>

      {kind === 'memory' ? (
        <section className="supported-memory" aria-label="Memory match board" data-coach="sp-play">
          {memoryMiss ? (
            <p className="play-soft-miss" role="status">
              {softMissLine('Not a match — flip again.')}
            </p>
          ) : null}
          <div className="supported-memory-grid">
            {memoryCards.map((card) => {
              const open = flipped.includes(card.id) || matchedIds.includes(card.termId)
              const done = matchedIds.includes(card.termId)
              const img = card.kind === 'pic' ? pathwayImage(card.imageKey) : undefined
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`supported-memory-card${open ? ' is-open' : ''}${done ? ' is-matched' : ''}`}
                  disabled={done || lockFlip || boardClear}
                  onClick={() => flipCard(card)}
                  aria-label={
                    card.kind === 'pic'
                      ? open
                        ? `Picture for ${card.english}`
                        : 'Hidden picture'
                      : open
                        ? card.english
                        : 'Hidden word'
                  }
                >
                  <span className="supported-memory-face is-back" aria-hidden>
                    ?
                  </span>
                  <span className="supported-memory-face is-front">
                    {card.kind === 'pic' ? (
                      img ? (
                        <img src={img} alt="" />
                      ) : (
                        <span>{card.english}</span>
                      )
                    ) : (
                      <span className="supported-memory-word">{card.english}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {kind === 'order' && orderItem ? (
        <section className="supported-order" aria-label="Order the words" data-coach="sp-play">
          <figure className="supported-game-photo">
            {resolveClozeImage(orderItem) ? (
              <img src={resolveClozeImage(orderItem)} alt="" />
            ) : (
              <span className="supported-game-fallback">{orderItem.answer}</span>
            )}
          </figure>
          <p className="supported-order-built" aria-live="polite">
            {orderBuilt.length ? (
              orderBuilt.join(' ')
            ) : (
              <span className="supported-order-placeholder">Tap words below…</span>
            )}
          </p>
          {orderMiss ? (
            <p className="play-soft-miss" role="status">
              {softMissLine('Wrong word — try the next one in order.')}
            </p>
          ) : null}
          <div className="supported-order-bank">
            {orderBank.map((word, i) => (
              <button
                key={`${word}-${i}`}
                type="button"
                className="supported-order-chip"
                disabled={boardClear}
                onClick={() => tapOrderWord(word, i)}
              >
                {word}
              </button>
            ))}
          </div>
          {!boardClear && orderBuilt.length > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={resetOrder}>
              Start sentence again
            </button>
          ) : null}
        </section>
      ) : null}

      {kind === 'listen' && listenItem ? (
        <section className="supported-listen" aria-label="Listen and choose" data-coach="sp-play">
          <figure className="supported-game-photo">
            {resolveClozeImage(listenItem) ? (
              <img src={resolveClozeImage(listenItem)} alt="" />
            ) : (
              <span className="supported-game-fallback">{listenItem.answer}</span>
            )}
          </figure>
          <div className="train-audio-row">
            <button type="button" className="btn btn-primary" onClick={() => void hearListen()} disabled={boardClear}>
              {listenHeard ? 'Hear again' : 'Hear English'}
            </button>
          </div>
          {!listenHeard ? (
            <p className="muted">Hear the sentence once. Then tap the missing word.</p>
          ) : (
            <>
              <p className="supported-listen-prompt">
                <span className="sentence-cloze-num">{listenItem.n}.</span>{' '}
                {listenItem.prompt.split('______')[0]}
                <span className="sentence-cloze-blank">
                  <span className="sentence-cloze-slot">______</span>
                </span>
                {listenItem.prompt.split('______')[1]}
              </p>
              <div className="train-choice-grid">
                {listenOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`train-choice${
                      listenPick === opt ? (listenOk ? ' is-correct' : ' is-wrong') : ''
                    }${listenPick && opt === listenItem.answer && !listenOk ? ' is-correct' : ''}`}
                    disabled={!!listenPick || boardClear}
                    onClick={() => pickListen(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {listenPick && !listenOk ? (
                <>
                  <p className="play-soft-miss" role="status">
                    {softMissLine(`The word is ${listenItem.answer}.`)}
                  </p>
                  <button type="button" className="btn btn-primary" onClick={retryListen}>
                    {SOFT_RETRY_LABEL}
                  </button>
                </>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      {kind === 'fill' && fillItem ? (
        <section className="supported-fill" aria-label="Fill the blank soft race" data-coach="sp-play">
          <div
            className="supported-race-meter"
            role="status"
            aria-label={
              racePulse >= 100
                ? 'Soft race tip — take your time, no rush'
                : `Soft race progress ${Math.round(racePulse)} percent`
            }
          >
            <span className="supported-race-bar" style={{ width: `${Math.min(100, racePulse)}%` }} />
            <span className="supported-race-label">
              {racePulse >= 100 ? 'Take your time — no rush' : 'Soft race · tap when ready'}
            </span>
          </div>
          <p className="train-vocab-counter">
            Blank {Math.min(fillIdx + 1, fillItems.length)} of {fillItems.length}
            {fillCleared ? ` · ${fillCleared} clear` : ''}
          </p>
          <figure className="supported-game-photo">
            {resolveClozeImage(fillItem) ? (
              <img src={resolveClozeImage(fillItem)} alt="" />
            ) : (
              <span className="supported-game-fallback">{fillItem.answer}</span>
            )}
          </figure>
          <p className="supported-listen-prompt">
            <span className="sentence-cloze-num">{fillItem.n}.</span>{' '}
            {fillItem.prompt.split('______')[0]}
            <span className={`sentence-cloze-blank${fillOk ? ' has-word' : ''}`}>
              {fillOk ? (
                <span className="sentence-cloze-word is-set">{fillItem.answer}</span>
              ) : (
                <span className="sentence-cloze-slot">______</span>
              )}
            </span>
            {fillItem.prompt.split('______')[1]}
          </p>
          {fillMiss ? (
            <p className="play-soft-miss" role="status">
              {softMissLine(`Try again. The word is ${fillItem.answer}.`)}
            </p>
          ) : null}
          <div className="train-choice-grid">
            {fillOptions.map((opt) => (
              <button
                key={`${fillItem.id}-${opt}`}
                type="button"
                className={`train-choice${
                  fillPick === opt ? (fillOk ? ' is-correct' : ' is-wrong') : ''
                }${fillPick && opt === fillItem.answer && !fillOk ? ' is-correct' : ''}`}
                disabled={!!fillPick || boardClear}
                onClick={() => pickFill(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {fillPick && !fillOk ? (
            <button type="button" className="btn btn-primary" onClick={retryFill}>
              {SOFT_RETRY_LABEL}
            </button>
          ) : null}
        </section>
      ) : null}

      {boardClear ? (
        <div className="supported-games-advance">
          <div className="alert ok">
            {lastBoard
              ? 'Station clear. Help is strength — next door can open.'
              : `${GAME_META[kind].title} clear. Next game ready.`}
          </div>
          <button type="button" className="btn btn-primary" onClick={nextBoard}>
            {lastBoard ? 'Continue to workplace instructions' : 'Next game'}
          </button>
        </div>
      ) : null}

      {coachFirst ? (
        <StationCoach stationId="supported-practice" layoutKey={`${kind}-${boardIdx}-${flipped.join('-')}`} />
      ) : null}
    </article>
  )
}
