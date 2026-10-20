// ─────────────────────────────────────────────────────────────────────────────
// MENUKAART — het enige bestand dat je hoeft aan te passen voor gerechten en prijzen.
//
// STATUS: voorlopig. Deze gegevens komen uit de zoekindex van grillroomcamel.com
// en worden vervangen door de menukaart die de eigenaar aanlevert. Zet daarna
// `pricesVerified: true`.
//
// Per gerecht:
//   { name: 'Broodje shoarma', price: 12.0 }                      vaste prijs
//   { name: 'Kapsalon döner', sizes: [14.0, 17.5, 21.0] }         prijs per formaat
//   desc: 'Met …'       korte beschrijving (alleen bevestigde ingrediënten)
//   veg: true           label "vega"
//   grill: true         komt ook in de grillsectie op de homepage
//   url: p('slug')      directe link naar het gerecht in de webshop
//   price: null         prijs onbekend → "prijs in webshop"
// ─────────────────────────────────────────────────────────────────────────────
import { todo, SHOP, p } from './util.mjs';

export const menu = {
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
};
