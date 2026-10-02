import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { OpeningDoorMark } from '../components/OpeningDoor'

/** Bump whenever the intro changes so everyone sees the new sequence. */
const ENTERED_KEY = 'pa-crossed-threshold-v8'

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

type SplashStage = 'closed' | 'opening' | 'open' | 'pathways' | 'brand' | 'ready'

const TIMELINE: { at: number; stage: SplashStage }[] = [
  { at: 0, stage: 'closed' },
  { at: 1600, stage: 'opening' },
  { at: 5200, stage: 'open' },
  { at: 7000, stage: 'pathways' },
  { at: 10000, stage: 'brand' },
  { at: 12500, stage: 'ready' },
]

const SMASH_MS = 1400

function HammerIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M14 22c0-2 1.5-4 4-5l18-6c3-1 6 1 7 4l3 9c1 3-1 6-4 7l-8 3"
          fill="#c9840e"
          stroke="#8a5a0a"
          strokeWidth="2"
        />
        <path d="M28 34 L48 54" stroke="#5c3d12" strokeWidth="7" />
        <path d="M28 34 L48 54" stroke="#8b6914" strokeWidth="3.5" />
        <path d="M12 20h22l4 8H16l-4-8z" fill="#e8a317" stroke="#8a5a0a" strokeWidth="1.5" />
        <path d="M16 18v-3h6v3" stroke="#8a5a0a" strokeWidth="2" />
      </g>
    </svg>
  )
}

export function SplashPage({ onEnter }: { onEnter?: () => void } = {}) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<SplashStage>('closed')
  const [smashing, setSmashing] = useState(false)
  const smashLock = useRef(false)

  const finishEnter = useCallback(() => {
    markEnteredSite()
    if (onEnter) onEnter()
    else navigate('/', { replace: true })
  }, [navigate, onEnter])

  const smashIn = useCallback(() => {
    if (smashLock.current || stage !== 'ready') return
    smashLock.current = true
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      finishEnter()
      return
    }
    setSmashing(true)
    window.setTimeout(finishEnter, SMASH_MS)
  }, [stage, finishEnter])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStage('ready')
      return
    }
    const timers = TIMELINE.filter((s) => s.at > 0).map((s) =>
      window.setTimeout(() => setStage(s.stage), s.at),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [])

  useEffect(() => {
    if (stage !== 'ready' || smashing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        smashIn()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, smashing, smashIn])

  const doorStage = stage === 'closed' ? 'closed' : stage === 'opening' ? 'opening' : 'open'
  const showPathways = stage === 'pathways' || stage === 'brand' || stage === 'ready'
  const showBrand = stage === 'brand' || stage === 'ready'
  const showEnter = stage === 'ready' && !smashing

  return (
    <div
      className={[
        'threshold',
        `threshold-stage-${stage}`,
        showBrand ? 'is-brand' : '',
        stage === 'ready' ? 'is-ready' : '',
        smashing ? 'is-smashing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} opening`}
    >
      <div className="threshold-glow" aria-hidden />

      {/* Giant smash hammer — swings in on Enter */}
      {smashing && (
        <div className="threshold-smash-hammer" aria-hidden>
          <HammerIcon />
        </div>
      )}

      <div className={`threshold-stage${smashing ? ' is-shattering' : ''}`}>
        <h1 className="sr-only">{BRAND.name}</h1>

        <div
          className={[
            'threshold-p',
            'threshold-shard',
            'threshold-shard-p',
            showBrand ? 'is-settled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <OpeningDoorMark stage={doorStage} />
        </div>

        <div
          className={`threshold-brand threshold-shard threshold-shard-brand${showBrand ? ' is-visible' : ''}`}
          aria-hidden={!showBrand}
        >
          <p className="threshold-brand-name">
            <span className="threshold-brand-purpose">Purpose</span>
            {' '}
            <span className="threshold-brand-academy">Academy</span>
          </p>
          <p className="threshold-brand-line">Opening doors to a brighter future</p>
        </div>

        <ul
          className={`threshold-pathways threshold-shard threshold-shard-paths${showPathways ? ' is-visible' : ''}`}
          aria-hidden={!showPathways}
        >
          <li className="threshold-path threshold-path-a">
            <img src={BRAND_ASSETS.iconConstruction} alt="" />
            <span>Construction</span>
          </li>
          <li className="threshold-path threshold-path-b">
            <img src={BRAND_ASSETS.iconLogistics} alt="" />
            <span>Logistics</span>
          </li>
          <li className="threshold-path threshold-path-c">
            <img src={BRAND_ASSETS.iconCommunity} alt="" />
            <span>Community Support</span>
          </li>
        </ul>

        {showEnter && (
          <div className="threshold-enter is-visible">
            <button
              type="button"
              className="threshold-hammer"
              onClick={smashIn}
              aria-label="Enter Purpose Academy"
              title="Enter"
            >
              <HammerIcon className="threshold-hammer-icon" />
              <span className="threshold-hammer-label">Enter</span>
            </button>
          </div>
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
