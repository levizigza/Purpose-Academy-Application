/**
 * App-wide light-ink-on-paper sweep (phone Practice + hub).
 * Fails samples with light foreground on light background (WCAG body risk).
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = process.env.PLAY_URL || 'http://127.0.0.1:4180/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts/ink-sweep'
fs.mkdirSync(OUT, { recursive: true })

const findings = []

function note(severity, where, extra = {}) {
  findings.push({ severity, where, ...extra })
  console.log(`[${severity}] ${where}`, extra.text || extra.cls || '')
}

async function enterPractice(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.locator('button.mode-door-phone').first().click()
  await page.waitForTimeout(500)
  await page.locator('.phone-home-app').first().click()
  try {
    await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
    await page.locator('.threshold-hammer').click({ force: true })
    await page.waitForTimeout(2400)
  } catch {
    note('med', 'splash-hammer-miss')
  }
  let ok = false
  for (let i = 0; i < 6 && !ok; i++) {
    const slot = page.locator('button.toolbox-slot, .toolbox-slot').filter({ hasText: /Practice/i }).first()
    if (await slot.count()) {
      try {
        await slot.click({ timeout: 4000 })
        ok = true
      } catch {
        await page.waitForTimeout(700)
      }
    } else await page.waitForTimeout(700)
  }
  if (!ok) await page.goto(`${BASE}/journey?practice=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const levi = page.locator('.practice-name-grid button, .iphone-scroll button').filter({ hasText: /^Levi$/i }).first()
  if (await levi.count()) {
    await levi.click()
    await page.locator('button').filter({ hasText: /Enter Practice/i }).first().click()
    await page.waitForTimeout(1800)
  }
}

async function measureInk(page, label) {
  const rows = await page.evaluate(() => {
    const root = document.querySelector('.iphone-scroll') || document.body
    const out = []
    const els = root.querySelectorAll(
      'h1,h2,h3,h4,p,span,strong,em,li,label,a,button,figcaption,td,th,summary,blockquote',
    )
    for (const el of els) {
      if (!el.offsetParent && el.tagName !== 'BODY') continue
      const t = (el.textContent || '').trim().replace(/\s+/g, ' ')
      if (!t || t.length > 80) continue
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || Number(s.opacity) < 0.25 || s.display === 'none') continue
      const rgb = s.color.match(/\d+/g)?.map(Number)
      if (!rgb || rgb.length < 3) continue
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
      let bg = s.backgroundColor
      let n = el
      for (let i = 0; i < 8; i++) {
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') break
        n = n.parentElement
        if (!n) break
        bg = getComputedStyle(n).backgroundColor
      }
      const rgbBg = bg && bg.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
      if (!rgbBg) continue
      const bgLum = (0.2126 * +rgbBg[1] + 0.7152 * +rgbBg[2] + 0.0722 * +rgbBg[3]) / 255
      /* light ink on light paper */
      if (lum > 0.58 && bgLum > 0.55) {
        out.push({
          text: t.slice(0, 56),
          cls: (el.className || '').toString().slice(0, 56),
          tag: el.tagName.toLowerCase(),
          lum: +lum.toFixed(3),
          bgLum: +bgLum.toFixed(3),
          color: s.color,
          bg,
        })
      }
      if (out.length >= 25) break
    }
    return out
  })
  for (const r of rows) note('high', label, r)
  await page.screenshot({ path: path.join(OUT, `${label.replace(/\s+/g, '-')}.png`), fullPage: false })
  return rows
}

async function jump(page, label) {
  const menu = page.locator('.iphone-scroll .train-station-menu').first()
  if (!(await menu.count())) return false
  if (!(await menu.evaluate((el) => el.open))) {
    await menu.locator('summary').first().click()
    await page.waitForTimeout(200)
  }
  const sel = page.locator('.iphone-scroll .train-station-menu[open] select').first()
  if (!(await sel.count())) return false
  const options = await sel.locator('option').allTextContents()
  const hit = options.find((t) => t.includes(label) || new RegExp(label, 'i').test(t))
  if (!hit) {
    note('med', `jump-missing:${label}`, { options: options.slice(0, 8) })
    return false
  }
  await sel.selectOption({ label: hit })
  await page.waitForTimeout(800)
  await page.locator('.iphone-scroll').evaluate((el) => {
    el.scrollTop = 0
  })
  await page.waitForTimeout(300)
  return true
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
await page.addInitScript(() => {
  sessionStorage.clear()
  localStorage.clear()
})

await enterPractice(page)
await measureInk(page, 'hub')

const open = page
  .locator('.iphone-scroll button')
  .filter({ hasText: /Open today('|’)s station|Open today|Resume|Current lesson/i })
  .first()
if (await open.count()) {
  await open.click()
  await page.waitForTimeout(1200)
}

const stations = [
  'Your Language',
  'Work Style',
  'Your Career Profile',
  'Visual Vocabulary',
  'Language Organize',
  'English Eye Spy',
  'Sentence Structure',
  'Word → Action',
  'Supported Practice',
  'Workplace Instructions',
  'Basic Computer Skills',
  'Interest Assessment',
  'Safety Training',
  'Tools & Equipment',
  'Video',
  'Instructor Observation',
  'On-Site Training',
  'Final Exam',
  'Employment Connection',
]

for (const s of stations) {
  const ok = await jump(page, s)
  if (!ok) continue
  /* Career / interest: advance a couple choices if needed so result cards exist */
  if (/Career Profile|Interest|Work Style/i.test(s)) {
    for (let i = 0; i < 4; i++) {
      const choice = page.locator('.iphone-scroll .career-choice, .iphone-scroll .career-likert-btn, .iphone-scroll .train-lang').first()
      if (await choice.count()) {
        await choice.click().catch(() => {})
        const next = page.locator('.iphone-scroll button.btn-primary').first()
        if (await next.count()) await next.click().catch(() => {})
        await page.waitForTimeout(400)
      } else break
    }
  }
  await measureInk(page, s)
}

await browser.close()

const summary = {
  total: findings.length,
  high: findings.filter((f) => f.severity === 'high').length,
  med: findings.filter((f) => f.severity === 'med').length,
  byStation: {},
  findings,
}
for (const f of findings) {
  if (f.severity !== 'high') continue
  summary.byStation[f.where] = (summary.byStation[f.where] || 0) + 1
}
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(summary, null, 2))
console.log('\n===== INK SWEEP =====')
console.log(JSON.stringify({ total: summary.total, high: summary.high, med: summary.med, byStation: summary.byStation }, null, 2))
process.exit(0)
