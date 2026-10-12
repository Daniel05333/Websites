/* ==========================================================================
   VOLKARA — cart: <vk-cart-drawer>, <vk-cart-items>, bubble, note
   Re-renders via the Section Rendering API returned by /cart/add.js & /cart/change.js
   ========================================================================== */
(() => {
  'use strict';
  const VK = window.VK; if (!VK) return;
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
      if (next && cur) cur.replaceWith(next); if (count && curCount) curCount.replaceWith(count);
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

  /* Cart note */
  document.addEventListener('input', VK.debounce((e) => {
    const note = e.target.closest('[data-cart-note]'); if (!note) return;
    fetch(`${VK.routes.cart_update_url}.js`, { ...VK.fetchConfig(), body: JSON.stringify({ note: note.value }) });
  }, 500));
})();
