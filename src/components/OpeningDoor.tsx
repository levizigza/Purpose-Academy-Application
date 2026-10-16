/**
 * Doorway mark — the stem of the P is a hinged shop door.
 *
 * Light is room-through-architecture: clipped strictly to the open stem
 * cavity (logo P proportions). No bowl glow, no top poke, no ambient sun.
 * Gold belongs to the cavity and the floor wedge from its mouth — never
 * the leaf material.
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
          {/*
            Logo stem cavity: outer stem 46→64, thin equal jambs (~2),
            navy lintel above y=26 so light cannot poke the top of the P.
          */}
          <clipPath id="doorway-cavity-clip">
            <rect x="48" y="28" width="14" height="90" rx="0.4" />
          </clipPath>
          {/* Deep room behind the door — bright core in the empty space */}
          <radialGradient id="doorway-room" cx="42%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#FFFBEA" />
            <stop offset="28%" stopColor="#FFE8A0" />
            <stop offset="62%" stopColor="#E8A317" />
            <stop offset="100%" stopColor="#7A4E12" />
          </radialGradient>
          <linearGradient id="doorway-p-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E3A6E" />
            <stop offset="55%" stopColor="#0B2F5C" />
            <stop offset="100%" stopColor="#071E3D" />
          </linearGradient>
          <linearGradient id="doorway-spill" x1="0.5" y1="0" x2="0.32" y2="1">
            <stop offset="0%" stopColor="#FFF6D0" stopOpacity="0.95" />
            <stop offset="38%" stopColor="#F0C45A" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Floor wedge from cavity mouth only — tight to the opening */}
        <g className="doorway-prelight doorway-spill-layer">
          <polygon points="48,118 62,118 70,128 32,128" fill="url(#doorway-spill)" />
        </g>

        {/* Room light — hard-clipped to stem cavity */}
        <g className="doorway-prelight" clipPath="url(#doorway-cavity-clip)">
          {/* Inset from lintel so the bright field never kisses the top edge */}
          <rect x="48" y="30" width="14" height="88" fill="url(#doorway-room)" />
          {/* Inner header shadow — door frame depth, kills bright top line */}
          <rect x="48" y="28" width="14" height="2.4" fill="#071E3D" opacity="0.55" />
          {/* Lit inner jamb (right) — soft depth cue, not a gold pillar */}
          <rect x="60" y="30" width="1.75" height="88" fill="#FFF8E8" opacity="0.32" />
          <rect x="48" y="30" width="1.5" height="88" fill="#071E3D" opacity="0.4" />
        </g>

        {/*
          Logo P: stem + bowl, cavity punched with evenodd.
          Thick lintel + jamb caps drawn after — light stays inside architecture.
        */}
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
        {/* Lintel + jamb caps (logo doorway frame) — painted last to seal poke */}
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

      {/* HTML lintel above the 3D leaf — perspective cannot lift light over the P */}
      <div className="doorway-lintel" />
    </div>
  )
}
