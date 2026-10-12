# 06 — Data Model (products, metafields, collections, menus)

Everything is optional: the theme renders sensible defaults when a metafield is empty.

## 1. Metafield definitions

Create under *Settings → Custom data*. Use exactly these namespace/keys.

### Products
| Name | Namespace.key | Type | Used by |
|---|---|---|---|
| Subtitle | `custom.subtitle` | Single line text | PDP italic subtitle, product card |
| Badge | `custom.badge` | Single line text | Card + PDP badge ("Bestseller", "New", "Limited") |
| Specs | `custom.specs` | **JSON** (`[{"label":"…","value":"…"}]`) *or* Multi-line text (`Label: value` per line) | PDP "Specifications" accordion (`snippets/vk-product-specs.liquid`) |
| Care | `custom.care` | Rich text | PDP "Care" accordion (falls back to the block's default text) |
| Rating | `reviews.rating` | Rating (standard definition) | Stars on cards/PDP; written automatically by Judge.me, Okendo, Loox, Yotpo, Shopify Product Reviews |
| Rating count | `reviews.rating_count` | Integer (standard definition) | "(1,284 reviews)" |

> No rating metafield → no stars are shown. We never invent review numbers.

### Collections
| Name | Namespace.key | Type | Used by |
|---|---|---|---|
| Hero heading | `custom.hero_heading` | Single line text (supports `<em>`) | `vk-collection-hero` |
| Eyebrow | `custom.eyebrow` | Single line text | `vk-collection-hero` |
| Subtitle | `custom.subtitle` | Multi-line text | `vk-collection-hero` |

Example `custom.specs` JSON:
```json
[
  {"label": "Construction", "value": "VolcanicCore™ 5-ply, forged and bonded"},
  {"label": "Cooking surface", "value": "LavaCell™ laser-etched titanium"},
  {"label": "Oven / grill", "value": "Up to 260°C"}
]
```

## 2. Products

`data/products-import.csv` is a Shopify product CSV with the 13-product catalog (23 variants, EUR). It includes metafield columns for subtitle, badge and specs. Regenerate it with `npm run products:csv`.

1. Create the metafield definitions above **first** (otherwise the metafield columns are ignored).
2. *Products → Import* → upload the CSV.
3. Products import as **draft** with 0 inventory. Add photos, set stock and verify prices and claims, then set them to Active.

Variant option name: `Size` (cards show size chips; the bundle picker matches lids by size). Single-variant products use `Title`.

## 3. Collections

Create these **automated** collections (condition: *Product tag is equal to …*; the CSV tags each product with its collection handles):

| Handle | Title | Tag |
|---|---|---|
| `pans` | Pans | `pans` |
| `woks` | Woks | `woks` |
| `pots` | Pots | `pots` |
| `sets` | Sets | `sets` |
| `knives` | Knives | `knives` |
| `accessories` | Accessories | `accessories` |
| `bestsellers` | Bestsellers | `bestsellers` |

Filters: *Apps → Search & Discovery → Filters*: add Availability, Price, Size (option), Product type. The theme renders them automatically (`snippets/vk-facets.liquid`).

## 4. Pages

| Page | Handle | Template |
|---|---|---|
| Our story | `about` | `page.about` |
| VolcanicCore™ technology | `technology` | `page.technology` |
| Contact | `contact` | `page.contact` |
| Warranty & home trial | `warranty` | `page` |

## 5. Navigation

- **main-menu**: Shop (with 3 child groups: Cookware, Sets, Knives & tools, each with product links, which renders the mega menu) · Sets · VolcanicCore™ (`/pages/technology`) · Our story · Support.
- **footer-shop**, **footer-help**, **footer-legal**: assign in the footer section blocks.

## 6. Theme settings that hold data

| Setting | Default | Note |
|---|---|---|
| Cart → type | Drawer | Drawer / page |
| Cart → free shipping threshold | €75 | Drives the progress bar. Must match your real shipping rate. |
| Cart → upsell product | — | Shown in the drawer when not already in the cart |
| Brand promises → warranty / trial / shipping / secure | Lifetime / 60-day / €75 / Secure checkout | **Must match your real policies** |
| Visuals → use bundled visuals | off | See `05-higgsfield-visual-plan.md` |

## 7. Bundles

The PDP bundle picker (`snippets/vk-bundle-picker.liquid`) offers tiers configured in the product section's *Bundle* block:
- **Single**: just the variant.
- **Addon tier**: adds a second product (e.g. Tempered Glass Lid). The lid variant is matched by size and posted as `items[]` to `/cart/add.js`.
- **Set tier**: links to a set product (e.g. The Trio).

Any discount on a tier must be a real Shopify automatic discount (e.g. "Buy X get Y" or "Amount off products"). The theme only shows the discount after the cart confirms it.
