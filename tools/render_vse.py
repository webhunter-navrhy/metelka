#!/usr/bin/env python3
"""Offline rendery makety (headless Chromium + three.js, GTAO, měkké stíny akumulací).
   python3 tools/render_vse.py [jen_nazev]   -> img/model-*.png + _data/model.json (kotvy popisků)
   Potřebuje: python3 -m http.server 8792 v kořeni projektu, tools/render/jsm -> three/examples/jsm."""
import asyncio, json, os, sys, urllib.parse
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUN = "-40,26,14"
POZ = "page=efe9df&alpha=1&soft=3&ex=0.95&sun=" + SUN
L, W = 42.856, 42.856 / 8
R = {
  "model-hero": f"w=2400&h=1250&s=64&pos=-38,31,49&t=0.5,-1,3.5&fov=24&vyber=12",
  "model-hero-otevreny": f"w=2400&h=1250&s=64&pos=-38,31,49&t=0.5,-1,3.5&fov=24&vyber=12&rezim=patro",
  "model-hero-maska": f"w=2400&h=1250&s=1&pos=-38,31,49&t=0.5,-1,3.5&fov=24&maska=1&ao=0",
  "model-hero-mobil-maska": f"w=1080&h=1150&s=1&pos=-55,63,44&t=-3,0,2&fov=32&maska=1&ao=0",
  "model-vyber": f"w=2400&h=1200&s=64&pos=-47.1,40.6,64.5&t=2.9,-1,5.3&fov=24",
  "model-vyber-mobil": f"w=1080&h=1280&s=64&pos=-54,64,40&t=-6,0,2&fov=32",
  "model-hero-mobil": f"w=1080&h=1150&s=64&pos=-55,63,44&t=-3,0,2&fov=32&vyber=12",
  "model-hero-mobil-otevreny": f"w=1080&h=1150&s=64&pos=-55,63,44&t=-3,0,2&fov=32&vyber=12&rezim=patro",
  "model-sever": f"w=1800&h=1100&s=48&pos=-30,17,-42&t=-2,2.6,0&fov=28&sun=14,52,-30",
  "model-rez-prizemi": f"w=1800&h=1100&s=48&pos=-14,34,24&t=-6,0,1&fov=32&rezim=prizemi&vyber=3",
  "model-rez-patro": f"w=1800&h=1100&s=48&pos=-14,36,24&t=-6,2.8,1&fov=32&rezim=patro&vyber=12",
  "model-byt-detail": f"w=1600&h=1200&s=48&pos=-19,19,15&t=-10.7,0,0&fov=30&rezim=prizemi&vyber=3",
}
for c in range(1, 17):
    R[f"model-poloha-{c:02d}"] = f"w=1600&h=900&s=32&pos=-3,22,64&t=0,1.4,3&fov=27&vyber={c}"

for c in range(1, 17):   # řez podlažím kolem konkrétního bytu (karta bytu)
    poz = (c - 1) % 8 + 1
    x = -L / 2 + (poz - 0.5) * W
    y0 = 0 if c <= 8 else 2.85
    rez = "prizemi" if c <= 8 else "patro"
    R[f"model-byt-{c:02d}"] = f"w=1600&h=1100&s=32&pos={x - 8:.2f},{y0 + 19:.2f},16&t={x - 1.2:.2f},{y0:.2f},0.5&fov=30&rezim={rez}&vyber={c}"

async def main():
    jen = sys.argv[1:]
    out = {}
    mf = os.path.join(ROOT, "_data", "model.json")
    if os.path.exists(mf): out = json.load(open(mf))
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'])
        for n, q in R.items():
            if jen and not any(n.startswith(j) for j in jen): continue
            qq = POZ + "&" + q
            d = dict(urllib.parse.parse_qsl(qq))
            pg = await b.new_page(viewport={'width': int(d['w']), 'height': int(d['h'])})
            err = []
            pg.on('pageerror', lambda e: err.append(str(e)))
            await pg.goto('http://localhost:8792/tools/render/index.html?' + qq)
            await pg.wait_for_function("document.title=='hotovo'", timeout=600000)
            cil = os.path.join(ROOT, "img", n + ".png")
            await pg.locator('#out').screenshot(path=cil)
            if n.startswith("model-poloha"):   # ořez prázdného stolu nad a pod domem
                from PIL import Image
                Image.open(cil).crop((40, 190, 1560, 860)).save(cil)
            out[n] = {"kotvy": await pg.evaluate("window.__kotvy"), "w": int(d['w']), "h": int(d['h'])}
            print(n, 'chyby' if err else 'ok', err[:2])
            await pg.close()
        await b.close()
    json.dump(out, open(mf, "w"), ensure_ascii=False, indent=1)
    vika()

def vika():
    """Víko makety pro úvod: pixely, které se mezi zavřeným a otevřeným modelem liší (střecha + horní část patra), s alfou."""
    from PIL import Image, ImageChops, ImageFilter
    for a, b in (("model-hero", "model-hero-otevreny"), ("model-hero-mobil", "model-hero-mobil-otevreny")):  # b jen pro kontrolu existence
        pa, pb = os.path.join(ROOT, "img", a + ".png"), os.path.join(ROOT, "img", b + ".png")
        if not (os.path.exists(pa) and os.path.exists(pb)): continue
        A = Image.open(pa).convert("RGB")
        d = Image.open(os.path.join(ROOT, "img", a + "-maska.png")).convert("L").filter(ImageFilter.GaussianBlur(0.7))
        L = A.copy(); L.putalpha(d)
        L.save(os.path.join(ROOT, "img", a + "-vika.png"))
        print(a + "-vika", "ok")
if __name__ == '__main__':
    if sys.argv[1:] == ['vika']: vika()
    else: asyncio.run(main())
