# Studio Nazz: concept-website

Concept voor Studio Nazz, aesthetics & academy. Het is een statische site (HTML, CSS en JavaScript zonder bibliotheken) op één pagina, met de academy als eigen sectie. Er zijn geen trackers en geen cookies. Lettertypen, scripts en foto's staan op de eigen server.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4600
npm test           # build + 29 browsertests (5 breedtes, axe, tabs, boeken, slider, zonder JS, reduced motion)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** een gouden wimperwaaier op canvas, met eigen 3D-projectie en zonder bibliotheek. De wimpers groeien één voor één aan. Tijdens het scrollen draait het ooglid en waaieren de volume-fans open. De waaier volgt ook de muis. Er zweeft goudstof omheen. Bij "minder beweging" staat de waaier stil.
- **Behandelingen per categorie** (Lashes, Brows, Skin) in tabs, met per behandeling een knop die het boekingsvenster opent met die behandeling al ingevuld.
- **Portfolio:** een horizontale 3D-galerij (coverflow) die je met de muis kunt slepen.
- **Brow tint voor & na:** drie sleepbare vergelijkers.
- **Bring a Friend**, de academy-teaser en een slot-CTA.
- **Academy-sectie** (menu "Academy"): de lesonderdelen, 1-op-1 vs. groepscursus, de private courses (1 of 2 dagen), de stappen van aanmelding tot certificaat, en bij elke cursus een aanmeldknop.
- **Boeken:** een venster waarin de klant een behandeling of cursus, een voorkeursdag, een dagdeel en haar naam kiest. Het bericht wordt gekopieerd en Instagram-DM opent. Er wordt niets automatisch bevestigd: Studio Nazz bevestigt zelf.

## Nog in te vullen (src/site.mjs)

Alles staat in [`src/site.mjs`](src/site.mjs). Waarden met `todo('…')` tonen op de site "op aanvraag" of "omschrijving volgt".

- **Prijzen** van alle behandelingen en cursussen. Die stonden niet in de screenshots.
- **Omschrijving van PhiLings.** Ook de teksten bij microneedling, plasmapen en facials door de eigenaar laten nakijken.
- **Adres, plaats, WhatsApp en e-mail.**
- **Online agenda:** vul `bookingUrl` in (bijvoorbeeld Salonized of Treatwell). Dan gaan alle Boek-knoppen daarheen en verdwijnt het DM-venster.
- **Domein:** vul het in en zet daarna `draft: false`. Zolang de site op concept staat, krijgt elke pagina `noindex` en blokkeert `robots.txt` alles.
- **Bring a Friend:** zet `promo.active: false` als de actie voorbij is.
- **Foto's:** de foto's komen uit de eigen Instagram-posts (met SN-watermerk). Laat de eigenaar bevestigen dat ze op de website mogen. De Bring a Friend-poster is als AI-content gemarkeerd en is daarom niet gebruikt; de actie is in HTML nagebouwd.
- **Whitening Studio:** die highlight stond in het profiel, maar er was geen inhoud van. Die dienst kan nog als extra categorie worden toegevoegd.

## Structuur

```
src/site.mjs            alle inhoud: behandelingen, cursussen, actie, gegevens
build.mjs               templates + bouwt public/ (index, 404, robots)
assets/css/main.css     design system (tokens bovenaan) en componenten
assets/js/main.js       wimperwaaier, scroll, tabs, galerij, vergelijkers, boeken
assets/img/             foto's en logo, gesneden uit de Instagram-screenshots
assets/fonts/           Bodoni Moda, Jost, Pinyon Script (SIL OFL)
bron/                   de aangeleverde Instagram-screenshots
tools/                  lokale server, afbeeldingen, voorbeeldbestanden
tests/e2e.mjs           browsertests
```

## Drie ontwerpvarianten + dashboard

`npm run variants` bouwt `public/varianten/` en losse bestanden in `voorbeeld/varianten/` (houd die samen in één map, ze linken naar elkaar):

| Bestand | Ontwerp | Boekingssysteem |
|---|---|---|
| `index.html` | Keuzepagina voor de klant | – |
| `noir.html` | A · Noir: de bestaande site, donker, 3D-wimperwaaier | Stappenwizard in een pop-up |
| `blush.html` | B · Blush: licht en zacht, 3D-fotostapel | Weekagenda op de pagina |
| `atelier.html` | C · Atelier: redactioneel, 3D-fotoring | Chat-assistent |
| `dashboard.html` | Dashboard-preview: overzicht, agenda, klanten, boekingen, academy | – |

In het dashboard staat onder **Beschikbaarheid** een slotplanner: Studio Nazz kiest een slotlengte (10, 15, 20, 30 of 60 min) en tikt of sleept per dag over de slots om ze beschikbaar of niet beschikbaar te maken. Er zijn knoppen voor hele dagen (Aan, Uit, terug naar standaard), "Kopieer week → volgende week" en een standaardweek. Geboekte slots zijn vergrendeld. Rechts toont een telefoonmodel de klantweergave: welke tijden klanten per behandeling kunnen boeken; een testboeking verschijnt direct in het rooster. Na **Opslaan** volgen ook de drie varianten deze slots (demo, alleen in deze browser).

De boekingssystemen zijn demo's (`assets/js/booking.js`): vrije tijden en duur zijn voorbeelden, er wordt niets echt geboekt. Boekingen worden alleen in de browser bewaard, zodat het dashboard ze als "Nieuw via de website" toont. Het dashboard (`assets/js/dashboard.js`) gebruikt verzonnen klanten en voorbeeldprijzen. Voor livegang is een echte agenda/backend nodig (bijv. Salonized of een eigen systeem).
