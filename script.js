(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobile menu ---------- */
  const menuButton = document.querySelector('.menu');
  const nav = document.querySelector('#nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuButton.focus(); }
  });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuButton.contains(e.target)) setMenu(false);
  });

  /* ---------- Header shadow on scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Highlight the current section in the nav ---------- */
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach(a => {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Motion toggle (remembered per visitor) ---------- */
  const motionButton = document.querySelector('.motion-toggle');
  const motionLabel = motionButton.querySelector('.motion-label');
  let saved = null;
  try { saved = localStorage.getItem('thiacqua-motion'); } catch (_) {}
  let stopped = saved ? saved === 'off' : reducedMotion.matches;

  function applyMotion() {
    root.classList.toggle('paused', stopped);
    motionButton.setAttribute('aria-pressed', String(stopped));
    motionLabel.textContent = stopped ? 'Movimentos pausados' : 'Pausar movimentos';
  }
  applyMotion();
  motionButton.addEventListener('click', () => {
    stopped = !stopped;
    applyMotion();
    try { localStorage.setItem('thiacqua-motion', stopped ? 'off' : 'on'); } catch (_) {}
  });
  reducedMotion.addEventListener('change', e => { if (e.matches) { stopped = true; applyMotion(); } });

  /* ---------- Hero entrance (once) ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('loaded')));

  /* ---------- Section reveals: one calm fade-up per block ---------- */
  const blocks = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    blocks.forEach(el => el.classList.add('is-in'));
  } else {
    const reveals = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        reveals.unobserve(entry.target);
        const counter = entry.target.querySelector('[data-count]');
        if (counter) countUp(counter);
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    blocks.forEach(el => reveals.observe(el));
  }

  /* ---------- "26 anos" counter ---------- */
  function countUp(el) {
    if (stopped || reducedMotion.matches) return;
    const end = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();
    const step = now => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();
