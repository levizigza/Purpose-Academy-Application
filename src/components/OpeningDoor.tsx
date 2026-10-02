/**
 * Door overlay — registered to the P in logo-full via measured slot + viewBox padding.
 * Final art is always the raster lockup; this only covers/reveals it.
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
          <radialGradient id="doorway-preglow" cx="55%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FFF6C8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#041526" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="doorway-prespill" x1="0.5" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#FFF6C8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#041526" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="doorway-cavity" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#FFF8E0" />
            <stop offset="100%" stopColor="#F5E0A8" />
          </linearGradient>
        </defs>

        <g className="doorway-prelight">
          <ellipse cx="70" cy="55" rx="32" ry="40" fill="url(#doorway-preglow)" />
          <polygon points="48,95 68,95 58,128 8,128" fill="url(#doorway-prespill)" />
          <rect x="46" y="22" width="18" height="96" fill="url(#doorway-cavity)" />
          <rect x="61" y="22" width="3" height="96" fill="#FFF8E8" opacity="0.85" />
          <rect x="46" y="22" width="18" height="3" fill="#FFF8E8" opacity="0.85" />
        </g>

        {/* Same P path as logo-mark — stem is the doorway */}
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

      <div className="doorway-hinge">
        <div className="doorway-leaf">
          <div className="doorway-leaf-face">
            <span className="doorway-knob" />
          </div>
        </div>
      </div>
    </div>
  )
}
