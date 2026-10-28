// Rezidence Metelka v5 – vanilla JS, nativní scroll (žádný Lenis ani ScrollTrigger).
(function () {
  var f = { dum: 'vse', patro: 'vse' };
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  // Hlavička: průhledná nad úvodní fotkou, po odjetí tmavé sklo. Burger otevírá panel.
  var h = $('[data-hl]'), burger = $('.burger'), panel = $('#panel');
  if (h) {
    var stav = function () { h.classList.toggle('plna', window.scrollY > 40); };
    stav(); window.addEventListener('scroll', stav, { passive: true });
  }
  if (burger && panel) {
    var nastav = function (o) {
      burger.setAttribute('aria-expanded', String(o));
      burger.setAttribute('aria-label', o ? 'Zavřít menu' : 'Otevřít menu');
      panel.hidden = !o; d.body.classList.toggle('menu-otevrene', o);
    };
    burger.addEventListener('click', function () { nastav(burger.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) nastav(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { nastav(false); burger.focus(); } });
    window.matchMedia('(min-width: 64rem)').addEventListener('change', function (m) { if (m.matches) nastav(false); });
  }

  // Postupné odhalení.
  var od = $$('.odhal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (z) { z.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('videt'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    od.forEach(function (e) { io.observe(e); });
  } else od.forEach(function (e) { e.classList.add('videt'); });

  // Půdorys: místnost v seznamu <-> zóna v plánu.
  $$('.pudorys').forEach(function (p) {
    var tl = $$('[data-mistnost]', p);
    var zapni = function (id) { tl.forEach(function (t) { t.classList.toggle('aktivni', t.getAttribute('data-mistnost') === id); }); };
    tl.forEach(function (t) { ['mouseenter', 'focus', 'click'].forEach(function (ev) { t.addEventListener(ev, function () { zapni(t.getAttribute('data-mistnost')); }); }); });
    p.addEventListener('mouseleave', function () { zapni(null); });
  });

  // Výběr bytu na fasádě (stránka Byty): přepínač domů, značky na oknech, skleněná karta.
  var fas = $('[data-fasada]');
  if (fas) {
    var karta = $('[data-karta]', fas), platno = $('.vb-platno', fas), tabs = $$('.prepinac [role=tab]');
    var mys = window.matchMedia('(hover: hover) and (min-width: 48rem)');
    var vyber = function (a, posun) {
      var li = a.parentNode;
      $$('.body li', fas).forEach(function (x) { x.classList.toggle('je-vybrany', x === li); });
      var k = a.dataset;
      karta.href = a.href;
      $('[data-k=kod]', karta).textContent = k.kod;
      $('[data-k=cena]', karta).textContent = k.cena;
      $('[data-k=venku]', karta).textContent = k.venku;
      $('[data-k=patro]', karta).textContent = k.dumNazev + ' · ' + k.patro;
      if (mys.matches) {
        // karta plave na obloze nad zvoleným oknem, značky na fasádě nezakrývá
        var x = parseFloat(li.style.left);
        karta.style.left = Math.min(Math.max(x, 13), 87) + '%';
        karta.classList.add('pod');
      } else { karta.style.left = ''; karta.classList.remove('pod'); }
      if (posun && fas.scrollWidth > fas.clientWidth) fas.scrollTo({ left: li.offsetLeft - fas.clientWidth / 2, behavior: 'smooth' });
    };
    var dum = function (slug) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.dum === slug)); });
      $$('.body', fas).forEach(function (o) { o.hidden = o.dataset.dum !== slug; });
    };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var byl = $('.body:not([hidden]) li.je-vybrany a', fas), c = byl ? byl.dataset.kod.split('.')[1] : '12';
        dum(t.dataset.dum);
        var cil = $('.body:not([hidden]) a[data-kod$=".' + c + '"]', fas);
        if (cil) vyber(cil, true);
      });
    });
    $$('.body a', fas).forEach(function (a) {
      a.addEventListener('mouseenter', function () { if (mys.matches) vyber(a, false); });
      a.addEventListener('focus', function () { vyber(a, false); });
      a.addEventListener('click', function (e) {
        // dotyk: první klepnutí byt vybere a ukáže kartu, druhé otevře kartu bytu
        if (!mys.matches && !a.parentNode.classList.contains('je-vybrany')) { e.preventDefault(); vyber(a, true); }
      });
    });
    // #k-metelce-ii-patro z lišty na úvodu: dům + podlaží
    var hash = location.hash.slice(1), mh = hash.match(/^(k-metelce-i{1,2})-(prizemi|patro)$/);
    var start = $('.body li.je-vybrany a', fas);
    if (mh) {
      dum(mh[1]);
      start = $('.body[data-dum="' + mh[1] + '"] li[data-podlazi="' + mh[2] + '"] a', fas);
      filtr({ dum: mh[1], patro: mh[2] });
    }
    if (start) vyber(start, true);
    mys.addEventListener('change', function () { var v = $('.body:not([hidden]) li.je-vybrany a', fas); if (v) vyber(v, false); });
  }

  // Ceník: filtr domu a podlaží.
  function filtr(n) {
    if (n.dum) f.dum = n.dum; if (n.patro) f.patro = n.patro;
    $$('[data-f-dum]').forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.fDum === f.dum)); });
    $$('[data-f-patro]').forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.fPatro === f.patro)); });
    $$('a.radek[data-podlazi]').forEach(function (r) { r.hidden = !((f.dum === 'vse' || r.dataset.dum === f.dum) && (f.patro === 'vse' || r.dataset.podlazi === f.patro)); });
  }
  $$('[data-f-dum]').forEach(function (t) { t.addEventListener('click', function () { filtr({ dum: t.dataset.fDum }); }); });
  $$('[data-f-patro]').forEach(function (t) { t.addEventListener('click', function () { filtr({ patro: t.dataset.fPatro }); }); });

  // Praha, nebo Hradec: kolik m² za rozpočet.
  var r = $('#rozpocet');
  if (r) {
    var out = $('#rozpocet-vystup'), cP = +r.dataset.praha, cH = +r.dataset.hradec, max = (+r.max) / cH;
    var mP = $('#m2-praha'), mH = $('#m2-hradec'), qP = $('#ctverec-praha'), qH = $('#ctverec-hradec');
    var prepocet = function () {
      var v = +r.value, aP = v / cP, aH = v / cH;
      out.textContent = (v / 1e6).toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' mil. Kč';
      mP.textContent = Math.round(aP) + ' m²'; mH.textContent = Math.round(aH) + ' m²';
      qP.style.width = qP.style.height = (Math.sqrt(aP / max) * 100) + '%';
      qH.style.width = qH.style.height = (Math.sqrt(aH / max) * 100) + '%';
      r.style.setProperty('--p', ((v - r.min) / (r.max - r.min) * 100) + '%');
    };
    r.addEventListener('input', prepocet); prepocet();
  }

  // Kontakt: ?byt=I.03 předvybere byt ve formuláři.
  var s = $('.formular select[name=byt]'), byt = new URLSearchParams(location.search).get('byt');
  if (s && byt && $$('option', s).some(function (o) { return o.value === 'Byt ' + byt; })) s.value = 'Byt ' + byt;

  // Formulář: v návrhu jen ukázka, nic se neodesílá.
  $$('.formular').forEach(function (fm) {
    fm.addEventListener('submit', function (e) {
      var st = $('.formular-stav', fm);
      if (fm.dataset.demo === '1') { e.preventDefault(); st.textContent = 'Děkujeme. V tomto návrhu se formulář zatím neodesílá, na hotovém webu zpráva přijde přímo makléřce.'; return; }
      if (!window.fetch) return;
      e.preventDefault(); st.textContent = 'Odesílám…';
      fetch(fm.dataset.endpoint, { method: 'POST', body: new FormData(fm), headers: { Accept: 'application/json' } })
        .then(function (x) { if (!x.ok) throw x; fm.reset(); st.textContent = 'Děkujeme, ozveme se vám.'; })
        .catch(function () { st.textContent = 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.'; });
    });
  });

  $$('.tisk').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  // Galerie: lightbox s listováním.
  var lb = $('.lightbox');
  if (lb && lb.showModal) {
    var pol = $$('.g-polozka'), im = $('img', lb), pop = $('.lb-popis', lb), i = 0;
    var ukaz = function (n) { i = (n + pol.length) % pol.length; var a = pol[i], m = $('img', a); im.src = a.href; im.alt = m ? m.alt : ''; pop.textContent = a.dataset.popis || ''; };
    pol.forEach(function (a, n) { a.addEventListener('click', function (e) { e.preventDefault(); ukaz(n); lb.showModal(); }); });
    $('.lb-zavrit', lb).addEventListener('click', function () { lb.close(); });
    $('.lb-pred', lb).addEventListener('click', function () { ukaz(i - 1); });
    $('.lb-dal', lb).addEventListener('click', function () { ukaz(i + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') ukaz(i - 1); if (e.key === 'ArrowRight') ukaz(i + 1); });
  }
})();
