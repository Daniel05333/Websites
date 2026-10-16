// Statische controles op ./public: interne links, metadata, headings, alt-teksten, JSON-LD.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = 'public';
const files = [];
const walk = async (d) => {
  for (const f of await readdir(d)) {
    const p = join(d, f);
    if ((await stat(p)).isDirectory()) await walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
};
await walk(root);

const exists = async (p) => stat(p).then(() => true, () => false);
const errors = [];
const titles = new Map();
const descs = new Map();

for (const f of files) {
  const html = await readFile(f, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="(.*?)"/)?.[1];
  if (!title) errors.push(`${f}: geen <title>`);
  if (!desc) errors.push(`${f}: geen meta description`);
  if (desc && !html.includes('noindex') && (desc.length < 70 || desc.length > 170)) errors.push(`${f}: description ${desc.length} tekens`);
  if (titles.has(title)) errors.push(`${f}: dubbele title met ${titles.get(title)}`);
  if (descs.has(desc)) errors.push(`${f}: dubbele description met ${descs.get(desc)}`);
  titles.set(title, f); descs.set(desc, f);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) errors.push(`${f}: ${h1} h1-elementen`);
  if (html.includes('__V__')) errors.push(`${f}: versie-placeholder niet vervangen`);
  if (!/<html lang="nl">/.test(html)) errors.push(`${f}: lang ontbreekt`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) errors.push(`${f}: img zonder alt`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(m[1]); } catch { errors.push(`${f}: ongeldige JSON-LD`); }
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) errors.push(`${f}: dubbele id's ${[...new Set(dup)].join(', ')}`);
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    const url = new URL(m[1], 'http://x');
    let p = join(root, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) p = join(p, 'index.html');
    if (!(await exists(p))) errors.push(`${f}: kapotte link ${m[1]}`);
    if (url.hash && url.pathname === '/') {
      const target = await readFile(join(root, 'index.html'), 'utf8');
      if (!target.includes(`id="${url.hash.slice(1)}"`)) errors.push(`${f}: anker ${m[1]} bestaat niet`);
    }
  }
}
for (const extra of ['sitemap.xml', 'robots.txt', 'assets/img/og-image.png', 'assets/img/favicon.svg', 'assets/img/apple-touch-icon.png'])
  if (!(await exists(join(root, extra)))) errors.push(`ontbreekt: ${extra}`);

if (errors.length) {
  console.error('✗ Statische controle:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ Statische controle: ${files.length} pagina's, interne links, metadata, headings, JSON-LD en id's in orde`);
