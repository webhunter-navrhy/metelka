#!/usr/bin/env python3
"""Koláž varianty hero vedle pinů: python3 tools/kolaz6.py a b c  -> _v6/kolaz-<v>.jpg"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
R = Path(__file__).resolve().parent.parent
V = Path.home() / 'rafadev-ops/reference/vkus/super'
PINY = ['42d167adea07aacdbbcbf2c06aeca6ae.jpg', '1cff1cf05d3a2e0d1459d950b57fd550.jpg', '153367a97709e2e0107db95d0ee3cbce.jpg', 'c9ec368eb06dba19214f9c73892bfb6f.jpg']
H, G = 900, 24
try: F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 26)
except Exception: F = ImageFont.load_default()
def vyska(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
for v in sys.argv[1:]:
    hore = [vyska(Image.open(R / f'_v6/{v}-1440.png').convert('RGB'), H), vyska(Image.open(R / f'_v6/{v}-390.png').convert('RGB'), H)]
    dole = [vyska(Image.open(V / p).convert('RGB'), H) for p in PINY]
    w = max(sum(i.width for i in hore), sum(i.width for i in dole)) + G * 5
    k = Image.new('RGB', (w, 2 * H + 3 * G + 60), '#ffffff'); d = ImageDraw.Draw(k)
    d.text((G, 12), f'Metelka v6 – varianta {v.upper()} (1440 + 390)   |   dole piny: Leon Home, RANTY, NORTH/FORM, Bravik', fill='#555', font=F)
    x = G
    for i in hore: k.paste(i, (x, 60)); x += i.width + G
    x = G
    for i in dole: k.paste(i, (x, 60 + H + G)); x += i.width + G
    k.thumbnail((3000, 3000)); k.save(R / f'_v6/kolaz-{v}.jpg', quality=84); print(R / f'_v6/kolaz-{v}.jpg', k.size)
