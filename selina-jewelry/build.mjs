// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const C = site.contact;
const ig = `https://www.instagram.com/${C.instagram}/`;
const img = (n) => `/assets/img/${n}.webp`;
const pad = (n) => String(n).padStart(2, '0');
const F = site.film;
const price = (p) => (p ? `€ ${p}` : 'Prijs op aanvraag');

const plus = '<span class="pill__dot" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>';
const pill = (label, href, attrs = '') => `<a class="pill" href="${href}"${attrs}><span>${label}</span>${plus}</a>`;
const wa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>';
const spark = '<svg class="spark" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="core"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fff6df" stop-opacity=".9"/><stop offset="1" stop-color="#fff6df" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="22" fill="url(#core)"/><path d="M50 2 55 45 98 50 55 55 50 98 45 55 2 50 45 45Z" fill="#fff"/><path d="M50 22 53 47 78 50 53 53 50 78 47 53 22 50 47 47Z" fill="#fff" transform="rotate(45 50 50)" opacity=".85"/></svg>';

const head = (title) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="Selina Jewelry uit Hengelo: 14 karaat gouden ringen, oorbellen, kettingen en armbanden. Bekijk de collectie en bestel direct via WhatsApp.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f6f1e8">
<link rel="icon" href="/assets/img/icon.png" type="image/png">
<link rel="preload" href="/assets/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${img(F.hand.img)}" as="image" fetchpriority="high">
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/app.js" defer></script>
</head>`;

const logoMark = (cls = '') => `<img class="mark ${cls}" src="/assets/img/logo.png" alt="" width="392" height="356">`;

const nav = `<a class="skip" href="#main">Naar de inhoud</a>
<header class="nav" data-nav>
  <a class="nav__logo" href="#top" aria-label="Selina Jewelry, naar boven">${logoMark()}<span>Selina <em>Jewelry</em></span></a>
  <nav class="nav__links" aria-label="Hoofdmenu"><a href="#collectie">Collectie</a><a href="#seizoenen">Seizoenen</a><a href="#giftcards">Giftcards</a></nav>
  <button class="nav__menu" type="button" data-menu-open aria-label="Menu openen" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  <button class="nav__bag label" type="button" data-bag-open>[ Tas <b data-bag-count></b>]</button>
</header>
<div class="menu" id="menu" data-menu hidden>
  <button class="menu__close label" type="button" data-menu-close>[ Sluiten ]</button>
  <ol>${[['#collectie', 'Collectie'], ['#over', 'Over Selina'], ['#seizoenen', 'Seizoenen'], ['#giftcards', 'Giftcards'], ['#bestellen', 'Bestellen']].map(([h, t], i) => `<li><a href="${h}" data-menu-link><small>${pad(i + 1)}</small>${t}</a></li>`).join('')}</ol>
  <p class="menu__foot">${site.city} · <a href="tel:${C.phone.replace(/\s/g, '')}">${C.phone}</a></p>
</div>`;

const vitrineSide = (s, i) => `<figure class="vit__item vit__item--${i ? 'r' : 'l'}" data-vit-side><div class="vit__img"><img src="${img(s.id)}" alt="${esc(s.name)}" loading="lazy"></div><figcaption>${esc(s.name)}<span>${price(null)}</span></figcaption></figure>`;

const film = `<section class="film" id="top" data-film aria-label="Introductie">
  <div class="film__stage" data-stage>
    <div class="vit" aria-hidden="false">
      <i class="vit__line vit__line--v1" data-vit-line></i><i class="vit__line vit__line--v2" data-vit-line></i><i class="vit__line vit__line--h" data-vit-line></i>
      <div class="vit__top" data-vit-top><span class="label">[ Armbanden ]</span><span>Uit de highlights</span></div>
      ${vitrineSide(F.sides[0], 0)}
      <div class="vit__mid" data-vit-slot><div class="vit__img"></div><p class="vit__cap" data-vit-cap>${esc(F.pick.name)}<span>${price(null)}</span></p></div>
      ${vitrineSide(F.sides[1], 1)}
      <p class="vit__note" data-vit-top>${esc(F.pick.detail)}</p>
    </div>
    <div class="screen" data-screen>
      <img class="screen__poster" src="${img(F.hand.img)}" alt="" data-poster fetchpriority="high">
      <canvas class="screen__canvas" data-canvas aria-hidden="true"></canvas>
      <img class="screen__macro" src="${img(F.close.img)}" alt="Close-up van de klaver armband" data-macro>
      <span class="screen__spark" data-spark>${spark}</span>
    </div>
    <div class="hero" data-hero-ui>
      <span class="hero__veil" aria-hidden="true"></span>
      <h1 class="hero__title"><span class="ln"><span>14 karaat</span></span><span class="ln"><span>goud</span></span></h1>
      <div class="hero__cta">${pill('Shop de collectie', '#collectie')}</div>
      <p class="hero__corner">14 karaat gouden sieraden<br><span>${site.city}, Nederland</span></p>
      <div class="hero__scroll" data-scroll-hint><span class="label">[ Scroll langzaam ]</span><i><b data-film-bar></b></i></div>
    </div>
    <div class="pick" data-pick><span class="label">[ De klaver ]</span><b>${esc(F.pick.name)}</b><span>${esc(F.pick.detail)}</span></div>
  </div>
</section>`;

const sentence = 'Elk sieraad is van 14 karaat goud. Zorgvuldig uitgekozen in Hengelo, om elke dag te dragen en te blijven dragen.';
const over = `<section class="over" id="over" data-over aria-labelledby="over-h">
  <div class="over__pin" data-over-pin>
    <p class="label over__label">[ Over Selina ]</p>
    <div class="over__objs" aria-hidden="true">${[['obj-creolen', 0.85], ['obj-oorbellen', 0.25], ['obj-ring', 0.5], ['obj-klaver', 0.65]].map(([n, d], i) => `<img class="obj obj--${i}" src="${img(n)}" alt="" data-depth="${d}" loading="lazy">`).join('')}</div>
    <h2 class="over__text" id="over-h" aria-label="${esc(sentence)}" data-words>${sentence.split(' ').map((w) => `<span aria-hidden="true">${esc(w)}</span>`).join(' ')}</h2>
    <dl class="over__table" data-over-table>${[['Materiaal', '14 karaat goud'], ['Soorten', 'Ringen, oorbellen, kettingen, armbanden'], ['Bestellen', 'Direct via WhatsApp'], ['Cadeau', 'Giftcards']].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
  </div>
</section>`;

const PLACES = [['1 / 6', '1 / 3', '4/5', '0'], ['7 / 9', '1', '1/1', '12vw'], ['10 / 13', '1', '4/5', '2vw'], ['8 / 12', '2', '5/4', '2vw'], ['2 / 5', '3', '1/1', '2vw'], ['6 / 9', '3', '4/5', '9vw']];
const card = (p, i) => {
  const [col, row, ar, mt] = PLACES[i];
  return `<li class="piece" style="--col:${col};--row:${row};--ar:${ar};--mt:${mt};--sp:${[0.6, -0.4, 0.9, -0.7, 0.5, -0.9][i]}" data-piece>
    <div class="piece__img"><img src="${img(p.id)}" alt="${esc(p.name)}, ${esc(p.detail.toLowerCase())}" loading="lazy" data-par>
      <button class="pill pill--sm piece__add" type="button" data-add="${p.id}"><span>In tas</span>${plus}</button></div>
    <p class="piece__row"><b>${esc(p.name)}</b><span class="piece__price">${price(p.price)}</span></p>
    <p class="piece__type">${esc(p.detail)} · 14k goud</p>
  </li>`;
};
const collectie = `<section class="coll" id="collectie" aria-labelledby="coll-h">
  <div class="coll__head">
    <p class="label">[ Collectie ]</p>
    <h2 class="coll__title" id="coll-h">Goud</h2>
    <p class="coll__intro">Alles 14 karaat. Gesorteerd per soort, zodat je in één keer ziet wat er is.</p>
    <p class="label coll__count"><span data-coll-count>${site.pieces.filter((p) => p.type === 'ringen').length}</span> stuks</p>
  </div>
  <div class="tabs" role="tablist" aria-label="Soort sieraad">${site.types.map((t, i) => `<button class="tab" type="button" role="tab" id="tab-${t.id}" aria-controls="soort-${t.id}" aria-selected="${!i}"${i ? ' tabindex="-1"' : ''} data-tab="${t.id}">${t.name}<sup>${site.pieces.filter((p) => p.type === t.id).length}</sup></button>`).join('')}</div>
  ${site.types.map((t, i) => `<div role="tabpanel" id="soort-${t.id}" aria-labelledby="tab-${t.id}" data-type="${t.id}"${i ? ' hidden' : ''}><ul class="grid">${site.pieces.filter((p) => p.type === t.id).map(card).join('')}</ul></div>`).join('\n  ')}
</section>`;

const seizoenen = `<section class="seasons" id="seizoenen" aria-labelledby="sz-h">
  <div class="seasons__head"><p class="label">[ Seizoenen ]</p><h2 class="h2" id="sz-h">Collecties <em>per seizoen.</em></h2></div>
  ${site.seasons.map((s, i) => `<article class="season${i % 2 ? ' season--flip' : ''}" data-season>
    <div class="fan" data-fan>${s.imgs.map((n, j) => `<figure class="fan__card" style="--k:${j - 1}"><img src="${img(n)}" alt="" loading="lazy"></figure>`).join('')}</div>
    <div class="season__copy"><p class="label">[ ${s.name} ]</p><h3>${s.title}</h3><p>${s.text}</p>${pill(`Shop ${site.types.find((t) => t.id === s.type).name.toLowerCase()}`, '#collectie', ` data-goto="${s.type}"`)}</div>
  </article>`).join('\n  ')}
</section>`;

const gift = `<section class="gift" id="giftcards" aria-labelledby="gift-h">
  <div class="gift__card3d" data-gift3d aria-hidden="true">
    <div class="gc" data-gc><div class="gc__face gc__front">${logoMark('gc__logo')}<span class="gc__lbl">Giftcard</span></div>
      <div class="gc__face gc__back"><span class="gc__lbl">Selina Jewelry</span><b class="gc__amount" data-gc-amount>€ 50</b><span class="gc__lbl">14 karaat goud · ${site.city}</span></div></div>
  </div>
  <div class="gift__copy">
    <p class="label">[ Giftcards ]</p>
    <h2 class="h2" id="gift-h">Laat haar <em>zelf kiezen.</em></h2>
    <p class="muted">Een giftcard van Selina Jewelry, in te wisselen voor elk sieraad uit de collectie.</p>
    <fieldset class="amounts"><legend class="label">Bedrag</legend>${site.giftcards.map((a, i) => `<label><input type="radio" name="gift" value="${a}"${i === 1 ? ' checked' : ''}><span>€ ${a}</span></label>`).join('')}</fieldset>
    <button class="pill" type="button" data-add-gift><span>Giftcard in tas</span>${plus}</button>
    <p class="fine">Bedragen zijn een voorbeeld in dit concept.</p>
  </div>
</section>`;

const waarom = `<section class="why" aria-labelledby="why-h">
  <div class="why__text"><p class="label">[ Waarom Selina ]</p><h2 class="why__title" id="why-h">Goud dat blijft</h2>
    <p class="muted">Geen verkleurend laagje, maar 14 karaat goud. Gekozen om elke dag te dragen: onder de douche vandaan, naar je werk, naar het feest.</p>
    ${pill('Bekijk de collectie', '#collectie')}</div>
  <div class="why__strip" data-strip><img src="${img('standaard-goud')}" alt="" loading="lazy" data-par></div>
  <div class="why__cells"><i class="why__line why__line--v" data-why-line></i><i class="why__line why__line--h" data-why-line></i>
    ${[['14', 'k', 'Karaat goud', 'Elk stuk in de collectie.'], ['4', '', 'Soorten', 'Ringen, oorbellen, kettingen en armbanden.'], [String(site.stats.posts), '', 'Posts', 'Elk sieraad eerst gedragen en gefotografeerd.'], ['1', '', 'Bericht', 'Je hele tas gaat in één keer naar WhatsApp.']].map(([n, u, t, d]) => `<div class="cell"><p class="cell__n"><span data-count="${n}">${n}</span>${u}</p><p class="cell__t">${t}</p><p class="cell__d">${d}</p></div>`).join('')}
  </div>
</section>`;

const steps = [['Kies', 'Leg je favorieten in je tas. Bij ringen kies je je maat.', 'ringen-roos'], ['Verstuur', 'Je bestelling gaat in één keer naar WhatsApp, met alles al ingevuld.', 'hand-ringen'], ['Ontvang', 'Selina bevestigt prijs en beschikbaarheid. Ophalen of verzenden spreek je samen af.', 'oorbellen-doosje']];
const bestellen = `<section class="order" id="bestellen" aria-labelledby="order-h">
  <p class="label">[ Bestellen ]</p>
  <h2 class="order__title" id="order-h">Drie stappen,<br><em>één bericht.</em></h2>
  <div class="order__img" data-slit><img src="${img('collectie-tray')}" alt="Een lade vol gouden ringen, kettingen en armbanden" loading="lazy"><img src="${img('standaard-goud')}" alt="Kettingen en oorbellen aan een gouden standaard" loading="lazy"><img src="${img('glas-bangles')}" alt="Bangles en ringen op marmer" loading="lazy"></div>
  <ol class="order__steps">${steps.map(([t, d, im], i) => `<li class="ostep" data-ostep data-img="${img(im)}"><i class="ostep__bar"><b></b></i><span>${pad(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  <img class="order__peek" data-peek alt="" aria-hidden="true">
</section>`;

const footer = `<footer class="foot">
  <div class="foot__cols">
    <div><p class="label">[ Winkel ]</p><p>${site.city}, Nederland<br><span class="muted">Bestellen via WhatsApp</span></p></div>
    <div><p class="label">[ Contact ]</p><p><a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><br><a href="tel:${C.phone.replace(/\s/g, '')}">${C.phone}</a></p></div>
    <div><p class="label">[ Volg ]</p><p><a href="${ig}" target="_blank" rel="noopener">Instagram</a><br><span class="muted">Facebook: ${C.facebook}</span></p></div>
    <div><p class="label">[ Je tas ]</p><p>Klaar met kiezen?</p><button class="pill" type="button" data-bag-open><span>Open je tas</span>${plus}</button></div>
  </div>
  <div class="foot__base"><p>© ${new Date().getFullYear()} ${site.name} · Concept · Geen cookies, geen trackers.</p><a class="label" href="#top">[ Terug naar boven ]</a></div>
  <p class="foot__word" aria-hidden="true" data-word>${[...'Selina'].map((c) => `<span>${c}</span>`).join('')}</p>
</footer>`;

const bag = `<dialog class="bag" data-bag aria-labelledby="bag-h">
  <div class="bag__head"><h2 id="bag-h">Je tas</h2><button class="label" type="button" data-bag-close>[ Sluiten ]</button></div>
  <ul class="bag__list" data-bag-list></ul>
  <p class="bag__empty" data-bag-empty>Je tas is nog leeg. Tik op “In tas” bij een sieraad.</p>
  <form class="bag__form" data-bag-form data-wa="${C.whatsapp}" novalidate>
    <label class="field"><span>Je naam</span><input name="name" autocomplete="name" required></label>
    <fieldset class="field"><legend>Ophalen of verzenden</legend><div class="seg"><label><input type="radio" name="ship" value="Ophalen in Hengelo" checked><span>Ophalen</span></label><label><input type="radio" name="ship" value="Verzenden" ><span>Verzenden</span></label></div></fieldset>
    <label class="field"><span>Opmerking <small>(optioneel)</small></span><input name="note" placeholder="Bijv. als cadeau inpakken"></label>
    <p class="bag__err" data-bag-err role="alert"></p>
    <button class="send" type="submit">${wa}<span>Bestel via WhatsApp</span></button>
    <p class="fine">WhatsApp opent met je bestelling al ingevuld. Selina bevestigt prijs en beschikbaarheid.</p>
  </form>
</dialog>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const data = { pieces: Object.fromEntries(site.pieces.map((p) => [p.id, { name: p.name, type: p.type, detail: p.detail, img: img(p.id) }])), film: F, wa: C.whatsapp };
const index = `${head(`${site.name} · 14 karaat gouden sieraden · ${site.city}`)}
<body>
${nav}
<main id="main">
${film}
${over}
${collectie}
${seizoenen}
${gift}
${waarom}
${bestellen}
</main>
${footer}
${bag}
<script type="application/json" id="sj-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', `${head('Pagina niet gevonden')}<body><main class="lost">${logoMark()}<h1 class="h2">Deze pagina <em>bestaat niet.</em></h1>${pill('Naar de homepage', '/')}</main></body></html>\n`);
await writeFile('public/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log('public/ gebouwd (concept: noindex)');
