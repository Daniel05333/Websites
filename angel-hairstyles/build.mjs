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

/** Titel met letter-reveal: de echte tekst voor screenreaders, losse letters voor het oog. */
const split = (lines) => {
  let i = 0;
  const visual = lines
    .map((line) => line.split(' ').map((word) =>
      `<span class="word">${[...word].map((ch) => `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`).join(' '))
    .join('<br>');
  return `<span class="sr-only">${esc(lines.join(' '))}</span><span class="chars" aria-hidden="true">${visual}</span>`;
};

/** Een leeg, eerlijk gemarkeerd fotovlak — wordt later vervangen door echte fotografie. */
const photoSlot = (label, ratio = '4/5', extra = '') =>
  `<figure class="slot ${extra}" style="--ratio:${ratio}" role="img" aria-label="Fotovlak: ${esc(label)} (foto volgt)">
     <span class="slot__grain" aria-hidden="true"></span>
     <figcaption class="slot__label" aria-hidden="true"><span>Foto volgt</span>${esc(label)}</figcaption>
   </figure>`;

const booking = site.booking.url ?? '#contact';
const bookingAttrs = site.booking.url ? ' rel="noopener" data-track="booking"' : ' data-track="booking-fallback"';
const city = site.location.city;
const year = new Date().getFullYear();

const arrow = `<svg class="arr" viewBox="0 0 14 11" aria-hidden="true"><path d="M0 5.35H13M8 10.35L13 5.35L8 0.35" fill="none" stroke="currentColor"/></svg>`;
const btn = (href, label, cls = 'btn', attrs = '') => `<a class="${cls}" href="${href}"${attrs}><span>${label}</span>${arrow}</a>`;
const bookBtn = (label = 'Maak een afspraak', cls = 'btn') => btn(booking, label, cls, bookingAttrs);

const nav = [
  ['#verhaal', 'Over ons'],
  ['#behandelingen', 'Behandelingen'],
  ['#prijzen', 'Prijzen'],
  ['#inspiratie', 'Inspiratie'],
  ['#vragen', 'Vragen'],
  ['#contact', 'Contact'],
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
${site.draft ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
<meta name="theme-color" content="#0e0b0a">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/italiana-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/outfit-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
${jsonLd()}
<script>document.documentElement.classList.add('js')</script>
<script src="/assets/js/main.js" defer></script>
<script src="/assets/js/silk.js" type="module"></script>
</head>`;
};

/** Structured data: alleen bevestigde velden, en niets zolang de site een concept is. */
function jsonLd() {
  if (site.draft) return '';
  const l = site.location;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: site.name,
    url: plain(site.url) || undefined,
    telephone: plain(site.contact.phone) || undefined,
    email: plain(site.contact.email) || undefined,
    address: has(l.street) && has(l.city) ? {
      '@type': 'PostalAddress', streetAddress: l.street, postalCode: plain(l.postalCode) || undefined,
      addressLocality: l.city, addressCountry: l.country,
    } : undefined,
    hasMap: plain(l.mapsUrl) || undefined,
    sameAs: [site.contact.instagram, site.contact.facebook].filter(Boolean),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

const header = () => `
<a class="skip" href="#main">Naar de inhoud</a>
${site.draft ? `<div class="draftbar" role="note">Ontwikkelversie — gemarkeerde gegevens zijn placeholders en moeten nog door de salon worden bevestigd.</div>` : ''}
<header class="masthead" data-masthead>
  <a class="brand" href="/" aria-label="${esc(site.name)} — home">
    <svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M6 27C9 15 13 7 16 5c3 2 7 10 10 22M10.5 18.5c3.5-1.6 7.5-1.6 11 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    <span>Angel <em>Hairstyles</em></span>
  </a>
  <nav class="nav" aria-label="Hoofdmenu">
    <ul>${nav.map(([h, l], i) => `${i ? '<li class="nav__dot" aria-hidden="true"></li>' : ''}<li><a href="/${h}">${l}</a></li>`).join('')}</ul>
  </nav>
  ${btn(booking, 'Maak een afspraak', 'pill', bookingAttrs)}
  <button class="burger" type="button" aria-expanded="false" aria-controls="sheet" aria-label="Menu openen"><span></span><span></span></button>
</header>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <button class="sheet__close" type="button" aria-label="Menu sluiten"><span></span><span></span></button>
  <nav aria-label="Menu mobiel"><ul>${nav.map(([h, l], i) => `<li style="--i:${i}"><a href="/${h}">${l}</a></li>`).join('')}</ul></nav>
  ${bookBtn()}
</div>`;

const chrome = () => `
<canvas class="silk" data-silk aria-hidden="true"></canvas>
<div class="grid" aria-hidden="true">${'<span><i></i><i></i></span>'.repeat(5)}</div>
<div class="chapters" aria-hidden="true">${[1, 2, 3, 4].map(() => '<span><i></i></span>').join('')}</div>
<div class="cursor" aria-hidden="true"></div>`;

const footer = () => `
<footer class="footer">
  <div class="footer__top">
    <a class="brand brand--lg" href="/"><span>Angel <em>Hairstyles</em></span></a>
    <nav aria-label="Footer"><ul>${nav.map(([h, l]) => `<li><a href="/${h}">${l}</a></li>`).join('')}<li><a href="/privacy/">Privacy</a></li></ul></nav>
  </div>
  <div class="footer__foot">
    <p>© ${year} ${esc(site.name)}${has(city) ? ` · ${esc(city)}` : ''}</p>
    <p class="footer__social">${[['Instagram', site.contact.instagram], ['Facebook', site.contact.facebook]].filter(([, u]) => u).map(([n, u]) => `<a href="${esc(u)}" rel="noopener">${n}</a>`).join('') || v({ todo: true, label: 'sociale media' })}</p>
  </div>
</footer>
<div class="dock" data-dock>${bookBtn('Maak een afspraak', 'btn btn--block')}</div>
<dialog class="lightbox" data-lightbox aria-label="Afbeelding vergroot">
  <div class="lightbox__stage" data-stage></div>
  <p class="lightbox__count" data-count></p>
  <button class="lightbox__btn lightbox__prev" type="button" data-prev aria-label="Vorige afbeelding">‹</button>
  <button class="lightbox__btn lightbox__next" type="button" data-next aria-label="Volgende afbeelding">›</button>
  <button class="lightbox__btn lightbox__close" type="button" data-close aria-label="Sluiten">×</button>
</dialog>`;

const page = (meta, body) => `${head(meta)}
<body>
${chrome()}
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
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero__inner">
    <p class="eyebrow reveal">Angel Hairstyles · ${v(city)}</p>
    <h1 id="hero-title" class="display reveal" data-split>${split(['Jouw haar.', 'Jouw stijl.', 'Jouw moment.'])}</h1>
    <div class="hero__foot">
      <p class="lead reveal" style="--d:.5s">Hairstyling die bij je past, met aandacht voor detail, je persoonlijke stijl en een resultaat waarin je jezelf herkent.</p>
      <div class="actions reveal" style="--d:.7s">
        ${bookBtn()}
        ${btn('#behandelingen', 'Ontdek de behandelingen', 'btn btn--ghost')}
      </div>
    </div>
  </div>
  <a class="cue" href="#verhaal"><span>Scroll</span><i aria-hidden="true"></i></a>
</section>`;

const story = () => `
<section class="story section" id="verhaal" aria-labelledby="verhaal-title" data-chapter="1">
  <div class="story__media reveal"><div data-parallax="0.08">${photoSlot('de salon / de stylist', '4/5')}</div></div>
  <div class="story__copy">
    <p class="eyebrow reveal">01 — Over ons</p>
    <h2 id="verhaal-title" class="title reveal" data-split>${split(['Mooi haar begint', 'met aandacht.'])}</h2>
    ${site.story.paragraphs.map((p, i) => `<p class="body reveal" style="--d:${0.2 + i * 0.1}s">${v(p)}</p>`).join('')}
    <div class="reveal" style="--d:.4s">${btn('#behandelingen', 'Ontdek Angel Hairstyles', 'link')}</div>
  </div>
</section>`;

const meta = (t) => `<dl class="meta">
  <div><dt>Prijs</dt><dd>${v(t.price)}</dd></div>
  <div><dt>Duur</dt><dd>${v(t.duration)}</dd></div>
</dl>${t.note ? `<p class="note">${v(t.note)}</p>` : ''}`;

const treatments = () => `
<section class="treatments section" id="behandelingen" aria-labelledby="behandelingen-title" data-chapter="2">
  <div class="section__head">
    <p class="eyebrow reveal">02 — Behandelingen</p>
    <h2 id="behandelingen-title" class="title reveal" data-split>${split(['Ontdek de', 'behandelingen.'])}</h2>
    <p class="body reveal">Per behandeling zie je direct wat het is, wat het kost en hoe lang het duurt. Twijfel je? Vraag gerust om advies bij het maken van je afspraak.</p>
  </div>
  <ol class="cards">
    ${site.treatments.map((t) => `
    <li class="card reveal" id="behandeling-${t.id}">
      ${photoSlot(t.name, '5/4', 'card__media')}
      <div class="card__body">
        <p class="card__nr">${t.nr}${t.confirmed ? '' : ' <span class="badge" title="Nog niet bevestigd door de salon">concept</span>'}</p>
        <h3 class="card__title">${esc(t.name)}</h3>
        <p class="body">${esc(t.short)}</p>
        ${meta(t)}
        ${btn(booking, `Afspraak voor ${esc(t.name.toLowerCase())}`, 'link', bookingAttrs)}
      </div>
    </li>`).join('')}
  </ol>
</section>`;

const craft = () => `
<section class="craft section" aria-labelledby="craft-title">
  <div class="section__head">
    <p class="eyebrow reveal">03 — Vakmanschap</p>
    <h2 id="craft-title" class="title reveal" data-split>${split(['Het verschil', 'zit in details.'])}</h2>
  </div>
  <div class="craft__grid">
    <div class="craft__media reveal"><div data-parallax="0.12">${photoSlot('detail van haartextuur', '3/4')}</div></div>
    <ol class="craft__list">
      ${site.craft.map((c, i) => `<li class="reveal" style="--d:${i * 0.08}s"><span class="craft__nr">0${i + 1}</span><h3>${esc(c.title)}</h3><p class="body">${esc(c.text)}</p></li>`).join('')}
    </ol>
  </div>
</section>`;

const signature = () => `
<section class="signature" aria-labelledby="signature-title">
  <div class="signature__media" data-parallax="0.18">${photoSlot('editorial kapsel, schermvullend', '16/9', 'slot--full')}</div>
  <div class="signature__copy">
    <h2 id="signature-title" class="display display--md reveal" data-split>${split(['Een stijl die', 'bij jou past.'])}</h2>
    <p class="lead reveal" style="--d:.4s">Ontdek de mogelijkheden en vind de behandeling die aansluit bij jouw wensen.</p>
  </div>
</section>`;

const prices = () => `
<section class="prices section" id="prijzen" aria-labelledby="prijzen-title" data-chapter="3">
  <div class="section__head">
    <p class="eyebrow reveal">04 — Prijzen</p>
    <h2 id="prijzen-title" class="title reveal" data-split>${split(['Helder', 'geprijsd.'])}</h2>
    <p class="body reveal">Geen verrassingen achteraf. Hangt een prijs af van je haarlengte of de hoeveelheid haar, dan staat dat bij de behandeling.</p>
  </div>
  <div class="table reveal" role="region" aria-label="Prijsoverzicht" tabindex="0">
    <table>
      <caption class="sr-only">Prijzen en duur per behandeling</caption>
      <thead><tr><th scope="col">Behandeling</th><th scope="col">Duur</th><th scope="col">Prijs</th></tr></thead>
      <tbody>${site.treatments.map((t) => `
        <tr><th scope="row"><a href="#behandeling-${t.id}">${esc(t.name)}</a>${t.note ? `<small>${v(t.note)}</small>` : ''}</th><td data-label="Duur">${v(t.duration)}</td><td data-label="Prijs">${v(t.price)}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  <div class="actions reveal">${bookBtn('Kies jouw behandeling')}</div>
</section>`;

const steps = () => {
  const items = [
    ['Kies je behandeling', 'Bekijk het aanbod en kies wat bij je wensen past. Twijfel je, kies dan de behandeling die het dichtst in de buurt komt en vraag om advies.'],
    ['Kies een moment', site.booking.url ? `Ga naar de online agenda en kies een tijd die jou uitkomt.` : `Neem contact op via ${has(site.contact.phone) ? 'telefoon' : 'de contactgegevens hieronder'} om een moment af te spreken.`],
    ['Bevestiging', v(site.booking.confirmation)],
  ];
  return `
<section class="steps section" aria-labelledby="steps-title">
  <div class="section__head">
    <p class="eyebrow reveal">05 — Afspraak maken</p>
    <h2 id="steps-title" class="title reveal" data-split>${split(['Zo maak je', 'een afspraak.'])}</h2>
  </div>
  <ol class="steps__list">${items.map(([t, d], i) => `
    <li class="reveal" style="--d:${i * 0.1}s"><span class="steps__nr">0${i + 1}</span><h3>${t}</h3><p class="body">${d}</p></li>`).join('')}
  </ol>
  <div class="actions reveal">${bookBtn()}</div>
</section>`;
};

const inspiration = () => `
<section class="inspiration section" id="inspiratie" aria-labelledby="inspiratie-title" data-chapter="4">
  <div class="section__head">
    <p class="eyebrow reveal">06 — Inspiratie</p>
    <h2 id="inspiratie-title" class="title reveal" data-split>${split(['Waar ben je', 'naar op zoek?'])}</h2>
  </div>
  <ul class="occasions">${site.occasions.map((o, i) => {
    const t = site.treatments.find((x) => x.id === o.to);
    return `<li class="reveal" style="--d:${i * 0.06}s"><a href="#behandeling-${o.to}"><span class="occasions__nr">0${i + 1}</span><span class="occasions__title">${esc(o.title)}</span><span class="occasions__to">${t ? esc(t.name) : ''} ${arrow}</span></a></li>`;
  }).join('')}</ul>
</section>`;

const gallery = () => {
  const real = site.portfolio.length > 0;
  const items = real ? site.portfolio : Array.from({ length: 6 }, (_, i) => ({ label: `Portfolio ${i + 1}`, ratio: ['4/5', '1/1', '3/4', '4/5', '3/4', '1/1'][i] }));
  return `
<section class="gallery section" aria-labelledby="gallery-title">
  <div class="section__head">
    <p class="eyebrow reveal">07 — Portfolio</p>
    <h2 id="gallery-title" class="title reveal" data-split>${split(['Echt werk,', 'echte klanten.'])}</h2>
    <p class="body reveal">${real ? 'Een selectie van ons eigen werk, gedeeld met toestemming van onze klanten.' : v({ todo: true, label: 'eigen portfoliofoto’s met toestemming van klanten — er worden hier bewust geen stock- of AI-beelden als klantresultaat getoond' })}</p>
  </div>
  <ul class="gallery__grid">${items.map((it, i) => `
    <li class="reveal" style="--d:${(i % 3) * 0.08}s">
      <button class="gallery__item" type="button" data-index="${i}" aria-label="${real ? `Vergroot: ${esc(it.alt)}` : `Vergroot fotovlak ${i + 1} (foto volgt)`}">
        ${real
          ? `<img src="${esc(it.src)}" width="${it.w}" height="${it.h}" alt="${esc(it.alt)}" loading="lazy" decoding="async">`
          : photoSlot(it.label, it.ratio)}
      </button>
    </li>`).join('')}
  </ul>
</section>`;
};

const reviews = () => {
  if (!site.reviews.length) return '';
  return `
<section class="reviews section" aria-labelledby="reviews-title">
  <div class="section__head"><p class="eyebrow reveal">Ervaringen</p><h2 id="reviews-title" class="title reveal">Wat klanten zeggen.</h2></div>
  <ul class="reviews__list">${site.reviews.map((r) => `<li class="reveal"><blockquote><p>${esc(r.text)}</p><footer>— ${esc(r.author)}</footer></blockquote></li>`).join('')}</ul>
  ${site.reviewsSourceUrl ? `<p class="body"><a class="link" href="${esc(site.reviewsSourceUrl)}" rel="noopener">Alle reviews bekijken</a></p>` : ''}
</section>`;
};

const faq = () => `
<section class="faq section" id="vragen" aria-labelledby="vragen-title">
  <div class="section__head">
    <p class="eyebrow reveal">08 — Veelgestelde vragen</p>
    <h2 id="vragen-title" class="title reveal" data-split>${split(['Goed om', 'te weten.'])}</h2>
  </div>
  <div class="faq__list">${site.faq.map((f) => `
    <details class="reveal"><summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary><div class="faq__a"><p class="body">${v(f.a)}</p></div></details>`).join('')}
  </div>
</section>`;

const contact = () => {
  const l = site.location;
  const c = site.contact;
  const phone = has(c.phone) && c.phoneHref ? `<a href="${esc(c.phoneHref)}">${esc(c.phone)}</a>` : v(c.phone);
  const mail = has(c.email) ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : v(c.email);
  return `
<section class="contact section" id="contact" aria-labelledby="contact-title">
  <div class="section__head">
    <p class="eyebrow reveal">09 — Contact</p>
    <h2 id="contact-title" class="title reveal" data-split>${split(['Kom langs.'])}</h2>
  </div>
  <div class="contact__grid">
    <address class="contact__card reveal">
      <h3>Adres</h3>
      <p>${v(l.street)}<br>${v(l.postalCode)} ${v(l.city)}</p>
      ${has(l.parking) ? `<p class="note">${esc(l.parking)}</p>` : ''}
      ${has(l.mapsUrl) ? btn(esc(l.mapsUrl), 'Route plannen', 'link', ' rel="noopener"') : ''}
      <h3>Telefoon</h3><p>${phone}</p>
      <h3>E-mail</h3><p>${mail}</p>
      ${c.whatsappHref ? `<h3>WhatsApp</h3><p><a href="${esc(c.whatsappHref)}" rel="noopener">Stuur een bericht</a></p>` : ''}
    </address>
    <div class="contact__card reveal" style="--d:.1s">
      <h3>Openingstijden</h3>
      <table class="hours"><caption class="sr-only">Openingstijden</caption><tbody>
        ${site.hours.map((h) => `<tr><th scope="row">${h.day}</th><td>${v(h.value)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </div>
</section>`;
};

const finale = () => `
<section class="finale" aria-labelledby="finale-title" data-finale>
  <h2 id="finale-title" class="display display--md reveal" data-split>${split(['Tijd voor je', 'nieuwe look?'])}</h2>
  <p class="lead reveal" style="--d:.4s">Bekijk de behandelingen en plan je volgende afspraak.</p>
  <div class="actions reveal" style="--d:.55s">${bookBtn()}${btn('#behandelingen', 'Bekijk de behandelingen', 'btn btn--ghost')}</div>
</section>`;

// ── pagina's ───────────────────────────────────────────────────────────────
const cityText = has(city) ? ` in ${city}` : '';
const home = page(
  {
    title: `${site.name}${has(city) ? ` — kapper in ${city}` : ' — hairstyling & kapsalon'}`,
    description: `${site.name}${cityText}: knippen, kleuren en styling met aandacht voor jouw wensen. Bekijk behandelingen en prijzen en maak direct een afspraak.`,
    path: '/',
  },
  [hero(), story(), treatments(), craft(), signature(), prices(), steps(), inspiration(), gallery(), reviews(), faq(), contact(), finale()].join('\n'),
);

const privacy = page(
  { title: `Privacy — ${site.name}`, description: `Hoe ${site.name} omgaat met je gegevens op deze website.`, path: '/privacy/' },
  `<section class="section prose">
  <p class="eyebrow">Privacy</p>
  <h1 class="title">Privacyverklaring</h1>
  <p class="body">${v({ todo: true, label: 'juridisch te controleren tekst — dit is een technische beschrijving van de website, geen volledige privacyverklaring' })}</p>
  <h2>Wat deze website doet</h2>
  <ul class="body">
    <li>Deze website plaatst geen cookies en gebruikt geen analytics, advertentie- of trackingscripts.</li>
    <li>Lettertypen en scripts worden vanaf deze website zelf geladen; er worden geen gegevens naar Google Fonts of andere externe diensten gestuurd.</li>
    <li>Er staat geen contactformulier op deze website; er worden via de website dus geen persoonsgegevens verzameld.</li>
    <li>${site.booking.url ? `Maak je online een afspraak, dan gebeurt dat in het boekingssysteem van ${esc(plain(site.booking.provider, 'een externe partij'))}. Daarvoor geldt de privacyverklaring van die dienst.` : v({ todo: true, label: 'boekingssysteem en de privacyverklaring daarvan' })}</li>
  </ul>
  <h2>Contact</h2>
  <p class="body">Vragen over je gegevens? Neem contact op via ${v(site.contact.email)}.</p>
  <p>${btn('/', 'Terug naar de homepage', 'link')}</p>
</section>`,
);

const notFound = page(
  { title: `Pagina niet gevonden — ${site.name}`, description: 'Deze pagina bestaat niet (meer).', path: '/404.html' },
  `<section class="section prose prose--center">
  <p class="eyebrow">404</p>
  <h1 class="title">Deze pagina bestaat niet (meer).</h1>
  <div class="actions">${btn('/', 'Naar de homepage')}${bookBtn('Maak een afspraak', 'btn btn--ghost')}</div>
</section>`,
);

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
