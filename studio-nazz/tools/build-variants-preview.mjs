// Maakt losse HTML-bestanden van de varianten (CSS, JS, fonts en foto's ingebed)
// in voorbeeld/varianten/. De bestanden linken naar elkaar, dus houd ze samen
// in één map. Gebruik: npm run variants
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const types = { webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2' };
const cache = new Map();
const data = async (file) => {
  if (!cache.has(file)) cache.set(file, `data:${types[file.split('.').pop()]};base64,${(await readFile(file)).toString('base64')}`);
  return cache.get(file);
};
const css = async (name) => {
  let s = await readFile(`assets/css/${name}.css`, 'utf8');
  for (const [m, path] of [...s.matchAll(/url\('\.\.\/((?:fonts|img)\/[^']+)'\)/g)]) s = s.replaceAll(m, `url('${await data(`assets/${path}`)}')`);
  return s;
};

await mkdir('voorbeeld/varianten', { recursive: true });
for (const page of ['index', 'noir', 'blush', 'atelier', 'dashboard']) {
  let html = await readFile(`public/varianten/${page}.html`, 'utf8');
  for (const [m, name] of [...html.matchAll(/<link rel="stylesheet" href="\/assets\/css\/([\w-]+)\.css">/g)]) {
    const inline = await css(name);
    html = html.replace(m, () => `<style>${inline}</style>`);
  }
  html = html.replace(/<link rel="preload"[^>]*>\n?/g, '');
  const scripts = [];
  for (const [m, name] of [...html.matchAll(/<script src="\/assets\/js\/([\w-]+)\.js" defer><\/script>\n?/g)]) {
    scripts.push(await readFile(`assets/js/${name}.js`, 'utf8'));
    html = html.replace(m, '');
  }
  html = html.replace('</body>', () => `${scripts.map((s) => `<script>${s}</script>`).join('\n')}\n</body>`);
  for (const m of new Set([...html.matchAll(/\/assets\/[\w/.-]+\.(?:webp|png|svg)/g)].map((x) => x[0]))) html = html.replaceAll(m, await data(m.slice(1)));
  await writeFile(`voorbeeld/varianten/${page}.html`, html);
  console.log(`voorbeeld/varianten/${page}.html · ${(html.length / 1024 / 1024).toFixed(1)} MB`);
}
