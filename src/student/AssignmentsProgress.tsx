import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { PageHeader, StatusLabel } from '../components/Ui'
import {
  constructionProgress,
  foundationProgress,
  useDb,
  submitAssignment,
} from '../data/store'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function StudentAssignmentsPage() {
  const { student } = useSession()
  const db = useDb()
  if (!student) return null

  const items = db.assignments.filter((a) =>
    db.enrollments.some((e) => e.student_id === student.id && e.course_id === a.course_id),
  )

  return (
    <div className="stack">
      <PageHeader
        title="Assignments"
        help="Open a task, write your answer, then submit. Your instructor will grade it."
        backTo="/app/student"
        backLabel="Home"
      />
      {items.length === 0 ? (
        <div className="panel">
          <p>No assignments yet. Finish more lessons or wait for your instructor to post work.</p>
        </div>
      ) : (
        <ul className="list-plain">
          {items.map((a) => {
            const course = db.courses.find((c) => c.id === a.course_id)
            const sub = db.submissions.find((s) => s.assignment_id === a.id && s.student_id === student.id)
            return (
              <li key={a.id}>
                <strong>{a.title}</strong>
                <p className="muted">
                  {course?.title} · Due {a.due_date} ·{' '}
                  <StatusLabel status={sub?.status ?? 'pending'} />
                  {sub?.grade != null ? ` · Grade ${sub.grade}/100` : ''}
                </p>
                <Link className="btn btn-ghost" to={`/app/student/assignments/${a.id}`}>
                  {sub?.status === 'graded' ? 'View feedback' : 'Open assignment'}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function SubmissionPage() {
  const { assignmentId } = useParams()
  const { student } = useSession()
  const db = useDb()
  const assignment = db.assignments.find((a) => a.id === assignmentId)
  const existing = db.submissions.find(
    (s) => s.assignment_id === assignmentId && s.student_id === student?.id,
  )
  const [content, setContent] = useState(existing?.content ?? '')
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!student || !assignment) return <p>Assignment not found.</p>

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      await submitAssignment(student!.id, assignment!.id, content)
      setMsg('Submitted. Your instructor will review and provide feedback.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title={assignment.title}
        help={assignment.description}
        backTo="/app/student/assignments"
        backLabel="Assignments"
      />
      {existing?.status === 'graded' && (
        <div className="alert ok">
          Graded {existing.grade}/100. Feedback: {existing.feedback || '—'}
        </div>
      )}
      {existing?.status === 'submitted' && !msg && (
        <div className="alert ok">Already submitted. You can update and submit again before grading.</div>
      )}
      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      <form className="panel stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="answer">Your answer</label>
          <textarea
            id="answer"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={existing?.status === 'graded' || busy}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={existing?.status === 'graded' || busy}>
          {busy ? 'Submitting…' : 'Submit answer'}
        </button>
      </form>
    </div>
  )
}

export function StudentProgressPage() {
  const { student } = useSession()
  const db = useDb()
  if (!student) return null
  const f = foundationProgress(student.id)
  const c = constructionProgress(student.id)
  const progress = db.lesson_progress.filter((p) => p.student_id === student.id && p.completed)
  const subs = db.submissions.filter((s) => s.student_id === student.id)

  return (
    <div className="stack">
      <PageHeader
        title="Progress"
        help="See how far you are in foundation and Construction."
        backTo="/app/student"
        backLabel="Home"
      />
      <div className="grid-2">
        <div className="panel stack">
          <h2>Foundation</h2>
          <div className="progress" aria-label={`Foundation ${f}%`}>
            <span style={{ width: `${Math.max(f, f > 0 ? f : 0)}%` }} />
          </div>
          <p>
            <strong>{f}%</strong> complete
          </p>
        </div>
        <div className="panel stack">
          <h2>Specialization</h2>
          <div className="progress" aria-label={`Construction ${student.pathway ? c : 0}%`}>
            <span style={{ width: `${student.pathway ? c : 0}%` }} />
          </div>
          <p>{student.pathway ? <strong>{c}% Construction</strong> : 'Not selected yet'}</p>
        </div>
      </div>
      <div className="panel stack">
        <h2>Completed lessons</h2>
        <ul className="list-plain">
          {progress.length === 0 && <li>No lessons completed yet.</li>}
          {progress.map((p) => {
            const lesson = db.lessons.find((l) => l.id === p.lesson_id)
            return (
              <li key={p.id}>
                {lesson?.title} {p.quiz_score != null ? `· quiz ${p.quiz_score}%` : ''}
                {p.completed_at ? ` · ${formatWhen(p.completed_at)}` : ''}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="panel stack">
        <h2>Assignments</h2>
        <ul className="list-plain">
          {subs.length === 0 && <li>No submissions yet.</li>}
          {subs.map((s) => {
            const a = db.assignments.find((x) => x.id === s.assignment_id)
            return (
              <li key={s.id}>
                {a?.title} · <StatusLabel status={s.status} />
                {s.grade != null ? ` · ${s.grade}/100` : ''}
                {s.feedback ? ` · ${s.feedback}` : ''}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
