/* VOLKARA — solution: sync checklist accordion <-> hotspots */
(() => {
  'use strict';
  if (customElements.get('vk-solution')) return;
  customElements.define('vk-solution', class extends HTMLElement {
    connectedCallback() {
      this.spots = [...this.querySelectorAll('[data-hotspot]')];
      this.points = [...this.querySelectorAll('[data-point]')];
      this.addEventListener('vk:toggle', (e) => { if (e.detail.open) this.activate(e.detail.details.dataset.point, false); });
      this.spots.forEach((spot) => {
        const btn = spot.querySelector('button');
        btn.addEventListener('click', () => this.activate(spot.dataset.hotspot, true));
        btn.addEventListener('mouseenter', () => this.activate(spot.dataset.hotspot, false, true));
      });
      const open = this.points.find((p) => p.open); if (open) this.activate(open.dataset.point, false);
      this.addEventListener('shopify:block:select', (e) => { const n = e.target.dataset.hotspot || e.target.dataset.point; if (n) this.activate(n, true); });
    }
    activate(n, openPoint, hoverOnly) {
      this.spots.forEach((s) => { const on = s.dataset.hotspot === String(n); s.classList.toggle('is-active', on); s.querySelector('button').setAttribute('aria-expanded', String(on)); });
      if (openPoint && !hoverOnly) { const p = this.points.find((d) => d.dataset.point === String(n)); const acc = this.querySelector('vk-accordion'); if (p && !p.open && acc?.expand) acc.expand(p); }
    }
  });
})();
