# Snijdt de foto's en het logo uit de Instagram-screenshots in bron/ en schrijft
# webp/png-bestanden naar assets/img/. Gebruik: npm run images  (vereist Python + Pillow)
#
# De screenshots zijn 1206×2622 px (iPhone). Coördinaten hieronder zijn in
# "schermpunten" van een 920 px brede weergave en worden met S geschaald.
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920

def crop(name, box):
    im = Image.open(SRC / name).convert('RGB')
    return im.crop(tuple(round(v * S) for v in box))

def save(im, name, q=84):
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=35, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

# ── resultaten: voor (boven) en na (onder) uit de highlight "Resultaten" ────
# (bestand, voor-vak, na-vak, verticale focus van het na-vak 0..1)
RESULTS = [
    ('05-resultaat-1.jpg', (0, 300, 920, 915), (0, 1010, 920, 1770), .42),
    ('06-resultaat-2.jpg', (0, 270, 920, 825), (0, 965, 920, 1770), .45),
    ('07-resultaat-3.jpg', (0, 300, 920, 885), (0, 1000, 920, 1770), .42),
    ('08-resultaat-4.jpg', (0, 270, 920, 915), (0, 1005, 920, 1770), .48),
    ('09-resultaat-5.jpg', (0, 280, 920, 880), (0, 975, 920, 1770), .4),
    ('10-resultaat-6.jpg', (0, 270, 920, 920), (0, 1010, 920, 1770), .45),
    ('11-resultaat-7.jpg', (0, 270, 920, 915), (0, 1005, 920, 1770), .48),
]
SIZE = (960, 720)
for i, (name, before, after, fy) in enumerate(RESULTS, 1):
    save(ImageOps.fit(crop(name, before), SIZE, Image.LANCZOS, centering=(.5, .5)), f'resultaat-{i}-voor')
    save(ImageOps.fit(crop(name, after), SIZE, Image.LANCZOS, centering=(.5, fy)), f'resultaat-{i}-na')

# ── sfeerfoto's uit het raster (12-grid-2) en het certificaat ───────────────
COLS = [(0, 305), (307, 612), (615, 920)]
ROWS = [(405, 812), (815, 1222)]
def tile(row, col, top=0.0):
    (x0, x1), (y0, y1) = COLS[col], ROWS[row]
    y0 += (y1 - y0) * top
    return crop('12-grid-2.jpg', (x0 + 2, y0 + 2, x1 - 2, y1 - 2))
save(tile(0, 0, top=.18), 'sfeer-kleurenwaaier')     # kleurenwaaier voor de behandeling
save(tile(0, 1, top=.18), 'sfeer-behandelstoel')     # klant in de behandelstoel
save(tile(1, 0, top=.18), 'sfeer-eindresultaat')     # eindresultaat
save(crop('16-info-certificaat.jpg', (110, 960, 820, 1560)), 'certificaat')

# ── logo: zwarte letters uit de witte cirkel → transparant masker ────────────
im = Image.open(SRC / '01-profiel.jpg').convert('L')
cx, cy, r = 136 * S, 378 * S, 94 * S
disc = im.crop(tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r)))
big = disc.resize((disc.width * 4, disc.height * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.1))
alpha = big.point(lambda v: 255 if v < 80 else 0 if v > 170 else round(255 * (170 - v) / 90))
# alles buiten de cirkel weg
mask = Image.new('L', big.size, 0)
from PIL import ImageDraw
ImageDraw.Draw(mask).ellipse((8, 8, big.width - 8, big.height - 8), fill=255)
alpha = Image.composite(alpha, Image.new('L', big.size, 0), mask)
bbox = alpha.getbbox()
alpha = alpha.crop(bbox)
logo = Image.new('LA', alpha.size, 0)
logo.putalpha(alpha)
logo = logo.resize((640, round(640 * alpha.height / alpha.width)), Image.LANCZOS)
logo.save(OUT / 'logo.png', optimize=True)
print('logo.png', logo.size)
