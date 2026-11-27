// Salon Robine: alle interactie, zonder bibliotheken.
// 3D-ring met nagelfoto's rond de salon-boog (scroll + muis), voor/na-schuif,
// galerij met filters en vergrootweergave, en de Salonized-agenda in de pagina.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('.reveal').forEach((el) => io.observe(el));
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => { $('.hero__title')?.classList.add('in'); $('.hero__copy')?.classList.add('in'); }));

  // ── 3D-ring ─────────────────────────────────────────────────────────────
  const hero = $('[data-hero]'), ring = $('[data-ring]'), world = $('[data-world]');
  let spin = 0, my = 0, tilt = -6, heroOn = true, lastP = 0;
  if (fine) addEventListener('pointermove', (e) => { my = e.clientY / innerHeight - 0.5; });
  if (hero) new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; if (heroOn) loop(); }).observe(hero);
  let raf = 0;
  function loop() { if (!raf && !calm) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = 0;
    const p = clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight));
    spin += 0.12 + (p - lastP) * 420; lastP = p;
    tilt = lerp(tilt, -6 + my * 10 - p * 8, 0.06);
    ring.style.setProperty('--spin', `${spin.toFixed(2)}deg`);
    world.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
    if (heroOn) loop();
  }
  if (ring && !calm) loop();
  if (ring && calm) ring.style.setProperty('--spin', '-20deg');

  // ── scroll ──────────────────────────────────────────────────────────────
  const nav = $('[data-nav]'), dock = $('[data-dock]'), agenda = $('#agenda'), photos = $('[data-photos]'), browser = $('[data-agenda]');
  const onScroll = () => {
    const y = scrollY, H = innerHeight;
    nav?.classList.toggle('is-scrolled', y > 40);
    if (dock && hero && agenda) { const r = agenda.getBoundingClientRect(); dock.classList.toggle('show', y > hero.offsetHeight - H * 0.5 && !(r.top < H && r.bottom > 0)); }
    if (calm) return;
    if (photos) { const r = photos.getBoundingClientRect(), v = clamp((H - r.top) / (H + r.height)); $$('.ph', photos).forEach((ph, i) => { ph.style.setProperty('--py', ((0.5 - v) * [60, 120, -80][i]).toFixed(1)); ph.style.setProperty('--ry', ((0.5 - v) * [10, -14, 12][i]).toFixed(1)); }); }
    if (browser) { const r = browser.getBoundingClientRect(); browser.style.setProperty('--bx', `${(clamp((r.top - H * 0.2) / H) * 16).toFixed(1)}deg`); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (fine && !calm) $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -8}deg)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  if (fine && !calm) $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`; });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });

  // ── voor/na ─────────────────────────────────────────────────────────────
  $$('[data-ba]').forEach((f) => {
    const r = $('.ba__range', f);
    r.addEventListener('input', () => f.style.setProperty('--x', `${r.value}%`));
    if (!calm) new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const s = performance.now();
      const step = (t) => { const q = (t - s) / 1800; if (q > 1) { f.style.setProperty('--x', `${r.value}%`); return; } f.style.setProperty('--x', `${50 + Math.sin(q * Math.PI * 2) * 25}%`); requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.6 }).observe(f);
  });

  // ── galerij ─────────────────────────────────────────────────────────────
  const items = $$('[data-masonry] li');
  $$('[data-f]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    items.forEach((li) => { li.hidden = b.dataset.f !== 'alle' && li.dataset.cat !== b.dataset.f; });
  }));
  const lb = $('[data-lightbox]');
  let list = [], idx = 0;
  const show = () => { const b = list[idx]; const im = $('[data-lb-img]', lb); im.src = b.dataset.zoom; im.alt = b.dataset.label; $('[data-lb-cap]', lb).textContent = b.dataset.label; };
  const step = (d) => { idx = (idx + d + list.length) % list.length; show(); };
  $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => { list = items.filter((li) => !li.hidden).map((li) => $('[data-zoom]', li)); idx = list.indexOf(b); show(); lb.showModal(); }));
  if (lb) {
    $('[data-lb-close]', lb).onclick = () => lb.close();
    $('[data-lb-prev]', lb).onclick = () => step(-1);
    $('[data-lb-next]', lb).onclick = () => step(1);
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  }

  // ── Salonized-agenda: laadt pas als hij bijna in beeld is ───────────────
  if (browser) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    const body = $('.browser__body', browser), id = browser.dataset.widget;
    if (id) {
      // officiële widget van Salonized
      const div = document.createElement('div');
      Object.assign(div.dataset, { company: id, color: '#3a2f28', language: 'nl', height: 'full', inline: 'true', outline: 'none' });
      div.className = 'salonized-booking';
      body.append(div);
      const s = document.createElement('script'); s.src = 'https://static-widget.salonized.com/loader.js'; s.async = true;
      s.onload = () => browser.classList.add('is-loaded');
      document.body.append(s);
    } else {
      const f = document.createElement('iframe');
      f.title = 'Online afspraak maken bij Salon Robine (Salonized)';
      f.src = browser.dataset.src;
      f.loading = 'lazy';
      f.addEventListener('load', () => browser.classList.add('is-loaded'));
      body.prepend(f);
    }
  }, { rootMargin: '400px 0px' }).observe(browser);
})();
