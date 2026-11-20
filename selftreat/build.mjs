// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ig = `https://www.instagram.com/${site.contact.instagram}/`;
const year = new Date().getFullYear();
const prov = Object.fromEntries(site.provinces.map((p) => [p.id, p]));
const cat = Object.fromEntries(site.categories.map((c) => [c.id, c]));
const allTreatments = [...new Set(site.categories.flatMap((c) => c.items))];
const salonTitle = (s) => `${s.type} in ${s.city}`;

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7v9H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>',
};

const logo = `<span class="brand"><span class="brand__mark" aria-hidden="true"><i class="logo"></i></span><span class="brand__word">selftreat</span></span>`;
const media = (img, cls = '', alt = '') => img
  ? `<img class="${cls}" src="/assets/img/${img}.webp" alt="${esc(alt)}" width="392" height="526" loading="lazy">`
  : `<span class="${cls} ph" aria-hidden="true"></span>`;

const head = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Selftreat · Vind de beste beauty experts bij jou in de buurt</title>
<meta name="description" content="Vind en boek de beste beauty experts bij jou in de buurt of aan huis. Hair, nails, lashes, skin, body en meer, per provincie.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="theme-color" content="#f6f3fb">
<meta property="og:title" content="Selftreat · beauty experts bij jou in de buurt">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/main.js" defer></script>
</head>
<body>`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="draft-note" role="note">Concept · de salons op deze pagina zijn voorbeelden</div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="#top" aria-label="Selftreat, naar boven">${logo}</a>
  <nav class="masthead__nav" aria-label="Hoofdmenu">
    <a href="#behandelingen">Behandelingen</a>
    <a href="#provincies">Provincies</a>
    <a href="#salons">Salons</a>
    <a href="#voor-salons">Voor salons</a>
  </nav>
  <a class="btn btn--sm btn--ink masthead__cta" href="#salons"><span>Boek nu</span>${icon.arrow}</a>
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <canvas class="hero__canvas" data-blobs aria-hidden="true"></canvas>
    <div class="hero__fallback" aria-hidden="true"><b></b><b></b><b></b></div>
    <div class="hero__copy wrap">
      <p class="eyebrow">${icon.spark}Hair · Nails · Injectables · en meer</p>
      <h1 class="hero__title"><span class="line"><span>Vind jouw</span></span> <span class="line"><em>selftreat</em></span> <span class="line"><span>moment.</span></span></h1>
      <p class="hero__lead">De beste beauty experts bij jou in de buurt of aan huis. Zoek per provincie en behandeling, en boek in een paar klikken.</p>
      <form class="search" data-search role="search" aria-label="Zoek beauty experts">
        <label class="search__field"><span>Behandeling</span>
          <select name="t"><option value="">Alle behandelingen</option>${site.categories.map((c) => `<optgroup label="${esc(c.name)}">${c.items.map((i) => `<option>${esc(i)}</option>`).join('')}</optgroup>`).join('')}</select>
        </label>
        <label class="search__field"><span>Provincie</span>
          <select name="p"><option value="">Heel Nederland</option>${site.provinces.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
        </label>
        <label class="search__home"><input type="checkbox" name="h"><span>${icon.home}Aan huis</span></label>
        <button class="btn btn--ink search__go" type="submit">${icon.search}<span>Zoek experts</span></button>
      </form>
    </div>
  </div>
</section>`;

const marquee = `<div class="marquee"><p class="sr-only">Populair: ${site.popular.join(', ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${site.popular.map((t) => `${esc(t)}<i>${icon.spark}</i>`).join('')}</span>`).join('')}</div></div>`;

const categories = `<section class="section cats" id="behandelingen" aria-labelledby="cats-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div><p class="eyebrow">Behandelingen</p><h2 class="title" id="cats-titel">Waar heb jij <em>zin in?</em></h2></div>
      <p class="section__lead">Van een frisse knipbeurt tot een hydratatie boost. Kies een categorie en zie welke experts het aanbieden.</p>
    </div>
    <ul class="cat-grid">
      ${site.categories.map((c, i) => `<li class="reveal" style="--d:${(i % 4) * 0.06}s"><button class="cat tilt" type="button" data-cat="${c.id}">
        ${media(c.img, 'cat__img')}
        <span class="cat__body"><b>${esc(c.name)}</b><small>${esc(c.items.slice(0, 3).join(' · '))}</small></span>
      </button></li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const provinces = `<section class="section provs" id="provincies" aria-labelledby="provs-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow">Provincies</p>
      <h2 class="title" id="provs-titel">Bij jou <em>in de buurt.</em></h2>
    </div>
    <ul class="prov-list">
      ${site.provinces.map((p, i) => {
        const n = site.salons.filter((s) => s.prov === p.id).length;
        return `<li class="reveal" style="--d:${(i % 6) * 0.05}s"><button class="prov prov--${p.color}" type="button" data-prov="${p.id}"><span class="prov__dot">${p.code}</span><span class="prov__name">${esc(p.name)}</span><small>${n ? `${n} ${n === 1 ? 'salon' : 'salons'}` : 'binnenkort'}</small></button></li>`;
      }).join('\n      ')}
    </ul>
  </div>
</section>`;

const salonCard = (s, i) => `<li class="salon reveal" style="--d:${(i % 3) * 0.06}s" data-salon="${s.id}" data-prov="${s.prov}" data-cats="${s.cats.join(' ')}" data-treat="${esc(s.treatments.join('|'))}" data-home="${s.home ? 1 : 0}">
  <button class="salon__btn tilt" type="button" data-open="${s.id}">
    <span class="salon__media">${media(s.img[0], 'salon__img')}<span class="badge">Voorbeeld</span>${s.home ? `<span class="badge badge--home">${icon.home}Aan huis</span>` : ''}</span>
    <span class="salon__body">
      <span class="salon__meta">${icon.pin}${esc(s.city)} · ${esc(prov[s.prov].name)}</span>
      <b class="salon__name">${esc(salonTitle(s))}</b>
      <span class="salon__tags">${s.treatments.slice(0, 3).map((t) => `<i>${esc(t)}</i>`).join('')}</span>
      <span class="salon__cta">Bekijk &amp; boek ${icon.arrow}</span>
    </span>
  </button>
</li>`;

const salons = `<section class="section salons" id="salons" aria-labelledby="salons-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div><p class="eyebrow">Salons</p><h2 class="title" id="salons-titel">Aangesloten <em>experts.</em></h2></div>
      <div class="results__bar"><p class="results__count" data-count aria-live="polite">${site.salons.length} salons</p><div class="active" data-active></div></div>
    </div>
    <ul class="salon-grid" data-grid>
      ${site.salons.map(salonCard).join('\n      ')}
    </ul>
    <div class="empty" data-empty hidden>
      <p class="empty__title">Nog geen expert gevonden voor deze zoekopdracht.</p>
      <p>Selftreat groeit elke week. Probeer een andere provincie, of volg ons op Instagram voor nieuwe salons.</p>
      <button class="btn btn--line" type="button" data-reset>Alle salons tonen</button>
    </div>
  </div>
</section>`;

const steps = `<section class="section how" aria-labelledby="how-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Zo werkt het</p><h2 class="title" id="how-titel">In drie stappen <em>naar je moment.</em></h2></div>
    <ol class="how__row">
      ${[['Zoek', 'Kies een behandeling en provincie, of laat een expert bij jou aan huis komen.'], ['Kies', 'Bekijk de pagina van de salon: foto’s, behandelingen en wat bij jou past.'], ['Boek & geniet', 'Kies een dag en tijd en boek je selftreat moment. Ook op mobiel.']].map(([t, d], i) => `<li class="how__step reveal" style="--d:${i * 0.1}s"><span class="how__n how__n--${['mint', 'lilac', 'pink'][i]}">${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const forSalons = `<section class="section join" id="voor-salons" aria-labelledby="join-titel">
  <div class="wrap join__grid">
    <figure class="join__photo reveal"><img src="/assets/img/nieuwe-locatie.webp" alt="Nieuwe locatie: jouw salon op Selftreat" width="392" height="526" loading="lazy"></figure>
    <div>
      <p class="eyebrow">Voor salons</p>
      <h2 class="title" id="join-titel">Jouw salon <em>op Selftreat?</em></h2>
      <p class="section__lead">Kappers, spa’s, masseurs, PMU artists en nagelstylisten door heel Nederland sluiten zich aan. Krijg je eigen pagina met foto’s en behandelingen, en laat nieuwe klanten je vinden.</p>
      <ul class="joined" aria-label="Recent aangesloten">
        ${[['Kapper', 'Eindhoven'], ['Spa', 'Drenthe'], ['Masseur', 'Apeldoorn'], ['PMU artist', 'Den Haag'], ['Nagelstylist', 'Leiden']].map(([t, c]) => `<li>${icon.check}<b>${t}</b>${c}</li>`).join('')}
      </ul>
      <a class="btn btn--ink" href="${ig}" target="_blank" rel="noopener">${icon.ig}<span>Sluit je salon aan</span></a>
    </div>
  </div>
</section>`;

const dialog = `<dialog class="sheet" data-sheet aria-labelledby="sheet-title">
  <div class="sheet__inner">
    <button class="sheet__close" type="button" data-close aria-label="Sluiten">${icon.close}</button>
    <div class="sheet__gallery" data-gallery></div>
    <div class="sheet__body">
      <p class="sheet__meta" data-meta></p>
      <h2 class="sheet__title" id="sheet-title" data-title></h2>
      <p class="sheet__note">Voorbeeldpagina. Zo ziet de pagina van een aangesloten salon eruit.</p>
      <form class="book" data-book novalidate>
        <fieldset><legend><span>1</span>Kies je behandeling</legend><div class="opts" data-treatments></div></fieldset>
        <fieldset><legend><span>2</span>Kies een dag</legend><div class="opts opts--days" data-days></div></fieldset>
        <fieldset><legend><span>3</span>Kies een tijd</legend><div class="opts opts--times" data-times></div></fieldset>
        <label class="field"><span>Je naam</span><input name="name" autocomplete="name" required></label>
        <p class="book__error" data-error role="alert"></p>
        <button class="btn btn--ink btn--block" type="submit"><span>Boek mijn selftreat moment</span>${icon.arrow}</button>
      </form>
      <div class="done" data-done hidden tabindex="-1">
        <span class="done__icon">${icon.check}</span>
        <h3>Zo ziet je boeking eruit</h3>
        <p data-summary></p>
        <p class="done__fine">Dit is een concept: er is niets geboekt. In de live versie komt je afspraak direct in de agenda van de salon en krijg je een bevestiging per e-mail.</p>
      </div>
    </div>
  </div>
</dialog>
<script type="application/json" id="salons-data">${JSON.stringify(site.salons.map((s) => ({ id: s.id, title: salonTitle(s), meta: `${s.city} · ${prov[s.prov].name}${s.home ? ' · ook aan huis' : ''}`, img: s.img, treatments: s.treatments, cats: s.cats.map((c) => cat[c].name) })))}</script>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    ${logo}
    <p>Vind de beste beauty experts bij jou in de buurt of aan huis.</p>
    <nav aria-label="Footer"><a href="#behandelingen">Behandelingen</a><a href="#provincies">Provincies</a><a href="#voor-salons">Voor salons</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a></nav>
    <p class="footer__fine">© ${year} ${site.domain} · Geen cookies, geen trackers.</p>
  </div>
</footer>`;

const index = `${head}
${header}
<main id="main">
${hero}
${marquee}
${categories}
${provinces}
${salons}
${steps}
${forSalons}
</main>
${footer}
${dialog}
</body>
</html>
`;

const notFound = `${head}
<main id="main" class="lost">${logo}<h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--ink" href="/"><span>Naar de homepage</span>${icon.arrow}</a></main>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', notFound);
await writeFile('public/robots.txt', site.draft ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''} · ${allTreatments.length} behandelingen, ${site.salons.length} voorbeeldsalons`);
