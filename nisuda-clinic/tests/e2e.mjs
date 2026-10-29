// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile, mkdir } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';
import { site } from '../src/site.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 4513;
const base = `http://localhost:${PORT}`;
const pages = ['/', '/privacy/', '/404.html'];
const shots = new URL('../docs/screens/', import.meta.url).pathname;
await mkdir(shots, { recursive: true });
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0, passed = 0;
const check = async (name, fn) => {
  try { const r = await fn(); if (r === false) throw new Error('false'); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split('\n')[0]}`); }
};
const settle = (page, ms = 1200) => page.waitForTimeout(ms);

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
    await check(`${width}px ${p} — geen horizontale scroll`, async () => {
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) throw new Error(`${over}px te breed`);
    });
    if (width === 390 || width === 1440) {
      await check(`${width}px ${p} — axe (WCAG 2.1 AA)`, async () => {
        // alles onthullen, zodat axe het eindbeeld beoordeelt
        await page.evaluate(() => document.querySelectorAll('.reveal, .reveal-img, .title, .display, .w').forEach((e) => e.classList.add('in', 'on')));
        await settle(page, 1600);
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
    const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"], a[href^="/#"]')]
      .map((a) => new URL(a.href).hash.slice(1)).filter((id) => id && !document.getElementById(id)));
    if (missing.length) throw new Error([...new Set(missing)].join(', '));
  });
  await check('alle afbeeldingen laden', async () => {
    await page.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; } });
    await settle(page, 800);
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.src && (!i.complete || !i.naturalWidth)).map((i) => i.src));
    if (broken.length) throw new Error(broken.join(', '));
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
  await check('injectable-prijzen staan niet op de pagina (showPrices: false)', async () => {
    const inj = site.prices.find((p) => p.id === 'injectables');
    if (inj.showPrices) return true;
    const html = await page.content();
    if (/botox/i.test(html)) throw new Error('het woord botox staat op de pagina');
  });
  await check('prijzen op de site = prijzen in src/site.mjs (laser vrouw)', async () => {
    const shown = await page.$$eval('#panel-laser-vrouw .pl li', (lis) => lis.map((l) => l.querySelector('.pl__p').textContent.replace(/\D/g, '')));
    const want = site.prices[0].items.map(([, p]) => String(p));
    if (shown.join() !== want.join()) throw new Error(`${shown} ≠ ${want}`);
  });
  await check('3D-hero: rig krijgt diepte en reageert op de muis', async () => {
    await settle(page, 1800);
    const d = Number(await page.$eval('[data-rig]', (r) => getComputedStyle(r).getPropertyValue('--depth')));
    await page.mouse.move(1300, 200); await settle(page, 900);
    const rx = Number(await page.$eval('[data-rig]', (r) => getComputedStyle(r).getPropertyValue('--rx')));
    if (!(d > 0.9) || !(rx > 0.3)) throw new Error(`depth ${d}, rx ${rx}`);
  });
  await page.mouse.move(700, 450);
  await settle(page, 1200);
  await page.screenshot({ path: `${shots}desktop-hero.png` });

  console.log('Interactie');
  await check('behandeling-link opent het juiste prijstabblad', async () => {
    await page.click('[data-tab="plasmalift"]');
    await settle(page, 900);
    return page.locator('#panel-plasmalift').isVisible();
  });
  await check('tabs: pijltjestoetsen, Home/End', async () => {
    await page.focus('#tab-plasmalift');
    await page.keyboard.press('ArrowRight');
    if (!(await page.locator('#panel-lipfiller').isVisible())) throw new Error('ArrowRight');
    await page.keyboard.press('Home');
    if (!(await page.locator('#panel-laser-vrouw').isVisible())) throw new Error('Home');
    await page.keyboard.press('End');
    if (!(await page.locator('#panel-injectables').isVisible())) throw new Error('End');
    await page.keyboard.press('Home');
  });
  await page.locator('#prijzen').scrollIntoViewIfNeeded(); await settle(page);
  await page.screenshot({ path: `${shots}desktop-prijzen.png` });
  await check('resultaten: filter toont alleen de gekozen categorie', async () => {
    await page.locator('#resultaten').scrollIntoViewIfNeeded();
    await page.click('[data-filter="plasmalift"]');
    await settle(page, 600);
    const vis = await page.$$eval('.wall__item', (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.cat));
    if (!vis.length || vis.some((c) => c !== 'plasmalift')) throw new Error(vis.join());
    await page.click('[data-filter="alles"]'); await settle(page, 600);
  });
  await check('lightbox: openen, pijltjes, Escape, focus terug', async () => {
    const first = page.locator('.tile').first();
    await first.scrollIntoViewIfNeeded(); await settle(page, 1500); await first.click();
    if (!(await page.locator('[data-lightbox]').evaluate((d) => d.open))) throw new Error('niet open');
    await page.keyboard.press('ArrowRight');
    const count = await page.textContent('[data-count]');
    if (!count.startsWith('2 /')) throw new Error(`teller ${count}`);
    await page.keyboard.press('Escape');
    if (await page.locator('[data-lightbox]').evaluate((d) => d.open)) throw new Error('niet dicht');
    if (!(await page.evaluate(() => document.activeElement?.classList.contains('tile')))) throw new Error('focus niet terug');
  });
  await page.screenshot({ path: `${shots}desktop-resultaten.png` });

  console.log('Afspraakformulier');
  const form = '[data-form]';
  await check('leeg versturen: foutsamenvatting krijgt focus, velden gemarkeerd', async () => {
    await page.locator('#afspraak').scrollIntoViewIfNeeded();
    await page.click('[data-submit]');
    if (!(await page.evaluate(() => document.activeElement?.matches('[data-summary]')))) throw new Error('focus');
    const n = await page.locator(`${form} [aria-invalid=true]`).count();
    if (n < 3) throw new Error(`${n} velden gemarkeerd`);
  });
  await check('"Plan je gratis proefbehandeling" selecteert de proefbehandeling', async () => {
    if (!site.offer.active) return true;
    await page.click('.hero [data-pick="proef"]'); await settle(page, 600);
    return page.locator('[name=behandeling][value=proef]').isChecked();
  });
  await check('laser: zones tellen op tot een prijsindicatie', async () => {
    await page.locator('label:has([name=behandeling][value=laser])').click();
    await page.locator('label:has([name="zone-vrouw"][value="Oksels"])').click();
    await page.locator('label:has([name="zone-vrouw"][value="Benen"])').click();
    const t = await page.textContent('[data-total]');
    if (t.replace(/\s/g, '') !== '€65') throw new Error(t);
  });
  await check('laser: fullbody vervangt losse zones', async () => {
    await page.locator('label:has([name="zone-vrouw"][value="Fullbody"])').click();
    const t = await page.textContent('[data-total]');
    const disabled = await page.locator('[name="zone-vrouw"]:disabled').count();
    if (t.replace(/\s/g, '') !== '€100' || disabled < 8) throw new Error(`${t}, ${disabled} uitgeschakeld`);
  });
  await check('laser: man-prijslijst bij keuze "man"', async () => {
    await page.locator('.seg label:has([value=man])').click();
    await page.locator('label:has([name="zone-man"][value="Rug"])').click();
    const t = await page.textContent('[data-total]');
    if (t.replace(/\s/g, '') !== '€40') throw new Error(t);
  });
  await check('ongeldige telefoon en e-mail geven een foutmelding', async () => {
    await page.fill('#f-naam', 'Test Persoon');
    await page.fill('#f-tel', '123');
    await page.fill('#f-mail', 'geen-mail');
    await page.click('[data-submit]');
    const e1 = await page.textContent('#err-telefoon'), e2 = await page.textContent('#err-email');
    if (!e1 || !e2) throw new Error('geen melding');
  });
  await check('zonder endpoint: geen nepbevestiging, bericht klaar om te sturen', async () => {
    await page.fill('#f-tel', '06 12345678');
    await page.fill('#f-mail', '');
    await page.click('[data-submit]');
    await page.waitForSelector('[data-result]:not([hidden])');
    const txt = await page.textContent('[data-result]');
    if (!txt.includes('Er is nog niets verstuurd') || !txt.includes('Rug') || !txt.includes('06 12345678')) throw new Error(txt.slice(0, 120));
    const dm = await page.getAttribute('[data-result] [data-dm]', 'href');
    if (dm !== site.contact.dm) throw new Error(dm);
  });
  await page.screenshot({ path: `${shots}desktop-formulier-klaar.png` });
  await check('"Gegevens aanpassen" brengt het ingevulde formulier terug', async () => {
    await page.click('[data-back]');
    return (await page.inputValue('#f-naam')) === 'Test Persoon';
  });
  await check('met endpoint 200: JSON verstuurd, echte bevestiging', async () => {
    let body = null;
    await page.route('**/test-endpoint', async (r) => { body = r.request().postDataJSON(); await r.fulfill({ status: 200, body: '{}' }); });
    await page.$eval(form, (f) => { f.dataset.endpoint = '/test-endpoint'; });
    await page.click('[data-submit]');
    await page.waitForSelector('[data-result]:not([hidden])');
    if (!body || body.naam !== 'Test Persoon' || !body.zones?.includes('Rug')) throw new Error(JSON.stringify(body));
    if (!(await page.textContent('[data-result]')).includes('aangekomen')) throw new Error('geen bevestiging');
    await page.click('[data-back]');
  });
  await check('met endpoint 500: eerlijke foutmelding, geen bevestiging', async () => {
    await page.unroute('**/test-endpoint');
    await page.route('**/test-endpoint', (r) => r.fulfill({ status: 500, body: 'x' }));
    await page.fill('#f-naam', 'Test Persoon');
    await page.fill('#f-tel', '0612345678');
    await page.locator('label:has([name=behandeling][value=plasmalift])').click();
    await page.click('[data-submit]');
    await page.waitForSelector('[data-result]:not([hidden])');
    const t = await page.textContent('[data-result]');
    if (!t.includes('Versturen is niet gelukt') || t.includes('Dank je wel')) throw new Error(t.slice(0, 100));
  });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await settle(page, 2000);
  await page.screenshot({ path: `${shots}mobile-hero.png` });
  await check('mobiel menu: opent, focus op sluiten, Escape sluit, focus terug', async () => {
    await page.click('.burger');
    if (await page.locator('#sheet').isHidden()) throw new Error('niet open');
    if (!(await page.evaluate(() => document.activeElement.classList.contains('sheet__close')))) throw new Error('focus');
    await settle(page, 900);
    await page.screenshot({ path: `${shots}mobile-menu.png` });
    await page.keyboard.press('Escape');
    if (!(await page.locator('#sheet').isHidden())) throw new Error('niet dicht');
    if (!(await page.evaluate(() => document.activeElement.classList.contains('burger')))) throw new Error('focus terug');
  });
  await check('mobiele afspraakknop verschijnt na de hero', async () => {
    await page.evaluate(() => scrollTo(0, innerHeight * 1.6));
    await settle(page, 600);
    return page.locator('[data-dock]').evaluate((d) => d.classList.contains('on'));
  });
  await check('klikgebieden ≥ 44px', async () => {
    const small = await page.$$eval('a, button, summary, label.chip, .seg label', (els) => els.filter((e) => {
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      return r.width > 0 && s.visibility !== 'hidden' && !e.closest('[hidden]') && !e.classList.contains('skip') && r.height < 44 && !e.closest('p, td, th, address, .draftbar');
    }).map((e) => `${e.tagName}.${e.className}:${Math.round(e.getBoundingClientRect().height)}`));
    if (small.length) throw new Error(small.slice(0, 6).join(', '));
  });
  for (const id of ['behandelingen', 'resultaten', 'prijzen', 'afspraak']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await settle(page, 1400);
    await page.screenshot({ path: `${shots}mobile-${id}.png` });
  }
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('reduced motion: alle inhoud direct zichtbaar, geen laseranimatie', async () => {
    const hidden = await page.$$eval('.reveal, .ln > span, .layer', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    const clipped = await page.$$eval('.reveal-img', (els) => els.filter((e) => getComputedStyle(e).clipPath !== 'none').length);
    const scan = await page.$eval('.scan', (e) => getComputedStyle(e).display);
    if (hidden || clipped || scan !== 'none') throw new Error(`${hidden} onzichtbaar, ${clipped} geknipt, scan ${scan}`);
  });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('zonder JavaScript: inhoud zichtbaar', async () => {
    const hidden = await page.$$eval('.reveal, .reveal-img, .ln > span', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1' || getComputedStyle(e).clipPath !== 'none').length);
    if (hidden) throw new Error(`${hidden} elementen verborgen`);
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
console.log(failed ? `\n${passed} geslaagd, ${failed} mislukt` : `\nAlle ${passed} tests geslaagd`);
process.exit(failed ? 1 : 0);
