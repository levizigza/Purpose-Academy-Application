/**
 * Construction Foundations content pack.
 * Vocabulary order: Daily Conversation (shared 200) → Construction Visual Vocabulary (660).
 * Level-1 gate = Daily Conversation words 1–20. Practice layers (Word → Action, Eye Spy,
 * Workplace Instructions) use Construction worksheet ids and con-vv image keys.
 */
import {
  EMPLOYMENT_PREP,
  FINAL_QUIZ,
  OBSERVATION_SCENARIOS,
  SAFETY_QUIZ,
  SITE_DECISIONS,
  SITE_PHRASES,
  SYSTEM_TOPICS,
  TOOL_CATEGORIES,
  UNIT_CHECKPOINTS,
} from '../../student/journeyCurriculum'
import type { PathwayPack } from '../types'
import {
  CONSTRUCTION_EYE_SPY_SCENES,
  CONSTRUCTION_WORD_ACTIONS,
  CONSTRUCTION_WORKPLACE_INSTRUCTIONS,
} from './constructionPractice'
import { CONSTRUCTION_VOCAB_660 } from './constructionVocab660'
import { DAILY_CONVERSATION_VOCAB_200 } from './dailyConversationVocab200'

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
      goal: 'Learn Daily Conversation Vocabulary (200 words shared across pathways), then Construction Visual Vocabulary (660). Complete Level-1 (words 1–20) to continue; more pages stay open to practise.',
      outcomes: [
        'See a real photo of each word and hear English',
        'Connect your language to the English word and a short example sentence',
        'Use worksheet pages so the app matches the class vocabulary table',
      ],
    },
    4: {
      goal: 'Use English with support, then prove you can find and follow construction-site language.',
      outcomes: [
        'Match pictures to English words',
        'Find tools and materials in a busy shop scene',
        'Follow short workplace instructions',
        'Understand common job-site phrases',
      ],
    },
    5: {
      goal: 'Build the digital, safety, tool, and systems foundations Alberta construction sites expect.',
      outcomes: [
        'Practice school computer tasks',
        'Pass required safety checks',
        'Name tool groups and construction systems',
      ],
    },
    6: {
      goal: 'Prove site readiness under observation, then connect to construction employment support.',
      outcomes: [
        'Rehearse competent skill order with measurable steps',
        'Make safe site decisions, including stop-work',
        'Pass the final checks and open employment support',
      ],
    },
  },
  stepTitles: {
    8: {
      title: 'Word → Action',
      help: 'See a site action. Choose which tool or material it uses.',
      purpose: 'Connect each Construction Visual Vocabulary word to a real job-site action.',
    },
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
  vocab: [...DAILY_CONVERSATION_VOCAB_200, ...CONSTRUCTION_VOCAB_660],
  wordActions: CONSTRUCTION_WORD_ACTIONS,
  eyeSpyScenes: CONSTRUCTION_EYE_SPY_SCENES,
  workplaceInstructions: CONSTRUCTION_WORKPLACE_INSTRUCTIONS,
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
