/**
 * Smoke: Practice VV first-example coach visible (desktop night shell).
 * Writes screenshots under /tmp/cursor/artifacts/
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'

const BASE = process.env.PA_BASE || 'http://127.0.0.1:5175/Purpose-Academy-Application'
const OUT = process.env.PA_ARTIFACTS || '/tmp/cursor/artifacts'
mkdirSync(OUT, { recursive: true })

const STATION_EXPLAINERS = [
  'workplace-words',
  'language-organize',
  'eye-spy',
  'sentence-structure',
  'word-action',
  'supported-practice',
  'computer-skills',
  'site-language',
  'safety',
  'tools',
  'systems',
  'equipment-video',
]

async function prep(page, { step = 6, phone = false } = {}) {
  await page.addInitScript(
    ({ step, phone, explainers }) => {
      localStorage.setItem('pa-shell-mode-v2', phone ? 'phone' : 'course')
      if (phone) localStorage.setItem('pa-phone-phase-v1', 'app')
      localStorage.setItem('pa-crossed-threshold-v44', '1')
      localStorage.setItem('pa-practice-mode-v1', '1')
      localStorage.setItem('pa-practice-name-v1', 'CoachSmoke')
      localStorage.setItem('pa-practice-force-lesson-v1', '1')
      localStorage.setItem('pa-student-journey-step-v1', String(step))
      localStorage.setItem('pa-active-pathway-v1', 'construction')
      localStorage.removeItem('pa-station-coach-seen-v1')
      const seen = Object.fromEntries(explainers.map((id) => [id, true]))
      localStorage.setItem('pa-station-explainers-seen-v1', JSON.stringify(seen))
      localStorage.setItem('pa-nav-cues-seen-v1', JSON.stringify({}))
    },
    { step, phone, explainers: STATION_EXPLAINERS },
  )
}

async function shot(page, name) {
  const path = join(OUT, name)
  await page.screenshot({ path, fullPage: false })
  console.log('wrote', path)
  return path
}

async function dismissExplainer(page) {
  const cont = page.locator('.station-explainer-continue, button:has-text("Continue to station")')
  if (await cont.first().isVisible().catch(() => false)) {
    await cont.first().click()
    await page.waitForTimeout(600)
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } })
  await prep(page, { step: 6, phone: false })
  await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1200)
  await dismissExplainer(page)

  await page.waitForSelector('.station-coach-bubble, .vocab-sheet, [data-coach="vv-lang"]', {
    timeout: 20000,
  })
  await page.waitForTimeout(500)
  await shot(page, 'station_coach_vv_desktop_night.png')

  const bubble = page.locator('.station-coach-say')
  const say = (await bubble.isVisible().catch(() => false)) ? await bubble.innerText() : '(no bubble)'
  console.log('coach say:', say)

  const skipVisible = await page.locator('.station-coach-skip').isVisible().catch(() => false)
  console.log('skip control:', skipVisible ? 'visible' : 'missing')

  /* Advance lang → type */
  const lang = page.locator('[data-coach="vv-lang"] button, [data-coach="vv-lang"] .vocab-sheet-lang-btn').first()
  if (await lang.isVisible().catch(() => false)) {
    await lang.click()
    await page.waitForTimeout(700)
    await shot(page, 'station_coach_vv_hear_step.png')
  } else {
    const row = page.locator('[data-coach="vv-lang"]').first()
    const btn = row.locator('button').first()
    if (await btn.isVisible().catch(() => false)) await btn.click()
    await page.waitForTimeout(700)
    await shot(page, 'station_coach_vv_hear_step.png')
  }

  /* Escape dismisses + marks seen */
  const escPage = await browser.newPage({ viewport: { width: 1280, height: 820 } })
  await prep(escPage, { step: 6, phone: false })
  await escPage.goto(`${BASE}/journey`, { waitUntil: 'networkidle', timeout: 60000 })
  await escPage.waitForTimeout(1000)
  await dismissExplainer(escPage)
  await escPage.waitForSelector('.station-coach-bubble', { timeout: 20000 })
  await escPage.keyboard.press('Escape')
  await escPage.waitForTimeout(400)
  const gone = !(await escPage.locator('.station-coach-bubble').isVisible().catch(() => false))
  const seenRaw = await escPage.evaluate(() => localStorage.getItem('pa-station-coach-seen-v1'))
  console.log('escape dismiss:', gone ? 'ok' : 'FAIL', 'seen:', seenRaw)
  await shot(escPage, 'station_coach_vv_escape_dismissed.png')

  /* Phone shell organize */
  const phone = await browser.newPage({ viewport: { width: 420, height: 860 } })
  await prep(phone, { step: 7, phone: true })
  await phone.goto(`${BASE}/journey`, { waitUntil: 'networkidle', timeout: 60000 })
  await phone.waitForTimeout(1500)
  await dismissExplainer(phone)
  await phone.waitForSelector('.station-coach-bubble, .vocab-organize, [data-coach="org-pic"]', {
    timeout: 20000,
  }).catch(() => null)
  await phone.waitForTimeout(500)
  await shot(phone, 'station_coach_organize_phone_paper.png')
  const pSay = phone.locator('.station-coach-say')
  console.log(
    'phone coach:',
    (await pSay.isVisible().catch(() => false)) ? await pSay.innerText() : '(no bubble)',
  )

  /* Skip marks organize seen */
  if (await phone.locator('.station-coach-skip').isVisible().catch(() => false)) {
    await phone.locator('.station-coach-skip').click()
    await phone.waitForTimeout(300)
    const pSeen = await phone.evaluate(() => localStorage.getItem('pa-station-coach-seen-v1'))
    console.log('skip dismiss seen:', pSeen)
    await shot(phone, 'station_coach_organize_skip_dismissed.png')
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
