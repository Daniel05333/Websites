// Studio Nazz: alle inhoud, behandelingen, cursussen en gegevens op één plek.
// Bron: Instagram @studionazz_ (profiel, posts en highlights), zie bron/.
//
// Dit is een CONCEPT. Onbevestigde waarden staan als todo('…') en verschijnen
// op de site als "op aanvraag" of als gemarkeerde placeholder. Zolang
// draft: true staat krijgt de site noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Studio Nazz',
  tagline: 'Aesthetics & academy',
  slogan: 'Good lashes, brighter days.',
  url: todo('domeinnaam'),
  city: todo('plaats / adres van de salon'),

  contact: {
    instagram: 'studionazz_',
    whatsapp: todo('WhatsApp-nummer, bijv. 316xxxxxxxx'),
    email: todo('e-mailadres'),
  },

  // Koppel een online agenda (Salonized, Treatwell, Planity, …): vul de link in
  // en alle "Boek"-knoppen gaan daarheen. Leeg = aanvraag via Instagram-DM.
  bookingUrl: null,

  categories: [
    {
      id: 'lashes',
      name: 'Lashes',
      lead: 'Van een natuurlijke classic set tot een vol Russian volume-effect. Elke set wordt op jouw oogvorm gemapt.',
      image: 'russian-volume-grijs',
      items: [
        { name: 'Classic lashes', desc: 'Eén extension per eigen wimper. Natuurlijk, verzorgd en licht.', price: todo('prijs classic') },
        { name: 'Hybrid lashes', desc: 'De mix van classic en volume: textuur en volheid in één set.', price: todo('prijs hybrid') },
        { name: 'Volume lashes', desc: 'Handgemaakte fans voor een zachte, volle look.', price: todo('prijs volume') },
        { name: 'Russian volume', desc: 'Ultrafijne, dichte fans voor maximale volheid en een dramatisch effect.', price: todo('prijs russian volume') },
        { name: 'Wispy lashes', desc: 'Speelse pieken en lagen voor de populaire wispy look.', price: todo('prijs wispy') },
        { name: 'Lash volume lift', desc: 'Je eigen wimpers gelift en gekleurd. Open blik, zonder extensions.', price: todo('prijs lash lift') },
        { name: 'Refill', desc: 'Je set weer vol en fris, binnen enkele weken na je volle set.', price: todo('prijs refill') },
      ],
    },
    {
      id: 'brows',
      name: 'Brows',
      lead: 'Strak in vorm, vol in kleur. Wenkbrauwen die je gezicht omlijsten.',
      image: 'lash-brow-closeup',
      items: [
        { name: 'Brow threading', desc: 'Epileren met draad voor een strakke, nauwkeurige lijn.', price: todo('prijs threading') },
        { name: 'Brow lamination', desc: 'Haartjes in model gezet voor volle, geborstelde brows.', price: todo('prijs lamination') },
        { name: 'Brow tint', desc: 'Kleur voor meer definitie en een vollere uitstraling.', price: todo('prijs tint') },
        { name: 'Powderbrows', desc: 'Semi-permanente, zachte poedereffect-brows. Elke ochtend in vorm.', price: todo('prijs powderbrows') },
      ],
    },
    {
      id: 'skin',
      name: 'Skin',
      lead: 'Behandelingen voor een frisse, egale huid. Altijd na een persoonlijke intake.',
      image: 'lashes-brows',
      items: [
        { name: 'PhiLings', desc: todo('korte omschrijving PhiLings'), price: todo('prijs PhiLings') },
        { name: 'Microneedling', desc: 'Stimuleert de huid voor een gladdere, egalere teint.', price: todo('prijs microneedling') },
        { name: 'Plasmapen', desc: 'Plasmabehandeling voor een strakkere uitstraling, bijvoorbeeld rond de ogen.', price: todo('prijs plasmapen') },
        { name: 'Facials', desc: 'Een reinigende en verzorgende gezichtsbehandeling, afgestemd op jouw huid.', price: todo('prijs facials') },
      ],
    },
  ],

  portfolio: [
    { img: 'russian-volume-groot-1', label: 'Russian volume', wide: true },
    { img: 'wispy-lashes', label: 'Wispy' },
    { img: 'classic-lashes', label: 'Classic' },
    { img: 'volume-lashes-1', label: 'Volume' },
    { img: 'lashlift-voor-na', label: 'Lash lift · voor & na' },
    { img: 'wispy-volume', label: 'Wispy volume' },
    { img: 'russian-volume-groot-2', label: 'Russian volume', wide: true },
    { img: 'brows-voor-na', label: 'Brows · voor & na' },
    { img: 'volume-bruin', label: 'Volume' },
    { img: 'lashlift-behandeling', label: 'Lash lift' },
  ],

  brows: [1, 2, 3],

  promo: {
    active: true,
    title: 'Bring a friend',
    sub: 'Samen mooier! Beauty is better together.',
    newClient: '€10 korting op haar eerste volle wimperset',
    existing: '€10 korting op jouw volgende refill na de afspraak van je vriendin',
  },

  certified: 'Voor alle behandelingen die worden uitgevoerd zijn diploma’s en certificaten behaald.',

  usps: ['Hoogwaardige kwaliteit', 'Persoonlijke aandacht', 'Jarenlange ervaring', 'Natuurlijk & luxe resultaat'],

  academy: {
    title: 'Word een échte lash professional',
    sub: 'Meer dan een cursus, een investering in jezelf.',
    intro: 'Leer het vak zoals het écht in de praktijk werkt. Met jarenlange ervaring deel ik al mijn kennis, technieken en geheimen met jou.',
    quote: 'Invest in yourself now, later you will thank yourself.',
    modules: [
      { t: 'Professionele technieken', d: 'Classic, volume en meer, stap voor stap.' },
      { t: 'Styling & mapping', d: 'De juiste lengte, krul en dikte per klant.' },
      { t: 'Verschillende oogvormen', d: 'Leer elke oogvorm lezen en versterken.' },
      { t: 'Retentie & probleemoplossing', d: 'Sets die blijven zitten, en wat te doen als dat niet zo is.' },
      { t: 'Veiligheid & hygiëne', d: 'Werken volgens de juiste normen, voor jou en je klant.' },
      { t: 'Persoonlijke begeleiding', d: 'Ook na de cursus sta je er niet alleen voor.' },
    ],
    included: ['Volledige theorie & praktijk', 'Werken op model', 'Alle technieken (Classic, Volume etc.)', 'Tips & tricks uit de praktijk', 'Starterspakket inbegrepen', 'Certificaat na afronding', 'Nazorg en blijvende ondersteuning'],
    formats: [
      { id: '1op1', name: '1-op-1 cursus', lead: 'Persoonlijke aandacht', desc: 'Jij en de trainer. Volledig in jouw tempo, met een flexibele planning.', price: todo('prijs 1-op-1') },
      { id: 'groep', name: 'Groepscursus', lead: 'Leren in een kleine groep', desc: 'Samen leren, oefenen en sparren in een kleine, gezellige groep.', price: todo('prijs groepscursus') },
    ],
    courses: [
      { name: 'One by one', days: 1, type: 'Lashes' },
      { name: 'Russian volume', days: 1, type: 'Lashes' },
      { name: 'Wimperlift', days: 1, type: 'Lashes' },
      { name: 'Browlamination', days: 1, type: 'Brows' },
      { name: 'Wimperlift + browlamination', days: 1, type: 'Combinatie' },
      { name: 'One by one + Russian volume', days: 2, type: 'Combinatie' },
    ],
    perks: ['One on one attention', 'Flexibele dataplanning', '24/7 after service', 'Starterskit'],
    steps: [
      { t: 'Aanmelden via DM', d: 'Stuur een bericht met de cursus die je wilt volgen.' },
      { t: 'Datum plannen', d: 'We nemen contact met je op en plannen samen een datum.' },
      { t: 'Trainen', d: 'Theorie, praktijk en werken op model met je starterskit.' },
      { t: 'Gecertificeerd', d: 'Je ontvangt je certificaat en houdt toegang tot nazorg.' },
    ],
  },
};
