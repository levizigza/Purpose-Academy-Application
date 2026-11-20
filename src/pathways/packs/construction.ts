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
      goal: 'See each picture. Hear your language, then the English word. Then match each picture to its word, and find the pictures again.',
      outcomes: [
        'See a real photo of each word and hear English spoken every time',
        'Connect your language to the English word and a short example sentence',
        'Match each picture to its English word',
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
      goal: 'Watch a short computer lesson in English. Try that action. Then answer the practice questions.',
      outcomes: [
        'Turn the computer on, use the mouse and keyboard, and save your work',
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
      goal: 'Video section — watch construction equipment videos before hands-on training.',
      outcomes: [
        'Watch each machine video, then answer the questions',
        'Watch each machine lesson: know, inspect, protect',
        'Answer practice questions after each video',
        'Stay clear of powered machines unless certified elsewhere',
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
      help: 'Incomplete sentence above. Pick the full sentence that fits, hear it, then type it — soft try again if not yet.',
      purpose: 'Construction Questions mold — pick · hear · type the full sentence (play craft), then Word → Action.',
    },
    13: {
      title: 'Basic Computer Skills',
      help: 'Watch the lesson in English. Try that same action. Then answer the practice questions.',
      purpose: 'Dedicated Basic Computer Skills unit. First-computer friendly. Simple English.',
    },
    14: {
      title: 'Site Language',
      help: 'Hear a job-site phrase. Choose what it means.',
      purpose: 'Useful English you will hear on Alberta construction sites.',
    },
    17: {
      title: 'Tools & Equipment',
      help: 'Learn each tool group. Answer one check.',
      purpose: 'Safe naming before safe use with an instructor.',
    },
    18: {
      title: 'Construction Systems',
      help: 'Learn each system. Answer one check.',
      purpose: 'Your task feeds the whole building.',
    },
    19: {
      title: 'Video · Construction Equipment',
      help: 'Watch each machine in English. Then answer the practice questions. Powered machines are stay-clear awareness only — not a licence to operate.',
      purpose: 'Dedicated Video unit after systems — before observation and site training.',
    },
    21: {
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
