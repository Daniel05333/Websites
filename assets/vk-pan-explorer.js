/* ==========================================================================
   VOLKARA — Pan explorer
   An interactive 3D model of the Gehamerde Titanium Pan, built in code (no
   model file): drag to rotate, "Ontdek de lagen" pulls the parts apart, and
   clicking a part (or its button) shows what it does. Scenes in the text
   column switch the view as they scroll past; the page scrolls normally.
   The core layer is a schematic illustration, labelled as such in the UI.
   Three.js is self-hosted and imported only when the section nears the viewport.
   ========================================================================== */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const TAU = Math.PI * 2;

// Views per scene. ry spins the pan around its own axis, rx tilts it toward the camera.
const PRESETS = {
  overview: { ry: -0.6, rx: 0.62, dist: 4.7, tx: 0, ty: 0, explode: 0 },
  layers: { ry: -0.42, rx: 0.42, dist: 6.1, tx: 0.15, ty: 0.2, explode: 1 },
  detail: { ry: -0.25, rx: 1.05, dist: 2.5, tx: -0.45, ty: -0.05, explode: 0 },
  handle: { ry: -2.2, rx: 0.4, dist: 3.4, tx: 0.55, ty: 0.05, explode: 0 },
  ready: { ry: 0.55, rx: 0.55, dist: 4.6, tx: 0, ty: 0, explode: 0 },
};

// Pan proportions (model units): floor radius, rim radius, wall height.
const R0 = 1.0, R1 = 1.38, H = 0.46;
// Wall build-up (inward from the outside surface). Only the outside and the cooking surface are real;
// the band in between is the illustrative core.
const D_BODY = 0.03, D_CORE = 0.05, D_LINER = 0.075;
// How far each part travels in the exploded view (model space, before scaling).
const EXPLODE = { surface: [0, 0.95, 0], core: [0, 0.48, 0], body: [0, 0, 0], base: [0, -0.55, 0], handle: [0.7, 0.08, 0] };

/* ---------- small seeded random, so the hammered pattern is the same on every visit ---------- */
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- hammered relief: tileable cellular noise, each cell a shallow facet ---------- */
function hammerCanvas(size = 512, cells = 22) {
  const rand = rng(11);
  const pts = new Float32Array(cells * cells * 2);
  for (let i = 0; i < cells * cells; i++) { pts[i * 2] = 0.12 + rand() * 0.76; pts[i * 2 + 1] = 0.12 + rand() * 0.76; }
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d'); const img = ctx.createImageData(size, size); const d = img.data;
  for (let y = 0; y < size; y++) {
    const v = (y / size) * cells; const gy = Math.floor(v);
    for (let x = 0; x < size; x++) {
      const u = (x / size) * cells; const gx = Math.floor(u);
      let f1 = 9, f2 = 9;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const cx = gx + ox, cy = gy + oy;
        const k = (((cy % cells) + cells) % cells) * cells + (((cx % cells) + cells) % cells);
        const dx = cx + pts[k * 2] - u, dy = cy + pts[k * 2 + 1] - v;
        const dist = dx * dx + dy * dy;
        if (dist < f1) { f2 = f1; f1 = dist; } else if (dist < f2) f2 = dist;
      }
      f1 = Math.sqrt(f1); f2 = Math.sqrt(f2);
      const edge = Math.min(1, (f2 - f1) * 3.2);
      const h = Math.pow(edge, 0.55) * (1 - 0.45 * f1 * f1);
      const g = 60 + h * 180; const i = (y * size + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = g; d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ---------- concentric machining rings for the base ---------- */
function ringCanvas(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, size, size);
  for (let r = 4; r < size / 2; r += 3) { ctx.strokeStyle = r % 2 ? '#8e8e8e' : '#727272'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(size / 2, size / 2, r, 0, TAU); ctx.stroke(); }
  return c;
}

/* ---------- soft contact shadow ---------- */
function shadowCanvas() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d'); const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(0.45, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); return c;
}

/* ---------- studio environment: soft white key and a cool rim (the red accent is a light, not a reflection) ---------- */
function studioEnv(THREE, renderer) {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: '#0a0a0a', side: THREE.BackSide })));
  const panel = (color, intensity, w, h, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  panel('#ffffff', 3.0, 9, 5, [3, 9, 5]);
  panel('#ffffff', 1.3, 6, 3, [7, 2, 3]);
  panel('#ffffff', 1.8, 10, 4, [0, 8, -7]);
  panel('#d8e8ff', 1.2, 2.5, 10, [-8, 3, 5]);
  panel('#ffffff', 0.45, 16, 1, [0, -6, 8]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.04).texture;
  pmrem.dispose();
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return tex;
}

/* ---------- the pan, one group per part ---------- */
function centerline() {
  // floor → curved wall → flared lip, as (r, y) points along the outside surface
  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push([Math.max(0.0005, (R0 * i) / 6), 0]);
  for (let i = 1; i <= 28; i++) { const t = i / 28; pts.push([R0 + (R1 - R0) * Math.sin((t * Math.PI) / 2), H * (1 - Math.cos((t * Math.PI) / 2))]); }
  pts.push([R1 + 0.022, H + 0.018], [R1 + 0.05, H + 0.028]);
  // inward normals
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    return { r: p[0], y: p[1], nx: -ty, ny: tx };
  });
}
function offsetLine(THREE, line, d, from = 0, to = line.length) {
  return line.slice(from, to).map((p) => new THREE.Vector2(Math.max(0.0005, p.r + p.nx * d), p.y + p.ny * d));
}
function shell(THREE, line, dOut, dIn) {
  const outer = offsetLine(THREE, line, dOut); const inner = offsetLine(THREE, line, dIn).reverse();
  return new THREE.LatheGeometry([...outer, ...inner], 112);
}

function buildPan(THREE, renderer) {
  const parts = {};
  const root = new THREE.Group();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const mat = (o) => new THREE.MeshStandardMaterial({ metalness: 1, envMapIntensity: 1, ...o });
  const part = (id) => { const g = new THREE.Group(); g.userData.part = id; parts[id] = g; root.add(g); return g; };
  const add = (g, mesh) => { mesh.userData.part = g.userData.part; mesh.castShadow = false; g.add(mesh); return mesh; };
  const line = centerline();

  const hammer = new THREE.CanvasTexture(hammerCanvas());
  hammer.wrapS = hammer.wrapT = THREE.RepeatWrapping; hammer.anisotropy = aniso;

  // body: outer wall and flared rim
  const body = part('body');
  add(body, new THREE.Mesh(shell(THREE, line, 0, D_BODY), mat({ color: '#bfbcb7', roughness: 0.24, side: THREE.DoubleSide })));

  // core: schematic only
  const core = part('core');
  add(core, new THREE.Mesh(shell(THREE, line, D_BODY + 0.002, D_CORE), mat({ color: '#2b2b2d', metalness: 0.55, roughness: 0.5, emissive: new THREE.Color('#5a0d07'), emissiveIntensity: 0.35, side: THREE.DoubleSide })));

  // cooking surface: liner plus hammered floor and wall
  const surface = part('surface');
  add(surface, new THREE.Mesh(shell(THREE, line, D_CORE + 0.002, D_LINER), mat({ color: '#c8c5c0', roughness: 0.3, side: THREE.DoubleSide })));
  const floorTex = hammer.clone(); floorTex.needsUpdate = true; floorTex.repeat.set(1.25, 1.25);
  const floor = add(surface, new THREE.Mesh(new THREE.CircleGeometry(R0 - 0.02, 112), mat({ color: '#dedbd6', roughness: 0.3, bumpMap: floorTex, bumpScale: 0.55 })));
  floor.rotation.x = -Math.PI / 2; floor.position.y = D_LINER + 0.0015;
  const wallTex = hammer.clone(); wallTex.needsUpdate = true; wallTex.repeat.set(5.2, 0.45);
  const wallPts = offsetLine(THREE, line, D_LINER + 0.0015, 6, line.length - 6);
  add(surface, new THREE.Mesh(new THREE.LatheGeometry(wallPts, 112), mat({ color: '#d0cdc8', roughness: 0.3, bumpMap: wallTex, bumpScale: 0.3, side: THREE.BackSide })));

  // base: illustrative disc under the floor
  const base = part('base');
  const ring = new THREE.CanvasTexture(ringCanvas()); ring.anisotropy = aniso;
  const disc = add(base, new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.86, 0.035, 96), mat({ color: '#a8a6a2', roughness: 0.42, bumpMap: ring, bumpScale: 0.2 })));
  disc.position.y = -0.019;

  // handle: long grip with a hanging hole, split into two legs that are riveted to the wall
  const handle = part('handle');
  const steel = mat({ color: '#d2cfca', roughness: 0.2 });
  const J = new THREE.Vector3(R1 + 0.36, H + 0.1, 0);
  const grip = new THREE.CatmullRomCurve3([J, new THREE.Vector3(R1 + 0.9, H + 0.3, 0), new THREE.Vector3(R1 + 1.6, H + 0.5, 0), new THREE.Vector3(R1 + 2.12, H + 0.6, 0)]);
  const tube = add(handle, new THREE.Mesh(new THREE.TubeGeometry(grip, 96, 0.075, 20, false), steel)); tube.scale.z = 0.72;
  const capEnd = add(handle, new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), steel)); capEnd.position.copy(grip.getPoint(1)); capEnd.scale.z = 0.72;
  const capStart = add(handle, new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), steel)); capStart.position.copy(J); capStart.scale.z = 0.72;
  const hole = add(handle, new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 10, 28), mat({ color: '#141414', metalness: 0.3, roughness: 0.6 })));
  hole.position.copy(grip.getPoint(0.93)).add(new THREE.Vector3(0, 0.068, 0)); hole.rotation.x = Math.PI / 2;
  const yB = H - 0.1; const tB = Math.acos(1 - yB / H) / (Math.PI / 2); const rB = R0 + (R1 - R0) * Math.sin((tB * Math.PI) / 2);
  for (const z of [-0.1, 0.1]) {
    const leg = new THREE.CatmullRomCurve3([J.clone().add(new THREE.Vector3(-0.02, 0, z * 0.25)), new THREE.Vector3(rB + 0.16, yB + 0.06, z * 0.8), new THREE.Vector3(rB + 0.03, yB, z)]);
    add(handle, new THREE.Mesh(new THREE.TubeGeometry(leg, 32, 0.034, 12, false), steel));
  }
  const plate = add(handle, new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.12, 0.3), steel));
  plate.position.set(rB + 0.018, yB, 0); plate.rotation.z = -0.12;
  // rivet heads: outside on the plate, inside on the cooking surface
  for (const z of [-0.085, 0.085]) {
    const outside = add(handle, new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), steel)); outside.position.set(rB + 0.034, yB, z); outside.scale.x = 0.45;
    const inside = add(handle, new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 12), steel)); inside.position.set(rB - D_LINER - 0.004, yB + 0.008, z); inside.scale.x = 0.45;
  }

  // remember materials for the selection state
  Object.values(parts).forEach((g) => {
    g.userData.mats = [];
    g.traverse((o) => { if (o.isMesh && !g.userData.mats.includes(o.material)) { o.material.userData.baseIntensity = o.material.emissiveIntensity; g.userData.mats.push(o.material); } });
  });
  return { root, parts };
}

if (!customElements.get('vk-pan-explorer')) {
  customElements.define('vk-pan-explorer', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.stage = this.querySelector('[data-explorer-stage]');
      this.canvas = this.querySelector('.vk-explorer__canvas');
      this.scenes = [...this.querySelectorAll('[data-scene]')];
      this.ticks = [...this.querySelectorAll('[data-scene-tick]')];
      this.toggle = this.querySelector('[data-explode]');
      this.layerBtns = [...this.querySelectorAll('[data-layer-btn]')];
      this.cards = [...this.querySelectorAll('[data-layer-info]')];
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.VK?.config?.enableAnimations === false;

      const first = PRESETS[this.scenes[0]?.dataset.scene] || PRESETS.overview;
      this.state = { ry: first.ry, rx: first.rx, dist: first.dist, tx: first.tx, ty: first.ty, explode: first.explode, uy: 0, ux: 0, glow: 0 };
      this.target = { ...this.state };
      this.selected = this.layerBtns[0]?.dataset.layerBtn || null;
      this.sceneIndex = -1;

      this.toggle?.addEventListener('click', () => this.setExplode(this.target.explode < 0.5));
      this.layerBtns.forEach((b) => b.addEventListener('click', () => { this.select(b.dataset.layerBtn); if (this.target.explode < 0.5) this.setExplode(true); }));
      this.addEventListener('click', (e) => {
        const cta = e.target.closest('[data-select-tier]');
        if (cta && cta.dataset.selectTier !== 'none') document.dispatchEvent(new CustomEvent('vk:select-tier', { detail: { tier: cta.dataset.selectTier } }));
      });
      this.bindPointer();
      this.stage.addEventListener('keydown', (e) => {
        const step = 0.35; const map = { ArrowLeft: ['uy', -step], ArrowRight: ['uy', step], ArrowUp: ['ux', -step * 0.6], ArrowDown: ['ux', step * 0.6] };
        if (!map[e.key]) return; e.preventDefault();
        const [k, d] = map[e.key]; this.target[k] += d; this.clampTilt(); this.wake();
      });

      this.onScroll = () => { if (this.scrollQueued) return; this.scrollQueued = true; requestAnimationFrame(() => { this.scrollQueued = false; this.updateScene(); }); };
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onScroll);
      this.updateScene();
      this.select(this.selected, true);

      this.io = new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; if (this.visible) this.wake(); }, { rootMargin: '100px 0px' });
      this.io.observe(this.stage);
      this.ioLoad = new IntersectionObserver(([en]) => { if (en.isIntersecting) { this.ioLoad.disconnect(); this.initGL(); } }, { rootMargin: '600px 0px' });
      this.ioLoad.observe(this);
    }

    disconnectedCallback() {
      removeEventListener('scroll', this.onScroll); removeEventListener('resize', this.onScroll);
      this.io?.disconnect(); this.ioLoad?.disconnect(); this.ro?.disconnect();
      this.running = false; this.disposed = true;
      if (this.scene) this.scene.traverse((o) => { o.geometry?.dispose(); if (o.material) { for (const k of ['map', 'bumpMap']) o.material[k]?.dispose(); o.material.dispose(); } });
      this.scene?.environment?.dispose();
      if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss?.(); }
      this._init = false;
    }

    /* ---------- scenes (driven by normal page scroll) ---------- */
    updateScene() {
      if (!this.scenes.length) return;
      const stageRect = this.stage.getBoundingClientRect();
      const stacked = matchMedia('(max-width: 989px)').matches;
      const line = stacked ? stageRect.bottom + (innerHeight - stageRect.bottom) * 0.45 : innerHeight * 0.55;
      let idx = 0;
      this.scenes.forEach((s, i) => { if (s.getBoundingClientRect().top < line) idx = i; });
      if (idx === this.sceneIndex) return;
      this.sceneIndex = idx;
      this.scenes.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      this.ticks.forEach((t, i) => { t.classList.toggle('is-active', i === idx); t.classList.toggle('is-done', i < idx); });
      const p = PRESETS[this.scenes[idx].dataset.scene] || PRESETS.overview;
      Object.assign(this.target, { ry: p.ry, rx: p.rx, dist: p.dist, tx: p.tx, ty: p.ty, uy: 0, ux: 0 });
      this.setExplode(!!p.explode, true);
    }

    setExplode(on, fromScene) {
      this.target.explode = on ? 1 : 0;
      if (this.toggle) {
        this.toggle.setAttribute('aria-pressed', String(on));
        const label = this.toggle.querySelector('[data-explode-label]'); if (label) label.textContent = on ? label.dataset.on : label.dataset.off;
      }
      this.classList.toggle('is-exploded', on);
      if (!fromScene && on && !this.selected) this.select(this.layerBtns[0]?.dataset.layerBtn);
      this.wake();
    }

    select(part, silent) {
      if (!part) return;
      this.selected = part;
      this.layerBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layerBtn === part)));
      this.cards.forEach((c) => { c.hidden = c.dataset.layerInfo !== part; });
      if (!silent) this.wake();
    }

    clampTilt() { this.target.ux = clamp(this.target.ux, -0.35 - this.target.rx, 1.35 - this.target.rx); }

    /* ---------- drag to rotate; vertical swipes keep scrolling the page (touch-action: pan-y) ---------- */
    bindPointer() {
      let drag = null;
      this.stage.addEventListener('pointerdown', (e) => {
        if (e.button > 0 || e.target.closest('button')) return;
        drag = { x: e.clientX, y: e.clientY, uy: this.target.uy, ux: this.target.ux, moved: 0, t: performance.now(), vx: 0, id: e.pointerId };
        this.vel = 0;
      });
      this.stage.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) { if (e.pointerType === 'mouse' && this.gl) this.hover(e); return; }
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
        if (drag.moved > 4 && !drag.captured) { drag.captured = true; this.stage.setPointerCapture?.(e.pointerId); this.stage.classList.add('is-dragging'); }
        const now = performance.now(); const w = this.stage.clientWidth || 1;
        const prevUy = this.target.uy;
        this.target.uy = drag.uy + (dx / w) * Math.PI * 1.6;
        if (e.pointerType === 'mouse') { this.target.ux = drag.ux + (dy / w) * Math.PI; this.clampTilt(); }
        drag.vx = (this.target.uy - prevUy) / Math.max(1, now - drag.t) * 16; drag.t = now;
        if (this.reduced) Object.assign(this.state, { uy: this.target.uy, ux: this.target.ux });
        this.wake();
      });
      const end = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        if (drag.moved < 5 && e.type === 'pointerup') this.pick(e);
        else if (!this.reduced) this.vel = clamp(drag.vx, -0.25, 0.25);
        this.stage.classList.remove('is-dragging');
        drag = null; this.wake();
      };
      this.stage.addEventListener('pointerup', end);
      this.stage.addEventListener('pointercancel', end);
    }

    ray(e) {
      if (!this.gl) return null;
      const r = this.canvas.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObject(this.model, true)[0];
      return hit ? hit.object.userData.part : null;
    }
    pick(e) {
      const part = this.ray(e); if (!part) return;
      if (this.layerBtns.some((b) => b.dataset.layerBtn === part)) this.select(part);
    }
    hover(e) {
      const now = performance.now(); if (now - (this.lastHover || 0) < 60) return; this.lastHover = now;
      this.stage.classList.toggle('is-pointing', !!this.ray(e));
    }

    /* ---------- WebGL ---------- */
    async initGL() {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { this.classList.add('is-nogl'); return; }
      let THREE;
      try { THREE = await import(new URL(this.dataset.three, document.baseURI).href); } catch (e) { console.warn('Pan explorer: 3D unavailable', e); this.classList.add('is-nogl'); return; }
      if (this.disposed) return;
      const mobile = matchMedia('(max-width: 989px)').matches;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { this.classList.add('is-nogl'); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.setClearColor(0x000000, 0);
      this.renderer = renderer;

      const scene = new THREE.Scene();
      scene.environment = studioEnv(THREE, renderer);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

      scene.add(new THREE.HemisphereLight('#ffffff', '#1a0d0b', 0.35));
      const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(3, 6, 4); scene.add(key);
      const rim = new THREE.DirectionalLight('#dce9ff', 1.4); rim.position.set(-5, 2, -4); scene.add(rim);
      const accent = new THREE.PointLight('#ff3a22', 4, 10, 2); accent.position.set(-2.8, -0.6, -1.6); scene.add(accent);

      // contact shadow, fixed under the pan
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas()), transparent: true, depthWrite: false, opacity: 0.7 }));
      shadow.rotation.x = -Math.PI / 2; shadow.scale.set(4.4, 2.6, 1); shadow.position.y = -1.05; shadow.renderOrder = -1; scene.add(shadow);

      const pivot = new THREE.Group(); scene.add(pivot);
      const { root, parts } = buildPan(THREE, renderer);
      root.scale.setScalar(0.62);
      root.position.set(-0.78, -0.2, 0); // centre the pan plus handle on the pivot
      pivot.add(root);
      Object.values(parts).forEach((g) => { g.userData.home = g.position.clone(); });

      Object.assign(this, { THREE, scene, camera, pivot, model: root, parts, shadow, mobile, raycaster: new THREE.Raycaster(), pointer: new THREE.Vector2(), look: new THREE.Vector3() });
      this.gl = true;
      this.ro = new ResizeObserver(() => { this.resize(); this.wake(); });
      this.ro.observe(this.stage);
      this.resize();
      this.frame(0);
      this.classList.add('is-gl');
      this.wake();
    }

    resize() {
      if (!this.gl) return;
      const w = this.stage.clientWidth || 1, h = this.stage.clientHeight || 1;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
      this.frame(0); // setSize clears the canvas; repaint even when the loop is idle
    }

    /* render only while something moves */
    wake() {
      if (!this.gl || this.running || !this.visible) return;
      this.running = true; this.last = performance.now();
      const loop = (now) => {
        if (!this.running) return;
        const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
        const moving = this.frame(dt);
        if (moving && this.visible && !this.disposed) requestAnimationFrame(loop); else this.running = false;
      };
      requestAnimationFrame(loop);
    }

    frame(dt) {
      const s = this.state, t = this.target;
      if (this.vel) { t.uy += this.vel; this.vel *= 0.9; if (Math.abs(this.vel) < 0.0005) this.vel = 0; }
      t.glow = t.explode > 0.5 ? 1 : 0;
      const k = this.reduced ? 1 : 1 - Math.pow(0.0025, dt);
      let moving = !!this.vel;
      for (const key of Object.keys(t)) {
        const d = t[key] - s[key];
        if (Math.abs(d) > 0.0005) { s[key] += d * k; moving = true; } else s[key] = t[key];
      }
      // pose
      this.pivot.rotation.set(s.rx + s.ux, s.ry + s.uy, 0);
      const e = s.explode * s.explode * (3 - 2 * s.explode);
      for (const [id, g] of Object.entries(this.parts)) {
        const o = EXPLODE[id]; g.position.set(g.userData.home.x + o[0] * e, g.userData.home.y + o[1] * e, g.userData.home.z + o[2] * e);
        // in the exploded view the selected part stays bright and the others step back
        const dim = id === this.selected ? 0 : s.glow;
        g.userData.mats.forEach((m) => { m.envMapIntensity = 1 - dim * 0.6; m.emissiveIntensity = m.userData.baseIntensity * (1 - dim * 0.5); });
      }
      this.shadow.material.opacity = 0.7 * (1 - e * 0.45);
      this.shadow.scale.set(4.4 + e * 0.6, 2.6 + e * 0.3, 1);
      // camera: pull back on narrow screens so the handle stays in frame
      const fit = Math.max(1, 1.25 / this.camera.aspect);
      this.camera.position.set(s.tx, s.ty + 0.35, s.dist * fit);
      this.look.set(s.tx, s.ty, 0);
      this.camera.lookAt(this.look);
      this.renderer.render(this.scene, this.camera);
      return moving;
    }
  });
}
