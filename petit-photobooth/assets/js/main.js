// Petit Photobooth — interactie. Geen bibliotheken: 3D-fotostrips in CSS,
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

  // ── hero: 3D-fotostrips (CSS 3D, aangestuurd door scroll en muis) ─────────
  const hero = $('[data-hero]');
  const stage = $('[data-stage]');
  const flash = $('[data-flash]');
  const pointer = { x: 0, y: 0, active: false };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
    pointer.active = true;
  }, { passive: true });
  if (hero) (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => {
    $('.hero__title', hero)?.classList.add('in');
    $('.hero__copy', hero)?.classList.add('in');
  }));
  if (hero && stage) {
    const strips = $$('.strip', stage);
    // per strip: x (%), y (px), z (px), rotY, rotZ — dicht op elkaar → uitgewaaierd
    const CLOSED = [[-30, 10, -40, 0, -6], [0, 0, 0, 0, 2], [30, 14, -80, 0, 8]];
    const OPEN = [[-92, 30, -60, 24, -12], [0, -10, 40, 0, 0], [92, 40, -60, -24, 12]];
    const st = { yaw: 0, pitch: 0, open: 0 };
    const t0 = performance.now();
    let visible = true, running = false, lastFlash = -1;
    const fire = () => { if (!flash || calm) return; flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
    const frame = (now) => {
      running = false;
      const t = (now - t0) / 1000;
      const p = calm ? 0.6 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.4) * 0.4;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.33) * 0.25;
      const intro = calm ? 1 : 1 - Math.pow(1 - clamp(t / 1.4, 0, 1), 3);
      st.open = lerp(st.open, calm ? 1 : smooth(0, 0.6, p), 0.08);
      st.yaw = lerp(st.yaw, px * 18 - 8, 0.06);
      st.pitch = lerp(st.pitch, -py * 10 + 6, 0.06);
      stage.style.transform = `rotateX(${st.pitch.toFixed(2)}deg) rotateY(${st.yaw.toFixed(2)}deg)`;
      strips.forEach((s, i) => {
        const [x, y, z, ry, rz] = CLOSED[i].map((v, k) => lerp(v, OPEN[i][k], st.open));
        const bob = calm ? 0 : Math.sin(t * 1.1 + i * 1.7) * 8;
        s.style.transform = `translate3d(${x.toFixed(1)}%, ${(y + bob + (1 - intro) * 60).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
        s.style.opacity = intro.toFixed(3);
      });
      // flits na het laden en bij elke derde van het scrollen
      const step = Math.floor(p * 3);
      if (t > 1.2 && step !== lastFlash) { lastFlash = step; fire(); }
      if (!calm) loop();
    };
    const loop = () => { if (!running && visible) { running = true; requestAnimationFrame(frame); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(hero);
    loop();
  }

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

  // ── galerij: vergrootweergave ────────────────────────────────────────────
  const box = $('[data-lightbox]');
  if (box) {
    const shots = $$('[data-zoom]');
    const img = $('[data-lightbox-img]', box), cap = $('[data-lightbox-cap]', box);
    let idx = 0, opener = null;
    const show = (i) => { idx = (i + shots.length) % shots.length; img.src = shots[idx].dataset.zoom; img.alt = shots[idx].dataset.label; cap.textContent = shots[idx].dataset.label; };
    shots.forEach((b, i) => b.addEventListener('click', () => { opener = b; show(i); box.showModal(); }));
    $('[data-lightbox-prev]', box).addEventListener('click', () => show(idx - 1));
    $('[data-lightbox-next]', box).addEventListener('click', () => show(idx + 1));
    $('[data-lightbox-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    box.addEventListener('close', () => opener?.focus());
  }

  // ── aanvraag → kopiëren → Instagram-DM ───────────────────────────────────
  const form = $('[data-form]');
  const toast = $('[data-toast]');
  const say = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 4500); };
  if (form) {
    const date = form.elements.date;
    const d0 = new Date(Date.now() + 864e5);
    date.min = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}-${String(d0.getDate()).padStart(2, '0')}`;
    const nice = (v) => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
    const preview = $('[data-preview]', form), error = $('[data-error]', form);
    const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} en ${a.at(-1)}`);
    const message = () => {
      const f = new FormData(form);
      const g = (k) => String(f.get(k) || '').trim();
      if (!g('kind')) return '';
      const opts = f.getAll('opt');
      return [
        `Hoi Petit Photobooth! Wij willen graag een photobooth aanvragen voor onze ${g('kind').toLowerCase()}.`,
        g('date') && `Datum: ${nice(g('date'))}`,
        g('venue') && `Locatie: ${g('venue')}, ${g('country')}`,
        g('guests') && `Aantal gasten: ${g('guests')}`,
        opts.length && `Interesse in: ${list(opts).toLowerCase()}`,
        g('note') && `Thema / kleuren: ${g('note')}`,
        'Is deze datum nog vrij?',
        g('name') && `Groetjes, ${g('name')}`,
      ].filter(Boolean).join('\n');
    };
    const update = () => { preview.textContent = message() || 'Kies een gelegenheid…'; error.textContent = ''; };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ask]');
      if (!b) return;
      e.preventDefault();
      if (b.dataset.pre) { form.elements.kind.value = b.dataset.pre; update(); }
      $('#aanvraag').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => {
        form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash');
        (b.dataset.pre ? date : form.elements.kind).focus({ preventScroll: true });
      }, calm ? 0 : 700);
    });

    const copy = async (text) => {
      try { await navigator.clipboard.writeText(text); return true; } catch {
        const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.append(ta); ta.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove(); return ok;
      }
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(form);
      if (!f.get('kind')) { error.textContent = 'Kies eerst een gelegenheid.'; form.elements.kind.focus(); return; }
      if (!f.get('date')) { error.textContent = 'Kies de datum van jullie event.'; date.focus(); return; }
      if (!f.get('guests')) { error.textContent = 'Vul het aantal gasten in.'; form.elements.guests.focus(); return; }
      if (!String(f.get('venue') || '').trim()) { error.textContent = 'Vul de locatie in.'; form.elements.venue.focus(); return; }
      if (!String(f.get('name') || '').trim()) { error.textContent = 'Vul jullie naam in.'; form.elements.name.focus(); return; }
      const ok = await copy(message());
      window.open(`https://ig.me/m/${form.dataset.ig}`, '_blank', 'noopener');
      say(ok ? 'Bericht gekopieerd. Plak het in de DM die nu opent.' : 'Instagram opent. Kopiëren lukte niet, typ jullie aanvraag in de DM.');
    });
  }
})();
