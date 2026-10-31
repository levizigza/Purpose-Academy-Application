import { useEffect, useMemo, useState } from 'react'
import { pathwayImage } from '../pathways'
import type { SentenceClozeItem } from '../pathways/packs/constructionSentenceCloze560'
import { playFoley } from '../audio/foley'
import { firePlayClear, softMissLine, SOFT_RETRY_LABEL } from '../practice/PlayClear'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'
import { recordSkillAttempt } from './learningMastery'
import { speakEnglish, stopSpeech } from './speech'

/** Worksheet tile from public/sentence-cloze/ when extracted from the PPTX. */
function sentenceImageUrl(file?: string) {
  if (!file) return undefined
  const base = import.meta.env.BASE_URL || '/'
  return `${base}sentence-cloze/${file}`
}

function resolveClozeImage(item: SentenceClozeItem) {
  return sentenceImageUrl(item.imageFile) || pathwayImage(item.imageKey)
}

function filledSentence(item: SentenceClozeItem) {
  return item.prompt.replace('______', item.answer)
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/** Prefer a different order than the last deal (soft miss anti-cheat). */
function reshuffleChoices<T>(items: T[], previous: T[], keyOf: (t: T) => string): T[] {
  if (items.length < 2) return [...items]
  let next = shuffle(items)
  const prevKey = previous.map(keyOf).join('|')
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (next.map(keyOf).join('|') !== prevKey) return next
    next = shuffle(items)
  }
  return next
}

export type SupportedGameKind = 'picture' | 'sentence'

const ROUNDS_PER_BOARD = 3

const GAME_META: Record<
  SupportedGameKind,
  { title: string; help: string; nearby: (left: number) => string }
> = {
  picture: {
    title: 'Which picture?',
    help: 'Hear the sentence. Tap the picture.',
    nearby: (left) =>
      left <= 0 ? 'Pictures clear' : `Clear this board · ${left} picture${left === 1 ? '' : 's'} left`,
  },
  sentence: {
    title: 'Which sentence?',
    help: 'Look at the picture. Tap the sentence.',
    nearby: (left) =>
      left <= 0 ? 'Sentences clear' : `Clear this board · ${left} sentence${left === 1 ? '' : 's'} left`,
  },
}

type PictureChoice = { id: string; imageUrl: string; label: string }
type SentenceChoice = { id: string; text: string }

type Props = {
  cloze: readonly SentenceClozeItem[]
  onComplete: () => void
}

/**
 * Supported Practice — two familiar sentence↔picture games.
 * Which picture? (sentence → 4 photos) · Which sentence? (photo → 4 sentences).
 * Level-4 English · soft miss + reshuffle · finite boards · dual-shell chrome.
 * Authority: presentation clears only; skill attempts still write as `matching`.
 */
export function SupportedPracticeGames({ cloze, onComplete }: Props) {
  const pictured = useMemo(() => {
    const withImg = cloze.filter((item) => Boolean(resolveClozeImage(item)))
    return withImg.length >= 4 ? withImg : [...cloze]
  }, [cloze])

  const boards = useMemo(() => {
    const list: SupportedGameKind[] = []
    if (pictured.length >= 4) {
      list.push('picture', 'sentence')
    }
    return list
  }, [pictured.length])

  const [boardIdx, setBoardIdx] = useState(0)
  const [boardClear, setBoardClear] = useState(false)
  const kind = boards[Math.min(boardIdx, Math.max(0, boards.length - 1))] || 'picture'
  const lastBoard = boardIdx >= boards.length - 1

  const [roundIdx, setRoundIdx] = useState(0)
  const [cleared, setCleared] = useState(0)
  const [target, setTarget] = useState<SentenceClozeItem | null>(null)
  const [usedIds, setUsedIds] = useState<string[]>([])
  const [pictureChoices, setPictureChoices] = useState<PictureChoice[]>([])
  const [sentenceChoices, setSentenceChoices] = useState<SentenceChoice[]>([])
  const [pickId, setPickId] = useState<string | null>(null)
  const [pickOk, setPickOk] = useState(false)
  const [miss, setMiss] = useState(false)
  const [deal, setDeal] = useState(0)

  const left = Math.max(0, ROUNDS_PER_BOARD - cleared)
  const nearby = boardClear
    ? lastBoard
      ? 'Station clear — continue when ready'
      : 'Board clear — next game next'
    : GAME_META[kind].nearby(left)

  function dealRound(nextUsed: string[], previousPics: PictureChoice[], previousSents: SentenceChoice[]) {
    const pool = pictured.filter((item) => !nextUsed.includes(item.id))
    const fallback = pictured.length ? pictured : [...cloze]
    const source = pool.length ? pool : fallback
    const pick = source[Math.floor(Math.random() * source.length)] || fallback[0]
    if (!pick) {
      setTarget(null)
      setPictureChoices([])
      setSentenceChoices([])
      return
    }

    const distractorPool = pictured.filter((item) => item.id !== pick.id)
    const distractors = shuffle(distractorPool).slice(0, 3)
    const four = shuffle([pick, ...distractors])

    const pics: PictureChoice[] = four.map((item) => ({
      id: item.id,
      imageUrl: resolveClozeImage(item) || '',
      label: item.answer,
    }))
    const sents: SentenceChoice[] = four.map((item) => ({
      id: item.id,
      text: filledSentence(item),
    }))

    setTarget(pick)
    setPictureChoices(reshuffleChoices(pics, previousPics, (c) => c.id))
    setSentenceChoices(reshuffleChoices(sents, previousSents, (c) => c.id))
    setPickId(null)
    setPickOk(false)
    setMiss(false)
    setDeal((n) => n + 1)
  }

  useEffect(() => {
    stopSpeech()
    setBoardClear(false)
    setRoundIdx(0)
    setCleared(0)
    setUsedIds([])
    setPickId(null)
    setPickOk(false)
    setMiss(false)
    dealRound([], [], [])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when board/kind changes
  }, [boardIdx, kind, pictured])

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

  function onCorrect() {
    if (!target) return
    const nextCleared = cleared + 1
    const nextUsed = [...usedIds, target.id]
    setCleared(nextCleared)
    setUsedIds(nextUsed)
    recordSkillAttempt('matching', true, 10)
    void speakEnglish(filledSentence(target))
    if (nextCleared >= ROUNDS_PER_BOARD) {
      finishBoard(kind === 'picture' ? 'Pictures clear' : 'Sentences clear')
      return
    }
    firePlayClear({
      label: kind === 'picture' ? 'Picture clear' : 'Sentence clear',
      remnant: `${ROUNDS_PER_BOARD - nextCleared} left`,
      kind: 'micro',
    })
    window.setTimeout(() => {
      setRoundIdx((r) => r + 1)
      dealRound(nextUsed, pictureChoices, sentenceChoices)
    }, 700)
  }

  function pickPicture(choice: PictureChoice) {
    if (!target || pickId || boardClear) return
    advanceStationCoach('supported-practice')
    const ok = choice.id === target.id
    setPickId(choice.id)
    setPickOk(ok)
    setMiss(!ok)
    if (ok) onCorrect()
    else {
      playFoley('wrong')
      recordSkillAttempt('matching', false)
    }
  }

  function pickSentence(choice: SentenceChoice) {
    if (!target || pickId || boardClear) return
    advanceStationCoach('supported-practice')
    const ok = choice.id === target.id
    setPickId(choice.id)
    setPickOk(ok)
    setMiss(!ok)
    if (ok) onCorrect()
    else {
      playFoley('wrong')
      recordSkillAttempt('matching', false)
    }
  }

  function retryMiss() {
    if (!target || boardClear) return
    setPickId(null)
    setPickOk(false)
    setMiss(false)
    if (kind === 'picture') {
      setPictureChoices(reshuffleChoices(pictureChoices, pictureChoices, (c) => c.id))
    } else {
      setSentenceChoices(reshuffleChoices(sentenceChoices, sentenceChoices, (c) => c.id))
    }
    setDeal((n) => n + 1)
    playFoley('whoosh')
  }

  async function hearSentence() {
    if (!target) return
    advanceStationCoach('supported-practice')
    await speakEnglish(filledSentence(target))
  }

  if (!boards.length || !target) {
    return <div className="alert warn">Supported Practice needs pictured sentences.</div>
  }

  const sentenceText = filledSentence(target)
  const targetImage = resolveClozeImage(target)

  return (
    <article className={`supported-games is-${kind}${boardClear ? ' is-board-clear' : ''}`}>
      <header className="supported-games-head">
        <div className="supported-games-title-row">
          <h2 className="supported-games-title">{GAME_META[kind].title}</h2>
          <ol className="supported-games-beads" aria-label={`Game ${boardIdx + 1} of ${boards.length}`}>
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
        </div>
        <p className="play-nearby-objective" aria-live="polite">
          {nearby}
        </p>
        <p className="supported-games-help">{GAME_META[kind].help}</p>
      </header>

      {kind === 'picture' ? (
        <section className="supported-picture" aria-label="Which picture" data-coach="sp-picture">
          <div className="supported-prompt-row">
            <p className="supported-prompt-sentence" lang="en">
              {sentenceText}
            </p>
            <button
              type="button"
              className="btn btn-primary supported-hear-btn"
              onClick={() => void hearSentence()}
              disabled={boardClear}
            >
              Hear the sentence
            </button>
          </div>
          {miss ? (
            <p className="play-soft-miss" role="status">
              {softMissLine('Wrong picture — try again.')}
            </p>
          ) : null}
          <div className="supported-pic-grid" key={`pics-${deal}`}>
            {pictureChoices.map((choice) => {
              const selected = pickId === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`supported-pic-btn${selected ? (pickOk ? ' is-correct' : ' is-wrong') : ''}${
                    pickId && choice.id === target.id && !pickOk ? ' is-correct' : ''
                  }`}
                  data-correct={choice.id === target.id ? '1' : undefined}
                  disabled={!!pickId || boardClear}
                  onClick={() => pickPicture(choice)}
                  aria-label={`Picture · ${choice.label}`}
                >
                  {choice.imageUrl ? (
                    <img src={choice.imageUrl} alt="" />
                  ) : (
                    <span className="supported-game-fallback">{choice.label}</span>
                  )}
                </button>
              )
            })}
          </div>
          {pickId && !pickOk ? (
            <button type="button" className="btn btn-primary" onClick={retryMiss}>
              {SOFT_RETRY_LABEL}
            </button>
          ) : null}
        </section>
      ) : null}

      {kind === 'sentence' ? (
        <section className="supported-sentence" aria-label="Which sentence" data-coach="sp-sentence">
          <figure className="supported-game-photo supported-game-photo--hero">
            {targetImage ? (
              <img src={targetImage} alt="" />
            ) : (
              <span className="supported-game-fallback">{target.answer}</span>
            )}
          </figure>
          {miss ? (
            <p className="play-soft-miss" role="status">
              {softMissLine('Wrong sentence — try again.')}
            </p>
          ) : null}
          <div className="supported-sent-list" key={`sents-${deal}`} role="list">
            {sentenceChoices.map((choice) => {
              const selected = pickId === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  role="listitem"
                  className={`supported-sent-btn${selected ? (pickOk ? ' is-correct' : ' is-wrong') : ''}${
                    pickId && choice.id === target.id && !pickOk ? ' is-correct' : ''
                  }`}
                  data-correct={choice.id === target.id ? '1' : undefined}
                  disabled={!!pickId || boardClear}
                  onClick={() => pickSentence(choice)}
                >
                  {choice.text}
                </button>
              )
            })}
          </div>
          {pickId && !pickOk ? (
            <button type="button" className="btn btn-primary" onClick={retryMiss}>
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

      {!boardClear ? (
        <StationCoach stationId="supported-practice" layoutKey={`${kind}-${boardIdx}-${roundIdx}-${deal}`} />
      ) : null}
    </article>
  )
}
