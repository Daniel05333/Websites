# Feestje te Huur: concept-website

Concept voor Feestje te Huur in Enschede: kinderfeestjes op eigen locatie, plus verhuur van candy bar, cake bar, popcornkar en aankleding. Het is een statische one-page site (HTML, CSS en JavaScript zonder bibliotheken) in zacht roze met het Feestje-logo. Er zijn geen trackers en geen cookies.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4800
npm test           # build + 26 browsertests (5 breedtes, axe, aanvraag, zonder JS, reduced motion)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** zes glanzende ballonnen (roze, champagne, babyblauw, parelwit, rose-gold), live gerenderd in WebGL. Ze zweven, volgen de muis en stijgen op tijdens het scrollen, met vallende confetti. Zonder WebGL verschijnen CSS-ballonnen; bij "minder beweging" staan ze stil.
- **De feestjes:** Princess Glam, Slime, Squishy, Hair Tinsel en Cake Bar Experience, elk met een Aanvragen-knop.
- **Locatie:** "Geen ruimte thuis? Wij hebben een locatie!", met Enschede, alleen op afspraak en het telefoonnummer.
- **Verhuur:** candy bar, cake bar, popcornkar en aankleding in een 3D-carrousel.
- **Zo werkt het** in vier stappen.
- **Aanvragen:** feestje, datum, tijd, aantal kinderen, leeftijd, naam en wensen. De knop opent WhatsApp (Business, 06 45883292) met het bericht al ingevuld. Het feestje staat pas vast als zij het bevestigen.

## Nog in te vullen (src/site.mjs)

- **Prijzen** per feestje en voor de verhuur (nu "prijs op aanvraag"), en eventueel duur en maximaal aantal kinderen.
- **Adres van de feestlocatie** (nu "adres bij je aanvraag").
- **Domein:** vul het in en zet daarna `draft: false`. Zolang de site op concept staat, krijgt elke pagina `noindex`.
- **Teksten:** de omschrijvingen zijn geschreven op basis van de posts. Laat ze nakijken.
- **Foto's:** er staan kinderen op. Ze zijn door het bedrijf zelf gepost, maar vraag of de ouders akkoord zijn met gebruik op de website. Foto's met een kindernaam op de labels zijn bewust weggelaten.
