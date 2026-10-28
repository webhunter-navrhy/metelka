#!/usr/bin/env python3
"""Screenshoty hero variant: python3 tools/hero_foto.py a b c  (server :8766/metelka/) -> _srovnani/hero-<v>-{1440,390}.png"""
import asyncio, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_srovnani"); os.makedirs(OUT, exist_ok=True)
async def main(varianty):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for v in varianty:
            for w, h, dpr in ((1440, 900, 1), (390, 844, 2)):
                pg = await b.new_page(viewport={"width": w, "height": h}, device_scale_factor=dpr)
                err = []; pg.on("pageerror", lambda e: err.append(str(e)))
                await pg.goto(f"http://localhost:8766/metelka/hero-{v}/", wait_until="networkidle")
                await pg.wait_for_timeout(3600)
                sw = await pg.evaluate("document.documentElement.scrollWidth")
                cil = os.path.join(OUT, f"hero-{v}-{w}.png")
                # full_page v Chromiu nevykreslí část prvků s backdrop-filter -> skládám z výřezů viewportu
                H = await pg.evaluate("document.documentElement.scrollHeight")
                dily, y = [], 0
                while y < H:
                    await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(250)
                    sy = await pg.evaluate("window.scrollY")
                    t = cil + f".{len(dily)}.png"; await pg.screenshot(path=t); dily.append((sy, t)); y += h
                from PIL import Image
                out = Image.new("RGB", (w * dpr, H * dpr))
                for sy, t in dily:
                    out.paste(Image.open(t).convert("RGB"), (0, sy * dpr)); os.remove(t)
                out.save(cil)
                print(cil, "overflow" if sw > w else "ok", err[:2]); await pg.close()
        await b.close()
asyncio.run(main(sys.argv[1:] or ["a", "b", "c"]))
