/**
 * Community Support pack smoke — Desktop + Phone.
 * Verifies VV + Sentence Practice content, Eye Spy labels, alert.ok contrast on phone.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = process.env.PLAY_URL || 'http://127.0.0.1:5173/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts'
fs.mkdirSync(OUT, { recursive: true })

const issues = []
const ok = (m) => console.log('OK:', m)
const note = (m, extra = {}) => {
  console.log('ISSUE:', m, extra)
  issues.push({ msg: m, ...extra })
}

async function shot(page, name) {
  const p = path.join(OUT, `com-smoke-${name}.png`)
  await page.screenshot({ path: p, fullPage: false })
  return p
}

async function enterPractice(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const phoneBtn = page.locator('button.mode-door-phone').first()
  if (await phoneBtn.count()) {
    await phoneBtn.click()
    await page.waitForTimeout(600)
  }
  const homeApp = page.locator('.phone-home-app').first()
  if (await homeApp.count()) {
    await homeApp.click()
  }
  try {
    await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
    await page.waitForTimeout(300)
    await page.locator('.threshold-hammer').click({ force: true })
    await page.waitForTimeout(2400)
  } catch {
    note('Splash hammer never visible')
  }
  const practice = page
    .locator('.toolbox-slot.is-practice, button.toolbox-slot')
    .filter({ hasText: /Practice/i })
    .first()
  if (!(await practice.count())) {
    note('Practice tray missing')
    return false
  }
  await practice.click()
  await page.waitForTimeout(500)
  const levi = page.locator('.practice-name-grid button').filter({ hasText: /^Levi$/i }).first()
  if (await levi.count()) await levi.click()
  await page.locator('button').filter({ hasText: /Enter Practice/i }).first().click()
  await page.waitForTimeout(2200)
  return true
}

async function switchCommunity(page) {
  const btn = page
    .locator('.iphone-scroll button, .practice-hub button, button')
    .filter({ hasText: /Community/i })
    .first()
  if (await btn.count()) {
    await btn.click()
    await page.waitForTimeout(800)
    ok('Switched pathway toward Community')
    return true
  }
  /* Fallback: set session pathway via page evaluate */
  await page.evaluate(() => {
    sessionStorage.setItem('pa-active-pathway-v1', 'community')
    window.dispatchEvent(new CustomEvent('pa-pathway-changed', { detail: { pathway: 'community' } }))
  })
  await page.waitForTimeout(600)
  ok('Forced community pathway via storage')
  return true
}

async function jumpSection(page, labelRe) {
  const jump = page.locator('.practice-section-skip select').first()
  if (!(await jump.count())) {
    note('Section skip select missing')
    return false
  }
  const options = await jump.locator('option').allTextContents()
  const hit = options.find((t) => labelRe.test(t))
  if (!hit) {
    note('Skip option not found', { want: String(labelRe), options: options.slice(0, 20) })
    return false
  }
  await jump.selectOption({ label: hit })
  await page.waitForTimeout(1200)
  ok(`Jumped to ${hit}`)
  return true
}

async function alertContrast(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.alert.ok')
    if (!el) return null
    const s = getComputedStyle(el)
    const rgb = s.color.match(/\d+/g)?.map(Number) || [0, 0, 0]
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
    return {
      color: s.color,
      bg: s.backgroundColor,
      text: (el.textContent || '').trim().slice(0, 80),
      lum: Number(lum.toFixed(3)),
      tooLight: lum > 0.55,
    }
  })
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
await page.addInitScript(() => {
  sessionStorage.clear()
  localStorage.clear()
})

const entered = await enterPractice(page)
await shot(page, '01-hub')
if (!entered) {
  console.log(JSON.stringify({ issues }, null, 2))
  process.exit(1)
}

await switchCommunity(page)
await shot(page, '02-community-hub')
const hubText = await page.locator('.iphone-scroll').innerText().catch(() => '')
if (!/Community/i.test(hubText)) note('Hub missing Community label', { slice: hubText.slice(0, 200) })
else ok('Hub shows Community')

/* Open path / continue into sequence so skip nav mounts */
const open = page
  .locator('.iphone-scroll button, .iphone-scroll a')
  .filter({ hasText: /Open today|Continue|Resume|Path home|Start/i })
  .first()
if (await open.count()) {
  await open.click()
  await page.waitForTimeout(1200)
}

/* Ensure community again after enter */
await page.evaluate(() => {
  sessionStorage.setItem('pa-active-pathway-v1', 'community')
  window.dispatchEvent(new CustomEvent('pa-pathway-changed', { detail: { pathway: 'community' } }))
})
await page.waitForTimeout(400)

async function scrollPhone(page, dy = 900) {
  await page.locator('.iphone-scroll').evaluate((el, y) => {
    el.scrollTop = y
  }, dy)
  await page.waitForTimeout(350)
}

async function revealInPhone(page, sel) {
  const loc = page.locator(`.iphone-scroll ${sel}`).first()
  if (!(await loc.count())) return false
  await loc.evaluate((el) => {
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
  })
  await page.waitForTimeout(400)
  return true
}

const vocabOk = await jumpSection(page, /Visual Vocabulary/)
await revealInPhone(page, '.train-title, .vocab-sheet, .train-picture')
await shot(page, '03-vocab')
let body = await page.locator('.iphone-scroll').innerText().catch(() => '')
if (/Community Support Visual Vocabulary \(499\)|Daily Conversation \(200\)/i.test(body)) {
  ok('Vocab station announces Community 499 pack')
} else note('Vocab station missing Community 499 copy', { slice: body.slice(0, 280) })
if (/Hello|Good morning|Volunteer|picture|language|Connect/i.test(body)) ok('Vocab drill surface mounted')
else note('Vocab drill surface empty', { slice: body.slice(0, 280) })

const eyeOk = await jumpSection(page, /English Eye Spy/)
await revealInPhone(page, '.eye-spy-stage, .train-title')
await scrollPhone(page, 520)
await shot(page, '06-eyespy')
body = await page.locator('.iphone-scroll').innerText().catch(() => '')
if (/Support team|Volunteer|Social worker|Identify every|Find|Clear every board/i.test(body)) {
  ok('Eye Spy Community board copy present')
} else note('Eye Spy unexpected', { slice: body.slice(0, 280) })

const sentOk = await jumpSection(page, /Sentence Structure/)
await revealInPhone(page, '.sentence-cloze-card, .sentence-cloze-choices')
await shot(page, '04-sentence')
body = await page.locator('.iphone-scroll').innerText().catch(() => '')
if (/Community Sentence Practice|helps the community without pay|______|All 499/i.test(body)) {
  ok('Sentence cloze Community prompt visible')
} else note('Sentence cloze unexpected', { slice: body.slice(0, 280) })

const volunteerChoice = page.locator('.sentence-cloze-chip').filter({ hasText: /Volunteer/i }).first()
if (await volunteerChoice.count()) {
  await volunteerChoice.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(300)
  await volunteerChoice.click({ force: true })
  /* Feedback shows ~280ms; auto-advance at ~900ms — sample before advance */
  await page.waitForTimeout(450)
  const alert = await alertContrast(page)
  await page.locator('.alert.ok').first().evaluate((el) => el.scrollIntoView({ block: 'center' })).catch(() => {})
  await shot(page, '05-sentence-ok')
  console.log('alert.ok', alert)
  if (!alert) note('alert.ok missing after Volunteer pick')
  else if (alert.tooLight) note('alert.ok still too light on phone', alert)
  else ok('alert.ok contrast OK on phone paper')
} else {
  note('Volunteer choice chip missing on sentence station')
}

await browser.close()
console.log('\nSUMMARY', { issues: issues.length, details: issues, vocabOk, sentOk, eyeOk })
process.exit(issues.length ? 1 : 0)
