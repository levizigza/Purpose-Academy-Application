import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BRAND } from '../brand/copy'
import { DEMO_PASSWORDS } from '../data/seed'
import { isLocalMode, resetDatabase } from '../data/store'
import { homeForRole, useSession } from './Session'

export function LoginPage() {
  const { login, user, student } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const roleHint = params.get('role')
  const [email, setEmail] = useState(
    roleHint === 'instructor'
      ? 'instructor@purposeacademy.ca'
      : roleHint === 'admin'
        ? 'admin@purposeacademy.ca'
        : 'student@purposeacademy.ca',
  )
  const [password, setPassword] = useState<string>(
    roleHint === 'instructor'
      ? DEMO_PASSWORDS.instructor
      : roleHint === 'admin'
        ? DEMO_PASSWORDS.admin
        : DEMO_PASSWORDS.student,
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate(homeForRole(user.role, student?.registration_status), { replace: true })
  }, [user, student, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const result = await login(email, password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.href) navigate(result.href, { replace: true })
  }

  return (
    <div className="shell-main">
      <form className="panel auth-card stack site-plan" onSubmit={onSubmit}>
        <p className="section-kicker">{BRAND.name}</p>
        <h1>{BRAND.secondaryCta}</h1>
        <p className="lede">Enter your email and password to continue.</p>
        {error && <div className="alert error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : BRAND.secondaryCta}
        </button>
        <details className="auth-demo-details">
          <summary>Demo accounts (for testing)</summary>
          {isLocalMode() && (
            <div className="alert ok" style={{ marginTop: '0.65rem' }}>
              Browser demo mode. Training runs in this browser.
              <div style={{ marginTop: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={async () => {
                    await resetDatabase()
                    setError(null)
                    setEmail('student@purposeacademy.ca')
                    setPassword(DEMO_PASSWORDS.student)
                  }}
                >
                  Reset demo data
                </button>
              </div>
            </div>
          )}
          <div className="role-pick" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('student@purposeacademy.ca')
                setPassword(DEMO_PASSWORDS.student)
              }}
            >
              Fill learner demo
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('instructor@purposeacademy.ca')
                setPassword(DEMO_PASSWORDS.instructor)
              }}
            >
              Fill instructor demo
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@purposeacademy.ca')
                setPassword(DEMO_PASSWORDS.admin)
              }}
            >
              Fill admin demo
            </button>
          </div>
        </details>
        <p className="muted">
          <Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create a student account</Link> ·{' '}
          <Link to="/roles">Choose role</Link> · <Link to="/welcome">Back</Link>
        </p>
      </form>
    </div>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="shell-main">
      <form className="panel auth-card stack site-plan" onSubmit={onSubmit} style={{ width: 'min(100%, 560px)' }}>
        <p className="section-kicker">{BRAND.name}</p>
        <h1>Forgot password</h1>
        <p className="lede">
          This demonstration does not send real reset emails. Enter your account email and we will show how to get help
          from {BRAND.name}.
        </p>
        {sent ? (
          <div className="alert ok">
            If an account exists for <strong>{email}</strong>, contact{' '}
            <a className="inline-link" href={`mailto:${BRAND.contactEmail}`}>
              {BRAND.contactEmail}
            </a>{' '}
            to reset access. Demo accounts use the passwords shown on the sign-in page.
          </div>
        ) : (
          <div className="field">
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        {!sent && (
          <button className="btn btn-primary" type="submit">
            Send reset link
          </button>
        )}
        <p className="muted">
          <Link to="/login">Back to sign in</Link> · <Link to="/contact">Help</Link>
        </p>
      </form>
    </div>
  )
}

export function RegisterPage() {
  const { register, user } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    address: 'Calgary, AB',
    emergency_contact: '',
    preferred_language: 'Amharic',
  })

  useEffect(() => {
    if (user) navigate('/app/student/registration', { replace: true })
  }, [user, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    setError(null)
    const err = await register({
      full_name: form.full_name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      emergency_contact: form.emergency_contact,
      preferred_language: form.preferred_language,
    })
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <div className="shell-main">
      <form className="panel auth-card stack site-plan" onSubmit={onSubmit} style={{ width: 'min(100%, 560px)' }}>
        <p className="section-kicker">{BRAND.joinLabel}</p>
        <h1>Create your student account</h1>
        <p className="lede">An admin must approve your registration before training unlocks.</p>
        {error && <div className="alert error">{error}</div>}
        {(
          [
            ['full_name', 'First and last name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone number', 'tel'],
            ['password', 'Password', 'password'],
            ['confirm', 'Confirm password', 'password'],
            ['address', 'Address', 'text'],
            ['emergency_contact', 'Emergency contact', 'text'],
          ] as const
        ).map(([key, label, type]) => (
          <div className="field" key={key}>
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          </div>
        ))}
        <div className="field">
          <label htmlFor="preferred_language">Preferred support language</label>
          <select
            id="preferred_language"
            value={form.preferred_language}
            onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
          >
            <option>English</option>
            <option>Amharic</option>
            <option>Spanish</option>
            <option>Arabic</option>
            <option>Hindi</option>
            <option>Tigrinya</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit registration'}
        </button>
        <p className="muted">Password must be at least 8 characters.</p>
        <p className="muted">
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}
