# VOLKARA Theme — Build Specification (single source of truth)

> Every agent building any part of this theme MUST follow this document. When this spec and your instinct disagree, the spec wins. When the spec is silent, choose what a senior Shopify theme engineer at a luxury brand would do, and stay consistent with the files that already exist.

Repo root = Shopify theme root (`/home/user/Websites`). Shopify Online Store 2.0, JSON templates, section groups, no build step, no frameworks, no external JS/CSS CDNs.

---

## 0. The brief in one paragraph

VOLKARA is premium performance cookware (forged titanium pans, woks, pots, sets, knives, accessories). The site is the *next evolution* of the Okura Cookware experience (okuracookware.nl): it keeps Okura's proven dark-luxury aesthetic and conversion journey (Hero → Problem → Solution → Technology → Benefits → Comparison → Reviews → FAQ → Purchase) but must feel **more premium, more modern, more alive**: Apple-level simplicity, Ferrari-level emotion, Rolex-level craftsmanship. Signature technology: **VolcanicCore™**.

## 1. What we keep from Okura (reference analysis — screenshots in `/tmp/claude-0/-home-user-Websites/6afd16ff-f6f0-5cfa-86b8-2f8c3888fb0f/scratchpad/okura/*_sNN.jpg`)

Okura homepage order: floating rounded header bar (left nav: Home, Shop▾, About, FAQ, Contact, Track & Trace · centered logo · right: currency, search, cart) → full-bleed dark hero (macro pan photo, copper eyebrow "HANDGEHAMERD TITANIUM KOOKGEREI", big serif headline with one italic copper word "Ooit", 2 CTAs: filled copper + outline) → "as seen on" TV-show logo marquee → "Shop per Categorie" carousel (5 cards: Pans, Knives, Cutting boards, Accessories, Bundles, each with "SHOP NU →") → "Het Probleem": 3 photo cards (short lifespan / scratches / uneven heat) → "Het Okura Verschil — Eén pan. Voor altijd.": checklist accordion left, pan with hotspot labels right → Reviews slider (4.8/5 · 15.500+ reviews, 3 cards, verified badge, variant purchased) → Comparison table "Niet alle pannen zijn gelijk" (Okura vs ordinary pans, grouped rows: versatility, maintenance, taste & purity, heat response, dishwasher, investment; footer "Met 25 jaar garantie") → FAQ accordion (8 Qs + "Nog vragen? Neem contact op") → Newsletter "Blijf op de *Hoogte*" with 4 checkmark perks → footer (logo, blurb, contact rows with icons, Shop menu, Legal menu, newsletter, payment icons).

Okura collection: dark hero with title + sale copy → USP strip (5 icon USPs) → toolbar (items count, sort, filter) → 4-col grid of black-background product cards (badge chips: Bestseller / Almost sold out / New / Limited, title, stars, "From €X", strike price, "SAVE €Y" chip) → "Showing 24 of 38" progress bar + Show more.

Okura product: left gallery (main image w/ arrows + "25-year warranty" chip, thumbnails), right: badge pill, serif title, italic subtitle, stars + count, big price + strike + save pill, 2×2 USP tiles, bundle tiers (Single / Set +5% / Complete set +10%) as radio cards with size dropdown, countdown bar, full-width ATC with price inside, free gift (eBook) row, trust row (free shipping, 30-day returns, 25-yr warranty), payment icons, accordions (Details / Shipping & Returns / Care) → UGC video row "Echte koks, echt resultaat" → Problem → Solution → logo bar → reviews → comparison → USP strip → FAQ → final CTA card "Stap over op titanium" → newsletter → reviews wall (masonry, photo reviews, 323 reviews, "Write a review") → footer → **sticky add-to-cart bar** (thumb, title, stars, variant, price, ATC).

Okura visual language: near-black (#1c1c1c/#262626) alternating section backgrounds, copper/bronze accent (#c08a5b-ish) for eyebrows/CTAs/checks, Playfair-style serif headings with italic accent word, grotesk body, uppercase tracked eyebrows, 12px-radius cards with 1px hairline borders, product photography on pure black with warm rim light.

**What we deliberately do NOT copy** (legal / brand risk): fake "as seen on" TV-show trademarks, evergreen fake countdown timers, inflated strike-through prices, unverifiable review counts. VOLKARA ships honest-by-default mechanics (countdowns only to a merchant-set real end date; compare-at only when the merchant sets it; press logos only from merchant-uploaded images; review numbers read from product metafields `reviews.rating`/`reviews.rating_count` when present).

## 2. What we evolve (the VOLKARA upgrades)

| Area | Okura | VOLKARA |
|---|---|---|
| Palette | warm black + copper | Volcanic black + **lava→molten ember gradient**, used sparingly like Ferrari red |
| Type | serif headlines | **Inter Tight** tight-tracked display + **Instrument Serif italic** accent word in ember gradient + **JetBrains Mono** technical labels (engineering precision) |
| Labels | "HET PROBLEEM" | numbered mono eyebrows `01 — THE PROBLEM` (a chaptered story) |
| Motion | basic carousels | scroll reveals, split-word headline rise, parallax, magnetic CTAs, pointer-tracked hover lighting, scroll-scrubbed manifesto, sticky exploded VolcanicCore™ layer diagram, ember particles, View-Transitions page fades |
| Technology | checklist + hotspots | dedicated **VolcanicCore™** section with interactive layer stack + specs |
| Rhythm | all dark | dark-dominant with **one Soft-White "porcelain" section** per page for contrast (Apple rhythm) |
| Buttons | 4px copper | pill buttons, ember gradient, glow, shine sweep, magnetic |
| Mobile | desktop shrunk | thumb-first: sticky ATC, swipe galleries, bottom-sheet filters, 44px+ targets |
| Trust | fake logos | honest trust stack: warranty, trial, shipping, PFAS-free, secure checkout, real reviews |

## 3. Design tokens (implemented in `assets/vk-base.css` `:root`)

```css
/* Brand palette (from brief) */
--vk-black: #080808;      /* Volcanic Black */
--vk-lava: #D7261E;       /* Lava Red */
--vk-molten: #FF4B32;     /* Molten Orange */
--vk-graphite: #202020;   /* Graphite */
--vk-white: #F7F5F2;      /* Soft White */
/* Derived neutrals */
--vk-ink-950: #050505; --vk-ink-900: #0D0D0D; --vk-ink-850: #121212; --vk-ink-800: #171717;
--vk-ink-600: #2A2A2A; --vk-ink-500: #3A3A3A; --vk-ash: #8C8782; --vk-ash-light: #B8B3AD;
/* Ember system */
--vk-ember: linear-gradient(115deg, #D7261E 0%, #FF4B32 60%, #FF6A3D 100%);
--vk-ember-soft: linear-gradient(115deg, rgba(215,38,30,.18), rgba(255,75,50,.08));
--vk-glow: 0 0 0 1px rgba(255,75,50,.35), 0 12px 40px -12px rgba(215,38,30,.65);
/* Typography */
--vk-font-display: "Inter Tight", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--vk-font-body: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--vk-font-accent: "Instrument Serif", "Iowan Old Style", "Times New Roman", serif;
--vk-font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
--vk-fs-display: clamp(3rem, 1.6rem + 6vw, 8rem);
--vk-fs-h1: clamp(2.5rem, 1.6rem + 3.6vw, 5.25rem);
--vk-fs-h2: clamp(2.125rem, 1.5rem + 2.4vw, 4rem);
--vk-fs-h3: clamp(1.375rem, 1.15rem + .8vw, 1.875rem);
--vk-fs-h4: 1.25rem;
--vk-fs-lg: clamp(1.0625rem, 1rem + .3vw, 1.25rem);
--vk-fs-base: 1rem; --vk-fs-sm: .875rem; --vk-fs-xs: .75rem;
--vk-fs-eyebrow: .75rem;
/* Layout */
--vk-container: 1440px; --vk-container-narrow: 960px;
--vk-gutter: clamp(1rem, .4rem + 2.6vw, 3rem);
--vk-space-section: clamp(5rem, 3rem + 7vw, 10rem);
--vk-radius-sm: 10px; --vk-radius: 16px; --vk-radius-lg: 28px; --vk-radius-pill: 999px;
/* Motion */
--vk-ease-out: cubic-bezier(.16, 1, .3, 1);
--vk-ease-in-out: cubic-bezier(.65, 0, .35, 1);
--vk-ease-spring: cubic-bezier(.34, 1.56, .64, 1);
--vk-dur-1: 200ms; --vk-dur-2: 400ms; --vk-dur-3: 800ms; --vk-dur-4: 1200ms;
--vk-header-h: 76px;
```

Headings: `font-family: var(--vk-font-display); font-weight: 500; letter-spacing: -0.035em; line-height: 1.02; text-wrap: balance;` Display/H1 weight 500, H3/H4 weight 500 letter-spacing -0.02em.
**Accent word**: any `<em>` inside `.vk-h, h1, h2, h3, .vk-display` → `font-family: var(--vk-font-accent); font-style: italic; font-weight: 400; letter-spacing: -0.01em; background: var(--vk-ember); -webkit-background-clip: text; background-clip: text; color: transparent; padding-right: .06em;` (On the Ember color scheme the accent is plain soft-white italic.) Merchants type `<em>` via `inline_richtext` settings (italic button).
Body: Inter 400, 1rem/1.65, color `var(--vk-fg)` at .78 opacity for paragraphs (`--vk-fg-muted`).
**Eyebrow** `.vk-eyebrow`: mono 500, .75rem, uppercase, letter-spacing .22em, color `var(--vk-accent)`; format `01 — THE PROBLEM` (index rendered in `--vk-fg-muted`, a 24px hairline, then label).
Film grain: `body::after` fixed full-screen SVG-noise data URI, opacity .035, `pointer-events:none`, mix-blend-mode: overlay (toggle in theme settings).
Selection: ember background, white text. Focus: `:focus-visible { outline: 2px solid var(--vk-molten); outline-offset: 3px; }`.

### Color schemes (native `color_scheme_group` in `config/settings_schema.json`, id `color_schemes`)
Each section has a `color_scheme` setting and its root gets class `color-{{ section.settings.color_scheme }}`. `layout/theme.liquid` (via `snippets/vk-color-schemes.liquid`) loops `settings.color_schemes` and prints for each scheme: `--vk-bg, --vk-bg-rgb, --vk-fg, --vk-fg-rgb, --vk-fg-muted (fg @ .72), --vk-border (fg @ .12), --vk-surface (fg @ .04 over bg), --vk-surface-2 (fg @ .07), --vk-accent, --vk-btn-bg, --vk-btn-fg`. Definition fields: `background, text, accent, button, button_label, surface` (+ role mapping required by Shopify).

| id | name | background | text | accent | button | button_label |
|---|---|---|---|---|---|---|
| scheme-1 | Volcanic | #080808 | #F7F5F2 | #FF4B32 | #D7261E | #F7F5F2 |
| scheme-2 | Obsidian | #111111 | #F7F5F2 | #FF4B32 | #D7261E | #F7F5F2 |
| scheme-3 | Graphite | #202020 | #F7F5F2 | #FF4B32 | #D7261E | #F7F5F2 |
| scheme-4 | Ember | #D7261E | #F7F5F2 | #080808 | #080808 | #F7F5F2 |
| scheme-5 | Porcelain | #F7F5F2 | #080808 | #D7261E | #080808 | #F7F5F2 |

Primary buttons always render the ember gradient on dark schemes; on scheme-4/5 they use `--vk-btn-bg` solid.

## 4. File ownership & naming

- Every theme file we create is prefixed `vk-` (sections, snippets, assets) **except** Shopify-mandated names (`layout/theme.liquid`, `templates/*.json`, `sections/header-group.json`, `sections/footer-group.json`, `config/*`, `locales/*`). Main template sections: `sections/vk-main-product.liquid`, `vk-main-collection.liquid`, etc.
- CSS classes: `vk-` prefix; BEM-ish: `.vk-hero`, `.vk-hero__title`, `.vk-hero--full`. Utility classes in base: `.vk-container`, `.vk-container--narrow`, `.vk-grid`, `.vk-visually-hidden`, `.vk-eyebrow`, `.vk-h1..h4`, `.vk-display`, `.vk-lead`, `.vk-muted`, `.vk-card`, `.vk-btn*`, `.vk-badge*`, `.vk-chip`, `.vk-divider`, `.vk-link`, `.vk-rte` (rich text), `.vk-input`, `.vk-select`, `.vk-check-list`.
- Each section loads its own stylesheet at the top: `{{ 'vk-section-hero.css' | asset_url | stylesheet_tag }}` and, if needed, its own deferred script: `<script src="{{ 'vk-hero.js' | asset_url }}" defer="defer"></script>`. Shared JS: `vk-global.js` (utilities + generic custom elements), `vk-motion.js` (animation engine), `vk-cart.js`, `vk-product.js`, `vk-facets.js`, `vk-search.js` — loaded per section where needed (global + motion always in theme.liquid).
- Custom elements are named `vk-*` and always guarded: `if (!customElements.get('vk-x')) customElements.define('vk-x', class extends HTMLElement {...})`.
- JS must work without build tools, ES2020, no dependencies, no inline `<script>` except JSON data (`<script type="application/json">`) and the tiny `document.documentElement.classList.add('js')` in the head.

## 5. Section conventions (MANDATORY for every section)

Root markup:
```liquid
{{ 'vk-section-<name>.css' | asset_url | stylesheet_tag }}
{%- render 'vk-section-styles', section: section -%}
<section id="vk-{{ section.id }}" class="vk-section vk-<name> color-{{ section.settings.color_scheme }}" data-section-id="{{ section.id }}" data-section-type="<name>">
  <div class="vk-container"> … </div>
</section>
{% schema %} … {% endschema %}
```
`snippets/vk-section-styles.liquid` prints `<style>#vk-{{ section.id }}{--vk-pt:{{ section.settings.padding_top }}px;--vk-pb:{{ section.settings.padding_bottom }}px}</style>` and `.vk-section{padding-top:var(--vk-pt,var(--vk-space-section));padding-bottom:…}` lives in base CSS, scaled ×0.6 below 750px.

Every section schema contains (copy exactly, adjust defaults):
```json
{"type":"color_scheme","id":"color_scheme","label":"Color scheme","default":"scheme-1"},
{"type":"range","id":"padding_top","label":"Top padding","min":0,"max":200,"step":8,"unit":"px","default":120},
{"type":"range","id":"padding_bottom","label":"Bottom padding","min":0,"max":200,"step":8,"unit":"px","default":120}
```
Headings/eyebrows: `eyebrow` (text), `heading` (inline_richtext, so merchants can italicize the accent word → `<em>`), `subheading` (inline_richtext or richtext). Render them via `snippets/vk-heading.liquid`.
- Use `"presets"` on every non-main section so it is addable in the editor (name in plain English, e.g. "VOLKARA · Hero").
- Use `"enabled_on"`/`"disabled_on"` appropriately (header/footer only in groups; main sections not addable elsewhere).
- Blocks: always output `{{ block.shopify_attributes }}` on the block root element.
- Support `{"type":"@app"}` blocks in `vk-main-product`, `vk-reviews`, `vk-reviews-wall`.
- Image settings: `image_picker`; render through `snippets/vk-image.liquid`; when blank, render `snippets/vk-placeholder.liquid` with a fitting `type` (never Shopify's grey placeholder, never a broken image).
- Video settings: `video` (Shopify-hosted) + `video_url` (YouTube/Vimeo) where relevant; autoplay muted loop playsinline only when decorative; poster required.
- Schema labels in plain English (no `t:` keys). Schema `info` text helps merchants (e.g., "Use the italic button to highlight the accent word").
- Range settings must satisfy Shopify: `(max-min)/step <= 101`, default on a step.
- `select`/`radio` defaults must be one of the option values.
- Settings `id`s are snake_case and unique in the section.
- **Storefront strings** (anything not merchant-editable, e.g. "Add to cart", "Sold out", aria-labels) use `{{ 'key' | t }}`. See §9 for the locale workflow — do NOT edit `locales/*.json` directly except the foundation agent.

## 6. Snippet API (built by the foundation agent; everyone else consumes)

| Snippet | Params | Output |
|---|---|---|
| `vk-icon` | `name`, `size` (default 20), `class`, `stroke` (default 1.5) | inline SVG, `aria-hidden="true" focusable="false"`, 24×24 viewBox, stroke `currentColor`. Names: `arrow-right arrow-left arrow-up-right arrow-down chevron-down chevron-up chevron-left chevron-right plus minus close menu search cart bag user check x star shield truck return flame leaf layers thermometer sparkle play pause heart lock mail phone map-pin clock info globe filter sliders grid grid-2 list zoom hexagon drop utensils award gift eye dishwasher induction oven fire-ring weight warranty instagram facebook tiktok youtube pinterest x-twitter` |
| `vk-image` | `image`, `sizes`, `widths` (default `'375,550,750,1100,1500,1780,2000'`), `class`, `loading` ('lazy'), `fetchpriority`, `alt`, `placeholder` (type for fallback), `aspect` (optional css aspect-ratio) | responsive `<img>` via `image_url`/`image_tag` w/ srcset, width/height attrs; `vk-placeholder` if blank |
| `vk-placeholder` | `type`: `hero` `product` `lifestyle` `macro` `collection` `chef` `problem` `wok` `set` `knife`; `class`; `label` | Premium inline-SVG art (dark radial gradient, hexagon "LavaCell" pattern, ember glow, subtle line-art object silhouette) filling its box; `role="img"` + label. Never grey. |
| `vk-logo` | `class`, `size` ('sm'/'md'/'lg') | merchant logo image if `settings.logo`, else SVG hex-volcano mark + "VOLKARA" wordmark (Inter Tight 600, letter-spacing .32em) |
| `vk-button` | `label`, `url`, `style` ('primary'/'secondary'/'ghost'/'light'), `icon` (icon name, optional), `magnetic` (bool), `size` ('md'/'lg'/'sm'), `class`, `type` (if set renders `<button type=…>`), `attrs` (raw attrs string) | `.vk-btn` with inner `.vk-btn__label` + icon; magnetic → `data-magnetic` |
| `vk-heading` | `eyebrow`, `index` (e.g. '01'), `heading`, `subheading`, `align` ('center'/'left'), `tag` ('h2'), `size` ('h2'/'h1'/'display'/'h3'), `class`, `split` (bool, default true) | eyebrow + heading (`data-split` for word reveal) + subheading, wrapped in `.vk-heading` with `data-reveal` |
| `vk-price` | `product`, `variant` (optional), `class`, `show_compare` (true), `show_save` (true), `size` ('md'/'lg') | `.vk-price` with `.vk-price__current`, `<s>` compare-at, "Save €X" chip, "From" prefix when `price_varies`, unit price; uses `money` filter |
| `vk-rating` | `rating` (number 0–5), `count`, `size` ('sm'/'md'), `show_text` (true), `class` | star row with fractional fill via `--vk-rating` %, text "4.9 · 1,240 reviews" (`t` key), `role="img"` aria-label |
| `vk-product-rating` | `product`, `size`, `show_text` | reads `product.metafields.reviews.rating.value.rating` & `reviews.rating_count`; renders nothing when absent (theme setting `show_demo_ratings` lets the preview fall back) |
| `vk-badge` | `text`, `style` ('ember'/'outline'/'dark'/'light'), `icon`, `class` | pill badge |
| `vk-product-card` | `product`, `index`, `show_quick_add` (true), `show_rating` (true), `show_secondary_image` (true), `ratio` ('square'/'portrait'/'landscape'), `loading` ('lazy'), `class`, `sizes` | full product card (see §7) |
| `vk-section-styles` | `section` | padding custom props |
| `vk-meta-tags` | — | SEO/OG/Twitter tags |
| `vk-color-schemes` | — | CSS vars per color scheme |
| `vk-fonts` | — | `@font-face` for the 6 self-hosted woff2 files + preload of Inter + Inter Tight |
| `vk-payment-icons` | `class` | `shop.enabled_payment_types` → `payment_type_svg_tag` list |
| `vk-social-icons` | `class` | links from `settings.social_*_link` |
| `vk-quantity` | `id`, `name`, `value`, `min`, `max`, `form` | `<vk-quantity>` with −/+ buttons |
| `vk-countdown` | `end` (ISO datetime string), `label`, `class` | `<vk-countdown data-end>`; hides itself when expired or blank |

**Bundled visuals fallback.** Ten Higgsfield-generated visuals are catalogued in `tools/visuals/higgsfield-manifest.json` and will be downloaded into `assets/` as `vk-visual-pan.webp, vk-visual-hero.webp, vk-visual-macro.webp, vk-visual-chef.webp, vk-visual-wok.webp, vk-visual-set.webp, vk-visual-knife.webp, vk-visual-problem-coating.webp, vk-visual-sear.webp, vk-visual-forge.webp` (they are NOT in the repo yet — the CDN is blocked in the build container). `vk-image` therefore takes an extra param `fallback` (asset filename): when `image` is blank AND theme setting `settings.use_bundled_visuals` is true AND `fallback` is set → render `<img src="{{ fallback | asset_url }}" …>` (with width/height from param `fallback_width`/`fallback_height`, default 1280×720); otherwise render `vk-placeholder`. Section agents pass the matching `fallback` for every image slot (hero → `vk-visual-hero.webp`, technology → `vk-visual-macro.webp`, etc.). `use_bundled_visuals` defaults to **false** in `settings_schema.json`.

Fonts are self-hosted in `assets/`: `vk-inter-var.woff2` (Inter 100–900), `vk-inter-tight-var.woff2` (Inter Tight 100–900), `vk-instrument-serif.woff2`, `vk-instrument-serif-italic.woff2`, `vk-jetbrains-mono-400.woff2`, `vk-jetbrains-mono-500.woff2`. `font-display: swap`.

## 7. Product card (`vk-product-card`) spec
Dark surface card (`--vk-surface` on scheme bg), radius `--vk-radius`, 1px `--vk-border`. Media area square, product image `object-fit: contain` on a radial dark gradient (product photos are shot on black), secondary image crossfades on hover (desktop). Top-left badge (priority: `product.metafields.custom.badge` → "Sold out" → "Save X%" if compare_at → tag `new` → "New"). Body: title (Inter Tight 500, 1.0625rem), `vk-product-rating` sm, `vk-price`. Hover: lift 4px, image scale 1.04, pointer-tracked radial light (`data-glow`), border brightens. Quick add: single-variant → `<form>` POST `/cart/add` with `vk-product-form` (AJAX) button "Add — €X"; multi-variant → row of size chips (option1 values) revealed on hover/focus (always visible on touch), clicking a chip adds that variant. Whole card is a link (title link stretched with `::after`), quick add sits above it (z-index). Card has `data-reveal` with stagger index `--vk-i: {{ index }}`.

## 8. JavaScript contracts

`assets/vk-global.js` exposes `window.VK`:
- `VK.debounce(fn, ms)`, `VK.throttle(fn, ms)`, `VK.fetchConfig(type='json')`, `VK.formatMoney(cents, format=window.VK.moneyFormat)`, `VK.trapFocus(container, elementToFocus)`, `VK.removeTrapFocus(elementToFocus)`, `VK.lockScroll()`, `VK.unlockScroll()`, `VK.sectionUrl(url, sectionId)`, `VK.fetchSections(url, ids[]) → Promise<{id: html}>`, `VK.parseHTML(html) → Document`, `VK.prefersReducedMotion() → bool`.
- PubSub: `VK.subscribe(event, cb) → unsubscribe`, `VK.publish(event, data)`. Events: `VK.EVENTS = { cartUpdate: 'cart:update', cartError: 'cart:error', variantChange: 'variant:change', drawerOpen: 'drawer:open', drawerClose: 'drawer:close' }`.
- `window.VK.routes` = `{ cart_add_url, cart_change_url, cart_update_url, cart_url, predictive_search_url, product_recommendations_url, root_url }` printed in `theme.liquid` from `routes`.
- `window.VK.strings` = translated strings needed in JS (added by foundation; others request additions via locale fragments + a note).
- Generic elements in global: `<vk-drawer>` (modal/drawer: `open()`, `close()`, focus trap, Esc, overlay click, `[data-drawer-open="id"]` triggers anywhere in the page, `aria-expanded` sync, side `left|right|bottom`), `<vk-accordion>` (wraps `<details>`; smooth height animation; `data-single` makes it exclusive), `<vk-slider>` (horizontal scroll-snap track `[data-slider-track]`, prev/next `[data-slider-prev|next]`, progress `[data-slider-progress]` as scaleX, pointer drag-to-scroll on desktop, keyboard arrows, updates disabled states), `<vk-quantity>`, `<vk-tabs>` (ARIA tabs), `<vk-countdown>`, `<vk-video>` (play when ≥50% visible, pause when out; respects reduced motion), `<vk-marquee>` (duplicates children for seamless loop, pauses on hover, speed attr).

`assets/vk-motion.js` (engine — auto-inits on DOMContentLoaded and on `shopify:section:load`):
- `[data-reveal]` values: `up` (default), `fade`, `scale`, `mask` (clip-path reveal), `blur`, `left`, `right`. Elements start hidden via CSS **only when** `html.js.vk-motion` is present (no-JS & reduced motion = visible). Optional `data-reveal-delay="200"`. Parents with `[data-reveal-stagger]` set `--vk-i` on children for 70ms stagger.
- `[data-split]` → splits text into `.vk-split-word > .vk-split-inner` spans (preserving `<em>` and `<br>`), animates words rising in sequence when revealed.
- `[data-parallax="0.15"]` → translateY by speed × distance from viewport center (rAF, only when in view, disabled < 750px unless `data-parallax-mobile`).
- `[data-magnetic]` → element follows pointer within its bounds (max 12px; inner `.vk-btn__label` 6px extra), springs back; fine pointers only.
- `[data-glow]` → sets `--vk-mx`/`--vk-my` (px) on pointermove for CSS radial hover light.
- `[data-tilt]` → subtle 3D tilt (max 6deg) on fine pointers.
- `[data-count-to="25"]` (+ `data-count-decimals`, `data-count-suffix`) → counts up when revealed.
- `[data-scrub]` → continuously sets `--vk-progress` (0→1) as the element travels through the viewport (`data-scrub="sticky"` measures across a tall sticky container). Used by manifesto word-lighting and VolcanicCore™ layers.
- `<vk-embers>` → lightweight canvas ember particle field (≤60 particles, DPR-capped at 2, pauses when off-screen or tab hidden, disabled on reduced motion).
- Header scroll state: adds `html.vk-scrolled` after 10px, `html.vk-scroll-down`/`vk-scroll-up` for hide-on-scroll header.
- Page transitions: CSS `@view-transition { navigation: auto; }` + root fade/slide keyframes (in `vk-motion.css`).
- Respect `prefers-reduced-motion: reduce` (disable all except opacity fades) and theme setting `settings.enable_animations` (adds `vk-motion` class on `<html>` only when on).

`assets/vk-motion.css` holds all reveal/split/marquee/transition keyframes and states.

Cart count: the header wraps the count in `<span id="vk-cart-icon-bubble">` containing `<span class="vk-cart-count" data-cart-count>N</span>`; `sections/vk-cart-icon-bubble.liquid` renders that inner span so the cart module can refresh it via the Section Rendering API. The cart button has `data-drawer-open="vk-cart-drawer"`.

Cart (`vk-cart.js`): `<vk-cart-drawer>` (extends drawer behaviour, re-renders via Section Rendering API section id `vk-cart-drawer`), `<vk-cart-items>` (qty change/remove → `/cart/change.js` with `sections: ['vk-cart-drawer','vk-cart-icon-bubble', 'vk-main-cart' when on cart page]`), free-shipping progress (`settings.free_shipping_threshold` in shop currency units), cart upsell product, cart note. Product forms publish `cartUpdate` with `{source, cart, sections}`; the drawer listens and opens.

Product (`vk-product.js`): `<vk-product-form>` (fetch `/cart/add.js` with `sections`, loading state, error message, publishes cartUpdate; falls back to native POST without JS), `<vk-variant-picker>` (reads `<script type="application/json" data-variants>`; updates URL `?variant=`, hidden id input, price block, ATC label/disabled, featured media, sticky ATC; publishes `variantChange`), `<vk-product-gallery>`, `<vk-sticky-atc>`, `<vk-bundle-picker>`, `<vk-recommendations>`.

## 9. Locale (translation) workflow — IMPORTANT for parallel work

- `locales/en.default.json` and `locales/nl.json` are owned by the **foundation agent** only. It pre-creates shared namespaces: `general.*`, `accessibility.*`, `products.product.*`, `products.card.*`, `cart.*`, `collections.*`, `search.*`, `newsletter.*`, `customer.*`, `gift_cards.*`, `templates.*`, `sections.*` (empty object for others).
- Every other agent that needs new storefront strings writes **fragment files**: `tools/locale-fragments/<agent-id>.en.json` and `tools/locale-fragments/<agent-id>.nl.json` (Dutch translation) — nested JSON under `sections.<your_section_name>.*` (or another clearly-owned namespace). The orchestrator deep-merges fragments into the locale files with `node tools/merge-locales.mjs`. You MAY run that script yourself to test (it is idempotent and safe to run concurrently-ish; if it reports a conflict, rename your keys).
- Before inventing a key, check whether `locales/en.default.json` already has it.
- Pluralization: `{ "one": "…", "other": "…" }` with `count`.

## 10. Templates workflow

Section agents do NOT edit `templates/*.json` directly. Each agent writes, for every section instance it wants on a template, a fragment file `tools/template-fragments/<template>/<NN>-<instance-key>.json` with content `{"type":"vk-…","settings":{…},"blocks":{…},"block_order":[…]}` — fully populated with final VOLKARA copy (from `docs/03-copy-deck.md`) and valid against the section schema. `NN` = the position number from §12. The orchestrator assembles `templates/<template>.json` with `node tools/assemble-templates.mjs`. Section groups (`header-group.json`, `footer-group.json`) are written directly by the header/footer owners.

## 11. Preview harness (QA) — `tools/preview/`

`npm run preview` (port 4321) renders the theme locally with liquidjs + Shopify-compatible tags/filters/objects and mock data (`tools/preview/mock/catalog.json`). Routes: `/`, `/collections/:handle`, `/products/:handle`, `/cart`, `/search?q=`, `/pages/:handle`, `/blogs/:blog`, `/blogs/:blog/:article`, `/404`, `/password`, plus Ajax API mocks (`/cart.js`, `/cart/add.js`, `/cart/change.js`, `/cart/update.js`, `/cart/clear.js`, `/recommendations/products`, `/search/suggest`), Section Rendering API (`?section_id=` & `?sections=`), `?view=` alternate templates, `?preview_section=<file-name-without-.liquid>` renders a single section with its preset/fragment settings inside the layout. `npm run shoot -- <path> [--mobile] [--full] [--out file.png] [--wait 1200] [--scroll]` takes Playwright screenshots (chromium at `/opt/pw-browsers`). `npm run check` runs Shopify theme-check. **Every agent must render and visually inspect its work (desktop 1440 and mobile 390) and fix what looks wrong before finishing.** The harness logs Liquid errors to the terminal and shows them inline in red in the page.

## 12. Page compositions (template order)

### Homepage `index`
01 `vk-hero` (scheme-1) · 02 `vk-marquee` USP ticker (scheme-2) · 03 `vk-manifesto` scroll-lit statement + counters (scheme-1) · 04 `vk-category-slider` (scheme-1) · 05 `vk-problem` (scheme-2) · 06 `vk-solution` hotspots + checklist (scheme-1) · 07 `vk-technology` VolcanicCore™ (scheme-1) · 08 `vk-featured-collection` bestsellers tabs/slider (scheme-2) · 09 `vk-product-spotlight` hero product w/ inline buy (scheme-1) · 10 `vk-benefits` bento (scheme-5 Porcelain) · 11 `vk-comparison` (scheme-1) · 12 `vk-reviews` slider (scheme-2) · 13 `vk-stories` UGC videos (scheme-1) · 14 `vk-faq` (scheme-2) · 15 `vk-cta` final CTA (scheme-1) · 16 `vk-newsletter` (scheme-2)

### Collection `collection`
01 `vk-collection-hero` · 02 `vk-usp-bar` · 03 `vk-main-collection` · 04 `vk-reviews` · 05 `vk-faq` (collection variant) · 06 `vk-cta`

### Product `product`
01 `vk-main-product` (gallery, info, bundles, ATC, accordions, sticky ATC) · 02 `vk-stories` "Real kitchens, real results" · 03 `vk-usp-bar` · 04 `vk-problem` · 05 `vk-solution` · 06 `vk-technology` (compact variant) · 07 `vk-comparison` · 08 `vk-reviews-wall` (masonry photo reviews + @app) · 09 `vk-faq` · 10 `vk-cta` · 11 `vk-product-recommendations`

### Technology page `page.technology`
01 `vk-hero` (VolcanicCore™ variant, macro visual) · 02 `vk-technology` (cinematic) · 03 `vk-benefits` · 04 `vk-comparison` · 05 `vk-faq` (technology questions) · 06 `vk-cta`

### Others
`cart` → `vk-main-cart` + `vk-product-recommendations`; `search` → `vk-main-search`; `404` → `vk-main-404`; `page` → `vk-main-page`; `page.about` → `vk-hero` (story variant) + `vk-manifesto` + `vk-image-text` ×2 + `vk-technology` + `vk-cta`; `page.contact` → `vk-main-page` + `vk-contact-form` + `vk-faq`; `list-collections` → `vk-main-list-collections`; `blog` → `vk-main-blog`; `article` → `vk-main-article`; `password` (layout `password`) → `vk-main-password`; `gift_card.liquid`; `customers/*` → minimal `vk-main-account-*` sections (login, register, account, order, addresses, reset_password, activate_account).

## 13. VOLKARA product & technology canon (use these facts consistently)

**VolcanicCore™ Technology** — a 5-ply forged construction, top to bottom:
1. **LavaCell™ Surface** — laser-etched hexagonal titanium relief. Raised peaks shield the surface from utensils; valleys hold a micro-film of oil for natural release and a deep sear.
2. **Titanium Shield** — pure, non-reactive titanium cooking layer. No PFAS, no PTFE, no coating to wear off — nothing between your food and the metal.
3. **Thermal Core** — triple aluminium core that pulls heat edge to edge in seconds; no hot spots, no cold rim.
4. **Stainless Structure** — 18/10 stainless steel body for rigidity and warp resistance.
5. **Magnetic Base** — 18/0 magnetic stainless steel: induction-ready, flat for life.
Plus: forged stay-cool handle with the signature **lava-red collar ring**; flared pour rim; oven- & grill-safe; dishwasher-safe; metal-utensil safe; works on gas, induction, ceramic, electric, oven, grill.
Spec labels (mono): `LAYER 01 · LAVACELL™ · Ti`, `LAYER 03 · THERMAL CORE · Al ×3`, `5-PLY · 3.0 MM`, `OVEN-SAFE 260°C`, `INDUCTION-READY`. (All technical numbers are editable defaults; docs flag them for verification.)

**Promises (editable defaults, flagged for merchant verification):** Lifetime warranty · 60-day home trial · Free shipping over €75 · PFAS- & PTFE-free · Secure checkout.

**Catalog** (mock + CSV import; prices in EUR):
| handle | title | options / variants (price) | collections | badge |
|---|---|---|---|---|
| forge-pan | VOLKARA Forge Pan | Size: 20 cm €119, 24 cm €139, 28 cm €159, 32 cm €189 | pans, bestsellers | Bestseller |
| forge-wok | VOLKARA Forge Wok | Size: 30 cm €189, 34 cm €219 | woks, bestsellers | — |
| saute-pan | VOLKARA Sauté Pan with Lid | Size: 24 cm €179, 28 cm €209 | pans, pots | New |
| saucepan | VOLKARA Saucepan with Lid | Size: 16 cm €129, 18 cm €149, 20 cm €169 | pots | — |
| stockpot | VOLKARA Stockpot with Lid | Size: 24 cm €239 | pots | — |
| the-trio | The Trio — Forge Pan Set | single €379 (compare-at €417 = sum of parts) | sets, bestsellers | Save €38 |
| chefs-collection | The Chef's Collection — 7 pieces | single €899 (compare-at €1,034) | sets | Most complete |
| signature-kitchen | The Signature Kitchen — 12 pieces | single €1,499 (compare-at €1,742) | sets | Limited |
| damascus-chef-knife | Damascus Chef Knife 21 cm | single €169 | knives | — |
| santoku-knife | Damascus Santoku 18 cm | single €149 | knives | — |
| titanium-board | Titanium Cutting Board | Size: M €89, L €119 | accessories | — |
| utensil-set | Precision Utensil Set — 5 pieces | single €99 | accessories | — |
| glass-lid | Tempered Glass Lid | Size: 20 cm €39, 24 cm €45, 28 cm €49 | accessories | — |
Collections: `all`, `pans`, `woks`, `pots`, `sets`, `knives`, `accessories`, `bestsellers`.

## 14. Brand voice & copy anchors

Voice: confident, precise, sensory, short sentences. Engineering facts delivered with emotion. No exclamation marks, no "amazing/revolutionary", no fake scarcity. Numbers in mono. Use "you"/"your kitchen". British-neutral English.

Anchor headlines (use verbatim; body copy in `docs/03-copy-deck.md`):
- Hero: eyebrow `FORGED TITANIUM COOKWARE` · H1 `Forged by fire. Built for <em>forever</em>.` · CTAs `Shop the collection` / `Discover VolcanicCore™`
- Marquee: `PFAS-free` · `Lifetime warranty` · `Induction-ready` · `Oven-safe to 260°C` · `Metal-utensil safe` · `Dishwasher safe` · `Free shipping over €75` · `60-day home trial`
- Manifesto: `Most pans are made to be replaced. VOLKARA is made to be <em>inherited</em>.`
- Category: `01 — THE COLLECTION` · `Choose your <em>instrument</em>.`
- Problem: `02 — THE PROBLEM` · `Your pan is quietly <em>failing</em> you.` (cards: Built to expire · Coatings that flake · Heat that lies)
- Solution: `03 — THE VOLKARA DIFFERENCE` · `One pan. <em>For life.</em>`
- Technology: `04 — VOLCANICCORE™ TECHNOLOGY` · `Engineered like a <em>volcano</em>.`
- Featured: `05 — BESTSELLERS` · `The <em>icons</em>.`
- Spotlight: `THE FORGE PAN` · `The only pan you'll <em>reach for</em>.`
- Benefits: `06 — WHY CHEFS SWITCH` · `Performance you can <em>feel</em>.`
- Comparison: `07 — THE COMPARISON` · `Not all pans are <em>created equal</em>.`
- Reviews: `08 — REVIEWS` · `Trusted by kitchens that <em>cook daily</em>.`
- Stories: `REAL KITCHENS` · `Real cooks. Real <em>results</em>.`
- FAQ: `09 — FAQ` · `Questions, <em>answered</em>.`
- CTA: `YOUR LAST PAN` · `The last pan you'll ever <em>buy</em>.` CTA `Choose your pan`
- Newsletter: `THE INNER CIRCLE` · `Stay close to the <em>fire</em>.`

## 15. Quality bar (definition of done for any agent)

1. `npm run check` reports **zero errors** for your files (warnings reviewed; fix all reasonable ones).
2. Renders in the harness with **no Liquid errors**, desktop 1440 + mobile 390 screenshots inspected; nothing overflows horizontally at 390px; tap targets ≥ 44px.
3. Accessible: semantic landmarks/headings in order, labelled controls, keyboard operable, visible focus, `aria-*` correct, color contrast AA for text, images have alt, motion respects reduced-motion.
4. Performance: no layout shift from images (width/height or aspect-ratio), first hero image `loading="eager" fetchpriority="high"`, everything else lazy; JS deferred; no render-blocking third-party anything; CSS per section.
5. Works without JS (content visible, forms post natively) and in the Shopify theme editor (`shopify:section:load/unload/select`, `block:select` events handled where interactive — e.g. sliders scroll to the selected block, drawers open when selected).
6. Copy is final VOLKARA copy, never lorem ipsum.
