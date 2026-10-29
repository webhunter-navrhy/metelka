#!/usr/bin/env python3
"""Headless snímek: python3 tools/shot.py <url> <out.png> [šířka] [výška] [--full]"""
import asyncio, sys
from playwright.async_api import async_playwright
async def main(url, out, w=1440, h=900, full=False):
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.goto(url, wait_until='networkidle'); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(400)
        await pg.screenshot(path=out, full_page=full); print(out, err[:3]); await b.close()
a = sys.argv[1:]; full = '--full' in a; a = [x for x in a if x != '--full']
asyncio.run(main(a[0], a[1], int(a[2]) if len(a) > 2 else 1440, int(a[3]) if len(a) > 3 else 900, full))
