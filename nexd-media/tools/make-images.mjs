// Genereert og-image.png (1200×630), favicon.png en apple-touch-icon.png in assets/img met Playwright,
// op basis van het echte logo (assets/img/logo-x.png, uitgesneden van de huidige site).
// Gebruik: node tools/make-images.mjs   (daarna npm run build)
import { chromium } from 'playwright-core';
import { readFile, writeFile } from 'node:fs/promises';
import { engineSvg } from '../src/components/sections.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const font = async (f) => `data:font/woff2;base64,${(await readFile(new URL(`../assets/fonts/${f}`, import.meta.url))).toString('base64')}`;
const logo = `data:image/png;base64,${(await readFile(new URL('../assets/img/logo-x.png', import.meta.url))).toString('base64')}`;
const css = `
@font-face{font-family:'Oswald';src:url(${await font('oswald-var.woff2')});font-weight:200 700}
@font-face{font-family:'Space Grotesk';src:url(${await font('space-grotesk-var.woff2')});font-weight:300 700}
*{margin:0;box-sizing:border-box}body{background:#f7faf9;color:#0f172a;font-family:'Space Grotesk'}
.engine-svg{position:absolute;inset:0;width:100%;height:100%}
.engine-svg__frames polygon{fill:#0f172a;fill-opacity:.025;stroke:#0f172a;stroke-opacity:.4;stroke-width:1.2}
.engine-svg__dots circle{fill:#0f172a;fill-opacity:.3}.engine-svg__dots circle.w{fill:#12b981;fill-opacity:1}
.engine-svg__core{fill:#12b981}`;

const browser = await chromium.launch({ executablePath: exe });
const shot = async (w, h, html, file, omitBackground = false) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<style>${css}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../assets/img/${file}`, import.meta.url).pathname, omitBackground });
  await page.close();
  console.log(file);
};

await shot(1200, 630, `
<div style="position:relative;width:1200px;height:630px;overflow:hidden;background:#f7faf9;border-bottom:14px solid #12b981">
  <div style="position:absolute;inset:0 -140px 0 420px">${engineSvg()}</div>
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,#f7faf9 36%,rgba(247,250,249,0) 78%)"></div>
  <div style="position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:12px"><img src="${logo}" style="width:50px"><b style="font-family:'Oswald';font-size:32px;letter-spacing:.02em">NEXD</b><span style="font-size:13px;letter-spacing:.16em;color:#5b6474">MEDIA</span></div>
  <h1 style="position:absolute;left:72px;bottom:118px;font-family:'Oswald';font-weight:700;text-transform:uppercase;font-size:86px;line-height:.95;max-width:9.5em">Je website moet meer doen dan er goed uitzien<span style="color:#12b981">.</span></h1>
  <p style="position:absolute;left:72px;bottom:62px;font-size:17px;text-transform:uppercase;color:#047857;letter-spacing:.02em">Websites voor advocatuur &amp; accountancy · Oldenzaal</p>
</div>`, 'og-image.png');

await shot(64, 64, `<style>body{background:transparent}</style><div style="width:64px;height:64px;display:grid;place-items:center"><img src="${logo}" style="width:60px"></div>`, 'favicon.png', true);
await shot(180, 180, `<div style="width:180px;height:180px;display:grid;place-items:center;background:#f7faf9"><img src="${logo}" style="width:120px"></div>`, 'apple-touch-icon.png');
await browser.close();
