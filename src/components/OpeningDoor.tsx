/**
 * Doorway mark — the stem of the P is a hinged shop door.
 *
 * Architecture (not a letter-slot):
 * - Real doors ≈ 900×2100 mm → height/width ≈ 2.33 (Palladio / metric standard).
 * - Our cavity targets ≈ 1:2.6 — door-like, still readable as a P stem.
 * - Perspective lives on the hinge parent; origin sits off to the right so an
 *   open leaf foreshortens with depth instead of collapsing to a knife-edge.
 * - Light is soft daylight clipped to the cavity only.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  /* Cavity: 28×74 in a 128 viewBox → H/W ≈ 2.64 (was 14×90 ≈ 6.4). */
  const cx = 41
  const cy = 34
  const cw = 28
  const ch = 74

  return (
    <div className={`doorway doorway-${stage}`} aria-hidden>
      <svg className="doorway-frame" viewBox="0 0 128 128" role="presentation">
        <defs>
          <clipPath id="doorway-cavity-clip">
            <rect x={cx} y={cy} width={cw} height={ch} rx="0.6" />
          </clipPath>
          <radialGradient id="doorway-day" cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#FFFEFA" />
            <stop offset="40%" stopColor="#F2EFE6" />
            <stop offset="75%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#C2CDDA" />
          </radialGradient>
          <linearGradient id="doorway-beam" x1="0.3" y1="0" x2="0.75" y2="1">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#EDE6D8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="doorway-p-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E3A6E" />
            <stop offset="55%" stopColor="#0B2F5C" />
            <stop offset="100%" stopColor="#071E3D" />
          </linearGradient>
          <linearGradient id="doorway-spill" x1="0.5" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.72" />
            <stop offset="42%" stopColor="#E8EEF5" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Floor pool fans from a wide mouth — matches a real door threshold */}
        <g className="doorway-prelight doorway-spill-layer">
          <polygon
            points={`${cx},108 ${cx + cw},108 ${cx + cw + 14},128 ${cx - 10},128`}
            fill="url(#doorway-spill)"
          />
        </g>

        <g className="doorway-prelight" clipPath="url(#doorway-cavity-clip)">
          <rect x={cx} y={cy + 2} width={cw} height={ch - 2} fill="url(#doorway-day)" />
          <polygon
            points={`${cx + 3},${cy + 2} ${cx + 11},${cy + 2} ${cx + 16},${cy + ch} ${cx + 2},${cy + ch}`}
            fill="url(#doorway-beam)"
            opacity="0.8"
          />
          <polygon
            points={`${cx + 12},${cy + 2} ${cx + 20},${cy + 2} ${cx + 26},${cy + ch} ${cx + 14},${cy + ch}`}
            fill="url(#doorway-beam)"
            opacity="0.4"
          />
          <g className="doorway-motes" opacity="0.5">
            <circle cx={cx + 8} cy={cy + 16} r="0.6" fill="#FFFEF8" />
            <circle cx={cx + 16} cy={cy + 28} r="0.45" fill="#FFFEF8" />
            <circle cx={cx + 10} cy={cy + 42} r="0.55" fill="#F5F0E6" />
            <circle cx={cx + 20} cy={cy + 54} r="0.4" fill="#FFFEF8" />
            <circle cx={cx + 13} cy={cy + 66} r="0.5" fill="#E8EEF5" />
          </g>
          {/* Inner header + jambs — solid drawing / depth */}
          <rect x={cx} y={cy} width={cw} height="2.8" fill="#071E3D" opacity="0.5" />
          <rect x={cx + cw - 2.2} y={cy + 2} width="2.2" height={ch - 2} fill="#FFFEF8" opacity="0.3" />
          <rect x={cx} y={cy + 2} width="2" height={ch - 2} fill="#071E3D" opacity="0.38" />
        </g>

        {/*
          Wider stem so the cavity can be a door, not a letter-slot.
          Stem outer 38→72; cavity 41→69 × 34→108.
        */}
        <path
          className="doorway-p-body"
          fill="url(#doorway-p-ink)"
          fillRule="evenodd"
          d="
            M38 22h40c22 0 38 14 38 34s-16 34-38 34H72v38H38V22z
            M72 74h18c9 0 16-6 16-14s-7-14-16-14H72v28z
            M41 34h28v74H41z
          "
        />
        {/* Lintel + jamb caps seal the architecture */}
        <rect x="38" y="22" width="34" height="12.5" fill="#0B2F5C" />
        <rect x="38" y="22" width="3.2" height="96" fill="#0B2F5C" />
        <rect x="68.8" y="22" width="3.2" height="96" fill="#0B2F5C" />
        {/* Threshold bar — doors sit on a sill */}
        <rect x="41" y="106" width="28" height="2.2" fill="#071E3D" opacity="0.85" />
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
