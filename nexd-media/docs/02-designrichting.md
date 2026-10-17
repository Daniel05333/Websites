# 2. Designrichting

## Uitgangspunt

**Make the website prove the product.** NEXD verkoopt websites die aanvragen opleveren. De site moet dat zelf laten zien:

- een heldere propositie binnen één scherm;
- een signatuurelement dat het verhaal vertelt;
- eerlijke bewijsvoering;
- een keuzehulp in plaats van een prijzentabel;
- een formulier dat niet liegt.

## Drie concepten

### A — Digital Architecture

Editorial layouts, grote typografie, een strak grid en abstracte geometrische vormen. De site voelt als een high-end digitaal product.

### B — Conversion Intelligence

Funnels, datavisualisaties, voor-en-na en uitgewerkte cases. Rationeel en resultaatgericht.

### C — Immersive Creative Studio

Een cinematografische 3D-hero, scrollgestuurde transformaties, parallax en geanimeerde typografie.

## Vergelijking

Schaal 1–5; hoger is beter.

| Criterium | A | B | C |
|---|---|---|---|
| Merkherkenning | 4 | 3 | 4 |
| Onderscheidend vermogen | 4 | 3 | 5 |
| Zakelijke geloofwaardigheid (legal/finance) | 5 | 5 | 3 |
| Conversiepotentieel | 4 | 5 | 3 |
| Performance | 5 | 4 | 2 |
| Toegankelijkheid | 5 | 4 | 3 |
| Haalbaarheid zonder echte projectbeelden | 5 | 2 | 4 |

**B** staat of valt met veel geverifieerde data en echte projectbeelden. Die zijn er (nog) niet, en verzonnen dashboards zijn precies wat we niet willen.

**C** puur toegepast is te zwaar en te speels voor een advocaat die een webbureau zoekt.

## Keuze: A als basis, met één element uit C en één uit B

1. **A — Digital Architecture** is de basis: een lichte grond, inktzwarte koppen in Oswald (uppercase), Space Grotesk voor alles wat praat, haarlijnen, hoekhaken en een strak grid.
2. **Uit C:** één echte 3D-ervaring, de *Conversion Engine*, alleen in de hero, met een volwaardige statische fallback. Daarnaast canvaslagen (contourlijnen, route-kaart, pixel-dissolve) die licht zijn en buiten beeld stilstaan.
3. **Uit B:**
   - eerlijke datavisualisatie in de cases: balken op basis van de echte cijfers van de klant;
   - de keuzehulp "welke oplossing past bij jou?".

## Versie 3: het NEXD-groen terug, en het vakmanschap van twee referenties

Feedback op versie 2: het groen van de huidige site moest terugkomen, en de huidige site voelde nog steeds beter. Daarom is versie 3 opnieuw opgebouwd vanuit de huidige merkkleuren (lichte, licht-mint grond, inkt `#0f172a`, groen `#12b981`, de groene rand rond de footer) en zijn de **technieken** uit twee aangeleverde referentie-prompts toegepast. Hun inhoud en beelden (foto's, 3D-helm, bronzen beeld) zijn bewust **niet** overgenomen.

| Techniek | Herkomst | Waar op de site |
|---|---|---|
| Sticky stapel: een laag zakt terug (schaal 0,9, schaduw 0,55) als de volgende eroverheen schuift | KIMI | hero → route → werkwijze (≥ 768 px) |
| Pixel-dissolve op de naad tussen licht en donker | KIMI | bovenrand route en cases |
| Contourlijnen via marching squares over een veld van vier sinussen | KIMI | hero (reageert op de cursor), keuzehulp, cases, footer, paginakoppen |
| Route-kaart: halftoon-corridor, kruipende assen, ringen met ping, één ronde van 6 s die remt in de bochten, gloed, reticule | KIMI (circuit-trace) | "Van bezoeker tot aanvraag" |
| Tijdlijn met platen, rail met kop, parallax en dimmen bij hover | KIMI | "Van intake tot livegang" (7 stappen) |
| Kiesbare strip met beugel en stromende verbinders | KIMI (kalender) | cases |
| Afgeschuinde knoppen met vlakvulling, tekstlinks tussen haken, hoekhaken rond panelen | KIMI | overal |
| Laadsluier: logo vult zich, meter langs de voet | KIMI | home, één keer per sessie |
| Footer als donker paneel in een groene rand | KIMI + huidige site | overal |
| Woord- en letterreveals op springs, cursorring, voortgangsstreepjes | Laocoön | overal / home (desktop) |
| Lenis smooth scroll op één gedeelde ticker | beide | overal (niet bij reduced motion) |

## Het signatuurelement: The Conversion Engine

Bezoekers, verbeeld als deeltjes, stromen breed binnen en gaan door vier versmallende architectonische kaders:

1. **Aandacht**
2. **Begrip**
3. **Vertrouwen**
4. **Actie**

Bij elk kader haakt een deel af en dooft uit. Wie voorbij "Vertrouwen" komt, kleurt NEXD-groen. Wie alles passeert, landt in het oplichtende blok **Aanvraag**, dat bij elke aankomst kort pulseert. De vijf fasen staan ook als tekst onder de hero, zodat de betekenis nooit van WebGL afhangt.

**Interactie:**

- **Cursor:** de scène kantelt licht mee (±0,16 rad, gedempt).
- **Scrollen:** de camera draait richting vooraanzicht en in de kaders verschijnen wireframe-paginaregels. Zo wordt de abstracte trechter een reeks concrete webpagina's. Dit is de overgang van abstract naar concreet uit de briefing.
- **Laden:** de kaders bouwen gespreid op; de deeltjes faden in.
- **Geen scrolljacking:** de pagina scrollt altijd normaal.

**Hetzelfde verhaal komt terug in:**

- de statische SVG-fallback en de OG-afbeelding;
- de route-kaart ("Van bezoeker tot aanvraag", dezelfde vier fasen);
- de dienstmotieven in de tijdlijnplaten en paginakoppen.

## Design system (v3)

**Kleur**

| Token | Waarde | Gebruik |
|---|---|---|
| `--ground` / `--ground-2` | `#f7faf9` / `#eaf5ef` | lichte grond; mint voor de keuzehulp (de hero-tint van de huidige site) |
| `--ink` / `--ink-muted` | `#0f172a` / `#5b6474` | tekst op licht (muted 5,6:1) |
| `--black` | `#07100c` | donkere panelen (route, werkwijze, strip, footer) |
| `--accent` | `#12b981` | het NEXD-groen: vlakken, knoppen, accent op donker |
| `--accent-ink` | `#047857` | groen als tekst op licht (5,5:1) |
| `--accent-bright` | `#8ff0c9` | de hete kop van de route |

**Typografie** (zelf gehost, SIL OFL): Oswald variabel voor display (uppercase, regelafstand 0,95), Space Grotesk variabel voor tekst en labels.

**Beweging** (`src/client/`)

- Eén rAF-ticker voor alles; springs (spanning/wrijving, massa 1) in plaats van vaste curves.
- `data-reveal="words|letters|rise|fade|rule"` met `data-delay` en `data-stagger`. Letters krijgen een onzichtbare leesbare kopie voor schermlezers.
- Canvassen pauzeren buiten beeld en bij een verborgen tabblad.
- `prefers-reduced-motion`: geen splitsing, geen sluier, geen Lenis, geen 3D; canvassen één keer statisch.
- Zonder JavaScript (of als het script faalt: na 4 s valt `html.js` weg) staat alle inhoud er gewoon.

**Componenten** (in `src/components/`): masthead en menu-sheet, hero met 3D-mount en panelen, route, tijdlijn, cases met strip, keuzehulp, team, FAQ, footer-paneel, sticky mobiele CTA, page-hero met motief, prijskaart en contactformulier.

## Art-direction-prompts (voor vervolgbeelden)

Deze prompts zijn afgestemd op de gekozen richting en bedoeld voor wanneer er echte beelden komen. In deze oplevering zijn **geen AI-beelden gebruikt**: alle visuals zijn code (SVG en WebGL), zodat er niets verzonnen wordt.

> **Teamportretten (fotoshoot of retouche-richtlijn):** "Editorial business portrait, light mint-white backdrop (#f7faf9), soft directional window light from the left, subject in natural working clothes, calm confident expression, 4:5 crop with generous headroom, muted warm grade, no stock-photo gestures, no handshakes, no glass offices."

> **Case-visual (met echte schermafbeeldingen):** "Show the real client website in a refined editorial composition on a light mint-white background: one desktop and one mobile viewport, thin graphite hairline frames instead of device mockups, subtle depth, no invented UI, metrics, logos or text."

> **Abstracte achtergrond (alleen indien nodig):** "Architectural abstract of four narrowing translucent rectangular frames on a light mint-white ground, fine ink lines, a single small solid green (#12b981) block at the end, precise and restrained, no glow haze, no sci-fi, no floating icons."
