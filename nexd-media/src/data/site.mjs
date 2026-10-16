// Alle bedrijfsgegevens en content van NEXD Media op één plek.
// Bron per gegeven: de bestaande website (nexdmedia.com) en het KvK-register, geraadpleegd oktober 2026.
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
    postal: 'Postbus 146, 7577 AR Oldenzaal',
    city: 'Oldenzaal',
    kvk: '89065506',
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
  { href: '/#werk', label: 'Werk' },
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
  { value: '4', label: 'Specialisten: strategie, content, conversie, techniek' },
  { value: 'WordPress', label: 'Zelf je content beheren, met of zonder Elementor' },
  { value: 'In-house', label: 'Fotografie en webteksten door ons eigen team' },
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
    timeline: 'In de regel binnen 4 weken live, zodra content en huisstijl compleet zijn',
    features: [
      'Professioneel webdesign in jouw huisstijl',
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
    situation: 'Ik wil me echt onderscheiden',
    for: 'Voor kantoren met een specifieke positionering, een complexere klantreis of een uitgebreide conversiestrategie.',
    timeline: 'In de regel binnen 4 tot 6 weken online; grotere projecten duren langer',
    features: [
      'Intake en doelgroepanalyse',
      'Wireframes en een uniek ontwerp',
      'Conversiestructuur per pagina',
      'WordPress, desgewenst met Elementor',
      'Inclusief fotografie',
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

// Cases. Alleen gegevens die de klant zelf publiek heeft bevestigd (testimonial op de huidige site).
// Niet getoond, wel in de docs: het geaggregeerde "+164%" bij Dresschers (sluit niet aan op de getallen hieronder).
export const cases = [
  {
    key: 'dresschers',
    client: 'Advocatenkantoor Dresschers',
    sector: 'Advocatuur',
    place: 'Brunssum',
    url: 'https://www.dresschers.nl/',
    challenge: 'Meer cliënten die na het bekijken van de website ook echt een intake aanvragen.',
    approach: 'Een nieuwe conversiestructuur: duidelijke routes per vraag en een laagdrempelige eerste stap naar een intakegesprek.',
    metrics: [
      { label: 'Betaalde adviesgesprekken in Q2 2023', before: 37, after: 61 },
    ],
    highlight: { value: '+38%', label: 'intakeformulieren, al in de tweede week' },
    source: 'Volgens Advocatenkantoor Dresschers',
  },
  {
    key: 'countus',
    client: 'Countus Accountants',
    sector: 'Accountancy',
    challenge: 'Startende ondernemers sneller laten kiezen voor het pakket dat bij hen past.',
    approach: 'Een nieuwe Starterspakketten-module die de keuze overzichtelijk maakt en direct naar een aanvraag leidt.',
    metrics: [{ label: 'Aanvragen via de Starterspakketten in drie maanden', before: 32, after: 124 }],
    quote: 'De nieuwe Starterspakketten-module leverde in drie maanden 124 aanvragen op, waar dat er voorheen 32 waren.',
    person: 'Rick-Jan Lennep',
    date: 'juli 2024',
    source: 'Rick-Jan Lennep, Countus Accountants',
  },
];

// Het team zoals op de huidige homepage. Portretten ontbreken nog (zie docs): tot die er zijn tonen we initialen.
export const team = [
  { name: 'Maikel Latour', short: 'Maikel', role: 'Oprichter · strategie & fotografie', text: 'Vertaalt jouw doelen naar een websiteplan en fotografeert mensen en kantoren zo dat ze vertrouwen wekken.', photo: null },
  { name: 'Bas', short: 'Bas', role: 'Full-stack developer', text: '14+ jaar ervaring in B2B-webarchitectuur. Zorgt dat alles snel, veilig en goed onderhoudbaar is.', photo: null },
  { name: 'Ron', short: 'Ron', role: 'Contentspecialist', text: 'Schrijft webteksten en blogs die aansluiten op de zoekvragen en de taal van jouw klanten.', photo: null },
  { name: 'Sara', short: 'Sara', role: 'Conversiespecialist', text: 'Analyseert met heatmaps en funnels waar bezoekers afhaken, en wat er nodig is om ze te laten doorklikken.', photo: null },
];

export const faq = [
  {
    q: 'Wat kost een website bij NEXD Media?',
    a: 'Een standaard website start vanaf € 1.795 eenmalig, een maatwerk website vanaf € 4.495. Voor maatwerk komt daar hosting bij van € 25 per maand. Wil je je huidige website verbeteren, dan start je met het optimalisatiepakket van € 1.395. Na de kennismaking krijg je een voorstel met een vaste prijs.',
  },
  {
    q: 'Hoe lang duurt het voordat mijn website live staat?',
    a: 'Een standaard website staat in de regel binnen 4 weken live, zodra je content en huisstijl compleet zijn. Een maatwerk website is meestal binnen 4 tot 6 weken online. Grotere projecten duren langer; dat staat dan in de planning.',
  },
  {
    q: 'Wat is het verschil tussen een standaard en een maatwerk website?',
    a: 'Een standaard website is een professionele, overzichtelijke basis in jouw huisstijl. Bij maatwerk beginnen we met een intake en doelgroepanalyse, werken we met wireframes en een uniek ontwerp, en bouwen we de conversiestructuur rond jouw klantreis. Twijfel je? In de kennismaking adviseren we welke route past.',
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
