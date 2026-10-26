/**
 * Learner playthrough — phone Practice path as a first-time user.
 * Walks mode → home → splash (wait for hammer) → toolbox → Practice
 * → hub → language → work style → key stations. Reports failures.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = process.env.PLAY_URL || 'http://127.0.0.1:4180/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts'
fs.mkdirSync(OUT, { recursive: true })

const issues = []
function note(msg, extra = {}) {
  console.log('ISSUE:', msg, extra)
  issues.push({ msg, ...extra })
}
function ok(msg) {
  console.log('OK:', msg)
}

async function shot(page, name) {
  const p = path.join(OUT, `play-${name}.png`)
  await page.screenshot({ path: p, fullPage: false })
  return p
}

async function phoneText(page) {
  return page.locator('.iphone-scroll').innerText().catch(() => '')
}

async function contrastSample(page, sel) {
  return page.evaluate((selector) => {
    const el = document.querySelector(selector)
    if (!el) return null
    const s = getComputedStyle(el)
    const rgb = s.color.match(/\d+/g)?.map(Number) || [0, 0, 0]
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
    const fsPx = parseFloat(s.fontSize) || 0
    return {
      sel: selector,
      color: s.color,
      bg: s.backgroundColor,
      fontSize: s.fontSize,
      lum: Number(lum.toFixed(3)),
      text: (el.textContent || '').trim().slice(0, 48),
      tooLight: lum > 0.72,
      tooSmall: fsPx > 0 && fsPx < 12.5,
    }
  }, sel)
}

async function scanLightInk(page, where) {
  const hits = await page.evaluate(() => {
    const root = document.querySelector('.iphone-scroll') || document.body
    const out = []
    const walk = root.querySelectorAll('h1,h2,h3,strong,p,span,label,em,button,li,figcaption')
    for (const el of walk) {
      if (!el.offsetParent && el.tagName !== 'BODY') continue
      const t = (el.textContent || '').trim()
      if (!t || t.length > 80) continue
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || s.opacity === '0') continue
      const rgb = s.color.match(/\d+/g)?.map(Number)
      if (!rgb || rgb.length < 3) continue
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
      const fsPx = parseFloat(s.fontSize) || 0
      /* Effective background: walk ancestors (badges sit on dark fills) */
      let bg = s.backgroundColor
      let n = el.parentElement
      while (
        n &&
        (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')
      ) {
        bg = getComputedStyle(n).backgroundColor
        n = n.parentElement
      }
      const darkBg = (() => {
        const m = bg && bg.match(/\d+/g)?.map(Number)
        if (!m || m.length < 3) return false
        const bl = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255
        return bl < 0.45
      })()
      const cls = (el.className || '').toString()
      /* Intentional light-on-dark chips */
      if (/badge|rail-btn|vocab-sheet-num|btn-primary|mode-door/i.test(cls) && darkBg) continue
      if (lum > 0.72 && !darkBg) {
        out.push({
          tag: el.tagName,
          cls: cls.slice(0, 60),
          text: t.slice(0, 40),
          color: s.color,
          bg,
          fontSize: s.fontSize,
          lum: Number(lum.toFixed(3)),
        })
      } else if (fsPx > 0 && fsPx < 11.5 && /kicker|label|status|legend|metric|counter|pill/i.test(cls)) {
        out.push({
          tag: el.tagName,
          cls: cls.slice(0, 60),
          text: t.slice(0, 40),
          color: s.color,
          bg,
          fontSize: s.fontSize,
          lum: Number(lum.toFixed(3)),
          reason: 'tiny-label',
        })
      }
      if (out.length >= 12) break
    }
    return out
  })
  for (const h of hits) {
    note(`Light/tiny ink @ ${where}`, h)
  }
  return hits
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1400, height: 1000 },
  reducedMotion: 'no-preference',
})

await page.addInitScript(() => {
  sessionStorage.clear()
  localStorage.clear()
})

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await shot(page, '01-chooser')

const phoneBtn = page.locator('button.mode-door-phone').first()
if (!(await phoneBtn.count())) note('Mode chooser Phone door missing')
else {
  await phoneBtn.click()
  await page.waitForTimeout(700)
  ok('Entered Phone mode')
}
await shot(page, '02-phone-home')

const homeApp = page.locator('.phone-home-app').first()
if (await homeApp.count()) {
  await homeApp.click()
  ok('Opened PA icon → splash')
} else note('Phone home icon missing')

/* Hammer only mounts at threshold-stage-ready (~5–7s). Wait for it. */
try {
  await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
  await page.waitForTimeout(350)
  await page.locator('.threshold-hammer').click({ force: true })
  await page.waitForTimeout(2600)
  ok('Splash strike → shatter → toolbox')
} catch {
  note('Splash hammer never became visible')
}
await shot(page, '03-toolbox')

const practiceTray = page.locator('.toolbox-slot.is-practice, button.toolbox-slot').filter({ hasText: /Practice/i }).first()
if (!(await practiceTray.count())) note('Practice tray missing on toolbox')
else {
  await practiceTray.click()
  await page.waitForTimeout(700)
  ok('Opened Practice name gate')
}
await shot(page, '04-practice-gate')

const nameInput = page.locator('#practice-gate-name')
if (await nameInput.count()) {
  const styles = await nameInput.evaluate((el) => {
    const s = getComputedStyle(el)
    return { color: s.color, bg: s.backgroundColor, value: el.value }
  })
  const bgLum = (() => {
    const rgb = styles.bg.match(/\d+/g)?.map(Number)
    if (!rgb) return 1
    return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
  })()
  if (bgLum < 0.35) note('Name field still dark background', styles)
  const levi = page.locator('.practice-name-grid button').filter({ hasText: /^Levi$/i }).first()
  if (await levi.count()) await levi.click()
  await page.waitForTimeout(200)
  /* Re-check typed value contrast */
  const after = await nameInput.evaluate((el) => {
    const s = getComputedStyle(el)
    return { color: s.color, bg: s.backgroundColor, value: el.value }
  })
  console.log('name field', after)
  await page.locator('button').filter({ hasText: /Enter Practice/i }).first().click()
  await page.waitForTimeout(2800)
  ok('Entered Practice as Levi')
} else note('Practice name gate input missing')

await shot(page, '05-hub')
let body = await phoneText(page)
if (!/training path|Open today|Your Language|Construction|Path home|today/i.test(body)) {
  note('Hub copy unexpected after enter', { body: body.slice(0, 240) })
}
await scanLightInk(page, 'hub')

const openToday = page
  .locator('.iphone-scroll button, .iphone-scroll a')
  .filter({ hasText: /Open today|Your Language|Continue|Resume/i })
  .first()
if (await openToday.count()) {
  await openToday.click()
  await page.waitForTimeout(1400)
  ok('Opened today station')
} else note('Could not open today station', { body: body.slice(0, 200) })
await shot(page, '06-language')
await scanLightInk(page, 'language')

const title = await contrastSample(page, '.career-assess-title')
const langStrong = await contrastSample(page, '.train-lang.is-selected strong, .train-lang strong')
const lesson = await contrastSample(page, '.lp-lesson.is-current strong')
const kicker = await contrastSample(page, '.ph-kicker, .train-kicker, .career-assess-kicker, .lp-kicker')
console.log('samples', { title, langStrong, lesson, kicker })
if (title?.tooLight) note('Language title still too light', title)
if (langStrong?.tooLight) note('Selected lang strong still light', langStrong)
if (lesson?.tooLight) note('Current lesson still light', lesson)
if (kicker?.tooSmall) note('Kicker still too small', kicker)

const en = page.locator('.train-lang').filter({ hasText: /English/i }).first()
if (await en.count()) {
  await en.click()
  await page.waitForTimeout(250)
  ok('Selected English')
}
const next = page.locator('.iphone-scroll button').filter({ hasText: /Next|Continue|Work Style|Save/i }).first()
if (await next.count()) {
  await next.click()
  await page.waitForTimeout(1200)
  ok('Advanced toward Work Style')
} else {
  const jump = page.locator('.practice-section-skip select').first()
  if (await jump.count()) {
    await jump.selectOption({ label: /4\. Work Style/i }).catch(async () => {
      await jump.selectOption('4')
    })
    await page.waitForTimeout(1000)
    ok('Jumped to Work Style via select')
  } else note('No next / jump control on language station')
}
await shot(page, '07-work-style')
await scanLightInk(page, 'work-style')

body = await phoneText(page)
if (/undefined is not|Cannot read|NaN|Error:/i.test(body)) {
  note('Suspicious error text on work style', { body: body.slice(0, 180) })
}

const stations = [
  { n: '6', name: 'visual-vocab', re: /Visual Vocabulary|Vocab|word|photo/i, interact: 'vocab' },
  { n: '8', name: 'eye-spy', re: /Eye Spy|Find|tap|spy/i, interact: 'eyespy' },
  { n: '9', name: 'sentence', re: /Sentence|blank|word|fill/i, interact: null },
  { n: '12', name: 'computer', re: /Computer|folder|click|desktop/i, interact: null },
]
for (const s of stations) {
  const jump = page.locator('.practice-section-skip select').first()
  if (!(await jump.count())) {
    note(`Jump select missing before ${s.name}`)
    break
  }
  await jump.selectOption(s.n).catch(() => jump.selectOption({ value: s.n }))
  await page.waitForTimeout(1100)
  body = await phoneText(page)
  await shot(page, `08-${s.name}`)
  if (!s.re.test(body) && body.length < 40) note(`Station ${s.name} looks empty`, { body: body.slice(0, 120) })
  else ok(`Visited station ${s.name}`)
  await scanLightInk(page, s.name)

  if (s.interact === 'vocab') {
    const known = page.locator('.iphone-scroll button').filter({ hasText: /I know this|Know this|Next word|Heard/i }).first()
    if (await known.count()) {
      await known.click()
      await page.waitForTimeout(600)
      ok('Tapped vocab known/next')
    }
  }
  if (s.interact === 'eyespy') {
    /* Prefer a word chip; avoid starting the pairing quiz mid-scan */
    const word = page.locator('.eye-spy-word').first()
    if (await word.count()) {
      await word.click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
      /* If a pairing quiz stole the screen, back out so jump select remains */
      const back = page.locator('.iphone-scroll button, .phone-chrome button').filter({ hasText: /^Back$/i }).first()
      if (await back.count()) {
        await back.click()
        await page.waitForTimeout(500)
      }
    }
  }

  const t = await contrastSample(page, '.train-title, .career-assess-title, h1, h2')
  if (t?.tooLight && !/11, 47|4, 21|15, 36/.test(t.bg)) {
    note(`Possible light title on ${s.name}`, t)
  }
}

const pathHome = page.locator('.iphone-scroll button, .iphone-scroll a').filter({ hasText: /Path home/i }).first()
if (await pathHome.count()) {
  await pathHome.click()
  await page.waitForTimeout(900)
  ok('Returned Path home')
  await scanLightInk(page, 'path-home')
}
await shot(page, '09-path-home')

/* Desktop quick smoke */
await page.evaluate(() => {
  sessionStorage.clear()
  localStorage.clear()
})
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const desk = page.locator('button.mode-door-desktop').first()
if (await desk.count()) {
  await desk.click()
  await page.waitForTimeout(500)
  try {
    await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
    await page.locator('.threshold-hammer').click({ force: true })
    await page.waitForTimeout(2600)
    ok('Desktop splash → toolbox')
  } catch {
    note('Desktop splash hammer missing')
  }
  await shot(page, '10-desktop-toolbox')
  const trays = await page.locator('.toolbox-slot').count()
  if (trays < 4) note('Desktop toolbox missing trays', { trays })
  else ok(`Desktop toolbox trays: ${trays}`)
}

await browser.close()

const report = { issues, issueCount: issues.length, at: new Date().toISOString() }
fs.writeFileSync(path.join(OUT, 'playthrough-report.json'), JSON.stringify(report, null, 2))
console.log('\n=== PLAYTHROUGH SUMMARY ===')
console.log(JSON.stringify(report, null, 2))
process.exit(issues.length ? 1 : 0)
