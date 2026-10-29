# Rezidence Metelka – koncept v6 (29. 10. 2026, od nuly)

Rafael 29. 10.: „ten web je opravdu strašný, zkus začít úplně od začátku, předělat ho a udělat top“.
v5 archivována v `src/_v5/`. Z v1–v5 se nepřebírá design, rozvržení ani obrázky. Převzatá jsou jen ověřená fakta (brief.json),
podklady klientky a startér (build.py, deploy.sh).

## Nálada
Prémiová developerská brožura ve světle. Krém a písek, zlatá jako jediný akcent, text skoro černý, tenké patkové písmo.
Žádná tmavá ani čokoládová sekce (tma nejvýš v patičce). Zlatá hodina, jasná obloha, bílá omítka, okna zlatý dub.

## Typografie (otestované háčky, `_v6/test-hacky.png`)
- Nadpisy: **Newsreader 200** (opsz 72), kurzíva pro druhou půlku věty. Varianta C zkouší **Fraunces 200** (opsz 144).
- Text: **Hanken Grotesk** 300–500.
- Ne Cormorant (rozbité háčky), ne Bodoni Moda, ne Marcellus/Jost z v5. Instrument Serif je na tenké písmo moc těžký.

## Barvy
krém `#f7f1e7` · světlý krém `#fbf8f2` · písek `#ebe0cd` / `#dccab0` · zlatá `#b38b4d` (malý text `#8a6630`) · text `#1b1815` / `#5a5147`

## Hlavní nápad (signature)
**Průchozí byt.** Každý byt prochází celou hloubkou domu (11 m): na jedné straně pavlač, na druhé balkon nebo zahrádka,
okna na obě strany. Na webu jako tenký technický řez domem (`_v6/rez.svg.html`: dvě pultové střechy se skokem +5,84 / +6,46,
pavlač, balkon nebo zahrádka, světlo prochází bytem. Světové strany neuvádět, nejsou ověřené). Funguje jako ozdoba i jako argument.

## Obsahové důrazy
Hradec a centrum (Velké náměstí 9 min, nádraží 5 min, FN 10 min), sport (zimní stadion 8 min, Malšovická aréna 9 min,
Tenis centrum 8 min), D11 3–4 km, Praha 80 min. Zeleň ne. Srovnání s Prahou (stránka Praha, nebo Hradec) jen s ověřenými čísly.
Pro rodiny jen ověřené školy a školky.

## Prodejní struktura hned pod hero
Výběr dům (K Metelce I / II) × patro (přízemí se zahrádkou / patro s balkonem) → byty 1–8 / 9–16 a cena.
Dvě karty: byt se zahrádkou 5 490 000 Kč, byt s balkonem 4 990 000 Kč (cena vč. sklepní kóje a zahrádky / balkonu).

## Tři varianty hero (`_v6/hero-a|b|c.html`)
- **A „Brožura“**: obří jméno Metelka přes oblohu vizualizace v zaobleném rámu, skleněné karty (průchozí byt + cena, řez, 3 vzdálenosti).
- **B „Řez“**: redakční dělení textu a obrazu. Vlevo věta „Průchozí byty. Světlo z obou stran.“ a technický řez, vpravo
  vizualizace s kótami. Pod tím pruh vzdáleností.
- **C „Zlatá hodina“**: vizualizace přes celou obrazovku (pohled od druhého štítu, dům vpravo, obloha vlevo), věta
  „Devět minut od Velkého náměstí.“ na obloze, dvě skleněné cenovky a skleněný pruh vzdáleností.

## Vizualizace exteriéru
Podklad je jílový 3D model (`static/js/model.js`, správná střecha), render `tools/viz.py` → `_viz6/`. Fotoreal přes
CF FLUX.2 dev s referencí (`tools/cf_ref.py`), záloha HF Kontext. Na webu vždy „ilustrační vizualizace“.

## Změna 29. 10. 2026 (Rafael: negenerovat, použít jejich materiály)
- Hrdina všech variant = světlý interiér investora (Karlovina, CFIG SE) s popiskem „Ilustrační vizualizace interiéru · standard investora“. A: jídelna u okna, B: křeslo u okna, C: ložnice při západu slunce.
- Exteriér Metelky jen jako bílá architektonická maketa z vlastního 3D modelu (správná střecha se zlomem) – karty v prodejní struktuře a karta „Dům K Metelce · maketa podle projektu“ ve variantě B. Fasády Karloviny se nepoužívají.
- Kóty +5,84/+6,46 jsou jen v řezu, ne přes fotky interiéru.
