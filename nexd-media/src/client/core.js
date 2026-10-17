// Kern van de bewegingslaag: één rAF-ticker voor alles, springs (spanning/wrijving, massa 1, in seconden)
// en een paar hulpjes. Niets hier raakt de DOM behalve via de abonnees.

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mq = (q) => window.matchMedia(q);
export const reduced = mq('(prefers-reduced-motion: reduce)').matches;
export const finePointer = mq('(pointer: fine)').matches;
export const hasIO = 'IntersectionObserver' in window;

/** Gedeelde ticker: elke abonnee krijgt (tijd in ms, dt in s). Stopt vanzelf als niemand luistert. */
const subs = new Set();
let raf = 0;
let last = 0;
const frame = (now) => {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
  last = now;
  subs.forEach((fn) => fn(now, dt));
  raf = subs.size ? requestAnimationFrame(frame) : ((last = 0), 0);
};
export const ticker = {
  add(fn) {
    subs.add(fn);
    if (!raf) raf = requestAnimationFrame(frame);
    return () => subs.delete(fn);
  },
};

/** Een veer zoals react-spring: semi-impliciete Euler in kleine stappen, zodat grote dt niet ontploft. */
export class Spring {
  constructor(value = 0, { tension = 170, friction = 26, precision = 0.0005 } = {}) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.tension = tension;
    this.friction = friction;
    this.precision = precision;
  }
  set(v) {
    this.target = v;
    return this;
  }
  jump(v) {
    this.value = this.target = v;
    this.velocity = 0;
    return this;
  }
  get idle() {
    return Math.abs(this.velocity) < this.precision * 10 && Math.abs(this.value - this.target) < this.precision;
  }
  step(dt) {
    const n = Math.max(1, Math.ceil(dt / 0.006));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const a = -this.tension * (this.value - this.target) - this.friction * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
    }
    if (this.idle) this.jump(this.target);
    return this.value;
  }
}

/** Zichtbaarheid van een element als boolean-callback (canvas-loops pauzeren buiten beeld). */
export const watchVisible = (el, cb, margin = '120px') => {
  if (!hasIO) {
    cb(true);
    return () => {};
  }
  const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
};

/** Positie in het document, ook voor sticky lagen (die anders hun "geplakte" positie melden). */
export const docTop = (el) => {
  const root = el.closest('[data-stack-root]');
  if (root && el.parentElement === root) {
    let y = root.getBoundingClientRect().top + window.scrollY;
    for (let p = el.previousElementSibling; p; p = p.previousElementSibling) y += p.offsetHeight;
    return y;
  }
  return el.getBoundingClientRect().top + window.scrollY;
};

/** Canvas op apparaatresolutie (begrensd), geeft de schaal terug. */
export const fitCanvas = (canvas, w, h, max = 1.75) => {
  const k = Math.min(max, window.devicePixelRatio || 1);
  const W = Math.max(1, Math.round(w * k));
  const H = Math.max(1, Math.round(h * k));
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  return k;
};

/** Deterministische ruis per cel (geen Math.random: het patroon is bij elke render gelijk). */
export const hash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
