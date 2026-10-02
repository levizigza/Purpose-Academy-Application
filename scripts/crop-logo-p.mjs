import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))
const src = path.join(root, '../src/assets/brand/logo-full.jpg')
const outP = path.join(root, '../src/assets/brand/logo-p-open.png')
const outLockup = path.join(root, '../src/assets/brand/logo-lockup.png')

const img = sharp(src)
const m = await img.metadata()
console.log('source', m.width, m.height)

// logo-full layout (approx):
// - P + light spill occupy top ~48–52%
// - wordmark mid
// - pathway icons bottom
const left = Math.round(m.width * 0.16)
const top = 0
const width = Math.round(m.width * 0.68)
const height = Math.round(m.height * 0.5)

await sharp(src).extract({ left, top, width, height }).png().toFile(outP)
console.log('wrote P crop', { left, top, width, height, outP })

await sharp(src).png().toFile(outLockup)
console.log('wrote lockup', outLockup)
