import { useEffect, useState, type CSSProperties } from 'react'
import { JOURNEY_STEP_COUNT, LEARNING_UNITS, unitForStep } from './journeyCurriculum'
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
  PATHWAY_ORDER,
  setActivePathway,
  type PathwayId,
} from '../pathways'
import { followUpSummary, loadFollowUp } from './employmentFollowUp'

type Props = {
  currentStep: number
  /** True after Employment Connection is finished in this practice run. */
  pathComplete?: boolean
  /** Portal embeds the hub inside /app/student without a second shell-main. */
  surface?: 'practice' | 'portal'
  onOpenLesson: (step: number) => void
  onContinue: () => void
  onOpenPassport?: () => void
  onRestart?: () => void
  /** Dignified exit — anti-doomscroll. */
  onDoneForNow?: () => void
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
 * Professional learning dashboard for Practice.
 * Pathway-aware: same skeleton for Construction, Logistics, Community Support.
 */
export function PracticeHub({
  currentStep,
  pathComplete = false,
  surface = 'practice',
  onOpenLesson,
  onContinue,
  onOpenPassport,
  onRestart,
  onDoneForNow,
}: Props) {
  const portal = surface === 'portal'
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
  const freshStart =
    !pathComplete &&
    resumeStep === PRACTICE_ENTRY_STEP &&
    stats.lessonsCompleted === 0 &&
    stats.xp < 25
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
      ? "Open today's station"
      : "Enter today's station"
  const resumeChip = pathComplete ? 'Path complete' : `Station ${resumeStep} of ${JOURNEY_STEP_COUNT}`
  const resumeHeading = pathComplete
    ? 'Path complete — review with pride'
    : `Unit ${unit.id}: ${unit.label}`
  const resumeLesson = pathComplete
    ? `Skills Passport + ${followSummary.label}`
    : resumeMeta?.title
  const todayLine = pathComplete
    ? 'You finished the spine. Open employment follow-up when ready — no rush to scroll.'
    : `Finish this station before opening more: ${resumeMeta?.title ?? 'next lesson'}.`

  return (
    <div
      className={`${portal ? '' : 'shell-main '}practice-hub${portal ? ' is-portal' : ''} is-${pathwayId}${pathComplete ? ' is-complete' : ''}`}
      style={{ '--ph-stream': meta.accent, '--ph-stream-soft': meta.soft } as CSSProperties}
    >
      <header className="ph-hero">
        <div className="ph-hero-copy">
          <p className="ph-kicker">{portal ? 'School path · crew order' : 'Practice · crew order'}</p>
          <h1>{portal ? `Your ${JOURNEY_STEP_COUNT}-step path` : 'Your training path'}</h1>
          <p className="ph-lede">
            {portal
              ? `${practiceName || 'Learner'} — ${meta.programTitle}. One spine. One station at a time. Learn lessons are extra when built.`
              : `${practiceName ? `${practiceName}, ` : ''}${meta.programTitle}: clear stations, mastery gates, then the next unit. Reach Familiar before you advance.`}
          </p>
          <div className="ph-pathway-badge">
            <img src={pathwayIcon(pathwayId)} alt="" />
            <div>
              <strong>{meta.programTitle}</strong>
              <span>{meta.tagline}</span>
            </div>
          </div>
          <div className="ph-pathway-switch" role="group" aria-label="Choose practice pathway">
            <p className="ph-pathway-switch-label">Training pathway</p>
            <div className="ph-pathway-switch-row">
              {PATHWAY_ORDER.map((id: PathwayId) => {
                const m = pathwayMeta(id)
                const active = id === pathwayId
                return (
                  <button
                    key={id}
                    type="button"
                    className={`ph-pathway-switch-btn${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => {
                      if (id === pathwayId) return
                      setActivePathway(id)
                    }}
                  >
                    <img src={pathwayIcon(id)} alt="" />
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="ph-resume">
          <div className="ph-resume-media" aria-hidden>
            <img src={pathwayPhoto(pathwayId)} alt="" />
          </div>
          <div className="ph-resume-top">
            <p className="ph-resume-label">{pathComplete ? 'Finished' : freshStart ? 'Begin here' : "Today's station"}</p>
            <span className="ph-resume-chip">{resumeChip}</span>
          </div>
          <h2>{resumeHeading}</h2>
          <p className="ph-resume-lesson">{resumeLesson}</p>
          <p className="ph-today-line">{todayLine}</p>
          <div className="ph-resume-progress" aria-label={`${unitPct}% unit mastery`}>
            <div className="ph-resume-progress-track">
              <span style={{ width: `${pathComplete ? 100 : unitPct}%` }} />
            </div>
            <em>
              {pathComplete
                ? 'All units open for review · follow-up schedule active'
                : `${unitDoneCount}/${unitSteps.length} lessons in this unit · ${unitPct}% mastery`}
            </em>
          </div>
          <div className="ph-resume-actions">
            <button type="button" className="btn btn-primary ph-resume-btn" onClick={onContinue}>
              {resumeLabel}
            </button>
            {onDoneForNow && (
              <button type="button" className="btn btn-ghost ph-done-btn" onClick={onDoneForNow}>
                Done for now
              </button>
            )}
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

      <section className="ph-video-section ph-computer-section" aria-label="Basic Computer Skills">
        <div className="ph-video-section-inner ph-computer-section-inner">
          <p className="ph-video-section-kicker">Shared unit · all pathways</p>
          <h2>Basic Computer Skills</h2>
          <p>
            Its own unit on <strong>Construction, Logistics, and Community</strong> —{' '}
            <strong>Unit 6 · Basic Computer Skills</strong> (step 14). Twelve short lessons: turn on/off, mouse,
            folders, save, Word, and email. Watch, try, then one check.
          </p>
          <button
            type="button"
            className="btn btn-primary ph-video-section-btn"
            onClick={() => onOpenLesson(14)}
          >
            Open Unit 6 · Basic Computer Skills
          </button>
        </div>
      </section>

      <section className="ph-video-section" aria-label="Video section">
        <div className="ph-video-section-inner">
          <p className="ph-video-section-kicker">Video section</p>
          <h2>Warehouse Equipment</h2>
          <p>
            Fourteen machine lessons live in their own unit — <strong>Unit 8 · Video · Warehouse Equipment</strong>{' '}
            (step 18) on the <strong>Logistics</strong> pathway. Watch each video before hands-on training.
          </p>
          <button
            type="button"
            className="btn btn-primary ph-video-section-btn"
            onClick={() => {
              if (pathwayId !== 'logistics') setActivePathway('logistics')
              onOpenLesson(18)
            }}
          >
            {pathwayId === 'logistics'
              ? 'Open Video section · Warehouse Equipment'
              : 'Switch to Logistics · open Video section'}
          </button>
        </div>
      </section>

      <section className="ph-overview" aria-label="Practice marks">
        <MasteryMeter percent={overall} label={`Path mastery ${overall} percent`} />
        <div className="ph-metrics">
          <article className="ph-metric">
            <span className="ph-metric-label">Practice marks</span>
            <strong>{stats.xp}</strong>
            <span className="ph-metric-hint">Earned by finishing stations</span>
          </article>
          <article className="ph-metric ph-metric-quiet">
            <span className="ph-metric-label">Days showed up</span>
            <strong>{stats.dayStreak}</strong>
            <span className="ph-metric-hint">Consistency — not a streak trap</span>
          </article>
          <article className="ph-metric">
            <span className="ph-metric-label">Stations done</span>
            <strong>{stats.lessonsCompleted}</strong>
            <span className="ph-metric-hint">Completed lessons</span>
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

      <section className="ph-domains" aria-label="Skill domains">
        <div className="ph-section-head">
          <div>
            <h2>Craft strength</h2>
            <p>Skill domains for {meta.programTitle} — same order on every pathway.</p>
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

      <section className="ph-curriculum" aria-label="Station map">
        <div className="ph-section-head">
          <div>
            <h2>Station map</h2>
            <p>Expand a unit. Locked doors open when the station before is Familiar — not by scrolling past.</p>
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

        <p className="ph-skip-note">
          {portal
            ? 'Registration (Unit 1) is skipped — you already belong here. Training starts at language support.'
            : 'Registration (Unit 1) is skipped in Practice. You start at language support.'}
        </p>

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
              <li
                key={u.id}
                className={`ph-unit is-${state}${expanded ? ' is-open' : ''}${
                  u.id === 6 ? ' is-computer-unit' : ''
                }${u.id === 8 ? ' is-video-unit' : ''}`}
              >
                <button
                  type="button"
                  className="ph-unit-toggle"
                  aria-expanded={expanded}
                  onClick={() => toggleUnit(u.id)}
                >
                  <span className="ph-unit-badge" aria-hidden>
                    {state === 'done' ? '✓' : u.id === 6 ? 'C' : u.id === 8 ? '▶' : u.id}
                  </span>
                  <span className="ph-unit-titles">
                    <span className="ph-unit-title-row">
                      <strong>
                        {u.id === 6 || u.id === 8 ? u.label : `Unit ${u.id}: ${u.label}`}
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
                        /* Practice hub: all lessons open for aesthetic / quality review jumps. */
                        const unlocked = true
                        const isCurrent = n === currentStep
                        const shownLevel = level === 'locked' ? 'attempted' : level
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
                                    : masteryLabel(shownLevel)}
                                </span>
                              </span>
                              <span className="ph-lesson-action">
                                {isCurrent ? 'Resume' : 'Open'}
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
            Learn, practise, get feedback, and retry until a skill is Familiar. Finish the station. Then the next door
            opens. Leaving mid-path is fine — use Done for now.
          </p>
        </div>
        <div className="ph-footnote-actions">
          <button type="button" className="btn btn-primary" onClick={onContinue}>
            {resumeLabel}
          </button>
          {onDoneForNow && (
            <button type="button" className="btn btn-ghost" onClick={onDoneForNow}>
              Done for now
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}

/** Compact practice-marks strip inside the lesson shell. */
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
    <div className="practice-stats-strip" aria-label="Practice marks">
      <span>
        <strong>{stats.xp}</strong> marks
      </span>
      <span>
        <strong>{stats.dayStreak}</strong> days
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
