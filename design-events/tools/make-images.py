# Snijdt de foto's en het logo uit de Instagram-screenshots in bron/ en schrijft
# webp/png-bestanden naar assets/img/. Gebruik: npm run images  (vereist Python + Pillow)
# Coördinaten in "schermpunten" van een 920 px brede weergave, geschaald met S.
# Foto's met bruidsparen, namen van stellen of tafelindelingen zijn bewust weggelaten.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (307, 612), (615, 900)]

def crop(name, box):
    return Image.open(SRC / name).convert('RGB').crop(tuple(round(v * S) for v in box))

def save(im, name, q=82):
    im.thumbnail((820, 1100), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

def tile(name, rows, col, top=.15):
    (x0, x1), (y0, y1) = COLS[col], rows
    return crop(name, (x0 + 3, y0 + 3 + (y1 - y0) * top, x1 - 3, y1 - 3))

A, B, C = '01-profiel.jpg', '02-grid-2.jpg', '03-grid-3.jpg'
save(tile(A, (1140, 1546), 1), 'kokos-mocktails')
save(tile(A, (1549, 1955), 0), 'mocktail-kleur')
save(tile(A, (1549, 1955), 1), 'mocktail-fruit')
save(tile(A, (1549, 1955), 2), 'vlinder-wit')
save(tile(B, (358, 767), 0), 'vlinder-tafel')
save(tile(B, (358, 767), 1), 'champagne-rek')
save(tile(B, (770, 1175), 0), 'paarse-mocktails')
save(tile(B, (770, 1175), 2), 'rozen-martini')
save(tile(B, (1178, 1585), 1), 'perzik-blauw')
save(tile(B, (1178, 1585), 2), 'roze-fruit')
save(tile(B, (1588, 1995), 0), 'gouden-etagere')
save(tile(B, (1588, 1995), 2), 'kokos-mr-mrs')
save(tile(C, (995, 1400), 2), 'vlinder-kleur')
# stories (zonder namen en tafelindelingen)
save(crop('04-tiramisu.jpg', (340, 250, 920, 940)), 'tiramisu-kar')
save(crop('05-tiramisu-fruit.jpg', (0, 420, 920, 1775)), 'tiramisu-fruit')
save(crop('06-mocktail-table.jpg', (0, 560, 920, 1560)), 'mocktail-raam')
save(crop('07-cocktail-table.jpg', (0, 420, 920, 1775)), 'cocktail-tafel')
save(crop('08-table.jpg', (450, 760, 920, 1260)), 'styling-vlinders')
save(crop('09-snack-bar.jpg', (0, 600, 920, 1575)), 'snack-bar')
save(crop('10-snack-candy.jpg', (0, 300, 920, 1775)), 'snack-snoep')

# ── logo's: badge uit de profielfoto (rond) en goud-op-zwart uit de laatste post
def disc(name, cx, cy, r, out, size=560):
    im = Image.open(SRC / name).convert('RGB')
    d = im.crop(tuple(round(v * S) for v in (cx - r, cy - r, cx + r, cy + r))).resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size * 4, size * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    d.putalpha(m.resize((size, size), Image.LANCZOS))
    d.save(OUT / out, optimize=True)
    print(out)
disc(A, 135, 388, 96, 'logo-badge.png', 240)
# goud-op-zwart: zwart wordt transparant, goud blijft
im = Image.open(SRC / C).convert('RGB').crop(tuple(round(v * S) for v in (318, 1480, 604, 1766)))
im = im.resize((800, 800), Image.LANCZOS)
lum = im.convert('L').point(lambda v: 0 if v < 50 else 255 if v > 120 else round(255 * (v - 50) / 70))
im.putalpha(lum)
im = im.crop(lum.getbbox())
im.thumbnail((420, 460), Image.LANCZOS)
im.save(OUT / 'logo-goud.png', optimize=True)
print('logo-goud.png', im.size)
