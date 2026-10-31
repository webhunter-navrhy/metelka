# Koncept v8 – Rezidence Metelka (31. 10. 2026)

Rafael o v7: „úplná hrůza“, „musíš vzít to z facebooku! a ten web má špatnou typografii, nehezké sekce atd“.
Hlavní vady v7: AI vizualizace domu jako „levná ubytovna“ přes celou šířku, drobné prostrkané verzálky všude
(Marcellus + Jost), všechno na střed, tabulky a stejné karty, ornamenty.

## Tři koncepty
1. **Prodejní katalog** – web jako tištěná brožura developera: světlé interiéry na výšku vedle klidné sazby,
   dům jen jako jemná architektonická kresba pohledu od zahrádek, ve které se klikne na byt.
2. **Den v bytě** – sekce podle denní doby (ráno kuchyň, odpoledne zahrádka, večer obývák).
3. **Výkres** – web jako projektová dokumentace, modrotisk, kóty.

**Výběr: 1.** Klientka má jako vzor Karlovinu (klasický developerský web), Rafael chce fotky z Facebooku CFIG
(světlé interiérové rendery 1080×1350 a 1650×2048, tedy na výšku). Katalogová sazba „text vedle fotky na výšku“
je pro tyhle fotky přirozená a nikde je nezvětšuje přes 1,3×. Koncept 2 je kýčovitý, 3 studený a byl už ve v4.

## Skladba úvodu
1. Úvod: vlevo nadpis, krátký text, tlačítka a tři fakta (32 bytů · od 4 990 000 Kč · sklep a parkování v ceně), vpravo fotka obýváku přes celou výšku.
2. Projekt: velká věta + čtyři fakta.
3. Dva typy bytů: dvě střídané dvojice fotka/text (zahrádka, balkon) s cenou.
4. **Signature: kresba domu** – pohled od zahrádek tenkou linkou, 16 bytů na domě, přepínač dům I/II, karta bytu při najetí.
5. Půdorys 2+kk s místnostmi.
6. Interiér a standard: tři fotky na výšku v posunuté mřížce + materiály VDEKOR.
7. Lokalita: fotka Hradce + časy autem jako řádky.
8. Praha, nebo Hradec: srovnání ploch za stejné peníze.
9. Domluvit prohlídku (formulář), patička tmavá.

## Písmo a barvy
- **Noto Serif Display** (variabilní, nadpisy 340–400, kurzíva jen výjimečně) + **Albert Sans** 400/500 na text 17–18 px.
  Test háčků: render 31. 10. (scratchpad f8/t.png) – ĚŠČŘŽÝÁÍÉŮÚ i kurzíva čisté. Ani jedno písmo zatím na posledních webech není.
- Malé verzálky jen u krátkých štítků, ne u nadpisů.
- Slonová kost #f7f2ea, písek #ede4d6, espresso #2b241d, zlatá #a88552 jen na akcent (ceny, linka kresby, hover).
- Žádná tmavá sekce kromě patičky.

## Zakázané vzory
Žádné. Bez marquee, zrna, counterů, ornamentů, číslovaných nadtitulků.

## Fotky
Interiéry z FB CFIG / Rezidence Karlovina (foto/zdroje.txt), u každé „ilustrační interiér“. Fasáda Karloviny a AI vizualizace
domu (viz-*.jpg, maketa) se nepoužívají. Hradec z Wikimedia Commons (CC BY-SA 4.0).
