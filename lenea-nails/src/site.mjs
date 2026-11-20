// Lenéa nails: alle inhoud en gegevens op één plek.
// Bron: Instagram @leneanails (profiel en posts), zie bron/.
//
// Dit is een CONCEPT. Onbevestigde waarden staan als todo('…') en verschijnen
// op de site als "op aanvraag" of als gemarkeerde placeholder. Zolang
// draft: true staat krijgt de site noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Lenéa nails',
  city: 'Enschede',
  url: todo('domeinnaam'),

  contact: {
    instagram: 'leneanails',
    address: todo('adres of wijk in Enschede'),
    whatsapp: todo('WhatsApp-nummer'),
  },

  // Koppel een online agenda (Salonized, Treatwell, Planity, …): vul de link in
  // en alle "Boek"-knoppen gaan daarheen. Leeg = aanvraag via Instagram-DM.
  bookingUrl: null,

  badges: [
    { t: 'Certified nail tech', d: 'Gecertificeerd opgeleid' },
    { t: 'NN Gel', d: 'Werkt met NN Gel' },
    { t: 'Enschede', d: 'Afspraak in de studio' },
  ],

  // Behandelingen zijn een voorstel op basis van het werk op Instagram;
  // laat de eigenaar de lijst, duur en prijzen bevestigen.
  services: [
    { name: 'Gel op natuurlijke nagels', desc: 'Sterke, glanzende nagels met NN Gel op je eigen nagel. Clean, milky of in kleur.', price: todo('prijs gel'), time: todo('duur') },
    { name: 'Gel + nail art', desc: 'Leopard, polka dots, chrome, bloemetjes of sterren: jouw idee, met de hand gezet.', price: todo('prijs nail art'), time: todo('duur') },
    { name: 'French', desc: 'Klassiek wit, gekleurd of met een gouden lijntje. Op amandel, squoval of kort.', price: todo('prijs french'), time: todo('duur') },
    { name: 'Opvullen', desc: 'Je set weer fris en sterk na een paar weken, met een nieuwe kleur als je wilt.', price: todo('prijs opvullen'), time: todo('duur') },
    { name: 'Verwijderen', desc: 'Je gel netjes en veilig verwijderd, met verzorging van je nagels.', price: todo('prijs verwijderen'), time: todo('duur') },
  ],

  // Portfolio met eigen indeling op basis van wat er op de foto's te zien is.
  work: [
    { img: 'olijf-chrome-leopard', label: 'Olijf, chrome & leopard', cat: 'art' },
    { img: 'milky-amandel', label: 'Milky white', cat: 'clean' },
    { img: 'polka-dots', label: 'Polka dots', cat: 'art' },
    { img: 'french-goud', label: 'French met goud', cat: 'french' },
    { img: 'kersenrood', label: 'Cherry red', cat: 'kleur' },
    { img: 'roze-leopard-tips', label: 'Leopard tips', cat: 'art' },
    { img: 'shimmer-amandel', label: 'Pearl shimmer', cat: 'clean' },
    { img: 'rood-sterren-leopard', label: 'Stars & leopard', cat: 'art' },
    { img: 'french-roze', label: 'Soft french', cat: 'french' },
    { img: 'milky-bloem', label: 'Milky + bloem', cat: 'art' },
    { img: 'rood-amandel', label: 'Classic red', cat: 'kleur' },
    { img: 'leopard-french-bruin', label: 'Mocha & leopard french', cat: 'art' },
    { img: 'roze-kort', label: 'Rosé', cat: 'clean' },
    { img: 'bloemen-sterren', label: 'Bloemen & sterren', cat: 'art' },
    { img: 'french-bloem', label: 'French + bloem', cat: 'french' },
    { img: 'milky-squoval', label: 'Milky squoval', cat: 'clean' },
    { img: 'nude-kort', label: 'Nude', cat: 'clean' },
    { img: 'shimmer-kort', label: 'Shimmer', cat: 'clean' },
  ],
  filters: [
    { id: 'alle', name: 'Alles' },
    { id: 'clean', name: 'Clean & milky' },
    { id: 'french', name: 'French' },
    { id: 'art', name: 'Nail art' },
    { id: 'kleur', name: 'Kleur' },
  ],

  steps: [
    { t: 'Kies je moment', d: 'Vraag je afspraak aan en kies alvast je behandeling.' },
    { t: 'Inspiratie', d: 'Neem een voorbeeld mee of kies samen een kleur en vorm: amandel, squoval of kort.' },
    { t: 'Precisie', d: 'Je nagels worden voorbereid en met NN Gel opgebouwd, laag voor laag.' },
    { t: 'Shine', d: 'Een glanzende afwerking en tips om je set mooi te houden.' },
  ],
};
