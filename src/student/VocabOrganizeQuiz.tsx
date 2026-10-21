import { useMemo, useState } from 'react'
import type { HomeLang, VocabTerm } from './journeyCurriculum'
import { pathwayImage } from '../pathways'
import { VOCAB_SHEET_LANGS } from './VocabSheet'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'
import { specialtyVocabPool } from './vocabDistractors'

/** Four stations on one organize page — complete the page to pass. */
export const ORGANIZE_PAGE_SIZE = 4

type ImagePiece = { kind: 'image'; termId: string; key: string }
type GlossPiece = { kind: 'gloss'; termId: string; lang: HomeLang; key: string }
type Piece = ImagePiece | GlossPiece

type ImageSlot = { kind: 'image'; termId: string }
type GlossSlot = { kind: 'gloss'; termId: string; lang: HomeLang }
type Slot = ImageSlot | GlossSlot

function slotKey(slot: Slot) {
  return slot.kind === 'image' ? `${slot.termId}:image` : `${slot.termId}:${slot.lang}`
}

function pieceMatchesSlot(piece: Piece, slot: Slot) {
  if (piece.termId !== slot.termId) return false
  if (slot.kind === 'image') return piece.kind === 'image'
  return piece.kind === 'gloss' && piece.lang === slot.lang
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/** Pick four pictured specialty words for one organize page. */
export function pickOrganizeTerms(vocab: readonly VocabTerm[]): VocabTerm[] {
  const pool = specialtyVocabPool(vocab)
  if (pool.length <= ORGANIZE_PAGE_SIZE) return [...pool]
  return shuffle(pool).slice(0, ORGANIZE_PAGE_SIZE)
}

function buildPieces(terms: VocabTerm[]): Piece[] {
  const pieces: Piece[] = []
  for (const term of terms) {
    pieces.push({ kind: 'image', termId: term.id, key: `img:${term.id}` })
    for (const lang of VOCAB_SHEET_LANGS) {
      pieces.push({ kind: 'gloss', termId: term.id, lang, key: `gloss:${term.id}:${lang}` })
    }
  }
  return shuffle(pieces)
}

type Props = {
  terms: VocabTerm[]
  onPassed: () => void
  /** Practice quality-review: leave without finishing. */
  onSkip?: () => void
}

/**
 * Post–Visual Vocabulary organize quiz.
 *
 * Top: jumbled photos + five-language words.
 * Board: four English stations. Place the picture, then language words
 * in worksheet descending order (Amharic → Tigrinya → Arabic → Spanish → Hindi).
 * All four stations must be complete to pass the page.
 */
export function VocabOrganizeQuiz({ terms, onPassed, onSkip }: Props) {
  const byId = useMemo(() => new Map(terms.map((t) => [t.id, t])), [terms])
  const [pool, setPool] = useState(() => buildPieces(terms))
  const [placements, setPlacements] = useState<Record<string, Piece>>({})
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [shakeSlot, setShakeSlot] = useState<string | null>(null)
  const [passed, setPassed] = useState(false)
  const practice = isPracticeMode()

  const selected =
    selectedKey == null
      ? null
      : pool.find((p) => p.key === selectedKey) ||
        Object.values(placements).find((p) => p.key === selectedKey) ||
        null

  const totalSlots = terms.length * (1 + VOCAB_SHEET_LANGS.length)
  const filledCount = Object.keys(placements).length
  const poolImages = pool.filter((p): p is ImagePiece => p.kind === 'image')
  const poolGlosses = pool.filter((p): p is GlossPiece => p.kind === 'gloss')
  const allCorrect =
    filledCount === totalSlots &&
    terms.every((term) => {
      const img = placements[slotKey({ kind: 'image', termId: term.id })]
      if (!img || img.kind !== 'image' || img.termId !== term.id) return false
      return VOCAB_SHEET_LANGS.every((lang) => {
        const g = placements[slotKey({ kind: 'gloss', termId: term.id, lang })]
        return g?.kind === 'gloss' && g.termId === term.id && g.lang === lang
      })
    })

  function selectPiece(piece: Piece) {
    if (passed) return
    setSelectedKey((cur) => (cur === piece.key ? null : piece.key))
    playFoley('whoosh')
  }

  function returnPieceToPool(piece: Piece) {
    setPlacements((prev) => {
      const next = { ...prev }
      for (const [k, v] of Object.entries(next)) {
        if (v.key === piece.key) delete next[k]
      }
      return next
    })
    setPool((prev) => (prev.some((p) => p.key === piece.key) ? prev : [...prev, piece]))
  }

  function placeOnSlot(slot: Slot) {
    if (passed || !selected) return
    const key = slotKey(slot)
    if (!pieceMatchesSlot(selected, slot)) {
      setShakeSlot(key)
      playFoley('wrong')
      recordSkillAttempt('vocab-organize', false, 0)
      window.setTimeout(() => setShakeSlot(null), 380)
      return
    }

    const displaced = placements[key]
    setPlacements((prev) => {
      const next = { ...prev }
      /* Remove selected from any previous slot */
      for (const [k, v] of Object.entries(next)) {
        if (v.key === selected.key) delete next[k]
      }
      next[key] = selected
      return next
    })
    setPool((prev) => {
      let next = prev.filter((p) => p.key !== selected.key)
      if (displaced) next = [...next, displaced]
      return next
    })
    setSelectedKey(null)
    playFoley('correct')
    recordSkillAttempt('vocab-organize', true, 4)
  }

  function checkPage() {
    if (!allCorrect) {
      playFoley('wrong')
      return
    }
    setPassed(true)
    playFoley('correct')
    recordSkillAttempt('vocab-organize', true, 24)
  }

  function reshuffle() {
    if (passed) return
    setPool(buildPieces(terms))
    setPlacements({})
    setSelectedKey(null)
    setShakeSlot(null)
    playFoley('whoosh')
  }

  if (!terms.length) {
    return <div className="alert warn">Organize quiz needs pictured vocabulary words.</div>
  }

  if (passed) {
    return (
      <article className="vocab-organize vocab-organize-pass" aria-live="polite">
        <p className="section-kicker">Language organize · Page passed</p>
        <div className="vocab-organize-pass-badge" aria-hidden>
          ✓
        </div>
        <h2>Four words organized</h2>
        <p className="lede">
          Each English station has its picture and all five language names in order. Next you find the same words in Eye Spy.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onPassed}>
            Continue to English Eye Spy
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="vocab-organize">
      <header className="vocab-organize-head">
        <div className="vocab-organize-head-row">
          <p className="section-kicker">Language organize</p>
          {practice && onSkip ? (
            <button type="button" className="btn btn-ghost vocab-organize-skip" onClick={onSkip}>
              Skip organize quiz
            </button>
          ) : null}
        </div>
        <p className="train-vocab-counter">
          Place pictures + five languages · {filledCount}/{totalSlots} placed
          {selected ? ' · Piece selected — tap a box' : ' · Tap a piece, then tap its box'}
        </p>
        <p className="lede vocab-organize-help">
          Pictures and five-language words are mixed up at the top. Each English station has an empty
          picture box. Drop the matching visual in, then place each language version of the word in
          the boxes below it (Amharic → Tigrinya → Arabic → Spanish → Hindi). Finish all four stations.
        </p>
      </header>

      <section className="vocab-organize-pool" aria-label="Jumbled pictures and words">
        <p className="vocab-organize-pool-label">Jumbled at the top</p>
        {poolImages.length ? (
          <div className="vocab-organize-pool-grid is-images">
            {poolImages.map((piece) => {
              const term = byId.get(piece.termId)
              if (!term) return null
              const img = pathwayImage(term.imageKey)
              const active = selectedKey === piece.key
              return (
                <button
                  key={piece.key}
                  type="button"
                  className={`vocab-organize-piece is-image${active ? ' is-selected' : ''}`}
                  onClick={() => selectPiece(piece)}
                  aria-pressed={active}
                  aria-label={`Picture for ${term.english}`}
                >
                  {img ? (
                    <img src={img} alt="" />
                  ) : (
                    <span className="vocab-organize-emoji" aria-hidden>
                      {term.emoji}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ) : null}
        {poolGlosses.length ? (
          <div className="vocab-organize-pool-grid is-glosses">
            {poolGlosses.map((piece) => {
              const term = byId.get(piece.termId)
              if (!term) return null
              const active = selectedKey === piece.key
              return (
                <button
                  key={piece.key}
                  type="button"
                  className={`vocab-organize-piece is-gloss${active ? ' is-selected' : ''}`}
                  onClick={() => selectPiece(piece)}
                  aria-pressed={active}
                  aria-label={`${piece.lang} word for ${term.english}`}
                >
                  <span className="vocab-organize-piece-lang">{piece.lang}</span>
                  <span className="vocab-organize-piece-word">{term.gloss[piece.lang]}</span>
                </button>
              )
            })}
          </div>
        ) : null}
        {!pool.length ? (
          <p className="alert ok">All pieces placed — check the stations, then pass the page.</p>
        ) : null}
      </section>

      <div className="vocab-organize-boards">
        {terms.map((term) => {
          const imgSlot: ImageSlot = { kind: 'image', termId: term.id }
          const imgKey = slotKey(imgSlot)
          const imgPiece = placements[imgKey]
          const imgSrc = pathwayImage(term.imageKey)
          return (
            <section key={term.id} className="vocab-organize-board" aria-label={`Station ${term.english}`}>
              <h3 className="vocab-organize-english">{term.english}</h3>

              <button
                type="button"
                className={`vocab-organize-slot is-image${shakeSlot === imgKey ? ' is-shake' : ''}${
                  imgPiece ? ' is-filled' : ''
                }${selected ? ' is-target' : ''}`}
                onClick={() => {
                  if (imgPiece && !selected) {
                    selectPiece(imgPiece)
                    return
                  }
                  if (imgPiece && selected && selected.key === imgPiece.key) {
                    returnPieceToPool(imgPiece)
                    setSelectedKey(null)
                    return
                  }
                  placeOnSlot(imgSlot)
                }}
                aria-label={`Picture box for ${term.english}`}
              >
                {imgPiece && imgPiece.kind === 'image' ? (
                  imgSrc ? (
                    <img src={imgSrc} alt="" />
                  ) : (
                    <span className="vocab-organize-emoji">{term.emoji}</span>
                  )
                ) : (
                  <span className="vocab-organize-slot-hint">Empty picture box</span>
                )}
              </button>

              <ol className="vocab-organize-lang-list">
                {VOCAB_SHEET_LANGS.map((lang, i) => {
                  const slot: GlossSlot = { kind: 'gloss', termId: term.id, lang }
                  const key = slotKey(slot)
                  const piece = placements[key]
                  return (
                    <li key={lang}>
                      <span className="vocab-organize-lang-order">{i + 1}</span>
                      <span className="vocab-organize-lang-name">{lang}</span>
                      <button
                        type="button"
                        className={`vocab-organize-slot is-gloss${shakeSlot === key ? ' is-shake' : ''}${
                          piece ? ' is-filled' : ''
                        }${selected ? ' is-target' : ''}`}
                        onClick={() => {
                          if (piece && !selected) {
                            selectPiece(piece)
                            return
                          }
                          if (piece && selected && selected.key === piece.key) {
                            returnPieceToPool(piece)
                            setSelectedKey(null)
                            return
                          }
                          placeOnSlot(slot)
                        }}
                        aria-label={`${lang} word box for ${term.english}`}
                      >
                        {piece && piece.kind === 'gloss' ? (
                          <span className="vocab-organize-slot-word">{term.gloss[lang]}</span>
                        ) : (
                          <span className="vocab-organize-slot-hint">{lang} word</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>

      <div className="vocab-organize-actions">
        <button type="button" className="btn btn-secondary on-light" onClick={reshuffle}>
          Re-jumble pieces
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!allCorrect}
          onClick={checkPage}
        >
          {allCorrect ? 'Pass this page' : `Organize all four (${filledCount}/${totalSlots})`}
        </button>
      </div>
    </article>
  )
}
