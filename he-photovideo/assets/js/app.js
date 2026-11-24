// HE Photovideo: alle interactie, zonder bibliotheken.
// 3D-fototunnel in de hero, coverflow per gelegenheid, foto/film-vouw,
// filmspeler (preview), datumkalender met beschikbaarheid en de aanvraag.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const data = JSON.parse($('#he-data')?.textContent || '{}');

  // ── onthullen ────────────────────────────────────────────────────────────
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  $$('.reveal, .title').forEach((el) => io.observe(el));
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => {
    $('.hero__title')?.classList.add('in');
    $('.hero__copy')?.classList.add('in');
  }));

  // woorden die oplichten tijdens het scrollen
  const words = $('[data-words]');
  if (words) words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const wordEls = words ? $$('.w', words) : [];

  // ── 3D-tunnel ───────────────────────────────────────────────────────────
  const hero = $('[data-hero]');
  const cam = $('[data-tunnel]');
  const frames = cam ? $$('.frame', cam) : [];
  const GAP = 720;
  const place = frames.map((_, i) => {
    const last = i === frames.length - 1;
    const side = i % 2 ? 1 : -1;
    return { x: last ? 0 : side * (0.55 + ((i * 7) % 3) * 0.18), y: last ? 0 : (((i * 5) % 3) - 1) * 0.16, r: last ? 0 : side * -6, z: -i * GAP };
  });
  let mx = 0, my = 0;
  const tunnel = (p) => {
    if (!cam) return;
    const w = innerWidth, h = innerHeight;
    const spread = Math.min(w * (w < 700 ? 0.42 : 0.33), 460);
    const camZ = p * (frames.length - 1) * GAP + p * 320;
    frames.forEach((f, i) => {
      const P = place[i];
      const z = P.z + camZ;
      const near = smooth(-GAP * 4.5, -GAP * 3.2, z);
      const gone = 1 - smooth(260, 640, z);
      const last = i === frames.length - 1;
      f.style.opacity = (last ? near : near * gone).toFixed(3);
      f.style.setProperty('--g', (1 - smooth(-GAP * 1.2, 0, z) * 0.9).toFixed(2));
      f.style.transform = `translate3d(${(P.x * spread + mx * (z + 3000) * 0.012).toFixed(1)}px, ${(P.y * h + my * (z + 3000) * 0.008).toFixed(1)}px, ${Math.min(z, last ? 260 : 900).toFixed(0)}px) rotateY(${P.r}deg)`;
    });
    hero.style.setProperty('--copy', (1 - smooth(0.02, 0.14, p)).toFixed(3));
    $('.vf__focus', hero)?.style.setProperty('--focus', p > 0.9 ? 1 : 0);
    const mode = $$('[data-mode] span', hero);
    if (mode.length) { mode[0].classList.toggle('on', p <= 0.5); mode[1].classList.toggle('on', p > 0.5); }
  };
  if (fine && !calm && hero) hero.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  // tijdcode die meeloopt zolang de hero in beeld is
  const tc = $('[data-timecode]');
  let heroOn = true;
  if (hero) new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; }).observe(hero);
  const t0 = performance.now();
  const tick = (now) => {
    if (heroOn && tc) {
      const s = (now - t0) / 1000;
      const p2 = (n) => String(Math.floor(n)).padStart(2, '0');
      tc.textContent = `${p2(s / 3600)}:${p2((s / 60) % 60)}:${p2(s % 60)}:${p2((s * 25) % 25)}`;
    }
    if (heroOn && fine && !calm) onScroll();
    requestAnimationFrame(tick);
  };
  if (!calm) requestAnimationFrame(tick);

  // ── scroll ──────────────────────────────────────────────────────────────
  const masthead = $('[data-masthead]');
  const bar = $('[data-progress]');
  const dock = $('[data-dock]');
  const req = $('#aanvraag');
  const duo = $('[data-duo]');
  const strip = $('[data-strip-track]');
  function onScroll() {
    const y = scrollY, H = innerHeight;
    bar?.style.setProperty('--p', (y / Math.max(1, document.documentElement.scrollHeight - H)).toFixed(4));
    masthead?.classList.toggle('is-scrolled', y > 40);
    if (hero) {
      const p = calm ? 0 : clamp(y / Math.max(1, hero.offsetHeight - H), 0, 1);
      tunnel(p);
      if (dock) { const r = req?.getBoundingClientRect(); dock.classList.toggle('show', y > hero.offsetHeight - H && !(r && r.top < H && r.bottom > 0)); }
    }
    if (wordEls.length) {
      const r = words.getBoundingClientRect();
      const q = clamp((H * 0.85 - r.top) / (r.height + H * 0.35), 0, 1);
      const n = calm ? wordEls.length : Math.round(q * wordEls.length);
      wordEls.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    if (duo && !calm) {
      const r = duo.getBoundingClientRect();
      const q = smooth(H, H * 0.35, r.top);
      duo.style.setProperty('--ry1', `${((1 - q) * 70).toFixed(1)}deg`);
      duo.style.setProperty('--ry2', `${((1 - q) * -70).toFixed(1)}deg`);
    }
    if (strip && !calm) {
      const r = strip.getBoundingClientRect();
      strip.style.setProperty('--sx', `${(smooth(H, H * 0.45, r.top) * -28 + 28).toFixed(1)}deg`);
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { onScroll(); $$('[data-flow]').forEach((f) => f._layout?.()); });
  onScroll();

  // ── tilt en magnetische knoppen ─────────────────────────────────────────
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -8}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`; });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  // ── lightbox ────────────────────────────────────────────────────────────
  const lb = $('[data-lightbox]');
  let lbList = [], lbI = 0;
  const lbShow = () => { const b = lbList[lbI]; $('[data-lightbox-img]', lb).src = b.dataset.zoom; $('[data-lightbox-img]', lb).alt = b.dataset.label; $('[data-lightbox-cap]', lb).textContent = b.dataset.label; };
  const lbOpen = (list, i) => { lbList = list; lbI = i; lbShow(); lb.showModal(); };
  const lbStep = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; lbShow(); };
  if (lb) {
    $('[data-lightbox-close]', lb).onclick = () => lb.close();
    $('[data-lightbox-prev]', lb).onclick = () => lbStep(-1);
    $('[data-lightbox-next]', lb).onclick = () => lbStep(1);
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') lbStep(-1); if (e.key === 'ArrowRight') lbStep(1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  }

  // ── coverflow per gelegenheid ───────────────────────────────────────────
  $$('[data-panel]').forEach((panel) => {
    const flow = $('[data-flow]', panel);
    const items = $$('.flow__item', flow);
    const cards = items.map((it) => $('.flow__card', it));
    const count = $('[data-flow-i]', panel);
    let idx = 0;
    const layout = () => {
      const w = items[0].offsetWidth;
      const step = w * (innerWidth < 700 ? 0.5 : 0.62);
      items.forEach((it, j) => {
        const d = j - idx, a = Math.abs(d), s = Math.sign(d);
        it.style.transform = `translateX(${d * step}px) translateZ(${-a * 200}px) rotateY(${-s * Math.min(a, 1) * 40}deg)`;
        it.style.opacity = a > 3 ? 0 : 1;
        it.style.zIndex = 100 - a;
        it.style.filter = a ? `grayscale(.85) brightness(${(0.75 - a * 0.08).toFixed(2)})` : 'none';
        it.style.pointerEvents = a > 3 ? 'none' : '';
        cards[j].tabIndex = a ? -1 : 0;
        cards[j].setAttribute('aria-hidden', a > 3 ? 'true' : 'false');
      });
      count.textContent = String(idx + 1).padStart(2, '0');
    };
    const go = (i) => { idx = clamp(i, 0, items.length - 1); layout(); };
    flow._layout = layout;
    cards.forEach((c, j) => c.addEventListener('click', () => { if (moved) return; if (j === idx) lbOpen(cards, j); else go(j); }));
    $('[data-flow-prev]', panel).onclick = () => go(idx - 1);
    $('[data-flow-next]', panel).onclick = () => go(idx + 1);
    flow.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); cards[idx].focus({ preventScroll: true }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); cards[idx].focus({ preventScroll: true }); }
    });
    let x0 = null, moved = false;
    flow.addEventListener('pointerdown', (e) => { x0 = e.clientX; moved = false; });
    flow.addEventListener('pointermove', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 10) moved = true; });
    flow.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); setTimeout(() => { moved = false; }, 0); });
    flow.addEventListener('pointercancel', () => { x0 = null; });
    if (!panel.hidden) layout();
  });

  const tabs = $$('[data-tab]');
  const pick = (tab, focus) => {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('[data-panel]').forEach((p) => {
      const on = p.dataset.panel === tab.dataset.tab;
      p.hidden = !on;
      p.classList.remove('is-in');
      if (on) { $('[data-flow]', p)._layout(); void p.offsetWidth; if (!calm) p.classList.add('is-in'); }
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  // ── filmspeler (preview: langzame camerabeweging over de still) ─────────
  const pl = $('[data-player]');
  if (pl) {
    const pImg = $('[data-player-img]', pl), pBar = $('[data-player-bar]', pl), pTime = $('[data-player-time]', pl), pBtn = $('[data-player-toggle]', pl);
    const DUR = 30;
    let t = 0, last = 0, playing = false, raf = 0;
    const playIcon = pBtn.innerHTML;
    const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
    const fmt = (s) => `0:${String(Math.floor(s)).padStart(2, '0')}`;
    const draw = () => {
      const q = t / DUR;
      pBar.style.setProperty('--t', q.toFixed(4));
      pTime.textContent = `${fmt(t)} / ${fmt(DUR)}`;
      if (!calm) { pImg.style.setProperty('--kb', (1.03 + q * 0.2).toFixed(4)); pImg.style.setProperty('--ox', `${40 + q * 20}%`); }
    };
    const loop = (now) => { if (!playing) return; t = Math.min(DUR, t + (now - last) / 1000); last = now; draw(); if (t >= DUR) return setPlaying(false); raf = requestAnimationFrame(loop); };
    const setPlaying = (on) => {
      playing = on; cancelAnimationFrame(raf);
      pBtn.innerHTML = on ? pauseIcon : playIcon;
      pBtn.setAttribute('aria-label', on ? 'Pauzeer' : 'Speel af');
      if (on) { if (t >= DUR) t = 0; last = performance.now(); raf = requestAnimationFrame(loop); }
    };
    pBtn.onclick = () => setPlaying(!playing);
    $$('[data-film]').forEach((b) => b.addEventListener('click', () => {
      pImg.src = b.dataset.film;
      $('[data-player-title]', pl).textContent = b.dataset.title;
      $('[data-player-kind]', pl).textContent = b.dataset.kind;
      t = 0; draw(); pl.showModal(); setPlaying(true);
    }));
    $('[data-player-close]', pl).onclick = () => pl.close();
    pl.addEventListener('close', () => setPlaying(false));
    pl.addEventListener('click', (e) => { if (e.target === pl) pl.close(); });
  }

  // ── kalender met (demo-)beschikbaarheid ─────────────────────────────────
  const cal = $('[data-cal]');
  const form = $('[data-form]');
  const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nice = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  // Demo: weekenden zijn drukker. Vaste uitkomst per datum, zodat het klopt bij herladen.
  const status = (d) => {
    if (d < today) return 'past';
    const s = iso(d); let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 1000;
    const r = h % 10, wd = d.getDay();
    if (wd === 6) return r < 4 ? 'full' : r < 7 ? 'few' : 'free';
    if (wd === 0 || wd === 5) return r < 2 ? 'full' : r < 4 ? 'few' : 'free';
    return r < 1 ? 'few' : 'free';
  };
  const LABEL = { free: 'vrij', few: 'nog 1 plek vrij', full: 'volgeboekt', past: 'voorbij' };
  let view = new Date(today.getFullYear(), today.getMonth(), 1), chosen = null;
  const drawCal = () => {
    if (!cal) return;
    $('[data-cal-month]', cal).textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    const first = (view.getDay() + 6) % 7, n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let html = '<span></span>'.repeat(first);
    for (let i = 1; i <= n; i++) {
      const d = new Date(view.getFullYear(), view.getMonth(), i), s = status(d), k = iso(d);
      const off = s === 'full' || s === 'past';
      html += `<button class="day${+d === +today ? ' is-today' : ''}" type="button" data-day="${k}" data-s="${s}" aria-pressed="${chosen === k}" aria-label="${nice(d)}, ${LABEL[s]}"${off ? ' disabled' : ''}>${i}</button>`;
    }
    $('[data-cal-grid]', cal).innerHTML = html;
    $('[data-cal-prev]', cal).disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
  };
  if (cal) {
    $('[data-cal-prev]', cal).onclick = () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal(); };
    $('[data-cal-next]', cal).onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal(); };
    $('[data-cal-grid]', cal).addEventListener('click', (e) => {
      const b = e.target.closest('[data-day]'); if (!b || b.disabled) return;
      chosen = b.dataset.day;
      $$('[data-day]', cal).forEach((x) => x.setAttribute('aria-pressed', x === b));
      const d = new Date(`${chosen}T12:00`), s = b.dataset.s;
      const out = $('[data-date-out]', form);
      out.className = `form__date is-${s === 'few' ? 'few' : 'ok'}`;
      out.innerHTML = `<span>Jullie datum</span><b>${nice(d)}</b><em>${s === 'few' ? 'Nog 1 plek vrij' : 'Vrij'}</em>`;
      $('[data-date-input]', form).value = chosen;
      $('[data-error]', form).textContent = '';
      update();
    });
    drawCal();
  }

  // ── aanvraag ────────────────────────────────────────────────────────────
  const toast = $('[data-toast]');
  const say = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 4200); };
  const message = () => {
    const f = new FormData(form);
    const date = f.get('date') ? nice(new Date(`${f.get('date')}T12:00`)) : '(nog geen datum)';
    return [
      'Hoi HE Photovideo! Wij willen graag een aanvraag doen:',
      `• Datum: ${date}`,
      `• Gelegenheid: ${data.occasions?.[f.get('occasion')] ?? f.get('occasion')}`,
      `• Wat we zoeken: ${data.packages?.[f.get('package')] ?? f.get('package')}`,
      `• Locatie: ${[f.get('venue'), f.get('place')].filter(Boolean).join(', ') || '-'}`,
      `• Namen: ${f.get('name') || '-'}`,
      `• Telefoon: ${f.get('phone') || '-'}`,
      f.get('note') ? `• Opmerking: ${f.get('note')}` : '',
    ].filter(Boolean).join('\n');
  };
  const update = () => { if (form) $('[data-preview]', form).textContent = message(); };
  if (form) {
    form.addEventListener('input', (e) => { e.target.removeAttribute('aria-invalid'); update(); });
    update();
    // knoppen elders op de pagina vullen het formulier alvast in
    $$('[data-occ], [data-pkg]').forEach((a) => a.addEventListener('click', () => {
      if (a.dataset.occ) $(`input[name=occasion][value="${a.dataset.occ}"]`, form).checked = true;
      if (a.dataset.pkg) $(`input[name=package][value="${a.dataset.pkg}"]`, form).checked = true;
      update();
      form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash');
    }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('[data-error]', form);
      if (!form.date.value) { err.textContent = 'Kies eerst jullie datum in de kalender.'; $('[data-cal-grid] button:not([disabled])', cal)?.focus(); return; }
      const bad = $$('[required]', form).filter((i) => !i.value.trim() || (i.name === 'phone' && i.value.replace(/\D/g, '').length < 9));
      bad.forEach((i) => i.setAttribute('aria-invalid', 'true'));
      if (bad.length) { err.textContent = 'Vul nog in: ' + bad.map((i) => i.closest('.field').querySelector('span').textContent.toLowerCase()).join(', ') + '.'; bad[0].focus(); return; }
      err.textContent = '';
      const text = message();
      try { const all = JSON.parse(localStorage.getItem('he-demo-requests') || '[]'); all.push({ at: Date.now(), ...Object.fromEntries(new FormData(form)) }); localStorage.setItem('he-demo-requests', JSON.stringify(all)); } catch {}
      if (form.dataset.wa) { open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener'); say('WhatsApp opent met jullie aanvraag.'); return; }
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; } catch {}
      open(`https://ig.me/m/${form.dataset.ig}`, '_blank', 'noopener');
      say(copied ? 'Aanvraag gekopieerd. Plak hem in het Instagram-bericht en verstuur.' : 'Instagram opent. Kopieer jullie aanvraag hierboven en plak hem in het bericht.');
    });
  }
})();
