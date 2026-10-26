/**
 * App-wide readability scan — Desktop course + Phone Practice.
 * Flags light ink on light beds and sub-0.8rem secondary labels.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = process.env.PLAY_URL || 'http://127.0.0.1:5173/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts/readability'
fs.mkdirSync(OUT, { recursive: true })

const findings = []
function note(mode, severity, msg, extra = {}) {
  findings.push({ mode, severity, msg, ...extra })
  console.log(`[${severity}] ${mode}: ${msg}`)
}

async function enter(page, phone) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  if (phone) {
    await page.locator('button.mode-door-phone').click()
    await page.waitForTimeout(400)
    await page.locator('.phone-home-app').click()
    await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
    await page.locator('.threshold-hammer').click({ force: true })
    await page.waitForTimeout(2400)
  } else {
    await page.locator('button.mode-door-desktop').click()
    await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
    await page.locator('.threshold-hammer').click({ force: true })
    await page.waitForTimeout(2400)
  }
  await page.locator('.toolbox-slot').filter({ hasText: /Practice/i }).first().click()
  await page.waitForTimeout(400)
  await page.locator('.practice-name-grid button').filter({ hasText: /^Levi$/i }).click()
  await page.locator('button').filter({ hasText: /Enter Practice/i }).click()
  await page.waitForTimeout(2000)
}

async function scan(page, mode, rootSel) {
  const hits = await page.evaluate((sel) => {
    const root = document.querySelector(sel) || document.body
    const out = []
    const els = root.querySelectorAll(
      'h1,h2,h3,h4,p,span,strong,em,li,label,button,a,figcaption,blockquote,td,th',
    )
    for (const el of els) {
      if (!el.offsetParent && el.tagName !== 'BODY') continue
      const t = (el.textContent || '').trim()
      if (!t || t.length > 70) continue
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || Number(s.opacity) < 0.15) continue
      const rgb = s.color.match(/\d+/g)?.map(Number)
      if (!rgb || rgb.length < 3) continue
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
      let bg = s.backgroundColor
      let n = el.parentElement
      let guard = 0
      while (n && guard++ < 8 && (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = getComputedStyle(n).backgroundColor
        n = n.parentElement
      }
      const m = bg && bg.match(/\d+/g)?.map(Number)
      const bgLum = m && m.length >= 3 ? (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 : 1
      const fs = parseFloat(s.fontSize) || 0
      const cls = (el.className || '').toString()
      /* Intentional light-on-dark */
      if (bgLum < 0.42 && lum > 0.7) continue
      if (/btn-primary|mode-door|badge|vocab-sheet-flag|vocab-sheet-banner|iphone-status/i.test(cls) && bgLum < 0.45)
        continue
      if (lum > 0.68 && bgLum > 0.55) {
        out.push({
          kind: 'light-ink',
          text: t.slice(0, 42),
          cls: cls.slice(0, 48),
          lum: +lum.toFixed(3),
          bgLum: +bgLum.toFixed(3),
          fontSize: s.fontSize,
        })
      } else if (fs > 0 && fs < 12.5 && /kicker|label|status|legend|metric|counter|pill|summary/i.test(cls)) {
        out.push({
          kind: 'tiny-label',
          text: t.slice(0, 42),
          cls: cls.slice(0, 48),
          fontSize: s.fontSize,
        })
      }
      if (out.length >= 25) break
    }
    return out
  }, rootSel)
  for (const h of hits) {
    note(mode, h.kind === 'light-ink' ? 'high' : 'med', `${h.kind}: “${h.text}”`, h)
  }
  return hits
}

async function jumpOpen(page, phone, label) {
  if (phone) {
    const menu = page.locator('.iphone-scroll .train-station-menu').first()
    if (await menu.count()) {
      if (!(await menu.evaluate((el) => el.open))) await menu.locator('summary').click()
      await page.waitForTimeout(200)
    }
    await page.locator('.iphone-scroll .train-station-menu[open] select').selectOption({ label })
  } else {
    const fold = page.locator('.practice-section-skip-fold').first()
    if (!(await fold.evaluate((el) => el.open))) await fold.locator('summary').click()
    await page.waitForTimeout(200)
    await page.locator('.practice-section-skip-fold[open] select').selectOption({ label })
  }
  await page.waitForTimeout(900)
  if (phone) await page.locator('.iphone-scroll').evaluate((el) => { el.scrollTop = 0 })
  else await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

async function run(phone) {
  const mode = phone ? 'phone' : 'desktop'
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: phone ? { width: 1400, height: 1000 } : { width: 1440, height: 900 },
  })
  await page.addInitScript(() => {
    sessionStorage.clear()
    localStorage.clear()
  })
  await enter(page, phone)
  const root = phone ? '.iphone-scroll' : 'body'
  await page.screenshot({ path: path.join(OUT, `${mode}-hub.png`) })
  await scan(page, mode, root)

  await page.locator(phone ? '.iphone-scroll button' : 'button').filter({ hasText: /Open today('|’)s station/i }).first().click()
  await page.waitForTimeout(1200)
  await scan(page, mode, root)
  await page.screenshot({ path: path.join(OUT, `${mode}-language.png`) })

  for (const label of ['6. Visual Vocabulary', '9. Sentence Structure', '12. Basic Computer Skills']) {
    await jumpOpen(page, phone, label)
    await scan(page, mode, root)
    await page.screenshot({ path: path.join(OUT, `${mode}-${label.split('. ')[1].replace(/\s+/g, '-').toLowerCase()}.png`) })
  }
  await browser.close()
}

await run(false)
await run(true)
const summary = {
  total: findings.length,
  high: findings.filter((f) => f.severity === 'high').length,
  med: findings.filter((f) => f.severity === 'med').length,
  findings,
}
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(summary, null, 2))
console.log('\nREADABILITY SUMMARY', { total: summary.total, high: summary.high, med: summary.med })
process.exit(0)
