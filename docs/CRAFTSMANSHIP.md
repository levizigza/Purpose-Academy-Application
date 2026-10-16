# Purpose Academy — Living Craftsmanship Doctrine

> **This document is not finished.** It is the stone we keep carving.
> Every agent and human who touches Purpose Academy must **read it before changing the product**, then **update it** when a lesson is learned, an assumption fails, or quality rises.
> The destination is not a frozen “10/10.” The destination is a school that stays honest, coherent, and worthy of the people who trust it — long after any one of us is gone.

---

## 1. Why this exists

Purpose Academy is a Calgary trades school product: Construction, Logistics, and Community Support Foundations on one learning spine. Craft here means **coherence** — marketing, portals, lessons, vocabulary, sound, and trust language all tell the same true story.

This doctrine exists so quality does not depend on memory. When we return months later, or when a new agent arrives, we inherit a living standard — not a vibe.

### Continuous journey (non-optional)

1. **Challenge assumptions.** Before shipping a “polish,” ask what we might be wrong about (audience, depth, honesty, load).
2. **Grow with the platform.** When curriculum grows, doctrine grows. When a pathway is thinner, copy says so.
3. **Protect what already sings.** Tool Chest, VocabSheet, Calgary voice, mother-tongue → English discipline — do not sand these into generic edtech.
4. **Leave the trail better.** Every meaningful craft pass ends with a short entry in [§9 Changelog](#9-changelog-living).

---

## 2. How to use this document

| Who | Duty |
|-----|------|
| Cloud / coding agents | Read this file at the start of any UI, curriculum, brand, or learning-flow change. Cite relevant sections in the PR. Append a changelog line when craft rules or product truth change. |
| Humans | Treat edits here as product decisions, not docs chore. Prefer short, concrete rules over essays. |
| Future selves | If a rule no longer matches the product, rewrite the rule — do not paper over the product. |

**Pointer for agents:** root `AGENTS.md` requires this file. Do not invent a parallel style guide.

---

## 3. Non-negotiables (protect first)

These are load-bearing. Improve around them; do not replace them with trend templates.

1. **Calgary trades-school voice** — concrete, respectful, short sentences. Not startup hype. Not purple SaaS.
2. **Mother tongue → English discipline** — home languages support understanding; English is the workplace word.
3. **VocabSheet / Tool Chest craft** — Level-1 gate (Daily Conversation 1–20), full tables stay open to practise, real photos where we have them.
4. **One learning spine** — same 20-step school path across pathways; pathway packs change craft, not the spine shape.
5. **Instructor truth** — skills are verified; do not sell “finish the quiz = job ready.”
6. **Honesty over symmetry** — if Community has ~16 specialty workplace words and Construction has 660 visual vocab rows, marketing and UI must not pretend they are the same depth.

---

## 4. Product story (one school, three doors)

**Brand-level story:** Purpose Academy is one school with three open doors into work:

| Door | Depth signal (today) | Accent (CSS + `PATHWAY_META`) |
|------|----------------------|-------------------------------|
| Construction Foundations | Flagship: Daily Conversation 200 + Construction VV 660 + shop/site craft | Amber `#e8a317` |
| Logistics Foundations | Daily Conversation 200 + Logistics VV 500 + warehouse craft | Blue `#2f6bb0` |
| Community Support Foundations | Daily Conversation 200 + focused community-support workplace set (~16) + dignity/privacy craft | Green `#5c9b35` |

**Rules:**

- Marketing may call Construction the flagship **depth**, not the only door.
- Home, Programs, Admissions, and student portal must agree: learners **choose a pathway**, not “Construction only.”
- Student LMS chrome labels progress with the **active pathway name**, never a hard-coded “Construction” when another path is selected.
- Shared layer first: Daily Conversation Vocabulary is shared; specialty visual vocabulary and Word→Action are pathway craft.

---

## 5. Learning craft standards

### 5.1 Distractors and drills

- Word→Action and Supported Matching distractors must come from the **specialty-domain pool** (not Daily Conversation greetings/phrases), unless the specialty pool is too thin (&lt; 4 terms).
- Prefer other Word→Action `termId`s when building Word→Action choices.
- Never ship a drill where “Hammer” is opposed by “Hi / Hello / Hey.”
- Shuffle distractors; do not always take array head.

### 5.2 Lesson-first chrome

- Inside a lesson, the Learning Path Map is **compact**. Full path lives on Path home / hub.
- Header: brand of the step (title, help, progress) before secondary meta.
- Practice Mode and LMS share the same spine language; Practice may skip early admin steps but must not invent a second curriculum.

### 5.3 Vocabulary honesty

- Level-1 continue gate = Daily Conversation words 1–20 across streams.
- Specialty packs may grow; copy and badges must track **actual counts**.
- Eye Spy and photo scenes need real photography before we claim “busy job-site scenes.” Until then, document as a climb — do not fake richness in copy.

### 5.4 Sound (foley)

- Current procedural foley is **construction-site flavoured** (hammer, wood, saw, ambient bed).
- Construction may use site one-shots on transitions; Logistics / Community should prefer soft UI cues (`correct` / `wrong` / `whoosh`) until pathway beds exist.
- Toggle copy is **Practice sounds**, not “construction sounds,” unless the learner is clearly on a construction ambient bed.
- Future climb: pathway-aware beds (warehouse / community soft beds) without spam or looping noise.

---

## 6. Visual and interaction craft

1. **One composition** on public heroes — brand first, one headline, one short promise, one CTA group, one dominant visual plane.
2. **No fake dashboard** on marketing pages.
3. **Cards only for interaction** — not decoration.
4. **Pathway accents** must match CSS tokens (`--path-construction|logistics|community`) and `PATHWAY_META.accent` — never drift teal/purple off-token.
5. **Motion with purpose** — reveals and transitions serve hierarchy; respect `prefers-reduced-motion`.
6. **Mobile and desktop** both load clean; splash/gate must not trap screenshot or learner entry forever without an obvious continue.

---

## 7. Trust craft (About, people, claims)

- Team section may list **founding builders** with interim honesty (“roles and portraits forthcoming”) rather than hollow “Role forthcoming” emptiness without framing.
- Do not invent bios, credentials, or placement rates.
- Contact and admissions promises must be fulfillable by the school ops reality.
- Prefer “we are building” over “we are complete” when depth is still climbing.

---

## 8. Aims vs shortfalls (honest audit)

Revisit when aims change. Ranked by learner / trust harm.

| Aim | Where we stand | Shortfall |
|-----|----------------|-----------|
| Three doors into work | Marketing + Practice packs open for all three | LMS specialty modules exist mainly for Construction; Logistics/Community account courses can look “caught up” with zero lessons |
| Language → practice → verify | VocabSheet + drills + instructor Competent honesty | Community Level-1 gate once required the full 200+ deck (fixed); Eye Spy is still a photo collage, not a photographed scene |
| Shared Daily Conversation Level-1 | Doctrine + Construction/Logistics | Must stay identical for Community (fixed this climb) |
| Apprenticeship / work readiness | Copy + Skills Passport disclaimers | Do not over-claim placement rates or “Enrolling now” depth where specialty is still thin |
| One school spine | Practice `/journey` is the rich spine | Portal home must point at Practice when LMS lessons are missing — never fake completion |

**Protect:** VocabSheet, Tool Chest, Calgary voice, instructor-Competent truth, three-door story.

---

## 9. Active climbs (challenge these next)

Living backlog — reorder as evidence appears. Strike or move items into the changelog when done.

| Climb | Why it matters | Status |
|-------|----------------|--------|
| Specialty distractors in Word→Action / match | Domain integrity of drills | Done (craft pass) |
| Three-door marketing + portal labels | Story coherence | Done (craft pass) |
| Accent token alignment | Visual identity coherence | Done (craft pass) |
| Lesson-first compact path map | Attention on the lesson | Done (craft pass) |
| About founding-builders framing | Trust without fake bios | Done (craft pass) |
| Community Level-1 gate = Daily Conversation 1–20 | Non-negotiable gate parity | Done (honesty climb) |
| LMS honesty when specialty lessons missing | Stop false “caught up”; bridge to Practice | Done (partial — portal next-step + progress copy) |
| Pathway-aware foley beds | Sound matches craft | Open |
| Eye Spy photography upgrade | Memorable scene craft | Open — needs assets; copy softened to “among photos” |
| Community specialty vocab growth | Honest depth toward usefulness | Open |
| Deeper Logistics/Community LMS modules | Account path matches Practice depth | Open |
| Fuller one-spine UX (Practice ↔ LMS) | First-week mental model | Open — portal bridge started; keep challenging |

When closing a climb: update Status, add a changelog line, and write the **new assumption to challenge next**.

---

## 10. Changelog (living)

Newest first.

### 2026-03-27 — Honesty climb: Level-1 gate + LMS truth

- Community (all pathways) Level-1 continue gate = Daily Conversation words **1–20**; full tables stay open to practise.
- Student portal no longer claims “caught up” when Logistics/Community have zero LMS lessons — next step opens Practice spine with pathway set.
- Community marketing badge: “Open · specialty depth growing” (not identical “Enrolling now” depth).
- Eye Spy help copy softened to match collage reality until photography lands.
- README aligned to three open Practice doors + honest LMS depth note.
- **Assumption to challenge next:** whether pointing LMS → Practice is enough, or learners still need a single visible spine inside `/app/student` itself.

### 2026-03-27 — Craft pass: statue from the stone

- Created this living doctrine + `AGENTS.md` pointer.
- Fixed specialty distractors so Daily Conversation terms no longer pollute Word→Action / Supported Matching.
- Aligned Home, Programs, Admissions, brand promise, and student portal to the three-door story; pathway-named progress.
- Matched `PATHWAY_META` accents to CSS path tokens; Community copy states focused specialty set honestly.
- Forced compact Learning Path Map in lessons; About reframed as founding builders; foley labeled as practice sounds with construction transition cues gated to Construction.
- **Assumption to challenge next:** whether Practice Mode and LMS still feel like one school in a learner’s first week — measure confusion, don’t assume the spine diagram is enough.

---

## 11. Ritual for every future craft pass

1. Read this file (especially §8 shortfalls and §9 climbs).
2. Name the one composition or one drill you are improving (not ten).
3. Chisel the product.
4. Verify on desktop and mobile for touched surfaces.
5. Update §9 / §10 with what changed and what assumption you will challenge next.
6. Leave the school more honest than you found it.

*— Purpose Academy craft lineage. Carry it forward.*
