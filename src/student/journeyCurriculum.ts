/**
 * Student journey — Purpose Academy sequence:
 * Login → Register → Language → Career Assessment → Work Style → Profile →
 * Vocab → Word→Action → Supported practice →
 * English Eye Spy → Instructions → Site language → Digital → Safety →
 * Tools → Systems → Observation → On-site → Final exam/certificate → Employment
 *
 * Support languages: English, Spanish, Arabic, Hindi, Amharic, Tigrinya (no French).
 */

export const JOURNEY_STEPS = [
  { n: 1, title: 'Start as Student', help: 'Begin your learning path.', purpose: 'Students, instructors, and admins use different doors.', unit: 1 },
  { n: 2, title: 'Registration', help: 'Tell us who you are so we can support you.', purpose: 'Your profile opens learning after approval.', unit: 1 },
  { n: 3, title: 'Your Language', help: 'Choose your mother tongue for the career assessment.', purpose: 'The full assessment runs in a language you understand. Later job-site steps use English.', unit: 2 },
  { n: 4, title: 'Career Assessment', help: 'Rate work activities in your language.', purpose: 'A professional interest inventory — not a pass/fail quiz.', unit: 2 },
  { n: 5, title: 'Work Style', help: 'How you like to work — in your language.', purpose: 'Work-style choices refine your pathway fit.', unit: 2 },
  { n: 6, title: 'Your Career Profile', help: 'See the path that fits your answers.', purpose: 'Interest profile → recommended pathway. Construction is open now.', unit: 2 },
  { n: 7, title: 'Visual Vocabulary', help: 'One picture at a time — hear English, then go to the next word.', purpose: 'Same clear card for each tool: picture, home language, English audio. Finish the full set.', unit: 3 },
  { n: 8, title: 'Word → Action', help: 'See the action. Prove which tool it uses.', purpose: 'Link English words to real movement with a quick check.', unit: 3 },
  { n: 9, title: 'Supported Practice', help: 'Match words to pictures with help.', purpose: 'Practice with help. Mistakes teach.', unit: 4 },
  { n: 10, title: 'English Eye Spy', help: 'Find the real tool in a site scene — English only.', purpose: 'Prove you know the object among other tools.', unit: 4 },
  { n: 11, title: 'Workplace Instructions', help: 'Hear a direction. Show you understood.', purpose: 'Short English instructions keep crews safe.', unit: 4 },
  { n: 12, title: 'Site Language', help: 'Hear a job-site phrase. Choose what it means.', purpose: 'Useful English you will hear on Alberta sites.', unit: 4 },
  { n: 13, title: 'Digital Skills', help: 'Practice real computer tasks — click, type, forms, uploads.', purpose: 'This may be someone’s first computer — every step is a hands-on micro-lesson.', unit: 5 },
  { n: 14, title: 'Safety Training', help: 'Safety words with clear pictures — required.', purpose: 'Alberta / Canada site safety in simple English.', unit: 5 },
  { n: 15, title: 'Tools & Equipment', help: 'Learn each tool group. Answer one check.', purpose: 'Safe naming before safe use with an instructor.', unit: 5 },
  { n: 16, title: 'Construction Systems', help: 'Learn each system. Answer one check.', purpose: 'Your task feeds the whole building.', unit: 5 },
  { n: 17, title: 'Instructor Observation', help: 'Rehearse competent skill order before a real instructor check.', purpose: 'Learned → Practised → Competent under real observation.', unit: 6 },
  { n: 18, title: 'On-Site Training', help: 'Make site decisions and log the day like a real crew member.', purpose: 'Daily judgment, notes, and site feedback.', unit: 6 },
  { n: 19, title: 'Final Exam & Certificate', help: 'Written + practical checks. Pass to open your certificate.', purpose: 'Eye Spy needs 100%. Exam tries are limited.', unit: 6 },
  { n: 20, title: 'Employment Connection', help: 'Interview prep, then hiring partners and work support.', purpose: 'Start work with follow-up support.', unit: 6 },
] as const

/** Path units — structured learning path on the existing train template. */
export const LEARNING_UNITS = [
  { id: 1, label: 'Start', range: '1–2' },
  { id: 2, label: 'Find your path', range: '3–6' },
  { id: 3, label: 'Learn the words', range: '7–8' },
  { id: 4, label: 'Practice English', range: '9–12' },
  { id: 5, label: 'Site ready', range: '13–16' },
  { id: 6, label: 'Work ready', range: '17–20' },
] as const

/** Unit goals — shown at the start of each learning unit (Duolingo/Khan clarity). */
export const UNIT_GOALS: Record<number, { goal: string; outcomes: string[] }> = {
  1: {
    goal: 'Enter the school as a student and open your learning account.',
    outcomes: ['Choose the student door', 'Complete registration'],
  },
  2: {
    goal: 'Discover the pathway that fits how you like to work.',
    outcomes: [
      'Choose a support language',
      'Complete a professional career assessment',
      'See your Construction / Logistics / Community fit',
    ],
  },
  3: {
    goal: 'Learn the Level-1 tool words you will hear on a Calgary job site.',
    outcomes: [
      'See each tool and hear English',
      'Connect the English word to the real action',
    ],
  },
  4: {
    goal: 'Use English with support, then prove you can find and follow job-site language.',
    outcomes: [
      'Match pictures to English words',
      'Find tools in a busy scene',
      'Follow short workplace instructions',
      'Understand common site phrases',
    ],
  },
  5: {
    goal: 'Build the digital, safety, tool, and systems foundations every site expects.',
    outcomes: [
      'Practice school computer tasks',
      'Pass required safety checks',
      'Name tool groups and building systems',
    ],
  },
  6: {
    goal: 'Show ready-for-work habits: observation, site notes, exam, and employment next steps.',
    outcomes: [
      'Prepare for instructor observation',
      'Log a site day correctly',
      'Pass the final checks',
      'Connect with hiring partners',
    ],
  },
}

export function unitForStep(step: number) {
  const meta = JOURNEY_STEPS[step - 1]
  const id = meta?.unit ?? 1
  return LEARNING_UNITS.find((u) => u.id === id) || LEARNING_UNITS[0]
}

/** First step number of each learning unit — used for unit intro cards. */
export function isUnitEntryStep(step: number) {
  return JOURNEY_STEPS.some((s) => s.n === step && JOURNEY_STEPS.find((x) => x.unit === s.unit)?.n === step)
}

export type SupportLang = 'English' | 'Spanish' | 'Arabic' | 'Hindi' | 'Amharic' | 'Tigrinya'

export const SUPPORT_LANGUAGES: { id: SupportLang; flag: string }[] = [
  { id: 'English', flag: 'EN' },
  { id: 'Spanish', flag: 'ES' },
  { id: 'Arabic', flag: 'AR' },
  { id: 'Hindi', flag: 'HI' },
  { id: 'Amharic', flag: 'AM' },
  { id: 'Tigrinya', flag: 'TI' },
]

/** Home languages shown on vocabulary cards (English is the word title itself). */
export type HomeLang = Exclude<SupportLang, 'English'>

export const HOME_LANGUAGES: HomeLang[] = ['Spanish', 'Arabic', 'Hindi', 'Amharic', 'Tigrinya']

export type VocabTerm = {
  id: string
  english: string
  emoji: string
  /** Key into toolImages — must show THIS object clearly. */
  imageKey: string
  definition: string
  sentence: string
  gloss: Record<HomeLang, string>
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
    english: 'Safety gear (PPE)',
    emoji: 'P',
    imageKey: 'ppe',
    definition: 'Safety gear (PPE) means hard hat, boots, glasses, and gloves.',
    sentence: 'Wear your safety gear (PPE) before entering the shop.',
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
    distractors: ['Drill', 'Tape measure', 'Safety gear (PPE)'],
    variantGroup: 'shop-hammer',
    hotspots: [
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 10, y: 20, w: 22, h: 30 },
      { id: 'hammer', label: 'Hammer', answer: 'Hammer', imageKey: 'hammer', x: 62, y: 50, w: 24, h: 30 },
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 40, y: 58, w: 18, h: 22 },
      { id: 'ppe', label: 'Safety gear (PPE)', answer: 'Safety gear (PPE)', imageKey: 'ppe', x: 72, y: 10, w: 22, h: 26 },
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
    distractors: ['Hard hat', 'Tape measure', 'Safety gear (PPE)'],
    variantGroup: 'bay-drill',
    hotspots: [
      { id: 'hard-hat', label: 'Hard hat', answer: 'Hard hat', imageKey: 'hard-hat', x: 14, y: 10, w: 20, h: 24 },
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 68, y: 60, w: 18, h: 22 },
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 40, y: 40, w: 24, h: 36 },
      { id: 'ppe', label: 'Safety gear (PPE)', answer: 'Safety gear (PPE)', imageKey: 'ppe', x: 74, y: 12, w: 20, h: 26 },
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
    distractors: ['Tape measure', 'Hard hat', 'Safety gear (PPE)'],
    variantGroup: 'rack-level',
    hotspots: [
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 10, y: 50, w: 18, h: 24 },
      { id: 'level', label: 'Level', answer: 'Level', imageKey: 'level', x: 42, y: 22, w: 36, h: 14 },
      { id: 'hard-hat', label: 'Hard hat', answer: 'Hard hat', imageKey: 'hard-hat', x: 72, y: 48, w: 20, h: 24 },
      { id: 'ppe', label: 'Safety gear (PPE)', answer: 'Safety gear (PPE)', imageKey: 'ppe', x: 20, y: 12, w: 20, h: 26 },
    ],
  },
  {
    id: 'bench-a-tape',
    title: 'Bench A',
    instruction: 'Find the tape measure. Tap it in the scene, then confirm the English name.',
    targetId: 'tape',
    distractors: ['Hammer', 'Level', 'Saw'],
    variantGroup: 'bench-tape',
    hotspots: [
      { id: 'hammer', label: 'Hammer', answer: 'Hammer', imageKey: 'hammer', x: 12, y: 40, w: 20, h: 30 },
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 48, y: 52, w: 20, h: 24 },
      { id: 'level', label: 'Level', answer: 'Level', imageKey: 'level', x: 68, y: 18, w: 26, h: 14 },
      { id: 'saw', label: 'Saw', answer: 'Saw', imageKey: 'saw', x: 20, y: 70, w: 28, h: 18 },
    ],
  },
  {
    id: 'bench-b-tape',
    title: 'Bench B',
    instruction: 'Find the tape measure. Tap it in the scene, then confirm the English name.',
    targetId: 'tape',
    distractors: ['Drill', 'Hard hat', 'Safety gear (PPE)'],
    variantGroup: 'bench-tape',
    hotspots: [
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 10, y: 22, w: 22, h: 32 },
      { id: 'hard-hat', label: 'Hard hat', answer: 'Hard hat', imageKey: 'hard-hat', x: 70, y: 12, w: 20, h: 24 },
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 42, y: 48, w: 20, h: 26 },
      { id: 'ppe', label: 'Safety gear (PPE)', answer: 'Safety gear (PPE)', imageKey: 'ppe', x: 72, y: 55, w: 20, h: 26 },
    ],
  },
  {
    id: 'cut-a-saw',
    title: 'Cut station A',
    instruction: 'Find the saw. Tap it in the scene, then confirm the English name.',
    targetId: 'saw',
    distractors: ['Hammer', 'Drill', 'Level'],
    variantGroup: 'cut-saw',
    hotspots: [
      { id: 'saw', label: 'Saw', answer: 'Saw', imageKey: 'saw', x: 36, y: 48, w: 34, h: 22 },
      { id: 'hammer', label: 'Hammer', answer: 'Hammer', imageKey: 'hammer', x: 8, y: 50, w: 18, h: 28 },
      { id: 'drill', label: 'Drill', answer: 'Drill', imageKey: 'drill', x: 74, y: 30, w: 18, h: 30 },
      { id: 'level', label: 'Level', answer: 'Level', imageKey: 'level', x: 20, y: 16, w: 28, h: 12 },
    ],
  },
  {
    id: 'cut-b-saw',
    title: 'Cut station B',
    instruction: 'Find the saw. Tap it in the scene, then confirm the English name.',
    targetId: 'saw',
    distractors: ['Tape measure', 'Hard hat', 'Safety gear (PPE)'],
    variantGroup: 'cut-saw',
    hotspots: [
      { id: 'tape', label: 'Tape measure', answer: 'Tape measure', imageKey: 'tape-measure', x: 12, y: 58, w: 18, h: 22 },
      { id: 'saw', label: 'Saw', answer: 'Saw', imageKey: 'saw', x: 44, y: 40, w: 32, h: 22 },
      { id: 'hard-hat', label: 'Hard hat', answer: 'Hard hat', imageKey: 'hard-hat', x: 72, y: 12, w: 20, h: 24 },
      { id: 'ppe', label: 'Safety gear (PPE)', answer: 'Safety gear (PPE)', imageKey: 'ppe', x: 70, y: 55, w: 22, h: 26 },
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
    options: ['Safety gear (PPE)', 'Sandals', 'Loose jewelry', 'Nothing special'],
    answer: 'Safety gear (PPE)',
    teachCorrect: 'Yes — safety gear (PPE) protects your body on site.',
    teachWrong: 'The picture shows safety gear (PPE): hard hat, glasses, gloves, and boots.',
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
    options: ['Safety gear (PPE)', 'Sandals', 'Loose jewelry', 'Skip all gear indoors'],
    answer: 'Safety gear (PPE)',
    teachCorrect: 'Safety gear first — hard hat, boots, eye protection, and other required gear.',
    teachWrong: 'The picture shows safety gear (PPE). Wear it before work starts.',
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
    imageKey: 'hard-hat',
    options: ['Call for help / follow emergency steps', 'Keep working', 'Move heavy equipment alone', 'Film the scene first'],
    answer: 'Call for help / follow emergency steps',
    teachCorrect: 'Get help first — people before production.',
    teachWrong: 'In an emergency, follow the site plan and get help right away.',
  },
]

export const FINAL_QUIZ: QuizItem[] = [
  {
    id: 'f1',
    prompt: 'Safety: Look at this gear. When do you put on safety gear (PPE)?',
    emoji: 'S',
    imageKey: 'ppe',
    options: ['Before you start work', 'After the first cut', 'Only if the boss is watching', 'Never on indoor jobs'],
    answer: 'Before you start work',
    teachCorrect: 'Safety gear before work — every time.',
    teachWrong: 'Safety gear is on before work begins.',
  },
  {
    id: 'f2',
    prompt: 'Measurement: Look at this tool. Measure twice, then…',
    emoji: 'M',
    imageKey: 'tape-measure',
    options: ['Cut once', 'Guess the length', 'Skip the level', 'Throw the offcut'],
    answer: 'Cut once',
    teachCorrect: 'Measure twice, cut once — careful work on site.',
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
    prompt: 'Tools: Look at this picture. What cuts wood?',
    emoji: 'K',
    imageKey: 'saw',
    options: ['Saw', 'Hard hat', 'Level', 'Tape measure'],
    answer: 'Saw',
    teachCorrect: 'Yes — a saw cuts wood. Keep hands clear.',
    teachWrong: 'The picture shows a saw — the tool that cuts wood.',
  },
]

/** Word → action clips (mirror-neuron style pairing). */
export const WORD_ACTIONS = [
  {
    id: 'wa-hammer',
    termId: 'hammer',
    title: 'Hammer in action',
    body: 'A worker drives a nail with a hammer. Later: pass the hammer safely, head down.',
    actionCue: 'Drive the nail. Hands clear of the strike zone.',
  },
  {
    id: 'wa-tape',
    termId: 'tape',
    title: 'Tape measure in action',
    body: 'Measure twice on a board. Numbers face you. Hook the end firmly.',
    actionCue: 'Measure twice. Mark once. Cut once.',
  },
  {
    id: 'wa-drill',
    termId: 'drill',
    title: 'Drill in action',
    body: 'Low speed first, bit straight, both hands steady.',
    actionCue: 'Low speed. Straight bit. Eye protection on.',
  },
  {
    id: 'wa-level',
    termId: 'level',
    title: 'Level in action',
    body: 'Press the level on the wall. Watch the bubble sit in the middle.',
    actionCue: 'Bubble in the middle means flat and true.',
  },
  {
    id: 'wa-saw',
    termId: 'saw',
    title: 'Saw in action',
    body: 'Hold the board steady. Cut with control. Hands clear of the blade.',
    actionCue: 'Hands clear. Steady board. Controlled cut.',
  },
  {
    id: 'wa-hard-hat',
    termId: 'hard-hat',
    title: 'Hard hat before entry',
    body: 'Put the hard hat on before you cross into the bay.',
    actionCue: 'Hard hat on before you enter.',
  },
  {
    id: 'wa-ppe',
    termId: 'ppe',
    title: 'Safety gear before entry',
    body: 'Hard hat, glasses, gloves, boots — then enter the shop.',
    actionCue: 'Safety gear on before you cross the line.',
  },
]

export const TOOL_CATEGORIES = [
  {
    title: 'Hand tools',
    why: 'Hammer, tape measure, screwdriver — you move them with your hands.',
    mark: 'HT',
    prompt: 'Which group do you move with your hands only?',
    answer: 'Hand tools',
    options: ['Hand tools', 'Power tools', 'Mobile equipment', 'Interior finishes'],
  },
  {
    title: 'Power tools',
    why: 'Drill and saw — electricity or batteries. Extra care required.',
    mark: 'PT',
    prompt: 'Which group needs electricity or batteries?',
    answer: 'Power tools',
    options: ['Materials', 'Power tools', 'Hand tools', 'Framing'],
  },
  {
    title: 'Materials',
    why: 'Wood, drywall, screws — what you build with.',
    mark: 'MT',
    prompt: 'Wood, drywall, and screws belong to which group?',
    answer: 'Materials',
    options: ['Mobile equipment', 'Power tools', 'Materials', 'Trade awareness'],
  },
  {
    title: 'Mobile equipment',
    why: 'Lifts and machines. Only with proper training.',
    mark: 'ME',
    prompt: 'Lifts and machines are in which group?',
    answer: 'Mobile equipment',
    options: ['Hand tools', 'Materials', 'Interior finishes', 'Mobile equipment'],
  },
]

export const SYSTEM_TOPICS = [
  {
    title: 'Framing',
    why: 'The skeleton of a building — walls and structure.',
    mark: 'FR',
    prompt: 'What is the skeleton of a building called?',
    answer: 'Framing',
    options: ['Framing', 'Interior finishes', 'Exterior systems', 'Measurement & math'],
  },
  {
    title: 'Interior finishes',
    why: 'Drywall, paint, flooring — what people see inside.',
    mark: 'IF',
    prompt: 'Drywall, paint, and flooring are part of…',
    answer: 'Interior finishes',
    options: ['Framing', 'Exterior systems', 'Interior finishes', 'Mobile equipment'],
  },
  {
    title: 'Exterior systems',
    why: 'Siding, roofs, and weather protection.',
    mark: 'EX',
    prompt: 'Siding and roofs protect the building as…',
    answer: 'Exterior systems',
    options: ['Trade awareness', 'Exterior systems', 'Hand tools', 'Framing'],
  },
  {
    title: 'Trade awareness',
    why: 'How electrical, plumbing, and HVAC fit the build.',
    mark: 'TR',
    prompt: 'Electrical, plumbing, and HVAC fit under…',
    answer: 'Trade awareness',
    options: ['Materials', 'Measurement & math', 'Trade awareness', 'Power tools'],
  },
  {
    title: 'Measurement & math',
    why: 'Measure twice. Simple math keeps cuts true.',
    mark: 'MM',
    prompt: '“Measure twice” belongs to which system topic?',
    answer: 'Measurement & math',
    options: ['Framing', 'Measurement & math', 'Exterior systems', 'Interior finishes'],
  },
]

export const SITE_PHRASES = [
  {
    en: 'Measure twice, cut once.',
    why: 'Stops waste and mistakes.',
    prompt: 'What does this phrase remind you to do?',
    answer: 'Check your measurement before you cut',
    options: [
      'Check your measurement before you cut',
      'Run to the tool crib',
      'Take off your hard hat',
      'Start the saw at full speed',
    ],
  },
  {
    en: 'Hard hats on in the bay.',
    why: 'Safety rule you will hear every day.',
    prompt: 'What must you wear in the bay?',
    answer: 'A hard hat',
    options: ['A hard hat', 'Only gloves', 'No PPE', 'Dress shoes'],
  },
  {
    en: 'Pass me the level.',
    why: 'Short tool request between workers.',
    prompt: 'What is the worker asking for?',
    answer: 'The level',
    options: ['The level', 'The lunch break', 'The truck keys', 'The blueprint only'],
  },
  {
    en: 'Hold the board steady.',
    why: 'Teamwork on a cut or install.',
    prompt: 'What should your partner do?',
    answer: 'Keep the board still',
    options: ['Keep the board still', 'Throw the board away', 'Leave the bay', 'Turn off the lights'],
  },
  {
    en: 'Eyes and ears on the saw.',
    why: 'Full attention during a cut.',
    prompt: 'What does this phrase mean?',
    answer: 'Pay full attention while the saw is running',
    options: [
      'Pay full attention while the saw is running',
      'Remove your hard hat',
      'Talk on the phone during the cut',
      'Stand behind the blade',
    ],
  },
  {
    en: 'Clean as you go.',
    why: 'Keeps the bay safe and ready for the next task.',
    prompt: 'What should you do during work?',
    answer: 'Clear scrap and tools as you work',
    options: [
      'Clear scrap and tools as you work',
      'Leave every offcut on the floor',
      'Hide damaged tools',
      'Skip cleanup forever',
    ],
  },
]

export const COMPUTER_SKILLS = [
  { id: 'mouse', title: 'Use a mouse or trackpad', why: 'Click, scroll, and select without help.' },
  { id: 'type', title: 'Type short answers', why: 'You can enter your name and simple sentences.' },
  { id: 'upload', title: 'Upload a photo or file', why: 'Evidence and assignments need uploads.' },
  { id: 'video', title: 'Play a short training video', why: 'Lessons include watch-and-check moments.' },
  { id: 'form', title: 'Complete an online form', why: 'Registration, logs, and quizzes are forms.' },
]

/**
 * Interactive digital mini-lessons — learners DO a computer task, not just check a box.
 * Pattern: prompt → action → immediate feedback (Khan/Duolingo micro-loop).
 */
export const DIGITAL_PRACTICE = [
  {
    id: 'click',
    title: 'Click the right button',
    teach: 'On school pages, yellow primary buttons move you forward.',
    prompt: 'Which button continues to the next lesson?',
    options: ['Continue', 'Delete account', 'Mute forever', 'Skip safety'],
    answer: 'Continue',
    teachCorrect: 'Yes — Continue moves you to the next station.',
    teachWrong: 'Look for Continue / Apply / Next — those advance your path.',
  },
  {
    id: 'type',
    title: 'Type a short answer',
    teach: 'Many lessons ask you to type a word carefully.',
    prompt: 'Type the English tool name for this: a tool that drives nails.',
    answer: 'hammer',
    kind: 'type' as const,
    teachCorrect: 'Correct spelling: Hammer.',
    teachWrong: 'The tool that drives nails is the hammer.',
  },
  {
    id: 'form',
    title: 'Complete a form field',
    teach: 'Forms need required fields before you can submit.',
    prompt: 'Which field must be filled before you can submit?',
    options: ['Your full name', 'Favorite color (optional)', 'A blank note', 'Nothing'],
    answer: 'Your full name',
    teachCorrect: 'Required fields — usually marked — must be completed.',
    teachWrong: 'Required fields like your name must be filled before submit.',
  },
  {
    id: 'upload',
    title: 'Choose evidence to upload',
    teach: 'Instructors may ask for a photo of your work.',
    prompt: 'What is good evidence to upload?',
    options: [
      'A clear photo of your safety gear check',
      'A blurry selfie with no context',
      'Someone else’s certificate',
      'A password list',
    ],
    answer: 'A clear photo of your safety gear check',
    teachCorrect: 'Clear, relevant evidence of YOUR work is what instructors need.',
    teachWrong: 'Upload clear photos of your own work — never passwords or other people’s files.',
  },
  {
    id: 'video',
    title: 'Watch-and-check habit',
    teach: 'Training videos pause for a check question.',
    prompt: 'After a short training clip, what should you do?',
    options: [
      'Answer the check question',
      'Close the browser',
      'Skip every question',
      'Share your password',
    ],
    answer: 'Answer the check question',
    teachCorrect: 'Watch, then answer — that is how learning sticks.',
    teachWrong: 'Stay with the lesson and answer the check after the clip.',
  },
]

/** Workplace instructions — hear English, prove meaning. */
export const WORKPLACE_INSTRUCTIONS = [
  {
    text: 'Bring the tape measure.',
    correct: 'Bring the tape measure',
    imageKey: 'tape-measure',
    options: ['Bring the tape measure', 'Bring the hammer', 'Put on a hard hat', 'Start cutting wood'],
    supportHint: {
      English: 'Bring the tape measure.',
      Spanish: 'Trae la cinta metrica.',
      Arabic: 'Ahdir sharit al-qiyas.',
      Hindi: 'Tape measure lao.',
      Amharic: 'Melekiya tape amtu.',
      Tigrinya: 'Melekiya tape amtsu.',
    },
  },
  {
    text: 'Pass me the level.',
    correct: 'Pass me the level',
    imageKey: 'level',
    options: ['Pass me the level', 'Pass the hammer', 'Open the door', 'Put on boots'],
    supportHint: {
      English: 'Pass me the level.',
      Spanish: 'Pasame el nivel.',
      Arabic: 'Nawilni al-mizan.',
      Hindi: 'Level mujhe do.',
      Amharic: 'Dereja melekiyawun situn.',
      Tigrinya: 'Dereja melekiya habuni.',
    },
  },
  {
    text: 'Check the wall with the level.',
    correct: 'Check the wall with the level',
    imageKey: 'level',
    options: ['Check the wall with the level', 'Check the floor with a hammer', 'Bring the drill', 'Remove your PPE'],
    supportHint: {
      English: 'Check the wall with the level.',
      Spanish: 'Revisa la pared con el nivel.',
      Arabic: 'Ifhas al-jidar bil-mizan.',
      Hindi: 'Level se deewar check karo.',
      Amharic: 'Dereja melekiya bewetakom gidgidawun yaregagtu.',
      Tigrinya: 'Bdereja melekiya n mendek aregagtsu.',
    },
  },
  {
    text: 'Put on your hard hat before you enter.',
    correct: 'Put on your hard hat before you enter',
    imageKey: 'hard-hat',
    options: [
      'Put on your hard hat before you enter',
      'Leave your hard hat in the truck',
      'Start the saw first',
      'Remove all safety gear',
    ],
    supportHint: {
      English: 'Put on your hard hat before you enter.',
      Spanish: 'Ponte el casco antes de entrar.',
      Arabic: 'Irtiadi al-khudha qabla al-dukhul.',
      Hindi: 'Andar jane se pehle hard hat pehno.',
      Amharic: 'Ke megebat befit yeras mekelakiya asdigu.',
      Tigrinya: 'Qidmi meAtat nay ris mekelakeli asdugu.',
    },
  },
  {
    text: 'Keep hands clear of the saw.',
    correct: 'Keep hands clear of the saw',
    imageKey: 'saw',
    options: [
      'Keep hands clear of the saw',
      'Hold the blade while it spins',
      'Remove eye protection',
      'Stand on the board',
    ],
    supportHint: {
      English: 'Keep hands clear of the saw.',
      Spanish: 'Mantén las manos lejos de la sierra.',
      Arabic: 'Abqi yadayk baida an al-minshar.',
      Hindi: 'Saw se haath door rakho.',
      Amharic: 'Ejochachen ke megeremya ruq yadrigu.',
      Tigrinya: 'Edikum kab megeremya rahuq yegberu.',
    },
  },
  {
    text: 'Wear your safety gear before work.',
    correct: 'Wear your safety gear before work',
    imageKey: 'ppe',
    options: [
      'Wear your safety gear before work',
      'Wear safety gear only at lunch',
      'Skip gear if it is hot',
      'Share one hard hat with a friend',
    ],
    supportHint: {
      English: 'Wear your safety gear before work.',
      Spanish: 'Usa tu equipo de proteccion antes de trabajar.',
      Arabic: 'Irtiadi muaddat al-himaya qabla al-amal.',
      Hindi: 'Kaam se pehle safety gear pehno.',
      Amharic: 'Sera ke mejemer befit yegil mekelakiya asdigu.',
      Tigrinya: 'Qidmi serah nay wilqe mekelakeli asdugu.',
    },
  },
]

/** Instructor observation — competency checklist learners rehearse before a real check. */
export const OBSERVATION_SCENARIOS = [
  {
    id: 'ppe-entry',
    title: 'Safety gear before entry',
    situation: 'Your instructor asks you to enter Workshop Bay 1 ready for work.',
    skill: 'Safety gear check',
    steps: [
      { id: 'hat', label: 'Hard hat on and fitted', correctOrder: 1 },
      { id: 'eyes', label: 'Eye protection on', correctOrder: 2 },
      { id: 'hands', label: 'Gloves ready for the task', correctOrder: 3 },
      { id: 'enter', label: 'Enter the bay only after gear is on', correctOrder: 4 },
    ],
    passNote: 'Competent means gear is correct BEFORE you cross the line — every time.',
  },
  {
    id: 'measure',
    title: 'Measure before you cut',
    situation: 'Your instructor watches you prepare a board for a cut.',
    skill: 'Tape measure',
    steps: [
      { id: 'hook', label: 'Hook the tape firmly on the end', correctOrder: 1 },
      { id: 'read', label: 'Read the measurement carefully', correctOrder: 2 },
      { id: 'mark', label: 'Mark the cut line once', correctOrder: 3 },
      { id: 'check', label: 'Measure a second time before cutting', correctOrder: 4 },
    ],
    passNote: 'Measure twice, cut once — that is the competent standard.',
  },
  {
    id: 'level-wall',
    title: 'Check a wall with a level',
    situation: 'Your instructor asks you to show that a wall section is true.',
    skill: 'Level',
    steps: [
      { id: 'place', label: 'Press the level flat on the surface', correctOrder: 1 },
      { id: 'bubble', label: 'Watch the bubble settle', correctOrder: 2 },
      { id: 'read', label: 'Confirm the bubble is centered', correctOrder: 3 },
      { id: 'report', label: 'Tell the instructor if it is true or needs adjustment', correctOrder: 4 },
    ],
    passNote: 'Competent workers can place, read, and report the level clearly.',
  },
]

/** On-site decision scenarios — real judgment practice, not an empty log form. */
export const SITE_DECISIONS = [
  {
    id: 'hazard',
    title: 'Morning hazard',
    scene: 'You arrive on site. A loose board sticks out into the walkway.',
    prompt: 'What should you do first?',
    options: [
      'Report it / make the area safe',
      'Ignore it and start cutting',
      'Kick the board aside without telling anyone',
      'Film a video for social media',
    ],
    answer: 'Report it / make the area safe',
    teachCorrect: 'See something unsafe → speak up and make it safe. People before production.',
    teachWrong: 'Hazards get reported and controlled first — never ignored.',
  },
  {
    id: 'instruction',
    title: 'Supervisor direction',
    scene: 'Your supervisor says: “Bring the level to bay two.”',
    prompt: 'What do you do?',
    options: [
      'Bring the level to bay two',
      'Bring the hammer to bay one',
      'Take a break first',
      'Ask someone else to guess',
    ],
    answer: 'Bring the level to bay two',
    teachCorrect: 'Listen fully, then do exactly what was asked.',
    teachWrong: 'Follow the short English instruction: bring the level to bay two.',
  },
  {
    id: 'ppe',
    title: 'Missing gear',
    scene: 'You left your hard hat in the truck. The bay is ready.',
    prompt: 'Best next step?',
    options: [
      'Get your hard hat before entering',
      'Enter quickly without it',
      'Borrow a damaged hat that does not fit',
      'Wait until someone notices',
    ],
    answer: 'Get your hard hat before entering',
    teachCorrect: 'No hard hat → no entry. Fix gear first.',
    teachWrong: 'Never enter the bay without required safety gear.',
  },
  {
    id: 'log',
    title: 'End-of-day note',
    scene: 'You finished measuring and helping cut three boards. Your supervisor was Jordan.',
    prompt: 'What belongs in today’s site log?',
    options: [
      'Date, tasks you did, and supervisor name',
      'Only your lunch order',
      'Someone else’s private phone number',
      'Nothing — logs are optional forever',
    ],
    answer: 'Date, tasks you did, and supervisor name',
    teachCorrect: 'Clear daily notes help instructors and employers trust your hours.',
    teachWrong: 'A good log has the date, real tasks, and who supervised you.',
  },
]

/** Employment readiness — interview and partner-prep checks. */
export const EMPLOYMENT_PREP = [
  {
    id: 'intro',
    prompt: 'An employer asks: “Why Purpose Academy?” Best answer?',
    options: [
      'I learned foundations, safety, and site English with instructors who checked my skills',
      'I watched a few videos once',
      'I do not need safety training',
      'I only want a paycheck with no learning',
    ],
    answer: 'I learned foundations, safety, and site English with instructors who checked my skills',
    teachCorrect: 'Connect your training to safety, language, and verified skill.',
    teachWrong: 'Employers want proof of foundations — not shortcuts.',
  },
  {
    id: 'safety',
    prompt: 'Interview question: “What do you put on before entering a bay?”',
    options: [
      'Hard hat and required safety gear (PPE)',
      'Headphones only',
      'Nothing special',
      'Dress shoes',
    ],
    answer: 'Hard hat and required safety gear (PPE)',
    teachCorrect: 'Lead with safety — it shows you are site-ready.',
    teachWrong: 'Always name hard hat / PPE before entry.',
  },
  {
    id: 'team',
    prompt: 'A partner says: “Pass me the level.” You should…',
    options: [
      'Hand them the level safely',
      'Throw the tool',
      'Ignore the request',
      'Leave the site',
    ],
    answer: 'Hand them the level safely',
    teachCorrect: 'Short site talk + safe tool passing = good teammate.',
    teachWrong: 'Pass tools hand-to-hand — never throw.',
  },
]

/** Attempt policy: exercises unlimited; exams limited. */
export const ATTEMPT_POLICY = {
  exerciseMax: null as number | null,
  examMax: 3,
  vocabPassPercent: 100,
} as const

export { speakEnglish, speakSupport, speakBilingual, stopSpeech, primeSpeech } from './speech'
