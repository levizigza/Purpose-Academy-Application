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

/** Slow, intentional threshold sequence */
type SplashStage =
  | 'hold' // closed P rests
  | 'opening' // door begins to swing
  | 'open' // doorway + light revealed
  | 'wordmark' // name arrives
  | 'pathways' // three program marks assemble
  | 'lockup' // full logo settles as one
  | 'ready' // Enter control

const TIMELINE: { at: number; stage: SplashStage }[] = [
  { at: 0, stage: 'hold' },
  { at: 1800, stage: 'opening' },
  { at: 5200, stage: 'open' },
  { at: 6800, stage: 'wordmark' },
  { at: 8600, stage: 'pathways' },
  { at: 10800, stage: 'lockup' },
  { at: 12800, stage: 'ready' },
]

export function SplashPage({ onEnter }: { onEnter?: () => void } = {}) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<SplashStage>('hold')

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
    const timers = TIMELINE.filter((step) => step.at > 0).map((step) =>
      window.setTimeout(() => setStage(step.stage), step.at),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
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

  const doorStage =
    stage === 'hold' ? 'closed' : stage === 'opening' ? 'opening' : 'open'

  const showMark = stage !== 'lockup' && stage !== 'ready'
  const showWordmark = stage === 'wordmark' || stage === 'pathways'
  const showPathways = stage === 'pathways'
  const showLockup = stage === 'lockup' || stage === 'ready'
  const showEnter = stage === 'ready'
  const brighten = stage !== 'hold'

  return (
    <div
      className={[
        'splash',
        'splash-opening',
        `splash-stage-${stage}`,
        brighten ? 'is-brightening' : '',
        showEnter ? 'is-ready' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} opening`}
    >
      <AmbientField variant="hero" />
      <div className="splash-stage">
        <h1 className="sr-only">{BRAND.name}</h1>

        <div className={`splash-mark-block${showMark ? ' is-visible' : ' is-exiting'}`}>
          <OpeningDoorMark stage={doorStage} />
          <p
            className={`splash-meaning${stage === 'open' || stage === 'wordmark' ? ' is-visible' : ''}`}
            aria-live="polite"
          >
            Opening doors to a brighter future
          </p>
        </div>

        <div className={`splash-assemble${showWordmark || showPathways ? ' is-visible' : ''}`}>
          <p className={`splash-wordmark${showWordmark || showPathways ? ' is-visible' : ''}`}>
            <span className="splash-word-purpose">Purpose</span>{' '}
            <span className="splash-word-academy">Academy</span>
          </p>
          <ul className={`splash-pathways${showPathways ? ' is-visible' : ''}`} aria-hidden={!showPathways}>
            <li className="splash-pathway splash-pathway-construction">
              <img src={BRAND_ASSETS.iconConstruction} alt="" />
              <span>Construction</span>
            </li>
            <li className="splash-pathway splash-pathway-logistics">
              <img src={BRAND_ASSETS.iconLogistics} alt="" />
              <span>Logistics</span>
            </li>
            <li className="splash-pathway splash-pathway-community">
              <img src={BRAND_ASSETS.iconCommunity} alt="" />
              <span>Community Support</span>
            </li>
          </ul>
        </div>

        <img
          className={`splash-logo-full${showLockup ? ' is-visible' : ''}`}
          src={BRAND_ASSETS.logoFull}
          alt={BRAND.name}
        />

        <div className={`splash-enter-tools${showEnter ? ' is-visible' : ''}`}>
          <button type="button" className="btn btn-primary splash-enter-btn" onClick={enter}>
            Enter
          </button>
          <p className="splash-enter-hint">
            or press <kbd>Enter</kbd>
          </p>
        </div>
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
