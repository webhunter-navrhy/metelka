# Metelka v9 – tři varianty úvodu (31. 10. 2026)

Podnět: Rafael o v8 „ta rezidence by mohla být mnohem lepší“, bez konkrétní výtky. Podle web-builder-cz (Varianty úvodu)
vznikly tři výrazně odlišné úvody na `/koncepty/a/`, `/koncepty/b/`, `/koncepty/c/`. Hlavní web v8 zůstal beze změny.
Přepínač A/B/C vlevo dole slouží jen k výběru.

Společná pravidla: fakta jen z brief.json (ceník 16. 9. 2026, plochy, materiály, vzdálenosti autem). Fotky jsou jen čisté
interiéry z FB Karloviny, vždy s popiskem „ilustrační interiér“. Nikde není AI vizualizace domu ani fasáda Karloviny.
Stav prodeje neznáme, proto se nevymýšlí („Stav prodeje doplníme“).

## A – Filmový průchod bytem
- Nápad: úvod přes celou obrazovku s teplým interiérem, obří lehký titulek „Světlo z obou stran“ a obě ceny. Pod ním
  se byt prochází místnost po místnosti a v lepivém půdorysu vedle se rozsvítí ta, o které právě čtete (s plochou).
- Písmo: Inter Tight, jedna rodina, kontrast obřího řezu 200 proti malému textu. Paleta krém, tmavá, zlatá.
- Soubory: src/koncepty/a.html, static/css/k9a.css, static/js/k9a.js.

## B – Výkres
- Nápad: úvod je výkresový list. Axonometrii domu kreslenou tenkou linkou podle řezu a půdorysu (hloubka 11 m, 8 bytů
  vedle sebe, balkony, zahrádky, uskočený hřeben +5,84/+6,46) doplňuje razítko výkresu. Byty se vybírají přímo
  v kresbě: po najetí se ukáže karta bytu s cenou a interiérem, přepínač mezi K Metelce I a II. Druhá sekce je řez
  domem s očíslovanými vrstvami.
- Písmo: Schibsted Grotesk + Spline Sans Mono na kóty. Paleta papír, grafit a jediná červená jako v projektové dokumentaci.
- Mobil: kresba nahoře, pod ní mřížka čísel bytů (patro/přízemí). První klepnutí byt vybere, druhé otevře kartu.
- Kresbu generuje tools/axo9.py → src/koncepty/_axo.html, _rez9.html. Okapy a předsazení jsou odhad, proto je kresba
  popsaná jako zjednodušená. Číslování bytů je převzaté z v8 a je orientační (ověřit u klienta).
- Soubory: src/koncepty/b.html, static/css/k9b.css, static/js/k9b.js.

## C – Karlovina+
- Nápad: řeč investora z Karloviny (černá hlavička se značkou uprostřed, kapitálky, krém a písek), jen pečlivější.
  Úvod tvoří velká fotografie v rámu s krémovým panelem přes spodní okraj. Následuje řádek čísel, asymetrická mozaika
  vzorového bytu a ceník jako elegantní tabulka všech 16 bytů domu se záložkami I/II.
- Písmo: Cinzel (kapitálky, otestované háčky Č/Ř/É) + Mulish.
- Soubory: src/koncepty/c.html, static/css/k9c.css, static/js/k9c.js.

## Technika
- build.py renderuje src/koncepty/<x>.html → dist/koncepty/<x>/. Do sitemapy se nedostanou, všude je noindex.
- Fonty jsou self-hosted v static/fonts/v9/ (latin + latin-ext).
