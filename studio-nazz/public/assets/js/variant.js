// Studio Nazz — effecten voor variant B (Blush) en C (Atelier). Geen bibliotheken.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pointer = { x: 0, y: 0, active: false };
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; pointer.active = true; }, { passive: true });

  // onthullingen
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  let pending = $$('.rv');
  pending.forEach((el) => io.observe(el));
  const sweep = () => { pending = pending.filter((el) => { if (el.classList.contains('in')) return false; if (el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); io.unobserve(el); return false; } return true; }); };
  requestAnimationFrame(() => $$('[data-intro]').forEach((el) => el.classList.add('in')));

  // kop
  const head = $('[data-head]');
  const onScroll = () => { head?.classList.toggle('is-scrolled', scrollY > 30); sweep(); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // B: 3D-stapel van foto's die waaiert met scroll en meebeweegt met de muis
  const stack = $('[data-stack]');
  if (stack) {
    const cards = $$('.stack__card', stack);
    const st = { x: 0, y: 0, p: 0 };
    const t0 = performance.now();
    const frame = (now) => {
      const t = (now - t0) / 1000;
      const r = stack.getBoundingClientRect();
      const p = calm ? 0.5 : clamp(1 - (r.top + r.height) / (innerHeight + r.height), 0, 1);
      st.p = lerp(st.p, p, 0.1);
      st.x = lerp(st.x, pointer.active ? pointer.x : Math.sin(t * 0.4) * 0.5, 0.06);
      st.y = lerp(st.y, pointer.active ? pointer.y : Math.cos(t * 0.3) * 0.3, 0.06);
      stack.style.transform = `rotateY(${(st.x * 14).toFixed(2)}deg) rotateX(${(-st.y * 10).toFixed(2)}deg)`;
      const spread = 0.35 + st.p * 1.3;
      cards.forEach((c, i) => {
        const k = i - (cards.length - 1) / 2;
        const bob = calm ? 0 : Math.sin(t * 0.9 + i) * 6;
        c.style.transform = `translate3d(${(k * 34 * spread).toFixed(1)}%, ${(Math.abs(k) * 18 * spread + bob).toFixed(1)}px, ${(-Math.abs(k) * 90).toFixed(0)}px) rotateZ(${(k * 7 * spread).toFixed(2)}deg) rotateY(${(-k * 10).toFixed(2)}deg)`;
      });
      if (!calm) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // C: 3D-ring van foto's die draait (tijd + scroll + muis)
  const ring = $('[data-ring]');
  if (ring) {
    const items = $$('.ring__item', ring);
    const n = items.length;
    const place = () => {
      const w = items[0].offsetWidth;
      const radius = Math.round((w / 2) / Math.tan(Math.PI / n)) + 30;
      items.forEach((it, i) => { it.style.transform = `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`; });
      ring.style.setProperty('--r', `${radius}px`);
    };
    place(); addEventListener('resize', place);
    let rot = 0, last = performance.now(), tilt = 0;
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      rot += dt * (calm ? 0 : 9);
      tilt = lerp(tilt, pointer.active ? pointer.y * -8 : -6, 0.05);
      const s = calm ? 0 : scrollY * 0.12;
      ring.style.transform = `translateZ(calc(var(--r) * -1)) rotateX(${tilt.toFixed(2)}deg) rotateY(${(-(rot + s) + (pointer.active ? pointer.x * 20 : 0)).toFixed(2)}deg)`;
      if (!calm) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // C: zwevend voorbeeld bij de behandelingenindex
  const prev = $('[data-preview-img]');
  if (prev && fine && !calm) {
    $$('[data-img]').forEach((row) => {
      row.addEventListener('pointerenter', () => { prev.src = row.dataset.img; prev.classList.add('on'); });
      row.addEventListener('pointerleave', () => prev.classList.remove('on'));
      row.addEventListener('pointermove', (e) => { prev.style.translate = `${e.clientX + 24}px ${e.clientY - 120}px`; });
    });
  }

  // kantelkaarten
  if (fine && !calm) $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `perspective(900px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // voor/na
  $$('[data-compare]').forEach((fig) => {
    const media = $('.cmp__media', fig), range = $('input', fig);
    range.addEventListener('input', () => media.style.setProperty('--pos', `${range.value}%`));
  });
})();
