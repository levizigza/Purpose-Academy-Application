/**
 * Content audit — vocabulary, visuals, sentence cloze, supported photos, workbooks.
 *
 * Checks every shipped practice pack against its local asset files so a missing
 * translation or photo fails before a learner ever sees a blank card.
 *
 * Usage: node scripts/audit-content.mjs
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const HOMES = ['Spanish', 'Arabic', 'Hindi', 'Amharic', 'Tigrinya']

let failed = 0
const fail = (message) => {
  console.error(`FAIL ${message}`)
  failed += 1
}

const entry = `
  import { COMMUNITY_VOCAB_500 } from './src/pathways/packs/communityVocab500'
  import { DAILY_CONVERSATION_VOCAB_200 } from './src/pathways/packs/dailyConversationVocab200'
  import { CONSTRUCTION_VOCAB_660 } from './src/pathways/packs/constructionVocab660'
  import { LOGISTICS_VOCAB_500 } from './src/pathways/packs/logisticsVocab500'
  import { COMMUNITY_SENTENCE_CLOZE_499 } from './src/pathways/packs/communitySentenceCloze499'
  import { CONSTRUCTION_SENTENCE_CLOZE_560 } from './src/pathways/packs/constructionSentenceCloze560'
  import { LOGISTICS_SENTENCE_CLOZE_560 } from './src/pathways/packs/logisticsSentenceCloze560'
  import { VOCAB_UNIT } from './src/student/journeyCurriculum'
  import { BASIC_COMPUTER_SKILLS_VIDEOS } from './src/pathways/packs/basicComputerSkillsVideos'
  import { COMMUNITY_WORKBOOKS } from './src/instructor/communityWorkbooks'
  export const audit = {
    COMMUNITY_VOCAB_500,
    DAILY_CONVERSATION_VOCAB_200,
    CONSTRUCTION_VOCAB_660,
    LOGISTICS_VOCAB_500,
    COMMUNITY_SENTENCE_CLOZE_499,
    CONSTRUCTION_SENTENCE_CLOZE_560,
    LOGISTICS_SENTENCE_CLOZE_560,
    VOCAB_UNIT,
    BASIC_COMPUTER_SKILLS_VIDEOS,
    COMMUNITY_WORKBOOKS,
  }
`

const bundled = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'ts' },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  define: { 'import.meta.env': '{"BASE_URL":"/"}' },
})
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
)
const data = mod.audit

const toolImages = {
  'hard-hat': 'src/assets/photos/tools/hardhat-photo.jpg',
  hammer: 'src/assets/photos/tools/hammer-clear.jpg',
  'tape-measure': 'src/assets/photos/tools/tape-photo.jpg',
  saw: 'src/assets/photos/tools/saw-photo.jpg',
  drill: 'src/assets/photos/tools/drill-clear.jpg',
  level: 'src/assets/photos/tools/level-photo.jpg',
  ppe: 'src/assets/photos/tools/ppe-clear.jpg',
  'safety-check': 'src/assets/photos/tools/ppe-clear.jpg',
}

function imageExists(key) {
  if (!key) return false
  if (toolImages[key]) return existsSync(join(root, toolImages[key]))
  if (key.startsWith('com-vv-')) return existsSync(join(root, 'public/media/community-vv', `${key}.jpg`))
  if (key.startsWith('dc-vv-')) return existsSync(join(root, 'public/media/daily-conversation-vv', `${key}.jpg`))
  if (key.startsWith('con-vv-')) return existsSync(join(root, 'public/media/construction-vv', `${key}.jpg`))
  if (key.startsWith('log-vv-')) return existsSync(join(root, 'public/media/logistics-vv', `${key}.jpg`))
  if (key.startsWith('com-')) return existsSync(join(root, 'src/assets/photos/community', `${key}.jpg`))
  if (key.startsWith('log-')) return existsSync(join(root, 'src/assets/photos/logistics', `${key}.jpg`))
  return false
}

function auditVocab(name, terms) {
  const ids = new Set()
  let missingGloss = 0
  let missingImage = 0
  for (const term of terms) {
    if (!term.id || ids.has(term.id)) fail(`${name}: duplicate or empty id ${term.id}`)
    ids.add(term.id)
    if (!term.english?.trim()) fail(`${name}: ${term.id} has no English word`)
    if (!term.definition?.trim()) fail(`${name}: ${term.id} has no definition`)
    if (!term.sentence?.trim()) fail(`${name}: ${term.id} has no sentence`)
    if (!term.emoji?.trim()) fail(`${name}: ${term.id} has no emoji fallback`)
    for (const lang of HOMES) {
      const value = term.gloss?.[lang]
      if (!value || !String(value).trim() || /^(tbd|-|\?+)$/i.test(String(value).trim())) {
        fail(`${name}: ${term.id} missing ${lang} gloss`)
        missingGloss += 1
      }
    }
    if (!imageExists(term.imageKey)) {
      fail(`${name}: ${term.id} image does not resolve: ${term.imageKey}`)
      missingImage += 1
    }
  }
  console.log(
    `OK   ${name}: ${terms.length} words · ${missingGloss} missing glosses · ${missingImage} missing images`,
  )
}

for (const [name, terms] of [
  ['Community vocabulary', data.COMMUNITY_VOCAB_500],
  ['Daily conversation vocabulary', data.DAILY_CONVERSATION_VOCAB_200],
  ['Construction vocabulary', data.CONSTRUCTION_VOCAB_660],
  ['Logistics vocabulary', data.LOGISTICS_VOCAB_500],
  ['Construction starter vocabulary', data.VOCAB_UNIT],
]) {
  auditVocab(name, terms)
}

function auditCloze(name, items) {
  const ids = new Set()
  let missingImage = 0
  for (const item of items) {
    if (!item.id || ids.has(item.id)) fail(`${name}: duplicate or empty id ${item.id}`)
    ids.add(item.id)
    if (!item.prompt.includes('______')) fail(`${name}: ${item.id} has no cloze blank`)
    if (!Array.isArray(item.options) || item.options.length < 3) {
      fail(`${name}: ${item.id} needs at least 3 choices`)
    } else {
      if (new Set(item.options).size !== item.options.length) fail(`${name}: ${item.id} has duplicate choices`)
      if (!item.options.includes(item.answer)) fail(`${name}: ${item.id} answer is not in choices`)
    }
    const hasImage =
      (item.imageFile && existsSync(join(root, 'public/sentence-cloze', item.imageFile))) ||
      (item.imageKey && imageExists(item.imageKey))
    if (!hasImage) {
      fail(`${name}: ${item.id} image does not resolve (${item.imageFile || item.imageKey || 'none'})`)
      missingImage += 1
    }
  }
  console.log(`OK   ${name}: ${items.length} sentences · ${missingImage} missing images`)
}

auditCloze('Community sentence cloze', data.COMMUNITY_SENTENCE_CLOZE_499)
auditCloze('Construction sentence cloze', data.CONSTRUCTION_SENTENCE_CLOZE_560)
auditCloze('Logistics sentence cloze', data.LOGISTICS_SENTENCE_CLOZE_560)

/* Supported Practice deck — regex is deliberate: the module imports image assets. */
const deckSrc = readFileSync(join(root, 'src/pathways/packs/supportedPracticeDeck.ts'), 'utf8')
const stills = [...deckSrc.matchAll(/still\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g)].map((m) => ({
  id: m[1],
  sentence: m[2],
  stem: m[3],
}))
const objects = [...deckSrc.matchAll(/object\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g)].map((m) => ({
  id: m[1],
  sentence: m[2],
  key: m[3],
}))
const deckIds = new Set()
for (const item of [...stills, ...objects]) {
  if (deckIds.has(item.id)) fail(`Supported Practice: duplicate id ${item.id}`)
  deckIds.add(item.id)
  if (!item.sentence.trim()) fail(`Supported Practice: ${item.id} has no sentence`)
}
for (const item of stills) {
  if (!existsSync(join(root, 'public/media/supported-practice/posters', `${item.stem}.jpg`))) {
    fail(`Supported Practice: ${item.id} poster missing: ${item.stem}.jpg`)
  }
}
for (const item of objects) {
  if (!imageExists(item.key)) fail(`Supported Practice: ${item.id} object image missing: ${item.key}`)
}
console.log(`OK   Supported Practice: ${stills.length} photo stills · ${objects.length} object photos`)

/* Workbook library — metadata + all three local image sizes. */
const workbookNumbers = new Set()
const categoryIds = new Set(['people', 'communication', 'daily', 'safety', 'community', 'work', 'health'])
for (const set of data.COMMUNITY_WORKBOOKS) {
  if (workbookNumbers.has(set.n)) fail(`Workbooks: duplicate set ${set.n}`)
  workbookNumbers.add(set.n)
  if (!set.title?.trim() || !set.focus?.trim()) fail(`Workbooks: set ${set.n} has empty title or focus`)
  if (!categoryIds.has(set.category)) fail(`Workbooks: set ${set.n} has unknown category ${set.category}`)
  if (!Number.isInteger(set.words) || set.words < 1) fail(`Workbooks: set ${set.n} has invalid word count`)
  for (const suffix of ['', '-thumb']) {
    for (const stem of ['csw', 'check']) {
      const file = join(root, 'public/workbooks/community', `${stem}-${String(set.n).padStart(2, '0')}${suffix}.webp`)
      if (!existsSync(file)) fail(`Workbooks: missing ${file.replace(root, '')}`)
    }
  }
}
for (let n = 1; n <= 25; n += 1) {
  if (!workbookNumbers.has(n)) fail(`Workbooks: set ${n} missing from metadata`)
}
console.log(`OK   Workbooks: ${data.COMMUNITY_WORKBOOKS.length} sets · workbook + check + thumbnail local`)

const lessons = data.BASIC_COMPUTER_SKILLS_VIDEOS
console.log(
  `OK   Computer course: ${lessons.length} lessons · ${lessons.reduce((n, lesson) => n + lesson.questions.length, 0)} practice questions`,
)
if (lessons.length !== 13) fail(`Computer course: expected 13 lessons, found ${lessons.length}`)
if (lessons.some((lesson) => lesson.questions.length !== 10)) {
  fail('Computer course: every lesson must have 10 practice questions')
}

if (failed) {
  console.error(`\n${failed} content failure(s).`)
  process.exit(1)
}
console.log('\nOK   Content audit passed.')
