# Petit Photobooth: concept-website

Concept voor Petit Photobooth (photobooth en mirrorbooth, boekbaar in Nederland en Duitsland). Statische one-page site (HTML, CSS en JavaScript zonder bibliotheken) in crème en goud met het Petit-logo. Geen trackers, geen cookies.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:5300
npm test           # build + 26 browsertests
npm run images     # snijdt foto's en logo opnieuw uit bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** drie fotostrips met gastenfoto's die in 3D zweven, de muis volgen en openwaaieren tijdens het scrollen, met een cameraflits.
- **Gelegenheden:** bruiloft, henna, verloving en bedrijfsfeest, met elk een Aanvragen-knop. Ook babyshower, verjaardag, christening en ladies night.
- **Extra's:** mirrorbooth, eigen ontwerp, direct geprint, gastenboek, GIF's, props en brillen.
- **Gastenfoto's** met vergrootweergave, en een plek voor reviews.
- **Aanvraag:** gelegenheid, extra's, datum, aantal gasten, locatie, land (NL/DE), naam en thema. Het bericht wordt gekopieerd en Instagram-DM opent.

## Nog na te kijken

- **Reviews:** de inhoud van de highlight "Reviews" zat niet bij de screenshots. Er staat nu een lege plek.
- **Prijzen en pakketten** ontbreken.
- **Foto's van gasten:** alleen foto's zonder namen erop zijn gebruikt. Vraag of deze gasten op de website mogen.
- **Domein:** vul het in en zet daarna `draft: false`.
