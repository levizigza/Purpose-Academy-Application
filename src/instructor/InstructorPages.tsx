import { FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { StatusLabel } from '../components/Ui'
import {
  useDb,
  getSafetyGate,
  gradeSubmission,
  recordPracticalObservation,
  setSafetyGate,
} from '../data/store'
import type { RubricRating } from '../data/types'
import { pathwayMeta } from '../pathways'

function pathwayLabel(id: string | null | undefined): string {
  if (!id) return 'Foundation'
  if (id === 'construction' || id === 'logistics' || id === 'community') {
    return pathwayMeta(id).label
  }
  return id
}

function gateKeyLabel(key: string): string {
  if (key === 'workshop_practical') return 'Workshop practical'
  return key.replaceAll('_', ' ')
}

const RUBRIC_LABELS: Record<RubricRating, string> = {
  demonstrated: 'Shown clearly',
  partially_demonstrated: 'Partly shown',
  not_demonstrated: 'Not shown yet',
  critical_safety_error: 'Safety concern — stop and coach',
  not_observed: 'Not observed yet',
}

export function InstructorDashboardPage() {
  const { user } = useSession()
  const db = useDb()
  if (!user) return null

  const pendingSubs = db.submissions.filter((s) => s.status === 'submitted')
  const blocked = db.safety_gate_states.filter((g) => g.status !== 'PASS')
  const approvedStudents = db.students.filter((s) => s.registration_status === 'approved')

  return (
    <div className="stack instructor-today">
      <div>
        <p className="section-kicker">Instructor</p>
        <h1>Today</h1>
        <p className="lede">
          Grade work, clear safety, observe skill — then teach from Instructor Practice.
        </p>
      </div>
      <div className="instructor-today-actions">
        <Link className="panel instructor-today-tile" to="/app/instructor/assignments">
          <span className="instructor-today-kicker">First</span>
          <strong>Grade work</strong>
          <span className="instructor-today-count">{pendingSubs.length} waiting</span>
        </Link>
        <Link className="panel instructor-today-tile" to="/app/instructor/safety">
          <span className="instructor-today-kicker">Safety</span>
          <strong>Safety gates</strong>
          <span className="instructor-today-count">{blocked.length} blocked</span>
        </Link>
        <Link className="panel instructor-today-tile" to="/app/instructor/observe">
          <span className="instructor-today-kicker">Verify</span>
          <strong>Observe skills</strong>
          <span className="instructor-today-count">
            {approvedStudents.length} {approvedStudents.length === 1 ? 'learner' : 'learners'}
          </span>
        </Link>
      </div>
      <div className="panel stack">
        <h2>Instructor Practice</h2>
        <p>
          Community Support Month 1 sessions are ready (Yonas). Construction and Logistics binders
          stay with ChuChu and Kinfe until those Instructor Practice packs ship.
        </p>
        <p>
          <Link className="btn btn-ghost" to="/app/instructor/practice">
            Open Instructor Practice
          </Link>{' '}
          <Link className="inline-link" to="/app/instructor/practice/workbooks">
            25 workbooks
          </Link>
        </p>
      </div>
      <div className="panel stack">
        <h2>Program instructors</h2>
        <ul className="list-plain">
          <li>ChuChu Asemelash · Construction (binder in progress)</li>
          <li>Kinfe Desta · Logistics (binder in progress)</li>
          <li>Yonas Tesfagabr · Community Support (sessions live)</li>
        </ul>
      </div>
      <div className="panel stack">
        <h2>Classes</h2>
        <ul className="list-plain">
          {db.schedules.map((s) => (
            <li key={s.id}>
              {s.title} ·{' '}
              {new Date(s.starts_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}{' '}
              · {s.location}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function InstructorAssignmentsPage() {
  const { user } = useSession()
  const db = useDb()
  const [msg, setMsg] = useState<string | null>(null)
  if (!user) return null

  const rows = db.submissions
    .filter((s) => s.status === 'submitted' || s.status === 'graded')
    .map((s) => ({
      sub: s,
      assignment: db.assignments.find((a) => a.id === s.assignment_id),
      student: db.students.find((st) => st.id === s.student_id),
      user: db.users.find((u) => u.uid === db.students.find((st) => st.id === s.student_id)?.uid),
    }))

  function grade(submissionId: string, e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const gradeVal = Number(data.get('grade'))
    const feedback = String(data.get('feedback') || '')
    void gradeSubmission(user!.uid, submissionId, gradeVal, feedback).then(() =>
      setMsg('Feedback saved.'),
    )
  }

  return (
    <div className="stack instructor-grade">
      <div>
        <p className="section-kicker">Instructor</p>
        <h1>Grade work</h1>
        <p className="lede">
          Read the learner’s words, leave clear feedback, then save. One submission at a time.
        </p>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      {rows.length === 0 && (
        <div className="panel stack">
          <p className="muted" style={{ margin: 0 }}>
            No submissions waiting. When a learner turns in a task from their portal, it lands here.
          </p>
        </div>
      )}
      {rows.map(({ sub, assignment, user: learner }) => (
        <article className="panel stack instructor-grade-card" key={sub.id}>
          <header className="instructor-grade-card-head">
            <div>
              <h2>{assignment?.title ?? 'Assignment'}</h2>
              <p className="muted" style={{ margin: 0 }}>
                {learner?.full_name ?? 'Learner'} ·{' '}
                {sub.status === 'graded' ? 'Feedback ready' : 'Awaiting review'}
                {sub.feedback ? ' · note saved' : ''}
              </p>
            </div>
          </header>
          <p className="instructor-grade-body">{sub.content}</p>
          {sub.status === 'submitted' && (
            <form onSubmit={(e) => grade(sub.id, e)} className="stack instructor-grade-form">
              <div className="field">
                <label htmlFor={`grade-${sub.id}`}>Comfort mark (0–100, instructor only)</label>
                <input id={`grade-${sub.id}`} name="grade" type="number" min={0} max={100} required />
              </div>
              <div className="field">
                <label htmlFor={`fb-${sub.id}`}>Feedback for the learner</label>
                <textarea id={`fb-${sub.id}`} name="feedback" required rows={4} />
              </div>
              <button className="btn btn-primary" type="submit">
                Save feedback
              </button>
            </form>
          )}
          {sub.status === 'graded' && sub.feedback && (
            <p className="instructor-grade-saved-fb">
              <strong>Feedback saved:</strong> {sub.feedback}
            </p>
          )}
        </article>
      ))}
    </div>
  )
}

export function InstructorStudentsPage() {
  const db = useDb()
  const students = db.students.filter((s) => s.registration_status === 'approved')
  return (
    <div className="stack instructor-people">
      <div>
        <p className="section-kicker">Instructor</p>
        <h1>Learners</h1>
        <p className="lede">Who is active, which pathway they are on, and whether safety is clear.</p>
      </div>
      {/* Card list for phone; table remains for wider screens */}
      <ul className="instructor-people-cards list-plain">
        {students.map((s) => {
          const u = db.users.find((x) => x.uid === s.uid)
          const gate = getSafetyGate(s.id)
          const comps = db.learner_competencies.filter((c) => c.student_id === s.id)
          return (
            <li className="panel instructor-people-card" key={s.id}>
              <strong>{u?.full_name}</strong>
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                {s.preferred_language} · {pathwayLabel(s.pathway)}
              </p>
              <p style={{ margin: '0.45rem 0 0' }}>
                {gate ? <StatusLabel status={gate.status} /> : <span className="badge brand">Safety not checked</span>}
              </p>
              <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                Skills:{' '}
                {comps.length
                  ? comps.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 ? ' · ' : ''}
                        <StatusLabel status={c.status} />
                      </span>
                    ))
                  : 'none yet'}
              </p>
            </li>
          )
        })}
      </ul>
      <div className="table-wrap panel instructor-people-table">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Language</th>
              <th>Pathway</th>
              <th>Safety gate</th>
              <th>Competencies</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const u = db.users.find((x) => x.uid === s.uid)
              const gate = getSafetyGate(s.id)
              const comps = db.learner_competencies.filter((c) => c.student_id === s.id)
              return (
                <tr key={s.id}>
                  <td>{u?.full_name}</td>
                  <td>{s.preferred_language}</td>
                  <td>{pathwayLabel(s.pathway)}</td>
                  <td>{gate ? <StatusLabel status={gate.status} /> : '—'}</td>
                  <td>
                    {comps.length
                      ? comps.map((c, i) => (
                          <span key={c.id}>
                            {i > 0 ? ' · ' : ''}
                            <StatusLabel status={c.status} />
                          </span>
                        ))
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function InstructorSafetyPage() {
  const { user } = useSession()
  const db = useDb()
  const [msg, setMsg] = useState<string | null>(null)
  if (!user) return null

  return (
    <div className="stack">
      <div>
        <p className="section-kicker">Instructor</p>
        <h1>Safety gates</h1>
        <p className="lede">
          Practical stations stay blocked until prerequisites PASS. Overrides are audited.
        </p>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      <ul className="list-plain">
        {db.safety_gate_states.map((g) => {
          const student = db.students.find((s) => s.id === g.student_id)
          const learner = db.users.find((u) => u.uid === student?.uid)
          return (
            <li key={g.id}>
              <strong>{learner?.full_name}</strong> · {gateKeyLabel(g.gate_key)} ·{' '}
              <StatusLabel status={g.status} />
              <p className="muted">{g.reason}</p>
              {g.status !== 'PASS' && (
                <button
                  type="button"
                  className="btn btn-secondary on-light"
                  onClick={() => {
                    const reason = window.prompt('Reason for authorized override?') || ''
                    if (!reason.trim()) return
                    void setSafetyGate(g.student_id, g.gate_key, 'PASS', reason, user.uid).then(() =>
                      setMsg('Override recorded in audit log.'),
                    )
                  }}
                >
                  Authorized override to PASS
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const RATINGS: RubricRating[] = [
  'demonstrated',
  'partially_demonstrated',
  'not_demonstrated',
  'critical_safety_error',
  'not_observed',
]

export function InstructorObservePage() {
  const { user } = useSession()
  const db = useDb()
  const students = db.students.filter((s) => s.registration_status === 'approved')
  const [studentId, setStudentId] = useState(students[0]?.id ?? '')
  const [competencyId, setCompetencyId] = useState(db.competencies[1]?.id ?? '')
  const competency = db.competencies.find((c) => c.id === competencyId)
  const [ratings, setRatings] = useState<Record<string, RubricRating>>({})
  const [notes, setNotes] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const gate = useMemo(() => (studentId ? getSafetyGate(studentId) : null), [studentId, msg])

  if (!user) return null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!competency) return
    const complete: Record<string, RubricRating> = {}
    for (const c of competency.criteria) {
      complete[c] = ratings[c] ?? 'not_observed'
    }
    try {
      const outcome = await recordPracticalObservation({
        studentId,
        competencyId,
        assessorUid: user!.uid,
        ratings: complete,
        notes,
      })
      const outcomeLabel =
        outcome === 'competent'
          ? 'Checked'
          : outcome === 'practised'
            ? 'Practised'
            : outcome === 'learned'
              ? 'Learned'
              : outcome === 'remediation_required'
                ? 'Needs more practice'
                : String(outcome)
      setMsg(
        `Observation saved. Outcome: ${outcomeLabel}. Checked needs every criterion demonstrated with you watching.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record observation')
    }
  }

  return (
    <div className="stack">
      <div>
        <p className="section-kicker">Instructor</p>
        <h1>Observe skills</h1>
        <p className="lede">
          Human check only. Watching a video or clearing a practice station is not an automatic
          Checked mark.
        </p>
      </div>
      {gate && (
        <div className={`alert ${gate.status === 'PASS' ? 'ok' : 'warn'}`}>
          Safety for selected learner: <StatusLabel status={gate.status} />. {gate.reason}
          {gate.status !== 'PASS' && (
            <p style={{ margin: '0.5rem 0 0' }}>
              Clear Safety gates before you can finalize an observation.
            </p>
          )}
        </div>
      )}
      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      <form className="panel stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="learner">Learner</label>
          <select id="learner" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {students.map((s) => {
              const u = db.users.find((x) => x.uid === s.uid)
              return (
                <option key={s.id} value={s.id}>
                  {u?.full_name}
                </option>
              )
            })}
          </select>
        </div>
        <div className="field">
          <label htmlFor="comp">Skill to check</label>
          <select id="comp" value={competencyId} onChange={(e) => setCompetencyId(e.target.value)}>
            {db.competencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} · {c.category}
              </option>
            ))}
          </select>
        </div>
        {competency?.criteria.map((criterion) => (
          <div className="field" key={criterion}>
            <label htmlFor={criterion}>{criterion}</label>
            <select
              id={criterion}
              value={ratings[criterion] ?? 'not_observed'}
              onChange={(e) =>
                setRatings({ ...ratings, [criterion]: e.target.value as RubricRating })
              }
              disabled={gate?.status !== 'PASS'}
            >
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {RUBRIC_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={gate?.status !== 'PASS'}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={gate?.status !== 'PASS'}>
          Finalize observation
        </button>
      </form>
      <Link className="muted" to="/app/instructor/safety">
        Manage safety gates
      </Link>
    </div>
  )
}
