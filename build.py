#!/usr/bin/env python3
"""Build: _data/*.json + src/*.html (Jinja2) + img/ + static/ -> dist/

  python3 build.py            # sestaví dist/
  python3 build.py --serve    # + lokální server na http://localhost:8765/<base>

Co dělá sám: WebP + srcset 640/1280/1920, lazy u všech fotek kromě první na stránce, ?v=<hash obsahu> u CSS/JS,
noindex a robots.txt podle site.navrh, JSON-LD LocalBusiness ze site.json, og:image 1200x630, sitemap.xml, 404.html,
.nojekyll (+ CNAME u ostrého webu s doménou). Design si nedědí: styl a šablony píšeš ty.
"""
import datetime
import hashlib
import html
import json
import os
import re
import shutil
import sys

from markupsafe import Markup
from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, DATA, IMG, STATIC, DIST, CACHE = (os.path.join(ROOT, p) for p in ("src", "_data", "img", "static", "dist", ".cache/img"))
SIRKY = (640, 1280, 1920)
RASTER = (".jpg", ".jpeg", ".png", ".webp")


class BuildError(Exception):
    pass


def nacti_data():
    d = {}
    for f in sorted(os.listdir(DATA)):
        if f.endswith(".json"):
            with open(os.path.join(DATA, f), encoding="utf-8") as fh:
                d[f[:-5]] = json.load(fh)
    if "site" not in d:
        raise BuildError("chybí _data/site.json")
    return d


class Obrazky:
    """Převod do WebP + generování <img srcset>. Počítá fotky na stránce: první je eager."""

    def __init__(self, base):
        self.base = base
        self.pocet = 0
        self.info = {}
        os.makedirs(CACHE, exist_ok=True)

    def reset(self):
        self.pocet = 0

    def _zpracuj(self, nazev):
        if nazev in self.info:
            return self.info[nazev]
        zdroj = os.path.join(IMG, nazev)
        if not os.path.exists(zdroj):
            raise BuildError(f"obrázek img/{nazev} neexistuje")
        stem, ext = os.path.splitext(nazev)
        stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem)
        cil_dir = os.path.join(DIST, "img")
        os.makedirs(cil_dir, exist_ok=True)
        if ext.lower() not in RASTER:   # svg a ostatní se kopírují beze změny
            shutil.copy(zdroj, os.path.join(cil_dir, os.path.basename(nazev)))
            self.info[nazev] = {"raster": False, "src": f"img/{os.path.basename(nazev)}"}
            return self.info[nazev]
        h = hashlib.sha1(open(zdroj, "rb").read()).hexdigest()[:12]
        im = ImageOps.exif_transpose(Image.open(zdroj))
        im.load()
        w0, h0 = im.size
        sirky = sorted({w for w in SIRKY if w < w0} | {min(w0, SIRKY[-1])})
        varianty = []
        for w in sirky:
            vyska = round(h0 * w / w0)
            cache = os.path.join(CACHE, f"{h}-{w}.webp")
            if not os.path.exists(cache):
                r = im.resize((w, vyska), Image.LANCZOS) if w != w0 else im
                if r.mode not in ("RGB", "RGBA"):
                    r = r.convert("RGBA" if "A" in r.getbands() else "RGB")
                r.save(cache, "WEBP", quality=80, method=6)
            out = f"{stem}-{w}.webp"
            shutil.copy(cache, os.path.join(cil_dir, out))
            varianty.append((w, vyska, f"img/{out}"))
        self.info[nazev] = {"raster": True, "varianty": varianty}
        return self.info[nazev]

    def img(self, nazev, alt=None, sizes="100vw", cls="", eager=None, styl=""):
        if alt is None:
            raise BuildError(f"img('{nazev}'): chybí alt (pro dekorativní fotku alt='')")
        self.pocet += 1
        prvni = (self.pocet == 1) if eager is None else eager
        i = self._zpracuj(nazev)
        a = f' alt="{html.escape(alt, quote=True)}"'
        c = f' class="{cls}"' if cls else ""
        s = f' style="{styl}"' if styl else ""
        if not i["raster"]:
            return Markup(f'<img src="{self.base}{i["src"]}"{a}{c}{s} loading="{"eager" if prvni else "lazy"}" decoding="async">')
        w, h, nejv = i["varianty"][-1][0], i["varianty"][-1][1], i["varianty"][-1][2]
        srcset = ", ".join(f"{self.base}{p} {w_}w" for w_, _, p in i["varianty"])
        nacitani = 'loading="eager" fetchpriority="high"' if prvni else 'loading="lazy"'
        return Markup(f'<img src="{self.base}{nejv}" srcset="{srcset}" sizes="{sizes}" width="{w}" height="{h}"{a}{c}{s} '
                      f'{nacitani} decoding="async">')

    def _avif(self, nazev, q=52):
        """AVIF varianty (stejné šířky jako WebP) – jen pro obrázky, kde na tom záleží (hero)."""
        klic = ("avif", nazev)
        if klic in self.info:
            return self.info[klic]
        i = self._zpracuj(nazev)
        zdroj = os.path.join(IMG, nazev)
        h = hashlib.sha1(open(zdroj, "rb").read()).hexdigest()[:12]
        stem = re.sub(r"[^A-Za-z0-9._-]+", "-", os.path.splitext(nazev)[0])
        im = ImageOps.exif_transpose(Image.open(zdroj)); im.load()
        w0, h0 = im.size
        varianty = []
        for w, vyska, _ in i["varianty"]:
            cache = os.path.join(CACHE, f"{h}-{w}-q{q}.avif")
            if not os.path.exists(cache):
                r = im.resize((w, vyska), Image.LANCZOS) if w != w0 else im
                if r.mode not in ("RGB", "RGBA"):
                    r = r.convert("RGBA" if "A" in r.getbands() else "RGB")
                r.save(cache, "AVIF", quality=q, speed=4)
            out = f"{stem}-{w}.avif"
            shutil.copy(cache, os.path.join(DIST, "img", out))
            varianty.append((w, vyska, f"img/{out}"))
        self.info[klic] = varianty
        return varianty

    def zdroje(self, nazev, sizes="100vw", media="", avif=True, q=52):
        """<source> AVIF + WebP pro <picture> (s media pro mobilní výřez)."""
        i = self._zpracuj(nazev)
        w, h = i["varianty"][-1][0], i["varianty"][-1][1]
        m = f' media="{media}"' if media else ""
        out = []
        if avif:
            out.append(f'<source type="image/avif"{m} srcset="' + ", ".join(f"{self.base}{p} {w_}w" for w_, _, p in self._avif(nazev, q)) + f'" sizes="{sizes}" width="{w}" height="{h}">')
        if media:
            out.append(f'<source type="image/webp"{m} srcset="' + ", ".join(f"{self.base}{p} {w_}w" for w_, _, p in i["varianty"]) + f'" sizes="{sizes}" width="{w}" height="{h}">')
        return Markup("".join(out))

    def img_url(self, nazev, w=1280):
        i = self._zpracuj(nazev)
        if not i["raster"]:
            return self.base + i["src"]
        best = min(i["varianty"], key=lambda v: abs(v[0] - w))
        return self.base + best[2]

    def og(self, nazev):
        zdroj = os.path.join(IMG, nazev)
        if not os.path.exists(zdroj):
            return None
        im = ImageOps.fit(ImageOps.exif_transpose(Image.open(zdroj)).convert("RGB"), (1200, 630), Image.LANCZOS)
        im.save(os.path.join(DIST, "og.jpg"), quality=84, optimize=True)
        return "og.jpg"


def nbsp(html):
    """Nezlomitelná mezera po jednopísmenných předložkách a spojkách (mimo tagy, script, style)."""
    casti = re.split(r'(<script.*?</script>|<style.*?</style>|<[^>]+>)', html, flags=re.S)
    for i, c in enumerate(casti):
        if i % 2 == 0 and c:
            c = re.sub(r'(?<![\w&;])([kKsSvVzZoOuUaAiI]) (?=\S)', '\\1\u00a0', c)
            c = re.sub(r'(\d) (?=\d{3}\b)', '\\1\u00a0', c)
            casti[i] = re.sub(r'(\d) (?=(°C|m²|mm|Kč|min|km|mil\.|%|m\b|×))', '\\1\u00a0', c)
    return ''.join(casti)


def hash_souboru(cesta):
    return hashlib.sha1(open(cesta, "rb").read()).hexdigest()[:10]


def jsonld(site):
    k = site.get("kontakt", {})
    a = k.get("adresa", {})
    j = {"@context": "https://schema.org", "@type": site.get("typ") or "LocalBusiness", "name": site["nazev"],
         "url": site["url"], "description": site.get("popis", "")}
    if k.get("telefon"): j["telephone"] = k["telefon"]
    if k.get("email"): j["email"] = k["email"]
    if any(a.get(x) for x in ("ulice", "psc", "mesto")):
        adr = {"@type": "PostalAddress", "streetAddress": a.get("ulice"), "postalCode": a.get("psc"),
               "addressLocality": a.get("mesto"), "addressCountry": a.get("zeme") or "CZ"}
        j["address"] = {k: v for k, v in adr.items() if v}
    if site.get("oteviraci_doba"): j["openingHours"] = site["oteviraci_doba"]
    if site.get("sameas"): j["sameAs"] = site["sameas"]
    if site.get("cenove_rozpeti"): j["priceRange"] = site["cenove_rozpeti"]
    if site.get("ico"): j["taxID"] = site["ico"]
    if site.get("logo"): j["logo"] = site["url"] + site["logo"]
    j["image"] = site["url"] + "og.jpg"
    return json.dumps(j, ensure_ascii=False).replace("</", "<\\/")


def cz(n, des=2):
    t = f"{n:,.{des}f}".replace(",", " ").replace(".", ",")
    return t


def m2(n):
    """47.21 -> 47,21 · 52.0 -> 52 · 7.8 -> 7,8"""
    t = cz(n, 2)
    if "," in t:
        t = t.rstrip("0").rstrip(",")
    return t


def obohat_byty(data):
    """Doplní k bytům cestu, kód a sousedy pro karty bytů."""
    if "byty" not in data:
        return
    rim = ["I", "II", "III"]
    vsechny = []
    for i, dum in enumerate(data["byty"]["domy"]):
        dum["slug"] = "k-metelce-" + rim[i].lower()
        dum["rim"] = rim[i]
        dum["index"] = i
        for b in dum["byty"]:
            b["slug"] = f"byt-{b['cislo']:02d}"
            b["cesta"] = f"byty/{dum['slug']}/{b['slug']}/"
            b["kod"] = f"{rim[i]}.{b['cislo']:02d}"
            b["dum_nazev"] = dum["nazev"]
            b["dum_slug"] = dum["slug"]
            b["pozice"] = (b["cislo"] - 1) % 8 + 1
            b["krajni"] = b["pozice"] in (1, 8)
            b["patro_text"] = "přízemí" if b["podlazi"] == "prizemi" else "patro"
            b["cena_text"] = cz(b["cena"], 0) + " Kč"
            b["cena_m2_text"] = cz(b["cena_m2"], 0) + " Kč"
            vsechny.append(b)
    for j, b in enumerate(vsechny):
        b["predchozi"] = {k: vsechny[j - 1][k] for k in ("cesta", "kod", "cislo", "dum_nazev")} if j > 0 else None
        b["dalsi"] = {k: vsechny[j + 1][k] for k in ("cesta", "kod", "cislo", "dum_nazev")} if j + 1 < len(vsechny) else None
        podobne = [x for x in vsechny if x is not b and x["podlazi"] == b["podlazi"]]
        podobne.sort(key=lambda x: (x["dum_slug"] != b["dum_slug"], abs(x["cislo"] - b["cislo"])))
        b["podobne"] = [{k: x[k] for k in ("cesta", "kod", "cislo", "dum_nazev", "plocha", "venku", "venku_typ", "cena_text", "patro_text")} for x in podobne[:3]]
    data["byty"]["vsechny"] = vsechny
    data["byty"]["js"] = {"domy": [{"nazev": d["nazev"], "byty": [
        {"c": b["cislo"], "kod": b["kod"], "podlazi": b["podlazi"], "patro": b["patro_text"], "plocha": m2(b["plocha"]) + " m²",
         "venku": m2(b["venku"]) + " m²", "venku_typ": b["venku_typ"].capitalize(), "kobka": m2(b["kobka"]) + " m²",
         "cena": b["cena_text"], "cena_m2": b["cena_m2_text"], "cesta": b["cesta"], "pozice": b["pozice"]} for b in d["byty"]]}
        for d in data["byty"]["domy"]]}


def main():
    data = nacti_data()
    site = data["site"]
    obohat_byty(data)
    base = site.get("base", "/")
    if not base.startswith("/") or not base.endswith("/"):
        raise BuildError("site.base musí začínat a končit lomítkem (např. /slug/ nebo /)")
    if not site["url"].endswith("/"):
        site["url"] += "/"
    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)
    obr = Obrazky(base)

    # statické soubory + hash obsahu pro cache busting
    shutil.copytree(STATIC, DIST, dirs_exist_ok=True)
    hashe = {}

    def asset(p):
        cil = os.path.join(DIST, p)
        if not os.path.exists(cil):
            raise BuildError(f"asset {p} neexistuje (static/{p})")
        if p not in hashe:
            hashe[p] = hash_souboru(cil)
        return f"{base}{p}?v={hashe[p]}"

    og = obr.og(site["og_image"]) if site.get("og_image") else None
    if not og:
        print("VAROVÁNÍ: chybí og_image (site.og_image -> soubor v img/)")
    og_url = site["url"] + og if og else None

    def url(cesta):
        cesta = cesta.strip("/")
        return base + (cesta + "/" if cesta else "")

    env = Environment(loader=FileSystemLoader(SRC), autoescape=select_autoescape(["html"]), undefined=StrictUndefined)
    env.globals.update(site=site, data=data, base=base, asset=asset, url=url, img=obr.img, img_url=obr.img_url, zdroje=obr.zdroje,
                       og_url=og_url, jsonld=jsonld(site), titulek="", popis="", cesta="", noindex=False, cz=cz, m2=m2, prekryv=False, aktivni="", bez_cta=False)
    stranky = []
    for f in sorted(os.listdir(SRC)):
        if not f.endswith(".html") or f.startswith("_"):
            continue
        jmeno = f[:-5]
        obr.reset()
        tpl = env.get_template(f)
        kod = nbsp(tpl.render())
        if jmeno == "404":
            vystup = os.path.join(DIST, "404.html")
        elif jmeno == "index":
            vystup = os.path.join(DIST, "index.html")
            stranky.append("")
        else:
            os.makedirs(os.path.join(DIST, jmeno), exist_ok=True)
            vystup = os.path.join(DIST, jmeno, "index.html")
            stranky.append(jmeno + "/")
        with open(vystup, "w", encoding="utf-8") as fh:
            fh.write(kod)

    # karty bytů: src/_byt.html -> byty/<dum>/byt-NN/
    tpl = env.get_template("_byt.html")
    for dum in data["byty"]["domy"]:
        for b in dum["byty"]:
            obr.reset()
            kod = nbsp(tpl.render(byt=b, dum=dum, cesta=b["cesta"]))
            os.makedirs(os.path.join(DIST, b["cesta"]), exist_ok=True)
            with open(os.path.join(DIST, b["cesta"], "index.html"), "w", encoding="utf-8") as fh:
                fh.write(kod)
            stranky.append(b["cesta"])

    # robots, sitemap, CNAME
    navrh = bool(site.get("navrh"))
    with open(os.path.join(DIST, "robots.txt"), "w") as fh:
        if navrh:
            fh.write("User-agent: *\nDisallow: /\n")
        else:
            fh.write(f"User-agent: *\nAllow: /\n\nSitemap: {site['url']}sitemap.xml\n")
    dnes = datetime.date.today().isoformat()
    with open(os.path.join(DIST, "sitemap.xml"), "w", encoding="utf-8") as fh:
        fh.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for s in stranky:
            fh.write(f"  <url><loc>{site['url']}{s}</loc><lastmod>{dnes}</lastmod></url>\n")
        fh.write("</urlset>\n")
    open(os.path.join(DIST, ".nojekyll"), "w").close()
    if site.get("domena") and not navrh:
        open(os.path.join(DIST, "CNAME"), "w").write(site["domena"] + "\n")

    print(f"OK: {len(stranky)} stránek, {len(obr.info)} obrázků -> dist/ ({'NÁVRH, noindex' if navrh else 'OSTRÝ WEB, indexovatelný'})")


if __name__ == "__main__":
    try:
        main()
    except BuildError as e:
        sys.exit(f"CHYBA buildu: {e}")
    if "--serve" in sys.argv:
        import functools, http.server, socketserver
        os.chdir(DIST)
        print("http://localhost:8765" + json.load(open(os.path.join(DATA, "site.json")))["base"] + "  (Ctrl+C = konec; base řeš prefixem)")
        socketserver.TCPServer.allow_reuse_address = True
        socketserver.TCPServer(("", 8765), http.server.SimpleHTTPRequestHandler).serve_forever()
