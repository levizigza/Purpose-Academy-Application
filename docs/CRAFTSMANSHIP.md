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
4. **Leave the trail better.** Every meaningful craft pass ends with a short entry in [§11 Changelog](#11-changelog-living).

### Builder and critic (same person)

You are not done when it “works.” You are done when you have argued against your own work and still stand by it — or changed it.

This is a **relentless pursuit of greatness**, not self-punishment. Steve Jobs energy: love the customer enough to refuse mediocre. Never toxic shame; always specific, fixable critique.

| Habit | Do this | Refuse this |
|-------|---------|-------------|
| **Build** | Ship a coherent step | Endless polish with no handoff |
| **Destroy** | Tear down what fails the customer test | Defending a clever trick that reads wrong |
| **Question** | “Is this good enough for a first walk-in?” | “It matches the ticket / the pixels say OK” |
| **Customer** | A Calgary learner / parent / instructor on a phone | Our own cleverness, agent ego, prior commit inertia |
| **Journey** | Improve the product; leave a changelog trail | Treating any version as the final destination |

**Critic loop (run on every craft climb):**

1. What is the customer supposed to feel / understand in the first three seconds?
2. What is competing for attention that should not?
3. What still looks fake, cheap, or unclear — name it in plain language.
4. Fix the highest-harm issue next; do not stack vanity tweaks.
5. Re-test as a stranger. If you would hesitate to show a founding builder, keep carving.

**Changelog duty:** when the critic wins, record what failed and what replaced it. That is how the journey compounds.

### Splash version backups (revert feedback decisions)

Composition choices get overturned. Keep restore points so a climb can walk back without archaeology.

| Command | Purpose |
|---------|---------|
| `node scripts/splash-version.mjs snapshot vN --note "..."` | Freeze current splash (CSS block + door + entry) |
| `node scripts/splash-version.mjs restore vN` | Put that version back into `src/` |
| `node scripts/splash-version.mjs list` | See what we can walk back to |

Archives live in [`docs/splash-versions/`](splash-versions/). Snapshot **before** a risky overturn and **after** a live-confirmed win. Bump `ENTERED_KEY` after restore if visitors should replay.

---

## 2. How to use this document

| Who | Duty |
|-----|------|
| Cloud / coding agents | Read this file at the start of any UI, curriculum, brand, or learning-flow change. Name which **craft layer(s)** you are touching. Append a changelog line when craft rules or product truth change. |
| Humans | Treat edits here as product decisions, not docs chore. Prefer short, concrete rules over essays. |
| Future selves | If a rule no longer matches the product, rewrite the rule — do not paper over the product. |

**Pointer for agents:** root `AGENTS.md` requires this file. Do not invent a parallel style guide. For UI work, **§7.0–7.0b is the aesthetics + information-display template** — inherit it; do not fork it.

**Site-wide rule:** Craft layers apply to *every* surface — public marketing, splash/enter, auth, Practice `/journey`, portal School path, Learn/LMS, instructor, and admin — not only the last page we polished. Coherence beats local cleverness.

---

## 3. Craft layers (multiple levels — keep them distinct)

Craftsmanship is not one blob. Different work needs different chisels. Always know **which layer** you are carving.

| Layer | Job | Success looks like | Failure looks like |
|-------|-----|--------------------|--------------------|
| **L1 · Truth & story** | One school, three doors, honest depth | Home / Programs / Admissions / portal agree | Construction-only copy while three doors are open |
| **L2 · Content delivery** | Curriculum, vocab, drills, gates, mother-tongue → English | Specialty distractors; Level-1 = 20; instructor Competent honesty | Hammer vs Hi/Hello; fake “busy scene”; quiz = job ready |
| **L3 · Aesthetic optics + information display** | How it *looks*, and whether the user can **read the job** | Cool trades gravity; whole-object photos; task → result clear in 3s; shared grammar site-wide | Cheap chrome; mystery crops; silent success; each page invents its own UI dialect |
| **L4 · Attention ethics** | How human attention is treated | Finite stations; Done for now; metrics serve craft | Infinite feed, streak FOMO, soft-pulse addiction, “one more” |
| **L5 · Trust & people** | Founding builders, claims, ops honesty | Interim roles framed honestly | Invented bios, inflated enrollment badges |
| **L6 · Systems spine** | Practice ↔ portal ↔ Learn mental model | School path visible in-account; Learn is extra when built | Two unrelated products; false “caught up” |

### How layers interact

- **L3 (optics) ≠ L2 (content).** Different chisels, different tests. Aesthetic craft asks: *does this feel like a real trades school people are proud to walk into?* Content-delivery craft asks: *is the drill honest, the gate correct, the vocabulary deep enough for this pathway?* A beautiful empty page still fails content craft. A correct distractor pool with chaotic chrome still fails optics.
- **Expect multiple levels inside a layer.** Construction flagship depth, Logistics warehouse craft, and Community dignity craft will each need their own content-delivery standards as packs grow — same spine, different specialty chisels. Optics may also shift (site bed vs warehouse bed vs soft community stage) without abandoning the shared navy/amber/crew grammar.
- **L4 (attention) sits under both.** Pretty or correct content can still farm people — refuse that.
- **L1 binds the site.** Every surface must tell the same true story.
- When you ship a change, say which layers moved (e.g. “L3+L4 School path stage”).

### Human nature (feeds L3 + L4)

| Source | Take the insight | Refuse the harm |
|--------|------------------|-----------------|
| **Bernays / mass persuasion** | Symbols, belonging, and clear desire shape action | False scarcity, fake social proof, prestige lies |
| **Social media loops** | Variable reward + infinite feed capture attention | Invert: finite stations, mastery gates, dignified exits |
| **Spiral Dynamics (~serve 5 and below first)** | Order, belonging, respect, concrete win before abstract self-authoring | Shame; childish gamification; chaos that pride rejects |

UX translation (not SD colour cosplay):

| Need | Product move |
|------|----------------|
| Belonging / crew | Pathway identity, Calgary voice, crew-path language |
| Order | Numbered 20-step spine, Level-1 gates, clear “you are here” |
| Dignity | Adult tone, tool photos, no casino chrome |
| Achievement | One **Today’s station**; Skills Passport; marks = skill |
| Ascent | After Familiar, next station — never endless novelty |

### Anti-doomscroll rules (site-wide)

1. **One station in focus** on training surfaces — not a wall of metrics.
2. **Finite session** copy — name the finish.
3. **Mastery before more** — gates over swipe.
4. **Dignified exit** — **Done for now** (or calm equivalent) on training surfaces.
5. **Metrics serve craft** — practice marks, not addiction loops; no infinite notification theatre.
6. **Optics = respect** — cool for construction culture is a trust signal.
7. **No attention spam motion** — avoid endless soft-pulse / glow on chrome meant for calm work.

Ask on every UI change: *Does this pull someone into mindless more, or walk them into a finished station?*

### 3.1 Systems thinking (isolation + connection)

Study trail: [awesome-system-design-resources](https://github.com/ashishps1/awesome-system-design-resources) (core concepts, APIs, tradeoffs, patterns). We translate those ideas into **product and experience architecture** — not only servers.

Every surface is a **module**. Modules must be excellent in isolation *and* speak a shared contract so the whole school feels like one organism.

| System idea | Meaning in distributed systems | Purpose Academy translation |
|-------------|--------------------------------|------------------------------|
| **High cohesion** | One module, one job | Splash opens the school; Home orients; Practice runs a station; Learn deepens — do not dump every job into one page |
| **Low coupling / narrow interfaces** | Depend on contracts, not guts | Shared contracts: three-door story, pathway accents, navy grammar, 20-step spine language, session “crossed threshold” |
| **API / gateway** | One entry that routes cleanly | Splash (and `/enter/*` bypass) is the gateway — strike → cross → Home must land on the same visual/language contract as the rest of the site |
| **Idempotency** | Same action twice is safe | Re-entering after splash (session key) must not trap or re-force the open; deep links bypass without breaking state |
| **Single source of truth** | One owner per fact | Pathway name, Level-1 = 20, vocab counts, brand copy live in packs/`BRAND` — UI reads them, does not invent parallel numbers |
| **Latency vs throughput** | Feel fast without flooding | One focal motion at a time (staging); no attention-spam loops; finite stations over infinite feed |
| **Failover / graceful degradation** | Partial failure still serves | Missing specialty LMS → honesty, not fake “caught up”; reduced-motion → still enter; TTS bake skip must not block Pages |
| **Event-driven handoffs** | Clear events between parts | Splash stages (build/breathe/resolve) → `markEnteredSite` → Home hero continues three doors; Practice marks ↔ portal School path |
| **Tradeoffs** | Name what you give up | Wider architectural door vs exact logo slit; cinematic open vs instant entry — document the choice in changelog |

**Flow law:** map the learner journey as a system before polishing a screen.

```
Splash (gateway) → Home (orient) → Admissions/Enter (identity)
        → Portal School path (spine) ↔ Practice /journey (station)
        → Learn/LMS (depth when built) → Skills Passport (proof)
```

When you change one node, ask: *What contract did neighbors rely on? Did the handoff still feel continuous?*

**Isolation test:** Could this module still make sense if the rest of the site were missing?  
**Connection test:** Does walking splash → home → programs feel like one school, or three different products?

---

## 4. Non-negotiables (protect first)

These are load-bearing across all layers.

1. **Calgary trades-school voice** — concrete, respectful, short sentences. Not startup hype. Not purple SaaS.
2. **Mother tongue → English discipline** — home languages support understanding; English is the workplace word.
3. **VocabSheet / Tool Chest craft** — Level-1 gate (Daily Conversation 1–20), full tables stay open to practise, real photos where we have them.
4. **One learning spine** — same 20-step school path across pathways; pathway packs change craft, not the spine shape.
5. **Instructor truth** — skills are verified; do not sell “finish the quiz = job ready.”
6. **Honesty over symmetry** — if Community has ~16 specialty workplace words and Construction has 660 visual vocab rows, marketing and UI must not pretend they are the same depth.
7. **Solid information output** — every training and marketing surface must make the task, the picture/media, and the result unmistakable. Ambiguous feedback, cropped objects, or silent “success” are craft defects (see §7.0).

---

## 5. Product story (one school, three doors) — Layer L1

**Brand-level story:** Purpose Academy is one school with three open doors into work:

| Door | Depth signal (today) | Accent (CSS + `PATHWAY_META`) |
|------|----------------------|-------------------------------|
| Construction Foundations | Flagship: Daily Conversation 200 + Construction VV 660 + shop/site craft | Amber `#e8a317` |
| Logistics Foundations | Daily Conversation 200 + Logistics VV 500 + warehouse craft | Blue `#2f6bb0` |
| Community Support Foundations | Daily Conversation 200 + focused community-support workplace set (~16) + dignity/privacy craft | Green `#5c9b35` |

**Rules:**

- Marketing may call Construction the flagship **depth**, not the only door.
- Home, Programs, Admissions, splash, and student portal must agree: learners **choose a pathway**.
- Student LMS chrome labels progress with the **active pathway name**.
- Shared layer first: Daily Conversation Vocabulary is shared; specialty visual vocabulary and Word→Action are pathway craft.

---

## 6. Content delivery craft — Layer L2

### 6.1 Distractors and drills

- Word→Action and Supported Matching distractors must come from the **specialty-domain pool** (not Daily Conversation greetings/phrases), unless the specialty pool is too thin (&lt; 4 terms).
- Prefer other Word→Action `termId`s when building Word→Action choices.
- Never ship a drill where “Hammer” is opposed by “Hi / Hello / Hey.”
- Shuffle distractors; do not always take array head.

### 6.2 Lesson-first chrome

- Inside a lesson, the Learning Path Map is **compact**. Full path lives on Path home / School path.
- Header: brand of the step (title, help, progress) before secondary meta.
- Practice Mode and LMS share the same spine language; Practice may skip early admin steps but must not invent a second curriculum.

### 6.3 Vocabulary honesty

- Level-1 continue gate = Daily Conversation words 1–20 across streams.
- Specialty packs may grow; copy and badges must track **actual counts**.
- Eye Spy and photo scenes need real photography before we claim “busy job-site scenes.” Until then, document as a climb — do not fake richness in copy.

### 6.3a Sentence Structure (Construction) — not VocabSheet

- After Visual Vocabulary, Construction opens **Sentence Structure** (cloze bank from Construction Questions 1–560) before Word → Action.
- **Ladder gate (required):** Daily Conversation Level-1 **and** specialty Construction Visual Vocabulary Level-1 (first workplace picture page) before Sentence Structure unlocks. Greetings alone must not open specialty sentences.
- Cloze bank prefers / keeps rows whose answers exist in pictured specialty VV (orphan PPTX rows stay out of the graded bank).
- **Different interaction mold from vocabulary:** SITEWISE-style **site stage** + job board (sentence is the visual), not a VocabSheet photo card.
- **One attempt per item** — no answer shopping.
- Correct: word **locks onto the job board** with motion; crew celebrates.
- Wrong: word **bounces off**; an absurd, sentence-tied consequence plays (anvil drop, collapse, splash, slip, spark, crush) so guessing sticks in memory — then teach the right word and move on.
- Level-1 sentence gate = first page of 20 with ≥16 first-try correct (+ repair for misses). More pages stay open to practise.
- Feedback text must meet contrast on the stage chrome (do not reuse washed-out train `.alert.ok` greens on light panels).
- Language ladder: gloss → picture → **sentence** → action → instruction → phrase.

### 6.3b Photos show the whole object

- Training object photos and pathway program cards use **`object-fit: contain`** so royalty-free imagery is fully readable.
- Do not crop tool/vocab photos with `cover` on drill surfaces. Full-bleed marketing heroes may still use cover when the composition is intentionally edge-to-edge.

### 6.3c Vocabulary audio

- Every vocabulary English word must speak when the learner bridges or presses Hear English.
- Priority stays: baked neural → live neural → Free Dictionary (works without our API) → browser `speechSynthesis`.
- After a home-language connect, auto-speak the English workplace word.

### 6.4 Sound (foley)

- Current procedural foley is **construction-site flavoured** (hammer, wood, saw, ambient bed).
- Construction may use site one-shots on transitions; Logistics / Community should prefer soft UI cues (`correct` / `wrong` / `whoosh`) until pathway beds exist.
- Toggle copy is **Practice sounds**, not “construction sounds,” unless the learner is clearly on a construction ambient bed.
- Future climb: pathway-aware beds (warehouse / community soft beds) without spam or looping noise.

---

## 7. Aesthetic optics craft — Layer L3

This section is the **site-wide aesthetics + information-display template** — the contract for how Purpose Academy looks *and* how information reaches the user.

**Moving forward (non-optional):** every new page, drill, pathway card, or portal surface must inherit this template. Do not invent a parallel visual language for one feature. Prefer reuse of kickers, alerts, choice grids, contain-mats, and pass states over one-off chrome. If a surface cannot meet §7.0 / §7.0a, it is not ready to ship.

**Surfaces in scope:** public marketing · splash/enter · auth · Practice `/journey` · portal School path · Learn/LMS · instructor · admin.

### 7.0 Non-negotiable optics checklist (every surface)

1. **One composition** on public heroes — brand first, one headline, one short promise, one CTA group, one dominant visual plane.
2. **No fake dashboard** on marketing pages.
3. **Cards only for interaction** — not decoration.
4. **Pathway accents** must match CSS tokens (`--path-construction|logistics|community`) and `PATHWAY_META.accent`.
5. **Motion with purpose** — serves hierarchy; respect `prefers-reduced-motion`; no endless attention-spam pulses on work chrome.
6. **Mobile and desktop** both load clean; splash/gate must not trap entry without an obvious continue.
7. **Cool for the trades** — shop-floor gravity (navy, amber, material photos, crew order). Proud to be seen here — not homework app, not casino.
8. **Training stages** (School path / Practice hub) sit on a dark material stage when embedded in the light portal so light text never dies on paper.
9. **Opening / splash is L3 too** — composition + motion doctrine below. Exit is walk-through (strike → dolly), not shatter.
10. **Information first** — the learner must understand the task, the picture, and the result in three seconds. If the image is cropped so the object is unclear, or feedback is ambiguous, the surface fails.
11. **Whole-object photos** — pathway cards, VocabSheet, Word→Action, Matching, Sentence Structure imagery, and similar object drills use `object-fit: contain` with a calm mat. Mystery crops are a craft defect. Full-bleed marketing heroes may use `cover` only when the composition is intentionally edge-to-edge.
12. **Success is visible** — when a station or page is passed, show a clear, calm success state (badge / filled sentence / advance). Do not rely on a silent score tick.
13. **Shared grammar** — navy/amber/crew type, section kickers, `alert ok|warn`, choice grids, and finite “Done for now” exits stay consistent across pathways.

### 7.0a Information display (user quality — utmost importance)

Solid information output is not polish after the fact. It is the product. A Calgary walk-in on a phone must never guess what to do, what they are looking at, or whether they succeeded.

| Need | Product move | Failure (refuse) |
|------|----------------|------------------|
| Know what to do | One kicker + one task line above the interaction | Walls of instructions; competing CTAs |
| See the thing | Full object in frame (`contain`); caption names the job | Cropped tools/people; decorative filler photos |
| Hear the word | English audio on every vocab bridge / Hear English | Silent speaker buttons; language-only with no English |
| Know if it worked | Immediate visual + short plain sentence (`alert ok\|warn`, pass badge, word-in-blank) | Score ticks only; green with no explanation |
| Know what next | One primary continue; secondary “keep practising” only when more bank pages exist | Multiple equal primaries; dead ends |

**Display laws (site-wide):**

1. **One job per section** — one headline, one supporting line, one primary action.
2. **Hierarchy over density** — station task beats path map chrome; path map stays compact inside a lesson.
3. **Media serves meaning** — if removing the image would make the word/task unclear, the image must show the whole object.
4. **Feedback in the same glance** — correct/wrong state appears on the control *and* in a short sentence; no scavenger hunt.
5. **Same dialect everywhere** — Practice, portal, and Learn should feel like one school’s worksheets, not three apps.
6. **Desktop and mobile** — information order stays the same; nothing essential hides behind hover-only chrome.

**Pre-ship critic (run before merge on any UI/curriculum surface):**

1. What is the customer supposed to feel / understand in the first three seconds?
2. Can they name the task, the object/media, and the outcome without help?
3. What is competing for attention that should not?
4. Does this surface reuse shared grammar, or invent a one-off dialect?
5. Would you show this to a founding builder without apologizing?

**Critic test:** Remove the nav. Can a Calgary walk-in still tell which school this is, what the station wants, and whether they succeeded? If not, keep carving.

### 7.0b Surface coherence matrix

| Surface | Must inherit | Extra duty |
|---------|--------------|------------|
| Splash / enter | Brand-first composition; purposeful motion | Door architecture §7.3; walk-through exit |
| Home / Programs / Give | Three-door story; whole pathway photos; one job per section | Honest depth counts; no fake dashboards |
| Practice `/journey` | Kickers, alerts, choice grids, contain object mats, visible pass | Finite stations; Done for now; mastery gates |
| Portal School path | Same spine language + dark stage for light text | Today’s station; no feed chrome |
| Learn / LMS | Same pathway accents + honesty when empty | Never fake “caught up” |
| Instructor / admin | Calm work chrome; clear status language | No casino metrics theatre |

When you add a feature to one row, check the neighbors. *Connection test:* splash → home → programs → Practice must feel like one organism.

### 7.1 Composition foundations (splash first → then site-wide)

These are not decoration tips. They decide where the eye lands. Sources we study and apply: NN/g visual design principles, Interaction Design Foundation (rule of thirds / focal point), [Design Systems Repo](https://designsystemsrepo.com/) (systems discipline for site-wide reuse), open motion craft notes (Hyperframes / twelve-principles translations).

| Principle | Meaning here | Splash application (v33+) |
|-----------|--------------|---------------------------|
| **Focal point** | One primary center of interest; everything else supports it | The open **doorway cavity / daylight** is the hero — camera transform-origin sits on the stem, not the bowl |
| **Rule of thirds** | Divide the frame 3×3; put weight on lines/intersections | Name sits on the **upper third**; pathways on the **lower third**; hammer CTA on the **lower-right intersection**; P biased so the stem reads near the left-vertical third |
| **Visual hierarchy** | Size, contrast, order, and *who moves first* = importance | Door moves first → name → pathways → hammer. Never animate all at once |
| **Balance** | Visual weight distributed (symmetry = calm; asymmetry = energy) | Asymmetric: mark + paths left/center, tool CTA right — dynamic, not a dead stack |
| **Framing / staging** | Negative space and vignette tell the eye where to look | During the open, periphery dims slightly so only the doorway reads; then the frame breathes open |
| **Negative space** | Empty area is structure, not leftover | Keep air between name / mark / paths / hammer — no cramped card stack |

**Site-wide (same laws — required now, not “later”):** public heroes, pathway cards, Practice stations, and portal School path apply focal point + hierarchy + air. Design-system discipline (tokens, pattern reuse) comes from studying systems at designsystemsrepo.com without copying their chrome. New UI reuses existing patterns before inventing new ones.

### 7.2 Motion foundations (Illusion of Life → screen)

Priority for our craft (90% of quality): **slow-in/out, timing, anticipation, staging, follow-through/overlap, arcs**. Personality: restrained exaggeration + secondary action.

| Principle | Splash law |
|-----------|------------|
| **Staging** | One idea per beat. Dim the rest when the door acts. |
| **Anticipation** | Crack of daylight + tiny leaf dip *before* the commit swing. |
| **Timing / weight** | Door = cinematic (slow). Paths = medium. Hammer hint = light/fast. |
| **Slow in / out** | Spatial moves use ease-out entrances; exits accelerate. Pose charts keep dense keys at extremes. |
| **Follow-through / overlap** | Light leads the leaf; icons lag labels; shadow settles after the mark. |
| **Arcs** | Camera and hammer travel with a slight curve, not a mechanical slide. |
| **Secondary action** | Dust motes + soft floor pool support the open — never steal focus. |
| **Appeal** | Soft natural daylight, readable door leaf, confident settle — remove competing glow. |

**Scene structure (every opening):** **Build** (mark arrives) → **Breathe** (door + light live alone) → **Resolve** (name, paths, CTA land in hierarchy order).

**Choreography = hierarchy:** the element that moves first is perceived as most important. Stagger by importance, not DOM order. Vary easing and direction across elements — do not ease everything the same way.

### 7.3 Door architecture & perspective (master craft)

The splash door is **architecture inside a letter**, not a hairline slit. If it does not read as a door a carpenter would hang, it fails.

| Law | Number / rule | Why |
|-----|---------------|-----|
| **Real door ratio** | Metric ≈ **900 × 2100 mm** → height÷width ≈ **2.33**; Palladio main doors often ~2:1 | Ratio survives perspective; absolute px do not ([perspectivegrids](https://perspectivegrids.com/references/figure-and-door/)) |
| **Splash cavity target** | height÷width ≈ **2.5–2.8** (v34: 74÷28 ≈ **2.64**) | Was ~6.4 — a letter-slot, not a door. Wider stem so the P can hold architecture |
| **Verticals stay vertical** | Hinge axis = upright; no tipped posts | One-/two-point interior perspective keeps uprights upright |
| **Perspective on the parent** | `perspective` + `perspective-origin` on `.doorway-hinge`, not the leaf | Origin biased **right** (~155%) so the open slab keeps a readable face instead of collapsing to a knife-edge |
| **Foreshortening** | Open angle ~**68°** settle | Farther open → narrower face; too open = edge-on stick; too closed = no cavity. Show slab + empty space together |
| **Solid drawing** | Leaf thickness edge + lintel + sill + jamb lips | A door has depth and a frame; paper cutouts read fake |
| **Light through the void** | Daylight clipped to the cavity mouth only | Sunshine comes from the empty opening, not a glow behind the whole letter |

**Study trail:** standard door sizes; open-door perspective (hinge fixed, free edge swings, top/bottom edges follow the rotated plane); CSS 3D door patterns (perspective on frame, `transform-origin: left`, `preserve-3d`).

---

## 8. Trust craft — Layer L5

- Team section may list **founding builders** with interim honesty (“roles and portraits forthcoming”).
- Do not invent bios, credentials, or placement rates.
- Contact and admissions promises must be fulfillable.
- Prefer “we are building” over “we are complete” when depth is still climbing.
- Community enrollment language: “Open · specialty depth growing” until depth earns “Enrolling now” parity.

---

## 9. Aims vs shortfalls (honest audit)

Revisit when aims change. Ranked by learner / trust harm.

| Aim | Where we stand | Shortfall |
|-----|----------------|-----------|
| Three doors into work | Marketing + Practice packs open for all three | LMS specialty modules exist mainly for Construction |
| Language → practice → verify | VocabSheet + drills + instructor Competent honesty | Eye Spy still collage; Community specialty set still thin |
| Shared Daily Conversation Level-1 | All pathways gate at 20 | Keep watching regressions when packs merge |
| Apprenticeship / work readiness | Copy + Skills Passport disclaimers | Do not over-claim placement rates |
| One school spine | Portal **School path** + `/journey` drills | Learn (LMS) still thinner for Logistics/Community |
| Site-wide attention ethics | School path + lessons have Done for now / today’s station | Keep sweeping public, Learn, instructor chrome for leftover feed patterns |
| Site-wide aesthetics + solid info display | Doctrine §7.0–7.0b; contain photos; Sentence Structure pass states | Keep sweeping Learn / instructor / admin for one-off dialects and weak feedback |

**Protect:** VocabSheet, Tool Chest, Calgary voice, instructor-Competent truth, three-door story, §7 information-display template.

---

## 10. Active climbs (challenge these next)

| Climb | Layer | Status |
|-------|-------|--------|
| Specialty distractors | L2 | Done |
| Three-door marketing + portal labels | L1 | Done |
| Accent token alignment | L3 | Done |
| Lesson-first compact path map | L2/L3 | Done |
| About founding-builders framing | L5 | Done |
| Community Level-1 gate = 20 | L2 | Done |
| LMS honesty when specialty lessons missing | L1/L6 | Done (partial) |
| Fuller one-spine UX (School path in portal) | L6 | Done |
| Optics + attention ethics (path stage) | L3/L4 | Done — iterate |
| Site-wide craft layers (doctrine + sweep) | L1–L6 | Done (this climb) — keep sweeping |
| Pathway-aware foley beds | L2/L3 | Open |
| Eye Spy photography upgrade | L2/L3 | Open — needs assets |
| Community specialty vocab growth | L2 | Open |
| Deeper Logistics/Community LMS modules | L2/L6 | Open |
| Portal School path polish (mobile density) | L3/L6 | Open |
| Splash opening aesthetic craft | L3/L4 | Climbing — dusk stage for light pop (v41) + version archive |
| Site-wide composition (thirds / hierarchy) | L3 | Climbing — §7.0 template locked; apply node-by-node |
| Site-wide information display (solid user output) | L3 | Climbing — §7.0a/b; every new surface inherits |
| Systems thinking (journey as architecture) | L6 | Climbing — doctrine §3.1; apply node-by-node |

---

## 11. Changelog (living)

Newest first.

### 2026-10-20 — Cloudflare Workers host for purposeacademy.ca (L6)

- `wrangler.jsonc` serves Vite `dist/` as an SPA (`not_found_handling: single-page-application`).
- Workers Builds form: `npm run build` → `npx wrangler deploy` / `npx wrangler preview`.
- Render CORS allowlist includes `purposeacademy.ca` / `www`.
- Operator steps: [docs/CLOUDFLARE_DOMAIN.md](./CLOUDFLARE_DOMAIN.md).
- **Assumption to challenge next:** whether www should 301 to apex once the Workers custom domain is green.

### 2026-10-20 — Restore GitHub Pages project base path (L6)

- Pages builds again with `PAGES_BASE=/Purpose-Academy-Application/` so JS/CSS load (root `/assets` 404s had blanked the site).
- Removed `CNAME` from the Pages artifact so the project URL is the live host again.
- **Assumption to challenge next:** keep verifying the 10-question path quiz opens early and the 30-item interest assessment stays at step 12.

### 2026-10-20 — Familiar theater when a skill clears Familiar (L2/L3)

- First time a skill reaches Familiar (or better), a brief **Familiar theater** beat lands: station name, stamp, “next door can open,” latch foley.
- Fired from `recordSkillAttempt` / `markLessonCompleted` via `pa-familiar-earned`; reduced-motion kills the stage motion.
- **Assumption to challenge next:** pathway-aware foley beds, or Portal School path mobile density.

### 2026-10-20 — Matching worksheet page + full orphan cloze purge (L2)

- Supported Practice matching is a **20-word worksheet deck** (unknown specialty first), not the full ~800-word vocab dump.
- Construction Sentence Structure **purges orphan cloze rows** whose answers have no pictured Visual Vocabulary — they never appear on later pages.
- **Assumption to challenge next:** Familiar theater (mastery celebration when a skill hits Familiar).

### 2026-10-20 — Specialize: confirm or switch pathway after interest assessment (L2)

- Step 12 results now let the learner **choose Construction / Logistics / Community** (recommended path highlighted) before site-ready skills.
- Completes the path-quiz reorder: early 10-question style pick → practice → interest inventory → explicit specialize choice.
- **Assumption to challenge next:** Matching dump / Familiar theater, or orphan-bank purge on the Sentence Structure ladder.

### 2026-10-20 — Path quiz early; interest assessment after practice (L2)

- Moved the **30-item RIASEC interest inventory** from the start of the journey to **step 12** (after English practice), so learners specialize with some workplace practice already done.
- Early path choice is a **10-question work-style quiz** (step 4) → career profile (step 5) → vocabulary practice.
- Step map shifts: vocab/Word→Action at 6–7; practice English at 8–11; specialize + site-ready at 12–16.
- **Assumption to challenge next:** whether the later interest result should offer an explicit pathway switch UI, or only refine the Holland profile inside the locked path.

### 2026-10-19 — SITEWISE motion craft: anticipation + weight (L3)

- Fail path is **anticipate → consequence → teach** (§7.2): ~280ms brace (beam tremble, worker flinch, reject float) before comic FX; consequence hold ~1.6s; teach-lock + TTS after.
- Idle crew gets a quiet secondary hammer tap; success adds a short hammer follow-through.
- Consequence FX timings slowed (slow-in/out) so weight reads; reduced-motion still kills stage animations.
- **Assumption to challenge next:** whether Matching dump / Familiar theater should climb next, or orphan-bank purge.

### 2026-10-19 — Ladder gate: DC + specialty VV before Sentence Structure (L2)

- Continue to Sentence Structure now requires **Daily Conversation Level-1 and specialty Construction VV Level-1** (not greetings alone).
- Nudge + “Jump to workplace words” after DC Level-1; cloze bank drops orphan answers with no pictured VV match.
- **Assumption to challenge next:** SITEWISE anticipation / fail Continue timing (motion craft pass).

### 2026-10-19 — Consequence themes + pictured-first Level-1 cloze (L2/L3)

- Consequence mapping is **answer-first** (then prompt, then soft admin/safety buckets, then rotated fallback) so anvil is no longer the default joke for abstract nouns (~8% anvil across 560).
- Sentence Structure orders pictured Visual Vocabulary answers onto early pages so Level-1 is not Aggregate/Piles before those pictures.
- Keeps the §7.0a chrome diet + Practice section skip from the prior carve on this climb.
- **Assumption to challenge next:** require specialty VV exposure before Sentence Structure unlocks (not only Daily Conversation Level-1).

### 2026-10-19 — Sentence station meets §7.0a display bar + practice section skip (L2/L3)

- Chrome diet on Sentence Structure: path map, mastery beads, unit pill, duplicate help hidden so the job board owns the first viewport.
- Wrong word **bounces off** the blank (never written into the sentence); teach-lock + TTS only after the consequence.
- Practice **Jump to section** / Prev–Next skip so quality review can open every station without finishing quizzes; hub + path map unlock all lessons in Practice.
- Unit 3 label → **Words → Sentences**.
- **Assumption to challenge next:** whether theme-tagged consequences (kill default-anvil skew) should land before ladder/orphan-bank retag.

### 2026-10-18 — Sentence Structure site stage (SITEWISE motion) (L2/L3)

- Rebuilt Construction Sentence Structure as a **site stage** (job board + crew SVG), not VocabSheet chrome.
- Wrong answers: absurd consequence animations tied to sentence keywords (anvil / collapse / splash / slip / spark / crush).
- Correct: word locks on the board; crew win motion. High-contrast feedback. Path map collapses while stage is active.
- **Assumption to challenge next:** whether consequence kinds feel fair/readable on mobile reduced-motion.

### 2026-10-18 — Aesthetics doctrine: site-wide coherence + information display (L3)

- Elevated L3 to **aesthetic optics + information display**; non-negotiable #7 = solid information output.
- Expanded §7: moving-forward contract, §7.0a display laws + pre-ship critic, §7.0b surface coherence matrix.
- Composition foundations are **required site-wide now**, not deferred after splash.
- Active climb + aims table track information-display coherence across Learn / instructor / admin.
- **Assumption to challenge next:** whether Learn and admin still speak a different UI dialect than Practice — sweep next.

### 2026-10-18 — Construction Sentence Structure + site-wide photo/audio craft (L2/L3)

- **L2:** Imported Construction Questions 1–560 as Sentence Structure cloze after Visual Vocabulary; Duolingo one-attempt model; word lands in the blank; page-pass badge; Level-1 = first 20 with ≥16 first-try (+ repair).
- **L2:** Vocab English auto-speaks after home-language connect; Free Dictionary works without API; browser TTS hardened.
- **L3:** Pathway/program/drill photos use `object-fit: contain` so royalty-free images are fully visible (no mystery crops).
- **L3:** Doctrine §7.0 / §7.0a — site-wide aesthetics + information-display template (whole-object photos, visible success, shared grammar). Apply on every future surface.
- Language ladder updated: gloss → picture → **sentence** → action.
- **Assumption to challenge next:** whether 16/20 + repair is the right honesty bar vs a stricter perfect first page.

### 2026-10-17 — Critic pass: dusk stage + splash version archive (L3/L6)

- **Stage:** cool light floor hid doorway glow. Dusk slate/navy shop stage so cavity daylight is obvious; type/labels lifted for contrast. v40 frozen in `docs/splash-versions/v40/` before the overturn.
- **Mechanism:** `scripts/splash-version.mjs` snapshot/restore/list — revert feedback decisions without git archaeology.
- Session key `pa-crossed-threshold-v41`.
- **Assumption to challenge next:** whether dusk handoff into cool Home grey still feels continuous, or the cross veil needs a beat of shared dusk.

### 2026-10-17 — Critic pass: centered paths + doorway light spill (L3)

- **Critic overturned left-stacked legend:** felt unnatural, cut Construction, broke the middle composition. Three doors restored centered under the P (3-across); hammer stays quiet lower-right CTA.
- **Light:** cavity core brightened, wider floor spill + soft bloom outside the mouth so daylight reads as coming *out* of the doorway (not a flat panel).
- Session key `pa-crossed-threshold-v40`. Archived as restore point `v40`.
- **Assumption challenged next:** light still too quiet on white floor — addressed in v41 dusk stage.

### 2026-10-17 — Critic pass: phone stacked path legend (L3)

- **Critic overturned 3-col phone labels:** at ~58vw, CONSTRUCTION mid-word wrapped (CONSTRUCTI/ON) — cheap. Stacked one-column legend: icon + nowrap label, color on the left rail; left lane narrowed so hammer stays clear.
- Session key `pa-crossed-threshold-v39`.
- **Assumption challenged next:** stacked legend felt unnatural — overturned in v40 (centered three-across).

### 2026-10-17 — Critic pass: phone CTA lane + door mass (L3)

- **Phone collision:** ENTER hammer sat on COMMUNITY / path row. Pathways capped to left ~54vw; hammer pinned to right edge and shrunk — two jobs, two lanes.
- **Settle:** desktop/tablet ~90° (cavity + readable slab; pure ~96° was a thin bar). Phone stays ~78°.
- Desktop hammer clamp quieted again (was still a second hero at ~26vh).
- Session key `pa-crossed-threshold-v38`.
- **Assumption challenged next:** phone path label wrap — addressed in v39 with stacked legend.

### 2026-10-17 — Critic pass: phone door mass at settle (L3)

- **Critic overturned uniform ~96°:** on 390px phones the leaf collapsed to a hairline — cavity won, door mass vanished. Settle is now a CSS variable: desktop ~96° (cavity-first), ≤640px ~78° (foreshortened face + thicker edge).
- A later mobile rule was re-inflating the hammer after v36 — clamped quiet again.
- Session key `pa-crossed-threshold-v37`.
- **Assumption challenged next:** tablet settle + phone CTA lane — addressed in v38.

### 2026-10-17 — Critic pass: cavity-first open + quieter CTA (L3)

- **Critic overturned settle ~68°:** leaf face filled the stem so daylight read as a crack; settle ~96° so the wide cavity is the doorway and the leaf is an open edge (logo-true).
- Hammer was stealing focus (too tall, mid-frame) — shrunk and pinned to lower-right third.
- Documented **Builder and critic** loop in §1 — relentless, customer-first, never the final destination.
- Session key `pa-crossed-threshold-v36`.
- **Assumption challenged next:** phone door mass — addressed in v37.

### 2026-10-16 — Systems thinking + splash→site handoff (L6/L3)

- Documented §3.1 systems thinking (cohesion, contracts, gateway, idempotency, handoffs, tradeoffs) from [awesome-system-design-resources](https://github.com/ashishps1/awesome-system-design-resources) translated to the learner journey.
- Cross-veil lands on cool shop-floor grey (same family as splash/home), not a warm cream cut — interface contract between gateway and Home.
- Session key `pa-crossed-threshold-v35`.
- **Assumption to challenge next:** whether Home hero should inherit a quieter “just crossed” beat for first paint after splash.

### 2026-10-16 — Splash architectural door + perspective (L3)

- Cavity rebuilt from letter-slot (~1:6.4) to door-like (~1:2.64); wider P stem holds real jambs, lintel, sill.
- Perspective on hinge parent with right-biased origin; settle ~68° so slab face + cavity both read.
- Documented §7.3 door architecture & perspective laws (metric door ratio, foreshortening, solid drawing).
- Session key `pa-crossed-threshold-v34`.
- **Assumption to challenge next:** whether the wider stem still reads instantly as the brand P at a glance.

### 2026-10-16 — Splash composition + motion doctrine (L3)

- Documented composition foundations (focal point, thirds, hierarchy, balance, framing) and motion foundations (12 principles → screen) in §7.1–7.2; splash applies first, site-wide next.
- Rebuilt opening frame on a rule-of-thirds stage: cavity as focal origin, name on upper third, pathways on lower third, hammer on lower-right intersection; staging vignette during the open.
- Hierarchy in time: door breathes alone → name → paths (from left) → CTA; varied easing/direction; camera ease-out pullback.
- Session key `pa-crossed-threshold-v33`.
- **Assumption to challenge next:** whether asymmetric hammer placement still reads on narrow phones without crowding the mark.

### 2026-10-16 — Splash natural daylight + cinematic open (L3/L4)

- Replaced harsh gold fill with soft morning daylight (cool sky + warm wall bounce) clipped to the stem cavity.
- Creative open acting: crack of light → hesitation → commit → soft overshoot; light leads the leaf slightly.
- Soft volumetric streaks + drifting dust motes inside the cavity; floor pool is pale daylight, not yellow sun.
- Session key `pa-crossed-threshold-v32`.
- **Assumption to challenge next:** whether the quieter light still reads as “invitation” on first watch.

### 2026-10-16 — Splash cavity light = logo P doorway (L3)

- Room light clipped strictly to the open stem cavity (logo proportions: equal jamb lips, thick lintel).
- Killed page-level gold sun (threshold atmosphere + stage radial) — sunshine only through the empty doorway + a wedge from its mouth.
- Explicit navy lintel/jamb caps so light cannot anti-alias above the letter; doorway overflow clipped.
- Open settle ~55° (brand-lockup angle) so the leaf reads as a door and the cavity stays the light source.
- Session key `pa-crossed-threshold-v31`.
- **Assumption to challenge next:** whether ~55° still feels decisive on first watch vs the prior deeper swing.

### 2026-10-16 — Splash door-readability + hammer mass (L3)

- Open settle ~82° (not −105°) so foreshortened leaf still reads as a door; navy interior + edge thickness; gold is room light only (no gold-pillar leaf).
- Wider leaf, stronger jamb lip, panel/rail detail on both faces.
- Hammer redrawn as tool mass (heavy head, tapered shaft, soft shadow); timeline tightened (~4.65s to ready).
- Session key `pa-crossed-threshold-v30`.
- **Assumption to challenge next:** whether mid-swing still “loses” the door silhouette on mobile widths.

### 2026-10-16 — Splash cell timing-chart climb (L3)

- Pose-to-pose timing charts with linear playback (`v29`).

### 2026-10-16 — Splash cinematic door climb (L3)

- First cinematic pass: 3D leaf, walk-through enter, shatter removed (`v28`).

### 2026-10-16 — Splash opening aesthetic craft (L3)

- First pass: shop-floor atmosphere, calmer light, pathway one-shot settle, no ENTER glow flash (`v27`).

### 2026-10-16 — Layered craft + site-wide attention sweep

- Documented **craft layers L1–L6** (truth, content delivery, aesthetic optics, attention ethics, trust, systems spine) — different chisels for different jobs; L2 content delivery and L3 aesthetic optics stay distinct and will deepen by pathway.
- Site-wide rule: layers apply to public, splash, auth, Practice, School path, Learn — not only the last surface polished.
- Calm Practice banner (no soft-pulse); Done for now / School path links; Learning path “practice marks”; Welcome + Foundation + Home pillars speak finite crew path.
- Brand promise carries station-by-station path language; Practice tray help matches.
- **Assumption to challenge next:** whether learners feel one coherent school across marketing → splash → portal → lesson without a “mode switch” shock — and whether pathway-specific L2/L3 standards need their own climb rows soon.

### 2026-03-27 — Optics climb: cool trades UI + attention ethics

- Added attention ethics (Bernays/Spiral/anti-doomscroll).
- School path shop-floor stage; Today’s station; Done for now; home workbench card.
- **Assumption challenged next:** session length vs secondary chrome leak.

### 2026-03-27 — One-spine climb: School path inside the account

- `/app/student/path` hosts PracticeHub; nav School path; `enterPracticeLesson` avoids double hub.

### 2026-03-27 — Honesty climb: Level-1 gate + LMS truth

- Level-1 = 20 for all pathways; portal honesty when Learn is empty; Community badge depth honesty.

### 2026-03-27 — Craft pass: statue from the stone

- Created living doctrine + `AGENTS.md`; specialty distractors; three-door story; accents; compact lesson map; founding builders; foley awareness.

---

## 12. Ritual for every future craft pass

1. Read this file — especially **§3 Craft layers**, **§7.0–7.0b** (aesthetics + information display), and active climbs.
2. Name the **layer(s)** and the one composition or drill you are improving.
3. Chisel the product **site-wide** for that layer (don’t leave orphan surfaces telling a different story).
4. Run the **§7.0a pre-ship critic** — task, media, and result must be solid for the user.
5. Verify desktop and mobile on touched surfaces.
6. Update §10 / §11 with what changed and what assumption you will challenge next.
7. Leave the school more honest, more coherent, and clearer to read than you found it.

*— Purpose Academy craft lineage. Carry it forward.*
