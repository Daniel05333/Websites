# Snijdt foto's en voor/na-beelden uit de Instagram-screenshots in bron/.
# Voor/na-posts bestaan uit één foto met links 'voor' en rechts 'na', gescheiden
# door een witte streep: die wordt opgezocht en de twee helften worden apart bewaard
# (voor de schuifregelaar op de site).
# Bewust weggelaten: tekstposts, de flyers van acties en reviews (die staan als
# tekst op de site) en beelden van intieme zones.
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920

def grab(n, box):
    return Image.open(SRC / f'{n:02d}.png').convert('RGB').crop(tuple(round(v * S) for v in box))

def save(im, name, size=(900, 1100), q=84):
    im = im.copy(); im.thumbnail(size, Image.LANCZOS)
    im.filter(ImageFilter.UnsharpMask(radius=1, percent=30, threshold=2)).save(OUT / f'{name}.webp', quality=q, method=6)

def pair(n, box, name):
    im = grab(n, box)
    a = np.asarray(im.convert('L')).astype(float)
    w = a.shape[1]
    cols = range(int(w * .38), int(w * .62))
    split = max(cols, key=lambda x: a[:, x].mean() - a[:, x].std() * .5)
    h = im.height
    # beide helften even breed, de streep zelf valt weg
    half = min(split - 3, w - split - 4)
    voor = im.crop((split - 3 - half, 0, split - 3, h))
    na = im.crop((split + 4, 0, split + 4 + half, h))
    save(voor, f'{name}-voor'); save(na, f'{name}-na')
    return split / w

PAIRS = {  # naam: (screenshot, binnenste foto in schermpunten)
  'kin-man': (2, (648, 855, 887, 1093)),
  'oksel-1': (2, (337, 1263, 576, 1502)),
  'hals-man': (2, (645, 1263, 884, 1502)),
  'oksel-2': (2, (341, 1672, 580, 1911)),
  'rug-man': (2, (648, 1672, 887, 1911)),
  'huid-rood': (3, (644, 855, 884, 1093)),
  'arm': (3, (340, 1263, 580, 1502)),
  'oksel-3': (3, (648, 1263, 887, 1502)),
  'kaak-man': (4, (648, 669, 887, 908)),
  'kin-vrouw': (4, (340, 1487, 580, 1726)),
}
for name, (n, box) in PAIRS.items():
    pair(n, box, name)

save(grab(2, (648, 446, 887, 684)), 'laser-gezicht')
save(grab(2, (340, 855, 580, 1091)), 'hydrafacial')
save(grab(2, (310, 395, 610, 766)), 'salon-laser')
save(grab(3, (2, 414, 148, 716)), 'benen')
print('ok', len(PAIRS))
