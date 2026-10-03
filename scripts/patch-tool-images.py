from pathlib import Path

path = Path("src/student/journeyCurriculum.ts")
text = path.read_text(encoding="utf-8")

vocab = '''export const VOCAB_UNIT: VocabTerm[] = [
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
'''

quiz_type = '''export type QuizItem = {
  id: string
  prompt: string
  emoji: string
  /** Clear picture of the answer object — never a random site photo. */
  imageKey: string
  options: string[]
  answer: string
  teachCorrect: string
  teachWrong: string
}
'''

baseline = '''export const BASELINE_QUIZ: QuizItem[] = [
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
'''

english = '''export const ENGLISH_QUIZ: QuizItem[] = [
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
'''

safety = '''export const SAFETY_QUIZ: QuizItem[] = [
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
'''

# Replace VOCAB_UNIT
start = text.find("export const VOCAB_UNIT")
end = text.find("export type QuizItem")
assert start != -1 and end != -1
text = text[:start] + vocab + "\n" + text[end:]

# Replace QuizItem type through ENGLISH_QUIZ (before FINAL_QUIZ)
start = text.find("export type QuizItem")
end = text.find("export const FINAL_QUIZ")
assert start != -1 and end != -1
text = text[:start] + quiz_type + "\n" + baseline + "\n" + safety + "\n" + english + "\n" + text[end:]

path.write_text(text, encoding="utf-8")
print("patched curriculum")
