// Moso Barbershop — interactie. Geen bibliotheken: één rAF-lus voor de hero,
// één scroll-handler (cuts-galerij, parallax, munt), IntersectionObservers voor onthullingen.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wide = matchMedia('(min-width: 901px)');

  // ── onthullingen ─────────────────────────────────────────────────────────
  // Een volledig weggeknipt element (clip-path) snijdt de viewport nooit; observeer de ouder.
  const targets = new Map();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    (targets.get(e.target) ?? [e.target]).forEach((el) => el.classList.add('in'));
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal, .title, .display').forEach((el) => io.observe(el));
  $$('.reveal-img').forEach((el) => { const p = el.parentElement; targets.set(p, [...(targets.get(p) ?? []), el]); io.observe(p); });

  // ── openingstijden: vandaag + open/gesloten (tijd in Nederland) ─────────
  const form = $('[data-form]');
  const hours = form ? JSON.parse(form.dataset.hours) : null;
  const dayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const short = (t) => t.replace(/^0/, '');
  if (hours) {
    const nl = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
    const d = nl.getDay();
    const now = `${String(nl.getHours()).padStart(2, '0')}:${String(nl.getMinutes()).padStart(2, '0')}`;
    $$(`[data-hours] tr[data-day="${d}"]`).forEach((tr) => tr.classList.add('is-today'));
    const today = hours[d];
    let open = false, text;
    if (today && now >= today[0] && now < today[1]) { open = true; text = `Nu open · tot ${short(today[1])}`; }
    else if (today && now < today[0]) text = `Gesloten · vandaag open vanaf ${short(today[0])}`;
    else {
      let n = 1; while (n < 7 && !hours[(d + n) % 7]) n++;
      const nd = (d + n) % 7;
      text = `Gesloten · ${n === 1 ? 'morgen' : dayNames[nd]} open vanaf ${short(hours[nd][0])}`;
    }
    const chip = $('[data-status]');
    if (chip) { chip.hidden = false; chip.classList.toggle('is-open', open); $('[data-status-text]', chip).textContent = text; }
    const inline = $('[data-status-inline]');
    if (inline) inline.textContent = `${text}. Openingstijden kunnen rond feestdagen afwijken.`;
  }

  // ── hero: 3D-rig + honingraatlicht ───────────────────────────────────────
  const hero = $('[data-hero]');
  const rig = $('[data-rig]');
  const spot = $('[data-spot]');
  const pointer = { x: 0, y: 0, px: innerWidth * 0.7, py: innerHeight * 0.3, active: false };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1;
    pointer.px = e.clientX; pointer.py = e.clientY; pointer.active = true;
  }, { passive: true });
  if (hero) {
    (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => {
      $('.hero__title').classList.add('in'); $('[data-stage]')?.classList.add('is-ready');
    }));
  }
  if (rig && !calm) {
    const cur = { x: 0, y: 0, d: 0, sx: pointer.px, sy: pointer.py };
    let visible = true, running = false;
    const t0 = performance.now();
    const frame = (t) => {
      running = false;
      if (!visible) return;
      const p = clamp(scrollY / hero.offsetHeight, 0, 1);
      let tx = pointer.x, ty = pointer.y, sx = pointer.px, sy = pointer.py + scrollY;
      if (!pointer.active) { // touch: rustige automatische beweging
        const s = (t - t0) / 1000;
        tx = Math.sin(s * 0.45) * 0.45; ty = Math.cos(s * 0.33) * 0.3;
        sx = innerWidth * (0.5 + Math.sin(s * 0.3) * 0.35); sy = innerHeight * (0.35 + Math.cos(s * 0.25) * 0.2);
      }
      const intro = 1 - Math.pow(1 - clamp((t - t0) / 1500, 0, 1), 3);
      cur.x = lerp(cur.x, tx, 0.06); cur.y = lerp(cur.y, ty + p * 0.9, 0.06);
      cur.d = lerp(cur.d, intro * (1 + p * 0.8), 0.08);
      cur.sx = lerp(cur.sx, sx, 0.12); cur.sy = lerp(cur.sy, sy, 0.12);
      rig.style.setProperty('--rx', cur.x.toFixed(4));
      rig.style.setProperty('--ry', cur.y.toFixed(4));
      rig.style.setProperty('--depth', cur.d.toFixed(4));
      spot?.style.setProperty('--sx', `${cur.sx.toFixed(0)}px`);
      spot?.style.setProperty('--sy', `${(cur.sy + innerHeight * 0.1).toFixed(0)}px`);
      loop();
    };
    const loop = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(hero);
  } else if (rig) rig.style.setProperty('--depth', '.6');

  // ── scroll: voortgang, kop, dock, cuts-galerij, parallax, munt ──────────
  const masthead = $('[data-masthead]');
  const bar = $('[data-progress]');
  const dock = $('[data-dock]');
  const cutsSec = $('[data-cuts]');
  const pin = $('[data-pin]');
  const track = $('[data-track]');
  const cards = $$('.cut__card');
  const nowEl = $('[data-cut-now]');
  const parallax = $$('[data-parallax]');
  const scaleEl = $('[data-scale]');
  const coin = $('[data-coin]');
  let overflow = 0;
  const measure = () => {
    if (!cutsSec) return;
    if (!wide.matches || calm) { cutsSec.style.removeProperty('--h'); overflow = 0; return; }
    overflow = Math.max(0, track.scrollWidth - (pin.clientWidth - track.offsetLeft));
    cutsSec.style.setProperty('--h', `${pin.offsetHeight + overflow}px`);
  };
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (masthead && !document.body.classList.contains('is-plain')) {
      masthead.classList.toggle('is-scrolled', y > 40);
      masthead.classList.toggle('is-hidden', y > lastY && y > vh && $('#sheet')?.hidden !== false);
    }
    if (dock) {
      const near = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < vh && r.bottom > 0; };
      dock.classList.toggle('on', y > vh * 0.8 && !near($('#afspraak')) && !near($('.footer')));
    }
    if (cutsSec && overflow > 0) {
      const r = cutsSec.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      track.style.setProperty('--x', `${(-p * overflow).toFixed(1)}px`);
      let best = 0, bestD = Infinity;
      cards.forEach((card, i) => {
        const cr = card.getBoundingClientRect();
        const dist = (cr.left + cr.width / 2 - innerWidth * 0.62) / innerWidth;
        card.style.setProperty('--turn', clamp(-dist * 26, -16, 16).toFixed(2));
        if (Math.abs(dist) < bestD) { bestD = Math.abs(dist); best = i; }
      });
      if (nowEl) nowEl.textContent = String(best + 1).padStart(2, '0');
    }
    if (!calm) {
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`;
      }
      if (scaleEl) {
        const r = scaleEl.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) scaleEl.style.setProperty('--sc', (1.18 - clamp((vh - r.top) / (vh + r.height), 0, 1) * 0.18).toFixed(4));
      }
      if (coin) {
        const r = coin.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) coin.style.setProperty('--spin', ((0.5 - (r.top + r.height / 2) / vh) * 70).toFixed(1));
      }
    }
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  addEventListener('load', () => { measure(); onScroll(); });
  measure(); onScroll();

  // actieve menu-item
  const navLinks = $$('.nav a');
  const navIo = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.toggleAttribute('aria-current', new URL(a.href).hash === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  navLinks.map((a) => $(new URL(a.href).hash)).filter(Boolean).forEach((s) => navIo.observe(s));

  // ── mobiel menu ──────────────────────────────────────────────────────────
  const burger = $('.burger');
  const sheet = $('#sheet');
  if (burger && sheet) {
    const close = (focus = true) => { sheet.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; if (focus) burger.focus(); };
    burger.addEventListener('click', () => { sheet.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $('.sheet__close', sheet).focus(); });
    $('.sheet__close', sheet).addEventListener('click', () => close());
    $$('a', sheet).forEach((a) => a.addEventListener('click', () => close(false)));
    sheet.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      const f = $$('a, button', sheet); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // ── magnetische knoppen, kantelkaarten, lichtval op het marmer ──────────
  if (fine && !calm) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px`);
        el.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
    });
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.classList.add('is-tilting');
        el.style.setProperty('--rx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        el.style.setProperty('--ry', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      el.addEventListener('pointerleave', () => { el.classList.remove('is-tilting'); el.style.setProperty('--rx', 0); el.style.setProperty('--ry', 0); });
    });
    const slab = $('[data-slab]');
    slab?.addEventListener('pointermove', (e) => {
      const r = slab.getBoundingClientRect();
      slab.style.setProperty('--lx', `${e.clientX - r.left}px`); slab.style.setProperty('--ly', `${e.clientY - r.top}px`);
    });
    const finale = $('[data-finale]');
    finale?.addEventListener('pointermove', () => { coin.style.setProperty('--rx', pointer.x.toFixed(3)); coin.style.setProperty('--ry', pointer.y.toFixed(3)); });
  }

  // ── cuts: lightbox ───────────────────────────────────────────────────────
  const box = $('[data-lightbox]');
  if (box && cards.length) {
    const stage = $('[data-stage]', box), cap = $('[data-caption]', box), count = $('[data-count]', box);
    let at = 0, opener = null;
    const show = (i) => {
      at = (i + cards.length) % cards.length;
      const im = $('img', cards[at]);
      stage.innerHTML = `<img src="${im.src}" alt="${im.alt}" width="${im.width}" height="${im.height}">`;
      cap.innerHTML = `${$('.cut__meta strong', cards[at]).textContent}<span>${$('.cut__meta small', cards[at]).textContent}</span>`;
      count.textContent = `${at + 1} / ${cards.length}`;
    };
    cards.forEach((c, i) => c.addEventListener('click', () => { opener = c; show(i); box.showModal(); }));
    $('[data-prev]', box).addEventListener('click', () => show(at - 1));
    $('[data-next]', box).addEventListener('click', () => show(at + 1));
    $('[data-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(at + 1); if (e.key === 'ArrowLeft') show(at - 1); });
    box.addEventListener('close', () => opener?.focus());
    let sx = null;
    box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1)); });
  }

  // ── afspraakformulier ────────────────────────────────────────────────────
  if (!form) return;
  const result = $('[data-result]');
  const summary = $('[data-summary]');
  const submit = $('[data-submit]', form);
  const totalEl = $('[data-total]', form);
  const timeSel = form.elements.tijd;
  const dayHint = $('[data-day-hint]', form);
  const val = (n) => form.elements[n]?.value?.trim() ?? '';
  const service = () => form.querySelector('[name=dienst]:checked');
  const extras = () => $$('[name=extra]:checked', form);
  const fmt = (n) => `€ ${n}`;
  const dayOf = (s) => new Date(`${s}T12:00:00`).getDay();
  const longDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  const total = () => {
    const sum = (Number(service()?.dataset.price) || 0) + extras().reduce((s, i) => s + Number(i.dataset.price), 0);
    totalEl.value = fmt(sum); totalEl.textContent = fmt(sum);
    return sum;
  };
  const fillTimes = () => {
    const d = val('datum');
    const prev = timeSel.value;
    timeSel.innerHTML = '';
    const h = d ? hours[dayOf(d)] : null;
    if (!d) { timeSel.add(new Option('Kies eerst een datum', '')); dayHint.textContent = ''; return; }
    if (!h) { timeSel.add(new Option('Gesloten op deze dag', '')); dayHint.textContent = `Op ${dayNames[dayOf(d)]} is de zaak gesloten.`; return; }
    dayHint.textContent = `Open van ${short(h[0])} tot ${h[1]}.`;
    timeSel.add(new Option('Geen voorkeur', ''));
    const [oh, om] = h[0].split(':').map(Number), [ch, cm] = h[1].split(':').map(Number);
    for (let m = oh * 60 + om; m <= ch * 60 + cm - 30; m += 30) {
      const t = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
      timeSel.add(new Option(t, t));
    }
    if ([...timeSel.options].some((o) => o.value === prev)) timeSel.value = prev;
  };
  form.addEventListener('change', (e) => { if (e.target.name === 'datum') fillTimes(); total(); if (tried) validate(); });
  form.addEventListener('input', () => { if (tried) validate(); });

  $$('[data-pick]').forEach((a) => a.addEventListener('click', () => {
    const r = form.querySelector(`[name=dienst][value="${a.dataset.pick}"]`);
    if (!r) return;
    r.checked = true; total();
    if (!result.hidden) back();
  }));

  const rules = {
    dienst: () => (service() ? '' : 'Kies een dienst.'),
    datum: () => {
      const d = val('datum');
      if (!d) return 'Kies een datum.';
      if (d < new Date().toISOString().slice(0, 10)) return 'Kies een datum vanaf vandaag.';
      return hours[dayOf(d)] ? '' : `Op ${dayNames[dayOf(d)]} is de zaak gesloten. Kies een andere dag.`;
    },
    naam: () => (val('naam').length >= 2 ? '' : 'Vul je naam in.'),
    telefoon: () => { const n = val('telefoon').replace(/\D/g, '').length; return n >= 10 && n <= 13 ? '' : 'Vul een geldig telefoonnummer in, bijvoorbeeld 06 12345678.'; },
  };
  let tried = false;
  const validate = () => {
    const errors = [];
    for (const [name, rule] of Object.entries(rules)) {
      const field = $(`[data-field="${name}"]`, form);
      const msg = rule();
      $('[data-err]', field).textContent = msg;
      const ctl = field.matches('fieldset') ? field : $('input, select, textarea', field);
      if (msg) { ctl.setAttribute('aria-invalid', 'true'); errors.push([name, msg]); } else ctl.removeAttribute('aria-invalid');
      if (field.matches('fieldset')) ctl.setAttribute('aria-describedby', `err-${name}`);
    }
    return errors;
  };
  const data = () => ({
    dienst: service()?.dataset.label ?? '', extra: extras().map((i) => i.value), totaal: fmt(total()),
    datum: val('datum'), tijd: val('tijd'), naam: val('naam'), telefoon: val('telefoon'), bericht: val('bericht'),
  });
  const toText = (d) => [
    'Hoi Moso Barbershop! Ik wil graag een afspraak.', '',
    `Dienst: ${d.dienst}${d.extra.length ? ` + ${d.extra.join(', ').toLowerCase()}` : ''} (${d.totaal})`,
    `Wanneer: ${longDate(d.datum)}${d.tijd ? ` rond ${d.tijd}` : ''}`,
    '', `Naam: ${d.naam}`, `Telefoon: ${d.telefoon}`,
    d.bericht ? `\nOpmerking: ${d.bericht}` : null,
  ].filter((x) => x !== null).join('\n');

  const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const arrow = $('.arr', submit).outerHTML;
  const back = () => { result.hidden = true; form.hidden = false; $('[name=dienst]', form).focus(); };
  const show = (html) => {
    form.hidden = true; result.hidden = false; result.innerHTML = html; result.focus();
    $('[data-back]', result)?.addEventListener('click', back);
    const status = $('[data-status-msg]', result);
    const copy = async () => {
      const text = $('pre', result).textContent;
      try { await navigator.clipboard.writeText(text); status.textContent = 'Bericht gekopieerd.'; }
      catch {
        const range = document.createRange(); range.selectNodeContents($('pre', result));
        getSelection().removeAllRanges(); getSelection().addRange(range);
        status.textContent = 'Het bericht is geselecteerd: kopieer het met Ctrl+C of Cmd+C.';
      }
    };
    $('[data-copy]', result)?.addEventListener('click', copy);
    $('[data-dm]', result)?.addEventListener('click', copy);
  };
  const handoff = (text, failed) => `
    <p class="eyebrow"><span>${failed ? 'Versturen mislukt' : 'Nog één stap'}</span></p>
    <h3>${failed ? 'Je aanvraag is <span class="chrome">niet</span> aangekomen.' : 'Stuur je aanvraag <span class="chrome">naar Moso.</span>'}</h3>
    <p class="body">${failed ? 'Er ging iets mis bij het versturen. Bel de zaak of stuur het bericht hieronder zelf.' : 'Er is nog niets verstuurd en er is nog geen afspraak. Bel de zaak, of kopieer het bericht en stuur het via Instagram. Je afspraak staat vast zodra de zaak hem bevestigt.'}</p>
    <pre>${esc(text)}</pre>
    <div class="actions">
      <a class="btn btn--chrome" href="${form.dataset.tel}"><span>Bel ${form.dataset.phone}</span>${arrow}</a>
      ${form.dataset.whatsapp ? `<a class="btn btn--ghost" href="https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener"><span>WhatsApp</span>${arrow}</a>` : ''}
      <button type="button" class="btn btn--ghost" data-copy><span>Kopieer bericht</span>${arrow}</button>
      <a class="link" href="${form.dataset.dm}" target="_blank" rel="noopener" data-dm><span>Open Instagram-DM</span>${arrow}</a>
    </div>
    <p class="form__status" data-status-msg aria-live="polite"></p>
    <button type="button" class="form__back" data-back>Gegevens aanpassen</button>`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.website.value) return; // honeypot
    tried = true;
    const errors = validate();
    if (errors.length) {
      summary.innerHTML = `<strong>Controleer ${errors.length === 1 ? 'dit veld' : 'deze velden'}:</strong><ul>${errors.map(([n, m]) => `<li><a href="#" data-to="${n}">${m}</a></li>`).join('')}</ul>`;
      summary.hidden = false; summary.focus();
      $$('[data-to]', summary).forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); $(`[data-field="${a.dataset.to}"] input`, form)?.focus(); }));
      return;
    }
    summary.hidden = true;
    const d = data();
    if (!form.dataset.endpoint) return show(handoff(toText(d)));
    submit.setAttribute('aria-busy', 'true'); $('span', submit).textContent = 'Bezig met versturen…';
    try {
      const res = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset(); fillTimes(); total(); tried = false;
      show(`<p class="eyebrow"><span>Aanvraag verstuurd</span></p><h3>Top, <span class="chrome">${esc(d.naam.split(' ')[0])}.</span></h3><p class="body">Je aanvraag is aangekomen. De zaak neemt contact met je op om je afspraak te bevestigen; tot die tijd staat er nog niets vast.</p><button type="button" class="form__back" data-back>Nog een aanvraag doen</button>`);
    } catch { show(handoff(toText(d), true)); }
    finally { submit.removeAttribute('aria-busy'); $('span', submit).textContent = 'Aanvraag versturen'; }
  });
  fillTimes(); total();
})();
