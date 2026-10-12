# VOLKARA — Shopify Online Store 2.0 Theme

Premium performance cookware theme for **VOLKARA**: forged titanium, VolcanicCore™ technology, dark-luxury design with an ember accent and a rich, reduced-motion-safe animation system.

The repository root **is** the theme root (`layout/`, `sections/`, `snippets/`, `templates/`, `assets/`, `config/`, `locales/`).

## Install

**Shopify CLI (recommended)**
```bash
npm i -g @shopify/cli
shopify theme push --store your-store.myshopify.com --unpublished
```
**Or ZIP:** zip the theme folders (`assets config layout locales sections snippets templates`) and use *Online Store → Themes → Add theme → Upload zip*.

Then follow the store setup in [`docs/06-data-model.md`](docs/06-data-model.md):
1. Create metafield definitions (`custom.subtitle`, `custom.badge`, `custom.specs`, `custom.care`; collection `custom.hero_heading/eyebrow/subtitle`).
2. Import `data/products-import.csv` (13 products, imported as **drafts**).
3. Create collections (`pans, woks, pots, sets, knives, accessories, bestsellers`), pages (`about`, `technology`, `contact`, `warranty`) and the `main-menu`.
4. Install a reviews app that writes `reviews.rating` / `reviews.rating_count` (Judge.me, Okendo, …).
5. Add product photography, or install the Higgsfield visuals ([`docs/05`](docs/05-higgsfield-visual-plan.md)).
6. Work through the **[verify] launch checklist** in [`docs/07-conversion-plan.md`](docs/07-conversion-plan.md).

## What's inside

| Area | Contents |
|---|---|
| Templates | home, collection, product, cart, search, 404, page, page.about, page.technology, page.contact, list-collections, blog, article, password, gift card, all customer account pages |
| Homepage story | Hero → Manifesto → Collection → Problem → Solution → VolcanicCore™ → Bestsellers → Spotlight → Benefits → Comparison → Reviews → Stories → FAQ → CTA |
| Collection | Hero, USP bar, AJAX filters + sort (bottom sheet on mobile), promo tiles, load more |
| Product | Swipe gallery + zoom, variant picker, bundle tiers (multi-item add), countdown (real end date only), sticky ATC, specs/care accordions, reviews wall with `@app` blocks, recommendations |
| Cart | Drawer or page, free-shipping bar, upsell, note, Section Rendering API updates |
| Header | Announcement bar, mega menu, predictive search, mobile drawer, localization |
| Settings | 5 color schemes, typography, animation toggles, brand promises, cart behaviour, visuals |
| i18n | English (default) + Dutch (`locales/nl.json`) UI strings. Section copy is editable in the theme editor. |

No build step, no frameworks, no external CDNs. Fonts are self-hosted (SIL OFL).

## Development

```bash
npm install
npm run check      # Shopify Theme Check (0 errors / 0 warnings)
npm run preview    # local Liquid preview with a mock catalog → http://localhost:4321
npm run shoot -- / --full --mobile   # Playwright screenshots of the preview
npm run products:csv                 # regenerate data/products-import.csv from the mock catalog
```

The preview harness (`tools/preview/`) renders the real theme files with LiquidJS against `tools/preview/mock/catalog.mjs`. It covers the cart APIs, Section Rendering, filters, predictive search and recommendations, which makes it useful for fast QA. Final QA should still happen with `shopify theme dev` on a real store.

## Docs

| Doc | |
|---|---|
| [`BUILD_SPEC.md`](docs/BUILD_SPEC.md) | Engineering spec: tokens, conventions, JS contracts, page compositions, catalog canon |
| [`01-okura-analysis.md`](docs/01-okura-analysis.md) | Reference analysis of okuracookware.nl |
| [`02-volkara-strategy.md`](docs/02-volkara-strategy.md) | Positioning, audience, customer journey |
| [`03-copy-deck.md`](docs/03-copy-deck.md) | All copy |
| [`04-design-system.md`](docs/04-design-system.md) | Color, type, components, motion |
| [`05-higgsfield-visual-plan.md`](docs/05-higgsfield-visual-plan.md) | Generated visuals, art direction, next shots |
| [`06-data-model.md`](docs/06-data-model.md) | Metafields, products, collections, menus |
| [`07-conversion-plan.md`](docs/07-conversion-plan.md) | CRO mechanics, honesty guards, launch checklist, A/B roadmap |
