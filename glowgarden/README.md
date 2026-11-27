# Glowgarden: concept website

This is a concept site for Glowgarden in Enschede, which offers laser hair removal with an alexandrite laser and Hydrafacial, for women and men. It is a static one-page site in warm brown, cream and gold, using the G mark from the Glowgarden logo.

```
npm install        # only needed for the tests (Playwright + axe)
npm run build      # builds ./public
npm test           # build + 30 browser tests (layout at 5 widths, axe, 3D, prices, before/after, planner, no-JS, reduced motion)
npm run images     # re-crops the photos and before/after images from bron/ (Python + Pillow)
npm run preview    # writes voorbeeld/index.html: one file that opens without a server
```

`voorbeeld/glowgarden-telefoon.mp4` is a video of the site at phone width, for showing on a phone.

## How the pitch is covered

| Pitch | On the site |
|---|---|
| Warm brown and gold with the Glowgarden logo | Dark chocolate brown, cream and gold, set in Cormorant and Jost. The G mark is redrawn as SVG. The 3D hero is an alexandrite crystal in WebGL that turns from green, through purple, to red as you scroll, just as the real stone does in daylight and in artificial light. It also follows the mouse. |
| Laser hair removal and Hydrafacial explained, for women and men | Two treatment cards. A "how laser hair removal works" section with intake, treatment and repeats, plus their own tip (do not start before age 23). A Woman/Man switch flips the price card in 3D. All prices come from their posts (mini zone, 2 zones, XL, single zones, and the men's list). |
| Offers, giveaways and reviews | The €100 offer (whole body + face), mini zone €50 and 2 zones €85. The giveaway shows the 4 steps and counts down the days to the end of December. Reviews appear as WhatsApp messages in a 3D phone. |
| Clients book directly via WhatsApp | Tap + on a price or "Claim deze actie" and the item goes straight into the planner. You pick days, part of the day and first visit, then confirm the house rules. WhatsApp (06 20 31 82 21) opens with the full message, including a price indication. |

Also included: before/after sliders for 9 results (filter by woman/man, keyboard accessible) and the 8 house rules from the "Herinnering afspraak" highlight.

## Still to confirm

- **Hydrafacial price.** Not available, so it shows "prijs op aanvraag". The Hydrafacial steps (cleanse, exfoliate, extract, hydrate) are a general description of the treatment.
- **Year of the offers.** "Geldig tot eind maart" and "winnaar eind december" are taken as they were posted.
- **Single-zone prices.** These are listed "onder korting" on the post. Check whether they are still current.
- **Opening hours.** Not known, so the planner asks for a preference rather than offering fixed times.
- **Permission** to use the before/after photos and the photo of the owner. Left out: text posts, AI-made flyers (only their text is used) and images of intimate areas.
- Domain. The site is set to noindex.
