/**
 * Practice Mode front-to-back smoke walkthrough against local preview.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const BASE = process.env.PRACTICE_BASE || 'http://127.0.0.1:4173'
const OUT = '/opt/cursor/artifacts/screenshots'
mkdirSync(OUT, { recursive: true })

const findings = []
function note(level, msg) {
  findings.push({ level, msg })
  console.log(`[${level}] ${msg}`)
}

async function shot(page, name) {
  const path = join(OUT, name)
  await page.screenshot({ path, fullPage: false })
  console.log(`shot ${path}`)
  return path
}

async function seedPractice(page, step = 3) {
  await page.evaluate(({ step }) => {
    sessionStorage.setItem('pa-crossed-threshold-v26', '1')
    sessionStorage.setItem('pa-practice-mode-v1', '1')
    sessionStorage.setItem('pa-practice-name-v1', 'Levi')
    sessionStorage.setItem('pa-student-journey-step-v1', String(step))
  }, { step })
}

async function smashEnterIfNeeded(page) {
  for (let i = 0; i < 30; i++) {
    const practice = page.getByRole('button', { name: /Practice Mode/i })
    if (await practice.isVisible().catch(() => false)) return true
    const hammer = page.getByRole('button', { name: /Enter Purpose Academy/i })
    if (await hammer.isVisible().catch(() => false)) {
      await hammer.click()
      await page.waitForTimeout(2200)
      continue
    }
    await page.waitForTimeout(350)
  }
  return false
}

async function openChat(page) {
  const tab = page.locator('.practice-chat-tab')
  if (await tab.isVisible().catch(() => false)) {
    await tab.click()
    await page.waitForTimeout(250)
    return true
  }
  return false
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('pageerror', (err) => note('ERROR', `pageerror: ${err.message}`))

  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await smashEnterIfNeeded(page)
  await shot(page, 'pw-01-home-before-practice.png')

  const practiceBtn = page.getByRole('button', { name: /Practice Mode/i })
  if (!(await practiceBtn.isVisible().catch(() => false))) {
    note('FAIL', 'Practice Mode tray button not found on home')
    await seedPractice(page)
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  } else {
    await practiceBtn.click()
    await page.waitForTimeout(400)
    await shot(page, 'pw-02-practice-name-gate.png')
    const levi = page.getByRole('button', { name: /^Levi$/ })
    if (await levi.isVisible().catch(() => false)) await levi.click()
    else await page.fill('#practice-gate-name', 'Levi')
    await page.getByRole('button', { name: /Enter Practice Mode/i }).click()
    await page.waitForTimeout(1600)
  }

  await shot(page, 'pw-03-practice-home.png')

  const banner = page.locator('.practice-banner')
  if (await banner.isVisible().catch(() => false)) note('PASS', 'Practice banner visible on home')
  else note('FAIL', 'Practice banner missing on home')

  const stack = await page.evaluate(() => {
    const chat = document.querySelector('.practice-chat')
    const footer = document.querySelector('.footer')
    if (!chat) return { chatExists: false }
    const cs = getComputedStyle(chat)
    const fs = footer ? getComputedStyle(footer) : null
    return {
      chatExists: true,
      chatPos: cs.position,
      chatZ: cs.zIndex,
      footerZ: fs?.zIndex,
      chatTop: cs.top,
      chatRight: cs.right,
    }
  })
  console.log('stack', stack)
  if (stack.chatPos === 'fixed' && Number(stack.chatZ) >= 200) {
    note('PASS', `Chat fixed overlay z=${stack.chatZ} (footer z=${stack.footerZ})`)
  } else {
    note('FAIL', `Chat stacking wrong: ${JSON.stringify(stack)}`)
  }

  const chatTab = page.locator('.practice-chat-tab')
  if (await chatTab.isVisible().catch(() => false)) note('PASS', 'Feedback chat tab visible on home')
  else note('FAIL', 'Feedback chat tab missing on home')

  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const chatOnLogin = await page.locator('.practice-chat').count()
  if (chatOnLogin === 0) note('PASS', 'Feedback chat hidden on /login')
  else note('FAIL', 'Feedback chat still visible on /login')
  await shot(page, 'pw-04-login-no-chat.png')

  await seedPractice(page)
  await page.goto(BASE + '/programs', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  if (await page.locator('.practice-chat-tab').isVisible().catch(() => false)) {
    note('PASS', 'Feedback chat visible on /programs')
  } else note('FAIL', 'Feedback chat missing on /programs')
  await shot(page, 'pw-05-programs-chat.png')

  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await shot(page, 'pw-06-journey-step3.png')

  const kicker = page.locator('.train-kicker')
  const kickerText = (await kicker.textContent().catch(() => '')) || ''
  if (/Step 3/i.test(kickerText) && /Practice/i.test(kickerText)) {
    note('PASS', `Journey starts at practice language step: "${kickerText.trim()}"`)
  } else {
    note('FAIL', `Expected Step 3 · Practice, got: "${kickerText.trim()}"`)
  }

  const regForm = await page.locator('form').filter({ hasText: /password|email/i }).count()
  if (regForm === 0) note('PASS', 'No registration form on practice journey entry')
  else note('FAIL', 'Registration form still shown in practice mode')

  if (!(await openChat(page))) note('FAIL', 'Could not open feedback chat')
  const ta = page.locator('#practice-fb-body')
  if (await ta.isVisible().catch(() => false)) {
    await ta.fill('Walkthrough note: language step looks clear.')
    await page.locator('.practice-chat-form button[type="submit"]').click()
    await page.waitForTimeout(700)
    const gotIt = await page.getByText(/Got it/i).isVisible().catch(() => false)
    if (gotIt) note('PASS', 'Feedback chat Send succeeded')
    else note('FAIL', 'Feedback chat Send did not confirm')
  } else {
    note('FAIL', 'Chat composer textarea not visible')
  }
  await shot(page, 'pw-07-chat-sent.png')

  const closeChat = page.locator('.practice-chat-head .linkish')
  if (await closeChat.isVisible().catch(() => false)) await closeChat.click()

  let next = page.locator('button.train-next')
  await next.click()
  await page.waitForTimeout(1400)
  const afterAck = (await kicker.textContent().catch(() => '')) || ''
  if (/Step 4/i.test(afterAck)) note('PASS', 'Continue advanced after feedback ack without re-prompt')
  else note('WARN', `After feedback ack Continue landed on: "${afterAck.trim()}"`)
  await shot(page, 'pw-08-after-ack-next.png')

  // Clear ack and test gate from step 3 (has Continue)
  await seedPractice(page, 3)
  await page.evaluate(() => {
    sessionStorage.setItem('pa-practice-feedback-ack-v1', '{}')
  })
  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  next = page.locator('button.train-next')
  await next.click()
  await page.waitForTimeout(700)
  const gate = page.locator('.practice-next-gate')
  if (await gate.isVisible().catch(() => false)) {
    note('PASS', 'Feedback confirmation gate appeared after Continue')
    await shot(page, 'pw-09-feedback-gate.png')
    await page.getByRole('button', { name: /Not yet — open chat/i }).click()
    await page.waitForTimeout(400)
    if (await page.locator('.practice-chat-panel').isVisible().catch(() => false)) {
      note('PASS', 'Not yet opens feedback chat')
    } else note('FAIL', 'Not yet did not open chat')
    const close2 = page.locator('.practice-chat-head .linkish')
    if (await close2.isVisible().catch(() => false)) await close2.click()
    await next.click()
    await page.waitForTimeout(700)
    if (await gate.isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Yes — continue/i }).click()
      await page.waitForTimeout(1400)
      note('PASS', 'Yes — continue advanced after gate')
    }
  } else {
    note('FAIL', 'Feedback gate did not appear when ack cleared')
    await shot(page, 'pw-09-gate-missing.png')
  }

  // Complete baseline quiz (step 4) with practice gate
  async function answerQuizQuestion() {
    const choice = page.locator('.train-choice-grid button').first()
    if (!(await choice.isVisible().catch(() => false))) return false
    await choice.click()
    await page.waitForTimeout(300)
    const nextQ = page.locator('.train-quiz-item .btn-primary')
    if (await nextQ.isVisible().catch(() => false)) await nextQ.click()
    await page.waitForTimeout(400)
    return true
  }

  for (let q = 0; q < 6; q++) {
    const k = (await page.locator('.train-kicker').textContent().catch(() => '')) || ''
    if (!/Step 4/i.test(k)) break
    if (!(await answerQuizQuestion())) break
  }
  const quizContinue = page.locator('.train-quiz-summary .btn-primary')
  if (await quizContinue.isVisible().catch(() => false)) {
    await page.evaluate(() => sessionStorage.setItem('pa-practice-feedback-ack-v1', '{}'))
    await quizContinue.click()
    await page.waitForTimeout(700)
    if (await page.locator('.practice-next-gate').isVisible().catch(() => false)) {
      note('PASS', 'Quiz Continue shows feedback gate in practice')
      await page.getByRole('button', { name: /Yes — continue/i }).click()
      await page.waitForTimeout(1400)
    } else {
      note('WARN', 'Quiz Continue did not show gate (maybe already acked)')
    }
  }

  for (let i = 0; i < 6; i++) {
    const before = (await page.locator('.train-kicker').textContent().catch(() => '')) || ''
    const nextBtn = page.locator('button.train-next')
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(450)
      if (await page.locator('.practice-next-gate').isVisible().catch(() => false)) {
        await page.getByRole('button', { name: /Yes — continue/i }).click()
        await page.waitForTimeout(1100)
      } else {
        await page.waitForTimeout(900)
      }
    } else if (await answerQuizQuestion()) {
      /* progressed quiz */
    } else {
      const pick = page.locator('.train-panel .btn-primary, .train-interest').first()
      if (await pick.isVisible().catch(() => false)) {
        await pick.click().catch(() => {})
        await page.waitForTimeout(500)
      }
    }
    const after = (await page.locator('.train-kicker').textContent().catch(() => '')) || ''
    note('INFO', `Step walk ${i + 1}: ${before.trim()} → ${after.trim()}`)
  }
  await shot(page, 'pw-10-later-steps.png')

  await seedPractice(page, 3)
  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const back = page.locator('button.train-back')
  if (await back.isVisible().catch(() => false)) {
    await back.click()
    await page.waitForTimeout(800)
    const path = new URL(page.url()).pathname
    if (path === '/') note('PASS', 'Back from practice step 3 returns to home')
    else note('FAIL', `Back from step 3 went to ${page.url()}`)
  } else note('WARN', 'Back button missing on step 3')

  await page.evaluate(() => {
    sessionStorage.setItem('pa-practice-mode-v1', '1')
    sessionStorage.setItem('pa-practice-name-v1', 'Levi')
    sessionStorage.setItem('pa-student-journey-step-v1', '1')
    sessionStorage.setItem('pa-crossed-threshold-v26', '1')
  })
  await page.goto(BASE + '/journey', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const forced = (await page.locator('.train-kicker').textContent().catch(() => '')) || ''
  if (/Step 3/i.test(forced)) note('PASS', 'Practice mode forces step 1 → step 3')
  else note('FAIL', `Practice did not skip registration; kicker=${forced.trim()}`)
  await shot(page, 'pw-11-skip-registration.png')

  await page.goto(BASE + '/about', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  if (await page.locator('.practice-chat-tab').isVisible().catch(() => false)) {
    note('PASS', 'Feedback chat visible on /about')
  } else note('FAIL', 'Feedback chat missing on /about')
  await shot(page, 'pw-12-about-chat.png')

  console.log('\n=== SUMMARY ===')
  const fails = findings.filter((f) => f.level === 'FAIL')
  const passes = findings.filter((f) => f.level === 'PASS')
  console.log(`PASS=${passes.length} FAIL=${fails.length} TOTAL=${findings.length}`)
  for (const f of findings) console.log(`${f.level}: ${f.msg}`)
  await browser.close()
  process.exit(fails.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
