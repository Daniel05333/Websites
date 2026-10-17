// Alles rond de pagina: smooth scroll (Lenis), de masthead, het menu, de sticky CTA, de cursorring,
// de voortgangsstreepjes en de laadsluier.
import Lenis from 'lenis';
import { $, $$, clamp, mq, ticker, reduced, finePointer, hasIO, docTop, Spring } from './core.js';

export let lenis = null;

/** Scrollt naar een element (of naar boven), met de header en de sticky stapel in rekening. */
export const scrollToEl = (target, immediate = false) => {
  const header = $('[data-header]')?.offsetHeight || 0;
  const y = target ? Math.max(0, docTop(target) - (target.matches('[data-stack], [data-stack-last], .cases') ? 0 : header + 16)) : 0;
  lenis?.resize(); // na het wisselen van inhoud kent Lenis anders de oude paginahoogte
  lenis ? lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.2, force: true }) : window.scrollTo(0, y);
};
window.nexdScrollTo = scrollToEl;

export const initSmooth = () => {
  if (reduced) return;
  lenis = new Lenis({ autoRaf: false, lerp: 0.11, smoothWheel: true });
  ticker.add((now) => lenis.raf(now));
  // Ankers binnen de pagina: met Lenis, rekening houdend met de header en de sticky stapel.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.classList.contains('skip-link') || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
    history.pushState(null, '', url.hash);
    target.setAttribute('tabindex', target.getAttribute('tabindex') ?? '-1');
    target.focus({ preventScroll: true });
  });
};

export const initHeader = () => {
  const header = $('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let scrolled = null;
  ticker.add(() => {
    const y = window.scrollY;
    if (scrolled !== y > 24) header.classList.toggle('is-scrolled', (scrolled = y > 24));
    const menuOpen = document.body.classList.contains('menu-open');
    if (Math.abs(y - lastY) > 6) {
      header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 480 && !header.contains(document.activeElement));
      lastY = y;
    }
  });
};

export const initMenu = () => {
  const toggle = $('[data-menu-toggle]');
  const sheet = $('[data-menu]');
  const label = $('[data-menu-label]');
  if (!toggle || !sheet) return;
  const close = $('[data-menu-close]', sheet);
  const set = (open, restore = true) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Menu sluiten' : 'Menu openen';
    sheet.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    open ? lenis?.stop() : lenis?.start();
    if (open) $('a', sheet)?.focus();
    else if (restore) toggle.focus();
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  close?.addEventListener('click', () => set(false));
  sheet.addEventListener('click', (e) => e.target.closest('a') && set(false, false));
  document.addEventListener('keydown', (e) => {
    if (sheet.hidden) return;
    if (e.key === 'Escape') return set(false);
    if (e.key !== 'Tab') return;
    // Focus binnen het menu houden.
    const f = $$('a, button', sheet).filter((el) => el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
    else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
  });
  mq('(min-width: 1180px)').addEventListener('change', (e) => e.matches && !sheet.hidden && set(false, false));
};

/** Sticky mobiele CTA: weg bij hero, formulier en footer. */
export const initStickyCta = (root = document) => {
  const sticky = $('[data-sticky-cta]');
  if (!sticky || !hasIO) return () => {};
  const blockers = [...$$('.hero, .page-hero, [data-form-card]', root), $('[data-foot]')].filter(Boolean);
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
    sticky.classList.toggle('is-hidden', seen.size > 0);
  });
  blockers.forEach((el) => io.observe(el));
  return () => io.disconnect();
};

/** Cursorring (Laocoön): volgt met een veer, groeit boven links. Alleen muis, alleen met beweging. */
export const initCursor = () => {
  const ring = $('[data-cursor]');
  if (!ring || !finePointer || reduced) return;
  const x = new Spring(0, { tension: 380, friction: 32 });
  const y = new Spring(0, { tension: 380, friction: 32 });
  let seen = false;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!seen) (x.jump(e.clientX), y.jump(e.clientY), (seen = true));
      x.set(e.clientX);
      y.set(e.clientY);
      ring.classList.add('is-on');
      ring.classList.toggle('is-link', !!e.target.closest('a, button, label, summary, select'));
    },
    { passive: true }
  );
  document.documentElement.addEventListener('mouseleave', () => ring.classList.remove('is-on'));
  ticker.add((now, dt) => {
    if (!seen) return;
    ring.style.transform = `translate3d(${x.step(dt)}px, ${y.step(dt)}px, 0)`;
  });
};

/** Voortgangsstreepjes rechts (home, desktop): één per hoofdstuk, vult mee met de scroll. */
export const initProgress = () => {
  if (!document.body.classList.contains('is-home')) return;
  const ids = ['top', 'route', 'werkwijze', 'resultaten', 'welke-oplossing', 'team', 'veelgestelde-vragen'];
  const secs = ids.map((id) => document.getElementById(id)).filter(Boolean);
  const box = document.createElement('div');
  box.className = 'progress-dashes';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = secs.map(() => '<span><i></i></span>').join('');
  document.body.append(box);
  const fills = $$('i', box);
  const foot = $('[data-foot]');
  if (foot && hasIO) new IntersectionObserver(([e]) => box.classList.toggle('is-off', e.isIntersecting)).observe(foot);
  ticker.add(() => {
    if (box.offsetParent === null && getComputedStyle(box).display === 'none') return;
    const vh = window.innerHeight;
    const y = window.scrollY + vh * 0.5;
    secs.forEach((s, i) => {
      const top = docTop(s);
      const h = s.offsetHeight || 1;
      fills[i].style.height = `${(clamp((y - top) / h) * 100).toFixed(1)}%`;
    });
  });
};

/**
 * Laadsluier (home). Het logo vult zich van boven, de meter kruipt naar 0.7 en loopt vol zodra de
 * lettertypes er zijn en de 3D-scène klaar is (of na maximaal 1.6 s). Eén keer per sessie.
 * Geeft een promise terug die resolvet op het overdrachtsmoment: dan beginnen de hero-reveals.
 */
export const initVeil = (engineReady) => {
  const veil = $('[data-veil]');
  let seen = false;
  try {
    seen = sessionStorage.getItem('nexd-veil') === '1';
    sessionStorage.setItem('nexd-veil', '1');
  } catch {}
  if (!veil) return Promise.resolve();
  // Op telefoons geen sluier: daar telt elke tiende seconde tot de eerste inhoud.
  if (reduced || seen || window.innerWidth < 768) {
    veil.remove();
    return Promise.resolve();
  }
  lenis?.stop();
  const fill = $('[data-veil-fill]', veil);
  const meter = $('[data-veil-meter]', veil);
  const t0 = performance.now();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let target = 0.7;
  let p = 0;
  const ready = Promise.all([
    document.fonts ? document.fonts.ready.catch(() => {}) : null,
    Promise.race([engineReady, wait(1600)]),
    wait(650),
  ]).then(() => (target = 1));
  return new Promise((resolve) => {
    let prev = performance.now();
    const off = ticker.add((now) => {
      // Echte verstreken tijd (niet de begrensde dt): ook op een trage GPU duurt de sluier niet langer.
      const dt = Math.max(0, (now - prev) / 1000);
      prev = now;
      p += (target - p) * Math.min(1, dt * (target === 1 ? 7 : 1.6));
      fill.style.transform = `scaleY(${p.toFixed(4)})`;
      meter.style.transform = `scaleX(${p.toFixed(4)})`;
      if (target === 1 && p > 0.992) {
        off();
        veil.classList.add('is-lifting');
        setTimeout(resolve, 220);
        setTimeout(() => {
          veil.remove();
          lenis?.start();
        }, 1000);
      }
      // Noodrem: nooit langer dan 4 s.
      if (now - t0 > 4000) target = 1;
    });
  });
};
