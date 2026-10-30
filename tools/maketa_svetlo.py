#!/usr/bin/env python3
"""Maketa na stránce Byty: teplé boční světlo, hlubší stíny, tmavší okna, světlejší pozadí.
   Geometrie zůstává (pozice bytů v _v6k.html sedí): python3 tools/maketa_svetlo.py"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
R = Path(__file__).resolve().parent.parent
im = Image.open(R / 'tools/maketa-fasada-orig.jpg').convert('RGB')
a = np.asarray(im).astype(np.float32) / 255
h, w, _ = a.shape
L = a @ np.array([.299, .587, .114], np.float32)

# pozadí: barva stolu/oblohy spojená s okrajem obrázku
c = im.copy()
for p in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (5, h // 2), (w - 5, h // 2), (w // 4, h - 1), (3 * w // 4, h - 1), (w // 4, 0), (3 * w // 4, 0)]:
    if c.getpixel(p) != (255, 0, 255): ImageDraw.floodfill(c, p, (255, 0, 255), thresh=16)
mm = (np.asarray(c) == [255, 0, 255]).all(2)
o = np.asarray(im).astype(np.int16)
strecha = (o[..., 0] >= 235) & (o[..., 1] >= 223)   # první světlá plocha shora = střecha nebo zeď
for xx in range(w):   # vše nad hranou střechy je pozadí
    ys = np.flatnonzero(strecha[:, xx])
    if len(ys) and ys[0] < 200: mm[:max(ys[0] - 1, 0), xx] = True
mm[:84] = True   # pruh hrany stolu nad střechou
m = Image.fromarray((mm * 255).astype(np.uint8))
pozadi = np.asarray(m.filter(ImageFilter.GaussianBlur(3))).astype(np.float32)[..., None] / 255

# okna a zábradlí: tmavé pixely ztmavit a ochladit do bronzové
okno = np.clip((.62 - L) / .2, 0, 1)
okno[:140] = 0; okno[408:] = 0   # jen pás oken, ne stinné boky zídek
okno = okno[..., None]
tmave = a * .5 + np.array([-.02, -.025, -.03], np.float32)
a = a * (1 - okno) + np.clip(tmave, 0, 1) * okno

# kontrast světlých ploch: zdi světlejší, stíny hlubší (S-křivka kolem 0.86)
L2 = a @ np.array([.299, .587, .114], np.float32)
k = np.where(L2 > .6, .86 + (L2 - .86) * 1.5, L2)
k = np.clip(k, 0, 1)
zisk = (k / np.maximum(L2, 1e-3)).astype(np.float32)
from scipy.ndimage import gaussian_filter
zisk = gaussian_filter(zisk, 2)
a = np.clip(a * zisk[..., None], 0, 1)

# teplé boční světlo zleva, zprava jemně do stínu
x = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
teplo = np.array([1.035, 1.0, .94], np.float32)
a = a * (teplo * (1 - x) + np.array([.975, .975, .985], np.float32) * x)
a = np.clip(a, 0, 1)

# pozadí o tón světlejší, jemný gradient do písku
y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
horni, dolni = np.array([250, 246, 239], np.float32) / 255, np.array([238, 228, 212], np.float32) / 255
cil = horni * (1 - y) + dolni * y
a = a * (1 - pozadi) + cil * pozadi

Image.fromarray((a * 255).round().astype(np.uint8)).save(R / 'img/v6/maketa-fasada.jpg', quality=90)
print('ok', w, h, 'pozadí', round(float(pozadi.mean()), 2))
