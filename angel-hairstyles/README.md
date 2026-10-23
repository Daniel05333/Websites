# Angel Hairstyles — website

Statische website (HTML, CSS, een beetje JavaScript en één WebGL-shader). Geen CMS, framework, trackers, cookies of externe verzoeken: lettertypen en scripts staan op de eigen server.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4400
npm test           # build + browsertests (5 breedtes, axe, interactie, reduced motion)
node tools/build-preview.mjs voorbeeld/index.html   # de homepage als één los HTML-bestand
```

Upload na `npm run build` de inhoud van **`public/`** naar elke webhosting.

## Gegevens invullen

**Alles staat in [`src/site.mjs`](src/site.mjs).** Elke onbevestigde waarde staat er als `todo('…')` en verschijnt op de site als een gestippeld gemarkeerde placeholder. Zolang `draft: true` staat, krijgt elke pagina `noindex`, blokkeert `robots.txt` alles, en wordt er geen structured data uitgestuurd.

Livegang: vul alle todo's in → zet `draft: false` → `npm test` (faalt zolang er nog todo's open staan) → upload `public/`.

- **Afspraken:** er is geen online agenda; alle afspraakknoppen openen WhatsApp (06 16509984) met een ingevuld bericht per behandeling. Komt er een boekingssysteem, vul dan `booking.url` in en alle knoppen gaan daarheen.
- **Foto's:** zet echte foto's in `assets/img/`; vul `portfolio` met `{ src, w, h, alt }`. Fotovlakken met "Foto volgt" zijn bewust leeg — er staan geen stock- of AI-beelden als klantresultaat op de site.
- **Behandelingen:** de vijf kaarten zijn concept-categorieën uit de briefing (`confirmed: false` → label "concept"). Verwijder wat de salon niet doet.

## Structuur

```
src/site.mjs          alle inhoud en bedrijfsgegevens
build.mjs             templates + bouwt public/ (index, privacy, 404, robots, sitemap)
assets/css/main.css   design system (tokens bovenaan) en componenten
assets/js/main.js     menu, reveals, parallax, hoofdstukbalk, lightbox, mobiele afspraakbalk
assets/js/silk.js     WebGL-achtergrond "Signature Motion" (haarstrengen, tint verloopt met scroll)
assets/fonts/         Italiana + Outfit, zelf gehost (SIL OFL)
tests/e2e.mjs         browsertests
docs/rapportage.md    audit, keuzes, testresultaten, open punten
```
