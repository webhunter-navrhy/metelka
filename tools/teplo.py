#!/usr/bin/env python3
"""Teplé barevné ladění fotek do zlaté hodiny webu (originály zůstávají v img/, výstup img/teple/).
python3 tools/teplo.py [síla=1.0] soubor.jpg ...   (bez souborů = všechny int-* a hk-*)"""
import glob, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
sila = 1.0
if args and args[0].replace('.', '', 1).isdigit():
    sila = float(args.pop(0))
soubory = args or sorted(glob.glob(os.path.join(ROOT, 'img', 'int-*.jpg')) + glob.glob(os.path.join(ROOT, 'img', 'hk-*.jpg')))

def tepla(im, s):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    L = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    # světla do medové, stíny do teplé hnědé (split toning), mírně méně modré
    svetla = np.array([1.0, 0.86, 0.62])
    stiny = np.array([0.30, 0.20, 0.12])
    w_sv = np.clip((L - 0.45) / 0.55, 0, 1) ** 1.2
    w_st = np.clip((0.55 - L) / 0.55, 0, 1) ** 1.5
    b = a.copy()
    b = b * (1 - 0.16 * s * w_sv) + svetla * 0.16 * s * w_sv * L / np.maximum(L, 1e-3) * a.mean(-1, keepdims=True) / np.maximum(L, 1e-3) * L
    b = b * (1 - 0.18 * s * w_st) + stiny * 0.18 * s * w_st
    b[..., 0] *= 1 + 0.035 * s
    b[..., 2] *= 1 - 0.08 * s
    # jemná sytost a kontrast
    m = b.mean(-1, keepdims=True)
    b = m + (b - m) * (1 + 0.06 * s)
    b = 0.5 + (b - 0.5) * (1 + 0.05 * s)
    return Image.fromarray((np.clip(b, 0, 1) * 255 + 0.5).astype(np.uint8))

for f in soubory:
    im = Image.open(f)
    out = os.path.join(ROOT, 'img', 'teple', os.path.basename(f))
    tepla(im, sila).save(out, quality=90)
    print(out)
