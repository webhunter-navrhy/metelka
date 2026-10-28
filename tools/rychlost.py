#!/usr/bin/env python3
"""LCP / FCP / přenesená data na ostrém webu se škrcením Fast 4G (DevTools preset: 9 Mb/s dolů, 1,5 Mb/s nahoru, 165 ms RTT).
python3 tools/rychlost.py [base] [cesta ...]   Mobil 390×844 DPR 2 + CPU 4×, PC 1440×900. Bez cache, každé měření 2× a medián (horší z dvou)."""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = "https://webhunter-navrhy.github.io/metelka/"
STRANKY = ["", "byty/", "byty/k-metelce-i/byt-12/", "standardy/", "lokalita/"]
JS = """() => new Promise(res => {
  let lcp = 0, el = '';
  new PerformanceObserver(l => { for (const e of l.getEntries()) { lcp = e.startTime; el = (e.element && (e.element.currentSrc || e.element.tagName)) || e.url; } }).observe({ type: 'largest-contentful-paint', buffered: true });
  setTimeout(() => {
    const fcp = (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || 0;
    const kb = performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0) + (performance.getEntriesByType('navigation')[0].transferSize || 0);
    res({ lcp: Math.round(lcp), fcp: Math.round(fcp), kb: Math.round(kb / 1024), el: String(el).split('/').pop() });
  }, 600);
})"""
async def mer(b, url, mobil):
    ctx = await b.new_context(viewport={"width": 390, "height": 844} if mobil else {"width": 1440, "height": 900}, device_scale_factor=2 if mobil else 1, is_mobile=mobil, has_touch=mobil)
    pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg)
    await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
    await cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 165, "downloadThroughput": 9e6 / 8 * .9, "uploadThroughput": 1.5e6 / 8 * .9})
    if mobil: await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
    await pg.goto(url + ("&" if "?" in url else "?") + "r=" + str(id(pg)), wait_until="load", timeout=90000)
    await pg.wait_for_timeout(1500)
    r = await pg.evaluate(JS); await ctx.close(); return r
async def main(base, stranky):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for s in stranky:
            for mobil in (True, False):
                v = [await mer(b, base + s, mobil) for _ in range(2)]
                v.sort(key=lambda x: x["lcp"]); r = v[-1]
                print(f"{('/' + s):28s} {'mobil' if mobil else 'PC   '}  LCP {r['lcp']/1000:.2f} s  FCP {r['fcp']/1000:.2f} s  {r['kb']} kB  ({r['el']})  [lepší běh LCP {v[0]['lcp']/1000:.2f} s]")
        await b.close()
a = sys.argv[1:]
base = a.pop(0) if a and a[0].startswith("http") else BASE
asyncio.run(main(base, a or STRANKY))
