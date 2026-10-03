/** In-site PA monogram with doorway light — used on the live pages, not the splash. */
export function SitePaMark({ className = '' }: { className?: string }) {
  return (
    <div className={`site-pa-mark ${className}`.trim()} aria-hidden>
      <svg className="site-pa-svg" viewBox="0 0 186 128" role="presentation">
        <defs>
          <radialGradient id="site-pa-glow" cx="30%" cy="42%" r="48%">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="32%" stopColor="#FFE9A8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="site-pa-glow-a" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#FFFDF5" stopOpacity="1" />
            <stop offset="28%" stopColor="#FFE9A8" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#F5C542" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="site-pa-spill" x1="0.5" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#FFF8D6" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#F5C542" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="site-pa-spill-a" x1="0.5" y1="0" x2="0.55" y2="1">
            <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FFE9A8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F5C542" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="site-pa-cavity" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#FFF4C8" />
            <stop offset="100%" stopColor="#F0D48A" />
          </linearGradient>
          <linearGradient id="site-pa-ink" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8F0FA" />
          </linearGradient>
        </defs>

        {/* ——— P ——— */}
        <ellipse cx="54" cy="56" rx="34" ry="44" fill="url(#site-pa-glow)" />
        <polygon points="34,88 58,88 46,128 -2,128" fill="url(#site-pa-spill)" />
        <rect x="32" y="22" width="18" height="96" fill="url(#site-pa-cavity)" />
        <rect x="47" y="22" width="3" height="96" fill="#FFF8E8" opacity="0.92" />
        <path d="M32 22 L6 42 L2 102 L28 118 Z" fill="#163E72" opacity="0.95" />
        <circle cx="12" cy="74" r="3.2" fill="#F4F7FB" />
        <path
          fill="url(#site-pa-ink)"
          fillRule="evenodd"
          d="
            M32 22h34c20 0 34 13 34 32s-14 32-34 32H50v42H32V22z
            M50 70h16c8 0 14-5 14-12s-6-12-14-12H50v24z
          "
        />

        {/* ——— A: peaked second doorway, same stem weight / cap height as P ——— */}
        <g transform="translate(104 0)">
          {/* Room light filling the A counter */}
          <ellipse cx="38" cy="52" rx="30" ry="38" fill="url(#site-pa-glow-a)" />
          <polygon points="20,72 56,72 64,128 12,128" fill="url(#site-pa-spill-a)" />

          {/* Lit cavity held between the stems (the “room”) */}
          <path
            d="M26 36 L38 22 L50 36 L46 70 H30 Z"
            fill="url(#site-pa-cavity)"
          />
          <path d="M36 24 L40 24 L37 70 H35 Z" fill="#FFF8E8" opacity="0.75" />

          {/* Door leaf swinging into the A peak — same language as P */}
          <path d="M30 36 L14 48 L12 78 L28 70 Z" fill="#163E72" opacity="0.92" />
          <circle cx="18" cy="60" r="2.4" fill="#F4F7FB" />

          {/* Left stem */}
          <path fill="url(#site-pa-ink)" d="M26 22 L4 118h18L38 22H26z" />
          {/* Right stem */}
          <path fill="url(#site-pa-ink)" d="M50 22 L72 118H54L38 22H50z" />
          {/* Crossbar at P bowl line */}
          <path fill="url(#site-pa-ink)" d="M16 68h44l-3 13H19z" />
        </g>
      </svg>
    </div>
  )
}
