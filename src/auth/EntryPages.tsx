import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { OpeningDoorMark } from '../components/OpeningDoor'
import { FoleyToggle } from '../components/CrewLoading'
import { playFoley, unlockFoley } from '../audio/foley'

const ENTERED_KEY = 'pa-crossed-threshold-v24'

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

type SplashStage = 'closed' | 'opening' | 'pathways' | 'ready' | 'smashing'

/** Big P opens and settles static; accents arrive after. */
const TIMELINE: { at: number; stage: SplashStage }[] = [
  { at: 0, stage: 'closed' },
  { at: 700, stage: 'opening' },
  { at: 2000, stage: 'pathways' },
  { at: 3000, stage: 'ready' },
]

/** Flat hammer — ENTER on the handle. */
function EnterHammer({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 48" aria-hidden>
      <rect x="2" y="10" width="36" height="28" rx="3" fill="#c9840e" stroke="#8a5a0a" strokeWidth="1.5" />
      <rect x="5" y="13" width="30" height="22" rx="2" fill="#e8a317" />
      <path d="M2 14 C-4 12 -8 18 -6 24 C-4 30 0 28 2 26 Z" fill="#c9840e" stroke="#8a5a0a" strokeWidth="1.2" />
      <path d="M36 24 H148" stroke="#5c3d12" strokeWidth="12" strokeLinecap="round" />
      <path d="M36 24 H148" stroke="#8b6914" strokeWidth="7" strokeLinecap="round" />
      <path d="M36 24 H148" stroke="#c4a35a" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <text
        x="92"
        y="27.5"
        textAnchor="middle"
        fill="#0b2f5c"
        fontFamily="Montserrat, Arial Black, sans-serif"
        fontSize="11"
        fontWeight="800"
        letterSpacing="0.14em"
      >
        ENTER
      </text>
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
      </article>
      <article className="threshold-path path-logistics">
        <div className="threshold-path-art">
          <img src={BRAND_ASSETS.iconLogistics} alt="" className="path-icon-drive" />
          <span className="path-drive-dust" aria-hidden />
        </div>
        <strong>Logistics</strong>
      </article>
      <article className="threshold-path path-community">
        <div className="threshold-path-art">
          <img src={BRAND_ASSETS.iconCommunity} alt="" className="path-icon-talk" />
          <span className="path-talk-dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </div>
        <strong>Community</strong>
      </article>
    </div>
  )
}

function SmashCracks() {
  return (
    <div className="threshold-smash" aria-hidden>
      <svg className="threshold-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="crack crack-a" d="M48 42 L38 28 L22 18" />
        <path className="crack crack-b" d="M52 44 L68 30 L82 22" />
        <path className="crack crack-c" d="M50 48 L42 62 L28 78" />
        <path className="crack crack-d" d="M52 50 L64 66 L78 84" />
        <path className="crack crack-e" d="M50 46 L50 18" />
        <path className="crack crack-f" d="M50 50 L50 88" />
        <path className="crack crack-g" d="M46 46 L18 52" />
        <path className="crack crack-h" d="M54 46 L86 48" />
      </svg>
      <div className="threshold-shards">
        <span className="shard s1" />
        <span className="shard s2" />
        <span className="shard s3" />
        <span className="shard s4" />
        <span className="shard s5" />
        <span className="shard s6" />
        <span className="shard s7" />
        <span className="shard s8" />
      </div>
      <div className="threshold-impact" />
    </div>
  )
}

export function SplashPage({ onEnter }: { onEnter?: () => void } = {}) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<SplashStage>('closed')

  const finishEnter = useCallback(() => {
    markEnteredSite()
    if (onEnter) onEnter()
    else navigate('/', { replace: true })
  }, [navigate, onEnter])

  const enter = useCallback(() => {
    if (stage === 'smashing') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    void unlockFoley().then(() => {
      playFoley('hammer')
      window.setTimeout(() => playFoley('wood'), 120)
      window.setTimeout(() => playFoley('whoosh'), 280)
    })
    if (reduce) {
      finishEnter()
      return
    }
    setStage('smashing')
    window.setTimeout(finishEnter, 1100)
  }, [stage, finishEnter])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStage('ready')
      return
    }
    const timers = TIMELINE.filter((s) => s.at > 0).map((s) =>
      window.setTimeout(() => {
        setStage((prev) => (prev === 'smashing' ? prev : s.stage))
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
  const showPathways = stage === 'pathways' || stage === 'ready' || stage === 'smashing'
  const showEnter = stage === 'ready' || stage === 'smashing'
  const isSmashing = stage === 'smashing'

  return (
    <div
      className={[
        'threshold',
        `threshold-stage-${stage}`,
        showPathways ? 'is-pathways' : '',
        showEnter ? 'is-ready' : '',
        isSmashing ? 'is-smashing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} opening`}
    >
      <div className="threshold-stage">
        <p className="threshold-school-name">{BRAND.name}</p>

        <div className={`threshold-door-stage is-${stage}`} aria-hidden>
          <div className={`threshold-door-zoom is-${stage === 'smashing' ? 'ready' : stage}`}>
            <div className={`threshold-door-slot${showDoor ? ' is-active' : ' is-open-stay'}`}>
              <OpeningDoorMark stage={doorStage} />
            </div>
          </div>
        </div>

        <PathwayStage active={showPathways && !isSmashing} />
      </div>

      {showEnter && (
        <button
          type="button"
          className={`threshold-hammer is-visible${isSmashing ? ' is-smashing' : ''}`}
          onClick={enter}
          aria-label="Enter Purpose Academy"
          disabled={isSmashing}
        >
          <EnterHammer className="threshold-hammer-icon" />
        </button>
      )}

      {showEnter && !isSmashing && (
        <div className="threshold-foley">
          <FoleyToggle compact />
        </div>
      )}

      {isSmashing && <SmashCracks />}
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
