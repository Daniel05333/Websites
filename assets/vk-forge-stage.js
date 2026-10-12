/* ==========================================================================
   VOLKARA — Forge stage
   A cinematic scroll scene: a procedural 3D hammered titanium pan in WebGL, molten sparks, a liquid-metal wave
   shader that shifts from lava to titanium, and an editorial overlay whose
   slides reveal per letter. Three.js is self-hosted (vk-three.module.min.js)
   and only loaded when the stage approaches the viewport.
   ========================================================================== */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const PALETTES = {
  // [shadow, wave2, wave1, crest] per end of the scroll; values are linear RGB
  lava: [[0.0010, 0.0005, 0.0003], [0.040, 0.010, 0.005], [0.072, 0.020, 0.008], [0.40, 0.14, 0.06]],
  titanium: [[0.0006, 0.0006, 0.0008], [0.016, 0.018, 0.022], [0.032, 0.035, 0.042], [0.26, 0.28, 0.32]],
};

const FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform vec3 uFrom[4];
  uniform vec3 uTo[4];

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    float aspect = uResolution.x / uResolution.y;
    float time = uTime * 0.08;
    float scroll = uScroll;

    float angle1 = 0.6; float angle2 = -0.7; float angle3 = 1.2;
    float freq1 = 2.4;  float freq2 = 3.2;  float freq3 = 4.0;

    vec2 warpedUv = uv;
    float scrollDeform = scroll * 5.0;
    warpedUv.x += sin(uv.y * 2.5 + time * 0.2 + scrollDeform) * 0.35;
    warpedUv.y += cos(uv.x * 2.5 - time * 0.15 - scrollDeform * 0.8) * 0.35;
    warpedUv.x += sin(uv.y * 1.2 - time * 0.1 - scrollDeform * 1.5) * 0.25;
    warpedUv.y += cos(uv.x * 1.2 + time * 0.18 + scrollDeform * 1.2) * 0.25;
    warpedUv += vec2(scroll * 0.04, -scroll * 0.02) + vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);

    vec2 dir1 = vec2(cos(angle1), sin(angle1));
    vec2 dir2 = vec2(cos(angle2), sin(angle2));
    vec2 dir3 = vec2(cos(angle3), sin(angle3));
    float w1 = sin(dot(warpedUv, dir1) * freq1 + time * 1.0);
    float w2 = cos(dot(warpedUv, dir2) * freq2 - time * 1.4 + w1 * 0.4);
    float w3 = sin(dot(warpedUv, dir3) * freq3 + time * 1.8 + w2 * 0.5);
    float waveField = w1 * 0.50 + w2 * 0.35 + w3 * 0.15;

    float wideSheen = pow(max(0.0, 1.0 - abs(waveField - 0.1)), 2.5);
    float crispSpecular = pow(max(0.0, 1.0 - abs(waveField - 0.15)), 8.0);
    float crest = wideSheen * 0.5 + crispSpecular * 0.9;

    float t = smoothstep(0.0, 1.0, scroll);
    vec3 colShadow = mix(uFrom[0], uTo[0], t);
    vec3 colWave2  = mix(uFrom[1], uTo[1], t);
    vec3 colWave1  = mix(uFrom[2], uTo[2], t);
    vec3 colCrest  = mix(uFrom[3], uTo[3], t);

    vec3 color = colShadow;
    color = mix(color, colWave2, smoothstep(-0.6, 0.2, waveField));
    color = mix(color, colWave1, smoothstep(0.0, 0.8, waveField));
    color += colCrest * crest * 1.4;
    color *= 1.0 - dot(uv, uv) * 0.12;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/* ---------- textures drawn on a canvas (no image files) ---------- */
function hexCanvas(size = 512, cells = 9) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#a4a4a4'; ctx.fillRect(0, 0, size, size);
  const r = size / cells / 1.732;
  const w = Math.sqrt(3) * r, h = 1.5 * r;
  for (let row = -1; row <= Math.ceil(size / h) + 1; row++) {
    for (let col = -1; col <= Math.ceil(size / w) + 1; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * h;
      const g = ctx.createRadialGradient(cx, cy - r * 0.15, 0, cx, cy, r * 0.95);
      g.addColorStop(0, '#f4f4f4'); g.addColorStop(0.75, '#d2d2d2'); g.addColorStop(1, '#b2b2b2');
      ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; const px = cx + Math.cos(a) * r * 0.93, py = cy + Math.sin(a) * r * 0.93; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    }
  }
  return c;
}

function sparkCanvas() {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.85)');
  g.addColorStop(0.6, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 16);
  return c;
}

/* ---------- the Forge Pan, built from primitives ---------- */
function buildPan(THREE, renderer) {
  const group = new THREE.Group();
  const hex = new THREE.CanvasTexture(hexCanvas());
  hex.wrapS = hex.wrapT = THREE.RepeatWrapping;
  hex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const steel = new THREE.MeshStandardMaterial({ color: '#c9c6c1', metalness: 1, roughness: 0.28 });
  const interior = new THREE.MeshStandardMaterial({ color: '#d2cec8', metalness: 1, roughness: 0.3, bumpMap: hex, bumpScale: 1.1 });
  interior.bumpMap.repeat.set(1, 1);

  // body: one lathe profile, outside wall → rim → inside wall
  const pts = [];
  const R0 = 1.0, R1 = 1.38, H = 0.46, T = 0.035;
  pts.push(new THREE.Vector2(0.001, 0));
  for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector2(R0 + (R1 - R0) * Math.sin(t * Math.PI / 2) + 0.02 * t * t, H * (1 - Math.cos(t * Math.PI / 2)))); }
  pts.push(new THREE.Vector2(R1 + 0.035, H + 0.012));
  pts.push(new THREE.Vector2(R1 - 0.005, H + 0.02));
  for (let i = 20; i >= 0; i--) { const t = i / 20; pts.push(new THREE.Vector2(R0 - T + (R1 - R0 - T) * Math.sin(t * Math.PI / 2), T + (H - T) * (1 - Math.cos(t * Math.PI / 2)))); }
  pts.push(new THREE.Vector2(0.001, T));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 128), steel);
  body.castShadow = body.receiveShadow = true;
  group.add(body);

  // cooking surface with the LavaCell™ relief
  const floorTex = hex.clone(); floorTex.needsUpdate = true; floorTex.repeat.set(3.6, 3.6);
  const floorMat = interior.clone(); floorMat.bumpMap = floorTex;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R0 - T + 0.002, 128), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.y = T + 0.002; floor.receiveShadow = true;
  group.add(floor);
  // inner wall relief (thin shell just inside the wall)
  const wallTex = hex.clone(); wallTex.needsUpdate = true; wallTex.repeat.set(18, 1.6);
  const wallMat = interior.clone(); wallMat.bumpMap = wallTex; wallMat.side = THREE.BackSide;
  const innerPts = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; innerPts.push(new THREE.Vector2(R0 - T - 0.003 + (R1 - R0 - T) * Math.sin(t * Math.PI / 2), T + 0.004 + (H - T - 0.01) * (1 - Math.cos(t * Math.PI / 2)))); }
  group.add(new THREE.Mesh(new THREE.LatheGeometry(innerPts, 128), wallMat));

  // forged handle
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(R1 - 0.08, H - 0.06, 0), new THREE.Vector3(R1 + 0.25, H + 0.04, 0),
    new THREE.Vector3(R1 + 1.0, H + 0.24, 0), new THREE.Vector3(R1 + 1.85, H + 0.36, 0),
  ]);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.062, 20, false), steel);
  handle.scale.z = 0.82; handle.castShadow = true; group.add(handle);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.062, 24, 16), steel);
  cap.position.copy(curve.getPoint(1)); cap.scale.z = 0.82; group.add(cap);
  // hanging hole ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 12, 32), new THREE.MeshStandardMaterial({ color: '#111', metalness: 0.4, roughness: 0.6 }));
  ring.position.copy(curve.getPoint(0.94)).add(new THREE.Vector3(0, 0.04, 0)); ring.rotation.x = Math.PI / 2; group.add(ring);

  // polished steel ferrule where the handle meets the pan
  const tP = 0.12, at = curve.getPoint(tP), tan = curve.getTangent(tP);
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.07, 0.1, 40, 1, false), new THREE.MeshStandardMaterial({ color: '#d9d6d1', metalness: 1, roughness: 0.18 }));
  ferrule.position.copy(at); ferrule.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan); ferrule.scale.z = 0.85;
  group.add(ferrule);

  // rivets
  for (const z of [-0.075, 0.075]) {
    const rv = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), steel);
    rv.position.set(R1 - 0.02, H - 0.1, z); group.add(rv);
  }

  group.rotation.x = 0.42; // show the cooking surface to the camera
  group.rotation.z = -0.05;
  return group;
}

/* ---------- a soft studio environment for believable metal ---------- */
function studioEnv(THREE, renderer) {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: '#050505', side: THREE.BackSide })));
  const panel = (color, intensity, w, h, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  panel('#ffffff', 3.2, 8, 4, [4, 8, 4]);      // key softbox
  panel('#ff5a2a', 2.4, 10, 2, [-6, -2, 3]);   // molten floor bounce
  panel('#cfe6ff', 1.6, 3, 10, [-8, 3, -6]);   // cool rim strip
  panel('#ffffff', 0.6, 14, 1, [0, 6, -10]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  return tex;
}

if (!customElements.get('vk-forge-stage')) {
  customElements.define('vk-forge-stage', class extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.slides = [...this.querySelectorAll('[data-stage-slide]')];
      this.fills = [...this.querySelectorAll('[data-stage-fill]')];
      this.dots = [...this.querySelectorAll('[data-stage-dot]')];
      this.canvas = this.querySelector('.vk-stage__canvas');
      this.splitTitles();

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animations = window.VK?.config?.enableAnimations !== false;
      if (reduced || !animations) { this.classList.add('is-static'); this.slides.forEach((s) => s.classList.add('is-active')); return; }

      this.target = 0; this.current = 0; this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      this.visible = false; this.running = false;
      this.onScroll = () => this.measure();
      this.onPointer = (e) => { this.mouse.tx = (e.clientX / innerWidth) * 2 - 1; this.mouse.ty = (e.clientY / innerHeight) * 2 - 1; };
      this.onResize = () => { this.measure(); this.resizeGL(); };
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onResize);
      addEventListener('pointermove', this.onPointer, { passive: true });
      this.measure(); this.current = this.target; this.updateUI(this.current);

      this.io = new IntersectionObserver(([en]) => {
        this.visible = en.isIntersecting;
        if (this.visible && !this.running) { this.running = true; this.last = performance.now(); requestAnimationFrame((t) => this.tick(t)); }
      }, { rootMargin: '200px 0px' });
      this.io.observe(this);
      this.ioLoad = new IntersectionObserver(([en]) => { if (en.isIntersecting) { this.ioLoad.disconnect(); this.initGL(); } }, { rootMargin: '900px 0px' });
      this.ioLoad.observe(this);
    }

    disconnectedCallback() {
      removeEventListener('scroll', this.onScroll); removeEventListener('resize', this.onResize); removeEventListener('pointermove', this.onPointer);
      this.io?.disconnect(); this.ioLoad?.disconnect(); this.running = false;
      if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss?.(); }
    }

    splitTitles() {
      this.querySelectorAll('[data-stage-title]').forEach((title) => {
        let n = 0;
        const html = title.innerHTML.split(/(<br\s*\/?>)/i).map((part) => {
          if (/^<br/i.test(part)) return part;
          return [...part].map((ch) => (ch === ' ' ? ' ' : `<span class="vk-stage__char" aria-hidden="true" style="transition-delay:${(n++ * 0.035).toFixed(3)}s">${ch}</span>`)).join('');
        }).join('');
        title.innerHTML = html;
      });
    }

    measure() {
      const r = this.getBoundingClientRect();
      const total = this.offsetHeight - innerHeight;
      this.target = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    }

    updateUI(p) {
      const n = this.slides.length || 1;
      this.slides.forEach((s, i) => {
        const start = i === 0 ? -0.1 : i / n + 0.03;
        const end = i === n - 1 ? 1.1 : (i + 1) / n - 0.08;
        s.classList.toggle('is-active', p >= start && p <= end);
      });
      this.fills.forEach((f, i) => { f.style.height = `${clamp((p - i / n) * n, 0, 1) * 100}%`; });
      this.dots.forEach((d, i) => {
        let speed = 90 + (i * 55) % 180; if (i % 2 === 0) speed = -speed;
        const y = (((((i * 17) % 80) + 10 + p * speed) % 100) + 100) % 100;
        d.style.top = `${y}%`;
      });
    }

    tick(now) {
      if (!this.visible) { this.running = false; return; }
      requestAnimationFrame((t) => this.tick(t));
      const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
      this.current += (this.target - this.current) * 0.06;
      this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;
      this.updateUI(this.current);
      if (this.gl) this.renderGL(dt, now / 1000);
    }

    async initGL() {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
      let THREE;
      try { THREE = await import(new URL(this.dataset.three, document.baseURI).href); } catch (e) { console.warn('Forge stage: 3D unavailable', e); return; }
      const mobile = matchMedia('(max-width: 989px)').matches;
      const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = !mobile;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer = renderer;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#000000');
      scene.fog = new THREE.FogExp2('#000000', 0.01);
      scene.environment = studioEnv(THREE, renderer);
      const camera = new THREE.PerspectiveCamera(mobile ? 58 : 50, 1, 0.1, 100);
      camera.position.set(0, 0.2, 3.0);
      scene.add(camera);

      // liquid-metal background, glued to the camera
      const pal = this.dataset.palette || 'lava-titanium';
      const from = PALETTES[pal === 'titanium' ? 'titanium' : 'lava'];
      const to = PALETTES[pal === 'lava' ? 'lava' : 'titanium'];
      this.uniforms = {
        uTime: { value: 0 }, uResolution: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2() }, uScroll: { value: 0 },
        uFrom: { value: from.map((c) => new THREE.Vector3(...c)) }, uTo: { value: to.map((c) => new THREE.Vector3(...c)) },
      };
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms: this.uniforms, depthWrite: false, depthTest: false }));
      bg.position.set(0, 0, -8); bg.renderOrder = -10; camera.add(bg);

      // chiaroscuro lighting
      scene.add(new THREE.AmbientLight('#ffffff', 0.1));
      const key = new THREE.SpotLight('#ffffff', 60, 0, Math.PI / 4, 0.9, 1.2);
      key.position.set(4, 6, 3); key.castShadow = !mobile;
      key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 1; key.shadow.camera.far = 15; key.shadow.bias = -0.001;
      scene.add(key);
      const rim = new THREE.DirectionalLight('#e3f2ff', 4.0); rim.position.set(-5, 3, -4); scene.add(rim);
      const fill = new THREE.DirectionalLight('#ffb48a', 0.9); fill.position.set(-2, -4, 2); scene.add(fill);

      // the pan, centred on a pivot
      const pivot = new THREE.Group(); scene.add(pivot);
      const pan = buildPan(THREE, renderer); pivot.add(pan);
      const box = new THREE.Box3().setFromObject(pan); const size = box.getSize(new THREE.Vector3());
      pan.scale.setScalar(3.4 / Math.max(size.x, size.y, size.z));
      pan.updateMatrixWorld(true);
      pan.position.sub(new THREE.Box3().setFromObject(pan).getCenter(new THREE.Vector3()));
      pivot.position.y = -0.25;
      this.pivot = pivot;

      // molten sparks
      const count = mobile ? Math.round(Number(this.dataset.sparks || 450) * 0.5) : Number(this.dataset.sparks || 450);
      if (count > 0) {
        const pos = new Float32Array(count * 3), col = new Float32Array(count * 3); this.sparkData = [];
        for (let i = 0; i < count; i++) {
          pos.set([(Math.random() - 0.5) * 6.5, (Math.random() - 0.5) * 5 - 0.5, (Math.random() - 0.5) * 6.5], i * 3);
          if (Math.random() < 0.75) col.set([1.0, 0.32 + Math.random() * 0.18, 0.05 + Math.random() * 0.08], i * 3);
          else col.set([0.85 + Math.random() * 0.1, 0.88 + Math.random() * 0.08, 1.0], i * 3);
          this.sparkData.push({ vx: (Math.random() - 0.5) * 0.4, vy: 0.15 + Math.random() * 0.3, vz: (Math.random() - 0.5) * 0.4, sway: 0.5 + Math.random() * 1.5, radius: 0.05 + Math.random() * 0.15, phase: Math.random() * Math.PI * 2 });
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        this.sparks = new THREE.Points(geo, new THREE.PointsMaterial({ size: mobile ? 0.035 : 0.025, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, map: new THREE.CanvasTexture(sparkCanvas()) }));
        scene.add(this.sparks);
      }

      Object.assign(this, { THREE, scene, camera, mobile, lookAt: new THREE.Vector3(), camTarget: new THREE.Vector3() });
      this.gl = true;
      this.resizeGL();
      this.renderGL(0, performance.now() / 1000);
      this.classList.add('is-gl');
    }

    resizeGL() {
      if (!this.gl) return;
      const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
      this.uniforms.uResolution.value.set(w * this.renderer.getPixelRatio(), h * this.renderer.getPixelRatio());
    }

    renderGL(dt, time) {
      const p = this.current;
      const velocity = Math.abs(this.target - this.current);
      // sparks: faster and more turbulent while scrolling fast
      if (this.sparks) {
        const a = this.sparks.geometry.attributes.position.array;
        const speed = 1 + velocity * 9, turb = velocity * 0.8;
        for (let i = 0; i < this.sparkData.length; i++) {
          const d = this.sparkData[i], k = i * 3;
          a[k] += d.vx * dt * speed; a[k + 1] += d.vy * dt * speed; a[k + 2] += d.vz * dt * speed;
          const sway = d.radius * (1 + turb * 4);
          a[k] += Math.sin(time * d.sway + d.phase) * sway * dt; a[k + 2] += Math.cos(time * d.sway + d.phase) * sway * dt;
          if (a[k + 1] > 3 || Math.abs(a[k]) > 3.5 || Math.abs(a[k + 2]) > 3.5) { a[k + 1] = -2.5; a[k] = (Math.random() - 0.5) * 3; a[k + 2] = (Math.random() - 0.5) * 3; }
        }
        this.sparks.geometry.attributes.position.needsUpdate = true;
      }
      // gentle tilt from the pointer
      this.pivot.rotation.y = this.mouse.x * 0.25;
      this.pivot.rotation.x = this.mouse.y * 0.15;
      // camera: a full orbit around the pan, driven by scroll
      const phi = p * Math.PI * 2;
      const lift = Math.sin(p * Math.PI);
      const radius = this.mobile ? 6.2 - lift * 0.3 : 4.2 - lift * 0.6;
      this.camTarget.set(radius * Math.sin(phi), 0.55 + lift * 0.8, radius * Math.cos(phi));
      this.camera.position.lerp(this.camTarget, 0.05);
      // first screen: frame the pan to the right so the text has room
      const ease = (Math.cos(Math.min(1, p / 0.28) * Math.PI) + 1) * 0.5;
      this.lookAt.set(this.mobile ? 0 : -1.35 * ease, this.mobile ? -1.0 : -0.15, 0);
      this.camera.lookAt(this.lookAt);
      this.uniforms.uTime.value = time;
      this.uniforms.uMouse.value.set(this.mouse.x, -this.mouse.y);
      this.uniforms.uScroll.value = p;
      this.renderer.render(this.scene, this.camera);
    }
  });
}
