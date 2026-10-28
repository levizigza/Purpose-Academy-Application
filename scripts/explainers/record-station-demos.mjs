/**
 * Record ALL contentful Practice stations as real-UI mouse demos + JennyNeural VO.
 *
 * Usage:
 *   PA_BASE=http://127.0.0.1:5173/Purpose-Academy-Application \
 *     node scripts/explainers/record-station-demos.mjs
 *   PA_ONLY=workplace-words,eye-spy node scripts/explainers/record-station-demos.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  ALL_EXPLAINER_IDS,
  buildVoTrack,
  clickAt,
  durationOf,
  gotoStation,
  moveTo,
  mux,
  recordWithBrowser,
  typeInto,
  W,
  H,
} from './demo-lib.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const BASE = process.env.PA_BASE || 'http://127.0.0.1:5173/Purpose-Academy-Application'
const WORK_ROOT = process.env.PA_DEMO_WORK || '/tmp/station-demos'
const ONLY = (process.env.PA_ONLY || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

mkdirSync(WORK_ROOT, { recursive: true })
mkdirSync(join(ROOT, 'public/explainers'), { recursive: true })
mkdirSync('/opt/cursor/artifacts', { recursive: true })

/** @type {Record<string, { title: string, step: number, pathway?: string, beats: {id:string,text:string}[], scene: (page: import('playwright').Page) => Promise<void> }>} */
const STATIONS = {
  'your-language': {
    title: 'Your Language',
    step: 3,
    beats: [
      { id: 'intro', text: 'Your Language. We start in English.' },
      {
        id: 'mark',
        text: 'A mark points at the language chips once. Stay in English, or press the language you understand best.',
      },
      { id: 'continue', text: 'Then continue. The next path questions speak that language.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 3 })
      await page.waitForSelector('.train-lang-grid, .train-lang', { timeout: 30000 })
      await page.waitForTimeout(1000)
      const english = page.locator('.train-lang').filter({ hasText: /English|EN/i }).first()
      await moveTo(page, english, { steps: 36, settle: 800 })
      await page.waitForTimeout(1400)
      const spanish = page.locator('.train-lang').filter({ hasText: /Spanish|Español|ES/i }).first()
      await clickAt(page, spanish, { steps: 40, settle: 400, after: 1200 })
      await clickAt(page, english, { steps: 28, settle: 350, after: 900 })
      const cont = page.locator('button.btn-primary, button:has-text("Continue")').first()
      if (await cont.isVisible().catch(() => false)) {
        await moveTo(page, cont, { steps: 24, settle: 600 })
        await page.waitForTimeout(1000)
      } else {
        await page.waitForTimeout(1200)
      }
    },
  },

  'workplace-words': {
    title: 'Workplace Words',
    step: 6,
    beats: [
      { id: 'intro', text: 'Workplace Words. One picture. One word. No rush.' },
      {
        id: 'lang',
        text: 'Press the language you understand. Hear it in your tongue.',
      },
      { id: 'hear', text: 'Then hear the English workplace word.' },
      { id: 'type', text: 'Type what you heard. Soft try again if not yet. That is the whole loop.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 6 })
      await page.waitForSelector('.vocab-sheet, [data-coach="vv-lang"]', { timeout: 30000 })
      await page.waitForTimeout(800)
      const langRow = page.locator('[data-coach="vv-lang"]').first()
      await moveTo(page, langRow, { steps: 30, settle: 500 })
      const langButtons = page.locator('[data-coach="vv-lang"] button, .vocab-sheet-lang-btn')
      const pick =
        (await langButtons.filter({ hasText: /Spanish/i }).first().isVisible().catch(() => false))
          ? langButtons.filter({ hasText: /Spanish/i }).first()
          : langButtons.first()
      await clickAt(page, pick, { steps: 24, settle: 400, after: 1600 })
      const hear = page.locator('button:has-text("Hear English"), [data-coach="vv-hear"]').first()
      if (await hear.isVisible().catch(() => false)) {
        await moveTo(page, hear, { steps: 22, settle: 500 })
        await page.waitForTimeout(900)
      } else {
        await page.waitForTimeout(1000)
      }
      await page.waitForSelector('[data-coach="vv-type"] input, .vocab-sheet-type-input', {
        timeout: 20000,
      })
      const input = page.locator('[data-coach="vv-type"] input, .vocab-sheet-type-input').first()
      await typeInto(page, input, 'Hammer', { delay: 130 })
      const go = page.locator('.vocab-sheet-type-check, button:has-text("Go")').first()
      await clickAt(page, go, { steps: 20, settle: 300, after: 1600 })
      await page.waitForTimeout(900)
    },
  },

  'language-organize': {
    title: 'Language Organize',
    step: 7,
    beats: [
      { id: 'intro', text: 'Language Organize. Match pictures to their words.' },
      { id: 'pick', text: 'Pick a picture. Place it on the empty box for that word.' },
      { id: 'retry', text: 'Wrong place? Soft shake — try again. Clear the round, then the next.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 7 })
      await page.waitForSelector('.vocab-organize, [data-coach="org-pic"]', { timeout: 30000 })
      await page.waitForTimeout(900)
      const pic = page.locator('[data-coach="org-pic"]').first()
      const termId = await pic.getAttribute('data-term-id')
      await clickAt(page, pic, { steps: 28, settle: 400, after: 700 })
      const drop = termId
        ? page.locator(`[data-coach="org-drop"][data-box-id="${termId}"]`).first()
        : page.locator('[data-coach="org-drop"]').first()
      await clickAt(page, drop, { steps: 30, settle: 400, after: 1400 })
      /* Second picture if still available */
      const pic2 = page.locator('.vocab-organize-piece.is-image').first()
      if (await pic2.isVisible().catch(() => false)) {
        const id2 = await pic2.getAttribute('data-term-id')
        await clickAt(page, pic2, { steps: 22, settle: 300, after: 500 })
        const drop2 = id2
          ? page.locator(`.vocab-organize-slot[data-box-id="${id2}"]`).first()
          : page.locator('.vocab-organize-slot:not(.is-filled)').first()
        if (await drop2.isVisible().catch(() => false)) {
          await clickAt(page, drop2, { steps: 24, settle: 300, after: 1200 })
        }
      }
      await page.waitForTimeout(800)
    },
  },

  'eye-spy': {
    title: 'English Eye Spy',
    step: 8,
    beats: [
      { id: 'intro', text: 'English Eye Spy. Clear the board.' },
      { id: 'pic', text: 'Tap a picture on the job site. Then tap its English name.' },
      { id: 'match', text: 'A correct pair disappears. Soft try again if not yet. Clear every pair to continue.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 8 })
      await page.waitForSelector('[data-coach="spy-pic"], .eye-spy', { timeout: 30000 })
      await page.waitForTimeout(900)
      const pic = page.locator('[data-coach="spy-pic"]').first()
      await clickAt(page, pic, { steps: 26, settle: 400, after: 800 })
      const word = page.locator('[data-coach="spy-word"] button, [data-coach="spy-word"] .choice-btn').first()
      /* Prefer matching word if we can read the hotspot label */
      const label = ((await pic.getAttribute('aria-label')) || '').replace(/picture|hotspot|press/gi, '').trim()
      let wordBtn = word
      if (label) {
        const match = page.locator('[data-coach="spy-word"] button, [data-coach="spy-word"] .choice-btn').filter({
          hasText: new RegExp(label.split(/\s+/)[0] || 'Hammer', 'i'),
        })
        if (await match.first().isVisible().catch(() => false)) wordBtn = match.first()
      }
      /* Try Hammer as construction default if unknown */
      const hammer = page.locator('[data-coach="spy-word"] button, [data-coach="spy-word"] .choice-btn').filter({
        hasText: /Hammer/i,
      })
      if (await hammer.first().isVisible().catch(() => false)) wordBtn = hammer.first()
      await clickAt(page, wordBtn, { steps: 24, settle: 350, after: 700 })
      const matchBtn = page.locator('[data-coach="spy-match"], button:has-text("Match")').first()
      if (await matchBtn.isVisible().catch(() => false)) {
        await clickAt(page, matchBtn, { steps: 22, settle: 300, after: 1400 })
      }
      await page.waitForTimeout(900)
    },
  },

  'sentence-structure': {
    title: 'Sentence Structure',
    step: 9,
    beats: [
      { id: 'intro', text: 'Sentence Structure. Four words. Type the match.' },
      { id: 'read', text: 'Read the sentence. Look at the four choices at the bottom.' },
      { id: 'type', text: 'Type the word that fits the blank. Soft try again if not yet.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 9 })
      await page.waitForSelector(
        '.sentence-cloze, [data-coach="sent-type"], .word-action-card, [data-coach="choice-opt"]',
        { timeout: 30000 },
      )
      await page.waitForTimeout(900)
      const typeOpen = await page.locator('[data-coach="sent-type"] input, .sentence-cloze-type-input').first().isVisible().catch(() => false)
      if (typeOpen) {
        const chips = page.locator('.sentence-cloze-chip span:not(.sentence-cloze-chip-letter)')
        const firstChip = ((await chips.nth(0).textContent()) || '').trim()
        /* Prefer a short English tool word if present */
        let answer = firstChip
        for (const w of ['Hammer', 'Drill', 'Saw', 'Level', 'Tape']) {
          const hit = page.locator('.sentence-cloze-chip').filter({ hasText: new RegExp(`^\\s*[A-D]\\.\\s*${w}\\s*$|${w}`, 'i') })
          if (await hit.first().isVisible().catch(() => false)) {
            answer = w
            break
          }
        }
        const chipTexts = await page.locator('.sentence-cloze-chip').allTextContents()
        const cleaned = chipTexts.map((t) => t.replace(/^[A-D]\.\s*/i, '').trim()).filter(Boolean)
        if (cleaned.length) answer = cleaned.find((t) => /hammer|drill|saw|level|tape|hard|ppe|safety/i.test(t)) || cleaned[0]
        await moveTo(page, page.locator('.sentence-cloze-choices').first(), { steps: 20, settle: 500 })
        await page.waitForTimeout(800)
        const input = page.locator('[data-coach="sent-type"] input, .sentence-cloze-type-input').first()
        await typeInto(page, input, answer, { delay: 110 })
        const go = page.locator('.sentence-cloze-type-go, button:has-text("Go")').first()
        await clickAt(page, go, { steps: 18, settle: 280, after: 1500 })
        /* Soft retry with another option if miss */
        const retry = page.locator('.play-soft-miss').first()
        if (await retry.isVisible().catch(() => false)) {
          const alt = cleaned.find((t) => t !== answer) || 'Hammer'
          await page.locator('[data-coach="sent-type"] input').first().fill('')
          await typeInto(page, input, alt, { delay: 100 })
          await clickAt(page, go, { steps: 16, settle: 250, after: 1400 })
        }
      } else {
        /* No cloze bank — land on word-action in same step */
        const opt = page.locator('[data-coach="choice-opt"] button').first()
        await clickAt(page, opt, { steps: 24, settle: 400, after: 1200 })
      }
      await page.waitForTimeout(800)
    },
  },

  'word-action': {
    title: 'Word → Action',
    step: 9,
    beats: [
      { id: 'intro', text: 'Word to Action. Connect the tool to the job.' },
      { id: 'see', text: 'See the action. Choose which tool it uses.' },
      { id: 'pick', text: 'One clear pick. Soft try again. Then continue.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 9 })
      await page.waitForTimeout(1000)
      /* Skip sentence phase into actions when present */
      const skip = page.locator('button:has-text("Skip to actions"), button:has-text("Word → Action"), button:has-text("Continue to actions")').first()
      if (await skip.isVisible().catch(() => false)) {
        await clickAt(page, skip, { steps: 22, settle: 300, after: 1200 })
      }
      /* Or complete one sentence then continue */
      const input = page.locator('[data-coach="sent-type"] input').first()
      if (await input.isVisible().catch(() => false)) {
        const chips = await page.locator('.sentence-cloze-chip').allTextContents()
        const cleaned = chips.map((t) => t.replace(/^[A-D]\.\s*/i, '').trim()).filter(Boolean)
        const answer = cleaned.find((t) => /Hammer/i.test(t)) || cleaned[0] || 'Hammer'
        await typeInto(page, input, answer, { delay: 90 })
        await clickAt(page, page.locator('.sentence-cloze-type-go').first(), {
          steps: 16,
          settle: 200,
          after: 1000,
        })
        const cont = page
          .locator('button:has-text("Continue"), button:has-text("actions"), button:has-text("Word")')
          .first()
        if (await cont.isVisible().catch(() => false)) {
          await clickAt(page, cont, { steps: 20, settle: 300, after: 1200 })
        }
      }
      await page.waitForSelector('.word-action-card, [data-coach="choice-opt"]', { timeout: 25000 })
      await page.waitForTimeout(700)
      /* Hammer is first action for construction */
      const hammer = page.locator('[data-coach="choice-opt"] button').filter({ hasText: /^Hammer$/i })
      const btn = (await hammer.first().isVisible().catch(() => false))
        ? hammer.first()
        : page.locator('[data-coach="choice-opt"] button').first()
      await clickAt(page, btn, { steps: 26, settle: 400, after: 1400 })
      await page.waitForTimeout(800)
    },
  },

  'supported-practice': {
    title: 'Supported Practice',
    step: 10,
    beats: [
      { id: 'intro', text: 'Supported Practice. Match with help.' },
      { id: 'match', text: 'Match words to pictures. Help is there if you need it.' },
      { id: 'retry', text: 'Mistakes teach. Soft try again. No exam theatre.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 10 })
      await page.waitForSelector('[data-coach="choice-opt"], .train-choice-grid', { timeout: 30000 })
      await page.waitForTimeout(900)
      const hammer = page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').filter({
        hasText: /^Hammer$/i,
      })
      const btn = (await hammer.first().isVisible().catch(() => false))
        ? hammer.first()
        : page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').first()
      await clickAt(page, btn, { steps: 26, settle: 400, after: 1500 })
      await page.waitForTimeout(800)
    },
  },

  'workplace-instructions': {
    title: 'Workplace Instructions',
    step: 11,
    beats: [
      { id: 'intro', text: 'Workplace Instructions. Hear a direction. Show you understood.' },
      { id: 'hear', text: 'Press Hear English at least once.' },
      { id: 'pick', text: 'Then choose what you should do. Soft try again if not yet.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 11 })
      await page.waitForSelector('.train-instruction, button:has-text("Hear English")', { timeout: 30000 })
      await page.waitForTimeout(800)
      const hear = page.locator('button:has-text("Hear English")').first()
      await clickAt(page, hear, { steps: 24, settle: 350, after: 1600 })
      const correct = page.locator('.train-choice-grid button').filter({ hasText: /tape measure/i })
      const btn = (await correct.first().isVisible().catch(() => false))
        ? correct.first()
        : page.locator('.train-choice-grid button').first()
      await clickAt(page, btn, { steps: 24, settle: 350, after: 1400 })
      await page.waitForTimeout(800)
    },
  },

  'computer-skills': {
    title: 'Basic Computer Skills',
    step: 12,
    beats: [
      { id: 'intro', text: 'Basic Computer Skills. Watch, then try.' },
      { id: 'watch', text: 'Watch a short captioned lesson.' },
      { id: 'try', text: 'Then try a simple task — mouse, folders, save, Word, or email.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 12 })
      await page.waitForSelector('[data-coach="comp-watch"], .equip-video-stage, .comp-skills', {
        timeout: 30000,
      })
      await page.waitForTimeout(900)
      const stage = page.locator('[data-coach="comp-watch"], .equip-video-player').first()
      await moveTo(page, stage, { steps: 28, settle: 500 })
      /* Click play on video if present */
      const video = page.locator('video.equip-video-player, [data-coach="comp-watch"] video').first()
      if (await video.isVisible().catch(() => false)) {
        await clickAt(page, video, { steps: 18, settle: 300, after: 1800 })
      }
      const tryBtn = page.locator('button:has-text("Try it now"), button:has-text("Keep watching")').first()
      if (await tryBtn.isVisible().catch(() => false)) {
        /* Force enable via evaluate if still locked for demo pacing */
        await page.evaluate(() => {
          const b = document.querySelector('button.btn-primary')
          if (b) b.removeAttribute('disabled')
        })
        await clickAt(page, tryBtn, { steps: 22, settle: 300, after: 1400 })
      }
      const tryPanel = page.locator('[data-coach="comp-try"]').first()
      if (await tryPanel.isVisible().catch(() => false)) {
        await moveTo(page, tryPanel, { steps: 20, settle: 600 })
        const action = tryPanel.locator('button').first()
        if (await action.isVisible().catch(() => false)) {
          await clickAt(page, action, { steps: 18, settle: 300, after: 1200 })
        }
      }
      await page.waitForTimeout(900)
    },
  },

  'site-language': {
    title: 'Site Language',
    step: 13,
    beats: [
      { id: 'intro', text: 'Site Language. Phrases you will hear on site.' },
      { id: 'hear', text: 'Hear a job-site phrase. Choose what it means.' },
      { id: 'pick', text: 'Soft try again. Then move on.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 13 })
      await page.waitForSelector('[data-coach="phrase-hear"], button:has-text("Hear English")', {
        timeout: 30000,
      })
      await page.waitForTimeout(800)
      const hear = page.locator('[data-coach="phrase-hear"], button:has-text("Hear English")').first()
      await clickAt(page, hear, { steps: 24, settle: 350, after: 1500 })
      const correct = page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').filter({
        hasText: /measurement|hard hat|Check your measurement/i,
      })
      const btn = (await correct.first().isVisible().catch(() => false))
        ? correct.first()
        : page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').first()
      await clickAt(page, btn, { steps: 24, settle: 350, after: 1400 })
      await page.waitForTimeout(800)
    },
  },

  safety: {
    title: 'Safety Training',
    step: 15,
    beats: [
      { id: 'intro', text: 'Safety Training. Words that keep crews safe.' },
      { id: 'look', text: 'Look at the picture. Choose the safety word.' },
      { id: 'retry', text: 'Soft try again. Safety first — no rush.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 15 })
      await page.waitForSelector('[data-coach="choice-opt"], .train-choice-grid', { timeout: 30000 })
      await page.waitForTimeout(900)
      const correct = page.locator('button').filter({ hasText: /Safety gear \(PPE\)/i })
      const btn = (await correct.first().isVisible().catch(() => false))
        ? correct.first()
        : page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').first()
      await clickAt(page, btn, { steps: 26, settle: 400, after: 1500 })
      await page.waitForTimeout(800)
    },
  },

  tools: {
    title: 'Tools and Equipment',
    step: 16,
    beats: [
      { id: 'intro', text: 'Tools and Equipment. Name it before you use it.' },
      { id: 'learn', text: 'Learn each tool group. Answer one check.' },
      { id: 'retry', text: 'Soft try again. Then continue.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 16 })
      await page.waitForSelector('[data-coach="choice-opt"], .topic-lesson-card', { timeout: 30000 })
      await page.waitForTimeout(900)
      const correct = page.locator('button').filter({ hasText: /^Hand tools$/i })
      const btn = (await correct.first().isVisible().catch(() => false))
        ? correct.first()
        : page.locator('[data-coach="choice-opt"] button').first()
      await clickAt(page, btn, { steps: 26, settle: 400, after: 1500 })
      await page.waitForTimeout(800)
    },
  },

  systems: {
    title: 'Workplace Systems',
    step: 17,
    beats: [
      { id: 'intro', text: 'Workplace Systems. How the whole job fits together.' },
      { id: 'learn', text: 'Learn each system. Answer one check.' },
      { id: 'retry', text: 'Soft try again. Your task feeds the whole site.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 17 })
      await page.waitForSelector('[data-coach="choice-opt"], .topic-lesson-card', { timeout: 30000 })
      await page.waitForTimeout(900)
      const correct = page.locator('button').filter({ hasText: /^Framing$/i })
      const btn = (await correct.first().isVisible().catch(() => false))
        ? correct.first()
        : page.locator('[data-coach="choice-opt"] button').first()
      await clickAt(page, btn, { steps: 26, settle: 400, after: 1500 })
      await page.waitForTimeout(800)
    },
  },

  'equipment-video': {
    title: 'Equipment Videos',
    step: 18,
    pathway: 'logistics',
    beats: [
      { id: 'intro', text: 'Equipment Videos. Watch each equipment lesson, then continue.' },
      { id: 'play', text: 'Press play on the equipment video.' },
      { id: 'next', text: 'Continue when the video is clear.' },
    ],
    async scene(page) {
      await gotoStation(page, BASE, { step: 18, pathway: 'logistics' })
      await page.waitForSelector(
        '[data-coach="equip-watch"], .equip-video-stage, button:has-text("Open Video"), .topic-lesson-card',
        { timeout: 30000 },
      )
      await page.waitForTimeout(900)
      const openLog = page.locator('button:has-text("Open Video section")').first()
      if (await openLog.isVisible().catch(() => false)) {
        await clickAt(page, openLog, { steps: 24, settle: 350, after: 1500 })
      }
      const stage = page.locator('[data-coach="equip-watch"], .equip-video-player, video').first()
      if (await stage.isVisible().catch(() => false)) {
        await clickAt(page, stage, { steps: 24, settle: 400, after: 2000 })
      }
      const next = page.locator('[data-coach="equip-next"], button:has-text("Continue"), button:has-text("Next")').first()
      if (await next.isVisible().catch(() => false)) {
        await page.evaluate(() => {
          document.querySelectorAll('button[disabled]').forEach((b) => b.removeAttribute('disabled'))
        })
        await moveTo(page, next, { steps: 22, settle: 700 })
      }
      await page.waitForTimeout(1000)
    },
  },
}

async function recordOne(browser, id) {
  const station = STATIONS[id]
  if (!station) throw new Error(`Unknown station ${id}`)
  const work = join(WORK_ROOT, id)
  mkdirSync(work, { recursive: true })
  console.log(`\n=== ${id} · ${station.title} (step ${station.step}) ===`)
  console.log('Synthesizing VO…')
  const { vo, durs } = buildVoTrack(work, station.beats)
  console.log(
    'VO',
    durationOf(vo).toFixed(2),
    's · beats',
    durs.map((d) => d.toFixed(1)).join(', '),
  )

  console.log('Recording UI…')
  const webm = await recordWithBrowser(browser, work, station.scene)
  console.log('Raw', webm, durationOf(webm).toFixed(2), 's')

  const out = join(ROOT, 'public/explainers', `${id}.mp4`)
  const result = mux(work, webm, vo, out, `${id.replace(/-/g, '_')}_mouse_demo.mp4`)
  writeFileSync(
    join(work, 'demo-meta.json'),
    JSON.stringify(
      {
        id,
        title: station.title,
        step: station.step,
        pathway: station.pathway || 'construction',
        beats: station.beats,
        durs,
        ...result,
        recordedAt: new Date().toISOString(),
        base: BASE,
        viewport: { W, H },
      },
      null,
      2,
    ),
  )
  console.log('Wrote', result.out, `(${(result.bytes / 1024).toFixed(0)} KB)`)
  return { id, ...result }
}

async function main() {
  const ids = ONLY.length ? ONLY : Object.keys(STATIONS)
  for (const id of ids) {
    if (!STATIONS[id]) {
      console.error('Unknown station', id, 'known:', Object.keys(STATIONS).join(', '))
      process.exit(1)
    }
  }
  console.log('BASE', BASE)
  console.log('Stations', ids.join(', '))
  const browser = await chromium.launch({ headless: true })
  const results = []
  const failures = []
  try {
    for (const id of ids) {
      try {
        results.push(await recordOne(browser, id))
      } catch (e) {
        console.error(`FAIL ${id}:`, e.message || e)
        failures.push({ id, error: String(e.message || e) })
      }
    }
  } finally {
    await browser.close()
  }
  writeFileSync(join(WORK_ROOT, 'summary.json'), JSON.stringify({ results, failures, base: BASE }, null, 2))
  console.log('\nDone. ok=', results.length, 'fail=', failures.length)
  if (failures.length) {
    console.error(failures)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
