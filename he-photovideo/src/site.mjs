// HE Photovideo: alle inhoud op één plek.
// Bron: Instagram @he.photovideo (profiel en grid), zie bron/.
// CONCEPT: de indeling per gelegenheid, de pakketinhoud en prijzen zijn nog
// te bevestigen. WhatsApp-nummer of e-mail ontbreekt nog (zie contact).

export const site = {
  draft: true,
  name: 'HE Photovideo',
  city: 'Rotterdam',
  contact: {
    instagram: 'he.photovideo',
    // Nog niet bekend. Vul een nummer in (bijv. '31612345678') en de aanvraag
    // gaat direct naar WhatsApp. Zolang dit leeg is: kopiëren + Instagram.
    whatsapp: '',
  },
  stats: { posts: 92, followers: '3.554' },

  // Scroll-tunnel in de hero (van ver naar dichtbij).
  tunnel: ['kathedraal', 'trap-boven', 'kerk-zw', 'fuchsia-boog', 'oldtimer-wit', 'paard-zw', 'kasteel-lila', 'witte-smoking', 'rood-steeg', 'g-klasse-zw', 'aanzoek-strand', 'ogen'],

  // Portfolio per gelegenheid. Indeling op basis van de foto's: te bevestigen.
  occasions: [
    { id: 'bruiloft', name: 'Bruiloft', en: 'Wedding', lead: 'De hele dag, van de eerste blik tot het laatste dansje. Kerken, kastelen, trappenhuizen en de straten van de stad als decor.',
      photos: [['kathedraal', 'Kus onder de kroonluchter in de kathedraal'], ['trap-boven', 'Bruidspaar op de trap, van bovenaf'], ['arcade', 'Bruidspaar onder de arcade'], ['oldtimer-wit', 'Bruidspaar bij een witte oldtimer'], ['witte-smoking', 'Bruidegom in witte smoking met bruid'], ['kerk-zw', 'Bruidspaar in de kerk, zwart-wit'], ['deur-creme', 'Bruidspaar op de trappen van een monument'], ['brug-zw', 'Bruid bij de ophaalbrug, zwart-wit'], ['muur-hijab', 'Bruidspaar tegen een witte gevel'], ['mercedes-zw', 'Bruid bij een klassieke Mercedes'], ['piano-zw', 'Bruidspaar aan de vleugel'], ['g-klasse-zw', 'Bruid bij een witte G-klasse']] },
    { id: 'henna', name: 'Henna', en: 'Henna night', lead: 'Rood, groen, goud en fuchsia. De avond vol kleur, muziek en traditie, met oog voor elk detail van de jurk.',
      photos: [['henna-tamboerijn', 'Bruid met tamboerijn op de hennanacht'], ['rood-deur', 'Bruid in rode jurk met bruidegom'], ['rood-steeg', 'Bruidspaar in een steegje, rode jurk'], ['fuchsia-boog', 'Bruidspaar in fuchsia onder een witte boog'], ['groen-kerk', 'Bruid in groene baljurk in de kerk'], ['groen-beige', 'Paar in groen en beige met boeket']] },
    { id: 'verloving', name: 'Verloving', en: 'Engagement', lead: 'Van het aanzoek op het strand tot de verlovingsshoot bij een kasteel. Het begin van jullie verhaal.',
      photos: [['aanzoek-strand', 'Aanzoek op het strand, van bovenaf'], ['kasteel-lila', 'Verloofd stel bij een kasteel'], ['roze-binnenplaats', 'Omhelzing op een binnenplaats'], ['handen-strand', 'Handen die elkaar zoeken bij zee'], ['paard-zw', 'Stel met een wit paard, zwart-wit'], ['trappen-zwart', 'Stel op brede trappen, zwarte jurk'], ['park-dans-zw', 'Dans in het park, zwart-wit'], ['pak-pailletten-zw', 'Stel hand in hand, zwart-wit']] },
  ],

  // Films: posters uit de video-posts. De echte films komen van Instagram of
  // een eigen video-bestand (MP4 / Vimeo / YouTube).
  films: [
    { img: 'bruid-zw', kind: 'Bruiloft', title: 'The wedding film', occ: 'bruiloft' },
    { img: 'aanzoek-strand', kind: 'Verloving', title: 'The proposal', occ: 'verloving' },
    { img: 'henna-tamboerijn', kind: 'Henna', title: 'Henna night', occ: 'henna' },
    { img: 'tuin-dans', kind: 'Bruiloft', title: 'In the garden', occ: 'bruiloft' },
    { img: 'oversteken-zw', kind: 'Bruiloft', title: 'City wedding', occ: 'bruiloft' },
    { img: 'rood-steeg', kind: 'Henna', title: 'In red', occ: 'henna' },
  ],

  packages: [
    { id: 'foto', name: 'Fotografie', desc: 'Tijdloze beelden van jullie dag, bewerkt in de HE-stijl: strak, puur en vaak in zwart-wit.', items: ['Shoot op locatie', 'Bewerkte foto’s in hoge resolutie', 'Online galerij om te delen'] },
    { id: 'video', name: 'Videografie', desc: 'Een film die voelt als jullie dag: met muziek, beweging en de geluiden van het moment.', items: ['Filmische highlight-film', 'Korte versie voor Instagram', 'Montage met muziek'] },
    { id: 'beide', name: 'Foto + video', desc: 'Eén team voor beide. Fotograaf en videograaf werken samen, dus niemand loopt elkaar in de weg.', items: ['Alles van fotografie én video', 'Eén aanspreekpunt', 'Afgestemde stijl in foto en film'] },
  ],

  steps: [
    { t: 'Aanvraag', d: 'Kies jullie datum, gelegenheid en wat jullie zoeken. Jullie aanvraag komt compleet bij ons binnen.' },
    { t: 'Kennismaking', d: 'We bespreken jullie dag, de locaties en de stijl die bij jullie past.' },
    { t: 'De dag', d: 'Wij zijn er, met foto én video. Jullie hoeven alleen te genieten.' },
    { t: 'Jullie beelden', d: 'Jullie ontvangen de foto’s en de film, klaar om te bewaren en te delen.' },
  ],
};
