import { site, packages, faq } from '../data/site.mjs';
import { services } from '../data/services.mjs';
import { layout, btn, breadcrumbSchema, faqSchema, telHref, mailHref, waHref, stripTags } from '../components/layout.mjs';
import { icon } from '../components/icons.mjs';
import {
  homeHero, trust, problemSection, approachSection, servicesSection, casesSection, chooser, teamSection,
  processSection, faqSection, finalCta, pageHero, servicePage, contactForm,
} from '../components/sections.mjs';

const ext = 'target="_blank" rel="noopener"';

const home = {
  out: 'index.html',
  sitemap: { path: '/', priority: '1.0' },
  render: () =>
    layout({
      path: '/',
      theme: 'dark',
      title: 'NEXD Media | Websites die aanvragen opleveren voor legal & finance',
      description: 'NEXD Media bouwt conversiegerichte websites voor advocaten, accountants en zakelijke dienstverleners. Strategie, design en techniek die leiden tot aanvragen.',
      schema: [faqSchema(faq)],
      body: [homeHero(), trust(), problemSection(), approachSection(), servicesSection(), casesSection(), chooser(), teamSection(), processSection(), faqSection(faq), finalCta()].join('\n'),
    }),
};

const overview = {
  out: 'website-laten-maken.html',
  sitemap: { path: '/website-laten-maken.html', priority: '0.9' },
  render: () =>
    layout({
      path: '/website-laten-maken.html',
      title: 'Website laten maken voor zakelijke dienstverleners | NEXD Media',
      description: 'Website laten maken bij NEXD Media: kies een standaard website, maatwerk of optimalisatie van je huidige site. Heldere prijzen en een vaste werkwijze.',
      schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Website laten maken', path: '/website-laten-maken.html' }])],
      body: [
        pageHero({
          eyebrow: 'Website laten maken',
          h1: 'Drie routes naar een website die <em>aanvragen</em> oplevert.',
          lead: 'Of je nu voor het eerst een professionele website laat maken, je wilt onderscheiden met maatwerk, of meer wilt halen uit je huidige site: we beginnen bij wat de website moet opleveren.',
          motifName: 'route',
          crumbs: [{ name: 'Home', path: '/' }, { name: 'Website laten maken', path: '/website-laten-maken.html' }],
          actions: btn({ href: '/contact/', label: 'Plan een kennismaking' }),
        }),
        chooser(),
        `<section class="section services services--compact" aria-labelledby="meer-title"><div class="container">
          <div class="section-head reveal"><p class="eyebrow">Verder bouwen</p><h2 id="meer-title" class="h2">Alles voor een website die blijft <em>presteren</em>.</h2></div>
          <ul class="tile-grid">
            ${services.filter((s) => !packages.some((p) => p.key === s.key)).map((s) => `<li class="tile reveal"><a href="${s.path}"><h3 class="h4">${s.nav}</h3><p>${stripTags(s.lead).split('. ')[0]}.</p><span class="link-arrow">Lees meer${icon('arrow', 16)}</span></a></li>`).join('')}
          </ul>
        </div></section>`,
        processSection(),
        faqSection(faq.slice(0, 4)),
        finalCta(),
      ].join('\n'),
    }),
};

const servicePages = services.map((s) => ({
  out: s.path.endsWith('/') ? `${s.path.slice(1)}index.html` : s.path.slice(1),
  sitemap: { path: s.path, priority: '0.8' },
  render: () =>
    layout({
      path: s.path,
      title: s.title,
      description: s.description,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: s.nav,
          serviceType: s.nav,
          provider: { '@id': `${site.url}/#organisatie` },
          areaServed: { '@type': 'Country', name: 'Nederland' },
          description: s.description,
          ...(s.package ? { offers: { '@type': 'Offer', priceCurrency: 'EUR', price: s.package.price, description: s.package.priceNote } } : {}),
        },
        breadcrumbSchema([{ name: 'Home', path: '/' }, ...(s.group === 'website' ? [{ name: 'Website laten maken', path: '/website-laten-maken.html' }] : []), { name: s.nav, path: s.path }]),
        faqSchema(s.faq),
      ],
      body: servicePage(s),
    }),
}));

const about = {
  out: 'over-ons/index.html',
  sitemap: { path: '/over-ons/', priority: '0.7' },
  render: () =>
    layout({
      path: '/over-ons/',
      title: 'Over NEXD Media | Het team achter je website',
      description: 'Maak kennis met NEXD Media uit Oldenzaal: een team van specialisten in strategie, content, conversie en techniek voor advocaten, accountants en dienstverleners.',
      schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Over ons', path: '/over-ons/' }])],
      body: [
        pageHero({
          eyebrow: 'Over ons',
          h1: 'Wij bouwen websites voor bedrijven die het van <em>vertrouwen</em> moeten hebben.',
          lead: `${site.name} is een webbureau uit ${site.contact.city}. We richten ons op advocaten, accountants en zakelijke dienstverleners: bedrijven waar de eerste indruk online steeds vaker bepaalt of iemand contact opneemt.`,
          motifName: 'frame',
          crumbs: [{ name: 'Home', path: '/' }, { name: 'Over ons', path: '/over-ons/' }],
        }),
        `<section class="section principles" aria-labelledby="principes-title"><div class="container">
          <div class="section-head reveal"><p class="eyebrow">Waar we voor staan</p><h2 id="principes-title" class="h2">Design is pas goed als het <em>werkt</em>.</h2></div>
          <ol class="principle-list">
            <li class="reveal"><h3 class="h4">Eerst de klant, dan het design</h3><p>We beginnen bij wie je website bezoekt en wat die persoon nodig heeft om contact op te nemen.</p></li>
            <li class="reveal"><h3 class="h4">Eerlijk over resultaten</h3><p>We tonen alleen cijfers die klanten zelf hebben gedeeld, en beloven geen posities in Google.</p></li>
            <li class="reveal"><h3 class="h4">Zelf in de hand</h3><p>Je krijgt een website die je zelf kunt bijhouden, met uitleg bij de oplevering.</p></li>
            <li class="reveal"><h3 class="h4">Meten, niet gissen</h3><p>Search Console, Analytics en heatmaps laten zien wat werkt. Daar sturen we op bij.</p></li>
          </ol>
        </div></section>`,
        teamSection(),
        casesSection(),
        finalCta(),
      ].join('\n'),
    }),
};

const contact = {
  out: 'contact/index.html',
  sitemap: { path: '/contact/', priority: '0.8' },
  render: () =>
    layout({
      path: '/contact/',
      title: 'Contact | Plan een kennismaking met NEXD Media',
      description: 'Bespreek je website met NEXD Media. Vul het formulier in, bel 06 11 90 72 55, mail info@nexdmedia.com of stuur een WhatsApp-bericht. Vrijblijvend.',
      schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact/' }]), { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact', url: `${site.url}/contact/` }],
      body: `
<section class="page-hero page-hero--contact">
  <div class="container contact__grid">
    <div class="contact__intro">
      <nav class="crumbs" aria-label="Kruimelpad"><ol><li><a href="/">Home</a></li><li aria-current="page">Contact</li></ol></nav>
      <p class="eyebrow">Contact</p>
      <h1 class="page-hero__title">Vertel ons waar je <em>tegenaan</em> loopt.</h1>
      <p class="lede">Je krijgt een persoonlijke reactie met een voorstel voor een kennismaking. Liever direct contact? Dat kan ook.</p>
      <ul class="contact-list">
        <li><a href="${telHref()}">${icon('phone', 22)}<span><small>Bel ons</small>${site.contact.phoneDisplay}</span></a></li>
        <li><a href="${mailHref('Vraag aan NEXD Media')}">${icon('mail', 22)}<span><small>Mail ons</small>${site.contact.email}</span></a></li>
        <li><a href="${waHref()}" ${ext}>${icon('whatsapp', 22)}<span><small>WhatsApp</small>Stuur een bericht</span></a></li>
      </ul>
      <p class="contact__meta">${site.legalName}<br>${site.contact.postal}<br>KvK ${site.contact.kvk}</p>
    </div>
    ${contactForm()}
  </div>
</section>
${processSection()}`,
    }),
};

const privacy = {
  out: 'privacy/index.html',
  sitemap: { path: '/privacy/', priority: '0.2' },
  render: () =>
    layout({
      path: '/privacy/',
      title: 'Privacyverklaring | NEXD Media',
      description: 'Hoe NEXD Media omgaat met de persoonsgegevens die je via het contactformulier, e-mail, telefoon of WhatsApp met ons deelt, en welke rechten je hebt.',
      body: `
${pageHero({ eyebrow: 'Privacy', h1: 'Privacyverklaring', lead: `Deze verklaring beschrijft hoe ${site.legalName} omgaat met de gegevens die je met ons deelt.`, crumbs: [{ name: 'Home', path: '/' }, { name: 'Privacy', path: '/privacy/' }] })}
<section class="section prose-section"><div class="container prose">
  <h2>Welke gegevens</h2>
  <p>Als je contact opneemt via het formulier, e-mail, telefoon of WhatsApp, ontvangen we de gegevens die je zelf invult: je naam, eventueel je bedrijfsnaam, je e-mailadres, eventueel je telefoonnummer en je bericht.</p>
  <h2>Waarvoor</h2>
  <p>We gebruiken deze gegevens alleen om op je vraag te reageren en, als je dat wilt, een voorstel te maken. We verkopen je gegevens niet en delen ze niet met derden voor marketing.</p>
  <h2>Hoe lang</h2>
  <p>We bewaren je gegevens niet langer dan nodig is voor het contact en een eventuele samenwerking, en houden ons aan de wettelijke bewaartermijnen.</p>
  <h2>Cookies en scripts</h2>
  <p>Deze website plaatst zelf geen tracking cookies en laadt geen externe scripts. Klik je op een WhatsApp-, LinkedIn- of X-link, dan gelden de voorwaarden van die dienst.</p>
  <h2>Je rechten</h2>
  <p>Je kunt ons altijd vragen welke gegevens we van je hebben, en ze laten aanpassen of verwijderen. Mail naar <a href="${mailHref('Privacyverzoek')}">${site.contact.email}</a>.</p>
  <h2>Contact</h2>
  <p>${site.legalName}, ${site.contact.postal}. KvK ${site.contact.kvk}.</p>
</div></section>`,
    }),
};

const notFound = {
  out: '404.html',
  render: () =>
    layout({
      path: '/404.html',
      noindex: true,
      title: 'Pagina niet gevonden | NEXD Media',
      description: 'Deze pagina bestaat niet (meer). Ga terug naar de homepage of bekijk onze diensten.',
      body: `
${pageHero({
  eyebrow: 'Fout 404',
  h1: 'Deze pagina leidt <em>nergens</em> naartoe.',
  lead: 'Precies wat een goede website niet zou moeten doen. De pagina is verplaatst of bestaat niet meer.',
  motifName: 'route',
  actions: `${btn({ href: '/', label: 'Naar de homepage' })}${btn({ href: '/website-laten-maken.html', label: 'Bekijk onze diensten', variant: 'ghost', iconName: '' })}`,
})}`,
    }),
};

export const pages = [home, overview, ...servicePages, about, contact, privacy, notFound];
