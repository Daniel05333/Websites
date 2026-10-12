# 04 — VOLKARA Design System

Implementation lives in `assets/vk-base.css` (tokens, primitives), `assets/vk-motion.css` + `assets/vk-motion.js` (motion engine) and per-section CSS files. The binding token list is in `BUILD_SPEC.md §3`. This document explains **how to use** them.

## 1. Color

| Token | Hex | Role |
|---|---|---|
| Volcanic Black `--vk-black` | `#080808` | Primary canvas |
| Lava Red `--vk-lava` | `#D7261E` | Primary action, start of the ember gradient |
| Molten Orange `--vk-molten` | `#FF4B32` | Accent: eyebrows, checks, focus ring, glows |
| Graphite `--vk-graphite` | `#202020` | Raised surfaces, alternate sections |
| Soft White `--vk-white` | `#F7F5F2` | Text on dark, Porcelain canvas |

**Ember gradient** `--vk-ember` (115°, Lava to Molten) is the signature. Treat it like Ferrari red: primary buttons, the accent word in headings, progress fills, active states. Never on large backgrounds except the Ember color scheme.

### Color schemes (Theme settings → Colors)
`scheme-1 Volcanic` · `scheme-2 Obsidian` · `scheme-3 Graphite` · `scheme-4 Ember` · `scheme-5 Porcelain`. Every section exposes a `color_scheme` setting. Recommended rhythm: alternate scheme-1/scheme-2 and use **one** Porcelain section per page.

Contrast: body text on every scheme passes WCAG AA. Muted text (`--vk-fg-muted`, 72 %) passes AA on all dark schemes. Avoid `--vk-fg-subtle` for anything longer than a label.

## 2. Typography

| Role | Family | Use |
|---|---|---|
| Display / headings | **Inter Tight** 500, tracking −0.035em | All H1–H4, prices |
| Accent word | **Instrument Serif** italic, ember-gradient text | One `<em>` word per heading ("Built for *forever*.") |
| Body | **Inter** 400, 1rem/1.65 | Paragraphs, UI |
| Technical | **JetBrains Mono** 500, uppercase, tracking .16–.22em | Eyebrows, spec labels, counters |

Fonts are self-hosted WOFF2 (`assets/vk-*.woff2`, SIL OFL; licenses in `docs/licenses/`). No Google Fonts request, no layout shift (`font-display: swap` + metric-matched fallbacks).

Scale (fluid `clamp`): display 48→128px · h1 40→84 · h2 34→64 · h3 22→30 · h4 20 · body 16 · small 14 · xs 12.

**Merchant tip:** in any heading field, select one word and press *Italic* in the editor to get the accent word.

## 3. Layout & spacing

- Container 1440px, narrow 960px, fluid gutter 16→48px.
- Section padding: `--vk-space-section` (80→160px), adjustable per section (top/bottom sliders).
- Radii: 10 / 16 / 28 / pill. Cards use 16–28px radius and a 1px inset hairline (`--vk-border`), never drop shadows on dark.
- Grid: CSS grid with `minmax(0, 1fr)` columns to prevent overflow on mobile.

## 4. Components

| Component | File | Notes |
|---|---|---|
| Button | `snippets/vk-button.liquid` | `primary` (ember + glow + shine sweep), `secondary` (glass outline), `ghost`, `link`; optional magnetic hover |
| Heading block | `snippets/vk-heading.liquid` | Eyebrow (`01 — LABEL`) + heading with split-word reveal + lead |
| Badge / chip | `snippets/vk-badge.liquid` | Bestseller, New, Limited, Sale; reads `custom.badge` |
| Rating | `snippets/vk-rating.liquid`, `vk-product-rating.liquid` | Reads `reviews.rating` / `reviews.rating_count` |
| Price | `snippets/vk-price.liquid` | Compare-at + "Save €X" only when compare-at is real |
| Product card | `snippets/vk-product-card.liquid` | Hover image swap, pointer-tracked light, quick add, swatches/size chips |
| Image | `snippets/vk-image.liquid` | Responsive `srcset`; falls back to bundled visuals, then to SVG art (`vk-placeholder`) |
| Drawer | `<vk-drawer>` in `vk-global.js` | Focus trap, Escape, scroll lock; left/right/top/bottom |
| Accordion | native `<details>` + `vk-accordion` styles | Works without JS |
| Slider | `<vk-slider>` + `vk-slider-controls` | Scroll-snap, arrows, progress bar, editor `block:select` |
| Layer stack | `snippets/vk-layer-stack.liquid` | The VolcanicCore™ 3-D exploded diagram (pure CSS) |

## 5. Motion

Engine: `assets/vk-motion.js` (IntersectionObserver + a single rAF loop). Turned off entirely by Theme settings → Animations, and by `prefers-reduced-motion`.

| Attribute | Effect |
|---|---|
| `data-reveal="up|fade|scale|left|right|clip"` | Enter on scroll, eased with `--vk-ease-out` |
| `data-reveal-stagger` | Children reveal in sequence (60–80ms) |
| `data-split` | Headline words rise individually |
| `data-parallax="0.15"` | Depth on scroll (disabled on mobile unless `data-parallax-mobile`) |
| `data-scrub` | Exposes `--vk-progress` (0–1) for scroll-driven CSS (manifesto, layer stack) |
| `data-magnetic` | Buttons follow the pointer slightly |
| `data-glow` / `data-tilt` | Pointer-tracked light / 3-D tilt on cards |
| `data-count-to` | Number counters |
| `<vk-embers>` | Canvas ember particles behind hero/CTA (paused off-screen) |

Durations: 200 / 400 / 800 / 1200ms. Easing: out `cubic-bezier(.16,1,.3,1)`, spring for small UI confirmation only. Page transitions use the View Transitions API where supported.

**Rules:** motion must explain (layers separate = construction), never block reading, never move text the user is trying to read, and always end in a static, readable state.

## 6. Iconography & imagery

- Icons: 1.5px stroke line icons in `snippets/vk-icon.liquid` (inline SVG, `currentColor`).
- Photography: product on pure black with warm rim light, macro metal textures, real fire. See `05-higgsfield-visual-plan.md`.
- Film grain overlay (3.5 % opacity) unifies photography and flat UI; toggle in settings.

## 7. Accessibility checklist

Landmarks and heading order, labelled controls, visible `:focus-visible` (2px Molten ring), 44px+ tap targets, focus trap + Escape in drawers, `aria-live` cart updates, alt text everywhere, reduced-motion respected, all content visible without JS.
