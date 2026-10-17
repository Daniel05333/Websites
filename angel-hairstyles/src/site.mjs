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
  lang: 'nl',

  location: {
    city: todo('plaats'),
    street: todo('straat + huisnummer'),
    postalCode: todo('postcode'),
    country: 'NL',
    // Alleen invullen met de officiële Google Maps-link of coördinaten.
    mapsUrl: todo('Google Maps-link'),
    parking: todo('parkeren (alleen als bevestigd)'),
  },

  contact: {
    phone: todo('telefoonnummer'),          // weergave, bv. '0165 – 55 17 71'
    phoneHref: null,                         // bv. 'tel:+31165551771'
    whatsappHref: null,                      // bv. 'https://wa.me/31612345678' — alleen als de salon WhatsApp gebruikt
    email: todo('e-mailadres'),
    instagram: null,                         // bv. 'https://www.instagram.com/…'
    facebook: null,
  },

  // De bestaande, werkende boekingsroute. Laat `url` leeg tot die bekend is;
  // de afspraakknoppen sturen bezoekers dan naar de contactsectie.
  booking: {
    url: null,                               // bv. Salonized / Treatwell / Fresha / eigen widget
    provider: todo('boekingssysteem'),
    // Beschrijf de ECHTE stappen; niets beloven wat het systeem niet doet.
    confirmation: todo('hoe wordt een afspraak bevestigd (direct online, per mail, telefonisch)?'),
    cancellation: todo('annuleringsvoorwaarden'),
    payment: todo('betaalmogelijkheden in de salon'),
  },

  hours: [
    { day: 'Maandag', value: todo('openingstijd') },
    { day: 'Dinsdag', value: todo('openingstijd') },
    { day: 'Woensdag', value: todo('openingstijd') },
    { day: 'Donderdag', value: todo('openingstijd') },
    { day: 'Vrijdag', value: todo('openingstijd') },
    { day: 'Zaterdag', value: todo('openingstijd') },
    { day: 'Zondag', value: todo('openingstijd') },
  ],

  story: {
    // Het echte verhaal van de salon: wie, sinds wanneer, werkwijze. Geen
    // ervaring of kwalificaties verzinnen.
    paragraphs: [
      'Goed haar is meer dan een behandeling. Het is hoe je jezelf herkent in de spiegel — verzorgd, eigen, en precies zoals jij het wilt.',
      todo('2–3 zinnen over de eigenaar/stylist(en), sinds wanneer de salon bestaat en de werkwijze'),
    ],
    photoAlt: todo('foto van de salon of stylist'),
  },

  // Behandelingen. Dit zijn CONCEPT-categorieën uit de briefing, geen
  // geverifieerd aanbod: verwijder wat de salon niet doet, voeg toe wat ontbreekt.
  // `confirmed: false` toont een label "concept" bij de kaart.
  treatments: [
    {
      id: 'knippen-stylen', confirmed: false, nr: '01',
      name: 'Knippen & stylen',
      short: 'Een vorm die past bij je haartype, je gezicht en je dagelijkse routine — afgewerkt met styling.',
      price: todo('prijs'), duration: todo('duur'), note: null,
    },
    {
      id: 'kleuren', confirmed: false, nr: '02',
      name: 'Kleuren & highlights',
      short: 'Van een subtiele opfrissing tot een nieuwe kleur, afgestemd op je huidtint en je wensen.',
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
    { title: 'Een frisse nieuwe look', to: 'knippen-stylen' },
    { title: 'Een andere haarkleur', to: 'kleuren' },
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
    { q: 'Hoe maak ik een afspraak?', a: todo('de echte afspraakroute (online systeem, telefoon, WhatsApp)') },
    { q: 'Wat kost mijn behandeling?', a: 'In het prijsoverzicht op deze pagina staan de tarieven per behandeling. Hangt de prijs af van je haarlengte of de hoeveelheid kleur, dan staat dat er bij.' },
    { q: 'Hoe lang duurt een behandeling?', a: 'De verwachte duur staat per behandeling in het overzicht.' },
    { q: 'Kan ik mijn afspraak wijzigen of annuleren?', a: todo('annuleringsvoorwaarden') },
    { q: 'Hoe kan ik betalen?', a: todo('betaalmogelijkheden') },
    { q: 'Hoe bereid ik me voor op een kleurbehandeling?', a: todo('advies van de salon — alleen invullen als de salon dit zo adviseert') },
  ],
};
