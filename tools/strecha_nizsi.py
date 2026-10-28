#!/usr/bin/env python3
"""Retuš vizualizace: AI udělala sedlovou střechu, projekt má nízké pultové střechy (+5,84 / +6,46).
Po sloupcích stlačí pás střechy (hřeben -> okap) na zlomek výšky a pozadí nad ním (stromy, nebe) roztáhne dolů.
python3 tools/strecha_nizsi.py <vstup> <výstup> [faktor=0.38] [--kontrola out.jpg]"""
import sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import median_filter

src, dst = sys.argv[1], sys.argv[2]
f = float(sys.argv[3]) if len(sys.argv) > 3 and not sys.argv[3].startswith("--") else 0.38
im = Image.open(src).convert("RGB"); a = np.asarray(im).astype(np.float32); H, W = a.shape[:2]
r, g, b = a[..., 0], a[..., 1], a[..., 2]; L = .299 * r + .587 * g + .114 * b
strecha = (b >= g - 1) & (L < 150)
# horní hrana domu (stejná lomená čára jako dum_maska.py)
body = [(0, 690), (180, 480), (1800, 743), (1958, 797)]
xs = np.array([p[0] for p in body], float); ys = np.array([p[1] for p in body], float)
top = np.full(W, np.nan)
for x in range(20, 1959):
    pred = np.interp(x, xs, ys); y0, y1 = int(pred - 45), int(pred + 45)
    sl = strecha[y0:y1 + 10, x].astype(int); run = np.convolve(sl, np.ones(10, int), "valid")[: y1 - y0]
    top[x] = y0 + int(np.argmax(run >= 9)) if (run >= 9).any() else pred
top[20:1959] = median_filter(top[20:1959], size=21)
k, q = np.polyfit(np.arange(260, 1780), top[260:1780], 1)   # rovný hřeben
top[220:1800] = k * np.arange(220, 1800) + q - 1
# okap: od hrany dolů první místo, kde střecha končí (6 px ne-střechy)
eave = np.full(W, np.nan)
for x in range(400, 1950):
    y = int(top[x]) + 4
    while y < H - 10 and strecha[y:y + 6, x].sum() >= 2: y += 1
    eave[x] = y
X = np.arange(420, 1930); Y = eave[420:1930]; keep = np.ones_like(X, bool)
for _ in range(6):
    kk, qq = np.polyfit(X[keep], Y[keep], 1); res = Y - (kk * X + qq); keep = np.abs(res) < max(3, 2 * np.std(res[keep]))
kk, qq = np.polyfit(X[keep], Y[keep], 1)
print("okap y = %.4f x + %.1f" % (kk, qq))
ye = np.full(W, np.nan)
ye[385:1960] = kk * np.arange(385, 1960) + qq + 3          # +3: i se žlabem
gl, gr = (35, 650.0), (385, ye[385])                         # základna štítu
ye[20:385] = np.interp(np.arange(20, 385), [gl[0], gr[0]], [gl[1], gr[1]])
out = a.copy(); Lb = 260
for x in range(20, 1960):
    t, e = top[x], ye[x]
    if not (e - t > 2): continue
    nt = e - f * (e - t)                                     # nová horní hrana
    col = a[:, x, :]
    # střecha [t, e] -> [nt, e]
    yy = np.arange(int(np.ceil(nt)), int(e) + 1)
    sy = t + (yy - nt) / (e - nt) * (e - t)
    out[yy, x, :] = np.stack([np.interp(sy, np.arange(H), col[:, c]) for c in range(3)], 1)
    # pozadí [t-Lb, t] -> [t-Lb, nt]
    yy = np.arange(int(t - Lb), int(np.ceil(nt)))
    sy = (t - Lb) + (yy - (t - Lb)) / (nt - (t - Lb)) * Lb
    out[yy, x, :] = np.stack([np.interp(sy, np.arange(H), col[:, c]) for c in range(3)], 1)
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dst)
nove = ye - f * (ye - top)
np.save(dst.rsplit(".", 1)[0] + "_hrana.npy", nove)
if "--kontrola" in sys.argv:
    k_out = sys.argv[sys.argv.index("--kontrola") + 1]
    c = im.copy(); d = ImageDraw.Draw(c)
    for x in range(20, 1960, 2):
        if not np.isnan(top[x]): d.point((x, top[x]), fill=(255, 0, 0))
        if not np.isnan(ye[x]): d.point((x, ye[x]), fill=(0, 255, 0))
    c.crop((0, 380, 2100, 900)).save(k_out, quality=85)
print(dst)
