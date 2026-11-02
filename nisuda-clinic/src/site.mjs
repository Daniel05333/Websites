// Alle inhoud en bedrijfsgegevens van de site. Bron: het Instagram-profiel en de
// highlights van @nisudaclinic (screenshots in bron/). Onbevestigde waarden staan
// als todo('…') en worden op de site zichtbaar als placeholder gemarkeerd.

export const todo = (label) => ({ todo: true, label });
export const isTodo = (x) => !!(x && typeof x === 'object' && x.todo);

export const site = {
  name: 'Nisuda Clinic',
  lang: 'nl',
  draft: true, // true = noindex + robots blokkeert alles + geen structured data
  url: todo('domeinnaam'),

  location: {
    city: 'Enschede',
    street: todo('adres'),
    postalCode: todo('postcode'),
    country: 'NL',
    mapsUrl: null,
  },

  contact: {
    instagram: 'https://www.instagram.com/nisudaclinic/',
    handle: 'nisudaclinic',
    dm: 'https://ig.me/m/nisudaclinic',
    followers: { count: '4.259', asOf: 'oktober 2026' },
    phone: todo('telefoonnummer'),
    phoneHref: null,
    email: null, // bijv. 'info@nisudaclinic.nl'
    whatsapp: null, // internationaal, zonder + of spaties, bijv. '31612345678'
  },

  // Aanvraagformulier. Zonder endpoint wordt er niets verstuurd: de bezoeker krijgt
  // het ingevulde bericht om via Instagram (of WhatsApp/e-mail, als die er zijn) te sturen.
  // Met endpoint wordt het formulier als JSON gePOST (Formspree, Web3Forms, eigen script…).
  form: { endpoint: null },

  offer: {
    active: true, // gepost op Instagram op 8 september 2026; uitzetten als de actie voorbij is
    title: '1 proefbehandeling gratis',
    zone: 'oksel',
    text: 'Twijfel je nog over pijnloze laserontharing? Plan vrijblijvend een gratis proefbehandeling van de oksels.',
    note: 'Beperkte plekken beschikbaar.',
  },

  // Behandelingen (volgorde = volgorde op de site). `tab` verwijst naar het prijstabblad.
  treatments: [
    {
      id: 'laser', nr: '01', name: 'Laserontharing', tab: 'laser-vrouw', from: '€ 20',
      short: 'Pijnloos en definitief, voor vrouwen én mannen. Van één zone tot fullbody.',
      img: 'laser-arm', imgAlt: 'Laserhandstuk op de onderarm van een cliënt',
    },
    {
      id: 'plasmalift', nr: '02', name: 'Fibroblast plasmalift', tab: 'plasmalift', from: '€ 50',
      short: 'Verstrakt en lift de huid door de aanmaak van collageen en elastine te stimuleren. Inclusief verdoving.',
      img: 'resultaat-plasmalift-ogen', imgAlt: 'Ooggebied voor en na een plasmalift',
    },
    {
      id: 'microneedling', nr: '03', name: 'Microneedling', tab: 'overig', from: 'op aanvraag',
      short: 'Stimuleert collageen voor fijne lijntjes, littekens, pigmentatie en grote poriën.',
      img: 'resultaat-huid-microneedling', imgAlt: 'Huid met littekens naast een gladder resultaat',
    },
    {
      id: 'lipfiller', nr: '04', name: 'Lipfillers', tab: 'lipfiller', from: '€ 159,99',
      short: 'Natuurlijk, feminiek en in balans — van natural lips tot Russian lips, door Lips by Nin.',
      img: null,
    },
    {
      id: 'injectables', nr: '05', name: 'Rimpel\u00ADbehandelingen', tab: 'injectables', from: 'na consult',
      short: 'Fronsrimpels, kraaienpootjes, skinboosters en meer — altijd na een persoonlijk consult.',
      img: null,
    },
    {
      id: 'lichaam', nr: '06', name: 'Lichaam', tab: 'overig', from: '€ 25',
      short: 'EMS voor spieropbouw en vetbevriezing, per zone.',
      img: 'ems', imgAlt: 'EMS-apparaat op de buik van een cliënt',
    },
  ],

  // Prijzen per tabblad. `asOf` = datum van de Instagram-prijslijst.
  prices: [
    {
      id: 'laser-vrouw', label: 'Laser · vrouw', title: 'Laserontharing vrouw', asOf: 'prijzen vanaf 01-02-2026',
      items: [
        ['Gezicht', 25], ['Armen', 40], ['Oksels', 25], ['Buik', 20], ['Rug', 35],
        ['Brazilian', 40], ['Bikinilijn', 25], ['Benen', 40], ['Fullbody', 100, true],
      ],
    },
    {
      id: 'laser-man', label: 'Laser · man', title: 'Laserontharing man', asOf: 'prijzen vanaf 01-02-2026',
      note: 'Intieme zones behandelen wij niet bij mannen.',
      items: [
        ['Gezicht', 25], ['Bovenlichaam', 85], ['Benen', 55], ['Oksels', 30], ['Rug', 40],
        ['Borst / buik', 40], ['Armen', 45], ['Fullbody', 135, true],
      ],
    },
    {
      id: 'plasmalift', label: 'Plasmalift', title: 'Fibroblast plasmalift', asOf: 'prijslijst november 2024', verify: true,
      note: 'Inclusief verdoving. Na één behandeling is er al zichtbaar resultaat; voor het beste en blijvende resultaat raden we 2 à 3 behandelingen aan.',
      items: [
        ['Bovenooglid correctie', 120], ['Onderooglid correctie', 120], ['Boven- en onderooglid', 220],
        ['Neusplooi', 100], ['Kraaienpootjes', 120], ['Rimpels', 'v.a. 50'], ['Bovenlip', 100],
        ['Wenkbrauwlift', 250], ['Gezichtsverstrakking', 'v.a. 300'], ['Marionetlijnen', 200],
        ['Acne- of chirurgische littekens', 'v.a. 100'], ['Buik', 'op aanvraag'],
      ],
    },
    {
      id: 'lipfiller', label: 'Lipfiller', title: 'Lipfiller special', asOf: 'Instagram, juni 2026',
      note: 'Behandeling door Lips by Nin, onder een BIG-geregistreerde specialist.',
      items: [['1 ml lipfiller', '169,99', true], ['Kom je samen met iemand? Per persoon, per ml', '159,99']],
      techniques: [
        ['Russian lips', 'Extra volume en een mooie, ronde vorm.'],
        ['Flat lips', 'Een subtiele lift van de bovenlip, zonder extra volume.'],
        ['Doll lips', 'Focus op het midden van de lippen voor een zoete, volle uitstraling.'],
        ['Normal volume', 'Natuurlijk volume voor zachte lippen die bij je gezicht passen.'],
        ['Natural lips', 'Een zachte, natuurlijke verfijning.'],
      ],
    },
    {
      id: 'overig', label: 'Huid & lichaam', title: 'Huid, lichaam & overig', asOf: 'prijslijst november 2024', verify: true,
      items: [
        ['Microneedling', 'op aanvraag'], ['EMS (spieropbouw)', '25 per 30 min per zone'],
        ['Vetbevriezing', '50 per zone per uur'], ['Tandenbleken', '15 per 30 min'],
        ['Tattoo verwijderen', 'in overleg'],
      ],
    },
    {
      id: 'injectables', label: 'Injectables', title: 'Rimpelbehandelingen & boosters',
      // Publieksreclame voor receptplichtige geneesmiddelen (zoals botulinetoxine) is in
      // Nederland niet toegestaan. Daarom staan deze prijzen standaard niet op de site.
      showPrices: false,
      note: 'Welke behandeling bij je past en wat die kost, bespreken we in een persoonlijk consult. Zo krijg je advies op maat in plaats van een standaardprijs.',
      zones: ['Fronsrimpels', 'Kraaienpootjes', 'Wenkbrauwlift', 'Bunny lines', 'Gummy smile', 'Kin', 'Kaakspieren / tandenknarsen', 'Overmatig zweten (oksels)', 'Skinboosters', 'Under eye booster'],
      items: [],
    },
  ],

  // Galerij: foto's zoals gepubliceerd door de kliniek op Instagram.
  results: [
    { src: 'resultaat-laser-oksel', cat: 'laser', title: 'Oksels', caption: 'Voor & na 1 sessie', w: 394, h: 526 },
    { src: 'resultaat-plasmalift-collage', cat: 'plasmalift', title: 'Plasmalift ooglid', caption: 'Voor, direct na en het resultaat', w: 876, h: 1022, wide: true },
    { src: 'resultaat-laser-baardlijn', cat: 'laser', title: 'Baardlijn', caption: 'Na de 5e behandeling', w: 394, h: 526 },
    { src: 'resultaat-plasmalift-ogen', cat: 'plasmalift', title: 'Ooggebied', caption: 'Voor & na', w: 394, h: 526 },
    { src: 'resultaat-huid-acne', cat: 'huid', title: 'Acnehuid', caption: 'Voor & na', w: 394, h: 526 },
    { src: 'resultaat-laser-nek', cat: 'laser', title: 'Nek', caption: 'Na de 3e behandeling', w: 394, h: 526 },
    { src: 'resultaat-plasmalift-voorhoofd', cat: 'plasmalift', title: 'Voorhoofd', caption: 'Voor, direct na en het resultaat', w: 498, h: 882, tall: true },
    { src: 'resultaat-lichaam', cat: 'lichaam', title: 'Bovenlichaam', caption: 'Voor & na', w: 394, h: 526 },
    { src: 'resultaat-huid-microneedling', cat: 'huid', title: 'Littekens', caption: 'Voor & na', w: 394, h: 515 },
    { src: 'resultaat-plasmalift-oogleden', cat: 'plasmalift', title: 'Bovenoogleden', caption: 'Voor & na', w: 394, h: 500 },
    { src: 'resultaat-laser-oksel-2', cat: 'laser', title: 'Oksel', caption: 'Voor & na', w: 394, h: 526 },
  ],

  // Huisregels (Instagram-highlight "Rules", november 2025), herschreven als advies.
  care: {
    before: [
      'Scheer de zones die behandeld worden vooraf, maar niet op de dag zelf — zo voorkom je irritatie. Ongeschoren plekken behandelen we niet.',
      'Kom met een schone huid, zonder crème, make-up of andere producten.',
      'Vermijd de zonnebank een week vóór en na je behandeling, en zonnen in dezelfde week.',
      'Gebruik je medicijnen of specifieke huidproducten? Meld het vooraf. Niet melden is op eigen risico.',
      'Heb je een tattoo in het behandelgebied? Dek die zelf af. We zijn niet aansprakelijk als een tattoo geraakt wordt.',
    ],
    after: [
      'Niet heet douchen na de behandeling.',
      'Na een gezichtsbehandeling laseren we het gezicht twee weken niet. Geef dit aan bij je laserafspraak.',
      'Volg je de adviezen niet op, dan kan het resultaat afwijken of langer op zich laten wachten.',
    ],
    cancel: 'Afmelden kan tot ongeveer 6 uur van tevoren. Bij een last-minute afmelding rekenen we € 30.',
  },

  reviews: [], // { text, author, source } — alleen echte reviews, met toestemming
};
