import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSession } from '../auth/Session'
import { NextStepCard, PageHeader, RegistrationStatusLabel } from '../components/Ui'
import {
  constructionProgress,
  enrichCalgary,
  enrichQuote,
  foundationProgress,
  useDb,
} from '../data/store'

export function StudentRegistrationStatusPage() {
  const { student, user } = useSession()
  if (!student || !user) return null

  return (
    <div className="stack">
      <PageHeader
        title="Registration status"
        help="An admin must approve your account before lessons open."
        backTo="/contact"
        backLabel="Need help?"
      />
      <div className="panel stack">
        <RegistrationStatusLabel status={student.registration_status} />
        <p>
          {student.registration_status === 'pending' &&
            'Thank you. Your registration was sent. Please wait for approval. You cannot open lessons yet.'}
          {student.registration_status === 'approved' &&
            'You are approved. Start foundation learning from Home.'}
          {student.registration_status === 'rejected' &&
            `Registration was not approved. ${student.notes || 'Please contact support.'}`}
        </p>
        {student.notes && <p className="muted">Admin note: {student.notes}</p>}
        {student.registration_status === 'approved' ? (
          <Link className="btn btn-primary" to="/app/student">
            Go to Home
          </Link>
        ) : (
          <Link className="btn btn-secondary on-light" to="/contact">
            Contact support
          </Link>
        )}
      </div>
    </div>
  )
}

export function StudentHomePage() {
  const { user, student } = useSession()
  const db = useDb()
  const [quote, setQuote] = useState<{ content: string; author: string; source: string } | null>(null)
  const [weather, setWeather] = useState<string | null>(null)

  useEffect(() => {
    void enrichQuote()
      .then((q) => {
        const bad = /hug|kiss|sex|nude|alcohol|drunk|gambl/i.test(q.content)
        setQuote(bad ? { content: 'Practice every day. Small steps build strong skills.', author: 'Purpose Academy', source: 'local' } : q)
      })
      .catch(() => setQuote(null))
    void enrichCalgary()
      .then((w) =>
        setWeather(`Calgary · ${Math.round(w.current.temperature_2m)}${w.units.temperature_2m}`),
      )
      .catch(() => setWeather(null))
  }, [])

  if (!user || !student) return null

  const fProg = foundationProgress(student.id)
  const cProg = constructionProgress(student.id)
  const nextLesson = (() => {
    const courseId = student.pathway === 'construction' ? 'course-construction' : 'course-foundation'
    const modules = db.modules.filter((m) => m.course_id === courseId).sort((a, b) => a.order - b.order)
    for (const mod of modules) {
      const lessons = db.lessons.filter((l) => l.module_id === mod.id).sort((a, b) => a.order - b.order)
      for (const lesson of lessons) {
        const done = db.lesson_progress.some(
          (p) => p.student_id === student.id && p.lesson_id === lesson.id && p.completed,
        )
        if (!done) return lesson
      }
    }
    return null
  })()
  const upcoming = db.schedules[0]
  const notes = db.notifications.filter((n) => n.user_uid === user.uid).slice(0, 4)
  const pendingAssignments = db.assignments.filter((a) => {
    const enrolled = db.enrollments.some((e) => e.student_id === student.id && e.course_id === a.course_id)
    if (!enrolled) return false
    const sub = db.submissions.find((s) => s.assignment_id === a.id && s.student_id === student.id)
    return !sub || sub.status === 'pending'
  })

  function formatWhen(iso: string) {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }
  const nextStep = !student.foundation_complete
    ? nextLesson
      ? {
          title: nextLesson.title,
          body: `Foundation progress ${fProg}%. Open this lesson to continue.`,
          to: `/app/student/lessons/${nextLesson.id}`,
          cta: 'Continue lesson',
        }
      : {
          title: 'Start foundation',
          body: 'Begin language and communication preparation.',
          to: '/app/student/foundation',
          cta: 'Open foundation',
        }
    : !student.pathway
      ? {
          title: 'Choose Construction',
          body: 'Foundation is complete. Select the Construction pathway to continue.',
          to: '/app/student/programs',
          cta: 'Select program',
        }
      : nextLesson
        ? {
            title: nextLesson.title,
            body: `Construction progress ${cProg}%. Keep going with the next lesson.`,
            to: `/app/student/lessons/${nextLesson.id}`,
            cta: 'Continue lesson',
          }
        : {
            title: 'Review your courses',
            body: 'You are caught up on lessons. Check assignments or your skills passport.',
            to: '/app/student/courses',
            cta: 'Open courses',
          }

  return (
    <div className="stack">
      <PageHeader
        kicker="Your training"
        title={`Hello, ${user.full_name.split(' ')[0]}`}
        help="One clear next step on your path. Follow the button below."
      />

      <NextStepCard {...nextStep} />

      <div className="grid-2">
        <div className="panel stack">
          <h2>Progress</h2>
          <p>
            Foundation: <strong>{fProg}%</strong>
          </p>
          <div className="progress" aria-hidden>
            <span style={{ width: `${fProg}%` }} />
          </div>
          <p>
            Construction: <strong>{student.pathway ? `${cProg}%` : 'Not started'}</strong>
          </p>
          <div className="progress" aria-hidden>
            <span style={{ width: `${student.pathway ? cProg : 0}%` }} />
          </div>
          <Link className="btn btn-secondary on-light" to="/app/student/progress">
            See full progress
          </Link>
        </div>
        <div className="panel stack">
          <h2>Today</h2>
          <ul className="list-plain">
            <li>
              Next class:{' '}
              {upcoming ? `${upcoming.title} · ${formatWhen(upcoming.starts_at)}` : 'None listed'}
            </li>
            <li>
              Open assignments: {pendingAssignments.length}{' '}
              <Link className="inline-link" to="/app/student/assignments">
                View
              </Link>
            </li>
            {weather && <li>{weather}</li>}
          </ul>
          <div className="hero-actions">
            <Link className="btn btn-ghost" to="/app/student/skills">
              Skills Passport
            </Link>
            <Link className="btn btn-secondary on-light" to="/app/student/profile">
              Profile & more
            </Link>
          </div>
        </div>
      </div>

      <div className="panel stack">
        <h2>Notifications</h2>
        {notes.length === 0 ? (
          <p className="muted">No notifications right now.</p>
        ) : (
          <ul className="list-plain">
            {notes.map((n) => (
              <li key={n.id}>
                <strong>{n.title}</strong>
                <br />
                <span className="muted">{n.body}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {quote && (
        <div className="panel quiet">
          <p style={{ marginBottom: '0.35rem' }}>“{quote.content}”</p>
          <p className="muted" style={{ margin: 0 }}>
            — {quote.author}
          </p>
        </div>
      )}
    </div>
  )
}

export function StudentProfilePage() {
  const { user, student, logout } = useSession()
  if (!user || !student) return null
  return (
    <div className="stack">
      <PageHeader
        title="Profile & more"
        help="Your account details and other useful links."
        backTo="/app/student"
        backLabel="Home"
      />
      <div className="panel stack">
        <p>
          <strong>{user.full_name}</strong>
        </p>
        <p className="muted">Student ID: {student.id}</p>
        <p>Email: {user.email}</p>
        <p>Phone: {student.phone}</p>
        <p>Address: {student.address}</p>
        <p>Preferred language: {student.preferred_language}</p>
        <p>Program: {student.pathway ?? 'Foundation (no specialization yet)'}</p>
        <RegistrationStatusLabel status={student.registration_status} />
      </div>
      <div className="panel stack">
        <h2>More pages</h2>
        <ul className="list-plain">
          <li>
            <Link to="/app/student/foundation">Foundation lessons</Link>
          </li>
          <li>
            <Link to="/app/student/programs">Choose program</Link>
          </li>
          <li>
            <Link to="/app/student/progress">Progress details</Link>
          </li>
          <li>
            <Link to="/contact">Get help</Link>
          </li>
          <li>
            <Link to="/">Public website</Link>
          </li>
        </ul>
        <button type="button" className="btn btn-secondary on-light" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  )
}
