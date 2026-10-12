// Shared helpers for the VOLKARA preview harness.
import crypto from 'node:crypto';
import { Drop, toValue } from 'liquidjs';

/** Ruby-style Float. Keeps "float-ness" through Liquid math so integer/float division matches Shopify. */
export class LiquidFloat {
  constructor(n) { this.n = Number(n); }
  valueOf() { return this.n; }
  toString() { return rubyFloat(this.n); }
  toJSON() { return this.n; }
}

export function rubyFloat(n) {
  if (Number.isNaN(n)) return 'NaN';
  if (!Number.isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (Number.isInteger(n) && Math.abs(n) < 1e16) return n.toFixed(1);
  return String(n);
}

export const float = (n) => new LiquidFloat(n);

/** Unwraps drops/floats and returns { n, f } (number + isFloat) like Ruby's numeric coercion in Liquid. */
export function numeric(v) {
  v = unwrap(v);
  if (v instanceof LiquidFloat) return { n: v.n, f: true };
  if (typeof v === 'number') return { n: v, f: !Number.isInteger(v) };
  if (typeof v === 'string') {
    const s = v.trim();
    if (/^[-+]?\d+$/.test(s)) return { n: parseInt(s, 10), f: false };
    const m = s.match(/^[-+]?\d*\.\d+|^[-+]?\d+\.\d*/);
    if (m) return { n: parseFloat(m[0]), f: true };
    const lead = s.match(/^[-+]?\d+/);
    return { n: lead ? parseInt(lead[0], 10) : 0, f: false };
  }
  if (typeof v === 'boolean' || v == null) return { n: 0, f: false };
  const n = Number(v);
  return { n: Number.isFinite(n) ? n : 0, f: !Number.isInteger(n) };
}

export const num = (v) => numeric(v).n;
export const mk = (n, f) => (f ? new LiquidFloat(n) : n);

/** Fully unwraps liquidjs Drops (valueOf) – but not LiquidFloat. */
export function unwrap(v) {
  let guard = 0;
  while (v instanceof Drop && guard++ < 5) {
    const x = toValue(v);
    if (x === v) break;
    v = x;
  }
  return v;
}

/** Plain JS value suitable for string operations. */
export function str(v) {
  v = unwrap(v);
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(str).join('');
  return String(v);
}

const HTML_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s) => str(s).replace(/[&<>"']/g, (c) => HTML_ESC[c]);
export const escapeAttr = escapeHtml;
export const escapeOnce = (s) => str(s).replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)|[<>"']/g, (c) => HTML_ESC[c]);

export function handleize(s) {
  return str(s)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripHtml(s) {
  return str(s)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, '');
}

/** JSON with block/line comments (Shopify allows a /* *\/ header in JSON templates & settings_data). */
export function parseJSONC(text, file = '') {
  let out = '';
  let i = 0;
  const n = text.length;
  let inStr = false;
  while (i < n) {
    const c = text[i];
    if (inStr) {
      out += c;
      if (c === '\\') { out += text[i + 1] ?? ''; i += 2; continue; }
      if (c === '"') inStr = false;
      i++; continue;
    }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === '/' && text[i + 1] === '*') { const e = text.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '/' && text[i + 1] === '/') { const e = text.indexOf('\n', i + 2); i = e < 0 ? n : e; continue; }
    out += c; i++;
  }
  // tolerate trailing commas the theme editor never writes but humans do
  out = out.replace(/,(\s*[}\]])/g, '$1');
  try { return JSON.parse(out); }
  catch (e) { const err = new Error(`Invalid JSON${file ? ' in ' + file : ''}: ${e.message}`); err.file = file; throw err; }
}

/** Shopify-style JSON encoding (HTML-significant characters escaped as \u003c etc). */
export function shopifyJSON(value, space) {
  return JSON.stringify(value, (k, v) => (v === undefined ? null : v), space)
    ?.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') ?? 'null';
}

export const md5 = (s) => crypto.createHash('md5').update(str(s)).digest('hex');
export const sha1 = (s) => crypto.createHash('sha1').update(str(s)).digest('hex');
export const sha256 = (s) => crypto.createHash('sha256').update(str(s)).digest('hex');

/** Deterministic 14-digit numeric id (stable section/template ids across reloads). */
export function stableId(seed) {
  const h = crypto.createHash('sha1').update(String(seed)).digest();
  let n = 0n;
  for (let i = 0; i < 8; i++) n = (n << 8n) | BigInt(h[i]);
  return String(10000000000000n + (n % 89999999999999n));
}

/**
 * Split filter arguments into positional and named (`key: value`) ones.
 * liquidjs passes named args as [key, value] tuples; the filter token tells us which
 * arguments were written as key/value pairs, so arrays passed positionally stay positional.
 */
export function splitArgs(args, self) {
  const tokenArgs = self?.token?.args;
  const pos = [];
  const named = {};
  const has = new Set();
  args.forEach((a, i) => {
    const isNamed = tokenArgs ? Array.isArray(tokenArgs[i]) : (Array.isArray(a) && a.length === 2 && typeof a[0] === 'string');
    if (isNamed) { named[a[0]] = a[1]; has.add(a[0]); } else pos.push(a);
  });
  return { pos, named, has: (k) => has.has(k) };
}

/** True when the i-th filter argument was written as a float literal (e.g. `times: 100.0`). */
export function argIsFloatLiteral(self, i) {
  const t = self?.token?.args?.[i];
  if (!t || Array.isArray(t)) return false;
  const text = typeof t.getText === 'function' ? t.getText() : '';
  return /^[-+]?\d+\.\d+$/.test(text.trim());
}

export function attrsToString(attrs) {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${escapeAttr(v)}"`))
    .join(' ');
}

export function isPlainObject(v) {
  return v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
}

export function toArray(v) {
  v = unwrap(v);
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'object' && typeof v[Symbol.iterator] === 'function' && typeof v !== 'string') return Array.from(v);
  return [v];
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0) out[decodeURIComponent(part.slice(0, i).trim())] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function titleize(handle) {
  return str(handle).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mimeFor(file) {
  const ext = file.toLowerCase().split('.').pop();
  return ({
    css: 'text/css; charset=utf-8', js: 'application/javascript; charset=utf-8', mjs: 'application/javascript; charset=utf-8',
    json: 'application/json; charset=utf-8', html: 'text/html; charset=utf-8', txt: 'text/plain; charset=utf-8', map: 'application/json',
    svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', ico: 'image/x-icon',
    woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m3u8: 'application/vnd.apple.mpegurl',
    glb: 'model/gltf-binary', gltf: 'model/gltf+json', pdf: 'application/pdf',
  })[ext] || 'application/octet-stream';
}
