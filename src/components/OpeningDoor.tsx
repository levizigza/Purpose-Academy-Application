/** Animated Purpose Academy mark — door swings open into the brand "P". */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  return (
    <svg
      className={`opening-door-mark is-${stage}`}
      viewBox="0 0 200 240"
      role="img"
      aria-label="Purpose Academy doorway"
    >
      <defs>
        <radialGradient id="opening-glow" cx="58%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#fff6c8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0b2f5c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="opening-beam" x1="0.55" y1="0.15" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#dce8f5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0b2f5c" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse className="opening-glow" cx="118" cy="95" rx="48" ry="62" fill="url(#opening-glow)" />
      <polygon className="opening-beam" points="92,40 132,40 78,230 28,230" fill="url(#opening-beam)" />

      {/* Letter P / doorway frame */}
      <path
        className="opening-p"
        fill="#0b2f5c"
        d="M78 28h52c30 0 50 19 50 48s-20 48-50 48H104v88H78V28zm26 72h26c12 0 20-8 20-18s-8-18-20-18H104v36z"
      />

      {/* Door leaf — hinged on the left of the stem, swings open toward the viewer-left */}
      <g className="opening-door-hinge">
        <g className="opening-door-leaf">
          <rect x="78" y="28" width="28" height="184" rx="2" fill="#163e72" />
          <rect x="78" y="28" width="28" height="184" rx="2" fill="#0b2f5c" opacity="0.25" />
          <circle className="opening-knob" cx="94" cy="118" r="5" fill="#f4f7fb" />
        </g>
      </g>
    </svg>
  )
}
