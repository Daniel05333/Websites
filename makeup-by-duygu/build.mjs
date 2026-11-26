// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const { contact: C } = site;
const ig = `https://www.instagram.com/${C.instagram}/`;
const tt = `https://www.tiktok.com/@${C.tiktok}`;
const year = new Date().getFullYear();
const price = (p) => (isTodo(p) ? '<span class="price price--todo" title="Prijs nog in te vullen">op aanvraag</span>' : `<span class="price">${esc(p)}</span>`);

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16v-4l2-5h12l2 5v4M4 16h16M4 16v2h3v-2m10 0v2h3v-2M7 13h.01M17 13h.01" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cert: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m9.5 9 1.8 1.8L14.8 7.3M8.5 13.8 7 21l5-2.6 5 2.6-1.5-7.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  quote: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 18v-5c0-4 2-7 6-8l1 2c-2 1-3 3-3 5h3v6H4Zm9 0v-5c0-4 2-7 6-8l1 2c-2 1-3 3-3 5h3v6h-7Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>',
};

const ask = (label, cls = 'btn btn--dark', pre = '') => `<a class="${cls}" href="#aanvraag" data-book${pre ? ` data-pre="${esc(pre)}"` : ''}><span>${label}</span>${icon.arrow}</a>`;
const wordmark = (cls = '') => `<span class="wordmark ${cls}"><span class="wordmark__top">Makeup by</span><span class="wordmark__name">Duygu</span></span>`;

const head = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${site.name} · Bruids- en event make-up · ${site.region}</title>
<meta name="description" content="Makeup by Duygu: gecertificeerd make-upartiest voor bruids- en event make-up in de regio Vaassen/Apeldoorn, in de studio of op locatie. Vraag direct je datum aan.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="theme-color" content="#f7efe9">
<meta property="og:title" content="${site.name} · ${site.role}">
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
  <a class="masthead__brand" href="#top" aria-label="Makeup by Duygu, naar boven">${wordmark()}</a>
  <nav class="masthead__nav" aria-label="Hoofdmenu">
    <a href="#portfolio">Portfolio</a>
    <a href="#behandelingen">Behandelingen</a>
    <a href="#reviews">Reviews</a>
    <a href="#over">Over mij</a>
  </nav>
  ${ask('Datum aanvragen', 'btn btn--sm btn--dark masthead__cta')}
</header>`;

const shades = ['Nude', 'Rosé', 'Berry', 'Eid red', 'Mocha'];
const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__orb hero__orb--a"></span><span class="hero__orb hero__orb--b"></span></div>
    <div class="hero__stage" aria-hidden="true">
      <canvas class="hero__canvas" data-lipstick></canvas>
      <img class="hero__fallback" src="/assets/img/bruid-kroon.webp" alt="">
      <span class="hero__shadow"></span>
    </div>
    <div class="hero__copy">
      <p class="eyebrow">${icon.pin}${site.role} · ${site.region} · op locatie</p>
      <h1 class="hero__title"><span class="line"><span>Jouw dag,</span></span> <span class="line"><em>jouw glow.</em></span></h1>
      <p class="hero__lead">Bruids- en event make-up voor elke gelegenheid. Stralend, langhoudend en helemaal jij. In de studio of bij jou op locatie.</p>
      <div class="hero__actions">${ask('Vraag je datum aan', 'btn btn--dark magnetic')}<a class="btn btn--line magnetic" href="#portfolio"><span>Bekijk mijn werk</span></a></div>
    </div>
    <ol class="hero__swatches" aria-hidden="true">${shades.map((n, i) => `<li style="--i:${i}">${n}</li>`).join('')}</ol>
    <p class="hero__scroll" aria-hidden="true"><span>Scroll</span><i></i></p>
  </div>
</section>`;

const mItems = ['Bridal', 'Henna', 'Verloving', 'Soft glam', 'Event make-up', 'Eid looks', 'Op locatie', site.certified];
const marquee = `<div class="marquee"><p class="sr-only">${esc(mItems.join(' · '))}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${mItems.map((t) => `${esc(t)}<i>${icon.spark}</i>`).join('')}</span>`).join('')}</div></div>`;

const work = `<section class="section work" id="portfolio" aria-labelledby="portfolio-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div><p class="eyebrow">Portfolio</p><h2 class="title" id="portfolio-titel">Mijn <em>looks.</em></h2></div>
      <div class="filters" role="group" aria-label="Filter op gelegenheid">
        ${site.filters.map((f, i) => `<button class="filter" type="button" data-filter="${f.id}" aria-pressed="${i === 0}">${f.name}</button>`).join('')}
      </div>
    </div>
    <ul class="grid" data-grid>
      ${site.work.map((w, i) => `<li class="card reveal" data-cat="${w.cat}" style="--d:${(i % 3) * 0.06}s">
        <button class="card__btn tilt" type="button" data-zoom="/assets/img/${w.img}.webp" data-label="${esc(w.label)}" aria-label="Vergroot: ${esc(w.label)}">
          <img src="/assets/img/${w.img}.webp" alt="${esc(w.label)}, make-up door Duygu" loading="${i < 6 ? 'eager' : 'lazy'}">
          <span class="card__label">${esc(w.label)}</span><span class="card__shine" aria-hidden="true"></span>
        </button>
      </li>`).join('\n      ')}
    </ul>
    <p class="work__more"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}Meer op Instagram @${C.instagram}</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lightbox-img><figcaption data-lightbox-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Vorige">${icon.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Volgende">${icon.arrow}</button>
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Sluiten">${icon.close}</button>
</dialog>`;

const services = `<section class="section services" id="behandelingen" aria-labelledby="behandelingen-titel">
  <div class="wrap services__grid">
    <div class="services__aside">
      <p class="eyebrow">Behandelingen</p>
      <h2 class="title" id="behandelingen-titel">Voor elke <em>gelegenheid.</em></h2>
      <ul class="places">
        <li>${icon.pin}<span><b>Studio</b>Regio ${site.region}</span></li>
        <li>${icon.car}<span><b>Op locatie</b>Ik kom naar je toe, thuis of op je trouwlocatie</span></li>
      </ul>
    </div>
    <ul class="menu">
      ${site.services.map((s, i) => `<li class="menu__item reveal" style="--d:${i * 0.05}s">
        <span class="menu__n">0${i + 1}</span>
        <div class="menu__text"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div>
        ${price(s.price)}
        ${ask('Aanvragen', 'menu__book', s.name)}
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const reviews = `<section class="section reviews" id="reviews" aria-labelledby="reviews-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Reviews</p><h2 class="title" id="reviews-titel">Lieve <em>woorden.</em></h2></div>
    <ul class="quotes">
      ${site.reviews.map((r, i) => `<li class="quote tilt reveal" style="--d:${i * 0.1}s">${icon.quote}<blockquote><p>${esc(r.text)}</p></blockquote><p class="quote__who">${esc(r.who)}</p></li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const about = `<section class="section about" id="over" aria-labelledby="over-titel">
  <div class="wrap about__grid">
    <figure class="about__photo reveal"><img src="/assets/img/over-duygu.webp" alt="Duygu, make-upartiest" loading="lazy"></figure>
    <div>
      <p class="eyebrow">Over mij</p>
      <h2 class="title" id="over-titel">Hoi, ik ben <em>Duygu.</em></h2>
      <p class="about__text" data-words>Make-up is voor mij meer dan een look: het is het moment dat je in de spiegel kijkt en straalt. Ik werk met aandacht voor jouw huid, jouw stijl en jouw dag, zodat je make-up van de eerste foto tot de laatste dans blijft zitten.</p>
      <div class="cert reveal">
        <img src="/assets/img/certificaat.webp" alt="Certificaat van de BURCII make-up workshop" loading="lazy">
        <p>${icon.cert}<span><b>Gecertificeerd</b>Workshop “The Make-up Techniques of BURCII”, december 2024</span></p>
      </div>
    </div>
  </div>
</section>`;

const steps = `<section class="section steps" aria-labelledby="stappen-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Zo werkt het</p><h2 class="title" id="stappen-titel">Van aanvraag <em>tot glow.</em></h2></div>
    <ol class="steps__row" data-steps>
      ${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const booking = `<section class="section book" id="aanvraag" aria-labelledby="aanvraag-titel">
  <div class="wrap book__grid">
    <div>
      <p class="eyebrow">Aanvraag</p>
      <h2 class="title" id="aanvraag-titel">Is jouw datum <em>nog vrij?</em></h2>
      <p class="section__lead">Vul je gelegenheid, datum en locatie in. Je aanvraag wordt klaargezet als bericht, Duygu laat je zo snel mogelijk weten of de datum vrij is.</p>
      <p class="book__ig"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}@${C.instagram}</a></p>
    </div>
    <form class="book__card" data-book-form novalidate>
      <label class="field"><span>Gelegenheid</span>
        <select name="treatment" required><option value="">Kies…</option>${site.services.map((s) => `<option>${esc(s.name)}</option>`).join('')}</select>
      </label>
      <div class="field-row">
        <label class="field"><span>Datum</span><input type="date" name="date" required></label>
        <label class="field"><span>Klaar om <small>(optioneel)</small></span><input type="time" name="time" step="900"></label>
      </div>
      <fieldset class="field"><legend>Waar?</legend><div class="chips">${['In de studio', 'Op locatie'].map((d, i) => `<label><input type="radio" name="where" value="${d}"${i === 0 ? ' checked' : ''}><span>${d}</span></label>`).join('')}</div></fieldset>
      <label class="field" data-place hidden><span>Plaats</span><input name="place" placeholder="Bijv. Apeldoorn of de naam van je trouwlocatie"></label>
      <div class="field-row">
        <label class="field"><span>Aantal personen</span><input type="number" name="persons" min="1" max="15" value="1" inputmode="numeric"></label>
        <label class="field"><span>Je naam</span><input name="name" autocomplete="name" required></label>
      </div>
      <label class="field"><span>Wensen <small>(optioneel)</small></span><input name="note" placeholder="Bijv. soft glam, hijab, henna-avond"></label>
      <div class="book__preview"><span>Je bericht</span><p data-book-preview>Kies een gelegenheid…</p></div>
      <p class="book__error" data-book-error role="alert"></p>
      <button class="btn btn--dark btn--block" type="submit">${icon.send}<span>Kopieer &amp; open Instagram</span></button>
      <p class="book__fine">Je bericht wordt gekopieerd. Plak het in de DM die opent. Je datum staat pas vast na bevestiging.</p>
    </form>
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    ${wordmark('wordmark--light')}
    <p>${site.role} · ${site.region} + op locatie<br>${esc(site.certified)}</p>
    <nav aria-label="Footer"><a href="#portfolio">Portfolio</a><a href="#aanvraag">Aanvraag</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a><a href="${tt}" target="_blank" rel="noopener">TikTok</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Geen cookies, geen trackers.</p>
  </div>
</footer>
${ask('Datum aanvragen', 'dock')}`.replace('class="dock"', 'class="dock" data-dock');

const index = `${head}
${header}
<main id="main">
${hero}
${marquee}
${work}
${services}
${reviews}
${about}
${steps}
${booking}
</main>
${footer}
</body>
</html>
`;

const notFound = `${head}
<main id="main" class="lost">${wordmark()}<h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--dark" href="/"><span>Naar de homepage</span>${icon.arrow}</a></main>
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
