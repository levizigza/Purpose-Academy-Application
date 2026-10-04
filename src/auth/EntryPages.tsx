import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { OpeningDoorMark } from '../components/OpeningDoor'
import { FoleyToggle } from '../components/CrewLoading'
import { playFoley, unlockFoley } from '../audio/foley'

const ENTERED_KEY = 'pa-crossed-threshold-v26'

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

type SplashStage = 'closed' | 'opening' | 'pathways' | 'ready' | 'smashing' | 'shattering'

/** Big P opens and settles static; accents arrive after. */
const TIMELINE: { at: number; stage: SplashStage }[] = [
  { at: 0, stage: 'closed' },
  { at: 700, stage: 'opening' },
  { at: 2000, stage: 'pathways' },
  { at: 3000, stage: 'ready' },
]

/** Full-screen irregular mirror shards — content stays painted on the glass. */
const MIRROR_SHARDS: { clip: string; dx: string; dy: string; rot: string; delay: string }[] = [
  { clip: 'polygon(0% 0%, 38% 0%, 28% 34%, 0% 42%)', dx: '-14vw', dy: '18vh', rot: '-14deg', delay: '0ms' },
  { clip: 'polygon(38% 0%, 72% 0%, 64% 28%, 28% 34%)', dx: '2vw', dy: '22vh', rot: '8deg', delay: '40ms' },
  { clip: 'polygon(72% 0%, 100% 0%, 100% 36%, 64% 28%)', dx: '18vw', dy: '14vh', rot: '16deg', delay: '20ms' },
  { clip: 'polygon(0% 42%, 28% 34%, 36% 62%, 0% 70%)', dx: '-22vw', dy: '28vh', rot: '-22deg', delay: '70ms' },
  { clip: 'polygon(28% 34%, 64% 28%, 58% 58%, 36% 62%)', dx: '-4vw', dy: '34vh', rot: '4deg', delay: '90ms' },
  { clip: 'polygon(64% 28%, 100% 36%, 100% 68%, 58% 58%)', dx: '24vw', dy: '26vh', rot: '20deg', delay: '55ms' },
  { clip: 'polygon(0% 70%, 36% 62%, 44% 100%, 0% 100%)', dx: '-16vw', dy: '42vh', rot: '-10deg', delay: '110ms' },
  { clip: 'polygon(36% 62%, 58% 58%, 70% 100%, 44% 100%)', dx: '6vw', dy: '46vh', rot: '12deg', delay: '130ms' },
  { clip: 'polygon(58% 58%, 100% 68%, 100% 100%, 70% 100%)', dx: '20vw', dy: '40vh', rot: '18deg', delay: '100ms' },
  { clip: 'polygon(22% 18%, 48% 12%, 52% 40%, 30% 46%)', dx: '-8vw', dy: '30vh', rot: '-6deg', delay: '150ms' },
  { clip: 'polygon(48% 12%, 78% 16%, 74% 44%, 52% 40%)', dx: '10vw', dy: '32vh', rot: '10deg', delay: '160ms' },
  { clip: 'polygon(30% 46%, 52% 40%, 56% 72%, 34% 76%)', dx: '0vw', dy: '48vh', rot: '-4deg', delay: '180ms' },
]

/** Large sledgehammer — ENTER on the head. */
function EnterHammer({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 280" aria-hidden>
      <defs>
        <linearGradient id="sledge-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3cc6a" />
          <stop offset="40%" stopColor="#d99212" />
          <stop offset="100%" stopColor="#7a4e08" />
        </linearGradient>
        <linearGradient id="sledge-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7d8794" />
          <stop offset="35%" stopColor="#e8edf3" />
          <stop offset="70%" stopColor="#b7c0cb" />
          <stop offset="100%" stopColor="#5f6a78" />
        </linearGradient>
        <linearGradient id="sledge-shaft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3d280c" />
          <stop offset="35%" stopColor="#8b6914" />
          <stop offset="65%" stopColor="#c4a35a" />
          <stop offset="100%" stopColor="#4a300e" />
        </linearGradient>
        <linearGradient id="sledge-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7dde5" />
          <stop offset="100%" stopColor="#6d7682" />
        </linearGradient>
      </defs>

      <rect x="16" y="8" width="78" height="58" rx="5" fill="url(#sledge-head)" stroke="#5c3d12" strokeWidth="1.8" />
      <rect x="22" y="16" width="66" height="10" rx="2" fill="#f7db8f" opacity="0.45" />
      <rect x="28" y="48" width="54" height="6" rx="1.5" fill="#5c3d12" opacity="0.28" />
      <rect x="8" y="18" width="14" height="38" rx="2.5" fill="url(#sledge-steel)" stroke="#4a5562" strokeWidth="1" />
      <rect x="88" y="18" width="14" height="38" rx="2.5" fill="url(#sledge-steel)" stroke="#4a5562" strokeWidth="1" />
      <rect x="10" y="24" width="4" height="26" rx="1" fill="#ffffff" opacity="0.35" />
      <rect x="96" y="24" width="4" height="26" rx="1" fill="#ffffff" opacity="0.28" />
      <text
        className="threshold-enter-word"
        x="55"
        y="41"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#041526"
        fontFamily="Montserrat, Arial Black, sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="0.22em"
      >
        ENTER
      </text>
      <rect x="44" y="62" width="22" height="14" rx="2" fill="url(#sledge-band)" stroke="#4a5562" strokeWidth="1" />
      <path d="M55 70 V248" stroke="url(#sledge-shaft)" strokeWidth="18" strokeLinecap="round" />
      <path d="M55 74 V244" stroke="#e4c988" strokeWidth="2.2" strokeLinecap="round" opacity="0.28" />
      <path d="M49 90 V230" stroke="#3d280c" strokeWidth="1.2" opacity="0.25" />
      <path d="M61 95 V225" stroke="#3d280c" strokeWidth="1" opacity="0.18" />
      <rect x="46" y="168" width="18" height="5" rx="1.5" fill="#5c3d12" opacity="0.55" />
      <rect x="46" y="188" width="18" height="5" rx="1.5" fill="#5c3d12" opacity="0.45" />
      <ellipse cx="55" cy="254" rx="11" ry="7" fill="#3d280c" />
      <ellipse cx="55" cy="252" rx="8" ry="4" fill="#8b6914" opacity="0.55" />
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

function OpeningGlass({
  stage,
  showDoor,
  showPathways,
}: {
  stage: SplashStage
  showDoor: boolean
  showPathways: boolean
}) {
  const doorStage = stage === 'closed' ? 'closed' : stage === 'opening' ? 'opening' : 'open'
  const zoomStage = stage === 'smashing' || stage === 'shattering' ? 'ready' : stage

  return (
    <div className="threshold-stage">
      <p className="threshold-school-name">{BRAND.name}</p>
      <div className={`threshold-door-stage is-${stage}`} aria-hidden>
        <div className={`threshold-door-zoom is-${zoomStage}`}>
          <div className={`threshold-door-slot${showDoor ? ' is-active' : ' is-open-stay'}`}>
            <OpeningDoorMark stage={doorStage} />
          </div>
        </div>
      </div>
      <PathwayStage active={showPathways} />
    </div>
  )
}

function MirrorBreak({ children, active }: { children: ReactNode; active: boolean }) {
  return (
    <div className={`mirror-break${active ? ' is-active' : ''}`} aria-hidden>
      <svg className="mirror-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="crack c1" d="M50 48 L36 22 L18 8" />
        <path className="crack c2" d="M50 48 L62 20 L84 6" />
        <path className="crack c3" d="M50 48 L28 54 L6 48" />
        <path className="crack c4" d="M50 48 L74 52 L96 44" />
        <path className="crack c5" d="M50 48 L40 72 L22 94" />
        <path className="crack c6" d="M50 48 L66 74 L88 96" />
        <path className="crack c7" d="M50 48 L50 10" />
        <path className="crack c8" d="M50 48 L50 94" />
        <path className="crack c9" d="M50 48 L34 60 L12 78" />
        <path className="crack c10" d="M50 48 L70 62 L94 76" />
        <path className="crack c11" d="M42 40 L24 28" />
        <path className="crack c12" d="M58 40 L78 26" />
      </svg>
      <div className="mirror-impact" />
      <div className="mirror-shards">
        {MIRROR_SHARDS.map((shard, i) => (
          <div
            key={i}
            className="mirror-shard"
            style={
              {
                clipPath: shard.clip,
                WebkitClipPath: shard.clip,
                '--dx': shard.dx,
                '--dy': shard.dy,
                '--rot': shard.rot,
                '--delay': shard.delay,
              } as CSSProperties
            }
          >
            <div className="mirror-shard-face">{children}</div>
          </div>
        ))}
      </div>
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
    if (stage === 'smashing' || stage === 'shattering') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    void unlockFoley().then(() => {
      playFoley('hammer')
      window.setTimeout(() => playFoley('wood'), 160)
      window.setTimeout(() => playFoley('metal'), 320)
      window.setTimeout(() => playFoley('whoosh'), 520)
    })
    if (reduce) {
      finishEnter()
      return
    }
    setStage('smashing')
    window.setTimeout(() => setStage('shattering'), 480)
    window.setTimeout(finishEnter, 2100)
  }, [stage, finishEnter])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStage('ready')
      return
    }
    const timers = TIMELINE.filter((s) => s.at > 0).map((s) =>
      window.setTimeout(() => {
        setStage((prev) => (prev === 'smashing' || prev === 'shattering' ? prev : s.stage))
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

  const showDoor = stage === 'closed' || stage === 'opening'
  const showPathways = stage === 'pathways' || stage === 'ready' || stage === 'smashing' || stage === 'shattering'
  const showEnter = stage === 'ready' || stage === 'smashing' || stage === 'shattering'
  const isSmashing = stage === 'smashing' || stage === 'shattering'
  const isShattering = stage === 'shattering'
  const glassLive = !isShattering

  const glass = (
    <OpeningGlass
      stage={stage === 'shattering' ? 'ready' : stage}
      showDoor={showDoor}
      showPathways={showPathways && !isShattering}
    />
  )

  return (
    <div
      className={[
        'threshold',
        `threshold-stage-${stage}`,
        showPathways ? 'is-pathways' : '',
        showEnter ? 'is-ready' : '',
        isSmashing ? 'is-smashing' : '',
        isShattering ? 'is-shattering' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} opening`}
    >
      <div className={`threshold-glass${glassLive ? ' is-live' : ' is-gone'}`}>{glass}</div>

      {isSmashing && (
        <MirrorBreak active={isShattering}>
          <OpeningGlass stage="ready" showDoor={false} showPathways />
        </MirrorBreak>
      )}

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
