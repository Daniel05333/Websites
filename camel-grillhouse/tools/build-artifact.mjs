// Bouwt een artifact-versie van de site (homepage + menukaart + privacy) in ./artifact
// met relatieve paden. Gebruik: npm run build && node tools/build-artifact.mjs
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';

const OUT = 'artifact/';
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp('public/assets', `${OUT}assets`, { recursive: true });

const fix = (html, main) => html
  .replace(/(^|[\s"'(,])\/assets\//g, '$1assets/')
  .replace(/href="\/menukaart\/(#[^"]*)?"/g, (_, h = '') => `href="menukaart.html${h}"`)
  .replace(/href="\/privacy\/"/g, 'href="privacy.html"')
  .replace(/href="\/#/g, main ? 'href="#' : 'href="index.html#')
  .replace(/href="\/"/g, main ? 'href="#top"' : 'href="index.html"');

// Hoofdpagina: het artifact levert zelf doctype/head/body, dus die halen we eruit.
let home = fix(await readFile('public/index.html', 'utf8'), true)
  .replace(/^<!doctype html>\s*<html[^>]*>\s*<head>\s*/i, '')
  .replace(/<\/head>\s*<body class="home">/, `<script>document.body.classList.add('home'); document.body.id = 'top';</script>`)
  .replace(/<\/body>\s*<\/html>\s*$/, '');
// In de conceptbalk: links naar het ontwerpbord en het ontwerpvoorstel.
home = home.replace('Zie docs/rapportage.md.', 'Bekijk ook de <a href="https://claude.ai/artifact/CmuASXLvahWNDTGst4Axtq" target="_blank" rel="noopener">ontwerpen</a> en het <a href="https://claude.ai/artifact/T5iWySvcfL7puZuizB4xhk" target="_blank" rel="noopener">ontwerpvoorstel</a>.');
// <title> vooraan zodat het artifact de juiste naam krijgt.
const title = home.match(/<title>.*?<\/title>/)[0];
home = home.replace(title, '').replace(/^/, `${title.replace(/<title>.*<\/title>/, '<title>Camel Grill House</title>')}\n`);
await writeFile(`${OUT}index.html`, home);

for (const [src, dst] of [['public/menukaart/index.html', 'menukaart.html'], ['public/privacy/index.html', 'privacy.html']])
  await writeFile(OUT + dst, fix(await readFile(src, 'utf8'), false));

const files = [];
const walk = async (d) => { for (const e of await readdir(d, { withFileTypes: true })) { const p = `${d}/${e.name}`; e.isDirectory() ? await walk(p) : files.push(p.slice(OUT.length)); } };
await walk(OUT.slice(0, -1));
await writeFile('artifact.files.json', JSON.stringify(files.filter((f) => f !== 'index.html')));
console.log(`${files.length} bestanden in ${OUT}`);
