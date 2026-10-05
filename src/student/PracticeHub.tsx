import { useEffect, useState, type CSSProperties } from 'react'
import { LEARNING_UNITS, unitForStep } from './journeyCurriculum'
import {
  canAdvanceFromStep,
  domainMasteryPercent,
  getMasteryLevel,
  getPlatformStats,
  masteryLabel,
  overallMasteryPercent,
  SKILL_BY_STEP,
  SKILL_DOMAINS,
  unitMasteryPercent,
  type MasteryLevel,
} from './learningMastery'
import { getPracticeName, PRACTICE_ENTRY_STEP } from '../practice/PracticeMode'
import {
  getActivePathway,
  getPathwayJourneySteps,
  getPathwayPack,
  pathwayIcon,
  pathwayMeta,
  pathwayPhoto,
  getPathwayUnitGoal,
} from '../pathways'
import { followUpSummary, loadFollowUp } from './employmentFollowUp'

type Props = {
  currentStep: number
  /** True after Employment Connection is finished in this practice run. */
  pathComplete?: boolean
  onOpenLesson: (step: number) => void
  onContinue: () => void
  onOpenPassport?: () => void
  onRestart?: () => void
}

type UnitState = 'done' | 'current' | 'locked' | 'skipped'

function stepsInUnit(unitId: number) {
  return getPathwayJourneySteps().filter((s) => s.unit === unitId).map((s) => s.n)
}

function levelTone(level: MasteryLevel) {
  return `ph-level is-${level}`
}

function unitState(unitId: number, currentStep: number): UnitState {
  const steps = stepsInUnit(unitId)
  const first = steps[0]
  const last = steps[steps.length - 1]
  if (unitId === 1 || (first < PRACTICE_ENTRY_STEP && last < PRACTICE_ENTRY_STEP)) return 'skipped'
  if (currentStep > last) return 'done'
  if (currentStep >= first && currentStep <= last) return 'current'
  if (currentStep < first) return 'locked'
  return 'done'
}

function MasteryMeter({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const radius = 46
  const circ = 2 * Math.PI * radius
  const offset = circ - (clamped / 100) * circ
  return (
    <div className="ph-meter" aria-label={label}>
      <svg viewBox="0 0 108 108" className="ph-meter-svg" aria-hidden>
        <circle className="ph-meter-track" cx="54" cy="54" r={radius} />
        <circle
          className="ph-meter-value"
          cx="54"
          cy="54"
          r={radius}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ph-meter-label">
        <strong>{clamped}%</strong>
        <span>Mastery</span>
      </div>
    </div>
  )
}

/**
 * Professional learning dashboard for Student Practice Mode.
 * Pathway-aware: same skeleton for Construction, Logistics, Community Support.
 */
export function PracticeHub({
  currentStep,
  pathComplete = false,
  onOpenLesson,
  onContinue,
  onOpenPassport,
  onRestart,
}: Props) {
  const [, bump] = useState(0)
  const [openUnits, setOpenUnits] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    for (const u of LEARNING_UNITS) {
      const state = unitState(u.id, currentStep)
      initial[u.id] = state === 'current' || state === 'done'
    }
    return initial
  })

  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-mastery-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    window.addEventListener('pa-pathway-changed', sync)
    window.addEventListener('pa-employment-followup-changed', sync)
    return () => {
      window.removeEventListener('pa-mastery-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
      window.removeEventListener('pa-pathway-changed', sync)
      window.removeEventListener('pa-employment-followup-changed', sync)
    }
  }, [])

  const pathwayId = getActivePathway()
  const meta = pathwayMeta(pathwayId)
  const pack = getPathwayPack(pathwayId)
  const journeySteps = getPathwayJourneySteps(pathwayId)
  const stats = getPlatformStats()
  const overall = overallMasteryPercent()
  const resumeStep = Math.max(currentStep, PRACTICE_ENTRY_STEP)
  const unit = unitForStep(resumeStep)
  const resumeMeta = journeySteps[resumeStep - 1]
  const practiceName = getPracticeName()
  const activeUnits = LEARNING_UNITS.filter((u) => unitState(u.id, currentStep) !== 'skipped')
  const completedUnits = activeUnits.filter((u) => unitState(u.id, currentStep) === 'done').length
  const unitSteps = stepsInUnit(unit.id).filter((n) => n >= PRACTICE_ENTRY_STEP)
  const unitDoneCount = unitSteps.filter((n) => n < currentStep).length
  const unitPct = unitMasteryPercent(stepsInUnit(unit.id))
  const freshStart = resumeStep === PRACTICE_ENTRY_STEP && stats.lessonsCompleted === 0 && overall === 0
  const followSummary = followUpSummary(loadFollowUp())
  const domains = [
    { label: pack.skillDomains.vocabulary, pct: domainMasteryPercent(SKILL_DOMAINS.vocabulary) },
    { label: pack.skillDomains.safety, pct: domainMasteryPercent(SKILL_DOMAINS.safety) },
    { label: pack.skillDomains.tools, pct: domainMasteryPercent(SKILL_DOMAINS.tools) },
    { label: pack.skillDomains.systems, pct: domainMasteryPercent(SKILL_DOMAINS.systems) },
    { label: 'Overall progress', pct: overall },
  ]

  function toggleUnit(id: number) {
    setOpenUnits((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const resumeLabel = pathComplete
    ? 'Review employment step'
    : freshStart
      ? 'Start path'
      : 'Resume lesson'
  const resumeChip = pathComplete ? 'Path complete' : `Step ${resumeStep} of 20`
  const resumeHeading = pathComplete
    ? 'Training path complete'
    : `Unit ${unit.id}: ${unit.label}`
  const resumeLesson = pathComplete
    ? `Skills Passport + ${followSummary.label}`
    : resumeMeta?.title

  return (
    <div
      className={`shell-main practice-hub is-${pathwayId}${pathComplete ? ' is-complete' : ''}`}
      style={{ '--ph-stream': meta.accent, '--ph-stream-soft': meta.soft } as CSSProperties}
    >
      <header className="ph-hero">
        <div className="ph-hero-copy">
          <p className="ph-kicker">Student Practice Mode</p>
          <h1>Learning dashboard</h1>
          <p className="ph-lede">
            {practiceName ? `${practiceName}, your` : 'Your'} {meta.programTitle} path: units, drills, mastery gates,
            and checkpoints. Reach Familiar on each station before advancing.
          </p>
          <div className="ph-pathway-badge">
            <img src={pathwayIcon(pathwayId)} alt="" />
            <div>
              <strong>{meta.programTitle}</strong>
              <span>{meta.tagline}</span>
            </div>
          </div>
        </div>

        <div className="ph-resume">
          <div className="ph-resume-media" aria-hidden>
            <img src={pathwayPhoto(pathwayId)} alt="" />
          </div>
          <div className="ph-resume-top">
            <p className="ph-resume-label">{pathComplete ? 'Finished' : freshStart ? 'Begin here' : 'Up next'}</p>
            <span className="ph-resume-chip">{resumeChip}</span>
          </div>
          <h2>{resumeHeading}</h2>
          <p className="ph-resume-lesson">{resumeLesson}</p>
          <div className="ph-resume-progress" aria-label={`${unitPct}% unit mastery`}>
            <div className="ph-resume-progress-track">
              <span style={{ width: `${pathComplete ? 100 : unitPct}%` }} />
            </div>
            <em>
              {pathComplete
                ? 'All units open for review · follow-up schedule active'
                : `${unitDoneCount}/${unitSteps.length} lessons started · ${unitPct}% mastery`}
            </em>
          </div>
          <div className="ph-resume-actions">
            <button type="button" className="btn btn-primary ph-resume-btn" onClick={onContinue}>
              {resumeLabel}
            </button>
            {pathComplete && onOpenPassport && (
              <button type="button" className="btn btn-secondary on-light" onClick={onOpenPassport}>
                Skills Passport
              </button>
            )}
            {pathComplete && onRestart && (
              <button type="button" className="btn btn-ghost" onClick={onRestart}>
                Start over
              </button>
            )}
          </div>
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

      <section className="ph-domains" aria-label="My progress">
        <div className="ph-section-head">
          <div>
            <h2>My progress</h2>
            <p>Skill domains for {meta.programTitle} — same structure on every pathway.</p>
          </div>
        </div>
        <ul className="ph-domain-list">
          {domains.map((d) => (
            <li key={d.label}>
              <div className="ph-domain-row">
                <span>{d.label}</span>
                <strong>{d.pct}%</strong>
              </div>
              <div className="ph-domain-track" aria-hidden>
                <span style={{ width: `${d.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ph-curriculum" aria-label="Curriculum">
        <div className="ph-section-head">
          <div>
            <h2>Curriculum path</h2>
            <p>Expand a unit to open lessons. Locked stations unlock as you advance.</p>
          </div>
          <ul className="ph-legend" aria-label="Mastery levels">
            <li>
              <span className="ph-level is-attempted" aria-hidden /> Attempted
            </li>
            <li>
              <span className="ph-level is-familiar" aria-hidden /> Familiar
            </li>
            <li>
              <span className="ph-level is-proficient" aria-hidden /> Proficient
            </li>
            <li>
              <span className="ph-level is-mastered" aria-hidden /> Mastered
            </li>
          </ul>
        </div>

        <p className="ph-skip-note">Registration (Unit 1) is skipped in Student Practice Mode. You start at Unit 2.</p>

        <ol className="ph-units">
          {LEARNING_UNITS.map((u) => {
            const steps = stepsInUnit(u.id)
            const state = unitState(u.id, currentStep)
            if (state === 'skipped') return null

            const pct = unitMasteryPercent(steps)
            const goal = getPathwayUnitGoal(u.id, pathwayId)
            const visibleSteps = steps.filter((n) => n >= PRACTICE_ENTRY_STEP)
            const expanded = Boolean(openUnits[u.id])
            const statusLabel =
              state === 'current' ? 'In progress' : state === 'done' ? 'Complete' : 'Upcoming'

            return (
              <li key={u.id} className={`ph-unit is-${state}${expanded ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="ph-unit-toggle"
                  aria-expanded={expanded}
                  onClick={() => toggleUnit(u.id)}
                >
                  <span className="ph-unit-badge" aria-hidden>
                    {state === 'done' ? '✓' : u.id}
                  </span>
                  <span className="ph-unit-titles">
                    <span className="ph-unit-title-row">
                      <strong>
                        Unit {u.id}: {u.label}
                      </strong>
                      <span className={`ph-status is-${state}`}>{statusLabel}</span>
                    </span>
                    <span className="ph-unit-goal">{goal?.goal}</span>
                    <span className="ph-unit-progress" aria-hidden>
                      <span className="ph-unit-progress-track">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                      <em>
                        {pct}% mastery · Steps {u.range}
                      </em>
                    </span>
                  </span>
                  <span className="ph-unit-chevron" aria-hidden>
                    {expanded ? '−' : '+'}
                  </span>
                </button>

                {expanded && (
                  <div className="ph-unit-body">
                    <ol className="ph-lessons">
                      {visibleSteps.map((n) => {
                        const stepMeta = journeySteps[n - 1]
                        const skill = SKILL_BY_STEP[n]
                        const level = skill ? getMasteryLevel(skill) : 'locked'
                        const unlocked =
                          state === 'done' ||
                          (state === 'current' && n <= Math.max(currentStep, PRACTICE_ENTRY_STEP))
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
                              aria-label={`${stepMeta.title}, ${masteryLabel(level)}`}
                            >
                              <span className={levelTone(shownLevel)} aria-hidden />
                              <span className="ph-lesson-copy">
                                <strong>
                                  {n}. {stepMeta.title}
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

                    {goal && state === 'current' && (
                      <ul className="ph-outcomes">
                        {goal.outcomes.map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
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
            then the next unit unlocks.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          {resumeLabel}
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
