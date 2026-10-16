# 01 · Websiteaudit Rijschool Linkerbaan

_Datum: 16 oktober 2026_

## Wat kon wel en niet worden onderzocht

| Bron | Resultaat |
|---|---|
| `https://www.rijschoollinkerbaan.nl/` en de subpagina's | **Niet bereikbaar.** De domeinnaam gaf `ENOTFOUND` (DNS lost niet op), zowel vanuit de buildomgeving als via een externe fetch-dienst. Het domein kan offline of verlopen zijn, of de DNS is niet goed ingesteld. **Controleer dit eerst: zonder werkende DNS is de site voor niemand bereikbaar.** |
| Internet Archive (Wayback Machine) | Niet bereikbaar vanuit deze omgeving (netwerkbeleid). |
| Zoekmachine | Geen resultaten voor "Rijschool Linkerbaan" of het domein. |
| Codebase | De repository bevat geen code van de rijschoolsite, alleen een ongerelateerd Shopify-thema (VOLKARA). Hosting, CMS, formulierplug-in en aanmeldsysteem van de huidige site zijn dus **onbekend**. |
| Logo, foto's, video's | Niet beschikbaar. |

Daardoor is deze audit gebaseerd op **de inhoud die in de opdracht van de bestaande site is overgenomen** (pakketten, prijzen, werkgebied, contactgegevens, Furkan als eigenaar/instructeur). Over het huidige ontwerp, de huidige laadsnelheid, SEO-metadata en het bestaande formulier zijn bewust **geen uitspraken** gedaan: die kon ik niet bekijken.

## Bevindingen op basis van de beschikbare inhoud

### Conversie
- **Er is maar één echte drempel: de proefles.** De pakketinfo vermeldt een gratis proefles alleen bij "Beginners". Voor de andere pakketten is onduidelijk of die ook gratis is. Bezoekers met rijervaring twijfelen dan sneller. → Aanbeveling: laat de rijschool dit bevestigen en communiceer het per pakket.
- **De pakketverschillen zijn niet consistent beschreven.** "Ophalen aan huis" staat bij 1 en 2, niet bij 3. "Persoonlijk lesplan" staat alleen bij 1. "Lesduur" ontbreekt bij 3. Waarschijnlijk zijn dat omissies en geen echte verschillen, maar een bezoeker leest ze als verschil. → In de nieuwe vergelijking staat bij ontbrekende onderdelen eerlijk "niet genoemd", niet "nee".
- **Examen is niet gespecificeerd.** "Examenbegeleiding" (2) en "Praktijkexamen inbegrepen" (3) roepen vragen op: welk examen, hoeveel pogingen, wat bij een herexamen? → Te bevestigen.
- **Het aanmeldsysteem is onbekend.** De bestaande site meldt dat aanmeldingen in "een systeem" terechtkomen. Welk systeem dat is (plug-in, rijschoolsoftware, e-mail), kon niet worden vastgesteld.

### Vertrouwen
- Het sterkste vertrouwenssignaal, een persoonlijke instructeur met naam, wordt alleen benut als er een **echte foto** van Furkan en de lesauto bij staat. Zonder foto blijft de persoonlijke belofte abstract.
- Er zijn geen reviews of slagingspercentages beschikbaar. Die zijn dus ook niet verzonnen. Echte Google-reviews (met toestemming) zouden de grootste vertrouwenswinst opleveren.

### Technische risico's
- **DNS / bereikbaarheid** (zie boven): het grootste risico.
- WhatsApp-nummer onbekend: als het 085-nummer niet aan WhatsApp Business is gekoppeld, werken alle WhatsApp-knoppen niet.
- Ontbrekende KvK- en adresgegevens: nodig voor de privacyverklaring en voor lokale SEO (Google Bedrijfsprofiel).

## Kansen
1. **Proefles als enige, duidelijke hoofdactie**, op elke pagina en via een sticky balk op mobiel.
2. **Eerlijke, vergelijkbare tarieven** met een tabel die ook op 320 px past.
3. **Persoonlijk merk rond Furkan** en de naam "Linkerbaan" (de baan van vooruitgang), met wegmarkeringen als herkenbaar visueel motief.
4. **Lokale vindbaarheid** via één goede werkgebiedsectie en gestructureerde data (`DrivingSchool` met `areaServed`), zonder dunne plaatsnaampagina's.
5. **Snelheid**: een statische site zonder CMS-overhead, met zelf gehoste fonts en zonder trackingscripts.
