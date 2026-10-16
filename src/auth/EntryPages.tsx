import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { OpeningDoorMark } from '../components/OpeningDoor'
import { FoleyToggle } from '../components/CrewLoading'
import { playFoley, unlockFoley } from '../audio/foley'

/** Bump when splash craft changes so returning visitors see the new opening. */
const ENTERED_KEY = 'pa-crossed-threshold-v31'

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

/**
 * Pose-to-pose threshold (Illusion of Life craft):
 * breath → closed mark → door chart (anticipate built into spacing) → name →
 * pathways → ready → strike → cross.
 *
 * Door/camera motion uses dense keyframe *timing charts* with linear CSS
 * interpolation so spacing lives in the poses (Thomas & Johnston slow-in/out),
 * not in a single cubic-bezier smear.
 */
type SplashStage =
  | 'breath'
  | 'closed'
  | 'opening'
  | 'named'
  | 'pathways'
  | 'ready'
  | 'striking'
  | 'crossing'

const TIMELINE: { at: number; stage: SplashStage }[] = [
  { at: 0, stage: 'breath' },
  { at: 420, stage: 'closed' },
  { at: 900, stage: 'opening' },
  /* Door chart ~2.25s — name after settle; tighter than v29 wait. */
  { at: 3300, stage: 'named' },
  { at: 3900, stage: 'pathways' },
  { at: 4650, stage: 'ready' },
]

const EXIT_STAGES = new Set<SplashStage>(['striking', 'crossing'])

/** Sledgehammer CTA — tool mass first (head weight, tapered shaft), not a hanging plaque. */
function EnterHammer({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 320" aria-hidden>
      <defs>
        <linearGradient id="sledge-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6d48a" />
          <stop offset="35%" stopColor="#e0a020" />
          <stop offset="100%" stopColor="#6a4208" />
        </linearGradient>
        <linearGradient id="sledge-cheek" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a6570" />
          <stop offset="40%" stopColor="#eef2f6" />
          <stop offset="100%" stopColor="#4a5562" />
        </linearGradient>
        <linearGradient id="sledge-shaft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a1a06" />
          <stop offset="45%" stopColor="#9a7420" />
          <stop offset="100%" stopColor="#3d280c" />
        </linearGradient>
        <filter id="sledge-soft" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#3d280c" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#sledge-soft)">
        {/* Massive head — wider than shaft so it reads as weight */}
        <rect x="22" y="8" width="96" height="72" rx="7" fill="url(#sledge-head)" stroke="#5c3d12" strokeWidth="2.2" />
        <rect x="30" y="16" width="80" height="12" rx="2" fill="#fff1c2" opacity="0.35" />
        <rect x="34" y="58" width="72" height="8" rx="2" fill="#5c3d12" opacity="0.25" />
        {/* Steel cheeks */}
        <rect x="8" y="22" width="18" height="44" rx="3" fill="url(#sledge-cheek)" stroke="#3a4450" strokeWidth="1" />
        <rect x="114" y="22" width="18" height="44" rx="3" fill="url(#sledge-cheek)" stroke="#3a4450" strokeWidth="1" />
        <rect x="11" y="28" width="4" height="30" rx="1" fill="#fff" opacity="0.35" />
        <rect x="125" y="28" width="4" height="30" rx="1" fill="#fff" opacity="0.28" />
        <text
          className="threshold-enter-word"
          x="70"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#041526"
          fontFamily="Montserrat, Arial Black, sans-serif"
          fontSize="17"
          fontWeight="800"
          letterSpacing="0.18em"
        >
          ENTER
        </text>
        {/* Collar */}
        <rect x="56" y="76" width="28" height="18" rx="2" fill="#9aa3ad" stroke="#4a5562" strokeWidth="1.2" />
        {/* Tapered shaft — thick under head, thinner at grip */}
        <path
          d="M62 90 C58 140, 58 190, 60 250 C61 270, 62 285, 70 298 C78 285, 79 270, 80 250 C82 190, 82 140, 78 90 Z"
          fill="url(#sledge-shaft)"
        />
        <path d="M70 92 V290" stroke="#e4c988" strokeWidth="2.2" strokeLinecap="round" opacity="0.28" />
        <rect x="62" y="168" width="16" height="5" rx="1.5" fill="#5c3d12" opacity="0.5" />
        <rect x="62" y="198" width="16" height="5" rx="1.5" fill="#5c3d12" opacity="0.4" />
        {/* Grip butt */}
        <ellipse cx="70" cy="300" rx="14" ry="8" fill="#1e1406" />
        <ellipse cx="70" cy="297" rx="10" ry="4" fill="#8b6914" opacity="0.55" />
      </g>
    </svg>
  )
}

function PathwayStage({ active }: { active: boolean }) {
  return (
    <div className={`threshold-pathways${active ? ' is-live' : ''}`} aria-hidden={!active}>
      <p className="threshold-path-lede">Three doors into work</p>
      <div className="threshold-path-row">
        <article className="threshold-path path-construction">
          <div className="threshold-path-art">
            <img src={BRAND_ASSETS.iconConstruction} alt="" className="path-icon-settle" />
          </div>
          <strong>Construction</strong>
        </article>
        <article className="threshold-path path-logistics">
          <div className="threshold-path-art">
            <img src={BRAND_ASSETS.iconLogistics} alt="" className="path-icon-settle" />
          </div>
          <strong>Logistics</strong>
        </article>
        <article className="threshold-path path-community">
          <div className="threshold-path-art">
            <img src={BRAND_ASSETS.iconCommunity} alt="" className="path-icon-settle" />
          </div>
          <strong>Community</strong>
        </article>
      </div>
    </div>
  )
}

function doorStageFor(stage: SplashStage): 'closed' | 'opening' | 'open' {
  if (stage === 'breath' || stage === 'closed') return 'closed'
  if (stage === 'opening') return 'opening'
  return 'open'
}

function OpeningComposition({
  stage,
  showPathways,
  showName,
}: {
  stage: SplashStage
  showPathways: boolean
  showName: boolean
}) {
  const zoomStage =
    stage === 'breath' || stage === 'closed' ? 'closed' : stage === 'opening' ? 'opening' : 'ready'

  return (
    <div className="threshold-stage">
      <p className={`threshold-school-name${showName ? ' is-live' : ''}`}>{BRAND.name}</p>
      <div className={`threshold-door-stage is-${stage}`} aria-hidden>
        <div className={`threshold-door-zoom is-${zoomStage}`}>
          <div className="threshold-door-slot is-active">
            <OpeningDoorMark stage={doorStageFor(stage)} />
          </div>
        </div>
        <div className="threshold-door-ground" />
      </div>
      <PathwayStage active={showPathways} />
    </div>
  )
}

export function SplashPage({ onEnter }: { onEnter?: () => void } = {}) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<SplashStage>('breath')

  const finishEnter = useCallback(() => {
    markEnteredSite()
    if (onEnter) onEnter()
    else navigate('/', { replace: true })
  }, [navigate, onEnter])

  const enter = useCallback(() => {
    if (EXIT_STAGES.has(stage)) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    void unlockFoley().then(() => {
      playFoley('hammer')
      window.setTimeout(() => playFoley('wood'), 180)
      window.setTimeout(() => playFoley('whoosh'), 480)
    })
    if (reduce) {
      finishEnter()
      return
    }
    setStage('striking')
    window.setTimeout(() => setStage('crossing'), 620)
    window.setTimeout(finishEnter, 1550)
  }, [stage, finishEnter])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStage('ready')
      return
    }
    const timers = TIMELINE.filter((s) => s.at > 0).map((s) =>
      window.setTimeout(() => {
        setStage((prev) => (EXIT_STAGES.has(prev) ? prev : s.stage))
        if (s.stage === 'opening') {
          void unlockFoley().then(() => {
            playFoley('wood')
            window.setTimeout(() => playFoley('wood'), 420)
          })
        }
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

  const showName =
    stage === 'named' ||
    stage === 'pathways' ||
    stage === 'ready' ||
    stage === 'striking' ||
    stage === 'crossing'
  const showPathways =
    stage === 'pathways' || stage === 'ready' || stage === 'striking' || stage === 'crossing'
  const showEnter = stage === 'ready' || stage === 'striking' || stage === 'crossing'
  const exiting = EXIT_STAGES.has(stage)

  return (
    <div
      className={[
        'threshold',
        `threshold-stage-${stage}`,
        showName ? 'is-named' : '',
        showPathways ? 'is-pathways' : '',
        showEnter ? 'is-ready' : '',
        stage === 'striking' ? 'is-striking' : '',
        stage === 'crossing' ? 'is-crossing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} opening`}
    >
      <div className="threshold-atmosphere" aria-hidden />
      <div className="threshold-glass is-live">
        <OpeningComposition stage={stage} showPathways={showPathways} showName={showName} />
      </div>

      <div className={`threshold-cross${stage === 'crossing' ? ' is-active' : ''}`} aria-hidden>
        <div className="threshold-cross-beam" />
      </div>

      {showEnter && (
        <button
          type="button"
          className={`threshold-hammer is-visible${exiting ? ' is-striking' : ''}`}
          onClick={enter}
          aria-label="Enter Purpose Academy"
          disabled={exiting}
        >
          <EnterHammer className="threshold-hammer-icon" />
          <span className="threshold-hammer-hint">Strike to enter</span>
        </button>
      )}

      {showEnter && !exiting && (
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
          Sign in to continue your crew path — one station at a time — or create a student account to
          join {BRAND.name}.
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
          <Link to="/login?role=student">Learner: learn and practise</Link>
          <Link to="/login?role=instructor">Instructor: teach and assess</Link>
          <Link to="/login?role=admin">Admin: approve and manage</Link>
        </div>
        <p className="muted">
          <Link to="/login">Skip and go straight to sign in</Link>
        </p>
      </div>
    </div>
  )
}
