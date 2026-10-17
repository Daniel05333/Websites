// Browsertests op ./public met Playwright + axe-core.
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORT = 4512;
const base = `http://localhost:${PORT}`;
const pages = [
  '/', '/website-laten-maken.html', '/standaard-website.html', '/maatwerk-website.html', '/website-laten-optimaliseren/',
  '/wordpress-webdesign.html', '/blogs-laten-schrijven/', '/seo-uitbesteden/', '/fotografie-voor-websites.html',
  '/over-ons/', '/contact/', '/privacy/', '/404.html',
];
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

let failed = 0;
const ok = (name) => console.log(`  ✓ ${name}`);
const fail = (name, detail) => { failed++; console.log(`  ✗ ${name}\n      ${detail}`); };
const check = async (name, fn) => { try { const r = await fn(); r === false ? fail(name, 'false') : ok(name); } catch (e) { fail(name, e.message.split('\n')[0]); } };

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// 1. Consolefouten, netwerkfouten, horizontale overflow per breedte
console.log('Layout en console');
for (const width of [320, 375, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(e.message));
  // ERR_ABORTED = download afgebroken doordat de test al naar de volgende pagina gaat (bv. de lazy 3D-module); geen kapot bestand.
  page.on('requestfailed', (r) => !/ERR_ABORTED/.test(r.failure()?.errorText) && problems.push(`request failed ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('/404.html') && problems.push(`${r.status()} ${r.url()}`));
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) {
      const culprit = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 0.5).map((e) => `${e.tagName.toLowerCase()}.${String(e.className.baseVal ?? e.className).split(' ')[0]}`).slice(-3).join(' > '));
      problems.push(`${p}: ${overflow}px horizontale overflow (${culprit})`);
    }
  }
  problems.length ? fail(`${width}px: geen overflow/consolefouten`, problems.join('; ')) : ok(`${width}px: geen overflow, consolefouten of kapotte requests op ${pages.length} pagina's`);
  await ctx.close();
}

// 2. Toegankelijkheid
console.log('Toegankelijkheid (axe-core, WCAG 2.1 A/AA + best practices)');
for (const [label, vp] of [['desktop', { width: 1280, height: 900 }], ['mobiel', { width: 375, height: 800 }]]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
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

// 3. 3D-hero
console.log('Conversion Engine (3D-hero)');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('SVG-fallback staat direct in de HTML (zonder JS zichtbaar)', async () =>
    (await page.locator('.hero__stage .engine-svg').count()) === 1 && (await page.locator('#hero-title').isVisible()));
  await check('WebGL-scène laadt na idle, canvas wordt zichtbaar, geen fouten', async () => {
    await page.waitForSelector('.hero__stage.is-live canvas', { timeout: 15000 });
    await page.waitForTimeout(1600);
    const opacity = await page.locator('.engine-canvas').evaluate((c) => getComputedStyle(c).opacity);
    return opacity === '1' && errors.length === 0;
  });
  await check('scène rendert pixels (canvas niet leeg)', async () => {
    const shot = await page.locator('.engine-canvas').screenshot();
    return shot.length > 20000;
  });
  await check('render-loop pauzeert buiten beeld (geen 3D-frames na wegscrollen)', async () => {
    const frames = () => page.evaluate(() => document.querySelector('[data-engine]').__frames || 0);
    const live = await frames();
    await page.waitForTimeout(500);
    const running = (await frames()) > live;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
    const before = await frames();
    await page.waitForTimeout(800);
    return running && (await frames()) - before < 2;
  });
  await ctx.close();

  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p2 = await rm.newPage();
  const requests = [];
  p2.on('request', (r) => requests.push(r.url()));
  await p2.goto(base + '/', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(2500);
  await check('prefers-reduced-motion: 3D wordt niet geladen, statische compositie blijft', async () =>
    !requests.some((u) => u.includes('engine.js')) && (await p2.locator('.engine-canvas').count()) === 0 && (await p2.locator('.engine-svg').first().isVisible()));
  await rm.close();
}

// 4. Navigatie, CTA's en contactlinks
console.log('Navigatie en contact');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  for (const [text, path] of [['Diensten', '/website-laten-maken.html'], ['Over ons', '/over-ons/']]) {
    await check(`hoofdmenu "${text}" → ${path}`, async () => {
      await page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link', { name: text, exact: true }).click();
      await page.waitForURL(base + path);
      return (await page.locator('.masthead__nav [aria-current="page"]').textContent()) === text;
    });
  }
  await check('header-CTA "Bespreek je website" → /contact/', async () => {
    await page.locator('.masthead__cta').click();
    await page.waitForURL(base + '/contact/');
    return true;
  });
  await check('"Resultaten" → cases-sectie op home', async () => {
    await page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link', { name: 'Resultaten', exact: true }).click();
    await page.waitForURL(base + '/#resultaten');
    return page.locator('#resultaten').isVisible();
  });
  await check('alle tel-links: +31611907255', async () => {
    const hrefs = await page.$$eval('a[href^="tel:"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
    return hrefs.join() === 'tel:+31611907255';
  });
  await check('alle mailto-links: info@nexdmedia.com', async () =>
    page.$$eval('a[href^="mailto:"]', (as) => as.length > 0 && as.every((a) => a.href.startsWith('mailto:info@nexdmedia.com'))));
  await check('WhatsApp-links: wa.me/31611907255 met tekst, nieuw tabblad, rel=noopener', async () =>
    page.$$eval('a[href*="wa.me"]', (as) => as.length > 0 && as.every((a) => /^https:\/\/wa\.me\/31611907255\?text=/.test(a.href) && a.target === '_blank' && a.rel.includes('noopener'))));
  await check('alle externe links openen veilig (rel=noopener)', async () =>
    page.$$eval('a[target="_blank"]', (as) => as.every((a) => a.rel.includes('noopener'))));
  await check('prijzen consistent: hero-paneel = keuzehulp = dienstpagina', async () => {
    await page.goto(base + '/');
    // Met JS zijn de cijfers in letters gesplitst; de leesbare kopie staat in .visually-hidden.
    const hero = await page.$$eval('.panel__stats dd [data-reveal]', (e) => e.map((x) => `€ ${(x.querySelector('.visually-hidden') ?? x).textContent.trim()}`));
    const plans = await page.$$eval('.plan__amount', (e) => e.map((x) => x.textContent.trim()));
    await page.goto(base + '/maatwerk-website.html');
    const card = (await page.locator('.price-card__price').textContent()).replace(/\s+/g, ' ');
    return hero.join() === '€ 1.795,€ 4.495,€ 1.395' && plans.join() === hero.join() && card.includes('€ 4.495');
  });
  await check('keuzehulp toont het plan dat bij de situatie past', async () => {
    await page.goto(base + '/');
    await page.locator('.chooser__option', { hasText: 'levert te weinig op' }).click();
    const visible = await page.$$eval('[data-plan]', (ps) => ps.filter((p) => !p.hidden).map((p) => p.dataset.plan));
    return visible.join() === 'optimaliseren';
  });
  await check('keuzehulp is met toetsenbord te bedienen (pijltjes)', async () => {
    await page.locator('input[name="situatie"]:checked').focus();
    await page.keyboard.press('ArrowUp');
    const visible = await page.$$eval('[data-plan]', (ps) => ps.filter((p) => !p.hidden).map((p) => p.dataset.plan));
    return visible.join() === 'maatwerk';
  });
  await check('plan-CTA neemt dienst mee naar formulier (?project=maatwerk)', async () => {
    await page.getByRole('link', { name: 'Bespreek een maatwerk website' }).click();
    await page.waitForURL(/\/contact\/\?project=maatwerk/);
    return (await page.locator('#project').inputValue()) === 'maatwerk';
  });
  await check('gratis websitecheck in de hero vult het onderwerp in het formulier', async () => {
    await page.goto(base + '/');
    await page.locator('[data-offer-link]').click();
    await page.waitForURL(/\/contact\/\?project=websitecheck/);
    return (await page.locator('#project').inputValue()) === 'websitecheck';
  });
  await check('alle 6 teamportretten laden', async () => {
    await page.goto(base + '/over-ons/');
    await page.locator('.team-grid').scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => [...document.querySelectorAll('.member__portrait img')].every((i) => i.complete && i.naturalWidth), null, { timeout: 8000 }).catch(() => {});
    return page.$$eval('.member__portrait img', (is) => is.length === 6 && is.every((i) => i.complete && i.naturalWidth === 256));
  });
  await check('oude WordPress-URL\'s hebben een 301 in .htaccess', async () => {
    const ht = await readFile(new URL('../public/.htaccess', import.meta.url), 'utf8');
    return ['website-laten-maken/standaard-website', 'website-laten-maken/maatwerk-website', 'wordpress-webdesign'].every((u) => ht.includes(`^/${u}/?$`));
  });
  await check('FAQ-accordeon opent met toetsenbord', async () => {
    await page.goto(base + '/');
    const s = page.locator('#veelgestelde-vragen summary').first();
    await s.focus(); await page.keyboard.press('Enter');
    return page.locator('#veelgestelde-vragen details').first().evaluate((d) => d.open);
  });
  await check('skip-link: verborgen tot focus, springt naar main', async () => {
    await page.goto(base + '/over-ons/');
    const hidden = await page.locator('.skip-link').evaluate((e) => e.getBoundingClientRect().bottom <= 0);
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement.textContent.trim());
    await page.keyboard.press('Enter');
    return hidden && first === 'Naar de inhoud' && (await page.evaluate(() => document.activeElement.id)) === 'main';
  });
  await check('cases: strip wisselt de getoonde case (aria-pressed, één case zichtbaar)', async () => {
    await page.goto(base + '/');
    await page.locator('[data-pick="countus"]').scrollIntoViewIfNeeded();
    await page.locator('[data-pick="countus"]').click();
    await page.waitForTimeout(300);
    const pressed = await page.$$eval('[data-pick]', (bs) => bs.map((b) => b.getAttribute('aria-pressed')).join());
    const shown = await page.$$eval('[data-case]', (as) => as.filter((a) => a.offsetParent).map((a) => a.dataset.case).join());
    return pressed === 'false,true,false' && shown === 'countus';
  });
  await check('werkwijze: 7 stappen in de tijdlijn, rail volgt de scroll', async () => {
    await page.locator('#werkwijze').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(600);
    const y = await page.locator('.rail__mark').getAttribute('transform');
    return (await page.locator('[data-row]').count()) === 7 && /translate\(8 [1-9]/.test(y || '');
  });
  await ctx.close();
}

// 5. Mobiel
console.log('Mobiel');
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base + '/maatwerk-website.html');
  const toggle = page.locator('[data-menu-toggle]');
  await check('menu opent, focus naar eerste link, Esc sluit en focus terug', async () => {
    await toggle.click();
    const open = (await toggle.getAttribute('aria-expanded')) === 'true' && (await page.locator('#menu-sheet').isVisible());
    const focusInMenu = await page.evaluate(() => !!document.activeElement.closest('#menu-sheet'));
    await page.keyboard.press('Escape');
    const closed = (await toggle.getAttribute('aria-expanded')) === 'false' && !(await page.locator('#menu-sheet').isVisible());
    const focusBack = await page.evaluate(() => document.activeElement.matches('[data-menu-toggle]'));
    return open && focusInMenu && closed && focusBack;
  });
  await check('menulink navigeert', async () => {
    await toggle.click();
    await page.locator('#menu-sheet').getByRole('link', { name: 'Over ons' }).click();
    await page.waitForURL(base + '/over-ons/');
    return true;
  });
  await check('sticky CTA: verborgen in hero, zichtbaar halverwege, verborgen bij formulier', async () => {
    await page.goto(base + '/maatwerk-website.html');
    await page.waitForTimeout(300);
    const hiddenTop = await page.locator('[data-sticky-cta]').evaluate((e) => e.classList.contains('is-hidden'));
    await page.locator('.steps-band').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('[data-sticky-cta]').classList.contains('is-hidden'), null, { timeout: 3000 }).catch(() => {});
    const shown = !(await page.locator('[data-sticky-cta]').evaluate((e) => e.classList.contains('is-hidden')));
    await page.goto(base + '/contact/');
    await page.locator('[data-form-card]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const hiddenForm = await page.locator('[data-sticky-cta]').evaluate((e) => e.classList.contains('is-hidden'));
    if (!(hiddenTop && shown && hiddenForm)) throw new Error(`top ${hiddenTop}, midden zichtbaar ${shown}, formulier ${hiddenForm}`);
    return true;
  });
  await check('touch targets ≥ 44px voor knoppen, menu en keuzes', async () => {
    const small = [];
    for (const p of ['/', '/contact/', '/standaard-website.html']) {
      await page.goto(base + p);
      small.push(...(await page.$$eval('.cta, .bracket-link, .burger, .sticky-cta__icon, .chooser__option, .faq__item summary, .pill-list a, .foot__nav a, .strip__card', (els) =>
        els.filter((e) => e.offsetParent).map((e) => [e.textContent.trim().slice(0, 20), e.getBoundingClientRect()]).filter(([, r]) => r.height < 40 || r.width < 40).map(([t]) => t))));
    }
    if (small.length) throw new Error(small.join(', '));
    return true;
  });
  await ctx.close();
}

// 6. Contactformulier
console.log('Contactformulier');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const fill = async () => {
    await page.fill('#naam', 'Eva Jansen');
    await page.fill('#bedrijf', 'Jansen Advocaten');
    await page.fill('#email', 'eva@example.nl');
    await page.selectOption('#project', 'maatwerk');
    await page.fill('#bericht', 'Onze website levert te weinig intakes op.');
  };
  await page.goto(base + '/contact/');
  await check('leeg verzenden: foutsamenvatting met focus + inline fouten', async () => {
    await page.click('[data-submit]');
    const summaryFocused = await page.evaluate(() => document.activeElement.matches('[data-error-summary]'));
    const inv = await page.$$eval('[aria-invalid="true"]', (e) => e.map((x) => x.id));
    return summaryFocused && inv.join() === 'naam,email,bericht' && (await page.locator('[data-form-result]').isHidden());
  });
  await check('link in foutsamenvatting zet focus op het veld', async () => {
    await page.locator('[data-error-summary] a').first().click();
    return page.evaluate(() => document.activeElement.id === 'naam');
  });
  await check('ongeldig e-mailadres en telefoonnummer worden geweigerd', async () => {
    await page.fill('#naam', 'Eva'); await page.fill('#email', 'eva@'); await page.fill('#telefoon', '12');
    await page.fill('#bericht', 'Een vraag over onze site');
    await page.click('[data-submit]');
    const inv = await page.$$eval('[aria-invalid="true"]', (e) => e.map((x) => x.id));
    return inv.join() === 'email,telefoon';
  });
  await check('zonder endpoint: géén nepbevestiging, wel e-mail/WhatsApp met ingevulde gegevens', async () => {
    await page.goto(base + '/contact/');
    await fill();
    await page.click('[data-submit]');
    const res = page.locator('[data-form-result]');
    const text = await res.textContent();
    const mail = decodeURIComponent(await res.locator('a[href^="mailto:"]').getAttribute('href'));
    const wa = decodeURIComponent(await res.locator('a[href*="wa.me"]').getAttribute('href'));
    return !/is verstuurd|bedankt/i.test(text) && /Nog één stap/.test(text) && mail.includes('Naam: Eva Jansen') && mail.includes('Onderwerp: Maatwerk website') && wa.includes('Bedrijf: Jansen Advocaten');
  });
  await check('"Gegevens aanpassen" brengt formulier met gegevens terug', async () => {
    await page.click('[data-back]');
    return (await page.locator('#naam').inputValue()) === 'Eva Jansen';
  });
  await check('met endpoint (200): bevestiging en formulier gereset', async () => {
    await page.route('**/test-endpoint', (r) => r.fulfill({ status: 200, body: '{}', contentType: 'application/json' }));
    await page.goto(base + '/contact/');
    await page.evaluate(() => (document.querySelector('[data-contact-form]').dataset.endpoint = '/test-endpoint'));
    await fill();
    const [req] = await Promise.all([page.waitForRequest('**/test-endpoint'), page.click('[data-submit]')]);
    const body = JSON.parse(req.postData());
    await page.waitForSelector('[data-form-result]:not([hidden])');
    return body.email === 'eva@example.nl' && /Bedankt, Eva/.test(await page.locator('[data-form-result]').textContent());
  });
  await check('met endpoint (500): eerlijke foutmelding met alternatieven', async () => {
    await page.route('**/fail-endpoint', (r) => r.fulfill({ status: 500, body: 'x' }));
    await page.goto(base + '/contact/');
    await page.evaluate(() => (document.querySelector('[data-contact-form]').dataset.endpoint = '/fail-endpoint'));
    await fill();
    await page.click('[data-submit]');
    await page.waitForSelector('.form-result--error');
    const t = await page.locator('[data-form-result]').textContent();
    return /niet gelukt/.test(t) && /niet/.test(t) && (await page.locator('[data-form-result] a[href^="mailto:"]').count()) === 1;
  });
  await check('honeypot ingevuld: niets gebeurt', async () => {
    await page.goto(base + '/contact/');
    await fill();
    await page.evaluate(() => (document.querySelector('#website').value = 'spam'));
    await page.click('[data-submit]');
    return page.locator('[data-form-result]').isHidden();
  });
  await ctx.close();
}

// 7. Zonder JavaScript
console.log('Zonder JavaScript');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  await check('alle content zichtbaar: hero, alle drie de cases, alle drie de pakketten, tijdlijn', async () =>
    (await page.locator('#hero-title').isVisible()) && (await page.locator('#resultaten').isVisible()) &&
    (await page.$$eval('[data-case]', (as) => as.filter((a) => a.offsetParent).length)) === 3 &&
    (await page.$$eval('[data-plan]', (ps) => ps.filter((p) => p.offsetParent).length)) === 3 &&
    (await page.locator('[data-row]').first().isVisible()));
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n✗ ${failed} test(s) mislukt` : '\n✓ Alle browsertests geslaagd');
process.exit(failed ? 1 : 0);
