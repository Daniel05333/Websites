// Drie canvaslagen: contourlijnen (marching squares over een veld van vier sinussen), de pixel-dissolve
// tussen lichte en donkere secties, en de route-kaart. Alles pauzeert buiten beeld; zonder beweging
// wordt elk canvas één keer statisch getekend.
import { $$, clamp, lerp, hash, fitCanvas, ticker, watchVisible, reduced } from './core.js';
import { ROUTE_POINTS, STAGE_AT, HUB } from '../data/route.mjs';

/* ------------------------------------------------------------------ */
/* Contourvelden                                                        */
/* ------------------------------------------------------------------ */

const LINE_SCALE = 3.8;
const LINE_COUNT = 2.5;
const WAVE_AMOUNT = 0.37;
const WAVE_SPEED = 1.66;
const CELLS = 96;

const CONTOUR_STYLE = {
  hero: { stroke: 'rgba(4, 120, 87, 0.16)', width: 1 },
  light: { stroke: 'rgba(15, 23, 42, 0.075)', width: 1 },
  footer: { stroke: 'rgba(18, 185, 129, 0.2)', width: 1 },
};

const field = (x, y, t, px, py) => {
  const s = LINE_SCALE;
  const w = WAVE_AMOUNT;
  let v =
    Math.sin(x * s * 0.9 + t * 0.21) +
    Math.sin(y * s * 1.1 - t * 0.17 + Math.sin(x * 2.1 + t * 0.1) * w * 2) +
    Math.sin((x + y) * s * 0.55 + t * 0.13) * 0.8 +
    Math.sin(Math.hypot(x - 0.62, y - 0.4) * s * 2.2 - t * 0.27) * w * 1.6;
  // Zachte heuvel onder de cursor (alleen de hero).
  if (px !== null) v += 1.4 * Math.exp(-((x - px) ** 2 + (y - py) ** 2) * 28);
  return v;
};

// Interpolatie van het kruispunt op een rand.
const cross = (a, b) => (Math.abs(b - a) < 1e-6 ? 0.5 : a / (a - b));

const drawContours = (ctx, w, h, t, ptr) => {
  const cols = CELLS;
  const cell = w / cols;
  const rows = Math.ceil(h / cell) + 1;
  const aspect = h / w;
  const grid = new Float32Array((cols + 1) * (rows + 1));
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) grid[j * (cols + 1) + i] = field(i / cols, (j / cols), t, ptr ? ptr.x : null, ptr ? ptr.y * aspect : null);
  ctx.beginPath();
  for (let lv = -3.2; lv <= 3.2; lv += 1 / LINE_COUNT) {
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * (cols + 1) + i;
        const a = grid[k] - lv, b = grid[k + 1] - lv, c = grid[k + cols + 2] - lv, d = grid[k + cols + 1] - lv;
        const code = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
        if (code === 0 || code === 15) continue;
        const x = i * cell, y = j * cell;
        const T = [x + cross(a, b) * cell, y];
        const R = [x + cell, y + cross(b, c) * cell];
        const B = [x + cross(d, c) * cell, y + cell];
        const L = [x, y + cross(a, d) * cell];
        const seg = (p, q) => {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
        };
        switch (code) {
          case 1: case 14: seg(L, B); break;
          case 2: case 13: seg(B, R); break;
          case 3: case 12: seg(L, R); break;
          case 4: case 11: seg(T, R); break;
          case 6: case 9: seg(T, B); break;
          case 7: case 8: seg(L, T); break;
          case 5: seg(L, T); seg(B, R); break;
          case 10: seg(T, R); seg(L, B); break;
        }
      }
  }
  ctx.stroke();
};

const initContour = (canvas) => {
  const style = CONTOUR_STYLE[canvas.dataset.contour] || CONTOUR_STYLE.light;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const host = canvas.parentElement;
  const interactive = canvas.dataset.contour === 'hero' && !reduced;
  let w = 0, h = 0, visible = false, acc = 1, t = Math.random() * 40;
  const ptr = { x: 0.7, y: 0.4, tx: 0.7, ty: 0.4, on: false };

  const draw = () => {
    const k = fitCanvas(canvas, w, h, 1.5);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.width;
    drawContours(ctx, w, h, t, interactive && ptr.on ? ptr : null);
  };
  const resize = () => {
    w = host.clientWidth;
    h = host.clientHeight;
    draw();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  if (reduced) return () => ro.disconnect();

  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    ptr.tx = (e.clientX - r.left) / r.width;
    ptr.ty = (e.clientY - r.top) / r.height;
    ptr.on = true;
  };
  if (interactive) host.addEventListener('pointermove', onMove, { passive: true });
  const stopVis = watchVisible(canvas, (v) => (visible = v));
  // ~30 fps is genoeg voor langzame lijnen en spaart de CPU.
  const off = ticker.add((now, dt) => {
    if (!visible || document.hidden) return;
    t += dt * WAVE_SPEED * 0.35;
    ptr.x = lerp(ptr.x, ptr.tx, Math.min(1, dt * 4));
    ptr.y = lerp(ptr.y, ptr.ty, Math.min(1, dt * 4));
    acc += dt;
    if (acc < 1 / 30) return;
    acc = 0;
    draw();
  });
  return () => {
    off();
    stopVis();
    ro.disconnect();
    host.removeEventListener('pointermove', onMove);
  };
};

/* ------------------------------------------------------------------ */
/* Pixel-dissolve                                                       */
/* ------------------------------------------------------------------ */

const CELL = 24;
const SOLID_UNTIL = 0.16;
const LIFT = 2;
const ACCENT_SHARE = 0.06;
const DISSOLVE_COLOR = { light: '#f7faf9', dark: '#07100c' };

const initDissolve = (canvas) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const section = canvas.closest('section');
  const color = DISSOLVE_COLOR[canvas.dataset.dissolve] || DISSOLVE_COLOR.light;
  let w = 0, h = 0, lastQ = -1;

  const draw = (p) => {
    const k = fitCanvas(canvas, w, h, 1.5);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    // Volledig opgelost als de naad ~35% van het scherm is gepasseerd.
    const lift = clamp(p * LIFT * 1.45, 0, 1);
    for (let j = 0; j < rows; j++) {
      const v = (j + 0.5) / rows;
      const edge = Math.pow(clamp((v - SOLID_UNTIL) / (1 - SOLID_UNTIL)), 0.55) * 0.96;
      for (let i = 0; i < cols; i++) {
        const n = hash(i, j);
        if (n <= edge + lift * (1 - edge)) continue;
        ctx.fillStyle = hash(i + 911, j + 37) < ACCENT_SHARE ? '#12b981' : color;
        ctx.fillRect(i * CELL, j * CELL, CELL + 0.5, CELL + 0.5);
      }
    }
  };
  const progress = () => {
    const r = section.getBoundingClientRect();
    return reduced ? 0.5 : clamp(1 - r.top / window.innerHeight);
  };
  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    lastQ = -1;
    tick();
  };
  const tick = () => {
    const q = Math.round(progress() * 48);
    if (q === lastQ) return;
    lastQ = q;
    draw(q / 48);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  if (reduced) return () => ro.disconnect();
  let visible = false;
  const stopVis = watchVisible(section, (v) => (visible = v), '0px');
  const off = ticker.add(() => visible && tick());
  return () => {
    off();
    stopVis();
    ro.disconnect();
  };
};

/* ------------------------------------------------------------------ */
/* Route-kaart: één ronde van 6 s, remmend in de bochten                */
/* ------------------------------------------------------------------ */

const STAGE_W = 1440;
const STAGE_H = 800;
const LAP = 6;
const HOLD = 1.6;
const FADE = 0.7;

const catmull = (pts, per = 28) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const buildRoute = () => {
  const pts = catmull(ROUTE_POINTS);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[len.length - 1];
  // Kromming per punt (hoekverandering), gladgestreken; bochten kosten tijd.
  const curv = pts.map((p, i) => {
    if (!i || i === pts.length - 1) return 0;
    const a = Math.atan2(p[1] - pts[i - 1][1], p[0] - pts[i - 1][0]);
    const b = Math.atan2(pts[i + 1][1] - p[1], pts[i + 1][0] - p[0]);
    let d = Math.abs(b - a);
    if (d > Math.PI) d = 2 * Math.PI - d;
    return d;
  });
  const smooth = curv.map((_, i) => {
    let s = 0, n = 0;
    for (let k = -6; k <= 6; k++) if (curv[i + k] !== undefined) (s += curv[i + k]), n++;
    return s / n;
  });
  const maxC = Math.max(...smooth) || 1;
  const cost = [0];
  for (let i = 1; i < pts.length; i++) cost.push(cost[i - 1] + (len[i] - len[i - 1]) * (1 + 2.4 * (smooth[i] / maxC)));
  const totalCost = cost[cost.length - 1];
  // Halftoon-corridor rond de lijn.
  const dots = [];
  for (let s = 0; s < total; s += 15) {
    const i = len.findIndex((l) => l >= s);
    const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)];
    const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    for (let o = -70; o <= 70; o += 14) {
      const f = 1 - Math.abs(o) / 76;
      const r = 2.6 * Math.pow(f, 1.6) * (0.55 + 0.45 * hash(Math.round(s), o + 100));
      if (r > 0.35) dots.push([p[0] + nx * o, p[1] + ny * o, r]);
    }
  }
  return { pts, len, total, cost, totalCost, dots };
};

/** Index op de route bij tijdfractie u (met kromming-remming en zachte start/finish). */
const indexAt = (R, u) => {
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const c = e * R.totalCost;
  let lo = 0, hi = R.cost.length - 1;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    R.cost[m] < c ? (lo = m + 1) : (hi = m);
  }
  return lo;
};
const indexAtLength = (R, f) => {
  const s = f * R.total;
  let i = 0;
  while (i < R.len.length - 1 && R.len[i] < s) i++;
  return i;
};

const initRoute = (stage) => {
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const frame = stage.parentElement;
  const R = buildRoute();
  const stageIdx = STAGE_AT.map((f) => indexAtLength(R, f));
  let scale = 1, visible = false, clock = 0, kq = 0;

  // Statische laag (halftoon + basislijn + ringen) één keer op een offscreen canvas.
  const base = document.createElement('canvas');
  const paintBase = () => {
    base.width = Math.round(STAGE_W * kq);
    base.height = Math.round(STAGE_H * kq);
    const b = base.getContext('2d');
    b.setTransform(kq, 0, 0, kq, 0, 0);
    b.fillStyle = 'rgba(255,255,255,0.075)';
    R.dots.forEach(([x, y, r]) => {
      b.beginPath();
      b.arc(x, y, r, 0, Math.PI * 2);
      b.fill();
    });
    b.strokeStyle = 'rgba(18,185,129,0.16)';
    b.lineWidth = 1;
    [70, 140, 230].forEach((r) => {
      b.beginPath();
      b.arc(HUB[0], HUB[1], r, 0, Math.PI * 2);
      b.stroke();
    });
    b.strokeStyle = 'rgba(255,255,255,0.18)';
    b.beginPath();
    R.pts.forEach(([x, y], i) => (i ? b.lineTo(x, y) : b.moveTo(x, y)));
    b.stroke();
    // Fasemarkeringen: kleine vierkantjes met nummer.
    b.font = '500 11px "Space Grotesk", sans-serif';
    stageIdx.forEach((i, n) => {
      const [x, y] = R.pts[i];
      b.strokeStyle = 'rgba(255,255,255,0.5)';
      b.strokeRect(x - 5, y - 5, 10, 10);
      b.fillStyle = 'rgba(255,255,255,0.55)';
      b.fillText(`0${n + 1}`, x + 12, y - 10);
    });
  };

  const layout = () => {
    const fw = frame.clientWidth, fh = frame.clientHeight;
    scale = Math.max(fw / STAGE_W, fh / STAGE_H);
    stage.style.transform = `translate(${(fw - STAGE_W * scale) / 2}px, ${(fh - STAGE_H * scale) / 2}px) scale(${scale})`;
    const k = Math.min(2, (window.devicePixelRatio || 1) * scale);
    if (Math.abs(k - kq) > 0.05) {
      kq = k;
      canvas.width = Math.round(STAGE_W * kq);
      canvas.height = Math.round(STAGE_H * kq);
      paintBase();
    }
    draw();
  };

  const path = (from, to) => {
    ctx.beginPath();
    for (let i = from; i <= to; i++) i === from ? ctx.moveTo(R.pts[i][0], R.pts[i][1]) : ctx.lineTo(R.pts[i][0], R.pts[i][1]);
  };

  const draw = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(kq, 0, 0, kq, 0, 0);
    const t = clock;

    // Assenkruis door de hub: gestippeld en kruipend.
    ctx.save();
    ctx.setLineDash([3, 9]);
    ctx.lineDashOffset = -t * 14;
    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.beginPath();
    ctx.moveTo(0, HUB[1]);
    ctx.lineTo(STAGE_W, HUB[1]);
    ctx.moveTo(HUB[0], 0);
    ctx.lineTo(HUB[0], STAGE_H);
    ctx.stroke();
    ctx.restore();
    // Ping vanuit de hub.
    const ping = (t % 3.2) / 3.2;
    ctx.strokeStyle = `rgba(18,185,129,${0.35 * (1 - ping)})`;
    ctx.beginPath();
    ctx.arc(HUB[0], HUB[1], 30 + ping * 240, 0, Math.PI * 2);
    ctx.stroke();

    // Ronde: rijden, vasthouden, uitfaden.
    const cycle = LAP + HOLD + FADE;
    const c = reduced ? LAP : t % cycle;
    const u = clamp(c / LAP);
    const head = indexAt(R, u);
    const fade = c > LAP + HOLD ? 1 - (c - LAP - HOLD) / FADE : 1;
    if (head > 0) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(18,185,129,${0.55 * fade})`;
      ctx.lineWidth = 2;
      path(0, head);
      ctx.stroke();
      // Gloed achter de kop.
      const tail = Math.max(0, head - 70);
      ctx.save();
      ctx.shadowColor = 'rgba(18,185,129,0.9)';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = `rgba(143,240,201,${0.9 * fade})`;
      ctx.lineWidth = 3;
      path(tail, head);
      ctx.stroke();
      ctx.restore();
      // Filament.
      ctx.strokeStyle = `rgba(255,255,255,${0.9 * fade})`;
      ctx.lineWidth = 1;
      path(Math.max(0, head - 22), head);
      ctx.stroke();
    }
    // Markeringen lichten op als de kop passeert.
    stageIdx.forEach((i) => {
      if (head < i) return;
      const [x, y] = R.pts[i];
      ctx.fillStyle = `rgba(18,185,129,${fade})`;
      ctx.fillRect(x - 5, y - 5, 10, 10);
      const since = (u - indexToU(i)) * LAP;
      if (since >= 0 && since < 0.9) {
        const e = since / 0.9;
        ctx.strokeStyle = `rgba(143,240,201,${1 - e})`;
        ctx.lineWidth = 1;
        const r = 7 + e * 26;
        ctx.strokeRect(x - r, y - r, r * 2, r * 2);
      }
    });
    // Kop + reticule met schaakbord.
    if (fade > 0 && head > 0) {
      const [x, y] = R.pts[head];
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.shadowColor = 'rgba(143,240,201,1)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#8ff0c9';
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      const s = 16, l = 5;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(x + sx * s, y + sy * (s - l));
        ctx.lineTo(x + sx * s, y + sy * s);
        ctx.lineTo(x + sx * (s - l), y + sy * s);
        ctx.stroke();
      });
      const q = 3.5;
      for (let a = 0; a < 3; a++)
        for (let b = 0; b < 2; b++) {
          ctx.fillStyle = (a + b) % 2 ? 'rgba(255,255,255,0.85)' : '#12b981';
          ctx.fillRect(x + s + 5 + a * q, y - s + b * q, q, q);
        }
      ctx.restore();
    }
  };
  // Omgekeerde opzoeking voor de flare-timing (tijdfractie waarop index i bereikt wordt).
  const uCache = new Map();
  const indexToU = (i) => {
    if (uCache.has(i)) return uCache.get(i);
    let lo = 0, hi = 1;
    for (let k = 0; k < 24; k++) {
      const m = (lo + hi) / 2;
      indexAt(R, m) < i ? (lo = m) : (hi = m);
    }
    uCache.set(i, hi);
    return hi;
  };

  const ro = new ResizeObserver(layout);
  ro.observe(frame);
  layout();
  if (reduced) return () => ro.disconnect();
  const stopVis = watchVisible(frame, (v) => (visible = v), '0px');
  const off = ticker.add((now, dt) => {
    if (!visible || document.hidden) return;
    clock += dt;
    draw();
  });
  return () => {
    off();
    stopVis();
    ro.disconnect();
  };
};

export const initCanvases = (root = document) => {
  const offs = [
    ...$$('canvas[data-contour]', root).map(initContour),
    ...$$('canvas[data-dissolve]', root).map(initDissolve),
    ...$$('[data-route]', root).map(initRoute),
  ];
  return () => offs.forEach((f) => f());
};
