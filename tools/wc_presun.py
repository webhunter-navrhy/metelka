"""Přesun WC v půdorysu vzorového bytu Metelka podle výkresu architekta.
WC jde k dveřím koupelny na stěnu ke kuchyni (místo skříně s pračkou),
pračka na původní místo WC u stěny k sousedům."""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
OX, OY = 780, 250  # posun výřezu koupelny v plném obrázku
a = np.array(im).astype(np.int16)


def P(x, y):
    return OX + x, OY + y


def floor_fill(x0, y0, x1, y1, sx0, sy0, sx1, sy1):
    """Vyplní obdélník dlažbou z čistého vzorku (zrcadlené dlaždění, bez švů)."""
    X0, Y0 = P(x0, y0); X1, Y1 = P(x1, y1)
    S = a[OY + sy0:OY + sy1, OX + sx0:OX + sx1].copy()
    sh, sw = S.shape[:2]
    for yy in range(Y0, Y1):
        ry = (yy - Y0) % (2 * sh); ry = ry if ry < sh else 2 * sh - 1 - ry
        for xx in range(X0, X1):
            rx = (xx - X0) % (2 * sw); rx = rx if rx < sw else 2 * sw - 1 - rx
            a[yy, xx] = S[ry, rx]


def copy_rows(x0, x1, y0, y1, sx0, sy0):
    """Spára dlažby: zkopíruje pruh řádků ze stejné výšky z čistého místa."""
    w = x1 - x0
    for i, xx in enumerate(range(x0, x1)):
        sx = sx0 + (i % 150)
        a[OY + y0:OY + y1, OX + xx] = a[OY + sy0:OY + sy0 + (y1 - y0), OX + sx]


# sprity (před mazáním)
toilet = im.crop((*P(66, 37), *P(153, 146)))
washer = im.crop((*P(326, 456), *P(452, 587)))
floor_ref = np.array(im.crop((*P(20, 480), *P(190, 590)))).reshape(-1, 3).mean(0)


def sprite_mask(sp, thr):
    """Maska předmětu podle odlišnosti od dlažby/podkladu."""
    s = np.array(sp).astype(np.int16)
    d = np.abs(s - floor_ref).sum(2)
    m = Image.fromarray(((d > thr) * 255).astype(np.uint8))
    return m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1))


# 1) skříň s pračkou + oblouk dvířek -> dlažba
orig = a.copy()
floor_fill(190, 451, 461, 591, 20, 480, 190, 590)
floor_fill(286, 443, 357, 451, 20, 480, 190, 590)
# okraj koberce zachovat: v pásu nad spárou vrátit světlé pixely koberce
for yy in range(OY + 443, OY + 472):
    for xx in range(OX + 186, OX + 290):
        if orig[yy, xx].sum() > 3 * 196:
            a[yy, xx] = orig[yy, xx]
copy_rows(190, 461, 474, 479, 20, 474)  # vodorovná spára dlažby

# 2) původní WC -> dlažba
floor_fill(64, 35, 156, 150, 20, 150, 200, 222)
copy_rows(64, 156, 118, 123, 156, 118)

out = Image.fromarray(a.clip(0, 255).astype(np.uint8))

# 3) WC zády ke stěně u kuchyně (pravá stěna x=461), u dveří
t = toilet.rotate(-90, expand=True)  # nádržka nahoře -> vpravo
tm = sprite_mask(toilet, 60).rotate(-90, expand=True)
tw, th = t.size
out.paste(t, (OX + 458 - tw, OY + 521 - th // 2), tm)

# 4) pračka na místo WC, čelem do koupelny
w = washer.rotate(90, expand=True)  # čelo vlevo -> dolů
wm = sprite_mask(washer, 70).rotate(90, expand=True)
ww, wh = w.size
out.paste(w, (OX + 110 - ww // 2, OY + 35), wm)

out.save(dst, quality=93)
print("ok", out.size)
