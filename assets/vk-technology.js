/* VOLKARA — VolcanicCore™: active layer from sticky scroll progress (cinematic) or hover/focus (compact) */
(() => {
  'use strict';
  if (customElements.get('vk-technology')) return;
  customElements.define('vk-technology', class extends HTMLElement {
    connectedCallback() {
      this.steps = [...this.querySelectorAll('[data-step]')]; this.n = this.steps.length; if (!this.n) return;
      this.mq = window.matchMedia('(min-width: 990px)');
      this.onScroll = this.onScroll.bind(this);
      if (this.dataset.layout === 'cinematic') window.addEventListener('scroll', this.onScroll, { passive: true });
      this.steps.forEach((s) => {
        const go = () => this.set(Number(s.dataset.step), true);
        s.addEventListener('pointerenter', () => { if (this.dataset.layout === 'compact' || !this.mq.matches) go(); });
        s.addEventListener('focus', go); s.addEventListener('click', go);
      });
      this.addEventListener('shopify:block:select', (e) => { const st = e.target.closest('[data-step]'); if (st) this.set(Number(st.dataset.step), true); });
      this.onScroll();
    }
    disconnectedCallback() { window.removeEventListener('scroll', this.onScroll); }
    onScroll() {
      if (this.dataset.layout !== 'cinematic' || !this.mq.matches) return;
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => {
        const r = this.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
        this.set(Math.min(this.n, Math.max(1, Math.floor(p * this.n * 1.15) + 1)));
      });
    }
    set(i, manual) {
      if (String(i) === this.dataset.active && !manual) return;
      this.dataset.active = String(i);
      this.steps.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === i));
      this.querySelectorAll('.vk-layer').forEach((l) => l.classList.toggle('is-active', Number(l.dataset.i) === i));
      this.querySelectorAll('[data-readout]').forEach((r) => r.classList.toggle('is-active', Number(r.dataset.readout) === i));
      this.style.setProperty('--vk-active', i);
      if (manual) this.classList.add('is-exploded');
    }
  });
})();
