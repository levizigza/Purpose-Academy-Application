/**
 * Visual sentence stage for Construction Sentence Structure.
 * Inspired by SITEWISE crew-stage motion: the sentence is a live site moment,
 * not a VocabSheet card. Wrong answers play absurd, memorable consequences.
 */

export type StageMood = 'idle' | 'anticipate' | 'success' | 'fail'

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

const CAPTIONS: Record<ConsequenceKind, (hint: string) => string> = {
  anvil: (hint) =>
    `Wrong word — a cartoon anvil drops from the ${hint || 'sky'}. Pay attention next time.`,
  collapse: () =>
    'Wrong word — the frame wobbles and the load drops. The sentence needed the right part.',
  splash: () => 'Wrong word — wet mix erupts. The crew is stuck in the joke they chose.',
  slip: () => 'Wrong word — the worker slips on a comedy banana of bad English.',
  spark: () => 'Wrong word — a comic spark pops. Read the site sentence before you act.',
  crush: () => 'Wrong word — a loose load tips. The blank needed the real material.',
}

/** Answer / prompt tokens → consequence kind (answer checked first). */
const KIND_TOKENS: { kind: ConsequenceKind; tokens: RegExp }[] = [
  {
    kind: 'anvil',
    tokens:
      /\b(scaffold|scaffolds|ladder|crane|hoist|pulley|tower|height|roof|rafter|truss|shingle|shingles|gutter|flashing|attic|harness|safety harness|guardrail|guardrails|handrail)\b/,
  },
  {
    kind: 'collapse',
    tokens:
      /\b(foundation|footing|pile|piles|pier|beam|column|columns|slab|frame|framework|girder|rebar|steel|wall|partition|joist|floor joists|formwork|shuttering|bracing|structure|structural drawings|load|load limit|load tests|deflection|shear|torsion|tension|compression|stability|retaining|lintel|stud|deck|bridge|building|elements|modules|modularization|assembly)\b/,
  },
  {
    kind: 'splash',
    tokens:
      /\b(concrete|cement|mortar|grout|plaster|paint|primer|sealant|adhesive|caulk|putty|sand|gravel|aggregate|bitumen|asphalt|coating|waterproofing|damp-proofing|curing|pouring|mixing|screeding|troweling|floating|spraying|brushing|hardening|polishing|finishing|plaster|drywall|insulation|weather barrier)\b/,
  },
  {
    kind: 'slip',
    tokens:
      /\b(floor|ramp|aisle|mud|ice|drain|drainage|pipe|plumbing|hose|water|water supply|sewer|faucet|valve|shutoff valve|trenching|excavation|excavator|backhoe|bulldozer|grader|grading|compactor|compacting|roller|soil|clay|silt|rock|bedrock|subgrade|subbase|basecourse|backfilling|leveling|filling|clearing|digging|erosion|slope|terrain|topography|sidewalk|pavement|curb|road|highway|crossing|intersection)\b/,
  },
  {
    kind: 'spark',
    tokens:
      /\b(wire|wiring|electric|electrical|circuit|circuit breaker|breaker|fuse|switch|panel|voltage|current|spark|weld|welding|torch|saw|grinder|grinding|drill|blade|cutter|cutting|conduit|conductor|grounding|extension cord|generator|meter|thermostat|hvac|duct|ductwork|boiler|heating|cooling|ventilation|exhaust|radiator|airflow|air filter|soldering|brazing|automation|robotics|network|software|two-way radio)\b/,
  },
  {
    kind: 'crush',
    tokens:
      /\b(brick|bricks|block|blocks|stone|tile|tiles|door|window|glass|nail|nailing|screw|screwing|bolt|bolting|nut|washer|rivet|anchor|anchoring|clamp|bracket|strap|hinge|handle|lock|lockout|threshold|sill|gate|fence|barricade|barrier|pallet|wheelbarrow|loader|loading|unloading|hauling|delivery|transport|crane|machinery|equipment|toolkit|toolset|wrench|spanner|pliers|chisel|mallet|hammer|vice|socket)\b/,
  },
]

/** Admin / docs / people words — map to a fitting comic beat, not default anvil. */
const SOFT_KIND_TOKENS: { kind: ConsequenceKind; tokens: RegExp }[] = [
  {
    kind: 'collapse',
    tokens:
      /\b(plan|blueprint|design|drafting|drawing|layout|schedule|timeline|deadline|budget|cost|estimate|bid|tender|contract|permit|approval|acceptance|compliance|code|specification|documentation|report|audit|inspection|checklist|punch list|closeout|handover|warranty|guarantee|insurance|liability|license|certification|quality|quality control|quality assurance|procurement|invoice|payment|inventory|warehouse|logistics|supply chain|project management|coordination|meeting|communication|teamwork|supervision|foreman|manager|engineer|architect|inspector|contractor|subcontractor|client|owner|investor)\b/,
  },
  {
    kind: 'crush',
    tokens:
      /\b(safety|hazard|accident|incident|emergency|evacuation|first aid|fire extinguisher|hard hat|helmet|goggles|gloves|boots|vest|warning|signage|toolbox talk|risk|risk assessment|corrective action|deficiency|reinspection)\b/,
  },
  {
    kind: 'spark',
    tokens:
      /\b(technology|innovation|simulation|modeling|database|file|archive|software|scheduling software|standardization|optimization|efficiency|productivity|training|skill|competence|expertise|knowledge|practice|technique|method|procedure|process control|monitoring|testing|calibration|measurement|tolerance|accuracy|benchmark|survey|stringline|alignment|dimension|elevation|marking)\b/,
  },
  {
    kind: 'slip',
    tokens:
      /\b(cleanup|waste|recycling|disposal|demolition|demolition debris|removal|refurbishment|renovation|remodeling|restoration|upgrade|maintenance|repair|replacement|service|operation|workflow|assignment|task)\b/,
  },
]

const FALLBACK_KINDS: ConsequenceKind[] = ['collapse', 'crush', 'splash', 'slip', 'spark', 'anvil']

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function kindFromText(text: string, buckets: { kind: ConsequenceKind; tokens: RegExp }[]) {
  const hay = ` ${norm(text)} `
  for (const { kind, tokens } of buckets) {
    if (tokens.test(hay)) return kind
  }
  return null
}

function fallbackKind(seed: string): ConsequenceKind {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return FALLBACK_KINDS[h % FALLBACK_KINDS.length]
}

/** Map the sentence situation → a comic consequence that still “fits” the words. */
export function consequenceFor(prompt: string, wrongWord: string, answer: string): Consequence {
  const answerKind =
    kindFromText(answer, KIND_TOKENS) || kindFromText(answer, SOFT_KIND_TOKENS)
  const promptKind =
    kindFromText(prompt, KIND_TOKENS) || kindFromText(prompt, SOFT_KIND_TOKENS)
  const wrongKind =
    kindFromText(wrongWord, KIND_TOKENS) || kindFromText(wrongWord, SOFT_KIND_TOKENS)

  const kind = answerKind || promptKind || wrongKind || fallbackKind(`${prompt}|${answer}`)

  let hint = 'sky'
  const hay = norm(`${prompt} ${answer}`)
  if (/\b(crane|hoist)\b/.test(hay)) hint = 'crane'
  else if (/\b(scaffold|scaffolds|ladder|tower)\b/.test(hay)) hint = 'scaffold'
  else if (/\b(roof|rafter|truss)\b/.test(hay)) hint = 'roof'

  return { kind, caption: CAPTIONS[kind](hint) }
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
  const bracing = mood === 'anticipate'
  const showReject = Boolean(rejectedWord && (mood === 'fail' || bracing) && !showWord)

  const caption =
    mood === 'fail' && consequence
      ? consequence.caption
      : bracing
        ? 'Wrong word — the crew braces…'
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
              bracing || (mood === 'fail' && !showWord) ? ' is-shake' : ''
            }`}
          >
            <span>{before}</span>
            <span
              className={`sentence-site-blank${showWord ? ' filled' : ''}${
                showReject ? ' rejected' : ''
              }${bracing ? ' bracing' : ''}`}
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
        <g className="sentence-site-frame" opacity="0.55">
          <rect x="40" y="70" width="18" height="160" fill="#5a6a7a" />
          <rect x="200" y="90" width="14" height="140" fill="#5a6a7a" />
          <rect x="40" y="70" width="174" height="12" fill="#7a8a9a" />
          <rect x="40" y="130" width="174" height="8" fill="#6a7a8a" />
        </g>

        <g
          className={`sentence-site-beam ${mood === 'success' ? 'is-lock' : ''} ${
            bracing ? 'is-tremble' : ''
          } ${kind === 'collapse' && mood === 'fail' ? 'is-tip' : ''}`}
        >
          <rect x="260" y="100" width="220" height="18" rx="3" fill="#c4a35a" />
          <rect x="270" y="104" width="200" height="4" fill="#e8d090" opacity="0.5" />
        </g>

        <g
          className={`sentence-site-worker ${mood === 'success' ? 'is-win' : ''} ${
            bracing ? 'is-brace' : ''
          } ${mood === 'fail' ? 'is-hurt' : ''}`}
        >
          <ellipse cx="340" cy="210" rx="28" ry="10" fill="#0a1624" opacity="0.35" className="sentence-site-shadow" />
          <rect x="322" y="150" width="36" height="52" rx="10" fill="#e8a317" />
          <rect x="318" y="148" width="44" height="14" rx="4" fill="#f0c14a" />
          <ellipse cx="340" cy="132" rx="22" ry="12" fill="#f5c542" />
          <rect x="318" y="132" width="44" height="8" rx="2" fill="#e8a317" />
          <circle cx="340" cy="142" r="14" fill="#d4a574" />
          <rect className="sentence-site-arm-l" x="300" y="158" width="24" height="10" rx="4" fill="#e8a317" />
          <g className="sentence-site-hammer-arm">
            <rect className="sentence-site-arm-r" x="356" y="158" width="24" height="10" rx="4" fill="#e8a317" />
            <rect className="sentence-site-hammer" x="376" y="148" width="6" height="22" rx="1" fill="#6a5a3a" />
            <rect className="sentence-site-hammer-head" x="372" y="144" width="14" height="8" rx="1" fill="#4a5560" />
          </g>
          <rect x="326" y="198" width="12" height="28" rx="3" fill="#1e3a5f" />
          <rect x="342" y="198" width="12" height="28" rx="3" fill="#1e3a5f" />
          <circle cx="335" cy="140" r="1.5" fill="#2a1a0a" />
          <circle cx="345" cy="140" r="1.5" fill="#2a1a0a" />
          {mood === 'success' && (
            <path d="M333 148 Q340 154 347 148" fill="none" stroke="#2a1a0a" strokeWidth="2" />
          )}
          {(mood === 'fail' || bracing) && (
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
