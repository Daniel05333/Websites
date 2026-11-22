# Snijdt foto's en logo uit de Instagram-screenshots in bron/ naar assets/img/.
# Gebruik: npm run images  (vereist Python + Pillow)
# Bewust weggelaten: fotostrips en covers met namen van stellen, flyers van
# derden en wazig gemaakte posts.
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
    im.thumbnail((700, 1000), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

def tile(name, rows, col, top=.14, bottom=0):
    (x0, x1), (y0, y1) = COLS[col], rows
    h = y1 - y0
    return crop(name, (x0 + 3, y0 + 3 + h * top, x1 - 3, y1 - 3 - h * bottom))

A, B, C = '01-profiel.jpg', '02-grid-2.jpg', '03-grid-3.jpg'
save(tile(A, (1676, 2000), 0), 'vriendinnen-brillen')
save(tile(A, (1676, 2000), 2), 'zwartwit-duo')
save(tile(B, (375, 782), 1), 'bruidspaar-zwartwit')
save(tile(B, (785, 1192), 0), 'bruidspaar-knuffel')
save(tile(B, (1195, 1600), 0, .1, .2), 'gasten-groep')
save(tile(C, (712, 1118), 1), 'hartjes')
save(tile(C, (712, 1118), 2), 'feestgroep')
save(tile(C, (1121, 1527), 0), 'bruidspaar-brillen')
save(tile(C, (1121, 1527), 1), 'gasten-trio')
save(tile(C, (1530, 1935), 2), 'gasten-brillen')

im = Image.open(SRC / A).convert('RGB')
cx, cy, r, size = 135, 378, 84, 320
d = im.crop(tuple(round(v * S) for v in (cx - r, cy - r, cx + r, cy + r))).resize((size, size), Image.LANCZOS)
m = Image.new('L', (size * 4, size * 4), 0)
ImageDraw.Draw(m).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
d.putalpha(m.resize((size, size), Image.LANCZOS))
d.save(OUT / 'logo.png', optimize=True)
print('logo.png')
