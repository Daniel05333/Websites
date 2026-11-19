// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const { contact: C } = site;
const ig = `https://www.instagram.com/${C.instagram}/`;
const year = new Date().getFullYear();
const price = (p) => (isTodo(p) ? '<span class="price price--todo" title="Prijs nog in te vullen">prijs op aanvraag</span>' : `<span class="price">${esc(p)}</span>`);

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  glass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16l-8 9-8-9Zm8 9v7m-4 0h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>',
};

const ask = (label, cls = 'btn btn--gold', pre = '') => `<a class="${cls}" href="#aanvraag" data-ask${pre ? ` data-pre="${esc(pre)}"` : ''}><span>${label}</span>${icon.arrow}</a>`;

const head = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${site.name} · ${site.tagline} · Mocktailtable, tiramisu bar &amp; snack bar in ${site.city}</title>
<meta name="description" content="Design Events uit Enschede: luxe mocktail tables, een tiramisu bar, snack bar en styling voor bruiloften en events. Vraag direct een offerte aan met jullie datum en aantal gasten.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="theme-color" content="#fbf9f5">
<meta property="og:title" content="${site.name} · ${site.tagline}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/main.js" defer></script>
</head>
<body>`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="#top" aria-label="Design Events, naar boven"><img src="/assets/img/logo-badge.png" alt="" width="560" height="560"><span>Design <em>Events</em></span></a>
  <nav class="masthead__nav" aria-label="Hoofdmenu">
    <a href="#opties">Opties</a>
    <a href="#events">Events</a>
    <a href="#werkwijze">Werkwijze</a>
  </nav>
  ${ask('Offerte aanvragen', 'btn btn--sm btn--ink masthead__cta')}
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__glow"></span></div>
    <canvas class="hero__canvas" data-glasses aria-hidden="true"></canvas>
    <div class="hero__fallback" aria-hidden="true"><img src="/assets/img/kokos-mr-mrs.webp" alt=""></div>
    <div class="sparkles" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}">${icon.spark}</i>`).join('')}</div>
    <div class="hero__copy">
      <p class="eyebrow">${icon.pin}${site.tagline} · ${site.city}</p>
      <h1 class="hero__title"><span class="line"><span>Een tafel om</span></span> <span class="line"><em>op te proosten.</em></span></h1>
      <p class="hero__lead">Luxe mocktail tables, een tiramisu bar en een snack bar, gestyled in wit en goud. Voor jullie bruiloft of event.</p>
      <div class="hero__actions">${ask('Vraag een offerte aan', 'btn btn--gold magnetic')}<a class="btn btn--line magnetic" href="#opties"><span>Bekijk de opties</span></a></div>
    </div>
    <p class="hero__fill" aria-hidden="true"><span data-fill-label>Kokos</span><i><b data-fill></b></i></p>
  </div>
</section>`;

const mItems = ['Mocktail Table', 'Tiramisu Bar', 'Snack Bar', 'Gouden tafels', 'Verlichte vlinders', 'Kristallen karaffen', 'Mr & Mrs', 'Enschede'];
const marquee = `<div class="marquee"><p class="sr-only">${mItems.join(' · ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${mItems.map((t) => `${esc(t)}<i>${icon.spark}</i>`).join('')}</span>`).join('')}</div></div>`;

const intro = `<section class="section intro" aria-labelledby="intro-titel">
  <div class="wrap intro__grid">
    <div>
      <p class="eyebrow">Design Events</p>
      <h2 class="title" id="intro-titel">Elk detail, <em>met liefde gestyled.</em></h2>
    </div>
    <p class="intro__text" data-words>Kristallen karaffen vol fruit en kruiden, coupes met kokos en rozen, gouden tafels en verlichte vlinders. Wij maken van jullie drankjes een blikvanger die jullie gasten nooit vergeten.</p>
  </div>
</section>`;

const options = `<section class="section options" id="opties" aria-labelledby="opties-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow">Onze opties</p>
      <h2 class="title" id="opties-titel">Kies jullie <em>blikvanger.</em></h2>
    </div>
    <ol class="opts-list">
      ${site.options.map((o, i) => `<li class="opt reveal${i % 2 ? ' opt--flip' : ''}" id="optie-${o.id}">
        <figure class="opt__media tilt"><img src="/assets/img/${o.img}.webp" alt="${esc(o.name)} van Design Events" loading="${i < 1 ? 'eager' : 'lazy'}"><span class="opt__n">0${i + 1}</span></figure>
        <div class="opt__body">
          <p class="opt__tag">${esc(o.tag)}</p>
          <h3>${esc(o.name)}</h3>
          <p class="opt__desc">${esc(o.desc)}</p>
          <ul class="ticks">${o.points.map((p) => `<li>${icon.check}${esc(p)}</li>`).join('')}</ul>
          <div class="opt__foot">${price(o.price)}${ask('Aanvragen', 'btn btn--sm btn--line', o.name)}</div>
        </div>
      </li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const gallery = `<section class="section events" id="events" aria-labelledby="events-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div><p class="eyebrow eyebrow--light">Events</p><h2 class="title title--light" id="events-titel">Zo ziet het <em>eruit.</em></h2></div>
      <p class="section__lead">Een greep uit onze tafels. Klik op een foto om hem groot te bekijken.</p>
    </div>
    <ul class="masonry" data-masonry>
      ${site.gallery.map((g, i) => `<li class="reveal" style="--d:${(i % 3) * 0.06}s"><button class="shot" type="button" data-zoom="/assets/img/${g.img}.webp" data-label="${esc(g.label)}"><img src="/assets/img/${g.img}.webp" alt="${esc(g.label)}" loading="${i < 6 ? 'eager' : 'lazy'}"><span>${esc(g.label)}</span></button></li>`).join('\n      ')}
    </ul>
    <p class="events__more"><a class="link link--light" href="${ig}" target="_blank" rel="noopener">${icon.ig}Meer op Instagram @${C.instagram}</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lightbox-img><figcaption data-lightbox-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Vorige">${icon.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Volgende">${icon.arrow}</button>
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Sluiten">${icon.close}</button>
</dialog>`;

const feature = `<section class="feature" aria-label="Design Events">
  <img class="feature__logo reveal" src="/assets/img/logo-goud.png" alt="Design Events" width="601" height="661" loading="lazy">
  <p class="feature__quote reveal">Voor ${site.occasions.join(', ').toLowerCase().replace(/, ([^,]*)$/, ' en $1')} <em>met allure.</em></p>
</section>`;

const steps = `<section class="section steps" id="werkwijze" aria-labelledby="werkwijze-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Werkwijze</p><h2 class="title" id="werkwijze-titel">Van aanvraag <em>tot proost.</em></h2></div>
    <ol class="steps__row" data-steps>
      ${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const request = `<section class="section request" id="aanvraag" aria-labelledby="aanvraag-titel">
  <div class="wrap request__grid">
    <div>
      <p class="eyebrow">Aanvraag</p>
      <h2 class="title" id="aanvraag-titel">Vertel ons over <em>jullie dag.</em></h2>
      <p class="section__lead">Kies jullie opties en vul de datum en het aantal gasten in. Je aanvraag wordt klaargezet als bericht, en we sturen jullie een voorstel op maat.</p>
      <p class="request__ig"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}@${C.instagram}</a></p>
    </div>
    <form class="card-form" data-form data-ig="${C.instagram}" novalidate>
      <fieldset class="field"><legend>Welke opties?</legend>
        <div class="picks">${site.options.map((o) => `<label><input type="checkbox" name="opt" value="${esc(o.name)}"><span>${icon.glass}${esc(o.name)}</span></label>`).join('')}</div>
      </fieldset>
      <div class="field-row">
        <label class="field"><span>Datum</span><input type="date" name="date" required></label>
        <label class="field"><span>Aantal gasten</span><input type="number" name="guests" min="10" max="1500" step="10" inputmode="numeric" placeholder="Bijv. 250" required></label>
      </div>
      <label class="field"><span>Soort event</span><select name="kind"><option>Bruiloft</option><option>Verloving</option><option>Verjaardag</option><option>Bedrijfsevent</option><option>Anders</option></select></label>
      <label class="field"><span>Locatie <small>(zaal of plaats)</small></span><input name="venue" placeholder="Bijv. feestzaal in Enschede"></label>
      <div class="field-row">
        <label class="field"><span>Jullie naam</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Kleuren of thema <small>(optioneel)</small></span><input name="note" placeholder="Bijv. wit & goud, rozen"></label>
      </div>
      <div class="preview"><span>Jullie bericht</span><p data-preview>Kies een of meer opties…</p></div>
      <p class="form__error" data-error role="alert"></p>
      <button class="btn btn--gold btn--block" type="submit">${icon.send}<span>Kopieer &amp; stuur via Instagram</span></button>
      <p class="form__fine">Je bericht wordt gekopieerd en Instagram opent. Plak het in de DM. De datum staat pas vast na onze bevestiging.</p>
    </form>
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    <img class="footer__logo" src="/assets/img/logo-goud.png" alt="Design Events" width="601" height="661" loading="lazy">
    <p>${site.tagline} · ${site.city}, Nederland<br>DM voor info en offertes</p>
    <nav aria-label="Footer"><a href="#opties">Opties</a><a href="#events">Events</a><a href="#aanvraag">Aanvraag</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="#aanvraag" data-ask>${icon.glass}<span>Offerte aanvragen</span></a>`;

const index = `${head}
${header}
<main id="main">
${hero}
${marquee}
${intro}
${options}
${gallery}
${feature}
${steps}
${request}
</main>
${footer}
</body>
</html>
`;

const notFound = `${head}
<main id="main" class="lost"><img src="/assets/img/logo-badge.png" alt="Design Events" width="160" height="160"><h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--gold" href="/"><span>Naar de homepage</span>${icon.arrow}</a></main>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', notFound);
await writeFile('public/robots.txt', site.draft || isTodo(site.url) ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''}`);
