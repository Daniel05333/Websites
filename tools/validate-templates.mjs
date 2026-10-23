// Checks template / section-group / settings_data JSON against the section and theme schemas, the way Shopify
// validates them on upload (a rejected template file is silently dropped, e.g. index.json → homepage shows 404).
// Usage: node tools/validate-templates.mjs [theme-dir]
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(process.argv[2] || '.');
const readJSON = (p) => { const s = fs.readFileSync(p, 'utf8'); return JSON.parse(s.slice(s.indexOf('{') === -1 ? 0 : Math.min(...['{', '['].map((c) => s.indexOf(c)).filter((i) => i >= 0)))); };
const schemas = {};
for (const f of fs.readdirSync(path.join(ROOT, 'sections'))) if (f.endsWith('.liquid')) {
  const m = fs.readFileSync(path.join(ROOT, 'sections', f), 'utf8').match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  if (m) schemas[f.replace('.liquid', '')] = JSON.parse(m[1]);
}
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const isUrl = (v) => v === '' || /^(\/|https?:\/\/|mailto:|tel:|shopify:\/\/)/.test(v);
function checkSetting(file, where, def, v) {
  if (v === null || v === undefined) return;
  const t = def.type;
  if (t === 'range' || t === 'number') {
    if (typeof v !== 'number') return err(file, `${where}: ${def.id} must be a number (got ${JSON.stringify(v)})`);
    if (t === 'range') { if (v < def.min || v > def.max) err(file, `${where}: ${def.id}=${v} outside ${def.min}–${def.max}`); if (def.step && Math.abs(((v - def.min) / def.step) - Math.round((v - def.min) / def.step)) > 1e-9) err(file, `${where}: ${def.id}=${v} not on step ${def.step}`); }
  } else if (t === 'select' || t === 'radio') { if (!def.options.some((o) => o.value === v)) err(file, `${where}: ${def.id}=${JSON.stringify(v)} not an option`); }
  else if (t === 'checkbox') { if (typeof v !== 'boolean') err(file, `${where}: ${def.id} must be true/false`); }
  else if (t === 'url') { if (typeof v !== 'string' || !isUrl(v)) err(file, `${where}: ${def.id}=${JSON.stringify(v)} is not a valid url value`); }
  else if (t === 'richtext') { if (v && !/^\s*<(p|ul|ol|h[1-6])[\s>]/.test(v)) err(file, `${where}: ${def.id} richtext must start with <p>, <ul>, <ol> or <h1-6>`); }
  else if (t === 'inline_richtext') { if (/<(p|div|ul|ol|h[1-6])[\s>]/.test(v)) err(file, `${where}: ${def.id} inline_richtext may not contain block tags`); }
  else if (t === 'color') { if (v && !/^(#[0-9a-f]{3,8}|rgba?\(.*\)|transparent)$/i.test(v)) err(file, `${where}: ${def.id} bad color ${v}`); }
  else if (t === 'color_scheme') { if (v && !/^scheme-/.test(v)) err(file, `${where}: ${def.id} bad scheme ${v}`); }
  else if (['text', 'textarea', 'html', 'liquid', 'image_picker', 'video', 'video_url', 'product', 'collection', 'page', 'blog', 'article', 'link_list', 'font_picker'].includes(t)) { if (typeof v !== 'string') err(file, `${where}: ${def.id} must be a string`); }
  else if (['product_list', 'collection_list'].includes(t)) { if (!Array.isArray(v)) err(file, `${where}: ${def.id} must be a list`); }
}
function checkSettings(file, where, defs, values) {
  const byId = Object.fromEntries((defs || []).filter((d) => d.id).map((d) => [d.id, d]));
  for (const [k, v] of Object.entries(values || {})) { if (!byId[k]) { err(file, `${where}: unknown setting "${k}"`); continue; } checkSetting(file, where, byId[k], v); }
}
function checkSection(file, key, sec) {
  if (sec.type?.startsWith('_') || sec.type === 'apps') { if (!schemas[sec.type]) err(file, `section ${key}: type ${sec.type} missing`); }
  const schema = schemas[sec.type]; if (!schema) return err(file, `section ${key}: section file "${sec.type}" not found`);
  checkSettings(file, `section ${key}`, schema.settings, sec.settings);
  const blocks = sec.blocks || {}; const order = sec.block_order || Object.keys(blocks);
  if (schema.max_blocks && order.length > schema.max_blocks) err(file, `section ${key}: ${order.length} blocks > max_blocks ${schema.max_blocks}`);
  for (const id of order) if (!blocks[id]) err(file, `section ${key}: block_order lists missing block ${id}`);
  const counts = {};
  for (const [id, b] of Object.entries(blocks)) {
    if (b.type?.startsWith('shopify://')) continue;
    const def = (schema.blocks || []).find((d) => d.type === b.type);
    if (!def) { err(file, `section ${key} block ${id}: type "${b.type}" not in schema`); continue; }
    counts[b.type] = (counts[b.type] || 0) + 1;
    if (def.limit && counts[b.type] > def.limit) err(file, `section ${key}: more than ${def.limit} "${b.type}" blocks`);
    checkSettings(file, `section ${key} block ${id}`, def.settings, b.settings);
  }
}
const tplDir = path.join(ROOT, 'templates');
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.json')) files.push(p); } };
walk(tplDir);
for (const f of fs.readdirSync(path.join(ROOT, 'sections'))) if (f.endsWith('.json')) files.push(path.join(ROOT, 'sections', f));
for (const p of files) {
  const rel = path.relative(ROOT, p); let t;
  try { t = readJSON(p); } catch (e) { err(rel, `invalid JSON: ${e.message}`); continue; }
  for (const k of t.order || []) if (!t.sections?.[k]) err(rel, `order lists missing section ${k}`);
  if (Object.keys(t.sections || {}).length > 25) err(rel, 'more than 25 sections');
  for (const [k, s] of Object.entries(t.sections || {})) checkSection(rel, k, s);
}
// settings_data against settings_schema
const schemaGroups = readJSON(path.join(ROOT, 'config/settings_schema.json'));
const globalDefs = schemaGroups.flatMap((g) => g.settings || []);
const data = readJSON(path.join(ROOT, 'config/settings_data.json'));
const cur = typeof data.current === 'string' ? data.presets[data.current] : data.current;
// sections, blocks and content_for_index are written by Shopify itself, not theme settings.
const { sections: _s, blocks: _b, content_for_index: _c, ...globals } = cur || {};
checkSettings('config/settings_data.json', 'current', globalDefs, globals);
// schema defaults and presets (an invalid default makes Shopify reject the whole section file)
for (const [name, sc] of Object.entries(schemas)) {
  const file = `sections/${name}.liquid`;
  const defaults = (defs, where) => (defs || []).forEach((d) => { if (d.id && 'default' in d) checkSetting(file, where, d, d.default); if (d.type === 'select' && 'default' in d === false && d.options) {} });
  defaults(sc.settings, 'schema default');
  (sc.blocks || []).forEach((b) => defaults(b.settings, `block ${b.type} default`));
  (sc.presets || []).forEach((pr, i) => {
    checkSettings(file, `preset ${i}`, sc.settings, pr.settings);
    (pr.blocks || []).forEach((b, j) => { const def = (sc.blocks || []).find((x) => x.type === b.type); if (!def && !b.type.startsWith('@')) err(file, `preset ${i} block ${j}: unknown type ${b.type}`); else if (def) checkSettings(file, `preset ${i} block ${j}`, def.settings, b.settings); });
  });
}
globalDefs.forEach((d) => { if (d.id && 'default' in d) checkSetting('config/settings_schema.json', 'default', d, d.default); });
console.log(errors.length ? errors.join('\n') : 'All templates valid.');
console.log(`${errors.length} problem(s) in ${files.length} files.`);
process.exitCode = errors.length ? 1 : 0;
