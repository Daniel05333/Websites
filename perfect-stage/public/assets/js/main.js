// The Perfect Stage — basisinteractie. Geen bibliotheken: een WebGL-raymarcher voor de
// 3D-cocktailglazen (transparant kristal, gouden rand, vloeistof die vult),
// één scroll-handler, galerij met vergrootweergave en een aanvraagformulier.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  // ── onthullingen ─────────────────────────────────────────────────────────
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  let pending = $$('.reveal, .title');
  pending.forEach((el) => io.observe(el));
  const sweep = () => {
    pending = pending.filter((el) => {
      if (el.classList.contains('in')) return false;
      if (el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); io.unobserve(el); return false; }
      return true;
    });
  };

  // ── hero-intro (de 3D-bogen staan in stage.js) ────────────────────────────
  const hero = $('[data-hero]');
  if (hero) (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => {
    $('.hero__title', hero)?.classList.add('in');
    $('.hero__copy', hero)?.classList.add('in');
  }));

  // ── scroll ───────────────────────────────────────────────────────────────
  const masthead = $('[data-masthead]');
  const bar = $('[data-progress]');
  const dock = $('[data-dock]');
  const footer = $('.footer');
  const reqSec = $('#aanvraag');
  const statement = $('[data-words]');
  const steps = $('[data-steps]');
  let words = [];
  if (statement) {
    const text = statement.textContent.trim();
    statement.innerHTML = `<span class="sr-only">${text}</span><span aria-hidden="true">${text.split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ')}</span>`;
    words = $$('.w', statement);
  }
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = root.scrollHeight - vh;
    bar?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (masthead) {
      masthead.classList.toggle('is-scrolled', y > 40);
      if (y > lastY + 2 && y > vh * 2.6 && !$('dialog[open]')) masthead.classList.add('is-hidden');
      if (y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    if (dock) {
      const near = (el) => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
      dock.classList.toggle('on', y > (hero ? hero.offsetHeight - vh * 0.4 : vh) && !near(reqSec) && !near(footer));
    }
    if (hero && !calm) {
      const p = clamp(y / Math.max(1, hero.offsetHeight - vh), 0, 1);
      const copy = $('.hero__copy', hero);
      const f = smooth(0.7, 0.98, p);
      copy.style.opacity = (1 - f).toFixed(3);
      copy.style.transform = `translate3d(0, ${(-f * 40).toFixed(1)}px, 0)`;
    }
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const prog = calm ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
      const n = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      steps.style.setProperty('--sp', (calm ? 1 : clamp((vh * 0.8 - r.top) / (vh * 0.5), 0, 1)).toFixed(3));
    }
    sweep();
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // ── kantelfoto's, magnetische knoppen ────────────────────────────────────
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1100px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

})();
