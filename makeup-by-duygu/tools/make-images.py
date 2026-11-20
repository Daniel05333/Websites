# Snijdt de foto's uit de Instagram-screenshots in bron/ en schrijft webp-bestanden
# naar assets/img/. Gebruik: npm run images  (vereist Python + Pillow)
# Coördinaten in "schermpunten" van een 920 px brede weergave, geschaald met S.
# Bewust weggelaten: foto's met partners/stellen, chatschermen (namen, avatars)
# en het certificaat met volledige naam.
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (307, 612), (615, 900)]

def crop(name, box):
    return Image.open(SRC / name).convert('RGB').crop(tuple(round(v * S) for v in box))

def save(im, name, q=82):
    im.thumbnail((800, 1100), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

def tile(name, rows, col, top=.14):
    (x0, x1), (y0, y1) = COLS[col], rows
    return crop(name, (x0 + 3, y0 + 3 + (y1 - y0) * top, x1 - 3, y1 - 3))

P, A, B, C = '01-profiel.jpg', '02-grid-2.jpg', '03-grid-3.jpg', '04-grid-4.jpg'
# bruid
save(tile(P, (1233, 1640), 1), 'bruid-kroon')
save(tile(A, (1150, 1556), 0), 'bruid-henna')
save(tile(A, (1150, 1556), 1), 'bruid-hijab')
save(tile(A, (1559, 1965), 1), 'bruid-sluier')
save(tile(A, (1559, 1965), 2), 'bruid-tiara')
# events & glam
save(tile(A, (358, 738), 1, .05), 'glam-krullen')
save(tile(A, (358, 738), 2, .05), 'glam-avond')
save(tile(A, (741, 1147), 0), 'glam-bordeaux')
save(tile(A, (741, 1147), 2), 'glam-rood-kant')
save(tile(A, (1150, 1556), 2), 'glam-hijab')
save(tile(A, (1559, 1965), 0), 'glam-golvend')
save(tile(B, (358, 754), 0), 'glam-rood')
save(tile(B, (757, 1163), 2), 'glam-bruin')
save(tile(B, (1166, 1572), 0), 'verloving-groen')
save(tile(B, (1166, 1572), 2), 'glam-hijab-roze')
save(tile(C, (586, 992), 0), 'glam-blond')
save(tile(C, (586, 992), 1), 'glam-goud')
save(tile(C, (586, 992), 2), 'glam-kort')
save(tile(C, (995, 1400), 1), 'glam-bun')
save(tile(C, (995, 1400), 2), 'glam-ringlamp')
save(tile(C, (1403, 1808), 0), 'glam-naturel')
# over / werkplek
save(crop('10-eid-look.jpg', (0, 500, 920, 1660)), 'over-duygu')
save(crop('11-work.jpg', (0, 300, 920, 1430)), 'werkplek')
save(crop('08-certificaat.jpg', (120, 830, 920, 1125)), 'certificaat')
