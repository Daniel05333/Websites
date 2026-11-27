// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5562;
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
  await check('Google: structured data als BeautySalon met adres in Grave en prijzen', async () => {
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    if (ld['@type'] !== 'BeautySalon' || ld.address.addressLocality !== 'Grave' || !ld.address.streetAddress.includes('95B') || ld.makesOffer.length !== 5) throw new Error(JSON.stringify(ld).slice(0, 120));
    const t = await page.title();
    if (!t.includes('Grave')) throw new Error(t);
  });
  await check('3D-ring: 12 nagelfoto’s die draaien', async () => {
    const n = await page.locator('.card').count();
    const a = await page.locator('[data-ring]').evaluate((e) => e.style.getPropertyValue('--spin'));
    await page.waitForTimeout(600);
    const b = await page.locator('[data-ring]').evaluate((e) => e.style.getPropertyValue('--spin'));
    if (n !== 12 || a === b) throw new Error(`${n} ${a} ${b}`);
  });
  await check('prijslijst nagels staat erin (Gellak €28,50 t/m BIAB + French €36,50)', async () => {
    const t = await page.locator('.menu').innerText();
    for (const s of ['€28,50', '€32,50', '€35,00', '€36,50', '€12,50', 'prijs in overleg']) if (!t.includes(s)) throw new Error(s);
  });
  await check('voor/na dermaplaning werkt met het toetsenbord', async () => {
    const r = page.locator('.ba__range');
    await r.focus(); for (let i = 0; i < 10; i++) await r.press('ArrowLeft');
    const x = await page.locator('[data-ba]').evaluate((e) => e.style.getPropertyValue('--x'));
    if (x !== '40%') throw new Error(x);
  });
  await check('filter Nail art toont alleen nail art', async () => {
    await page.locator('[data-f=art]').click();
    const v = await page.evaluate(() => [...document.querySelectorAll('[data-masonry] li')].filter((l) => !l.hidden).map((l) => l.dataset.cat));
    if (!v.length || v.some((c) => c !== 'art')) throw new Error(v.join());
  });
  await check('vergroting bladert binnen het filter', async () => {
    await page.locator('[data-masonry] li:not([hidden]) [data-zoom]').first().click();
    const a = await page.locator('[data-lb-cap]').textContent();
    await page.keyboard.press('ArrowRight');
    const b = await page.locator('[data-lb-cap]').textContent();
    await page.keyboard.press('Escape');
    if (a === b) throw new Error(a);
  });
  await check('Salonized-agenda wordt in de pagina geladen, met terugvalknop', async () => {
    await page.locator('#agenda').scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    const src = await page.locator('[data-agenda] iframe').getAttribute('src');
    const fallback = await page.locator('.browser__foot a').getAttribute('href');
    if (src !== 'https://salon-robine.salonized.com/' || fallback !== src) throw new Error(`${src} ${fallback}`);
  });
  await check('route-knop gaat naar Google Maps met het adres', async () => {
    const h = await page.locator('.salon__actions a').first().getAttribute('href');
    if (!h.startsWith('https://www.google.com/maps') || !decodeURIComponent(h).includes('Arnoud van Gelderweg 95B')) throw new Error(h);
  });
  await ctx.close();
}

console.log('Zonder JavaScript en met minder beweging');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('zonder JS: titel, prijzen en foto’s zichtbaar', async () => {
    if (!(await page.locator('.hero__title').isVisible()) || !(await page.locator('.menu li').first().isVisible()) || !(await page.locator('.shot img').first().isVisible())) throw new Error('onzichtbaar');
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
