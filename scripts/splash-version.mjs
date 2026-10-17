#!/usr/bin/env node
/**
 * Splash craft version archive — snapshot / restore / list.
 *
 * Feedback decisions get overturned. This keeps restore points so we can
 * walk back a climb without archaeology.
 *
 * Usage:
 *   node scripts/splash-version.mjs list
 *   node scripts/splash-version.mjs snapshot v41 --note "dusk stage for light pop"
 *   node scripts/splash-version.mjs restore v40
 *   node scripts/splash-version.mjs show v40
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const archiveRoot = path.join(root, 'docs', 'splash-versions')
const manifestPath = path.join(archiveRoot, 'manifest.json')
const stylesPath = path.join(root, 'src', 'styles.css')
const beginMark = '/* === SPLASH_CRAFT_BEGIN === */'
const endMark = '/* === SPLASH_CRAFT_END === */'

const TRACKED = [
  'src/components/OpeningDoor.tsx',
  'src/auth/EntryPages.tsx',
]

function readManifest() {
  if (!fs.existsSync(manifestPath)) {
    return { versions: [], updatedAt: null }
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
}

function writeManifest(m) {
  m.updatedAt = new Date().toISOString()
  fs.mkdirSync(archiveRoot, { recursive: true })
  fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2) + '\n')
}

function gitHead() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

function sessionKeyFromEntry() {
  const t = fs.readFileSync(path.join(root, 'src/auth/EntryPages.tsx'), 'utf8')
  const m = t.match(/pa-crossed-threshold-v(\d+)/)
  return m ? `v${m[1]}` : null
}

function extractSplashCss(styles) {
  const start = styles.indexOf(beginMark)
  const end = styles.indexOf(endMark)
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `Missing ${beginMark} / ${endMark} markers in src/styles.css. Add them around the threshold splash block before snapshotting.`,
    )
  }
  return styles.slice(start, end + endMark.length)
}

function replaceSplashCss(styles, block) {
  const start = styles.indexOf(beginMark)
  const end = styles.indexOf(endMark)
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing splash craft markers in src/styles.css`)
  }
  return styles.slice(0, start) + block + styles.slice(end + endMark.length)
}

function snapshot(id, note) {
  if (!/^v\d+$/.test(id) && !/^[a-z0-9][a-z0-9.-]*$/i.test(id)) {
    throw new Error(`Bad version id "${id}". Prefer v41, v40-dusk, etc.`)
  }
  const dir = path.join(archiveRoot, id)
  fs.mkdirSync(dir, { recursive: true })

  const styles = fs.readFileSync(stylesPath, 'utf8')
  const splashCss = extractSplashCss(styles)
  fs.writeFileSync(path.join(dir, 'splash.css'), splashCss)

  for (const rel of TRACKED) {
    const src = path.join(root, rel)
    const dest = path.join(dir, path.basename(rel))
    fs.copyFileSync(src, dest)
  }

  const entry = {
    id,
    note: note || '',
    sessionKey: sessionKeyFromEntry(),
    commit: gitHead(),
    createdAt: new Date().toISOString(),
    files: ['splash.css', ...TRACKED.map((f) => path.basename(f))],
  }

  const manifest = readManifest()
  const idx = manifest.versions.findIndex((v) => v.id === id)
  if (idx >= 0) manifest.versions[idx] = entry
  else manifest.versions.unshift(entry)
  writeManifest(manifest)

  fs.writeFileSync(
    path.join(dir, 'NOTES.md'),
    `# Splash ${id}\n\n- **Session key:** \`${entry.sessionKey || 'unknown'}\`\n- **Commit at snapshot:** \`${entry.commit || 'n/a'}\`\n- **When:** ${entry.createdAt}\n- **Note:** ${entry.note || '(none)'}\n\n## Restore\n\n\`\`\`bash\nnode scripts/splash-version.mjs restore ${id}\n\`\`\`\n`,
  )

  console.log(`Snapshotted ${id} → docs/splash-versions/${id}/`)
  console.log(`  session ${entry.sessionKey} · commit ${entry.commit} · ${entry.note || 'no note'}`)
}

function restore(id) {
  const dir = path.join(archiveRoot, id)
  if (!fs.existsSync(dir)) {
    throw new Error(`No archive for ${id}. Run: node scripts/splash-version.mjs list`)
  }

  const splashCss = fs.readFileSync(path.join(dir, 'splash.css'), 'utf8')
  const styles = fs.readFileSync(stylesPath, 'utf8')
  fs.writeFileSync(stylesPath, replaceSplashCss(styles, splashCss))

  for (const rel of TRACKED) {
    const base = path.basename(rel)
    const src = path.join(dir, base)
    if (!fs.existsSync(src)) {
      console.warn(`  skip missing ${base}`)
      continue
    }
    fs.copyFileSync(src, path.join(root, rel))
  }

  const manifest = readManifest()
  const entry = manifest.versions.find((v) => v.id === id)
  console.log(`Restored splash craft from ${id}`)
  if (entry?.note) console.log(`  note: ${entry.note}`)
  console.log(`  Bump ENTERED_KEY if you want returning visitors to replay the opening.`)
  console.log(`  Then commit: git add src/auth/EntryPages.tsx src/components/OpeningDoor.tsx src/styles.css`)
}

function list() {
  const manifest = readManifest()
  if (!manifest.versions.length) {
    console.log('No splash versions archived yet.')
    console.log('  node scripts/splash-version.mjs snapshot v40 --note "baseline"')
    return
  }
  console.log('Splash craft versions (newest first)\n')
  for (const v of manifest.versions) {
    console.log(`  ${v.id.padEnd(12)} ${v.sessionKey || '?'.padEnd(4)}  ${v.commit || '--------'}  ${v.note || ''}`)
  }
  console.log(`\nRestore: node scripts/splash-version.mjs restore <id>`)
}

function show(id) {
  const notes = path.join(archiveRoot, id, 'NOTES.md')
  if (!fs.existsSync(notes)) throw new Error(`No archive for ${id}`)
  console.log(fs.readFileSync(notes, 'utf8'))
}

const [cmd, id, ...rest] = process.argv.slice(2)
let note = ''
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--note') note = rest[i + 1] || ''
}

try {
  if (cmd === 'list' || !cmd) list()
  else if (cmd === 'snapshot') {
    if (!id) throw new Error('snapshot requires an id, e.g. v41')
    snapshot(id, note)
  } else if (cmd === 'restore') {
    if (!id) throw new Error('restore requires an id, e.g. v40')
    restore(id)
  } else if (cmd === 'show') {
    if (!id) throw new Error('show requires an id')
    show(id)
  } else {
    throw new Error(`Unknown command "${cmd}". Use list | snapshot | restore | show`)
  }
} catch (err) {
  console.error(err.message || err)
  process.exit(1)
}
