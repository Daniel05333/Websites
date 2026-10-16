// Browsertests op ./public met Playwright + axe-core.
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORT = 4412;
const base = `http://localhost:${PORT}`;
const pages = ['/', '/tarieven/', '/proefles/', '/over-rijschool-linkerbaan/', '/contact/', '/privacy/', '/404.html'];
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0;
const ok = (name) => console.log(`  ✓ ${name}`);
const fail = (name, detail) => { failed++; console.log(`  ✗ ${name}\n      ${detail}`); };
const check = async (name, fn) => { try { const r = await fn(); r === false ? fail(name, 'false') : ok(name); } catch (e) { fail(name, e.message.split('\n')[0]); } };

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: exe });

// 1. Consolefouten, netwerkfouten, horizontale overflow per breedte
console.log('Layout en console');
for (const width of [320, 375, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('requestfailed', (r) => problems.push(`request failed ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('/404.html') && problems.push(`${r.status()} ${r.url()}`));
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) problems.push(`${p}: ${overflow}px horizontale overflow`);
  }
  problems.length ? fail(`${width}px: geen overflow/consolefouten`, problems.join('; ')) : ok(`${width}px: geen overflow, consolefouten of kapotte requests op ${pages.length} pagina's`);
  await ctx.close();
}

// 2. Toegankelijkheid (axe, WCAG 2.1 AA)
console.log('Toegankelijkheid (axe-core, WCAG 2 A/AA)');
for (const [label, vp] of [['desktop', { width: 1280, height: 900 }], ['mobiel', { width: 375, height: 800 }]]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    await page.addScriptTag({ content: axeSrc });
    const res = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }));
    const v = res.violations;
    v.length
      ? fail(`${label} ${p}`, v.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`).join('; '))
      : ok(`${label} ${p}: 0 overtredingen`);
  }
  await ctx.close();
}

// 3. Navigatie en contactlinks
console.log('Navigatie en contact');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  for (const [text, path] of [['Rijlessen & tarieven', '/tarieven/'], ['Over ons', '/over-rijschool-linkerbaan/'], ['Contact', '/contact/'], ['Home', '/']]) {
    await check(`hoofdmenu "${text}" → ${path}`, async () => {
      await page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link', { name: text, exact: true }).click();
      await page.waitForURL(base + path);
      return (await page.locator('.main-nav [aria-current="page"]').textContent()) === text;
    });
  }
  await check('tel-links wijzen naar +31850608137', async () => {
    const hrefs = await page.$$eval('a[href^="tel:"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
    return hrefs.length === 1 && hrefs[0] === 'tel:+31850608137';
  });
  await check('mailto-links wijzen naar info@rijschoollinkerbaan.nl', async () =>
    (await page.$$eval('a[href^="mailto:"]', (as) => as.every((a) => a.href.startsWith('mailto:info@rijschoollinkerbaan.nl')))));
  await check('WhatsApp-links: wa.me met nummer, nieuw tabblad, rel=noopener', async () =>
    (await page.$$eval('a[href*="wa.me"]', (as) => as.length > 0 && as.every((a) => /^https:\/\/wa\.me\/31850608137\?text=/.test(a.href) && a.target === '_blank' && a.rel.includes('noopener')))));
  await check('tariefkaart-CTA neemt pakket mee naar formulier', async () => {
    await page.goto(base + '/tarieven/');
    await page.getByRole('link', { name: 'Start met Spoed' }).click();
    await page.waitForURL(/\/proefles\/\?pakket=spoed/);
    return (await page.locator('#pakket').inputValue()) === 'spoed';
  });
  await check('prijzen consistent tussen home, tarieven en vergelijking', async () => {
    const get = async (p) => { await page.goto(base + p); return page.$$eval('.price-card__price', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim())); };
    const a = await get('/'), b = await get('/tarieven/');
    const cmp = await page.$$eval('.compare tbody tr:last-child td', (els) => els.map((e) => e.textContent.trim()));
    return JSON.stringify(a) === JSON.stringify(b) && a.length === 3 && cmp.join() === '€ 1.100,€ 1.650,€ 2.300';
  });
  await check('FAQ-accordeon opent met toetsenbord', async () => {
    await page.goto(base + '/');
    const s = page.locator('#veelgestelde-vragen summary').first();
    await s.focus(); await page.keyboard.press('Enter');
    return page.locator('#veelgestelde-vragen details').first().evaluate((d) => d.open);
  });
  await check('skip-link springt naar main', async () => {
    await page.goto(base + '/tarieven/');
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement.textContent.trim());
    await page.keyboard.press('Enter');
    return first === 'Naar de inhoud' && (await page.evaluate(() => document.activeElement.id)) === 'main';
  });
  await ctx.close();
}

// 4. Mobiel menu en sticky CTA
console.log('Mobiel');
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base + '/tarieven/');
  const toggle = page.locator('[data-menu-toggle]');
  await check('menu opent, focus naar eerste link, Esc sluit en focus terug', async () => {
    await toggle.click();
    const open = (await toggle.getAttribute('aria-expanded')) === 'true' && (await page.locator('#mobile-menu').isVisible());
    const focusInMenu = await page.evaluate(() => !!document.activeElement.closest('#mobile-menu'));
    await page.keyboard.press('Escape');
    const closed = (await toggle.getAttribute('aria-expanded')) === 'false' && !(await page.locator('#mobile-menu').isVisible());
    const focusBack = await page.evaluate(() => document.activeElement.matches('[data-menu-toggle]'));
    return open && focusInMenu && closed && focusBack;
  });
  await check('menulink navigeert', async () => {
    await toggle.click();
    await page.locator('#mobile-menu').getByRole('link', { name: 'Contact' }).click();
    await page.waitForURL(base + '/contact/');
    return true;
  });
  await check('sticky CTA zichtbaar op tarieven, verborgen bij formulier', async () => {
    await page.goto(base + '/tarieven/');
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(500);
    const shown = !(await page.locator('[data-sticky-cta]').evaluate((e) => e.classList.contains('is-hidden')));
    await page.goto(base + '/contact/');
    await page.locator('[data-form-card]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const hidden = await page.locator('[data-sticky-cta]').evaluate((e) => e.classList.contains('is-hidden'));
    return shown && hidden;
  });
  await check('touch targets ≥ 44px voor knoppen en menu', async () => {
    await page.goto(base + '/');
    const small = await page.$$eval('.btn, .menu-toggle, .sticky-cta__icon, .choice__options span', (els) =>
      els.filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect()).filter((r) => r.height < 44 || r.width < 44).length);
    return small === 0;
  });
  await ctx.close();
}

// 5. Formulier
console.log('Proeflesformulier');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const fill = async () => {
    await page.fill('#naam', 'Sanne de Vries');
    await page.fill('#telefoon', '06 12345678');
    await page.fill('#email', 'sanne@example.nl');
    await page.selectOption('#woonplaats', 'Hengelo');
  };
  await page.goto(base + '/proefles/');
  await check('leeg verzenden: foutsamenvatting + inline fouten, niets verstuurd', async () => {
    await page.click('[data-submit]');
    const summaryFocused = await page.evaluate(() => document.activeElement.matches('[data-error-summary]'));
    const inv = await page.$$eval('[aria-invalid="true"]', (e) => e.map((x) => x.id));
    return summaryFocused && inv.join() === 'naam,telefoon' && (await page.locator('[data-form-result]').isHidden());
  });
  await check('ongeldig telefoonnummer en e-mail worden geweigerd', async () => {
    await page.fill('#naam', 'Sanne'); await page.fill('#telefoon', '123'); await page.fill('#email', 'sanne@');
    await page.click('[data-submit]');
    const inv = await page.$$eval('[aria-invalid="true"]', (e) => e.map((x) => x.id));
    return inv.join() === 'telefoon,email';
  });
  await check('zonder endpoint: geen nepbevestiging, maar doorsturen via WhatsApp/e-mail met ingevulde gegevens', async () => {
    await page.goto(base + '/proefles/');
    await fill();
    await page.click('[data-submit]');
    const res = page.locator('[data-form-result]');
    const text = await res.textContent();
    const wa = await res.locator('a[href*="wa.me"]').getAttribute('href');
    const mail = await res.locator('a[href^="mailto:"]').getAttribute('href');
    return !/verstuurd|bedankt/i.test(text) && /Nog één stap/.test(text) && decodeURIComponent(wa).includes('Naam: Sanne de Vries') && decodeURIComponent(wa).includes('Woonplaats: Hengelo') && mail.includes('subject=');
  });
  await check('"Gegevens aanpassen" brengt formulier met gegevens terug', async () => {
    await page.click('[data-back]');
    return (await page.locator('#naam').inputValue()) === 'Sanne de Vries';
  });
  await check('honeypot ingevuld: niets gebeurt', async () => {
    await page.goto(base + '/proefles/');
    await fill();
    await page.evaluate(() => (document.querySelector('#website').value = 'spam'));
    await page.click('[data-submit]');
    return page.locator('[data-form-result]').isHidden();
  });

  // Met endpoint: gedrag bij 2xx en bij fout (endpoint wordt in de pagina gezet en gemockt)
  const withEndpoint = async (status) => {
    await page.goto(base + '/proefles/');
    await page.evaluate(() => (document.querySelector('[data-trial-form]').dataset.endpoint = '/api/proefles'));
    let body = null;
    await page.route('**/api/proefles', async (route) => { body = route.request().postDataJSON(); await route.fulfill({ status, body: '{}' }); });
    await fill();
    await page.click('[data-submit]');
    await page.locator('[data-form-result]').waitFor();
    await page.unroute('**/api/proefles');
    return { body, text: await page.locator('[data-form-result]').textContent() };
  };
  await check('endpoint 200: gegevens als JSON gepost en bevestiging getoond', async () => {
    const { body, text } = await withEndpoint(200);
    return body?.naam === 'Sanne de Vries' && body.telefoon === '06 12345678' && /Bedankt, Sanne/.test(text);
  });
  await check('endpoint 500: eerlijke foutmelding met alternatieven, geen bevestiging', async () => {
    const { text } = await withEndpoint(500);
    return /niet gelukt/.test(text) && !/Bedankt/.test(text);
  });
  await check('formulier zonder JavaScript: velden required, geen crash', async () => {
    const c2 = await browser.newContext({ javaScriptEnabled: false });
    const p2 = await c2.newPage();
    await p2.goto(base + '/proefles/');
    const req = await p2.$$eval('[required]', (e) => e.map((x) => x.id));
    await c2.close();
    return req.join() === 'naam,telefoon';
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n✗ ${failed} test(s) mislukt` : '\n✓ Alle browsertests geslaagd');
process.exit(failed ? 1 : 0);
