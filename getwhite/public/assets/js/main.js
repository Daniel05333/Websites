// GetWhite — interactie. Geen bibliotheken: een WebGL-raymarcher voor de 3D-tand,
// één scroll-handler, IntersectionObservers voor onthullingen.
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
  // vangnet: bij snel scrollen kan een element de viewport passeren zonder IO-melding
  const sweep = () => {
    if (!pending.length) return;
    const vh = innerHeight;
    pending = pending.filter((el) => {
      if (el.classList.contains('in')) return false;
      if (el.getBoundingClientRect().top < vh * 0.92) { el.classList.add('in'); io.unobserve(el); return false; }
      return true;
    });
  };

  // ── hero: 3D-tand (WebGL, raymarching van een signed distance field) ──────
  const hero = $('[data-hero]');
  const canvas = $('[data-tooth]');
  const stage = $('[data-stage]');
  const thumb = $('[data-shade-thumb]');
  const pointer = { x: 0, y: 0, active: false };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
    pointer.active = true;
  }, { passive: true });

  if (hero) (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => $('.hero__title')?.classList.add('in')));

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uRot; uniform float uWhite; uniform float uIntro;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
float rbox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float cone(vec3 p,vec3 a,vec3 b,float r1,float r2){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-mix(r1,r2,h);}
float map(vec3 p){
  p.y+=.14;
  vec3 c=p-vec3(0.,.38,0.);
  float crown=rbox(c,vec3(.5,.34,.43),.3);
  crown=smax(crown,-(length(vec2(p.x,p.y-.93))-.27),.16);
  crown=smax(crown,-(length(vec2(p.z,p.y-.97))-.25),.14);
  float r1=cone(p,vec3(-.22,.12,.02),vec3(-.34,-.98,.05),.25,.06);
  float r2=cone(p,vec3(.22,.12,-.02),vec3(.31,-1.02,-.06),.25,.06);
  return smin(crown,smin(r1,r2,.1),.22);
}
vec3 normal(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
float ao(vec3 p,vec3 n){float o=0.,s=1.;for(int i=1;i<=5;i++){float h=.03*float(i);o+=(h-map(p+n*h))*s;s*=.75;}return clamp(1.-2.2*o,0.,1.);}
vec3 env(vec3 r,float w){
  vec3 c=mix(vec3(.02,.035,.07),vec3(.22,.36,.62),smoothstep(-.4,.9,r.y));
  c+=vec3(1.,.98,.95)*smoothstep(.9,.985,dot(r,normalize(vec3(.45,.75,.5))))*2.2;
  c+=vec3(.45,.7,1.)*smoothstep(.86,.97,dot(r,normalize(vec3(-.8,.25,-.2))))*1.4*(.4+.6*w);
  c+=vec3(1.)*smoothstep(.95,.995,dot(r,normalize(vec3(-.2,.9,.35))))*1.2;
  return c;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 ro=vec3(0.,0.,4.4),rd=normalize(vec3(uv,-1.32));
  mat2 ry=rot(uRot.x),rx=rot(uRot.y);
  ro.yz*=rx;rd.yz*=rx;ro.xz*=ry;rd.xz*=ry;
  float w=uWhite;
  float b=dot(ro,rd),cc=dot(ro,ro)-1.6*1.6,hh=b*b-cc;
  float t=0.,dmin=9.;bool hit=false;
  if(hh>0.){
    t=max(-b-sqrt(hh),0.);float tmax=-b+sqrt(hh);
    for(int i=0;i<96;i++){
      float d=map(ro+rd*t);dmin=min(dmin,d);
      if(d<.0008*t){hit=true;break;}
      t+=d*.85;if(t>tmax)break;
    }
  }
  vec3 glowC=mix(vec3(.35,.55,1.),vec3(.75,.88,1.),w);
  float glow=exp(-max(dmin,0.)*7.)*(.18+.4*w)*uIntro;
  if(!hit){gl_FragColor=vec4(glowC*glow,glow);return;}
  vec3 p=ro+rd*t,n=normal(p),v=-rd;
  vec3 base=mix(vec3(.86,.72,.48),vec3(.96,.975,1.),smoothstep(0.,1.,w));
  base=mix(base,base*vec3(.93,.9,.86),smoothstep(.1,-.9,p.y)*(1.-.6*w));
  vec3 L1=normalize(vec3(.55,.75,.6)),L2=normalize(vec3(-.75,.15,-.55)),L3=normalize(vec3(.1,-1.,.4));
  float a=ao(p,n);
  float dif=clamp(dot(n,L1)*.55+.45,0.,1.);
  float rim=pow(clamp(dot(n,L2)*.5+.5,0.,1.),3.);
  float fre=pow(1.-clamp(dot(n,v),0.,1.),3.5);
  float thin=1.-clamp(-map(p-n*.22)/.22,0.,1.);
  vec3 h=normalize(L1+v);
  float sp=pow(clamp(dot(n,h),0.,1.),mix(40.,140.,w))*mix(.5,1.4,w);
  vec3 col=base*(dif*vec3(1.,.98,.95)*1.05+.18*vec3(.6,.75,1.))*mix(.55,1.,a);
  col+=base*vec3(1.,.85,.65)*thin*.22;
  col+=vec3(.35,.6,1.)*rim*(.55+.5*w);
  col+=vec3(.25,.4,.8)*clamp(dot(n,L3),0.,1.)*.15;
  col+=env(reflect(rd,n),w)*fre*mix(.35,.9,w)*a;
  col+=env(reflect(rd,n),w)*.06*w;
  col+=sp;
  col=1.-exp(-col*1.25);
  col=pow(col,vec3(.92));
  gl_FragColor=vec4(col,1.)*uIntro;
}`;

  let gl = null, prog = null, U = {};
  if (canvas) {
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' });
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      prog = gl.createProgram();
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
      ['uRes', 'uTime', 'uRot', 'uWhite', 'uIntro'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    } catch (err) {
      gl = null;
      console.warn('WebGL niet beschikbaar, fallback-tand getoond.', err);
    }
    if (!gl) root.classList.add('no-webgl');
  }

  const size = () => {
    if (!gl) return;
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.25);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  };

  if (hero) {
    const st = { yaw: -0.5, pitch: 0.18, white: 0, intro: 0 };
    let visible = true, running = false;
    const t0 = performance.now();
    const progress = () => clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
    const frame = (now) => {
      running = false;
      const t = (now - t0) / 1000;
      const p = calm ? 1 : progress();
      const targetW = smooth(0.04, 0.7, p);
      st.white = calm ? 1 : lerp(st.white, targetW, 0.08);
      st.intro = calm ? 1 : clamp(t / 1.4, 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.4) * 0.3;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.33) * 0.2;
      const targetYaw = -0.5 + t * (calm ? 0 : 0.22) + p * Math.PI * 1.6 + px * 0.45;
      st.yaw = lerp(st.yaw, targetYaw, 0.07);
      st.pitch = lerp(st.pitch, 0.18 + py * 0.22 - p * 0.15 + Math.sin(t * 0.7) * 0.04, 0.07);
      hero.style.setProperty('--w', st.white.toFixed(3));
      hero.style.setProperty('--p', p.toFixed(3));
      hero.classList.toggle('is-white', st.white > 0.9);
      if (gl) {
        size();
        const ease = 1 - Math.pow(1 - st.intro, 3);
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform1f(U.uTime, t);
        gl.uniform2f(U.uRot, st.yaw, st.pitch);
        gl.uniform1f(U.uWhite, st.white);
        gl.uniform1f(U.uIntro, ease);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!stage.classList.contains('is-ready')) stage.classList.add('is-ready');
      }
      if (!calm) loop();
    };
    const loop = () => { if (!running && visible) { running = true; requestAnimationFrame(frame); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(hero);
    addEventListener('resize', () => { size(); loop(); });
    loop();
  }

  // ── scroll: voortgang, kop, dock, parallax, woorden ─────────────────────
  const masthead = $('[data-masthead]');
  const bar = $('[data-progress]');
  const dock = $('[data-dock]');
  const cta = $('#afspraak');
  const footer = $('.footer');
  const parallax = $$('[data-parallax]');
  const copy = $('.hero__copy');
  const after = $('.hero__after');
  const statement = $('[data-words]');
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
      masthead.classList.toggle('is-hidden', y > lastY + 2 && y > vh * 2.6);
      if (y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    if (dock) {
      const near = (el) => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
      dock.classList.toggle('on', y > (hero ? hero.offsetHeight - vh * 0.4 : vh) && !near(cta) && !near(footer));
    }
    if (copy && hero && !calm) {
      const p = clamp(y / Math.max(1, hero.offsetHeight - vh), 0, 1);
      const f = smooth(0.45, 0.85, p);
      copy.style.opacity = (1 - f).toFixed(3);
      copy.style.transform = `translate3d(0, ${(-f * 60).toFixed(1)}px, 0)`;
      copy.style.visibility = f > 0.99 ? 'hidden' : '';
      after?.classList.toggle('on', p > 0.62);
    }
    if (!calm) for (const el of parallax) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
    }
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const prog = calm ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
      const n = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    sweep();
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // ── voor/na-vergelijkers ─────────────────────────────────────────────────
  $$('[data-compare]').forEach((fig) => {
    const media = $('.compare__media', fig);
    const range = $('.compare__range', fig);
    const set = (v) => media.style.setProperty('--pos', `${v}%`);
    range.addEventListener('input', () => { set(range.value); fig.dataset.touched = '1'; });
    // eenmalige hint wanneer de kaart in beeld komt
    if (!calm) new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const s = performance.now();
      const tick = (now) => {
        if (fig.dataset.touched) return;
        const k = clamp((now - s) / 1800, 0, 1);
        const v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k);
        set(v.toFixed(1)); range.value = v;
        if (k < 1) requestAnimationFrame(tick);
      };
      setTimeout(() => requestAnimationFrame(tick), 300);
    }, { threshold: 0.6 }).observe(fig);
  });
  const rail = $('[data-rail]');
  const step = () => ($('.compare', rail)?.offsetWidth ?? 400) + 20;
  $('[data-rail-prev]')?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: calm ? 'auto' : 'smooth' }));
  $('[data-rail-next]')?.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: calm ? 'auto' : 'smooth' }));

  // ── prijscalculator ──────────────────────────────────────────────────────
  const calc = $('[data-calc]');
  if (calc) {
    const P = JSON.parse(calc.dataset.prices);
    const out = $('[data-price]', calc), per = $('[data-per]', calc), sum = $('[data-summary]', calc);
    const mins = $('[data-minutes]', calc), hint = $('[data-hint]', calc), link = $('[data-wa-link]', calc);
    const ticket = $('.ticket', calc);
    let shown = 0, anim = 0;
    const hints = { [P.popular]: '★ Meest gekozen door onze klanten', [P.guarantee]: 'Geen resultaat? Geld terug.', [P.pack]: 'Voordeligste prijs per sessie, ideaal voor touch-ups.' };
    const count = (to) => {
      cancelAnimationFrame(anim);
      if (calm) { out.textContent = `€${to}`; shown = to; return; }
      const from = shown, s = performance.now();
      const tick = (now) => {
        const k = clamp((now - s) / 600, 0, 1), e = 1 - Math.pow(1 - k, 3);
        out.textContent = `€${Math.round(from + (to - from) * e)}`;
        if (k < 1) anim = requestAnimationFrame(tick); else shown = to;
      };
      anim = requestAnimationFrame(tick);
      out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump');
    };
    const update = () => {
      const f = new FormData(calc);
      const mode = f.get('mode'), line = f.get('line'), n = Number(f.get('sessions')), polish = f.has('polish');
      const L = P.lines[line];
      const total = L[mode][n] + (polish ? P.polish : 0);
      const people = mode === 'duo' ? 2 : 1;
      const perSession = L[mode][n] / n / people;
      const fmt = (v) => `€${Number.isInteger(v) ? v : v.toFixed(2).replace('.', ',')}`;
      count(total);
      per.textContent = `${fmt(perSession)} per sessie${people > 1 ? ' per persoon' : ''}${mode === 'duo' ? ' · totaal voor 2 personen' : ''}`;
      sum.textContent = `${L.name} · ${n} sessies${mode === 'duo' ? ' · duo' : ''}${polish ? ' · polijsten' : ''}`;
      mins.textContent = `${n} × 20 minuten`;
      hint.textContent = hints[n] ?? '';
      const msg = `Hoi GetWhite! Ik wil graag een afspraak maken voor ${L.name}, ${n} sessies${mode === 'duo' ? ' (duo, met z’n tweeën)' : ''}${polish ? ' met polijsten' : ''}. Totaal €${total}. Wanneer is er plek?`;
      link.href = `https://wa.me/${calc.dataset.wa}?text=${encodeURIComponent(msg)}`;
    };
    calc.addEventListener('change', update);
    update();
    if (fine) ticket.addEventListener('pointermove', (e) => {
      const r = ticket.getBoundingClientRect();
      ticket.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      ticket.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
    });
  }

  // ── kantelkaarten, licht op kaarten, magnetische knoppen ─────────────────
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg) translateZ(0)`;
        el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ── FAQ: één tegelijk open ───────────────────────────────────────────────
  $$('.qa').forEach((d) => d.addEventListener('toggle', () => { if (d.open) $$('.qa').forEach((o) => o !== d && (o.open = false)); }));
})();
