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
