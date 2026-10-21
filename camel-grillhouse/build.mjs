// Bouwt ./public uit src/site.mjs en assets/. Gebruik: node build.mjs
import { mkdir, rm, cp, writeFile, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { site, isTodo } from './src/site.mjs';

const OUT = new URL('./public/', import.meta.url).pathname;
const IMG = JSON.parse(await readFile(new URL('./assets/img/manifest.json', import.meta.url), 'utf8'));

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const has = (v) => v != null && v !== '' && !isTodo(v);
const ph = (x) => `<span class="ph" title="Placeholder: nog te bevestigen">te bevestigen: ${esc(x.label)}</span>`;
const v = (x) => (isTodo(x) ? ph(x) : esc(x));
const eur = (n) => `€${n.toFixed(2).replace('.', ',')}`;
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const year = new Date().getFullYear();

/** Woorden in losse spans voor de spring-reveal; de gewone tekst blijft voor screenreaders. */
const splitWords = (html) => html.replace(/<h2([^>]*)>([^<]+)<\/h2>/g, (m, attrs, text) =>
  `<h2${attrs} data-split><span class="sr-only">${text}</span><span class="sw" aria-hidden="true">${text.trim().split(/\s+/)
    .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ')}</span></h2>`);
/** Letters met blur-up (hero). */
const chars = (text, from = 0) => [...text].map((c, i) => c === ' ' ? ' '
  : `<span class="ch" style="--c:${from + i}">${esc(c)}</span>`).join('');
/** Hoekhaken rond een paneel — één pad, vier keer gedraaid. */
const brackets = ['tl', 'tr', 'br', 'bl'].map((k) => `<svg class="bk bk--${k}" viewBox="0 0 10.5 10.5" aria-hidden="true"><path d="M0 0.5H10V10.5" fill="none" stroke="currentColor"/></svg>`).join('');
/** Vonken-overgang tussen twee secties (canvas, scroll-gestuurd). */
const seam = (carry) => `<canvas class="seam" data-seam="${carry}" aria-hidden="true"></canvas>`;
/** Bewegende hoogtelijnen (marching squares), dezelfde velden als de hero-gloed. */
const contours = (cls = '') => `<canvas class="contours ${cls}" data-contours aria-hidden="true"></canvas>`;
const { menu, order, location: loc, contact } = site;
const cat = (id) => menu.categories.find((c) => c.id === id);
const findItem = (cid, name) => cat(cid).items.find((i) => i.name === name);

/** Responsive foto (AVIF + WebP), met vaste verhouding (geen layout shift) en blur-placeholder. */
const pic = (name, { sizes = '100vw', eager = false, cls = '', alt = site.photos[name], pos = '50% 50%' } = {}) => {
  const m = IMG[name];
  const set = (ext) => m.widths.map((w) => `/assets/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const mid = m.widths.find((w) => w >= 800) ?? m.widths.at(-1);
  return `<picture class="pic ${cls}" style="--lqip:url(${m.lqip});--pos:${pos}">
<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
<img src="/assets/img/${name}-${mid}.webp" width="${m.w}" height="${m.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
</picture>`;
};

// Bestelroute: altijd de bestaande webshop. Product → productpagina, anders categorie, anders shop.
const ext = '<span class="sr-only"> (naar de webshop van Camel)</span>';
const arrow = `<svg class="arr" viewBox="0 0 14 11" aria-hidden="true"><path d="M0 5.35H13M8 10.35L13 5.35L8 0.35" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
// Elke bestelknop gaat naar de startpagina van de webshop (wens van de opdrachtgever).
const orderHref = () => order.url;
const orderBtn = (label = 'Bestel nu', cls = 'btn btn--ember', { item, c, track = 'order' } = {}) =>
  `<a class="${cls}" href="${esc(orderHref(item, c))}" data-track="${track}"${item ? ` data-item="${esc(item.name)}"` : ''}><span>${label}</span>${arrow}${ext}</a>`;
const btn = (href, label, cls = 'btn btn--ghost', attrs = '') => `<a class="${cls}" href="${href}"${attrs}><span>${label}</span>${arrow}</a>`;

const priceOf = (item) => item.sizes
  ? (() => { const known = item.sizes.filter((x) => x != null); return known.length ? `vanaf ${eur(Math.min(...known))}` : null; })()
  : item.price != null ? `${item.from ? 'vanaf ' : ''}${eur(item.price)}` : null;
const priceHtml = (item) => {
  const pr = priceOf(item);
  return pr ? `<span class="price${menu.pricesVerified ? '' : ' price--check'}">${pr}</span>` : '<span class="price price--na">prijs in webshop</span>';
};
const labels = (item, c) => item.sizeLabels ?? c.sizes;
const veg = (item) => (item.veg ? '<span class="tag tag--veg" title="Vegetarisch">vega</span>' : '')
  + (item.adult ? '<span class="tag tag--adult" title="Alleen 18 jaar en ouder">18+</span>' : '');

const flame = `<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 1c1.4 5.2 7.9 8.6 7.9 17.1A7.9 7.9 0 0 1 4.1 18.1c0-3.9 2-6.5 4-8.4.2 2.5 1.2 4.3 3 5.3C11 10.8 10.4 5.8 12 1Z" fill="currentColor"/></svg>`;
const logo = (cls = '') => `<a class="logo ${cls}" href="/">
<span class="logo__mark">${flame}</span><span class="logo__word">Camel</span><span class="logo__sub">Middle East<br>Grill House</span></a>`;

const nav = [
  ['/menukaart/', 'Menukaart'],
  ['/#favorieten', 'Favorieten'],
  ['/#keuken', 'De keuken'],
  ['/#over', 'Over ons'],
  ['/#contact', 'Contact'],
];

const openTodos = JSON.stringify(site).match(/"todo":true/g)?.length ?? 0;

// ── layout ─────────────────────────────────────────────────────────────────
const head = ({ title, description, path, ld = '' }) => {
  const canonical = `${site.url}${path}`;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${site.draft ? '<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#110e0c">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${site.url}/assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/big-shoulders-display-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope-var.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/main.js" defer></script>
<script src="/assets/js/flame.js" defer></script>
${ld}
</head>`;
};

const header = (path) => `
<a class="skip" href="#main">Naar de inhoud</a>
${site.draft ? `<div class="devbar" role="note"><strong>Concept</strong>: niet publiceren. ${openTodos} punten te bespreken met de eigenaar. Zie docs/rapportage.md.</div>` : ''}
<header class="top" data-top>
  <div class="top__in">
    ${logo()}
    <nav class="top__nav" aria-label="Hoofdmenu">
      <ul>${nav.map(([h, l]) => `<li><a href="${h}"${h === path ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul>
    </nav>
    ${orderBtn('Bestel nu', 'btn btn--ember btn--sm top__cta', { track: 'order-header' })}
    <button class="burger" type="button" aria-expanded="false" aria-controls="sheet"><span class="burger__lines" aria-hidden="true"></span><span class="sr-only">Menu openen</span></button>
  </div>
</header>
<div class="sheet" id="sheet" hidden>
  <div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Menu">
    <button class="sheet__close" type="button"><span aria-hidden="true">✕</span><span class="sr-only">Menu sluiten</span></button>
    <ul class="sheet__nav">${nav.map(([h, l], i) => `<li style="--i:${i}"><a href="${h}">${l}</a></li>`).join('')}</ul>
    ${orderBtn('Bestel nu', 'btn btn--ember btn--lg', { track: 'order-sheet' })}
    <p class="sheet__meta"><a href="${contact.phoneHref}">${contact.phone}</a><br>${loc.street}, ${loc.city}</p>
  </div>
</div>`;

const footer = () => `
<footer class="foot">
  <div class="wrap foot__grid">
    <div>
      ${logo('logo--foot')}
      <p class="foot__tag">Grillroom aan de Oude Markt in Enschede.</p>
    </div>
    <div>
      <h2 class="foot__h">Bezoek</h2>
      <address>${loc.street}<br>${loc.postalCode} ${loc.city}</address>
      <a class="foot__link" href="${loc.mapsUrl}" target="_blank" rel="noopener">Route plannen<span class="sr-only"> (opent Google Maps)</span></a>
    </div>
    <div>
      <h2 class="foot__h">Contact</h2>
      <a class="foot__link" href="${contact.phoneHref}" data-track="call">${contact.phone}</a>
      <a class="foot__link" href="${order.url}" data-track="order-footer">Online bestellen${ext}</a>
    </div>
    <div>
      <h2 class="foot__h">Menukaart</h2>
      <ul class="foot__cats">${menu.categories.slice(0, 8).map((c) => `<li><a href="/menukaart/#${c.id}">${c.name}</a></li>`).join('')}</ul>
    </div>
  </div>
  <div class="wrap foot__base">
    <p>© ${year} ${site.name}</p>
    <ul><li><a href="/privacy/">Privacy &amp; cookies</a></li><li><a href="/menukaart/">Menukaart</a></li></ul>
  </div>
</footer>
<div class="dock" data-dock aria-hidden="true">
  <a class="dock__call" href="${contact.phoneHref}" tabindex="-1" data-track="call-dock"><span>Bel</span></a>
  ${orderBtn('Bestel nu', 'btn btn--ember dock__order', { track: 'order-dock' }).replace('<a ', '<a tabindex="-1" ')}
</div>`;

const page = (meta, body, path) => `${head({ ...meta, path })}
<body${path === '/' ? ' class="home"' : ''}>
${header(path)}
<main id="main">
${splitWords(body)}
</main>
${footer()}
</body>
</html>`;

// ── componenten ────────────────────────────────────────────────────────────
const hoursTable = (cls = '') => `<table class="hours ${cls}" data-hours>
<caption class="sr-only">Openingstijden</caption>
<tbody>${site.hours.map((h, i) => `<tr data-dow="${(i + 1) % 7}"><th scope="row">${h.day}</th><td>${h.open} – ${v(h.close)}</td></tr>`).join('')}</tbody>
</table>${site.hoursVerified ? '' : `<p class="small muted">${ph({ label: 'openingstijden: externe vermeldingen wijken af' })}</p>`}`;

const priceNote = () => menu.pricesVerified
  ? '<p class="note">De prijs en beschikbaarheid in de webshop zijn altijd leidend.</p>'
  : `<p class="note note--check">${ph({ label: `prijzen overgenomen uit ${menu.source}; de webshop gaf op verschillende pagina’s andere bedragen` })} De prijs in de webshop is altijd leidend.</p>`;

const favCard = (f, i) => {
  const c = cat(f.cat); const item = findItem(f.cat, f.item);
  const desc = item.desc ?? c.blurb;
  return `<article class="fav reveal" style="--d:${i * 70}ms">
  <div class="fav__glow" aria-hidden="true"></div>
  <p class="fav__kicker"><span class="fav__no">${String(i + 1).padStart(2, '0')}</span>${esc(f.kicker)}</p>
  <h3 class="fav__name">${esc(item.name)}</h3>
  <p class="fav__desc">${esc(desc)}</p>
  ${item.sizes ? `<ul class="fav__sizes">${labels(item, c).map((s, k) => `<li><span>${s}</span>${item.sizes[k] != null ? eur(item.sizes[k]) : 'webshop'}</li>`).join('')}</ul>` : ''}
  <div class="fav__foot">${priceHtml(item)}${orderBtn('Bestel', 'btn btn--ember btn--sm', { item, c, track: 'order-product' })}</div>
</article>`;
};

const menuRow = (item, c) => `<li class="row" data-name="${esc(slug(item.name + ' ' + (item.desc ?? '')))}">
  <div class="row__main"><h3 class="row__name">${esc(item.name)} ${veg(item)}</h3>${item.desc ? `<p class="row__desc">${esc(item.desc)}</p>` : ''}</div>
  ${item.sizes ? `<dl class="row__sizes">${labels(item, c).map((s, k) => `<div><dt>${s}</dt><dd>${item.sizes[k] != null ? `<span class="price${menu.pricesVerified ? '' : ' price--check'}">${eur(item.sizes[k])}</span>` : '<span class="price--na">webshop</span>'}</dd></div>`).join('')}</dl>` : `<div class="row__price">${priceHtml(item)}</div>`}
  <a class="row__order" href="${esc(orderHref(item, c))}" data-track="order-product" data-item="${esc(item.name)}"><span class="sr-only">${esc(item.name)} bestellen</span><span aria-hidden="true">Bestel</span>${arrow}${ext}</a>
</li>`;

// ── homepage ───────────────────────────────────────────────────────────────
const grillItems = menu.categories.flatMap((c) => c.items.filter((i) => i.grill).map((i) => [i, c]));
const comfortIds = ['kapsalon', 'broodjes', 'durum', 'donerbox'];
const moreIds = ['pizza', 'lahmacun', 'tosti', 'kindermenu'];

const home = () => page({
  title: `${site.name} | Grillroom aan de Oude Markt, Enschede`,
  description: 'Kapsalon, shoarma, döner, dürüm, pizza en mixed grill bij Camel aan de Oude Markt in Enschede. Bekijk de menukaart en bestel online.',
}, `
<div class="stack">
<div class="stack__pin" data-pin>
<div class="stack__inner" data-pin-inner>
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__media" data-parallax>
    ${pic('doner-spies', { eager: true, sizes: '(min-width: 900px) 55vw, 100vw', pos: '50% 38%', cls: 'hero__pic' })}
    <canvas class="hero__flame" data-flame aria-hidden="true"></canvas>
    <div class="hero__shade" aria-hidden="true"></div>
  </div>
  <div class="hero__copy wrap">
    <p class="eyebrow hero__in" style="--d:0ms"><span class="dot" aria-hidden="true"></span>Camel Middle East Grill House • Enschede</p>
    <h1 class="hero__title" id="hero-title"><span class="sr-only">Jouw trek. Onze grill.</span><span class="hero__line" aria-hidden="true">${chars('Jouw trek.')}</span> <span class="hero__line hero__line--ember" aria-hidden="true">${chars('Onze grill.', 9)}</span></h1>
    <p class="hero__sub hero__in" style="--d:380ms">Van goedgevulde kapsalon en shoarma tot dürüm, pizza en mixed grill. Ontdek het menu van Camel en bestel jouw favoriet.</p>
    <div class="hero__ctas hero__in" style="--d:500ms">
      ${orderBtn('Bestel nu', 'btn btn--ember btn--lg', { track: 'order-hero' })}
      ${btn('/menukaart/', 'Bekijk de menukaart', 'btn btn--ghost btn--lg', ' data-track="menu-hero"')}
    </div>
    <p class="hero__meta hero__in" style="--d:620ms"><span>${loc.street}</span><span>Dagelijks vanaf ${site.hours[0].open}</span><span>Bestellen via ${order.host}</span></p>
  </div>
  <aside class="hero__panel hero__in" style="--d:900ms" aria-label="Snel naar">
    <div class="bpanel">${brackets}
      <p class="bpanel__eye">Vandaag</p>
      <p class="bpanel__big">Open vanaf ${site.hours[0].open}</p>
      <p class="bpanel__sub" data-today-close>Tot laat in de nacht</p>
    </div>
    <div class="bpanel">${brackets}
      <p class="bpanel__eye">Op de kaart</p>
      <dl class="bpanel__stats">
        <div><dt>Categorieën</dt><dd>${menu.categories.length}</dd></div>
        <div><dt>Gerechten</dt><dd>${menu.categories.reduce((n, c) => n + c.items.length, 0)}+</dd></div>
        <div><dt>Formaten</dt><dd>3</dd></div>
      </dl>
    </div>
  </aside>
  <a class="hero__scroll" href="#smaak" aria-label="Scroll naar de inhoud"><span aria-hidden="true"></span></a>
</section>
</div>
<div class="stack__shade" data-pin-shade aria-hidden="true"></div>
</div>

<section class="sec intro stack__next" id="smaak" aria-labelledby="smaak-title">
  <div class="wrap intro__grid">
    <div class="intro__media reveal">${pic('grill', { sizes: '(min-width: 900px) 42vw, 100vw', pos: '50% 45%' })}<span class="intro__badge" aria-hidden="true">${flame}</span></div>
    <div class="intro__copy reveal" style="--d:120ms">
      <p class="eyebrow">De smaak van Camel</p>
      <h2 class="h2" id="smaak-title">Goed eten begint bij trek.</h2>
      <p class="lead">Van een goedgevuld broodje tot een complete grillmaaltijd: ontdek de smaken en gerechten van Camel.</p>
      <ul class="chips" aria-label="Op de kaart">${['Kapsalon', 'Shoarma', 'Döner', 'Dürüm', 'Lahmacun', 'Pizza', 'Schotels', 'Mixed grill'].map((x) => `<li>${x}</li>`).join('')}</ul>
      ${btn('/menukaart/', 'Ontdek het menu', 'btn btn--ember', ' data-track="menu-intro"')}
    </div>
  </div>
</section>
</div>

<section class="sec favs" id="favorieten" aria-labelledby="fav-title">
  ${seam('ink')}
  <div class="wrap">
    <header class="sec__head reveal">
      <p class="eyebrow">Onze favorieten</p>
      <h2 class="h2" id="fav-title">Klassiekers van Camel.</h2>
      <p class="sec__lede">Zes vaste waarden van de kaart. Kies, pas aan in de webshop en bestel.</p>
    </header>
    <div class="favs__grid">${site.favorites.map(favCard).join('')}</div>
    ${priceNote()}
  </div>
</section>

<section class="sec cats" id="menukaart" aria-labelledby="cats-title">
  <div class="wrap">
    <header class="sec__head sec__head--row reveal">
      <div><p class="eyebrow">Ontdek de menukaart</p><h2 class="h2" id="cats-title">${menu.categories.length} categorieën. Eén plek.</h2></div>
      ${btn('/menukaart/', 'Volledige menukaart', 'btn btn--ghost', ' data-track="menu-cats"')}
    </header>
    <ul class="cats__grid">${menu.categories.map((c, i) => `<li class="reveal" style="--d:${(i % 4) * 50}ms"><a class="cat" href="/menukaart/#${c.id}"><span class="cat__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="cat__name">${c.name}</span><span class="cat__count">${c.items.length ? `${c.items.length} gerechten` : 'Bekijk aanbod'}</span>${arrow}</a></li>`).join('')}</ul>
  </div>
</section>

<section class="sec grillsec" id="grill" aria-labelledby="grill-title">
  <div class="grillsec__bg" aria-hidden="true" data-parallax-bg>${pic('grill', { sizes: '100vw', pos: '50% 55%', alt: '' })}</div>
  ${contours()}
  ${seam('ink')}
  <div class="wrap grillsec__in">
    <header class="sec__head reveal">
      <p class="eyebrow eyebrow--amber">De grill in de hoofdrol</p>
      <h2 class="h2 h2--xl" id="grill-title">Voor wie trek heeft in meer.</h2>
      <p class="sec__lede">Camel mix grill, adana, shish kebab, köfte, beyti, pirzola, biefstuk en spareribs. Allemaal als schotel.</p>
    </header>
    <ol class="grilllist">${grillItems.map(([i, c], k) => `<li class="grilllist__row reveal" style="--d:${(k % 6) * 40}ms">
      <span class="grilllist__name">${esc(i.name)}${i.desc ? `<small>${esc(i.desc)}</small>` : ''}</span>
      <span class="grilllist__dots" aria-hidden="true"></span>
      ${priceHtml(i)}
      <a class="grilllist__go" href="${esc(orderHref(i, c))}" data-track="order-product" data-item="${esc(i.name)}"><span class="sr-only">${esc(i.name)} bestellen</span>${arrow}${ext}</a>
    </li>`).join('')}</ol>
    ${btn('/menukaart/#schotels', 'Bekijk de grillgerechten', 'btn btn--ember', ' data-track="menu-grill"')}
  </div>
</section>

<section class="sec comfort" id="kapsalon" aria-labelledby="comfort-title">
  <div class="wrap">
    <header class="sec__head reveal">
      <p class="eyebrow">Kapsalon, broodjes &amp; dürüm</p>
      <h2 class="h2" id="comfort-title">Kies je vlees. Kies je formaat.</h2>
    </header>
    <div class="ksize reveal">
      <div class="ksize__head"><h3 class="h3">Kapsalon</h3><p class="muted">${esc(cat('kapsalon').blurb)} Vanaf-prijzen: extra's kies je in de webshop.</p></div>
      <div class="ksize__table" role="region" aria-label="Kapsalon-prijzen per formaat" tabindex="0">
      <table>
        <thead><tr><th scope="col">Variant</th>${cat('kapsalon').sizes.map((s) => `<th scope="col">${s}</th>`).join('')}<th scope="col"><span class="sr-only">Bestellen</span></th></tr></thead>
        <tbody>${cat('kapsalon').items.map((i) => `<tr><th scope="row">${esc(i.name.replace('Kapsalon ', ''))}${i.sizeLabels ? ` <small class="muted">(${i.sizeLabels[0].toLowerCase()})</small>` : ''} ${veg(i)}</th>${i.sizes.map((x) => `<td>${x != null ? `<span class="price${menu.pricesVerified ? '' : ' price--check'}">${eur(x)}</span>` : '<span class="price--na">webshop</span>'}</td>`).join('')}<td><a class="row__order" href="${esc(orderHref(i, cat('kapsalon')))}" data-track="order-product" data-item="${esc(i.name)}"><span aria-hidden="true">Bestel</span><span class="sr-only">${esc(i.name)} bestellen</span>${arrow}${ext}</a></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="comfort__cols">${['broodjes', 'durum', 'donerbox'].map((id, k) => { const c = cat(id); return `<article class="panel reveal" style="--d:${k * 80}ms">
      <h3 class="h3">${c.name}</h3><p class="muted">${esc(c.blurb)}</p>
      <ul class="mini">${c.items.slice(0, 6).map((i) => `<li><span>${esc(i.name)} ${veg(i)}</span>${priceHtml(i)}</li>`).join('')}</ul>
      ${btn(`/menukaart/#${id}`, `Alle ${c.name.toLowerCase()}`, 'btn btn--text', ` data-track="menu-${id}"`)}
    </article>`; }).join('')}</div>
  </div>
</section>

<section class="sec more" id="meer" aria-labelledby="more-title">
  <div class="wrap">
    <header class="sec__head reveal"><p class="eyebrow">Pizza en meer</p><h2 class="h2" id="more-title">Uit de oven en van de plaat.</h2></header>
    <div class="more__grid">${moreIds.map((id, k) => { const c = cat(id); const top = c.items[0]; return `<a class="tile tile--${id} reveal" style="--d:${k * 70}ms" href="/menukaart/#${id}" data-track="menu-${id}">
      <span class="tile__name">${c.name}</span><span class="tile__blurb">${esc(c.blurb)}</span>
      <span class="tile__from">${c.items.length} gerechten${top && priceOf(top) ? ` · o.a. ${esc(top.name)} ${priceOf(top)}` : ''}</span>${arrow}</a>`; }).join('')}</div>
  </div>
</section>

<section class="sec steps" id="bestellen" aria-labelledby="steps-title">
  ${seam('ink')}
  <div class="wrap">
    <header class="sec__head reveal"><p class="eyebrow">Eenvoudig online bestellen</p><h2 class="h2" id="steps-title">In drie stappen aan tafel.</h2></header>
    <div class="rail" data-rail aria-hidden="true"><span class="rail__track"></span><span class="rail__fill" data-rail-fill></span><span class="rail__mark" data-rail-mark></span></div>
    <ol class="steps__list">
      ${[['Kies je favoriet', 'Ontdek het menu en selecteer je gerecht.'], ['Pas je bestelling aan', 'Selecteer beschikbare opties, formaten, extra’s en sauzen.'], ['Rond je bestelling af', 'Volg de bestel- en betaalstappen in de webshop.']]
        .map(([t, d], i) => `<li class="step reveal" style="--d:${i * 90}ms"><span class="step__no" aria-hidden="true">0${i + 1}</span><h3 class="h3">${t}</h3><p>${d}</p></li>`).join('')}
    </ol>
    <div class="steps__cta reveal">${orderBtn('Bestel bij Camel', 'btn btn--ember btn--lg', { track: 'order-steps' })}<p class="small muted">Je gaat naar onze webshop op ${order.host}. Daar zie je ook of afhalen en bezorgen op dit moment mogelijk zijn.</p></div>
  </div>
</section>

<section class="sec kitchen" id="keuken" aria-labelledby="kitchen-title">
  ${contours()}
  <div class="wrap">
    <header class="sec__head sec__head--row reveal">
      <div><p class="eyebrow">De keuken</p><h2 class="h2" id="kitchen-title">Kijk mee achter de toonbank.</h2></div>
      <p class="sec__lede">Alles wat je bestelt, komt uit deze keuken aan de Oude Markt. Dit is waar het gebeurt.</p>
    </header>
    <ul class="kitchen__grid">${site.kitchen.map((k, i) => `<li class="kcard kcard--${i} reveal" style="--d:${i * 90}ms">
      ${pic(k.photo, { sizes: i === 0 ? '(min-width: 900px) 60vw, 100vw' : '(min-width: 900px) 30vw, 100vw', alt: site.photos[k.photo] })}
      <div class="kcard__cap"><h3 class="h3">${esc(k.title)}</h3><p>${esc(k.text)}</p></div>
    </li>`).join('')}</ul>
  </div>
</section>

<section class="sec owner" id="over" aria-labelledby="about-title">
  <div class="wrap owner__grid">
    <figure class="owner__photo reveal">
      <div class="owner__frame">${brackets}${pic(site.owner.photo, { sizes: '(min-width: 900px) 38vw, 100vw', alt: 'De eigenaar van Camel in de keuken', pos: '50% 30%' })}</div>
      <figcaption>${isTodo(site.owner.name) ? 'De eigenaar' : esc(site.owner.name)}<span class="muted">${isTodo(site.owner.name) ? 'van Camel, in zijn keuken' : 'Eigenaar van Camel'}</span></figcaption>
    </figure>
    <div class="owner__copy reveal" style="--d:120ms">
      <p class="eyebrow">Over ons</p>
      <h2 class="h2" id="about-title">Sinds ${site.owner.since} aan de Oude Markt.</h2>
      <p class="lead">${esc(site.about[0])}</p>
      <p>${esc(site.about[1])}</p>
      <figure class="quote">${brackets}<blockquote><p>“${esc(site.review.text)}”</p></blockquote><figcaption>${esc(site.review.author)}, gast <span class="muted">· via ${esc(site.review.source)}</span></figcaption></figure>
      ${orderBtn('Bestel bij Camel', 'btn btn--ember', { track: 'order-about' })}
    </div>
  </div>
</section>

<section class="terrace" id="terras" aria-labelledby="terrace-title">
  <div class="terrace__bg" aria-hidden="true" data-parallax-bg>${pic('terras-kerk', { sizes: '100vw', pos: '50% 45%', alt: '' })}</div>
  <div class="wrap terrace__grid">
    <div class="terrace__copy reveal">
      <p class="eyebrow eyebrow--amber">Camel in Enschede</p>
      <h2 class="h2" id="terrace-title">Een terras aan de Oude Markt.</h2>
      <p>Onder de parasols kijk je zo uit over het plein en de Grote Kerk. Schuif aan voor een maaltijd of alleen een drankje, of haal je bestelling binnen op.</p>
      <div class="hero__ctas">${btn(loc.mapsUrl, 'Plan je route', 'btn btn--ember', ' target="_blank" rel="noopener" data-track="route"')}${btn('/#contact', 'Openingstijden', 'btn btn--ghost')}</div>
    </div>
    <div class="terrace__stack">
      <div class="terrace__a reveal">${pic('gevel', { sizes: '(min-width: 900px) 24vw, 60vw' })}</div>
      <div class="terrace__b reveal" style="--d:120ms">${pic('ingang', { sizes: '(min-width: 900px) 26vw, 70vw' })}</div>
    </div>
  </div>
</section>

<section class="sec gallery" id="fotos" aria-labelledby="gal-title">
  <div class="wrap">
    <header class="sec__head reveal"><p class="eyebrow">Fotogalerij</p><h2 class="h2" id="gal-title">Een kijkje bij Camel.</h2><p class="sec__lede">Keuken, bar, terras en de Oude Markt. Klik op een foto om hem groot te bekijken.</p></header>
    <ul class="gallery__grid">${Object.keys(site.photos).map((n, i) => `<li class="g g--${IMG[n].h > IMG[n].w ? 'tall' : 'wide'} reveal" style="--d:${(i % 4) * 60}ms"><button class="gallery__item" type="button" data-index="${i}" aria-label="Vergroot foto: ${esc(site.photos[n])}">${pic(n, { sizes: '(min-width: 900px) 33vw, 50vw' })}</button></li>`).join('')}</ul>
  </div>
  <dialog class="lightbox" data-lightbox aria-label="Fotoweergave">
    <figure><img data-lb-img alt=""><figcaption><span data-lb-cap></span> <span class="lightbox__count" data-count></span></figcaption></figure>
    <button class="lightbox__btn lightbox__prev" type="button" data-prev><span aria-hidden="true">←</span><span class="sr-only">Vorige foto</span></button>
    <button class="lightbox__btn lightbox__next" type="button" data-next><span aria-hidden="true">→</span><span class="sr-only">Volgende foto</span></button>
    <button class="lightbox__btn lightbox__close" type="button" data-close><span aria-hidden="true">✕</span><span class="sr-only">Sluiten</span></button>
  </dialog>
  <script type="application/json" data-gallery>${JSON.stringify(Object.entries(site.photos).map(([n, alt]) => ({ src: `/assets/img/${n}-1800.webp`, alt })))}</script>
</section>

<section class="sec faq" id="vragen" aria-labelledby="faq-title">
  <div class="wrap faq__grid">
    <header class="sec__head reveal"><p class="eyebrow">Veelgestelde vragen</p><h2 class="h2" id="faq-title">Goed om te weten.</h2><p class="sec__lede">Staat je vraag er niet bij? Bel <a href="${contact.phoneHref}">${contact.phone}</a>.</p></header>
    <div class="faq__list">${site.faq.map(([q, a]) => {
      const ans = a === 'hours' ? `Camel is dagelijks geopend vanaf ${site.hours[0].open}. De sluitingstijden per dag staan bij <a href="#contact">Contact</a>.`
        : a.startsWith('order.') ? ({ pickup: 'Bij het afrekenen in de webshop zie je welke mogelijkheden er op dat moment zijn. Twijfel je? Bel ons even.', delivery: 'Bij het afrekenen in de webshop zie je of bezorgen op jouw adres mogelijk is en wat het kost. Twijfel je? Bel ons even.', payment: 'De betaalmethoden zie je bij het afrekenen in de webshop.' })[a.slice(6)].replace('Bel ons even.', `Bel ons even op <a href="${contact.phoneHref}">${contact.phone}</a>.`)
        : esc(a).replace(contact.phone, `<a href="${contact.phoneHref}">${contact.phone}</a>`);
      return `<details class="reveal"><summary><span>${esc(q)}</span><span class="faq__icon" aria-hidden="true"></span></summary><div class="faq__a"><p>${ans}</p></div></details>`;
    }).join('')}</div>
  </div>
</section>

<section class="sec contact" id="contact" aria-labelledby="contact-title">
  <div class="wrap contact__grid">
    <div class="reveal">
      <p class="eyebrow">Contact &amp; locatie</p>
      <h2 class="h2" id="contact-title">Kom langs of bel ons.</h2>
      <address class="contact__addr"><strong>${site.name}</strong><br>${loc.street}<br>${loc.postalCode} ${loc.city}</address>
      <div class="contact__btns">
        ${btn(contact.phoneHref, `Bel ${contact.phone}`, 'btn btn--ghost', ' data-track="call"')}
        ${btn(loc.mapsUrl, 'Route plannen', 'btn btn--ghost', ' target="_blank" rel="noopener" data-track="route"')}
        ${orderBtn('Bestel online', 'btn btn--ember', { track: 'order-contact' })}
      </div>
      <p class="small muted">Route opent Google Maps in een nieuw venster.</p>
    </div>
    <div class="contact__hours reveal" style="--d:120ms">
      <h3 class="h3">Openingstijden</h3>
      ${hoursTable()}
    </div>
  </div>
</section>

<section class="final" aria-labelledby="final-title">
  <div class="final__bg" aria-hidden="true">${pic('doner-spies', { sizes: '100vw', pos: '50% 40%', alt: '' })}</div>
  ${contours('contours--final')}
  <div class="wrap final__in reveal">
    <h2 class="h2 h2--xl" id="final-title">Trek gekregen? <span class="ember">Camel staat klaar.</span></h2>
    <p class="lead">Ontdek het menu en kies jouw favoriet.</p>
    <div class="hero__ctas">${orderBtn('Bestel nu', 'btn btn--ember btn--lg', { track: 'order-final' })}${btn('/menukaart/', 'Bekijk de menukaart', 'btn btn--ghost btn--lg', ' data-track="menu-final"')}</div>
  </div>
</section>`, '/');

// ── menukaart ──────────────────────────────────────────────────────────────
const menuPage = () => page({
  title: `Menukaart ${site.short} Grillroom Enschede | Kapsalon, shoarma, pizza`,
  description: `De volledige menukaart van ${site.name}: broodjes, dürüm, kapsalon, dönerbox, lahmacun, pizza’s, schotels en Camel Mix Grill. Oude Markt 9A, Enschede.`,
}, `
<section class="mhero">
  <div class="wrap">
    <p class="eyebrow"><a href="/">Home</a> / Menukaart</p>
    <h1 class="h1">Menukaart</h1>
    <p class="lead">Alle gerechten van Camel. Klik op <strong>Bestel</strong> om het gerecht in de webshop te openen, opties te kiezen en af te rekenen.</p>
    <div class="mhero__tools">
      <label class="search"><span class="sr-only">Zoek een gerecht</span><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m13 13 5 5" stroke="currentColor" stroke-width="1.8"/></svg><input type="search" placeholder="Zoek een gerecht, bv. falafel" data-search autocomplete="off"></label>
      ${orderBtn('Naar de webshop', 'btn btn--ember', { track: 'order-menu' })}
    </div>
    <p class="small muted" data-search-status role="status" aria-live="polite"></p>
  </div>
</section>
<nav class="tabs" aria-label="Categorieën" data-tabs>
  <div class="tabs__in">${menu.categories.map((c) => `<a href="#${c.id}">${c.name}</a>`).join('')}</div>
</nav>
<div class="wrap menu">
  ${priceNote()}
  ${menu.categories.map((c) => `<section class="mcat" id="${c.id}" aria-labelledby="h-${c.id}">
    <header class="mcat__head"><h2 class="h2" id="h-${c.id}">${c.name}</h2><p class="muted">${esc(c.blurb)}${c.from ? ' Alle prijzen zijn vanaf-prijzen; extra’s kies je in de webshop.' : ''}${c.note ? ` ${v(c.note)}` : ''}</p></header>
    ${c.items.length ? `<ul class="rows">${c.items.map((i) => menuRow(i, c)).join('')}</ul>` : `<div class="mcat__empty">${c.photo ? pic(c.photo, { sizes: '(min-width: 900px) 360px, 60vw' }) : ''}<div><p>Bekijk het actuele aanbod in de webshop.</p>${orderBtn(`${c.name} bekijken`, 'btn btn--ghost', { c, track: 'order-cat' })}</div></div>`}
  </section>`).join('')}
  <p class="menu__empty" data-search-empty hidden>Geen gerecht gevonden. Probeer een ander woord of <a href="${contact.phoneHref}">bel ons</a>.</p>
</div>
<section class="final final--slim" aria-labelledby="final-title">
  <div class="wrap final__in"><h2 class="h2" id="final-title">Gekozen? <span class="ember">Bestel bij Camel.</span></h2>
  <div class="hero__ctas">${orderBtn('Bestel nu', 'btn btn--ember btn--lg', { track: 'order-final' })}${btn(contact.phoneHref, `Bel ${contact.phone}`, 'btn btn--ghost btn--lg', ' data-track="call"')}</div></div>
</section>`, '/menukaart/');

// ── overige pagina's ───────────────────────────────────────────────────────
const privacy = () => page({ title: `Privacy & cookies | ${site.name}`, description: `Privacy- en cookieverklaring van de website van ${site.name}.` }, `
<section class="mhero"><div class="wrap prose">
  <p class="eyebrow"><a href="/">Home</a> / Privacy</p>
  <h1 class="h1">Privacy &amp; cookies</h1>
  <p>Deze website (${site.url.replace('https://', '')}) verzamelt zelf geen persoonsgegevens. Er zijn geen formulieren, geen trackers en geen cookies. Lettertypen en scripts worden vanaf deze eigen server geladen, niet via derden.</p>
  <h2 class="h3">Online bestellen</h2>
  <p>Bestellen gebeurt in de webshop van Camel op <a href="${order.url}">${order.host}</a>. Daar worden je naam, adres, telefoonnummer en bestelling verwerkt om je bestelling uit te voeren. Voor die gegevensverwerking geldt de privacyverklaring van de webshop.</p>
  <h2 class="h3">Externe links</h2>
  <p>De knop “Route plannen” opent Google Maps. Daarvoor gelden de voorwaarden van Google.</p>
  <h2 class="h3">Vragen</h2>
  <p>${site.name}, ${loc.street}, ${loc.postalCode} ${loc.city}. Telefoon: <a href="${contact.phoneHref}">${contact.phone}</a>.</p>
</div></section>`, '/privacy/');

const notFound = () => page({ title: `Pagina niet gevonden | ${site.name}`, description: 'Deze pagina bestaat niet (meer).' }, `
<section class="mhero mhero--center"><div class="wrap">
  <p class="eyebrow">404</p><h1 class="h1">Deze pagina is op.</h1>
  <p class="lead">Maar de grill staat nog aan.</p>
  <div class="hero__ctas">${btn('/menukaart/', 'Bekijk de menukaart', 'btn btn--ember')}${btn('/', 'Naar home', 'btn btn--ghost')}</div>
</div></section>`, '/404');

// Oude URL /contact/ van grillroomcamel.nl blijft werken (301 via .htaccess / _redirects; dit is de fallback).
const redirectPage = (to) => `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Doorsturen…</title><meta name="robots" content="noindex"><link rel="canonical" href="${site.url}${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p><a href="${to}">Ga verder</a></p></body></html>`;

// ── structured data (alleen live, alleen zichtbare gegevens) ──────────────
const jsonLd = () => {
  if (site.draft) return '';
  const days = site.hours.filter((h) => has(h.close)).map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${({ Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' })[h.dow]}`, opens: h.open, closes: h.close }));
  const data = {
    '@context': 'https://schema.org', '@type': 'Restaurant', name: site.name, url: `${site.url}/`,
    image: `${site.url}/assets/og.jpg`, telephone: '+31534324663',
    address: { '@type': 'PostalAddress', streetAddress: loc.street, postalCode: loc.postalCode, addressLocality: loc.city, addressRegion: loc.region, addressCountry: loc.country },
    servesCuisine: ['Midden-Oosters', 'Turks', 'Grill', 'Pizza'], hasMenu: `${site.url}/menukaart/`,
    acceptsReservations: false, potentialAction: { '@type': 'OrderAction', target: order.url },
    ...(site.hoursVerified ? { openingHoursSpecification: days } : {}),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
};

// ── schrijven ──────────────────────────────────────────────────────────────
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(new URL('./assets/', import.meta.url).pathname, `${OUT}assets/`, { recursive: true, filter: (f) => !f.endsWith('manifest.json') });
const w = async (path, html) => { await mkdir(`${OUT}${path}`.replace(/[^/]+$/, ''), { recursive: true }); await writeFile(`${OUT}${path}`, html); };

await w('index.html', home().replace('</head>', `${jsonLd()}\n</head>`));
await w('menukaart/index.html', menuPage());
await w('privacy/index.html', privacy());
await w('404.html', notFound());
await w('contact/index.html', redirectPage('/#contact'));
await w('robots.txt', site.draft ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
await w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/', '/menukaart/', '/privacy/'].map((p) => `  <url><loc>${site.url}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
await w('.htaccess', `# Apache: 301 voor oude URL's, 404-pagina en caching\nErrorDocument 404 /404.html\nRedirectMatch 301 ^/contact/?$ /#contact\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType image/avif "access plus 1 year"\n  ExpiresByType image/webp "access plus 1 year"\n  ExpiresByType font/woff2 "access plus 1 year"\n  ExpiresByType text/css "access plus 1 week"\n  ExpiresByType text/javascript "access plus 1 week"\n</IfModule>\n`);
await w('_redirects', '/contact  /#contact  301\n/contact/  /#contact  301\n');

// Social-preview: echte foto, 1200×630.
await sharp(new URL('./photos-src/doner-spies.jpg', import.meta.url).pathname).rotate()
  .resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 78, mozjpeg: true }).toFile(`${OUT}assets/og.jpg`);

console.log(`public/ gebouwd · ${openTodos} open placeholders · draft=${site.draft}`);
