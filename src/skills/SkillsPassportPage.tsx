import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSession } from '../auth/Session'
import { PageHeader, StatusLabel } from '../components/Ui'
import { useDb } from '../data/store'
import type { CompetencyStatus } from '../data/types'
import {
  followUpSummary,
  loadFollowUp,
  type EmploymentFollowUp,
} from '../student/employmentFollowUp'

const LPC_STAGES: { status: CompetencyStatus; title: string; body: string }[] = [
  {
    status: 'learned',
    title: 'Learned',
    body: 'Studied in the app or class — understanding, not yet verified on the job.',
  },
  {
    status: 'practised',
    title: 'Practised',
    body: 'Tried with supervision. Still needs authorized instructor confirmation.',
  },
  {
    status: 'competent',
    title: 'Competent',
    body: 'Authorized instructor confirmed the standard. This is the passport signal.',
  },
]

export function SkillsPassportPage() {
  const { student, user } = useSession()
  const db = useDb()
  const [followUp, setFollowUp] = useState<EmploymentFollowUp | null>(() => loadFollowUp())

  useEffect(() => {
    const sync = () => setFollowUp(loadFollowUp())
    window.addEventListener('pa-employment-followup-changed', sync)
    return () => window.removeEventListener('pa-employment-followup-changed', sync)
  }, [])

  if (!student || !user) return null

  const records = db.learner_competencies.filter((c) => c.student_id === student.id)
  const evidence = db.evidence_records
    .filter((e) => e.student_id === student.id)
    .slice(0, 12)
  const counts = {
    learned: records.filter((r) => r.status === 'learned').length,
    practised: records.filter((r) => r.status === 'practised').length,
    competent: records.filter((r) => r.status === 'competent').length,
    remediation: records.filter((r) => r.status === 'remediation_required').length,
  }
  const pathwayLabel =
    student.pathway === 'logistics'
      ? 'Logistics'
      : student.pathway === 'community'
        ? 'Community Support'
        : student.pathway === 'construction'
          ? 'Construction'
          : 'Foundation'
  const followSummary = followUpSummary(followUp)

  return (
    <div className="stack skills-passport">
      <PageHeader
        kicker="Verified skill"
        title="Skills Passport"
        help="What you studied, practised, and demonstrated — not Red Seal, apprenticeship certification, or a guaranteed job."
        backTo="/app/student"
        backLabel="Home"
      />

      <div className="panel stack skills-passport-summary">
        <div className="skills-passport-meta">
          <div>
            <p className="section-kicker">Learner</p>
            <strong>{user.full_name}</strong>
            <div className="muted">{pathwayLabel} pathway</div>
          </div>
          <div className="skills-passport-lpc-counts" aria-label="Competency stage counts">
            <span className="skills-passport-count">
              <strong>{counts.learned}</strong>
              <span>Learned</span>
            </span>
            <span className="skills-passport-count">
              <strong>{counts.practised}</strong>
              <span>Practised</span>
            </span>
            <span className="skills-passport-count is-competent">
              <strong>{counts.competent}</strong>
              <span>Competent</span>
            </span>
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Purpose Academy documents progress in three stages. Only Competent is instructor-verified.
        </p>
      </div>

      <div className="train-learn-grid skills-passport-stages">
        {LPC_STAGES.map((s) => (
          <article key={s.status} className="skills-passport-stage">
            <StatusLabel status={s.status} />
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </article>
        ))}
      </div>

      <div className="panel stack">
        <h2>Competencies</h2>
        {records.length === 0 ? (
          <p className="muted">
            No competency records yet. Complete lessons and practical observation. A quiz score alone
            cannot mark you Competent.
          </p>
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
                        <StatusLabel status={rec.status} />
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
        {counts.remediation > 0 && (
          <div className="alert warn">
            {counts.remediation} competenc{counts.remediation === 1 ? 'y needs' : 'ies need'} more
            practice before re-observation.
          </div>
        )}
      </div>

      <div className="panel stack">
        <h2>Evidence timeline</h2>
        <p className="muted" style={{ margin: 0 }}>
          Attendance, practical checks, and workplace performance that support passport claims.
        </p>
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

      <div className="panel stack emp-followup">
        <h2>Employment follow-up</h2>
        <p className="muted" style={{ margin: 0 }}>
          Graduation is not the end. Purpose Academy checks in at 30, 90, and 180 days to see whether
          you entered and remained in work.
        </p>
        {!followUp ? (
          <p>
            Follow-up opens when you complete Employment Connection on the training path.{' '}
            <Link className="inline-link" to="/journey">
              Continue training
            </Link>
          </p>
        ) : (
          <>
            <p>
              <strong>{followSummary.label}</strong>
              {followUp.roleGoal ? ` · Goal: ${followUp.roleGoal}` : ''}
            </p>
            <ul className="list-plain emp-followup-list">
              {followUp.checkIns.map((c) => (
                <li key={c.day} className={`emp-followup-item is-${c.status}`}>
                  <div>
                    <strong>Day {c.day}</strong>
                    <div className="muted">Due {new Date(c.dueAt).toLocaleDateString()}</div>
                  </div>
                  <span className="badge">{c.status.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
