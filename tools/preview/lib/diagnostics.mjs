// Per-request diagnostics: Liquid errors, unknown filters, missing translations — logged and shown in-page.
import path from 'node:path';
import { THEME_ROOT } from './paths.mjs';
import { escapeHtml } from './util.mjs';

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : String(s));
export const c = { red: paint('31'), yellow: paint('33'), green: paint('32'), dim: paint('2'), cyan: paint('36'), bold: paint('1'), magenta: paint('35') };

export function log(...a) { console.log(...a); }

/** Theme-relative path for any absolute file path liquidjs reports. */
export function relFile(file) {
  if (!file) return '';
  const s = String(file);
  if (!path.isAbsolute(s)) return s;
  const r = path.relative(THEME_ROOT, s);
  return r.startsWith('..') ? s : r.split(path.sep).join('/');
}

/** Extract { file, line, col, message } from a liquidjs (or plain) error. */
export function describeError(err, fallbackFile) {
  let e = err;
  // LiquidErrors (catchAllErrors) → first error
  if (e && Array.isArray(e.errors) && e.errors.length) e = e.errors[0];
  let file = fallbackFile || '';
  let line = 0;
  let col = 0;
  const tok = e?.token;
  if (tok) {
    if (tok.file) file = tok.file;
    try { [line, col] = tok.getPosition(); } catch { /* ignore */ }
  }
  let message = String(e?.message || e || 'Unknown error');
  const m = message.match(/, file:(.+?), line:(\d+), col:(\d+)$/) || message.match(/, line:(\d+), col:(\d+)$/);
  if (m) {
    if (m.length === 4) { file = file || m[1]; line = line || +m[2]; col = col || +m[3]; } else { line = line || +m[1]; col = col || +m[2]; }
    message = message.slice(0, m.index);
  }
  // innermost cause reads better (e.g. "Could not find asset snippets/x.liquid")
  const orig = e?.originalError;
  if (orig && orig.message && !message.includes(orig.message)) message = `${message} (${orig.message})`;
  message = message.replace(/^(RenderError|ParseError|TokenizationError|AssertionError|UndefinedVariableError):\s*/, '');
  return { file: relFile(file), line, col, message, context: e?.context || '' };
}

export class Diagnostics {
  constructor(label) {
    this.label = label;
    this.errors = [];
    this.warnings = [];
    this._seen = new Set();
  }

  error(info, { quiet = false } = {}) {
    const key = `E|${info.file}|${info.line}|${info.message}`;
    this.errors.push(info);
    if (!quiet && !this._seen.has(key)) {
      this._seen.add(key);
      const where = info.file ? `${info.file}${info.line ? ':' + info.line : ''}${info.col ? ':' + info.col : ''}` : '(unknown file)';
      console.log(`${c.red('✖ Liquid error')} ${c.bold(where)} ${c.dim('[' + this.label + ']')}\n  ${info.message}`);
      if (info.context && process.env.PREVIEW_VERBOSE) console.log(c.dim(info.context));
    }
  }

  warn(kind, message, info = {}) {
    const key = `W|${kind}|${message}`;
    if (this._seen.has(key)) return;
    this._seen.add(key);
    this.warnings.push({ kind, message, ...info });
    console.log(`${c.yellow('▲ ' + kind)} ${message}${info.file ? c.dim(' (' + info.file + ')') : ''} ${c.dim('[' + this.label + ']')}`);
  }

  counts() {
    const byKind = {};
    for (const w of this.warnings) byKind[w.kind] = (byKind[w.kind] || 0) + 1;
    return { errors: this.errors.length, warnings: this.warnings.length, byKind };
  }
}

const BOX = 'all:initial;display:block;box-sizing:border-box;margin:16px auto;max-width:1200px;padding:14px 18px;border:2px solid #ff3b30;border-radius:10px;background:#2a0705;color:#ffd7d3;font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word;position:relative;z-index:2147483000;text-align:left';

/** Block-level error box (missing section, invalid schema, template parse error). */
export function errorBox(title, info) {
  const where = info.file ? `${info.file}${info.line ? ' line ' + info.line : ''}` : '';
  return `<div data-preview-error="block" role="alert" style="${BOX}"><strong style="all:initial;color:#fff;font:700 13px ui-monospace,Menlo,monospace">${escapeHtml(title)}</strong>${where ? `<span style="all:initial;color:#ff9f97;font:13px ui-monospace,Menlo,monospace"> · ${escapeHtml(where)}</span>` : ''}\n${escapeHtml(info.message)}</div>`;
}

/**
 * Inline error, like Shopify's "Liquid error (file line N): message" text. Uses single-quoted attributes only,
 * so when it lands inside a double-quoted HTML attribute it degrades to harmless text.
 */
export function inlineError(info) {
  const where = info.file ? ` (${info.file}${info.line ? ' line ' + info.line : ''})` : '';
  const text = escapeHtml(`Liquid error${where}: ${info.message}`);
  return `<span data-preview-error='inline' style='all:initial;display:inline-block;margin:2px;padding:3px 8px;border-radius:6px;background:#ff3b30;color:#fff;font:600 12px/1.4 ui-monospace,Menlo,monospace;white-space:normal;position:relative;z-index:2147483000'>${text}</span>`;
}

/** Floating summary injected before </body> whenever a page has errors or warnings. */
export function overlay(diag) {
  const { errors, warnings } = diag;
  if (!errors.length && !warnings.length) return '';
  const items = [
    ...errors.slice(0, 30).map((e) => `<li style="all:initial;display:block;color:#ffd7d3;font:12px/1.5 ui-monospace,Menlo,monospace;margin:4px 0"><b style="all:initial;color:#ff6b61;font:700 12px ui-monospace,Menlo,monospace">ERROR</b> ${escapeHtml(e.file || '')}${e.line ? ':' + e.line : ''} — ${escapeHtml(e.message)}</li>`),
    ...warnings.slice(0, 30).map((w) => `<li data-preview-warning="${escapeHtml(w.kind)}" style="all:initial;display:block;color:#ffe9b8;font:12px/1.5 ui-monospace,Menlo,monospace;margin:4px 0"><b style="all:initial;color:#ffcc4d;font:700 12px ui-monospace,Menlo,monospace">${escapeHtml(w.kind.toUpperCase())}</b> ${escapeHtml(w.message)}${w.file ? ' — ' + escapeHtml(w.file) : ''}</li>`),
  ].join('');
  const label = [errors.length && `${errors.length} Liquid error${errors.length > 1 ? 's' : ''}`, warnings.length && `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`].filter(Boolean).join(' · ');
  return `\n<details id="preview-harness-overlay" data-preview-overlay data-errors="${errors.length}" data-warnings="${warnings.length}" style="all:initial;position:fixed;left:12px;bottom:12px;z-index:2147483647;max-width:min(720px,calc(100vw - 24px));max-height:60vh;overflow:auto;background:#140403;border:2px solid ${errors.length ? '#ff3b30' : '#ffb020'};border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.5);font:12px ui-monospace,Menlo,monospace;color:#fff"><summary style="all:initial;display:block;cursor:pointer;padding:8px 14px;color:#fff;font:700 12px ui-monospace,Menlo,monospace">PREVIEW HARNESS · ${escapeHtml(label)}</summary><ul style="all:initial;display:block;padding:4px 14px 12px">${items}</ul></details>\n`;
}
