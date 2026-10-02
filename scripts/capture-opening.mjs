import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))
const web = process.argv[2] || 'http://localhost:5174'
const outDir = path.join(root, '../scripts')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 900, height: 1100 } })

await page.addInitScript(() => {
  sessionStorage.removeItem('pa-crossed-threshold-v15')
  sessionStorage.removeItem('pa-crossed-threshold-v14')
})

await page.goto(web + '/?splash=1', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(outDir, 'opening-closed.png') })
console.log('closed')

await page.waitForTimeout(4500)
await page.screenshot({ path: path.join(outDir, 'opening-mid.png') })
console.log('mid')

await page.waitForTimeout(4000)
await page.screenshot({ path: path.join(outDir, 'opening-open.png') })
console.log('open')

await page.waitForTimeout(3500)
await page.screenshot({ path: path.join(outDir, 'opening-lockup.png') })
console.log('lockup')

await browser.close()
