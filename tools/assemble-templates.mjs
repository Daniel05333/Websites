#!/usr/bin/env node
// Builds templates/<name>.json from tools/template-fragments/<name>/<NN>-<key>.json (sorted by NN).
// A fragment is {"type": "...", "settings": {}, "blocks": {}, "block_order": []}; optional top-level
// "_template" in tools/template-fragments/<name>/_template.json supplies extra keys (e.g. "layout", "wrapper").
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fragRoot = path.join(root, 'tools/template-fragments');
const only = process.argv.slice(2);
const header = '/*\n * ------------------------------------------------------------\n * VOLKARA template — assembled by tools/assemble-templates.mjs.\n * Edit in the theme editor or in tools/template-fragments/.\n * ------------------------------------------------------------\n */\n';

for (const name of fs.readdirSync(fragRoot).sort()) {
  const dir = path.join(fragRoot, name);
  if (!fs.statSync(dir).isDirectory() || (only.length && !only.includes(name))) continue;
  const extra = fs.existsSync(path.join(dir, '_template.json')) ? JSON.parse(fs.readFileSync(path.join(dir, '_template.json'), 'utf8')) : {};
  const sections = {}; const order = [];
  for (const f of fs.readdirSync(dir).filter((f) => /^\d+-.+\.json$/.test(f)).sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b))) {
    const key = f.replace(/^\d+-/, '').replace(/\.json$/, '');
    let frag;
    try { frag = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { console.error(`INVALID JSON ${name}/${f}: ${e.message}`); process.exitCode = 1; continue; }
    if (sections[key]) { console.error(`DUPLICATE key ${key} in ${name}`); process.exitCode = 1; continue; }
    if (frag.blocks && !frag.block_order) frag.block_order = Object.keys(frag.blocks);
    sections[key] = frag; order.push(key);
  }
  const out = path.join(root, 'templates', name.replace(/__/g, '/') + '.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, header + JSON.stringify({ ...extra, sections, order }, null, 2) + '\n');
  console.log(`templates/${path.relative(path.join(root, 'templates'), out)}: ${order.join(', ')}`);
}
