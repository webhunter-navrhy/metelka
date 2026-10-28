#!/usr/bin/env python3
"""Vrstva jen s domem (střecha + fasáda + popředí), nad tím průhledno: název pak leží před stromy, ale za střechou.
python3 tools/dum_maska.py <foto> <výstup.png> "<x,y;x,y;...>" <horizont_y>
body = odhad obrysu střechy v pixelech (lomená čára), horizont_y = kde začíná trávník za koncem domu."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import median_filter

im = Image.open(sys.argv[1]).convert("RGB")
a = np.asarray(im).astype(np.int32)
H, W = a.shape[:2]
body = [tuple(map(float, p.split(","))) for p in sys.argv[3].split(";")]
hor = int(float(sys.argv[4]))
xs = np.array([p[0] for p in body]); ys = np.array([p[1] for p in body])
x0, x1 = int(xs.min()), int(xs.max())
hranice = np.full(W, hor, dtype=float)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
L = (299 * r + 587 * g + 114 * b) // 1000
strecha = (b >= g - 1) & (L < 150)
for x in range(x0, x1 + 1):
    pred = np.interp(x, xs, ys)
    y0, y1 = max(0, int(pred - 45)), min(H - 1, int(pred + 45))
    sl = strecha[y0:y1 + 10, x].astype(int)
    run = np.convolve(sl, np.ones(10, int), "valid")[: y1 - y0]
    ok = run >= 9
    idx = int(np.argmax(ok)) if ok.any() else None
    hranice[x] = y0 + idx if idx is not None else pred
hranice[x0:x1 + 1] = median_filter(hranice[x0:x1 + 1], size=21)
# rovný hřeben: mezi 2. a předposledním bodem proložit přímku (robustně), detekce tam zubatí
if len(body) >= 4:
    a0, a1 = int(body[1][0]) + 40, int(body[-2][0]) - 10
    X = np.arange(a0, a1); Y = hranice[a0:a1].copy(); keep = np.ones_like(X, bool)
    for _ in range(6):
        k, q = np.polyfit(X[keep], Y[keep], 1); res = Y - (k * X + q)
        keep = np.abs(res) < max(3.0, 2 * np.std(res[keep]))
    k, q = np.polyfit(X[keep], Y[keep], 1)
    b0 = int(body[1][0]); X2 = np.arange(b0, a1 + 10)
    hranice[b0:a1 + 10] = np.minimum(k * X2 + q, hranice[b0:a1 + 10] + 0) if False else k * X2 + q - 1
    print("hřeben y = %.4f x + %.1f, ponecháno %d/%d" % (k, q, keep.sum(), len(X)))
yy = np.arange(H)[:, None]
alpha = (yy >= hranice[None, :] - 0.5).astype(np.uint8) * 255
m = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(1.0))
out = im.convert("RGBA"); out.putalpha(m); out.save(sys.argv[2], optimize=True)
print(sys.argv[2])
