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
      goal: 'Put the words into Construction Questions sentences, then follow workplace instructions.',
      outcomes: [
        'Complete Construction English cloze worksheets — one try, correct word slides into the blank',
        'Connect word → site action',
        'Match pictures to English words',
        'Follow short workplace instructions',
      ],
    },
    5: {
      goal: 'Learn site phrases, then answer more questions about work you like after Construction practice.',
      outcomes: [
        'Understand common job-site phrases',
        'Answer more questions about work you like',
        'See how your interests fit Construction specialization',
      ],
    },
    6: {
      goal: 'Unit 6 · Basic Computer Skills (step 12) — same station on Construction, Logistics, and Community.',
      outcomes: [
        'Open Basic Computer Skills at step 12 on this pathway',
        'Watch, try, and check: power, mouse, folders, save, Word, and email',
        'Use simple English — Watch → Try → Remember → one check',
      ],
    },
    7: {
      goal: 'Build safety, tool, and systems foundations Alberta construction sites expect.',
      outcomes: [
        'Finish the safety practice',
        'Name tool groups and construction systems',
      ],
    },
    8: {
      goal: 'Open the Video section (Warehouse Equipment) when training on Logistics — Construction continues to observation.',
      outcomes: [
        'Know where Unit 8 · Video · Warehouse Equipment lives (Logistics · step 18)',
        'Continue Construction into instructor observation when ready',
      ],
    },
    9: {
      goal: 'Practise with an instructor, then connect to construction employment support.',
      outcomes: [
        'Practise the steps in a calm order',
        'Make safe site decisions, including stop-work',
        'Finish the last practice stations, then talk about work',
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
      help: 'Four word choices stay visible. Type the matching word into the blank — soft try again if not yet. Correct words slide in.',
      purpose: 'Construction Questions mold — type the specialty word (play craft), then Word → Action.',
    },
    12: {
      title: 'Basic Computer Skills',
      help: 'Unit 6 · step 12 on every pathway — twelve short lessons: turn on/off, mouse, folders, save, Word, and email. Watch, then try.',
      purpose: 'Dedicated Basic Computer Skills unit. First-computer friendly. Simple English.',
    },
    13: {
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
      title: 'Equipment videos',
      help: 'Fourteen construction machines. Watch each video, then answer the practice questions — awareness and stay-clear, not operator certification.',
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
