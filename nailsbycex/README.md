# Nailsbycex: concept-website

Concept voor Nailsbycex, nagelstyliste in Enschede. Het is een statische one-page site (HTML, CSS en JavaScript zonder bibliotheken) in zacht crème en goud, net als het logo. Er zijn geen trackers en geen cookies.

```
npm install        # alleen voor tests (Playwright + axe)
npm run build      # genereert ./public uit src/site.mjs en assets/
npm run serve      # lokaal bekijken op http://localhost:4700
npm test           # build + 27 browsertests (5 breedtes, axe, filters, vergroten, boeken, zonder JS, reduced motion)
npm run images     # snijdt foto's en logo opnieuw uit de screenshots in bron/ (Python + Pillow)
npm run preview    # de hele site als één los bestand: voorbeeld/index.html
```

## Wat er op de site staat

- **3D-hero:** vijf glanzende stiletto-nagels in WebGL, in de stijlen uit haar werk: white french, roze met stipjes, burgundy, pink en french met een gouden lijntje. Ze waaieren open tijdens het scrollen en volgen de muis.
- **Werk:** 9 sets in boogvormige kaarten, met filters (French, Nail art, Kleur) en een vergrootweergave.
- **Behandelingen** met Boek-knoppen, **werkwijze** in 4 stappen.
- **Afspraak:** behandeling, vorm, dag, dagdeel en naam. Het bericht wordt gekopieerd en Instagram-DM opent.

## Nog in te vullen (src/site.mjs)

- **Behandelingen en prijzen.** De lijst is een voorstel op basis van haar Instagram; prijzen staan op "op aanvraag".
- **Online agenda:** vul `bookingUrl` in (Salonized, Treatwell, …). Dan boeken klanten echt direct, zonder DM.
- **Adres of wijk, en WhatsApp.**
- **Domein:** vul het in en zet daarna `draft: false`.
- **Foto's:** laat haar bevestigen dat ze op de website mogen.
- Het Snapchat-account uit de bio staat bewust niet op de site (het is een persoonlijke naam). TikTok staat in de footer.
