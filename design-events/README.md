# Design Events | Event Mocktails: concept-website

Concept voor Design Events uit Enschede: mocktail tables, een tiramisu bar, een snack bar en styling voor bruiloften en events. Het is een statische one-page site (HTML, CSS en JavaScript zonder bibliotheken) in chic wit en goud, met het eigen logo. Er zijn geen trackers en geen cookies.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:5100
npm test           # build + 26 browsertests (5 breedtes, axe, galerij, aanvraag, zonder JS, reduced motion)
npm run images     # snijdt foto's en logo's opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** vijf kristallen cocktailglazen met een gouden rand op twee treden, live in WebGL (transparant glas met reflecties). Tijdens het scrollen vullen ze zich één voor één met kokos, passievrucht, rozen, limoen en tiramisu. Ze volgen de muis.
- **Opties:** Mocktail Table, Tiramisu Bar, Snack Bar en Table & styling, elk met een Aanvragen-knop.
- **Events:** galerij van 15 tafels met vergrootweergave.
- **Werkwijze** in 4 stappen en een **aanvraagformulier**: opties, datum, aantal gasten, soort event, locatie, naam en thema. Het bericht wordt gekopieerd en Instagram-DM opent (de bio zegt "DM for info").

## Nog in te vullen (src/site.mjs)

- **Prijzen** per optie (nu "prijs op aanvraag").
- **WhatsApp of e-mail**, als ze aanvragen liever zo ontvangen.
- **Domein:** vul het in en zet daarna `draft: false`.
- **Teksten** van de opties en de werkwijze zijn geschreven op basis van de foto's. Laat ze nakijken.
- **Foto's:** bewust zonder bruidsparen, namen van stellen en tafelindelingen. Op sommige foto's staat het logo van de zaal (Eventique Party); vraag of dat akkoord is.
