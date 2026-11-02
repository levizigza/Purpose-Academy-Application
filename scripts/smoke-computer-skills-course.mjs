/**
 * Static smoke: Basic Computer Skills course shape + video/timing honesty.
 * 5 Basic (required) + 8 Extra lessons · 10 practice questions each · replay lines exist ·
 * every MP4 on disk · narration in lessons.json == timing beats · no exam lexicon.
 * Usage: node scripts/smoke-computer-skills-course.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = await build({
  entryPoints: [join(root, 'src/pathways/packs/basicComputerSkillsVideos.ts')],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  define: { 'import.meta.env': '{"BASE_URL":"/"}' },
})
const mod = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`)
const lessons = mod.BASIC_COMPUTER_SKILLS_VIDEOS
const script = JSON.parse(readFileSync(join(root, 'scripts/bcs-render/lessons.json'), 'utf8'))
const timingSrc = readFileSync(join(root, 'src/pathways/packs/basicComputerSkillsTiming.ts'), 'utf8')
const timing = JSON.parse(timingSrc.slice(timingSrc.indexOf('}> = ') + 5))

let failed = 0
const fail = (m) => {
  console.error(`FAIL ${m}`)
  failed += 1
}
const BANNED = /\b(quiz|exam|test|score|mastery|perfect|assessment|fail)\b/i

if (lessons.filter((l) => l.core).length !== 5) fail('expected 5 Basic lessons')
if (lessons.filter((l) => !l.core).length < 7) fail('expected 7–8 Extra lessons')
if (lessons.slice(0, 5).some((l) => !l.core)) fail('Basic lessons must come first')
for (const l of lessons) {
  const s = script.find((x) => x.id === l.id)
  if (!s) fail(`${l.id} missing from lessons.json`)
  if (!existsSync(join(root, 'public/media/basic-computer-skills', l.file))) fail(`${l.id} video missing: ${l.file}`)
  const t = timing[l.id]
  if (!t) fail(`${l.id} missing timing`)
  if (s && t && JSON.stringify(s.lines) !== JSON.stringify(t.beats.map((b) => b.text))) fail(`${l.id} timing stale — rebuild video`)
  if (l.questions.length !== 10) fail(`${l.id} has ${l.questions.length} questions`)
  for (const q of l.questions) {
    if (!q.choices[q.answer]) fail(`${q.id} answer out of range`)
    if (new Set(q.choices).size !== q.choices.length) fail(`${q.id} duplicate choices`)
    if (!t?.beats[q.beat]) fail(`${q.id} replay beat ${q.beat} missing`)
    if (!q.teach.trim()) fail(`${q.id} empty teach`)
    for (const text of [q.prompt, q.teach, ...q.choices]) if (BANNED.test(text)) fail(`${q.id} exam lexicon: ${text}`)
  }
  for (const line of s?.lines || []) if (line.split(/\s+/).length > 12) fail(`${l.id} line too long for Level-4: ${line}`)
}
console.log(failed ? `${failed} failure(s)` : `OK   ${lessons.length} lessons · ${lessons.reduce((n, l) => n + l.questions.length, 0)} practice questions`)
process.exit(failed ? 1 : 0)
