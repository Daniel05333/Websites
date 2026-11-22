// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ig = `https://www.instagram.com/${site.contact.instagram}/`;
const tt = `https://www.tiktok.com/@${site.contact.tiktok}`;
const year = new Date().getFullYear();

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>',
};
const ask = (label, cls = 'btn btn--gold', pre = '') => `<a class="${cls}" href="#aanvraag" data-ask${pre ? ` data-pre="${esc(pre)}"` : ''}><span>${label}</span>${icon.arrow}</a>`;
const flag = (c) => `<span class="flag flag--${c}" aria-hidden="true"></span>`;

const head = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${site.name} · Photobooth &amp; mirrorbooth voor bruiloft, henna en events · NL &amp; DE</title>
<meta name="description" content="Petit Photobooth: photobooth en mirrorbooth met high quality prints voor bruiloften, henna, verlovingen en bedrijfsfeesten. Boekbaar in Nederland en Duitsland.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="theme-color" content="#f8f3ee">
<link rel="icon" href="/assets/img/logo.png" type="image/png">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/main.js" defer></script>
</head>
<body>`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="#top" aria-label="Petit Photobooth, naar boven"><img src="/assets/img/logo.png" alt="" width="320" height="320"><span>Petit <em>Photobooth</em></span></a>
  <nav class="masthead__nav" aria-label="Hoofdmenu"><a href="#gelegenheden">Gelegenheden</a><a href="#extras">Extra’s</a><a href="#gasten">Gastenfoto’s</a></nav>
  ${ask('Datum aanvragen', 'btn btn--sm btn--ink masthead__cta')}
</header>`;

const strip = (imgs, cls) => `<div class="strip ${cls}">${imgs.map((i) => `<img src="/assets/img/${i}.webp" alt="">`).join('')}<p>Strike a pose</p></div>`;
const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__glow"></span></div>
    <div class="stage" data-stage aria-hidden="true">
      ${strip(['hartjes', 'vriendinnen-brillen', 'gasten-brillen'], 'strip--a')}
      ${strip(['bruidspaar-zwartwit', 'bruidspaar-knuffel', 'zwartwit-duo'], 'strip--b')}
      ${strip(['bruidspaar-brillen', 'gasten-trio', 'feestgroep'], 'strip--c')}
    </div>
    <div class="camflash" data-flash aria-hidden="true"></div>
    <div class="sparkles" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}">${icon.spark}</i>`).join('')}</div>
    <div class="hero__copy">
      <p class="eyebrow">${icon.camera}Photobooths · ${flag('nl')} NL &amp; ${flag('de')} DE bookings</p>
      <h1 class="hero__title"><span class="line"><span>Herinneringen</span></span> <span class="line"><em>om te bewaren.</em></span></h1>
      <p class="hero__lead">Photobooth en mirrorbooth met high quality prints, in jullie eigen ontwerp. Voor bruiloften, henna, verlovingen en bedrijfsfeesten.</p>
      <div class="hero__actions">${ask('Vraag jullie datum aan', 'btn btn--gold magnetic')}<a class="btn btn--line magnetic" href="#gasten"><span>Bekijk gastenfoto’s</span></a></div>
    </div>
  </div>
</section>`;

const mItems = ['Bruiloften', 'Henna', 'Verlovingen', 'Bedrijfsfeesten', 'Mirrorbooth', 'Gastenboek', 'GIF’s', 'Nederland & Duitsland'];
const marquee = `<div class="marquee"><p class="sr-only">${mItems.join(' · ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${mItems.map((t) => `${esc(t)}<i>${icon.spark}</i>`).join('')}</span>`).join('')}</div></div>`;

const occasions = `<section class="section occ" id="gelegenheden" aria-labelledby="occ-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Gelegenheden</p><h2 class="title" id="occ-titel">Voor elk <em>feest.</em></h2></div>
    <ul class="occ__grid">
      ${site.occasions.map((o, i) => `<li class="occ__card tilt reveal" style="--d:${i * 0.07}s">
        <figure><img src="/assets/img/${o.img}.webp" alt="Photobooth bij een ${esc(o.name.toLowerCase())}" loading="lazy"></figure>
        <div><h3>${esc(o.name)}</h3><p>${esc(o.desc)}</p>${ask('Aanvragen', 'occ__ask', o.name)}</div>
      </li>`).join('\n      ')}
    </ul>
    <p class="occ__more">Ook voor ${site.more.map((m) => `<b>${esc(m)}</b>`).join(', ').replace(/, ([^,]*)$/, ' en $1')}.</p>
  </div>
</section>`;

const extras = `<section class="section extras" id="extras" aria-labelledby="extras-titel">
  <div class="wrap">
    <div class="section__head section__head--split"><div><p class="eyebrow eyebrow--light">Extra’s</p><h2 class="title title--light" id="extras-titel">Alles voor de <em>perfecte foto.</em></h2></div>
      <p class="section__lead">Kies wat bij jullie feest past. Alles wordt opgebouwd en begeleid op jullie locatie.</p></div>
    <ul class="extras__grid">${site.extras.map((e, i) => `<li class="extra reveal" style="--d:${(i % 3) * 0.07}s"><span>0${i + 1}</span><h3>${esc(e.name)}</h3><p>${esc(e.desc)}</p></li>`).join('')}</ul>
  </div>
</section>`;

const gallery = `<section class="section events" id="gasten" aria-labelledby="gasten-titel">
  <div class="wrap">
    <div class="section__head section__head--split"><div><p class="eyebrow">Gastenfoto’s</p><h2 class="title" id="gasten-titel">Gemaakt in <em>onze booth.</em></h2></div>
      <p class="section__lead">Een greep uit de foto’s van gasten. Klik om ze groot te bekijken.</p></div>
    <ul class="masonry">${site.gallery.map((g, i) => `<li class="reveal" style="--d:${(i % 3) * 0.06}s"><button class="shot" type="button" data-zoom="/assets/img/${g.img}.webp" data-label="${esc(g.label)}"><img src="/assets/img/${g.img}.webp" alt="${esc(g.label)}, gemaakt in de Petit Photobooth" loading="lazy"><span>${esc(g.label)}</span></button></li>`).join('')}</ul>
    <div class="reviews-todo"><p class="eyebrow">Reviews</p><p>Hier komen jullie mooiste reviews uit de highlight “Reviews”.</p></div>
    <p class="events__more"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}Meer op Instagram @${site.contact.instagram}</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lightbox-img><figcaption data-lightbox-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Vorige">${icon.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Volgende">${icon.arrow}</button>
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Sluiten">${icon.close}</button>
</dialog>`;

const steps = `<section class="section steps" aria-labelledby="stappen-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Zo werkt het</p><h2 class="title" id="stappen-titel">Van aanvraag <em>tot print.</em></h2></div>
    <ol class="steps__row" data-steps>${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('')}</ol>
  </div>
</section>`;

const request = `<section class="section request" id="aanvraag" aria-labelledby="aanvraag-titel">
  <div class="wrap request__grid">
    <div>
      <p class="eyebrow">Aanvraag</p>
      <h2 class="title" id="aanvraag-titel">Is jullie datum <em>nog vrij?</em></h2>
      <p class="section__lead">Vul jullie gelegenheid, datum, locatie en aantal gasten in. Het bericht wordt klaargezet, en jullie krijgen een voorstel op maat.</p>
      <p class="countries">${flag('nl')} Nederland <span>&amp;</span> ${flag('de')} Duitsland</p>
    </div>
    <form class="card-form" data-form data-ig="${site.contact.instagram}" novalidate>
      <label class="field"><span>Gelegenheid</span><select name="kind" required><option value="">Kies…</option>${[...site.occasions.map((o) => o.name), ...site.more, 'Anders'].map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>
      <fieldset class="field"><legend>Extra’s <small>(optioneel)</small></legend><div class="picks">${site.extras.slice(0, 4).map((e) => `<label><input type="checkbox" name="opt" value="${esc(e.name)}"><span>${icon.camera}${esc(e.name)}</span></label>`).join('')}</div></fieldset>
      <div class="field-row">
        <label class="field"><span>Datum</span><input type="date" name="date" required></label>
        <label class="field"><span>Aantal gasten</span><input type="number" name="guests" min="10" max="2000" step="10" inputmode="numeric" placeholder="Bijv. 300" required></label>
      </div>
      <div class="field-row">
        <label class="field"><span>Locatie <small>(zaal of plaats)</small></span><input name="venue" placeholder="Bijv. feestzaal in Enschede" required></label>
        <label class="field"><span>Land</span><select name="country"><option>Nederland</option><option>Duitsland</option></select></label>
      </div>
      <div class="field-row">
        <label class="field"><span>Jullie naam</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Thema of kleuren <small>(optioneel)</small></span><input name="note" placeholder="Bijv. wit & goud, rozen"></label>
      </div>
      <div class="preview"><span>Jullie bericht</span><p data-preview>Kies een gelegenheid…</p></div>
      <p class="form__error" data-error role="alert"></p>
      <button class="btn btn--gold btn--block" type="submit">${icon.send}<span>Kopieer &amp; stuur via Instagram</span></button>
      <p class="form__fine">Het bericht wordt gekopieerd en Instagram opent. Plak het in de DM. De datum staat pas vast na bevestiging.</p>
    </form>
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    <img class="footer__logo" src="/assets/img/logo.png" alt="Petit Photobooth" width="320" height="320" loading="lazy">
    <p>${site.tagline}<br>${flag('nl')} NL &amp; ${flag('de')} DE bookings</p>
    <nav aria-label="Footer"><a href="#gelegenheden">Gelegenheden</a><a href="#aanvraag">Aanvraag</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a><a href="${tt}" target="_blank" rel="noopener">TikTok</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="#aanvraag" data-ask>${icon.camera}<span>Datum aanvragen</span></a>`;

const index = `${head}
${header}
<main id="main">
${hero}
${marquee}
${occasions}
${extras}
${gallery}
${steps}
${request}
</main>
${footer}
</body>
</html>
`;
const notFound = `${head}<main id="main" class="lost"><img src="/assets/img/logo.png" alt="Petit Photobooth" width="160" height="160"><h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--gold" href="/"><span>Naar de homepage</span>${icon.arrow}</a></main></body></html>\n`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', notFound);
await writeFile('public/robots.txt', site.draft || isTodo(site.url) ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''}`);
