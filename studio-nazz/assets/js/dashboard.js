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
    const n = 2 + Math.floor(rnd() * 3);
    for (let k = 0; k < n && t < 17 * 60; k++) {
      const [tr, min] = pick(TR);
      const c = pick(clients);
      const past = off < 0 || (off === 0 && t < 11 * 60);
      appts.push({ id: `A${appts.length + 1}`, date: iso(d), start: t, min, treatment: tr, client: c.id, source: pick(['Website', 'Website', 'Instagram', 'Telefoon']),
        status: past ? (rnd() < 0.06 ? 'No-show' : 'Voltooid') : (rnd() < 0.2 ? 'Aanbetaling open' : 'Bevestigd'), price: info[tr].price });
      t += min + (rnd() < 0.5 ? 30 : 0);
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
        ${days.map((d) => `<div class="cal__day${iso(d) === T ? ' is-today' : ''}"><p>${DAYN[d.getDay()]} <b>${d.getDate()}</b></p><div class="cal__col">${appts.filter((a) => a.date === iso(d)).map((a) => { const c = byClient(a.client); const top = ((a.course ? 9 * 60 : a.start) - 540) / 600 * 100; const h = Math.min(a.course ? 480 : a.min, 1080 - a.start) / 600 * 100; return `<button type="button" class="ev ev--${(info[a.treatment]?.cat || 'academy').toLowerCase()}${a.fresh ? ' ev--fresh' : ''}" style="top:${top}%;height:${h}%" data-client="${c.id}"><b>${a.course ? 'Cursus' : time(a.start)} ${esc(a.treatment)}</b><span>${esc(c.name)}</span></button>`; }).join('')}</div></div>`).join('')}</div>
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
    academy() {
      return `<section class="kpis"><article><small>Aanmeldingen</small><b>${academy.length}</b><span>open en gepland</span></article><article><small>Eerstvolgende cursus</small><b>${fmt([...academy].filter((a) => a.date >= T).sort((a, b) => a.date.localeCompare(b.date))[0]?.date || T)}</b><span>&nbsp;</span></article><article><small>Gecertificeerd</small><b>${academy.filter((a) => a.status === 'Gecertificeerd').length}</b><span>dit kwartaal</span></article></section>
        <section class="card"><h2>Aanmeldingen</h2><table class="tbl"><thead><tr><th>Cursist</th><th>Cursus</th><th>Vorm</th><th>Datum</th><th>Status</th></tr></thead><tbody>${academy.map((a) => `<tr${a.fresh ? ' class="is-fresh"' : ''}><td><span class="ap__who"><i class="av">${initials(a.name)}</i><b>${esc(a.name)}</b></span></td><td>${esc(a.course)}</td><td>${esc(a.format)}</td><td>${fmt(a.date)}</td><td>${badge(a.status)}</td></tr>`).join('')}</tbody></table></section>`;
    },
  };
  const titles = { overzicht: 'Overzicht', agenda: 'Agenda', klanten: 'Klanten', boekingen: 'Boekingen', academy: 'Academy' };
  let cur = 'overzicht';
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
