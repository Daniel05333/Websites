import { site, nav } from '../data/site.mjs';
import { services } from '../data/services.mjs';
import { icon } from './icons.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const stripTags = (s = '') => String(s).replace(/<[^>]+>/g, '');

export const euro = (n) => `€ ${n.toLocaleString('nl-NL')}`;
export const telHref = () => `tel:${site.contact.phoneE164}`;
export const mailHref = (subject) =>
  `mailto:${site.contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
export const waHref = (text = site.contact.whatsappMessage) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
const ext = 'target="_blank" rel="noopener"';

const arrow = `<svg class="cta__arrow" viewBox="0 0 13.7071 10.7071" aria-hidden="true" focusable="false"><path d="M0 5.35355H13M8 10.3536L13 5.35355L8 0.353553"/></svg>`;

/**
 * Knoppen.
 * - `primary`: de afgeschuinde knop (donker vlak, groene rand en tekst; groen vult bij hover).
 * - `solid`:   dezelfde vorm, gevuld met groen (voor donkere ondergronden).
 * - `hollow`:  alleen de groene rand (footer).
 * - `ghost` / `ghost-dark`: tekstlink tussen haken, "[ Label → ]".
 */
export const btn = ({ href, label, variant = 'primary', attrs = '' }) => {
  if (variant.startsWith('ghost') || variant === 'link')
    return `<a class="bracket-link${variant === 'ghost-dark' ? ' bracket-link--dark' : ''}" href="${href}" ${attrs}><span aria-hidden="true">[ </span>${label}<span aria-hidden="true"> → ]</span></a>`;
  const [kind, ...mods] = variant.split(' ');
  return `<a class="cta cta--${kind} ${mods.join(' ')}" href="${href}" ${attrs}><span class="cta__label">${label}</span>${arrow}</a>`;
};

/** Vier hoekhaken rond een paneel: één pad, vier keer gedraaid. */
export const brackets = (cls = '') =>
  ['tl', 'tr', 'br', 'bl']
    .map((c) => `<svg class="bracket bracket--${c} ${cls}" viewBox="0 0 10.5 10.5" aria-hidden="true" focusable="false"><path d="M0 0.5H10V10.5"/></svg>`)
    .join('');

const logo = (size = 34) => `<img class="brand__logo" src="/assets/img/logo-x.png" alt="" width="${size}" height="${Math.round((size * 66) / 82)}">`;
const brand = () => `<a class="brand" href="/">${logo()}<span class="brand__name">NEXD</span> <span class="brand__sub">Media</span></a>`;

const header = (path) => `
<header class="masthead" data-header>
  <div class="masthead__inner">
    ${brand()}
    <nav class="masthead__nav" aria-label="Hoofdmenu">
      <ul>${nav.map((n) => `<li><a href="${n.href}"${n.href === path ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}</ul>
    </nav>
    <a class="masthead__cta" href="/contact/"${path === '/contact/' ? ' aria-current="page"' : ''}><span aria-hidden="true">[ </span>Bespreek je website<span aria-hidden="true"> → ]</span></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu-sheet" data-menu-toggle>
      <span class="burger__lines" aria-hidden="true"><span></span><span></span></span>
      <span class="visually-hidden" data-menu-label>Menu openen</span>
    </button>
  </div>
</header>
<div class="sheet" id="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu" hidden data-menu>
  <div class="sheet__top">
    ${brand()}
    <button class="sheet__close" type="button" data-menu-close><span class="visually-hidden">Menu sluiten</span><span aria-hidden="true"></span></button>
  </div>
  <nav class="sheet__nav" aria-label="Mobiel menu">
    <ul>${[{ href: '/', label: 'Home' }, ...nav, { href: '/contact/', label: 'Contact' }]
      .map((n, i) => `<li style="--i:${i}"><a href="${n.href}"${n.href === path ? ' aria-current="page"' : ''}>${n.label}</a></li>`)
      .join('')}</ul>
  </nav>
  <div class="sheet__foot">
    <a href="${telHref()}">${icon('phone', 18)} ${site.contact.phoneDisplay}</a>
    <a href="${waHref()}" ${ext}>${icon('whatsapp', 18)} WhatsApp</a>
  </div>
</div>`;

const footer = () => `
<footer class="foot" data-foot>
  <div class="foot__panel">
    <canvas class="contour-canvas" data-contour="footer" aria-hidden="true"></canvas>
    <div class="foot__grid">
      <a class="foot__brand" href="/">${logo(40)}<span class="visually-hidden">${site.name}, naar de homepage</span></a>
      <p class="foot__claim" data-reveal="words" data-stagger="110">Laten we <br>beginnen<span class="dot">.</span></p>
      <div class="foot__lead">
        <p>Vertel ons waar je website tegenaan loopt. We bespreken vrijblijvend welke aanpak bij jouw kantoor past.</p>
        <div class="foot__actions">
          ${btn({ href: '/contact/', label: 'Plan een kennismaking', variant: 'hollow' })}
          <a class="foot__wa" href="${waHref('Hoi NEXD Media, ik heb een vraag over mijn website.')}" ${ext}>${icon('whatsapp', 18)}<span>Stel je vraag via WhatsApp</span></a>
        </div>
      </div>
      <nav class="foot__nav" aria-label="Footer">
        <h2 class="foot__label">Websites</h2>
        <ul>
          <li><a href="/website-laten-maken.html">Website laten maken</a></li>
          ${services.filter((s) => s.group === 'website').map((s) => `<li><a href="${s.path}">${s.nav}</a></li>`).join('')}
        </ul>
      </nav>
      <nav class="foot__nav" aria-label="Marketing">
        <h2 class="foot__label">Marketing</h2>
        <ul>
          ${services.filter((s) => s.group === 'marketing').map((s) => `<li><a href="${s.path}">${s.nav}</a></li>`).join('')}
          <li><a href="/over-ons/">Over ons</a></li>
        </ul>
      </nav>
      <div class="foot__contact">
        <h2 class="foot__label">Contact</h2>
        <ul>
          <li><a href="${telHref()}">${site.contact.phoneDisplay}</a></li>
          <li><a href="${mailHref()}">${site.contact.email}</a></li>
          <li>${site.contact.street}<br>${site.contact.postalCode} ${site.contact.city}</li>
        </ul>
      </div>
    </div>
    <div class="foot__bottom">
      <p>© ${new Date().getFullYear()} ${site.legalName} · KvK ${site.contact.kvk} · btw ${site.contact.vat}</p>
      <ul class="foot__social">
        <li><a href="${site.social.linkedin}" ${ext}>LinkedIn</a></li>
        <li><a href="${site.social.x}" ${ext}>X (Twitter)</a></li>
        <li><a href="${waHref()}" ${ext}>WhatsApp</a></li>
        <li><a href="/privacy/">Privacy</a></li>
      </ul>
    </div>
  </div>
</footer>`;

const stickyCta = () => `
<aside class="sticky-cta is-hidden" aria-label="Snel contact" data-sticky-cta>
  ${btn({ href: '/contact/', label: 'Bespreek je website', variant: 'solid sticky-cta__main' })}
  <a class="sticky-cta__icon" href="${waHref()}" ${ext} aria-label="Stuur een WhatsApp-bericht">${icon('whatsapp', 22)}</a>
</aside>`;

const orgSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${site.url}/#organisatie`,
  name: site.name,
  legalName: site.legalName,
  url: `${site.url}/`,
  logo: `${site.url}/assets/img/logo-x.png`,
  image: `${site.url}/assets/img/og-image.png`,
  email: site.contact.email,
  telephone: site.contact.phoneE164,
  address: { '@type': 'PostalAddress', streetAddress: site.contact.street, postalCode: site.contact.postalCode, addressLocality: site.contact.city, addressCountry: 'NL' },
  vatID: site.contact.vat,
  areaServed: { '@type': 'Country', name: 'Nederland' },
  knowsAbout: ['Webdesign', 'Conversieoptimalisatie', 'WordPress', 'SEO', 'Contentmarketing', 'Fotografie'],
  sameAs: [site.social.linkedin, site.social.x],
});

export const layout = ({ path, title, description, body, schema = [], noindex = false, head = '', home = false }) => {
  const canonical = `${site.url}${path}`;
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#f7faf9">
<meta property="og:type" content="website">
<meta property="og:locale" content="${site.locale}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/oswald-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/space-grotesk-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=__V__">
${head}
<script>document.documentElement.classList.add('js');history.scrollRestoration='manual';setTimeout(function(){if(!window.__nexdReady)document.documentElement.classList.remove('js')},4000)</script>
<script type="module" src="/assets/js/main.js?v=__V__"></script>
<script type="application/ld+json">${JSON.stringify([orgSchema(), ...schema])}</script>
</head>
<body${home ? ' class="is-home"' : ''}>
<a class="skip-link" href="#main">Naar de inhoud</a>
${home ? veil() : ''}
${header(path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${stickyCta()}
<div class="cursor-ring" aria-hidden="true" data-cursor></div>
</body>
</html>
`;
};

/**
 * Laadsluier (alleen de homepage, alleen met JavaScript): het logo vult zich van boven, een meter langs
 * de voet. Voortgang kruipt naar 0.7 en loopt pas vol als de 3D-scène klaar is; zonder WebGL tilt hij direct.
 */
const veil = () => `
<div class="veil" role="status" aria-label="NEXD Media wordt geladen" data-veil>
  <div class="veil__mark"><span class="veil__shell"></span><span class="veil__fill" data-veil-fill></span></div>
  <p class="veil__name">NEXD Media</p>
  <div class="veil__meter"><span data-veil-meter></span></div>
</div>`;

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
});

export const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
