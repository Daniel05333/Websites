# Snijdt de foto's en het logo uit de Instagram-screenshots in bron/ en schrijft
# webp/png-bestanden naar assets/img/. Gebruik: npm run images  (vereist Python + Pillow)
#
# De screenshots zijn 1206×2622 px (iPhone). Coördinaten hieronder zijn in
# "schermpunten" van een 920 px brede weergave en worden met S geschaald.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920

def crop(name, box):
    im = Image.open(SRC / name).convert('RGB')
    return im.crop(tuple(round(v * S) for v in box))

def save(im, name, q=85):
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=35, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

COLS = [(0, 305), (307, 612), (615, 920)]
GRIDS = {
    'g1': ('01-profiel.jpg', [(935, 1340), (1343, 1748)]),
    'g2': ('02-grid-2.jpg', [(358, 757), (760, 1165), (1168, 1575), (1578, 1985)]),
    'g3': ('03-grid-3.jpg', [(586, 990), (993, 1398), (1401, 1808)]),
}
def tile(key, row, col, top=0.0):
    name, rows = GRIDS[key]
    (x0, x1), (y0, y1) = COLS[col], rows[row]
    if col == 2 and key != 'g1':
        x1 = 900  # iOS-scrollbalk rechts in beeld
    return crop(name, (x0 + 3, y0 + 3 + (y1 - y0) * top, x1 - 3, y1 - 3))

# (naam, raster, rij, kolom, bovenrand weg i.v.m. icoontje)
TILES = [
    ('leopard-french-bruin', 'g1', 0, 0, 0), ('olijf-chrome-leopard', 'g1', 0, 1, 0), ('roze-leopard-tips', 'g1', 0, 2, .17),
    ('rood-sterren-leopard', 'g1', 1, 0, 0), ('milky-amandel', 'g1', 1, 1, 0), ('milky-bloem', 'g1', 1, 2, 0),
    ('french-goud', 'g2', 0, 0, 0), ('roze-kort', 'g2', 0, 1, 0), ('shimmer-amandel', 'g2', 0, 2, 0),
    ('bloemen-sterren', 'g2', 1, 0, 0), ('polka-dots', 'g2', 1, 1, 0), ('french-bloem', 'g2', 1, 2, 0),
    ('milky-squoval', 'g2', 2, 0, .17), ('roze-naturel', 'g2', 2, 1, 0), ('nude-kort', 'g2', 2, 2, 0),
    ('milky-kort', 'g2', 3, 0, .17), ('kersenrood', 'g2', 3, 1, 0), ('french-roze', 'g2', 3, 2, .17),
    ('rood-amandel', 'g3', 2, 0, 0), ('shimmer-kort', 'g3', 2, 1, .17), ('nude-naturel', 'g3', 2, 2, 0),
]
for name, g, r, c, top in TILES:
    save(tile(g, r, c, top), name)

# ── logo: donkere letters uit de crème cirkel → transparant masker ────────────
im = Image.open(SRC / '01-profiel.jpg').convert('L')
cx, cy, r = 135 * S, 378 * S, 96 * S
disc = im.crop(tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r)))
big = disc.resize((disc.width * 4, disc.height * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
alpha = big.point(lambda v: 255 if v < 80 else 0 if v > 170 else round(255 * (170 - v) / 90))
mask = Image.new('L', big.size, 0)
ImageDraw.Draw(mask).ellipse((4, 4, big.width - 4, big.height - 4), fill=255)
alpha = Image.composite(alpha, Image.new('L', big.size, 0), mask)
alpha = alpha.crop(alpha.getbbox())
logo = Image.new('LA', alpha.size, 0)
logo.putalpha(alpha)
logo = logo.resize((900, round(900 * alpha.height / alpha.width)), Image.LANCZOS)
logo.save(OUT / 'logo.png', optimize=True)
print('logo.png', logo.size)
