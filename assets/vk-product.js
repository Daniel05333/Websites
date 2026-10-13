/* ==========================================================================
   VOLKARA — product page: variant picker, gallery + lightbox, bundle tiers,
   sticky ATC, recommendations, share
   ========================================================================== */
(() => {
  'use strict';
  const VK = window.VK; if (!VK) return;
  const define = (n, c) => { if (!customElements.get(n)) customElements.define(n, c); };
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Product info (state owner) ---------- */
  define('vk-product-info', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      try { this.product = JSON.parse(this.querySelector('[data-product-json]').textContent); } catch (e) { return; }
      this.section = this.closest('.vk-pdp');
      this.idInput = this.querySelector('[data-variant-id]');
      this.variant = this.product.variants.find((v) => String(v.id) === this.idInput?.value) || this.product.variants[0];
      this.tier = this.querySelector('[data-tier-input]:checked')?.value || 'single';
      this.addEventListener('change', (e) => {
        // Size pills can live inside the first bundle card, so check them first.
        if (e.target.closest('vk-variant-picker')) { this.onOptionChange(); return; }
        if (e.target.matches('[data-tier-input]')) { this.tier = e.target.value; this.syncTier(); }
      });
      // The sticky bar lives in <body> (see vk-sticky-atc), so listen on the document.
      this.sectionId = this.section?.dataset.sectionId;
      document.addEventListener('change', (e) => { if (e.target.matches('[data-sticky-variant]') && e.target.closest(`vk-sticky-atc[data-section="${this.sectionId}"]`)) this.selectVariant(this.product.variants.find((v) => String(v.id) === e.target.value)); });
      // Other sections (e.g. the pan explorer CTA) can pick a tier: they dispatch vk:select-tier on the document.
      this.onSelectTier = (e) => { const r = this.querySelector(`[data-tier-input][value="${e.detail?.tier}"]`); if (r && !r.disabled) { r.checked = true; this.tier = r.value; this.syncTier(); } };
      document.addEventListener('vk:select-tier', this.onSelectTier);
      this.syncTier();
    }
    onOptionChange() {
      const picker = this.querySelector('vk-variant-picker');
      const selected = [...picker.querySelectorAll('fieldset')].map((fs) => fs.querySelector('input:checked')?.value);
      const match = this.product.variants.find((v) => v.options.every((o, i) => o === selected[i]));
      picker.querySelectorAll('fieldset').forEach((fs, i) => { const out = fs.querySelector('[data-option-value]'); if (out) out.textContent = selected[i] || ''; });
      this.selectVariant(match);
    }
    selectVariant(v) {
      this.variant = v;
      const label = this.querySelector('[data-atc-label]'); const btn = this.querySelector('[data-atc]');
      if (!v) { if (btn) btn.disabled = true; if (label) label.textContent = VK.strings.unavailable; this.syncSticky(); return; }
      if (this.idInput) this.idInput.value = v.id;
      const url = new URL(location.href); url.searchParams.set('variant', v.id); history.replaceState({}, '', url);
      // sticky select sync + picker sync
      const sel = this.stickyBar()?.querySelector('[data-sticky-variant]'); if (sel) sel.value = v.id;
      const picker = this.querySelector('vk-variant-picker');
      picker?.querySelectorAll('fieldset').forEach((fs, i) => { const r = [...fs.querySelectorAll('input')].find((x) => x.value === v.options[i]); if (r) r.checked = true; const out = fs.querySelector('[data-option-value]'); if (out) out.textContent = v.options[i]; });
      if (v.featured_media) this.section?.querySelector('vk-product-gallery')?.goToMedia(v.featured_media);
      this.syncTier();
      VK.publish(VK.EVENTS.variantChange, { variant: v, product: this.product });
    }
    syncTier() {
      const v = this.variant; const bp = this.querySelector('vk-bundle-picker'); const inputs = this.querySelector('[data-bundle-inputs]');
      const btn = this.querySelector('[data-atc]'); const label = this.querySelector('[data-atc-label]'); const qty = this.querySelector('vk-product-form input[name="quantity"]');
      let price = v ? v.price : 0, compare = v ? v.compare_at_price || 0 : 0, available = !!(v && v.available);
      let config = v && !this.product.variants.every((x) => x === v) && v.title !== 'Default Title' ? v.title : '';
      if (inputs) inputs.innerHTML = '';
      if (this.idInput) this.idInput.disabled = false; if (qty) qty.disabled = false;
      if (bp && bp.data) {
        // The add-on (e.g. a lid) is only offered in the exact same size as the selected variant.
        const addon = bp.data.addon && v ? bp.data.addon.variants.find((a) => a.option1 === v.options[0] && a.available) : null;
        const addonTier = bp.querySelector('[data-tier="addon"]');
        if (addonTier) {
          addonTier.hidden = !addon;
          if (!addon && this.tier === 'addon') { this.tier = 'single'; const single = bp.querySelector('input[value="single"]'); if (single) single.checked = true; }
        }
        // Only the selected card is expanded; collapsed panels leave the tab order.
        bp.querySelectorAll('[data-tier-card]').forEach((card) => {
          const on = card.dataset.tierCard === this.tier;
          card.classList.toggle('is-active', on);
          const panel = card.querySelector('.vk-bundle__panel'); if (panel) panel.inert = !on;
          if (on) config = [card.dataset.tierName, this.tier === 'single' || this.tier === 'addon' ? config : ''].filter(Boolean).join(' · ');
        });
        const singleCompare = bp.querySelector('[data-tier-compare="single"]');
        if (singleCompare && v) { const sale = v.compare_at_price > v.price; singleCompare.hidden = !sale; if (sale) singleCompare.textContent = VK.formatMoney(v.compare_at_price); }
        const addonPrice = bp.querySelector('[data-tier-price="addon"]'); if (addonPrice && v && addon) addonPrice.textContent = VK.formatMoney(v.price + addon.price);
        const singlePrice = bp.querySelector('[data-tier-price="single"]'); if (singlePrice && v) singlePrice.textContent = VK.formatMoney(v.price);
        if (this.tier === 'addon' && addon && v) {
          this.idInput.disabled = true; if (qty) qty.disabled = true;
          inputs.innerHTML = `<input type="hidden" name="items[0][id]" value="${v.id}"><input type="hidden" name="items[0][quantity]" value="1"><input type="hidden" name="items[1][id]" value="${addon.id}"><input type="hidden" name="items[1][quantity]" value="1">`;
          price = v.price + addon.price; compare = 0; available = v.available && addon.available;
        } else if ((this.tier === 'bundle' || this.tier === 'bundle2') && bp.data[this.tier]) {
          const bundle = bp.data[this.tier];
          this.idInput.disabled = true;
          inputs.innerHTML = `<input type="hidden" name="id" value="${bundle.id}">`;
          price = bundle.price; compare = bundle.compare; available = bundle.available;
        }
      }
      this.renderPrice(price, compare);
      if (btn) btn.disabled = !available;
      if (label) label.textContent = available ? `${VK.strings.addToBag || VK.strings.addToCart} · ${VK.formatMoney(price)}` : (v ? VK.strings.soldOut : VK.strings.unavailable);
      this.price = price; this.available = available; this.config = config; this.syncSticky();
    }
    renderPrice(price, compare) {
      const root = this.querySelector('[data-pdp-price]'); if (!root) return;
      root.querySelector('[data-price-current]').textContent = VK.formatMoney(price);
      const cmp = root.querySelector('[data-price-compare]'); const save = root.querySelector('[data-price-save]');
      const onSale = compare > price;
      root.querySelector('.vk-price__compare')?.toggleAttribute('hidden', !onSale); save?.toggleAttribute('hidden', !onSale);
      if (cmp && onSale) cmp.textContent = VK.formatMoney(compare);
      if (save && onSale) save.textContent = VK.t('save', { amount: VK.formatMoney(compare - price) });
    }
    stickyBar() { return document.querySelector(`vk-sticky-atc[data-section="${this.sectionId}"]`); }
    syncSticky() {
      const sticky = this.stickyBar(); if (!sticky) return;
      const p = sticky.querySelector('[data-sticky-price]'); if (p) p.textContent = VK.formatMoney(this.price ?? this.variant?.price ?? 0);
      const b = sticky.querySelector('[data-sticky-btn]'); if (b) b.disabled = !this.available;
      const c = sticky.querySelector('[data-sticky-config]'); if (c) { c.textContent = this.config || ''; c.hidden = !this.config; }
    }
  });

  /* ---------- Bundle picker data ---------- */
  define('vk-bundle-picker', class extends HTMLElement {
    connectedCallback() { try { this.data = JSON.parse(this.querySelector('[data-bundle-json]').textContent); } catch (_) { this.data = null; } }
  });
  define('vk-variant-picker', class extends HTMLElement {});

  /* ---------- Gallery ---------- */
  define('vk-product-gallery', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.track = this.querySelector('[data-gallery-track]'); this.slides = [...this.track.children];
      this.thumbs = [...this.querySelectorAll('[data-gallery-thumb]')];
      this.counter = this.querySelector('[data-gallery-counter]'); this.progress = this.querySelector('[data-gallery-progress]');
      this.querySelector('[data-gallery-prev]')?.addEventListener('click', () => this.go(this.index - 1));
      this.querySelector('[data-gallery-next]')?.addEventListener('click', () => this.go(this.index + 1));
      this.thumbs.forEach((t) => t.addEventListener('click', () => this.go(Number(t.dataset.galleryThumb))));
      this.track.addEventListener('scroll', VK.throttle(() => this.sync(), 80), { passive: true });
      this.index = Math.max(0, this.slides.findIndex((s) => s.classList.contains('is-active')));
      if (this.index > 0) requestAnimationFrame(() => this.go(this.index, 'auto'));
      this.lightbox = this.querySelector('.vk-lightbox');
      this.addEventListener('click', (e) => { const o = e.target.closest('[data-gallery-open]'); if (o) this.openLightbox(Number(o.dataset.galleryOpen), o); });
      this.lightbox?.addEventListener('click', (e) => { const img = e.target.closest('[data-zoomable]'); if (img) this.toggleZoom(img, e); });
      this.sync();
    }
    go(i, behavior) { const n = this.slides.length; this.index = (i + n) % n; this.track.scrollTo({ left: this.slides[this.index].offsetLeft, behavior: behavior || (reduce() ? 'auto' : 'smooth') }); this.sync(this.index); }
    goToMedia(id) { const i = this.slides.findIndex((s) => s.dataset.mediaId === String(id)); if (i > -1) this.go(i); }
    sync(force) {
      const i = force ?? Math.round(this.track.scrollLeft / Math.max(1, this.track.clientWidth)); this.index = i;
      this.slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
      this.thumbs.forEach((t, j) => { t.classList.toggle('is-active', j === i); t.toggleAttribute('aria-current', j === i); });
      const n = this.slides.length; if (this.counter) this.counter.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
      if (this.progress) this.progress.style.transform = `scaleX(${(i + 1) / n})`;
    }
    openLightbox(i, trigger) {
      if (!this.lightbox) return; this.lightbox.open(trigger);
      const slide = this.lightbox.querySelector(`.vk-lightbox__slide[data-index="${i}"]`); slide?.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });
    }
    toggleZoom(img, e) {
      const on = img.classList.toggle('is-zoomed');
      if (on) { const r = img.getBoundingClientRect(); img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; }
    }
  });

  /* ---------- Sticky ATC ---------- */
  define('vk-sticky-atc', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const section = this.closest('.vk-pdp') || document.getElementById(`vk-${this.dataset.section}`);
      const main = section?.querySelector('[data-atc]'); if (!main) return;
      // Sections are isolated stacking contexts, so a fixed bar inside one sits under later (stacked) sections.
      // Move it to <body>, keeping the section's colour scheme, and drop a stale copy left by an editor re-render.
      if (this.parentElement !== document.body) {
        document.querySelectorAll(`body > vk-sticky-atc[data-section="${this.dataset.section}"]`).forEach((old) => old !== this && old.remove());
        [...section.classList].filter((c) => c.startsWith('color-')).forEach((c) => this.classList.add(c));
        document.body.appendChild(this);
      }
      const footer = document.querySelector('.vk-footer');
      let mainVisible = true, footerVisible = false;
      const update = () => { const show = !mainVisible && !footerVisible && main.isConnected && main.getBoundingClientRect().top < 0; this.classList.toggle('is-visible', show); this.setAttribute('aria-hidden', String(!show)); this.querySelectorAll('[tabindex]').forEach((el) => el.tabIndex = show ? 0 : -1); };
      new IntersectionObserver(([en]) => { mainVisible = en.isIntersecting; update(); }).observe(main);
      if (footer) new IntersectionObserver(([en]) => { footerVisible = en.isIntersecting; update(); }).observe(footer);
    }
  });

  /* ---------- Recommendations (related / complementary) ---------- */
  define('vk-recommendations', class extends HTMLElement {
    connectedCallback() {
      if (this._init || !this.dataset.url) return; this._init = true;
      if (this.querySelector('[data-complementary-list] > *, [data-recs-list] > *')) return;
      const io = new IntersectionObserver(async ([en]) => {
        if (!en.isIntersecting) return; io.disconnect();
        try {
          const html = await (await fetch(this.dataset.url)).text();
          const doc = VK.parseHTML(html);
          const fresh = doc.querySelector(this.tagName.toLowerCase() + `[data-url]`);
          if (fresh && fresh.innerHTML.trim()) { this.innerHTML = fresh.innerHTML; window.VKMotion?.init(this); }
          if (!this.querySelector('li')) this.closest('[data-recs-section]')?.setAttribute('hidden', '');
        } catch (e) { console.error(e); }
      }, { rootMargin: '0px 0px 400px 0px' });
      io.observe(this);
    }
  });

  /* ---------- Share ---------- */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-share-url]'); if (!btn) return;
    const url = btn.dataset.shareUrl; const title = btn.dataset.shareTitle;
    try { if (navigator.share) await navigator.share({ url, title }); else { await navigator.clipboard.writeText(url); const l = btn.querySelector('[data-share-label]'); if (l) { const prev = l.textContent; l.textContent = VK.strings.copied; setTimeout(() => (l.textContent = prev), 1800); } } } catch (_) {}
  });
})();
