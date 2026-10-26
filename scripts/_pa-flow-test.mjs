import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:4181/Purpose-Academy-Application/';
const OUT = '/opt/cursor/artifacts/screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

async function shot(name) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('SHOT', path);
}

const results = [];
try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /Enter phone/i }).click();
  await page.getByRole('button', { name: /Open Purpose Academy/i }).click();
  const enter = page.locator('.threshold.is-embedded .threshold-hammer');
  await enter.waitFor({ timeout: 20000 });
  await page.waitForTimeout(400);
  await shot('03b-phone-splash-fixed');
  await enter.click();

  // Wait for toolbox phase + Practice tray (accessible name may include help text)
  const practice = page.locator('.iphone-scroll .toolbox-slot-journey, .iphone-scroll button.toolbox-slot.is-practice').first();
  await practice.waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  await shot('04b-phone-toolbox');
  results.push('PASS phone toolbox');

  await practice.click();
  const enterPractice = page.getByRole('button', { name: /Enter Practice/i });
  await enterPractice.waitFor({ timeout: 8000 });
  // Showcase may already be selected
  if (await page.getByRole('button', { name: /^Showcase$/i }).isVisible()) {
    await page.getByRole('button', { name: /^Showcase$/i }).click();
  }
  await enterPractice.click();

  await page.locator('.is-phone-app .ph-resume-btn, .is-phone-app .ph-resume button.btn-primary').first().waitFor({ timeout: 25000 });
  await page.waitForTimeout(700);
  await shot('05b-phone-practice');
  const resume = await page.locator('.is-phone-app .ph-resume').first().boundingBox();
  console.log('resume', resume);
  results.push(resume && resume.height >= 80 ? `PASS resume h=${Math.round(resume.height)}` : `FAIL resume ${JSON.stringify(resume)}`);

  // Check for overlap: resume top should be below hero copy or stacked cleanly
  const heroH1 = await page.locator('.is-phone-app .ph-hero-copy h1').first().boundingBox();
  const openBtn = await page.locator('.is-phone-app .ph-resume-btn').first().boundingBox();
  console.log('h1', heroH1, 'btn', openBtn);
  if (heroH1 && openBtn && openBtn.y < heroH1.y + heroH1.height - 4) {
    results.push('FAIL CTA overlaps hero headline');
  } else {
    results.push('PASS CTA below hero headline');
  }

  await page.locator('.is-phone-app .ph-resume-btn').first().click();
  await page.waitForTimeout(1500);
  await shot('06b-station');
  results.push('PASS open station');

  // Back to modes via Exit phone, then desktop
  await page.getByRole('button', { name: /Exit phone/i }).click();
  await page.getByRole('button', { name: /Enter desktop/i }).click();
  await page.locator('.threshold:not(.is-embedded) .threshold-hammer').waitFor({ timeout: 20000 });
  await shot('08b-desktop-splash');
  await page.locator('.threshold:not(.is-embedded) .threshold-hammer').click();
  await page.locator('.toolbox-slot-journey, button.toolbox-slot.is-practice').first().waitFor({ timeout: 15000 });
  await shot('09b-desktop-toolbox');
  results.push('PASS desktop splash → toolbox');

} catch (e) {
  console.error(e);
  await shot('99b-error');
  results.push('FAIL ' + e.message);
}
console.log('---RESULTS---');
results.forEach((r) => console.log(r));
await browser.close();
