// Tekst-engine: data-reveal="words|letters|rise|fade|rule" met data-delay en data-stagger (ms).
// Woorden en letters worden gesplitst met behoud van <em>, <br> en geneste reveals; elk deel krijgt
// een eigen veer. Letters krijgen een onzichtbare leesbare kopie, zodat schermlezers geen losse
// tekens voorlezen. Zonder beweging (reduced motion) wordt er niets gesplitst of verborgen.
import { $$, Spring, ticker, reduced, hasIO } from './core.js';

const SPRINGS = {
  words: { tension: 120, friction: 19 },
  letters: { tension: 150, friction: 21 },
  rise: { tension: 90, friction: 18 },
  fade: { tension: 80, friction: 20 },
  rule: { tension: 70, friction: 18 },
};

const splitWords = (el) => {
  const walk = (node) =>
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        if (!n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(' ');
          const s = document.createElement('span');
          s.className = 'rw';
          s.textContent = part;
          frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.hasAttribute('data-reveal') && !n.classList.contains('visually-hidden')) walk(n);
    });
  walk(el);
  return $$('.rw', el).filter((s) => s.closest('[data-reveal]') === el);
};

const splitLetters = (el) => {
  const text = el.textContent;
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = text;
  const vis = document.createElement('span');
  vis.setAttribute('aria-hidden', 'true');
  [...text].forEach((c) => {
    if (c === ' ') return vis.append(' ');
    const s = document.createElement('span');
    s.className = 'rl';
    s.textContent = c;
    vis.append(s);
  });
  el.replaceChildren(sr, vis);
  return $$('.rl', el);
};

const paint = {
  words: (s, p) => {
    s.style.opacity = Math.min(1, p * 1.6);
    s.style.transform = `translate3d(0, ${(1 - p) * 0.55}em, 0)`;
  },
  letters: (s, p) => {
    s.style.opacity = Math.min(1, p * 1.8);
    s.style.transform = `translate3d(0, ${(1 - p) * 0.45}em, 0)`;
  },
  rise: (s, p) => {
    s.style.opacity = Math.min(1, p * 1.25);
    s.style.transform = `translate3d(0, ${(1 - p) * 0.75}rem, 0)`;
  },
  fade: (s, p) => (s.style.opacity = Math.min(1, Math.max(0, p))),
  rule: (s, p) => (s.style.transform = `scaleX(${Math.max(0, p)})`),
};
const done = (s, kind) => {
  if (kind === 'rule') s.style.transform = 'none';
  else {
    s.style.opacity = '1';
    s.style.transform = 'none';
  }
};

// Actieve animaties, één ticker-abonnee voor allemaal.
const active = new Set();
let unsub = null;
const run = (now, dt) => {
  active.forEach((a) => {
    if (now < a.start) return;
    a.spring.step(dt);
    if (a.spring.idle) {
      done(a.el, a.kind);
      active.delete(a);
    } else paint[a.kind](a.el, a.spring.value);
  });
  if (!active.size) unsub = (unsub?.(), null);
};

/** Bereidt een element voor (splitsen + beginstand). */
const prepare = (el) => {
  if (el._parts) return el._parts;
  const kind = el.dataset.reveal;
  let parts = [el];
  if (kind === 'words') parts = splitWords(el);
  if (kind === 'letters') parts = splitLetters(el);
  parts.forEach((s) => paint[kind](s, 0));
  if (kind === 'words' || kind === 'letters') el.classList.add('is-split');
  el._parts = parts;
  return parts;
};

/** Speelt een reveal af (opnieuw afspelen kan: de cases gebruiken dat bij wisselen). */
export const play = (el, extraDelay = 0) => {
  if (reduced) return;
  const kind = el.dataset.reveal;
  const parts = prepare(el);
  const delay = Number(el.dataset.delay || 0) + extraDelay;
  const stagger = Number(el.dataset.stagger || (kind === 'letters' ? 30 : 60));
  const now = performance.now();
  parts.forEach((s, i) => {
    paint[kind](s, 0);
    active.add({ el: s, kind, start: now + delay + i * stagger, spring: new Spring(0, SPRINGS[kind]).set(1) });
  });
  if (!unsub) unsub = ticker.add(run);
};

/**
 * Koppelt alle reveals binnen root. Elementen met data-hero-reveal wachten op het overdrachtsmoment
 * van de laadsluier (event nexd:handover); de rest start zodra hij in beeld komt.
 */
export const initReveals = (root = document, { handover = Promise.resolve() } = {}) => {
  if (reduced) return () => {};
  const all = $$('[data-reveal]', root);
  all.forEach(prepare);
  const hero = all.filter((el) => el.hasAttribute('data-hero-reveal'));
  const rest = all.filter((el) => !el.hasAttribute('data-hero-reveal'));
  let alive = true;
  handover.then(() => alive && hero.forEach((el) => play(el)));
  if (!hasIO) {
    rest.forEach((el) => play(el));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        play(e.target);
      }),
    { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
  );
  rest.forEach((el) => io.observe(el));
  return () => {
    alive = false;
    io.disconnect();
  };
};
