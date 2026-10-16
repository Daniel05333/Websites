// Screenshots van ./public. Gebruik: node tools/shoot.mjs --out=<map> [--full] [--reduced] [pad...]
// Standaard met WebGL-hero (wacht tot de 3D-scène live is); --reduced voor de statische variant.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { server } from './serve.mjs';

const args = process.argv.slice(2);
const out = args.find((a) => a.startsWith('--out='))?.slice(6) ?? 'shots';
const full = args.includes('--full');
const reduced = args.includes('--reduced');
const paths = args.filter((a) => a.startsWith('/'));
const list = paths.length ? paths : ['/', '/website-laten-maken.html', '/maatwerk-website.html', '/website-laten-optimaliseren/', '/over-ons/', '/contact/'];
const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
await mkdir(out, { recursive: true });
await new Promise((r) => server.listen(4511, r));
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  for (const p of list) {
    await page.goto('http://localhost:4511' + p, { waitUntil: 'networkidle' });
    if (p === '/' && !reduced) await page.waitForSelector('.hero__stage.is-live', { timeout: 15000 }).then(() => page.waitForTimeout(2600), () => console.log('  (geen WebGL-hero)'));
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
    await page.waitForTimeout(400);
    const file = `${out}/${name}${p.replace(/[/.]/g, '_')}.png`;
    await page.screenshot({ path: file, fullPage: full });
    console.log(file);
  }
  await ctx.close();
}
await browser.close();
server.close();
