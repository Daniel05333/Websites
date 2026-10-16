// Screenshots van ./public. Gebruik: node tools/shoot.mjs <outdir> [pad...]
import { chromium } from 'playwright-core';
import { server } from './serve.mjs';

const out = process.argv[2] ?? 'shots';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/', '/tarieven/', '/proefles/', '/over-rijschool-linkerbaan/', '/contact/'];
const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
await new Promise((r) => server.listen(4411, r));
const browser = await chromium.launch({ executablePath: exe });
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto('http://localhost:4411' + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
    const file = `${out}/${name}${p.replace(/\//g, '_') || '_'}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
  await ctx.close();
}
await browser.close();
server.close();
