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
  'src/pathways/packs/logisticsVocab500.ts',
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

async function synthesizeWithRetry(text, lang, attempts = 4) {
  let lastErr
  for (let n = 1; n <= attempts; n++) {
    try {
      return await synthesizeSpeech(text, lang)
    } catch (e) {
      lastErr = e
      const wait = Math.min(8000, 400 * 2 ** (n - 1))
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw lastErr
}

async function main() {
  for (const f of SOURCE_FILES) extractFromSource(f)
  fs.mkdirSync(outDir, { recursive: true })

  /* Force re-bake logistics worksheet audio so all 500 words get clearer neural clips. */
  const forceLogistics = process.env.BAKE_FORCE_LOGISTICS !== '0'
  /** @type {Set<string>} */
  const logisticsKeys = new Set()
  if (forceLogistics) {
    const before = phrases.size
    phrases.clear()
    extractFromSource('src/pathways/packs/logisticsVocab500.ts')
    for (const { lang, text } of phrases.values()) logisticsKeys.add(`${lang}::${text}`)
    for (const f of SOURCE_FILES) extractFromSource(f)
    console.log(
      `Force-rebake logistics worksheet phrases: ${logisticsKeys.size} (total unique after merge: ${phrases.size}; was ${before} before reload)`,
    )
  }

  const langOrder = { en: 0, es: 1, ar: 2, hi: 3, am: 4, ti: 5 }
  const list = [...phrases.values()].sort(
    (a, b) => (langOrder[a.lang] ?? 9) - (langOrder[b.lang] ?? 9) || a.text.localeCompare(b.text),
  )
  const concurrency = Math.max(1, Number(process.env.BAKE_CONCURRENCY || 8))
  console.log(`Baking ${list.length} neural TTS clips into public/tts/ (concurrency=${concurrency}) …`)

  /** @type {Record<string, string>} */
  const manifest = {}
  let ok = 0
  let fail = 0
  let cached = 0

  async function bakeOne(item, index) {
    const { lang, text } = item
    const file = fileNameFor(lang, text)
    const dest = path.join(outDir, file)
    const key = `${lang}::${text}`
    const mustRefresh = forceLogistics && logisticsKeys.has(key)
    const label = `[${index + 1}/${list.length}] ${lang} ${text.slice(0, 40)}`
    try {
      if (!mustRefresh && fs.existsSync(dest) && fs.statSync(dest).size > 500) {
        manifest[key] = file
        ok++
        cached++
        console.log(`${label}… cached`)
        return
      }
      if (mustRefresh && fs.existsSync(dest)) fs.unlinkSync(dest)
      const result = await synthesizeWithRetry(text, lang)
      if (!result.buffer || result.buffer.length < 400) throw new Error('clip too small')
      fs.writeFileSync(dest, result.buffer)
      manifest[key] = file
      ok++
      console.log(`${label}… ${result.voice} (${result.buffer.length}b)`)
    } catch (e) {
      fail++
      console.log(`${label}… FAIL ${e.message || e}`)
    }
  }

  for (let i = 0; i < list.length; i += concurrency) {
    const batch = list.slice(i, i + concurrency)
    await Promise.all(batch.map((item, j) => bakeOne(item, i + j)))
  }

  /* Drop orphan mp3s not in manifest */
  const keep = new Set(Object.values(manifest))
  for (const name of fs.readdirSync(outDir)) {
    if (!name.endsWith('.mp3')) continue
    if (!keep.has(name)) fs.unlinkSync(path.join(outDir, name))
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(
    `Done. ok=${ok} cached=${cached} fail=${fail} manifest=${Object.keys(manifest).length}`,
  )
  if (ok === 0) process.exit(1)
  if (fail > 0) {
    console.error(`Warning: ${fail} clips failed — re-run bake:tts to fill gaps.`)
    process.exitCode = 2
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
