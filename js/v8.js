/* Rezidence Metelka v8 – menu, odhalování, výběr bytu na kresbě domu, filtry ceníku, půdorys, kalkulačka, formulář */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cz = n => Math.round(n).toLocaleString('cs-CZ');

  // Mobilní menu
  const burger = $('.burger'), panel = $('#panel');
  if (burger && panel) {
    const prepni = otevrit => {
      burger.setAttribute('aria-expanded', otevrit);
      burger.setAttribute('aria-label', otevrit ? 'Zavřít menu' : 'Otevřít menu');
      panel.hidden = !otevrit;
      document.body.classList.toggle('menu-otevrene', otevrit);
    };
    burger.addEventListener('click', () => prepni(burger.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) prepni(false); });
    $$('a', panel).forEach(a => a.addEventListener('click', () => prepni(false)));
  }

  // Postupné odhalení
  const odhal = $$('.odhal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(zaznamy => zaznamy.forEach(z => {
      if (z.isIntersecting) { z.target.classList.add('vidi'); io.unobserve(z.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    odhal.forEach(el => io.observe(el));
  } else odhal.forEach(el => el.classList.add('vidi'));

  const stiskni = (skupina, tlacitko) => $$('button', skupina).forEach(b => b.setAttribute('aria-pressed', b === tlacitko));

  // Kresba domu: najetí na byt přepíše kartu, přepínač domů
  $$('[data-kresba]').forEach(obal => {
    const karta = $('[data-karta]', obal);
    const sekce = obal.closest('section') || document;
    const vyberDum = $('[data-kresba-dum]', sekce);
    const ukaz = a => {
      $$('.k-byt', obal).forEach(x => x.classList.toggle('je-vybrany', x === a));
      if (!karta) return;
      ['kod', 'cena', 'venku', 'patro'].forEach(k => { const el = $(`[data-k=${k}]`, karta); if (el) el.textContent = a.dataset[k]; });
      karta.href = a.getAttribute('href');
    };
    const prepniDum = (slug, patro) => {
      if (vyberDum) $$('button', vyberDum).forEach(b => b.setAttribute('aria-pressed', b.dataset.dum === slug));
      $$('.k-byty', obal).forEach(g => { if (g.dataset.dum === slug) g.removeAttribute('hidden'); else g.setAttribute('hidden', ''); });
      const g = $(`.k-byty[data-dum="${slug}"]`, obal);
      const a = g && $$(`.k-byt[data-podlazi="${patro || 'prizemi'}"]`, g)[3];
      if (a) ukaz(a);
    };
    vyberDum && vyberDum.addEventListener('click', e => {
      const b = e.target.closest('button'); if (b) prepniDum(b.dataset.dum);
    });
    $$('.k-byt', obal).forEach(a => {
      a.addEventListener('mouseenter', () => ukaz(a));
      a.addEventListener('focus', () => ukaz(a));
    });
    // Na úvodu první byt zvýrazněný, aby bylo vidět, co karta ukazuje
    if (karta && !$('.k-byt.je-vybrany', obal)) { const g = $('.k-byty:not([hidden])', obal); const a = g && $$('.k-byt[data-podlazi="prizemi"]', g)[3]; if (a) ukaz(a); }
    // #k-metelce-ii-patro, #prizemi, #patro
    if (!obal.hasAttribute('data-hash')) return;
    const h = decodeURIComponent(location.hash.slice(1));
    const m = h.match(/^(.*?)-?(prizemi|patro)$/);
    if (m) {
      const slug = m[1] && $(`.k-byty[data-dum="${m[1]}"]`, obal) ? m[1] : $('.k-byty', obal).dataset.dum;
      prepniDum(slug, m[2]);
      const f = $('[data-f=podlazi]');
      if (f) { const b = $(`[data-v=${m[2]}]`, f); b && b.click(); }
      if (m[1]) { const f2 = $('[data-f=dum]'), b2 = f2 && $(`[data-v="${m[1]}"]`, f2); b2 && b2.click(); }
      if (h === 'prizemi' || h === 'patro') { const c = $('#cenik'); c && c.scrollIntoView(); }
    }
  });

  // Na úzkém displeji posunout kresbu tak, aby byl vybraný byt uprostřed
  $$('.kresba-posun').forEach(el => {
    const v = $('.k-byt.je-vybrany .k-plocha', el);
    if (!v || el.scrollWidth <= el.clientWidth) return;
    const r = v.getBoundingClientRect(), o = el.getBoundingClientRect();
    el.scrollLeft += r.left + r.width / 2 - o.left - o.width / 2;
  });

  // Ceník: filtr
  const fDum = $('[data-f=dum]'), fPod = $('[data-f=podlazi]');
  if (fDum && fPod) {
    const st = { dum: 'vse', podlazi: 'vse' };
    const pocet = $('[data-pocet]');
    const filtruj = () => {
      let n = 0;
      $$('a.radek').forEach(r => {
        const ano = (st.dum === 'vse' || r.dataset.dum === st.dum) && (st.podlazi === 'vse' || r.dataset.podlazi === st.podlazi);
        r.hidden = !ano; if (ano) n++;
      });
      if (pocet) pocet.textContent = n;
    };
    [[fDum, 'dum'], [fPod, 'podlazi']].forEach(([seg, k]) => seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      stiskni(seg, b); st[k] = b.dataset.v; filtruj();
    }));
  }

  // Půdorys: zóny a seznam místností
  $$('.pudorys').forEach(p => {
    const vse = $$('[data-mistnost]', p);
    const zvyrazni = m => vse.forEach(el => el.classList.toggle('aktivni', el.dataset.mistnost === m));
    vse.forEach(el => {
      el.addEventListener('mouseenter', () => zvyrazni(el.dataset.mistnost));
      el.addEventListener('focus', () => zvyrazni(el.dataset.mistnost));
      el.addEventListener('click', () => zvyrazni(el.dataset.mistnost));
    });
    p.addEventListener('mouseleave', () => zvyrazni(null));
  });

  // Kalkulačka Praha, nebo Hradec
  const roz = $('#rozpocet');
  if (roz) {
    const out = $('#rozpocet-vystup'), mh = $('#m2-hradec'), mp = $('#m2-praha');
    const ch = $('#ctverec-hradec'), cp = $('#ctverec-praha');
    const praha = +roz.dataset.praha, hradec = +roz.dataset.hradec;
    const prepocet = () => {
      const k = +roz.value, h = k / hradec, p = k / praha;
      out.textContent = (k / 1e6).toLocaleString('cs-CZ', { maximumFractionDigits: 2 }) + ' mil. Kč';
      mh.textContent = cz(h) + ' m²'; mp.textContent = cz(p) + ' m²';
      const max = Math.sqrt(10e6 / hradec);
      ch.style.setProperty('--w', `calc(var(--plocha-max) * ${Math.sqrt(h) / max})`);
      cp.style.setProperty('--w', `calc(var(--plocha-max) * ${Math.sqrt(p) / max})`);
    };
    roz.addEventListener('input', prepocet); prepocet();
  }

  // Kontakt: předvybraný byt z ?byt=
  const sel = $('select[name=byt]');
  if (sel) {
    const byt = new URLSearchParams(location.search).get('byt');
    if (byt) [...sel.options].forEach(o => { if (o.value === byt) o.selected = true; });
  }

  // Formulář v ukázkovém režimu
  $$('form[data-demo]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const s = $('.formular-stav', f);
    if (s) s.textContent = 'Děkujeme. Toto je ukázka webu, zpráva se zatím nikam neodesílá.';
  }));

  // Tisk karty bytu
  $$('.tisk').forEach(b => b.addEventListener('click', () => window.print()));
})();
