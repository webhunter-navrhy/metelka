/* Rezidence Metelka v6 – menu, odhalování, výběr bytu na maketě, filtry ceníku, půdorys, kalkulačka, formulář */
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

  // Úvod: výběr domu a patra
  const vyber = $('[data-vyber]');
  if (vyber) {
    const stav = { dum: $('[data-k=dum] button', vyber).dataset.v, patro: 'prizemi' };
    const vysl = $('[data-o=vysl]', vyber), odkaz = $('[data-o=odkaz]', vyber);
    const domy = Object.fromEntries($$('[data-k=dum] button', vyber).map(b => [b.dataset.v, b.textContent]));
    const kresli = () => {
      vysl.textContent = `${domy[stav.dum]} · byty ${stav.patro === 'prizemi' ? '1–8' : '9–16'}`;
      odkaz.href = odkaz.href.split('#')[0] + `#${stav.dum}-${stav.patro}`;
      $$('.karta', vyber).forEach(k => k.classList.toggle('vybrana', k.dataset.p === stav.patro));
    };
    $$('.seg', vyber).forEach(seg => seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      stiskni(seg, b); stav[seg.dataset.k] = b.dataset.v; kresli();
    }));
    $$('.cena-k', vyber).forEach(c => c.addEventListener('mouseenter', () => {
      stav.patro = c.dataset.patro;
      stiskni($('[data-k=patro]', vyber), $(`[data-k=patro] [data-v=${stav.patro}]`, vyber));
      kresli();
    }));
  }

  // Byty: výběr na maketě
  const fasada = $('[data-fasada]');
  if (fasada) {
    const zvyr = $('[data-zvyr]', fasada), karta = $('[data-karta]', fasada);
    const vyberDum = $('[data-fasada-dum]');
    const ukaz = li => {
      $$('.body li', fasada).forEach(x => x.classList.toggle('je-vybrany', x === li));
      zvyr.setAttribute('style', li.dataset.ram);
      const a = $('a', li);
      ['kod', 'cena', 'venku', 'patro'].forEach(k => { const el = $(`[data-k=${k}]`, karta); if (el) el.textContent = a.dataset[k]; });
      karta.href = a.href;
    };
    const prepniDum = (slug, patro) => {
      $$('button', vyberDum).forEach(b => {
        const ano = b.dataset.dum === slug;
        b.setAttribute('aria-pressed', ano); b.setAttribute('aria-selected', ano);
      });
      $$('.body', fasada).forEach(ol => { ol.hidden = ol.dataset.dum !== slug; });
      const ol = $(`.body[data-dum="${slug}"]`, fasada);
      const li = $$(`li[data-podlazi="${patro || 'prizemi'}"]`, ol)[3];
      if (li) ukaz(li);
    };
    vyberDum && vyberDum.addEventListener('click', e => {
      const b = e.target.closest('button'); if (b) prepniDum(b.dataset.dum);
    });
    $$('.body li', fasada).forEach(li => {
      li.addEventListener('mouseenter', () => ukaz(li));
      $('a', li).addEventListener('focus', () => ukaz(li));
    });
    // #k-metelce-ii-patro, #prizemi, #patro
    const h = decodeURIComponent(location.hash.slice(1));
    const m = h.match(/^(.*?)-?(prizemi|patro)$/);
    if (m) {
      const slug = m[1] && $(`.body[data-dum="${m[1]}"]`, fasada) ? m[1] : $('.body', fasada).dataset.dum;
      prepniDum(slug, m[2]);
      const f = $('[data-f=podlazi]');
      if (f) { const b = $(`[data-v=${m[2]}]`, f); b && b.click(); }
      if (m[1]) { const f2 = $('[data-f=dum]'), b2 = f2 && $(`[data-v="${m[1]}"]`, f2); b2 && b2.click(); }
      if (h === 'prizemi' || h === 'patro') { const c = $('#cenik'); c && c.scrollIntoView(); }
    }
  }

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
