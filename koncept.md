# Rezidence Metelka – koncept v4 „Model na stole“ (28. 10. 2026)

Předchozí verze: `koncept-v3.md` (a v git historii). v3 měla self-review 8/10, Rafael ji odmítl:
chce „milionkrát lepší“. Slabiny v3: statický hero s interiérem, který není Metelka; fasáda nakreslená
linkou působila jako schéma, ne jako prodej; výběr bytu byl seznam s kresbou, žádný „wow“ moment.

## Tři koncepty
1. **Model na stole** – web jako prodejní kancelář developera: na stole stojí bílý architektonický
   model domu, zvednete střechu a vidíte byty i s nábytkem, ťuknete na byt a dostanete jeho kartu.
2. **Klíč od bytu** – celý web vede jednu cestu „od branky ke dveřím bytu“ (zahrada → chodba → byt),
   každá kapitola je jedna místnost.
3. **Ceník jako katalogový list** – tištěný list developera s výsekem, kde se ceník a půdorys skládají.

## Výběr: 1 – Model na stole
- Exteriér Metelky neexistuje (klientka nemá vizualizace). Bílý model je poctivý: je to maketa podle
  půdorysu z podkladů (2 domy × 16 bytů, přízemí se zahrádkou, patro s balkonem), ne vymyšlená fasáda.
- Kupující řeší konkrétní byt. Model ukáže, kde přesně byt je, ze které strany je zahrádka a balkon.
- Developerské weby na špičce (Florian Residence, Rezidence Park Kampa, Central Group 3D výběr)
  mají interaktivní výběr v modelu. U malého projektu za 4,99 mil. to nikdo nemá → odlišení.
- Fasádu Karloviny nepoužívám. Interiéry Karloviny jen jako „Ilustrační vizualizace interiéru“
  se zmínkou, že jsou ze sesterského projektu.

## Skladba (úvod)
1. **Hero „zvednutá střecha“** (signature 1): uzavřený model, scrollem se střecha zvedne a zmizí,
   pod ní byt 12 se zlatým obrysem a nábytkem; popisky balkon/zahrádka → „Byt 12 – karta bytu →“.
   Lišta 4 doložených faktů (32 × 2+kk, 47,21 m², od 4 990 000 Kč, D11 5,5 min).
2. Úvod – jedna věta: byt prochází celým domem, okna na obě strany.
3. **Výběr bytu v modelu** (signature 2): živý three.js model, přepínač dům / přízemí / patro, filtr
   zahrádka × balkon, ťuknutí na byt = panel s cenou a odkazem na kartu. Bez WebGL (nebo před
   načtením) statický render + plán 2 × 8 se stejným panelem.
4. Jeden byt – řez bytem v modelu + půdorys z podkladů.
5. Dvě patra – zahrádka 5 490 000 Kč vs. balkon 4 990 000 Kč (řezy modelem).
6. Interiér – ilustrační vizualizace (označeno).
7. Hradec – Salon republiky, foto Wikimedia (autor uveden).
8. Domluvit prohlídku – formulář (ukázkový režim).

Podstránky: `/byty/` (ceník + filtr + model), 32 karet bytu (řez patrem s vybraným bytem, plochy,
cena, cena za m², předchozí/další), `/standardy/`, `/lokalita/`, `/galerie/`, `/praha-nebo-hradec/`,
`/kontakt/`.

## Technika pohybu
- Zvednutí střechy = CSS scroll-driven animace (`animation-timeline: scroll(root)`), dvě vrstvy
  offline renderu (otevřený model + víko s maskou alfy). Bez pinningu, scroll běží nativně.
  Fallback bez podpory = malá JS funkce jen při scrollu, `prefers-reduced-motion` = bez animace.
- Rendery z vlastního three.js modelu (`tools/render/`, `tools/render_vse.py`, GTAO, měkké stíny).
- Živý model se načítá líně až u sekce výběru, renderuje jen při změně (žádná rAF smyčka v klidu),
  na dotyku bez orbitu (jen ťuknutí), aby nebral scroll.

## Písma, paleta
- **Noto Serif Display 200–300** (tenké černé písmo, jak klientka chce „posh“) + **Albert Sans 300–500**.
  Háčky otestovány. Předchozí weby v registru: Marcellus/Jost (metelka v3), Nyght Serif (jogamysli),
  Archivo (bagermini) → bez opakování.
- Paleta: papír #efe9df, papír 2 #e6ddcf, bílá modelu #f8f5ef, inkoust #1f1c19, zlatá #c79d5a
  (obrys vybraného bytu, linky), zlatá text #87642d. Zlatá a béžová podle zadání klientky,
  bez tmavé „luxusní“ sekce.

## Zakázané vzory
- Lišta faktů v hero: 4 čísla z ceníku a OSRM, žádné countery. Jinak žádný.

## Porovnání
- Schválené: Skalský dvůr (teplá elegance, velký obraz), Parolek (nápad z oboru – výkres),
  Kling (předmět, který se scrollem promění) → stejný princip, jiný předmět.
- Odmítnuté: metelka v1–v3 (AI fotky, tabulky, cizí interiér v hero, schéma fasády) → v hero
  vlastní model Metelky, cizí obrazy jen označené dál na stránce. Zábranský (tmavá + zlatá) → světlé.
- Posledních 5 v registru: jiný display font i skladba.

## Co chybí od klientky
Viz `brief.json` → `chybi` (telefon/e-mail prodeje, exteriér, termín dokončení a stav prodeje,
standard vs. vzorový byt, logo, fotky vzorového bytu, souhlas s VDEKOR).
