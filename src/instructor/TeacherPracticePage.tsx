import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { workbookByNumber, workbookImage, workbookSetLabel } from './communityWorkbooks'
import { useTeacherPracticeBase } from './teacherPracticePaths'
import {
  getInstructorPracticeName,
  getInstructorPracticePhase,
  getInstructorPracticeSession,
  getInstructorPracticeView,
  hasInstructorPracticeFeedbackAck,
  INSTRUCTOR_PRACTICE_PHASES,
  instructorPracticeFeedbackKey,
  instructorSessionsClearedCount,
  isInstructorPracticeMode,
  isInstructorSessionCleared,
  markInstructorPracticeFeedbackAck,
  markInstructorSessionCleared,
  openInstructorPracticeChat,
  restartInstructorPracticeFromTop,
  setInstructorPracticePhase,
  setInstructorPracticeSession,
  setInstructorPracticeView,
  shouldAskInstructorPracticeFeedback,
  type InstructorPracticePhase,
} from '../practice/InstructorPracticeMode'
import { playFoley, unlockFoley } from '../audio/foley'

type Session = {
  n: number
  title: string
  source: string
  sourceTitle: string
  goal: string
  prepare: string
  model: string
  practice: string
  observe: string
  stations: string[]
  workbooks: number[]
}

const sessions: Session[] = [
  {
    n: 1,
    title: 'People, roles and greetings',
    source: 'Month 1 · Week 1',
    sourceTitle: 'Workplace orientation, roles and greetings',
    goal: 'Recognize support roles, introduce yourself and ask when a duty is unclear.',
    prepare:
      'Prepare role cards for a client, volunteer, supervisor, colleague and community worker. Use fictional examples.',
    model:
      'Introduce yourself and model a respectful greeting. Show how to ask a supervisor for clarification.',
    practice:
      'Invite learners to match role cards, practise a greeting in pairs and ask for help with an unclear task.',
    observe:
      'Listen for a respectful introduction and a clear request for help. Give feedback and another chance to practise.',
    stations: ['Workplace Words', 'Sentence Structure', 'Workplace Instructions'],
    workbooks: [1, 2, 3],
  },
  {
    n: 2,
    title: 'Daily routines and accessibility',
    source: 'Month 1 · Week 2',
    sourceTitle: 'Client needs, daily routines and accessibility',
    goal: 'Name everyday needs and accessibility words while respecting the person’s preferences.',
    prepare:
      'Prepare picture cards showing daily activities and accessibility items. Use a fictional situation.',
    model:
      'Ask what the person prefers and identify an accessibility item without assuming they need help.',
    practice:
      'Match pictures to words, describe a daily routine and practise asking before offering help.',
    observe:
      'Notice whether the learner asks about preference and recognizes when to seek trained help.',
    stations: ['Workplace Words', 'Picture Match', 'Sentence Structure'],
    workbooks: [6, 7, 25],
  },
  {
    n: 3,
    title: 'Community places and services',
    source: 'Month 1 · Week 3',
    sourceTitle: 'Community places and service vocabulary',
    goal: 'Recognize community services and practise simple directions and questions.',
    prepare:
      'Prepare a simple map and cards for community places and services. Check that local service information is current.',
    model:
      'Use a map to name a place and give one short direction. Show how to check service details.',
    practice:
      'Match a need to a type of service, then practise asking for and giving a simple direction.',
    observe:
      'Listen for a useful question or direction and whether the learner knows to verify service information.',
    stations: ['Workplace Words', 'Sentence Structure', 'Workplace Instructions'],
    workbooks: [13, 14, 15],
  },
]

const PHASE_LABEL: Record<InstructorPracticePhase, string> = {
  prepare: 'Prepare',
  model: 'Model',
  practise: 'Practise together',
  observe: 'Observe and follow up',
}

function phaseCopy(session: Session, phase: InstructorPracticePhase) {
  if (phase === 'prepare') return session.prepare
  if (phase === 'model') return session.model
  if (phase === 'practise') return session.practice
  return session.observe
}

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
    sessionN: getInstructorPracticeSession(),
    phase: getInstructorPracticePhase(),
    cleared: instructorSessionsClearedCount(),
  }
}

function SessionWorkbench({
  session,
  base,
  practice,
}: {
  session: Session
  base: string
  practice: boolean
}) {
  const navigate = useNavigate()
  const phase = getInstructorPracticePhase()
  const phaseIdx = INSTRUCTOR_PRACTICE_PHASES.indexOf(phase)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const cleared = isInstructorSessionCleared(session.n)

  function goHub() {
    setInstructorPracticeView('hub')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function advancePhase() {
    void unlockFoley().then(() => playFoley('latch'))
    if (phaseIdx < INSTRUCTOR_PRACTICE_PHASES.length - 1) {
      setInstructorPracticePhase(INSTRUCTOR_PRACTICE_PHASES[phaseIdx + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    markInstructorSessionCleared(session.n)
    if (
      practice &&
      shouldAskInstructorPracticeFeedback(session.n) &&
      !hasInstructorPracticeFeedbackAck(instructorPracticeFeedbackKey(session.n))
    ) {
      setFeedbackPrompt(true)
      return
    }
    setInstructorPracticeView('hub')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function ackFeedback(leftNote: boolean) {
    markInstructorPracticeFeedbackAck(instructorPracticeFeedbackKey(session.n))
    setFeedbackPrompt(false)
    if (leftNote) openInstructorPracticeChat()
    setInstructorPracticeView('hub')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="tp-workbench stack">
      <p className="play-nearby-objective" aria-live="polite">
        Session {session.n} · {PHASE_LABEL[phase]} · {phaseIdx + 1} of {INSTRUCTOR_PRACTICE_PHASES.length}
        {cleared ? ' · Station clear' : ''}
      </p>

      <header className="tp-workbench-head">
        <button type="button" className="btn btn-ghost" onClick={goHub}>
          ← Sessions hub
        </button>
        <div>
          <p className="section-kicker">
            Session {session.n} · {session.source}
          </p>
          <h1>{session.title}</h1>
          <p className="tp-source-title">{session.sourceTitle}</p>
        </div>
      </header>

      <p className="tp-goal">
        <strong>Goal</strong> {session.goal}
      </p>

      <ol className="tp-phase-rail" aria-label="Session phases">
        {INSTRUCTOR_PRACTICE_PHASES.map((p, i) => (
          <li key={p} className={i === phaseIdx ? 'is-current' : i < phaseIdx ? 'is-done' : ''}>
            <button
              type="button"
              disabled={i > phaseIdx && !cleared}
              onClick={() => {
                if (i <= phaseIdx || cleared) setInstructorPracticePhase(p)
              }}
            >
              <span aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              {PHASE_LABEL[p]}
            </button>
          </li>
        ))}
      </ol>

      <article className="panel tp-phase-card" aria-live="polite">
        <p className="section-kicker">Your move</p>
        <h2>{PHASE_LABEL[phase]}</h2>
        <p className="tp-phase-body">{phaseCopy(session, phase)}</p>
        <button type="button" className="btn btn-primary" onClick={advancePhase}>
          {phaseIdx < INSTRUCTOR_PRACTICE_PHASES.length - 1
            ? `Continue to ${PHASE_LABEL[INSTRUCTOR_PRACTICE_PHASES[phaseIdx + 1]]}`
            : 'Clear this session'}
        </button>
      </article>

      <footer className="tp-session-foot">
        <div>
          <p className="tp-foot-label">Student Practice stations</p>
          <div className="tp-chips">
            {session.stations.map((station) => (
              <span className="tp-chip" key={station}>
                {station}
              </span>
            ))}
          </div>
          <p className="tp-foot-note">
            Choose Community Support in Student Practice, then open these stations with learners.
          </p>
          {practice && (
            <Link className="btn btn-ghost" to="/journey">
              Open Student Practice
            </Link>
          )}
        </div>
        <div>
          <p className="tp-foot-label">Workbook companions</p>
          <div className="tp-chips">
            {session.workbooks.map((n) => {
              const set = workbookByNumber(n)
              if (!set) return null
              return (
                <Link
                  className="tp-workbook-link"
                  key={n}
                  to={`${base}/workbooks/${n}`}
                  title={set.title}
                  onClick={() => setInstructorPracticeView('workbooks')}
                >
                  <img src={workbookImage(n, 'thumb')} alt="" loading="lazy" />
                  <span>
                    <strong>{workbookSetLabel(n)}</strong>
                    {set.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </footer>

      {feedbackPrompt && (
        <div className="tp-feedback-prompt panel" role="dialog" aria-modal="true">
          <h3>Did you leave feedback on this session?</h3>
          <p>
            Use the Feedback chat if something felt unclear, missing, or hard to teach. Confirm when you
            are ready to return to the sessions hub.
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
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            navigate('/')
          }}
        >
          Done for now · Toolbox
        </button>
      </div>
    </div>
  )
}

function PracticeHub({
  base,
  name,
  clearedCount,
}: {
  base: string
  name: string
  clearedCount: number
}) {
  const navigate = useNavigate()

  function openSession(n: number) {
    void unlockFoley().then(() => playFoley('latch'))
    setInstructorPracticeSession(n)
    setInstructorPracticePhase('prepare')
    setInstructorPracticeView('session')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="stack tp-page tp-hub">
      <header className="tp-head">
        <div>
          <p className="section-kicker">Instructor Practice</p>
          <h1>Teaching sessions hub</h1>
          <p className="lede">
            {name ? `${name} · ` : ''}
            Three Community Support sessions — one phase at a time. Leave feedback when a session feels
            unclear. Same craft as Student Practice: walk it, note kinks, start over when you need a
            fresh run.
          </p>
          <p className="tp-credit">
            Community Support instructor: <strong>Yonas Tesfagabr</strong>
          </p>
        </div>
        <div className="tp-actions">
          <Link className="btn btn-primary" to={`${base}/workbooks`}>
            Open 25 workbooks
          </Link>
          <Link className="btn btn-ghost" to="/journey">
            Student Practice
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              restartInstructorPracticeFromTop()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Start over
          </button>
        </div>
      </header>

      <section className="panel tp-brief" aria-labelledby="tp-hub-progress">
        <div className="tp-brief-head">
          <div>
            <p className="section-kicker">Progress</p>
            <h2 id="tp-hub-progress">
              {clearedCount} of {sessions.length} sessions clear
            </h2>
          </div>
          <p className="tp-brief-note" style={{ margin: 0 }}>
            Clear a session by walking Prepare → Model → Practise → Observe. Feedback chat stays on the
            side for kinks.
          </p>
        </div>
      </section>

      <div className="tp-session-list" role="list">
        {sessions.map((session) => {
          const done = isInstructorSessionCleared(session.n)
          return (
            <article className={`panel tp-session tp-session-card${done ? ' is-clear' : ''}`} key={session.n}>
              <header className="tp-session-head">
                <span className="tp-session-number" aria-hidden="true">
                  {String(session.n).padStart(2, '0')}
                </span>
                <div>
                  <p className="section-kicker">
                    Session {session.n} · {session.source}
                    {done ? ' · Clear' : ''}
                  </p>
                  <h2>{session.title}</h2>
                  <p className="tp-source-title">{session.sourceTitle}</p>
                </div>
              </header>
              <p className="tp-goal">
                <strong>Goal</strong> {session.goal}
              </p>
              <button type="button" className="btn btn-primary" onClick={() => openSession(session.n)}>
                {done ? 'Walk again' : 'Open session'}
              </button>
            </article>
          )
        })}
      </div>

      <div className="tp-workbench-exit">
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
          Done for now · Toolbox
        </button>
      </div>
    </div>
  )
}

function StaticSessionList({ base }: { base: string }) {
  return (
    <>
      <section className="panel tp-brief" aria-labelledby="tp-brief-title">
        <div className="tp-brief-head">
          <div>
            <p className="section-kicker">Before you teach</p>
            <h2 id="tp-brief-title">Supervised, fictional, source-led</h2>
          </div>
          <a
            className="tp-binder-link"
            href="https://drive.google.com/file/d/15R0-JV0Gs7Ca4pgzneSIz40ffKhKIMkj/view"
            target="_blank"
            rel="noreferrer"
          >
            Open the draft instructor binder
          </a>
        </div>
        <ul className="tp-checks">
          <li>
            <strong>Use fictional situations.</strong> Protect privacy, ask permission and respect the
            person’s choice.
          </li>
          <li>
            <strong>Stay inside your role.</strong> Ask a supervisor when a task is unclear or outside
            your training.
          </li>
          <li>
            <strong>Keep practice separate from sign-off.</strong> These sessions support classroom
            teaching; they are not an observation record or a certification.
          </li>
        </ul>
        <p className="tp-brief-note">
          Adapted from a draft teaching binder and needs instructor and program review. These short
          sessions do not replace the proposed eight-month curriculum. Physical or clinical assistance
          requires appropriate separate training, authorization and supervision.
        </p>
      </section>

      <div className="tp-session-list">
        {sessions.map((session) => (
          <article className="panel tp-session" key={session.n}>
            <header className="tp-session-head">
              <span className="tp-session-number" aria-hidden="true">
                {String(session.n).padStart(2, '0')}
              </span>
              <div>
                <p className="section-kicker">
                  Session {session.n} · {session.source}
                </p>
                <h2>{session.title}</h2>
                <p className="tp-source-title">{session.sourceTitle}</p>
              </div>
            </header>

            <p className="tp-goal">
              <strong>Goal</strong> {session.goal}
            </p>

            <div className="tp-steps">
              <section>
                <h3>Prepare</h3>
                <p>{session.prepare}</p>
              </section>
              <section>
                <h3>Model</h3>
                <p>{session.model}</p>
              </section>
              <section>
                <h3>Practise together</h3>
                <p>{session.practice}</p>
              </section>
              <section>
                <h3>Observe and follow up</h3>
                <p>{session.observe}</p>
              </section>
            </div>

            <footer className="tp-session-foot">
              <div>
                <p className="tp-foot-label">Student Practice stations</p>
                <div className="tp-chips">
                  {session.stations.map((station) => (
                    <span className="tp-chip" key={station}>
                      {station}
                    </span>
                  ))}
                </div>
                <p className="tp-foot-note">
                  Choose Community Support in the student path, then open these stations together.
                </p>
              </div>
              <div>
                <p className="tp-foot-label">Workbook companions</p>
                <div className="tp-chips">
                  {session.workbooks.map((n) => {
                    const set = workbookByNumber(n)
                    if (!set) return null
                    return (
                      <Link
                        className="tp-workbook-link"
                        key={n}
                        to={`${base}/workbooks/${n}`}
                        title={set.title}
                      >
                        <img src={workbookImage(n, 'thumb')} alt="" loading="lazy" />
                        <span>
                          <strong>{workbookSetLabel(n)}</strong>
                          {set.title}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </footer>
          </article>
        ))}
      </div>

      <div className="tp-next">
        <p>
          <strong>Next step:</strong> after guided practice, record what you observed — not what the
          learner clicked.
        </p>
        <div className="tp-next-links">
          <Link className="btn btn-ghost" to="/app/instructor/observe">
            Record an observation
          </Link>
          <Link className="btn btn-ghost" to={`${base}/workbooks`}>
            Browse all workbooks
          </Link>
        </div>
      </div>
    </>
  )
}

/** Three teaching sessions — practice mode walks them as stations; portal keeps the full brief. */
export function TeacherPracticePage() {
  const base = useTeacherPracticeBase()
  const live = useInstructorPracticeLive()
  const practice = live.active && !base.startsWith('/app/')

  if (practice && live.view === 'session') {
    const session = sessions.find((s) => s.n === live.sessionN) || sessions[0]
    return <SessionWorkbench session={session} base={base} practice />
  }

  if (practice) {
    return <PracticeHub base={base} name={live.name} clearedCount={live.cleared} />
  }

  return (
    <div className="stack tp-page">
      <header className="tp-head">
        <div>
          <p className="section-kicker">Instructor · Community Support</p>
          <h1>Instructor Practice</h1>
          <p className="lede">
            Three starting sessions from the draft Community Support binder. Each one moves from
            preparation to modelling, guided practice and observation — then hands the learner to the
            matching Student Practice stations.
          </p>
          <p className="tp-credit">
            Community Support instructor: <strong>Yonas Tesfagabr</strong>
          </p>
        </div>
        <div className="tp-actions">
          <Link className="btn btn-primary" to={`${base}/workbooks`}>
            Open 25 workbooks
          </Link>
          <Link className="btn btn-ghost" to="/journey">
            Student Practice
          </Link>
        </div>
      </header>
      <StaticSessionList base={base} />
    </div>
  )
}
