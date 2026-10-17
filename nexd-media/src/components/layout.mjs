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

export const btn = ({ href, label, variant = 'primary', iconName = 'arrow', attrs = '' }) =>
  `<a class="btn btn--${variant}" href="${href}" ${attrs}><span>${label}</span>${iconName ? icon(iconName, 18) : ''}</a>`;

// Merkteken: vijf versmallende kaders, het motief van de Conversion Engine.
export const mark = (size = 28) => `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <rect x="1" y="4" width="11" height="24" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="9" y="8" width="9" height="16" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="17" y="11" width="7" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="25" y="13.5" width="6" height="5" rx="1" fill="var(--signal)"/>
</svg>`;

// Het echte logo (uit de huidige site) + woordmerk.
const brand = () => `<a class="brand" href="/"><img class="brand__logo" src="/assets/img/logo-x.png" alt="" width="41" height="33"><span class="brand__name">NEXD</span> <span class="brand__sub">Media</span></a>`;

const header = (path, theme) => `
<header class="site-header${theme === 'dark' ? ' site-header--on-dark' : ''}" data-header>
  <div class="container site-header__inner">
    ${brand()}
    <nav class="main-nav" aria-label="Hoofdmenu">
      <ul>${nav.map((n) => `<li><a href="${n.href}"${n.href === path ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}</ul>
    </nav>
    <div class="site-header__actions">
      ${btn({ href: '/contact/', label: 'Bespreek je website', variant: 'primary btn--sm', iconName: '' })}
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
        <span class="menu-toggle__open">${icon('menu')}</span><span class="menu-toggle__close">${icon('close')}</span>
        <span class="visually-hidden" data-menu-label>Menu openen</span>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu" hidden data-menu>
    <nav class="container" aria-label="Mobiel menu">
      <ul class="mobile-menu__list">
        ${[{ href: '/', label: 'Home' }, ...nav].map((n) => `<li><a href="${n.href}"${n.href === path ? ' aria-current="page"' : ''}>${n.label}${icon('arrow', 20)}</a></li>`).join('')}
      </ul>
      <div class="mobile-menu__contact">
        ${btn({ href: '/contact/', label: 'Plan een kennismaking', variant: 'primary btn--block' })}
        <div class="mobile-menu__row">
          <a class="btn btn--ghost" href="${telHref()}">${icon('phone', 18)}<span>Bellen</span></a>
          <a class="btn btn--ghost" href="${waHref()}" ${ext}>${icon('whatsapp', 18)}<span>WhatsApp</span></a>
        </div>
      </div>
    </nav>
  </div>
</header>`;

const footer = () => `
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <p class="site-footer__claim">Websites die <em>aanvragen</em> opleveren.</p>
      ${btn({ href: '/contact/', label: 'Plan een kennismaking' })}
    </div>
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        ${brand()}
        <p>${site.footerTagline}</p>
      </div>
      <div>
        <h2 class="site-footer__title">Websites</h2>
        <ul class="site-footer__list">
          <li><a href="/website-laten-maken.html">Website laten maken</a></li>
          ${services.filter((s) => s.group === 'website').map((s) => `<li><a href="${s.path}">${s.nav}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h2 class="site-footer__title">Marketing</h2>
        <ul class="site-footer__list">
          ${services.filter((s) => s.group === 'marketing').map((s) => `<li><a href="${s.path}">${s.nav}</a></li>`).join('')}
          <li><a href="/over-ons/">Over ons</a></li>
        </ul>
      </div>
      <div>
        <h2 class="site-footer__title">Contact</h2>
        <ul class="site-footer__list">
          <li><a href="${telHref()}">${site.contact.phoneDisplay}</a></li>
          <li><a href="${mailHref()}">${site.contact.email}</a></li>
          <li><a href="${waHref()}" ${ext}>WhatsApp</a></li>
          <li><a href="${site.social.linkedin}" ${ext}>LinkedIn</a></li>
          <li><a href="${site.social.x}" ${ext}>X (Twitter)</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <p>© ${new Date().getFullYear()} ${site.legalName} · ${site.contact.street}, ${site.contact.postalCode} ${site.contact.city} · KvK ${site.contact.kvk} · btw ${site.contact.vat}</p>
      <a href="/privacy/">Privacyverklaring</a>
    </div>
  </div>
</footer>`;

const stickyCta = () => `
<aside class="sticky-cta" aria-label="Snel contact" data-sticky-cta>
  ${btn({ href: '/contact/', label: 'Bespreek je website', variant: 'primary sticky-cta__main' })}
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

export const layout = ({ path, title, description, body, schema = [], noindex = false, theme = 'light', head = '' }) => {
  const canonical = `${site.url}${path}`;
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#0E0F0D">
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
<link rel="preload" href="/assets/fonts/inter-tight-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=__V__">
${head}
<script>document.documentElement.classList.add('js')</script>
<script src="/assets/js/main.js?v=__V__" defer></script>
<script type="application/ld+json">${JSON.stringify([orgSchema(), ...schema])}</script>
</head>
<body>
<a class="skip-link" href="#main">Naar de inhoud</a>
${header(path, theme)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${stickyCta()}
</body>
</html>
`;
};

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
