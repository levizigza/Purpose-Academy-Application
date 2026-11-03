#!/usr/bin/env node
/**
 * Frame-accurate render of one Basic Computer Skills lesson.
 *   node scripts/bcs-render/render.mjs <lesson.json> <timing.json> <outDir> <seconds> [fps]
 * Writes outDir/f_00001.jpg … — every frame is renderAt(t) so actions land on the spoken word.
 */
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const [lessonPath, timingPath, outDir, secondsArg, fpsArg] = process.argv.slice(2)
const lesson = JSON.parse(readFileSync(lessonPath, 'utf8'))
const timing = JSON.parse(readFileSync(timingPath, 'utf8'))
const seconds = Number(secondsArg)
const fps = Number(fpsArg || 12)
mkdirSync(outDir, { recursive: true })

const here = dirname(fileURLToPath(import.meta.url))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(pathToFileURL(resolve(join(here, 'scene.html'))).href)
await page.evaluate(([l, t]) => window.setup(l, t), [lesson, timing])
const total = Math.ceil(seconds * fps)
for (let i = 0; i < total; i += 1) {
  await page.evaluate((t) => window.renderAt(t), i / fps)
  await page.screenshot({ path: join(outDir, `f_${String(i + 1).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 88 })
}
await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`rendered ${total} frames → ${outDir}`)
