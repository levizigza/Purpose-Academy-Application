/**
 * Purpose Academy doorway P — matches the brand mark.
 * Closed: solid letter P (door flush in the stem).
 * Open: crisp lit doorway through the stem, door swung left, soft floor beam.
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
        viewBox="0 0 520 580"
        role="img"
        aria-label="Purpose Academy doorway"
      >
        <defs>
          <linearGradient id="pa-inner-light" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f7fbff" />
            <stop offset="100%" stopColor="#e8f0fa" />
          </linearGradient>
          <radialGradient id="pa-outer-glow" cx="40%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#dce8f5" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#041526" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pa-floor-beam" x1="0.55" y1="0" x2="0.12" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#dce8f5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0b2f5c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pa-door-face" x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0%" stopColor="#1c528f" />
            <stop offset="50%" stopColor="#0b2f5c" />
            <stop offset="100%" stopColor="#071f3f" />
          </linearGradient>
          <linearGradient id="pa-p-body" x1="0.25" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor="#12457a" />
            <stop offset="100%" stopColor="#0b2f5c" />
          </linearGradient>
        </defs>

        <ellipse className="opening-glow" cx="250" cy="220" rx="190" ry="210" fill="url(#pa-outer-glow)" />
        <polygon
          className="opening-beam"
          points="210,78 275,78 190,560 60,560"
          fill="url(#pa-floor-beam)"
        />

        {/* Clean white doorway cavity — logo-like, not yellow */}
        <rect
          className="opening-doorway-light"
          x="188"
          y="72"
          width="62"
          height="428"
          fill="url(#pa-inner-light)"
        />

        <path
          className="opening-p-body"
          fill="url(#pa-p-body)"
          fillRule="evenodd"
          d="
            M188 64h138c82 0 136 50 136 128s-54 128-136 128H250v204H188V64z
            M250 128h76c40 0 64 24 64 54s-24 54-64 54h-76V128z
            M188 64h62v436H188z
          "
        />

        {/* Crisp doorway outline drawn on top — top + right frame like the logo */}
        <g className="opening-door-frame">
          <rect x="186" y="64" width="66" height="9" fill="#f4f8fc" />
          <rect x="245" y="64" width="8" height="436" fill="#ffffff" />
          <rect x="186" y="64" width="6" height="436" fill="#e8f0fa" opacity="0.85" />
          <rect x="186" y="492" width="67" height="8" fill="#dce8f5" />
        </g>

        <g className="opening-door-leaf">
          <rect x="188" y="64" width="62" height="436" fill="url(#pa-door-face)" />
          <rect
            x="198"
            y="88"
            width="42"
            height="165"
            rx="3"
            fill="none"
            stroke="#071f3f"
            strokeWidth="3"
            opacity="0.35"
          />
          <rect
            x="198"
            y="280"
            width="42"
            height="185"
            rx="3"
            fill="none"
            stroke="#071f3f"
            strokeWidth="3"
            opacity="0.35"
          />
          <circle cx="230" cy="280" r="9" fill="#f7fafc" />
          <circle cx="230" cy="280" r="3.5" fill="#0b2f5c" opacity="0.35" />
        </g>
      </svg>
    </div>
  )
}
