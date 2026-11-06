#!/usr/bin/env node
/**
 * GitHub Pages SPA fallback — deep links (/journey, /teacher-practice/…)
 * must serve index.html. CI also does this; baking it into `npm run build`
 * keeps local `dist/` and manual uploads from hiding routes behind 404.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const index = join(dist, 'index.html')
if (!existsSync(index)) {
  console.error('pages-spa-fallback: dist/index.html missing — run vite build first')
  process.exit(1)
}
copyFileSync(index, join(dist, '404.html'))
writeFileSync(join(dist, '.nojekyll'), '')
console.log('pages-spa-fallback: wrote dist/404.html + dist/.nojekyll')
