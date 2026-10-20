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

import { todo, isTodo, SHOP, p } from './util.mjs';
import { menu } from './menu.mjs';

export { todo, isTodo };

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
  // grillroomcamel.com. Bevestigd door de opdrachtgever (20 okt 2026). (productpagina's met opties → winkelwagen → afrekenen).
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

  // Echte foto's van de zaak (aangeleverd door de opdrachtgever, okt 2026).
  photos: {
    'doner-spies': 'Döner aan het spit voor de gloeiende branders in de keuken van Camel',
    gevel: 'De gevel van Grillroom Camel aan de Oude Markt, met het terras en een pizzabord',
    'terras-kerk': 'Uitzicht vanaf het terras van Camel over de Oude Markt naar de Grote Kerk',
    'pizza-oven': 'De dubbele pizzaoven met stapels pizzadozen erboven',
    keuken: 'De kooklijn met grillplaat, frituur, salamandergrill en het döner-spit',
    werkbank: 'De werkbank met verse rode kool, sla, geraspte kaas en pizzadeeg',
    grill: 'De gloeiende salamandergrill in de keuken van Camel',
    ingang: 'De ingang van Camel, met het kameellogo en Since 1990 op het glas',
    terras: 'Witte tafels en zwarte stoelen onder de parasols op het terras',
    'terras-bord': 'Het terras met een bord voor dürüm adana en broodje köfte',
    bar: 'De bar van Camel met flessen, rood ledlicht en foodpanelen boven de toonbank',
    'interieur-wand': 'Turkse sierborden en een Cappadocië-poster aan de wand bij Camel',
    koeling: 'Koelkast met frisdranken naast de bar van Camel',
  },

  // Over ons. De foto van de eigenaar is aangeleverd door de opdrachtgever.
  // "Since 1990" staat op het raam bij de ingang (foto 'ingang').
  owner: {
    photo: 'eigenaar',
    name: todo('naam van de eigenaar'),
    since: '1990',
  },

  // De keuken: alleen wat op de foto's te zien is.
  kitchen: [
    { photo: 'keuken', title: 'De kooklijn', text: 'Grillplaat, frituur, salamandergrill en het spit staan op één lijn. Zo gaat je bestelling in één beweging van vuur naar bord.' },
    { photo: 'pizza-oven', title: 'De pizzaoven', text: 'Twee ovens boven elkaar, met de pizzadozen al klaar erboven.' },
    { photo: 'werkbank', title: 'De werkbank', text: 'Rode kool, sla en geraspte kaas liggen gekoeld klaar, naast het deeg voor pizza en lahmacun.' },
    { photo: 'doner-spies', title: 'Het spit', text: 'De döner draait langzaam voor de gloeiende branders.' },
  ],

  logo: todo('officieel Camel-logo (nu een tekstlogo)'),

  // Eigen tekst van grillroomcamel.nl (aangeleverd door de klant), licht ingekort.
  about: [
    'Camel Middle East Grill House is een gezellige grillroom in het centrum van Enschede, aan de Oude Markt. Bij Camel kun je in een ontspannen sfeer terecht voor een ouderwets lekker broodje shoarma, of voor een (mini)schotel met döner kebab, kipdöner, lamsreepjes of falafel.',
    'Voor de jongere eters staan er diverse kindermenu’s op de kaart. En wil je alleen een glaasje drinken? Ook dan ben je van harte welkom. Of je nu met je gezin komt eten of na het uitgaan nog trek hebt: dankzij de zeer ruime openingstijden houden we met iedereen rekening.',
  ],
  // Gastreactie zoals die op grillroomcamel.nl staat. Geen sterren, geen
  // aggregate rating: alleen deze ene, letterlijk overgenomen reactie.
  review: { text: 'Wij vonden het magnifique. Gerechten waren overheerlijk en een lust voor het oog. Personeel heel professioneel en zeer vriendelijk. We zullen zeker ons nog een keer laten verwennen.', author: 'M.', source: 'grillroomcamel.nl' },

  menu,

  // Favorieten op de homepage. Bewust GEEN "bestseller"-labels: daar is geen
  // bewijs voor. Selectie = herkenbare categorieën uit de briefing.
  favorites: [
    { cat: 'kapsalon', item: 'Kapsalon shoarma', kicker: 'Normaal · Groot · XXL' },
    { cat: 'broodjes', item: 'Broodje shoarma', kicker: 'Ook met kaas of aardappels' },
    { cat: 'durum', item: 'Dürüm camel', kicker: 'Huisvariant' },
    { cat: 'pizza', item: 'Pizza Camel', kicker: 'Uit de oven' },
    { cat: 'grill', item: 'Camel mix grill schotel', kicker: 'Van de grill' },
    { cat: 'donerbox', item: 'Dönerbox', kicker: 'Snel & compleet' },
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
      'Ja. Op de menukaart staan onder meer falafel (broodje, dürüm, kapsalon, minischotel en schotel), dürüm gezond, pizza Margherita, funghi en vegetaria, lahmacun kaas en groenten, salades en tosti kaas. Ze zijn op de menukaart gemarkeerd met “vega”. Twijfel je over de bereiding? Bel dan even.'],
    ['Welke allergenen bevatten de gerechten?',
      'Allergeneninformatie staat (nog) niet online. Heb je een allergie of dieetwens? Bel ons op 053 432 4663 vóór je bestelt, dan vertellen we je precies wat erin zit.'],
    ['Kan ik ook alleen iets komen drinken?', 'Zeker. Ook als je alleen een glaasje wilt drinken, ben je van harte welkom aan de Oude Markt.'],
    ['Hoe kan ik contact opnemen?', 'Bel ons op 053 432 4663 of kom langs aan de Oude Markt 9A.'],
  ],
};
