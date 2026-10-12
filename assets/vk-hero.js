/* VOLKARA — hero: content lift on scroll + pointer-following ember light */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const init = (root = document) => root.querySelectorAll('.vk-hero').forEach((hero) => {
    if (hero._init) return; hero._init = true;
    requestAnimationFrame(() => hero.classList.add('is-loaded'));
    if (reduce) return;
    const content = hero.querySelector('[data-hero-content]'); const light = hero.querySelector('[data-hero-light]');
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / r.height));
      if (content) { content.style.transform = `translate3d(0, ${(-p * 80).toFixed(1)}px, 0)`; content.style.opacity = String(1 - p * 1.4); }
    }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (light && window.matchMedia('(pointer: fine)').matches) hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); light.style.setProperty('--vk-lx', `${e.clientX - r.left}px`); light.style.setProperty('--vk-ly', `${e.clientY - r.top}px`); light.style.opacity = '1'; }, { passive: true });
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => init()) : init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
