// Bouwt ./public uit src/site.mjs en assets/. Gebruik: node build.mjs
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { site, isTodo } from './src/site.mjs';

const OUT = new URL('./public/', import.meta.url).pathname;

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const has = (v) => v != null && v !== '' && !isTodo(v);
/** Waarde of een gemarkeerde placeholder. */
const v = (x) => (isTodo(x) ? `<span class="ph" title="Placeholder — nog te bevestigen">te bevestigen: ${esc(x.label)}</span>` : esc(x));
const plain = (x, fallback = '') => (has(x) ? String(x) : fallback);
const euro = (p) => (typeof p === 'number' ? `€ ${p}` : /^[\d,]+$/.test(p) ? `€ ${p}` : /^v\.a\. /.test(p) ? `v.a. € ${p.slice(5)}` : /^\d/.test(p) ? `€ ${p}` : p);

const img = (name, alt, w, h, { eager = false, cls = '', sizes } = {}) =>
  `<img class="${cls}" src="/assets/img/${name}.webp" width="${w}" height="${h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${sizes ? ` sizes="${sizes}"` : ''}>`;
const logo = (cls = '') => `<span class="logo ${cls}" aria-hidden="true"></span>`;
const arrow = `<svg class="arr" viewBox="0 0 16 10" aria-hidden="true"><path d="M0 5h15M10.5.5 15 5l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`;
const btn = (href, label, cls = 'btn', attrs = '') => `<a class="${cls}" href="${href}"${attrs}><span>${label}</span>${arrow}</a>`;
/** Kop met regel-voor-regel onthulling; de volledige tekst blijft één h-element. */
const lines = (...ls) => ls.map((l, i) => `<span class="ln"><span style="--i:${i}">${l}</span></span>`).join(' ');

const c = site.contact;
const city = site.location.city;
const year = new Date().getFullYear();
const offer = site.offer.active ? site.offer : null;
const igLink = (label = `@${c.handle}`) => `<a href="${esc(c.instagram)}" target="_blank" rel="noopener">${label}<span class="sr-only"> (opent Instagram)</span></a>`;

const nav = [
  ['#kliniek', 'De kliniek'],
  ['#behandelingen', 'Behandelingen'],
  ['#resultaten', 'Resultaten'],
  ['#prijzen', 'Prijzen'],
  ['#voorbereiding', 'Voorbereiding'],
];

// ── layout ─────────────────────────────────────────────────────────────────
const head = ({ title, description, path }) => {
  const base = plain(site.url);
  const canonical = base ? `${base}${path}` : null;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n` : ''}<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${base ? `<meta property="og:image" content="${esc(base)}/assets/img/og-image.jpg">\n` : ''}<meta name="theme-color" content="#f5efe7">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/bodoni-moda.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
${jsonLd()}
<script>document.documentElement.classList.add('js')</script>
<script src="/assets/js/main.js" defer></script>
</head>`;
};

/** Structured data: alleen bevestigde velden, en niets zolang de site een concept is. */
function jsonLd() {
  if (site.draft) return '';
  const l = site.location;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: site.name,
    url: plain(site.url) || undefined,
    telephone: plain(c.phone) || undefined,
    email: plain(c.email) || undefined,
    address: { '@type': 'PostalAddress', streetAddress: plain(l.street) || undefined, postalCode: plain(l.postalCode) || undefined, addressLocality: l.city, addressCountry: l.country },
    sameAs: [c.instagram],
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

const header = () => `
<a class="skip" href="#main">Naar de inhoud</a>
${site.draft ? `<div class="draftbar" role="note"><span>Ontwikkelversie — gemarkeerde gegevens zijn placeholders en moeten nog door de kliniek worden bevestigd.</span><button type="button" onclick="this.parentNode.remove()"><span aria-hidden="true">×</span><span class="sr-only">Melding sluiten</span></button></div>` : ''}
<header class="masthead" data-masthead>
  <a class="brand" href="/#top">${logo()}<span class="sr-only">${esc(site.name)} — naar boven</span></a>
  <nav class="nav" aria-label="Hoofdmenu">
    <ul>${nav.map(([h, l]) => `<li><a href="/${h}">${l}</a></li>`).join('')}</ul>
  </nav>
  ${btn('/#afspraak', 'Afspraak maken', 'pill', ' data-magnetic')}
  <button class="burger" type="button" aria-expanded="false" aria-controls="sheet"><span class="sr-only">Menu openen</span><i></i><i></i></button>
</header>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="sheet__top">${logo()}<button class="sheet__close" type="button"><span class="sr-only">Menu sluiten</span><i></i><i></i></button></div>
  <nav aria-label="Menu mobiel"><ol>${[...nav, ['#afspraak', 'Afspraak maken']].map(([h, l], i) => `<li style="--i:${i}"><a href="/${h}"><small>0${i + 1}</small>${l}</a></li>`).join('')}</ol></nav>
  <p class="sheet__foot">${esc(city)} · ${igLink()}</p>
</div>`;

const footer = () => `
<footer class="footer">
  <div class="footer__brand">${logo('logo--xl')}<p>Laser &amp; Beauty Clinic · ${esc(city)}</p></div>
  <nav class="footer__nav" aria-label="Footer"><ul>${[...nav, ['#afspraak', 'Afspraak maken']].map(([h, l]) => `<li><a href="/${h}">${l}</a></li>`).join('')}</ul></nav>
  <div class="footer__contact">
    <p><span class="k">Instagram</span>${igLink()}</p>
    <p><span class="k">Adres</span>${v(site.location.street)}, ${esc(city)}</p>
    <p><span class="k">Telefoon</span>${has(c.phone) && c.phoneHref ? `<a href="${esc(c.phoneHref)}">${esc(c.phone)}</a>` : v(c.phone)}</p>
  </div>
  <div class="footer__foot">
    <p>© ${year} ${esc(site.name)}</p>
    <p><a href="/privacy/">Privacy</a></p>
    <p>Prijzen zoals gepubliceerd op Instagram; wijzigingen voorbehouden.</p>
  </div>
</footer>
<div class="dock" data-dock>${btn('/#afspraak', 'Afspraak maken', 'btn btn--block')}</div>
<dialog class="lightbox" data-lightbox aria-label="Resultaat vergroot">
  <figure class="lightbox__fig"><div class="lightbox__stage" data-stage></div><figcaption data-caption></figcaption></figure>
  <p class="lightbox__count" data-count></p>
  <button class="lightbox__btn lightbox__prev" type="button" data-prev><span class="sr-only">Vorige</span>${arrow}</button>
  <button class="lightbox__btn lightbox__next" type="button" data-next><span class="sr-only">Volgende</span>${arrow}</button>
  <button class="lightbox__btn lightbox__close" type="button" data-close><span class="sr-only">Sluiten</span><i></i><i></i></button>
</dialog>`;

const page = (meta, body, cls = '') => `${head(meta)}
<body class="${cls}">
<div class="progress" aria-hidden="true"><i data-progress></i></div>
${header()}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;

// ── homepage-secties ──────────────────────────────────────────────────────
const hero = () => `
<section class="hero" id="top" aria-labelledby="hero-title" data-hero>
  <div class="hero__copy">
    <p class="eyebrow reveal">Laser &amp; Beauty Clinic <i aria-hidden="true"></i> ${esc(city)}</p>
    <h1 id="hero-title" class="hero__title"><span class="sr-only">Laserontharing in ${esc(city)}: </span>${lines('Glad.', '<em>Pijnloos.</em>', 'Definitief.')}</h1>
    <p class="lead reveal" style="--d:.55s">Definitieve laserontharing voor vrouwen en mannen, plasmalift, microneedling en lipfillers. In een rustige kliniek in ${esc(city)}, met prijzen die je vooraf kent.</p>
    <div class="actions reveal" style="--d:.7s">
      ${offer ? btn('#afspraak', `Plan je gratis proefbehandeling`, 'btn', ' data-magnetic data-pick="proef"') : btn('#afspraak', 'Afspraak maken', 'btn', ' data-magnetic')}
      ${btn('#prijzen', 'Bekijk de prijzen', 'link')}
    </div>
    <ul class="hero__facts reveal" style="--d:.85s" aria-label="In het kort">
      <li><strong>Vrouwen &amp; mannen</strong></li>
      <li>Fullbody <strong>${euro(site.prices[0].items.find(([n]) => n === 'Fullbody')[1])}</strong></li>
      <li><strong>${esc(c.followers.count)}</strong> volgers op Instagram</li>
    </ul>
  </div>
  <div class="stage" data-stage aria-hidden="true">
    <div class="rig" data-rig>
      <span class="layer mono" style="--z:-320;--x:-6%;--y:-4%">${logo()}</span>
      <span class="layer arch-line" style="--z:-170"></span>
      <figure class="layer plate plate--back" style="--z:-110">${img('kliniek-receptie', '', 394, 526, { eager: true })}</figure>
      <figure class="layer plate plate--main" style="--z:0">${img('laser-gezicht', '', 394, 526, { eager: true })}<span class="scan"></span></figure>
      <figure class="layer plate plate--front" style="--z:140">${img('laser-arm', '', 394, 525, { eager: true })}</figure>
      <span class="layer orb" style="--z:80"></span>
      ${offer ? `<div class="layer glass" style="--z:220"><span class="glass__k">Laserontharing · ${esc(offer.zone)}</span><span class="glass__v">Proef&shy;behandeling <em>gratis</em></span></div>` : ''}
    </div>
  </div>
  <a class="cue" href="#kliniek"><span>Ontdek</span><i aria-hidden="true"></i></a>
</section>`;

const clinic = () => `
<section class="clinic section" id="kliniek" aria-labelledby="kliniek-title">
  <div class="clinic__media">
    <figure class="frame frame--tall reveal-img" data-parallax="-0.06">${img('kliniek-receptie', 'De receptie van Nisuda Clinic, met het logo op de wand', 394, 526)}</figure>
    <figure class="frame frame--float reveal-img" style="--d:.2s" data-parallax="0.1">${img('laser-behandeling', 'Een cliënt met beschermbril tijdens een laserbehandeling in het gezicht', 394, 451)}</figure>
    <p class="clinic__tag" aria-hidden="true"><span>Laser &amp; Beauty</span> ${esc(city)}</p>
  </div>
  <div class="clinic__copy">
    <p class="eyebrow reveal">01 <i aria-hidden="true"></i> De kliniek</p>
    <h2 id="kliniek-title" class="title">${lines('Huid waar je je', '<em>goed</em> in voelt.')}</h2>
    <p class="statement" data-words>Nisuda Clinic is een laser- en beautykliniek in ${esc(city)}, voor vrouwen én mannen. Van pijnloze, definitieve laserontharing tot plasmalift en lipfillers — met eerlijke prijzen die je vooraf kent.</p>
    <ol class="pillars">
      <li class="reveal"><span class="pillars__nr">I</span><h3>Pijnloos &amp; definitief</h3><p>Laserontharing voor elke zone, van het gezicht tot fullbody.</p></li>
      <li class="reveal" style="--d:.08s"><span class="pillars__nr">II</span><h3>Vrouwen &amp; mannen</h3><p>Een eigen prijslijst voor vrouwen en voor mannen, per zone.</p></li>
      <li class="reveal" style="--d:.16s"><span class="pillars__nr">III</span><h3>Prijzen vooraf</h3><p>Je weet wat je betaalt voordat je op de behandelstoel zit.</p></li>
    </ol>
  </div>
</section>`;

const services = () => `
<section class="services section" id="behandelingen" aria-labelledby="behandelingen-title">
  <div class="section__head">
    <p class="eyebrow reveal">02 <i aria-hidden="true"></i> Behandelingen</p>
    <h2 id="behandelingen-title" class="title">${lines('Eén kliniek,', '<em>zes</em> specialismen.')}</h2>
    <p class="body reveal">Kies een behandeling en zie direct wat het kost.</p>
  </div>
  <ol class="index" data-index>
    ${site.treatments.map((t, i) => `
    <li class="index__row reveal" style="--d:${i * 0.05}s">
      <a href="#prijzen" data-tab="${t.tab}" ${t.img ? `data-peek="/assets/img/${t.img}.webp"` : `data-peek-text="${esc(t.name)}"`}>
        <span class="index__nr">${t.nr}</span>
        <span class="index__name">${esc(t.name)}</span>
        <span class="index__short">${esc(t.short)}</span>
        <span class="index__from"><small>${/^€/.test(t.from) ? 'vanaf' : ''}</small>${esc(t.from)}</span>
        ${t.img ? `<span class="index__thumb">${img(t.img, t.imgAlt, 394, 526)}</span>` : ''}
        <span class="index__go">${arrow}<span class="sr-only">Bekijk prijzen ${esc(t.name.toLowerCase())}</span></span>
      </a>
    </li>`).join('')}
  </ol>
  <div class="peek" data-peek-el aria-hidden="true"><div class="peek__card"><img alt="" data-peek-img hidden><span data-peek-txt></span></div></div>
</section>`;

const results = () => {
  const cats = [['alles', 'Alles'], ['laser', 'Laser'], ['plasmalift', 'Plasmalift'], ['huid', 'Huid'], ['lichaam', 'Lichaam']]
    .filter(([k]) => k === 'alles' || site.results.some((r) => r.cat === k));
  return `
<section class="results section" id="resultaten" aria-labelledby="resultaten-title">
  <div class="section__head section__head--split">
    <div>
      <p class="eyebrow reveal">03 <i aria-hidden="true"></i> Resultaten</p>
      <h2 id="resultaten-title" class="title">${lines('Het verschil,', '<em>zichtbaar</em>.')}</h2>
    </div>
    <div>
      <p class="body reveal">Voor- en nafoto's zoals de kliniek ze deelt op ${igLink('Instagram')}. Resultaten verschillen per persoon en per huidtype.</p>
      <div class="filters reveal" role="group" aria-label="Filter op behandeling">
        ${cats.map(([k, l], i) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="${i === 0}">${l}<sup>${k === 'alles' ? site.results.length : site.results.filter((r) => r.cat === k).length}</sup></button>`).join('')}
      </div>
    </div>
  </div>
  <ul class="wall" data-wall>
    ${site.results.map((r, i) => `
    <li class="wall__item${r.wide ? ' is-wide' : ''}${r.tall ? ' is-tall' : ''}" data-cat="${r.cat}">
      <button type="button" class="tile reveal-img" data-tilt data-index="${i}" style="--d:${(i % 3) * 0.08}s">
        ${img(r.src, `${r.title}: ${r.caption.toLowerCase()}`, r.w, r.h)}
        <span class="tile__glare" aria-hidden="true"></span>
        <span class="tile__cap"><span class="tile__cat">${r.cat}</span><strong>${esc(r.title)}</strong><span>${esc(r.caption)}</span></span>
        <span class="sr-only">— vergroten</span>
      </button>
    </li>`).join('')}
  </ul>
  <p class="results__more reveal">Meer resultaten op ${igLink()}</p>
</section>`;
};

const priceRow = ([name, price, hl]) => `<li class="${hl ? 'is-hl' : ''}"><span class="pl__n">${esc(name)}</span><i aria-hidden="true"></i><span class="pl__p">${esc(euro(price))}</span></li>`;
const prices = () => `
<section class="prices section" id="prijzen" aria-labelledby="prijzen-title">
  <div class="prices__inner">
    <div class="section__head">
      <p class="eyebrow reveal">04 <i aria-hidden="true"></i> Prijzen</p>
      <h2 id="prijzen-title" class="title">${lines('Helder geprijsd,', '<em>per zone</em>.')}</h2>
    </div>
    <div class="tabs reveal" role="tablist" aria-label="Prijslijsten" data-tabs>
      ${site.prices.map((p, i) => `<button type="button" role="tab" id="tab-${p.id}" aria-controls="panel-${p.id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${esc(p.label)}</button>`).join('')}
    </div>
    <div class="prices__grid">
      <div class="prices__panels">
      ${site.prices.map((p, i) => `
        <div class="panel" role="tabpanel" id="panel-${p.id}" aria-labelledby="tab-${p.id}" tabindex="0"${i ? ' hidden' : ''}>
          <div class="panel__head"><h3>${esc(p.title)}</h3>${p.asOf ? `<p class="panel__asof">${esc(p.asOf)}${p.verify ? ' · <span class="ph" title="Placeholder — nog te bevestigen">actualiteit te bevestigen</span>' : ''}</p>` : ''}</div>
          ${p.items.length ? `<ul class="pl">${p.items.map(priceRow).join('')}</ul>` : ''}
          ${p.zones && !p.showPrices ? `<ul class="zones">${p.zones.map((z) => `<li>${esc(z)}</li>`).join('')}</ul>` : ''}
          ${p.techniques ? `<dl class="techniques">${p.techniques.map(([n, d]) => `<div><dt>${esc(n)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>` : ''}
          ${p.note ? `<p class="panel__note">${esc(p.note)}</p>` : ''}
          ${btn('#afspraak', p.id === 'injectables' ? 'Plan een consult' : 'Vraag een afspraak aan', 'link link--light', ` data-pick="${{ 'laser-vrouw': 'laser', 'laser-man': 'laser', overig: 'overig' }[p.id] ?? p.id}"${p.id === 'laser-man' ? ' data-gender="man"' : p.id === 'laser-vrouw' ? ' data-gender="vrouw"' : ''}`)}
        </div>`).join('')}
      </div>
      <aside class="prices__aside">
        ${offer ? `
        <div class="ticket" data-tilt>
          <span class="tile__glare" aria-hidden="true"></span>
          <p class="ticket__k">Nieuw bij Nisuda?</p>
          <p class="ticket__v">${esc(offer.title.replace(' gratis', ''))} <em>gratis</em></p>
          <p class="ticket__t">${esc(offer.text)}</p>
          <p class="ticket__n">${esc(offer.note)}</p>
          ${btn('#afspraak', 'Plan vrijblijvend', 'btn btn--light', ' data-pick="proef" data-magnetic')}
        </div>` : ''}
        <p class="prices__hint">Stel in het aanvraagformulier je eigen combinatie van zones samen en zie direct je prijsindicatie.</p>
      </aside>
    </div>
  </div>
</section>`;

const care = () => `
<section class="care section" id="voorbereiding" aria-labelledby="voorbereiding-title">
  <div class="care__aside">
    <p class="eyebrow reveal">05 <i aria-hidden="true"></i> Voorbereiding</p>
    <h2 id="voorbereiding-title" class="title">${lines('Het beste', 'resultaat begint', '<em>thuis</em>.')}</h2>
    <figure class="frame frame--arch reveal-img" data-parallax="-0.05">${img('laser-gezicht', 'Laserbehandeling in het gezicht, met beschermbril', 394, 526)}</figure>
  </div>
  <div class="care__lists">
    ${[['Vóór je afspraak', site.care.before], ['Na je behandeling', site.care.after]].map(([h, list], g) => `
    <div class="care__group">
      <h3 class="reveal">${h}</h3>
      <ol>${list.map((t, i) => `<li class="reveal" style="--d:${i * 0.05}s"><span>${String(i + 1 + g * site.care.before.length).padStart(2, '0')}</span><p>${esc(t)}</p></li>`).join('')}</ol>
    </div>`).join('')}
    <p class="care__cancel reveal"><strong>Afspraak verzetten?</strong> ${esc(site.care.cancel)}</p>
  </div>
</section>`;

const reviews = () => {
  if (!site.reviews.length && !site.draft) return '';
  return `
<section class="reviews section" id="ervaringen" aria-labelledby="ervaringen-title">
  <p class="eyebrow reveal">06 <i aria-hidden="true"></i> Ervaringen</p>
  <h2 id="ervaringen-title" class="title">${lines('In de woorden', 'van <em>cliënten</em>.')}</h2>
  ${site.reviews.length ? `<ul class="quotes">${site.reviews.map((r) => `<li class="reveal"><blockquote><p>${esc(r.text)}</p><footer>— ${esc(r.author)}${r.source ? `, ${esc(r.source)}` : ''}</footer></blockquote></li>`).join('')}</ul>`
    : `<div class="quotes quotes--empty">
    <figure class="quote-ph reveal"><span class="quote-ph__mark" aria-hidden="true">“</span><blockquote><p>${v({ todo: true, label: 'echte reviews van cliënten (met toestemming) — er staan hier bewust geen verzonnen reviews' })}</p></blockquote></figure>
    <a class="ig-card reveal" href="${esc(c.instagram)}" target="_blank" rel="noopener" data-tilt><span class="tile__glare" aria-hidden="true"></span><span class="ig-card__n">${esc(c.followers.count)}</span><span class="ig-card__t">volgers op Instagram</span><span class="ig-card__h">@${esc(c.handle)} ${arrow}</span><span class="sr-only"> (opent Instagram)</span></a>
  </div>`}
</section>`;
};

const laserZones = (who) => site.prices.find((p) => p.id === `laser-${who}`).items;
const zoneChips = (who) => `<div class="chips" data-zones="${who}"${who === 'man' ? ' hidden' : ''}>${laserZones(who).map(([n, p]) =>
  `<label class="chip chip--check"><input type="checkbox" name="zone-${who}" value="${esc(n)}" data-price="${p}"${n === 'Fullbody' ? ' data-full' : ''}><span>${esc(n)} <small>€ ${p}</small></span></label>`).join('')}</div>`;

const booking = () => {
  const choices = [
    ...(offer ? [['proef', `Gratis proefbehandeling ${offer.zone}`]] : []),
    ['laser', 'Laserontharing'], ['plasmalift', 'Plasmalift'], ['microneedling', 'Microneedling'],
    ['lipfiller', 'Lipfiller'], ['injectables', 'Consult rimpelbehandeling'], ['lichaam', 'EMS / vetbevriezing'], ['overig', 'Iets anders'],
  ];
  const plasma = site.prices.find((p) => p.id === 'plasmalift').items.map(([n]) => n);
  const today = new Date().toISOString().slice(0, 10);
  return `
<section class="booking section" id="afspraak" aria-labelledby="afspraak-title">
  <div class="booking__intro">
    <p class="eyebrow reveal">07 <i aria-hidden="true"></i> Afspraak</p>
    <h2 id="afspraak-title" class="title">${lines('Plan je', '<em>moment</em>.')}</h2>
    <p class="body reveal">Vul je wensen in; de kliniek bevestigt je afspraak persoonlijk. Er staat geen online agenda klaar, dus je aanvraag is pas definitief na die bevestiging.</p>
    <ol class="steps">
      <li class="reveal"><span>01</span>Kies je behandeling en voorkeur</li>
      <li class="reveal" style="--d:.06s"><span>02</span>Stuur je aanvraag naar de kliniek</li>
      <li class="reveal" style="--d:.12s"><span>03</span>Je krijgt een persoonlijke bevestiging</li>
    </ol>
    <p class="booking__alt reveal">Liever direct contact? Stuur een DM via ${igLink()}.</p>
  </div>
  <div class="booking__card reveal">
    <form class="form" data-form novalidate
      data-endpoint="${esc(site.form.endpoint ?? '')}" data-dm="${esc(c.dm)}" data-whatsapp="${esc(c.whatsapp ?? '')}" data-email="${esc(plain(c.email))}">
      <div class="form__summary" data-summary tabindex="-1" hidden></div>

      <fieldset class="field" data-field="behandeling">
        <legend>Waarvoor kom je? <span class="req" aria-hidden="true">*</span></legend>
        <div class="chips">${choices.map(([val, l]) => `<label class="chip chip--radio"><input type="radio" name="behandeling" value="${val}" data-label="${esc(l)}" required><span>${esc(l)}</span></label>`).join('')}</div>
        <p class="field__err" id="err-behandeling" data-err></p>
      </fieldset>

      <div class="cond" data-when="laser" hidden>
        <fieldset class="field">
          <legend>Voor wie?</legend>
          <div class="seg">${['vrouw', 'man'].map((g, i) => `<label><input type="radio" name="voor" value="${g}"${i ? '' : ' checked'}><span>${g[0].toUpperCase() + g.slice(1)}</span></label>`).join('')}</div>
        </fieldset>
        <fieldset class="field" data-field="zones">
          <legend>Welke zones? <span class="req" aria-hidden="true">*</span></legend>
          ${zoneChips('vrouw')}${zoneChips('man')}
          <p class="field__err" id="err-zones" data-err></p>
          <p class="estimate" aria-live="polite"><span>Indicatie per behandeling</span><output data-total>€ 0</output></p>
          <p class="field__hint" data-total-hint hidden></p>
        </fieldset>
      </div>

      <div class="cond" data-when="plasmalift" hidden>
        <fieldset class="field">
          <legend>Welke zone(s)? <small>optioneel</small></legend>
          <div class="chips">${plasma.map((n) => `<label class="chip chip--check"><input type="checkbox" name="zone-plasma" value="${esc(n)}"><span>${esc(n)}</span></label>`).join('')}</div>
        </fieldset>
      </div>

      <div class="cond" data-when="lipfiller" hidden>
        <div class="row">
          <div class="field"><label for="f-ml">Hoeveel ml?</label><select id="f-ml" name="ml"><option>1 ml</option><option>2 ml</option><option>Weet ik nog niet</option></select></div>
          <label class="check"><input type="checkbox" name="samen"><span>Ik kom samen met iemand (€ 159,99 per ml)</span></label>
        </div>
      </div>

      <div class="row">
        <div class="field" data-field="naam"><label for="f-naam">Naam <span class="req" aria-hidden="true">*</span></label><input id="f-naam" name="naam" autocomplete="name" required aria-describedby="err-naam"><p class="field__err" id="err-naam" data-err></p></div>
        <div class="field" data-field="telefoon"><label for="f-tel">Telefoon <span class="req" aria-hidden="true">*</span></label><input id="f-tel" name="telefoon" type="tel" autocomplete="tel" inputmode="tel" required aria-describedby="err-telefoon"><p class="field__err" id="err-telefoon" data-err></p></div>
      </div>
      <div class="field" data-field="email"><label for="f-mail">E-mail <small>optioneel</small></label><input id="f-mail" name="email" type="email" autocomplete="email" aria-describedby="err-email"><p class="field__err" id="err-email" data-err></p></div>
      <div class="row">
        <div class="field" data-field="datum"><label for="f-datum">Voorkeursdatum <small>optioneel</small></label><input id="f-datum" name="datum" type="date" min="${today}" aria-describedby="err-datum"><p class="field__err" id="err-datum" data-err></p></div>
        <div class="field"><label for="f-dagdeel">Dagdeel</label><select id="f-dagdeel" name="dagdeel"><option value="">Geen voorkeur</option><option>Ochtend</option><option>Middag</option><option>Avond</option></select></div>
      </div>
      <div class="field"><label for="f-bericht">Opmerking <small>optioneel</small></label><textarea id="f-bericht" name="bericht" rows="3" placeholder="Bijvoorbeeld je huidtype, medicijngebruik of een vraag"></textarea></div>
      <div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
      <button class="btn btn--block form__submit" type="submit" data-submit data-magnetic><span>Aanvraag versturen</span>${arrow}</button>
      <p class="form__privacy">Je gegevens worden alleen gebruikt om je afspraak in te plannen. <a href="/privacy/">Privacy</a></p>
    </form>
    <div class="form__result" data-result tabindex="-1" aria-live="polite" hidden></div>
  </div>
</section>`;
};

const finale = () => `
<section class="finale" aria-labelledby="finale-title" data-finale>
  <div class="finale__mark" aria-hidden="true" data-depth-logo>${logo('l1')}${logo('l3')}</div>
  <h2 id="finale-title" class="display">${lines('Klaar voor', '<em>gladde huid?</em>')}</h2>
  <div class="actions reveal" style="--d:.3s">
    ${btn('#afspraak', offer ? 'Plan je gratis proefbehandeling' : 'Afspraak maken', 'btn btn--light', ` data-magnetic${offer ? ' data-pick="proef"' : ''}`)}
    ${btn(esc(c.instagram), 'Volg @' + esc(c.handle) + '<span class="sr-only"> (opent Instagram)</span>', 'link link--light', ' target="_blank" rel="noopener"')}
  </div>
</section>`;

// ── pagina's ───────────────────────────────────────────────────────────────
const home = page(
  {
    title: `${site.name} — laserontharing & beauty in ${city}`,
    description: `${site.name} in ${city}: pijnloze, definitieve laserontharing voor vrouwen en mannen (fullbody vanaf € 100), plasmalift, microneedling en lipfillers. Bekijk prijzen en resultaten en vraag direct een afspraak aan.`,
    path: '/',
  },
  [hero(), clinic(), services(), results(), prices(), care(), reviews(), booking(), finale()].join('\n'),
);

const privacy = page(
  { title: `Privacy — ${site.name}`, description: `Hoe ${site.name} omgaat met je gegevens op deze website.`, path: '/privacy/' },
  `<section class="section prose">
  <p class="eyebrow">Privacy</p>
  <h1 class="title">Privacyverklaring</h1>
  <p>${v({ todo: true, label: 'juridisch te controleren tekst — dit is een technische beschrijving van de website, geen volledige privacyverklaring' })}</p>
  <h2>Wat deze website doet</h2>
  <ul>
    <li>Deze website plaatst geen cookies en gebruikt geen analytics-, advertentie- of trackingscripts. Lettertypen en scripts komen van deze website zelf.</li>
    <li>${site.form.endpoint
      ? 'Vul je het aanvraagformulier in, dan worden je naam, telefoonnummer, eventueel e-mailadres en je wensen naar de kliniek gestuurd om je afspraak in te plannen.'
      : 'Het aanvraagformulier verstuurt zelf niets. Het zet je aanvraag klaar als bericht, dat jij vervolgens zelf via Instagram verstuurt. Op die verzending is de privacyverklaring van Instagram (Meta) van toepassing.'}</li>
    <li>Links naar Instagram openen die dienst; wat je daar deelt, valt onder de privacyverklaring van Meta.</li>
  </ul>
  <h2>Contact</h2>
  <p>Vragen over je gegevens? Stuur een bericht via ${igLink()}.</p>
  <p>${btn('/', 'Terug naar de homepage', 'link')}</p>
</section>`, 'is-plain');

const notFound = page(
  { title: `Pagina niet gevonden — ${site.name}`, description: 'Deze pagina bestaat niet (meer).', path: '/404.html' },
  `<section class="section prose prose--center">
  <p class="eyebrow">404</p>
  <h1 class="title">Deze pagina bestaat niet (meer).</h1>
  <div class="actions">${btn('/', 'Naar de homepage')}${btn('/#prijzen', 'Bekijk de prijzen', 'link')}</div>
</section>`, 'is-plain');

// ── schrijven ──────────────────────────────────────────────────────────────
await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}privacy`, { recursive: true });
await cp(new URL('./assets/', import.meta.url).pathname, `${OUT}assets`, { recursive: true });
await writeFile(`${OUT}index.html`, home);
await writeFile(`${OUT}privacy/index.html`, privacy);
await writeFile(`${OUT}404.html`, notFound);

const base = plain(site.url);
await writeFile(`${OUT}robots.txt`, site.draft || !base
  ? 'User-agent: *\nDisallow: /\n'
  : `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
if (base) {
  await writeFile(`${OUT}sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', '/privacy/'].map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')}
</urlset>
`);
}

const todos = JSON.stringify(site).match(/"todo":true/g)?.length ?? 0;
console.log(`public/ gebouwd · draft=${site.draft} · open placeholders: ${todos}`);
