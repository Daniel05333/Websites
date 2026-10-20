// ─────────────────────────────────────────────────────────────────────────────
// MENUKAART — het enige bestand dat je hoeft aan te passen voor gerechten en prijzen.
//
// Bron: menukaart aangeleverd door de eigenaar, 20 oktober 2026.
//
// Per gerecht:
//   { name: 'Broodje falafel', price: 9.5 }                       vaste prijs
//   from: true          "vanaf"-prijs (opties of extra's in de webshop)
//   sizes: [14, 17.5, 21]   prijs per formaat (labels: categorie.sizes of item.sizeLabels)
//   desc: 'Met …'       korte beschrijving
//   veg: true           label "vega"
//   adult: true         label "18+"
//   grill: true         komt ook in de grillsectie op de homepage
//   url: p('slug')      directe link naar het gerecht in de webshop
//   price: null         prijs onbekend → "prijs in webshop"
// ─────────────────────────────────────────────────────────────────────────────
import { SHOP, p } from './util.mjs';

export const menu = {
  pricesVerified: true,
  source: 'menukaart van de eigenaar, 20 oktober 2026',
  categories: [
    {
      id: 'combi', name: 'Combi meals', blurb: 'Een maaltijd en een bakje Ben & Jerry’s in één.',
      items: [
        { name: 'Pizza Margherita met Ben & Jerry’s 100 ml', price: 15.5 },
        { name: 'Kapsalon shoarma met Ben & Jerry’s 100 ml', price: 18.0 },
      ],
    },
    {
      id: 'broodjes', name: 'Broodjes', blurb: 'Shoarma, döner, kip, lam, falafel en burgers.',
      items: [
        { name: 'Broodje shoarma', price: 11.5, from: true, desc: 'Gegrild varkensvlees van de spies.' },
        { name: 'Broodje shoarma met kaas', price: 12.0, from: true },
        { name: 'Broodje shoarma met aardappels', price: 17.0, from: true, desc: 'Met gebakken aardappels.' },
        { name: 'Broodje döner kebab', price: 10.0, from: true, desc: 'Kalfsvlees.' },
        { name: 'Broodje kipdöner', price: 10.0, from: true },
        { name: 'Broodje lamsreepjes', price: 11.5, from: true },
        { name: 'Broodje kipfilet', price: 11.5, from: true },
        { name: 'Broodje falafel', price: 9.5, veg: true },
        { name: 'Broodje hamburger', price: 7.5 },
        { name: 'Broodje cheeseburger', price: 8.0 },
        { name: 'Broodje Hawaïburger', price: 9.0 },
      ],
    },
    {
      id: 'durum', name: 'Dürüm', blurb: 'Opgerold in dun brood.',
      items: [
        { name: 'Dürüm camel', price: 11.0, desc: 'Met gebakken aardappelen, döner en salade.' },
        { name: 'Dürüm döner', price: 10.5 },
        { name: 'Dürüm kipdöner', price: 10.5 },
        { name: 'Dürüm shoarma', price: 10.5, url: p('durum-shoarma') },
        { name: 'Dürüm gezond', price: 10.0, desc: 'Sla, komkommer, ui, tomaat en fetakaas.', veg: true },
        { name: 'Dürüm falafel', price: 10.0, veg: true, url: p('durum-falafel') },
      ],
    },
    {
      id: 'kapsalon', name: 'Kapsalon', blurb: 'Met gebakken aardappelen, salade en gesmolten kaas.',
      url: `${SHOP}/product-category/met-gebakken-aardappels-salade-en-gesmolten-kaas/`,
      sizes: ['Normaal', 'Groot', 'XXL'],
      from: true,
      items: [
        { name: 'Kapsalon shoarma', sizes: [14.0, 17.5, 21.0], url: p('kapsalon-shoarma-groot') },
        { name: 'Kapsalon döner', sizes: [14.0, 17.5, 21.0], url: p('kapsalon-doner-xxl') },
        { name: 'Kapsalon kipdöner', sizes: [14.0, 17.5, 21.0] },
        { name: 'Kapsalon lamsreepjes', sizes: [14.5, 18.0, 21.5], url: p('kapsalon-lamsreepjes-xxl') },
        { name: 'Kapsalon kipfilet', sizes: [14.5, 18.0, 21.5], url: p('kapsalon-kipfilet-xxl') },
        { name: 'Kapsalon mix shoarma met kip', sizes: [14.5, 18.0, 21.5], url: p('kapsalon-mix-shoarma-met-kip-xxl') },
        { name: 'Kapsalon falafel', sizes: [14.0, 17.5, 21.0], sizeLabels: ['Klein', 'Groot', 'XXL'], veg: true, url: p('kapsalon-falafel-groot') },
      ],
    },
    {
      id: 'donerbox', name: 'Dönerbox', blurb: 'Vlees met gebakken aardappelen en sla in een box.',
      items: [
        { name: 'Dönerbox', price: 9.5, from: true },
        { name: 'Dönerbox shoarma', price: 9.5, from: true, url: p('donerbox-shoarma') },
        { name: 'Dönerbox kipdöner', price: 9.5, from: true },
      ],
    },
    {
      id: 'grill', name: 'Grillgerechten', blurb: 'Van de grill, als schotel of in brood.',
      items: [
        { name: 'Camel mix grill schotel', price: 28.0, desc: 'Lamsbout, kipfilet en rundergehakt.', grill: true },
        { name: 'Camel mix grill schotel speciaal', price: 30.0, desc: 'Lamsbout, kipfilet, rundergehakt en shoarma.', grill: true },
        { name: 'Camel mix grill schotel speciaal voor twee', price: 59.5, grill: true },
        { name: 'Adana kebab schotel', price: 22.5, desc: 'Rundergehakt.', url: p('adana-kebab-schotel'), grill: true },
        { name: 'Shish kebab schotel', price: 24.0, desc: 'Lamsbout.', url: p('shish-kebab-lamsbout-vleesschotel'), grill: true },
        { name: 'Köfte schotel', price: 22.5, desc: 'Gekruid rundergehakt.', grill: true },
        { name: 'Beyti schotel', price: 23.0, desc: 'Gekruid rundergehakt opgerold in bladerdeeg, met knoflook, yoghurt en tomatensaus.', grill: true },
        { name: 'Pirzola schotel', price: 25.5, desc: 'Nieuw-Zeelandse lamskoteletten in huisgemaakte marinade.', url: p('pirzola-schotel'), grill: true },
        { name: 'Biefstuk schotel', price: 24.0, grill: true },
        { name: 'Spareribs schotel', price: 22.0, grill: true },
        { name: 'Kippenvleugels schotel', price: 19.5, grill: true },
        { name: 'Saté schotel', price: 19.5, desc: 'Varkensvlees.', grill: true },
        { name: 'Dürüm adana', price: 10.5 },
        { name: 'Broodje köfte', price: 10.0 },
      ],
    },
    {
      id: 'lahmacun', name: 'Lahmacun', blurb: 'Dunne Turkse pizza, ook met beleg.',
      items: [
        { name: 'Lahmacun naturel', price: 7.0, desc: 'Met salade.' },
        { name: 'Lahmacun kaas en groenten', price: 8.5, veg: true, url: p('lahmacun-kaas-en-groenten') },
        { name: 'Lahmacun ham en kaas', price: 9.0 },
        { name: 'Lahmacun ham, kaas en ananas', price: 9.5 },
        { name: 'Lahmacun shoarma', price: 13.0 },
        { name: 'Lahmacun kipdöner', price: 13.0 },
        { name: 'Lahmacun döner', price: 13.0 },
        { name: 'Lahmacun kaas, ui en tonijn', price: 13.5 },
        { name: 'Lahmacun adana', price: 13.5 },
      ],
    },
    {
      id: 'schotels', name: 'Schotels', blurb: 'Met salade en gebakken aardappels of rijst.',
      items: [
        { name: 'Shoarma schotel', price: 21.0, from: true, url: p('shoarma-schotel') },
        { name: 'Döner kebab schotel', price: 21.0, from: true, desc: 'Kalfsvlees.', url: p('doner-kebab-schotel') },
        { name: 'Kipdöner schotel', price: 21.0, from: true },
        { name: 'Iskender kebab schotel', price: 22.0, from: true, url: p('iskender-kebab-schotel') },
        { name: 'Kipfilet schotel', price: 21.0 },
        { name: 'Lams kalkoen reepjes schotel', price: 21.5, from: true },
        { name: 'Kipschnitzel schotel', price: 16.0, from: true },
        { name: 'Varkensschnitzel schotel', price: 16.0, from: true },
        { name: 'Falafel schotel', price: 20.5, from: true, veg: true },
      ],
    },
    {
      id: 'minischotels', name: 'Minischotels', blurb: 'Met salade en gebakken aardappels of rijst.',
      items: [
        { name: 'Minischotel shoarma', price: 19.0, from: true },
        { name: 'Minischotel döner kebab', price: 19.0, from: true },
        { name: 'Minischotel kipdöner', price: 19.0, from: true },
        { name: 'Minischotel falafel', price: 19.0, from: true, veg: true },
        { name: 'Minischotel kipfilet', price: 19.5, from: true },
        { name: 'Minischotel lamsreepjes', price: 19.5, from: true },
      ],
    },
    {
      id: 'pizza', name: 'Pizza’s', blurb: 'Uit de oven, met tomatensaus en kaas.',
      items: [
        { name: 'Pizza Margherita', price: 12.0, desc: 'Tomatensaus en kaas.', veg: true },
        { name: 'Pizza funghi', price: 13.5, desc: 'Tomatensaus, champignons en kaas.', veg: true },
        { name: 'Pizza mozzarella', price: 13.5, desc: 'Tomatensaus, kaas en mozzarella.', veg: true },
        { name: 'Pizza salami kalkoen', price: 13.5, desc: 'Tomatensaus, kaas en salami.' },
        { name: 'Pizza ham', price: 14.0, desc: 'Tomatensaus, kaas en ham.' },
        { name: 'Pizza Hawaï', price: 15.0, desc: 'Tomatensaus, kaas, ham en ananas.' },
        { name: 'Pizza vulcano', price: 15.0, desc: 'Tomatensaus, kaas, champignons en ham.' },
        { name: 'Pizza Camel', price: 15.5, desc: 'Tomatensaus, kaas en Turkse worst.', url: p('pizza-camel') },
        { name: 'Pizza tonno', price: 16.0, desc: 'Tomatensaus, kaas, tonijn en ui.' },
        { name: 'Pizza vegetaria', price: 16.5, desc: 'Tomatensaus, kaas, paprika, champignons en ui.', veg: true },
        { name: 'Pizza montana', price: 16.5, desc: 'Tomatensaus, kaas, ham, salami en spek.' },
        { name: 'Pizza quattro stagioni', price: 16.5, desc: 'Tomatensaus, kaas, ham, salami, paprika en champignons.' },
        { name: 'Pizza sardegnola', price: 16.5, desc: 'Tomatensaus, kaas, champignons, salami, paprika, olijven en uien.' },
        { name: 'Pizza carbonara', price: 16.5, desc: 'Tomatensaus, kaas, salami, spek, uien, ei en ham.' },
        { name: 'Pizza kipdöner', price: 18.0, desc: 'Tomatensaus, kaas en kipdöner.' },
        { name: 'Pizza döner', price: 18.5, desc: 'Tomatensaus, kaas en döner.' },
        { name: 'Pizza shoarma', price: 18.5, desc: 'Tomatensaus, kaas en shoarma.' },
        { name: 'Pizza pollo', price: 19.0, desc: 'Tomatensaus, kaas, kipfilet, ui en paprika.' },
        { name: 'Calzone', price: 19.75, desc: 'Tomatensaus, kaas, salami, ham, champignons en paprika.' },
        { name: 'Calzone shoarma', price: 19.75, desc: 'Tomatensaus, kaas, shoarma, ui, paprika en champignons.' },
        { name: 'Calzone döner', price: 19.75, desc: 'Tomatensaus, kaas, döner, ui, paprika en champignons.' },
        { name: 'Calzone kipdöner', price: 19.75, desc: 'Tomatensaus, kaas, kipdöner, ui, paprika en champignons.' },
        { name: 'Calzone mix shoarma, döner en kipdöner', price: 22.5, url: p('calzone-mix-shoarma-doner-en-kipdoner') },
      ],
    },
    {
      id: 'voorgerechten', name: 'Voorgerechten', blurb: 'Salades en iets om mee te beginnen.',
      items: [
        { name: 'Stokbrood met kruidenboter', price: 5.5, veg: true },
        { name: 'Appel-komkommer salade', price: 6.5, veg: true, url: p('appel-komkommer-salade') },
        { name: 'Coban salade', price: 7.5, desc: 'Sla, komkommer, ui, paprika en tomaat.', veg: true },
        { name: 'Camel salade', price: 8.5, desc: 'Sla, komkommer, ui, paprika, tomaat, feta en olijven.', veg: true },
        { name: 'Tonijnsalade', price: 9.0, desc: 'Sla, komkommer, ui, paprika, tomaat en tonijn.' },
        { name: 'Sigara börek', price: 7.0, from: true },
        { name: 'Loempia', price: 7.0, from: true },
      ],
    },
    {
      id: 'tosti', name: 'Tosti’s', blurb: 'Warm en knapperig.',
      items: [
        { name: 'Tosti kaas', price: 4.5, veg: true },
        { name: 'Tosti ham en kaas', price: 5.5 },
        { name: 'Tosti salami en kaas', price: 5.5 },
        { name: 'Tosti gezond', price: 6.5, desc: 'Met kaas en groenten.', veg: true },
        { name: 'Tosti Hawaii', price: 6.5 },
        { name: 'Tosti sucuk', price: 7.5 },
      ],
    },
    {
      id: 'kindermenu', name: 'Kindermenu’s', blurb: 'Met gebakken aardappelen en salade.',
      items: [
        { name: 'Kindermenu hamburger', price: 9.5 },
        { name: 'Kindermenu kipnuggets', price: 9.5 },
        { name: 'Kindermenu bitterballen', price: 9.5 },
      ],
    },
    {
      id: 'extras', name: 'Extra’s', blurb: 'Brood, sauzen, bijgerechten en iets zoets.',
      items: [
        { name: 'Pitabroodje', price: 1.5 },
        { name: 'Turks brood', price: 2.0 },
        { name: 'Rijst', price: 6.0 },
        { name: 'Gebakken aardappelen', price: 6.0 },
        { name: 'Mayonaise', price: 1.5 },
        { name: 'Ketchup', price: 1.5 },
        { name: 'Knoflooksaus', price: 1.5 },
        { name: 'Whiskeysaus', price: 1.5 },
        { name: 'Tomaat-uiensaus', price: 1.5, desc: 'Pittig.' },
        { name: 'Huisgemaakte sambal', price: 2.0 },
        { name: 'Haydarisaus (200 cc)', price: 3.0, desc: 'Yoghurt met knoflook.' },
        { name: 'Baklava (4 stuks)', price: 6.5 },
        { name: 'Sigara börek, 6 stuks', price: 9.5 },
        { name: 'Loempia, 6 stuks', price: 9.5, url: p('loempia-6-stuks') },
      ],
    },
    {
      id: 'dranken', name: 'Dranken', blurb: 'Frisdrank, sap en meer uit de koeling.',
      note: 'Alcohol verkopen we alleen aan klanten van 18 jaar en ouder.',
      items: [
        { name: 'Coca-Cola 330 ml', price: 3.5 },
        { name: 'Coca-Cola 500 ml', price: 4.0 },
        { name: 'Coca-Cola light 330 ml', price: 3.5 },
        { name: 'Coca-Cola Zero 330 ml', price: 3.5 },
        { name: 'Coca-Cola Zero 500 ml', price: 4.0 },
        { name: 'Fanta Orange 330 ml', price: 3.5 },
        { name: 'Fanta Exotic 330 ml', price: 3.5 },
        { name: 'Fanta Cassis 330 ml', price: 3.5 },
        { name: 'Sprite Zero 330 ml', price: 3.5 },
        { name: 'Ayran', price: 2.5 },
        { name: 'Spa Blauw', price: 3.15 },
        { name: 'Appelsap', price: 3.5 },
        { name: 'AA Drink', price: 3.5 },
        { name: 'Chocomel', price: 3.5 },
        { name: 'Fristi', price: 3.5 },
        { name: 'Lipton 330 ml', desc: 'Ice Tea, Green of Peach.', price: 3.5 },
        { name: 'Fuze Tea 400 ml', desc: 'Green Tea, Sparkling Lemon, Mango of Peach Hibiscus.', price: 3.5 },
        { name: 'Red Bull 250 ml', price: 3.5 },
        { name: 'Fernandes 330 ml', desc: 'Green Punch of Cherry Bouquet.', price: 3.5 },
        { name: 'Bacardi cola', price: 5.5, adult: true },
        { name: 'Zoete witte wijn', price: 15.0, adult: true },
        { name: 'Droge rode wijn', price: 15.0, adult: true },
        { name: 'Rosé wijn', price: 15.0, adult: true },
      ],
    },
    {
      id: 'bier', name: 'Bier', blurb: 'Koud uit de koeling.',
      note: 'Alleen voor klanten van 18 jaar en ouder.',
      items: [
        { name: 'Heineken 330 ml', price: 3.5, adult: true },
        { name: 'Affligem Blond 330 ml', price: 3.5, adult: true },
        { name: 'Grolsch 330 ml', price: 3.5, adult: true },
        { name: '6-pack Grolsch', price: 18.5, adult: true },
      ],
    },
    {
      id: 'ijs', name: 'IJs', blurb: 'Ben & Jerry’s en Magnum, om mee te nemen.',
      items: [
        { name: 'Ben & Jerry’s 100 ml', desc: 'Cookie Dough, Strawberry Cheesecake, Caramel Chew Chew of Chocolate Fudge Brownie.', price: 4.5 },
        { name: 'Ben & Jerry’s 465 ml', desc: 'Cookie Dough, Strawberry Cheesecake, Chunky Monkey of Caramel Chew Chew.', price: 10.0 },
        { name: 'Magnum pints 440 ml', desc: 'Double Gold Caramel Billionaire, White Chocolate & Cookies of Double Sea Salt Caramel.', price: 9.5 },
      ],
    },
  ],
};
