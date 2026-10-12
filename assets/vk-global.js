/* ==========================================================================
   VOLKARA — global utilities & generic custom elements
   window.VK: config, utils, pubsub, section rendering, focus management
   Elements: vk-drawer, vk-accordion, vk-slider, vk-quantity, vk-tabs,
             vk-countdown, vk-video, vk-marquee
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Config ---------- */
  let config = {};
  try { config = JSON.parse(document.getElementById('vk-config')?.textContent || '{}'); } catch (e) { console.warn('[VK] invalid #vk-config', e); }

  const listeners = new Map();
  const cartSections = new Set(['vk-cart-drawer', 'vk-cart-icon-bubble']);
  const focusables = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary, iframe, video[controls]';

  const VK = (window.VK = Object.assign(window.VK || {}, {
    config,
    routes: config.routes || { cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update', cart_url: '/cart', root_url: '/' },
    moneyFormat: config.moneyFormat || '€{{amount_with_comma_separator}}',
    strings: config.strings || {},
    EVENTS: { cartUpdate: 'cart:update', cartError: 'cart:error', variantChange: 'variant:change', drawerOpen: 'drawer:open', drawerClose: 'drawer:close' },

    debounce(fn, ms = 250) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; },
    throttle(fn, ms = 100) { let last = 0, t; return (...a) => { const now = Date.now(); const run = () => { last = now; fn(...a); }; if (now - last >= ms) run(); else { clearTimeout(t); t = setTimeout(run, ms - (now - last)); } }; },
    fetchConfig(type = 'json') { return { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: `application/${type}`, 'X-Requested-With': 'XMLHttpRequest' } }; },
    prefersReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; },
    t(key, vars = {}) { let s = VK.strings[key] || ''; for (const [k, v] of Object.entries(vars)) s = s.split(`{{ ${k} }}`).join(v); return s; },

    formatMoney(cents, format = VK.moneyFormat) {
      if (typeof cents === 'string') cents = cents.replace('.', '');
      cents = Number(cents) || 0;
      const fmt = (n, decimals = 2, thousands = ',', decimal = '.') => {
        const fixed = (n / 100).toFixed(decimals).split('.');
        return fixed[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousands}`) + (fixed[1] ? decimal + fixed[1] : '');
      };
      return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => ({
        amount: fmt(cents, 2), amount_no_decimals: fmt(cents, 0),
        amount_with_comma_separator: fmt(cents, 2, '.', ','), amount_no_decimals_with_comma_separator: fmt(cents, 0, '.', ','),
        amount_with_apostrophe_separator: fmt(cents, 2, "'", '.'), amount_with_space_separator: fmt(cents, 2, ' ', ','),
      }[key] ?? fmt(cents, 2)));
    },

    /* PubSub */
    subscribe(event, cb) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(cb); return () => listeners.get(event)?.delete(cb); },
    publish(event, data) { listeners.get(event)?.forEach((cb) => { try { cb(data); } catch (e) { console.error(e); } }); document.dispatchEvent(new CustomEvent(`vk:${event}`, { detail: data })); },
    registerCartSections(ids = []) { ids.forEach((id) => cartSections.add(id)); },
    getCartSections() { return [...cartSections].filter((id) => id === 'vk-cart-icon-bubble' || document.getElementById(`shopify-section-${id}`) || id === 'vk-cart-drawer'); },

    /* Section Rendering API */
    sectionUrl(url, sectionId) { const u = new URL(url, location.origin); u.searchParams.set('section_id', sectionId); return u.toString(); },
    async fetchSections(url, ids) {
      const u = new URL(url || location.href, location.origin); u.searchParams.set('sections', ids.join(','));
      const res = await fetch(u.toString(), { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Sections request failed: ${res.status}`);
      return res.json();
    },
    parseHTML(html) { return new DOMParser().parseFromString(html, 'text/html'); },
    sectionInner(html, selector) { const doc = VK.parseHTML(html); return selector ? doc.querySelector(selector) : doc.querySelector('.shopify-section') || doc.body; },

    /* Focus */
    trapFocus(container, elementToFocus = container) {
      VK.removeTrapFocus();
      const els = () => [...container.querySelectorAll(focusables)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      VK._trap = (e) => {
        if (e.key !== 'Tab') return;
        const list = els(); if (!list.length) { e.preventDefault(); return; }
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      document.addEventListener('keydown', VK._trap);
      requestAnimationFrame(() => (elementToFocus || els()[0] || container).focus({ preventScroll: true }));
    },
    removeTrapFocus(elementToFocus) { if (VK._trap) document.removeEventListener('keydown', VK._trap); VK._trap = null; elementToFocus?.focus?.({ preventScroll: true }); },

    /* Scroll lock (compensates scrollbar width) */
    _locks: 0,
    lockScroll() { if (VK._locks++ === 0) { const w = window.innerWidth - document.documentElement.clientWidth; document.documentElement.style.setProperty('--vk-scrollbar-w', `${w}px`); document.body.style.paddingRight = `${w}px`; document.documentElement.classList.add('vk-scroll-locked'); } },
    unlockScroll() { VK._locks = Math.max(0, VK._locks - 1); if (VK._locks === 0) { document.body.style.paddingRight = ''; document.documentElement.classList.remove('vk-scroll-locked'); } },

    announce(msg) { let el = document.getElementById('vk-live'); if (!el) { el = Object.assign(document.createElement('div'), { id: 'vk-live', className: 'vk-live' }); el.setAttribute('aria-live', 'polite'); el.setAttribute('role', 'status'); document.body.append(el); } el.textContent = ''; setTimeout(() => (el.textContent = msg), 60); },
  }));

  const define = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };

  /* ---------- vk-drawer ---------- */
  class VKDrawer extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.setAttribute('aria-hidden', this.hasAttribute('open') ? 'false' : 'true');
      this.addEventListener('click', (e) => { if (e.target.closest('[data-drawer-close]') || e.target.classList.contains('vk-drawer__overlay')) this.close(); });
    }
    get panel() { return this.querySelector('.vk-drawer__panel') || this; }
    open(trigger) {
      if (this.hasAttribute('open')) return;
      this._trigger = trigger || document.activeElement;
      this.setAttribute('open', ''); this.setAttribute('aria-hidden', 'false');
      document.querySelectorAll(`[data-drawer-open="${this.id}"]`).forEach((t) => t.setAttribute('aria-expanded', 'true'));
      VK.lockScroll();
      this._esc = (e) => { if (e.key === 'Escape') this.close(); };
      document.addEventListener('keydown', this._esc);
      VK.trapFocus(this.panel, this.querySelector('[data-drawer-autofocus]') || this.panel);
      VK.publish(VK.EVENTS.drawerOpen, { id: this.id, drawer: this });
      this.dispatchEvent(new CustomEvent('vk:open'));
    }
    close() {
      if (!this.hasAttribute('open')) return;
      this.removeAttribute('open'); this.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', this._esc);
      document.querySelectorAll(`[data-drawer-open="${this.id}"]`).forEach((t) => t.setAttribute('aria-expanded', 'false'));
      VK.unlockScroll(); VK.removeTrapFocus(this._trigger);
      VK.publish(VK.EVENTS.drawerClose, { id: this.id, drawer: this });
      this.dispatchEvent(new CustomEvent('vk:close'));
    }
    toggle(trigger) { this.hasAttribute('open') ? this.close() : this.open(trigger); }
  }
  define('vk-drawer', VKDrawer);

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-drawer-open]');
    if (!trigger) return;
    const drawer = document.getElementById(trigger.dataset.drawerOpen);
    if (!drawer || typeof drawer.open !== 'function') return;
    e.preventDefault(); drawer.toggle(trigger);
  });

  /* ---------- vk-accordion (animated <details>) ---------- */
  class VKAccordion extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.addEventListener('click', (e) => {
        const summary = e.target.closest('summary'); if (!summary || !this.contains(summary)) return;
        const details = summary.parentElement; if (details.closest('vk-accordion') !== this) return;
        e.preventDefault();
        details.open ? this.collapse(details) : this.expand(details);
      });
    }
    expand(details) {
      if (this.hasAttribute('data-single')) this.querySelectorAll(':scope details[open]').forEach((d) => d !== details && d.closest('vk-accordion') === this && this.collapse(d));
      const content = details.querySelector(':scope > :not(summary)');
      details.open = true;
      this.dispatchEvent(new CustomEvent('vk:toggle', { detail: { details, open: true }, bubbles: true }));
      if (!content || VK.prefersReducedMotion()) return;
      const h = content.scrollHeight;
      content.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    collapse(details) {
      const content = details.querySelector(':scope > :not(summary)');
      this.dispatchEvent(new CustomEvent('vk:toggle', { detail: { details, open: false }, bubbles: true }));
      if (!content || VK.prefersReducedMotion()) { details.open = false; return; }
      const anim = content.animate([{ height: `${content.scrollHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.65,0,.35,1)' });
      anim.onfinish = () => (details.open = false);
    }
  }
  define('vk-accordion', VKAccordion);

  /* ---------- vk-slider ---------- */
  class VKSlider extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.track = this.querySelector('[data-slider-track]'); if (!this.track) return;
      this.prev = this.querySelector('[data-slider-prev]'); this.next = this.querySelector('[data-slider-next]');
      this.progress = this.querySelector('[data-slider-progress]'); this.count = this.querySelector('[data-slider-count]');
      this.prev?.addEventListener('click', () => this.go(-1));
      this.next?.addEventListener('click', () => this.go(1));
      this.update = this.update.bind(this);
      this.track.addEventListener('scroll', VK.throttle(this.update, 60), { passive: true });
      this.ro = new ResizeObserver(this.update); this.ro.observe(this.track);
      this.track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); } });
      if (window.matchMedia('(pointer: fine)').matches) this.enableDrag();
      if (this.hasAttribute('data-autoplay') && !VK.prefersReducedMotion()) this.autoplay(Number(this.dataset.autoplay) || 6000);
      this.update();
    }
    disconnectedCallback() { this.ro?.disconnect(); clearInterval(this._auto); }
    get slides() { return [...this.track.children].filter((el) => el.offsetParent !== null); }
    step() { const s = this.slides; if (s.length < 2) return this.track.clientWidth; return s[1].offsetLeft - s[0].offsetLeft; }
    go(dir) { this.track.scrollBy({ left: dir * this.step() * Math.max(1, Math.floor(this.track.clientWidth / this.step())), behavior: VK.prefersReducedMotion() ? 'auto' : 'smooth' }); }
    scrollToSlide(el) { if (el) this.track.scrollTo({ left: el.offsetLeft - parseFloat(getComputedStyle(this.track).scrollPaddingLeft || 0), behavior: 'smooth' }); }
    update() {
      const max = this.track.scrollWidth - this.track.clientWidth; const x = this.track.scrollLeft;
      const ratio = this.track.scrollWidth ? Math.min(1, this.track.clientWidth / this.track.scrollWidth) : 1;
      const p = max > 0 ? x / max : 1;
      this.progress?.style.setProperty('--vk-slider-progress', String(ratio + (1 - ratio) * p)); this.progress?.style.setProperty('transform', `scaleX(${ratio + (1 - ratio) * p})`);
      if (this.prev) this.prev.disabled = x <= 4; if (this.next) this.next.disabled = x >= max - 4;
      this.toggleAttribute('data-scrollable', max > 4);
      if (this.count) { const s = this.slides; const idx = Math.min(s.length, Math.round(x / (this.step() || 1)) + 1); this.count.textContent = `${String(idx).padStart(2, '0')} / ${String(s.length).padStart(2, '0')}`; }
    }
    enableDrag() {
      let down = false, startX = 0, startScroll = 0, moved = false;
      this.track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; startX = e.clientX; startScroll = this.track.scrollLeft; });
      window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 6) { moved = true; this.track.classList.add('is-dragging'); } if (moved) this.track.scrollLeft = startScroll - dx; });
      window.addEventListener('pointerup', () => { if (!down) return; down = false; if (moved) { this.track.classList.remove('is-dragging'); const step = this.step(); this.track.scrollTo({ left: Math.round(this.track.scrollLeft / step) * step, behavior: 'smooth' }); } });
      this.track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    }
    autoplay(ms) {
      const tick = () => { if (this.matches(':hover, :focus-within')) return; const max = this.track.scrollWidth - this.track.clientWidth; this.track.scrollLeft >= max - 4 ? this.track.scrollTo({ left: 0, behavior: 'smooth' }) : this.go(1); };
      this._auto = setInterval(tick, ms);
    }
  }
  define('vk-slider', VKSlider);

  /* ---------- vk-quantity ---------- */
  class VKQuantity extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.input = this.querySelector('input');
      this.addEventListener('click', (e) => {
        const btn = e.target.closest('button[name]'); if (!btn || !this.input) return; e.preventDefault();
        const step = Number(this.input.step) || 1, min = Number(this.input.min) || 0, max = this.input.max ? Number(this.input.max) : Infinity;
        const prev = Number(this.input.value) || 0;
        const val = Math.min(max, Math.max(min, prev + (btn.name === 'plus' ? step : -step)));
        if (val !== prev) { this.input.value = val; this.input.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }
  }
  define('vk-quantity', VKQuantity);

  /* ---------- vk-tabs ---------- */
  class VKTabs extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.tabs = [...this.querySelectorAll('[role="tab"]')];
      this.tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => this.select(i));
        tab.addEventListener('keydown', (e) => {
          const map = { ArrowRight: 1, ArrowLeft: -1 }; if (!(e.key in map)) return; e.preventDefault();
          const next = (i + map[e.key] + this.tabs.length) % this.tabs.length; this.select(next); this.tabs[next].focus();
        });
      });
    }
    select(i) {
      this.tabs.forEach((t, j) => {
        const on = i === j; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; t.classList.toggle('is-active', on);
        const panel = document.getElementById(t.getAttribute('aria-controls')); if (panel) panel.hidden = !on;
      });
      this.dispatchEvent(new CustomEvent('vk:tab', { detail: { index: i }, bubbles: true }));
    }
  }
  define('vk-tabs', VKTabs);

  /* ---------- vk-countdown ---------- */
  class VKCountdown extends HTMLElement {
    connectedCallback() {
      const end = Date.parse(this.dataset.end || '');
      if (!end || end <= Date.now()) { this.closest('[data-countdown-wrapper]')?.remove(); this.remove(); return; }
      this.end = end; this.tick(); this._t = setInterval(() => this.tick(), 1000);
    }
    disconnectedCallback() { clearInterval(this._t); }
    tick() {
      let s = Math.max(0, Math.floor((this.end - Date.now()) / 1000));
      if (s === 0) { clearInterval(this._t); this.closest('[data-countdown-wrapper]')?.remove(); return; }
      const parts = { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
      for (const [k, v] of Object.entries(parts)) { const el = this.querySelector(`[data-${k}]`); if (el) el.textContent = String(v).padStart(2, '0'); }
    }
  }
  define('vk-countdown', VKCountdown);

  /* ---------- vk-video (plays when visible) ---------- */
  class VKVideo extends HTMLElement {
    connectedCallback() {
      this.video = this.querySelector('video'); if (!this.video) return;
      if (VK.prefersReducedMotion() && !this.hasAttribute('data-force')) { this.video.removeAttribute('autoplay'); this.video.pause(); return; }
      this.io = new IntersectionObserver(([en]) => { if (en.isIntersecting && !this.hasAttribute('data-hover-only')) this.video.play().catch(() => {}); else if (!en.isIntersecting) this.video.pause(); }, { threshold: .5 });
      this.io.observe(this);
      if (this.hasAttribute('data-hover-only')) { this.addEventListener('pointerenter', () => this.video.play().catch(() => {})); this.addEventListener('pointerleave', () => this.video.pause()); }
    }
    disconnectedCallback() { this.io?.disconnect(); }
  }
  define('vk-video', VKVideo);

  /* ---------- vk-marquee (seamless loop) ---------- */
  class VKMarquee extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const track = this.querySelector('.vk-marquee__track'); const group = track?.querySelector('.vk-marquee__group'); if (!group) return;
      const fill = () => {
        track.querySelectorAll('[data-clone]').forEach((c) => c.remove());
        const reps = Math.max(1, Math.ceil((this.clientWidth * 1.2) / Math.max(1, group.scrollWidth)));
        const frag = document.createDocumentFragment();
        for (let i = 0; i < reps * 2 - 1; i++) { const c = group.cloneNode(true); c.setAttribute('data-clone', ''); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('a,button').forEach((a) => a.setAttribute('tabindex', '-1')); frag.append(c); }
        track.append(frag);
        const speed = Number(this.getAttribute('speed')) || 40;
        track.style.setProperty('--vk-marquee-duration', `${(group.scrollWidth * reps) / speed}s`);
        if (this.getAttribute('direction') === 'right') track.style.setProperty('--vk-marquee-direction', 'reverse');
      };
      fill(); new ResizeObserver(VK.debounce(fill, 200)).observe(this);
    }
  }
  define('vk-marquee', VKMarquee);

  /* ---------- Footer menus collapse on mobile ---------- */
  const collapseFooter = () => { if (window.innerWidth < 750) document.querySelectorAll('.vk-footer__details[open]').forEach((d) => d.removeAttribute('open')); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', collapseFooter) : collapseFooter();

  /* ---------- Theme editor: open drawers/blocks when selected ---------- */
  document.addEventListener('shopify:block:select', (e) => {
    const block = e.target; const slider = block.closest('vk-slider'); slider?.scrollToSlide?.(block.closest('[data-slider-track] > *'));
    const details = block.matches('details') ? block : block.querySelector('details'); if (details && !details.open) details.open = true;
  });
  document.addEventListener('shopify:section:select', (e) => { const d = e.target.querySelector('vk-drawer'); if (d && e.target.dataset.openOnSelect !== undefined) d.open(); });
})();
