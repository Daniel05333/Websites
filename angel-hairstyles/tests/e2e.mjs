// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile, mkdir } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';
import { site, isTodo } from '../src/site.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORT = 4413;
const base = `http://localhost:${PORT}`;
const pages = ['/', '/privacy/', '/404.html'];
const shots = new URL('../docs/screens/', import.meta.url).pathname;
await mkdir(shots, { recursive: true });
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

console.log('Layout, console en toegankelijkheid');
for (const width of [320, 390, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 } });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('/404.html') && problems.push(`${r.status()} ${r.url()}`));
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await check(`${width}px ${p} — geen horizontale scroll`, async () => {
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 0) throw new Error(`${over}px te breed`);
    });
    if (width === 390 || width === 1440) {
      await check(`${width}px ${p} — axe (WCAG 2.1 AA)`, async () => {
        await page.addScriptTag({ content: axeSrc });
        const res = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }));
        const v = res.violations.filter((x) => ['serious', 'critical'].includes(x.impact));
        if (v.length) throw new Error(v.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes[0].target}`).join(' | '));
      });
    }
  }
  await check(`${width}px — geen console- of netwerkfouten`, () => { if (problems.length) throw new Error(problems.join(' | ')); });
  await ctx.close();
}

console.log('Inhoud en SEO');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('precies één h1', async () => (await page.locator('h1').count()) === 1);
  await check('alle ankers wijzen naar een bestaand id', async () => {
    const missing = await page.evaluate(() => [...document.querySelectorAll('a[href*="#"]')]
      .map((a) => new URL(a.href).hash.slice(1)).filter((id) => id && !document.getElementById(id)));
    if (missing.length) throw new Error([...new Set(missing)].join(', '));
  });
  await check('elke afspraakknop gaat naar de boekingsroute', async () => {
    const hrefs = await page.$$eval('[data-track]', (as) => as.map((a) => a.getAttribute('href')));
    const want = site.booking.url ?? '#contact';
    if (!hrefs.length || hrefs.some((h) => h !== want)) throw new Error(hrefs.join(', '));
  });
  await check('concept: noindex + robots.txt blokkeert', async () => {
    if (!site.draft) return true;
    const robots = await page.getAttribute('meta[name=robots]', 'content');
    const txt = await (await fetch(base + '/robots.txt')).text();
    if (!robots?.includes('noindex') || !txt.includes('Disallow: /')) throw new Error('niet afgeschermd');
  });
  await check('geen JSON-LD zolang de site een concept is', async () => !site.draft || (await page.locator('script[type="application/ld+json"]').count()) === 0);
  await check('geen externe verzoeken (fonts/scripts lokaal)', async () => {
    const ext = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => !n.startsWith(location.origin)));
    if (ext.length) throw new Error(ext.join(', '));
  });
  await check('WebGL-achtergrond actief (of netjes uitgeschakeld)', async () => {
    const ready = await page.getAttribute('[data-silk]', 'data-ready');
    console.log(`      silk: ${ready ? 'actief' : 'fallback (CSS-gradient)'}`);
  });
  await check('placeholders zichtbaar gemarkeerd', async () => {
    const n = await page.locator('.ph').count();
    if (site.draft && n === 0) throw new Error('geen');
    console.log(`      ${n} gemarkeerde placeholders op de homepage`);
  });

  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${shots}desktop-hero.png` });
  await page.waitForTimeout(400);

  console.log('Interactie');
  await check('FAQ opent met toetsenbord', async () => {
    const s = page.locator('.faq summary').first();
    await s.focus(); await page.keyboard.press('Enter');
    return page.locator('.faq details').first().evaluate((d) => d.open);
  });
  await check('lightbox: openen, pijltjes, Escape, focus terug', async () => {
    const first = page.locator('.gallery__item').first();
    await first.scrollIntoViewIfNeeded(); await first.click();
    if (!(await page.locator('[data-lightbox]').evaluate((d) => d.open))) throw new Error('niet open');
    await page.keyboard.press('ArrowRight');
    const count = await page.textContent('[data-count]');
    if (!count.startsWith('2 /')) throw new Error(`teller ${count}`);
    await page.keyboard.press('Escape');
    if (await page.locator('[data-lightbox]').evaluate((d) => d.open)) throw new Error('niet dicht');
    const focused = await page.evaluate(() => document.activeElement?.classList.contains('gallery__item'));
    if (!focused) throw new Error('focus niet terug');
  });
  for (const id of ['behandelingen', 'prijzen', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${shots}desktop-${id}.png` });
  }
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${shots}mobile-hero.png` });
  await check('mobiel menu: opent, focus op sluiten, Escape sluit', async () => {
    await page.click('.burger');
    if (await page.locator('#sheet').isHidden()) throw new Error('niet open');
    if (!(await page.evaluate(() => document.activeElement.classList.contains('sheet__close')))) throw new Error('focus');
    await page.screenshot({ path: `${shots}mobile-menu.png` });
    await page.keyboard.press('Escape');
    if (!(await page.locator('#sheet').isHidden())) throw new Error('niet dicht');
  });
  await check('mobiele afspraakbalk verschijnt na de hero', async () => {
    await page.evaluate(() => scrollTo(0, innerHeight * 1.6));
    await page.waitForTimeout(500);
    return page.locator('[data-dock]').evaluate((d) => d.classList.contains('on'));
  });
  await check('klikgebieden ≥ 44px', async () => {
    const small = await page.$$eval('a, button, summary', (els) => els.filter((e) => {
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      return r.width > 0 && s.visibility !== 'hidden' && !e.closest('[hidden]') && !e.classList.contains('skip') && r.height < 44 && !e.closest('p, td, th, address');
    }).map((e) => `${e.tagName}.${e.className}:${Math.round(e.getBoundingClientRect().height)}`));
    if (small.length) throw new Error(small.slice(0, 6).join(', '));
  });
  await page.locator('#behandelingen').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${shots}mobile-behandelingen.png` });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('reduced motion: alle inhoud direct zichtbaar', async () => {
    const hidden = await page.$$eval('.reveal, .ch', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    if (hidden) throw new Error(`${hidden} elementen onzichtbaar`);
  });
  await ctx.close();
}

await check('launch-check: geen open placeholders als draft=false', () => {
  if (site.draft) { console.log('      (overgeslagen: site staat nog in conceptmodus)'); return true; }
  const n = JSON.stringify(site).match(/"todo":true/g)?.length ?? 0;
  if (n) throw new Error(`${n} placeholders nog open`);
});

await browser.close();
server.close();
console.log(failed ? `\n${failed} test(s) mislukt` : '\nAlle tests geslaagd');
process.exit(failed ? 1 : 0);
