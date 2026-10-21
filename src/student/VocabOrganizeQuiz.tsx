import { useMemo, useState } from 'react'
import type { VocabTerm } from './journeyCurriculum'
import { pathwayImage } from '../pathways'
import { VOCAB_SHEET_LANGS } from './VocabSheet'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'
import { specialtyVocabPool } from './vocabDistractors'

/** Four word-to-picture matches on one page. */
export const ORGANIZE_PAGE_SIZE = 4

type Pick = { kind: 'image' | 'word'; termId: string }

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
  onSkip?: () => void
}

/** Match a picture to the English word that already shows its other-language names. */
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
    const wordId = picked.kind === 'word' ? picked.termId : next.termId
    if (imageId !== wordId) {
      setShakeId(wordId)
      playFoley('wrong')
      recordSkillAttempt('vocab-organize', false, 0)
      window.setTimeout(() => setShakeId(null), 380)
      setPicked(null)
      return
    }

    const nextMatched = { ...matched, [wordId]: true as const }
    setMatched(nextMatched)
    setPicked(null)
    playFoley('correct')
    recordSkillAttempt('vocab-organize', true, 8)
    if (Object.keys(nextMatched).length === terms.length) {
      window.setTimeout(() => {
        setPassed(true)
        recordSkillAttempt('vocab-organize', true, 24)
      }, 400)
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
        <p className="section-kicker">Language organize · Passed</p>
        <div className="vocab-organize-pass-badge" aria-hidden>✓</div>
        <h2>Pictures matched to the words</h2>
        <p className="lede">Next: find the same words in Eye Spy.</p>
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
          {matchedCount} of {terms.length} matched
          {picked
            ? picked.kind === 'image'
              ? ' · Picture selected — tap the word'
              : ' · Word selected — tap the picture'
            : ' · Tap a picture, then tap its word'}
        </p>
      </header>

      <section className="vocab-organize-pool" aria-label="Pictures">
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
                aria-label="Picture"
              >
                {img ? <img src={img} alt="" /> : <span className="vocab-organize-emoji">{term.emoji}</span>}
              </button>
            )
          })}
        </div>
      </section>

      <div className="vocab-organize-words">
        {terms.map((term) => {
          const done = Boolean(matched[term.id])
          const selected = picked?.kind === 'word' && picked.termId === term.id
          const img = pathwayImage(term.imageKey)
          return (
            <button
              key={term.id}
              type="button"
              className={`vocab-organize-word${done ? ' is-matched' : ''}${
                selected ? ' is-selected' : ''
              }${shakeId === term.id ? ' is-shake' : ''}`}
              data-term-id={term.id}
              onClick={() => choose({ kind: 'word', termId: term.id })}
              aria-pressed={selected}
              disabled={done}
              aria-label={`${term.english}. ${VOCAB_SHEET_LANGS.map((lang) => term.gloss[lang]).join(', ')}`}
            >
              {done ? (
                <span className="vocab-organize-word-photo">
                  {img ? <img src={img} alt="" /> : <span className="vocab-organize-emoji">{term.emoji}</span>}
                </span>
              ) : null}
              <span className="vocab-organize-word-copy">
                <strong className="vocab-organize-english">{term.english}</strong>
                <span className="vocab-organize-glosses">
                  {VOCAB_SHEET_LANGS.map((lang) => (
                    <span key={lang} className="vocab-organize-gloss">
                      <em>{lang}</em>
                      {term.gloss[lang]}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="vocab-organize-actions">
        <button type="button" className="btn btn-secondary on-light" onClick={reshuffle}>
          Mix pictures again
        </button>
      </div>
    </article>
  )
}
