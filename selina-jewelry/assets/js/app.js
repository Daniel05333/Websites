// Selina Jewelry: alle beweging en de tas, zonder bibliotheken.
// De film in de hero is één tijdlijn p (0..1) gekoppeld aan de scroll:
// camera naar de klaver → focus kwijt en terug op de close-up → glinstering
// en naam → de film krimpt naar het midden van de vitrine (FLIP).
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const io = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobileQ = matchMedia('(max-width: 760px)');
  const DATA = JSON.parse($('#sj-data')?.textContent || '{}');
  const H = () => innerHeight;

  // ── nav en menu ─────────────────────────────────────────────────────────
  const nav = $('[data-nav]');
  let lastY = scrollY;
  const navScroll = (y) => {
    if (!nav) return;
    const down = y > lastY + 4, up = y < lastY - 4;
    if (down && y > 120) nav.classList.add('is-hidden');
    if (up || y < 120) nav.classList.remove('is-hidden');
    nav.classList.toggle('is-solid', y > 60);
    lastY = y;
  };
  const menu = $('[data-menu]'), menuBtn = $('[data-menu-open]');
  const openMenu = (on) => {
    if (!menu) return;
    if (on) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('open')); $('a', menu).focus(); }
    else { menu.classList.remove('open'); setTimeout(() => { menu.hidden = true; }, calm ? 0 : 700); menuBtn.focus(); }
    menuBtn.setAttribute('aria-expanded', on);
  };
  menuBtn?.addEventListener('click', () => openMenu(true));
  $('[data-menu-close]')?.addEventListener('click', () => openMenu(false));
  $$('[data-menu-link]').forEach((a) => a.addEventListener('click', () => openMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) openMenu(false); });

  // ── de film ─────────────────────────────────────────────────────────────
  const film = $('[data-film]');
  const F = DATA.film;
  const stage = $('[data-stage]'), screen = $('[data-screen]'), canvas = $('[data-canvas]'), macro = $('[data-macro]');
  const spark = $('[data-spark]'), pick = $('[data-pick]'), heroUI = $('[data-hero-ui]');
  const slot = $('[data-vit-slot] .vit__img');
  const ctx = canvas?.getContext('2d');
  const hand = new Image();
  let ready = false, cw = 0, chh = 0;
  if (film && !calm) {
    hand.onload = () => { ready = true; screen.classList.add('is-live'); size(); update(); };
    hand.src = $('[data-poster]').currentSrc || $('[data-poster]').src;
  }
  const size = () => {
    if (!canvas) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cw = stage.clientWidth; chh = stage.clientHeight;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(chh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  // camera: punt (F.hand.x, F.hand.y) van de foto op doel (tx, ty) van het canvas
  const draw = (zoom, tx, ty) => {
    if (!ready) return;
    const iw = hand.naturalWidth, ih = hand.naturalHeight;
    const s = Math.max(cw / iw, chh / ih) * zoom;
    let ox = tx * cw - F.hand.x * iw * s, oy = ty * chh - F.hand.y * ih * s;
    ox = clamp(ox, cw - iw * s, 0); oy = clamp(oy, chh - ih * s, 0);
    ctx.clearRect(0, 0, cw, chh);
    ctx.drawImage(hand, ox, oy, iw * s, ih * s);
  };
  const startPoint = (mob) => {
    // waar de klaver staat bij zoom-start, met de hand iets naar rechts/boven
    const z0 = mob ? 1 : 1.15, iw = hand.naturalWidth || F.hand.w, ih = hand.naturalHeight || F.hand.h;
    const s = Math.max(cw / iw, chh / ih) * z0;
    const x = (cw - iw * s) / 2 + F.hand.x * iw * s + (mob ? 0 : cw * 0.075);
    const y = (chh - ih * s) / 2 + F.hand.y * ih * s - (mob ? 0 : chh * 0.075);
    return [x / cw, y / chh, z0];
  };
  const titleLines = $$('.hero__title .ln > span');
  const fade = $$('.hero__cta, .hero__corner, .hero__veil');
  const hint = $('[data-scroll-hint]'), bar = $('[data-film-bar]');
  const lines = $$('[data-vit-line]'), tops = $$('[data-vit-top]'), sides = $$('[data-vit-side]'), cap = $('[data-vit-cap]');
  const filmFrame = (p) => {
    const mob = mobileQ.matches;
    const [sx, sy, z0] = startPoint(mob);
    const zEnd = mob ? 2.5 : 2.3, TX = F.close.x, TY = F.close.y;
    // 1. de camera komt naar de klaver
    const e = ss(0, 0.5, p);
    let zoom = lerp(z0, zEnd, e);
    const tx = lerp(sx, TX, e), ty = lerp(sy, TY, e);
    // 2. te dichtbij: onscherp, dan vindt de lens de close-up
    const q = ss(0.42, 0.62, p);
    zoom *= 1 + 0.45 * q;
    draw(zoom, tx, ty);
    canvas.style.filter = q > 0.01 ? `blur(${(18 * q).toFixed(1)}px)` : '';
    canvas.style.visibility = p > 0.62 ? 'hidden' : '';
    const m = ss(0.47, 0.62, p);
    macro.style.opacity = clamp((p - 0.47) / 0.04).toFixed(3);
    macro.style.transform = `scale(${lerp(1.5, 1, m).toFixed(3)})`;
    macro.style.filter = m < 0.99 ? `blur(${(22 * (1 - m)).toFixed(1)}px)` : '';
    // hero-tekst weg
    titleLines.forEach((l, i) => {
      const o = ss(0.025 + i * 0.02, 0.08 + i * 0.02, p);
      l.style.transform = o ? `translateY(${-40 * o}%)` : '';
      l.style.opacity = 1 - o; l.style.filter = o ? `blur(${10 * o}px)` : '';
    });
    const ho = 1 - ss(0.025, 0.1, p);
    fade.forEach((el) => { el.style.setProperty('--o', ho); el.style.opacity = heroUI.classList.contains('in') ? ho : ''; });
    if (hint) hint.style.opacity = heroUI.classList.contains('in') ? 1 - ss(0.05, 0.1, p) : '';
    bar?.parentElement.parentElement.style.setProperty('--p', clamp(p / 0.5).toFixed(3));
    // 3. glinstering op de klaver en de naam
    const on = ss(0.585, 0.6, p), off = ss(0.632, 0.68, p);
    const sc = off ? lerp(1, 0.25, off) : on, rot = off ? lerp(10, 50, off) : lerp(-35, 10, on);
    spark.style.opacity = (on * (1 - off)).toFixed(3);
    spark.style.left = `${TX * 100}%`; spark.style.top = `${TY * 100}%`;
    spark.style.transform = `scale(${sc.toFixed(3)}) rotate(${rot.toFixed(1)}deg)`;
    const pk = ss(0.57, 0.6, p) * (1 - ss(0.68, 0.7, p));
    pick.style.opacity = pk.toFixed(3); pick.style.transform = `translateY(${(1 - pk) * 20}px)`;
    // 4. FLIP: film krimpt naar het midden van de vitrine
    const f = io(0.71, 0.95, p);
    const sr = stage.getBoundingClientRect(), r = slot.getBoundingClientRect();
    const L = (r.left - sr.left) * f, T = (r.top - sr.top) * f;
    screen.style.left = `${L}px`; screen.style.top = `${T}px`;
    screen.style.width = `${lerp(sr.width, r.width, f)}px`; screen.style.height = `${lerp(sr.height, r.height, f)}px`;
    const d = ss(0.74, 0.92, p);
    lines.forEach((l) => l.style.setProperty('--d', d.toFixed(3)));
    tops.forEach((t) => { t.style.opacity = ss(0.8, 0.93, p).toFixed(3); });
    const sd = ss(0.76, 0.95, p);
    sides.forEach((s) => { s.style.opacity = sd.toFixed(3); s.style.transform = `translateY(${(1 - sd) * 70}px)`; s.style.filter = sd < 0.99 ? `blur(${(14 * (1 - sd)).toFixed(1)}px)` : ''; });
    cap.style.opacity = ss(0.88, 0.97, p).toFixed(3);
  };
  // de canvas houdt de maat van het podium, ook als het scherm krimpt
  const filmP = () => clamp(-film.getBoundingClientRect().top / Math.max(1, film.offsetHeight - H()));
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => heroUI?.classList.add('in')));

  // ── manifest ────────────────────────────────────────────────────────────
  const over = $('[data-over]');
  const words = over ? $$('[data-words] span', over) : [];
  const objs = over ? $$('.obj', over) : [];
  const table = $('[data-over-table]');
  let mx = 0, my = 0, smx = 0, smy = 0;
  if (fine && !calm) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
  const overFrame = () => {
    const r = over.getBoundingClientRect(), mob = mobileQ.matches;
    const o = mob ? clamp((H() * 0.85 - r.top) / (H() * 0.4 + r.height * 0.4)) : clamp((H() * 0.55 - r.top) / (r.height - H() * 0.45));
    const n = Math.round(clamp(o * 1.15) * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
    table?.classList.toggle('in', o > 0.75);
    smx += (mx - smx) * 0.08; smy += (my - smy) * 0.08;
    objs.forEach((el) => {
      const dp = Number(el.dataset.depth), k = mob ? 0.35 : 1;
      const y = lerp(140 + 380 * dp, -120 - 300 * dp, o) * k;
      el.style.transform = `translate(${(smx * 60 * dp).toFixed(1)}px, ${(y + smy * 40 * dp).toFixed(1)}px) rotate(${(10 * dp * o).toFixed(1)}deg)`;
    });
  };

  // ── collectie ───────────────────────────────────────────────────────────
  const revealIO = new IntersectionObserver((es) => {
    let k = 0;
    es.forEach((e) => { if (e.isIntersecting) { e.target.style.setProperty('--i', k++); e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-piece]').forEach((el) => revealIO.observe(el));
  const tabs = $$('[data-tab]');
  const pickTab = (t, focus) => {
    tabs.forEach((b) => { const on = b === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    $$('[data-type]').forEach((g) => { g.hidden = g.dataset.type !== t.dataset.tab; });
    const shown = $(`[data-type="${t.dataset.tab}"]`);
    $('[data-coll-count]').textContent = $$('[data-piece]', shown).length;
    $$('[data-piece]', shown).forEach((el, i) => { el.classList.remove('in'); el.style.setProperty('--i', i); void el.offsetWidth; requestAnimationFrame(() => el.classList.add('in')); });
    if (focus) t.focus();
    update();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pickTab(t));
    t.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); pickTab(tabs[(i + d + tabs.length) % tabs.length], true); } });
  });
  $$('[data-goto]').forEach((a) => a.addEventListener('click', () => pickTab($(`[data-tab="${a.dataset.goto}"]`))));
  const par = $$('[data-par]');

  // ── seizoenen, giftcard, waarom, bestellen, voet ────────────────────────
  const fans = $$('[data-fan]');
  const gc = $('[data-gc]'), gift3d = $('[data-gift3d]');
  const strip = $('[data-strip]'), whyLines = $$('[data-why-line]');
  const slit = $('[data-slit]'), osteps = $$('[data-ostep]');
  const word = $('[data-word]'), letters = word ? $$('span', word) : [];
  const counted = new WeakSet();
  const countIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting || counted.has(e.target)) return;
    counted.add(e.target);
    const end = Number(e.target.dataset.count); if (calm || end < 10) return;
    const t0 = performance.now();
    const step = (t) => { const q = clamp((t - t0) / 1600); e.target.textContent = Math.round(end * (1 - (1 - q) ** 3)); if (q < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));
  const view = (el) => { const r = el.getBoundingClientRect(); return clamp((H() - r.top) / (H() + r.height)); };

  function update() {
    const y = scrollY;
    navScroll(y);
    if (calm) return;
    if (film && ready) filmFrame(filmP());
    if (over) overFrame();
    par.forEach((im) => {
      const r = im.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H()) return;
      const sp = Number(getComputedStyle(im.closest('[data-piece]') ?? im.parentElement).getPropertyValue('--sp')) || 0.6;
      im.style.transform = `translateY(${(((r.top + r.height / 2) / H() - 0.5) * sp * -5).toFixed(2)}%)`;
    });
    fans.forEach((f) => {
      const q = ss(0.1, 0.5, view(f));
      f.style.setProperty('--spread', (q * 58).toFixed(1)); f.style.setProperty('--rot', (q * 16).toFixed(1));
      f.style.setProperty('--tilt', (q * 5).toFixed(2)); f.style.setProperty('--z', (q * 80).toFixed(0));
    });
    if (gc && !gc.dataset.hover) {
      const v = view(gift3d);
      gc.style.setProperty('--ry', `${lerp(-34, 22, v).toFixed(1)}deg`); gc.style.setProperty('--rx', `${lerp(14, -6, v).toFixed(1)}deg`);
      gc.style.setProperty('--shine', `${lerp(-80, 80, v).toFixed(0)}%`);
    }
    if (strip) strip.style.setProperty('--open', ss(0.05, 0.55, view(strip)).toFixed(3));
    whyLines.forEach((l) => l.style.setProperty('--d', ss(0.15, 0.5, view(l.parentElement)).toFixed(3)));
    if (slit) { const v = ss(0.05, 0.55, view(slit)); slit.style.setProperty('--o', (1 - v).toFixed(3)); slit.querySelectorAll('img').forEach((im) => im.style.setProperty('--s', lerp(1.25, 1, v).toFixed(3))); }
    osteps.forEach((s, i) => { const v = view(s.parentElement); const fl = ss(0.25 + i * 0.1, 0.4 + i * 0.1, v); s.querySelector('.ostep__bar b').style.setProperty('--f', fl); s.classList.toggle('in', fl > 0.3); });
    if (word) { const v = clamp((H() - word.getBoundingClientRect().top) / (word.offsetHeight * 0.9)); letters.forEach((l, i) => l.style.setProperty('--w', ss(i * 0.1, 0.45 + i * 0.1, v).toFixed(3))); }
  }
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { size(); update(); });
  if (fine && !calm) { const loop = () => { if (over) { const r = over.getBoundingClientRect(); if (r.bottom > 0 && r.top < H()) overFrame(); } requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  if (calm) { osteps.forEach((s) => s.classList.add('in')); $$('[data-piece]').forEach((p) => p.classList.add('in')); }
  update();

  // giftcard: muis draait de kaart, bedrag kiezen draait hem om
  if (gc && fine && !calm) {
    gift3d.addEventListener('pointermove', (e) => { const r = gift3d.getBoundingClientRect(); gc.dataset.hover = 1; gc.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 50}deg`); gc.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -30}deg`); });
    gift3d.addEventListener('pointerleave', () => { delete gc.dataset.hover; update(); });
  }
  $$('input[name=gift]').forEach((r) => r.addEventListener('change', () => {
    $('[data-gc-amount]').textContent = `€ ${r.value}`;
    gc.classList.add('flip'); clearTimeout(gc._t); gc._t = setTimeout(() => gc.classList.remove('flip'), 1800);
  }));

  // stap-foto volgt de muis
  const peek = $('[data-peek]');
  if (peek && fine && !calm) osteps.forEach((s) => {
    s.addEventListener('pointerenter', () => { peek.src = s.dataset.img; peek.classList.add('on'); });
    s.addEventListener('pointermove', (e) => { peek.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 140}px)`; });
    s.addEventListener('pointerleave', () => peek.classList.remove('on'));
  });

  // ── tas ─────────────────────────────────────────────────────────────────
  const bagDlg = $('[data-bag]'), list = $('[data-bag-list]'), empty = $('[data-bag-empty]'), form = $('[data-bag-form]');
  const countEl = $('[data-bag-count]');
  if (!bagDlg) return;
  const SIZES = ['Weet ik niet', ...Array.from({ length: 13 }, (_, i) => String(48 + i))];
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem('sj-bag') || '[]'); } catch {}
  const toast = $('[data-toast]');
  const say = (m) => { toast.textContent = m; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 2800); };
  const save = () => { try { localStorage.setItem('sj-bag', JSON.stringify(bag)); } catch {} };
  const label = (it) => it.gift ? `Giftcard € ${it.gift}` : DATA.pieces[it.id]?.name;
  const render = () => {
    const n = bag.reduce((a, it) => a + it.qty, 0);
    countEl.textContent = n || '';
    $$('[data-add]').forEach((b) => { const inn = bag.some((it) => it.id === b.dataset.add); b.classList.toggle('is-in', inn); b.firstElementChild.textContent = inn ? 'In je tas' : 'In tas'; });
    empty.hidden = bag.length > 0; form.hidden = !bag.length;
    list.innerHTML = bag.map((it, i) => {
      const p = DATA.pieces[it.id];
      const thumb = it.gift ? `<span class="bag__gc">€${it.gift}</span>` : `<img src="${p.img}" alt="">`;
      const size = p?.type === 'ringen' ? `<label><span class="sr-only">Ringmaat</span><select data-size="${i}" aria-label="Ringmaat ${p.name}">${SIZES.map((s) => `<option${s === it.size ? ' selected' : ''} value="${s}">${s === 'Weet ik niet' ? 'Maat: weet ik niet' : `Maat ${s}`}</option>`).join('')}</select></label>` : '';
      return `<li>${thumb}<div><b>${label(it)}</b><small>${it.gift ? 'Giftcard' : `${p.detail} · 14k goud`}</small>${size}</div><div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="Eén minder ${label(it)}">−</button><span>${it.qty}</span><button type="button" data-q="${i}" data-d="1" aria-label="Eén meer ${label(it)}">+</button></div></li>`;
    }).join('');
  };
  const add = (item) => {
    const same = bag.find((it) => it.id === item.id && it.gift === item.gift);
    if (same) same.qty++; else bag.push({ qty: 1, ...item });
    save(); render();
    const nb = $('.nav__bag'); nb.classList.remove('pulse'); void nb.offsetWidth; nb.classList.add('pulse');
    nav.classList.remove('is-hidden');
    say(`${label(item)} zit in je tas`);
  };
  $$('[data-add]').forEach((b) => b.addEventListener('click', () => add({ id: b.dataset.add })));
  $('[data-add-gift]')?.addEventListener('click', () => add({ id: 'giftcard', gift: Number($('input[name=gift]:checked').value) }));
  list?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const it = bag[b.dataset.q]; it.qty += Number(b.dataset.d);
    if (it.qty < 1) bag.splice(b.dataset.q, 1);
    save(); render();
  });
  list?.addEventListener('change', (e) => { const s = e.target.closest('[data-size]'); if (s) { bag[s.dataset.size].size = s.value; save(); } });
  $$('[data-bag-open]').forEach((b) => b.addEventListener('click', () => { render(); bagDlg.showModal(); }));
  $('[data-bag-close]')?.addEventListener('click', () => bagDlg.close());
  bagDlg?.addEventListener('click', (e) => { if (e.target === bagDlg) bagDlg.close(); });
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('[data-bag-err]'), name = form.elements.name;
    if (!name.value.trim()) { name.setAttribute('aria-invalid', 'true'); err.textContent = 'Vul je naam in.'; name.focus(); return; }
    name.removeAttribute('aria-invalid'); err.textContent = '';
    const lines = bag.map((it) => {
      const p = DATA.pieces[it.id];
      const extra = p?.type === 'ringen' ? ` (maat: ${it.size && it.size !== 'Weet ik niet' ? it.size : 'weet ik nog niet'})` : '';
      return `• ${it.qty}× ${label(it)}${extra}`;
    });
    const text = ['Hoi Selina! Ik wil graag bestellen:', ...lines, '', `Naam: ${name.value.trim()}`, form.elements.ship.value, form.elements.note.value.trim() ? `Opmerking: ${form.elements.note.value.trim()}` : '', '', 'Kun je de prijs en beschikbaarheid laten weten?'].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
    open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    say('WhatsApp opent met je bestelling');
  });
  render();
})();
