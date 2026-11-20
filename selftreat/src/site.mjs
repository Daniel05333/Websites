// Selftreat.nl: alle inhoud en gegevens op één plek.
// Bron: Instagram @selftreat.nl (profiel, posts, highlights), zie bron/.
//
// Dit is een CONCEPT. De salons hieronder zijn VOORBEELDEN, gebaseerd op de
// post "Nieuwe salons aangesloten" (soort + plaats, zonder namen). Vervang ze
// door de echte aangesloten salons. Zolang draft: true staat krijgt de site
// noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Selftreat',
  domain: 'selftreat.nl',
  url: todo('https://selftreat.nl bevestigen'),
  contact: { instagram: 'selftreat.nl', email: todo('e-mailadres voor salons') },

  // De highlights tonen G, NB, NH, U en ZH; de overige provincies staan erbij
  // omdat er o.a. een spa in Drenthe is aangesloten.
  provinces: [
    { id: 'gld', code: 'G', name: 'Gelderland', color: 'mint' },
    { id: 'nb', code: 'NB', name: 'Noord-Brabant', color: 'lilac' },
    { id: 'nh', code: 'NH', name: 'Noord-Holland', color: 'mint' },
    { id: 'u', code: 'U', name: 'Utrecht', color: 'lime' },
    { id: 'zh', code: 'ZH', name: 'Zuid-Holland', color: 'pink' },
    { id: 'dr', code: 'DR', name: 'Drenthe', color: 'lilac' },
    { id: 'ov', code: 'OV', name: 'Overijssel', color: 'lime' },
    { id: 'gr', code: 'GR', name: 'Groningen', color: 'pink' },
    { id: 'fr', code: 'FR', name: 'Friesland', color: 'mint' },
    { id: 'fl', code: 'FL', name: 'Flevoland', color: 'lilac' },
    { id: 'li', code: 'LI', name: 'Limburg', color: 'lime' },
    { id: 'ze', code: 'ZE', name: 'Zeeland', color: 'pink' },
  ],

  categories: [
    { id: 'hair', name: 'Hair', img: 'salon-haar', items: ['Knippen', 'Kleuren', 'Styling'] },
    { id: 'nails', name: 'Nails', img: null, items: ['Gelnagels', 'Pedicure', 'Nail art'] },
    { id: 'lashes', name: 'Lashes & brows', img: 'lashes', items: ['Lash lift', 'Brow lamination', 'Wimperextensions'] },
    { id: 'skin', name: 'Skin', img: 'facial', items: ['Peeling', 'Hydratatie boost', 'Microneedling', 'Huidanalyse', 'Anti-aging'] },
    { id: 'body', name: 'Body', img: 'nieuwe-locatie', items: ['Massage', 'Spray tan', 'Body scrub', 'Ontharing'] },
    { id: 'pmu', name: 'PMU & make-up', img: 'make-up', items: ['Powderbrows', 'Make-up'] },
    { id: 'inject', name: 'Injectables', img: 'anti-aging', items: ['Consult injectables'] },
    { id: 'teeth', name: 'Tanden bleken', img: null, items: ['Tanden bleken'] },
  ],

  // Populair (uit de posts "4 populaire lentebehandelingen" en de lijsten).
  popular: ['Peeling', 'Hydratatie boost', 'Lash lift', 'Tanden bleken', 'Microneedling', 'Spray tan', 'Brow lamination', 'Massage', 'Body scrub'],

  // VOORBEELDSALONS — geen echte bedrijven.
  salons: [
    { id: 'kapper-eindhoven', type: 'Kapper', city: 'Eindhoven', prov: 'nb', cats: ['hair'], home: false, img: ['salon-haar', 'kapper', 'hair-styling'], treatments: ['Knippen', 'Kleuren', 'Styling'] },
    { id: 'spa-drenthe', type: 'Spa', city: 'Drenthe', prov: 'dr', cats: ['skin', 'body'], home: false, img: ['facial', 'nieuwe-locatie', 'anti-aging'], treatments: ['Massage', 'Body scrub', 'Peeling', 'Hydratatie boost'] },
    { id: 'masseur-apeldoorn', type: 'Masseur', city: 'Apeldoorn', prov: 'gld', cats: ['body'], home: true, img: ['nieuwe-locatie', 'facial'], treatments: ['Massage', 'Body scrub'] },
    { id: 'pmu-den-haag', type: 'PMU artist', city: 'Den Haag', prov: 'zh', cats: ['pmu', 'lashes'], home: false, img: ['make-up', 'lashes', 'brow-lamination'], treatments: ['Powderbrows', 'Brow lamination', 'Make-up'] },
    { id: 'nagelstylist-leiden', type: 'Nagelstylist', city: 'Leiden', prov: 'zh', cats: ['nails'], home: true, img: [], treatments: ['Gelnagels', 'Nail art', 'Pedicure'] },
    { id: 'lash-utrecht', type: 'Lash & brow studio', city: 'Utrecht', prov: 'u', cats: ['lashes'], home: false, img: ['lashes', 'brow-lamination'], treatments: ['Lash lift', 'Brow lamination', 'Wimperextensions'] },
    { id: 'skin-amsterdam', type: 'Huidkliniek', city: 'Amsterdam', prov: 'nh', cats: ['skin', 'inject'], home: false, img: ['anti-aging', 'facial'], treatments: ['Huidanalyse', 'Microneedling', 'Peeling', 'Consult injectables'] },
    { id: 'tan-arnhem', type: 'Spray tan & teeth', city: 'Arnhem', prov: 'gld', cats: ['body', 'teeth'], home: true, img: ['make-up'], treatments: ['Spray tan', 'Tanden bleken'] },
    { id: 'beauty-haarlem', type: 'Beautysalon', city: 'Haarlem', prov: 'nh', cats: ['skin', 'lashes', 'body'], home: false, img: ['facial', 'lashes', 'nieuwe-locatie'], treatments: ['Hydratatie boost', 'Lash lift', 'Ontharing'] },
  ],
};
