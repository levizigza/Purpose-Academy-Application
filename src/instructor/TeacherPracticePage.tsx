import { Link } from 'react-router-dom'
import { workbookByNumber, workbookImage, workbookSetLabel } from './communityWorkbooks'

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

/** Three teaching sessions adapted from the draft Community Support instructor binder. */
export function TeacherPracticePage() {
  return (
    <div className="stack tp-page">
      <header className="tp-head">
        <div>
          <p className="section-kicker">Instructor · Community Support</p>
          <h1>Teacher Practice</h1>
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
          <Link className="btn btn-primary" to="/app/instructor/practice/workbooks">
            Open 25 workbooks
          </Link>
          <Link className="btn btn-ghost" to="/journey">
            Student Practice
          </Link>
        </div>
      </header>

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
                        to={`/app/instructor/practice/workbooks/${n}`}
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
          <Link className="btn btn-ghost" to="/app/instructor/practice/workbooks">
            Browse all workbooks
          </Link>
        </div>
      </div>
    </div>
  )
}
