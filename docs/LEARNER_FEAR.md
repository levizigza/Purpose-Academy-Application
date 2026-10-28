# Learner-fear doctrine — Purpose Academy

> **Standing standard.** Adults who walk into Purpose Academy often fear education.
> Many do not see themselves as “students” or “academics.” Intellectual chrome,
> exam language, scoreboards, and perfect-score gates threaten them and make them
> feel dumb. That fear is our biggest product risk. This document is the contract
> for every Practice surface, and it applies site-wide wherever a learner reads us.

Read this **before** changing Practice, journey copy, gates, hub chrome, vocabulary,
career questions, certificates, Skills Passport, or marketing that describes the path.
Update this file when the critic overturns a choice. Cross-link: [`CRAFTSMANSHIP.md`](CRAFTSMANSHIP.md)
and [`PLAY_CRAFT.md`](PLAY_CRAFT.md) (entertainment loops without exam theatre).

---

## 1. Who we serve (the real customer)

| Truth | Product consequence |
|-------|---------------------|
| They may have left school early, failed tests, or been shamed in classrooms | Never recreate exam / quiz / assessment theatre |
| They want work, respect, and belonging — not grades | Station language, crew voice, concrete wins |
| English may be new; mother tongue is safety | Hear home language → hear English → **type** English |
| Calculation and jargon feel like traps | One job, one verb, no % report cards in the first viewport |
| Repetition builds skill (like training a dog) | Short actions, same loop, soft retry — not novelty for its own sake |
| Adult dignity matters | No childish gamification; no soft-shame “retry quiz” |
| Joy still matters | Clear next action, soft clear joy, finite stop — see [`PLAY_CRAFT.md`](PLAY_CRAFT.md) |

**Critic test:** Would this copy or chrome make a proud tradesperson feel small?
If yes, rewrite before ship.

---

## 2. The training loop (dog-training craft)

Prefer **action reps** over **intellectual explanation**.

| Loop | Learner does | Success looks like |
|------|--------------|--------------------|
| **See** | Look at the object / scene | Picture is unmistakable |
| **Hear (home)** | Press their language | Sound in a language they trust |
| **Hear (English)** | Workplace word plays | English is the job word |
| **Do** | Type, tap, drop, or choose | One clear action |
| **Retry soft** | Miss without shame | “Not yet — try again. No rush.” |
| **Clear** | Station done | “Station clear. Next door can open.” |

Vocabulary non-negotiable: **hear → hear → type** on Visual Vocabulary (see Craft §6.3c).

Do **not** ask them to:

- Decode multi-tier mastery ladders to know if they may continue
- Compute Level-1 / ladder / first-try fractions
- Read Holland / RIASEC / “inventory” / “outcomes” language
- Hit a narrated **100% / perfect score / exam** to feel worthy

---

## 3. Banned learner-facing lexicon

Refuse these in UI the learner reads (titles, buttons, kickers, counters, alerts, certificates).
Internal code ids may keep old names until renamed — **chrome must not leak them**.

| Ban | Prefer |
|-----|--------|
| Exam / Final Exam | Final check / Last picture practice |
| Quiz / Retry quiz | Practice questions / Try again |
| Assessment / inventory / Holland / RIASEC | Work interests / Questions about work |
| Mastery / Familiar / Proficient / Mastered | Comfortable / Ready / Station clear |
| Score / perfect / 100% required | Clear every item / You can try again |
| Prove / Pass (as grade) | Practise / Finish / Clear the board |
| Competent (as learner label) | Checked (with instructor) |
| Level-1 / ladder / first-try score | First set / Words practised / Practice again |
| Outcomes / What you will learn | Today’s work |
| Achieve (motto) | Keep going |

**Allowed honesty:** safety still must be clear; instructor checks are real; Practice alone is not a trade ticket. Say that in plain crew language — never as school grading.

---

## 4. Chrome rules (every Practice viewport)

1. **One job** — title + one short help line + the task. Fold Why / path map / jump / stats.
2. **No report card in the first viewport** — no % rings, domain % bars, or marks tiles competing with Today’s station.
3. **Progress without judgment** — “Stations finished” or a quiet bar; avoid “N% ready” as a grade.
4. **Soft gates** — coach with “Keep practising — no rush,” not disabled Continue that feels like failure.
5. **Soft miss** — “Not yet” + hear/try again. Never “Incorrect” / “Expected …” / “See results” as a report.
6. **Finite exit** — **Done for now** stays sacred.
7. **Repetition over novelty** — same loop at each station; change the object, not the rules mid-path.
8. **Phone + Desktop** — same words; shell aesthetics may differ (paper vs night) but fear doctrine does not.

---

## 5. Practice spine checklist (steps 3–22)

Run this on every station before merge:

| # | Station | Fear check |
|---|---------|------------|
| 3 | Your Language | “Questions,” not assessment |
| 4 | Work Style | No wrong answers; short picks |
| 5 | Career Profile | Path recommendation without % fit theatre |
| 6 | Visual Vocabulary | Hear → hear → type; one calm counter |
| 7 | Language Organize | Match pictures — never “quiz” |
| 8 | English Eye Spy | Clear the board; no prove / 100% / exam |
| 9 | Sentences / Word→Action | Four choices visible; type the matching word; soft retry — not tap-to-answer |
| 10 | Supported Practice | Help is strength, not remediation shame |
| 11 | Workplace Instructions | Hear + choose what to do |
| 12 | Computer Skills | Watch → try; first-computer friendly |
| 13 | Site Language | Continue to work-interest questions |
| 14 | Work Interests | No Holland/RIASEC in any language |
| 15–17 | Safety / Tools / Systems | Practice checks, not perfect-score exams |
| 18 | Equipment videos | Watch to continue |
| 19 | Instructor Check | Habit order; Checked not Competent |
| 20 | On-Site Training | Decisions + log; before last station |
| 21 | Final Check | Picture practice + written practice; no exam mode |
| 22 | Employment | Proof → “what you practised” |

Shared: Hub, shell, stats strip, unit intro, Familiar theater, passport, unit review.

---

## 6. Pre-ship critic (§ learner-fear)

1. Read the first viewport aloud. Does any word sound like school testing?
2. Can a fearful adult name the **one action** in three seconds?
3. If they miss, do they feel stupid — or invited to try again?
4. Is there a % / score / perfect / exam string still visible?
5. Would you show this to a founding builder without apologizing?

Fail any → fix before merge. Log overturns in Craft §11 and here if the rule changes.

---

## 7. Implementation map (where agents edit)

| Concern | Primary files |
|---------|----------------|
| Doctrine / craft | `docs/LEARNER_FEAR.md`, `docs/PLAY_CRAFT.md`, `docs/CRAFTSMANSHIP.md`, `AGENTS.md` |
| Hub / stats | `src/student/PracticeHub.tsx` |
| Journey shell / quizzes | `src/student/StudentSequence.tsx` |
| Step titles / goals | `src/student/journeyCurriculum.ts`, `src/pathways/packs/*.ts` |
| Vocab type loop | `src/student/VocabSheet.tsx` |
| Organize / Eye Spy / Sentences | `VocabOrganizeQuiz.tsx`, `EyeSpyQuiz.tsx`, `SentenceClozeDrill.tsx` |
| Play moment loop | `src/practice/PlayClear.tsx` + station wires |
| Career questions | `src/student/careerAssessment.ts`, `CareerAssessment.tsx` |
| Readiness labels | `src/student/learningMastery.ts`, `FamiliarTheater.tsx` |
| Passport | `src/skills/SkillsPassportPage.tsx`, Practice passport in `StudentSequence.tsx` |

---

## 8. Changelog

### 2026-10-27 — Sentence Structure type-the-blank

- Customer overturn: four choices stay visible; type the matching word (not tap-to-answer). Soft “Not yet · try again.” No score theatre.

### 2026-10-27 — First-go type-out; skip-known only on retake

- Customer ask: “I already know this word” does not belong on the first go — every learner should hear → hear → type. After they finish Workplace Words once and come back, a retake section may offer skip-known (still hear English + type).
- Ship: hide skip on day-one; persist station-cleared per pathway; hub “Workplace words again” + in-deck “Another round” framing (crew tone, no exam/retake-test lexicon).

### 2026-10-26 — Doctrine established + first deep Practice pass

- Customer ask: deeper learner-fear redesign of **all** Practice; documentation that agents must implement everywhere.
- Created this file; wired from `AGENTS.md` + Craft non-negotiable + §3 fear row.
- Deep pass shipped: hub %/marks report card → stations finished; Eye Spy / Sentence / Organize / Final check exam lexicon; pathway unit goals; observation Competent → habit language; career Holland/RIASEC learner strings + % labels; shell motto Keep going; Workplace Words title; stats strip coach-only.

### 2026-10-26 — Close-out to 100% learner-facing chrome

- Computer Skills / Equipment: “Watch to unlock” → keep watching / try; Quick check → one practice question.
- Unit review → unit practice; employment “verified skill” → what you practised (packs + curriculum).
- Career mother-tongue (AR/HI/AM/TI): assessment / quiz / inventory lexicon → work questions; See my path.
- Learn portal: Retry quiz / Score % / Expected / Mastery prototype → soft crew language.
- Public join path + seed pathway blurbs: verified skills → clear stations / instructor-checked practice.
- Assignments progress: quiz % → practice clear / in progress.

### 2026-10-26 — Board to 100% on every prior gap row

- Hub / portal: School path → Practice path; home % grades → Comfortable / Started; no Holland letter codes on career result.
- Soft / path: equipment familiarization → videos; StatusLabel Graded → Feedback ready; Work Interests purpose without “test”.
- Computer Skills: School Work folder → Job Files; Check → Done; instructor@school.ca → @work.ca.
- Multi / Learn: examen / اختبار / परीक्षा / ፈተና “not a test” lines → guide for your path; assignment Grade/100 chrome removed.

### 2026-10-26 — Residual leak close-out (true 100%)

- Practice banner CTA: School path → Practice path.
- Computer Skills lesson pack (`basicComputerSkillsVideos.ts`) aligned to Job Files (UI + checks match).
- Learner notification: Assignment graded /100 → feedback ready.
- Public + seed: school path/spine → practice path/spine (pathway copy).

### 2026-10-26 — Play craft (entertainment without fear)

- Customer ask: Candy Crush / Temple Run / Flappy-style joy while keeping learner-fear doctrine.
- New [`PLAY_CRAFT.md`](PLAY_CRAFT.md) — marble plan, eight roles, steal/refuse, desktop+phone contract.
- Moment loop on Workplace Words + Eye Spy; presentation-only boards cleared; no scoreboard theatre.

### 2026-10-26 — Play craft pass 2 (spine stations)

- Language Organize, Sentence Structure, Word→Action, Supported Practice: nearby objectives + clear pulses.
- Desktop night + phone paper inherit identical words; pulse CSS already dual-shell.

### 2026-10-27 — Play craft pass 3 (remaining spine)

- QuizRunner + Safety / Tools / Systems / Computer check / Equipment / Instructor / Site decisions / Final written / Employment prep: nearby + `firePlayClear`.
- Softened residual grade-like QuizRunner / Sentence summary wording; phone nearby-objective ink locked navy-on-cream.
- Still presentation-only — no evidence manufactured by clear pulses.

### 2026-10-27 — Play craft pass 4 (soft miss + foley)

- Site-wide soft miss: `Not yet · try again` / `softMissLine` — no bare teachWrong without invitation.
- Eye Spy / Organize show miss status; Vocab no double-latch; Computer try-phase no success Foley.
- Intake preference steps remain outside the clear board (not exam theatre either).

### 2026-10-27 — Play craft pass 5 (true ~100%)

- Dual-shell `.play-soft-miss` on every choice/clear miss (replacing `alert.warn` soft-miss).
- Residual lexicon: “Wrong answers teach” → “Misses teach”; Eye Spy “Go N” → “Try N”.
- Intake / unit intro / hub / passport: light next-action nearby only — still no fake board evidence.
- FamiliarTheater no longer double-latches Foley with `firePlayClear`.

### 2026-10-27 — VV type-out (every card)

- Visual Vocab / mother-tongue greetings: English spelling hidden until typed; type panel first-viewport with photo; langs collapse after bridge.
- Soft miss + nearby “Clear this word · type what you heard”; TTS fail still opens type (Hear again).
