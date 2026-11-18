// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const val = (v, fallback) => (isTodo(v) ? fallback : esc(v));
const { contact, academy: A } = site;
const ig = `https://www.instagram.com/${contact.instagram}/`;
const dm = `https://ig.me/m/${contact.instagram}`;
const year = new Date().getFullYear();
const price = (p) => (isTodo(p) ? '<span class="price price--todo" title="Prijs nog in te vullen">op aanvraag</span>' : `<span class="price">${esc(p)}</span>`);

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.4C1.5 7.3 3.7 4 7.1 4c2 0 3.7 1.1 4.9 2.8C13.2 5.1 14.9 4 16.9 4c3.4 0 5.6 3.3 4.4 6.6C19.5 15.4 12 20 12 20Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12l3 5-9 11L3 9l3-5Zm-3 5h18M9 4l3 16 3-16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  lotus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19c-4 0-8-2.5-9-6 3 0 5.5 1 7 3m2 3c4 0 8-2.5 9-6-3 0-5.5 1-7 3m-2 3c-2.5-2-3.5-5-3.5-8S10 6 12 4c2 2 3.5 4 3.5 7s-1 6-3.5 8Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  cap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v5c2 2 10 2 12 0v-5M22 9v6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  shapes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c3-4 6-5 9-5s6 1 9 5c-3 2-6 3-9 3s-6-1-9-3Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 16c3 2 6 3 9 3s6-1 9-3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V14m5 6V10m5 10V12m5 8V6M3 20h18M14 7l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6m1-13a3 3 0 0 1 0 6m2 7c0-2.5-1.3-4.5-3-5.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
};
const moduleIcons = [icon.cap, icon.eye, icon.shapes, icon.chart, icon.shield, icon.heart];
const uspIcons = [icon.diamond, icon.heart, icon.star, icon.lotus];

const head = ({ title, desc, path, page }) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}${!isTodo(site.url) ? `<link rel="canonical" href="${site.url}${path}">\n` : ''}<meta name="theme-color" content="#16110e">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/bodoni-moda.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/main.js" defer></script>
</head>
<body data-page="${page}">`;

const logo = (cls = '') => `<span class="logo ${cls}" role="img" aria-label="Studio Nazz, aesthetics and academy"></span>`;
const bookBtn = (label, cls = 'btn btn--gold', pre = '') => site.bookingUrl
  ? `<a class="${cls}" href="${esc(site.bookingUrl)}" target="_blank" rel="noopener"><span>${label}</span>${icon.arrow}</a>`
  : `<button class="${cls}" type="button" data-book${pre ? ` data-pre="${esc(pre)}"` : ''}><span>${label}</span>${icon.arrow}</button>`;

const header = (page) => `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="/" aria-label="Studio Nazz, naar de homepage">${logo()}</a>
  <nav class="masthead__nav" aria-label="Hoofdmenu">
    <a href="/#behandelingen">Behandelingen</a>
    <a href="/#portfolio">Portfolio</a>
    <a href="/#academy">Academy</a>
    <a href="/#bring-a-friend">Acties</a>
  </nav>
  ${bookBtn('Boek nu', 'btn btn--sm btn--light masthead__cta')}
</header>`;

const fanHero = ({ eyebrow, title, lead, actions, variant }) => `<section class="hero hero--${variant}" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__glow"></span><span class="hero__grain"></span></div>
    <canvas class="hero__canvas" data-fan="${variant}" aria-hidden="true"></canvas>
    <div class="hero__copy">
      <p class="eyebrow eyebrow--light">${eyebrow}</p>
      <h1 class="hero__title">${title}</h1>
      <p class="hero__lead">${lead}</p>
      <div class="hero__actions">${actions}</div>
    </div>
    <div class="hero__after" aria-hidden="true"><p>${variant === 'home' ? 'Elke wimper <em>met de hand gezet.</em>' : 'Jouw talent, <em>jouw toekomst.</em>'}</p></div>
    <p class="hero__script" aria-hidden="true">${variant === 'home' ? 'Good lashes, brighter days' : 'Same lashes, bigger opportunities'}</p>
    <p class="hero__scroll" aria-hidden="true"><span>Scroll</span><i></i></p>
  </div>
</section>`;

const marquee = (items) => `<div class="marquee"><p class="sr-only">${esc(items.join(' · '))}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${items.map((t) => `${esc(t)}<i>✦</i>`).join('')}</span>`).join('')}</div></div>`;

// ── home ────────────────────────────────────────────────────────────────────
const intro = `<section class="section intro" aria-labelledby="intro-titel">
  <div class="wrap intro__grid">
    <div>
      <p class="eyebrow">Studio Nazz</p>
      <h2 class="sr-only" id="intro-titel">Over Studio Nazz</h2>
      <p class="intro__text" data-words>Lashes, brows en skin, met oog voor detail. Elke behandeling begint bij jou: je oogvorm, je huid, jouw stijl. Het resultaat is natuurlijk en luxe, precies zoals jij het wilt.</p>
    </div>
    <div class="intro__side">
      <figure class="intro__photo tilt reveal"><img src="/assets/img/russian-volume-groot-2.webp" alt="Volle Russian volume-wimpers en strakke brows" width="1206" height="1088" loading="lazy"></figure>
      <div class="seal reveal" style="--d:.15s">
        <svg class="seal__ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs><text><textPath href="#ring">GECERTIFICEERD · DIPLOMA’S &amp; CERTIFICATEN · GECERTIFICEERD · </textPath></text></svg>
        <span class="seal__mark">SN</span>
      </div>
      <p class="intro__cert reveal" style="--d:.2s">${icon.check}${esc(site.certified)}</p>
    </div>
  </div>
  <ul class="wrap usps">${site.usps.map((u, i) => `<li class="reveal" style="--d:${i * 0.07}s">${uspIcons[i]}<span>${esc(u)}</span></li>`).join('')}</ul>
</section>`;

const treatments = `<section class="section treatments" id="behandelingen" aria-labelledby="behandelingen-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div>
        <p class="eyebrow">Behandelingen</p>
        <h2 class="title" id="behandelingen-titel">Alles voor je <em>look.</em></h2>
      </div>
      <div class="tabs" role="tablist" aria-label="Categorieën">
        ${site.categories.map((c, i) => `<button class="tab" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" type="button">${c.name}<small>${c.items.length}</small></button>`).join('')}
        <span class="tabs__ink" aria-hidden="true"></span>
      </div>
    </div>
    ${site.categories.map((c, i) => `<div class="panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}"${i ? ' data-later' : ''}>
      <figure class="panel__media tilt"><img src="/assets/img/${c.image}.webp" alt="" width="394" height="527" loading="lazy"><figcaption><span class="script">${c.name}</span></figcaption></figure>
      <div class="panel__body">
        <p class="panel__lead">${esc(c.lead)}</p>
        <ul class="menu">
          ${c.items.map((t) => `<li class="menu__item">
            <div class="menu__text"><h3>${esc(t.name)}</h3>${isTodo(t.desc) ? '<p class="todo">Omschrijving volgt</p>' : `<p>${esc(t.desc)}</p>`}</div>
            ${price(t.price)}
            ${site.bookingUrl ? '' : `<button class="menu__book" type="button" data-book data-pre="${esc(t.name)}" aria-label="Boek ${esc(t.name)}">${icon.arrow}</button>`}
          </li>`).join('\n          ')}
        </ul>
      </div>
    </div>`).join('\n    ')}
  </div>
</section>`;

const portfolio = `<section class="section portfolio" id="portfolio" aria-labelledby="portfolio-titel">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow eyebrow--light">Portfolio</p>
      <h2 class="title title--light" id="portfolio-titel">Lash <em>love.</em></h2>
      <p class="section__lead">Een greep uit het werk van de studio. Elke set is handwerk, gemapt op de oogvorm van de klant.</p>
    </div>
  </div>
  <div class="gallery" data-gallery>
    <div class="gallery__track" data-gallery-track tabindex="0" role="region" aria-label="Portfolio, horizontaal scrollen">
      ${site.portfolio.map((p, i) => `<figure class="shot${p.wide ? ' shot--wide' : ''}" style="--i:${i}"><img src="/assets/img/${p.img}.webp" alt="${esc(p.label)} door Studio Nazz" loading="${i < 4 ? 'eager' : 'lazy'}"><figcaption>${esc(p.label)}</figcaption></figure>`).join('\n      ')}
    </div>
  </div>
</section>`;

const browCompare = `<section class="section brows" aria-labelledby="brows-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow">Brow tint</p>
      <h2 class="title" id="brows-titel">Voor <em>&amp;</em> na.</h2>
      <p class="section__lead">Sleep over de foto en zie wat een brow tint doet.</p>
    </div>
    <div class="brows__list">
      ${site.brows.map((n, i) => `<figure class="compare reveal" style="--d:${i * 0.08}s" data-compare>
        <div class="compare__media">
          <img src="/assets/img/brow-${n}-na.webp" alt="" width="1200" height="470" loading="lazy">
          <div class="compare__before"><img src="/assets/img/brow-${n}-voor.webp" alt="" width="1200" height="470" loading="lazy"></div>
          <span class="compare__tag compare__tag--voor">Voor</span><span class="compare__tag compare__tag--na">Na</span>
          <span class="compare__handle" aria-hidden="true"><i></i></span>
          <input class="compare__range" type="range" min="0" max="100" value="50" aria-label="Vergelijk voor en na, wenkbrauw ${i + 1}">
        </div>
        <figcaption class="sr-only">Wenkbrauw voor en na een brow tint</figcaption>
      </figure>`).join('\n      ')}
    </div>
  </div>
</section>`;

const P = site.promo;
const promo = P.active ? `<section class="promo" id="bring-a-friend" aria-labelledby="promo-titel">
  <div class="promo__bg" aria-hidden="true"></div>
  <div class="wrap promo__inner">
    <p class="promo__flag reveal">We gaan een gekke actie doen!</p>
    <h2 class="promo__title reveal" id="promo-titel"><span>Bring a</span> <em class="script">Friend</em></h2>
    <p class="promo__sub reveal">${esc(P.sub)}</p>
    <div class="promo__cards">
      <article class="coupon tilt reveal"><span class="coupon__icon">${icon.user}</span><p class="coupon__who">Nieuwe klant</p><p class="coupon__amount">€10 <small>korting</small></p><p>${esc(P.newClient.replace('€10 korting ', ''))}</p></article>
      <article class="coupon tilt reveal" style="--d:.1s"><span class="coupon__icon">${icon.users}</span><p class="coupon__who">Bestaande klant</p><p class="coupon__amount">€10 <small>korting</small></p><p>${esc(P.existing.replace('€10 korting ', ''))}</p></article>
    </div>
    ${bookBtn('Boek samen met je vriendin', 'btn btn--gold magnetic', 'Bring a friend: volle wimperset')}
  </div>
</section>` : '';

const academyTeaser = `<section class="section teaser" id="academy" aria-labelledby="teaser-titel">
  <div class="wrap teaser__grid">
    <div class="teaser__stack" aria-hidden="true">
      <img class="teaser__a reveal-img" data-parallax=".05" src="/assets/img/lashlift-behandeling.webp" alt="" loading="lazy">
      <img class="teaser__b reveal-img" data-parallax="-.06" src="/assets/img/volume-spiegel.webp" alt="" loading="lazy">
      <span class="teaser__badge">Academy</span>
    </div>
    <div>
      <p class="eyebrow">Studio Nazz Academy</p>
      <h2 class="title" id="teaser-titel">Leer het vak van <em>de praktijk.</em></h2>
      <p class="section__lead">${esc(A.intro)}</p>
      <ul class="ticks">${['1-op-1 en groepscursussen', 'Starterspakket inbegrepen', 'Certificaat na afronding', 'Nazorg en blijvende ondersteuning'].map((t) => `<li>${icon.check}${t}</li>`).join('')}</ul>
      <div class="hero__actions" style="margin-top:0">${bookBtn('Schrijf je in', 'btn btn--dark magnetic', `Cursus: ${A.courses[0].name}`)}<a class="btn btn--line magnetic" href="#cursussen"><span>Bekijk cursussen</span>${icon.arrow}</a></div>
    </div>
  </div>
</section>`;

const ctaBlock = (title, text, action) => `<section class="cta" aria-labelledby="cta-titel">
  <div class="cta__glow" aria-hidden="true"></div>
  <div class="wrap cta__inner">
    ${logo('logo--big')}
    <h2 class="title title--light title--xl" id="cta-titel">${title}</h2>
    <p class="section__lead">${text}</p>
    <div class="cta__actions">${action}<a class="btn btn--ghost magnetic" href="${ig}" target="_blank" rel="noopener">${icon.ig}<span>@${contact.instagram}</span></a></div>
  </div>
</section>`;

// ── boekingsvenster (gedeeld) ───────────────────────────────────────────────
const bookingDialog = site.bookingUrl ? '' : `<dialog class="book" id="boek" aria-labelledby="boek-titel">
  <form class="book__form" data-book-form method="dialog" novalidate>
    <header class="book__head">
      <div><p class="eyebrow">Afspraak aanvragen</p><h2 id="boek-titel">Boek bij <em>Studio Nazz</em></h2></div>
      <button class="book__close" type="button" data-book-close aria-label="Sluiten">${icon.close}</button>
    </header>
    <div class="book__body">
      <label class="field"><span>Behandeling of cursus</span>
        <select name="treatment" required>
          <option value="">Kies…</option>
          ${site.categories.map((c) => `<optgroup label="${c.name}">${c.items.map((t) => `<option>${esc(t.name)}</option>`).join('')}</optgroup>`).join('')}
          ${P.active ? '<optgroup label="Actie"><option>Bring a friend: volle wimperset</option></optgroup>' : ''}
          <optgroup label="Academy">${A.courses.map((c) => `<option>Cursus: ${esc(c.name)}</option>`).join('')}</optgroup>
        </select>
      </label>
      <fieldset class="field"><legend>Voorkeursdag</legend><div class="days" data-days></div></fieldset>
      <fieldset class="field"><legend>Dagdeel</legend><div class="chips">${['Ochtend', 'Middag', 'Avond', 'Maakt niet uit'].map((d, i) => `<label><input type="radio" name="part" value="${d}"${i === 3 ? ' checked' : ''}><span>${d}</span></label>`).join('')}</div></fieldset>
      <div class="field-row">
        <label class="field"><span>Je naam</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Opmerking <small>(optioneel)</small></span><input name="note" placeholder="Bijv. eerste keer, of refill"></label>
      </div>
      <div class="book__preview"><p class="eyebrow">Je bericht</p><p data-book-preview>Kies een behandeling…</p></div>
      <p class="book__error" data-book-error role="alert"></p>
    </div>
    <footer class="book__foot">
      <button class="btn btn--gold btn--block" type="submit">${icon.send}<span>Kopieer bericht &amp; open Instagram</span></button>
      <p class="book__fine">Je bericht wordt gekopieerd. Plak het in de DM die opent. Studio Nazz bevestigt je afspraak persoonlijk.</p>
    </footer>
  </form>
</dialog>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    ${logo('logo--light')}
    <div><p class="footer__h">Studio</p><p>${val(site.city, 'Adres volgt')}<br>Afspraak via Instagram</p></div>
    <nav aria-label="Footer"><p class="footer__h">Menu</p><a href="/#behandelingen">Behandelingen</a><a href="/#portfolio">Portfolio</a><a href="/#academy">Academy</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · ${site.tagline} · Geen cookies, geen trackers.</p>
  </div>
</footer>
${site.bookingUrl ? '' : `<button class="dock" type="button" data-book data-dock>${icon.send}<span>Boek nu</span></button>`}`;

const homeHero = fanHero({
  variant: 'home',
  eyebrow: 'Studio Nazz · Aesthetics &amp; academy',
  title: '<span class="line"><span>Good lashes,</span></span> <span class="line"><em>brighter days.</em></span>',
  lead: 'Lashextensions, brows en huidbehandelingen met persoonlijke aandacht. En een academy voor wie het vak zelf wil leren.',
  actions: `${bookBtn('Boek je afspraak', 'btn btn--gold magnetic')}<a class="btn btn--ghost magnetic" href="#behandelingen"><span>Behandelingen</span></a>`,
});


// ── academy ─────────────────────────────────────────────────────────────────

const modules = `<section class="section modules" aria-labelledby="modules-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div><p class="eyebrow">Wat je leert</p><h2 class="title" id="modules-titel">Het hele <em>vak.</em></h2></div>
      <blockquote class="quote reveal"><p>“${esc(A.quote)}”</p></blockquote>
    </div>
    <ol class="modules__grid">
      ${A.modules.map((m, i) => `<li class="module tilt reveal" style="--d:${(i % 3) * 0.07}s"><span class="module__icon">${moduleIcons[i]}</span><span class="module__n">0${i + 1}</span><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const formats = `<section class="section formats" id="cursussen" aria-labelledby="cursussen-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow eyebrow--light">Cursussen</p>
      <h2 class="title title--light" id="cursussen-titel">Kies je <em>manier.</em></h2>
    </div>
    <div class="formats__grid">
      ${A.formats.map((f, i) => `<article class="format tilt reveal${i === 0 ? ' format--featured' : ''}" style="--d:${i * 0.1}s">
        <p class="format__lead">${esc(f.lead)}</p>
        <h3>${esc(f.name)}</h3>
        <p class="format__desc">${esc(f.desc)}</p>
        <ul class="ticks ticks--light">${A.included.map((t) => `<li>${icon.check}${esc(t)}</li>`).join('')}</ul>
        <div class="format__foot">${price(f.price)}${bookBtn('Aanmelden', 'btn btn--gold btn--sm', `Cursus: ${A.courses[0].name} (${f.name})`)}</div>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>`;

const courses = `<section class="section courses" aria-labelledby="private-titel">
  <div class="wrap courses__grid">
    <div>
      <p class="eyebrow">Private courses</p>
      <h2 class="title" id="private-titel">In één of <em>twee dagen</em> gecertificeerd.</h2>
      <p class="section__lead">Word een gecertificeerde lash &amp; brow artist in korte tijd. Na je aanmelding via DM nemen we contact op om een datum te plannen.</p>
      <ul class="perks">${A.perks.map((p) => `<li>${icon.check}${esc(p)}</li>`).join('')}</ul>
    </div>
    <ul class="course-list">
      ${A.courses.map((c, i) => `<li class="course reveal" style="--d:${i * 0.05}s"><span class="course__type">${esc(c.type)}</span><h3>${esc(c.name)}</h3><span class="course__days"><b>${c.days}</b> dag${c.days > 1 ? 'en' : ''}</span>${bookBtn('Aanmelden', 'course__book', `Cursus: ${c.name}`)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const academySteps = `<section class="section steps" aria-labelledby="stappen-titel">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Zo werkt het</p><h2 class="title" id="stappen-titel">Van aanmelding tot <em>certificaat.</em></h2></div>
    <ol class="steps__line" data-steps>
      ${A.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;


const home = `${head({ title: `${site.name} · Lashes, brows & skin · ${site.tagline}`, desc: 'Studio Nazz: lashextensions, lash volume lift, brow threading en lamination, PhiLings, microneedling, plasmapen en facials. Plus een academy met 1-op-1 en groepscursussen.', path: '/', page: 'home' })}
${header('home')}
<main id="main">
${homeHero}
${marquee(['Lashextensions', 'Lash volume lift', 'Brow threading', 'Brow lamination', 'PhiLings', 'Microneedling', 'Plasmapen', 'Facials', 'Powderbrows'])}
${intro}
${treatments}
${portfolio}
${browCompare}
${promo}
${academyTeaser}
${modules}
${formats}
${courses}
${academySteps}
${ctaBlock('Jouw <em>moment.</em>', 'Kies je behandeling en vraag je afspraak aan. Studio Nazz bevestigt persoonlijk.', bookBtn('Boek je afspraak', 'btn btn--gold magnetic'))}
</main>
${footer}
${bookingDialog}
</body>
</html>
`;

const notFound = `${head({ title: `Pagina niet gevonden · ${site.name}`, desc: 'Deze pagina bestaat niet.', path: '/404', page: 'plain' })}
${header('plain')}
<main id="main" class="lost">
  ${logo('logo--lost')}
  <h1 class="title">Deze pagina is <em>verdwenen.</em></h1>
  <a class="btn btn--dark" href="/"><span>Naar de homepage</span>${icon.arrow}</a>
</main>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', home);
await writeFile('public/404.html', notFound);
await writeFile('public/robots.txt', site.draft || isTodo(site.url) ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n`);
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''}`);
