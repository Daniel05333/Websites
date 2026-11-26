// The Perfect Stage: alle inhoud en gegevens op één plek.
// Bron: Instagram @the_perfect_stage (profiel, posts, highlights), zie bron/.
// CONCEPT: prijzen, voorwaarden van de actie en de foto's per collectie zijn
// nog te bevestigen. Zolang draft: true staat krijgt de site noindex.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'The Perfect Stage',
  city: 'Rotterdam',
  url: todo('domeinnaam'),
  contact: { phone: '+31 6 83484086', whatsapp: '31683484086', instagram: 'the_perfect_stage' },
  followers: '45.000+',

  // Uit de bio.
  services: [
    { id: 'bruidsbank', name: 'Bruidsbanken', img: 'bruidsbank-goudbogen', desc: 'De bank waar alle ogen op gericht zijn: in velours, met bloemen en lichtbogen eromheen.' },
    { id: 'stage', name: 'Weddingstages', img: 'stage-wit-podium', desc: 'Een compleet podium met panelen, bogen, bloemen en licht als decor voor jullie entree en foto’s.' },
    { id: 'bogen', name: 'Bloemenbogen', img: 'boog-stage', desc: 'Ronde, gotische of verlichte bogen vol bloemen, als achtergrond of als doorgang.' },
    { id: 'trap', name: 'Trapbloemen', img: 'trap-bloemen', desc: 'Leuningen vol rozen en orchideeën voor een entree die niemand vergeet.' },
    { id: 'effects', name: 'Special effects', img: 'koepel-lila', desc: 'Effecten en licht voor de momenten die jullie dag bijzonder maken.' },
  ],
  // Uit de highlights.
  extras: ['Welkomstborden', 'Inkomsthal', 'Backdrops', 'Bogen', '360 graden'],

  // Collecties = highlights met een eigen naam. De foto's zijn sfeerbeelden:
  // laat The Perfect Stage per collectie de juiste foto's aanwijzen.
  collections: [
    { name: 'Wonderland', img: 'bogen-lampionnen' }, { name: 'Vaiana', img: 'stage-blauw' }, { name: 'Cleopatra', img: 'stage-goud-panelen' },
    { name: 'Cinderella', img: 'zaal-ringbogen' }, { name: 'Aladdin', img: 'bogen-lila-licht' }, { name: 'Aurora', img: 'bogen-roze-licht' },
    { name: 'Snow White', img: 'stage-wit' }, { name: 'Jasmine', img: 'boog-spits' }, { name: 'Bella', img: 'bruidsbank-rood' },
    { name: 'Rapunzel', img: 'boog-trap-lila' }, { name: 'Dreamydecor', img: 'zaal-bloesem' }, { name: 'Cinderella’s C.', img: 'stage-kroonluchters' },
  ],

  gallery: [
    ['zaal-bloemenloper', 'zaal', 'Bloemenloper'], ['bruidsbank-marmer', 'stage', 'Bruidsbank met marmeren bogen'], ['trapbloemen-groot', 'trap', 'Trapbloemen'],
    ['stage-rood', 'stage', 'Stage in rood en wit'], ['boog-roze', 'bogen', 'Bloemenboog'], ['tafels-goud', 'zaal', 'Tafels met bloemen'],
    ['stage-lila', 'stage', 'Stage in lila'], ['inkomsthal-gordijnen', 'zaal', 'Inkomsthal'], ['bruidsbank-bogen', 'stage', 'Bruidsbank'],
    ['zaal-kroonluchters', 'zaal', 'Zaal met kroonluchters'], ['bogen-tafels', 'bogen', 'Bogen'], ['tafels-rozen', 'zaal', 'Tafels met rozen'],
    ['stage-roze-zaal', 'stage', 'Stage'], ['boog-stage', 'bogen', 'Bloemenboog op podium'], ['tafels-rood', 'zaal', 'Tafels in rood en goud'],
    ['stage-donkere-vloer', 'stage', 'Stage op donkere vloer'], ['kroonluchter-ringen', 'bogen', 'Ringbogen'], ['zaal-orchidee', 'zaal', 'Orchideeën'],
    ['stage-zaal', 'stage', 'Stage met bogen'], ['detail-kroonluchter', 'zaal', 'Detail'], ['stage-bogen-roze', 'stage', 'Stage'],
    ['tafel-roze-stage', 'zaal', 'Gedekte tafel'], ['trap-bloemen', 'trap', 'Trap met rozen'], ['bogen-roze-licht', 'bogen', 'Verlichte bogen'],
  ].map(([img, cat, label]) => ({ img, cat, label })),

  events: ['Bruiloft', 'Henna', 'Verloving', 'Nikah', 'Anders'],

  steps: [
    { t: 'Aanvraag', d: 'Stuur jullie datum, zaal en wensen via het formulier. Het gaat direct naar onze WhatsApp.' },
    { t: 'Ontwerp', d: 'We kiezen samen een collectie of maken een ontwerp op maat in jullie kleuren.' },
    { t: 'Opbouw', d: 'Op de dag zelf bouwen we alles op in jullie zaal, tot in het kleinste detail.' },
    { t: 'Jullie moment', d: 'Jullie stappen het podium op. Wij zorgen dat alles klopt.' },
  ],

  promo: { title: 'Ontvang tot €300 korting', note: 'Vraag naar de voorwaarden.' },
};
