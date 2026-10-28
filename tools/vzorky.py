#!/usr/bin/env python3
"""Vzorky materiálů vzorového bytu (procedurálně, ne fotka): dub v rybí kosti, Egger Kašmír, Argenta Gravel Cream, černá matná.
python3 tools/vzorky.py -> img/vzorek-*.jpg (1200×1200)"""
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = 1200
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)

def sum_(sc, amp=1.0):
    n = rng.normal(0, 1, (N // sc + 2, N // sc + 2)).astype(np.float32)
    im = Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC)
    return (np.asarray(im).astype(np.float32) / 255 - .5) * amp

def svetlo(a, sila=.22):
    # zlatá hodina: světlo zleva nahoře, měkký pokles doprava dolů
    g = 1 + sila * (1 - (xx * .6 + yy * .4) / N * 1.6)
    return np.clip(a * g[..., None], 0, 1)

def uloz(a, jmeno):
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.6)).save(os.path.join(ROOT, 'img', jmeno), quality=88)

# dub v rybí kosti: lamely 4:1, rovná léta po délce, každá lamela jiný tón; skládá se schodovitě a otočí o 45°
def dub_rk():
    w = 64; L = 4 * w; M = 2400
    pl = Image.new('RGB', (M, M), (60, 40, 25))
    r = np.random.default_rng(3)
    def lamela(delka, sirka):
        t = r.uniform(.9, 1.03); tep = r.uniform(-.02, .025)
        y = np.arange(sirka, dtype=np.float32)[:, None]; x = np.arange(delka, dtype=np.float32)[None, :]
        faze = r.uniform(0, 6.28, 6); f = r.uniform(.15, .9, 6)
        leta = sum(np.sin(y * f[k] + faze[k] + .004 * x * r.uniform(-1, 1)) for k in range(6)) / 6
        dlouhe = np.sin(x * r.uniform(.003, .01) + r.uniform(0, 6.28)) * .04
        v = .9 + .07 * leta + dlouhe + r.normal(0, .012, (sirka, delka))
        c = np.array([.69 + tep, .50, .32 - tep]) * t
        a = np.clip(v[..., None] * c, 0, 1)
        a[:2, :] *= .55; a[:, :2] *= .55
        return Image.fromarray((a * 255).astype(np.uint8))
    tx, ty = L, -L
    for j in range(-12, 14):
        for i in range(-40, 50):
            ox, oy = i * w + j * tx, i * w + j * ty
            if -L < ox < M and -L < oy < M:
                pl.paste(lamela(L, w), (ox, oy))
                pl.paste(lamela(L, w).transpose(Image.ROTATE_90), (ox, oy + w))
    pl = pl.rotate(45, Image.BICUBIC).crop((M // 2 - N // 2, M // 2 - N // 2, M // 2 + N // 2, M // 2 + N // 2))
    return np.asarray(pl).astype(np.float32) / 255
uloz(svetlo(dub_rk()), 'vzorek-dub.jpg')

# Egger Kašmír: teplá šedobéžová, jemná struktura
kas = np.stack([.80, .75, .69])[None, None, :] + sum_(2, .035)[..., None] + sum_(60, .03)[..., None]
uloz(svetlo(kas, .18), 'vzorek-kasmir.jpg')

# Argenta Gravel Cream 60×60: krémový kámen s drobnými zrny, spáry po 600 px
kam = np.stack([.86, .81, .72])[None, None, :] + sum_(30, .05)[..., None] + sum_(4, .04)[..., None]
zrna = (rng.random((N, N)) > .996).astype(np.float32)
zrna = np.asarray(Image.fromarray((zrna * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))).astype(np.float32) / 255
kam = kam - zrna[..., None] * np.array([.22, .2, .17]) * rng.random((N, N))[..., None]
sp = ((np.mod(xx, 600) < 3) | (np.mod(yy, 600) < 3)).astype(np.float32)
kam = kam * (1 - .12 * sp[..., None])
uloz(svetlo(kam, .2), 'vzorek-dlazba.jpg')

# černá matná: hluboká teplá černá s odleskem
cer = np.stack([.085, .078, .072])[None, None, :] + sum_(2, .012)[..., None]
odl = np.exp(-(((xx - N * .3) / (N * .5)) ** 2 + ((yy - N * .25) / (N * .35)) ** 2))
cer = cer + odl[..., None] * np.array([.16, .12, .08])
uloz(cer, 'vzorek-cerna.jpg')
print('ok')
