/* VOLKARA — process steps: an accessible tab list (arrow keys, Home/End) */
if (!customElements.get('vk-process')) {
  customElements.define('vk-process', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.tabs = [...this.querySelectorAll('[role="tab"]')];
      this.panels = [...this.querySelectorAll('[role="tabpanel"]')];
      this.tabs.forEach((t, i) => t.addEventListener('click', () => this.go(i)));
      this.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
        const i = this.tabs.indexOf(document.activeElement); if (i < 0) return;
        const n = this.tabs.length; const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 };
        if (!(e.key in keys)) return; e.preventDefault();
        const j = (keys[e.key] + n) % n; this.go(j); this.tabs[j].focus();
      });
    }
    go(i) {
      this.tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      this.panels.forEach((p, j) => { p.hidden = i !== j; });
      this.style.setProperty('--vk-step', i);
      const tab = this.tabs[i]; const list = tab.parentElement;
      if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: tab.offsetLeft - 16, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  });
}
