# 11 — Volkara in Shopify zetten

Het Volkara-thema is een compleet Shopify-thema (Online Store 2.0, net als Dawn). Je zet het **naast** je huidige Dawn-thema en publiceert het pas als alles klopt. Dawn blijft gewoon bewaard als terugvaloptie.

> **Waarom niet ín Dawn?** Volkara gebruikt eigen secties, stijlen en scripts die op elkaar zijn afgestemd: kleuren, lettertypes, winkelwagen-lade, bundels en de 3D-scène. Die stukje voor stukje in Dawn plakken geeft dubbele stijlen en kapotte onderdelen. Een eigen thema uploaden is sneller, veiliger en makkelijk terug te draaien.

## Vanaf je huidige Dawn-thema (callix-nl)

Je Dawn-export (Dawn 16.1.0, 12-10-2026) is onaangepast: standaardinstellingen, standaard homepage, geen logo, geen app-embeds en geen eigen code. Er hoeft dus niets van Dawn mee. Volkara neemt alle functies van Dawn over (account, zoeken, blog, cadeaukaart, wachtwoordpagina, winkelwagen) en heeft er twee Dawn-secties bij gekregen:

- **Apps**: voor app-blokken, bijvoorbeeld een reviews-widget op een pagina.
- **Custom Liquid**: voor eigen code of een embed.

Niet overgenomen, want niet in gebruik in je winkel: de B2B-bestellijst (*Quick order list*) en *Ophalen in de winkel* (pickup availability).

Upload `volkara-callix-nl.zip` (stap 1 hieronder). Dawn blijft in je themabibliotheek staan als terugvaloptie.

## Wat je nodig hebt

Draai `npm run package`. Dat maakt:

- **`dist/volkara-theme.zip`** — het thema (±3 MB)
- **`dist/shopify-setup/`** — alles om over te nemen in Shopify-beheer:
  - `products-import.csv`
  - de paginateksten in `pages/*.html`
  - een overzicht van menu's en collecties in `README.md`

## Stap voor stap

### 1. Thema uploaden
*Online Store → Thema's → Thema toevoegen → ZIP-bestand uploaden* → kies `volkara-theme.zip`. Het thema verschijnt onder "Themabibliotheek". **Nog niet publiceren.**

### 2. Taal
*Instellingen → Talen*: zet **Nederlands** als standaardtaal. Het thema heeft Nederlands als standaard (`nl.default.json`) en Engels als tweede taal.

### 3. Metavelden aanmaken (vóór de productimport)
*Instellingen → Aangepaste gegevens → Producten*:

| Naam | Namespace en sleutel | Type |
|---|---|---|
| Ondertitel | `custom.subtitle` | Tekst (één regel) |
| Badge | `custom.badge` | Tekst (één regel) |
| Specificaties | `custom.specs` | JSON |
| Onderhoud | `custom.care` | Rich text |

Sterren en het aantal beoordelingen komen uit `reviews.rating` en `reviews.rating_count`. Die vult een reviews-app (Judge.me, Loox, Okendo) automatisch. Wil je ze handmatig zetten, maak dan de standaarddefinities "Productbeoordeling" en "Aantal productbeoordelingen" aan.

### 4. Producten importeren
*Producten → Importeren* → `products-import.csv`. Producten komen binnen als **concept** met voorraad 0. Daarna per product:

- **Foto's en video uploaden.** De studiofoto en -video staan in het thema (`assets/vk-visual-*.webp`, `assets/vk-video-pan.mp4`). Upload de originelen ook bij het product zelf.
- **Sjabloon kiezen** in de zijbalk *Thema-sjabloon*:

| Product | Sjabloon |
|---|---|
| Gehamerde Titanium Pan | `product.gehamerde-pan` (bundels, 3D-scène, productieproces, reviews) |
| Wok, hapjespan, steelpan, kookpan, sets | `product.cookware` |
| Messen, snijplank, keukengerei, deksel | `product` (standaard) |

- **Voorraad en prijzen** controleren, daarna de status op *Actief* zetten.
- Bij de Gehamerde Titanium Pan staat de vergelijkingsprijs €280 alleen bij 20 cm. Zie de Omnibus-regel in `docs/09-claims-controle.md`.

### 5. Collecties, pagina's en menu's
Volg `dist/shopify-setup/README.md`:

- **Collecties:** automatisch op producttag, met precies deze handles: `pans`, `woks`, `pots`, `sets`, `knives`, `accessories`, `cutting-boards`, `bestsellers`.
- **Pagina's:** plak de HTML uit `pages/*.html` in de HTML-weergave van de editor en kies het genoemde sjabloon. *Veelgestelde vragen*, *Ons verhaal* en *VolcanicCore™* krijgen hun inhoud uit het sjabloon; die pagina's mogen leeg blijven.
- **Menu's:** `main-menu`, `footer-shop`, `footer-help` en `footer-legal`.

### 6. Beleid
*Instellingen → Beleid*: vul de privacyverklaring, algemene voorwaarden, het verzendbeleid en het terugbetalingsbeleid in. De footer linkt daar automatisch naar.

### 7. Thema-instellingen controleren
*Thema aanpassen → Thema-instellingen*:

- **Merkbeloftes:** Gratis verzending · 30 dagen retour · 25 jaar garantie · Veilig betalen
- **Winkelwagen → drempel gratis verzending:** 0. De balk staat uit omdat verzending altijd gratis is.
- **Winkelwagen → Shipping is always free:** aan. De winkelwagen toont dan "Verzending: Gratis" boven het totaal. Zet je verzendtarieven in Shopify ook echt op gratis.
- **Visuals → bundled visuals:** aan. Dan gebruiken de secties je studiofoto's tot je eigen afbeeldingen kiest.
- **Animations:** luxe cursor, filmkorrel en vonken. Alles is uit te zetten.

### 8. Productpagina afmaken
In *Thema aanpassen* → de productpagina met sjabloon `gehamerde-pan`:

- **Countdown:** vul een echte einddatum in, bijvoorbeeld `2026-11-30T23:59:00+01:00`. Zonder datum blijft de timer verborgen.
- **Reviews:** vervang de drie citaten door echte reviews, of voeg het blok van je reviews-app toe.
- **Bundels:** *Enkel* toont de maten in de kaart. Bij *Set* (2 pannen) en *Complete set* (3 pannen) kiest de klant per pan zelf de maat. Elke pan gaat als losse regel in de winkelwagen. Alleen de gekozen kaart klapt open.
- **Bundelkorting instellen (verplicht).** De 10% en 20% zie je pas in de winkelwagen als je ze in Shopify aanmaakt: *Kortingen → Korting maken → Bedrag korting op producten → Automatische korting*.
  1. "Bundelkorting 10%": percentage 10, van toepassing op het product *Gehamerde Titanium Pan*, minimale aankoopvereiste *Minimum aantal artikelen: 2*.
  2. "Bundelkorting 20%": percentage 20, zelfde product, *Minimum aantal artikelen: 3*.
  Shopify past automatisch de hoogste toe. Wil je geen korting, zet dan in het blok *Bundle tiers* de velden *Tier 2/3 discount shown* op 0. Anders klopt de getoonde prijs niet met de winkelwagen.
- **Gratis e-book:** *Thema-instellingen → Cart → Add this product free to every order*: kies het e-book. Het e-book moet in Shopify **€0,00** kosten (een vergelijkingsprijs mag), anders voegt het thema het niet toe. Zet bij een digitaal product *Voorraad bijhouden* uit en *Dit is een fysiek product* uit.
- **Verzendverzekering:** maak in Shopify een product *Verzendverzekering* van €4,95 aan: geen fysiek product, voorraad niet bijhouden, wel beschikbaar in het verkoopkanaal *Online Store*. Kies het daarna bij *Thema-instellingen → Cart → Insurance product*. In de winkelwagen verschijnt dan een schakelaar die standaard **uit** staat. Een vooraf aangevinkte betaalde extra mag niet in de EU. Pas de tekst onder de schakelaar aan op wat je verzekering echt dekt. Wil je het product niet in zoekresultaten, zet dan het metaveld `seo.hidden` op 1.
- **Koopknop:** alleen "In winkelwagen", zonder aantal en zonder Apple Pay of Shop Pay. Wil je ze terug, dan zitten ze als schakelaar in het blok *Buy buttons*.

### 9. Bekijken en publiceren
Gebruik *Voorbeeld* en loop het af: homepage, collectie, de pan, de winkelwagen en de checkout (met een testbestelling). Klaar? Klik dan op **Publiceren**. Dawn blijft in je bibliotheek staan.

## Effecten en instellingen per sectie

| Effect | Waar aan/uit |
|---|---|
| Draaibare 3D-pan met "Ontdek de lagen" en vier scrollscènes | Sectie *Pan explorer (3D)*. Staat in het thema, maar niet op een pagina; toe te voegen via *Sectie toevoegen* |
| Tijdlijn "Van ontwerp tot afgewerkt product" | Sectie *Process steps* op de productpagina |
| 3D-scène met vonken en vloeibaar metaal | Sectie *Forge stage* (homepage en productpagina) |
| Zwevende zeshoekjes en vonken bij de productfoto, foto kantelt mee | Productsectie → *Gallery effects* |
| Secties schuiven over elkaar heen (desktop) | *Stack effect* in Problem, Solution, Reviews en Comparison |
| Bewegende hoogtelijnen | *Animated contour lines* in CTA, Reviews en Comparison |
| Achtergrondvideo in de hero | Hero → *Bundled video*, of upload een eigen video |

Bij "minder beweging" in de systeeminstellingen zien bezoekers automatisch een rustige versie.
