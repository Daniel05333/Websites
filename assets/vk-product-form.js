/* ==========================================================================
   VOLKARA — <vk-product-form>: AJAX add to cart for product page, cards,
   spotlight and sticky ATC. Falls back to a native POST without JS.
   ========================================================================== */
(() => {
  'use strict';
  if (customElements.get('vk-product-form')) return;

  customElements.define('vk-product-form', class extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      if (!this.form || this._init) return; this._init = true;
      this.form.addEventListener('submit', (e) => this.onSubmit(e));
      this.error = this.querySelector('[data-form-error]');
    }

    async onSubmit(event) {
      const VK = window.VK; if (!VK) return;
      event.preventDefault();
      const button = event.submitter && event.submitter.type === 'submit' ? event.submitter : this.form.querySelector('[type="submit"]');
      if (!button || button.classList.contains('is-loading')) return;
      this.setError();
      button.classList.add('is-loading'); button.setAttribute('aria-busy', 'true');

      const body = new FormData(this.form, event.submitter && event.submitter.name ? event.submitter : undefined);
      body.append('sections', VK.getCartSections().join(','));
      body.append('sections_url', window.location.pathname);

      try {
        const res = await fetch(`${VK.routes.cart_add_url}.js`, { method: 'POST', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body });
        const data = await res.json();
        if (!res.ok || data.status) {
          const msg = data.description || data.message || VK.strings.cartError;
          this.setError(msg);
          VK.publish(VK.EVENTS.cartError, { source: 'product-form', message: msg });
          return;
        }
        if (VK.config.cartType === 'page') { window.location.href = VK.routes.cart_url; return; }
        VK.publish(VK.EVENTS.cartUpdate, { source: 'product-form', productVariantId: body.get('id'), item: data, sections: data.sections });
        VK.announce(VK.strings.itemAdded || '');
        button.classList.add('is-added'); setTimeout(() => button.classList.remove('is-added'), 1600);
      } catch (e) {
        console.error(e); this.setError(VK.strings.cartError);
      } finally {
        button.classList.remove('is-loading'); button.removeAttribute('aria-busy');
      }
    }

    setError(msg) {
      if (!this.error) return;
      this.error.hidden = !msg; this.error.textContent = msg || '';
    }
  });
})();
