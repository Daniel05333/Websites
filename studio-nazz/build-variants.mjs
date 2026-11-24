// Bouwt drie ontwerpvarianten + dashboard-preview + keuzepagina in public/varianten/.
// Gebruik: node build.mjs && node build-variants.mjs   (of: npm run variants)
//   A · Noir    = de bestaande site, met een stappenwizard als boekingssysteem
//   B · Blush   = licht en zacht, 3D-fotostapel, agenda-boeking op de pagina
//   C · Atelier = redactioneel, 3D-fotoring, chat-assistent als boeking
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ig = `https://www.instagram.com/${site.contact.instagram}/`;
const A = site.academy;
const P = site.promo;
const year = new Date().getFullYear();
const DUR = { 'Classic lashes': 120, 'Hybrid lashes': 135, 'Volume lashes': 150, 'Russian volume': 165, 'Wispy lashes': 150, 'Lash volume lift': 60, 'Refill': 75, 'Brow threading': 20, 'Brow lamination': 45, 'Brow tint': 20, 'Powderbrows': 150 };
const dur = (n) => { const m = DUR[n] ?? 60; return m >= 60 ? `± ${Math.floor(m / 60)} uur${m % 60 ? ` ${m % 60}` : ''}` : `± ${m} min`; };
const desc = (d) => (isTodo(d) ? 'Omschrijving volgt' : d);
const img = (n) => `/assets/img/${n}.webp`;

const data = {
  categories: site.categories.map((c) => ({ name: c.name, items: c.items.map((i) => ({ name: i.name, desc: isTodo(i.desc) ? '' : i.desc })) })),
  courses: A.courses, promo: P.active, dashboard: 'dashboard.html',
};
const dataScript = `<script type="application/json" id="nazz-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const switcher = (cur) => `<nav class="vswitch" aria-label="Ontwerpvarianten"><a href="index.html"${cur === 'kies' ? ' aria-current="page"' : ''}>Kies<span> een stijl</span></a>${[['noir', 'A · Noir'], ['blush', 'B · Blush'], ['atelier', 'C · Atelier'], ['dashboard', 'Dashboard']].map(([k, l]) => `<a href="${k}.html"${cur === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;

const head = (title, css, extra = '') => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
${css.map((c) => `<link rel="stylesheet" href="/assets/css/${c}.css">`).join('\n')}
${extra}</head>`;
const scripts = (list) => list.map((s) => `<script src="/assets/js/${s}.js" defer></script>`).join('\n');
const book = (label, cls, pre = '') => `<button class="${cls}" type="button" data-book${pre ? ` data-pre="${esc(pre)}"` : ''}>${label}</button>`;
const compare = (n, i) => `<figure class="cmp rv" data-compare style="--d:${i * 0.08}s"><div class="cmp__media"><img src="${img(`brow-${n}-na`)}" alt=""><div class="cmp__before"><img src="${img(`brow-${n}-voor`)}" alt=""></div><span class="cmp__tag cmp__tag--l">Voor</span><span class="cmp__tag cmp__tag--r">Na</span><span class="cmp__handle" aria-hidden="true"></span><input type="range" min="0" max="100" value="50" aria-label="Vergelijk voor en na, wenkbrauw ${i + 1}"></div></figure>`;
const footerLinks = `<a href="${ig}" target="_blank" rel="noopener">Instagram</a>`;

// ══ A · NOIR (bestaande site + wizard) ════════════════════════════════════
const base = await readFile('public/index.html', 'utf8');
let noir = base
  .replace(/<dialog class="book"[\s\S]*?<\/dialog>\s*<div class="toast"[^>]*><\/div>/, '')
  .replace('<body data-page="home">', '<body data-page="home" data-booking="wizard">')
  .replace('<link rel="stylesheet" href="/assets/css/main.css">', '<link rel="stylesheet" href="/assets/css/main.css">\n<link rel="stylesheet" href="/assets/css/booking.css">\n<style>:root{--bk-radius:2px;--bk-pill:0;--bk-bg:#f7f1ea;--bk-accent:#16110e}.dock{bottom:calc(72px + env(safe-area-inset-bottom))}.footer{padding-bottom:110px}</style>')
  .replace('<script src="/assets/js/main.js" defer></script>', '<script src="/assets/js/main.js" defer></script>\n<script src="/assets/js/booking.js" defer></script>')
  .replace(/href="\/#/g, 'href="#').replace(/href="\/"/g, 'href="#top"')
  .replace(/<title>[^<]*<\/title>/, '<title>Studio Nazz · Variant A · Noir</title>')
  .replace('</body>', `${dataScript}\n${switcher('noir')}\n</body>`);
if (!noir.includes('data-booking="wizard"')) throw new Error('variant A: body-tag niet gevonden');

// ══ B · BLUSH ═════════════════════════════════════════════════════════════
const blush = `${head('Studio Nazz · Variant B · Blush', ['blush', 'booking'])}
<body data-booking="agenda" class="blush">
<a class="skip" href="#main">Naar de inhoud</a>
<header class="bh" data-head>
  <a class="bh__logo" href="#top" aria-label="Studio Nazz"><span class="logo"></span></a>
  <nav class="bh__nav" aria-label="Hoofdmenu"><a href="#behandelingen">Behandelingen</a><a href="#werk">Werk</a><a href="#academy">Academy</a></nav>
  <a class="b-btn b-btn--sm" href="#boeken">Boek online</a>
</header>
<main id="main">
<section class="bhero" id="top">
  <div class="bhero__copy" data-intro>
    <p class="b-eyebrow">Studio Nazz · ${esc(site.tagline)}</p>
    <h1>Good lashes,<br><em>brighter days.</em></h1>
    <p class="b-lead">Lashextensions, brows en huidbehandelingen met persoonlijke aandacht. Kies je behandeling en boek direct een vrij moment in de agenda.</p>
    <div class="b-actions"><a class="b-btn" href="#boeken">Bekijk vrije tijden</a><a class="b-btn b-btn--ghost" href="#behandelingen">Behandelingen</a></div>
    <ul class="b-usps">${site.usps.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  </div>
  <div class="bhero__art" aria-hidden="true">
    <span class="bhero__blob"></span>
    <div class="stack" data-stack>${['wispy-lashes', 'russian-volume-grijs', 'classic-lashes', 'lash-brow-closeup', 'volume-lashes-1'].map((n) => `<figure class="stack__card"><img src="${img(n)}" alt=""></figure>`).join('')}</div>
    <p class="bhero__script">${esc(site.slogan)}</p>
  </div>
</section>

<section class="bsec" id="behandelingen" aria-labelledby="b-beh">
  <div class="bwrap">
    <div class="bhead"><p class="b-eyebrow">Behandelingen</p><h2 id="b-beh">Alles voor je <em>look</em></h2></div>
    <div class="bcats">
      ${site.categories.map((c, i) => `<article class="bcat rv" style="--d:${i * 0.1}s">
        <figure class="bcat__img"><img src="${img(c.image)}" alt="${esc(c.name)} bij Studio Nazz" loading="lazy"><figcaption>${esc(c.name)}</figcaption></figure>
        <p class="bcat__lead">${esc(c.lead)}</p>
        <ul>${c.items.map((t) => `<li><div><b>${esc(t.name)}</b><small>${esc(desc(t.desc))}</small></div><span>${dur(t.name)}</span>${book('Boek', 'bcat__book', t.name)}</li>`).join('')}</ul>
      </article>`).join('\n      ')}
    </div>
    <p class="bnote">Prijzen volgen. De duur is een indicatie.</p>
  </div>
</section>

<section class="bsec bsec--soft" id="werk" aria-labelledby="b-werk">
  <div class="bwrap">
    <div class="bhead bhead--split"><div><p class="b-eyebrow">Portfolio</p><h2 id="b-werk">Lash <em>love</em></h2></div><p class="b-lead">Elke set is handwerk, gemapt op de oogvorm van de klant.</p></div>
    <ul class="bgrid">${site.portfolio.map((p, i) => `<li class="bgrid__item rv${p.wide ? ' bgrid__item--wide' : ''}" style="--d:${(i % 3) * 0.06}s"><figure class="tilt"><img src="${img(p.img)}" alt="${esc(p.label)} door Studio Nazz" loading="lazy"><figcaption>${esc(p.label)}</figcaption></figure></li>`).join('')}</ul>
    <div class="bhead bhead--center" style="margin-top:90px"><p class="b-eyebrow">Brow tint</p><h2>Voor <em>&amp;</em> na</h2></div>
    <div class="bcmp">${site.brows.map(compare).join('')}</div>
  </div>
</section>

${P.active ? `<section class="bsec" aria-labelledby="b-promo"><div class="bwrap"><div class="bpromo rv">
  <div><p class="b-eyebrow">Actie</p><h2 id="b-promo">Bring a <em>friend</em></h2><p class="b-lead">${esc(P.sub)}</p></div>
  <div class="bpromo__cards"><article><b>€10</b><span>Nieuwe klant</span><p>korting op haar eerste volle wimperset</p></article><article><b>€10</b><span>Bestaande klant</span><p>korting op jouw volgende refill na de afspraak van je vriendin</p></article></div>
  ${book('Boek samen', 'b-btn', 'Bring a friend: volle wimperset')}
</div></div></section>` : ''}

<section class="bsec bsec--soft" id="academy" aria-labelledby="b-acad">
  <div class="bwrap bacad">
    <div class="bacad__img rv"><img src="${img('lashlift-behandeling')}" alt="Lash lift-behandeling in de studio" loading="lazy"><span>Academy</span></div>
    <div>
      <p class="b-eyebrow">Studio Nazz Academy</p>
      <h2 id="b-acad">${esc(A.title.replace('échte', 'échte'))}</h2>
      <p class="b-lead">${esc(A.intro)}</p>
      <div class="bformats">${A.formats.map((f) => `<article><b>${esc(f.name)}</b><span>${esc(f.lead)}</span><p>${esc(f.desc)}</p></article>`).join('')}</div>
      <ul class="bcourses">${A.courses.map((c) => `<li><span>${esc(c.type)}</span><b>${esc(c.name)}</b><em>${c.days} dag${c.days > 1 ? 'en' : ''}</em>${book('Aanmelden', 'bcat__book', `Cursus: ${c.name}`)}</li>`).join('')}</ul>
      <p class="bnote">Inbegrepen: ${A.included.map(esc).join(' · ')}</p>
    </div>
  </div>
</section>

<section class="bsec" id="boeken" aria-labelledby="b-boek">
  <div class="bwrap">
    <div class="bhead bhead--center"><p class="b-eyebrow">Online boeken</p><h2 id="b-boek">Kies je <em>moment</em></h2><p class="b-lead">Kies links je behandeling, dan zie je direct de vrije tijden van deze en volgende weken.</p></div>
    <div data-agenda></div>
  </div>
</section>
</main>
<footer class="bfoot"><div class="bwrap"><span class="logo"></span><p>${esc(site.certified)}</p><nav>${footerLinks}<a href="#boeken">Boek online</a></nav><p class="bfoot__fine">© ${year} ${esc(site.name)} · Concept</p></div></footer>
${dataScript}
${switcher('blush')}
${scripts(['variant', 'booking'])}
</body>
</html>
`;

// ══ C · ATELIER ═══════════════════════════════════════════════════════════
const ringImgs = ['russian-volume-grijs', 'wispy-lashes', 'classic-lashes', 'volume-lashes-1', 'wispy-volume', 'volume-bruin', 'lash-brow-closeup', 'volume-lashes-2', 'lashes-brows', 'volume-lashes-3'];
let idx = 0;
const atelier = `${head('Studio Nazz · Variant C · Atelier', ['atelier', 'booking'])}
<body data-booking="chat" class="atelier">
<a class="skip" href="#main">Naar de inhoud</a>
<header class="ah" data-head>
  <a class="ah__mark" href="#top">Studio Nazz</a>
  <nav class="ah__nav" aria-label="Hoofdmenu"><a href="#index">Index</a><a href="#werk">Werk</a><a href="#academy">Academy</a><a href="#boeken">Boeken</a></nav>
</header>
<main id="main">
<section class="ahero" id="top">
  <p class="ahero__meta" data-intro><span>Aesthetics &amp; academy</span><span>Lashes · Brows · Skin</span><span>Issue N°01</span></p>
  <h1 class="ahero__title" data-intro><span>Studio</span><span>Nazz</span></h1>
  <div class="ring-wrap" aria-hidden="true"><div class="ring" data-ring>${ringImgs.map((n) => `<figure class="ring__item"><img src="${img(n)}" alt=""></figure>`).join('')}</div></div>
  <div class="ahero__foot">
    <p class="ahero__quote"><em>“${esc(site.slogan)}”</em></p>
    <p>Lashextensions, brows en huidbehandelingen met persoonlijke aandacht. Stel je vraag of boek direct via onze assistent.</p>
    ${book('Plan je afspraak →', 'a-btn')}
  </div>
</section>

<section class="asec" id="index" aria-labelledby="a-idx">
  <div class="awrap">
    <div class="acol-head"><p class="a-label">01 — Index</p><h2 id="a-idx">Behandelingen</h2></div>
    ${site.categories.map((c) => `<div class="aindex rv"><h3><span>${esc(c.name)}</span><small>${esc(c.lead)}</small></h3><ol>${c.items.map((t) => { idx++; return `<li data-img="${img(c.image)}"><span class="aindex__n">${String(idx).padStart(2, '0')}</span><b>${esc(t.name)}</b><em>${esc(desc(t.desc))}</em><span class="aindex__d">${dur(t.name)}</span>${book('Boek', 'aindex__book', t.name)}</li>`; }).join('')}</ol></div>`).join('')}
    <p class="a-small">Prijzen volgen. De duur is een indicatie.</p>
  </div>
  <img class="apreview" data-preview-img alt="" aria-hidden="true">
</section>

<section class="asec asec--ink" id="werk" aria-labelledby="a-werk">
  <div class="awrap"><div class="acol-head"><p class="a-label">02 — Portfolio</p><h2 id="a-werk">Het werk</h2></div></div>
  <ul class="astrip" tabindex="0" aria-label="Portfolio, horizontaal scrollen">${site.portfolio.map((p, i) => `<li class="${p.wide ? 'astrip__wide' : ''}"><figure><img src="${img(p.img)}" alt="${esc(p.label)} door Studio Nazz" loading="lazy"><figcaption><span>${String(i + 1).padStart(2, '0')}</span>${esc(p.label)}</figcaption></figure></li>`).join('')}</ul>
  <div class="awrap acmp">
    <div><p class="a-label">Brow tint</p><h3>Voor &amp; na</h3><p>Sleep over de foto om het verschil te zien.</p></div>
    ${compare(site.brows[0], 0)}
  </div>
</section>

<section class="asec" id="academy" aria-labelledby="a-acad">
  <div class="awrap">
    <div class="acol-head"><p class="a-label">03 — Academy</p><h2 id="a-acad">${esc(A.title)}</h2></div>
    <div class="aacad">
      <div class="aacad__text rv"><p class="a-dropcap">${esc(A.intro)} ${esc(A.sub)}</p><blockquote>“${esc(A.quote)}”</blockquote>
        <ul class="a-modules">${A.modules.map((m) => `<li><b>${esc(m.t)}</b> ${esc(m.d)}</li>`).join('')}</ul></div>
      <div class="aacad__side rv">
        ${A.formats.map((f) => `<article><p class="a-label">${esc(f.lead)}</p><h3>${esc(f.name)}</h3><p>${esc(f.desc)}</p></article>`).join('')}
        <ul class="a-courses">${A.courses.map((c) => `<li><b>${esc(c.name)}</b><span>${c.days}d</span>${book('Aanmelden', 'aindex__book', `Cursus: ${c.name}`)}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>

${P.active ? `<section class="apromo" aria-labelledby="a-promo"><div class="awrap"><p class="a-label">Actie</p><h2 id="a-promo">Bring a friend.</h2><p>${esc(P.sub)} Nieuwe klant: <b>€10 korting</b> op haar eerste volle wimperset. Jij: <b>€10 korting</b> op je volgende refill.</p>${book('Boek samen →', 'a-btn a-btn--light', 'Bring a friend: volle wimperset')}</div></section>` : ''}

<section class="asec" id="boeken" aria-labelledby="a-boek">
  <div class="awrap abook">
    <div class="abook__side">
      <p class="a-label">04 — Boeken</p><h2 id="a-boek">Plan je afspraak in een gesprek.</h2>
      <p>Onze assistent stelt je een paar korte vragen: behandeling, dag, tijd en je gegevens. Klaar in een minuut.</p>
      <figure><img src="${img('russian-volume-groot-2')}" alt="Russian volume-wimpers en brows" loading="lazy"></figure>
    </div>
    <div class="abook__chat" data-chat></div>
  </div>
</section>
</main>
<footer class="afoot"><div class="awrap"><p class="afoot__mark">Studio Nazz</p><p>${esc(site.certified)}</p><nav>${footerLinks}<a href="#boeken">Boeken</a></nav><p class="a-small">© ${year} ${esc(site.name)} · Concept</p></div></footer>
${dataScript}
${switcher('atelier')}
${scripts(['variant', 'booking'])}
</body>
</html>
`;

// ══ DASHBOARD ═════════════════════════════════════════════════════════════
const dashboard = `${head('Studio Nazz · Dashboard (preview)', ['booking', 'dashboard'])}
<body class="dsh">
<aside class="dsh__side">
  <p class="dsh__brand"><span class="logo"></span>Studio Nazz</p>
  <nav aria-label="Dashboard">${[['overzicht', 'Overzicht'], ['agenda', 'Agenda'], ['klanten', 'Klanten'], ['boekingen', 'Boekingen'], ['beschikbaarheid', 'Beschikbaarheid'], ['academy', 'Academy']].map(([k, l], i) => `<button type="button" data-tab="${k}"${i === 0 ? ' aria-current="page"' : ''}>${l}</button>`).join('')}</nav>
  <p class="dsh__demo">Preview met <b>verzonnen demo-gegevens</b>. Boekingen die je in de varianten maakt, verschijnen hier ook.</p>
</aside>
<main class="dsh__main" id="main">
  <header class="dsh__top"><div><p class="dsh__date" data-today></p><h1 data-title>Overzicht</h1></div><label class="dsh__search"><span class="sr-only">Zoek een klant</span><input type="search" placeholder="Zoek klant of telefoon…" data-search></label></header>
  <div data-view></div>
</main>
<dialog class="dsh__drawer" data-drawer aria-labelledby="drawer-title"><div data-drawer-body></div></dialog>
${dataScript}
${switcher('dashboard')}
${scripts(['dashboard'])}
</body>
</html>
`;

// ══ KEUZEPAGINA ═══════════════════════════════════════════════════════════
const kies = `${head('Studio Nazz · Kies je stijl', ['booking', 'kies'])}
<body class="kies">
<main id="main" class="kies__wrap">
  <header class="kies__head"><span class="logo"></span><p>Concept voor Studio Nazz</p><h1>Kies jouw <em>stijl</em></h1><p class="kies__lead">Drie ontwerpen met dezelfde inhoud, foto’s en branding. Elk ontwerp heeft een eigen manier van boeken. Klik op een ontwerp om het te bekijken.</p></header>
  <ul class="kies__grid">
    ${[
      ['noir', 'A', 'Noir', 'Donker en luxe, met een 3D-wimperwaaier in goud die opent als je scrollt.', 'Stappenwizard', 'Behandeling → datum &amp; tijd → gegevens → bevestigd, in een pop-up.', ['#16110e', '#b8915a', '#f7f1ea']],
      ['blush', 'B', 'Blush', 'Licht, zacht en vrouwelijk, met een 3D-stapel foto’s die meebeweegt.', 'Agenda', 'Een weekagenda op de pagina met alle vrije tijden, zoals bij een salonsysteem.', ['#fbf5f1', '#e9cfc4', '#b8915a']],
      ['atelier', 'C', 'Atelier', 'Redactioneel, als een beautymagazine, met een draaiende 3D-ring van het werk.', 'Chat-assistent', 'Een gesprek dat stap voor stap vraagt: behandeling, dag, tijd en gegevens.', ['#f2ece4', '#1b1613', '#a67c42']],
    ].map(([k, l, n, d, bn, bd, sw]) => `<li><a class="kcard kcard--${k}" href="${k}.html">
      <span class="kcard__swatch">${sw.map((c) => `<i style="background:${c}"></i>`).join('')}</span>
      <span class="kcard__l">Variant ${l}</span><b class="kcard__n">${n}</b><span class="kcard__d">${d}</span>
      <span class="kcard__bk"><small>Boekingssysteem</small><b>${bn}</b>${bd}</span>
      <span class="kcard__go">Bekijk variant ${l} →</span></a></li>`).join('')}
  </ul>
  <a class="kdash" href="dashboard.html"><span><small>Bij elk ontwerp</small><b>Dashboard voor Studio Nazz</b>Agenda, klanten, boekingen en academy-aanmeldingen op één plek.</span><span>Bekijk preview →</span></a>
</main>
${switcher('kies')}
</body>
</html>
`;

await mkdir('public/varianten', { recursive: true });
await writeFile('public/varianten/noir.html', noir);
await writeFile('public/varianten/blush.html', blush);
await writeFile('public/varianten/atelier.html', atelier);
await writeFile('public/varianten/dashboard.html', dashboard);
await writeFile('public/varianten/index.html', kies);
console.log('public/varianten/ gebouwd: index (kies), noir, blush, atelier, dashboard');
