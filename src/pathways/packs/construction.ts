/**
 * Construction Foundations content pack.
 * Vocabulary order: Daily Conversation (shared 200) → Construction Visual Vocabulary (660)
 * → language organize → Eye Spy → Sentence Structure (560 cloze) → Word → Action → Workplace Instructions.
 * Level-1 vocab gate = Daily Conversation words 1–20. Practice layers use Construction
 * worksheet ids and con-vv image keys.
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
import { CONSTRUCTION_SENTENCE_CLOZE_560 } from './constructionSentenceCloze560'
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
      goal: 'Learn Daily Conversation Vocabulary (200) and Construction Visual Vocabulary (660), organize four words across five languages, then find every picture again in Eye Spy.',
      outcomes: [
        'See a real photo of each word and hear English spoken every time',
        'Connect your language to the English word and a short example sentence',
        'Match each complete language group (all versions of the word) to its picture',
        'Identify every tool and material in busy shop scenes',
      ],
    },
    4: {
      goal: 'Put the words into Construction Questions sentences, then follow construction-site language.',
      outcomes: [
        'Complete Construction English cloze worksheets — one try, correct word slides into the blank',
        'Connect word → site action',
        'Match pictures to English words',
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
      goal: 'Open the Video section (Warehouse Equipment) when training on Logistics — Construction continues to observation.',
      outcomes: [
        'Know where the dedicated Video · Warehouse Equipment station lives (Logistics · step 18)',
        'Continue Construction into instructor observation when ready',
      ],
    },
    7: {
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
      title: 'English Eye Spy',
      help: 'Ten scenes. Tap a picture and its English name. Correct pairs disappear until the board is empty.',
      purpose: 'Connect Visual Vocabulary again in a busy scene before Sentence Structure.',
    },
    9: {
      title: 'Sentence Structure',
      help: 'Choose the word that completes the sentence. One try — if it is wrong, we show the answer and move on. Correct words slide into the blank.',
      purpose: 'Construction Questions worksheet mold (blank + four choices), then Word → Action.',
    },
    12: {
      title: 'Site Language',
      help: 'Hear a job-site phrase. Choose what it means.',
      purpose: 'Useful English you will hear on Alberta construction sites.',
    },
    16: {
      title: 'Tools & Equipment',
      help: 'Learn each tool group. Answer one check.',
      purpose: 'Safe naming before safe use with an instructor.',
    },
    17: {
      title: 'Construction Systems',
      help: 'Learn each system. Answer one check.',
      purpose: 'Your task feeds the whole building.',
    },
    18: {
      title: 'Equipment Familiarization',
      help: 'Construction equipment habits are practised with your instructor after systems. Continue when you are ready for observation.',
      purpose: 'Bridge from systems knowledge to supervised hands-on checks.',
    },
    20: {
      title: 'On-Site Training',
      help: 'Make site decisions and log the day like a real crew member.',
      purpose: 'Daily judgment, notes, and site feedback.',
    },
  },
  vocab: [...DAILY_CONVERSATION_VOCAB_200, ...CONSTRUCTION_VOCAB_660],
  sentenceCloze: CONSTRUCTION_SENTENCE_CLOZE_560,
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
