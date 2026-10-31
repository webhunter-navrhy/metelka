// Rezidence Metelka – výběr bytu v živém modelu domu.
// three.js se načte až když se výběr blíží k obrazovce. Bez WebGL zůstává statický model + plán 2 × 8.
// Kreslí se jen při změně (otočení, výběr, přelet), v klidu žádná smyčka.

const KAMERY = {
  pc: {
    dum: [[-47.1, 40.6, 64.5], [2.9, -1, 5.3]],
    prizemi: [[-14.7, 50.6, 44.8], [3.7, 0, 3.1]],
    patro: [[-14.7, 53.6, 45.1], [3.7, 2.8, 3.1]],
  },
  mob: {
    dum: [[-54, 64, 40], [-6, 0, 2]],
    prizemi: [[-40, 74, 36], [-4, 0, 1]],
    patro: [[-40, 77, 36], [-4, 2.8, 1]],
  },
};
const mob = () => window.matchMedia('(max-width: 47.99rem)').matches;
const klid = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dotyk = window.matchMedia('(hover: none), (pointer: coarse)').matches;

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

document.querySelectorAll('[data-vyber]').forEach((root) => {
  const data = JSON.parse(root.querySelector('.vb-data').textContent);
  const base = root.dataset.base || '/';
  const panel = root.querySelector('.vb-panel');
  const prazdny = panel.querySelector('.vbp-prazdny'), detail = panel.querySelector('.vbp-byt');
  const tlacitka = [...root.querySelectorAll('.vb-b')];
  const stitek = root.querySelector('.vb-stitek');
  const canvas = root.querySelector('canvas');
  let dum = 0, vybrany = null, najety = null, rezim = 'dum', filtr = null, model = null;

  const byt = (c) => data.domy[dum].byty[c - 1];
  const filtrFn = {
    zahradka: (c) => c <= 8,
    balkon: (c) => c >= 9,
    krajni: (c) => byt(c).pozice === 1 || byt(c).pozice === 8,
  };

  function vyplnPanel() {
    panel.querySelectorAll('[data-p="dum"]').forEach((e) => { e.textContent = data.domy[dum].nazev; });
    if (!vybrany) { prazdny.hidden = false; detail.hidden = true; return; }
    const b = byt(vybrany);
    prazdny.hidden = true; detail.hidden = false;
    const hodnoty = { kod: b.kod, patro: b.patro, plocha: b.plocha, venku: b.venku, venku_typ: b.venku_typ, kobka: b.kobka, cena: b.cena, cena_m2: b.cena_m2 };
    detail.querySelectorAll('[data-p]').forEach((e) => { if (e.dataset.p in hodnoty) e.textContent = hodnoty[e.dataset.p]; });
    detail.querySelector('[data-p-href="url"]').href = base + b.cesta;
    detail.querySelector('[data-p-href="zajem"]').href = base + 'kontakt/?byt=' + encodeURIComponent(b.kod);
    panel.classList.remove('zmena'); void panel.offsetWidth; panel.classList.add('zmena');
  }

  function vyplnPlan() {
    tlacitka.forEach((t) => {
      const c = +t.dataset.c, b = byt(c);
      t.setAttribute('aria-pressed', String(c === vybrany));
      t.classList.toggle('mimo', !!filtr && !filtrFn[filtr](c));
      t.setAttribute('aria-label', `Byt ${b.kod}, ${b.patro}, ${b.venku_typ.toLowerCase()} ${b.venku}, ${b.cena}`);
    });
  }

  function vyber(c, zPlanu) {
    vybrany = c;
    if (model) {
      // vybraný byt musí být vidět: z plánu přepni na jeho podlaží, když je otevřené jiné
      if (zPlanu && rezim !== 'dum') {
        const p = c <= 8 ? 'prizemi' : 'patro';
        if (p !== rezim) nastavRezim(p);
      }
      model.vyber(c);
    }
    vyplnPanel(); vyplnPlan();
  }

  function najed(c) {
    najety = c;
    tlacitka.forEach((t) => t.classList.toggle('najety', +t.dataset.c === c));
    if (model) model.najed(c);
    ukazStitek();
  }

  function ukazStitek() {
    if (!model || !najety || dotyk) { stitek.hidden = true; return; }
    const p = model.projekce(najety);
    if (!p || !p.vidi) { stitek.hidden = true; return; }
    const b = byt(najety);
    stitek.querySelector('b').textContent = 'Byt ' + b.kod;
    stitek.querySelector('span').textContent = `${b.venku_typ} ${b.venku} · ${b.cena}`;
    stitek.style.left = p.x + 'px'; stitek.style.top = p.y + 'px';
    stitek.hidden = false;
  }

  function nastavRezim(r) {
    rezim = r;
    root.querySelectorAll('[data-rezim]').forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.rezim === r)));
    if (model) {
      model.nastavRezim(r);
      const [pos, cil] = KAMERY[mob() ? 'mob' : 'pc'][r];
      model.letKamera(pos, cil, 1100);
    }
  }

  // ovládání (funguje i bez WebGL: plán + panel)
  root.querySelectorAll('[data-dum]').forEach((t) => t.addEventListener('click', () => {
    dum = +t.dataset.dum;
    root.querySelectorAll('[data-dum]').forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
    vyplnPanel(); vyplnPlan();
  }));
  root.querySelectorAll('[data-rezim]').forEach((t) => t.addEventListener('click', () => nastavRezim(t.dataset.rezim)));
  root.querySelectorAll('[data-filtr]').forEach((t) => t.addEventListener('click', () => {
    filtr = filtr === t.dataset.filtr ? null : t.dataset.filtr;
    root.querySelectorAll('[data-filtr]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filtr === filtr)));
    if (model) model.filtruj(filtr ? filtrFn[filtr] : null);
    vyplnPlan();
  }));
  tlacitka.forEach((t) => {
    const c = +t.dataset.c;
    t.addEventListener('click', () => vyber(c, true));
    t.addEventListener('mouseenter', () => najed(c));
    t.addEventListener('mouseleave', () => najed(null));
    t.addEventListener('focus', () => najed(c));
    t.addEventListener('blur', () => najed(null));
  });
  root.querySelectorAll('[data-otoc]').forEach((t) => t.addEventListener('click', () => model && model.otoc(+t.dataset.otoc * Math.PI / 5)));

  // živý model
  if (!webgl()) return;
  let spusteno = false;
  async function spust() {
    if (spusteno) return; spusteno = true;
    try {
      const { vytvorMaketu } = await import(root.dataset.modelSrc);
      const m = mob();
      model = vytvorMaketu(canvas, {
        ovladani: !dotyk, vyber: true, fov: m ? 32 : 24, bezAnimace: klid, maxDpr: m ? 1.75 : 1.5,
        stinMapa: m ? 1024 : 2048, pozadi: 0xefe9df, hemi: 0.62, slunce: 3.4,
        priNajeti: (c) => { najety = c; tlacitka.forEach((t) => t.classList.toggle('najety', +t.dataset.c === c)); ukazStitek(); },
        priVyberu: (c) => vyber(c, false),
        poSnimku: () => { if (najety) ukazStitek(); },
      });
      model.slunce.position.set(-40, 26, 14);
      const [pos, cil] = KAMERY[m ? 'mob' : 'pc'].dum;
      model.kamera(pos, cil);
      if (model.controls) { model.controls.minDistance = 22; model.controls.maxDistance = 90; }
      if (vybrany) model.vyber(vybrany);
      if (filtr) model.filtruj(filtrFn[filtr]);
      if (rezim !== 'dum') nastavRezim(rezim);
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('zive')));
      root.querySelector('.vb-otoc').hidden = false;
      const nap = root.querySelector('.vb-napoveda');
      if (!dotyk) { nap.hidden = false; canvas.addEventListener('pointerdown', () => { nap.style.opacity = 0; }, { once: true }); }
    } catch (e) {
      console.warn('Model se nepodařilo spustit, zůstává statický obrázek.', e);
    }
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((z) => { if (z.some((x) => x.isIntersecting)) { io.disconnect(); spust(); } }, { rootMargin: '500px 0px' });
    io.observe(root);
  } else spust();
});
