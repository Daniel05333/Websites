# 07 — Conversion Optimization Plan

Principle: **remove doubt, don't manufacture pressure.** Every mechanic below is honest by default and complies with the EU Omnibus Directive (price indications), the UCPD and Dutch ACM guidance on online persuasion.

## 1. Mechanics in the theme

| Stage | Mechanic | Where | Honesty guard |
|---|---|---|---|
| Land | Hero with one promise + 2 CTAs, USP marquee | `vk-hero`, `vk-marquee` | Claims come from editable settings |
| Browse | Category slider, bestseller tabs, quick add on cards | `vk-category-slider`, `vk-featured-collection`, `vk-product-card` | — |
| Browse | Filters + sort with AJAX, bottom-sheet on mobile | `vk-main-collection`, `vk-facets.js` | — |
| Decide | Problem → Solution → Technology → Comparison story on home **and** PDP | sections | Comparison rows are editable; avoid naming competitor brands |
| Decide | Stars + review count | `vk-product-rating` | Only from `reviews.*` metafields; hidden when absent |
| Decide | Compare-at price + "Save €X" | `vk-price` | Only when compare-at is set. Under Omnibus, compare-at must be the lowest price of the previous 30 days |
| Decide | Bundle tiers (single / + lid / set) | `vk-bundle-picker` | Tier savings must be a real automatic discount |
| Decide | Countdown bar | `vk-countdown` | Renders **only** with a merchant-set end date in the future; never resets |
| Act | Price inside the ATC button, sticky ATC on scroll (mobile + desktop) | `vk-sticky-atc` | — |
| Act | Cart drawer: free-shipping progress, upsell, note, trust row, payment icons | `vk-cart-drawer` | Threshold must equal the real shipping rule |
| Reassure | Trust row: lifetime warranty, 60-day trial, free shipping, secure checkout | settings `promise_*` | Must match the policy pages |
| Reassure | FAQ with search + contact card | `vk-faq` | — |
| Retain | Newsletter "Inner Circle" | `vk-newsletter` | Double opt-in recommended (Shopify Email setting) |

**Removed from the Okura pattern on purpose:** "as seen on" TV logos (the marquee has a logo block, but only for real logos you have permission to show), evergreen countdowns, permanent sale pricing, inflated review totals.

## 2. Things to verify before launch [verify]

- [ ] **Lifetime warranty** terms are written and published (`/pages/warranty`).
- [ ] **60-day home trial**: matches the refund policy (statutory 14-day withdrawal right still applies separately).
- [ ] **Free shipping over €75**: matches the shipping rates in *Settings → Shipping*.
- [ ] **Technical claims**: "5-ply", "3.0 mm", "oven-safe to 260°C", "PFAS/PTFE-free", "dishwasher-safe", "metal-utensil safe" are backed by supplier specs or lab reports.
- [ ] **Sample reviews** in `vk-reviews`, `vk-reviews-wall` and `vk-stories` (default demo content shipped with the theme) are replaced with real reviews or the sections are hidden. Publishing invented reviews is illegal in the EU.
- [ ] **Manifesto/benefit counters** (e.g. "4.9 average rating", number of kitchens) reflect real data.
- [ ] Compare-at prices follow the 30-day lowest-price rule.

## 3. A/B test roadmap (in priority order)

| # | Hypothesis | Variant | Metric |
|---|---|---|---|
| 1 | Showing the cost-per-year makes the price feel smaller | Add "≈ €8 per year over 20 years" under the PDP price | PDP ATC rate |
| 2 | Bundle preselected to "+ lid" raises AOV without hurting CR | Default tier = addon | AOV, CR |
| 3 | Hero CTA to the Forge Pan PDP beats a collection link | Swap primary CTA URL | Hero CTR → ATC |
| 4 | Cart upsell of the utensil set (€99) beats the lid | Change `cart_upsell_product` | Attach rate |
| 5 | Comparison table above reviews on PDP | Reorder sections in the editor | Scroll depth, ATC |

Run tests with Shopify's native theme A/B (or Intelligems / Shoplift), one test at a time, minimum 2 weeks and 300 conversions per arm.

## 4. Performance budget (conversion depends on it)

- LCP < 2.5s on 4G mobile: the hero image is `fetchpriority="high"`, everything else lazy, fonts preloaded.
- CLS < 0.05: all media have aspect ratios.
- JS: no third-party libraries. Global JS is about 11 KB gzipped; section JS loads only when the section is on the page.
- Apps: prefer app blocks (`@app`) in `vk-main-product` and `vk-reviews-wall` over script-injecting apps.

## 5. Post-launch tracking

Enable Shopify Analytics + GA4 via the Google & YouTube app. Watch the funnel weekly: sessions → PDP view → ATC → checkout → purchase, split by device. Use Microsoft Clarity for heatmaps on the homepage story to see where readers drop off.
