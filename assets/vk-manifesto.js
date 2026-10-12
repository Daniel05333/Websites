/* VOLKARA — manifesto: wrap words so they light up with --vk-progress */
(() => {
  'use strict';
  const init = (root = document) => root.querySelectorAll('[data-manifesto]').forEach((el) => {
    if (el.dataset.ready) return; el.dataset.ready = '1';
    const words = []; let i = 0;
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) return frag.append(' '); const s = document.createElement('span'); s.className = 'vk-mw'; s.textContent = p; s.style.setProperty('--vk-w', i++); words.push(s); frag.append(s); });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) walk(c);
    });
    walk(el); el.style.setProperty('--vk-words', i);
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => init()) : init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
