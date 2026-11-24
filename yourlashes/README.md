# Yourlashes: concept-website

Concept voor Yourlashes by Estella (lashes en lashlifts, home based in Enschede). Statische one-page site in warm taupe met het Yourlashes-logo. Geen trackers, geen cookies.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm test           # build + 26 browsertests (ook het boeken)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** een waaier van wimpers op canvas (eigen 3D-projectie), die opengaat tijdens het scrollen en meebeweegt met de muis.
- **Werk:** 6 foto's uit het profiel, met vergrootweergave.
- **Prijzen:** Lashes (classic, hybrid, volume, wispy, refill, verwijderen) en Lashlifts, met duur en een Boek-knop per behandeling.
- **Betalen en house policy:** blokken voor de inhoud van de highlights "Payments" en "Housepolicy".
- **Online boeken:** stappenwizard (behandeling → dag en tijd → gegevens → bevestigd), met akkoord op de house policy. Dit is een demo: er wordt niets echt geboekt.

## Nog aan te leveren

- De inhoud van de highlights **Prices**, **Payments** en **Housepolicy** (nu als "in te vullen" gemarkeerd), en de duur per behandeling.
- Of de lijst met behandelingen klopt (nu een voorstel).
- Toestemming voor de foto's, en het domein (dan `draft: false`).
- Voor echt direct boeken: een agenda met opslag (bijv. Salonized of eigen systeem, zoals het dashboard van Studio Nazz).
