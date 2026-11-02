# Moso Barbershop — rapportage

## 1. Audit

**Aangeleverd:** 9 screenshots van Instagram (@mosobarbershop): profiel, twee rasterpagina's en de highlights 💈 (zaak), Locatie, Prijzen en Openingstijden. Er was geen Bloomz-project of ander Moso-materiaal in de repository.

| Bron | Gebruikt voor |
|---|---|
| Bio | Kapper · Utrechtstraat 114 · "Fades • Cuts • Clean styles" · "Met & zonder afspraak" · 06 41576076 |
| Profielfoto | Logo als ronde metalen badge (header, footer, 3D-munt in de finale) |
| Stories zaak | Twee foto's in volle resolutie: stoel voor de verlichte boogspiegel (hero) en het interieur met honingraat-LED-plafond |
| Raster | 7 cuts, barber aan het werk, de pui |
| Prijzen | Haar knippen € 20, haar en baard € 28, kinderen tot 10 jaar € 17, baard trimmen € 15, wassen € 5, "Look good · Feel good" |
| Openingstijden | Ma 12–18, di–do 9–18, vr 9–20, za 9–18, zo gesloten |
| Locatie | Utrechtstraat 114, 2408 GW Alphen aan den Rijn |

**Bewerkingen:** tekst-overlays ("Alphen aan den Rijn / Utrechtstraat 114") en afspeeliconen zijn van de rastertegels weggesneden; een muzieksticker in de stoel-story is weggeretoucheerd met de kleur van de ladekast eromheen.

**Bewust niet gebruikt:** de story met de Gucci-cape (merkbeeld van derden), tegels met tekst midden in beeld, en foto's van de lounge die te klein waren.

**Beeldkwaliteit:** rastertegels zijn ~394 px breed en worden nooit breder getoond dan ~340 px. De twee story-foto's (1100 px) dragen de grote vlakken.

## 2. Ontwerprichting: "Marmer & chroom"

- **Palet:** mat zwart en antraciet, warm gebroken wit voor tekst, geborsteld staal en chroom als accent. Geen goud.
- **Typografie:** Big Shoulders Display (smal, zwaar, scherp; in de geest van de eigen prijslijst) en Manrope. Woorden in chroom krijgen een langzaam glijdende glans.
- **Materialen:** gegenereerd zwart marmer (SVG-ruis, alleen op de prijsplaat, één kaart, de hero en de finale), afgeschuinde hoeken als geometrisch motief op foto's, kaarten en knoppen.
- **Signatuur:** de **honingraat van het LED-plafond** in de zaak keert terug als lijnenpatroon in de hero; rond de cursor licht het op, op touch beweegt het licht vanzelf.
- **3D-hero:** zes lagen op diepte (interieur, ringlamp in chroom, stoelfoto met lichtstreep, crop fade, scheermes-lijn in chroom, prijskaartje € 20). Volgt de cursor, krijgt meer diepte bij scrollen.
- **Overgang hero → cuts:** een lopende band ("Fades · Cuts · Clean styles · Met & zonder afspraak") en daarna een **vastgezette horizontale galerij** die zijwaarts schuift tijdens het scrollen. Kaarten draaien licht mee naar het midden en kantelen onder de muis; een teller toont de huidige cut. Op mobiel veegbaar.
- **Verder:** prijsrijen met chroomprijzen en lichtval die de muis volgt over het marmer; een interieurfoto die terugzoomt bij scrollen; kantelende kaarten voor binnenlopen en afspraak; magnetische knoppen; de logo-badge als 3D-munt in de finale.
- **Anders dan eerdere projecten:** donker in plaats van licht, smalle schreefloze koppen in plaats van Didone of Italiana, geen bogen, geen WebGL, een horizontale galerij in plaats van een raster.

## 3. Opbouw

Hero (met live status "Nu open · tot 18:00") → band → 01 Cuts → 02 Diensten & prijzen → 03 De zaak → 04 Langskomen (binnenlopen / afspraak, openingstijden met "vandaag", adres, bellen, route) → 05 Reviews (alleen in conceptmodus, als placeholder) → 06 Afspraak → finale → footer met adres, telefoon, Instagram en tijden. Plus `/privacy/` en 404.

**Formulier:** dienst met prijs, wassen als extra, live totaal, datum (zondag wordt geweigerd), voorkeurstijden per halfuur binnen de openingstijden van die dag (duidelijk "geen gereserveerd tijdslot"), naam, telefoon, opmerking. Zonder backend: "Er is nog niets verstuurd en er is nog geen afspraak", met Bel-knop, kopiëren en Instagram-DM.

## 4. Tests (29-10-2026)

`npm test`: **55 van 55 geslaagd** (Chromium 1243, axe-core 4.14).

- Geen horizontale scroll, consolefouten of kapotte verzoeken: 3 pagina's × 5 breedtes (320–1440 px), mobiele emulatie onder 768 px.
- axe WCAG 2.1 A/AA + best practices: 0 ernstige/kritieke overtredingen (mobiel en desktop, alle pagina's).
- Eén h1, alle ankers bestaan, alle afbeeldingen laden, geen externe verzoeken, noindex/robots/geen JSON-LD in conceptmodus.
- Prijzen en openingstijden op de site = `src/site.mjs`; vandaag gemarkeerd; open/gesloten-status; tel- en routelinks.
- 3D-hero reageert op de muis, honingraatlicht volgt; cuts-galerij schuift horizontaal met de scroll; lightbox (pijltjes, Escape, focus terug).
- Formulier: leeg versturen, voorselectie vanuit de prijslijst, totaal € 28 + € 5, zondag geweigerd, vrijdag 9:00–19:30, ongeldige telefoon, overdracht zonder endpoint (geen nepbevestiging), gegevens aanpassen, endpoint 200 (JSON gecontroleerd) en 500.
- Mobiel menu, mobiele galerij veegbaar, bel/afspraak-balk, klikgebieden ≥ 44 px, reduced motion (niets vastgezet, alles zichtbaar), zonder JavaScript alles zichtbaar.

Visueel gecontroleerd op 1440 en 390 px; screenshots in `docs/screens/`.

**Niet getest:** Safari/iOS, Firefox, echte toestellen, Lighthouse, echte verzending naar een backend.

## 5. Open punten voor livegang

1. Domeinnaam (`url`).
2. Online agenda of formulier-endpoint, of bewust bij bellen/DM blijven.
3. Gebruikt 06 41576076 WhatsApp? Dan `contact.whatsapp` invullen.
4. Duur per dienst.
5. Echte Google-reviews.
6. Parkeerinformatie (optioneel).
7. Privacyverklaring juridisch laten opstellen.
8. Meer foto's in hoge resolutie (barbers, close-ups van fades) voor een rijkere galerij.
