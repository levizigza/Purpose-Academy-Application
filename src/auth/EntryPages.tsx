import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { AmbientField } from '../components/Motion'
import { OpeningDoorMark } from '../components/OpeningDoor'

const ENTERED_KEY = 'pa-crossed-threshold'

export function hasEnteredSite() {
  try {
    return sessionStorage.getItem(ENTERED_KEY) === '1'
  } catch {
    return false
  }
}

export function markEnteredSite() {
  try {
    sessionStorage.setItem(ENTERED_KEY, '1')
  } catch {
    /* ignore */
  }
}

type DoorStage = 'closed' | 'opening' | 'open'
type SplashStage = DoorStage | 'logo' | 'ready'

export function SplashPage({ onEnter }: { onEnter?: () => void } = {}) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<SplashStage>('closed')

  const enter = useCallback(() => {
    markEnteredSite()
    if (onEnter) onEnter()
    else navigate('/', { replace: true })
  }, [navigate, onEnter])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStage('ready')
      return
    }
    const t1 = window.setTimeout(() => setStage('opening'), 450)
    const t2 = window.setTimeout(() => setStage('open'), 1450)
    const t3 = window.setTimeout(() => setStage('logo'), 2100)
    const t4 = window.setTimeout(() => setStage('ready'), 2700)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
    }
  }, [])

  useEffect(() => {
    if (stage !== 'ready') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        enter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, enter])

  const doorStage: DoorStage = stage === 'logo' || stage === 'ready' ? 'open' : stage
  const showLogo = stage === 'logo' || stage === 'ready'
  const showPrompt = stage === 'ready'

  return (
    <div
      className={`splash splash-opening${showPrompt ? ' is-ready' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} opening`}
      onClick={showPrompt ? enter : undefined}
    >
      <AmbientField variant="hero" />
      <div className="splash-stage">
        <h1 className="sr-only">{BRAND.name}</h1>

        <div className={`splash-door-wrap${showLogo ? ' is-fading' : ''}`} aria-hidden={showLogo}>
          <OpeningDoorMark stage={doorStage} />
        </div>

        <img
          className={`splash-logo-full${showLogo ? ' is-visible' : ''}`}
          src={BRAND_ASSETS.logoFull}
          alt={BRAND.name}
        />

        <p className={`splash-enter${showPrompt ? ' is-visible' : ''}`} aria-live="polite">
          Press <kbd>Enter</kbd> to continue
        </p>
        {showPrompt && (
          <button type="button" className="btn btn-ghost splash-enter-btn" onClick={enter}>
            Enter the site
          </button>
        )}
      </div>
    </div>
  )
}

export function WelcomePage() {
  return (
    <div className="shell-main" style={{ maxWidth: 720 }}>
      <div className="panel stack auth-card" style={{ width: 'min(100%, 560px)' }}>
        <img src={BRAND_ASSETS.logoFull} alt="" style={{ width: 160, height: 'auto' }} />
        <p className="section-kicker">{BRAND.name}</p>
        <h1>Welcome to training</h1>
        <p className="lede">
          Sign in to continue your path, or create a student account to join {BRAND.name}.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/login">
            {BRAND.secondaryCta}
          </Link>
          <Link className="btn btn-ghost" to="/register">
            Create student account
          </Link>
        </div>
        <p className="muted">
          Need help? <Link to="/contact">Contact support</Link> · Read about programs on the{' '}
          <Link to="/">website</Link>.
        </p>
      </div>
    </div>
  )
}

export function RoleSelectionPage() {
  return (
    <div className="shell-main">
      <div className="panel auth-card stack">
        <p className="section-kicker">{BRAND.name}</p>
        <h1>Who are you signing in as?</h1>
        <p className="lede">Choose your role. You will use the same email and password on the next screen.</p>
        <div className="role-pick">
          <Link to="/login?role=student">Learner — learn and practise</Link>
          <Link to="/login?role=instructor">Instructor — teach and assess</Link>
          <Link to="/login?role=admin">Admin — approve and manage</Link>
        </div>
        <p className="muted">
          <Link to="/login">Skip and go straight to sign in</Link>
        </p>
      </div>
    </div>
  )
}
