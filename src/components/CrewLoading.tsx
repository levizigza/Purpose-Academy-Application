import { useEffect, useState } from 'react'
import { BRAND } from '../brand/copy'
import {
  beginCrewSoundscape,
  endCrewSoundscape,
  isFoleyMuted,
  playFoley,
  setFoleyMuted,
  subscribeFoley,
  unlockFoley,
} from '../audio/foley'

const CREW_LINES = [
  'Crew is setting up your lesson…',
  'Hard hats on — almost ready…',
  'Laying out tools on the bench…',
  'Checking the bay for your next step…',
  'Measuring twice — loading once…',
]

/** Animated SiteWise-style construction crew for loading / transitions. */
export function ConstructionCrew({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={`crew-svg${compact ? ' is-compact' : ''}`}
      viewBox="0 0 360 160"
      role="img"
      aria-label="Construction crew working"
    >
      {/* Ground / site floor */}
      <rect x="0" y="132" width="360" height="28" fill="#1a2a3c" />
      <rect x="0" y="132" width="360" height="4" fill="#e8a317" opacity="0.55" />
      {/* Distant framing studs */}
      <g opacity="0.35" stroke="#4a6280" strokeWidth="3">
        <line x1="28" y1="40" x2="28" y2="132" />
        <line x1="56" y1="52" x2="56" y2="132" />
        <line x1="84" y1="36" x2="84" y2="132" />
        <line x1="300" y1="48" x2="300" y2="132" />
        <line x1="328" y1="40" x2="328" y2="132" />
      </g>

      {/* Worker A — hammer swing */}
      <g className="crew-worker crew-a">
        <ellipse cx="118" cy="128" rx="22" ry="5" fill="#0b1522" opacity="0.35" />
        {/* Legs */}
        <path d="M108 128 L112 96 L124 96 L128 128" fill="#1e3a5f" />
        {/* Torso */}
        <rect x="106" y="70" width="24" height="30" rx="4" fill="#c9840e" />
        {/* Hard hat */}
        <ellipse cx="118" cy="58" rx="14" ry="8" fill="#f5c542" />
        <rect x="104" y="58" width="28" height="4" rx="1" fill="#e8a317" />
        {/* Head */}
        <circle cx="118" cy="64" r="8" fill="#d4a574" />
        {/* Arm + hammer */}
        <g className="crew-hammer-arm">
          <path d="M128 78 L148 68" stroke="#d4a574" strokeWidth="5" strokeLinecap="round" />
          <g className="crew-hammer-head">
            <rect x="146" y="52" width="6" height="22" rx="1.5" fill="#8b6914" />
            <rect x="140" y="48" width="18" height="8" rx="1.5" fill="#c0c6ce" />
          </g>
        </g>
      </g>

      {/* Worker B — carrying plank */}
      <g className="crew-worker crew-b">
        <ellipse cx="200" cy="128" rx="26" ry="5" fill="#0b1522" opacity="0.35" />
        <path d="M188 128 L192 98 L208 98 L212 128" fill="#243b5c" />
        <rect x="186" y="72" width="28" height="30" rx="4" fill="#2f6b4f" />
        <ellipse cx="200" cy="60" rx="14" ry="8" fill="#f5c542" />
        <rect x="186" y="60" width="28" height="4" rx="1" fill="#e8a317" />
        <circle cx="200" cy="66" r="8" fill="#c48a5a" />
        <g className="crew-plank">
          <rect x="158" y="78" width="84" height="8" rx="2" fill="#a67c52" />
          <rect x="158" y="78" width="84" height="2" fill="#c4a07a" opacity="0.5" />
        </g>
      </g>

      {/* Worker C — pointing / directing */}
      <g className="crew-worker crew-c">
        <ellipse cx="268" cy="128" rx="20" ry="5" fill="#0b1522" opacity="0.35" />
        <path d="M258 128 L262 98 L274 98 L278 128" fill="#1e3a5f" />
        <rect x="256" y="72" width="24" height="30" rx="4" fill="#0b2f5c" />
        <ellipse cx="268" cy="60" rx="14" ry="8" fill="#f5c542" />
        <rect x="254" y="60" width="28" height="4" rx="1" fill="#e8a317" />
        <circle cx="268" cy="66" r="8" fill="#d4a574" />
        <path className="crew-point" d="M278 82 L302 70" stroke="#d4a574" strokeWidth="5" strokeLinecap="round" />
        {/* Clipboard */}
        <rect x="248" y="86" width="14" height="18" rx="1" fill="#e8eef6" />
        <rect x="250" y="90" width="10" height="2" fill="#8a9ab0" />
        <rect x="250" y="94" width="8" height="2" fill="#8a9ab0" />
      </g>

      {/* Safety cone */}
      <g className="crew-cone">
        <path d="M70 128 L78 96 L86 128 Z" fill="#e86a17" />
        <rect x="72" y="108" width="12" height="4" fill="#f5f7fb" />
      </g>
    </svg>
  )
}

export function FoleyToggle({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const [muted, setMuted] = useState(isFoleyMuted)

  useEffect(() => subscribeFoley(() => setMuted(isFoleyMuted())), [])

  return (
    <button
      type="button"
      className={`foley-toggle${muted ? ' is-muted' : ''}${compact ? ' is-compact' : ''} ${className}`.trim()}
      aria-pressed={!muted}
      aria-label={muted ? 'Turn construction sounds on' : 'Turn construction sounds off'}
      onClick={() => {
        const next = !muted
        if (!next) {
          void unlockFoley().then(() => {
            setFoleyMuted(false)
            playFoley('hammer')
          })
        } else {
          setFoleyMuted(true)
        }
        setMuted(next)
      }}
    >
      <span className="foley-toggle-icon" aria-hidden>
        {muted ? (
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="currentColor"
              d="M4 9v6h3l5 4V5L7 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v2.2c.6.4 1 1 1 1.8s-.4 1.4-1 1.8V16a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1A7 7 0 0 1 19 12a7 7 0 0 1-5 6.7v2.1A9 9 0 0 0 21 12a9 9 0 0 0-7-8.8z"
            />
            <path fill="currentColor" d="M3 4l17 17-1.4 1.4L1.6 5.4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="currentColor"
              d="M4 9v6h3l5 4V5L7 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v2.2c.6.4 1 1 1 1.8s-.4 1.4-1 1.8V16a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1A7 7 0 0 1 19 12a7 7 0 0 1-5 6.7v2.1A9 9 0 0 0 21 12a9 9 0 0 0-7-8.8z"
            />
          </svg>
        )}
      </span>
      {!compact && <span>{muted ? 'Sounds off' : 'Site sounds'}</span>}
    </button>
  )
}

type LoadingProps = {
  label?: string
  /** When true, plays ambient site bed while visible. */
  withSound?: boolean
  compact?: boolean
}

/**
 * Full-screen (or inline) loading with construction crew —
 * the SiteWise-style beat learners see between doors and lessons.
 */
export function CrewLoadingScreen({
  label = 'Opening your training…',
  withSound = true,
  compact = false,
}: LoadingProps) {
  const [lineIdx, setLineIdx] = useState(0)
  const line = label || CREW_LINES[lineIdx % CREW_LINES.length]

  useEffect(() => {
    if (!withSound) return
    beginCrewSoundscape()
    return () => endCrewSoundscape()
  }, [withSound])

  useEffect(() => {
    if (label) return
    const id = window.setInterval(() => setLineIdx((i) => i + 1), 2200)
    return () => window.clearInterval(id)
  }, [label])

  return (
    <div className={`crew-loading${compact ? ' is-compact' : ''}`} role="status" aria-live="polite">
      <div className="crew-loading-inner">
        <p className="crew-brand">{BRAND.name}</p>
        <ConstructionCrew compact={compact} />
        <div className="crew-loading-bar" aria-hidden>
          <span />
        </div>
        <p className="crew-loading-label">{line}</p>
        <p className="crew-loading-sub muted">Hard hats on. One step at a time.</p>
        <FoleyToggle className="crew-foley" />
      </div>
    </div>
  )
}

/** Brief crew curtain between journey steps. */
export function StepTransition({
  active,
  message = 'Moving to the next station…',
}: {
  active: boolean
  message?: string
}) {
  if (!active) return null
  return (
    <div className="crew-transition" role="status" aria-live="polite">
      <div className="crew-transition-card">
        <ConstructionCrew compact />
        <p>{message}</p>
        <div className="crew-loading-bar" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  )
}
