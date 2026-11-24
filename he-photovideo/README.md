# HE Photovideo: concept website

Concept for HE Photovideo from Rotterdam (photography and videography for weddings, henna and engagements). A static one-page site in strict black and white, using HE's own logo.

```
npm install        # only needed for the tests (Playwright + axe)
npm run build      # generates ./public
npm test           # build + 31 browser tests (layout at 5 widths, axe, interaction, no-JS, reduced motion)
npm run images     # re-crops the photos and logo from bron/ (Python + Pillow)
npm run preview    # voorbeeld/index.html: a single file that opens without a server
```

## How it covers the pitch

| Pitch | On the site |
|---|---|
| Modern design in black and white with the HE logo | Black and white with Bodoni and Jost, and the white HE wordmark cut from the profile picture. The viewfinder look (REC, timecode, PHOTO / VIDEO) fits a photo/video studio. |
| Portfolio per occasion | Tabs for Wedding (12), Henna (6) and Engagement (8), each with a 3D coverflow you can swipe and use with the keyboard, plus an enlarged view. |
| Photo and video side by side, with films | The "Foto én video" section has a photo and a film still that fold open together in 3D, a featured film and a film strip with five more. The player is a preview (see below). |
| Couples send a request with their date without DMing | A calendar shows straight away whether a date is free, has 1 spot left or is fully booked. Couples then pick the occasion and package, and the request arrives complete (see below). |

**3D effects:** in the hero you fly through a tunnel of photos while scrolling. They turn from black and white to colour as they come closer and end on the eye close-up. The portfolio uses a coverflow with depth, the "Foto én video" section has a fold, the film strip tilts, and the cards tilt with the mouse.

## Still to confirm or supply

- **WhatsApp number or e-mail.** These are not in the bio. Set `contact.whatsapp` in `src/site.mjs` and the request goes straight to WhatsApp, already filled in. Until then the site copies the request and opens an Instagram message, so the request is complete but still arrives as a DM.
- **Films.** Only stills are available now. The player shows a slow camera movement over the still, labelled "Voorbeeld". For the real version you need MP4 files or Vimeo/YouTube links.
- **Availability.** The calendar uses demo data (weekends are busier). A real version needs a calendar or booking system behind it.
- **Grouping of photos per occasion** (sorted by dress and setting, so a guess), plus the contents and prices of the packages ("prijs op aanvraag").
- **Permission** to use the photos of couples. Left out on purpose: the title card with names, the musician and the pregnancy photo.
- Team names for the "Over HE" section, and a domain. The site is set to noindex.
