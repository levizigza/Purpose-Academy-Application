import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { OpeningDoorMark } from '../components/OpeningDoor'
import { FoleyToggle } from '../components/CrewLoading'
import { playFoley, unlockFoley } from '../audio/foley'

const ENTERED_KEY = 'pa-crossed-threshold-v21'

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

type SplashStage = 'closed' | 'opening' | 'pathways' | 'ready'

/** Door opens, then living pathway icons arrive — no logo settle / loading wait. */
const TIMELINE: { at: number; stage: SplashStage }[] = [
  { at: 0, stage: 'closed' },
  { at: 700, stage: 'opening' },
  { at: 2200, stage: 'pathways' },
  { at: 3400, stage: 'ready' },
]

function EnterHammer({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <path d="M58 48 L92 108" stroke="#5c3d12" strokeWidth="14" strokeLinecap="round" />
      <path d="M58 48 L92 108" stroke="#8b6914" strokeWidth="8" strokeLinecap="round" />
      <path d="M58 48 L92 108" stroke="#c4a35a" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <g transform="translate(18 18) rotate(-18)">
        <rect x="0" y="10" width="58" height="28" rx="4" fill="#c9840e" stroke="#8a5a0a" strokeWidth="2" />
        <rect x="4" y="14" width="50" height="20" rx="2" fill="#e8a317" />
        <path d="M0 14 C-10 10 -16 18 -14 24 C-12 30 -6 28 0 26 Z" fill="#c9840e" stroke="#8a5a0a" strokeWidth="1.5" />
        <rect x="54" y="12" width="10" height="24" rx="2" fill="#d99212" stroke="#8a5a0a" strokeWidth="1.5" />
        <text
          x="29"
          y="29"
          textAnchor="middle"
          fill="#0b2f5c"
          fontFamily="Montserrat, Arial Black, sans-serif"
          fontSize="11"
          fontWeight="800"
          letterSpacing="0.08em"
        >
          ENTER
        </text>
      </g>
    </svg>
  )
}

function PathwayStage({ active }: { active: boolean }) {
  return (
    <div className={`threshold-pathways${active ? ' is-live' : ''}`} aria-hidden={!active}>
      <article className="threshold-path path-construction">
        <div className="threshold-path-art">
          <img src={BRAND_ASSETS.iconConstruction} alt="" className="path-icon-bounce" />
        </div>
        <strong>Construction</strong>
        <span>Hard hat on — foundations first</span>
      </article>
      <article className="threshold-path path-logistics">
        <div className="threshold-path-art">
          <img src={BRAND_ASSETS.iconLogistics} alt="" className="path-icon-drive" />
        </div>
        <strong>Logistics</strong>
        <span>Moving goods, moving careers</span>
      </article>
      <article className="threshold-path path-community">
        <div className="threshold-path-art">
          <img src={BRAND_ASSETS.iconCommunity} alt="" className="path-icon-talk" />
        </div>
        <strong>Community</strong>
        <span>People supporting people</span>
      </article>
    </div>
  )
}

export function SplashPage({ onEnter }: { onEnter?: () => void } = {}) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<SplashStage>('closed')

  const enter = useCallback(() => {
    markEnteredSite()
    void unlockFoley().then(() => {
      playFoley('hammer')
      playFoley('whoosh')
    })
    if (onEnter) onEnter()
    else navigate('/', { replace: true })
  }, [navigate, onEnter])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStage('ready')
      return
    }
    const timers = TIMELINE.filter((s) => s.at > 0).map((s) =>
      window.setTimeout(() => {
        setStage(s.stage)
        if (s.stage === 'opening') void unlockFoley().then(() => playFoley('wood'))
        if (s.stage === 'pathways') void unlockFoley().then(() => playFoley('metal'))
      }, s.at),
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

  const doorStage = stage === 'closed' ? 'closed' : stage === 'opening' ? 'opening' : 'open'
  const showDoor = stage === 'closed' || stage === 'opening'
  const showPathways = stage === 'pathways' || stage === 'ready'
  const showEnter = stage === 'ready'

  return (
    <div
      className={[
        'threshold',
        `threshold-stage-${stage}`,
        showPathways ? 'is-pathways' : '',
        showEnter ? 'is-ready' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} opening`}
    >
      <div className="threshold-stage">
        <h1 className="sr-only">{BRAND.name}</h1>
        <p className="threshold-school-name">{BRAND.name}</p>

        <div className={`threshold-door-stage is-${stage}`}>
          <div className={`threshold-door-zoom is-${stage}`}>
            <div className={`threshold-door-slot${showDoor ? ' is-active' : ' is-open-stay'}`}>
              <OpeningDoorMark stage={doorStage} />
            </div>
          </div>
        </div>

        <PathwayStage active={showPathways} />

        {showEnter && (
          <button
            type="button"
            className="threshold-hammer is-visible"
            onClick={enter}
            aria-label="Enter Purpose Academy"
          >
            <EnterHammer className="threshold-hammer-icon" />
          </button>
        )}
        {showEnter && (
          <div className="threshold-foley">
            <FoleyToggle />
          </div>
        )}
      </div>
    </div>
  )
}

export function WelcomePage() {
  return (
    <div className="shell-main" style={{ maxWidth: 720 }}>
      <div className="panel stack auth-card site-crate" style={{ width: 'min(100%, 560px)' }}>
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
      <div className="panel auth-card stack site-crate">
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
