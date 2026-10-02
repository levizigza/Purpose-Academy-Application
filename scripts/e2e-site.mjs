/**
 * Extended site smoke: public pages + authenticated learning/admin actions.
 * Usage: node scripts/e2e-site.mjs [webBase]
 */
import { chromium } from 'playwright'

const webBase = (process.argv[2] || 'http://localhost:5174').replace(/\/$/, '')

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function login(page, email, password) {
  await page.goto(`${webBase}/login`, { waitUntil: 'networkidle' })
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => url.pathname.includes('/app/'), { timeout: 15000 })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.setDefaultTimeout(20000)

  try {
    for (const path of ['/', '/programs', '/admissions', '/contact', '/privacy']) {
      const res = await page.goto(`${webBase}${path}`, { waitUntil: 'networkidle' })
      assert(res && res.ok(), `${path} failed: ${res?.status()}`)
      console.log(`✓ public ${path}`)
    }

    await login(page, 'student@purposeacademy.ca', 'student123')
    for (const path of [
      '/app/student',
      '/app/student/foundation',
      '/app/student/courses',
      '/app/student/assignments',
      '/app/student/progress',
      '/app/student/skills',
      '/app/student/profile',
      '/app/student/programs',
    ]) {
      const res = await page.goto(`${webBase}${path}`, { waitUntil: 'networkidle' })
      assert(res && res.ok(), `${path} failed: ${res?.status()}`)
      assert(!page.url().includes('/login'), `${path} redirected to login`)
      console.log(`✓ student ${path}`)
    }

    await page.click('text=Sign out')
    await login(page, 'instructor@purposeacademy.ca', 'instructor123')
    for (const path of [
      '/app/instructor',
      '/app/instructor/assignments',
      '/app/instructor/observe',
      '/app/instructor/safety',
      '/app/instructor/students',
    ]) {
      const res = await page.goto(`${webBase}${path}`, { waitUntil: 'networkidle' })
      assert(res && res.ok(), `${path} failed`)
      console.log(`✓ instructor ${path}`)
    }

    await page.click('text=Sign out')
    await login(page, 'admin@purposeacademy.ca', 'admin123')
    for (const path of [
      '/app/admin',
      '/app/admin/students',
      '/app/admin/courses',
      '/app/admin/schedules',
      '/app/admin/reports',
      '/app/admin/privacy',
    ]) {
      const res = await page.goto(`${webBase}${path}`, { waitUntil: 'networkidle' })
      assert(res && res.ok(), `${path} failed`)
      console.log(`✓ admin ${path}`)
    }

    console.log('\nAll site route checks passed.')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('SITE E2E FAILED:', err.message)
  process.exit(1)
})
