/**
 * Assert construction equipment video quiz teach-backs match answer-key explanations
 * (no softened "The video shows: <choice>" paraphrases),
 * plus station honesty guards (gates flag, replay endSec, unlock copy).
 * Usage: node scripts/smoke-construction-quiz-teach.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const json = JSON.parse(
  readFileSync(join(root, 'src/pathways/packs/constructionEquipmentVideoQuizzes.json'), 'utf8'),
)
const ts = readFileSync(join(root, 'src/pathways/packs/constructionEquipmentVideoQuizzes.ts'), 'utf8')
const videos = readFileSync(join(root, 'src/pathways/packs/constructionEquipmentVideos.ts'), 'utf8')
const drill = readFileSync(join(root, 'src/student/EquipmentVideoDrill.tsx'), 'utf8')
const sequence = readFileSync(join(root, 'src/student/StudentSequence.tsx'), 'utf8')
const css = readFileSync(join(root, 'src/styles.css'), 'utf8')

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function teach(lessonId, n) {
  const lesson = json.find((q) => q.lessonId === lessonId)
  assert(lesson, `missing lesson ${lessonId}`)
  const q = lesson.questions.find((qi) => qi.n === n)
  assert(q, `missing ${lessonId} Q${n}`)
  return q.teach
}

const spots = [
  [
    'excavator',
    1,
    'The excavator is introduced as a machine for digging and moving material.',
  ],
  [
    'excavator',
    8,
    'Use the designated access steps and handholds.',
  ],
  [
    'backhoe',
    1,
    'The front loader bucket scoops, carries, and places loose material.',
  ],
  [
    'scissor-lift',
    1,
    'A scissor lift raises people and tools for work at height.',
  ],
  [
    'tower-crane',
    1,
    'On the crane shown, the trolley changes hook radius by travelling along the jib.',
  ],
  [
    'bobcat',
    7,
    'The lesson prohibits carrying passengers.',
  ],
]

let failed = 0
for (const [id, n, expected] of spots) {
  const got = teach(id, n)
  if (got !== expected) {
    console.error(`FAIL ${id} Q${n}\n  want: ${expected}\n  got:  ${got}`)
    failed++
  } else {
    console.log(`OK   ${id} Q${n}`)
  }
}

const soft = json.flatMap((q) =>
  q.questions.filter((qi) => qi.teach.startsWith('The video shows:')).map((qi) => `${q.lessonId} Q${qi.n}`),
)
if (soft.length) {
  console.error(`FAIL softened teaches remain: ${soft.join(', ')}`)
  failed++
} else {
  console.log('OK   no "The video shows:" teach prefixes')
}

assert(
  /export const VIDEO_SEGMENT_GATES_ENABLED = false/.test(ts),
  'VIDEO_SEGMENT_GATES_ENABLED must stay false (do not regress video gate flag)',
)
console.log('OK   VIDEO_SEGMENT_GATES_ENABLED = false')

const total = json.reduce((n, q) => n + q.questions.length, 0)
assert(total === 140, `expected 140 questions, got ${total}`)
assert(json.length === 14, `expected 14 lessons, got ${json.length}`)
console.log(`OK   ${total} questions across ${json.length} lessons`)

const expectedIds = [
  'excavator',
  'backhoe',
  'bulldozer',
  'wheel-loader',
  'bobcat',
  'motor-grader',
  'roller-compactor',
  'construction-forklift',
  'telehandler',
  'mobile-crane',
  'tower-crane',
  'boom-lift',
  'scissor-lift',
  'mobile-scaffold',
]
for (const id of expectedIds) {
  assert(
    json.some((q) => q.lessonId === id),
    `missing lesson ${id}`,
  )
  assert(videos.includes(`id: '${id}'`), `videos catalog missing ${id}`)
}
console.log('OK   all 14 machines present in quizzes + videos catalog')

for (const lesson of json) {
  assert(lesson.questions.length === 10, `${lesson.lessonId} should have 10 questions`)
  for (const q of lesson.questions) {
    assert(q.choices.length === 4, `${q.id} needs 4 choices`)
    assert(['A', 'B', 'C', 'D'].includes(q.answer), `${q.id} bad answer letter`)
    assert(
      q.choices.some((c) => c.id === q.answer),
      `${q.id} answer letter missing from choices`,
    )
    assert(q.teach && q.teach.trim().length > 8, `${q.id} empty/short teach`)
    assert(q.replay.endSec > q.replay.startSec, `${q.id} replay end must be after start`)
    const m = String(q.replay.label).match(/^(\d+):(\d+)-(\d+):(\d+)$/)
    assert(m, `${q.id} replay label ${q.replay.label}`)
    const start = Number(m[1]) * 60 + Number(m[2])
    const end = Number(m[3]) * 60 + Number(m[4])
    assert(
      start === q.replay.startSec && end === q.replay.endSec,
      `${q.id} replay label/seconds mismatch`,
    )
  }
}
console.log('OK   10×14 choices/answers/replay labels/teaches intact')

assert(
  /pack === 'construction'|pack = 'construction'|pack\?: EquipmentVideoPack/.test(drill) &&
    /replayEndRef/.test(drill) &&
    /endSec/.test(drill),
  'EquipmentVideoDrill must support construction pack and pause replays at endSec',
)
console.log('OK   construction pack + replay endSec in drill')

assert(
  /pack="construction"/.test(sequence),
  'StudentSequence step 18 must wire construction EquipmentVideoDrill',
)
assert(
  !/Finish each video to unlock the next/.test(sequence),
  'TeachNote must not claim unlock-the-next while soft-gates are off',
)
assert(
  /Soft-gates stay off for\s+showcase/.test(sequence),
  'TeachNote should honestly say soft-gates stay off',
)
console.log('OK   construction step 18 + honest teach note')

assert(
  /\.is-phone-app \.train-choice\.is-correct/.test(css) &&
    /\.is-phone-app \.train-choice\.is-wrong/.test(css),
  'Phone paper must keep train-choice correct/wrong result states',
)
console.log('OK   phone train-choice result states remapped')

if (failed) {
  console.error(`\n${failed} assertion group(s) failed`)
  process.exit(1)
}
console.log('\nsmoke-construction-quiz-teach: pass')
