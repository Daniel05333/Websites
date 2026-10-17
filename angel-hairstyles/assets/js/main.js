// Angel Hairstyles — interactie. Geen dependencies; alles werkt ook zonder dit script.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  // ── reveals ──────────────────────────────────────────────────────────────
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    // De hero speelt direct af: de afspraakknop mag nooit op een scroll wachten.
    reveals.forEach((el) => (el.closest('.hero') ? requestAnimationFrame(() => el.classList.add('in')) : io.observe(el)));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // ── menu (mobiel) ────────────────────────────────────────────────────────
  const burger = $('.burger');
  const sheet = $('#sheet');
  const close = $('.sheet__close');
  const setMenu = (open) => {
    sheet.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    (open ? close : burger).focus();
  };
  burger?.addEventListener('click', () => setMenu(true));
  close?.addEventListener('click', () => setMenu(false));
  sheet?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet && !sheet.hidden) setMenu(false); });
  matchMedia('(min-width: 1100px)').addEventListener('change', (e) => { if (e.matches && sheet && !sheet.hidden) setMenu(false); });

  // ── scroll-gestuurde lagen, gebundeld in één rAF ─────────────────────────
  const masthead = $('[data-masthead]');
  const parallax = $$('[data-parallax]');
  const dots = $$('.grid i');
  const chapters = $$('.chapters i');
  const chapterEls = $$('[data-chapter]');
  const dock = $('[data-dock]');
  const hero = $('.hero');
  const finale = $('[data-finale]');
  const contact = $('#contact');

  let queued = false;
  const update = () => {
    queued = false;
    const y = scrollY;
    const vh = innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const p = y / max;

    masthead?.classList.toggle('scrolled', y > 24);

    if (!reduced.matches) {
      for (const el of parallax) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const centre = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-centre * Number(el.dataset.parallax)).toFixed(1)}px, 0)`;
      }
      dots.forEach((d, i) => {
        let speed = 90 + ((i * 55) % 180);
        if (i % 2 === 0) speed = -speed;
        const pos = ((((i * 17) % 80) + 10 + p * speed) % 100 + 100) % 100;
        d.style.setProperty('--y', `${pos.toFixed(2)}%`);
      });
    }

    // Hoofdstukbalkjes: elk vult zich terwijl zijn sectie gepasseerd wordt.
    chapterEls.forEach((el, i) => {
      if (!chapters[i]) return;
      const r = el.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / Math.max(1, r.height)));
      chapters[i].style.setProperty('--p', prog.toFixed(3));
    });

    if (dock && hero) {
      const pastHero = hero.getBoundingClientRect().bottom < 80;
      const atEnd = [finale, contact].some((el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < vh && r.bottom > 0;
      });
      dock.classList.toggle('on', pastHero && !atEnd);
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();

  // ── cursorring (alleen fijne aanwijzer; de echte cursor blijft zichtbaar) ──
  const ring = $('.cursor');
  if (ring && finePointer.matches && !reduced.matches) {
    let tx = 0, ty = 0, x = 0, y = 0, running = false;
    const loop = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) requestAnimationFrame(loop); else running = false;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      ring.classList.add('on');
      ring.classList.toggle('hover', !!e.target.closest('a, button, summary'));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => ring.classList.remove('on'));
  }

  // ── lightbox ────────────────────────────────────────────────────────────
  const box = $('[data-lightbox]');
  const items = $$('.gallery__item');
  if (box && items.length) {
    const stage = $('[data-stage]', box);
    const count = $('[data-count]', box);
    let index = 0;
    const show = (i) => {
      index = (i + items.length) % items.length;
      const src = items[index].firstElementChild.cloneNode(true);
      if (src.tagName === 'IMG') { src.loading = 'eager'; src.removeAttribute('width'); src.removeAttribute('height'); }
      stage.replaceChildren(src);
      count.textContent = `${index + 1} / ${items.length}`;
    };
    items.forEach((btn, i) => btn.addEventListener('click', () => { show(i); box.showModal(); $('[data-close]', box).focus(); }));
    $('[data-prev]', box).addEventListener('click', () => show(index - 1));
    $('[data-next]', box).addEventListener('click', () => show(index + 1));
    $('[data-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    let sx = null;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  // ── meetpunt voor afspraakklikken ───────────────────────────────────────
  // Er draait géén analytics. Wordt er later (met toestemming) een tool
  // gekoppeld, dan kan die naar dit event luisteren.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-track]');
    if (a) document.dispatchEvent(new CustomEvent('angel:booking-click', { detail: { href: a.href, type: a.dataset.track } }));
  });
})();
