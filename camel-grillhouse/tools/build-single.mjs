// Bouwt de hele site als één zelfstandig HTML-bestand: homepage + complete menukaart
// (als sectie #kaart), met CSS, JS, fonts en foto's ingebed.
// Gebruik: npm run build && node tools/build-single.mjs [uitvoer]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { site } from '../src/site.mjs';

const out = process.argv[2] ?? 'camel-website.html';
const b64 = async (f) => (await readFile(f)).toString('base64');
const ids = site.menu.categories.map((c) => c.id);

// 1. De menukaart als sectie, met eigen id's (kaart-…) zodat ze niet botsen met de homepage.
const menuPage = await readFile('public/menukaart/index.html', 'utf8');
let menu = menuPage.slice(menuPage.indexOf('<main id="main">') + 16, menuPage.indexOf('</main>'));
menu = menu.slice(0, menu.indexOf('<section class="final final--slim"'));
for (const id of ids) {
  menu = menu.replaceAll(`id="${id}"`, `id="kaart-${id}"`).replaceAll(`href="#${id}"`, `href="#kaart-${id}"`)
    .replaceAll(`id="h-${id}"`, `id="kaart-h-${id}"`).replaceAll(`aria-labelledby="h-${id}"`, `aria-labelledby="kaart-h-${id}"`);
}
menu = menu
  .replace('<section class="mhero">', '<section class="mhero" id="kaart" aria-labelledby="kaart-title">')
  .replace(/<p class="eyebrow"><a href="\/">Home<\/a> \/ Menukaart<\/p>/, '<p class="eyebrow">Alle gerechten en prijzen</p>')
  .replace('<h1 class="h1">Menukaart</h1>', '<h2 class="h1" id="kaart-title">Menukaart</h2>');

// 2. Homepage + menukaart vóór de veelgestelde vragen.
let html = await readFile('public/index.html', 'utf8');
html = html.replace('<section class="sec faq"', `${menu}\n<section class="sec faq"`);
html = html
  .replace(/href="\/menukaart\/#([a-z]+)"/g, 'href="#kaart-$1"')
  .replace(/href="\/menukaart\/"/g, 'href="#kaart"')
  .replace(/href="\/#/g, 'href="#')
  .replace(/href="\/"/g, 'href="#top"')
  .replace('<body class="home">', '<body class="home" id="top">');

// 3. CSS, fonts, scripts en favicon inbedden.
let css = await readFile('assets/css/main.css', 'utf8');
for (const [m, file] of [...css.matchAll(/url\('\.\.\/fonts\/([^']+)'\)/g)])
  css = css.replace(m, `url(data:font/woff2;base64,${await b64('assets/fonts/' + file)})`);
const main = await readFile('assets/js/main.js', 'utf8');
const flame = await readFile('assets/js/flame.js', 'utf8');
html = html
  .replace(/<link rel="preload"[^>]*>\n?/g, '')
  .replace('<link rel="stylesheet" href="/assets/css/main.css">', () => `<style>${css}</style>`)
  .replace('<script src="/assets/js/main.js" defer></script>', '')
  .replace('<script src="/assets/js/flame.js" defer></script>', '')
  .replace('href="/assets/favicon.svg"', `href="data:image/svg+xml;base64,${await b64('assets/favicon.svg')}"`)
  .replace('</body>', () => `<script>${main}</script>\n<script>${flame}</script>\n</body>`);

// 4. Foto's: één WebP (800 px breed) per foto, ingebed.
const cache = {};
const img = async (name) => (cache[name] ??= `data:image/webp;base64,${await b64(`assets/img/${name}-800.webp`)}`);
html = html.replace(/<source type="image\/avif"[^>]*>\n?/g, '');
for (const m of [...html.matchAll(/srcset="\/assets\/img\/([a-z-]+)-\d+\.webp[^"]*"/g)]) html = html.replace(m[0], `srcset="${await img(m[1])}"`);
for (const m of [...html.matchAll(/src="\/assets\/img\/([a-z-]+)-\d+\.webp"/g)]) html = html.replace(m[0], `src="${await img(m[1])}"`);
for (const m of [...html.matchAll(/"src":"\/assets\/img\/([a-z-]+)-\d+\.webp"/g)]) html = html.replace(m[0], `"src":"${await img(m[1])}"`);

const left = [...html.matchAll(/["'(\s,]\/assets\//g)].length;
if (left) console.warn(`Let op: nog ${left} verwijzing(en) naar /assets/`);
await mkdir(dirname(out) || '.', { recursive: true });
await writeFile(out, html);
console.log(`${out} · ${(html.length / 1024 / 1024).toFixed(1)} MB`);
