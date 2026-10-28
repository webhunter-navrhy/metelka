#!/usr/bin/env python3
"""Screenshoty stránek: python3 tools/stranky_foto.py [base_url] [cesta ...] -> _srovnani/s-<jmeno>-{1440,390}[-cela].png
Výchozí base http://localhost:8766/metelka/. Celá stránka se skládá z výřezů viewportu (full_page v Chromiu nekreslí backdrop-filter)."""
import asyncio, os, sys
from playwright.async_api import async_playwright
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_srovnani"); os.makedirs(OUT, exist_ok=True)
STRANKY = ["", "byty/", "byty/k-metelce-i/byt-12/", "standardy/", "lokalita/", "praha-nebo-hradec/", "galerie/", "kontakt/"]
KONTROLA = """() => {
  const w = innerWidth, sire = [];
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect();
    if (r.width && (r.right > w + 1 || r.left < -1) && !e.closest('.vb-fasada,.rez-obal,.kb-fasada,.ha,.panel,.sr')) sire.push(e.tagName + '.' + [...e.classList].join('.'));
  }
  const j = document.querySelector('.ha-jmeno'); let jm = null;
  if (j) { const r = document.createRange(); r.selectNodeContents(j); const b = r.getBoundingClientRect(); jm = [Math.round(b.left), Math.round(b.right), w]; }
  return { sw: document.documentElement.scrollWidth, sire: [...new Set(sire)].slice(0, 8), jmeno: jm };
}"""
async def main(base, stranky):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for s in stranky:
            jm = (s.strip("/").replace("/", "-") or "uvod")
            for w, h, dpr in ((1440, 900, 1), (390, 844, 2)):
                pg = await b.new_page(viewport={"width": w, "height": h}, device_scale_factor=dpr)
                err = []; pg.on("pageerror", lambda e: err.append(str(e)))
                pg.on("console", lambda m: err.append(m.text) if m.type == "error" else None)
                await pg.goto(base + s, wait_until="networkidle"); await pg.wait_for_timeout(2600)
                k = await pg.evaluate(KONTROLA)
                await pg.screenshot(path=os.path.join(OUT, f"s-{jm}-{w}.png"))
                await pg.evaluate("document.querySelectorAll('.odhal').forEach(e=>e.classList.add('videt'))")
                H = await pg.evaluate("document.documentElement.scrollHeight")
                dily, y = [], 0
                while y < H:
                    await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(350)
                    if y: await pg.evaluate("document.querySelector('[data-hl]').style.visibility='hidden'")
                    sy = await pg.evaluate("window.scrollY")
                    t = os.path.join(OUT, f"_t{len(dily)}.png"); await pg.screenshot(path=t); dily.append((sy, t)); y += h
                out = Image.new("RGB", (w * dpr, H * dpr))
                for sy, t in dily:
                    out.paste(Image.open(t).convert("RGB"), (0, sy * dpr)); os.remove(t)
                if dpr > 1: out = out.resize((w, H))
                out.save(os.path.join(OUT, f"s-{jm}-{w}-cela.png"))
                print(jm, w, "H", H, "sw", k["sw"], "siroke", k["sire"], "jmeno", k["jmeno"], "chyby", err[:3])
                await pg.close()
        await b.close()
a = sys.argv[1:]
base = a.pop(0) if a and a[0].startswith("http") else "http://localhost:8766/metelka/"
asyncio.run(main(base, a or STRANKY))
