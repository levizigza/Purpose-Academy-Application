/**
 * Door overlay — PA mark with light through the P stem.
 * Final art is always the raster lockup; this only covers/reveals it.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  return (
    <div className={`doorway doorway-${stage}`} aria-hidden>
      <svg className="doorway-frame" viewBox="0 0 200 128" role="presentation">
        <defs>
          <radialGradient id="doorway-preglow" cx="38%" cy="40%" r="42%">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="40%" stopColor="#FFE9A8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="doorway-prespill" x1="0.5" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#FFF8D6" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFE9A8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="doorway-cavity" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#FFF4C8" />
            <stop offset="100%" stopColor="#F0D48A" />
          </linearGradient>
        </defs>

        <g className="doorway-prelight">
          <ellipse cx="58" cy="55" rx="30" ry="40" fill="url(#doorway-preglow)" />
          <polygon points="36,95 56,95 46,128 0,128" fill="url(#doorway-prespill)" />
          <rect x="34" y="22" width="18" height="96" fill="url(#doorway-cavity)" />
          <rect x="49" y="22" width="3" height="96" fill="#FFF8E8" opacity="0.85" />
          <rect x="34" y="22" width="18" height="3" fill="#FFF8E8" opacity="0.85" />
        </g>

        {/* P — stem is the doorway */}
        <path
          fill="#0B2F5C"
          fillRule="evenodd"
          d="
            M34 22h34c20 0 34 13 34 32s-14 32-34 32H52v42H34V22z
            M52 70h16c8 0 14-5 14-12s-6-12-14-12H52v24z
            M34 22h18v96H34z
          "
        />

        {/* A — Purpose Academy monogram */}
        <path
          fill="#0B2F5C"
          d="
            M118 118 L148 22h20L198 118h-20l-6.5-22h-27L138 118h-20zm33.5-40h14L158 48h-1l-6.5 30z
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
