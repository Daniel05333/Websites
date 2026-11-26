// Bouwt één zelfstandig HTML-bestand van de homepage (CSS, JS, fonts en foto's ingebed).
// Gebruik: npm run preview
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const types = { webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2' };
const data = async (file) => `data:${types[file.split('.').pop()]};base64,${(await readFile(file)).toString('base64')}`;

let html = await readFile('public/index.html', 'utf8');
html = html.replace(/<link rel="preload"[^>]*>\n?/g, '');
for (const [m, name] of [...html.matchAll(/<link rel="stylesheet" href="\/assets\/css\/([\w-]+)\.css">/g)]) {
  let css = await readFile(`assets/css/${name}.css`, 'utf8');
  for (const [u, path] of [...css.matchAll(/url\('\.\.\/((?:fonts|img)\/[^']+)'\)/g)]) css = css.replaceAll(u, `url('${await data(`assets/${path}`)}')`);
  html = html.replace(m, () => `<style>${css}</style>`);
}
const js = [];
for (const [m, name] of [...html.matchAll(/<script src="\/assets\/js\/([\w-]+)\.js" defer><\/script>\n?/g)]) { js.push(await readFile(`assets/js/${name}.js`, 'utf8')); html = html.replace(m, ''); }
html = html.replace('</body>', () => `${js.map((s) => `<script>${s}</script>`).join('\n')}\n</body>`);
for (const m of new Set([...html.matchAll(/\/assets\/[\w/.-]+\.(?:webp|png|svg)/g)].map((x) => x[0]))) html = html.replaceAll(m, await data(m.slice(1)));
await mkdir('voorbeeld', { recursive: true });
await writeFile('voorbeeld/index.html', html);
console.log(`voorbeeld/index.html · ${(html.length / 1024 / 1024).toFixed(1)} MB`);
