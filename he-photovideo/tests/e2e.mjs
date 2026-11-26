// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5532;
const base = `http://localhost:${PORT}`;
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0, passed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};
const revealAll = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); }
  document.querySelectorAll('.reveal, .title').forEach((el) => el.classList.add('in'));
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
  await check('3D-tunnel: 12 foto’s, laatste komt in beeld na scrollen', async () => {
    const n = await page.locator('.frame').count();
    await page.evaluate(() => scrollTo(0, document.querySelector('[data-hero]').offsetHeight - innerHeight));
    await page.waitForTimeout(300);
    const o = await page.locator('.frame').last().evaluate((e) => Number(e.style.opacity));
    const mode = await page.locator('[data-mode] .on').textContent();
    if (n !== 12 || o < 0.9 || mode !== 'VIDEO') throw new Error(`${n} ${o} ${mode}`);
  });
  await check('tabbladen: Henna toont het henna-paneel', async () => {
    await page.locator('#tab-henna').click();
    const vis = await page.evaluate(() => [...document.querySelectorAll('[data-panel]')].filter((p) => !p.hidden).map((p) => p.dataset.panel));
    if (vis.join() !== 'henna' || (await page.locator('#tab-henna').getAttribute('aria-selected')) !== 'true') throw new Error(vis.join());
  });
  await check('tabbladen: pijltjestoets gaat naar Verloving', async () => {
    await page.locator('#tab-henna').focus(); await page.keyboard.press('ArrowRight');
    if (!(await page.locator('#panel-verloving').isVisible())) throw new Error('niet zichtbaar');
  });
  await check('coverflow: volgende → 02 en klik op actieve foto opent vergroting', async () => {
    const panel = page.locator('#panel-verloving');
    await panel.locator('[data-flow-next]').click();
    const c = await panel.locator('[data-flow-i]').textContent();
    await page.waitForTimeout(900);
    await panel.locator('.flow__card').nth(1).click();
    const open = await page.locator('[data-lightbox]').evaluate((d) => d.open);
    await page.keyboard.press('ArrowRight');
    const cap = await page.locator('[data-lightbox-cap]').textContent();
    await page.keyboard.press('Escape');
    if (c !== '02' || !open || !cap) throw new Error(`${c} ${open} ${cap}`);
  });
  await check('filmspeler opent, loopt en pauzeert', async () => {
    await page.locator('.feature').click();
    await page.waitForTimeout(700);
    const t = await page.locator('[data-player-bar]').evaluate((e) => Number(getComputedStyle(e).getPropertyValue('--t') || e.style.getPropertyValue('--t')));
    await page.locator('[data-player-toggle]').click();
    const label = await page.locator('[data-player-toggle]').getAttribute('aria-label');
    const title = await page.locator('[data-player-title]').textContent();
    await page.keyboard.press('Escape');
    if (!(t > 0) || label !== 'Speel af' || !title) throw new Error(`${t} ${label} ${title}`);
  });
  await check('pakketknop vult het formulier in', async () => {
    await page.locator('[data-pkg=video]').click();
    if (!(await page.locator('input[name=package][value=video]').isChecked())) throw new Error('niet gekozen');
  });
  await check('versturen zonder datum geeft een melding', async () => {
    await page.locator('[data-send]').click();
    if (!(await page.locator('[data-error]').textContent()).includes('datum')) throw new Error('geen melding');
  });
  await check('volgeboekte dagen zijn uitgeschakeld, vrije dag kiezen werkt', async () => {
    await page.locator('[data-cal-next]').click();
    const full = await page.locator('.day[data-s=full]').count();
    const fullOff = await page.locator('.day[data-s=full]:not([disabled])').count();
    await page.locator('.day[data-s=free]').first().click();
    const out = await page.locator('[data-date-out] b').textContent();
    const prev = await page.locator('[data-preview]').textContent();
    if (fullOff || full < 1 || !/\d{4}/.test(out) || !prev.includes(out)) throw new Error(`${full} ${fullOff} ${out}`);
  });
  await check('verplichte velden worden gemarkeerd', async () => {
    await page.locator('[data-send]').click();
    const n = await page.locator('[aria-invalid=true]').count();
    if (n !== 4) throw new Error(`${n} velden`);
  });
  await check('compleet formulier: bericht gekopieerd en Instagram opent', async () => {
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.fill('[name=venue]', 'Zaal (voorbeeld)'); await page.fill('[name=place]', 'Rotterdam');
    await page.fill('[name=name]', 'Test & Test'); await page.fill('[name=phone]', '06 12345678');
    await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); }; });
    await page.locator('[data-send]').click();
    await page.waitForTimeout(300);
    const url = (await page.evaluate(() => window.__opened[0])) ?? '';
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    if (!url.includes('ig.me/m/he.photovideo') && !url.includes('instagram')) throw new Error(url);
    if (!clip.includes('Videografie') || !clip.includes('Zaal (voorbeeld)')) throw new Error(clip);
  });
  await ctx.close();
}

console.log('Zonder JavaScript en met minder beweging');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('zonder JS: titel en foto’s zichtbaar', async () => {
    if (!(await page.locator('.hero__title').isVisible()) || !(await page.locator('.flow__card').first().isVisible())) throw new Error('onzichtbaar');
  });
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
  const p2 = await ctx2.newPage();
  await p2.goto(base + '/', { waitUntil: 'networkidle' });
  await check('minder beweging: hero zonder scroll-tunnel, tekst leesbaar', async () => {
    const h = await p2.locator('[data-hero]').evaluate((e) => e.offsetHeight);
    if (h > 1300 || !(await p2.locator('.hero__title').isVisible())) throw new Error(`hoogte ${h}`);
  });
  await ctx2.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
