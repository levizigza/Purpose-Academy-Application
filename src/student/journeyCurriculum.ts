/**
 * Student journey curriculum — aligned to PA-TECH-003 §4 (20-step sequence)
 * and the Purpose Academy Educational App Model (foundation → pathway → evaluation → work).
 */

export const JOURNEY_STEPS = [
  { n: 1, title: 'Login', help: 'Choose Student to begin your path.', purpose: 'Students, instructors, and admins enter different doors.' },
  { n: 2, title: 'Registration', help: 'Tell us who you are so we can support you.', purpose: 'Your profile opens foundation learning after approval.' },
  { n: 3, title: 'Baseline Assessment', help: 'Show what you already know — language, safety, and workplace basics.', purpose: 'We place you correctly. This is not a pass/fail gate.' },
  { n: 4, title: 'Career Interest', help: 'What type of work interests you most?', purpose: 'Interest guides coaching. Your pathway still starts with Construction.' },
  { n: 5, title: 'Choose Your Pathway', help: 'Confirm Construction — the live specialized program.', purpose: 'Logistics and Community Support reuse this same model next.' },
  { n: 6, title: 'Support Language', help: 'Choose a language that helps you learn.', purpose: 'A bridge into English at work — then the bridge steps back.' },
  { n: 7, title: 'Visual Vocabulary', help: 'See · Listen · Understand · Repeat', purpose: 'Picture first. Meaning second. English word last.' },
  { n: 8, title: 'Supported Practice', help: 'Match words to pictures with help.', purpose: 'Practice with scaffolding. Mistakes teach.' },
  { n: 9, title: 'English-Only Vocabulary', help: 'Same skills — English answers only.', purpose: 'Site talk is shared English. Pictures still help.' },
  { n: 10, title: 'Simple Sentences', help: 'Build short work sentences.', purpose: 'Words become things you can say on site.' },
  { n: 11, title: 'Workplace Instructions', help: 'Hear a direction. Show you understood.', purpose: 'Short instructions are how crews stay safe.' },
  { n: 12, title: 'Basic Computer Skills', help: 'Check the digital skills you can already do.', purpose: 'Training uses computers. Honesty helps us support you.' },
  { n: 13, title: 'Safety Training', help: 'Safety is a gate — not an optional extra.', purpose: 'You must understand PPE, hazards, and emergency basics before tools open.' },
  { n: 14, title: 'Tools, Materials & Equipment', help: 'Name tools and know their job.', purpose: 'Safe naming comes before safe use under an instructor.' },
  { n: 15, title: 'Construction Systems & Skills', help: 'See how a building comes together.', purpose: 'Framing, finishes, exterior, trades, and measurement.' },
  { n: 16, title: 'Hands-On Practical Training', help: 'Request instructor observation for Learned → Practised → Competent.', purpose: 'Only an authorized instructor verifies practical skill.' },
  { n: 17, title: 'On-Site Training', help: 'Log real supervised site work.', purpose: 'Daily notes, tasks, and supervisor feedback build workplace experience.' },
  { n: 18, title: 'Final Assessment', help: 'Show safety, knowledge, language, and practical readiness.', purpose: 'Separate checks — not one blurry score for everything.' },
  { n: 19, title: 'Graduation & Skills Passport', help: 'Collect verified evidence you can share.', purpose: 'Clear proof of what you learned and proved — not a job guarantee.' },
  { n: 20, title: 'Employment Connection', help: 'Move toward work with resume help and follow-up.', purpose: 'Getting work and keeping work both matter.' },
] as const

export type SupportLang = 'Spanish' | 'French' | 'Arabic' | 'Hindi' | 'Amharic' | 'Tigrinya'

export const SUPPORT_LANGUAGES: { id: SupportLang; flag: string }[] = [
  { id: 'Spanish', flag: 'ES' },
  { id: 'French', flag: 'FR' },
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
 * Gloss values are spoken aloud in the support language (Web Speech API).
 * Latin transliterations keep TTS reliable across browsers/OS voices.
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
      French: 'Marteau',
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
      French: 'Metre ruban',
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
      French: 'Perceuse',
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
    sentence: 'Check the shelf with a level.',
    gloss: {
      Spanish: 'Nivel',
      French: 'Niveau',
      Arabic: 'Mizan',
      Hindi: 'Level',
      Amharic: 'Dereja melekiya',
      Tigrinya: 'Dereja melekiya',
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
      French: 'Equipement de protection individuelle',
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
  /** Clear picture of the answer object — never a random site photo. */
  imageKey?: string
  options: string[]
  answer: string
  teachCorrect: string
  teachWrong: string
}

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

export const ENGLISH_QUIZ: QuizItem[] = [
  {
    id: 'e1',
    prompt: 'Look at this picture. What is it?',
    emoji: 'SW',
    imageKey: 'saw',
    options: ['Saw', 'Hammer', 'Level', 'Hard hat'],
    answer: 'Saw',
    teachCorrect: 'Yes — a saw cuts wood. Keep hands clear of the blade.',
    teachWrong: 'The picture shows a saw cutting wood.',
  },
  {
    id: 'e2',
    prompt: 'Look at this picture. What is it?',
    emoji: 'LV',
    imageKey: 'level',
    options: ['Level', 'Nail', 'Paint', 'Glove'],
    answer: 'Level',
    teachCorrect: 'Yes — a level shows if a surface is flat.',
    teachWrong: 'The picture shows a spirit level with bubble vials.',
  },
  {
    id: 'e3',
    prompt: 'Look at this picture. What is it?',
    emoji: 'DR',
    imageKey: 'drill',
    options: ['Drill', 'Saw', 'Hammer', 'Tape measure'],
    answer: 'Drill',
    teachCorrect: 'Yes — a drill makes holes or drives screws.',
    teachWrong: 'The picture shows a power drill.',
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

export const TOOL_CATEGORIES = [
  { title: 'Hand tools', why: 'Hammer, tape measure, screwdriver — control comes from you.', mark: 'HT' },
  { title: 'Power tools', why: 'Drill and saw — electricity or batteries. Extra care required.', mark: 'PT' },
  { title: 'Materials', why: 'Wood, drywall, fasteners — what you build with.', mark: 'MT' },
  { title: 'Mobile equipment', why: 'Lifts and machines. Only with proper training and authorization.', mark: 'ME' },
]

export const SYSTEM_TOPICS = [
  { title: 'Framing', why: 'The skeleton of a building — walls and structure.', mark: 'FR' },
  { title: 'Interior finishes', why: 'Drywall, paint, flooring — what people see inside.', mark: 'IF' },
  { title: 'Exterior systems', why: 'Siding, roofs, weather protection.', mark: 'EX' },
  { title: 'Trade awareness', why: 'How electrical, plumbing, and HVAC fit the build.', mark: 'TR' },
  { title: 'Measurement & math', why: 'Measure twice. Simple math keeps cuts and levels true.', mark: 'MM' },
]

export const COMPUTER_SKILLS = [
  { id: 'mouse', title: 'Use a mouse or trackpad', why: 'Click, scroll, and select without help.' },
  { id: 'type', title: 'Type short answers', why: 'You can enter your name and simple sentences.' },
  { id: 'upload', title: 'Upload a photo or file', why: 'Evidence and assignments need uploads.' },
  { id: 'video', title: 'Play a short training video', why: 'Lessons include watch-and-check moments.' },
  { id: 'form', title: 'Complete an online form', why: 'Registration, logs, and quizzes are forms.' },
]

export { speakEnglish, speakSupport, speakBilingual, stopSpeech, primeSpeech } from './speech'
