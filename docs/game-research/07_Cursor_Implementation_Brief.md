# Purpose Academy Cursor Implementation Brief

Version 1.0. 26 October 2026.

## 1 Read these files in order

1. `02_Systems_Framework.md` for the system responsibilities and feedback loops.
2. `01_Research_Report.md` for research, historical cases, counterexamples, the recipe, and evidence limits.
3. `03_Game_Comparison.csv` for the scoped game comparisons and coding definitions.
4. `04_content.schema.json` and `05_content.examples.json` for an illustrative content contract.
5. `06_Source_Register.csv` for source identities and access limits.

The PDFs are reading editions. The Markdown files contain the implementation reference. These documents are proposals; do not assume they describe the current repository or an already approved curriculum.

## 2 Master instruction for Cursor

```text
Use the accompanying Purpose Academy research and systems framework to improve
the existing application through a narrow, evidence-aware vertical slice.

First inspect the actual repository, its instructions, stack, authentication,
storage, content import paths, accessibility approach, tests, and current learner
flow. Preserve working features and existing conventions. Do not invent findings
about files or services you have not inspected. Do not replace the whole app.

Map existing code to these eight responsibilities:
Promise, Entry, Action, Response, Challenge, Progress, Return, Evidence.

Implement one reviewed construction learning slice. Keep these distinct:
1. Activity state and cosmetic progress.
2. Immutable practice history and its conditions.
3. Dimension-specific learning evidence.
4. Practical observations entered by authorized human assessors.

Start with one accessible choice activity, specific explanatory feedback,
versioned content approval, durable attempts, pause/resume, a bounded review
planner, and an honest progress summary. Add a finite checkpoint presentation
only after the plain activity works. Keep the learning action central.

The supplied content examples are deliberately DRAFT fixtures with missing
assets and approvals. They are not production lessons. Permit them only in an
explicit development fixture route. Production publication must fail closed.
Do not generate translations or safety instruction and publish them as reviewed.

Do not implement paid lives, mystery rewards, academic credit from points,
public proficiency leagues, forced invitations, missed-day loss, automatic
practical certification, or a real-time runner that competes with comprehension.

Use approved task accommodations appropriately; they are not automatically hints.
Track when a support changes what the task measures. Do not infer intelligence,
disability, or motivation from speed, accent, or device performance.

Build iteratively. Report inspected findings, proposed files and changes,
unresolved decisions, meaningful verification, and known limits. All numeric
timing, session, and scheduling suggestions in the report are starting settings,
not scientifically proven optima.
```

## 3 The first vertical slice

Choose ten concepts approved by the curriculum team, with approximately thirty reviewed item forms as a scope target. This quantity is illustrative. If reviewed content is unavailable, implement the engine and fixture route while keeping learner publication blocked.

The slice should let a learner begin a relevant task, see or hear approved material, respond through accessible controls, receive a useful explanation, finish a short session, resume after interruption, and receive a later review. It should let an instructor inspect the actual evidence and report a content problem.

No new framework or dependency is required solely by this document. Use the project's existing stack unless inspection identifies a concrete reason to change it.

## 4 Core contracts

### Content

Resolve a stable item identifier and immutable version. Require a stream, concept, objective, intended evidence dimension, task form, answer policy, feedback, provenance, assets, safety classification, and review records. Validate the structure against the schema and then apply semantic and publication checks.

The example schema covers choice items only. Phrase assembly, open responses, speech, practical observations, and a full learner database require additional explicit contracts. Do not stretch the choice schema by hiding unsupported fields in free text.

### Attempt

Use an immutable `attempt_id` plus an idempotency key. Record learner and session references under the access policy, item version, objective, evidence dimension, response, evaluation version, support, answer-reveal timing, delivery failures, and occurrence and receipt times. Reference limited permitted evidence instead of broadcasting raw recordings or sensitive responses through analytics.

### Evidence

An eligible independent success requires an approved content version, valid delivery, response before answer reveal, allowed support, and no disclosed-answer retry pretending to be a fresh assessment. An accommodation does not automatically make an attempt ineligible. Retained evidence needs an appropriate later check. Practical observation requires an authorized assessor and a separate rubric and record.

### Review

Select a small session from due dimensions, instructor assignments, prerequisites, and useful new or transfer material. Bound overdue recommendations. Do not erase history when review is due. Store the scheduler version and reasons for stage transitions.

## 5 Publication gate

The schema enforces some structural conditions. Implement additional semantic checks before learner release:

1. IDs are unique and versions follow the project's immutable version policy.
2. Every referenced asset exists in the item or approved asset registry.
3. Every correct-option ID exists; option IDs are unique.
4. Required asset bytes load, match the intended meaning, and have appropriate rights.
5. Required language, domain, accessibility, safety, and translation approvals exist and cover this version.
6. A translation is paired with the correct language, script, audio, and source text.
7. The prompt, options, and feedback do not contradict one another or contain answer leaks inappropriate to the task form.
8. The accessible form measures the declared objective under its documented support policy.
9. Safety-critical items have qualified domain and safety review and cannot imply practical authorization from a phone quiz.
10. Withdrawn or draft content cannot enter production sessions.

A valid JSON file can still fail all important teaching requirements. Machine validation is only one gate.

## 6 State handling

Use explicit activity states such as `ready`, `loading_item`, `presenting`, `awaiting_response`, `evaluating`, `feedback`, `summary`, `paused`, `recoverable_error`, and `completed`. Define permitted transitions.

Pause active timing during interruptions. Preserve stable state before leaving the foreground. Make retries idempotent. Do not duplicate evidence or rewards if the evaluation response is replayed. On stale content, retain the old version reference and provide a recoverable path.

For offline support, use a durable append-only queue with stable IDs and explicit pending status. Validate under the appropriate policy after sync. High-stakes academic or assessor decisions need server authority and access checks. Offline client-side practice is not a tamper-proof assessment environment.

## 7 Suggested implementation order

### Change set A

Audit and document the existing flow. Add the versioned content model, schema checks, semantic validator, and explicit fixture route. Confirm production gates reject the supplied examples.

### Change set B

Implement one accessible choice interaction and specific feedback. Add attempt recording and error handling. Verify keyboard, screen reader, larger text, reduced motion, and alternate input on the supported platform.

### Change set C

Implement session save and resume, duplicate protection, and the bounded review planner. Keep supported practice and independent evidence distinct. Add a simple dimension-specific summary.

### Change set D

Add instructor inspection, content reporting, correction audit, and practical-observation authority where the existing project supports it. Do not create fake approvals or credentials.

### Change set E

Add one finite route or task map as an optional presentation. Evaluate it against the plain activity using comparable reviewed material and delayed outcomes. Defer social and economy systems until the core is useful.

## 8 Meaningful verification

Use the project's existing testing conventions and scale checks to actual risk. Important behaviors include:

- Production cannot publish a draft or an unapproved required asset.
- A valid correct-option reference is required and duplicate options are rejected.
- Answer-revealed retries stay supported practice.
- A later eligible check updates only the relevant evidence dimension.
- A review due date does not erase historical evidence.
- Double submission and sync replay create one accepted attempt.
- An audio or image failure does not create an incorrect learner judgment.
- Unauthorized roles cannot create or alter a practical observation.
- A content revision preserves interpretation of earlier attempts.
- Pausing and resuming preserve state without background timing inflation.
- Core controls work without dragging, color alone, sound, or decorative motion.

Add broader tests only for actual implementation changes, unresolved risks, or failures. Do not generate a large suite that merely repeats getters or hard-codes the UI's own text.

## 9 Evaluation and acceptance

Observe representative learners and inspect content validity before running presentation experiments. Use small-pilot results descriptively, with raw counts and missing-data disclosure. Test one meaningful presentation change at a time when isolating cause.

Primary questions: can people use the activity, do they practice the intended skill, do they remember it later, can they apply it in a changed scenario, and can the team sustain review and support? App opens, points, and animation completion are diagnostic events, not the answer.

The work is ready for a learner pilot only when content is approved, evidence labels are honest, the key reliability and accessibility checks pass, and instructors understand what the records do and do not establish.
