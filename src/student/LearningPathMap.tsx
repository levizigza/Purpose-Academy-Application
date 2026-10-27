import { useEffect, useState } from 'react'
import { LEARNING_UNITS, unitForStep } from './journeyCurriculum'
import { getPathwayJourneySteps } from '../pathways'
import {
  getMasteryLevel,
  getPlatformStats,
  masteryLabel,
  SKILL_BY_STEP,
  type MasteryLevel,
} from './learningMastery'

type Props = {
  currentStep: number
  practice?: boolean
  compact?: boolean
  /** Collapse the full unit list so the lesson stays above the fold (phone + practice review). */
  collapsedByDefault?: boolean
  onSelectLesson?: (step: number) => void
  onOpenHub?: () => void
}

function levelClass(level: MasteryLevel) {
  return `lp-node is-${level}`
}

/**
 * Linear learning path — units as stations, lessons as a clear “you are here” trail.
 * Practice marks serve craft (L4), not streak FOMO.
 */
export function LearningPathMap({
  currentStep,
  practice,
  compact,
  collapsedByDefault = false,
  onSelectLesson,
  onOpenHub,
}: Props) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-mastery-changed', sync)
    return () => window.removeEventListener('pa-mastery-changed', sync)
  }, [])

  const currentUnit = unitForStep(currentStep)
  const stats = getPlatformStats()

  return (
    <details
      className={`learning-path-map${compact ? ' is-compact' : ''}${practice ? ' is-practice' : ''}${
        collapsedByDefault ? ' is-fold' : ''
      }`}
      aria-label="Learning path"
      open={collapsedByDefault ? undefined : true}
    >
      <summary className="lp-fold-summary">
        <span className="lp-kicker">{practice ? 'Student Practice · path' : 'Your learning path'}</span>
        <strong className="lp-fold-title">
          Unit {currentUnit.id}: {currentUnit.label}
        </strong>
        <span className="lp-fold-meta">
          This stretch
          {practice ? ` · ${stats.dayStreak} days showed up` : ''}
          {' · '}
          {collapsedByDefault ? 'Show full path' : 'Path'}
        </span>
      </summary>

      <header className="lp-head">
        <div>
          <p className="lp-kicker">{practice ? 'Student Practice · full school path' : 'Your learning path'}</p>
          <h2 className="lp-title">
            Unit {currentUnit.id}: {currentUnit.label}
          </h2>
        </div>
        <div className="lp-head-meta">
          <p className="lp-mastery" aria-label="Unit ready">
            Stations in this stretch
          </p>
          {practice && (
            <p className="lp-xp" aria-label="Practice marks">
              <strong>{stats.dayStreak}</strong> days showed up · keep going
            </p>
          )}
          {practice && onOpenHub && (
            <button type="button" className="lp-hub-btn" onClick={onOpenHub}>
              Path home
            </button>
          )}
        </div>
      </header>

      <ol className="lp-units">
        {LEARNING_UNITS.map((unit) => {
          const steps = stepsInUnit(unit.id)
          const first = steps[0]
          const last = steps[steps.length - 1]
          const state =
            currentStep > last ? 'done' : currentStep >= first && currentStep <= last ? 'current' : 'locked'
          /* Practice quality review: every unit/lesson is open so reviewers can jump without grinding. */
          const reviewOpen = Boolean(practice && onSelectLesson)
          const showLessons = reviewOpen || ((!compact || state === 'current') && state !== 'locked')
          return (
            <li key={unit.id} className={`lp-unit is-${reviewOpen && state === 'locked' ? 'upcoming' : state}`}>
              <div className="lp-unit-badge" aria-hidden>
                {state === 'done' ? '✓' : unit.id}
              </div>
              <div className="lp-unit-copy">
                <strong>{unit.label}</strong>
                <span>Steps {unit.range}</span>
                {(state !== 'locked' || reviewOpen) && <em>Open</em>}
              </div>
              {showLessons && (
                <ol className="lp-lessons">
                  {steps.map((n) => {
                    const meta = getPathwayJourneySteps()[n - 1]
                    const skill = SKILL_BY_STEP[n]
                    const level = skill ? getMasteryLevel(skill) : 'locked'
                    const lessonState =
                      n === currentStep ? 'current' : n < currentStep ? 'done' : 'upcoming'
                    const clickable = Boolean(onSelectLesson) && (reviewOpen || n <= currentStep)
                    const inner = (
                      <>
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
                                : reviewOpen
                                  ? 'Open for review'
                                  : 'Up next'}
                          </span>
                        </div>
                      </>
                    )
                    return (
                      <li key={n} className={`lp-lesson is-${lessonState}`}>
                        {clickable ? (
                          <button type="button" className="lp-lesson-btn" onClick={() => onSelectLesson?.(n)}>
                            {inner}
                          </button>
                        ) : (
                          inner
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
            </li>
          )
        })}
      </ol>
    </details>
  )
}

function stepsInUnit(unitId: number) {
  return getPathwayJourneySteps().filter((s) => s.unit === unitId).map((s) => s.n)
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
    <details className="unit-intro-card" aria-label={`Unit ${unitId} introduction`}>
      <summary className="unit-intro-summary">
        <span className="unit-intro-kicker">Unit {unit.id} · {unit.label}</span>
        <strong>Today’s work</strong>
        <span className="unit-intro-summary-hint">Tap to see</span>
      </summary>
      <p className="unit-intro-goal">{goal}</p>
      <ul className="unit-intro-outcomes">
        {outcomes.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
      <p className="unit-intro-method">
        Learn, try, get feedback, try again if you need. Then move forward.
      </p>
    </details>
  )
}
