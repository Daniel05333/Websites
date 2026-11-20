// Design Events — interactie. Geen bibliotheken: een WebGL-raymarcher voor de
// 3D-cocktailglazen (transparant kristal, gouden rand, vloeistof die vult),
// één scroll-handler, galerij met vergrootweergave en een aanvraagformulier.
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
      if (el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); io.unobserve(el); return false; }
      return true;
    });
  };

  // ── hero: 3D-glazen ──────────────────────────────────────────────────────
  const hero = $('[data-hero]');
  const canvas = $('[data-glasses]');
  const fillBar = $('[data-fill]'), fillLabel = $('[data-fill-label]');
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
uniform vec2 uRes; uniform vec2 uShift; uniform float uZoom; uniform vec2 uCam; uniform float uIntro;
uniform vec4 uG[${N}]; uniform float uFill[${N}];
const float H=.5, R=.46, TH=.008;
vec3 liquid(float i){
  if(i<.5) return vec3(.97,.94,.86);
  if(i<1.5) return vec3(.98,.66,.42);
  if(i<2.5) return vec3(.93,.45,.58);
  if(i<3.5) return vec3(.86,.9,.66);
  return vec3(.95,.82,.7);
}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
// x: afstand, y: materiaal (0 glas, 1 vloeistof, 2 goud), z: glas-index
vec3 glass(vec3 p,float i,float fill){
  vec2 q=vec2(length(p.xz),p.y);
  vec2 k=normalize(vec2(H,-R));
  float side=dot(q,k);
  float shell=max(abs(side)-TH,max(q.y-H,-q.y));
  float stem=max(q.x-.022,abs(q.y+.27)-.27);
  float foot=max(q.x-.26,abs(q.y+.55)-.01)-.004;
  float g=min(shell,min(stem,foot));
  float hl=H*mix(.05,.86,fill);
  float liq=max(side+TH*2.5,max(q.y-hl,-q.y+.01));
  float rim=length(vec2(q.x-R,q.y-H))-.009;
  vec3 r=vec3(g,0.,i);
  if(liq<r.x) r=vec3(liq,1.,i);
  if(rim<r.x) r=vec3(rim,2.,i);
  return r;
}
vec3 map(vec3 p){
  vec3 r=vec3(9.,-1.,0.);
  for(int i=0;i<${N};i++){vec3 g=glass(p-uG[i].xyz,float(i),uFill[i]);if(g.x<r.x)r=g;}
  return r;
}
vec3 normal(vec3 p){vec2 e=vec2(.0012,-.0012);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.82,.79,.74),vec3(1.,.99,.97),smoothstep(-.5,.7,r.y));
  c+=vec3(1.)*smoothstep(.93,.99,dot(r,normalize(vec3(.5,.8,.6))))*1.8;
  c+=vec3(1.,.93,.78)*smoothstep(.9,.98,dot(r,normalize(vec3(-.7,.3,.5))))*1.1;
  c+=vec3(1.)*smoothstep(.97,.995,dot(r,normalize(vec3(.8,.1,.4))))*1.4;
  return c;
}
void main(){
  vec2 uv=((gl_FragCoord.xy-.5*uRes)/uRes.y-uShift)*uZoom;
  vec3 ro=vec3(0.,.15,5.2),rd=normalize(vec3(uv,-1.9));
  mat2 ry=rot(uCam.x),rx=rot(uCam.y);
  ro.yz*=rx;rd.yz*=rx;ro.xz*=ry;rd.xz*=ry;
  vec4 acc=vec4(0.);float t=2.;int hits=0;
  vec3 L=normalize(vec3(.5,.8,.6));
  for(int i=0;i<150;i++){
    vec3 p=ro+rd*t;vec3 m=map(p);
    if(m.x<.0007*t){
      vec3 n=normal(p);if(dot(n,rd)>0.)n=-n;
      float fre=pow(1.-clamp(dot(n,-rd),0.,1.),3.);
      float sp=pow(clamp(dot(n,normalize(L-rd)),0.,1.),120.);
      if(m.y<.5){
        float a=.06+.7*fre+sp;
        vec3 c=env(reflect(rd,n))*(.9+.2*fre)+vec3(sp);
        acc+=(1.-acc.a)*vec4(c*a,a);
        t+=.03;hits++;if(hits>5||acc.a>.97)break;continue;
      }
      vec3 c;
      if(m.y<1.5){
        vec3 b=liquid(m.z);
        float dif=clamp(dot(n,L)*.5+.5,0.,1.);
        c=b*(.55+.5*dif)+b*pow(fre,.6)*.15+vec3(sp*.6);
      }else{
        vec3 gold=vec3(.78,.62,.36);
        float dif=clamp(dot(n,L)*.5+.5,0.,1.);
        c=gold*(.45+.6*dif)+env(reflect(rd,n))*gold*.5+vec3(sp*1.4);
      }
      acc+=(1.-acc.a)*vec4(c,1.);break;
    }
    t+=max(m.x*.85,.0015);if(t>12.)break;
  }
  gl_FragColor=acc*uIntro;
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
      ['uRes', 'uShift', 'uZoom', 'uCam', 'uIntro', 'uG', 'uFill'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    } catch (err) {
      gl = null;
      console.warn('WebGL niet beschikbaar, fallback getoond.', err);
    }
    if (!gl) root.classList.add('no-webgl');
  }

  if (hero && gl) {
    // twee treden, zoals hun acryl trappen: achter hoger
    const BASE = [[-0.95, -0.25, 0.45], [0, -0.25, 0.55], [0.95, -0.25, 0.45], [-0.5, 0.62, -0.45], [0.5, 0.62, -0.45]];
    const NAMES = ['Kokos', 'Passievrucht', 'Rozen', 'Limoen', 'Tiramisu'];
    const G = new Float32Array(N * 4), F = new Float32Array(N);
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
      const t = calm ? 3 : (now - t0) / 1000;
      const p = calm ? 1 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.3) * 0.35;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.27) * 0.2;
      st.yaw = lerp(st.yaw, px * 0.35 - 0.3 + p * 0.7, 0.06);
      st.pitch = lerp(st.pitch, 0.22 + py * 0.12 + p * 0.08, 0.06);
      const intro = calm ? 1 : 1 - Math.pow(1 - clamp(t / 1.6, 0, 1), 3);
      let shown = 0;
      BASE.forEach(([x, y, z], i) => {
        G[i * 4] = x; G[i * 4 + 1] = y + Math.sin(t * 0.8 + i * 1.3) * 0.025 - (1 - intro) * 0.6; G[i * 4 + 2] = z;
        // elk glas vult na elkaar tijdens het scrollen (en een beetje bij het laden)
        const f = calm ? 0.9 : Math.max(smooth(0, 1.4, t - i * 0.15) * 0.35, smooth(i * 0.14, i * 0.14 + 0.32, p) * 0.9 + 0.1 * smooth(0, 1.4, t));
        F[i] = f;
        if (f > 0.6) shown = i;
      });
      fillBar?.style.setProperty('--f', (calm ? 1 : smooth(0, 0.88, p)).toFixed(3));
      if (fillLabel) fillLabel.textContent = NAMES[shown];
      hero.style.setProperty('--p', p.toFixed(3));
      size();
      const W = canvas.width, Hh = canvas.height, desktop = innerWidth >= 900;
      gl.uniform2f(U.uRes, W, Hh);
      gl.uniform2f(U.uShift, desktop ? (W * 0.68 - W / 2) / Hh : 0, desktop ? -0.02 : (Hh / 2 - Hh * 0.3) / Hh);
      gl.uniform1f(U.uZoom, desktop ? 1.22 : Math.max(2, (Hh / W) * 1.05));
      gl.uniform2f(U.uCam, st.yaw, st.pitch);
      gl.uniform1f(U.uIntro, Math.min(1, intro * 1.4));
      gl.uniform4fv(U.uG, G);
      gl.uniform1fv(U.uFill, F);
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
  const reqSec = $('#aanvraag');
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
      if (y > lastY + 2 && y > vh * 2.6 && !$('dialog[open]')) masthead.classList.add('is-hidden');
      if (y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    if (dock) {
      const near = (el) => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
      dock.classList.toggle('on', y > (hero ? hero.offsetHeight - vh * 0.4 : vh) && !near(reqSec) && !near(footer));
    }
    if (hero && !calm) {
      const p = clamp(y / Math.max(1, hero.offsetHeight - vh), 0, 1);
      const copy = $('.hero__copy', hero);
      const f = smooth(0.7, 0.98, p);
      copy.style.opacity = (1 - f).toFixed(3);
      copy.style.transform = `translate3d(0, ${(-f * 40).toFixed(1)}px, 0)`;
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

  // ── kantelfoto's, magnetische knoppen ────────────────────────────────────
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1100px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg)`;
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

  // ── galerij: vergrootweergave ────────────────────────────────────────────
  const box = $('[data-lightbox]');
  if (box) {
    const shots = $$('[data-zoom]');
    const img = $('[data-lightbox-img]', box), cap = $('[data-lightbox-cap]', box);
    let idx = 0, opener = null;
    const show = (i) => { idx = (i + shots.length) % shots.length; img.src = shots[idx].dataset.zoom; img.alt = shots[idx].dataset.label; cap.textContent = shots[idx].dataset.label; };
    shots.forEach((b, i) => b.addEventListener('click', () => { opener = b; show(i); box.showModal(); }));
    $('[data-lightbox-prev]', box).addEventListener('click', () => show(idx - 1));
    $('[data-lightbox-next]', box).addEventListener('click', () => show(idx + 1));
    $('[data-lightbox-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    box.addEventListener('close', () => opener?.focus());
  }

  // ── aanvraag → kopiëren → Instagram-DM ───────────────────────────────────
  const form = $('[data-form]');
  const toast = $('[data-toast]');
  const say = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 4500); };
  if (form) {
    const date = form.elements.date;
    const d0 = new Date(Date.now() + 864e5);
    date.min = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}-${String(d0.getDate()).padStart(2, '0')}`;
    const nice = (v) => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
    const preview = $('[data-preview]', form), error = $('[data-error]', form);
    const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} en ${a.at(-1)}`);
    const message = () => {
      const f = new FormData(form);
      const opts = f.getAll('opt');
      if (!opts.length) return '';
      const g = (k) => String(f.get(k) || '').trim();
      return [
        `Hoi Design Events! Wij zijn geïnteresseerd in de ${list(opts)}.`,
        `Event: ${g('kind').toLowerCase()}${g('date') ? ` op ${nice(g('date'))}` : ''}`,
        g('guests') && `Aantal gasten: ${g('guests')}`,
        g('venue') && `Locatie: ${g('venue')}`,
        g('note') && `Kleuren / thema: ${g('note')}`,
        'Kunnen jullie ons een offerte sturen?',
        g('name') && `Groetjes, ${g('name')}`,
      ].filter(Boolean).join('\n');
    };
    const update = () => { preview.textContent = message() || 'Kies een of meer opties…'; error.textContent = ''; };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ask]');
      if (!b) return;
      e.preventDefault();
      if (b.dataset.pre) { $$('input[name=opt]', form).forEach((c) => { if (c.value === b.dataset.pre) c.checked = true; }); update(); }
      $('#aanvraag').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => {
        form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash');
        (b.dataset.pre ? date : $('input[name=opt]', form)).focus({ preventScroll: true });
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
      if (!f.getAll('opt').length) { error.textContent = 'Kies minstens één optie.'; $('input[name=opt]', form).focus(); return; }
      if (!f.get('date')) { error.textContent = 'Kies de datum van jullie event.'; date.focus(); return; }
      if (!f.get('guests')) { error.textContent = 'Vul het aantal gasten in.'; form.elements.guests.focus(); return; }
      if (!String(f.get('name') || '').trim()) { error.textContent = 'Vul jullie naam in.'; form.elements.name.focus(); return; }
      const ok = await copy(message());
      window.open(`https://ig.me/m/${form.dataset.ig}`, '_blank', 'noopener');
      say(ok ? 'Bericht gekopieerd. Plak het in de DM die nu opent.' : 'Instagram opent. Kopiëren lukte niet, typ jullie aanvraag in de DM.');
    });
  }
})();
