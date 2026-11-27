# Canes Make-up Studio: concept website

This is a concept site for Canes Make-up Studio, the studio of pro luxury make-up artist Esra Cantekin, with locations in Delfgauw and Enschede. It is a static one-page site in soft beige, taupe and gold, with the CANES / MAKE-UP STUDIO wordmark.

```
npm install        # only needed for the tests (Playwright + axe)
npm run build      # builds ./public
npm test           # build + 29 browser tests (layout at 5 widths, axe, 3D, prices, portfolio, masterclasses, rules, request)
npm run images     # re-crops the photos from bron/ (Python + Pillow)
npm run preview    # writes voorbeeld/index.html: one file that opens without a server
```

`voorbeeld/canes-telefoon.mp4` is a video of the site at phone width, for showing on a phone.

## How the pitch is covered

| Pitch | On the site |
|---|---|
| Soft beige with the Canes logo | Beige, taupe and gold, set in Cormorant and Jost. The 3D hero is a gold compact powder case with the Canes logo on its lid. It opens as you scroll, Esra appears in the mirror, and portraits float into view. |
| Portfolio and celebrity looks | The portfolio has 36 looks with filters (bride, full glam, soft glam, mother & guest) and an enlarged view. "Geleerd van de top" is a 3D card stack of the masterclasses from her Celebrities highlight: Huda and Mona Kattan, Mario Dedivanovic, Sir John and Kim Kardashian. A badge says she works with cruelty-free and vegan products. |
| Price list, rules and bridal trial in one place | The price list comes from the PRIJSLIJST highlight (€90 / €110 / €100 / €290 / €250). "Trial talk" compares the bridal package with and without a trial, followed by a FAQ. Information and terms sit in two tabs, with all the points from REGELS!. |
| Clients in Delfgauw and Enschede send a request with their date | Clients pick a studio, a look (also possible with + on the price list), a date, a "ready by" time and the number of people. With the trial package they can add a preferred trial date. They confirm the terms. WhatsApp (06 87 36 03 99) then opens with the complete request and a price indication. |

## Note before showing

- **Celebrity photos.** These are photos of Esra at masterclasses and events. The site says she followed masterclasses with these people. It does not say she did their make-up. Keep it that way: anything else would be untrue.
- **Two brand names.** The highlights still say "EC Beauty" and esracantekin.com. Check which name she wants to use. The workshop post uses a different number (06 27461862), so this site uses only the WhatsApp number from the bio.
- **Not known:** her exact addresses in Delfgauw and Enschede, opening hours, the amount of the deposit and how it is paid, and whether she also works on location.
- **Permission** to use the portraits on a website. Left out: text posts, EC Beauty product posts, the selfie, and the photo with a man.
- **Domain.** The site is set to noindex.
