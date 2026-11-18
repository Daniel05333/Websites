// Feestje te Huur: alle inhoud en gegevens op één plek.
// Bron: Instagram @feestjetehuur (profiel, posts, highlights) en het
// WhatsApp Business-profiel, zie bron/.
//
// Dit is een CONCEPT. Onbevestigde waarden staan als todo('…') en verschijnen
// op de site als "op aanvraag". Zolang draft: true staat krijgt de site
// noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Feestje te Huur',
  city: 'Enschede',
  url: todo('domeinnaam'),

  contact: {
    instagram: 'feestjetehuur',
    phone: '06 45883292',
    whatsapp: '31645883292', // WhatsApp Business
    address: todo('adres van de feestlocatie'),
    hours: 'Alleen op afspraak',
  },

  // Feestconcepten op de eigen locatie (uit de posts en highlights).
  parties: [
    { id: 'princess', name: 'Princess Glam Party', img: 'princess-glam', tag: 'Glitter & Glam', desc: 'Jurken, kroontjes, een spiegel vol lampjes en een glitterwand. Je kleine prinses staat even helemaal in de spotlight.', price: todo('prijs princess') },
    { id: 'slime', name: 'Slime Party', img: 'slime-party', tag: 'Zelf maken', desc: 'Schortjes aan en mengen maar: de kinderen maken hun eigen slime met kleuren en glitters, en nemen het mee naar huis.', price: todo('prijs slime') },
    { id: 'squishy', name: 'Squishy Party', img: 'squishy-party', tag: 'Zelf maken', desc: 'Zachte, glinsterende squishies om zelf te maken en te versieren. Knijpen, kneden en lachen.', price: todo('prijs squishy') },
    { id: 'tinsel', name: 'Hair Tinsel Experience', img: 'hair-tinsel', tag: 'Glitter & Glam', desc: 'Glinsterende strengen in alle kleuren van de regenboog, voorzichtig in het haar gezet.', price: todo('prijs hair tinsel') },
    { id: 'cake', name: 'Cake Bar Experience', img: 'cake-bar-experience', tag: 'Sweet moments', desc: 'Zelf je cake versieren met slagroom, sauzen en toppings naar keuze.', price: todo('prijs cake bar experience') },
  ],

  // Te huur: voor een feest thuis, op het werk of elders.
  rentals: [
    { name: 'Candy Bar', img: 'candy-bar', desc: 'Een witte bar vol snoep en toppings, compleet aangekleed.' },
    { name: 'Cake Bar', img: 'locatie-cake-bar', desc: 'Cakejes, sauzen en toppings: iedereen maakt zijn eigen dessert.' },
    { name: 'Popcornkar', img: 'popcornkar', desc: 'Een klassieke popcornkar voor de echte feestgeur.' },
    { name: 'Aankleding', img: 'hair-tinsel-aanbrengen', desc: 'Glitterwanden, parasol, styling en alles wat een feest af maakt.' },
  ],

  steps: [
    { t: 'Kies je feestje', d: 'Princess Glam, Slime, Squishy of een sweet bar: kies wat bij jouw kind past.' },
    { t: 'Vraag een datum aan', d: 'Stuur je wensen via het formulier. We reageren via WhatsApp.' },
    { t: 'Party prep', d: 'Wij bereiden alles voor en kleden de locatie feestelijk aan.' },
    { t: 'Feest!', d: 'Jullie genieten, wij zorgen voor de rest.' },
  ],

  occasions: ['Kinderfeestjes', 'Bedrijfsfeesten', 'Speciale gelegenheden'],
};
