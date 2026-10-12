#!/usr/bin/env node
// Screenshot a preview route. Usage: npm run shoot -- <path> [--mobile] [--full] [--scroll] [--out file.png] [--reduced-motion] [--click sel] [--wait ms]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const args = process.argv.slice(2); const flag = (n) => args.includes(`--${n}`); const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : d; };
const route = args.find((a) => a.startsWith('/')) || '/';
const base = opt('base', 'http://localhost:4321'); const mobile = flag('mobile');
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } , reducedMotion: flag('reduced-motion') ? 'reduce' : 'no-preference' });
const page = await ctx.newPage(); const logs = [];
page.on('console', (m) => { if (m.type() === 'error') logs.push(`console: ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
page.on('requestfailed', (r) => logs.push(`failed: ${r.url()}`));
page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('favicon')) logs.push(`${r.status()}: ${r.url()}`); });
await page.goto(base + route, { waitUntil: 'networkidle' });
if (flag('scroll')) { await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 600)); }); }
if (flag('reveal') || flag('full')) { await page.evaluate(() => { document.querySelectorAll('[data-reveal],[data-split]').forEach((e) => e.classList.add('is-revealed')); document.querySelectorAll('[data-count-to]').forEach((e) => (e.textContent = (e.dataset.countPrefix || '') + e.dataset.countTo)); }); await page.waitForTimeout(1500); }
if (opt('click')) { await page.click(opt('click')); }
await page.waitForTimeout(Number(opt('wait', 1200)));
const out = opt('out', `tools/preview/shots/${route.replace(/\W+/g, '_') || 'home'}-${mobile ? 'mobile' : 'desktop'}.png`);
fs.mkdirSync(out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
const H = await page.evaluate(() => document.documentElement.scrollHeight); const W = page.viewportSize().width;
if (flag('full') && H > 12000) { for (let y = 0, i = 0; y < H; y += 6000, i++) await page.screenshot({ path: out.replace(/\.png$/, `-${i}.png`), fullPage: true, clip: { x: 0, y, width: W, height: Math.min(6000, H - y) } }); }
else await page.screenshot({ path: out, fullPage: flag('full') });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ out, overflowX: overflow, issues: logs }, null, 1));
await browser.close();
