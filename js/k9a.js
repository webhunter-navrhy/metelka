// Varianta A: místnost, kterou právě čtete, se rozsvítí v půdorysu.
(() => {
  const sceny = document.querySelectorAll('.a-scena');
  const zony = document.querySelectorAll('.a-zona, .a-seznam li');
  const nastav = z => zony.forEach(el => el.classList.toggle('je', el.dataset.z === z));
  const io = new IntersectionObserver(zaznamy => {
    zaznamy.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vid'); nastav(e.target.dataset.z); }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sceny.forEach(s => io.observe(s));
  const odhal = new IntersectionObserver(zaznamy => zaznamy.forEach(e => e.isIntersecting && e.target.classList.add('vid')), { rootMargin: '0px 0px -15% 0px' });
  sceny.forEach(s => odhal.observe(s));
  nastav('obyvak');
})();
