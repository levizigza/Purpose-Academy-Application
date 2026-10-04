import { useRef, useState } from 'react'
import type { SupportLang } from './journeyCurriculum'
import {
  ASSESSMENT_COPY,
  CAREER_INTEREST_ITEMS,
  CAREER_STYLE_ITEMS,
  LIKERT_OPTIONS,
  PATHWAY_RESULT,
  RIASEC_LABELS,
  hollandCode,
  pathwayFitPercent,
  rankedPathways,
  type AssessmentScores,
  type LikertValue,
  type PathwayId,
  type PathwayScores,
  t,
} from './careerAssessment'

type InterestProps = {
  lang: SupportLang
  answers: Record<string, LikertValue>
  onChange: (id: string, value: LikertValue) => void
  onComplete: (answers: Record<string, LikertValue>) => void
  onBack?: () => void
}

/** Part 1 — RIASEC-style activity ratings, one question at a time, mother tongue only. */
export function CareerInterestAssessment({ lang, onComplete, onBack }: InterestProps) {
  const items = CAREER_INTEREST_ITEMS
  const [idx, setIdx] = useState(0)
  const [local, setLocal] = useState<Record<string, LikertValue>>({})
  const localRef = useRef(local)
  localRef.current = local
  const item = items[Math.min(idx, items.length - 1)]
  const current = local[item.id]

  function select(value: LikertValue) {
    setLocal((prev) => {
      const next = { ...prev, [item.id]: value }
      localRef.current = next
      return next
    })
    setIdx((i) => {
      if (i >= items.length - 1) {
        queueMicrotask(() => onComplete({ ...localRef.current, [item.id]: value }))
        return i
      }
      return i + 1
    })
  }

  return (
    <div className="career-assess" data-assess-idx={idx}>
      <header className="career-assess-head">
        <p className="career-assess-kicker">{t(ASSESSMENT_COPY.introTitle, lang)}</p>
        <h2 className="career-assess-title">{t(ASSESSMENT_COPY.part1Hint, lang)}</h2>
        <p className="career-assess-progress" aria-live="polite">
          {t(ASSESSMENT_COPY.progress, lang)} {idx + 1} {t(ASSESSMENT_COPY.of, lang)} {items.length}
        </p>
        <div className="career-assess-bar" aria-hidden>
          <span style={{ width: `${Math.round(((idx + (current ? 1 : 0)) / items.length) * 100)}%` }} />
        </div>
      </header>

      <article className="career-assess-card" key={item.id}>
        <p className="career-assess-prompt">{item.text[lang]}</p>
        <div className="career-likert" role="radiogroup" aria-label={item.text[lang]}>
          {LIKERT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={current === opt.value}
              className={`career-likert-btn tone-${opt.value}${current === opt.value ? ' is-selected' : ''}`}
              onClick={() => select(opt.value)}
            >
              <span className="career-likert-num">{opt.value}</span>
              <span className="career-likert-label">{opt.label[lang]}</span>
            </button>
          ))}
        </div>
      </article>

      <div className="career-assess-actions">
        {onBack && idx === 0 && (
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            ←
          </button>
        )}
        {idx > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            ←
          </button>
        )}
      </div>
    </div>
  )
}

type StyleProps = {
  lang: SupportLang
  answers: Record<string, string>
  onChange: (id: string, optionId: string) => void
  onComplete: (answers: Record<string, string>) => void
  onBack?: () => void
}

/** Part 2 — work-style forced choices in mother tongue. */
export function CareerStyleAssessment({ lang, onComplete, onBack }: StyleProps) {
  const items = CAREER_STYLE_ITEMS
  const [idx, setIdx] = useState(0)
  const [local, setLocal] = useState<Record<string, string>>({})
  const localRef = useRef(local)
  localRef.current = local
  const item = items[Math.min(idx, items.length - 1)]
  const current = local[item.id]

  function pick(optionId: string) {
    setLocal((prev) => {
      const next = { ...prev, [item.id]: optionId }
      localRef.current = next
      return next
    })
    setIdx((i) => {
      if (i >= items.length - 1) {
        queueMicrotask(() => onComplete({ ...localRef.current, [item.id]: optionId }))
        return i
      }
      return i + 1
    })
  }

  return (
    <div className="career-assess" data-assess-idx={idx}>
      <header className="career-assess-head">
        <p className="career-assess-kicker">{t(ASSESSMENT_COPY.introTitle, lang)}</p>
        <h2 className="career-assess-title">{t(ASSESSMENT_COPY.part2Title, lang)}</h2>
        <p className="career-assess-lede">{t(ASSESSMENT_COPY.part2Hint, lang)}</p>
        <p className="career-assess-progress" aria-live="polite">
          {t(ASSESSMENT_COPY.progress, lang)} {idx + 1} {t(ASSESSMENT_COPY.of, lang)} {items.length}
        </p>
        <div className="career-assess-bar" aria-hidden>
          <span style={{ width: `${Math.round(((idx + (current ? 1 : 0)) / items.length) * 100)}%` }} />
        </div>
      </header>

      <article className="career-assess-card" key={item.id}>
        <p className="career-assess-prompt">{item.prompt[lang]}</p>
        <div className="career-choice-stack">
          {item.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`career-choice${current === opt.id ? ' is-selected' : ''}`}
              onClick={() => pick(opt.id)}
            >
              {opt.label[lang]}
            </button>
          ))}
        </div>
      </article>

      <div className="career-assess-actions">
        {idx > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            ←
          </button>
        ) : (
          onBack && (
            <button type="button" className="btn btn-ghost" onClick={onBack}>
              ←
            </button>
          )
        )}
      </div>
    </div>
  )
}

type ResultProps = {
  lang: SupportLang
  pathway: PathwayId
  riasec: AssessmentScores
  pathwayScores: PathwayScores
  ranked: (keyof AssessmentScores)[]
  busy?: boolean
  error?: string | null
  onContinue: () => void
  onBack?: () => void
}

/** Professional-style results report in mother tongue. */
export function CareerAssessmentResult({
  lang,
  pathway,
  riasec,
  pathwayScores,
  ranked,
  busy,
  error,
  onContinue,
  onBack,
}: ResultProps) {
  const result = PATHWAY_RESULT[pathway]
  const top3 = ranked.slice(0, 3)
  const code = hollandCode(riasec)
  const fit = pathwayFitPercent(pathwayScores)
  const pathwayOrder = rankedPathways(pathwayScores)

  return (
    <div className="career-result">
      <header className="career-result-head">
        <p className="career-assess-kicker">{t(ASSESSMENT_COPY.resultTitle, lang)}</p>
        <h2 className="career-result-title">{t(result.title, lang)}</h2>
        <p className="career-result-lead">{t(ASSESSMENT_COPY.resultLead, lang)}</p>
      </header>

      <section className="career-code" aria-label={t(ASSESSMENT_COPY.yourCode, lang)}>
        <p className="career-code-label">{t(ASSESSMENT_COPY.yourCode, lang)}</p>
        <p className="career-code-value" aria-live="polite">
          {code}
        </p>
        <p className="career-code-hint">{t(ASSESSMENT_COPY.codeHint, lang)}</p>
        <ul className="career-code-areas">
          {top3.map((area) => (
            <li key={area}>
              <strong>{area}</strong>: {t(RIASEC_LABELS[area], lang)}
            </li>
          ))}
        </ul>
      </section>

      <p className="career-result-summary">{t(result.summary, lang)}</p>

      <div className="career-result-badge">{t(ASSESSMENT_COPY.openNow, lang)}</div>

      <section className="career-fit" aria-label={t(ASSESSMENT_COPY.pathwayFit, lang)}>
        <h3 className="career-section-title">{t(ASSESSMENT_COPY.pathwayFit, lang)}</h3>
        {pathwayOrder.map((id) => (
          <div key={id} className={`career-profile-row${id === pathway ? ' is-top' : ''}`}>
            <span className="career-profile-label">{t(PATHWAY_RESULT[id].title, lang)}</span>
            <div className="career-profile-track">
              <span style={{ width: `${fit[id]}%` }} />
            </div>
            <span className="career-profile-pct">{fit[id]}%</span>
          </div>
        ))}
      </section>

      <section className="career-profile" aria-label={t(ASSESSMENT_COPY.profileAreas, lang)}>
        <h3 className="career-section-title">{t(ASSESSMENT_COPY.profileAreas, lang)}</h3>
        {(Object.keys(riasec) as (keyof AssessmentScores)[]).map((area) => (
          <div key={area} className={`career-profile-row${top3.includes(area) ? ' is-top' : ''}`}>
            <span className="career-profile-label">{t(RIASEC_LABELS[area], lang)}</span>
            <div className="career-profile-track">
              <span style={{ width: `${riasec[area]}%` }} />
            </div>
            <span className="career-profile-pct">{riasec[area]}%</span>
          </div>
        ))}
      </section>

      <section aria-label={t(ASSESSMENT_COPY.strengthsTitle, lang)}>
        <h3 className="career-section-title">{t(ASSESSMENT_COPY.strengthsTitle, lang)}</h3>
        <ul className="career-strengths">
          {result.strengths.map((s, i) => (
            <li key={i}>{t(s, lang)}</li>
          ))}
        </ul>
      </section>

      {error && <div className="alert error">{error}</div>}

      <div className="career-assess-actions">
        {onBack && (
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            ←
          </button>
        )}
        <button type="button" className="btn btn-primary" disabled={busy} onClick={onContinue}>
          {busy ? '…' : t(ASSESSMENT_COPY.continueVocab, lang)}
        </button>
      </div>
    </div>
  )
}
