/* VOLKARA — comparison competitor switch + FAQ instant filter */
(() => {
  'use strict';
  if (!customElements.get('vk-compare')) customElements.define('vk-compare', class extends HTMLElement {
    connectedCallback() {
      this.querySelectorAll('[data-compare-show]').forEach((btn) => btn.addEventListener('click', () => {
        this.dataset.show = btn.dataset.compareShow;
        this.querySelectorAll('[data-compare-show]').forEach((b) => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
      }));
    }
  });
  document.addEventListener('input', (e) => {
    const input = e.target.closest('[data-faq-filter]'); if (!input) return;
    const root = input.closest('.vk-faq'); const q = input.value.trim().toLowerCase(); let shown = 0;
    root.querySelectorAll('.vk-faq__item').forEach((item) => { const hit = !q || item.textContent.toLowerCase().includes(q); item.hidden = !hit; if (hit) shown++; });
    const empty = root.querySelector('[data-faq-empty]'); if (empty) empty.hidden = shown > 0;
  });
})();
