// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5542;
const base = `http://localhost:${PORT}`;
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0, passed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};
const revealAll = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); }
  document.querySelectorAll('[data-piece]').forEach((el) => el.classList.add('in'));
});

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: exe });

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
  await page.waitForTimeout(600);
  await check('film: scherm krimpt naar het midden van de vitrine', async () => {
    const full = await page.locator('[data-screen]').evaluate((e) => e.getBoundingClientRect().width);
    await page.evaluate(() => { const f = document.querySelector('[data-film]'); scrollTo(0, f.offsetHeight - innerHeight); });
    await page.waitForTimeout(400);
    const [w, slotW, side] = await page.evaluate(() => [document.querySelector('[data-screen]').getBoundingClientRect().width, document.querySelector('[data-vit-slot] .vit__img').getBoundingClientRect().width, Number(document.querySelector('[data-vit-side]').style.opacity)]);
    if (!(full > 1200 && Math.abs(w - slotW) < 2 && side > 0.99)) throw new Error(`${full} ${w} ${slotW} ${side}`);
  });
  await check('film: glinstering en naam rond het piekmoment', async () => {
    await page.evaluate(() => { const f = document.querySelector('[data-film]'); scrollTo(0, (f.offsetHeight - innerHeight) * 0.615); });
    await page.waitForTimeout(300);
    const [s, k] = await page.evaluate(() => [Number(document.querySelector('[data-spark]').style.opacity), Number(document.querySelector('[data-pick]').style.opacity)]);
    if (!(s > 0.5 && k > 0.9)) throw new Error(`${s} ${k}`);
  });
  await check('menu opent en sluit met Esc', async () => {
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
    await page.locator('[data-menu-open]').click(); await page.waitForTimeout(200);
    const open = await page.locator('[data-menu]').isVisible();
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
    if (!open || (await page.locator('[data-menu]').isVisible())) throw new Error('menu');
  });
  await check('tabbladen: Oorbellen toont 6 oorbellen', async () => {
    await page.locator('#tab-oorbellen').click();
    const vis = await page.evaluate(() => [...document.querySelectorAll('[data-type]')].filter((g) => !g.hidden).map((g) => g.dataset.type + g.querySelectorAll('.piece').length));
    if (vis.join() !== 'oorbellen6') throw new Error(vis.join());
    await page.locator('#tab-oorbellen').focus(); await page.keyboard.press('ArrowRight');
    if (!(await page.locator('#soort-kettingen').isVisible())) throw new Error('pijltjes');
  });
  await check('in tas: teller in de nav loopt op', async () => {
    await page.locator('#tab-ringen').click();
    await page.locator('#soort-ringen [data-add="ring-groen"]').click({ force: true });
    await page.locator('#soort-ringen [data-add="ring-groen"]').click({ force: true });
    await page.locator('[data-add-gift]').click();
    if ((await page.locator('[data-bag-count]').textContent()) !== '3') throw new Error(await page.locator('[data-bag-count]').textContent());
  });
  await check('tas: maat kiezen, aantal aanpassen, naam verplicht', async () => {
    await page.evaluate(() => document.querySelector('.nav__bag').click());
    await page.locator('[data-size="0"]').selectOption('54');
    await page.locator('[data-q="0"][data-d="-1"]').click();
    await page.locator('.send').click();
    if (!(await page.locator('[data-bag-err]').textContent())) throw new Error('geen melding');
  });
  await check('tas: bestelling gaat compleet naar WhatsApp', async () => {
    await page.evaluate(() => { window.__o = []; window.open = (u) => window.__o.push(u); });
    await page.fill('[name=name]', 'Test (voorbeeld)');
    await page.locator('.seg span', { hasText: 'Verzenden' }).click();
    await page.locator('.send').click();
    const url = decodeURIComponent(await page.evaluate(() => window.__o[0]));
    for (const t of ['wa.me/31634123130', '1× Ring groene steen (maat: 54)', 'Giftcard € 50', 'Verzenden', 'Test (voorbeeld)']) if (!url.includes(t)) throw new Error(`mist: ${t}`);
  });
  await check('tas blijft bewaard na herladen', async () => {
    await page.reload({ waitUntil: 'networkidle' });
    if ((await page.locator('[data-bag-count]').textContent()) !== '2') throw new Error(await page.locator('[data-bag-count]').textContent());
  });
  await ctx.close();
}

console.log('Zonder JavaScript en met minder beweging');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('zonder JS: titel en sieraden zichtbaar', async () => {
    if (!(await page.locator('.hero__title').isVisible()) || !(await page.locator('.piece img').first().isVisible())) throw new Error('onzichtbaar');
  });
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
  const p2 = await ctx2.newPage();
  await p2.goto(base + '/', { waitUntil: 'networkidle' });
  await check('minder beweging: geen vastgezette film, vitrine eronder, tekst leesbaar', async () => {
    const h = await p2.locator('[data-film]').evaluate((e) => e.offsetHeight);
    const vit = await p2.locator('[data-vit-side]').first().isVisible();
    if (h > 2200 || !vit || !(await p2.locator('.hero__title').isVisible())) throw new Error(`hoogte ${h} ${vit}`);
  });
  await ctx2.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
