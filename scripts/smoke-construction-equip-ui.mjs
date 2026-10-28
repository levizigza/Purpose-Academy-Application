/**
 * Desktop + Phone smoke for Construction Unit 8 equipment video Q&A.
 * Usage: BASE=http://127.0.0.1:5173 node scripts/smoke-construction-equip-ui.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { gotoStation } from './explainers/demo-lib.mjs'

const BASE = process.env.BASE || 'http://127.0.0.1:5173'
const OUT = '/opt/cursor/artifacts/construction-equip-smoke'
mkdirSync(OUT, { recursive: true })

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function smokeShell(browser, { name, viewport, phone }) {
  const context = await browser.newContext({
    viewport,
    ...(phone
      ? {
          isMobile: true,
          hasTouch: true,
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        }
      : {}),
  })
  const page = await context.newPage()
  page.on('pageerror', (err) => console.error(`[${name}] pageerror`, err.message))

  if (phone) {
    await page.addInitScript(() => {
      document.documentElement.classList.add('pa-phone-shell')
      try {
        localStorage.setItem('pa-shell-mode-v2', 'phone')
        sessionStorage.setItem('pa-phone-phase', 'app')
      } catch {
        /* ignore */
      }
    })
  } else {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('pa-shell-mode-v2', 'course')
        sessionStorage.setItem('pa-desktop-phase-v1', 'ready')
        sessionStorage.setItem('pa-crossed-threshold-v30', '1')
      } catch {
        /* ignore */
      }
    })
  }

  await gotoStation(page, BASE, { step: 18, pathway: 'construction' })
  await page.waitForTimeout(800)

  const card = page.locator('.equip-video-card')
  await card.waitFor({ timeout: 15000 })
  const kicker = await page.locator('.equip-video-card .section-kicker').first().innerText()
  assert(/Construction Equipment/i.test(kicker), `${name}: expected Construction Equipment kicker, got ${kicker}`)

  const title = await page.locator('.equip-video-title').first().innerText()
  assert(/Excavator/i.test(title), `${name}: first lesson should be Excavator, got ${title}`)

  const railNames = await page.locator('.equip-video-rail-name').allInnerTexts()
  assert(railNames.length === 14, `${name}: expected 14 rail lessons, got ${railNames.length}`)
  assert(railNames.some((t) => /Tower Crane/i.test(t)), `${name}: missing Tower Crane in rail`)
  assert(railNames.some((t) => /Mobile Scaffold/i.test(t)), `${name}: missing Mobile Scaffold in rail`)

  /* Skip watch gate in practice / by marking can continue — click Answer if enabled, else force via practice skip path */
  const answerBtn = page.getByRole('button', { name: /Answer practice questions|Continue|Keep watching/i }).first()
  await answerBtn.waitFor({ timeout: 8000 })
  /* Force watch progress so practice questions unlock without waiting the stub video */
  await page.evaluate(() => {
    const v = document.querySelector('video.equip-video-player')
    if (v) {
      try {
        v.currentTime = Math.max(0, (v.duration || 1) - 0.05)
        v.dispatchEvent(new Event('timeupdate'))
        v.dispatchEvent(new Event('ended'))
      } catch {
        /* ignore */
      }
    }
  })
  await page.waitForTimeout(400)
  const goPractice = page.getByRole('button', { name: /Answer practice questions/i }).first()
  if (await goPractice.isVisible().catch(() => false)) {
    await goPractice.click()
  } else {
    /* practice mode may already allow */
    await answerBtn.click()
  }
  await page.waitForTimeout(500)

  const prompt = await page.locator('.train-check-prompt').first().innerText()
  assert(/excavator/i.test(prompt), `${name}: Q1 prompt should mention excavator, got ${prompt}`)

  /* Pick correct answer C for excavator Q1 */
  const choiceC = page.locator('.train-choice', { hasText: /^C\./ }).first()
  await choiceC.click()
  await page.waitForTimeout(350)
  const teach = await page.locator('.equip-video-check .alert.ok').innerText()
  assert(
    /digging and moving material/i.test(teach),
    `${name}: excavator Q1 teach mismatch: ${teach}`,
  )
  console.log(`[${name}] excavator Q1 teach OK: ${teach.slice(0, 80)}…`)

  await page.screenshot({ path: join(OUT, `${name}-excavator-q1-teach.png`), fullPage: false })

  /* Jump to tower crane via rail and sample a teach */
  await page.locator('.equip-video-rail-btn', { hasText: /Tower Crane/i }).first().click()
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    const v = document.querySelector('video.equip-video-player')
    if (v) {
      try {
        v.currentTime = Math.max(0, (v.duration || 1) - 0.05)
        v.dispatchEvent(new Event('timeupdate'))
        v.dispatchEvent(new Event('ended'))
      } catch {
        /* ignore */
      }
    }
  })
  await page.waitForTimeout(300)
  const towerPractice = page.getByRole('button', { name: /Answer practice questions/i }).first()
  if (await towerPractice.isVisible().catch(() => false)) await towerPractice.click()
  await page.waitForTimeout(400)
  const towerTitle = await page.locator('.equip-video-title').first().innerText()
  assert(/Tower Crane/i.test(towerTitle), `${name}: expected Tower Crane title`)
  /* Q1 answer B */
  await page.locator('.train-choice', { hasText: /^B\./ }).first().click()
  await page.waitForTimeout(350)
  const towerTeach = await page.locator('.equip-video-check .alert.ok').innerText()
  assert(
    /trolley changes hook radius/i.test(towerTeach),
    `${name}: tower crane Q1 teach mismatch: ${towerTeach}`,
  )
  console.log(`[${name}] tower-crane Q1 teach OK`)
  await page.screenshot({ path: join(OUT, `${name}-tower-crane-q1-teach.png`), fullPage: false })

  await context.close()
  console.log(`[${name}] pass`)
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  try {
    await smokeShell(browser, { name: 'desktop', viewport: { width: 1280, height: 900 }, phone: false })
    await smokeShell(browser, { name: 'phone', viewport: { width: 390, height: 844 }, phone: true })
  } finally {
    await browser.close()
  }
  console.log('\nsmoke-construction-equip-ui: pass')
  console.log(`artifacts: ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
