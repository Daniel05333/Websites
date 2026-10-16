# NEXD Media — website

Statische website voor NEXD Media met een interactieve 3D-hero, *The Conversion Engine*. Geen CMS, geen framework, geen trackers of externe scripts.

```
npm install        # build-tools en testdependencies
npm run build      # genereert ./public uit src/ en assets/
npm run serve      # lokaal bekijken op http://localhost:4500
npm test           # build + statische controle + browsertests (Chromium + axe)
npm run shoot      # screenshots naar docs/screenshots
node tools/make-images.mjs   # og-image, logo en apple-touch-icon opnieuw genereren
node tools/build-preview.mjs voorbeeld/nexd-media-website.html   # alle pagina's in één deelbaar bestand
```

Upload na `npm run build` de inhoud van **`public/`** naar de hosting.

## Gegevens aanpassen

Alle bedrijfsgegevens staan op één plek:

- [`src/data/site.mjs`](src/data/site.mjs): contact, pakketten en prijzen, cases, team, FAQ en het formulier-endpoint.
- [`src/data/services.mjs`](src/data/services.mjs): de inhoud van de dienstpagina's.

Na een wijziging draai je `npm run build`. Pagina's, structured data en sitemap worden dan bijgewerkt.

## Structuur

```
src/data/              inhoud en configuratie
src/components/        layout (head, header, footer), secties, iconen
src/pages/pages.mjs    paginasamenstelling + SEO-metadata
src/engine/engine.js   de 3D-hero (three.js), apart gebundeld met esbuild
assets/css/main.css    design system (tokens bovenaan) en componenten
assets/js/main.js      menu, reveals, aanpak-stapel, keuzehulp, formulier, 3D-loader
build.mjs              bouwt public/ (+ sitemap, robots, .htaccess met 301's)
tools/                 lokale server, screenshots, afbeeldingsgenerator
tests/                 statische controle (incl. claims-guard) en browsertests
docs/                  audit, designrichting, oplevering en open punten
```

## Documentatie

1. [Audit van de huidige website](docs/01-audit.md)
2. [Designconcepten, keuze en design system](docs/02-designrichting.md)
3. [Oplevering, tests en wat nog bevestigd moet worden](docs/03-oplevering.md)

Licenties van fonts (SIL OFL) en three.js (MIT) staan in [`docs/licenses/`](docs/licenses).
