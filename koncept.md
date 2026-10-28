# Rezidence Metelka – koncept v3 (28. 10. 2026)

## Proč v3
v2 (jednostránkový, Gilda Display, AI vizualizace) Rafael odmítl: „ten web je na nic. fakt moc špatnej“ –
levný a šablonovitý dojem, slabá úvodní obrazovka, špatné fotky, moc textu a tabulek.
Zadání: celý web znovu, **vícestránkový a pořádně propracovaný**, fotky z Facebooku klientky.
FB patří skupině CFIG SE (Rezidence Karlovina, Pardubice). Rafael: „Je to jejich firma, použít.“
→ Metelka dostane vizuální jazyk sesterského projektu Karlovina (stejný developer = stejná rodina značek)
a interiéry Karloviny jako ilustrační vizualizace. Fasádu Karloviny nepoužívám (nebyla by to Metelka).

## Tři koncepty
1. **Prodejní kniha developera** – web jako tištěný katalog CFIG: velký obraz přes celou šířku,
   prostrkané verzálky Marcellus, písková tlačítka, espresso pásy, každý byt má vlastní list (kartu bytu).
2. **Fasáda jako rozcestník** – dům nakreslený zlatou linkou, každé okno je byt; klik vede na kartu bytu.
3. **Minutová osa** – Hradec měřený minutami od dveří: nádraží 5, D11 5,5, centrum 9, Praha 62.

## Výběr
**1 jako rámec, 2 a 3 jako signature momenty.** Klientka chce „jednoduché a posh, zlatá, béžová,
tenké černé písmo“ a její vzor je Karlovina – katalogový jazyk přesně tohle dělá. Kupce bytu zajímá
konkrétní byt: proto 32 karet bytů (vzor Florian Residence) a fasáda jako výběr. Exteriér Metelky
nemáme → dům ukazuji jako schéma (označené), ne vymyšlený render.

## Mapa webu
- `/` úvod: hero s interiérem přes celou obrazovku + titul REZIDENCE METELKA + lišta faktů;
  úvodní text s obrazem; fasáda (výběr bytu, signature 1); tři kapitoly (Byt / Hradec / Praha);
  „Promyšleno do detailu“ (akordeon + obraz, jako Karlovina); domluvit prohlídku.
- `/byty/` výběr: přepínač domu, fasáda s okny-byty, filtr (vše / zahrádka / balkon), seznam řádků.
- `/byty/k-metelce-i/byt-01/` … 32 karet bytu: číslo, 4 klíčové údaje, půdorys s místnostmi,
  přehled ploch a ceny, „Mám zájem“, tisk karty, poloha v domě, předchozí/další, podobné byty.
- `/standardy/` byt a dům: půdorys, materiály vzorového bytu, řez domem, okna, teplo, sklep a stání.
- `/lokalita/` Hradec: Salon republiky, minutová osa (signature 2), sport, rodiny.
- `/praha-nebo-hradec/` srovnání: 27 m² vs. 47 m², posuvník rozpočtu, nájem a výnos, dojezd, zdroje.
- `/galerie/` interiéry + Hradec, lightbox, autoři fotek.
- `/kontakt/` formulář s výběrem bytu, Mgr. Anna Krčmová, adresa.

## Písma, paleta, fotky
- **Marcellus 400** (písmo skupiny CFIG, prostrkané verzálky) + **Jost 300/400** (tenké černé písmo).
  Háčky otestovány renderem 28. 10. (scratchpad/fonty/test.png). Předchozí web v registru: Gilda / Nyght Serif → bez opakování.
- Paleta z Karloviny + zadání: papír #F6F1EA, béž #EDE4D6, písek #D9C3A0 (tlačítka), zlatá #A8844F
  (linky), tmavá zlatá #8C6B3A (text), espresso #1F1A16, vínová #7B3F3F (drobné akcenty jako u Karloviny).
  Tělo textu 17–18 px skoro černé, ne malé šedé.
- Fotky: interiéry a koupelny Karloviny (rezidencekarlovina.cz / FB CFIG) s popiskem „ilustrační
  vizualizace“, Hradec z Wikimedia Commons (CC BY-SA, autoři v patičce galerie), půdorys z podkladů klientky.

## Méně textu a tabulek
Každá stránka: jedna věta nadpisu, nejvýš 2 krátké odstavce na blok, čísla jako velká typografie.
Tabulky jen na kartě bytu (plochy místností), jinak řádky s linkou nebo osa.

## Zakázané vzory
- Lišta faktů v hero (4 údaje) = doložená čísla z ceníku a OSRM, v kontextu nabídky. Žádné countery.
- Prostrkané verzálky nad nadpisy = jazyk značky Karlovina (vínové), ne „01 / ——“.
- Jinak žádný.

## Porovnání
- Schválené: Skalský dvůr (teplá elegance, display 400, velký obraz), Parolek (výkres jako signature).
- Odmítnuté: metelka v1 a v2 (málo obrazu, AI fotky, tabulky, jedna dlouhá stránka) → vícestránkový,
  obraz přes celou šířku, karty bytů. Zábranský (tmavá + zlatá) → světlý web, tmavé jen pásy.
- Posledních 5 v registru: bagermini (Archivo), jogamysli (Nyght Serif) – jiné písmo i skladba.
