import { useEffect, useMemo, useState } from 'react'
import type { HomeLang, SupportLang, VocabTerm } from './journeyCurriculum'
import { pathwayImage } from '../pathways'
import { VOCAB_SHEET_LANGS } from './VocabSheet'
import { playFoley } from '../audio/foley'
import { firePlayClear, softMissLine } from '../practice/PlayClear'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'
import { speakEnglish, speakSupport, stopSpeech } from './speech'
import { specialtyVocabPool } from './vocabDistractors'

export const ORGANIZE_PAGE_SIZE = 4
export const ORGANIZE_ROUNDS = 5

type Pick = { kind: 'image'; termId: string }

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))
  return pages.filter((page) => page.length)
}

function usePhoneOrganizeLayout() {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const read = () =>
      setPhone(
        document.documentElement.classList.contains('pa-phone-shell') ||
          Boolean(document.querySelector('.is-phone-app, .pa-phone-shell, .iphone-scroll')),
      )
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'], subtree: true })
    /* Phone frame mounts .is-phone-app after first paint — watch the shell tree too */
    const shell = document.querySelector('.pa-phone-shell, .iphone-frame, #root') || document.body
    obs.observe(shell, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])
  return phone
}

/** Pick pictured specialty words for five organize rounds. */
export function pickOrganizeTerms(vocab: readonly VocabTerm[]): VocabTerm[] {
  const pool = specialtyVocabPool(vocab)
  const need = ORGANIZE_PAGE_SIZE * ORGANIZE_ROUNDS
  if (pool.length <= need) return shuffle(pool)
  return shuffle(pool).slice(0, need)
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M4 10v4h3l5 4V6L7 10H4zm11.5 2a3.5 3.5 0 0 0-1.8-3.1v6.2A3.5 3.5 0 0 0 15.5 12zM13.7 5.1v1.8a5.5 5.5 0 0 1 0 10.2v1.8a7.3 7.3 0 0 0 0-13.8z"
      />
    </svg>
  )
}

/** Nearby objective — Candy Crush “clear this board” without a score. */
function leftOverObjective(matchedCount: number, pageLen: number, phone: boolean) {
  const left = pageLen - matchedCount
  if (left <= 0) return 'Round clear — every picture placed'
  if (phone) {
    return left === 1
      ? 'Clear this word · 1 picture left'
      : `Clear this word · ${left} pictures left`
  }
  return left === 1
    ? 'Clear this round · 1 picture left'
    : `Clear this round · ${left} pictures left`
}

type Props = {
  terms: VocabTerm[]
  onPassed: () => void
  onSkip?: () => void
}

/**
 * Five rounds. Each word already shows English + five language names.
 * Move the matching picture into the empty box on that word.
 * Phone: one word card at a time (four columns cannot fit ~390px).
 * Desktop: four boards side by side.
 */
export function VocabOrganizeQuiz({ terms, onPassed, onSkip }: Props) {
  const phone = usePhoneOrganizeLayout()
  const rounds = useMemo(() => chunk(terms, ORGANIZE_PAGE_SIZE), [terms])
  const [round, setRound] = useState(0)
  const page = rounds[Math.min(round, Math.max(0, rounds.length - 1))] || []
  const byId = useMemo(() => new Map(page.map((t) => [t.id, t])), [page])

  const [imageOrder, setImageOrder] = useState(() => shuffle(page.map((t) => t.id)))
  const [matched, setMatched] = useState<Record<string, true>>({})
  const [picked, setPicked] = useState<Pick | null>(null)
  const [shakeId, setShakeId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)
  const [roundClear, setRoundClear] = useState(false)
  const [passed, setPassed] = useState(false)
  const [focusIdx, setFocusIdx] = useState(0)
  const practice = isPracticeMode()

  const pageKey = page.map((t) => t.id).join('|')

  useEffect(() => {
    setImageOrder(shuffle(page.map((t) => t.id)))
    setMatched({})
    setPicked(null)
    setShakeId(null)
    setDragOverId(null)
    setRoundClear(false)
    setFocusIdx(0)
  }, [pageKey])

  const leftoverImages = imageOrder.filter((id) => !matched[id])
  const unmatched = page.filter((t) => !matched[t.id])
  const matchedCount = Object.keys(matched).length
  const lastRound = round >= rounds.length - 1
  /** First picture of round 1 — then coach stays quiet for the rest of Organize. */
  const coachFirst = round === 0 && matchedCount === 0

  /* Keep focus on an unmatched word when the current one is cleared */
  useEffect(() => {
    if (!phone || !unmatched.length) return
    if (focusIdx >= unmatched.length) setFocusIdx(Math.max(0, unmatched.length - 1))
  }, [phone, unmatched.length, focusIdx])

  const focusTerm = phone && unmatched.length ? unmatched[Math.min(focusIdx, unmatched.length - 1)] : null
  const boardsToShow = phone ? (focusTerm ? [focusTerm] : []) : page

  function placeImage(imageId: string, wordId: string) {
    if (roundClear || passed || matched[wordId]) return
    if (imageId !== wordId) {
      setShakeId(wordId)
      playFoley('wrong')
      recordSkillAttempt('vocab-organize', false, 0)
      window.setTimeout(() => setShakeId(null), 380)
      setPicked(null)
      return
    }
    const nextMatched = { ...matched, [wordId]: true as const }
    const placed = Object.keys(nextMatched).length
    const left = page.length - placed
    setMatched(nextMatched)
    setPicked(null)
    recordSkillAttempt('vocab-organize', true, 8)
    if (placed === page.length) {
      recordSkillAttempt('vocab-organize', true, 16)
      if (lastRound) {
        firePlayClear({
          label: 'Station clear',
          remnant: 'Five rounds complete',
          kind: 'board',
        })
        setPassed(true)
        recordSkillAttempt('vocab-organize', true, 24)
      } else {
        firePlayClear({
          label: 'Round clear',
          remnant: `Round ${round + 1} of ${rounds.length} done`,
          kind: 'board',
        })
        setRoundClear(true)
      }
      return
    }
    firePlayClear({
      label: 'Picture clear',
      remnant: left === 1 ? '1 left this round' : `${left} left this round`,
      kind: 'micro',
    })
    /* Phone: stay on the next unmatched word (same index after removal) */
    if (phone) {
      const nextUnmatched = page.filter((t) => !nextMatched[t.id])
      setFocusIdx((i) => Math.min(i, Math.max(0, nextUnmatched.length - 1)))
    }
  }

  function tapImage(termId: string) {
    if (roundClear || passed || matched[termId]) return
    setPicked((cur) => (cur?.termId === termId ? null : { kind: 'image', termId }))
    playFoley('whoosh')
    if (coachFirst) advanceStationCoach('language-organize')
  }

  function tapBox(wordId: string) {
    if (!picked) return
    if (coachFirst) advanceStationCoach('language-organize')
    placeImage(picked.termId, wordId)
  }

  function startNextRound() {
    setRound((n) => n + 1)
    playFoley('whoosh')
  }

  async function playLang(term: VocabTerm, lang: SupportLang) {
    const key = `${term.id}:${lang}`
    setSpeakingKey(key)
    stopSpeech()
    if (lang === 'English') await speakEnglish(term.english)
    else await speakSupport(term.gloss[lang as HomeLang], lang)
    setSpeakingKey((cur) => (cur === key ? null : cur))
  }

  function reshuffle() {
    if (roundClear || passed) return
    setImageOrder(shuffle(page.map((t) => t.id)))
    setMatched({})
    setPicked(null)
    setShakeId(null)
    setFocusIdx(0)
    playFoley('whoosh')
  }

  if (!terms.length || !page.length) {
    return <div className="alert warn">Language organize needs pictured words.</div>
  }

  if (passed) {
    return (
      <article className="vocab-organize vocab-organize-pass" aria-live="polite">
        <p className="section-kicker">Language organize · Done</p>
        <div className="vocab-organize-pass-badge" aria-hidden>
          ✓
        </div>
        <h2>Five rounds complete</h2>
        <p className="lede">You matched each picture to the word in every language. Next: Eye Spy.</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onPassed}>
            Continue to English Eye Spy
          </button>
        </div>
      </article>
    )
  }

  if (roundClear) {
    return (
      <article className="vocab-organize vocab-organize-pass" aria-live="polite">
        <p className="section-kicker">
          Language organize · Round {round + 1} of {rounds.length}
        </p>
        <div className="vocab-organize-pass-badge" aria-hidden>
          ✓
        </div>
        <h2>Round {round + 1} clear</h2>
        <p className="lede">Four pictures are on the right words. Next set uses four new words.</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={startNextRound}>
            Start round {round + 2} of {rounds.length}
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className={`vocab-organize${phone ? ' is-phone-focus' : ''}`}>
      <header className="vocab-organize-head">
        <div className="vocab-organize-head-row">
          <p className="section-kicker">
            Language organize · Round {round + 1} of {rounds.length}
          </p>
          {practice && onSkip ? (
            <button type="button" className="btn btn-ghost vocab-organize-skip" onClick={onSkip}>
              Skip for now
            </button>
          ) : null}
        </div>
        <p className="play-nearby-objective" aria-live="polite">
          {leftOverObjective(matchedCount, page.length, phone)}
        </p>
        <ol className="vocab-organize-beads" aria-label="Rounds">
          {rounds.map((_, i) => (
            <li
              key={i}
              className={`vocab-organize-bead${i < round ? ' is-done' : ''}${i === round ? ' is-now' : ''}`}
            >
              <span className="sr-only">Round {i + 1}{i === round ? ' now' : ''}</span>
            </li>
          ))}
        </ol>
        {shakeId ? (
          <p className="play-soft-miss" role="status">
            {softMissLine('That picture belongs on a different word.')}
          </p>
        ) : null}
        <p className="train-vocab-counter">
          {phone
            ? `Tap a picture, then tap Drop on this word · ${matchedCount} of ${page.length}`
            : `Move each picture into its word box · ${matchedCount} of ${page.length}`}
          {picked ? (phone ? ' · Picture selected — tap Drop' : ' · Picture selected — drop it on the empty box') : ''}
        </p>
        <p className="lede vocab-organize-help">
          {phone
            ? 'Tap a picture · then Drop on this word.'
            : 'Tap or drag a picture onto the matching word box. Hear a language if you want help.'}
        </p>
      </header>

      <section className="vocab-organize-pool" aria-label="Pictures to place">
        <p className="vocab-organize-pool-label">
          {phone ? 'Pictures — tap one, then tap Drop on the word' : 'Pictures — drag or tap, then drop on a box'}
        </p>
        {leftoverImages.length ? (
          <div className="vocab-organize-pool-grid is-images">
            {leftoverImages.map((termId) => {
              const term = byId.get(termId)
              if (!term) return null
              const img = pathwayImage(term.imageKey)
              const active = picked?.termId === termId
              return (
                <button
                  key={termId}
                  type="button"
                  className={`vocab-organize-piece is-image${active ? ' is-selected' : ''}`}
                  data-term-id={termId}
                  data-coach={termId === leftoverImages[0] ? 'org-pic' : undefined}
                  draggable={!phone}
                  onDragStart={(e) => {
                    if (phone) return
                    e.dataTransfer.setData('text/plain', termId)
                    e.dataTransfer.effectAllowed = 'move'
                    setPicked({ kind: 'image', termId })
                    if (coachFirst) advanceStationCoach('language-organize')
                  }}
                  onClick={() => tapImage(termId)}
                  aria-pressed={active}
                  aria-label="Picture to place"
                >
                  {img ? (
                    <img src={img} alt="" draggable={false} />
                  ) : (
                    <span className="vocab-organize-emoji">{term.emoji}</span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="alert ok">Every picture is in a box.</p>
        )}
      </section>

      {/* Drop card directly under pictures so phone first viewport stays playable */}
      <div className={`vocab-organize-boards${phone ? ' is-phone-stack' : ''}`}>
        {boardsToShow.map((term) => {
          const done = Boolean(matched[term.id])
          const img = pathwayImage(term.imageKey)
          return (
            <section
              key={term.id}
              className={`vocab-organize-board${done ? ' is-matched' : ''}${
                shakeId === term.id ? ' is-shake' : ''
              }${dragOverId === term.id ? ' is-target' : ''}`}
              data-term-id={term.id}
              aria-label={`${term.english} with five language names`}
            >
              <button
                type="button"
                className={`vocab-organize-slot is-image${done ? ' is-filled' : ''}${
                  picked && !done ? ' is-target' : ''
                }`}
                data-box-id={term.id}
                data-coach={!done ? 'org-drop' : undefined}
                onClick={() => tapBox(term.id)}
                onDragOver={(e) => {
                  if (phone) return
                  e.preventDefault()
                  setDragOverId(term.id)
                }}
                onDragLeave={() => setDragOverId((cur) => (cur === term.id ? null : cur))}
                onDrop={(e) => {
                  if (phone) return
                  e.preventDefault()
                  setDragOverId(null)
                  const imageId = e.dataTransfer.getData('text/plain') || picked?.termId
                  if (imageId) {
                    if (coachFirst) advanceStationCoach('language-organize')
                    placeImage(imageId, term.id)
                  }
                }}
                aria-label={done ? `Picture for ${term.english}` : `Empty picture box for ${term.english}`}
              >
                {done ? (
                  img ? (
                    <img src={img} alt="" />
                  ) : (
                    <span className="vocab-organize-emoji">{term.emoji}</span>
                  )
                ) : (
                  <span className="vocab-organize-slot-hint">
                    {picked ? 'Drop here' : 'Empty — needs picture'}
                  </span>
                )}
              </button>

              <div className="vocab-organize-english-row">
                <h3 className="vocab-organize-english">{term.english}</h3>
                <HearButton
                  label={`Hear ${term.english} in English`}
                  busy={speakingKey === `${term.id}:English`}
                  onPlay={() => void playLang(term, 'English')}
                />
              </div>

              <ol className={`vocab-organize-lang-list${phone ? ' is-phone-compact' : ''}`}>
                {VOCAB_SHEET_LANGS.map((lang, i) => (
                  <li key={lang}>
                    <span className="vocab-organize-lang-order">{i + 1}</span>
                    <span className="vocab-organize-lang-copy">
                      <span className="vocab-organize-lang-name">{lang}</span>
                      <span className="vocab-organize-slot-word">{term.gloss[lang]}</span>
                    </span>
                    <HearButton
                      label={`Hear ${term.english} in ${lang}`}
                      busy={speakingKey === `${term.id}:${lang}`}
                      onPlay={() => void playLang(term, lang)}
                    />
                  </li>
                ))}
              </ol>
            </section>
          )
        })}
      </div>

      {phone && picked && focusTerm && !matched[focusTerm.id] ? (
        <div className="vocab-organize-drop-cta">
          <button
            type="button"
            className="btn btn-primary"
            data-coach="org-drop"
            onClick={() => tapBox(focusTerm.id)}
          >
            Drop on {focusTerm.english}
          </button>
        </div>
      ) : null}

      {phone && unmatched.length > 1 ? (
        <div className="vocab-organize-focus-nav" role="navigation" aria-label="Word to match">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={focusIdx <= 0}
            onClick={() => setFocusIdx((i) => Math.max(0, i - 1))}
          >
            ← Prev
          </button>
          <span className="vocab-organize-focus-count">
            Word {focusIdx + 1} of {unmatched.length}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={focusIdx >= unmatched.length - 1}
            onClick={() => setFocusIdx((i) => Math.min(unmatched.length - 1, i + 1))}
          >
            Next →
          </button>
        </div>
      ) : null}

      <div className="vocab-organize-actions">
        <button type="button" className="btn btn-secondary on-light" onClick={reshuffle}>
          Mix pictures again
        </button>
      </div>
      {coachFirst ? (
        <StationCoach
          stationId="language-organize"
          layoutKey={`${pageKey}-${picked?.termId ?? 'none'}-${phone ? 'phone' : 'desk'}`}
        />
      ) : null}
    </article>
  )
}

function HearButton({
  label,
  busy,
  onPlay,
}: {
  label: string
  busy: boolean
  onPlay: () => void
}) {
  return (
    <button type="button" className={`vocab-organize-hear${busy ? ' is-busy' : ''}`} onClick={onPlay} aria-label={label}>
      <SpeakerIcon />
      <span>{busy ? '…' : 'Hear'}</span>
    </button>
  )
}
