import { FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import {
  useDb,
  getSafetyGate,
  gradeSubmission,
  recordPracticalObservation,
  setSafetyGate,
} from '../data/store'
import type { RubricRating } from '../data/types'

export function InstructorDashboardPage() {
  const { user } = useSession()
  const db = useDb()
  if (!user) return null

  const pendingSubs = db.submissions.filter((s) => s.status === 'submitted')
  const blocked = db.safety_gate_states.filter((g) => g.status !== 'PASS')
  const approvedStudents = db.students.filter((s) => s.registration_status === 'approved')
  const comps = db.learner_competencies
  const learned = comps.filter((c) => c.status === 'learned').length
  const practised = comps.filter((c) => c.status === 'practised').length
  const competent = comps.filter((c) => c.status === 'competent').length
  const remediation = comps.filter((c) => c.status === 'remediation_required')
  const byPathway = {
    construction: approvedStudents.filter((s) => s.pathway === 'construction').length,
    logistics: approvedStudents.filter((s) => s.pathway === 'logistics').length,
    community: approvedStudents.filter((s) => s.pathway === 'community').length,
    foundation: approvedStudents.filter((s) => !s.pathway).length,
  }
  const gapLearners = approvedStudents
    .map((s) => {
      const u = db.users.find((x) => x.uid === s.uid)
      const needsHelp = remediation.filter((c) => c.student_id === s.id).length
      const gate = getSafetyGate(s.id)
      return {
        id: s.id,
        name: u?.full_name ?? s.id,
        pathway: s.pathway ?? 'foundation',
        needsHelp,
        blocked: gate?.status !== 'PASS',
      }
    })
    .filter((r) => r.needsHelp > 0 || r.blocked)
    .slice(0, 8)

  return (
    <div className="stack dash-instructor">
      <div>
        <p className="section-kicker">Instructor</p>
        <h1>Today</h1>
        <p>
          The app supports learning. You teach, observe, correct, and evaluate — moving learners from
          Learned → Practised → Competent.
        </p>
      </div>
      <div className="grid-3">
        <div className="panel stack">
          <h2>Awaiting grading</h2>
          <p className="dash-metric">{pendingSubs.length}</p>
          <Link className="btn btn-ghost" to="/app/instructor/assignments">
            Review assignments
          </Link>
        </div>
        <div className="panel stack">
          <h2>Safety blocks</h2>
          <p className="dash-metric">{blocked.length}</p>
          <Link className="btn btn-ghost" to="/app/instructor/safety">
            Open safety
          </Link>
        </div>
        <div className="panel stack">
          <h2>Active learners</h2>
          <p className="dash-metric">{approvedStudents.length}</p>
          <Link className="btn btn-ghost" to="/app/instructor/students">
            Learner list
          </Link>
        </div>
      </div>

      <div className="panel stack">
        <h2>Competency stages (cohort)</h2>
        <p className="muted" style={{ margin: 0 }}>
          Quiz scores alone never mark Competent. Observation confirms the standard.
        </p>
        <div className="skills-passport-lpc-counts dash-lpc">
          <span className="skills-passport-count">
            <strong>{learned}</strong>
            <span>Learned</span>
          </span>
          <span className="skills-passport-count">
            <strong>{practised}</strong>
            <span>Practised</span>
          </span>
          <span className="skills-passport-count is-competent">
            <strong>{competent}</strong>
            <span>Competent</span>
          </span>
          <span className="skills-passport-count is-warn">
            <strong>{remediation.length}</strong>
            <span>Needs practice</span>
          </span>
        </div>
        <Link className="btn btn-primary" to="/app/instructor/observe">
          Record practical observation
        </Link>
      </div>

      <div className="grid-2">
        <div className="panel stack">
          <h2>Pathway mix</h2>
          <ul className="list-plain dash-pathway-list">
            <li>
              <strong>Construction</strong> · {byPathway.construction}
            </li>
            <li>
              <strong>Logistics</strong> · {byPathway.logistics}
            </li>
            <li>
              <strong>Community Support</strong> · {byPathway.community}
            </li>
            <li>
              <strong>Still in foundation</strong> · {byPathway.foundation}
            </li>
          </ul>
        </div>
        <div className="panel stack">
          <h2>Learning gaps to support</h2>
          {gapLearners.length === 0 ? (
            <p className="muted">No remediation or safety blocks flagged right now.</p>
          ) : (
            <ul className="list-plain">
              {gapLearners.map((g) => (
                <li key={g.id}>
                  <strong>{g.name}</strong> · {g.pathway}
                  {g.needsHelp > 0 && ` · ${g.needsHelp} remediation`}
                  {g.blocked && ' · safety blocked'}
                </li>
              ))}
            </ul>
          )}
          <Link className="btn btn-ghost" to="/app/instructor/students">
            Open learner list
          </Link>
        </div>
      </div>

      <div className="panel stack">
        <h2>Classes</h2>
        <ul className="list-plain">
          {db.schedules.map((s) => (
            <li key={s.id}>
              {s.title} · {new Date(s.starts_at).toLocaleString()} · {s.location}
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
    void gradeSubmission(user!.uid, submissionId, gradeVal, feedback).then(() => setMsg('Grade saved.'))
  }

  return (
    <div className="stack">
      <h1>Assignments to review</h1>
      {msg && <div className="alert ok">{msg}</div>}
      {rows.length === 0 && <p className="muted">No submissions yet.</p>}
      {rows.map(({ sub, assignment, user: learner }) => (
        <div className="panel stack" key={sub.id}>
          <h2>{assignment?.title}</h2>
          <p className="muted">
            {learner?.full_name} · {sub.status}
            {sub.grade != null ? ` · ${sub.grade}/100` : ''}
          </p>
          <p>{sub.content}</p>
          {sub.status === 'submitted' && (
            <form onSubmit={(e) => grade(sub.id, e)} className="stack">
              <div className="field">
                <label htmlFor={`grade-${sub.id}`}>Grade (0–100)</label>
                <input id={`grade-${sub.id}`} name="grade" type="number" min={0} max={100} required />
              </div>
              <div className="field">
                <label htmlFor={`fb-${sub.id}`}>Feedback</label>
                <textarea id={`fb-${sub.id}`} name="feedback" required />
              </div>
              <button className="btn btn-primary" type="submit">
                Save grade
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  )
}

export function InstructorStudentsPage() {
  const db = useDb()
  const students = db.students.filter((s) => s.registration_status === 'approved')
  return (
    <div className="stack">
      <h1>Learners</h1>
      <div className="table-wrap panel">
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
                  <td>{s.pathway ?? 'foundation'}</td>
                  <td>
                    <span className={`badge ${gate?.status === 'PASS' ? 'ok' : 'warn'}`}>
                      {gate?.status ?? '—'}
                    </span>
                  </td>
                  <td>{comps.map((c) => c.status).join(', ') || '—'}</td>
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
      <h1>Safety gates</h1>
      <p>Practical stations stay blocked until prerequisites PASS. Overrides are audited.</p>
      {msg && <div className="alert ok">{msg}</div>}
      <ul className="list-plain">
        {db.safety_gate_states.map((g) => {
          const student = db.students.find((s) => s.id === g.student_id)
          const learner = db.users.find((u) => u.uid === student?.uid)
          return (
            <li key={g.id}>
              <strong>{learner?.full_name}</strong> · {g.gate_key} ·{' '}
              <span className={`badge ${g.status === 'PASS' ? 'ok' : 'warn'}`}>{g.status}</span>
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
      setMsg(`Observation saved. Outcome: ${outcome}. Competent requires full demonstrated criteria.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record observation')
    }
  }

  return (
    <div className="stack">
      <h1>Practical observation</h1>
      <p>
        Human assessment only. A video watched or quiz passed is not automatic practical competency.
      </p>
      {gate && (
        <div className={`alert ${gate.status === 'PASS' ? 'ok' : 'warn'}`}>
          Safety gate for selected learner: <strong>{gate.status}</strong>. {gate.reason}
          {gate.status !== 'PASS' && (
            <p style={{ margin: '0.5rem 0 0' }}>
              Set the gate to PASS on Safety gates before you can finalize an observation.
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
          <label htmlFor="comp">Competency</label>
          <select id="comp" value={competencyId} onChange={(e) => setCompetencyId(e.target.value)}>
            {db.competencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
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
                  {r.replaceAll('_', ' ')}
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
