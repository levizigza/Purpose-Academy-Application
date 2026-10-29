/**
 * Smoke: Workplace Words More languages (universal hear) — Desktop + Phone.
 * Opens search → French → expects translated status + pick+type unlock.
 */
import { chromium } from 'playwright'
import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.PA_BASE || 'http://127.0.0.1:4173'
const OUT = '/tmp/vv-universal-hear-smoke/out'
const ART = '/opt/cursor/artifacts'
mkdirSync(OUT, { recursive: true })
mkdirSync(ART, { recursive: true })

const EXPLAINERS = [
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
  'equipment',
  'your-language',
]

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

async function findCorrectByProbing(page, depth = 0) {
  if (depth > 8) throw new Error('pick probe exhausted')
  const chips = page.locator('.vocab-sheet-pick-chip')
  const n = await chips.count()
  const before = await chips.evaluateAll((els) => els.map((el) => el.textContent))
  for (let i = 0; i < n; i++) {
    await chips.nth(i).click()
    await page.waitForTimeout(280)
    if ((await page.locator('.vocab-sheet-pick-chip.is-picked').count()) > 0) {
      return chipWord(await page.locator('.vocab-sheet-pick-chip.is-picked').innerText())
    }
    const after = await chips.evaluateAll((els) => els.map((el) => el.textContent))
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
  await page.waitForSelector('.vocab-universal-toggle', { timeout: 20000 })
  await page.screenshot({ path: join(OUT, `${shell}-01-more-languages.png`), fullPage: true })

  await page.locator('.vocab-universal-toggle').click()
  await page.waitForSelector('.vocab-universal-search', { timeout: 10000 })
  await page.locator('.vocab-universal-search').fill('French')
  await page.waitForTimeout(200)
  const fr = page.locator('.vocab-universal-option', { hasText: /French/i }).first()
  await fr.click()

  /* Translate + speak may take a few seconds (MyMemory / TTS). */
  await page.waitForSelector('.vocab-universal-status.is-ok, .vocab-sheet-type-input', {
    timeout: 45000,
  })
  const status = (await page.locator('.vocab-universal-status').innerText().catch(() => '')).trim()
  note(`status: ${status.slice(0, 120)}`)
  await page.screenshot({ path: join(OUT, `${shell}-02-translated.png`), fullPage: true })

  await page.waitForSelector('.vocab-sheet-type-input', { timeout: 25000 })
  await page.waitForSelector('.vocab-sheet-pick-chip', { timeout: 20000 })
  note('universal bridge unlocked pick+type')

  const answer = await findCorrectByProbing(page)
  note(`picked: ${answer}`)
  await page.locator('.vocab-sheet-type-input').fill(answer)
  await page.locator('.vocab-sheet-type-check').click()
  await page.waitForTimeout(700)
  const ok = await page.locator('.vocab-sheet-en.is-linked, .vocab-sheet-type-fb.is-ok').count()
  if (!ok) throw new Error('universal bridge did not clear after pick+type')
  note('cleared')
  await page.screenshot({ path: join(OUT, `${shell}-03-cleared.png`), fullPage: true })

  await context.close()
  return { status, answer, cleared: true }
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
      copyFileSync(p, join(ART, `vv_universal_${destName}`))
    }
  }
}
collect(OUT)
console.log('artifacts →', ART)
