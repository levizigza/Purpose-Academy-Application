/**
 * Bake neural TTS only for newly changed logistics gloss phrases.
 */
import { synthesizeSpeech } from '../server/src/publicApis.js'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/tts')
const manifestPath = path.join(outDir, 'manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const phrases = [
  { lang: 'ti', text: 'ሳንዱቕ' },
  { lang: 'ti', text: 'መደርደሪ' },
  { lang: 'am', text: 'መቆሚያ' },
  { lang: 'ti', text: 'መደራረሪ' },
  { lang: 'hi', text: 'ट्राली' },
  { lang: 'am', text: 'ተሽከርካሪ ጋሪ' },
  { lang: 'ti', text: 'ተሽከርካሪ' },
  { lang: 'es', text: 'Carrito' },
  { lang: 'ti', text: 'ካላሾ' },
  { lang: 'ti', text: 'መተሓላለፊ' },
]

function fileNameFor(lang, text) {
  const hash = crypto.createHash('sha1').update(`${lang}\0${text}`).digest('hex').slice(0, 16)
  return `${lang}-${hash}.mp3`
}

for (const { lang, text } of phrases) {
  const file = fileNameFor(lang, text)
  const dest = path.join(outDir, file)
  const key = `${lang}::${text}`
  if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
    manifest[key] = file
    console.log('skip', text)
    continue
  }
  try {
    const result = await synthesizeSpeech(text, lang)
    fs.writeFileSync(dest, result.buffer)
    manifest[key] = file
    console.log('baked', file, text)
  } catch (e) {
    console.error('FAIL', text, e.message)
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log('manifest', Object.keys(manifest).length)
