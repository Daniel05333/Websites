// Glowgarden: alle inhoud op één plek.
// Bron: Instagram @glowgarden.nl (profiel, posts en highlights), zie bron/.
// Prijzen komen van de prijsposts en de highlight "Prijslijst man".
// CONCEPT: Hydrafacial-prijs, openingstijden en het jaar bij de acties zijn nog te bevestigen.

export const site = {
  draft: true,
  name: 'Glowgarden',
  city: 'Enschede',
  contact: { phone: '06 20 31 82 21', whatsapp: '31620318221', instagram: 'glowgarden.nl' },

  laser: {
    // Uit de post "Zeg vaarwel tegen eindeloos scheren!" en "Alexandritlaser: slechte ervaring?"
    perks: ['Minder ongewenste haargroei', 'Minder vaak scheren', 'Een gladder aanvoelende huid', 'Persoonlijke aandacht tijdens je afspraak'],
    steps: [
      { t: 'Intake', d: 'Een intakegesprek met huid- en haaranalyse. Zo maken we samen een realistisch behandelplan.' },
      { t: 'Behandeling', d: 'De alexandrietlaser richt zich op de haarwortel. Je huid blijft rustig, het haar groeit steeds minder terug.' },
      { t: 'Herhalen', d: 'Voor het beste resultaat zijn meestal meerdere behandelingen nodig. Het resultaat verschilt per persoon.' },
    ],
    tip: 'Begin niet vóór je 23e. Ook als je volwassen bent, is je lichaam nog in ontwikkeling en kan je haargroei nog veranderen.',
  },
  hydra: {
    steps: ['Reinigen', 'Exfoliëren', 'Extraheren', 'Hydrateren'],
  },

  // Prijzen vrouw ("onder korting" op de post). Bedragen in euro.
  women: {
    mini: { note: 'Mini zone · nu €50 in plaats van €89', items: [['Gehele gezicht', 50, 89], ['Oksels', 50, 89], ['Gehele intiem', 50, 89]] },
    duo: { note: '2 zones', items: [['Gehele gezicht + oksels', 85], ['Oksels + gehele intiem', 85], ['Gehele gezicht + gehele intiem', 85]] },
    xl: { note: 'XL zones', items: [['Gehele intiem + gehele benen', 120], ['Gehele benen + gehele armen', 145], ['Gehele gezicht + oksels + gehele benen', 150]] },
    single: { note: 'Losse zones', items: [['Gehele gezicht', 89], ['Oksels', 89], ['Boven armen', 89], ['Onder armen', 89], ['Voeten', 89], ['Rug', 99], ['Buik', 99], ['Boven benen', 99], ['Onder benen', 99], ['Gehele intiem', 119], ['Gehele armen', 149], ['Gehele benen', 169]] },
  },
  men: [['Gezicht', 25], ['Oksels', 30], ['Rug', 40], ['Borst/buik', 40], ['Armen', 45], ['Benen', 55], ['Bovenlichaam', 85], ['Fullbody', 135]],

  results: [
    ['oksel-1', 'Oksel', 'vrouw'], ['kin-man', 'Kin en wang', 'man'], ['huid-rood', 'Ingegroeide haartjes', 'vrouw'],
    ['rug-man', 'Rug', 'man'], ['oksel-3', 'Oksel', 'vrouw'], ['kaak-man', 'Kaaklijn', 'man'],
    ['arm', 'Arm', 'vrouw'], ['hals-man', 'Hals', 'man'], ['kin-vrouw', 'Kin', 'vrouw'],
  ],

  deals: [
    { tag: 'Actie', title: 'Hele lichaam + gezicht', price: 100, note: 'Geldig tot eind maart', treat: 'Actie: hele lichaam + gezicht (€100)' },
    { tag: 'Mini zone', title: 'Gezicht, oksels of intiem', price: 50, was: 89, note: 'Per zone', treat: 'Mini zone (€50)' },
    { tag: '2 zones', title: 'Twee zones samen', price: 85, note: 'Bijv. gezicht + oksels', treat: '2 zones (€85)' },
  ],
  win: {
    prize: '2 gratis laserbehandelingen',
    value: 'T.w.v. €100',
    when: 'De winnaar wordt eind december bekendgemaakt',
    steps: ['Volg en tag @glowgarden.nl', 'Like het winactie-bericht', 'Tag 3 vriendinnen die ook willen winnen', 'Deel de winactie in je Instagram Story en tag Glowgarden'],
  },
  // Uit de highlight "Reviews klanten" (WhatsApp-berichten, zonder namen).
  reviews: [
    'Super tevreden over de laser bij jou! Mijn huid is zoveel zachter en de haartjes groeien veel minder terug.',
    'Echt een aanrader! Je bent zo professioneel en vriendelijk. Ik kom zeker terug!',
    'Hee, ik ben nu 3x geweest en zie al zoveel verschil! Echt top.',
    'Vandaag geweest voor laser en ben heel tevreden! Zo professioneel en hygiënisch. Bedankt!',
    'Heyy, ik ben zo blij met het resultaat van de laser! Echt top service.',
    'Beste salon ever! Zo blij met m’n laserbehandeling. Zeker een aanrader voor iedereen!',
  ],
  // Uit de highlight "Herinnering afspraak".
  rules: [
    ['Scheren', 'Scheer de plekken die gelaserd worden 1 dag van tevoren.'],
    ['Zon', 'Geen zonnebank voorafgaand aan je behandeling.'],
    ['Huid', 'Niet insmeren met skincare of zonnebrand op de dag van je afspraak.'],
    ['Afzeggen', 'Afzeggen kan tot 24 uur van tevoren.'],
    ['Betalen', 'Betalen kan alleen contant.'],
    ['Alleen komen', 'Kom bij voorkeur alleen, de ruimte is beperkt.'],
    ['Op tijd', 'Zorg dat je op tijd bent: 15 minuten eerder is perfect. Te laat of niet verschijnen wordt in rekening gebracht.'],
    ['ID en gezondheid', 'Neem je ID mee en meld veranderingen in je gezondheid, zoals antibiotica in de laatste 2 weken of nieuwe allergieën.'],
  ],
};
