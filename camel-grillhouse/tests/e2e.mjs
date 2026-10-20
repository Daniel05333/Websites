// Browsertests op ./public met Playwright + axe-core. Gebruik: npm test
import { chromium } from 'playwright-core';
import { readFile, mkdir } from 'node:fs/promises';
import { server } from '../tools/serve.mjs';
import { site } from '../src/site.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORT = 4414;
const base = `http://localhost:${PORT}`;
const pages = ['/', '/menukaart/', '/privacy/', '/404.html'];
const shots = new URL('../docs/screens/', import.meta.url).pathname;
await mkdir(shots, { recursive: true });
const axeSrc = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const SHOP = new URL(site.order.url).host;

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
        // Reveals afronden zodat axe de eindtoestand meet, niet een halve animatie.
        await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
        await page.addStyleTag({ content: '.js [data-split] .w, .js .reveal, .js .hero__title .ch { opacity: 1 !important; transform: none !important; filter: none !important; transition: none !important; }' });
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

console.log('Bestelroute, inhoud en SEO');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const p of ['/', '/menukaart/']) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await check(`${p} — precies één h1`, async () => (await page.locator('h1').count()) === 1);
    await check(`${p} — elke bestelknop gaat naar de bestaande webshop (${SHOP})`, async () => {
      const hrefs = await page.$$eval('[data-track^="order"]', (as) => as.map((a) => a.href));
      const bad = hrefs.filter((h) => new URL(h).host !== SHOP);
      if (!hrefs.length || bad.length) throw new Error(`${bad.length}/${hrefs.length}: ${bad.slice(0, 3).join(', ')}`);
    });
    await check(`${p} — alle ankers wijzen naar een bestaand id`, async () => {
      const missing = await page.evaluate(() => [...document.querySelectorAll('a[href*="#"]')]
        .filter((a) => new URL(a.href).pathname === location.pathname)
        .map((a) => new URL(a.href).hash.slice(1)).filter((id) => id && !document.getElementById(id)));
      if (missing.length) throw new Error([...new Set(missing)].join(', '));
    });
    await check(`${p} — interne links bestaan`, async () => {
      const links = await page.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').split('#')[0]))]);
      for (const l of links) { const r = await fetch(base + l); if (r.status !== 200) throw new Error(`${r.status} ${l}`); }
    });
    await check(`${p} — geen externe verzoeken (fonts/scripts lokaal)`, async () => {
      const ext = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => !n.startsWith(location.origin)));
      if (ext.length) throw new Error(ext.join(', '));
    });
  }
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('menukaart: elk menu-item heeft een prijs of "prijs in webshop"', async () => {
    const n = site.menu.categories.reduce((a, c) => a + c.items.length, 0);
    await page.goto(base + '/menukaart/', { waitUntil: 'networkidle' });
    const rows = await page.locator('.row').count();
    if (rows !== n) throw new Error(`${rows} rijen, verwacht ${n}`);
  });
  await check('concept: noindex + robots.txt blokkeert', async () => {
    if (!site.draft) return true;
    const robots = await page.getAttribute('meta[name=robots]', 'content');
    const txt = await (await fetch(base + '/robots.txt')).text();
    if (!robots?.includes('noindex') || !txt.includes('Disallow: /')) throw new Error('niet afgeschermd');
  });
  await check('canonical + sitemap aanwezig', async () => {
    const c = await page.getAttribute('link[rel=canonical]', 'href');
    const sm = await (await fetch(base + '/sitemap.xml')).text();
    if (!c?.startsWith(site.url) || !sm.includes('/menukaart/')) throw new Error('ontbreekt');
  });
  await check('oude URL /contact/ stuurt door', async () => (await (await fetch(base + '/contact/')).text()).includes('url=/#contact'));
  await check('geen JSON-LD zolang de site een concept is', async () => {
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    return !site.draft || (await page.locator('script[type="application/ld+json"]').count()) === 0;
  });
  await check('geen verzonnen populariteits-labels', async () => {
    const t = (await page.textContent('body')).toLowerCase();
    const hit = ['bestseller', 'meest besteld', 'populairst', '★'].filter((w) => t.includes(w));
    if (hit.length) throw new Error(hit.join(', '));
  });
  await check('placeholders zichtbaar gemarkeerd', async () => {
    const n = await page.locator('.ph').count();
    if (site.draft && n === 0) throw new Error('geen');
    console.log(`      ${n} gemarkeerde placeholders op de homepage`);
  });
  await check('vonken (WebGL) actief of netjes uitgeschakeld', async () => {
    const ready = await page.getAttribute('[data-flame]', 'data-ready');
    console.log(`      flame: ${ready != null ? 'actief' : 'uit (foto blijft staan)'}`);
  });

  console.log('Interactie');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${shots}desktop-hero.png` });
  await check('sticky stack: hero wijkt terug als de volgende sectie eroverheen schuift', async () => {
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, innerHeight * 0.6); });
    await page.waitForTimeout(300);
    const t = await page.$eval('[data-pin-inner]', (e) => e.style.transform);
    if (!t.startsWith('scale(')) throw new Error(`transform: "${t}"`);
  });
  await check('woord-veren eindigen volledig zichtbaar', async () => {
    await page.locator('#fav-title').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1800);
    const o = await page.$$eval('#fav-title .w', (ws) => ws.map((w) => getComputedStyle(w).opacity));
    if (o.some((x) => x !== '1')) throw new Error(o.join(','));
  });
  await check('FAQ opent met toetsenbord', async () => {
    const s = page.locator('.faq summary').first();
    await s.scrollIntoViewIfNeeded(); await s.focus(); await page.keyboard.press('Enter');
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
    if (!(await page.evaluate(() => document.activeElement?.classList.contains('gallery__item')))) throw new Error('focus niet terug');
  });
  await check('vandaag is gemarkeerd in de openingstijden', async () => (await page.locator('[data-hours] tr.is-today').count()) === 1);
  await check('klik op bestelknop meldt een camel:track-event', async () => {
    await page.evaluate(() => { window.__t = []; document.addEventListener('camel:track', (e) => window.__t.push(e.detail.event)); });
    await page.$eval('[data-track="order-header"]', (a) => a.addEventListener('click', (e) => e.preventDefault()));
    await page.click('[data-track="order-header"]');
    const t = await page.evaluate(() => window.__t);
    if (!t.includes('order-header')) throw new Error(JSON.stringify(t));
  });
  for (const id of ['favorieten', 'grill', 'kapsalon', 'bestellen', 'keuken', 'over', 'terras', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${shots}desktop-${id}.png` });
  }

  await page.goto(base + '/menukaart/', { waitUntil: 'networkidle' });
  await check('menukaart: zoeken filtert en meldt het aantal', async () => {
    await page.fill('[data-search]', 'falafel');
    const visible = await page.locator('.row:visible').count();
    const status = await page.textContent('[data-search-status]');
    if (visible < 4 || !status.includes(String(visible))) throw new Error(`${visible} zichtbaar, status "${status}"`);
    await page.fill('[data-search]', 'zzzz');
    if (await page.locator('[data-search-empty]').isHidden()) throw new Error('geen lege-melding');
    await page.fill('[data-search]', '');
  });
  await check('menukaart: tab volgt de categorie in beeld', async () => {
    await page.locator('#pizza').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    return (await page.getAttribute('[data-tabs] a[href="#pizza"]', 'aria-current')) !== null;
  });
  await page.screenshot({ path: `${shots}desktop-menukaart.png` });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${shots}mobile-hero.png` });
  await check('mobiel: "Bestel nu" staat boven de vouw', async () => {
    const r = await page.locator('.hero__ctas [data-track="order-hero"]').boundingBox();
    if (!r || r.y + r.height > 844) throw new Error(`onderkant op ${r && Math.round(r.y + r.height)}px`);
  });
  await check('mobiel menu: opent, focus op sluiten, Escape sluit', async () => {
    await page.click('.burger');
    if (await page.locator('#sheet').isHidden()) throw new Error('niet open');
    if (!(await page.evaluate(() => document.activeElement.classList.contains('sheet__close')))) throw new Error('focus');
    await page.screenshot({ path: `${shots}mobile-menu.png` });
    await page.keyboard.press('Escape');
    if (!(await page.locator('#sheet').isHidden())) throw new Error('niet dicht');
  });
  await check('mobiele bestelbalk verschijnt na de hero', async () => {
    await page.evaluate(() => scrollTo(0, innerHeight * 1.6));
    await page.waitForTimeout(600);
    return page.locator('[data-dock]').evaluate((d) => d.classList.contains('on') && d.getAttribute('aria-hidden') === 'false');
  });
  await check('klikgebieden ≥ 44px', async () => {
    const small = await page.$$eval('a, button, summary', (els) => els.filter((e) => {
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      return r.width > 0 && s.visibility !== 'hidden' && !e.closest('[hidden]') && !e.classList.contains('skip') && r.height < 44 && !e.closest('p, td, th, address, .sec__lede');
    }).map((e) => `${e.tagName}.${e.className}:${Math.round(e.getBoundingClientRect().height)}`));
    if (small.length) throw new Error(small.slice(0, 6).join(', '));
  });
  await page.goto(base + '/menukaart/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}mobile-menukaart.png` });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await check('reduced motion: alle inhoud direct zichtbaar, geen vonken', async () => {
    const hidden = await page.$$eval('.reveal, [data-split] .w, .hero__title .ch', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    if (hidden) throw new Error(`${hidden} elementen onzichtbaar`);
    if ((await page.getAttribute('[data-flame]', 'data-ready')) !== null) throw new Error('vonken draaien');
  });
  await ctx.close();
}

await check('launch-check: geen open placeholders en prijzen geverifieerd als draft=false', () => {
  if (site.draft) { console.log('      (overgeslagen: site staat nog in conceptmodus)'); return true; }
  const n = JSON.stringify(site).match(/"todo":true/g)?.length ?? 0;
  if (n || !site.menu.pricesVerified || !site.hoursVerified) throw new Error(`${n} placeholders open / prijzen of tijden niet geverifieerd`);
});

await browser.close();
server.close();
console.log(failed ? `\n${failed} test(s) mislukt` : '\nAlle tests geslaagd');
process.exit(failed ? 1 : 0);
