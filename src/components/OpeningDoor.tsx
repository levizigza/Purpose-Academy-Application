/**
 * Brand doorway P — closed door in the stem swings open to the logo pose; light shows through.
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
        <linearGradient id="doorway-fill" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#FFF6C8" />
          <stop offset="100%" stopColor="#F5E0A8" />
        </linearGradient>
      </defs>

      <g className="doorway-light">
        <ellipse cx="72" cy="58" rx="28" ry="36" fill="url(#doorway-glow)" />
        <polygon points="58,30 82,30 48,118 18,118" fill="url(#doorway-beam)" opacity="0.7" />
        <rect x="46" y="22" width="18" height="96" fill="url(#doorway-fill)" />
      </g>

      {/* Closed path in markup; CSS morphs `d` to the logo open parallelogram */}
      <path className="doorway-leaf" d="M46 22 L64 22 L64 118 L46 118 Z" />
      <circle className="doorway-knob" cx="58" cy="70" r="3.2" fill="#F4F7FB" />

      <path
        fill="#0B2F5C"
        fillRule="evenodd"
        d="
          M46 22h34c20 0 34 13 34 32s-14 32-34 32H64v42H46V22z
          M64 70h16c8 0 14-5 14-12s-6-12-14-12H64v24z
          M46 22h18v96H46z
        "
      />
    </svg>
  )
}
