#!/usr/bin/env node
// Deep-merges tools/locale-fragments/<owner>.<locale>.json into locales/<locale>(.default).json (nl is the default locale).
// Fragments win only for keys that don't exist yet; differing existing values are reported as conflicts
// (pass --force to let fragments overwrite). Idempotent.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fragDir = path.join(root, 'tools/locale-fragments');
const force = process.argv.includes('--force');
const localeFile = (loc) => path.join(root, 'locales', loc === 'nl' ? 'nl.default.json' : `${loc}.json`);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
let conflicts = 0;

function merge(target, src, trail, owner) {
  for (const [k, v] of Object.entries(src)) {
    const key = [...trail, k].join('.');
    if (isObj(v)) {
      if (target[k] !== undefined && !isObj(target[k])) { console.warn(`CONFLICT ${key}: string vs object (${owner})`); conflicts++; continue; }
      target[k] ??= {};
      merge(target[k], v, [...trail, k], owner);
    } else if (target[k] === undefined || force) {
      target[k] = v;
    } else if (JSON.stringify(target[k]) !== JSON.stringify(v)) {
      console.warn(`CONFLICT ${key}: "${target[k]}" kept, "${v}" from ${owner} ignored`); conflicts++;
    }
  }
}

const files = fs.existsSync(fragDir) ? fs.readdirSync(fragDir).filter((f) => f.endsWith('.json')).sort() : [];
const byLocale = {};
for (const f of files) {
  const m = f.match(/^(.+)\.([a-z]{2}(?:-[A-Z]{2})?)\.json$/);
  if (!m) { console.warn(`skip ${f} (expected <owner>.<locale>.json)`); continue; }
  (byLocale[m[2]] ??= []).push({ owner: m[1], file: path.join(fragDir, f) });
}
for (const [loc, frags] of Object.entries(byLocale)) {
  const target = localeFile(loc);
  const data = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : {};
  for (const { owner, file } of frags) {
    try { merge(data, JSON.parse(fs.readFileSync(file, 'utf8')), [], owner); }
    catch (e) { console.error(`INVALID JSON ${file}: ${e.message}`); conflicts++; }
  }
  fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
  console.log(`merged ${frags.length} fragment(s) into ${path.relative(root, target)}`);
}
if (conflicts) { console.warn(`${conflicts} conflict(s)`); process.exitCode = 1; }
