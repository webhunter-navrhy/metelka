// Rezidence Metelka – drobné vanilla JS, nativní scroll.
document.documentElement.classList.add('js');

// Hlavička: nad úvodní fotkou průhledná, po odjetí plná. Burger otevírá panel.
(function () {
  var h = document.querySelector('.hlavicka');
  if (!h) return;
  var burger = h.querySelector('.burger');
  var panel = document.getElementById('panel');
  function stav() { h.classList.toggle('plna', window.scrollY > 60); }
  stav(); window.addEventListener('scroll', stav, { passive: true });
  if (!burger || !panel) return;
  function nastav(o) {
    burger.setAttribute('aria-expanded', String(o));
    burger.setAttribute('aria-label', o ? 'Zavřít menu' : 'Otevřít menu');
    panel.hidden = !o;
    h.classList.toggle('otevrena', o);
    document.body.style.overflow = o ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { nastav(burger.getAttribute('aria-expanded') !== 'true'); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) nastav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { nastav(false); burger.focus(); } });
  window.matchMedia('(min-width: 68.01rem)').addEventListener('change', function (m) { if (m.matches) nastav(false); });
})();

// Postupné odhalení při scrollu.
(function () {
  var el = document.querySelectorAll('.odhal');
  if (!('IntersectionObserver' in window)) { el.forEach(function (e) { e.classList.add('videt'); }); return; }
  var io = new IntersectionObserver(function (zaz) {
    zaz.forEach(function (z) { if (z.isIntersecting) { z.target.classList.add('videt'); io.unobserve(z.target); } });
  }, { rootMargin: '0px 0px -6% 0px' });
  el.forEach(function (e) { io.observe(e); });
})();

// Půdorys: místnost v seznamu <-> zóna v plánu.
document.querySelectorAll('.pudorys').forEach(function (p) {
  var tl = p.querySelectorAll('[data-mistnost]');
  function zapni(id) { tl.forEach(function (t) { t.classList.toggle('aktivni', t.getAttribute('data-mistnost') === id); }); }
  tl.forEach(function (t) {
    var id = t.getAttribute('data-mistnost');
    ['mouseenter', 'focus', 'click'].forEach(function (ev) { t.addEventListener(ev, function () { zapni(id); }); });
  });
  p.addEventListener('mouseleave', function () { zapni(null); });
});

// Fasáda: přepínání domů a popis bytu pod schématem.
document.querySelectorAll('.vyber').forEach(function (s) {
  var taby = s.querySelectorAll('[data-dum-tab]');
  var panely = s.querySelectorAll('[data-dum-panel]');
  var kod = s.querySelector('.fi-kod'), text = s.querySelector('.fi-text');
  var vychozi = text ? text.textContent : '';
  function dum(slug) {
    taby.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.dumTab === slug)); });
    panely.forEach(function (p) { if (p.dataset.dumPanel === slug) p.removeAttribute('data-skryt'); else p.setAttribute('data-skryt', ''); });
    var t = s.querySelector('[data-dum-tab="' + slug + '"]');
    if (kod && t) kod.textContent = t.textContent;
    if (text) text.textContent = vychozi;
  }
  taby.forEach(function (t) { t.addEventListener('click', function () { dum(t.dataset.dumTab); }); });
  s.querySelectorAll('.f-byt').forEach(function (b) {
    function ukaz() {
      s.querySelectorAll('.f-byt.aktivni').forEach(function (x) { x.classList.remove('aktivni'); });
      b.classList.add('aktivni');
      if (kod) kod.textContent = 'Byt ' + b.dataset.kod;
      if (text) text.textContent = b.dataset.info;
    }
    b.addEventListener('mouseenter', ukaz); b.addEventListener('focus', ukaz);
  });
});

// Seznam bytů: filtr zahrádka / balkon.
(function () {
  var radky = document.querySelectorAll('a.radek[data-podlazi]');
  if (!radky.length) return;
  var tl = document.querySelectorAll('[data-filtr]');
  function filtr(f) {
    tl.forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.filtr === f)); });
    radky.forEach(function (r) { r.hidden = !(f === 'vse' || r.dataset.podlazi === f); });
  }
  tl.forEach(function (t) { t.addEventListener('click', function () { filtr(t.dataset.filtr); }); });
  document.querySelectorAll('[data-filtr-odkaz]').forEach(function (a) {
    a.addEventListener('click', function () { filtr(a.dataset.filtrOdkaz); });
  });
})();

// Praha, nebo Hradec: kolik m² za rozpočet.
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
    out.textContent = (v / 1e6).toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' mil. Kč';
    mP.textContent = Math.round(aP) + ' m²'; mH.textContent = Math.round(aH) + ' m²';
    qP.style.width = qP.style.height = (Math.sqrt(aP / max) * 100) + '%';
    qH.style.width = qH.style.height = (Math.sqrt(aH / max) * 100) + '%';
  }
  r.addEventListener('input', prepocet); prepocet();
})();

// Kontakt: ?byt=I.03 předvybere byt ve formuláři.
(function () {
  var s = document.querySelector('.formular select[name=byt]');
  if (!s) return;
  var byt = new URLSearchParams(location.search).get('byt');
  if (byt && Array.prototype.some.call(s.options, function (o) { return o.value === 'Byt ' + byt; })) s.value = 'Byt ' + byt;
})();

// Formulář: v návrhu jen ukázka, nic se neodesílá.
document.querySelectorAll('.formular').forEach(function (f) {
  f.addEventListener('submit', function (e) {
    var stav = f.querySelector('.formular-stav');
    if (f.dataset.demo === '1') {
      e.preventDefault();
      stav.textContent = 'Děkujeme. V tomto návrhu se formulář zatím neodesílá, na hotovém webu zpráva přijde přímo makléřce.';
      return;
    }
    if (!window.fetch) return;
    e.preventDefault();
    stav.textContent = 'Odesílám…';
    fetch(f.dataset.endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw r; f.reset(); stav.textContent = 'Děkujeme, ozveme se vám.'; })
      .catch(function () { stav.textContent = 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.'; });
  });
});

// Tisk karty bytu.
document.querySelectorAll('.tisk').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

// Galerie: lightbox s listováním.
(function () {
  var d = document.querySelector('.lightbox');
  if (!d || !d.showModal) return;
  var pol = Array.prototype.slice.call(document.querySelectorAll('.g-polozka'));
  var img = d.querySelector('img'), pop = d.querySelector('.lb-popis'), i = 0;
  function ukaz(n) {
    i = (n + pol.length) % pol.length;
    var a = pol[i], m = a.querySelector('img');
    img.src = a.href; img.alt = m ? m.alt : '';
    pop.textContent = a.dataset.popis || '';
  }
  pol.forEach(function (a, n) {
    a.addEventListener('click', function (e) { e.preventDefault(); ukaz(n); d.showModal(); });
  });
  d.querySelector('.lb-zavrit').addEventListener('click', function () { d.close(); });
  d.querySelector('.lb-pred').addEventListener('click', function () { ukaz(i - 1); });
  d.querySelector('.lb-dal').addEventListener('click', function () { ukaz(i + 1); });
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') ukaz(i - 1);
    if (e.key === 'ArrowRight') ukaz(i + 1);
  });
})();
