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
- **Vorm uit A:** zware display-typografie (Poppins, uit de huisstijl), duidelijke hiërarchie en één opvallende CTA-kleur.
- **Uit C alleen wat de conversie helpt:** een rustige hero-entree, bewegende wegmarkering, secties die verschijnen bij scrollen en zwevende info-chips. Geen parallax en geen 3D. Alles staat uit bij `prefers-reduced-motion`.

**Update 16-10-2026:** de echte huisstijl en foto's zijn nu verwerkt. De kleuren (donkerblauw en oranje), het woordmerk "Rijschool / Linkerbaan" en het getekende logo van Furkan komen van de bestaande site. De foto's van de lesauto en leerlingen komen van Instagram. De weg-illustratie blijft alleen als reserve in de code (als `photos.hero` leeg is).

## Merkmotief: de linkerbaan

De naam is het concept. Wegmarkeringen (gestippelde oranje lijn) keren terug als:
- de streepjes vóór elk "eyebrow"-label en onder het actieve menu-item;
- de scheidingslijnen onder pagina-headers, de twijfelband en de footer;
- de route van het stappenplan (horizontaal op desktop, verticaal op mobiel).

Het logo zelf is het bestaande getekende portret van Furkan (`assets/img/logo-furkan-*.webp`), uitgeknipt uit de schermafbeelding van de huidige site. Een origineel bestand in hoge resolutie (PNG of SVG) van de ontwerper geeft een scherper resultaat.

## Design system

### Kleur
| Token | Waarde | Gebruik |
|---|---|---|
| `--ink` | `#1B252F` | Donkerblauw uit de huisstijl: tekst, donkere secties, secundaire knoppen |
| `--paper` | `#F6F5F3` | Lichte achtergrond |
| `--paper-2` | `#ECEBE8` | Getinte secties |
| `--mist` | `#E6EAEE` | Koele neutrale steun (werkgebied) |
| `--accent` | `#EB7712` | Oranje uit de huisstijl: **alleen** voor acties en accenten |
| `--brand-text` | `#D9690B` | Woordmerk "Linkerbaan" op licht (groot en vet, 3,2:1) |
| `--accent-ink` | `#A14B00` | Oranje als gewone tekst op licht (5,5:1, AA) |
| `--muted` | `#545C66` | Secundaire tekst (AA op paper) |

De oranje knoppen hebben altijd donkere tekst (5,3:1). De huidige site gebruikt witte tekst op oranje (±2,9:1); die combinatie haalt de toegankelijkheidsnorm niet. Alle kleurcombinaties zijn met axe-core gecontroleerd (0 contrastfouten).

### Typografie
- **Poppins** (600/700/800, samen 24 KB): koppen, prijzen en woordmerk. Dit is het lettertype van de huidige huisstijl.
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
