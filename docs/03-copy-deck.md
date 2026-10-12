# VOLKARA — Copy Deck (final)

> **Status:** final storefront copy for every section instance in BUILD_SPEC §12 · **Language:** British-neutral English · **Owner:** Creative Direction
> **Read with:** `02-volkara-strategy.md` (voice, messaging hierarchy) · `07-conversion-plan.md` (claims & compliance)

## How to use this deck

| Convention | Meaning |
|---|---|
| `<em>word</em>` | The accent word. Paste it into `inline_richtext` settings exactly as written; it renders in Instrument Serif italic with the ember gradient. **One accent per heading, never more.** |
| `index` + `eyebrow` | Rendered by `vk-heading` as `02 — THE PROBLEM`. Enter the number in `index` and the label in `eyebrow`. Sections without a chapter number leave `index` blank. |
| **[verify]** | An editorial flag for the merchant: the statement must be confirmed (test report, policy, logistics contract) before launch. **Never paste `[verify]` into the theme.** If a claim cannot be verified, use the fallback given in the claims register below. |
| URLs | Only Shopify-native paths: `/collections/<handle>`, `/products/<handle>`, `/pages/<handle>`, `/policies/<handle>`, `/search`, `/cart`. One in-page anchor: `#buy` (the product buy box, used by CTAs on product pages). The technology story lives at `/pages/technology` (template `page.technology`). |
| Numbers | Always numerals, always with units, rendered in JetBrains Mono: `260°C`, `3.0 mm`, `€75`, `60-day`. |
| Punctuation | No exclamation marks. Em dashes with spaces ( — ). Curly apostrophes in storefront copy. Sentence case for everything except mono eyebrows and spec labels. |

### Claims register (single source of truth)

Every promise and technical number in this deck traces back to one row here. Change a value here first, then everywhere it appears.

| Claim | Default copy | Evidence the merchant must hold | Fallback if unverified |
|---|---|---|---|
| Free of PFAS & PTFE | `PFAS- & PTFE-free` | Supplier declaration + third-party lab report (EN/ISO method) per SKU **[verify]** | Remove the claim entirely — do not soften to "eco" or "healthier" |
| Lifetime warranty | `Lifetime warranty` | Written commercial-guarantee terms published at `/pages/warranty` **[verify]** | `25-year warranty` or whatever the terms actually state |
| 60-day home trial | `60-day home trial` | Returns policy at `/policies/refund-policy` stating 60 days from delivery, used items accepted **[verify]** | `30-day returns` |
| Free shipping threshold | `Free shipping over €75` | Shipping rates configured in Shopify for every live market **[verify]** | Show the real threshold or remove |
| Oven-safe temperature | `Oven-safe to 260°C` | Manufacturer spec for pans and pots **[verify]**; glass lids rated separately (default `180°C`) **[verify]** | Use the manufacturer's figure |
| Construction | `5-ply · 3.0 mm` | Manufacturer spec sheet **[verify]** | Use the manufacturer's figure |
| Metal-utensil safe | `Metal-utensil safe` | Abrasion test or manufacturer statement **[verify]** | `Gentle on utensils — use wood or silicone` (and remove from marquee) |
| Dishwasher-safe | `Dishwasher-safe` | Manufacturer statement **[verify]** | `Hand-wash recommended` |
| Weights | `≈ 1.3 kg (28 cm)` | Weighed production samples **[verify]** | Omit weights |
| Dispatch & delivery times | `Dispatched in 1–2 working days · delivered in 2–5` | 3PL / carrier SLA **[verify]** | `Tracked delivery` |
| Support response | `Reply within one working day` | Staffing plan **[verify]** | `We reply as fast as we can, Monday to Friday` |

---

## 1. Global: header, announcement bar, mega menu, cart drawer, newsletter, footer

### 1.1 Announcement bar (rotating, 3 messages, ~5 s each)

| # | Message | Link |
|---|---|---|
| 1 | `Free shipping on orders over €75` | `/policies/shipping-policy` |
| 2 | `60-day home trial — cook with it, then decide` | `/policies/refund-policy` |
| 3 | `Lifetime warranty on every VolcanicCore™ piece` | `/pages/warranty` |

Promotional override (only when a real, dated promotion runs): `Launch offer: The Trio at €379 until 30 November` — the end date must match the Shopify discount end date.

### 1.2 Main navigation (`main-menu`)

| Label | URL | Notes |
|---|---|---|
| Shop | `/collections/all` | Opens the mega menu |
| Sets | `/collections/sets` | The AOV path gets its own top-level door |
| VolcanicCore™ | `/pages/technology` | Technology story (template `page.technology`) |
| Our story | `/pages/about` | |
| Support | `/pages/contact` | Contact, FAQ, order help, returns |

Right-side utilities (aria labels are locale strings): Search · Account · Bag (count).

### 1.3 Mega menu (`Shop`)

| Column title | Links (label → URL) |
|---|---|
| Cookware | Forge Pan → `/products/forge-pan` · Forge Wok → `/products/forge-wok` · Sauté Pan → `/products/saute-pan` · Saucepan → `/products/saucepan` · Stockpot → `/products/stockpot` · All cookware → `/collections/all` |
| Sets | The Trio → `/products/the-trio` · The Chef's Collection → `/products/chefs-collection` · The Signature Kitchen → `/products/signature-kitchen` · All sets → `/collections/sets` |
| Knives & tools | Damascus Chef Knife → `/products/damascus-chef-knife` · Damascus Santoku → `/products/santoku-knife` · Titanium Cutting Board → `/products/titanium-board` · Precision Utensil Set → `/products/utensil-set` · Tempered Glass Lid → `/products/glass-lid` |

**Feature card 1 (product)**

| Field | Copy |
|---|---|
| Image | Forge Pan packshot (`vk-visual-pan.webp`) |
| Eyebrow | `THE ICON` |
| Title | `The Forge Pan` |
| Text | Four sizes, one construction. The pan most VOLKARA kitchens start with. |
| CTA | `Shop the Forge Pan` → `/products/forge-pan` |

**Feature card 2 (sets, optional second card)**

| Field | Copy |
|---|---|
| Image | The Trio packshot (`vk-visual-set.webp`) |
| Eyebrow | `THE TRIO` |
| Title | `Three sizes. Save €38.` |
| Text | 20, 24 and 28 cm Forge Pans for €379 — €38 less than buying them one by one. |
| CTA | `Shop The Trio` → `/products/the-trio` |

### 1.4 Cart drawer

| Element | Copy |
|---|---|
| Title | `Your bag` (+ count) |
| Empty — heading | `Your bag is empty.` |
| Empty — text | Every great kitchen starts with one pan. |
| Empty — primary CTA | `Shop the Forge Pan` → `/products/forge-pan` |
| Empty — secondary CTA | `Browse all cookware` → `/collections/all` |
| Free shipping — below threshold | `You're {{ amount }} away from free shipping.` |
| Free shipping — reached | `Free shipping unlocked. It's on us.` |
| Free shipping — empty bag | `Free shipping on orders over €75.` |
| Upsell heading | `Made to go with it` |
| Upsell default product | Tempered Glass Lid (`glass-lid`) — sub-label: `Sized to your pan. Watch, don't lift.` |
| Cart note label | `Add a note or gift message` |
| Subtotal label | `Subtotal` |
| Tax/shipping line | `Taxes included. Shipping calculated at checkout.` |
| Checkout button | `Checkout — {{ total }}` |
| Trust line | `Lifetime warranty · 60-day home trial · Secure checkout` |
| Continue link | `Continue shopping` |

### 1.5 Newsletter (section + footer form)

| Field | Copy |
|---|---|
| Eyebrow | `THE INNER CIRCLE` |
| Heading | `Stay close to the <em>fire</em>.` |
| Subheading | First access to new pieces, technique notes from serious home cooks and the occasional dispatch from the forge. One email a fortnight — never more. |
| Perk 1 | Early access to new releases |
| Perk 2 | Recipes and technique notes |
| Perk 3 | Care guides for a lifetime of use |
| Perk 4 | Invitations to members-only events |
| Input placeholder | `Your email address` |
| Button | `Join` |
| Consent line | By joining, you agree to receive marketing emails from VOLKARA. Unsubscribe in one click, any time. Read our `Privacy Policy` → `/policies/privacy-policy`. |
| Success | `You're in. Watch your inbox — the first letter is on its way.` |
| Error (invalid) | `That email address doesn't look right. Please check it and try again.` |

Do **not** promise a discount code unless one is actually configured in Shopify and sent by the email flow.

### 1.6 Footer

| Element | Copy |
|---|---|
| Brand blurb | Forged titanium cookware, engineered around VolcanicCore™. Built for the heat of serious home kitchens — and for the decades after. |
| Column 1 title | `Shop` — All cookware · Pans · Woks · Pots · Sets · Knives · Accessories |
| Column 2 title | `Support` — Contact · Shipping · Returns & home trial · Warranty · Track your order (`/account`) |
| Column 3 title | `The house` — Our story (`/pages/about`) · VolcanicCore™ (`/pages/technology`) · Care guide (`/pages/warranty#care`) |
| Column 4 title | `Legal` — Terms of service · Privacy policy · Refund policy · Shipping policy · Cookie preferences · Withdraw from a contract |
| Newsletter line | Join the Inner Circle: new pieces, recipes and nothing you'll want to unsubscribe from. |
| Contact rows | `support@volkara.com` **[verify]** · `Mon–Fri, 09:00–17:00 CET` **[verify]** · registered business address **[verify — legally required imprint]** |
| Legal line | `© 2026 VOLKARA. All rights reserved. All prices include VAT.` |

"Withdraw from a contract" links to the EU withdrawal function (see `07-conversion-plan.md` §7). "Cookie preferences" re-opens the Shopify consent banner.

---

## 2. Homepage — `index`

Suggested fragment keys: `01-hero`, `02-marquee`, `03-manifesto`, `04-categories`, `05-problem`, `06-solution`, `07-technology`, `08-bestsellers`, `09-spotlight`, `10-benefits`, `11-comparison`, `12-reviews`, `13-stories`, `14-faq`, `15-cta`, `16-newsletter`.

### 01 · `vk-hero` (scheme-1 Volcanic)

| Field | Copy |
|---|---|
| Eyebrow | `FORGED TITANIUM COOKWARE` |
| Heading (H1) | `Forged by fire. Built for <em>forever</em>.` |
| Subheading | Five forged layers around a pure titanium surface. No coating to flake, nothing to replace — just a deeper sear, faster heat and a pan that outlasts every one you've owned. |
| Primary CTA | `Shop the collection` → `/collections/all` |
| Secondary CTA | `Discover VolcanicCore™` → `/pages/technology` |
| Trust micro-row (4) | `Lifetime warranty` · `60-day home trial` · `PFAS- & PTFE-free` · `Free shipping over €75` |
| Scroll cue | `Scroll` |
| Image alt | VOLKARA Forge Pan suspended above a ring of gas flame, embers rising in the dark |
| Visual | `vk-visual-hero.webp` (pan right, negative space left) |

### 02 · `vk-marquee` USP ticker (scheme-2 Obsidian)

Eight items, in this order, separated by the section's ember dot:

`PFAS-free` · `Lifetime warranty` · `Induction-ready` · `Oven-safe to 260°C` · `Metal-utensil safe` · `Dishwasher safe` · `Free shipping over €75` · `60-day home trial`

Suggested icons, in the same order: `shield` · `warranty` · `induction` · `oven` · `utensils` · `dishwasher` · `truck` · `return`. (`drop` is reserved for oil and care content.)

### 03 · `vk-manifesto` scroll-lit statement + counters (scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `THE VOLKARA MANIFESTO` |
| Statement (scroll-lit) | `Most pans are made to be replaced. VOLKARA is made to be <em>inherited</em>.` |
| Supporting line | We started with one frustration: good cookware should get better every year, not worse. So we removed the coating, forged five layers of metal into one body and wrote a lifetime warranty to prove we meant it. |
| Visual | `vk-visual-forge.webp` (hammer and sparks) |

| Counter | Number (`data-count-to`) | Suffix | Label |
|---|---|---|---|
| 1 | `5` | — | forged layers in every pan |
| 2 | `3.0` (decimals 1) | `mm` | body thickness, rim to base |
| 3 | `260` | `°C` | oven- and grill-safe |
| 4 | `60` | `-day` | home trial, used is fine |

### 04 · `vk-category-slider` (scheme-1)

| Field | Copy |
|---|---|
| Index · Eyebrow | `01` · `THE COLLECTION` |
| Heading | `Choose your <em>instrument</em>.` |
| Subheading | One construction, one standard, six ways to cook. Choose by what you make most. |
| Footer link | `View all cookware` → `/collections/all` |

| Card | Title | Subtitle | CTA label | URL | Visual |
|---|---|---|---|---|---|
| 1 | Pans | The everyday icon | `Explore pans` | `/collections/pans` | `vk-visual-pan.webp` |
| 2 | Woks | Built for fierce heat | `Explore woks` | `/collections/woks` | `vk-visual-wok.webp` |
| 3 | Pots | Slow heat, perfectly held | `Explore pots` | `/collections/pots` | placeholder `set` until stockpot shot exists |
| 4 | Sets | Your kitchen, complete | `Explore sets` | `/collections/sets` | `vk-visual-set.webp` |
| 5 | Knives | Damascus precision | `Explore knives` | `/collections/knives` | `vk-visual-knife.webp` |
| 6 | Accessories | The finishing details | `Explore accessories` | `/collections/accessories` | placeholder `macro` until utensils shot exists |

### 05 · `vk-problem` (scheme-2)

| Field | Copy |
|---|---|
| Index · Eyebrow | `02` · `THE PROBLEM` |
| Heading | `Your pan is quietly <em>failing</em> you.` |
| Subheading | Most cookware is designed around a coating — and coatings are designed to wear out. The evidence is already in your kitchen. |

| Card | Title | Body (2 sentences) | Stat value | Stat label | Visual |
|---|---|---|---|---|---|
| 1 | Built to expire | Coated pans are sold as consumables: the surface begins to degrade from the first hot sear. A few years later they're scraped, stained and back on your shopping list. | `2–5 YRS` | typical working life of a coated pan in daily use **[verify: cite a consumer-test source, or swap the value for `BUILT TO BE REPLACED`]** | placeholder `problem` (next-wave shot P1) |
| 2 | Coatings that flake | One slip of a metal spatula and the damage is done. A scratched coating loses its release — and whatever flakes away has to go somewhere. | `1 SCRATCH` | is all it takes to breach a coating | `vk-visual-problem-coating.webp` |
| 3 | Heat that lies | Thin bases warp and build hot spots, so the centre scorches while the rim stays pale. You end up cooking around your pan instead of with it. | `HOT SPOTS` | the signature of a thin, single-layer base | placeholder `problem` (next-wave shot P3) |

### 06 · `vk-solution` hotspots + checklist (scheme-1)

| Field | Copy |
|---|---|
| Index · Eyebrow | `03` · `THE VOLKARA DIFFERENCE` |
| Heading | `One pan. <em>For life.</em>` |
| Subheading | Every material earns its place. Nothing is sprayed on, nothing wears off — and every detail is shaped around how serious home cooks actually cook. |
| CTA | `Shop the Forge Pan` → `/products/forge-pan` |
| Visual | `vk-visual-pan.webp` (cut-out on black) |

**Checklist (accordion, first item open)**

| # | Title | Body |
|---|---|---|
| 1 | No PFAS. No PTFE. No coating. | The cooking surface is pure titanium, bonded into the body of the pan. There is no synthetic layer between your food and the metal — so there is nothing to scratch through, flake or replace. |
| 2 | Release you build, not buy. | The LavaCell™ hexagonal relief holds a micro-film of oil in its valleys. Preheat, add a little fat and food lifts cleanly — then sears deeper with every cook. |
| 3 | Heat that tells the truth. | A triple aluminium Thermal Core spreads heat edge to edge in seconds. No scorched centre, no pale rim, no guesswork. |
| 4 | Every hob. Every tool. | Gas, induction, ceramic, electric, oven and grill to 260°C. Metal spatulas and whisks are welcome, and the dishwasher is fine on busy nights. |

**Hotspots (4)**

| # | Label | Detail (tooltip) |
|---|---|---|
| 1 | LavaCell™ surface | Laser-etched titanium hexagons: peaks protect, valleys hold oil. |
| 2 | Flared pour rim | Pours sauces and fat cleanly, without a drip down the side. |
| 3 | Stay-cool forged handle | Stays comfortable on the hob; the lava-red collar marks every VOLKARA piece. |
| 4 | Magnetic induction base | 18/0 stainless steel, machined flat and built to stay that way. |

### 07 · `vk-technology` VolcanicCore™ (scheme-1)

| Field | Copy |
|---|---|
| Index · Eyebrow | `04` · `VOLCANICCORE™ TECHNOLOGY` |
| Heading | `Engineered like a <em>volcano</em>.` |
| Intro | A volcano is layered rock and contained heat. VolcanicCore™ is built the same way: five forged layers, each with a single job, bonded into one 3.0 mm body that heats fast, holds steady and is built to stay flat for life. |
| CTA | `See it in the Forge Pan` → `/products/forge-pan` |
| Footnote | Specifications shown for the Forge Pan. Each product page lists its own dimensions and weight. |
| Visual | `vk-visual-macro.webp` (LavaCell™ macro) |

**Layers (top → bottom, sticky exploded stack)**

| # | Name | Spec label (mono) | Description |
|---|---|---|---|
| 01 | LavaCell™ Surface | `LAYER 01 · LAVACELL™ · Ti` | Laser-etched hexagonal titanium relief. Raised peaks shield the surface from utensils; valleys hold a micro-film of oil for natural release and a deeper sear. |
| 02 | Titanium Shield | `LAYER 02 · TITANIUM SHIELD · Ti` | A pure, non-reactive titanium cooking layer. No PFAS, no PTFE, no coating to wear off — nothing between your food and the metal. |
| 03 | Thermal Core | `LAYER 03 · THERMAL CORE · Al ×3` | A triple aluminium core that pulls heat from the centre to the rim in seconds. No hot spots, no cold edge. |
| 04 | Stainless Structure | `LAYER 04 · STAINLESS STRUCTURE · 18/10` | An 18/10 stainless steel body that gives the pan its rigidity and resists warping under thermal shock. |
| 05 | Magnetic Base | `LAYER 05 · MAGNETIC BASE · 18/0` | 18/0 magnetic stainless steel: induction-ready and machined flat, so the pan sits true on every hob. |

**Key stats (3)**

| Value | Label |
|---|---|
| `5-PLY` | forged layers, bonded as one |
| `3.0 MM` | body thickness for steady heat |
| `260°C` | oven- and grill-safe |

All technical values: **[verify]** against the manufacturer spec sheet.

### 08 · `vk-featured-collection` bestsellers tabs (scheme-2)

| Field | Copy |
|---|---|
| Index · Eyebrow | `05` · `BESTSELLERS` |
| Heading | `The <em>icons</em>.` |
| Subheading | The pieces most kitchens start with — and build around. |
| CTA | `View all cookware` → `/collections/all` |

| Tab | Label | Collection |
|---|---|---|
| 1 | Bestsellers | `bestsellers` |
| 2 | Pans | `pans` |
| 3 | Sets | `sets` |
| 4 | Knives | `knives` |

### 09 · `vk-product-spotlight` Forge Pan inline buy (scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `THE FORGE PAN` |
| Heading | `The only pan you'll <em>reach for</em>.` |
| Body | Four sizes, one obsession. The Forge Pan is VolcanicCore™ in its purest form: a fast, even, ferocious sear on any hob, and a titanium surface that only improves with use. |
| Product | `forge-pan` |
| Bullet 1 | LavaCell™ titanium surface — no coating, ever |
| Bullet 2 | Edge-to-edge heat from a triple aluminium core |
| Bullet 3 | Oven- and grill-safe to 260°C, induction-ready |
| Bullet 4 | Lifetime warranty and a 60-day home trial |
| Size helper | 20 cm — eggs, sauces, suppers for one · 24 cm — the everyday all-rounder · 28 cm — family meals, two steaks at once · 32 cm — cooking for a crowd |
| Secondary link | `Explore the Forge Pan` → `/products/forge-pan` |
| Visual | `vk-visual-sear.webp` (ribeye sear) |

### 10 · `vk-benefits` bento (scheme-5 Porcelain)

| Field | Copy |
|---|---|
| Index · Eyebrow | `06` · `WHY CHEFS SWITCH` |
| Heading | `Performance you can <em>feel</em>.` |
| Subheading | The difference shows up in the first week — and keeps showing up for decades. |
| CTA | `Find your piece` → `/collections/all` |

| Tile | Title | Text | Stat | Suggested size / visual |
|---|---|---|---|---|
| 1 | A sear with real crust | Peaks lift, valleys hold oil. The LavaCell™ relief gives steak, scallops and potatoes the contact they need for a deep, even crust. | `3.0 MM` heat-holding body | Large · `vk-visual-sear.webp` |
| 2 | Heat in seconds | The triple aluminium core answers the dial immediately — up for a sear, down for a sauce — without the long lag of cast iron. | `Al ×3` thermal core | Small |
| 3 | Metal-utensil safe | Use the spatula you actually like. Titanium peaks take the contact, so whisks, tongs and fish slices are welcome. | `0` coatings to scratch | Small |
| 4 | Hob to oven to table | Start on the hob, finish in the oven, serve from the pan. Built for the whole recipe, not just the first step. | `260°C` oven-safe | Wide · `vk-visual-chef.webp` |
| 5 | Clean in a minute | Titanium and stainless steel have nothing to strip, so the dishwasher is fine. Most days, warm water and a soft sponge are quicker. | `DISHWASHER-SAFE` | Small |
| 6 | Built to be handed down | No coating to expire, a body that resists warping and a lifetime warranty in writing. Buy once. Pass it on. | `LIFETIME` warranty | Small |

### 11 · `vk-comparison` (scheme-1)

| Field | Copy |
|---|---|
| Index · Eyebrow | `07` · `THE COMPARISON` |
| Heading | `Not all pans are <em>created equal</em>.` |
| Subheading | How VolcanicCore™ compares with the two pans most kitchens already own. |
| Column heads | `VOLKARA` · `Non-stick` · `Cast iron` |
| Footer note | Compared with typical PTFE-coated aluminium pans and traditional unenamelled cast iron. Individual products vary. Every VOLKARA piece is backed by a lifetime warranty. |

States: `yes` (ember check) · `partial` (ash dash) · `no` (muted cross).

| Group | Row | VOLKARA | Non-stick | Cast iron |
|---|---|---|---|---|
| Performance | Searing | `yes` Deep, even crust | `no` Coating limits high heat | `yes` Excellent crust |
| Performance | Heat response | `yes` Fast and even, edge to edge | `partial` Fast, but thin bases build hot spots | `partial` Slow to heat, slow to adjust |
| Durability | Metal utensils | `yes` Welcome | `no` Scratch the coating | `yes` Welcome |
| Durability | Working life | `yes` Built for decades, lifetime warranty | `no` Replaced every few years | `yes` Decades, with care |
| Health & purity | PFAS & PTFE | `yes` None — no coating at all | `no` PTFE fluoropolymer coating | `yes` None |
| Health & purity | Acidic food | `yes` Non-reactive with tomato, wine and citrus | `partial` Fine while the coating is intact | `no` Reacts and can taste metallic |
| Everyday life | Care | `yes` Dishwasher-safe, no ritual | `partial` Hand-wash to protect the coating | `no` Hand-wash, dry and oil every time |
| Everyday life | Weight | `yes` Balanced — ≈ 1.3 kg at 28 cm **[verify]** | `yes` Light | `no` Heavy — often 2.5 kg or more |

### 12 · `vk-reviews` slider (scheme-2)

| Field | Copy |
|---|---|
| Index · Eyebrow | `08` · `REVIEWS` |
| Heading | `Trusted by kitchens that <em>cook daily</em>.` |
| Subheading | What home cooks say after the first sear — and the hundredth. |
| Rating summary | Rendered only from `reviews.rating` / `reviews.rating_count` metafields. No hard-coded totals. |
| CTA | `Read all reviews` → `/products/forge-pan#reviews` |

> **SAMPLE CONTENT — REPLACE WITH REAL REVIEWS BEFORE LAUNCH.**
> The eight reviews below exist only to design and test the layout in the theme editor and preview harness. Publishing invented reviews as genuine is a blacklisted practice under the EU Unfair Commercial Practices Directive (Annex I, points 23b–23c) and the Dutch ACM guidelines. Before the store goes live, either connect a reviews app (`@app` block) or import verified reviews, and remove every sample below.

| # | Name | Product · size | Rating | Title | Text |
|---|---|---|---|---|---|
| 1 | Lotte V. | Forge Pan · 28 cm | 5 | The crust I'd been chasing for years | I'd given up on a steakhouse sear at home. A proper preheat, a little oil, and the ribeye lifted on its own with a crust I've only had in restaurants. The coated pan went to recycling the same week. |
| 2 | Jonas B. | The Trio | 5 | Bought one, then the set | Started with the 24 cm and ordered the Trio within a month. Eggs in the small one, everything else in the 28. Hob, oven, dishwasher — they still look new. |
| 3 | Anouk de G. | Forge Pan · 24 cm | 4 | A learning curve, then love | My first eggs stuck, entirely my fault — I rushed the preheat. Once I used the water-droplet test it became the easiest pan I own. Heavier than my old one, in a good way. |
| 4 | Marco R. | Forge Wok · 34 cm | 5 | Real wok heat on induction | Induction and woks rarely get along. This one sits flat, heats fast and holds its temperature when the noodles go in. The helper handle makes tossing easy. |
| 5 | Rania K. | Damascus Chef Knife | 5 | Balanced like it was made for me | Sharp out of the box, a beautiful pattern, and the red collar makes it look like part of the set. Onions, herbs, a whole chicken — effortless. |
| 6 | Erik S. | The Chef's Collection | 5 | Replaced an entire cupboard | We swapped eleven tired pans for seven pieces that actually work. The stockpot was the surprise: even heat across the base and nothing catching on long braises. |
| 7 | Tess H. | Saucepan · 18 cm | 4 | Excellent — I'd like a heavier lid | Heats evenly and the pour rim really doesn't drip. My only wish is a weightier lid; the glass one does the job and lets me watch the sauce. |
| 8 | Sven D. | Forge Pan · 20 cm | 5 | My mother asked for one | I made her a frittata, finished in the oven, and she ordered her own that evening. Two generations of cooks, one opinion. |

### 13 · `vk-stories` UGC videos (scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `REAL KITCHENS` |
| Heading | `Real cooks. Real <em>results</em>.` |
| Subheading | Moments from kitchens that cook with VOLKARA. Share yours with `#VOLKARAKITCHEN` and we may feature it here. |
| CTA | `Shop the Forge Pan` → `/products/forge-pan` |

| Card | Title | Caption | Product tag |
|---|---|---|---|
| 1 | The egg test | Preheat, oil, wait for the shimmer. It slides. | Forge Pan · 24 cm |
| 2 | Ribeye on induction | Crust first, then butter, thyme and patience. | Forge Pan · 28 cm |
| 3 | Midweek wok night | High heat, fast hands, dinner in ten minutes. | Forge Wok · 30 cm |
| 4 | Hob to oven | A frittata started on the hob, finished at 200°C. | Sauté Pan · 28 cm |

Until real customer videos are licensed, use brand-made kitchen films and label the section `FROM OUR KITCHEN` instead of `REAL KITCHENS`. Never present AI-generated or staged footage as customer content.

### 14 · `vk-faq` (scheme-2)

| Field | Copy |
|---|---|
| Index · Eyebrow | `09` · `FAQ` |
| Heading | `Questions, <em>answered</em>.` |
| Subheading | Everything worth knowing before your first sear. |
| Contact line | `Still curious? Talk to a person — we reply within one working day.` → `/pages/contact` **[verify SLA]** |

| # | Question | Answer |
|---|---|---|
| 1 | Is VOLKARA safe? Is it really PFAS-free? | Yes. VOLKARA cookware contains no PFAS, PTFE or PFOA and has no synthetic coating of any kind. Your food touches titanium — a non-reactive metal that doesn't alter flavour — bonded to stainless steel. Test reports are available on request. **[verify: lab report per SKU]** |
| 2 | Will food stick? How do I cook on it? | It isn't a coated pan, so technique matters for the first few cooks. Preheat on medium for two to three minutes, until a drop of water skates across the surface. Add a thin film of oil, let it shimmer, add your food and leave it until it releases on its own. If something sticks, the pan wasn't quite hot enough or the food moved too soon — and it soaks off in minutes. |
| 3 | Can I use metal utensils? | Yes. The raised LavaCell™ peaks take the contact and protect the titanium in the valleys, so spatulas, whisks and tongs are welcome. Over the years the peaks develop a soft polish. That's patina, not damage, and it doesn't affect performance. |
| 4 | Which heat sources does it work on? | All of them: gas, induction, ceramic, electric, halogen, oven and grill. The magnetic 18/0 steel base sits flat on induction. On gas, keep the flame within the base for the most even heat. |
| 5 | Is it dishwasher-safe? | Yes — there is no coating for a dishwasher to strip. We still suggest warm water and a soft sponge: it's quicker and keeps the exterior brilliant. For stubborn residue, simmer a little water for a minute, then wipe. |
| 6 | How hot can it go in the oven? | Pans and pots are oven- and grill-safe to 260°C. Tempered glass lids are oven-safe to 180°C. Handles get hot in the oven, so always use a cloth or glove. **[verify both temperatures]** |
| 7 | What does the lifetime warranty cover? | Every VolcanicCore™ piece is guaranteed against defects in materials and workmanship for its lifetime in household use — including delamination, warping under normal use and handle failure. It doesn't cover cosmetic wear, misuse or commercial kitchens. The warranty comes on top of your statutory rights, which are never affected. Full terms: `/pages/warranty`. **[verify terms]** |
| 8 | How does the 60-day home trial work? | Cook with it for up to 60 days from delivery. If it isn't the best pan you own, tell us, send it back clean and complete, and we'll refund the purchase price. Used is fine. Your statutory 14-day right of withdrawal applies separately. **[verify: who pays return shipping]** |
| 9 | How fast is shipping, and what does it cost? | Orders are dispatched within one to two working days and usually arrive within two to five. Shipping is free on orders over €75; below that, the rate is shown at checkout before you pay. You'll receive a tracking link the moment your order leaves us. **[verify markets and times]** |
| 10 | Do I need to season it? | No. VOLKARA works straight from the box after a wash. If you like, give it a two-minute activation: warm the pan, wipe in a teaspoon of neutral oil, heat until it shimmers, cool and wipe. There's no ongoing seasoning ritual like cast iron. |
| 11 | How heavy is it? | Balanced rather than heavy. The 28 cm Forge Pan weighs about 1.3 kg — more than a thin coated pan, far less than cast iron of the same size. The forged handle places the weight where your wrist expects it. **[verify weights]** |
| 12 | How is it different from other hammered titanium or hybrid pans? | Many "titanium" and hybrid pans are stainless steel with a coating in disguise — a raised steel pattern filled with non-stick, or a titanium-reinforced coating that still wears away. VolcanicCore™ has no coating at all: the cooking surface is titanium, laser-etched into a LavaCell™ relief and bonded into a five-layer forged body. Nothing to wear through, no hidden fluoropolymer, and a lifetime warranty in writing. |

### 15 · `vk-cta` final CTA (scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `YOUR LAST PAN` |
| Heading | `The last pan you'll ever <em>buy</em>.` |
| Subheading | Choose your size. Cook with it for 60 days. Keep it for life. |
| CTA | `Choose your pan` → `/collections/pans` |
| Promise chips (3) | `Lifetime warranty` · `60-day home trial` · `Free shipping over €75` |
| Visual | `vk-visual-hero.webp` or ember field only |

### 16 · `vk-newsletter` (scheme-2)

Use §1.5 verbatim.

---

## 3. Collection — `collection`

### 01 · `vk-collection-hero`

The hero reads `collection.title` and `collection.description`. Paste the intro below into each collection's description in Shopify admin (and the CSV import). If the section supports a `custom.hero_heading` metafield, use the accented heading; otherwise the plain title shows.

| Handle | Title | Eyebrow | Accented heading | Intro (collection description) | Visual |
|---|---|---|---|---|---|
| `all` | All cookware | `THE COLLECTION` | `Every piece. One <em>standard</em>.` | Pans, woks, pots, knives and tools — all built on the same idea: performance that outlasts the kitchen it lives in. | `vk-visual-macro.webp` |
| `pans` | Pans | `FORGE PANS` | `The everyday <em>icon</em>.` | The Forge Pan in four sizes, and the Sauté Pan for everything deeper. VolcanicCore™ construction, a LavaCell™ titanium surface and a lifetime warranty on every one. | `vk-visual-pan.webp` |
| `woks` | Woks | `FORGE WOKS` | `Built for <em>fierce</em> heat.` | A flat base for induction, a deep bowl for tossing and a titanium surface that takes a roaring flame without flinching. | `vk-visual-wok.webp` |
| `pots` | Pots | `POTS & SAUCEPANS` | `Slow heat, <em>perfectly</em> held.` | Saucepans, a sauté pan and a stockpot with close-fitting lids — for sauces that never catch and braises that simmer evenly for hours. | placeholder `set` |
| `sets` | Sets | `COOKWARE SETS` | `Your kitchen, <em>complete</em>.` | Curated sets for less than the sum of their parts. Every saving shown is calculated against our own single-piece prices — nothing more, nothing inflated. | `vk-visual-set.webp` |
| `knives` | Knives | `DAMASCUS KNIVES` | `An edge worth <em>keeping</em>.` | Layered Damascus steel, balanced handles and the lava-red collar that ties them to your cookware. Sharp from the box and easy to keep that way. **[verify steel grade and hardness before adding specs]** | `vk-visual-knife.webp` |
| `accessories` | Accessories | `ACCESSORIES` | `The finishing <em>details</em>.` | A titanium cutting board, precision utensils and tempered glass lids — designed to work with VolcanicCore™, never against it. | placeholder `macro` |
| `bestsellers` | Bestsellers | `BESTSELLERS` | `The <em>icons</em>.` | The pieces most kitchens start with. Begin here, and add the rest when you're ready. | `vk-visual-sear.webp` |

### 02 · `vk-usp-bar` (5 items)

| # | Icon | Title | Sub-line |
|---|---|---|---|
| 1 | `shield` | PFAS- & PTFE-free | Nothing between food and metal |
| 2 | `warranty` | Lifetime warranty | Written into every piece |
| 3 | `return` | 60-day home trial | Cook first, decide later |
| 4 | `fire-ring` | Every heat source | Induction, gas, oven, grill |
| 5 | `truck` | Free shipping over €75 | Tracked, 2–5 working days **[verify]** |

Icon meaning must match the words (Okura paired "warranty" with a truck and "all heat sources" with a padlock — never again).

### 03 · `vk-main-collection` microcopy

| Element | Copy |
|---|---|
| Count | `{{ count }} pieces` (one: `1 piece`) |
| Sort label | `Sort` — Featured · Best selling · Price, low to high · Price, high to low · Newest |
| Filter button / drawer title | `Filter` / `Refine` |
| Apply / clear | `Show {{ count }} results` / `Clear all` |
| Load more | `Show more` + progress `Showing {{ shown }} of {{ total }}` |
| Empty (filters) | `Nothing matches those filters.` — Clear them, or explore the full collection. |
| Empty (collection) | `This collection is being forged.` — New pieces are on their way. Explore the full collection in the meantime. |
| In-grid editorial tile (sets) | Eyebrow `BUILD IT AS A SET` · Title `Save up to €243` · Text `Every set costs less than its pieces bought separately — calculated against our own prices.` · CTA `Shop sets` → `/collections/sets` |

### 04 · `vk-reviews` (collection variant, scheme-2)

| Field | Copy |
|---|---|
| Eyebrow | `REVIEWS` |
| Heading | `Trusted by kitchens that <em>cook daily</em>.` |
| Subheading | Words from verified owners, unedited. |
| Content | Same sample set as homepage §12 — same replacement rule applies. Show 4–6 cards. |

### 05 · `vk-faq` (collection variant — buying guide, scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `BUYING GUIDE` |
| Heading | `Before you <em>choose</em>.` |
| Subheading | Quick answers to the questions we hear most at this stage. |

| # | Question | Answer |
|---|---|---|
| 1 | Which size should I choose? | For one or two people, the 24 cm is the everyday all-rounder. For families or two steaks at once, choose 28 cm. 20 cm is perfect for eggs and sauces; 32 cm is for cooking for a crowd. Most kitchens end up with two sizes. |
| 2 | Pan, wok or sauté pan — which first? | Start with the Forge Pan: it sears, fries and finishes in the oven. Add the Forge Wok if you stir-fry weekly, or the Sauté Pan for braises, sauces and one-pan dinners with a lid. |
| 3 | Are the sets better value? | Yes, and transparently so. Every set is priced below the total of its pieces at our own single-piece prices: The Trio saves €38, The Chef's Collection €135 and The Signature Kitchen €243. |
| 4 | Do lids fit across pieces? | Tempered glass lids come in 20, 24 and 28 cm and fit any VOLKARA pan or pot of the same diameter. |
| 5 | Will it work on my hob? | Yes — gas, induction, ceramic, electric and halogen, plus oven and grill to 260°C. **[verify]** |
| 6 | What if it isn't right for me? | Cook with it for 60 days. If it isn't the best pan you own, send it back and we'll refund the purchase price. **[verify]** |

### 06 · `vk-cta` (collection variant, scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `NOT SURE WHERE TO START?` |
| Heading | `Start with the <em>Forge Pan</em>.` |
| Subheading | Most kitchens begin with the 28 cm. Cook with it for 60 days — then build around it. |
| CTA | `Shop the Forge Pan` → `/products/forge-pan` |
| Promise chips | `Lifetime warranty` · `60-day home trial` · `Free shipping over €75` |

---

## 4. Product — `product` (written for the Forge Pan; works for every cookware piece)

### 01 · `vk-main-product`

| Element | Copy |
|---|---|
| Badge | From `custom.badge` metafield. Forge Pan: `Bestseller`. |
| Title | `product.title` — `VOLKARA Forge Pan` |
| Subtitle (italic accent line, `custom.subtitle`) | `Five layers. One perfect sear.` |
| Rating | `vk-product-rating` — hidden when no metafield. |
| Gallery chip | `Lifetime warranty` |
| Short description | The pan most VOLKARA kitchens start with. A LavaCell™ titanium surface for a deep, natural-release sear, a triple aluminium core for edge-to-edge heat, and a forged body built to stay flat for life. |
| Size label | `Size` — helper link `Which size?` opens the size helper from §2.09 |

**USP tiles (2×2)**

| # | Icon | Title | Sub-line |
|---|---|---|---|
| 1 | `shield` | PFAS- & PTFE-free | Pure titanium surface |
| 2 | `warranty` | Lifetime warranty | In writing, for life |
| 3 | `fire-ring` | Every heat source | Induction to grill, 260°C |
| 4 | `utensils` | Metal-utensil safe | Dishwasher-safe, too |

**Bundle tiers (`vk-bundle-picker`)** — honest bundles: every saving is the real difference against our own single-piece prices; no percentage that the checkout does not charge.

| Element | Copy |
|---|---|
| Group label | `CHOOSE YOUR SET-UP` |
| Tier 1 — title | `The Pan` |
| Tier 1 — detail | One Forge Pan in your size. |
| Tier 2 — title | `Pan + Lid` |
| Tier 2 — detail | Your Forge Pan with the matching tempered glass lid. Sized to fit, priced as the two pieces. |
| Tier 2 — tag | `Most practical` |
| Tier 3 — title | `The Trio` |
| Tier 3 — detail | 20, 24 and 28 cm Forge Pans for €379 — €38 less than buying all three. |
| Tier 3 — tag | `Best value` |
| Saving line format | `You save €{{ amount }} vs. buying separately` |

If the merchant later wants a percentage bundle discount, it must be created as a Shopify automatic discount so the checkout charges exactly what the page shows. **[verify]**

| Element | Copy |
|---|---|
| ATC button | `Add to bag — {{ price }}` |
| ATC (sold out) | `Sold out` |
| ATC (unavailable variant) | `Unavailable in this size` |
| Countdown (only with a real merchant-set end date) | `Launch offer ends in` |
| Dispatch line | `Order today, dispatched within 1–2 working days.` **[verify]** |
| Included-with-order row (optional, only if produced) | `Included: The Heat Manual` — our digital guide to preheating, searing and care. **[verify: only show once the guide exists]** |
| Trust row | `Free shipping over €75` · `60-day home trial` · `Lifetime warranty` |
| Payment line | `Secure checkout` + `vk-payment-icons` |

**Accordions**

**Details & specs**

> The Forge Pan is VolcanicCore™ in its purest form. A laser-etched LavaCell™ titanium surface sears hard and releases naturally; a triple aluminium core spreads heat from centre to rim in seconds; an 18/10 stainless body and 18/0 magnetic base keep it rigid, flat and induction-ready. Finished with a forged stay-cool handle and the lava-red collar ring that marks every VOLKARA piece.

| Spec | Value |
|---|---|
| Construction | VolcanicCore™ 5-ply, forged and bonded |
| Body thickness | 3.0 mm **[verify]** |
| Cooking surface | LavaCell™ laser-etched titanium |
| Core | Triple aluminium Thermal Core |
| Body / base | 18/10 stainless steel / 18/0 magnetic stainless steel |
| Handle | Forged stainless steel, stay-cool on the hob, lava-red collar ring |
| Heat sources | Gas, induction, ceramic, electric, halogen, oven, grill |
| Oven / grill | Up to 260°C **[verify]** |
| Dishwasher | Safe |
| Sizes · weight | 20 cm ≈ 0.9 kg · 24 cm ≈ 1.1 kg · 28 cm ≈ 1.3 kg · 32 cm ≈ 1.7 kg **[verify all]** |
| In the box | Forge Pan, care card |
| Warranty | Lifetime, household use |

**Shipping & returns**

> Free shipping on orders over €75; below that, the rate is shown at checkout before you pay. Orders are dispatched within one to two working days and usually arrive within two to five, with tracking from the moment they leave us. **[verify]**
>
> **60-day home trial.** Cook with it for up to 60 days from delivery. If it isn't the best pan you own, contact us, send it back clean and complete, and we'll refund the purchase price. **[verify return-shipping terms]**
>
> Your statutory 14-day right of withdrawal applies in addition to the trial. Use `Withdraw from a contract` in the footer or contact us.

**Care**

> **Before first use.** Wash in warm, soapy water and dry. Optional: warm the pan, wipe in a teaspoon of neutral oil, heat for two minutes, cool and wipe.
>
> **Every day.** Preheat on medium for two to three minutes, until a drop of water skates. Add oil, let it shimmer, then cook. Medium heat does almost everything; high heat is for searing and woks.
>
> **Cleaning.** Warm water and a soft sponge, or the dishwasher. For stuck-on residue, simmer a little water for a minute, then wipe. For rainbow heat tint, a splash of white vinegar restores the shine.
>
> **Avoid.** Leaving an empty pan on high heat for long, plunging a hot pan into cold water, and abrasive pads on the polished exterior.

**Warranty**

> Every VolcanicCore™ piece carries a lifetime warranty for household use. It covers defects in materials and workmanship — including delamination, warping under normal use and handle failure. It doesn't cover cosmetic wear and patina, damage from misuse or accidents, or commercial use.
>
> To make a claim, contact us with your order number and a photo; we'll repair or replace the piece. This commercial warranty is offered by VOLKARA in addition to your statutory rights, which remain unaffected. Full terms: `/pages/warranty`. **[verify: guarantor name and address must appear in the full terms]**

**Sticky ATC bar**

| Element | Copy |
|---|---|
| Button | `Add to bag` |
| Variant label | `Size: {{ value }}` |

### 02 · `vk-stories` (product variant)

| Field | Copy |
|---|---|
| Eyebrow | `REAL KITCHENS` |
| Heading | `Real cooks. Real <em>results</em>.` |
| Subheading | Real kitchens, real results — the Forge Pan in daily use. |
| Cards | Same four as homepage §13. |

### 03 · `vk-usp-bar`

Same five items as Collection §02.

### 04 · `vk-problem`

Same as homepage §05. On product pages set the subheading to: `Why most pans don't last — and why this one does.`

### 05 · `vk-solution`

Same as homepage §06; CTA label `Choose your size` → `#buy`.

### 06 · `vk-technology` (compact variant)

| Field | Copy |
|---|---|
| Index · Eyebrow | `04` · `VOLCANICCORE™ TECHNOLOGY` |
| Heading | `Engineered like a <em>volcano</em>.` |
| Intro (compact) | Five forged layers, each with one job, bonded into a single 3.0 mm body. |
| Layers & stats | Same as homepage §07. |

### 07 · `vk-comparison`

Same as homepage §11.

### 08 · `vk-reviews-wall` (masonry + `@app`)

| Field | Copy |
|---|---|
| Eyebrow | `REVIEWS` |
| Heading | `Real kitchens, <em>unfiltered</em>.` |
| Subheading | Photos and words from verified owners. We publish every review that meets our guidelines — four-star ones included. **[verify: must match the actual moderation policy]** |
| Write button | `Write a review` |
| Filter labels | `All` · `With photos` · `5 stars` · `4 stars` |
| Load more | `Show more reviews` |
| Empty state | `No reviews yet for this piece.` — Cook with it and tell us how it went. |
| Review-policy note (required, small print) | How reviews work: reviews come from customers with a confirmed order, collected after delivery. We never pay for, edit or selectively hide reviews. **[verify against the reviews app settings]** |

Sample content: reuse homepage §12 under the same replacement rule.

### 09 · `vk-faq` (product variant)

| Field | Copy |
|---|---|
| Eyebrow | `FAQ` |
| Heading | `Questions, <em>answered</em>.` |
| Subheading | Everything about the Forge Pan, before your first sear. |
| Questions | Homepage FAQ items 1, 2, 3, 4, 5, 7, 8, 9 (in that order). |

### 10 · `vk-cta`

| Field | Copy |
|---|---|
| Eyebrow | `YOUR LAST PAN` |
| Heading | `The last pan you'll ever <em>buy</em>.` |
| Subheading | Choose your size. Cook with it for 60 days. Keep it for life. |
| CTA | `Choose your size` → `#buy` |
| Promise chips | `Lifetime warranty` · `60-day home trial` · `Free shipping over €75` |

### 11 · `vk-product-recommendations`

| Field | Copy |
|---|---|
| Eyebrow | `COMPLETE THE SET` |
| Heading | `Made to work <em>together</em>.` |
| Subheading | Pieces that share the same construction — and the same lifetime warranty. |

---

## 5. Cart — `cart`

### `vk-main-cart`

| Element | Copy |
|---|---|
| Eyebrow | `YOUR BAG` |
| Heading | `Almost <em>yours</em>.` |
| Empty heading | `Your bag is empty.` |
| Empty text | Every great kitchen starts with one pan. |
| Empty CTAs | `Shop the Forge Pan` → `/products/forge-pan` · `Browse all cookware` → `/collections/all` |
| Table heads | `Product` · `Quantity` · `Total` |
| Remove | `Remove` |
| Free-shipping lines | Same as cart drawer §1.4 |
| Note label | `Add a note or gift message` |
| Summary | `Subtotal` · `Taxes included. Shipping calculated at checkout.` |
| Checkout | `Checkout — {{ total }}` |
| Trust line | `Lifetime warranty · 60-day home trial · Secure checkout` |

### `vk-product-recommendations`

| Field | Copy |
|---|---|
| Eyebrow | `PAIRS WITH YOUR BAG` |
| Heading | `Finish the <em>set</em>.` |
| Subheading | Lids, tools and boards made to work with VolcanicCore™. |

---

## 6. Search — `search`

| Element | Copy |
|---|---|
| Eyebrow | `SEARCH` |
| Heading | `Find your <em>instrument</em>.` |
| Placeholder | `Search pans, woks, knives…` |
| Results count | `{{ count }} results for “{{ terms }}”` |
| No results heading | `Nothing for “{{ terms }}”.` |
| No results text | Try `pan`, `wok` or `set` — or browse the full collection. |
| Popular searches | Forge Pan · Wok · Sets · Knives · Glass lid |
| Predictive search groups | `Products` · `Collections` · `Pages` · `Search for “{{ terms }}”` |

---

## 7. 404 — `404`

| Element | Copy |
|---|---|
| Eyebrow | `ERROR 404` |
| Heading | `This page went up in <em>smoke</em>.` |
| Text | The link may be old or the page may have moved. The fire is still burning everywhere else. |
| Primary CTA | `Shop the collection` → `/collections/all` |
| Secondary CTA | `Back to home` → `/` |
| Search prompt | `Or search the shop` |

---

## 8. About — `page.about`

### 01 · `vk-hero` (story variant)

| Field | Copy |
|---|---|
| Eyebrow | `OUR STORY` |
| Heading (H1) | `A pan should outlive its <em>recipes</em>.` |
| Subheading | VOLKARA began with a question every serious cook eventually asks: why does good cookware wear out? The answer took fire, five layers of metal and a refusal to compromise. |
| Primary CTA | `Shop the collection` → `/collections/all` |
| Secondary CTA | `Discover VolcanicCore™` → `/pages/technology` |
| Visual | `vk-visual-forge.webp` |

### 02 · `vk-manifesto`

| Field | Copy |
|---|---|
| Eyebrow | `WHAT WE BELIEVE` |
| Statement | `Coatings fail. Trends fade. Fire, metal and good technique are <em>forever</em>.` |
| Supporting line | We design for the long horizon: fewer pieces, better made, kept for decades. Every decision — material, thickness, handle, warranty — answers one question: will this still be on your hob in thirty years? |

| Counter | Number | Suffix | Label |
|---|---|---|---|
| 1 | `5` | — | forged layers in every pan and pot |
| 2 | `1` | — | construction across the whole collection |
| 3 | `13` | — | pieces, and not one more than a kitchen needs |
| 4 | `0` | — | coatings, PFAS or PTFE |

### 03 · `vk-image-text` #1 — Craft & engineering (image left)

| Field | Copy |
|---|---|
| Index · Eyebrow | `01` · `CRAFT & ENGINEERING` |
| Heading | `Precision you can <em>hold</em>.` |
| Body | Each pan begins as layers of metal — titanium, a triple aluminium core and two grades of stainless steel — forged under pressure into a single body. The LavaCell™ surface is laser-etched hexagon by hexagon, so every peak sits at the same height and every valley holds the same film of oil. The handle is forged, the rim flared for a clean pour, and every piece is checked for flatness before it is packed. **[verify each process step with the manufacturer]** |
| CTA | `Explore VolcanicCore™` → `/pages/technology` |
| Visual | `vk-visual-macro.webp` |

### 04 · `vk-image-text` #2 — Fire & intent (image right)

| Field | Copy |
|---|---|
| Index · Eyebrow | `02` · `FIRE & INTENT` |
| Heading | `Built by cooks, for the <em>long</em> run.` |
| Body | VOLKARA was founded by home cooks and product engineers who had replaced one coated pan too many. We wanted the sear of a professional kitchen, the ease of a modern hob and the permanence of an heirloom — in one piece, without a coating standing between the food and the metal. So we set ourselves three rules. Make fewer things, and make them properly. Say only what we can prove. And stand behind every piece for as long as it's cooking. |
| CTA | `Read our warranty` → `/pages/warranty` |
| Visual | `vk-visual-chef.webp` |

### 05 · `vk-technology`

| Field | Copy |
|---|---|
| Index · Eyebrow | `03` · `VOLCANICCORE™ TECHNOLOGY` |
| Heading | `Engineered like a <em>volcano</em>.` |
| Intro, layers, stats | Same as homepage §07. |

### 06 · `vk-cta`

| Field | Copy |
|---|---|
| Eyebrow | `BEGIN` |
| Heading | `Cook with it for 60 days. Keep it for <em>life</em>.` |
| Subheading | Start with the Forge Pan, or build your kitchen as a set. |
| CTA | `Choose your pan` → `/collections/pans` |
| Promise chips | `Lifetime warranty` · `60-day home trial` · `Free shipping over €75` |

---

## 8b. Technology — `page.technology` (page handle `technology`)

Suggested fragment keys: `01-hero`, `02-technology`, `03-benefits`, `04-comparison`, `05-faq`, `06-cta`.

### 01 · `vk-hero` (VolcanicCore™ variant, scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `VOLCANICCORE™ TECHNOLOGY` |
| Heading (H1) | `Five layers. One <em>body</em>.` |
| Subheading | VolcanicCore™ is how we build every VOLKARA pan and pot: a titanium surface with nothing to wear away, a triple aluminium core that heats edge to edge, and stainless steel that keeps it all rigid, flat and induction-ready. |
| Primary CTA | `Shop the Forge Pan` → `/products/forge-pan` |
| Secondary CTA | `Explore all cookware` → `/collections/all` |
| Trust micro-row | `5-ply · 3.0 mm` · `Oven-safe to 260°C` · `PFAS- & PTFE-free` · `Lifetime warranty` |
| Image alt | Extreme macro of the LavaCell™ titanium surface, oil glinting in the hexagonal valleys |
| Visual | `vk-visual-macro.webp` |

### 02 · `vk-technology` (cinematic variant, scheme-1)

| Field | Copy |
|---|---|
| Index · Eyebrow | `01` · `THE LAYERS` |
| Heading | `Engineered like a <em>volcano</em>.` |
| Intro | Scroll through the stack. Each layer has a single job, and together they behave like one piece of metal: fast to heat, slow to cool, impossible to peel apart. |
| Layers & stats | Same as homepage §07. |
| Closing line | The result is a pan you can preheat in two minutes, sear on at full flame, finish in the oven and wash in the dishwasher — for decades. |

### 03 · `vk-benefits` (scheme-5 Porcelain)

| Field | Copy |
|---|---|
| Index · Eyebrow | `02` · `WHAT YOU'LL FEEL` |
| Heading | `Performance you can <em>feel</em>.` |
| Subheading | Engineering only matters at the hob. Here's where you'll notice it. |
| Tiles | Same six tiles as homepage §10. |

### 04 · `vk-comparison` (scheme-1)

| Field | Copy |
|---|---|
| Index · Eyebrow | `03` · `THE COMPARISON` |
| Heading | `Not all pans are <em>created equal</em>.` |
| Rows, note | Same as homepage §11. |

### 05 · `vk-faq` (technology questions, scheme-2)

| Field | Copy |
|---|---|
| Index · Eyebrow | `04` · `TECHNICAL FAQ` |
| Heading | `The science, <em>simply</em>.` |
| Subheading | For the cooks who want to know exactly what they're cooking on. |

| # | Question | Answer |
|---|---|---|
| 1 | Is the cooking surface really titanium, or a titanium coating? | Titanium. The LavaCell™ surface is a solid titanium layer bonded into the pan's body — not a spray, a paint or a "titanium-reinforced" non-stick coating. There is nothing applied on top of it. **[verify with manufacturer spec]** |
| 2 | What does "5-ply" mean? | Five metal layers bonded into one body: titanium at the surface, then a titanium shield, a triple aluminium thermal core, an 18/10 stainless steel structure and an 18/0 magnetic stainless base. Each does one job; together they behave as a single sheet of metal. |
| 3 | How does a surface release food without a coating? | The hexagonal relief holds a micro-film of oil in its valleys, while the raised peaks reduce the area food can grip. Combined with a properly preheated pan, proteins form a crust and release on their own — the same principle chefs use on polished steel, made easier. |
| 4 | Why aluminium in the middle? | Aluminium conducts heat more than ten times better than stainless steel. Three layers of it pull heat from the burner out to the rim quickly and evenly, so the whole base cooks — not just the centre. |
| 5 | Can the layers separate over time? | They're forged and bonded under pressure, not glued, and built to stay as one. Delamination under household use is covered by the lifetime warranty. |
| 6 | Why is the pan safe at 260°C when coated pans aren't? | There is no polymer to soften or break down. Titanium and stainless steel are stable far beyond any oven temperature; 260°C is the limit we rate for the handle and the whole assembly. **[verify]** |

### 06 · `vk-cta` (scheme-1)

| Field | Copy |
|---|---|
| Eyebrow | `FEEL THE DIFFERENCE` |
| Heading | `Hear the first <em>sizzle</em>.` |
| Subheading | Every VOLKARA pan and pot is built on VolcanicCore™. Choose yours and cook with it for 60 days. |
| CTA | `Choose your pan` → `/collections/pans` |
| Promise chips | `Lifetime warranty` · `60-day home trial` · `Free shipping over €75` |

---

## 9. Contact — `page.contact`

### 01 · `vk-main-page`

| Field | Copy |
|---|---|
| Eyebrow | `SUPPORT` |
| Heading | `We're here to <em>help</em>.` |
| Intro (page content) | Questions about sizes, care or an order? Write to us — a real person replies within one working day, Monday to Friday. For an existing order, include your order number (it starts with #) and we'll be quicker still. **[verify SLA]** |
| Contact rows | Email `support@volkara.com` **[verify]** · Hours `Mon–Fri, 09:00–17:00 CET` **[verify]** · Address: registered business address **[verify]** |

### 02 · `vk-contact-form`

| Element | Copy |
|---|---|
| Heading | `Send us a <em>message</em>.` |
| Name | `Name` |
| Email | `Email` |
| Order number | `Order number (optional)` — placeholder `#1001` |
| Topic | `Topic` — Product advice · An existing order · Returns & home trial · Warranty claim · Press & partnerships · Something else |
| Message | `Message` — placeholder `Tell us how we can help.` |
| Privacy line | We use your details only to answer this message. See our Privacy Policy. |
| Button | `Send message` |
| Success | `Thank you. Your message is with us — expect a reply within one working day.` |
| Error | `Something went wrong. Please check the highlighted fields and try again.` |

### 03 · `vk-faq` (support variant)

| Field | Copy |
|---|---|
| Eyebrow | `SUPPORT FAQ` |
| Heading | `Support, <em>answered</em>.` |
| Subheading | The fastest answers to the questions we hear after you order. |

| # | Question | Answer |
|---|---|---|
| 1 | Where is my order? | You'll receive a tracking link by email as soon as your order is dispatched. You can also see its status in your account. If it hasn't moved for three working days, contact us and we'll chase it. |
| 2 | Can I change or cancel my order? | If it hasn't been dispatched yet, yes — contact us as soon as possible with your order number. Once it's on its way, you can use the home trial or your right of withdrawal instead. |
| 3 | How do I start a return or the home trial? | Contact us with your order number within 60 days of delivery. We'll send return instructions; once the piece is back with us, we refund the purchase price to your original payment method. **[verify]** |
| 4 | How do I withdraw from my purchase? | Use `Withdraw from a contract` in the footer, or tell us by email within 14 days of delivery. We'll confirm receipt straight away. Your statutory right of withdrawal applies alongside our 60-day home trial. |
| 5 | How do I make a warranty claim? | Send your order number and a photo of the issue. If it's covered, we'll repair or replace the piece. You never pay to use the warranty you were promised. **[verify]** |
| 6 | Which countries do you ship to? | We ship to the countries shown at checkout. Shipping is free over €75 to every listed destination. **[verify markets]** |

---

## 10. Warranty page — page handle `warranty` (default `page` template)

Body content to paste into Shopify admin → Pages → *Warranty & home trial*.

> **Title:** Warranty & home trial
>
> **Our lifetime warranty.** Every VolcanicCore™ piece — pans, woks, pots and lids — is guaranteed for its lifetime in household use against defects in materials and workmanship, including delamination of the layers, warping under normal use and handle failure. Knives, boards and utensils carry the same promise against manufacturing defects. **[verify scope per category]**
>
> **What isn't covered.** Normal cosmetic wear and patina, heat tint, damage from misuse, accidents or overheating an empty pan for extended periods, and use in commercial kitchens.
>
> **How to claim.** Email us your order number, a short description and a photo. We'll reply within one working day and, if the piece is covered, repair or replace it at no cost to you, including shipping. **[verify]**
>
> **Who gives this warranty.** VOLKARA, [legal entity name and registered address] **[verify — legally required]**.
>
> **Your statutory rights.** This commercial warranty is in addition to your statutory rights as a consumer, including the legal guarantee of conformity, which are free of charge and remain unaffected.
>
> **60-day home trial.** Cook with any VOLKARA piece for up to 60 days from delivery. If it isn't the best you own, contact us, return it clean and complete, and we'll refund the purchase price. **[verify return-shipping terms]**
>
> <a id="care"></a>**Care guide.** Use the Care text from the product page (§4, Care accordion).

---

## 11. Product copy appendix (for CSV import and `custom.subtitle` / `custom.badge` metafields)

| Handle | Subtitle (`custom.subtitle`) | Badge (`custom.badge`) | Short description |
|---|---|---|---|
| `forge-pan` | Five layers. One perfect sear. | Bestseller | The pan most VOLKARA kitchens start with: LavaCell™ titanium surface, triple aluminium core, forged to stay flat for life. |
| `forge-wok` | Fierce heat, fully controlled. | — | A deep VolcanicCore™ wok with a flat induction base and helper handle, built for high-heat tossing and searing. |
| `saute-pan` | Deep sides. Endless dinners. | New | High walls, a close-fitting glass lid and VolcanicCore™ heat for braises, sauces and one-pan suppers. |
| `saucepan` | Sauces that never catch. | — | Even heat across the base and a flared pour rim — for sauces, grains and custards that behave. |
| `stockpot` | Slow heat, patiently held. | — | A 24 cm VolcanicCore™ stockpot for stocks, soups and long braises, with heat that rises evenly from the base. |
| `the-trio` | 20, 24 and 28 cm. Every job covered. | Save €38 | Three Forge Pans for €379 — €38 less than buying them separately. |
| `chefs-collection` | Seven pieces. A complete kitchen. | Most complete | Seven VOLKARA pieces curated for daily cooking. €899 — €135 less than the same pieces bought separately. **[verify: list the exact contents; their single prices must add up to the €1,034 compare-at]** |
| `signature-kitchen` | Twelve pieces. Nothing left to want. | Limited | The full VOLKARA kitchen in twelve pieces. €1,499 — €243 less than buying each piece separately (contents must add up to the €1,742 compare-at). Badge `Limited` only if the edition is genuinely numbered or capped **[verify]**; otherwise use `Complete`. |
| `damascus-chef-knife` | An edge worth keeping. | — | A 21 cm Damascus chef's knife with a balanced handle and the lava-red collar. **[verify steel and hardness]** |
| `santoku-knife` | Precision, in every cut. | — | An 18 cm Damascus santoku for slicing, dicing and mincing with control. **[verify steel and hardness]** |
| `titanium-board` | A surface that respects your edge. | — | A titanium-faced cutting board that wipes clean in seconds. **[verify: titanium boards are hard on knife edges — confirm construction before claiming edge-friendliness; otherwise use the subtitle `Hygienic. Effortless. Built to last.`]** |
| `utensil-set` | Five tools. Zero compromise. | — | A five-piece stainless set — spatula, slotted turner, ladle, skimmer and serving spoon — sized for VOLKARA cookware. **[verify contents]** |
| `glass-lid` | Watch, don't lift. | — | Tempered glass with a stainless rim and steam vent, in 20, 24 and 28 cm. Oven-safe to 180°C. **[verify]** |

## 12. SEO defaults

| Page | Title tag | Meta description |
|---|---|---|
| Home | `VOLKARA — Forged Titanium Cookware with VolcanicCore™` | PFAS- and PTFE-free forged titanium cookware built on five-ply VolcanicCore™. Lifetime warranty, 60-day home trial, free shipping over €75. |
| Collection (template) | `{{ collection.title }} — VOLKARA Titanium Cookware` | Collection description, first 155 characters. |
| Product (template) | `{{ product.title }} — VolcanicCore™ Titanium · VOLKARA` | Short description from the appendix, plus "Lifetime warranty. 60-day home trial." |
| About | `Our Story — VOLKARA` | Why we forge cookware without coatings — and stand behind every piece for life. |
| Contact | `Support & Contact — VOLKARA` | Questions about sizes, care or an order? A real person replies within one working day. |
