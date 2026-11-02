# Nisuda Clinic — website

Statische website (HTML, CSS en JavaScript zonder bibliotheken) voor Nisuda Clinic, laser- en beautykliniek in Enschede. Geen CMS, framework, trackers of cookies; lettertypen, scripts en foto's staan op de eigen server.

```
npm install        # alleen voor tests (Playwright + axe) en de lettertypen
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4400
npm test           # build + 55 browsertests (5 breedtes, axe, interactie, formulier, reduced motion, zonder JS)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
node tools/build-preview.mjs voorbeeld/index.html   # de homepage als één los HTML-bestand
```

Upload na `npm run build` de inhoud van **`public/`** naar elke webhosting.

## Gegevens invullen

**Alles staat in [`src/site.mjs`](src/site.mjs).** Onbevestigde waarden staan als `todo('…')` en verschijnen op de site als gemarkeerde placeholder. Zolang `draft: true` staat, krijgt elke pagina `noindex`, blokkeert `robots.txt` alles en wordt er geen structured data uitgestuurd.

Livegang: vul alle todo's in → zet `draft: false` → `npm test` (faalt zolang er nog todo's open staan) → upload `public/`.

- **Afspraken:** er is geen online agenda en geen formulier-backend. Het formulier valideert en zet de aanvraag klaar als bericht dat de bezoeker via een Instagram-DM verstuurt (kopiëren + DM openen). Er wordt nooit een nepbevestiging getoond.
  - `form.endpoint` invullen (Formspree, Web3Forms, eigen script…) → het formulier POST JSON en toont alleen bij HTTP 2xx een bevestiging.
  - `contact.whatsapp` / `contact.email` invullen → extra verzendknoppen.
- **Prijzen:** komen uit de Instagram-highlights (zie `bron/`). Laser vrouw/man gelden vanaf 01-02-2026; de plasmalift- en "overige" prijslijst is van november 2024 en staat gemarkeerd als te bevestigen.
- **Injectables:** `showPrices: false`. Publieksreclame voor receptplichtige geneesmiddelen (zoals botulinetoxine) is in Nederland verboden; daarom noemt de site geen merknaam en geen prijzen, alleen de zones en "na consult". Laat dit juridisch toetsen voordat je het aanzet.
- **Actie:** `offer.active` zet de gratis proefbehandeling (oksel, gepost op 8 september 2026) aan of uit, overal tegelijk.
- **Reviews:** `reviews` is leeg; in conceptmodus staat er een gemarkeerd vlak. Voeg alleen echte reviews toe, met toestemming.

## Structuur

```
src/site.mjs            alle inhoud, prijzen en bedrijfsgegevens
build.mjs               templates + bouwt public/ (index, privacy, 404, robots, sitemap)
assets/css/main.css     design system (tokens bovenaan) en componenten
assets/js/main.js       3D-hero, scroll, kantelkaarten, voorbeeldkaart, filters, lightbox, tabs, formulier
assets/img/             foto's en logo, gesneden uit de Instagram-screenshots
assets/fonts/           Bodoni Moda + Jost, zelf gehost (SIL OFL)
bron/                   de aangeleverde Instagram-screenshots (bron van foto's, prijzen en regels)
tools/                  lokale server, afbeeldingen, voorbeeldbestand
tests/e2e.mjs           browsertests
docs/rapportage.md      audit, ontwerpkeuzes, testresultaten, open punten
```
