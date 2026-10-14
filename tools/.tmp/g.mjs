import { chromium } from 'playwright-core';
const SP='/tmp/claude-0/-home-user-Websites/6afd16ff-f6f0-5cfa-86b8-2f8c3888fb0f/scratchpad';
const B='http://localhost:4321', EBOOK=41000025;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: {width:390,height:844} });
const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
let mutations=0; p.on('request', r=>{ if (/cart\/(add|change|update)\.js/.test(r.url())) mutations++; });
const cart = async () => (await (await p.request.get(B+'/cart.js')).json()).items.map(i=>`${i.quantity}x${i.variant_id===EBOOK?'EBOOK':i.variant_id}`).join(' ');
const settle = async () => { await p.waitForTimeout(1800); };
await p.goto(B+'/products/gehamerde-titanium-pan', { waitUntil: 'networkidle' });
console.log('0 start:', await cart() || '(leeg)');
await p.click('[data-atc]'); await settle();
console.log('1 add pan:', await cart());
await p.screenshot({ path: `${SP}/cart-drawer.png` });
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
await p.click('[data-tier-card="pick2"] .vk-bundle__head'); await p.click('[data-atc]'); await settle();
console.log('2 add set:', await cart());
// quantity + on first line
await p.locator('vk-cart-drawer [data-line="1"] button[name="plus"]').click(); await p.waitForTimeout(1500); await settle();
console.log('3 qty+:', await cart());
// change size of first line in cart
const sel = p.locator('vk-cart-drawer [data-line="1"] [data-line-variant]');
console.log('   select present:', await sel.count());
if (await sel.count()) { await sel.selectOption({ label: '32 cm' }); await settle(); }
console.log('4 size->32:', await cart());
// idle: no further cart mutations
const m0=mutations; await p.waitForTimeout(3000); console.log('5 idle mutations:', mutations-m0);
// manipulate: ebook qty 3, reload
await p.request.post(B+'/cart/update.js', { data: { updates: { [`${EBOOK}:vk`]: 3 } } });
await p.reload({ waitUntil: 'networkidle' }); await settle();
console.log('6 ebook x3 + refresh:', await cart());
// remove ebook manually while products exist, reload
await p.request.post(B+'/cart/change.js', { data: { id: `${EBOOK}:vk`, quantity: 0 } });
await p.reload({ waitUntil: 'networkidle' }); await settle();
console.log('7 ebook removed + refresh:', await cart());
// remove all products via cart page
await p.goto(B+'/cart', { waitUntil: 'networkidle' }); await settle();
await p.screenshot({ path: `${SP}/cart-page.png`, fullPage: true });
for (let k=0;k<6;k++) { const rm = p.locator('vk-cart-items [data-line-remove]').first(); if (!(await rm.count())) break; await rm.click(); await p.waitForTimeout(2500); }
console.log('8 all removed (cart page):', await cart() || '(leeg)');
// ebook alone + refresh
await p.request.post(B+'/cart/add.js', { data: { items: [{ id: EBOOK, quantity: 1 }] } });
await p.goto(B+'/', { waitUntil: 'networkidle' }); await settle();
console.log('9 only ebook + refresh:', await cart() || '(leeg)');
console.log('errors', errs);
await b.close();
