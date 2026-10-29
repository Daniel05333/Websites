# Snijdt de foto's en het logo uit de Instagram-screenshots in bron/ en schrijft
# webp-bestanden naar assets/img/. Gebruik: npm run images  (vereist Python + Pillow)
#
# De screenshots zijn 1206×2622 px (iPhone). Coördinaten hieronder zijn in
# "schermpunten" van een 920 px brede weergave en worden met S geschaald.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'bron', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
S = 1206 / 920
COLS = [(0, 305), (307, 612), (615, 920)]
GRID = {
    'g1': ('01-profiel.jpg', [(1195, 1600), (1603, 2000)]),
    'g2': ('02-grid-2.jpg', [(358, 765), (768, 1173), (1176, 1582), (1585, 1990)]),
    'g3': ('03-grid-3.jpg', [(586, 992), (995, 1400), (1403, 1808)]),
}

def tile(key, row, col):
    name, rows = GRID[key]
    im = Image.open(SRC / name).convert('RGB')
    (x0, x1), (y0, y1) = COLS[col], rows[row]
    return im.crop((round(x0 * S) + 3, round(y0 * S) + 3, round(x1 * S) - 3, round(y1 * S) - 3))

def story(name, box):
    im = Image.open(SRC / name).convert('RGB')
    return im.crop(tuple(round(v * S) for v in box))

def trim(im, top=0, right=0, bottom=0, left=0):
    """Snijdt fracties van de randen weg (bijv. het afspeelicoon van een video-tegel)."""
    w, h = im.size
    return im.crop((round(w * left), round(h * top), w - round(w * right), h - round(h * bottom)))

def cover_icon(im, box):
    """Vult het afspeelicoon van een video-tegel: per rij een verloop tussen de pixels links en rechts ervan."""
    x0, y0, x1, y1 = box
    px = im.load()
    avg = lambda xs, y: [sum(px[x, y][i] for x in xs) / len(xs) for i in range(3)]
    for y in range(y0, y1):
        a, b = avg(range(x0 - 6, x0 - 1), y), avg(range(x1 + 1, min(x1 + 6, im.width)), y)
        for x in range(x0, x1):
            t = (x - x0) / (x1 - x0)
            px[x, y] = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
    region = im.crop((x0 - 4, y0 - 4, x1 + 4, y1 + 4)).filter(ImageFilter.GaussianBlur(2))
    im.paste(region, (x0 - 4, y0 - 4))
    return im

def save(im, name, q=86):
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
    im.save(OUT / f'{name}.webp', quality=q, method=6)
    print(f'{name}.webp {im.size[0]}×{im.size[1]}')

# ── foto's ──────────────────────────────────────────────────────────────────
save(cover_icon(tile('g3', 0, 0), (318, 14, 380, 74)), 'kliniek-receptie')            # receptie met logo-wand
save(tile('g3', 0, 1), 'laser-gezicht')                               # laser op de kin
save(trim(tile('g1', 0, 0), top=.14), 'laser-behandeling')            # behandeling met bril
save(tile('g3', 1, 1), 'laser-arm')                                   # handstuk op de arm
save(trim(tile('g2', 2, 1), top=.14), 'ems')                          # EMS-apparaat
# resultaten (voor/na, zoals gepubliceerd door de kliniek)
save(trim(tile('g2', 0, 2), right=.04), 'resultaat-plasmalift-ogen')
save(trim(tile('g1', 1, 2), right=.05, top=.03), 'resultaat-plasmalift-oogleden')
save(trim(tile('g2', 2, 2), right=.04), 'resultaat-laser-baardlijn')
save(trim(tile('g2', 3, 2), right=.04), 'resultaat-laser-nek')
save(trim(tile('g3', 1, 2), right=.04), 'resultaat-laser-oksel')
save(tile('g2', 0, 0), 'resultaat-laser-oksel-2')
save(trim(tile('g2', 1, 2), right=.04), 'resultaat-huid-acne')
save(tile('g1', 1, 1), 'resultaat-huid-microneedling')
save(tile('g2', 2, 0), 'resultaat-lichaam')
save(story('11-story-plasmalift-info.jpg', (522, 1093, 902, 1766)), 'resultaat-plasmalift-voorhoofd')
save(story('12-story-plasmalift-resultaat.jpg', (58, 338, 726, 1118)), 'resultaat-plasmalift-collage')

# ── logo: zwarte letters uit de grijze cirkel → transparant masker ──────────
im = Image.open(SRC / '01-profiel.jpg').convert('L')
cx, cy, r = 136 * S, 357 * S, 96 * S                     # midden en straal van de grijze schijf
box = tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r))
disc = im.crop(box)
big = disc.resize((disc.width * 4, disc.height * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
# grijs (~185) → transparant, zwart (<60) → dekkend
alpha = big.point(lambda v: 255 if v < 70 else 0 if v > 150 else round(255 * (150 - v) / 80))
# schijf = grijze pixels, gaten (de letters) dichtgemaakt, rand iets ingekrompen,
# zodat de donkere ring rond de cirkel niet in het logo terechtkomt
grey = big.point(lambda v: 255 if 150 < v < 215 else 0)
gx0, gy0, gx1, gy1 = grey.getbbox()
inset = (gx1 - gx0) * .035
circle = Image.new('L', big.size, 0)
ImageDraw.Draw(circle).ellipse((gx0 + inset, gy0 + inset, gx1 - inset, gy1 - inset), fill=255)
alpha = Image.composite(alpha, Image.new('L', big.size, 0), circle)
bbox = alpha.getbbox()
alpha = alpha.crop((bbox[0] - 8, bbox[1] - 8, bbox[2] + 8, bbox[3] + 8))
logo = Image.new('RGBA', alpha.size, (0, 0, 0, 0))
logo.putalpha(alpha)
logo.save(OUT / 'logo.png', optimize=True)
print(f'logo.png {logo.size[0]}×{logo.size[1]}')

# touch-icoon en og-afbeelding
icon = Image.new('RGB', (180, 180), '#1d1714')
mark = Image.new('RGB', logo.size, '#d8bf98')
l = logo.copy(); l.thumbnail((150, 150), Image.LANCZOS)
m = mark.resize(l.size)
icon.paste(m, ((180 - l.width) // 2, (180 - l.height) // 2), l)
icon.save(OUT / 'apple-touch-icon.png')

og = Image.new('RGB', (1200, 630), '#f4eee6')
photo = Image.open(OUT / 'kliniek-receptie.webp').convert('RGB')
photo = ImageOps.fit(photo, (520, 630), Image.LANCZOS, centering=(.5, .45))
og.paste(photo, (680, 0))
l = logo.copy(); l.thumbnail((520, 520), Image.LANCZOS)
og.paste(Image.new('RGB', l.size, '#1d1714'), ((680 - l.width) // 2, (630 - l.height) // 2), l)
og.save(OUT / 'og-image.jpg', quality=88)
print('apple-touch-icon.png, og-image.jpg')
