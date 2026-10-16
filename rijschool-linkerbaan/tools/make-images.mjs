// Genereert assets/img/og-image.png (1200×630) en apple-touch-icon.png (180×180).
// Gebruik: node tools/make-images.mjs   (vereist Chromium; zie README)
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { brandMark } from '../src/components/icons.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const font = (await readFile('assets/fonts/bricolage-grotesque-var.woff2')).toString('base64');
const mark = (s) => brandMark(s).replaceAll('var(--ink)', '#1B2A40').replaceAll('var(--accent)', '#FFC21A');
const base = `<style>@font-face{font-family:B;src:url(data:font/woff2;base64,${font})}*{margin:0}body{font-family:B}</style>`;

const og = `${base}<div style="width:1200px;height:630px;background:radial-gradient(120% 120% at 90% 0%,#22344f,#0f1b2d 60%);color:#fff;position:relative;overflow:hidden;padding:80px;box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:18px">${mark(72)}<div style="font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:#b9c3d1">Rijschool<div style="font-size:40px;letter-spacing:-.03em;text-transform:none;color:#fff;font-weight:800">Linkerbaan</div></div></div>
  <div style="font-size:92px;font-weight:800;letter-spacing:-.04em;line-height:1;margin-top:70px">Met vertrouwen<br><span style="color:#FFC21A">de weg op.</span></div>
  <div style="font-size:28px;color:#d6dde7;margin-top:28px">Persoonlijke rijlessen in Enschede en omgeving</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:12px;background:repeating-linear-gradient(90deg,#FFC21A 0 60px,transparent 60px 100px)"></div>
</div>`;
const touch = `${base}<div style="width:180px;height:180px;background:#0f1b2d;display:grid;place-items:center">${mark(140).replace('rx="11"', 'rx="0"')}</div>`;

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();
for (const [html, w, h, out] of [[og, 1200, 630, 'og-image.png'], [touch, 180, 180, 'apple-touch-icon.png']]) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `assets/img/${out}`, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('assets/img/' + out);
}
await browser.close();
