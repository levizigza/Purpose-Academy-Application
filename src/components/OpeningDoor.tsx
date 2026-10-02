/**
 * Opening doorway P — open pose is a literal logo-mark.svg (no card background).
 * Closed: solid P. Door slowly swings out from the stem; logo sunshine fades in.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  return (
    <svg
      className={`doorway doorway-${stage}`}
      viewBox="0 0 128 128"
      role="img"
      aria-label="Purpose Academy doorway"
    >
      {/* Defs copied from logo-mark.svg */}
      <defs>
        <radialGradient id="doorway-glow" cx="58%" cy="42%" r="48%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FFF6C8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="doorway-beam" x1="0.55" y1="0.2" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#DCE8F5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sunshine — exact logo-mark glow + floor spill */}
      <g className="doorway-light">
        <ellipse cx="72" cy="58" rx="28" ry="36" fill="url(#doorway-glow)" />
        <polygon points="58,30 82,30 48,118 18,118" fill="url(#doorway-beam)" opacity="0.7" />
      </g>

      {/*
        Logo draw order: door under P.
        Closed path sits under the stem (solid P). Open path = logo parallelogram.
      */}
      <path className="doorway-leaf" d="M46 22 L64 22 L64 118 L46 118 Z" />
      <circle className="doorway-knob" cx="58" cy="70" r="3.2" fill="#F4F7FB" />

      {/* Exact logo P */}
      <path
        fill="#0B2F5C"
        d="M46 22h34c20 0 34 13 34 32s-14 32-34 32H64v42H46V22zm18 48h16c8 0 14-5 14-12s-6-12-14-12H64v24z"
      />

      {/* Stem knob while closed (door is under the P); fades as the real door swings out */}
      <circle className="doorway-knob-closed" cx="58" cy="70" r="3.2" fill="#F4F7FB" />
    </svg>
  )
}
