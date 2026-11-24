// Studio Nazz — dashboard-preview. Alle klanten, afspraken en bedragen zijn
// VERZONNEN demo-gegevens. Boekingen die in de varianten zijn gemaakt (in deze
// browser, via localStorage) worden er als "Nieuw" tussen gezet.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const DAYN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const DAYL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const MON = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = (s) => new Date(`${s}T00:00`);
  const fmt = (s) => { const d = parse(s); return `${DAYN[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
  const euro = (n) => `€${n.toLocaleString('nl-NL')}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const T = iso(today);
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  let seed = 42;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  // ── demo-gegevens ────────────────────────────────────────────────────────
  // [naam, duur in min, voorbeeldprijs, categorie]
  const TR = [['Classic lashes', 120, 85, 'Lashes'], ['Hybrid lashes', 135, 95, 'Lashes'], ['Volume lashes', 150, 110, 'Lashes'], ['Russian volume', 165, 125, 'Lashes'], ['Wispy lashes', 150, 115, 'Lashes'], ['Lash volume lift', 60, 55, 'Lashes'], ['Refill', 75, 50, 'Lashes'], ['Refill', 75, 50, 'Lashes'], ['Refill', 75, 50, 'Lashes'], ['Brow threading', 20, 15, 'Brows'], ['Brow lamination', 45, 45, 'Brows'], ['Brow tint', 20, 20, 'Brows'], ['Powderbrows', 150, 250, 'Brows'], ['PhiLings', 60, 75, 'Skin'], ['Microneedling', 60, 90, 'Skin'], ['Plasmapen', 60, 95, 'Skin'], ['Facials', 60, 65, 'Skin']];
  const info = Object.fromEntries(TR.map(([n, m, p, c]) => [n, { min: m, price: p, cat: c }]));
  const NAMES = ['Lina de Vries', 'Ayla Yılmaz', 'Noor El Amrani', 'Emma Jansen', 'Selin Kaya', 'Fatima Bakkali', 'Julia Visser', 'Melis Demir', 'Sanne Bos', 'Hiba Ouali', 'Eva Smit', 'Derya Aydın', 'Isa Mulder', 'Yasmin Haddou', 'Lotte Meijer', 'Zeynep Çelik', 'Nora de Jong', 'Amira Benali', 'Fleur Peters', 'Elif Şahin', 'Mila Bakker', 'Sara Yıldız'];
  const NOTES = ['C-curl, 10–12 mm, natuurlijke look', 'D-curl, 12–14 mm, cat eye', 'Gevoelige ogen: lijm met weinig damp gebruiken', 'Wil graag wispy met spikes', 'Komt elke 3 weken voor refill', 'Brows iets lichter tinten', 'Voorkeur voor zaterdagochtend', 'Eerste keer bij Studio Nazz, via Instagram', ''];
  const clients = NAMES.map((name, i) => ({
    id: `K${100 + i}`, name, phone: `06 00 00 0${String(100 + i * 37).slice(-3)}`,
    email: `${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').split(' ').join('.')}@voorbeeld.nl`,
    since: iso(add(today, -Math.floor(40 + rnd() * 600))), note: pick(NOTES), referredBy: i % 7 === 3 ? NAMES[(i + 5) % NAMES.length] : '', source: pick(['Instagram', 'Website', 'Via vriendin', 'Instagram']),
  }));
  const appts = [];
  for (let off = -56; off <= 21; off++) {
    const d = add(today, off);
    if (d.getDay() === 0) continue;
    let t = 9 * 60 + Math.floor(rnd() * 3) * 30;
    const n = off < 0 ? 2 + Math.floor(rnd() * 3) : 1 + Math.floor(rnd() * 2);
    for (let k = 0; k < n && t < 17 * 60; k++) {
      const [tr, min] = pick(TR);
      const c = pick(clients);
      const past = off < 0 || (off === 0 && t < 11 * 60);
      appts.push({ id: `A${appts.length + 1}`, date: iso(d), start: t, min, treatment: tr, client: c.id, source: pick(['Website', 'Website', 'Instagram', 'Telefoon']),
        status: past ? (rnd() < 0.06 ? 'No-show' : 'Voltooid') : (rnd() < 0.2 ? 'Aanbetaling open' : 'Bevestigd'), price: info[tr].price });
      t += min + (off < 0 ? (rnd() < 0.5 ? 30 : 0) : 60 + Math.floor(rnd() * 3) * 30);
    }
  }
  // boekingen uit de varianten (deze browser)
  let fresh = [];
  try { fresh = JSON.parse(localStorage.getItem('nazz-demo-bookings') || '[]'); } catch { fresh = []; }
  fresh.forEach((b, i) => {
    let c = clients.find((x) => x.name.toLowerCase() === String(b.name).toLowerCase());
    if (!c) { c = { id: `N${i}`, name: b.name, phone: b.phone, email: b.email || '—', since: T, note: b.note || '', referredBy: '', source: b.source, isNew: true }; clients.unshift(c); }
    const [h, m] = (b.time || '10:00').split(':').map(Number);
    appts.push({ id: b.id, date: b.date, start: h * 60 + m, min: b.course ? 480 : b.min, treatment: b.treatment, client: c.id, source: b.source, status: 'Nieuw', price: info[b.treatment]?.price ?? 0, fresh: true, course: b.course });
  });
  appts.sort((a, b) => (a.date + String(a.start).padStart(4, '0')).localeCompare(b.date + String(b.start).padStart(4, '0')));
  const academy = [
    { name: 'Rania Aksoy', course: 'One by one', format: '1-op-1', date: iso(add(today, 9)), status: 'Ingepland' },
    { name: 'Chantal Wouters', course: 'Russian volume', format: 'Groep', date: iso(add(today, 16)), status: 'Aanbetaling ontvangen' },
    { name: 'Meryem Öztürk', course: 'Wimperlift + browlamination', format: '1-op-1', date: iso(add(today, 23)), status: 'Intake gepland' },
    { name: 'Kim van Dam', course: 'Browlamination', format: 'Groep', date: iso(add(today, 30)), status: 'Nieuw' },
    { name: 'Souad Amrani', course: 'One by one + Russian volume', format: '1-op-1', date: iso(add(today, -12)), status: 'Gecertificeerd' },
  ];
  fresh.filter((b) => b.course).forEach((b) => academy.unshift({ name: b.name, course: b.treatment.replace('Cursus: ', ''), format: '—', date: b.date, status: 'Nieuw', fresh: true }));

  const byClient = (id) => clients.find((c) => c.id === id);
  const time = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const initials = (n) => n.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const badge = (s) => `<span class="st st--${s.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(s)}</span>`;
  const stats = (c) => {
    const mine = appts.filter((a) => a.client === c.id);
    const done = mine.filter((a) => a.status === 'Voltooid');
    return { mine, visits: done.length, spent: done.reduce((s, a) => s + a.price, 0), last: [...done].pop(), next: mine.find((a) => a.date >= T && a.status !== 'Voltooid') };
  };

  // ── views ────────────────────────────────────────────────────────────────
  const view = $('[data-view]'), title = $('[data-title]'), search = $('[data-search]');
  $('[data-today]').textContent = `${DAYL[today.getDay()]} ${today.getDate()} ${MON[today.getMonth()]} ${today.getFullYear()}`;
  const apptRow = (a, withDate = true) => { const c = byClient(a.client); return `<li class="ap${a.fresh ? ' ap--fresh' : ''}" data-client="${c.id}" tabindex="0"><span class="ap__time">${withDate ? `${fmt(a.date)} · ` : ''}${a.course ? 'hele dag' : time(a.start)}</span><span class="ap__who"><i class="av">${initials(c.name)}</i><b>${esc(c.name)}</b></span><span class="ap__what">${esc(a.treatment)}</span>${badge(a.status)}</li>`; };

  const V = {
    overzicht() {
      const todayA = appts.filter((a) => a.date === T);
      const weekEnd = iso(add(today, 7));
      const week = appts.filter((a) => a.date >= T && a.date < weekEnd && a.status !== 'Voltooid');
      const month = appts.filter((a) => a.date.slice(0, 7) === T.slice(0, 7) && a.status === 'Voltooid');
      const newC = clients.filter((c) => c.since >= iso(add(today, -30)));
      const pop = {}; appts.filter((a) => a.date >= iso(add(today, -56)) && !a.course).forEach((a) => { pop[a.treatment] = (pop[a.treatment] || 0) + 1; });
      const top = Object.entries(pop).sort((a, b) => b[1] - a[1]).slice(0, 6); const max = top[0]?.[1] || 1;
      const weeks = Array.from({ length: 8 }, (_, i) => { const s = add(today, -7 * (7 - i) - ((today.getDay() + 6) % 7)); const e = add(s, 7); const n = appts.filter((a) => a.date >= iso(s) && a.date < iso(e)).length; return { label: `${s.getDate()} ${MON[s.getMonth()]}`, n }; });
      const wmax = Math.max(...weeks.map((w) => w.n));
      return `<section class="kpis">
          <article><small>Vandaag</small><b>${todayA.length}</b><span>afspraken</span></article>
          <article><small>Komende 7 dagen</small><b>${week.length}</b><span>afspraken</span></article>
          <article><small>Omzet deze maand</small><b>${euro(month.reduce((s, a) => s + a.price, 0))}</b><span>voorbeeldprijzen</span></article>
          <article><small>Nieuwe klanten</small><b>${newC.length}</b><span>laatste 30 dagen</span></article>
        </section>
        ${fresh.length ? `<section class="card card--fresh"><h2>Nieuw via de website <span>${fresh.length}</span></h2><ul class="aps">${appts.filter((a) => a.fresh).map((a) => apptRow(a)).join('')}</ul></section>` : ''}
        <div class="grid2">
          <section class="card"><h2>Vandaag</h2>${todayA.length ? `<ol class="timeline">${todayA.map((a) => { const c = byClient(a.client); return `<li data-client="${c.id}" tabindex="0"><span>${time(a.start)}<small>${a.min} min</small></span><div><b>${esc(a.treatment)}</b><p>${esc(c.name)} · ${esc(c.phone)}</p></div>${badge(a.status)}</li>`; }).join('')}</ol>` : '<p class="empty">Geen afspraken vandaag.</p>'}</section>
          <section class="card"><h2>Komende afspraken</h2><ul class="aps">${week.slice(0, 7).map((a) => apptRow(a)).join('')}</ul></section>
        </div>
        <div class="grid2">
          <section class="card"><h2>Afspraken per week</h2><div class="bars" role="img" aria-label="Aantal afspraken per week, laatste 8 weken">${weeks.map((w) => `<div><span style="--h:${(w.n / wmax) * 100}%"><i>${w.n}</i></span><small>${w.label}</small></div>`).join('')}</div></section>
          <section class="card"><h2>Populairste behandelingen</h2><ul class="hbars">${top.map(([n, k]) => `<li><span>${esc(n)}</span><i style="--w:${(k / max) * 100}%"></i><b>${k}</b></li>`).join('')}</ul></section>
        </div>`;
    },
    agenda(week = 0) {
      const s = add(today, week * 7 - ((today.getDay() + 6) % 7));
      const days = Array.from({ length: 6 }, (_, i) => add(s, i));
      const hours = Array.from({ length: 10 }, (_, i) => 9 + i);
      return `<section class="card"><div class="cal__bar"><h2>${days[0].getDate()} ${MON[days[0].getMonth()]} – ${days[5].getDate()} ${MON[days[5].getMonth()]}</h2><div><button type="button" data-week="${week - 1}">‹ Vorige</button><button type="button" data-week="0">Deze week</button><button type="button" data-week="${week + 1}">Volgende ›</button></div></div>
        <div class="cal"><div class="cal__hours">${hours.map((h) => `<span>${h}:00</span>`).join('')}</div>
        ${days.map((d) => `<div class="cal__day${iso(d) === T ? ' is-today' : ''}${avOpen(d) ? '' : ' is-closed'}"><p>${DAYN[d.getDay()]} <b>${d.getDate()}</b>${avOpen(d) ? '' : `<small>${esc(avReason(d))}</small>`}</p><div class="cal__col">${appts.filter((a) => a.date === iso(d)).map((a) => { const c = byClient(a.client); const top = ((a.course ? 9 * 60 : a.start) - 540) / 600 * 100; const h = Math.min(a.course ? 480 : a.min, 1080 - a.start) / 600 * 100; return `<button type="button" class="ev ev--${(info[a.treatment]?.cat || 'academy').toLowerCase()}${a.fresh ? ' ev--fresh' : ''}" style="top:${top}%;height:${h}%" data-client="${c.id}"><b>${a.course ? 'Cursus' : time(a.start)} ${esc(a.treatment)}</b><span>${esc(c.name)}</span></button>`; }).join('')}</div></div>`).join('')}</div>
        <p class="legend"><i class="ev--lashes"></i>Lashes <i class="ev--brows"></i>Brows <i class="ev--skin"></i>Skin <i class="ev--fresh"></i>Nieuw via website</p></section>`;
    },
    klanten(q = '') {
      const list = clients.filter((c) => !q || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase()));
      return `<section class="card"><table class="tbl"><thead><tr><th>Klant</th><th>Telefoon</th><th>Bezoeken</th><th>Laatste behandeling</th><th>Volgende afspraak</th><th class="num">Besteed</th></tr></thead><tbody>
        ${list.map((c) => { const s = stats(c); return `<tr data-client="${c.id}" tabindex="0"><td><span class="ap__who"><i class="av">${initials(c.name)}</i><b>${esc(c.name)}</b>${c.isNew ? ' <span class="st st--nieuw">Nieuw</span>' : ''}</span></td><td>${esc(c.phone)}</td><td>${s.visits}</td><td>${s.last ? `${esc(s.last.treatment)} <small>${fmt(s.last.date)}</small>` : '—'}</td><td>${s.next ? `${fmt(s.next.date)} <small>${esc(s.next.treatment)}</small>` : '—'}</td><td class="num">${euro(s.spent)}</td></tr>`; }).join('')}
        </tbody></table>${list.length ? '' : '<p class="empty">Geen klant gevonden.</p>'}</section>`;
    },
    boekingen(f = 'komend') {
      const list = f === 'komend' ? appts.filter((a) => a.date >= T) : f === 'nieuw' ? appts.filter((a) => a.fresh) : appts.filter((a) => a.date < T).reverse();
      return `<section class="card"><div class="cal__bar"><h2>Boekingen</h2><div>${[['komend', 'Komend'], ['nieuw', `Nieuw via website (${fresh.length})`], ['eerder', 'Eerder']].map(([k, l]) => `<button type="button" data-filter="${k}"${k === f ? ' aria-pressed="true"' : ''}>${l}</button>`).join('')}</div></div>
        <table class="tbl"><thead><tr><th>Datum</th><th>Tijd</th><th>Klant</th><th>Behandeling</th><th>Bron</th><th>Status</th><th class="num">Bedrag</th></tr></thead><tbody>
        ${list.slice(0, 60).map((a) => { const c = byClient(a.client); return `<tr data-client="${c.id}" tabindex="0"${a.fresh ? ' class="is-fresh"' : ''}><td>${fmt(a.date)}</td><td>${a.course ? '—' : time(a.start)}</td><td>${esc(c.name)}</td><td>${esc(a.treatment)}</td><td>${esc(a.source)}</td><td>${badge(a.status)}</td><td class="num">${a.price ? euro(a.price) : '—'}</td></tr>`; }).join('')}
        </tbody></table>${list.length ? '' : '<p class="empty">Nog geen boekingen. Maak er een in variant A, B of C.</p>'}</section>`;
    },
    beschikbaarheid(week = avWeek) {
      avWeek = week;
      const D = avDraft, step = Number(D.slot) || 20;
      const s0 = add(today, week * 7 - ((today.getDay() + 6) % 7));
      const days = Array.from({ length: 7 }, (_, i) => add(s0, i));
      const rows = []; for (let m = GRID_FROM; m + step <= GRID_TO; m += step) rows.push(m);
      const cell = (d, m) => {
        const past = iso(d) < T || (iso(d) === T);
        const bk = bookedAt(d, m, step);
        const on = slotOn(d, m, step, D);
        const cls = bk ? 'is-booked' : on ? 'is-on' : 'is-off';
        const label = `${DAYL[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${time(m)}: ${bk ? `geboekt door ${bk}` : on ? 'beschikbaar' : 'niet beschikbaar'}`;
        return `<button type="button" class="sl ${cls}${past ? ' is-past' : ''}${m % 60 === 0 ? ' is-hour' : ''}" data-sl="${iso(d)}|${m}" aria-pressed="${on && !bk}" aria-label="${esc(label)}"${past || bk ? ' disabled' : ''}>${bk ? `<span>${esc(bk.split(' ')[0])}</span>` : ''}</button>`;
      };
      const count = (d) => rows.filter((m) => slotOn(d, m, step, D) && !bookedAt(d, m, step)).length;
      const pv = avPreview;
      const pvDays = []; for (let i = 1; pvDays.length < 10 && i < 60; i++) { const d = add(today, i); pvDays.push(d); }
      pv.day = pv.day && pvDays.some((d) => iso(d) === pv.day) ? pv.day : iso(pvDays.find((d) => starts(d, pv.min, D).length) || pvDays[0]);
      const pvStarts = starts(new Date(`${pv.day}T00:00`), pv.min, D);
      return `<p class="av-note">Tik of sleep over de slots om ze <b>beschikbaar</b> (groen) of <b>niet beschikbaar</b> (grijs) te maken. Geboekte slots zijn vergrendeld. Rechts zie je meteen wat klanten kunnen boeken.${avSaved ? ` <span>Laatst opgeslagen: ${esc(avSaved)}</span>` : ''}</p>
      <div class="sp">
        <section class="card sp__planner">
          <div class="sp__bar">
            <div class="sp__nav"><button type="button" data-avw="${week - 1}"${week <= 0 ? ' disabled' : ''} aria-label="Vorige week">‹</button><h2>${s0.getDate()} ${MON[s0.getMonth()]} – ${days[6].getDate()} ${MON[days[6].getMonth()]}</h2><button type="button" data-avw="${week + 1}" aria-label="Volgende week">›</button></div>
            <label class="sp__len">Slotlengte <select data-av-slot>${[10, 15, 20, 30, 60].map((n) => `<option value="${n}"${n === step ? ' selected' : ''}>${n} min</option>`).join('')}</select></label>
            <button type="button" class="sp__act" data-av-copyweek>Kopieer week → volgende week</button>
          </div>
          <div class="sp__scroll"><div class="sp__grid" style="--rows:${rows.length}" data-grid>
            <div class="sp__times"><span class="sp__corner"></span>${rows.map((m) => `<span${m % 60 === 0 ? ' class="is-hour"' : ''}>${m % 60 === 0 || step >= 30 ? time(m) : ''}</span>`).join('')}</div>
            ${days.map((d) => { const past = iso(d) <= T; const ov = !!D.days[iso(d)]; return `<div class="sp__day${past ? ' is-past' : ''}">
              <div class="sp__head"><p><small>${DAYN[d.getDay()]}</small> <b>${d.getDate()}</b>${ov ? '<i title="Aangepast t.o.v. standaardweek">•</i>' : ''}</p><em>${past ? 'voorbij' : `${count(d)} vrij`}</em>
                ${past ? '' : `<span class="sp__dayact"><button type="button" data-av-day="all" data-date="${iso(d)}" title="Hele dag beschikbaar">Aan</button><button type="button" data-av-day="none" data-date="${iso(d)}" title="Hele dag niet beschikbaar">Uit</button>${ov ? `<button type="button" data-av-day="reset" data-date="${iso(d)}" title="Terug naar standaardweek">↺</button>` : ''}</span>`}</div>
              ${rows.map((m) => cell(d, m)).join('')}
            </div>`; }).join('')}
          </div></div>
          <p class="legend"><i class="lg lg--on"></i>Beschikbaar <i class="lg lg--off"></i>Niet beschikbaar <i class="lg lg--bk"></i>Geboekt <i class="lg lg--ov"></i>Aangepaste dag</p>
          <details class="sp__std"><summary>Standaardweek bewerken <small>(geldt voor alle dagen die je niet zelf hebt aangepast)</small></summary>
            <div class="av-week">${[1, 2, 3, 4, 5, 6, 0].map((n) => { const w = D.week[n]; return `<div class="av-row${w.open ? '' : ' is-off'}"><b>${DAYL[n]}</b>
              <label class="sw"><input type="checkbox" data-av="open" data-day="${n}"${w.open ? ' checked' : ''} aria-label="${DAYL[n]} open"><i aria-hidden="true"></i><span>${w.open ? 'Open' : 'Gesloten'}</span></label>
              <input type="time" step="300" data-av="from" data-day="${n}" value="${w.from}" aria-label="${DAYL[n]} van"${w.open ? '' : ' disabled'}>
              <input type="time" step="300" data-av="to" data-day="${n}" value="${w.to}" aria-label="${DAYL[n]} tot"${w.open ? '' : ' disabled'}>
              <span class="av-pause"><input type="time" step="300" data-av="pFrom" data-day="${n}" value="${w.pFrom}" aria-label="${DAYL[n]} pauze van"${w.open ? '' : ' disabled'}><i>–</i><input type="time" step="300" data-av="pTo" data-day="${n}" value="${w.pTo}" aria-label="${DAYL[n]} pauze tot"${w.open ? '' : ' disabled'}></span></div>`; }).join('')}</div>
          </details>
        </section>
        <aside class="sp__preview" aria-label="Klantweergave (preview)">
          <p class="sp__ptitle">Klantweergave <small>preview · zo ziet het eruit op de website</small></p>
          <div class="phone"><div class="phone__screen">
            <p class="phone__brand"><span class="logo"></span>Studio Nazz</p>
            <h3>Boek je afspraak</h3>
            <label class="pv-field"><span>Behandeling</span><select data-pv-t>${PV_TR.map(([n, m]) => `<option value="${esc(n)}" data-min="${m}"${n === pv.t ? ' selected' : ''}>${esc(n)} · ${m} min</option>`).join('')}</select></label>
            <p class="pv-h">Kies een dag</p>
            <div class="pv-days">${pvDays.map((d) => { const n = starts(d, pv.min, D).length; return `<button type="button" class="pv-day${iso(d) === pv.day ? ' on' : ''}" data-pv-day="${iso(d)}"${n ? '' : ' disabled'}><small>${DAYN[d.getDay()]}</small><b>${d.getDate()}</b><small>${n ? `${n} vrij` : 'vol'}</small></button>`; }).join('')}</div>
            <p class="pv-h">Vrije tijden</p>
            <div class="pv-times">${pvStarts.length ? pvStarts.map((m) => `<button type="button" class="pv-time${pv.time === m ? ' on' : ''}" data-pv-time="${m}">${time(m)}</button>`).join('') : '<p class="pv-empty">Geen vrije tijden op deze dag.</p>'}</div>
            ${pv.time != null && pvStarts.includes(pv.time) ? `<form class="pv-form" data-pv-form><label class="pv-field"><span>Naam</span><input name="name" required placeholder="Naam klant"></label><button type="submit">Boek ${time(pv.time)} (test)</button></form>` : ''}
          </div></div>
          <p class="sp__pnote">De preview gebruikt je huidige instellingen, ook als je nog niet hebt opgeslagen. Een testboeking verschijnt direct als geboekt in je rooster en in de agenda.</p>
        </aside>
      </div>
      <div class="av-bar${avDirty ? ' on' : ''}" role="region" aria-label="Opslaan"><p data-av-msg>${avDirty ? 'Je hebt wijzigingen die nog niet zijn opgeslagen.' : 'Alles is opgeslagen.'}</p><button type="button" class="d-btn d-btn--on" data-av-undo${avDirty ? '' : ' disabled'}>Ongedaan maken</button><button type="button" class="d-btn d-btn--dark d-btn--on" data-av-save${avDirty ? '' : ' disabled'}>Opslaan</button></div>`;
    },
    academy() {
      return `<section class="kpis"><article><small>Aanmeldingen</small><b>${academy.length}</b><span>open en gepland</span></article><article><small>Eerstvolgende cursus</small><b>${fmt([...academy].filter((a) => a.date >= T).sort((a, b) => a.date.localeCompare(b.date))[0]?.date || T)}</b><span>&nbsp;</span></article><article><small>Gecertificeerd</small><b>${academy.filter((a) => a.status === 'Gecertificeerd').length}</b><span>dit kwartaal</span></article></section>
        <section class="card"><h2>Aanmeldingen</h2><table class="tbl"><thead><tr><th>Cursist</th><th>Cursus</th><th>Vorm</th><th>Datum</th><th>Status</th></tr></thead><tbody>${academy.map((a) => `<tr${a.fresh ? ' class="is-fresh"' : ''}><td><span class="ap__who"><i class="av">${initials(a.name)}</i><b>${esc(a.name)}</b></span></td><td>${esc(a.course)}</td><td>${esc(a.format)}</td><td>${fmt(a.date)}</td><td>${badge(a.status)}</td></tr>`).join('')}</tbody></table></section>`;
    },
  };
  const titles = { overzicht: 'Overzicht', agenda: 'Agenda', klanten: 'Klanten', boekingen: 'Boekingen', beschikbaarheid: 'Beschikbaarheid', academy: 'Academy' };
  let cur = 'overzicht';
  // ── beschikbaarheid: slotplanner ─────────────────────────────────────────
  // Opslag (deze browser): { slot, week: {0..6: {open, from, to, pFrom, pTo}},
  //   days: { 'jjjj-mm-dd': [[startMin, eindMin], …] }, blocked: [] }
  // days[datum] overschrijft de standaardweek voor die dag.
  const AV_KEY = 'nazz-availability';
  const GRID_FROM = 8 * 60, GRID_TO = 21 * 60;
  const PV_TR = [['Classic lashes', 120], ['Volume lashes', 150], ['Russian volume', 165], ['Refill', 75], ['Lash volume lift', 60], ['Brow lamination', 40], ['Brow threading', 20], ['Brow tint', 20], ['Microneedling', 60], ['Facials', 60]];
  const wd = (from, to) => ({ open: true, from, to, pFrom: '', pTo: '' });
  const AV_DEFAULT = { slot: 20, step: 20, week: { 0: { ...wd('10:00', '16:00'), open: false }, 1: wd('09:00', '18:00'), 2: wd('09:00', '18:00'), 3: wd('09:00', '18:00'), 4: wd('09:00', '18:00'), 5: wd('09:00', '18:00'), 6: wd('09:00', '17:00') }, days: {}, blocked: [] };
  let AVS = JSON.parse(JSON.stringify(AV_DEFAULT)), avSaved = '';
  try { const s = JSON.parse(localStorage.getItem(AV_KEY) || 'null'); if (s && s.week) { AVS = { ...AV_DEFAULT, ...s, days: s.days || {}, slot: s.slot || s.step || 20 }; avSaved = s.savedLabel || ''; } } catch { /* standaard */ }
  let avDraft = JSON.parse(JSON.stringify(AVS)), avDirty = false, avWeek = 0;
  const avPreview = { t: PV_TR[3][0], min: PV_TR[3][1], day: '', time: null };
  const toMin = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const norm = (rs) => { const a = rs.filter(([s, e]) => e > s).sort((x, y) => x[0] - y[0]); const out = []; for (const r of a) { const l = out[out.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else out.push([...r]); } return out; };
  const minus = (rs, [s, e]) => norm(rs.flatMap(([a, b]) => (e <= a || s >= b ? [[a, b]] : [[a, Math.min(b, s)], [Math.max(a, e), b]])));
  const ranges = (d, A = AVS) => {
    const k = iso(d);
    if (A.days?.[k]) return A.days[k];
    if (A.blocked?.some((b) => k >= b.from && k <= (b.to || b.from))) return [];
    const w = A.week[d.getDay()];
    if (!w?.open) return [];
    let r = [[toMin(w.from), toMin(w.to)]];
    if (w.pFrom && w.pTo) r = minus(r, [toMin(w.pFrom), toMin(w.pTo)]);
    return norm(r);
  };
  const inRanges = (rs, s, e) => rs.some(([a, b]) => s >= a && e <= b);
  const slotOn = (d, m, step, A = AVS) => inRanges(ranges(d, A), m, m + step);
  const dayAppts = (d) => appts.filter((a) => a.date === iso(d) && !a.course && a.status !== 'No-show');
  const bookedAt = (d, m, step) => { const a = dayAppts(d).find((x) => x.start < m + step && x.start + x.min > m); return a ? byClient(a.client).name : ''; };
  const starts = (d, len, A = AVS) => {
    if (iso(d) <= T) return [];
    const step = Number(A.slot) || 20, rs = ranges(d, A), ap = dayAppts(d), out = [];
    for (let m = GRID_FROM; m + len <= GRID_TO; m += step) if (inRanges(rs, m, m + len) && !ap.some((x) => x.start < m + len && x.start + x.min > m)) out.push(m);
    return out;
  };
  const avOpen = (d, A = AVS) => ranges(d, A).length > 0;
  const avReason = (d, A = AVS) => A.blocked?.find((b) => iso(d) >= b.from && iso(d) <= (b.to || b.from))?.reason || 'Niet beschikbaar';
  const setSlot = (date, m, on) => {
    const d = new Date(`${date}T00:00`), step = Number(avDraft.slot) || 20;
    const cur0 = ranges(d, avDraft);
    avDraft.days[date] = on ? norm([...cur0, [m, m + step]]) : minus(cur0, [m, m + step]);
  };
  const avCheck = (A) => {
    for (const [n, w] of Object.entries(A.week)) {
      if (!w.open) continue;
      if (!(toMin(w.to) > toMin(w.from))) return `${DAYL[n]}: de eindtijd moet na de begintijd liggen.`;
      if ((w.pFrom && !w.pTo) || (!w.pFrom && w.pTo)) return `${DAYL[n]}: vul bij de pauze zowel begin als eind in.`;
    }
    return '';
  };
  const toastEl = document.createElement('div'); toastEl.className = 'd-toast'; toastEl.setAttribute('role', 'status'); document.body.append(toastEl);
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('on'), 3500); };
  const avRender = (focusSel) => { const y = scrollY, sx = $('.sp__scroll', view)?.scrollLeft; view.innerHTML = V.beschikbaarheid(); scrollTo(0, y); if (sx) $('.sp__scroll', view).scrollLeft = sx; const pd = $('.pv-days', view), on = $('.pv-day.on', view); if (pd && on) pd.scrollLeft = on.offsetLeft - pd.offsetLeft - pd.clientWidth / 2 + on.offsetWidth / 2; if (focusSel) $(focusSel, view)?.focus(); };
  const avChange = () => { avDirty = true; };

  // slots tikken of slepen
  let paint = null;
  const paintCell = (btn) => {
    if (!btn || btn.disabled || !paint || paint.done.has(btn.dataset.sl)) return;
    const [date, m] = btn.dataset.sl.split('|');
    setSlot(date, Number(m), paint.on); paint.done.add(btn.dataset.sl);
    btn.classList.toggle('is-on', paint.on); btn.classList.toggle('is-off', !paint.on); btn.setAttribute('aria-pressed', paint.on);
  };
  view.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.sl'); if (!b || b.disabled || cur !== 'beschikbaarheid') return;
    e.preventDefault();
    paint = { on: !b.classList.contains('is-on'), done: new Set() }; paintCell(b);
  });
  addEventListener('pointermove', (e) => { if (!paint) return; paintCell(document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.sl')); });
  addEventListener('pointerup', () => { if (!paint) return; const n = paint.done.size; paint = null; if (n) { avChange(); avPreview.time = null; avRender(); } });

  view.addEventListener('change', (e) => {
    if (cur !== 'beschikbaarheid') return;
    const el = e.target;
    if (el.matches('[data-av-slot]')) { avDraft.slot = avDraft.step = Number(el.value); avChange(); avPreview.time = null; avRender('[data-av-slot]'); return; }
    if (el.matches('[data-pv-t]')) { avPreview.t = el.value; avPreview.min = Number(el.selectedOptions[0].dataset.min); avPreview.time = null; avPreview.day = ''; avRender('[data-pv-t]'); return; }
    const a = el.closest('[data-av]');
    if (!a) return;
    if (a.dataset.av === 'open') avDraft.week[a.dataset.day].open = a.checked;
    else avDraft.week[a.dataset.day][a.dataset.av] = a.value;
    avChange(); avRender(`[data-av="${a.dataset.av}"][data-day="${a.dataset.day}"]`);
    $('.sp__std', view).open = true;
  });
  view.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-pv-form]'); if (!f) return;
    e.preventDefault();
    const name = String(new FormData(f).get('name') || '').trim() || 'Testklant';
    const c = { id: `P${Date.now().toString(36)}`, name, phone: '—', email: '—', since: T, note: 'Testboeking via de klantweergave', referredBy: '', source: 'Preview', isNew: true };
    clients.unshift(c);
    appts.push({ id: c.id, date: avPreview.day, start: avPreview.time, min: avPreview.min, treatment: avPreview.t, client: c.id, source: 'Klantweergave (preview)', status: 'Nieuw', price: info[avPreview.t]?.price ?? 0, fresh: true });
    appts.sort((x, y) => (x.date + String(x.start).padStart(4, '0')).localeCompare(y.date + String(y.start).padStart(4, '0')));
    toast(`Testboeking: ${avPreview.t} op ${fmt(avPreview.day)} om ${time(avPreview.time)}. Staat nu als geboekt in je rooster.`);
    avPreview.time = null;
    const d = new Date(`${avPreview.day}T00:00`); const diff = Math.floor((d - add(today, -((today.getDay() + 6) % 7))) / (7 * 864e5));
    avWeek = Math.max(0, diff); avRender();
  });
  view.addEventListener('click', (e) => {
    if (cur !== 'beschikbaarheid') return;
    const w = e.target.closest('[data-avw]'), dy = e.target.closest('[data-av-day]'), pd = e.target.closest('[data-pv-day]'), pt = e.target.closest('[data-pv-time]'), sl = e.target.closest('.sl');
    if (sl && e.detail === 0 && !sl.disabled) { const [date, m] = sl.dataset.sl.split('|'); setSlot(date, Number(m), !sl.classList.contains('is-on')); avChange(); avRender(`[data-sl="${sl.dataset.sl}"]`); return; }
    if (w) { avWeek = Number(w.dataset.avw); avRender(); }
    else if (dy) {
      const date = dy.dataset.date;
      if (dy.dataset.avDay === 'reset') delete avDraft.days[date];
      else avDraft.days[date] = dy.dataset.avDay === 'all' ? [[GRID_FROM, GRID_TO]] : [];
      avChange(); avPreview.time = null; avRender();
    } else if (e.target.closest('[data-av-copyweek]')) {
      const s0 = add(today, avWeek * 7 - ((today.getDay() + 6) % 7));
      for (let i = 0; i < 7; i++) { const d = add(s0, i), n = add(d, 7); avDraft.days[iso(n)] = JSON.parse(JSON.stringify(ranges(d, avDraft))); }
      avChange(); avWeek += 1; avRender(); toast('Week gekopieerd naar de volgende week.');
    } else if (pd) { avPreview.day = pd.dataset.pvDay; avPreview.time = null; avRender(); }
    else if (pt) { avPreview.time = Number(pt.dataset.pvTime); avRender('[data-pv-form] input'); }
    else if (e.target.closest('[data-av-undo]')) { avDraft = JSON.parse(JSON.stringify(AVS)); avDirty = false; avRender(); }
    else if (e.target.closest('[data-av-save]')) {
      const err = avCheck(avDraft); if (err) { toast(err); return; }
      const now = new Date();
      avSaved = `${now.getDate()} ${MON[now.getMonth()]} om ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      AVS = JSON.parse(JSON.stringify({ ...avDraft, step: avDraft.slot, savedLabel: avSaved }));
      try { localStorage.setItem(AV_KEY, JSON.stringify(AVS)); } catch { /* opslag niet beschikbaar */ }
      avDirty = false; avRender(); toast('Opgeslagen. Je beschikbaarheid is bijgewerkt.');
    }
  });

  const show = (k, arg) => { cur = k; title.textContent = titles[k]; view.innerHTML = V[k](arg); $$('[data-tab]').forEach((b) => b.toggleAttribute('aria-current', b.dataset.tab === k)); };
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => { search.value = ''; show(b.dataset.tab); }));
  search.addEventListener('input', () => show('klanten', search.value));
  view.addEventListener('click', (e) => {
    const w = e.target.closest('[data-week]'), f = e.target.closest('[data-filter]'), c = e.target.closest('[data-client]');
    if (w) show('agenda', Number(w.dataset.week));
    else if (f) show('boekingen', f.dataset.filter);
    else if (c) openClient(c.dataset.client);
  });
  view.addEventListener('keydown', (e) => { const c = e.target.closest('[data-client]'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openClient(c.dataset.client); } });

  // ── klantkaart ───────────────────────────────────────────────────────────
  const drawer = $('[data-drawer]'), dbody = $('[data-drawer-body]');
  const openClient = (id) => {
    const c = byClient(id); const s = stats(c);
    dbody.innerHTML = `<header class="dr__head"><i class="av av--lg">${initials(c.name)}</i><div><h2 id="drawer-title">${esc(c.name)}</h2><p>Klant sinds ${fmt(c.since)} · via ${esc(c.source)}</p></div><button type="button" class="dr__x" data-close aria-label="Sluiten">✕</button></header>
      <div class="dr__kpis"><div><b>${s.visits}</b><small>bezoeken</small></div><div><b>${euro(s.spent)}</b><small>besteed</small></div><div><b>${s.next ? fmt(s.next.date) : '—'}</b><small>volgende</small></div></div>
      <dl class="dr__info"><div><dt>Telefoon</dt><dd>${esc(c.phone)}</dd></div><div><dt>E-mail</dt><dd>${esc(c.email)}</dd></div>${c.referredBy ? `<div><dt>Bring a friend</dt><dd>Aangebracht door ${esc(c.referredBy)} · €10 korting</dd></div>` : ''}<div><dt>Notities</dt><dd>${esc(c.note) || '—'}</dd></div></dl>
      <h3>Afspraken</h3><ul class="dr__hist">${[...s.mine].reverse().map((a) => `<li><span>${fmt(a.date)}${a.course ? '' : ` · ${time(a.start)}`}</span><b>${esc(a.treatment)}</b>${badge(a.status)}<em>${a.price ? euro(a.price) : ''}</em></li>`).join('') || '<li>Nog geen afspraken.</li>'}</ul>
      <div class="dr__actions"><button type="button" class="d-btn" disabled title="Demo">Bericht sturen</button><button type="button" class="d-btn d-btn--dark" disabled title="Demo">Nieuwe afspraak</button></div>
      <p class="dr__demo">Demo: verzonnen klantgegevens.</p>`;
    drawer.showModal();
  };
  drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.closest('[data-close]')) drawer.close(); });
  show('overzicht');
})();
