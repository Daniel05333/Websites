// Design Events | Event Mocktails: alle inhoud en gegevens op één plek.
// Bron: Instagram @designevents._ (profiel, posts en highlights), zie bron/.
//
// Dit is een CONCEPT. Onbevestigde waarden staan als todo('…') en verschijnen
// op de site als "op aanvraag". Zolang draft: true staat krijgt de site
// noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Design Events',
  tagline: 'Event Mocktails',
  city: 'Enschede',
  url: todo('domeinnaam'),

  contact: {
    instagram: 'designevents._',
    whatsapp: todo('WhatsApp-nummer'),
    email: todo('e-mailadres'),
  },

  // De opties uit de bio en de highlights.
  options: [
    {
      id: 'mocktail', name: 'Mocktail Table', img: 'cocktail-tafel', tag: 'Signature',
      desc: 'Een tafel vol alcoholvrije cocktails in kristal: kokos, passievrucht, rozen en rozemarijn. Op gelaagde acryl trappen, met karaffen vol fruit en kruiden.',
      points: ['Afgestemd op jullie kleuren', 'Kristallen karaffen en glaswerk', 'Gepersonaliseerde toppers, zoals Mr & Mrs'],
      price: todo('prijs mocktail table'),
    },
    {
      id: 'tiramisu', name: 'Tiramisu Bar', img: 'tiramisu-kar', tag: 'Dessert',
      desc: 'Een witte dessertkar met tiramisu, coupes en vers fruit. Gasten scheppen zelf, met frambozen en blauwe bessen erbij.',
      points: ['Witte kar met luifel', 'Zilveren schalen en coupes', 'Vers fruit als topping'],
      price: todo('prijs tiramisu bar'),
    },
    {
      id: 'snack', name: 'Snack Bar', img: 'snack-bar', tag: 'Sweet',
      desc: 'De Snack Corner: een verlichte bar vol snoep, spekjes en zure matten, met tangetjes voor iedereen.',
      points: ['Verlichte bar', 'Kleurrijke snoepselectie', 'Ideaal voor kinderen en de avond'],
      price: todo('prijs snack bar'),
    },
    {
      id: 'styling', name: 'Table & styling', img: 'styling-vlinders', tag: 'Aankleding',
      desc: 'Marmeren tafels op gouden voeten, verlichte vlinders, bloemen en een gouden champagnerek: de aankleding die alles samenbrengt.',
      points: ['Gouden tafels en rekken', 'Verlichte vlinders', 'Witte bloemen en kaarsen'],
      price: todo('prijs styling'),
    },
  ],

  // Galerij: alleen tafels, drankjes en styling (geen gasten of bruidsparen).
  gallery: [
    { img: 'mocktail-fruit', label: 'Mocktails met fruitplateau' },
    { img: 'rozen-martini', label: 'Rozen & passievrucht' },
    { img: 'vlinder-tafel', label: 'Witte vlindertafel' },
    { img: 'paarse-mocktails', label: 'Lavendel & rozemarijn' },
    { img: 'kokos-mr-mrs', label: 'Kokos met Mr & Mrs' },
    { img: 'perzik-blauw', label: 'Perzik & blue lagoon' },
    { img: 'mocktail-kleur', label: 'Regenboog-tafel' },
    { img: 'gouden-etagere', label: 'Gouden etagère' },
    { img: 'champagne-rek', label: 'Gouden champagnerek' },
    { img: 'roze-fruit', label: 'Roze & tropisch fruit' },
    { img: 'mocktail-raam', label: 'Mocktails bij daglicht' },
    { img: 'vlinder-kleur', label: 'Vlinders in kleur' },
    { img: 'kokos-mocktails', label: 'Kokos-coupes' },
    { img: 'tiramisu-fruit', label: 'Frambozen & bessen' },
    { img: 'snack-snoep', label: 'Snack Corner' },
  ],

  occasions: ['Bruiloften', 'Feesten', 'Events'],

  steps: [
    { t: 'Aanvraag', d: 'Vertel ons jullie datum, locatie, aantal gasten en welke opties jullie wensen.' },
    { t: 'Ontwerp', d: 'We stemmen de tafel af op jullie kleuren, bloemen en stijl.' },
    { t: 'Opbouw', d: 'Alles wordt op jullie locatie opgebouwd en gestyled, tot in het kleinste detail.' },
    { t: 'Genieten', d: 'Jullie gasten genieten van een tafel om nooit te vergeten.' },
  ],
};
