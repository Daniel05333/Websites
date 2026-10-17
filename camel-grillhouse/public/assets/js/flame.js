// "Camel Flame" — vonken die van het spit opstijgen, in één WebGL-draw.
// De positie van elke vonk wordt in de vertex-shader uit de tijd berekend,
// dus de CPU doet per frame alleen twee uniforms. Snel scrollen wakkert het
// vuur aan (meer snelheid, meer zwiep), net als bij een smidse.
// Uit bij reduced motion, Save-Data, ≤2 GB geheugen of zonder WebGL; de hero
// blijft dan gewoon de foto. Draait alleen zolang de hero in beeld is.
(() => {
  const canvas = document.querySelector('[data-flame]');
  if (!canvas) return;
  const nav = navigator;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (nav.connection?.saveData || (nav.deviceMemory ?? 8) <= 2) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return;

  const mobile = innerWidth < 768;
  const COUNT = mobile ? 70 : 150;

  const vs = `
    attribute vec4 aSeed;          // x-positie, fase, snelheid, grootte
    uniform float uTime;
    uniform float uAspect;
    uniform float uDpr;
    uniform float uSpread;
    varying float vLife;
    varying float vHue;
    void main() {
      float life = fract(aSeed.y + uTime * aSeed.z);
      float x = aSeed.x + sin(uTime * (0.6 + aSeed.z) * 3.0 + aSeed.y * 40.0) * 0.035 * uSpread
                + (life * life) * (aSeed.y - 0.5) * 0.25 * uSpread;
      float y = -1.05 + life * 2.3;
      vLife = life;
      vHue = fract(aSeed.y * 7.13);
      gl_Position = vec4(x * 2.0 - 1.0, y, 0.0, 1.0);
      gl_PointSize = aSeed.w * uDpr * (1.0 - life * 0.6);
    }`;
  const fs = `
    precision mediump float;
    varying float vLife;
    varying float vHue;
    void main() {
      vec2 p = gl_PointCoord - 0.5;
      float d = length(p);
      float core = smoothstep(0.5, 0.0, d);
      core *= core;
      vec3 ember = vec3(0.89, 0.33, 0.18);
      vec3 amber = vec3(1.0, 0.72, 0.36);
      vec3 hot = vec3(1.0, 0.95, 0.85);
      vec3 col = mix(mix(amber, ember, vLife), hot, step(0.85, vHue) * (1.0 - vLife));
      float a = core * smoothstep(0.0, 0.08, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));
      gl_FragColor = vec4(col * a, a);
    }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  // Vonken concentreren zich bij het spit: rechts op desktop, midden op mobiel.
  const seeds = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    const g = (Math.random() + Math.random() + Math.random()) / 3; // zachte klok
    seeds[i * 4] = mobile ? 0.15 + g * 0.7 : 0.48 + g * 0.5;
    seeds[i * 4 + 1] = Math.random();
    seeds[i * 4 + 2] = 0.05 + Math.random() * 0.09;
    seeds[i * 4 + 3] = 2 + Math.random() * 3.5;
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aSeed');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uAspect = gl.getUniformLocation(prog, 'uAspect');
  const uDpr = gl.getUniformLocation(prog, 'uDpr');
  const uSpread = gl.getUniformLocation(prog, 'uSpread');
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // additief

  const dpr = Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5);
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uAspect, w / Math.max(h, 1));
    gl.uniform1f(uDpr, dpr);
  };
  resize();
  addEventListener('resize', resize);

  let visible = true, raf = 0, last = 0, phase = 0, heat = 0, lastY = scrollY;
  const frame = (t) => {
    raf = 0;
    const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
    const vel = Math.abs(scrollY - lastY) / Math.max(innerHeight, 1) / Math.max(dt, 0.001); lastY = scrollY;
    heat += (Math.min(vel, 3) - heat) * 0.08;               // scrollsnelheid → vuur
    phase += dt * (1 + heat * 2.5);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, phase);
    gl.uniform1f(uSpread, 1 + heat * 3);
    gl.drawArrays(gl.POINTS, 0, COUNT);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(canvas);
  document.addEventListener('visibilitychange', start);
  canvas.setAttribute('data-ready', '');
  start();
})();
