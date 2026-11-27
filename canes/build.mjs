// Bouwt ./public voor Canes Make-up Studio. Gebruik: npm run build
// Bron: Instagram @canesmakeupstudio (profiel, posts, highlights), zie bron/.
// Prijzen, informatie en voorwaarden komen uit de highlights PRIJSLIJST en REGELS!.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

const site = {
  draft: true,
  name: 'Canes Make-up Studio',
  artist: 'Esra Cantekin',
  whatsapp: '31687360399',
  instagram: 'canesmakeupstudio',
  artistIg: 'e.sracantekin',
  locations: ['Delfgauw', 'Enschede'],
  prices: [
    { id: 'makeup', name: 'Make-up', price: 90 },
    { id: 'henna', name: 'Engagement – henna', price: 110 },
    { id: 'shoot', name: 'Photoshoot HD', price: 100 },
    { id: 'bridal-trial', name: 'Bridal package', note: 'Inclusief proefsessie', price: 290, bridal: true },
    { id: 'bridal', name: 'Bridal make-up', note: 'Zonder proefsessie', price: 250, bridal: true },
  ],
  info: [
    'Laat een voorbeeldfoto zien van de make-up look die je wilt.',
    'Weet wat je wilt: de kleur van je blush, lippen en oogschaduw.',
    'Voordat Esra begint, reinigt en primet ze je huid.',
    'Wimperextensions mag je gewoon dragen, je hoeft ze niet te verwijderen.',
    'Een make-up sessie duurt maximaal 1 tot 1,5 uur, afhankelijk van je look. Met wimperextensions 35 tot 40 minuten.',
    'Maak je gezicht goed schoon en kom zonder make-up.',
    'Gebruik vóór de sessie geen gezichtscrème: sommige crèmes gaan pillen.',
    'Gebruik je medicijnen of ben je zwanger? Geef het door. Door hormonen kan make-up anders inwerken, dus Esra kiest dan andere producten en een andere methode.',
    'Heb je allergieën? Laat het weten.',
  ],
  rules: [
    ['Aanbetaling', 'Zonder aanbetaling wordt er geen afspraak gemaakt. Je afspraak staat vast na de aanbetaling.'],
    ['Precies op tijd', 'Kom niet te vroeg en niet te laat. Er is geen wachtruimte, dus kom alleen naar je afspraak.'],
    ['15 minuten te laat', 'Dan wordt je afspraak geannuleerd en ben je de aanbetaling kwijt.'],
    ['Niet komen', 'Kom je niet opdagen? Dan betaal je 100% van het bedrag.'],
    ['Wijzigen', 'Afspraken kun je tot 72 uur van tevoren verzetten naar een andere dag of tijd. Annuleren betekent dat de aanbetaling vervalt.'],
    ['Visagie vooruit gepland', 'Tot 3 maanden voor de datum gratis te wijzigen. Bij annuleren vervalt de aanbetaling.'],
    ['Niet tevreden?', 'Geef het direct aan in de studio. Ben je de deur uit, dan is er geen recht meer op garantie.'],
    ['Foto’s', 'Foto’s worden alleen met jouw toestemming als voorbeeld gebruikt.'],
  ],
  masterclasses: [
    { img: 'mc-huda', place: 'Abu Dhabi & Dubai', year: 2016, with: 'Huda Kattan en Mona Kattan (Huda Beauty)' },
    { img: 'mc-mario', place: 'Londen', year: 2016, with: 'Mario Dedivanovic' },
    { img: 'mc-sirjohn', place: 'Amsterdam', year: 2017, with: 'Sir John, make-up artist van Beyoncé' },
    { img: 'mc-la', place: 'Los Angeles', year: 2019, with: 'Anastasia Soare, Mario Dedivanovic en Kim Kardashian' },
  ],
  hero: ['bruid-lichtjes', 'glam-goud', 'bruid-tiara', 'soft-golf', 'glam-zwart', 'bruid-blond'],
};
const portfolio = {
  bruid: ['bruid-lichtjes', 'bruid-tiara', 'bruid-blond', 'bruid-kant', 'bruid-sluier-blond', 'bruid-vintage', 'bruid-parels', 'bruid-kroon', 'bruid-boeket', 'bruid-goud', 'bruid-haarband', 'bruid-sluier'],
  glam: ['glam-goud', 'glam-zwart', 'glam-luipaard', 'glam-glitter', 'glam-krul', 'glam-stralend', 'glam-nacht', 'glam-bruin', 'glam-koper', 'glam-blauw'],
  soft: ['soft-golf', 'soft-bruin', 'soft-knot', 'soft-donker', 'soft-groen', 'soft-opgestoken', 'soft-lokken', 'soft-krullen', 'soft-satijn'],
  chic: ['chic-blond', 'chic-moeder', 'chic-opgestoken', 'chic-zilver', 'chic-hoed'],
};
const CAT = { bruid: 'Bruid', glam: 'Full glam', soft: 'Soft glam', chic: 'Moeder & gast' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const img = (n) => `/assets/img/${n}.webp`;
const ig = (h) => `https://www.instagram.com/${h}/`;
const pad = (n) => String(n).padStart(2, '0');
const I = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19C5 10 11 5 20 4c0 9-5 15-14 15m0 0 7-7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const logo = (cls = '') => `<span class="logo ${cls}"><span class="logo__name">Canes</span><span class="logo__sub">Make-up studio</span></span>`;
const cta = (label, cls = 'btn btn--ink', attrs = '') => `<a class="${cls}" href="#aanvraag"${attrs}><span>${label}</span>${I.arrow}</a>`;

const head = (title) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="Canes Make-up Studio in Delfgauw en Enschede: luxe bruidsmake-up, henna, glam en photoshoot make-up door Esra Cantekin. Bekijk portfolio en prijzen en vraag direct je datum aan.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#eee4d8">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#e6dccf"/><text x="50" y="62" font-family="Georgia,serif" font-size="34" letter-spacing="2" text-anchor="middle" fill="#7a6a55">C</text></svg>')}">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/app.js" defer></script>
</head>`;

const nav = `<a class="skip" href="#main">Naar de inhoud</a>
<header class="nav" data-nav>
  <a class="nav__brand" href="#top">${logo('logo--sm')}</a>
  <nav class="nav__links" aria-label="Hoofdmenu"><a href="#portfolio">Portfolio</a><a href="#masterclasses">Masterclasses</a><a href="#prijzen">Prijzen</a><a href="#bruid">Bruid</a><a href="#info">Info &amp; regels</a></nav>
  ${cta('Datum aanvragen', 'btn btn--ink btn--sm nav__cta')}
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__copy">
      <p class="eyebrow">${I.pin}${site.locations.join(' · ')}</p>
      <h1 class="hero__title"><span class="ln"><span>Luxe make-up,</span></span> <span class="ln"><span><em>tot in elk detail.</em></span></span></h1>
      <p class="hero__lead">Pro luxury make-up artist ${site.artist}. Bruidsmake-up, henna, glam en photoshoot looks in de studio’s in ${site.locations.join(' en ')}.</p>
      <div class="hero__actions">${cta('Vraag je datum aan', 'btn btn--ink magnetic')}<a class="btn btn--line magnetic" href="#portfolio"><span>Bekijk portfolio</span></a></div>
    </div>
    <div class="scene" aria-hidden="true">
      <div class="floaters">${site.hero.map((n, i) => `<figure class="fl fl--${i}" data-depth="${[0.6, 0.3, 0.9, 0.45, 0.75, 0.35][i]}"><img src="${img(n)}" alt=""></figure>`).join('')}</div>
      <div class="compact" data-compact>
        <div class="compact__base"><span class="compact__pan"></span><span class="compact__ring"></span></div>
        <div class="compact__lid" data-lid>
          <div class="lid lid--out">${logo()}</div>
          <div class="lid lid--in"><img src="${img('esra')}" alt=""><span class="lid__shine"></span></div>
        </div>
      </div>
      <span class="scene__shadow"></span>
    </div>
    <p class="hero__hint" aria-hidden="true">Scroll om te openen</p>
  </div>
</section>`;

const marquee = `<div class="marquee"><p class="sr-only">Bridal · Henna · Glam · Photoshoot HD · Delfgauw · Enschede</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${['Bridal', 'Henna', 'Full glam', 'Soft glam', 'Photoshoot HD', 'Delfgauw', 'Enschede'].map((t) => `${t}<i></i>`).join('')}</span>`).join('')}</div></div>`;

const all = Object.entries(portfolio).flatMap(([cat, list]) => list.map((n) => ({ n, cat })));
const order = [...all].sort((a, b) => (all.indexOf(a) % 12) - (all.indexOf(b) % 12) || all.indexOf(a) - all.indexOf(b));
const portfolioSec = `<section class="section pf" id="portfolio" aria-labelledby="pf-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Portfolio</p><h2 class="title" id="pf-h">Our work <em>of art.</em></h2></div>
      <div class="filters" role="group" aria-label="Filter portfolio"><button class="chip" type="button" data-f="alle" aria-pressed="true">Alles <sup>${all.length}</sup></button>${Object.keys(portfolio).map((k) => `<button class="chip" type="button" data-f="${k}" aria-pressed="false">${CAT[k]} <sup>${portfolio[k].length}</sup></button>`).join('')}</div></div>
    <ul class="grid" data-grid>${order.map(({ n, cat }, i) => `<li class="reveal" data-cat="${cat}" style="--d:${(i % 4) * 0.05}s"><button class="shot tilt" type="button" data-zoom="${img(n)}" data-label="${CAT[cat]}"><img src="${img(n)}" alt="${CAT[cat]} make-up door ${site.artist}" loading="lazy"><span>${CAT[cat]}</span></button></li>`).join('')}</ul>
    <p class="pf__more"><a class="link" href="${ig(site.instagram)}" target="_blank" rel="noopener">${I.ig}Meer op Instagram @${site.instagram}</a></p>
  </div>
</section>
<dialog class="lightbox" data-lightbox aria-label="Foto vergroot">
  <figure><img alt="" data-lb-img><figcaption data-lb-cap></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-lb-prev aria-label="Vorige">${I.arrowL}</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-lb-next aria-label="Volgende">${I.arrow}</button>
  <button class="lightbox__close" type="button" data-lb-close aria-label="Sluiten">${I.close}</button>
</dialog>`;

const mc = `<section class="section mc" id="masterclasses" aria-labelledby="mc-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Celebrities &amp; masterclasses</p><h2 class="title" id="mc-h">Geleerd van <em>de top.</em></h2></div>
      <p class="lead">Esra volgde masterclasses bij de grootste namen in make-up, van Dubai tot Los Angeles. Die kennis neem je mee in elke look die ze maakt.</p></div>
    <div class="deck" data-deck tabindex="0" aria-label="Masterclasses, gebruik de pijltjestoetsen">
      ${site.masterclasses.map((m, i) => `<figure class="mcard" data-card style="--i:${i}"><img src="${img(m.img)}" alt="${esc(site.artist)} met ${esc(m.with)}, ${m.place} ${m.year}" loading="lazy"><figcaption><b>${m.year}</b><span>${m.place}</span><small>Met ${esc(m.with)}</small></figcaption></figure>`).join('')}
    </div>
    <div class="deck__bar"><button class="round" type="button" data-deck-prev aria-label="Vorige masterclass">${I.arrowL}</button><p class="deck__count" aria-live="polite"><b data-deck-i>01</b> / ${pad(site.masterclasses.length)}</p><button class="round" type="button" data-deck-next aria-label="Volgende masterclass">${I.arrow}</button></div>
    <p class="mc__badge">${I.leaf}Werkt met cruelty free &amp; vegan producten</p>
  </div>
</section>`;

const pricesSec = `<section class="section prices" id="prijzen" aria-labelledby="pr-h">
  <div class="wrap prices__grid">
    <div class="card3d reveal" data-card3d>
      <div class="pcard"><p class="pcard__script">Price List</p><p class="pcard__sub">Make-up services</p><span class="pcard__rule"></span>
        <ul>${site.prices.map((p) => `<li><span><b>${p.name}</b>${p.note ? `<small>${p.note}</small>` : ''}</span><em>€${p.price},-</em><button class="pick" type="button" data-pick="${p.id}" aria-label="Kies ${esc(p.name)} voor je aanvraag">${I.plus}</button></li>`).join('')}</ul>
        <p class="pcard__foot">${logo()}</p></div>
    </div>
    <div><p class="eyebrow">Prijslijst</p><h2 class="title" id="pr-h">Helder, <em>vooraf.</em></h2>
      <p class="lead">Alle prijzen op een rij. Tik op <b>+</b> en je keuze staat meteen in je aanvraag. Een afspraak staat vast na een aanbetaling.</p>
      ${cta('Vraag je datum aan')}</div>
  </div>
</section>`;

const bridal = `<section class="section bride" id="bruid" aria-labelledby="br-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Trial talk</p><h2 class="title" id="br-h">Alles over je <em>bruidsproefsessie.</em></h2></div>
      <p class="lead">Op de grote dag wil je geen verrassingen. Met een proefsessie zie je je bruidslook vooraf en stem je samen met Esra elk detail af.</p></div>
    <div class="compare">
      <article class="opt opt--hot reveal"><p class="opt__tag">Aanrader</p><h3>Bridal package</h3><p class="opt__price">€290,-</p><ul><li>Proefsessie vooraf</li><li>Je look samen afstemmen</li><li>Bruidsmake-up op je trouwdag</li></ul>${cta('Kies dit pakket', 'btn btn--light btn--sm', ' data-pick-go="bridal-trial"')}</article>
      <article class="opt reveal" style="--d:.08s"><h3>Bridal make-up</h3><p class="opt__price">€250,-</p><ul><li>Bruidsmake-up op je trouwdag</li><li>Zonder proefsessie</li></ul>${cta('Kies deze', 'btn btn--line btn--sm', ' data-pick-go="bridal"')}</article>
      <figure class="bride__img reveal" style="--d:.16s"><img src="${img('bruid-kant')}" alt="Bruid met luxe bruidsmake-up door ${site.artist}" loading="lazy"></figure>
    </div>
    <div class="faq">${[
      ['Wat neem ik mee naar de proefsessie?', 'Een voorbeeldfoto van de look die je wilt. Weet welke kleuren je mooi vindt voor blush, lippen en oogschaduw. Een foto van je jurk of haar helpt ook.'],
      ['Hoe kom ik naar de sessie?', 'Met een schoon gezicht, zonder make-up en zonder gezichtscrème. Wimperextensions mag je gewoon houden.'],
      ['Hoe lang duurt het?', 'Een make-up sessie duurt maximaal 1 tot 1,5 uur, afhankelijk van je look.'],
      ['Kan ik mijn trouwdatum nog verzetten?', 'Vooruit geplande visagie kun je tot 3 maanden voor de datum gratis wijzigen. Bij annuleren vervalt de aanbetaling.'],
    ].map(([q, a]) => `<details class="qa"><summary>${q}<span>${I.plus}</span></summary><p>${a}</p></details>`).join('')}</div>
  </div>
</section>`;

const infoSec = `<section class="section info" id="info" aria-labelledby="in-h">
  <div class="wrap">
    <div class="head"><p class="eyebrow">Informatie &amp; regels</p><h2 class="title" id="in-h">Goed voorbereid <em>naar je afspraak.</em></h2></div>
    <div class="tabs" role="tablist" aria-label="Informatie of voorwaarden"><button type="button" role="tab" id="t-info" aria-controls="p-info" aria-selected="true" data-tab="info">Informatie</button><button type="button" role="tab" id="t-regels" aria-controls="p-regels" aria-selected="false" tabindex="-1" data-tab="regels">Voorwaarden &amp; regels</button></div>
    <div role="tabpanel" id="p-info" aria-labelledby="t-info" data-panel="info"><ol class="ilist">${site.info.map((t, i) => `<li class="reveal" style="--d:${(i % 3) * 0.05}s"><span>${pad(i + 1)}</span><p>${t}</p></li>`).join('')}</ol><p class="enjoy">Enjoy your make-up session!</p></div>
    <div role="tabpanel" id="p-regels" aria-labelledby="t-regels" data-panel="regels" hidden><ul class="rgrid">${site.rules.map(([t, d]) => `<li><h3>${t}</h3><p>${d}</p></li>`).join('')}</ul></div>
  </div>
</section>`;

const form = `<section class="section req" id="aanvraag" aria-labelledby="rq-h">
  <div class="wrap req__grid">
    <div><p class="eyebrow">Aanvraag</p><h2 class="title" id="rq-h">Vraag je datum <em>direct aan.</em></h2>
      <p class="lead">Kies je studio, je look en je datum. Je aanvraag staat meteen compleet klaar in WhatsApp. Esra laat weten of je datum vrij is en hoe de aanbetaling gaat.</p>
      <div class="sum" aria-live="polite"><p class="sum__h">Jouw aanvraag</p><dl data-sum></dl></div></div>
    <form class="form" data-form data-wa="${site.whatsapp}" novalidate>
      <fieldset class="field"><legend>Studio</legend><div class="chips">${site.locations.map((l, i) => `<label><input type="radio" name="loc" value="${l}"${i ? '' : ' checked'}><span>${I.pin}${l}</span></label>`).join('')}</div></fieldset>
      <fieldset class="field"><legend>Look</legend><div class="chips chips--col">${site.prices.map((p, i) => `<label><input type="radio" name="service" value="${p.id}"${i ? '' : ' checked'}><span><b>${p.name}</b>${p.note ? ` <small>${p.note}</small>` : ''}<em>€${p.price}</em></span></label>`).join('')}</div></fieldset>
      <div class="field-row"><label class="field"><span class="field__lbl">Datum</span><input type="date" name="date" required></label><label class="field"><span class="field__lbl">Klaar om <small>(hoe laat)</small></span><input type="time" name="time" step="900"></label></div>
      <p class="hint" data-day></p>
      <label class="field" data-trial hidden><span class="field__lbl">Voorkeur proefsessie <small>(optioneel)</small></span><input name="trial" placeholder="Bijv. een zaterdag in maart"></label>
      <div class="field-row"><label class="field"><span class="field__lbl">Aantal personen</span><input type="number" name="people" min="1" max="12" value="1" inputmode="numeric"></label><label class="field"><span class="field__lbl">Je naam</span><input name="name" autocomplete="name" required></label></div>
      <div class="check-row"><label class="check"><input type="checkbox" name="rules" required><span>Ik ken de voorwaarden: de afspraak staat vast na een aanbetaling.</span></label><a href="#info">Lees de voorwaarden</a></div>
      <div class="preview"><span>Je WhatsApp-bericht</span><p data-preview></p></div>
      <p class="error" data-error role="alert"></p>
      <button class="btn btn--wa btn--full" type="submit">${I.wa}<span>Verstuur via WhatsApp</span></button>
    </form>
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="foot"><div class="wrap foot__in">${logo()}
  <p>Pro luxury make-up artist ${site.artist}<br>Studio’s in ${site.locations.join(' en ')}</p>
  <nav aria-label="Footer"><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a href="${ig(site.instagram)}" target="_blank" rel="noopener">Instagram</a><a href="${ig(site.artistIg)}" target="_blank" rel="noopener">@${site.artistIg}</a><a href="#prijzen">Prijzen</a></nav>
  <p class="foot__fine">© ${new Date().getFullYear()} ${site.name} · Concept · Geen cookies, geen trackers.</p></div></footer>
<a class="dock" data-dock href="#aanvraag">${I.wa}<span>Datum aanvragen</span></a>`;

const index = `${head(`${site.name} · Luxe bruidsmake-up · Delfgauw & Enschede`)}
<body>
${nav}
<main id="main">
${hero}
${marquee}
${portfolioSec}
${mc}
${pricesSec}
${bridal}
${infoSec}
${form}
</main>
${footer}
<script type="application/json" id="cn-data">${JSON.stringify({ prices: site.prices })}</script>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', `${head('Pagina niet gevonden')}<body><main class="lost">${logo()}<h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--ink" href="/"><span>Naar de homepage</span></a></main></body></html>\n`);
await writeFile('public/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log('public/ gebouwd (concept: noindex)');
