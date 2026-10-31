// Rezidence Metelka – drobné vanilla JS, nativní scroll.
document.documentElement.classList.add('js');

// Hlavička: nad úvodní fotkou průhledná, po odjetí plná. Burger otevírá panel.
(function () {
  var h = document.querySelector('.hlavicka');
  if (!h) return;
  var burger = h.querySelector('.burger');
  var panel = document.getElementById('panel');
  function stav() { h.classList.toggle('plna', window.scrollY > 10); }
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
  window.matchMedia('(min-width: 64.01rem)').addEventListener('change', function (m) { if (m.matches) nastav(false); });
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

// Úvodní model: kóty se dokreslí po načtení obrázku.
document.querySelectorAll('.uvodni-model').forEach(function (f) {
  var i = f.querySelector('img');
  function hotovo() { f.classList.add('nacteno'); }
  if (!i || i.complete) hotovo(); else { i.addEventListener('load', hotovo); i.addEventListener('error', hotovo); }
});

// Úvodní model: zvednutí střechy podle posunu stránky. Kde CSS scroll-driven animace nejsou (Firefox, starší Safari),
// dopočítá se totéž tady; jen transform a opacity, překresluje se jen při scrollu.
(function () {
  var f = document.querySelector('[data-maketa]');
  if (!f || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')) return;
  var viko = f.querySelector('.um-viko'), zav = f.querySelector('.kotvy-zavreno'), otv = f.querySelector('.kotvy-otevreno');
  var ceka = false;
  function r(a, b, y) { return Math.min(1, Math.max(0, (y - a) / (b - a))); }
  function krok() {
    ceka = false;
    var vh = window.innerHeight / 100, y = window.scrollY, m = window.innerWidth < 768;
    if (y > 120 * vh) return;
    var p = m ? r(10 * vh, 58 * vh, y) : r(2 * vh, 44 * vh, y);
    var o = p < 0.28 ? 1 : p < 0.72 ? 1 - 0.78 * (p - 0.28) / 0.44 : 0.22 * (1 - (p - 0.72) / 0.28);
    viko.style.transform = p ? 'translate3d(0,' + (-22 * p) + '%,0)' : '';
    viko.style.opacity = o;
    var z = 1 - (m ? r(0, 18 * vh, y) : r(0, 14 * vh, y)); zav.style.opacity = z; zav.style.visibility = z ? 'visible' : 'hidden';
    var q = m ? r(42 * vh, 60 * vh, y) : r(28 * vh, 46 * vh, y); otv.style.opacity = q; otv.style.visibility = q ? 'visible' : 'hidden';
    otv.style.transform = 'translate3d(0,' + (0.8 * (1 - q)) + 'rem,0)';
  }
  window.addEventListener('scroll', function () { if (!ceka) { ceka = true; requestAnimationFrame(krok); } }, { passive: true });
  krok();
})();

// Seznam bytů: filtr zahrádka / balkon.
(function () {
  var radky = document.querySelectorAll('a.radek[data-podlazi]');
  if (!radky.length) return;
  var tl = document.querySelectorAll('[data-cenik-filtr]');
  function filtr(f) {
    tl.forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.cenikFiltr === f)); });
    radky.forEach(function (r) { r.hidden = !(f === 'vse' || r.dataset.podlazi === f); });
  }
  tl.forEach(function (t) { t.addEventListener('click', function () { filtr(t.dataset.cenikFiltr); }); });
  document.querySelectorAll('[data-filtr-odkaz]').forEach(function (a) {
    a.addEventListener('click', function () { filtr(a.dataset.filtrOdkaz); });
  });
  var q = new URLSearchParams(location.search).get('filtr');
  if (q === 'prizemi' || q === 'patro') filtr(q);
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
