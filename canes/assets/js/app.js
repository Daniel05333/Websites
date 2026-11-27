// Canes Make-up Studio: alle interactie, zonder bibliotheken.
// 3D-poederdoos die opent tijdens het scrollen (spiegel met Esra), portfolio met
// filters, 3D-kaartenstapel masterclasses, prijskaart, info/regels en de aanvraag.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const DATA = JSON.parse($('#cn-data')?.textContent || '{}');

  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('.reveal').forEach((el) => io.observe(el));
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => { $('.hero__title')?.classList.add('in'); $('.hero__copy')?.classList.add('in'); }));

  // ── poederdoos ──────────────────────────────────────────────────────────
  const hero = $('[data-hero]'), compact = $('[data-compact]'), fls = $$('.fl');
  let mx = 0, my = 0, lid = 0, turn = 0, heroOn = true, raf = 0;
  const t0 = performance.now();
  if (fine) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
  if (hero) new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; if (heroOn) kick(); }).observe(hero);
  const heroP = () => clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight));
  function kick() { if (!raf && !calm) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    const p = heroP(), t = (now - t0) / 1000;
    const intro = ss(0.2, 1.6, t) * 0.22;
    lid = lerp(lid, Math.max(intro, ss(0.02, 0.6, p)), 0.1);
    turn = lerp(turn, mx * 18 + p * 30, 0.06);
    compact.style.setProperty('--open', lid.toFixed(4));
    compact.style.setProperty('--turn', `${turn.toFixed(2)}deg`);
    hero.style.setProperty('--hint', (1 - ss(0.02, 0.12, p)).toFixed(3));
    fls.forEach((f, i) => {
      const d = Number(f.dataset.depth);
      f.style.setProperty('--fo', ss(0.15 + i * 0.07, 0.35 + i * 0.07, lid).toFixed(3));
      f.style.setProperty('--fx', `${(mx * -60 * d).toFixed(1)}px`);
      f.style.setProperty('--fy', `${(Math.sin(t * 0.8 + i) * 8 - p * 160 * d + my * -40 * d).toFixed(1)}px`);
    });
    if (heroOn) kick();
  }
  if (compact) kick();

  // ── scroll ──────────────────────────────────────────────────────────────
  const nav = $('[data-nav]'), dock = $('[data-dock]'), req = $('#aanvraag'), grid = $('[data-grid]'), card3d = $('[data-card3d] .pcard');
  const onScroll = () => {
    const y = scrollY, H = innerHeight;
    nav?.classList.toggle('is-scrolled', y > 40);
    if (dock && hero && req) { const r = req.getBoundingClientRect(); dock.classList.toggle('show', y > hero.offsetHeight - H * 0.5 && !(r.top < H && r.bottom > 0)); }
    if (calm) return;
    if (grid) { const r = grid.getBoundingClientRect(); grid.style.setProperty('--lag', (clamp((H - r.top) / (H + r.height)) * -60 + 30).toFixed(1)); }
    if (card3d && !card3d.dataset.hover) { const r = card3d.getBoundingClientRect(), v = clamp((H - r.top) / (H + r.height)); card3d.style.setProperty('--ry', `${lerp(-18, 12, v).toFixed(1)}deg`); card3d.style.setProperty('--rx', `${lerp(8, -4, v).toFixed(1)}deg`); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 9}deg) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -9}deg)`; });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`; });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
    if (card3d) {
      card3d.addEventListener('pointermove', (e) => { const r = card3d.getBoundingClientRect(); card3d.dataset.hover = 1; card3d.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`); card3d.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`); });
      card3d.addEventListener('pointerleave', () => { delete card3d.dataset.hover; onScroll(); });
    }
  }

  // ── portfolio ───────────────────────────────────────────────────────────
  const items = $$('[data-grid] li');
  $$('[data-f]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    items.forEach((li) => { li.hidden = b.dataset.f !== 'alle' && li.dataset.cat !== b.dataset.f; });
  }));
  const lb = $('[data-lightbox]');
  let list = [], li = 0;
  const show = () => { const b = list[li], im = $('[data-lb-img]', lb); im.src = b.dataset.zoom; im.alt = b.querySelector('img').alt; $('[data-lb-cap]', lb).textContent = `${b.dataset.label} · ${li + 1} / ${list.length}`; };
  const step = (d) => { li = (li + d + list.length) % list.length; show(); };
  $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => { list = items.filter((x) => !x.hidden).map((x) => $('[data-zoom]', x)); li = list.indexOf(b); show(); lb.showModal(); }));
  if (lb) {
    $('[data-lb-close]', lb).onclick = () => lb.close();
    $('[data-lb-prev]', lb).onclick = () => step(-1);
    $('[data-lb-next]', lb).onclick = () => step(1);
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  }

  // ── masterclasses: kaartenstapel ────────────────────────────────────────
  const deck = $('[data-deck]'), cards = $$('[data-card]');
  let di = 0;
  const lay = () => {
    const w = cards[0]?.offsetWidth || 400, n = cards.length;
    cards.forEach((c, i) => {
      const k = (i - di + n) % n;
      c.style.zIndex = n - k;
      c.style.transform = k === 0 ? 'none' : `translateX(${k * w * 0.16}px) translateZ(${-k * 120}px) rotateY(${-k * 8}deg)`;
      c.style.filter = k ? `brightness(${1 - k * 0.22})` : '';
      c.style.opacity = k > 2 ? 0 : 1;
      c.setAttribute('aria-hidden', k ? 'true' : 'false');
    });
    $('[data-deck-i]').textContent = String(di + 1).padStart(2, '0');
  };
  const go = (d) => { di = (di + d + cards.length) % cards.length; lay(); };
  if (deck) {
    $('[data-deck-prev]').onclick = () => go(-1);
    $('[data-deck-next]').onclick = () => go(1);
    deck.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    deck.addEventListener('click', () => go(1));
    let x0 = null;
    deck.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    deck.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) { go(e.clientX < x0 ? 1 : -1); deck.dataset.swiped = 1; } x0 = null; });
    addEventListener('resize', lay);
    lay();
  }

  // ── info / regels ───────────────────────────────────────────────────────
  const tabs = $$('[data-tab]');
  const pickTab = (t, focus) => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
    $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    $$(`[data-panel="${t.dataset.tab}"] .reveal`).forEach((r) => r.classList.add('in'));
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pickTab(t));
    t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); pickTab(tabs[1 - i], true); } });
  });

  // ── aanvraag ────────────────────────────────────────────────────────────
  const form = $('[data-form]');
  if (!form) return;
  const P = Object.fromEntries((DATA.prices || []).map((p) => [p.id, p]));
  const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const nice = (v) => { if (!v) return ''; const d = new Date(`${v}T12:00`); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  form.date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const toast = $('[data-toast]');
  const say = (m) => { toast.textContent = m; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 2600); };
  const msg = () => {
    const f = new FormData(form), s = P[f.get('service')], n = Math.max(1, Number(f.get('people')) || 1);
    return [
      'Hoi Esra! Ik wil graag een afspraak aanvragen bij Canes Make-up Studio.',
      `• Studio: ${f.get('loc')}`,
      `• Look: ${s.name}${s.note ? ` (${s.note.toLowerCase()})` : ''} · €${s.price}${n > 1 ? ` p.p.` : ''}`,
      `• Datum: ${nice(f.get('date')) || '(nog kiezen)'}`,
      f.get('time') ? `• Klaar om: ${f.get('time')}` : '',
      n > 1 ? `• Aantal personen: ${n}` : '',
      s.id === 'bridal-trial' && f.get('trial') ? `• Voorkeur proefsessie: ${f.get('trial')}` : '',
      `Naam: ${f.get('name') || '-'}`,
      'Is deze datum nog vrij? Dan hoor ik graag hoe de aanbetaling werkt.',
    ].filter(Boolean).join('\n');
  };
  const render = () => {
    const f = new FormData(form), s = P[f.get('service')], n = Math.max(1, Number(f.get('people')) || 1);
    $('[data-trial]', form).hidden = s.id !== 'bridal-trial';
    $('[data-day]', form).textContent = f.get('date') ? `Je kiest ${nice(f.get('date'))}.` : '';
    $$('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.pick === s.id));
    const rows = [['Studio', f.get('loc')], ['Look', s.name], ['Datum', nice(f.get('date')) || '–'], ['Indicatie', `€${s.price * n}${n > 1 ? ` (${n} pers.)` : ''}`]];
    $('[data-sum]').innerHTML = rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    $('[data-preview]', form).textContent = msg();
  };
  const choose = (id) => { const r = $(`input[name=service][value="${id}"]`, form); if (r) { r.checked = true; render(); say(`${P[id].name} staat in je aanvraag`); form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash'); } };
  $$('[data-pick]').forEach((b) => b.addEventListener('click', () => choose(b.dataset.pick)));
  $$('[data-pick-go]').forEach((a) => a.addEventListener('click', () => choose(a.dataset.pickGo)));
  form.addEventListener('input', (e) => { e.target.removeAttribute?.('aria-invalid'); render(); });
  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('[data-error]', form), probs = [];
    if (!form.date.value) { form.date.setAttribute('aria-invalid', 'true'); probs.push('kies je datum'); }
    else if (new Date(`${form.date.value}T12:00`) < today) { form.date.setAttribute('aria-invalid', 'true'); probs.push('kies een datum in de toekomst'); }
    if (!form.elements.name.value.trim()) { form.elements.name.setAttribute('aria-invalid', 'true'); probs.push('vul je naam in'); }
    if (!form.elements.rules.checked) { form.elements.rules.setAttribute('aria-invalid', 'true'); probs.push('bevestig de voorwaarden'); }
    if (probs.length) { err.textContent = `Nog even: ${probs.join(', ')}.`; return; }
    err.textContent = '';
    open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(msg())}`, '_blank', 'noopener');
    say('WhatsApp opent met je aanvraag');
  });
  render();
})();
