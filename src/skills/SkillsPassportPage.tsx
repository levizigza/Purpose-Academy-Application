import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { PageHeader } from '../components/Ui'
import { useDb } from '../data/store'

export function SkillsPassportPage() {
  const { student, user } = useSession()
  const db = useDb()
  if (!student || !user) return null

  const records = db.learner_competencies.filter((c) => c.student_id === student.id)
  const evidence = db.evidence_records
    .filter((e) => e.student_id === student.id)
    .slice(0, 12)

  return (
    <div className="stack">
      <PageHeader
        kicker="Verified skill"
        title="Skills Passport"
        help="Competencies with dates and assessors. This is not Red Seal, apprenticeship certification, or a guaranteed job."
        backTo="/app/student"
        backLabel="Home"
      />

      <div className="panel stack">
        <h2>Competencies</h2>
        {records.length === 0 ? (
          <p className="muted">No competency records yet. Complete lessons and practical observation.</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Competency</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Date</th>
                  <th>Assessor</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const comp = db.competencies.find((c) => c.id === rec.competency_id)
                  const assessor = db.users.find((u) => u.uid === rec.assessor_uid)
                  return (
                    <tr key={rec.id}>
                      <td>
                        <strong>{comp?.title}</strong>
                        <div className="muted">{comp?.description}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            rec.status === 'competent'
                              ? 'ok'
                              : rec.status === 'remediation_required'
                                ? 'danger'
                                : 'brand'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td>{comp?.version}</td>
                      <td>{rec.assessed_at ? new Date(rec.assessed_at).toLocaleDateString() : '—'}</td>
                      <td>
                        {rec.status === 'competent' || rec.status === 'practised'
                          ? assessor
                            ? `${assessor.full_name} (instructor)`
                            : 'System (learned only)'
                          : assessor?.full_name ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel stack">
        <h2>Evidence timeline</h2>
        <ul className="list-plain">
          {evidence.length === 0 && <li>No evidence recorded yet.</li>}
          {evidence.map((e) => (
            <li key={e.id}>
              <strong>{e.type}</strong> · {e.result} · {new Date(e.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
        <Link className="btn btn-secondary on-light" to="/app/student/progress">
          View progress
        </Link>
      </div>
    </div>
  )
}
