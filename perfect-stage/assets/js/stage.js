// The Perfect Stage — 3D-bogen in de hero, portfolio-filters, vergrootweergave
// en de aanvraag-configurator (→ WhatsApp). Geen bibliotheken.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // ── hero: vijf bogen in een halve cirkel die opengaan tijdens het scrollen ─
  const hero = $('[data-hero]'), stage = $('[data-arches]');
  if (hero && stage) {
    const arches = $$('.arch', stage);
    const pointer = { x: 0, y: 0, on: false };
    addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; pointer.on = true; }, { passive: true });
    const st = { yaw: 0, pitch: 0, open: 0 };
    const t0 = performance.now();
    let visible = true, running = false;
    const frame = (now) => {
      running = false;
      const t = (now - t0) / 1000;
      const p = calm ? 0.7 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      const intro = calm ? 1 : 1 - Math.pow(1 - clamp(t / 1.6, 0, 1), 3);
      st.open = lerp(st.open, calm ? 1 : 0.15 + smooth(0, 0.7, p) * 0.85, 0.08);
      st.yaw = lerp(st.yaw, (pointer.on ? pointer.x : Math.sin(t * 0.35) * 0.5) * 12, 0.06);
      st.pitch = lerp(st.pitch, 8 - (pointer.on ? pointer.y : Math.cos(t * 0.3) * 0.3) * 5 - p * 6, 0.06);
      stage.style.transform = `rotateX(${st.pitch.toFixed(2)}deg) rotateY(${st.yaw.toFixed(2)}deg)`;
      const n = arches.length, mid = (n - 1) / 2;
      arches.forEach((a, i) => {
        const k = i - mid;
        const ang = k * lerp(6, 24, st.open);
        const r = lerp(240, innerWidth < 900 ? 260 : 380, st.open);
        const rise = (1 - smooth(i * 0.12, i * 0.12 + 0.6, intro * 1.5)) * 220;
        const z = -Math.abs(k) * lerp(20, 60, st.open);
        a.style.transform = `translate(-50%, -50%) rotateY(${ang.toFixed(2)}deg) translateZ(${r.toFixed(0)}px) translate3d(0, ${(rise + (calm ? 0 : Math.sin(t * 0.8 + i) * 5)).toFixed(1)}px, ${z.toFixed(0)}px) rotateY(${(-ang * 0.25).toFixed(2)}deg)`;
        a.style.opacity = smooth(i * 0.12, i * 0.12 + 0.4, intro * 1.5).toFixed(3);
        a.style.zIndex = String(10 - Math.abs(k) | 0);
      });
      hero.style.setProperty('--p', p.toFixed(3));
      if (!calm) loop();
    };
    const loop = () => { if (!running && visible) { running = true; requestAnimationFrame(frame); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(hero);
    loop();
  }

  // ── portfolio: filters + vergrootweergave ────────────────────────────────
  const masonry = $('[data-masonry]');
  if (masonry) {
    const items = $$('li', masonry);
    $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      items.forEach((li) => { li.hidden = !(b.dataset.filter === 'alle' || li.dataset.cat === b.dataset.filter); li.classList.add('in'); });
    }));
    const box = $('[data-lightbox]'), im = $('[data-lightbox-img]', box), cap = $('[data-lightbox-cap]', box);
    let list = [], idx = 0, opener = null;
    const show = (i) => { idx = (i + list.length) % list.length; im.src = list[idx].dataset.zoom; im.alt = list[idx].dataset.label; cap.textContent = list[idx].dataset.label; };
    masonry.addEventListener('click', (e) => { const b = e.target.closest('[data-zoom]'); if (!b) return; opener = b; list = $$('li:not([hidden]) [data-zoom]', masonry); show(list.indexOf(b)); box.showModal(); });
    $('[data-lightbox-prev]', box).addEventListener('click', () => show(idx - 1));
    $('[data-lightbox-next]', box).addEventListener('click', () => show(idx + 1));
    $('[data-lightbox-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    box.addEventListener('close', () => opener?.focus());
  }

  // ── configurator ─────────────────────────────────────────────────────────
  const form = $('[data-cfg]');
  if (!form) return;
  const pages = $$('[data-page]', form), stepsEl = $$('.cfg__steps li', form);
  const err = $('[data-error]', form), prev = $('[data-prev]', form), next = $('[data-next]', form), send = $('[data-send]', form);
  const summary = $('[data-summary]'), preview = $('[data-preview]', form), avail = $('[data-avail]', form);
  const date = form.elements.date;
  const d0 = new Date(Date.now() + 864e5 * 7);
  date.min = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}-${String(d0.getDate()).padStart(2, '0')}`;
  const nice = (v) => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
  const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} en ${a.at(-1)}`);
  let page = 0;
  const val = () => { const f = new FormData(form); const g = (k) => String(f.get(k) || '').trim(); return { g, parts: f.getAll('parts'), promo: f.has('promo') }; };
  const message = () => {
    const { g, parts, promo } = val();
    return [
      `Hoi The Perfect Stage! Wij willen graag een aanvraag doen voor onze ${g('event').toLowerCase()}.`,
      g('date') && `Datum: ${nice(g('date'))}`,
      (g('venue') || g('place')) && `Zaal: ${[g('venue'), g('place')].filter(Boolean).join(', ')}`,
      g('guests') && `Aantal gasten: ${g('guests')}`,
      g('setup') && `Opbouw: ${g('setup')}`,
      `Collectie: ${g('collection')}`,
      parts.length && `Onderdelen: ${list(parts).toLowerCase()}`,
      g('colors') && `Kleuren / sfeer: ${g('colors')}`,
      promo && 'We willen graag weten of we in aanmerking komen voor de korting tot €300.',
      g('note') && `Opmerking: ${g('note')}`,
      'Is deze datum nog beschikbaar?',
      g('name') && `Groetjes, ${g('name')}${g('phone') ? ` (${g('phone')})` : ''}`,
    ].filter(Boolean).join('\n');
  };
  const renderSummary = () => {
    const { g, parts, promo } = val();
    const rows = [['Datum', g('date') && nice(g('date'))], ['Feest', g('event')], ['Gasten', g('guests')], ['Zaal', [g('venue'), g('place')].filter(Boolean).join(', ')], ['Collectie', g('collection')], ['Onderdelen', parts.join(', ')], ['Korting', promo ? 'Tot €300, voorwaarden vragen' : '']];
    summary.innerHTML = `<p class="summary__h">Jullie aanvraag</p><dl>${rows.map(([k, v]) => `<div${v ? '' : ' class="is-empty"'}><dt>${k}</dt><dd>${v ? esc(v) : '—'}</dd></div>`).join('')}</dl>`;
    preview.textContent = message();
  };
  // demo-beschikbaarheid: drukke data (zaterdagen in het hoogseizoen) als "bijna vol"
  const checkDate = () => {
    if (!date.value) { avail.textContent = ''; avail.className = 'cfg__avail'; return; }
    const d = new Date(`${date.value}T00:00`), sat = d.getDay() === 6, peak = d.getMonth() >= 4 && d.getMonth() <= 8;
    avail.className = `cfg__avail ${sat && peak ? 'is-busy' : 'is-ok'}`;
    avail.textContent = sat && peak ? 'Populaire datum: zaterdagen in het seizoen raken snel vol. Vraag snel aan.' : 'Goed nieuws: deze datum lijkt nog beschikbaar (demo).';
  };
  const show = (i) => {
    page = i;
    pages.forEach((p, k) => { p.hidden = k !== i; });
    stepsEl.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
    prev.hidden = i === 0; next.hidden = i === pages.length - 1; send.hidden = i !== pages.length - 1;
    err.textContent = '';
    renderSummary();
  };
  const need = (name, msg) => { const el = form.elements[name]; if (String(el.value || '').trim()) return true; err.textContent = msg; el.focus(); return false; };
  const valid = (i) => {
    if (i === 0) return need('date', 'Kies de datum van jullie feest.') && need('guests', 'Vul het aantal gasten in.');
    if (i === 1) return need('venue', 'Vul de naam van de zaal in.') && need('place', 'Vul de plaats van de zaal in.');
    if (i === 3) {
      if (!need('name', 'Vul jullie namen in.')) return false;
      if (!/^[+0-9][0-9 ()-]{7,}$/.test(form.elements.phone.value.trim())) { err.textContent = 'Vul een geldig telefoonnummer in.'; form.elements.phone.focus(); return false; }
    }
    return true;
  };
  next.addEventListener('click', () => { if (valid(page)) { show(page + 1); $('[data-page]:not([hidden]) input', form)?.focus({ preventScroll: true }); } });
  prev.addEventListener('click', () => show(Math.max(0, page - 1)));
  stepsEl.forEach((s, k) => s.addEventListener('click', () => { if (k < page) show(k); }));
  form.addEventListener('input', renderSummary);
  form.addEventListener('change', (e) => { if (e.target === date) checkDate(); renderSummary(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    for (let i = 0; i < pages.length; i++) if (!valid(i)) { show(i); valid(i); return; }
    const { g, parts, promo } = val();
    try {
      const k = 'ps-demo-requests', a = JSON.parse(localStorage.getItem(k) || '[]');
      a.push({ id: `W${Date.now().toString(36)}`, created: new Date().toISOString(), date: g('date'), event: g('event'), guests: Number(g('guests')), venue: g('venue'), place: g('place'), collection: g('collection'), parts, colors: g('colors'), promo, name: g('name'), phone: g('phone'), note: g('note') });
      localStorage.setItem(k, JSON.stringify(a));
    } catch { /* opslag niet beschikbaar */ }
    window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(message())}`, '_blank', 'noopener');
    const t = $('[data-toast]'); if (t) { t.textContent = 'WhatsApp opent met jullie aanvraag. Tip: bekijk hem ook in het dashboard (preview).'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 5000); }
  });
  // knoppen elders op de pagina: collectie / dienst / actie vooraf invullen
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ask]');
    if (!b) return;
    e.preventDefault();
    if (b.dataset.collection) { const r = $$('input[name=collection]', form).find((x) => x.value === b.dataset.collection); if (r) r.checked = true; }
    if (b.dataset.service) { const c = $$('input[name=parts]', form).find((x) => x.value === b.dataset.service); if (c) c.checked = true; }
    if ('promo' in b.dataset) form.elements.promo.checked = true;
    renderSummary();
    $('#aanvraag').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => { form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash'); }, calm ? 0 : 700);
  });
  show(0);
})();
