/**
 * Smoke: ModeChooser first → Desktop door → threshold opening (not toolbox).
 * Also: legacy course restore without desktop phase → ModeChooser (not auto-splash).
 * Phone: ModeChooser → Phone → home → app tap → embedded splash (no regression).
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.PA_BASE || 'http://127.0.0.1:5173/Purpose-Academy-Application'
const OUT = process.env.PA_ARTIFACTS || '/tmp/cursor/artifacts'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(25000)
let failed = 0

function fail(msg) {
  console.error('FAIL:', msg)
  failed += 1
}

async function clearAll() {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

async function shot(name) {
  const path = `${OUT}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  return path
}

/* 1) Fresh visit → ModeChooser (two doors), not Desktop splash */
await clearAll()
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.mode-chooser', { timeout: 10000 })
const doors = await page.locator('.mode-door').count()
const splashOnFresh = await page.locator('.threshold').count()
await shot('desktop-open-01-mode-chooser')
console.log(JSON.stringify({ step: 'fresh', doors, splashOnFresh }))
if (doors < 2) fail(`Expected 2 mode doors, got ${doors}`)
if (splashOnFresh > 0) fail('Fresh visit must not show Desktop threshold before mode pick')

/* 2) Legacy restore: course in storage, no desktop phase, no crossed → ModeChooser */
await page.evaluate(() => {
  localStorage.clear()
  sessionStorage.clear()
  localStorage.setItem('pa-shell-mode-v2', 'course')
})
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(500)
const afterLegacy = await page.evaluate(() => ({
  chooser: !!document.querySelector('.mode-chooser'),
  splash: !!document.querySelector('.threshold:not(.is-embedded)'),
  toolbox: !!document.querySelector('.toolbox'),
  mode: localStorage.getItem('pa-shell-mode-v2'),
  desktopPhase: localStorage.getItem('pa-desktop-phase-v1'),
}))
await shot('desktop-open-02-legacy-restore-chooser')
console.log(JSON.stringify({ step: 'legacy-restore', ...afterLegacy }))
if (!afterLegacy.chooser) fail('Legacy course restore without phase should show ModeChooser')
if (afterLegacy.splash) fail('Legacy restore must not auto-play Desktop opening')
if (afterLegacy.toolbox) fail('Legacy restore must not dump into toolbox')

/* 3) Desktop door → opening animation (threshold), not static toolbox */
await clearAll()
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.mode-door-desktop')
await page.locator('.mode-door-desktop').click()
await page.waitForSelector('.threshold:not(.is-embedded)', { timeout: 10000 })
await page.waitForTimeout(1400)
const afterDesktop = await page.evaluate(() => ({
  splash: !!document.querySelector('.threshold:not(.is-embedded)'),
  stage: document.querySelector('.threshold')?.className || '',
  toolbox: !!document.querySelector('.toolbox'),
  chooser: !!document.querySelector('.mode-chooser'),
  mode: localStorage.getItem('pa-shell-mode-v2'),
  desktopPhase: localStorage.getItem('pa-desktop-phase-v1'),
}))
await shot('desktop-open-03-after-desktop-door')
console.log(JSON.stringify({ step: 'after-desktop-door', ...afterDesktop }))
if (!afterDesktop.splash) fail('Desktop door should play threshold opening')
if (afterDesktop.toolbox) fail('Desktop door must not dump straight into toolbox')
if (afterDesktop.chooser) fail('ModeChooser should leave after Desktop press')
if (afterDesktop.desktopPhase !== 'opening') fail(`Expected desktop phase opening, got ${afterDesktop.desktopPhase}`)
if (!/threshold-stage-(breath|closed|opening|named|pathways|ready)/.test(afterDesktop.stage)) {
  fail(`Expected animated threshold stage, got ${afterDesktop.stage}`)
}

/* 4) Exit to modes from splash → ModeChooser again; Desktop → opening again */
await page.waitForSelector('.threshold-modes-escape', { timeout: 15000 })
await page.locator('.threshold-modes-escape').click()
await page.waitForSelector('.mode-chooser', { timeout: 10000 })
await shot('desktop-open-04-exit-to-modes')
await page.locator('.mode-door-desktop').click()
await page.waitForSelector('.threshold:not(.is-embedded)', { timeout: 10000 })
const replay = await page.evaluate(() => ({
  splash: !!document.querySelector('.threshold:not(.is-embedded)'),
  toolbox: !!document.querySelector('.toolbox'),
  phase: localStorage.getItem('pa-desktop-phase-v1'),
}))
await shot('desktop-open-05-desktop-again-opens')
console.log(JSON.stringify({ step: 'exit-then-desktop-again', ...replay }))
if (!replay.splash || replay.toolbox) fail('Exit→Modes→Desktop must replay opening, not toolbox')

/* 5) Phone path: ModeChooser → Phone → home → app → embedded splash */
await clearAll()
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.mode-door-phone')
await page.locator('.mode-door-phone').click()
await page.waitForSelector('.phone-home', { timeout: 10000 })
const phoneHomeSplash = await page.locator('.threshold.is-embedded').count()
await shot('desktop-open-06-phone-home')
console.log(JSON.stringify({ step: 'phone-home', phoneHomeSplash }))
if (phoneHomeSplash > 0) fail('Phone must not play opening before app icon press')

await page.locator('.phone-home-app').click()
await page.waitForSelector('.threshold.is-embedded', { timeout: 10000 })
await page.waitForTimeout(800)
const phoneSplash = await page.evaluate(() => ({
  embedded: !!document.querySelector('.threshold.is-embedded'),
  desktopSplash: !!document.querySelector('.threshold:not(.is-embedded)'),
  phase: localStorage.getItem('pa-phone-phase-v1'),
}))
await shot('desktop-open-07-phone-app-splash')
console.log(JSON.stringify({ step: 'phone-app-splash', ...phoneSplash }))
if (!phoneSplash.embedded) fail('Phone app press should show embedded opening')
if (phoneSplash.desktopSplash) fail('Phone must not show full-viewport Desktop splash')
if (phoneSplash.phase !== 'splash') fail(`Expected phone phase splash, got ${phoneSplash.phase}`)

await browser.close()
if (failed) {
  console.error(`FAILED ${failed} check(s)`)
  process.exit(1)
}
console.log('OK desktop-open-after-mode')
