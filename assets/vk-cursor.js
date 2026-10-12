/* VOLKARA — luxury double-ring cursor (desktop pointers only, never with reduced motion). */
(() => {
  'use strict';
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dot = document.createElement('div'); dot.className = 'vk-cursor vk-cursor--dot';
  const ring = document.createElement('div'); ring.className = 'vk-cursor vk-cursor--ring';
  dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);
  document.documentElement.classList.add('vk-cursor-on');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0, shown = false;
  const HOVER = 'a, button, [role="button"], label, summary, select, input[type="radio"], input[type="checkbox"], .vk-pill';
  const loop = () => {
    rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    if (!shown) { shown = true; rx = x; ry = y; document.documentElement.classList.add('vk-cursor-visible'); }
    ring.classList.toggle('is-hover', !!e.target.closest?.(HOVER));
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('pointerleave', () => document.documentElement.classList.remove('vk-cursor-visible'));
  document.addEventListener('pointerenter', () => shown && document.documentElement.classList.add('vk-cursor-visible'));
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));
})();
