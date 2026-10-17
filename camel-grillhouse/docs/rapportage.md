# Rapportage — Camel Middle East Grill House

## 1. Audit: bronnen per gegeven

De bestaande sites konden vanuit de ontwikkelomgeving **niet rechtstreeks worden geopend**: de netwerkproxy weigert grillroomcamel.nl, grillroomcamel.com, Thuisbezorgd en Hapsalons. De gegevens komen daarom uit drie bronnen:

- zoekresultaten (index van oktober 2026);
- de tekst van grillroomcamel.nl die de opdrachtgever in de chat plakte;
- vijf foto's van de zaak, aangeleverd door de opdrachtgever.

| Gegeven | Waarde | Bron | Status |
|---|---|---|---|
| Naam | Camel Middle East Grill House (B.V.) | briefing, alle vermeldingen | bevestigd |
| Adres | Oude Markt 9A, 7511 GA Enschede | briefing, grillroomcamel.nl, near-place, enschede053 | bevestigd. Thuisbezorgd noemt "Oude Markt 9". |
| Telefoon | 053 432 4663 | briefing, grillroomcamel.nl, meerdere gidsen | bevestigd |
| Info-site | grillroomcamel.nl (navigatie: Thuis · Bestellen · Foto's, "Online eten bestellen? Klik hier") | zoekindex + geplakte tekst | bevestigd |
| **Bestelomgeving** | **grillroomcamel.com: WooCommerce** (`/product/<slug>/`, `/product-category/…`, "Toevoegen aan winkelwagen", `?add-to-cart=`) | zoekindex | bevestigd dat de shop bestaat. **Te bevestigen** dat dit de route achter "Klik hier" is. |
| Andere bestelplatforms | camelmiddleeastgrillhouse-enschede.nl, Thuisbezorgd, Hapsalons (met hogere prijzen) | zoekindex | niet gelinkt; eigenaar kiest |
| Openingstijden | elke dag vanaf 15:00. Ma, di en zo tot 02:00, do tot 03:00. | grillroomcamel.nl (geplakte tekst) | Wo, vr en za **conflicteren**: de site toont lijst A (03:00 / 04:30 / 05:00) én lijst B (02:00 / 03:30 / 03:30). Externe gidsen wijken ook af. |
| Over Camel | gezellige grillroom, ouderwets lekker broodje shoarma, (mini)schotels, kindermenu's, ook voor alleen een drankje, zeer ruime openingstijden | grillroomcamel.nl (geplakte tekst) | bevestigd, licht ingekort gebruikt |
| Gastreactie | "Wij vonden het magnifique…" — M. | grillroomcamel.nl | letterlijk overgenomen, met bron. Geen sterren of aggregate rating. |
| Menu en prijzen | 16 categorieën, 77 gerechten | zoekindex van grillroomcamel.com | **te verifiëren**: de shop toonde op verschillende pagina's verschillende bedragen. Gebruikt is de hoofdpagina. Ontbrekend = "prijs in webshop". |
| Afhalen, bezorgen, kosten, minimum, betaalmethoden | — | Hapsalons noemt afhalen + bezorgen | **niet getoond**; placeholder |
| Allergenen | — | niet gevonden | FAQ verwijst naar bellen; niets verzonnen |
| Halal, keurmerken, reviewscores | — | — | bewust weggelaten |
| Logo | — | niet op te halen | tekstlogo met vlam als placeholder |

## 2. Keuzes

- **Architectuur.** Statische generator uit één databestand, zoals de andere sites in deze repository. De bestaande WooCommerce-shop blijft het enige bestel- en betaalsysteem: geen dubbele productdatabase, geen eigen betaalmodule. In de webshop bewerkt de eigenaar ook de prijzen en opties. Op deze site gaat dat in `src/site.mjs`.
- **Fotografie.** Alleen echte foto's van Camel: het spit, de salamandergrill, de bar, de koeling en het interieur. Er zijn **geen stock- of AI-foodfoto's** als gerecht gebruikt, omdat er geen productfoto's beschikbaar waren. De productkaarten zijn daarom typografisch (naam, beschrijving, formaten, prijs, bestelknop). De AI-prompts A–E uit de briefing staan klaar voor een fotoshoot of conceptbeelden. Gebruik ze nooit als productfoto.
- **Merk.** "Flame. Flavor. Camel." Bijna zwart antraciet, gebrand rood (`#c9341f`, 5,0:1 met crème), amber en koper. Big Shoulders Display voor koppen en Manrope voor tekst, beide zelf gehost.

## 3. Technieken uit de referentieprompts (KIMI / Laocoön), vertaald naar Camel

De twee meegestuurde prompts beschrijven andere merken met eigen assets. Ze zijn **niet nagebouwd**: ze zijn gebruikt als technisch vocabulaire, toegepast waar het de bestelsite helpt en licht genoeg om de laadsnelheid niet te raken.

| Techniek | Bron | Toepassing bij Camel |
|---|---|---|
| Sticky stack met terugwijkende laag (scale 0,92, schaduw 55%) | KIMI | De hero blijft staan; "De smaak van Camel" schuift er als kaart overheen. Op mobiel alleen schaduw. |
| Veer-oplosser (spanning/frictie, massa 1) + woord-reveals | KIMI | Alle sectiekoppen; schermlezers krijgen de gewone tekst |
| Letter-voor-letter blur-up (35 ms stagger) | Laocoön | Hero-kop "Jouw trek. Onze grill." |
| Opstijgende vonken, additief, sneller bij snel scrollen | Laocoön | `flame.js`: 150 vonken (70 op mobiel), positie in de shader, 1 draw call, alleen in beeld |
| Geblokte "vlag"-dissolve tussen secties | KIMI | Vonken-naden in ember en amber boven Favorieten, Grill en Bestellen |
| Hoogtelijnen via marching squares | KIMI | Langzaam rollende amberlijnen achter de grillsectie en de slot-CTA |
| Panelen met hoekhaken | KIMI | Hero-panelen "Vandaag open" en "Op de kaart", plus de gastreactie |
| Afgeschuinde CTA met vloed bij hover | KIMI | Alle knoppen |
| Voortgangsdraad met draaiend blokje | KIMI (tijdlijn-rail) | Boven de drie bestelstappen |

Bewust **niet** overgenomen:

- **Laadsluier.** Die vertraagt de eerste weergave en daarmee bestellingen.
- **Eigen cursor.** Slecht voor bruikbaarheid en touch.
- **Lenis smooth-scroll.** Extra JS; native scroll volstaat.
- **three.js via CDN.** Zo'n 600 KB en een externe bron, voor een effect dat met 4 KB eigen WebGL kan.

Alles respecteert `prefers-reduced-motion`: dan staat alles direct op zijn plek, de vonken zijn uit en de lijnen staan stil. De vonken staan ook uit bij Save-Data of minder dan 2 GB geheugen.

## 4. SEO

Elke pagina heeft een eigen title, description, canonical, Open Graph-gegevens en een `og.jpg` met een echte foto. Elke pagina heeft één H1. Er zijn een sitemap en een robots.txt.

De menukaart staat als indexeerbare HTML op `/menukaart/`, met ankers per categorie. De oude URL `/contact/` krijgt een 301 naar `/#contact` (via `.htaccess` of `_redirects`, met een fallbackpagina).

Restaurant-JSON-LD gaat pas mee als `draft` op false staat, en de openingstijden daarin pas als `hoursVerified` aan staat.

## 5. Tests (`npm test`, 65 checks, allemaal groen)

- **Opmaak:** geen horizontale scroll op 320, 390, 768, 1024 en 1440 px, voor alle 4 pagina's.
- **Toegankelijkheid:** axe WCAG 2.1 AA op 390 en 1440 px.
- **Fouten:** geen console- of netwerkfouten.
- **Bestelroute:** elke bestelknop gaat naar grillroomcamel.com.
- **Links:** alle interne links en ankers bestaan.
- **Externe verzoeken:** geen.
- **Menukaart:** 77 rijen; zoeken filtert en meldt het aantal; de tab volgt de categorie in beeld.
- **Concept:** noindex, robots.txt blokkeert en er is geen JSON-LD.
- **Eerlijkheid:** geen labels als "bestseller" of sterren.
- **Beweging:** de sticky stack schaalt en de woord-veren eindigen volledig zichtbaar.
- **Interactie:** de FAQ werkt met het toetsenbord; de lightbox werkt met pijltjes en Escape en zet de focus terug; vandaag staat gemarkeerd; het track-event wordt gemeld.
- **Mobiel:** "Bestel nu" staat boven de vouw; het menu werkt met focus en Escape; de bestelbalk verschijnt; alle klikgebieden zijn minstens 44 px.
- **Reduced motion:** alles is direct zichtbaar en er zijn geen vonken.
- **Livegang:** de launch-check faalt zolang er todo's open staan of prijzen en tijden niet zijn geverifieerd.

Niet getest: het afrekenen in de webshop zelf, omdat die vanuit deze omgeving onbereikbaar is.

## 6. Open punten voor de eigenaar

1. **Bestelroute.** Is grillroomcamel.com de webshop achter "Klik hier"? Zo nee, vul `order.url` in.
2. **Openingstijden.** Wat zijn de juiste sluitingstijden op woensdag, vrijdag en zaterdag? En wat moet er gebeuren met de tweede, afwijkende lijst op de huidige site?
3. **Prijzen.** Leg alle 77 gerechten naast de webshop, vul de ontbrekende prijzen in en zet `pricesVerified: true`.
4. **Bezorgen en afhalen.** Zijn ze mogelijk? Zo ja: bezorggebied, kosten, minimumbedrag en betaalmethoden.
5. **Dagmenu's.** Op welke dagen gelden ze?
6. **Logo.** Lever het officiële logo aan (SVG).
7. **Privacy.** Lever de link naar de privacyverklaring van de webshop, het KvK-nummer en een e-mailadres.
8. **Fotografie.** Laat productfoto's maken (de prompts B–E dienen als art direction). Daarna kunnen de favorietenkaarten een foto krijgen.
9. **Meten.** De site stuurt bij elke klik een `camel:track`-event. Een consent-conforme analysetool kan daarop aansluiten; er is nu bewust niets geladen.
10. **Andere platforms.** Moeten Thuisbezorgd en camelmiddleeastgrillhouse-enschede.nl gelinkt worden, of juist niet? Daar staan andere prijzen.
