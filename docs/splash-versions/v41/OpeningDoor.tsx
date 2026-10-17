/**
 * Doorway mark — the stem of the P is a hinged shop door.
 *
 * Architecture (not a letter-slot):
 * - Real doors ≈ 900×2100 mm → height/width ≈ 2.33 (Palladio / metric standard).
 * - Our cavity targets ≈ 1:2.6 — door-like, still readable as a P stem.
 * - Perspective lives on the hinge parent; origin sits off to the right so an
 *   open leaf foreshortens with depth instead of collapsing to a knife-edge.
 * - Light is heightened daylight that spills out of the cavity onto sill + floor.
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
          <radialGradient id="doorway-day" cx="42%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="28%" stopColor="#FFFEF6" />
            <stop offset="58%" stopColor="#F4F0E4" />
            <stop offset="100%" stopColor="#D5DEE9" />
          </radialGradient>
          <linearGradient id="doorway-beam" x1="0.28" y1="0" x2="0.72" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#F7F1E4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="doorway-p-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E3A6E" />
            <stop offset="55%" stopColor="#0B2F5C" />
            <stop offset="100%" stopColor="#071E3D" />
          </linearGradient>
          <linearGradient id="doorway-spill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#F0EBD8" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="doorway-bloom" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#F5EFD8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/*
          Wider stem so the cavity can be a door, not a letter-slot.
          Stem outer 38→72; cavity 41→69 × 34→108.
          Paint P first, then light through the hole, then spill in front.
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

        <g className="doorway-prelight" clipPath="url(#doorway-cavity-clip)">
          <rect x={cx} y={cy + 2} width={cw} height={ch - 2} fill="url(#doorway-day)" />
          <polygon
            points={`${cx + 2},${cy + 2} ${cx + 12},${cy + 2} ${cx + 18},${cy + ch} ${cx + 1},${cy + ch}`}
            fill="url(#doorway-beam)"
            opacity="0.95"
          />
          <polygon
            points={`${cx + 11},${cy + 2} ${cx + 22},${cy + 2} ${cx + 27},${cy + ch} ${cx + 13},${cy + ch}`}
            fill="url(#doorway-beam)"
            opacity="0.55"
          />
          <g className="doorway-motes" opacity="0.78">
            <circle cx={cx + 8} cy={cy + 16} r="0.75" fill="#FFFFFF" />
            <circle cx={cx + 16} cy={cy + 28} r="0.55" fill="#FFFEF8" />
            <circle cx={cx + 10} cy={cy + 42} r="0.65" fill="#FFF8E8" />
            <circle cx={cx + 20} cy={cy + 54} r="0.5" fill="#FFFFFF" />
            <circle cx={cx + 13} cy={cy + 66} r="0.6" fill="#F5F0E6" />
            <circle cx={cx + 18} cy={cy + 20} r="0.4" fill="#FFFFFF" />
          </g>
          <rect x={cx} y={cy} width={cw} height="2.8" fill="#071E3D" opacity="0.4" />
          <rect x={cx + cw - 2.2} y={cy + 2} width="2.2" height={ch - 2} fill="#FFFEF8" opacity="0.62" />
          <rect x={cx} y={cy + 2} width="2" height={ch - 2} fill="#071E3D" opacity="0.28" />
        </g>

        {/* Spill in front of the mark — light leaving the doorway onto sill + floor */}
        <g className="doorway-prelight doorway-spill-layer">
          <ellipse
            cx={cx + cw / 2 + 1}
            cy={cy + ch * 0.58}
            rx={cw * 1.55}
            ry={ch * 0.7}
            fill="url(#doorway-bloom)"
            opacity="0.85"
          />
          <polygon
            points={`${cx - 4},104 ${cx + cw + 4},104 ${cx + cw + 26},128 ${cx - 18},128`}
            fill="url(#doorway-spill)"
          />
          <ellipse
            cx={cx + cw / 2}
            cy="112"
            rx="22"
            ry="8"
            fill="#FFFEF8"
            opacity="0.35"
          />
        </g>
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
