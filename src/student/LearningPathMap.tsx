import { useEffect, useState } from 'react'
import { JOURNEY_STEPS, LEARNING_UNITS, unitForStep } from './journeyCurriculum'
import {
  getMasteryLevel,
  masteryLabel,
  SKILL_BY_STEP,
  unitMasteryPercent,
  type MasteryLevel,
} from './learningMastery'

type Props = {
  currentStep: number
  practice?: boolean
  compact?: boolean
}

function levelClass(level: MasteryLevel) {
  return `lp-node is-${level}`
}

/**
 * Duolingo-style linear learning path.
 * Shows units as stations and lessons as a clear “you are here” trail.
 */
export function LearningPathMap({ currentStep, practice, compact }: Props) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-mastery-changed', sync)
    return () => window.removeEventListener('pa-mastery-changed', sync)
  }, [])

  const currentUnit = unitForStep(currentStep)

  return (
    <section className={`learning-path-map${compact ? ' is-compact' : ''}`} aria-label="Learning path">
      <header className="lp-head">
        <div>
          <p className="lp-kicker">{practice ? 'Practice run · full school path' : 'Your learning path'}</p>
          <h2 className="lp-title">
            Unit {currentUnit.id}: {currentUnit.label}
          </h2>
        </div>
        <p className="lp-mastery" aria-label="Unit mastery">
          Unit mastery <strong>{unitMasteryPercent(stepsInUnit(currentUnit.id))}%</strong>
        </p>
      </header>

      <ol className="lp-units">
        {LEARNING_UNITS.map((unit) => {
          const steps = stepsInUnit(unit.id)
          const first = steps[0]
          const last = steps[steps.length - 1]
          const state =
            currentStep > last ? 'done' : currentStep >= first && currentStep <= last ? 'current' : 'locked'
          const pct = unitMasteryPercent(steps)
          return (
            <li key={unit.id} className={`lp-unit is-${state}`}>
              <div className="lp-unit-badge" aria-hidden>
                {state === 'done' ? '✓' : unit.id}
              </div>
              <div className="lp-unit-copy">
                <strong>{unit.label}</strong>
                <span>Steps {unit.range}</span>
                {state !== 'locked' && <em>{pct}% mastery</em>}
              </div>
              {!compact && state === 'current' && (
                <ol className="lp-lessons">
                  {steps.map((n) => {
                    const meta = JOURNEY_STEPS[n - 1]
                    const skill = SKILL_BY_STEP[n]
                    const level = skill ? getMasteryLevel(skill) : 'locked'
                    const lessonState =
                      n === currentStep ? 'current' : n < currentStep ? 'done' : 'upcoming'
                    return (
                      <li key={n} className={`lp-lesson is-${lessonState}`}>
                        <span className={levelClass(n < currentStep ? (level === 'locked' ? 'attempted' : level) : n === currentStep ? 'attempted' : 'locked')} />
                        <div>
                          <strong>
                            {n}. {meta.title}
                          </strong>
                          <span>
                            {n === currentStep
                              ? 'You are here'
                              : n < currentStep
                                ? masteryLabel(level === 'locked' ? 'attempted' : level)
                                : 'Up next'}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function stepsInUnit(unitId: number) {
  return JOURNEY_STEPS.filter((s) => s.unit === unitId).map((s) => s.n)
}

/** Short unit intro card shown when a learner enters a new unit. */
export function UnitIntroCard({
  unitId,
  goal,
  outcomes,
}: {
  unitId: number
  goal: string
  outcomes: string[]
}) {
  const unit = LEARNING_UNITS.find((u) => u.id === unitId) || LEARNING_UNITS[0]
  return (
    <article className="unit-intro-card" aria-label={`Unit ${unitId} introduction`}>
      <p className="unit-intro-kicker">Unit {unit.id} · {unit.label}</p>
      <h3>What you will learn</h3>
      <p className="unit-intro-goal">{goal}</p>
      <ul className="unit-intro-outcomes">
        {outcomes.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
      <p className="unit-intro-method">
        Pattern: learn, try, get feedback, retry until solid. Then move forward.
      </p>
    </article>
  )
}
