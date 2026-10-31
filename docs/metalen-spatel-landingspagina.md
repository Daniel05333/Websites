# Landingspagina "Metalen spatel? Ga je gang."

Een tweede productpagina voor de **Gehamerde Titanium Pan**, gebouwd op de advertentiecreatives
"Metalen spatel? Ga je gang.". De bestaande pagina (`templates/product.gehamerde-pan.json`) is niet aangeraakt.

## Nieuwe bestanden (12), geen bestaande bestanden gewijzigd

| Bestand | Doel |
|---|---|
| `templates/product.metalen-spatel.json` | De nieuwe producttemplate (suffix `metalen-spatel`) |
| `sections/vk-lp-hero.liquid` | Hero: dezelfde kop, subregel, pan en crèmekleurige aanbiedingsbalk als de advertentie |
| `sections/vk-lp-pain.liquid` | Het probleem: de "regels" van een antiaanbakpan |
| `sections/vk-lp-freedom.liquid` | De oplossing: de vijf vinkjes uit de advertentie + rode band "Eindelijk een pan…" |
| `sections/vk-lp-versus.liquid` | Antiaanbakpan vs. titanium |
| `sections/vk-lp-routine.liquid` | Eerlijke verwachting: zo kook je zonder coating (voorverwarmen) |
| `sections/vk-lp-offer.liquid` | Afsluitende aanbieding |
| `snippets/vk-lp-offer-bar.liquid` | Aanbiedingsbalk: "Nu tot X% korting", X berekend uit echte vergelijkingsprijzen |
| `snippets/vk-lp-media.liquid` | Afbeelding: eigen upload of het meegeleverde beeld |
| `assets/vk-lp.css` | Styling, volledig gescoped op `.vk-lp*` |
| `assets/vk-lp-pan-top.webp` | Pan uit creative 4 (zonder tekst) |
| `assets/vk-lp-pan-angle.webp` | Pan uit creative 2 (zonder tekst) |

De koopsectie is de bestaande sectie `vk-main-product` (alleen *gebruikt*, niet gewijzigd), met dezelfde
varianten, bundels (Enkel / Set / Complete set), winkelwagen, sticky balk en betaalmethoden als de huidige pagina.
Alleen de badge, USP-tegels en galerijlabel zijn afgestemd op de advertentie. De bestaande secties `vk-faq` en
`vk-reviews` worden op dezelfde manier hergebruikt.

## Paginaopbouw

1. **Hero**: "Metalen spatel? / Ga je gang." (rood), "Geen coating die kan krassen. Schrapen, schuren, vaatwasser: hij kan het hebben.", de pan, "Nu tot X% korting · Gratis verzending · 30 dagen retour" en de rode knop **Bestel nu** naar de koopsectie
2. **Koopsectie**: galerij, prijs, maat, bundels, in winkelwagen
3. **Herkenbaar?** Alleen houten of siliconen spatels · voorzichtig afwassen · niet te heet · één verkeerde beweging
4. **Het kan anders**: de vijf vinkjes uit de advertentie, met onderbouwing uit de huidige productinformatie
5. **Antiaanbakpan vs. titanium**
6. **Eerlijk is eerlijk**: voorverwarmen, olie, koken, schoonmaken (haalt het belangrijkste koopbezwaar weg en voorkomt retouren)
7. **Reviews**: staat *uit* (zie hieronder)
8. **FAQ**: herordend op de bezwaren uit de advertentie, plus een vraag over retourneren
9. **Afsluitende aanbieding**

## Koppelen

### Optie A, aanbevolen: zelfde product, aparte URL
Geen productwijziging nodig. Voorraad, reviews, automatische kortingen en statistieken blijven gedeeld met het
bestaande product.

`https://www.volkara.nl/products/gehamerde-titanium-pan?view=metalen-spatel`

De bestaande URL zonder `?view=` blijft precies de huidige pagina tonen.

### Optie B: een apart product
1. Shopify admin → Producten → Gehamerde Titanium Pan → **Meer acties → Dupliceren**.
2. Geef het duplicaat een eigen handle, bijv. `gehamerde-pan-metalen-spatel`.
3. Kies rechts bij **Thema-template** voor `metalen-spatel` en sla op.
4. URL: `https://www.volkara.nl/products/gehamerde-pan-metalen-spatel`

Let op: een duplicaat heeft eigen voorraad en eigen reviews. Voeg het ook toe aan de automatische korting
(bundelkorting), anders klopt de bundelprijs in de winkelwagen niet. Haal het eventueel uit collecties en zoeken.

## Installeren zonder risico

Doe **geen** volledige `shopify theme push` vanuit deze repository naar het live thema, want de repository bevat
ook ander werk dat nog niet live staat. Zet alleen de 12 nieuwe bestanden over:

```bash
shopify theme push --store volkara.myshopify.com --theme <LIVE_THEME_ID> --nodelete \
  --only "templates/product.metalen-spatel.json" --only "sections/vk-lp-*" \
  --only "snippets/vk-lp-*" --only "assets/vk-lp*"
```

Wil je eerst een preview zonder het live thema aan te raken? Upload dan het complete zip-bestand
(live-export + 12 nieuwe bestanden) via *Online Store → Themes → Add theme → Upload zip* en open daar het voorbeeld.

## Bewust níet gedaan

- **Reviews staan uit.** De reviews-sectie meldt zelf dat de voorbeeldreviews alleen voor de lay-out zijn. Zet de
  sectie pas aan met echte, geverifieerde reviews (of een reviews-app-blok). De sterren boven de kop en in de
  koopsectie komen uit de reviews-metafields van je app en zijn dus echt.
- **Geen vaste "70%".** De korting wordt berekend uit de echte prijzen in Shopify (hoogste korting van alle maten,
  naar beneden afgerond). Zonder vergelijkingsprijs verdwijnt de regel.
- **Geen nieuwe claims.** Alle claims komen uit de advertentie of uit de huidige productpagina (PFAS-vrij,
  25 jaar garantie, vaatwasser, metalen keukengerei, tot 540 °C, voorverwarmen).
