/**
 * Browser E2E: splash bypass, login (all roles), register, admin approve path.
 * Requires: npm run dev (web + api). Default web http://127.0.0.1:5173
 *
 * Usage: node scripts/e2e-auth.mjs [webBase]
 */
import { chromium } from 'playwright'

const webBase = (process.argv[2] || 'http://127.0.0.1:5174').replace(/\/$/, '')

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function loginAs(page, email, password, expectPath) {
  await page.goto(`${webBase}/login`, { waitUntil: 'networkidle' })
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => url.pathname.includes('/app/'), { timeout: 15000 })
  assert(page.url().includes(expectPath), `Expected ${expectPath}, got ${page.url()}`)
  console.log(`✓ login ${email} → ${page.url()}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.setDefaultTimeout(20000)

  try {
    // Deep link to login must work without completing splash
    await page.goto(`${webBase}/login`, { waitUntil: 'networkidle' })
    assert(await page.locator('#email').count(), 'Login form missing (#email)')
    console.log('✓ /login reachable without splash')

    await loginAs(page, 'student@purposeacademy.ca', 'student123', '/app/student')
    await page.click('text=Sign out')
    await page.waitForTimeout(400)

    await loginAs(page, 'pending@purposeacademy.ca', 'pending123', '/app/student/registration')
    await page.click('text=Sign out')
    await page.waitForTimeout(400)

    await loginAs(page, 'instructor@purposeacademy.ca', 'instructor123', '/app/instructor')
    await page.click('text=Sign out')
    await page.waitForTimeout(400)

    await loginAs(page, 'admin@purposeacademy.ca', 'admin123', '/app/admin')

    // Register a new student
    await page.click('text=Sign out')
    await page.goto(`${webBase}/register`, { waitUntil: 'networkidle' })
    const email = `e2e-${Date.now()}@example.com`
    await page.fill('#full_name', 'E2E Learner')
    await page.fill('#email', email)
    await page.fill('#phone', '403-555-0199')
    await page.fill('#password', 'password123')
    await page.fill('#confirm', 'password123')
    await page.fill('#address', 'Calgary, AB')
    await page.fill('#emergency_contact', 'Parent Contact')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/app\/student\/registration/, { timeout: 15000 })
    console.log(`✓ register ${email} → registration status`)

    // Admin approves them
    await page.click('text=Sign out')
    await loginAs(page, 'admin@purposeacademy.ca', 'admin123', '/app/admin')
    await page.goto(`${webBase}/app/admin/students`, { waitUntil: 'networkidle' })
    const row = page.locator('tr', { hasText: email })
    assert(await row.count(), `New student row not found for ${email}`)
    await row.getByRole('button', { name: 'Approve' }).click()
    await page.waitForTimeout(800)
    console.log('✓ admin approved new student')

    // New student can enter training home
    await page.click('text=Sign out')
    await loginAs(page, email, 'password123', '/app/student')
    assert(!page.url().includes('registration'), 'Approved student still on registration')
    console.log('✓ approved student reaches training home')

    console.log('\nAll browser E2E auth checks passed.')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('E2E FAILED:', err.message)
  process.exit(1)
})
