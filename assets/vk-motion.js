/* ==========================================================================
   VOLKARA — motion engine
   [data-reveal] [data-split] [data-parallax] [data-magnetic] [data-glow]
   [data-tilt] [data-count-to] [data-scrub] <vk-embers> + header scroll state
   One shared rAF loop, IntersectionObserver for visibility, transform/opacity only.
   ========================================================================== */
(() => {
  'use strict';
  const html = document.documentElement;
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = () => window.matchMedia('(pointer: fine)').matches;
  const cfg = () => (window.VK && window.VK.config) || {};
  const done = new WeakSet();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Split text into words (keeps <em>, <br>, nested tags) ---------- */
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let w = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.append(document.createTextNode(' ')); return; }
            const outer = document.createElement('span'); outer.className = 'vk-split-word'; outer.setAttribute('aria-hidden', 'true');
            const inner = document.createElement('span'); inner.className = 'vk-split-inner'; inner.style.setProperty('--vk-w', w++); inner.textContent = p;
            outer.append(inner); frag.append(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(el);
  }

  /* ---------- Reveal ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-revealed');
      revealIO.unobserve(en.target);
      if (en.target.hasAttribute('data-count-to')) count(en.target);
      en.target.querySelectorAll?.('[data-count-to]').forEach(count);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  function count(el) {
    if (el._counted) return; el._counted = true;
    const to = parseFloat(el.dataset.countTo); if (isNaN(to)) return;
    const dec = Number(el.dataset.countDecimals || 0), pre = el.dataset.countPrefix || '', suf = el.dataset.countSuffix || '';
    const nf = new Intl.NumberFormat(document.documentElement.lang || undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce()) { el.textContent = pre + nf.format(to) + suf; return; }
    const dur = Number(el.dataset.countDuration || 1800), t0 = performance.now();
    const step = (t) => { const p = clamp((t - t0) / dur); const e = 1 - Math.pow(1 - p, 4); el.textContent = pre + nf.format(to * e) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- Scroll-linked (parallax + scrub) ---------- */
  const scrollEls = new Set();
  const visible = new Set();
  const visIO = new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target))), { rootMargin: '20% 0px' });
  let ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function frame() {
    ticking = false;
    const vh = window.innerHeight;
    const reads = [];
    visible.forEach((el) => reads.push([el, el.getBoundingClientRect()]));
    reads.forEach(([el, r]) => {
      if (el.hasAttribute('data-parallax')) {
        if (window.innerWidth < 750 && !el.hasAttribute('data-parallax-mobile')) { el.style.transform = ''; }
        else { const speed = parseFloat(el.dataset.parallax) || 0.15; const center = r.top + r.height / 2 - vh / 2; el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`; }
      }
      if (el.hasAttribute('data-scrub')) {
        let p;
        if (el.dataset.scrub === 'sticky') p = clamp(-r.top / Math.max(1, r.height - vh));
        else if (el.dataset.scrub === 'center') p = clamp((vh - r.top) / (vh * 0.5 + r.height * 0.5));
        else p = clamp((vh - r.top) / (vh + r.height));
        el.style.setProperty('--vk-progress', p.toFixed(4));
      }
    });
    headerState();
  }

  /* ---------- Header scroll state ---------- */
  let lastY = window.scrollY;
  function headerState() {
    const y = window.scrollY;
    html.classList.toggle('vk-scrolled', y > 10);
    html.classList.toggle('vk-scrolled-far', y > 240);
    if (Math.abs(y - lastY) > 6) { html.classList.toggle('vk-scroll-down', y > lastY); html.classList.toggle('vk-scroll-up', y < lastY); lastY = y; }
  }

  /* ---------- Pointer effects ---------- */
  function magnetic(el) {
    if (!fine() || reduce() || cfg().enableMagnetic === false) return;
    const strength = parseFloat(el.dataset.magnetic) || 12;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.classList.remove('is-magnet-release');
      el.style.setProperty('--vk-mag-x', `${(x * strength).toFixed(2)}px`); el.style.setProperty('--vk-mag-y', `${(y * strength).toFixed(2)}px`);
      el.style.setProperty('--vk-mag-lx', `${(x * strength * 0.5).toFixed(2)}px`); el.style.setProperty('--vk-mag-ly', `${(y * strength * 0.5).toFixed(2)}px`);
    });
    el.addEventListener('pointerleave', () => { el.classList.add('is-magnet-release'); ['x', 'y', 'lx', 'ly'].forEach((k) => el.style.setProperty(`--vk-mag-${k}`, '0px')); });
  }
  function glow(el) {
    if (!fine()) return;
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--vk-mx', `${e.clientX - r.left}px`); el.style.setProperty('--vk-my', `${e.clientY - r.top}px`); }, { passive: true });
  }
  function tilt(el) {
    if (!fine() || reduce()) return;
    const max = parseFloat(el.dataset.tilt) || 6;
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.setProperty('--vk-tilt-x', `${(-y * max).toFixed(2)}deg`); el.style.setProperty('--vk-tilt-y', `${(x * max).toFixed(2)}deg`); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--vk-tilt-x', '0deg'); el.style.setProperty('--vk-tilt-y', '0deg'); });
  }

  /* ---------- Init / re-init ---------- */
  function init(root = document) {
    const motion = html.classList.contains('vk-motion') && !reduce();
    root.querySelectorAll('[data-split]').forEach((el) => { if (motion) split(el); });
    root.querySelectorAll('[data-reveal], [data-split]').forEach((el) => {
      if (done.has(el)) return; done.add(el);
      if (!motion) { el.classList.add('is-revealed'); if (el.hasAttribute('data-count-to')) count(el); return; }
      if (el.dataset.revealDelay) el.style.setProperty('--vk-delay', `${el.dataset.revealDelay}ms`);
      revealIO.observe(el);
    });
    root.querySelectorAll('[data-reveal-stagger]').forEach((parent) => [...parent.children].forEach((c, i) => c.style.setProperty('--vk-i', i)));
    root.querySelectorAll('[data-count-to]').forEach((el) => { if (!motion) count(el); else if (!el.closest('[data-reveal]') && !done.has(el)) { done.add(el); revealIO.observe(el); } });
    root.querySelectorAll('[data-parallax], [data-scrub]').forEach((el) => { if (scrollEls.has(el)) return; if (reduce() && el.hasAttribute('data-parallax')) return; scrollEls.add(el); visIO.observe(el); });
    root.querySelectorAll('[data-magnetic]').forEach((el) => { if (!el._mag) { el._mag = 1; magnetic(el); } });
    root.querySelectorAll('[data-glow]').forEach((el) => { if (!el._glow) { el._glow = 1; glow(el); } });
    root.querySelectorAll('[data-tilt]').forEach((el) => { if (!el._tilt) { el._tilt = 1; tilt(el); } });
    onScroll();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', () => init());
  if (document.readyState !== 'loading') init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
  window.VKMotion = { init, split, count };

  /* ---------- <vk-embers> ---------- */
  class VKEmbers extends HTMLElement {
    connectedCallback() {
      if (reduce() || cfg().enableEmbers === false || this._init) return; this._init = true;
      this.canvas = document.createElement('canvas'); this.append(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.count = Math.min(60, Number(this.getAttribute('count')) || 36);
      const cs = getComputedStyle(document.documentElement), rgb = (n, d) => (cs.getPropertyValue(n).trim() || d).replace(/\s+/g, '');
      this.colors = [rgb('--vk-lava-rgb', '215,38,30'), rgb('--vk-molten-rgb', '255,75,50'), rgb('--vk-molten-rgb', '255,138,91')];
      this.resize = this.resize.bind(this); this.loop = this.loop.bind(this);
      this.ro = new ResizeObserver(this.resize); this.ro.observe(this); this.resize();
      this.particles = Array.from({ length: this.count }, () => this.spawn(true));
      this.io = new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; if (this.visible) this.start(); }); this.io.observe(this);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.start(); });
    }
    disconnectedCallback() { this.ro?.disconnect(); this.io?.disconnect(); cancelAnimationFrame(this.raf); }
    resize() { const dpr = Math.min(2, window.devicePixelRatio || 1); this.w = this.clientWidth; this.h = this.clientHeight; this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    spawn(initial) {
      return { x: Math.random() * this.w, y: initial ? Math.random() * this.h : this.h + 10, r: Math.random() * 1.8 + 0.4, vy: Math.random() * 0.5 + 0.2, vx: (Math.random() - 0.5) * 0.25, life: 0, max: Math.random() * 500 + 300, c: this.colors[(Math.random() * 3) | 0], phase: Math.random() * Math.PI * 2 };
    }
    start() { if (!this.running && this.visible && !document.hidden) { this.running = true; this.raf = requestAnimationFrame(this.loop); } }
    loop() {
      if (!this.visible || document.hidden) { this.running = false; return; }
      const { ctx } = this; ctx.clearRect(0, 0, this.w, this.h); ctx.globalCompositeOperation = 'lighter';
      this.particles.forEach((p, i) => {
        p.life++; p.y -= p.vy; p.x += p.vx + Math.sin((p.life + p.phase * 60) / 50) * 0.18;
        const a = Math.sin((p.life / p.max) * Math.PI) * 0.85;
        if (p.life > p.max || p.y < -10) { this.particles[i] = this.spawn(false); return; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${p.c},${a})`); g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
      });
      this.raf = requestAnimationFrame(this.loop);
    }
  }
  if (!customElements.get('vk-embers')) customElements.define('vk-embers', VKEmbers);
})();
