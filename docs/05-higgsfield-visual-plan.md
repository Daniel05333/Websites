# 05 — Higgsfield Visual Plan

## 1. Status

10 visuals were generated in Higgsfield (model **flux_2**, 1k) on 2026-10-12, with job 0 used as the product reference for consistency. They are listed with job IDs and source URLs in `tools/visuals/higgsfield-manifest.json`.

> ⚠️ The Higgsfield CDN (`d8j0ntlcm91z4.cloudfront.net`) is blocked by this build environment's network policy, so the files are **not yet in `assets/`**. The theme works without them: every image slot falls back to designed SVG art (`snippets/vk-placeholder.liquid`).

**To install them:**
1. On any machine with normal internet access and `ffmpeg` installed: `node tools/visuals/fetch-visuals.mjs` (downloads, converts to WebP, writes `assets/vk-visual-*.webp`).
2. Commit and push the assets, or upload them via *Online Store → Themes → Edit code → Assets*.
3. In the theme editor: *Theme settings → Visuals → Use bundled VOLKARA visuals*.

Alternatively, upload any image directly into the section's image picker. Merchant images always take priority.

## 2. Art direction

- **Light:** single warm key light from behind or above, deep blacks, lava-orange rim. No flat studio white.
- **Palette in-frame:** volcanic black, brushed titanium grey, one lava-red accent (the handle collar ring), real flame orange.
- **Materials:** visible LavaCell™ hex texture on the cooking surface, brushed steel body, forged handle with lava-red collar.
- **Composition:** generous negative space (left for hero copy), product at 3/4 angle, low camera for heroism.
- **Never:** coatings that look black and glossy (contradicts "no coating"), cartoon fire, fake brand logos, text in images.

## 3. Shot list

| Asset | Ratio | Slot(s) | Prompt summary |
|---|---|---|---|
| `vk-visual-hero.webp` | 16:9 | Home hero | Forge Pan over a blue-orange gas flame in a dark kitchen, negative space left, embers |
| `vk-visual-pan.webp` | 1:1 | Product card, gallery, "Pans" category | Forge Pan packshot on black, hex titanium surface, lava-red collar, rim light |
| `vk-visual-wok.webp` | 1:1 | "Woks" category | Forge Wok packshot, same lighting system |
| `vk-visual-set.webp` | 1:1 | "Sets" category, set PDPs | The Trio nested set, 3/4 view |
| `vk-visual-knife.webp` | 1:1 | "Knives" category | Damascus chef knife on dark stone, lava-red bolster |
| `vk-visual-macro.webp` | 16:9 | Technology bg, collection hero | Extreme macro of the LavaCell™ hex relief with an oil film catching orange light |
| `vk-visual-chef.webp` | 16:9 | Manifesto, benefits, about | Chef flambé, flame lighting the face, VOLKARA pan in hand |
| `vk-visual-sear.webp` | 4:3 | Spotlight, CTA, gallery lifestyle | Ribeye searing, steam, pan close-up |
| `vk-visual-forge.webp` | 3:4 | About, solution | Forging: hammer strike, sparks, glowing metal |
| `vk-visual-problem-coating.webp` | 4:3 | Problem card "Coatings that flake" | Scratched, flaking non-stick pan, cold light, desaturated |

## 4. Next wave (when credits allow)

| Priority | Asset | Model suggestion | Use |
|---|---|---|---|
| 1 | Gallery set per product (front, 3/4, top-down, handle detail, in-use) | flux_2 / product-shot preset with job 0 as reference | PDP galleries |
| 2 | 6–8s hero loop: flame lapping the pan base, slow push-in | Higgsfield video (Kling / Veo) | `vk-hero` video setting (MP4, < 4 MB) |
| 3 | UGC-style vertical clips: egg slide, sear, metal spatula test | Higgsfield video, 9:16 | `vk-stories` |
| 4 | Problem cards 1 & 3 ("Built to expire", "Heat that lies": thermal-camera look) | flux_2 | `vk-problem` |
| 5 | Exploded 5-layer render | 3-D / image | Technology page, ads |

**Consistency:** always pass the job-0 packshot as the image reference, keep the lighting phrase identical ("single warm rim light from behind, deep black background, lava-orange glow"), and keep the lava-red collar ring visible.

## 5. Specs for upload

- WebP or AVIF, sRGB, ≤ 350 KB for 1600px wide images; hero ≤ 500 KB at 2400px.
- Set focal points in Shopify's media editor so crops behave on mobile.
- Alt text: describe the product and the action ("VOLKARA Forge Pan searing a ribeye over a gas flame").
