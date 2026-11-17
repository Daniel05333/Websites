// GetWhite — alle inhoud, prijzen en bedrijfsgegevens op één plek.
// Bron: Instagram @getwhite53 (profiel + highlights "Prijzen", "Afspraken",
// "Resultaten" en "Info"), zie de screenshots in bron/.
//
// Onbevestigde waarden staan als todo('…'). Zolang draft: true staat krijgt de
// site noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'GetWhite',
  tagline: 'Tandenbleken in Enschede',
  url: todo('domeinnaam, bijv. https://getwhite.nl'),
  city: 'Enschede',
  description:
    'GetWhite Enschede: tandenbleken vanaf €30. Elke sessie duurt 20 minuten. Basic of Ultra White, ook als duo. Afspraak via WhatsApp of Instagram.',

  contact: {
    whatsapp: '31610507908',
    whatsappLabel: '+31 6 10507908',
    instagram: 'getwhite53',
    // Het profiel vermeldt alleen "Enschede"; het exacte adres krijg je bij de afspraak.
    address: null,
  },

  // Prijzen uit de highlight "Prijzen" (solo: 14 mei, duo: 24 september).
  prices: {
    sessions: [2, 3, 4, 5, 10],
    popular: 4,
    guarantee: 5, // "5 sessies (geen resultaat, geld terug)"
    pack: 10, // "10 sessies (pakket)"
    polish: 10,
    lines: {
      basic: {
        name: 'Basic',
        lead: 'Voor een milder en natuurlijker resultaat',
        solo: { 2: 30, 3: 45, 4: 60, 5: 75, 10: 130 },
        duo: { 2: 55, 3: 80, 4: 110, 5: 140, 10: 250 },
      },
      ultra: {
        name: 'Ultra White',
        lead: 'Krachtigere gel, sneller resultaat',
        solo: { 2: 45, 3: 65, 4: 80, 5: 95, 10: 180 },
        duo: { 2: 80, 3: 120, 4: 150, 5: 180, 10: 350 },
      },
    },
  },

  minutes: 20,

  results: [
    { n: 1, alt: 'Voor en na tandenbleken: bovenste tanden van geel naar helder wit' },
    { n: 2, alt: 'Voor en na tandenbleken: voortanden duidelijk lichter' },
    { n: 3, alt: 'Voor en na tandenbleken: boven- en ondertanden witter' },
    { n: 4, alt: 'Voor en na tandenbleken: gelige tanden worden lichter' },
    { n: 5, alt: 'Voor en na tandenbleken: voortanden helder wit' },
    { n: 6, alt: 'Voor en na tandenbleken: na de behandeling met LED-licht' },
    { n: 7, alt: 'Voor en na tandenbleken: glimlach een paar tinten lichter' },
  ],

  steps: [
    { t: 'Stuur een bericht', d: 'Via WhatsApp of een DM op Instagram. Je kiest je behandeling en een moment dat jou past. Bij het maken van de afspraak vragen we een aanbetaling, zo staat jouw plek vast.' },
    { t: 'Poets je tanden', d: 'Kom met schone tanden, dan starten we hygiënisch. Kom je met z’n tweeën? Laat het vooraf weten, dan plannen we jullie samen in.' },
    { t: 'Achteroverleunen', d: 'Je neemt plaats in de behandelstoel. Wij brengen de gel aan en het LED-licht doet de rest. Elke sessie duurt 20 minuten.' },
    { t: 'Nazorg & stralen', d: 'Je krijgt de nazorgtips mee. Volg ze zorgvuldig: de eerste 2 uur alleen water, daarna 24–48 uur geen kleurende dranken of eten.' },
  ],

  rules: [
    { t: 'Kom op tijd', d: 'Zo loopt de planning niet uit en hoeft de volgende klant niet te wachten.' },
    { t: 'Annuleren', d: 'Annuleren of verplaatsen kan kosteloos tot 24 uur van tevoren. Daarna kunnen annuleringskosten in rekening worden gebracht.' },
    { t: 'Het resultaat', d: 'Niet iedereen krijgt hetzelfde resultaat, omdat tanden van persoon tot persoon verschillen.' },
    { t: 'De nazorg', d: 'Volg de nazorginstructies zorgvuldig voor een optimaal resultaat.' },
    { t: 'Samen naar de afspraak?', d: 'Laat het ons vooraf weten, zodat we er rekening mee kunnen houden.' },
    { t: 'Poets je tanden', d: 'Poets je tanden voor de behandeling, zo kunnen we schoon en hygiënisch starten.' },
    { t: 'Aanbetaling', d: 'Bij het maken van een afspraak vragen we een aanbetaling. Hiermee reserveren we jouw plek en voorkomen we last-minute afzeggingen.' },
    { t: 'Vragen?', d: 'Stel ze gerust vóór de behandeling, zodat je precies weet wat je kunt verwachten.' },
  ],

  aftercare: {
    first: 'Na het tandenbleken adviseren we om de eerste 2 uur alleen water te drinken en nog niets te eten.',
    do: ['Veel water drinken', 'Licht of “wit” eten: kip, rijst, yoghurt, banaan', 'Zacht poetsen', 'Mondhygiëne goed bijhouden', 'Eventueel een rietje gebruiken bij drinken'],
    dont: ['Koffie, thee, cola, energiedrank', 'Rode wijn of gekleurde frisdrank', 'Roken of vapen', 'Donkere sauzen: soja, curry, tomaat', 'Bessen, chocolade, rode bieten'],
    tip: 'Hoe lichter het eten en drinken, hoe beter je resultaat blijft.',
  },

  lasting: {
    factors: ['Roken', 'Koffie', 'Thee', 'Energydrink', 'Rode wijn', 'Mondhygiëne'],
  },

  faq: [
    { q: 'Hoeveel sessies heb ik nodig?', a: 'Dat verschilt per persoon. Niet elk gebit reageert hetzelfde op bleken: tandkleur, glazuur en de genen spelen een rol. De meeste klanten kiezen 4 sessies.' },
    { q: 'Hoelang blijven mijn tanden wit?', a: 'Je ziet direct verschil na de behandeling en het resultaat blijft maanden zichtbaar. Door eten en drinken kan de kleur langzaam vervagen, daarom kiezen veel klanten na 2–4 maanden voor een korte touch-up. Roken, koffie, thee, energydrink, rode wijn en je mondhygiëne spelen allemaal mee.' },
    { q: 'Wat is het verschil tussen Basic en Ultra White?', a: 'Basic geeft een milder en natuurlijker resultaat. Ultra White werkt met een krachtigere gel voor een sneller resultaat.' },
    { q: 'Wat als ik geen resultaat zie?', a: 'Kies je voor 5 sessies en zie je geen resultaat? Dan krijg je je geld terug.' },
    { q: 'Hoe lang duurt een sessie?', a: 'Elke sessie duurt 20 minuten.' },
    { q: 'Wat doet polijsten?', a: 'Polijsten is een extra optie (+ €10) voor extra glans en een langduriger resultaat. Het verwijdert ook oppervlakkige vlekken.' },
    { q: 'Kan ik samen met iemand komen?', a: 'Ja! Met de duo-behandeling kom je met z’n tweeën en betaal je een gezamenlijke prijs, bijvoorbeeld €55 voor 2 sessies Basic. Laat het wel vooraf weten.' },
    { q: 'Is GetWhite gecertificeerd?', a: 'Ja, GetWhite is officieel gecertificeerd: de cursus tandenbleken is succesvol afgerond.' },
    { q: 'Hoe maak ik een afspraak?', a: 'Stuur een WhatsApp-bericht naar +31 6 10507908 of een DM op Instagram (@getwhite53). Bij het maken van de afspraak vragen we een aanbetaling. Annuleren of verplaatsen kan kosteloos tot 24 uur van tevoren.' },
  ],
};
