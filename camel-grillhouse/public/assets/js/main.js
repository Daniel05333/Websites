// Camel — interactie en beweging. Geen afhankelijkheden, geen trackers.
// Alles wat beweegt zit op één rAF-ticker en stopt buiten beeld; bij
// prefers-reduced-motion staat alle inhoud direct op zijn plek.
(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  doc.classList.add('is-loaded');

  // ── meten (privacyvriendelijk): alleen een event, geen tracker ─────────
  // Een consent-conforme tool kan luisteren op `camel:track` of dataLayer.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-track]');
    if (!a) return;
    const detail = { event: a.dataset.track, item: a.dataset.item ?? null, href: a.getAttribute('href') };
    document.dispatchEvent(new CustomEvent('camel:track', { detail }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(detail);
  });

  // ── één ticker voor alles wat per frame rekent ─────────────────────────
  const subs = new Set();
  let raf = 0;
  const loop = (t) => { for (const f of [...subs]) f(t); raf = subs.size ? requestAnimationFrame(loop) : 0; };
  const tick = (f) => { subs.add(f); if (!raf) raf = requestAnimationFrame(loop); return () => subs.delete(f); };

  // ── veer (gedempt, massa 1; zelfde oplosser als react-spring) ─────────
  const spring = ({ tension = 90, friction = 26, delay = 0, onUpdate, onRest }) => {
    let x = 0, v = 0, last = 0, start = 0;
    const stop = tick((t) => {
      if (!start) start = t + delay;
      if (t < start) return;
      const dt = Math.min(64, last ? t - last : 16); last = t;
      for (let i = 0; i < dt; i++) { const a = -tension * (x - 1) - friction * v; v += a / 1000; x += v / 1000; }
      if (Math.abs(v) < 0.01 && Math.abs(1 - x) < 0.004) { x = 1; onUpdate(1); stop(); onRest?.(); return; }
      onUpdate(x);
    });
  };

  // ── header: transparant over de hero, compact bij scrollen ─────────────
  const top = $('[data-top]');
  const dock = $('[data-dock]');
  const onScroll = () => {
    const y = scrollY;
    top?.classList.toggle('is-solid', y > 40);
    if (dock) {
      const on = y > innerHeight * 0.8;
      if (dock.classList.contains('on') !== on) {
        dock.classList.toggle('on', on);
        dock.setAttribute('aria-hidden', String(!on));
        $$('a', dock).forEach((a) => (on ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
      }
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── mobiel menu ────────────────────────────────────────────────────────
  const burger = $('.burger');
  const sheet = $('#sheet');
  if (burger && sheet) {
    const close = () => {
      sheet.hidden = true; burger.setAttribute('aria-expanded', 'false');
      doc.style.overflow = ''; burger.focus();
    };
    burger.addEventListener('click', () => {
      sheet.hidden = false; burger.setAttribute('aria-expanded', 'true');
      doc.style.overflow = 'hidden'; $('.sheet__close', sheet).focus();
    });
    $('.sheet__close', sheet).addEventListener('click', close);
    sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.closest('.sheet__nav a')) close(); });
    document.addEventListener('keydown', (e) => {
      if (sheet.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = $$('a, button', sheet);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
      }
    });
    matchMedia('(min-width: 1081px)').addEventListener('change', (m) => m.matches && !sheet.hidden && close());
  }

  // ── reveals + woord-veren ──────────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      if (e.target.matches('[data-split]')) {
        $$('.w', e.target).forEach((w, i) => spring({
          tension: 170, friction: 24, delay: i * 55,
          onUpdate: (p) => { w.style.opacity = p; w.style.transform = `translateY(${(1 - p) * 0.35}em)`; },
        }));
      } else e.target.classList.add('in');
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  if (!reduce) $$('.reveal, [data-split]').forEach((el) => io.observe(el));
  else $$('.reveal').forEach((el) => el.classList.add('in'));

  // ── helpers voor "draai alleen in beeld" ──────────────────────────────
  const whileVisible = (el, run) => {
    let stop = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !stop) stop = tick(run);
      else if (!e.isIntersecting && stop) { stop(); stop = null; }
    }).observe(el);
  };

  // ── sticky stack: de hero wijkt terug als de volgende sectie eroverheen schuift
  const pin = $('[data-pin]');
  if (pin) {
    const inner = $('[data-pin-inner]', pin);
    const shade = $('[data-pin-shade]', pin);
    const next = pin.nextElementSibling;
    const phone = matchMedia('(max-width: 639px)');
    let queued = false;
    const apply = () => {
      queued = false;
      const p = clamp(1 - next.getBoundingClientRect().top / (innerHeight || 1));
      const shrink = reduce || phone.matches ? 0 : 0.08;
      inner.style.transform = p > 0 && shrink ? `scale(${1 - shrink * p})` : '';
      shade.style.opacity = String(0.55 * p);
      inner.style.visibility = p >= 1 ? 'hidden' : 'visible';
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(apply); } }, { passive: true });
    addEventListener('resize', apply);
    apply();
  }

  // ── parallax (alleen transform, alleen in beeld) ──────────────────────
  if (!reduce) $$('[data-parallax], [data-parallax-bg]').forEach((el) => {
    const host = el.parentElement;
    const k = el.hasAttribute('data-parallax') ? 0.22 : 0.12;
    whileVisible(host, () => {
      const r = host.getBoundingClientRect();
      el.style.transform = `translate3d(0, ${(-r.top * k).toFixed(1)}px, 0)`;
    });
  });

  // ── vonken-naad: het vlak van de vorige sectie valt uiteen in blokjes ──
  const SURF = { ink: '#0e0c0b', coal: '#151210' };
  const noise = (x, y) => {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  $$('[data-seam]').forEach((cv) => {
    const ctx = cv.getContext('2d');
    const surface = SURF[cv.dataset.seam] ?? SURF.ink;
    let last = -1;
    const render = (progress) => {
      const w = cv.clientWidth, h = cv.clientHeight, r = Math.min(devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); last = -1; }
      if (Math.abs(progress - last) < 0.002) return;
      last = progress;
      const cell = w < 640 ? 16 : 22, cols = Math.ceil(w / cell), rows = Math.ceil(h / cell), lift = progress * 1.6;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        const depth = y / Math.max(1, rows - 1) + lift;
        if (depth > 1) break;
        const solid = depth <= 0.14;
        const fade = clamp(1 - (depth - 0.14) / 0.86);
        for (let x = 0; x < cols; x++) {
          if (!solid && ((x + y) % 2 !== 0 || noise(x, y) > fade)) continue;
          const spark = !solid && noise(x + 101, y + 57) < 0.1;
          ctx.fillStyle = spark ? (noise(x + 7, y + 3) < 0.5 ? '#c9341f' : '#f2a541') : surface;
          ctx.globalAlpha = spark ? 0.5 + 0.5 * fade : 1;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      ctx.globalAlpha = 1;
    };
    const host = cv.parentElement;
    const step = () => {
      const top = host.getBoundingClientRect().top;
      render(reduce ? 1 : clamp(1 - top / innerHeight));
    };
    whileVisible(host, step);
    step();
  });

  // ── hoogtelijnen (marching squares over hetzelfde veld als de hero) ────
  const field = (x, y, t) => {
    let f = Math.sin(x + t * 0.6) * 0.5;
    f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
    f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
    f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
    return f * 0.5 + 0.5;
  };
  $$('[data-contours]').forEach((cv) => {
    const ctx = cv.getContext('2d');
    const t0 = performance.now();
    let lastDraw = 0;
    const draw = (now = performance.now()) => {
      if (now - lastDraw < 32) return; lastDraw = now;
      const w = cv.clientWidth, h = cv.clientHeight, r = Math.min(devicePixelRatio || 1, 1.5);
      if (!w || !h) return;
      if (cv.width !== Math.round(w * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
      const t = reduce ? 0 : ((now - t0) / 1000) * 0.9;
      const CELLS = w < 640 ? 48 : 80;
      const cols = w >= h ? CELLS : Math.max(8, Math.round((CELLS * w) / h));
      const rows = Math.max(8, Math.round((cols * h) / w));
      const sx = w / cols, sy = h / rows, aspect = w / h, n = cols + 1;
      const val = new Float32Array(n * (rows + 1));
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
        const nx = ((i / cols) * 2 - 1) * aspect * 3.4, ny = ((j / rows) * 2 - 1) * 3.4;
        val[j * n + i] = field(nx + Math.sin(ny * 0.8 + t * 0.7) * 0.37, ny + Math.cos(nx * 0.7 - t * 0.6) * 0.37, t) * 3;
      }
      ctx.setTransform(r, 0, 0, r, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(242, 165, 65, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const seg = (a, b) => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); };
      for (let level = 0.5; level < 3; level += 1) for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const a = val[j * n + i], b = val[j * n + i + 1], c = val[(j + 1) * n + i + 1], d = val[(j + 1) * n + i];
        const k = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
        if (k === 0 || k === 15) continue;
        const x0 = i * sx, y0 = j * sy;
        const T = [x0 + sx * ((level - a) / (b - a)), y0], R = [x0 + sx, y0 + sy * ((level - b) / (c - b))];
        const B = [x0 + sx * ((level - d) / (c - d)), y0 + sy], L = [x0, y0 + sy * ((level - a) / (d - a))];
        switch (k) {
          case 1: case 14: seg(L, B); break; case 2: case 13: seg(B, R); break;
          case 3: case 12: seg(L, R); break; case 4: case 11: seg(T, R); break;
          case 6: case 9: seg(T, B); break; case 7: case 8: seg(L, T); break;
          case 5: seg(L, T); seg(B, R); break; case 10: seg(L, B); seg(T, R); break;
        }
      }
      ctx.stroke();
    };
    if (reduce) { draw(); addEventListener('resize', () => { lastDraw = 0; draw(); }); }
    else whileVisible(cv.parentElement, draw);
  });

  // ── rail boven de bestelstappen ───────────────────────────────────────
  const rail = $('[data-rail]');
  if (rail) {
    const host = rail.closest('section');
    const set = () => {
      const r = host.getBoundingClientRect();
      rail.style.setProperty('--p', reduce ? 1 : clamp((innerHeight * 0.85 - r.top) / (r.height * 0.7)).toFixed(3));
    };
    whileVisible(host, set); set();
  }

  // ── ember-gloed volgt de cursor op knoppen ────────────────────────────
  document.addEventListener('pointermove', (e) => {
    const b = e.target.closest?.('.btn--ember');
    if (b) { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`); }
  }, { passive: true });

  // ── openingstijden: vandaag markeren (na middernacht telt de vorige dag) ─
  const now = new Date();
  const dow = (now.getDay() + (now.getHours() < 6 ? 6 : 0)) % 7;
  $$(`[data-hours] tr[data-dow="${dow}"]`).forEach((tr) => {
    tr.classList.add('is-today');
    const td = $('td', tr);
    const out = $('[data-today-close]');
    if (out && td && !$('.ph', td)) out.textContent = `Vandaag tot ${td.textContent.split('–')[1].trim()}`;
  });

  // ── lightbox ──────────────────────────────────────────────────────────
  const lb = $('[data-lightbox]');
  if (lb) {
    const items = JSON.parse($('[data-gallery]').textContent);
    const img = $('[data-lb-img]', lb), cap = $('[data-lb-cap]', lb), count = $('[data-count]', lb);
    let i = 0, opener = null;
    const show = (n) => {
      i = (n + items.length) % items.length;
      img.src = items[i].src; img.alt = items[i].alt;
      cap.textContent = items[i].alt; count.textContent = `${i + 1} / ${items.length}`;
    };
    $$('.gallery__item').forEach((b) => b.addEventListener('click', () => {
      opener = b; show(Number(b.dataset.index)); lb.showModal();
    }));
    $('[data-prev]', lb).addEventListener('click', () => show(i - 1));
    $('[data-next]', lb).addEventListener('click', () => show(i + 1));
    $('[data-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
    lb.addEventListener('close', () => opener?.focus());
    let sx = null;
    lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    });
  }

  // ── menukaart: zoeken + categorie-tabs ────────────────────────────────
  const search = $('[data-search]');
  if (search) {
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
    const status = $('[data-search-status]');
    const empty = $('[data-search-empty]');
    search.addEventListener('input', () => {
      const q = norm(search.value.trim()).replace(/^-|-$/g, '');
      let total = 0;
      $$('.mcat').forEach((sec) => {
        const rows = $$('.row', sec);
        let n = 0;
        rows.forEach((r) => { const hit = !q || r.dataset.name.includes(q); r.hidden = !hit; n += hit; });
        sec.hidden = Boolean(q) && (rows.length ? n === 0 : !norm(sec.querySelector('h2').textContent).includes(q));
        total += n;
      });
      empty.hidden = !q || total > 0;
      status.textContent = q ? `${total} ${total === 1 ? 'gerecht' : 'gerechten'} gevonden` : '';
    });
  }
  const tabs = $('[data-tabs]');
  if (tabs) {
    const links = $$('a', tabs);
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => {
          const on = a.hash === `#${e.target.id}`;
          a.toggleAttribute('aria-current', on);
          if (on) a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
        });
      }
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.mcat').forEach((s) => spy.observe(s));
  }
})();
