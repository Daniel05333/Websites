import { chromium } from 'playwright-core';
const B='http://localhost:4321';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: {width:390,height:844} });
await p.request.post(B+'/cart/add.js', { data: { items: [{ id: 41000002, quantity: 1 }, { id: 41000004, quantity: 2 }] } });
await p.goto(B+'/cart', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
const cart = async () => (await (await p.request.get(B+'/cart.js')).json()).items.map(i=>`${i.quantity}x${i.variant_id}`).join(' ');
console.log('start', await cart());
for (let k=0;k<4;k++) {
  const rm = p.locator('vk-cart-items [data-line-remove]').first(); if (!(await rm.count())) break;
  await rm.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  const hit = await rm.evaluate((el)=>{ const r=el.getBoundingClientRect(); const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); return el.contains(t) ? 'ok' : (t.tagName+'.'+t.className); });
  console.log('hit-test', hit);
  await rm.click({ force: true }); await p.waitForTimeout(2500); console.log('after remove', await cart() || '(leeg)');
}
await b.close();
