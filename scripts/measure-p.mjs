import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src/assets/brand/logo-full.jpg')

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const w = info.width
const h = info.height
console.log('dims', w, h)

const band = Math.round(h * 0.42)
let pMinX = w
let pMinY = h
let pMaxX = 0
let pMaxY = 0

for (let y = 0; y < band; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = (r + g + b) / 3
    // Navy ink; exclude warm doorway light
    if (lum < 200 && !(r > 200 && g > 180 && b < 140)) {
      if (x < pMinX) pMinX = x
      if (y < pMinY) pMinY = y
      if (x > pMaxX) pMaxX = x
      if (y > pMaxY) pMaxY = y
    }
  }
}

const pct = {
  left: ((pMinX / w) * 100).toFixed(2),
  top: ((pMinY / h) * 100).toFixed(2),
  width: (((pMaxX - pMinX) / w) * 100).toFixed(2),
  height: (((pMaxY - pMinY) / h) * 100).toFixed(2),
  centerX: ((((pMinX + pMaxX) / 2) / w) * 100).toFixed(2),
  centerY: ((((pMinY + pMaxY) / 2) / h) * 100).toFixed(2),
}

console.log('P bbox px', { pMinX, pMinY, pMaxX, pMaxY })
console.log('P bbox %', pct)

// Also find doorway stem (bright vertical band in P area)
let doorMinX = w
let doorMaxX = 0
for (let y = Math.round(h * 0.05); y < Math.round(h * 0.35); y++) {
  for (let x = Math.round(w * 0.3); x < Math.round(w * 0.7); x++) {
    const i = (y * w + x) * 4
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // warm / bright light in doorway
    if (r > 220 && g > 200 && b > 140) {
      if (x < doorMinX) doorMinX = x
      if (x > doorMaxX) doorMaxX = x
    }
  }
}
console.log('door light %', {
  left: ((doorMinX / w) * 100).toFixed(2),
  width: (((doorMaxX - doorMinX) / w) * 100).toFixed(2),
  centerX: ((((doorMinX + doorMaxX) / 2) / w) * 100).toFixed(2),
})
