/* ==========================================================================
   VOLKARA — cart: <vk-cart-drawer>, <vk-cart-items>, bubble, note
   Re-renders via the Section Rendering API returned by /cart/add.js & /cart/change.js
   ========================================================================== */
(() => {
  'use strict';
  const VK = window.VK; if (!VK) return;
  // The file is included by the layout and by the cart section; run it once.
  if (VK._cartScript) return; VK._cartScript = true;
  const Drawer = customElements.get('vk-drawer');

  const replaceSection = (id, html, selector) => {
    if (!html) return;
    const doc = VK.parseHTML(html);
    if (id === 'vk-cart-icon-bubble') {
      const src = doc.querySelector('[data-cart-count]'); if (!src) return;
      document.querySelectorAll('#vk-cart-icon-bubble').forEach((el) => { el.innerHTML = src.outerHTML; el.querySelector('[data-cart-count]')?.classList.add('is-bump'); });
      return;
    }
    if (id === 'vk-cart-drawer') {
      const next = doc.querySelector('[data-cart-content]'); const cur = document.querySelector('#vk-cart-drawer [data-cart-content]');
      const count = doc.querySelector('.vk-cart-drawer__count'); const curCount = document.querySelector('#vk-cart-drawer .vk-cart-drawer__count');
      const hadFocus = cur && cur.contains(document.activeElement);
      if (next && cur) cur.replaceWith(next); if (count && curCount) curCount.replaceWith(count);
      if (hadFocus) document.querySelector('#vk-cart-drawer .vk-drawer__panel')?.focus({ preventScroll: true });
      return;
    }
    const target = document.getElementById(`shopify-section-${id}`);
    const src = doc.getElementById(`shopify-section-${id}`) || doc.querySelector('.shopify-section');
    if (target && src) target.innerHTML = src.innerHTML;
    window.VKMotion?.init(target || document);
  };

  const sectionIds = () => {
    const ids = new Set(VK.getCartSections());
    document.querySelectorAll('vk-cart-items[data-section]').forEach((el) => ids.add(el.dataset.section));
    return [...ids];
  };

  const renderSections = (sections) => { if (!sections) return; Object.entries(sections).forEach(([id, html]) => replaceSection(id, html)); };

  /* <vk-cart-drawer> */
  if (Drawer && !customElements.get('vk-cart-drawer')) {
    customElements.define('vk-cart-drawer', class extends Drawer {
      connectedCallback() {
        super.connectedCallback();
        if (this._cartInit) return; this._cartInit = true;
        VK.subscribe(VK.EVENTS.cartUpdate, async (evt) => {
          if (evt.source === 'cart-items') return;
          if (evt.sections && Object.keys(evt.sections).length) renderSections(evt.sections);
          else { try { renderSections(await VK.fetchSections(location.pathname, sectionIds())); } catch (e) { console.error(e); } }
          if (VK.config.cartType !== 'page') this.open(document.activeElement);
        });
      }
    });
  }

  /* <vk-cart-items> — quantity + remove */
  if (!customElements.get('vk-cart-items')) {
    customElements.define('vk-cart-items', class extends HTMLElement {
      connectedCallback() {
        if (this._init) return; this._init = true;
        this.addEventListener('change', VK.debounce((e) => { const input = e.target.closest('[data-line-input]'); if (input) this.update(input.dataset.lineInput, input.value); }, 300));
        this.addEventListener('click', (e) => { const rm = e.target.closest('[data-line-remove]'); if (rm) { e.preventDefault(); this.update(rm.dataset.lineRemove, 0); } });
      }
      async update(line, quantity) {
        const row = this.querySelector(`[data-line="${line}"]`); row?.classList.add('is-loading');
        const ids = sectionIds();
        try {
          const res = await fetch(`${VK.routes.cart_change_url}.js`, { ...VK.fetchConfig(), body: JSON.stringify({ line: Number(line), quantity: Number(quantity), sections: ids, sections_url: location.pathname }) });
          const data = await res.json();
          if (!res.ok || data.status) { const err = row?.querySelector('[data-line-error]'); if (err) { err.hidden = false; err.textContent = data.description || data.message || VK.strings.cartError; } row?.classList.remove('is-loading'); return; }
          renderSections(data.sections);
          VK.publish(VK.EVENTS.cartUpdate, { source: 'cart-items', cart: data });
          if (data.item_count === 0 && document.querySelector('.vk-main-cart')) location.reload();
        } catch (e) { console.error(e); row?.classList.remove('is-loading'); }
      }
    });
  }

  /* ---------- Cart rules: free gift (e.g. the e-book) and shipping insurance ----------
     After every cart change, once on page load and on returning to the tab, the cart is read from Shopify and
     corrected in one request:
     - gift: one line while the cart holds a real product, none otherwise; only ever added when Shopify prices
       it at 0.00 (checked before adding and again in the cart);
     - insurance: at most one, and never on its own.
     Neither counts as a "real product". Corrections publish no cart event, so they cannot trigger themselves. */
  const gift = VK.config.gift;
  const insurance = VK.config.insurance;
  let syncBusy = false, syncAgain = false, giftBroken = false;
  const post = async (url, body) => {
    const res = await fetch(url, { ...VK.fetchConfig(), body: JSON.stringify({ ...body, sections: sectionIds(), sections_url: location.pathname }) });
    const data = await res.json();
    if (!res.ok || data.status) throw new Error(data.description || data.message || 'cart error');
    renderSections(data.sections);
    if (document.querySelector('.vk-main-cart') && !data.sections?.['vk-main-cart']) location.reload();
    return data;
  };
  const syncCart = async () => {
    if (!gift && !insurance) return;
    if (syncBusy) { syncAgain = true; return; }
    syncBusy = true;
    try {
      const cart = await (await fetch(`${VK.routes.cart_url}.js`, { headers: { Accept: 'application/json' } })).json();
      const isGift = (it) => gift && it.variant_id === gift.variant;
      const isIns = (it) => insurance && it.variant_id === insurance.variant;
      const real = cart.items.some((it) => !isGift(it) && !isIns(it));
      const updates = {};
      let addGift = false;
      if (gift && !giftBroken) {
        const lines = cart.items.filter(isGift);
        const paid = lines.some((it) => it.final_price > 0);
        if (paid) { giftBroken = true; console.warn('VOLKARA: gift product removed — Shopify charges for it.'); }
        if (real && !lines.length) {
          if (gift.price !== 0 || !gift.available) { giftBroken = true; console.warn('VOLKARA: gift product skipped — it must cost 0.00 and be available.'); }
          else addGift = true;
        } else if (lines.length && (!real || paid)) lines.forEach((it) => { updates[it.key] = 0; });
        else lines.forEach((it, i) => { if (i > 0 || it.quantity > 1) updates[it.key] = i === 0 ? 1 : 0; });
      }
      if (insurance) {
        const lines = cart.items.filter(isIns);
        if (lines.length && !real) lines.forEach((it) => { updates[it.key] = 0; });
        else lines.forEach((it, i) => { if (i > 0 || it.quantity > 1) updates[it.key] = i === 0 ? 1 : 0; });
      }
      if (Object.keys(updates).length) await post(`${VK.routes.cart_update_url}.js`, { updates });
      if (addGift) {
        // A gift that cannot be added (sold out, unpublished) is not retried on every change.
        try { await post(`${VK.routes.cart_add_url}.js`, { items: [{ id: gift.variant, quantity: 1 }] }); } catch (err) { giftBroken = true; throw err; }
      }
    } catch (e) { console.warn('VOLKARA: cart rules', e.message || e); }
    finally { syncBusy = false; if (syncAgain) { syncAgain = false; syncCart(); } }
  };
  VK.syncCart = syncCart;
  if (gift || insurance) {
    VK.subscribe(VK.EVENTS.cartUpdate, () => syncCart());
    // A refresh, a back/forward visit or another tab can leave the cart out of step.
    window.addEventListener('pageshow', () => syncCart());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) syncCart(); });
  }

  /* Shipping insurance switch: off until the customer turns it on. */
  document.addEventListener('click', async (e) => {
    const sw = e.target.closest('[data-insurance-toggle]'); if (!sw || !insurance || sw.disabled) return;
    const on = sw.getAttribute('aria-checked') !== 'true';
    sw.disabled = true; sw.setAttribute('aria-checked', String(on)); sw.closest('.vk-insurance')?.classList.toggle('is-on', on);
    try {
      if (on) await post(`${VK.routes.cart_add_url}.js`, { items: [{ id: insurance.variant, quantity: 1 }] });
      else if (sw.dataset.key) await post(`${VK.routes.cart_update_url}.js`, { updates: { [sw.dataset.key]: 0 } });
      else { const cart = await (await fetch(`${VK.routes.cart_url}.js`)).json(); const keys = cart.items.filter((it) => it.variant_id === insurance.variant).map((it) => it.key); if (keys.length) await post(`${VK.routes.cart_update_url}.js`, { updates: Object.fromEntries(keys.map((k) => [k, 0])) }); }
      syncCart();
    } catch (err) {
      console.warn('VOLKARA: insurance', err.message || err);
      sw.setAttribute('aria-checked', String(!on)); sw.closest('.vk-insurance')?.classList.toggle('is-on', !on); sw.disabled = false;
    }
  });

  /* ---------- Change a line's size from the cart ----------
     Shopify cannot swap a line's variant, so the line is set to 0 and the new variant added with the same
     quantity and properties. */
  document.addEventListener('change', async (e) => {
    const select = e.target.closest('[data-line-variant]'); if (!select) return;
    const row = select.closest('[data-line]'); row?.classList.add('is-loading');
    const quantity = Number(select.dataset.quantity) || 1;
    try {
      const removed = await fetch(`${VK.routes.cart_change_url}.js`, { ...VK.fetchConfig(), body: JSON.stringify({ id: select.dataset.key, quantity: 0 }) });
      if (!removed.ok) throw new Error('change failed');
      const res = await fetch(`${VK.routes.cart_add_url}.js`, { ...VK.fetchConfig(), body: JSON.stringify({ items: [{ id: Number(select.value), quantity }], sections: sectionIds(), sections_url: location.pathname }) });
      const data = await res.json();
      if (!res.ok || data.status) {
        // Put the old variant back so nothing is lost, then show why.
        await fetch(`${VK.routes.cart_add_url}.js`, { ...VK.fetchConfig(), body: JSON.stringify({ items: [{ id: Number(select.dataset.current), quantity }] }) });
        renderSections(await VK.fetchSections(location.pathname, sectionIds()));
        const err = document.querySelector(`[data-key="${select.dataset.key}"] [data-line-error]`); if (err) { err.hidden = false; err.textContent = data.description || VK.strings.cartError; }
        return;
      }
      renderSections(data.sections);
      VK.publish(VK.EVENTS.cartUpdate, { source: 'cart-items' });
    } catch (err) { console.error(err); row?.classList.remove('is-loading'); }
  });

  /* Cart note */
  document.addEventListener('input', VK.debounce((e) => {
    const note = e.target.closest('[data-cart-note]'); if (!note) return;
    fetch(`${VK.routes.cart_update_url}.js`, { ...VK.fetchConfig(), body: JSON.stringify({ note: note.value }) });
  }, 500));
})();
