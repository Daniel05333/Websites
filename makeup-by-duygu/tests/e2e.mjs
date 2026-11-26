// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5214;
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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('3D-lipstick rendert (WebGL) of fallback', async () => {
    await page.waitForTimeout(1500);
    const ok = await page.evaluate(() => document.querySelector('[data-lipstick]').classList.contains('is-ready') || document.documentElement.classList.contains('no-webgl'));
    if (!ok) throw new Error('niet klaar');
  });
  await check('filter "Bruid" toont alleen bruidslooks', async () => {
    await page.locator('[data-filter=bruid]').click();
    await page.waitForTimeout(700);
    const vis = await page.evaluate(() => [...document.querySelectorAll('.card')].filter((c) => !c.hidden).map((c) => c.dataset.cat));
    if (!vis.length || vis.some((c) => c !== 'bruid')) throw new Error(vis.join(','));
  });
  await check('vergrootweergave opent en bladert', async () => {
    await page.locator('.card:not([hidden]) [data-zoom]').first().click();
    const a = await page.locator('[data-lightbox-cap]').textContent();
    await page.locator('[data-lightbox-next]').click();
    const b = await page.locator('[data-lightbox-cap]').textContent();
    await page.keyboard.press('Escape');
    if (a === b) throw new Error(`${a} = ${b}`);
  });
  await check('plaatsveld alleen zichtbaar bij "op locatie"', async () => {
    if (await page.locator('[data-place]').isVisible()) throw new Error('zichtbaar bij studio');
  });
  await check('Aanvragen bij Verloving vult het formulier in', async () => {
    await page.locator('.menu__book[data-pre="Verloving"]').click();
    await page.waitForTimeout(900);
    const v = await page.locator('[data-book-form] select[name=treatment]').inputValue();
    if (v !== 'Verloving') throw new Error(v);
  });
  await check('zonder datum verschijnt een foutmelding', async () => {
    await page.locator('[data-book-form] [type=submit]').click();
    if (!(await page.locator('[data-book-error]').textContent()).includes('datum')) throw new Error('geen fout');
  });
  await check('aanvraag op locatie wordt gekopieerd en Instagram-DM opent', async () => {
    await page.locator('[data-book-form] input[name=date]').fill('2027-05-22');
    await page.locator('[data-book-form] .chips label:has-text("Op locatie")').click();
    await page.locator('[data-book-form] input[name=place]').fill('Apeldoorn');
    await page.locator('[data-book-form] input[name=persons]').fill('3');
    await page.locator('[data-book-form] input[name=name]').fill('Elif');
    await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
    await page.locator('[data-book-form] [type=submit]').click();
    await page.waitForTimeout(300);
    const url = String(await page.evaluate(() => window.__opened[0]));
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    if (!url.includes('ig.me/m/makeupby.duygu')) throw new Error(url);
    for (const t of ['verloving, op locatie in Apeldoorn', '22 mei 2027', 'Aantal personen: 3', 'Elif']) if (!clip.includes(t)) throw new Error(`mist "${t}": ${clip}`);
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
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.title, .reveal, .hero__lead, .card')].filter((el) => getComputedStyle(el).opacity === '0').length);
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
  await check('lipstick staat stil, zonder fouten', async () => {
    await page.waitForTimeout(500);
    const ok = await page.evaluate(() => document.querySelector('[data-lipstick]').classList.contains('is-ready') || document.documentElement.classList.contains('no-webgl'));
    if (!ok || errs.length) throw new Error(`${ok} ${errs.join(' ')}`);
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
