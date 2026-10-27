# Play craft — entertainment without learner fear

> **Standing companion to [`LEARNER_FEAR.md`](LEARNER_FEAR.md) and Craft §7.**  
> Adults who fear school still deserve the *joy* of a clear, mindless-feeling game loop.  
> We borrow structures from Candy Crush, Temple Run, Flappy Bird, and the Purpose Academy  
> game-research pack — **without** exam theatre, lives walls, or points-as-competence.

Source pack: [`docs/game-research/`](game-research/) (Oct 2026). Implementation reference lives  
here so agents carve the same stone. Layers: **L2** (content loop), **L3** (info display + motion),  
**L4** (attention ethics), **L6** (Practice spine). Desktop night + phone paper both inherit.

---

## 0. Marble plan (how we carve)

Carve **system first**, then **stations**, then **shell aesthetics**. Never bolt a minigame onto a quiz.

### 0.1 Three nested loops (Systems Framework §8)

| Loop | Timescale | What must feel “game-like” | What must stay honest |
|------|-----------|----------------------------|------------------------|
| **Moment** | One tap | Clear next verb · instant result · soft retry | Feedback explains the *language*, not a score |
| **Session** | 3–8 min | Nearby board goal · satisfying stop | **Done for now** sacred; no auto-chain |
| **Journey** | Days | Station map · boards cleared (presentation) | Evidence ≠ cosmetics; instructor check separate |

### 0.2 Eight roles → existing surfaces

| Role | Desktop (`.course-stage` night) | Phone (`.is-phone-app` paper) | Primary files |
|------|----------------------------------|-------------------------------|---------------|
| Promise | Hub resume card, amber on navy | Same words, paper ink | `PracticeHub.tsx` |
| Entry | Continue / resume into station | Same; sticky task-first | `StudentSequence` shell |
| Action | Hear→type · pair · choose | Same grammar; denser chrome fold | `VocabSheet`, `EyeSpyQuiz` |
| Response | Clear pulse + foley + short line | Same pulse; paper-safe ink | `PlayClear.tsx` + CSS |
| Challenge | “N left” nearby objective | Same line, first viewport | Eye Spy / VV |
| Progress | Stations finished · boards today | Quiet metric under resume | Hub + `PlayClear` |
| Return | Done for now · Path home | Same exits, phone menu | Banner + shell |
| Evidence | Attempts / instructor only | Same | `learningMastery` (unchanged authority) |

### 0.3 Steal / refuse (from research)

| Steal | Refuse |
|-------|--------|
| One obvious verb (Flappy) | Instruction walls before first try |
| Nearby objective (Candy Crush level) | Global XP, leagues, % report cards |
| Clear joy / cascade *feeling* | “Perfect!”, stars, score pops |
| Rapid soft retry | Lives, wait timers, paid continues |
| Stable grammar, new object | New control scheme every station |
| Finite stop (Wordle) | Endless auto-advance, missed-day loss |
| Forward motion via boards clearing | Real-time runner racing comprehension |

**Hard bans (Implementation Brief):** paid lives, mystery chests, credit-from-points, public proficiency leagues, forced invites, missed-day penalties, auto practical certification, realtime runners vs reading/listening.

### 0.4 Authority rule (non-negotiable)

```
presentation may read activity
activity may create attempts
evidence policy may evaluate eligible attempts
assessors may create practical observations
presentation / clear pulses / boards-cleared MUST NOT manufacture evidence
```

### 0.5 Desktop vs phone contract (L3)

| Concern | Desktop night | Phone paper |
|---------|---------------|-------------|
| Pulse stage | Dark translucent veil, amber label | Soft navy veil, navy/amber on white card ink |
| Nearby objective | Above counter; amber accent | Sticky-friendly; navy on cream; no amber-as-body |
| Motion | 2–3 purposeful beats; respect `prefers-reduced-motion` | Same beats; slightly shorter hold |
| Words | Identical learner lexicon | Identical — fear doctrine is shell-agnostic |
| First viewport | Task + nearby goal + media | Same; fold Why / map / stats |

### 0.6 Build order

**Pass 1 (shipped):** doctrine · PlayClear engine · Eye Spy · Workplace Words · hub · CSS.  

**Pass 2 (shipped):** Organize · Sentence · Word→Action · Supported Practice · Workplace Instructions — same nearby-objective + clear-pulse grammar on desktop night and phone paper.

**Pass 3 (shipped):** QuizRunner shared path · Safety · Tools · Systems · Site Language · Computer Skills check · Equipment videos · Instructor check · Site decisions · Final written · Employment prep — spine wired for moment loop.

**Pass 4 (shipped):** Soft-miss grammar site-wide (`softMissLine` / `SOFT_RETRY_LABEL`) · Eye Spy + Organize miss status · Vocab double-latch removed · Computer try-phase whoosh-only · Sentence pass/result copy · dual-shell `.play-soft-miss` · coverage → ~100% on choice/clear stations.

**Pass 5 (shipped):** True ~100% critic pass — dual-shell `.play-soft-miss` on every choice/clear miss (not `alert.warn`) · Sentence + VocabSheet soft-miss · intake/unit/passport/hub light next-action nearby (no fake board evidence) · FamiliarTheater visual-only (no double latch vs `firePlayClear`) · “Wrong answers” / Eye Spy “Go” lexicon · Equipment keep-watching soft tip · Skills Passport chrome.

**Pass 6 (this carve):** Residual lexicon + soft-miss gate — instructor-check `passNote` bans Competent · QuizRunner gated incomplete uses `.play-soft-miss` · Skills Passport table/remediation crew language (Skill / instructor check) · public trust “skills evidence”.

Later: choice-schema content registry, review planner, finite fluency route, weekly challenge.

**Intake / chrome (Pass 5–6):** Preference steps and passport are **not** board clears — no `firePlayClear` evidence cosplay. They still get a light nearby next-action line so the moment loop reads continuous with Practice stations.

### 0.7 Critic tests before merge

1. Proud tradesperson — enjoy without feeling graded?  
2. Next action obvious in 3s (L3 info display)?  
3. Miss → invited to try while lesson is warm?  
4. Animation removed → learning outcome still clear?  
5. Mindless *more* or finished station (L4)?  
6. Phone paper + desktop night both readable (no amber body on cream)?

---

## 1. The one sentence

Make the **learning action** feel like clearing a Candy Crush board: one obvious verb,  
instant legible result, soft retry, tiny nearby goal, finite stop — while the skill itself  
stays real workplace English.

**Never** put an unrelated minigame in front of a quiz. [Research §1]

---

## 2. Moment-loop surfaces (shipped)

| Surface | Nearby objective | Clear joy | Soft miss |
|---------|------------------|-----------|-----------|
| Eye Spy | `Clear this board · N left` | Pair + board latch | Not yet · wrong pair — try again |
| Workplace Words | Type the English word | Word / set clear | Not yet — hear again |
| Language Organize | Clear this round/word · N left | Picture / round / station | Not yet — wrong box · try again |
| Sentence Structure | Clear this page · N left · type the word | Sentence / page clear | Soft type retry · optional hint chips · show word keep going |
| Word → Action | Clear this action · N left | Action clear | Not yet · try again |
| Supported Practice | Clear this match · N left | Match / round clear | Not yet · try again |
| Workplace Instructions | Clear this instruction · N left | Instruction clear | Not yet · try again |
| QuizRunner (Safety / Final written) | Clear this item · N left | Item / set clear | Soft retry · gated sets |
| Site Language | Clear this phrase · N left | Phrase clear | Not yet · try again |
| Tools & Equipment | Clear this tool group · N left | Tool group clear | Not yet · try again |
| Workplace Systems | Clear this system · N left | System clear | Not yet · try again |
| Basic Computer Skills | Watch/try/check · N left | Lesson clear on check | Wrong check · try again |
| Equipment videos | Clear this video · N left | Video clear | Keep watching |
| Instructor check | Clear this order · N left | Order clear | Not yet · try again |
| On-site decisions | Clear this decision · N left | Decision clear | Not yet · try again |
| Employment prep | Clear this interview question · N left | Prep clear | Not yet · try again |
| Hub | Today’s station · one clear action | Boards cleared today (quiet) | — |
| Shell | Done for now | PlayClearPulse overlay | — |
| Unit intro | Today’s work · one clear action | Soft retry · Done for now | — |
| Language / Style / Interests / Profile | Pick / rate / see path (mother tongue) | Soft continue — **no** board latch | — (preference, not evidence) |
| Passport | Review record · Path home | — | — |
| Equipment | Clear this video · N left | Video clear | Keep watching soft tip |

---

## 3. Changelog

### 2026-10-26 — Play craft established + marble plan + moment-loop slice

- Distilled research into this doctrine; systematic plan §0; wired from LEARNER_FEAR + Craft + AGENTS.  
- Shared `PlayClear` engine; Eye Spy + Workplace Words moment loops; hub boards-cleared presentation.  
- Desktop night + phone paper CSS; reduced-motion safe. Entertainment without scoreboard fear.

### 2026-10-26 — Pass 2: Organize → Sentence → Action → Match → Instructions

- Same moment grammar across Language Organize, Sentence Structure, Word→Action, Supported Practice, Workplace Instructions.  
- Softened Sentence “First go” counter → “clear so far.” Double-foley avoided (pulse owns success sound).

### 2026-10-27 — Pass 3: remaining Practice spine

- QuizRunner shared path (Safety + Final written): nearby objective, item/set clear via `firePlayClear`, no “See how you did.”  
- Tools, Systems, Site Language, Instructor check, Site decisions, Employment prep: same grammar.  
- Computer Skills: pulse on check clear (try/video use whoosh only — no double foley).  
- Equipment videos: video-clear pulse once per lesson (ref-guarded).  
- Critic: Sentence pass/result copy softened; phone `.play-nearby-objective` navy-on-cream beats night amber inside `.course-stage`.  
- Authority unchanged — presentation clears never write evidence.

### 2026-10-27 — Pass 4: soft-miss + foley authority polish (~100% choice/clear)

Honest post–Pass-3 audit: nearby + `firePlayClear` ~95% wired; soft-miss status / retry lexicon / double-foley ~88%.

Closed:
- Shared `softMissLine` + `SOFT_RETRY_LABEL` in `PlayClear.tsx`; QuizRunner / Action / Match / Instructions / Site Language / Tools / Systems / Instructor / Site decisions / Employment / Computer check use them.  
- Eye Spy + Language Organize: visible “Not yet” status on miss (not shake-only).  
- Vocab type-clear: removed second `latch` in `markVocabTyped` (pulse owns success sound).  
- Computer Skills try-Save: whoosh only (check clear still owns Foley).  
- Sentence pass/result: dropped “first go” / “Wrong answers” grade tone.  
- Dual-shell `.play-soft-miss` (night amber tip / phone navy-on-cream); phone board pulse slightly shorter.  
- Intake stations left as preference N/A for board clears.

### 2026-10-27 — Pass 5: true ~100% critic carve

Honest post–Pass-4 audit: choice stations claimed ~100%, but dual-shell miss chrome still used `alert.warn` (~90%), intake/chrome nearby absent, FamiliarTheater double-latched with board clears, residual “Wrong answers” / “Go N of M” lexicon.

Closed:
- Soft-miss display → `.play-soft-miss` on QuizRunner + every choice station + Sentence + Computer check + VocabSheet retry (night / phone paper).  
- Intake (Language / Style / Interests / Profile): mother-tongue nearby next-action only — **never** `firePlayClear` / boards-cleared.  
- Unit intro · Hub resume · Practice + portal passport: light nearby / Done-for-now framing.  
- FamiliarTheater: visual only (success Foley stays with `firePlayClear`).  
- Lexicon: Computer TeachNote “Misses teach”; Eye Spy final “Try N of M”; Equipment keep-watching soft tip.  
- Authority unchanged — pulses never write evidence.

### 2026-10-27 — VV type-out first-viewport

- VocabSheet production phase: nearby + type (or listen) beside/under photo; langs collapse; English title stays `???` / Type it until typed.  
- Soft-miss + `firePlayClear` unchanged; dual-shell listen panel (night / phone paper).

### 2026-10-27 — Sentence Structure type-the-blank

- Customer ask: typing belongs on the sentence section too — mindless enjoyment + learning, not worksheet dread.  
- `SentenceClozeDrill`: primary verb is **Type / Go** the short missing word; soft miss stays on the item; hint chips only after a miss; “Show the word · keep going” after 2 soft tries (counts as miss → repair).  
- Same nearby + `firePlayClear` grammar; dual-shell type panel (desktop night / phone paper).
