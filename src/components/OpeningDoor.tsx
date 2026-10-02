/**
 * Purpose Academy doorway P — matched to the brand logo mark.
 * Closed: solid P, door flush in the stem, white knob on the free edge.
 * Open: bright doorway light, solid door swung left with visible doorknob.
 */
export function OpeningDoorMark({
  stage,
}: {
  stage: 'closed' | 'opening' | 'open'
}) {
  const opened = stage === 'opening' || stage === 'open'

  return (
    <div className={`opening-door-scene is-${stage}`} aria-hidden>
      <svg
        className="opening-door-mark"
        viewBox="0 0 340 400"
        role="img"
        aria-label="Purpose Academy doorway"
      >
        <defs>
          <linearGradient id="pa-cavity" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fff8e8" />
            <stop offset="100%" stopColor="#f3e6c4" />
          </linearGradient>
          <radialGradient id="pa-halo" cx="36%" cy="34%" r="52%">
            <stop offset="0%" stopColor="#fff6c8" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#ffe9a8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pa-spill" x1="0.55" y1="0" x2="0.18" y2="1">
            <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#f5c542" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse className="opening-glow" cx="160" cy="155" rx="125" ry="145" fill="url(#pa-halo)" />
        <polygon className="opening-beam" points="130,48 176,48 138,388 52,388" fill="url(#pa-spill)" />

        {/* Warm doorway light through the stem — like the logo */}
        <rect className="opening-doorway-light" x="110" y="40" width="44" height="320" fill="url(#pa-cavity)" />

        {/* Solid navy P */}
        <path
          fill="#0b2f5c"
          fillRule="evenodd"
          d="
            M110 32h98c58 0 96 36 96 90s-38 90-96 90H154v132H110V32z
            M154 80h52c26 0 42 16 42 36s-16 36-42 36h-52V80z
            M110 32h44v328H110z
          "
        />

        {!opened ? (
          <g className="opening-door-leaf is-closed">
            {/* Flush door = solid stem */}
            <rect x="110" y="32" width="44" height="328" fill="#0b2f5c" />
            {/* Doorknob on free edge */}
            <circle cx="142" cy="188" r="5" fill="#f7fafc" />
          </g>
        ) : (
          <g className={`opening-door-leaf is-open-pose is-${stage}`}>
            {/* Solid perspective door — logo shape */}
            <path d="M110 40 L68 72 L56 318 L110 348 Z" fill="#0b2f5c" />
            {/* White doorknob near the opening edge */}
            <circle cx="94" cy="188" r="5" fill="#f7fafc" />
          </g>
        )}
      </svg>
    </div>
  )
}
