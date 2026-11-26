// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 4814;
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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('3D-ballonnen renderen (WebGL) of fallback', async () => {
    await page.waitForTimeout(1500);
    const ok = await page.evaluate(() => document.querySelector('[data-balloons]').classList.contains('is-ready') || document.documentElement.classList.contains('no-webgl'));
    if (!ok) throw new Error('niet klaar');
  });
  await check('Aanvragen-knop bij feestje vult het formulier in', async () => {
    await page.locator('.party__ask[data-pre="Slime Party"]').click();
    await page.waitForTimeout(900);
    const v = await page.locator('[data-form] select[name=party]').inputValue();
    if (v !== 'Slime Party') throw new Error(v);
  });
  await check('zonder datum verschijnt een foutmelding', async () => {
    await page.locator('[data-form] [type=submit]').click();
    const err = await page.locator('[data-error]').textContent();
    if (!err.includes('datum')) throw new Error(err);
  });
  await check('aanvraag opent WhatsApp met alles ingevuld', async () => {
    await page.locator('[data-form] input[name=date]').fill('2027-03-14');
    await page.locator('[data-form] input[name=kids]').fill('8');
    await page.locator('[data-form] input[name=age]').fill('7');
    await page.locator('[data-form] input[name=name]').fill('Sanne');
    await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
    await page.locator('[data-form] [type=submit]').click();
    const url = decodeURIComponent(String(await page.evaluate(() => window.__opened[0])));
    if (!url.startsWith('https://wa.me/31645883292?text=')) throw new Error(url);
    for (const s of ['Slime Party', '14 maart 2027', 'Aantal kinderen: 8', '7 jaar', 'Sanne']) if (!url.includes(s)) throw new Error(`mist "${s}": ${url}`);
  });
  await check('huren: bericht spreekt over huren', async () => {
    await page.locator('.rent__ask[data-pre="Huren: Popcornkar"]').click();
    await page.waitForTimeout(800);
    const t = await page.locator('[data-preview]').textContent();
    if (!t.includes('popcornkar huren')) throw new Error(t);
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
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.title, .reveal, .hero__lead, .party')].filter((el) => getComputedStyle(el).opacity === '0').length);
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
  await check('ballonnen staan stil, zonder fouten', async () => {
    await page.waitForTimeout(500);
    const ok = await page.evaluate(() => document.querySelector('[data-balloons]').classList.contains('is-ready') || document.documentElement.classList.contains('no-webgl'));
    if (!ok || errs.length) throw new Error(`${ok} ${errs.join(' ')}`);
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
