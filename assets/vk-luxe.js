/* ==========================================================================
   VOLKARA — luxe layer (loaded on every page, ~4 KB)
   1. Sticky stack  — sections with [data-stack] pin and the next section
      slides over them; the covered one recedes to 0.9 and darkens to 55%.
   2. <vk-contours> — animated topographic contour lines (marching squares
      over an analytic four-sine field), used as a quiet section backdrop.
   3. <vk-float-field> — floating LavaCell™ flakes and rising embers around
      the product photo, repelled by the pointer; the photo tilts toward it.
   Everything stays static with reduced motion and pauses off-screen.
   ========================================================================== */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- 1. Sticky stack ---------- */
  const RECEDE_SCALE = 0.9;
  const RECEDE_SHADE = 0.55;
  function initStack() {
    if (reduced) return;
    const desktop = matchMedia('(min-width: 990px)');
    const phone = matchMedia('(max-width: 639px)');
    const layers = [...document.querySelectorAll('[data-stack]')]
      .map((section) => ({ section, wrap: section.closest('.shopify-section') || section }))
      .filter((l) => l.wrap.nextElementSibling);
    if (!layers.length) return;
    // Layers stay pinned for the rest of <main>, so every later section is lifted above them.
    const isLayer = new Set(layers.map((l) => l.wrap));
    layers.forEach((l, i) => {
      l.next = l.wrap.nextElementSibling;
      l.shade = document.createElement('div');
      l.shade.className = 'vk-stack-shade';
      l.shade.setAttribute('aria-hidden', 'true');
      l.wrap.appendChild(l.shade);
      l.wrap.classList.add('vk-stack-layer');
      l.wrap.style.zIndex = String(i + 1);
    });
    let el = layers[0].wrap.nextElementSibling;
    while (el) {
      if (!isLayer.has(el)) { el.classList.add('vk-stack-next'); el.style.zIndex = String(layers.length + 10); }
      el = el.nextElementSibling;
    }
    const layout = () => {
      layers.forEach((l) => {
        // A layer taller than the screen scrolls until its foot reaches the bottom, then pins.
        const top = desktop.matches ? Math.min(0, innerHeight - l.wrap.offsetHeight) : 0;
        l.wrap.style.top = `${top}px`;
        l.wrap.classList.toggle('is-stacked', desktop.matches);
      });
    };
    let raf = 0;
    const apply = () => {
      raf = 0;
      const view = innerHeight || 1;
      const shrink = phone.matches || !desktop.matches ? 0 : 1 - RECEDE_SCALE;
      for (const l of layers) {
        if (!desktop.matches) { l.section.style.transform = ''; l.shade.style.opacity = '0'; continue; }
        const p = clamp(1 - l.next.getBoundingClientRect().top / view, 0, 1);
        l.section.style.transform = p > 0 && shrink > 0 ? `scale(${1 - shrink * p})` : '';
        l.section.style.willChange = p > 0 && shrink > 0 ? 'transform' : '';
        l.shade.style.opacity = String(RECEDE_SHADE * p);
        l.section.style.visibility = p >= 1 ? 'hidden' : 'visible';
      }
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(apply); };
    layout(); apply();
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', () => { layout(); request(); });
    new ResizeObserver(() => { layout(); request(); }).observe(document.body);
  }

  /* ---------- 2. Contour backdrop ---------- */
  const LINE_SCALE = 3.8, LINE_COUNT = 2.5, WAVE_AMOUNT = 0.37, WAVE_SPEED = 1.66, LINE_OPACITY = 0.85, CELLS = 96;
  const field = (x, y, t) => {
    let f = Math.sin(x * 1.0 + t * 0.6) * 0.5;
    f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
    f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
    f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
    return f * 0.5 + 0.5;
  };
  if (!customElements.get('vk-contours')) customElements.define('vk-contours', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.canvas = document.createElement('canvas'); this.append(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.start = performance.now(); this.last = 0; this.visible = false;
      this.resize = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        this.w = this.clientWidth; this.h = this.clientHeight;
        this.canvas.width = Math.round(this.w * dpr); this.canvas.height = Math.round(this.h * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.draw(reduced ? 4 : (performance.now() - this.start) / 1000 * WAVE_SPEED);
      };
      new ResizeObserver(this.resize).observe(this);
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible && !reduced) this.loop(); });
      this.io.observe(this);
    }
    disconnectedCallback() { this.io?.disconnect(); this.visible = false; }
    loop() {
      if (this.running) return; this.running = true;
      const tick = (now) => {
        if (!this.visible) { this.running = false; return; }
        requestAnimationFrame(tick);
        if (now - this.last < 24) return; // redrawn every 24ms while in view
        this.last = now; this.draw((now - this.start) / 1000 * WAVE_SPEED);
      };
      requestAnimationFrame(tick);
    }
    draw(t) {
      const { ctx, w: width, h: height } = this; if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const cols = width >= height ? CELLS : Math.max(8, Math.round((CELLS * width) / height));
      const rows = Math.max(8, Math.round((cols * height) / width));
      const stepX = width / cols, stepY = height / rows, aspect = width / height;
      const values = new Float32Array((cols + 1) * (rows + 1));
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
        const nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE;
        const ny = ((j / rows) * 2 - 1) * LINE_SCALE;
        const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE_AMOUNT;
        const qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE_AMOUNT;
        values[j * (cols + 1) + i] = field(qx, qy, t) * LINE_COUNT;
      }
      ctx.strokeStyle = getComputedStyle(this).color; ctx.lineWidth = 1; ctx.globalAlpha = LINE_OPACITY;
      ctx.beginPath();
      const lerp = (a, b, lv) => (lv - a) / (b - a);
      for (let level = 0.5; level < LINE_COUNT; level += 1) {
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const a = values[j * (cols + 1) + i], b = values[j * (cols + 1) + i + 1];
          const c = values[(j + 1) * (cols + 1) + i + 1], d = values[(j + 1) * (cols + 1) + i];
          const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          const x = i * stepX, y = j * stepY;
          const top = [x + stepX * lerp(a, b, level), y], right = [x + stepX, y + stepY * lerp(b, c, level)];
          const bottom = [x + stepX * lerp(d, c, level), y + stepY], left = [x, y + stepY * lerp(a, d, level)];
          const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
          switch (idx) {
            case 1: case 14: seg(left, bottom); break;
            case 2: case 13: seg(bottom, right); break;
            case 3: case 12: seg(left, right); break;
            case 4: case 11: seg(top, right); break;
            case 5: seg(left, top); seg(bottom, right); break;
            case 6: case 9: seg(top, bottom); break;
            case 7: case 8: seg(left, top); break;
            case 10: seg(left, bottom); seg(top, right); break;
          }
        }
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
  });

  /* ---------- 3. Floating field around the product photo ---------- */
  const HEX = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" fill="currentColor"/></svg>';
  if (!customElements.get('vk-float-field')) customElements.define('vk-float-field', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
      const count = reduced ? 0 : fine ? Number(this.dataset.count || 18) : 8;
      this.target = this.closest('[data-float-host]') || this.parentElement;
      this.tilt = this.target.querySelector('[data-float-tilt]');
      this.items = [];
      for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        const hex = i % 3 !== 0;
        el.className = `vk-float vk-float--${hex ? 'hex' : 'ember'}${i % 4 === 0 ? ' vk-float--fg' : ''}`;
        if (hex) el.innerHTML = HEX;
        const size = hex ? 8 + Math.random() * 16 : 3 + Math.random() * 4;
        el.style.setProperty('--s', `${size}px`);
        this.append(el);
        this.items.push({ el, bx: Math.random(), by: Math.random(), phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.8, depth: i % 4 === 0 ? 60 : -30, rx: 0, ry: 0, rot: Math.random() * 360, spin: (Math.random() - 0.5) * 20 });
      }
      for (let i = 0; i < (reduced ? 0 : fine ? 10 : 5); i++) {
        const b = document.createElement('span'); b.className = 'vk-rise';
        b.style.left = `${Math.random() * 100}%`; b.style.animationDelay = `${-Math.random() * 9}s`; b.style.animationDuration = `${7 + Math.random() * 6}s`;
        b.style.setProperty('--s', `${2 + Math.random() * 4}px`); this.append(b);
      }
      this.mouse = { x: 0, y: 0, cx: 0, cy: 0, px: -9999, py: -9999 };
      if (fine && !reduced) {
        this.onMove = (e) => { this.mouse.x = e.clientX / innerWidth - 0.5; this.mouse.y = e.clientY / innerHeight - 0.5; this.mouse.px = e.clientX; this.mouse.py = e.clientY; };
        addEventListener('pointermove', this.onMove, { passive: true });
      }
      if (!count) return;
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.loop(); });
      this.io.observe(this);
    }
    disconnectedCallback() { this.io?.disconnect(); this.visible = false; if (this.onMove) removeEventListener('pointermove', this.onMove); }
    loop() {
      if (this.running) return; this.running = true;
      const tick = () => {
        if (!this.visible) { this.running = false; return; }
        requestAnimationFrame(tick);
        const time = performance.now() * 0.001, m = this.mouse;
        m.cx += (m.x - m.cx) * 0.05; m.cy += (m.y - m.cy) * 0.05;
        if (this.tilt) this.tilt.style.transform = `perspective(1200px) rotateY(${m.cx * 10}deg) rotateX(${m.cy * -8}deg)`;
        const r = this.getBoundingClientRect();
        for (const it of this.items) {
          const x = it.bx * r.width + Math.sin(time * it.speed + it.phase) * 14 + m.cx * it.depth;
          const y = it.by * r.height + Math.cos(time * it.speed * 0.8 + it.phase) * 18 + m.cy * it.depth;
          const dx = m.px - (r.left + x), dy = m.py - (r.top + y), dist = Math.hypot(dx, dy) || 1;
          let tx = 0, ty = 0;
          if (dist < 400) { const force = (400 - dist) / 400; tx = (dx / dist) * force * -80; ty = (dy / dist) * force * -80; }
          it.rx += (tx - it.rx) * 0.1; it.ry += (ty - it.ry) * 0.1; it.rot += it.spin * 0.016;
          it.el.style.transform = `translate3d(${x + it.rx}px, ${y + it.ry}px, 0) rotate(${it.rot}deg)`;
        }
      };
      requestAnimationFrame(tick);
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStack); else initStack();
})();
