# Salon Robine: concept website

A concept site for Salon Robine in Grave (Arnoud van Gelderweg 95B), a certified nail stylist and beautician. It is a static one-page site in warm beige and taupe, built around her logo: SALON ROBINE with a brush stroke, as on her business card.

```
npm install        # only needed for the tests (Playwright + axe)
npm run build      # builds ./public
npm test           # build + 29 browser tests (layout at 5 widths, axe, SEO data, 3D, prices, before/after, gallery, booking)
npm run images     # crops the photos from bron/ again (Python + Pillow)
npm run preview    # writes voorbeeld/index.html: one file that opens without a server
```

`voorbeeld/salon-robine-telefoon.mp4` is a video of the site at phone width, for showing it on a phone.

## How the pitch is covered

| Pitch | On the site |
|---|---|
| Warm beige with the Salon Robine logo | Beige, sand and taupe with Cormorant and Jost. The logo is rebuilt as text plus an SVG brush stroke. The 3D hero is a ring of 12 nail photos that turns around an arch showing her salon, driven by scroll and mouse. |
| Facial treatments and nails explained, with results | Gellak, BIAB and French/nail art are explained. The nail price list comes from her post. Dermaplaning has a before/after slider and her own photo of what comes off (vellus hair and dead skin cells). The facial and advice/products sections include her cuticle oil. There is a gallery of 24 nail photos filtered by style, with an enlarged view. |
| Her salon in Grave, findable on Google | The salon section shows photos of the treatment room and the building, the address and a "Plan je route" link to Google Maps. For Google there is structured data (`BeautySalon` with address, Instagram and nail prices), and the title and description mention Grave. |
| Salonized calendar built in | The "Afspraak maken" section loads her Salonized booking page inside the site, starting when it comes close to the screen. A "Open de agenda in een nieuw venster" button below it always works. |

## Important before going live

- **Salonized embed.** The booking page could not be tested from here. If Salonized does not allow embedding, the frame stays empty and visitors use the button below it. The best option is Salonized's own booking widget: copy the company ID from Salonized (Settings → Online booking → Widget) into `salonizedWidgetId` in `src/site.mjs`, and the site uses that widget.
- **Google.** The site is now on noindex because it is a concept. Set `draft: false` in `src/site.mjs`, use her own domain and link the site from her Google Business Profile. Only then can it rank for "nagelstyliste Grave" and similar searches.
- **Still to supply:** opening hours, phone number, prices and duration of the facial treatments (these are now only in the booking calendar), and which product brands she wants to mention.
- **Photos:** posts with text on them and images unrelated to her treatments were left out. Ask for permission to use the before/after photo.
