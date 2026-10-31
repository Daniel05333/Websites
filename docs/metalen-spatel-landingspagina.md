# Productpagina "Metalen spatel? Ga je gang."

Een tweede productpagina voor de **Gehamerde Titanium Pan**, met precies dezelfde secties, volgorde, branding en
functies als de huidige pagina (`templates/product.gehamerde-pan.json`). Alleen de teksten leggen de nadruk op
het gebruik van een metalen spatel (de boodschap van de advertenties).

## Eén nieuw bestand

`templates/product.metalen-spatel.json`: een kopie van `product.gehamerde-pan.json` met andere teksten:

- Koopsectie: badge "Metalen spatel? Ga je gang.", eerste USP-tegel "Metalen spatel? Prima.", galerijlabel
- 3D-sectie: eerste slide "Metalen spatel? / Ga je gang.", derde slide "Hij kan het hebben" (schrapen, schuren, vaatwasser)
- Probleemsectie: "Met een antiaanbakpan sta je altijd op je hoede.", eerste kaart over hout/siliconen spatels
- Vergelijking: bovenaan de rijen "Metalen spatel" en "Schuren & vaatwasser"
- FAQ: "Kan ik metalen keukengerei gebruiken?" staat bovenaan
- Afsluiting: "Eindelijk een pan waar je niet voorzichtig mee hoeft te zijn."

Geen bestaand bestand is gewijzigd. De ondertitel onder de producttitel komt uit het productveld
`custom.subtitle` en is daarom op beide pagina's gelijk.

## Toevoegen in Shopify

1. Online Store → Themes → live thema → **⋯ → Edit code**
2. Map `templates` → **Add a new template** → type **product**, formaat **JSON**, naam `metalen-spatel` → Done
3. Vervang alle inhoud door de inhoud van `templates/product.metalen-spatel.json` → Save

URL (zelfde product, andere template):
`https://www.volkara.nl/products/gehamerde-titanium-pan?view=metalen-spatel`

Of: dupliceer het product en kies rechts bij "Thema-template" `metalen-spatel`.
