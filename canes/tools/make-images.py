# Snijdt portretten en masterclass-foto's uit de Instagram-screenshots in bron/.
# Bewust weggelaten: tekstposts (prijslijst, regels en informatie staan als tekst
# op de site), productposts van EC Beauty, de selfie en de foto met de bruidegom.
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 399), (403, 802), (806, 1206)]

def rows(n):
    a = np.asarray(Image.open(SRC / f'{n:02d}.png').convert('L')).astype(int)
    seps = []
    for y in range(470, a.shape[0]):
        r = a[y, 20:1186]
        if r.mean() < 30 and r.std() < 14:
            if seps and y - seps[-1][1] <= 2: seps[-1][1] = y
            else: seps.append([y, y])
    out, top = [], 468
    for s0, s1 in seps:
        out.append((max(top, s0 - 535), s0 - 1)); top = s1 + 1
    out.append((top, min(a.shape[0], top + 534)))
    return [r for r in out if r[1] - r[0] > 300]

def save(im, name, size=(800, 1000), q=84):
    im = im.copy(); im.thumbnail(size, Image.LANCZOS)
    im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2)).save(OUT / f'{name}.webp', quality=q, method=6)

def tile(n, r, c, top=.12):
    (x0, x1), (y0, y1) = COLS[c], rows(n)[r]
    return Image.open(SRC / f'{n:02d}.png').convert('RGB').crop((x0 + 2, round(y0 + (y1 - y0) * top), x1 - 2, y1))

def grab(n, box, ext='png'):
    return Image.open(SRC / f'{n:02d}.{ext}').convert('RGB').crop(tuple(round(v * S) for v in box))

TILES = {  # naam: (screenshot, rij, kolom, categorie)
  'bruid-raam': (2, 0, 0), 'glam-bruin': (2, 0, 1), 'glam-blond': (2, 0, 2), 'glam-zwart': (2, 2, 0), 'glam-luipaard': (2, 2, 2), 'chic-hoed': (2, 3, 2),
  'bruid-sluier-blond': (3, 0, 0), 'glam-goud': (3, 0, 1), 'soft-golf': (3, 0, 2), 'bruid-tiara': (3, 1, 0), 'soft-bruin': (3, 1, 1), 'soft-knot': (3, 1, 2),
  'bruid-sluier': (3, 2, 0), 'chic-blond': (3, 2, 1), 'chic-opgestoken': (3, 2, 2), 'bruid-vintage': (3, 3, 0), 'bruid-blond': (3, 3, 1),
  'soft-donker': (4, 1, 0), 'glam-staart': (4, 1, 2), 'soft-opgestoken': (4, 2, 0), 'bruid-parels': (4, 2, 1), 'bruid-boeket': (4, 3, 0), 'bruid-kroon': (4, 3, 2),
  'soft-groen': (5, 0, 0), 'bruid-japon': (5, 0, 1), 'glam-glitter': (5, 1, 2), 'bruid-kant': (5, 2, 1), 'chic-zilver': (5, 2, 2), 'chic-moeder': (5, 3, 2),
  'glam-krul': (6, 1, 0), 'glam-stralend': (6, 1, 2), 'glam-nacht': (6, 3, 0),
  'bruid-lichtjes': (15, 0, 0), 'bruid-boog': (15, 0, 1), 'bruid-goud': (15, 2, 1), 'bruid-tiara2': (15, 3, 1), 'soft-lokken': (15, 3, 2),
  'glam-koper': (16, 0, 0), 'soft-satijn': (16, 0, 1), 'glam-blauw': (16, 1, 0), 'soft-krullen': (16, 3, 1), 'bruid-haarband': (16, 3, 2),
}
for name, (n, r, c) in TILES.items():
    save(tile(n, r, c), name)
# vastgezette post: Esra zelf
save(Image.open(SRC / '01.jpg').convert('RGB').crop((2, 1830, 398, 2307)), 'esra')
# masterclasses (stories, zonder de tekstbalken)
save(grab(11, (0, 372, 920, 1585)), 'mc-huda', size=(1100, 1100))
save(grab(12, (0, 356, 920, 1715)), 'mc-mario', size=(900, 1300))
save(grab(13, (0, 552, 920, 1368)), 'mc-sirjohn', size=(1100, 1000))
save(grab(14, (0, 630, 920, 1484)), 'mc-la', size=(1100, 1000))
print('ok', len(TILES) + 5)
