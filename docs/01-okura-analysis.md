# Phase 1 — Okura Cookware: Reference Analysis

> **Subject:** okuracookware.nl (Dutch storefront, Shopify) · **Captured:** 12 October 2026, desktop 1400 px, full-page · **Pages:** homepage, collection "Magazijnuitverkoop" (warehouse sale), product "Gehamerde Titanium Pan"
> **Purpose:** understand precisely what makes Okura convert, so VOLKARA can keep the machine and replace the parts that are cheap, risky or tired.

---

## 0. Verdict in five lines

1. **The journey is right.** Okura runs the classic DTC long-form sequence: Hero → Problem → Solution → Social proof → Comparison → FAQ → Purchase. It works because it answers objections in the order a sceptical buyer raises them.
2. **The look is 80% there.** Near-black surfaces, copper accents, a high-contrast serif with one italic accent word, product shot on pure black with warm rim light. It reads "premium" at a glance.
3. **The trust is borrowed, not earned.** American TV-show logos, a 70% "one-time" warehouse sale with a running countdown, €280 reference prices, "15,500+ reviews" next to a wall that shows 323, and identical testimonials under different names.
4. **The story is missing.** No construction diagram, no maker, no proof. "Pure titanium, forged with centuries-old Japanese techniques" is asserted, never shown — and hedged elsewhere as "in the spirit of Japanese craftsmanship".
5. **The experience is a desktop page shrunk down.** The same modules repeat across pages, every section is the same dark grey, and the product page leaves a half-screen void under the gallery.

**VOLKARA's brief therefore writes itself:** keep the sequence and the dark-luxury frame; replace borrowed trust with provable trust; replace assertion with engineering storytelling; replace sameness with rhythm and motion.

---

## 1. Information architecture & navigation

### 1.1 Header (all pages)

| Zone | Contents | Observation |
|---|---|---|
| Shell | Floating rounded bar (≈12 px radius, 1 px hairline border) inset from the viewport edge, on `#1A1917` | Feels premium and modern; the inset frame is worth keeping. |
| Left | Homepage · Shop ▾ · Over Ons · FAQ · Contact · Track & Trace | Six items, one dropdown. "Homepage" duplicates the logo; "Track & Trace" is a post-purchase utility sitting in the acquisition nav. |
| Centre | Logo: circular hiragana お mark + serif "OKURA" wordmark + small-caps "COOKWARE" | Centred logo gives symmetry; the Japanese mark carries the "Japanese craft" positioning on its own. |
| Right | Currency selector (EUR €) · Search · Cart with copper count bubble | Clean. Currency selector is noise for a single-currency NL store. |

### 1.2 Site tree (observed)

```
Home
├── Shop ▾ ──── Pannen · Messen · Snijplanken · Accessoires · Bundels
│               └── Collection: "Magazijnuitverkoop" (38 items: pans, woks, sets, knives, boards)
│                   └── Product: e.g. Gehamerde Titanium Pan
├── Over Ons
├── FAQ
├── Contact
└── Track & Trace
Footer: Shop menu (duplicates header) · "Belangrijke links" (Terms, Shipping, Returns, Cookies, Privacy, About, Contact, FAQ)
```

### 1.3 Footer

Logo, three-line blurb ("Hand-hammered titanium cookware. No chemicals. No coatings. Made for life."), contact rows with icon tiles (customer-service email, registered company address in Arnhem, opening hours Mon–Fri 09:00–17:00), Shop and Legal menus, a second newsletter form ("Join 150,000+ home cooks"), copyright, an empty locale dropdown, payment badges.

**Strength:** full business identity (legal entity, address, hours) is visible — real transparency.
**Weakness:** two newsletter forms on every page (section + footer), menus duplicate the header.

---

## 2. Page-by-page section inventory

### 2.1 Homepage

| # | Section | What's on screen | Job in the funnel | Lever |
|---|---|---|---|---|
| 1 | Header | Floating bar, centred logo | Orientation | Brand recognition |
| 2 | Hero | Full-bleed monochrome macro of the hammered pan interior; copper eyebrow "HANDGEHAMERD TITANIUM KOOKGEREI" with leading hairline; three-line serif H1 "De Enige Pan Die Je *Ooit* Nodig Hebt" (copper italic accent); two-line sub; CTAs "SHOP DE SALE →" (filled copper, 4 px radius) + "ONS VERHAAL" (outline); scroll arrow | Promise + first click | Big promise ("the only pan you'll ever need"), sale-led CTA |
| 3 | "As seen on" logo strip | Chopped, Next Level Chef, Hell's Kitchen, Top Chef, Iron Chef, MasterChef — on `#282828` | Borrowed authority | Authority (unverified) |
| 4 | Shop by category | Eyebrow "DE COLLECTIE", serif H2 "Shop per Categorie", sub; 5 cards (Pans, Knives, Boards, Accessories, Bundles) with photo, serif title, subtitle, "SHOP NU →"; circular prev/next | Self-segmentation | Choice architecture |
| 5 | The Problem | "HET PROBLEEM" · "Waarom je huidige pan niet voldoet"; 3 photo cards: Short lifespan · Scratches easily · Uneven heat | Agitate pain | Loss aversion, fear |
| 6 | The Okura Difference | "HET OKURA VERSCHIL" · "Eén pan. Voor altijd."; left: 4-item check accordion (No PFAS/no coatings · Solid titanium surface · Heat-resistant to 540°C · Even heat); right: cut-out pan with hotspot dots and one copper label pill | Present the solution | Contrast with problem |
| 7 | Reviews slider | "REVIEWS" · "Dit zeggen onze klanten"; ★ 4.8/5 · 15,500+ reviews; 3 cards (stars, serif title, text, initial avatar, name, variant, "Verified") | Social proof | Bandwagon |
| 8 | Comparison table | "WAAROM OKURA?" · "Niet alle pannen zijn gelijk"; Okura vs "ordinary pans" across 6 grouped rows (Versatility, Maintenance, Taste & purity, Heat response, Dishwasher, Investment); footer "With 25-year warranty" | Rationalise the price | Anchoring vs. a strawman |
| 9 | FAQ | "Veelgestelde Vragen", 8 questions, "Still have questions? Contact us →" | Remove last objections | Risk reduction |
| 10 | Newsletter | Envelope emoji, "NIEUWSBRIEF", "Blijf op de *Hoogte*", input + copper button, 4 check perks, consent line | Capture non-buyers | Reciprocity |
| 11 | EU withdrawal form | White third-party card (3-step withdrawal form, "Powered by Revoq") | Legal compliance | — |
| 12 | Footer | See §1.3 | Utility, trust | Transparency |

### 2.2 Collection ("Magazijnuitverkoop")

| # | Section | What's on screen | Job | Lever |
|---|---|---|---|---|
| 1 | Hero | Pan photo background; serif H1 "Magazijnuitverkoop"; copy: "New stock is on its way! So we're clearing the warehouse with a temporary sell-off and discounts of up to **70%**. This offer is **one-time** and will not return." | Frame the visit as a rare event | Scarcity, urgency, anchoring |
| 2 | USP strip | 5 icon USPs: 100% PFAS-free · Natural non-stick · 25-year warranty · All heat sources · Hammered surface | Reassure while browsing | Risk reversal |
| 3 | Toolbar | "ITEMS: 38" · "SORT BY: UITGELICHT" · Filter (right) | Navigation | — |
| 4 | Product grid | 4 columns, black image cards; badges (🔥 BESTSELLER, ⚠ BIJNA UITVERKOCHT, ✨ NEW, ⚠ LAATSTE 2 STUKS, ULTRA DUURZAAM); title; stars without count; "From €84,95 EUR ~~€280,00 EUR~~ BESPAAR €195" | Compare and choose | Anchoring, scarcity, social proof |
| 5 | Pagination | "Showing 24 of 38" progress bar + "SHOW MORE" | Continued browsing | Progress / completion |
| 6 | Footer | Same as home | — | — |

### 2.3 Product ("Gehamerde Titanium Pan")

| # | Section | What's on screen | Job | Lever |
|---|---|---|---|---|
| 1 | Gallery (left, ≈50%) | Large image on near-black (`#090806`), arrows, "25 Jaar Garantie" chip, 7 thumbnails (packshots → lifestyle) | Desire, inspection | Product as hero |
| 2 | Buy box (right) | Badge pill "★ BEST RATED TITANIUM PAN"; serif H1; italic subtitle "In the spirit of Japanese craftsmanship"; ★ 4.8/5 — 15,500+ reviews; **€84,95** ~~€280,00~~ "Save €195,05" | Value framing | Authority, anchoring |
| 3 | USP tiles (2×2) | 100% PFAS-free · 25-year warranty · Dishwasher-safe · All heat sources | Objection pre-emption | Risk reversal |
| 4 | Bundle tiers | "WAREHOUSE SALE DEAL": Single €84,95 (size dropdown) · Set +5% €166,16 (~~€579,95~~) · Complete set +10% €242,87 (~~€896,90~~) | Raise AOV | Bundling, anchoring |
| 5 | Countdown | Red bar "Warehouse sale ends in 21:02:58" | Force the decision | Urgency |
| 6 | ATC | Full-width copper "IN WINKELMAND │ €84,95" | Conversion | Price-in-button clarity |
| 7 | Free gift | "+ Free Titanium eBook included" | Sweeten | Reciprocity, value-add |
| 8 | Trust row + payments | Free shipping · 30-day returns · 25-year warranty; Wero, Bancontact, Klarna, Visa, Mastercard, PayPal, Apple Pay, Google Pay | Reduce risk | Familiar payment brands |
| 9 | Accordions | Details · Shipping & returns · Care tips | Detail on demand | — |
| 10 | UGC video row | "ECHTE KOKS, ECHT RESULTAAT": three 9:16 creator videos with burned-in captions — inside the right column | Real-world proof | Social proof |
| 11 | Problem | Same as homepage | Agitate | Loss aversion |
| 12 | Solution | Same as homepage | Resolve | Contrast |
| 13 | "Gezien bij" logos | Same TV logos | Authority | Borrowed |
| 14 | Reviews slider | Same three testimonials as the homepage — **with different names** (see §8) | Proof | Bandwagon |
| 15 | Comparison | Same table | Rationalise | Anchoring |
| 16 | USP strip | Variant: "100% gifvrij" (100% non-toxic) … | Reassure | Fear relief |
| 17 | FAQ | Same 8 questions | Objections | Risk reduction |
| 18 | Final CTA card | "KLAAR VOOR HET ECHTE WERK?" · "Stap over op titanium" · "More than 150,000 home cooks went before you" · 4 chips · "↑ KIES JE PAN" · "Your last pan. Guaranteed." | Close | Bandwagon, risk reversal |
| 19 | Newsletter | Same as homepage | Capture | — |
| 20 | Reviews wall | "323 Recensies", "Schrijf je review", filter; masonry of customer photos (mostly smartphone shots on home hobs) | Deep proof | Authenticity |
| 21 | Footer | — | — | — |
| 22 | Sticky ATC | Thumbnail, title, ★ 4.8/5, variant pill "Enkel", €84,95 ~~€280,00~~ −70%, "TOEVOEGEN" | Keep the CTA in reach | Friction removal |

---

## 3. Customer journey & conversion psychology

### 3.1 The journey

```
Arrive (ad / search) → Hero promise ("the only pan you'll ever need") → borrowed authority (TV logos)
→ choose a category → feel the pain (problem cards) → see the fix (checklist + hotspots)
→ hear the crowd (4.8 / 15,500+) → justify the spend (comparison: "pays for itself in 2 years")
→ remove doubts (FAQ) → PDP: anchor (€280) → bundle up (+5% / +10%) → act now (countdown) → gift (eBook) → buy
```

### 3.2 Psychological levers — how Okura uses each, and how honest it is

| Lever | Okura's execution | Effect | Honesty | VOLKARA position |
|---|---|---|---|---|
| **Anchoring** | €280 reference vs €84,95 (−70%) on cards, PDP, sticky bar; "Save €195" chips everywhere | Massive perceived value | High legal risk (reference price must be the lowest price of the previous 30 days) | Anchor on *value*, not on fictional prices: cost-per-year, comparison table, set savings vs our own real single prices |
| **Scarcity** | "Bijna uitverkocht", "Laatste 2 stuks" badges; "warehouse clearance" | Fear of missing out | Unverifiable; likely static badges | Only inventory-driven low-stock messages (`inventory_quantity` ≤ threshold), never static |
| **Urgency** | Countdown "ends in 21:02:58"; "one-time offer that won't return" | Forces impulse | Evergreen countdowns are blacklisted if false | Countdown renders only with a merchant-set real end date, hides on expiry |
| **Social proof** | "4.8/5 · 15,500+ reviews", "150,000+ home cooks", UGC videos, photo wall | Strong bandwagon | Totals contradict the wall (323); duplicated testimonials | Ratings read from review metafields; no totals without a source; real UGC with consent |
| **Authority** | US TV-show logos ("Gezien bij"), "former chef" testimonial, "Japanese craftsmanship" | Borrowed prestige | No visible evidence of appearances; trademark exposure | Engineering authority (VolcanicCore™ specs, test reports) and merchant-uploaded press logos only |
| **Risk reversal** | 25-year warranty, 30-day returns, free shipping, PFAS-free | Lowers perceived risk | Plausible; terms not surfaced | Lifetime warranty + 60-day *home trial* (used is fine), with full written terms |
| **Bundles / AOV** | Single / Set +5% / Complete set +10%; many set SKUs in the grid | Raises basket | Odd math (€166,16; €242,87) against inflated anchors | Honest bundles: saving = sum of our own single prices − set price, shown to the euro |
| **Sticky ATC** | Bottom bar with price, strike, −70%, variant, CTA | Captures late intent | Fine | Keep — thumb-first, with real price only |
| **Gifts** | "Free Titanium eBook included" | Perceived extra value | Fine if delivered | Optional "Heat Manual" only once it exists |
| **Price in button** | "IN WINKELMAND │ €84,95" | Clarity at the moment of commitment | Good | Keep: `Add to bag — €159` |
| **Payment familiarity** | Wero, Bancontact, Klarna, PayPal, Apple/Google Pay | Local trust, BNPL lowers pain | Good | Keep, rendered from `shop.enabled_payment_types` |

---

## 4. Brand direction

| Dimension | Okura | Read |
|---|---|---|
| Logo & placement | Centred in the header; hiragana お in a circle + classical serif wordmark | Elegant, symmetrical; the Japanese glyph does heavy positioning work |
| Positioning | "Hand-hammered titanium cookware. No chemicals. No coatings. For life." — Japanese heritage, purity, permanence | Clear and desirable, but built on claims it never proves |
| Tone | Direct, benefit-led Dutch; fear-based in the problem section; occasional exclamation marks; sale language ("Shop de sale") right in the hero | Persuasive, but the discount tone undercuts the luxury frame |
| Luxury cues | Dark palette, copper metal accents, serif display type, italic accent word, product on black, rounded floating header | Effective, but generic to the "premium DTC" template |
| Anti-luxury cues | Emoji badges (🔥 ⚠ ✨), "Bespaar €195" chips on every card, yellow stars, a white third-party form in the middle of the dark page, mixed English/Dutch UI | Each one chips at the price premium |

---

## 5. Visual identity

### 5.1 Colour (sampled from screenshots, approximate)

| Role | Hex | Where |
|---|---|---|
| Base background | `#1F1F1F` | Category, solution, newsletter sections |
| Alternate background | `#282828` | Logo strip, problem, reviews, FAQ |
| Deep black | `#0A0907` | Product gallery, hero shadows |
| Footer | `#11110F` | Footer |
| Card surface | `#161616` | Category and product cards |
| Hairline | ≈ `#2E2E2E` | Card and accordion borders |
| Copper (primary accent) | ≈ `#B5865C` (range `#A87850`–`#C49068`) | Eyebrows, CTAs, checks, italic accent word |
| Copper highlight | ≈ `#D9BFA6` | Button gradient top, badge text |
| Warm copper (newsletter button) | ≈ `#C4864A` | Newsletter CTA |
| Primary text | ≈ `#F0EEE8` | Headlines |
| Muted text | ≈ `#9C968F` | Body, subtitles |
| Star yellow | ≈ `#EDA815` | Ratings — off-palette |
| Sale red | ≈ `#C9473A` | Strike prices, countdown |

**Ratio:** roughly 92% dark greys, 5% off-white text, 3% copper. The copper is well rationed; the greys are not differentiated enough to create rhythm.

### 5.2 Typography

| Role | Typeface (observed style) | Treatment |
|---|---|---|
| Display / H1–H3 | High-contrast transitional serif (Playfair Display–style) | Regular weight, tight tracking, one italic copper accent word |
| Body / UI | Neutral grotesk (Inter / Helvetica class) | 14–16 px, muted grey |
| Eyebrows | Same grotesk, uppercase | ≈11 px, letter-spacing ≈0.25 em, copper, preceded by a hairline in the hero |
| Buttons | Uppercase, tracked, bold | 4 px radius |
| Reviews wall | Poppins (app default) | Clashes with the system |

### 5.3 Spacing, shape, hierarchy

- Section padding ≈ 100–120 px desktop; generous, consistent.
- Card radius ≈ 12 px, 1 px hairline, flat (no elevation).
- Almost every section is centred: eyebrow → H2 → grey sub → three-up content. Only the hero and the solution section break the axis.
- Hierarchy is clear but monotonous: the same "eyebrow / serif H2 / grey sub" stamp opens ten sections in a row.

### 5.4 Photography

| Type | Style | Verdict |
|---|---|---|
| Packshots | Pure black, warm copper rim light, glossy reflections, three-quarter angle | Excellent — the strongest asset on the site |
| Category tiles | Cooler, bluish-black backdrops; knife with blue resin handle | Colour temperature inconsistent with packshots |
| Problem cards | Smartphone daylight shots of a burnt steel pan, a scratched non-stick, burnt chicken | Deliberately "ugly truth" — effective, but visually off-system |
| UGC | Vertical creator videos with burned-in captions | Credible; captions in mixed styles |
| Reviews wall | Customer phone photos on home hobs | Highly credible |

### 5.5 Section rhythm

`#1F1F1F → #282828 → #1F1F1F → #282828 …` — two greys alternating for the entire page, no light section, no full-bleed image break after the hero. The eye has nowhere to rest, and nothing signals "this is the important part".

---

## 6. Copy structure

| Element | Pattern | Example (translated) | Assessment |
|---|---|---|---|
| Headlines | Superlative promise; one italic accent | "The only pan you'll *ever* need" | Strong hook; absolute claim |
| Problem copy | Fear + statistic | "Non-stick pans last only 2–3 years. The coating breaks down above high heat, can release harmful substances and flakes apart." | Persuasive; numbers unsourced |
| Product explanation | Material + heritage | "Pure titanium, forged with centuries-old Japanese techniques. No chemicals. No coatings." | Evocative; "no chemicals" is meaningless; heritage unproven |
| Benefits | Checklist titles | "Solid titanium surface", "Resistant to extreme heat (up to 540°C)", "Even heat everywhere" | Clear, but generic and unexplained |
| Technology | One hotspot pill: "Non-stick without coating" | — | No layers, no diagram, no mechanism |
| Objection handling | Comparison rows + FAQ | "Pays for itself in 2 years" vs "Replace every 1–2 years" | Right objections, unsubstantiated answers |
| FAQ | 8 questions: difference vs non-stick, safety, metal utensils, heat sources, dishwasher, warranty, weight, seasoning | — | Good coverage; misses "food sticks" (which the reviews raise) and returns/shipping |
| CTA language | "Shop de sale", "Kies je pan", "Stap over op titanium" | — | "Choose your pan" is excellent; "Shop the sale" cheapens the hero |

---

## 7. Trust elements inventory

| Element | Present | Credibility | Note |
|---|---|---|---|
| Warranty (25 years) | Hero chip, USP strip, comparison footer, PDP | Medium | Terms not linked |
| Returns (30 days) | PDP trust row, CTA chips | Medium | Legal minimum is 14 days; 30 is a modest extension |
| Free shipping | PDP, CTA | High | — |
| PFAS-free | USP strip, tiles | Medium | No test report shown |
| Review score & count | Header of reviews, PDP, sticky bar | **Low** | 15,500+ claimed vs 323 on the wall |
| Verified badges | Review cards | **Low** | Same text, different names across pages |
| Photo reviews | Reviews wall | High | The most credible proof on the site |
| UGC videos | PDP | High | Real creators |
| TV logos | Home, PDP | **Very low** | No evidence; trademarks |
| Company details | Footer | High | Legal entity + address + hours |
| Payment badges | PDP, footer | High | Local methods (Wero, Bancontact, Klarna) |
| EU withdrawal function | Homepage (third-party white form) | High (legally) | Compliant, but visually jarring and oddly placed |

---

## 8. What works (keep it)

1. **The narrative order.** Problem → Solution → Proof → Comparison → FAQ → CTA is the right sequence for a high-consideration €100+ purchase.
2. **One italic accent word per headline.** A small typographic gesture that makes every headline feel authored.
3. **Packshots on black with warm rim light.** Product as jewellery.
4. **Price inside the ATC button** and a **sticky ATC bar** with variant and price.
5. **Bundle tiers as radio cards** directly above the ATC — the AOV ask happens at the moment of intent.
6. **2×2 USP tiles** under the price: objections answered before they're thought.
7. **Real customer photo wall** and **vertical creator videos** — authentic, unpolished proof.
8. **Comparison table grouped by theme** with a single guarantee line as its footer.
9. **Final CTA card** with promise chips and "Choose your pan".
10. **Visible company identity** in the footer.

## 9. Weaknesses & missed opportunities

| # | Weakness | Evidence | Missed opportunity → VOLKARA answer |
|---|---|---|---|
| 1 | Desktop-centric layout | PDP gallery isn't sticky — a half-screen void opens under the thumbnails while the right column scrolls on; UGC sits inside the narrow buy column | Thumb-first PDP: sticky gallery on desktop, swipe gallery on mobile, sticky ATC, bottom-sheet filters |
| 2 | Repetitive dark sections | Two greys alternate for 12 sections; every section centred and three-up | Rhythm: Volcanic / Obsidian / Graphite, **one Porcelain section per page**, full-bleed image breaks, asymmetric layouts |
| 3 | Generic technology story | "Solid titanium surface" + one hotspot pill | A dedicated **VolcanicCore™** chapter: five named layers, spec labels, scroll-driven exploded stack |
| 4 | Weak storytelling | "Ons verhaal" CTA, but no maker, no process, no reason to believe the heritage claim | Manifesto, forge imagery, a founders' intent page — and only claims we can prove |
| 5 | Module repetition | Problem, Solution, Reviews, Comparison, FAQ and Newsletter are identical on home and PDP; two newsletter forms per page; two review modules per PDP | Variants per context (compact technology on PDP, buying-guide FAQ on collections), one newsletter per page |
| 6 | Sale-led hero | "SHOP DE SALE" is the primary CTA of a luxury brand | Lead with the product and the promise; promotions live in the announcement bar, dated |
| 7 | Visual noise | Emoji badges, yellow stars, "SAVE" chips on every card, white widget, floating third-party launchers on both edges in our captures | A single badge per card, ember-only accents, every third-party element restyled or contained |
| 8 | Mixed language & formatting | "From", "Verified", "SORT BY", "SHOW MORE", "Showing 24 of 38" on a Dutch site; "€84,95 EUR" double currency; "12 Inch Pan" on a cm catalogue | One locale per storefront, full translations, `money` format without duplicate currency |
| 9 | Icon semantics | USP strip pairs "25-year warranty" with a truck, "All heat sources" with a padlock, "Hammered" with a leaf | Icons chosen for meaning, documented in the copy deck |
| 10 | Unanswered real objection | Four-star reviews mention food sticking at first ("bakte wel aan"); the FAQ never addresses technique | FAQ #2 and Care copy teach the preheat and the water-droplet test |
| 11 | Catalogue sprawl | 38 SKUs with long, inconsistent names ("Gehamerde…", "Handgehamerde…", "Premium kookset van…") | 13 pieces, one naming system (Forge line), clear set architecture |
| 12 | No accessibility signals | Low-contrast grey sub-copy on `#282828`, small tracked caps, no visible focus states in captures | WCAG 2.2 AA as a build rule (EAA 2025) |

---

## 10. Legal & compliance risks — what VOLKARA must never copy

> Not legal advice. These are the patterns a Dutch/EU regulator (ACM, Consumentenbond complaints, competitors) would most likely challenge. VOLKARA's counsel should review the final claims register in `03-copy-deck.md`.

| # | Observed pattern | Rule at risk | Exposure | VOLKARA mechanism |
|---|---|---|---|---|
| 1 | **US TV-show logos** ("Gezien bij": Chopped, MasterChef, Hell's Kitchen, Top Chef, Iron Chef, Next Level Chef) with no evidence of appearance | UCPD Annex I no. 4 (false claim of approval/endorsement) and Art. 6 (misleading action); trademark infringement (EU Trade Mark Regulation, Benelux) | High: regulatory + trademark owners | Press logos only from merchant-uploaded images, with a link to the coverage |
| 2 | **Evergreen countdown** "Warehouse sale ends in 21:02:58" + "one-time offer that won't return" on a standing collection | UCPD Annex I no. 7 (falsely stating an offer is available only for a very limited time); ACM online-persuasion guidance on fake urgency | High: blacklisted practice — unfair in all circumstances | `vk-countdown` renders only to a merchant-set ISO end date and hides itself on expiry |
| 3 | **Inflated reference prices** (€280 → €84,95, −70%; sets €1.659,95 → €829,95) | Price Indication Directive 98/6/EC art. 6a (Omnibus): the prior price for an announced reduction must be the **lowest price in the previous 30 days**; UCPD Art. 6 | High: ACM enforces actively | Compare-at shown only when set by the merchant; sets compared to the **sum of our own current single prices** and labelled as such |
| 4 | **Unverifiable review totals**: "4.8/5 · 15,500+ reviews" vs 323 on the wall; "150,000+ home cooks" | UCPD Art. 6/7; Art. 7(6) (information on how reviews are verified) | High | Ratings read from `reviews.rating` / `reviews.rating_count` metafields; no community totals without a source |
| 5 | **Identical testimonials under different names**: homepage "Sarah M. / Sarah M. / James K." vs PDP "Anna M. / Sara J. / Jan K." with the same text | UCPD Annex I nos. 23b–23c (claiming reviews are genuine without reasonable checks; submitting or commissioning false reviews) | Very high | Reviews only via a reviews app or verified import; sample content flagged in the deck and removed before launch |
| 6 | **Static scarcity badges** ("Almost sold out", "Last 2 left") | UCPD Art. 6 (misleading on availability) | Medium–high | Low-stock text driven by real inventory only |
| 7 | **Origin implication**: Japanese glyph, "centuries-old Japanese techniques", hedged as "in the spirit of Japanese craftsmanship"; a review asks for the logo to be on the product | UCPD Art. 6(1)(b) (geographical or commercial origin) | Medium | No origin claims beyond verified manufacturing facts; "designed by VOLKARA" until origin is confirmed |
| 8 | **Health/fear claims**: "no chemicals", "100% non-toxic", "coating leaks into your food", "can release harmful substances" | UCPD Art. 6; scientific substantiation | Medium | Specific, testable claims only: "No PFAS, no PTFE, no coating" backed by a lab report |
| 9 | **Unsubstantiated performance & durability claims**: "heat-resistant to 540°C", "pays for itself in 2 years", "non-stick pans last only 2–3 years" | UCPD Art. 6; the Empowering Consumers for the Green Transition Directive (EU) 2024/825 — durability claims about usage time must be demonstrable (applies from 27 September 2026) | Medium–high | Every number in a claims register with evidence; durability framed through the written lifetime warranty |
| 10 | **Mixed-language UI and "€… EUR"** | Price Indication Directive (clear, unambiguous price) | Low | One locale, `money` filter |
| 11 | **EU withdrawal function** (compliant, via third-party form) | Consumer Rights Directive art. 11a as inserted by Directive (EU) 2023/2673 — online withdrawal function, applies from 19 June 2026 | Okura complies — VOLKARA must too | "Withdraw from a contract" link in the footer to a dedicated, on-brand flow (app or page) |

---

## 11. What this means for VOLKARA

| Keep | Evolve | Drop |
|---|---|---|
| The persuasion sequence | Technology into a full VolcanicCore™ chapter | TV logos |
| Dark frame, one accent colour | Copper → **lava→molten ember**, used like Ferrari red | Evergreen countdowns |
| Italic accent word | Serif-only → Inter Tight display + Instrument Serif italic accent + JetBrains Mono specs | Inflated reference prices |
| Packshots on black | Static → reveal, parallax, scrubbed manifesto, ember particles | Review totals without a source |
| Price-in-button ATC, sticky ATC | Bundle tiers with honest, sum-of-parts savings | Emoji badges, yellow stars |
| 2×2 USP tiles, trust row | 25-year warranty → **lifetime**; 30-day returns → **60-day home trial** | "No chemicals", origin implications |
| Photo-review wall, UGC | All-dark → one Porcelain section per page | Duplicate modules and forms |
| Footer transparency | Desktop-first → thumb-first | Sale-led hero |

Continue to `02-volkara-strategy.md`.
