import { useState } from 'react'
import type { SupportLang } from './journeyCurriculum'
import {
  ASSESSMENT_COPY,
  CAREER_INTEREST_ITEMS,
  CAREER_STYLE_ITEMS,
  LIKERT_OPTIONS,
  PATHWAY_RESULT,
  RIASEC_LABELS,
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
export function CareerInterestAssessment({ lang, answers, onChange, onComplete, onBack }: InterestProps) {
  const items = CAREER_INTEREST_ITEMS
  const firstUnanswered = items.findIndex((i) => !answers[i.id])
  const [idx, setIdx] = useState(firstUnanswered >= 0 ? firstUnanswered : 0)
  const [local, setLocal] = useState(answers)
  const item = items[idx]
  const current = local[item.id]

  function goNext() {
    if (idx < items.length - 1) {
      setIdx(idx + 1)
      return
    }
    onComplete(local)
  }

  function select(value: LikertValue) {
    const next = { ...local, [item.id]: value }
    setLocal(next)
    onChange(item.id, value)
  }

  return (
    <div className="career-assess">
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
          <button type="button" className="btn btn-ghost" onClick={() => setIdx(idx - 1)}>
            ←
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          disabled={!current}
          onClick={goNext}
        >
          {idx >= items.length - 1 ? t(ASSESSMENT_COPY.next, lang) : t(ASSESSMENT_COPY.next, lang)}
        </button>
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
export function CareerStyleAssessment({ lang, answers, onChange, onComplete, onBack }: StyleProps) {
  const items = CAREER_STYLE_ITEMS
  const firstUnanswered = items.findIndex((i) => !answers[i.id])
  const [idx, setIdx] = useState(firstUnanswered >= 0 ? firstUnanswered : 0)
  const [local, setLocal] = useState(answers)
  const item = items[idx]
  const current = local[item.id]

  function goNext() {
    if (idx < items.length - 1) {
      setIdx(idx + 1)
      return
    }
    onComplete(local)
  }

  function pick(optionId: string) {
    const next = { ...local, [item.id]: optionId }
    setLocal(next)
    onChange(item.id, optionId)
  }

  return (
    <div className="career-assess">
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
          <button type="button" className="btn btn-ghost" onClick={() => setIdx(idx - 1)}>
            ←
          </button>
        ) : (
          onBack && (
            <button type="button" className="btn btn-ghost" onClick={onBack}>
              ←
            </button>
          )
        )}
        <button type="button" className="btn btn-primary" disabled={!current} onClick={goNext}>
          {idx >= items.length - 1 ? t(ASSESSMENT_COPY.seeResults, lang) : t(ASSESSMENT_COPY.next, lang)}
        </button>
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
  ranked,
  busy,
  error,
  onContinue,
  onBack,
}: ResultProps) {
  const result = PATHWAY_RESULT[pathway]
  const top3 = ranked.slice(0, 3)

  return (
    <div className="career-result">
      <header className="career-result-head">
        <p className="career-assess-kicker">{t(ASSESSMENT_COPY.resultTitle, lang)}</p>
        <h2 className="career-result-title">{t(result.title, lang)}</h2>
        <p className="career-result-lead">{t(ASSESSMENT_COPY.resultLead, lang)}</p>
      </header>

      <p className="career-result-summary">{t(result.summary, lang)}</p>

      <div className="career-result-badge">{t(ASSESSMENT_COPY.openNow, lang)}</div>

      <section className="career-profile" aria-label={t(ASSESSMENT_COPY.resultTitle, lang)}>
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

      <ul className="career-strengths">
        {result.strengths.map((s, i) => (
          <li key={i}>{t(s, lang)}</li>
        ))}
      </ul>

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
