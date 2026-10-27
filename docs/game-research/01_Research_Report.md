# Casual Game Design and Psychology for Purpose Academy

## A comparative research report and implementation reference

Prepared for Levi Zigza. Research snapshot: 26 October 2026. Intended readers: the Purpose Academy product team, curriculum reviewers, and Cursor. This is a research and design specification, not a claim that a product has already been built or evaluated.

## 1 The main conclusion

Purpose Academy should borrow the structure that makes casual games approachable: a clear next action, understandable consequences, responsive feedback, manageable challenges, and visible evidence of improvement. It should connect those features to useful language and workplace tasks. The durable advantage will come from making the act of learning satisfying, rather than putting an unrelated game in front of a quiz.

There is no single hidden mechanism shared by every successful casual game. The most useful common structure is **an understandable action that produces a legible change and a reason to act again**. Different games supply that reason through skill, discovery, sensory pleasure, completion, ownership, routine, social contact, or uncertain rewards. Their mixtures differ substantially. This report therefore separates broad design principles from optional engagement devices.

The comparison covers **36 prominent games across eight analytical families**, with three historical discontinuation cases. It combines public rules, developer descriptions, original interviews, accessible research, and a small source-code inspection. It is a structured comparative desk review, not an exhaustive census, a systematic review with preregistered searches, a set of instrumented playtests, or access to private company analytics. The breadth reduces dependence on four famous examples; it does not turn observation into causal proof.

For Purpose Academy, define success as **learners returning to worthwhile practice and retaining skills they can use later**. Time spent, streak length, points, and daily activity can help diagnose the experience. They are not substitutes for learning, and an app cannot establish physical workplace competence through tapping alone. The current Purpose Academy documents already make this distinction. [PA1, PA2]

The recommended first release is a compact system built around visual recognition, listening and instruction tasks, phrase construction, delayed retrieval, and a practical task map. Start with one construction module. Treat Logistics and Community Support as separate extensions, rather than silently expanding the construction pilot. [PA1]

### How to read the evidence labels

- **D — Documented:** a published rule, source-code behavior, or direct developer statement. A developer's explanation of success remains that developer's interpretation.
- **O — Comparative observation:** an analyst classification across the scoped games. Useful for generating hypotheses, not estimating a population effect.
- **R — Research:** an empirical finding or research synthesis. Its population, task, outcome, and limitations matter.
- **I — Inference:** an explanation consistent with the evidence but not directly established for the named game.
- **P — Proposal:** a Purpose Academy design or engineering choice that must be tested.
- **U — Unknown:** information the inspected public sources do not establish.

Source identifiers such as [G01] and [R03] refer to the bibliography and `06_Source_Register.csv`. The register records limitations, including pages accessible only through indexed abstracts. Proposed thresholds throughout this report are starting configurations, not proven optima.

## 2 Fifty patterns to take into development

These are fifty actionable findings and candidate patterns, not fifty features that every game contains. The qualifications are part of the finding.

1. Make the next action obvious before explaining the whole system.
2. Teach through an action and its result, supported by concise instructions.
3. Use a small interaction vocabulary repeatedly.
4. Separate a simple control scheme from a potentially deep decision space.
5. Give players a concrete nearby objective.
6. Make the effect of an action visible and understandable.
7. Respond promptly to input, even when the full result takes longer.
8. Keep the first meaningful attempt easy to reach.
9. Demonstrate the experience honestly in acquisition material.
10. Design for interrupted attention and short opportunities to participate.
11. Create a satisfying small unit of completion.
12. Let that small unit contribute to a larger purpose.
13. Show improvement in a form the user can interpret.
14. Introduce new complexity gradually.
15. Recombine known rules before introducing additional ones.
16. Vary situations while keeping the interaction grammar stable.
17. Use difficulty to support progress rather than merely extend time spent.
18. Distinguish challenge, confusion, and interface failure.
19. Make mistakes informative and recovery easy.
20. Offer another attempt while the lesson from failure is still clear.
21. Preserve meaningful progress across interruptions.
22. Use optional stretch goals for people who want greater mastery.
23. Provide different experiences for relaxation and performance pressure.
24. Give deliberate choices enough influence for skill to matter.
25. Let uncertainty create interest where the task benefits from it.
26. Keep rules and evaluation stable even when situations vary.
27. Do not confuse random content, random outcomes, and random rewards.
28. Coordinate visual, audio, and motion feedback around the action's meaning.
29. Keep sensory feedback legible when effects are muted or reduced.
30. Design visual hierarchy for quick recognition on a small screen.
31. Use recognizable objects or relationships to reduce explanation costs.
32. Respect the language and cultural knowledge a task actually requires.
33. Support a feeling of competence through understandable achievement.
34. Offer choices that matter without overwhelming beginners.
35. Make social participation optional when the core task can stand alone.
36. Use cooperation and reciprocity where they create useful relationships.
37. Let people share a meaningful result without exposing private information.
38. Distinguish social conversation from a genuine network-dependent product.
39. Recognize that collection and ownership can support return visits.
40. Tie persistent progress to an outcome users care about.
41. Use reminders in a context chosen by the user.
42. Provide a satisfying stopping point as well as a reason to return.
43. Evaluate finite daily routines as an alternative to endless play.
44. Treat live events and content updates as ongoing operating costs.
45. Analyze monetization separately from the quality of the core action.
46. Count acquisition, retention, revenue, profitability, and benefit separately.
47. Look for counterexamples before calling a feature essential.
48. Investigate failure cases before copying a successful product's checklist.
49. Measure delayed learning and transfer before scaling educational mechanics.
50. Preserve learner dignity, agency, access, and trustworthy assessment as product requirements.

## 3 How the comparison was constructed

### 3.1 Scope and selection

The corpus deliberately includes different routes to prominence: mass downloaded mobile games, enduring puzzle franchises, a viral web game, a daily word ritual, and commercial live-service games. This is purposive maximum-variation sampling. It is useful for finding both recurring structures and contradictions. It is not a probability sample of all games, and it overrepresents English-language, globally visible, surviving products.

The eight families are working categories rather than a formal industry taxonomy. A game can belong to several. Gardenscapes is both a match-three puzzle and a persistent restoration game; Merge Dragons combines authored levels and a camp; Crossy Road is an arcade hopper rather than a conventional forward runner. The categories prevent the analysis from treating one commercial genre as the whole market.

Public evidence for prominence varies. For example, the inspected Android listings showed one billion or more downloads for Subway Surfers and one hundred million or more for Happy Glass and Trivia Crack. ZeptoLab's page reports 990 million players for Cut the Rope. These are platform thresholds or publisher claims, not directly comparable counts of unique people. Long product life, broad distribution, cultural visibility, and publisher-reported reach supply additional selection signals. No uniform financial success threshold has been independently audited for all 36 cases. [G06, G08, G10, G24]

MONOPOLY GO illustrates a different measure: Hasbro reported approximately US$2 billion in revenue in its first ten months in March 2024. That does not establish profit, learner benefit, or a retention benchmark for another product. 2048's public repository establishes inspectable code and substantial reuse, not comparable revenue or active users. [G18, G33]

### 3.2 What was compared

For each case, examine the main action, nearby objective, information available to the user, uncertainty, failure cost, immediate feedback, persistent progress, social obligations, time constraints, and commercial context. Where an original design is the object of study, contemporary sequels and remakes are treated separately.

The supplied CSV also codes six features using Y, N, V, and U:

- **Y:** characteristic of the explicitly scoped core.
- **N:** not characteristic of that scoped core. This does not assert absence in every version or optional mode.
- **V:** depends materially on edition, mode, or historical version.
- **U:** insufficient inspected documentation.

`bounded_round` means a recognizable run, level, puzzle, or match with an end condition. `realtime_core` means continuous timing demands in the core activity, not a seasonal countdown. `persistent_content_or_world` excludes a best-score counter or streak alone. `chance_or_procedural_core` concerns variable game state, not hidden commercial targeting. `mechanical_social` concerns help, trading, turns, or joint competition, excluding external conversation and ordinary scoreboards alone. `resource_or_production_waits` includes both access-resource replenishment and production timers; these have different consequences and must not be treated as equivalent.

### 3.3 Descriptive coding results

| Feature | Y | N | V | U | What the result permits us to say |
|---|---:|---:|---:|---:|---|
| Bounded run, level, puzzle, or match | 28 | 8 | 0 | 0 | Small completed units recur widely; idle and persistent-world cores show alternatives |
| Continuous real-time pressure | 10 | 23 | 3 | 0 | Reflex pressure is a subgroup mechanism, not a universal requirement |
| Persistent content or world progression | 25 | 4 | 7 | 0 | Persistent journeys are common; several classic successes work without them |
| Chance or procedural variation in the core | 21 | 10 | 4 | 1 | Variable situations are common; fixed authored challenges also succeed |
| Mechanical social interaction | 11 | 18 | 5 | 2 | Help, trading, and opponent relationships are optional architectures |
| Resource or production waits | 12 | 14 | 5 | 5 | Timers are a subset device, and uncertainty prevents a whole-corpus claim |

**O:** These counts are reproducible summaries of the supplied analyst-coded table, not measured player behavior. Their precision is bookkeeping precision. Related games share developers and design ancestry; they are not 36 independent replications. Version boundaries and incomplete descriptions limit the coding. Do not calculate causal success probabilities from this table.

### 3.4 What would be required for stronger causal claims

To establish that a feature *caused* success, we would need credible experiments, natural experiments, or matched longitudinal evidence with adequate controls. A successful game containing a feature proves neither necessity nor sufficiency. A creator recalling a turning point is useful first-person evidence but can be affected by hindsight and concurrent changes. Public download and revenue milestones do not reveal the counterfactual.

The report strengthens inference in three ways: comparisons across different mechanics; explicit counterexamples and discontinued cases; and research that directly tests narrower psychological or instructional processes. None establishes that a complete borrowed system will work for adult workplace-language learners. That final link requires Purpose Academy evaluation.

## 4 The 36 game corpus

The return drivers below are interpretations of documented mechanics. They are not declarations of the designers' private intentions or measured causal contributions. Edition boundaries in the CSV remain authoritative.

| ID | Game | Main action or decision | Likely appeal and return driver |
|---|---|---|---|
| G01 | Candy Crush Saga | Swap candies to meet a level objective | Manageable puzzle decisions, cascades, map progress, and recurring goals |
| G02 | Bejeweled Classic | Swap gems and preserve productive matches | Immediate visual payoff and a familiar rule with many board states |
| G03 | Royal Match | Clear objectives within a move budget | Readable combinations, level progress, and castle restoration |
| G04 | Toon Blast | Tap connected groups and combine effects | Low input complexity, content progression, and team participation |
| G05 | Angry Birds | Aim limited projectiles at structures | Predictable physical intuition, visible consequences, and better solutions |
| G06 | Cut the Rope | Cut or manipulate supports to deliver candy | Anticipation, an expressive goal character, and optional star optimization |
| G07 | Where's My Water? | Shape routes for flowing water | Visible causal reasoning and a concrete destination |
| G08 | Happy Glass | Draw a route or support to fill a glass | Creative solution search and instantly readable success |
| G09 | Temple Run | React to obstacles while moving automatically | Continuous tension, distance records, coins, and upgrades |
| G10 | Subway Surfers | Change lanes and avoid hazards | Familiar movement, colorful variation, and collection |
| G11 | Jetpack Joyride | Hold to rise and release to descend | Direct control, surprise vehicles, missions, and records |
| G12 | Crossy Road | Choose when and where to hop | A familiar crossing problem, local risk, and character collection |
| G13 | Flappy Bird | Tap to regulate height through gaps | Minimal instruction, tiny attainable-looking score increments, and rapid retry |
| G14 | Fruit Ninja | Slice targets while respecting hazards | A direct gesture with expressive sensory feedback |
| G15 | Doodle Jump | Steer recurring jumps upward | Vertical progress, anticipation, and personal records |
| G16 | Helix Jump | Rotate platforms to find safe descent | Clear spatial progress and timing decisions |
| G17 | Tetris | Position falling pieces to complete lines | Creating order under growing space and time constraints |
| G18 | 2048 | Slide a grid and merge equal numbers | A simple rule, a visible target, and escalating planning consequences |
| G19 | Block Blast | Place pieces to complete rows or columns | Untimed spatial decisions and satisfying clearing |
| G20 | Stack | Time a tap to align the next block | A narrow control problem with clear error accumulation |
| G21 | Wordle | Infer a word from constrained feedback | A finite daily challenge and shared conversation |
| G22 | Words With Friends | Form words from a rack on a shared board | Strategic expression and asynchronous reciprocity |
| G23 | Wordscapes | Connect letters to complete a word grid | Familiar language, a visible completion goal, and authored progress |
| G24 | Trivia Crack | Answer questions in categories and contests | Knowledge validation, novelty, and social competition |
| G25 | Cookie Clicker | Buy producers and improve output | Compounding numbers, discovery, and system growth |
| G26 | AdVenture Capitalist | Buy and automate businesses | Automation, milestones, and reinvestment decisions |
| G27 | Merge Dragons | Merge items and restore space | Transformation, discovery, puzzle completion, and camp ownership |
| G28 | Travel Town | Generate and merge objects to fulfill orders | Concrete requests, collection chains, and town improvement |
| G29 | Gardenscapes | Complete puzzles and restore a garden | A useful destination for puzzle rewards and visible restoration |
| G30 | Homescapes | Complete puzzles and renovate a mansion | Persistent ownership, decoration, and story continuation |
| G31 | Township | Produce goods and invest in a town | Predictable production, planning, and ownership |
| G32 | Hay Day | Grow, process, and trade goods | A dependable world, care, routine, and exchange |
| G33 | MONOPOLY GO! | Roll dice, build, and collect | Familiar imagery, uncertain rewards, events, and exchanges |
| G34 | Coin Master | Spin, build, attack, or raid | Uncertain outcomes combined with social retaliation and collection |
| G35 | My Talking Tom | Care for and customize a persistent pet | Attachment, responsiveness, and routine |
| G36 | Solitaire Grand Harvest | Clear adjacent-rank cards and develop a farm | Familiar card rules connected to a persistent journey |

## 5 How the principal mechanical systems work

The following engineering models explain classes of systems. Apart from the identified 2048 code observations, they are clean-room abstractions of visible mechanics, not recovered proprietary code, exact production algorithms, or documented company architectures.

### 5.1 Match and blast games

**Representative cases:** Candy Crush Saga, Bejeweled, Royal Match, Toon Blast, and the puzzle layers of Gardenscapes and Homescapes.

#### The local action and result

In a conventional swap-based match-three loop, the player selects adjacent pieces. A legal swap creates a match, matched pieces resolve, pieces above move into available space, and replacements enter. Further matches can produce a cascade. The level evaluates an objective, often against a move budget. Special pieces allow one decision to have a wider effect. Tap-blast games instead let the player remove qualifying connected groups; the recognition and control demands differ even when the reward presentation looks similar. [G01, G02, G03, G04]

An illustrative resolver is:

```text
accept input only in the awaiting_input state
validate action against current board rules
resolve the action once
while matches or queued effects remain:
    determine affected cells using a stable effect order
    apply removals and objective updates
    apply gravity and refill according to configured rules
    publish animation events for that resolved state
evaluate win, loss, and remaining legal actions
return to awaiting_input or show the result
```

The important engineering distinction is between **state resolution** and **presentation**. If scoring is driven by animation callbacks, a dropped frame or skipped effect can change the result. A robust implementation resolves the authoritative outcome first and then presents it. Seeded randomness can support replay and quality checks. These are proposed implementation principles, not statements about King's private engine.

#### Why a small control vocabulary supports depth

The player does not need to learn a new input for every board. Depth comes from geometry, blockers, interacting effects, limited moves, and choices between short-term and future value. A familiar action becomes a language for many different situations. The payoff from a cascade can exceed the visible size of the initiating action, which may make a good move feel especially effective. The psychological contribution is an inference, not a measured dopamine event.

Different sources of difficulty must be separated: the board's combinatorial complexity; how often useful pieces arrive; how much information is visible; the move budget; and the availability of assistance. A low pass rate alone cannot distinguish a thoughtful puzzle from an opaque or frustrating one.

#### The larger journey

King's cofounder described adding the Saga map and social elements when moving Candy Crush to Facebook, and contrasted the original short experience with later progression and evolving mechanics. That supports the importance King assigned to progression; it does not isolate the map's causal effect from platform exposure and other changes. [G01a]

Candy Crush's official rules describe replenishing lives and options to wait, buy, or seek help. Boosters can be earned or purchased. These mechanisms connect progression friction to return visits, social requests, and spending opportunities. Their presence is documented; claims that an individual board was secretly manipulated to induce a purchase are not established by those rules. [G01b, G01c]

Royal Match and Toon Blast show how team features can wrap around a largely solo puzzle core. Official support describes life gifting and team participation. The core puzzle can be comprehensible before the social economy is introduced. [G03a, G04a]

#### Purpose Academy translation

Borrow a stable interaction vocabulary and varied, reviewed situations. A successful image-to-word decision can reveal a useful part of a task map. Make the consequence semantically meaningful: selecting a tape measure should help interpret a measurement instruction. Do not make the correctness of a language answer random, and do not require a learner to wait for lives after errors. A correct match can be enjoyable, but a cascade of visual effects is not evidence that several words were learned.

### 5.2 Physics, drawing, and causal puzzle games

**Representative cases:** Angry Birds, Cut the Rope, Where's My Water?, Happy Glass.

These games make a prediction visible. The player chooses an intervention, observes a physical sequence, compares it with the intended result, and changes the next attempt. The screen can contain both the question and its consequence, reducing the need for lengthy verbal explanation. A successful chain reaction is a visible demonstration that a plan worked.

In Angry Birds, aiming establishes an initial condition; flight and collisions propagate consequences. A limited supply of birds makes order and targeting matter. Completion and a better score are separable goals. Rovio's official recreation documents the original-style slingshot and physics-puzzle structure; Apple's developer interview reports that the slingshot helped make the controls approachable. Neither provides the original engine's complete tuning constants. [G05, G05b]

A generic projectile model starts from position, velocity, and acceleration:

```text
horizontal position = start_x + velocity_x * elapsed_time
vertical position   = start_y + velocity_y * elapsed_time
                      + 0.5 * gravity * elapsed_time^2
```

Real rigid-body games also need collision detection, contact response, friction, joints, sleeping bodies, and stable time stepping. Visual debris can be decoupled from collision bodies to preserve performance. The formula explains a basic ballistic component, not the full Angry Birds simulation.

Cut the Rope adds a different decision: altering constraints and timing interactions to deliver candy, with optional stars encouraging better solutions. Where's My Water? makes routing and fluid consequences central. Happy Glass allows drawn geometry to become part of the solution. Their shared structure is **intervention → visible causal sequence → diagnosis**, rather than a single shared reward schedule. [G06, G07, G08]

#### The failure loop

Failure is productive when the player can identify a change worth trying. A missed launch may suggest a different angle; a spill may reveal a missing barrier. Failure becomes unproductive when results seem arbitrary, replay takes too long, or the relevant cause is hidden. A person who retries is not necessarily enjoying the experience: they may be curious, frustrated, invested, or responding to a specific challenge. Observe their behavior and ask them.

#### Purpose Academy translation

Use this pattern for instruction-following, sequencing, document completion, and reasoning about scenarios. Let a learner choose an action and see a concise consequence, then explain it. Avoid turning a safety scenario into an amusing trial-and-error simulator that appears to authorize real hazardous work. The app can assess recognition and decisions under described conditions; supervised demonstration remains separate.

An example is a measurement communication task: the learner hears a request, chooses an appropriate response, and sees the measurement and unit highlighted. A second attempt changes the value and phrasing. The useful challenge is understanding and communicating the instruction, not launching a cartoon tool accurately.

### 5.3 Runners and continuous traversal

**Representative cases:** Temple Run, Subway Surfers, Jetpack Joyride, Crossy Road.

Automatic motion removes one continuous responsibility and concentrates attention on immediate decisions. Temple Run's public description specifies swipes to turn, jump, and slide, coins, power-ups, and unlockable characters. Subway Surfers emphasizes dodging and swipe-based movement. Jetpack Joyride combines one-touch vertical control with missions and equipment. Crossy Road gives the player more direct control of when to advance, but moving hazards still impose urgency. [G09, G10, G11, G12]

A generic runner contains:

- A movement controller that translates input into a small set of actions.
- A track or environment sequence selected from authored segments.
- Obstacle rules that ensure a viable action remains possible.
- A difficulty controller for speed, density, and combinations.
- Collision and failure states.
- A score or distance counter, pickup system, and optional mission layer.
- Object reuse and predictable asset loading so performance stays steady.

Procedural generation is not the same as unrestricted randomness. If a game creates obstacles faster than the user can perceive and respond, no amount of input skill can make a sequence fair. Designers can constrain gaps, visibility, action transitions, and segment combinations. An illustrative constraint is `available decision time = visible distance / movement speed`. The appropriate minimum depends on the action and user, not a universal constant.

#### Several goals can survive one failed run

A run can end while still advancing a mission or a collection. This lets the same session carry immediate survival, a score goal, and persistent progress. Temple Run 2's support explicitly describes objectives that can span sessions and unlock rewards or increase a score multiplier. That sequel-specific system should not be silently assigned to every original Temple Run version. [G09b]

The founders' 2012 interview describes a move from a paid release to free-to-play and emphasizes high-score conversation and word of mouth. This is direct historical testimony about acquisition and social use, not evidence that all runners grow organically or that free access is sufficient. [G09a]

#### Purpose Academy translation

Do not combine an unfamiliar listening question with a moving obstacle that demands a simultaneous reflex response. The motion can compete with the learning task. A safer version is a finite route with stationary checkpoints: listen, answer, see progress, and then move. Offer an optional faster fluency mode only after the learner demonstrates the underlying skill, with no effect on core access or practical competency decisions.

### 5.4 Precision, gesture, and narrow-control arcade games

**Representative cases:** Flappy Bird, Fruit Ninja, Doodle Jump, Helix Jump, and Stack as an adjacent timing case.

These games reduce the number of instructions but can demand precise performance. Minimal controls do not imply low difficulty or low attention. A narrow input surface can make the gap between intention and execution especially obvious.

Flappy Bird's original creator interview describes a one-handed, tap-based mobile design and its unanticipated success. Its very small scoring unit creates an easily understood personal target. The original's later removal and the creator's concerns complicate any story that treats the outcome as a deliberately optimized behavioral campaign. Later projects using the name are outside this analysis. [G13]

A generic flap-like controller sets upward velocity on a tap and continuously applies downward acceleration. Horizontal obstacle movement creates a stream of clearance problems. Gap height, spacing, movement speed, collision bounds, input latency, and vertical acceleration jointly determine difficulty. Without the original production code, exact constants, hitboxes, and randomization rules remain unknown. Making up those constants would produce a clone specification, not verified reverse engineering.

Fruit Ninja gives the finger gesture an expressive visible consequence. Doodle Jump converts steering into vertical advancement. Helix Jump frames spatial timing around reaching the bottom. Stack makes accumulated alignment error visible in the next piece's reduced area. These are related through motor control and immediate feedback, but their trajectories, failure conditions, and planning demands differ. [G14, G15, G16, G20]

#### Why rapid retries can be compelling

**I:** A player may believe the next attempt can improve because the action is simple, the failure is attributable, and the next opportunity is close. A best score provides a clear comparison. The small cost of restarting makes another experiment easy. A near success can add motivation, but so can learning a useful adjustment. We cannot infer the relative contribution from success stories alone.

For learning, keep the recovery speed and remove the precision barrier when it is irrelevant. Choosing the right word should not require millisecond timing. Fast tapping should not receive a higher competence judgment than careful comprehension. These games offer a lesson in responsive feedback and low retry friction, not a reason to make language practice punishing.

### 5.5 Spatial and number puzzles

**Representative cases:** Tetris, 2048, Block Blast, Stack.

The common resource is usable space. A local action changes which future actions remain possible. Clearing, merging, or precise alignment restores useful structure or delays the loss of options. Tetris adds continuous falling pressure; original 2048 gives the player time to think; Block Blast's classic placement similarly supports deliberate decisions. Stack turns space loss into a timing consequence. [G17, G18, G19, G20]

This family is a strong counterexample to the claim that excitement requires an elaborate story or social obligation. It is also a counterexample to assuming that no timer means no meaningful challenge. Planning and constrained space can supply difficulty without continuous reaction demands.

#### A source-code-grounded 2048 example

**D:** In the inspected original `game_manager.js`, a new game starts with two tiles; a new tile's value is selected as 2 with probability 0.9, otherwise 4. Only a move that changes the board triggers a new tile. Equal tiles can merge, a resulting tile cannot merge again in the same move, and scoring adds the merged value. Creating 2048 sets the win state; play can continue. Loss occurs when neither space nor an adjacent merge is available. These are specific observations of the inspected source, not generic claims about every 2048 clone. [G18a]

The grid source selects an available empty cell; the input manager maps multiple controls to directional move events. This separation illustrates how a small input vocabulary can drive a consistent state machine. The repository's branch can change, and this report does not claim a pinned build or an executed audit. [G18b, G18c]

**I:** The uncertainty is constrained: a player cannot choose the next tile, but can influence board structure and future flexibility. That creates planning under uncertainty without making the rules themselves unstable.

For Purpose Academy, borrow the clarity of constraints and visible improvement. A phrase-building board should show which sentence positions remain unresolved. Do not impose limited board space when that merely obstructs reading or forces guessing. A shrinking area is useful in a stacking game because alignment is the task; it is usually irrelevant to understanding an instruction.

### 5.6 Word, daily puzzle, and knowledge games

**Representative cases:** Wordle, Words With Friends, Wordscapes, Trivia Crack.

These games depend on linguistic or factual knowledge, so they challenge the idea that all casual successes are language-free or equally accessible to everyone. Wordle requires vocabulary and inference; Words With Friends adds strategic placement and a social turn structure; Wordscapes uses a visible completion grid; Trivia Crack combines questions with categories and competition. [G21, G22, G23, G24]

Wordle's finite daily format creates a shared reference point and a natural ending. Sharing a result can signal participation without giving away the answer. The NYT investor presentation's indexed excerpt reports that Wordle brought tens of millions of new users to the company; the full deck could not be fetched in this review, so it is not used for detailed financial claims. [G21a]

**I:** A common daily challenge coordinates conversation. It can make participation socially meaningful without requiring a live multiplayer session. A result format that is recognizable and compact can travel through messaging networks. These properties help explain why a product can spread with limited in-product social functionality.

Words With Friends creates a different return cue: another person has taken a turn. That cue contains actual content and a relationship, rather than a generic notification. Wordscapes' daily puzzle offers additional bounded variation, while its regular boards provide an authored journey. Trivia Crack can make recognition of existing knowledge socially rewarding, but correct quiz answers do not establish broad understanding or application. [G22, G23a, G24]

For Purpose Academy, use a reviewed daily or weekly workplace challenge, with an explanation and optional sharing. Provide different difficulty bands so a shared activity does not become a public ranking of English proficiency. A learner should be able to complete it privately and stop. Avoid making attendance on a particular day the only way to access useful material.

### 5.7 Idle production and merging

**Representative cases:** Cookie Clicker, AdVenture Capitalist, Merge Dragons, Travel Town.

Idle systems shift attention from constant execution to purchasing, automation, and accumulation. Merge systems give repeated transformation a simple spatial action. Both can create a larger system from small inputs, but they should not be conflated: an idle producer earns over time, while a merge decision changes objects or space directly. [G25, G26, G27, G28]

In a generic idle economy, a producer has a purchase cost, output rate, and possible multiplier. Automation reduces repeated input. Later costs can rise faster than ordinary output, creating plateaus that upgrades or resets help overcome. An illustrative cost curve is `cost(n) = base_cost × growth_factor^n`; a rough affordability estimate is `additional_wait = max(0, next_cost - current_balance) / current_output_rate`. These formulas explain a common design approach, not the exact economy of the named games.

Persistent accumulation makes a return visit potentially rewarding because the system has changed. Reset or prestige systems can make a previous plateau look surmountable on a new run. Their actual rates, multipliers, and economic calibration require game-specific sources or code; they are not inferred here from the presence of large numbers.

Merge Dragons links puzzle results to a persistent camp and transformation. Travel Town's official support describes a board with producers, items, orders, and inventory, with completed orders supporting town development. The player has both a specific request and a broader place to improve. [G27, G28]

**I:** Transformation makes progress tangible. Missing items can create a concrete next objective; a completed order closes a small loop. Space scarcity, production waits, and uncertain outputs can also create frustration and commercial pressure. Their motivational balance is not public simply because the mechanics are visible.

For Purpose Academy, borrow visible construction of a useful body of knowledge: known words support phrases; phrases support instructions; instructions support scenarios. Do not imply that vocabulary can literally be merged into competence without testing each dimension. Do not award mastery while the user is absent. An app's display can grow passively; a person's retained skill cannot be assumed to grow on the same schedule.

### 5.8 Persistent worlds, collection, care, and social economies

**Representative cases:** Gardenscapes, Homescapes, Township, Hay Day, MONOPOLY GO!, Coin Master, My Talking Tom, Solitaire Grand Harvest.

This grouping contains distinct systems united by persistent state beyond an isolated attempt. Puzzle work can restore a garden or mansion; production can expand a town; a pet can develop a history; card or sticker collections can create continuing goals. A persistent result gives a small action a larger destination. [G29, G30, G31, G32, G33, G34, G35, G36]

Restoration creates a clear before-and-after comparison. Decoration adds choice and ownership. Farming combines production schedules, inventory, and exchange. Pet care adds responsiveness and attachment. These mechanisms offer different experiences even when all use coins, timers, and colorful interfaces.

Coin Master's official support describes attacks triggered by spinner results, targets including friends or revenge lists, and the possibility of losing a building level and star when unprotected. Its cards and invitation rewards create additional collection and recruitment loops. This is a more direct mixture of chance and social consequence than an ordinary solitary puzzle. [G34, G34a, G34b]

MONOPOLY GO combines dice-based outcomes with a familiar branded world and collection. Its commercial scale cannot be explained by a reward mechanic alone: brand, distribution, content, marketing, operations, and execution are plausible contributors whose individual effects are not isolated by a revenue announcement. [G33]

Solitaire Grand Harvest connects familiar adjacent-rank card clearing to farm progression. The simple rule reduces the cost of understanding the next action; the farm gives completion a destination. That does not imply that its mobile and browser resource economies are identical. [G36]

For Purpose Academy, use a task map, a personal learning record, or an optional visual project to make progress concrete. Never let another learner damage someone's academic progress. Avoid pet distress, missed-day penalties, or expiring safety-learning access. Social encouragement can support practice without making a person responsible for another user's loss.

## 6 The psychological underpinnings

### 6.1 Understanding an action reduces the cost of beginning

**O and I:** Many games place a small number of important relationships on the screen. A falling piece, an empty glass, a tower, or a visible word grid makes the nearby problem concrete. A player can form a useful prediction before understanding the whole system.

The deeper principle is not that people dislike thinking. It is that unnecessary interpretation consumes effort before the interesting thinking begins. A simple control can support sophisticated planning. Conversely, a supposedly simple game can exclude users through unfamiliar symbols, literacy demands, motor precision, inaccessible controls, or cultural references.

For Purpose Academy, distinguish three demands: operating the interface, comprehending the English, and reasoning about the task. If all three change at once, errors become difficult to diagnose. Begin with a stable interface, use a familiar task, and introduce language difficulty deliberately. Sweller's cognitive-load work supports paying attention to how instructional design uses limited processing resources; it does not supply a universal number of cards or an ideal screen layout. [R08]

**P:** Use four large, stable answer locations in an initial recognition task, then move to more demanding retrieval formats when the learner is ready. Four is a prototype choice, not a psychological law. Avoid images so decorative or similar that the learner must solve a visual puzzle before attempting the language task.

### 6.2 Competence makes effort feel worthwhile

**R:** Ryan, Rigby, and Przybylski's four-study investigation linked perceived competence and autonomy with game enjoyment and related outcomes. Their work also examines intuitive controls and, in multiplayer contexts, relatedness. It supports examining need satisfaction rather than treating rewards as the only motive. It does not establish a causal explanation for each game in this corpus. [R01]

**I:** A readable result lets the player attribute success to something they did. A coherent progression of challenges can make improvement visible. Repeated easy praise without meaningful achievement may lose credibility; repeated opaque failure can undermine the same feeling of competence.

**P:** Show an interpretable achievement: “You understood this instruction without a written hint.” Keep support available, but record what support was used. A learner who asks for clarification has made a useful workplace choice, not necessarily failed a task. Assess that choice against the intended learning objective.

### 6.3 Autonomy and relatedness change the meaning of the same activity

Przybylski and colleagues' motivational model emphasizes competence, autonomy, and relatedness as useful lenses for understanding game engagement. These needs are not equivalent to three interface features. A choice can feel meaningless, a leaderboard can feel threatening, and a group can feel coercive. [R02]

Purpose Academy can offer choices of practice length, support format, or relevant scenario while preserving required learning outcomes. A learner might choose listening practice first or review an instructor-identified skill. Curriculum prerequisites should not disappear merely because free choice is motivating.

Relatedness can come from a trusted instructor, useful peer support, or a shared task. It does not require a global social feed. A private class goal can make contribution visible without exposing an individual's language difficulty. The strongest social design may be the existing classroom relationship made easier to sustain.

### 6.4 Reinforcement is a behavioral relationship, not a synonym for a reward graphic

In behavioral terms, a consequence is reinforcing if it increases the relevant behavior under specified conditions. A coin animation is a designed reward, but whether it reinforces behavior is an empirical question. Adding a pleasant consequence and removing an unpleasant condition are different arrangements; “negative reinforcement” does not mean punishment.

Response-based schedules and time-based schedules also differ. A reward after a fixed number of actions is not the same as a daily release. A variable-ratio arrangement is not the same as every game containing randomness. Ferster and Skinner's foundational work distinguishes schedules of reinforcement; applying those laboratory categories to a commercial game requires identifying the actual contingency. [R15]

| Visible device | What must be examined before explaining it |
|---|---|
| Points after an answer | Whether points, correctness information, or progress predicts later practice |
| A daily reward | Whether return is driven by time, a reminder, anticipated content, or reward availability |
| Random item drops | Whether probability varies per action and whether the item has instrumental value |
| A life lost on failure | Whether it discourages errors, creates waiting, or changes spending; these are different outcomes |
| A near-complete board | Whether continuation reflects a solvable plan, investment, frustration, or uncertainty |
| A helpful message | Whether it provides useful task information or merely praise |

The practical lesson is to specify the behavior and the consequence. “Use variable rewards because they are addictive” is not a sufficiently precise educational design requirement.

### 6.5 Randomness can support discovery without making evaluation arbitrary

At least four kinds of uncertainty matter:

1. **State uncertainty:** what pieces, cards, or obstacles appear next.
2. **Outcome uncertainty:** whether a chosen action will achieve a desired result.
3. **Reward uncertainty:** what extra item or bonus will follow.
4. **Knowledge uncertainty:** the player does not yet understand the rule, answer, or situation.

They have different design consequences. An authored physics puzzle can have no deliberate random state generation yet still be uncertain to a novice. A daily word can be deliberately selected and still be unknown to the player. A random selection of reviewed vocabulary can create variation without making the right answer random.

**P:** Permit bounded variation in scenario order, reviewed distractors, object examples, and optional celebratory art. Keep answer keys, evidence rules, content meaning, and assessment thresholds deterministic for the same approved item version. Do not randomly award or withhold academic credit. Do not select misleading distractors merely to manufacture suspense.

### 6.6 Dopamine claims need much more restraint than game commentary usually gives them

Schultz, Dayan, and Montague discuss dopaminergic activity in relation to reward predictions and changes in those predictions. This is important neuroscience, but it is not a measurement of a Candy Crush cascade, a Wordle solve, or a Purpose Academy learner. [R11]

The familiar temporal-difference expression `prediction_error = reward + discounted_expected_future_value - expected_current_value` is a computational illustration. It is not a formula that predicts an individual learner's pleasure, diagnoses addiction, or proves that surprise will improve retention. This report therefore does not prescribe dopamine targets, claim a universal neurochemical loop, or treat all repeated play as disordered behavior.

What can be designed directly is the experience: clear consequences, appropriate challenge, useful feedback, variety, and user control. What must be measured separately is how people use it and whether learning improves.

### 6.7 Near success and progress can motivate for several reasons

A nearly solved task can make the remaining action feel concrete. It may also trigger sunk investment or frustration. These explanations cannot be distinguished from a screenshot of a player retrying.

Clark and colleagues' near-miss research uses a gambling task. Its findings should not be presented as direct causal evidence about Angry Birds, Flappy Bird, or adult vocabulary learning. In a learning task, a genuine near success can contain useful diagnostic information; a manufactured near miss need not. [R12]

Nunes and Drèze's endowed-progress experiments show that perceived advancement can affect persistence in a consumer loyalty setting. That supports investigating how progress is framed, not falsifying a learner's competence. [R09]

**P:** Count legitimate early actions, such as an orientation or baseline attempt, toward an onboarding checklist. Keep that checklist separate from skill mastery. Show “3 of 5 practice steps completed” only when the steps really occurred. Never mark a skill 80 percent mastered merely to encourage completion.

### 6.8 Challenge and frustration must be diagnosed rather than guessed

“Easy to learn, hard to master” describes a useful possibility, not a validated difficulty curve. A challenging level can invite another attempt when failure is legible and improvement seems possible. The same difficulty can alienate a person whose effort is not producing an understandable result.

Separate at least five causes of failure:

- Lack of knowledge or memory.
- Misunderstood wording.
- Poorly distinguished images or answer options.
- Motor, device, or accessibility barriers.
- Ambiguous or incorrect content.

An adaptive system that sees only correctness may respond to all five by lowering the learner's apparent ability. That would be both analytically wrong and personally discouraging. Offer an item-report control, track asset failures, and allow instructor correction.

**P:** After two unsuccessful attempts on the same objective, change the instructional response: show a concise model, switch modality, or offer a supportive exit. Two attempts is a pilot setting. It is not a universal point at which a person becomes frustrated.

### 6.9 Sensory feedback can make causality tangible

**O and I:** In the corpus, popping, collapsing, clearing, merging, filling, growing, and moving supply visible evidence that an action changed the system. Audio and motion can emphasize when a result occurred and how large it was. They can also become distracting, infantilizing, or inaccessible.

For a learning app, semantic alignment matters more than spectacle. A correct audio-to-object choice might briefly outline the object while replaying the word if requested. A successful sentence might reveal its workplace use. A completed session can show which skill was practiced. Each effect should help a person understand the result.

**P:** Implement immediate selection acknowledgment, a distinct result state, concise explanation, and optional celebration. Make sound, vibration, motion, and auto-play configurable. Do not communicate correctness by color alone. Never play a decorative effect over an instruction the learner needs to hear. Accessibility requirements appear in Section 12.

### 6.10 Habit, reminders, and rituals are related but different

Lally and colleagues followed 96 volunteers practicing chosen daily eating, drinking, or activity behaviors for 12 weeks. Automaticity developed at different rates. This does not establish that an app streak creates a habit in a fixed number of days. [R10]

A habit is not merely a repeated action count. A daily challenge can be a planned ritual; a notification can be a cue; a streak can be a record or incentive. Each can help some people while burdening others.

**P:** Let the learner choose a realistic weekly practice target and an optional reminder time. A return after an absence should be easy: “Welcome back. Review three useful words.” Preserve earned records. Do not inflate overdue work until restarting feels impossible. Use a private consistency record rather than public missed-day penalties. A reminder is useful only if the next activity is worth doing and easy to reach.

## 7 What research says about learning and gamification

### 7.1 The evidence is promising and conditional

| Evidence | What it directly supports | Boundary relevant to Purpose Academy |
|---|---|---|
| Sailer and Homner meta-analysis [R03] | Gamification can improve measured learning-related outcomes across studied settings | Heterogeneous designs and populations; no guaranteed effect for this product |
| Mekler and colleagues experiment [R04] | Individual game elements can affect output without necessarily increasing intrinsic motivation | Image annotation is not adult workplace-language learning |
| Habgood and Ainsworth experiments [R05] | Integrating learning into gameplay can outperform separating game and learning in the studied system | Child mathematics game, not an adult construction program |
| Karpicke and Roediger retrieval study [R06] | Repeated retrieval can strengthen later vocabulary retention | Retention of paired words is not supervised task competence |
| Cepeda and colleagues spacing synthesis [R07] | Distributed practice matters, with timing related to the retention horizon | Does not validate one universal review timetable |
| Hattie and Timperley feedback synthesis [R13] | Feedback's content and function matter for learning | A sound, score, or generic compliment is not automatically useful feedback |
| Deci and colleagues reward meta-analysis [R14] | Reward effects depend on type and contingency; some arrangements can undermine intrinsic motivation | Does not justify a blanket ban on informative progress or game points |

Sailer and Homner reported standardized effects of about 0.49 for cognitive outcomes, 0.36 for motivational outcomes, and 0.25 for behavioral outcomes. The cognitive estimate pooled 19 studies with 1,686 participants; the other outcome groups have different study counts and samples. These are standardized differences, not percentage improvements, and should not be added together. The analysis supports careful experimentation, not a forecast that Purpose Academy will improve outcomes by 49 percent. [R03]

Mekler and colleagues examined points, levels, and leaderboards in an image annotation task. Their findings distinguish performance changes from changes in intrinsic motivation or perceived competence. A person doing more measurable activity is not proof that they care more about the subject. [R04]

In Habgood and Ainsworth's first study, 58 children played versions of a mathematics game under controlled time. A second study involved 16 children choosing between variants. The intrinsic version supported better learning in the first study and substantially more voluntary play in the second. The setting and small choice-study sample make its magnitude inappropriate as a business forecast; the more defensible lesson is to test whether the target skill is genuinely part of the game action. [R05]

### 7.2 The skill should determine the game action

A useful diagnostic question is: **Could someone succeed at the game while ignoring the learning content?**

If the answer is yes, the game is weakly coupled to learning. A learner might steer expertly and guess a word occasionally. Another might memorize answer positions without understanding. Decorative rewards can still have value, but they should not be mistaken for an instructional mechanism.

Examples of stronger integration:

- Listening to a request determines which tool to select.
- Understanding a short notice determines the correct next step.
- Constructing a clear phrase lets the learner request clarification.
- Matching a number with its unit completes a measurement communication task.
- Remembering a word without the original picture demonstrates a different evidence type from recognizing it.

These examples must be reviewed for language accuracy, ambiguity, and domain suitability. A tidy interface cannot rescue an inaccurate question.

### 7.3 Retrieval and spacing serve different functions

Retrieval asks the learner to produce or select remembered information rather than simply re-expose them to it. Spacing schedules opportunities across time. An item can be repeatedly shown without requiring retrieval, and retrieval can be massed into one sitting without adequate spacing. [R06, R07]

Purpose Academy should initially support recognition, then check listening comprehension and increasingly independent recall or use. Change the image, position, or wording where appropriate so a learner cannot succeed only by remembering the screen. Preserve comparability when measuring outcomes: a harder variant is not interchangeable with the original unless its difficulty and intended evidence are understood.

An immediate successful retry after showing the answer is valuable supported practice. It is weak evidence of durable independent recall. Store it accordingly and schedule a later check. The delayed check must occur before the answer or hint is shown, or the measurement is contaminated.

### 7.4 Productive learning can look worse on shallow metrics

A learner completing a difficult, useful recall task may answer fewer questions than one repeating easy recognition items. A good explanation may lengthen a session. A person who already knows the material may need less app time. An accessible untimed mode may produce slower responses with better understanding.

The app should therefore avoid using speed, raw accuracy, or completed-question counts as a universal ability score. Compare like tasks, track assistance, and examine delayed outcomes. A feature can increase engagement while degrading the mix of practice. The evaluation plan in Section 14 is designed to catch that possibility.

## 8 Acquisition and social engineering beyond the game screen

Here, social engineering means intentional shaping of participation and social behavior through product design. It does not imply deception, secret government access, or a coordinated manipulation campaign. No such explanation is needed to account for the documented mechanics.

### 8.1 The acquisition funnel

A clean analytical funnel is:

```text
exposure -> an accurate expectation -> opening or installing
-> a successful first attempt -> a useful result -> a reason to return
```

Each transition can fail independently. A memorable video can attract people who do not enjoy the actual game. A strong game can receive little discovery. A person can enjoy one session without returning. A retained audience can remain commercially unprofitable if acquisition or operations cost too much.

#### Demonstrability

Physics collapses, falling pieces, a moving runner, and a filled glass can communicate a challenge visually. **I:** A viewer can mentally simulate a choice and want to try it. This can support previews, creator videos, playable demonstrations, and direct recommendations. It does not prove the same advertising strategy caused every game's growth.

**P:** Show a real Purpose Academy activity: hear a short instruction, choose the matching object, see a useful explanation. Avoid an exciting advertisement for an experience the application does not deliver. For partners and funders, show the learner benefit and the limits of the evidence, not only a colorful screen.

#### Distribution context

Angry Birds emerged in an early touchscreen app market; Candy Crush used Facebook and a multiplatform journey; Temple Run's founders describe free distribution and social high-score conversation; Wordle spread through shared daily participation. These are different routes involving timing, platforms, audience expectations, and execution. Copying their visual style would not recreate that context. [G01a, G05b, G09a, G21]

App stores, advertising networks, publishers, social platforms, creators, partnerships, and existing brands can supply distribution. Their role is not evidence that every successful game used the same channel or received the same support. Detailed paid-acquisition attribution and spend are mostly unknown in this review.

### 8.2 Distinguish four social mechanisms

| Mechanism | Example in the corpus | What carries the return cue | Purpose Academy use |
|---|---|---|---|
| Conversation | Wordle or personal arcade records | A shared topic and a recognizable result | Optional weekly challenge discussion |
| Reciprocity | Words With Friends | Another person's actual turn | Optional paired practice with asynchronous completion |
| Instrumental help | Candy Crush, Royal Match, Toon Blast | A requested or given resource | Share reviewed learning support, without rationing practice |
| Trading or retaliation | Coin Master and collection economies | A resource dependency or consequential interaction | Prefer cooperative task support; avoid academic loss or coercive dependency |

A game can be socially popular without having network effects in the strict sense. Ordinary word of mouth improves discovery. A network effect means the product's value changes with participation by others. A puzzle may remain useful alone; an opponent game requires someone or something to take the other role. This distinction determines whether social infrastructure is essential or optional.

### 8.3 Social proof and comparison have different effects on different people

A visible peer achievement can make an activity seem approachable. It can also make someone feel behind. A global ranking can reward time availability or prior knowledge more than useful learning. For adults building confidence in a new language, public difficulty can carry a personal cost that a casual arcade comparison does not.

**P:** Default to private personal progress, optional small-group cooperation, and instructor encouragement. If competition is tested, match the skill and conditions, provide an equally valued noncompetitive route, and avoid employment-facing rankings. Never describe a public league as an assessment of job readiness.

### 8.4 Virality is an outcome to measure

A rough referral model can use `K = invitations per activated learner × new activations per invitation`. That identity is a diagnostic abstraction, not a forecast. Definitions, attribution windows, duplicate invitations, overlap, and recipient consent affect its usefulness. More invitations can coexist with poorer trust or lower learning quality.

Purpose Academy's plausible initial distribution advantage is its educational context: instructors, existing learners, trusted organizations, and demonstrations linked to useful tasks. Partner channels and permissions still need to be established. Do not assume the consumer-game viral model fits a small adult-training pilot.

## 9 Monetization and operations are separate systems

### 9.1 What a visible economy can do

Commercial casual games can connect scarcity, upgrades, additional attempts, content, cosmetics, subscriptions, advertising, or collection to revenue. The original paid Angry Birds, advertisement-supported Flappy Bird, free-to-play puzzle economies, and current subscription variants demonstrate that there is no single required business model. Historical and contemporary editions should not be collapsed. [G05a, G13, G01b, G14]

Three broad models illustrate different incentives:

- **Advertising:** enough valuable impressions to cover acquisition and operations. Aggressive interruptions can undermine the core experience.
- **In-app purchases:** a smaller purchasing audience can support a larger free audience. Convenience, progression, cosmetics, or resources can have different consequences.
- **Paid access or subscription:** users or institutions pay for access, a collection, or a continuing service. This changes the tradeoff around interruptions and rationing.

An illustrative advertising identity is `ad revenue = qualified impressions / 1000 × effective CPM`. An illustrative purchase model is `purchase revenue = active users × payer fraction × average spend per payer`, over a clearly defined period. Net contribution must also account for platform charges, refunds, advertising spend, hosting, content, support, staffing, and other relevant costs. No benchmark values are assumed.

### 9.2 Why access friction should not become Purpose Academy's revenue strategy

Purpose Academy's current plan proposes no learner tuition for its construction pilot; funding is not established by this report. That context argues for evaluating partner, program, or institutional support rather than putting paid lives between a learner and required practice. [PA1]

The commercial objective must fit the educational relationship. Do not sell mastery, charge for correction of an app error, require advertisements to access an explanation, or offer paid bypasses of required practical verification. These are product requirements for the proposed educational design, not assertions that every casual game has equivalent harms.

### 9.3 The content and service operation behind the loop

An ongoing product needs more than its central mechanic: reliable content creation, difficulty review, instrumentation, technical maintenance, customer support, versioning, accessibility work, and a release process. Events and new worlds can create reasons to return but also introduce a recurring production commitment.

Purpose Academy should fund human review of images, audio, translations, distractors, scenarios, and assessments before investing in a large live-event system. The current vocabulary framework explicitly treats source banks as raw materials requiring quality review. Its reported out-of-domain Community entries are a concrete reminder that imported content should not be automatically published. [PA2]

A later operating example is Hungry Studio's announcement that it ran more than 10,000 Block Blast experiments during 2025. This is a developer-reported figure, not an independently audited count or a target for a small learning pilot. Its useful implication is that a simple-looking game can sit above a substantial iteration operation. It does not establish that every test was independent, well-powered, or causally responsible for the reported audience. [O01]

## 10 Counterexamples and unsuccessful transfers

### 10.1 Successful cases that contradict simplistic rules

| Proposed universal rule | Counterexample | Better conclusion |
|---|---|---|
| A game must offer endless play | Wordle | A finite daily challenge can support return and conversation |
| Permanent upgrades are necessary | Original Flappy Bird, classic Tetris, original 2048 | Personal skill and records can sustain a core activity |
| A user must react quickly | Wordscapes, original 2048, idle cores | Planning, language, and anticipation can supply interest |
| Social obligations are essential | Many standalone puzzle and arcade cores | Social systems are one architecture, not a prerequisite |
| Random outcomes are necessary | Authored physics and drawing puzzles | Uncertain understanding can be enough without deliberate random state generation |
| Free access is the only viable start | Historical paid mobile hits | Price interacts with audience, distribution, timing, and perceived value |
| Punishing failure is necessary | Low-pressure care and production experiences | Care, ownership, and routine can support play without repeated run failure |
| More sensory activity is always better | Deliberate spatial and word puzzles | Readability and coherence matter more than sheer intensity |

These are counterexamples to necessity claims, not proof that the opposite strategy is always superior.

### 10.2 Historical discontinuation cases

Supercell announced the closure or ending of development of Hay Day Pop, Clash Quest, and Everdale in separate historical notices. Its public explanation in each concerned the product not meeting its standards or ambitions. Familiar brands, strong production capability, recognizable genres, and engaged communities were not enough to secure continuation under those standards. [F01, F02, F03]

Hay Day Pop is especially useful as a challenge to the idea that combining puzzles with an established farm brand guarantees a durable product. Clash Quest demonstrates that iteration and an existing franchise do not eliminate product risk. Everdale challenges the idea that a persistent cooperative world is sufficient. This report does not infer private retention numbers, profitability, or a single causal failure mechanism from the announcements. Everdale's later IP transfer also means its 2022 notice is not a statement about every later project bearing the name.

All three notices come from one publisher with unusually high selection standards. They are a limited negative comparison set, not a representative sample of failed games. A stronger industry study would add matched releases from other publishers and comparable acquisition, retention, and cost data. That evidence is not available here.

### 10.3 What this means for reverse engineering

Reverse engineer the **relationship between action, feedback, challenge, and user purpose**. Do not assume that a feature inventory recreates a successful system. Visual style, item rarity, countdowns, and maps interact with audience, timing, distribution, content quality, and many unobserved choices.

The design should be falsifiable: specify what improvement a mechanic is supposed to create, which observation would contradict that claim, and what change follows. If a map increases taps while delayed recall worsens, the map has not yet earned its place in the educational product.

## 11 Purpose Academy product strategy

### 11.1 The learner and the actual job to be done

The working audience is adults learning practical workplace English, including people around the CLB 4 range described in the project context. This is a design assumption to verify at intake, not a declaration that all users have the same skills. Listening, speaking, reading, writing, technical knowledge, literacy, digital confidence, and motor access can differ within one person.

The existing plan prioritizes a construction pilot and connects language to supervised tasks. The vocabulary framework separates recognition, recall, understanding instructions, and practical application. CCLB's workplace Can Do Statements provide a useful framework for observable language tasks, but an internal app score is not an official CLB assessment. [PA1, PA2, T03]

Design around a concrete learner goal such as “I want to understand a request and ask a useful question when I am unsure.” That is more meaningful than “I want to collect 100 language coins.” Use plain English and dignified adult visuals. Avoid assuming that limited English means limited professional experience or reasoning ability.

### 11.2 Two linked loops

**The engagement loop:** choose a useful task, act, see an understandable result, receive an appropriate next option, and stop or continue voluntarily.

**The learning loop:** encounter an approved concept, practice it with support, retrieve it under specified conditions, revisit it later, apply it in a changed context, and obtain human verification where required.

The loops must support each other. A cosmetic animation may improve the engagement loop without adding evidence to the learning loop. A practical demonstration can add essential evidence without being playable on a phone. Store both honestly rather than compressing everything into one score.

### 11.3 The proposed home screen

Prioritize one recommended action: “Review three words for today's task.” Show the expected effort as a rough estimate, the last meaningful activity, and a visible resume control. Keep the task map, personal progress, and instructor messages accessible without competing for initial attention.

Do not fill the first screen with currencies, promotions, leagues, calendar penalties, collection alerts, and several different calls to action. Modern casual games may accumulate these features after years of operation; copying the accumulated surface is different from understanding the core.

Use a short orientation only when it changes what the person must do. Introduce audio replay at the moment it is useful. Delay optional social and customization features until the core has value. Required identity and program requirements should be handled transparently; an anonymous demonstration can be available where the deployment permits it, without treating anonymous activity as verified program participation.

### 11.4 A first session to prototype

All durations below are design estimates to test on representative devices and with actual learners.

| Step | Learner experience | Learning or product purpose |
|---|---|---|
| 1 | Choose construction practice or a clearly labeled demonstration | Establish relevance without a long registration funnel |
| 2 | See a reviewed image, hear its English label, and read a short meaning | Provide initial instruction |
| 3 | Select the matching image or phrase | Teach the interaction and check supported recognition |
| 4 | Receive a brief explanation and an optional replay | Make the result understandable |
| 5 | Complete a second, related task with less cueing | Begin distinguishing learning from interface familiarity |
| 6 | See an honest session summary and a choice to stop | Close the loop and establish trust |

Target roughly one to three minutes for this orientation slice, without a countdown. A familiar user should reach the first useful action much faster. A person who needs more time should receive it. Avoid labeling a first-session success as durable mastery.

### 11.5 A repeat session to prototype

Offer a default three-to-five-minute activity, with shorter and longer choices. Construct the session around due review, an instructor-linked task, and a small amount of new material. A possible eight-item composition is four due reviews, two new or recently taught concepts, one instruction task, and one transfer variant. This is a starting hypothesis, not a fixed research-backed ratio.

If due reviews exceed the selected session length, prioritize important items and offer a later session. Do not display a frightening backlog or punish absence. If there is no due material, use useful maintenance or new content rather than inventing urgency.

End with specific feedback: “You recognized these tools. We will check two words again later.” Include “Finish for now” and an optional next action. Avoid automatically launching another activity after a short countdown.

## 12 The activity portfolio

### 12.1 Activity A Visual and audio match

**Purpose:** connect a reviewed object or action with its English meaning or sound. Inspired by the readable local actions of matching games, without relying on random academic rewards.

**Interaction:** present one prompt with a small set of clearly distinguished options. In a listening item, audio is the primary prompt. A learner selects an option, confirms if needed, and sees feedback. Use keyboard and single-tap alternatives to any dragging.

**After an error:** acknowledge the selection without a harsh failure effect; identify the correct concept; give one useful distinction; offer replay or a new example. Do not shuffle the answers while the learner is reading the explanation. An immediate retry is practice, not a new independent test.

**Evidence:** supported recognition or listening discrimination, linked to the exact item and asset versions. It does not demonstrate free recall, pronunciation, or physical use.

**Failure modes:** answer-position memory; choosing by color; an image that contains the written answer; two visually plausible options; an audio mismatch; and alternative text that unintentionally changes the tested construct. Reviewed assets and alternative accessible task forms are required.

### 12.2 Activity B Phrase construction and clarification

**Purpose:** understand or construct a useful workplace phrase, including asking for repetition or clarification.

**Interaction:** arrange a few phrase elements or select a meaningful response to a short request. A drag interaction should also support selecting a token and then selecting its destination. Provide a read-back control. Keep grammatical construction separate from workplace appropriateness where possible.

**Illustrative phrase:** “Could you say that again, please?” This is a demonstration of a learning objective, not a fully reviewed multilingual lesson.

**Evidence:** record whether the learner recognized a phrase, assembled it with given tokens, typed it, or produced it orally. These are different forms of evidence. Accept multiple reviewed correct phrasings where the task permits them. Do not rely solely on exact-string matching for open natural language.

**Failure modes:** a token puzzle solvable by grammar without understanding; unnecessary vocabulary complexity; alternate correct answers marked wrong; and speech recognition treating accent or recording quality as lack of competence.

### 12.3 Activity C Instruction and scenario choice

**Purpose:** connect language to a described situation and a useful next step.

**Interaction:** show a short workplace context, provide a clear instruction in the intended modality, and ask for a response or next action. Pause the visual setting while the learner listens or reads. Show why an answer fits the instruction.

**Example structure:** an instructor requests a measurement with a unit; the learner selects a clear confirmation response. A later variant changes the number, unit, image, or speaker while preserving the learning objective. Any technical scenario requires domain review before release.

**Evidence:** contextual comprehension under the recorded conditions. It does not authorize independent operation of tools, equipment, or hazardous procedures.

**Failure modes:** using common sense to bypass the target language; embedding several unknown skills in one question; treating one appropriate action as the only possible answer; and generated safety advice that was never reviewed.

### 12.4 Activity D Finite fluency route

**Purpose:** practice already introduced material in a sequence with visible progression. Inspired by runners' sense of movement, but designed to keep the learning task central.

**Interaction:** progress through six to ten stationary checkpoints. Each checkpoint contains one learning action. Answering advances a route marker. Errors trigger support and a later reviewed variation; they do not erase the route or remove access.

**Timing:** untimed by default. An optional paced mode can be tested only for appropriate, already-established fluency objectives. It must pause between prompts, allow exit, and have no bearing on required practical verification. Device latency and approved accommodations must not be interpreted as low ability.

**Evidence:** individual attempt records remain primary. Route distance is a presentation variable, not a competency measure.

**Failure modes:** decorative movement competing with comprehension; speed becoming the de facto success measure; repeating easy items to advance; and a route that cannot be finished within the chosen session length.

### 12.5 Activity E Weekly shared challenge

**Purpose:** create a bounded, useful occasion for practice and conversation, inspired by daily puzzle rituals.

Use reviewed content and appropriate difficulty options. Allow completion privately and later access to explanations. Sharing should be deliberate and reveal only what the learner selects. A share card might say which topic was practiced, with no employer-facing ability rank and no personal difficulty history.

If a class comparison is tested, use comparable tasks and access conditions. A weekly challenge should not be the only route to essential content or a way to make people lose progress when their schedules change.

### 12.6 Progress map and rewards

Organize the map around tasks, not arbitrary alphabetical word numbers. In a construction slice, a path could connect recognizing tools, understanding a short request, confirming a measurement, and asking for clarification. Instructors should review prerequisites. The path must allow review of earlier material and appropriate challenge for experienced learners.

Use explicit statuses such as “Introduced,” “Practiced with support,” “Recalled later,” “Applied in a scenario,” and “Observed by an instructor.” A game reward can acknowledge an event without claiming the last status.

If an optional visual project is tested, add a clearly labeled piece after a defined meaningful activity. Do not describe a partly completed building as proof that a learner can construct it. Do not let decorations, purchased items, or raw repetition satisfy academic criteria.

For the MVP, no coin shop, prestige reset, battle pass, public league, paid booster, mystery chest, or learner-to-learner attack system is needed. These add complexity before the instructional loop has been validated. They are deferred implementation choices, not a judgment that every corresponding commercial mechanic is ineffective.

### 12.7 Accessibility and adult dignity

The current plan targets WCAG 2.2 AA. Implement and verify applicable requirements, including keyboard operation, visible focus, adequate contrast, useful labels, and alternatives to dragging. WCAG criteria have different conformance levels; reduced interaction animation is a useful product choice even where a particular criterion is beyond AA. Do not claim compliance from a feature list alone. [T01, T02]

Use large practical touch targets, generous spacing, readable text, captions, adjustable audio, and optional reduced motion. A 44-to-48 CSS-pixel touch target can be a product target; it is not the wording of WCAG 2.2's 24 CSS-pixel AA minimum criterion with its exceptions. Test on the actual devices and native accessibility systems if the app is not web-based.

An accommodation is not automatically a hint. A screen reader, larger text, or alternative input may simply make the task accessible. A transcript can change what a listening-only item measures, so record the task form and support policy. Provide an equivalent accessible task where feasible and label evidence honestly. Do not hide useful alternative text to preserve a nominally identical quiz score.

Choose adult-appropriate photographs and illustrations, with qualified review of the depicted objects, actions, and safety context. Offer muted and low-stimulation settings without reducing credit. Do not infer disability, motivation, or intelligence from response speed or device behavior.

## 13 Engineering and content requirements for Cursor

The existing repository and technology stack were not inspected for this report. The architecture is framework-neutral. Cursor should first inspect the current project and adapt the proposal to its existing design, storage, authentication, and deployment conventions. This report does not authorize rebuilding the whole app.

### 13.1 Separate the systems that have different meanings

| System | Owns | Must not own |
|---|---|---|
| Content registry | Approved item, asset, translation, and rubric versions | A learner's achieved competence |
| Activity engine | Prompt presentation, accessible controls, feedback, local session state | Final academic certification |
| Evidence service | Immutable attempts, conditions, evaluations, assessor records | Decorative reward choices |
| Review scheduler | Due practice suggestions and learning-stage transitions | Practical certification authority |
| Progress presentation | Task map and interpretable summaries | Invented mastery percentages |
| Cosmetic rewards | Optional acknowledgments and visual projects | Access to required practice or passing standards |
| Instructor tools | Review, assignment, observation, correction, and support | Unrestricted access to unrelated personal data |
| Analytics | Defined product and learning indicators | Silent repurposing of sensitive learner information |

This separation makes accidental overclaiming harder. It also permits one activity style to change without rewriting the learner's evidence history.

### 13.2 The content object

Each learning object needs a stable identifier, version, stream, concept, learning objective, target evidence type, prompt, answer or rubric, reviewed feedback, relevant assets, language metadata, safety classification, provenance, and approval status. The supplied schema illustrates these relationships; it does not include a complete curriculum.

The release gate should reject a draft object, an unreviewed translation, a missing required asset, an ambiguous answer set, or safety-critical material lacking qualified review. Human approval needs identity, scope, and timestamp. When content changes, preserve the old version for interpretation of earlier attempts. Do not silently reinterpret a historical score with today's answer key.

Use explicit asset references and asset hashes or immutable versions. A file named `hammer.jpg` is not sufficient evidence that the image shows the correct tool. Validate image meaning, audio pronunciation, captions, technical context, and rights to use the asset. Actual bytes, playable audio, and rendering require checks beyond JSON validation.

The supplied examples are English-only drafts for development. They deliberately lack production assets and approvals. They should be available in a development fixture route and blocked from production publication. The report does not claim their translations are verified or that they are complete teaching materials.

### 13.3 The attempt and evidence record

At minimum store:

```text
attempt_id and idempotency_key
learner_id under the product's access policy
session_id and activity_id
item_id and item_version
concept_id, evidence_dimension, and task_form
prompt_presented_at, submitted_at, and active_response_duration
response or a limited reference to permitted response data
correctness or rubric result and evaluator_version
answer_revealed_before_submission
support events and approved accommodation flags
prior exposure and same-session retry relationship
device/asset failure flags
content and scheduler versions
client sequence, server receipt time, and sync status
```

Do not put raw voice recordings, full free-text responses, legal names, or support needs into general analytics events by default. An assessed recording, if needed, belongs in a controlled evidence process with a defined purpose, access, retention, and deletion policy. Privacy and program obligations need project-specific review rather than assumptions in generated code.

### 13.4 A session state machine

Use explicit states:

```text
ready -> loading_item -> presenting -> awaiting_response
-> evaluating -> feedback -> next_item_or_summary
```

Allow `paused` from appropriate states and `recoverable_error` from loading or evaluation. A terminal `completed` state ends the session. Backgrounding should pause active timing, preserve the current stable state, and avoid duplicate submissions on return. A loading failure is not a wrong answer. A stale content version should produce a recoverable refresh path, not a lost record.

Feedback and answer reveal need their own state. Do not expose the answer to the client-side accessibility tree or visible UI before an intended assessment response through a hidden feedback panel. This does not require concealing legitimate accessible prompt information. If the entire answer key is client-side for offline practice, treat the task as low-stakes practice and do not claim the environment is tamper-proof.

### 13.5 Learning stages and practical verification

Keep a vector of evidence rather than one universal score:

```text
concept evidence:
    visual recognition
    listening comprehension
    cued or independent recall
    contextual language use
    practical observation where the curriculum requires it
```

Each dimension can have a stage such as `unseen`, `introduced`, `supported_practice`, `provisional_independent`, `retained_on_delayed_check`, and `review_due`. A practical observation additionally requires an authorized assessor, rubric, conditions, date, result, and relevant scope. It cannot be generated by the game engine.

A useful provisional rule is:

1. An introduction or answer reveal permits supported practice.
2. A correct same-session retry is recorded as supported success.
3. An eligible unhinted success can make that dimension provisional.
4. A later eligible check on another item form, after an appropriate interval, can establish retained evidence for that dimension.
5. A due date passing changes the review recommendation; it does not erase historical evidence or revoke a practical observation.
6. New failures should trigger targeted support and a new check rather than an automatic global failure label.

The exact interval and evidence threshold must be reviewed by the curriculum team. Never interpret an arbitrary stage as a calibrated probability of competence.

### 13.6 Review scheduling without false precision

For a small pilot, a transparent scheduler can be preferable to a complex opaque model. Start with reviewed stage intervals such as same-session supported practice, one day, three days, seven days, and fourteen days, then adjust using actual performance. These are candidate defaults, not intervals established by the spacing literature for this exact content and audience.

Maintain separate schedules for different evidence dimensions. A person may recognize a word but need more listening practice. Prioritize critical curriculum requirements and instructor assignments, while keeping the number of due items manageable.

An illustrative eligible-review selection procedure is:

```text
eligible_items = published items in the learner's assigned stream
exclude items with missing assets, withdrawn approval, or unmet prerequisites
create candidates for due evidence dimensions and assigned objectives
prioritize important overdue reviews without unbounded backlog penalties
avoid repeating the identical item form immediately
mix due practice with a small amount of useful new or transfer material
truncate to the chosen session budget
```

Evaluate an attempt for evidence before allowing it to advance a learning stage:

```text
eligible_independent_evidence =
    content version is approved
    AND evaluation completed successfully
    AND no invalidating asset or delivery failure occurred
    AND response preceded answer reveal
    AND support was allowed by the task's evidence policy
    AND this is not a disclosed-answer retry posing as a new test
```

Correctness is necessary for an eligible success but not the only requirement. Approved accommodations do not automatically invalidate evidence. Store why an attempt is ineligible rather than silently dropping it.

### 13.7 Assistance and adaptive challenge

Start with explainable changes: fewer plausible options during instruction, replayable audio, a worked example, a clearer image, or a return to an earlier component skill. Remove supports deliberately when checking the intended dimension. Keep the standard stable and change the teaching support, not the definition of a correct answer.

Do not use a single response-time threshold to decide someone knows a word. Network delays, accessibility tools, device age, interruptions, and careful reading affect timing. Do not infer a support language from ethnicity or a diagnosis from usage patterns. Give learners and instructors explicit controls.

For critical items, repeated mistakes should appear in an instructor support view. Keep that view supportive and contextual, with the actual item, conditions, and recent attempts. A flagged support need is not a public ranking.

### 13.8 Offline operation and synchronization

Where offline practice is supported, cache approved versioned content and necessary assets, store completed attempts in an append-only local queue, and synchronize with stable IDs. Network recovery, double taps, retries, and device restoration must not duplicate credit.

Choose a server-authoritative evaluation path for high-stakes evidence and assessor records. Offline client activity can be labeled pending until validated under the relevant policy. Persist provisional practice without misrepresenting it as an instructor-approved result.

Use explicit conflict handling: item revisions do not overwrite old attempts; an instructor correction creates an auditable correction record; two devices submitting the same idempotency key create one accepted attempt. Client clocks can drift, so retain both client occurrence time and server receipt time. Define trusted time rules before using elapsed intervals for retained-evidence decisions.

### 13.9 Performance and feedback tuning

Suggested prototype budgets are prompt selection acknowledgment around 100 milliseconds when locally possible, a brief result animation around 150–400 milliseconds, and a skippable session celebration under roughly one second. These are engineering targets to test, not findings about an optimal psychological reward timing. Never delay a necessary explanation to finish an animation.

Preload likely audio and images within reasonable data and memory limits. Test on a lower-end phone and constrained network. Measure asset load failures, background recovery, and responsiveness. Decorative effects should degrade before core controls, text, or audio replay. An app that is delightful only on a high-end development device has not met this audience's needs.

### 13.10 Content production workflow

Use the following release pipeline:

1. Preserve the raw source and provenance.
2. Deduplicate concepts while retaining aliases and source links.
3. Assign stream, practical task, and learning objective.
4. Write plain English meaning, prompt, expected answer, and feedback.
5. Select and verify visual and audio assets.
6. Obtain language and domain review, including qualified safety review where required.
7. Review each translation and audio language pairing independently.
8. Validate structure, references, assets, alternate correct answers, and accessible task forms.
9. Pilot with learners and instructors, then revise.
10. Publish an immutable version and monitor item reports.

Changing a translation is a new reviewed content revision. Imported slides, scanned word lists, and generated text must not bypass the gate. Do not count an item as production-ready just because a model returned valid JSON.

## 14 Measurement and evaluation

### 14.1 A proposed primary outcome

Use **weekly verified retained objectives per active learner**, reported with its exact definition and underlying counts. For the pilot, an objective counts only after an eligible delayed check, with the required task form and any separately required human verification. A language-only objective can count as retained language evidence; it must not be relabeled practical competence.

This is a proposed operating measure, not an established industry standard. Pair it with overall cohort completion, coverage of required objectives, time spent, and accessibility. An active-learner denominator can hide disengagement if used alone, so also report outcomes for everyone assigned the module.

### 14.2 Keep the metric families separate

| Family | Example | Why it matters | Interpretation limit |
|---|---|---|---|
| Activation | First useful activity completed | Reveals starting friction | Can be high for trivial tasks |
| Engagement | Voluntary repeat practice | Indicates continuing value or pressure | Does not establish learning |
| Practice quality | Eligible independent attempts by dimension | Shows what the learner actually did | Depends on item validity |
| Retention | Correct delayed checks before hints | Tests remembered material | Does not by itself establish transfer |
| Transfer | Performance on a new reviewed scenario | Tests application beyond the exact screen | Scenario scope remains limited |
| Practical evidence | Assessor-scored demonstration | Supports defined real-task judgments | Requires credible rubric and conditions |
| Experience | Ease, confidence, pressure, and ability to stop | Detects barriers and coercion | Self-report is useful but imperfect |
| Reliability | Crash, load failure, and sync rates | Makes outcomes interpretable | Good performance is not instruction quality |
| Equity | Access and outcomes by relevant conditions | Helps identify avoidable barriers | Small groups need privacy protection and cautious interpretation |
| Operating cost | Review and support effort per retained objective | Tests sustainability | Early prototype costs are not steady-state costs |

Do not merge these into a single opaque engagement score.

### 14.3 Define retention denominators explicitly

For exact-day product retention, define a cohort by first useful activity on a local calendar day. Day-one retention is the fraction of that cohort performing a predefined meaningful action on the next local calendar day. Day-seven retention uses that specific seventh day. Rolling retention uses a different window and must be labeled differently.

For Purpose Academy, weekly attendance patterns may make weekly useful-practice measures more informative than daily app use. Record the learner's configured timezone and avoid treating midnight boundaries as universal. An app open, a background sync, and an answered item are different events. Use the chosen definition consistently.

For delayed learning retention, record the exact delay, item relationship, prior exposures, modality, and assistance. Product day-seven retention and remembering a word after seven days are different measurements.

### 14.4 Minimal analytics events

```text
session_started
item_presented
response_submitted
attempt_evaluated
support_used
item_reported
session_paused
session_resumed
session_completed
review_scheduled
delayed_check_completed
scenario_check_completed
assessor_record_created
sync_failed_or_recovered
```

Use pseudonymous identifiers, content versions, task form, evidence dimension, support flags, and required timing fields. Define which service emits each event so client and server reports do not double-count one action. Keep analytics delivery separate from academic evidence storage: losing an analytics event must not lose an assessment record.

### 14.5 A small-pilot evaluation sequence

The current plan's 32-person pilot is too small to treat tiny differences between numerous variants as reliable winners. It can support formative discovery, descriptive outcomes, and carefully scoped experiments. [PA1]

**Stage one — usability and content validity.** Observe approximately six to eight representative learners as a formative starting point, with instructors reviewing the content. Include different digital confidence, literacy, device, and accessibility conditions. Do not treat six interviews as saturation or a population estimate. Record where people misunderstand controls, content, audio, and feedback. Fix invalid questions before comparing engagement.

**Stage two — a narrow instructional comparison.** Compare a plain, accessible practice presentation with one game treatment while holding curriculum, review schedule, intended evidence, and time opportunity as constant as possible. Use comparable item sets and random assignment or counterbalanced order where feasible. Keep equivalent instruction available to everyone.

Within-person comparisons can reduce some between-person variability, but learning carries over. A person cannot unlearn a word for the second condition. Use matched item sets, balance which set receives which presentation, and avoid treating the same exposed answer as a fresh control. Class discussion, instructor differences, and repeated testing can contaminate comparisons; record them.

**Stage three — delayed checks and transfer.** Run the same predefined delayed outcomes for both conditions, before showing answers or reminders that reveal them. Use novel reviewed forms for transfer. A seven-day check is a reasonable candidate pilot endpoint, with an additional later check if the program can support it; it is not inherently the correct endpoint for every skill.

**Stage four — judge usefulness and cost.** Examine learning outcomes, completion, experience, access barriers, and staff effort together. Report raw counts, uncertainty, attrition, and missing data. A missing delayed check is missing evidence; it is neither automatically a wrong answer nor evidence of retention. If losses differ by condition, the comparison may be biased.

**Stage five — extend only after revision.** A larger evaluation needs adequate planning for the expected effect, repeated measures, clustering, and outcome variability. Do not choose a sample size solely from an arbitrary significance rule, and do not manufacture statistical confidence from a small exploratory pilot.

### 14.6 Prioritized hypotheses

| ID | Hypothesis | Treatment to isolate | Primary evidence | Reason to revise or remove |
|---|---|---|---|---|
| H1 | Clearer first-action teaching improves starting | Contextual example versus longer introduction | First useful completion and observed comprehension | More completion but poorer understanding |
| H2 | Semantically aligned feedback improves later performance | Specific explanation versus correctness only | Delayed check on comparable material | Extra time with no useful improvement |
| H3 | A task map makes practice feel relevant | Task-linked progress versus neutral list | Voluntary return plus retained objectives | More navigation or pressure without learning benefit |
| H4 | Finite routes support useful completion | Stationary checkpoint route versus plain sequence | Equivalent-content completion and retention | Distraction, speed bias, or lower retention |
| H5 | Independent delayed checks reveal false fluency | Recognition-only tracking versus additional recall checks | Differences across evidence dimensions | Data too sparse or task forms invalid |
| H6 | Private cooperative goals support participation | Optional class contribution versus personal progress alone | Useful practice, experience, and access | Social pressure or hidden exclusion |

Start with H1 and H2. A different effect animation is not the highest-value research question while the content or teaching flow remains uncertain.

### 14.7 Precommit practical decisions

Before a comparison begins, write down the primary outcome, acceptable burden, review interval, data exclusions, and what would count as a meaningful improvement for the program. Do not decide these after seeing whichever metric improved. A feature that reduces accessibility or creates false academic claims should be corrected even if aggregate app retention rises.

## 15 Implementation sequence and acceptance gates

### Phase zero Content and repository audit

Inspect the actual project. Identify the implemented stack, authentication, data model, content import paths, accessibility gaps, and existing test conventions. Review the construction module and choose a small vertical slice. Confirm who can approve language, domain content, and practical assessment records. Preserve existing work.

**Exit evidence:** a documented current-state map, a reviewed objective list, explicit content provenance, and a selected prototype scope. Unknown infrastructure remains marked unknown.

### Phase one The learning engine

Implement versioned content loading, approval checks, one accessible recognition or listening activity, specific feedback, immutable attempts, session resume, and a small review scheduler. Give instructors a simple way to inspect item problems and evidence. Keep game rewards separate from learning stages.

**Exit evidence:** approved content alone can be published; missing assets cannot masquerade as wrong answers; answer-revealed retries do not count as independent recall; duplicate submissions produce one accepted attempt; offline records synchronize under the defined policy.

### Phase two A meaningful game presentation

Add the task map and one finite route or visual project. Preserve an accessible equivalent path. Add phrase or instruction practice when approved items exist. Evaluate whether presentation helps completion and later learning under comparable exposure.

**Exit evidence:** learners understand the progress display, can stop and resume, and retain at least as much useful information under the chosen evaluation. The exact evidence threshold should be set before the comparison.

### Phase three Delayed evidence and instructor workflow

Add transfer variants, dimension-specific summaries, authorized assessor records, and a supported review process for errors and content withdrawal. Display the difference between app practice, retained language evidence, and practical observation.

**Exit evidence:** no game action can generate an instructor observation; content revisions preserve earlier evidence; corrections are auditable; reports state conditions and limits.

### Phase four Optional social and operating expansion

Only after the core is useful, consider a shared weekly challenge or private group goals. Expand to Logistics and Community Support after separate curriculum review. Budget content and support operations. Choose monetization and partner access arrangements that fit the program.

**Exit evidence:** social participation is optional, essential practice remains available, small-group data are protected, and expansion does not bypass content approval.

## 16 What the report cannot establish

The report does not recover private source code, current A/B test allocations, personalized offer algorithms, complete random-generation distributions, exact acquisition spend, internal retention cohorts, or proprietary profit margins for the games. It does not establish that particular companies intentionally manipulate an individual player's losses or that a universal addiction mechanism caused their success.

The 36-case comparison is broad but selective. Documentation is uneven, historical versions differ, related games are correlated, and visible survivors dominate the sample. Three discontinuation cases improve the argument but do not eliminate selection bias. Some source pages were accessible only through indexed abstracts or excerpts, as recorded in the source register.

The learning research supports several components of the proposal. Its findings cannot be multiplied into a guaranteed success probability or transferred unchanged to adult workplace English. A polished product still needs valid content, appropriate teaching, reliable access, trusted instructors, sustainable operations, and evaluation with its actual learners.

## 17 The design decision to carry forward

Build a product in which a useful learning action is easy to begin, interesting to perform, understandable to evaluate, and worthwhile to revisit. Use games' clarity and responsiveness, make practice varied, and connect progress to tasks adults care about. Give every claimed skill a defensible evidence trail. The measure of a successful Purpose Academy mechanic is that it helps people learn and use something valuable, not simply that it persuades them to keep tapping.

## 18 The breakout periods and what existed at the time

The feature that sustains a mature product may not be the feature that created its first audience. This section separates early appeal, distribution, and later expansion. The periods are evidence-backed takeoff windows or original-era reference points, not a claim to know the exact lifetime peak of every game.

### 18.1 Browser puzzle roots and the importance of familiar rules

Bejeweled's early browser and downloadable era demonstrates that an immediately usable puzzle can reach people outside conventional game audiences. PopCap's own guide traces the project to 2000; other historical records use 2001 for the named release. This report treats 2000–2001 as the origin window rather than forcing a single date across different prototypes and editions. [H08]

**Reconstructed early system:** a readily demonstrated matching rule, a visually legible board, immediate clearing, score improvement, and distribution through an already accessible computing environment. **Later layers:** many modes, mobile editions, additional boosts, and service features. **Transferable lesson:** start with a complete, satisfying action; do not assume the later feature stack was required for the original appeal. This is an analytical reconstruction, not a causal decomposition of PopCap's sales.

### 18.2 The 2009–2011 touchscreen opportunity

Angry Birds and Fruit Ninja made a new input device part of the attraction. Pulling and releasing a slingshot or slicing with a finger gave the phone a role beyond being a small computer screen. The Angry Birds programmer's account specifically identifies the touchscreen and slingshot as an approachable combination. [G05b]

Halfbrick dates Fruit Ninja's iPhone release to 21 April 2010 and reported six million iPhone sales in a subsequent milestone post. Its November 2010 Arcade Mode announcement describes a 60-second score challenge and special bananas while emphasizing preservation of simple play. Those dated records show extension of an already successful gesture system. [H03, H04]

**Reconstructed early system:** a distinctive direct gesture, clear visible consequences, short attempts, a recognizable character or sensory identity, paid mobile distribution, and updates that extended the central action. **Later layers:** today's subscription catalogs, elaborate equipment, events, and franchise breadth. Those later systems should not be used as explanations for the initial 2010 purchase decision.

Doodle Jump and Jetpack Joyride occupy the same broad opportunity: device-appropriate control, immediate movement, records, and limited explanation. The exact distribution contribution of featuring, press, price changes, and existing studio reputation must be established separately for each title. Contemporary storefront descriptions cannot prove which factor dominated at launch.

### 18.3 Candy Crush in 2011–2013

King's contemporaneous filing places the web launch in the first quarter of 2011, Facebook in the second quarter of 2012, and mobile in the fourth quarter of 2012. It describes short sessions, continuity between devices, synchronized progression and virtual items, and social sharing or help as parts of its platform proposition. The filing also identifies performance marketing as a cost. These facts make a purely psychological explanation incomplete. [H01]

**Reconstructed takeoff system:** a proven matching interaction, authored objectives, persistent progression, social context, broad platform access, continuity of investment across devices, and a free entry point with a virtual-item economy. The cofounder's account emphasizes the map, progression, and audience response, while the filing supplies a contemporaneous operating view. [G01a]

**What can be copied:** coherent short sessions, a clear journey, continuity, social relevance, and a sustainable content operation. **What cannot be reconstructed from these sources:** a player's private targeting parameters, exact random generators, the contribution of every advertising channel, or the counterfactual growth without Facebook.

### 18.4 Temple Run and mobile runners in 2011–2012

The founders' March 2012 interview describes launching as a paid app, declining in paid-chart visibility, trying the free model, and observing widespread high-score conversation. Their account says the game had been designed for free-to-play from the outset. [G09a]

**Reconstructed takeoff system:** a continuous escape fantasy, a small native gesture vocabulary, low explanation cost, a clear distance comparison, repeat attempts, and easier distribution after the price barrier was removed. **Later layers:** sequel objectives, expanded worlds, and event systems. The interview establishes chronology and the founders' interpretation; it does not prove that the price change alone created the phenomenon.

Subway Surfers is a separate long-lived runner case with a 2012 origin and continuing visual and content variation. Its enduring success is not a controlled replication of Temple Run because presentation, audience, distribution, tuning, and later operations differ. The common runner structure is a useful hypothesis generator, not sufficient explanation.

### 18.5 Flappy Bird in 2013–early 2014

Flappy Bird's breakout followed a period of relative obscurity, not an immediate launch-day conquest. The original creator interview supplies a one-handed design intention and a story of unexpected public attention. This is important evidence against assuming that extreme simplicity plus difficulty reliably generates a hit. [G13]

**Reconstructed takeoff system:** a minimal control, visibly comprehensible obstacle, a tiny score unit, fast restart, socially comparable failure, and distribution amplified by public attention. **Uncertainty:** the timing and relative contribution of sharing, videos, store ranking feedback, and broader media attention cannot be reduced to a verified coefficient. The creator's account is not evidence of a planned multistage compulsion funnel.

### 18.6 2048 and Crossy Road in 2014–2015

Cirulli's original account describes making 2048 in March 2014, releasing the code publicly, discovery on Hacker News, and subsequent movement through social platforms and offline discussion. He reported more than 23 million people had played by the account's original May 2014 date. That is creator-reported reach rather than audited unique active users. [H05]

**Reconstructed 2048 system:** instant browser access, a compact puzzle rule, a recognizable numeric target, planning under constrained randomness, rapid sharing, and public source that enabled reuse. **What differs from a modern free-to-play service:** no need to explain the original hit through paid lives, a map, a season pass, or a daily reward calendar.

Crossy Road's developers explicitly treated the project as an experiment. A contemporaneous interview describes voluntary video-ad rewards, collectible characters, and the creators' reluctance to interrupt play. The developer talk abstract identifies a short development period and rapid initial downloads; the talk itself was not treated as watched. [H06, H07]

**Reconstructed Crossy Road system:** a familiar crossing premise, narrow control, personal records, a distinct visual identity, collection beyond one failed run, and a monetization opportunity that did not require a paid competitive advantage. The lesson is a well-integrated system, not that voluntary advertisements alone create trust or virality.

### 18.7 Wordle's 2021–2022 ritual and later service games

Wordle demonstrates that coordinated participation and a finite daily result can substitute for an endless session. Its early appeal should not be explained by the whole current New York Times subscription bundle. The acquisition and subsequent corporate distribution are later stages of a game that was already spreading. [G21, G21a]

The restoration, merge, collection, and modern hybrid-casual cases show a different route: extending a small action with persistent goals and continuing operations. They do not establish that every later event, currency, or offer was present at initial takeoff. Where this review lacks an original-era source, it treats the title as evidence for its documented design pattern, not a fully reconstructed launch campaign.

### 18.8 What was shared across these historical transitions

The portable pattern is **a mechanic matched to an available audience and distribution environment, then extended through learning and operation**. The environment changed: browser portals, touchscreen stores, social graphs, free mobile distribution, shareable web links, and subscription or recommendation ecosystems offer different opportunities. A design that fits an input device or social context can be as important as its reward presentation.

## 19 The platform layer around casual games

The core corpus contains games; the following additional platform cases explain the systems that expose, distribute, monetize, and recommend them. They are not added to the 36-game feature counts.

| Environment | What the platform contributes | What a developer still must solve | Lesson for Purpose Academy |
|---|---|---|---|
| Browser portals and instant web play | Discovery, low install friction, hosting or integration conventions | Fast loading, understandable controls, session quality | A direct, lightweight learning demonstration can reduce entry friction |
| Early smartphone stores | Device distribution, payments, reviews, and discovery opportunities | A compelling device-appropriate interaction | Build for the learner's actual phone and interruptions |
| Facebook social games | A pre-existing identity and relationship network | Useful interactions and dependence on platform policies | Trusted educational relationships can matter more than a new public feed |
| Free mobile and hybrid-casual publishing | Advertising distribution, monetization infrastructure, and experimentation | Acquisition economics and durable experience | Do not confuse mass ad reach with meaningful activation |
| Roblox | Existing account ecosystem, shared infrastructure, and discovery | Audience fit, quality, and platform-specific recommendation signals | Distribution has its own feedback loop and changing rules |
| Subscription catalogs such as Apple Arcade | Paid access across a collection without in-game advertising or purchases | Quality and the terms of a platform relationship | A product can support engagement under a different revenue structure |
| Institution-linked learning | Assignment, curriculum relevance, human support, and trust | Valid content, useful practice, access, and credible evidence | This is Purpose Academy's proposed initial context, not a proven channel |

Zynga's 2011 filing explicitly describes the social graph and digital platform distribution as part of its market opportunity. That is a contemporaneous account of the environment around FarmVille and other social titles, not permission to assume identical platform access today. [H02]

Current Roblox documentation describes discovery signals and distinguishes different acquisition sources in its recommendation process. Those rules are platform-specific and can change. Poki and CrazyGames publish developer guidance covering submission, integration, and player experience. Apple describes Arcade as a subscription catalog without ads or in-app purchases. These cases demonstrate that distribution and revenue infrastructure vary; none supplies a universal formula for a hit. [P01, P02, P03, P04]

The WeChat mini-game ecosystem was identified as a relevant additional environment, but this review did not obtain sufficiently strong original material to reconstruct its historical growth mechanics in comparable detail. It is not used as evidence for a specific causal or financial claim. This keeps the boundary visible rather than filling it with assumptions.

## 20 The reverse engineered recipe

This is a new synthesis of the comparative findings. It is a build-and-test recipe, not a claim to have discovered a proprietary industry formula. The companion systems document develops the same recipe as a set of interacting components and feedback loops.

### 20.1 Choose one primary reason for the next action

Select the experience the core activity must deliver before adding secondary goals:

- **Mastery:** “I can perform that action better.”
- **Solution:** “I can work out what makes this succeed.”
- **Discovery:** “I want to see what this creates or reveals.”
- **Completion:** “I can finish this coherent small task.”
- **Ownership:** “I am improving something that persists.”
- **Connection:** “This is useful or enjoyable with another person.”

For Purpose Academy, choose meaningful mastery and task completion first. Discovery, a personal record, or optional cooperation can support them. A random prize should not become the main reason to encounter an English instruction.

### 20.2 Define the smallest complete unit

Write the unit in one sentence: **“The user does A, the system responds with B, and the user can judge C.”**

For a language activity: “The learner hears a request, selects the matching response, and sees whether they understood the key information.” If the sentence requires several unrelated actions, reduce the prototype. A unit needs an understandable end; it does not need to last a predetermined number of seconds.

Build that unit with plain assets first. Confirm that users understand it before adding an economy, map, collection, or social layer. If the core is confusing, surrounding it with rewards makes diagnosis harder.

### 20.3 Tune six concrete variables

| Variable | What to change deliberately | Evidence to collect |
|---|---|---|
| Entry effort | Registration steps, load time, setup, explanation | Can a person reach a useful action? |
| Action clarity | Wording, layout, controls, available information | Can they describe what to do and why? |
| Outcome legibility | Feedback, consequence, explanation | Can they interpret the result and plan another attempt? |
| Challenge | Knowledge required, options, constraints, supports | Is failure attributable and improvement possible? |
| Continuity | Saved state, a next goal, related content | Does returning preserve meaning and reduce restart effort? |
| Return value | Due learning, useful novelty, social content | Is another session worth doing under the learner's own goals? |

Change one important variable at a time when the evaluation is meant to isolate its contribution. Larger redesigns can be tested as packages, but then they do not identify which component caused a difference.

### 20.4 Add depth by recombination before adding systems

Take one familiar interaction and vary relevant information: the object, voice, phrasing, context, or constraint. Introduce one new rule or evidence demand at a time. A recognition task can become a listening task and then a contextual response without becoming a reflex runner.

The objective is a stable grammar with useful variety. Randomize within reviewed limits. Keep the answer key and evidence policy stable for the published version. Add new mechanics only when they support a learning objective that the existing interaction cannot express well.

### 20.5 Build a return contract

Tell the learner what will remain and why a later session matters: “Your progress is saved. We will check these words again after a break.” A return contract consists of saved state, a relevant next action, and a manageable route back.

Do not rely on an ever-growing backlog or artificial urgency. A complete session should feel complete. Leave a useful next step available rather than making the current activity feel deliberately unfinished.

### 20.6 Align distribution and expectation

Choose the actual first channel and audience. A teacher demonstration, partner intake session, direct link, app-store listing, or short video needs different implementation and measurement. Show the real task, identify the useful outcome, and make the first session match the promise.

For a small pilot, ten appropriate learners who receive support can teach more about usefulness than a large number of poorly matched ad clicks. That is a design judgment about the learning objective, not a general claim that paid distribution is ineffective.

### 20.7 Instrument the system before decorating it

Store content versions, attempt conditions, assistance, errors, and outcome definitions. Ensure duplicate events and offline recovery do not corrupt the record. Then evaluate the presentation. A large volume of data cannot rescue a metric whose meaning was never defined.

### 20.8 Ship a vertical slice and apply explicit gates

A proposed first slice contains ten reviewed concepts, roughly thirty approved item forms across the relevant modalities, one accessible activity engine, a short task sequence, delayed review, and instructor inspection. Those are scope defaults, not validated curriculum quantities.

Do not advance because the screen looks like a successful casual game. Advance when people understand the activity, can access it, receive valid feedback, return for useful practice, and demonstrate retained learning under the defined checks. Expand content and presentation after those gates are met.

## 21 Formulas for reasoning about the system

### 21.1 A funnel identity for useful reach

Let E be the number of unique people exposed during a defined period. Let t be the fraction who try, a the fraction of triers who complete a useful first action, r the fraction of activated people who return for the defined learning opportunity, l the fraction of those returners who meet the retained-learning criterion, and x the fraction of those learners who pass the specified transfer check.

```text
expected people completing the defined transfer pathway
= E * t * a * r * l * x
```

The fractions are sequential conditional rates with explicitly nested populations. The identity does not require assuming all stages are independent. It describes one defined pathway, not every learner or every possible success. It also does not explain the reasons the rates change.

**Hypothetical example:** 1,000 exposed people × 0.20 trial × 0.60 activation × 0.40 return × 0.70 retained learning × 0.50 transfer gives an expectation of 16.8 people on that pathway. This is arithmetic with invented inputs, not a forecast. It shows why improving one stage while harming a later stage can reduce the final result.

### 21.2 An attempt-cost model

Under an intentionally simplified model with independent attempts, fixed success probability p, attempt duration A, and restart overhead R:

```text
expected attempts to first success = 1 / p
expected time to first success = A / p + R * (1 / p - 1)
```

Actual players learn, fatigue, change strategy, encounter different states, and stop. Their attempts are not independent with constant p. The formula is therefore useful for understanding how restart overhead magnifies friction, not for estimating actual Candy Crush or language-learning completion times.

For education, lower retry overhead while changing the instruction after mistakes. Do not lower p merely to increase the number of attempts. Extra repetition without useful retrieval or explanation can consume time without improving the desired outcome.

### 21.3 A control model for the product

Use three distinct functions:

```text
state_next = activity_rules(state_now, user_action, approved_content)
evidence_next = evidence_policy(evidence_now, evaluated_attempt, conditions)
next_practice = review_policy(evidence_next, learner_goal, prerequisites, time)
```

The animation system presents state changes. Cosmetic rewards acknowledge selected events. Neither function may rewrite evidence policy. This separation is the practical formula behind the recommended implementation: game state, learning evidence, and practice selection interact but retain different authorities.

### 21.4 A diagnostic scorecard rather than an invented success equation

Rate entry clarity, action clarity, result understanding, challenge suitability, useful variation, continuity, accessibility, and evidence validity from 0 to 3 using observed behavior and documented checks. Record the observation behind every rating. Use “unknown” when it has not been tested.

- **0:** the component fails its basic purpose.
- **1:** it works only with substantial assistance or has a material unresolved defect.
- **2:** it works for observed users under stated conditions, with known limits.
- **3:** repeated evaluation supports the component across the intended conditions.

Do not add the ratings and interpret the total as a probability of commercial success. A zero in content validity or access is a release blocker even if every decorative feature receives a high rating. The scorecard is a transparent planning tool, not a psychometric instrument.

### 21.5 What the recipe can reproduce

It can reproduce a coherent design process, a well-defined action loop, appropriate feedback, preserved progress, deliberate return value, a content operation, and a measurement system. It cannot reproduce an old market, a creator's exact timing, a platform's historical distribution policy, or a guaranteed cultural phenomenon. Use the recipe to build a stronger product and learn faster, then use actual outcomes to decide what survives.

## 22 Sources and access notes

The bibliography below contains primary game documentation, original interviews, original code, research, official accessibility or language frameworks, and the two supplied Purpose Academy documents. A source may support rules or history without supporting the proposed psychological explanation. See each section's evidence labels and the limits in `06_Source_Register.csv`. Dates and corporate or storefront scale claims are snapshots, not present-day rankings or audited comparable user counts.

- **[G01] Candy Crush Saga scoped game documentation.** Developer or original creator documentation. [https://candycrush.zendesk.com/hc/en-us/sections/360000191777-How-to-play](https://candycrush.zendesk.com/hc/en-us/sections/360000191777-How-to-play). Limit: Official rules and cofounder interview; substantial historical reach; no private retention data.
- **[G02] Bejeweled Classic scoped game documentation.** Developer or original creator documentation. [https://play.google.com/store/apps/details?hl=en&id=com.ea.gp.bej3](https://play.google.com/store/apps/details?hl=en&id=com.ea.gp.bej3). Limit: Developer listing; enduring franchise; timed and Zen modes differ.
- **[G03] Royal Match scoped game documentation.** Developer or original creator documentation. [https://apps.apple.com/ca/app/royal-match/id1482155847](https://apps.apple.com/ca/app/royal-match/id1482155847). Limit: Developer listing and official teams support; no audited cohort economics.
- **[G04] Toon Blast scoped game documentation.** Developer or original creator documentation. [https://www.peak.com/games](https://www.peak.com/games). Limit: Publisher reports 100 million users in first year; current rankings not treated as verified.
- **[G05] Angry Birds scoped game documentation.** Developer or original creator documentation. [https://www.angrybirds.com/games/rovio-classics-angry-birds/](https://www.angrybirds.com/games/rovio-classics-angry-birds/). Limit: Original mechanics documented through official 2012 recreation; do not import Angry Birds 2 economy.
- **[G06] Cut the Rope scoped game documentation.** Developer or original creator documentation. [https://www.zeptolab.com/games/cut-the-rope](https://www.zeptolab.com/games/cut-the-rope). Limit: Publisher page reports 990 million players; edition and powerup differences.
- **[G07] Where's My Water? scoped game documentation.** Developer or original creator documentation. [https://apps.apple.com/ca/app/wheres-my-water/id449735650](https://apps.apple.com/ca/app/wheres-my-water/id449735650). Limit: Disney developer listing; current monetization differs from historical premium editions.
- **[G08] Happy Glass scoped game documentation.** Developer or original creator documentation. [https://play.google.com/store/apps/details?hl=en_US&id=com.game5mobile.lineandwater](https://play.google.com/store/apps/details?hl=en_US&id=com.game5mobile.lineandwater). Limit: Developer listing showed 100 million plus Android downloads; reviews are not causal evidence.
- **[G09] Temple Run scoped game documentation.** Developer or original creator documentation. [https://imangistudios.zendesk.com/hc/en-us/articles/4995833305747-About-Temple-Run](https://imangistudios.zendesk.com/hc/en-us/articles/4995833305747-About-Temple-Run). Limit: Official rules plus direct 2012 founder interview; Temple Run 2 separated.
- **[G10] Subway Surfers scoped game documentation.** Developer or original creator documentation. [https://play.google.com/store/apps/details?hl=en-US&id=com.kiloo.subwaysurf](https://play.google.com/store/apps/details?hl=en-US&id=com.kiloo.subwaysurf). Limit: Developer listing showed 1 billion plus Android downloads; does not equal unique active users.
- **[G11] Jetpack Joyride scoped game documentation.** Developer or original creator documentation. [https://play.google.com/store/apps/details?hl=en_CA&id=com.halfbrick.jetpackjoyride](https://play.google.com/store/apps/details?hl=en_CA&id=com.halfbrick.jetpackjoyride). Limit: Developer listing claims 750 million players; current events and classic subscription edition differ.
- **[G12] Crossy Road scoped game documentation.** Developer or original creator documentation. [https://www.crossyroad.com/](https://www.crossyroad.com/). Limit: Official site claims 350 million players; scoreboards are excluded from mechanical social code.
- **[G13] Flappy Bird scoped game documentation.** Developer or original creator documentation. [https://davidkushner.com/article/the-flight-of-the-birdman/](https://davidkushner.com/article/the-flight-of-the-birdman/). Limit: Contemporaneous original reporting and creator interview; later unrelated relaunches excluded.
- **[G14] Fruit Ninja scoped game documentation.** Developer or original creator documentation. [https://www.halfbrick.com/games/fruit-ninja-classic](https://www.halfbrick.com/games/fruit-ninja-classic). Limit: Official Classic description; current subscription is not the original business model.
- **[G15] Doodle Jump scoped game documentation.** Developer or original creator documentation. [https://apps.apple.com/ca/app/doodle-jump/id307727765](https://apps.apple.com/ca/app/doodle-jump/id307727765). Limit: Lima Sky developer listing; score markers count as comparison rather than mechanical cooperation.
- **[G16] Helix Jump scoped game documentation.** Developer or original creator documentation. [https://voodoo.io/games/helix-jump](https://voodoo.io/games/helix-jump). Limit: Official publisher rules; exact tower generation and current resource gates unverified.
- **[G17] Tetris scoped game documentation.** Developer or original creator documentation. [https://play.tetris.com/games/](https://play.tetris.com/games/). Limit: Official classic rules; later battle and mobile service modes excluded.
- **[G18] 2048 scoped game documentation.** Developer or original creator documentation. [https://github.com/gabrielecirulli/2048](https://github.com/gabrielecirulli/2048). Limit: Original repository plus inspected raw source; fork counts are not users or revenue.
- **[G19] Block Blast scoped game documentation.** Developer or original creator documentation. [https://www.blockblast.com/](https://www.blockblast.com/). Limit: Official game site; free mobile and Apple Arcade editions have different economies.
- **[G20] Stack scoped game documentation.** Developer or original creator documentation. [https://www.ketchappgames.com/game-stack](https://www.ketchappgames.com/game-stack). Limit: Publisher page and developer store listing; current shops and challenges version dependent.
- **[G21] Wordle scoped game documentation.** Developer or original creator documentation. [https://www.nytimes.com/games/wordle/index.html](https://www.nytimes.com/games/wordle/index.html). Limit: Original daily format; NYT investor deck search excerpt provides scale; live page blocked by robots.
- **[G22] Words With Friends scoped game documentation.** Developer or original creator documentation. [https://www.zynga.com/games/words-with-friends/](https://www.zynga.com/games/words-with-friends/). Limit: Official game page; contemporary solo and live modes differ from asynchronous core.
- **[G23] Wordscapes scoped game documentation.** Developer or original creator documentation. [https://www.peoplefun.com/games](https://www.peoplefun.com/games). Limit: Publisher description plus daily puzzle support; exact current economy not inspected.
- **[G24] Trivia Crack scoped game documentation.** Developer or original creator documentation. [https://play.google.com/store/apps/details?hl=en_CA&id=com.etermax.preguntados.lite](https://play.google.com/store/apps/details?hl=en_CA&id=com.etermax.preguntados.lite). Limit: Developer listing showed 100 million plus Android downloads; current AI quiz creator is not a historical cause.
- **[G25] Cookie Clicker scoped game documentation.** Developer or original creator documentation. [https://www.cookieclicker.com/](https://www.cookieclicker.com/). Limit: Official original game and linked Steam edition; waiting for resources is not energy denial.
- **[G26] AdVenture Capitalist scoped game documentation.** Developer or original creator documentation. [https://play.google.com/store/apps/details?hl=en_CA&id=com.kongregate.mobile.adventurecapitalist.google](https://play.google.com/store/apps/details?hl=en_CA&id=com.kongregate.mobile.adventurecapitalist.google). Limit: Developer listing; event variants differ; main production timing is not coded as an access gate.
- **[G27] Merge Dragons scoped game documentation.** Developer or original creator documentation. [https://www.mergedragons.com/](https://www.mergedragons.com/). Limit: Official rules and support; level entry chalices differ from camp activity.
- **[G28] Travel Town scoped game documentation.** Developer or original creator documentation. [https://support.traveltowngame.com/hc/en-us/articles/4833664499090-The-Merge-Board](https://support.traveltowngame.com/hc/en-us/articles/4833664499090-The-Merge-Board). Limit: Official support; exact item probabilities and personalized offers not public.
- **[G29] Gardenscapes scoped game documentation.** Developer or original creator documentation. [https://apps.apple.com/us/app/gardenscapes/id1105855019](https://apps.apple.com/us/app/gardenscapes/id1105855019). Limit: Developer listing; store advertising is not assumed to represent every main game action.
- **[G30] Homescapes scoped game documentation.** Developer or original creator documentation. [https://apps.apple.com/us/app/homescapes/id1195621598](https://apps.apple.com/us/app/homescapes/id1195621598). Limit: Developer listing; shares publisher and core with Gardenscapes so not an independent replication.
- **[G31] Township scoped game documentation.** Developer or original creator documentation. [https://apps.apple.com/us/app/township/id638689075](https://apps.apple.com/us/app/township/id638689075). Limit: Developer listing; supplemental match three modes not coded as the whole game.
- **[G32] Hay Day scoped game documentation.** Developer or original creator documentation. [https://supercell.com/en/games/hayday/](https://supercell.com/en/games/hayday/). Limit: Official game page and longevity article; crop timers are soft production gates not loss on absence.
- **[G33] MONOPOLY GO! scoped game documentation.** Developer or original creator documentation. [https://newsroom.hasbro.com/news-releases/news-release-details/monopoly-go-advances-2-billion-revenue-first-10-months](https://newsroom.hasbro.com/news-releases/news-release-details/monopoly-go-advances-2-billion-revenue-first-10-months). Limit: Hasbro reported 2 billion USD revenue in first ten months in March 2024; not current retention or net profit.
- **[G34] Coin Master scoped game documentation.** Developer or original creator documentation. [https://support.coinmastergame.com/hc/en-us/articles/360001264874-What-are-Attacks](https://support.coinmastergame.com/hc/en-us/articles/360001264874-What-are-Attacks). Limit: Official support on attacks cards and invitations; no private payout probabilities inspected.
- **[G35] My Talking Tom scoped game documentation.** Developer or original creator documentation. [https://apps.apple.com/us/app/my-talking-tom/id657500465](https://apps.apple.com/us/app/my-talking-tom/id657500465). Limit: Developer listing and franchise pages; franchise downloads not attributed to this title.
- **[G36] Solitaire Grand Harvest scoped game documentation.** Developer or original creator documentation. [https://www.solitairegrandharvest.com/](https://www.solitairegrandharvest.com/). Limit: Official browser rules; mobile entry costs and web implementation may differ.
- **[G01a] King cofounder interview on Candy Crush creation.** Creator interview. [https://apps.apple.com/us/iphone/story/id1462263204](https://apps.apple.com/us/iphone/story/id1462263204). Limit: Developer statements; retrospective and not an experiment.
- **[G01b] Candy Crush lives.** Official support. [https://candycrush.zendesk.com/hc/en-us/articles/360000750878-How-do-lives-work](https://candycrush.zendesk.com/hc/en-us/articles/360000750878-How-do-lives-work). Limit: Rules vary over time; checked snapshot.
- **[G01c] Candy Crush boosters.** Official support. [https://candycrush.zendesk.com/hc/en-us/articles/360000750998-What-are-Boosters](https://candycrush.zendesk.com/hc/en-us/articles/360000750998-What-are-Boosters). Limit: Describes availability; not proof of hidden purchase targeting.
- **[G01d] Candy Crush game modes.** Official support. [https://candycrush.zendesk.com/hc/en-us/articles/360000754897-Which-game-modes-will-I-find](https://candycrush.zendesk.com/hc/en-us/articles/360000754897-Which-game-modes-will-I-find). Limit: Public mode descriptions.
- **[G01e] Crush and Tell game design episode.** Official community manager post. [https://community.king.com/en/candy-crush-saga/discussion/comment/3460876](https://community.king.com/en/candy-crush-saga/discussion/comment/3460876). Limit: Page inspected; video not transcribed or treated as watched.
- **[G03a] Royal Match teams.** Official support. [https://dreamgames.helpshift.com/hc/en/3-royal-match/faq/52-what-are-teams/](https://dreamgames.helpshift.com/hc/en/3-royal-match/faq/52-what-are-teams/). Limit: Communication life gifting and team events.
- **[G04a] Toon Blast helps.** Official support. [https://peakgames.helpshift.com/hc/en/4-toon-blast/faq/38-what-are-helps/](https://peakgames.helpshift.com/hc/en/4-toon-blast/faq/38-what-are-helps/). Limit: Reciprocal lives and visible weekly help activity.
- **[G05a] Rovio Classics launch and reconstruction.** Official developer article. [https://www.rovio.com/articles/a-classic-returns-rovio-classics-angry-birds-launches-today/](https://www.rovio.com/articles/a-classic-returns-rovio-classics-angry-birds-launches-today/). Limit: 2022 reconstruction is not original source code.
- **[G05b] Angry Birds Turns Ten.** Developer interview via Apple. [https://apps.apple.com/us/story/id1490639790](https://apps.apple.com/us/story/id1490639790). Limit: Direct programmer comments on touchscreen and slingshot.
- **[G09a] Temple Run founder interview.** Original interview. [https://www.pocketgamer.com/temple-run/imangi-studios-reveals-whats-next-for-temple-run/](https://www.pocketgamer.com/temple-run/imangi-studios-reveals-whats-next-for-temple-run/). Limit: 2012 founder account; growth attribution is their interpretation.
- **[G09b] Temple Run 2 objectives.** Official support. [https://templerun2.zendesk.com/hc/en-us/articles/1500009158462-Objectives](https://templerun2.zendesk.com/hc/en-us/articles/1500009158462-Objectives). Limit: Sequel only; not silently assigned to original Temple Run.
- **[G18a] 2048 game manager source.** Original code. [https://raw.githubusercontent.com/gabrielecirulli/2048/master/js/game_manager.js](https://raw.githubusercontent.com/gabrielecirulli/2048/master/js/game_manager.js). Limit: Inspected source at moving master branch; not a pinned reproducible build.
- **[G18b] 2048 grid source.** Original code. [https://raw.githubusercontent.com/gabrielecirulli/2048/master/js/grid.js](https://raw.githubusercontent.com/gabrielecirulli/2048/master/js/grid.js). Limit: Inspected random empty cell selection.
- **[G18c] 2048 input manager source.** Original code. [https://raw.githubusercontent.com/gabrielecirulli/2048/master/js/keyboard_input_manager.js](https://raw.githubusercontent.com/gabrielecirulli/2048/master/js/keyboard_input_manager.js). Limit: Inspected input event separation.
- **[G21a] NYT Investor Day 2022.** Corporate presentation. [https://s23.q4cdn.com/152113917/files/doc_downloads/2022/06/v2/NYT-Investor-Day-2022-Presentation-mC05z.pdf](https://s23.q4cdn.com/152113917/files/doc_downloads/2022/06/v2/NYT-Investor-Day-2022-Presentation-mC05z.pdf). Limit: Search-index excerpt only; full PDF exceeded web fetch size; no detailed financial inference.
- **[G23a] Wordscapes daily puzzle.** Official support. [https://peoplefun.helpshift.com/hc/en/6-wordscapes/faq/270-what-is-the-daily-puzzle-and-how-does-it-work/](https://peoplefun.helpshift.com/hc/en/6-wordscapes/faq/270-what-is-the-daily-puzzle-and-how-does-it-work/). Limit: Daily puzzle differs from regular authored boards.
- **[G27a] Merge Dragons tips.** Official rules. [https://www.mergedragons.com/tips-and-tricks](https://www.mergedragons.com/tips-and-tricks). Limit: Public strategy and merging rules.
- **[G28a] Travel Town board items.** Official support. [https://support.traveltowngame.com/hc/en-us/articles/4833684165522-What-are-Board-Items](https://support.traveltowngame.com/hc/en-us/articles/4833684165522-What-are-Board-Items). Limit: Producer and merge transformation descriptions.
- **[G32a] Hay Day longevity and development.** Official developer article. [https://supercell.com/en/news/nothing-bad-happens-in-hay-day/](https://supercell.com/en/news/nothing-bad-happens-in-hay-day/). Limit: Developer account of fourteen year longevity in 2026.
- **[G34a] Coin Master cards.** Official support. [https://support.coinmastergame.com/hc/en-us/articles/360001265174-How-do-I-get-Cards](https://support.coinmastergame.com/hc/en-us/articles/360001265174-How-do-I-get-Cards). Limit: Collection and trading structure.
- **[G34b] Coin Master invitations.** Official support. [https://support.coinmastergame.com/hc/en-us/articles/360001257553-How-Do-I-Get-Spins-from-Inviting-Friends](https://support.coinmastergame.com/hc/en-us/articles/360001257553-How-Do-I-Get-Spins-from-Inviting-Friends). Limit: Referral rewards create incentives; not proof of organic virality.
- **[F01] Hay Day Pop closing notice.** Official discontinuation notice. [https://supercell.com/en/news/hay-day-pop-closing-game/7482/](https://supercell.com/en/news/hay-day-pop-closing-game/7482/). Limit: Closed February 2021; causal reason beyond stated standards unobserved.
- **[F02] Clash Quest ending development.** Official discontinuation notice. [https://supercell.com/en/news/clash-quest-ending-development/7675/](https://supercell.com/en/news/clash-quest-ending-development/7675/). Limit: 2022 publisher decision; no public unit economics used.
- **[F03] Everdale ending development.** Official discontinuation notice. [https://supercell.com/en/news/everdale-ending-development/7686/](https://supercell.com/en/news/everdale-ending-development/7686/). Limit: Historical 2022 Supercell decision; later IP transfer means not a claim about present status.
- **[R01] Ryan Rigby and Przybylski 2006 The Motivational Pull of Video Games.** Primary research. [https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf). Limit: Four studies; not a trial in the present 36 titles.
- **[R02] Przybylski Rigby and Ryan 2010 A Motivational Model of Video Game Engagement.** Research synthesis. [https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf). Limit: Theory and research review; not a universal neural explanation.
- **[R03] Sailer and Homner 2020 The Gamification of Learning A Meta analysis.** Meta analysis. [https://link.springer.com/article/10.1007/s10648-019-09498-w](https://link.springer.com/article/10.1007/s10648-019-09498-w). Limit: Cognitive motivational and behavioral outcomes differ; not a direct Purpose Academy effect estimate.
- **[R04] Mekler and colleagues 2017 Individual gamification elements.** Primary experiment. [https://www.sciencedirect.com/science/article/pii/S0747563215301229](https://www.sciencedirect.com/science/article/pii/S0747563215301229). Limit: Publisher abstract and university records inspected; full publisher page inaccessible.
- **[R05] Habgood and Ainsworth 2011 Intrinsic integration in educational games.** Primary experiments. [https://tca2.education.illinois.edu/docs/librariesprovider23/default-document-library/j-of-the-learning-sc-2011-habgood.pdf?sfvrsn=c838d23d_2](https://tca2.education.illinois.edu/docs/librariesprovider23/default-document-library/j-of-the-learning-sc-2011-habgood.pdf?sfvrsn=c838d23d_2). Limit: Child mathematics game; do not generalize effect magnitude to adult language learning.
- **[R06] Karpicke and Roediger 2008 The critical importance of retrieval for learning.** Primary experiment. [https://pubmed.ncbi.nlm.nih.gov/18276894/](https://pubmed.ncbi.nlm.nih.gov/18276894/). Limit: Abstract indexed; paired vocabulary learning does not establish job competence.
- **[R07] Cepeda and colleagues 2006 Distributed practice in verbal recall tasks.** Meta analysis. [https://www.yorku.ca/ncepeda/publications/CPVWR2006.html](https://www.yorku.ca/ncepeda/publications/CPVWR2006.html). Limit: 839 assessments across 317 experiments; exact scheduling depends on material and retention horizon.
- **[R08] Sweller 1988 Cognitive load during problem solving.** Primary theoretical and experimental paper. [https://www.sciencedirect.com/science/article/pii/0364021388900237](https://www.sciencedirect.com/science/article/pii/0364021388900237). Limit: Supports instructional load argument; not a specific game UX threshold.
- **[R09] Nunes and Dreze 2006 The Endowed Progress Effect.** Primary experiments. [https://academic.oup.com/jcr/article-abstract/32/4/504/1787425](https://academic.oup.com/jcr/article-abstract/32/4/504/1787425). Limit: Consumer loyalty task; publisher abstract inspected via search; not learning efficacy.
- **[R10] Lally and colleagues 2010 How are habits formed.** Primary longitudinal research. [https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674](https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674). Limit: 96 volunteers; self reported health related actions; not an app streak experiment.
- **[R11] Schultz Dayan and Montague 1997 A Neural Substrate of Prediction and Reward.** Primary neuroscience. [https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.html](https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.html). Limit: Primate reward prediction work; no dopamine measurements from these mobile games.
- **[R12] Clark and colleagues 2009 Gambling Near Misses.** Primary experiment. [https://www.sciencedirect.com/science/article/pii/S0896627309000373](https://www.sciencedirect.com/science/article/pii/S0896627309000373). Limit: Gambling task; not causal evidence for educational game near misses.
- **[R13] Hattie and Timperley 2007 The Power of Feedback.** Research synthesis. [https://doi.org/10.3102/003465430298487](https://doi.org/10.3102/003465430298487). Limit: Publisher record and abstract; feedback content and timing matter.
- **[R14] Deci Koestner and Ryan 1999 Extrinsic rewards and intrinsic motivation.** Meta analysis. [https://pubmed.ncbi.nlm.nih.gov/10589297/](https://pubmed.ncbi.nlm.nih.gov/10589297/). Limit: Reward type contingency and context matter; not all game points harm motivation.
- **[T01] W3C WCAG 2.2.** Official standard. [https://www.w3.org/TR/WCAG22/](https://www.w3.org/TR/WCAG22/). Limit: Criteria have different A AA AAA levels; proposed touch sizes exceed minimum targets.
- **[T02] W3C Whats New in WCAG 2.2.** Official explanatory documentation. [https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/). Limit: Dragging alternatives focus and target sizing.
- **[T03] CCLB Language for Success Can Do Statements.** Official framework. [https://www.language.ca/resourcesexpertise/language-for-success/digital-tools/can-do-statements/](https://www.language.ca/resourcesexpertise/language-for-success/digital-tools/can-do-statements/). Limit: Workplace language alignment; no claim of an official CLB assessment.
- **[PA1] Purpose Academy current Business Plan.** User supplied planning document. [https://chatgpt.com/library?file_id=libfile_0eeedede00ac8191a7169e7e60f40b2b&account_id=personal](https://chatgpt.com/library?file_id=libfile_0eeedede00ac8191a7169e7e60f40b2b&account_id=personal). Limit: Read current version; construction first; extension streams proposed; planning claims not revalidated here.
- **[PA2] Purpose Academy Occupational Language and Vocabulary Framework.** User supplied curriculum draft. [https://chatgpt.com/library?file_id=libfile_b7c3f5804d508191a5c611ba97ec4b2f&account_id=personal](https://chatgpt.com/library?file_id=libfile_b7c3f5804d508191a5c611ba97ec4b2f&account_id=personal). Limit: Read relevant sections; draft stresses recognition recall application and practical verification.
- **[R15] Ferster and Skinner 1957 Schedules of Reinforcement.** Foundational experimental research. [https://www.bfskinner.org/wp-content/uploads/2015/05/Schedules_of_Reinforcement_PDF.pdf](https://www.bfskinner.org/wp-content/uploads/2015/05/Schedules_of_Reinforcement_PDF.pdf). Limit: Foundation book record and indexed original text; schedule definitions do not establish a game specific causal effect.
- **[H01] King 2014 Form F1 registration statement.** Contemporaneous corporate filing. [https://www.sec.gov/Archives/edgar/data/1580732/000119312514056089/d564433df1.htm](https://www.sec.gov/Archives/edgar/data/1580732/000119312514056089/d564433df1.htm). Limit: Launch chronology synchronization and stated operating model; corporate attribution is not an experiment.
- **[H02] Zynga 2011 Form S1 registration statement.** Contemporaneous corporate filing. [https://www.sec.gov/Archives/edgar/data/1439404/000119312511180285/ds1.htm](https://www.sec.gov/Archives/edgar/data/1439404/000119312511180285/ds1.htm). Limit: Historical social graph and distribution context; do not project old platform policies onto today.
- **[H03] Fruit Ninja six million iPhone sales milestone.** Contemporaneous developer article. [https://www.halfbrick.com/blog/fruit-ninja-6-million](https://www.halfbrick.com/blog/fruit-ninja-6-million). Limit: Historical publisher reported sales and launch date.
- **[H04] Fruit Ninja Arcade Mode announcement 2010.** Contemporaneous developer article. [https://www.halfbrick.com/blog/fruit-ninja-arcade-mode-announced](https://www.halfbrick.com/blog/fruit-ninja-arcade-mode-announced). Limit: November 2010 mode description and dated sales claim.
- **[H05] Cirulli 2048 success and me.** Original creator account. [https://medium.com/@gabrielecirulli/2048-success-and-me-7dc664f7a9bd](https://medium.com/@gabrielecirulli/2048-success-and-me-7dc664f7a9bd). Limit: Original May 2014 account republished; creator reported reach and discovery path.
- **[H06] Crossy Road Andrew Sum monetization interview 2015.** Original creator interview. [https://www.gamedeveloper.com/business/how-i-crossy-road-i-made-1-million-from-video-ads](https://www.gamedeveloper.com/business/how-i-crossy-road-i-made-1-million-from-video-ads). Limit: Original interview; not private analytics or an isolated monetization experiment.
- **[H07] Crossy Road GDC 2015 session record.** Original developer talk abstract. [https://www.gdcvault.com/play/1021897/](https://www.gdcvault.com/play/1021897/). Limit: Indexed talk abstract; full presentation not treated as watched.
- **[H08] PopCap Bejeweled 3 strategy guide.** Original developer publication. [https://images.popcap.com/www/images/product/extras/strategyguides/bejeweled3/1033/bejeweled3strategyguide.pdf](https://images.popcap.com/www/images/product/extras/strategyguides/bejeweled3/1033/bejeweled3strategyguide.pdf). Limit: Indexed original guide; date discrepancy with museum record noted rather than forced to one launch day.
- **[P01] Roblox discovery documentation.** Official platform documentation. [https://create.roblox.com/docs/discovery](https://create.roblox.com/docs/discovery). Limit: Current distribution mechanisms; not evidence that a historic mobile hit used them.
- **[P02] Poki onboarding engagement and updates documentation.** Official platform documentation. [https://developers.poki.com/guide/post-release-updates](https://developers.poki.com/guide/post-release-updates). Limit: Current developer guidance; no private portal retention thresholds assumed.
- **[P03] CrazyGames developer documentation.** Official platform documentation. [https://docs.crazygames.com/](https://docs.crazygames.com/). Limit: Browser game submission SDK and publishing structure; not a case matched historical experiment.
- **[P04] Apple Arcade model.** Official platform description. [https://www.apple.com/ca/apple-arcade/](https://www.apple.com/ca/apple-arcade/). Limit: Subscription access without ads or in app purchases; no payout rates or current prices used.
- **[O01] Block Blast experimentation and reach announcement.** Official developer announcement. [https://www.blockblast.com/news/70m-dau-10000-experiments](https://www.blockblast.com/news/70m-dau-10000-experiments). Limit: Self reported 2025 experimentation and scale; not independently audited or a benchmark for a small pilot.
