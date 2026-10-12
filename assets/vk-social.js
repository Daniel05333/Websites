/* VOLKARA — stories lightbox + reviews wall filter / show more + read-more clamp */
(() => {
  'use strict';
  /* Story lightbox */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-story-open]'); if (!btn) return;
    const section = btn.closest('.vk-stories'); const modal = section?.querySelector('vk-drawer'); const stage = modal?.querySelector('[data-story-stage]');
    const video = btn.closest('.vk-story')?.querySelector('video'); if (!modal || !stage || !video) return;
    const clone = video.cloneNode(true); clone.muted = false; clone.controls = true; clone.autoplay = true; clone.removeAttribute('loop');
    stage.replaceChildren(clone); modal.open(btn); clone.play().catch(() => {});
    modal.addEventListener('vk:close', () => { clone.pause(); stage.replaceChildren(); }, { once: true });
  });

  /* Reviews wall */
  if (!customElements.get('vk-reviews-wall')) customElements.define('vk-reviews-wall', class extends HTMLElement {
    connectedCallback() {
      this.items = [...this.querySelectorAll('.vk-wall__item')]; this.size = Number(this.dataset.pageSize) || 9; this.shown = this.size; this.filter = 'all';
      this.querySelectorAll('[data-wall-filter]').forEach((b) => b.addEventListener('click', () => {
        this.filter = b.dataset.wallFilter; this.shown = this.size;
        this.querySelectorAll('[data-wall-filter]').forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
        this.render();
      }));
      this.more = this.querySelector('[data-wall-more-btn]');
      this.more?.addEventListener('click', () => { this.shown += this.size; this.render(); });
    }
    match(item) {
      const card = item.firstElementChild; if (!card) return true;
      if (this.filter === 'photos') return card.hasAttribute('data-has-photo');
      if (this.filter === '5') return card.dataset.rating === '5';
      return true;
    }
    render() {
      let n = 0;
      this.items.forEach((it) => { const ok = this.match(it); it.hidden = !ok || ++n > this.shown; if (!it.hidden) it.querySelector('.vk-review')?.classList.add('is-revealed'); });
      if (this.more) this.more.hidden = n <= this.shown;
    }
  });
})();
