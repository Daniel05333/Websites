// Bouwt één zelfstandig HTML-bestand met alle pagina's (deelbare voorbeeldweergave).
// Pagina's wisselen via #home, #maatwerk-website, ...; CSS, JS, fonts en de 3D-module zijn ingebed.
// Gebruik: node tools/build-preview.mjs <uitvoerbestand>
import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { pages } from '../src/pages/pages.mjs';

const out = process.argv[2] ?? 'preview.html';
const keyOf = (path) =>
  path === '/' ? 'home' : path === '/website-laten-maken.html' ? 'diensten' : path.replace(/^\/|\/$|\.html$/g, '');

const views = [];
const known = new Set(pages.filter((p) => p.sitemap).map((p) => p.sitemap.path));
const rewrite = (html) =>
  html.replace(/href="(\/[^"]*)"/g, (m, url) => {
    const u = new URL(url, 'http://x');
    if (!known.has(u.pathname)) return m;
    const key = keyOf(u.pathname);
    const project = u.searchParams.get('project');
    const anchor = u.hash.slice(1);
    return `href="#${anchor || key}" data-page="${key}"${anchor ? ` data-anchor="${anchor}"` : ''}${project ? ` data-project="${project}"` : ''}`;
  });

let shell;
for (const p of pages) {
  if (!p.sitemap) continue;
  const html = p.render();
  const key = keyOf(p.sitemap.path);
  views.push({
    key,
    title: html.match(/<title>(.*?)<\/title>/)[1],
    dark: html.includes('site-header--on-dark'),
    main: rewrite(html.match(/<main id="main" tabindex="-1">([\s\S]*)<\/main>/)[1]),
  });
  if (key === 'home') shell = rewrite(html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<main[\s\S]*<\/main>/, '<main id="main" tabindex="-1"></main>'));
}

// Fonts als data-URI; 3D-module als klassiek script met een globale naam (geen losse import nodig).
let css = await readFile('assets/css/main.css', 'utf8');
for (const [m, file] of [...css.matchAll(/url\('\.\.\/fonts\/([^']+)'\)/g)])
  css = css.replace(m, `url(data:font/woff2;base64,${(await readFile('assets/fonts/' + file)).toString('base64')})`);
const engine = (await build({ entryPoints: ['src/engine/engine.js'], bundle: true, format: 'iife', globalName: 'NexdEngine', minify: true, target: 'es2020', write: false, legalComments: 'inline' })).outputFiles[0].text;
const js = await readFile('assets/js/main.js', 'utf8');
const inline = (code) => code.replace(/<\/script/gi, '<\\/script');

const router = `
(() => {
  const views = Object.fromEntries([...document.querySelectorAll('template[data-view]')].map((t) => [t.dataset.view, t]));
  const main = document.getElementById('main');
  const header = document.querySelector('[data-header]');
  let current = null;
  const show = (key, anchor, project) => {
    if (!views[key]) key = 'home';
    if (key !== current) {
      const t = views[key];
      main.replaceChildren(t.content.cloneNode(true));
      document.title = t.dataset.title;
      header.classList.toggle('site-header--on-dark', t.dataset.dark === 'true');
      document.querySelectorAll('.main-nav a, .mobile-menu__list a').forEach((a) =>
        a.dataset.page === key && !a.dataset.anchor ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
      current = key;
      window.nexdInitPage(main);
    }
    if (project) { const s = main.querySelector('#project'); if (s) s.value = project; }
    const target = anchor && document.getElementById(anchor);
    target ? target.scrollIntoView() : window.scrollTo(0, 0);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-page]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    show(a.dataset.page, a.dataset.anchor, a.dataset.project);
    history.replaceState(null, '', a.getAttribute('href'));
  });
  const h = location.hash.slice(1);
  if (views[h]) show(h);
  else show('home', h && document.getElementById(h) ? h : null);
})();`;

const page = `<title>NEXD Media Website</title>
<meta name="description" content="Ontwerpvoorbeeld van de nieuwe website van NEXD Media.">
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css}
/* Voorbeeldweergave: alles direct zichtbaar, rekening houden met de veilige zones van telefoons. */
:root { color-scheme: light; }
body { background: var(--paper); color: var(--text); font-size: clamp(1rem, 0.95rem + 0.2vw, 1.0625rem); }
body::before { content: ''; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 60; background: var(--ink); }
.js .reveal { opacity: 1 !important; transform: none !important; }
.site-header { top: env(safe-area-inset-top, 0px); }
.container { padding-left: max(var(--gutter), env(safe-area-inset-left, 0px)); padding-right: max(var(--gutter), env(safe-area-inset-right, 0px)); }
.sticky-cta { bottom: calc(12px + env(safe-area-inset-bottom, 0px)); }
.preview-note { color: var(--signal); }
</style>
${shell
  .replace('<a class="skip-link" href="#main">', '<a class="skip-link" href="#main" onclick="event.preventDefault();document.getElementById(\'main\').focus()">')
  .replace(/(<div class="site-footer__bottom">\s*<p>)/, '$1<span class="preview-note">Ontwerpvoorbeeld · nog niet live · prijzen en cases onder voorbehoud</span><br>')}
${views.map((v) => `<template data-view="${v.key}" data-title="${v.title}" data-dark="${v.dark}">${v.main}</template>`).join('\n')}
<script>document.documentElement.classList.add('js')</script>
<script>${inline(engine)}</script>
<script>${inline(js)}</script>
<script>${router}</script>
`;
await writeFile(out, page);
console.log(`${out}: ${views.length} pagina's, ${(page.length / 1024).toFixed(0)} kB`);
