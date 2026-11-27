// Glowgarden: alle interactie, zonder bibliotheken.
// WebGL-raymarcher voor het alexandrietkristal (groen → rood tijdens het scrollen),
// prijslijst vrouw/man met 3D-omslag, voor/na-schuifregelaars, chat-reviews
// en de afspraakplanner die een compleet WhatsApp-bericht maakt.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const DATA = JSON.parse($('#gg-data')?.textContent || '{}');

  // ── onthullen ────────────────────────────────────────────────────────────
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('.reveal').forEach((el) => io.observe(el));
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => { $('.hero__title')?.classList.add('in'); $('.hero__copy')?.classList.add('in'); }));

  // ── alexandrietkristal ──────────────────────────────────────────────────
  const hero = $('[data-hero]');
  const canvas = $('[data-gem]');
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform vec2 uShift; uniform float uZoom; uniform vec2 uCam; uniform float uSpin; uniform vec3 uColor; uniform float uIntro;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float gem(vec3 p){
  p.xz=rot(uSpin)*p.xz; p.yz=rot(.22)*p.yz;
  float d=p.y-.42;
  for(int i=0;i<8;i++){
    float a=float(i)*.785398;
    d=max(d,dot(p,vec3(cos(a),0.,sin(a)))-.78);
    float b=a+.3927;
    d=max(d,dot(p,normalize(vec3(cos(b),1.35,sin(b))))-.72);
    d=max(d,dot(p,normalize(vec3(cos(a),-.82,sin(a))))-.62);
  }
  return d;
}
vec3 nrm(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*gem(p+e.xyy)+e.yyx*gem(p+e.yyx)+e.yxy*gem(p+e.yxy)+e.xxx*gem(p+e.xxx));}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.12,.08,.06),vec3(.95,.86,.72),smoothstep(-.4,.9,r.y));
  c+=vec3(1.,.93,.8)*smoothstep(.93,.99,dot(r,normalize(vec3(.6,.7,.5))))*2.2;
  c+=vec3(1.,.85,.6)*smoothstep(.9,.98,dot(r,normalize(vec3(-.8,.3,.4))))*1.4;
  return c;
}
void main(){
  vec2 uv=((gl_FragCoord.xy-.5*uRes)/uRes.y-uShift)*uZoom;
  vec3 ro=vec3(0.,0.,4.2),rd=normalize(vec3(uv,-2.));
  mat2 ry=rot(uCam.x),rx=rot(uCam.y);
  ro.yz*=rx;rd.yz*=rx;ro.xz*=ry;rd.xz*=ry;
  float t=2.;bool hit=false;
  for(int i=0;i<90;i++){float d=gem(ro+rd*t);if(d<.0008){hit=true;break;}t+=d*.9;if(t>7.)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t,n=nrm(p),v=-rd;
  float fre=.04+.96*pow(1.-clamp(dot(n,v),0.,1.),5.);
  vec3 rf=refract(rd,n,1./1.75);
  vec3 q=rf; q.xz=rot(uSpin*1.7)*q.xz;
  float fire=pow(abs(sin(q.x*9.)*sin(q.y*7.+1.)*sin(q.z*8.+2.)),3.);
  vec3 body=uColor*(.25+1.1*smoothstep(-.6,.9,rf.y))+uColor*fire*1.6+vec3(1.,.95,.85)*pow(fire,4.)*2.;
  vec3 refl=env(reflect(rd,n));
  vec3 col=mix(body,refl,fre*.85+.08);
  col+=vec3(1.)*pow(clamp(dot(reflect(rd,n),normalize(vec3(.6,.7,.5))),0.,1.),60.)*1.5;
  col=col/(1.+col*.35);
  gl_FragColor=vec4(pow(col,vec3(.92)),1.)*uIntro;
}`;
  let gl = null; const U = {};
  if (canvas) {
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
      if (!gl) throw new Error('geen webgl');
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uShift', 'uZoom', 'uCam', 'uSpin', 'uColor', 'uIntro'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    } catch (err) { gl = null; root.classList.add('no-webgl'); }
  }
  const GREEN = [0.2, 0.62, 0.44], VIOLET = [0.42, 0.3, 0.62], RED = [0.66, 0.13, 0.3];
  const pointer = { x: 0, y: 0, on: false };
  if (fine) addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; pointer.on = true; });
  const st = { yaw: 0, pitch: 0.15, spin: 0.4, last: 0 };
  let heroOn = true; const t0 = performance.now();
  if (hero) new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; if (heroOn) kick(); }).observe(hero);
  const heroP = () => (hero ? clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight)) : 0);
  let raf = 0;
  const frame = (now) => {
    raf = 0;
    const t = (now - t0) / 1000, p = calm ? 0.15 : heroP();
    const k = ss(0.15, 0.85, p), col = k < 0.5 ? GREEN.map((g, i) => lerp(g, VIOLET[i], k * 2)) : VIOLET.map((g, i) => lerp(g, RED[i], k * 2 - 1));
    hero?.style.setProperty('--glow', col.map((c) => Math.round(c * 255)).join(' '));
    $('[data-gemdot]')?.style.setProperty('--glow', col.map((c) => Math.round(c * 255)).join(' '));
    const beam = $('[data-beam]');
    if (beam) { beam.style.setProperty('--bo', calm ? 0 : (ss(0.12, 0.3, p) * (1 - ss(0.7, 0.9, p)) * (0.75 + 0.25 * Math.sin(t * 7))).toFixed(3)); }
    if (gl) {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      const desk = innerWidth >= 900;
      st.yaw = lerp(st.yaw, (pointer.on ? pointer.x : Math.sin(t * 0.35) * 0.3) * 0.6, 0.05);
      st.pitch = lerp(st.pitch, 0.18 + (pointer.on ? pointer.y : 0) * 0.3, 0.05);
      st.spin = calm ? 0.5 : st.spin + 0.006 + (p - st.last) * 9; st.last = p;
      gl.uniform2f(U.uRes, w, h);
      gl.uniform2f(U.uShift, desk ? (w * 0.72 - w / 2) / h : 0, desk ? 0.02 : (h / 2 - h * 0.3) / h);
      gl.uniform1f(U.uZoom, desk ? 1.45 - k * 0.15 : Math.max(2.2, (h / w) * 1.1));
      gl.uniform2f(U.uCam, st.yaw, st.pitch);
      gl.uniform1f(U.uSpin, st.spin);
      gl.uniform3f(U.uColor, ...col);
      gl.uniform1f(U.uIntro, calm ? 1 : 1 - (1 - clamp(t / 1.4)) ** 3);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add('is-ready');
    }
    if (heroOn && !calm) kick();
  };
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  kick();

  // ── scroll: nav, voortgang, dock, telefoon ─────────────────────────────
  const nav = $('[data-nav]'), bar = $('[data-progress]'), dock = $('[data-dock]'), book = $('#afspraak');
  const phone = $('[data-phone]');
  const onScroll = () => {
    const y = scrollY, H = innerHeight;
    nav?.classList.toggle('is-scrolled', y > 40);
    bar?.style.setProperty('--p', (y / Math.max(1, document.documentElement.scrollHeight - H)).toFixed(4));
    if (dock && hero) { const r = book.getBoundingClientRect(); dock.classList.toggle('show', y > hero.offsetHeight - H * 0.6 && !(r.top < H && r.bottom > 0)); }
    if (phone && !calm) { const r = phone.getBoundingClientRect(); const v = clamp((H - r.top) / (H + r.height)); phone.style.setProperty('--ry', `${lerp(-22, 8, v).toFixed(1)}deg`); phone.style.setProperty('--rx', `${lerp(10, -4, v).toFixed(1)}deg`); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // chat-reviews verschijnen één voor één
  const chat = $('[data-chat]');
  if (chat) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    $$('.bubble', chat).forEach((b, i) => setTimeout(() => b.classList.add('in'), calm ? 0 : 250 + i * 550));
  }, { threshold: 0.3 }).observe(chat);

  // tilt
  if (fine && !calm) $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `perspective(1000px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 7}deg) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -7}deg)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  if (fine && !calm) $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`; });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });

  // ── prijslijst vrouw / man ──────────────────────────────────────────────
  const who = $('.who'), flip = $('[data-flip]'), whoBtns = $$('[data-who]', who || document.createElement('div'));
  const setWho = (b, focus) => {
    const man = b.dataset.who === 'man';
    whoBtns.forEach((x) => { const on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
    who.classList.toggle('is-man', man); flip.classList.toggle('is-man', man);
    $('#p-vrouw').inert = man; $('#p-man').inert = !man;
    if (focus) b.focus();
  };
  whoBtns.forEach((b, i) => {
    b.addEventListener('click', () => setWho(b));
    b.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setWho(whoBtns[1 - i], true); } });
  });
  if (flip) $('#p-man').inert = true;

  // ── voor/na ─────────────────────────────────────────────────────────────
  $$('[data-ba]').forEach((f) => {
    const r = $('.ba__range', f);
    r.addEventListener('input', () => f.style.setProperty('--x', `${r.value}%`));
  });
  // kleine hint: de eerste schuift even heen en weer
  const firstBa = $('[data-ba]');
  if (firstBa && !calm) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    const s = performance.now();
    const step = (t) => { const q = (t - s) / 1600; if (q > 1) { firstBa.style.setProperty('--x', '50%'); return; } firstBa.style.setProperty('--x', `${50 + Math.sin(q * Math.PI * 2) * 22}%`); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, { threshold: 0.6 }).observe(firstBa);
  $$('[data-rf]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-rf]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    $$('.ba[data-who]').forEach((li) => { li.hidden = b.dataset.rf !== 'alle' && li.dataset.who !== b.dataset.rf; });
  }));

  // winactie: dagen tot eind december
  const days = $('[data-days]');
  if (days) {
    const now = new Date(), end = new Date(now.getFullYear(), 11, 31);
    const n = Math.ceil((end - now) / 864e5);
    if (n >= 0 && n < 120) days.textContent = n === 0 ? 'Vandaag wordt de winnaar bekend!' : `Nog ${n} ${n === 1 ? 'dag' : 'dagen'} tot de winnaar bekend wordt`;
  }

  // ── afspraakplanner ─────────────────────────────────────────────────────
  const form = $('[data-form]');
  if (!form) return;
  const chosen = new Map();
  const toast = $('[data-toast]');
  const say = (m) => { toast.textContent = m; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 2600); };
  const quick = $('[data-quick]');
  const groups = {};
  (DATA.zones || []).forEach(([n, p, g]) => { (groups[g] ||= []).push([n, p]); });
  quick.insertAdjacentHTML('beforeend', Object.entries(groups).map(([g, list]) => `<optgroup label="${g}">${list.map(([n, p]) => `<option value="${n}" data-price="${p}">${n} · €${p}</option>`).join('')}</optgroup>`).join(''));
  const fmt = (n) => `€${n}`;
  const msg = () => {
    const f = new FormData(form);
    const treats = f.getAll('treat').map((v) => ({ laser: 'Laserontharing', hydra: 'Hydrafacial', intake: 'Intake (huid- en haaranalyse)' })[v]);
    const total = [...chosen.values()].reduce((a, b) => a + b, 0);
    return [
      'Hoi Glowgarden! Ik wil graag een afspraak maken.',
      `• Voor: ${f.get('who')}`,
      `• Behandeling: ${treats.join(', ') || '-'}`,
      chosen.size ? `• Zones/acties: ${[...chosen].map(([n, p]) => `${n} (${fmt(p)})`).join(', ')}` : '',
      chosen.size ? `• Indicatie: ${fmt(total)}` : '',
      `• Voorkeur: ${f.getAll('days').join(', ') || 'elke dag'} · ${f.get('part')}`,
      `• ${f.get('first')}`,
      `Naam: ${f.get('name') || '-'}`,
      f.get('rules') ? 'Ik heb de huisregels gelezen.' : '',
    ].filter(Boolean).join('\n');
  };
  const render = () => {
    const box = $('[data-zones]', form);
    box.innerHTML = chosen.size ? [...chosen].map(([n, p]) => `<span class="zone">${n} · ${fmt(p)}<button type="button" data-rm="${n.replace(/"/g, '&quot;')}" aria-label="Verwijder ${n}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></span>`).join('') : '<p class="zones__empty">Nog niets gekozen. Tik bij <a href="#prijzen">de prijzen</a> of <a href="#acties">acties</a> op +, of kies hier:</p>';
    $$('[data-add]').forEach((b) => b.setAttribute('aria-pressed', chosen.has(b.dataset.add)));
    const list = $('[data-sum-list]');
    const f = new FormData(form);
    const treats = f.getAll('treat').map((v) => ({ laser: 'Laserontharing', hydra: 'Hydrafacial · prijs op aanvraag', intake: 'Intake' })[v]);
    list.innerHTML = [...treats.filter((t) => t !== 'Laserontharing' || !chosen.size).map((t) => `<li><span>${t}</span></li>`), ...[...chosen].map(([n, p]) => `<li><span>${n}</span><b>${fmt(p)}</b></li>`)].join('') || '<li class="is-empty">Kies een behandeling</li>';
    $('[data-sum-total]').textContent = fmt([...chosen.values()].reduce((a, b) => a + b, 0));
    $('[data-preview]', form).textContent = msg();
  };
  const toggle = (name, price, force) => {
    const on = force ?? !chosen.has(name);
    if (on) chosen.set(name, Number(price)); else chosen.delete(name);
    if (on) { $('input[name=treat][value=laser]', form).checked = true; if (/\(man\)/.test(name)) $('input[name=who][value=Man]', form).checked = true; }
    render();
    if (on) say(`${name} toegevoegd aan je afspraak`);
  };
  $$('[data-add]').forEach((b) => b.addEventListener('click', () => toggle(b.dataset.add, b.dataset.price)));
  $$('[data-add-deal]').forEach((a) => a.addEventListener('click', () => { toggle(a.dataset.addDeal, a.dataset.price, true); flash(); }));
  $$('[data-pick-treat]').forEach((a) => a.addEventListener('click', () => { $(`input[name=treat][value=${a.dataset.pickTreat}]`, form).checked = true; render(); flash(); }));
  quick.addEventListener('change', () => { const o = quick.selectedOptions[0]; if (o?.value) toggle(o.value, o.dataset.price, true); quick.value = ''; });
  form.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { chosen.delete(b.dataset.rm); render(); } });
  form.addEventListener('input', (e) => { e.target.removeAttribute?.('aria-invalid'); render(); });
  form.addEventListener('change', render);
  function flash() { form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash'); }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('[data-error]', form), probs = [];
    if (!form.querySelectorAll('input[name=treat]:checked').length) probs.push('kies een behandeling');
    if (!form.elements.name.value.trim()) { form.elements.name.setAttribute('aria-invalid', 'true'); probs.push('vul je naam in'); }
    if (!form.elements.rules.checked) { form.elements.rules.setAttribute('aria-invalid', 'true'); probs.push('bevestig dat je de huisregels hebt gelezen'); }
    if (probs.length) { err.textContent = `Nog even: ${probs.join(', ')}.`; return; }
    err.textContent = '';
    open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(msg())}`, '_blank', 'noopener');
    say('WhatsApp opent met je afspraakverzoek');
  });
  render();
})();
