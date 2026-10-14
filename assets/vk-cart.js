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

  /* ---------- Free gift (e.g. the e-book) ----------
     Theme setting "Add this product free to every order". After every cart change, and once on page load, the
     cart is read from Shopify and corrected: one gift line while any other product is in the cart, none when the
     cart holds nothing else. Our own corrections never publish a cart event, so they cannot trigger themselves.
     The gift is only ever added when Shopify prices it at 0.00 — checked before adding and again in the cart. */
  const gift = VK.config.gift;
  let giftBusy = false, giftAgain = false, giftBroken = false;
  const syncGift = async () => {
    if (!gift || giftBroken) return;
    if (giftBusy) { giftAgain = true; return; }
    giftBusy = true;
    try {
      const cart = await (await fetch(`${VK.routes.cart_url}.js`, { headers: { Accept: 'application/json' } })).json();
      const lines = cart.items.filter((it) => it.variant_id === gift.variant);
      const others = cart.items.some((it) => it.variant_id !== gift.variant);
      const paid = lines.some((it) => it.final_price > 0);
      const qty = lines.reduce((n, it) => n + it.quantity, 0);
      let body = null, url = null;
      if (others && !lines.length) {
        if (gift.price !== 0 || !gift.available) { giftBroken = true; console.warn('VOLKARA: gift product skipped — it must cost 0.00 and be available.'); return; }
        url = `${VK.routes.cart_add_url}.js`; body = { items: [{ id: gift.variant, quantity: 1 }] };
      } else if (lines.length && (!others || paid)) {
        if (paid) { giftBroken = true; console.warn('VOLKARA: gift product removed — Shopify charges for it.'); }
        url = `${VK.routes.cart_update_url}.js`; body = { updates: Object.fromEntries(lines.map((it) => [it.key, 0])) };
      } else if (qty > 1) {
        url = `${VK.routes.cart_update_url}.js`; body = { updates: Object.fromEntries(lines.map((it, i) => [it.key, i === 0 ? 1 : 0])) };
      }
      if (!url) return;
      const res = await fetch(url, { ...VK.fetchConfig(), body: JSON.stringify({ ...body, sections: sectionIds(), sections_url: location.pathname }) });
      const data = await res.json();
      if (!res.ok || data.status) { giftBroken = true; console.warn('VOLKARA: gift product could not be updated', data.description || data.message); return; }
      renderSections(data.sections);
      if (document.querySelector('.vk-main-cart') && !data.sections?.['vk-main-cart']) location.reload();
    } catch (e) { console.error(e); }
    finally { giftBusy = false; if (giftAgain) { giftAgain = false; syncGift(); } }
  };
  VK.syncGift = syncGift;
  if (gift) {
    VK.subscribe(VK.EVENTS.cartUpdate, () => syncGift());
    // A refresh, a back/forward visit or another tab can leave the cart out of step.
    window.addEventListener('pageshow', () => syncGift());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) syncGift(); });
  }

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
