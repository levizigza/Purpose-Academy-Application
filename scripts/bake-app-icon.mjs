/**
 * Bake logo-app-icon.png from logo-full.jpg.
 * Doorway P + light spill only (cut before wordmark), centered in 512²
 * with ~18% safe inset so the SpringBoard ~22.5% squircle never clips the letter.
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src/assets/brand/logo-full.jpg')
const out = path.join(root, 'src/assets/brand/logo-app-icon.png')

const SIZE = 512
const SAFE = Math.round(SIZE * 0.18)
const WORDMARK_Y = 360

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const w = info.width

let minX = w
let minY = WORDMARK_Y
let maxX = 0
let maxY = 0
for (let y = 0; y < WORDMARK_Y; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (!(r > 248 && g > 248 && b > 248)) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}

const bleedX = 28
const bleedTop = 24
const bleedBot = 20
minX = Math.max(0, minX - bleedX)
minY = Math.max(0, minY - bleedTop)
maxX = Math.min(w - 1, maxX + bleedX)
maxY = Math.min(WORDMARK_Y - 1, maxY + bleedBot)

const cw = maxX - minX + 1
const ch = maxY - minY + 1
const extracted = await sharp(src)
  .extract({ left: minX, top: minY, width: cw, height: ch })
  .png()
  .toBuffer()

const inner = SIZE - SAFE * 2
const fitted = await sharp(extracted)
  .resize(inner, inner, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toBuffer()

await sharp({
  create: {
    width: SIZE,
    height: SIZE,
    channels: 3,
    background: { r: 255, g: 255, b: 255 },
  },
})
  .composite([{ input: fitted, left: SAFE, top: SAFE }])
  .png()
  .toFile(out)

console.log('wrote', out, { extract: { minX, minY, cw, ch }, SAFE, inner })
