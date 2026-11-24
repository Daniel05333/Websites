// The Perfect Stage — dashboard-preview. Alle aanvragen, namen en zalen zijn
// VERZONNEN demo-gegevens. Aanvragen die via de website zijn verstuurd (in
// deze browser, via localStorage) komen er als "Nieuw" bij.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const D = JSON.parse($('#ps-data').textContent);
  const MON = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const MONL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const DAYN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fmt = (s) => { const d = new Date(`${s}T00:00`); return `${DAYN[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const T = iso(today);
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const pick = (a) => a[Math.floor(rnd() * a.length)];

  // ── demo-gegevens ────────────────────────────────────────────────────────
  const COUPLES = ['Sara & Yusuf', 'Elif & Mert', 'Nadia & Omar', 'Zeynep & Emre', 'Imane & Bilal', 'Lina & Adam', 'Hiba & Ayoub', 'Merve & Burak', 'Salma & Karim', 'Büşra & Kaan', 'Yasmina & Ilias', 'Dilara & Can', 'Soukaina & Mehdi', 'Esra & Furkan', 'Amira & Hamza', 'Ilse & Daan', 'Kawtar & Anas', 'Selin & Arda'];
  const VENUES = [['Feestzaal', 'Rotterdam'], ['Partycentrum', 'Schiedam'], ['Zalencentrum', 'Den Haag'], ['Eventlocatie', 'Dordrecht'], ['Feestzaal', 'Utrecht'], ['Partycentrum', 'Breda'], ['Eventhal', 'Amsterdam'], ['Feestzaal', 'Duisburg (DE)']];
  const EVENTS = ['Bruiloft', 'Bruiloft', 'Bruiloft', 'Henna', 'Verloving', 'Nikah'];
  const STATUS = ['Nieuw', 'In gesprek', 'Offerte verstuurd', 'Geboekt'];
  const req = [];
  for (let i = 0; i < COUPLES.length; i++) {
    const off = Math.floor(-40 + rnd() * 260);
    let d = add(today, off); if (rnd() < 0.6) d = add(d, (6 - d.getDay() + 7) % 7);
    const [vt, place] = pick(VENUES);
    const parts = D.parts.filter(() => rnd() < 0.35); if (!parts.length) parts.push('Bruidsbanken');
    const past = off < 0;
    req.push({ id: `R${100 + i}`, name: COUPLES[i % COUPLES.length], phone: `06 00 00 ${String(1000 + i * 37).slice(-4)}`, date: iso(d), event: pick(EVENTS), guests: 150 + Math.floor(rnd() * 16) * 50,
      venue: `${vt} (voorbeeld)`, place, collection: rnd() < 0.3 ? 'Op maat' : pick(D.collections), parts, colors: pick(['wit en goud', 'oudroze', 'rood en wit', 'lila', 'champagne', '']), promo: rnd() < 0.3,
      status: past ? 'Geboekt' : pick(['Nieuw', 'In gesprek', 'Offerte verstuurd', 'Geboekt', 'Geboekt']), created: iso(add(d, -Math.floor(30 + rnd() * 200))), note: '' });
  }
  let fresh = [];
  try { fresh = JSON.parse(localStorage.getItem('ps-demo-requests') || '[]'); } catch { fresh = []; }
  fresh.forEach((f) => req.unshift({ ...f, status: 'Nieuw', fresh: true, created: f.created.slice(0, 10) }));
  const saved = (() => { try { return JSON.parse(localStorage.getItem('ps-demo-status') || '{}'); } catch { return {}; } })();
  req.forEach((r) => { if (saved[r.id]) Object.assign(r, saved[r.id]); });
  const persist = (r) => { saved[r.id] = { status: r.status, note: r.note }; try { localStorage.setItem('ps-demo-status', JSON.stringify(saved)); } catch { /* */ } };

  const badge = (s) => `<span class="st st--${s.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(s)}</span>`;
  const view = $('[data-view]'), title = $('[data-title]'), search = $('[data-search]');
  $('[data-today]').textContent = today.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const match = (r) => !search.value || `${r.name} ${r.venue} ${r.place} ${r.collection}`.toLowerCase().includes(search.value.toLowerCase());
  const booked = (date, except) => req.filter((r) => r.date === date && r.status === 'Geboekt' && r.id !== except);
  let month = new Date(today.getFullYear(), today.getMonth(), 1);

  const V = {
    aanvragen() {
      const open = req.filter((r) => r.date >= T && match(r));
      return `<section class="kpis"><article><small>Nieuwe aanvragen</small><b>${req.filter((r) => r.status === 'Nieuw').length}</b><span>nog te beantwoorden</span></article><article><small>Open offertes</small><b>${req.filter((r) => r.status === 'Offerte verstuurd' && r.date >= T).length}</b><span>wachten op antwoord</span></article><article><small>Geboekt (komend)</small><b>${req.filter((r) => r.status === 'Geboekt' && r.date >= T).length}</b><span>events</span></article><article><small>Vraagt naar korting</small><b>${req.filter((r) => r.promo && r.date >= T).length}</b><span>actie tot €300</span></article></section>
      <div class="pipe">${STATUS.map((s) => { const l = open.filter((r) => r.status === s).sort((a, b) => (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0) || a.date.localeCompare(b.date)); return `<section class="pipe__col"><h2>${s}<span>${l.length}</span></h2>${l.map((r) => `<button type="button" class="rq${r.fresh ? ' rq--fresh' : ''}" data-id="${r.id}"><b>${esc(r.name)}</b><small>${fmt(r.date)} · ${esc(r.event)}</small><small>${esc(r.venue)}, ${esc(r.place)} · ${r.guests} gasten</small><span class="rq__meta"><i>${esc(r.collection)}</i>${r.promo ? '<i class="promo">€300-actie</i>' : ''}${r.fresh ? '<i class="promo" style="background:#d65f7e;color:#fff">Via website</i>' : ''}${booked(r.date, r.id).length && r.status !== 'Geboekt' ? '<i class="promo">Datum al bezet</i>' : ''}</span></button>`).join('') || '<p class="empty">Geen aanvragen.</p>'}</section>`; }).join('')}</div>`;
    },
    planning() {
      const first = new Date(month), start = add(first, -((first.getDay() + 6) % 7));
      const days = Array.from({ length: 42 }, (_, i) => add(start, i));
      return `<section class="card"><div class="cal__bar"><h2>${MONL[month.getMonth()]} ${month.getFullYear()}</h2><div><button type="button" data-m="-1">‹ Vorige</button><button type="button" data-m="0">Vandaag</button><button type="button" data-m="1">Volgende ›</button></div></div>
        <div class="mcal">${['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map((d) => `<p class="mcal__h">${d}</p>`).join('')}
        ${days.map((d) => { const k = iso(d), evs = req.filter((r) => r.date === k && r.status !== 'Afgewezen' && match(r)), full = evs.filter((r) => r.status === 'Geboekt').length >= 2; return `<div class="mcal__d${d.getMonth() !== month.getMonth() ? ' is-out' : ''}${k === T ? ' is-today' : ''}${full ? ' is-full' : ''}"><b>${d.getDate()}</b>${evs.map((r) => `<button type="button" class="mcal__ev${r.status !== 'Geboekt' ? ' is-option' : ''}${r.fresh ? ' is-fresh' : ''}" data-id="${r.id}" title="${esc(r.name)} · ${esc(r.status)}">${esc(r.name.split(' & ')[0])}<span> · ${esc(r.place)}</span></button>`).join('')}</div>`; }).join('')}</div>
        <p class="legend"><i style="background:#f3e3b4"></i>Geboekt <i style="background:#e7eef8"></i>Optie / aanvraag <i style="background:#d65f7e"></i>Nieuw via website · gearceerd = 2 events, dag vol</p></section>`;
    },
    collecties() {
      const cnt = {}; req.filter((r) => r.status === 'Geboekt').forEach((r) => { cnt[r.collection] = (cnt[r.collection] || 0) + 1; });
      const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]); const max = top[0]?.[1] || 1;
      const pc = {}; req.forEach((r) => r.parts.forEach((p) => { pc[p] = (pc[p] || 0) + 1; })); const tp = Object.entries(pc).sort((a, b) => b[1] - a[1]); const mp = tp[0]?.[1] || 1;
      return `<div class="grid2"><section class="card"><h2>Geboekte collecties</h2><ul class="hbars">${top.map(([n, k]) => `<li><span>${esc(n)}</span><i style="--w:${(k / max) * 100}%"></i><b>${k}</b></li>`).join('')}</ul></section>
        <section class="card"><h2>Gevraagde onderdelen</h2><ul class="hbars">${tp.map(([n, k]) => `<li><span>${esc(n)}</span><i style="--w:${(k / mp) * 100}%"></i><b>${k}</b></li>`).join('')}</ul></section></div>`;
    },
    cijfers() {
      const months = Array.from({ length: 8 }, (_, i) => new Date(today.getFullYear(), today.getMonth() + i - 2, 1));
      const per = months.map((m) => ({ l: MON[m.getMonth()], n: req.filter((r) => r.status === 'Geboekt' && r.date.slice(0, 7) === iso(m).slice(0, 7)).length }));
      const mx = Math.max(1, ...per.map((p) => p.n));
      const all = req.length, won = req.filter((r) => r.status === 'Geboekt').length;
      const avg = Math.round(req.reduce((s, r) => s + r.guests, 0) / all);
      return `<section class="kpis"><article><small>Aanvragen</small><b>${all}</b><span>totaal (demo)</span></article><article><small>Conversie</small><b>${Math.round((won / all) * 100)}%</b><span>aanvraag → geboekt</span></article><article><small>Gemiddeld</small><b>${avg}</b><span>gasten per event</span></article><article><small>Zaterdagen</small><b>${Math.round((req.filter((r) => new Date(`${r.date}T00:00`).getDay() === 6).length / all) * 100)}%</b><span>van alle aanvragen</span></article></section>
        <section class="card"><h2>Geboekte events per maand</h2><div class="bars" role="img" aria-label="Geboekte events per maand">${per.map((p) => `<div><span style="--h:${(p.n / mx) * 100}%"><i>${p.n}</i></span><small>${p.l}</small></div>`).join('')}</div></section>`;
    },
  };
  const titles = { aanvragen: 'Aanvragen', planning: 'Planning', collecties: 'Collecties', cijfers: 'Cijfers' };
  let cur = 'aanvragen';
  const show = (k) => { cur = k; title.textContent = titles[k]; view.innerHTML = V[k](); $$('[data-tab]').forEach((b) => b.toggleAttribute('aria-current', b.dataset.tab === k)); };
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  search.addEventListener('input', () => show(cur === 'planning' ? 'planning' : 'aanvragen'));
  view.addEventListener('click', (e) => {
    const m = e.target.closest('[data-m]'), r = e.target.closest('[data-id]');
    if (m) { const n = Number(m.dataset.m); month = n ? new Date(month.getFullYear(), month.getMonth() + n, 1) : new Date(today.getFullYear(), today.getMonth(), 1); show('planning'); }
    else if (r) open(r.dataset.id);
  });

  // ── detail ───────────────────────────────────────────────────────────────
  const drawer = $('[data-drawer]'), body = $('[data-drawer-body]');
  const open = (id) => {
    const r = req.find((x) => x.id === id);
    const clash = booked(r.date, r.id);
    body.innerHTML = `<header class="dr__head"><i class="av av--lg">${esc(r.name.split(' & ').map((n) => n[0]).join(''))}</i><div><h2 id="drawer-title">${esc(r.name)}</h2><p>Aanvraag van ${fmt(r.created)}${r.fresh ? ' · via de website' : ''}</p></div><button type="button" class="dr__x" data-close aria-label="Sluiten">✕</button></header>
      <div class="dr__kpis"><div><b>${fmt(r.date).split(' ').slice(0, 3).join(' ')}</b><small>datum</small></div><div><b>${r.guests}</b><small>gasten</small></div><div><b>${esc(r.event)}</b><small>feest</small></div></div>
      ${clash.length ? `<p class="dr__conflict">Let op: op deze datum is al ${clash.length === 1 ? 'een event' : `${clash.length} events`} geboekt (${clash.map((c) => esc(c.name)).join(', ')}). Check of het team beide kan opbouwen.</p>` : ''}
      <div class="dr__status" role="group" aria-label="Status">${[...STATUS, 'Afgewezen'].map((s) => `<button type="button" data-st="${s}" aria-pressed="${r.status === s}">${s}</button>`).join('')}</div>
      <dl class="dr__info"><div><dt>Zaal</dt><dd>${esc(r.venue)}, ${esc(r.place)}</dd></div><div><dt>Telefoon</dt><dd>${esc(r.phone)}</dd></div><div><dt>Collectie</dt><dd>${esc(r.collection)}</dd></div><div><dt>Kleuren</dt><dd>${esc(r.colors) || '—'}</dd></div><div><dt>Korting</dt><dd>${r.promo ? 'Vraagt naar de actie tot €300' : '—'}</dd></div></dl>
      <h3>Onderdelen</h3><p class="dr__parts">${r.parts.map((p) => `<i>${esc(p)}</i>`).join('') || '—'}</p>
      <h3>Interne notitie</h3><textarea class="dr__note" data-note placeholder="Bijv. offerte €… verstuurd, opbouw vanaf 11:00">${esc(r.note || '')}</textarea>
      <div class="dr__actions"><button type="button" class="d-btn" disabled title="Demo">WhatsApp sturen</button><button type="button" class="d-btn d-btn--dark" disabled title="Demo">Offerte maken</button></div>
      <p class="dr__demo">Demo: verzonnen gegevens. Status en notitie worden in deze browser bewaard.</p>`;
    body.onclick = (e) => { const b = e.target.closest('[data-st]'); if (!b) return; r.status = b.dataset.st; persist(r); $$('[data-st]', body).forEach((x) => x.setAttribute('aria-pressed', x === b)); show(cur); };
    body.oninput = (e) => { if (e.target.matches('[data-note]')) { r.note = e.target.value; persist(r); } };
    drawer.showModal();
  };
  drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.closest('[data-close]')) drawer.close(); });
  show('aanvragen');
})();
