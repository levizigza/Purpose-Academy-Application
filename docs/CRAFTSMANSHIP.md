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
3. **Protect what already sings.** Tool Chest, VocabSheet, Calgary voice, mother-tongue → English → type discipline — do not sand these into generic edtech.
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

**Pointer for agents:** root `AGENTS.md` requires this file, [`LEARNER_FEAR.md`](LEARNER_FEAR.md), and [`PLAY_CRAFT.md`](PLAY_CRAFT.md) for Practice entertainment loops. Do not invent a parallel style guide. For UI work, **§7.0–7.0b is the aesthetics + information-display template** — inherit it; do not fork it. For Practice / journey / gates / vocabulary, **LEARNER_FEAR + PLAY_CRAFT are non-optional**.

**Site-wide rule:** Craft layers apply to *every* surface — public marketing, splash/enter, auth, Practice `/journey`, portal School path, Learn/LMS, instructor, and admin — not only the last page we polished. Coherence beats local cleverness.

---

## 3. Craft layers (multiple levels — keep them distinct)

Craftsmanship is not one blob. Different work needs different chisels. Always know **which layer** you are carving.

| Layer | Job | Success looks like | Failure looks like |
|-------|-----|--------------------|--------------------|
| **L1 · Truth & story** | One school, three doors, honest depth | Home / Programs / Admissions / portal agree | Construction-only copy while three doors are open |
| **L2 · Content delivery** | Curriculum, vocab, drills, gates, mother-tongue → English → type | Specialty distractors; Level-1 = 20; instructor Checked honesty | Hammer vs Hi/Hello; fake “busy scene”; quiz = job ready |
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
| Dignity | Adult tone, tool photos, no casino chrome; never make the learner feel dumb |
| Achievement | One **Today’s station**; Skills Passport; marks = skill |
| Ascent | After Comfortable (internal Familiar), next station — never endless novelty |
| Fear of school | Short actions, repetition, one job; refuse exam/assessment/mastery theatre in learner chrome |

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
        → Portal School path (spine) ↔ Student Practice /journey (station)
        → Learn/LMS (depth when built) → Skills Passport (proof)
```

When you change one node, ask: *What contract did neighbors rely on? Did the handoff still feel continuous?*

**Isolation test:** Could this module still make sense if the rest of the site were missing?  
**Connection test:** Does walking splash → home → programs feel like one school, or three different products?

---

## 4. Non-negotiables (protect first)

These are load-bearing across all layers.

1. **Calgary trades-school voice** — concrete, respectful, short sentences. Not startup hype. Not purple SaaS.
2. **Mother tongue → English → type discipline** — hear home language, hear English, type English (reps that stick). Home languages support understanding; English is the workplace word; typing locks production without a “test” feel.
3. **VocabSheet / Tool Chest craft** — Level-1 gate (Daily Conversation 1–20), full tables stay open to practise, real photos where we have them.
4. **One learning spine** — same 20-step school path across pathways; pathway packs change craft, not the spine shape.
5. **Instructor truth** — skills are verified; do not sell “finish the quiz = job ready.”
6. **Honesty over symmetry** — if Community has ~16 specialty workplace words and Construction has 660 visual vocab rows, marketing and UI must not pretend they are the same depth.
7. **Solid information output** — every training and marketing surface must make the task, the picture/media, and the result unmistakable. Ambiguous feedback, cropped objects, or silent “success” are craft defects (see §7.0).
8. **Learner-fear standard** — adults who fear education must never meet exam / quiz / assessment / mastery / % report-card theatre. Standing doctrine: [`LEARNER_FEAR.md`](LEARNER_FEAR.md). Hear → hear → type; soft retry; station language.

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
- Student Practice Mode and LMS share the same spine language; Student Practice may skip early admin steps but must not invent a second curriculum.

### 6.3 Vocabulary honesty

- Level-1 continue gate = Daily Conversation words 1–20 across streams.
- Specialty packs may grow; copy and badges must track **actual counts**.
- Eye Spy and photo scenes need real photography before we claim “busy job-site scenes.” Until then, document as a climb — do not fake richness in copy.

### 6.3a Sentence Structure (Construction) — worksheet cloze (not VocabSheet)

- After Visual Vocabulary, Construction opens **Sentence Structure** (cloze bank from Construction Questions 1–560) before Word → Action.
- **Ladder gate (required):** Daily Conversation Level-1 **and** specialty Construction Visual Vocabulary Level-1 (first workplace picture page) before Sentence Structure unlocks. Greetings alone must not open specialty sentences.
- Cloze bank prefers / keeps rows whose answers exist in pictured specialty VV (orphan PPTX rows stay out of the graded bank).
- **Docs mold (Construction Questions PPTX):** each item pairs the **PPTX illustration** with the cloze stem (`______`) and four A–D choices. Images live in `public/sentence-cloze/cs-{n}.*`. Not a VocabSheet photo card; not a SITEWISE crew stage.
- **One attempt per item** — no answer shopping.
- Correct: word **slides into the blank**; short success line; TTS reads the full sentence.
- Wrong: reveal the right word in the blank, brief teach line, then move on (Duolingo one-try).
- Level-1 sentence gate = first PPTX page (items 1–10) with ≥8 first-try correct (+ repair for misses). More pages stay open to practise. Bank stays in Construction Questions order.
- Clear page-pass badge when the worksheet page is cleared.
- Language ladder: gloss → picture → **sentence** → action → instruction → phrase.

### 6.3a1 Language organize quiz (after five-language VocabSheet)

- After Visual Vocabulary Level-1 is ready, learners face a **language organize** page before Eye Spy.
- **Five rounds**, each with **four pictured words**. Each word card already shows English + five home-language names; the learner only places the matching **picture**.
- **Desktop / course:** four boards side by side. **Phone (`.is-phone-app`):** sticky 2×2 picture strip + **one full-width word** with Prev/Next among unmatched — never a crushed 4-column grid (viewport `@media` does not fire inside the emulator).
- Coaching (At work / Teach note) lives in `StationContext` **below** the quiz; phone task-first CSS hides that chrome so pictures + Drop clear the first viewport.
- Pool / label ink on paper is **navy**, not pale gold. Pass = five rounds clear.

### 6.3b Photos show the whole object

- Training object photos and pathway program cards use **`object-fit: contain`** so royalty-free imagery is fully readable.
- Do not crop tool/vocab photos with `cover` on drill surfaces. Full-bleed marketing heroes may still use cover when the composition is intentionally edge-to-edge.

### 6.3c Vocabulary audio + pick + type reps

- Every vocabulary English word must speak when the learner bridges or presses Hear English.
- Priority stays: baked neural → live neural → Free Dictionary (works without our API) → browser `speechSynthesis`.
- After a home-language connect, auto-speak the English workplace word.
- **Then pick + type (every VV card):** English spelling stays hidden from first paint until typed; listen/type panel sits with the photo (langs collapse to the bridge). Under Type/Go: a **~5-option shuffled bank** from the same worksheet page (same language level). Learner must **pick the correct English word** (wrong pick soft-misses and **reshuffles** — never the same order twice in a row) **and type it** (existing Type/Go). Soft retry (“Not yet…”) — never Incorrect / Expected. Nearby: “Clear this word · pick the match, then type it”; `firePlayClear` on correct type after a correct pick. TTS failure still unlocks the pick+type beat (Hear again remains). Gate = heard + typed + (bridged or known).
- **Anti-cheat / real learning:** Choices switch after a wrong pick and when the card advances so position-tapping cannot clear a word. Typing remains the production clear — pick alone never finishes.
- **Sentence Structure differs:** cloze keeps four **reference** chips (type-only clear). VV pick chips are **required presses** plus type.
- **First go vs retake:** “I already know this word” is hidden on day-one intake. Skip-known unlocks only after the station was cleared once for that pathway (`pa-vocab-station-cleared-v1`). Retake still requires hear English + pick + type.

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
9. **Opening / splash is L3 too** — composition + motion doctrine below. Exit is **strike the door mid → mirror crack → shatter → soft cross** (v43; walk-through-only exit overturned).
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
| Splash / enter | Brand-first composition; purposeful motion | Door architecture §7.3; hammer hits door mid → shatter exit |
| Home / Programs / Give | Three-door story; whole pathway photos; one job per section | Honest depth counts; no fake dashboards |
| Phone learner app (emulator) | **Same logo lockup:** navy on white paper; white app icon | No gold/dark dialect that contradicts `logo-full` |
| Desktop course shell | **Original night material stage** (amber wash on navy); light train ink | Topbar navy chrome; gold Practice status strip; not paper |
| Practice `/journey` | Kickers, alerts, choice grids, contain object mats, visible pass | Phone = paper; Desktop course = night — two shells, two looks |
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
| Eye Spy photography upgrade | L2/L3 | Done for showcase — baked single-photo floors + transparent taps (2026-10-26); PDF worksheet crops still welcome |
| Community specialty vocab growth | L2 | Open |
| Deeper Logistics/Community LMS modules | L2/L6 | Open |
| Portal School path polish (mobile density) | L3/L6 | Open |
| Splash opening aesthetic craft | L3/L4 | Climbing — dusk stage for light pop (v41) + version archive |
| Site-wide composition (thirds / hierarchy) | L3 | Climbing — §7.0 template locked; apply node-by-node |
| Site-wide information display (solid user output) | L3 | Climbing — §7.0a/b; VV letterbox crop pass 2026-10-22 |
| Systems thinking (journey as architecture) | L6 | Climbing — doctrine §3.1; apply node-by-node |

---

## 11. Changelog (living)

### 2026-10-28 — Construction equipment video parity polish (L2 / L3 / L6)

- **Layers:** L2 journey honesty + L3 dual-shell continuity + L6 Practice reset spine.
- **Critic found after #51:** Construction Unit 8 goal / step title still pointed learners at Warehouse Equipment; shared `LEARNING_UNITS` label said Warehouse while Construction runs its own drill; Practice “Start over” cleared warehouse watched only — missed warehouse cleared + both construction keys; craft note still claimed stub MP4s after Finals landed.
- **Fix:** Construction unit goal + `Video · Construction Equipment` step title match Logistics naming; shared Unit 8 label → `Video · Equipment`; Community copy acknowledges both pathways; PracticeMode resets all four equipment progress keys; changelog truth matches real Finals in `public/media/construction-equipment/`.
- **Shared drill:** `EquipmentVideoDrill` stays one component with `pack: 'warehouse' | 'construction'` — no fork.

### 2026-10-28 — Construction equipment video practice questions (L2 / L3)

- **Layers:** L2 content delivery (140 practice questions paired to 14 construction machines) + L3 dual-shell optics (same Desktop night / Phone paper check-card grammar as Logistics Unit 8).
- **Ingest:** 14× Student Quiz + Answer Key PDFs (Backhoe through Wheel Loader) → `constructionEquipmentVideoQuizzes.ts` (+ JSON) + `constructionEquipmentVideos.ts`. Each question carries answer, **verbatim / faithful AK teach**, and replay window.
- **Flow:** Watch whole video → practice questions (soft retry, optional clip replay) → continue. Construction pathway step 18 now runs the equipment drill (no longer redirects only to Logistics).
- **Soft-gate:** `VIDEO_SEGMENT_GATES_ENABLED = false` on the construction pack (showcase — all videos open). Architecture ready; teach notes stay honest (do not claim unlock while gates are off).
- **Media:** Purpose Academy Final MP4s live under `public/media/construction-equipment/` (mapped in README). Replay windows sit inside each file’s duration.
- **Critic:** Same information-display grammar as warehouse — video + one primary continue; questions under the player; powered machines stay-clear awareness only.

### 2026-10-28 — Desktop opening only after ModeChooser (L3 / L6)

- **Layers:** L3 (door → open beat unmistakable) + L6 (Desktop ↔ Phone shell continuity).
- **Defect:** Restoring `pa-shell-mode-v2=course` skipped ModeChooser and could play the threshold open before a Desktop press; Exit→Modes→Desktop raced a stale `pa-crossed-threshold` React flag and dumped into a static toolbox without the open. Phone already gated open on app press (`pa-phone-phase`).
- **Fix:** Desktop phase `pa-desktop-phase-v1` (`opening` | `ready`). ModeChooser Desktop door arms `opening` then shell; App shows SplashPage only for `opening`; Enter marks `ready`. Boot reconciles legacy course-without-phase → ModeChooser (or `ready` if this session already crossed). Exit-to-modes clears entered + shell.
- **Critic:** Mirror Phone — never play Desktop open before the mode door; never skip the open after the door.
- **Assumption to challenge next:** whether Desktop phase should stay in sessionStorage only so a new browser session always starts at ModeChooser even mid-`ready`.

### 2026-10-28 — Logistics warehouse video practice questions (L2 / L3)

- **Layers:** L2 content delivery (140 practice questions paired to 14 equipment videos) + L3 dual-shell optics (Desktop night check card / Phone paper check card).
- **Ingest:** Forklift Quiz PPTX + Warehouse Video Q&A DOCX + student quiz / answer-key PDFs → `warehouseEquipmentVideoQuizzes.ts` (+ JSON). Each question carries answer, teach line, and replay window inside the matching MP4.
- **Flow:** Watch whole video → practice questions (one at a time, soft retry, optional clip replay) → continue. Learner chrome says **practice questions**, never quiz/exam.
- **Soft-gate:** `VIDEO_SEGMENT_GATES_ENABLED = false` (showcase — all videos open). Architecture ready: flip the flag to require cleared practice before the next video unlocks. Do not hard-lock for showcase demos.
- **Critic:** Information display first — video + one primary continue remain unmistakable; questions sit under the player, not as a separate exam room. Dual-shell: night check card on Desktop course; paper + brand-deep on Phone.

### 2026-10-28 — Site-wide Desktop/Phone audit after pathways-bottom (L3 / L6)

- **Layers:** L3 information display + L6 dual-shell continuity (Desktop night toolbox ↔ Phone paper stations).
- **Audit (Desktop + Phone):** ModeChooser amber doors OK; Desktop splash pathways under door/TAP (#46) OK; English-first lang + nav marks + explainer/coach OK on both shells. Live Pages still top-pins pathways until #46 merges.
- **Critic fixed:** (1) Desktop toolbox clipped Admin + Instructor ~118px under the fold — further compressed hero/tray density so all five trays fit the first view. (2) Phone language station buried NEXT ~420px under the fold — dock header + actions to the phone screen, scroll the lesson panel inside, hide compact bottom path map (Station menu owns path). (3) “1 days showed up” → singular/plural.
- **Left alone:** Desktop lang NEXT below fold is reachable by normal page scroll; phone lang chips may need one panel scroll under “LANGUAGES HERE” while NEXT stays docked — acceptable vs losing continue.
- **Assumption to challenge next:** whether phone Station Menu should surface a one-tap “path strip” so hiding the compact map never feels like a missing door.

### 2026-10-29 — VV English hear chip (L3 / L2 / LEARNER_FEAR)

- **Layers:** L3 (task clear in 3s for EN-only learners) + L2 (same hear→pick→type spine) + soft fear (no locked-out bridge).
- **Customer ask:** Workplace Words hear row showed AM/TI/AR/ES/HI only — English-only learners had no chip that spoke their language.
- **Fix:** `VOCAB_HEAR_LANGS` adds **English** first beside the five mother tongues. EN press plays English once and unlocks pick+type (no redundant second Hear English). Mother-tongue press still gloss → English. Desktop night 3×2; Phone paper 2×3 wrap.
- **Critic:** English on the hear row is the bridge, not a spoiler title — spelling stays hidden until typed. Do not remove mother-tongue chips to “make room.”

### 2026-10-29 — VV pick + type + shuffle (L2 / L3 / LEARNER_FEAR)

- **Layers:** L2 (honest production reps) + L3 (task / media / pick bank / type result in one beat) + learner-fear (soft miss, no exam chrome).
- **Customer ask:** Workplace Words must show ~5 shuffled choices; learner picks the correct one **and** types it. Choices switch so tapping until right cannot cheat.
- **Fix:** `VocabSheet` typing phase adds a same-page 5-option bank under Type/Go. Wrong pick → soft miss + reshuffle (order never repeats twice in a row). Go without a correct pick soft-coaches “pick the matching word…”. Clear still requires typed English (`firePlayClear`). Sentence Structure stays reference-chips + type-only.
- **Critic:** Pick alone would be shopping; type alone invited guess-from-audio without looking. Dual lock forces looking + producing. Reshuffle is teach, not fear — “choices switched — pick again.”
- **Law restated (§6.3c):** hear → hear → **pick + type**; shuffle after miss and on card advance.

### 2026-10-28 — Desktop splash pathways → lower third (L3)

- **Layers:** L1 (three doors visible) + L3 (brand + door hero; pathways don’t steal the title).
- **Defect:** Desktop Tap-cue climb pinned `.threshold:not(.is-embedded) .threshold-pathways` to `top: 12%`, so “THREE DOORS INTO WORK” + Construction / Logistics / Community sat on top of PURPOSE ACADEMY.
- **Fix:** Desktop pathways return to the **lower third** (`bottom` under door / ENTER / Tap). Phone embedded splash keeps `top: 72%` below mid Tap — dual-shell intentional.
- **Critic:** Centered Tap owns mid; pathways must not compete with the brand line. Do not “lift above mid” on Desktop night again.

### 2026-10-28 — Station demo VO/visual sync (beat-locked) (L3 / L2)

- **Layers:** L3 (what’s said must match what’s shown in three seconds of watching) + L2 (explainer still teaches the real press).
- **Defect:** Mouse demos muxed one continuous take against a longer concatenated Jenny track. Choice stations ran ~6–8s picture vs ~15s VO — last frame froze while narration described clicks that had already happened (or never lined up). `word-action` was the reverse (long silent prep under short VO).
- **Fix:** `recordSyncedStation` — synth beats first, `setup` (silent), then each beat `act` + hold for that line’s duration; VO laid onto the visual timeline (`buildTimelineVo`). Re-record all 14 content stations. Site reflection = GitHub Pages only.
- **Critic:** Prefer lengthening the hold on the relevant UI over rushing the mouse to “catch up” to VO. Do not revive freeform `tpad` last-frame pads as the sync strategy.

### 2026-10-28 — Station explainer demos: real UI + mouse + Jenny VO (L2 / L3)

- **Layers:** L2 (how-it-works before the drill) + L3 (task visible in the real app chrome, not a slide deck).
- **Defect:** Ken Burns photo cards with VO taught the idea but not the *press* — first-computer learners still guessed where to click. Step→explainer map was also wrong for Supported Practice / Workplace Instructions (Word→Action stole step 10).
- **Fix:** Playwright mouse demos (`scripts/explainers/record-station-demos.mjs` + `demo-lib.mjs`) record the live Practice UI with a visible cursor, then ffmpeg-mux Edge **JennyNeural** VO. All contentful stations get an mp4 in `public/explainers/`. Gate map: step 3 language, 6–8 words board, 9 sentence (+ Word→Action via `stationId` when phase flips), 10 supported, **11 workplace instructions** (new), 12 computer, 13 site language, 15–18 site-ready.
- **Skips (empty / non-drill shells — no demo mp4):** 1 Start, 2 Registration, 4 Work Style, 5 Career Profile, 14 Work Interests, 19 Instructor Check, 20 On-Site Training, 21 Final Check, 22 Employment. Re-record with `PA_ONLY=id1,id2 node scripts/explainers/record-station-demos.mjs`.
- **Critic:** Keep StationExplainerGate once-per-station; do not autoplay demos on return. Prefer mouse-over-real-UI over regenerating Ken Burns. Site reflection = GitHub Pages only.

### 2026-10-28 — Restore once-then-quiet nav markers (L3 / L4)

- **Layers:** L3 (where to go in 3s) + L4 (quiet after first use — not casino).
- **Defect:** ModeChooser arrows used default brand-navy on the night chooser (read as gone). Phone tool chest CSS set `.practice-point { display: none }`, so the Practice tray finger vanished under dual-shell even while `nav-glow-cta` was wired. EnterBox did not re-render after Start over cleared `pa-nav-cues-seen-v1`. Hub `.ph-resume { overflow: hidden }` could clip the Continue arrow bob.
- **Fix:** Amber ModeChooser arrows; Practice `practice-point` gated on `NAV_CUE.toolboxPractice` (once-then-quiet) and restored inside the phone frame; EnterBox listens to `pa-nav-cues-changed` / `pa-practice-restarted`; Start over also dispatches cue change (aligned with coach reset); hub resume overflow visible for the finger.
- **Critic:** Do not make Practice outline a permanent second dialect — the finger + glow quiet after first tray open; outline may stay as tray identity. Language-row marks (`Languages here` / `Your languages`) were already wired — keep them, do not invent a new cue grammar.

### 2026-10-28 — Your language: English-first + nav mark + explainer VO (L3 / L4 / L2)

- **Layers:** L3 (language job readable in 3s — start in English, see where other tongues live) + L4 (once-then-quiet cue, not permanent glow) + L2 (how-it-works video before the pick).
- **Defect:** Step 3 “Your language” booted with **Amharic** selected, so first-open chrome (title, lede, Continue) dropped the learner into non-English before they chose. Arrow-only without VO left first-computer learners guessing the job.
- **Fix:** Default `supportLang` / registration preferred language → **English**. `NavCueTarget` + `NavGlowRegion` point at the language chip grid (`NAV_CUE.langPick`) and Workplace Words mother-tongue row (`NAV_CUE.vocabLang`). Seen keys live in existing `pa-nav-cues-seen-v1` (`lang-pick`, `vocab-lang`). `StationExplainerGate` for step 3 (`your-language.mp4`, JennyNeural) teaches: start English → mark points at chips once → choose another tongue if needed → continue.
- **Critic:** Do not invent a new cue dialect — reuse Mode/Hub arrow+glow. Do not add an English chip on VV that skips mother-tongue → English → type (that sands L2 craft). Coach spotlight + lang nav cue can overlap on word 1; both quiet after the first language press — acceptable for first-computer, revisit if it feels loud on the smallest phone fold. Explainer is the teacher; nav mark is the finger — keep both, never arrow-only.

### 2026-10-28 — Student Practice Mode rename (L3 / L6)

- **Layers:** L3 (mode name readable in chrome) + L6 (Desktop night + Phone paper + portal share one label).
- **Customer ask:** Call the toolbox /journey surface **Student Practice Mode** (short **Student Practice** in trays and kickers).
- **Surfaces:** ModeChooser, ToolboxStation, EnterBox tray + gate, PracticeHub kickers, banner/dock, LearningPathMap, portal Student Practice path, LMS home CTAs. Kept `pa-practice-mode-v1` and code ids.
- **Critic:** Do not rename curriculum stations like Supported Practice or vocab English “Practice.” Prefer full name when copy said Practice Mode; short form only where chrome already used short “Practice.”

### 2026-10-28 — Practice tray must stay visible after toolbox return (L3 / L6)

- **Layers:** L3 (doors readable in 3s) + L6 (shell continuity).
- **Failure:** Hiding the Practice tray while `pa-practice-mode-v1` was set made “← Toolbox” / Exit-to-modes → re-enter Desktop look like Practice vanished; splash “THREE DOORS” also read as if Desktop/Phone modes were gone.
- **Fix:** Always show Student Practice in the tool chest (resume when already in Student Practice); toolbox chrome **Continue Student Practice**; desktop splash **Desktop / Phone** escape. App URL remains GitHub Pages — not purposeacademy.ca.
- **Critic:** Flag-gated tray hide was clever for “already in” — wrong for a learner who stepped back one door.

### 2026-10-28 — Station first-example coach (L3 / L4)

- **Layers:** L3 (spotlight the real control + plain “Press / Type” in 3s) + L4 (once per station, then quiet — not casino coaching).
- Interactive coach on first item only: Workplace Words, Organize, Eye Spy, Sentence, Word→Action, Supported Practice, Computer Skills, Site Language, Safety, Tools, Systems, Equipment Video.
- Dual-shell CSS: desktop night amber ring + cool dim; phone paper navy veil + brand ring. Clicks pass through the spotlight.
- Seen map `pa-station-coach-seen-v1` cleared on Practice Start over.
- **Critic (same day):** Phone emulator `transform: scale` skewed fixed hole coords — coach now portals to `document.body` and styles off `html.pa-*-shell`. VV Hear / Site Language “Hear again” must not consume the type/choice step. Sentence coach is type-only (chips are reference, not buttons). Start over must re-activate the coach, not only clear storage.
- **Critic (100% pass):** Infinite hole soft-pulse read as L4 tension — replaced with a one-shot settle. Escape / Skip marks the station seen so it stays quiet. Focus moves to the highlighted control when a step starts. Equipment Video joins the coach map.
- **Assumption to challenge next:** whether multi-step coaches (VV / Eye Spy) still feel game-like on the smallest phone fold without stealing the task.

### 2026-10-27 — First-computer nav cues + station explainer videos (L3 / L4 / L2)

- **Layers:** L3 (where to go in 3s) + L4 (cues quiet after first use — not casino) + L2 (how-it-works before the drill).
- **Customer ask:** Desktop (and phone) overwhelm first-time computer users; Continue should glow; arrows should point; every station needs a short human-voiced explainer before play.
- **Nav cues:** `NavGlowButton` / `NavArrow` / `NavCueTarget` on Mode doors, Toolbox Student Practice tray, Hub **Continue to station**, station Continue. Amber pulse on night; navy/amber on paper. `prefers-reduced-motion` kills bob/glow.
- **Explainers:** `StationExplainerGate` before each wired station; watch-to-unlock Continue. 12 videos in `public/explainers/` via Edge **JennyNeural** (friendly/considerate — not Piper Lessac). Editing: VO leads cut, slow Ken Burns only on photo beats, hard cuts on sentence ends.
- **Critic:** Piper read as robotic on the grant cut — Edge neural is the free human path for now. Cues dismiss once followed so return visits stay calm.

### 2026-10-27 — Desktop Tap hammer + shared Desktop↔Phone progress (L3 / L6)

- **Layers:** L3 (splash next-action) + L6 (one learner history across shells).
- **Customer ask:** Desktop hammer mid-frame blinking Tap like phone; Desktop and Phone stay connected with the same saved progress.
- **Hammer:** Desktop night splash uses centered **Tap** + soft blink (`is-tap-cue`); night atmosphere unchanged.
- **Progress:** `learnerStore` (localStorage) for journey step, vocab, pathway, mastery, employment, computer/equipment watches, play clears. Toolbox Practice **resumes** (Start over / Restart path still wipe). Leaving Phone modes no longer clears Practice identity.
- **Critic:** sessionStorage made modes feel separate; wiping on mode exit broke the “same data” promise.

### 2026-10-27 — Desktop night: same play-craft flow, distinct aesthetics (L3 / L6)

- **Layers:** L3 (task first viewport) + L6 (spine continuity phone ↔ desktop).
- **Customer ask:** Mindless entertainment + learning from the app must flow the same on desktop — without making night stage look like phone paper.
- **Finding:** Moment loops / type-out / soft-miss / clears were already shared in TSX; desktop buried them under coaching chrome.
- **Fix:** Task-first chrome fold under `.course-stage` for VV / Organize / Eye Spy / Sentence / Computer / Equipment / choice stations (stats strip, jump fold, unit pill, why, progress, intro cards). VV type panel remapped to night ink (not phone cream). Type/Go scrolls into view on desktop. Organize keeps four boards (desktop density); phone keeps one-word focus.
- **Critic:** Unifying skins would erase the night-vs-paper contrast the customer wants. Fold density, keep amber-on-navy.

### 2026-10-27 — Sentence Structure: options visible, type to clear (L2 / L3)

- **Layers:** L2 (sentence production reps) + L3 (four choices + Type / Go unmistakable).
- **Customer overturn:** Pure type-out hid the familiar A–D board. Wanted the **old four options at the bottom**, but **typing** the correct word — not tap-to-answer.
- **Fix:** Choices always visible as reference chips (not clickable answers). Type / Go is the only clear; soft miss stays on the item; matching chip lights on clear. Nearby: “type the matching word.”
- **Critic:** Tap chips would recreate mindless shopping; hide-until-hint chips fought the worksheet mold. Reference board + type keeps both enjoyment and production.

### 2026-10-27 — Sentence Structure type-the-blank (L2 / L3) — superseded

- Earlier pass hid choices until after a miss. Overturned by options-visible + type-to-clear above.

### 2026-10-27 — Vocab type-out + first-go / retake skip-known (L2 / L3 / L4)

- **Layers:** L2 (VV loop) + L3 (type beat with photo; English never spoilers) + L4 (no day-one escape hatch).
- **Customer ask:** Type the English word on press-language / familiar VV; hide “I already know this word” on first go; show it only on retake after finishing once.
- **Type-out:** hear → hear → **type** on every card; production panel with photo; langs collapse to the bridge; TTS fail still unlocks type.
- **Retake:** Persist `pa-vocab-station-cleared-v1` when first-set gate clears and they continue. `allowSkipKnown` + hub “Workplace words again” only then. Practice restart wipes cleared + known. Crew tone (“Another round”), not exam retake.
- **Critic:** Mastery “familiar” alone is too early for skip unlock; station-cleared flag is the truth.

### 2026-10-27 — Phone splash: centered Tap hammer + soft blink (L3)

- **Layers:** L3 information display (next action unmistakable in 3s) on the phone app splash.
- **Customer overturn:** Corner hammer + “Strike to enter” was too quiet. Wanted the hammer **in the middle**, text that says **Tap**, and a **blink** so the next action is obvious.
- **Fix (v44, embedded/phone only):** Hammer rests mid-frame (`left/top 50%/52%`); hint reads **Tap**; soft opacity/scale blink on hammer + label after settle. Pathways drop below mid so the CTA owns the middle. Desktop night splash keeps quiet lower-right “Strike to enter.” `prefers-reduced-motion` freezes mid-frame, no blink. Pre-change frozen as `docs/splash-versions/v44/`.
- **Critic:** Blink is a door affordance, not work-chrome attention spam — stops on smash; no glow/casino pulse.
- **Assumption to challenge next:** whether desktop should mirror Tap/center on narrow viewports, or stay rule-of-thirds corner forever.

### 2026-10-26 — Learner-fear doctrine + deep Practice pass (L1 / L2 / L4)

- **Layers:** L1 story + L2 delivery + L4 attention ethics.
- **Customer ask:** Deeper redesign of **every** Practice station start→finish; make learner-fear a standing documented standard for the whole build.
- **Doctrine:** New [`LEARNER_FEAR.md`](LEARNER_FEAR.md) — banned lexicon, hear→hear→type loop, chrome rules, spine checklist, pre-ship critic. Wired from `AGENTS.md` + Craft non-negotiable #8.
- **Deep Practice pass:** Hub report-card %/marks chrome collapsed; Eye Spy / Sentence / Final check exam lexicon removed; Organize “quiz” gone; observation Competent → habit language; career % fit / RIASEC learner strings cut; pathway unit goals softened; shell motto / counters quieted.
- **Assumption to challenge next:** whether internal mastery gates should credit more generously so Continue rarely feels like a locked door.

### 2026-10-27 — VV type-out unmistakable (L2 / L3)

- **Layers:** L2 hear→hear→type · L3 first-viewport type beat (phone paper + desktop night).
- **Customer ask:** Mother-tongue greeting / Visual Vocab must require typing the English word on every card — not only press language + hear.
- **Critic:** Live mid-listen state still showed English title + definition (spoiler / looked like “forgot type”); type form sat under five langs; TTS failure never unlocked typing; “I already know” on day-one skipped the type loop.
- **Fix:** Hide English until typed; listen/type panel with photo; collapse langs to bridge; unlock type after bridge/hear attempt; caption teaches full loop; soft-miss + `firePlayClear` unchanged. Skip-known is **retake-only** after the station clears once (still hear English + type).
- **Law restated:** Production (type) is the clear — listening alone never finishes a VV word.

### 2026-10-26 — Hear → hear → type + fearless learner chrome (L2 / L1 / L4)

- **Layers:** L2 content delivery (vocab reps) + L1 story voice + L4 attention (no shame loops).
- **Customer ask:** Vocabulary must not stop at listening — hear in home language, hear English, then **type** it. Train like a dog: repetitive actions that stick. Site/app-wide: many learners fear education and feel “not academic”; intellectual/exam chrome threatens them.
- **Vocab fix:** `VocabSheet` adds a type beat after English is heard; English title hides during typing; soft “Not yet — hear it again” (never Incorrect); gate requires typed. Counters drop Level-1/ladder math theatre for “first set / greetings / workplace.”
- **Chrome soften (site-wide):** Journey titles Final Exam → Final Check, Interest Assessment → Work Interests; mastery labels → Started/Comfortable/Strong/Solid; Familiar theater → Station clear / Ready; Passport Competent → Checked; hub “mastery gates / Reach Familiar” → one station / comfortable; exam captions / perfect score / RIASEC learner copy cut; Programs volume bullets → hear/hear/type story.
- **Law:** Prefer **station / check / comfortable** over **exam / assessment / mastery / proficient**. Keep adult crew gravity — never childish gamification.
- **Follow-up same day:** full doctrine + deeper Practice pass (see entry above).
- **Follow-up (2026-10-27):** type-out hardened — see entry above.

### 2026-10-26 — Play craft: casual-game joy without learner fear (L2 / L3 / L4)

- **Layers:** L2 moment loop · L3 info display + purposeful motion · L4 finite stop (anti-doomscroll).
- **Customer ask:** Candy Crush / Temple Run / Flappy clarity and joy while keeping LEARNER_FEAR; desktop + phone.
- **Plan:** [`docs/PLAY_CRAFT.md`](PLAY_CRAFT.md) §0 marble plan — eight roles, steal/refuse, authority rule, shell contract.
- **Ship:** `PlayClear` pulse engine; Eye Spy “Clear this board · N left”; Workplace Words word-clear; hub boards-cleared (presentation only); night + paper CSS; reduced-motion safe.
- **Refuse:** lives, scoreboards, % grades, realtime runners, points-as-competence.
- **Follow-up same day (pass 2):** Organize / Sentence / Word→Action / Supported Practice inherit nearby-objective + clear-pulse grammar (desktop + phone).
- **Follow-up next day (pass 3):** QuizRunner + Safety/Tools/Systems/Computer/Equipment/Instructor/Site/Final written/Employment prep inherit the same grammar; phone nearby-objective ink specificity hardened; spine moment-loop wiring complete. See [`PLAY_CRAFT.md`](PLAY_CRAFT.md).
- **Follow-up same week (pass 4):** Soft-miss lexicon centralized; Eye Spy/Organize miss status; Vocab double-latch removed; Computer try whoosh-only; Sentence grade-tone cut; dual-shell `.play-soft-miss` — critic coverage ~100% on clear stations.
- **Follow-up same week (pass 5):** Critic overturned “~100% done” — dual-shell soft-miss on all choice stations; intake/unit/passport/hub light nearby; FamiliarTheater Foley authority; residual exam lexicon killed. See [`PLAY_CRAFT.md`](PLAY_CRAFT.md).

### 2026-10-26 — Desktop night / phone paper: two shells, two looks (L3 / L6)

- **Layers:** L3 information display + L6 brand lockup (surface coherence).
- **Critic overturn:** Unifying Desktop course to phone’s navy-on-paper lockup erased the original night material stage. Customer ask: Desktop = original night look; Phone = keep the new paper look.
- **Fix:** Restore `.course-stage` amber-on-navy bed + night footer/banner; strip `.is-course-app` from paper ink dual-selectors (kickers, career strengths, organize labels, coaching callouts, likert chips). Phone `.is-phone-app` paper dialect unchanged. Shared duals kept only where both shells share dark islands (career fit/code/profile titles, equip rail labels, Eye Spy scene floors, no mid-fade panels).
- **Law restated:** Paper ink lock is **phone-only**. Amber-as-body-copy ban applies on cream mats inside `.is-phone-app`. Desktop course uses night train tokens / light ink by design.
- **Assumption to challenge next:** whether Portal School path should stay paper or return to a darker instructor stage now that Desktop course is night again.

### 2026-10-26 — Computer Skills narration: Piper Lessac (L2 / L3)

- **Layers:** L2 content delivery + L3 connection (voice that feels human).
- **Customer defect:** Unit 6 video narration used Edge `JennyNeural` — clear but stock/impersonal; beginners did not feel spoken *to*.
- **Fix:** Rebuild narration with open-source **Piper** `en_US-lessac-medium` (local neural TTS). Soften Level-4 copy toward “you / your / take your time” without raising reading load. `--narration-refresh` reuses shipped visuals and reburns captions. Voice models download on demand into `tools/piper-voices/` (gitignored).
- **Assumption to challenge next:** whether vocab `/tts` Edge bakes should also offer a Piper English path for offline/Pages parity.

### 2026-10-26 — Paper ink lock: full Practice sweep (L3)

- **Layers:** L3 information display (Practical — WCAG body on paper).
- **Method:** Phone playthrough ink sweep across hub + stations; fail light foreground on light backgrounds.
- **Customer defects found:** Career strengths night `#e8eef6` on cream; `.section-kicker` accent gold on paper (Computer Skills); Sentence Structure A–D / blank slot muted `#8aa0b8`; check-in / unit-method / result-badge gold-on-cream risk.
- **Law restated (superseded same day):** Paper amber-as-body ban now scopes to `.is-phone-app` only — Desktop course restored to night (see “two shells, two looks”). Dark islands (`.career-fit`, `.career-code`, `.career-profile`, `.equip-video-rail`) keep light ink; rail family labels use brighter `#f5c542`.
- **Fix:** Navy `.section-kicker` on paper; tokenize + override career / check-in / badge / cloze letters. Scripts: `ink-sweep.mjs`, `verify-career-ink.mjs`.
- **Honest remainder:** Marketing splash heroes still use gold-on-photo with text-shadow (intentional). Desktop night train stage uses light ink by design.
- **Assumption to challenge next:** whether hub video/computer marketing panels on paper should drop remaining hardcoded `#e8eef6` body outside Practice.

### 2026-10-26 — Language Organize phone: first viewport playable (L3)

- **Layers:** L3 information display (Practical — playable on ~390px).
- **Customer defect (round 2):** Even after one-board focus, At work / Teach note still filled the phone fold so pictures never appeared without scroll. Washed gold “At work” / pool labels failed demos. Live GitHub Pages (`levizigza.github.io/Purpose-Academy-Application/`) still served the pre-fix build until this PR merges to `main` — demos against that URL will look broken.
- **Why the app-wide playthrough missed it:** Audit jumped many stations but **not** Language Organize; phone checks used viewport `@media` thinking, not `.is-phone-app` board geometry. Critic failed the connection test (gateway → path → Practice) for this station.
- **Fix:** Quiz first; coaching in `StationContext` below. Phone task-first hide list includes `is-organize-wide`. Sticky picture row + Drop card (+ word) share the first viewport; compact language grid; navy paper labels. Audit visits Organize and fails multi-board / narrow / light pool ink / pictures or Drop below fold.
- **Assumption to challenge next:** whether Desktop course should also default to 2×2 boards below ~900px container width (not only viewport).

### 2026-10-26 — Language Organize phone: one word at a time (L3)

- **Layers:** L3 information display (Practical — playable on ~390px).
- **Customer defect:** Four word boards stayed in a desktop 4-column grid inside the phone emulator (viewport `@media` never fires). Boards overlapped into unusable slivers; pool label washed gold on paper. Playthrough audit never jumped to Language Organize — miss.
- **Fix:** Phone focus layout — sticky 2×2 picture strip + **one full-width word card** with Prev/Next among unmatched. Navy pool/slot ink. Audit now visits Organize and fails if more than one board or width &lt; 220px.
- **Assumption to challenge next:** whether Desktop course should also default to 2×2 boards below ~900px container width (not only viewport).

### 2026-10-26 — Iconic 100%: baked Eye Spy floors + Community object photos (L2 / L3)

- **Layers:** L2 content delivery + L3 information display (last Iconic showcase gate).
- **Defect:** Eye Spy still floated separate tool mats on atmosphere (not one photo). Community VV Eye Spy / early words were interim navy word cards (`Volunteer`), not workplace objects. Source Community PDF still absent — object cues use remastered `com-*` photos mapped to roles/places.
- **Fix:** `scripts/bake-eye-spy-scenes.py` composites tools into `public/media/eye-spy/{pathway}-{scene}.jpg`; quiz uses transparent tap regions on baked floors (`.is-baked`). `scripts/upgrade-community-vv-photos.py` replaces 40 Eye Spy / early `com-vv-*` word cards with studio-padded remaster object photos (welcome desk, clipboard, first-aid, wheelchair, …).
- **Assumption to challenge next:** when the Community Service Visual Vocabulary PDF arrives, re-extract true worksheet object crops over the role→object cue map.

### 2026-10-26 — Eye Spy workplace atmosphere floors (L3 / Iconic)

- **Layers:** L3 information display + Iconic presence (scene read, not flat collage).
- **Defect:** Eye Spy was a 2×2 tile collage on a night gradient — readable but not memorable as a job-site station. Hotspot x/y/w/h lay unused.
- **Fix:** Pathway atmosphere photos (`path-construction`, warehouse aisle/dock, community welcome, etc.) become scene floors; tool callouts sit at percent positions on paper mats. Phone keeps contain + first-viewport density. Honest: still callout mats on atmosphere, not single-photo worksheet hotspots — Community PDF wholes remain the last Iconic gate.
- **Assumption to challenge next:** whether true PDF Eye Spy floors (one photo, tap regions only) should replace callout mats once assets exist.

### 2026-10-26 — Hub token pass + phone task-first fold (L3)

- **Layers:** L3 information display (Practical climb to showcase 100%).
- **Defect:** Hub meter/metrics/section heads/resume/pathway badge still hard-coded `#fff` / `#f4f7fb` so paper shells washed. Desktop stats `.is-ready` / `.is-locked` lime/peach on paper. PictureCard figcaption stayed `#fff` on remapped white `--train-surface-2` (“A worker gives a direction”). Phone VV/Sentence first viewport lost to duplicate lede + unit-intro before the photo/cloze.
- **Fix:** Tokenize remaining `.ph-*` night hardcodes to `--ph-ink*` / `--ph-soft` / `--ph-line`. Course stats strip + picture figcaption paper ink. Shell flags `is-visual-vocabulary` / `is-sentence-structure` / `is-eye-spy`; phone hides unit-intro/why/progress and drops VV sheet lede + Sentence help so media leads. Eye Spy stage paper presence + larger phone tiles.
- **Assumption to challenge next:** true Eye Spy scene photography + Community PDF object photos still gate Iconic 100%; interim tiles remain honest.

### 2026-10-26 — Portal School path + hub domain ink on paper (L3 / L6)

- **Layers:** L3 information display + L6 brand lockup (site-wide paper Practice dialect).
- **Defect:** Portal `/app/student` School path kept night `practice-hub.is-portal` + navy stage head while Desktop course/Phone were paper — third skin. Desktop hub domain rows still hard-coded `#f4f7fb` on white paper after the course flip.
- **Fix:** Portal hub + school-path stage head → paper; tokenize `.ph-domain-row` / unit titles / status chips to `--ph-ink*`. Course hub domain overrides. Phone VV lede clamped to 3 lines to cut first-viewport overflow.
- **Assumption to challenge next:** whether Learn/LMS should inherit the same paper dialect next, or keep instructor-dense chrome.

### 2026-10-26 — Computer Skills first viewport + Familiar paper stage (L3)

- **Layers:** L3 information display (phone first viewport + mastery beat).
- **Defect:** Phone jump to Basic Computer Skills ran `scrollIntoView(block:start)` on the card and shoved the train title above the fold (`scrollTop≈395`). Familiar theater had almost no stage CSS. Course Practice banner still shouted gold on the new paper stage.
- **Fix:** Phone Comp/Equipment drills pin `.iphone-scroll` to top; desktop uses `nearest`. Hide unit-intro + why-details on phone computer/equipment shells. Familiar theater paper card + one Continue. Course banner → quiet navy status strip.
- **Assumption to challenge next:** Sentence Structure still clips below the fold on phone — whether worksheet chrome can collapse further so item 1 peeks without scroll.

### 2026-10-26 — Desktop course = paper dialect with phone (L3 / L6) — *overturned same day*

- **Layers:** L3 information display + L6 brand lockup (one showcase dialect).
- **Critic overturn (then):** Desktop course night stage fought the logo + phone navy-on-paper lockup; hub Computer/Warehouse inners and Eye Spy titles washed or split the product into two skins.
- **Fix (temporary):** `.course-stage` paper bed; `.is-course-app` shares phone train/ph tokens; hub/station/Eye Spy/chips paper overrides. Topbar stays navy brand chrome. Eye Spy body colors tokenized (`--train-text*`).
- **Customer overturn (same day):** Desktop should look like the original night stage; Phone keeps paper — see “two shells, two looks.”
- **Same sprint (kept):** Practice `.train-panel` Reveal + `train-fade-rise` left phone Eye Spy mid-opacity (~0.25) after section jumps — looked like washed ink. Instant-visible panels in phone/course shells; Reveal uses `.iphone-scroll` as IO root elsewhere.
- **Same sprint (kept):** Eye Spy At work / Teach note moved below the board in `StationContext` fold so pictures lead the phone first viewport.

### 2026-10-26 — Showcase readability: course banner + phone body ink (L3)

- **Layers:** L3 information display (app-wide readable ink for showcase demos).
- **Defect:** Desktop course shell still showed Practice banner Toolbox/Start over (duplicate chrome) because React state raced `pa-course-shell` class mount. Phone VV lede / page labels / “Tap for goals” / equipment purpose read soft gray on paper. Station hub chrome competed with the task on ~390px.
- **Fix:** CSS `html.pa-course-shell` hides banner actions (source of truth) + MutationObserver sync; phone Station menu folds Path home/Done/Jump/stats; tokenized remaining train body hardcodes (`unit-intro`, `lp-*`, phrase/topic); phone body ledes forced to brand-deep ≥0.95rem.
- **Assumption to challenge next:** whether Desktop course night stage should flip to paper for one showcase dialect, or stay night-with-AA contrast only.
- **Follow-up same day:** brightened Practice hub `--ph-muted` to `#c5d3e4` and video/computer body copy so Desktop night stage does not look washed in demos.
- **Showcase screenshot (phone hub):** Computer Skills / Warehouse Equipment titles were navy on the *inner* night gradient (wrappers were paper, inners still `#0b1c2e`). Paper + brand-deep the inners; body ≥0.98rem.

Newest first.

### 2026-10-26 — Practice first-viewport: task before path map (L3)

- **Customer defect (phone):** Jump Prev/Next + full-school path map sat *above* the lesson. Basic Computer Skills showed only chrome; the real Watch/Try station was cut off below the fold. Foley icon overlapped “Done for now.” Duplicate Practice sounds (shell bar + inline). “Skip to site language” floated as a ghost CTA over the peaking card. “At work” / Teach note still sat above the drill.
- **Critic:** Information display first — task/media must be unmistakable in three seconds. QA jump chrome is not the product.
- **Fix:** Collapse “Jump sections (review)” into `<details>`; move `LearningPathMap` below the lesson and fold it by default; collapse `UnitIntroCard` to a summary; hide `.train-inline-foley` when shell chrome already has sounds; compact phone header; phone scroll-to-top on jump; quiet Skip link in the lesson counter; Computer Skills drill *before* folded coaching notes.
- **Assumption to challenge next:** whether PracticeModeBanner “Toolbox / Start over” still earns its gold strip when the course topbar already has those actions.

### 2026-10-26 — Phone sentence feedback contrast (L3)

- **Defect:** `.shell.is-train .alert.ok` used night ink (`#b8f0bb`) so “Yes — the word completes the sentence” washed out on phone paper.
- **Fix:** `.is-phone-app` overrides for `.alert.ok` / `.warn` / `.error` → `--ok-soft` / `--ok` (and warn/danger pairs) with a visible status border.
- **Assumption to challenge next:** shared train-token flip for phone so alert + body ink stop needing per-selector kill-lists.

### 2026-10-26 — Community Support VV + Sentence Practice parity (L2)

- **Layers:** L2 content delivery (complete the third pathway pack to Construction / Logistics depth).
- **Ingest:** `Community_Visual_Vocabulary_Cursor.md` (499 live / slot 176 reserved) → `communityVocab500.ts`; Sentence Practice → `communitySentenceCloze499.ts` (499 cloze). Wired `sentenceCloze`, clear-all Eye Spy (10 boards), Word→Action, workplace instructions via `communityPractice.ts`. Same pack serves Desktop + Phone.
- **Images:** `com-vv-NNN` interim studio word tiles in `public/media/community-vv/` (PDF object photos still pending). Remasters `com-hygiene` / `com-consent` kept where titles match.
- **Assumption to challenge next:** extract real Community VV worksheet photos from the source PDF so tiles are whole-object photos, not interim word cards.

### 2026-10-26 — Phone playthrough: leftover ink + path status collapse (L3)

- **Layers:** L3 information display (secondary labels + leftover night ink on paper).
- **Playthrough findings:** Hub video/computer copy still `#fff` on paper; unit-intro night gradient; career-choice translucent light chips; practice-stats amber numbers; equip-video cream title on paper; path-map status (“Open for review”) width 0 because `li.lp-lesson` grid nested a full-width `.lp-lesson-btn` into the 0.7rem node column.
- **Fix:** Broaden `.is-phone-app` kill-list (video/computer inners, unit-intro-card, career-choice paper chips, stats navy numbers, equip-video titles). `.lp-lesson:has(> .lp-lesson-btn) { display: block }` site-wide. Secondary kickers ≥0.8rem.
- **Assumption to challenge next:** whether night-stage train tokens should flip via shared variables so phone overrides stop being a growing kill-list.

### 2026-10-26 — Phone learner path: honest contrast pass (L3)

- **Defect (customer):** Path home steps white-on-white; “Find your path” yellow-on-beige + invisible 4–5; “Choose your language” ghost title; selected EN chip white “English” on tan. Phone remapped train *surfaces* to paper but dozens of selectors still hardcode night ink (`#fff`, `#f4f7fb`, `#f5c542`).
- **Clarification:** “Consistent” ≠ one skin everywhere. It means every surface is *readable and working* — desktop may keep night stage; phone must be navy-on-paper with amber as accent only.
- **Fix:** Broad `.is-phone-app` typography kill-list for `lp-lesson strong/span`, current-step amber-as-body, career-assess titles, `train-lang strong`, interest/bridge/learn/topic `strong`, quiz `.train-choice` (paper chips). WCAG AA body ≥ 4.5:1.
- **Assumption to challenge next:** walk every Practice station in the emulator and kill any leftover hard-coded light ink; consider remapping base train `strong` colors to tokens so phone flips for free.

### 2026-10-26 — Splash exit: hammer hits door mid + mirror shatter (L3)

- **Critic / user overturned** walk-through-only exit (`strike → dolly`, shatter removed in v28). Wanted the sledge to hit the **middle of the door**, then a **mirror crack → shatter** before the transition.
- **Fix (v43):** `smashing` → `shattering` stages return. Cracks + impact hub at ~44%×46% (doorway cavity). Hammer keyframes aim the head at that point. Shards carry the painted opening; soft cross veil follows. Frozen pre-change as `docs/splash-versions/v42/`.
- **Assumption to challenge next:** whether 12 painted shards stay smooth inside the phone emulator at SE widths.

### 2026-10-26 — Practice name field legible on phone (L3)

- **Defect:** `.is-phone-app` flipped `--train-text` to navy for paper lockup but left `--train-surface-2` night-dark. `.shell.is-train .field input` → dark navy bg + navy ink → picked name (e.g. Levi) invisible on “Who is exploring?”.
- **Fix:** Phone also remaps `--train-surface` / `--train-surface-2` / `--train-bg*` to white/paper, and hard-sets field input color/fill to brand-deep on `#fff`.
- **Assumption to challenge next:** audit other train-surface-2 chrome (cards, chips) inside phone for leftover night panels that still fight the paper shell.

### 2026-10-26 — Phone home icon: full doorway P, smaller + centered (L3/L4)

- **Defect:** `logo-app-icon.png` was a tight doorway crop — top of the P, right bowl, and base clipped by the SpringBoard squircle. Tile also read oversized for a sparse home.
- **Fix:** Rebuild from `logo-full` (P + spill only, cut before wordmark), place in 512² with ~18% safe inset so the full letter clears the ~22.5% mask. Home tile ~48px, optically centered on the stage. `scripts/bake-app-icon.mjs` regenerates the asset.
- **Follow-up:** Geometric place left the ink mass ~34px right of center (P bowl weight). Bake now centers by ink mass so the mark doesn’t read heavy-right inside the tile.

### 2026-10-26 — VocabSheet contrast + phone demo legibility (L3)

- **Defect:** `.vocab-sheet-card-focus` forced light text while lang chips stayed `#f5f8fc` → Amharic/Tigrinya glosses unreadable on demos. Five-column lang grid ignored phone container (viewport `@media` never fired inside emulator).
- **Fix:** VocabSheet focus card is navy-on-paper (logo-true). Phone forces 1-col language buttons, ≥0.8rem names / ≥1.05rem glosses, dark train titles on paper chrome. App icon = doorway-P crop from `logo-full` (`logo-app-icon.png`), not the PA monogram.
- **Assumption to challenge next:** whether Desktop VocabSheet should keep a denser 5-col grid or also prefer 2-col below 900px.


### 2026-10-26 — Phone app brand lockup = logo (navy on white) (L3 / L6)

- **Critic overturned** gold/dark phone home + night Practice dialect inside the emulator. The website logo is **navy doorway on white paper** — the learner app icon and in-phone surfaces must inherit that lockup, not invent a second tone.
- App icon is the doorway P from `logo-full`. Home wallpaper: paper + soft brand blue. `.is-phone-app` Practice hub tokens flip to paper/navy.
- Outer emulator stage may stay dark (device on a desk). Inside the glass = Purpose Academy brand.
- **Assumption to challenge next:** whether Desktop course shell should also lighten to paper, or keep shop-floor night only for full-bleed desktop demos.


### 2026-10-26 — Desktop | Phone mode chooser + in-phone app launch (L3 / L4 / L6)

- **Overturned** splash-first → toolbox-as-Phone/Desktop picker. Critic: demos need a clear Desktop vs Phone door, and phone demos must start from a home-screen icon like a real app.
- **First screen:** split **Desktop mode | Phone mode** (brand hero-level).
- **Desktop:** opening animation → Enter → toolbox trays (Student, Practice, Instructor, Admin) → course shell. Marketing site stays off this app surface.
- **Phone:** device home with Purpose Academy icon → opening animation *inside* the phone → toolbox on device → Practice / enter routes in `.is-phone-app` (container queries, not viewport media).
- Multi-device picker (SE → 16 Pro Max, Pixel, Galaxy) kept for demo coverage.
- **Assumption to challenge next:** whether Instructor/Admin trays should open dedicated phone-optimized shells or stay as scrollable desktop layouts inside the frame.


### 2026-10-22 — Basic Computer Skills at curriculum step 12 (Unit 6, all pathways) (L2)

- Moved **Unit 6 · Basic Computer Skills** to **step 12** to match the Purpose Academy 20-step curriculum map (after Workplace Instructions; Safety follows later).
- Sequence: Workplace Instructions (11) → Basic Computer Skills (12) → Site Language (13) → Interest Assessment (14) → Safety (15).
- Unit map order in the hub: … Unit 4 (9–11) → **Unit 6 (12)** → Unit 5 site language & specialize (13–14) → Site ready (7 / 15–17) → …
- **Assumption to challenge next:** whether Site Language should return to sit with Unit 4 English before computers once the team locks the map.


### 2026-10-22 — Basic Computer Skills (step 14) for first-time computer users (L2)

- Step 14 is **Basic Computer Skills** on every pathway: 12 captioned royalty-free Mixkit lessons + interactive Try panels (power, mouse, folders, save, Word, email, safety).
- Pattern: **Watch → Try → Remember → one check**. Level-4 English throughout.
- Practice hub surfaces a dedicated **Basic Computer Skills** card (step 14) above the Warehouse Equipment Video section.


### 2026-10-22 — Video · Warehouse Equipment is its own unit (L2)

- Step 18 is now **Unit 6 · Video · Warehouse Equipment** (not buried inside Specialize). Work ready is Unit 7 (steps 19–22).
- Practice hub shows a dedicated **Video section** card that opens Logistics step 18.
- **Assumption to challenge next:** whether Construction/Community should eventually get their own video units or keep the Logistics-only station.


### 2026-10-22 — Site-wide royalty-free image framing (L3)

- **Defect:** VV extractors letterboxed photos onto oversized white canvases (often &lt;10% fill for Logistics/Daily Conversation). Drills used `cover` or wrong aspect mats, so objects looked cropped or unreadably small.
- **Fix:** Autocrop + upscale all Construction/Logistics/Daily Conversation VV tiles, logistics pathway photos, and Sentence Structure cloze art (`scripts/fix-training-image-framing.py`). Pad ultra-wide tool photos onto square mats. Display CSS defaults to `object-fit: contain` with larger mats (VocabSheet photo-first full width, train pictures, Eye Spy natural-aspect tiles, Organize, Practice resume, school-path cards). Knocked out dark studio BGs on tool photos; sharpened cloze after upscale. Extract scripts no longer over-letterbox.
- **Assumption to challenge next:** some worksheet tiles (e.g. circular saw close-ups) are intrinsically incomplete in the source PDF — replace those assets when better royalty-free wholes become available.


### 2026-10-21 — Full Construction Questions 1–560 reachable (L2)

- Verified PPTX 1–560 matches the in-app bank (prompts + options + images). Build throws if any number is missing.
- Worksheet page jumper opens every deck page (1–10 … 551–560).
- **Assumption to challenge next:** whether last-page Q551–560 pictures stay readable on a phone.


### 2026-10-21 — Sentence Structure follows PPTX page order (L2)

- Bank stays Construction Questions 1–560 (no VV reorder). Pages are 10 items; A–D stay in deck order.
- Illustration is larger beside the stem so the PPTX picture is the first thing on the card.
- **Assumption to challenge next:** whether a full 10-item worksheet view (all ten on one screen) beats one-item-at-a-time on phones.

### 2026-10-21 — Sentence Structure shows PPTX question images (L2)

- Extracted all 560 Construction Questions illustrations and paired each cloze item with its PPTX image.
- UI: illustration beside the sentence + A–D choices (docs mold). Prefer pictured VV answers for Level-1 order; bank keeps full PPTX set.
- **Assumption to challenge next:** whether Level-1 should stay specialty-VV-first or follow PPTX page order 1–20.


### 2026-10-21 — Language organize quiz after five-language vocab (L2)

- After VocabSheet Level-1, a page of four English stations: jumbled pictures + five-language words; place picture then languages in descending worksheet order to pass.
- Tap-to-place (no drag dependency). Practice can skip. Then Sentence Structure / Word → Action.
- **Assumption to challenge next:** whether two organize pages beat one before Level-1 unlock.


### 2026-10-21 — Sentence Structure back to Construction Questions worksheet (L2)

- Removed SITEWISE job-board / crew consequence theater from Sentence Structure.
- Restored the docs mold: white cloze card, four choices, word slides into the blank, one-try Duolingo flow, page-pass badge.
- Kept ladder honesty (DC + specialty VV gate, pictured-only bank, Practice skip).
- **Assumption to challenge next:** whether Level-1 page size / pass score still match classroom pacing on phones.


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

### 2026-10-28 — Logistics video teach-backs = full answer key (L1/L2)

- Restored ~50 softened warehouse-equipment practice `teach` lines that paraphrased as `The video shows: <correct choice>` to the **verbatim / faithful answer-key explanations** from the Warehouse Q&A + AK.
- Prompts, choices, correct letters, and replay windows unchanged; `VIDEO_SEGMENT_GATES_ENABLED` stays `false` (showcase unlock).
- Smoke: `node scripts/smoke-warehouse-quiz-teach.mjs` (CB Q7, Conveyor Q9, no soft prefixes).
- **Assumption to challenge next:** whether teach-back length on phone still reads in three seconds after the longer AK lines.

### 2026-10-28 — Logistics equipment check card honesty (L2 / L3)

- Replay clip now pauses at `replay.endSec` (was seek-and-play-forever).
- Station teach note no longer claims “unlock the next” while soft-gates stay off.
- Check card dropped the shared `topic-lesson-card` night class; phone paper keeps green/red choice result states (paper `.train-choice` rule was wiping them).
- **Assumption to challenge next:** whether phone teach-back length still clears the three-second read after AK restore.

### 2026-10-16 — Layered craft + site-wide attention sweep

- Documented **craft layers L1–L6** (truth, content delivery, aesthetic optics, attention ethics, trust, systems spine) — different chisels for different jobs; L2 content delivery and L3 aesthetic optics stay distinct and will deepen by pathway.
- Site-wide rule: layers apply to public, splash, auth, Practice, School path, Learn — not only the last surface polished.
- Calm Practice banner (no soft-pulse); Done for now / School path links; Learning path “practice marks”; Welcome + Foundation + Home pillars speak finite crew path.
- Brand promise carries station-by-station path language; Student Practice tray help matches.
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
