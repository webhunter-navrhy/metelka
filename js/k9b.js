// Varianta B: výběr bytu ve výkresu – najetí ukáže kartu bytu, přepínač domu změní odkazy.
(() => {
  const data = JSON.parse(document.getElementById('b-data').textContent);
  const karta = document.querySelector('.b-karta');
  const prazdna = karta.querySelector('.b-karta-prazdna');
  const plna = karta.querySelector('.b-karta-byt');
  const prvky = [...document.querySelectorAll('.x-byt, .b-c')];
  let dum = 0, vybrany = null;

  const ukaz = c => {
    const b = data[dum].byty[c - 1];
    if (!b) return;
    const k = n => karta.querySelector(`[data-k="${n}"]`);
    k('dum').textContent = data[dum].nazev;
    k('kod').textContent = b.kod;
    k('patro').textContent = b.patro;
    k('plocha').textContent = b.plocha;
    k('venku_typ').textContent = b.vt;
    k('venku').textContent = b.venku;
    k('cena').textContent = b.cena;
    k('odkaz').href = b.url;
    karta.querySelectorAll('[data-f]').forEach(f => { f.hidden = f.dataset.f !== b.p; });
    prazdna.hidden = true;
    plna.hidden = false;
    prvky.forEach(el => el.classList.toggle('je', +el.dataset.c === c));
  };
  const zpet = () => {
    if (vybrany) return ukaz(vybrany);
    prazdna.hidden = false;
    plna.hidden = true;
    prvky.forEach(el => el.classList.remove('je'));
  };

  const dotyk = matchMedia('(hover: none)').matches;
  prvky.forEach(el => {
    const c = +el.dataset.c;
    el.addEventListener('mouseenter', () => ukaz(c));
    el.addEventListener('focus', () => ukaz(c));
    el.addEventListener('mouseleave', zpet);
    // na dotyku první klepnutí byt vybere, druhé otevře kartu
    el.addEventListener('click', e => {
      if (dotyk && vybrany !== c) { e.preventDefault(); vybrany = c; ukaz(c); }
    });
  });

  document.querySelectorAll('.b-dum-tl').forEach(tl => tl.addEventListener('click', () => {
    dum = +tl.dataset.d;
    document.querySelectorAll('.b-dum-tl').forEach(t => t.setAttribute('aria-pressed', t === tl));
    document.querySelector('[data-k="dum-r"]').textContent = data[dum].nazev;
    prvky.forEach(el => {
      const b = data[dum].byty[+el.dataset.c - 1];
      el.setAttribute('href', b.url);
      if (el.matches('.x-byt')) el.setAttribute('aria-label', `Byt ${b.kod}, ${b.patro}, ${b.cena}`);
    });
    if (vybrany) ukaz(vybrany);
  }));
})();
