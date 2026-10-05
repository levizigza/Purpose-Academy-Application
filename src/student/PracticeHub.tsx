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

function MasteryMeter({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const radius = 42
  const circ = 2 * Math.PI * radius
  const offset = circ - (clamped / 100) * circ
  return (
    <div className="ph-meter" aria-label={label}>
      <svg viewBox="0 0 100 100" className="ph-meter-svg" aria-hidden>
        <circle className="ph-meter-track" cx="50" cy="50" r={radius} />
        <circle
          className="ph-meter-value"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ph-meter-label">
        <strong>{clamped}%</strong>
        <span>Path mastery</span>
      </div>
    </div>
  )
}

/**
 * Professional learning dashboard for Student Practice Mode.
 * Clear progress, resume CTA, and a structured curriculum map.
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
  const activeUnits = LEARNING_UNITS.filter((u) => {
    const steps = stepsInUnit(u.id)
    return !(u.id === 1 || (steps[0] < PRACTICE_ENTRY_STEP && steps[steps.length - 1] < PRACTICE_ENTRY_STEP))
  })
  const completedUnits = activeUnits.filter((u) => {
    const last = stepsInUnit(u.id).at(-1) || 0
    return currentStep > last
  }).length

  return (
    <div className="shell-main practice-hub">
      <header className="ph-top">
        <div className="ph-top-copy">
          <p className="ph-kicker">Student Practice Mode</p>
          <h1>Learning dashboard</h1>
          <p className="ph-lede">
            Your full school path: units, drills, mastery gates, and checkpoints. Practise each station until the skill
            is Familiar, then move forward.
          </p>
        </div>
        <div className="ph-resume-card">
          <p className="ph-resume-label">Continue learning</p>
          <h2>
            Unit {unit.id}: {unit.label}
          </h2>
          <p>
            Step {resumeStep} · {resumeMeta?.title}
          </p>
          <button type="button" className="btn btn-primary" onClick={onContinue}>
            Resume lesson
          </button>
        </div>
      </header>

      <section className="ph-overview" aria-label="Progress overview">
        <MasteryMeter percent={overall} label={`Path mastery ${overall} percent`} />
        <div className="ph-metrics">
          <article className="ph-metric">
            <span className="ph-metric-label">Experience</span>
            <strong>{stats.xp}</strong>
            <span className="ph-metric-hint">XP earned</span>
          </article>
          <article className="ph-metric">
            <span className="ph-metric-label">Streak</span>
            <strong>{stats.dayStreak}</strong>
            <span className="ph-metric-hint">Active days</span>
          </article>
          <article className="ph-metric">
            <span className="ph-metric-label">Lessons</span>
            <strong>{stats.lessonsCompleted}</strong>
            <span className="ph-metric-hint">Completed</span>
          </article>
          <article className="ph-metric">
            <span className="ph-metric-label">Units</span>
            <strong>
              {completedUnits}/{activeUnits.length}
            </strong>
            <span className="ph-metric-hint">Cleared</span>
          </article>
        </div>
      </section>

      <section className="ph-curriculum" aria-label="Curriculum">
        <div className="ph-section-head">
          <h2>Curriculum path</h2>
          <p>Open any unlocked lesson. Locked stations open as you advance.</p>
        </div>

        <ol className="ph-units">
          {LEARNING_UNITS.map((u) => {
            const steps = stepsInUnit(u.id)
            const first = steps[0]
            const last = steps[steps.length - 1]
            const practiceFirst = Math.max(first, PRACTICE_ENTRY_STEP)
            const state =
              currentStep > last
                ? 'done'
                : currentStep >= first && currentStep <= last
                  ? 'current'
                  : currentStep < first
                    ? 'locked'
                    : 'done'
            const pct = unitMasteryPercent(steps)
            const goal = UNIT_GOALS[u.id]
            const unitLocked = u.id === 1 || (first < PRACTICE_ENTRY_STEP && last < PRACTICE_ENTRY_STEP)
            const visibleSteps = steps.filter((n) => n >= PRACTICE_ENTRY_STEP)

            return (
              <li key={u.id} className={`ph-unit is-${unitLocked ? 'skipped' : state}`}>
                <div className="ph-unit-rail" aria-hidden />
                <div className="ph-unit-body">
                  <header className="ph-unit-head">
                    <div className="ph-unit-badge" aria-hidden>
                      {state === 'done' && !unitLocked ? '✓' : u.id}
                    </div>
                    <div className="ph-unit-titles">
                      <div className="ph-unit-title-row">
                        <h3>
                          Unit {u.id}: {u.label}
                        </h3>
                        {!unitLocked && (
                          <span className={`ph-status is-${state}`}>
                            {state === 'current' ? 'In progress' : state === 'done' ? 'Complete' : 'Upcoming'}
                          </span>
                        )}
                        {unitLocked && <span className="ph-status is-skipped">Skipped</span>}
                      </div>
                      <p>{goal?.goal}</p>
                      {unitLocked ? (
                        <em className="ph-skip">Registration is skipped in Student Practice Mode</em>
                      ) : (
                        <div className="ph-unit-progress" aria-label={`${pct}% unit mastery`}>
                          <div className="ph-unit-progress-track">
                            <span style={{ width: `${pct}%` }} />
                          </div>
                          <em>
                            {pct}% mastery · Steps {u.range}
                          </em>
                        </div>
                      )}
                    </div>
                  </header>

                  {!unitLocked && (
                    <ol className="ph-lessons">
                      {visibleSteps.map((n) => {
                        const meta = JOURNEY_STEPS[n - 1]
                        const skill = SKILL_BY_STEP[n]
                        const level = skill ? getMasteryLevel(skill) : 'locked'
                        const unlocked = n <= Math.max(currentStep, practiceFirst)
                        const isCurrent = n === currentStep
                        const shownLevel = unlocked ? (level === 'locked' ? 'attempted' : level) : 'locked'
                        return (
                          <li
                            key={n}
                            className={`ph-lesson${isCurrent ? ' is-current' : ''}${unlocked ? '' : ' is-locked'}`}
                          >
                            <button
                              type="button"
                              disabled={!unlocked}
                              onClick={() => onOpenLesson(n)}
                              aria-label={`${meta.title}, ${masteryLabel(level)}`}
                            >
                              <span className={levelTone(shownLevel)} aria-hidden />
                              <span className="ph-lesson-copy">
                                <strong>
                                  {n}. {meta.title}
                                </strong>
                                <span>
                                  {isCurrent
                                    ? 'Current lesson'
                                    : unlocked
                                      ? masteryLabel(shownLevel)
                                      : 'Locked until previous lessons are complete'}
                                </span>
                              </span>
                              <span className="ph-lesson-action">
                                {unlocked ? (isCurrent ? 'Resume' : 'Open') : 'Locked'}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ol>
                  )}

                  {goal && !unitLocked && state === 'current' && (
                    <ul className="ph-outcomes">
                      {goal.outcomes.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <aside className="ph-footnote">
        <div>
          <h3>How progress works</h3>
          <p>
            Learn, practise, get feedback, and retry until a skill is Familiar. Unit checkpoints confirm the block,
            then the next unit unlocks. Feedback chat is available at unit ends.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onContinue}>
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
        {ready ? 'Ready to advance' : 'Practise to Familiar'}
      </span>
    </div>
  )
}
