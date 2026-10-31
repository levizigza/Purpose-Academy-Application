import { useEffect, useMemo, useRef, useState } from 'react'
import {
  sentenceChips,
  supportedVideoSrc,
  type SupportedPracticeItem,
} from '../pathways/packs/supportedPracticeDeck'
import { playFoley } from '../audio/foley'
import { firePlayClear, softMissLine, SOFT_RETRY_LABEL } from '../practice/PlayClear'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'
import { recordSkillAttempt } from './learningMastery'
import { speakEnglish, stopSpeech } from './speech'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export type SupportedStationId = 'video-match' | 'copycat'

export const SUPPORTED_STATIONS: Record<
  SupportedStationId,
  { title: string; help: string; nearby: (left: number) => string; childhood: string }
> = {
  'video-match': {
    title: 'Video Match',
    help: 'Hear the sentence. Tap the video that matches.',
    nearby: (left) => (left <= 0 ? 'Videos clear' : `${left} left`),
    childhood: 'Like matching cards — but with short workplace videos.',
  },
  copycat: {
    title: 'Copycat',
    help: 'Watch the video. Tap the words in order — say it back.',
    nearby: (left) => (left <= 0 ? 'Copycat clear' : `${left} left`),
    childhood: 'Like childhood copycat — watch, then say it back with taps.',
  },
}

const ROUNDS = 3
const VIDEO_CHOICES = 3

type Props = {
  items: readonly SupportedPracticeItem[]
  station: SupportedStationId
  onStationChange: (next: SupportedStationId) => void
  onComplete: () => void
}

/**
 * Supported Practice — two switchable stations (Organize / Eye Spy pattern):
 * Video Match · Copycat. Royalty-free Mixkit clips · Level-4 English.
 */
export function SupportedPracticeGames({ items, station, onStationChange, onComplete }: Props) {
  const deck = useMemo(() => (items.length >= VIDEO_CHOICES ? [...items] : [...items]), [items])
  const meta = SUPPORTED_STATIONS[station]

  return (
    <article className={`supported-games is-${station}`}>
      <nav className="supported-station-switch" aria-label="Supported Practice stations">
        {(Object.keys(SUPPORTED_STATIONS) as SupportedStationId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`supported-station-tab${station === id ? ' is-active' : ''}`}
            aria-pressed={station === id}
            onClick={() => {
              if (id === station) return
              playFoley('whoosh')
              onStationChange(id)
            }}
          >
            {SUPPORTED_STATIONS[id].title}
          </button>
        ))}
      </nav>
      <p className="supported-station-note muted">{meta.childhood}</p>

      {station === 'video-match' ? (
        <VideoMatchBoard deck={deck} onComplete={onComplete} />
      ) : (
        <CopycatBoard deck={deck} onComplete={onComplete} />
      )}
    </article>
  )
}

/* ─── Video Match: hear sentence → tap matching video (3 options) ─── */

function VideoMatchBoard({
  deck,
  onComplete,
}: {
  deck: SupportedPracticeItem[]
  onComplete: () => void
}) {
  const meta = SUPPORTED_STATIONS['video-match']
  const [cleared, setCleared] = useState(0)
  const [boardClear, setBoardClear] = useState(false)
  const [target, setTarget] = useState<SupportedPracticeItem | null>(null)
  const [choices, setChoices] = useState<SupportedPracticeItem[]>([])
  const [usedIds, setUsedIds] = useState<string[]>([])
  const [pickId, setPickId] = useState<string | null>(null)
  const [pickOk, setPickOk] = useState(false)
  const [miss, setMiss] = useState(false)
  const [deal, setDeal] = useState(0)
  const left = Math.max(0, ROUNDS - cleared)

  function dealRound(nextUsed: string[]) {
    const pool = deck.filter((item) => !nextUsed.includes(item.id))
    const source = pool.length ? pool : deck
    const pick = source[Math.floor(Math.random() * source.length)]
    if (!pick) return
    const distractors = shuffle(deck.filter((item) => item.id !== pick.id)).slice(0, VIDEO_CHOICES - 1)
    setTarget(pick)
    setChoices(shuffle([pick, ...distractors]))
    setPickId(null)
    setPickOk(false)
    setMiss(false)
    setDeal((n) => n + 1)
  }

  useEffect(() => {
    stopSpeech()
    setCleared(0)
    setBoardClear(false)
    setUsedIds([])
    dealRound([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck])

  async function hear() {
    if (!target) return
    advanceStationCoach('video-match')
    await speakEnglish(target.sentence)
  }

  function pick(item: SupportedPracticeItem) {
    if (!target || pickId || boardClear) return
    advanceStationCoach('video-match')
    const ok = item.id === target.id
    setPickId(item.id)
    setPickOk(ok)
    setMiss(!ok)
    if (!ok) {
      playFoley('wrong')
      recordSkillAttempt('matching', false)
      return
    }
    const nextCleared = cleared + 1
    const nextUsed = [...usedIds, target.id]
    setCleared(nextCleared)
    setUsedIds(nextUsed)
    recordSkillAttempt('matching', true, 10)
    void speakEnglish(target.sentence)
    if (nextCleared >= ROUNDS) {
      setBoardClear(true)
      firePlayClear({ label: 'Videos clear', remnant: 'Station clear — continue when ready', kind: 'board' })
      return
    }
    firePlayClear({ label: 'Video clear', remnant: `${ROUNDS - nextCleared} left`, kind: 'micro' })
    window.setTimeout(() => dealRound(nextUsed), 700)
  }

  if (!target || choices.length < 2) {
    return <div className="alert warn">Video Match needs workplace videos.</div>
  }

  return (
    <section className="supported-video-match" data-coach="sp-video">
      <header className="supported-games-head">
        <h2 className="supported-games-title">{meta.title}</h2>
        <p className="play-nearby-objective" aria-live="polite">
          {boardClear ? 'Station clear — continue when ready' : meta.nearby(left)}
        </p>
        <p className="supported-games-help">{meta.help}</p>
      </header>

      <div className="supported-prompt-row">
        <p className="supported-prompt-sentence" lang="en">
          {target.sentence}
        </p>
        <button type="button" className="btn btn-primary supported-hear-btn" onClick={() => void hear()} disabled={boardClear}>
          Hear the sentence
        </button>
      </div>

      {miss ? (
        <p className="play-soft-miss" role="status">
          {softMissLine('Wrong video — try again.')}
        </p>
      ) : null}

      <div className="supported-video-grid" key={`vids-${deal}`}>
        {choices.map((item) => {
          const selected = pickId === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`supported-video-btn${selected ? (pickOk ? ' is-correct' : ' is-wrong') : ''}${
                pickId && item.id === target.id && !pickOk ? ' is-correct' : ''
              }`}
              data-correct={item.id === target.id ? '1' : undefined}
              disabled={!!pickId || boardClear}
              onClick={() => pick(item)}
              aria-label={`Video for: ${item.sentence}`}
            >
              <LoopClip
                src={supportedVideoSrc(item.video)}
                poster={supportedVideoSrc(item.poster)}
                active={!boardClear}
              />
              <span className="supported-video-badge" aria-hidden>
                Video
              </span>
            </button>
          )
        })}
      </div>

      {pickId && !pickOk ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setPickId(null)
            setPickOk(false)
            setMiss(false)
            setChoices(shuffle(choices))
            setDeal((n) => n + 1)
            playFoley('whoosh')
          }}
        >
          {SOFT_RETRY_LABEL}
        </button>
      ) : null}

      {boardClear ? (
        <div className="supported-games-advance">
          <div className="alert ok">Video Match clear. Help is strength — next door can open.</div>
          <button type="button" className="btn btn-primary" onClick={onComplete}>
            Continue to Copycat
          </button>
        </div>
      ) : (
        <StationCoach stationId="video-match" layoutKey={`vm-${deal}-${cleared}`} />
      )}
    </section>
  )
}

/* ─── Copycat: watch video → rebuild sentence with word chips ─── */

function CopycatBoard({
  deck,
  onComplete,
}: {
  deck: SupportedPracticeItem[]
  onComplete: () => void
}) {
  const meta = SUPPORTED_STATIONS.copycat
  const [cleared, setCleared] = useState(0)
  const [boardClear, setBoardClear] = useState(false)
  const [target, setTarget] = useState<SupportedPracticeItem | null>(null)
  const [usedIds, setUsedIds] = useState<string[]>([])
  const [chips, setChips] = useState<string[]>([])
  const [built, setBuilt] = useState<string[]>([])
  const [miss, setMiss] = useState(false)
  const [watched, setWatched] = useState(false)
  const [deal, setDeal] = useState(0)
  const left = Math.max(0, ROUNDS - cleared)
  const expected = target ? sentenceChips(target.sentence) : []

  function dealRound(nextUsed: string[]) {
    const pool = deck.filter((item) => !nextUsed.includes(item.id))
    const source = pool.length ? pool : deck
    const pick = source[Math.floor(Math.random() * source.length)]
    if (!pick) return
    const words = sentenceChips(pick.sentence)
    setTarget(pick)
    setChips(shuffle(words))
    setBuilt([])
    setMiss(false)
    setWatched(false)
    setDeal((n) => n + 1)
  }

  useEffect(() => {
    stopSpeech()
    setCleared(0)
    setBoardClear(false)
    setUsedIds([])
    dealRound([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck])

  useEffect(() => {
    if (!target || watched) return
    /* Model once: play clip VO after a short beat so the eye lands on the video. */
    const t = window.setTimeout(() => {
      void speakEnglish(target.sentence)
    }, 500)
    return () => window.clearTimeout(t)
  }, [target, watched, deal])

  function tapChip(word: string, index: number) {
    if (!target || boardClear || !watched) return
    advanceStationCoach('copycat')
    const nextBuilt = [...built, word]
    const nextChips = chips.filter((_, i) => i !== index)
    const okSoFar = nextBuilt.every((w, i) => w === expected[i])
    if (!okSoFar) {
      setMiss(true)
      playFoley('wrong')
      recordSkillAttempt('matching', false)
      setBuilt([])
      setChips(shuffle(sentenceChips(target.sentence)))
      return
    }
    setMiss(false)
    setBuilt(nextBuilt)
    setChips(nextChips)
    if (nextBuilt.length < expected.length) {
      playFoley('whoosh')
      return
    }
    /* Full sentence rebuilt */
    const nextCleared = cleared + 1
    const nextUsed = [...usedIds, target.id]
    setCleared(nextCleared)
    setUsedIds(nextUsed)
    recordSkillAttempt('matching', true, 10)
    void speakEnglish(target.sentence)
    if (nextCleared >= ROUNDS) {
      setBoardClear(true)
      firePlayClear({ label: 'Copycat clear', remnant: 'Station clear — continue when ready', kind: 'board' })
      return
    }
    firePlayClear({ label: 'Line clear', remnant: `${ROUNDS - nextCleared} left`, kind: 'micro' })
    window.setTimeout(() => dealRound(nextUsed), 800)
  }

  if (!target) {
    return <div className="alert warn">Copycat needs workplace videos.</div>
  }

  const nextWord = expected[built.length] || ''

  return (
    <section
      className="supported-copycat"
      data-coach="sp-copycat"
      data-expected={target.sentence}
      data-next={nextWord}
    >
      <header className="supported-games-head">
        <h2 className="supported-games-title">{meta.title}</h2>
        <p className="play-nearby-objective" aria-live="polite">
          {boardClear ? 'Station clear — continue when ready' : meta.nearby(left)}
        </p>
        <p className="supported-games-help">{meta.help}</p>
      </header>

      <figure className="supported-copycat-stage">
        <HeroClip
          key={`hero-${deal}`}
          src={supportedVideoSrc(target.video)}
          poster={supportedVideoSrc(target.poster)}
          onEnded={() => setWatched(true)}
        />
        <figcaption className="supported-copycat-caption">
          {watched ? 'Now tap the words in order.' : 'Watch once · then copy the sentence.'}
        </figcaption>
      </figure>

      <p className="supported-copycat-built" lang="en" aria-live="polite">
        {built.length ? built.join(' ') : '…'}
      </p>

      {miss ? (
        <p className="play-soft-miss" role="status">
          {softMissLine('Wrong order — watch the line and try again.')}
        </p>
      ) : null}

      <div className="supported-chip-row" key={`chips-${deal}-${miss}`}>
        {chips.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            className="supported-chip-btn"
            data-word={word}
            data-correct={word === nextWord ? '1' : undefined}
            disabled={boardClear || !watched}
            onClick={() => tapChip(word, index)}
          >
            {word}
          </button>
        ))}
      </div>

      {boardClear ? (
        <div className="supported-games-advance">
          <div className="alert ok">Copycat clear. Help is strength — next door can open.</div>
          <button type="button" className="btn btn-primary" onClick={onComplete}>
            Continue to workplace instructions
          </button>
        </div>
      ) : (
        <StationCoach stationId="copycat" layoutKey={`cc-${deal}-${cleared}`} />
      )}
    </section>
  )
}

function LoopClip({ src, poster, active }: { src: string; poster: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = true
    el.defaultMuted = true
    el.playsInline = true
    el.loop = true
    const tryPlay = () => {
      if (active) void el.play().catch(() => {})
      else el.pause()
    }
    tryPlay()
    el.addEventListener('loadeddata', tryPlay)
    return () => el.removeEventListener('loadeddata', tryPlay)
  }, [src, active])
  return (
    <video
      ref={ref}
      className="supported-video-el"
      src={src}
      poster={poster}
      muted
      autoPlay
      playsInline
      loop
      preload="auto"
    />
  )
}

function HeroClip({
  src,
  poster,
  onEnded,
}: {
  src: string
  poster: string
  onEnded: () => void
}) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = true
    el.defaultMuted = true
    el.playsInline = true
    el.loop = false
    const done = () => onEnded()
    el.addEventListener('ended', done)
    void el.play().catch(() => onEnded())
    return () => el.removeEventListener('ended', done)
  }, [src, onEnded])
  return (
    <video
      ref={ref}
      className="supported-copycat-video"
      src={src}
      poster={poster}
      muted
      autoPlay
      playsInline
      controls
      preload="auto"
    />
  )
}
