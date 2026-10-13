// Packages the theme as an uploadable Shopify theme ZIP and exports the page texts for Shopify admin.
// Usage: npm run package  →  dist/volkara-theme.zip + dist/shopify-setup/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, menus, collections } from './preview/mock/catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const setup = path.join(dist, 'shopify-setup');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(setup, 'pages'), { recursive: true });

// 1. Theme ZIP: only the folders Shopify accepts.
const dirs = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
execFileSync('zip', ['-qr', path.join(dist, 'volkara-theme.zip'), ...dirs, '-x', '*.DS_Store'], { cwd: root });

// 2. Page bodies to paste into Online Store → Pages (HTML editor), with the template to choose.
const rows = ['| Pagina | Handle (URL) | Sjabloon | Bestand met tekst |', '|---|---|---|---|'];
for (const p of pages) {
  const file = `pages/${p.handle}.html`;
  if (p.content) fs.writeFileSync(path.join(setup, file), p.content.replace(/></g, '>\n<') + '\n');
  rows.push(`| ${p.title} | \`${p.handle}\` | ${p.template_suffix ? `page.${p.template_suffix}` : 'page (standaard)'} | ${p.content ? `\`${file}\`` : '— (inhoud komt uit het sjabloon)'} |`);
}
// 3. Menus and collections to recreate in Shopify admin.
const menu = (items, depth = 0) => items.map((l) => `${'  '.repeat(depth)}- ${l.title} → \`${l.url}\`\n${l.links?.length ? menu(l.links, depth + 1) : ''}`).join('');
const md = [
  '# Shopify-instellingen om over te nemen', '',
  '## Pagina\'s (Online Store → Pagina\'s)', '', ...rows, '',
  '## Menu\'s (Online Store → Navigatie)', '',
  ...Object.entries(menus).flatMap(([h, items]) => [`### \`${h}\``, '', menu(items)]),
  '## Collecties (Producten → Collecties)', '',
  '| Titel | Handle | Voorwaarde (automatisch) |', '|---|---|---|',
  ...collections.filter((c) => c.handle !== 'all').map((c) => `| ${c.title} | \`${c.handle}\` | Producttag is gelijk aan \`${c.handle}\` |`), '',
];
fs.writeFileSync(path.join(setup, 'README.md'), md.join('\n'));
fs.copyFileSync(path.join(root, 'data/products-import.csv'), path.join(setup, 'products-import.csv'));
for (const doc of ['11-shopify-installatie.md', '09-claims-controle.md']) fs.copyFileSync(path.join(root, 'docs', doc), path.join(setup, doc));
const size = fs.statSync(path.join(dist, 'volkara-theme.zip')).size;
console.log(`dist/volkara-theme.zip (${(size / 1024 / 1024).toFixed(1)} MB) + dist/shopify-setup/`);
