// Bouwt één zelfstandig HTML-bestand van de homepage (CSS, JS, fonts ingebed).
// Gebruik: node build.mjs && node tools/build-preview.mjs voorbeeld/index.html
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const out = process.argv[2] ?? 'voorbeeld/index.html';
const b64 = async (f) => (await readFile(f)).toString('base64');

let html = await readFile('public/index.html', 'utf8');
let css = await readFile('assets/css/main.css', 'utf8');
for (const [m, file] of [...css.matchAll(/url\('\.\.\/fonts\/([^']+)'\)/g)])
  css = css.replace(m, `url(data:font/woff2;base64,${await b64('assets/fonts/' + file)})`);
const main = await readFile('assets/js/main.js', 'utf8');
const silk = await readFile('assets/js/silk.js', 'utf8');
const icon = await b64('assets/favicon.svg');

html = html
  .replace(/<link rel="preload"[^>]*>\n?/g, '')
  .replace('<link rel="stylesheet" href="/assets/css/main.css">', () => `<style>${css}</style>`)
  .replace('<script src="/assets/js/main.js" defer></script>', '')
  .replace('<script src="/assets/js/silk.js" type="module"></script>', '')
  .replace('href="/assets/favicon.svg"', `href="data:image/svg+xml;base64,${icon}"`)
  .replace(/href="\/#/g, 'href="#')
  .replace(/href="\/"/g, 'href="#top"')
  .replace(/<li><a href="\/privacy\/">Privacy<\/a><\/li>/, '')
  .replace('</body>', () => `<script>${main}</script>\n<script type="module">${silk}</script>\n</body>`);

await mkdir(dirname(out), { recursive: true });
await writeFile(out, html);
console.log(`${out} · ${(html.length / 1024).toFixed(0)} KB`);
