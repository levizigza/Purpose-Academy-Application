/**
 * Bake Microsoft Edge neural MP3s for Practice Mode speech into public/tts/.
 * Used by GitHub Pages (no API) so Hear English stays human-sounding.
 *
 * Usage: node scripts/bake-tts.mjs
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { synthesizeSpeech } from '../server/src/publicApis.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'tts')

const SOURCE_FILES = [
  'src/student/journeyCurriculum.ts',
  'src/pathways/packs/construction.ts',
  'src/pathways/packs/logistics.ts',
  'src/pathways/packs/community.ts',
]

/** @type {Map<string, { lang: string, text: string }>} */
const phrases = new Map()

function add(lang, text) {
  const clean = String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
  if (!clean || clean.length > 280) return
  const key = `${lang}::${clean}`
  if (!phrases.has(key)) phrases.set(key, { lang, text: clean })
}

function extractFromSource(filePath) {
  const abs = path.join(root, filePath)
  if (!fs.existsSync(abs)) return
  const src = fs.readFileSync(abs, 'utf8')

  for (const m of src.matchAll(/english:\s*'((?:\\'|[^'])*)'/g)) add('en', m[1].replace(/\\'/g, "'"))
  for (const m of src.matchAll(/sentence:\s*'((?:\\'|[^'])*)'/g)) add('en', m[1].replace(/\\'/g, "'"))
  for (const m of src.matchAll(/\ben:\s*'((?:\\'|[^'])*)'/g)) add('en', m[1].replace(/\\'/g, "'"))
  for (const m of src.matchAll(/text:\s*'((?:\\'|[^'])*)'/g)) add('en', m[1].replace(/\\'/g, "'"))

  for (const m of src.matchAll(/Amharic:\s*'((?:\\'|[^'])*)'/g)) add('am', m[1].replace(/\\'/g, "'"))
  for (const m of src.matchAll(/Tigrinya:\s*'((?:\\'|[^'])*)'/g)) add('ti', m[1].replace(/\\'/g, "'"))
  for (const m of src.matchAll(/Arabic:\s*'((?:\\'|[^'])*)'/g)) add('ar', m[1].replace(/\\'/g, "'"))
  for (const m of src.matchAll(/Spanish:\s*'((?:\\'|[^'])*)'/g)) add('es', m[1].replace(/\\'/g, "'"))
  for (const m of src.matchAll(/Hindi:\s*'((?:\\'|[^'])*)'/g)) add('hi', m[1].replace(/\\'/g, "'"))

  /* packHelpers gloss('es','ar','hi','am','ti') */
  for (const m of src.matchAll(
    /gloss\(\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*\)/g,
  )) {
    add('es', m[1].replace(/\\'/g, "'"))
    add('ar', m[2].replace(/\\'/g, "'"))
    add('hi', m[3].replace(/\\'/g, "'"))
    add('am', m[4].replace(/\\'/g, "'"))
    add('ti', m[5].replace(/\\'/g, "'"))
  }

  /* hint(English, Spanish, Arabic, Hindi, Amharic, Tigrinya) */
  for (const m of src.matchAll(
    /hint\(\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*\)/g,
  )) {
    add('en', m[1].replace(/\\'/g, "'"))
    add('es', m[2].replace(/\\'/g, "'"))
    add('ar', m[3].replace(/\\'/g, "'"))
    add('hi', m[4].replace(/\\'/g, "'"))
    add('am', m[5].replace(/\\'/g, "'"))
    add('ti', m[6].replace(/\\'/g, "'"))
  }
}

function fileNameFor(lang, text) {
  const hash = crypto.createHash('sha1').update(`${lang}\0${text}`).digest('hex').slice(0, 16)
  return `${lang}-${hash}.mp3`
}

async function main() {
  for (const f of SOURCE_FILES) extractFromSource(f)
  fs.mkdirSync(outDir, { recursive: true })

  const list = [...phrases.values()]
  console.log(`Baking ${list.length} neural TTS clips into public/tts/ …`)

  /** @type {Record<string, string>} */
  const manifest = {}
  let ok = 0
  let fail = 0

  for (let i = 0; i < list.length; i++) {
    const { lang, text } = list[i]
    const file = fileNameFor(lang, text)
    const dest = path.join(outDir, file)
    const key = `${lang}::${text}`
    process.stdout.write(`[${i + 1}/${list.length}] ${lang} ${text.slice(0, 40)}… `)
    try {
      if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
        manifest[key] = file
        ok++
        console.log('cached')
        continue
      }
      const result = await synthesizeSpeech(text, lang)
      fs.writeFileSync(dest, result.buffer)
      manifest[key] = file
      ok++
      console.log(`${result.voice} (${result.buffer.length}b)`)
    } catch (e) {
      fail++
      console.log(`FAIL ${e.message || e}`)
    }
  }

  /* Drop orphan mp3s not in manifest */
  const keep = new Set(Object.values(manifest))
  for (const name of fs.readdirSync(outDir)) {
    if (!name.endsWith('.mp3')) continue
    if (!keep.has(name)) fs.unlinkSync(path.join(outDir, name))
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(`Done. ok=${ok} fail=${fail} manifest=${Object.keys(manifest).length}`)
  if (ok === 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
