// Centrale bron voor alle bedrijfsgegevens, tarieven, werkgebied en FAQ.
// Pas gegevens alleen hier aan; `npm run build` zet ze door naar alle pagina's.
//
// Bronnen: de opdrachtbeschrijving, een schermafbeelding van rijschoollinkerbaan.nl en van
// instagram.com/rijschoollinkerbaan (16-10-2026). Gegevens in VERIFY_BEFORE_LAUNCH moeten
// vóór publicatie door de rijschool worden bevestigd. Zie docs/03-oplevering.md.

export const site = {
  name: 'Rijschool Linkerbaan',
  url: 'https://www.rijschoollinkerbaan.nl',
  locale: 'nl_NL',
  owner: {
    name: 'Furkan Topuzcu',
    firstName: 'Furkan',
    role: 'Eigenaar en rijinstructeur',
    // Echte portretfoto, zodra beschikbaar (bijv. '/assets/img/furkan.webp').
    photo: null,
    // Het bestaande logo: een getekend portret van Furkan met lesauto.
    logo: '/assets/img/logo-furkan-512.webp',
    logoSmall: '/assets/img/logo-furkan-128.webp',
  },
  // Slogan van de bestaande site.
  tagline: 'Rij met plezier',
  footerTagline: 'Jouw persoonlijke rijschool voor een vlotte en veilige ervaring.',
  social: {
    instagram: 'https://www.instagram.com/rijschoollinkerbaan/',
    instagramHandle: '@rijschoollinkerbaan',
    tiktok: 'https://www.tiktok.com/@rijschoollinkerbaan',
  },
  // De lesauto zoals te zien op Instagram.
  car: 'Volkswagen Golf',
  contact: {
    phoneDisplay: '085 060 8137',
    phoneE164: '+31850608137',
    email: 'info@rijschoollinkerbaan.nl',
    // Nummer voor wa.me-links, alleen cijfers met landcode. TE BEVESTIGEN: het
    // WhatsApp-nummer van de bestaande site was niet in te zien; dit is het vaste nummer.
    whatsapp: '31850608137',
    whatsappMessage: 'Hoi Furkan, ik heb een vraag over rijlessen bij Rijschool Linkerbaan.',
    region: 'Enschede en omgeving',
  },
  // Formulierverwerking. Zonder endpoint stuurt het formulier de aanvraag (na validatie)
  // door via WhatsApp of e-mail en zegt het eerlijk dat dit nog niet automatisch gaat.
  // Met een endpoint (bijv. Formspree, Basin, een eigen PHP-script of het bestaande
  // aanmeldsysteem) wordt de aanvraag als JSON gePOST en alleen bij HTTP 2xx bevestigd.
  form: {
    endpoint: '',
  },
  // Echte foto's (van het Instagram-account van de rijschool). `hero: null` toont
  // de getekende weg-illustratie.
  photos: {
    hero: {
      src: '/assets/img/hero-lesauto.webp',
      alt: 'Een leerling staat juichend bij de grijze lesauto van Rijschool Linkerbaan',
      width: 630,
      height: 841,
    },
    interior: {
      src: '/assets/img/lesauto-interieur.webp',
      alt: 'Zicht vanaf de bestuurdersstoel van de lesauto op een straat met fietspad',
      width: 630,
      height: 490,
    },
    gallery: [
      { src: '/assets/img/instagram-1.webp', alt: 'Leerling bij de geopende deur van de lesauto' },
      { src: '/assets/img/instagram-2.webp', alt: 'Leerling poseert naast de lesauto' },
      { src: '/assets/img/instagram-3.webp', alt: 'Leerling steekt de hand op naast de lesauto' },
      { src: '/assets/img/instagram-4.webp', alt: 'Leerling stapt uit de lesauto op een parkeerterrein' },
      { src: '/assets/img/instagram-5.webp', alt: 'Leerling houdt het lesbord omhoog naast de lesauto' },
      { src: '/assets/img/instagram-6.webp', alt: 'Leerling zwaait met het lesbord bij de lesauto' },
    ],
  },
};

export const packages = [
  {
    id: 'beginners',
    number: 1,
    name: 'Beginners',
    price: 1100,
    lessons: 20,
    lessonMinutes: 60,
    audience: 'Voor wie nog weinig of geen rijervaring heeft en rustig wil opbouwen.',
    features: [
      '20 rijlessen van 60 minuten',
      'Gratis proefles bij inschrijving',
      'Persoonlijk lesplan',
      'Ophalen en afzetten aan huis',
    ],
    highlight: false,
  },
  {
    id: 'ervaren',
    number: 2,
    name: 'Ervaren',
    price: 1650,
    lessons: 30,
    lessonMinutes: 60,
    audience: 'Voor wie al wat rijervaring heeft en toewerkt naar het examen.',
    features: [
      '30 rijlessen van 60 minuten',
      'Examenbegeleiding inbegrepen',
      'Ophalen en afzetten aan huis',
    ],
    highlight: true,
    badge: 'Met examenbegeleiding',
  },
  {
    id: 'spoed',
    number: 3,
    name: 'Spoed',
    price: 2300,
    lessons: 40,
    lessonMinutes: null, // lesduur niet vermeld op de bestaande site
    lessonLabel: 'praktijkgerichte lessen',
    duration: '2–3 maanden',
    audience: 'Voor wie in korte tijd intensief wil lessen en daar tijd voor kan vrijmaken.',
    features: [
      '40 praktijkgerichte lessen',
      'Doorlooptijd van 2–3 maanden',
      'Praktijkexamen inbegrepen',
    ],
    highlight: false,
  },
];

export const serviceArea = [
  'Enschede',
  'Hengelo',
  'Haaksbergen',
  'Borne',
  'Almelo',
  'Losser',
  'Oldenzaal',
  'Overdinkel',
];

export const steps = [
  {
    title: 'Vraag je proefles aan',
    text: 'Laat je naam en nummer achter. Furkan neemt contact met je op om een moment te plannen.',
  },
  {
    title: 'Proefles: kennismaken achter het stuur',
    text: 'Je rijdt een eerste les en we kijken samen waar je staat. Zo weet je wat je kunt verwachten.',
  },
  {
    title: 'Lesplan en pakket kiezen',
    text: 'Op basis van de proefles bespreken we welk pakket en welk tempo bij jou past.',
  },
  {
    title: 'Lessen op jouw niveau',
    text: 'Stap voor stap bouw je rijvaardigheid en vertrouwen op, met duidelijke uitleg na elke les.',
  },
  {
    title: 'Klaar voor het examen',
    text: 'Als je er klaar voor bent, werken we gericht naar je praktijkexamen toe.',
  },
];

// De drie kernwaarden van de bestaande site, in hun eigen woorden.
export const reasons = [
  {
    icon: 'smile',
    title: 'Plezier',
    text: 'Autorijden leren met een glimlach. Furkan zorgt voor een ontspannen en gezellige sfeer in de auto.',
  },
  {
    icon: 'shield',
    title: 'Vertrouwen',
    text: 'Jij staat centraal. Stap voor stap bouw je aan je zelfvertrouwen, zodat je zeker achter het stuur zit.',
  },
  {
    icon: 'chat',
    title: 'Duidelijkheid',
    text: 'Altijd transparante communicatie over lessen, planning en kosten. Geen verrassingen.',
  },
];

// Antwoorden gebruiken alleen informatie die op de bestaande site stond. Waar die
// ontbreekt, verwijst het antwoord naar persoonlijk contact.
export const faq = [
  {
    q: 'Hoe werkt een proefles?',
    a: 'Tijdens de proefles maak je kennis met Furkan en de lesauto, en rijd je een eerste keer. Daarna weet je waar je staat en welk pakket bij je past. Bij het pakket Beginners is de proefles gratis bij inschrijving. Wil je weten hoe dat bij de andere pakketten zit? Vraag het gerust bij je aanvraag.',
  },
  {
    q: 'Welk lespakket past bij mij?',
    a: 'Heb je nog weinig of geen rijervaring, dan is Beginners een logische start. Heb je al wat gereden, dan sluit Ervaren beter aan. Wil je in korte tijd intensief lessen, dan is er het Spoed-pakket. Twijfel je? Na de proefles adviseren we je eerlijk.',
  },
  {
    q: 'Hoe lang duurt een rijles?',
    a: 'In de pakketten Beginners en Ervaren duurt een rijles 60 minuten. Voor de lesduur binnen het Spoed-pakket kun je het beste even contact opnemen.',
  },
  {
    q: 'Hoe worden de lessen ingepland?',
    a: 'Lessen worden in overleg met Furkan ingepland. Neem contact op om je beschikbaarheid te bespreken.',
  },
  {
    q: 'In welke plaatsen geeft de rijschool les?',
    a: 'Rijschool Linkerbaan geeft les in Enschede, Hengelo, Haaksbergen, Borne, Almelo, Losser, Oldenzaal en Overdinkel. Woon je net buiten deze plaatsen? Vraag het gewoon even.',
  },
  {
    q: 'Hoe werkt een spoedtraject?',
    a: 'Het Spoed-pakket bestaat uit 40 praktijkgerichte lessen met een doorlooptijd van 2 tot 3 maanden, inclusief praktijkexamen. Je lest dan intensief, dus het vraagt dat je in die periode genoeg tijd vrijmaakt. Of een spoedtraject bij jou past, bespreken we graag vooraf.',
  },
  {
    q: 'Wat is inbegrepen bij de lespakketten?',
    a: 'Beginners: 20 lessen van 60 minuten, een gratis proefles bij inschrijving, een persoonlijk lesplan en ophalen en afzetten aan huis. Ervaren: 30 lessen van 60 minuten, examenbegeleiding en ophalen en afzetten aan huis. Spoed: 40 praktijkgerichte lessen in 2–3 maanden, inclusief praktijkexamen. De precieze voorwaarden hoor je vooraf.',
  },
  {
    q: 'Hoe verloopt de voorbereiding op het praktijkexamen?',
    a: 'Je lesplan werkt stap voor stap naar het praktijkexamen toe. In het pakket Ervaren is examenbegeleiding inbegrepen en in het Spoed-pakket het praktijkexamen zelf. Hoe dat er voor jou precies uitziet, bespreken we persoonlijk.',
  },
  {
    q: 'Hoe kan ik contact opnemen?',
    a: 'Vraag een proefles aan via het formulier, bel naar 085 060 8137, stuur een WhatsApp-bericht of mail naar info@rijschoollinkerbaan.nl.',
  },
];

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/tarieven/', label: 'Rijlessen & tarieven' },
  { href: '/over-rijschool-linkerbaan/', label: 'Over ons' },
  { href: '/#veelgestelde-vragen', label: 'FAQ' },
  { href: '/contact/', label: 'Contact' },
];

// Gegevens die vóór livegang door de rijschool bevestigd moeten worden.
export const VERIFY_BEFORE_LAUNCH = [
  'Prijzen, pakketnamen en inhoud van alle drie de pakketten',
  'Lesduur binnen het Spoed-pakket',
  'Welk examen precies bij Spoed is inbegrepen en onder welke voorwaarden (bijv. herexamen)',
  'Of ophalen en afzetten aan huis ook geldt voor het Spoed-pakket',
  'Of de proefles bij Ervaren en Spoed ook gratis is',
  'Of prijzen inclusief btw zijn',
  'Het WhatsApp-nummer (nu ingesteld op het vaste nummer 085 060 8137)',
  'Werkgebied: nog steeds alle acht plaatsen?',
  'Doelgroepomschrijving per pakket ("Voor wie")',
  'Toestemming van de leerlingen op de Instagram-foto’s om ze ook op de website te tonen',
  'Of de lesauto nog de grijze Volkswagen Golf van de Instagram-foto’s is',
  'Een echte portretfoto van Furkan (nu wordt het getekende logo gebruikt)',
  'Formulierkoppeling met het bestaande aanmeldsysteem',
  'KvK-nummer en eventuele vestigingsgegevens voor footer en privacyverklaring',
];

export const formatPrice = (n) =>
  '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: 0 });
