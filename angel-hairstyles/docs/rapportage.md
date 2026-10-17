# Rapportage — Angel Hairstyles

## 1. Audit: wat kon wel en niet worden vastgesteld

| Onderdeel | Status |
|---|---|
| Gedeelde referentie (share.google/QJ4c0OhZ4QT33faJN) | **Niet bereikbaar** vanuit de ontwikkelomgeving (proxy 403). |
| Bedrijfsidentiteit | **Niet vastgesteld.** Zoeken leverde alleen naamgenoten op: Angel's Hairstyling (Roosendaal), Angels Hairstyle (Lanaken, BE), Kapsalon Angel (Zevenaar), Hair by Angel (Epe) e.a. De opdrachtgever gaf aan dat het om een andere salon gaat; naam en plaats zijn nog niet doorgegeven. |
| Bestaande website, logo, huisstijl, fotografie | Onbekend → niet overgenomen. |
| Diensten, prijzen, duur, voorwaarden | Onbekend → concept-categorieën met gemarkeerde placeholders. |
| Boekingssoftware | Onbekend → afspraakknoppen leiden naar de contactsectie tot `booking.url` is ingevuld. Er is géén nepkalender en er worden geen tijden getoond. |
| Reviews | Geen bron → de sectie wordt niet getoond. Geen verzonnen testimonials of aantallen. |
| Bestaande URL's / SEO-posities | Onbekend → geen redirects ingericht. Zodra de oude site bekend is: oude URL's inventariseren en 301's toevoegen (`.htaccess` of hostingpanel). |

Alle 38 open waarden staan als `todo()` in `src/site.mjs`.

## 2. Art direction — "Your Signature Look"

Op verzoek in de stijl van de twee meegeleverde referentiespecificaties (Laocoön / KIMI): donker editorial podium, grote serif-display, fijn raster met zwevende punten, letter-voor-letter blur-reveal, hoofdstukbalkjes, een volgende cursorring en een levende WebGL-achtergrond — vertaald naar haar in plaats van brons of racing:

- **Signature Motion** (`silk.js`): duizenden fijne strengen die als haar golven, met een zijdeglans die richting de cursor buigt. Bij het scrollen verloopt de tint van kastanje → koper → asblond → espresso: de pagina "wisselt van look". Kale WebGL (geen three.js, ~6 KB), max. pixelratio 1,25, 30 fps op touch, pauzeert bij een verborgen tab, één stilstaand beeld bij reduced motion, CSS-gradient als fallback zonder WebGL.
- **Bewust niet overgenomen:** het verbergen van de systeemcursor (toegankelijkheid), een 900vh-scrollpagina (de afspraak moet snel bereikbaar zijn), 3D-modellen (geen meerwaarde voor een salon).
- Kleur: inkt `#0e0b0a`, ivoor `#f6f0e8`, één hazelaccent `#d0a27a`. Geen roze/goud-glitter. Wordt de echte huisstijl bekend, dan zijn het tokens bovenaan `main.css`.
- Type: Italiana (display) + Outfit (tekst), zelf gehost.

## 3. Wat is gebouwd

Homepage met hero, verhaal, behandelingen (kaarten met prijs/duur/voorwaarden + afspraak-CTA), vakmanschap, signature-beeld, prijstabel, 3 afspraakstappen, inspiratie (wens → behandeling), portfolio met toegankelijke lightbox (toetsenbord, swipe, focusherstel), FAQ (native `<details>`), contact + openingstijden, slot-CTA; daarnaast privacypagina en 404. Sticky header, mobiel menu (dialog, Escape, focus), vaste mobiele afspraakbalk die verdwijnt bij contact/slot. `angel:booking-click`-event als meetpunt voor afspraakklikken — er draait géén analytics.

**Niet gebouwd, met reden:** losse behandelpagina's. Zonder echte inhoud zouden dat dunne pagina's worden (de briefing vraagt dat te vermijden). Zodra per behandeling uitleg, voorbeelden en voorwaarden bekend zijn, kunnen ze in `build.mjs` worden toegevoegd.

## 4. Uitgevoerde tests (`npm test`, Chromium)

Alle 41 checks geslaagd:
- geen horizontale scroll op 320 / 390 / 768 / 1024 / 1440 px (3 pagina's);
- axe-core WCAG 2.1 A/AA + best practices: geen serious/critical bevindingen (390 en 1440 px, 3 pagina's);
- geen console- of netwerkfouten; geen externe verzoeken;
- precies één h1; alle ankerlinks bestaan; elke afspraakknop wijst naar de boekingsroute;
- conceptmodus: `noindex`, `robots.txt` blokkeert, geen JSON-LD;
- WebGL-achtergrond compileert en draait;
- FAQ via toetsenbord, lightbox (openen, pijltjes, Escape, focus terug), mobiel menu (focus, Escape), mobiele afspraakbalk, klikgebieden ≥ 44 px;
- reduced motion: alle inhoud direct zichtbaar.

**Niet gemeten:** Lighthouse/Core Web Vitals (geen productie-URL; lokaal in een headless container zou een score misleidend zijn). Te doen na livegang op de echte hosting.

## 5. Open punten voor livegang

1. Officiële naam, plaats en adres bevestigen (en daarmee de share.google-referentie).
2. Telefoon, e-mail, openingstijden, sociale media.
3. Echte behandelingen, prijzen, duur, toeslagen en voorwaarden.
4. Boekingssysteem-URL + de echte bevestigings-, annulerings- en betaalregels.
5. Eigen fotografie (salon, stylist, portfolio) met toestemming van herkenbare klanten.
6. Logo/huisstijl als die bestaat (tokens en het merkteken in `build.mjs` aanpassen).
7. Privacytekst laten controleren; huidige tekst beschrijft alleen wat de site technisch doet.
8. Domein → `site.url`; dan worden canonical, Open Graph-url en sitemap automatisch gezet.
9. Oude URL's → 301-redirects.
10. `draft: false`, `npm test`, uploaden, Lighthouse meten.
