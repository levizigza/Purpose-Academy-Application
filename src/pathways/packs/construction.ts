/**
 * Construction Foundations content pack.
 * Source of truth remains journeyCurriculum — this pack wraps it into the
 * shared three-stream PathwayPack shape.
 */
import {
  EMPLOYMENT_PREP,
  EYE_SPY_SCENES,
  FINAL_QUIZ,
  OBSERVATION_SCENARIOS,
  SAFETY_QUIZ,
  SITE_DECISIONS,
  SITE_PHRASES,
  SYSTEM_TOPICS,
  TOOL_CATEGORIES,
  UNIT_CHECKPOINTS,
  VOCAB_UNIT,
  WORD_ACTIONS,
  WORKPLACE_INSTRUCTIONS,
} from '../../student/journeyCurriculum'
import type { PathwayPack } from '../types'

export const constructionPack: PathwayPack = {
  id: 'construction',
  skillDomains: {
    vocabulary: 'Vocabulary',
    safety: 'Safety',
    tools: 'Tools',
    systems: 'Construction skills',
  },
  stepTitles: {
    12: {
      title: 'Site Language',
      help: 'Hear a job-site phrase. Choose what it means.',
      purpose: 'Useful English you will hear on Alberta construction sites.',
    },
    15: {
      title: 'Tools & Equipment',
      help: 'Learn each tool group. Answer one check.',
      purpose: 'Safe naming before safe use with an instructor.',
    },
    16: {
      title: 'Construction Systems',
      help: 'Learn each system. Answer one check.',
      purpose: 'Your task feeds the whole building.',
    },
    18: {
      title: 'On-Site Training',
      help: 'Make site decisions and log the day like a real crew member.',
      purpose: 'Daily judgment, notes, and site feedback.',
    },
  },
  vocab: VOCAB_UNIT,
  wordActions: WORD_ACTIONS,
  eyeSpyScenes: EYE_SPY_SCENES,
  workplaceInstructions: WORKPLACE_INSTRUCTIONS,
  sitePhrases: SITE_PHRASES,
  safetyQuiz: SAFETY_QUIZ,
  toolCategories: TOOL_CATEGORIES,
  systemTopics: SYSTEM_TOPICS,
  observationScenarios: OBSERVATION_SCENARIOS,
  siteDecisions: SITE_DECISIONS,
  finalQuiz: FINAL_QUIZ,
  employmentPrep: EMPLOYMENT_PREP,
  unitCheckpoints: UNIT_CHECKPOINTS,
}
