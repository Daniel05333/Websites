// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ig = `https://www.instagram.com/${site.contact.instagram}/`;
const year = new Date().getFullYear();
const price = (p) => (isTodo(p) ? '<span class="price price--todo" title="Prijs nog in te vullen">prijs volgt</span>' : `<span class="price">${esc(p)}</span>`);
const dur = (m) => (m >= 60 ? `± ${Math.floor(m / 60)} uur${m % 60 ? ` ${m % 60} min` : ''}` : `± ${m} min`);

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7v9H4z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3 10h18M7 15h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M14 3v5h5M10 13h6M10 17h6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
};
const book = (label, cls = 'btn btn--dark', pre = '') => `<button class="${cls}" type="button" data-book${pre ? ` data-pre="${esc(pre)}"` : ''}><span>${label}</span>${icon.arrow}</button>`;
const logo = (cls = '') => `<img class="logo-badge ${cls}" src="/assets/img/logo.png" alt="Yourlashes.nl by Estella" width="360" height="360">`;
const todoBox = (v, hint) => `<div class="todo-box"><p class="todo-box__tag">In te vullen</p><p>${esc(v.todo)}</p><small>${hint}</small></div>`;

// gegevens voor het boekingssysteem (assets/js/booking.js)
const data = {
  brand: site.name, key: 'yourlashes', dashboard: null,
  categories: site.prices.map((c) => ({ name: c.cat, items: c.items.map((i) => ({ name: i.name, desc: i.label, min: i.min, price: i.price })) })),
  courses: [], promo: false, policy: true,
};

const head = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${site.name} · Lashes &amp; lashlifts in ${site.city}</title>
<meta name="description" content="Yourlashes by Estella: wimperextensions en lashlifts, home based in Enschede. Bekijk het werk, de prijzen en boek direct online een afspraak.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="theme-color" content="#3a2f29">
<meta property="og:title" content="${site.name} · ${site.city}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<link rel="icon" href="/assets/img/logo.png" type="image/png">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/booking.css">
<script src="/assets/js/main.js" defer></script>
<script src="/assets/js/booking.js" defer></script>
</head>
<body data-booking="wizard">`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="#top" aria-label="Yourlashes, naar boven">${logo()}<span>Yourlashes</span></a>
  <nav class="masthead__nav" aria-label="Hoofdmenu"><a href="#werk">Werk</a><a href="#prijzen">Prijzen</a><a href="#aftercare">Aftercare</a><a href="#info">Info</a></nav>
  ${book('Boek nu', 'btn btn--sm btn--light masthead__cta')}
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__glow"></span></div>
    <canvas class="hero__canvas" data-fan="home" aria-hidden="true"></canvas>
    <div class="hero__copy">
      <p class="eyebrow">${icon.pin}${site.city} · ${site.region} · Home based</p>
      <h1 class="hero__title"><span class="line"><span>Lashes</span></span> <span class="line"><em>made for you.</em></span></h1>
      <p class="hero__lead">Wimperextensions en lashlifts ${site.by}, nieuwe set vanaf €45. Kies je behandeling en boek direct een vrij moment, zonder eerst te DM’en.</p>
      <div class="hero__actions">${book('Boek je afspraak', 'btn btn--light magnetic')}<a class="btn btn--ghost magnetic" href="#prijzen"><span>Bekijk prijzen</span></a></div>
    </div>
  </div>
</section>`;

const mItems = ['Volume', 'Hybrid', 'Wet set', 'One by one', 'Lashlift', 'Vanaf €35', 'Home based', 'Enschede'];
const marquee = `<div class="marquee"><p class="sr-only">${mItems.join(' · ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${mItems.map((t) => `${t}<i>◇</i>`).join('')}</span>`).join('')}</div></div>`;

const work = `<section class="section work" id="werk" aria-labelledby="werk-titel">
  <div class="wrap">
    <div class="section__head section__head--split"><div><p class="eyebrow">Resultaten</p><h2 class="title" id="werk-titel">Mijn <em>werk.</em></h2></div><div class="filters" role="group" aria-label="Filter op behandeling">${[['alle', 'Alles'], ['lashes', 'Lashes'], ['lashlift', 'Lashlift']].map(([k, l], i) => `<button class="filter" type="button" data-filter="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div></div>
    <ul class="grid" data-grid>
      ${site.work.map((w, i) => `<li class="card reveal" data-cat="${w.cat}" style="--d:${(i % 3) * 0.06}s"><button class="card__btn tilt" type="button" data-zoom="/assets/img/${w.img}.webp" data-label="${esc(w.label)}" aria-label="Vergroot: ${esc(w.label)}"><img src="/assets/img/${w.img}.webp" alt="${esc(w.label)} door Yourlashes" loading="${i < 6 ? 'eager' : 'lazy'}"><span class="card__label">${esc(w.label)}</span><span class="card__shine" aria-hidden="true"></span></button></li>`).join('\n      ')}
    </ul>
    <p class="work__more"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}Meer op Instagram @${site.contact.instagram}</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lightbox-img><figcaption data-lightbox-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Vorige">${icon.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Volgende">${icon.arrow}</button>
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Sluiten">${icon.close}</button>
</dialog>`;

const prices = `<section class="section prices" id="prijzen" aria-labelledby="prijzen-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Prijslijst</p><h2 class="title" id="prijzen-titel">Kies je <em>set.</em></h2><p class="section__lead">Lashes by Estella. Refill = je set opvullen na 2 of 3 weken.</p></div>
    <div class="price-cols">
      ${site.prices.map((c, ci) => `<section class="pcol reveal" style="--d:${(ci % 3) * 0.07}s" aria-labelledby="pc-${ci}"><h3 id="pc-${ci}">${esc(c.cat)}</h3><p class="pcol__lead">${esc(c.lead)}</p><ul>${c.items.map((t) => `<li><div><b>${esc(t.label)}</b><small>${dur(t.min)}</small></div>${price(t.price)}${book('Boek', 'pcol__book', t.name)}</li>`).join('')}</ul></section>`).join('\n      ')}
    </div>
    <p class="prices__note">De duur is een indicatie.</p>
  </div>
</section>`;

const aftercare = `<section class="section care" id="aftercare" aria-labelledby="care-titel">
  <div class="wrap care__grid">
    <div class="care__list reveal">
      <p class="eyebrow">Aftercare</p>
      <h2 class="title" id="care-titel">Zo blijven je lashes <em>mooi.</em></h2>
      <ol>${site.aftercare.map((a, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(a)}</li>`).join('')}</ol>
    </div>
    <article class="product tilt reveal" style="--d:.1s">
      <figure><img src="/assets/img/lashfoam.webp" alt="Lashfoam, conditioning lash shampoo" loading="lazy"></figure>
      <div><p class="eyebrow">Ook verkrijgbaar</p><h3>${esc(site.product.name)} <span>${esc(site.product.price)}</span></h3><p>${esc(site.product.desc)}</p></div>
    </article>
  </div>
</section>`;

const info = `<section class="section info" id="info" aria-labelledby="info-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Goed om te weten</p><h2 class="title" id="info-titel">Betalen &amp; <em>house policy.</em></h2></div>
    <div class="info-grid">
      <article class="icard reveal"><span class="icard__icon">${icon.card}</span><h3>Betalen</h3>${isTodo(site.payments) ? todoBox(site.payments, 'Uit de highlight “Payments”.') : `<p>${esc(site.payments)}</p>`}</article>
      <article class="icard reveal" style="--d:.08s"><span class="icard__icon">${icon.doc}</span><h3>House policy</h3>${isTodo(site.policy) ? todoBox(site.policy, 'Uit de highlight “Housepolicy”. Klanten vinken bij het boeken aan dat ze die gelezen hebben.') : `<p>${esc(site.policy)}</p>`}</article>
      <article class="icard reveal" style="--d:.16s"><span class="icard__icon">${icon.home}</span><h3>Home based</h3><p>Yourlashes werkt vanuit huis in ${site.city}. Het exacte adres krijg je bij de bevestiging van je afspraak.</p></article>
    </div>
  </div>
</section>`;

const steps = `<section class="section steps" aria-labelledby="stappen-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Zo werkt het</p><h2 class="title" id="stappen-titel">Boeken in <em>één minuut.</em></h2></div>
    <ol class="steps__row" data-steps>${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('')}</ol>
  </div>
</section>`;

const cta = `<section class="cta" aria-labelledby="cta-titel">
  <div class="wrap cta__inner">${logo('logo-badge--big')}
    <h2 class="title" id="cta-titel">Klaar voor <em>your lashes?</em></h2>
    <p class="section__lead">Kies je behandeling, dag en tijd. Je afspraak staat direct in de agenda.</p>
    ${book('Boek je afspraak', 'btn btn--light magnetic')}
  </div>
</section>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    ${logo()}
    <p>Lashes | Lashlifts · ${site.by}<br>${site.city}, ${site.region} · Home based</p>
    <nav aria-label="Footer"><a href="#prijzen">Prijzen</a><a href="#info">House policy</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a></nav>
    <p class="footer__fine">© ${year} Yourlashes · Concept · Geen cookies, geen trackers.</p>
  </div>
</footer>
<button class="dock" type="button" data-book data-dock>${icon.cal}<span>Boek nu</span></button>
<script type="application/json" id="nazz-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const index = `${head}
${header}
<main id="main">
${hero}
${marquee}
${work}
${prices}
${aftercare}
${info}
${steps}
${cta}
</main>
${footer}
</body>
</html>
`;
const notFound = `${head}<main id="main" class="lost">${logo('logo-badge--big')}<h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--dark" href="/"><span>Naar de homepage</span>${icon.arrow}</a></main></body></html>\n`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', notFound);
await writeFile('public/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log('public/ gebouwd (concept: noindex)');
