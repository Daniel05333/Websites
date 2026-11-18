// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 4614;
const base = `http://localhost:${PORT}`;
const pages = ['/', '/academy/', '/404.html'];
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
  for (const p of pages) {
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
  await check('3D-wimperwaaier tekent op het canvas', async () => {
    await page.waitForTimeout(2500);
    const lit = await page.evaluate(() => {
      const c = document.querySelector('[data-fan]');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 3; i < d.length; i += 400) if (d[i] > 10) n++;
      return n;
    });
    if (lit < 50) throw new Error(`${lit} gekleurde samples`);
  });
  await check('tabs: Brows tonen en Lashes verbergen', async () => {
    await page.locator('#tab-brows').click();
    const [lashes, brows] = await Promise.all([page.locator('#panel-lashes').isHidden(), page.locator('#panel-brows').isVisible()]);
    if (!lashes || !brows) throw new Error(`lashes verborgen ${lashes}, brows zichtbaar ${brows}`);
  });
  await check('tabs: pijltjestoets gaat naar Skin', async () => {
    await page.keyboard.press('ArrowRight');
    if (!(await page.locator('#panel-skin').isVisible())) throw new Error('skin niet zichtbaar');
  });
  await check('boeken: knop bij behandeling opent venster met keuze ingevuld', async () => {
    await page.locator('#panel-skin [data-pre="Microneedling"]').click();
    if (!(await page.locator('#boek').isVisible())) throw new Error('venster niet open');
    const v = await page.locator('#boek select').inputValue();
    if (v !== 'Microneedling') throw new Error(v);
  });
  await check('boeken: zonder naam verschijnt een foutmelding', async () => {
    await page.locator('#boek [type=submit]').click();
    const err = await page.locator('[data-book-error]').textContent();
    if (!err.includes('naam')) throw new Error(err);
  });
  await check('boeken: bericht wordt gekopieerd en Instagram-DM opent', async () => {
    await page.locator('#boek input[name=name]').fill('Sara');
    await page.locator('#boek .chips label:has-text("Avond")').click();
    await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
    await page.locator('#boek [type=submit]').click();
    await page.waitForTimeout(300);
    const url = String(await page.evaluate(() => window.__opened[0]));
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    if (!url.includes('ig.me/m/studionazz_')) throw new Error(url);
    if (!clip.includes('Microneedling') || !clip.includes('avond') || !clip.includes('Sara')) throw new Error(clip);
  });
  await check('voor/na-slider reageert op invoer', async () => {
    const range = page.locator('.compare__range').first();
    await range.evaluate((el) => { el.value = 20; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const pos = await page.locator('.compare__media').first().evaluate((el) => el.style.getPropertyValue('--pos'));
    if (pos !== '20%') throw new Error(pos);
  });
  await page.goto(base + '/academy/', { waitUntil: 'networkidle' });
  await check('academy: aanmeldknop vult de cursus in', async () => {
    await page.locator('.course:has-text("Russian volume") .course__book').first().click();
    const v = await page.locator('#boek select').inputValue();
    if (v !== 'Cursus: Russian volume') throw new Error(v);
  });
  await ctx.close();
}

console.log('Zonder JavaScript');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 860 } });
  const page = await ctx.newPage();
  for (const p of ['/', '/academy/']) {
    await page.goto(base + p);
    await page.waitForTimeout(1200);
    await check(`${p} — inhoud zichtbaar, alle behandelingen leesbaar`, async () => {
      const hidden = await page.evaluate(() => [...document.querySelectorAll('.title, .reveal, .hero__lead, .panel')].filter((el) => getComputedStyle(el).opacity === '0' || getComputedStyle(el).display === 'none').length);
      if (hidden) throw new Error(`${hidden} elementen onzichtbaar`);
    });
  }
  await ctx.close();
}

console.log('Reduced motion');
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('waaier staat stil en volledig, zonder fouten', async () => {
    await page.waitForTimeout(500);
    const ready = await page.evaluate(() => document.querySelector('[data-fan]').classList.contains('is-ready'));
    if (!ready || errs.length) throw new Error(`ready ${ready} ${errs.join(' ')}`);
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt`);
process.exit(failed ? 1 : 0);
