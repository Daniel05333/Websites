# 3. Oplevering, tests en open punten

## Status

De nieuwe website is **gebouwd en lokaal getest**. Hij is **niet gepubliceerd**: er was geen toegang tot de hosting van nexdmedia.com.

## Wat is gebouwd

13 pagina's, gegenereerd uit één databestand (`src/data/site.mjs`) en één dienstenbestand (`src/data/services.mjs`):

| Pagina | Inhoud |
|---|---|
| `/` | hero met 3D Conversion Engine → specialisatie & feiten → probleem → De NEXD-aanpak (scrollgestuurde stapel) → diensten → cases met metric-balken → keuzehulp → team → werkwijze → FAQ → finale CTA |
| `/website-laten-maken.html` | overzicht: keuzehulp, overige diensten, werkwijze, FAQ |
| 7 dienstpagina's | standaard, maatwerk, optimaliseren, WordPress, blogs, SEO, fotografie. Elk met eigen motief, doelgroep, probleem, leverlijst, prijskaart, traject, FAQ en gerelateerde diensten |
| `/over-ons/` | principes, team, cases |
| `/contact/` | formulier, bellen/mailen/WhatsApp, bedrijfsgegevens, werkwijze |
| `/privacy/`, `/404.html` | |

**Technisch**

- Statische HTML, één CSS-bestand en één klein JS-bestand (4,6 kB gzip) voor alles behalve de 3D.
- Geen framework, geen CMS, geen trackers en geen externe scripts of CDN's. Alle fonts zijn zelf gehost.

**SEO**

- Per pagina een unieke title en description, canonical en Open Graph.
- JSON-LD: `ProfessionalService` (organisatie), `Service` met `Offer`, `BreadcrumbList` en `FAQPage`.
- Gegenereerd: `sitemap.xml`, `robots.txt`, en `.htaccess` met 301's van de oude WordPress-URL's, www → zonder www en https.

**Toegankelijkheid**

- Semantische landmarks, een skip-link en zichtbare focus.
- Een formulier met labels, een foutsamenvatting en `aria-invalid`.
- Een toetsenbordbedienbare keuzehulp (native radio's) en een FAQ met `<details>`.
- Touch targets ≥ 44 px en reduced-motion-ondersteuning.
- De 3D-scène is `aria-hidden`; de fasen staan als tekst in de pagina.

**Werkt zonder JavaScript:** alle content, alle drie de pakketten tegelijk, de FAQ en de links.

## Gebruikte technologie (en wat bewust niet)

| Gebruikt | Waarvoor |
|---|---|
| Node (build-script, ES-modules) | HTML genereren uit data |
| three.js r160 via esbuild | alleen de 3D-hero; los bundle, pas geladen na `load` + idle |
| CSS (custom properties, 3D-transforms, `:has`) | design system, de aanpak-stapel, keuzehulp-styling |
| IntersectionObserver | reveals, aanpak-stappen, sticky CTA, pauzeren van de 3D |
| Playwright + axe-core | browsertests, screenshots, OG-afbeelding |

**Niet gebruikt:**

- **GSAP:** het aantal animaties rechtvaardigt geen extra library.
- **React / React Three Fiber:** geen bestaande React-stack en geen interactiviteit die het nodig maakt.
- **Tailwind**, **video** en **gegenereerde beelden**.

## Interactieve onderdelen

1. **Conversion Engine (WebGL):**
   - deeltjesstroom door vier kaders, met afhaken, kleuromslag en een pulserende aanvraag;
   - kantelt mee met de cursor;
   - draait bij scrollen naar vooraanzicht en laat wireframe-regels verschijnen;
   - pauzeert buiten beeld en in een verborgen tab;
   - minder deeltjes en een lagere pixelratio op zwakke of kleine apparaten;
   - laadt niet bij `prefers-reduced-motion`, Save-Data of zonder WebGL; dan blijft de SVG-compositie staan.
2. **De NEXD-aanpak:** de laag van de stap die in beeld is schuift op zijn plek in een 3D-stapel (CSS). Op mobiel staat de stapel compleet en lezen de stappen als lijst.
3. **Keuzehulp:** de situatie bepaalt welk pakket je ziet. De CTA neemt de keuze mee naar het formulier (`?project=…`).
4. **Contactformulier:** validatie, foutsamenvatting, honeypot en drie eerlijke eindtoestanden (zie hieronder).
5. **Kleinere interacties:**
   - mobiel menu (focus en Esc);
   - sticky mobiele CTA (verborgen bij hero, formulier en footer);
   - FAQ;
   - metric-balken die groeien;
   - hovers.

### Formulier: zo werkt het nu

`site.form.endpoint` is **leeg**, omdat de bestaande formulierkoppeling niet bekend is. In die situatie toont het formulier **geen** "bedankt, verstuurd"-melding. Na geldige invoer staat het bericht klaar als e-mail (`mailto:`) of WhatsApp-bericht, met alle gegevens ingevuld; de bezoeker verstuurt het zelf.

Zodra je een endpoint invult dat JSON accepteert (Formspree, Basin, een eigen API, een CRM-webhook):

- gaat de aanvraag rechtstreeks naar dat endpoint;
- ziet de bezoeker bij succes een bevestiging;
- krijgt de bezoeker bij een fout een eerlijke foutmelding met alternatieven.

Beide paden zijn getest met een gemockt endpoint (200 en 500).

## Uitgevoerde tests (`npm test`)

Alle tests zijn op deze oplevering uitgevoerd en geslaagd, in Chromium 141 (Playwright 1.56, headless, WebGL via SwiftShader).

**Statisch** (`tests/check-static.mjs`), over 13 pagina's:

- interne links en ankers;
- unieke titles en descriptions (70–170 tekens);
- precies één h1;
- `lang`, alt-teksten, geldige JSON-LD en unieke id's;
- de aanwezigheid van sitemap, robots, `.htaccess`, OG-beeld en engine;
- een **claims-guard**, die faalt als een van de onbevestigde claims of oude prijzen uit de audit op de site verschijnt.

**Browser** (`tests/e2e.mjs`):

- **Layout:** alle 13 pagina's op 320, 375, 768, 1024 en 1440 px, zonder horizontale overflow, consolefouten of mislukte requests.
- **Toegankelijkheid:** axe-core (WCAG 2.1 A/AA en best practices) op alle 13 pagina's, desktop en mobiel: **0 overtredingen**.
- **3D-hero:**
  - de SVG-fallback staat in de HTML;
  - WebGL laadt en de canvas wordt zichtbaar zonder fouten;
  - de canvas bevat pixels;
  - de render-loop stopt buiten beeld;
  - bij reduced-motion wordt `engine.js` niet eens opgehaald.
- **Navigatie en contact:**
  - alle menulinks en het anker naar de cases;
  - alle tel-, mailto- en WhatsApp-links (nummer, tekst, `noopener`);
  - prijzen consistent tussen homepage, keuzehulp en dienstpagina;
  - keuzehulp met muis en pijltjestoetsen;
  - de CTA neemt het project mee naar het formulier;
  - 301-regels voor de oude URL's;
  - FAQ met het toetsenbord;
  - de skip-link;
  - de aanpak-stap activeert de juiste laag.
- **Mobiel:** het menu (focus, Esc, navigatie), het gedrag van de sticky CTA en touch targets.
- **Formulier:**
  - lege en ongeldige invoer;
  - de foutsamenvatting met focus;
  - het pad zonder endpoint (geen nepbevestiging);
  - "gegevens aanpassen";
  - endpoint met status 200 en 500;
  - de honeypot.
- **Zonder JavaScript:** hero, cases en alle drie de pakketten zichtbaar.

**Performance**, gemeten met Playwright tegen de lokale server. Dit is geen productiehosting en geen Lighthouse; het gaat om relatieve waarden.

| | LCP | CLS |
|---|---|---|
| Desktop: home / maatwerk / contact | 0,68 s / 0,36 s / 0,42 s | 0,001 |
| Mobiel (4× CPU-vertraging, ~9 Mbit/s, 150 ms latency): home / maatwerk / contact | 0,72 s / 0,66 s / 0,70 s | 0,000 |

**Gewicht** (gzip):

- HTML homepage: 14 kB
- CSS: 9,5 kB
- main.js: 4,6 kB
- Fonts: 89 kB (drie woff2, waarvan twee met preload)
- 3D-bundle: 121 kB (geladen ná `load` en idle, dus niet in het kritieke pad)

**Niet getest:**

- Safari/iOS en Firefox;
- echte apparaten;
- Lighthouse op productiehosting;
- een schermlezer (alleen geautomatiseerd met axe);
- het daadwerkelijk afleveren van e-mail en WhatsApp-berichten.

## Te bevestigen door NEXD Media

| # | Wat | Waarom | Waar aanpassen |
|---|---|---|---|
| 1 | **Actuele prijzen** standaard (€ 1.795) en maatwerk (€ 4.495), en of ze incl. of excl. btw zijn | de huidige site noemt 3–4 verschillende bedragen | `packages` in `src/data/site.mjs` + teksten in `faq` en `services.mjs` |
| 2 | Bestaat het **premium-pakket** (€ 7.795) nog? | maar één bron | `packages` |
| 3 | Inhoud maatwerkpakket: "inclusief fotografie" en de hosting van € 25/mnd; hoeveel maanden conversie-optimalisatie? | bronnen verschillen | `packages`, `services.mjs` |
| 4 | **Case Dresschers**: welk cijfer klopt (+164% of 37 → 61 / +38%)? Mag de naam gebruikt worden? | tegenstrijdig | `cases` |
| 5 | **"124 i.p.v. 32"**: Countus of Dresschers? Toestemming voor de quote | aan beide toegeschreven | `cases` |
| 6 | Claims "26 jaar ervaring", "1500+ websites", "200+ klanten", "+73% gemiddeld": onderbouwing? | onverenigbaar met oprichting 2023 | pas na onderbouwing toevoegen, en dan uit de guard in `tests/check-static.mjs` halen |
| 7 | **WhatsApp-nummer** = 06 11 90 72 55? | aanname | `contact.whatsapp` |
| 8 | **Formulier-endpoint** / CRM | onbekend | `form.endpoint` |
| 9 | **Teamportretten**, volledige namen en functies van Bas, Ron en Sara | nu monogrammen | `team[].photo`, afbeelding in `assets/img/` |
| 10 | **Logo en huisstijl** | de huidige site was niet te inspecteren; nu een typografisch woordmerk met kadermotief | `mark()` in `src/components/layout.mjs`, tokens in `main.css` |
| 11 | **Privacyverklaring** | nu een basistekst voor contactgegevens; afstemmen op de bestaande verklaring en eventuele analytics | `privacy` in `src/pages/pages.mjs` |
| 12 | **Analytics** (GA4 / Search Console) | niet toegevoegd zonder akkoord en cookiekeuze | `head` in `layout()` |
| 13 | Projectbeelden of screenshots van de websites van Dresschers en Countus | cases zijn nu typografisch, zonder beeld | `cases` + component in `sections.mjs` |

## Bekende beperkingen

- **De blog en kennisbank** (`/blogs.html`, `/blog/`, losse artikelen, `/knowledge-base/…`) zijn **niet gemigreerd**. De artikelen waren niet op te halen. Neem ze over op hun huidige URL's (of voeg 301's toe) vóór livegang, anders gaan die zoekposities verloren. Er is daarom ook geen "Kennis"-item in het menu.
- **3D-bundle:** ondanks tree-shaking is die 121 kB gzip, omdat `WebGLRenderer` het grootste deel van three.js-core meebrengt. Hij blokkeert niets. Wil je hem kleiner, dan kan een eigen minimale WebGL-renderer van ± 15 kB, maar dat kost onderhoudbaarheid.
- **Hosting:** de `.htaccess` gaat uit van Apache. Bij andere hosting (Netlify, Vercel, nginx) moeten de redirects worden omgezet.
- **Copy:** de copy is nieuw geschreven op basis van de bestaande positionering en diensten. Laat NEXD de tone of voice controleren.

## Livegang: stappen

1. Werk de punten hierboven bij in `src/data/`.
2. Draai `npm install` en daarna `npm test` (bouwt en test).
3. Upload de inhoud van `public/` naar de hosting.
4. Migreer de blog en controleer in Search Console de sitemap en de 301's.
