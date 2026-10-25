// Bouwt één zelfstandig HTML-bestand van de homepage (CSS, JS, fonts en foto's ingebed).
// Gebruik: npm run preview  →  voorbeeld/index.html
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const out = process.argv[2] ?? 'voorbeeld/index.html';
const b64 = async (f) => (await readFile(f)).toString('base64');

let html = await readFile('public/index.html', 'utf8');
let css = await readFile('assets/css/main.css', 'utf8');
for (const [m, file] of [...css.matchAll(/url\('\.\.\/fonts\/([^']+)'\)/g)])
  css = css.replace(m, `url(data:font/woff2;base64,${await b64('assets/fonts/' + file)})`);
const main = await readFile('assets/js/main.js', 'utf8');
const flame = await readFile('assets/js/flame.js', 'utf8');

// Foto's: alleen de 800w-WebP inbedden (houdt het bestand hanteerbaar).
const cache = {};
const img = async (name) => (cache[name] ??= `data:image/webp;base64,${await b64(`assets/img/${name}-800.webp`)}`);
for (const m of [...html.matchAll(/<source type="image\/avif"[^>]*>\n?/g)]) html = html.replace(m[0], '');
for (const m of [...html.matchAll(/srcset="(\/assets\/img\/([a-z-]+)-\d+\.webp[^"]*)"/g)]) html = html.replace(m[0], `srcset="${await img(m[2])}"`);
for (const m of [...html.matchAll(/src="\/assets\/img\/([a-z-]+)-\d+\.webp"/g)]) html = html.replace(m[0], `src="${await img(m[1])}"`);
for (const m of [...html.matchAll(/"src":"\/assets\/img\/([a-z-]+)-\d+\.webp"/g)]) html = html.replace(m[0], `"src":"${await img(m[1])}"`);

html = html
  .replace(/<link rel="preload"[^>]*>\n?/g, '')
  .replace('<link rel="stylesheet" href="/assets/css/main.css">', () => `<style>${css}</style>`)
  .replace('<script src="/assets/js/main.js" defer></script>', '')
  .replace('<script src="/assets/js/flame.js" defer></script>', '')
  .replace('href="/assets/favicon.svg"', `href="data:image/svg+xml;base64,${await b64('assets/favicon.svg')}"`)
  .replace(/href="\/#/g, 'href="#')
  .replace(/href="\/"/g, 'href="#top"')
  .replace('<body class="home">', '<body class="home" id="top">')
  .replace('</body>', () => `<script>${main}</script>\n<script>${flame}</script>\n</body>`);

await mkdir(dirname(out), { recursive: true });
await writeFile(out, html);
console.log(`${out} · ${(html.length / 1024).toFixed(0)} KB`);
