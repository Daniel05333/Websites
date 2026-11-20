# Lenéa nails: concept-website

Concept voor Lenéa nails, nail tech in Enschede. Het is een statische one-page site (HTML, CSS en JavaScript zonder bibliotheken) in chic crème met het Lenéa-logo. Er zijn geen trackers en geen cookies. Lettertypen, scripts en foto's staan op de eigen server.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4700
npm test           # build + 27 browsertests (5 breedtes, axe, filters, vergroten, boeken, zonder JS, reduced motion)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** vijf glanzende amandelnagels, live gerenderd in WebGL (raymarching in één shader, geen bibliotheek). De kleuren komen uit haar eigen werk: milky, soft french, cherry, olive chrome en mocha leopard. Tijdens het scrollen waaieren ze open als een kleurenwaaier en komt elke kleur om de beurt naar voren. Ze volgen ook de muis. Zonder WebGL verschijnen CSS-nagels. Bij "minder beweging" staat de waaier stil.
- **Werk:** 18 sets in boogvormige kaarten, met filters (clean & milky, French, nail art, kleur), een 3D-kanteleffect en een vergrootweergave waarin je kunt bladeren.
- **Over Lenéa**, met de badges Certified nail tech, NN Gel en Enschede.
- **Behandelingen**, met bij elke behandeling een Boek-knop die het formulier invult.
- **Werkwijze in 4 stappen.**
- **Afspraak:** de klant kiest behandeling, vorm, dag, dagdeel en naam. Het bericht wordt gekopieerd en Instagram-DM opent. Lenéa bevestigt zelf.

## Nog in te vullen (src/site.mjs)

- **Behandelingen, duur en prijzen.** De lijst is een voorstel op basis van haar Instagram. Prijzen staan nu als "op aanvraag".
- **Online agenda:** vul `bookingUrl` in (bijvoorbeeld Salonized of Treatwell). Dan boeken klanten echt direct, zonder DM, en gaan alle Boek-knoppen daarheen.
- **Adres of wijk, en WhatsApp.**
- **Domein:** vul het in en zet daarna `draft: false`. Zolang de site op concept staat, krijgt elke pagina `noindex` en blokkeert `robots.txt` alles.
- **Foto's:** ze komen uit haar eigen posts. Laat haar bevestigen dat ze op de website mogen.

## Structuur

```
src/site.mjs            alle inhoud: behandelingen, werk, stappen, gegevens
build.mjs               templates + bouwt public/ (index, 404, robots)
assets/css/main.css     design system (tokens bovenaan) en componenten
assets/js/main.js       WebGL-nagels, scroll, filters, vergroten, afspraak
assets/img/             foto's en logo, gesneden uit de Instagram-screenshots
assets/fonts/           Cormorant Garamond + Jost (SIL OFL)
bron/                   de aangeleverde Instagram-screenshots
tools/                  lokale server, afbeeldingen, voorbeeldbestand
tests/e2e.mjs           browsertests
```
