# 09 — Claims en gegevens om te controleren

De website noemt alleen de kern van het product als vaststaand feit. Alles hieronder staat op de site, maar moet je zelf bevestigen of invullen voordat je live gaat. Kopieer niets naar de site dat je niet kunt onderbouwen.

## 1. Productspecificaties (productdata: `custom.specs`, technologie-sectie)

| Claim | Waar | Status |
|---|---|---|
| Titanium kookoppervlak, geen coating | Overal (kernbelofte) | Bevestigen met leverancier |
| PFAS-, PTFE- en PFOA-vrij | Hero, USP's, FAQ, vergelijking | Bevestigen; bij voorkeur met een testrapport |
| Vijf lagen (titanium, titanium, aluminium, rvs 18/10, rvs 18/0) | VolcanicCore™-sectie, specificaties | Bevestigen |
| Ovenbestendig, maximale temperatuur (nu 260 °C in de specificaties) | Specificaties | Bevestigen per product, ook voor de steel en de glazen deksels |
| Vaatwasserbestendig | USP's, FAQ | Bevestigen |
| Metalen keukengerei toegestaan | USP's, FAQ, vergelijking | Bevestigen |
| Geschikt voor inductie en alle warmtebronnen | Hero, USP's, FAQ | Bevestigen |
| Gewicht ("lichter dan gietijzer") | FAQ, vergelijking | Bevestigen; exacte gewichten per maat toevoegen aan de specificaties |
| Inhoud van de sets (7- en 12-delig) | Productpagina's sets | Invullen: welke producten zitten erin? |
| Prijzen en "van-prijzen" van de sets | Sets, collectiepagina | Van-prijs = som van de losse prijzen. Alleen tonen zolang dat klopt. |

## 2. Commerciële voorwaarden (thema-instellingen → Merkbeloftes en Winkelwagen)

| Belofte | Huidige tekst | Actie |
|---|---|---|
| Gratis verzending | "Gratis verzending vanaf €75" | Moet gelijk zijn aan je echte verzendtarieven |
| Retour | "14 dagen bedenktijd" | Wettelijk minimum, klopt altijd. Wil je meer bieden (bijv. 30 dagen), pas het dan op één plek aan |
| Garantie | "Wettelijke garantie" | Bied je een eigen (langere) garantie? Leg die vast op `/pages/warranty` en pas de teksten aan |
| Veilig betalen | "Veilig betalen" | Betaalmethoden komen uit de checkout |

Bewust **verwijderd** omdat ze niet bevestigd zijn: "levenslange garantie", "60 dagen thuis testen", "verzonden binnen 1–2 werkdagen", "reactie binnen één werkdag", openingstijden van de klantenservice, testrapporten "op aanvraag", "elke pan wordt gecontroleerd op vlakheid".

### Nieuwe pagina's (verzenden, retourneren, herroepen)

| Punt | Actie |
|---|---|
| Wie betaalt de retourkosten? | Wettelijk moet je dit vóór de aankoop melden. Vul het aan op `/pages/verzenden-en-retourneren` (nu niet genoemd) |
| Adres op het herroepingsformulier | Het modelformulier noemt nu alleen het e-mailadres. Voeg je bedrijfsadres toe |
| Landen en levertijden | Komen nu uit de checkout. Controleer of ze daar kloppen |

Voor de claims die Okura gebruikt maar Volkara (nog) niet, zie `docs/10-okura-referentie.md`, paragraaf 4.

## 3. Sociale bewijskracht

- Alle voorbeeldreviews, sterren, reviewaantallen en "klantmomenten" zijn verwijderd uit de pagina's en de productdata.
- De review-secties (`vk-reviews`, `vk-reviews-wall`, `vk-stories`) bestaan nog in de code. Zet ze pas terug met echte, controleerbare reviews (bijv. via een reviews-app die `reviews.rating` en `reviews.rating_count` vult).
- Gebruik geen "bekend van"-logo's zonder toestemming van het medium.

## 4. Contactgegevens

| Gegeven | Huidige waarde | Actie |
|---|---|---|
| E-mailadres | support@volkara.com | Controleren of dit adres bestaat |
| Openingstijden / bereikbaarheid | (verwijderd) | Toevoegen als je die wilt noemen |
| Bedrijfsgegevens (KvK, btw, adres) | Niet op de site | Verplicht voor een webshop: toevoegen in de footer of op de contactpagina |

## 5. Juridische pagina's

De footer linkt naar verzendbeleid, retourbeleid, privacyverklaring en algemene voorwaarden. Die teksten moeten nog geschreven worden; ze worden niet door het thema gegenereerd.


## 6. Door de opdrachtgever opgegeven claims (12-10-2026)

De opdrachtgever heeft deze claims aangeleverd en bevestigd. Ze staan daarom op de site. Bewaar het bewijs, want de ACM kan erom vragen.

| Claim | Waar | Bewijs nodig |
|---|---|---|
| 25 jaar garantie (materiaal- en fabricagefouten, huishoudelijk gebruik) | Trustbalk, productpagina, FAQ, garantiepagina | Schriftelijke garantievoorwaarden. De afbakening "materiaal- en fabricagefouten bij normaal huishoudelijk gebruik" is door ons geformuleerd. Controleer die. |
| Meer dan 10.000 tevreden klanten | Trustbalk homepage | Ordergegevens |
| 4,8 / 5 uit 15.500 beoordelingen | Productpagina (metafields `reviews.rating` / `reviews.rating_count`) | Exportlijst van je reviewplatform. Koppel het liefst de reviews-app die deze metafields automatisch vult. |
| Drie klantcitaten (Anna M., Sarah J., Jan K.) | Productpagina, sectie Reviews | Moeten letterlijk van echte klanten komen. Verzonnen reviews zijn verboden (UCPD, bijlage I, punt 23 ter). |
| Massief / puur titanium, handgehamerd, "eeuwenoude Japanse technieken" | Hero, specificaties, teksten | Productie- en herkomstinformatie van je leverancier |
| Hittebestendig tot 540 °C | Specificaties, verschil-sectie, FAQ | Testrapport of specificatie van de leverancier |
| Gratis verzending (geen drempel) | Overal | Moet je verzendinstellingen volgen. De voortgangsbalk in de winkelwagen staat uit (drempel 0). |
| 30 dagen retour | Overal | Moet in je algemene voorwaarden en retourbeleid staan |

### Prijzen en acties (Omnibus-richtlijn)

- **Van-prijs €280 → €84,95 ("Bespaar €195,05").** De doorgestreepte prijs moet de laagste prijs zijn die je in de 30 dagen vóór de korting hebt gerekend. Kun je dat niet aantonen, verwijder dan de vergelijkingsprijs (compare-at) bij de variant.
- **Sets.** De van-prijs is de som van de losse pannen (€174,90 en €269,85). Dat is een eerlijke vergelijking, zolang de losse prijzen kloppen.
- **"Magazijnuitverkoop" met afteltimer.** De timer staat klaar, maar verschijnt pas als je in het productblok *Countdown* een echte einddatum invult. Een timer die bij elk bezoek opnieuw begint, is misleidend en daarom niet ingesteld. Zet de actie ook echt stop op die datum.
- **Gratis Titanium Kookgids.** Deze bestaat nu als pagina (`/pages/titanium-kookgids`) en wordt vanaf de productpagina gelinkt.

## 7. 3D-weergave en productieproces op de productpagina

**Pan in 3D (sectie *Pan explorer*).** Staat nu niet op de productpagina (daar staat weer de *Forge stage*). Voeg je hem later toe: de pan is in code nagebouwd, zonder modelbestand van de leverancier. De vorm volgt de productfoto's: gehamerd kookoppervlak, uitlopende rand en een steel met klinknagels. Elk onderdeel heeft een label:

| Onderdeel | Label | Waarom |
|---|---|---|
| Kookoppervlak | Bevestigd | Massief titanium, handgehamerd, zonder PFAS/PFOA/PTFE (opgave opdrachtgever, §6) |
| Kern | Illustratief | Aantal lagen en materialen zijn **niet** opgegeven. De laag is een schets, geen specificatie |
| Buitenwand en rand | Deels bevestigd | Vorm zichtbaar op de foto's; materiaal niet apart opgegeven |
| Bodem | Deels bevestigd | Geschikt voor alle warmtebronnen (bevestigd); opbouw illustratief |
| Steel en klinknagels | Bevestigd | Bevestiging met klinknagels is zichtbaar; materiaal niet apart opgegeven |

Krijg je de echte opbouw van de leverancier (bijvoorbeeld een specificatieblad), pas dan de teksten aan in de blokken *Layer* en zet het label pas op *Bevestigd* als je het schriftelijk hebt. Noem geen laagaantal of kernmateriaal zonder bewijs.

**Van ontwerp tot afgewerkt product (sectie *Process steps*).** Een algemene tijdlijn, zonder fabrieksdetails. Alleen stappen die volgen uit bevestigde feiten: titanium kookoppervlak, handgehamerd ("eeuwenoude Japanse technieken", opgave opdrachtgever), steel met klinknagels, vier maten, geschikt voor alle warmtebronnen en de vaatwasser, 25 jaar garantie.

**Oude VolcanicCore™-pagina.** De "vijf lagen"-uitleg op `/pages/technology` is niet bevestigd (zie §1). Gebruik die pagina pas na bevestiging, of haal hem uit het menu.
