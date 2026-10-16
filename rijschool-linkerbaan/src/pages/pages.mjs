import { site, packages, faq, serviceArea, formatPrice } from '../data/site.mjs';
import { layout, breadcrumbSchema, btn, telHref, mailHref, waHref } from '../components/layout.mjs';
import { icon } from '../components/icons.mjs';
import {
  hero,
  intro,
  reasonsSection,
  ownerSection,
  pricingSection,
  pricingCards,
  pricesNote,
  comparison,
  stepsSection,
  areaSection,
  faqSection,
  faqSchema,
  trialSection,
  trialForm,
  contactOptions,
  pageHero,
  doubtBand,
  sectionHead,
  gallerySection,
} from '../components/sections.mjs';

const minPrice = formatPrice(Math.min(...packages.map((p) => p.price)));
const towns = serviceArea.slice(0, -1).join(', ') + ' en ' + serviceArea.at(-1);

const home = () =>
  layout({
    path: '/',
    title: 'Rijschool Linkerbaan | Persoonlijke rijlessen in Enschede en omgeving',
    description: `Persoonlijke rijlessen in Enschede, Hengelo, Almelo en omgeving. Rustige uitleg, leren op jouw tempo, pakketten vanaf ${minPrice}. Plan je proefles.`,
    bodyClass: 'page-home',
    schema: [faqSchema()],
    body: [
      hero(),
      intro(),
      reasonsSection(),
      ownerSection(),
      pricingSection(),
      stepsSection(),
      gallerySection(),
      areaSection(),
      faqSection(),
      trialSection(),
    ].join('\n'),
  });

const tarieven = () => {
  const tFaq = faq.filter((f) =>
    ['Welk lespakket past bij mij?', 'Wat is inbegrepen bij de lespakketten?', 'Hoe werkt een spoedtraject?', 'Hoe lang duurt een rijles?'].includes(f.q)
  );
  const offers = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Lespakketten Rijschool Linkerbaan',
    itemListElement: packages.map((p) => ({
      '@type': 'Offer',
      name: `Pakket ${p.number}: ${p.name}`,
      description: p.features.join(', '),
      price: p.price,
      priceCurrency: 'EUR',
      offeredBy: { '@id': `${site.url}/#rijschool` },
    })),
  };
  return layout({
    path: '/tarieven/',
    title: 'Rijlessen en tarieven | Rijschool Linkerbaan',
    description: `Bekijk de lespakketten van Rijschool Linkerbaan: Beginners, Ervaren en Spoed. Vaste totaalprijzen vanaf ${minPrice}, duidelijk wat er is inbegrepen.`,
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Rijlessen & tarieven', path: '/tarieven/' }]), offers],
    body: `
${pageHero({
  eyebrow: 'Rijlessen & tarieven',
  title: 'Helder geprijsd, <span class="hero__accent">zonder kleine lettertjes.</span>',
  intro: 'Drie lespakketten met een vaste totaalprijs. Hieronder zie je per pakket wat je krijgt, en wat de verschillen zijn.',
  crumbs: [{ name: 'Rijlessen & tarieven', path: '/tarieven/' }],
})}
<section class="section section--tint section--pull" aria-labelledby="pkgs-title">
  <div class="container">
    <h2 id="pkgs-title" class="visually-hidden">Lespakketten</h2>
    ${pricingCards()}
    ${pricesNote()}
  </div>
</section>
<section class="section" aria-labelledby="compare-title">
  <div class="container container--narrow">
    ${sectionHead({ eyebrow: 'Vergelijken', title: 'De pakketten naast elkaar', id: 'compare-title', intro: 'In één oogopslag wat er in elk pakket zit.' })}
    ${comparison()}
  </div>
</section>
${doubtBand()}
<section class="section" aria-labelledby="how-title">
  <div class="container how__grid">
    <div>
      ${sectionHead({ eyebrow: 'Zo begin je', title: 'Eerst een proefles, dan pas kiezen', id: 'how-title' })}
    </div>
    <div class="how__copy">
      <p>Je hoeft niet meteen een pakket te kiezen. Tijdens de proefles kijkt Furkan samen met jou waar je staat. Daarna bespreek je welk pakket logisch is, en wat je van de lessen kunt verwachten.</p>
      <p>Bij het pakket Beginners is de proefles gratis bij inschrijving. Over de precieze voorwaarden van elk pakket, zoals welk examen is inbegrepen, krijg je vooraf duidelijkheid.</p>
      ${btn({ href: '/proefles/', label: 'Plan een proefles' })}
    </div>
  </div>
</section>
${faqSection({ items: tFaq, title: 'Vragen over de pakketten', id: 'vragen-pakketten' })}
`,
  });
};

const over = () =>
  layout({
    path: '/over-rijschool-linkerbaan/',
    title: `Over Rijschool Linkerbaan | Rijinstructeur ${site.owner.name}`,
    description: `Maak kennis met ${site.owner.name}, eigenaar en rijinstructeur van Rijschool Linkerbaan. Persoonlijke rijlessen met rustige uitleg, in Enschede en omgeving.`,
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Over ons', path: '/over-rijschool-linkerbaan/' }])],
    body: `
${pageHero({
  eyebrow: 'Over Rijschool Linkerbaan',
  title: `Maak kennis met <span class="hero__accent">${site.owner.firstName}.</span>`,
  intro: `${site.owner.name} is eigenaar en rijinstructeur van Rijschool Linkerbaan. Zijn doel: leerlingen met vertrouwen, inzicht en plezier de weg op helpen.`,
  crumbs: [{ name: 'Over ons', path: '/over-rijschool-linkerbaan/' }],
})}
<section class="section story" aria-labelledby="story-title">
  <div class="container story__grid">
  <div class="story__body reveal">
    <h2 id="story-title" class="section-title">Waarom de linkerbaan?</h2>
    <p class="lead">De linkerbaan is de baan waar je doorpakt en vooruitgaat. Zo hoort een rijopleiding te voelen: als een route waarin je merkt dat je elke les een stukje verder komt.</p>
    <p>Maar vooruitgaan doe je niet door te haasten. Het begint bij rust in de auto, duidelijke uitleg en een instructeur die ziet wat jij nodig hebt. De één wil eerst eindeloos oefenen op een rustige weg, de ander staat te popelen om de snelweg op te gaan. Beide is prima.</p>
  </div>
  <figure class="story__photo reveal">
    <img src="${site.photos.interior.src}" alt="${site.photos.interior.alt}" width="${site.photos.interior.width}" height="${site.photos.interior.height}" loading="lazy">
    <figcaption>Uitzicht vanuit de lesauto, een ${site.car}.</figcaption>
  </figure>
  </div>
</section>
${ownerSection({ full: true })}
<section class="section section--tint" aria-labelledby="expect-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Wat je kunt verwachten', title: 'Zo ziet een les eruit', id: 'expect-title' })}
    <ol class="expect">
      <li class="reveal"><span class="expect__icon">${icon('home', 24)}</span><h3>Ophalen</h3><p>Bij de pakketten Beginners en Ervaren word je thuis opgehaald en weer afgezet.</p></li>
      <li class="reveal" style="--d:80ms"><span class="expect__icon">${icon('route', 24)}</span><h3>Doel van de les</h3><p>Je weet vooraf waar we aan werken, afgestemd op je lesplan en vorige les.</p></li>
      <li class="reveal" style="--d:160ms"><span class="expect__icon">${icon('steering', 24)}</span><h3>Rijden</h3><p>Oefenen in echte verkeerssituaties, met rustige aanwijzingen waar nodig.</p></li>
      <li class="reveal" style="--d:240ms"><span class="expect__icon">${icon('chat', 24)}</span><h3>Terugblik</h3><p>Kort bespreken wat goed ging en wat de volgende stap is.</p></li>
    </ol>
  </div>
</section>
${trialSection({ title: `Rij een proefles met ${site.owner.firstName}`, intro: 'De beste manier om te weten of het klikt, is samen in de auto stappen. Laat je gegevens achter en Furkan neemt contact met je op.' })}
`,
  });

const contact = () =>
  layout({
    path: '/contact/',
    title: 'Contact | Rijschool Linkerbaan',
    description: `Neem contact op met Rijschool Linkerbaan. Bel ${site.contact.phoneDisplay}, stuur een WhatsApp of e-mail, of vraag direct een proefles aan.`,
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact/' }])],
    body: `
${pageHero({
  eyebrow: 'Contact',
  title: 'Even kort <span class="hero__accent">schakelen?</span>',
  intro: 'Vraag direct een proefles aan, of stel je vraag via telefoon, WhatsApp of e-mail.',
  crumbs: [{ name: 'Contact', path: '/contact/' }],
})}
<section class="section section--pull" aria-labelledby="contact-form-title">
  <div class="container contact__grid">
    <div class="contact__form">
      <h2 id="contact-form-title" class="section-title">Proefles aanvragen</h2>
      <p class="muted">De snelste route naar je eerste les. Furkan neemt contact met je op.</p>
      ${trialForm({ headingId: 'contact-form-title' })}
    </div>
    <aside class="contact__aside" aria-labelledby="direct-title">
      <h2 id="direct-title" class="contact__aside-title">Direct contact</h2>
      ${contactOptions()}
      <div class="contact__region">
        <h3>${icon('pin', 20)}Werkgebied</h3>
        <p>${towns}.</p>
      </div>
    </aside>
  </div>
</section>
`,
  });

const proefles = () =>
  layout({
    path: '/proefles/',
    title: 'Proefles aanvragen | Rijschool Linkerbaan',
    description: 'Vraag in een minuut je proefles aan bij Rijschool Linkerbaan in Enschede en omgeving. Laat je naam en nummer achter en Furkan neemt contact met je op.',
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Proefles aanvragen', path: '/proefles/' }])],
    bodyClass: 'page-proefles',
    body: `
<section class="section proefles">
  <div class="container proefles__grid">
    <div class="proefles__copy">
      <nav class="crumbs crumbs--dark" aria-label="Kruimelpad"><ol><li><a href="/">Home</a></li><li><span aria-current="page">Proefles aanvragen</span></li></ol></nav>
      <h1 id="proefles-title" class="proefles__title">Plan je <span class="hl">proefles</span></h1>
      <p class="lead">Laat je gegevens achter. Furkan neemt contact met je op om een moment te plannen dat jou uitkomt.</p>
      <ol class="mini-steps">
        <li><span>1</span>Je vult dit formulier in</li>
        <li><span>2</span>Furkan neemt contact op</li>
        <li><span>3</span>Je rijdt je proefles</li>
      </ol>
      <div class="proefles__direct">
        <p>Liever meteen contact?</p>
        <a href="${telHref()}">${icon('phone', 20)}${site.contact.phoneDisplay}</a>
        <a href="${waHref()}" target="_blank" rel="noopener">${icon('whatsapp', 20)}WhatsApp</a>
      </div>
    </div>
    ${trialForm({ headingId: 'proefles-title' })}
  </div>
</section>
`,
  });

const privacy = () =>
  layout({
    path: '/privacy/',
    title: 'Privacyverklaring | Rijschool Linkerbaan',
    description: 'Hoe Rijschool Linkerbaan omgaat met de gegevens die je via de website deelt.',
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Privacyverklaring', path: '/privacy/' }])],
    body: `
${pageHero({ title: 'Privacyverklaring', crumbs: [{ name: 'Privacyverklaring', path: '/privacy/' }] })}
<section class="section">
  <div class="container container--narrow prose">
    <p>${site.name} gaat zorgvuldig om met je persoonsgegevens. In deze verklaring lees je welke gegevens we via deze website ontvangen en wat we ermee doen.</p>
    <h2>Wie is verantwoordelijk?</h2>
    <p>${site.name}, ${site.owner.name}. Je bereikt ons via <a href="${mailHref()}">${site.contact.email}</a> of <a href="${telHref()}">${site.contact.phoneDisplay}</a>.</p>
    <h2>Welke gegevens ontvangen we?</h2>
    <p>Als je een proefles aanvraagt, ontvangen we de gegevens die je zelf invult: je naam, telefoonnummer en, als je die opgeeft, je e-mailadres, woonplaats, contactvoorkeur, pakketinteresse en bericht. Neem je contact op via telefoon, WhatsApp of e-mail, dan ontvangen we de gegevens die je daarbij deelt.</p>
    <h2>Waarvoor gebruiken we ze?</h2>
    <p>Alleen om contact met je op te nemen over je aanvraag, een proefles te plannen en, als je met lessen start, je rijopleiding te organiseren. We verkopen je gegevens niet en delen ze niet met anderen voor marketing.</p>
    <h2>Hoe lang bewaren we ze?</h2>
    <p>Niet langer dan nodig voor het doel waarvoor je ze hebt gedeeld, of zolang de wet dat voorschrijft.</p>
    <h2>Cookies</h2>
    <p>Deze website plaatst geen tracking- of advertentiecookies en laadt geen externe lettertypen of scripts.</p>
    <h2>Je rechten</h2>
    <p>Je kunt je gegevens altijd inzien, laten aanpassen of laten verwijderen. Stuur hiervoor een e-mail naar <a href="${mailHref('Privacyverzoek')}">${site.contact.email}</a>. Heb je een klacht over hoe we met je gegevens omgaan, dan kun je die ook indienen bij de Autoriteit Persoonsgegevens.</p>
  </div>
</section>
`,
  });

const notFound = () =>
  layout({
    path: '/404.html',
    title: 'Pagina niet gevonden | Rijschool Linkerbaan',
    description: 'Deze pagina bestaat niet (meer).',
    noindex: true,
    body: `
<section class="page-hero page-hero--404">
  <div class="container">
    <p class="eyebrow eyebrow--light">Foutcode 404</p>
    <h1 class="page-hero__title">Verkeerd <span class="hero__accent">afgeslagen.</span></h1>
    <p class="page-hero__intro">Deze pagina bestaat niet (meer). Geen probleem, keren mag hier.</p>
    <div class="hero__actions">
      ${btn({ href: '/', label: 'Terug naar home', iconName: 'arrowLeft', iconFirst: true })}
      ${btn({ href: '/proefles/', label: 'Plan een proefles', variant: 'outline-light' })}
    </div>
  </div>
  <div class="page-hero__lane" aria-hidden="true"></div>
</section>`,
  });

export const pages = [
  { out: 'index.html', render: home, sitemap: { path: '/', priority: '1.0' } },
  { out: 'tarieven/index.html', render: tarieven, sitemap: { path: '/tarieven/', priority: '0.9' } },
  { out: 'proefles/index.html', render: proefles, sitemap: { path: '/proefles/', priority: '0.9' } },
  { out: 'over-rijschool-linkerbaan/index.html', render: over, sitemap: { path: '/over-rijschool-linkerbaan/', priority: '0.7' } },
  { out: 'contact/index.html', render: contact, sitemap: { path: '/contact/', priority: '0.7' } },
  { out: 'privacy/index.html', render: privacy, sitemap: { path: '/privacy/', priority: '0.2' } },
  { out: '404.html', render: notFound },
];
