import { useEffect, useState } from 'react'
import './instructorPathways.css'
import { Link, useNavigate } from 'react-router-dom'
import { useTeacherPracticeBase } from './teacherPracticePaths'
import {
  INSTRUCTOR_STREAM_ORDER,
  instructorStream,
  type InstructorStream,
  type StreamDoc,
  type StreamWeek,
} from './instructorCurricula'
import { papersForWeek } from './weekPapers'
import { papersByRole, splitDayMove, successCriteria } from './lessonCycle'
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

function isReviewDoc(doc: StreamDoc): boolean {
  const title = doc.title.toLowerCase()
  if (title.includes('video')) return false
  return /marking|checklist|examination|exam|answer key/.test(title)
}

function splitDocs(docs: StreamDoc[]) {
  return {
    teach: docs.filter((doc) => !isReviewDoc(doc)),
    review: docs.filter((doc) => isReviewDoc(doc)),
  }
}

function DocShelf({
  title,
  kicker,
  docs,
  empty,
}: {
  title: string
  kicker: string
  docs: StreamDoc[]
  empty: string
}) {
  return (
    <section className="panel tp-shelf">
      <p className="section-kicker">{kicker}</p>
      <h2>{title}</h2>
      {docs.length === 0 ? <p className="tp-brief-note">{empty}</p> : null}
      <ul className="tp-doc-list">
        {docs.map((item) => (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.title}
            </a>
            <span>{item.note}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TeachingCycle() {
  return (
    <ol className="tp-cycle" aria-label="How a week is taught">
      <li>
        <strong>Aim</strong>
        <span>Say what they will be able to do.</span>
      </li>
      <li>
        <strong>Model</strong>
        <span>Show the task before they try it.</span>
      </li>
      <li>
        <strong>Practise</strong>
        <span>Do it together, then they do it.</span>
      </li>
      <li>
        <strong>Evidence</strong>
        <span>Keep work that matches the aim.</span>
      </li>
    </ol>
  )
}

function RootTree({
  name,
  openId,
  sessionN,
}: {
  name: string
  openId: string | null
  sessionN: number
}) {
  return (
    <div className="stack tp-page">
      <header className="tp-head">
        <div>
          <p className="section-kicker">Instructor Practice</p>
          <h1>Three streams</h1>
          <p className="lede">
            {name ? `${name} · ` : ''}
            Construction, Logistics, and Community Support grow from this point. Open one stream. Teach
            each week the same way: say the aim, model the task, practise it together, then keep the evidence.
          </p>
        </div>
      </header>

      <div className="tp-tree" aria-label="Three curriculum streams">
        <div className="tp-trunk">
          <p className="section-kicker">Root</p>
          <strong>Instructor Practice</strong>
          <span>One faculty at a time</span>
        </div>
        <div className="tp-trunk-stem" aria-hidden />
        <div className="tp-root-rail" aria-hidden />
        <div className="tp-root-grid">
          {INSTRUCTOR_STREAM_ORDER.map((id) => {
            const stream = instructorStream(id)
            if (!stream) return null
            const cleared = instructorSessionsClearedCount(id)
            const open = openId === id
            return (
              <article className={`tp-root${open ? ' is-open' : ''}`} key={id}>
                <span className="tp-root-stem" aria-hidden />
                <div className="panel tp-root-card">
                  <p className="section-kicker">{stream.program}</p>
                  <h2>{stream.title}</h2>
                  <p>{stream.summary}</p>
                  {stream.credit ? (
                    <p className="tp-credit">
                      Instructor: <strong>{stream.credit}</strong>
                    </p>
                  ) : null}
                  <p className="tp-brief-note">
                    {cleared} of {stream.weeks.length} weeks clear
                    {open ? ` · Week ${sessionN} is the one last opened` : ''}
                  </p>
                  <ol className="tp-twigs">
                    {stream.months.map((month) => (
                      <li key={month.n}>
                        <span>Month {month.n}</span>
                        {month.title}
                      </li>
                    ))}
                  </ol>
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
                </div>
              </article>
            )
          })}
        </div>
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
  const shelves = splitDocs(stream.docs)

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
            {stream.weeks.length} weeks from the {stream.source}. Each week states an aim, a model, practice
            with the group, and the evidence you keep.
          </p>
          {stream.credit ? (
            <p className="tp-credit">
              Community Support instructor: <strong>{stream.credit}</strong>
            </p>
          ) : null}
        </div>
        <div className="tp-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setInstructorPracticeView('roots')}>
            Three streams
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

      <TeachingCycle />

      <div className="tp-shelves">
        <DocShelf
          kicker="Find the papers"
          title="Documents"
          docs={shelves.teach}
          empty="No teaching papers are linked for this stream."
        />
        <DocShelf
          kicker="Mark the week"
          title="Reviews"
          docs={shelves.review}
          empty="No marking papers are linked for this stream."
        />
      </div>
      <div className="tp-review-bar">
        <p>
          {stream.dayNote ? `${stream.dayNote} ` : ''}
          {stream.studentPath}
        </p>
        {practice ? (
          <button type="button" className="btn btn-secondary on-light" onClick={() => openInstructorPracticeChat()}>
            Leave a review of this stream
          </button>
        ) : null}
      </div>

      <section className="panel tp-brief" aria-labelledby="tp-hub-progress">
        <div className="tp-brief-head">
          <div>
            <p className="section-kicker">Progress</p>
            <h2 id="tp-hub-progress">
              {clearedCount} of {stream.weeks.length} weeks clear
            </h2>
          </div>
          <p className="tp-brief-note" style={{ margin: 0 }}>
            Walk every block in the week, then clear it. Documents and reviews sit above the months, and again inside each week.
          </p>
        </div>
      </section>

      {stream.months.map((month) => {
        const weeks = stream.weeks.filter((week) => week.month === month.n)
        return (
          <section className="panel tp-month tp-branch" key={month.n} aria-labelledby={`tp-month-${month.n}`}>
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

function CyclePapers({ docs }: { docs: StreamDoc[] }) {
  const grouped = papersByRole(docs)
  const groups = [
    { kicker: 'Before you teach', title: 'Plan', docs: grouped.plan, empty: 'No plan is filed for this part.' },
    { kicker: 'During the block', title: 'Teach from', docs: grouped.teach, empty: 'No teaching paper is filed for this part.' },
    { kicker: 'While they work', title: 'Evidence', docs: grouped.evidence, empty: 'No checklist or marking guide is filed for this part.' },
    { kicker: 'At the end of the week', title: 'Examination', docs: grouped.exam, empty: 'No examination is filed for this part.' },
  ]
  return (
    <div className="tp-cycle-papers">
      {groups.map((group) => (
        <DocShelf key={group.title} kicker={group.kicker} title={group.title} docs={group.docs} empty={group.empty} />
      ))}
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
  const moves = step ? splitDayMove(step.text) : null
  const cleared = isInstructorSessionCleared(stream.id, week.n)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const shelves = splitDocs(stream.docs)
  const specificPapers = papersForWeek(stream.id, week.n)

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

      <TeachingCycle />

      <div className="tp-shelves">
        <section className="panel tp-shelf">
          <p className="section-kicker">Aim</p>
          <h2>What they will be able to do</h2>
          {week.outcomes.length > 0 ? (
            <ul className="tp-criteria">
              {week.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          ) : month ? (
            <p>{month.objective}</p>
          ) : null}
          {stream.dayNote && stream.id === 'community' ? <p className="tp-brief-note">{stream.dayNote}</p> : null}
        </section>
        <section className="panel tp-shelf">
          <p className="section-kicker">Success</p>
          <h2>You will know it landed when</h2>
          {month ? (
            <ul className="tp-criteria">
              {successCriteria(month.assessment).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="tp-brief-note">Use the week’s evidence before you clear it.</p>
          )}
          {month?.scope ? <p className="tp-brief-note">{month.scope}</p> : null}
        </section>
      </div>

      <CyclePapers docs={specificPapers.length > 0 ? specificPapers : stream.docs} />
      {specificPapers.length > 0 ? (
        <details className="tp-all-papers">
          <summary>All documents and reviews for {stream.title}</summary>
          <div className="tp-shelves">
            <DocShelf kicker="Whole stream" title="Documents" docs={shelves.teach} empty="" />
            <DocShelf kicker="Whole stream" title="Reviews" docs={shelves.review} empty="" />
          </div>
        </details>
      ) : null}
      {practice ? (
        <div className="tp-review-bar">
          <p>A review stays with your name. Use it when a block is unclear, missing, or hard to teach.</p>
          <button type="button" className="btn btn-secondary on-light" onClick={() => openInstructorPracticeChat()}>
            Leave a review of this week
          </button>
        </div>
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
          {moves ? (
            <div className="tp-moves">
              <div className="tp-move">
                <p className="section-kicker">Model</p>
                <p>{moves.model}</p>
              </div>
              <div className="tp-move">
                <p className="section-kicker">Practise together</p>
                <p>{moves.practise}</p>
              </div>
              {moves.evidence ? (
                <div className="tp-move">
                  <p className="section-kicker">Keep this evidence</p>
                  <p>{moves.evidence}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <p className="tp-phase-body">{step.text}</p>
              <p className="tp-brief-note">
                Model it first. Practise it with the group. Keep one piece of work before you leave this block.
              </p>
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={advance}>
            {stepIdx < week.steps.length - 1 ? `Continue to ${week.steps[stepIdx + 1].label}` : 'Clear this week'}
          </button>
        </article>
      ) : null}

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
          <h3>This month is finished</h3>
          <p>
            Open the feedback chat if a week in this month needs a review. Or return to the month branches
            without a note.
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

  if (live.view === 'roots' || !stream) {
    return <RootTree name={live.name} openId={live.pathwayId} sessionN={live.sessionN} />
  }

  if (live.view === 'session') {
    const week = stream.weeks.find((item) => item.n === live.sessionN) || stream.weeks[0]
    if (week) return <WeekWorkbench stream={stream} week={week} practice={practice} />
  }

  return <StreamHub stream={stream} base={base} name={live.name} practice={practice} />
}
