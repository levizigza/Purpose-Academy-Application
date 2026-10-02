/**
 * Opening doorway P — open pose matches the brand logo.
 * P / door / knob / glow from logo-mark; floor sunshine spill like logo-full.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  return (
    <svg
      className={`doorway doorway-${stage}`}
      viewBox="0 0 128 148"
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
        <linearGradient id="doorway-spill" x1="0.5" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#E8EEF5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F7FAFC" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Glow behind — same as logo-mark */}
      <ellipse className="doorway-light" cx="72" cy="58" rx="28" ry="36" fill="url(#doorway-glow)" />
      {/* Soft beam behind (logo-mark) */}
      <polygon
        className="doorway-light"
        points="58,30 82,30 48,118 18,118"
        fill="url(#doorway-beam)"
        opacity="0.7"
      />

      <path
        fill="#0B2F5C"
        d="M46 22h34c20 0 34 13 34 32s-14 32-34 32H64v42H46V22zm18 48h16c8 0 14-5 14-12s-6-12-14-12H64v24z"
      />

      {/* Floor sunshine in front of the P — trapezoid path like the logo */}
      <polygon
        className="doorway-light doorway-spill"
        points="48,110 66,110 54,148 10,148"
        fill="url(#doorway-spill)"
      />

      <path className="doorway-leaf" d="M46 22 L64 22 L64 118 L46 118 Z" />
      <circle className="doorway-knob" cx="58" cy="70" r="3.2" fill="#F4F7FB" />
    </svg>
  )
}
