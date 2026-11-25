# Selina Jewelry: concept website

A concept site for Selina Jewelry in Hengelo, which sells 14-carat gold jewellery. It is a static one-page site in warm cream and gold, built around the SJ logo. The structure and animations follow the "Veio" prompt (scroll-driven film, manifesto, magazine grid, numbers, steps), filled in with Selina's own photos.

```
npm install        # only needed for the tests (Playwright + axe)
npm run build      # builds ./public
npm test           # build plus 29 browser tests (layout at 5 widths, axe, film, tabs, bag, no-JS, reduced motion)
npm run images     # re-crops the photos and logo from bron/ (Python + Pillow)
npm run preview    # writes voorbeeld/index.html as one file (opens without a server)
```

`voorbeeld/selina-jewelry-telefoon.mp4` is a one-minute video of the site at phone width, for showing it on a phone.

## How the pitch is covered

| Pitch | On the site |
|---|---|
| Warm cream and gold with the SJ logo | The SJ logo is cut out of the Instagram post with a transparent background. Fonts are Instrument Serif and Inter Tight. Gold is the only accent colour. |
| 14-carat gold, sorted by type | The "Goud" collection has tabs for rings, earrings, necklaces and bracelets, each laid out as an uneven magazine grid. Photos have parallax, and a hover shows "In tas". |
| Seasonal collections and giftcards | Christmas and Autumn'23 each get a fan of photos that opens in 3D as you scroll. The giftcard is a 3D card that follows the mouse and flips over to show the chosen amount. |
| Customers order directly | A bag with quantities and ring size (for rings). The whole order goes to WhatsApp in one message (06 34123130) with everything filled in. The bag is kept when the page reloads. |

**The film (hero):** Veio uses a video split into frames. There was no video here, so the site uses the alternative the prompt itself describes: a still photo (the clover bracelets from the Christmas highlight). As you scroll, the camera moves towards the clover, loses focus, and finds it again on the close-up of the green clover. A sparkle and the name appear, then the film shrinks into the middle of the display with two pieces either side. The animation is plain JS tied to the scroll (no GSAP or Lenis), so it all fits in one file.

## Still to confirm or supply

- **Prices.** They are not on Instagram, so every piece says "Prijs op aanvraag". Fill in `price` in `src/site.mjs` and they show up.
- **Names of the pieces.** These are working names based on the photos.
- **Which photos belong to which season.** This is my guess from the highlights.
- **Giftcard amounts** (€25 to €100). These are examples.
- **Shipping.** It is not clear whether Selina ships. The bag asks "Ophalen of verzenden" (pick up or ship) and leaves it to be agreed.
- **The Facebook page link** and a domain. The site is set to noindex.
- **Photos left out on purpose:** posts with perfume bottles from another brand, mirror selfies, posts with text on them, and photos that are mostly a face.
