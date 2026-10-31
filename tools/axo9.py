#!/usr/bin/env python3
"""Varianta B: axonometrie domu K Metelce tenkou linkou + řez domem -> src/koncepty/_axo.html, _rez9.html

Geometrie podle řezu (BYTOVÉ DOMY ŘEZ.pdf) a půdorysu: hloubka domu 11 m, 8 bytů vedle sebe (šířka bytu ~5,2 m
dopočtená z plochy 47,21 m² a hloubky), přízemí + patro, dvě pultové střechy s uskočeným hřebenem nad střední zdí
(strana zahrádek +5,84, strana pavlače +6,46).
Okapy, tloušťka desky a předsazení balkonu jsou odhad pro kresbu – kresba je označená jako zjednodušená.
Pohled: frontální kosoúhlá axonometrie, fasáda do zahrádek v pravé velikosti, štít vlevo (byty 8 a 16).
"""
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "koncepty")
S = 27.0                 # px na metr
W = 5.2                  # šířka jednoho bytu
N = 8
L = N * W
D = 11.0                 # hloubka domu
Z1 = 2.85                # podlaha patra (2 500 + strop 310 + podlaha)
ZE = 4.85                # okap u zahrádek
ZH = 6.46                # vyšší hřeben (střecha k pavlači)
ZL = 5.84                # nižší hřeben (střecha k zahrádkám)
YS = 5.2                 # střední zeď, kde se střechy potkávají (od zahrádek)
ZB = 5.32                # okap u pavlače
EY = (-0.34, -0.62)      # směr hloubky na obrazovce (doleva nahoru, pohled shora, je vidět štít vlevo)
GY = 9.6                 # hloubka zahrádek (52–55 m² / 5,2 m ≈ 10 m)
OX, OY = 250.0, 300.0    # počátek: levý dolní roh fasády do zahrádek


def P(x, y, z):
    """x podél domu, y do hloubky (0 = fasáda do zahrádek, záporné = zahrádky), z výška."""
    return (OX + x * S + y * S * EY[0], OY - z * S + y * S * EY[1])


def pts(*body):
    return " ".join(f"{a:.1f},{b:.1f}" for a, b in (P(*q) for q in body))


def line(a, b, cls):
    (x1, y1), (x2, y2) = P(*a), P(*b)
    return f'<path class="{cls}" d="M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}"/>'


def poly(cls, *body):
    return f'<polygon class="{cls}" points="{pts(*body)}"/>'


def axo():
    g = []
    # terén a zahrádky (před domem)
    g.append(poly("x-teren", (-1.5, -GY - 1.2, 0), (L + 1.5, -GY - 1.2, 0), (L + 1.5, D + 1.0, 0), (-1.5, D + 1.0, 0)))
    for i in range(N + 1):
        g.append(line((i * W, 0, 0), (i * W, -GY, 0), "x-plot"))
    g.append(line((0, -GY, 0), (L, -GY, 0), "x-plot"))
    # štít (vlevo, x = 0): obrys řezu
    g.append(poly("x-stit", (0, 0, 0), (0, D, 0), (0, D, ZB), (0, YS, ZH), (0, YS, ZL), (0, 0, ZE)))
    # zadní (vyšší) střecha k pavlači – z tohoto úhlu jen pruh za hřebenem
    g.append(poly("x-strecha x-zadni", (0, YS, ZH), (L, YS, ZH), (L, D + 0.4, ZB - 0.05), (0, D + 0.4, ZB - 0.05)))
    # uskočení hřebene: svislý pruh mezi +5,84 a +6,46
    g.append(poly("x-uskok", (0, YS, ZL), (L, YS, ZL), (L, YS, ZH), (0, YS, ZH)))
    # přední střecha do zahrádek
    g.append(poly("x-strecha", (0, -0.5, ZE - 0.05), (L, -0.5, ZE - 0.05), (L, YS, ZL), (0, YS, ZL)))
    for k in range(1, 26):
        x = k * L / 26
        g.append(line((x, -0.5, ZE - 0.05), (x, YS, ZL), "x-falc"))
    g.append(line((0, -0.5, ZE - 0.05), (L, -0.5, ZE - 0.05), "x-okap"))
    # fasáda do zahrádek
    g.append(poly("x-fasada", (0, 0, 0), (L, 0, 0), (L, 0, ZE), (0, 0, ZE)))
    g.append(line((0, 0, Z1), (L, 0, Z1), "x-deska"))
    for i in range(N):
        x = i * W
        # přízemí: velké okno-dveře do zahrádky + okno
        g.append(poly("x-okno", (x + 0.7, 0, 0.05), (x + 2.7, 0, 0.05), (x + 2.7, 0, 2.45), (x + 0.7, 0, 2.45)))
        g.append(line((x + 1.7, 0, 0.05), (x + 1.7, 0, 2.45), "x-ram"))
        g.append(poly("x-okno", (x + 3.4, 0, 0.9), (x + 4.6, 0, 0.9), (x + 4.6, 0, 2.45), (x + 3.4, 0, 2.45)))
        # patro: dveře na balkon + okno
        g.append(poly("x-okno", (x + 0.8, 0, Z1 + 0.1), (x + 1.8, 0, Z1 + 0.1), (x + 1.8, 0, Z1 + 1.75), (x + 0.8, 0, Z1 + 1.75)))
        g.append(poly("x-okno", (x + 2.6, 0, Z1 + 0.85), (x + 4.4, 0, Z1 + 0.85), (x + 4.4, 0, Z1 + 1.75), (x + 2.6, 0, Z1 + 1.75)))
        g.append(line((x + 3.5, 0, Z1 + 0.85), (x + 3.5, 0, Z1 + 1.75), "x-ram"))
        if i:
            g.append(line((x, 0, 0), (x, 0, ZE), "x-delici"))
    # balkon patra: deska, zábradlí, dělicí stěny
    g.append(poly("x-balkon", (0, 0, Z1), (L, 0, Z1), (L, -1.2, Z1), (0, -1.2, Z1)))
    g.append(poly("x-balkon-hrana", (0, -1.2, Z1), (L, -1.2, Z1), (L, -1.2, Z1 - 0.22), (0, -1.2, Z1 - 0.22)))
    g.append(line((0, -1.2, Z1 + 1.0), (L, -1.2, Z1 + 1.0), "x-zabradli"))
    for k in range(0, int(L / 0.32) + 1):
        x = k * 0.32
        g.append(line((x, -1.2, Z1), (x, -1.2, Z1 + 1.0), "x-pricka"))
    for i in range(N + 1):
        g.append(poly("x-predel", (i * W, 0, Z1), (i * W, -1.2, Z1), (i * W, -1.2, Z1 + 1.9), (i * W, 0, Z1 + 1.9)))
    # zahrádky: terasa u domu, živý plot vzadu, keř
    for i in range(N):
        x = i * W
        g.append(poly("x-terasa", (x + 0.35, -0.05, 0), (x + W - 0.35, -0.05, 0), (x + W - 0.35, -2.3, 0), (x + 0.35, -2.3, 0)))
        for k in range(1, 5):
            g.append(line((x + 0.35, -2.3 * k / 5, 0), (x + W - 0.35, -2.3 * k / 5, 0), "x-spara"))
        g.append(poly("x-plot-ziv", (x + 0.2, -GY + 0.1, 0), (x + W - 0.2, -GY + 0.1, 0), (x + W - 0.2, -GY + 0.1, 0.9), (x + 0.2, -GY + 0.1, 0.9)))
        g.append(poly("x-plot-ziv-h", (x + 0.2, -GY + 0.1, 0.9), (x + W - 0.2, -GY + 0.1, 0.9), (x + W - 0.2, -GY + 0.75, 0.9), (x + 0.2, -GY + 0.75, 0.9)))
    dum = "\n    ".join(g)

    # byty: klikací plochy (pozice 1 vpravo … 8 vlevo u štítu, jako v kresbě v8)
    b = []
    for c in range(1, 17):
        patro = c > 8
        poz = c - 8 if patro else c
        i = N - poz
        x0, x1 = i * W + 0.05, (i + 1) * W - 0.05
        if patro:
            plocha = pts((x0, 0, Z1 + 0.02), (x1, 0, Z1 + 0.02), (x1, 0, ZE - 0.05), (x0, 0, ZE - 0.05))
            bal = pts((x0, 0, Z1 + 0.02), (x1, 0, Z1 + 0.02), (x1, -1.2, Z1 + 0.02), (x0, -1.2, Z1 + 0.02))
            extra = f'<polygon class="x-venku" points="{bal}"/>'
            tx, ty = P((x0 + x1) / 2 - 0.6, 2.4, ZE + (ZL - ZE) * 2.9 / (YS + 0.5))
        else:
            plocha = pts((x0, 0, 0.02), (x1, 0, 0.02), (x1, 0, Z1 - 0.02), (x0, 0, Z1 - 0.02))
            zah = pts((x0, -0.05, 0), (x1, -0.05, 0), (x1, -GY, 0), (x0, -GY, 0))
            extra = f'<polygon class="x-venku" points="{zah}"/>'
            tx, ty = P((x0 + x1) / 2, -GY * 0.56, 0)
        j = f"B[{c - 1}]"  # B nastaví šablona, která kresbu vkládá (byty vybraného domu)
        b.append(f'<a class="x-byt" data-c="{c}" href="{{{{ url({j}.cesta) }}}}" aria-label="Byt {{{{ {j}.kod }}}}, {{{{ {j}.patro_text }}}}, {{{{ {j}.cena_text }}}}"><polygon class="x-plocha" points="{plocha}"/>{extra}'
                 f'<g class="x-cislo"><circle cx="{tx:.1f}" cy="{ty:.1f}" r="13"/><text x="{tx:.1f}" y="{ty + 4.2:.1f}">{c}</text></g></a>')
    byty = "\n    ".join(b)

    # kóty: výškové značky vpravo, hloubka domu u štítu
    k = []
    xr = P(L + 1.2, 0, 0)[0]
    for z, y_, t in ((0, 0, "±0,000"), (ZL, YS, "+5,840"), (ZH, YS, "+6,460")):
        a = P(L, y_, z)
        k.append(f'<path class="x-kota" d="M{a[0] + 8:.1f} {a[1]:.1f}H{xr + 20:.1f}"/>')
        k.append(f'<text class="x-kota-t" x="{xr + 24:.1f}" y="{a[1] + 4:.1f}">{t}</text>')
    a, c_ = P(-0.6, 0, 0), P(-0.6, D, 0)
    k.append(f'<path class="x-kota" d="M{a[0] - 10:.1f} {a[1] + 6:.1f}L{c_[0] - 10:.1f} {c_[1] + 6:.1f}"/>')
    for q in (a, c_):
        k.append(f'<path class="x-kota" d="M{q[0] - 15:.1f} {q[1] + 1:.1f}l10 10"/>')
    mx, my = (a[0] + c_[0]) / 2 - 22, (a[1] + c_[1]) / 2 + 26
    k.append(f'<text class="x-kota-t" x="{mx:.1f}" y="{my:.1f}" transform="rotate(61 {mx:.1f} {my:.1f})">11 000</text>')
    kot = "\n    ".join(k)

    # rozměr viewBoxu
    xs, ys = [], []
    for q in [(-1.5, -GY - 1.2, 0), (L + 1.5, -GY - 1.2, 0), (L + 1.5, D + 1, 0), (-1.5, D + 1, 0), (0, D + 0.4, ZB), (L, D + 0.4, ZB)]:
        x, y = P(*q)
        xs.append(x)
        ys.append(y)
    vx, vy = min(xs) - 20, min(ys) - 30
    vw, vh = max(xs) + 90 - vx, max(ys) + 20 - vy
    svg = f'''{{# vygenerováno tools/axo9.py – needitovat ručně #}}
<svg class="x-axo" viewBox="{vx:.0f} {vy:.0f} {vw:.0f} {vh:.0f}" role="group" aria-label="Axonometrie domu K Metelce ze strany zahrádek: osm bytů v přízemí se zahrádkami a osm bytů v patře s balkony. Vyberte byt.">
  <g aria-hidden="true">
    {dum}
  </g>
  <g class="x-koty" aria-hidden="true">
    {kot}
  </g>
  <g class="x-byty">
    {byty}
  </g>
</svg>
'''
    open(os.path.join(OUT, "_axo.html"), "w", encoding="utf-8").write(svg)


def rez():
    """Řez domem v pravé velikosti s popisem vrstev (podle legendy hmot v řezu)."""
    s = 46.0
    ox, oy = 140.0, 380.0

    def R(y, z):
        return ox + y * s, oy - z * s

    def pl(cls, *body):
        return f'<polygon class="{cls}" points="' + " ".join(f"{R(*q)[0]:.1f},{R(*q)[1]:.1f}" for q in body) + '"/>'

    def ln(cls, a, b):
        (x1, y1), (x2, y2) = R(*a), R(*b)
        return f'<path class="{cls}" d="M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}"/>'

    g = []
    g.append(ln("r-teren", (-3.2, 0), (D + 3.2, 0)))
    # základová deska + podlaha na terénu
    g.append(pl("r-zaklad", (-0.1, 0), (D + 0.1, 0), (D + 0.1, -0.5), (-0.1, -0.5)))
    # obvodové zdi a střední nosná zeď
    g.append(pl("r-zed", (0, 0), (0.3, 0), (0.3, ZE - 0.3), (0, ZE - 0.3)))
    g.append(pl("r-zed", (D - 0.3, 0), (D, 0), (D, ZB - 0.3), (D - 0.3, ZB - 0.3)))
    g.append(pl("r-zed", (YS - 0.15, 0), (YS + 0.15, 0), (YS + 0.15, ZH - 0.4), (YS - 0.15, ZH - 0.4)))
    # strop (Spirol)
    g.append(pl("r-strop", (0.3, Z1 - 0.3), (D - 0.3, Z1 - 0.3), (D - 0.3, Z1), (0.3, Z1)))
    # střechy: nižší k zahrádkám, vyšší k pavlači
    g.append(pl("r-strecha", (-0.5, ZE - 0.38), (YS + 0.15, ZL - 0.4), (YS + 0.15, ZL), (-0.5, ZE + 0.02)))
    g.append(pl("r-strecha", (YS - 0.15, ZH - 0.4), (D + 0.4, ZB - 0.4), (D + 0.4, ZB), (YS - 0.15, ZH)))
    # balkon a pavlač
    g.append(pl("r-strop", (-1.2, Z1 - 0.2), (0, Z1 - 0.2), (0, Z1), (-1.2, Z1)))
    g.append(ln("r-zabradli", (-1.2, Z1), (-1.2, Z1 + 1.0)))
    g.append(pl("r-strop", (D, Z1 - 0.2), (D + 1.2, Z1 - 0.2), (D + 1.2, Z1), (D, Z1)))
    g.append(ln("r-zabradli", (D + 1.2, Z1), (D + 1.2, Z1 + 1.0)))
    # okna
    for y0 in (0, D - 0.3):
        g.append(pl("r-okno", (y0, 0.1), (y0 + 0.3, 0.1), (y0 + 0.3, 2.35), (y0, 2.35)))
        g.append(pl("r-okno", (y0, Z1 + 0.1), (y0 + 0.3, Z1 + 0.1), (y0 + 0.3, Z1 + 1.75), (y0, Z1 + 1.75)))
    k = []

    def kota_v(y, z0, z1, t):
        x, a = R(y, z0)
        _, b = R(y, z1)
        k.append(f'<path class="r-kota" d="M{x:.1f} {a:.1f}V{b:.1f}M{x - 5:.1f} {a + 5:.1f}l10 -10M{x - 5:.1f} {b + 5:.1f}l10 -10"/>')
        k.append(f'<text class="r-kota-t" x="{x + 10:.1f}" y="{(a + b) / 2 + 4:.1f}">{t}</text>')

    kota_v(2.4, 0, 2.5, "2,50 m")
    kota_v(0.75, Z1, Z1 + 2.11, "2,11 m")
    kota_v(YS + 0.6, Z1, Z1 + 3.22, "3,22 m")
    # výškové značky vlevo od řezu
    xz = R(-2.9, 0)[0]
    for z, y, t in ((0, 0, "±0,000"), (ZL, YS, "+5,840"), (ZH, YS, "+6,460")):
        _, yy = R(0, z)
        x0 = R(y, z)[0]
        k.append(f'<path class="r-kota r-tenka" d="M{xz:.1f} {yy:.1f}H{x0 - 6:.1f}"/><path class="r-kota" d="M{xz + 6:.1f} {yy:.1f}l6 -8h-12z"/>')
        k.append(f'<text class="r-kota-t" x="{xz + 18:.1f}" y="{yy - 6:.1f}">{t}</text>')
    # hloubka domu
    a, b = R(0, -1.1), R(D, -1.1)
    k.append(f'<path class="r-kota" d="M{a[0]:.1f} {a[1]:.1f}H{b[0]:.1f}M{a[0] - 5:.1f} {a[1] + 5:.1f}l10 -10M{b[0] - 5:.1f} {b[1] + 5:.1f}l10 -10"/>')
    k.append(f'<text class="r-kota-t r-stred" x="{(a[0] + b[0]) / 2:.1f}" y="{a[1] - 8:.1f}">11 000</text>')
    for t, y in (("zahrádka / balkon", -0.6), ("pavlač", D + 0.6)):
        x, yy = R(y, -0.9)
        k.append(f'<text class="r-pop r-stred" x="{x:.1f}" y="{yy + 34:.1f}">{t}</text>')

    # popisky vrstev s odkazovou čarou: (bod v řezu, text) – text vpravo
    vrstvy = [
        ((YS + 2.6, ZH - (ZH - ZB) * 2.6 / (D - YS) - 0.2), "Střecha: Kingspan 180 mm + čedičová vlna 220 mm"),
        ((D - 0.15, ZB - 0.62), "Zdivo Porotherm 30 P+D, zateplení Isover 240 mm"),
        ((D - 0.15, Z1 + 0.9), "Okna s trojsklem, Uw = 0,84 W/m²K"),
        ((YS + 2.4, Z1 - 0.15), "Stropní panely Spirol 200 mm"),
        ((YS + 2.6, -0.25), "Podlaha na terénu, EPS 220 mm"),
    ]
    xt = R(D + 2.4, 0)[0]
    for idx, ((y, z), t) in enumerate(vrstvy):
        x, yy = R(y, z)
        ty = R(0, 6.6 - idx * 1.62)[1]
        k.append(f'<g class="r-popis"><path class="r-odkaz" d="M{x:.1f} {yy:.1f}L{xt - 14:.1f} {ty:.1f}H{xt - 4:.1f}"/>'
                 f'<text class="r-vrstva" x="{xt:.1f}" y="{ty + 5:.1f}">{t}</text></g>')
        k.append(f'<g class="r-znacka"><circle class="r-bod" cx="{x:.1f}" cy="{yy:.1f}" r="11"/>'
                 f'<text class="r-bod-t" x="{x:.1f}" y="{yy + 4.5:.1f}">{idx + 1}</text></g>')

    x0, y0 = R(-3.4, 0)[0], R(0, ZH + 0.9)[1]
    x1, y1 = xt + 470, R(0, -2.0)[1]
    svg = f'''{{# vygenerováno tools/axo9.py – needitovat ručně #}}
<svg class="r-svg" viewBox="{x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}" role="img" aria-label="Řez domem K Metelce: přízemí se světlou výškou 2,5 m, patro pod nízkou střechou se světlou výškou 2,11 až 3,22 m, hloubka domu 11 m, hřeben +6,46 m">
  <g>{"".join(g)}</g>
  <g>{"".join(k)}</g>
</svg>
'''
    open(os.path.join(OUT, "_rez9.html"), "w", encoding="utf-8").write(svg)


if __name__ == "__main__":
    axo()
    rez()
    print("OK: src/koncepty/_axo.html, _rez9.html")
