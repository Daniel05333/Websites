# Moso Barbershop — website

Statische website (HTML, CSS en JavaScript zonder bibliotheken) voor Moso Barbershop, Utrechtstraat 114, Alphen aan den Rijn. Geen CMS, framework, trackers of cookies; lettertypen, scripts en foto's staan op de eigen server.

```
npm install        # alleen voor tests (Playwright + axe) en de lettertypen
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4400
npm test           # build + 55 browsertests (5 breedtes, axe, interactie, formulier, reduced motion, zonder JS)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
node tools/build-preview.mjs voorbeeld/index.html   # de homepage als één los HTML-bestand
```

Upload na `npm run build` de inhoud van **`public/`** naar elke webhosting.

## Gegevens aanpassen

**Alles staat in [`src/site.mjs`](src/site.mjs)**: prijzen, openingstijden, adres, telefoon, cuts in de galerij. Onbevestigde waarden staan als `todo('…')` en zijn op de site gemarkeerd. Zolang `draft: true` staat, krijgt elke pagina `noindex` en blokkeert `robots.txt` alles.

Livegang: vul de todo's in → `draft: false` → `npm test` → upload `public/`.

- **Afspraken:** er is geen online agenda en geen formulier-backend. Het formulier valideert (o.a. gesloten op zondag, voorkeurstijden binnen de openingstijden) en zet de aanvraag klaar: bellen, bericht kopiëren of Instagram-DM. Er wordt nooit een afspraak "bevestigd".
  - `booking.url` → alle afspraakknoppen gaan naar de online agenda (Salonized, Treatwell…).
  - `form.endpoint` → het formulier POST JSON en toont alleen bij HTTP 2xx een ontvangstbevestiging.
  - `contact.whatsapp` → extra WhatsApp-knop (alleen invullen als het nummer WhatsApp gebruikt).
- **Open/gesloten:** wordt in de browser berekend uit `hours` (Nederlandse tijd). Feestdagen kent de site niet; dat staat erbij vermeld.
- **Duur per dienst** staat niet op de prijslijst en is als placeholder gemarkeerd.
- **Reviews:** `reviews` is leeg; alleen echte reviews toevoegen.

## Structuur

```
src/site.mjs            alle inhoud en bedrijfsgegevens
build.mjs               templates + bouwt public/ (index, privacy, 404, robots, sitemap)
assets/css/main.css     design system (tokens bovenaan) en componenten
assets/js/main.js       3D-hero, honingraatlicht, cuts-galerij, status, lightbox, formulier
assets/img/             foto's en logo uit de screenshots; marble.svg (gegenereerd marmer)
assets/fonts/           Big Shoulders Display + Manrope, zelf gehost (SIL OFL)
bron/                   de aangeleverde Instagram-screenshots
tools/                  lokale server, afbeeldingen, voorbeeldbestand
tests/e2e.mjs           browsertests
docs/rapportage.md      audit, ontwerpkeuzes, testresultaten, open punten
```
