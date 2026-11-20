# GetWhite: website

Statische website (HTML, CSS en JavaScript zonder bibliotheken) voor GetWhite, tandenbleken in Enschede. Geen CMS, framework, trackers of cookies. Lettertypen, scripts en foto's staan op de eigen server.

```
npm install        # alleen voor tests (Playwright + axe) en de lettertypen
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4500
npm test           # build + 27 browsertests (5 breedtes, axe, calculator, slider, zonder JS, reduced motion)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de homepage als één los HTML-bestand in voorbeeld/index.html
```

Upload na `npm run build` de inhoud van **`public/`** naar elke webhosting.

## Wat er op de site staat

- **3D-hero:** een glanzende kies, live gerenderd in WebGL (raymarching in één shader, geen bibliotheek). Tijdens het scrollen draait de tand en wordt hij van ivoor naar stralend wit, met LED-gloed, twinkels en een kleurenwaaier die meeloopt. Hij volgt ook de muis. Zonder WebGL verschijnt een SVG-tand. Bij "minder beweging" staat de witte tand er direct en stil.
- **Resultaten:** 7 voor/na-foto's uit de highlight "Resultaten" met sleepbare vergelijkers (ook met het toetsenbord te bedienen) en 3D-kantelkaarten.
- **Prijscalculator:** alleen of duo, Basic of Ultra White, 2–10 sessies, polijsten. De prijs telt animerend mee en de knop opent WhatsApp met de keuze al ingevuld. Daaronder staan alle prijstabellen.
- Werkwijze, "goed om te weten" (sessies, hoelang het wit blijft, certificaat), nazorg, afspraakregels, FAQ, slot-CTA en een zwevende WhatsApp-knop op mobiel.

## Gegevens

**Alles staat in [`src/site.mjs`](src/site.mjs).** De teksten en prijzen komen uit het Instagram-profiel en de highlights (zie `bron/`).

Nog te bevestigen voor livegang:

- **Domein:** `url` invullen en dan `draft: false` zetten. Zolang `draft: true` staat, krijgt elke pagina `noindex` en blokkeert `robots.txt` alles.
- **Polijsten bij duo:** de calculator telt + €10 per boeking. Als het + €10 per persoon is, pas dat aan in `assets/js/main.js` (zoek op `P.polish`).
- **Duo-prijslijst:** daar staat een `*` achter "prijs voor 2 personen" zonder uitleg. Vraag na wat die voorwaarde is.
- **Adres en openingstijden:** het profiel noemt alleen "Enschede". De site verwijst daarom naar WhatsApp/DM.
- **Reviews:** de highlight "Reviews" zat niet bij de screenshots. Voeg alleen echte reviews toe, met toestemming.
- **Foto's van klanten:** ze komen uit de eigen Instagram-posts. Vraag de klanten wel of hun foto ook op de website mag.
- **Claims:** "geen resultaat, geld terug" (5 sessies) en "gecertificeerd" staan op de site zoals GetWhite ze zelf communiceert.

## Structuur

```
src/site.mjs            alle inhoud, prijzen en bedrijfsgegevens
build.mjs               templates + bouwt public/ (index, 404, robots)
assets/css/main.css     design system (tokens bovenaan) en componenten
assets/js/main.js       WebGL-tand, scroll, vergelijkers, calculator, kantelkaarten
assets/img/             foto's en logo, gesneden uit de Instagram-screenshots
assets/fonts/           Manrope + Instrument Serif, zelf gehost (SIL OFL)
bron/                   de aangeleverde Instagram-screenshots
tools/                  lokale server, afbeeldingen, voorbeeldbestand
tests/e2e.mjs           browsertests
```
