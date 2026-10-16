import { site, nav, serviceArea } from '../data/site.mjs';
import { icon, brandMark } from './icons.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const telHref = () => `tel:${site.contact.phoneE164}`;
export const mailHref = (subject) =>
  `mailto:${site.contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
export const waHref = (text = site.contact.whatsappMessage) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;

export const btn = ({ href, label, variant = 'primary', iconName = 'arrow', iconFirst = false, attrs = '' }) => `
<a class="btn btn--${variant}" href="${href}" ${attrs}>${iconFirst ? icon(iconName, 20) : ''}<span>${label}</span>${!iconFirst && iconName ? icon(iconName, 20) : ''}</a>`;

const header = (path) => `
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="/">
      ${brandMark(38)}
      <span class="brand__text"><span class="brand__eyebrow">Rijschool</span><span class="brand__name">Linkerbaan</span></span>
    </a>
    <nav class="main-nav" aria-label="Hoofdmenu">
      <ul>
        ${nav
          .map(
            (n) =>
              `<li><a href="${n.href}"${n.href === path ? ' aria-current="page"' : ''}>${n.label}</a></li>`
          )
          .join('')}
      </ul>
    </nav>
    <div class="site-header__actions">
      <a class="header-phone" href="${telHref()}">${icon('phone', 18)}<span>${site.contact.phoneDisplay}</span></a>
      <a class="btn btn--primary btn--sm" href="/proefles/"${path === '/proefles/' ? ' aria-current="page"' : ''}><span>Plan een proefles</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
        <span class="menu-toggle__open">${icon('menu')}</span><span class="menu-toggle__close">${icon('close')}</span>
        <span class="visually-hidden" data-menu-label>Menu openen</span>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu" hidden data-menu>
    <nav aria-label="Mobiel menu" class="container">
      <ul class="mobile-menu__list">
        ${[...nav, { href: '/proefles/', label: 'Proefles aanvragen' }]
          .map(
            (n) =>
              `<li><a href="${n.href}"${n.href === path ? ' aria-current="page"' : ''}>${n.label}${icon('arrow', 20)}</a></li>`
          )
          .join('')}
      </ul>
      <div class="mobile-menu__contact">
        <a class="btn btn--primary btn--block" href="/proefles/"><span>Plan een proefles</span>${icon('arrow', 20)}</a>
        <div class="mobile-menu__row">
          <a class="btn btn--ghost" href="${telHref()}">${icon('phone', 20)}<span>Bellen</span></a>
          <a class="btn btn--ghost" href="${waHref()}" target="_blank" rel="noopener">${icon('whatsapp', 20)}<span>WhatsApp</span></a>
        </div>
      </div>
    </nav>
  </div>
</header>`;

const footer = () => `
<footer class="site-footer">
  <div class="lane-divider" aria-hidden="true"></div>
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <a class="brand brand--light" href="/">
        ${brandMark(38)}
        <span class="brand__text"><span class="brand__eyebrow">Rijschool</span><span class="brand__name">Linkerbaan</span></span>
      </a>
      <p>Met vertrouwen, inzicht en plezier de weg op. Persoonlijke rijlessen in ${site.contact.region}.</p>
      <a class="btn btn--primary" href="/proefles/"><span>Plan een proefles</span>${icon('arrow', 20)}</a>
    </div>
    <div>
      <h2 class="site-footer__title">Contact</h2>
      <ul class="site-footer__list">
        <li><a href="${telHref()}">${icon('phone', 18)}${site.contact.phoneDisplay}</a></li>
        <li><a href="${waHref()}" target="_blank" rel="noopener">${icon('whatsapp', 18)}WhatsApp</a></li>
        <li><a href="${mailHref()}">${icon('mail', 18)}${site.contact.email}</a></li>
        <li><span>${icon('pin', 18)}${site.contact.region}</span></li>
      </ul>
    </div>
    <div>
      <h2 class="site-footer__title">Rijschool</h2>
      <ul class="site-footer__list">
        <li><a href="/tarieven/">Rijlessen &amp; tarieven</a></li>
        <li><a href="/over-rijschool-linkerbaan/">Over Furkan</a></li>
        <li><a href="/#werkgebied">Werkgebied</a></li>
        <li><a href="/#veelgestelde-vragen">Veelgestelde vragen</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__bottom">
    <p>© ${new Date().getFullYear()} ${site.name}</p>
    <a href="/privacy/">Privacyverklaring</a>
  </div>
</footer>`;

const stickyCta = () => `
<aside class="sticky-cta" aria-label="Snel contact" data-sticky-cta>
  <a class="btn btn--primary sticky-cta__main" href="/proefles/"><span>Plan een proefles</span>${icon('arrow', 20)}</a>
  <a class="sticky-cta__icon" href="${telHref()}" aria-label="Bel ${site.contact.phoneDisplay}">${icon('phone', 22)}</a>
  <a class="sticky-cta__icon" href="${waHref()}" target="_blank" rel="noopener" aria-label="Stuur een WhatsApp-bericht">${icon('whatsapp', 22)}</a>
</aside>`;

const orgSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'DrivingSchool',
  '@id': `${site.url}/#rijschool`,
  name: site.name,
  url: `${site.url}/`,
  telephone: site.contact.phoneE164,
  email: site.contact.email,
  logo: `${site.url}/assets/img/logo.svg`,
  image: `${site.url}/assets/img/og-image.png`,
  founder: { '@type': 'Person', name: site.owner.name, jobTitle: site.owner.role },
  areaServed: serviceArea.map((name) => ({ '@type': 'City', name })),
});

export const layout = ({ path, title, description, body, schema = [], noindex = false, bodyClass = '' }) => {
  const canonical = `${site.url}${path}`;
  const allSchema = [orgSchema(), ...schema];
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#0F1B2D">
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
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/bricolage-grotesque-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=__V__">
<script>document.documentElement.classList.add('js')</script>
<script src="/assets/js/main.js?v=__V__" defer></script>
<script type="application/ld+json">${JSON.stringify(allSchema.length === 1 ? allSchema[0] : allSchema)}</script>
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Naar de inhoud</a>
${header(path)}
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
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${site.url}${it.path}`,
  })),
});
