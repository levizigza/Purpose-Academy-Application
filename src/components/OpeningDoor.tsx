/**
 * Brand doorway P — thick stem/frame like the logo; door slowly swings open to sunshine.
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
        <radialGradient id="doorway-glow" cx="52%" cy="40%" r="52%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#FFF6C8" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#F5C542" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="doorway-beam" x1="0.55" y1="0.15" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FFE9A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="doorway-fill" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FFF4C8" />
          <stop offset="100%" stopColor="#F5C542" />
        </linearGradient>
      </defs>

      <g className="doorway-light">
        <ellipse cx="68" cy="56" rx="34" ry="40" fill="url(#doorway-glow)" />
        <polygon points="50,24 76,24 50,120 14,120" fill="url(#doorway-beam)" opacity="0.75" />
        <rect x="48" y="22" width="14" height="96" fill="url(#doorway-fill)" />
      </g>

      <path className="doorway-leaf" d="M48 22 L62 22 L62 118 L48 118 Z" />
      <circle className="doorway-knob" cx="58" cy="70" r="3.4" fill="#F4F7FB" />

      {/*
        Chunky P like the brand mark: stem ~28 wide with real jambs around the opening.
        Left jamb 40→48, opening 48→62, right jamb 62→68.
      */}
      <path
        fill="#0B2F5C"
        fillRule="evenodd"
        d="
          M40 18h42c24 0 40 16 40 40s-16 40-40 40H68v48H40V18z
          M68 70h20c10 0 16-6 16-14s-6-14-16-14H68v28z
          M48 22h14v96H48z
        "
      />
    </svg>
  )
}
