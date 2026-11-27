// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5572;
const base = `http://localhost:${PORT}`;
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0, passed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};
const revealAll = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); }
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
});

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: exe });

console.log('Layout, console en toegankelijkheid');
for (const width of [320, 390, 768, 1024, 1440]) {
  const mobile = width < 768;
  const ctx = await browser.newContext({ viewport: { width, height: 860 }, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => m.type() === 'error' && !/salonized|ERR_|Failed to load resource/.test(m.text()) && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('/404.html') && !r.url().includes('salonized') && problems.push(`${r.status()} ${r.url()}`));
  for (const p of ['/', '/404.html']) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await revealAll(page);
    await check(`${width}px ${p} — geen horizontale scroll`, async () => {
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) throw new Error(`${over}px te breed`);
    });
    if (width === 390 || width === 1440) await check(`${width}px ${p} — axe (WCAG 2.1 AA)`, async () => {
      await page.waitForTimeout(1200);
      await page.addScriptTag({ content: axeSrc });
      const res = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }));
      const bad = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      if (bad.length) throw new Error(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`).join(' | '));
    });
  }
  await check(`${width}px — geen consolefouten of kapotte bestanden`, () => { if (problems.length) throw new Error(problems.join(' | ')); });
  await ctx.close();
}

console.log('Interactie');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('poederdoos gaat open tijdens het scrollen', async () => {
    await page.waitForTimeout(800);
    const a = Number(await page.locator('[data-compact]').evaluate((e) => e.style.getPropertyValue('--open')));
    await page.evaluate(() => scrollTo(0, document.querySelector('[data-hero]').offsetHeight - innerHeight)); await page.waitForTimeout(1200);
    const b = Number(await page.locator('[data-compact]').evaluate((e) => e.style.getPropertyValue('--open')));
    if (!(a < 0.3 && b > 0.9)) throw new Error(`${a} → ${b}`);
  });
  await check('prijslijst klopt met de highlight', async () => {
    const t = await page.locator('.pcard').innerText();
    for (const s of ['€90,-', '€110,-', '€100,-', '€290,-', '€250,-']) if (!t.includes(s)) throw new Error(s);
  });
  await check('portfolio-filter Bruid toont alleen bruiden (12)', async () => {
    await page.locator('[data-f=bruid]').click();
    const v = await page.evaluate(() => [...document.querySelectorAll('[data-grid] li')].filter((l) => !l.hidden).map((l) => l.dataset.cat));
    if (v.length !== 12 || v.some((c) => c !== 'bruid')) throw new Error(v.join());
  });
  await check('masterclass-stapel bladert met pijltjes', async () => {
    await page.locator('[data-deck]').focus(); await page.keyboard.press('ArrowRight');
    if ((await page.locator('[data-deck-i]').textContent()) !== '02') throw new Error('niet');
  });
  await check('tab Voorwaarden toont de regels', async () => {
    await page.locator('#t-regels').click();
    if (!(await page.locator('#p-regels').innerText()).includes('72 uur')) throw new Error('mist');
  });
  await check('+ bij Bridal package zet het in de aanvraag en toont proefsessieveld', async () => {
    await page.locator('[data-pick="bridal-trial"]').click();
    if (!(await page.locator('input[name=service][value="bridal-trial"]').isChecked()) || await page.locator('[data-trial]').isHidden()) throw new Error('niet');
  });
  await check('versturen zonder datum, naam en voorwaarden geeft een melding', async () => {
    await page.locator('[data-form] button[type=submit]').click();
    const t = await page.locator('[data-error]').textContent();
    if (!t.includes('datum') || !t.includes('naam') || !t.includes('voorwaarden')) throw new Error(t);
  });
  await check('compleet: WhatsApp naar 0687360399 met studio, look en datum', async () => {
    await page.evaluate(() => { window.__o = []; window.open = (u) => window.__o.push(u); });
    await page.locator('.chips span', { hasText: 'Enschede' }).click();
    await page.fill('[name=date]', '2027-06-12'); await page.fill('[name=trial]', 'een zaterdag in mei');
    await page.fill('[name=people]', '2'); await page.fill('[data-form] [name=name]', 'Test (voorbeeld)');
    await page.locator('.check span').click();
    await page.locator('[data-form] button[type=submit]').click();
    const url = decodeURIComponent(await page.evaluate(() => window.__o[0] ?? ''));
    for (const t of ['wa.me/31687360399', 'Studio: Enschede', 'Bridal package', 'zaterdag 12 juni 2027', 'Aantal personen: 2', 'een zaterdag in mei', 'Test (voorbeeld)']) if (!url.includes(t)) throw new Error(`mist: ${t}`);
    if ((await page.locator('[data-sum]').innerText()).indexOf('€580') < 0) throw new Error('indicatie');
  });
  await ctx.close();
}

console.log('Zonder JavaScript en met minder beweging');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('zonder JS: titel, prijzen en foto’s zichtbaar', async () => {
    if (!(await page.locator('.hero__title').isVisible()) || !(await page.locator('.pcard li').first().isVisible()) || !(await page.locator('.shot img').first().isVisible())) throw new Error('onzichtbaar');
  });
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
  const p2 = await ctx2.newPage();
  await p2.goto(base + '/', { waitUntil: 'networkidle' });
  await check('minder beweging: hero zonder scroll-effect, tekst leesbaar', async () => {
    const h = await p2.locator('[data-hero]').evaluate((e) => e.offsetHeight);
    if (h > 1300 || !(await p2.locator('.hero__title').isVisible())) throw new Error(`hoogte ${h}`);
  });
  await ctx2.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
