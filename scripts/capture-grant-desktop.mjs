/**
 * Capture desktop-mode screenshots for grant TL;DR (PPT + video stills).
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, copyFileSync } from 'fs'
import { join } from 'path'

const BASE = process.env.GRANT_BASE || 'http://127.0.0.1:4180/Purpose-Academy-Application'
const OUT = process.env.GRANT_SHOTS || '/tmp/grant-build/shots'
const VIDEO_DIR = '/tmp/grant-build/video-raw2'
mkdirSync(OUT, { recursive: true })
mkdirSync(VIDEO_DIR, { recursive: true })

const manifest = []

async function shot(page, name, note) {
  const path = join(OUT, `${name}.png`)
  await page.screenshot({ path, fullPage: false })
  manifest.push({ name, path, note, url: page.url() })
  console.log(`shot ${name}: ${note}`)
  return path
}

async function seed(page, { step = 6, forceLesson = true, practice = true } = {}) {
  await page.evaluate(({ step, forceLesson, practice }) => {
    sessionStorage.setItem('pa-shell-mode-v2', 'course')
    sessionStorage.setItem('pa-crossed-threshold-v43', '1')
    if (practice) {
      sessionStorage.setItem('pa-practice-mode-v1', '1')
      sessionStorage.setItem('pa-practice-name-v1', 'Levi')
      sessionStorage.setItem('pa-student-journey-step-v1', String(step))
      if (forceLesson) sessionStorage.setItem('pa-practice-force-lesson-v1', '1')
      else sessionStorage.removeItem('pa-practice-force-lesson-v1')
    } else {
      sessionStorage.removeItem('pa-practice-mode-v1')
    }
    try {
      localStorage.setItem('pa-pathway-v1', 'construction')
    } catch {}
  }, { step, forceLesson, practice })
}

async function waitVisible(locator, ms = 12000) {
  await locator.waitFor({ state: 'visible', timeout: ms })
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-position=20,20', '--window-size=1440,900'],
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  })
  const page = await context.newPage()
  page.setDefaultTimeout(45000)

  // ——— Mode chooser ———
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  await shot(page, '01-mode-chooser', 'Desktop | Phone chooser')

  // ——— Desktop splash ———
  await page.getByRole('button', { name: /Enter desktop/i }).click()
  await page.waitForTimeout(1400)
  await shot(page, '02-splash', 'Opening night stage + three doors')

  // Smash enter → toolbox
  for (let i = 0; i < 35; i++) {
    if (await page.locator('.toolbox-station').isVisible().catch(() => false)) break
    const hammer = page.getByRole('button', { name: /Enter Purpose Academy/i })
    if (await hammer.isVisible().catch(() => false)) {
      await hammer.click()
      await page.waitForTimeout(2600)
      continue
    }
    await page.waitForTimeout(350)
  }
  await waitVisible(page.locator('.toolbox-station'))
  // Scroll trays into view if needed
  await page.evaluate(() => {
    const trays = document.querySelector('.toolbox-station-inner, .enter-box, .tool-tray, .toolbox-trays')
    trays?.scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(500)
  await shot(page, '03-toolbox', 'Desktop toolbox trays')

  // Full page toolbox if trays clipped
  const trayBtn = page.getByRole('button', { name: /Practice/i }).first()
  if (await trayBtn.isVisible().catch(() => false)) {
    await trayBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await shot(page, '03b-toolbox-trays', 'Toolbox with Practice tray in view')
  }

  // ——— Practice hub (pathways / finite path) ———
  await seed(page, { step: 6, forceLesson: false, practice: true })
  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await shot(page, '04-practice-hub', 'Practice path home')

  // Open Skills Passport from hub if available
  const passportBtn = page.getByRole('button', { name: /Skills Passport|Passport/i }).first()
  if (await passportBtn.isVisible().catch(() => false)) {
    await passportBtn.click()
    await page.waitForTimeout(900)
    await shot(page, '05-passport', 'Practice Skills Passport honesty')
    const back = page.getByRole('button', { name: /Path home|Back/i }).first()
    if (await back.isVisible().catch(() => false)) await back.click()
    await page.waitForTimeout(500)
  }

  // ——— Visual Vocabulary lesson ———
  await seed(page, { step: 6, forceLesson: true, practice: true })
  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // If still on hub, click Continue / open lesson
  if (!(await page.locator('.vocab-sheet-card, .vocab-sheet').first().isVisible().catch(() => false))) {
    const cont = page.getByRole('button', { name: /Continue|Open station|Start station|Today/i }).first()
    if (await cont.isVisible().catch(() => false)) {
      await cont.click()
      await page.waitForTimeout(1000)
    }
  }
  // Scroll to sheet
  const sheet = page.locator('.vocab-sheet-card, .vocab-sheet').first()
  if (await sheet.isVisible().catch(() => false)) {
    await sheet.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await shot(page, '06-visual-vocab', 'VocabSheet hear→hear→type')
    const hear = page.getByRole('button', { name: /Hear English/i }).first()
    if (await hear.isVisible().catch(() => false)) {
      await hear.click()
      await page.waitForTimeout(800)
      await shot(page, '06b-vocab-hear', 'Hear English on VocabSheet')
    }
  } else {
    // Debug dump
    const body = (await page.locator('body').innerText()).slice(0, 800)
    console.log('NO VOCAB SHEET. body:', body)
    await shot(page, '06-visual-vocab-miss', 'Missed VocabSheet — hub chrome')
  }

  // ——— Eye Spy ———
  await seed(page, { step: 8, forceLesson: true, practice: true })
  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  if (!(await page.locator('.eye-spy').first().isVisible().catch(() => false))) {
    const cont = page.getByRole('button', { name: /Continue|Open station|Start station/i }).first()
    if (await cont.isVisible().catch(() => false)) {
      await cont.click()
      await page.waitForTimeout(1000)
    }
  }
  const eye = page.locator('.eye-spy').first()
  if (await eye.isVisible().catch(() => false)) {
    await eye.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await shot(page, '07-eye-spy', 'English Eye Spy board')
  } else {
    console.log('NO EYE SPY. text:', (await page.locator('body').innerText()).slice(0, 500))
    await shot(page, '07-eye-spy-miss', 'Missed Eye Spy')
  }

  // ——— Programs pathways ———
  await seed(page, { practice: false })
  await page.evaluate(() => {
    sessionStorage.setItem('pa-shell-mode-v2', 'course')
    sessionStorage.setItem('pa-crossed-threshold-v43', '1')
  })
  await page.goto(BASE + '/programs', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await shot(page, '08-programs', 'Programs — three pathways')

  // Dignity chrome: Done for now on vocab
  await seed(page, { step: 6, forceLesson: true, practice: true })
  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  if (!(await page.locator('.vocab-sheet-card').first().isVisible().catch(() => false))) {
    const cont = page.getByRole('button', { name: /Continue|Open station/i }).first()
    if (await cont.isVisible().catch(() => false)) await cont.click()
    await page.waitForTimeout(800)
  }
  const done = page.getByRole('button', { name: /Done for now/i }).first()
  if (await done.isVisible().catch(() => false)) {
    await done.scrollIntoViewIfNeeded()
  }
  await shot(page, '09-dignity', 'Done for now + soft practice chrome')

  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log('shots', manifest.length)
  await context.close()
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
