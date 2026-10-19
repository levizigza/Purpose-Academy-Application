/**
 * Visual sentence stage for Construction Sentence Structure.
 * Inspired by SITEWISE crew-stage motion: the sentence is a live site moment,
 * not a VocabSheet card. Wrong answers play absurd, memorable consequences.
 */

export type StageMood = 'idle' | 'success' | 'fail'

export type ConsequenceKind =
  | 'anvil'
  | 'collapse'
  | 'splash'
  | 'slip'
  | 'spark'
  | 'crush'

export type Consequence = {
  kind: ConsequenceKind
  /** Short absurd caption under the stage */
  caption: string
}

/** Map the sentence situation → a comic consequence that still “fits” the words. */
export function consequenceFor(prompt: string, wrongWord: string, answer: string): Consequence {
  const hay = `${prompt} ${wrongWord} ${answer}`.toLowerCase()

  if (/scaffold|ladder|crane|hoist|pulley|tower|height|roof|rafter|truss/.test(hay)) {
    return {
      kind: 'anvil',
      caption: `Wrong word — a cartoon anvil drops from the ${/crane|hoist/.test(hay) ? 'crane' : 'sky'}. Pay attention next time.`,
    }
  }
  if (/foundation|footing|pile|pier|beam|column|slab|frame|girder|rebar|steel|wall|partition/.test(hay)) {
    return {
      kind: 'collapse',
      caption: 'Wrong word — the frame wobbles and the load drops. The sentence needed the right part.',
    }
  }
  if (/concrete|cement|mortar|grout|plaster|paint|primer|sealant|adhesive|caulk|putty|sand|gravel|aggregate/.test(hay)) {
    return {
      kind: 'splash',
      caption: 'Wrong word — wet mix erupts. The crew is stuck in the joke they chose.',
    }
  }
  if (/floor|ramp|aisle|mud|ice|drain|pipe|hose|water/.test(hay)) {
    return {
      kind: 'slip',
      caption: 'Wrong word — the worker slips on a comedy banana of bad English.',
    }
  }
  if (/wire|electric|circuit|breaker|fuse|switch|panel|voltage|current|spark|weld|torch|saw|grinder/.test(hay)) {
    return {
      kind: 'spark',
      caption: 'Wrong word — a comic spark pops. Read the site sentence before you act.',
    }
  }
  if (/brick|block|stone|tile|door|window|glass|nail|screw|bolt/.test(hay)) {
    return {
      kind: 'crush',
      caption: 'Wrong word — a loose load tips. The blank needed the real material.',
    }
  }
  return {
    kind: 'anvil',
    caption: 'Wrong word — anvil drop. On site, guessing has consequences.',
  }
}

type Props = {
  mood: StageMood
  consequence: Consequence | null
  /** Wrong chip text briefly shown bouncing off the blank — never written into the sentence */
  rejectedWord?: string | null
  /** Correct word settling into the scene board */
  lockedWord?: string | null
  prompt: string
  flying?: boolean
}

/**
 * SITEWISE-style crew stage: sentence board + worker + consequence FX.
 * Pure SVG/CSS — no external assets. Respects prefers-reduced-motion via CSS.
 */
export function SentenceSiteStage({
  mood,
  consequence,
  rejectedWord,
  lockedWord,
  prompt,
  flying,
}: Props) {
  const kind = consequence?.kind || 'anvil'
  const before = prompt.split('______')[0] ?? ''
  const after = prompt.split('______')[1] ?? ''
  const showWord = lockedWord || null
  const showReject = Boolean(rejectedWord && mood === 'fail' && !showWord)

  const caption =
    mood === 'fail' && consequence
      ? consequence.caption
      : mood === 'success'
        ? 'Word locked. The crew keeps building.'
        : 'Watch the job board. Choose the word that belongs.'

  return (
    <div
      className={`sentence-site-stage is-${mood}${flying ? ' is-flying' : ''}${
        consequence && mood === 'fail' ? ` fail-${kind}` : ''
      }`}
    >
      <div className="sentence-site-sky" aria-hidden />
      <div className="sentence-site-ground" aria-hidden />

      {/* Sentence board — the visual showcase of the sentence */}
      <div className="sentence-site-board">
        <p className="sentence-site-board-kicker">On the job board</p>
        <div className="sentence-site-board-stage">
          {showReject ? (
            <span className="sentence-site-reject-float" aria-hidden>
              {rejectedWord}
            </span>
          ) : null}
          <p
            className={`sentence-site-board-line${showWord ? ' has-word' : ''}${
              mood === 'fail' && !showWord ? ' is-shake' : ''
            }`}
          >
            <span>{before}</span>
            <span
              className={`sentence-site-blank${showWord ? ' filled' : ''}${
                showReject ? ' rejected' : ''
              }`}
            >
              {showWord ? (
                <span className={`sentence-site-lock${flying ? ' landing' : ' set'}`}>{showWord}</span>
              ) : (
                <span className="sentence-site-slot">______</span>
              )}
            </span>
            <span>{after}</span>
          </p>
        </div>
      </div>

      <svg
        className="sentence-site-svg"
        viewBox="0 0 640 280"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Scaffold / frame backdrop */}
        <g className="sentence-site-frame" opacity="0.55">
          <rect x="40" y="70" width="18" height="160" fill="#5a6a7a" />
          <rect x="200" y="90" width="14" height="140" fill="#5a6a7a" />
          <rect x="40" y="70" width="174" height="12" fill="#7a8a9a" />
          <rect x="40" y="130" width="174" height="8" fill="#6a7a8a" />
        </g>

        {/* Beam that settles on success / tips on collapse */}
        <g
          className={`sentence-site-beam ${mood === 'success' ? 'is-lock' : ''} ${
            kind === 'collapse' && mood === 'fail' ? 'is-tip' : ''
          }`}
        >
          <rect x="260" y="100" width="220" height="18" rx="3" fill="#c4a35a" />
          <rect x="270" y="104" width="200" height="4" fill="#e8d090" opacity="0.5" />
        </g>

        {/* Worker */}
        <g
          className={`sentence-site-worker ${mood === 'success' ? 'is-win' : ''} ${
            mood === 'fail' ? 'is-hurt' : ''
          }`}
        >
          <ellipse cx="340" cy="210" rx="28" ry="10" fill="#0a1624" opacity="0.35" className="sentence-site-shadow" />
          <rect x="322" y="150" width="36" height="52" rx="10" fill="#e8a317" />
          <rect x="318" y="148" width="44" height="14" rx="4" fill="#f0c14a" />
          <ellipse cx="340" cy="132" rx="22" ry="12" fill="#f5c542" />
          <rect x="318" y="132" width="44" height="8" rx="2" fill="#e8a317" />
          <circle cx="340" cy="142" r="14" fill="#d4a574" />
          <rect className="sentence-site-arm-l" x="300" y="158" width="24" height="10" rx="4" fill="#e8a317" />
          <rect className="sentence-site-arm-r" x="356" y="158" width="24" height="10" rx="4" fill="#e8a317" />
          <rect x="326" y="198" width="12" height="28" rx="3" fill="#1e3a5f" />
          <rect x="342" y="198" width="12" height="28" rx="3" fill="#1e3a5f" />
          <circle cx="335" cy="140" r="1.5" fill="#2a1a0a" />
          <circle cx="345" cy="140" r="1.5" fill="#2a1a0a" />
          {mood === 'success' && (
            <path d="M333 148 Q340 154 347 148" fill="none" stroke="#2a1a0a" strokeWidth="2" />
          )}
          {mood === 'fail' && (
            <path d="M333 152 Q340 146 347 152" fill="none" stroke="#2a1a0a" strokeWidth="2" />
          )}
          {mood === 'idle' && (
            <path d="M333 149 H347" fill="none" stroke="#2a1a0a" strokeWidth="2" />
          )}
        </g>

        {mood === 'success' && (
          <g className="sentence-site-sparkles">
            <circle cx="280" cy="90" r="4" fill="#f5c542" />
            <circle cx="420" cy="80" r="3" fill="#86b56a" />
            <circle cx="390" cy="110" r="3.5" fill="#f5c542" />
          </g>
        )}

        {mood === 'fail' && kind === 'anvil' && (
          <g className="sentence-site-anvil">
            <path
              d="M300 20 h80 l12 28 h-20 l8 36 h-80 l8-36 h-20 z"
              fill="#4a5560"
              stroke="#1a2228"
              strokeWidth="2"
            />
            <text x="340" y="55" textAnchor="middle" fill="#f5c542" fontSize="14" fontWeight="700">
              WRONG
            </text>
          </g>
        )}
        {mood === 'fail' && kind === 'collapse' && (
          <g className="sentence-site-rubble">
            <rect x="300" y="200" width="30" height="18" fill="#8a7a5a" transform="rotate(-12 315 209)" />
            <rect x="340" y="205" width="36" height="14" fill="#6a5a3a" transform="rotate(8 358 212)" />
            <rect x="370" y="198" width="22" height="20" fill="#9a8a6a" transform="rotate(-20 381 208)" />
          </g>
        )}
        {mood === 'fail' && kind === 'splash' && (
          <g className="sentence-site-splash">
            <ellipse cx="340" cy="220" rx="70" ry="18" fill="#8b7355" opacity="0.85" />
            <circle cx="300" cy="180" r="10" fill="#a08060" />
            <circle cx="380" cy="170" r="12" fill="#a08060" />
            <circle cx="340" cy="160" r="8" fill="#b09070" />
          </g>
        )}
        {mood === 'fail' && kind === 'slip' && (
          <g className="sentence-site-banana">
            <path d="M360 200 Q380 190 390 210 Q375 215 360 200" fill="#f5c542" stroke="#c49a10" />
            <text x="400" y="195" fill="#f5c542" fontSize="18">
              !
            </text>
          </g>
        )}
        {mood === 'fail' && kind === 'spark' && (
          <g className="sentence-site-bolts">
            <path d="M360 120 L350 150 L365 148 L355 180" fill="none" stroke="#f5c542" strokeWidth="4" />
            <path d="M320 110 L330 140 L318 138 L328 168" fill="none" stroke="#fff3a0" strokeWidth="3" />
          </g>
        )}
        {mood === 'fail' && kind === 'crush' && (
          <g className="sentence-site-crate">
            <rect x="300" y="40" width="80" height="50" rx="4" fill="#c4543a" />
            <text x="340" y="72" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700">
              LOAD
            </text>
          </g>
        )}
      </svg>

      <p
        className={`sentence-site-caption${
          mood === 'success' ? ' is-ok' : mood === 'idle' ? ' is-idle' : ''
        }`}
        aria-live="polite"
      >
        {caption}
      </p>
    </div>
  )
}
