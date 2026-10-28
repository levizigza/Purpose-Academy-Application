/**
 * Shared helpers for Practice station mouse+VO demo recordings.
 */
import { mkdirSync, renameSync, existsSync, unlinkSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

export const VOICE = 'en-US-JennyNeural'
export const RATE = '-8%'
export const PITCH = '-2Hz'
export const W = 1280
export const H = 720

export const ALL_EXPLAINER_IDS = [
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

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts })
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout)
    throw new Error(`${cmd} ${args[0]} failed (${r.status})`)
  }
  return r
}

export function synth(text, outMp3) {
  run('edge-tts', [
    `--voice=${VOICE}`,
    `--rate=${RATE}`,
    `--pitch=${PITCH}`,
    `--text=${text}`,
    `--write-media=${outMp3}`,
  ])
  return durationOf(outMp3)
}

export function durationOf(media) {
  const probe = run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    media,
  ])
  return parseFloat(probe.stdout.trim())
}

export async function injectCursor(page) {
  await page.addInitScript(() => {
    const boot = () => {
      if (document.getElementById('pa-demo-cursor')) return
      const c = document.createElement('div')
      c.id = 'pa-demo-cursor'
      c.setAttribute('aria-hidden', 'true')
      c.innerHTML =
        '<svg width="28" height="28" viewBox="0 0 28 28" fill="none">' +
        '<path d="M4 3 L4 22 L10 16 L14 24 L17 23 L13 15 L21 15 Z" fill="#041526" stroke="#e8a317" stroke-width="1.5"/>' +
        '</svg>'
      Object.assign(c.style, {
        position: 'fixed',
        left: '0px',
        top: '0px',
        width: '28px',
        height: '28px',
        pointerEvents: 'none',
        zIndex: '2147483647',
        transform: 'translate(-2px, -2px)',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.45))',
        transition: 'left 40ms linear, top 40ms linear',
      })
      document.documentElement.appendChild(c)
      window.__paCursor = (x, y) => {
        c.style.left = `${x}px`
        c.style.top = `${y}px`
      }
      document.addEventListener(
        'mousemove',
        (e) => {
          c.style.left = `${e.clientX}px`
          c.style.top = `${e.clientY}px`
        },
        true,
      )
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot)
    } else {
      boot()
    }
    try {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak = () => {}
    } catch {
      /* ignore */
    }
  })
}

export async function moveTo(page, locator, { steps = 28, settle = 350 } = {}) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('moveTo: no box')
  const x = box.x + box.width / 2
  const y = box.y + Math.min(box.height / 2, 22)
  await page.mouse.move(x, y, { steps })
  await page.evaluate(([cx, cy]) => window.__paCursor?.(cx, cy), [x, y])
  await page.waitForTimeout(settle)
  return { x, y }
}

export async function clickAt(page, locator, opts = {}) {
  const { x, y } = await moveTo(page, locator, opts)
  await page.mouse.click(x, y)
  await page.waitForTimeout(opts.after ?? 500)
  return { x, y }
}

export async function typeInto(page, locator, text, { delay = 120 } = {}) {
  await clickAt(page, locator, { steps: 22, settle: 280, after: 300 })
  await page.keyboard.type(text, { delay })
  await page.waitForTimeout(400)
}

export function prepScript({ step, pathway = 'construction', forceExplainersSeen = true }) {
  return {
    step,
    pathway,
    forceExplainersSeen,
    explainers: ALL_EXPLAINER_IDS,
  }
}

export async function gotoStation(page, base, { step, pathway = 'construction' }) {
  await page.addInitScript(
    ({ step, pathway, explainers }) => {
      localStorage.setItem('pa-shell-mode-v2', 'course')
      localStorage.setItem('pa-crossed-threshold-v44', '1')
      localStorage.setItem('pa-practice-mode-v1', '1')
      localStorage.setItem('pa-practice-name-v1', 'DemoLearner')
      localStorage.setItem('pa-practice-force-lesson-v1', '1')
      localStorage.setItem('pa-student-journey-step-v1', String(step))
      localStorage.setItem('pa-active-pathway-v1', pathway)
      localStorage.setItem(
        'pa-station-coach-seen-v1',
        JSON.stringify(Object.fromEntries(explainers.map((id) => [id, true]))),
      )
      localStorage.setItem(
        'pa-station-explainers-seen-v1',
        JSON.stringify(Object.fromEntries(explainers.map((id) => [id, true]))),
      )
      localStorage.setItem('pa-nav-cues-seen-v1', JSON.stringify({}))
    },
    prepScript({ step, pathway }),
  )
  await page.goto(`${base}/journey`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(900)
}

export function buildVoTrack(work, beats) {
  const list = join(work, 'vo-list.txt')
  const parts = []
  const durs = []
  for (let i = 0; i < beats.length; i++) {
    const mp3 = join(work, `beat-${i}.mp3`)
    const d = synth(beats[i].text, mp3)
    durs.push(d)
    parts.push(`file '${mp3}'`)
    if (i < beats.length - 1) {
      const gap = join(work, `gap-${i}.mp3`)
      run('ffmpeg', [
        '-y',
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=24000:cl=mono',
        '-t',
        '0.35',
        '-q:a',
        '9',
        '-acodec',
        'libmp3lame',
        gap,
      ])
      parts.push(`file '${gap}'`)
    }
  }
  writeFileSync(list, parts.join('\n') + '\n')
  const vo = join(work, 'vo-full.mp3')
  run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', vo])
  return { vo, total: durationOf(vo), durs }
}

export function mux(work, videoWebm, voMp3, outPath, previewName) {
  mkdirSync(join(outPath, '..'), { recursive: true })
  const silentMp4 = join(work, 'silent.mp4')
  run('ffmpeg', [
    '-y',
    '-i',
    videoWebm,
    '-vf',
    `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30`,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-an',
    silentMp4,
  ])

  const vDur = durationOf(silentMp4)
  const aDur = durationOf(voMp3)
  const target = Math.max(vDur, aDur) + 0.4
  const final = join(work, 'mux.mp4')
  run('ffmpeg', [
    '-y',
    '-i',
    silentMp4,
    '-i',
    voMp3,
    '-filter_complex',
    `[0:v]tpad=stop_mode=clone:stop_duration=${Math.max(0, target - vDur).toFixed(3)}[v];` +
      `[1:a]adelay=200|200,apad=whole_dur=${target.toFixed(3)}[a]`,
    '-map',
    '[v]',
    '-map',
    '[a]',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-t',
    target.toFixed(3),
    '-movflags',
    '+faststart',
    final,
  ])

  if (existsSync(outPath)) unlinkSync(outPath)
  renameSync(final, outPath)

  const art = '/opt/cursor/artifacts'
  mkdirSync(art, { recursive: true })
  const preview = join(art, previewName)
  run('ffmpeg', ['-y', '-i', outPath, '-c', 'copy', preview])
  return { out: outPath, preview, vDur, aDur, target, bytes: readFileSync(outPath).length }
}

export async function recordWithBrowser(browser, work, runScene) {
  mkdirSync(work, { recursive: true })
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: work, size: { width: W, height: H } },
  })
  const page = await context.newPage()
  await injectCursor(page)
  try {
    await runScene(page)
  } finally {
    const video = page.video()
    await context.close()
    const raw = await video.path()
    const webm = join(work, 'raw.webm')
    if (raw !== webm) renameSync(raw, webm)
    return webm
  }
}
