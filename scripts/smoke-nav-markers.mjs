/**
 * Smoke: once-then-quiet nav markers across Mode / Toolbox / Hub / Language / VV.
 * Clears pa-nav-cues-seen-v1, asserts arrows+glow appear, then quiet after use.
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.PA_BASE || 'http://127.0.0.1:4190/Purpose-Academy-Application'
const OUT = process.env.PA_ARTIFACTS || '/opt/cursor/artifacts'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(20000)
let failed = 0

function fail(msg) {
  console.error('FAIL:', msg)
  failed += 1
}

async function seed({
  step = 3,
  shell = 'course',
  practice = false,
  clearNav = true,
  skipExplainers = true,
  forceLesson = true,
  phonePhase = 'toolbox',
} = {}) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ step, shell, practice, clearNav, skipExplainers, forceLesson, phonePhase }) => {
      localStorage.clear()
      sessionStorage.clear()
      if (shell) {
        localStorage.setItem('pa-shell-mode-v2', shell)
        if (shell === 'phone') localStorage.setItem('pa-phone-phase-v1', phonePhase)
        if (shell === 'course') localStorage.setItem('pa-desktop-phase-v1', 'ready')
      }
      sessionStorage.setItem('pa-crossed-threshold-v44', '1')
      if (practice) {
        localStorage.setItem('pa-practice-mode-v1', '1')
        localStorage.setItem('pa-practice-name-v1', 'NavSmoke')
        localStorage.setItem('pa-student-journey-step-v1', String(step))
        if (forceLesson) localStorage.setItem('pa-practice-force-lesson-v1', '1')
      }
      if (clearNav) {
        localStorage.setItem('pa-nav-cues-seen-v1', '{}')
        sessionStorage.setItem('pa-nav-cues-seen-v1', '{}')
      }
      localStorage.setItem('pa-station-coach-seen-v1', '{}')
      if (skipExplainers) {
        const ids = [
          'your-language',
          'workplace-words',
          'language-organize',
          'eye-spy',
          'sentence-structure',
          'word-action',
          'video-match',
          'copycat',
          'workplace-instructions',
          'computer-skills',
          'site-language',
          'safety',
          'tools',
          'systems',
          'equipment-video',
        ]
        const map = Object.fromEntries(ids.map((id) => [id, true]))
        localStorage.setItem('pa-station-explainers-seen-v1', JSON.stringify(map))
      }
    },
    { step, shell, practice, clearNav, skipExplainers, forceLesson, phonePhase },
  )
}

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
}

/* 1) ModeChooser doors — amber arrows on night */
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => {
  localStorage.clear()
  sessionStorage.clear()
})
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.mode-chooser', { timeout: 10000 })
const modeArrows = await page.locator('.mode-chooser .nav-arrow').count()
const modeGlow = await page.locator('.mode-chooser .nav-glow-cta').count()
const modeArrowColor = await page.locator('.mode-chooser .nav-arrow').first().evaluate((el) => getComputedStyle(el).color)
await shot('nav-mode-chooser')
console.log(JSON.stringify({ step: 'mode-chooser', modeArrows, modeGlow, modeArrowColor }))
if (modeArrows < 2) fail(`ModeChooser expected 2 arrows, got ${modeArrows}`)
if (modeGlow < 2) fail(`ModeChooser expected 2 glows, got ${modeGlow}`)
/* Amber-ish, not dark navy */
if (!/245,\s*197,\s*66|232,\s*163,\s*23|255,\s*224/.test(modeArrowColor)) {
  fail(`ModeChooser arrow should be amber on night, got ${modeArrowColor}`)
}

/* 2) Desktop toolbox Practice finger + glow */
await seed({ shell: 'course', practice: false })
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(900)
const practiceGlow = await page.locator('.toolbox-slot.is-practice.nav-glow-cta').count()
const practicePointVis = await page.locator('.practice-point').first().isVisible().catch(() => false)
await shot('nav-toolbox-practice')
console.log(JSON.stringify({ step: 'toolbox', practiceGlow, practicePointVis }))
if (practiceGlow < 1) fail('Practice tray should have nav-glow-cta when cue active')
if (!practicePointVis) fail('Practice tray practice-point should show while cue active')

/* Quiet after open */
await page.locator('.toolbox-slot.is-practice').click()
await page.waitForTimeout(500)
await page.evaluate(() => {
  /* Stay on toolbox: clear gate if opened, keep seen map */
  document.querySelector('.practice-gate')?.remove()
})
await page.waitForTimeout(200)
const afterOpen = await page.evaluate(() => ({
  seen: localStorage.getItem('pa-nav-cues-seen-v1'),
  glow: document.querySelectorAll('.toolbox-slot.is-practice.nav-glow-cta').length,
  point: document.querySelectorAll('.practice-point').length,
}))
console.log(JSON.stringify({ step: 'toolbox-after-open', ...afterOpen }))
if (afterOpen.glow !== 0) fail('Practice glow should quiet after tray open')
if (afterOpen.point !== 0) fail('Practice finger should quiet after tray open')

/* 3) Start over restores tray cue (EnterBox listens) */
await page.evaluate(() => {
  localStorage.removeItem('pa-nav-cues-seen-v1')
  sessionStorage.removeItem('pa-nav-cues-seen-v1')
  window.dispatchEvent(new CustomEvent('pa-nav-cues-changed'))
  window.dispatchEvent(new Event('pa-practice-restarted'))
})
await page.waitForTimeout(400)
const restored = await page.evaluate(() => ({
  glow: document.querySelectorAll('.toolbox-slot.is-practice.nav-glow-cta').length,
  point: document.querySelectorAll('.practice-point').length,
}))
console.log(JSON.stringify({ step: 'toolbox-after-reset', ...restored }))
if (restored.glow < 1 || restored.point < 1) fail('Start over should restore Practice tray markers')

/* 4) Hub continue */
await seed({ shell: 'course', practice: true, step: 3, forceLesson: false })
await page.goto(`${BASE}/journey`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
const hubArrow = await page.locator('.ph-resume-cue .nav-arrow').isVisible().catch(() => false)
await shot('nav-hub-continue')
console.log(JSON.stringify({ step: 'hub', hubArrow }))
if (!hubArrow) fail('Hub Continue arrow missing')

/* 5) Language pick */
await seed({ shell: 'course', practice: true, step: 3, forceLesson: true })
await page.goto(`${BASE}/journey`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.train-lang-pick', { timeout: 15000 })
const langArrow = await page.locator('.train-lang-cue .nav-arrow').isVisible().catch(() => false)
const langLabel = ((await page.locator('.train-lang-cue .nav-arrow-label').textContent()) || '').trim()
await shot('nav-lang-pick')
console.log(JSON.stringify({ step: 'lang-pick', langArrow, langLabel }))
if (!langArrow) fail('Languages here arrow missing')
if (!/Languages here/i.test(langLabel)) fail(`Expected Languages here, got ${langLabel}`)

await page.locator('.train-lang').filter({ hasText: 'Español' }).click()
await page.waitForTimeout(400)
const langAfter = await page.locator('.train-lang-cue .nav-arrow').isVisible().catch(() => false)
await shot('nav-lang-pick-quiet')
if (langAfter) fail('Language arrow should quiet after chip press')

/* 6) VV vocab lang */
await seed({ shell: 'course', practice: true, step: 6, forceLesson: true })
await page.goto(`${BASE}/journey`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.vocab-sheet-langs, [data-coach="vv-lang"]', { timeout: 15000 })
const vvArrow = await page.locator('.vocab-lang-cue .nav-arrow').isVisible().catch(() => false)
const vvLabel = ((await page.locator('.vocab-lang-cue .nav-arrow-label').textContent()) || '').trim()
await shot('nav-vocab-lang')
console.log(JSON.stringify({ step: 'vocab-lang', vvArrow, vvLabel }))
if (!vvArrow) fail('Your languages arrow missing on VV')
if (!/Your languages/i.test(vvLabel)) fail(`Expected Your languages, got ${vvLabel}`)

/* 7) Phone Practice tray finger restored */
await seed({ shell: 'phone', practice: false, phonePhase: 'toolbox' })
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const phone = await page.evaluate(() => {
  const point = document.querySelector('.practice-point')
  return {
    glow: document.querySelectorAll('.toolbox-slot.is-practice.nav-glow-cta').length,
    point: !!point,
    pointDisplay: point ? getComputedStyle(point).display : null,
    pointVis: point ? getComputedStyle(point).display !== 'none' && getComputedStyle(point).visibility !== 'hidden' : false,
  }
})
await shot('nav-toolbox-phone')
console.log(JSON.stringify({ step: 'phone-toolbox', ...phone }))
if (phone.glow < 1) fail('Phone Practice glow missing')
if (!phone.pointVis) fail('Phone Practice finger should be visible (not display:none)')

/* 8) Phone language */
await seed({ shell: 'phone', practice: true, step: 3, forceLesson: true, phonePhase: 'app' })
await page.goto(`${BASE}/journey`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const phoneLang = await page.locator('.train-lang-cue .nav-arrow').isVisible().catch(() => false)
await shot('nav-lang-pick-phone')
console.log(JSON.stringify({ step: 'lang-phone', phoneLang }))
if (!phoneLang) fail('Phone language arrow missing')

await browser.close()
console.log(failed ? `DONE with ${failed} failure(s)` : 'DONE ok')
process.exitCode = failed ? 1 : 0
