// Bouwt ./public uit src/site.mjs en assets/. Gebruik: node build.mjs
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { site, isTodo } from './src/site.mjs';

const OUT = new URL('./public/', import.meta.url).pathname;

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const has = (v) => v != null && v !== '' && !isTodo(v);
const v = (x) => (isTodo(x) ? `<span class="ph" title="Placeholder — nog te bevestigen">te bevestigen: ${esc(x.label)}</span>` : esc(x));
const plain = (x, fallback = '') => (has(x) ? String(x) : fallback);
const img = (name, alt, w, h, { eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="/assets/img/${name}.webp" width="${w}" height="${h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
const arrow = `<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h17M12.5.5 17 5l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
const btn = (href, label, cls = 'btn', attrs = '') => `<a class="${cls}" href="${href}"${attrs}><span>${label}</span>${arrow}</a>`;
/** Kop die regel voor regel uit een masker schuift; de tekst blijft één element. */
const lines = (...ls) => ls.map((l, i) => `<span class="ln"><span style="--i:${i}">${l}</span></span>`).join(' ');
const eyebrow = (nr, label) => `<p class="eyebrow reveal"><span>${nr}</span><i aria-hidden="true"></i>${label}</p>`;

const c = site.contact;
const l = site.location;
const year = new Date().getFullYear();
const minPrice = Math.min(...site.services.filter((s) => !s.addOn).map((s) => s.price));
const knippen = site.services.find((s) => s.id === 'knippen');
const igLink = (label = `@${c.handle}`) => `<a href="${esc(c.instagram)}" target="_blank" rel="noopener">${label}<span class="sr-only"> (opent Instagram)</span></a>`;
const tel = (label = c.phone, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(c.phoneHref)}">${label}</a>`;
const bookHref = site.booking.url ?? '#afspraak';
const bookAttrs = site.booking.url ? ' rel="noopener"' : '';

const icons = {
  scissors: '<circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M9 15 19 3M15 15 5 3"/>',
  combo: '<circle cx="6" cy="18" r="2.5"/><circle cx="13" cy="18" r="2.5"/><path d="M7.5 16 16 4M11.5 16 3 4"/><path d="M17 9c0 6 2 10 4 11"/>',
  kid: '<circle cx="12" cy="8" r="4.5"/><path d="M4 21c1-4.5 4.5-7 8-7s7 2.5 8 7"/>',
  beard: '<path d="M5 6c0 9 3 15 7 15s7-6 7-15"/><path d="M8 12c1.5 1 6.5 1 8 0M9.5 16h5"/>',
  drop: '<path d="M12 3c4 5 6 8.5 6 11.5a6 6 0 0 1-12 0C6 11.5 8 8 12 3z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
};
const icon = (k) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${icons[k]}</svg>`;

const nav = [['#cuts', 'Cuts'], ['#prijzen', 'Prijzen'], ['#de-zaak', 'De zaak'], ['#langskomen', 'Openingstijden'], ['#contact', 'Contact']];

// ── layout ─────────────────────────────────────────────────────────────────
const head = ({ title, description, path }) => {
  const base = plain(site.url);
  const canonical = base ? `${base}${path}` : null;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n` : ''}<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${base ? `<meta property="og:image" content="${esc(base)}/assets/img/og-image.jpg">\n` : ''}<meta name="theme-color" content="#0b0b0c">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/big-shoulders.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
${jsonLd()}
<script>document.documentElement.classList.add('js')</script>
<script src="/assets/js/main.js" defer></script>
</head>`;
};

/** Structured data: alleen bevestigde velden, en niets zolang de site een concept is. */
function jsonLd() {
  if (site.draft) return '';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BarberShop', name: site.name, url: plain(site.url) || undefined,
    telephone: c.phone, image: plain(site.url) ? `${site.url}/assets/img/og-image.jpg` : undefined,
    address: { '@type': 'PostalAddress', streetAddress: l.street, postalCode: l.postalCode, addressLocality: l.city, addressCountry: l.country },
    hasMap: l.mapsUrl, sameAs: [c.instagram], priceRange: `€${minPrice}–€${Math.max(...site.services.map((s) => s.price))}`,
    openingHoursSpecification: site.hours.filter((h) => h.open).map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: days[h.d], opens: h.open[0], closes: h.open[1] })),
  })}</script>`;
}

const logo = (size = 52, cls = 'badge') => `<img class="${cls}" src="/assets/img/logo-256.webp" width="${size}" height="${size}" alt="">`;

const header = () => `
<a class="skip" href="#main">Naar de inhoud</a>
${site.draft ? `<div class="draftbar" role="note"><span>Ontwikkelversie — gemarkeerde gegevens zijn placeholders en moeten nog door de zaak worden bevestigd.</span><button type="button" onclick="this.parentNode.remove()"><span aria-hidden="true">×</span><span class="sr-only">Melding sluiten</span></button></div>` : ''}
<header class="masthead" data-masthead>
  <a class="brand" href="/#top">${logo(48)}<span class="brand__name">Moso<small>Barbershop</small></span><span class="sr-only"> — naar boven</span></a>
  <nav class="nav" aria-label="Hoofdmenu"><ul>${nav.map(([h, t], i) => `<li><a href="/${h}"><small>0${i + 1}</small>${t}</a></li>`).join('')}</ul></nav>
  ${btn(bookHref, 'Afspraak maken', 'btn btn--sm', bookAttrs + ' data-magnetic')}
  <button class="burger" type="button" aria-expanded="false" aria-controls="sheet"><span class="sr-only">Menu openen</span><i></i><i></i></button>
</header>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="sheet__top">${logo(48)}<button class="sheet__close" type="button"><span class="sr-only">Menu sluiten</span><i></i><i></i></button></div>
  <nav aria-label="Menu mobiel"><ol>${[...nav, ['#afspraak', 'Afspraak maken']].map(([h, t], i) => `<li style="--i:${i}"><a href="/${h}"><small>0${i + 1}</small>${t}</a></li>`).join('')}</ol></nav>
  <div class="sheet__foot">${tel(`Bel ${esc(c.phone)}`, 'btn btn--block btn--ghost')}<p>${esc(l.street)} · ${esc(l.city)}</p></div>
</div>`;

const hoursTable = (cls = 'hours') => `<table class="${cls}" data-hours><caption class="sr-only">Openingstijden</caption><tbody>
  ${site.hours.map((h) => `<tr data-day="${h.d}"><th scope="row">${h.day}</th><td>${h.open ? `${h.open[0].replace(/^0/, '')} – ${h.open[1]}` : 'Gesloten'}</td></tr>`).join('')}
</tbody></table>`;

const footer = () => `
<footer class="footer" id="contact">
  <div class="footer__brand">${logo(120, 'badge badge--xl')}<p class="footer__tag">${site.focus.join(' · ')}</p></div>
  <div class="footer__col">
    <h2>Adres</h2>
    <address><p>${esc(l.street)}<br>${esc(l.postalCode)} ${esc(l.city)}</p></address>
    <p>${btn(esc(l.mapsUrl), 'Route plannen<span class="sr-only"> (opent Google Maps)</span>', 'link', ' target="_blank" rel="noopener"')}</p>
  </div>
  <div class="footer__col">
    <h2>Contact</h2>
    <p>${tel()}</p>
    <p>${igLink()}</p>
  </div>
  <div class="footer__col"><h2>Open</h2>${hoursTable('hours hours--mini')}</div>
  <div class="footer__foot">
    <p>© ${year} ${esc(site.name)}</p>
    <p><a href="/privacy/">Privacy</a></p>
    <p>Prijzen zoals gepubliceerd op Instagram; wijzigingen voorbehouden.</p>
  </div>
</footer>
<div class="dock" data-dock>${tel(`<span>Bel</span>`, 'btn btn--ghost')}${btn(bookHref, 'Afspraak', 'btn', bookAttrs)}</div>
<dialog class="lightbox" data-lightbox aria-label="Cut vergroot">
  <figure class="lightbox__fig"><div class="lightbox__stage" data-stage></div><figcaption data-caption></figcaption></figure>
  <p class="lightbox__count" data-count></p>
  <button class="lightbox__btn lightbox__prev" type="button" data-prev><span class="sr-only">Vorige</span>${arrow}</button>
  <button class="lightbox__btn lightbox__next" type="button" data-next><span class="sr-only">Volgende</span>${arrow}</button>
  <button class="lightbox__btn lightbox__close" type="button" data-close><span class="sr-only">Sluiten</span><i></i><i></i></button>
</dialog>`;

const page = (meta, body, cls = '') => `${head(meta)}
<body class="${cls}">
<div class="progress" aria-hidden="true"><i data-progress></i></div>
${header()}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;

// ── homepage-secties ──────────────────────────────────────────────────────
// Honingraat-lijnen zoals het LED-plafond in de zaak; de cursor laat ze oplichten.
const hexPattern = (id) => `<svg class="hex" aria-hidden="true" width="100%" height="100%"><defs><pattern id="${id}" width="84" height="145.5" patternUnits="userSpaceOnUse" patternTransform="scale(1.6) rotate(8)"><path d="M42 0 84 24.25v48.5L42 97 0 72.75v-48.5zM42 97v48.5M0 145.5" fill="none" stroke="currentColor" stroke-width=".9"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;

const hero = () => `
<section class="hero" id="top" aria-labelledby="hero-title" data-hero>
  <div class="hero__bg" aria-hidden="true">
    <div class="hero__hex hero__hex--dim">${hexPattern('hx1')}</div>
    <div class="hero__hex hero__hex--lit" data-spot>${hexPattern('hx2')}</div>
  </div>
  <div class="hero__copy">
    <p class="eyebrow reveal"><span>Barbershop</span><i aria-hidden="true"></i>${esc(l.city)}</p>
    <h1 id="hero-title" class="hero__title"><span class="sr-only">${esc(site.name)}, ${esc(l.city)}: </span>${lines('Scherpe', '<span class="chrome">fades.</span>', '<span class="outline">Clean cuts.</span>')}</h1>
    <p class="lead reveal" style="--d:.5s">Moso Barbershop aan de ${esc(l.street.replace(/ \d+$/, ''))}. Fades, cuts en clean styles — loop binnen of maak een afspraak. Knippen voor € ${knippen.price}.</p>
    <div class="actions reveal" style="--d:.65s">
      ${btn(bookHref, 'Maak een afspraak', 'btn btn--chrome', bookAttrs + ' data-magnetic')}
      ${btn('#langskomen', 'Binnenlopen? Bekijk de tijden', 'link')}
    </div>
    <p class="status reveal" style="--d:.8s" data-status hidden><i aria-hidden="true"></i><span data-status-text></span></p>
  </div>
  <div class="stage" data-stage aria-hidden="true">
    <div class="rig" data-rig>
      <figure class="layer plate plate--back" style="--z:-160">${img('zaak-interieur', '', 1100, 1454, { eager: true })}</figure>
      <span class="layer ring" style="--z:-60"></span>
      <figure class="layer plate plate--main" style="--z:0">${img('zaak-stoel', '', 1100, 1803, { eager: true })}<span class="sheen"></span></figure>
      <figure class="layer plate plate--front" style="--z:150">${img('cut-crop-fade', '', 394, 525, { eager: true })}<figcaption>Crop fade</figcaption></figure>
      <span class="layer blade" style="--z:230"></span>
      <div class="layer tag" style="--z:110"><span>Knippen</span><strong>€ ${knippen.price}</strong></div>
    </div>
  </div>
  <a class="cue" href="#cuts"><span>Scroll</span><i aria-hidden="true"></i></a>
</section>
<div class="ticker" aria-hidden="true"><div class="ticker__track">${Array.from({ length: 4 }, () => [...site.focus, 'Met & zonder afspraak', site.tagline.join(' · ')].map((t) => `<span>${esc(t)}</span><i></i>`).join('')).join('')}</div></div>`;

const cuts = () => `
<section class="cuts" id="cuts" aria-labelledby="cuts-title" data-cuts>
  <div class="cuts__pin" data-pin>
    <div class="cuts__head">
      ${eyebrow('01', 'Onze cuts')}
      <h2 id="cuts-title" class="title">${lines('Het werk', '<span class="chrome">spreekt.</span>')}</h2>
      <p class="body reveal">Echte cuts uit de stoel aan de ${esc(l.street.replace(/ \d+$/, ''))}. Klik voor een grotere weergave.</p>
      <p class="cuts__count" aria-hidden="true"><span data-cut-now>01</span> / ${String(site.cuts.length).padStart(2, '0')}</p>
    </div>
    <ul class="cuts__track" data-track>
      ${site.cuts.map((x, i) => `
      <li class="cut" style="--i:${i}">
        <button type="button" class="cut__card" data-tilt data-index="${i}">
          <span class="cut__img">${img(x.src, `${x.title} bij ${site.name}`, x.w, x.h)}</span>
          <span class="cut__glare" aria-hidden="true"></span>
          <span class="cut__meta"><span class="cut__nr">${String(i + 1).padStart(2, '0')}</span><strong>${esc(x.title)}</strong><small>${esc(x.tag)}</small></span>
          <span class="sr-only">— vergroten</span>
        </button>
      </li>`).join('')}
      <li class="cut cut--end">
        <div class="cut__end"><p>Meer werk op</p>${igLink()}<p class="cut__end-sub">${esc(site.followers.count)} volgers · ${esc(site.followers.asOf)}</p></div>
      </li>
    </ul>
  </div>
</section>`;

const prices = () => `
<section class="prices section" id="prijzen" aria-labelledby="prijzen-title">
  <div class="prices__head">
    ${eyebrow('02', 'Diensten &amp; prijzen')}
    <h2 id="prijzen-title" class="title">${lines(esc(site.tagline[0]) + '.', `<span class="chrome">${esc(site.tagline[1])}.</span>`)}</h2>
    <p class="body reveal">Vaste prijzen, geen verrassingen. Je betaalt in de zaak.</p>
    <div class="reveal">${btn(bookHref, 'Afspraak maken', 'btn btn--chrome', bookAttrs + ' data-magnetic')}</div>
  </div>
  <div class="slab reveal" data-slab>
    <span class="slab__light" aria-hidden="true"></span>
    <ul class="menu">
      ${site.services.map((s) => `
      <li class="menu__row${s.addOn ? ' menu__row--add' : ''}">
        <span class="menu__ico">${icon(s.icon)}</span>
        <span class="menu__txt"><strong>${esc(s.name)}${s.note ? ` <small>${esc(s.note)}</small>` : ''}</strong><span>${esc(s.text)}</span></span>
        <span class="menu__price"><span class="sr-only">Prijs: </span>€&#8239;${s.price}</span>
        ${s.addOn ? '' : `<a class="menu__book" href="${bookHref}" data-pick="${s.id}"${bookAttrs}><span class="sr-only">Afspraak voor ${esc(s.name.toLowerCase())}</span>${arrow}</a>`}
      </li>`).join('')}
    </ul>
    <p class="slab__note">Duur per behandeling: ${v({ todo: true, label: 'tijdsduur per dienst' })}</p>
  </div>
</section>`;

const shop = () => `
<section class="shop" id="de-zaak" aria-labelledby="zaak-title">
  <figure class="shop__wide reveal-img" data-scale>${img('zaak-interieur', 'Het interieur van Moso Barbershop: wit-zwart marmer, zwarte lamellen en een honingraat van LED-licht aan het plafond', 1100, 1454)}</figure>
  <div class="shop__inner section">
    <div class="shop__copy">
      ${eyebrow('03', 'De zaak')}
      <h2 id="zaak-title" class="title">${lines('Marmer, licht', 'en een <span class="chrome">strakke</span> lijn.')}</h2>
      <p class="body reveal">Zwart-wit marmer, lamellen, ringlampen en een plafond van licht: bij Moso zit je in een zaak die net zo strak is afgewerkt als je fade.</p>
      <ol class="points">
        ${[['Fades · Cuts · Clean styles', 'Van skin fade tot taper en textured crop: strak overgelopen en scherp afgewerkt.'],
          ['Met & zonder afspraak', 'Loop binnen tijdens openingstijden, of plan vooraf je moment.'],
          [`${l.street}, ${l.city}`, 'Midden in Alphen, makkelijk te vinden.']].map(([t, d], i) => `
        <li class="reveal" style="--d:${i * 0.08}s"><span>0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}
      </ol>
    </div>
    <div class="shop__media">
      <figure class="frame frame--a reveal-img" data-parallax="-0.08">${img('barbier-aan-het-werk', 'Een barber van Moso aan het werk', 394, 442)}</figure>
      <figure class="frame frame--b reveal-img" style="--d:.15s" data-parallax="0.1">${img('zaak-pui', 'De pui van Moso Barbershop met de naam boven de etalage', 394, 438)}</figure>
    </div>
  </div>
</section>`;

const visit = () => `
<section class="visit section" id="langskomen" aria-labelledby="langskomen-title">
  <div class="visit__head">
    ${eyebrow('04', 'Langskomen')}
    <h2 id="langskomen-title" class="title">${lines('Loop binnen', 'of <span class="chrome">plan vooraf.</span>')}</h2>
  </div>
  <div class="visit__grid">
    <article class="way reveal" data-tilt>
      <span class="cut__glare" aria-hidden="true"></span>
      <p class="way__k">Zonder afspraak</p>
      <h3>Binnenlopen</h3>
      <p>Kom langs tijdens openingstijden en schuif aan. Is het druk, dan wacht je even op je beurt; wachttijden kunnen we vooraf niet beloven.</p>
      ${btn(esc(l.mapsUrl), 'Route plannen<span class="sr-only"> (opent Google Maps)</span>', 'link', ' target="_blank" rel="noopener"')}
    </article>
    <article class="way way--accent reveal" style="--d:.08s" data-tilt>
      <span class="cut__glare" aria-hidden="true"></span>
      <p class="way__k">Met afspraak</p>
      <h3>Zeker van je plek</h3>
      <p>Vraag een moment aan via het formulier of bel ${esc(c.phone)}. Je afspraak staat vast zodra de zaak hem bevestigt.</p>
      ${btn(bookHref, 'Afspraak aanvragen', 'link', bookAttrs)}
    </article>
    <div class="visit__hours reveal" style="--d:.12s">
      <h3>Openingstijden</h3>
      ${hoursTable()}
      <p class="visit__now" data-status-inline></p>
    </div>
    <div class="visit__where reveal" style="--d:.16s">
      <h3>Adres</h3>
      <address><p class="visit__addr">${esc(l.street)}<br>${esc(l.postalCode)} ${esc(l.city)}</p></address>
      <p>${tel(`Bel ${esc(c.phone)}`, 'btn btn--ghost btn--block')}</p>
      <p>${btn(esc(l.mapsUrl), 'Open in Google Maps<span class="sr-only"> (nieuw venster)</span>', 'btn btn--ghost btn--block', ' target="_blank" rel="noopener"')}</p>
    </div>
  </div>
</section>`;

const reviews = () => {
  if (!site.reviews.length && !site.draft) return '';
  return `
<section class="reviews section" aria-labelledby="reviews-title">
  ${eyebrow('05', 'Reviews')}
  <h2 id="reviews-title" class="title">${lines('Uit de <span class="chrome">stoel.</span>')}</h2>
  ${site.reviews.length
    ? `<ul class="quotes">${site.reviews.map((r) => `<li class="reveal"><blockquote><p>${esc(r.text)}</p><footer>— ${esc(r.author)}${r.source ? `, ${esc(r.source)}` : ''}</footer></blockquote></li>`).join('')}</ul>`
    : `<p class="quote-ph reveal">${v({ todo: true, label: 'echte Google-reviews van klanten (met toestemming) — er staan hier bewust geen verzonnen reviews' })}</p>`}
</section>`;
};

const booking = () => {
  const today = new Date().toISOString().slice(0, 10);
  return `
<section class="booking section" id="afspraak" aria-labelledby="afspraak-title">
  <div class="booking__intro">
    ${eyebrow('06', 'Afspraak')}
    <h2 id="afspraak-title" class="title">${lines('Jouw stoel,', '<span class="chrome">jouw tijd.</span>')}</h2>
    <p class="body reveal">Kies je dienst en je voorkeursmoment. Er is geen online agenda gekoppeld: je aanvraag is pas een afspraak als de zaak hem bevestigt.</p>
    <div class="booking__direct reveal">
      <p>Sneller geregeld?</p>
      ${tel(`Bel ${esc(c.phone)}`, 'btn btn--ghost')}
    </div>
  </div>
  <div class="booking__card reveal">
    <form class="form" data-form novalidate data-endpoint="${esc(site.form.endpoint ?? '')}" data-phone="${esc(c.phone)}" data-tel="${esc(c.phoneHref)}" data-dm="${esc(c.dm)}" data-whatsapp="${esc(c.whatsapp ?? '')}"
      data-hours='${JSON.stringify(Object.fromEntries(site.hours.map((h) => [h.d, h.open])))}'>
      <div class="form__summary" data-summary tabindex="-1" hidden></div>
      <fieldset class="field" data-field="dienst">
        <legend>Dienst <span class="req" aria-hidden="true">*</span></legend>
        <div class="opts">${site.services.filter((s) => !s.addOn).map((s) => `<label class="opt"><input type="radio" name="dienst" value="${s.id}" data-label="${esc(s.name)}" data-price="${s.price}" required><span class="opt__n">${esc(s.name)}${s.note ? ` <small>${esc(s.note)}</small>` : ''}</span><span class="opt__p">€ ${s.price}</span></label>`).join('')}</div>
        ${site.services.filter((s) => s.addOn).map((s) => `<label class="check"><input type="checkbox" name="extra" value="${esc(s.name)}" data-price="${s.price}"><span>${esc(s.name)} erbij (+ € ${s.price})</span></label>`).join('')}
        <p class="field__err" id="err-dienst" data-err></p>
        <p class="estimate" aria-live="polite"><span>Totaal</span><output data-total>€ 0</output></p>
      </fieldset>
      <div class="row">
        <div class="field" data-field="datum"><label for="f-datum">Datum <span class="req" aria-hidden="true">*</span></label><input id="f-datum" name="datum" type="date" min="${today}" required aria-describedby="err-datum f-datum-hint"><p class="field__hint" id="f-datum-hint" data-day-hint></p><p class="field__err" id="err-datum" data-err></p></div>
        <div class="field" data-field="tijd"><label for="f-tijd">Voorkeurstijd</label><select id="f-tijd" name="tijd" aria-describedby="f-tijd-hint"><option value="">Kies eerst een datum</option></select><p class="field__hint" id="f-tijd-hint">Een voorkeur, geen gereserveerd tijdslot.</p></div>
      </div>
      <div class="row">
        <div class="field" data-field="naam"><label for="f-naam">Naam <span class="req" aria-hidden="true">*</span></label><input id="f-naam" name="naam" autocomplete="name" required aria-describedby="err-naam"><p class="field__err" id="err-naam" data-err></p></div>
        <div class="field" data-field="telefoon"><label for="f-tel">Telefoon <span class="req" aria-hidden="true">*</span></label><input id="f-tel" name="telefoon" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="err-telefoon"><p class="field__err" id="err-telefoon" data-err></p></div>
      </div>
      <div class="field"><label for="f-bericht">Opmerking <small>optioneel</small></label><textarea id="f-bericht" name="bericht" rows="3" placeholder="Bijvoorbeeld de cut die je wilt, of een foto die je meeneemt"></textarea></div>
      <div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
      <button class="btn btn--chrome btn--block" type="submit" data-submit data-magnetic><span>Aanvraag versturen</span>${arrow}</button>
      <p class="form__privacy">Je gegevens worden alleen gebruikt om je afspraak in te plannen. <a href="/privacy/">Privacy</a></p>
    </form>
    <div class="form__result" data-result tabindex="-1" aria-live="polite" hidden></div>
  </div>
</section>`;
};

const finale = () => `
<section class="finale" aria-labelledby="finale-title" data-finale>
  <div class="coin" data-coin aria-hidden="true"><div class="coin__body"><img src="/assets/img/logo.png" width="512" height="512" alt=""><span class="coin__edge"></span><span class="coin__back"></span></div></div>
  <h2 id="finale-title" class="display">${lines(esc(site.tagline[0]) + '.', `<span class="chrome">${esc(site.tagline[1])}.</span>`)}</h2>
  <p class="lead reveal" style="--d:.3s">Tijd voor een verse cut? ${esc(l.street)}, ${esc(l.city)}.</p>
  <div class="actions reveal" style="--d:.45s">${btn(bookHref, 'Maak een afspraak', 'btn btn--chrome', bookAttrs + ' data-magnetic')}${tel(`Bel ${esc(c.phone)}`, 'link')}</div>
</section>`;

// ── pagina's ───────────────────────────────────────────────────────────────
const home = page(
  {
    title: `${site.name} — fades & cuts in ${l.city}`,
    description: `${site.name}, kapper aan de ${l.street} in ${l.city}. Fades, cuts en clean styles, met en zonder afspraak. Knippen € ${knippen.price}, haar en baard € ${site.services.find((s) => s.id === 'haar-baard').price}. Bekijk prijzen, openingstijden en cuts.`,
    path: '/',
  },
  [hero(), cuts(), prices(), shop(), visit(), reviews(), booking(), finale()].join('\n'),
);

const privacy = page(
  { title: `Privacy — ${site.name}`, description: `Hoe ${site.name} omgaat met je gegevens op deze website.`, path: '/privacy/' },
  `<section class="section prose">
  <p class="eyebrow"><span>Privacy</span></p>
  <h1 class="title">Privacy&shy;verklaring</h1>
  <p>${v({ todo: true, label: 'juridisch te controleren tekst — dit is een technische beschrijving van de website, geen volledige privacyverklaring' })}</p>
  <h2>Wat deze website doet</h2>
  <ul>
    <li>Deze website plaatst geen cookies en gebruikt geen analytics-, advertentie- of trackingscripts. Lettertypen, scripts en foto's komen van deze website zelf.</li>
    <li>${site.form.endpoint
      ? 'Vul je het aanvraagformulier in, dan worden je naam, telefoonnummer en wensen naar de zaak gestuurd om je afspraak in te plannen.'
      : 'Het aanvraagformulier verstuurt zelf niets. Het zet je aanvraag klaar; jij belt of stuurt het bericht zelf.'}</li>
    <li>Links naar Instagram en Google Maps openen die diensten; daar geldt hun eigen privacyverklaring.</li>
  </ul>
  <h2>Contact</h2>
  <p>Vragen over je gegevens? Bel ${tel()} of kom langs aan de ${esc(l.street)} in ${esc(l.city)}.</p>
  <p>${btn('/', 'Terug naar de homepage', 'link')}</p>
</section>`, 'is-plain');

const notFound = page(
  { title: `Pagina niet gevonden — ${site.name}`, description: 'Deze pagina bestaat niet (meer).', path: '/404.html' },
  `<section class="section prose prose--center">
  <p class="eyebrow"><span>404</span></p>
  <h1 class="title">Deze pagina is <span class="chrome">weggeknipt.</span></h1>
  <div class="actions">${btn('/', 'Naar de homepage', 'btn btn--chrome')}${btn('/#prijzen', 'Bekijk de prijzen', 'link')}</div>
</section>`, 'is-plain');

// ── schrijven ──────────────────────────────────────────────────────────────
await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}privacy`, { recursive: true });
await cp(new URL('./assets/', import.meta.url).pathname, `${OUT}assets`, { recursive: true });
await writeFile(`${OUT}index.html`, home);
await writeFile(`${OUT}privacy/index.html`, privacy);
await writeFile(`${OUT}404.html`, notFound);
const base = plain(site.url);
await writeFile(`${OUT}robots.txt`, site.draft || !base ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
if (base) {
  await writeFile(`${OUT}sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', '/privacy/'].map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')}
</urlset>
`);
}
const todos = JSON.stringify(site).match(/"todo":true/g)?.length ?? 0;
console.log(`public/ gebouwd · draft=${site.draft} · open placeholders: ${todos}`);
