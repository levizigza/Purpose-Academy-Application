import { useEffect, useState } from 'react'
import './instructorPathways.css'
import { Link, useNavigate } from 'react-router-dom'
import { useTeacherPracticeBase } from './teacherPracticePaths'
import {
  INSTRUCTOR_STREAM_ORDER,
  instructorStream,
  type InstructorStream,
  type StreamWeek,
} from './instructorCurricula'
import {
  getInstructorPracticeName,
  getInstructorPracticePathway,
  getInstructorPracticeSession,
  getInstructorPracticeStep,
  getInstructorPracticeView,
  hasInstructorPracticeFeedbackAck,
  instructorPracticeFeedbackKey,
  instructorSessionsClearedCount,
  isInstructorPracticeMode,
  isInstructorSessionCleared,
  markInstructorPracticeFeedbackAck,
  markInstructorSessionCleared,
  openInstructorPracticeChat,
  restartInstructorPathway,
  setInstructorPracticePathway,
  setInstructorPracticeSession,
  setInstructorPracticeStep,
  setInstructorPracticeView,
  shouldAskInstructorPracticeFeedback,
} from '../practice/InstructorPracticeMode'
import { playFoley, unlockFoley } from '../audio/foley'

function useInstructorPracticeLive() {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-instructor-practice-changed', sync)
    window.addEventListener('pa-instructor-practice-started', sync)
    window.addEventListener('pa-instructor-practice-restarted', sync)
    window.addEventListener('pa-instructor-practice-feedback-ack', sync)
    return () => {
      window.removeEventListener('pa-instructor-practice-changed', sync)
      window.removeEventListener('pa-instructor-practice-started', sync)
      window.removeEventListener('pa-instructor-practice-restarted', sync)
      window.removeEventListener('pa-instructor-practice-feedback-ack', sync)
    }
  }, [])
  return {
    active: isInstructorPracticeMode(),
    name: getInstructorPracticeName(),
    view: getInstructorPracticeView(),
    pathwayId: getInstructorPracticePathway(),
    sessionN: getInstructorPracticeSession(),
  }
}

function PathwayPicker({ name }: { name: string }) {
  return (
    <div className="stack tp-page">
      <header className="tp-head">
        <div>
          <p className="section-kicker">Instructor Practice</p>
          <h1>Three curriculum pathways</h1>
          <p className="lede">
            {name ? `${name} · ` : ''}
            Construction, Logistics, and Community Support each keep their own folder. Open a pathway to
            teach its weeks from that curriculum.
          </p>
        </div>
      </header>
      <div className="tp-path-grid">
        {INSTRUCTOR_STREAM_ORDER.map((id) => {
          const stream = instructorStream(id)
          if (!stream) return null
          const cleared = instructorSessionsClearedCount(id)
          return (
            <article className="panel tp-path-card" key={id}>
              <p className="section-kicker">{stream.program}</p>
              <h2>{stream.title}</h2>
              <p>{stream.summary}</p>
              <p className="tp-source-title">Source: {stream.source}</p>
              {stream.credit ? (
                <p className="tp-credit">
                  Instructor: <strong>{stream.credit}</strong>
                </p>
              ) : null}
              <p className="tp-brief-note">
                {cleared} of {stream.weeks.length} weeks clear
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  void unlockFoley().then(() => playFoley('latch'))
                  setInstructorPracticePathway(id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Open {stream.title}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function StreamHub({
  stream,
  base,
  name,
  practice,
}: {
  stream: InstructorStream
  base: string
  name: string
  practice: boolean
}) {
  const navigate = useNavigate()
  const clearedCount = instructorSessionsClearedCount(stream.id)

  function openWeek(week: StreamWeek) {
    void unlockFoley().then(() => playFoley('latch'))
    setInstructorPracticeSession(week.n)
    setInstructorPracticeStep(0)
    setInstructorPracticeView('session')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="stack tp-page tp-hub">
      <header className="tp-head">
        <div>
          <p className="section-kicker">Instructor · {stream.title}</p>
          <h1>{stream.program}</h1>
          <p className="lede">
            {name ? `${name} · ` : ''}
            {stream.weeks.length} weeks from the {stream.source}. One block at a time. Progress stays
            inside this pathway.
          </p>
          {stream.credit ? (
            <p className="tp-credit">
              Community Support instructor: <strong>{stream.credit}</strong>
            </p>
          ) : null}
        </div>
        <div className="tp-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setInstructorPracticePathway(null)}>
            All pathways
          </button>
          {stream.id === 'community' ? (
            <Link className="btn btn-primary" to={`${base}/workbooks`}>
              Open 25 picture workbooks
            </Link>
          ) : null}
          <Link className="btn btn-ghost" to="/journey">
            Student Practice
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              restartInstructorPathway(stream.id)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Start this pathway over
          </button>
        </div>
      </header>

      <section className="panel tp-brief" aria-labelledby="tp-docs-title">
        <div className="tp-brief-head">
          <div>
            <p className="section-kicker">This folder</p>
            <h2 id="tp-docs-title">Curriculum documents</h2>
          </div>
        </div>
        <ul className="tp-doc-list">
          {stream.docs.map((item) => (
            <li key={item.href}>
              <a href={item.href} target="_blank" rel="noreferrer">
                {item.title}
              </a>
              <span>{item.note}</span>
            </li>
          ))}
        </ul>
        {stream.dayNote ? <p className="tp-brief-note">{stream.dayNote}</p> : null}
        <p className="tp-brief-note">{stream.studentPath}</p>
      </section>

      <section className="panel tp-brief" aria-labelledby="tp-hub-progress">
        <div className="tp-brief-head">
          <div>
            <p className="section-kicker">Progress</p>
            <h2 id="tp-hub-progress">
              {clearedCount} of {stream.weeks.length} weeks clear
            </h2>
          </div>
          <p className="tp-brief-note" style={{ margin: 0 }}>
            Walk every block in the week, then clear it. {practice ? 'A note is offered at the end of each month.' : 'These weeks support teaching. They are not a certificate.'}
          </p>
        </div>
      </section>

      {stream.months.map((month) => {
        const weeks = stream.weeks.filter((week) => week.month === month.n)
        return (
          <section className="panel tp-month" key={month.n} aria-labelledby={`tp-month-${month.n}`}>
            <p className="section-kicker">Month {month.n} · 120 hours</p>
            <h2 id={`tp-month-${month.n}`}>{month.title}</h2>
            <p>{month.objective}</p>
            <p className="tp-source-title">Assessment: {month.assessment}</p>
            {month.scope ? <p className="tp-brief-note">{month.scope}</p> : null}
            <div className="tp-week-list">
              {weeks.map((week) => {
                const done = isInstructorSessionCleared(stream.id, week.n)
                return (
                  <button
                    type="button"
                    className={`tp-week${done ? ' is-clear' : ''}`}
                    key={week.n}
                    onClick={() => openWeek(week)}
                  >
                    <span>Week {week.n}</span>
                    <strong>{week.title}</strong>
                    {done ? <em>Clear</em> : <em>30 hours</em>}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="tp-workbench-exit">
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
          Done for now · Toolbox
        </button>
      </div>
    </div>
  )
}

function WeekWorkbench({
  stream,
  week,
  practice,
}: {
  stream: InstructorStream
  week: StreamWeek
  practice: boolean
}) {
  const navigate = useNavigate()
  const month = stream.months.find((item) => item.n === week.month)
  const stepCount = Math.max(1, week.steps.length)
  const stepIdx = getInstructorPracticeStep(stepCount)
  const step = week.steps[stepIdx] || week.steps[0]
  const cleared = isInstructorSessionCleared(stream.id, week.n)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)

  function goHub() {
    setInstructorPracticeView('hub')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function finishWeek() {
    markInstructorSessionCleared(stream.id, week.n)
    const key = instructorPracticeFeedbackKey(week.n, stream.id)
    if (practice && shouldAskInstructorPracticeFeedback(week.n) && !hasInstructorPracticeFeedbackAck(key)) {
      setFeedbackPrompt(true)
      return
    }
    goHub()
  }

  function advance() {
    void unlockFoley().then(() => playFoley('latch'))
    if (stepIdx < week.steps.length - 1) {
      setInstructorPracticeStep(stepIdx + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    finishWeek()
  }

  function ackFeedback(leftNote: boolean) {
    markInstructorPracticeFeedbackAck(instructorPracticeFeedbackKey(week.n, stream.id))
    setFeedbackPrompt(false)
    if (leftNote) openInstructorPracticeChat()
    goHub()
  }

  return (
    <div className="tp-workbench stack">
      <p className="play-nearby-objective" aria-live="polite">
        {stream.title} · Week {week.n} · {step?.label || 'Week'} · {stepIdx + 1} of {stepCount}
        {cleared ? ' · Week clear' : ''}
      </p>

      <header className="tp-workbench-head">
        <button type="button" className="btn btn-ghost" onClick={goHub}>
          ← {stream.title} weeks
        </button>
        <div>
          <p className="section-kicker">
            Month {week.month} · Week {week.n} · 30 hours
          </p>
          <h1>{week.title}</h1>
          <p className="tp-source-title">
            {stream.source}
            {month ? ` · ${month.title}` : ''}
          </p>
        </div>
      </header>

      {week.outcomes.length > 0 ? (
        <div className="tp-goal">
          <strong>Outcomes this week</strong>
          <ul>
            {week.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </div>
      ) : month ? (
        <p className="tp-goal">
          <strong>Month goal</strong> {month.objective}
        </p>
      ) : null}

      <ol className="tp-phase-rail" aria-label="Week blocks">
        {week.steps.map((item, i) => (
          <li key={`${item.label}-${i}`} className={i === stepIdx ? 'is-current' : i < stepIdx ? 'is-done' : ''}>
            <button
              type="button"
              disabled={i > stepIdx && !cleared}
              onClick={() => {
                if (i <= stepIdx || cleared) setInstructorPracticeStep(i)
              }}
            >
              <span aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      {step ? (
        <article className="panel tp-phase-card" aria-live="polite">
          <p className="section-kicker">This block</p>
          <h2>{step.label}</h2>
          <p className="tp-phase-body">{step.text}</p>
          <button type="button" className="btn btn-primary" onClick={advance}>
            {stepIdx < week.steps.length - 1 ? `Continue to ${week.steps[stepIdx + 1].label}` : 'Clear this week'}
          </button>
        </article>
      ) : null}

      {month?.scope ? <p className="tp-brief-note">{month.scope}</p> : null}
      {stream.dayNote && stream.id === 'community' ? <p className="tp-brief-note">{stream.dayNote}</p> : null}

      <footer className="tp-session-foot">
        <div>
          <p className="tp-foot-label">With learners</p>
          <p className="tp-foot-note">{stream.studentPath}</p>
          <Link className="btn btn-ghost" to="/journey">
            Open Student Practice
          </Link>
        </div>
      </footer>

      {feedbackPrompt && (
        <div className="tp-feedback-prompt panel" role="dialog" aria-modal="true">
          <h3>Did you leave feedback on this month?</h3>
          <p>
            Use the Feedback chat if a week was unclear, missing, or hard to teach. Confirm when you are
            ready to return to this pathway.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => ackFeedback(true)}>
              Open feedback chat
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => ackFeedback(false)}>
              Continue without a note
            </button>
          </div>
        </div>
      )}

      <div className="tp-workbench-exit">
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
          Done for now · Toolbox
        </button>
      </div>
    </div>
  )
}

export function TeacherPracticePage() {
  const base = useTeacherPracticeBase()
  const live = useInstructorPracticeLive()
  const stream = instructorStream(live.pathwayId)
  const practice = live.active && !base.startsWith('/app/')

  if (!stream) return <PathwayPicker name={live.name} />

  if (live.view === 'session') {
    const week = stream.weeks.find((item) => item.n === live.sessionN) || stream.weeks[0]
    if (week) return <WeekWorkbench stream={stream} week={week} practice={practice} />
  }

  return <StreamHub stream={stream} base={base} name={live.name} practice={practice} />
}
