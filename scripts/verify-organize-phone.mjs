/**
 * Focused Language Organize phone check — layout, ink, first viewport.
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

/* Toolbox can animate in; retry Practice slot */
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
  } else {
    await page.waitForTimeout(800)
  }
}
if (!entered) {
  /* Fallback: deep-link practice if toolbox stalls */
  await page.goto(`${BASE}/journey?practice=1`, { waitUntil: 'networkidle' })
}

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
  const openMenu = await menu.evaluate((el) => el.open)
  if (!openMenu) await menu.locator('summary').first().click()
  await page.waitForTimeout(200)
  const sel = page.locator('.iphone-scroll .train-station-menu[open] select').first()
  const options = await sel.locator('option').allTextContents()
  const hit = options.find((t) => /Language Organize/i.test(t))
  if (!hit) {
    console.error('FAIL: Language Organize not in jump options', options.slice(0, 12))
    process.exit(1)
  }
  await sel.selectOption({ label: hit })
  await page.waitForTimeout(900)
  await page.locator('.iphone-scroll').evaluate((el) => {
    el.scrollTop = 0
  })
  await page.waitForTimeout(400)
}

const org = await page.evaluate(() => {
  const scroll = document.querySelector('.iphone-scroll')
  const viewH = scroll?.clientHeight || 0
  const viewTop = scroll?.getBoundingClientRect().top || 0
  const boards = [...document.querySelectorAll('.iphone-scroll .vocab-organize-board')]
  const widths = boards.map((el) => Math.round(el.getBoundingClientRect().width))
  const poolLabel = document.querySelector('.iphone-scroll .vocab-organize-pool-label')
  const poolPiece = document.querySelector('.iphone-scroll .vocab-organize-piece')
  const dropSlot = document.querySelector('.iphone-scroll .vocab-organize-slot.is-image')
  const why = document.querySelector('.iphone-scroll .train-why')
  const teach = document.querySelector('.iphone-scroll .train-teach')
  const labelStyle = poolLabel ? getComputedStyle(poolLabel) : null
  const rgb = labelStyle?.color.match(/\d+/g)?.map(Number)
  const lum = rgb ? (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 : null
  const pieceBox = poolPiece?.getBoundingClientRect()
  const dropBox = dropSlot?.getBoundingClientRect()
  const inView = (box) =>
    box && box.bottom > viewTop + 8 && box.top < viewTop + viewH * 0.95 && box.height > 20
  const whyVisible = why && getComputedStyle(why).display !== 'none' && why.getBoundingClientRect().height > 20
  const teachVisible =
    teach && getComputedStyle(teach).display !== 'none' && teach.getBoundingClientRect().height > 20
  return {
    boardCount: boards.length,
    widths,
    minWidth: widths.length ? Math.min(...widths) : 0,
    focusMode: Boolean(document.querySelector('.iphone-scroll .vocab-organize.is-phone-focus')),
    poolLum: lum,
    poolLabelText: (poolLabel?.textContent || '').trim().slice(0, 80),
    poolVisible: Boolean(inView(pieceBox)),
    dropVisible: Boolean(inView(dropBox)),
    whyVisible: Boolean(whyVisible),
    teachVisible: Boolean(teachVisible),
    pieceTop: pieceBox ? Math.round(pieceBox.top - viewTop) : null,
    dropTop: dropBox ? Math.round(dropBox.top - viewTop) : null,
    viewH: Math.round(viewH),
  }
})

const shotPath = path.join(OUT, 'walkthrough-organize-phone.png')
await page.locator('.iphone-frame, .iphone-scroll').first().screenshot({ path: shotPath }).catch(() =>
  page.screenshot({ path: shotPath, fullPage: false }),
)

console.log(JSON.stringify(org, null, 2))
console.log('SHOT', shotPath)

const fails = []
if (!org.focusMode) fails.push('missing focus mode')
if (org.boardCount !== 1) fails.push(`boardCount=${org.boardCount}`)
if (org.minWidth > 0 && org.minWidth < 220) fails.push(`narrow board ${org.minWidth}`)
if (org.poolLum != null && org.poolLum > 0.55) fails.push(`light pool ink ${org.poolLum}`)
if (!org.poolVisible) fails.push('pictures not in first viewport')
if (!org.dropVisible) fails.push('Drop slot not in first viewport')
if (org.whyVisible || org.teachVisible) fails.push('coaching chrome visible')

if (fails.length) {
  console.error('FAIL', fails)
  process.exit(1)
}
console.log('PASS Language Organize phone layout')
await browser.close()
