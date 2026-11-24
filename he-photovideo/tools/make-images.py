# Snijdt foto's en het HE-logo uit de Instagram-screenshots in bron/.
# Bewust weggelaten: de titelkaart met namen (Damla & Muharrem), de muzikant
# (artiest, geen klant) en de zwangerschapsfoto (valt buiten de drie gelegenheden).
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (308, 612), (615, 920)]
ROWS = {
  '01-profiel.png': [(984, 1390), (1393, 1798)],
  '02-grid.png': [(364, 770), (773, 1179), (1182, 1588), (1591, 1997)],
  '03-grid.png': [(357, 760), (763, 1169), (1172, 1578), (1581, 1987)],
  '04-grid.png': [(362, 769), (772, 1178), (1181, 1587), (1590, 1997)],
  '05-grid.png': [(376, 782), (785, 1191), (1194, 1600), (1603, 2000)],
}
def save(im, name, q=84):
    im.thumbnail((760, 1000), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
def tile(f, r, c, top=.16, left=0, right=0):
    (x0, x1), (y0, y1) = COLS[c], ROWS[f][r]
    # bovenrand iets weg: daar staat het Instagram-icoon (carrousel/video)
    return Image.open(SRC / f).convert('RGB').crop(tuple(round(v * S) for v in (x0 + 3 + left, y0 + 3 + (y1 - y0) * top, x1 - 3 - right, y1 - 3)))
TILES = [  # bestand, rij, kolom, naam
  ('02-grid.png', 0, 0, 'team'), ('02-grid.png', 0, 1, 'trap-boven'), ('02-grid.png', 0, 2, 'auto-zw'),
  ('02-grid.png', 1, 0, 'kerk-zw'), ('02-grid.png', 1, 1, 'roze-binnenplaats'), ('02-grid.png', 1, 2, 'kerk-wandel'),
  ('02-grid.png', 2, 0, 'trappen-zwart'), ('02-grid.png', 2, 1, 'pak-pailletten-zw'), ('02-grid.png', 2, 2, 'groen-beige'),
  ('02-grid.png', 3, 0, 'fuchsia-boog'), ('02-grid.png', 3, 1, 'oldtimer-wit'), ('02-grid.png', 3, 2, 'henna-tamboerijn'),
  ('03-grid.png', 0, 0, 'bruid-zw'), ('03-grid.png', 0, 1, 'kathedraal'), ('03-grid.png', 0, 2, 'paard-zw'),
  ('03-grid.png', 1, 0, 'bruid-lach'), ('03-grid.png', 1, 1, 'groen-kerk'), ('03-grid.png', 1, 2, 'kasteel-lila'),
  ('03-grid.png', 2, 1, 'trap-zw'), ('03-grid.png', 2, 2, 'tuin-dans'),
  ('03-grid.png', 3, 0, 'piano-zw'), ('03-grid.png', 3, 1, 'sluier-blik'), ('03-grid.png', 3, 2, 'mercedes-zw'),
  ('04-grid.png', 0, 0, 'parasol-zw'), ('04-grid.png', 0, 1, 'oversteken-zw'), ('04-grid.png', 0, 2, 'deur-creme'),
  ('04-grid.png', 1, 1, 'ogen'), ('04-grid.png', 1, 2, 'g-klasse-zw'),
  ('04-grid.png', 2, 2, 'witte-smoking'),
  ('04-grid.png', 3, 0, 'raam-zw'), ('04-grid.png', 3, 1, 'aanzoek-strand'), ('04-grid.png', 3, 2, 'park-dans-zw'),
  ('05-grid.png', 0, 0, 'sluier-lach'), ('05-grid.png', 0, 1, 'muur-herfst'), ('05-grid.png', 0, 2, 'arcade'),
  ('05-grid.png', 1, 1, 'muur-hijab'), ('05-grid.png', 1, 2, 'hal-zw'),
  ('05-grid.png', 2, 0, 'wandel-zw'), ('05-grid.png', 2, 1, 'handen-strand'), ('05-grid.png', 2, 2, 'rood-deur'),
  ('05-grid.png', 3, 0, 'rood-steeg'), ('05-grid.png', 3, 1, 'hijab-trap'), ('05-grid.png', 3, 2, 'hijab-wandel-zw'),
]
for f, r, c, n in TILES:
    save(tile(f, r, c), n)
save(tile('04-grid.png', 2, 0, right=26), 'golfkar-zw')
save(tile('04-grid.png', 1, 0, top=.16, left=14, right=22), 'brug-zw')
# logo: wit HE-woordmerk uit de profielfoto, transparant
im = Image.open(SRC / '01-profiel.png').convert('RGB')
cx, cy, r = 135, 378, 97
g = im.convert('L').crop(tuple(round(v * S) for v in (cx - 62, cy - 58, cx + 62, cy + 70))).resize((744, 768), Image.LANCZOS)
a = g.point(lambda v: 0 if v < 60 else 255 if v > 190 else round(255 * (v - 60) / 130))
w = Image.new('LA', g.size, (255, 0)); w.putalpha(a); w = w.crop(a.getbbox()); w.save(OUT / 'logo-wit.png', optimize=True)
# donkere versie voor lichte achtergronden
d = Image.new('LA', w.size, (17, 0)); d.putalpha(w.getchannel('A')); d.save(OUT / 'logo-zwart.png', optimize=True)
# rond profielicoon (favicon)
size = 256
p = im.crop(tuple(round(v * S) for v in (cx - r, cy - r, cx + r, cy + r))).resize((size, size), Image.LANCZOS)
m = Image.new('L', (size * 4, size * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
p.putalpha(m.resize((size, size), Image.LANCZOS)); p.save(OUT / 'icon.png', optimize=True)
print('ok', len(TILES) + 1)
