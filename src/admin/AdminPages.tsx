import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { RegistrationStatusLabel } from '../components/Ui'
import {
  createAnnouncement,
  foundationProgress,
  constructionProgress,
  useDb,
  resetDatabase,
  setRegistrationStatus,
} from '../data/store'

export function AdminDashboardPage() {
  const db = useDb()
  const pending = db.students.filter((s) => s.registration_status === 'pending').length
  const approved = db.students.filter((s) => s.registration_status === 'approved').length
  const audits = db.audit_events.slice(0, 5)

  return (
    <div className="stack">
      <div>
        <p className="section-kicker">Admin</p>
        <h1>Operations</h1>
        <p>Approve learners, keep programs clear, and protect the evidence trail that makes skills trustworthy.</p>
      </div>
      <div className="grid-3">
        <div className="panel">
          <h2>Pending approvals</h2>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{pending}</p>
        </div>
        <div className="panel">
          <h2>Approved students</h2>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{approved}</p>
        </div>
        <div className="panel">
          <h2>Active courses</h2>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>
            {db.courses.filter((c) => c.active).length}
          </p>
        </div>
      </div>
      <div className="panel site-plan stack">
        <h2>Practice feedback inbox</h2>
        <p className="muted" style={{ margin: 0 }}>
          Notes from Chu Chu, Yonas, Kinfe, Saba &amp; Levi while reviewing the full site in Practice Mode.
        </p>
        <Link className="btn btn-primary" to="/app/admin/feedback">
          Open practice feedback
        </Link>
      </div>
      <div className="panel stack">
        <h2>Recent audit events</h2>
        <ul className="list-plain">
          {audits.length === 0 && <li>No privileged changes yet.</li>}
          {audits.map((a) => (
            <li key={a.id}>
              {a.action} · {a.target} · {a.previous_value} → {a.new_value}
              <div className="muted">{new Date(a.at).toLocaleString()} · {a.reason}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function AdminStudentsPage() {
  const { user } = useSession()
  const db = useDb()
  const [msg, setMsg] = useState<string | null>(null)
  if (!user) return null

  return (
    <div className="stack">
      <h1>Approve learners</h1>
      {msg && <div className="alert ok">{msg}</div>}
      <div className="table-wrap panel">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Pathway</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.students.map((s) => {
              const u = db.users.find((x) => x.uid === s.uid)
              return (
                <tr key={s.id}>
                  <td>{u?.full_name}</td>
                  <td>{u?.email}</td>
                  <td>
                    <RegistrationStatusLabel status={s.registration_status} />
                  </td>
                  <td>{s.pathway ?? 'foundation'}</td>
                  <td>
                    {s.registration_status === 'pending' && (
                      <div className="hero-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            setRegistrationStatus(user.uid, s.id, 'approved', 'Documents verified').then(() =>
                              setMsg(`${u?.full_name} approved.`),
                            )
                          }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            setRegistrationStatus(user.uid, s.id, 'rejected', 'Missing documents').then(() =>
                              setMsg(`${u?.full_name} rejected.`),
                            )
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
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

export function AdminCoursesPage() {
  const db = useDb()
  return (
    <div className="stack">
      <h1>Courses</h1>
      <div className="grid-2">
        {db.courses.map((c) => (
          <div className={`panel stack ${c.active ? '' : 'locked-card'}`} key={c.id}>
            <h2>{c.title}</h2>
            <p>{c.description}</p>
            <p className="muted">
              {c.category} · {c.active ? 'Active' : 'Inactive'} ·{' '}
              {db.modules.filter((m) => m.course_id === c.id).length} modules
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminSchedulesPage() {
  const db = useDb()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function announce(e: FormEvent) {
    e.preventDefault()
    await createAnnouncement(title, body, 'all')
    setTitle('')
    setBody('')
    setMsg('Announcement published.')
  }

  return (
    <div className="stack">
      <h1>Schedules & communication</h1>
      <div className="panel stack">
        <h2>Class schedule</h2>
        <ul className="list-plain">
          {db.schedules.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong>
              <div className="muted">
                {new Date(s.starts_at).toLocaleString()} · {s.location}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <form className="panel stack" onSubmit={announce}>
        <h2>New announcement</h2>
        {msg && <div className="alert ok">{msg}</div>}
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="body">Message</label>
          <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit">
          Publish
        </button>
      </form>
      <div className="panel stack">
        <h2>Announcements</h2>
        <ul className="list-plain">
          {db.announcements.map((a) => (
            <li key={a.id}>
              <strong>{a.title}</strong>
              <p>{a.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function AdminReportsPage() {
  const db = useDb()
  const rows = db.students.map((s) => {
    const u = db.users.find((x) => x.uid === s.uid)
    return {
      name: u?.full_name ?? s.id,
      status: s.registration_status,
      foundation: foundationProgress(s.id),
      construction: constructionProgress(s.id),
      pathway: s.pathway ?? '—',
      competent: db.learner_competencies.filter(
        (c) => c.student_id === s.id && c.status === 'competent',
      ).length,
    }
  })

  return (
    <div className="stack">
      <h1>Reports</h1>
      <p className="muted">
        Enrollment / completion / competency snapshot. Definitions: completion means program requirements, not mere
        account activity. Competent requires authorized human assessment.
      </p>
      <div className="table-wrap panel">
        <table className="data">
          <thead>
            <tr>
              <th>Learner</th>
              <th>Registration</th>
              <th>Foundation %</th>
              <th>Pathway</th>
              <th>Construction %</th>
              <th>Competent count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.status}</td>
                <td>{r.foundation}</td>
                <td>{r.pathway}</td>
                <td>{r.construction}</td>
                <td>{r.competent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminPrivacyPage() {
  const db = useDb()
  return (
    <div className="stack">
      <h1>Security & privacy</h1>
      <div className="panel stack">
        <h2>What protects this app</h2>
        <ul>
          <li>Passwords stored with bcrypt hashes (not plain text)</li>
          <li>JWT signed sessions with role checks on the server</li>
          <li>Rate limits on API and sign-in / register</li>
          <li>Security headers (frame deny, nosniff, CSP for API)</li>
          <li>Text sanitization on user input</li>
          <li>
            Prompt-injection blocking on free-text fields (assignments, feedback, notes, announcements)
          </li>
          <li>Audit log for approvals, grades, safety overrides, and blocked injection attempts</li>
        </ul>
        <p>
          This demo stores data in a local server file. A production launch should add HTTPS hosting, MFA for admins,
          Postgres, and Alberta PIPA written practices.
        </p>
        <button
          type="button"
          className="btn btn-secondary on-light"
          onClick={() => {
            if (window.confirm('Reset all demo data to seed state?')) void resetDatabase()
          }}
        >
          Reset demo database
        </button>
      </div>
      <div className="panel stack">
        <h2>Audit log</h2>
        <ul className="list-plain">
          {db.audit_events.length === 0 && <li>No events yet.</li>}
          {db.audit_events.map((a) => (
            <li key={a.id}>
              <strong>{a.action}</strong> by {a.actor_uid}
              <div className="muted">
                {a.target}: {a.previous_value} → {a.new_value}
              </div>
              <div className="muted">
                {new Date(a.at).toLocaleString()} · {a.reason}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
