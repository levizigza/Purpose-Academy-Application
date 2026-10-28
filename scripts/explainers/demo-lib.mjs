/**
 * Shared helpers for Practice station mouse+VO demo recordings.
 *
 * Sync model (beat-locked):
 * 1. Synth each VO beat → know durations up front.
 * 2. Navigate/setup (silent VO), then for each beat: run the matching mouse act
 *    and hold until that beat’s VO window is done.
 * 3. Lay Jenny VO onto the recorded beat windows (silence during setup + holds).
 * 4. Mux — picture and words share one timeline; no “freeze last frame while VO finishes.”
 */
import { mkdirSync, renameSync, existsSync, unlinkSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

export const VOICE = 'en-US-JennyNeural'
export const RATE = '-8%'
export const PITCH = '-2Hz'
export const W = 1280
export const H = 720
/** Extra hold after VO ends so the eye can rest on the result. */
export const BEAT_TAIL = 0.45
/** Breath before first VO word inside a beat window. */
export const BEAT_LEAD = 0.18

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
  /* python -m: edge-tts console script is often missing from PATH in cloud agents */
  run('python3', [
    '-m',
    'edge_tts',
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

export async function gotoStation(
  page,
  base,
  { step, pathway = 'construction', shell = 'course' } = {},
) {
  await page.addInitScript(
    ({ step, pathway, explainers, shell }) => {
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
    { ...prepScript({ step, pathway }), shell },
  )
  await page.goto(`${base}/journey`, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(900)
}

/** Synth every beat; return per-beat mp3 paths + durations. */
export function synthBeats(work, beats) {
  const files = []
  const durs = []
  for (let i = 0; i < beats.length; i++) {
    const mp3 = join(work, `beat-${i}.mp3`)
    const d = synth(beats[i].text, mp3)
    files.push(mp3)
    durs.push(d)
  }
  return { files, durs }
}

/**
 * Legacy concat VO (kept for tooling). Prefer buildTimelineVo for sync.
 * @deprecated use buildTimelineVo
 */
export function buildVoTrack(work, beats) {
  const { files, durs } = synthBeats(work, beats)
  const list = join(work, 'vo-list.txt')
  const parts = []
  for (let i = 0; i < files.length; i++) {
    parts.push(`file '${files[i]}'`)
    if (i < files.length - 1) {
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

function makeSilence(outMp3, seconds) {
  const t = Math.max(0.05, seconds)
  run('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=24000:cl=mono',
    '-t',
    t.toFixed(3),
    '-q:a',
    '9',
    '-acodec',
    'libmp3lame',
    outMp3,
  ])
}

/**
 * Build VO that starts each spoken beat at timeline[i].start (+ lead),
 * matching the paced mouse recording.
 */
export function buildTimelineVo(work, beatFiles, timeline, videoDur) {
  const list = join(work, 'vo-timeline.txt')
  const parts = []
  let cursor = 0
  for (let i = 0; i < timeline.length; i++) {
    const beat = timeline[i]
    const voStart = beat.start + BEAT_LEAD
    const gapBefore = voStart - cursor
    if (gapBefore > 0.04) {
      const sil = join(work, `sil-before-${i}.mp3`)
      makeSilence(sil, gapBefore)
      parts.push(`file '${sil}'`)
      cursor += gapBefore
    }
    parts.push(`file '${beatFiles[i]}'`)
    cursor += beat.voDur
    /* Pad silence through end of visual beat window so next VO waits for next act */
    const padTo = beat.end
    if (padTo > cursor + 0.04) {
      const sil = join(work, `sil-after-${i}.mp3`)
      makeSilence(sil, padTo - cursor)
      parts.push(`file '${sil}'`)
      cursor = padTo
    }
  }
  if (videoDur > cursor + 0.04) {
    const sil = join(work, 'sil-tail.mp3')
    makeSilence(sil, videoDur - cursor)
    parts.push(`file '${sil}'`)
    cursor = videoDur
  }
  writeFileSync(list, parts.join('\n') + '\n')
  const vo = join(work, 'vo-timeline.mp3')
  run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', vo])
  return { vo, total: durationOf(vo), laidCursor: cursor }
}

export function muxSynced(work, videoWebm, voMp3, outPath, previewName) {
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
  /* Timeline VO is built to video length — only tiny pad for container safety */
  const target = Math.max(vDur, aDur) + 0.15
  const final = join(work, 'mux.mp4')
  run('ffmpeg', [
    '-y',
    '-i',
    silentMp4,
    '-i',
    voMp3,
    '-filter_complex',
    `[0:v]tpad=stop_mode=clone:stop_duration=${Math.max(0, target - vDur).toFixed(3)}[v];` +
      `[1:a]apad=whole_dur=${target.toFixed(3)}[a]`,
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

/** @deprecated prefer muxSynced after buildTimelineVo */
export function mux(work, videoWebm, voMp3, outPath, previewName) {
  return muxSynced(work, videoWebm, voMp3, outPath, previewName)
}

/**
 * Record one station with beat-locked pacing.
 * station: { setup(page), beats: [{id,text,act(page)}] }
 */
export async function recordSyncedStation(browser, work, station) {
  mkdirSync(work, { recursive: true })
  const { files: beatFiles, durs } = synthBeats(work, station.beats)
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: work, size: { width: W, height: H } },
  })
  const page = await context.newPage()
  await injectCursor(page)
  /** @type {{id:string,start:number,end:number,voDur:number,actMs:number}[]} */
  const timeline = []
  const wallT0 = Date.now()
  let setupDur = 0
  try {
    await station.setup(page)
    /* Brief settle so first VO isn't over a still-painting frame */
    await page.waitForTimeout(400)
    const demoT0 = Date.now()
    setupDur = (demoT0 - wallT0) / 1000
    for (let i = 0; i < station.beats.length; i++) {
      const beat = station.beats[i]
      const start = (Date.now() - demoT0) / 1000
      const actT0 = Date.now()
      await beat.act(page)
      const actMs = Date.now() - actT0
      const need = durs[i] + BEAT_LEAD + BEAT_TAIL
      const elapsed = (Date.now() - demoT0) / 1000 - start
      if (elapsed < need) {
        await page.waitForTimeout(Math.ceil((need - elapsed) * 1000))
      }
      const end = (Date.now() - demoT0) / 1000
      timeline.push({
        id: beat.id,
        start: start + setupDur,
        end: end + setupDur,
        voDur: durs[i],
        actMs,
      })
      console.log(
        `  beat ${i} ${beat.id}: visual ${timeline[i].start.toFixed(2)}–${timeline[i].end.toFixed(2)}s (act ${(actMs / 1000).toFixed(2)}s, vo ${durs[i].toFixed(2)}s)`,
      )
    }
    await page.waitForTimeout(500)
  } catch (err) {
    await context.close().catch(() => {})
    throw err
  }
  const video = page.video()
  await context.close()
  const raw = await video.path()
  const webm = join(work, 'raw.webm')
  if (raw !== webm) renameSync(raw, webm)
  const vDurRaw = durationOf(webm)
  /* Refine setup offset if Playwright's muxed length disagrees with wall clock.
     Clamp so beats never start before ~0.2s into the file. */
  if (timeline.length) {
    const pacedEnd = timeline[timeline.length - 1].end - setupDur
    const inferredSetup = Math.max(0, vDurRaw - pacedEnd - 0.55)
    const drift = inferredSetup - setupDur
    if (Math.abs(drift) > 0.35) {
      console.log(`  setup refine ${setupDur.toFixed(2)} → ${inferredSetup.toFixed(2)} (drift ${drift.toFixed(2)}s)`)
      for (const b of timeline) {
        b.start += drift
        b.end += drift
      }
      setupDur = inferredSetup
      if (timeline[0].start < 0.2) {
        const bump = 0.2 - timeline[0].start
        for (const b of timeline) {
          b.start += bump
          b.end += bump
        }
        setupDur += bump
      }
    }
  }
  writeFileSync(join(work, 'timeline.json'), JSON.stringify({ setupDur, timeline, durs }, null, 2))
  const { vo } = buildTimelineVo(work, beatFiles, timeline, vDurRaw)
  return { webm, vo, timeline, durs, setupDur, vDurRaw }
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
