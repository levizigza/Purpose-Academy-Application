/**
 * Thorough Desktop + Phone playthrough audit.
 * Captures first-viewport chrome ratio, overlaps, cutoffs, light ink.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = process.env.PLAY_URL || 'http://127.0.0.1:5173/Purpose-Academy-Application'
const OUT = '/opt/cursor/artifacts/playthrough'
fs.mkdirSync(OUT, { recursive: true })

const findings = []
function find(mode, severity, msg, extra = {}) {
  const row = { mode, severity, msg, ...extra }
  findings.push(row)
  console.log(`[${severity}] ${mode}: ${msg}`, extra.sel || extra.slice || '')
}
function ok(mode, msg) {
  console.log(`OK ${mode}: ${msg}`)
}

async function shot(page, name) {
  const p = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: p, fullPage: false })
  return p
}

async function measureFirstViewport(page, rootSel) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel) || document.documentElement
    const rootBox = root.getBoundingClientRect()
    const viewH = root === document.documentElement ? window.innerHeight : root.clientHeight
    const viewTop = root === document.documentElement ? 0 : rootBox.top

    const title = document.querySelector('.train-title, .ph-hero-copy h1, h1')
    const titleBox = title?.getBoundingClientRect()
    const titleInView = titleBox
      ? titleBox.top >= viewTop && titleBox.bottom <= viewTop + viewH
      : false
    const titleY = titleBox ? titleBox.top - viewTop : null

    const header = document.querySelector('.train-header, .practice-section-skip')
    const headerBottom = header
      ? Math.max(
          ...[...document.querySelectorAll('.train-header, .practice-section-skip')].map(
            (el) => el.getBoundingClientRect().bottom - viewTop,
          ),
        )
      : 0

    const chromeRatio = Math.min(1, Math.max(0, headerBottom / viewH))

    /* Overlaps: foley vs hub buttons */
    const overlaps = []
    const foley = document.querySelector('.train-sound-slot .foley-toggle, .iphone-scroll .foley-toggle')
    const hubs = [...document.querySelectorAll('.train-hub-btn')]
    if (foley) {
      const fb = foley.getBoundingClientRect()
      for (const h of hubs) {
        const hb = h.getBoundingClientRect()
        const ox = Math.max(0, Math.min(fb.right, hb.right) - Math.max(fb.left, hb.left))
        const oy = Math.max(0, Math.min(fb.bottom, hb.bottom) - Math.max(fb.top, hb.top))
        if (ox > 4 && oy > 4) {
          overlaps.push({
            a: 'foley-toggle',
            b: (h.textContent || '').trim().slice(0, 24),
            ox: Math.round(ox),
            oy: Math.round(oy),
          })
        }
      }
    }

    /* Cutoff: elements near bottom with clipped text */
    const cutoffs = []
    const probe = root.querySelectorAll(
      '.train-title, .train-simple-line, .comp-skills, .sentence-cloze-card, .vocab-sheet, .alert, .practice-stats-strip, .ph-resume, button.btn-primary',
    )
    for (const el of probe) {
      const b = el.getBoundingClientRect()
      if (b.height < 4 || b.width < 4) continue
      const bottom = b.bottom - viewTop
      if (bottom > viewH - 8 && b.top - viewTop < viewH - 20) {
        cutoffs.push({
          cls: (el.className || '').toString().slice(0, 40),
          text: (el.textContent || '').trim().slice(0, 40),
          clippedPx: Math.round(bottom - viewH),
        })
      }
      if (cutoffs.length >= 8) break
    }

    /* Light ink on paper */
    const lightInk = []
    const walk = root.querySelectorAll('h1,h2,h3,strong,p,span,button,label,a')
    for (const el of walk) {
      if (!el.offsetParent && el.tagName !== 'BODY') continue
      const t = (el.textContent || '').trim()
      if (!t || t.length > 60) continue
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || Number(s.opacity) < 0.2) continue
      const rgb = s.color.match(/\d+/g)?.map(Number)
      if (!rgb) continue
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
      let bg = s.backgroundColor
      let n = el.parentElement
      while (n && (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = getComputedStyle(n).backgroundColor
        n = n.parentElement
      }
      const m = bg && bg.match(/\d+/g)?.map(Number)
      const bgLum = m ? (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 : 1
      if (lum > 0.72 && bgLum > 0.55) {
        lightInk.push({
          text: t.slice(0, 36),
          cls: (el.className || '').toString().slice(0, 36),
          lum: +lum.toFixed(3),
          bgLum: +bgLum.toFixed(3),
        })
      }
      if (lightInk.length >= 10) break
    }

    const lessonCandidates = [
      ...document.querySelectorAll(
        '.comp-skills-card, .sentence-cloze-card, .vocab-sheet, .eye-spy, .eye-spy-stage, .career-assess, .train-panel > *',
      ),
    ]
    const lesson = lessonCandidates.find((el) => {
      const s = getComputedStyle(el)
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.2) return false
      const r = el.getBoundingClientRect()
      return r.width > 8 && r.height > 8
    })
    const lessonBox = lesson?.getBoundingClientRect()
    const lessonInView = lessonBox
      ? lessonBox.top < viewTop + viewH * 0.92 && lessonBox.bottom > viewTop + 40
      : null

    return {
      viewH: Math.round(viewH),
      chromeRatio: +chromeRatio.toFixed(3),
      headerBottom: Math.round(headerBottom),
      titleInView,
      titleY: titleY != null ? Math.round(titleY) : null,
      titleText: (title?.textContent || '').trim().slice(0, 48),
      lessonInView,
      lessonTop: lessonBox ? Math.round(lessonBox.top - viewTop) : null,
      overlaps,
      cutoffs,
      lightInk,
    }
  }, rootSel)
}

async function enterPractice(page, { phone }) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  if (phone) {
    await page.locator('button.mode-door-phone').first().click()
    await page.waitForTimeout(500)
    await page.locator('.phone-home-app').first().click()
    try {
      await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
      await page.locator('.threshold-hammer').click({ force: true })
      await page.waitForTimeout(2400)
    } catch {
      find('phone', 'high', 'Splash hammer never visible')
    }
    await page.locator('button.toolbox-slot, .toolbox-slot').filter({ hasText: /Practice/i }).first().click()
  } else {
    await page.locator('button.mode-door-desktop').first().click()
    await page.waitForTimeout(800)
    try {
      await page.waitForSelector('.threshold-hammer.is-visible', { timeout: 20000 })
      await page.locator('.threshold-hammer').click({ force: true })
      await page.waitForTimeout(2400)
    } catch {
      find('desktop', 'high', 'Desktop splash hammer never visible')
    }
    await page.locator('button.toolbox-slot, .toolbox-slot').filter({ hasText: /Practice/i }).first().click()
  }
  await page.waitForTimeout(600)
  const levi = page.locator('.practice-name-grid button').filter({ hasText: /^Levi$/i }).first()
  if (await levi.count()) {
    await levi.click()
    await page.locator('button').filter({ hasText: /Enter Practice/i }).first().click()
    await page.waitForTimeout(2000)
  }
}

async function jump(page, label, phone) {
  const root = phone ? '.iphone-scroll' : 'body'
  /* Phone: jump lives inside Station menu. Desktop: dedicated review fold. */
  const menu = page.locator(`${root} .train-station-menu`).first()
  if (phone && (await menu.count())) {
    const open = await menu.evaluate((el) => el.open)
    if (!open) {
      await menu.locator('summary').first().click()
      await page.waitForTimeout(200)
    }
  } else {
    const fold = page.locator(`${root} .practice-section-skip-fold`).first()
    if (await fold.count()) {
      const open = await fold.evaluate((el) => el.open)
      if (!open) {
        await fold.locator('summary').first().click()
        await page.waitForTimeout(200)
      }
    }
  }
  const jumpSel = phone
    ? '.iphone-scroll .train-station-menu[open] select'
    : '.practice-section-skip-fold[open] select'
  const sel = page.locator(jumpSel).first()
  if (!(await sel.count())) {
    find(phone ? 'phone' : 'desktop', 'high', 'Section jump missing', { label })
    return false
  }
  const options = await sel.locator('option').allTextContents()
  const hit = options.find((t) => t.includes(label) || new RegExp(label, 'i').test(t))
  if (!hit) {
    find(phone ? 'phone' : 'desktop', 'med', 'Jump option missing', { label, options: options.slice(0, 8) })
    return false
  }
  await sel.selectOption({ label: hit })
  await page.waitForTimeout(800)
  /* Jump can leave scroll mid-page; learner expectation is top of station */
  if (phone) {
    await page.locator('.iphone-scroll').evaluate((el) => {
      el.scrollTop = 0
    })
  } else {
    await page.evaluate(() => window.scrollTo(0, 0))
  }
  await page.waitForTimeout(350)
  return true
}

async function auditStation(page, mode, name, rootSel) {
  const m = await measureFirstViewport(page, rootSel)
  console.log(`\n== ${mode} @ ${name} ==`, m)
  await shot(page, `${mode}-${name}`)

  /* With lesson peeking in, ~50% header (title+help+stats) is acceptable; fail when chrome blocks the task */
  if (m.chromeRatio > 0.58 || (m.chromeRatio > 0.42 && m.lessonInView === false)) {
    find(mode, 'high', `Chrome eats ${(m.chromeRatio * 100).toFixed(0)}% of first viewport before lesson`, {
      station: name,
      headerBottom: m.headerBottom,
      viewH: m.viewH,
      lessonInView: m.lessonInView,
    })
  } else if (m.chromeRatio > 0.42) {
    find(mode, 'low', `Chrome ${(m.chromeRatio * 100).toFixed(0)}% but lesson still peeks in`, {
      station: name,
    })
  }
  if (!m.titleInView && m.titleY != null && m.titleY > m.viewH) {
    find(mode, 'high', 'Station title below first viewport', { station: name, titleY: m.titleY })
  }
  if (m.lessonInView === false) {
    find(mode, 'high', 'Lesson body not in first viewport', {
      station: name,
      lessonTop: m.lessonTop,
      viewH: m.viewH,
    })
  }
  for (const o of m.overlaps) {
    find(mode, 'high', `Overlap: ${o.a} vs “${o.b}”`, { station: name, ...o })
  }
  for (const c of m.cutoffs) {
    if (c.clippedPx > 12) find(mode, 'med', `Cutoff: ${c.text || c.cls}`, { station: name, ...c })
  }
  for (const li of m.lightInk) {
    find(mode, 'med', `Light ink on paper: “${li.text}”`, { station: name, ...li })
  }
  return m
}

async function runMode(phone) {
  const mode = phone ? 'phone' : 'desktop'
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: phone ? { width: 1400, height: 1000 } : { width: 1440, height: 900 },
  })
  await page.addInitScript(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  await enterPractice(page, { phone })
  await shot(page, `${mode}-00-hub`)
  ok(mode, 'Entered Practice')

  const root = phone ? '.iphone-scroll' : 'body'
  await auditStation(page, mode, 'hub', root)

  /* Open into sequence — do NOT match “Start over” (resets the path) */
  const open = page
    .locator(phone ? '.iphone-scroll button' : 'button')
    .filter({ hasText: /Open today('|’)s station|Open today/i })
    .first()
  if (await open.count()) {
    await open.click()
    await page.waitForTimeout(1400)
  } else {
    const resume = page
      .locator(phone ? '.iphone-scroll button' : 'button')
      .filter({ hasText: /^Resume$|Current lesson/i })
      .first()
    if (await resume.count()) {
      await resume.click()
      await page.waitForTimeout(1400)
    } else find(mode, 'high', 'Could not open today’s station from hub')
  }
  /* Ensure jump chrome exists before station loop */
  const jumpChrome = phone
    ? '.iphone-scroll .train-station-menu'
    : '.practice-section-skip-fold'
  const foldReady = await page
    .locator(jumpChrome)
    .first()
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  if (!foldReady) find(mode, 'high', 'Practice section jump chrome never appeared after open')

  const stations = [
    'Your Language',
    'Visual Vocabulary',
    'English Eye Spy',
    'Sentence Structure',
    'Basic Computer Skills',
    'Workplace Instructions',
  ]
  for (const s of stations) {
    const okJump = await jump(page, s, phone)
    if (!okJump) continue
    await auditStation(page, mode, s.replace(/\s+/g, '-').toLowerCase(), root)

    /* Computer skills: ensure lesson body visible */
    if (/Computer/i.test(s)) {
      const body = await page.evaluate((sel) => {
        const root = document.querySelector(sel) || document.body
        return {
          hasComp: !!document.querySelector('.comp-skills, .computer-skills, [class*="comp"]'),
          text: (root.innerText || '').slice(0, 500),
        }
      }, root)
      if (!/lesson|Watch|try|mouse|folder|Turn on|video/i.test(body.text) && !body.hasComp) {
        find(mode, 'high', 'Basic Computer Skills lesson body not in text dump — likely below chrome fold', {
          slice: body.text.slice(0, 200),
        })
      }
    }
  }

  await browser.close()
}

await runMode(false)
await runMode(true)

const summary = {
  total: findings.length,
  high: findings.filter((f) => f.severity === 'high').length,
  med: findings.filter((f) => f.severity === 'med').length,
  findings,
}
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(summary, null, 2))
console.log('\n===== SUMMARY =====')
console.log(JSON.stringify({ total: summary.total, high: summary.high, med: summary.med }, null, 2))
process.exit(0)
