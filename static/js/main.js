document.documentElement.classList.add('js');

// Hlavička: po odjetí z hero dostane pozadí. Burger na mobilu.
(function () {
  var h = document.querySelector('.hlavicka');
  var menu = document.querySelector('.menu');
  var burger = document.querySelector('.burger');
  function stav() { h.classList.toggle('plna', window.scrollY > 40); }
  stav(); window.addEventListener('scroll', stav, { passive: true });
  if (burger) {
    burger.addEventListener('click', function () {
      var o = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!o)); menu.classList.toggle('otevrene', !o); h.classList.add('plna');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('otevrene'); }
    });
  }
})();

// Postupné odhalení při scrollu.
(function () {
  var el = document.querySelectorAll('.odhal');
  if (!('IntersectionObserver' in window)) { el.forEach(function (e) { e.classList.add('videt'); }); return; }
  var io = new IntersectionObserver(function (zaz) {
    zaz.forEach(function (z) { if (z.isIntersecting) { z.target.classList.add('videt'); io.unobserve(z.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  el.forEach(function (e) { io.observe(e); });
})();

// Půdorys bytu: místnost v seznamu <-> zóna v plánu.
(function () {
  var tl = document.querySelectorAll('[data-mistnost]');
  function zapni(id) { tl.forEach(function (t) { t.classList.toggle('aktivni', t.getAttribute('data-mistnost') === id); }); }
  tl.forEach(function (t) {
    var id = t.getAttribute('data-mistnost');
    t.addEventListener('mouseenter', function () { zapni(id); });
    t.addEventListener('focus', function () { zapni(id); });
    t.addEventListener('click', function () { zapni(id); });
  });
})();

function kc(n) { return Math.round(n).toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč'; }

// Rozpočet: kolik m² nového bytu dostanu v Praze a v Hradci.
(function () {
  var r = document.getElementById('rozpocet');
  if (!r) return;
  var out = document.getElementById('rozpocet-vystup');
  var cP = +r.dataset.praha, cH = +r.dataset.hradec;
  var mP = document.getElementById('m2-praha'), mH = document.getElementById('m2-hradec');
  var qP = document.getElementById('ctverec-praha'), qH = document.getElementById('ctverec-hradec');
  var max = (+r.max) / cH;
  function prepocet() {
    var v = +r.value, aP = v / cP, aH = v / cH;
    out.textContent = (v / 1e6).toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' mil. Kč';
    mP.textContent = Math.round(aP) + ' m²'; mH.textContent = Math.round(aH) + ' m²';
    // čtverec = plocha; strana úměrná odmocnině
    qP.style.width = qP.style.height = (Math.sqrt(aP / max) * 100) + '%';
    qH.style.width = qH.style.height = (Math.sqrt(aH / max) * 100) + '%';
  }
  r.addEventListener('input', prepocet); prepocet();
})();

// Výběr bytu: dům, podlaží, byt -> detail.
(function () {
  var data = document.getElementById('byty-data');
  if (!data) return;
  var domy = JSON.parse(data.textContent);
  var stav = { dum: 0, podlazi: 'prizemi', byt: null };
  var plan = document.getElementById('plan');
  var det = {
    nazev: document.getElementById('d-nazev'), sub: document.getElementById('d-sub'), plocha: document.getElementById('d-plocha'),
    venku: document.getElementById('d-venku'), venkuT: document.getElementById('d-venku-t'), kobka: document.getElementById('d-kobka'),
    celkem: document.getElementById('d-celkem'), cena: document.getElementById('d-cena'), m2: document.getElementById('d-m2'), btn: document.getElementById('d-btn')
  };
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a, t) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; }
  function cz(n) { return String(n).replace('.', ','); }

  function kresli() {
    while (plan.firstChild) plan.removeChild(plan.firstChild);
    var byty = domy[stav.dum].byty.filter(function (b) { return b.podlazi === stav.podlazi; });
    var W = 880, x0 = 30, sirka = 820, y0 = 70, hl = 210, n = byty.length, w = sirka / n;
    var pr = stav.podlazi === 'prizemi';
    // vnější pás: pavlač / zahrádky
    plan.appendChild(el('text', { x: x0, y: 22, class: 'strana' }, pr ? 'PŘÍZEMÍ · 8 BYTŮ' : 'PAVLAČ · 8 BYTŮ V PATŘE'));
    if (!pr) plan.appendChild(el('rect', { x: x0, y: 32, width: sirka, height: 26, class: 'pas' }));
    for (var i = 0; i < n; i++) {
      var b = byty[i], x = x0 + i * w;
      var g = el('g', { class: 'jednotka' + (stav.byt === b.cislo ? ' vybrana' : ''), tabindex: 0, role: 'button', 'aria-label': 'Byt ' + b.cislo + ', ' + b.dispozice + ', ' + kc(b.cena) });
      g.appendChild(el('rect', { x: x + 2, y: y0, width: w - 4, height: hl }));
      g.appendChild(el('text', { x: x + w / 2, y: y0 + hl / 2 - 10, 'text-anchor': 'middle' }, String(b.cislo)));
      g.appendChild(el('text', { x: x + w / 2, y: y0 + hl / 2 + 18, 'text-anchor': 'middle', class: 'm' }, b.dispozice));
      g.appendChild(el('text', { x: x + w / 2, y: y0 + hl / 2 + 36, 'text-anchor': 'middle', class: 'm' }, cz(b.plocha) + ' m²'));
      (function (b) {
        g.addEventListener('click', function () { vyber(b.cislo); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vyber(b.cislo); } });
      })(b);
      plan.appendChild(g);
      if (pr) plan.appendChild(el('rect', { x: x + 2, y: y0 + hl + 12, width: w - 4, height: 70, class: 'zahrada' }));
      if (pr) plan.appendChild(el('text', { x: x + w / 2, y: y0 + hl + 52, 'text-anchor': 'middle', class: 'strana' }, cz(b.venku) + ' m²'));
    }
    if (!pr) plan.appendChild(el('rect', { x: x0, y: y0 + hl + 12, width: sirka, height: 26, class: 'pas' }));
    plan.appendChild(el('text', { x: x0, y: pr ? y0 + hl + 106 : y0 + hl + 60, class: 'strana' }, pr ? 'ZAHRÁDKY BYTŮ V PŘÍZEMÍ' : 'BALKONY BYTŮ NA PATŘE'));
    plan.appendChild(el('rect', { x: x0, y: y0, width: sirka, height: hl, class: 'obrys' }));
    plan.setAttribute('viewBox', '0 0 ' + W + ' ' + (pr ? y0 + hl + 116 : y0 + hl + 70));
  }

  function vyber(c) {
    stav.byt = c;
    var b = domy[stav.dum].byty.filter(function (x) { return x.cislo === c; })[0];
    det.nazev.textContent = 'Byt č. ' + b.cislo;
    det.sub.textContent = domy[stav.dum].nazev + ' · ' + (b.podlazi === 'prizemi' ? 'přízemí se zahrádkou' : 'patro s balkonem');
    det.plocha.textContent = cz(b.plocha) + ' m²';
    det.venkuT.textContent = b.venku_typ.charAt(0).toUpperCase() + b.venku_typ.slice(1);
    det.venku.textContent = cz(b.venku) + ' m²';
    det.kobka.textContent = cz(b.kobka) + ' m²';
    det.celkem.textContent = cz(b.celkem) + ' m²';
    det.cena.textContent = kc(b.cena);
    det.m2.textContent = kc(b.cena_m2) + ' / m² bytu';
    det.btn.setAttribute('href', '#kontakt');
    det.btn.dataset.byt = domy[stav.dum].nazev + ', byt č. ' + b.cislo;
    kresli();
  }

  document.querySelectorAll('[data-dum]').forEach(function (t) {
    t.addEventListener('click', function () {
      stav.dum = +t.dataset.dum;
      document.querySelectorAll('[data-dum]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === t)); });
      var prvni = domy[stav.dum].byty.filter(function (b) { return b.podlazi === stav.podlazi; })[0];
      vyber(prvni.cislo);
    });
  });
  document.querySelectorAll('[data-podlazi]').forEach(function (t) {
    t.addEventListener('click', function () {
      stav.podlazi = t.dataset.podlazi;
      document.querySelectorAll('[data-podlazi]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === t)); });
      var prvni = domy[stav.dum].byty.filter(function (b) { return b.podlazi === stav.podlazi; })[0];
      vyber(prvni.cislo);
    });
  });
  det.btn.addEventListener('click', function () {
    var s = document.querySelector('.formular select[name=byt]');
    if (s && det.btn.dataset.byt) {
      var o = Array.prototype.find.call(s.options, function (x) { return x.value === det.btn.dataset.byt; });
      if (!o) { o = new Option(det.btn.dataset.byt, det.btn.dataset.byt); s.add(o, 1); }
      s.value = det.btn.dataset.byt;
    }
  });
  vyber(domy[0].byty[0].cislo);
})();

// Formulář: demo režim neodesílá nic, ostrý režim posílá na endpoint ze site.json (data-endpoint).
(function () {
  document.querySelectorAll('form.formular').forEach(function (f) {
    var stav = f.querySelector('.formular-stav');
    f.addEventListener('submit', function (e) {
      var endpoint = f.getAttribute('data-endpoint');
      var demo = f.getAttribute('data-demo') === '1';
      if (f.querySelector('.past input').value) { e.preventDefault(); return; }
      e.preventDefault();
      if (demo || !endpoint) {
        stav.textContent = 'Ukázka formuláře: zatím se nic neodesílá. Po spuštění webu přijde zpráva přímo paní Krčmové.';
        return;
      }
      stav.textContent = 'Odesílám…';
      fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); stav.textContent = 'Děkujeme, ozveme se vám co nejdřív.'; })
        .catch(function () { stav.textContent = 'Odeslání se nepodařilo. Zkuste to prosím znovu.'; });
    });
  });
})();
