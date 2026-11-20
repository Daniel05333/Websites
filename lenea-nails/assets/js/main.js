// Lenéa nails — interactie. Geen bibliotheken: een WebGL-raymarcher voor de
// 3D-nagelwaaier, één scroll-handler, IntersectionObservers voor onthullingen.
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
      if (el.offsetParent !== null && el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); io.unobserve(el); return false; }
      return true;
    });
  };

  // ── hero: 3D-nagelwaaier (WebGL, raymarching) ─────────────────────────────
  const hero = $('[data-hero]');
  const canvas = $('[data-nails]');
  const swatches = $$('.hero__swatches li');
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

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform vec2 uShift; uniform float uTime; uniform float uFan; uniform float uFocus;
uniform vec2 uCam; uniform float uSpin; uniform float uIntro; uniform float uZoom;
const float L=.74, W=.2, B=.3, TH=.034, RR=.022, R=1.75;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float almond(vec2 q){
  if(q.y>0.){float r=(L*L+W*W)/(2.*W),c=r-W;return max(length(vec2(q.x+c,q.y))-r,length(vec2(q.x-c,q.y))-r);}
  return (length(vec2(q.x/W,q.y/B))-1.)*min(W,B);
}
float ang(float i){return (2.-i)*mix(.1,.34,uFan);}
vec3 local(vec3 p,float i){
  vec3 q=p-vec3(0.,-1.6,0.);
  q.xy=rot(ang(i))*q.xy;
  q.y-=R*mix(.92,1.,uIntro);
  q.z-=-abs(i-2.)*.14+.32*exp(-(i-uFocus)*(i-uFocus)*2.5)*uFan;
  q.xz=rot(uSpin+sin(uTime*.7+i*1.3)*.18+(i-2.)*.12)*q.xz;
  return q;
}
float nail(vec3 q){
  q.z+=.85*q.x*q.x+.07*q.y*q.y;
  float d2=almond(q.xy);
  vec2 w=vec2(d2+RR,abs(q.z)-TH);
  return length(max(w,0.))+min(max(w.x,w.y),0.)-RR;
}
vec2 map(vec3 p){
  vec2 res=vec2(9.,-1.);
  for(int k=0;k<5;k++){float i=float(k);float d=nail(local(p,i));if(d<res.x)res=vec2(d,i);}
  return res;
}
vec3 normal(vec3 p){vec2 e=vec2(.0012,-.0012);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 leopard(vec2 q,vec3 base){
  vec2 g=q*vec2(10.,9.)+vec2(.3,.7);vec2 id=floor(g),f=fract(g);float best=9.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(float(x),float(y));vec2 c=o+vec2(hash(id+o),hash(id+o+7.))*.8+.1;best=min(best,length(f-c)*(.8+.4*hash(id+o+3.)));}
  float ring=smoothstep(.33,.28,best)-smoothstep(.22,.17,best);
  float core=smoothstep(.22,.17,best);
  vec3 c=mix(base,vec3(.6,.42,.3),core*.85);
  return mix(c,vec3(.17,.1,.07),ring);
}
vec3 paint(float id,vec3 q){
  float d2=almond(q.xy);
  if(id<.5) return vec3(.95,.9,.88);
  if(id<1.5){vec3 b=vec3(.93,.78,.74);float tip=smoothstep(.0,.012,q.y-(.36+.55*q.x*q.x));return mix(b,vec3(.99,.98,.97),tip);}
  if(id<2.5) return vec3(.47,.04,.09);
  if(id<3.5){vec3 b=vec3(.4,.45,.26);return mix(b,vec3(.86,.86,.84),smoothstep(-.045,-.025,d2));}
  vec3 b=vec3(.43,.29,.23);return q.y>.18?leopard(q.xy,vec3(.94,.88,.84)):b;
}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.55,.48,.44),vec3(.98,.95,.92),smoothstep(-.5,.8,r.y));
  c+=vec3(1.)*smoothstep(.88,.97,dot(r,normalize(vec3(.5,.7,.6))))*1.6;
  c+=vec3(1.,.96,.92)*smoothstep(.9,.99,dot(r,normalize(vec3(-.6,.4,.5))))*1.1;
  c+=vec3(1.)*smoothstep(.97,.995,dot(r,normalize(vec3(.1,.95,.3))))*1.3;
  return c;
}
void main(){
  vec2 uv=((gl_FragCoord.xy-.5*uRes)/uRes.y-uShift)*uZoom;
  vec3 ro=vec3(0.,0.,4.3),rd=normalize(vec3(uv,-1.6));
  mat2 ry=rot(uCam.x),rx=rot(uCam.y);
  ro.yz*=rx;rd.yz*=rx;ro.xz*=ry;rd.xz*=ry;
  vec3 bc=vec3(0.,.05,0.);vec3 oc=ro-bc;float b=dot(oc,rd),cc=dot(oc,oc)-1.95*1.95,h=b*b-cc;
  if(h<0.){gl_FragColor=vec4(0.);return;}
  float t=max(-b-sqrt(h),0.),tmax=-b+sqrt(h);vec2 m=vec2(9.,-1.);bool hit=false;float dmin=9.;
  for(int i=0;i<110;i++){m=map(ro+rd*t);dmin=min(dmin,m.x);if(m.x<.0006*t){hit=true;break;}t+=m.x*.7;if(t>tmax)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t,n=normal(p),v=-rd;
  vec3 q=local(p,m.y);
  vec3 base=paint(m.y,q);
  vec3 L1=normalize(vec3(.5,.8,.6));
  float dif=clamp(dot(n,L1)*.55+.45,0.,1.);
  float fre=pow(1.-clamp(dot(n,v),0.,1.),4.);
  float sp=pow(clamp(dot(n,normalize(L1+v)),0.,1.),120.)*1.6;
  float sp2=pow(clamp(dot(n,normalize(normalize(vec3(-.6,.3,.7))+v)),0.,1.),60.)*.5;
  vec3 col=base*(.32+.78*dif);
  col+=base*vec3(1.,.85,.8)*.06;
  col=mix(col,env(reflect(rd,n)),.08+.6*fre);
  col+=vec3(sp+sp2);
  col=pow(col,vec3(.95));
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
      ['uRes', 'uShift', 'uTime', 'uFan', 'uFocus', 'uCam', 'uSpin', 'uIntro', 'uZoom'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    } catch (err) {
      gl = null;
      console.warn('WebGL niet beschikbaar, fallback getoond.', err);
    }
    if (!gl) root.classList.add('no-webgl');
  }

  if (hero) {
    const st = { fan: 0, focus: 0, yaw: 0, pitch: 0, spin: 0 };
    const t0 = performance.now();
    let visible = true, running = false;
    const size = () => {
      if (!gl) return;
      const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.25);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const frame = (now) => {
      running = false;
      const t = (now - t0) / 1000;
      const p = calm ? 0.5 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.4) * 0.3;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.33) * 0.2;
      st.fan = lerp(st.fan, calm ? 1 : 0.25 + smooth(0, 0.55, p) * 0.75, 0.07);
      st.focus = lerp(st.focus, clamp(p * 1.35, 0, 1) * 4, 0.08);
      st.yaw = lerp(st.yaw, px * 0.28, 0.06);
      st.pitch = lerp(st.pitch, -0.12 + py * 0.15, 0.06);
      st.spin = lerp(st.spin, px * 0.25 + (p - 0.5) * 0.5, 0.06);
      const active = Math.round(st.focus);
      swatches.forEach((li, i) => li.classList.toggle('on', i === active));
      if (gl) {
        size();
        const W = canvas.width, H = canvas.height, desktop = innerWidth >= 900;
        const shiftX = desktop ? (W * 0.68 - W / 2) / H : 0;
        const shiftY = desktop ? -0.02 : (H / 2 - H * 0.33) / H;
        gl.uniform2f(U.uRes, W, H);
        gl.uniform2f(U.uShift, shiftX, shiftY);
        gl.uniform1f(U.uZoom, desktop ? 1 : Math.max(1.2, (H / W) * 0.75));
        gl.uniform1f(U.uTime, calm ? 0 : t);
        gl.uniform1f(U.uFan, st.fan);
        gl.uniform1f(U.uFocus, st.focus);
        gl.uniform2f(U.uCam, st.yaw, st.pitch);
        gl.uniform1f(U.uSpin, st.spin);
        gl.uniform1f(U.uIntro, calm ? 1 : 1 - Math.pow(1 - clamp(t / 1.4, 0, 1), 3));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        canvas.classList.add('is-ready');
      }
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
  const bookSec = $('#afspraak');
  const parallax = $$('[data-parallax]');
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
      if (y > lastY + 2 && y > vh * 2.4 && !$('dialog[open]')) masthead.classList.add('is-hidden');
      if (y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    if (dock) {
      const near = (el) => el && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0;
      dock.classList.toggle('on', y > (hero ? hero.offsetHeight - vh * 0.4 : vh) && !near(bookSec) && !near(footer));
    }
    if (hero && !calm) {
      const p = clamp(y / Math.max(1, hero.offsetHeight - vh), 0, 1);
      const copy = $('.hero__copy', hero);
      const f = smooth(0.62, 0.97, p);
      copy.style.opacity = (1 - f).toFixed(3);
      copy.style.transform = `translate3d(0, ${(-f * 40).toFixed(1)}px, 0)`;
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

  // ── portfolio: filters en vergrootweergave ───────────────────────────────
  const grid = $('[data-grid]');
  if (grid) {
    const cards = $$('.card', grid);
    $$('[data-filter]').forEach((btn) => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', b === btn));
      cards.forEach((c) => c.classList.add('is-out'));
      setTimeout(() => {
        cards.forEach((c) => {
          const show = f === 'alle' || c.dataset.cat === f;
          c.hidden = !show;
          c.classList.add('in');
          if (show) requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('is-out')));
        });
      }, calm ? 0 : 280);
    }));

    const box = $('[data-lightbox]');
    const img = $('[data-lightbox-img]', box), cap = $('[data-lightbox-cap]', box);
    let list = [], idx = 0, opener = null;
    const show = (i) => {
      idx = (i + list.length) % list.length;
      const b = list[idx];
      img.src = b.dataset.zoom; img.alt = b.dataset.label; cap.textContent = b.dataset.label;
    };
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-zoom]');
      if (!b) return;
      opener = b;
      list = $$('.card:not([hidden]) [data-zoom]', grid);
      show(list.indexOf(b));
      box.showModal();
    });
    $('[data-lightbox-prev]', box).addEventListener('click', () => show(idx - 1));
    $('[data-lightbox-next]', box).addEventListener('click', () => show(idx + 1));
    $('[data-lightbox-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    box.addEventListener('close', () => opener?.focus());
  }

  // ── kantelkaarten, licht, magnetische knoppen ────────────────────────────
  if (fine && !calm) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${(x * 9).toFixed(2)}deg) rotateX(${(-y * 9).toFixed(2)}deg)`;
        el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
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

  // ── afspraak: aanvraag samenstellen → kopiëren → Instagram-DM ────────────
  const form = $('[data-book-form]');
  const toast = $('[data-toast]');
  const say = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 4200); };
  if (form) {
    const names = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const today = new Date();
    const opts = [{ v: 'Flexibel', l: 'Flexibel', s: 'elke dag' }];
    for (let i = 1; i <= 9; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      opts.push({ v: `${names[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`, l: i === 1 ? 'Morgen' : names[d.getDay()], s: `${d.getDate()} ${months[d.getMonth()]}` });
    }
    $('[data-days]', form).innerHTML = opts.map((o, i) => `<label><input type="radio" name="day" value="${o.v}"${i === 0 ? ' checked' : ''}><span>${o.l}<small>${o.s}</small></span></label>`).join('');
    const preview = $('[data-book-preview]', form), error = $('[data-book-error]', form);
    const message = () => {
      const f = new FormData(form);
      const tr = f.get('treatment'), name = String(f.get('name') || '').trim(), note = String(f.get('note') || '').trim();
      if (!tr) return '';
      const shape = f.get('shape');
      return [
        `Hoi Lenéa! Ik wil graag een afspraak maken voor ${tr}${shape && shape !== 'Weet ik nog niet' ? ` (${shape.toLowerCase()})` : ''}.`,
        `Voorkeur: ${f.get('day')}, ${String(f.get('part')).toLowerCase()}.`,
        note && `Inspiratie: ${note}`,
        name && `Groetjes, ${name}`,
      ].filter(Boolean).join('\n');
    };
    const update = () => { preview.textContent = message() || 'Kies een behandeling…'; error.textContent = ''; };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-book]');
      if (!b) return;
      e.preventDefault();
      const pre = b.dataset.pre;
      if (pre) { form.elements.treatment.value = pre; update(); }
      $('#afspraak').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => {
        form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash');
        (form.elements.treatment.value ? form.elements.name : form.elements.treatment).focus({ preventScroll: true });
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
      if (!f.get('treatment')) { error.textContent = 'Kies eerst een behandeling.'; form.elements.treatment.focus(); return; }
      if (!String(f.get('name') || '').trim()) { error.textContent = 'Vul je naam in.'; form.elements.name.focus(); return; }
      const ok = await copy(message());
      window.open('https://ig.me/m/leneanails', '_blank', 'noopener');
      say(ok ? 'Bericht gekopieerd. Plak het in de DM die nu opent.' : 'Instagram opent. Kopiëren lukte niet, typ je aanvraag in de DM.');
    });
  }
})();
