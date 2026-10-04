/** Background PA monogram — letters only, no doorway leaves. */
export function SitePaMark({ className = '' }: { className?: string }) {
  return (
    <div className={`site-pa-mark ${className}`.trim()} aria-hidden>
      <svg className="site-pa-svg" viewBox="0 0 186 128" role="presentation">
        <defs>
          <radialGradient id="site-pa-glow" cx="34%" cy="42%" r="48%">
            <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#FFE9A8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="site-pa-glow-a" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#FFE9A8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0B2F5C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="site-pa-ink" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8F0FA" />
          </linearGradient>
        </defs>

        {/* Soft atmosphere behind the letters — no door leaves */}
        <ellipse cx="54" cy="56" rx="34" ry="44" fill="url(#site-pa-glow)" />
        <ellipse cx="142" cy="52" rx="30" ry="38" fill="url(#site-pa-glow-a)" />

        {/* P */}
        <path
          fill="url(#site-pa-ink)"
          fillRule="evenodd"
          d="
            M32 22h34c20 0 34 13 34 32s-14 32-34 32H50v42H32V22z
            M50 38h16c8 0 14 5 14 12s-6 12-14 12H50V38z
          "
        />

        {/* A */}
        <g transform="translate(104 0)">
          <path fill="url(#site-pa-ink)" d="M26 22 L4 118h18L38 22H26z" />
          <path fill="url(#site-pa-ink)" d="M50 22 L72 118H54L38 22H50z" />
          <path fill="url(#site-pa-ink)" d="M16 68h44l-3 13H19z" />
        </g>
      </svg>
    </div>
  )
}
