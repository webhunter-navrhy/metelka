// Varianta C: záložky ceníku podle domu.
(() => {
  const zalozky = [...document.querySelectorAll('.c-zalozky [role="tab"]')];
  const vyber = tl => zalozky.forEach(t => {
    const ano = t === tl;
    t.setAttribute('aria-selected', ano);
    t.tabIndex = ano ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).toggleAttribute('data-skryt', !ano);
  });
  zalozky.forEach((t, i) => {
    t.addEventListener('click', () => vyber(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { const n = zalozky[(i + d + zalozky.length) % zalozky.length]; vyber(n); n.focus(); }
    });
  });
  vyber(zalozky[0]);
})();
