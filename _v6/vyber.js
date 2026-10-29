// Prodejní struktura pod hero – společná pro varianty A/B/C (fáze 1)
(() => {
  const el = document.getElementById('vyber');
  if (!el) return;
  el.innerHTML = `
  <div class="vyber-hlava">
    <div><span class="stitek">32 bytů 2+kk · dva domy</span><h2 class="serif">Vyberte si dům, patro<br>a <em>svou stranu světla</em>.</h2></div>
    <p>Všechny byty mají stejnou dispozici 47,21 m² a okna na obě strany domu. Liší se tím, co je venku: zahrádka v přízemí, nebo balkon v patře.</p>
  </div>
  <div class="filtr">
    <label>Dům</label>
    <div class="seg" data-k="dum"><button aria-pressed="true" data-v="I">K Metelce I</button><button aria-pressed="false" data-v="II">K Metelce II</button></div>
    <label>Patro</label>
    <div class="seg" data-k="patro"><button aria-pressed="true" data-v="z">Přízemí · zahrádka</button><button aria-pressed="false" data-v="b">Patro · balkon</button></div>
    <div class="vysl"><span data-o="byty">byty 1–8</span><b data-o="cena">5 490 000 Kč</b></div>
  </div>
  <div class="karty">
    <a class="karta" data-p="z" href="#">
      <div class="foto"><img src="img/model-jih.webp" alt="Přízemní byty se zahrádkami, bílá maketa domu" style="object-position:62% 62%"><span class="stitek-f sklo">Přízemí</span></div>
      <div class="tx"><span class="stitek">Byt se zahrádkou</span><h3 class="serif">2+kk a vlastní <em>zahrada</em></h3>
        <dl><dt>Byt</dt><dd>47,21 m²</dd><dt>Zahrádka</dt><dd>52–55 m²</dd><dt>Sklepní kóje</dt><dd>3 m²</dd><dt>Parkovací stání</dt><dd>ano</dd></dl>
        <div class="cena"><small>cena vč. sklepa a zahrádky</small><b>5 490 000 Kč</b></div></div>
    </a>
    <a class="karta" data-p="b" href="#">
      <div class="foto"><img src="img/model-balkony.webp" alt="Byty v patře s balkony, bílá maketa domu" style="object-position:40% 40%"><span class="stitek-f sklo">Patro</span></div>
      <div class="tx"><span class="stitek">Byt s balkonem</span><h3 class="serif">2+kk a vlastní <em>balkon</em></h3>
        <dl><dt>Byt</dt><dd>47,21 m²</dd><dt>Balkon</dt><dd>7,80–8,25 m²</dd><dt>Sklepní kóje</dt><dd>3 m²</dd><dt>Parkovací stání</dt><dd>ano</dd></dl>
        <div class="cena"><small>cena vč. sklepa a balkonu</small><b>4 990 000 Kč</b></div></div>
    </a>
  </div>
  <p class="pozn">Dům na obrázcích je bílá maketa podle projektové dokumentace, interiéry jsou ilustrační vizualizace standardu investora. Ceny podle ceníku ze 16. 9. 2026.</p>`;
  const stav = { dum: 'I', patro: 'z' };
  const kresli = () => {
    el.querySelector('[data-o="byty"]').textContent = `K Metelce ${stav.dum} · byty ${stav.patro === 'z' ? '1–8' : '9–16'}`;
    el.querySelector('[data-o="cena"]').textContent = stav.patro === 'z' ? '5 490 000 Kč' : '4 990 000 Kč';
    el.querySelectorAll('.karta').forEach(k => k.style.outline = k.dataset.p === stav.patro ? '1px solid var(--zlata)' : '');
  };
  el.querySelectorAll('.seg').forEach(s => s.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    s.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    stav[s.dataset.k] = b.dataset.v; kresli();
  }));
  kresli();
})();
