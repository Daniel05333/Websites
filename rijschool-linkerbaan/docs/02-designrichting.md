# 02 · Designconcepten, gekozen richting en design system

## Drie concepten

| | **A · Modern Urban** | **B · Personal & Trust** | **C · Premium Motion** |
|---|---|---|---|
| Kern | Grote typografie, strakke compositie, sterke CTA's | Furkan en de leerling centraal, warme rust, stappenplan | Cinematische hero, parallax, scrollanimaties |
| Merkfit | Goed: jong en toegankelijk | **Zeer goed**: de persoonlijke rijschool is het onderscheid | Matig: belooft een "premium" niveau dat niet bij een eenmanszaak past |
| Conversie | Sterk: CTA's springen eruit | Sterk: neemt twijfel weg | Risico: effecten leiden af van de proefles |
| Toegankelijkheid | Goed | Goed | Lastiger (beweging, contrast op beeld) |
| Mobiel | Uitstekend | Goed | Zwaar en schokkerig op goedkope toestellen |
| Performance | Uitstekend | Goed (afhankelijk van foto's) | Slecht zonder flinke optimalisatie |
| Afhankelijk van echte foto's | Weinig | **Veel** | Veel (video/voertuigbeeld) |

## Keuze: B als basis, A voor de vorm, een snufje C

- **Verhaal en toon uit B:** Furkan krijgt een eigen sectie en pagina, er is een stappenplan van aanvraag tot examen, en de teksten zijn menselijk.
- **Vorm uit A:** zware, ronde display-typografie (Bricolage Grotesque), duidelijke hiërarchie en één opvallende CTA-kleur.
- **Uit C alleen wat de conversie helpt:** een rustige hero-entree, bewegende wegmarkering, secties die verschijnen bij scrollen en zwevende info-chips. Geen parallax en geen 3D. Alles staat uit bij `prefers-reduced-motion`.

Waarom niet volledig B? Concept B leunt op authentieke fotografie, en die is er nog niet. Daarom draagt een **vormgegeven illustratie** (de weg met de lesauto in de linkerbaan) de hero, en staat bij Furkan een **monogram-kaart**. Zodra er echte foto's zijn, worden ze via `src/data/site.mjs` ingevoegd (`photos.hero`, `owner.photo`) en vervangen ze de illustraties automatisch. Er is bewust **geen stockfoto of AI-portret** gebruikt.

## Merkmotief: de linkerbaan

De naam is het concept. Wegmarkeringen (gestippelde gele lijn) keren terug als:
- het merkteken: een rijstrook met een pijl die naar links de linkerbaan in gaat;
- de streepjes vóór elk "eyebrow"-label en onder het actieve menu-item;
- de scheidingslijnen onder pagina-headers, de twijfelband en de footer;
- de route van het stappenplan (horizontaal op desktop, verticaal op mobiel).

> Het merkteken is een **tijdelijk logo**. Het originele logo van de rijschool was niet beschikbaar. Vervang `brandMark()` in `src/components/icons.mjs` door het echte logo, of houd dit teken als het bevalt.

## Design system

### Kleur
| Token | Waarde | Gebruik |
|---|---|---|
| `--ink` | `#0F1B2D` | Asfalt: tekst, donkere secties, secundaire knoppen |
| `--paper` | `#F7F5F0` | Lichte, warme achtergrond |
| `--paper-2` | `#EFEBE2` | Getinte secties |
| `--mist` | `#E4EAF1` | Koele neutrale steun (werkgebied) |
| `--accent` | `#FFC21A` | Wegmarkering-geel: **alleen** voor primaire acties en accenten |
| `--accent-ink` | `#7A5200` | Geel-familie als tekst op licht (AA-contrast) |
| `--muted` | `#535D6E` | Secundaire tekst (AA op paper) |

De gele knoppen hebben altijd donkere tekst (contrast ±11:1). Geel wordt nooit als tekstkleur op een lichte achtergrond gebruikt. Alle kleurcombinaties zijn met axe-core gecontroleerd (0 contrastfouten).

### Typografie
- **Bricolage Grotesque** (variabel, 41 KB): koppen en prijzen. Zelfverzekerd, maar vriendelijk en rond.
- **Inter** (variabel, 48 KB): lopende tekst en formulieren.
- Beide worden zelf gehost (geen Google Fonts-verzoeken, dus AVG-vriendelijk) en via `preload` geladen met `font-display: swap`.
- De groottes schalen vloeiend met `clamp()`. De basistekst is 17 px en formuliervelden zijn ≥ 16 px, zodat iOS niet inzoomt.

### Componenten
Header met mobiel menu · hero · knoppen (primary, secondary, outline-light, ghost) · voordeelkaarten · instructeurprofiel · tariefkaarten · vergelijkingstabel · twijfelband · stappenplan · werkgebied · FAQ-accordeon (`<details>`) · proeflesformulier met resultaatstaten · contactopties · paginaheader met kruimelpad · footer · sticky mobiele CTA.

### Motion
- Hero: tekst en beeld komen gefaseerd binnen (≤ 1,1 s), de wegmarkering beweegt en de lesauto "zweeft" licht.
- Secties: fade/slide bij binnenkomen via IntersectionObserver. De content staat al in de HTML, dus er wacht niets op JavaScript.
- Hover: knoppen komen iets omhoog en de pijl schuift mee; kaarten tillen op.
- `prefers-reduced-motion: reduce` zet alle animaties en transities uit. Zonder JavaScript is alles direct zichtbaar.
