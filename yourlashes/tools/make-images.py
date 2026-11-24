# Snijdt foto's en logo uit de Instagram-screenshot in bron/ naar assets/img/.
# Gebruik: npm run images  (vereist Python + Pillow)
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (307, 612), (615, 900)]

def crop(box):
    return Image.open(SRC / '01-profiel.jpg').convert('RGB').crop(tuple(round(v * S) for v in box))

def save(im, name, q=84):
    im.thumbnail((800, 1100), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size}')

def tile(rows, col, top=0.0):
    (x0, x1), (y0, y1) = COLS[col], rows
    return crop((x0 + 3, y0 + 3 + (y1 - y0) * top, x1 - 3, y1 - 3))

save(tile((1307, 1713), 0), 'lashes-natural')
save(tile((1307, 1713), 1), 'lashes-hybrid')
save(tile((1307, 1713), 2, .14), 'lashes-volume')
save(tile((1716, 2000), 0, .2), 'lashlift-borstel')
save(tile((1716, 2000), 1, .2), 'lashes-wispy')
save(tile((1716, 2000), 2), 'lashes-close')

# logo: de taupe cirkel uit de profielfoto, rond uitgesneden
im = Image.open(SRC / '01-profiel.jpg').convert('RGB')
cx, cy, r, size = 135, 378, 92, 360
d = im.crop(tuple(round(v * S) for v in (cx - r, cy - r, cx + r, cy + r))).resize((size, size), Image.LANCZOS)
m = Image.new('L', (size * 4, size * 4), 0)
ImageDraw.Draw(m).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
d.putalpha(m.resize((size, size), Image.LANCZOS))
d.save(OUT / 'logo.png', optimize=True)
print('logo.png')
