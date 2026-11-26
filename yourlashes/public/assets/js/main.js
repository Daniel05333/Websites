// Yourlashes — interactie. Geen bibliotheken: een 3D-wimperwaaier op canvas, één scroll-handler, IntersectionObservers voor onthullingen.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  // ── onthullingen ─────────────────────────────────────────────────────────
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  let pending = $$('.reveal, .title, .reveal-img');
  pending.forEach((el) => io.observe(el));
  const sweep = () => {
    if (!pending.length) return;
    pending = pending.filter((el) => {
      if (el.classList.contains('in')) return false;
      if (el.offsetParent !== null && el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); io.unobserve(el); return false; }
      return true;
    });
  };

  // ── hero: 3D-wimperwaaier (canvas, eigen 3D-projectie) ──────────────────
  const hero = $('[data-hero]');
  const canvas = $('[data-fan]');
  const pointer = { x: 0, y: 0, active: false };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
    pointer.active = true;
  }, { passive: true });
  if (hero) (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => {
    $('.hero__title', hero)?.classList.add('in');
    $('.hero__copy', hero)?.classList.add('in');
  }));
  if (hero && canvas) {
    const variant = canvas.dataset.fan;
    const ctx = canvas.getContext('2d');
    // pseudo-random, maar elke keer dezelfde waaier
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    // Wimpers: wortels langs een gebogen ooglid, per wortel een "volume fan".
    const strands = [];
    const ROOTS = innerWidth < 700 ? 52 : 74;
    for (let i = 0; i < ROOTS; i++) {
      const t = i / (ROOTS - 1), u = t * 2 - 1;
      const lid = [u * 1.15, 0.26 * (1 - u * u), 0.42 * (1 - u * u)];
      const catEye = Math.pow((u + 1) / 2, 1.25);
      const spike = i % 7 === 3 ? 0.22 : 0;
      const L = (0.42 + 0.42 * catEye + spike) * (1 - 0.55 * smooth(0.82, 1, Math.abs(u)));
      const k = 3 + Math.floor(rnd() * 3);
      for (let j = 0; j < k; j++) strands.push({ u, lid, L: L * (0.86 + rnd() * 0.2), off: j - (k - 1) / 2, tilt: u * 0.55 + (rnd() - 0.5) * 0.08, curl: 0.38 + rnd() * 0.14, delay: t * 0.55 + rnd() * 0.15, lower: false, hue: rnd() });
    }
    for (let i = 0; i < 38; i++) { // onderste wimperlijn
      const t = i / 37, u = (t * 2 - 1) * 0.86;
      strands.push({ u, lid: [u * 1.1, -0.14 * (1 - u * u) - 0.02, 0.38 * (1 - u * u)], L: 0.14 + 0.08 * Math.pow((u + 1) / 2, 1.5), off: 0, tilt: u * 0.4, curl: 0.2, delay: 0.5 + t * 0.4, lower: true, hue: rnd() });
    }
    const dust = Array.from({ length: innerWidth < 700 ? 70 : 130 }, () => ({ x: (rnd() - 0.5) * 4, y: (rnd() - 0.5) * 2.6, z: (rnd() - 0.5) * 2.4, s: 0.4 + rnd() * 1.4, ph: rnd() * 6.28, sp: 0.2 + rnd() * 0.5 }));

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    };
    resize();
    addEventListener('resize', () => { resize(); loop(); });

    const st = { yaw: 0, pitch: 0, open: 0 };
    const t0 = performance.now();
    let visible = true, running = false;

    const draw = (now) => {
      running = false;
      const t = (now - t0) / 1000;
      const p = calm ? 0.6 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      hero.style.setProperty('--p', p.toFixed(3));
      const grow = calm ? 1 : clamp(t / 2.2, 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.35) * 0.35;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.3) * 0.25;
      const academy = variant === 'academy';
      st.yaw = lerp(st.yaw, (academy ? 0.35 : -0.25) + p * 0.9 + px * 0.35, 0.06);
      st.pitch = lerp(st.pitch, 0.42 - p * 0.45 + py * 0.18, 0.06);
      st.open = lerp(st.open, 0.35 + smooth(0, 0.6, p) * 0.75 + Math.sin(t * 0.9) * 0.04, 0.08);

      const mobile = W < 920;
      const cx = mobile ? W * 0.47 : W * lerp(0.76, 0.6, smooth(0.1, 0.7, p));
      const cy = H * (mobile ? 0.3 : 0.5);
      const scale = (mobile ? Math.min(W * 0.34, H * 0.22) : Math.min(W * 0.19, H * 0.32)) * (1 + p * 0.25);
      const cyaw = Math.cos(st.yaw), syaw = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      const proj = (x, y, z) => {
        // y-rotatie (yaw), dan x-rotatie (pitch), dan perspectief
        const x1 = x * cyaw + z * syaw, z1 = -x * syaw + z * cyaw;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const f = 3.2 / (3.2 - z2);
        return [cx + x1 * f * scale, cy - (y2 - 0.25) * f * scale, z2];
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      // goudstof
      for (const d of dust) {
        const y = ((d.y + t * d.sp * 0.08 + 1.3) % 2.6) - 1.3;
        const [x, yy, z] = proj(d.x, y, d.z);
        const a = (0.25 + 0.35 * Math.sin(t * 1.6 + d.ph) ** 2) * (0.5 + z * 0.2) * grow;
        ctx.fillStyle = `rgba(236, 214, 190, ${clamp(a, 0, 0.7).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, yy, d.s * (1 + z * 0.15), 0, 6.283); ctx.fill();
      }

      // wimpers
      for (const s of strands) {
        const g = smooth(s.delay, s.delay + 0.45, grow * 1.45);
        if (g <= 0) continue;
        const L = s.L * g;
        const ang = s.tilt + s.off * 0.075 * st.open * (s.lower ? 0 : 1);
        const dir = s.lower ? [Math.sin(ang), -Math.cos(ang), 0] : [Math.sin(ang), Math.cos(ang), 0];
        const [rx, ry, rz] = s.lid;
        const c = [rx + dir[0] * L * 0.55, ry + dir[1] * L * 0.55, rz + L * 0.12];
        const e = [rx + dir[0] * L * 0.92, ry + dir[1] * L * 0.85, rz + L * s.curl * 1.05];
        const P0 = proj(rx, ry, rz), P1 = proj(...c), P2 = proj(...e);
        const depth = clamp(0.55 + P0[2] * 0.35, 0.2, 1);
        const warm = s.hue;
        const col = `${Math.round(lerp(196, 246, warm))}, ${Math.round(lerp(152, 226, warm))}, ${Math.round(lerp(92, 180, warm))}`;
        ctx.strokeStyle = `rgba(${col}, ${(0.28 * depth).toFixed(3)})`;
        ctx.lineWidth = (s.lower ? 0.8 : 1.15) * depth * (mobile ? 0.9 : 1.2);
        ctx.beginPath(); ctx.moveTo(P0[0], P0[1]); ctx.quadraticCurveTo(P1[0], P1[1], P2[0], P2[1]); ctx.stroke();
        // dikkere wortel → taps toelopende wimper
        ctx.lineWidth *= 2.2;
        ctx.strokeStyle = `rgba(${col}, ${(0.16 * depth).toFixed(3)})`;
        const mx = (P0[0] + P1[0]) / 2, my = (P0[1] + P1[1]) / 2;
        ctx.beginPath(); ctx.moveTo(P0[0], P0[1]); ctx.lineTo(mx, my); ctx.stroke();
      }

      // ooglid: een zachte gouden lijn
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(236, 214, 190, ${(0.35 * grow).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 20 - 1; const [x, y] = proj(u * 1.15, 0.26 * (1 - u * u), 0.42 * (1 - u * u)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();

      canvas.classList.add('is-ready');
      if (!calm) loop();
    };
    const loop = () => { if (!running && visible) { running = true; requestAnimationFrame(draw); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(hero);
    loop();
  }

  // ── scroll ───────────────────────────────────────────────────────────────
  const masthead = $('[data-masthead]');
  const bar = $('[data-progress]');
  const dock = $('[data-dock]');
  const footer = $('.footer');
  const bookSec = $('#afspraak');
  const parallax = $$('[data-parallax]');
  const statement = $('[data-words]');
  const steps = $('[data-steps]');
  let words = [];
  if (statement) {
    const text = statement.textContent.trim();
    statement.innerHTML = `<span class="sr-only">${text}</span><span aria-hidden="true">${text.split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ')}</span>`;
    words = $$('.w', statement);
  }
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = root.scrollHeight - vh;
    bar?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (masthead) {
      masthead.classList.toggle('is-scrolled', y > 40);
      if (y > lastY + 2 && y > vh * 2.4 && !$('dialog[open]')) masthead.classList.add('is-hidden');
      if (y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    if (dock) {
      const near = (el) => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
      dock.classList.toggle('on', y > (hero ? hero.offsetHeight - vh * 0.4 : vh) && !near(bookSec) && !near(footer));
    }
    if (hero && !calm) {
      const p = clamp(y / Math.max(1, hero.offsetHeight - vh), 0, 1);
      const copy = $('.hero__copy', hero);
      const f = smooth(0.62, 0.97, p);
      copy.style.opacity = (1 - f).toFixed(3);
      copy.style.transform = `translate3d(0, ${(-f * 40).toFixed(1)}px, 0)`;
    }
    if (!calm) for (const el of parallax) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
    }
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const prog = calm ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
      const n = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      steps.style.setProperty('--sp', (calm ? 1 : clamp((vh * 0.8 - r.top) / (vh * 0.5), 0, 1)).toFixed(3));
    }
    sweep();
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // ── portfolio: filters en vergrootweergave ───────────────────────────────
  const grid = $('[data-grid]');
  if (grid) {
    const cards = $$('.card', grid);
    $$('[data-filter]').forEach((btn) => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', b === btn));
      cards.forEach((c) => c.classList.add('is-out'));
      setTimeout(() => {
        cards.forEach((c) => {
          const show = f === 'alle' || c.dataset.cat === f;
          c.hidden = !show;
          c.classList.add('in');
          if (show) requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('is-out')));
        });
      }, calm ? 0 : 280);
    }));

    const box = $('[data-lightbox]');
    const img = $('[data-lightbox-img]', box), cap = $('[data-lightbox-cap]', box);
    let list = [], idx = 0, opener = null;
    const show = (i) => {
      idx = (i + list.length) % list.length;
      const b = list[idx];
      img.src = b.dataset.zoom; img.alt = b.dataset.label; cap.textContent = b.dataset.label;
    };
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-zoom]');
      if (!b) return;
      opener = b;
      list = $$('.card:not([hidden]) [data-zoom]', grid);
      show(list.indexOf(b));
      box.showModal();
    });
    $('[data-lightbox-prev]', box).addEventListener('click', () => show(idx - 1));
    $('[data-lightbox-next]', box).addEventListener('click', () => show(idx + 1));
    $('[data-lightbox-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    box.addEventListener('close', () => opener?.focus());
  }

  // ── kantelkaarten, licht, magnetische knoppen ────────────────────────────
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${(x * 9).toFixed(2)}deg) rotateX(${(-y * 9).toFixed(2)}deg)`;
        el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ── afspraak: aanvraag samenstellen → kopiëren → Instagram-DM ────────────
  const form = $('[data-book-form]');
  const toast = $('[data-toast]');
  const say = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 4200); };
  if (form) {
    const names = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const today = new Date();
    const opts = [{ v: 'Flexibel', l: 'Flexibel', s: 'elke dag' }];
    for (let i = 1; i <= 9; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      opts.push({ v: `${names[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`, l: i === 1 ? 'Morgen' : names[d.getDay()], s: `${d.getDate()} ${months[d.getMonth()]}` });
    }
    $('[data-days]', form).innerHTML = opts.map((o, i) => `<label><input type="radio" name="day" value="${o.v}"${i === 0 ? ' checked' : ''}><span>${o.l}<small>${o.s}</small></span></label>`).join('');
    const preview = $('[data-book-preview]', form), error = $('[data-book-error]', form);
    const message = () => {
      const f = new FormData(form);
      const tr = f.get('treatment'), name = String(f.get('name') || '').trim(), note = String(f.get('note') || '').trim();
      if (!tr) return '';
      const shape = f.get('shape');
      return [
        `Hoi Lenéa! Ik wil graag een afspraak maken voor ${tr}${shape && shape !== 'Weet ik nog niet' ? ` (${shape.toLowerCase()})` : ''}.`,
        `Voorkeur: ${f.get('day')}, ${String(f.get('part')).toLowerCase()}.`,
        note && `Inspiratie: ${note}`,
        name && `Groetjes, ${name}`,
      ].filter(Boolean).join('\n');
    };
    const update = () => { preview.textContent = message() || 'Kies een behandeling…'; error.textContent = ''; };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-book]');
      if (!b) return;
      e.preventDefault();
      const pre = b.dataset.pre;
      if (pre) { form.elements.treatment.value = pre; update(); }
      $('#afspraak').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => {
        form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash');
        (form.elements.treatment.value ? form.elements.name : form.elements.treatment).focus({ preventScroll: true });
      }, calm ? 0 : 700);
    });

    const copy = async (text) => {
      try { await navigator.clipboard.writeText(text); return true; } catch {
        const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.append(ta); ta.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove(); return ok;
      }
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(form);
      if (!f.get('treatment')) { error.textContent = 'Kies eerst een behandeling.'; form.elements.treatment.focus(); return; }
      if (!String(f.get('name') || '').trim()) { error.textContent = 'Vul je naam in.'; form.elements.name.focus(); return; }
      const ok = await copy(message());
      window.open('https://ig.me/m/leneanails', '_blank', 'noopener');
      say(ok ? 'Bericht gekopieerd. Plak het in de DM die nu opent.' : 'Instagram opent. Kopiëren lukte niet, typ je aanvraag in de DM.');
    });
  }
})();
