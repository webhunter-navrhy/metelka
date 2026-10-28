#!/usr/bin/env python3
"""Výřez domu a stromů bez oblohy (pro název za domem): python3 tools/obloha.py <foto> <výstup.png> [max_y=0.62]"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

vstup, vystup = sys.argv[1], sys.argv[2]
max_y = float(sys.argv[3]) if len(sys.argv) > 3 else 0.62
im = Image.open(vstup).convert("RGB")
a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
L = 0.299 * r + 0.587 * g + 0.114 * b
sky = (L > 140) & (g <= np.maximum(r, b) + 4) & (b > 90)
h = sky.shape[0]
sky[int(h * max_y):] = False
sky = ndimage.binary_opening(sky, iterations=1)
lab, n = ndimage.label(sky)
horni = set(np.unique(lab[: max(3, h // 40)])) - {0}
sky = np.isin(lab, list(horni))
sky = ndimage.binary_fill_holes(sky | ~ndimage.binary_dilation(~sky, iterations=0) if False else sky)
# drobné díry v korunách (obloha prosvítá listím) nech jako oblohu, když jsou dost světlé
alpha = (~sky).astype(np.uint8) * 255
m = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.8))
out = im.convert("RGBA"); out.putalpha(m)
out.save(vystup, optimize=True)
print(vystup, "obloha %.1f %%" % (100 * sky.mean()))
