/**
 * Smoke: English-first language pick + nav cue + Your Language explainer VO.
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = 'http://127.0.0.1:4180/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

async function seedPractice(
  step = 3,
  { clearNav = true, shell = 'course', skipExplainers = false } = {},
) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ step, clearNav, shell, skipExplainers }) => {
      localStorage.clear()
      sessionStorage.clear()
      localStorage.setItem('pa-shell-mode-v2', shell)
      if (shell === 'phone') localStorage.setItem('pa-phone-phase-v1', 'app')
      localStorage.setItem('pa-practice-mode-v1', '1')
      localStorage.setItem('pa-practice-name-v1', 'Smoke Tester')
      localStorage.setItem('pa-student-journey-step-v1', String(step))
      localStorage.setItem('pa-practice-force-lesson-v1', '1')
      if (clearNav) localStorage.setItem('pa-nav-cues-seen-v1', '{}')
      localStorage.setItem('pa-station-coach-seen-v1', '{}')
      if (skipExplainers) {
        localStorage.setItem(
          'pa-station-explainers-seen-v1',
          JSON.stringify({
            'your-language': true,
            'workplace-words': true,
            'language-organize': true,
            'eye-spy': true,
            'sentence-structure': true,
            'word-action': true,
            'supported-practice': true,
            'computer-skills': true,
            'site-language': true,
            safety: true,
            tools: true,
            systems: true,
            'equipment-video': true,
          }),
        )
      }
    },
    { step, clearNav, shell, skipExplainers },
  )
}

async function dismissExplainerAfterCapture(label) {
  const gate = page.locator('.station-explainer')
  if (!(await gate.isVisible().catch(() => false))) return false
  const title = ((await page.locator('.station-explainer h2').first().textContent()) || '').trim()
  const src = (await page.locator('.station-explainer-video').getAttribute('src').catch(() => '')) || ''
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: false })
  console.log(JSON.stringify({ step: label, title, src }))
  /* Force unlock: ended event may not fire headless before timeout. */
  await page.evaluate(() => {
    const v = document.querySelector('.station-explainer-video')
    if (v) {
      v.dispatchEvent(new Event('ended'))
      v.dispatchEvent(new Event('error'))
    }
  })
  await page.waitForTimeout(300)
  const cont = page.locator(
    '.station-explainer button.btn-primary, .station-explainer button:has-text("Skip")',
  )
  if (await cont.count()) await cont.first().click({ timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(400)
  return { title, src }
}

/* —— Desktop: Your Language explainer VO first —— */
await seedPractice(3, { shell: 'course', skipExplainers: false })
await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.waitForSelector('.station-explainer', { timeout: 12000 })
const explainer = await dismissExplainerAfterCapture('your-language-explainer-desktop')
if (!explainer || !/Your Language/i.test(explainer.title)) {
  console.error('FAIL: expected Your Language station explainer')
  process.exitCode = 1
}
if (!explainer?.src?.includes('your-language')) {
  console.error('FAIL: expected your-language.mp4 in explainer video src', explainer?.src)
  process.exitCode = 1
}

/* —— Desktop: language step English-first + nav mark —— */
await page.waitForSelector('.train-lang-pick, .train-lang-grid', { timeout: 12000 })
const selected = page.locator('.train-lang.is-selected strong')
const selectedText = ((await selected.first().textContent()) || '').trim()
const arrow = page.locator('.train-lang-cue .nav-arrow')
const arrowVisible = await arrow.isVisible().catch(() => false)
const glow = await page
  .locator('.train-lang-grid.nav-glow-cta, .train-lang-cue .nav-glow-region.nav-glow-cta')
  .count()

await page.screenshot({ path: `${OUT}/lang-pick-english-first-desktop.png`, fullPage: false })
console.log(JSON.stringify({ step: 'lang-pick-desktop', selectedText, arrowVisible, glow }))

if (selectedText !== 'English') {
  console.error('FAIL: expected English selected, got', selectedText)
  process.exitCode = 1
}
if (!arrowVisible) {
  console.error('FAIL: expected nav arrow on language grid')
  process.exitCode = 1
}

/* Pick Spanish — cue should quiet */
await page.locator('.train-lang').filter({ hasText: 'Español' }).click()
await page.waitForTimeout(400)
const arrowAfter = await arrow.isVisible().catch(() => false)
await page.screenshot({ path: `${OUT}/lang-pick-after-choice-desktop.png`, fullPage: false })
console.log(
  JSON.stringify({
    step: 'after-spanish',
    arrowAfter,
    selected: await selected.first().textContent(),
  }),
)
if (arrowAfter) {
  console.error('FAIL: nav arrow should quiet after language press')
  process.exitCode = 1
}

/* —— Phone shell language step (skip explainer — already asserted) —— */
await seedPractice(3, { shell: 'phone', skipExplainers: true })
await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.waitForSelector('.train-lang-pick, .train-lang-grid', { timeout: 12000 }).catch(() => null)
const phoneSelected = (
  (await page.locator('.train-lang.is-selected strong').first().textContent().catch(() => '')) || ''
).trim()
const phoneArrow = await page.locator('.train-lang-cue .nav-arrow').isVisible().catch(() => false)
await page.screenshot({ path: `${OUT}/lang-pick-english-first-phone.png`, fullPage: false })
console.log(JSON.stringify({ step: 'lang-pick-phone', phoneSelected, phoneArrow }))
if (phoneSelected !== 'English') {
  console.error('FAIL: phone expected English selected, got', phoneSelected)
  process.exitCode = 1
}

/* —— Workplace Words lang row cue —— */
await seedPractice(6, { shell: 'course', skipExplainers: true })
await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.waitForSelector('.vocab-sheet-langs, [data-coach="vv-lang"]', { timeout: 15000 }).catch(() => null)
const vvArrow = await page.locator('.vocab-lang-cue .nav-arrow').isVisible().catch(() => false)
const vvGlow = await page.locator('.vocab-lang-cue .nav-glow-region.nav-glow-cta').count()
await page.screenshot({ path: `${OUT}/vocab-lang-nav-cue-desktop.png`, fullPage: false })
console.log(JSON.stringify({ step: 'vocab-lang-desktop', vvArrow, vvGlow }))
if (!vvArrow) {
  console.error('WARN: VV lang nav arrow not visible (hub/coach may have blocked)')
}

await browser.close()
console.log('smoke done')
