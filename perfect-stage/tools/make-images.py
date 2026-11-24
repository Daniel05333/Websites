# Snijdt decorfoto's en het logo uit de Instagram-screenshots in bron/.
# Bewust weggelaten: bruidsparen, personen, welkomstborden met namen,
# tekst-/promoposts en collages met namen.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (307, 612), (615, 905)]
ROWS = {
  '01-profiel.jpg': [(1203, 1608), (1611, 2000)],
  '02-grid-2.jpg': [(396, 802), (805, 1210), (1213, 1619), (1622, 2000)],
  '03-grid-3.jpg': [(357, 756), (759, 1164), (1167, 1572), (1575, 1980)],
  '04-grid-4.jpg': [(438, 845), (848, 1254), (1257, 1663), (1666, 2000)],
  '05-grid-5.jpg': [(359, 766), (769, 1174), (1177, 1583), (1586, 2000)],
}
def save(im, name, q=82):
    im.thumbnail((760, 1000), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=30, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
def tile(f, r, c, top=.12):
    (x0, x1), (y0, y1) = COLS[c], ROWS[f][r]
    return Image.open(SRC / f).convert('RGB').crop(tuple(round(v * S) for v in (x0 + 3, y0 + 3 + (y1 - y0) * top, x1 - 3, y1 - 3)))
TILES = [  # bestand, rij, kolom, naam
  ('01-profiel.jpg', 0, 2, 'zaal-bloemenloper'), ('01-profiel.jpg', 1, 0, 'stage-lila'), ('01-profiel.jpg', 1, 1, 'tafels-goud'), ('01-profiel.jpg', 1, 2, 'stage-bogen-roze'),
  ('02-grid-2.jpg', 2, 1, 'zaal-kroonluchters'), ('02-grid-2.jpg', 3, 1, 'bruidsbank-marmer'), ('02-grid-2.jpg', 3, 2, 'stage-zaal'),
  ('03-grid-3.jpg', 0, 0, 'stage-wit'), ('03-grid-3.jpg', 0, 2, 'zaal-ringbogen'), ('03-grid-3.jpg', 1, 0, 'boog-stage'), ('03-grid-3.jpg', 1, 1, 'stage-rood'),
  ('03-grid-3.jpg', 1, 2, 'boog-trap-lila'), ('03-grid-3.jpg', 2, 0, 'stage-kroonluchters'), ('03-grid-3.jpg', 2, 1, 'zaal-bloesem'), ('03-grid-3.jpg', 2, 2, 'boog-roze'),
  ('03-grid-3.jpg', 3, 1, 'inkomsthal-gordijnen'),
  ('04-grid-4.jpg', 0, 2, 'tafels-rozen'), ('04-grid-4.jpg', 1, 1, 'trap-bloemen'), ('04-grid-4.jpg', 1, 2, 'bruidsbank-rood'), ('04-grid-4.jpg', 2, 0, 'stage-roze-zaal'),
  ('04-grid-4.jpg', 2, 1, 'stage-goud-panelen'), ('04-grid-4.jpg', 2, 2, 'kroonluchter-ringen'), ('04-grid-4.jpg', 3, 0, 'stage-blauw'), ('04-grid-4.jpg', 3, 1, 'bogen-lampionnen'), ('04-grid-4.jpg', 3, 2, 'koepel-lila'),
  ('05-grid-5.jpg', 0, 0, 'tafels-rood'), ('05-grid-5.jpg', 0, 1, 'zaal-orchidee'), ('05-grid-5.jpg', 0, 2, 'tafel-roze-stage'), ('05-grid-5.jpg', 1, 0, 'bogen-tafels'),
  ('05-grid-5.jpg', 1, 1, 'bogen-lila-licht'), ('05-grid-5.jpg', 1, 2, 'bogen-roze-licht'), ('05-grid-5.jpg', 2, 0, 'bruidsbank-bogen'), ('05-grid-5.jpg', 2, 1, 'boog-spits'),
  ('05-grid-5.jpg', 2, 2, 'stage-wit-podium'), ('05-grid-5.jpg', 3, 0, 'detail-kroonluchter'), ('05-grid-5.jpg', 3, 1, 'bruidsbank-goudbogen'), ('05-grid-5.jpg', 3, 2, 'stage-donkere-vloer'),
]
for f, r, c, n in TILES: save(tile(f, r, c), n)
save(Image.open(SRC / '06-trapbloemen.jpg').convert('RGB').crop(tuple(round(v * S) for v in (8, 418, 912, 1548))), 'trapbloemen-groot')
im = Image.open(SRC / '01-profiel.jpg').convert('RGB')
cx, cy, r, size = 135, 388, 96, 420
d = im.crop(tuple(round(v * S) for v in (cx - r, cy - r, cx + r, cy + r))).resize((size, size), Image.LANCZOS)
m = Image.new('L', (size * 4, size * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
d.putalpha(m.resize((size, size), Image.LANCZOS)); d.save(OUT / 'logo.png', optimize=True)
# transparant woordmerk (donkere letters)
g = im.convert('L').crop(tuple(round(v * S) for v in (cx - 70, cy - 52, cx + 70, cy + 52))).resize((840, 624), Image.LANCZOS)
a = g.point(lambda v: 255 if v < 90 else 0 if v > 170 else round(255 * (170 - v) / 80))
w = Image.new('LA', g.size, 0); w.putalpha(a); w = w.crop(a.getbbox()); w.save(OUT / 'logo-woord.png', optimize=True)
print('ok', len(TILES))
