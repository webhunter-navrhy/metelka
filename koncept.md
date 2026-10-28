# Rezidence Metelka – koncept v5 (28. 10. 2026)

v4 („Model na stole“) je v `koncept-v4.md`. Rafael: „strašný… nemovitostní musí být luxusní.“ Chyby v4: béžovobílý papírový
model, tenké písmo, monochrom, prázdný minimal. v5 staví na **teple a produktu**: zlatá hodina, skutečný materiál
(bílá omítka, zlatý dub, antracitová střecha), dům přes obří název, skleněné plovoucí metriky, technické popisky jako jemný
dekor a prodejní struktura hned pod hero.

**Materiál:** exteriér Metelky neexistuje (ani foto, ani render). Vizualizace = vlastní 3D model domu podle výkresů
(42 856 × 11 000 mm, 2 podlaží, 8 bytů vedle sebe, zahrádky s živými ploty, průběžný balkon s předěly) → offline render
zlaté hodiny (`tools/viz/`) → FLUX.1 Kontext img2img jen na materiály, světlo a zeleň (`tools/viz_ai.py`, `_viz/p2.txt`).
Tvar domu, počet oken, balkon a zahrádky drží model. V patičce jednou: „Exteriér je vizualizace podle projektové dokumentace,
interiéry ilustrační podle návrhu vzorového bytu.“ Fasádu Karloviny ani cizí domy z fotobank nepoužíváme.

**Písmo (všechny koncepty):** Bodoni Moda (display, kontrast tlustá/tenká – „posh“, háčky v pořádku) + Instrument Sans
(text, 400/500) + IBM Plex Mono jen na technické popisky (kóty, souřadnice). Paleta: teplá béž `#efe7da`, papír `#f7f2ea`,
inkoust `#1c1915`, zlato/bronz `#b98d4e` jen akcent (linky, čísla, tlačítko), tmavá olivová `#2b2a22` na kontrastní pás.
Wordmark „Rezidence Metelka“ vždy vlevo (logo zatím není).

---

## A) Zlatá hodina – dům přes obří název
**Nápad:** Dům v zapadajícím slunci stojí *před* obřím nápisem METELKA – střecha a stromy překrývají písmena, takže název
patří tomuhle domu a ničemu jinému. Přes fotku plavou tři skleněné karty s tím, co se kupuje: 32 bytů 2+kk · od 4 990 000 Kč ·
zahrádka až 55 m².
**Proč jen Metelka:** dlouhý nízký dům (43 m, 2 podlaží) má přesně tvar, který se dá „položit“ přes název – dlouhá linie
střechy = podtržení slova. Claim o městě, ne o zeleni (zadání klientky): „9 minut na Velké náměstí.“
**Jak všude:**
- *Hlavička:* průhledná přes fotku, wordmark vlevo, menu uprostřed v drobných verzálkách, vpravo telefon/„Domluvit prohlídku“
  jako zlatá linka s šipkou (ne pilulka). Po scrollu papírová s jemnou spodní linkou.
- *Typografie:* Bodoni 22–24 vw za domem, nadpisy sekcí 64–96 px, kurzíva Bodoni na čísla a ceny.
- *Hero:* fotka přes celou plochu, název za domem (výřez domu/stromů rembg/maska oblohy), vlevo dole claim, vpravo skleněné
  metriky. Pod hero rovnou **lišta výběru jako booking**: Dům I/II · Přízemí se zahrádkou / Patro s balkonem · cena · „Zobrazit 16 bytů“.
- *Fotky:* zlatá hodina všude – vizualizace exteriéru, interiéry v teplém tónu, HK fotky stejně teple sjednocené.
- *Nabídka:* dvě produktové karty (zahrádka / balkon) s velkou cenou v Bodoni, pod tím 32 karet bytů.
- *Podstránka:* menší hero s výřezem fotky a slovem stránky za ní (BYTY, LOKALITA).
- *Pohyb:* název se při načtení zvedne zpod linie střechy (clip-path), metriky jemně doplavou; CSS scroll-driven parallax fotky.
**Předloha:** `super/42d167…` (LeonHome – obří serif za domem, skleněné metriky, zlatá hodina) + `super/05311ec…` (lišta
rezervace pod hero, karty pokojů jako produkt). TOP: themodernhouse (inzerát jako redakční titulní strana).
**Test zaměnitelnosti:** jiný developer by musel mít jiný dům a jiný název – kompozice „název za domem“ je postavená na
siluetě Metelky a na slově METELKA. Jiný obor ne. V `_prehled.png` nic s fotkou domu přes název není.

## B) Výkres, který ožil
**Nápad:** Fotorealistická vizualizace domu uvnitř papírového výkresového listu – zlaté kótovací čáry s mírami ze skutečné
projektové dokumentace (42 856, 11 000, ±0,00, +5,84, +6,46) a popisky skladby (Porotherm 30 P+D, trojsklo Uw 0,84,
čedičová vlna 240 mm) jako jemný dekor přes fotku; razítko výkresu = karta projektu.
**Proč jen Metelka:** máme reálné řezy a půdorysy Metelky a čísla, která jinde neplatí. Luxus jako přesnost: kupec vidí, z čeho
je dům postavený, ne slogan.
**Jak všude:**
- *Hlavička:* výkresový rám – tenká linka po obvodu stránky, wordmark vlevo v razítku, menu jako řádek legendy, CTA „Domluvit
  prohlídku →“ v rámečku.
- *Typografie:* Bodoni velký titul vlevo nahoře, Plex Mono drobné kóty a souřadnice 50.2238 N 15.7970 E.
- *Hero:* papírový list s mřížkou, vizualizace (nadhled ¾) vpravo přes 2/3, zlaté kóty přes dům, vlevo titul + karta projektu
  (miniatura půdorysu, 47,21 m², ceny).
- *Nabídka:* každý byt jako list výkresu (půdorys + kóty + cena), standardy jako legenda materiálů s detailními fotkami.
- *Podstránka:* každá má číslo listu (A-01 Byty, A-02 Standardy…).
- *Pohyb:* kóty se dokreslí (stroke-dashoffset) při načtení.
**Předloha:** `super/153367…` (NORTH/FORM – papír, linky mřížky, souřadnice, fotka domu se zlatou hodinou, výkres u projektu).
TOP: haslehaven (skici a časová osa projektu).
**Test zaměnitelnosti:** čísla a skladba jsou jen Metelky; bez výkresů klienta koncept nejde. Riziko: blízko „technickému“
v4 – proto teplá fotka nese 70 % plochy a linky jsou zlaté, ne šedé.

## C) Vyberte si okno
**Nápad:** Hero = čelní pohled na dům ve zlaté hodině jako katalog: 16 bytů očíslovaných přímo na fasádě (01–08 přízemí se
zahrádkou, 09–16 patro s balkonem); najetím na okno se ukáže skleněná karta s cenou a výměrou, klik vede na detail bytu.
**Proč jen Metelka:** všech 32 bytů je stejných (47,21 m², 2+kk) – jediná volba kupce je dům, podlaží a pozice. Fasáda je proto
nejpřesnější rozhraní výběru, žádný jiný projekt to takhle mít nemůže (různé dispozice by se na fasádu nevešly).
**Jak všude:**
- *Hlavička:* wordmark vlevo, uprostřed přepínač **Dům I / Dům II**, vpravo „Domluvit prohlídku“. Výběr je hlavní navigace.
- *Typografie:* Bodoni na čísla bytů (velká kurzíva 01–16), titul nad domem střední velikosti.
- *Hero:* panorama celé fasády (všech 8 os), čísla v bronzových kroužcích na oknech, pod domem dvě produktové karty
  (Přízemí se zahrádkou 5 490 000 Kč / Patro s balkonem 4 990 000 Kč).
- *Nabídka:* 32 karet bytů seřazených podle polohy na fasádě, mapa „kde je můj byt“ na každém detailu.
- *Podstránka:* čísla a pozice se vrací (galerie: „pohled z bytu 12“).
- *Pohyb:* hover čísla → světlo v okně se rozsvítí (opacity teplé záře).
**Předloha:** `libi/7a10977…` (RESIDENCE – číslování, velké číslice, katalog), `super/05311ec…` (booking lišta + karty jako produkt).
**Test zaměnitelnosti:** stojí na tom, že všechny byty jsou stejné a dům má 8 shodných os – u jiného projektu nefunguje.
Riziko: fasáda čelně je plošší než ¾ pohled, proto kontrast řeší světlo oken a velká čísla.

---

## Vítěz
**A „Zlatá hodina“** (vybral Rafael 28. 10. 2026). Je nejluxusnější a vedle Leon Home obstojí: dům ve večerním světle přes obří Bodoni název, sklo a zlato jen jako akcent.
Z ostatních variant se bere: z **B** zlaté kóty a popisky vrstev přímo na vizualizaci (Porotherm 30, 24 cm vlny, trojsklo Uw 0,84, Kingspan) – úvod a hero Standardů; z **C** výběr bytu číslovanými značkami na oknech fasády, přepínač K Metelce I/II a skleněná karta s cenou – hero podstránky Byty a karta bytu.

## Plán webu (fáze 2)
- Úvod: hero A (AVIF ≤ 200 kB, fetchpriority=high) → booking lišta → Zahrádka, nebo balkon (2 produktové karty s cenou) → interiér přes celou plochu s plochami místností → Standardy tma + výkres B → Hradec foto + minuty ve skle → Praha, nebo Hradec (čtverce m²) → kontakt přes fotku.
- Byty: hero „Vyberte si okno“ (fasáda C, 16 značek na dům, karta plave na obloze nad zvoleným oknem; mobil vodorovný posun) → ceník 32 bytů s filtrem.
- Karta bytu ×32: fasáda s bodem bytu, obří kód, skleněná karta s cenou, půdorys, přehled, inspirace interiéru, listování a podobné byty.
- Standardy: výkres B jako hero, půdorys, materiály (vzorky), řez domem s pultovými střechami, konstrukce, koupelny.
- Lokalita, Praha nebo Hradec, Galerie, Kontakt: každá obrazovka má hrdinu (fotka přes celou plochu nebo tmavá sekce s velkým číslem), světlé sekce jen jako teplý papír s obsahem.
- Rytmus: tma ↔ fotka ↔ teplý papír, nikdy dvě prázdné béžové plochy za sebou. Interiéry z Karloviny jen jako ilustrační (věta v patičce), fasáda Karloviny ne.
- Otevřené: střecha – před odesláním klientce přegenerovat s plochou (pultovou) střechou; číslování bytů ověřit u klientky.
