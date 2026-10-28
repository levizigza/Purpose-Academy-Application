/**
 * Desktop night + Phone paper smoke for Construction Unit 8 equipment video Q&A.
 * Usage: BASE=http://127.0.0.1:5173/Purpose-Academy-Application node scripts/smoke-construction-equip-ui.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'
import { gotoStation } from './explainers/demo-lib.mjs'

const BASE = process.env.BASE || 'http://127.0.0.1:5173/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts/construction-equip-smoke'
const PUB = '/opt/cursor/artifacts'
mkdirSync(OUT, { recursive: true })
mkdirSync(PUB, { recursive: true })

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

  await gotoStation(page, BASE, {
    step: 18,
    pathway: 'construction',
    shell: phone ? 'phone' : 'course',
  })
  await page.waitForTimeout(900)

  if (phone) {
    await page.locator('.is-phone-app').waitFor({ timeout: 15000 })
  } else {
    await page.locator('.pa-course-shell, .course-stage, .is-course-app').first().waitFor({ timeout: 15000 }).catch(() => {})
  }

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

  const shellOk = await page.evaluate((wantPhone) => {
    if (wantPhone) return Boolean(document.querySelector('.is-phone-app'))
    return (
      document.documentElement.classList.contains('pa-course-shell') ||
      Boolean(document.querySelector('.course-stage, .is-course-app'))
    )
  }, phone)
  assert(shellOk, `${name}: expected ${phone ? 'Phone paper (.is-phone-app)' : 'Desktop night'} shell`)

  /* Force watch progress so practice questions unlock */
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
  await goPractice.waitFor({ timeout: 8000 })
  await goPractice.click()
  await page.waitForTimeout(500)

  const prompt = await page.locator('.train-check-prompt').first().innerText()
  assert(/excavator/i.test(prompt), `${name}: Q1 prompt should mention excavator, got ${prompt}`)

  /* Pick correct answer C for excavator Q1 */
  await page.locator('.train-choice', { hasText: /^C\./ }).first().click()
  await page.waitForTimeout(400)
  const teach = await page.locator('.equip-video-check .alert.ok').innerText()
  assert(
    /digging and moving material/i.test(teach),
    `${name}: excavator Q1 teach mismatch: ${teach}`,
  )
  assert(await page.locator('.train-choice.is-correct').first().isVisible(), `${name}: correct green missing`)

  const colors = await page.evaluate(() => {
    const choice = document.querySelector('.train-choice.is-correct')
    const check = document.querySelector('.equip-video-check')
    const cs = (el) => (el ? getComputedStyle(el) : null)
    return {
      choiceBg: cs(choice)?.backgroundColor,
      checkBg: cs(check)?.backgroundColor,
      phone: Boolean(document.querySelector('.is-phone-app')),
    }
  })
  if (phone) {
    assert(colors.phone, `${name}: .is-phone-app missing during check`)
    /* Paper check card should be near-white, not night navy */
    assert(
      /rgb\(255,\s*255,\s*255\)|#fff/i.test(colors.checkBg) || colors.checkBg?.includes('255'),
      `${name}: phone check card should be paper white, got ${colors.checkBg}`,
    )
  }

  const okShot = join(OUT, `${name}-excavator-check-ok.png`)
  await page.screenshot({ path: okShot, fullPage: false })
  copyFileSync(okShot, join(PUB, `construction-equip-${name}-check-ok.png`))

  /* Soft miss on Q2 */
  await page.getByRole('button', { name: /Next question/i }).click()
  await page.waitForTimeout(350)
  await page.locator('.train-choice', { hasText: /^A\./ }).first().click()
  await page.waitForTimeout(350)
  assert(await page.locator('.play-soft-miss').first().isVisible(), `${name}: soft-miss missing`)
  assert(await page.locator('.train-choice.is-wrong').first().isVisible(), `${name}: wrong red missing`)

  const missShot = join(OUT, `${name}-excavator-soft-miss.png`)
  await page.screenshot({ path: missShot, fullPage: false })
  copyFileSync(missShot, join(PUB, `construction-equip-${name}-soft-miss.png`))

  const retry = page.getByRole('button', { name: /Not yet|try again/i }).first()
  assert(await retry.isVisible(), `${name}: soft-retry CTA missing`)
  /* Continue CTA must not sit under sticky chrome off-fold */
  /* Allow pickChoice scroll-into-view to settle inside .train-panel */
  await page.waitForTimeout(450)
  const fold = await page.evaluate(() => {
    const btn = document.querySelector('.equip-video-check .equip-video-actions .btn-primary')
    if (!btn) return { ok: false }
    const r = btn.getBoundingClientRect()
    const panel = document.querySelector('.reveal.train-panel')
    if (panel instanceof HTMLElement) {
      const p = panel.getBoundingClientRect()
      return {
        ok: r.bottom <= p.bottom + 4 && r.top >= p.top - 4 && r.height > 0,
        bottom: r.bottom,
        panelBottom: p.bottom,
        panelTop: p.top,
        text: btn.textContent?.trim(),
      }
    }
    return { ok: r.bottom <= window.innerHeight + 8 && r.height > 0, bottom: r.bottom, text: btn.textContent?.trim() }
  })
  assert(fold.ok, `${name}: primary continue clipped under fold (${JSON.stringify(fold)})`)

  await retry.click()
  await page.waitForTimeout(250)
  console.log(`[${name}] excavator Q1 teach + soft-miss OK: ${teach.slice(0, 80)}…`)

  /* Jump to tower crane via rail */
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
  console.log(`published: ${PUB}/construction-equip-{desktop,phone}-*.png`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
