# Rapportage — Angel Hairstyles

## 1. Audit: bronnen per gegeven

Websites zijn vanuit de ontwikkelomgeving niet rechtstreeks op te halen (proxy). Gegevens komen uit het Google-bedrijfsprofiel (screenshot van de opdrachtgever, oktober 2026) en uit zoekresultaten.

| Gegeven | Waarde | Bron | Status |
|---|---|---|---|
| Naam | Angel Hairstyles (kapper) | Google-profiel, Instagram | bevestigd |
| Adres | Pathmossingel 1E, 7513 CA Enschede | Google-profiel | bevestigd |
| Telefoon | 06 16509984 | Google-profiel | bevestigd |
| Instagram | @angelhairstyles1 (3,5K+ volgers) | Google-profiel | bevestigd |
| Facebook | facebook.com/p/Angel-Hairstyles-100054488558009 | zoekresultaat | waarschijnlijk; pagina noemt nog oude naam "salim_hairstyles" |
| Beoordeling | 4,8 · 163 Google-reviews | Google-profiel | bevestigd, stand okt 2026; wordt niet als structured data gebruikt |
| Erkend leerbedrijf | ja | Stagemarkt.nl (SBB) | bevestigd |
| Openingstijden | ma gesloten · di–vr 10–18 · za 10–17 | Social Deal-bedrijfspagina; Google: "gaat open di 10:00" | **door salon te bevestigen**; zondag onbekend |
| Boeken | WhatsApp / Instagram-DM / telefoon | Instagram-bio (via zoeksamenvatting) | WhatsApp op het 06-nummer **aangenomen** |
| Behandelingen | wassen, knippen, föhnen (dames); highlights | Social Deal-deals 2022–2025 | bevestigd aangeboden; balayage, verzorging en gelegenheidskapsels zijn **concept** |
| Prijzen | — | geen actuele prijslijst gevonden (dealprijzen zijn geen tarieven) | open |
| "24+ jaar ervaring" | — | Instagram-bio (via zoeksamenvatting) | niet als feit gebruikt; placeholder |
| Website | geen eigen site gevonden (Stagemarkt verwijst naar Facebook) | — | geen redirects nodig |
| Huisstijl | interieur: zwarte zeshoektegels, houten lamellenbalie, zwart/wit, grote "STYLES"-belettering | Google-foto's | palet (inkt, ivoor, houtkleurig accent) sluit hierop aan; geen logobestand beschikbaar |

**Bewust niet gepubliceerd:** de naam van de eigenaar en een privé-hotmailadres uit de Stagemarkt-vermelding.

**Afspraakroute:** omdat er geen online agenda is, openen alle afspraakknoppen WhatsApp met een ingevuld bericht, per behandeling ("…een afspraak maken voor highlights"). De site zegt expliciet dat een bericht een aanvraag is, en dat de afspraak pas vaststaat na bevestiging door de salon. Komt er een online systeem, dan vul je `booking.url` in en gaan alle knoppen daarheen.

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

Alle checks geslaagd:
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

1. WhatsApp: loopt WhatsApp op 06 16509984? (Zo niet: `contact.whatsapp` aanpassen of op `null` zetten; de knoppen vallen dan terug op de contactsectie.)
2. Openingstijden laten bevestigen, inclusief zondag; daarna `hoursVerified: true` (dan gaan ze ook in de structured data).
3. Actuele prijzen en duur per behandeling, eventuele toeslagen (lengte/hoeveelheid haar).
4. Welke concept-behandelingen echt aangeboden worden (balayage, verzorging, gelegenheid), plus eventueel herenknippen.
5. Annuleringsvoorwaarden en betaalmogelijkheden.
6. Een eigen korte tekst over ervaring en werkwijze.
7. Foto's: het interieur en het portfolio van Google/Instagram, met toestemming van de salon (en van herkenbare klanten) aanleveren als bestanden.
8. Logo, als dat bestaat.
9. Domein → `site.url`; privacytekst laten controleren.
10. `draft: false`, `npm test`, uploaden, Lighthouse meten op de echte hosting.
