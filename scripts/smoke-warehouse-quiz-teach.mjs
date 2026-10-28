/**
 * Assert logistics equipment video quiz teach-backs match answer-key explanations
 * (no softened "The video shows: <choice>" paraphrases on known AK spots).
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
    'conveyor',
    9,
    'Keep hands, hair and clothing clear of the moving conveyor parts.',
  ],
  [
    'barcode-scanner',
    8,
    'If the scanner has a laser, avoid looking into its aiming beam.',
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

if (failed) {
  console.error(`\n${failed} assertion group(s) failed`)
  process.exit(1)
}
console.log('\nsmoke-warehouse-quiz-teach: pass')
