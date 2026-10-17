// Sectiegedrag: de sticky stapel die wegzakt, de tijdlijn (rail, parallax, dimmen), de case-strip en de keuzehulp.
import { $, $$, clamp, mq, ticker, reduced, finePointer, Spring } from './core.js';
import { play } from './reveal.js';

const wide = mq('(min-width: 768px)');

/** Stapel: elke laag zakt terug (schaal 0.9, schaduw 0.55) terwijl de volgende eroverheen schuift. */
const initStack = (root) => {
  const layers = $$('[data-stack]', root);
  if (!layers.length || reduced) return () => {};
  const items = layers.map((el) => ({ el, inner: $('.stack-inner', el), shade: $('.stack-shade', el), next: el.nextElementSibling, last: -1 }));
  const off = ticker.add(() => {
    const on = wide.matches;
    const vh = window.innerHeight;
    items.forEach((it) => {
      const p = on && it.next ? clamp(1 - it.next.getBoundingClientRect().top / vh) : 0;
      const q = Math.round(p * 400) / 400;
      if (q === it.last) return;
      it.last = q;
      it.inner.style.transform = q ? `scale(${1 - 0.1 * q})` : '';
      it.shade.style.opacity = String(0.55 * q);
    });
  });
  return off;
};

/** Tijdlijn: een rail met kop die de scroll volgt, platen met parallax, en dimmen bij hover. */
const initTimeline = (root) => {
  const tl = $('.timeline', root);
  if (!tl) return () => {};
  const rows = $('[data-rows]', tl);
  const rail = $('[data-rail]', tl);
  const svg = rail && $('svg', rail);
  const parts = svg && {
    solid: $('.rail__solid', svg),
    dash: $('.rail__dash', svg),
    thread: $('.rail__thread', svg),
    mark: $('.rail__mark', svg),
  };
  const offs = [];

  if (finePointer) {
    $$('[data-row]', rows).forEach((row) => {
      const enter = () => {
        row.classList.add('is-hover');
        rows.classList.add('is-dimmed');
      };
      const leave = () => {
        row.classList.remove('is-hover');
        rows.classList.remove('is-dimmed');
      };
      row.addEventListener('mouseenter', enter);
      row.addEventListener('mouseleave', leave);
      offs.push(() => {
        row.removeEventListener('mouseenter', enter);
        row.removeEventListener('mouseleave', leave);
      });
    });
  }

  const para = $$('[data-parallax]', tl).map((el) => ({ el, amt: Number(el.dataset.parallax), row: el.closest('[data-row]') }));
  const head = new Spring(0, { tension: 120, friction: 24 });
  let first = true;
  offs.push(
    ticker.add((now, dt) => {
      const vh = window.innerHeight;
      const r = tl.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const on = wide.matches;
      // Rail begint bij de eerste rij.
      if (rail) {
        const top = rows.offsetTop;
        rail.style.setProperty('--rail-top', `${top}px`);
        const h = Math.max(1, tl.offsetHeight - top);
        const target = clamp(vh * 0.55 - (r.top + top), 0, h);
        head.set(target);
        first ? head.jump(target) : head.step(dt);
        first = false;
        const y = reduced ? h : head.value;
        parts.solid.setAttribute('x1', 8); parts.solid.setAttribute('x2', 8);
        parts.solid.setAttribute('y1', 0); parts.solid.setAttribute('y2', y);
        parts.dash.setAttribute('x1', 8); parts.dash.setAttribute('x2', 8);
        parts.dash.setAttribute('y1', y); parts.dash.setAttribute('y2', h);
        parts.thread.setAttribute('y', Math.max(0, y - 90));
        parts.thread.setAttribute('height', Math.min(90, y));
        parts.mark.setAttribute('transform', `translate(8 ${y}) rotate(45)`);
      }
      if (reduced) return;
      para.forEach((p) => {
        if (!on) return (p.el.style.translate = '');
        const rr = p.row.getBoundingClientRect();
        const off = (rr.top + rr.height / 2 - vh / 2) / vh;
        p.el.style.translate = `0 ${(-off * p.amt).toFixed(1)}px`;
      });
    })
  );
  return () => offs.forEach((f) => f());
};

/** Cases: één case tegelijk, gekozen in de strip; de beugel schuift mee, de verbinders stromen ernaartoe. */
const initCases = (root) => {
  const sec = $('[data-cases]', root);
  if (!sec) return () => {};
  const cards = $$('[data-pick]', sec);
  const links = $$('.strip__link', sec);
  const bracket = $('.strip__bracket', sec);
  const strip = $('[data-strip]', sec);
  sec.classList.add('is-enhanced');

  const place = () => {
    const live = cards.find((c) => c.classList.contains('is-live'));
    if (live && bracket) bracket.style.setProperty('--bx', `${live.offsetLeft}px`);
  };
  const pick = (key, animate = true) => {
    const idx = cards.findIndex((c) => c.dataset.pick === key);
    cards.forEach((c, i) => {
      c.classList.toggle('is-live', i === idx);
      c.setAttribute('aria-pressed', String(i === idx));
    });
    links.forEach((l, i) => l.classList.toggle('to-left', idx <= i));
    $$('[data-case]', sec).forEach((a) => {
      const on = a.dataset.case === key;
      a.toggleAttribute('data-inactive', !on);
      if (on && animate) {
        $$('.score__bar', a).forEach((b) => {
          b.style.setProperty('--grow', '0');
          b.offsetWidth;
          requestAnimationFrame(() => b.style.setProperty('--grow', '1'));
        });
        $$('[data-reveal]', a).forEach((el) => play(el));
      }
    });
    place();
  };
  const onClick = (e) => {
    const c = e.target.closest('[data-pick]');
    if (c) pick(c.dataset.pick);
  };
  strip.addEventListener('click', onClick);
  const ro = new ResizeObserver(place);
  ro.observe(strip);
  pick(cards[0].dataset.pick, false);
  return () => {
    strip.removeEventListener('click', onClick);
    ro.disconnect();
  };
};

/** Keuzehulp: toon het plan dat bij de gekozen situatie past. */
const initChooser = (root) => {
  const offs = $$('[data-chooser]', root).map((ch) => {
    const panels = $$('[data-plan]', ch);
    const show = () => {
      const val = $('input:checked', ch)?.value;
      panels.forEach((p) => (p.hidden = p.dataset.plan !== val));
    };
    ch.classList.add('is-enhanced');
    ch.addEventListener('change', show);
    show();
    return () => ch.removeEventListener('change', show);
  });
  return () => offs.forEach((f) => f());
};

export const initSections = (root = document) => {
  const offs = [initStack(root), initTimeline(root), initCases(root), initChooser(root)];
  return () => offs.forEach((f) => f());
};
