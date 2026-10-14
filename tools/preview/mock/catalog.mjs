// VOLKARA mock catalog for the local preview harness (prices in cents). Mirrors docs/BUILD_SPEC.md §13.
// Teksten in het Nederlands volgens docs/08-tone-of-voice-nl.md. Geen reviews/sterren: reviews.rating en
// reviews.rating_count staan op null, zodat het thema geen beoordelingen toont tot een reviews-app ze vult.
let vid = 41000000;
const sizes = (handle, list, sku) => list.map(([title, price, compare = null]) => ({ id: ++vid, title, options: [title], price, compare_at_price: compare, available: true, sku: `${sku}-${title.replace(/\s|cm/g, '')}` }));
const single = (price, compare, sku) => [{ id: ++vid, title: 'Default Title', options: ['Default Title'], price, compare_at_price: compare, available: true, sku }];

// Specificaties per soort product. Exacte cijfers staan alleen hier, niet in de omschrijvingen.
const WARRANTY = { label: 'Garantie', value: '25 jaar garantie' };
const COOKWARE_SPECS = [
  { label: 'Kookoppervlak', value: 'Massief titanium, handgehamerde afwerking' },
  { label: 'Coating', value: 'Geen chemische coating — zonder PFAS, PFOA en PTFE' },
  { label: 'Constructie', value: 'VolcanicCore™, gelaagd en samengesmeed' },
  { label: 'Warmtebronnen', value: 'Gas, inductie, keramisch, elektrisch, oven en grill' },
  { label: 'Hittebestendig', value: 'Tot 540 °C' },
  { label: 'Vaatwasser', value: 'Vaatwasserbestendig' },
  { label: 'Keukengerei', value: 'Metalen spatels en gardes toegestaan' },
  WARRANTY,
];
const specs = {
  cookware: (extra = []) => [...extra, ...COOKWARE_SPECS],
  knife: (length) => [
    { label: 'Lemmet', value: 'Gelaagd damascusstaal' },
    { label: 'Lengte lemmet', value: length },
    { label: 'Afwerking', value: 'Gepolijste afwerking' },
    { label: 'Onderhoud', value: 'Met de hand afwassen en direct afdrogen' },
    WARRANTY,
  ],
  board: () => [
    { label: 'Snijvlak', value: 'Titanium, niet-poreus' },
    { label: 'Maten', value: 'M en L' },
    WARRANTY,
  ],
  utensils: () => [
    { label: 'Materiaal', value: 'Roestvrij staal (rvs)' },
    { label: 'Inhoud', value: '5 delen' },
    { label: 'Geschikt voor', value: 'Titanium kookoppervlakken' },
    WARRANTY,
  ],
  lid: () => [
    { label: 'Materiaal', value: 'Gehard glas' },
    { label: 'Maten', value: '20, 24 en 28 cm' },
    { label: 'Past op', value: 'Volkara pannen met dezelfde diameter' },
    WARRANTY,
  ],
};

const html = (intro, bullets) => `<p>${intro}</p><ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;

const P = (id, handle, title, type, tags, collections, variants, meta) => ({
  id, handle, title, type, vendor: 'VOLKARA', tags, collections, variants,
  options: variants[0].title === 'Default Title' ? ['Title'] : ['Maat'],
  description: meta.description,
  imageFiles: meta.images || [],
  metafields: {
    custom: { subtitle: meta.subtitle, badge: meta.badge || null, specs: { type: 'json', value: meta.specs } },
    // Alleen gevuld waar de opdrachtgever de cijfers heeft bevestigd (zie docs/09-claims-controle.md).
    reviews: { rating: meta.rating || null, rating_count: meta.rating_count || null },
  },
  created_at: `2026-0${(id % 9) + 1}-12T10:00:00Z`,
});

export const products = [
  P(1001, 'gehamerde-titanium-pan', 'Gehamerde Titanium Pan', 'Koekenpan', ['bestseller'], ['pans', 'bestsellers'],
    sizes('gehamerde-titanium-pan', [['20 cm', 8495, 28000], ['24 cm', 8995], ['28 cm', 9495], ['32 cm', 10495]], 'VK-FP'),
    { subtitle: 'Japans vakmanschap. Gebouwd voor generaties.', badge: 'Bestseller', specs: specs.cookware(), images: ['vk-visual-pan.webp', 'vk-visual-pan-angle.webp', 'vk-visual-macro.webp', 'vk-visual-handle.webp'], rating: 4.8, rating_count: 15500,
      description: html('De Gehamerde Titanium Pan is de pan die je elke dag pakt. Puur titanium, met een handgehamerde afwerking en zonder chemische coating: geen laag die kan afbladderen, wel een stevige korst, gelijkmatige warmte en een pan die gemaakt is om lang mee te gaan. Voor wie geen genoegen neemt met minder.', [
        'Massief titanium kookoppervlak, zonder PFAS, PFOA of PTFE',
        'Handgehamerde structuur voor een natuurlijke loslating',
        'Bestand tegen hitte tot 540 °C, ook geschikt voor oven en grill',
        'Werkt op gas, inductie, keramisch en elektrisch',
        'Metalen keukengerei mag, en hij kan in de vaatwasser',
      ]) }),
  P(1002, 'gehamerde-titanium-wok', 'Gehamerde Titanium Wok', 'Wok', [], ['woks', 'bestsellers'],
    sizes('gehamerde-titanium-wok', [['30 cm', 18900], ['34 cm', 21900]], 'VK-FW'),
    { subtitle: 'Gemaakt voor felle hitte.', specs: specs.cookware(),
      description: html('Met de Gehamerde Titanium Wok roerbak je op hoog vuur, zoals het hoort: snel, heet en met groenten die knapperig blijven. De vlakke bodem staat stevig op inductie, de diepe kom geeft ruimte om te omscheppen. Voor iedereen die vaak Aziatisch kookt of gewoon graag op hoog vuur werkt.', [
        'Vlakke bodem voor goed contact met inductie en keramisch',
        'Diepe, ruime kom om ingrediënten makkelijk om te scheppen',
        'Titanium kookoppervlak zonder coating: hoog vuur is geen probleem',
        'Metalen wokspatel toegestaan, vaatwasserbestendig',
      ]) }),
  P(1003, 'saute-pan', 'Volkara hapjespan met deksel', 'Hapjespan', ['new'], ['pans', 'pots'],
    sizes('saute-pan', [['24 cm', 17900], ['28 cm', 20900]], 'VK-SP'),
    { subtitle: 'Hoge rand, gelijkmatige warmte.', badge: 'Nieuw', specs: specs.cookware([{ label: 'Inclusief', value: 'Passende deksel' }]),
      description: html('De Volkara hapjespan is gemaakt voor gerechten die meer ruimte vragen: eerst aanbraden, dan blussen en met de deksel erop zacht laten garen. Ideaal voor stoofgerechten, risotto en eenpansmaaltijden doordeweeks.', [
        'Hoge rand, zodat saus en jus in de pan blijven',
        'Goed sluitende deksel om rustig te stoven en te smoren',
        'Van fornuis naar oven zonder over te scheppen',
        'Titanium kookoppervlak zonder coating, geschikt voor alle warmtebronnen',
      ]) }),
  P(1004, 'saucepan', 'Volkara steelpan met deksel', 'Steelpan', [], ['pots'],
    sizes('saucepan', [['16 cm', 12900], ['18 cm', 14900], ['20 cm', 16900]], 'VK-SC'),
    { subtitle: 'Voor sauzen, granen en groenten.', specs: specs.cookware([{ label: 'Inclusief', value: 'Passende deksel' }]),
      description: html('De Volkara steelpan is de pan voor de kleine, precieze klussen: een beurre blanc, een pan rijst of melk voor de warme chocolade. De warmte verdeelt zich rustig over bodem en wand, zodat je saus gelijkmatig indikt.', [
        'Uitlopende schenkrand: gieten zonder morsen',
        'Gelijkmatige warmte, ook op een laag pitje',
        'Deksel inbegrepen, ovenbestendig en vaatwasserbestendig',
        'Titanium kookoppervlak zonder coating, PFAS- en PTFE-vrij',
      ]) }),
  P(1005, 'stockpot', 'Volkara kookpan met deksel', 'Kookpan', [], ['pots'],
    sizes('stockpot', [['24 cm', 23900]], 'VK-ST'),
    { subtitle: 'Voor bouillon, soep en stoofpotten.', specs: specs.cookware([{ label: 'Inclusief', value: 'Passende deksel' }]),
      description: html('In de Volkara kookpan trek je een bouillon die uren mag pruttelen, kook je pasta voor het hele gezin of maak je een grote pan soep voor de week. De brede bodem houdt de warmte vast en verdeelt die gelijkmatig.', [
        'Brede bodem: eerst aanbraden, dan aanvullen en laten sudderen',
        'Ruime inhoud voor soep, bouillon en pasta',
        'Geschikt voor inductie en alle andere warmtebronnen',
        'Titanium kookoppervlak zonder coating, vaatwasserbestendig',
      ]) }),
  P(1006, 'complete-set', 'Complete set — 3 gehamerde pannen', 'Set', ['bestseller'], ['sets', 'bestsellers'],
    single(24287, 26985, 'VK-SET-3'),
    { subtitle: '20, 24 en 28 cm — 10% voordeliger dan los.', badge: 'Bespaar 10%', specs: specs.cookware([{ label: 'Inhoud', value: 'Gehamerde Titanium Pan 20, 24 en 28 cm' }]),
      description: html('De complete set: de Gehamerde Titanium Pan in drie maten. Een kleine voor een ei of een saus, een middelste voor elke dag en een grote voor als je voor meer mensen kookt. Je betaalt 10% minder dan voor drie losse pannen.', [
        'Drie pannen: 20, 24 en 28 cm',
        '10% voordeliger dan los gekocht (€269,85 los, €242,87 als set)',
        'Massief titanium, zonder PFAS, PFOA of PTFE',
        'Geschikt voor alle warmtebronnen, oven en grill',
      ]) }),
  P(1014, 'set-2-pannen', 'Set — 2 gehamerde pannen', 'Set', [], ['sets'],
    single(16616, 17490, 'VK-SET-2'),
    { subtitle: '20 en 24 cm — 5% voordeliger dan los.', badge: 'Bespaar 5%', specs: specs.cookware([{ label: 'Inhoud', value: 'Gehamerde Titanium Pan 20 en 24 cm' }]),
      description: html('Twee gehamerde titanium pannen voor meer flexibiliteit in de keuken: de 20 cm voor ontbijt en sauzen, de 24 cm voor elke dag. Je betaalt 5% minder dan voor twee losse pannen.', [
        'Twee pannen: 20 en 24 cm',
        '5% voordeliger dan los gekocht (€174,90 los, €166,16 als set)',
        'Massief titanium, zonder PFAS, PFOA of PTFE',
        'Geschikt voor alle warmtebronnen, oven en grill',
      ]) }),
  P(1007, 'chefs-collection', "Chef's Collectie — 7-delig", 'Set', [], ['sets'],
    single(89900, 103400, 'VK-SET-7'),
    { subtitle: 'Zeven delen, één standaard.', badge: 'Bespaar €135', specs: specs.cookware([{ label: 'Inhoud', value: '7 delen: pannen, kookpannen en deksels' }]),
      description: html("De Chef's Collectie geeft je in één keer de basis voor een complete keuken: pannen om te bakken en aan te braden, kookpannen om te garen en deksels die passen. Voor wie overstapt van pannen met antiaanbaklaag en meteen alles goed wil hebben.", [
        'Pannen, kookpannen en deksels die op elkaar zijn afgestemd',
        'Voordeliger dan dezelfde delen los gekocht',
        'Overal hetzelfde titanium kookoppervlak zonder coating',
        'Geschikt voor inductie, de oven en de vaatwasser',
      ]) }),
  P(1008, 'signature-kitchen', 'Signature Keuken — 12-delig', 'Set', [], ['sets'],
    single(149900, 174200, 'VK-SET-12'),
    { subtitle: 'Alles voor je keuken, in één keer.', badge: 'Complete keuken', specs: specs.cookware([{ label: 'Inhoud', value: '12 delen: pannen, kookpannen en deksels' }]),
      description: html('De Signature Keuken is de volledige Volkara-uitrusting: van koekenpan tot kookpan, met de deksels erbij. Voor wie een nieuwe keuken inricht of al het kookgerei in één keer wil vervangen door pannen zonder coating.', [
        'Een complete set voor bakken, braden, stoven en koken',
        'Voordeliger dan alle delen los gekocht',
        'Titanium kookoppervlak zonder coating, PFAS- en PTFE-vrij',
        'VolcanicCore™-opbouw, geschikt voor inductie en alle warmtebronnen',
        'Ovenbestendig en vaatwasserbestendig',
      ]) }),
  P(1009, 'damascus-chef-knife', 'Damascus koksmes 21 cm', 'Mes', [], ['knives'],
    single(16900, null, 'VK-KN-CH'),
    { subtitle: 'Je allrounder op de snijplank.', specs: specs.knife('21 cm'),
      description: html('Het Volkara damascus koksmes is het mes dat je voor bijna alles gebruikt: uien snipperen, kruiden hakken, vlees portioneren. Het lemmet van gelaagd damascusstaal heeft het kenmerkende golvende patroon, afgewerkt', [
        'Gelaagd damascusstaal met een herkenbaar golfpatroon',
        'Een lang lemmet voor wiegend hakken en lange sneden',
        'Met de hand afwassen en direct afdrogen, zo blijft het mes mooi',
      ]) }),
  P(1010, 'santoku-knife', 'Damascus santoku 18 cm', 'Mes', [], ['knives'],
    single(14900, null, 'VK-KN-SA'),
    { subtitle: 'Licht, wendbaar en precies.', specs: specs.knife('18 cm'),
      description: html('De Volkara damascus santoku is het Japanse allroundmes voor groenten, vis en vlees. Het kortere, brede lemmet ligt licht in de hand en is fijn voor dunne plakjes en precies snijwerk. Voor wie liever snijdt dan hakt.', [
        'Gelaagd damascusstaal',
        'Breed lemmet om gesneden ingrediënten makkelijk op te scheppen',
        'Compact en wendbaar, ook voor kleinere handen',
        'Met de hand afwassen en direct afdrogen',
      ]) }),
  P(1011, 'titanium-board', 'Titanium snijplank', 'Accessoire', [], ['accessories', 'cutting-boards'],
    sizes('titanium-board', [['M', 8900], ['L', 11900]], 'VK-BRD'),
    { subtitle: 'Een strak, niet-poreus snijvlak.', specs: specs.board(),
      description: html('De Volkara titanium snijplank geeft je een glad, niet-poreus snijvlak dat je eenvoudig schoonmaakt. Vocht en geuren trekken niet in het oppervlak. Handig voor rauw vlees en vis, en mooi genoeg om op het aanrecht te laten liggen.', [
        'Niet-poreus titanium: vocht en geuren trekken er niet in',
        'Snel schoon met warm water en afwasmiddel',
        'In twee maten: M voor dagelijks snijwerk, L voor groter werk',
        'Strakke uitstraling die past bij de rest van je Volkara keuken',
      ]) }),
  P(1012, 'utensil-set', 'Set keukengerei — 5-delig', 'Accessoire', [], ['accessories'],
    single(9900, null, 'VK-UT-5'),
    { subtitle: 'Gereedschap dat bij je pannen past.', specs: specs.utensils(),
      description: html('Vijf stuks keukengerei van roestvrij staal, met dezelfde, kun je ze daar gewoon mee gebruiken. Voor wie zijn keuken compleet en in één stijl wil hebben.', [
        'Vijf delen van roestvrij staal (rvs) voor dagelijks kookwerk',
        'Te gebruiken in Volkara pannen: metaal op titanium mag',
        ', in dezelfde stijl als de messen',
        'Stevig in de hand, makkelijk schoon te maken',
      ]) }),
  P(1013, 'glass-lid', 'Glazen deksel', 'Accessoire', [], ['accessories'],
    sizes('glass-lid', [['20 cm', 3900], ['24 cm', 4500], ['28 cm', 4900]], 'VK-LID'),
    { subtitle: 'Passend bij je pan.', specs: specs.lid(),
      description: html('Met de glazen deksel van Volkara zie je wat er in de pan gebeurt zonder de deksel op te tillen. Zo blijven warmte en vocht in de pan, terwijl je toch kunt zien of je saus inkookt of je groenten gaar zijn. Kies de maat van je Gehamerde Titanium Pan of hapjespan.', [
        'Gehard glas: meekijken zonder de deksel op te tillen',
        'Houdt warmte en vocht in de pan bij smoren en stoven',
        'Verkrijgbaar in de maten van de Volkara pannen',
        'Maakt van je koekenpan een pan om in te stoven',
      ]) }),
  P(1015, 'titanium-kookgids-ebook', 'Titanium Kookgids (e-book)', 'E-book', ['digital'], [],
    single(0, 1500, 'VK-EBOOK'),
    { subtitle: 'Gratis bij elke bestelling.', description: html('Testproduct voor de preview: een digitaal e-book dat gratis bij elke bestelling wordt gevoegd.', []) }),
];

export const collections = [
  ['all', 'Hele collectie', 'Alles volgens één <em>standaard</em>.', 'Pannen, woks, kookpannen, messen en keukengerei. Allemaal gemaakt vanuit hetzelfde idee: kookgerei zonder coating dat je elke dag met plezier gebruikt.'],
  ['pans', 'Professionele pannen', 'De pan voor <em>elke dag</em>.', 'De Gehamerde Titanium Pan in vier maten, en de hapjespan voor alles wat een hogere rand nodig heeft.'],
  ['cutting-boards', 'Snijplanken', 'Een plank die <em>blijft</em>.', 'Hygiënische titanium snijplanken die niet splijten of trekken.'],
  ['woks', 'Woks', 'Gemaakt voor <em>felle</em> hitte.', 'Een vlakke bodem voor inductie en een diepe kom om ruim in om te scheppen.'],
  ['pots', 'Kookpannen', 'Rustig garen, <em>gelijkmatig</em> warm.', 'Steelpannen, een hapjespan en een kookpan, met goed sluitende deksels.'],
  ['sets', 'Sets', 'Je keuken in één keer <em>compleet</em>.', 'Samengestelde sets die voordeliger zijn dan dezelfde delen los.'],
  ['knives', 'Messen', 'Een snede om <em>zuinig</em> op te zijn.', 'Messen van gelaagd damascusstaal'],
  ['accessories', 'Accessoires', 'De <em>details</em> die het afmaken.', 'Een titanium snijplank, keukengerei van rvs en glazen deksels in de maten van je pannen.'],
  ['bestsellers', 'Bestsellers', 'Hier <em>begin</em> je mee.', 'De stukken waarmee je een Volkara keuken begint.'],
].map(([handle, title, hero, description], i) => ({ id: 500 + i, handle, title, hero, description: `<p>${description}</p>` }));

const L = (title, url, links = []) => ({ title, url, links });
export const menus = {
  'main-menu': [
    L('Collectie', '/collections/all', [
      L('Pannen', '/collections/pans', [L('Gehamerde Titanium Pan', '/products/gehamerde-titanium-pan'), L('Gehamerde Titanium Wok', '/products/gehamerde-titanium-wok'), L('Hapjespan', '/products/saute-pan'), L('Steelpan', '/products/saucepan'), L('Kookpan', '/products/stockpot')]),
      L('Sets', '/collections/sets', [L('Set — 2 pannen', '/products/set-2-pannen'), L('Complete set — 3 pannen', '/products/complete-set'), L("Chef's Collectie", '/products/chefs-collection'), L('Signature Keuken', '/products/signature-kitchen')]),
      L('Messen & accessoires', '/collections/knives', [L('Damascus koksmes', '/products/damascus-chef-knife'), L('Damascus santoku', '/products/santoku-knife'), L('Titanium snijplank', '/products/titanium-board'), L('Keukengerei', '/products/utensil-set'), L('Glazen deksel', '/products/glass-lid')]),
    ]),
    L('VolcanicCore™', '/pages/technology'), L('Ons verhaal', '/pages/about'), L('Vragen', '/pages/veelgestelde-vragen'), L('Contact', '/pages/contact'),
  ],
  'footer-shop': [L('Hele collectie', '/collections/all'), L('Pannen', '/collections/pans'), L('Woks', '/collections/woks'), L('Kookpannen', '/collections/pots'), L('Sets', '/collections/sets'), L('Messen', '/collections/knives'), L('Accessoires', '/collections/accessories')],
  'footer-help': [L('Veelgestelde vragen', '/pages/veelgestelde-vragen'), L('Verzenden en retourneren', '/pages/verzenden-en-retourneren'), L('Bestelling volgen', '/pages/bestelling-volgen'), L('Titanium Kookgids', '/pages/titanium-kookgids'), L('Garantie', '/pages/warranty'), L('Contact', '/pages/contact')],
  'footer-legal': [L('Algemene voorwaarden', '/policies/terms-of-service'), L('Privacyverklaring', '/policies/privacy-policy'), L('Herroepingsformulier', '/pages/herroepen')],
};

export const pages = [
  { handle: 'titanium-kookgids', title: 'De Volkara Titanium Kookgids', template_suffix: null, content: [
    '<p>Koken op titanium is anders dan op een pan met antiaanbaklaag. Niet moeilijker, wel anders. Met deze gids haal je vanaf de eerste keer het beste uit je Volkara pan.</p>',
    '<h2>1. Voor het eerste gebruik</h2>',
    '<p>Was de pan met warm water en een beetje afwasmiddel en droog hem goed af. Wil je, dan kun je de pan kort voorbereiden: verwarm hem op middelhoog vuur, wrijf er een theelepel neutrale olie in, laat afkoelen en veeg hem uit.</p>',
    '<h2>2. Voorverwarmen is alles</h2>',
    '<p>Verwarm de lege pan twee tot drie minuten op middelhoog vuur. Doe de watertest: een druppel water die als een balletje over het oppervlak danst, betekent dat de pan klaar is. Voeg dan pas olie of boter toe.</p>',
    '<h2>3. Laat het eten los laten</h2>',
    '<p>Leg je eten in de pan en laat het liggen. Eiwitten plakken eerst even vast en laten vanzelf los zodra er een korst is gevormd. Ga je te vroeg schuiven, dan plakt het. Geduld geeft de mooiste korst.</p>',
    '<h2>4. Eieren, vis en pannenkoeken</h2>',
    '<p>Gebruik iets meer vet en een iets lager vuur dan bij vlees. Voor eieren: verwarm voor, voeg boter toe tot die schuimt en wacht tot het eiwit stolt voordat je schept.</p>',
    '<h2>5. Hoog vuur, oven en grill</h2>',
    '<p>Titanium kan hoge hitte aan. Schroei vlees dicht op hoog vuur en maak het af in de oven. Let op: de handgreep wordt in de oven heet, gebruik altijd een ovenwant.</p>',
    '<h2>6. Schoonmaken</h2>',
    '<p>Laat de pan iets afkoelen en spoel hem met warm water. Een zachte spons is meestal genoeg; de vaatwasser mag ook. Zit er iets aangekoekt, laat dan een bodem water een minuutje koken en veeg de pan schoon. Regenboogkleurige hittevlekken haal je weg met een scheutje witte azijn.</p>',
    '<h2>7. Patina is normaal</h2>',
    '<p>Na verloop van tijd krijgt het oppervlak een lichte patina en wat gebruikssporen. Dat is geen slijtage van een coating, want die is er niet. Het heeft geen invloed op hoe de pan kookt.</p>',
  ].join('') },
  { handle: 'veelgestelde-vragen', title: 'Veelgestelde vragen', template_suffix: 'faq', content: '' },
  { handle: 'verzenden-en-retourneren', title: 'Verzenden en retourneren', template_suffix: null, content: [
    '<h2>Verzenden</h2>',
    '<p><strong>Gratis verzending.</strong> We verzenden je bestelling gratis. Er komen achteraf geen kosten bij.</p>',
    '<p><strong>Levertijd.</strong> De verwachte levertijd zie je bij het afrekenen. Zodra je pakket onderweg is, krijg je een e-mail met een track-and-tracelink, zodat je precies weet wanneer het komt.</p>',
    '<p><strong>Landen.</strong> Bij het afrekenen zie je naar welke landen we verzenden.</p>',
    '<h2>Retourneren</h2>',
    '<p><strong>30 dagen retour.</strong> Je kunt je bestelling binnen 30 dagen na ontvangst retourneren, zonder opgaaf van reden. Daarmee krijg je meer tijd dan de wettelijke bedenktijd van 14 dagen.</p>',
    '<p><strong>Zo werkt het.</strong> Laat het ons binnen 30 dagen weten via de <a href="/pages/contact">contactpagina</a> of met het <a href="/pages/herroepen">herroepingsformulier</a>, met je ordernummer. Je krijgt de retourinstructies van ons. Stuur het product daarna compleet en goed verpakt terug.</p>',
    '<p><strong>Uitproberen.</strong> Je mag het product uitpakken en bekijken zoals je dat in een winkel zou doen. Gebruik je het meer dan nodig is om het te beoordelen, dan kunnen we een eventuele waardevermindering verrekenen.</p>',
    '<p><strong>Terugbetaling.</strong> We betalen het aankoopbedrag, inclusief de oorspronkelijke verzendkosten, binnen 14 dagen nadat je de herroeping hebt gemeld terug via je oorspronkelijke betaalmethode. We mogen wachten met terugbetalen tot we het product hebben ontvangen.</p>',
    '<h2>Beschadigd of niet in orde?</h2>',
    '<p>Kwam je pakket beschadigd aan, of klopt er iets niet? Maak foto\'s van de verpakking en het product en neem zo snel mogelijk <a href="/pages/contact">contact</a> met ons op. Lees ook over je rechten op de <a href="/pages/warranty">garantiepagina</a>.</p>',
  ].join('') },
  { handle: 'bestelling-volgen', title: 'Bestelling volgen', template_suffix: null, content: [
    '<p><strong>Track en trace.</strong> Zodra je bestelling is verzonden, krijg je een e-mail met een track-and-tracelink. Via die link zie je waar je pakket is en wanneer het wordt bezorgd.</p>',
    '<p><strong>Geen e-mail ontvangen?</strong> Kijk ook in je map met ongewenste e-mail of reclame. Staat er niets? Dan is je bestelling waarschijnlijk nog niet verzonden.</p>',
    '<p><strong>Staat je pakket stil?</strong> Beweegt de status een paar werkdagen niet, neem dan <a href="/pages/contact">contact</a> met ons op en vermeld je ordernummer. We zoeken het voor je uit.</p>',
  ].join('') },
  { handle: 'herroepen', title: 'Herroepingsformulier', template_suffix: null, content: [
    '<p>Wil je je aankoop herroepen binnen de bedenktijd van 14 dagen? Stuur ons dan een bericht via de <a href="/pages/contact">contactpagina</a> (onderwerp "Retourneren") met je ordernummer. Je mag ook dit wettelijke modelformulier gebruiken. Je bent niet verplicht om het te gebruiken.</p>',
    '<h2>Modelformulier voor herroeping</h2>',
    '<p><em>(dit formulier alleen invullen en terugzenden als je de overeenkomst wilt herroepen)</em></p>',
    '<ul>',
    '<li>Aan: Volkara, support@volkara.com</li>',
    '<li>Ik/Wij* deel/delen* u hierbij mede dat ik/wij* onze overeenkomst betreffende de verkoop van de volgende goederen herroep/herroepen*:</li>',
    '<li>Besteld op*/ontvangen op*:</li>',
    '<li>Naam consument(en):</li>',
    '<li>Adres consument(en):</li>',
    '<li>Handtekening consument(en) (alleen wanneer dit formulier op papier wordt ingediend):</li>',
    '<li>Datum:</li>',
    '</ul>',
    '<p>* Doorhalen wat niet van toepassing is.</p>',
  ].join('') },
  { handle: 'about', title: 'Ons verhaal', template_suffix: 'about', content: '' },
  { handle: 'technology', title: 'VolcanicCore™-technologie', template_suffix: 'technology', content: '' },
  { handle: 'contact', title: 'Contact', template_suffix: 'contact', content: '<p>Een vraag over maten, onderhoud of je bestelling? Stuur ons een bericht. We lezen alles zelf en reageren zo snel mogelijk op werkdagen.</p>' },
  { handle: 'warranty', title: 'Garantie en retourneren', template_suffix: null, content: [
    '<p><strong>25 jaar garantie.</strong> Op Volkara pannen krijg je 25 jaar garantie op materiaal- en fabricagefouten bij normaal huishoudelijk gebruik. Normale gebruikssporen, zoals patina of kleine krasjes, en schade door onjuist gebruik vallen hier niet onder. Je wettelijke rechten blijven daarnaast altijd gelden.</p>',
    '<p><strong>Een garantieverzoek indienen.</strong> Neem contact met ons op via de <a href="/pages/contact">contactpagina</a>. Vermeld je bestelnummer, beschrijf wat er aan de hand is en stuur als het kan een paar foto\'s mee. We laten je weten wat de volgende stap is.</p>',
    '<p><strong>30 dagen retour.</strong> Je kunt je bestelling binnen 30 dagen na ontvangst retourneren, zonder opgaaf van reden. Hoe dat werkt, lees je op de pagina <a href="/pages/verzenden-en-retourneren">Verzenden en retourneren</a>.</p>',
  ].join('') },
];

export const articles = [
  { handle: 'perfect-steak-in-titanium', title: 'Zo bak je een steak met een mooie korst in een titanium pan', author: 'Volkara Keuken', published_at: '2026-09-20T09:00:00Z', tags: ['Techniek'],
    excerpt: '<p>Goed voorverwarmen, niet te vroeg omdraaien en op het eind arroseren. Zo krijg je een korst die vanzelf loslaat.</p>',
    content: '<p>Verwarm de pan een paar minuten voor op middelhoog vuur, tot een druppel water over de bodem rolt in plaats van te sissen. Doe er een dun laagje olie in, wacht tot die glinstert en leg dan de steak in de pan.</p><p>Laat hem nu met rust. Zodra de korst gevormd is, laat het vlees vanzelf los. Dan draai je hem om.</p><p>Voeg in de laatste minuut een klont boter, een takje tijm en een gekneusd teentje knoflook toe en schep de schuimende boter steeds over de steak. Laat het vlees daarna even rusten voor je het aansnijdt.</p>' },
  { handle: 'why-we-left-non-stick', title: 'Waarom we geen antiaanbaklaag gebruiken', author: 'Volkara', published_at: '2026-08-02T09:00:00Z', tags: ['Verhaal'],
    excerpt: '<p>Een pan met antiaanbaklaag werkt zolang die laag heel is. Wij wilden een pan zonder laag.</p>',
    content: '<p>Een pan met antiaanbaklaag doet het goed zolang die laag intact is. Maar een laag kan beschadigen en slijten. Wij wilden het andersom: een pan waarbij er geen laag is die kan slijten.</p><p>Daarom is het kookoppervlak van Volkara pannen van titanium, zonder coating. Er zit dus ook geen PFAS of PTFE in. Je kookt met metalen spatels, zet de pan in de oven en daarna in de vaatwasser.</p>' },
  { handle: 'inside-volcaniccore', title: 'Zo is VolcanicCore™ opgebouwd', author: 'Volkara', published_at: '2026-07-11T09:00:00Z', tags: ['Technologie'],
    excerpt: '<p>Laag voor laag: hoe de opbouw van een Volkara pan de warmte verdeelt en vasthoudt.</p>',
    content: '<p>VolcanicCore™ is de naam van de gelaagde opbouw van onze pannen. Elke laag heeft één taak: de kern verdeelt de warmte over de hele bodem en tot in de wand, en het titanium kookoppervlak is waar je eten mee in aanraking komt.</p><p>Het resultaat is een pan die gelijkmatig opwarmt, geschikt is voor alle warmtebronnen en zonder coating werkt. De precieze opbouw vind je in de specificaties bij elk product.</p>' },
];

// Product templates (Shopify template suffix): templates/product.<suffix>.json
const TEMPLATE_SUFFIX = {"gehamerde-titanium-pan": "gehamerde-pan", "gehamerde-titanium-wok": "cookware", "saute-pan": "cookware", "saucepan": "cookware", "stockpot": "cookware", "complete-set": "cookware", "chefs-collection": "cookware", "signature-kitchen": "cookware"};
for (const p of products) p.template_suffix = TEMPLATE_SUFFIX[p.handle] || null;
