# Camel Middle East Grill House — website

Statische website voor Camel aan de Oude Markt 9A in Enschede: HTML, CSS, een beetje JavaScript en één kleine WebGL-shader. Er is geen CMS, framework of tracker en er worden geen cookies gezet. Lettertypen, scripts en foto's staan op de eigen server.

**Bestellen blijft lopen via de bestaande webshop op grillroomcamel.com** (WooCommerce: productpagina met opties → winkelwagen → afrekenen). Deze site vervangt die webshop niet en heeft geen eigen winkelwagen of betaalmodule. Elke bestelknop linkt naar de webshop, en waar de productpagina bekend is direct naar dat gerecht.

```
npm install          # sharp (foto's), Playwright + axe (tests), fonts
npm run images       # photos-src/*.jpg → assets/img (AVIF + WebP, 4 breedtes, zonder EXIF)
npm run build        # genereert ./public uit src/site.mjs en assets/
npm run serve        # lokaal bekijken op http://localhost:4400
npm test             # build + 65 browsertests (5 breedtes, axe, bestelroute, interactie, reduced motion)
npm run preview      # de homepage als één los HTML-bestand: voorbeeld/index.html
npm run single       # de hele site (home + menukaart) als één HTML-bestand: camel-website.html
npm run artifact     # artifact-versie (relatieve paden) in ./artifact, voor de Claude-artifactpagina
```

Upload na `npm run build` de inhoud van **`public/`** (inclusief `.htaccess` voor Apache of `_redirects` voor Netlify-achtige hosts).

## Gegevens invullen

**Bedrijfsgegevens staan in [`src/site.mjs`](src/site.mjs)** (openingstijden, teksten, FAQ, foto's, bestellink). **De menukaart staat apart in [`src/menu.mjs`](src/menu.mjs)**: gerechten, prijzen per formaat en links naar de webshop, met uitleg bovenaan het bestand. Een onbevestigde waarde staat als `todo('…')` en verschijnt op de site als een gestippeld gemarkeerde placeholder. Zolang `draft: true` staat:

- krijgt elke pagina `noindex`;
- blokkeert `robots.txt` alles;
- wordt er geen structured data uitgestuurd;
- staat er bovenaan een conceptbalk.

**Livegang:**

1. Vul alle todo's in.
2. Leg de prijzen naast de webshop en zet `menu.pricesVerified: true`.
3. Zet `hoursVerified: true` en `draft: false`.
4. Draai `npm test`. Die faalt zolang er iets openstaat.
5. Upload `public/`.

## Structuur

```
src/site.mjs          bedrijfsgegevens, teksten, foto's (met bron per gegeven)
src/menu.mjs          de menukaart (wordt vervangen door de menukaart van de eigenaar)
build.mjs             templates; bouwt public/ (home, menukaart, privacy, 404, /contact-redirect, robots, sitemap, og.jpg)
assets/css/main.css   design system (tokens bovenaan) en componenten
assets/js/main.js     veren-engine, sticky stack, vonken-naden, hoogtelijnen, rail, menu-zoeken, lightbox, events
assets/js/flame.js    "Camel Flame": opstijgende vonken in de hero (WebGL, 1 draw call)
photos-src/           originele foto's van de zaak (EXIF verwijderd)
tests/e2e.mjs         browsertests
docs/rapportage.md    audit, keuzes, testresultaten, open punten
```
