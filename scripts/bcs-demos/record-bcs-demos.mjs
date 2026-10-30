/**
 * Record Purpose Academy Basic Computer Skills screen demos with Playwright.
 * Outputs silent MP4s under /tmp/bcs-demos/ for the Python video builder.
 *
 * Usage: node scripts/bcs-demos/record-bcs-demos.mjs
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const DEMO_HTML = path.join(__dirname, 'desktop.html')
const OUT_DIR = '/tmp/bcs-demos'

const DEMOS = [
  'power',
  'keyboard',
  'folder',
  'subfolder',
  'save-name',
  'paragraph',
  'save-doc',
  'email-send',
  'email-reply',
  'attach-save',
  'safe',
]

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  return 'application/octet-stream'
}

async function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    const filePath = url.pathname === '/' || url.pathname.startsWith('/desktop')
      ? DEMO_HTML
      : path.join(__dirname, path.normalize(url.pathname).replace(/^\/+/, ''))
    if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath)) {
      res.writeHead(404)
      res.end('not found')
      return
    }
    res.writeHead(200, { 'Content-Type': contentType(filePath) })
    fs.createReadStream(filePath).pipe(res)
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  return { server, port }
}

async function recordDemo(browser, port, demo) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1280, height: 720 },
    },
  })
  const page = await context.newPage()
  const url = `http://127.0.0.1:${port}/desktop.html?demo=${encodeURIComponent(demo)}`
  console.log('RECORD', demo, url)
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__bcsReady === true, null, { timeout: 15000 })
  await page.waitForFunction(() => window.__bcsDone === true, null, { timeout: 120000 })
  await page.waitForTimeout(800)
  const video = page.video()
  await context.close()
  const rawPath = await video.path()
  const outPath = path.join(OUT_DIR, `${demo}.webm`)
  if (rawPath !== outPath) {
    fs.renameSync(rawPath, outPath)
  }
  // Transcode to mp4 for ffmpeg concat friendliness
  const mp4Path = path.join(OUT_DIR, `${demo}.mp4`)
  const { spawnSync } = await import('node:child_process')
  const r = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      outPath,
      '-vf',
      'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-an',
      '-movflags',
      '+faststart',
      mp4Path,
    ],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) {
    console.error(r.stderr)
    throw new Error(`ffmpeg failed for ${demo}`)
  }
  console.log('OK', demo, mp4Path)
}

function parseOnly() {
  const arg = process.argv.find((a) => a.startsWith('--only='))
  if (!arg) return null
  return new Set(
    arg
      .slice('--only='.length)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
}

async function main() {
  if (!fs.existsSync(DEMO_HTML)) {
    throw new Error(`Missing ${DEMO_HTML}`)
  }
  const only = parseOnly()
  const demos = only ? DEMOS.filter((d) => only.has(d)) : DEMOS
  if (!demos.length) {
    throw new Error(`No demos matched --only (${[...(only || [])].join(',')})`)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (!f.endsWith('.webm') && !f.endsWith('.mp4')) continue
    const stem = path.basename(f, path.extname(f))
    if (only && !only.has(stem)) continue
    fs.unlinkSync(path.join(OUT_DIR, f))
  }

  const { server, port } = await startServer()
  const browser = await chromium.launch({ headless: true })
  try {
    for (const demo of demos) {
      await recordDemo(browser, port, demo)
    }
  } finally {
    await browser.close()
    server.close()
  }
  console.log('Wrote demos to', OUT_DIR, only ? `(only=${[...only].join(',')})` : '')
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isDirectRun) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

export { main as recordBcsDemos, DEMOS }
