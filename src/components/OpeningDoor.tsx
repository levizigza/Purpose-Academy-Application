/**
 * Doorway mark — the stem of the P is a hinged shop door.
 *
 * Readability rule (master climb): when open, the leaf must still read as a
 * *door* (panels, edge, knob) — never a gold pillar. Gold is room light
 * through the cavity, not the leaf material.
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
          <radialGradient id="doorway-room" cx="42%" cy="40%" r="58%">
            <stop offset="0%" stopColor="#FFF6D0" />
            <stop offset="40%" stopColor="#F0C45A" />
            <stop offset="100%" stopColor="#7A4E12" />
          </radialGradient>
          <linearGradient id="doorway-spill" x1="0.55" y1="0" x2="0.15" y2="1">
            <stop offset="0%" stopColor="#F5D76E" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#E8A317" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="doorway-p-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E3A6E" />
            <stop offset="55%" stopColor="#0B2F5C" />
            <stop offset="100%" stopColor="#071E3D" />
          </linearGradient>
          {/* Jamb thickness so the open cavity reads as architecture */}
          <linearGradient id="doorway-jamb" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#071E3D" />
            <stop offset="55%" stopColor="#163E72" />
            <stop offset="100%" stopColor="#0B2F5C" />
          </linearGradient>
        </defs>

        <g className="doorway-prelight">
          <ellipse cx="70" cy="50" rx="26" ry="34" fill="url(#doorway-room)" opacity="0.9" />
          <polygon points="46,96 68,96 56,128 6,128" fill="url(#doorway-spill)" />
          <rect x="46" y="22" width="18" height="96" fill="url(#doorway-room)" />
          {/* Inner jamb lip — keeps the opening reading as a doorway */}
          <rect x="46" y="22" width="3.5" height="96" fill="url(#doorway-jamb)" opacity="0.85" />
          <rect x="60.5" y="22" width="3.5" height="96" fill="url(#doorway-jamb)" opacity="0.55" />
          <rect x="61" y="22" width="1.5" height="96" fill="#FFF8E8" opacity="0.4" />
        </g>

        <path
          className="doorway-p-body"
          fill="url(#doorway-p-ink)"
          fillRule="evenodd"
          d="
            M46 22h34c20 0 34 13 34 32s-14 32-34 32H64v42H46V22z
            M64 70h16c8 0 14-5 14-12s-6-12-14-12H64v24z
            M46 22h18v96H46z
          "
        />
      </svg>

      <div className="doorway-hinge">
        <div className="doorway-leaf">
          {/* Leading edge thickness — visible in foreshortening when open */}
          <div className="doorway-leaf-edge" />
          <div className="doorway-leaf-face doorway-leaf-front">
            <span className="doorway-panel doorway-panel-top" />
            <span className="doorway-panel doorway-panel-bot" />
            <span className="doorway-rail" />
            <span className="doorway-hinge-pin doorway-hinge-pin-a" />
            <span className="doorway-hinge-pin doorway-hinge-pin-b" />
            <span className="doorway-knob" />
          </div>
          {/* Interior face: navy shop door, not gold — gold belongs to the room */}
          <div className="doorway-leaf-face doorway-leaf-back">
            <span className="doorway-panel doorway-panel-top" />
            <span className="doorway-panel doorway-panel-bot" />
          </div>
        </div>
      </div>

      <div className="doorway-floor-spill" />
    </div>
  )
}
