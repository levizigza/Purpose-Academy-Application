/** In-site PA monogram with doorway light — used on the live pages, not the splash. */
export function SitePaMark({ className = '' }: { className?: string }) {
  return (
    <div className={`site-pa-mark ${className}`.trim()} aria-hidden>
      <svg className="site-pa-svg" viewBox="0 0 200 128" role="presentation">
        <defs>
          <radialGradient id="site-pa-glow" cx="38%" cy="40%" r="45%">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="35%" stopColor="#FFE9A8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="site-pa-spill" x1="0.5" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#FFF8D6" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F5C542" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="site-pa-cavity" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#FFF4C8" />
            <stop offset="100%" stopColor="#F0D48A" />
          </linearGradient>
        </defs>

        <ellipse cx="58" cy="55" rx="34" ry="42" fill="url(#site-pa-glow)" />
        <polygon points="36,90 58,90 48,128 0,128" fill="url(#site-pa-spill)" />
        <rect x="34" y="22" width="18" height="96" fill="url(#site-pa-cavity)" />
        <rect x="49" y="22" width="3" height="96" fill="#FFF8E8" opacity="0.9" />

        {/* Open door leaf */}
        <path d="M34 22 L8 40 L4 100 L30 118 Z" fill="#163E72" opacity="0.95" />
        <circle cx="14" cy="72" r="3" fill="#F4F7FB" />

        {/* P */}
        <path
          fill="#F4F7FB"
          fillRule="evenodd"
          d="
            M34 22h34c20 0 34 13 34 32s-14 32-34 32H52v42H34V22z
            M52 70h16c8 0 14-5 14-12s-6-12-14-12H52v24z
          "
        />

        {/* A */}
        <path
          fill="#F4F7FB"
          d="M118 118 L148 22h20L198 118h-20l-6.5-22h-27L138 118h-20zm33.5-40h14L158 48h-1l-6.5 30z"
        />
      </svg>
      <span className="site-pa-label">PA</span>
    </div>
  )
}
