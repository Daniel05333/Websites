# Snijdt de foto's en het logo uit de Instagram-screenshots in bron/ en schrijft
# webp/png-bestanden naar assets/img/. Gebruik: npm run images  (vereist Python + Pillow)
# Coördinaten in "schermpunten" van een 920 px brede weergave, geschaald met S.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (307, 612), (615, 900)]  # rechts: iOS-scrollbalk weg

def crop(name, box):
    return Image.open(SRC / name).convert('RGB').crop(tuple(round(v * S) for v in box))

def save(im, name, q=85):
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=35, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

def tile(name, rows, col, top=0.0):
    (x0, x1), (y0, y1) = COLS[col], rows
    return crop(name, (x0 + 3, y0 + 3 + (y1 - y0) * top, x1 - 3, y1 - 3))

P, G = '02-profiel-grid.jpg', '03-grid-2.jpg'
save(tile(P, (1222, 1627), 0, .1), 'princess-glam')
save(tile(P, (1222, 1627), 1, .1), 'cake-bar-experience')
save(tile(P, (1222, 1627), 2, .1), 'locatie-cake-bar')
save(tile(P, (1630, 2000), 0, .08), 'squishy-party')
save(tile(P, (1630, 2000), 1, .08), 'slime-party')
save(tile(G, (586, 990), 0, .1), 'hair-tinsel')
save(tile(G, (586, 990), 1, .1), 'hair-tinsel-aanbrengen')
save(tile(G, (993, 1398), 1), 'popcornkar')
save(tile(G, (993, 1398), 2), 'cake-bar-toppings')
save(tile(G, (1401, 1808), 0), 'candy-bar-toppings')
save(tile(G, (1401, 1808), 1), 'candy-bar')

# ── logo: de witte cirkel uit de profielfoto, met ronde transparante rand ─────
im = Image.open(SRC / '01-profiel.jpg').convert('RGB')
cx, cy, r = 135 * S, 378 * S, 85 * S
disc = im.crop(tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r))).resize((560, 560), Image.LANCZOS)
mask = Image.new('L', (2240, 2240), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 2239, 2239), fill=255)
disc.putalpha(mask.resize((560, 560), Image.LANCZOS))
disc.save(OUT / 'logo.png', optimize=True)
print('logo.png', disc.size)
