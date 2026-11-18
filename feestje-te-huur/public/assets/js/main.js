// Feestje te Huur — interactie. Geen bibliotheken: een WebGL-raymarcher voor de
// 3D-ballonnen, één scroll-handler, IntersectionObservers voor onthullingen.
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
      if (el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); io.unobserve(el); return false; }
      return true;
    });
  };

  // ── hero: 3D-ballonnen (WebGL, raymarching) ───────────────────────────────
  const hero = $('[data-hero]');
  const canvas = $('[data-balloons]');
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

  const N = 6;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform vec2 uShift; uniform float uZoom; uniform vec2 uCam; uniform float uIntro;
uniform vec4 uB[${N}]; uniform float uTilt[${N}];
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float balloon(vec3 p,vec4 b,float tilt){
  vec3 q=p-b.xyz; q.xy=rot(tilt)*q.xy; float r=b.w;
  float k=smoothstep(.2*r,-1.*r,q.y);
  q.xz*=1.+.32*k;
  float e=(length(q/vec3(1.,1.16,1.))-r)*.86;
  vec3 kq=q-vec3(0.,-1.2*r,0.);
  float knot=length(kq*vec3(1.,1.4,1.))-.085*r;
  return min(e,knot);
}
vec2 map(vec3 p){
  vec2 res=vec2(9.,-1.);
  for(int i=0;i<${N};i++){float d=balloon(p,uB[i],uTilt[i]);if(d<res.x)res=vec2(d,float(i));}
  return res;
}
vec3 normal(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
vec3 tint(float i){
  if(i<.5) return vec3(.93,.58,.66);
  if(i<1.5) return vec3(.94,.84,.74);
  if(i<2.5) return vec3(.64,.78,.93);
  if(i<3.5) return vec3(.98,.95,.95);
  if(i<4.5) return vec3(.86,.6,.52);
  return vec3(.98,.76,.81);
}
float metal(float i){return (i>.5&&i<1.5)||(i>3.5&&i<4.5)?1.:0.;}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.78,.62,.66),vec3(1.,.97,.96),smoothstep(-.6,.8,r.y));
  c+=vec3(1.)*smoothstep(.95,.99,dot(r,normalize(vec3(.5,.8,.5))))*1.4;
  c+=vec3(1.,.9,.92)*smoothstep(.85,.97,dot(r,normalize(vec3(-.7,.3,.6))))*.9;
  return c;
}
void main(){
  vec2 uv=((gl_FragCoord.xy-.5*uRes)/uRes.y-uShift)*uZoom;
  vec3 ro=vec3(0.,0.,6.),rd=normalize(vec3(uv,-1.9));
  mat2 ry=rot(uCam.x),rx=rot(uCam.y);
  ro.yz*=rx;rd.yz*=rx;ro.xz*=ry;rd.xz*=ry;
  float t=2.5;vec2 m;bool hit=false;
  for(int i=0;i<90;i++){m=map(ro+rd*t);if(m.x<.0008*t){hit=true;break;}t+=m.x*.9;if(t>11.)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t,n=normal(p),v=-rd;
  vec3 base=tint(m.y);float mt=metal(m.y);
  vec3 L1=normalize(vec3(.5,.8,.6)),L2=normalize(vec3(-.7,.3,.6));
  float ndv=clamp(dot(n,v),0.,1.);
  float dif=clamp(dot(n,L1)*.5+.5,0.,1.);
  float fre=pow(1.-ndv,3.);
  float sp=pow(clamp(dot(n,normalize(L1+v)),0.,1.),mix(220.,300.,mt))*mix(1.1,1.6,mt);
  float sp2=pow(clamp(dot(n,normalize(L2+v)),0.,1.),40.)*.35;
  vec3 col=base*(.38+.72*dif);
  col+=base*pow(1.-ndv,1.6)*.35*(1.-mt);
  vec3 e=env(reflect(rd,n));
  col=mix(col,e*mix(vec3(1.),base*1.25,mt),mix(.06+.4*fre,.45+.4*fre,mt));
  col+=vec3(sp+sp2);
  gl_FragColor=vec4(pow(col,vec3(.95)),1.)*uIntro;
}`;

  let gl = null, U = {};
  if (canvas) {
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uShift', 'uZoom', 'uCam', 'uIntro', 'uB', 'uTilt'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    } catch (err) {
      gl = null;
      console.warn('WebGL niet beschikbaar, fallback getoond.', err);
    }
    if (!gl) root.classList.add('no-webgl');
  }

  if (hero && gl) {
    // basisposities (x, y, z, straal) — een tros zoals in het logo
    const BASE = [[-0.95, 0.15, 0, 0.62], [0.05, 0.62, -0.35, 0.7], [0.95, 0.1, 0.15, 0.6], [-0.4, -0.62, 0.45, 0.5], [0.5, -0.6, -0.15, 0.48], [1.55, 0.95, -0.8, 0.42]];
    const SPEED = [1.1, 1.5, 1.25, 0.9, 1.35, 1.7];
    const st = { yaw: 0, pitch: 0 };
    const B = new Float32Array(N * 4), T = new Float32Array(N);
    const t0 = performance.now();
    let visible = true, running = false;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.25);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const frame = (now) => {
      running = false;
      const t = calm ? 0 : (now - t0) / 1000;
      const p = calm ? 0 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.35) * 0.3;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.3) * 0.2;
      st.yaw = lerp(st.yaw, px * 0.3 + p * 0.4, 0.06);
      st.pitch = lerp(st.pitch, py * 0.12 - p * 0.15, 0.06);
      const intro = calm ? 1 : 1 - Math.pow(1 - clamp(t / 1.8, 0, 1), 3);
      const rise = smooth(0.12, 1, p);
      BASE.forEach(([x, y, z, r], i) => {
        const bob = Math.sin(t * (0.8 + i * 0.13) + i * 1.7) * 0.08;
        B[i * 4] = x * (1 + rise * 0.55) + Math.sin(t * 0.5 + i) * 0.04;
        B[i * 4 + 1] = y + bob - (1 - intro) * (2.6 + i * 0.3) + rise * SPEED[i] * 2.3;
        B[i * 4 + 2] = z;
        B[i * 4 + 3] = r;
        T[i] = Math.sin(t * 0.6 + i * 2.1) * 0.12 + x * -0.12;
      });
      size();
      const W = canvas.width, H = canvas.height, desktop = innerWidth >= 920;
      gl.uniform2f(U.uRes, W, H);
      gl.uniform2f(U.uShift, desktop ? (W * 0.7 - W / 2) / H : 0, desktop ? 0 : (H / 2 - H * 0.3) / H);
      gl.uniform1f(U.uZoom, desktop ? 1.4 : Math.max(1.75, (H / W) * 0.95));
      gl.uniform2f(U.uCam, st.yaw, st.pitch);
      gl.uniform1f(U.uIntro, Math.min(1, intro * 1.4));
      gl.uniform4fv(U.uB, B);
      gl.uniform1fv(U.uTilt, T);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add('is-ready');
      if (!calm) loop();
    };
    const loop = () => { if (!running && visible) { running = true; requestAnimationFrame(frame); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(hero);
    addEventListener('resize', loop);
    loop();
  }

  // ── scroll ───────────────────────────────────────────────────────────────
  const masthead = $('[data-masthead]');
  const bar = $('[data-progress]');
  const dock = $('[data-dock]');
  const footer = $('.footer');
  const reqSec = $('#aanvragen');
  const parallax = $$('[data-parallax]');
  const steps = $('[data-steps]');
  const rail = $('[data-rail]');
  const rents = $$('.rent');
  const coverflow = () => {
    if (calm) return;
    const mid = innerWidth / 2;
    for (const s of rents) {
      const r = s.getBoundingClientRect();
      const d = clamp((r.left + r.width / 2 - mid) / mid, -1.2, 1.2);
      s.style.setProperty('--ry', `${(-d * 12).toFixed(2)}deg`);
      s.style.setProperty('--tz', `${(-Math.abs(d) * 50).toFixed(1)}px`);
    }
  };
  rail?.addEventListener('scroll', () => requestAnimationFrame(coverflow), { passive: true });
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = root.scrollHeight - vh;
    bar?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (masthead) {
      masthead.classList.toggle('is-scrolled', y > 40);
      if (y > lastY + 2 && y > vh * 2.4) masthead.classList.add('is-hidden');
      if (y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    if (dock) {
      const near = (el) => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
      dock.classList.toggle('on', y > (hero ? hero.offsetHeight - vh * 0.4 : vh) && !near(reqSec) && !near(footer));
    }
    if (hero && !calm) {
      const p = clamp(y / Math.max(1, hero.offsetHeight - vh), 0, 1);
      const copy = $('.hero__copy', hero);
      const f = smooth(0.6, 0.97, p);
      copy.style.opacity = (1 - f).toFixed(3);
      copy.style.transform = `translate3d(0, ${(-f * 40).toFixed(1)}px, 0)`;
    }
    if (!calm) for (const el of parallax) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      steps.style.setProperty('--sp', (calm ? 1 : clamp((vh * 0.8 - r.top) / (vh * 0.5), 0, 1)).toFixed(3));
    }
    coverflow();
    sweep();
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // ── kantelkaarten, magnetische knoppen ───────────────────────────────────
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateY(-4px)`;
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

  // ── aanvraag → WhatsApp ──────────────────────────────────────────────────
  const form = $('[data-form]');
  if (form) {
    const date = form.elements.date;
    const today = new Date();
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    date.min = iso(new Date(today.getTime() + 86400000));
    const nice = (v) => {
      if (!v) return '';
      const [y, m, d] = v.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };
    const preview = $('[data-preview]', form), error = $('[data-error]', form);
    const message = () => {
      const f = new FormData(form);
      const party = f.get('party');
      if (!party) return '';
      const rent = party.startsWith('Huren: ');
      const g = (k) => String(f.get(k) || '').trim();
      return [
        rent ? `Hoi Feestje te Huur! Ik wil graag de ${party.slice(7).toLowerCase()} huren.` : `Hoi Feestje te Huur! Ik wil graag een ${party} aanvragen.`,
        g('date') && `Datum: ${nice(g('date'))}${g('part') !== 'Maakt niet uit' ? `, ${g('part').toLowerCase()}` : ''}`,
        g('kids') && `Aantal kinderen: ${g('kids')}`,
        g('age') && `Leeftijd jarige: ${g('age')} jaar`,
        g('note') && `Wensen: ${g('note')}`,
        g('name') && `Groetjes, ${g('name')}`,
      ].filter(Boolean).join('\n');
    };
    const update = () => { preview.textContent = message() || 'Kies een feestje…'; error.textContent = ''; };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ask]');
      if (!b) return;
      e.preventDefault();
      if (b.dataset.pre) { form.elements.party.value = b.dataset.pre; update(); }
      $('#aanvragen').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => {
        form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash');
        (form.elements.party.value ? date : form.elements.party).focus({ preventScroll: true });
      }, calm ? 0 : 700);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      if (!f.get('party')) { error.textContent = 'Kies eerst een feestje.'; form.elements.party.focus(); return; }
      if (!f.get('date')) { error.textContent = 'Kies een gewenste datum.'; date.focus(); return; }
      if (!String(f.get('name') || '').trim()) { error.textContent = 'Vul je naam in.'; form.elements.name.focus(); return; }
      window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(message())}`, '_blank', 'noopener');
    });
  }
})();
