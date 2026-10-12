// Filesystem locations used by the harness. THEME_ROOT lets the harness render any theme folder.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PREVIEW_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = path.resolve(PREVIEW_DIR, '..', '..');
export const THEME_ROOT = path.resolve(process.env.THEME_ROOT || REPO_ROOT);

/** Template fragments live in the repo tools folder; a custom THEME_ROOT may bring its own. */
export function fragmentsDir() {
  const own = path.join(THEME_ROOT, 'tools', 'template-fragments');
  if (fs.existsSync(own)) return own;
  return path.join(REPO_ROOT, 'tools', 'template-fragments');
}

export const MOCK_DIR = process.env.PREVIEW_MOCK_DIR ? path.resolve(process.env.PREVIEW_MOCK_DIR) : path.join(PREVIEW_DIR, 'mock');
export const FIXTURE_DIR = path.join(PREVIEW_DIR, 'lib', 'fixtures');
export const STATIC_DIR = path.join(PREVIEW_DIR, 'static');
export const SHOTS_DIR = path.join(PREVIEW_DIR, 'shots');

/** Mock catalog: tools/preview/mock/catalog.json, falling back to the bundled 3-product fixture. */
export function catalogFile() {
  const real = path.join(MOCK_DIR, 'catalog.json');
  if (fs.existsSync(real)) return { file: real, fixture: false };
  return { file: path.join(FIXTURE_DIR, 'catalog.sample.json'), fixture: true };
}

/** Directories searched (in order) for /mock-images/<file>. */
export function mockImageDirs() {
  return [path.join(MOCK_DIR, 'images'), path.join(MOCK_DIR, 'videos'), path.join(MOCK_DIR, 'files'), path.join(FIXTURE_DIR, 'images')]
    .filter((d) => fs.existsSync(d));
}

export function findMockFile(name) {
  const clean = String(name || '').replace(/^\/+/, '').replace(/\?.*$/, '');
  if (!clean || clean.includes('..')) return null;
  for (const dir of mockImageDirs()) {
    const p = path.join(dir, clean);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    const base = path.join(dir, path.basename(clean));
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  }
  return null;
}

export const themePath = (...p) => path.join(THEME_ROOT, ...p);
export const rel = (p) => path.relative(THEME_ROOT, p).split(path.sep).join('/');

export function readThemeFile(...p) {
  const f = themePath(...p);
  try { return fs.readFileSync(f, 'utf8'); } catch { return null; }
}

export function themeFileExists(...p) {
  try { return fs.statSync(themePath(...p)).isFile(); } catch { return false; }
}
