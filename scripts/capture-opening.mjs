import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))
const web = process.argv[2] || 'http://localhost:5174'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 900, height: 1100 } })

await page.addInitScript(() => {
  for (const k of Object.keys(sessionStorage)) {
    if (k.startsWith('pa-crossed-threshold')) sessionStorage.removeItem(k)
  }
})

await page.goto(web + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(root, 'opening-closed.png') })
console.log('closed')

await page.waitForTimeout(2500)
await page.screenshot({ path: path.join(root, 'opening-mid.png') })
console.log('mid')

/* During zoom-out + lockup crossfade */
await page.waitForTimeout(3400)
await page.screenshot({ path: path.join(root, 'opening-settle.png') })
console.log('settle')

await page.waitForTimeout(2200)
await page.screenshot({ path: path.join(root, 'opening-open.png') })
console.log('open')

await page.waitForTimeout(2500)
await page.screenshot({ path: path.join(root, 'opening-ready.png') })
console.log('ready')

await browser.close()
