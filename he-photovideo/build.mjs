// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const C = site.contact;
const ig = `https://www.instagram.com/${C.instagram}/`;
const img = (n) => `/assets/img/${n}.webp`;
const year = new Date().getFullYear();
const pad = (n) => String(n).padStart(2, '0');

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5Z" fill="currentColor"/></svg>',
  cam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h3l1.6-2.2h6.8L17 7.5h3v11H4Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="12.8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  film: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m16 10.5 5-3v9l-5-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
};
const cta = (label, cls = 'btn btn--light', occ = '') => `<a class="${cls}" href="#aanvraag"${occ ? ` data-occ="${occ}"` : ''}><span>${label}</span>${icon.arrow}</a>`;

const head = (title) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="HE Photovideo uit Rotterdam: fotografie en videografie voor bruiloft, henna en verloving. Bekijk het portfolio en de films en check direct jullie datum.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0b0b">
<link rel="icon" href="/assets/img/icon.png" type="image/png">
<link rel="preload" href="/assets/fonts/bodoni-moda.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/app.js" defer></script>
</head>`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="#top" aria-label="HE Photovideo, naar boven"><img src="/assets/img/logo-wit.png" alt="" width="60" height="62"></a>
  <nav class="masthead__nav" aria-label="Hoofdmenu"><a href="#portfolio">Portfolio</a><a href="#films">Films</a><a href="#pakketten">Pakketten</a><a href="#werkwijze">Werkwijze</a></nav>
  ${cta('Check jullie datum', 'btn btn--sm btn--light masthead__cta')}
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="tunnel" aria-hidden="true"><div class="tunnel__cam" data-tunnel>${site.tunnel.map((n, i) => `<figure class="frame" style="--i:${i}"><img src="${img(n)}" alt=""${i > 3 ? ' loading="lazy"' : ''}></figure>`).join('')}</div></div>
    <div class="viewfinder" aria-hidden="true"><i class="vf vf--tl"></i><i class="vf vf--tr"></i><i class="vf vf--bl"></i><i class="vf vf--br"></i>
      <span class="vf__rec"><b></b>REC <span data-timecode>00:00:00:00</span></span><span class="vf__meta">4K · 25 fps · ISO 400</span><span class="vf__mode" data-mode><span class="on">PHOTO</span> / <span>VIDEO</span></span><i class="vf__focus"></i></div>
    <div class="hero__copy">
      <p class="eyebrow">${icon.pin}Wedding · Henna · Engagement · ${site.city}</p>
      <h1 class="hero__title"><span class="line"><span>Jullie verhaal,</span></span> <span class="line"><span>in beeld <em>en film.</em></span></span></h1>
      <p class="hero__lead">Fotografie en videografie in één team. Strak, tijdloos en vaak in zwart-wit, zoals jullie het op Instagram kennen.</p>
      <div class="hero__actions">${cta('Check jullie datum', 'btn btn--light magnetic')}<a class="btn btn--line magnetic" href="#films">${icon.play}<span>Bekijk de films</span></a></div>
    </div>
    <p class="hero__hint" aria-hidden="true">Scroll</p>
  </div>
</section>`;

const mItems = ['Photography', 'Videography', 'Wedding', 'Henna', 'Engagement', 'Rotterdam'];
const marquee = `<div class="marquee"><p class="sr-only">${mItems.join(' · ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${mItems.map((t) => `${t}<i></i>`).join('')}</span>`).join('')}</div></div>`;

const about = `<section class="section about" aria-labelledby="over-titel">
  <div class="wrap about__grid">
    <figure class="about__img reveal tilt"><img src="${img('team')}" alt="Het team van HE Photovideo" loading="lazy"><figcaption>Het HE-team</figcaption></figure>
    <div class="about__copy">
      <p class="eyebrow">Over HE</p>
      <h2 class="title" id="over-titel">Twee camera’s, <em>één blik.</em></h2>
      <p class="about__text" data-words>Wij leggen jullie dag vast zoals hij voelde. Geen geposeerde plaatjes, maar echte momenten in een strakke, tijdloze stijl. Foto en video komen van hetzelfde team, dus alles klopt: van de eerste blik tot de laatste dans.</p>
      <dl class="stats"><div><dt>Berichten</dt><dd data-count="${site.stats.posts}">${site.stats.posts}</dd></div><div><dt>Volgers</dt><dd>${site.stats.followers}</dd></div><div><dt>Gelegenheden</dt><dd>3</dd></div></dl>
    </div>
  </div>
</section>`;

const portfolio = `<section class="section pf" id="portfolio" aria-labelledby="pf-titel">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Portfolio</p><h2 class="title" id="pf-titel">Per <em>gelegenheid.</em></h2></div>
    <div class="tabs" role="tablist" aria-label="Kies een gelegenheid">${site.occasions.map((o, i) => `<button class="tab" type="button" role="tab" id="tab-${o.id}" aria-controls="panel-${o.id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''} data-tab="${o.id}"><span class="tab__n">${pad(i + 1)}</span>${o.name}<small>${o.photos.length}</small></button>`).join('')}</div>
    ${site.occasions.map((o, i) => `<div class="panel" role="tabpanel" id="panel-${o.id}" aria-labelledby="tab-${o.id}" data-panel="${o.id}"${i ? ' hidden' : ''}>
      <div class="panel__intro"><p class="panel__en">${o.en}</p><p class="panel__lead">${esc(o.lead)}</p>${cta(`${o.name} aanvragen`, 'btn btn--sm btn--line', o.id)}</div>
      <div class="flow" data-flow tabindex="0" aria-roledescription="carrousel" aria-label="${o.name}: foto’s">
        <ul class="flow__track">${o.photos.map(([n, alt], j) => `<li class="flow__item" style="--j:${j}"><button class="flow__card" type="button" data-zoom="${img(n)}" data-label="${esc(alt)}" aria-label="Vergroot: ${esc(alt)}"><img src="${img(n)}" alt="${esc(alt)}" loading="lazy"></button></li>`).join('')}</ul>
      </div>
      <div class="flow__bar"><button class="round" type="button" data-flow-prev aria-label="Vorige foto">${icon.arrowL}</button><p class="flow__count" aria-live="polite"><b data-flow-i>01</b> / ${pad(o.photos.length)}</p><button class="round" type="button" data-flow-next aria-label="Volgende foto">${icon.arrow}</button></div>
    </div>`).join('\n    ')}
    <p class="pf__more"><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}Alle ${site.stats.posts} posts op Instagram</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lightbox-img><figcaption data-lightbox-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Vorige">${icon.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Volgende">${icon.arrow}</button>
  <button class="lightbox__close" type="button" data-lightbox-close aria-label="Sluiten">${icon.close}</button>
</dialog>`;

const [hero1, ...restFilms] = site.films;
const films = `<section class="section films" id="films" aria-labelledby="films-titel">
  <div class="wrap">
    <div class="section__head section__head--split"><div><p class="eyebrow">Foto én video</p><h2 class="title" id="films-titel">Onze beste <em>films.</em></h2></div>
      <p class="section__lead">Een foto bewaart het moment, een film laat het opnieuw voelen. Bij HE krijgen jullie allebei, van hetzelfde team en in dezelfde stijl.</p></div>
    <div class="duo reveal" data-duo>
      <figure class="duo__card duo__card--photo"><img src="${img('kerk-wandel')}" alt="Foto: bruidspaar loopt door de kerk" loading="lazy"><figcaption>${icon.cam}Foto</figcaption></figure>
      <figure class="duo__card duo__card--film"><img src="${img('sluier-blik')}" alt="Filmstill: bruid en bruidegom kijken elkaar aan" loading="lazy"><span class="duo__bars"></span><figcaption>${icon.film}Film</figcaption></figure>
    </div>
    <button class="feature reveal" type="button" data-film="${img(hero1.img)}" data-title="${esc(hero1.title)}" data-kind="${hero1.kind}">
      <img src="${img(hero1.img)}" alt="" loading="lazy"><span class="feature__shade"></span>
      <span class="feature__play">${icon.play}</span>
      <span class="feature__txt"><small>${hero1.kind} · uitgelicht</small><b>${esc(hero1.title)}</b></span>
    </button>
    <div class="strip" data-strip><ul class="strip__track" data-strip-track>${restFilms.map((f, i) => `<li class="reel reveal" style="--d:${i * 0.07}s"><button type="button" data-film="${img(f.img)}" data-title="${esc(f.title)}" data-kind="${f.kind}"><img src="${img(f.img)}" alt="" loading="lazy"><span class="reel__play">${icon.play}</span><span class="reel__txt"><small>${f.kind}</small>${esc(f.title)}</span></button></li>`).join('')}</ul></div>
    <p class="films__note">Preview: de films spelen hier straks in volle kwaliteit. Nu staan ze op <a class="link" href="${ig}reels/" target="_blank" rel="noopener">Instagram Reels</a>.</p>
  </div>
</section>
<dialog class="player" data-player aria-labelledby="player-title">
  <div class="player__screen"><img alt="" data-player-img><span class="player__grain"></span>
    <p class="player__badge">Voorbeeld · hier speelt straks de film</p></div>
  <div class="player__ui"><button class="round round--light" type="button" data-player-toggle aria-label="Pauzeer">${icon.play}</button><div class="player__bar"><i data-player-bar></i></div><span class="player__time" data-player-time>0:00 / 0:30</span></div>
  <p class="player__title"><small data-player-kind></small><b id="player-title" data-player-title></b></p>
  <a class="btn btn--sm btn--light player__ig" href="${ig}reels/" target="_blank" rel="noopener">${icon.ig}<span>Bekijk op Instagram</span></a>
  <button class="lightbox__close" type="button" data-player-close aria-label="Sluiten">${icon.close}</button>
</dialog>`;

const packages = `<section class="section pk" id="pakketten" aria-labelledby="pk-titel">
  <div class="wrap">
    <div class="section__head section__head--center"><p class="eyebrow">Pakketten</p><h2 class="title" id="pk-titel">Foto, video <em>of allebei.</em></h2></div>
    <ul class="pk__grid">${site.packages.map((p, i) => `<li class="pkg reveal tilt${p.id === 'beide' ? ' pkg--main' : ''}" style="--d:${i * 0.08}s">
      <p class="pkg__icon">${p.id === 'foto' ? icon.cam : p.id === 'video' ? icon.film : icon.cam + icon.film}</p>
      <h3>${p.name}</h3><p class="pkg__desc">${esc(p.desc)}</p>
      <ul>${p.items.map((t) => `<li>${icon.check}${esc(t)}</li>`).join('')}</ul>
      <p class="pkg__price">Prijs op aanvraag</p>
      <a class="btn btn--sm ${p.id === 'beide' ? 'btn--light' : 'btn--line'}" href="#aanvraag" data-pkg="${p.id}"><span>Kies ${p.name.toLowerCase()}</span>${icon.arrow}</a>
    </li>`).join('')}</ul>
  </div>
</section>`;

const steps = `<section class="section steps" id="werkwijze" aria-labelledby="ww-titel">
  <div class="wrap">
    <div class="section__head"><p class="eyebrow">Werkwijze</p><h2 class="title" id="ww-titel">Van aanvraag <em>tot album.</em></h2></div>
    <ol class="steps__row">${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${pad(i + 1)}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('')}</ol>
  </div>
</section>`;

const request = `<section class="section req" id="aanvraag" aria-labelledby="req-titel">
  <div class="wrap req__grid">
    <div class="req__side">
      <p class="eyebrow">Aanvraag</p>
      <h2 class="title" id="req-titel">Is jullie datum <em>nog vrij?</em></h2>
      <p class="section__lead">Kies jullie datum en zie meteen of we nog beschikbaar zijn. Vul daarna in wat jullie zoeken: jullie aanvraag komt compleet bij ons binnen, zonder eerst heen en weer te DM’en.</p>
      <div class="cal" data-cal>
        <div class="cal__head"><button class="round" type="button" data-cal-prev aria-label="Vorige maand">${icon.arrowL}</button><p class="cal__month" data-cal-month aria-live="polite"></p><button class="round" type="button" data-cal-next aria-label="Volgende maand">${icon.arrow}</button></div>
        <div class="cal__dow" aria-hidden="true">${['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map((d) => `<span>${d}</span>`).join('')}</div>
        <div class="cal__grid" data-cal-grid role="group" aria-label="Kies een datum"></div>
        <p class="cal__legend"><span><i class="free"></i>Vrij</span><span><i class="few"></i>Nog 1 plek</span><span><i class="full"></i>Volgeboekt</span></p>
      </div>
    </div>
    <form class="form" data-form data-wa="${C.whatsapp}" data-ig="${C.instagram}" novalidate>
      <div class="form__date" data-date-out><span>Jullie datum</span><b>Nog geen datum gekozen</b></div>
      <input type="hidden" name="date" data-date-input>
      <fieldset class="field"><legend>Gelegenheid</legend><div class="chips">${site.occasions.map((o, i) => `<label><input type="radio" name="occasion" value="${o.id}"${i === 0 ? ' checked' : ''}><span>${o.name}</span></label>`).join('')}</div></fieldset>
      <fieldset class="field"><legend>Wat zoeken jullie?</legend><div class="chips">${site.packages.map((p) => `<label><input type="radio" name="package" value="${p.id}"${p.id === 'beide' ? ' checked' : ''}><span>${p.name}</span></label>`).join('')}</div></fieldset>
      <div class="field-row"><label class="field"><span>Locatie of zaal</span><input name="venue" placeholder="Bijv. de naam van de zaal" required></label><label class="field"><span>Plaats</span><input name="place" placeholder="Bijv. Rotterdam" required></label></div>
      <div class="field-row"><label class="field"><span>Jullie namen</span><input name="name" autocomplete="name" placeholder="Bijv. Sara & Yusuf" required></label><label class="field"><span>Telefoon</span><input name="phone" type="tel" autocomplete="tel" placeholder="06 12345678" required></label></div>
      <label class="field"><span>Iets wat we moeten weten? <small>(optioneel)</small></span><textarea name="note" rows="2" placeholder="Bijv. kerk om 13:00, feest vanaf 18:00"></textarea></label>
      <div class="preview"><span>Jullie aanvraag</span><p data-preview></p></div>
      <p class="form__error" data-error role="alert"></p>
      <button class="btn btn--light btn--full" type="submit" data-send>${C.whatsapp ? icon.wa : icon.arrow}<span>Verstuur aanvraag</span></button>
      <p class="form__fine">${C.whatsapp ? 'WhatsApp opent met jullie aanvraag al ingevuld.' : 'Jullie aanvraag wordt gekopieerd en Instagram opent: plakken en versturen.'} De datum staat pas vast na onze bevestiging. Beschikbaarheid in deze preview is een voorbeeld.</p>
    </form>
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    <img class="footer__logo" src="/assets/img/logo-wit.png" alt="HE Photovideo" width="120" height="124" loading="lazy">
    <p>Photography &amp; Videography · Wedding · Henna · Engagement<br>${site.city}, Nederland</p>
    <nav aria-label="Footer"><a href="${ig}" target="_blank" rel="noopener">Instagram</a><a href="#portfolio">Portfolio</a><a href="#films">Films</a><a href="#aanvraag">Aanvraag</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Concept · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="#aanvraag">${icon.cam}<span>Check jullie datum</span></a>`;

const index = `${head(`${site.name} · Fotografie & videografie · Bruiloft, henna, verloving · ${site.city}`)}
<body>
${header}
<main id="main">
${hero}
${marquee}
${about}
${portfolio}
${films}
${packages}
${steps}
${request}
</main>
${footer}
<script type="application/json" id="he-data">${JSON.stringify({ occasions: Object.fromEntries(site.occasions.map((o) => [o.id, o.name])), packages: Object.fromEntries(site.packages.map((p) => [p.id, p.name])) })}</script>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', `${head('Pagina niet gevonden')}<body><main class="lost"><img src="/assets/img/logo-wit.png" alt="HE Photovideo" width="120" height="124"><h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--light" href="/"><span>Naar de homepage</span></a></main></body></html>\n`);
await writeFile('public/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log('public/ gebouwd (concept: noindex)');
