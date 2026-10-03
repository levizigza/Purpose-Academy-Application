import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src/assets/brand/logo-full.jpg')
const out = path.join(root, 'scripts/p-slot-overlay.png')

const m = await sharp(src).metadata()
const w = m.width
const h = m.height

// Measured ink bbox (includes open door leaf)
const slots = [
  { name: 'ink', l: 0.375, t: 0.0806, ww: 0.3008, hh: 0.3372, color: { r: 255, g: 0, b: 0, alpha: 0.35 } },
  // Glyph-tall slot centered on P: height from ink, width from SVG P aspect ~0.71
  { name: 'glyph', l: 0.5254 - (0.3372 * 0.71 * (h / w)) / 2, t: 0.0806, ww: 0.3372 * 0.71 * (h / w), hh: 0.3372, color: { r: 0, g: 200, b: 80, alpha: 0.35 } },
  // Wider to include open door leaf landing
  { name: 'with-door', l: 0.30, t: 0.06, ww: 0.40, hh: 0.38, color: { r: 0, g: 120, b: 255, alpha: 0.3 } },
]

let img = sharp(src)
const composites = []
for (const s of slots) {
  const sw = Math.round(w * s.ww)
  const sh = Math.round(h * s.hh)
  const left = Math.round(w * s.l)
  const top = Math.round(h * s.t)
  const overlay = await sharp({
    create: { width: sw, height: sh, channels: 4, background: s.color },
  })
    .png()
    .toBuffer()
  composites.push({ input: overlay, left, top })
  console.log(s.name, { left, top, sw, sh, pct: s })
}

await img.composite(composites).png().toFile(out)
console.log('wrote', out)
