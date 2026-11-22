// Petit Photobooth: alle inhoud en gegevens op één plek.
// Bron: Instagram @petitphotobooth (profiel, posts, highlights), zie bron/.
// CONCEPT: onbevestigde waarden staan als todo('…'). Zolang draft: true staat
// krijgt de site noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Petit Photobooth',
  tagline: 'Photobooths · High quality photos',
  url: todo('domeinnaam'),
  contact: { instagram: 'petitphotobooth', tiktok: 'petitphotobooth.nl' },

  // Gelegenheden uit de highlights.
  occasions: [
    { id: 'bruiloft', name: 'Bruiloft', img: 'bruidspaar-zwartwit', desc: 'Strips met jullie namen en datum, magazine-covers en een gastenboek vol herinneringen.' },
    { id: 'henna', name: 'Henna', img: 'hartjes', desc: 'Voor een kına gecesi of henna night: in de stijl en kleuren van jullie avond.' },
    { id: 'verloving', name: 'Verloving', img: 'bruidspaar-knuffel', desc: 'Jullie eerste feest als verloofd stel, vastgelegd in de mooiste prints.' },
    { id: 'bedrijf', name: 'Bedrijfsfeest', img: 'feestgroep', desc: 'Openingen, bedrijfsfeesten en events, met jullie eigen logo op het startscherm en de prints.' },
  ],
  more: ['Babyshower', 'Verjaardag', 'Christening', 'Ladies night'],

  // Wat er bij een booking kan (uit de highlights).
  extras: [
    { name: 'Mirrorbooth', desc: 'Een spiegel op ware grootte die foto’s maakt: met animaties op het scherm.' },
    { name: 'Eigen ontwerp', desc: 'Strips en startscherm met jullie namen, datum en thema.' },
    { name: 'Direct geprint', desc: 'High quality prints, meteen mee naar huis.' },
    { name: 'Gastenboek', desc: 'Een album waarin gasten hun foto plakken en een boodschap schrijven.' },
    { name: 'GIF’s', desc: 'Bewegende foto’s om meteen te delen.' },
    { name: 'Props & brillen', desc: 'Hartjesbrillen en accessoires voor de leukste foto’s.' },
  ],

  gallery: [
    { img: 'vriendinnen-brillen', label: 'Henna met hartjesbrillen' },
    { img: 'bruidspaar-brillen', label: 'Bruidspaar' },
    { img: 'zwartwit-duo', label: 'Zwart-wit' },
    { img: 'gasten-groep', label: 'Gasten' },
    { img: 'hartjes', label: 'Hartjes' },
    { img: 'gasten-trio', label: 'Gasten' },
    { img: 'bruidspaar-knuffel', label: 'Zwart-wit bruidspaar' },
    { img: 'gasten-brillen', label: 'Props' },
    { img: 'feestgroep', label: 'Feest' },
  ],

  steps: [
    { t: 'Aanvraag', d: 'Stuur jullie datum, locatie, gelegenheid en aantal gasten.' },
    { t: 'Ontwerp', d: 'We maken jullie strip en startscherm in jullie stijl.' },
    { t: 'Opbouw', d: 'Op de dag zelf staat de booth klaar op jullie locatie, in Nederland of Duitsland.' },
    { t: 'Strike a pose', d: 'Gasten nemen hun foto direct mee naar huis.' },
  ],
};
