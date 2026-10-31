/**
 * Record ALL contentful Practice stations as real-UI mouse demos + JennyNeural VO.
 *
 * Sync: each spoken beat has a matching on-screen act in the same time window
 * (record act → hold through VO → next beat). See demo-lib recordSyncedStation.
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
  clickAt,
  durationOf,
  gotoStation,
  moveTo,
  muxSynced,
  recordSyncedStation,
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

/**
 * @typedef {{ id: string, text: string, act: (page: import('playwright').Page) => Promise<void> }} Beat
 * @typedef {{ title: string, step: number, pathway?: string, setup: (page: import('playwright').Page) => Promise<void>, beats: Beat[] }} Station
 * @type {Record<string, Station>}
 */
const STATIONS = {
  'your-language': {
    title: 'Your Language',
    step: 3,
    async setup(page) {
      await gotoStation(page, BASE, { step: 3 })
      await page.waitForSelector('.train-lang-grid, .train-lang', { timeout: 30000 })
      const grid = page.locator('.train-lang-grid, .train-lang-cue').first()
      await grid.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Your Language. We start in English.',
        async act(page) {
          const english = page.locator('.train-lang').filter({ hasText: /English|EN/i }).first()
          await english.scrollIntoViewIfNeeded()
          await moveTo(page, english, { steps: 36, settle: 700 })
        },
      },
      {
        id: 'mark',
        text: 'See the arrow. It points at the language buttons one time. Stay in English, or press the language you know best.',
        async act(page) {
          const spanish = page.locator('.train-lang').filter({ hasText: /Spanish|Español|ES/i }).first()
          await spanish.scrollIntoViewIfNeeded()
          await clickAt(page, spanish, { steps: 40, settle: 400, after: 900 })
          const amharic = page.locator('.train-lang').filter({ hasText: /Amharic|አማርኛ|AM/i }).first()
          if (await amharic.isVisible().catch(() => false)) {
            await amharic.scrollIntoViewIfNeeded()
            await clickAt(page, amharic, { steps: 30, settle: 350, after: 700 })
          }
          const english = page.locator('.train-lang').filter({ hasText: /English|EN/i }).first()
          await english.scrollIntoViewIfNeeded()
          await clickAt(page, english, { steps: 28, settle: 350, after: 600 })
        },
      },
      {
        id: 'continue',
        text: 'Then continue. The next path questions speak that language.',
        async act(page) {
          const cont = page.locator('button.btn-primary, button:has-text("Continue")').first()
          if (await cont.isVisible().catch(() => false)) {
            await cont.scrollIntoViewIfNeeded()
            await moveTo(page, cont, { steps: 24, settle: 800 })
          } else {
            await page.waitForTimeout(800)
          }
        },
      },
    ],
  },

  'workplace-words': {
    title: 'Workplace Words',
    step: 6,
    async setup(page) {
      await gotoStation(page, BASE, { step: 6 })
      await page.waitForSelector('.vocab-sheet, [data-coach="vv-lang"]', { timeout: 30000 })
      await page.waitForTimeout(400)
    },
    beats: [
      {
        id: 'intro',
        text: 'Workplace Words. One picture. One word. No rush.',
        async act(page) {
          const sheet = page.locator('.vocab-sheet, [data-coach="vv-lang"]').first()
          await sheet.scrollIntoViewIfNeeded()
          await moveTo(page, sheet, { steps: 28, settle: 700 })
        },
      },
      {
        id: 'lang',
        text: 'Press the language you understand. Hear it in your tongue.',
        async act(page) {
          const langRow = page.locator('[data-coach="vv-lang"]').first()
          await langRow.scrollIntoViewIfNeeded()
          await moveTo(page, langRow, { steps: 24, settle: 500 })
          const langButtons = page.locator('[data-coach="vv-lang"] button, .vocab-sheet-lang-btn')
          /* Hover a couple languages first so VO can name the row before the press */
          const n = await langButtons.count()
          for (let i = 0; i < Math.min(n, 2); i++) {
            await moveTo(page, langButtons.nth(i), { steps: 14, settle: 280 })
          }
          const pick =
            (await langButtons.filter({ hasText: /Spanish/i }).first().isVisible().catch(() => false))
              ? langButtons.filter({ hasText: /Spanish/i }).first()
              : langButtons.first()
          await pick.scrollIntoViewIfNeeded()
          /* Short after — keep camera on the language press; bridge audio is silenced in demos */
          await clickAt(page, pick, { steps: 24, settle: 350, after: 450 })
          await moveTo(page, pick, { steps: 8, settle: 400 })
        },
      },
      {
        id: 'hear',
        text: 'Then hear the English workplace word.',
        async act(page) {
          const hear = page.locator('button:has-text("Hear English"), [data-coach="vv-hear"]').first()
          if (await hear.isVisible().catch(() => false)) {
            await hear.scrollIntoViewIfNeeded()
            await clickAt(page, hear, { steps: 22, settle: 350, after: 900 })
          } else {
            /* English auto-plays after bridge — hold on the card / hear control */
            const card = page.locator('.vocab-sheet, [data-coach="vv-type"], [data-coach="vv-hear"]').first()
            await moveTo(page, card, { steps: 18, settle: 1100 })
          }
        },
      },
      {
        id: 'pick',
        text: 'Pick the matching English word. Wrong? Try again. The choices move.',
        async act(page) {
          await page.waitForSelector('[data-coach="vv-pick"] .vocab-sheet-pick-chip, .vocab-sheet-pick-chip', {
            timeout: 35000,
          })
          const bank = page.locator('[data-coach="vv-pick"], .vocab-sheet-pick-bank').first()
          await bank.scrollIntoViewIfNeeded()
          await moveTo(page, bank, { steps: 18, settle: 400 })
          /* Prefer the word that matches the typed demo (“Hi”); fall back to first chip. */
          const chips = page.locator('.vocab-sheet-pick-chip')
          const hi = chips.filter({ hasText: /\bHi\b/i }).first()
          const pick = (await hi.isVisible().catch(() => false)) ? hi : chips.first()
          await clickAt(page, pick, { steps: 20, settle: 300, after: 700 })
        },
      },
      {
        id: 'type',
        text: 'Type what you picked and heard. Wrong? Try again. That is all — hear, pick, and type.',
        async act(page) {
          await page.waitForSelector('[data-coach="vv-type"] input, .vocab-sheet-type-input', {
            timeout: 35000,
          })
          const input = page.locator('[data-coach="vv-type"] input, .vocab-sheet-type-input').first()
          await input.scrollIntoViewIfNeeded()
          await typeInto(page, input, 'Hi', { delay: 140 })
          /* Rest on the filled field so VO can say “type” before Go */
          await page.waitForTimeout(900)
          const go = page.locator('.vocab-sheet-type-check, button:has-text("Go")').first()
          await go.scrollIntoViewIfNeeded()
          await clickAt(page, go, { steps: 20, settle: 300, after: 900 })
        },
      },
    ],
  },

  'language-organize': {
    title: 'Language Organize',
    step: 7,
    async setup(page) {
      await gotoStation(page, BASE, { step: 7 })
      await page.waitForSelector('.vocab-organize, [data-coach="org-pic"]', { timeout: 30000 })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Language Organize. Match pictures to their words.',
        async act(page) {
          const board = page.locator('.vocab-organize, [data-coach="org-pic"]').first()
          await board.scrollIntoViewIfNeeded()
          await moveTo(page, board, { steps: 26, settle: 800 })
        },
      },
      {
        id: 'pick',
        text: 'Pick a picture. Place it on the empty box for that word.',
        async act(page) {
          const pic = page.locator('[data-coach="org-pic"]').first()
          const termId = await pic.getAttribute('data-term-id')
          await clickAt(page, pic, { steps: 28, settle: 400, after: 600 })
          const drop = termId
            ? page.locator(`[data-coach="org-drop"][data-box-id="${termId}"]`).first()
            : page.locator('[data-coach="org-drop"]').first()
          await clickAt(page, drop, { steps: 30, settle: 400, after: 900 })
        },
      },
      {
        id: 'retry',
        text: 'Wrong place? It shakes — try again. Finish this set, then the next.',
        async act(page) {
          const pic2 = page.locator('.vocab-organize-piece.is-image').first()
          if (await pic2.isVisible().catch(() => false)) {
            const id2 = await pic2.getAttribute('data-term-id')
            await clickAt(page, pic2, { steps: 22, settle: 300, after: 500 })
            const drop2 = id2
              ? page.locator(`.vocab-organize-slot[data-box-id="${id2}"]`).first()
              : page.locator('.vocab-organize-slot:not(.is-filled)').first()
            if (await drop2.isVisible().catch(() => false)) {
              await clickAt(page, drop2, { steps: 24, settle: 300, after: 1000 })
            }
          } else {
            await page.waitForTimeout(1200)
          }
        },
      },
    ],
  },

  'eye-spy': {
    title: 'English Eye Spy',
    step: 8,
    async setup(page) {
      await gotoStation(page, BASE, { step: 8 })
      await page.waitForSelector('[data-coach="spy-pic"], .eye-spy', { timeout: 30000 })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'English Eye Spy. Clear the board.',
        async act(page) {
          const board = page.locator('.eye-spy, [data-coach="spy-pic"]').first()
          await board.scrollIntoViewIfNeeded()
          await moveTo(page, board, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'pic',
        text: 'Tap a picture on the job site. Then tap its English name.',
        async act(page) {
          const pic = page.locator('[data-coach="spy-pic"]').first()
          await clickAt(page, pic, { steps: 26, settle: 400, after: 700 })
          const word = page
            .locator('[data-coach="spy-word"] button, [data-coach="spy-word"] .choice-btn')
            .first()
          const label = ((await pic.getAttribute('aria-label')) || '')
            .replace(/picture|hotspot|press/gi, '')
            .trim()
          let wordBtn = word
          if (label) {
            const match = page
              .locator('[data-coach="spy-word"] button, [data-coach="spy-word"] .choice-btn')
              .filter({
                hasText: new RegExp(label.split(/\s+/)[0] || 'Hammer', 'i'),
              })
            if (await match.first().isVisible().catch(() => false)) wordBtn = match.first()
          }
          const hammer = page
            .locator('[data-coach="spy-word"] button, [data-coach="spy-word"] .choice-btn')
            .filter({ hasText: /Hammer/i })
          if (await hammer.first().isVisible().catch(() => false)) wordBtn = hammer.first()
          await clickAt(page, wordBtn, { steps: 24, settle: 350, after: 600 })
        },
      },
      {
        id: 'match',
        text: 'A correct pair disappears. Wrong? Try again. Clear every pair to continue.',
        async act(page) {
          const matchBtn = page.locator('[data-coach="spy-match"], button:has-text("Match")').first()
          if (await matchBtn.isVisible().catch(() => false)) {
            await clickAt(page, matchBtn, { steps: 22, settle: 300, after: 1400 })
          } else {
            await page.waitForTimeout(1400)
          }
        },
      },
    ],
  },

  'sentence-structure': {
    title: 'Sentence Structure',
    step: 9,
    async setup(page) {
      await gotoStation(page, BASE, { step: 9 })
      await page.waitForSelector(
        '[data-coach="sent-type"], .sentence-cloze-type, [data-coach="sent-choices"]',
        { timeout: 30000 },
      )
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Sentence Structure. Four words. Type the match.',
        async act(page) {
          const stage = page
            .locator('[data-coach="sent-type"], .sentence-cloze-type, .train-panel')
            .first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 22, settle: 800 })
        },
      },
      {
        id: 'read',
        text: 'Read the sentence. Look at the four choices at the bottom.',
        async act(page) {
          const choices = page
            .locator('[data-coach="sent-choices"], .sentence-cloze-choices')
            .first()
          if (await choices.isVisible().catch(() => false)) {
            await moveTo(page, choices, { steps: 22, settle: 900 })
          } else {
            await page.waitForTimeout(900)
          }
        },
      },
      {
        id: 'type',
        text: 'Type the word that fits the blank. Wrong? Try again.',
        async act(page) {
          const input = page.locator('[data-coach="sent-type"] input, .sentence-cloze-type-input').first()
          await input.waitFor({ state: 'visible', timeout: 10000 })
          const chipTexts = await page.locator('.sentence-cloze-chip').allTextContents()
          const cleaned = chipTexts
            .map((t) => t.replace(/^[A-D]\.\s*/i, '').trim())
            .filter((t) => t && !/^[A-D]\.?$/i.test(t))
          /* Prefer workplace/structure words; Construction Q1 answer is Foundation */
          let answer =
            cleaned.find((t) => /foundation|hammer|drill|saw|level|tape|hard|ppe|safety|scaffold/i.test(t)) ||
            cleaned[1] ||
            cleaned[0] ||
            'Foundation'
          await typeInto(page, input, answer, { delay: 110 })
          /* Hold on filled blank so mid-beat still shows typing, not the next item */
          await moveTo(page, input, { steps: 10, settle: 1100 })
          const go = page.locator('.sentence-cloze-type-go, button:has-text("Go")').first()
          await clickAt(page, go, { steps: 18, settle: 280, after: 700 })
          const retry = page.locator('.play-soft-miss').first()
          if (await retry.isVisible().catch(() => false)) {
            const alt = cleaned.find((t) => t.toLowerCase() !== answer.toLowerCase()) || 'Foundation'
            await input.fill('')
            await typeInto(page, input, alt, { delay: 100 })
            await clickAt(page, go, { steps: 16, settle: 250, after: 700 })
          }
        },
      },
    ],
  },

  'word-action': {
    title: 'Word → Action',
    step: 9,
    async setup(page) {
      await gotoStation(page, BASE, { step: 9 })
      await page.waitForSelector('[data-coach="sent-type"], .sentence-cloze-type', { timeout: 30000 })
      await page.waitForTimeout(400)
      /* Skip control lives in a collapsed fold — click via DOM so prep stays silent */
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) =>
          /Skip to Word/i.test(x.textContent || ''),
        )
        if (b) b.click()
      })
      await page.waitForSelector('[data-coach="choice-opt"]', { timeout: 25000 })
      await page.waitForTimeout(400)
    },
    beats: [
      {
        id: 'intro',
        text: 'Word to Action. Connect the tool to the job.',
        async act(page) {
          const card = page.locator('[data-coach="choice-opt"], .train-panel').first()
          await card.scrollIntoViewIfNeeded()
          await moveTo(page, card, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'see',
        text: 'See the action. Choose which tool it uses.',
        async act(page) {
          const opts = page.locator('[data-coach="choice-opt"]').first()
          await opts.scrollIntoViewIfNeeded()
          await moveTo(page, opts, { steps: 22, settle: 900 })
        },
      },
      {
        id: 'pick',
        text: 'Pick one answer. Wrong? Try again. Then continue.',
        async act(page) {
          const hammer = page
            .locator('[data-coach="choice-opt"] button')
            .filter({ hasText: /^Hammer$/i })
          const btn = (await hammer.first().isVisible().catch(() => false))
            ? hammer.first()
            : page.locator('[data-coach="choice-opt"] button').first()
          await clickAt(page, btn, { steps: 26, settle: 400, after: 800 })
          /* Stay on the chosen answer — don’t wander during the VO hold */
          await moveTo(page, btn, { steps: 8, settle: 500 })
        },
      },
    ],
  },

  'video-match': {
    title: 'Video Match',
    step: 10,
    async setup(page) {
      await page.addInitScript(() => {
        localStorage.setItem('pa-sp-station-v1', 'video-match')
        /* Skip Self intro so the how-it-works recording is the board itself. */
        try {
          const raw = localStorage.getItem('pa-station-explainers-seen-v1')
          const seen = raw ? JSON.parse(raw) : {}
          seen['video-match'] = true
          localStorage.setItem('pa-station-explainers-seen-v1', JSON.stringify(seen))
        } catch {
          /* ignore */
        }
      })
      await gotoStation(page, BASE, { step: 10 })
      await page.waitForSelector('[data-coach="sp-video"], .supported-video-grid', { timeout: 30000 })
      await page.waitForTimeout(500)
      const skip = page.locator('.station-coach-skip')
      if (await skip.first().isVisible().catch(() => false)) {
        await skip.first().click()
        await page.waitForTimeout(350)
      }
    },
    beats: [
      {
        id: 'intro',
        text: 'Video Match. Hear the sentence. Then tap the video that matches.',
        async act(page) {
          const stage = page.locator('.supported-games.is-video-match, [data-coach="sp-video"]').first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 20, settle: 500 })
          const hear = page.locator('button:has-text("Hear the sentence")').first()
          if (await hear.isVisible().catch(() => false)) {
            await moveTo(page, hear, { steps: 18, settle: 700 })
          }
        },
      },
      {
        id: 'hear',
        text: 'Press Hear the sentence.',
        async act(page) {
          const hear = page.locator('button:has-text("Hear the sentence")').first()
          await clickAt(page, hear, { steps: 22, settle: 400, after: 1100 })
        },
      },
      {
        id: 'tap',
        text: 'Three videos. Tap the one that matches. Wrong? Try again.',
        async act(page) {
          await page.waitForSelector('.supported-video-btn[data-correct="1"]:not(:disabled)', {
            timeout: 15000,
          })
          const wrong = page.locator('.supported-video-btn:not([data-correct="1"]):not(:disabled)').first()
          if (await wrong.isVisible().catch(() => false)) {
            await moveTo(page, wrong, { steps: 14, settle: 350 })
          }
          const btn = page.locator('.supported-video-btn[data-correct="1"]:not(:disabled)').first()
          await clickAt(page, btn, { steps: 20, settle: 300, after: 1400 })
          await moveTo(page, btn, { steps: 10, settle: 600 })
        },
      },
    ],
  },

  'copycat': {
    title: 'Copycat',
    step: 10,
    async setup(page) {
      await page.addInitScript(() => {
        localStorage.setItem('pa-sp-station-v1', 'copycat')
        try {
          const raw = localStorage.getItem('pa-station-explainers-seen-v1')
          const seen = raw ? JSON.parse(raw) : {}
          seen.copycat = true
          localStorage.setItem('pa-station-explainers-seen-v1', JSON.stringify(seen))
        } catch {
          /* ignore */
        }
      })
      await gotoStation(page, BASE, { step: 10 })
      await page.waitForSelector('[data-coach="sp-copycat"], .supported-chip-btn', { timeout: 30000 })
      await page.waitForTimeout(500)
      const skip = page.locator('.station-coach-skip')
      if (await skip.first().isVisible().catch(() => false)) {
        await skip.first().click()
        await page.waitForTimeout(350)
      }
    },
    beats: [
      {
        id: 'intro',
        text: 'Copycat. Watch the video. Then tap the words in order — say it back.',
        async act(page) {
          const stage = page.locator('.supported-games.is-copycat, [data-coach="sp-copycat"]').first()
          await stage.scrollIntoViewIfNeeded()
          const video = page.locator('.supported-copycat-video').first()
          if (await video.isVisible().catch(() => false)) {
            await moveTo(page, video, { steps: 18, settle: 1200 })
          } else {
            await moveTo(page, stage, { steps: 18, settle: 700 })
          }
        },
      },
      {
        id: 'tap',
        text: 'Tap each word in order. Wrong? Try again.',
        async act(page) {
          await page.waitForSelector('.supported-chip-btn:not(:disabled)', { timeout: 25000 })
          const built = page.locator('.supported-copycat-built').first()
          for (let guard = 0; guard < 16; guard += 1) {
            const next = page.locator('.supported-chip-btn[data-correct="1"]:not(:disabled)').first()
            if (!(await next.isVisible().catch(() => false))) break
            await clickAt(page, next, { steps: 14, settle: 200, after: 380 })
          }
          await moveTo(page, built, { steps: 10, settle: 700 })
        },
      },
    ],
  },

  'workplace-instructions': {
    title: 'Workplace Instructions',
    step: 11,
    async setup(page) {
      await gotoStation(page, BASE, { step: 11 })
      await page.waitForSelector('.train-instruction, button:has-text("Hear English")', {
        timeout: 30000,
      })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Workplace Instructions. Hear a direction. Show you understood.',
        async act(page) {
          const stage = page.locator('.train-instruction').first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'hear',
        text: 'Press Hear English at least once.',
        async act(page) {
          const hear = page.locator('button:has-text("Hear English")').first()
          await clickAt(page, hear, { steps: 24, settle: 350, after: 1400 })
        },
      },
      {
        id: 'pick',
        text: 'Then choose what you should do. Wrong? Try again.',
        async act(page) {
          const correct = page.locator('.train-choice-grid button').filter({ hasText: /tape measure/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('.train-choice-grid button').first()
          await clickAt(page, btn, { steps: 24, settle: 350, after: 1200 })
        },
      },
    ],
  },

  'computer-skills': {
    title: 'Basic Computer Skills',
    step: 12,
    async setup(page) {
      await gotoStation(page, BASE, { step: 12 })
      await page.waitForSelector('[data-coach="comp-watch"], .equip-video-stage, .comp-skills', {
        timeout: 30000,
      })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Basic Computer Skills. Watch, then try.',
        async act(page) {
          const stage = page.locator('[data-coach="comp-watch"], .equip-video-player').first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 26, settle: 800 })
        },
      },
      {
        id: 'watch',
        text: 'Watch a short lesson with words on the screen.',
        async act(page) {
          const video = page.locator('video.equip-video-player, [data-coach="comp-watch"] video').first()
          if (await video.isVisible().catch(() => false)) {
            await clickAt(page, video, { steps: 18, settle: 300, after: 1600 })
          } else {
            await page.waitForTimeout(1600)
          }
        },
      },
      {
        id: 'try',
        text: 'Then try a simple task — mouse, folders, save, writing, or email.',
        async act(page) {
          const tryBtn = page
            .locator('button:has-text("Try it now"), button:has-text("Keep watching")')
            .first()
          if (await tryBtn.isVisible().catch(() => false)) {
            await page.evaluate(() => {
              const b = document.querySelector('button.btn-primary')
              if (b) b.removeAttribute('disabled')
            })
            await clickAt(page, tryBtn, { steps: 22, settle: 300, after: 1000 })
          }
          const tryPanel = page.locator('[data-coach="comp-try"]').first()
          if (await tryPanel.isVisible().catch(() => false)) {
            await moveTo(page, tryPanel, { steps: 20, settle: 500 })
            const action = tryPanel.locator('button').first()
            if (await action.isVisible().catch(() => false)) {
              await clickAt(page, action, { steps: 18, settle: 300, after: 1000 })
            }
          } else {
            await page.waitForTimeout(1000)
          }
        },
      },
    ],
  },

  'site-language': {
    title: 'Site Language',
    step: 13,
    async setup(page) {
      await gotoStation(page, BASE, { step: 13 })
      await page.waitForSelector('[data-coach="phrase-hear"], button:has-text("Hear English")', {
        timeout: 30000,
      })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Site Language. Phrases you will hear on site.',
        async act(page) {
          const stage = page.locator('[data-coach="phrase-hear"], .train-instruction').first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'hear',
        text: 'Hear a job-site phrase. Choose what it means.',
        async act(page) {
          const hear = page.locator('[data-coach="phrase-hear"], button:has-text("Hear English")').first()
          await clickAt(page, hear, { steps: 24, settle: 350, after: 1400 })
        },
      },
      {
        id: 'pick',
        text: 'Wrong? Try again. Then move on.',
        async act(page) {
          const correct = page
            .locator('[data-coach="choice-opt"] button, .train-choice-grid button')
            .filter({ hasText: /measurement|hard hat|Check your measurement/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').first()
          await clickAt(page, btn, { steps: 24, settle: 350, after: 1200 })
        },
      },
    ],
  },

  safety: {
    title: 'Safety Training',
    step: 15,
    async setup(page) {
      await gotoStation(page, BASE, { step: 15 })
      await page.waitForSelector('[data-coach="choice-opt"], .train-choice-grid', { timeout: 30000 })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Safety Training. Words that keep crews safe.',
        async act(page) {
          const stage = page.locator('[data-coach="choice-opt"], .train-choice-grid').first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'look',
        text: 'Look at the picture. Choose the safety word.',
        async act(page) {
          const img = page.locator('img, .object-mat, .train-media').first()
          if (await img.isVisible().catch(() => false)) {
            await moveTo(page, img, { steps: 20, settle: 700 })
          }
          const correct = page.locator('button').filter({ hasText: /Safety gear \(PPE\)/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').first()
          await moveTo(page, btn, { steps: 22, settle: 700 })
        },
      },
      {
        id: 'retry',
        text: 'Wrong? Try again. Safety first — no rush.',
        async act(page) {
          const correct = page.locator('button').filter({ hasText: /Safety gear \(PPE\)/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('[data-coach="choice-opt"] button, .train-choice-grid button').first()
          await clickAt(page, btn, { steps: 26, settle: 400, after: 1400 })
        },
      },
    ],
  },

  tools: {
    title: 'Tools and Equipment',
    step: 16,
    async setup(page) {
      await gotoStation(page, BASE, { step: 16 })
      await page.waitForSelector('[data-coach="choice-opt"], .topic-lesson-card', { timeout: 30000 })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Tools and Equipment. Name it before you use it.',
        async act(page) {
          const stage = page.locator('.topic-lesson-card, [data-coach="choice-opt"]').first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'learn',
        text: 'Learn each tool group. Answer one check.',
        async act(page) {
          const correct = page.locator('button').filter({ hasText: /^Hand tools$/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('[data-coach="choice-opt"] button').first()
          await moveTo(page, btn, { steps: 22, settle: 900 })
        },
      },
      {
        id: 'retry',
        text: 'Wrong? Try again. Then continue.',
        async act(page) {
          const correct = page.locator('button').filter({ hasText: /^Hand tools$/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('[data-coach="choice-opt"] button').first()
          await clickAt(page, btn, { steps: 26, settle: 400, after: 1400 })
        },
      },
    ],
  },

  systems: {
    title: 'Workplace Systems',
    step: 17,
    async setup(page) {
      await gotoStation(page, BASE, { step: 17 })
      await page.waitForSelector('[data-coach="choice-opt"], .topic-lesson-card', { timeout: 30000 })
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Workplace Systems. How the whole job fits together.',
        async act(page) {
          const stage = page.locator('.topic-lesson-card, [data-coach="choice-opt"]').first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'learn',
        text: 'Learn each system. Answer one check.',
        async act(page) {
          const correct = page.locator('button').filter({ hasText: /^Framing$/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('[data-coach="choice-opt"] button').first()
          await moveTo(page, btn, { steps: 22, settle: 900 })
        },
      },
      {
        id: 'retry',
        text: 'Wrong? Try again. Your job helps the whole work site.',
        async act(page) {
          const correct = page.locator('button').filter({ hasText: /^Framing$/i })
          const btn = (await correct.first().isVisible().catch(() => false))
            ? correct.first()
            : page.locator('[data-coach="choice-opt"] button').first()
          await clickAt(page, btn, { steps: 26, settle: 400, after: 1400 })
        },
      },
    ],
  },

  'equipment-video': {
    title: 'Equipment Videos',
    step: 18,
    pathway: 'logistics',
    async setup(page) {
      await gotoStation(page, BASE, { step: 18, pathway: 'logistics' })
      await page.waitForSelector(
        '[data-coach="equip-watch"], .equip-video-stage, button:has-text("Open Video"), .topic-lesson-card',
        { timeout: 30000 },
      )
      await page.waitForTimeout(500)
    },
    beats: [
      {
        id: 'intro',
        text: 'Equipment Videos. Watch each equipment lesson, then continue.',
        async act(page) {
          const stage = page
            .locator('[data-coach="equip-watch"], .equip-video-stage, .topic-lesson-card')
            .first()
          await stage.scrollIntoViewIfNeeded()
          await moveTo(page, stage, { steps: 24, settle: 800 })
        },
      },
      {
        id: 'play',
        text: 'Press play on the equipment video.',
        async act(page) {
          const openLog = page.locator('button:has-text("Open Video section")').first()
          if (await openLog.isVisible().catch(() => false)) {
            await clickAt(page, openLog, { steps: 24, settle: 350, after: 1000 })
          }
          const stage = page.locator('[data-coach="equip-watch"], .equip-video-player, video').first()
          if (await stage.isVisible().catch(() => false)) {
            await clickAt(page, stage, { steps: 24, settle: 400, after: 1600 })
          } else {
            await page.waitForTimeout(1600)
          }
        },
      },
      {
        id: 'next',
        text: 'Continue when the video is clear.',
        async act(page) {
          const next = page
            .locator('[data-coach="equip-next"], button:has-text("Continue"), button:has-text("Next")')
            .first()
          if (await next.isVisible().catch(() => false)) {
            await page.evaluate(() => {
              document.querySelectorAll('button[disabled]').forEach((b) => b.removeAttribute('disabled'))
            })
            await moveTo(page, next, { steps: 22, settle: 900 })
          } else {
            await page.waitForTimeout(900)
          }
        },
      },
    ],
  },
}

async function recordOne(browser, id) {
  const station = STATIONS[id]
  if (!station) throw new Error(`Unknown station ${id}`)
  const work = join(WORK_ROOT, id)
  mkdirSync(work, { recursive: true })
  console.log(`\n=== ${id} · ${station.title} (step ${station.step}) ===`)
  console.log('Recording UI with beat-locked VO pacing…')
  const { webm, vo, timeline, durs, setupDur, vDurRaw } = await recordSyncedStation(
    browser,
    work,
    station,
  )
  console.log(
    'Raw video',
    vDurRaw.toFixed(2),
    's · setup',
    setupDur.toFixed(2),
    's · VO',
    durationOf(vo).toFixed(2),
    's · beats',
    durs.map((d) => d.toFixed(1)).join(', '),
  )

  const out = join(ROOT, 'public/explainers', `${id}.mp4`)
  const result = muxSynced(work, webm, vo, out, `${id.replace(/-/g, '_')}_mouse_demo.mp4`)
  writeFileSync(
    join(work, 'demo-meta.json'),
    JSON.stringify(
      {
        id,
        title: station.title,
        step: station.step,
        pathway: station.pathway || 'construction',
        beats: station.beats.map(({ id: bid, text }) => ({ id: bid, text })),
        durs,
        timeline,
        setupDur,
        sync: 'beat-locked',
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
  return { id, ...result, timeline, setupDur }
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
  console.log('Sync mode: beat-locked (act → hold for VO → next)')
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
