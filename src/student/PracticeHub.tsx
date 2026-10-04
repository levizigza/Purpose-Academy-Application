import { useEffect, useState } from 'react'
import { JOURNEY_STEPS, LEARNING_UNITS, UNIT_GOALS, unitForStep } from './journeyCurriculum'
import {
  canAdvanceFromStep,
  getMasteryLevel,
  getPlatformStats,
  masteryLabel,
  overallMasteryPercent,
  SKILL_BY_STEP,
  unitMasteryPercent,
  type MasteryLevel,
} from './learningMastery'
import { PRACTICE_ENTRY_STEP } from '../practice/PracticeMode'

type Props = {
  currentStep: number
  onOpenLesson: (step: number) => void
  onContinue: () => void
}

function stepsInUnit(unitId: number) {
  return JOURNEY_STEPS.filter((s) => s.unit === unitId).map((s) => s.n)
}

function levelTone(level: MasteryLevel) {
  return `ph-level is-${level}`
}

/**
 * Duolingo/Khan-style learning home for Practice Mode.
 * Full curriculum map, XP, streak, and jump-into unlocked lessons.
 */
export function PracticeHub({ currentStep, onOpenLesson, onContinue }: Props) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-mastery-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-mastery-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [])

  const stats = getPlatformStats()
  const overall = overallMasteryPercent()
  const resumeStep = Math.max(currentStep, PRACTICE_ENTRY_STEP)
  const unit = unitForStep(resumeStep)
  const resumeMeta = JOURNEY_STEPS[resumeStep - 1]

  return (
    <div className="shell-main practice-hub">
      <header className="ph-hero">
        <p className="ph-kicker">Practice Mode · Full school platform</p>
        <h1>Your learning path</h1>
        <p className="ph-lede">
          Same units, drills, mastery gates, and checkpoints learners use. Work each station until the skill is
          Familiar, then move on.
        </p>
        <div className="ph-stat-row" aria-label="Learning stats">
          <div className="ph-stat">
            <strong>{stats.xp}</strong>
            <span>XP</span>
          </div>
          <div className="ph-stat">
            <strong>{stats.dayStreak}</strong>
            <span>Day streak</span>
          </div>
          <div className="ph-stat">
            <strong>{overall}%</strong>
            <span>Path mastery</span>
          </div>
          <div className="ph-stat">
            <strong>{stats.lessonsCompleted}</strong>
            <span>Lessons done</span>
          </div>
        </div>
        <div className="ph-continue-row">
          <button type="button" className="btn btn-primary" onClick={onContinue}>
            Continue Unit {unit.id}: {unit.label}
          </button>
          <p className="ph-gate-note">
            Resume step {resumeStep}: {resumeMeta?.title}. Inside each lesson, keep practising until the skill is
            Familiar before the next station unlocks.
          </p>
        </div>
      </header>

      <ol className="ph-units">
        {LEARNING_UNITS.map((u) => {
          const steps = stepsInUnit(u.id)
          const first = steps[0]
          const last = steps[steps.length - 1]
          const practiceFirst = Math.max(first, PRACTICE_ENTRY_STEP)
          const state =
            currentStep > last ? 'done' : currentStep >= first && currentStep <= last ? 'current' : currentStep < first ? 'locked' : 'done'
          const pct = unitMasteryPercent(steps)
          const goal = UNIT_GOALS[u.id]
          const unitLocked = u.id === 1 || (first < PRACTICE_ENTRY_STEP && last < PRACTICE_ENTRY_STEP)

          return (
            <li key={u.id} className={`ph-unit is-${unitLocked ? 'skipped' : state}`}>
              <div className="ph-unit-head">
                <div className="ph-unit-badge" aria-hidden>
                  {state === 'done' && !unitLocked ? '✓' : u.id}
                </div>
                <div>
                  <h2>
                    Unit {u.id}: {u.label}
                  </h2>
                  <p>{goal?.goal}</p>
                  {unitLocked ? (
                    <em className="ph-skip">Skipped in Practice Mode (registration)</em>
                  ) : (
                    <em>{pct}% unit mastery · Steps {u.range}</em>
                  )}
                </div>
              </div>
              {!unitLocked && (
                <ol className="ph-lessons">
                  {steps
                    .filter((n) => n >= PRACTICE_ENTRY_STEP)
                    .map((n) => {
                      const meta = JOURNEY_STEPS[n - 1]
                      const skill = SKILL_BY_STEP[n]
                      const level = skill ? getMasteryLevel(skill) : 'locked'
                      const unlocked = n <= Math.max(currentStep, practiceFirst)
                      const isCurrent = n === currentStep
                      return (
                        <li key={n} className={`ph-lesson${isCurrent ? ' is-current' : ''}${unlocked ? '' : ' is-locked'}`}>
                          <button
                            type="button"
                            disabled={!unlocked}
                            onClick={() => onOpenLesson(n)}
                            aria-label={`${meta.title}, ${masteryLabel(level)}`}
                          >
                            <span className={levelTone(unlocked ? (level === 'locked' ? 'attempted' : level) : 'locked')} />
                            <span className="ph-lesson-copy">
                              <strong>
                                {n}. {meta.title}
                              </strong>
                              <span>
                                {isCurrent
                                  ? 'You are here'
                                  : unlocked
                                    ? masteryLabel(level === 'locked' ? 'attempted' : level)
                                    : 'Locked'}
                              </span>
                            </span>
                            <span className="ph-lesson-action">{unlocked ? (isCurrent ? 'Resume' : 'Open') : 'Locked'}</span>
                          </button>
                        </li>
                      )
                    })}
                </ol>
              )}
              {goal && !unitLocked && (
                <ul className="ph-outcomes">
                  {goal.outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>

      <aside className="ph-footnote">
        <p>
          Platform pattern: learn → try → feedback → retry until Familiar → unit checkpoint → next unit. Reviewer
          feedback chat stays available at unit ends.
        </p>
        <button type="button" className="btn btn-secondary on-light" onClick={onContinue}>
          Enter current lesson
        </button>
      </aside>
    </div>
  )
}

/** Compact XP / streak strip inside the lesson shell. */
export function PracticeStatsStrip({ step }: { step: number }) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-mastery-changed', sync)
    return () => window.removeEventListener('pa-mastery-changed', sync)
  }, [])
  const stats = getPlatformStats()
  const overall = overallMasteryPercent()
  const ready = canAdvanceFromStep(step)
  return (
    <div className="practice-stats-strip" aria-label="Practice stats">
      <span>
        <strong>{stats.xp}</strong> XP
      </span>
      <span>
        <strong>{stats.dayStreak}</strong> streak
      </span>
      <span>
        <strong>{overall}%</strong> mastery
      </span>
      <span className={ready ? 'is-ready' : 'is-locked'}>
        {ready ? 'Lesson ready to advance' : 'Practise to Familiar'}
      </span>
    </div>
  )
}
