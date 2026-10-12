#!/usr/bin/env node
// Runs Shopify Theme Check (same engine as `shopify theme check`) against the theme root.
// Usage: npm run check [-- <path-substring> ...]   (filters output to matching files)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { check } from '@shopify/theme-check-node';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const filters = process.argv.slice(2);
const SEVERITY = ['error', 'warning', 'info'];

const offenses = await check(root, path.join(root, '.theme-check.yml'));
const rel = (uri) => path.relative(root, fileURLToPath(uri));
const shown = offenses.filter((o) => !filters.length || filters.some((f) => rel(o.uri).includes(f)));

const byFile = new Map();
for (const o of shown) {
  const f = rel(o.uri);
  if (!byFile.has(f)) byFile.set(f, []);
  byFile.get(f).push(o);
}
for (const [file, list] of [...byFile].sort()) {
  console.log(`\n${file}`);
  for (const o of list.sort((a, b) => (a.start?.line ?? 0) - (b.start?.line ?? 0))) {
    console.log(`  ${String((o.start?.line ?? 0) + 1).padStart(4)}  ${SEVERITY[o.severity] ?? o.severity}  [${o.check}] ${o.message}`);
  }
}
const counts = SEVERITY.map((s, i) => `${shown.filter((o) => o.severity === i).length} ${s}s`).join(', ');
console.log(`\nTheme Check: ${counts} across ${byFile.size} file(s).`);
process.exit(shown.some((o) => o.severity === 0) ? 1 : 0);
