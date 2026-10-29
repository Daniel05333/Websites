// Nisuda Clinic — interactie. Geen bibliotheken: één rAF-lus voor de 3D-hero,
// één scroll-handler, IntersectionObservers voor onthullingen.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ── onthullingen ─────────────────────────────────────────────────────────
  // Een volledig weggeknipt element (clip-path) snijdt nooit de viewport; voor
  // foto-onthullingen observeren we daarom de ouder.
  const targets = new Map();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    (targets.get(e.target) ?? [e.target]).forEach((el) => el.classList.add('in'));
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal, .title, .display').forEach((el) => io.observe(el));
  $$('.reveal-img').forEach((el) => {
    const p = el.parentElement;
    targets.set(p, [...(targets.get(p) ?? []), el]);
    io.observe(p);
  });

  // ── hero: 3D-rig ─────────────────────────────────────────────────────────
  const hero = $('[data-hero]');
  const stage = $('[data-stage]');
  const rig = $('[data-rig]');
  const pointer = { x: 0, y: 0, active: false };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
    pointer.active = true;
  }, { passive: true });

  if (hero) {
    const start = () => {
      $('.hero__title').classList.add('in');
      stage?.classList.add('is-ready');
    };
    (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(start));
  }

  if (rig) {
    const cur = { x: 0, y: 0, d: 0 };
    let heroVisible = true;
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; if (heroVisible) loop(); }).observe(hero);
    let running = false;
    const t0 = performance.now();
    const frame = (t) => {
      running = false;
      if (!heroVisible) return;
      const p = clamp(scrollY / hero.offsetHeight, 0, 1);
      let tx = pointer.x, ty = pointer.y;
      if (!pointer.active) { // touch: rustige automatische beweging
        const s = (t - t0) / 1000;
        tx = Math.sin(s * 0.45) * 0.45; ty = Math.cos(s * 0.35) * 0.3;
      }
      const intro = clamp((t - t0) / 1600, 0, 1);
      const targetD = (1 - Math.pow(1 - intro, 3)) * (1 + p * 0.7);
      cur.x = lerp(cur.x, tx, 0.06);
      cur.y = lerp(cur.y, ty + p * 0.8, 0.06);
      cur.d = lerp(cur.d, targetD, 0.08);
      rig.style.setProperty('--rx', cur.x.toFixed(4));
      rig.style.setProperty('--ry', cur.y.toFixed(4));
      rig.style.setProperty('--depth', cur.d.toFixed(4));
      loop();
    };
    const loop = () => { if (!running && !calm) { running = true; requestAnimationFrame(frame); } };
    if (calm) rig.style.setProperty('--depth', '.6'); else loop();
  }

  // ── scroll: voortgang, kop, dock, parallax, woorden ─────────────────────
  const masthead = $('[data-masthead]');
  const bar = $('[data-progress]');
  const dock = $('[data-dock]');
  const booking = $('#afspraak');
  const footer = $('.footer');
  const parallax = $$('[data-parallax]');
  const statement = $('[data-words]');
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
    const max = document.documentElement.scrollHeight - vh;
    bar?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (masthead && !document.body.classList.contains('is-plain')) {
      masthead.classList.toggle('is-scrolled', y > 40);
      const sheetOpen = !$('#sheet')?.hidden;
      masthead.classList.toggle('is-hidden', y > lastY && y > vh * 0.9 && !sheetOpen);
    }
    if (dock) {
      const near = (el) => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
      dock.classList.toggle('on', y > vh * 0.8 && !near(booking) && !near(footer));
    }
    if (!calm) {
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      }
    }
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const prog = calm ? 1 : clamp((vh * 0.88 - r.top) / (r.height + vh * 0.35), 0, 1);
      const n = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // actieve menu-item
  const navLinks = $$('.nav a');
  const sections = navLinks.map((a) => $(new URL(a.href).hash)).filter(Boolean);
  const navIo = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.toggleAttribute('aria-current', new URL(a.href).hash === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navIo.observe(s));

  // ── mobiel menu ──────────────────────────────────────────────────────────
  const burger = $('.burger');
  const sheet = $('#sheet');
  if (burger && sheet) {
    const close = (focus = true) => {
      sheet.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
      if (focus) burger.focus();
    };
    burger.addEventListener('click', () => {
      sheet.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
      $('.sheet__close', sheet).focus();
    });
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

  // ── magnetische knoppen & 3D-kantelkaarten (alleen met muis) ─────────────
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
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting'); el.style.setProperty('--rx', 0); el.style.setProperty('--ry', 0);
      });
    });
    // finale: het logo in drie dieptelagen volgt de cursor
    const mark = $('[data-depth-logo]');
    const finale = $('[data-finale]');
    if (mark) {
      finale.addEventListener('pointermove', () => {
        mark.style.setProperty('--rx', pointer.x.toFixed(3)); mark.style.setProperty('--ry', pointer.y.toFixed(3));
      });
    }
  }

  // ── behandelingen: zwevend voorbeeld bij de cursor ───────────────────────
  const index = $('[data-index]');
  const peek = $('[data-peek-el]');
  if (index && peek && fine) {
    const pImg = $('[data-peek-img]', peek), pTxt = $('[data-peek-txt]', peek), card = $('.peek__card', peek);
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    let on = false, raf = 0;
    const tick = () => {
      const vx = pos.tx - pos.x;
      pos.x = lerp(pos.x, pos.tx, calm ? 1 : 0.14); pos.y = lerp(pos.y, pos.ty, calm ? 1 : 0.14);
      peek.style.transform = `translate3d(${pos.x - 120}px, ${pos.y - 160}px, 0)`;
      card.style.setProperty('--rot', `${clamp(vx * 0.06, -9, 9).toFixed(2)}deg`);
      raf = on || Math.abs(vx) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    $$('a', index).forEach((a) => {
      a.addEventListener('pointerenter', (e) => {
        if (a.dataset.peek) { pImg.src = a.dataset.peek; pImg.hidden = false; pTxt.textContent = ''; }
        else { pImg.hidden = true; pTxt.textContent = a.dataset.peekText; }
        if (!on) { pos.x = pos.tx = e.clientX; pos.y = pos.ty = e.clientY; }
        on = true; peek.classList.add('on');
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
    index.addEventListener('pointermove', (e) => { pos.tx = e.clientX; pos.ty = e.clientY; });
    index.addEventListener('pointerleave', () => { on = false; peek.classList.remove('on'); });
  }

  // ── prijzen: tabs ────────────────────────────────────────────────────────
  const tablist = $('[data-tabs]');
  const tabs = tablist ? $$('[role=tab]', tablist) : [];
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      selectTab(tabs[(k + tabs.length) % tabs.length], true);
    });
  });
  $$('[data-tab]').forEach((a) => a.addEventListener('click', () => {
    const t = $(`#tab-${a.dataset.tab}`); if (t) selectTab(t);
  }));

  // ── resultaten: filter + lightbox ────────────────────────────────────────
  const wall = $('[data-wall]');
  if (wall) {
    const items = $$('.wall__item', wall);
    const live = document.createElement('p');
    live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
    $('.filters')?.append(live);
    items.forEach((it, i) => { it.style.viewTransitionName = `r${i}`; });
    $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      const cat = b.dataset.filter;
      const apply = () => {
        $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', x === b));
        items.forEach((it) => { it.hidden = cat !== 'alles' && it.dataset.cat !== cat; });
        $$('.reveal-img', wall).forEach((t) => t.classList.add('in'));
        live.textContent = `${items.filter((it) => !it.hidden).length} resultaten`;
      };
      if (document.startViewTransition && !calm) document.startViewTransition(apply); else apply();
    }));

    const box = $('[data-lightbox]');
    const stageEl = $('[data-stage]', box), cap = $('[data-caption]', box), count = $('[data-count]', box);
    let list = [], at = 0, opener = null;
    const show = (i) => {
      at = (i + list.length) % list.length;
      const tile = list[at], im = $('img', tile);
      stageEl.innerHTML = `<img src="${im.src}" alt="${im.alt}" width="${im.width}" height="${im.height}">`;
      cap.innerHTML = `${$('.tile__cap strong', tile).textContent}<span>${$('.tile__cap span:last-child', tile).textContent}</span>`;
      count.textContent = `${at + 1} / ${list.length}`;
    };
    $$('.tile', wall).forEach((t) => t.addEventListener('click', () => {
      list = $$('.wall__item:not([hidden]) .tile', wall);
      opener = t; show(list.indexOf(t)); box.showModal();
    }));
    $('[data-prev]', box).addEventListener('click', () => show(at - 1));
    $('[data-next]', box).addEventListener('click', () => show(at + 1));
    $('[data-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(at + 1);
      if (e.key === 'ArrowLeft') show(at - 1);
    });
    box.addEventListener('close', () => opener?.focus());
    let sx = null;
    box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
    });
  }

  // ── afspraakformulier ────────────────────────────────────────────────────
  const form = $('[data-form]');
  if (!form) return;
  const result = $('[data-result]');
  const summary = $('[data-summary]');
  const submit = $('[data-submit]', form);
  const totalEl = $('[data-total]', form);
  const hint = $('[data-total-hint]', form);
  const val = (n) => form.elements[n]?.value?.trim() ?? '';
  const treatment = () => form.querySelector('[name=behandeling]:checked');
  const gender = () => form.querySelector('[name=voor]:checked')?.value ?? 'vrouw';
  const zoneInputs = () => $$(`[name=zone-${gender()}]`, form);
  const checked = (name) => $$(`[name="${name}"]:checked`, form).map((i) => i.value);
  const fmt = (n) => `€ ${n.toLocaleString('nl-NL', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

  const estimate = () => {
    const ins = zoneInputs();
    const full = ins.find((i) => 'full' in i.dataset);
    ins.forEach((i) => { if (i !== full) i.disabled = full.checked; if (full.checked && i !== full) i.checked = false; });
    const sum = ins.filter((i) => i.checked).reduce((s, i) => s + Number(i.dataset.price), 0);
    totalEl.value = fmt(sum); totalEl.textContent = fmt(sum);
    const fullPrice = Number(full.dataset.price);
    hint.hidden = !(sum >= fullPrice && !full.checked);
    hint.textContent = `Tip: fullbody kost ${fmt(fullPrice)} en dekt alle zones.`;
    return sum;
  };

  const sync = () => {
    const t = treatment()?.value;
    $$('[data-when]', form).forEach((c) => { c.hidden = c.dataset.when !== t; });
    $$('[data-zones]', form).forEach((g) => { g.hidden = g.dataset.zones !== gender(); });
    if (t === 'laser') estimate();
  };
  form.addEventListener('change', (e) => {
    if (e.target.name === 'voor') $$('[name^=zone-]', form).forEach((i) => { i.checked = false; });
    sync();
    if (tried) validate();
  });

  // knoppen die een behandeling voorselecteren
  $$('[data-pick]').forEach((a) => a.addEventListener('click', () => {
    const r = form.querySelector(`[name=behandeling][value="${a.dataset.pick}"]`);
    if (!r) return;
    r.checked = true;
    if (a.dataset.gender) form.querySelector(`[name=voor][value="${a.dataset.gender}"]`).checked = true;
    if (!result.hidden) back();
    sync();
  }));

  const rules = {
    behandeling: () => (treatment() ? '' : 'Kies waarvoor je komt.'),
    zones: () => (treatment()?.value === 'laser' && !zoneInputs().some((i) => i.checked) ? 'Kies minstens één zone.' : ''),
    naam: () => (val('naam').length >= 2 ? '' : 'Vul je naam in.'),
    telefoon: () => { const d = val('telefoon').replace(/[^\d]/g, ''); return d.length >= 10 && d.length <= 13 ? '' : 'Vul een geldig telefoonnummer in, bijvoorbeeld 06 12345678.'; },
    email: () => (!val('email') || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email')) ? '' : 'Dit e-mailadres klopt niet helemaal.'),
    datum: () => (!val('datum') || val('datum') >= new Date().toISOString().slice(0, 10) ? '' : 'Kies een datum vanaf vandaag.'),
  };
  let tried = false;
  const validate = () => {
    const errors = [];
    for (const [name, rule] of Object.entries(rules)) {
      const field = $(`[data-field="${name}"]`, form);
      if (!field || field.closest('[hidden]')) continue;
      const msg = rule();
      $('[data-err]', field).textContent = msg;
      const ctl = field.matches('fieldset') ? field : $('input, select, textarea', field);
      if (msg) { ctl.setAttribute('aria-invalid', 'true'); errors.push([name, msg, field]); }
      else ctl.removeAttribute('aria-invalid');
      if (field.matches('fieldset')) ctl.setAttribute('aria-describedby', `err-${name}`);
    }
    return errors;
  };
  form.addEventListener('input', () => { if (tried) validate(); });

  const data = () => {
    const t = treatment();
    const d = {
      behandeling: t?.dataset.label ?? '', naam: val('naam'), telefoon: val('telefoon'), email: val('email'),
      datum: val('datum'), dagdeel: val('dagdeel'), bericht: val('bericht'),
    };
    if (t?.value === 'laser') { d.voor = gender(); d.zones = checked(`zone-${gender()}`); d.indicatie = fmt(estimate()); }
    if (t?.value === 'plasmalift') d.zones = checked('zone-plasma');
    if (t?.value === 'lipfiller') { d.ml = val('ml'); d.samen = form.elements.samen.checked; }
    return d;
  };
  const longDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  const toText = (d) => [
    'Hallo Nisuda Clinic! Ik wil graag een afspraak aanvragen.', '',
    `Behandeling: ${d.behandeling}${d.voor ? ` (${d.voor})` : ''}`,
    d.zones?.length ? `Zones: ${d.zones.join(', ')}${d.indicatie ? ` (indicatie ${d.indicatie} per behandeling)` : ''}` : null,
    d.ml ? `Lipfiller: ${d.ml}${d.samen ? ', ik kom samen met iemand' : ''}` : null,
    d.datum || d.dagdeel ? `Voorkeur: ${[d.datum && longDate(d.datum), d.dagdeel && d.dagdeel.toLowerCase()].filter(Boolean).join(', ')}` : null,
    '', `Naam: ${d.naam}`, `Telefoon: ${d.telefoon}`, d.email ? `E-mail: ${d.email}` : null,
    d.bericht ? `\nOpmerking: ${d.bericht}` : null,
  ].filter((l) => l !== null).join('\n');

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const arrow = $('.arr', submit).outerHTML;
  const routes = (text) => {
    const r = [];
    if (form.dataset.whatsapp) r.push(`<a class="btn" href="https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener"><span>Verstuur via WhatsApp</span>${arrow}</a>`);
    r.push(`<a class="${r.length ? 'link' : 'btn'}" href="${form.dataset.dm}" target="_blank" rel="noopener" data-dm><span>Open Instagram-DM</span>${arrow}</a>`);
    if (form.dataset.email) r.push(`<a class="link" href="mailto:${form.dataset.email}?subject=${encodeURIComponent('Afspraakaanvraag')}&body=${encodeURIComponent(text)}"><span>Verstuur per e-mail</span>${arrow}</a>`);
    return r.join('');
  };
  const back = () => { result.hidden = true; form.hidden = false; $('[name=behandeling]', form).focus(); };
  const show = (html) => {
    form.hidden = true; result.hidden = false; result.innerHTML = html;
    result.focus();
    $('[data-back]', result)?.addEventListener('click', back);
    const copyBtn = $('[data-copy]', result);
    const status = $('[data-status]', result);
    const copy = async () => {
      const text = $('pre', result).textContent;
      try { await navigator.clipboard.writeText(text); status.textContent = 'Bericht gekopieerd. Plak het in je DM aan @nisudaclinic.'; }
      catch {
        const range = document.createRange(); range.selectNodeContents($('pre', result));
        getSelection().removeAllRanges(); getSelection().addRange(range);
        status.textContent = 'Het bericht is geselecteerd: kopieer het met Ctrl+C of Cmd+C.';
      }
    };
    copyBtn?.addEventListener('click', copy);
    $('[data-dm]', result)?.addEventListener('click', copy);
  };
  const handoffHtml = (text, failed) => `
    <p class="eyebrow">${failed ? 'Versturen is niet gelukt' : 'Nog één stap'}</p>
    <h3>${failed ? 'Je aanvraag is <em>niet</em> aangekomen.' : 'Verstuur je aanvraag <em>naar de kliniek</em>.'}</h3>
    <p class="body">${failed ? 'Er ging iets mis bij het versturen. Stuur je aanvraag hieronder direct naar de kliniek.' : 'Er is nog niets verstuurd. Je bericht staat hieronder klaar: kopieer het en stuur het als DM naar @nisudaclinic. De kliniek bevestigt je afspraak persoonlijk.'}</p>
    <pre>${esc(text)}</pre>
    <div class="actions"><button type="button" class="btn${form.dataset.whatsapp ? ' btn--light' : ''}" data-copy><span>Kopieer bericht</span>${arrow}</button>${routes(text)}</div>
    <p class="form__status" data-status aria-live="polite"></p>
    <button type="button" class="form__back" data-back>Gegevens aanpassen</button>`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.website.value) return; // honeypot
    tried = true;
    const errors = validate();
    if (errors.length) {
      summary.innerHTML = `<strong>Controleer ${errors.length === 1 ? 'dit veld' : 'deze velden'}:</strong><ul>${errors.map(([n, m]) => `<li><a href="#" data-to="${n}">${m}</a></li>`).join('')}</ul>`;
      summary.hidden = false; summary.focus();
      $$('[data-to]', summary).forEach((a) => a.addEventListener('click', (ev) => {
        ev.preventDefault(); $(`[data-field="${a.dataset.to}"] input, [data-field="${a.dataset.to}"] select`, form)?.focus();
      }));
      return;
    }
    summary.hidden = true;
    const d = data();
    const endpoint = form.dataset.endpoint;
    if (!endpoint) return show(handoffHtml(toText(d)));
    submit.setAttribute('aria-busy', 'true');
    $('span', submit).textContent = 'Bezig met versturen…';
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset(); sync(); tried = false;
      show(`<p class="eyebrow">Aanvraag verstuurd</p><h3>Dank je wel, <em>${esc(d.naam.split(' ')[0])}</em>.</h3><p class="body">Je aanvraag is aangekomen. De kliniek neemt contact met je op om je afspraak te bevestigen.</p><button type="button" class="form__back" data-back>Nog een aanvraag doen</button>`);
    } catch {
      show(handoffHtml(toText(d), true));
    } finally {
      submit.removeAttribute('aria-busy');
      $('span', submit).textContent = 'Aanvraag versturen';
    }
  });
  sync();
})();
