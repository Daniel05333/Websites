// Bouwt één zelfstandig HTML-bestand van de homepage (CSS, JS, fonts en foto's ingebed).
// Gebruik: node build.mjs && node tools/build-preview.mjs voorbeeld/index.html
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const out = process.argv[2] ?? 'voorbeeld/index.html';
const types = { svg: "image/svg+xml", webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2' };
const data = async (file) => `data:${types[file.split('.').pop()]};base64,${(await readFile(file)).toString('base64')}`;

let css = await readFile('assets/css/main.css', 'utf8');
for (const [m, path] of [...css.matchAll(/url\('\.\.\/((?:fonts|img)\/[^']+)'\)/g)])
  css = css.replaceAll(m, `url('${await data(`assets/${path}`)}')`);
const js = await readFile('assets/js/main.js', 'utf8');

let html = (await readFile('public/index.html', 'utf8'))
  .replace(/<link rel="preload"[^>]*>\n?/g, '')
  .replace('<link rel="stylesheet" href="/assets/css/main.css">', () => `<style>${css}</style>`)
  .replace('<script src="/assets/js/main.js" defer></script>', '')
  .replace(/href="\/#/g, 'href="#')
  .replace(/href="\/(privacy\/)?"/g, 'href="#top"')
  .replace('</body>', () => `<script>${js}</script>\n</body>`);
for (const m of new Set([...html.matchAll(/\/assets\/[\w/.-]+\.(?:webp|png|svg)/g)].map((x) => x[0])))
  html = html.replaceAll(m, await data(m.slice(1)));

await mkdir(dirname(out), { recursive: true });
await writeFile(out, html);
console.log(`${out} · ${(html.length / 1024 / 1024).toFixed(1)} MB`);
