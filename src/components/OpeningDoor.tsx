/**
 * Doorway mark — the stem of the P is a hinged shop door.
 *
 * Daylight through architecture: soft morning light clipped to the open
 * stem cavity (logo P proportions). No harsh gold sun, no bowl glow,
 * no top poke. Creative license on the open (crack → breathe → commit).
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  return (
    <div className={`doorway doorway-${stage}`} aria-hidden>
      <svg className="doorway-frame" viewBox="0 0 128 128" role="presentation">
        <defs>
          <clipPath id="doorway-cavity-clip">
            <rect x="48" y="28" width="14" height="90" rx="0.4" />
          </clipPath>
          {/* Natural morning light — soft white with cool sky + warm wall bounce */}
          <radialGradient id="doorway-day" cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#FFFEFA" />
            <stop offset="35%" stopColor="#F3F0E8" />
            <stop offset="70%" stopColor="#E4EAF2" />
            <stop offset="100%" stopColor="#C5D0DE" />
          </radialGradient>
          <linearGradient id="doorway-beam" x1="0.35" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#F0E8D8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="doorway-p-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E3A6E" />
            <stop offset="55%" stopColor="#0B2F5C" />
            <stop offset="100%" stopColor="#071E3D" />
          </linearGradient>
          <linearGradient id="doorway-spill" x1="0.5" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#E8EEF5" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soft pool from the mouth — daylight on the floor, not a yellow sun */}
        <g className="doorway-prelight doorway-spill-layer">
          <polygon points="48,118 62,118 68,128 34,128" fill="url(#doorway-spill)" />
        </g>

        <g className="doorway-prelight" clipPath="url(#doorway-cavity-clip)">
          <rect x="48" y="30" width="14" height="88" fill="url(#doorway-day)" />
          {/* Soft volumetric streaks — creative, not literal geometry */}
          <polygon points="50,30 54,30 58,118 49,118" fill="url(#doorway-beam)" opacity="0.85" />
          <polygon points="55,30 59,30 62,118 56,118" fill="url(#doorway-beam)" opacity="0.45" />
          {/* Dust motes — tiny living light inside the empty space */}
          <g className="doorway-motes" opacity="0.55">
            <circle cx="52.5" cy="48" r="0.55" fill="#FFFEF8" />
            <circle cx="56" cy="62" r="0.4" fill="#FFFEF8" />
            <circle cx="53" cy="78" r="0.5" fill="#F5F0E6" />
            <circle cx="57.5" cy="92" r="0.35" fill="#FFFEF8" />
            <circle cx="54" cy="105" r="0.45" fill="#E8EEF5" />
          </g>
          <rect x="48" y="28" width="14" height="2.4" fill="#071E3D" opacity="0.45" />
          <rect x="60.2" y="30" width="1.5" height="88" fill="#FFFEF8" opacity="0.28" />
          <rect x="48" y="30" width="1.4" height="88" fill="#071E3D" opacity="0.35" />
        </g>

        <path
          className="doorway-p-body"
          fill="url(#doorway-p-ink)"
          fillRule="evenodd"
          d="
            M46 22h34c20 0 34 13 34 32s-14 32-34 32H64v42H46V22z
            M64 70h16c8 0 14-5 14-12s-6-12-14-12H64v24z
            M48 28h14v90H48z
          "
        />
        <rect x="46" y="22" width="18" height="6.5" fill="#0B2F5C" />
        <rect x="46" y="22" width="2.15" height="96" fill="#0B2F5C" />
        <rect x="61.85" y="22" width="2.15" height="96" fill="#0B2F5C" />
      </svg>

      <div className="doorway-hinge">
        <div className="doorway-leaf">
          <div className="doorway-leaf-edge" />
          <div className="doorway-leaf-face doorway-leaf-front">
            <span className="doorway-panel doorway-panel-top" />
            <span className="doorway-panel doorway-panel-bot" />
            <span className="doorway-rail" />
            <span className="doorway-hinge-pin doorway-hinge-pin-a" />
            <span className="doorway-hinge-pin doorway-hinge-pin-b" />
            <span className="doorway-knob" />
          </div>
          <div className="doorway-leaf-face doorway-leaf-back">
            <span className="doorway-panel doorway-panel-top" />
            <span className="doorway-panel doorway-panel-bot" />
          </div>
        </div>
      </div>

      <div className="doorway-lintel" />
    </div>
  )
}
