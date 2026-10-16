/**
 * Doorway mark — the stem of the P is a hinged shop door.
 * Motion craft (L3): anticipation → swing → light spill + follow-through.
 * Perspective lives on the hinge parent; leaf rotates on the left edge.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'anticipate' | 'opening' | 'open'
}) {
  return (
    <div className={`doorway doorway-${stage}`} aria-hidden>
      <svg className="doorway-frame" viewBox="0 0 128 128" role="presentation">
        <defs>
          <radialGradient id="doorway-room" cx="48%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#FFF4C4" />
            <stop offset="45%" stopColor="#F0C45A" />
            <stop offset="100%" stopColor="#8A5A12" />
          </radialGradient>
          <linearGradient id="doorway-spill" x1="0.55" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#F5D76E" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#E8A317" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="doorway-p-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E3A6E" />
            <stop offset="55%" stopColor="#0B2F5C" />
            <stop offset="100%" stopColor="#071E3D" />
          </linearGradient>
        </defs>

        {/* Room / light revealed as the leaf swings — secondary action after the hinge. */}
        <g className="doorway-prelight">
          <ellipse cx="72" cy="52" rx="30" ry="38" fill="url(#doorway-room)" opacity="0.85" />
          <polygon points="46,96 70,96 58,128 4,128" fill="url(#doorway-spill)" />
          <rect x="46" y="22" width="18" height="96" fill="url(#doorway-room)" />
          <rect x="61" y="22" width="2" height="96" fill="#FFF8E8" opacity="0.45" />
        </g>

        {/* Same P path as logo-mark — stem is the doorway cavity */}
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
          <div className="doorway-leaf-face doorway-leaf-front">
            <span className="doorway-panel doorway-panel-top" />
            <span className="doorway-panel doorway-panel-bot" />
            <span className="doorway-hinge-pin doorway-hinge-pin-a" />
            <span className="doorway-hinge-pin doorway-hinge-pin-b" />
            <span className="doorway-knob" />
          </div>
          <div className="doorway-leaf-face doorway-leaf-back" />
        </div>
      </div>

      <div className="doorway-floor-spill" />
    </div>
  )
}
