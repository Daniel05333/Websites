// Salon Robine: alle inhoud op één plek.
// Bron: Instagram @salonrobine (profiel, posts, highlights), zie bron/.
// Nagelprijzen komen van de post "Price list". Prijzen van gezichtsbehandelingen
// staan in de Salonized-agenda. Openingstijden en telefoon: nog aan te vullen.

export const site = {
  draft: true,
  name: 'Salon Robine',
  role: 'Nagelstyliste & schoonheidsspecialiste',
  address: { street: 'Arnoud van Gelderweg 95B', city: 'Grave', country: 'NL' },
  instagram: 'salonrobine',
  booking: 'https://salon-robine.salonized.com/',
  // Officiële Salonized-widget: vul het bedrijfs-ID in (Salonized → Instellingen →
  // Online boeken → Widget). Leeg = de boekingspagina wordt in de site geladen.
  salonizedWidgetId: '',

  nails: {
    intro: 'Verzorgde handen die er weken mooi uitzien. Robine werkt met gellak en BIAB, in elke kleur en vorm, met of zonder nail art.',
    prices: [['Gellak handen', '28,50'], ['BIAB handen', '32,50'], ['BIAB + gellak handen', '35,00'], ['BIAB + French manicure', '36,50'], ['Verwijderen BIAB/gellak', '12,50'], ['Nail art', 'prijs in overleg']],
    types: [
      { t: 'Gellak', d: 'Gelpolish in de kleur van je keuze, uitgehard onder de lamp. Direct droog en een hoogglans finish.' },
      { t: 'BIAB', d: 'Builder in a bottle: een versterkende gel op je eigen nagels. Fijn als je nagels snel breken of splijten.' },
      { t: 'French & nail art', d: 'Een klassieke of gekleurde French, stipjes, hartjes, chrome of glitter. Je ziet hieronder wat er kan.' },
    ],
  },
  face: [
    { id: 'dermaplaning', t: 'Dermaplaning', d: 'Met een steriel mesje worden donshaartjes en dode huidcellen voorzichtig weggehaald. Je huid voelt direct zachter en make-up en verzorging hechten beter.', img: 'dermaplaning-mes' },
    { id: 'gezicht', t: 'Gezichtsbehandeling', d: 'Reinigen, verzorgen en een masker dat precies past bij jouw huid. Tijd voor jezelf in een rustige behandelstoel.', img: 'masker' },
    { id: 'verzorging', t: 'Advies en producten', d: 'Persoonlijk huidadvies, met de producten die Robine in de salon gebruikt en verkoopt. Ook haar nagelriemolie neem je mee naar huis.', img: 'olie' },
  ],

  gallery: [
    ['french-amandel', 'nude', 'French op amandelvorm'], ['magenta', 'kleur', 'Magenta'], ['hartjes-rood', 'art', 'Hartjes en rode French'], ['glitter-bordeaux', 'glitter', 'Bordeaux glitter'],
    ['parelwit', 'nude', 'Parelwit'], ['rood-glans', 'kleur', 'Rood'], ['nude-dots', 'art', 'Stipjes op nude'], ['chrome-roze', 'glitter', 'Roze chrome'],
    ['french-lila', 'nude', 'Lila French'], ['pruim', 'kleur', 'Pruim'], ['zeester', 'art', 'Zomerse zeesterren'], ['koper-glitter', 'glitter', 'Koper glitter'],
    ['bruin-french', 'nude', 'Bruine French'], ['terracotta', 'kleur', 'Terracotta'], ['koraal-art', 'art', 'Koraal met art'], ['glitter-paars', 'glitter', 'Paarse glitter'],
    ['french-blauw-geel', 'nude', 'French in blauw en geel'], ['roze', 'kleur', 'Roze'], ['hartjes', 'art', 'Kleine hartjes'], ['pruim-chrome', 'glitter', 'Pruim chrome'],
    ['melkwit', 'nude', 'Melkwit'], ['taupe', 'kleur', 'Taupe'], ['blauw-art', 'art', 'Blauwe art'], ['roze-glitter', 'glitter', 'Roze glitter'],
  ].map(([img, cat, label]) => ({ img, cat, label })),
  ring: ['french-amandel', 'magenta', 'hartjes-rood', 'chrome-roze', 'parelwit', 'rood-glans', 'nude-dots', 'koper-glitter', 'french-lila', 'pruim', 'zeester', 'bruin-french'],
};
