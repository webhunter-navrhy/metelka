#!/usr/bin/env python3
"""Hero obrázky v6 do _v6/img (AVIF + WebP + JPG, cíl ≤150 KB):
   python3 tools/obr6.py <jmeno> <zdroj> <šířka> [výška pro ořez na poměr] [x_stred 0-1]"""
import io, sys
from pathlib import Path
from PIL import Image
R = Path(__file__).resolve().parent.parent / '_v6/img'
jm, src, w = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGB')
if len(sys.argv) > 4:  # ořez na poměr w:h kolem x_stred
    h = int(sys.argv[4]); xs = float(sys.argv[5]) if len(sys.argv) > 5 else .5
    r = w / h
    if im.width / im.height > r:
        cw = round(im.height * r); x0 = min(max(0, round(im.width * xs - cw / 2)), im.width - cw); im = im.crop((x0, 0, x0 + cw, im.height))
    else:
        ch = round(im.width / r); im = im.crop((0, im.height - ch, im.width, im.height))
im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
def uloz(fmt, ext, q):
    while True:
        b = io.BytesIO(); im.save(b, fmt, quality=q, **({'speed': 6} if fmt == 'AVIF' else {'method': 6} if fmt == 'WEBP' else {'optimize': True, 'progressive': True}))
        if b.tell() <= 150_000 or q <= 30: break
        q -= 5
    (R / f'{jm}.{ext}').write_bytes(b.getvalue()); return f'{ext} {b.tell() // 1024} kB q{q}'
print(jm, im.size, uloz('AVIF', 'avif', 62), uloz('WEBP', 'webp', 78), uloz('JPEG', 'jpg', 80))
