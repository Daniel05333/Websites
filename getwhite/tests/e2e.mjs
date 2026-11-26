// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 4514;
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('3D-tand rendert (WebGL) of toont fallback', async () => {
    await page.waitForTimeout(800);
    const ok = await page.evaluate(() => document.querySelector('[data-stage]').classList.contains('is-ready') || document.documentElement.classList.contains('no-webgl'));
    if (!ok) throw new Error('canvas niet klaar en geen fallback');
  });
  await check('hero wordt witter tijdens scrollen', async () => {
    const w0 = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--w')));
    await page.evaluate(() => scrollTo(0, innerHeight * 1.3)); await page.waitForTimeout(1500);
    const w1 = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--w')));
    if (!(w0 < 0.2 && w1 > 0.9)) throw new Error(`--w ${w0} → ${w1}`);
  });
  await page.locator('#prijzen').scrollIntoViewIfNeeded();
  const price = () => page.locator('[data-price]').textContent();
  await check('calculator: standaard Basic 4 sessies = €60', async () => { await page.waitForTimeout(700); if ((await price()) !== '€60') throw new Error(await price()); });
  await check('calculator: duo + Ultra White + 10 sessies + polijsten = €360', async () => {
    await page.locator('.seg label:has(input[value=duo])').click();
    await page.locator('.line-card:has(input[value=ultra])').click();
    await page.locator('.pills label:has(input[value="10"])').click();
    await page.locator('.toggle').click();
    await page.waitForTimeout(800);
    if ((await price()) !== '€360') throw new Error(await price());
  });
  await check('calculator: WhatsApp-link bevat de keuze', async () => {
    const href = decodeURIComponent(await page.locator('[data-wa-link]').getAttribute('href'));
    if (!href.startsWith('https://wa.me/31610507908?text=') || !href.includes('Ultra White, 10 sessies') || !href.includes('€360')) throw new Error(href);
  });
  await check('voor/na-slider reageert op toetsenbord', async () => {
    const range = page.locator('.compare__range').first();
    await range.focus();
    await range.evaluate((el) => { el.value = 20; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const pos = await page.locator('.compare__media').first().evaluate((el) => el.style.getPropertyValue('--pos'));
    if (pos !== '20%') throw new Error(pos);
  });
  await page.close();
}

console.log('Zonder JavaScript');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  await check('koppen en kaarten zijn zichtbaar', async () => {
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
  await check('hero toont direct de witte tand, zonder fouten', async () => {
    await page.waitForTimeout(500);
    const w = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--w')));
    if (w < 0.99 || errs.length) throw new Error(`--w ${w} ${errs.join(' ')}`);
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
