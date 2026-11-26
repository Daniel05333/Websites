# The Perfect Stage: concept-website + dashboard-preview

Concept voor The Perfect Stage uit Rotterdam: bruidsbanken, weddingstages, bloemenbogen, trapbloemen en special effects. Het bestaat uit een statische one-page site in crème en goud met het eigen logo, en een dashboard-preview voor het beheren van aanvragen.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public (index.html + dashboard.html)
npm test           # build + 35 browsertests (layout, axe, filters, configurator, dashboard)
npm run images     # snijdt de foto's en het logo opnieuw uit bron/ (Python + Pillow)
npm run preview    # voorbeeld/index.html + voorbeeld/dashboard.html (losse bestanden)
```

## Website

- **3D-hero:** vijf boogpanelen met hun eigen stages, in een halve cirkel als op een podium. Ze rijzen op bij het laden, waaieren uit tijdens het scrollen en volgen de muis. Er dwarrelen bloemblaadjes.
- **Actiebalk** "Ontvang tot €300 korting, vraag naar de voorwaarden" (uit de vastgezette post). Klikken vinkt de korting aan in de aanvraag.
- **Diensten:** bruidsbanken, weddingstages, bloemenbogen, trapbloemen en special effects, plus welkomstborden, inkomsthal, backdrops, bogen en 360 graden.
- **12 collecties** (Wonderland, Vaiana, Cleopatra, Cinderella, Aladdin, Aurora, Snow White, Jasmine, Bella, Rapunzel, Dreamydecor, Cinderella's C.). Klikken neemt de collectie mee in de aanvraag.
- **Trapbloemen** als groot beeld, **portfolio** met 24 foto's, filters en vergrootweergave, en de **werkwijze**.
- **Configurator in 4 stappen:** dag (datum, gasten, soort feest), zaal, wensen (collectie, onderdelen, kleuren, korting) en contact. Een overzicht loopt mee. Aan het eind opent WhatsApp (+31 6 83484086) met alles ingevuld.

## Dashboard-preview (dashboard.html)

- **Aanvragen** als pijplijn (Nieuw → In gesprek → Offerte verstuurd → Geboekt), met waarschuwing als een datum al bezet is en een label voor de €300-actie.
- **Detailkaart** per aanvraag: status wijzigen en een interne notitie maken.
- **Planning** per maand: geboekt, optie en volle dagen.
- **Collecties:** welke collecties en onderdelen het populairst zijn.
- **Cijfers:** conversie, gemiddeld aantal gasten en events per maand.
- Alles is **demo**: verzonnen stellen en zalen (gemarkeerd als "voorbeeld"). Aanvragen uit de configurator verschijnen erin (in dezelfde browser).

## Nog te bevestigen

- Welke foto's bij welke collectie horen (nu sfeerbeelden, zo gemarkeerd), en een korte omschrijving per collectie.
- Prijzen of "vanaf"-prijzen, en de voorwaarden van de €300-actie.
- De werkgebied-tekst ("Rotterdam en omgeving") en wat "360 graden" en "special effects" precies omvatten.
- Toestemming voor de foto's. Bruidsparen, gasten en borden met namen zijn bewust weggelaten.
- Domein. De site staat op noindex.
