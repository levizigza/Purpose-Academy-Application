/**
 * Career Profile “Why this fits you” — navy ink on cream, phone paper shell.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = process.env.PLAY_URL || 'http://127.0.0.1:4180/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
await page.addInitScript(() => {
  sessionStorage.clear()
  localStorage.clear()
})

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.locator('button.mode-door-phone').first().click()
await page.waitForTimeout(600)
await page.locator('.phone-home-app').first().click()
try {
  await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
  await page.locator('.threshold-hammer').click({ force: true })
  await page.waitForTimeout(2600)
} catch {
  console.log('WARN: hammer missed')
}

let entered = false
for (let i = 0; i < 6 && !entered; i++) {
  const slot = page.locator('button.toolbox-slot, .toolbox-slot').filter({ hasText: /Practice/i }).first()
  if (await slot.count()) {
    try {
      await slot.click({ timeout: 5000 })
      entered = true
    } catch {
      await page.waitForTimeout(800)
    }
  } else await page.waitForTimeout(800)
}
if (!entered) await page.goto(`${BASE}/journey?practice=1`, { waitUntil: 'networkidle' })

await page.waitForTimeout(800)
const levi = page.locator('.practice-name-grid button, .iphone-scroll button').filter({ hasText: /^Levi$/i }).first()
if (await levi.count()) {
  await levi.click()
  await page.locator('button').filter({ hasText: /Enter Practice/i }).first().click()
  await page.waitForTimeout(2000)
}

const open = page
  .locator('.iphone-scroll button')
  .filter({ hasText: /Open today('|’)s station|Open today|Resume|Current lesson/i })
  .first()
if (await open.count()) {
  await open.click()
  await page.waitForTimeout(1400)
}

const menu = page.locator('.iphone-scroll .train-station-menu').first()
if (await menu.count()) {
  if (!(await menu.evaluate((el) => el.open))) await menu.locator('summary').first().click()
  await page.waitForTimeout(200)
  const sel = page.locator('.iphone-scroll .train-station-menu[open] select').first()
  const options = await sel.locator('option').allTextContents()
  const hit = options.find((t) => /Career Profile/i.test(t))
  if (!hit) {
    console.error('FAIL: Career Profile missing', options.slice(0, 12))
    process.exit(1)
  }
  await sel.selectOption({ label: hit })
  await page.waitForTimeout(1000)
  await page.locator('.iphone-scroll').evaluate((el) => {
    el.scrollTop = 0
  })
}

/* If still on work-style questions, answer enough to reach result when possible */
for (let i = 0; i < 12; i++) {
  const strengths = page.locator('.iphone-scroll .career-strengths li')
  if (await strengths.count()) break
  const choice = page.locator('.iphone-scroll .career-choice, .iphone-scroll .career-likert-btn').first()
  if (await choice.count()) {
    await choice.click()
    const next = page.locator('.iphone-scroll button.btn-primary').filter({ hasText: /Continue|Next|See/i }).first()
    if (await next.count()) await next.click()
    await page.waitForTimeout(500)
  } else break
}

await page.waitForTimeout(600)
const result = await page.evaluate(() => {
  const items = [...document.querySelectorAll('.iphone-scroll .career-strengths li')]
  return {
    count: items.length,
    samples: items.slice(0, 3).map((el) => {
      const s = getComputedStyle(el)
      const rgb = s.color.match(/\d+/g)?.map(Number)
      const lum = rgb ? (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 : null
      return { text: (el.textContent || '').trim().slice(0, 60), color: s.color, lum }
    }),
  }
})

const shot = path.join(OUT, 'walkthrough-career-strengths-phone.png')
await page.locator('.iphone-frame, .iphone-scroll').first().screenshot({ path: shot }).catch(() =>
  page.screenshot({ path: shot, fullPage: false }),
)

console.log(JSON.stringify(result, null, 2))
console.log('SHOT', shot)

if (!result.count) {
  console.error('FAIL: no career-strengths on phone Career Profile (may need prior work-style answers)')
  process.exit(1)
}
const bad = result.samples.filter((s) => s.lum != null && s.lum > 0.55)
if (bad.length) {
  console.error('FAIL light ink', bad)
  process.exit(1)
}
console.log('PASS career strengths navy on paper')
await browser.close()
