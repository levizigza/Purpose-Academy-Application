/**
 * Smoke: Workplace Words English hear chip (Desktop night + Phone paper).
 * Asserts EN is on the row, press plays English bridge → pick+type unlock,
 * and the five mother tongues remain.
 */
import { chromium } from 'playwright'
import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.PA_BASE || 'http://127.0.0.1:4173'
const OUT = '/tmp/vv-en-hear-smoke/out'
const ART = '/opt/cursor/artifacts'
mkdirSync(OUT, { recursive: true })
mkdirSync(ART, { recursive: true })

const EXPLAINERS = [
  'workplace-words',
  'language-organize',
  'eye-spy',
  'sentence-structure',
  'word-action',
  'picture-match',
  'sentence-match',
  'workplace-instructions',
  'computer-skills',
  'site-language',
  'safety',
  'tools',
  'systems',
  'equipment',
  'your-language',
]

const EXPECTED = ['English', 'Amharic', 'Tigrinya', 'Arabic', 'Spanish', 'Hindi']

async function gotoVocab(page, shell) {
  await page.addInitScript(
    ({ shell, explainers }) => {
      localStorage.setItem('pa-shell-mode-v2', shell === 'phone' ? 'phone' : 'course')
      if (shell === 'phone') {
        localStorage.setItem('pa-phone-phase-v1', 'app')
        sessionStorage.setItem('pa-phone-phase-v1', 'app')
      } else {
        localStorage.setItem('pa-desktop-phase-v1', 'ready')
        sessionStorage.setItem('pa-desktop-phase-v1', 'ready')
      }
      sessionStorage.setItem('pa-crossed-threshold-v44', '1')
      localStorage.setItem('pa-practice-mode-v1', '1')
      localStorage.setItem('pa-practice-name-v1', 'DemoLearner')
      localStorage.setItem('pa-practice-force-lesson-v1', '1')
      localStorage.setItem('pa-student-journey-step-v1', '6')
      localStorage.setItem('pa-active-pathway-v1', 'construction')
      localStorage.setItem(
        'pa-station-coach-seen-v1',
        JSON.stringify(Object.fromEntries(explainers.map((id) => [id, true]))),
      )
      localStorage.setItem(
        'pa-station-explainers-seen-v1',
        JSON.stringify(Object.fromEntries(explainers.map((id) => [id, true]))),
      )
      localStorage.setItem('pa-nav-cues-seen-v1', JSON.stringify({ all: true }))
    },
    { shell, explainers: EXPLAINERS },
  )
  await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForSelector('.vocab-sheet, [data-coach="vv-lang"]', { timeout: 30000 })
}

function chipWord(label) {
  return label.replace(/^[A-E]\.\s*/, '').trim()
}

async function langNames(page) {
  return page.locator('.vocab-sheet-lang-name').evaluateAll((els) =>
    els.map((el) => el.textContent.replace(/\s+/g, ' ').trim()),
  )
}

async function chipTexts(page) {
  return page.locator('.vocab-sheet-pick-chip').evaluateAll((els) =>
    els.map((el) => el.textContent.replace(/\s+/g, ' ').trim()),
  )
}

async function findCorrectByProbing(page, depth = 0) {
  if (depth > 12) throw new Error('could not discover correct option')
  const chips = page.locator('.vocab-sheet-pick-chip')
  const n = await chips.count()
  for (let i = 0; i < n; i++) {
    const before = await chipTexts(page)
    await chips.nth(i).click()
    await page.waitForTimeout(300)
    if ((await page.locator('.vocab-sheet-pick-chip.is-picked').count()) > 0) {
      return chipWord(await page.locator('.vocab-sheet-pick-chip.is-picked').innerText())
    }
    const after = await chipTexts(page)
    if (before.join('|') !== after.join('|')) {
      return findCorrectByProbing(page, depth + 1)
    }
  }
  throw new Error('could not discover correct option')
}

async function runShell(browser, shell) {
  const context = await browser.newContext({
    viewport: shell === 'phone' ? { width: 430, height: 900 } : { width: 1280, height: 900 },
    recordVideo: {
      dir: join(OUT, `video-${shell}`),
      size: shell === 'phone' ? { width: 430, height: 900 } : { width: 1280, height: 900 },
    },
  })
  const page = await context.newPage()
  const note = (m) => console.log(`[${shell}] ${m}`)

  await gotoVocab(page, shell)
  await page.waitForSelector('.vocab-sheet-lang-btn', { timeout: 20000 })

  const names = await langNames(page)
  note(`hear langs: ${JSON.stringify(names)}`)
  if (names.length !== 6) throw new Error(`expected 6 hear chips, got ${names.length}`)
  for (const lang of EXPECTED) {
    if (!names.includes(lang)) throw new Error(`missing hear chip: ${lang}`)
  }
  if (names[0] !== 'English') throw new Error(`English should be first, got ${names[0]}`)

  const enBtn = page.locator('.vocab-sheet-lang-btn.is-en-hear, .vocab-sheet-lang-btn').filter({
    has: page.locator('.vocab-sheet-lang-name', { hasText: /^English$/i }),
  }).first()
  await page.screenshot({ path: join(OUT, `${shell}-01-six-chips.png`), fullPage: true })

  await enBtn.click()
  /* EN bridge marks heard and unlocks pick+type (no second Hear English required). */
  await page.waitForSelector('.vocab-sheet-type-input', { timeout: 20000 })
  await page.waitForSelector('.vocab-sheet-pick-chip', { timeout: 20000 })
  note('EN press unlocked pick+type')

  const selected = await page.locator('.vocab-sheet-lang-btn.is-selected .vocab-sheet-lang-name').innerText()
  note(`selected: ${selected.trim()}`)
  if (selected.trim().toLowerCase() !== 'english') throw new Error('EN chip not selected after press')

  await page.screenshot({ path: join(OUT, `${shell}-02-en-typed-phase.png`), fullPage: true })

  const answer = await findCorrectByProbing(page)
  note(`picked: ${answer}`)
  await page.locator('.vocab-sheet-type-input').fill(answer)
  await page.locator('.vocab-sheet-type-check').click()
  await page.waitForTimeout(700)
  const ok = await page.locator('.vocab-sheet-en.is-linked, .vocab-sheet-type-fb.is-ok').count()
  note(`cleared after EN→pick+type: ${ok > 0}`)
  if (!ok) throw new Error('EN bridge did not clear after pick+type')
  await page.screenshot({ path: join(OUT, `${shell}-03-cleared.png`), fullPage: true })

  await context.close()
  return { langs: names, answer, cleared: true }
}

const browser = await chromium.launch({ headless: true })
let summary
try {
  const desktop = await runShell(browser, 'desktop')
  const phone = await runShell(browser, 'phone')
  summary = { desktop, phone, ok: true }
  console.log('\n=== SUMMARY ===')
  console.log(JSON.stringify(summary, null, 2))
} catch (err) {
  console.error('SMOKE FAILED', err)
  summary = { ok: false, error: String(err) }
  process.exitCode = 1
} finally {
  await browser.close()
}

function collect(dir, prefix = '') {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name)
    if (name.isDirectory()) {
      collect(p, prefix ? `${prefix}-${name.name}` : name.name)
    } else if (name.name.endsWith('.png') || name.name.endsWith('.webm')) {
      const destName = prefix ? `${prefix}-${name.name}` : name.name
      const dest = join(ART, destName.startsWith('vv-en-') ? destName : `vv-en-hear-${destName}`)
      copyFileSync(p, dest)
      console.log('artifact', dest)
    }
  }
}
collect(OUT)
