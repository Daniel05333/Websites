// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5514;
const base = `http://localhost:${PORT}`;
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0, passed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};
const revealAll = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
  document.querySelectorAll('.reveal, .title, .reveal-img').forEach((el) => el.classList.add('in'));
});

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

console.log('Layout, console en toegankelijkheid');
for (const width of [320, 390, 768, 1024, 1440]) {
  const mobile = width < 768;
  const ctx = await browser.newContext({ viewport: { width, height: 860 }, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('/404.html') && problems.push(`${r.status()} ${r.url()}`));
  for (const p of ['/', '/dashboard.html', '/404.html']) {
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
  await check('3D-bogen staan op het podium', async () => { await page.waitForTimeout(1500); const n = await page.locator('.arch').count(); const o = await page.locator('.arch').first().evaluate((e) => getComputedStyle(e).opacity); if (n !== 5 || Number(o) < 0.9) throw new Error(`${n} ${o}`); });
  await check('portfolio-filter "Trap" toont alleen trapfoto’s', async () => {
    await page.locator('[data-filter=trap]').click();
    const v = await page.evaluate(() => [...document.querySelectorAll('[data-masonry] li')].filter((l) => !l.hidden).map((l) => l.dataset.cat));
    if (!v.length || v.some((c) => c !== 'trap')) throw new Error(v.join());
  });
  await check('vergrootweergave bladert binnen het filter', async () => {
    await page.locator('[data-masonry] li:not([hidden]) [data-zoom]').first().click();
    const a = await page.locator('[data-lightbox-img]').getAttribute('src'); await page.locator('[data-lightbox-next]').click();
    const b = await page.locator('[data-lightbox-img]').getAttribute('src'); await page.keyboard.press('Escape');
    if (a === b) throw new Error('zelfde foto');
  });
  await check('collectie-kaart vult de configurator', async () => {
    await page.locator('.coll[data-collection="Vaiana"]').click(); await page.waitForTimeout(800);
    if (!(await page.locator('input[name=collection][value="Vaiana"]').isChecked())) throw new Error('niet gekozen');
  });
  await check('stap 1 vraagt om een datum', async () => {
    await page.locator('[data-next]').click();
    if (!(await page.locator('[data-error]').textContent()).includes('datum')) throw new Error('geen fout');
  });
  await check('configurator opent WhatsApp met alle gegevens', async () => {
    await page.fill('[name=date]', '2027-09-11'); await page.fill('[name=guests]', '500'); await page.locator('[data-next]').click();
    await page.fill('[name=venue]', 'Testzaal'); await page.fill('[name=place]', 'Schiedam'); await page.locator('[data-next]').click();
    await page.locator('.picks label', { hasText: 'Bruidsbanken' }).click(); await page.locator('[data-next]').click();
    await page.fill('[name=name]', 'Noor & Sami'); await page.fill('[name=phone]', '06 00000123');
    await page.evaluate(() => { window.__o = []; window.open = (u) => { window.__o.push(u); return null; }; });
    await page.locator('[data-send]').click(); await page.waitForTimeout(200);
    const u = decodeURIComponent(String(await page.evaluate(() => window.__o[0])));
    if (!u.startsWith('https://wa.me/31683484086?text=')) throw new Error(u);
    for (const t of ['11 september 2027', 'Testzaal, Schiedam', 'Aantal gasten: 500', 'Collectie: Vaiana', 'bruidsbanken', 'Noor & Sami']) if (!u.includes(t)) throw new Error(`mist ${t}`);
  });
  await check('aanvraag verschijnt in het dashboard', async () => {
    await page.goto(base + '/dashboard.html', { waitUntil: 'networkidle' });
    if (!(await page.locator('.rq--fresh', { hasText: 'Noor & Sami' }).count())) throw new Error('niet gevonden');
    await page.locator('.rq--fresh').first().click(); await page.locator('[data-st="Geboekt"]').click();
    if ((await page.locator('[data-st="Geboekt"]').getAttribute('aria-pressed')) !== 'true') throw new Error('status niet gezet');
  });
  await ctx.close();
}

console.log('Zonder JavaScript');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  await page.waitForTimeout(800);
  await check('inhoud is zichtbaar', async () => {
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.title, .reveal, .hero__lead')].filter((el) => getComputedStyle(el).opacity === '0').length);
    if (hidden) throw new Error(`${hidden} elementen onzichtbaar`);
  });
  await ctx.close();
}

console.log('Reduced motion');
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('bogen staan stil, zonder fouten', async () => {
    await page.waitForTimeout(500);
    const ok = await page.evaluate(() => document.querySelectorAll('.arch').length === 5);
    if (!ok || errs.length) throw new Error(`${ok} ${errs.join(' ')}`);
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
