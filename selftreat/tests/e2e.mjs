// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5014;
const base = `http://localhost:${PORT}`;
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0, passed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};
const revealAll = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
  document.querySelectorAll('.reveal, .title').forEach((el) => el.classList.add('in'));
});
const visible = (page) => page.evaluate(() => [...document.querySelectorAll('.salon')].filter((c) => !c.hidden).map((c) => c.dataset.salon));

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

console.log('Zoeken, filteren en boeken');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('3D-blobs renderen (WebGL) of fallback', async () => {
    await page.waitForTimeout(1500);
    const ok = await page.evaluate(() => document.querySelector('[data-blobs]').classList.contains('is-ready') || document.documentElement.classList.contains('no-webgl'));
    if (!ok) throw new Error('niet klaar');
  });
  await check('lege-resultatenmelding is standaard verborgen', async () => { if (await page.locator('[data-empty]').isVisible()) throw new Error('zichtbaar'); });
  await check('zoeken: Massage in Gelderland toont alleen de masseur', async () => {
    await page.selectOption('[data-search] select[name=t]', 'Massage');
    await page.selectOption('[data-search] select[name=p]', 'gld');
    await page.locator('[data-search] [type=submit]').click();
    await page.waitForTimeout(500);
    const v = await visible(page);
    if (v.join() !== 'masseur-apeldoorn') throw new Error(v.join());
  });
  await check('filterchip verwijderen toont weer meer salons', async () => {
    await page.locator('[data-clear=p]').click();
    const v = await visible(page);
    if (!(v.length > 1 && v.every((id) => ['masseur-apeldoorn', 'spa-drenthe'].includes(id)))) throw new Error(v.join());
  });
  await check('aan huis + Zeeland geeft lege melding met reset', async () => {
    await page.locator('[data-clear=all]').click().catch(() => {});
    await page.locator('button[data-prov=ze]').click();
    await page.waitForTimeout(300);
    if (!(await page.locator('[data-empty]').isVisible())) throw new Error('geen lege melding');
    await page.locator('[data-reset]').click();
    if ((await visible(page)).length !== 9) throw new Error('reset werkt niet');
  });
  await check('categorie Nails toont de nagelstylist', async () => {
    await page.locator('[data-cat=nails]').click();
    const v = await visible(page);
    if (v.join() !== 'nagelstylist-leiden') throw new Error(v.join());
  });
  await check('salonpagina opent met behandelingen en tijden', async () => {
    await page.locator('[data-open="nagelstylist-leiden"]').click();
    await page.waitForTimeout(400);
    if (!(await page.locator('[data-sheet]').isVisible())) throw new Error('niet open');
    const t = await page.locator('[data-title]').textContent();
    if (t !== 'Nagelstylist in Leiden') throw new Error(t);
    if (await page.locator('[data-done]').isVisible()) throw new Error('bevestiging al zichtbaar');
  });
  await check('boeken zonder tijd geeft een foutmelding', async () => {
    await page.locator('[data-book] [type=submit]').click();
    if (!(await page.locator('[data-error]').textContent()).includes('tijd')) throw new Error('geen fout');
  });
  await check('boeken toont een samenvatting (en zegt dat het een concept is)', async () => {
    await page.locator('[data-times] input:not(:disabled) + span').first().click();
    await page.locator('[data-book] input[name=name]').fill('Lisa');
    await page.locator('[data-book] [type=submit]').click();
    const s = await page.locator('[data-summary]').textContent();
    if (!s.includes('Gelnagels bij Nagelstylist in Leiden') || !s.includes('Lisa')) throw new Error(s);
    if (!(await page.locator('.done__fine').textContent()).includes('niets geboekt')) throw new Error('geen conceptmelding');
  });
  await ctx.close();
}

console.log('Zonder JavaScript');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  await page.waitForTimeout(800);
  await check('salons en koppen zijn zichtbaar', async () => {
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.title, .reveal, .salon')].filter((el) => getComputedStyle(el).opacity === '0').length);
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
  await check('blobs staan stil, zonder fouten', async () => {
    await page.waitForTimeout(500);
    const ok = await page.evaluate(() => document.querySelector('[data-blobs]').classList.contains('is-ready') || document.documentElement.classList.contains('no-webgl'));
    if (!ok || errs.length) throw new Error(`${ok} ${errs.join(' ')}`);
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
