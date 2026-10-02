import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))
const src = path.join(root, '../src/assets/brand/logo-p-open.png')
const out = path.join(root, '../src/assets/brand/logo-p-open.png')

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  // Knock out near-white / light gray page background
  if (r > 245 && g > 245 && b > 245) {
    data[i + 3] = 0
  } else if (r > 235 && g > 235 && b > 235) {
    data[i + 3] = Math.round(((255 - Math.min(r, g, b)) / 20) * 255)
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(out)

console.log('knocked out white background', info.width, info.height)
