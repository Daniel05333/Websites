/* ==========================================================================
   VOLKARA — story page ("Ons verhaal")
   1. [data-letters]  headline split into letters that spring in on view.
   2. [data-rail]     timeline rail fills with scroll; chapters light up as
                      the fill passes their node.
   3. [data-seam]     chequered seam: squares of this section's background
                      appear one by one, dissolving it into the section above.
   4. [data-story-carousel]  scroll-snap carousel with arrows and dots.
   Reduced motion: letters show at once, seams show their final pattern.
   ========================================================================== */
(() => {
  'use strict';
  if (window.VKStory) return;
  const html = document.documentElement;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = () => html.classList.contains('vk-motion') && !reduced();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- 1. Letter springs ---------- */
  const letterIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); letterIO.unobserve(e.target);
  }), { threshold: 0.15 });
  function letters(el) {
    if (el.dataset.lettersDone) return;
    el.dataset.lettersDone = '1';
    if (!motion()) { el.classList.add('is-in'); return; }
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'vk-l-word'; word.setAttribute('aria-hidden', 'true');
            for (const ch of part) {
              const l = document.createElement('span');
              l.className = 'vk-l'; l.style.setProperty('--n', n++); l.textContent = ch;
              word.append(l);
            }
            frag.append(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(el);
    letterIO.observe(el);
  }

  /* ---------- 2 + 3. Scroll-driven rail and seams ---------- */
  const live = new Set();
  const visIO = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target))), { rootMargin: '25% 0px' });
  let raf = 0;
  const request = () => { if (!raf) raf = requestAnimationFrame(frame); };
  function frame() {
    raf = 0;
    const vh = innerHeight || 1;
    live.forEach((el) => (el.hasAttribute('data-rail') ? rail(el, vh) : seam(el, vh)));
  }

  function rail(el, vh) {
    const line = vh * 0.62;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rail', clamp((line - r.top) / Math.max(1, r.height)).toFixed(4));
    el.querySelectorAll('[data-chapter]').forEach((ch) => {
      const node = ch.querySelector('[data-node]') || ch;
      const nr = node.getBoundingClientRect();
      ch.classList.toggle('is-lit', nr.top + nr.height / 2 <= line);
    });
  }

  function buildSeam(el) {
    const size = innerWidth < 750 ? 18 : 28;
    const cols = Math.max(8, Math.ceil(el.clientWidth / size));
    if (el._cols === cols && el._size === size) return;
    el._cols = cols; el._size = size;
    const rows = 3;
    el.style.setProperty('--cols', cols); el.style.setProperty('--size', `${size}px`);
    el.textContent = '';
    el._cells = [];
    for (let row = 0; row < rows; row++) {
      for (let c = 0; c < cols; c++) {
        const i = document.createElement('i');
        // Bottom row (touching this section) fills completely and first; higher rows stay sparse.
        const fromBottom = rows - 1 - row;
        const share = [1, 0.55, 0.22][fromBottom] ?? 0.1;
        const t = Math.random() < share ? fromBottom * 0.22 + Math.random() * 0.5 : Infinity;
        el.append(i); el._cells.push({ i, t, on: false });
      }
    }
    el._p = -1;
  }
  function seam(el, vh) {
    buildSeam(el);
    const r = el.getBoundingClientRect();
    const p = motion() ? clamp((vh - r.bottom) / (vh * 0.45)) : 1;
    if (Math.abs(p - el._p) < 0.01) return;
    el._p = p;
    const reach = p * 0.95;
    for (const cell of el._cells) {
      const on = cell.t < reach;
      if (on !== cell.on) { cell.on = on; cell.i.classList.toggle('is-on', on); }
    }
  }

  /* ---------- 4. Carousel ---------- */
  function carousel(root) {
    if (root._carousel) return; root._carousel = true;
    const track = root.querySelector('[data-track]');
    const nav = root.querySelector('[data-nav]');
    const prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
    const dots = root.querySelector('[data-dots]');
    if (!track || !nav) return;
    const cards = [...track.children];
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      nav.hidden = max < 4;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max - 4;
      const pages = Math.max(1, Math.round(max / step()) + 1);
      if (dots.children.length !== pages) dots.innerHTML = '<i></i>'.repeat(pages);
      const at = Math.round(track.scrollLeft / step());
      [...dots.children].forEach((d, i) => d.classList.toggle('is-active', i === Math.min(at, pages - 1)));
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduced() ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduced() ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    new ResizeObserver(update).observe(track);
    update();
  }

  /* ---------- Pointer glow on value panels ---------- */
  function glow(el) {
    if (el._glow || !matchMedia('(pointer: fine)').matches) return; el._glow = true;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--vk-mx', `${e.clientX - r.left}px`); el.style.setProperty('--vk-my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  function init(root = document) {
    root.querySelectorAll('[data-letters]').forEach(letters);
    root.querySelectorAll('[data-rail], [data-seam]').forEach((el) => { if (!el._watched) { el._watched = true; visIO.observe(el); } });
    root.querySelectorAll('[data-story-carousel]').forEach(carousel);
    root.querySelectorAll('[data-story-glow]').forEach(glow);
    request();
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
  document.addEventListener('shopify:section:load', (e) => init(e.target));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init()); else init();
  window.VKStory = { init };
})();
