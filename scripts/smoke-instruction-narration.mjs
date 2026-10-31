import { chromium } from 'playwright'
import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const BASE = process.env.PA_BASE || 'http://127.0.0.1:4173/Purpose-Academy-Application'
const OUT = '/tmp/instruction-narration-smoke/out'
const ART = '/opt/cursor/artifacts'
mkdirSync(OUT, { recursive: true }); mkdirSync(ART, { recursive: true })
const EXPLAINERS = ['workplace-words','language-organize','eye-spy','sentence-structure','word-action','video-match','copycat','workplace-instructions','computer-skills','site-language','safety','tools','systems','equipment-video','your-language']
async function prep(page, { shell, step, coachSeen=false, explainerSeen=true }) {
  await page.addInitScript(({ shell, step, coachSeen, explainerSeen, explainers }) => {
    localStorage.setItem('pa-shell-mode-v2', shell === 'phone' ? 'phone' : 'course')
    if (shell === 'phone') { localStorage.setItem('pa-phone-phase-v1', 'app'); sessionStorage.setItem('pa-phone-phase-v1', 'app') }
    else { localStorage.setItem('pa-desktop-phase-v1', 'ready'); sessionStorage.setItem('pa-desktop-phase-v1', 'ready') }
    sessionStorage.setItem('pa-crossed-threshold-v44', '1')
    localStorage.setItem('pa-practice-mode-v1', '1')
    localStorage.setItem('pa-practice-name-v1', 'NarrationSmoke')
    localStorage.setItem('pa-practice-force-lesson-v1', '1')
    localStorage.setItem('pa-student-journey-step-v1', String(step))
    localStorage.setItem('pa-active-pathway-v1', 'construction')
    localStorage.setItem('pa-support-lang-v1', 'Spanish')
    localStorage.setItem('pa-nav-cues-seen-v1', JSON.stringify({ all: true }))
    if (coachSeen) localStorage.setItem('pa-station-coach-seen-v1', JSON.stringify(Object.fromEntries(explainers.map((id)=>[id,true]))))
    else localStorage.removeItem('pa-station-coach-seen-v1')
    if (explainerSeen) localStorage.setItem('pa-station-explainers-seen-v1', JSON.stringify(Object.fromEntries(explainers.map((id)=>[id,true]))))
    else localStorage.removeItem('pa-station-explainers-seen-v1')
  }, { shell, step, coachSeen, explainerSeen, explainers: EXPLAINERS })
}
async function shot(page, name){ const path=join(OUT,name); await page.screenshot({path, fullPage:false}); console.log('wrote', path) }
async function dismiss(page){ const c=page.locator('.station-explainer-continue, button:has-text("Continue to station")'); if(await c.first().isVisible().catch(()=>false)){ await c.first().click(); await page.waitForTimeout(500)} }
async function runShell(browser, shell){
  const vp = shell==='phone'?{width:430,height:900}:{width:1280,height:820}
  const page = await browser.newPage({viewport:vp})
  await prep(page,{shell, step:12, coachSeen:true, explainerSeen:false})
  await page.goto(`${BASE}/journey`,{waitUntil:'domcontentloaded', timeout:90000}); await page.waitForTimeout(900)
  await page.waitForSelector('.station-explainer, .instr-narration-hear',{timeout:25000})
  const explainerOk = await page.locator('.station-explainer .instr-narration-hear').first().isVisible().catch(()=>false)
  console.log(`[${shell}] explainer Hear:`, explainerOk?'visible':'MISSING'); await shot(page, `${shell}-explainer-hear.png`)
  const page2 = await browser.newPage({viewport:vp})
  await prep(page2,{shell, step:12, coachSeen:true, explainerSeen:true})
  await page2.goto(`${BASE}/journey`,{waitUntil:'domcontentloaded', timeout:90000}); await page2.waitForTimeout(900); await dismiss(page2)
  await page2.waitForSelector('.comp-skills-card, .equip-video-card',{timeout:25000})
  const compOk = await page2.locator('.comp-skills-instr-hear .instr-narration-hear').first().isVisible().catch(()=>false)
  const enOk = await page2.locator('.comp-skills-instr-hear .instr-narration-en').first().isVisible().catch(()=>false)
  console.log(`[${shell}] computer Hear:`, compOk?'visible':'MISSING', 'EN:', enOk?'visible':'MISSING'); await shot(page2, `${shell}-computer-instr-hear.png`)
  const page3 = await browser.newPage({viewport:vp})
  await prep(page3,{shell, step:6, coachSeen:false, explainerSeen:true})
  await page3.goto(`${BASE}/journey`,{waitUntil:'domcontentloaded', timeout:90000}); await page3.waitForTimeout(1000); await dismiss(page3)
  await page3.waitForSelector('.station-coach-bubble, [data-coach="vv-lang"]',{timeout:25000}); await page3.waitForTimeout(600)
  const coachOk = await page3.locator('.station-coach-hear .instr-narration-hear').first().isVisible().catch(()=>false)
  const langRowOk = await page3.locator('[data-coach="vv-lang"]').first().isVisible().catch(()=>false)
  const shellHelpOk = await page3.locator('.train-shell-instr-hear .instr-narration-hear').first().isVisible().catch(()=>false)
  const vvInstrOk = await page3.locator('.vocab-sheet-instr-hear .instr-narration-hear').first().isVisible().catch(()=>false)
  const enChipOk = await page3.locator('[data-coach="vv-lang"] button, .vocab-sheet-langs button').filter({hasText:/English/i}).first().isVisible().catch(()=>false)
  const moreOk = await page3.locator('button:has-text("More languages")').first().isVisible().catch(()=>false)
  console.log(`[${shell}] coach Hear:`, coachOk?'visible':'MISSING', 'VV row:', langRowOk?'visible':'MISSING', 'shell help:', shellHelpOk?'visible':'MISSING', 'VV instr:', vvInstrOk?'visible':'MISSING', 'EN:', enChipOk?'visible':'MISSING', 'More:', moreOk?'visible':'MISSING')
  await shot(page3, `${shell}-coach-hear.png`); await shot(page3, `${shell}-vv-en-more.png`)

  const page4 = await browser.newPage({viewport:vp})
  await prep(page4,{shell, step:6, coachSeen:true, explainerSeen:true})
  await page4.addInitScript(() => {
    localStorage.setItem('pa-student-journey-step-v1', '6')
  })
  await page4.goto(`${BASE}/journey`,{waitUntil:'domcontentloaded', timeout:90000}); await page4.waitForTimeout(700)
  // Open Practice hub if available
  const hubBtn = page4.locator('button:has-text("Practice home"), button:has-text("Path home"), a:has-text("Practice home")')
  if (await hubBtn.first().isVisible().catch(()=>false)) {
    await hubBtn.first().click(); await page4.waitForTimeout(700)
  } else {
    await page4.goto(`${BASE}/`,{waitUntil:'domcontentloaded', timeout:90000}).catch(()=>{})
    await page4.waitForTimeout(400)
  }
  // Force hub via practice entry when journey stays on station
  await page4.evaluate(() => {
    try {
      localStorage.setItem('pa-practice-mode-v1', '1')
      window.dispatchEvent(new Event('pa-practice-hub-open'))
    } catch {}
  })
  await page4.waitForTimeout(500)
  const hubHear = await page4.locator('.ph-instr-hear .instr-narration-hear').first().isVisible().catch(()=>false)
  console.log(`[${shell}] hub Hear:`, hubHear?'visible':'optional-miss')
  await shot(page4, `${shell}-hub-instr-hear.png`)

  await page.close(); await page2.close(); await page3.close(); await page4.close()
  return {explainerOk, compOk, enOk, coachOk, langRowOk, shellHelpOk, vvInstrOk, enChipOk, moreOk, hubHear}
}
const browser = await chromium.launch({headless:true})
const desktop = await runShell(browser,'desktop'); const phone = await runShell(browser,'phone'); await browser.close()
for (const f of readdirSync(OUT)) { const src=join(OUT,f); if(existsSync(src)) copyFileSync(src, join(ART,f)) }
const hard = (r) => !r.explainerOk||!r.compOk||!r.enOk||!r.coachOk||!r.langRowOk||!r.shellHelpOk||!r.vvInstrOk||!r.enChipOk||!r.moreOk
const fail = hard(desktop)||hard(phone)
if(fail){ console.error('FAIL'); process.exit(1) }
console.log('OK instruction-narration smoke (desktop + phone) · hub Hear optional')
