import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { Reveal } from '../components/Motion'
import { DEMO_PASSWORDS } from '../data/seed'
import { useSession } from '../auth/Session'
import { markSequenceComplete } from './sequenceProgress'
import { JOURNEY_STEPS } from '../student/journeyCurriculum'

const INSTRUCTOR_IDS: Record<string, string> = {
  'INS-001': 'instructor@purposeacademy.ca',
  'PA-INS-001': 'instructor@purposeacademy.ca',
  JORDAN: 'instructor@purposeacademy.ca',
}

export function StudentEnterPage() {
  const navigate = useNavigate()
  const { user, student } = useSession()

  return (
    <div className="shell-main stack enter-flow train-welcome">
      <Reveal as="header" className="train-welcome-header stack">
        <img src={BRAND_ASSETS.logoMark} alt="" className="train-welcome-mark" />
        <p className="train-kicker">Student Training Path</p>
        <h1 className="train-welcome-title">Your path to work</h1>
        <p className="train-welcome-lede">
          20 clear steps. Pictures and words. From login to a job connection — we walk with you.
        </p>
      </Reveal>

      <Reveal className="train-welcome-cta" delay={80}>
        <div className="hero-actions">
          {user?.role === 'student' && student?.registration_status === 'approved' ? (
            <button type="button" className="btn btn-primary" onClick={() => navigate('/journey')}>
              Continue my path
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => navigate('/journey')}>
              Begin training
            </button>
          )}
          <Link className="btn btn-secondary on-light" to="/login?role=student">
            I already have an account
          </Link>
        </div>
      </Reveal>

      <Reveal className="train-step-list" delay={140}>
        <h2 className="train-step-list-heading">All 20 training steps</h2>
        <ol className="train-step-roster">
          {JOURNEY_STEPS.map((s) => (
            <li key={s.n}>
              <span className="train-step-num">{s.n}</span>
              <span className="train-step-name">{s.title}</span>
              <span className="train-step-desc">{s.help}</span>
            </li>
          ))}
        </ol>
      </Reveal>
    </div>
  )
}

export function AdminEnterPage() {
  return (
    <div className="shell-main stack enter-flow">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Admin</p>
        <h1>Admin doors</h1>
        <p className="lede">Choose how you need to enter. Full admin tools come after sign-in.</p>
      </Reveal>

      <div className="enter-choice-grid">
        <Reveal as="article" className="panel stack enter-choice" delay={60}>
          <span className="enter-choice-num" aria-hidden>
            1
          </span>
          <h2>Contact Admin</h2>
          <p>Need help with accounts, approvals, or school records? Send a short message.</p>
          <Link className="btn btn-primary" to="/enter/admin/contact">
            Contact Admin
          </Link>
        </Reveal>
        <Reveal as="article" className="panel stack enter-choice" delay={140}>
          <span className="enter-choice-num" aria-hidden>
            2
          </span>
          <h2>Employed / Guest</h2>
          <p>Employers and guests can request access or ask about learner evidence.</p>
          <Link className="btn btn-primary" to="/enter/admin/guest">
            Make a request
          </Link>
        </Reveal>
      </div>

      <Reveal delay={200}>
        <p className="muted">
          Staff with an account:{' '}
          <Link className="inline-link" to="/login?role=admin">
            Sign in as Admin
          </Link>
        </p>
      </Reveal>
    </div>
  )
}

export function AdminContactSequencePage() {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    markSequenceComplete('admin-contact', { detail: name.trim() || 'Visitor' })
    setSent(true)
  }

  return (
    <div className="shell-main stack enter-flow">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Admin · Sequence 1</p>
        <h1>Contact Admin</h1>
        <p className="lede">Write a short note. We will reply by email.</p>
      </Reveal>
      <Reveal className="panel auth-card stack" delay={80}>
        {sent ? (
          <>
            <div className="alert ok">Thank you, {name || 'friend'}. Your message was saved for the admin team.</div>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/sequences">
                See all sequences
              </Link>
              <Link className="btn btn-secondary" to="/">
                Back home
              </Link>
            </div>
          </>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="admin-contact-name">Your name</label>
              <input
                id="admin-contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="admin-contact-msg">Your message</label>
              <textarea
                id="admin-contact-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Send to Admin
            </button>
            <p className="muted">
              Or email{' '}
              <a className="inline-link" href={`mailto:${BRAND.contactEmail}`}>
                {BRAND.contactEmail}
              </a>
            </p>
          </form>
        )}
        <Link className="btn btn-ghost" to="/enter/admin">
          ← Back
        </Link>
      </Reveal>
    </div>
  )
}

export function AdminGuestSequencePage() {
  const [sent, setSent] = useState(false)
  const [kind, setKind] = useState('employer')
  const [name, setName] = useState('')
  const [detail, setDetail] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    markSequenceComplete('admin-guest', { detail: `${kind}:${name.trim() || 'Visitor'}` })
    setSent(true)
  }

  return (
    <div className="shell-main stack enter-flow">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Admin · Sequence 2</p>
        <h1>Employed / Guest request</h1>
        <p className="lede">Tell us who you are and what you need. Keep it simple.</p>
      </Reveal>
      <Reveal className="panel auth-card stack" delay={80}>
        {sent ? (
          <>
            <div className="alert ok">Request received. An admin will review it soon.</div>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/sequences">
                See all sequences
              </Link>
              <Link className="btn btn-secondary" to="/">
                Back home
              </Link>
            </div>
          </>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="guest-kind">I am a…</label>
              <select id="guest-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="employer">Employer / supervisor</option>
                <option value="guest">Guest</option>
                <option value="partner">Community partner</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="guest-name">Your name</label>
              <input
                id="guest-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="guest-detail">What do you need?</label>
              <textarea
                id="guest-detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                required
                rows={4}
                placeholder="Example: I want to see a Skills Passport for a learner."
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Send request
            </button>
          </form>
        )}
        <Link className="btn btn-ghost" to="/enter/admin">
          ← Back
        </Link>
      </Reveal>
    </div>
  )
}

export function InstructorEnterPage() {
  const navigate = useNavigate()
  const { login } = useSession()
  const [idNumber, setIdNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const key = idNumber.trim().toUpperCase()
    const email = INSTRUCTOR_IDS[key]
    if (!email) {
      setError('ID not found. Try INS-001 for the demo.')
      return
    }
    setBusy(true)
    const result = await login(email, DEMO_PASSWORDS.instructor)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    markSequenceComplete('instructor', { detail: key })
    navigate(result.href || '/app/instructor', { replace: true })
  }

  return (
    <div className="shell-main stack enter-flow">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Instructor</p>
        <h1>Enter with your ID</h1>
        <p className="lede">Type your instructor ID number. It takes you into teaching tools.</p>
      </Reveal>
      <Reveal className="panel auth-card stack" delay={80}>
        <form className="stack" onSubmit={onSubmit}>
          {error && <div className="alert error">{error}</div>}
          <div className="field">
            <label htmlFor="instructor-id">Instructor ID number</label>
            <input
              id="instructor-id"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="INS-001"
              required
              autoComplete="username"
              inputMode="text"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Opening…' : 'Enter as Instructor'}
          </button>
          <p className="muted">Demo ID: <code>INS-001</code></p>
        </form>
        <Link className="btn btn-ghost" to="/login?role=instructor">
          Sign in with email instead
        </Link>
      </Reveal>
    </div>
  )
}
