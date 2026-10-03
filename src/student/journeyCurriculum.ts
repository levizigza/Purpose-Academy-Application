/**
 * Student journey — Purpose Academy sequence:
 * Login → Register → Language → Baseline → Interest/Skills → Result →
 * Vocab (See/Listen/Understand/Repeat) → Word→Action → Supported practice →
 * English Eye Spy → Instructions → Site language → Digital → Safety →
 * Tools → Systems → Observation → On-site → Final exam/certificate → Employment
 *
 * Support languages: Spanish, Arabic, Hindi, Amharic, Tigrinya (no French).
 */

export const JOURNEY_STEPS = [
  { n: 1, title: 'Login', help: 'Choose Student to begin your path.', purpose: 'Students, instructors, and admins enter different doors.' },
  { n: 2, title: 'Registration', help: 'Tell us who you are so we can support you.', purpose: 'Your profile opens foundation learning after approval.' },
  { n: 3, title: 'Your Language', help: 'Choose your mother tongue for assessments and early learning support.', purpose: 'You take early checks in a language you understand. Later steps move to English-only.' },
  { n: 4, title: 'Baseline Assessment', help: 'Show what you already know — tools, safety, and workplace basics.', purpose: 'We place you correctly. This is not a pass/fail gate.' },
  { n: 5, title: 'Interest & Skills', help: 'What are you interested in, and what can you already do?', purpose: 'Pictures and short checks sort you toward the best career path.' },
  { n: 6, title: 'Your Result', help: 'See your assessment result and confirmed pathway.', purpose: 'Construction is the open specialized program. Other paths reuse this model next.' },
  { n: 7, title: 'Visual Vocabulary', help: 'See · Listen · Understand · Repeat', purpose: 'Clear object picture first. Mother tongue helps. English word last.' },
  { n: 8, title: 'Word → Action', help: 'Watch the word become a real site action.', purpose: 'Mirror what you see so classroom words connect to real movement.' },
  { n: 9, title: 'Supported Practice', help: 'Match words to pictures with help.', purpose: 'Practice with scaffolding. Mistakes teach.' },
  { n: 10, title: 'English Eye Spy', help: 'Find the real tool in a site scene — English only.', purpose: 'Prove you know the object in context, not just a clean product photo.' },
  { n: 11, title: 'Workplace Instructions', help: 'Hear a direction. Show you understood.', purpose: 'Short English instructions are how crews stay safe.' },
  { n: 12, title: 'Site Language', help: 'Apply words and sentences to real job-site talk.', purpose: 'Useful English you will actually hear on Alberta sites.' },
  { n: 13, title: 'Digital Skills', help: 'Learn computer basics for Canadian training and work.', purpose: 'This may be someone’s first computer — keep every step practical.' },
  { n: 14, title: 'Safety Training', help: 'Safety language with clear imagery — a required gate.', purpose: 'Alberta / Canada site safety in simple, usable English.' },
  { n: 15, title: 'Tools & Equipment', help: 'Name the tools you will use and how they work.', purpose: 'Safe naming before safe use under an instructor.' },
  { n: 16, title: 'Construction Systems', help: 'See how your role fits the whole build.', purpose: 'Systems thinking — not one task alone.' },
  { n: 17, title: 'Instructor Observation', help: 'View class progress and instructor-verified skills.', purpose: 'Learned → Practised → Competent under real observation.' },
  { n: 18, title: 'On-Site Training', help: 'Real workplace feedback from supervised site work.', purpose: 'Daily notes, tasks, and supervisor insights.' },
  { n: 19, title: 'Final Exam & Certificate', help: 'Written + practical checks. Pass to open your credential.', purpose: 'Vocabulary Eye Spy requires 100%. Exam attempts are limited.' },
  { n: 20, title: 'Employment Connection', help: 'See hiring partners and enter work with support.', purpose: 'Meaningful entry into a construction company — with follow-up.' },
] as const

export type SupportLang = 'Spanish' | 'Arabic' | 'Hindi' | 'Amharic' | 'Tigrinya'

export const SUPPORT_LANGUAGES: { id: SupportLang; flag: string }[] = [
  { id: 'Spanish', flag: 'ES' },
  { id: 'Arabic', flag: 'AR' },
  { id: 'Hindi', flag: 'HI' },
  { id: 'Amharic', flag: 'AM' },
  { id: 'Tigrinya', flag: 'TI' },
]

export type VocabTerm = {
  id: string
  english: string
  emoji: string
  /** Key into toolImages — must show THIS object clearly. */
  imageKey: string
  definition: string
  sentence: string
  gloss: Record<SupportLang, string>
}

/**
 * Construction Level 1 visual vocabulary.
 * Gloss values are spoken aloud (Web Speech). Latin transliterations keep TTS reliable.
 */
export const VOCAB_UNIT: VocabTerm[] = [
  {
    id: 'hammer',
    english: 'Hammer',
    emoji: 'H',
    imageKey: 'hammer',
    definition: 'A tool used to drive nails.',
    sentence: 'Pass me the hammer.',
    gloss: {
      Spanish: 'Martillo',
      Arabic: 'Mitraga',
      Hindi: 'Hathoda',
      Amharic: 'Medosha',
      Tigrinya: 'Medasha',
    },
  },
  {
    id: 'tape',
    english: 'Tape measure',
    emoji: 'T',
    imageKey: 'tape-measure',
    definition: 'A tool that measures length.',
    sentence: 'Measure the board with the tape measure.',
    gloss: {
      Spanish: 'Cinta metrica',
      Arabic: 'Sharit qiyas',
      Hindi: 'Tape measure',
      Amharic: 'Melekiya tape',
      Tigrinya: 'Melekiya tape',
    },
  },
  {
    id: 'drill',
    english: 'Drill',
    emoji: 'D',
    imageKey: 'drill',
    definition: 'A power tool that makes holes or drives screws.',
    sentence: 'Use the drill on low speed first.',
    gloss: {
      Spanish: 'Taladro',
      Arabic: 'Mithqab',
      Hindi: 'Drill',
      Amharic: 'Kufaro',
      Tigrinya: 'Kufaro',
    },
  },
  {
    id: 'level',
    english: 'Level',
    emoji: 'L',
    imageKey: 'level',
    definition: 'A tool that shows if a surface is flat.',
    sentence: 'Check the wall with a level.',
    gloss: {
      Spanish: 'Nivel',
      Arabic: 'Mizan',
      Hindi: 'Level',
      Amharic: 'Dereja melekiya',
      Tigrinya: 'Dereja melekiya',
    },
  },
  {
    id: 'saw',
    english: 'Saw',
    emoji: 'S',
    imageKey: 'saw',
    definition: 'A tool that cuts wood.',
    sentence: 'Keep hands clear of the saw.',
    gloss: {
      Spanish: 'Sierra',
      Arabic: 'Minshar',
      Hindi: 'Ara',
      Amharic: 'Megeremya',
      Tigrinya: 'Megeremya',
    },
  },
  {
    id: 'hard-hat',
    english: 'Hard hat',
    emoji: 'HH',
    imageKey: 'hard-hat',
    definition: 'A hard hat protects your head on site.',
    sentence: 'Put on your hard hat before you enter.',
    gloss: {
      Spanish: 'Casco',
      Arabic: 'Khudha',
      Hindi: 'Hard hat',
      Amharic: 'Yeras mekelakiya',
      Tigrinya: 'Nay ris mekelakeli',
    },
  },
  {
    id: 'ppe',
    english: 'PPE',
    emoji: 'P',
    imageKey: 'ppe',
    definition: 'Personal protective equipment — hard hat, boots, glasses, gloves.',
    sentence: 'Wear your PPE before entering the shop.',
    gloss: {
      Spanish: 'Equipo de proteccion personal',
      Arabic: 'Muaddat al-himaya al-shakhsiya',
      Hindi: 'Suraksha upkaran',
      Amharic: 'Yegil mekelakiya mesariya',
      Tigrinya: 'Nay wilqe mekelakeli mesarhi',
    },
  },
]

export type QuizItem = {
  id: string
  prompt: string
  emoji: string
  imageKey?: string
  options: string[]
  answer: string
  teachCorrect: string
  teachWrong: string
}

/** Eye Spy hotspot inside a construction scene (percent positions). */
export type EyeSpyHotspot = {
  id: string
  label: string
  /** Correct English answer for this hotspot when it is the target. */
  answer: string
  imageKey: string
  x: number
  y: number
  w: number
  h: number
}

export type EyeSpyScene = {
  id: string
  title: string
  /** Instruction shown with the scene (English). */
  instruction: string
  /** Which hotspot is the correct find target. */
  targetId: string
  distractors: string[]
  hotspots: EyeSpyHotspot[]
  /** Alternate layout ids — rotate when the learner answers wrong. */
  variantGroup: string
}

/**
 * Eye Spy scenes: find the named object in a busy site layout.
 * Wrong answer → next variant in the same group (scene changes).
 */
export const EYE_SPY_SCENES: EyeSpyScene[] = [
  {
    id: 'shop-a-hammer',
    title: 'Shop floor A',
    instruction: 'Find the hammer. Tap it in the scene, then confirm the English name.',
    targetId: 'hammer',
    distractors: ['Saw', 'Level', 'Hard hat'],
    variantGroup: 'shop-hammer',
    hotspots: [
      { id: 'hammer', label: 'Hammer', answer: 'Hammer', imageKey: 'hammer', x: 12, y: 55, w: 22, h: 28 },
      { id: 'saw', label: 'Saw', answer: 'Saw', imageKey: 'saw', x: 58, y: 48, w: 28, h: 22 },
      { id: 'hard-hat', label: 'Hard hat', answer: 'Hard hat', imageKey: 'hard-hat', x: 38, y: 12, w: 20, h: 22 },
      { id: 'level', label: 'Level', answer: 'Level', imageKey: 'level', x: 70, y: 18, w: 24, h: 14 },
    ],
  },
  {
    id: 'shop-b-hammer',
    title: 'Shop floor B',
    instruction: 'Find the hammer. Tap it in the scene, then confirm the English name.',
    targetId: 'hammer',
    distractors: ['Drill', 'Tape measure', 'PPE'],
    variantGroup: 'shop-hammer',
    hotspots: [
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 10, y: 20, w: 22, h: 30 },
      { id: 'hammer', label: 'Hammer', answer: 'Hammer', imageKey: 'hammer', x: 62, y: 50, w: 24, h: 30 },
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 40, y: 58, w: 18, h: 22 },
      { id: 'ppe', label: 'PPE', answer: 'PPE', imageKey: 'ppe', x: 72, y: 10, w: 22, h: 26 },
    ],
  },
  {
    id: 'bay-a-drill',
    title: 'Work bay A',
    instruction: 'Find the drill. Tap it in the scene, then confirm the English name.',
    targetId: 'drill',
    distractors: ['Hammer', 'Saw', 'Level'],
    variantGroup: 'bay-drill',
    hotspots: [
      { id: 'saw', label: 'Saw', answer: 'Saw', imageKey: 'saw', x: 8, y: 50, w: 30, h: 20 },
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 48, y: 28, w: 22, h: 34 },
      { id: 'hammer', label: 'Hammer', answer: 'Hammer', imageKey: 'hammer', x: 76, y: 55, w: 18, h: 28 },
      { id: 'level', label: 'Level', answer: 'Level', imageKey: 'level', x: 20, y: 14, w: 28, h: 12 },
    ],
  },
  {
    id: 'bay-b-drill',
    title: 'Work bay B',
    instruction: 'Find the drill. Tap it in the scene, then confirm the English name.',
    targetId: 'drill',
    distractors: ['Hard hat', 'Tape measure', 'PPE'],
    variantGroup: 'bay-drill',
    hotspots: [
      { id: 'hard-hat', label: 'Hard hat', answer: 'Hard hat', imageKey: 'hard-hat', x: 14, y: 10, w: 20, h: 24 },
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 68, y: 60, w: 18, h: 22 },
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 40, y: 40, w: 24, h: 36 },
      { id: 'ppe', label: 'PPE', answer: 'PPE', imageKey: 'ppe', x: 74, y: 12, w: 20, h: 26 },
    ],
  },
  {
    id: 'rack-a-level',
    title: 'Tool rack A',
    instruction: 'Find the level. Tap it in the scene, then confirm the English name.',
    targetId: 'level',
    distractors: ['Hammer', 'Saw', 'Drill'],
    variantGroup: 'rack-level',
    hotspots: [
      { id: 'level', label: 'Level', answer: 'Level', imageKey: 'level', x: 30, y: 40, w: 40, h: 16 },
      { id: 'hammer', label: 'Hammer', answer: 'Hammer', imageKey: 'hammer', x: 8, y: 55, w: 18, h: 28 },
      { id: 'saw', label: 'Saw', answer: 'Saw', imageKey: 'saw', x: 58, y: 58, w: 30, h: 18 },
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 78, y: 18, w: 18, h: 30 },
    ],
  },
  {
    id: 'rack-b-level',
    title: 'Tool rack B',
    instruction: 'Find the level. Tap it in the scene, then confirm the English name.',
    targetId: 'level',
    distractors: ['Tape measure', 'Hard hat', 'PPE'],
    variantGroup: 'rack-level',
    hotspots: [
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 10, y: 50, w: 18, h: 24 },
      { id: 'level', label: 'Level', answer: 'Level', imageKey: 'level', x: 42, y: 22, w: 36, h: 14 },
      { id: 'hard-hat', label: 'Hard hat', answer: 'Hard hat', imageKey: 'hard-hat', x: 72, y: 48, w: 20, h: 24 },
      { id: 'ppe', label: 'PPE', answer: 'PPE', imageKey: 'ppe', x: 20, y: 12, w: 20, h: 26 },
    ],
  },
]

export const BASELINE_QUIZ: QuizItem[] = [
  {
    id: 'b1',
    prompt: 'Look at this picture. What is it?',
    emoji: 'HH',
    imageKey: 'hard-hat',
    options: ['Hard hat', 'Hammer', 'Tape measure', 'Paint brush'],
    answer: 'Hard hat',
    teachCorrect: 'Yes — this is a hard hat. It protects your head.',
    teachWrong: 'Look again. The picture shows a hard hat for the head.',
  },
  {
    id: 'b2',
    prompt: 'Look at this picture. What tool is this?',
    emoji: 'HM',
    imageKey: 'hammer',
    options: ['Hammer', 'Ladder', 'Hard hat', 'Paint'],
    answer: 'Hammer',
    teachCorrect: 'Yes — a hammer drives nails.',
    teachWrong: 'The picture shows a hammer, not a ladder or hard hat.',
  },
  {
    id: 'b3',
    prompt: 'Look at this picture. What must you wear before work?',
    emoji: '!',
    imageKey: 'ppe',
    options: ['PPE', 'Sandals', 'Loose jewelry', 'Nothing special'],
    answer: 'PPE',
    teachCorrect: 'Yes — PPE protects your body on site.',
    teachWrong: 'The picture shows PPE: hard hat, glasses, gloves, and boots.',
  },
  {
    id: 'b4',
    prompt: 'Look at this picture. Which tool measures length?',
    emoji: 'TM',
    imageKey: 'tape-measure',
    options: ['Tape measure', 'Saw', 'Hard hat', 'Nail'],
    answer: 'Tape measure',
    teachCorrect: 'Yes — a tape measure shows length.',
    teachWrong: 'The picture shows a tape measure with numbers for length.',
  },
]

/** Interest + skill picture assessment (pathway sorting). */
export const INTEREST_PATHS = [
  {
    id: 'construction' as const,
    title: 'Construction',
    line: 'Build Skills, Build Futures.',
    detail: 'Tools, safety, framing, and site work.',
    skills: [
      { id: 'c1', label: 'I can name basic hand tools', weight: 2 },
      { id: 'c2', label: 'I can follow a short safety rule', weight: 2 },
      { id: 'c3', label: 'I have used tools before (any level)', weight: 1 },
    ],
  },
  {
    id: 'logistics' as const,
    title: 'Logistics',
    line: 'Move People, Move Opportunities.',
    detail: 'Warehouse, loading, and moving goods — opens after Construction.',
    skills: [
      { id: 'l1', label: 'I can read simple labels on boxes', weight: 2 },
      { id: 'l2', label: 'I can lift and place items carefully', weight: 1 },
      { id: 'l3', label: 'I like organized, moving work', weight: 1 },
    ],
  },
  {
    id: 'community' as const,
    title: 'Community Support',
    line: 'Stronger People, Stronger Communities.',
    detail: 'Helping people in community roles — planned next.',
    skills: [
      { id: 'm1', label: 'I can greet and help people calmly', weight: 2 },
      { id: 'm2', label: 'I can follow care or support routines', weight: 1 },
      { id: 'm3', label: 'I want people-focused work', weight: 1 },
    ],
  },
]

export const SAFETY_QUIZ: QuizItem[] = [
  {
    id: 's1',
    prompt: 'Look at this picture. What must you wear in the shop?',
    emoji: 'PPE',
    imageKey: 'ppe',
    options: ['PPE', 'Sandals', 'Loose jewelry', 'Skip all PPE indoors'],
    answer: 'PPE',
    teachCorrect: 'PPE first — hard hat, boots, eye protection, and other required gear.',
    teachWrong: 'The picture shows PPE. It is required before work starts.',
  },
  {
    id: 's2',
    prompt: 'Look at this hard hat. Why do workers wear it?',
    emoji: 'HZ',
    imageKey: 'hard-hat',
    options: ['To protect the head', 'To measure wood', 'To cut boards', 'To drive nails'],
    answer: 'To protect the head',
    teachCorrect: 'Yes — a hard hat protects the head from falling objects and bumps.',
    teachWrong: 'A hard hat is head protection — not a measuring or cutting tool.',
  },
  {
    id: 's3',
    prompt: 'Someone is hurt. What is your first job?',
    emoji: 'EM',
    imageKey: 'ppe',
    options: ['Call for help / follow emergency steps', 'Keep working', 'Move heavy equipment alone', 'Film the scene first'],
    answer: 'Call for help / follow emergency steps',
    teachCorrect: 'Emergency procedures come first — people before production.',
    teachWrong: 'In an emergency, follow the site procedure and get help immediately.',
  },
]

export const FINAL_QUIZ: QuizItem[] = [
  {
    id: 'f1',
    prompt: 'Safety: Look at this gear. When do you put on PPE?',
    emoji: 'S',
    imageKey: 'ppe',
    options: ['Before you start work', 'After the first cut', 'Only if the boss is watching', 'Never on indoor jobs'],
    answer: 'Before you start work',
    teachCorrect: 'PPE before work — every time.',
    teachWrong: 'PPE is on before work begins.',
  },
  {
    id: 'f2',
    prompt: 'Measurement: Look at this tool. Measure twice, then…',
    emoji: 'M',
    imageKey: 'tape-measure',
    options: ['Cut once', 'Guess the length', 'Skip the level', 'Throw the offcut'],
    answer: 'Cut once',
    teachCorrect: 'Measure twice, cut once — classic site discipline.',
    teachWrong: 'Measuring carefully prevents mistakes and waste.',
  },
  {
    id: 'f3',
    prompt: 'Language: Look at this tool. "Bring the level to bay two." What do you bring?',
    emoji: 'L',
    imageKey: 'level',
    options: ['Level', 'Lunch', 'Ladder only', 'Paint'],
    answer: 'Level',
    teachCorrect: 'You followed a short workplace instruction in English.',
    teachWrong: 'The tool named in the instruction is the level.',
  },
  {
    id: 'f4',
    prompt: 'Knowledge: A stud is…',
    emoji: 'K',
    options: ['A vertical framing member in a wall', 'A type of paint', 'A soft glove', 'A lunch break'],
    answer: 'A vertical framing member in a wall',
    teachCorrect: 'Studs are vertical framing members.',
    teachWrong: 'In framing, a stud is a vertical wall member.',
  },
]

/** Word → action clips (mirror-neuron style pairing). */
export const WORD_ACTIONS = [
  {
    id: 'wa-hammer',
    termId: 'hammer',
    title: 'Hammer in action',
    body: 'Watch: a worker drives a nail with a hammer. Your job later: pass the hammer safely, head down.',
    actionCue: 'Drive the nail. Hands clear of the strike zone.',
  },
  {
    id: 'wa-tape',
    termId: 'tape',
    title: 'Tape measure in action',
    body: 'Watch: measure twice on a board. Numbers face you. Hook the end firmly.',
    actionCue: 'Measure twice. Mark once. Cut once.',
  },
  {
    id: 'wa-drill',
    termId: 'drill',
    title: 'Drill in action',
    body: 'Watch: low speed first, bit straight, both hands steady.',
    actionCue: 'Low speed. Straight bit. Eye protection on.',
  },
  {
    id: 'wa-ppe',
    termId: 'ppe',
    title: 'PPE before entry',
    body: 'Watch: hard hat, glasses, gloves, boots — then enter the shop.',
    actionCue: 'PPE on before you cross the line.',
  },
]

export const TOOL_CATEGORIES = [
  { title: 'Hand tools', why: 'Hammer, tape measure, screwdriver — control comes from you.', mark: 'HT' },
  { title: 'Power tools', why: 'Drill and saw — electricity or batteries. Extra care required.', mark: 'PT' },
  { title: 'Materials', why: 'Wood, drywall, fasteners — what you build with.', mark: 'MT' },
  { title: 'Mobile equipment', why: 'Lifts and machines. Only with proper training and authorization.', mark: 'ME' },
]

export const SYSTEM_TOPICS = [
  { title: 'Framing', why: 'The skeleton of a building — walls and structure. Your cuts feed the whole wall.', mark: 'FR' },
  { title: 'Interior finishes', why: 'Drywall, paint, flooring — what people see inside.', mark: 'IF' },
  { title: 'Exterior systems', why: 'Siding, roofs, weather protection.', mark: 'EX' },
  { title: 'Trade awareness', why: 'How electrical, plumbing, and HVAC fit the build.', mark: 'TR' },
  { title: 'Measurement & math', why: 'Measure twice. Simple math keeps cuts and levels true across the crew.', mark: 'MM' },
]

export const COMPUTER_SKILLS = [
  { id: 'mouse', title: 'Use a mouse or trackpad', why: 'Click, scroll, and select without help.' },
  { id: 'type', title: 'Type short answers', why: 'You can enter your name and simple sentences.' },
  { id: 'upload', title: 'Upload a photo or file', why: 'Evidence and assignments need uploads.' },
  { id: 'video', title: 'Play a short training video', why: 'Lessons include watch-and-check moments.' },
  { id: 'form', title: 'Complete an online form', why: 'Registration, logs, and quizzes are forms.' },
]

/** Attempt policy: exercises unlimited; exams limited. */
export const ATTEMPT_POLICY = {
  exerciseMax: null as number | null,
  examMax: 3,
  vocabPassPercent: 100,
} as const

export { speakEnglish, speakSupport, speakBilingual, stopSpeech, primeSpeech } from './speech'
