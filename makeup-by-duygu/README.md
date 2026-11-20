# Makeup by Duygu: concept-website

Concept voor Makeup by Duygu, make-upartiest in de regio Vaassen/Apeldoorn (ook op locatie). Het is een statische one-page site (HTML, CSS en JavaScript zonder bibliotheken), zacht en elegant in nude- en rosétinten. Er zijn geen trackers en geen cookies.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:5200
npm test           # build + 28 browsertests (5 breedtes, axe, filters, vergroten, aanvraag, zonder JS, reduced motion)
npm run images     # snijdt de foto's opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** een gouden lipstick in WebGL. Tijdens het scrollen draait de lipstick uit, drijft het dopje weg en wisselt de kleur van nude naar rosé, berry, rood en mocha.
- **Portfolio:** 18 looks met filters (Bruid, Events & glam) en een vergrootweergave.
- **Behandelingen** met studio of op locatie, **reviews** uit haar highlights, **over mij** met het certificaat, en de werkwijze.
- **Aanvraag:** gelegenheid, datum, tijd, studio of op locatie (met plaats), aantal personen, naam en wensen. Het bericht wordt gekopieerd en Instagram-DM opent.

## Nog na te kijken (src/site.mjs)

- **Prijzen** per behandeling (nu "op aanvraag") en eventueel reiskosten voor op locatie.
- **Teksten:** de tekst bij "Over mij" en de behandelingen zijn geschreven op basis van haar profiel. Laat haar die aanpassen in haar eigen woorden.
- **Reviews:** overgenomen uit haar highlights, zonder namen of profielfoto's. Vraag of ze ze zo wil tonen.
- **Foto's van klanten:** vraag of ze ook op de website mogen. Foto's met partners en de selfie met haar docent zijn weggelaten. Op het certificaat is alleen de bovenkant gebruikt, zonder haar achternaam.
- **Domein:** vul het in en zet daarna `draft: false`.
