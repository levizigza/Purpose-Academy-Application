/**
 * Bake logo-app-icon.png from logo-full.jpg.
 * Doorway P + light spill only (cut before wordmark), optically centered in 512²
 * with ~18% safe inset so the SpringBoard ~22.5% squircle never clips the letter.
 *
 * Geometric bbox center leaves the mark heavy on the right (P bowl). We nudge
 * so the ink mass center lands on the canvas center.
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
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Find ink mass center inside the fitted tile (letterbox-aware)
let sumX = 0
let sumY = 0
let mass = 0
let fMinX = inner
let fMaxX = 0
let fMinY = inner
let fMaxY = 0
for (let y = 0; y < fitted.info.height; y++) {
  for (let x = 0; x < fitted.info.width; x++) {
    const i = (y * fitted.info.width + x) * 4
    const r = fitted.data[i]
    const g = fitted.data[i + 1]
    const b = fitted.data[i + 2]
    const lum = (r + g + b) / 3
    if (lum < 230) {
      const weight = Math.max(1, 255 - lum)
      sumX += x * weight
      sumY += y * weight
      mass += weight
      if (x < fMinX) fMinX = x
      if (x > fMaxX) fMaxX = x
      if (y < fMinY) fMinY = y
      if (y > fMaxY) fMaxY = y
    }
  }
}

const massCx = sumX / mass
const massCy = sumY / mass
const canvasCenter = SIZE / 2
// True mass center — P bowl is denser on the right; equal bbox margins look heavy-right
const opticalX = canvasCenter
const opticalY = canvasCenter

// Place so ink mass hits the optical center (clamp so ink stays inside SAFE pad)
let left = Math.round(opticalX - massCx)
let top = Math.round(opticalY - massCy)
const pad = Math.round(SIZE * 0.1) // hard floor — keep clear of squircle
left = Math.min(left, SIZE - 1 - fMaxX - pad)
left = Math.max(left, pad - fMinX)
top = Math.min(top, SIZE - 1 - fMaxY - pad)
top = Math.max(top, pad - fMinY)

const fittedPng = await sharp(fitted.data, {
  raw: {
    width: fitted.info.width,
    height: fitted.info.height,
    channels: 4,
  },
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
  .composite([{ input: fittedPng, left, top }])
  .png()
  .toFile(out)

console.log('wrote', out, {
  extract: { minX, minY, cw, ch },
  SAFE,
  inner,
  place: { left, top },
  massInTile: { x: massCx.toFixed(1), y: massCy.toFixed(1) },
  targetCenter: canvasCenter,
})
