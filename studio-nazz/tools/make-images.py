# Snijdt de foto's en het logo uit de Instagram-screenshots in bron/ en schrijft
# webp/png-bestanden naar assets/img/. Gebruik: npm run images  (vereist Python + Pillow)
#
# De screenshots zijn 1206×2622 px (iPhone). Coördinaten hieronder zijn in
# "schermpunten" van een 920 px brede weergave en worden met S geschaald.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920

def crop(name, box):
    im = Image.open(SRC / name).convert('RGB')
    return im.crop(tuple(round(v * S) for v in box))

def save(im, name, q=84):
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=35, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

COLS = [(0, 305), (307, 612), (615, 920)]
GRIDS = {
    'g1': ('09-grid-1.jpg', [(367, 773), (776, 1182), (1185, 1590), (1593, 2000)]),
    'g2': ('10-grid-2.jpg', [(360, 765), (768, 1173), (1176, 1582), (1585, 2000)]),
    'g3': ('11-grid-3.jpg', [(358, 753), (756, 1162), (1165, 1570), (1573, 2000)]),
}
def tile(key, row, col, top=0.0, bottom=0.0):
    name, rows = GRIDS[key]
    (x0, x1), (y0, y1) = COLS[col], rows[row]
    h = y1 - y0
    return crop(name, (x0 + 2, y0 + 2 + h * top, x1 - 2, y1 - 2 - h * bottom))

# ── portfolio (lashes & brows, met SN-watermerk zoals gepost) ───────────────
save(tile('g1', 0, 2), 'lash-brow-closeup')
save(tile('g2', 0, 2, top=.12), 'lashlift-behandeling')
save(tile('g2', 1, 1, top=.12), 'volume-lashes-1')
save(tile('g2', 1, 2), 'classic-lashes')
save(tile('g2', 2, 1), 'lashes-brows')
save(tile('g2', 3, 1), 'volume-lashes-2')
save(tile('g2', 3, 2), 'volume-lashes-3')
save(tile('g3', 0, 2), 'wispy-lashes')
save(tile('g3', 1, 1), 'russian-volume-grijs')
save(tile('g3', 2, 0), 'wispy-volume')
save(tile('g3', 2, 1), 'volume-spiegel')
save(tile('g3', 3, 0), 'volume-bruin')
save(tile('g2', 2, 2), 'lashlift-voor-na')
save(tile('g2', 1, 0), 'brows-voor-na')
save(crop('12-russian-volume-1.jpg', (0, 280, 920, 1060)), 'russian-volume-groot-1')
save(crop('13-russian-volume-2.jpg', (0, 400, 920, 1230)), 'russian-volume-groot-2')

# ── brow tint: voor (boven) en na (onder), gelijk formaat voor de vergelijker ─
BROWS = [
    ('03-brow-tint-1.jpg', (0, 540, 920, 900), (0, 955, 920, 1315)),
    ('04-brow-tint-2.jpg', (0, 545, 920, 905), (0, 960, 920, 1320)),
    ('05-brow-tint-3.jpg', (0, 560, 920, 920), (0, 945, 920, 1305)),
]
for i, (name, before, after) in enumerate(BROWS, 1):
    a, b = crop(name, before), crop(name, after)
    # het "BEAUTYBYNAZZ"-label rechtsonder in de na-foto valt buiten dit vak
    save(ImageOps.fit(a, (1200, 470), Image.LANCZOS), f'brow-{i}-voor')
    save(ImageOps.fit(b, (1200, 470), Image.LANCZOS), f'brow-{i}-na')

# ── logo: zwarte letters uit de witte cirkel → transparant masker ────────────
im = Image.open(SRC / '01-profiel.jpg').convert('L')
cx, cy, r = 135 * S, 378 * S, 92 * S
disc = im.crop(tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r)))
big = disc.resize((disc.width * 4, disc.height * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
alpha = big.point(lambda v: 255 if v < 90 else 0 if v > 190 else round(255 * (190 - v) / 100))
mask = Image.new('L', big.size, 0)
ImageDraw.Draw(mask).ellipse((10, 10, big.width - 10, big.height - 10), fill=255)
alpha = Image.composite(alpha, Image.new('L', big.size, 0), mask)
alpha = alpha.crop(alpha.getbbox())
logo = Image.new('LA', alpha.size, 0)
logo.putalpha(alpha)
logo = logo.resize((720, round(720 * alpha.height / alpha.width)), Image.LANCZOS)
logo.save(OUT / 'logo.png', optimize=True)
print('logo.png', logo.size)
