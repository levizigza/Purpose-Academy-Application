/**
 * Three-stream learning system — craftsmanship rules.
 *
 * Shared skeleton (same progression for every student):
 *   Assess fit → Enter pathway → Language & vocab → Practice English →
 *   Digital & safety → Tools & systems → Observation & site → Credential & employment
 *
 * Curriculum craft (strengthen, do not dilute):
 * 1. Duty → task → criterion (DACUM / occupational analysis), not topic trivia.
 * 2. Know it → Do it → Solve it before “Competent” (Alberta AIT pattern).
 * 3. Climb psychomotor depth: see/hear → act → ordered SOP → judgment under variation.
 * 4. Language is load-bearing (LINCS IET): gloss → picture → action → instruction → phrase → interview.
 * 5. Safety is stop-work competence, not a soft module.
 * 6. Tools teach naming, limits, and authorization (never fake certification).
 * 7. Systems show how one task feeds the whole flow (MSSC receive→store→pick→ship;
 *    Care Certificate welcome→plan→document→escalate).
 * 8. Observation checklists are measurable SOPs with ordered criteria + craft pass notes.
 * 9. Site decisions force real trade-offs with teachCorrect / teachWrong.
 * 10. Mastery without fluff: checkpoints recycle earlier skills into later judgment.
 *
 * Depth bar (match Construction Foundations):
 *   vocab ~7–9 · Eye Spy ≥8 scenes · instructions ≥8 · phrases ≥8 · safety ≥7 ·
 *   observation ≥5 · site decisions ≥6 · final ≥7 · employment ≥6
 *
 * Pathway sources used to strengthen packs (without changing the skeleton):
 *   Logistics — MSSC CLA/CLT key activities; OSHA pedestrian/MHE awareness.
 *   Community — Skills for Care / Care Certificate (privacy, dignity, escalation, person-centred).
 */

import type { EyeSpyScene, QuizItem, SupportLang, VocabTerm } from '../student/journeyCurriculum'
import {
  WORD_ACTIONS,
  WORKPLACE_INSTRUCTIONS,
  TOOL_CATEGORIES,
  SYSTEM_TOPICS,
  SITE_PHRASES,
  OBSERVATION_SCENARIOS,
  SITE_DECISIONS,
  EMPLOYMENT_PREP,
} from '../student/journeyCurriculum'

export type PathwayId = 'construction' | 'logistics' | 'community'

export type PathwayMeta = {
  id: PathwayId
  label: string
  programTitle: string
  tagline: string
  accent: string
  soft: string
  courseId: string
  photo: 'photoConstruction' | 'photoLogistics' | 'photoCommunity'
  icon: 'iconConstruction' | 'iconLogistics' | 'iconCommunity'
  open: boolean
}

export type WordAction = (typeof WORD_ACTIONS)[number]
export type WorkplaceInstruction = (typeof WORKPLACE_INSTRUCTIONS)[number]
export type ToolCategory = (typeof TOOL_CATEGORIES)[number]
export type SystemTopic = (typeof SYSTEM_TOPICS)[number]
export type SitePhrase = (typeof SITE_PHRASES)[number]
export type ObservationScenario = (typeof OBSERVATION_SCENARIOS)[number]
export type SiteDecision = (typeof SITE_DECISIONS)[number]
export type EmploymentItem = (typeof EMPLOYMENT_PREP)[number]

export type StepTitleOverrides = Partial<
  Record<number, { title?: string; help?: string; purpose?: string }>
>

export type PathwaySkillDomains = {
  vocabulary: string
  safety: string
  tools: string
  systems: string
}

export type PathwayUnitGoal = { goal: string; outcomes: string[] }

/**
 * One content pack = one stream.
 * Same shape for Construction, Logistics, and Community Support.
 */
export type PathwayPack = {
  id: PathwayId
  skillDomains: PathwaySkillDomains
  stepTitles: StepTitleOverrides
  /** Optional overrides for shared UNIT_GOALS (keyed by unit id). */
  unitGoals?: Partial<Record<number, PathwayUnitGoal>>
  vocab: VocabTerm[]
  wordActions: WordAction[]
  eyeSpyScenes: EyeSpyScene[]
  workplaceInstructions: WorkplaceInstruction[]
  sitePhrases: SitePhrase[]
  safetyQuiz: QuizItem[]
  toolCategories: ToolCategory[]
  systemTopics: SystemTopic[]
  observationScenarios: ObservationScenario[]
  siteDecisions: SiteDecision[]
  finalQuiz: QuizItem[]
  employmentPrep: EmploymentItem[]
  unitCheckpoints: Record<number, QuizItem[]>
}

export type { SupportLang, VocabTerm, QuizItem, EyeSpyScene }
