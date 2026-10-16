// Genereert og-image.png (1200×630), logo.png en apple-touch-icon.png in assets/img met Playwright.
// Gebruik: node tools/make-images.mjs   (daarna npm run build)
import { chromium } from 'playwright-core';
import { readFile, writeFile } from 'node:fs/promises';
import { engineSvg } from '../src/components/sections.mjs';
import { mark } from '../src/components/layout.mjs';

const exe = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const font = async (f) => `data:font/woff2;base64,${(await readFile(new URL(`../assets/fonts/${f}`, import.meta.url))).toString('base64')}`;
const css = `
@font-face{font-family:'Inter Tight';src:url(${await font('inter-tight-var.woff2')});font-weight:100 900}
@font-face{font-family:'Instrument Serif';src:url(${await font('instrument-serif-italic.woff2')});font-style:italic}
@font-face{font-family:'JetBrains Mono';src:url(${await font('jetbrains-mono-500.woff2')})}
:root{--paper:#f2eee6;--signal:#ff5a1f}
*{margin:0;box-sizing:border-box}body{background:#0e0f0d;color:#f2eee6;font-family:'Inter Tight'}
.engine-svg{position:absolute;inset:0;width:100%;height:100%}
.engine-svg__grid line{stroke:#f2eee6;stroke-opacity:.07}
.engine-svg__frames polygon{fill:#f2eee6;fill-opacity:.025;stroke:#f2eee6;stroke-opacity:.55;stroke-width:1.4}
.engine-svg__dots circle{fill:#f2eee6;fill-opacity:.42}.engine-svg__dots circle.w{fill:#ff5a1f;fill-opacity:.95}
.engine-svg__core{fill:#ff5a1f}`;

const browser = await chromium.launch({ executablePath: exe });
const shot = async (w, h, html, file) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<style>${css}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../assets/img/${file}`, import.meta.url).pathname });
  await page.close();
  console.log(file);
};

await shot(1200, 630, `
<div style="position:relative;width:1200px;height:630px;overflow:hidden">
  <div style="position:absolute;inset:0 -120px 0 360px;opacity:.95">${engineSvg()}</div>
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,#0e0f0d 30%,rgba(14,15,13,.2) 75%)"></div>
  <div style="position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:12px;color:#f2eee6">${mark(40)}<b style="font-size:30px;letter-spacing:-.04em">NEXD</b><span style="font-family:'JetBrains Mono';font-size:14px;letter-spacing:.12em;opacity:.75">MEDIA</span></div>
  <h1 style="position:absolute;left:72px;bottom:120px;font-size:84px;line-height:.94;letter-spacing:-.045em;font-weight:600;max-width:12ch">Websites die <em style="font-family:'Instrument Serif';font-weight:400;color:#ff5a1f">aanvragen</em> opleveren.</h1>
  <p style="position:absolute;left:72px;bottom:64px;font-family:'JetBrains Mono';font-size:16px;letter-spacing:.08em;color:#aaa59a">LEGAL · FINANCE · ZAKELIJKE DIENSTVERLENING</p>
</div>`, 'og-image.png');

await shot(512, 512, `<div style="width:512px;height:512px;display:grid;place-items:center;color:#f2eee6">${mark(360)}</div>`, 'logo.png');
await shot(180, 180, `<div style="width:180px;height:180px;display:grid;place-items:center;color:#f2eee6">${mark(120)}</div>`, 'apple-touch-icon.png');
await browser.close();
