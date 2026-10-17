// Alle bedrijfsgegevens en content van NEXD Media op één plek.
// Bron per gegeven: de bestaande website (nexdmedia.com, screencapture 16-10-2026) en het KvK-register.
// Alles wat nog bevestigd moet worden staat in docs/03-oplevering.md onder "Te bevestigen".

export const site = {
  name: 'NEXD Media',
  legalName: 'NEXD Media B.V.',
  url: 'https://nexdmedia.com',
  locale: 'nl_NL',
  tagline: 'Websites die aanvragen opleveren',
  footerTagline: 'Conversiegerichte websites voor advocaten, accountants en zakelijke dienstverleners.',
  contact: {
    email: 'info@nexdmedia.com',
    phoneDisplay: '06 11 90 72 55',
    phoneE164: '+31611907255',
    // Aanname: WhatsApp loopt via hetzelfde mobiele nummer. Te bevestigen.
    whatsapp: '31611907255',
    whatsappMessage: 'Hoi NEXD Media, ik wil graag mijn website bespreken.',
    street: 'H.M. Corwinstraat 12',
    postalCode: '7576 ZD',
    city: 'Oldenzaal',
    kvk: '89065506',
    vat: 'NL1005212B01',
    // Belofte zoals op de huidige site ("Reactie binnen 2 uur").
    responsePromise: 'Reactie binnen 2 uur',
  },
  // Laagdrempelig aanbod van de huidige site.
  offer: {
    key: 'websitecheck',
    title: 'Gratis websitecheck',
    text: 'Je ontvangt 3 concrete verbeterpunten voor je huidige website.',
  },
  social: {
    linkedin: 'https://nl.linkedin.com/company/nexdmediabv',
    x: 'https://x.com/NexdMedia',
  },
  // Formulier: vul een endpoint in (Formspree, Basin, eigen API, …) dat JSON accepteert.
  // Leeg = de bezoeker verstuurt de aanvraag zelf via e-mail of WhatsApp, met alles al ingevuld.
  form: { endpoint: '' },
};

export const nav = [
  { href: '/website-laten-maken.html', label: 'Diensten' },
  { href: '/website-laten-optimaliseren/', label: 'Optimaliseren' },
  { href: '/#werk', label: 'Resultaten' },
  { href: '/over-ons/', label: 'Over ons' },
  { href: '/contact/', label: 'Contact' },
];

// De vijf fasen van de Conversion Engine (hero, 3D-scène en fallback gebruiken dezelfde lijst).
export const engineStages = ['Aandacht', 'Begrip', 'Vertrouwen', 'Actie', 'Aanvraag'];

export const sectors = [
  { name: 'Advocatuur', text: 'Intakes die beginnen met vertrouwen: helder over rechtsgebieden, kosten en de eerste stap.' },
  { name: 'Accountancy & finance', text: 'Diensten en pakketten zo uitgelegd dat ondernemers zelf de juiste route kiezen.' },
  { name: 'Advies & zakelijke dienstverlening', text: 'Expertise zichtbaar maken voor beslissers die eerst online vergelijken.' },
];

export const facts = [
  { value: 'Legal & finance', label: 'Onze specialisatie' },
  { value: 'Baymard', label: 'UX op basis van onderzoek naar gebruikersgedrag' },
  { value: 'Core Web Vitals', label: 'Snel en stabiel online, gemeten met Googles normen' },
  { value: 'WCAG', label: 'Gebouwd volgens de richtlijnen voor toegankelijkheid' },
];

export const problems = [
  { title: 'Mooi, maar stil', text: 'De website ziet er verzorgd uit, maar het contactformulier blijft leeg. Bezoekers kijken en vertrekken.' },
  { title: 'Niet direct duidelijk', text: 'Een bezoeker moet zoeken wat je doet, voor wie, en wat het kost. Wie twijfelt, klikt door naar een concurrent.' },
  { title: 'Mobiel haakt af', text: 'Op de telefoon zijn knoppen te klein, formulieren te lang en teksten te zwaar. Juist daar begint de oriëntatie.' },
  { title: 'Lastig bij te houden', text: 'Elke aanpassing is een klus of een factuur. Daardoor veroudert de content sneller dan je dienstverlening.' },
  { title: 'Gevonden op de verkeerde woorden', text: 'Er komt verkeer binnen, maar niet van de mensen die jouw dienst zoeken. SEO en content sluiten niet aan.' },
  { title: 'Te weinig vertrouwen', text: 'Geen gezichten, geen resultaten, geen duidelijke werkwijze. Voor een advocaat of accountant is dat precies wat telt.' },
];

// "Aanpak": zes lagen die samen één werkende website vormen (scrollgestuurde visual op de homepage).
export const approach = [
  { key: 'strategie', title: 'Strategie & doelgroep', text: 'We beginnen bij jouw ideale klant: wie zoekt er, met welke vraag, en wat moet er gebeuren voordat iemand contact opneemt?' },
  { key: 'structuur', title: 'Structuur & UX', text: 'Wireframes vóór design. Elke pagina krijgt één doel en een logische route naar de volgende stap.' },
  { key: 'copy', title: 'Copy & visuele identiteit', text: 'Teksten die de taal van je klant spreken, eigen fotografie en een design dat past bij hoe jij werkt.' },
  { key: 'ontwikkeling', title: 'Ontwikkeling & integraties', text: 'Snel, veilig en responsive gebouwd in WordPress, met formulieren, agenda of CRM waar het nodig is.' },
  { key: 'lancering', title: 'Lancering & meting', text: 'Google Search Console en Analytics staan goed ingericht, zodat we vanaf dag één zien wat werkt.' },
  { key: 'optimalisatie', title: 'Optimalisatie', text: 'Met heatmaps en funnels zien we waar bezoekers afhaken. Daar verbeteren we, stap voor stap.' },
];

export const process = [
  { title: 'Kennismaking', text: 'Een vrijblijvend gesprek over je bedrijf, je klanten en wat de website moet opleveren.' },
  { title: 'Analyse', text: 'We bekijken je huidige website, je concurrenten en de zoekwoorden van je doelgroep.' },
  { title: 'Plan & scope', text: 'Je krijgt een duidelijk voorstel met wat we maken, de planning en een vaste prijs.' },
  { title: 'Design', text: 'Eerst de structuur in wireframes, daarna het ontwerp in jouw huisstijl. Jij geeft feedback.' },
  { title: 'Ontwikkeling', text: 'We bouwen de site, vullen de content en testen op mobiel, tablet en desktop.' },
  { title: 'Oplevering', text: 'Livegang met Search Console en Analytics, plus uitleg zodat je zelf content kunt aanpassen.' },
  { title: 'Optimalisatie', text: 'Waar afgesproken meten en verbeteren we na de lancering op basis van echte data.' },
];

// Pakketten. Prijzen zoals op de huidige dienstenpagina's (zie docs: prijzen verschillen tussen pagina's).
export const packages = [
  {
    key: 'standaard',
    name: 'Standaard website',
    href: '/standaard-website.html',
    price: 1795,
    priceNote: 'eenmalig, vanaf',
    situation: 'Ik wil snel en professioneel online',
    for: 'Voor ondernemers die snel een professionele, overzichtelijke basis willen die bezoekers helder naar contact leidt.',
    timeline: 'Binnen 20 dagen online, zodra content en huisstijl compleet zijn',
    features: [
      'Bewezen structuur in jouw huisstijl',
      'Responsive design voor mobiel, tablet en desktop',
      'Webteksten',
      'Meerdere pagina’s',
      'CMS om zelf content te beheren',
      'Domeinnaam en SSL',
      'Contactformulier',
      'Google Search Console en Analytics',
    ],
    cta: 'Start met een standaard website',
  },
  {
    key: 'maatwerk',
    name: 'Maatwerk website',
    href: '/maatwerk-website.html',
    price: 4495,
    priceNote: 'eenmalig, vanaf',
    situation: 'Ik wil structureel meer aanvragen',
    for: 'Voor kantoren die hun website echt als acquisitiekanaal willen inzetten, gebouwd rond doelgroep, propositie en groeidoelen.',
    timeline: 'In de regel binnen 4 tot 6 weken online; grotere projecten duren langer',
    features: [
      'Strategie en ontwerp volledig op maat',
      'Intake, doelgroepanalyse en wireframes',
      'Professionele copy en fotografie',
      '6 maanden conversie-optimalisatie',
      'WordPress, desgewenst met Elementor',
      'Hosting voor € 25 per maand',
    ],
    cta: 'Bespreek een maatwerk website',
    featured: true,
  },
  {
    key: 'optimaliseren',
    name: 'Website optimaliseren',
    href: '/website-laten-optimaliseren/',
    price: 1395,
    priceNote: 'vast startpakket',
    situation: 'Mijn website is er al, maar levert te weinig op',
    for: 'Voor bedrijven die hun huidige website willen verbeteren in plaats van direct alles opnieuw te bouwen.',
    timeline: 'Analyse, quick wins en een nameting van het effect',
    features: [
      'Conversie- en UX-analyse van je toppagina’s',
      'Heatmaps',
      'Technische check: snelheid, mobiel gebruik en fouten',
      'SEO-basischeck',
      'Prioriteitenplan en doorvoering van de quick wins',
      'Nameting van het effect',
    ],
    cta: 'Laat je website analyseren',
  },
];

// Cases. Alleen cijfers die de klant zelf noemt in een citaat met naam (huidige site).
// Niet getoond, wel in de docs: de koppen "+164%", "bouncerate -37% en 2× zoveel afspraken" en "+89%":
// die staan niet in de citaten en zijn niet te herleiden.
export const cases = [
  {
    key: 'dresschers',
    client: 'Advocatenkantoor Dresschers',
    sector: 'Advocatuur',
    place: 'Brunssum',
    url: 'https://www.dresschers.nl/',
    challenge: 'Meer cliënten die na het bekijken van de website ook echt een intake aanvragen.',
    approach: 'Conversiestructuur en copy aangepast op basis van gebruikersgedrag en data.',
    metrics: [{ label: 'Betaalde adviesgesprekken in Q2 2023', before: 37, after: 61 }],
    highlight: { value: '+38%', label: 'ingevulde intakeformulieren, vanaf week 2' },
    quote: 'Vanaf week 2 zagen we al +38% meer ingevulde intakeformulieren. In Q2 2023 kwamen er 61 nieuwe betaalde adviesgesprekken binnen (dit was 37).',
    person: 'mr. Marije van Dijk, partner huurrecht',
    date: 'mei 2023',
  },
  {
    key: 'countus',
    client: 'Countus Accountants',
    sector: 'Accountancy',
    challenge: 'Startende ondernemers sneller laten kiezen voor het pakket dat bij hen past.',
    approach: 'Optimalisatie van de homepage en dienstenpagina, met een nieuwe Starterspakketten-module.',
    metrics: [{ label: 'Aanvragen via de Starterspakketten, april tot en met juni 2024', before: 32, after: 124 }],
    highlight: { value: '+31%', label: 'vaker doorgeklikt naar het bel-script op mobiel' },
    quote: 'De nieuwe ‘Starterspakketten’-module gaf in april–juni 2024 precies 124 aanvragen (voorheen 32). Vooral mobiel klikte men 31% vaker door naar het bel-script. Dit stemt ons bijzonder tevreden!',
    person: 'Rick-Jan Lennep',
    date: 'juli 2024',
  },
  {
    key: 'delta',
    client: 'Consultancy Bureau Delta',
    sector: 'Advies',
    challenge: 'Minder losse aanvragen, meer gesprekken met beslissers die echt passen.',
    approach: 'Een scherpere propositie, ondersteund met cases en whitepapers per sector.',
    metrics: [{ label: 'Gesloten deals per lead', before: 1 / 7, after: 1 / 3, beforeLabel: '1 op 7', afterLabel: '1 op 3' }],
    highlight: { value: '212', label: 'demo-aanvragen via whitepapers in Q1 en Q2' },
    quote: 'Leadkwaliteit maakt met de nieuwe site echt het verschil: van 1 op 7 naar 1 op 3 gesloten deals. Whitepapers per sector zorgden in Q1 en Q2 voor 212 demo-aanvragen.',
    person: 'drs. Alexander van Rosendael',
    date: 'januari 2025',
  },
];

// Het team zoals op de huidige homepage, met de portretten van die pagina.
export const team = [
  { name: 'Maikel Latour', short: 'Maikel', role: 'Oprichter · conversiestrateeg & fotograaf', text: 'Het strategische brein achter elke website, en de foto- en videograaf die je kantoor in beeld brengt.', skills: ['Conversiestrategie en aanbod', 'Design dat keuzes aanstuurt', 'Beeld dat vertrouwen wekt'], photo: '/assets/img/team/team-maikel.webp' },
  { name: 'Bas', short: 'Bas', role: 'Full-stack developer', text: '14+ jaar ervaring in schaalbare B2B-webarchitectuur en automatisering.', skills: ['Schaalbare architectuur en API’s', 'Automatisering en integraties', 'Core Web Vitals'], photo: '/assets/img/team/team-bas.webp' },
  { name: 'Ron', short: 'Ron', role: 'Contentspecialist', text: 'Conversiegerichte content met journalistieke precisie.', skills: ['B1-copy die converteert', 'Propositie en structuur', 'SEO zonder blabla'], photo: '/assets/img/team/team-ron.webp' },
  { name: 'Sara', short: 'Sara', role: 'Conversiespecialist', text: 'Expert in gedragspsychologie die met data stuurt op meer aanvragen.', skills: ['Overtuigingsprincipes van Cialdini', 'Dashboards en heatmaps', 'CRO en A/B-testen'], photo: '/assets/img/team/team-sara.webp' },
  { name: 'Cristiano', short: 'Cristiano', role: 'Front-end developer', text: 'Bouwt snelle interfaces die goed scoren op Core Web Vitals.', skills: ['Toegankelijkheid (WCAG)', 'React en Tailwind', 'Snelle interfaces'], photo: '/assets/img/team/team-cristiano.webp' },
  { name: 'Noor', short: 'Noor', role: 'Projectmanager', text: 'Houdt scope, snelheid en kwaliteit strak op koers.', skills: ['Planning en QA', 'Efficiënte oplevering', 'Eén aanspreekpunt'], photo: '/assets/img/team/team-noor.webp' },
];

export const faq = [
  {
    q: 'Wat kost een website bij NEXD Media?',
    a: 'Een standaard website start vanaf € 1.795 eenmalig, een maatwerk website vanaf € 4.495. Voor maatwerk komt daar hosting bij van € 25 per maand. Wil je je huidige website verbeteren, dan start je met het optimalisatiepakket van € 1.395. Twijfel je? Begin met de gratis websitecheck: je krijgt 3 concrete verbeterpunten.',
  },
  {
    q: 'Hoe lang duurt het voordat mijn website live staat?',
    a: 'Een standaard website staat binnen 20 dagen online, zodra je content en huisstijl compleet zijn. Een maatwerk website is meestal binnen 4 tot 6 weken online. Grotere projecten duren langer; dat staat dan in de planning.',
  },
  {
    q: 'Wat is het verschil tussen een standaard en een maatwerk website?',
    a: 'Een standaard website is een professionele, overzichtelijke basis in jouw huisstijl. Bij maatwerk beginnen we met een intake en doelgroepanalyse, werken we met wireframes en een uniek ontwerp, en bouwen we de conversiestructuur rond jouw klantreis. Twijfel je? In de kennismaking adviseren we welke route past.',
  },
  {
    q: 'Wat maakt jullie anders dan andere webbouwers?',
    a: 'We zijn gespecialiseerd in advocaten, accountants en adviseurs, en we beginnen bij de route naar een aanvraag in plaats van bij het design. Strategie, copy, fotografie, conversie en techniek zitten in één team. Na de lancering meten we met heatmaps en dashboards wat werkt.',
  },
  {
    q: 'Kan ik niet gewoon een WordPress-template kopen?',
    a: 'Dat kan. Een template geeft je een vormgeving, maar geen structuur die past bij hoe jouw cliënten kiezen, geen teksten in hun taal en geen meting. Daar zit meestal het verschil in aanvragen.',
  },
  {
    q: 'Bouwen jullie in WordPress?',
    a: 'Ja. Je krijgt een CMS zoals WordPress, zodat je zelf teksten, pagina’s en blogs kunt aanpassen. Desgewenst bouwen we in Elementor, zodat je ook de opmaak zelf kunt wijzigen.',
  },
  {
    q: 'Wie zorgt voor onderhoud en updates?',
    a: 'Dat kunnen wij doen: updates, beveiliging en kleine aanpassingen. Of je dat uitbesteedt en wat het kost, spreken we vooraf af in het voorstel. Content aanpassen kun je altijd zelf.',
  },
  {
    q: 'Helpen jullie ook met SEO?',
    a: 'Elke website wordt opgeleverd met Google Search Console en Analytics. Daarnaast doen we zoektermenonderzoek en kun je SEO en blogs bij ons uitbesteden, gericht op de zoekvragen van jouw doelgroep, niet op zoveel mogelijk verkeer.',
  },
  {
    q: 'Moet ik zelf de teksten en foto’s aanleveren?',
    a: 'Nee. Webteksten zijn onderdeel van de standaard website, en bij maatwerk is fotografie inbegrepen. Heb je zelf al goede teksten of beelden, dan gebruiken we die natuurlijk.',
  },
  {
    q: 'Moet mijn website helemaal opnieuw, of kan hij beter?',
    a: 'Vaak hoeft niet alles opnieuw. Met het optimalisatiepakket analyseren we je toppagina’s, voeren we de quick wins door en meten we het effect. Blijkt er meer nodig, dan stellen we dat vooraf voor, met een heldere prijs.',
  },
];
