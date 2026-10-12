/* VOLKARA — header: announcement rotation, mega menu (hover intent + keyboard), predictive search */
(() => {
  'use strict';
  const define = (n, c) => { if (!customElements.get(n)) customElements.define(n, c); };
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Announcement bar */
  define('vk-announcement', class extends HTMLElement {
    connectedCallback() {
      this.items = [...this.querySelectorAll('.vk-announcement__item')]; if (this.items.length < 2) return;
      this.i = 0; const root = this.closest('.vk-announcement');
      root?.querySelector('[data-announce-prev]')?.addEventListener('click', () => this.show(this.i - 1));
      root?.querySelector('[data-announce-next]')?.addEventListener('click', () => this.show(this.i + 1));
      if (!reduce()) this.timer = setInterval(() => { if (!this.matches(':hover, :focus-within')) this.show(this.i + 1); }, Number(this.dataset.interval) || 5000);
      document.addEventListener('shopify:block:select', (e) => { const idx = this.items.indexOf(e.target); if (idx > -1) this.show(idx); });
    }
    disconnectedCallback() { clearInterval(this.timer); }
    show(n) {
      const prev = this.items[this.i]; this.i = (n + this.items.length) % this.items.length; const next = this.items[this.i];
      prev.classList.remove('is-active'); prev.setAttribute('aria-hidden', 'true'); next.classList.add('is-active'); next.removeAttribute('aria-hidden');
    }
  });

  /* Mega menu */
  const initMega = (root = document) => {
    root.querySelectorAll('[data-mega]').forEach((item) => {
      if (item._mega) return; item._mega = true;
      const btn = item.querySelector('.vk-nav__link'); let t;
      const open = () => { clearTimeout(t); document.querySelectorAll('[data-mega].is-open').forEach((o) => o !== item && close(o)); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('vk-mega-open'); };
      const close = (el = item) => { el.classList.remove('is-open'); el.querySelector('.vk-nav__link')?.setAttribute('aria-expanded', 'false'); if (!document.querySelector('[data-mega].is-open')) document.documentElement.classList.remove('vk-mega-open'); };
      item.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(t); t = setTimeout(open, 120); } });
      item.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { clearTimeout(t); t = setTimeout(() => close(), 220); } });
      btn.addEventListener('click', () => (item.classList.contains('is-open') ? close() : open()));
      item.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } if (e.key === 'ArrowDown' && document.activeElement === btn) { e.preventDefault(); open(); item.querySelector('.vk-mega a')?.focus(); } });
      item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) close(); });
    });
  };
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-mega]')) document.querySelectorAll('[data-mega].is-open').forEach((o) => { o.classList.remove('is-open'); o.querySelector('.vk-nav__link')?.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('vk-mega-open'); }); });
  document.addEventListener('DOMContentLoaded', () => initMega());
  if (document.readyState !== 'loading') initMega();
  document.addEventListener('shopify:section:load', (e) => initMega(e.target));

  /* Predictive search */
  define('vk-predictive-search', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.input = this.querySelector('input[type="search"]'); this.results = this.querySelector('[data-search-results]'); this.popular = this.querySelector('[data-search-popular]');
      if (!this.input || this.dataset.enabled === 'false') return;
      this.cache = new Map();
      this.input.addEventListener('input', window.VK.debounce(() => this.search(), 200));
      this.input.addEventListener('keydown', (e) => this.keys(e));
    }
    async search() {
      const q = this.input.value.trim();
      if (!q) { this.results.innerHTML = ''; this.input.setAttribute('aria-expanded', 'false'); if (this.popular) this.popular.hidden = false; return; }
      if (this.popular) this.popular.hidden = true;
      if (this.cache.has(q)) return this.render(this.cache.get(q));
      this.ctrl?.abort(); this.ctrl = new AbortController();
      this.classList.add('is-loading');
      try {
        const base = window.VK.routes.predictive_search_url || '/search/suggest';
        const url = `${base}?q=${encodeURIComponent(q)}&resources[type]=product,collection,page,article,query&resources[limit]=6&resources[options][fields]=title,product_type,variants.title,vendor&section_id=vk-predictive-search`;
        const res = await fetch(url, { signal: this.ctrl.signal });
        const html = await res.text();
        const markup = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-predictive-search-results]')?.outerHTML || '';
        this.cache.set(q, markup); this.render(markup);
      } catch (e) { if (e.name !== 'AbortError') this.results.innerHTML = ''; }
      finally { this.classList.remove('is-loading'); }
    }
    render(markup) { this.results.innerHTML = markup; this.input.setAttribute('aria-expanded', markup ? 'true' : 'false'); this.idx = -1; }
    keys(e) {
      const opts = [...this.results.querySelectorAll('[role="option"]')]; if (!opts.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); this.idx = ((this.idx ?? -1) + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
        opts.forEach((o, i) => o.setAttribute('aria-selected', String(i === this.idx))); opts[this.idx].scrollIntoView({ block: 'nearest' });
        this.input.setAttribute('aria-activedescendant', opts[this.idx].id || '');
      } else if (e.key === 'Enter' && this.idx > -1) { e.preventDefault(); opts[this.idx].click(); }
    }
  });
})();
