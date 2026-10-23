// ─────────────────────────────────────────────────────────────────────────────
// Angel Hairstyles — ALLE inhoud en bedrijfsgegevens staan in dit ene bestand.
//
// Regel: niets in dit bestand is als feit overgenomen zonder bron. Elke waarde
// die nog bevestigd moet worden staat als `todo('omschrijving')`. Zo'n waarde
// verschijnt op de site als een duidelijk gemarkeerde placeholder (gestippeld
// kader, "[te bevestigen: …]") en wordt NOOIT in structured data, de sitemap
// of meta-teksten als feit gebruikt.
//
// Zolang `draft: true` staat:
//   • toont de site bovenaan een ontwikkelbalk,
//   • staat <meta name="robots" content="noindex"> op elke pagina,
//   • blokkeert robots.txt alles.
// Zet `draft` pas op false als alle todo's zijn ingevuld (`npm test` controleert dat).
// ─────────────────────────────────────────────────────────────────────────────

export const todo = (label) => ({ todo: true, label });
export const isTodo = (v) => v && typeof v === 'object' && v.todo === true;

export const site = {
  draft: true,

  name: 'Angel Hairstyles',
  // Basis-URL zonder slash aan het eind, bv. 'https://www.angelhairstyles.nl'
  url: todo('domeinnaam'),
  // Bronnen per gegeven: zie docs/rapportage.md (§1).
  lang: 'nl',

  location: {
    city: 'Enschede',                        // bron: Google-bedrijfsprofiel
    street: 'Pathmossingel 1E',
    postalCode: '7513 CA',
    country: 'NL',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Angel+Hairstyles+Pathmossingel+1E+7513+CA+Enschede',
    parking: null,                           // alleen invullen als bevestigd
  },

  // Google-beoordeling zoals getoond op het bedrijfsprofiel. Wordt NIET als
  // structured data (aggregateRating) uitgestuurd. Datum bijwerken bij wijziging.
  rating: { score: '4,8', count: 163, source: 'Google', asOf: 'oktober 2026' },

  contact: {
    phone: '06 16509984',                    // bron: Google-bedrijfsprofiel
    phoneHref: 'tel:+31616509984',
    // Instagram-bio: boeken via DM of WhatsApp. Aangenomen dat WhatsApp op
    // hetzelfde 06-nummer loopt — bevestigen (zie open punten).
    whatsapp: '31616509984',
    email: null,                             // geen openbaar zakelijk e-mailadres gevonden
    instagram: 'https://www.instagram.com/angelhairstyles1/',
    facebook: 'https://www.facebook.com/p/Angel-Hairstyles-100054488558009/',
  },

  // De bestaande, werkende boekingsroute. Laat `url` leeg tot die bekend is;
  // de afspraakknoppen sturen bezoekers dan naar de contactsectie.
  //
  // Er is geen online agenda gevonden; de salon boekt via WhatsApp, Instagram-DM
  // en telefoon. De afspraakknoppen openen daarom WhatsApp met een ingevuld
  // bericht (per behandeling). Komt er een online systeem, vul dan `url` in:
  // alle knoppen gaan dan daarheen.
  booking: {
    url: null,
    provider: null,
    // Eerlijk over het proces: een bericht is een aanvraag, geen boeking.
    confirmation: 'Je afspraak staat vast zodra de salon je tijd heeft bevestigd. Tot die tijd is je bericht een aanvraag.',
    cancellation: todo('annuleringsvoorwaarden'),
    payment: todo('betaalmogelijkheden in de salon'),
  },

  // Bron: Social Deal-bedrijfspagina; consistent met Google ("gaat open di 10:00").
  // Niet rechtstreeks door de salon bevestigd → `hoursVerified: false` toont
  // een korte controle-opmerking onder de tabel. Zondag stond niet vermeld.
  hoursVerified: false,
  hours: [
    { day: 'Maandag', value: 'Gesloten', open: null },
    { day: 'Dinsdag', value: '10:00 – 18:00', open: ['10:00', '18:00'] },
    { day: 'Woensdag', value: '10:00 – 18:00', open: ['10:00', '18:00'] },
    { day: 'Donderdag', value: '10:00 – 18:00', open: ['10:00', '18:00'] },
    { day: 'Vrijdag', value: '10:00 – 18:00', open: ['10:00', '18:00'] },
    { day: 'Zaterdag', value: '10:00 – 17:00', open: ['10:00', '17:00'] },
    { day: 'Zondag', value: todo('zondag'), open: null },
  ],

  story: {
    // Het echte verhaal van de salon: wie, sinds wanneer, werkwijze. Geen
    // ervaring of kwalificaties verzinnen.
    paragraphs: [
      'Goed haar is meer dan een behandeling. Het is hoe je jezelf herkent in de spiegel — verzorgd, eigen, en precies zoals jij het wilt.',
      'Angel Hairstyles is een kapsalon aan de Pathmossingel in Enschede, en een erkend leerbedrijf: hier worden ook nieuwe kappers opgeleid.',
      todo('ervaring en werkwijze — de Instagram-bio noemt "24+ jaar ervaring"; laat de salon dit zelf formuleren'),
    ],
    photoAlt: todo('foto van de salon of stylist'),
  },

  // Behandelingen. Dit zijn CONCEPT-categorieën uit de briefing, geen
  // geverifieerd aanbod: verwijder wat de salon niet doet, voeg toe wat ontbreekt.
  // `confirmed: false` toont een label "concept" bij de kaart.
  treatments: [
    {
      // Bron: Social Deal (2022–2025): wassen, knippen, drogen of in model föhnen.
      id: 'knippen-fohnen', confirmed: true, nr: '01',
      name: 'Wassen, knippen & föhnen',
      short: 'Een vorm die past bij je haartype, je gezicht en je dagelijkse routine — gewassen, geknipt en in model geföhnd.',
      price: todo('prijs'), duration: todo('duur'), note: null,
    },
    {
      // Bron: Social Deal (highlights als onderdeel van de kappersbehandeling).
      id: 'highlights', confirmed: true, nr: '02',
      name: 'Highlights',
      short: 'Lichte accenten die je kleur opfrissen en diepte geven, afgestemd op je huidtint en je wensen.',
      price: todo('vanafprijs'), duration: todo('duur'),
      note: todo('afhankelijk van lengte/hoeveelheid? alleen als bevestigd'),
    },
    {
      id: 'balayage', confirmed: false, nr: '03',
      name: 'Balayage',
      short: 'Zachte, handgeschilderde overgangen voor een natuurlijk resultaat dat mooi uitgroeit.',
      price: todo('vanafprijs'), duration: todo('duur'),
      note: todo('consult vooraf nodig?'),
    },
    {
      id: 'verzorging', confirmed: false, nr: '04',
      name: 'Haarverzorging',
      short: 'Een behandeling die je haar voeding en glans geeft, met advies voor thuis.',
      price: todo('prijs'), duration: todo('duur'), note: null,
    },
    {
      id: 'gelegenheid', confirmed: false, nr: '05',
      name: 'Bruids- & gelegenheidshaar',
      short: 'Opsteken en styling voor de dag die ertoe doet, met een proefsessie vooraf.',
      price: todo('prijs'), duration: todo('duur'),
      note: todo('proefsessie, locatie aan huis? alleen als bevestigd'),
    },
  ],

  // Waar de salon op let. Alleen houden wat klopt met de werkwijze.
  craft: [
    { title: 'Jouw wens eerst', text: 'Elke afspraak begint met luisteren: wat wil je, wat past bij je haar, wat werkt in je dagelijks leven.' },
    { title: 'Textuur & afwerking', text: 'Aandacht voor hoe je haar valt en beweegt — niet alleen in de stoel, maar ook de dagen erna.' },
    { title: 'Kleur die bij je past', text: 'Tinten afgestemd op je huidtint en je natuurlijke kleur, zodat het resultaat bij jou hoort.' },
    { title: 'Advies voor thuis', text: 'Je gaat naar huis met tips om je look zelf te onderhouden.' },
  ],

  // Inspiratie: koppelt een wens aan een behandeling.
  occasions: [
    { title: 'Een frisse nieuwe look', to: 'knippen-fohnen' },
    { title: 'Meer licht in je haar', to: 'highlights' },
    { title: 'Zacht en natuurlijk lichter', to: 'balayage' },
    { title: 'Een bijzondere dag', to: 'gelegenheid' },
    { title: 'Gezond, glanzend haar', to: 'verzorging' },
  ],

  // Portfolio: alleen ECHTE foto's van eigen werk, met toestemming van de klant.
  // { src: '/assets/img/portfolio/01.webp', w: 1200, h: 1500, alt: '…' }
  // Zolang dit leeg is, toont de galerij gemarkeerde lege fotovlakken.
  portfolio: [],

  // Reviews: alleen overnemen uit een controleerbare bron (bv. Google), met
  // bronvermelding. Leeg = de sectie toont geen reviews.
  reviews: [],
  reviewsSourceUrl: null,

  faq: [
    { q: 'Hoe maak ik een afspraak?', a: 'Stuur een WhatsApp-bericht of een DM via Instagram, of bel 06 16509984. De salon stemt een moment met je af; je afspraak staat vast zodra die bevestigd is.' },
    { q: 'Wat kost mijn behandeling?', a: 'In het prijsoverzicht op deze pagina staan de tarieven per behandeling. Hangt de prijs af van je haarlengte of de hoeveelheid kleur, dan staat dat er bij.' },
    { q: 'Hoe lang duurt een behandeling?', a: 'De verwachte duur staat per behandeling in het overzicht.' },
    { q: 'Kan ik mijn afspraak wijzigen of annuleren?', a: todo('annuleringsvoorwaarden') },
    { q: 'Hoe kan ik betalen?', a: todo('betaalmogelijkheden') },
    { q: 'Hoe bereid ik me voor op een kleurbehandeling?', a: todo('advies van de salon — alleen invullen als de salon dit zo adviseert') },
  ],
};
