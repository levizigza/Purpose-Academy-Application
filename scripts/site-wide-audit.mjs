/**
 * Site-wide Desktop + Phone audit after pathways-bottom.
 * Captures screenshots and flags layout collisions / overflow / missing cues.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.PA_BASE || 'http://127.0.0.1:5173/Purpose-Academy-Application'
const OUT = process.env.PA_ARTIFACTS || '/opt/cursor/artifacts/site-audit'
await mkdir(OUT, { recursive: true })

const findings = []
function note(shell, surface, severity, msg, extra = {}) {
  findings.push({ shell, surface, severity, msg, ...extra })
  console.log(`[${severity}] ${shell}/${surface}: ${msg}`)
}

const STATION_IDS = [
  'your-language',
  'workplace-words',
  'language-organize',
  'eye-spy',
  'sentence-structure',
  'word-action',
  'supported-practice',
  'workplace-instructions',
  'computer-skills',
  'site-language',
  'safety',
  'tools',
  'systems',
  'equipment-video',
]

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function shot(page, name) {
  const p = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: p, fullPage: false })
  return p
}

function rectsOverlap(a, b, pad = 2) {
  return !(
    a.right <= b.left + pad ||
    a.left >= b.right - pad ||
    a.bottom <= b.top + pad ||
    a.top >= b.bottom - pad
  )
}

async function layoutProbe(page, shell, surface, selectors) {
  const data = await page.evaluate((sels) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const out = {}
    for (const [key, sel] of Object.entries(sels)) {
      const el = document.querySelector(sel)
      if (!el) {
        out[key] = null
        continue
      }
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      out[key] = {
        text: (el.innerText || el.getAttribute('aria-label') || '').slice(0, 80),
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
        visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0',
        opacity: cs.opacity,
        zIndex: cs.zIndex,
        overflowClipped:
          el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2,
        offscreen: r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw,
        clippedByViewport: r.bottom > vh + 1 || r.right > vw + 1 || r.left < -1 || r.top < -1,
      }
    }
    /* Fixed/absolute CTAs that stick out */
    const overflowBody = document.documentElement.scrollWidth > window.innerWidth + 2
    return { out, vw, vh, overflowBody }
  }, selectors)

  if (data.overflowBody) note(shell, surface, 'med', 'Horizontal page overflow (scrollWidth > viewport)')

  const keys = Object.keys(data.out)
  for (const k of keys) {
    const v = data.out[k]
    if (!v) {
      note(shell, surface, 'med', `Missing element: ${k}`, { selector: selectors[k] })
      continue
    }
    if (!v.visible) note(shell, surface, 'high', `Invisible: ${k}`, v)
    if (v.offscreen) note(shell, surface, 'high', `Offscreen: ${k}`, v)
    if (v.clippedByViewport && v.visible)
      note(shell, surface, 'med', `Clipped by viewport: ${k}`, {
        bottom: v.bottom,
        vh: data.vh,
        right: v.right,
        vw: data.vw,
      })
  }

  /* Pairwise overlap for important pairs */
  const pairs = [
    ['brand', 'pathways'],
    ['brand', 'door'],
    ['door', 'pathways'],
    ['tap', 'pathways'],
    ['brand', 'tap'],
    ['title', 'pathways'],
  ]
  for (const [a, b] of pairs) {
    const A = data.out[a]
    const B = data.out[b]
    if (A?.visible && B?.visible && rectsOverlap(A, B)) {
      note(shell, surface, 'high', `Overlap: ${a} ∩ ${b}`, {
        a: { top: A.top, bottom: A.bottom },
        b: { top: B.top, bottom: B.bottom },
      })
    }
  }
  return data
}

async function seed(page, opts = {}) {
  const {
    shell = null,
    practice = false,
    step = 3,
    skipExplainers = true,
    clearNav = true,
    phonePhase = 'toolbox',
    crossed = true,
    forceLesson = true,
  } = opts
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ shell, practice, step, skipExplainers, clearNav, phonePhase, crossed, forceLesson, STATION_IDS }) => {
      localStorage.clear()
      sessionStorage.clear()
      if (shell) {
        localStorage.setItem('pa-shell-mode-v2', shell)
        if (shell === 'phone') localStorage.setItem('pa-phone-phase-v1', phonePhase)
      }
      if (crossed) sessionStorage.setItem('pa-crossed-threshold-v44', '1')
      if (practice) {
        localStorage.setItem('pa-practice-mode-v1', '1')
        localStorage.setItem('pa-practice-name-v1', 'Audit')
        localStorage.setItem('pa-student-journey-step-v1', String(step))
        if (forceLesson) localStorage.setItem('pa-practice-force-lesson-v1', '1')
      }
      if (clearNav) {
        localStorage.setItem('pa-nav-cues-seen-v1', '{}')
        sessionStorage.setItem('pa-nav-cues-seen-v1', '{}')
      }
      localStorage.setItem('pa-station-coach-seen-v1', '{}')
      if (skipExplainers) {
        const map = Object.fromEntries(STATION_IDS.map((id) => [id, true]))
        localStorage.setItem('pa-station-explainers-seen-v1', JSON.stringify(map))
      } else {
        localStorage.setItem('pa-station-explainers-seen-v1', '{}')
      }
    },
    { shell, practice, step, skipExplainers, clearNav, phonePhase, crossed, forceLesson, STATION_IDS },
  )
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' }).catch(() =>
    page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' }),
  )
  await page.waitForTimeout(600)
}

/* ───────────── 1) ModeChooser ───────────── */
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  page.setDefaultTimeout(20000)
  await seed(page, { shell: null, crossed: false, practice: false })
  await page.waitForSelector('.mode-chooser', { timeout: 15000 })
  await page.waitForTimeout(800)
  await shot(page, '01-modechooser-desktop-vp')
  const arrows = await page.locator('.mode-chooser .nav-arrow').count()
  const glow = await page.locator('.mode-chooser .nav-glow-cta').count()
  const doors = await page.locator('.mode-door, .mode-chooser .nav-glow-cta').count()
  const arrowColor = await page
    .locator('.mode-chooser .nav-arrow')
    .first()
    .evaluate((el) => getComputedStyle(el).color)
    .catch(() => '')
  if (arrows < 2) note('both', 'ModeChooser', 'high', `Expected ≥2 amber arrows, got ${arrows}`)
  if (glow < 2) note('both', 'ModeChooser', 'high', `Expected ≥2 nav glows, got ${glow}`)
  if (!/rgb\(\s*2(4[5-9]|5[0-5])/.test(arrowColor) && !/245|242|234|212|255/.test(arrowColor)) {
    /* soft check — amber-ish */
    note('both', 'ModeChooser', 'low', `Arrow color may not be amber: ${arrowColor}`)
  }
  await layoutProbe(page, 'both', 'ModeChooser', {
    brand: '.mode-chooser-logo, .mode-chooser-brand',
    title: '.mode-chooser-title',
    desktopDoor: '.mode-chooser-split > .nav-cue-target:first-child, .mode-door',
    phoneDoor: '.mode-chooser-split > .nav-cue-target:last-child',
  })
  console.log(JSON.stringify({ step: 'modechooser', arrows, glow, doors, arrowColor }))
  await page.close()
}

/* ───────────── 2) Desktop splash (pathways under door) ───────────── */
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  page.setDefaultTimeout(20000)
  await seed(page, { shell: 'course', crossed: false, practice: false })
  await page.waitForSelector('.threshold:not(.is-embedded)', { timeout: 15000 })
  /* wait for pathways live + tap */
  await page.waitForTimeout(2500)
  await shot(page, '02-desktop-splash-pathways')
  const probe = await layoutProbe(page, 'Desktop', 'Splash', {
    brand: '.threshold-brand, .threshold .brand-lockup, [class*="threshold-brand"]',
    door: '.threshold-door, .door-frame, .threshold-enter, button.threshold-enter',
    tap: '.threshold-hammer.is-tap-cue, .threshold-hammer',
    pathways: '.threshold-pathways',
    title: '.threshold-brand, .threshold h1, .threshold-title',
  })
  const pathways = probe.out.pathways
  const brand = probe.out.brand
  const tap = probe.out.tap
  if (pathways && brand && pathways.top < brand.bottom) {
    note('Desktop', 'Splash', 'high', 'Pathways still above/overlapping brand (PR#46 regression)', {
      pathwaysTop: pathways.top,
      brandBottom: brand.bottom,
    })
  }
  if (pathways && tap && pathways.top < tap.top - 20) {
    note('Desktop', 'Splash', 'med', 'Pathways sit above Tap — expected under door/TAP', {
      pathwaysTop: pathways.top,
      tapTop: tap.top,
    })
  }
  if (pathways && pathways.bottom > probe.vh - 4) {
    note('Desktop', 'Splash', 'med', 'Pathways clipped at bottom of viewport', pathways)
  }
  /* Verify CSS bottom placement */
  const cssTop = await page.locator('.threshold-pathways').evaluate((el) => {
    const cs = getComputedStyle(el)
    return { top: cs.top, bottom: cs.bottom, position: cs.position }
  })
  console.log(JSON.stringify({ step: 'desktop-splash', cssTop, pathways, brand, tap }))
  if (cssTop.top !== 'auto' && parseFloat(cssTop.top) < 40) {
    note('Desktop', 'Splash', 'high', `Pathways CSS top still pinned high: ${cssTop.top}`)
  }
  await page.close()
}

/* ───────────── 3) Phone splash (embedded) ───────────── */
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  page.setDefaultTimeout(20000)
  await seed(page, { shell: 'phone', phonePhase: 'splash', crossed: false, practice: false })
  await page.waitForTimeout(2000)
  await shot(page, '03-phone-splash-embedded')
  const hasPhone = await page.locator('.phone-shell, .is-phone-shell, .device-frame, .phone-frame').count()
  const embedded = await page.locator('.threshold.is-embedded').count()
  if (!embedded) note('Phone', 'Splash', 'high', 'Embedded threshold missing on phone splash phase')
  await layoutProbe(page, 'Phone', 'Splash', {
    pathways: '.threshold.is-embedded .threshold-pathways, .threshold-pathways',
    tap: '.threshold.is-embedded .threshold-hammer, .threshold-hammer',
    brand: '.threshold.is-embedded .threshold-brand, .threshold-brand',
  })
  /* Phone pathways should stay mid-lower (top ~72%) — not collide with brand */
  const phonePath = await page
    .locator('.threshold.is-embedded .threshold-pathways')
    .evaluate((el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return { top: r.top, cssTop: cs.top, bottom: r.bottom }
    })
    .catch(() => null)
  console.log(JSON.stringify({ step: 'phone-splash', hasPhone, embedded, phonePath }))
  await page.close()
}

/* ───────────── 4) Desktop toolbox / EnterBox ───────────── */
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  page.setDefaultTimeout(20000)
  await seed(page, { shell: 'course', crossed: true, practice: false, phonePhase: 'toolbox' })
  await page.waitForTimeout(1200)
  await shot(page, '04-desktop-toolbox')
  const practiceBtn = page.locator('button').filter({ hasText: /^Student Practice$/i })
  const continuePractice = page.locator('a, button').filter({ hasText: /Continue Student Practice/i })
  const desktopDoor = page.locator('button, a').filter({ hasText: /Desktop/i })
  const phoneDoor = page.locator('button, a').filter({ hasText: /Phone/i })
  const practiceVisible = await practiceBtn.first().isVisible().catch(() => false)
  const contVisible = await continuePractice.first().isVisible().catch(() => false)
  /* Student Practice tray may say Student Practice; chrome may say Continue Student Practice */
  if (!practiceVisible && !contVisible) {
    note('Desktop', 'Toolbox', 'high', 'Student Practice tray CTA not visible')
  }
  /* Escape doors */
  const body = await page.locator('body').innerText()
  if (!/Desktop/i.test(body) || !/Phone/i.test(body)) {
    note('Desktop', 'Toolbox', 'med', 'Desktop/Phone escape copy may be missing from toolbox')
  }
  const arrows = await page.locator('.nav-arrow').count()
  await layoutProbe(page, 'Desktop', 'Toolbox', {
    practice: 'button:has-text("Student Practice"), a:has-text("Continue Student Practice")',
    brand: '.enter-box, .toolbox, .workshop-brand, header',
  })
  console.log(
    JSON.stringify({
      step: 'desktop-toolbox',
      practiceVisible,
      contVisible,
      arrows,
      desktopDoor: await desktopDoor.count(),
      phoneDoor: await phoneDoor.count(),
    }),
  )
  await page.close()
}

/* ───────────── 5) Phone toolbox ───────────── */
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  page.setDefaultTimeout(20000)
  await seed(page, { shell: 'phone', phonePhase: 'toolbox', crossed: true, practice: false })
  await page.waitForTimeout(1500)
  await shot(page, '05-phone-toolbox')
  const practiceVisible = await page
    .locator('button')
    .filter({ hasText: /Student Practice|Continue Student Practice/i })
    .first()
    .isVisible()
    .catch(() => false)
  if (!practiceVisible) note('Phone', 'Toolbox', 'high', 'Student Practice tray not visible in phone toolbox')
  /* Check frame cutoff */
  const frame = await page
    .locator('.phone-screen, .device-screen, .phone-bezel, .is-phone-app')
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, height: r.height, overflow: el.scrollHeight > el.clientHeight + 4 }
    })
    .catch(() => null)
  const practiceRect = await page
    .locator('button')
    .filter({ hasText: /Student Practice|Continue Student Practice/i })
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, visible: r.height > 0 }
    })
    .catch(() => null)
  if (frame && practiceRect && practiceRect.bottom > frame.bottom + 2) {
    note('Phone', 'Toolbox', 'high', 'Practice CTA cut off by phone frame', { frame, practiceRect })
  }
  console.log(JSON.stringify({ step: 'phone-toolbox', practiceVisible, frame, practiceRect }))
  await page.close()
}

/* ───────────── 6) Practice hub Desktop + first stations ───────────── */
async function auditPractice(shell, labelPrefix) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  page.setDefaultTimeout(25000)
  await seed(page, {
    shell: shell === 'Phone' ? 'phone' : 'course',
    phonePhase: 'app',
    crossed: true,
    practice: true,
    step: 1,
    skipExplainers: true,
    clearNav: true,
  })
  await page.waitForTimeout(1500)
  await shot(page, `${labelPrefix}-practice-hub`)
  const hubText = await page.locator('body').innerText()
  if (!/station|path|practice|today|language|workplace/i.test(hubText)) {
    note(shell, 'PracticeHub', 'med', 'Hub text does not look like practice path')
  }
  /* Check for night-on-paper contrast failures: pale gold text on paper */
  const badInk = await page.evaluate(() => {
    const bad = []
    const nodes = document.querySelectorAll('h1,h2,h3,button,a,p,label,span')
    for (const el of nodes) {
      const r = el.getBoundingClientRect()
      if (r.width < 8 || r.height < 8) continue
      const c = getComputedStyle(el).color
      /* very pale gold on light: rgb high R G, low B, and light parent bg */
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) continue
      const [, R, G, B] = m.map(Number)
      if (R > 200 && G > 160 && B < 120) {
        let bg = 'rgb(255,255,255)'
        let p = el
        while (p) {
          const b = getComputedStyle(p).backgroundColor
          if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') {
            bg = b
            break
          }
          p = p.parentElement
        }
        const bm = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (bm) {
          const [, br, bgG, bb] = bm.map(Number)
          const lum = (0.299 * br + 0.587 * bgG + 0.114 * bb) / 255
          if (lum > 0.7) {
            bad.push({ text: (el.innerText || '').slice(0, 40), color: c, bg })
            if (bad.length >= 8) break
          }
        }
      }
    }
    return bad
  })
  if (badInk.length) {
    note(shell, 'PracticeHub', 'high', `Pale gold ink on paper (${badInk.length} samples)`, {
      samples: badInk.slice(0, 3),
    })
  }

  /* Enter first content station — Your Language (step 3 typically) */
  await seed(page, {
    shell: shell === 'Phone' ? 'phone' : 'course',
    phonePhase: 'app',
    crossed: true,
    practice: true,
    step: 3,
    skipExplainers: true,
    clearNav: true,
  })
  await page.waitForTimeout(1800)
  await shot(page, `${labelPrefix}-station-lang-skip-explainer`)
  /* English-first chips */
  const chips = page.locator('button').filter({ hasText: /English|Español|አማርኛ|العربية|Français/ })
  const chipCount = await chips.count()
  if (chipCount) {
    const texts = await chips.allTextContents()
    await shot(page, `${labelPrefix}-language-pick`)
    const first = (texts[0] || '').trim()
    if (!/^English/i.test(first) && !texts.some((t, i) => i === 0 && /English/i.test(t))) {
      /* Check order: English should be first among language chips */
      const engIdx = texts.findIndex((t) => /English/i.test(t))
      if (engIdx > 0) {
        note(shell, 'LanguagePick', 'high', `English not first among chips (idx=${engIdx})`, { texts })
      }
    }
    console.log(JSON.stringify({ step: `${labelPrefix}-lang`, texts: texts.slice(0, 8) }))
  } else {
    /* May be mid-station — try workplace words */
    note(shell, 'LanguagePick', 'low', 'No language chips visible at step 3 (may be past pick)')
  }

  /* Nav marks on language / hub */
  const navArrows = await page.locator('.nav-arrow').count()
  console.log(JSON.stringify({ step: `${labelPrefix}-hub-nav`, navArrows, chipCount }))

  /* Explainer gate + coach */
  await seed(page, {
    shell: shell === 'Phone' ? 'phone' : 'course',
    phonePhase: 'app',
    crossed: true,
    practice: true,
    step: 3,
    skipExplainers: false,
    clearNav: true,
  })
  await page.waitForTimeout(2000)
  const explainer = page.locator('.station-explainer')
  const explainerVisible = await explainer.isVisible().catch(() => false)
  await shot(page, `${labelPrefix}-explainer-gate`)
  if (!explainerVisible) {
    note(shell, 'Explainer', 'med', 'Station explainer gate not shown on first visit')
  } else {
    const video = page.locator('.station-explainer-video, .station-explainer video')
    if (!(await video.first().isVisible().catch(() => false))) {
      note(shell, 'Explainer', 'med', 'Explainer visible but video missing')
    }
    /* dismiss */
    await page.evaluate(() => {
      const v = document.querySelector('.station-explainer-video, .station-explainer video')
      if (v) {
        v.dispatchEvent(new Event('ended'))
        v.dispatchEvent(new Event('error'))
      }
    })
    await page.waitForTimeout(400)
    const cont = page.locator(
      '.station-explainer button.btn-primary, .station-explainer button:has-text("Skip"), .station-explainer button:has-text("Continue")',
    )
    if (await cont.count()) await cont.first().click().catch(() => {})
    await page.waitForTimeout(1000)
  }
  await shot(page, `${labelPrefix}-after-explainer`)
  /* Coach overlay */
  const coach = page.locator('.station-coach, [class*="coach"], .first-run-coach')
  const coachVisible = await coach.first().isVisible().catch(() => false)
  if (coachVisible) await shot(page, `${labelPrefix}-station-coach`)
  console.log(JSON.stringify({ step: `${labelPrefix}-explainer`, explainerVisible, coachVisible }))

  /* Workplace Words station */
  await seed(page, {
    shell: shell === 'Phone' ? 'phone' : 'course',
    phonePhase: 'app',
    crossed: true,
    practice: true,
    step: 4,
    skipExplainers: true,
    clearNav: false,
  })
  await page.waitForTimeout(1500)
  await shot(page, `${labelPrefix}-workplace-words`)
  await layoutProbe(page, shell, 'WorkplaceWords', {
    primary: 'button.btn-primary, .train-continue, button:has-text("Continue"), button:has-text("Check")',
  })

  await page.close()
}

await auditPractice('Desktop', '06d')
await auditPractice('Phone', '06p')

/* ───────────── 7) Live Pages ModeChooser reflection (read-only) ───────────── */
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  try {
    await page.goto(`https://levizigza.github.io/Purpose-Academy-Application/?nocache=${Date.now()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await page.waitForTimeout(1500)
    await shot(page, '07-live-modechooser')
    /* Enter desktop and check splash pathways on LIVE (should still be wrong until #46 merges) */
    const enter = page.getByText(/ENTER DESKTOP|Desktop mode|Enter desktop/i).first()
    if (await enter.isVisible().catch(() => false)) {
      await enter.click()
      await page.waitForTimeout(2500)
      await shot(page, '07-live-desktop-splash')
      const cssTop = await page
        .locator('.threshold-pathways')
        .evaluate((el) => {
          const cs = getComputedStyle(el)
          const r = el.getBoundingClientRect()
          return { top: cs.top, bottom: cs.bottom, rectTop: r.top, rectBottom: r.bottom }
        })
        .catch(() => null)
      console.log(JSON.stringify({ step: 'live-splash', cssTop }))
      note(
        'Live',
        'Splash',
        'info',
        `Live Pages pathways CSS (pre-#46 merge expected top-pinned): ${JSON.stringify(cssTop)}`,
      )
    }
  } catch (e) {
    note('Live', 'Pages', 'low', `Could not fetch live Pages: ${e.message}`)
  }
  await page.close()
}

await writeFile(path.join(OUT, 'findings.json'), JSON.stringify({ findings, total: findings.length }, null, 2))
console.log('\n=== SUMMARY ===')
const bySev = { high: 0, med: 0, low: 0, info: 0 }
for (const f of findings) bySev[f.severity] = (bySev[f.severity] || 0) + 1
console.log(JSON.stringify(bySev))
for (const f of findings.filter((x) => x.severity === 'high' || x.severity === 'med')) {
  console.log(`- [${f.severity}] ${f.shell}/${f.surface}: ${f.msg}`)
}

await browser.close()
process.exit(findings.some((f) => f.severity === 'high') ? 1 : 0)
