/**
 * Large Purpose Academy P — starts closed, opens like the brand mark.
 * Stem = door leaf. Closed = solid P. Open = doorway + light + angled door.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  return (
    <div className={`opening-door-scene is-${stage}`} aria-hidden>
      <svg className="opening-door-mark" viewBox="0 0 320 400" role="img" aria-label="Purpose Academy doorway">
        <defs>
          <radialGradient id="pa-door-glow" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff8d6" stopOpacity="1" />
            <stop offset="55%" stopColor="#f5c542" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#041526" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pa-door-beam" x1="0.55" y1="0.08" x2="0.18" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#fff6c8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#f5c542" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pa-door-panel" x1="0" y1="0" x2="1" y2="0.1">
            <stop offset="0%" stopColor="#1a4f8c" />
            <stop offset="50%" stopColor="#163e72" />
            <stop offset="100%" stopColor="#0b2f5c" />
          </linearGradient>
        </defs>

        {/* Light only visible once the door opens */}
        <ellipse className="opening-glow" cx="168" cy="145" rx="95" ry="115" fill="url(#pa-door-glow)" />
        <polygon className="opening-beam" points="138,48 198,48 118,380 28,380" fill="url(#pa-door-beam)" />

        {/* P body with hollow stem (doorway cut out of the stem) */}
        <path
          className="opening-p-body"
          fill="#0b2f5c"
          fillRule="evenodd"
          d="
            M118 40h88c52 0 86 32 86 82s-34 82-86 82h-44v148H118V40z
            M162 78h44c24 0 38 14 38 34s-14 34-38 34h-44V78z
            M118 40h44v312H118z
          "
        />

        {/* Door leaf — covers the stem when closed; swings open left like the logo */}
        <g className="opening-door-leaf">
          <rect x="118" y="40" width="44" height="312" rx="2" fill="url(#pa-door-panel)" />
          <rect x="118" y="40" width="7" height="312" fill="#041526" opacity="0.25" />
          <line x1="132" y1="62" x2="132" y2="330" stroke="#0b2f5c" strokeWidth="2" opacity="0.2" />
          <circle cx="146" cy="190" r="7" fill="#f7fafc" />
          <circle cx="146" cy="190" r="2.6" fill="#0b2f5c" opacity="0.45" />
        </g>
      </svg>
    </div>
  )
}
