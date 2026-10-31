/**
 * Smoke: Workplace Words pick + type + shuffle (Desktop night + Phone paper).
 */
import { chromium } from 'playwright'
import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://127.0.0.1:5173/Purpose-Academy-Application'
const OUT = '/tmp/vv-pick-smoke/out'
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

async function chipTexts(page) {
  return page.locator('.vocab-sheet-pick-chip').evaluateAll((els) =>
    els.map((el) => el.textContent.replace(/\s+/g, ' ').trim()),
  )
}

function chipWord(label) {
  return label.replace(/^[A-E]\.\s*/, '').trim()
}

async function bridgeToType(page) {
  await page.locator('.vocab-sheet-lang-btn').first().click()
  await page.waitForSelector('.vocab-sheet-type-input', { timeout: 20000 })
  await page.waitForSelector('.vocab-sheet-pick-chip', { timeout: 20000 })
}

async function findCorrectByProbing(page) {
  const chips = page.locator('.vocab-sheet-pick-chip')
  const n = await chips.count()
  for (let i = 0; i < n; i++) {
    const before = await chipTexts(page)
    await chips.nth(i).click()
    await page.waitForTimeout(280)
    if ((await page.locator('.vocab-sheet-pick-chip.is-picked').count()) > 0) {
      return chipWord(await page.locator('.vocab-sheet-pick-chip.is-picked').innerText())
    }
    const after = await chipTexts(page)
    if (before.join('|') !== after.join('|')) {
      /* was wrong — bank reshuffled; continue probing new bank */
      return findCorrectByProbing(page)
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
  await bridgeToType(page)

  const chips = page.locator('.vocab-sheet-pick-chip')
  const n = await chips.count()
  note(`pick chips visible: ${n}`)
  if (n < 2 || n > 5) throw new Error(`expected 2–5 chips, got ${n}`)

  /* Go without pick → soft miss */
  await page.locator('.vocab-sheet-type-input').fill('Nope')
  await page.locator('.vocab-sheet-type-check').click()
  await page.waitForTimeout(350)
  const needPick = await page
    .locator('.play-soft-miss')
    .filter({ hasText: /pick the matching/i })
    .count()
  note(`Go without pick soft-miss: ${needPick > 0}`)
  if (!needPick) throw new Error('expected soft miss when Go without pick')
  await page.screenshot({ path: join(OUT, `${shell}-01-pick-bank.png`) })

  /* Discover correct by probing (also proves reshuffle on wrongs) */
  const beforeProbe = await chipTexts(page)
  note(`order start: ${JSON.stringify(beforeProbe)}`)

  /* Force a wrong pick first: click chip 0; if correct, click chip 1 after reload of bank */
  let reshuffled = false
  {
    const before = await chipTexts(page)
    await chips.nth(0).click()
    await page.waitForTimeout(320)
    if ((await page.locator('.vocab-sheet-pick-chip.is-picked').count()) > 0) {
      note('first chip was correct — reshuffle demo via known-wrong on fresh card')
      const answer = chipWord(await page.locator('.vocab-sheet-pick-chip.is-picked').innerText())
      await page.evaluate(() => {
        localStorage.setItem('pa-student-journey-step-v1', '6')
      })
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForSelector('.vocab-sheet, [data-coach="vv-lang"]', { timeout: 30000 })
      await bridgeToType(page)
      const chipsB = page.locator('.vocab-sheet-pick-chip')
      const nb = await chipsB.count()
      for (let i = 0; i < nb; i++) {
        const w = chipWord(await chipsB.nth(i).innerText())
        if (w.toLowerCase() === answer.toLowerCase()) continue
        const b0 = await chipTexts(page)
        await chipsB.nth(i).click()
        await page.waitForTimeout(320)
        const b1 = await chipTexts(page)
        if (b0.join('|') !== b1.join('|')) {
          reshuffled = true
          note(`wrong pick reshuffled: ${JSON.stringify(b0)} → ${JSON.stringify(b1)}`)
          break
        }
      }
      await page.screenshot({ path: join(OUT, `${shell}-02-reshuffle.png`) })
      /* pick correct + type */
      const chipsC = page.locator('.vocab-sheet-pick-chip')
      const nc = await chipsC.count()
      for (let i = 0; i < nc; i++) {
        const w = chipWord(await chipsC.nth(i).innerText())
        if (w.toLowerCase() === answer.toLowerCase()) {
          await chipsC.nth(i).click()
          break
        }
      }
      await page.locator('.vocab-sheet-type-input').fill(answer)
      await page.locator('.vocab-sheet-type-check').click()
      await page.waitForTimeout(700)
      const ok = await page.locator('.vocab-sheet-en.is-linked, .vocab-sheet-type-fb.is-ok').count()
      note(`cleared after pick+type: ${ok > 0}`)
      if (!ok) throw new Error('pick+type did not clear')
      if (!reshuffled) throw new Error('expected reshuffle after wrong pick')
      await page.screenshot({ path: join(OUT, `${shell}-03-cleared.png`) })
      await context.close()
      return { chipCount: n, reshuffled, answer }
    }
    const after = await chipTexts(page)
    if (before.join('|') !== after.join('|')) {
      reshuffled = true
      note(`wrong pick reshuffled: ${JSON.stringify(before)} → ${JSON.stringify(after)}`)
    } else {
      throw new Error('first chip neither picked nor reshuffled')
    }
  }

  await page.screenshot({ path: join(OUT, `${shell}-02-reshuffle.png`) })
  const answer = await findCorrectByProbing(page)
  note(`picked correct: ${answer}`)
  await page.locator('.vocab-sheet-type-input').fill(answer)
  await page.locator('.vocab-sheet-type-check').click()
  await page.waitForTimeout(700)
  const ok = await page.locator('.vocab-sheet-en.is-linked, .vocab-sheet-type-fb.is-ok').count()
  note(`cleared after pick+type: ${ok > 0}`)
  if (!ok) throw new Error('pick+type did not clear')
  if (!reshuffled) throw new Error('expected reshuffle after wrong pick')
  await page.screenshot({ path: join(OUT, `${shell}-03-cleared.png`) })
  await context.close()
  return { chipCount: n, reshuffled, answer }
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
      const dest = join(ART, destName.startsWith('vv-') ? destName : `vv-pick-${destName}`)
      copyFileSync(p, dest)
      console.log('artifact', dest)
    }
  }
}
collect(OUT)
