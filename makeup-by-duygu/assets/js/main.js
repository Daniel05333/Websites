// Makeup by Duygu — interactie. Geen bibliotheken: een WebGL-raymarcher voor de
// 3D-lipstick, één scroll-handler, IntersectionObservers voor onthullingen.
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

  // ── hero: 3D-lipstick (WebGL, raymarching) ───────────────────────────────
  const hero = $('[data-hero]');
  const canvas = $('[data-lipstick]');
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
uniform vec2 uRes; uniform vec2 uShift; uniform float uZoom; uniform vec2 uCam; uniform float uIntro;
uniform float uExt; uniform float uSpin; uniform vec3 uColor; uniform vec3 uCap; uniform float uCapRot;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float cyl(vec3 p,float r,float y0,float y1){vec2 d=vec2(length(p.xz)-r,abs(p.y-(y0+y1)*.5)-(y1-y0)*.5);return min(max(d.x,d.y),0.)+length(max(d,0.));}
vec2 map(vec3 p){
  vec3 q=p; q.xz=rot(uSpin)*q.xz; q.xy=rot(-.18)*q.xy;
  float base=cyl(q,.3,-1.15,-.22)-.015;
  float ring=cyl(q,.315,-.26,-.2)-.006;
  float sleeve=cyl(q,.25,-.24,-.22+.32*uExt)-.004;
  float top=-.2+.95*uExt;
  float bullet=cyl(q,.205,-.2,top+.2)-.01;
  bullet=max(bullet,dot(q-vec3(0.,top,0.),normalize(vec3(.75,1.,0.))));
  vec2 r=vec2(min(base,sleeve),0.);
  if(ring<r.x) r=vec2(ring,2.);
  if(bullet<r.x) r=vec2(bullet,1.);
  vec3 c=p-uCap; c.xy=rot(uCapRot)*c.xy; c.xz=rot(uSpin*.6)*c.xz;
  float cap=cyl(c,.31,-.42,.42)-.02;
  cap=max(cap,-cyl(c,.27,-.6,.3));
  if(cap<r.x) r=vec2(cap,0.);
  return r;
}
vec3 normal(vec3 p){vec2 e=vec2(.0012,-.0012);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.42,.34,.3),vec3(1.,.97,.93),smoothstep(-.6,.7,r.y));
  c+=vec3(1.)*smoothstep(.9,.98,dot(r,normalize(vec3(.5,.8,.6))))*1.6;
  c+=vec3(1.,.9,.85)*smoothstep(.86,.97,dot(r,normalize(vec3(-.7,.2,.6))))*1.2;
  c*=.85+.15*sin(r.y*14.);
  return c;
}
void main(){
  vec2 uv=((gl_FragCoord.xy-.5*uRes)/uRes.y-uShift)*uZoom;
  vec3 ro=vec3(0.,0.,5.),rd=normalize(vec3(uv,-1.9));
  mat2 ry=rot(uCam.x),rx=rot(uCam.y);
  ro.yz*=rx;rd.yz*=rx;ro.xz*=ry;rd.xz*=ry;
  float t=2.5;vec2 m;bool hit=false;
  for(int i=0;i<110;i++){m=map(ro+rd*t);if(m.x<.0008*t){hit=true;break;}t+=m.x*.9;if(t>9.)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t,n=normal(p),v=-rd;
  vec3 L=normalize(vec3(.5,.8,.6));
  float ndv=clamp(dot(n,v),0.,1.);
  float dif=clamp(dot(n,L)*.5+.5,0.,1.);
  float fre=pow(1.-ndv,3.);
  vec3 col;
  if(m.y>.5&&m.y<1.5){
    float sp=pow(clamp(dot(n,normalize(L+v)),0.,1.),40.)*.45;
    col=uColor*(.35+.75*dif)+vec3(sp)+env(reflect(rd,n))*fre*.18;
  }else{
    vec3 gold=m.y>1.5?vec3(.95,.8,.55):vec3(.86,.68,.42);
    vec3 e=env(reflect(rd,n));
    float sp=pow(clamp(dot(n,normalize(L+v)),0.,1.),90.)*1.4;
    col=gold*e*(.55+.35*dif)+gold*fre*.4+vec3(sp)*gold;
  }
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
      ['uRes', 'uShift', 'uZoom', 'uCam', 'uIntro', 'uExt', 'uSpin', 'uColor', 'uCap', 'uCapRot'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    } catch (err) {
      gl = null;
      console.warn('WebGL niet beschikbaar, fallback getoond.', err);
    }
    if (!gl) root.classList.add('no-webgl');
  }

  if (hero) {
    // tinten: nude, rosé, berry, red (Eid look), mocha
    const SHADES = [[0.74, 0.5, 0.43], [0.8, 0.45, 0.5], [0.52, 0.15, 0.24], [0.74, 0.07, 0.11], [0.5, 0.3, 0.25]];
    const st = { ext: 0, yaw: 0, pitch: 0, spin: 0, col: [...SHADES[0]] };
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
      const p = calm ? 0.3 : clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
      const px = pointer.active ? pointer.x : Math.sin(t * 0.4) * 0.3;
      const py = pointer.active ? pointer.y : Math.cos(t * 0.33) * 0.2;
      const intro = calm ? 1 : 1 - Math.pow(1 - clamp(t / 1.6, 0, 1), 3);
      st.ext = lerp(st.ext, calm ? 1 : intro * (0.35 + smooth(0, 0.35, p) * 0.65), 0.08);
      st.yaw = lerp(st.yaw, px * 0.3, 0.06);
      st.pitch = lerp(st.pitch, 0.12 + py * 0.15, 0.06);
      st.spin = calm ? 0.6 : st.spin + 0.004 + (p - (st.lastP ?? p)) * 6;
      st.lastP = p;
      const f = clamp(p * 1.25, 0, 1) * (SHADES.length - 1);
      const a = Math.floor(f), b = Math.min(a + 1, SHADES.length - 1), k = smooth(0.25, 0.75, f - a);
      const target = SHADES[a].map((v, i) => lerp(v, SHADES[b][i], k));
      st.col = st.col.map((v, i) => lerp(v, target[i], 0.12));
      swatches.forEach((li, i) => li.classList.toggle('on', i === Math.round(f)));
      if (gl) {
        size();
        const W = canvas.width, H = canvas.height, desktop = innerWidth >= 900;
        gl.uniform2f(U.uRes, W, H);
        gl.uniform2f(U.uShift, desktop ? (W * 0.68 - W / 2) / H : 0, desktop ? -0.06 : (H / 2 - H * 0.28) / H);
        gl.uniform1f(U.uZoom, desktop ? 1.3 : Math.max(1.9, (H / W) * 0.95));
        gl.uniform2f(U.uCam, st.yaw, st.pitch);
        gl.uniform1f(U.uIntro, Math.min(1, intro * 1.4));
        gl.uniform1f(U.uExt, st.ext);
        gl.uniform1f(U.uSpin, st.spin);
        gl.uniform3f(U.uColor, ...st.col);
        const drift = smooth(0, 1, p);
        gl.uniform3f(U.uCap, 0.95 + drift * 0.15, -0.35 - drift * 0.4 + Math.sin(t * 0.9) * 0.04, -0.4);
        gl.uniform1f(U.uCapRot, -0.5 - drift * 0.6);
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
    const date = form.elements.date;
    const d0 = new Date(Date.now() + 864e5);
    date.min = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}-${String(d0.getDate()).padStart(2, '0')}`;
    const nice = (v) => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
    const preview = $('[data-book-preview]', form), error = $('[data-book-error]', form);
    const message = () => {
      const f = new FormData(form);
      const g = (k) => String(f.get(k) || '').trim();
      if (!g('treatment')) return '';
      const where = g('where') === 'Op locatie' ? `op locatie${g('place') ? ` in ${g('place')}` : ''}` : 'in de studio';
      return [
        `Hoi Duygu! Ik wil graag een aanvraag doen voor ${g('treatment').toLowerCase()}, ${where}.`,
        g('date') && `Datum: ${nice(g('date'))}${g('time') ? `, klaar om ${g('time')}` : ''}`,
        g('persons') && Number(g('persons')) > 1 && `Aantal personen: ${g('persons')}`,
        g('note') && `Wensen: ${g('note')}`,
        'Is deze datum nog vrij?',
        g('name') && `Groetjes, ${g('name')}`,
      ].filter(Boolean).join('\n');
    };
    form.addEventListener('change', (e) => { if (e.target.name === 'where') form.querySelector('[data-place]').hidden = e.target.value !== 'Op locatie'; });
    const update = () => { preview.textContent = message() || 'Kies een gelegenheid…'; error.textContent = ''; };
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
        (form.elements.treatment.value ? date : form.elements.treatment).focus({ preventScroll: true });
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
      if (!f.get('treatment')) { error.textContent = 'Kies eerst een gelegenheid.'; form.elements.treatment.focus(); return; }
      if (!f.get('date')) { error.textContent = 'Kies de datum.'; date.focus(); return; }
      if (f.get('where') === 'Op locatie' && !String(f.get('place') || '').trim()) { error.textContent = 'Vul de plaats in waar je klaargemaakt wilt worden.'; form.elements.place.focus(); return; }
      if (!String(f.get('name') || '').trim()) { error.textContent = 'Vul je naam in.'; form.elements.name.focus(); return; }
      const ok = await copy(message());
      window.open('https://ig.me/m/makeupby.duygu', '_blank', 'noopener');
      say(ok ? 'Bericht gekopieerd. Plak het in de DM die nu opent.' : 'Instagram opent. Kopiëren lukte niet, typ je aanvraag in de DM.');
    });
  }
})();
