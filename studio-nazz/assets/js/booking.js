// Studio Nazz — drie boekingssystemen (demo). Welke actief is, bepaalt
// <body data-booking="wizard|agenda|chat">. Er wordt niets echt geboekt:
// boekingen worden alleen in deze browser bewaard (localStorage) zodat het
// demo-dashboard ze kan tonen.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const dataEl = document.getElementById('nazz-data');
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const mode = document.body.dataset.booking;

  // ── gedeelde gegevens ────────────────────────────────────────────────────
  // Duur is een schatting voor de demo; laat Studio Nazz die bevestigen.
  const DUR = { 'Classic lashes': 120, 'Hybrid lashes': 135, 'Volume lashes': 150, 'Russian volume': 165, 'Wispy lashes': 150, 'Lash volume lift': 60, 'Refill': 75, 'Brow threading': 20, 'Brow lamination': 45, 'Brow tint': 20, 'Powderbrows': 150, 'PhiLings': 60, 'Microneedling': 60, 'Plasmapen': 60, 'Facials': 60 };
  const cats = data.categories.map((c) => ({ name: c.name, items: c.items.map((i) => ({ name: i.name, desc: i.desc, cat: c.name, min: DUR[i.name] ?? 60 })) }));
  if (data.promo) cats[0].items.push({ name: 'Bring a friend: volle wimperset', desc: '€10 korting voor jou én je vriendin.', cat: 'Lashes', min: 150 });
  cats.push({ name: 'Academy', items: data.courses.map((c) => ({ name: `Cursus: ${c.name}`, desc: `${c.type} · ${c.days} dag${c.days > 1 ? 'en' : ''}`, cat: 'Academy', min: c.days * 480, course: true })) });
  const all = cats.flatMap((c) => c.items);
  const find = (n) => all.find((t) => t.name === n) ?? all.find((t) => n && t.name.toLowerCase().includes(n.toLowerCase()));

  const DAYN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const DAYL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const MON = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const short = (d) => `${DAYN[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  const long = (d) => `${DAYL[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  const dur = (m) => (m >= 480 ? `${m / 480} dag${m > 480 ? 'en' : ''}` : m >= 60 ? `${Math.floor(m / 60)} uur${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  // Beschikbaarheid: ingesteld in het dashboard (tab "Beschikbaarheid"),
  // bewaard in deze browser. Zonder instelling: ma–za 9:00–18:00.
  const AV_DEFAULT = { step: 30, week: { 0: { open: false, from: '10:00', to: '16:00', pFrom: '', pTo: '' }, 1: { open: true, from: '09:00', to: '18:00', pFrom: '', pTo: '' }, 2: { open: true, from: '09:00', to: '18:00', pFrom: '', pTo: '' }, 3: { open: true, from: '09:00', to: '18:00', pFrom: '', pTo: '' }, 4: { open: true, from: '09:00', to: '18:00', pFrom: '', pTo: '' }, 5: { open: true, from: '09:00', to: '18:00', pFrom: '', pTo: '' }, 6: { open: true, from: '09:00', to: '17:00', pFrom: '', pTo: '' } }, blocked: [] };
  let AV = AV_DEFAULT;
  try { const s = JSON.parse(localStorage.getItem('nazz-availability') || 'null'); if (s && s.week) AV = s; } catch { /* standaard */ }
  const mins = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const blockedOn = (d) => AV.blocked.some((b) => iso(d) >= b.from && iso(d) <= (b.to || b.from));
  const open = (d) => !!AV.week[d.getDay()]?.open && !blockedOn(d);
  const nextDays = (n) => { const out = []; for (let i = 1; out.length < n && i < 200; i++) { const d = addDays(today, i); if (open(d)) out.push(d); } return out; };
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const slots = (d, min) => {
    const out = [];
    if (!open(d)) return out;
    const day = AV.week[d.getDay()];
    const from = mins(day.from), to = mins(day.to), pf = mins(day.pFrom), pt = mins(day.pTo);
    const len = Math.min(min, 240);
    for (let m = from; m + len <= to; m += Number(AV.step) || 30) {
      if (pf != null && pt != null && m < pt && m + len > pf) continue; // valt in de pauze
      const t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      out.push({ t, free: hash(iso(d) + t) % 3 !== 0 });
    }
    return out;
  };
  const save = (b) => {
    const rec = { ...b, id: `W${Date.now().toString(36)}`, created: new Date().toISOString(), source: { wizard: 'Variant A · wizard', agenda: 'Variant B · agenda', chat: 'Variant C · chat' }[mode] };
    try { const k = 'nazz-demo-bookings'; const a = JSON.parse(localStorage.getItem(k) || '[]'); a.push(rec); localStorage.setItem(k, JSON.stringify(a)); } catch { /* opslag niet beschikbaar: demo blijft werken */ }
    return rec;
  };
  const phoneOk = (v) => /^[+0-9][0-9 ()-]{7,}$/.test(v.trim());
  const dash = data.dashboard || 'dashboard.html';
  const demoNote = `<p class="bk-demo">Dit is een demo: er is niets echt geboekt. In de live versie komt de afspraak direct in de agenda van Studio Nazz en krijgt de klant een bevestiging. <a href="${dash}">Bekijk hem in het dashboard →</a></p>`;
  const summary = (b) => `<dl class="bk-sum"><div><dt>Behandeling</dt><dd>${esc(b.treatment)}</dd></div><div><dt>${b.course ? 'Startdatum' : 'Wanneer'}</dt><dd>${esc(b.dateLabel)}${b.time ? ` om ${b.time}` : ''}</dd></div><div><dt>Duur</dt><dd>${dur(b.min)}</dd></div><div><dt>Naam</dt><dd>${esc(b.name)}</dd></div>${b.phone ? `<div><dt>Telefoon</dt><dd>${esc(b.phone)}</dd></div>` : ''}</dl>`;

  // openers: elke [data-book] knop op de pagina
  let openWith = () => {};
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (!b) return;
    e.preventDefault();
    openWith(b.dataset.pre);
  });

  // ══ A. WIZARD ═══════════════════════════════════════════════════════════
  if (mode === 'wizard') {
    const dlg = document.createElement('dialog');
    dlg.className = 'wz';
    dlg.setAttribute('aria-labelledby', 'wz-title');
    dlg.innerHTML = `<div class="wz__head"><div><p class="bk-eyebrow">Online boeken</p><h2 id="wz-title">Plan je <em>afspraak</em></h2></div><button class="wz__x" type="button" data-x aria-label="Sluiten">✕</button></div>
      <ol class="wz__steps" aria-label="Stappen">${['Behandeling', 'Datum & tijd', 'Gegevens', 'Bevestigd'].map((s, i) => `<li data-i="${i}"><span>${i + 1}</span><b>${s}</b></li>`).join('')}</ol>
      <div class="wz__body" data-body></div>
      <div class="wz__foot"><button class="bk-btn bk-btn--ghost" type="button" data-back>Terug</button><p class="bk-err" data-err role="alert"></p><button class="bk-btn" type="button" data-next>Volgende</button></div>`;
    document.body.append(dlg);
    const st = { step: 0, t: null, d: null, time: null, name: '', phone: '', email: '', note: '', first: 'Ja' };
    const body = $('[data-body]', dlg), err = $('[data-err]', dlg), next = $('[data-next]', dlg), back = $('[data-back]', dlg);
    const render = () => {
      $$('.wz__steps li', dlg).forEach((li, i) => { li.classList.toggle('on', i === st.step); li.classList.toggle('done', i < st.step); });
      err.textContent = '';
      back.hidden = st.step === 0 || st.step === 3;
      next.textContent = ['Kies datum & tijd', 'Naar gegevens', 'Bevestig afspraak', 'Sluiten'][st.step];
      if (st.step === 0) {
        body.innerHTML = cats.map((c) => `<section class="wz__cat"><h3>${esc(c.name)}</h3><div class="wz__grid">${c.items.map((t) => `<button type="button" class="wz__opt${st.t?.name === t.name ? ' on' : ''}" data-t="${esc(t.name)}" aria-pressed="${st.t?.name === t.name}"><b>${esc(t.name)}</b><small>${dur(t.min)} · ${t.course ? 'prijs op aanvraag' : 'prijs volgt'}</small></button>`).join('')}</div></section>`).join('');
      } else if (st.step === 1) {
        const days = nextDays(14);
        st.d = st.d ?? days[0];
        const list = st.t.course ? '' : slots(st.d, st.t.min);
        body.innerHTML = `<p class="wz__picked">${esc(st.t.name)} <span>${dur(st.t.min)}</span></p>
          <h3 class="wz__h">${st.t.course ? 'Kies een startdatum' : 'Kies een dag'}</h3>
          <div class="wz__days">${days.map((d) => `<button type="button" class="wz__day${iso(d) === iso(st.d) ? ' on' : ''}" data-d="${iso(d)}" aria-pressed="${iso(d) === iso(st.d)}"><small>${DAYN[d.getDay()]}</small><b>${d.getDate()}</b><small>${MON[d.getMonth()]}</small></button>`).join('')}</div>
          ${st.t.course ? '<p class="wz__hint">Na je aanmelding plant Studio Nazz de cursusdag definitief met je in.</p>' : `<h3 class="wz__h">Vrije tijden op ${long(st.d)}</h3><div class="wz__times">${list.map((s) => `<button type="button" class="wz__time${st.time === s.t ? ' on' : ''}" data-time="${s.t}" ${s.free ? '' : 'disabled'} aria-pressed="${st.time === s.t}">${s.t}</button>`).join('')}</div>`}`;
      } else if (st.step === 2) {
        body.innerHTML = `<p class="wz__picked">${esc(st.t.name)} <span>${long(st.d)}${st.time ? ` · ${st.time}` : ''}</span></p>
          <div class="bk-fields">
            <label class="bk-field"><span>Naam *</span><input name="name" autocomplete="name" value="${esc(st.name)}"></label>
            <label class="bk-field"><span>Telefoon *</span><input name="phone" type="tel" autocomplete="tel" value="${esc(st.phone)}" placeholder="06 12345678"></label>
            <label class="bk-field"><span>E-mail</span><input name="email" type="email" autocomplete="email" value="${esc(st.email)}"></label>
            <fieldset class="bk-field"><legend>Eerste keer bij Studio Nazz?</legend><div class="bk-chips">${['Ja', 'Nee'].map((v) => `<label><input type="radio" name="first" value="${v}" ${st.first === v ? 'checked' : ''}><span>${v}</span></label>`).join('')}</div></fieldset>
            <label class="bk-field bk-field--wide"><span>Opmerking</span><input name="note" value="${esc(st.note)}" placeholder="Bijv. natuurlijke look, of refill van een andere salon"></label>
          </div>`;
      } else {
        body.innerHTML = `<div class="bk-done"><span class="bk-check" aria-hidden="true">✓</span><h3>Je afspraak staat genoteerd</h3>${summary(st.rec)}${demoNote}</div>`;
      }
      body.scrollTop = 0;
    };
    body.addEventListener('click', (e) => {
      const t = e.target.closest('[data-t]'), d = e.target.closest('[data-d]'), tm = e.target.closest('[data-time]');
      if (t) { st.t = find(t.dataset.t); st.time = null; render(); }
      if (d) { st.d = new Date(`${d.dataset.d}T00:00`); st.time = null; render(); }
      if (tm) { st.time = tm.dataset.time; render(); }
    });
    body.addEventListener('input', (e) => { if (e.target.name) st[e.target.name] = e.target.value; });
    body.addEventListener('change', (e) => { if (e.target.name) st[e.target.name] = e.target.value; });
    next.addEventListener('click', () => {
      if (st.step === 0 && !st.t) { err.textContent = 'Kies eerst een behandeling.'; return; }
      if (st.step === 1 && !st.t.course && !st.time) { err.textContent = 'Kies een tijd.'; return; }
      if (st.step === 2) {
        if (!st.name.trim()) { err.textContent = 'Vul je naam in.'; $('[name=name]', body).focus(); return; }
        if (!phoneOk(st.phone)) { err.textContent = 'Vul een geldig telefoonnummer in.'; $('[name=phone]', body).focus(); return; }
        st.rec = save({ treatment: st.t.name, category: st.t.cat, course: !!st.t.course, min: st.t.min, date: iso(st.d), dateLabel: long(st.d), time: st.t.course ? '' : st.time, name: st.name.trim(), phone: st.phone.trim(), email: st.email.trim(), note: st.note.trim(), firstVisit: st.first === 'Ja' });
      }
      if (st.step === 3) { dlg.close(); return; }
      st.step++; render();
    });
    back.addEventListener('click', () => { st.step = Math.max(0, st.step - 1); render(); });
    $('[data-x]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    openWith = (pre) => {
      Object.assign(st, { step: 0, time: null, d: null, rec: null });
      const t = pre && find(pre);
      if (t) { st.t = t; st.step = 1; } else st.t = null;
      render(); dlg.showModal();
    };
  }

  // ══ B. AGENDA ═══════════════════════════════════════════════════════════
  if (mode === 'agenda') {
    const root = $('[data-agenda]');
    if (!root) return;
    const st = { t: null, week: 0, d: null, time: null };
    const weekStart = (w) => { const d = addDays(today, 1 + w * 7); const dow = (d.getDay() + 6) % 7; return addDays(d, -dow); };
    root.innerHTML = `<div class="ag">
      <div class="ag__col ag__menu"><h3 class="ag__h"><span>1</span>Behandeling</h3><div data-menu></div></div>
      <div class="ag__col ag__cal"><div class="ag__calhead"><h3 class="ag__h"><span>2</span>Dag &amp; tijd</h3><div class="ag__nav"><button type="button" data-prev aria-label="Vorige week">‹</button><p data-range aria-live="polite"></p><button type="button" data-nextw aria-label="Volgende week">›</button></div></div><div class="ag__week" data-week tabindex="0" role="region" aria-label="Vrije tijden"></div></div>
      <aside class="ag__col ag__side"><h3 class="ag__h"><span>3</span>Jouw afspraak</h3><div data-side></div></aside>
    </div>`;
    const menu = $('[data-menu]', root), week = $('[data-week]', root), side = $('[data-side]', root), range = $('[data-range]', root);
    menu.innerHTML = cats.map((c, ci) => `<details class="ag__group"${ci === 0 ? ' open' : ''}><summary>${esc(c.name)}<small>${c.items.length}</small></summary>${c.items.map((t) => `<label class="ag__item"><input type="radio" name="ag-t" value="${esc(t.name)}"><span><b>${esc(t.name)}</b><small>${dur(t.min)}</small></span></label>`).join('')}</details>`).join('');
    const renderWeek = () => {
      const s = weekStart(st.week);
      const days = Array.from({ length: 7 }, (_, i) => addDays(s, i));
      range.textContent = `${days[0].getDate()} ${MON[days[0].getMonth()]} – ${days[6].getDate()} ${MON[days[6].getMonth()]}`;
      $('[data-prev]', root).disabled = st.week === 0;
      if (!st.t) { week.innerHTML = '<p class="ag__empty">Kies eerst een behandeling, dan zie je hier de vrije tijden.</p>'; return; }
      week.innerHTML = days.map((d) => {
        const past = d <= today || !open(d);
        const list = st.t.course ? [] : slots(d, st.t.min);
        return `<div class="ag__day${past ? ' is-past' : ''}"><p class="ag__dname"><small>${DAYN[d.getDay()]}</small><b>${d.getDate()}</b></p>
          ${past ? `<p class="ag__none">${d <= today ? '—' : 'gesloten'}</p>` : st.t.course
            ? `<button type="button" class="ag__slot${st.d && iso(st.d) === iso(d) ? ' on' : ''}" data-d="${iso(d)}" data-time="">Start</button>`
            : list.map((x) => `<button type="button" class="ag__slot${st.d && iso(st.d) === iso(d) && st.time === x.t ? ' on' : ''}" data-d="${iso(d)}" data-time="${x.t}" ${x.free ? '' : 'disabled'} aria-label="${long(d)} ${x.t}${x.free ? '' : ', bezet'}">${x.t}</button>`).join('')}</div>`;
      }).join('');
    };
    const renderSide = (msg = '') => {
      if (!st.t) { side.innerHTML = '<p class="ag__empty">Nog niets gekozen.</p>'; return; }
      side.innerHTML = `<div class="ag__ticket"><p class="ag__tname">${esc(st.t.name)}</p><p class="ag__tmeta">${esc(st.t.cat)} · ${dur(st.t.min)}</p>
        <p class="ag__when">${st.d ? `${long(st.d)}${st.time ? ` · ${st.time}` : ''}` : 'Kies een tijd in de agenda'}</p></div>
        <form class="ag__form" novalidate>
          <label class="bk-field"><span>Naam *</span><input name="name" autocomplete="name"></label>
          <label class="bk-field"><span>Telefoon *</span><input name="phone" type="tel" autocomplete="tel" placeholder="06 12345678"></label>
          <label class="bk-field"><span>E-mail</span><input name="email" type="email" autocomplete="email"></label>
          <label class="bk-field"><span>Opmerking</span><input name="note"></label>
          <p class="bk-err" role="alert">${msg}</p>
          <button class="bk-btn bk-btn--block" type="submit">Bevestig afspraak</button>
        </form>`;
    };
    menu.addEventListener('change', (e) => { st.t = find(e.target.value); st.d = null; st.time = null; renderWeek(); renderSide(); });
    week.addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]');
      if (!b) return;
      st.d = new Date(`${b.dataset.d}T00:00`); st.time = b.dataset.time;
      const keep = side.querySelector('form') ? Object.fromEntries(new FormData(side.querySelector('form'))) : {};
      renderWeek(); renderSide();
      const f = side.querySelector('form'); Object.entries(keep).forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v; });
    });
    $('[data-prev]', root).addEventListener('click', () => { st.week = Math.max(0, st.week - 1); renderWeek(); });
    $('[data-nextw]', root).addEventListener('click', () => { st.week = Math.min(5, st.week + 1); renderWeek(); });
    side.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target, v = Object.fromEntries(new FormData(f));
      const fail = (m, el) => { $('.bk-err', f).textContent = m; el?.focus(); };
      if (!st.d) return fail('Kies eerst een dag en tijd in de agenda.');
      if (!String(v.name).trim()) return fail('Vul je naam in.', f.elements.name);
      if (!phoneOk(String(v.phone))) return fail('Vul een geldig telefoonnummer in.', f.elements.phone);
      const rec = save({ treatment: st.t.name, category: st.t.cat, course: !!st.t.course, min: st.t.min, date: iso(st.d), dateLabel: long(st.d), time: st.time, name: String(v.name).trim(), phone: String(v.phone).trim(), email: String(v.email || '').trim(), note: String(v.note || '').trim() });
      side.innerHTML = `<div class="bk-done"><span class="bk-check" aria-hidden="true">✓</span><h3>Gelukt!</h3>${summary(rec)}${demoNote}<button class="bk-btn bk-btn--ghost bk-btn--block" type="button" data-again>Nog een afspraak</button></div>`;
    });
    side.addEventListener('click', (e) => { if (e.target.closest('[data-again]')) { st.d = null; st.time = null; renderWeek(); renderSide(); } });
    openWith = (pre) => {
      const t = pre && find(pre);
      if (t) {
        const r = $$('input[name=ag-t]', menu).find((x) => x.value === t.name);
        if (r) { r.checked = true; r.closest('details').open = true; }
        st.t = t; st.d = null; st.time = null; renderWeek(); renderSide();
      }
      root.closest('section')?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    };
    renderWeek(); renderSide();
  }

  // ══ C. CHAT ═════════════════════════════════════════════════════════════
  if (mode === 'chat') {
    const root = $('[data-chat]');
    if (!root) return;
    root.innerHTML = `<div class="ch" role="log" aria-live="polite" aria-label="Boekingsassistent" data-log></div>
      <div class="ch__quick" data-quick></div>
      <form class="ch__input" data-form hidden><label class="sr-only" for="ch-in">Je antwoord</label><input id="ch-in" autocomplete="off"><button class="bk-btn" type="submit">Stuur</button></form>
      <p class="ch__reset"><button type="button" data-restart>Opnieuw beginnen</button></p>`;
    const log = $('[data-log]', root), quick = $('[data-quick]', root), form = $('[data-form]', root), input = $('input', form);
    let st = {}, waitText = null, busy = 0;
    const scroll = () => { log.scrollTop = log.scrollHeight; };
    const bubble = (html, who = 'bot') => { const p = document.createElement('div'); p.className = `ch__msg ch__msg--${who}`; p.innerHTML = html; log.append(p); scroll(); return p; };
    const say = (html, after) => {
      const my = ++busy;
      quick.innerHTML = ''; form.hidden = true;
      const dots = bubble('<span class="ch__dots"><i></i><i></i><i></i></span>');
      setTimeout(() => { if (my !== busy) return; dots.innerHTML = html; scroll(); after?.(); }, calm ? 0 : 650);
    };
    const chips = (list) => { quick.innerHTML = list.map((c, i) => `<button type="button" class="ch__chip" data-i="${i}">${c.label}</button>`).join(''); quick._list = list; };
    const ask = (placeholder, type, cb) => { form.hidden = false; input.type = type; input.value = ''; input.placeholder = placeholder; waitText = cb; setTimeout(() => input.focus({ preventScroll: true }), 30); };
    quick.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; const c = quick._list[b.dataset.i]; bubble(esc(c.label.replace(/<[^>]+>/g, '')), 'me'); c.go(); });
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value.trim(); if (!v || !waitText) return; bubble(esc(v), 'me'); const cb = waitText; waitText = null; cb(v); });
    const start = () => {
      log.innerHTML = ''; st = {};
      say('Hoi! ✨ Ik ben de boekingsassistent van <b>Studio Nazz</b>. Waarvoor wil je een afspraak maken?', () => chips(cats.map((c) => ({ label: c.name, go: () => pickCat(c) }))));
    };
    const pickCat = (c) => say(c.name === 'Academy' ? 'Leuk dat je het vak wilt leren! Welke cursus?' : `Mooi. Welke ${c.name.toLowerCase()}-behandeling?`, () => chips(c.items.map((t) => ({ label: `${esc(t.name)} <small>${dur(t.min)}</small>`, go: () => pickT(t) }))));
    const pickT = (t) => { st.t = t; say(t.course ? `${esc(t.name.replace('Cursus: ', ''))} duurt ${dur(t.min)}. Vanaf welke datum kun je?` : `${esc(t.name)} duurt ongeveer <b>${dur(t.min)}</b>. Welke dag past jou?`, () => { const ds = nextDays(8); if (!ds.length) { say('Er zijn op dit moment geen vrije dagen. Stuur Studio Nazz gerust een bericht.'); return; } chips(ds.map((d) => ({ label: short(d), go: () => pickD(d) }))); }); };
    const pickD = (d) => {
      st.d = d;
      if (st.t.course) { st.time = ''; return askName(); }
      const free = slots(d, st.t.min).filter((s) => s.free).slice(0, 8);
      say(`Op ${long(d)} zijn deze tijden nog vrij:`, () => chips([...free.map((s) => ({ label: s.t, go: () => { st.time = s.t; askName(); } })), { label: '↺ Andere dag', go: () => pickT(st.t) }]));
    };
    const askName = () => say('Top! Wat is je naam?', () => ask('Je voornaam en achternaam', 'text', (v) => { st.name = v; askPhone(); }));
    const askPhone = () => say(`Dankje ${esc(st.name.split(' ')[0])}! Op welk telefoonnummer kan Studio Nazz je bereiken?`, () => ask('06 12345678', 'tel', (v) => {
      if (!phoneOk(v)) { say('Hmm, dat nummer lijkt niet te kloppen. Probeer het nog eens?', () => ask('06 12345678', 'tel', waitTextAgain)); return; }
      st.phone = v; confirm();
    }));
    const waitTextAgain = (v) => { if (!phoneOk(v)) { say('Dat lijkt nog steeds niet goed. Bijvoorbeeld 06 12345678.', () => ask('06 12345678', 'tel', waitTextAgain)); return; } st.phone = v; confirm(); };
    const confirm = () => say(`Even checken:<br><b>${esc(st.t.name)}</b><br>${long(st.d)}${st.time ? ` om ${st.time}` : ''}<br>${esc(st.name)} · ${esc(st.phone)}<br>Klopt dit?`, () => chips([
      { label: 'Ja, boek maar ✓', go: () => {
        const rec = save({ treatment: st.t.name, category: st.t.cat, course: !!st.t.course, min: st.t.min, date: iso(st.d), dateLabel: long(st.d), time: st.time, name: st.name, phone: st.phone, email: '', note: '' });
        say(`Gelukt! 🎉 Je afspraak staat genoteerd. Je krijgt een bevestiging van Studio Nazz.${demoNote}`, () => chips([{ label: 'Nog een afspraak', go: start }]));
        void rec;
      } },
      { label: 'Nee, opnieuw', go: start },
    ]));
    $('[data-restart]', root).addEventListener('click', start);
    openWith = (pre) => {
      root.closest('section')?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      const t = pre && find(pre);
      if (t) { log.innerHTML = ''; st = {}; bubble(`Ik wil graag ${esc(t.name)} boeken`, 'me'); pickT(t); }
    };
    start();
  }
})();
