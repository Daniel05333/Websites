# Rijschool Linkerbaan — website

Een gewone statische website (HTML, CSS en een beetje JavaScript), zonder CMS, framework, Shopify, trackers of externe scripts.

```
npm install        # alleen nodig voor tests en de afbeeldingsgenerator
npm run build      # genereert ./public uit src/ en assets/
npm run serve      # lokaal bekijken op http://localhost:4400
npm test           # build + statische controle + browsertests (Chromium + axe)
```

Upload na `npm run build` de inhoud van **`public/`** naar elke webhosting.

## Gegevens aanpassen

**Alle bedrijfsgegevens staan op één plek: [`src/data/site.mjs`](src/data/site.mjs).** Daarin staan contactgegevens, WhatsApp, het formulier-endpoint, foto's, pakketten en prijzen, het werkgebied, het stappenplan, de FAQ en het menu. Na een wijziging draai je `npm run build`; alle pagina's, de vergelijkingstabel, de gestructureerde data en de sitemap worden dan bijgewerkt.

- **Nieuw pakket:** voeg een object toe aan `packages`.
- **Foto toevoegen:** zet het bestand in `assets/img/` en vul `photos.hero` of `owner.photo` in.
- **Formulier koppelen:** vul `form.endpoint` in (zie [docs/03-oplevering.md](docs/03-oplevering.md)).

## Structuur

```
src/data/site.mjs          centrale inhoud en configuratie
src/components/            layout (head, header, footer), secties, iconen
src/pages/pages.mjs        paginasamenstelling + SEO-metadata
assets/css/main.css        design system (tokens bovenaan) en componenten
assets/js/main.js          menu, scroll-animaties, sticky CTA, formulier
assets/fonts/              zelf gehoste variabele fonts (OFL)
build.mjs                  bouwt public/ (+ sitemap.xml, robots.txt, .htaccess)
tools/                     lokale server, screenshots, OG-afbeeldinggenerator
tests/                     statische controle en browsertests
docs/                      audit, designrichting, oplevering en open punten
```

## Documentatie
1. [Audit](docs/01-audit.md)
2. [Designconcepten, keuze en design system](docs/02-designrichting.md)
3. [Oplevering, tests en wat nog bevestigd moet worden](docs/03-oplevering.md)
