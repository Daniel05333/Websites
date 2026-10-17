// ─────────────────────────────────────────────────────────────────────────────
// Camel Middle East Grill House — ALLE inhoud en bedrijfsgegevens staan hier.
//
// Regel: niets is als feit opgenomen zonder bron (zie docs/rapportage.md §1).
// Een waarde die nog bevestigd moet worden staat als `todo('omschrijving')`.
// Die verschijnt op de site als een gestippeld gemarkeerde placeholder en
// wordt nooit in structured data, de sitemap of meta-teksten als feit gebruikt.
//
// Prijzen: overgenomen uit de bestaande webshop grillroomcamel.com (WooCommerce,
// stand zoekindex oktober 2026). De shop zelf toonde op verschillende pagina's
// verschillende bedragen. Daarom staat `menu.pricesVerified` op false: de site
// toont dan een gemarkeerde melding en `npm test` blokkeert de livegang tot de
// eigenaar alle prijzen naast de bestelomgeving heeft gelegd.
//
// `price: null` = prijs niet gevonden → de site toont "prijs in bestelomgeving".
//
// Zolang `draft: true`: noindex op elke pagina, robots.txt blokkeert alles,
// geen JSON-LD en een ontwikkelbalk bovenaan.
// ─────────────────────────────────────────────────────────────────────────────

export const todo = (label) => ({ todo: true, label });
export const isTodo = (v) => v && typeof v === 'object' && v.todo === true;

const SHOP = 'https://grillroomcamel.com';
const p = (slug) => `${SHOP}/product/${slug}/`;

export const site = {
  draft: true,
  name: 'Camel Middle East Grill House',
  short: 'Camel',
  url: 'https://grillroomcamel.nl',          // bron: briefing + zoekindex (huidige info-site)
  lang: 'nl',

  location: {
    street: 'Oude Markt 9A',                 // bron: briefing, grillroomcamel.nl, near-place, enschede053
    postalCode: '7511 GA',
    city: 'Enschede',
    region: 'Overijssel',
    country: 'NL',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Camel+Middle+East+Grill+House+Oude+Markt+9A+7511+GA+Enschede',
    // Embedded kaart bewust niet: dat laadt Google zonder toestemming (cookies).
  },

  contact: {
    phone: '053 432 4663',                   // bron: briefing + meerdere vermeldingen
    phoneHref: 'tel:+31534324663',
    email: null,                             // geen openbaar adres gevonden
    instagram: null,
    facebook: null,
  },

  // De bestaande, werkende bestel- en betaalomgeving: WooCommerce op
  // grillroomcamel.com (productpagina's met opties → winkelwagen → afrekenen).
  // Wordt NIET vervangen. Alle bestelknoppen linken hierheen; producten met een
  // bekende productpagina linken direct naar die pagina.
  order: {
    url: `${SHOP}/`,
    host: 'grillroomcamel.com',
    // Bezorgen/afhalen, bezorgkosten, minimumbedrag, betaalmethoden: niet
    // betrouwbaar gevonden. Pas tonen als de eigenaar ze bevestigt.
    pickup: todo('afhalen mogelijk? (bevestigen)'),
    delivery: todo('bezorgen + gebied, kosten, minimum (bevestigen)'),
    payment: todo('betaalmethoden in de webshop (bevestigen)'),
  },

  // bron: grillroomcamel.nl (tekst aangeleverd door de klant, okt 2026). De
  // site toont TWEE lijsten die elkaar tegenspreken: lijst A sluit wo 03:00,
  // vr 04:30, za 05:00; lijst B sluit wo 02:00, vr 03:30, za 03:30. De overige
  // dagen en de openingstijd 15:00 zijn in beide lijsten gelijk.
  hours: [
    { day: 'Maandag', dow: 'Mo', open: '15:00', close: '02:00' },
    { day: 'Dinsdag', dow: 'Tu', open: '15:00', close: '02:00' },
    { day: 'Woensdag', dow: 'We', open: '15:00', close: todo('03:00 of 02:00') },
    { day: 'Donderdag', dow: 'Th', open: '15:00', close: '03:00' },
    { day: 'Vrijdag', dow: 'Fr', open: '15:00', close: todo('04:30 of 03:30') },
    { day: 'Zaterdag', dow: 'Sa', open: '15:00', close: todo('05:00 of 03:30') },
    { day: 'Zondag', dow: 'Su', open: '15:00', close: '02:00' },
  ],
  hoursVerified: false,

  // Echte foto's van de zaak (aangeleverd door de klant, oktober 2026).
  photos: {
    'doner-spies': 'Döner aan het spit voor de gloeiende branders in de keuken van Camel',
    grill: 'De gloeiende salamandergrill in de keuken van Camel',
    bar: 'De bar van Camel met flessen, rood ledlicht en foodpanelen boven de toonbank',
    koeling: 'Koelkast met frisdranken naast de bar van Camel',
    'interieur-wand': 'Turkse sierborden en een Cappadocië-poster aan de wand bij Camel',
  },

  logo: todo('officieel Camel-logo (nu een tekstlogo)'),

  // Eigen tekst van grillroomcamel.nl (aangeleverd door de klant), licht ingekort.
  about: [
    'Camel Middle East Grill House is een gezellige grillroom in het centrum van Enschede, aan de Oude Markt. Bij Camel kun je in een ontspannen sfeer terecht voor een ouderwets lekker broodje shoarma — of voor een (mini)schotel met döner kebab, kipdöner, lamsreepjes of falafel.',
    'Voor de jongere eters staan er diverse kindermenu’s op de kaart. En wil je alleen een glaasje drinken? Ook dan ben je van harte welkom. Of je nu met je gezin komt eten of na het uitgaan nog trek hebt: dankzij de zeer ruime openingstijden houden we met iedereen rekening.',
  ],
  // Gastreactie zoals die op grillroomcamel.nl staat. Geen sterren, geen
  // aggregate rating: alleen deze ene, letterlijk overgenomen reactie.
  review: { text: 'Wij vonden het magnifique. Gerechten waren overheerlijk en een lust voor het oog. Personeel heel professioneel en zeer vriendelijk. We zullen zeker ons nog een keer laten verwennen.', author: 'M.', source: 'grillroomcamel.nl' },

  menu: {
    pricesVerified: false,
    source: 'grillroomcamel.com, zoekindex oktober 2026',
    categories: [
      {
        id: 'broodjes', name: 'Broodjes', blurb: 'Shoarma, döner, kipfilet, falafel en burgers.',
        items: [
          { name: 'Broodje shoarma', price: 12.0 },
          { name: 'Broodje shoarma kaas', price: 12.5 },
          { name: 'Broodje shoarma groot', price: 15.0 },
          { name: 'Broodje döner kebab', price: 10.5 },
          { name: 'Broodje kipfilet', price: 12.0 },
          { name: 'Broodje falafel', price: 10.5, veg: true },
          { name: 'Broodje hamburger', price: 8.0 },
          { name: 'Broodje cheeseburger', price: 8.5 },
          { name: 'Broodje hawaïburger', price: 9.0 },
        ],
      },
      {
        id: 'durum', name: 'Dürüm', blurb: 'Opgerold in dun brood.',
        items: [
          { name: 'Dürüm Camel', desc: 'Met gebakken aardappels, döner en salade.', price: 10.75 },
          { name: 'Dürüm döner', price: 10.5 },
          { name: 'Dürüm shoarma', price: 10.5, url: p('durum-shoarma') },
          { name: 'Dürüm kip', price: 10.5 },
          { name: 'Dürüm adana', price: 11.0 },
          { name: 'Dürüm falafel', price: 10.5, veg: true, url: p('durum-falafel') },
          { name: 'Dürüm gezond', price: 9.0 },
        ],
      },
      {
        id: 'kapsalon', name: 'Kapsalon', blurb: 'Met gebakken aardappels, salade en gesmolten kaas.',
        url: `${SHOP}/product-category/met-gebakken-aardappels-salade-en-gesmolten-kaas/`,
        sizes: ['Normaal', 'Groot', 'XXL'],
        items: [
          { name: 'Kapsalon döner', sizes: [14.0, 17.5, 21.0], url: p('kapsalon-doner-xxl') },
          { name: 'Kapsalon kipdöner', sizes: [14.0, 17.5, 21.0] },
          { name: 'Kapsalon shoarma', sizes: [null, 17.5, 21.0], url: p('kapsalon-shoarma-groot') },
          { name: 'Kapsalon kipfilet', sizes: [14.5, null, 21.5], url: p('kapsalon-kipfilet-xxl') },
          { name: 'Kapsalon lamsreepjes', sizes: [null, null, null], url: p('kapsalon-lamsreepjes-xxl') },
          { name: 'Kapsalon mix shoarma met kip', sizes: [null, null, null], url: p('kapsalon-mix-shoarma-met-kip-xxl') },
          { name: 'Kapsalon falafel', sizes: [null, null, null], veg: true, url: p('kapsalon-falafel-groot') },
        ],
      },
      {
        id: 'donerbox', name: 'Dönerbox', blurb: 'Snel en compleet, met gebakken aardappels en salade.',
        items: [
          { name: 'Dönerbox döner', price: 9.5 },
          { name: 'Dönerbox shoarma', price: 9.5, url: p('donerbox-shoarma') },
          { name: 'Dönerbox kipdöner', price: 9.5 },
        ],
      },
      {
        id: 'lahmacun', name: 'Lahmacun', blurb: 'Dunne, krokante Turkse pizza.',
        items: [
          { name: 'Lahmacun', price: 7.0 },
          { name: 'Lahmacun kaas en groenten', price: 8.0, url: p('lahmacun-kaas-en-groenten') },
          { name: 'Lahmacun adana', price: 13.0 },
        ],
      },
      {
        id: 'dagmenu', name: 'Dagmenu’s', blurb: 'Een complete maaltijd voor een vaste prijs.',
        note: todo('op welke dagen geldt het dagmenu?'),
        items: [
          { name: 'Dagmenu shoarma', price: 16.0 },
          { name: 'Dagmenu kipdöner', price: 16.0 },
          { name: 'Dagmenu kalfsdöner', price: 16.0 },
        ],
      },
      {
        id: 'voorgerechten', name: 'Voorgerechten', blurb: 'Om mee te beginnen of te delen.',
        items: [
          { name: 'Sigara börek', price: 6.5 },
          { name: 'Loempia', price: 6.5 },
          { name: 'Tonijnsalade', price: null },
          { name: 'Appel-komkommer salade', price: null, veg: true, url: p('appel-komkommer-salade') },
        ],
      },
      {
        id: 'pizza', name: 'Pizza’s', blurb: 'Uit de oven, met tomatensaus en kaas.',
        items: [
          { name: 'Pizza Camel', price: 15.5, url: p('pizza-camel') },
          { name: 'Pizza margherita', desc: 'Tomatensaus en kaas.', price: 12.0, veg: true },
          { name: 'Pizza salami kalkoen', desc: 'Tomatensaus, kaas en kalkoensalami.', price: 13.5 },
          { name: 'Pizza tonno', desc: 'Tomatensaus, kaas, tonijn en ui.', price: 15.5 },
          { name: 'Pizza shoarma', price: 18.0 },
          { name: 'Calzone mix shoarma, döner en kipdöner', desc: 'Tomatensaus, kaas, shoarma, döner, kipdöner, ui, paprika en champignons.', price: null, url: p('calzone-mix-shoarma-doner-en-kipdoner') },
        ],
      },
      {
        id: 'schotels', name: 'Schotels', blurb: 'Een complete maaltijd op een bord.',
        items: [
          { name: 'Shoarma schotel', price: 20.5, url: p('shoarma-schotel') },
          { name: 'Döner kebab schotel', price: 20.0, url: p('doner-kebab-schotel') },
          { name: 'Iskender kebab schotel', price: 22.5, url: p('iskender-kebab-schotel') },
          { name: 'Adana kebab schotel', price: 21.5, url: p('adana-kebab-schotel'), grill: true },
          { name: 'Köfte schotel', price: 23.0, grill: true },
          { name: 'Shish kebab schotel', price: 24.5, grill: true },
          { name: 'Shish kebab lamsbout vleesschotel', price: 21.0, url: p('shish-kebab-lamsbout-vleesschotel'), grill: true },
          { name: 'Lamskotelet-pirzola schotel', price: 25.0, url: p('pirzola-schotel'), grill: true },
          { name: 'Lamsreepjes schotel', price: 21.5, grill: true },
          { name: 'Kipfilet schotel', price: 21.5, grill: true },
          { name: 'Kipschnitzel schotel', price: 15.0 },
          { name: 'Falafel schotel', price: 21.0, veg: true },
        ],
      },
      {
        id: 'minischotels', name: 'Minischotels', blurb: 'Dezelfde smaak, kleinere portie.',
        items: [
          { name: 'Minischotel shoarma', price: 19.0 },
          { name: 'Minischotel döner kebab', price: 19.0 },
          { name: 'Minischotel kipdöner', price: 21.0 },
          { name: 'Minischotel kipfilet', price: 19.0 },
          { name: 'Minischotel lamsreepjes', price: 19.0 },
          { name: 'Minischotel falafel', price: 19.0, veg: true },
        ],
      },
      {
        id: 'mixgrill', name: 'Camel Mix Grill', blurb: 'Voor wie trek heeft in meer.',
        items: [
          { name: 'Camel mix grill schotel', desc: 'Met lamsbout, kipfilet en rundergehakt.', price: 28.0, grill: true },
          { name: 'Camel mix grill schotel speciaal', price: 30.0, grill: true },
          { name: 'Camel mix grill voor twee personen', price: 59.0, grill: true },
        ],
      },
      {
        id: 'extras', name: 'Extra’s', blurb: 'Sauzen, brood en bijgerechten.',
        items: [
          { name: 'Loempia, 6 stuks', price: 9.5, url: p('loempia-6-stuks') },
          { name: 'Gebakken aardappels', price: 5.5 },
          { name: 'Rijst', price: null },
          { name: 'Turks brood', price: null },
          { name: 'Pita', price: null },
          { name: 'Haydari', price: null },
          { name: 'Sauzen', desc: 'Keuze uit diverse sauzen, o.a. mayonaise.', price: null },
        ],
      },
      {
        id: 'kindermenu', name: 'Kindermenu’s', blurb: 'Voor de kleine trek.',
        items: [
          { name: 'Kindermenu hamburger', price: 9.5 },
          { name: 'Kindermenu kipnuggets', price: 9.5 },
          { name: 'Kindermenu bitterballen', price: 9.5 },
        ],
      },
      {
        id: 'tosti', name: 'Tosti’s', blurb: 'Warm en knapperig.',
        items: [
          { name: 'Tosti kaas', price: 4.5, veg: true },
          { name: 'Tosti sucuk', price: 7.0 },
        ],
      },
      {
        id: 'ijs', name: 'IJs & desserts', blurb: 'Pints om mee te nemen.',
        items: [
          { name: 'Magnum pints 440 ml', desc: 'Diverse smaken, o.a. White Chocolate & Cookies.', price: 10.0, url: p('magnum-white-chocolate-cookies-440-ml') },
          { name: 'Ben & Jerry’s 465 ml', desc: 'Diverse smaken, o.a. Chunky Monkey.', price: 10.0, url: p('ben-jerrys-chunky-monkey-465ml') },
        ],
      },
      {
        id: 'dranken', name: 'Dranken', blurb: 'Het actuele drankenaanbod zie je in de webshop.',
        photo: 'koeling',
        items: [],
      },
    ],
  },

  // Favorieten op de homepage. Bewust GEEN "bestseller"-labels: daar is geen
  // bewijs voor. Selectie = herkenbare categorieën uit de briefing.
  favorites: [
    { cat: 'kapsalon', item: 'Kapsalon döner', kicker: 'Normaal · Groot · XXL' },
    { cat: 'broodjes', item: 'Broodje shoarma', kicker: 'Ook met kaas of groot' },
    { cat: 'durum', item: 'Dürüm Camel', kicker: 'Huisvariant' },
    { cat: 'pizza', item: 'Pizza Camel', kicker: 'Uit de oven' },
    { cat: 'mixgrill', item: 'Camel mix grill schotel', kicker: 'Van de grill' },
    { cat: 'donerbox', item: 'Dönerbox döner', kicker: 'Snel & compleet' },
  ],

  faq: [
    ['Hoe kan ik online bestellen?',
      'Klik op “Bestel nu”. Je gaat naar de webshop van Camel (grillroomcamel.com). Daar kies je je gerecht en eventuele opties, leg je het in je winkelwagen en rond je de bestelling af.'],
    ['Kan ik mijn bestelling afhalen?', 'order.pickup'],
    ['Is bezorgen beschikbaar?', 'order.delivery'],
    ['Wat zijn de openingstijden?', 'hours'],
    ['Waar is Camel gevestigd?', 'Aan de Oude Markt 9A in het centrum van Enschede (7511 GA).'],
    ['Welke betaalmethoden worden geaccepteerd?', 'order.payment'],
    ['Kan ik sauzen of extra ingrediënten toevoegen?',
      'De beschikbare opties, sauzen en extra’s kies je per gerecht in de webshop. Losse extra’s, zoals gebakken aardappels, Turks brood en sauzen, staan ook in de categorie Extra’s.'],
    ['Zijn er vegetarische opties?',
      'Op de menukaart staan onder meer gerechten met falafel (broodje, dürüm, kapsalon en schotel), pizza margherita en tosti kaas. Ze zijn op de menukaart gemarkeerd met “vega”. Twijfel je over de bereiding? Bel dan even.'],
    ['Welke allergenen bevatten de gerechten?',
      'Allergeneninformatie staat (nog) niet online. Heb je een allergie of dieetwens? Bel ons op 053 432 4663 vóór je bestelt, dan vertellen we je precies wat erin zit.'],
    ['Kan ik ook alleen iets komen drinken?', 'Zeker. Ook als je alleen een glaasje wilt drinken, ben je van harte welkom aan de Oude Markt.'],
    ['Hoe kan ik contact opnemen?', 'Bel ons op 053 432 4663 of kom langs aan de Oude Markt 9A.'],
  ],
};
