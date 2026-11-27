// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const A = site.address;
const ig = `https://www.instagram.com/${site.instagram}/`;
const img = (n) => `/assets/img/${n}.webp`;
const pad = (n) => String(n).padStart(2, '0');
const route = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name}, ${A.street}, ${A.city}`)}`;

const I = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  cert: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m9 14-1.5 7 4.5-2.5 4.5 2.5L15 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
// woordmerk zoals op haar visitekaartje: SALON ROBINE met een penseelstreek
const logo = (cls = '') => `<span class="logo ${cls}"><svg class="logo__brush" viewBox="0 0 200 40" aria-hidden="true" preserveAspectRatio="none"><path d="M6 26C40 12 90 10 194 16c-60 4-120 6-160 16C24 34 10 32 6 26Z" fill="currentColor"/></svg><span class="logo__name">Salon Robine</span><span class="logo__sub">Nagelstyliste &amp; schoonheidsspecialiste</span></span>`;
const book = (label, cls = 'btn btn--ink') => `<a class="${cls}" href="#agenda">${I.cal}<span>${label}</span></a>`;

const ld = {
  '@context': 'https://schema.org', '@type': 'BeautySalon', name: site.name, description: `${site.role} in ${A.city}. Gellak, BIAB, nail art, dermaplaning en gezichtsbehandelingen.`,
  address: { '@type': 'PostalAddress', streetAddress: A.street, addressLocality: A.city, addressCountry: A.country },
  sameAs: [ig], url: site.booking, image: img('salon'),
  makesOffer: site.nails.prices.filter(([, p]) => /\d/.test(p)).map(([n, p]) => ({ '@type': 'Offer', name: n, price: p.replace(',', '.'), priceCurrency: 'EUR' })),
};

const head = (title) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="Salon Robine in Grave: gecertificeerde nagelstyliste en schoonheidsspecialiste. Gellak, BIAB, nail art, dermaplaning en gezichtsbehandelingen. Maak direct online een afspraak.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:title" content="Salon Robine · Nagels en huid in Grave">
<meta property="og:description" content="Gellak, BIAB, nail art en gezichtsbehandelingen aan de ${A.street} in ${A.city}.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#efe6dc">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#b49a87"/><text x="50" y="64" font-family="Georgia,serif" font-size="44" text-anchor="middle" fill="#fff">SR</text></svg>')}">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/app.js" defer></script>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>`;

const nav = `<a class="skip" href="#main">Naar de inhoud</a>
<header class="nav" data-nav>
  <a class="nav__brand" href="#top">${logo('logo--sm')}</a>
  <nav class="nav__links" aria-label="Hoofdmenu"><a href="#nagels">Nagels</a><a href="#gezicht">Gezicht</a><a href="#resultaten">Resultaten</a><a href="#salon">Salon</a></nav>
  ${book('Afspraak maken', 'btn btn--ink btn--sm nav__cta')}
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__copy">
      <p class="eyebrow">${I.pin}${A.city} · ${I.cert}Gecertificeerd</p>
      <h1 class="hero__title"><span class="ln"><span>Nagels en huid,</span></span> <span class="ln"><span><em>met aandacht</em> verzorgd.</span></span></h1>
      <p class="hero__lead">${site.role} in ${A.city}. Gellak, BIAB en nail art, dermaplaning en gezichtsbehandelingen, in een rustige salon aan de ${A.street}.</p>
      <div class="hero__actions">${book('Maak direct een afspraak', 'btn btn--ink magnetic')}<a class="btn btn--line magnetic" href="#nagels"><span>Bekijk behandelingen</span></a></div>
    </div>
    <div class="stage" aria-hidden="true">
      <div class="stage__world" data-world>
        <div class="arch"><img src="${img('salon')}" alt=""><span class="arch__logo">${logo()}</span></div>
        <div class="ring" data-ring>${site.ring.map((n, i) => `<figure class="card" style="--i:${i};--n:${site.ring.length}"><img src="${img(n)}" alt=""></figure>`).join('')}</div>
      </div>
      <span class="stage__floor"></span>
    </div>
  </div>
</section>`;

const marquee = `<div class="marquee"><p class="sr-only">Gellak · BIAB · Nail art · Dermaplaning · Gezichtsbehandelingen · Grave</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${['Gellak', 'BIAB', 'French', 'Nail art', 'Dermaplaning', 'Gezichtsbehandeling', 'Grave'].map((t) => `${t}<i></i>`).join('')}</span>`).join('')}</div></div>`;

const nails = `<section class="section nails" id="nagels" aria-labelledby="n-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Nagels</p><h2 class="title" id="n-h">Handen die je <em>graag laat zien.</em></h2></div><p class="lead">${site.nails.intro}</p></div>
    <div class="nails__grid">
      <ol class="types">${site.nails.types.map((t, i) => `<li class="type reveal" style="--d:${i * 0.08}s"><span>${pad(i + 1)}</span><h3>${t.t}</h3><p>${t.d}</p></li>`).join('')}</ol>
      <div class="menu reveal tilt"><p class="menu__script">Salon Robine</p><h3>Prijslijst</h3><p class="menu__sub">Nagelbehandelingen handen</p>
        <ul>${site.nails.prices.map(([n, p]) => `<li><span>${n}</span><i></i><b>${/\d/.test(p) ? `€${p}` : p}</b></li>`).join('')}</ul>
        ${book('Plan je nagels', 'btn btn--ink btn--sm')}</div>
    </div>
  </div>
</section>`;

const face = `<section class="section face" id="gezicht" aria-labelledby="f-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Gezicht</p><h2 class="title" id="f-h">Een huid die <em>weer straalt.</em></h2></div><p class="lead">Als schoonheidsspecialiste kijkt Robine eerst naar jouw huid. De prijs en duur van elke gezichtsbehandeling zie je direct in de agenda.</p></div>
    <div class="ba reveal">
      <div class="ba__frame" data-ba style="--x:50%"><img src="${img('derma-na')}" alt="Na dermaplaning: gladde, egale huid" loading="lazy"><div class="ba__voor"><img src="${img('derma-voor')}" alt="Voor dermaplaning: donshaartjes en een doffe huid" loading="lazy"></div>
        <span class="ba__lbl ba__lbl--l">Voor</span><span class="ba__lbl ba__lbl--r">Na</span><span class="ba__handle"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7-5 5 5 5M15 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Vergelijk voor en na dermaplaning"></div>
      <div class="ba__copy"><p class="eyebrow">Resultaat · dermaplaning</p><h3>Zachter, gladder, egaler.</h3><p>Na één behandeling zijn donshaartjes en dode huidcellen weg. Sleep de lijn om het verschil te zien.</p>
        <figure class="ba__pad"><img src="${img('dermaplaning-pad')}" alt="Op een wattenschijfje: weggehaalde donshaartjes en dode huidcellen" loading="lazy"><figcaption>Dit komt eraf: donshaar en dode huidcellen.</figcaption></figure></div>
    </div>
    <ul class="ftreat">${site.face.map((f, i) => `<li class="fcard reveal tilt" id="${f.id}" style="--d:${i * 0.08}s"><figure><img src="${img(f.img)}" alt="" loading="lazy"></figure><div><h3>${f.t}</h3><p>${f.d}</p>${f.id === 'verzorging' ? '' : book('Bekijk in de agenda', 'link')}</div></li>`).join('')}</ul>
  </div>
</section>`;

const filters = [['alle', 'Alles'], ['nude', 'Nude & French'], ['kleur', 'Kleur'], ['art', 'Nail art'], ['glitter', 'Glitter & chrome']];
const gallery = `<section class="section results" id="resultaten" aria-labelledby="r-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Resultaten</p><h2 class="title" id="r-h">Uit de salon <em>in Grave.</em></h2></div>
      <div class="filters" role="group" aria-label="Filter resultaten">${filters.map(([k, l], i) => `<button class="chip" type="button" data-f="${k}" aria-pressed="${!i}">${l}</button>`).join('')}</div></div>
    <ul class="masonry" data-masonry>${site.gallery.map((g, i) => `<li class="reveal" data-cat="${g.cat}" style="--d:${(i % 4) * 0.05}s"><button class="shot tilt" type="button" data-zoom="${img(g.img)}" data-label="${esc(g.label)}"><img src="${img(g.img)}" alt="${esc(g.label)}" loading="lazy"><span>${esc(g.label)}</span></button></li>`).join('')}</ul>
    <p class="results__more"><a class="link" href="${ig}" target="_blank" rel="noopener">${I.ig}Meer op Instagram @${site.instagram}</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lb-img><figcaption data-lb-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lb-prev aria-label="Vorige">${I.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lb-next aria-label="Volgende">${I.arrow}</button>
  <button class="lightbox__close" type="button" data-lb-close aria-label="Sluiten">${I.close}</button>
</dialog>`;

const salon = `<section class="section salon" id="salon" aria-labelledby="s-h">
  <div class="wrap salon__grid">
    <div class="salon__photos" data-photos>
      <figure class="ph ph--1"><img src="${img('salon')}" alt="De behandelruimte van Salon Robine met nageltafel en behandelstoel" loading="lazy"></figure>
      <figure class="ph ph--2"><img src="${img('pand')}" alt="Het pand aan de ${A.street} in ${A.city}" loading="lazy"></figure>
      <figure class="ph ph--3"><img src="${img('salon-hoek')}" alt="Wandplanken met sieraden en verzorging in de salon" loading="lazy"></figure>
    </div>
    <div class="salon__copy">
      <p class="eyebrow">De salon</p>
      <h2 class="title" id="s-h">Welkom <em>in Grave.</em></h2>
      <p class="lead">Een lichte, rustige salon met warme tinten, een eigen nageltafel en een comfortabele behandelstoel. Hier neem je even de tijd voor jezelf.</p>
      <address class="addr"><span class="addr__pin">${I.pin}</span><span><b>${site.name}</b><br>${A.street}<br>${A.city}</span></address>
      <div class="salon__actions"><a class="btn btn--line" href="${route}" target="_blank" rel="noopener">${I.pin}<span>Plan je route</span></a>${book('Afspraak maken')}</div>
      <div class="gift"><img src="${img('cadeaubon')}" alt="Cadeaubon en visitekaartje van Salon Robine" loading="lazy"><div><h3>Cadeaubon</h3><p>Geef iemand een behandeling cadeau. De cadeaubon is na uitgifte 2 jaar geldig. Vraag ernaar in de salon.</p></div></div>
    </div>
  </div>
</section>`;

const agenda = `<section class="section agenda" id="agenda" aria-labelledby="a-h">
  <div class="wrap agenda__grid">
    <div class="agenda__side">
      <p class="eyebrow">Afspraak maken</p>
      <h2 class="title" id="a-h">Kies je moment, <em>meteen.</em></h2>
      <p class="lead">De agenda van Salon Robine staat hier direct in de site. Kies je behandeling en een vrij moment. Geen berichtjes heen en weer.</p>
      <ol class="asteps">${['Kies je behandeling', 'Kies een dag en tijd die vrij is', 'Vul je gegevens in en bevestig'].map((s, i) => `<li><span>${i + 1}</span>${s}</li>`).join('')}</ol>
      <a class="link" href="${site.booking}" target="_blank" rel="noopener">${I.ext}Agenda openen in een nieuw venster</a>
    </div>
    <div class="browser" data-agenda data-src="${site.booking}" data-widget="${site.salonizedWidgetId}">
      <div class="browser__bar"><i></i><i></i><i></i><span>salon-robine.salonized.com</span></div>
      <div class="browser__body">
        <div class="browser__wait" data-wait>${logo()}<p>De agenda wordt geladen…</p><a class="btn btn--ink btn--sm" href="${site.booking}" target="_blank" rel="noopener">${I.cal}<span>Of open de agenda</span></a></div>
      </div>
      <p class="browser__foot"><span>Zie je de agenda niet?</span><a class="link" href="${site.booking}" target="_blank" rel="noopener">${I.ext}Open de agenda in een nieuw venster</a></p>
    </div>
  </div>
</section>`;

const footer = `<footer class="foot">
  <div class="wrap foot__in">
    ${logo()}
    <p>${A.street} · ${A.city}</p>
    <nav aria-label="Footer"><a href="${site.booking}" target="_blank" rel="noopener">Online afspraak</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a><a href="${route}" target="_blank" rel="noopener">Route</a><a href="#nagels">Prijzen</a></nav>
    <p class="foot__fine">© ${new Date().getFullYear()} ${site.name} · Concept · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="#agenda">${I.cal}<span>Afspraak maken</span></a>`;

const index = `${head(`${site.name} · ${site.role} in ${A.city}`)}
<body>
${nav}
<main id="main">
${hero}
${marquee}
${nails}
${face}
${gallery}
${salon}
${agenda}
</main>
${footer}
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', `${head('Pagina niet gevonden')}<body><main class="lost">${logo()}<h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--ink" href="/"><span>Naar de homepage</span></a></main></body></html>\n`);
await writeFile('public/robots.txt', site.draft ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''}`);
