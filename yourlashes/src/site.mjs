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

  // Prijslijst (uit highlight "Prices"; nog in te vullen). min = duur voor het
  // boekingssysteem (schatting, laten bevestigen).
  prices: [
    { cat: 'Lashes', items: [
      { name: 'Classic set', desc: 'Eén extension per eigen wimper: natuurlijk en verzorgd.', min: 120, price: todo('prijs classic') },
      { name: 'Hybrid set', desc: 'Mix van classic en volume voor textuur en volheid.', min: 135, price: todo('prijs hybrid') },
      { name: 'Volume set', desc: 'Zachte, volle fans voor een glamorous look.', min: 150, price: todo('prijs volume') },
      { name: 'Wispy set', desc: 'Speelse pieken voor de populaire wispy look.', min: 150, price: todo('prijs wispy') },
      { name: 'Refill', desc: 'Je set weer vol en fris.', min: 75, price: todo('prijs refill') },
      { name: 'Verwijderen', desc: 'Je extensions veilig verwijderd.', min: 30, price: todo('prijs verwijderen') },
    ] },
    { cat: 'Lashlifts', items: [
      { name: 'Lashlift', desc: 'Je eigen wimpers gelift: een open blik, zonder extensions.', min: 60, price: todo('prijs lashlift') },
      { name: 'Lashlift + tint', desc: 'Gelift én gekleurd voor extra definitie.', min: 70, price: todo('prijs lashlift + tint') },
    ] },
  ],

  // Uit highlight "Payments" (nog in te vullen).
  payments: todo('betaalmogelijkheden, aanbetaling en hoe die werkt'),
  // Uit highlight "Housepolicy" (nog in te vullen).
  policy: todo('house policy: te laat komen, annuleren, verzetten, gasten meenemen, enz.'),

  work: [
    { img: 'lashes-hybrid', label: 'Hybrid' },
    { img: 'lashes-natural', label: 'Natural volume' },
    { img: 'lashes-volume', label: 'Volume' },
    { img: 'lashlift-borstel', label: 'Lashlift' },
    { img: 'lashes-close', label: 'Wispy' },
    { img: 'lashes-wispy', label: 'Close-up' },
  ],

  steps: [
    { t: 'Boek online', d: 'Kies je behandeling en een vrij moment in de agenda.' },
    { t: 'Kom langs', d: 'Home based in Enschede. Het adres krijg je bij je bevestiging.' },
    { t: 'Ontspan', d: 'Lig lekker achterover terwijl je set wordt gezet.' },
    { t: 'Shine', d: 'Je gaat naar huis met lashes die bij jou passen.' },
  ],
};
