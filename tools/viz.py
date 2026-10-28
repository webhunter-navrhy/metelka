#!/usr/bin/env python3
"""Podklad vizualizace exteriéru: python3 tools/viz.py <nazev> "<query>"  (server :8792 v kořeni projektu) -> _viz/<nazev>.png"""
import asyncio, os, sys, urllib.parse
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def main(n, qq):
    d = dict(urllib.parse.parse_qsl(qq)); os.makedirs(os.path.join(ROOT, '_viz'), exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': int(d.get('w', 1600)), 'height': int(d.get('h', 900))})
        err = []; pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
        await pg.goto('http://localhost:8792/tools/viz/index.html?' + qq)
        await pg.wait_for_function("document.title=='hotovo'", timeout=600000)
        cil = os.path.join(ROOT, '_viz', n + '.png')
        await pg.locator('#out').screenshot(path=cil); print(cil, err[:3])
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2]))
