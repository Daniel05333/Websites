# Snijdt productfoto's, de film-foto's en het SJ-logo uit de Instagram-screenshots in bron/.
# Bewust weggelaten: foto's met parfumflessen van een ander merk, spiegelselfies,
# posts met tekst erop en foto's waar vooral een gezicht op staat.
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
COLS = [(0, 399), (403, 802), (806, 1206)]

def rows(n):
    a = np.asarray(Image.open(SRC / f'{n:02d}.png').convert('L')).astype(int)
    seps = []
    for y in range(470, a.shape[0]):
        r = a[y, 20:1186]
        if r.mean() < 28 and r.std() < 12:
            if seps and y - seps[-1][1] <= 2: seps[-1][1] = y
            else: seps.append([y, y])
    out, top = [], 468
    for s0, s1 in seps:
        out.append((max(top, s0 - 535), s0 - 1)); top = s1 + 1
    out.append((top, min(a.shape[0], top + 534)))
    return [r for r in out if r[1] - r[0] > 300]
ROWS = {n: rows(n) for n in range(2, 9)}

def save(im, name, size=(800, 1000), q=84):
    im.thumbnail(size, Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=35, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)

def tile(n, r, c, top=.14):
    (x0, x1), (y0, y1) = COLS[c], ROWS[n][r]
    # bovenrand weg: daar staat het Instagram-icoon (carrousel/video)
    return Image.open(SRC / f'{n:02d}.png').convert('RGB').crop((x0 + 2, round(y0 + (y1 - y0) * top), x1 - 2, y1))

TILES = {  # naam: (screenshot, rij, kolom)
  # ringen
  'ring-satijn': (7, 0, 2), 'ring-blauw': (3, 2, 2), 'ring-groen': (5, 0, 2), 'ringen-roos': (6, 3, 0),
  'ringen-roze': (8, 1, 2), 'ringen-turkoois': (8, 2, 1), 'ringen-pampas': (6, 1, 2), 'ringen-kerst': (5, 3, 2),
  # oorbellen
  'oorbellen-hand': (4, 1, 0), 'creolen-standaard': (3, 2, 1), 'creool-zirkonia': (4, 2, 2), 'oorbel-druppel': (4, 2, 1),
  'oorbel-staaf': (6, 0, 0), 'creolen-oor': (5, 3, 1), 'oorbellen-doosje': (6, 2, 2),
  # kettingen
  'ketting-schakel': (6, 1, 0), 'ketting-klaver': (6, 1, 1), 'ketting-kruis-munt': (4, 0, 1), 'ketting-tennis': (4, 0, 2),
  'ketting-medaillon': (5, 0, 0), 'kettingen-kruis-kleur': (5, 2, 1), 'kettingen-vlinder': (3, 3, 0), 'ketting-slang': (6, 3, 2),
  # armbanden
  'armband-gourmet': (7, 0, 1), 'bangle-satijn': (7, 1, 2), 'tennis-kleur': (4, 1, 2), 'tennis-armbanden': (3, 0, 0),
  'klaver-armbanden': (4, 0, 0), 'armband-pampas': (5, 1, 1), 'klaver-kleuren': (4, 3, 0), 'armband-manchet': (3, 3, 2),
  # sfeer en seizoen
  'kerst-klaver': (5, 2, 2), 'collectie-tray': (2, 2, 0), 'standaard-goud': (7, 1, 0), 'glas-bangles': (7, 2, 2),
  'kruisen-hand': (5, 1, 0), 'armbanden-roze': (8, 0, 2), 'hand-ringen': (2, 3, 1),
}
for name, (n, r, c) in TILES.items():
    save(tile(n, r, c), name)

# film: story-foto (klavertjes op de pols) en de close-up uit de collage
S = 1206 / 920
st = Image.open(SRC / '09.png').convert('RGB').crop((0, round(366 * S), 1206, round(1604 * S)))
st.save(OUT / 'film-hand.webp', quality=88, method=6)
cl = Image.open(SRC / '10.png').convert('RGB').crop((round(447 * S), round(962 * S), round(904 * S), round(1773 * S)))
cl.save(OUT / 'film-close.webp', quality=88, method=6)
for nm, box in {'collage-oor': (8, 152, 442, 956), 'collage-ketting': (448, 152, 904, 956), 'collage-riem': (8, 962, 442, 1773)}.items():
    save(Image.open(SRC / '10.png').convert('RGB').crop(tuple(round(v * S) for v in box)), nm)

# zwevende 'objecten' voor het manifest: ronde uitsneden met zachte rand
def orb(src, box, name, size=420):
    im = Image.open(OUT / f'{src}.webp').convert('RGB')
    w, h = im.size
    im = im.crop(tuple(round(v) for v in (box[0] * w, box[1] * h, box[2] * w, box[3] * h))).resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size, size), 0); ImageDraw.Draw(m).ellipse((8, 8, size - 8, size - 8), fill=255)
    im.putalpha(m.filter(ImageFilter.GaussianBlur(6))); im.save(OUT / f'{name}.webp', quality=86, method=6)
orb('oorbellen-hand', (.08, .1, .92, .75), 'obj-oorbellen')
orb('creolen-standaard', (.1, .05, .9, .65), 'obj-creolen')
orb('ring-satijn', (.15, .2, .85, .75), 'obj-ring')
orb('klaver-kleuren', (.05, .1, .75, .6), 'obj-klaver')

# logo: goud SJ-woordmerk op transparant (crème achtergrond weggefilterd)
lg = tile(3, 0, 2, top=0).convert('RGB')
a = np.asarray(lg).astype(float)
bg = np.median(a[:30, :30].reshape(-1, 3), axis=0)
d = np.sqrt(((a - bg) ** 2).sum(axis=2))
alpha = np.clip((d - 14) / 70, 0, 1)
gold = np.array([168, 126, 58], float)
rgba = np.dstack([np.broadcast_to(gold, a.shape) * .35 + a * .65, alpha * 255]).astype(np.uint8)
L = Image.fromarray(rgba, 'RGBA'); L = L.crop(L.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox())
L.save(OUT / 'logo.png', optimize=True)
# favicon: rond profielicoon
im = Image.open(SRC / '01.png').convert('RGB')
cx, cy, r = round(135 * S), round(388 * S), round(96 * S)
p = im.crop((cx - r, cy - r, cx + r, cy + r)).resize((256, 256), Image.LANCZOS)
m = Image.new('L', (1024, 1024), 0); ImageDraw.Draw(m).ellipse((0, 0, 1023, 1023), fill=255)
p.putalpha(m.resize((256, 256), Image.LANCZOS)); p.save(OUT / 'icon.png', optimize=True)
print('ok', len(TILES), {k: len(v) for k, v in ROWS.items()})
