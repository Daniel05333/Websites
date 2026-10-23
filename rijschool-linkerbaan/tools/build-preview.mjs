// Bouwt één zelfstandig HTML-bestand met alle pagina's (voor een deelbare voorbeeldweergave).
// Pagina's wisselen via #home, #tarieven, ... ; CSS, JS en fonts zijn ingebed.
// Gebruik: node tools/build-preview.mjs <uitvoerbestand>
import { readFile, writeFile } from 'node:fs/promises';
import { pages } from '../src/pages/pages.mjs';

const out = process.argv[2] ?? 'preview.html';
const keyOf = { '/': 'home', '/tarieven/': 'tarieven', '/proefles/': 'proefles', '/over-rijschool-linkerbaan/': 'over-ons', '/contact/': 'contact', '/privacy/': 'privacy' };

const rewrite = (html) =>
  html.replace(/href="(\/[^"]*)"/g, (m, url) => {
    const u = new URL(url, 'http://x');
    const key = keyOf[u.pathname];
    if (!key) return m;
    const pkg = u.searchParams.get('pakket');
    const target = u.hash && key === 'home' ? `#${u.hash.slice(1)}` : `#${key}`;
    return `href="${target}" data-page="${key}"${pkg ? ` data-pakket="${pkg}"` : ''}`;
  });

const views = [];
let shell;
for (const p of pages) {
  if (!p.sitemap) continue;
  const html = p.render();
  const key = keyOf[p.sitemap.path];
  const main = html.match(/<main id="main" tabindex="-1">([\s\S]*)<\/main>/)[1];
  views.push({
    key,
    title: html.match(/<title>(.*?)<\/title>/)[1],
    bodyClass: html.match(/<body class="([^"]*)"/)[1],
    main: rewrite(main),
  });
  if (key === 'home') shell = rewrite(html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].replace(/<main[\s\S]*<\/main>/, '<main id="main" tabindex="-1"></main>'));
}

const b64 = async (f) => (await readFile(f)).toString('base64');
let css = await readFile('assets/css/main.css', 'utf8');
for (const [m, file] of [...css.matchAll(/url\('\.\.\/fonts\/([^']+)'\)/g)])
  css = css.replace(m, `url(data:font/woff2;base64,${await b64('assets/fonts/' + file)})`);
// Afbeeldingen inbedden als data-URI, zodat het voorbeeld één los bestand blijft.
const inlineImages = async (html) => {
  for (const src of new Set([...html.matchAll(/\/assets\/img\/[\w.-]+\.(?:webp|png)/g)].map((m) => m[0]))) {
    const type = src.endsWith('.png') ? 'image/png' : 'image/webp';
    html = html.replaceAll(src, `data:${type};base64,${await b64(src.slice(1))}`);
  }
  return html;
};
const js = await readFile('assets/js/main.js', 'utf8');

const router = `
(() => {
  const views = Object.fromEntries([...document.querySelectorAll('template[data-view]')].map((t) => [t.dataset.view, t]));
  const main = document.getElementById('main');
  const homeAnchors = new Set(${JSON.stringify(['werkgebied', 'veelgestelde-vragen', 'tarieven', 'proefles'])});
  let current = null;
  const show = (key, anchor, pakket) => {
    if (!views[key]) key = 'home';
    if (key !== current) {
      const t = views[key];
      main.replaceChildren(t.content.cloneNode(true));
      document.title = t.dataset.title;
      document.body.className = t.dataset.bodyClass;
      document.querySelectorAll('.main-nav a, .mobile-menu__list a').forEach((a) =>
        a.dataset.page === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
      current = key;
      window.linkerbaanInitPage(main);
    }
    if (pakket) { const s = main.querySelector('#pakket'); if (s) s.value = pakket; }
    const target = anchor && document.getElementById(anchor);
    target ? target.scrollIntoView() : window.scrollTo(0, 0);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-page]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const anchor = a.getAttribute('href').slice(1);
    const key = a.dataset.page;
    show(key, anchor !== key ? anchor : null, a.dataset.pakket);
    history.replaceState(null, '', '#' + (anchor || key));
  });
  const fromHash = () => {
    const h = location.hash.slice(1);
    if (views[h]) show(h);
    else if (homeAnchors.has(h)) show('home', h);
    else show('home');
  };
  fromHash();
})();`;

const home = views.find((v) => v.key === 'home');
const page = `<title>Rijschool Linkerbaan</title>
<meta name="description" content="Voorbeeldweergave van de nieuwe website van Rijschool Linkerbaan.">
<style>${css}
/* Voorbeeldweergave: direct compleet in beeld, header onder de veilige zone. */
.hero__copy > *, .hero__visual { animation: none !important; }
.site-header { top: env(safe-area-inset-top, 0px); }
.preview-bar { background: #fff6d6; color: #0f1b2d; font: 600 0.85rem/1.4 var(--font-body); text-align: center; padding: 0.55rem 16px; border-bottom: 1px solid #ecd98f; }
</style>
<div class="preview-bar">Ontwerpvoorbeeld · nog niet live · tarieven en voorwaarden onder voorbehoud</div>
${shell.replace('<a class="skip-link" href="#main">', '<a class="skip-link" href="#main" onclick="event.preventDefault();document.getElementById(\'main\').focus()">')}
${views.map((v) => `<template data-view="${v.key}" data-title="${v.title}" data-body-class="${v.bodyClass}">${v.main}</template>`).join('\n')}
<script>document.body.className = ${JSON.stringify(home.bodyClass)};</script>
<script>${js}</script>
<script>${router}</script>
`;
await writeFile(out, await inlineImages(page));
console.log(`${out}: ${views.length} pagina's`);
