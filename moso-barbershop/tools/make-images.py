# Snijdt foto's en logo uit de Instagram-screenshots in bron/ en schrijft webp naar assets/img/.
# Gebruik: npm run images  (vereist Python + Pillow)
#
# Screenshots zijn 1206×2622 px; coördinaten hieronder zijn "schermpunten" van een
# 920 px brede weergave en worden met S geschaald.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (307, 612), (615, 920)]
GRID = {
    'g3': ('07-grid-3.jpg', {1: (586, 992), 2: (995, 1400), 3: (1403, 1808)}),
    'g2': ('08-grid-2.jpg', {1: (523, 928), 2: (932, 1338)}),
    'pr': ('09-profiel.jpg', {0: (1313, 1720)}),
}

def tile(key, row, col):
    name, rows = GRID[key]
    im = Image.open(SRC / name).convert('RGB')
    (x0, x1), (y0, y1) = COLS[col], rows[row]
    return im.crop((round(x0 * S) + 3, round(y0 * S) + 3, round(x1 * S) - 3, round(y1 * S) - 3))

def region(name, box):
    return Image.open(SRC / name).convert('RGB').crop(tuple(round(v * S) for v in box))

def trim(im, top=0, right=0, bottom=0, left=0):
    """Snijdt fracties van de randen weg (tekst-overlays en afspeeliconen van video-tegels)."""
    w, h = im.size
    return im.crop((round(w * left), round(h * top), w - round(w * right), h - round(h * bottom)))

def fill(im, box):
    """Vult een gebied (een muzieksticker) per rij met een verloop tussen de pixels links en rechts ervan."""
    x0, y0, x1, y1 = (round(v * S) for v in box)
    px = im.load()
    avg = lambda xs, y: [sum(px[x, y][i] for x in xs) / len(xs) for i in range(3)]
    for y in range(y0, y1):
        a, b = avg(range(x0 - 8, x0 - 2), y), avg(range(x1 + 2, x1 + 8), y)
        for x in range(x0, x1):
            t = (x - x0) / (x1 - x0)
            px[x, y] = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
    blur = im.crop((x0 - 6, y0 - 6, x1 + 6, y1 + 6)).filter(ImageFilter.GaussianBlur(3))
    im.paste(blur, (x0 - 6, y0 - 6))
    return im

def save(im, name, q=84, max_w=None):
    if max_w and im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=35, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

# ── de zaak (stories, volle resolutie) ──────────────────────────────────────
stoel = Image.open(SRC / '01-story-stoel.jpg').convert('RGB')
fill(stoel, (618, 1388, 752, 1548))                                     # muzieksticker op de ladekast
save(stoel.crop(tuple(round(v * S) for v in (0, 262, 920, 1770))), 'zaak-stoel', max_w=1100)
save(region('02-story-interieur.jpg', (0, 262, 920, 1478)), 'zaak-interieur', max_w=1100)
save(trim(tile('pr', 0, 0), top=.17), 'zaak-pui')

# ── cuts (rastertegels, tekst en iconen weggesneden) ────────────────────────
save(tile('g3', 3, 0), 'cut-crop-fade')
save(trim(tile('g3', 1, 1), top=.16), 'cut-zijscheiding')
save(trim(tile('g3', 1, 2), top=.16), 'cut-slickback-baard')
save(trim(tile('g3', 1, 0), top=.16), 'barbier-aan-het-werk')
save(trim(tile('g3', 2, 1), top=.14, bottom=.18), 'cut-taper-fringe')
save(trim(tile('g2', 2, 2), top=.15), 'cut-krullen-fade')
save(trim(tile('g2', 1, 0), top=.14), 'cut-fade-baard')
save(trim(tile('pr', 0, 2), top=.2), 'cut-volle-baard')

# ── logo: ronde badge uit de profielfoto ────────────────────────────────────
im = Image.open(SRC / '09-profiel.jpg').convert('RGB')
cx, cy, r = 135 * S, 388 * S, 96 * S
disc = im.crop(tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r))).resize((512, 512), Image.LANCZOS)
mask = Image.new('L', (2048, 2048), 0)
ImageDraw.Draw(mask).ellipse((8, 8, 2040, 2040), fill=255)
logo = disc.convert('RGBA'); logo.putalpha(mask.resize((512, 512), Image.LANCZOS))
logo.save(OUT / 'logo.png', optimize=True)
logo.resize((256, 256), Image.LANCZOS).save(OUT / 'logo-256.webp', quality=88)
print('logo.png 512×512')

touch = Image.new('RGB', (180, 180), '#0b0b0c')
l = logo.resize((164, 164), Image.LANCZOS); touch.paste(l, (8, 8), l)
touch.save(OUT / 'apple-touch-icon.png')

og = Image.new('RGB', (1200, 630), '#0b0b0c')
og.paste(ImageOps.fit(Image.open(OUT / 'zaak-stoel.webp').convert('RGB'), (600, 630), Image.LANCZOS, centering=(.5, .4)), (600, 0))
l = logo.resize((380, 380), Image.LANCZOS); og.paste(l, (110, 125), l)
og.save(OUT / 'og-image.jpg', quality=86)
print('apple-touch-icon.png, og-image.jpg')
