import { useEffect, useState } from 'react'
import {
  supportedPhotoSrc,
  type SupportedPracticeItem,
} from '../pathways/packs/supportedPracticeDeck'
import { SUPPORTED_PRACTICE_DECK } from '../pathways/packs/supportedPracticeDeck'
import { playFoley } from '../audio/foley'
import { firePlayClear, softMissLine, SOFT_RETRY_LABEL } from '../practice/PlayClear'
import { StationCoach, advanceStationCoach } from '../practice/StationCoachView'
import { recordSkillAttempt } from './learningMastery'
import { speakEnglish, stopSpeech } from './speech'

/**
 * Community Support vocab — two short games beside Picture Match and Copycat.
 * What helps: the sentence names a need, not the object. Tap the support item.
 * Kind and clear: two lines. Tap the one that asks first, keeps privacy, and stays calm.
 * Lines come from the existing community word-action practice.
 */

export type CommunityVocabGameId = 'what-helps' | 'kind-clear'

export const COMMUNITY_VOCAB_TABS: { id: CommunityVocabGameId; title: string; note: string }[] = [
  {
    id: 'what-helps',
    title: 'What helps',
    note: 'The sentence names a need. Tap the item that helps.',
  },
  {
    id: 'kind-clear',
    title: 'Kind and clear',
    note: 'Two lines. Tap the one that asks first and keeps privacy.',
  },
]

const ROUNDS = 3

const DECK = SUPPORTED_PRACTICE_DECK.community

function item(id: string): SupportedPracticeItem {
  const found = DECK.find((row) => row.id === id)
  if (!found) throw new Error(`Missing community practice photo ${id}`)
  return found
}

type HelpRound = {
  id: string
  need: string
  answerId: string
  teach: string
  distractorIds: [string, string]
}

const HELP_ROUNDS: HelpRound[] = [
  {
    id: 'move',
    need: 'The person wants to move down the hall.',
    answerId: 'sp-m-chair',
    teach: 'Push the wheelchair slowly.',
    distractorIds: ['sp-m-gloves', 'sp-m-badge'],
  },
  {
    id: 'hands',
    need: 'Your hands must be clean before you help.',
    answerId: 'sp-m-gloves',
    teach: 'Wear clean gloves.',
    distractorIds: ['sp-m-keys', 'sp-m-phone'],
  },
  {
    id: 'who',
    need: 'Someone at the door asks who you are.',
    answerId: 'sp-m-badge',
    teach: 'Show your name badge.',
    distractorIds: ['sp-m-aid', 'sp-m-sofa'],
  },
]

type KindRound = {
  id: string
  moment: string
  right: string
  wrong: string
  teach: string
}

const KIND_ROUNDS: KindRound[] = [
  {
    id: 'consent',
    moment: 'You are about to enter a private room.',
    right: 'Check consent before you enter a private space.',
    wrong: 'Walk in. They will not mind.',
    teach: 'Consent first. Then begin.',
  },
  {
    id: 'privacy',
    moment: 'A neighbour asks what the person told you.',
    right: 'Keep the talk private. Do not share details in public.',
    wrong: 'Tell the story so everyone can hear.',
    teach: 'Private talk. No public sharing.',
  },
  {
    id: 'pressure',
    moment: 'You want this person to accept help.',
    right: 'Offer support without pressure.',
    wrong: 'Make them say yes.',
    teach: 'Meet people where they are. No pressure.',
  },
]

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

type StationPick = 'video-match' | 'copycat' | CommunityVocabGameId

function StationSwitch({
  active,
  onPick,
}: {
  active: StationPick
  onPick: (id: StationPick) => void
}) {
  const tabs: { id: StationPick; title: string }[] = [
    { id: 'video-match', title: 'Picture Match' },
    { id: 'copycat', title: 'Copycat' },
    ...COMMUNITY_VOCAB_TABS.map((tab) => ({ id: tab.id, title: tab.title })),
  ]
  return (
    <nav className="supported-station-switch" aria-label="Community vocab games">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`supported-station-tab${active === tab.id ? ' is-active' : ''}`}
          aria-pressed={active === tab.id}
          onClick={() => {
            if (tab.id === active) return
            playFoley('whoosh')
            onPick(tab.id)
          }}
        >
          {tab.title}
        </button>
      ))}
    </nav>
  )
}

type Props = {
  game: CommunityVocabGameId
  onOpen: (next: StationPick) => void
  onComplete: () => void
}

export function CommunityVocabGames({ game, onOpen, onComplete }: Props) {
  return (
    <article className={`supported-games is-${game}`}>
      <StationSwitch active={game} onPick={onOpen} />
      <p className="supported-station-note muted">
        {COMMUNITY_VOCAB_TABS.find((tab) => tab.id === game)?.note}
      </p>
      {game === 'what-helps' ? (
        <WhatHelps onComplete={onComplete} />
      ) : (
        <KindAndClear onComplete={onComplete} />
      )}
    </article>
  )
}

function WhatHelps({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0)
  const [choices, setChoices] = useState<SupportedPracticeItem[]>([])
  const [pickId, setPickId] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [cleared, setCleared] = useState(false)

  const current = HELP_ROUNDS[round]

  useEffect(() => {
    stopSpeech()
    const row = HELP_ROUNDS[0]
    setChoices(shuffle([item(row.answerId), item(row.distractorIds[0]), item(row.distractorIds[1])]))
  }, [])

  function deal(index: number) {
    const row = HELP_ROUNDS[index]
    setRound(index)
    setPickId(null)
    setOk(false)
    setChoices(shuffle([item(row.answerId), item(row.distractorIds[0]), item(row.distractorIds[1])]))
  }

  function hear() {
    if (!current || cleared) return
    advanceStationCoach('community-what-helps')
    void speakEnglish(current.need)
  }

  function pick(photo: SupportedPracticeItem) {
    if (!current || pickId || cleared) return
    advanceStationCoach('community-what-helps')
    const right = photo.id === current.answerId
    setPickId(photo.id)
    setOk(right)
    playFoley(right ? 'correct' : 'wrong')
    recordSkillAttempt('matching', right, right ? 10 : 0)
    if (!right) return
    void speakEnglish(current.teach)
    if (round >= ROUNDS - 1) {
      setCleared(true)
      firePlayClear({
        label: 'What helps clear',
        remnant: 'Station clear — continue when ready',
        kind: 'board',
      })
      return
    }
    firePlayClear({
      label: 'Need clear',
      remnant: `${ROUNDS - (round + 1)} left`,
      kind: 'micro',
    })
    window.setTimeout(() => deal(round + 1), 700)
  }

  if (!current) return null
  const left = Math.max(0, ROUNDS - round - (ok ? 1 : 0))

  return (
    <section className="supported-video-match" data-coach="community-helps">
      <header className="supported-games-head">
        <h2 className="supported-games-title">What helps</h2>
        <p className="play-nearby-objective" aria-live="polite">
          {cleared ? 'Station clear — continue when ready' : left <= 0 ? 'Last one' : `${left} left`}
        </p>
        <p className="supported-games-help">Hear the need. Tap the picture that helps.</p>
      </header>
      <div className="supported-prompt-row">
        <p className="supported-prompt-sentence" lang="en">
          {current.need}
        </p>
        <button
          type="button"
          className="btn btn-primary supported-hear-btn"
          data-coach="helps-hear"
          onClick={hear}
          disabled={cleared}
        >
          Hear the need
        </button>
      </div>
      {pickId && !ok ? (
        <p className="play-soft-miss" role="status">
          {softMissLine(current.teach)}
        </p>
      ) : null}
      <div className="supported-video-grid" data-coach="helps-choice">
        {choices.map((photo) => {
          const selected = pickId === photo.id
          const showRight = pickId && photo.id === current.answerId
          return (
            <button
              key={photo.id}
              type="button"
              className={`supported-video-btn${selected ? (ok ? ' is-correct' : ' is-wrong') : ''}${
                showRight && !ok ? ' is-correct' : ''
              }`}
              disabled={!!pickId || cleared}
              onClick={() => pick(photo)}
              aria-label={photo.sentence}
            >
              <img className="supported-photo-el" src={supportedPhotoSrc(photo)} alt="" />
              {selected && ok ? (
                <span className="supported-photo-caption" lang="en">
                  {current.teach}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {pickId && !ok ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setPickId(null)
            setOk(false)
            setChoices(shuffle(choices))
            playFoley('whoosh')
          }}
        >
          {SOFT_RETRY_LABEL}
        </button>
      ) : null}
      {cleared ? (
        <div className="supported-games-advance">
          <div className="alert ok">What helps is clear. Next, choose the kind and clear line.</div>
          <button type="button" className="btn btn-primary" onClick={onComplete}>
            Continue to Kind and clear
          </button>
        </div>
      ) : (
        <StationCoach
          stationId="community-what-helps"
          layoutKey={`helps-${round}-${pickId ?? 'open'}`}
          steps={[
            {
              say: 'Hear the need. It does not name the item.',
              target: '[data-coach="helps-hear"]',
            },
            {
              say: 'Tap the picture that helps.',
              target: '[data-coach="helps-choice"]',
            },
          ]}
        />
      )}
    </section>
  )
}

function KindAndClear({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0)
  const [order, setOrder] = useState<('right' | 'wrong')[]>(['right', 'wrong'])
  const [pick, setPick] = useState<'right' | 'wrong' | null>(null)
  const [cleared, setCleared] = useState(false)

  const current = KIND_ROUNDS[round]

  useEffect(() => {
    stopSpeech()
    setOrder(shuffle(['right', 'wrong']))
  }, [])

  function deal(index: number) {
    setRound(index)
    setPick(null)
    setOrder(shuffle(['right', 'wrong']))
  }

  function choose(side: 'right' | 'wrong') {
    if (!current || pick || cleared) return
    advanceStationCoach('community-kind-clear')
    setPick(side)
    const right = side === 'right'
    playFoley(right ? 'correct' : 'wrong')
    recordSkillAttempt('matching', right, right ? 10 : 0)
    if (!right) return
    void speakEnglish(current.right)
    if (round >= ROUNDS - 1) {
      setCleared(true)
      firePlayClear({
        label: 'Kind and clear',
        remnant: 'Station clear — continue when ready',
        kind: 'board',
      })
      return
    }
    firePlayClear({
      label: 'Line clear',
      remnant: `${ROUNDS - (round + 1)} left`,
      kind: 'micro',
    })
    window.setTimeout(() => deal(round + 1), 700)
  }

  if (!current) return null
  const left = Math.max(0, ROUNDS - round - (pick === 'right' ? 1 : 0))

  return (
    <section className="supported-kind-clear" data-coach="community-kind">
      <header className="supported-games-head">
        <h2 className="supported-games-title">Kind and clear</h2>
        <p className="play-nearby-objective" aria-live="polite">
          {cleared ? 'Station clear — continue when ready' : left <= 0 ? 'Last one' : `${left} left`}
        </p>
        <p className="supported-games-help">Tap the line that asks first and keeps privacy.</p>
      </header>
      <div className="supported-prompt-row">
        <p className="supported-prompt-sentence" lang="en">
          {current.moment}
        </p>
        <button
          type="button"
          className="btn btn-primary supported-hear-btn"
          data-coach="kind-hear"
          disabled={cleared}
          onClick={() => {
            advanceStationCoach('community-kind-clear')
            void speakEnglish(current.moment)
          }}
        >
          Hear the moment
        </button>
      </div>
      {pick === 'wrong' ? (
        <p className="play-soft-miss" role="status">
          {softMissLine(current.teach)}
        </p>
      ) : null}
      <div className="train-choice-grid" data-coach="kind-choice">
        {order.map((side) => {
          const text = side === 'right' ? current.right : current.wrong
          const state =
            pick === side ? (side === 'right' ? ' is-correct' : ' is-wrong') : pick && side === 'right' ? ' is-correct' : ''
          return (
            <button
              key={side}
              type="button"
              className={`train-choice${state}`}
              disabled={!!pick || cleared}
              onClick={() => choose(side)}
            >
              {text}
            </button>
          )
        })}
      </div>
      {pick === 'wrong' ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setPick(null)
            setOrder(shuffle(['right', 'wrong']))
            playFoley('whoosh')
          }}
        >
          {SOFT_RETRY_LABEL}
        </button>
      ) : null}
      {cleared ? (
        <div className="supported-games-advance">
          <div className="alert ok">Kind and clear. Help is strength — workplace instructions are next.</div>
          <button type="button" className="btn btn-primary" onClick={onComplete}>
            Continue to workplace instructions
          </button>
        </div>
      ) : (
        <StationCoach
          stationId="community-kind-clear"
          layoutKey={`kind-${round}-${pick ?? 'open'}`}
          steps={[
            {
              say: 'Hear the moment.',
              target: '[data-coach="kind-hear"]',
            },
            {
              say: 'Tap the kind, clear line.',
              target: '[data-coach="kind-choice"]',
            },
          ]}
        />
      )}
    </section>
  )
}
