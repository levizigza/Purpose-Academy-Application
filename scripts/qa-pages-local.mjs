import { chromium } from 'playwright'

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4173/Purpose-Academy-Application'
const findings = []
function note(s, a, m) {
  findings.push({ s, a, m })
  console.log(`[${s}] ${a}: ${m}`)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
page.on('pageerror', (e) => note('high', 'js', e.message))

try {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 })
  if (!(await page.getByRole('img', { name: 'Purpose Academy' }).count())) {
    note('high', 'public', 'Logo missing on home')
  }

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  if (!(await page.getByText(/Browser demo mode/i).count())) {
    note('medium', 'auth', 'Demo mode banner missing (ok if remote API mode)')
  }
  await page.getByRole('button', { name: 'Fill learner demo' }).click()
  await page.getByRole('button', { name: /Sign in/i }).click()
  await page.waitForURL('**/app/student**', { timeout: 10000 }).catch(() => note('critical', 'auth', 'Student login failed'))
  await page.waitForTimeout(800)
  if (!(await page.getByText('Your next step').count())) note('high', 'student', 'Missing next step')

  await page.goto(`${BASE}/app/student/courses`, { waitUntil: 'networkidle' })
  const lesson = page.locator('a[href*="/lessons/"]').first()
  if (!(await lesson.count())) note('high', 'student', 'No lessons')
  else {
    await lesson.click()
    await page.waitForLoadState('networkidle')
    const check = page.locator('[data-testid="knowledge-check"]')
    if (await check.count()) {
      await check.locator('button').nth(1).click().catch(() => {})
      await page.waitForTimeout(400)
      if (await page.getByRole('button', { name: 'Retry quiz' }).count()) {
        await page.getByRole('button', { name: 'Retry quiz' }).click()
        await page.waitForTimeout(200)
        await check.locator('button').first().click().catch(() => {})
      }
    }
    const mark = page.getByRole('button', { name: 'Mark lesson complete' })
    if (await mark.count()) {
      await mark.click()
      await page.waitForTimeout(600)
    } else {
      note('medium', 'student', 'Mark complete not available (quiz may need correct answers)')
    }
  }

  await page.getByRole('button', { name: 'Sign out' }).first().click().catch(() => {})
  await page.waitForTimeout(400)

  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' })
  const email = `qa${Date.now()}@example.com`
  await page.getByLabel('First and last name').fill('QA Tester')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Phone number').fill('403-555-0100')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByLabel('Confirm password').fill('password123')
  await page.getByLabel('Address').fill('Calgary, AB')
  await page.getByLabel('Emergency contact').fill('Parent 403-555-0199')
  await page.getByRole('button', { name: /Submit registration/i }).click()
  await page
    .waitForURL('**/registration**', { timeout: 10000 })
    .catch(() => note('critical', 'auth', `Register failed; url=${page.url()}`))
  await page.waitForTimeout(600)
  if (!(await page.getByText(/Waiting for approval|Registration status|pending/i).count())) {
    note('high', 'auth', 'Pending status missing after register')
  }

  await page.getByRole('button', { name: 'Sign out' }).first().click().catch(() => {})
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Fill admin demo' }).click()
  await page.getByRole('button', { name: /Sign in/i }).click()
  await page.waitForURL('**/app/admin**', { timeout: 10000 }).catch(() => note('critical', 'auth', 'Admin login failed'))
  await page.goto(`${BASE}/app/admin/students`, { waitUntil: 'networkidle' })
  const approve = page.getByRole('row', { name: /QA Tester/i }).getByRole('button', { name: 'Approve' })
  if (!(await approve.count())) note('high', 'admin', 'No Approve for QA Tester')
  else {
    await approve.click()
    await page.waitForTimeout(600)
  }

  await page.getByRole('button', { name: 'Sign out' }).first().click().catch(() => {})
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: /Sign in/i }).click()
  await page.waitForURL('**/app/student**', { timeout: 10000 }).catch(() =>
    note('critical', 'auth', 'Approved student re-login failed'),
  )
  await page.waitForTimeout(700)
  if (page.url().includes('registration')) note('high', 'auth', 'Still on registration after approval')
  if (!(await page.getByText('Your next step').count())) note('high', 'student', 'Approved student missing home CTA')

  await page.getByRole('button', { name: 'Sign out' }).first().click().catch(() => {})
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Fill instructor demo' }).click()
  await page.getByRole('button', { name: /Sign in/i }).click()
  await page
    .waitForURL('**/app/instructor**', { timeout: 10000 })
    .catch(() => note('critical', 'auth', 'Instructor login failed'))
} catch (e) {
  note('critical', 'runner', e instanceof Error ? e.message : String(e))
}

await browser.close()
console.log('SUMMARY', { count: findings.length, findings })
process.exit(findings.some((f) => f.s === 'critical' || f.s === 'high') ? 1 : 0)
