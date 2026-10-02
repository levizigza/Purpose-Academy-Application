/**
 * Large Purpose Academy P — a real doorway letter.
 * Closed: solid P with door flush in the stem.
 * Open: framed doorway, light through the opening, door swung left like the logo.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  return (
    <div className={`opening-door-scene is-${stage}`} aria-hidden>
      <svg
        className="opening-door-mark"
        viewBox="0 0 420 520"
        role="img"
        aria-label="Purpose Academy doorway"
      >
        <defs>
          <radialGradient id="pa-door-glow" cx="48%" cy="36%" r="52%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#fff8d6" stopOpacity="1" />
            <stop offset="55%" stopColor="#f5c542" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#041526" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pa-door-beam" x1="0.52" y1="0.05" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#fff6c8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f5c542" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pa-door-panel" x1="0" y1="0" x2="1" y2="0.12">
            <stop offset="0%" stopColor="#1c528f" />
            <stop offset="45%" stopColor="#163e72" />
            <stop offset="100%" stopColor="#0a2a52" />
          </linearGradient>
          <linearGradient id="pa-frame-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fff6c8" stopOpacity="0.55" />
          </linearGradient>
          <filter id="pa-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Spill of light once the door opens */}
        <ellipse className="opening-glow" cx="210" cy="190" rx="130" ry="155" fill="url(#pa-door-glow)" />
        <polygon
          className="opening-beam"
          points="175,55 250,55 155,500 35,500"
          fill="url(#pa-door-beam)"
        />

        {/* Outer P letterform — stem hollowed into a doorway */}
        <path
          className="opening-p-body"
          fill="#0b2f5c"
          fillRule="evenodd"
          d="
            M145 48h120c72 0 118 44 118 112s-46 112-118 112h-58v192H145V48z
            M207 102h58c34 0 54 20 54 48s-20 48-54 48h-58V102z
            M145 48h62v416H145z
          "
        />

        {/* Real doorway outline inside the stem: lintel, jambs, threshold */}
        <g className="opening-doorway-frame">
          {/* Inner light rim — reads as the bright doorway edge in the logo */}
          <rect
            className="opening-frame-rim"
            x="151"
            y="54"
            width="50"
            height="404"
            rx="3"
            fill="none"
            stroke="url(#pa-frame-edge)"
            strokeWidth="5"
            opacity="0"
          />
          {/* Left jamb */}
          <rect className="opening-jamb" x="145" y="48" width="10" height="416" fill="#163e72" />
          {/* Right jamb (inner edge of doorway toward the bowl) */}
          <rect className="opening-jamb opening-jamb-right" x="197" y="48" width="10" height="416" fill="#163e72" />
          {/* Lintel / header */}
          <rect className="opening-lintel" x="145" y="48" width="62" height="14" fill="#0a274c" />
          <rect className="opening-lintel-lip" x="149" y="58" width="54" height="6" fill="#1a4a82" opacity="0.85" />
          {/* Threshold / sill */}
          <rect className="opening-sill" x="145" y="452" width="62" height="12" fill="#0a274c" />
          <rect className="opening-sill-lip" x="149" y="448" width="54" height="6" fill="#1a4a82" opacity="0.75" />
          {/* Soft highlight on jambs when open — like light catching the frame */}
          <rect className="opening-jamb-lit" x="155" y="64" width="4" height="384" fill="#fff6c8" opacity="0" />
          <rect className="opening-jamb-lit" x="197" y="64" width="4" height="384" fill="#ffffff" opacity="0" />
        </g>

        {/* Door leaf — flush closed; swings open left like the brand mark */}
        <g className="opening-door-leaf">
          <rect x="155" y="64" width="42" height="384" rx="2" fill="url(#pa-door-panel)" />
          {/* Panel molding — reads as a real door */}
          <rect
            x="162"
            y="78"
            width="28"
            height="150"
            rx="2"
            fill="none"
            stroke="#0b2f5c"
            strokeWidth="2.5"
            opacity="0.45"
          />
          <rect
            x="162"
            y="248"
            width="28"
            height="170"
            rx="2"
            fill="none"
            stroke="#0b2f5c"
            strokeWidth="2.5"
            opacity="0.45"
          />
          <rect x="155" y="64" width="6" height="384" fill="#041526" opacity="0.28" />
          {/* Knob */}
          <circle cx="184" cy="250" r="7.5" fill="#f7fafc" filter="url(#pa-soft-glow)" />
          <circle cx="184" cy="250" r="3" fill="#0b2f5c" opacity="0.4" />
        </g>
      </svg>
    </div>
  )
}
