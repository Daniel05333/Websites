# Snijdt foto's uit de Instagram-screenshots in bron/.
# Bewust weggelaten: tekstposts (prijslijst staat als tekst op de site), het
# kleurboek, de stofafzuiger, de selfie met producten en de nieuwjaarspost.
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
ROWS = {n: rows(n) for n in range(2, 7)}

def save(im, name, size=(800, 1000), q=84):
    im = im.copy(); im.thumbnail(size, Image.LANCZOS)
    im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=35, threshold=2)).save(OUT / f'{name}.webp', quality=q, method=6)

def tile(n, r, c, top=.13, bottom=0):
    (x0, x1), (y0, y1) = COLS[c], ROWS[n][r]
    h = y1 - y0
    return Image.open(SRC / f'{n:02d}.png').convert('RGB').crop((x0 + 2, round(y0 + h * top), x1 - 2, round(y1 - h * bottom)))

def grab(n, box):
    return Image.open(SRC / f'{n:02d}.png').convert('RGB').crop(tuple(round(v * S) for v in box))

TILES = {  # naam: (screenshot, rij, kolom, stijl)
  'french-amandel': (2, 1, 0), 'rood-auto': (2, 2, 0), 'rood-kort': (2, 2, 1), 'glitter-bordeaux': (2, 3, 1), 'bruin-stip': (2, 3, 2),
  'ringen-nude': (3, 0, 0), 'parelwit': (3, 0, 1), 'magenta': (3, 0, 2), 'stippen-wit': (3, 1, 1), 'nude-dots': (3, 1, 2),
  'french-blauw-geel': (3, 2, 1), 'roze-glitter': (3, 3, 0), 'rood-glans': (3, 3, 1),
  'blauw-art': (4, 0, 0), 'chrome-nude': (4, 0, 1), 'koraal-art': (4, 1, 0), 'french-geel': (4, 1, 2),
  'french-lila': (4, 2, 1), 'chrome-roze': (4, 2, 2), 'marmer': (4, 3, 2),
  'zeester': (5, 0, 0), 'pruim': (5, 0, 2), 'melkwit': (5, 1, 0), 'hartjes-rood': (5, 1, 1), 'hartjes': (5, 1, 2),
  'nude-ring': (5, 2, 1), 'roze': (5, 2, 2), 'nude-kort': (5, 3, 0), 'terracotta': (5, 3, 1),
  'rood-amandel': (6, 0, 0), 'koper-glitter': (6, 0, 1), 'glitter-paars': (6, 1, 1), 'pruim-chrome': (6, 1, 2),
  'bruin-french': (6, 2, 0), 'herfst': (6, 2, 2), 'roze-stip': (6, 3, 0), 'taupe': (6, 3, 1),
  # salon en gezicht
  'logo-tas': (2, 0, 2), 'masker': (2, 1, 1), 'salon-hoek': (2, 1, 2), 'kerstboom': (2, 0, 1),
  'beker-logo': (3, 2, 0), 'beker-zwembad': (4, 0, 2), 'cadeaubon': (4, 2, 0),
  'dermaplaning-mes': (5, 0, 1), 'kwast-gezicht': (5, 2, 0), 'producten': (6, 3, 2),
}
for name, (n, r, c) in TILES.items():
    save(tile(n, r, c), name)
save(tile(2, 2, 2, bottom=.2), 'dermaplaning-pad')
# voor/na dermaplaning uit de ontwerp-post
save(grab(2, (2, 384, 139, 612)), 'derma-voor')
save(grab(2, (167, 486, 304, 708)), 'derma-na')
# stories
save(grab(7, (272, 1152, 648, 1528)), 'pand', size=(1000, 900))
save(grab(8, (58, 422, 862, 1496)), 'olie', size=(900, 1200))
save(grab(9, (101, 511, 812, 1399)), 'salon', size=(1000, 1300), q=86)
print('ok', len(TILES) + 6)
