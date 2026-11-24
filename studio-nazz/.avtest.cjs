const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2]; const base = 'file://' + process.cwd() + '/voorbeeld/varianten/';
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const errs = []; const pg = async (n) => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(n + ': ' + e.message)); await p.goto(base + n + '.html'); await p.waitForTimeout(900); return p; };
  let p = await pg('dashboard');
  await p.evaluate(() => localStorage.removeItem('nazz-availability'));
  await p.reload(); await p.waitForTimeout(600);
  await p.locator('[data-tab=beschikbaarheid]').click(); await p.waitForTimeout(300);
  await p.locator('[data-av=open][data-day="3"]').evaluate(el => el.click());  // woensdag dicht
  await p.locator('[data-av=from][data-day="1"]').fill('12:00'); await p.locator('[data-av=from][data-day="1"]').dispatchEvent('change');
  await p.locator('[data-av=to][data-day="1"]').fill('16:00'); await p.locator('[data-av=to][data-day="1"]').dispatchEvent('change');
  await p.locator('[data-av=pFrom][data-day="1"]').fill('13:00'); await p.locator('[data-av=pFrom][data-day="1"]').dispatchEvent('change');
  await p.locator('[data-av=pTo][data-day="1"]').fill('13:30'); await p.locator('[data-av=pTo][data-day="1"]').dispatchEvent('change');
  await p.locator('[data-av-quick="1"]').click();
  await p.screenshot({ path: `${out}/av-dirty.png`, fullPage: true });
  await p.locator('[data-av-save]').click(); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/av-saved.png` });
  await p.locator('[data-tab=agenda]').click(); await p.waitForTimeout(300); await p.screenshot({ path: `${out}/av-agenda.png` });
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('nazz-availability')));
  // wizard
  p = await pg('noir');
  await p.locator('.masthead__cta').click(); await p.locator('.wz__opt', { hasText: 'Lash volume lift' }).first().click(); await p.locator('[data-next]').click(); await p.waitForTimeout(300);
  const days = await p.$$eval('.wz__day', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  const mon = await p.$$eval('.wz__day', els => els.findIndex(e => e.textContent.includes('ma')));
  await p.locator('.wz__day').nth(mon).click(); await p.waitForTimeout(200);
  const monTimes = await p.$$eval('.wz__time', els => els.map(e => e.textContent));
  // agenda B
  p = await pg('blush');
  await p.locator('.bcat__book[data-pre="Brow tint"]').click(); await p.waitForTimeout(800);
  await p.locator('[data-nextw]').click(); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/av-blush.png` });
  const closedB = await p.$$eval('.ag__none', els => els.map(e => e.textContent));
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  console.log({ wed: saved.week[3].open, mon: saved.week[1], blocked: saved.blocked.length });
  console.log('wizard dagen:', days.slice(0, 8).join(' | '));
  console.log('maandag tijden:', monTimes.join(' '));
  console.log('blush week2:', closedB.join(','));
  console.log('errors', errs.length ? errs : 'none');
  await b.close();
})();
