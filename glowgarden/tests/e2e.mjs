// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 5552;
const base = `http://localhost:${PORT}`;
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0, passed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};
const revealAll = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); }
  document.querySelectorAll('.reveal, .bubble').forEach((el) => el.classList.add('in'));
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
  await check('3D-kristal wordt getekend en kleurt van groen naar rood', async () => {
    await page.waitForTimeout(1500);
    const ready = await page.locator('[data-gem]').evaluate((c) => c.classList.contains('is-ready'));
    const g0 = await page.locator('[data-hero]').evaluate((e) => e.style.getPropertyValue('--glow'));
    await page.evaluate(() => scrollTo(0, document.querySelector('[data-hero]').offsetHeight - innerHeight));
    await page.waitForTimeout(500);
    const g1 = await page.locator('[data-hero]').evaluate((e) => e.style.getPropertyValue('--glow'));
    const [r0, gg0] = g0.split(' ').map(Number), [r1, gg1] = g1.split(' ').map(Number);
    if (!ready || !(gg0 > r0 && r1 > gg1)) throw new Error(`${ready} ${g0} → ${g1}`);
  });
  await check('prijzen: Man draait de kaart om en toont mannenprijzen', async () => {
    await page.locator('#t-man').click(); await page.waitForTimeout(1100);
    const man = await page.locator('[data-flip]').evaluate((e) => e.classList.contains('is-man'));
    const txt = await page.locator('#p-man').innerText();
    await page.locator('#t-man').press('ArrowLeft');
    if (!man || !txt.includes('Fullbody') || !txt.includes('€135')) throw new Error(txt.slice(0, 80));
  });
  await check('+ bij een prijs zet de zone in de planner met indicatie', async () => {
    await page.locator('#p-vrouw [data-add^="Oksels (mini"]').click();
    await page.locator('#p-vrouw [data-add="Gehele benen"]').click();
    const total = await page.locator('[data-sum-total]').textContent();
    if (total !== '€219') throw new Error(total);
  });
  await check('nogmaals + haalt de zone weer weg', async () => {
    await page.locator('#p-vrouw [data-add="Gehele benen"]').click();
    if ((await page.locator('[data-sum-total]').textContent()) !== '€50') throw new Error('niet weg');
  });
  await check('voor/na-schuif werkt met het toetsenbord', async () => {
    const r = page.locator('.ba__range').first();
    await r.focus(); for (let i = 0; i < 10; i++) await r.press('ArrowRight');
    const x = await page.locator('[data-ba]').first().evaluate((e) => e.style.getPropertyValue('--x'));
    if (x !== '60%') throw new Error(x);
  });
  await check('filter Man toont alleen resultaten van mannen', async () => {
    await page.locator('[data-rf=man]').click();
    const v = await page.evaluate(() => [...document.querySelectorAll('.ba[data-who]')].filter((l) => !l.hidden).map((l) => l.dataset.who));
    if (!v.length || v.some((w) => w !== 'man')) throw new Error(v.join());
  });
  await check('actie claimen zet hem in de planner', async () => {
    await page.locator('[data-add-deal]').first().click();
    if (!(await page.locator('[data-zones]').innerText()).includes('hele lichaam')) throw new Error('niet toegevoegd');
  });
  await check('versturen zonder naam en huisregels geeft een melding', async () => {
    await page.locator('[data-form] button[type=submit]').click();
    const t = await page.locator('[data-error]').textContent();
    if (!t.includes('naam') || !t.includes('huisregels')) throw new Error(t);
  });
  await check('compleet: WhatsApp naar 0620318221 met alles erin', async () => {
    await page.evaluate(() => { window.__o = []; window.open = (u) => window.__o.push(u); });
    await page.fill('[data-form] [name=name]', 'Test (voorbeeld)');
    await page.locator('.chips--days span', { hasText: 'do' }).click();
    await page.locator('.check span').click();
    await page.locator('[data-form] button[type=submit]').click();
    const url = decodeURIComponent(await page.evaluate(() => window.__o[0] ?? ''));
    for (const t of ['wa.me/31620318221', 'Oksels (mini zone) (€50)', 'hele lichaam + gezicht', 'Indicatie: €150', 'do', 'Test (voorbeeld)', 'huisregels gelezen']) if (!url.includes(t)) throw new Error(`mist: ${t}`);
  });
  await ctx.close();
}

console.log('Zonder JavaScript en met minder beweging');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('zonder JS: titel, prijzen en resultaten zichtbaar', async () => {
    if (!(await page.locator('.hero__title').isVisible()) || !(await page.locator('.price').first().isVisible()) || !(await page.locator('.ba img').first().isVisible())) throw new Error('onzichtbaar');
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
