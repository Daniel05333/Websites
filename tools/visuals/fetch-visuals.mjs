#!/usr/bin/env node
// Downloads the Higgsfield visuals listed in higgsfield-manifest.json into assets/ as WebP
// (uses ffmpeg when available for PNG→WebP; otherwise saves the PNG next to it and tells you).
// Then turns on Theme settings → Visuals → "Use bundled VOLKARA visuals" in config/settings_data.json.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const { visuals } = JSON.parse(fs.readFileSync(path.join(here, 'higgsfield-manifest.json'), 'utf8'));
const hasFfmpeg = (() => { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
let ok = 0;
for (const v of visuals) {
  const res = await fetch(v.url);
  if (!res.ok) { console.error(`✗ ${v.asset}: HTTP ${res.status}`); continue; }
  const png = path.join(root, 'assets', v.asset.replace(/\.webp$/, '.png'));
  fs.writeFileSync(png, Buffer.from(await res.arrayBuffer()));
  if (hasFfmpeg) {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-c:v', 'libwebp', '-quality', '82', path.join(root, 'assets', v.asset)]);
    fs.unlinkSync(png);
    console.log(`✓ assets/${v.asset}`);
  } else {
    console.log(`✓ assets/${path.basename(png)} (install ffmpeg to convert to ${v.asset})`);
  }
  ok++;
}
const dataFile = path.join(root, 'config/settings_data.json');
if (ok === visuals.length && hasFfmpeg && fs.existsSync(dataFile)) {
  const raw = fs.readFileSync(dataFile, 'utf8');
  const start = raw.indexOf('{');
  const data = JSON.parse(raw.slice(start));
  data.current = typeof data.current === 'object' ? data.current : {};
  data.current.use_bundled_visuals = true;
  fs.writeFileSync(dataFile, raw.slice(0, start) + JSON.stringify(data, null, 2) + '\n');
  console.log('Enabled settings.use_bundled_visuals in config/settings_data.json');
}
console.log(`${ok}/${visuals.length} visuals downloaded.`);
