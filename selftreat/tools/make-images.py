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

def save(im, name, q=84):
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

def tile(name, rows, col):
    (x0, x1), (y0, y1) = COLS[col], rows
    return crop(name, (x0 + 3, y0 + 3, x1 - 3, y1 - 3))

P, G = '01-profiel.jpg', '02-grid-2.jpg'
save(tile(G, (586, 990), 0), 'facial')
save(tile(G, (586, 990), 2), 'hair-styling')
save(tile(G, (995, 1400), 1), 'brow-lamination')
save(tile(G, (1403, 1808), 0), 'kapper')
save(tile(G, (1403, 1808), 2), 'anti-aging')
save(tile(P, (1190, 1595), 0), 'lashes')
save(tile(P, (1190, 1595), 2), 'salon-haar')
save(tile(P, (1598, 1998), 1), 'make-up')
save(tile(P, (1598, 1998), 0), 'nieuwe-locatie')

# ── logo: de letters "ST" uit de witte cirkel → transparant masker ────────────
im = Image.open(SRC / '01-profiel.jpg').convert('L')
cx, cy, r = 135 * S, 388 * S, 52 * S
disc = im.crop(tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r)))
big = disc.resize((disc.width * 4, disc.height * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
alpha = big.point(lambda v: 255 if v < 185 else 0 if v > 225 else round(255 * (225 - v) / 40))
mask = Image.new('L', big.size, 0)
ImageDraw.Draw(mask).ellipse((10, 10, big.width - 10, big.height - 10), fill=255)
alpha = Image.composite(alpha, Image.new('L', big.size, 0), mask)
alpha = alpha.crop(alpha.getbbox())
logo = Image.new('LA', alpha.size, 0)
logo.putalpha(alpha)
logo = logo.resize((600, round(600 * alpha.height / alpha.width)), Image.LANCZOS)
logo.save(OUT / 'logo.png', optimize=True)
print('logo.png', logo.size)
