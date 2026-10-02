import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))
const web = process.argv[2] || 'http://localhost:5174'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 900, height: 1100 } })
page.setDefaultTimeout(15000)

await page.addInitScript(() => {
  for (const k of Object.keys(sessionStorage)) {
    if (k.startsWith('pa-crossed-threshold')) sessionStorage.removeItem(k)
  }
})

await page.goto(web + '/', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForSelector('.threshold', { timeout: 10000 })
await page.waitForTimeout(500)

async function shot(name) {
  await page.screenshot({
    path: path.join(root, name),
    animations: 'disabled',
    timeout: 8000,
  }).catch(async () => {
    // Fallback without animations option if needed
    await page.evaluate(() => document.fonts?.ready?.catch?.(() => {}))
    await page.screenshot({ path: path.join(root, name), timeout: 8000 })
  })
  console.log(name)
}

await shot('opening-closed.png')
await page.waitForTimeout(2500)
await shot('opening-mid.png')
await page.waitForTimeout(3400)
await shot('opening-settle.png')
await page.waitForTimeout(2200)
await shot('opening-open.png')
await page.waitForTimeout(2500)
await shot('opening-ready.png')

await browser.close()
