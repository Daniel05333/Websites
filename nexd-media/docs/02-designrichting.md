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

1. **A — Digital Architecture** is de basis: papier/inkt, grote koppen in Inter Tight, Instrument Serif-cursief als accent, mono-labels, haarlijnen en een asymmetrisch grid.
2. **Uit C:** één echte 3D-ervaring, de *Conversion Engine*, alleen in de hero, met een volwaardige statische fallback.
3. **Uit B:**
   - eerlijke datavisualisatie in de cases: balken op basis van de echte cijfers van de klant;
   - de keuzehulp "welke oplossing past bij jou?".

## Het signatuurelement: The Conversion Engine

Bezoekers, verbeeld als deeltjes, stromen breed binnen en gaan door vier versmallende architectonische kaders:

1. **Aandacht**
2. **Begrip**
3. **Vertrouwen**
4. **Actie**

Bij elk kader haakt een deel af en dooft uit. Wie voorbij "Vertrouwen" komt, kleurt signaaloranje. Wie alles passeert, landt in het oplichtende blok **Aanvraag**, dat bij elke aankomst kort pulseert. De vijf fasen staan ook als tekst onder de hero, zodat de betekenis nooit van WebGL afhangt.

**Interactie:**

- **Cursor:** de scène kantelt licht mee (±0,16 rad, gedempt).
- **Scrollen:** de camera draait richting vooraanzicht en in de kaders verschijnen wireframe-paginaregels. Zo wordt de abstracte trechter een reeks concrete webpagina's. Dit is de overgang van abstract naar concreet uit de briefing.
- **Laden:** de kaders bouwen gespreid op; de deeltjes faden in.
- **Geen scrolljacking:** de pagina scrollt altijd normaal.

**Hetzelfde motief komt terug in:**

- het logo-merkteken (vijf kaders, de laatste massief oranje);
- de favicon en de OG-afbeelding;
- de statische SVG-fallback;
- de finale CTA;
- de dienstmotieven;
- de laagjes-stapel in "De NEXD-aanpak".

## Design system

**Kleur**

| Token | Waarde | Gebruik |
|---|---|---|
| `--ink` | `#0e0f0d` | donkere secties, tekst op licht |
| `--paper` / `--paper-2` / `--white` | `#f2eee6` / `#e8e2d6` / `#fbfaf7` | lichte secties, afgewisseld voor ritme |
| `--signal` | `#ff5a1f` | het enige accent: CTA's, de "aanvraag" en cursieve accenten op donker |
| `--signal-ink` | `#b23a0e` | signaal als tekst op licht (5,3:1) |
| `--muted` / `--muted-dark` | `#55524b` / `#aaa59a` | secundaire tekst (≥ 7:1) |

Bewust geen paars-blauwe gradients en geen glassmorphism. De enige blur is de header na het scrollen.

**Typografie** (alle drie zelf gehost, SIL OFL)

- Inter Tight variabel voor alles.
- Instrument Serif Italic als redactioneel accent in koppen.
- JetBrains Mono voor labels en nummering.

**Beweging**

- Eén curve (`cubic-bezier(.2,.7,.1,1)`) en één reveal: 18 px omhoog plus fade, 0,7 s.
- Onderstreping die van links aanloopt.
- De pijl schuift 3 px bij hover.
- De metric-balken groeien naar hun waarde.
- `prefers-reduced-motion` schakelt alles uit en laadt de 3D niet.

**Componenten** (in `src/components/`)

- Navigatie: header, mobiel menu, sticky mobiele CTA.
- Hero met 3D-mount.
- Sectiekoppen en de route-lijst voor diensten.
- Cases met metric-balken.
- Keuzehulp en plan-kaarten.
- Team, timeline, FAQ, finale CTA en footer.
- Page-hero met dienstmotief, prijskaart en contactformulier.

## Art-direction-prompts (voor vervolgbeelden)

Deze prompts zijn afgestemd op de gekozen richting en bedoeld voor wanneer er echte beelden komen. In deze oplevering zijn **geen AI-beelden gebruikt**: alle visuals zijn code (SVG en WebGL), zodat er niets verzonnen wordt.

> **Teamportretten (fotoshoot of retouche-richtlijn):** "Editorial business portrait, warm off-white paper backdrop (#f2eee6), soft directional window light from the left, subject in natural working clothes, calm confident expression, 4:5 crop with generous headroom, muted warm grade, no stock-photo gestures, no handshakes, no glass offices."

> **Case-visual (met echte schermafbeeldingen):** "Show the real client website in a refined editorial composition on a warm paper background: one desktop and one mobile viewport, thin graphite hairline frames instead of device mockups, subtle depth, no invented UI, metrics, logos or text."

> **Abstracte achtergrond (alleen indien nodig):** "Architectural abstract of four narrowing translucent rectangular frames in deep warm black space, fine graphite lines, a single small glowing orange-red block at the end, precise and restrained, no glow haze, no sci-fi, no floating icons."
