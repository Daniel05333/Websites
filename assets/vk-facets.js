/* ==========================================================================
   VOLKARA — collection filtering, sorting, density and load more (Section Rendering API)
   ========================================================================== */
(() => {
  'use strict';
  const VK = window.VK; if (!VK || customElements.get('vk-facets')) return;

  customElements.define('vk-facets', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.sectionId = this.dataset.sectionId;
      this.form = this.querySelector('[data-facets-form]');
      this.onChange = VK.debounce(() => this.apply(), 450);
      this.addEventListener('change', (e) => {
        if (e.target.closest('[data-facets-form]') || e.target.matches('[data-sort]')) { if (e.target.matches('[data-sort]')) this.apply(); else this.onChange(); }
      });
      this.addEventListener('input', (e) => { if (e.target.matches('[data-price-min], [data-price-max]')) this.onChange(); });
      this.addEventListener('click', (e) => {
        const rm = e.target.closest('[data-facet-remove]'); if (rm) { e.preventDefault(); this.load(rm.href); return; }
        const more = e.target.closest('[data-loadmore-btn]'); if (more) { e.preventDefault(); this.loadMore(more); return; }
        const dens = e.target.closest('[data-density]'); if (dens) this.setDensity(dens.dataset.density);
      });
      window.addEventListener('popstate', () => this.load(location.href, false));
      let saved; try { saved = localStorage.getItem(this.dataset.densityKey); } catch (_) {}
      if (saved) this.setDensity(saved, false);
    }

    params() {
      const fd = new FormData(this.form || undefined);
      const sort = this.querySelector('[data-sort]'); if (sort) fd.set('sort_by', sort.value);
      const p = new URLSearchParams();
      for (const [k, v] of fd.entries()) if (v !== '') p.append(k, v);
      return p;
    }
    apply() { this.load(`${location.pathname}?${this.params().toString()}`); }

    async load(url, push = true) {
      const u = new URL(url, location.origin);
      this.classList.add('is-loading');
      try {
        const html = await (await fetch(VK.sectionUrl(u.toString(), this.sectionId))).text();
        const doc = VK.parseHTML(html);
        ['[data-results]', '[data-active-filters]', '[data-facet-count]', '[data-facet-apply]'].forEach((sel) => {
          const next = doc.querySelector(sel); const cur = this.querySelector(sel); if (next && cur) cur.replaceWith(next);
        });
        const nextBody = doc.querySelector('[data-facets-body]'); const curBody = this.querySelector('[data-facets-body]');
        if (nextBody && curBody) {
          const openIds = [...curBody.querySelectorAll('details[open]')].map((d) => d.dataset.facet);
          const focusName = document.activeElement?.name, focusVal = document.activeElement?.value;
          curBody.innerHTML = nextBody.innerHTML;
          curBody.querySelectorAll('details[data-facet]').forEach((d) => { d.open = openIds.includes(d.dataset.facet); });
          this.form = this.querySelector('[data-facets-form]');
          if (focusName) curBody.querySelector(`[name="${CSS.escape(focusName)}"][value="${CSS.escape(focusVal || '')}"]`)?.focus({ preventScroll: true });
        }
        if (push) history.pushState({}, '', u.pathname + u.search);
        window.VKMotion?.init(this);
        VK.announce(this.querySelector('[data-facet-count]')?.textContent || '');
      } catch (e) { console.error(e); location.href = u.toString(); }
      finally { this.classList.remove('is-loading'); }
    }

    async loadMore(btn) {
      btn.classList.add('is-loading');
      try {
        const html = await (await fetch(VK.sectionUrl(btn.href, this.sectionId))).text();
        const doc = VK.parseHTML(html);
        const grid = this.querySelector('[data-grid]');
        doc.querySelectorAll('[data-grid] > [data-grid-item]').forEach((li) => grid.append(li));
        const next = doc.querySelector('[data-loadmore]'); const cur = this.querySelector('[data-loadmore]');
        if (next && cur) cur.replaceWith(next); else cur?.remove();
        history.replaceState({}, '', new URL(btn.href, location.origin).pathname + new URL(btn.href, location.origin).search);
        window.VKMotion?.init(grid);
      } catch (e) { console.error(e); location.href = btn.href; }
    }

    setDensity(n, save = true) {
      const grid = this.querySelector('[data-grid]'); if (grid) grid.style.setProperty('--vk-cols-lg', n);
      this.querySelectorAll('[data-density]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.density === String(n))));
      if (save) { try { localStorage.setItem(this.dataset.densityKey, n); } catch (_) {} }
    }
  });

  /* Dual-thumb price range */
  if (!customElements.get('vk-price-range')) customElements.define('vk-price-range', class extends HTMLElement {
    connectedCallback() {
      const rMin = this.querySelector('[data-range-min]'), rMax = this.querySelector('[data-range-max]');
      const iMin = this.querySelector('[data-price-min]'), iMax = this.querySelector('[data-price-max]');
      if (!rMin) return;
      const paint = () => { const max = Number(this.dataset.max) || 1; this.style.setProperty('--a', `${(rMin.value / max) * 100}%`); this.style.setProperty('--b', `${(rMax.value / max) * 100}%`); };
      rMin.addEventListener('input', () => { if (+rMin.value > +rMax.value) rMin.value = rMax.value; iMin.value = rMin.value; paint(); iMin.dispatchEvent(new Event('input', { bubbles: true })); });
      rMax.addEventListener('input', () => { if (+rMax.value < +rMin.value) rMax.value = rMin.value; iMax.value = rMax.value; paint(); iMax.dispatchEvent(new Event('input', { bubbles: true })); });
      iMin.addEventListener('change', () => { rMin.value = iMin.value || 0; paint(); });
      iMax.addEventListener('change', () => { rMax.value = iMax.value || rMax.max; paint(); });
      paint();
    }
  });
})();
