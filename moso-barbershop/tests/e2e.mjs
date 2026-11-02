// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile, mkdir } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';
import { site } from '../src/site.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const PORT = 4613;
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
const instant = (page) => page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
// eerstvolgende datum (vanaf morgen) met de gevraagde weekdag, als JJJJ-MM-DD
const nextDay = (dow) => { const d = new Date(); d.setDate(d.getDate() + 1); while (d.getDay() !== dow) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

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
        await page.evaluate(() => document.querySelectorAll('.reveal, .reveal-img, .title, .display').forEach((e) => e.classList.add('in')));
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
  await instant(page);
  await check('precies één h1', async () => (await page.locator('h1').count()) === 1);
  await check('alle ankers wijzen naar een bestaand id', async () => {
    const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"], a[href^="/#"]')]
      .map((a) => new URL(a.href).hash.slice(1)).filter((id) => id && !document.getElementById(id)));
    if (missing.length) throw new Error([...new Set(missing)].join(', '));
  });
  await check('alle afbeeldingen laden', async () => {
    await page.evaluate(() => { for (const i of document.images) i.loading = 'eager'; });
    await settle(page, 1000);
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src));
    if (broken.length) throw new Error(broken.join(', '));
  });
  await check('concept: noindex + robots.txt blokkeert, geen JSON-LD', async () => {
    if (!site.draft) return true;
    const robots = await page.getAttribute('meta[name=robots]', 'content');
    const txt = await (await fetch(base + '/robots.txt')).text();
    if (!robots?.includes('noindex') || !txt.includes('Disallow: /')) throw new Error('niet afgeschermd');
    if (await page.locator('script[type="application/ld+json"]').count()) throw new Error('JSON-LD aanwezig');
  });
  await check('geen externe verzoeken (fonts/scripts lokaal)', async () => {
    const ext = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => !n.startsWith(location.origin)));
    if (ext.length) throw new Error(ext.join(', '));
  });
  await check('prijzen op de site = prijzen in src/site.mjs', async () => {
    const shown = await page.$$eval('.menu__price', (els) => els.map((e) => e.textContent.replace(/\D/g, '')));
    const want = site.services.map((s) => String(s.price));
    if (shown.join() !== want.join()) throw new Error(`${shown} ≠ ${want}`);
  });
  await check('openingstijden = src/site.mjs, vandaag gemarkeerd', async () => {
    const rows = await page.$$eval('.visit__hours tr', (trs) => trs.map((t) => t.querySelector('td').textContent));
    const want = site.hours.map((h) => (h.open ? `${h.open[0].replace(/^0/, '')} – ${h.open[1]}` : 'Gesloten'));
    if (rows.join() !== want.join()) throw new Error(rows.join());
    if ((await page.locator('.visit__hours tr.is-today').count()) !== 1) throw new Error('vandaag niet gemarkeerd');
  });
  await check('status open/gesloten zichtbaar met een tijd', async () => {
    const t = await page.textContent('[data-status-text]');
    if (!/^(Nu open · tot \d|Gesloten · )/.test(t)) throw new Error(t);
  });
  await check('telefoon- en routelinks kloppen', async () => {
    if (!(await page.locator(`a[href="${site.contact.phoneHref}"]`).count())) throw new Error('tel');
    if (!(await page.locator(`a[href="${site.location.mapsUrl}"]`).count())) throw new Error('maps');
  });
  await check('3D-hero: diepte, muis en honingraatlicht', async () => {
    await settle(page, 1800);
    await page.mouse.move(1300, 220); await settle(page, 900);
    const [d, rx, sx] = await page.$eval('[data-rig]', (r) => ['--depth', '--rx'].map((k) => Number(getComputedStyle(r).getPropertyValue(k)))
      .concat(parseFloat(getComputedStyle(document.querySelector('[data-spot]')).getPropertyValue('--sx'))));
    if (!(d > 0.9) || !(rx > 0.3) || !(sx > 1000)) throw new Error(`depth ${d}, rx ${rx}, spot ${sx}`);
  });
  await settle(page, 600);
  await page.screenshot({ path: `${shots}desktop-hero.png` });

  console.log('Interactie');
  await check('cuts: de galerij schuift horizontaal mee met de scroll', async () => {
    const top = await page.$eval('[data-cuts]', (s) => s.offsetTop);
    await page.evaluate((y) => scrollTo(0, y + 10), top); await settle(page, 400);
    const x1 = await page.$eval('[data-track]', (t) => parseFloat(t.style.getPropertyValue('--x')) || 0);
    await page.evaluate((y) => scrollTo(0, y + 900), top); await settle(page, 600);
    const x2 = await page.$eval('[data-track]', (t) => parseFloat(t.style.getPropertyValue('--x')));
    await page.screenshot({ path: `${shots}desktop-cuts.png` });
    if (!(x2 < x1 - 300)) throw new Error(`${x1} → ${x2}`);
  });
  await check('lightbox: openen, pijltjes, Escape, focus terug', async () => {
    // de eerste kaart die rechts van de kop in beeld staat
    const idx = await page.$$eval('.cut__card', (cs) => cs.findIndex((c) => c.getBoundingClientRect().left > document.querySelector('.cuts__head').getBoundingClientRect().right));
    await page.locator('.cut__card').nth(idx).click();
    if (!(await page.locator('[data-lightbox]').evaluate((d) => d.open))) throw new Error('niet open');
    await page.keyboard.press('ArrowRight');
    const count = await page.textContent('[data-count]');
    if (!count.startsWith(`${idx + 2} /`)) throw new Error(`teller ${count}`);
    await page.keyboard.press('Escape');
    if (await page.locator('[data-lightbox]').evaluate((d) => d.open)) throw new Error('niet dicht');
    if (!(await page.evaluate(() => document.activeElement?.classList.contains('cut__card')))) throw new Error('focus niet terug');
  });
  for (const id of ['prijzen', 'de-zaak', 'langskomen']) {
    await page.evaluate((i) => document.getElementById(i).scrollIntoView(), id); await settle(page, 1400);
    await page.screenshot({ path: `${shots}desktop-${id}.png` });
  }

  console.log('Afspraakformulier');
  await check('leeg versturen: foutsamenvatting krijgt focus, velden gemarkeerd', async () => {
    await page.evaluate(() => document.getElementById('afspraak').scrollIntoView());
    await page.click('[data-submit]');
    if (!(await page.evaluate(() => document.activeElement?.matches('[data-summary]')))) throw new Error('focus');
    const n = await page.locator('[data-form] [aria-invalid=true]').count();
    if (n < 4) throw new Error(`${n} velden gemarkeerd`);
  });
  await check('pijl bij "Haar en baard" in de prijslijst selecteert die dienst', async () => {
    await page.click('.menu__book[data-pick="haar-baard"]'); await settle(page, 300);
    return page.locator('[name=dienst][value=haar-baard]').isChecked();
  });
  await check('totaal: haar en baard + wassen = € 33', async () => {
    await page.locator('label.check:has([name=extra])').click();
    const t = await page.textContent('[data-total]');
    if (t.replace(/\s/g, '') !== '€33') throw new Error(t);
  });
  await check('zondag: foutmelding "gesloten", geen tijden', async () => {
    await page.fill('#f-datum', nextDay(0));
    await page.dispatchEvent('#f-datum', 'change');
    const opts = await page.$$eval('#f-tijd option', (o) => o.map((x) => x.value).filter(Boolean));
    await page.click('[data-submit]');
    const err = await page.textContent('#err-datum');
    if (opts.length || !/gesloten/.test(err)) throw new Error(`${opts.length} tijden, "${err}"`);
  });
  await check('vrijdag: voorkeurstijden van 9:00 tot 19:30', async () => {
    await page.fill('#f-datum', nextDay(5));
    await page.dispatchEvent('#f-datum', 'change');
    const opts = await page.$$eval('#f-tijd option', (o) => o.map((x) => x.value).filter(Boolean));
    if (opts[0] !== '9:00' || opts.at(-1) !== '19:30') throw new Error(`${opts[0]} … ${opts.at(-1)}`);
    await page.selectOption('#f-tijd', '16:30');
  });
  await check('ongeldige telefoon geeft een foutmelding', async () => {
    await page.fill('#f-naam', 'Test Klant');
    await page.fill('#f-tel', '123');
    await page.click('[data-submit]');
    return !!(await page.textContent('#err-telefoon'));
  });
  await check('zonder endpoint: geen nepbevestiging, bellen en bericht klaar', async () => {
    await page.fill('#f-tel', '06 12345678');
    await page.click('[data-submit]');
    await page.waitForSelector('[data-result]:not([hidden])');
    const txt = await page.textContent('[data-result]');
    if (!txt.includes('Er is nog niets verstuurd') || !txt.includes('Haar en baard') || !txt.includes('16:30') || !txt.includes('€ 33')) throw new Error(txt.slice(0, 160));
    if ((await page.getAttribute('[data-result] a.btn', 'href')) !== site.contact.phoneHref) throw new Error('belknop');
  });
  await page.screenshot({ path: `${shots}desktop-formulier-klaar.png` });
  await check('"Gegevens aanpassen" brengt het ingevulde formulier terug', async () => {
    await page.click('[data-back]');
    return (await page.inputValue('#f-naam')) === 'Test Klant';
  });
  await check('met endpoint 200: JSON verstuurd, bevestiging zonder "afspraak staat vast"', async () => {
    let body = null;
    await page.route('**/test-endpoint', async (r) => { body = r.request().postDataJSON(); await r.fulfill({ status: 200, body: '{}' }); });
    await page.$eval('[data-form]', (f) => { f.dataset.endpoint = '/test-endpoint'; });
    await page.click('[data-submit]');
    await page.waitForSelector('[data-result]:not([hidden])');
    if (!body || body.naam !== 'Test Klant' || body.dienst !== 'Haar en baard' || body.tijd !== '16:30') throw new Error(JSON.stringify(body));
    const t = await page.textContent('[data-result]');
    if (!t.includes('aangekomen') || !t.includes('nog niets vast')) throw new Error(t.slice(0, 120));
    await page.click('[data-back]');
  });
  await check('met endpoint 500: eerlijke foutmelding', async () => {
    await page.unroute('**/test-endpoint');
    await page.route('**/test-endpoint', (r) => r.fulfill({ status: 500, body: 'x' }));
    await page.locator('label.opt:has([value=knippen])').click();
    await page.fill('#f-datum', nextDay(2)); await page.dispatchEvent('#f-datum', 'change');
    await page.fill('#f-naam', 'Test Klant'); await page.fill('#f-tel', '0612345678');
    await page.click('[data-submit]');
    await page.waitForSelector('[data-result]:not([hidden])');
    const t = await page.textContent('[data-result]');
    if (!t.includes('Versturen mislukt') || t.includes('Top,')) throw new Error(t.slice(0, 100));
  });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await instant(page);
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
  await check('mobiel: cuts scrollen zijwaarts (geen vastgezette sectie)', async () => {
    const t = page.locator('[data-track]');
    await t.scrollIntoViewIfNeeded();
    const [sw, cw] = await t.evaluate((e) => [e.scrollWidth, e.clientWidth]);
    if (!(sw > cw)) throw new Error(`${sw} ≤ ${cw}`);
  });
  await check('mobiele bel- en afspraakknop verschijnen na de hero', async () => {
    await page.evaluate(() => scrollTo(0, innerHeight * 1.6)); await settle(page, 600);
    return page.locator('[data-dock]').evaluate((d) => d.classList.contains('on'));
  });
  await check('klikgebieden ≥ 44px', async () => {
    const small = await page.$$eval('a, button, label.opt, label.check', (els) => els.filter((e) => {
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      return r.width > 0 && s.visibility !== 'hidden' && !e.closest('[hidden]') && !e.classList.contains('skip') && r.height < 44 && !e.closest('p, td, th, address, .draftbar');
    }).map((e) => `${e.tagName}.${e.className}:${Math.round(e.getBoundingClientRect().height)}`));
    if (small.length) throw new Error(small.slice(0, 6).join(', '));
  });
  for (const id of ['cuts', 'prijzen', 'langskomen', 'afspraak']) {
    await page.evaluate((i) => document.getElementById(i).scrollIntoView(), id); await settle(page, 1400);
    await page.screenshot({ path: `${shots}mobile-${id}.png` });
  }
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('reduced motion: alles direct zichtbaar, galerij niet vastgezet', async () => {
    const hidden = await page.$$eval('.reveal, .ln > span, .layer', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    const clipped = await page.$$eval('.reveal-img', (els) => els.filter((e) => getComputedStyle(e).clipPath.startsWith('polygon(0px 100%')).length);
    const h = await page.$eval('[data-cuts]', (s) => s.style.getPropertyValue('--h'));
    if (hidden || clipped || h) throw new Error(`${hidden} onzichtbaar, ${clipped} geknipt, pin ${h}`);
  });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('zonder JavaScript: inhoud zichtbaar', async () => {
    const hidden = await page.$$eval('.reveal, .reveal-img, .ln > span', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1' || getComputedStyle(e).clipPath.startsWith('polygon(0px 100%')).length);
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
