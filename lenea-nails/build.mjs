// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const { contact } = site;
const ig = `https://www.instagram.com/${contact.instagram}/`;
const year = new Date().getFullYear();
const price = (p) => (isTodo(p) ? '<span class="price price--todo" title="Prijs nog in te vullen">op aanvraag</span>' : `<span class="price">${esc(p)}</span>`);

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  cert: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m9.5 9 1.8 1.8L14.8 7.3M8.5 13.8 7 21l5-2.6 5 2.6-1.5-7.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  drop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3.5 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.5 6-11Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const badgeIcons = [icon.cert, icon.drop, icon.pin];

const bookBtn = (label, cls = 'btn btn--dark', pre = '') => site.bookingUrl
  ? `<a class="${cls}" href="${esc(site.bookingUrl)}" target="_blank" rel="noopener"><span>${label}</span>${icon.arrow}</a>`
  : `<a class="${cls}" href="#afspraak" data-book${pre ? ` data-pre="${esc(pre)}"` : ''}><span>${label}</span>${icon.arrow}</a>`;
const logo = (cls = '') => `<span class="logo ${cls}" role="img" aria-label="Lenéa nails"></span>`;

const head = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${site.name} · Gelnagels &amp; nail art in ${site.city}</title>
<meta name="description" content="Lenéa nails in Enschede: gecertificeerd nail tech, gelnagels met NN Gel, French en nail art. Bekijk het werk en vraag direct je afspraak aan.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}${!isTodo(site.url) ? `<link rel="canonical" href="${site.url}/">\n` : ''}<meta name="theme-color" content="#f4ede5">
<meta property="og:title" content="${site.name} · ${site.city}">
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
  <a class="masthead__brand" href="#top" aria-label="Lenéa nails, naar boven">${logo()}</a>
  <nav class="masthead__nav" aria-label="Hoofdmenu">
    <a href="#werk">Werk</a>
    <a href="#behandelingen">Behandelingen</a>
    <a href="#werkwijze">Werkwijze</a>
  </nav>
  ${bookBtn('Afspraak', 'btn btn--sm btn--dark masthead__cta')}
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__orb hero__orb--a"></span><span class="hero__orb hero__orb--b"></span></div>
    <div class="hero__stage" aria-hidden="true">
      <canvas class="hero__canvas" data-nails></canvas>
      <div class="hero__fallback">${['#f2e4e1', '#e9c9c2', '#8e1b2a', '#6d7a4a', '#5a3d31'].map((c, i) => `<i style="--c:${c};--i:${i}"></i>`).join('')}</div>
      <span class="hero__shadow"></span>
    </div>
    <div class="hero__copy">
      <p class="eyebrow">${site.name} · ${site.city}</p>
      <h1 class="hero__title"><span class="line"><span>Nagels,</span></span> <span class="line"><em>zo verfijnd</em></span> <span class="line"><em>als jij.</em></span></h1>
      <p class="hero__lead">Gecertificeerd nail tech. Gelnagels met NN Gel, van clean &amp; milky tot nail art met karakter.</p>
      <div class="hero__actions">${bookBtn('Boek je afspraak', 'btn btn--dark magnetic')}<a class="btn btn--line magnetic" href="#werk"><span>Bekijk mijn werk</span></a></div>
    </div>
    <ol class="hero__swatches" aria-hidden="true">${['Milky', 'Soft french', 'Cherry', 'Olive chrome', 'Mocha leopard'].map((n, i) => `<li style="--i:${i}">${n}</li>`).join('')}</ol>
    <p class="hero__scroll" aria-hidden="true"><span>Scroll</span><i></i></p>
  </div>
</section>`;

const marqueeItems = ['Milky nails', 'French', 'Nail art', 'Chrome', 'Leopard', 'Polka dots', 'NN Gel', 'Certified nail tech'];
const marquee = `<div class="marquee"><p class="sr-only">${marqueeItems.join(' · ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${marqueeItems.map((t) => `${t}<i>◇</i>`).join('')}</span>`).join('')}</div></div>`;

const intro = `<section class="section intro" aria-labelledby="intro-titel">
  <div class="wrap intro__grid">
    <div>
      <p class="eyebrow">Over Lenéa</p>
      <h2 class="title" id="intro-titel">Clean. Chic. <em>Precies.</em></h2>
      <p class="intro__text" data-words>Elke set begint bij jouw handen: de vorm die je flatteert, de kleur die bij je past, en details die het verschil maken. Van een perfecte milky set tot nail art die opvalt.</p>
    </div>
    <ul class="badges">
      ${site.badges.map((b, i) => `<li class="badge tilt reveal" style="--d:${i * 0.08}s">${badgeIcons[i]}<b>${esc(b.t)}</b><span>${esc(b.d)}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const work = `<section class="section work" id="werk" aria-labelledby="werk-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div>
        <p class="eyebrow">Werk</p>
        <h2 class="title" id="werk-titel">Mijn <em>sets.</em></h2>
      </div>
      <div class="filters" role="group" aria-label="Filter op stijl">
        ${site.filters.map((f, i) => `<button class="filter" type="button" data-filter="${f.id}" aria-pressed="${i === 0}">${f.name}</button>`).join('')}
      </div>
    </div>
    <ul class="grid" data-grid>
      ${site.work.map((w, i) => `<li class="card reveal" data-cat="${w.cat}" style="--d:${(i % 3) * 0.06}s">
        <button class="card__btn tilt" type="button" data-zoom="/assets/img/${w.img}.webp" data-label="${esc(w.label)}" aria-label="Vergroot: ${esc(w.label)}">
          <img src="/assets/img/${w.img}.webp" alt="${esc(w.label)}, nagels door Lenéa nails" width="392" height="520" loading="${i < 6 ? 'eager' : 'lazy'}">
          <span class="card__label">${esc(w.label)}</span><span class="card__shine" aria-hidden="true"></span>
        </button>
      </li>`).join('\n      ')}
    </ul>
    <p class="work__more"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}Meer op Instagram @${contact.instagram}</a></p>
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
      <h2 class="title" id="behandelingen-titel">Kies je <em>set.</em></h2>
      <figure class="services__photo reveal"><img src="/assets/img/milky-amandel.webp" alt="Milky white amandelnagels" width="392" height="520" loading="lazy"></figure>
    </div>
    <ul class="menu">
      ${site.services.map((s, i) => `<li class="menu__item reveal" style="--d:${i * 0.05}s">
        <span class="menu__n">0${i + 1}</span>
        <div class="menu__text"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div>
        ${price(s.price)}
        ${bookBtn('Boek', 'menu__book', s.name)}
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const steps = `<section class="section steps" id="werkwijze" aria-labelledby="werkwijze-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow">Werkwijze</p>
      <h2 class="title" id="werkwijze-titel">Zo gaat het <em>in z’n werk.</em></h2>
    </div>
    <ol class="steps__row" data-steps>
      ${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const feature = `<section class="feature" aria-label="NN Gel">
  <div class="feature__media" aria-hidden="true">
    <img class="reveal-img" data-parallax=".06" src="/assets/img/olijf-chrome-leopard.webp" alt="" loading="lazy">
    <img class="reveal-img" data-parallax="-.05" src="/assets/img/polka-dots.webp" alt="" loading="lazy">
    <img class="reveal-img" data-parallax=".04" src="/assets/img/rood-sterren-leopard.webp" alt="" loading="lazy">
  </div>
  <div class="wrap feature__copy">
    <p class="eyebrow">Certified nail tech · NN Gel</p>
    <p class="feature__quote">Mooie nagels zitten in <em>de details.</em></p>
  </div>
</section>`;

const booking = `<section class="section book" id="afspraak" aria-labelledby="afspraak-titel">
  <div class="wrap book__grid">
    <div>
      <p class="eyebrow">Afspraak</p>
      <h2 class="title" id="afspraak-titel">Boek je <em>moment.</em></h2>
      <p class="section__lead">Kies je behandeling en voorkeur. ${site.bookingUrl ? 'Je gaat direct door naar de agenda.' : 'Je aanvraag wordt klaargezet als bericht; Lenéa bevestigt je afspraak persoonlijk.'}</p>
      <p class="book__ig"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}@${contact.instagram}</a></p>
    </div>
    ${site.bookingUrl ? `<div class="book__card">${bookBtn('Open de agenda', 'btn btn--dark btn--block')}</div>` : `<form class="book__card" data-book-form novalidate>
      <label class="field"><span>Behandeling</span>
        <select name="treatment" required><option value="">Kies…</option>${site.services.map((s) => `<option>${esc(s.name)}</option>`).join('')}</select>
      </label>
      <fieldset class="field"><legend>Vorm</legend><div class="chips">${['Amandel', 'Squoval', 'Kort', 'Weet ik nog niet'].map((d, i) => `<label><input type="radio" name="shape" value="${d}"${i === 3 ? ' checked' : ''}><span>${d}</span></label>`).join('')}</div></fieldset>
      <fieldset class="field"><legend>Voorkeursdag</legend><div class="chips chips--days" data-days></div></fieldset>
      <fieldset class="field"><legend>Dagdeel</legend><div class="chips">${['Ochtend', 'Middag', 'Avond', 'Maakt niet uit'].map((d, i) => `<label><input type="radio" name="part" value="${d}"${i === 3 ? ' checked' : ''}><span>${d}</span></label>`).join('')}</div></fieldset>
      <div class="field-row">
        <label class="field"><span>Je naam</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Inspiratie <small>(optioneel)</small></span><input name="note" placeholder="Bijv. milky met leopard tips"></label>
      </div>
      <div class="book__preview"><span>Je bericht</span><p data-book-preview>Kies een behandeling…</p></div>
      <p class="book__error" data-book-error role="alert"></p>
      <button class="btn btn--dark btn--block" type="submit">${icon.send}<span>Kopieer &amp; open Instagram</span></button>
      <p class="book__fine">Je bericht wordt gekopieerd. Plak het in de DM die opent.</p>
    </form>`}
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    ${logo('logo--footer')}
    <p>Certified nail tech · NN Gel<br>${site.city}${isTodo(contact.address) ? '' : `, ${esc(contact.address)}`}</p>
    <nav aria-label="Footer"><a href="#werk">Werk</a><a href="#behandelingen">Behandelingen</a><a href="#afspraak">Afspraak</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Geen cookies, geen trackers.</p>
  </div>
</footer>
${bookBtn('Afspraak', 'dock')}`.replace('class="dock"', 'class="dock" data-dock');

const index = `${head}
${header}
<main id="main">
${hero}
${marquee}
${intro}
${work}
${feature}
${services}
${steps}
${booking}
</main>
${footer}
</body>
</html>
`;

const notFound = `${head}
${header}
<main id="main" class="lost">
  ${logo('logo--lost')}
  <h1 class="title">Deze pagina <em>bestaat niet.</em></h1>
  <a class="btn btn--dark" href="/"><span>Naar de homepage</span>${icon.arrow}</a>
</main>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', notFound.replace(/href="#(top|werk|behandelingen|werkwijze|afspraak)"/g, 'href="/#$1"'));
await writeFile('public/robots.txt', site.draft || isTodo(site.url) ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''}`);
