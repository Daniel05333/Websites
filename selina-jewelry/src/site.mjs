// Selina Jewelry: alle inhoud op één plek.
// Bron: Instagram @jewelry_selina (profiel, grid, highlights), zie bron/.
// CONCEPT: de namen van de stukken zijn werknamen, prijzen ontbreken nog
// (price: null = "Prijs op aanvraag") en de giftcard-bedragen zijn voorbeelden.

export const site = {
  draft: true,
  name: 'Selina Jewelry',
  city: 'Hengelo',
  contact: { phone: '06 34123130', whatsapp: '31634123130', instagram: 'jewelry_selina', facebook: 'Selina’s Jewelry' },
  stats: { posts: 273, followers: '2.785' },

  // Film in de hero: stilstaande foto + close-up (punten = de klaver, 0..1).
  film: {
    hand: { img: 'film-hand', w: 1206, h: 1623, x: 0.522, y: 0.468 },
    close: { img: 'film-close', x: 0.603, y: 0.578 },
    pick: { name: 'Klaver armband', detail: 'Groene klaver · 14 karaat goud' },
    sides: [{ id: 'tennis-kleur', name: 'Tennisarmband kleur' }, { id: 'armband-gourmet', name: 'Gourmet armband' }],
  },

  types: [
    { id: 'ringen', name: 'Ringen', one: 'Ring' },
    { id: 'oorbellen', name: 'Oorbellen', one: 'Oorbel' },
    { id: 'kettingen', name: 'Kettingen', one: 'Ketting' },
    { id: 'armbanden', name: 'Armbanden', one: 'Armband' },
  ],
  // id = foto. price null = prijs op aanvraag.
  pieces: [
    ['ring-satijn', 'ringen', 'Dubbele ring', 'Met zirkonia'],
    ['ring-groen', 'ringen', 'Ring groene steen', 'Ovaal, met zirkonia rand'],
    ['ring-blauw', 'ringen', 'Ring blauwe steen', 'Saffierkleurig'],
    ['ringen-roos', 'ringen', 'Stapelringen', 'Set van drie'],
    ['ringen-turkoois', 'ringen', 'Ring turkoois', 'Met hartje'],
    ['ringen-pampas', 'ringen', 'Zegelring bewerkt', 'Breed model'],
    ['oorbellen-hand', 'oorbellen', 'Studs', 'Klaver, hart, blad en meer'],
    ['creool-zirkonia', 'oorbellen', 'Creolen zirkonia', 'Klein en fonkelend'],
    ['creolen-standaard', 'oorbellen', 'Creolen', 'Van klein tot groot'],
    ['oorbel-staaf', 'oorbellen', 'Staafoorbel', 'Strak model'],
    ['creolen-oor', 'oorbellen', 'Creool glad', 'Voor elke dag'],
    ['oorbellen-doosje', 'oorbellen', 'Oorbellen in doosje', 'Klaar om te geven'],
    ['ketting-klaver', 'kettingen', 'Ketting klaver', 'Groene klaver'],
    ['ketting-schakel', 'kettingen', 'Schakelketting', 'Paperclip'],
    ['ketting-tennis', 'kettingen', 'Tennisketting', 'Rij zirkonia'],
    ['ketting-kruis-munt', 'kettingen', 'Kruis en munt', 'Twee kettingen'],
    ['kettingen-kruis-kleur', 'kettingen', 'Kruisje in kleur', 'Blauw, wit of roze'],
    ['ketting-medaillon', 'kettingen', 'Medaillon', 'Met stralenrand'],
    ['klaver-armbanden', 'armbanden', 'Klaver armband', 'Zwart, groen of wit'],
    ['tennis-kleur', 'armbanden', 'Tennisarmband kleur', 'Blauw, groen of roze'],
    ['armband-gourmet', 'armbanden', 'Gourmet armband', 'Dubbele schakel'],
    ['bangle-satijn', 'armbanden', 'Bangle', 'Open model'],
    ['tennis-armbanden', 'armbanden', 'Tennisarmband', 'Wit, met staafje'],
    ['armband-pampas', 'armbanden', 'Schakelarmband', 'Breed en soepel'],
  ].map(([id, type, name, detail]) => ({ id, type, name, detail, price: null })),

  // Highlights: Christmas, Autumn'23 (foto's per seizoen: te bevestigen).
  seasons: [
    { id: 'christmas', name: 'Christmas', title: 'Goud onder de boom', text: 'Klavers in alle kleuren, fijne ringen en armbanden om te stapelen. De cadeaus uit de Christmas-collectie.', imgs: ['kerst-klaver', 'ringen-kerst', 'klaver-kleuren'], type: 'armbanden' },
    { id: 'autumn', name: 'Autumn’23', title: 'Warm goud voor koude dagen', text: 'Brede schakels, zegelringen en een klaver aan een dunne ketting. Gestyled tussen pampas en droogbloemen.', imgs: ['ringen-pampas', 'armband-pampas', 'ketting-klaver'], type: 'ringen' },
  ],
  giftcards: [25, 50, 75, 100],
};
