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
  { n: 4, title: 'Career Assessment', help: 'Rate work activities in your language.', purpose: 'A professional interest inventory, not a pass/fail quiz.', unit: 2 },
  { n: 5, title: 'Work Style', help: 'How you like to work, in your language.', purpose: 'Work-style choices refine your pathway fit.', unit: 2 },
  { n: 6, title: 'Your Career Profile', help: 'See the path that fits your answers.', purpose: 'Interest profile → recommended pathway. Construction is open now.', unit: 2 },
  { n: 7, title: 'Visual Vocabulary', help: 'One picture at a time. Hear English, then go to the next word.', purpose: 'Same clear card for each tool: picture, home language, English audio. Finish the full set.', unit: 3 },
  { n: 8, title: 'Word → Action', help: 'See the action. Prove which tool it uses.', purpose: 'Link English words to real movement with a quick check.', unit: 3 },
  { n: 9, title: 'Supported Practice', help: 'Match words to pictures with help.', purpose: 'Practice with help. Mistakes teach.', unit: 4 },
  { n: 10, title: 'English Eye Spy', help: 'Find the real tool in a site scene. English only.', purpose: 'Prove you know the object among other tools.', unit: 4 },
  { n: 11, title: 'Workplace Instructions', help: 'Hear a direction. Show you understood.', purpose: 'Short English instructions keep crews safe.', unit: 4 },
  { n: 12, title: 'Site Language', help: 'Hear a job-site phrase. Choose what it means.', purpose: 'Useful English you will hear on Alberta sites.', unit: 4 },
  { n: 13, title: 'Digital Skills', help: 'Practice real computer tasks: click, type, forms, uploads.', purpose: 'This may be someone’s first computer. Every step is a hands-on micro-lesson.', unit: 5 },
  { n: 14, title: 'Safety Training', help: 'Safety words with clear pictures. Required.', purpose: 'Alberta / Canada site safety in simple English.', unit: 5 },
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
      Arabic: 'مطرقة',
      Hindi: 'हथौड़ा',
      Amharic: 'መዶሻ',
      Tigrinya: 'መደሻ',
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
      Spanish: 'Cinta métrica',
      Arabic: 'شريط قياس',
      Hindi: 'टेप मेज़र',
      Amharic: 'የመለኪያ ቴፕ',
      Tigrinya: 'ናይ መለክዒ ቴፕ',
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
      Arabic: 'مثقاب',
      Hindi: 'ड्रिल',
      Amharic: 'ቁፋሮ',
      Tigrinya: 'ቁፋሮ',
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
      Arabic: 'ميزان التسوية',
      Hindi: 'लेवल',
      Amharic: 'ደረጃ መለኪያ',
      Tigrinya: 'ደረጃ መለክዒ',
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
      Arabic: 'منشار',
      Hindi: 'आरा',
      Amharic: 'መጋረጃ',
      Tigrinya: 'መጋረጃ',
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
      Spanish: 'Casco de seguridad',
      Arabic: 'خوذة أمان',
      Hindi: 'हार्ड हैट',
      Amharic: 'የራስ መከላከያ',
      Tigrinya: 'ናይ ርእሲ መከላኸሊ',
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
      Spanish: 'Equipo de protección personal',
      Arabic: 'معدات الحماية الشخصية',
      Hindi: 'सुरक्षा उपकरण (PPE)',
      Amharic: 'የደህንነት መሣሪያዎች',
      Tigrinya: 'ናይ ድሕንነት መሳርሒታት',
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
    teachCorrect: 'Yes. This is a hard hat. It protects your head.',
    teachWrong: 'Look again. The picture shows a hard hat for the head.',
  },
  {
    id: 'b2',
    prompt: 'Look at this picture. What tool is this?',
    emoji: 'HM',
    imageKey: 'hammer',
    options: ['Hammer', 'Ladder', 'Hard hat', 'Paint'],
    answer: 'Hammer',
    teachCorrect: 'Yes. A hammer drives nails.',
    teachWrong: 'The picture shows a hammer, not a ladder or hard hat.',
  },
  {
    id: 'b3',
    prompt: 'Look at this picture. What must you wear before work?',
    emoji: '!',
    imageKey: 'ppe',
    options: ['Safety gear (PPE)', 'Sandals', 'Loose jewelry', 'Nothing special'],
    answer: 'Safety gear (PPE)',
    teachCorrect: 'Yes. Safety gear (PPE) protects your body on site.',
    teachWrong: 'The picture shows safety gear (PPE): hard hat, glasses, gloves, and boots.',
  },
  {
    id: 'b4',
    prompt: 'Look at this picture. Which tool measures length?',
    emoji: 'TM',
    imageKey: 'tape-measure',
    options: ['Tape measure', 'Saw', 'Hard hat', 'Nail'],
    answer: 'Tape measure',
    teachCorrect: 'Yes. A tape measure shows length.',
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
    detail: 'Warehouse, loading, and moving goods. Opens after Construction.',
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
    detail: 'Helping people in community roles. Planned next.',
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
    teachCorrect: 'Safety gear first: hard hat, boots, eye protection, and other required gear.',
    teachWrong: 'The picture shows safety gear (PPE). Wear it before work starts.',
  },
  {
    id: 's2',
    prompt: 'Look at this hard hat. Why do workers wear it?',
    emoji: 'HZ',
    imageKey: 'hard-hat',
    options: ['To protect the head', 'To measure wood', 'To cut boards', 'To drive nails'],
    answer: 'To protect the head',
    teachCorrect: 'Yes. A hard hat protects the head from falling objects and bumps.',
    teachWrong: 'A hard hat is head protection, not a measuring or cutting tool.',
  },
  {
    id: 's3',
    prompt: 'Someone is hurt. What is your first job?',
    emoji: 'EM',
    imageKey: 'hard-hat',
    options: ['Call for help / follow emergency steps', 'Keep working', 'Move heavy equipment alone', 'Film the scene first'],
    answer: 'Call for help / follow emergency steps',
    teachCorrect: 'Get help first. People before production.',
    teachWrong: 'In an emergency, follow the site plan and get help right away.',
  },
  {
    id: 's4',
    prompt: 'Before you start a power saw, what should you check?',
    emoji: 'S',
    imageKey: 'saw',
    options: [
      'Guards on, PPE on, hands clear of the blade',
      'Music volume only',
      'That nobody is watching',
      'Skip the guards if you are in a hurry',
    ],
    answer: 'Guards on, PPE on, hands clear of the blade',
    teachCorrect: 'Power tools need guards, PPE, and clear hands every time.',
    teachWrong: 'Never rush a cut. Check guards, PPE, and hand position first.',
  },
  {
    id: 's5',
    prompt: 'You see a wet spot near an electric drill charger. What do you do?',
    emoji: 'D',
    imageKey: 'drill',
    options: [
      'Stop, report the hazard, keep people clear',
      'Plug in the drill anyway',
      'Wipe it with a metal tool',
      'Ignore it if the light is on',
    ],
    answer: 'Stop, report the hazard, keep people clear',
    teachCorrect: 'Water and electricity do not mix. Stop and report.',
    teachWrong: 'Treat water near power as a stop-work hazard.',
  },
  {
    id: 's6',
    prompt: 'Who can tell you to stop work if something looks unsafe?',
    emoji: '!',
    imageKey: 'ppe',
    options: [
      'You. Every worker has stop-work authority',
      'Only the site owner',
      'Only after an injury',
      'Nobody. Keep producing',
    ],
    answer: 'You. Every worker has stop-work authority',
    teachCorrect: 'Stop-work authority belongs to every worker on site.',
    teachWrong: 'If it looks unsafe, you can and should stop the work.',
  },
  {
    id: 's7',
    prompt: 'Eye protection is required when…',
    emoji: 'P',
    imageKey: 'ppe',
    options: [
      'Cutting, drilling, or any task with flying particles',
      'Only outdoors',
      'Only if the boss is nearby',
      'Never with a hand saw',
    ],
    answer: 'Cutting, drilling, or any task with flying particles',
    teachCorrect: 'Protect your eyes whenever particles can fly.',
    teachWrong: 'Eye protection is for cutting, drilling, and similar tasks.',
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
    teachCorrect: 'Safety gear before work, every time.',
    teachWrong: 'Safety gear is on before work begins.',
  },
  {
    id: 'f2',
    prompt: 'Measurement: Look at this tool. Measure twice, then…',
    emoji: 'M',
    imageKey: 'tape-measure',
    options: ['Cut once', 'Guess the length', 'Skip the level', 'Throw the offcut'],
    answer: 'Cut once',
    teachCorrect: 'Measure twice, cut once. Careful work on site.',
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
    teachCorrect: 'Yes. A saw cuts wood. Keep hands clear.',
    teachWrong: 'The picture shows a saw, the tool that cuts wood.',
  },
  {
    id: 'f5',
    prompt: 'Tools: Which tool drives nails?',
    emoji: 'H',
    imageKey: 'hammer',
    options: ['Hammer', 'Level', 'Tape measure', 'Hard hat'],
    answer: 'Hammer',
    teachCorrect: 'A hammer drives nails. Pass it with the head down.',
    teachWrong: 'The picture shows a hammer.',
  },
  {
    id: 'f6',
    prompt: 'Site habit: A loose board sticks into the walkway. First action?',
    emoji: '!',
    imageKey: 'hard-hat',
    options: [
      'Make it safe and report the hazard',
      'Ignore it and keep cutting',
      'Kick it aside quietly',
      'Post it on social media',
    ],
    answer: 'Make it safe and report the hazard',
    teachCorrect: 'Hazards get controlled and reported right away.',
    teachWrong: 'People before production. Fix and report hazards first.',
  },
  {
    id: 'f7',
    prompt: 'Digital: Before you submit a school form, you should…',
    emoji: 'F',
    imageKey: 'tape-measure',
    options: [
      'Fill required fields carefully',
      'Leave your name blank',
      'Share your password',
      'Skip every question',
    ],
    answer: 'Fill required fields carefully',
    teachCorrect: 'Required fields must be complete and accurate.',
    teachWrong: 'Forms need required fields filled before submit.',
  },
  {
    id: 'f8',
    prompt: 'Systems: Drywall, paint, and flooring belong to…',
    emoji: 'IF',
    imageKey: 'level',
    options: ['Interior finishes', 'Mobile equipment', 'Framing only', 'Nothing on site'],
    answer: 'Interior finishes',
    teachCorrect: 'Interior finishes are what people see inside the building.',
    teachWrong: 'Drywall, paint, and flooring are interior finishes.',
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
    body: 'Hard hat, glasses, gloves, boots. Then enter the shop.',
    actionCue: 'Safety gear on before you cross the line.',
  },
]

export const TOOL_CATEGORIES = [
  {
    title: 'Hand tools',
    why: 'Hammer, tape measure, screwdriver. You move them with your hands.',
    mark: 'HT',
    prompt: 'Which group do you move with your hands only?',
    answer: 'Hand tools',
    options: ['Hand tools', 'Power tools', 'Mobile equipment', 'Interior finishes'],
  },
  {
    title: 'Power tools',
    why: 'Drill and saw use electricity or batteries. Extra care required.',
    mark: 'PT',
    prompt: 'Which group needs electricity or batteries?',
    answer: 'Power tools',
    options: ['Materials', 'Power tools', 'Hand tools', 'Framing'],
  },
  {
    title: 'Materials',
    why: 'Wood, drywall, screws: what you build with.',
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
    why: 'The skeleton of a building: walls and structure.',
    mark: 'FR',
    prompt: 'What is the skeleton of a building called?',
    answer: 'Framing',
    options: ['Framing', 'Interior finishes', 'Exterior systems', 'Measurement & math'],
  },
  {
    title: 'Interior finishes',
    why: 'Drywall, paint, flooring: what people see inside.',
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
  {
    en: 'Tool crib is closed after four.',
    why: 'Know when shared tools are available.',
    prompt: 'What does this tell you?',
    answer: 'Shared tools are not available after 4:00',
    options: [
      'Shared tools are not available after 4:00',
      'Lunch is free after four',
      'You must leave the site at noon',
      'Hard hats are optional after four',
    ],
  },
  {
    en: 'Two-person lift on that sheet.',
    why: 'Team lifts prevent injury and damage.',
    prompt: 'What should you do?',
    answer: 'Lift the sheet with a partner',
    options: [
      'Lift the sheet with a partner',
      'Drag it alone across the bay',
      'Throw it from the truck',
      'Ask a visitor to carry it alone',
    ],
  },
  {
    en: 'Tag out that damaged drill.',
    why: 'Damaged tools leave the workflow until repaired.',
    prompt: 'What happens to the damaged drill?',
    answer: 'It is tagged and taken out of use',
    options: [
      'It is tagged and taken out of use',
      'You keep using it carefully',
      'You hide it in your bag',
      'You give it to a new learner',
    ],
  },
  {
    en: 'Report near misses the same day.',
    why: 'Near misses teach the crew before someone gets hurt.',
    prompt: 'When should you report a near miss?',
    answer: 'The same day it happens',
    options: [
      'The same day it happens',
      'Only if someone is injured',
      'Next month in a meeting',
      'Never. Near misses do not count',
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
    teachCorrect: 'Yes. Continue moves you to the next station.',
    teachWrong: 'Look for Continue / Apply / Next. Those advance your path.',
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
    teachCorrect: 'Required fields (usually marked) must be completed.',
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
    teachWrong: 'Upload clear photos of your own work. Never passwords or other people’s files.',
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
    teachCorrect: 'Watch, then answer. That is how learning sticks.',
    teachWrong: 'Stay with the lesson and answer the check after the clip.',
  },
  {
    id: 'password',
    title: 'Keep accounts safe',
    teach: 'School logins are private, like site keys.',
    prompt: 'What is a safe habit for your school password?',
    options: [
      'Keep it private and do not share it',
      'Write it on the shop wall',
      'Text it to a stranger',
      'Use the same password as your bank and post it',
    ],
    answer: 'Keep it private and do not share it',
    teachCorrect: 'Passwords stay private. Never share them.',
    teachWrong: 'Never share or post passwords.',
  },
  {
    id: 'nav',
    title: 'Find your learning path',
    teach: 'The yellow path map shows where you are and what comes next.',
    prompt: 'Where do you look to see your next lesson?',
    options: [
      'The learning path map on your journey screen',
      'A random social media feed',
      'Someone else’s private email',
      'A locked admin panel',
    ],
    answer: 'The learning path map on your journey screen',
    teachCorrect: 'Your path map is the school map for what to learn next.',
    teachWrong: 'Use the learning path on your journey screen.',
  },
  {
    id: 'type-ppe',
    title: 'Type a safety word',
    teach: 'Spelling safety words correctly matters on forms and logs.',
    prompt: 'Type the short form for personal protective equipment.',
    answer: 'ppe',
    kind: 'type' as const,
    teachCorrect: 'PPE means personal protective equipment.',
    teachWrong: 'The letters are P-P-E.',
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
      Spanish: 'Trae la cinta métrica.',
      Arabic: 'أحضر شريط القياس.',
      Hindi: 'टेप मेज़र लाओ।',
      Amharic: 'የመለኪያ ቴፑን አምጡ።',
      Tigrinya: 'ናይ መለክዒ ቴፕ ኣምጽኡ።',
    },
  },
  {
    text: 'Pass me the level.',
    correct: 'Pass me the level',
    imageKey: 'level',
    options: ['Pass me the level', 'Pass the hammer', 'Open the door', 'Put on boots'],
    supportHint: {
      English: 'Pass me the level.',
      Spanish: 'Pásame el nivel.',
      Arabic: 'ناولني ميزان التسوية.',
      Hindi: 'मुझे लेवल दो।',
      Amharic: 'ደረጃ መለኪያውን ስጡኝ።',
      Tigrinya: 'ደረጃ መለክዒ ሃቡኒ።',
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
      Arabic: 'افحص الجدار بميزان التسوية.',
      Hindi: 'लेवल से दीवार जाँचो।',
      Amharic: 'በደረጃ መለኪያ ግድግዳውን ያረጋግጡ።',
      Tigrinya: 'ብደረጃ መለክዒ ንመንደቅ ኣረጋግጹ።',
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
      Arabic: 'ارتدِ خوذة الأمان قبل الدخول.',
      Hindi: 'अंदर जाने से पहले हार्ड हैट पहनो।',
      Amharic: 'ከመግባት በፊት የራስ መከላከያ ያድርጉ።',
      Tigrinya: 'ቅድሚ ምእታው ናይ ርእሲ መከላኸሊ ኣስድጉ።',
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
      Arabic: 'أبقِ يديك بعيداً عن المنشار.',
      Hindi: 'आरे से हाथ दूर रखो।',
      Amharic: 'እጆቻችሁን ከመጋረጃ ርቀው ያድርጉ።',
      Tigrinya: 'ኢድኩም ካብ መጋረጃ ርሑቕ ግበሩ።',
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
      Spanish: 'Usa tu equipo de protección antes de trabajar.',
      Arabic: 'ارتدِ معدات الحماية قبل العمل.',
      Hindi: 'काम से पहले सुरक्षा उपकरण पहनो।',
      Amharic: 'ሥራ ከመጀመር በፊት የደህንነት መሣሪያዎችን ያድርጉ።',
      Tigrinya: 'ቅድሚ ስራሕ ናይ ድሕንነት መሳርሒታት ኣስድጉ።',
    },
  },
  {
    text: 'Bring the drill to bay one.',
    correct: 'Bring the drill to bay one',
    imageKey: 'drill',
    options: [
      'Bring the drill to bay one',
      'Bring the saw to bay three',
      'Leave the drill in the truck',
      'Start cutting without the drill',
    ],
    supportHint: {
      English: 'Bring the drill to bay one.',
      Spanish: 'Trae el taladro a la bahía uno.',
      Arabic: 'أحضر المثقاب إلى المكان الأول.',
      Hindi: 'ड्रिल बे एक पर लाओ।',
      Amharic: 'ቁፋሮውን ወደ ቤይ አንድ አምጡ።',
      Tigrinya: 'ንቁፋሮ ናብ ቤይ ሓደ ኣምጽኡ።',
    },
  },
  {
    text: 'Measure the board twice.',
    correct: 'Measure the board twice',
    imageKey: 'tape-measure',
    options: [
      'Measure the board twice',
      'Guess the length once',
      'Cut before measuring',
      'Throw the tape measure',
    ],
    supportHint: {
      English: 'Measure the board twice.',
      Spanish: 'Mide la tabla dos veces.',
      Arabic: 'قِس اللوح مرتين.',
      Hindi: 'बोर्ड को दो बार मापो।',
      Amharic: 'ሰሌዳውን ሁለት ጊዜ ይለኩ።',
      Tigrinya: 'ንሰሌዳ ክልተ ጊዜ ይለኩ።',
    },
  },
  {
    text: 'Clean the bay before you leave.',
    correct: 'Clean the bay before you leave',
    imageKey: 'hard-hat',
    options: [
      'Clean the bay before you leave',
      'Leave scrap on the floor',
      'Hide damaged tools',
      'Skip cleanup if you are tired',
    ],
    supportHint: {
      English: 'Clean the bay before you leave.',
      Spanish: 'Limpia la bahía antes de irte.',
      Arabic: 'نظّف المكان قبل أن تغادر.',
      Hindi: 'जाने से पहले बे साफ़ करो।',
      Amharic: 'ከመሄድ በፊት ቤዩን ያፅዱ።',
      Tigrinya: 'ቅድሚ ምኻድ ንቤይ ኣጽርዩ።',
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
    passNote: 'Competent means gear is correct BEFORE you cross the line, every time.',
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
    passNote: 'Measure twice, cut once. That is the competent standard.',
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
  {
    id: 'tool-pass',
    title: 'Pass a tool safely',
    situation: 'Your instructor asks you to pass a hammer to a partner.',
    skill: 'Tool handling',
    steps: [
      { id: 'grip', label: 'Grip the handle firmly', correctOrder: 1 },
      { id: 'orient', label: 'Keep the head down and controlled', correctOrder: 2 },
      { id: 'pass', label: 'Place it in your partner’s hand', correctOrder: 3 },
      { id: 'confirm', label: 'Confirm they have it before you let go', correctOrder: 4 },
    ],
    passNote: 'Never throw tools. Hand-to-hand with confirmation.',
  },
  {
    id: 'saw-setup',
    title: 'Prepare for a supervised cut',
    situation: 'Your instructor watches you set up for a simple cut.',
    skill: 'Saw readiness',
    steps: [
      { id: 'ppe', label: 'Confirm eye protection and gear are on', correctOrder: 1 },
      { id: 'secure', label: 'Secure the board so it cannot shift', correctOrder: 2 },
      { id: 'clear', label: 'Check hands and body are clear of the blade path', correctOrder: 3 },
      { id: 'ready', label: 'Tell the instructor you are ready for the cut', correctOrder: 4 },
    ],
    passNote: 'Competent setup is calm, clear, and confirmed before the cut.',
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
    teachCorrect: 'See something unsafe, speak up and make it safe. People before production.',
    teachWrong: 'Hazards get reported and controlled first, never ignored.',
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
      'Nothing. Logs are optional forever',
    ],
    answer: 'Date, tasks you did, and supervisor name',
    teachCorrect: 'Clear daily notes help instructors and employers trust your hours.',
    teachWrong: 'A good log has the date, real tasks, and who supervised you.',
  },
  {
    id: 'noise',
    title: 'Loud cut station',
    scene: 'The saw is running. A coworker tries to give you a new measurement by shouting from across the bay.',
    prompt: 'Safest response?',
    options: [
      'Signal stop, wait for the saw to stop, then confirm the measurement',
      'Keep cutting and guess the number',
      'Take off your hard hat to hear better',
      'Walk into the blade path to talk',
    ],
    answer: 'Signal stop, wait for the saw to stop, then confirm the measurement',
    teachCorrect: 'Stop the tool, then communicate. Never guess under a running blade.',
    teachWrong: 'Running tools need full attention. Stop first, then talk.',
  },
  {
    id: 'visitor',
    title: 'Visitor without gear',
    scene: 'A delivery driver walks toward the bay without a hard hat.',
    prompt: 'What should you do?',
    options: [
      'Stop them at the line and get them proper gear or an escort',
      'Wave them through quickly',
      'Lend them a cracked hard hat',
      'Ignore it. Visitors are not your job',
    ],
    answer: 'Stop them at the line and get them proper gear or an escort',
    teachCorrect: 'Everyone crossing the line needs the right gear or a proper escort.',
    teachWrong: 'No gear, no entry. Help them get safe before they enter.',
  },
  {
    id: 'measure-conflict',
    title: 'Two measurements',
    scene: 'You measured 48 inches. Your partner measured 47.5 on the same board.',
    prompt: 'Best next step?',
    options: [
      'Stop and measure again together before cutting',
      'Cut using the larger number',
      'Cut using the smaller number',
      'Guess the middle and cut anyway',
    ],
    answer: 'Stop and measure again together before cutting',
    teachCorrect: 'Disagreeing measurements mean stop and re-check together.',
    teachWrong: 'Never cut when two measurements disagree.',
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
    teachWrong: 'Employers want proof of foundations, not shortcuts.',
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
    teachCorrect: 'Lead with safety. It shows you are site-ready.',
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
    teachWrong: 'Pass tools hand-to-hand. Never throw.',
  },
  {
    id: 'learn',
    prompt: 'An employer asks how you learn new tasks. Best answer?',
    options: [
      'I listen, practise with an instructor, and ask when I am unsure',
      'I guess and hope nobody notices',
      'I refuse to learn English for the job site',
      'I skip safety if it slows me down',
    ],
    answer: 'I listen, practise with an instructor, and ask when I am unsure',
    teachCorrect: 'Employers hire people who learn carefully and ask good questions.',
    teachWrong: 'Show that you practise with guidance and ask when unsure.',
  },
  {
    id: 'schedule',
    prompt: 'A partner asks if you can start at 7:00 a.m. You should…',
    options: [
      'Give an honest answer about your availability',
      'Say yes to everything even if you cannot come',
      'Ignore the message',
      'Ask them to text your password',
    ],
    answer: 'Give an honest answer about your availability',
    teachCorrect: 'Clear, honest scheduling builds trust.',
    teachWrong: 'Be honest about when you can start work.',
  },
  {
    id: 'ppe-interview',
    prompt: 'You arrive for a site walk-through. Best first move?',
    options: [
      'Bring and wear required safety gear',
      'Wear sandals for comfort',
      'Leave PPE in the car',
      'Arrive without confirming the meeting place',
    ],
    answer: 'Bring and wear required safety gear',
    teachCorrect: 'Show up ready: gear on, professional, on time.',
    teachWrong: 'Bring PPE and be ready for the site walk.',
  },
]

/** How many full matching rounds learners complete in Supported Practice. */
export const MATCH_PRACTICE_ROUNDS = 2

/**
 * Unit-end checkpoint quizzes (Duolingo-style unit review).
 * Shown in Practice Mode after finishing the last lesson of a unit.
 */
export const UNIT_CHECKPOINTS: Record<number, QuizItem[]> = {
  3: [
    {
      id: 'uc3-1',
      prompt: 'Which tool drives nails?',
      emoji: 'H',
      imageKey: 'hammer',
      options: ['Hammer', 'Level', 'Hard hat', 'Tape measure'],
      answer: 'Hammer',
      teachCorrect: 'Hammer drives nails.',
      teachWrong: 'The hammer drives nails.',
    },
    {
      id: 'uc3-2',
      prompt: 'Which tool shows if a surface is flat?',
      emoji: 'L',
      imageKey: 'level',
      options: ['Level', 'Saw', 'Hammer', 'Hard hat'],
      answer: 'Level',
      teachCorrect: 'The level checks flat and true.',
      teachWrong: 'Use a level to check flat.',
    },
    {
      id: 'uc3-3',
      prompt: 'What must you wear before entering the bay?',
      emoji: 'HH',
      imageKey: 'hard-hat',
      options: ['Hard hat / required PPE', 'Sandals', 'Loose scarf only', 'Nothing'],
      answer: 'Hard hat / required PPE',
      teachCorrect: 'Gear on before you enter.',
      teachWrong: 'Hard hat and required PPE first.',
    },
  ],
  4: [
    {
      id: 'uc4-1',
      prompt: '“Pass me the level” means…',
      emoji: 'L',
      imageKey: 'level',
      options: ['Hand them the level', 'Start the saw', 'Leave the site', 'Remove PPE'],
      answer: 'Hand them the level',
      teachCorrect: 'Short tool request. Pass it safely.',
      teachWrong: 'They asked for the level.',
    },
    {
      id: 'uc4-2',
      prompt: '“Measure twice, cut once” reminds you to…',
      emoji: 'T',
      imageKey: 'tape-measure',
      options: [
        'Check measurement before cutting',
        'Cut as fast as possible',
        'Skip the tape measure',
        'Remove eye protection',
      ],
      answer: 'Check measurement before cutting',
      teachCorrect: 'Careful measuring prevents waste.',
      teachWrong: 'Measure carefully before you cut.',
    },
    {
      id: 'uc4-3',
      prompt: 'Find-the-tool practice (Eye Spy) proves you can…',
      emoji: 'D',
      imageKey: 'drill',
      options: [
        'Spot the real tool among others',
        'Skip English forever',
        'Ignore safety gear',
        'Guess without looking',
      ],
      answer: 'Spot the real tool among others',
      teachCorrect: 'You identify tools in a busy scene.',
      teachWrong: 'Eye Spy is about finding the named tool.',
    },
    {
      id: 'uc4-4',
      prompt: 'A workplace instruction is…',
      emoji: 'S',
      imageKey: 'saw',
      options: [
        'A short English direction you must follow',
        'A song lyric',
        'Optional small talk',
        'Only for supervisors',
      ],
      answer: 'A short English direction you must follow',
      teachCorrect: 'Instructions keep the crew safe and coordinated.',
      teachWrong: 'Follow short English directions on site.',
    },
  ],
  5: [
    {
      id: 'uc5-1',
      prompt: 'Required form fields must be…',
      emoji: 'F',
      imageKey: 'tape-measure',
      options: ['Filled before submit', 'Left blank', 'Someone else’s password', 'Skipped forever'],
      answer: 'Filled before submit',
      teachCorrect: 'Complete required fields carefully.',
      teachWrong: 'Required fields cannot stay blank.',
    },
    {
      id: 'uc5-2',
      prompt: 'Stop-work authority means…',
      emoji: '!',
      imageKey: 'ppe',
      options: [
        'Any worker can stop unsafe work',
        'Only owners can stop work',
        'Never stop for hazards',
        'Stop only after an injury',
      ],
      answer: 'Any worker can stop unsafe work',
      teachCorrect: 'Everyone can stop unsafe work.',
      teachWrong: 'You can stop work when something looks unsafe.',
    },
    {
      id: 'uc5-3',
      prompt: 'Drills and saws belong to which group?',
      emoji: 'PT',
      imageKey: 'drill',
      options: ['Power tools', 'Hand tools only', 'Interior finishes', 'Framing lumber'],
      answer: 'Power tools',
      teachCorrect: 'Power tools use electricity or batteries.',
      teachWrong: 'Drill and saw are power tools.',
    },
    {
      id: 'uc5-4',
      prompt: 'Framing is…',
      emoji: 'FR',
      imageKey: 'level',
      options: [
        'The skeleton of a building',
        'Only paint color',
        'A lunch break',
        'Mobile equipment',
      ],
      answer: 'The skeleton of a building',
      teachCorrect: 'Framing is the structure.',
      teachWrong: 'Framing is the building skeleton.',
    },
  ],
  6: [
    {
      id: 'uc6-1',
      prompt: 'Competent observation means…',
      emoji: 'O',
      imageKey: 'hard-hat',
      options: [
        'You show the skill correctly for an instructor',
        'You watched a video once',
        'You skipped PPE',
        'You guessed the steps',
      ],
      answer: 'You show the skill correctly for an instructor',
      teachCorrect: 'Observation proves real skill under review.',
      teachWrong: 'Show the correct steps for the instructor.',
    },
    {
      id: 'uc6-2',
      prompt: 'A good site log includes…',
      emoji: 'L',
      imageKey: 'tape-measure',
      options: [
        'Date, tasks, and supervisor',
        'Only memes',
        'Other people’s passwords',
        'Nothing useful',
      ],
      answer: 'Date, tasks, and supervisor',
      teachCorrect: 'Clear notes build trust.',
      teachWrong: 'Log date, tasks, and who supervised you.',
    },
    {
      id: 'uc6-3',
      prompt: 'In an interview, lead with…',
      emoji: 'P',
      imageKey: 'ppe',
      options: [
        'Safety, foundations, and verified skills',
        'Skipping training',
        'Avoiding English',
        'Guessing tool names',
      ],
      answer: 'Safety, foundations, and verified skills',
      teachCorrect: 'Employers want safety and proof of skill.',
      teachWrong: 'Talk about safety and what you can do.',
    },
  ],
}

/** Attempt policy: exercises unlimited; exams limited. */
export const ATTEMPT_POLICY = {
  exerciseMax: null as number | null,
  examMax: 3,
  vocabPassPercent: 100,
} as const

export { speakEnglish, speakSupport, speakBilingual, stopSpeech, primeSpeech } from './speech'
