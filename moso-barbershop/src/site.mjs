// Alle inhoud en bedrijfsgegevens van de site. Bron: het Instagram-profiel en de
// highlights van @mosobarbershop (screenshots in bron/). Onbevestigde waarden staan
// als todo('…') en worden op de site zichtbaar als placeholder gemarkeerd.

export const todo = (label) => ({ todo: true, label });
export const isTodo = (x) => !!(x && typeof x === 'object' && x.todo);

export const site = {
  name: 'Moso Barbershop',
  lang: 'nl',
  draft: true, // true = noindex + robots blokkeert alles + geen structured data
  url: todo('domeinnaam'),
  tagline: ['Look good', 'Feel good'], // van de eigen prijslijst
  focus: ['Fades', 'Cuts', 'Clean styles'], // uit de bio

  location: {
    street: 'Utrechtstraat 114',
    postalCode: '2408 GW',
    city: 'Alphen aan den Rijn',
    country: 'NL',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Utrechtstraat+114%2C+2408+GW+Alphen+aan+den+Rijn',
    parking: null, // bijv. 'Gratis parkeren voor de deur'
  },

  contact: {
    phone: '06 41576076',
    phoneHref: 'tel:+31641576076',
    instagram: 'https://www.instagram.com/mosobarbershop/',
    handle: 'mosobarbershop',
    dm: 'https://ig.me/m/mosobarbershop',
    whatsapp: null, // bijv. '31641576076' — alleen invullen als dit nummer WhatsApp gebruikt
    email: null,
  },

  // Bio: "Met & zonder afspraak".
  walkIn: true,
  // Aanvraagformulier. Zonder endpoint wordt er niets verstuurd: de bezoeker belt of
  // stuurt het klaargezette bericht zelf. Met endpoint wordt het als JSON gePOST.
  form: { endpoint: null },
  booking: { url: null }, // online agenda (Salonized, Treatwell…) — dan gaan alle knoppen daarheen

  // Openingstijden (highlight "Opening T", 29 juni 2026). 0 = zondag.
  hours: [
    { day: 'Maandag', d: 1, open: ['12:00', '18:00'] },
    { day: 'Dinsdag', d: 2, open: ['09:00', '18:00'] },
    { day: 'Woensdag', d: 3, open: ['09:00', '18:00'] },
    { day: 'Donderdag', d: 4, open: ['09:00', '18:00'] },
    { day: 'Vrijdag', d: 5, open: ['09:00', '20:00'] },
    { day: 'Zaterdag', d: 6, open: ['09:00', '18:00'] },
    { day: 'Zondag', d: 0, open: null },
  ],

  // Prijslijst (highlight "Prijzen", 29 juni 2026). Duur staat niet op de lijst.
  services: [
    { id: 'knippen', name: 'Haar knippen', price: 20, icon: 'scissors', text: 'Fade, taper, crop of klassiek: strak afgewerkt en op maat gestyled.' },
    { id: 'haar-baard', name: 'Haar en baard', price: 28, icon: 'combo', text: 'Je cut en je baard in één afspraak, met strakke lijnen en een vloeiende overgang.' },
    { id: 'kinderen', name: 'Kinderen', note: 'tot 10 jaar', price: 17, icon: 'kid', text: 'Een frisse coupe voor de kleinste klanten.' },
    { id: 'baard', name: 'Baard trimmen', price: 15, icon: 'beard', text: 'Baard in model, contouren scherp gezet.' },
    { id: 'wassen', name: 'Wassen', price: 5, icon: 'drop', text: 'Extra bij je behandeling.', addOn: true },
  ],

  // Galerij: eigen werk, zoals gepost op Instagram.
  cuts: [
    { src: 'cut-crop-fade', title: 'Crop fade', tag: 'Fade', w: 394, h: 525 },
    { src: 'cut-slickback-baard', title: 'Slick back & baard', tag: 'Haar en baard', w: 394, h: 442 },
    { src: 'cut-krullen-fade', title: 'Krullen met fade', tag: 'Fade', w: 394, h: 447 },
    { src: 'cut-zijscheiding', title: 'Fade met scheiding', tag: 'Fade', w: 394, h: 442 },
    { src: 'cut-taper-fringe', title: 'Taper met fringe', tag: 'Taper', w: 394, h: 357 },
    { src: 'cut-volle-baard', title: 'Fade & volle baard', tag: 'Haar en baard', w: 394, h: 422 },
    { src: 'cut-fade-baard', title: 'Fade & baardlijn', tag: 'Haar en baard', w: 394, h: 451 },
  ],

  followers: { count: '89', asOf: 'oktober 2026' },
  reviews: [], // { text, author, source } — alleen echte reviews, met toestemming
};
