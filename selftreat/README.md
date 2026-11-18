# Selftreat.nl: concept-website

Concept voor Selftreat.nl, het platform waarop je beauty experts bij jou in de buurt of aan huis vindt en boekt. Het is een statische one-page site (HTML, CSS en JavaScript zonder bibliotheken) in de pastelkleuren en het ST-logo van de posts. Er zijn geen trackers en geen cookies.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:5000
npm test           # build + 30 browsertests (5 breedtes, axe, zoeken, filteren, boeken, zonder JS, reduced motion)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** zachte pastelblobs (lila, mint, lime, roze, parelwit) in WebGL die vloeiend in elkaar overlopen, met een parelmoerglans. Ze volgen de muis en drijven uit elkaar tijdens het scrollen.
- **Zoekbalk:** behandeling, provincie en "aan huis".
- **Categorieën:** Hair, Nails, Lashes & brows, Skin, Body, PMU & make-up, Injectables, Tanden bleken.
- **Provincies** als pastel-cirkels zoals de highlights, met het aantal salons.
- **Salons** met filters, actieve filterchips en een lege-resultatenmelding.
- **Salonpagina per salon** met foto's, behandelingen, dag en tijd en een naamveld. Na "Boek" verschijnt een samenvatting.
- **Zo werkt het** en **Voor salons** (aansluiten).

## Belangrijk voordat je dit laat zien

- **De salons zijn voorbeelden.** Ze zijn gebaseerd op de post "Nieuwe salons aangesloten" (soort en plaats, zonder namen) en staan op de site als "Voorbeeld" gemarkeerd. Vervang ze in `src/site.mjs` door de echte salons.
- **Boeken is een demo.** Er is geen agenda of backend: na "Boek" staat er dat er niets geboekt is. Echt boeken vraagt een koppeling met een agendasysteem of een eigen backend.
- **Prijzen** per behandeling staan op "prijs volgt".
- **Injectables:** reclame voor receptplichtige middelen (zoals botox) richting publiek is in Nederland verboden. De site noemt daarom alleen "Consult injectables", zonder merknamen of prijzen.
- **Foto's** komen uit de eigen posts (met ST-logo).
