// The Conversion Engine — interactieve 3D-hero van NEXD Media.
// Bezoekers (deeltjes) stromen breed binnen, gaan door vier versmallende kaders
// (aandacht, begrip, vertrouwen, actie) en wie overblijft wordt een aanvraag.
// Wordt pas na het laden van de pagina geïmporteerd; de SVG in de HTML is de fallback.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, BufferGeometry, BufferAttribute, Float32BufferAttribute,
  LineSegments, LineBasicMaterial, Mesh, MeshBasicMaterial, PlaneGeometry, BoxGeometry, EdgesGeometry,
  Points, ShaderMaterial, AdditiveBlending, Color, Fog, DoubleSide,
} from 'three';

const INK = new Color('#0e0f0d');
const PAPER = new Color('#e9e4d9');
const SIGNAL = new Color('#ff5a1f');

// Kaders langs de x-as: positie, halve hoogte (y) en halve diepte (z).
const FRAMES = [
  { x: -0.6, hy: 2.3, hz: 1.7 },
  { x: 1.0, hy: 1.75, hz: 1.3 },
  { x: 2.5, hy: 1.25, hz: 0.92 },
  { x: 3.85, hy: 0.8, hz: 0.6 },
];
const CORE_X = 5.2;
const START_X = -11;
// Waar een deeltje afhaakt: 0–3 = bij dat kader, 4 = wordt een aanvraag.
const DROP_WEIGHTS = [0.34, 0.24, 0.16, 0.11, 0.15];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const ease = (t) => 1 - Math.pow(1 - clamp01(t), 3);

// Toegestane spreiding (halve hoogte/diepte) op positie x: de trechter.
function extentAt(x) {
  if (x <= FRAMES[0].x) {
    const t = clamp01((x - START_X) / (FRAMES[0].x - START_X));
    return [lerp(4.2, FRAMES[0].hy, ease(t)), lerp(3.6, FRAMES[0].hz, ease(t))];
  }
  for (let i = 0; i < FRAMES.length - 1; i++) {
    const a = FRAMES[i], b = FRAMES[i + 1];
    if (x <= b.x) {
      const t = (x - a.x) / (b.x - a.x);
      return [lerp(a.hy, b.hy, t), lerp(a.hz, b.hz, t)];
    }
  }
  const last = FRAMES[FRAMES.length - 1];
  const t = clamp01((x - last.x) / (CORE_X - last.x));
  return [lerp(last.hy, 0.22, t), lerp(last.hz, 0.16, t)];
}

function pickDrop(r) {
  let acc = 0;
  for (let i = 0; i < DROP_WEIGHTS.length; i++) if (r < (acc += DROP_WEIGHTS[i])) return i;
  return DROP_WEIGHTS.length - 1;
}

function frameObject(f, i) {
  const g = new Group();
  g.position.x = f.x;
  // Rechthoek in het YZ-vlak, met een tweede, iets kleinere lijn voor de "architectonische" dubbele rand.
  const rect = (hy, hz) => [
    0, -hy, -hz, 0, -hy, hz, 0, -hy, hz, 0, hy, hz, 0, hy, hz, 0, hy, -hz, 0, hy, -hz, 0, -hy, -hz,
  ];
  const tick = 0.18;
  const ticks = [];
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const y = sy * (f.hy + 0.12), z = sz * (f.hz + 0.12);
    ticks.push(0, y, z, 0, y - sy * tick, z, 0, y, z, 0, y, z - sz * tick);
  }
  const outline = new BufferGeometry();
  outline.setAttribute('position', new Float32BufferAttribute([...rect(f.hy, f.hz), ...ticks], 3));
  const lineMat = new LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.55 });
  g.add(new LineSegments(outline, lineMat));

  const fillMat = new MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 0.025, side: DoubleSide, depthWrite: false });
  const fill = new Mesh(new PlaneGeometry(f.hz * 2, f.hy * 2), fillMat);
  fill.rotation.y = Math.PI / 2;
  g.add(fill);

  // Wireframe-"pagina" binnen het kader: wordt zichtbaar bij scrollen (abstract → concreet).
  const rows = [];
  const w = f.hz * 0.8;
  const top = f.hy * 0.78;
  const lines = [[1, 0.55], [0.82, 0.38], [0.7, 0.22], [0.9, -0.05], [0.6, -0.2], [0.75, -0.35]];
  for (const [len, yy] of lines) rows.push(0, yy * f.hy * 1.3, -w, 0, yy * f.hy * 1.3, -w + 2 * w * len);
  rows.push(0, top, -w, 0, top, w); // "header"
  rows.push(0, -top, -w, 0, -top, -w + w * 0.7); // "knop"
  const wire = new BufferGeometry();
  wire.setAttribute('position', new Float32BufferAttribute(rows, 3));
  const wireMat = new LineBasicMaterial({ color: i === FRAMES.length - 1 ? SIGNAL : PAPER, transparent: true, opacity: 0 });
  g.add(new LineSegments(wire, wireMat));

  g.userData = { lineMat, fillMat, wireMat };
  return g;
}

export function mount(container, { lowPower = false } = {}) {
  const N = lowPower ? 320 : 950;
  const renderer = new WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'engine-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new Scene();
  scene.fog = new Fog(INK, 12, 30);
  const camera = new PerspectiveCamera(32, 1, 0.1, 80);

  const world = new Group();
  scene.add(world);

  // Vloerraster: maakt de ruimte leesbaar zonder aandacht te vragen.
  const grid = [];
  for (let i = -14; i <= 14; i++) grid.push(i, 0, -9, i, 0, 9);
  for (let j = -9; j <= 9; j++) grid.push(-14, 0, j, 14, 0, j);
  const gridGeo = new BufferGeometry();
  gridGeo.setAttribute('position', new Float32BufferAttribute(grid, 3));
  const floor = new LineSegments(gridGeo, new LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.06 }));
  floor.position.y = -3.1;
  world.add(floor);

  const frames = FRAMES.map(frameObject);
  frames.forEach((f) => world.add(f));

  // De aanvraag: een massief, oplichtend blok.
  const coreGeo = new BoxGeometry(0.16, 0.5, 0.72);
  const coreMat = new MeshBasicMaterial({ color: SIGNAL });
  const core = new Mesh(coreGeo, coreMat);
  core.position.x = CORE_X;
  const coreEdges = new LineSegments(new EdgesGeometry(new BoxGeometry(0.34, 0.74, 0.98)), new LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.6 }));
  coreEdges.position.x = CORE_X;
  world.add(core, coreEdges);

  // Gloed rond de kern (één punt met grote, zachte sprite).
  const glowGeo = new BufferGeometry();
  glowGeo.setAttribute('position', new Float32BufferAttribute([CORE_X, 0, 0], 3));
  const glowMat = new ShaderMaterial({
    uniforms: { uSize: { value: 420 }, uStrength: { value: 0.5 }, uColor: { value: SIGNAL } },
    vertexShader: 'uniform float uSize; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = uSize / -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uStrength; uniform vec3 uColor; void main(){ float d = length(gl_PointCoord-.5); float a = pow(smoothstep(.5,0.,d),2.2)*uStrength; gl_FragColor = vec4(uColor, a); }',
    transparent: true, depthWrite: false, blending: AdditiveBlending,
  });
  world.add(new Points(glowGeo, glowMat));

  // Deeltjes
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const alpha = new Float32Array(N);
  const size = new Float32Array(N);
  const st = {
    u: new Float32Array(N), v: new Float32Array(N), speed: new Float32Array(N), drop: new Uint8Array(N),
    falling: new Float32Array(N), vy: new Float32Array(N), vz: new Float32Array(N), phase: new Float32Array(N),
  };
  const spawn = (i, x) => {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    st.u[i] = Math.cos(a) * r;
    st.v[i] = Math.sin(a) * r;
    st.speed[i] = 1.1 + Math.random() * 0.9;
    st.drop[i] = pickDrop(Math.random());
    st.falling[i] = 0;
    st.phase[i] = Math.random() * 10;
    size[i] = 0.9 + Math.random() * 1.3;
    pos[i * 3] = x;
  };
  for (let i = 0; i < N; i++) spawn(i, lerp(START_X, CORE_X, Math.random()));

  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new BufferAttribute(col, 3));
  pGeo.setAttribute('aAlpha', new BufferAttribute(alpha, 1));
  pGeo.setAttribute('aSize', new BufferAttribute(size, 1));
  const pMat = new ShaderMaterial({
    uniforms: { uScale: { value: 1 } },
    vertexShader: `attribute float aAlpha; attribute float aSize; attribute vec3 color; varying vec3 vColor; varying float vAlpha; uniform float uScale;
      void main(){ vColor = color; vAlpha = aAlpha; vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vColor; varying float vAlpha;
      void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,.12,d) * vAlpha; if(a < .01) discard; gl_FragColor = vec4(vColor, a); }`,
    transparent: true, depthWrite: false, blending: AdditiveBlending,
  });
  const particles = new Points(pGeo, pMat);
  particles.frustumCulled = false;
  world.add(particles);

  // Interactie-toestand
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scroll = 0;
  let pulse = 0;
  let intro = 0;
  let portrait = false;

  const onPointer = (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onScroll = () => {
    const r = container.getBoundingClientRect();
    scroll = clamp01(-r.top / Math.max(1, r.height));
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    portrait = w / h < 1;
    camera.fov = portrait ? 40 : 32;
    camera.updateProjectionMatrix();
    pMat.uniforms.uScale.value = h * 0.05 * renderer.getPixelRatio();
    glowMat.uniforms.uSize.value = h * 0.9 * renderer.getPixelRatio();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const update = (dt, t) => {
    intro = Math.min(1, intro + dt / 2.2);
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);

    // Camera en compositie: op desktop rechts van de koptekst, op mobiel gecentreerd en hoger.
    const s = ease(scroll);
    // Portret: de hele trechter bovenin, boven de koptekst. Landschap: rechts van de kop.
    if (portrait) {
      world.position.set(-2.1, 4.5, 0);
      world.rotation.y = -0.5 + pointer.x * 0.1 + s * 0.4;
      camera.position.set(0, 0.9, 20 - s * 3);
      camera.lookAt(0, 0.9, 0);
    } else {
      world.position.set(1.6, -0.15, 0);
      world.rotation.y = -0.78 + pointer.x * 0.16 + s * 0.55;
      camera.position.set(0, 0.9, 14 - s * 3);
      camera.lookAt(2.4, 0, 0);
    }
    world.rotation.x = 0.1 + pointer.y * 0.06 - s * 0.06;

    frames.forEach((f, i) => {
      const k = ease((intro - i * 0.12) * 1.6);
      f.scale.set(1, Math.max(0.001, k), Math.max(0.001, k));
      f.userData.lineMat.opacity = 0.5 * k + (i === frames.length - 1 ? 0.15 : 0);
      f.userData.fillMat.opacity = 0.025 + s * 0.05;
      f.userData.wireMat.opacity = s * 0.55;
    });

    pulse = Math.max(0, pulse - dt * 2.5);
    const ps = 1 + pulse * 0.22;
    core.scale.set(ps, ps, ps);
    coreEdges.rotation.x = t * 0.25;
    glowMat.uniforms.uStrength.value = 0.38 + pulse * 0.35;

    const fadeIn = ease(intro * 1.3);
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let x = pos[i3];
      if (st.falling[i] > 0) {
        // Afgehaakt: drijft weg en dooft uit.
        st.falling[i] += dt;
        pos[i3] += dt * 0.35;
        pos[i3 + 1] += st.vy[i] * dt;
        pos[i3 + 2] += st.vz[i] * dt;
        st.vy[i] -= dt * 0.9;
        alpha[i] = Math.max(0, 0.7 - st.falling[i] * 0.55) * fadeIn;
        if (st.falling[i] > 1.4) spawn(i, START_X - Math.random() * 2);
        continue;
      }
      const near = x > FRAMES[0].x - 1 ? 0.75 : 1;
      x += st.speed[i] * dt * near;
      const d = st.drop[i];
      if (d < FRAMES.length && x >= FRAMES[d].x) {
        st.falling[i] = 0.001;
        st.vy[i] = (Math.random() - 0.3) * 0.8;
        st.vz[i] = Math.sign(st.v[i] || 1) * (0.4 + Math.random() * 0.6);
      }
      if (x >= CORE_X - 0.05) {
        pulse = Math.min(1, pulse + 0.35);
        spawn(i, START_X - Math.random() * 2);
        continue;
      }
      const [ey, ez] = extentAt(x);
      const wob = Math.sin(t * 0.9 + st.phase[i]) * 0.05;
      pos[i3] = x;
      pos[i3 + 1] = st.u[i] * ey * 0.92 + wob;
      pos[i3 + 2] = st.v[i] * ez * 0.92 + wob;

      // Kleur: wie voorbij "vertrouwen" komt, wordt signaaloranje.
      const warm = clamp01((x - FRAMES[1].x) / (FRAMES[2].x - FRAMES[1].x)) * (d >= 3 ? 1 : 0.35);
      col[i3] = lerp(PAPER.r, SIGNAL.r, warm);
      col[i3 + 1] = lerp(PAPER.g, SIGNAL.g, warm);
      col[i3 + 2] = lerp(PAPER.b, SIGNAL.b, warm);
      const edgeFade = clamp01((x - START_X) / 3);
      alpha[i] = (0.5 + warm * 0.5) * edgeFade * fadeIn;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
    pGeo.attributes.aAlpha.needsUpdate = true;
  };

  // Alleen renderen als de hero zichtbaar is en het tabblad actief.
  let visible = true;
  let raf = 0;
  let last = performance.now();
  const loop = (now) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt, now / 1000);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? start() : (cancelAnimationFrame(raf), (raf = 0));
  });
  io.observe(container);
  const onVis = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0)) : start());
  document.addEventListener('visibilitychange', onVis);

  const dispose = () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVis);
    scene.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose();
    });
    renderer.dispose();
    canvas.remove();
  };
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    container.classList.remove('is-live');
    dispose();
  });

  // Eerste frame direct renderen, daarna pas tonen (geen lege canvas-flits).
  update(0.016, 0);
  renderer.render(scene, camera);
  container.appendChild(canvas);
  start();
  return { dispose };
}
