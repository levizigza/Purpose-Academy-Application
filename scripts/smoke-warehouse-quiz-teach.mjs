/**
 * Assert logistics equipment video quiz teach-backs match answer-key explanations
 * (no softened "The video shows: <choice>" paraphrases on known AK spots),
 * plus station honesty guards (gates flag, replay endSec, unlock copy).
 * Usage: node scripts/smoke-warehouse-quiz-teach.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const json = JSON.parse(
  readFileSync(join(root, 'src/pathways/packs/warehouseEquipmentVideoQuizzes.json'), 'utf8'),
)
const ts = readFileSync(join(root, 'src/pathways/packs/warehouseEquipmentVideoQuizzes.ts'), 'utf8')
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
    'counterbalance-forklift',
    7,
    'Use the designated steps and handholds, adjust the seat and use the restraint as trained.',
  ],
  [
    'reach-truck',
    7,
    'The mast lifts the pallet, and the reach mechanism moves the forks forward.',
  ],
  [
    'conveyor',
    9,
    'Keep hands, hair and clothing clear of the moving conveyor parts.',
  ],
  [
    'barcode-scanner',
    8,
    'If the scanner has a laser, avoid looking into its aiming beam.',
  ],
  [
    'parcel-scale',
    10,
    'Follow the workplace procedure for accuracy checks and unexpected or unstable readings.',
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
console.log(`OK   ${total} questions across ${json.length} lessons`)

for (const lesson of json) {
  assert(lesson.questions.length === 10, `${lesson.lessonId} should have 10 questions`)
  for (const q of lesson.questions) {
    assert(q.choices.length === 4, `${q.id} needs 4 choices`)
    assert(['A', 'B', 'C', 'D'].includes(q.answer), `${q.id} bad answer letter`)
    assert(
      q.choices.some((c) => c.id === q.answer),
      `${q.id} answer letter missing from choices`,
    )
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
console.log('OK   10×14 choices/answers/replay labels intact')

assert(
  /replayEndRef/.test(drill) && /endSec/.test(drill),
  'EquipmentVideoDrill must pause practice replays at replay.endSec',
)
console.log('OK   replay endSec guard present in drill')

assert(
  !/Finish each video to unlock the next/.test(sequence),
  'TeachNote must not claim unlock-the-next while soft-gates are off',
)
console.log('OK   no dishonest unlock copy on Unit 8 teach note')

assert(
  /\.is-phone-app \.train-choice\.is-correct/.test(css) &&
    /\.is-phone-app \.train-choice\.is-wrong/.test(css),
  'Phone paper must keep train-choice correct/wrong result states',
)
console.log('OK   phone train-choice result states remapped')

const practiceMode = readFileSync(join(root, 'src/practice/PracticeMode.ts'), 'utf8')
assert(
  /pa-warehouse-equipment-watched-v1/.test(practiceMode) &&
    /pa-warehouse-equipment-cleared-v1/.test(practiceMode),
  'Practice Start over must reset warehouse watched + cleared keys',
)
assert(/pack === 'warehouse'|pack = 'warehouse'|pack\?: EquipmentVideoPack/.test(drill), 'drill still supports warehouse pack')
assert(/pack="warehouse"/.test(sequence), 'StudentSequence still wires warehouse EquipmentVideoDrill')
console.log('OK   warehouse pack + Practice reset keys intact (no Construction regression)')

if (failed) {
  console.error(`\n${failed} assertion group(s) failed`)
  process.exit(1)
}
console.log('\nsmoke-warehouse-quiz-teach: pass')
