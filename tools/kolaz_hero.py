#!/usr/bin/env python3
"""Koláž: předloha | hero 1440 | hero 390 -> _srovnani/kolaz-<v>.jpg
python3 tools/kolaz_hero.py <v> <předloha.jpg> [výřez předlohy 0-1, např. 0.45]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v, ref = sys.argv[1], sys.argv[2]
vyrez = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
H = 1100
r = Image.open(ref).convert("RGB"); r = r.crop((0, 0, r.width, int(r.height * vyrez)))
r = r.resize((round(r.width * H / r.height), H), Image.LANCZOS)
d = Image.open(os.path.join(ROOT, "_srovnani", f"hero-{v}-1440.png")).convert("RGB")
d = d.crop((0, 0, 1440, min(d.height, 1040))); d = d.resize((round(d.width * H / d.height), H), Image.LANCZOS)
m = Image.open(os.path.join(ROOT, "_srovnani", f"hero-{v}-390.png")).convert("RGB")
m = m.crop((0, 0, m.width, min(m.height, 1688 + 300))); m = m.resize((round(m.width * H / m.height), H), Image.LANCZOS)
g = 28; top = 64
W = r.width + d.width + m.width + 4 * g
out = Image.new("RGB", (W, H + top + g), "#e9e2d6")
x = g
dr = ImageDraw.Draw(out)
try: f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 26)
except Exception: f = ImageFont.load_default()
for im, t in ((r, "předloha: " + os.path.basename(ref)[:12]), (d, f"varianta {v.upper()} · 1440"), (m, "390")):
    out.paste(im, (x, top)); dr.text((x, 20), t, fill="#1c1915", font=f); x += im.width + g
cil = os.path.join(ROOT, "_srovnani", f"kolaz-{v}.jpg"); out.save(cil, quality=86); print(cil, out.size)
