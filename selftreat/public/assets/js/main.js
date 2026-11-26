// Selftreat — interactie. Geen bibliotheken: een WebGL-raymarcher voor de
// 3D-pastelblobs, filters voor de salons en een boekflow per salon.
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
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  let pending = $$('.reveal, .title');
  pending.forEach((el) => io.observe(el));
  const sweep = () => {
    pending = pending.filter((el) => {
      if (el.classList.contains('in')) return false;
      if (el.offsetParent !== null && el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); io.unobserve(el); return false; }
      return true;
    });
  };

  // ── hero: 3D-pastelblobs (WebGL, raymarching met smooth union) ───────────
  const hero = $('[data-hero]');
  const canvas = $('[data-blobs]');
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

  const N = 5;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform vec2 uShift; uniform float uZoom; uniform vec2 uCam; uniform float uK; uniform float uIntro;
uniform vec4 uS[${N}];
const vec3 C0=vec3(.6,.65,.86), C1=vec3(.6,.86,.75), C2=vec3(.9,.9,.5), C3=vec3(.96,.66,.8), C4=vec3(.98,.97,1.);
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float map(vec3 p){
  float d=length(p-uS[0].xyz)-uS[0].w;
  for(int i=1;i<${N};i++) d=smin(d,length(p-uS[i].xyz)-uS[i].w,uK);
  return d;
}
vec3 tint(vec3 p){
  vec3 c=vec3(0.);float ws=0.;
  for(int i=0;i<${N};i++){
    float w=exp(-3.*max(length(p-uS[i].xyz)-uS[i].w,0.)*4.);
    vec3 col=i==0?C0:i==1?C1:i==2?C2:i==3?C3:C4;
    c+=col*w;ws+=w;
  }
  return c/max(ws,1e-4);
}
vec3 normal(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.8,.78,.9),vec3(1.),smoothstep(-.5,.8,r.y));
  c+=vec3(1.)*smoothstep(.93,.99,dot(r,normalize(vec3(.5,.8,.5))))*1.2;
  c+=vec3(.95,.9,1.)*smoothstep(.86,.97,dot(r,normalize(vec3(-.7,.2,.6))))*.6;
  return c;
}
void main(){
  vec2 uv=((gl_FragCoord.xy-.5*uRes)/uRes.y-uShift)*uZoom;
  vec3 ro=vec3(0.,0.,6.),rd=normalize(vec3(uv,-1.9));
  mat2 ry=rot(uCam.x),rx=rot(uCam.y);
  ro.yz*=rx;rd.yz*=rx;ro.xz*=ry;rd.xz*=ry;
  float t=2.;bool hit=false;float d;
  for(int i=0;i<80;i++){d=map(ro+rd*t);if(d<.001*t){hit=true;break;}t+=d*.9;if(t>11.)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t,n=normal(p),v=-rd;
  vec3 base=tint(p);
  vec3 L=normalize(vec3(.5,.8,.6));
  float ndv=clamp(dot(n,v),0.,1.);
  float dif=clamp(dot(n,L)*.5+.5,0.,1.);
  float fre=pow(1.-ndv,2.5);
  float sp=pow(clamp(dot(n,normalize(L+v)),0.,1.),160.)*1.1;
  vec3 iri=.5+.5*cos(6.283*(fre*.8+vec3(0.,.33,.67)));
  vec3 col=base*(.55+.55*dif);
  col+=base*pow(1.-ndv,1.4)*.25;
  col=mix(col,env(reflect(rd,n))*mix(vec3(1.),iri,.25),.1+.45*fre);
  col+=vec3(sp);
  gl_FragColor=vec4(col,1.)*uIntro;
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
      ['uRes', 'uShift', 'uZoom', 'uCam', 'uK', 'uIntro', 'uS'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    } catch (err) {
      gl = null;
      console.warn('WebGL niet beschikbaar, fallback getoond.', err);
    }
    if (!gl) root.classList.add('no-webgl');
  }

  if (hero && gl) {
    const BASE = [[-0.6, 0.35, 0, 0.82], [0.55, 0.45, -0.3, 0.7], [0.15, -0.55, 0.35, 0.66], [0.95, -0.35, 0.2, 0.52], [-0.95, -0.5, -0.2, 0.46]];
    const S = new Float32Array(N * 4);
    const st = { yaw: 0, pitch: 0 };
    const t0 = performance.now();
    let visible = true, running = false;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.25);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const frame = (now) => {
      running = false;
      const t = calm ? 2 : (now - t0) / 1000;
      const p = calm ? 0 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.3) * 0.3;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.27) * 0.2;
      st.yaw = lerp(st.yaw, px * 0.35 + p * 0.8, 0.06);
      st.pitch = lerp(st.pitch, py * 0.18, 0.06);
      const spread = 1 + smooth(0, 1, p) * 0.9;
      const intro = calm ? 1 : 1 - Math.pow(1 - clamp(t / 1.6, 0, 1), 3);
      BASE.forEach(([x, y, z, r], i) => {
        const a = t * (0.35 + i * 0.07) + i * 1.9;
        S[i * 4] = (x + Math.sin(a) * 0.22) * spread;
        S[i * 4 + 1] = (y + Math.cos(a * 0.8) * 0.2) * spread;
        S[i * 4 + 2] = z + Math.sin(a * 0.6) * 0.25;
        S[i * 4 + 3] = r * (0.6 + 0.4 * intro) * (1 + Math.sin(t * 1.3 + i) * 0.03);
      });
      size();
      const W = canvas.width, H = canvas.height, desktop = innerWidth >= 920;
      gl.uniform2f(U.uRes, W, H);
      gl.uniform2f(U.uShift, desktop ? (W * 0.72 - W / 2) / H : 0, desktop ? 0.02 : (H / 2 - H * 0.25) / H);
      gl.uniform1f(U.uZoom, desktop ? 1.3 : Math.max(2.2, (H / W) * 1.15));
      gl.uniform2f(U.uCam, st.yaw, st.pitch);
      gl.uniform1f(U.uK, 0.42 - smooth(0, 1, p) * 0.28);
      gl.uniform1f(U.uIntro, Math.min(1, intro * 1.4));
      gl.uniform4fv(U.uS, S);
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
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    masthead?.classList.toggle('is-scrolled', scrollY > 40);
    sweep();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // ── kantelkaarten ────────────────────────────────────────────────────────
  if (fine && !calm) $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // ── zoeken & filteren ────────────────────────────────────────────────────
  const grid = $('[data-grid]');
  const cards = grid ? $$('.salon', grid) : [];
  const count = $('[data-count]'), active = $('[data-active]'), empty = $('[data-empty]');
  const search = $('[data-search]');
  const provNames = Object.fromEntries([...(search?.elements.p.options ?? [])].map((o) => [o.value, o.textContent]));
  const catNames = Object.fromEntries($$('[data-cat]').map((b) => [b.dataset.cat, $('b', b).textContent]));
  const state = { t: '', p: '', h: false, c: '' };
  const x = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const apply = () => {
    let n = 0;
    cards.forEach((c) => {
      const ok = (!state.t || c.dataset.treat.split('|').includes(state.t))
        && (!state.p || c.dataset.prov === state.p)
        && (!state.h || c.dataset.home === '1')
        && (!state.c || c.dataset.cats.split(' ').includes(state.c));
      c.hidden = !ok;
      if (ok) { n++; c.classList.add('in'); }
    });
    count.textContent = `${n} ${n === 1 ? 'salon' : 'salons'}${state.t || state.p || state.h || state.c ? ' gevonden' : ''}`;
    empty.hidden = n > 0;
    const chips = [
      state.c && ['c', catNames[state.c]], state.t && ['t', state.t], state.p && ['p', provNames[state.p]], state.h && ['h', 'Aan huis'],
    ].filter(Boolean);
    active.innerHTML = chips.map(([k, l]) => `<button class="chip" type="button" data-clear="${k}" aria-label="Filter ${l} verwijderen">${l}${x}</button>`).join('')
      + (chips.length > 1 ? '<button class="chip chip--reset" type="button" data-clear="all">Wis alles</button>' : '');
    $$('[data-prov]').forEach((b) => b.tagName === 'BUTTON' && b.setAttribute('aria-pressed', b.dataset.prov === state.p));
    if (search) { search.elements.t.value = state.t; search.elements.p.value = state.p; search.elements.h.checked = state.h; }
  };
  const go = () => { apply(); $('#salons').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' }); };
  search?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(search);
    Object.assign(state, { t: f.get('t'), p: f.get('p'), h: f.has('h'), c: '' });
    go();
  });
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cat]'), p = e.target.closest('button[data-prov]'), cl = e.target.closest('[data-clear]'), r = e.target.closest('[data-reset]');
    if (c) { state.c = c.dataset.cat; state.t = ''; go(); }
    if (p) { state.p = state.p === p.dataset.prov ? '' : p.dataset.prov; go(); }
    if (cl) { if (cl.dataset.clear === 'all') Object.assign(state, { t: '', p: '', h: false, c: '' }); else state[cl.dataset.clear] = cl.dataset.clear === 'h' ? false : ''; apply(); }
    if (r) { Object.assign(state, { t: '', p: '', h: false, c: '' }); apply(); }
  });
  if (grid) apply();

  // ── salonpagina + boeken ─────────────────────────────────────────────────
  const sheet = $('[data-sheet]');
  const data = JSON.parse($('#salons-data')?.textContent || '[]');
  if (sheet) {
    const form = $('[data-book]', sheet), done = $('[data-done]', sheet), err = $('[data-error]', sheet);
    const names = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const times = ['09:30', '10:30', '11:30', '13:00', '14:00', '15:30', '16:30', '18:00'];
    let current = null, opener = null;
    const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const renderTimes = () => {
      const day = new FormData(form).get('day') || '';
      const h = hash(current.id + day);
      $('[data-times]', sheet).innerHTML = times.map((tm, i) => {
        const busy = ((h >> i) & 3) === 0;
        return `<label><input type="radio" name="time" value="${tm}"${busy ? ' disabled' : ''}><span>${tm}</span></label>`;
      }).join('');
    };
    const open = (id) => {
      current = data.find((s) => s.id === id);
      if (!current) return;
      $('[data-title]', sheet).textContent = current.title;
      $('[data-meta]', sheet).textContent = `${current.meta} · ${current.cats.join(', ')}`;
      $('[data-gallery]', sheet).innerHTML = (current.img.length ? current.img : [null, null]).map((im) => im ? `<img src="/assets/img/${im}.webp" alt="" loading="lazy">` : '<span class="ph"></span>').join('');
      $('[data-treatments]', sheet).innerHTML = current.treatments.map((t, i) => `<label><input type="radio" name="treat" value="${t}"${i === 0 ? ' checked' : ''}><span>${t}<small>prijs volgt</small></span></label>`).join('');
      const today = new Date();
      const days = [];
      for (let i = 1; days.length < 8; i++) { const d = new Date(today); d.setDate(today.getDate() + i); if (d.getDay() !== 0) days.push(d); }
      $('[data-days]', sheet).innerHTML = days.map((d, i) => `<label><input type="radio" name="day" value="${names[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}"${i === 0 ? ' checked' : ''}><span>${i === 0 && d.getDate() === new Date(today.getTime() + 864e5).getDate() ? 'Morgen' : names[d.getDay()]}<small>${d.getDate()} ${months[d.getMonth()]}</small></span></label>`).join('');
      renderTimes();
      form.hidden = false; done.hidden = true; err.textContent = ''; form.elements.name.value = '';
      sheet.showModal();
      sheet.scrollTop = 0;
    };
    form.addEventListener('change', (e) => { if (e.target.name === 'day') renderTimes(); err.textContent = ''; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      if (!f.get('time')) { err.textContent = 'Kies een tijd.'; $('[data-times] input:not(:disabled)', sheet)?.focus(); return; }
      if (!String(f.get('name') || '').trim()) { err.textContent = 'Vul je naam in.'; form.elements.name.focus(); return; }
      $('[data-summary]', sheet).textContent = `${f.get('treat')} bij ${current.title}\n${f.get('day')} om ${f.get('time')}\nOp naam van ${String(f.get('name')).trim()}`;
      form.hidden = true; done.hidden = false; done.focus();
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-open]');
      if (b) { opener = b; open(b.dataset.open); }
    });
    $('[data-close]', sheet).addEventListener('click', () => sheet.close());
    sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
    sheet.addEventListener('close', () => opener?.focus());
  }
})();
