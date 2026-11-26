// Bouwt ./public (site + dashboard-preview) uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const C = site.contact;
const ig = `https://www.instagram.com/${C.instagram}/`;
const wa = `https://wa.me/${C.whatsapp}`;
const year = new Date().getFullYear();
const img = (n) => `/assets/img/${n}.webp`;

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>',
};
const ask = (label, cls = 'btn btn--gold', pre = {}) => `<a class="${cls}" href="#aanvraag" data-ask${pre.collection ? ` data-collection="${esc(pre.collection)}"` : ''}${pre.service ? ` data-service="${esc(pre.service)}"` : ''}><span>${label}</span>${icon.arrow}</a>`;

const head = (title, css, js) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="The Perfect Stage uit Rotterdam: bruidsbanken, weddingstages, bloemenbogen, trapbloemen en special effects. Bekijk de collecties en vraag direct jullie datum aan.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f6f1e9">
<link rel="icon" href="/assets/img/logo.png" type="image/png">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
${css.map((c) => `<link rel="stylesheet" href="/assets/css/${c}.css">`).join('\n')}
${js.map((j) => `<script src="/assets/js/${j}.js" defer></script>`).join('\n')}
</head>`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="#top" aria-label="The Perfect Stage, naar boven"><img src="/assets/img/logo-woord.png" alt="" width="200" height="140"></a>
  <nav class="masthead__nav" aria-label="Hoofdmenu"><a href="#diensten">Diensten</a><a href="#collecties">Collecties</a><a href="#portfolio">Portfolio</a><a href="#werkwijze">Werkwijze</a></nav>
  ${ask('Datum aanvragen', 'btn btn--sm btn--ink masthead__cta')}
</header>`;

const arches = ['bruidsbank-goudbogen', 'stage-wit-podium', 'bruidsbank-marmer', 'stage-roze-zaal', 'trapbloemen-groot'];
const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__glow"></span><span class="hero__floor"></span></div>
    <div class="arches" aria-hidden="true"><div class="arches__stage" data-arches>${arches.map((n, i) => `<figure class="arch" style="--i:${i}"><img src="${img(n)}" alt=""><span class="arch__rim"></span></figure>`).join('')}</div></div>
    <div class="petals" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
    <div class="hero__copy">
      <p class="eyebrow">${icon.pin}Weddingstyling · ${site.city} en omgeving</p>
      <h1 class="hero__title"><span class="line"><span>Het podium</span></span> <span class="line"><em>voor jullie dag.</em></span></h1>
      <p class="hero__lead">Bruidsbanken, weddingstages, bloemenbogen, trapbloemen en special effects. Kies een collectie en vraag in twee minuten jullie datum aan.</p>
      <div class="hero__actions">${ask('Vraag jullie datum aan', 'btn btn--gold magnetic')}<a class="btn btn--line magnetic" href="#collecties"><span>Bekijk collecties</span></a></div>
      <p class="hero__proof"><b>${site.followers}</b> volgers op Instagram · ${site.collections.length} collecties</p>
    </div>
  </div>
</section>`;

const promo = `<a class="promo" href="#aanvraag" data-ask data-promo><span class="promo__tag">Actie</span><b>${esc(site.promo.title)}</b><span>${esc(site.promo.note)}</span>${icon.arrow}</a>`;

const mItems = ['Bruidsbanken', 'Weddingstages', 'Bloemenbogen', 'Trapbloemen', 'Special effects', 'Welkomstborden', 'Inkomsthal', 'Rotterdam'];
const marquee = `<div class="marquee"><p class="sr-only">${mItems.join(' · ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${mItems.map((t) => `${t}<i>${icon.spark}</i>`).join('')}</span>`).join('')}</div></div>`;

const intro = `<section class="section intro" aria-labelledby="intro-titel">
  <div class="wrap intro__grid">
    <div><p class="eyebrow">The Perfect Stage</p><h2 class="title" id="intro-titel">Alles draait om <em>beleving.</em></h2></div>
    <p class="intro__text" data-words>Jullie plannen maanden voor één dag. Wij maken van jullie zaal een decor dat klopt tot in het kleinste detail: van de inkomsthal en de trap tot de bruidsbank waar alle ogen op gericht zijn.</p>
  </div>
</section>`;

const services = `<section class="section opts" id="diensten" aria-labelledby="diensten-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Diensten</p><h2 class="title" id="diensten-titel">Van bank tot <em>bloemenboog.</em></h2></div>
    <ol class="opts-list">
      ${site.services.map((o, i) => `<li class="opt reveal${i % 2 ? ' opt--flip' : ''}" id="dienst-${o.id}">
        <figure class="opt__media tilt"><img src="${img(o.img)}" alt="${esc(o.name)} door The Perfect Stage" loading="${i ? 'lazy' : 'eager'}"><span class="opt__n">0${i + 1}</span></figure>
        <div class="opt__body"><p class="opt__tag">${esc(o.name)}</p><h3>${esc(o.name)}</h3><p class="opt__desc">${esc(o.desc)}</p>
          <div class="opt__foot"><span class="price price--todo">prijs op aanvraag</span>${ask('Aanvragen', 'btn btn--sm btn--line', { service: o.name })}</div></div>
      </li>`).join('\n      ')}
    </ol>
    <div class="extras"><p class="eyebrow">Ook mogelijk</p><ul>${site.extras.map((e) => `<li>${icon.check}${esc(e)}</li>`).join('')}</ul></div>
  </div>
</section>`;

const collections = `<section class="section colls" id="collecties" aria-labelledby="coll-titel">
  <div class="wrap">
    <div class="section__head section__head--split"><div><p class="eyebrow eyebrow--light">Collecties</p><h2 class="title title--light" id="coll-titel">Kies jullie <em>thema.</em></h2></div>
      <p class="section__lead">Elke collectie is een complete look: bank, bogen, bloemen en licht in één stijl. Klik op een collectie om hem mee te nemen in jullie aanvraag.</p></div>
    <ul class="coll-grid">
      ${site.collections.map((c, i) => `<li class="reveal" style="--d:${(i % 4) * 0.06}s"><a class="coll tilt" href="#aanvraag" data-ask data-collection="${esc(c.name)}"><img src="${img(c.img)}" alt="" loading="lazy"><span class="coll__n">${String(i + 1).padStart(2, '0')}</span><span class="coll__name">${esc(c.name)}</span><span class="coll__go">Kies deze collectie ${icon.arrow}</span></a></li>`).join('\n      ')}
    </ul>
    <p class="colls__note">Sfeerbeelden. De volledige foto’s per collectie staan in de highlights op Instagram.</p>
  </div>
</section>`;

const trap = `<section class="feature-trap" aria-labelledby="trap-titel">
  <figure class="feature-trap__img reveal"><img src="${img('trapbloemen-groot')}" alt="Trap met witte rozen en orchideeën" loading="lazy"></figure>
  <div class="feature-trap__copy reveal"><p class="eyebrow">Trapbloemen</p><h2 class="title" id="trap-titel">Een entree om <em>nooit te vergeten.</em></h2><p class="section__lead">Leuningen vol witte rozen, orchideeën en hortensia’s. Voor de eerste foto’s, de grote entree en elk moment op de trap.</p>${ask('Trapbloemen aanvragen', 'btn btn--gold', { service: 'Trapbloemen' })}</div>
</section>`;

const gallery = `<section class="section events" id="portfolio" aria-labelledby="pf-titel">
  <div class="wrap">
    <div class="section__head section__head--split"><div><p class="eyebrow">Portfolio</p><h2 class="title" id="pf-titel">Zalen die we <em>aankleedden.</em></h2></div>
      <div class="filters" role="group" aria-label="Filter portfolio">${[['alle', 'Alles'], ['stage', 'Stages & banken'], ['bogen', 'Bogen'], ['trap', 'Trap'], ['zaal', 'Zaal & tafels']].map(([k, l], i) => `<button class="filter" type="button" data-filter="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div></div>
    <ul class="masonry" data-masonry>
      ${site.gallery.map((g, i) => `<li class="reveal" data-cat="${g.cat}" style="--d:${(i % 3) * 0.05}s"><button class="shot" type="button" data-zoom="${img(g.img)}" data-label="${esc(g.label)}"><img src="${img(g.img)}" alt="${esc(g.label)}" loading="lazy"><span>${esc(g.label)}</span></button></li>`).join('\n      ')}
    </ul>
    <p class="events__more"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}Meer op Instagram @${C.instagram}</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lightbox-img><figcaption data-lightbox-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Vorige">${icon.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Volgende">${icon.arrow}</button>
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Sluiten">${icon.close}</button>
</dialog>`;

const steps = `<section class="section steps" id="werkwijze" aria-labelledby="werkwijze-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Werkwijze</p><h2 class="title" id="werkwijze-titel">Van aanvraag <em>tot entree.</em></h2></div>
    <ol class="steps__row" data-steps>${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('')}</ol>
  </div>
</section>`;

const stepNames = ['Jullie dag', 'De zaal', 'Jullie wensen', 'Contact'];
const configurator = `<section class="section request" id="aanvraag" aria-labelledby="aanvraag-titel">
  <div class="wrap request__grid">
    <div class="request__side">
      <p class="eyebrow">Aanvraag</p>
      <h2 class="title" id="aanvraag-titel">Stel jullie <em>stage</em> samen.</h2>
      <p class="section__lead">Vier korte stappen. Daarna gaat jullie aanvraag in één tik naar onze WhatsApp, met alles al ingevuld. Geen eindeloos heen-en-weer appen.</p>
      <div class="summary" data-summary aria-live="polite"></div>
    </div>
    <form class="cfg" data-cfg data-wa="${C.whatsapp}" novalidate>
      <ol class="cfg__steps" aria-label="Stappen">${stepNames.map((s, i) => `<li data-i="${i}"><span>${i + 1}</span><b>${s}</b></li>`).join('')}</ol>
      <fieldset class="cfg__page" data-page="0"><legend class="sr-only">Jullie dag</legend>
        <div class="field-row"><label class="field"><span>Datum</span><input type="date" name="date" required></label><label class="field"><span>Aantal gasten</span><input type="number" name="guests" min="20" max="3000" step="10" inputmode="numeric" placeholder="Bijv. 400" required></label></div>
        <fieldset class="field"><legend>Soort feest</legend><div class="chips">${site.events.map((e, i) => `<label><input type="radio" name="event" value="${e}"${i === 0 ? ' checked' : ''}><span>${e}</span></label>`).join('')}</div></fieldset>
        <p class="cfg__avail" data-avail aria-live="polite"></p>
      </fieldset>
      <fieldset class="cfg__page" data-page="1" hidden><legend class="sr-only">De zaal</legend>
        <label class="field"><span>Naam van de zaal</span><input name="venue" placeholder="Bijv. de naam van jullie feestzaal" required></label>
        <label class="field"><span>Plaats</span><input name="place" placeholder="Bijv. Rotterdam" required></label>
        <label class="field"><span>Tijd van opbouw <small>(als jullie die weten)</small></span><input name="setup" placeholder="Bijv. vanaf 12:00"></label>
      </fieldset>
      <fieldset class="cfg__page" data-page="2" hidden><legend class="sr-only">Jullie wensen</legend>
        <fieldset class="field"><legend>Collectie</legend><div class="coll-pick">${['Op maat', ...site.collections.map((c) => c.name)].map((c, i) => `<label><input type="radio" name="collection" value="${esc(c)}"${i === 0 ? ' checked' : ''}><span>${esc(c)}</span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend>Onderdelen</legend><div class="picks">${[...site.services.map((s) => s.name), ...site.extras].map((s) => `<label><input type="checkbox" name="parts" value="${esc(s)}"><span>${icon.check}${esc(s)}</span></label>`).join('')}</div></fieldset>
        <label class="field"><span>Kleuren of sfeer <small>(optioneel)</small></span><input name="colors" placeholder="Bijv. wit en goud, oudroze, rood"></label>
        <label class="promo-check"><input type="checkbox" name="promo"><span>Ik wil graag weten of we in aanmerking komen voor <b>tot €300 korting</b></span></label>
      </fieldset>
      <fieldset class="cfg__page" data-page="3" hidden><legend class="sr-only">Contact</legend>
        <div class="field-row"><label class="field"><span>Jullie namen</span><input name="name" autocomplete="name" placeholder="Bijv. Sara & Yusuf" required></label><label class="field"><span>Telefoon</span><input name="phone" type="tel" autocomplete="tel" placeholder="06 12345678" required></label></div>
        <label class="field"><span>Opmerkingen <small>(optioneel)</small></span><input name="note" placeholder="Bijv. inspiratiefoto’s sturen we via WhatsApp"></label>
        <div class="preview"><span>Jullie WhatsApp-bericht</span><p data-preview></p></div>
      </fieldset>
      <p class="form__error" data-error role="alert"></p>
      <div class="cfg__nav"><button class="btn btn--line" type="button" data-prev>Terug</button><button class="btn btn--gold" type="button" data-next><span>Volgende</span>${icon.arrow}</button><button class="btn btn--wa" type="submit" data-send hidden>${icon.wa}<span>Verstuur via WhatsApp</span></button></div>
      <p class="form__fine">WhatsApp opent met jullie aanvraag al ingevuld. De datum staat pas vast na bevestiging van The Perfect Stage.</p>
    </form>
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    <img class="footer__logo" src="/assets/img/logo.png" alt="The Perfect Stage" width="420" height="420" loading="lazy">
    <p>Bruidsbanken · Weddingstages · Bloemenbogen · Trapbloemen · Special effects<br>${site.city} · <a href="tel:+${C.whatsapp}">${C.phone}</a></p>
    <nav aria-label="Footer"><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a><a href="#aanvraag">Aanvraag</a><a href="dashboard.html">Dashboard (preview)</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Concept · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="#aanvraag" data-ask>${icon.wa}<span>Datum aanvragen</span></a>`;

const index = `${head(`${site.name} · Bruidsbanken, weddingstages & bloemenbogen · ${site.city}`, ['main', 'stage'], ['main', 'stage'])}
<body>
${header}
<main id="main">
${hero}
${promo}
${marquee}
${intro}
${services}
${collections}
${trap}
${gallery}
${steps}
${configurator}
</main>
${footer}
</body>
</html>
`;

const dashboard = `${head(`${site.name} · Dashboard (preview)`, ['dashboard'], ['dashboard'])}
<body class="dsh">
<aside class="dsh__side">
  <p class="dsh__brand"><img src="/assets/img/logo.png" alt="" width="40" height="40">The Perfect Stage</p>
  <nav aria-label="Dashboard">${[['aanvragen', 'Aanvragen'], ['planning', 'Planning'], ['collecties', 'Collecties'], ['cijfers', 'Cijfers']].map(([k, l], i) => `<button type="button" data-tab="${k}"${i === 0 ? ' aria-current="page"' : ''}>${l}</button>`).join('')}</nav>
  <a class="dsh__back" href="index.html">← Naar de website</a>
  <p class="dsh__demo">Preview met <b>verzonnen demo-gegevens</b>. Aanvragen die je op de website instuurt, verschijnen hier ook (in deze browser).</p>
</aside>
<main class="dsh__main" id="main">
  <header class="dsh__top"><div><p class="dsh__date" data-today></p><h1 data-title>Aanvragen</h1></div><label class="dsh__search"><span class="sr-only">Zoek</span><input type="search" placeholder="Zoek op naam, zaal of plaats…" data-search></label></header>
  <div data-view></div>
</main>
<dialog class="dsh__drawer" data-drawer aria-labelledby="drawer-title"><div data-drawer-body></div></dialog>
<script type="application/json" id="ps-data">${JSON.stringify({ collections: site.collections.map((c) => c.name), parts: [...site.services.map((s) => s.name), ...site.extras] }).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/dashboard.html', dashboard);
await writeFile('public/404.html', `${head('Pagina niet gevonden', ['main'], [])}<body><main class="lost"><img src="/assets/img/logo.png" alt="The Perfect Stage" width="160" height="160"><h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--gold" href="/"><span>Naar de homepage</span></a></main></body></html>\n`);
await writeFile('public/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log('public/ gebouwd (concept: noindex): index + dashboard');
