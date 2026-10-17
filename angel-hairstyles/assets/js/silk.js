// "Signature Motion" — een levende achtergrond van haarstrengen.
//
// Eén full-screen fragment shader in kale WebGL (geen three.js nodig): duizenden
// fijne strengen die als haar golven, met een zijdeachtige glansband die de
// cursor volgt. Tijdens het scrollen verloopt de tint door haarkleuren —
// kastanje → koper → asblond → espresso — zodat de pagina zelf "van look
// wisselt". Alles is decoratief (aria-hidden) en de site werkt volledig zonder.
//
// Kosten in de hand:
//   • pixelratio max 1.25 (1 op touch), canvas pauzeert bij een verborgen tab;
//   • touch-apparaten tekenen maximaal ~30 fps;
//   • prefers-reduced-motion: één stilstaand beeld, alleen opnieuw bij resize;
//   • geen WebGL → de CSS-gradient op het canvas blijft staan.

const canvas = document.querySelector('[data-silk]');
const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });

if (canvas && gl) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const frag = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uMouse;

    float hash(float n){ return fract(sin(n * 12.9898) * 43758.5453); }

    // Haartinten, van boven naar beneden over de pagina.
    vec3 tone(float t){
      vec3 chestnut = vec3(0.30, 0.13, 0.06);
      vec3 copper   = vec3(0.46, 0.20, 0.08);
      vec3 ash      = vec3(0.40, 0.35, 0.29);
      vec3 espresso = vec3(0.20, 0.11, 0.07);
      t = clamp(t, 0.0, 1.0) * 3.0;
      if (t < 1.0) return mix(chestnut, copper, smoothstep(0.0, 1.0, t));
      if (t < 2.0) return mix(copper, ash, smoothstep(0.0, 1.0, t - 1.0));
      return mix(ash, espresso, smoothstep(0.0, 1.0, t - 2.0));
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      float t = uTime * 0.07;
      float sd = uScroll * 4.0;            // scroll buigt de golven langzaam om
      vec2 p = uv * 1.25 + vec2(uMouse.x * 0.04, uMouse.y * 0.03);

      // De richting van het haar: brede, trage golven met een fijnere rimpel.
      float wave = sin(p.x * 1.25 + t * 2.0 + sd) * 0.34
                 + sin(p.x * 2.6 - t * 1.3 + 1.7 - sd * 0.6) * 0.11
                 + sin(p.x * 0.55 + p.y * 0.7 + t) * 0.26;
      float s = p.y + wave;

      // Strengen: elk een eigen dikte, helderheid en ritme langs de lengte.
      float f = s * 120.0;
      float id = floor(f);
      float fr = fract(f) - 0.5;
      float h = hash(id);
      float aa = fwidth(f) * 0.9;
      float width = 0.12 + 0.26 * h;
      float strand = 1.0 - smoothstep(width - aa, width + aa, abs(fr));
      strand *= 0.35 + 0.65 * (0.5 + 0.5 * sin(p.x * (2.0 + h * 3.0) + h * 6.283 + t * 3.0));

      // Volume: lokken die licht vangen en in de schaduw vallen.
      float body = 0.5 + 0.5 * sin(s * 3.3 + t * 1.2 + sin(p.x * 0.8) * 0.8);
      body = pow(body, 1.6);

      // Zijdeglans: een anisotrope highlight die over de strengen schuift
      // en richting de cursor buigt.
      float sc = s * 1.6 - uMouse.y * 0.25 + sin(p.x * 0.9 - t * 1.5) * 0.18 + t * 0.4;
      float band = fract(sc) - 0.5;
      float sheen = exp(-band * band * 70.0);

      vec3 c = tone(uScroll);
      vec3 col = vec3(0.018, 0.012, 0.010);
      col += c * body * 0.55;
      col += c * strand * (0.25 + 0.75 * body) * 0.55;
      col += mix(c, vec3(1.0, 0.92, 0.82), 0.55) * sheen * (0.25 + 0.75 * strand) * 0.55 * (0.4 + 0.6 * body);

      // Leesbaarheid: rustiger linksonder (waar de herotekst staat) en
      // gedempt zodra je onder de hero bent.
      float calm = smoothstep(-0.2, 0.75, uv.x + uv.y * 0.6 + 0.35);
      float dim = mix(1.0, 0.42, smoothstep(0.0, 0.1, uScroll));
      col *= mix(0.35, 1.0, calm) * dim;
      col *= 1.0 - dot(uv, uv) * 0.28;

      gl_FragColor = vec4(pow(col, vec3(0.92)), 1.0);
    }`;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };

  try {
    gl.getExtension('OES_standard_derivatives');
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag.replace('precision highp float;', '#extension GL_OES_standard_derivatives : enable\nprecision highp float;')));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = Object.fromEntries(['uRes', 'uTime', 'uScroll', 'uMouse'].map((n) => [n, gl.getUniformLocation(prog, n)]));

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, coarse ? 1 : 1.25);
      const w = Math.round(innerWidth * dpr);
      // Hoogte vastgezet op de grootste viewport, zodat de mobiele adresbalk geen resize veroorzaakt.
      const h = Math.round(Math.max(innerHeight, canvas.clientHeight) * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.uRes, w, h);
    };

    let target = 0, scroll = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
    const readScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      target = scrollY / max;
    };
    addEventListener('scroll', readScroll, { passive: true });
    addEventListener('pointermove', (e) => {
      tmx = (e.clientX / innerWidth) * 2 - 1;
      tmy = -((e.clientY / innerHeight) * 2 - 1);
    }, { passive: true });

    const start = performance.now();
    let last = 0, raf = 0;
    const draw = (now) => {
      gl.uniform1f(u.uTime, (now - start) / 1000);
      gl.uniform1f(u.uScroll, scroll);
      gl.uniform2f(u.uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (coarse && now - last < 31) return;
      last = now;
      scroll += (target - scroll) * 0.06;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      draw(now);
    };

    const run = () => {
      cancelAnimationFrame(raf);
      resize();
      readScroll();
      scroll = target;
      if (reduced.matches) draw(start + 12000);
      else raf = requestAnimationFrame(frame);
    };

    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduced.matches) draw(start + 12000); }, 120); });
    document.addEventListener('visibilitychange', () => (document.hidden ? cancelAnimationFrame(raf) : run()));
    reduced.addEventListener('change', run);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); cancelAnimationFrame(raf); });
    run();
    canvas.dataset.ready = 'true';
  } catch (err) {
    // Geen WebGL-shader mogelijk: de CSS-achtergrond van het canvas blijft staan.
    console.warn('[silk] uitgeschakeld:', err.message);
  }
}
