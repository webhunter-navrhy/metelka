/* Rezidence Metelka v9 – menu, odhalování, průchod bytem, výběr domu, ceník, půdorys, kalkulačka, formulář */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cz = n => Math.round(n).toLocaleString('cs-CZ');
  const pozoruj = (prvky, fn, moznosti) => {
    if (!('IntersectionObserver' in window)) { prvky.forEach(el => fn(el, true)); return; }
    const io = new IntersectionObserver(zaznamy => zaznamy.forEach(z => z.isIntersecting && fn(z.target, io)), moznosti);
    prvky.forEach(el => io.observe(el));
  };

  // Mobilní menu
  const burger = $('.hl-burger'), panel = $('#panel');
  if (burger && panel) {
    const prepni = otevrit => {
      burger.setAttribute('aria-expanded', otevrit);
      burger.setAttribute('aria-label', otevrit ? 'Zavřít menu' : 'Otevřít menu');
      panel.hidden = !otevrit;
      document.body.classList.toggle('menu-otevrene', otevrit);
    };
    burger.addEventListener('click', () => prepni(burger.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { prepni(false); burger.focus(); } });
    $$('a', panel).forEach(a => a.addEventListener('click', () => prepni(false)));
    matchMedia('(min-width: 1181px)').addEventListener('change', e => e.matches && prepni(false));
  }

  // Postupné odhalení (prvky, časová osa, fotky ve scénách)
  pozoruj($$('.odhal, .casy, .kb-fotky'), (el, io) => { el.classList.add('vid'); io.unobserve && io.unobserve(el); }, { rootMargin: '0px 0px -10% 0px' });

  // Průchod bytem: místnost, kterou právě čtete, se rozsvítí v půdorysu
  const sceny = $$('.scena[data-z]');
  if (sceny.length) {
    const zony = $$('.pz, .pruchod-seznam li');
    const nastav = z => zony.forEach(el => el.classList.toggle('je', el.dataset.z === z));
    pozoruj(sceny, el => nastav(el.dataset.z), { rootMargin: '-45% 0px -45% 0px' });
    pozoruj(sceny, (el, io) => { el.classList.add('vid'); io.unobserve && io.unobserve(el); }, { rootMargin: '0px 0px -15% 0px' });
    nastav(sceny[0].dataset.z);
  }

  const stiskni = (skupina, tlacitko) => $$('button', skupina).forEach(b => b.setAttribute('aria-pressed', b === tlacitko));

  // Úvod: přepínač domů (bez JS jsou vidět oba)
  $$('[data-prepinac]').forEach(p => {
    const obaly = $$('[data-dum-obal]', p.closest('section'));
    const ukaz = slug => {
      obaly.forEach(o => { o.hidden = o.dataset.dumObal !== slug; });
      $$('button', p).forEach(b => b.setAttribute('aria-pressed', b.dataset.dum === slug));
    };
    p.hidden = false;
    p.addEventListener('click', e => { const b = e.target.closest('button'); if (b) ukaz(b.dataset.dum); });
    ukaz($('button', p).dataset.dum);
  });

  // Ceník: filtr podle domu a podlaží, #prizemi / #patro
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
    const h = location.hash.slice(1);
    if (h === 'prizemi' || h === 'patro') { const b = $(`[data-v=${h}]`, fPod); if (b) { b.click(); $('#cenik').scrollIntoView(); } }
  }

  // Půdorys bytu: místnost v seznamu ↔ zóna a štítek v plánu
  $$('.plan').forEach(p => {
    const vse = $$('[data-m]', p);
    const zvyrazni = m => vse.forEach(el => el.classList.toggle('je', el.dataset.m === m));
    $$('button[data-m]', p).forEach(b => {
      ['mouseenter', 'focus', 'click'].forEach(t => b.addEventListener(t, () => zvyrazni(b.dataset.m)));
      b.addEventListener('blur', () => zvyrazni(null));
    });
    const obraz = $('.plan-obraz', p);
    $$('.plan-z', p).forEach(z => {
      const m = z.dataset.m;
      obraz.addEventListener('mousemove', e => {
        const r = z.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) zvyrazni(m);
      });
    });
    p.addEventListener('mouseleave', () => zvyrazni(null));
  });

  // Kalkulačka Praha, nebo Hradec
  const roz = $('#rozpocet');
  if (roz) {
    const out = $('#rozpocet-vystup'), mh = $('#m2-hradec'), mp = $('#m2-praha');
    const ch = $('#ctverec-hradec'), cp = $('#ctverec-praha');
    const praha = +roz.dataset.praha, hradec = +roz.dataset.hradec;
    const max = Math.sqrt(+roz.max / hradec);
    const prepocet = () => {
      const k = +roz.value, h = k / hradec, p = k / praha;
      out.textContent = (k / 1e6).toLocaleString('cs-CZ', { maximumFractionDigits: 2 }) + ' mil. Kč';
      mh.innerHTML = cz(h) + '<small>m²</small>'; mp.innerHTML = cz(p) + '<small>m²</small>';
      ch.style.setProperty('--s', (Math.sqrt(h) / max).toFixed(3));
      cp.style.setProperty('--s', (Math.sqrt(p) / max).toFixed(3));
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
  $$('form.formular').forEach(f => f.addEventListener('submit', e => {
    if (f.dataset.demo !== '1') return;
    e.preventDefault();
    const s = $('.formular-stav', f);
    if (s) s.textContent = 'Děkujeme. Toto je ukázka webu, zpráva se zatím nikam neodesílá.';
  }));

  // Tisk karty bytu
  $$('.tisk').forEach(b => b.addEventListener('click', () => window.print()));
})();
