import { useMemo, useState } from 'react'
import type { VocabTerm } from './journeyCurriculum'
import { pathwayImage } from '../pathways'
import { VOCAB_SHEET_LANGS } from './VocabSheet'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'
import { specialtyVocabPool } from './vocabDistractors'

/** Four language-group + picture matches on one organize page. */
export const ORGANIZE_PAGE_SIZE = 4

type Pick = { kind: 'image' | 'section'; termId: string }

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

type Props = {
  terms: VocabTerm[]
  onPassed: () => void
  /** Practice quality-review: leave without finishing. */
  onSkip?: () => void
}

/**
 * Language Organize: each word is already a complete language section
 * (English + Amharic, Tigrinya, Arabic, Spanish, Hindi).
 * Match that whole section with its picture. Four correct matches pass the page.
 */
export function VocabOrganizeQuiz({ terms, onPassed, onSkip }: Props) {
  const byId = useMemo(() => new Map(terms.map((t) => [t.id, t])), [terms])
  const [imageOrder, setImageOrder] = useState(() => shuffle(terms.map((t) => t.id)))
  const [matched, setMatched] = useState<Record<string, true>>({})
  const [picked, setPicked] = useState<Pick | null>(null)
  const [shakeId, setShakeId] = useState<string | null>(null)
  const [passed, setPassed] = useState(false)
  const practice = isPracticeMode()

  const matchedCount = Object.keys(matched).length
  const leftoverImages = imageOrder.filter((id) => !matched[id])
  const allMatched = terms.length > 0 && matchedCount === terms.length

  function choose(next: Pick) {
    if (passed || matched[next.termId]) return

    if (!picked) {
      setPicked(next)
      playFoley('whoosh')
      return
    }

    if (picked.kind === next.kind && picked.termId === next.termId) {
      setPicked(null)
      return
    }

    if (picked.kind === next.kind) {
      setPicked(next)
      playFoley('whoosh')
      return
    }

    const imageId = picked.kind === 'image' ? picked.termId : next.termId
    const sectionId = picked.kind === 'section' ? picked.termId : next.termId
    if (imageId !== sectionId) {
      setShakeId(sectionId)
      playFoley('wrong')
      recordSkillAttempt('vocab-organize', false, 0)
      window.setTimeout(() => setShakeId(null), 380)
      setPicked(null)
      return
    }

    const nextMatched = { ...matched, [sectionId]: true as const }
    setMatched(nextMatched)
    setPicked(null)
    playFoley('correct')
    recordSkillAttempt('vocab-organize', true, 8)
    if (Object.keys(nextMatched).length === terms.length) {
      window.setTimeout(() => {
        setPassed(true)
        recordSkillAttempt('vocab-organize', true, 24)
      }, 480)
    }
  }

  function reshuffle() {
    if (passed) return
    setImageOrder(shuffle(terms.map((t) => t.id)))
    setMatched({})
    setPicked(null)
    setShakeId(null)
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
        <h2>Four language groups matched</h2>
        <p className="lede">
          Each picture sits with every language version of its word. Next you find the same words in Eye Spy.
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
          Match each language group to its picture · {matchedCount}/{terms.length}
          {picked
            ? picked.kind === 'image'
              ? ' · Picture selected — tap its language section'
              : ' · Language section selected — tap its picture'
            : ' · Tap a picture and the section with all of its language words'}
        </p>
        <p className="lede vocab-organize-help">
          Each section already has every version of one word: English, Amharic, Tigrinya, Arabic,
          Spanish, and Hindi. Pictures are mixed up at the top. Tap a picture, then tap the section
          that holds all of that word. Four matches pass the page.
        </p>
      </header>

      <section className="vocab-organize-pool" aria-label="Jumbled pictures">
        <p className="vocab-organize-pool-label">Jumbled pictures</p>
        {leftoverImages.length ? (
          <div className="vocab-organize-pool-grid is-images">
            {leftoverImages.map((termId) => {
              const term = byId.get(termId)
              if (!term) return null
              const img = pathwayImage(term.imageKey)
              const active = picked?.kind === 'image' && picked.termId === termId
              return (
                <button
                  key={termId}
                  type="button"
                  className={`vocab-organize-piece is-image${active ? ' is-selected' : ''}`}
                  data-term-id={termId}
                  onClick={() => choose({ kind: 'image', termId })}
                  aria-pressed={active}
                  aria-label="Picture to match"
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
        ) : (
          <p className="alert ok">Every picture is on a language section.</p>
        )}
      </section>

      <div className="vocab-organize-boards">
        {terms.map((term) => {
          const done = Boolean(matched[term.id])
          const selected = picked?.kind === 'section' && picked.termId === term.id
          const img = pathwayImage(term.imageKey)
          return (
            <button
              key={term.id}
              type="button"
              className={`vocab-organize-board${done ? ' is-matched' : ''}${
                selected ? ' is-selected' : ''
              }${shakeId === term.id ? ' is-shake' : ''}${picked ? ' is-target' : ''}`}
              data-term-id={term.id}
              onClick={() => choose({ kind: 'section', termId: term.id })}
              aria-pressed={selected}
              aria-label={
                done
                  ? `Matched language section for ${term.english}`
                  : `Language section: ${term.english} and five home-language names. Tap to match a picture.`
              }
              disabled={done}
            >
              <span className={`vocab-organize-slot is-image${done ? ' is-filled' : ''}`}>
                {done ? (
                  img ? (
                    <img src={img} alt="" />
                  ) : (
                    <span className="vocab-organize-emoji">{term.emoji}</span>
                  )
                ) : (
                  <span className="vocab-organize-slot-hint">Match the picture here</span>
                )}
              </span>

              <span className="vocab-organize-lang-pack">
                <span className="vocab-organize-lang-pack-label">All versions of this word</span>
                <ol className="vocab-organize-lang-list">
                  <li>
                    <span className="vocab-organize-lang-order">EN</span>
                    <span className="vocab-organize-lang-name">English</span>
                    <span className="vocab-organize-slot-word">{term.english}</span>
                  </li>
                  {VOCAB_SHEET_LANGS.map((lang, i) => (
                    <li key={lang}>
                      <span className="vocab-organize-lang-order">{i + 1}</span>
                      <span className="vocab-organize-lang-name">{lang}</span>
                      <span className="vocab-organize-slot-word">{term.gloss[lang]}</span>
                    </li>
                  ))}
                </ol>
              </span>
            </button>
          )
        })}
      </div>

      <div className="vocab-organize-actions">
        <button type="button" className="btn btn-secondary on-light" onClick={reshuffle}>
          Re-jumble pictures
        </button>
        <p className="train-vocab-counter" aria-live="polite">
          {allMatched ? 'Page ready' : `${matchedCount} of ${terms.length} sections matched`}
        </p>
      </div>
    </article>
  )
}
