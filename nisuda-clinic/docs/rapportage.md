# Nisuda Clinic — rapportage

## 1. Audit

**Aangeleverd:** 13 screenshots van Instagram (@nisudaclinic): profiel en raster, highlights "Lipfiller", "Prijzen", "Plasmalift" en "Rules". De opdrachttekst ging over "Make-up by Erva"; er waren geen Erva-foto's, -logo of Bloomz-project beschikbaar. Op de vraag welke klant bedoeld was, is gekozen voor **Nisuda Clinic**, met de kwaliteitseisen uit de opdracht.

**Wat de screenshots opleveren**

| Bron | Gebruikt voor |
|---|---|
| Bio | Positionering: "Pijnloos. Definitief. Ontharing.", vrouwen & mannen, Enschede, "Info? DM!" |
| Logo (profielfoto) | Uitgesneden tot transparant masker (`logo.png`), zodat het in elke kleur kan worden gebruikt |
| Raster | 16 foto's: receptie met logowand, behandelfoto's, voor/na-resultaten |
| Prijslijst vrouw/man | Laserprijzen vanaf 01-02-2026 |
| Plasmalift + overige | Prijslijsten november 2024 (gemarkeerd als te bevestigen) |
| Lipfiller special | € 169,99 per ml, € 159,99 per ml samen; technieken; "onder BIG-geregistreerde specialist" |
| Botox-prijslijst | Alleen de zones; prijzen bewust niet (zie §4) |
| Proefbehandeling | Gratis proefbehandeling oksel, 8 september 2026 |
| Rules | Herschreven tot het hoofdstuk "Voorbereiding" |

**Bewust niet gebruikt**
- De gezichten in de botox- en lipfiller-flyers: die zijn gelabeld als AI-content en tonen geen werk van de kliniek.
- De tegel met "Laser Lounge"-handdoek: een ander merk.
- Tekstposts ("Care for best results", "Smooth skin every day"): de tekst wordt door het raster afgesneden.
- "Dè beste en goedkoopste in Enschede": een onbewijsbare superlatief die ook botst met de premium uitstraling.

**Kwaliteit van het beeld:** de rasterfoto's zijn ~394 × 526 px. Ze worden daarom nooit schermvullend getoond: maximaal ~340 px breed in de hero en in een raster van vier kolommen. Voor een grotere hero zijn originele foto's van de kliniek nodig.

## 2. Ontwerprichting: "Licht op huid"

Een laserkliniek draait om licht en huid. De site vertaalt dat naar ivoor, zand en champagne, met espresso als contrast en een gedempt rozé (afgeleid van de eigen Instagram-flyers) als accent. Het gouden lijnwerk uit de prijslijsten komt terug als haarlijnen.

- **Typografie:** Bodoni Moda (Didone, editorial, sluit aan op de schreefletters in het logo) op optische grootte 28, zodat de haarlijnen ook groot leesbaar blijven. Daarnaast Jost (geometrisch, rustig). Beide zelf gehost.
- **Signatuur: 3D-compositie in de hero.** Vijf lagen op verschillende diepte (logo-watermerk, boog-lijn, receptiefoto, portret in boogvorm, handstuk-foto, glazen bol, glazen kaart met de actie). De rig volgt de cursor; bij scrollen neemt de diepte toe. Een **laserlijn** scant over het portret, de enige doorlopende animatie op de site. Op touch beweegt de compositie rustig vanzelf. Alles is CSS 3D in één rAF-lus; er is geen Three.js nodig.
- **Doorlopende secties:** de donkere prijzensectie en de lichte sectie erna schuiven met afgeronde hoeken over elkaar heen, als doeken, in plaats van losse blokken.
- **Beweging:** koppen onthullen regel voor regel, foto's openen met een clip-path-masker en zoomen terug, de introtekst licht woord voor woord op tijdens het scrollen, resultaatkaarten kantelen met lichtval, knoppen zijn magnetisch, en de behandelingenindex toont een zwevende, meedraaiende voorbeeldkaart bij de cursor. In de finale staat het logo in twee dieptelagen.
- **Anders dan eerdere projecten:** geen WebGL-achtergrond, geen letter-voor-letter-titels en geen aangepaste cursor (Angel Hairstyles); de compositie, het palet en de sectievolgorde zijn eigen.

## 3. Opbouw van de homepage

Hero → 01 De kliniek → 02 Behandelingen (index met prijs-vanaf, klik opent het juiste prijstabblad) → 03 Resultaten (filter + lightbox) → 04 Prijzen (6 tabbladen, actiekaart) → 05 Voorbereiding → 06 Ervaringen (placeholder) → 07 Afspraak (formulier) → finale → footer. Daarnaast `/privacy/` en een 404-pagina.

**Afspraakformulier:** keuze uit acht behandelingen; bij laser vrouw/man met zonekeuze en een live prijsindicatie (fullbody vervangt losse zones, met een tip zodra losse zones duurder worden); bij plasmalift zonekeuze, bij lipfiller ml en "samen". Validatie met foutsamenvatting (krijgt focus) en meldingen per veld. Zonder endpoint toont het formulier eerlijk "Er is nog niets verstuurd" met het klaargezette bericht, een kopieerknop en een knop om de Instagram-DM te openen. Alle afspraakknoppen op de site kunnen een behandeling voorselecteren.

## 4. Inhoudelijke en juridische punten

- **Botox-reclame.** Botulinetoxine is receptplichtig; publieksreclame ervoor is in Nederland verboden (Geneesmiddelenwet, toezicht IGJ). De kliniek post de prijzen op Instagram. De site noemt de merknaam niet en toont geen prijzen ("Rimpelbehandelingen — na consult"). Dit staat als instelling (`showPrices`) in `src/site.mjs` en is getest. Laat dit juridisch toetsen.
- **Claims** zoals "pijnloos" en "definitief" komen letterlijk uit de eigen bio van de kliniek. Bij de resultaten staat "Resultaten verschillen per persoon en per huidtype".
- **Voor/na-foto's** zijn al door de kliniek gepubliceerd. Controleer wel of die toestemming ook voor de website geldt.

## 5. Tests (29-10-2026)

`npm test`: **55 van 55 geslaagd** (Chromium 1243, axe-core 4.14).

- Geen horizontale scroll, consolefouten of kapotte verzoeken op 3 pagina's × 5 breedtes (320, 390, 768, 1024, 1440 px), met mobiele emulatie onder 768 px.
- axe WCAG 2.1 A/AA + best practices: 0 ernstige of kritieke overtredingen op alle pagina's, mobiel en desktop.
- Eén h1, alle ankers bestaan, alle afbeeldingen laden, geen externe verzoeken, noindex en robots in conceptmodus, geen JSON-LD als concept.
- Prijzen op de site komen overeen met `src/site.mjs`; het woord "botox" staat niet op de pagina.
- 3D-hero: de rig krijgt diepte en reageert op de muis.
- Behandeling-link opent het juiste prijstabblad; tabs werken met pijltjestoetsen en Home/End; het filter toont alleen de gekozen categorie; de lightbox werkt met pijltjes, Escape en geeft de focus terug.
- Formulier: leeg versturen, voorselectie vanuit de hero, prijsindicatie (Oksels + Benen = € 65), fullbody, man-prijslijst, ongeldige telefoon en e-mail, overdracht zonder endpoint, "gegevens aanpassen", endpoint 200 (JSON gecontroleerd) en endpoint 500 (geen nepbevestiging).
- Mobiel menu (focus, Escape, focus terug), mobiele afspraakknop, klikgebieden ≥ 44 px.
- Reduced motion: alle inhoud direct zichtbaar, de laserlijn staat uit. Zonder JavaScript: alle inhoud zichtbaar.

Visueel gecontroleerd met screenshots op 1440 px en 390 px (hero, alle secties, hover-voorbeeld, kantelkaarten, formulierstatus, finale). Screenshots staan in `docs/screens/`.

**Niet getest:** Safari/iOS en Firefox, echte toestellen, Lighthouse, en echte verzending naar een backend (die is er niet).

## 6. Open punten voor livegang

1. Adres, postcode en telefoonnummer (de footer toont nu placeholders), plus eventueel WhatsApp en e-mail.
2. Domeinnaam (`url`) voor canonical, sitemap en og:image.
3. Een formulier-endpoint, of de keuze om bij Instagram-DM te blijven.
4. Bevestigen dat de plasmalift- en "overige" prijzen (november 2024) nog kloppen, en de prijs van microneedling.
5. Is de gratis proefbehandeling nog actief?
6. Echte reviews, met toestemming.
7. Juridische toets: injectables-communicatie en privacyverklaring (die is nu een technische beschrijving).
8. Liefst originele foto's in hoge resolutie (receptie, behandelruimte, team) voor een grotere hero.
