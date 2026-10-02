/**
 * Purpose Academy threshold mark.
 * Starts as a solid closed P; the stem opens as a door to reveal light —
 * matching the brand mark: opportunity through an open door.
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
        viewBox="0 0 280 320"
        role="img"
        aria-label="Purpose Academy doorway"
      >
        <defs>
          <radialGradient id="opening-glow" cx="48%" cy="40%" r="58%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#fff8d6" stopOpacity="0.98" />
            <stop offset="62%" stopColor="#f5c542" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#041526" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="opening-beam" x1="0.58" y1="0.1" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#fff6c8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f5c542" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="door-face" x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0%" stopColor="#1c508c" />
            <stop offset="45%" stopColor="#163e72" />
            <stop offset="100%" stopColor="#0d2f58" />
          </linearGradient>
        </defs>

        <ellipse className="opening-glow" cx="150" cy="120" rx="78" ry="96" fill="url(#opening-glow)" />
        <polygon className="opening-beam" points="122,42 172,42 102,308 24,308" fill="url(#opening-beam)" />

        {/* P with hollow stem (doorway). Door leaf covers the hollow when closed. */}
        <path
          className="opening-p-body"
          fill="#0b2f5c"
          fillRule="evenodd"
          d="
            M108 36h72c42 0 70 26 70 66s-28 66-70 66h-36v104H108V36z
            M144 64h36c18 0 30 11 30 26s-12 26-30 26h-36V64z
            M108 36h36v236H108z
          "
        />

        {/* Door leaf — closed = solid stem of the P; hinged on left outer edge, swings open left */}
        <g className="opening-door-hinge">
          <g className="opening-door-leaf">
            <rect x="108" y="36" width="36" height="236" rx="1.5" fill="url(#door-face)" />
            <rect x="108" y="36" width="5" height="236" fill="#041526" opacity="0.22" />
            <line x1="118" y1="52" x2="118" y2="256" stroke="#0b2f5c" strokeWidth="1.5" opacity="0.25" />
            <circle className="opening-knob" cx="131" cy="154" r="5.5" fill="#f7fafc" />
            <circle cx="131" cy="154" r="2.1" fill="#0b2f5c" opacity="0.4" />
          </g>
        </g>
      </svg>
    </div>
  )
}
