// Yourlashes: alle inhoud en gegevens op één plek.
// Bron: Instagram @yourlashes.nl (profiel), zie bron/.
//
// CONCEPT. De highlights "Prices", "Payments" en "Housepolicy" waren niet
// zichtbaar in de screenshot: die staan hieronder als todo('…') en verschijnen
// op de site als gemarkeerde placeholder. Zolang draft: true staat krijgt de
// site noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Yourlashes',
  by: 'by Estella',
  city: 'Enschede',
  region: 'Overijssel',
  url: todo('domeinnaam (yourlashes.nl?)'),
  contact: { instagram: 'yourlashes.nl', address: todo('adres / wijk (home based)') },

  // Prijslijst uit de highlight "Prices" (Lashes by Estella). "2 weken" en
  // "3 weken" = refill na 2 of 3 weken. min = duur voor het boekingssysteem
  // (schatting, laten bevestigen).
  prices: [
    { cat: 'Volume', lead: 'Zachte, volle fans voor een glamorous look.', items: [
      { name: 'Volume · nieuwe set', label: 'Nieuwe set', min: 150, price: '€50' },
      { name: 'Volume · refill 2 weken', label: 'Refill na 2 weken', min: 75, price: '€40' },
      { name: 'Volume · refill 3 weken', label: 'Refill na 3 weken', min: 90, price: '€45' } ] },
    { cat: 'Hybrid', lead: 'Mix van classic en volume voor textuur en volheid.', items: [
      { name: 'Hybrid · nieuwe set', label: 'Nieuwe set', min: 135, price: '€50' },
      { name: 'Hybrid · refill 2 weken', label: 'Refill na 2 weken', min: 75, price: '€40' },
      { name: 'Hybrid · refill 3 weken', label: 'Refill na 3 weken', min: 90, price: '€45' } ] },
    { cat: 'Wet set', lead: 'Glanzende “natte” look met spikes.', items: [
      { name: 'Wet set · nieuwe set', label: 'Nieuwe set', min: 135, price: '€50' },
      { name: 'Wet set · refill 2 weken', label: 'Refill na 2 weken', min: 75, price: '€40' },
      { name: 'Wet set · refill 3 weken', label: 'Refill na 3 weken', min: 90, price: '€45' } ] },
    { cat: 'One by one', lead: 'Eén extension per eigen wimper: natuurlijk en verzorgd.', items: [
      { name: 'One by one · nieuwe set', label: 'Nieuwe set', min: 120, price: '€45' },
      { name: 'One by one · refill 2 weken', label: 'Refill na 2 weken', min: 60, price: '€35' },
      { name: 'One by one · refill 3 weken', label: 'Refill na 3 weken', min: 75, price: '€40' } ] },
    { cat: 'Lashlift', lead: 'Je eigen wimpers gelift: een open blik, zonder extensions.', items: [
      { name: 'Lashlift met tint', label: 'Met tint', min: 60, price: '€45' },
      { name: 'Lashlift zonder tint', label: 'Zonder tint', min: 50, price: '€40' } ] },
  ],

  // Uit de highlight "Aftercare".
  aftercare: [
    'De eerste 24 uur niet onder de zonnebank',
    'De eerste 24 uur niet in aanraking laten komen met water',
    'Wimpers dagelijks wassen met water',
    'Niet aan je wimpers zitten',
    'Laat je wimpers professioneel verwijderen, zo voorkom je schade',
  ],
  product: { name: 'Lashfoam', price: '€10', desc: 'Conditioning lash shampoo om je wimpers dagelijks schoon te houden. Te koop bij je afspraak.' },

  // Uit highlight "Payments" (nog in te vullen).
  payments: todo('betaalmogelijkheden, aanbetaling en hoe die werkt'),
  // Uit highlight "Housepolicy" (nog in te vullen).
  policy: todo('house policy: te laat komen, annuleren, verzetten, gasten meenemen, enz.'),

  work: [
    { img: 'volume-dramatisch', label: 'Volume', cat: 'lashes' },
    { img: 'lashlift-bruin', label: 'Lashlift', cat: 'lashlift' },
    { img: 'hybrid-groen', label: 'Hybrid', cat: 'lashes' },
    { img: 'wet-set-blauw', label: 'Wet set', cat: 'lashes' },
    { img: 'lashlift-zijkant', label: 'Lashlift', cat: 'lashlift' },
    { img: 'lashes-hybrid', label: 'Hybrid', cat: 'lashes' },
    { img: 'volume-groen', label: 'Volume', cat: 'lashes' },
    { img: 'lashlift-story', label: 'Lashlift', cat: 'lashlift' },
    { img: 'wispy-bruin', label: 'Wispy', cat: 'lashes' },
    { img: 'cat-eye', label: 'Cat eye', cat: 'lashes' },
    { img: 'lashlift-borstel', label: 'Lashlift', cat: 'lashlift' },
    { img: 'volume-wispy', label: 'Volume', cat: 'lashes' },
    { img: 'lashes-natural', label: 'Natural', cat: 'lashes' },
    { img: 'lashlift-close', label: 'Lashlift', cat: 'lashlift' },
    { img: 'volume-bruin', label: 'Volume', cat: 'lashes' },
    { img: 'lashes-volume', label: 'Volume', cat: 'lashes' },
    { img: 'lashlift-donker', label: 'Lashlift', cat: 'lashlift' },
    { img: 'volume-donker', label: 'Volume', cat: 'lashes' },
  ],

  steps: [
    { t: 'Boek online', d: 'Kies je behandeling en een vrij moment in de agenda.' },
    { t: 'Kom langs', d: 'Home based in Enschede. Het adres krijg je bij je bevestiging.' },
    { t: 'Ontspan', d: 'Lig lekker achterover terwijl je set wordt gezet.' },
    { t: 'Shine', d: 'Je gaat naar huis met lashes die bij jou passen.' },
  ],
};
