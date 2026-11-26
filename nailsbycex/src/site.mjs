// Nailsbycex: alle inhoud en gegevens op één plek.
// Bron: Instagram @nailsbycex (profiel en posts), zie bron/.
//
// Dit is een CONCEPT. Onbevestigde waarden staan als todo('…') en verschijnen
// op de site als "op aanvraag". Zolang draft: true staat krijgt de site
// noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Nailsbycex',
  city: 'Enschede',
  url: todo('domeinnaam'),

  contact: {
    instagram: 'nailsbycex',
    tiktok: 'nailsbyce.x',
    address: todo('adres of wijk in Enschede'),
    whatsapp: todo('WhatsApp-nummer'),
  },

  // Koppel een online agenda (Salonized, Treatwell, Planity, …): vul de link in
  // en alle "Boek"-knoppen gaan daarheen. Leeg = aanvraag via Instagram-DM.
  bookingUrl: null,

  badges: [
    { t: 'Enschede', d: 'Overijssel, op afspraak' },
    { t: 'Elke vorm', d: 'Squoval, amandel, coffin of stiletto' },
    { t: 'Met de hand', d: 'French, stipjes en nail art' },
  ],

  // Voorstel op basis van het werk op Instagram; laat de eigenaar de lijst,
  // duur en prijzen bevestigen.
  services: [
    { name: 'Nieuwe set', desc: 'Lange of korte nagels in de vorm die jij wilt: squoval, amandel, coffin of stiletto.', price: todo('prijs nieuwe set') },
    { name: 'Nieuwe set + nail art', desc: 'French, stipjes, gouden accenten of een print: jouw ontwerp, met de hand gezet.', price: todo('prijs nail art') },
    { name: 'French', desc: 'Klassiek wit, gekleurd of met een gouden lijntje.', price: todo('prijs french') },
    { name: 'Opvullen', desc: 'Je set weer fris en sterk na een paar weken, met een nieuwe kleur als je wilt.', price: todo('prijs opvullen') },
    { name: 'Verwijderen', desc: 'Je nagels netjes en veilig verwijderd.', price: todo('prijs verwijderen') },
  ],

  work: [
    { img: 'roze-stiletto', label: 'Pink stiletto', cat: 'kleur' },
    { img: 'gouden-french', label: 'French met goud', cat: 'french' },
    { img: 'burgundy-squoval', label: 'Burgundy', cat: 'kleur' },
    { img: 'roze-french-stipjes', label: 'French + stipjes', cat: 'art' },
    { img: 'witte-french', label: 'Witte french', cat: 'french' },
    { img: 'bruin-nail-art', label: 'Mocha nail art', cat: 'art' },
    { img: 'french-stiletto-art', label: 'French stiletto', cat: 'art' },
    { img: 'roze-coffin-art', label: 'Pink coffin', cat: 'art' },
    { img: 'gele-french', label: 'Gele french', cat: 'french' },
  ],
  filters: [
    { id: 'alle', name: 'Alles' },
    { id: 'french', name: 'French' },
    { id: 'art', name: 'Nail art' },
    { id: 'kleur', name: 'Kleur' },
  ],

  steps: [
    { t: 'Kies je moment', d: 'Vraag je afspraak aan en kies alvast je behandeling en vorm.' },
    { t: 'Inspiratie', d: 'Neem een voorbeeld mee of kies samen een kleur, lengte en vorm.' },
    { t: 'Precisie', d: 'Je nagels worden voorbereid en laag voor laag opgebouwd.' },
    { t: 'Shine', d: 'Een glanzende afwerking en tips om je set mooi te houden.' },
  ],
};
