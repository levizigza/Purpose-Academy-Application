/**
 * Construction Foundations content pack.
 * Visual vocabulary (words 1–660) is sourced from the Purpose Academy
 * Construction Visual Vocabulary worksheet (30 pages): exact word-table
 * translations (Amharic, Tigrinya, Arabic, Spanish, Hindi — no French),
 * workplace sentences, and worksheet object photos for every word.
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
  WORD_ACTIONS,
  WORKPLACE_INSTRUCTIONS,
} from '../../student/journeyCurriculum'
import type { PathwayPack } from '../types'
import { CONSTRUCTION_VOCAB_660 } from './constructionVocab660'

export const constructionPack: PathwayPack = {
  id: 'construction',
  skillDomains: {
    vocabulary: 'Vocabulary',
    safety: 'Safety',
    tools: 'Tools',
    systems: 'Construction skills',
  },
  unitGoals: {
    3: {
      goal: 'Learn the Purpose Academy Construction Visual Vocabulary (660 words in pages of 20). Complete Level-1 (words 1–20) to continue; more pages stay open to practise.',
      outcomes: [
        'See a real photo of each object and hear English',
        'Connect your language to the English word and a short workplace sentence',
        'Use worksheet pages so the app matches the class vocabulary table',
      ],
    },
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
  vocab: CONSTRUCTION_VOCAB_660,
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
