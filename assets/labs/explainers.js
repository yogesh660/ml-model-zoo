// Animated, captioned explainers that sit above the live labs. Each one is a short sequence of
// steps drawn on a canvas in a 640 x 400 logical space; the player handles play/pause, stepping,
// scaling and reduced motion.
(function (root) {
  'use strict';
  const { T, alpha } = root.Lab;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 640, H = 400;
  const ease = t => (t < 0 ? 0 : t > 1 ? 1 : t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sig = z => 1 / (1 + Math.exp(-z));

  // ------------------------------------------------------------------ drawing kit (logical coords)
  function kit(c) {
    const g = {
      c,
      font(size, mono, weight) { c.font = `${weight || (mono ? 400 : 500)} ${size}px ${mono ? T.mono : 'Manrope, system-ui, sans-serif'}`; },
      text(s, x, y, o = {}) { g.font(o.size || 13, o.mono !== false && !o.sans, o.weight); c.fillStyle = o.color || T.soft; c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle'; c.globalAlpha = o.a ?? 1; c.fillText(s, x, y); c.globalAlpha = 1; },
      rr(x, y, w, h, r, o = {}) {
        c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
        c.globalAlpha = o.a ?? 1;
        if (o.fill) { c.fillStyle = o.fill; c.fill(); }
        if (o.stroke) { c.strokeStyle = o.stroke; c.lineWidth = o.w || 1.2; c.stroke(); }
        c.globalAlpha = 1;
      },
      line(pts, o = {}) {
        c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.strokeStyle = o.color || 'rgba(255,255,255,0.35)'; c.lineWidth = o.w || 1.4; c.globalAlpha = o.a ?? 1;
        if (o.dash) c.setLineDash(o.dash);
        c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
        if (o.arrow) { const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1]; g.head(x1, y1, x2, y2, o.color, o.a); }
      },
      head(x1, y1, x2, y2, color, a = 1) {
        const ang = Math.atan2(y2 - y1, x2 - x1), s = 7;
        c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - s * Math.cos(ang - 0.45), y2 - s * Math.sin(ang - 0.45)); c.lineTo(x2 - s * Math.cos(ang + 0.45), y2 - s * Math.sin(ang + 0.45)); c.closePath();
        c.fillStyle = color || 'rgba(255,255,255,0.35)'; c.globalAlpha = a; c.fill(); c.globalAlpha = 1;
      },
      dot(x, y, r, color, a = 1) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = color; c.globalAlpha = a; c.fill(); c.globalAlpha = 1; },
      glow(x, y, r, color, a = 1) { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, alpha(color, 0.55 * a)); gr.addColorStop(1, alpha(color, 0)); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); },
      ring(x, y, r, color, w = 1.6, a = 1) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.strokeStyle = color; c.lineWidth = w; c.globalAlpha = a; c.stroke(); c.globalAlpha = 1; },
      // point at fraction t along a polyline
      along(pts, t) {
        const seg = []; let tot = 0;
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
        let d = clamp01(t) * tot;
        for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const f = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } d -= seg[i]; }
        return pts[pts.length - 1];
      },
      // dots flowing along a path; phase in [0,1) loops with time
      flow(pts, time, o = {}) {
        const n = o.n || 4, speed = o.speed || 0.0005;
        for (let k = 0; k < n; k++) { const t = ((time * speed) + k / n) % 1; const [x, y] = g.along(pts, t); g.dot(x, y, o.r || 3, o.color || T.cyan, (o.a ?? 1) * Math.sin(Math.PI * t)); }
      },
      cellColor(v, a = 1) { return v >= 0 ? alpha(T.cyan, a * (0.1 + 0.85 * Math.min(1, v))) : alpha(T.pink, a * (0.1 + 0.85 * Math.min(1, -v))); },
    };
    return g;
  }

  // ------------------------------------------------------------------ player
  const ICON = {
    play: '<svg class="i" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',
    pause: '<svg class="i" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    prev: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  };
  function player(el, spec) {
    el.classList.add('explainer');
    el.innerHTML = `
      <div class="ex-head"><small class="kicker"><i></i>${spec.title || 'Watch it work'}</small><span class="ex-right"><span class="ex-count"></span><button class="copy ex-full" type="button" aria-label="Full screen"><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span>Full screen</span></button></span></div>
      <div class="ex-stage"><canvas></canvas></div>
      <div class="ex-cap" aria-live="polite"><b></b><p></p></div>
      <div class="ex-ctl">
        <button class="ex-btn" data-a="prev" type="button" aria-label="Previous step">${ICON.prev}</button>
        <button class="ex-btn ex-play" data-a="play" type="button" aria-label="Pause">${ICON.pause}</button>
        <button class="ex-btn" data-a="next" type="button" aria-label="Next step">${ICON.next}</button>
        <div class="ex-dots">${spec.steps.map((s, i) => `<button type="button" data-i="${i}" aria-label="Step ${i + 1}: ${s.t}"><i></i></button>`).join('')}</div>
      </div>`;
    const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), g = kit(ctx);
    const cap = el.querySelector('.ex-cap'), count = el.querySelector('.ex-count'), playBtn = el.querySelector('.ex-play');
    const dots = [...el.querySelectorAll('.ex-dots button')];
    let s = 0, t0 = performance.now(), playing = !reduced, visible = false, holdUntil = 0, pausedAt = 0;
    const N = spec.steps.length;
    const setPlaying = on => {
      playing = on; playBtn.innerHTML = on ? ICON.pause : ICON.play; playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      if (on) t0 = performance.now() - pausedAt; else pausedAt = performance.now() - t0;
    };
    const go = (i, keepPlaying) => {
      s = (i + N) % N; t0 = performance.now(); pausedAt = reduced ? 1e9 : 0;
      const st = spec.steps[s];
      cap.querySelector('b').textContent = st.t; cap.querySelector('p').innerHTML = st.d;
      if (window.renderMath) window.renderMath(cap);
      count.textContent = `Step ${s + 1} of ${N}`;
      dots.forEach((d, j) => { d.classList.toggle('on', j === s); d.classList.toggle('done', j < s); });
      if (!keepPlaying && playing) setPlaying(true);
      if (reduced && !playing) pausedAt = 1e9;
    };
    el.querySelector('[data-a=prev]').addEventListener('click', () => { go(s - 1, true); if (!playing) pausedAt = 1e9; });
    el.querySelector('[data-a=next]').addEventListener('click', () => { go(s + 1, true); if (!playing) pausedAt = 1e9; });
    playBtn.addEventListener('click', () => setPlaying(!playing));
    const full = el.querySelector('.ex-full');
    if (!el.requestFullscreen && !el.webkitRequestFullscreen) full.hidden = true;
    full.addEventListener('click', () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else {
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        Promise.resolve(req.call(el)).then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* not supported */ } }).catch(() => {});
      }
    });
    document.addEventListener('fullscreenchange', () => { full.querySelector('span').textContent = document.fullscreenElement === el ? 'Exit' : 'Full screen'; requestAnimationFrame(size); });
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i, true); if (!playing) pausedAt = 1e9; }));
    let scale = 1;
    const size = () => {
      const box = cv.parentElement.getBoundingClientRect(); if (!box.width) return;
      const fsOn = (document.fullscreenElement || document.webkitFullscreenElement) === el;
      const w = fsOn ? Math.min(box.width, box.height * W / H) : box.width;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      scale = w / W;
      cv.style.width = w + 'px'; cv.style.height = (w * H / W) + 'px';
      cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    };
    new ResizeObserver(size).observe(cv.parentElement); size();
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(el);
    go(0, true);
    const frame = now => {
      if (visible && !document.hidden) {
        const st = spec.steps[s], dur = st.dur || 3200;
        const elapsed = playing ? now - t0 : pausedAt;
        const p = clamp01(elapsed / dur);
        if (playing && p >= 1) {
          if (!holdUntil) holdUntil = now + (s === N - 1 ? 3200 : 1100);
          if (now >= holdUntil) { holdUntil = 0; go(s + 1, true); }
        }
        ctx.clearRect(0, 0, W, H);
        spec.draw(g, s, p, now);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  const ex = {};

  // ================================================================== CNN
  ex.cnn = el => {
    const IMG = ['00000000', '01111110', '00000110', '00001100', '00011000', '00110000', '00110000', '00000000'].map(r => [...r].map(Number));
    const F = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
    const FM = Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => { let s = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += IMG[i + a][j + b] * F[a][b]; return s; }));
    const RL = FM.map(r => r.map(v => Math.max(0, v)));
    const PL = Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => Math.max(RL[2 * i][2 * j], RL[2 * i + 1][2 * j], RL[2 * i][2 * j + 1], RL[2 * i + 1][2 * j + 1])));
    const IX = 24, IY = 74, IC = 24, FX = 262, FY = 104, FC = 34, MX = 420, MY = 74, MC = 32, PX = 270, PY = 268, PC = 30;
    player(el, {
      title: 'Watch a convolution, step by step',
      steps: [
        { t: 'An image is just a grid of numbers', d: 'This 8×8 image of a “7” stores 1 where the pen is and 0 elsewhere. A colour photo is the same idea with three grids (red, green, blue).', dur: 2600 },
        { t: 'A filter is a small grid of weights', d: 'This 3×3 filter has negative weights on the left and positive on the right, so it responds to <strong>vertical edges</strong>: dark on the left, bright on the right. In a real CNN these weights are learned.', dur: 2800 },
        { t: 'Lay the filter on a patch, multiply, add up', d: 'Each of the 9 pixels in the highlighted patch is multiplied by the filter weight on top of it, and the 9 products are summed.', dur: 3600 },
        { t: 'The sum becomes one pixel of the feature map', d: 'A big positive number means “this patch looks like the pattern”. Negative means the opposite pattern (here: bright-to-dark edges).', dur: 2400 },
        { t: 'Slide the filter across the whole image', d: 'The same 9 weights are reused at every position (<strong>weight sharing</strong>), so the filter finds its pattern wherever it appears. 36 positions give a 6×6 feature map.', dur: 6200 },
        { t: 'ReLU keeps only the positive evidence', d: 'Negative responses are set to zero. What remains is a map of where the vertical edges are.', dur: 2400 },
        { t: 'Max-pooling shrinks the map', d: 'Each 2×2 block is replaced by its largest value. The map gets 4× smaller and a little tolerant to small shifts of the image.', dur: 4200 },
        { t: 'Stack many filters and layers', d: 'Real CNNs learn dozens of filters per layer. Early layers find edges, later layers combine them into shapes and parts, and a final dense layer turns those features into a class: “this is a 7”.', dur: 5200 },
      ],
      draw(g, s, p, time) {
        const fadeAll = s === 7 ? 1 - ease(clamp01(p * 4)) : 1;
        // positions
        let pos = -1, filled = 0;
        if (s === 2 || s === 3) pos = 0;
        if (s === 4) { pos = Math.min(35, Math.floor(p * 36)); filled = pos + 1; }
        if (s === 3 && p > 0.65) filled = 1;
        if (s >= 5) filled = 36;
        const pr = pos >= 0 ? Math.floor(pos / 6) : 0, pc = pos >= 0 ? pos % 6 : 0;
        // labels
        g.text('input image', IX + 96, IY - 22, { color: T.muted, size: 12, a: fadeAll });
        // input grid
        for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
          const v = IMG[i][j], inPatch = pos >= 0 && i >= pr && i < pr + 3 && j >= pc && j < pc + 3;
          g.rr(IX + j * IC + 1, IY + i * IC + 1, IC - 2, IC - 2, 3, { fill: v ? alpha(T.violet2, 0.85) : 'rgba(255,255,255,0.05)', a: fadeAll });
          g.text(String(v), IX + j * IC + IC / 2, IY + i * IC + IC / 2 + 1, { size: 10, color: v ? '#14121f' : T.dim, a: fadeAll * (inPatch ? 1 : s <= 1 ? ease(p) : 0.55) });
        }
        if (pos >= 0) {
          g.rr(IX + pc * IC - 1, IY + pr * IC - 1, IC * 3 + 2, IC * 3 + 2, 5, { stroke: T.amber, w: 2.4, a: fadeAll });
          g.glow(IX + pc * IC + IC * 1.5, IY + pr * IC + IC * 1.5, 60, T.amber, 0.5 * fadeAll);
        }
        // filter
        if (s >= 1) {
          const fa = (s === 1 ? ease(p) : 1) * fadeAll;
          g.text('filter (3×3)', FX + 51, FY - 22, { color: T.muted, size: 12, a: fa });
          for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
            const w = F[a][b];
            g.rr(FX + b * FC + 1, FY + a * FC + 1, FC - 2, FC - 2, 4, { fill: w > 0 ? alpha(T.cyan, 0.75) : w < 0 ? alpha(T.pink, 0.7) : 'rgba(255,255,255,0.06)', a: fa });
            g.text(w > 0 ? '+1' : w < 0 ? '−1' : '0', FX + b * FC + FC / 2, FY + a * FC + FC / 2 + 1, { size: 13, color: T.ink, a: fa });
          }
          if (pos >= 0 && s <= 4) {
            // connector lines from patch to filter
            const la = s === 2 ? ease(p * 2) : 0.4;
            g.line([[IX + (pc + 3) * IC + 2, IY + pr * IC], [FX - 4, FY]], { color: T.amber, a: la * 0.6, dash: [3, 4] });
            g.line([[IX + (pc + 3) * IC + 2, IY + (pr + 3) * IC], [FX - 4, FY + 3 * FC]], { color: T.amber, a: la * 0.6, dash: [3, 4] });
            // products grid
            const ga = s === 2 ? clamp01((p - 0.3) / 0.4) : 1;
            let sum = 0; const CX = FX + 2, CY = FY + 3 * FC + 26, CC = 22;
            g.text('products', CX + 33, CY - 11, { size: 10, color: T.dim, a: ga });
            for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
              const v = IMG[pr + a][pc + b] * F[a][b]; sum += v;
              g.rr(CX + b * CC + 1, CY + a * CC + 1, CC - 2, CC - 2, 3, { fill: v > 0 ? alpha(T.cyan, 0.5) : v < 0 ? alpha(T.pink, 0.5) : 'rgba(255,255,255,0.04)', a: ga });
              g.text(v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v), CX + b * CC + CC / 2, CY + a * CC + CC / 2 + 1, { size: 10, color: T.ink, a: ga });
            }
            const sa = s === 2 ? clamp01((p - 0.65) / 0.3) : 1;
            g.text(`sum = ${sum > 0 ? '+' : ''}${sum}`, CX + 112, CY + 33, { size: 16, color: sum > 0 ? T.cyan : sum < 0 ? T.pink : T.ink, a: sa, sans: true, weight: 600 });
            if (s === 3) {
              const t = ease(clamp01(p / 0.65));
              const x = lerp(CX + 112, MX + MC / 2, t), y = lerp(CY + 33, MY + MC / 2, t);
              if (p < 0.66) { g.dot(x, y, 7, sum >= 0 ? T.cyan : T.pink); g.glow(x, y, 26, T.cyan); }
            }
          }
        }
        // feature map
        if (s >= 2) {
          const ma = (s === 2 ? ease(p) : 1) * fadeAll;
          g.text(s >= 5 ? 'feature map after ReLU' : 'feature map (6×6)', MX + 96, MY - 22, { color: T.muted, size: 12, a: ma });
          for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
            const k = i * 6 + j, on = k < filled;
            let v = FM[i][j];
            if (s >= 5) v = v < 0 ? v * (s === 5 ? 1 - ease(p) : 0) : v;
            g.rr(MX + j * MC + 1, MY + i * MC + 1, MC - 2, MC - 2, 4, { fill: on ? g.cellColor(v / 3) : 'rgba(255,255,255,0.04)', a: ma });
            if (on && (s < 5 || v !== 0)) g.text(String(Math.round(v)).replace('-', '−'), MX + j * MC + MC / 2, MY + i * MC + MC / 2 + 1, { size: 11, color: T.ink, a: ma });
            if (k === pos && s <= 4) g.rr(MX + j * MC - 1, MY + i * MC - 1, MC + 2, MC + 2, 5, { stroke: T.amber, w: 2.2, a: ma });
          }
        }
        // pooling
        if (s >= 6) {
          const pa = (s === 6 ? ease(p * 2) : 1) * fadeAll;
          const n = s === 6 ? Math.min(9, Math.floor(p * 10)) : 9;
          g.text('after 2×2 max-pool (3×3)', PX + 45, PY - 18, { color: T.muted, size: 12, a: pa });
          for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
            const k = i * 3 + j, on = k < n;
            g.rr(PX + j * PC + 1, PY + i * PC + 1, PC - 2, PC - 2, 4, { fill: on ? g.cellColor(PL[i][j] / 3) : 'rgba(255,255,255,0.04)', a: pa });
            if (on) g.text(String(PL[i][j]), PX + j * PC + PC / 2, PY + i * PC + PC / 2 + 1, { size: 11, color: T.ink, a: pa });
          }
          if (s === 6 && n < 9) {
            const i = Math.floor(n / 3), j = n % 3;
            g.rr(MX + 2 * j * MC - 1, MY + 2 * i * MC - 1, 2 * MC + 2, 2 * MC + 2, 6, { stroke: T.amber, w: 2.4 });
            g.line([[MX + 2 * j * MC, MY + 2 * i * MC + MC], [PX + j * PC + PC, PY + i * PC + PC / 2]], { color: T.amber, a: 0.5, dash: [3, 4], arrow: true });
          }
        }
        // the full network
        if (s === 7) {
          const a = ease(clamp01((p - 0.15) / 0.5));
          const y0 = 170, stages = [
            { x: 46, label: 'image', sub: '', draw: x => g.rr(x - 30, y0 - 30, 60, 60, 6, { fill: alpha(T.violet2, 0.5), stroke: T.violet2, a }) },
            { x: 168, label: 'conv + ReLU', sub: 'edges', draw: x => { for (let k = 3; k >= 0; k--) g.rr(x - 26 + k * 7, y0 - 30 - k * 7, 52, 52, 5, { fill: alpha(T.cyan, 0.18 + 0.1 * k), stroke: alpha(T.cyan, 0.8), a }); } },
            { x: 290, label: 'pool + conv', sub: 'shapes', draw: x => { for (let k = 5; k >= 0; k--) g.rr(x - 18 + k * 6, y0 - 22 - k * 6, 36, 36, 4, { fill: alpha(T.cyan, 0.14 + 0.08 * k), stroke: alpha(T.cyan, 0.8), a }); } },
            { x: 404, label: 'pool + conv', sub: 'parts', draw: x => { for (let k = 7; k >= 0; k--) g.rr(x - 11 + k * 5, y0 - 14 - k * 5, 22, 22, 3, { fill: alpha(T.green, 0.14 + 0.07 * k), stroke: alpha(T.green, 0.8), a }); } },
            { x: 510, label: 'dense', sub: 'combine', draw: x => { for (let k = 0; k < 10; k++) g.rr(x - 6, y0 - 50 + k * 10, 12, 8, 2, { fill: alpha(T.amber, 0.25 + (k === 7 ? 0.6 : 0)), a }); } },
            { x: 592, label: '“7”', sub: 'class', draw: x => g.text('7', x, y0, { size: 34, sans: true, weight: 600, color: T.amber, a }) },
          ];
          stages.forEach((st, i) => {
            const sa = ease(clamp01((p - 0.1 - i * 0.09) / 0.2));
            g.c.globalAlpha = 1;
            st.draw(st.x);
            g.text(st.label, st.x, y0 + 64, { size: 12, color: T.soft, a: sa });
            if (st.sub) g.text(st.sub, st.x, y0 + 82, { size: 11, color: T.dim, a: sa });
            if (i < stages.length - 1) g.line([[st.x + 40, y0], [stages[i + 1].x - 36, y0]], { color: 'rgba(255,255,255,0.4)', a: sa, arrow: true });
          });
          g.flow([[86, y0], [552, y0]], time, { n: 6, color: T.amber, speed: 0.00025, a });
          g.text('features get more abstract and the maps get smaller, layer by layer', 320, 330, { size: 12, color: T.muted, a });
        }
      },
    });
  };

  // ================================================================== RNN
  ex.rnn = el => {
    const words = ['the', 'film', 'was', 'not', 'very', 'good'];
    const w = 0.7, X0 = 34, DX = 100, CW = 72, CY = 184, CH = 54;
    const cx = k => X0 + k * DX;
    player(el, {
      title: 'Watch an RNN read a sentence',
      steps: [
        { t: 'An RNN reads one word at a time', d: 'Each word arrives as a vector (an embedding). The network has to build up an understanding as it goes, left to right.', dur: 2600 },
        { t: 'Each step mixes the new word with the memory so far', d: 'The cell takes the current word $x_t$ and the previous memory $h_{t-1}$ and produces a new memory $h_t = \\tanh(W_h h_{t-1} + W_x x_t)$.', dur: 3200 },
        { t: 'The same cell is reused at every step', d: 'These are not six different networks: it is one cell with one set of weights, applied six times. That is why an RNN can read sequences of any length.', dur: 5200 },
        { t: 'The memory is a blend of everything read so far', d: 'Each bar shows what the memory $h_t$ is made of. Every new word adds its own colour on top of what came before.', dur: 3600 },
        { t: 'But older words fade away', d: 'Each step multiplies the old memory by the recurrent weight (here 0.7). After five steps, “the” has shrunk to $0.7^5 \\approx 17\\%$ of its original strength, and keeps falling.', dur: 4000 },
        { t: 'Training has the same problem: vanishing gradients', d: 'To learn, the error signal must travel backwards through every step, and it is multiplied by about the same factor each time. By the time it reaches the start it is tiny, so early words barely influence learning.', dur: 4400 },
        { t: 'The last memory is used for the answer', d: 'To classify the sentence (for example, sentiment), a small output layer reads the final memory $h_6$. GRUs and LSTMs keep the same loop but add gates so important words do not fade.', dur: 4000 },
      ],
      draw(g, s, p, time) {
        const reached = s === 0 ? 0 : s === 1 ? 1 : s === 2 ? Math.min(6, 1 + Math.floor(p * 5.99)) : 6;
        // words and input arrows
        words.forEach((wd, k) => {
          const a = s === 0 ? ease(clamp01(p * 2 - k * 0.15)) : 1;
          g.rr(cx(k) + 6, 316, CW - 12, 30, 15, { fill: alpha(T.pal[k], 0.18), stroke: alpha(T.pal[k], 0.8), a });
          g.text(wd, cx(k) + CW / 2, 331, { size: 13, color: T.ink, a, sans: true });
          g.text(`x${k + 1}`, cx(k) + CW / 2, 362, { size: 10, color: T.dim, a });
          g.line([[cx(k) + CW / 2, 314], [cx(k) + CW / 2, CY + CH + 4]], { color: alpha(T.pal[k], 0.7), a: a * (k < reached || s === 0 ? 1 : 0.25), arrow: true });
        });
        // cells
        for (let k = 0; k < 6; k++) {
          const on = k < reached;
          const active = (s === 1 && k === 0) || (s === 2 && k === reached - 1);
          if (active) g.glow(cx(k) + CW / 2, CY + CH / 2, 70, T.violet, 0.9);
          g.rr(cx(k), CY, CW, CH, 10, { fill: on ? 'rgba(140,124,255,0.22)' : 'rgba(255,255,255,0.04)', stroke: on ? T.violet2 : 'rgba(255,255,255,0.18)', w: active ? 2 : 1.2 });
          g.text('RNN', cx(k) + CW / 2, CY + CH / 2 - 6, { size: 12, color: on ? T.ink : T.dim, weight: 500 });
          g.text('cell', cx(k) + CW / 2, CY + CH / 2 + 10, { size: 10, color: T.dim });
          if (k < 5) {
            const a = k + 1 < reached ? 1 : 0.25;
            g.line([[cx(k) + CW + 2, CY + CH / 2], [cx(k + 1) - 3, CY + CH / 2]], { color: T.violet2, a, arrow: true, w: 1.6 });
            g.text(`h${k + 1}`, cx(k) + CW + (DX - CW) / 2, CY + CH / 2 - 12, { size: 10, color: T.violet2, a });
          }
        }
        g.line([[2, CY + CH / 2], [cx(0) - 3, CY + CH / 2]], { color: T.violet2, a: 0.6, arrow: true });
        g.text('h0', 12, CY + CH / 2 - 12, { size: 10, color: T.violet2, a: 0.6 });
        // pulse travelling
        if (s === 1) { const t = ease(p); const [x, y] = t < 0.5 ? [cx(0) + CW / 2, lerp(314, CY + CH / 2, t * 2)] : [lerp(cx(0) + CW / 2, cx(1) - 4, (t - 0.5) * 2), CY + CH / 2]; g.dot(x, y, 6, T.pal[0]); g.glow(x, y, 22, T.pal[0]); }
        if (s === 2) {
          const x = lerp(cx(0) + CW / 2, cx(5) + CW / 2, ease(p)); g.dot(x, CY + CH / 2, 5, T.amber); g.glow(x, CY + CH / 2, 26, T.amber);
          const ba = ease(clamp01((p - 0.5) * 3));
          g.line([[cx(0), CY - 14], [cx(5) + CW, CY - 14]], { color: T.amber, a: ba * 0.8 });
          g.line([[cx(0), CY - 20], [cx(0), CY - 8]], { color: T.amber, a: ba * 0.8 }); g.line([[cx(5) + CW, CY - 20], [cx(5) + CW, CY - 8]], { color: T.amber, a: ba * 0.8 });
          g.text('one cell, same weights W, reused at every step', 320, CY - 30, { size: 12, color: T.amber, a: ba });
        }
        // memory composition bars
        if (s >= 3 && s <= 4) {
          const ba = s === 3 ? ease(p) : 1;
          for (let k = 0; k < 6; k++) {
            const raw = Array.from({ length: k + 1 }, (_, j) => Math.pow(w, k - j));
            const tot = raw.reduce((a, b) => a + b, 0);
            let y = CY - 16;
            const BH = 100;
            raw.forEach((r, j) => {
              const h = (r / tot) * BH * (s === 3 ? clamp01(p * 1.6 - k * 0.1) : 1);
              const hi = s === 4 && j === 0;
              g.rr(cx(k) + 18, y - h, CW - 36, Math.max(0, h - 1), 2, { fill: alpha(T.pal[j], hi ? 0.95 : s === 4 ? 0.35 : 0.8), a: ba });
              y -= h;
            });
            if (s === 4) {
              const share = Math.pow(w, k);
              g.text(`${Math.round(share * 100)}%`, cx(k) + CW / 2, CY - 128, { size: 12, color: T.pal[0], a: ease(clamp01(p * 3 - k * 0.3)) });
            }
          }
          g.text(s === 4 ? 'strength of “the” left in the memory (×0.7 per step)' : 'what each memory h is made of', 320, 26, { size: 12, color: T.muted, a: ba });
        }
        // backward gradient
        if (s === 5) {
          const t = ease(p), x = lerp(cx(5) + CW / 2, cx(0) + CW / 2, t);
          const strength = Math.pow(w, t * 5);
          const gy = CY - 40;
          g.dot(x, gy, 2 + 9 * strength, T.pink); g.glow(x, gy, 10 + 30 * strength, T.pink);
          g.line([[cx(5) + CW / 2, gy], [x + 10, gy]], { color: T.pink, a: 0.35, dash: [3, 4] });
          g.text(`gradient strength ${Math.round(strength * 100)}%`, x, gy - 26, { size: 12, color: T.pink });
          g.text('← error signal travelling back in time', 320, 40, { size: 12, color: T.muted });
        }
        // output
        if (s === 6) {
          const a = ease(p);
          g.line([[cx(5) + CW / 2, CY - 2], [cx(5) + CW / 2, 104]], { color: T.green, a, arrow: true, w: 1.8 });
          g.rr(cx(5) - 34, 50, CW + 68, 52, 10, { fill: alpha(T.green, 0.12), stroke: T.green, a });
          g.text('output layer', cx(5) + CW / 2, 66, { size: 11, color: T.dim, a });
          g.text('sentiment: negative', cx(5) + CW / 2, 86, { size: 13, color: T.green, a, sans: true, weight: 600 });
          g.text('needs “not” (step 4) to survive until step 6', cx(2) + 40, 76, { size: 12, color: T.muted, a });
          g.flow([[cx(0) + CW / 2, CY + CH / 2], [cx(5) + CW / 2, CY + CH / 2], [cx(5) + CW / 2, 104]], time, { n: 5, color: T.green, speed: 0.0004, a });
        }
      },
    });
  };

  // ================================================================== GRU
  ex.gru = el => {
    // geometry
    const HW = 112, MIX = [440, HW], RB = [190, 214], ZB = [290, 214], CB = [370, 214], BW = 58, BH = 36, XM = [228, 160], BUS = 284;
    player(el, {
      title: 'Inside a GRU cell',
      steps: [
        { t: 'A GRU is an RNN cell with two gates', d: 'Memory flows along the top line, from the previous state $h_{t-1}$ to the new state $h_t$. The new input $x_t$ comes in from below. Two small gates decide how the two meet.', dur: 3600 },
        { t: 'Reset gate r: how much past to use', d: 'The reset gate (a sigmoid, between 0 and 1) scales the old memory before it is used to propose new content. With r ≈ 0 the proposal ignores the past, which helps start a fresh thought.', dur: 3800 },
        { t: 'Candidate h̃: a proposal for new memory', d: 'A tanh layer combines the new input with the reset-scaled memory into a candidate $\\tilde h_t$. Nothing is written yet; it is only a suggestion.', dur: 3600 },
        { t: 'Update gate z: keep or replace', d: 'The update gate mixes the two: $h_t = (1 - z)\\,h_{t-1} + z\\,\\tilde h_t$. With z ≈ 0 the old memory passes through; with z ≈ 1 it is replaced by the candidate.', dur: 5200 },
        { t: 'The trick: write rarely, keep the rest', d: 'Over a sentence, z opens (bright bars) only when something worth remembering arrives and stays near 0 otherwise. The memory line stays flat between writes, so information and gradients survive many steps.', dur: 5600 },
      ],
      draw(g, s, p, time) {
        const hi = k => (k === s ? 1 : s === 0 || s === 4 ? 0.85 : 0.35);
        const dim = s === 4 ? 1 - 0.85 * ease(clamp01(p * 3)) : 1;
        // cell outline
        g.rr(140, 64, 380, 250, 18, { fill: 'rgba(255,255,255,0.025)', stroke: 'rgba(255,255,255,0.16)', a: dim });
        g.text('GRU cell', 168, 82, { size: 11, color: T.dim, align: 'left', a: dim });
        // memory highway
        g.line([[20, HW], [MIX[0] - 16, HW]], { color: T.violet2, w: 2.2, a: dim });
        g.line([[MIX[0] + 16, HW], [620, HW]], { color: T.violet2, w: 2.2, arrow: true, a: dim });
        g.text('h(t−1)', 40, HW - 16, { size: 12, color: T.violet2, a: dim });
        g.text('h(t)', 604, HW - 16, { size: 12, color: T.violet2, a: dim });
        if (s === 0) g.flow([[20, HW], [620, HW]], time, { n: 6, color: T.violet2, speed: 0.00035 });
        // x input and bus
        g.line([[160, 384], [160, BUS], [CB[0] + BW / 2, BUS]], { color: T.green, a: dim * (s === 1 || s === 2 || s === 3 ? 0.9 : 0.6) });
        g.text('x(t)', 160, 372, { size: 12, color: T.green, a: dim, align: 'left' });
        [RB, ZB, CB].forEach(b => g.line([[b[0] + BW / 2, BUS], [b[0] + BW / 2, b[1] + BH + 2]], { color: T.green, a: dim * 0.6, arrow: true }));
        // reset path: highway -> x node -> candidate
        g.line([[XM[0], HW], [XM[0], XM[1] - 12]], { color: T.violet2, a: dim * hi(1), arrow: true });
        g.line([[RB[0] + BW / 2, RB[1]], [XM[0], XM[1] + 12]], { color: T.amber, a: dim * hi(1), arrow: true });
        g.line([[XM[0] + 12, XM[1]], [CB[0] + BW / 2, XM[1]], [CB[0] + BW / 2, CB[1] - 2]], { color: T.violet2, a: dim * Math.max(hi(1), hi(2)), arrow: true });
        g.ring(XM[0], XM[1], 12, T.amber, 1.6, dim * hi(1)); g.text('×', XM[0], XM[1] + 1, { size: 14, color: T.amber, a: dim * hi(1) });
        // update path: z box -> mix ; candidate -> mix
        g.line([[ZB[0] + BW / 2, ZB[1]], [ZB[0] + BW / 2, 182], [MIX[0] - 6, 182], [MIX[0] - 6, MIX[1] + 15]], { color: T.amber, a: dim * hi(3), arrow: true });
        g.line([[CB[0] + BW, CB[1] + BH / 2], [MIX[0] + 8, CB[1] + BH / 2], [MIX[0] + 8, MIX[1] + 15]], { color: T.cyan, a: dim * Math.max(hi(2), hi(3)), arrow: true });
        // boxes
        const box = (b, label, sub, color, k) => {
          if (s === k) g.glow(b[0] + BW / 2, b[1] + BH / 2, 60, color);
          g.rr(b[0], b[1], BW, BH, 8, { fill: alpha(color, 0.16), stroke: color, a: dim * hi(k), w: s === k ? 2 : 1.2 });
          g.text(label, b[0] + BW / 2, b[1] + BH / 2 - 5, { size: 13, color: T.ink, a: dim * hi(k), sans: true, weight: 600 });
          g.text(sub, b[0] + BW / 2, b[1] + BH / 2 + 10, { size: 10, color: T.dim, a: dim * hi(k) });
        };
        box(RB, 'r', 'σ reset', T.amber, 1);
        box(ZB, 'z', 'σ update', T.amber, 3);
        box(CB, 'h̃', 'tanh', T.cyan, 2);
        // mix node with dial
        const z = s === 3 ? 0.5 - 0.5 * Math.cos(time * 0.0016) : s === 4 ? 0.1 : 0.3;
        if (s === 3) g.glow(MIX[0], MIX[1], 50, T.amber);
        g.dot(MIX[0], MIX[1], 15, '#0d0c14', dim); g.ring(MIX[0], MIX[1], 15, T.amber, 1.8, dim * hi(3));
        g.c.beginPath(); g.c.arc(MIX[0], MIX[1], 15, -Math.PI / 2, -Math.PI / 2 + z * Math.PI * 2); g.c.strokeStyle = T.amber; g.c.lineWidth = 4; g.c.globalAlpha = dim * hi(3); g.c.stroke(); g.c.globalAlpha = 1;
        g.text('mix', MIX[0], MIX[1] + 1, { size: 10, color: T.ink, a: dim });
        if (s === 1) { g.flow([[XM[0], HW], [XM[0], XM[1]], [CB[0] + BW / 2, XM[1]], [CB[0] + BW / 2, CB[1]]], time, { n: 4, color: T.violet2, speed: 0.0006 }); g.text('r = 0.6 → use 60% of the old memory', 330, 344, { size: 12, color: T.amber }); }
        if (s === 2) { g.flow([[160, 384], [160, BUS], [CB[0] + BW / 2, BUS], [CB[0] + BW / 2, CB[1] + BH]], time, { n: 4, color: T.green, speed: 0.0006 }); g.flow([[CB[0] + BW, CB[1] + BH / 2], [MIX[0] + 8, CB[1] + BH / 2], [MIX[0] + 8, MIX[1] + 15]], time, { n: 3, color: T.cyan, speed: 0.0007 }); }
        if (s === 3) {
          const col = `rgb(${Math.round(lerp(179, 86, z))},${Math.round(lerp(171, 217, z))},255)`;
          g.flow([[MIX[0] + 16, HW], [620, HW]], time, { n: 5, color: col, speed: 0.0005, r: 4 });
          g.text(`z = ${z.toFixed(2)}`, MIX[0], 60, { size: 13, color: T.amber });
          g.text(z < 0.3 ? 'keep the old memory' : z > 0.7 ? 'replace with the candidate' : 'blend old and new', MIX[0], 42, { size: 12, color: T.soft });
        }
        // timeline
        if (s === 4) {
          const a = ease(p), words = ['the', 'cat', ',', 'which', 'was', 'very', 'old', ',', 'slept'];
          const zs = [0.9, 0.95, 0.05, 0.08, 0.04, 0.06, 0.1, 0.04, 0.5];
          const x0 = 40, dx = 64, top = 300;
          g.rr(20, 200, 600, 192, 14, { fill: '#0b0b10', stroke: 'rgba(255,255,255,0.14)' });
          g.text('update gate z over a sentence', 320, 220, { size: 12, color: T.muted, a });
          let mem = 0; const pts = [];
          words.forEach((wd, k) => {
            mem = (1 - zs[k]) * mem + zs[k] * (k === 1 ? 1 : k === 0 ? 0.5 : 0.4);
            pts.push([x0 + k * dx + 20, top - mem * 34]);
            const show = clamp01(p * 1.4 - k * 0.07);
            g.rr(x0 + k * dx + 12, 362 - zs[k] * 40, 16, zs[k] * 40, 3, { fill: alpha(T.amber, 0.25 + 0.7 * zs[k]), a: a * show });
            g.text(wd, x0 + k * dx + 20, 374, { size: 11, color: T.soft, a: a * show });
          });
          g.line(pts.slice(0, Math.max(2, Math.ceil(p * 1.4 * pts.length))), { color: T.cyan, w: 2, a });
          g.text('memory', 34, top - 34, { size: 10, color: T.cyan, a, align: 'left' });
          g.text('z', 26, 345, { size: 11, color: T.amber, a, align: 'left' });
        }
      },
    });
  };

  // ================================================================== LSTM
  ex.lstm = el => {
    const BELT = 104, BUS = 318, FX = 200, IX = 272, CX = 336, OX = 410, BY = 236, BW = 52, BH = 38, PLUS = [304, BELT], IMUL = [304, 176], TANH = [470, 170], OMUL = [470, 252];
    player(el, {
      title: 'Inside an LSTM cell',
      steps: [
        { t: 'Two lines run through every LSTM cell', d: 'The top line is the <strong>cell state</strong> $c$: long-term memory, a conveyor belt through time. The bottom line carries the <strong>hidden state</strong> $h$ (what the cell shows) together with the new input $x_t$.', dur: 4000 },
        { t: 'Forget gate f: what to erase', d: 'For each memory slot, a sigmoid outputs a number between 0 (erase) and 1 (keep). The belt is multiplied by it.', dur: 3800 },
        { t: 'Input gate i and candidate c̃: what to write', d: 'A tanh layer proposes new content $\\tilde c_t$; the input gate decides how much of it to let in.', dur: 3800 },
        { t: 'Memory is updated by addition', d: '$c_t = f \\cdot c_{t-1} + i \\cdot \\tilde c_t$. Because the belt is only scaled and added to, never squashed through a tanh at every step, information and gradients can travel a long way.', dur: 4200 },
        { t: 'Output gate o: what to reveal', d: 'A squashed copy of the memory, $\\tanh(c_t)$, is multiplied by the output gate to give $h_t$. The cell can hold something without showing it until it is needed.', dur: 3800 },
        { t: 'Across time: write once, hold, read later', d: 'To remember a value through 20 distractors, the input gate opens once at the start, the forget gate stays near 1, and the output gate opens at the end. The lab below lets you break each of these.', dur: 6400 },
      ],
      draw(g, s, p, time) {
        const fade = s === 5 ? 1 - ease(clamp01(p * 3)) * 0.8 : 1;
        const hi = k => fade * (k === s || s === 0 ? 1 : 0.32);
        // cell outline
        g.rr(120, 58, 420, 290, 18, { fill: 'rgba(255,255,255,0.025)', stroke: 'rgba(255,255,255,0.16)', a: fade });
        g.text('LSTM cell', 146, 76, { size: 11, color: T.dim, align: 'left', a: fade });
        // belt
        const beltA = fade * (s === 0 || s === 3 ? 1 : 0.6);
        g.line([[20, BELT], [FX - 13, BELT]], { color: T.cyan, w: 2.6, a: beltA });
        g.line([[FX + 13, BELT], [PLUS[0] - 13, BELT]], { color: T.cyan, w: 2.6, a: beltA });
        g.line([[PLUS[0] + 13, BELT], [620, BELT]], { color: T.cyan, w: 2.6, a: beltA, arrow: true });
        g.text('c(t−1)', 42, BELT - 16, { size: 12, color: T.cyan, a: fade }); g.text('c(t)', 604, BELT - 16, { size: 12, color: T.cyan, a: fade });
        if (s === 0 || s === 3) g.flow([[20, BELT], [620, BELT]], time, { n: 7, color: T.cyan, speed: 0.00035, r: 3.5, a: fade });
        // bus
        g.line([[20, BUS], [OX + BW / 2, BUS]], { color: T.violet2, w: 2, a: fade * 0.8 });
        g.text('h(t−1)', 42, BUS + 16, { size: 12, color: T.violet2, a: fade });
        g.line([[150, 392], [150, BUS]], { color: T.green, w: 1.8, a: fade * 0.8 });
        g.text('x(t)', 160, 382, { size: 12, color: T.green, a: fade, align: 'left' });
        if (s === 0) g.flow([[20, BUS], [OX + BW / 2, BUS]], time, { n: 5, color: T.violet2, speed: 0.0004 });
        // gate boxes
        const box = (x, label, sub, color, k) => {
          if (k === s) g.glow(x + BW / 2, BY + BH / 2, 56, color);
          g.line([[x + BW / 2, BUS], [x + BW / 2, BY + BH + 2]], { color: 'rgba(255,255,255,0.4)', a: hi(k) });
          g.rr(x, BY, BW, BH, 8, { fill: alpha(color, 0.16), stroke: color, a: hi(k), w: k === s ? 2 : 1.2 });
          g.text(label, x + BW / 2, BY + BH / 2 - 6, { size: 14, color: T.ink, a: hi(k), sans: true, weight: 600 });
          g.text(sub, x + BW / 2, BY + BH / 2 + 10, { size: 10, color: T.dim, a: hi(k) });
        };
        box(FX - BW / 2, 'f', 'σ forget', T.pink, 1);
        box(IX - BW / 2, 'i', 'σ input', T.amber, 2);
        box(CX - BW / 2, 'c̃', 'tanh', T.green, 2);
        box(OX - BW / 2, 'o', 'σ output', T.violet2, 4);
        // operator nodes
        const node = (pt, sym, color, a) => { g.dot(pt[0], pt[1], 13, '#0d0c14', a); g.ring(pt[0], pt[1], 13, color, 1.8, a); g.text(sym, pt[0], pt[1] + 1, { size: 14, color, a }); };
        g.line([[FX, BY], [FX, BELT + 14]], { color: T.pink, a: hi(1), arrow: true });
        node([FX, BELT], '×', T.pink, hi(1));
        g.line([[IX, BY], [IX, IMUL[1] + 8], [IMUL[0] - 12, IMUL[1]]], { color: T.amber, a: hi(2) });
        g.line([[CX, BY], [CX, IMUL[1] + 8], [IMUL[0] + 12, IMUL[1]]], { color: T.green, a: hi(2) });
        node(IMUL, '×', T.amber, hi(2));
        g.line([[IMUL[0], IMUL[1] - 13], [PLUS[0], PLUS[1] + 14]], { color: T.amber, a: Math.max(hi(2), hi(3)), arrow: true });
        node(PLUS, '+', T.cyan, Math.max(hi(2), hi(3)));
        g.line([[TANH[0], BELT], [TANH[0], TANH[1] - 14]], { color: T.cyan, a: hi(4), arrow: true });
        node(TANH, 't', T.cyan, hi(4)); g.text('tanh', TANH[0] + 30, TANH[1], { size: 10, color: T.dim, a: hi(4) });
        g.line([[TANH[0], TANH[1] + 13], [OMUL[0], OMUL[1] - 14]], { color: T.cyan, a: hi(4), arrow: true });
        g.line([[OX + BW / 2, BY + BH / 2], [OMUL[0] - 14, OMUL[1]]], { color: T.violet2, a: hi(4), arrow: true });
        node(OMUL, '×', T.violet2, hi(4));
        g.line([[OMUL[0], OMUL[1] + 13], [OMUL[0], BUS + 22], [620, BUS + 22]], { color: T.violet2, w: 2, a: hi(4), arrow: true });
        g.text('h(t)', 604, BUS + 38, { size: 12, color: T.violet2, a: fade });
        // per-step animation
        if (s === 1) {
          const f = 0.55 + 0.45 * Math.sin(time * 0.002);
          g.text(`f = ${f.toFixed(2)}`, FX, 46, { size: 13, color: T.pink });
          g.text(f > 0.8 ? 'keep' : f < 0.35 ? 'erase' : 'partly forget', FX, 28, { size: 12, color: T.soft });
          g.flow([[20, BELT], [FX, BELT]], time, { n: 4, color: T.cyan, speed: 0.0006, r: 4 });
          g.flow([[FX, BELT], [PLUS[0], BELT]], time, { n: 3, color: T.cyan, speed: 0.0006, r: 4, a: f });
        }
        if (s === 2) {
          g.flow([[CX, BY], [CX, IMUL[1] + 8], [IMUL[0], IMUL[1]], [PLUS[0], PLUS[1]]], time, { n: 3, color: T.green, speed: 0.0006, r: 3.5 });
          g.text('i = 0.9: let the new content in', IX + 30, 46, { size: 12, color: T.amber });
        }
        if (s === 3) {
          const a = ease(clamp01(p * 2));
          g.rr(196, 20, 260, 40, 10, { fill: 'rgba(86,217,255,0.08)', stroke: alpha(T.cyan, 0.6), a });
          g.text('c(t) = f · c(t−1) + i · c̃', 326, 40, { size: 14, color: T.cyan, a });
        }
        if (s === 4) g.flow([[TANH[0], BELT], [TANH[0], OMUL[1]], [OMUL[0], BUS + 22], [620, BUS + 22]], time, { n: 4, color: T.violet2, speed: 0.0005, r: 3.5 });
        // timeline
        if (s === 5) {
          const a = ease(clamp01((p - 0.15) * 2.5));
          const n = 12, x0 = 70, dx = 46, cY = 140;
          g.rr(16, 22, 608, 370, 16, { fill: '#0b0b10', stroke: 'rgba(255,255,255,0.14)', a: ease(clamp01(p * 4)) });
          const inp = ['0.7', '·', '·', '·', '·', '·', '·', '·', '·', '·', '·', '?'];
          const fv = Array(n).fill(0.98), iv = inp.map((v, k) => (k === 0 ? 0.95 : 0.03)), ov = inp.map((v, k) => (k === n - 1 ? 0.95 : 0.05));
          let c = 0; const pts = [];
          const shown = Math.ceil(clamp01((p - 0.15) * 1.6) * n);
          for (let k = 0; k < n; k++) {
            const x = x0 + k * dx;
            c = fv[k] * c + iv[k] * (k === 0 ? 0.7 : (k % 3 - 1) * 0.6);
            pts.push([x, cY + 70 - c * 90]);
            const sa = a * (k < shown ? 1 : 0.15);
            g.text(k === 0 ? 'value' : k === n - 1 ? 'recall' : 'noise', x, 80, { size: 9, color: T.dim, a: sa });
            g.text(inp[k] === '·' ? '~' : inp[k], x, 96, { size: 13, color: k === 0 ? T.green : k === n - 1 ? T.amber : T.dim, a: sa });
            [[fv[k], T.pink, 0], [iv[k], T.amber, 1], [ov[k], T.violet2, 2]].forEach(([v, col, r]) => g.rr(x - 14 + r * 10, 330 - v * 70, 8, v * 70, 2, { fill: alpha(col, 0.3 + 0.65 * v), a: sa }));
          }
          g.line(pts.slice(0, Math.max(2, shown)), { color: T.cyan, w: 2.4, a });
          g.line([[x0 - 10, cY + 70 - 0.7 * 0.95 * 90], [x0 + (n - 1) * dx + 10, cY + 70 - 0.7 * 0.95 * 90]], { color: T.green, dash: [4, 4], a: a * 0.5 });
          g.text('cell state c', 40, 116, { size: 10, color: T.cyan, align: 'left', a });
          [['f', T.pink], ['i', T.amber], ['o', T.violet2]].forEach(([l, col], r) => g.text(l, 36 + r * 12, 344, { size: 10, color: col, a }));
          g.text('gates per step', 108, 344, { size: 10, color: T.dim, a, align: 'left' });
        }
      },
    });
  };

  // ================================================================== Transformer / attention
  ex.attention = el => {
    const toks = ['the', 'animal', 'crossed', 'because', 'it', 'was', 'tired'];
    const n = toks.length, X = k => 52 + k * 89, TY = 46, Q = 4;
    const softmax = r => { const m = Math.max(...r), e = r.map(v => Math.exp(v - m)), z = e.reduce((a, b) => a + b, 0); return e.map(v => v / z); };
    // illustrative scores for the "meaning" head (row = query, column = key)
    const S = [
      [1.5, 1.2, 0.2, 0, 0.2, 0, 0], [0.4, 1.6, 1.0, 0.1, 0.3, 0.1, 0.6], [0.2, 2.2, 1.2, 0.3, 0.4, 0.1, 0.1], [0.1, 0.4, 1.4, 1.2, 0.9, 0.3, 0.4],
      [0.1, 3.0, 0.4, 0.2, 1.4, 0.3, 1.1], [0.1, 0.6, 0.3, 0.3, 1.8, 1.0, 0.9], [0.1, 1.6, 0.2, 0.3, 1.5, 0.8, 1.2],
    ];
    const A = S.map(softmax);
    const P = toks.map((_, i) => softmax(toks.map((__, j) => (j === i - 1 ? 2.5 : j === i ? 1.2 : -Math.abs(i - j) * 0.6))));
    player(el, {
      title: 'Watch self-attention, step by step',
      steps: [
        { t: 'Every word becomes a vector, plus its position', d: 'Each token is turned into an embedding (a list of numbers). A position code is added, because attention on its own has no idea of word order.', dur: 3000 },
        { t: 'Each word makes a query, a key and a value', d: 'Three learned projections of the same vector. <strong>Query</strong>: what am I looking for? <strong>Key</strong>: what do I contain? <strong>Value</strong>: what will I pass on if someone looks at me?', dur: 3800 },
        { t: 'Compare one query with every key', d: 'Take the query of “it” and compute a dot product with the key of every word (scaled by $1/\\sqrt{d}$). A high score means a good match. Distance does not matter: “animal” is as easy to reach as “was”.', dur: 4200 },
        { t: 'Softmax turns scores into weights', d: 'The scores become attention weights that are positive and sum to 1. Here “it” puts most of its attention on “animal”. (These numbers are illustrative.)', dur: 3600 },
        { t: 'Blend the values', d: 'The new representation of “it” is the weighted average of all value vectors: mostly “animal”, a little of everything else. The word now carries the meaning of what it refers to.', dur: 4200 },
        { t: 'Every word does this at once', d: 'All rows are computed in parallel: one matrix multiplication, no step-by-step loop. That is why Transformers train so fast on GPUs. Each row of this grid is one word’s attention.', dur: 4600 },
        { t: 'Many heads, many layers', d: 'Several heads run side by side with their own projections: one might track meaning (left), another simply looks at the previous word (right). Blocks of attention + feed-forward layers are stacked many times to build a Transformer.', dur: 5600 },
      ],
      draw(g, s, p, time) {
        const fadeRow = s >= 5 ? 1 - ease(clamp01(p * 3)) * (s === 5 ? 0.75 : 0) : 1;
        const rowA = s >= 6 ? 0.25 : fadeRow;
        // tokens
        toks.forEach((t, k) => {
          const a = (s === 0 ? ease(clamp01(p * 2.2 - k * 0.12)) : 1) * rowA;
          const isQ = k === Q && s >= 2 && s <= 4;
          if (isQ) g.glow(X(k), TY, 46, T.amber, 0.8);
          g.rr(X(k) - 38, TY - 15, 76, 30, 15, { fill: isQ ? alpha(T.amber, 0.22) : 'rgba(255,255,255,0.06)', stroke: isQ ? T.amber : 'rgba(255,255,255,0.22)', a });
          g.text(t, X(k), TY + 1, { size: 13, color: T.ink, a, sans: true });
          if (s <= 1) {
            const ea = s === 0 ? clamp01(p * 2 - 0.5) : 1;
            for (let d = 0; d < 4; d++) { const v = Math.sin(k * 1.7 + d * 2.1); g.rr(X(k) - 20 + d * 10, 92 - Math.abs(v) * 22, 8, Math.abs(v) * 22, 2, { fill: alpha(v > 0 ? T.violet2 : T.pink, 0.8), a: a * ea }); }
            g.text(`+ pos ${k + 1}`, X(k), 106, { size: 10, color: T.dim, a: a * ea });
          }
        });
        // Q K V tiles
        const QY = 146;
        if (s >= 1 && s <= 4) {
          toks.forEach((_, k) => {
            const a = (s === 1 ? ease(clamp01(p * 2 - k * 0.1)) : 1) * fadeRow;
            [['q', T.amber, -24], ['k', T.cyan, 0], ['v', T.green, 24]].forEach(([l, col, dx]) => {
              const on = s === 1 || (l === 'q' && k === Q && s <= 3) || (l === 'k' && (s === 2 || s === 3)) || (l === 'v' && s === 4);
              g.rr(X(k) + dx - 9, QY - 9, 18, 18, 4, { fill: alpha(col, on ? 0.6 : 0.18), stroke: alpha(col, on ? 1 : 0.4), a });
              g.text(l, X(k) + dx, QY + 1, { size: 10, color: on ? '#101018' : T.dim, a });
            });
            if (s === 1) g.line([[X(k), 116], [X(k), QY - 12]], { color: 'rgba(255,255,255,0.25)', a, arrow: true });
          });
        }
        // scores
        if (s === 2 || s === 3) {
          toks.forEach((_, k) => {
            const t = s === 2 ? ease(clamp01(p * 1.8 - k * 0.12)) : 1;
            const x0 = X(Q) - 24, x1 = X(k);
            const cy = QY + 46 + Math.abs(k - Q) * 10;
            g.c.beginPath(); g.c.moveTo(x0, QY + 10); g.c.quadraticCurveTo((x0 + x1) / 2, cy, x1, QY + 10);
            g.c.strokeStyle = T.amber; g.c.lineWidth = s === 3 ? 1 + A[Q][k] * 9 : 1.2; g.c.globalAlpha = (s === 3 ? 0.25 + A[Q][k] : 0.6) * t; g.c.stroke(); g.c.globalAlpha = 1;
            g.text(S[Q][k].toFixed(1), x1, QY + 30, { size: 11, color: T.amber, a: t * (s === 2 ? 1 : 0.5) });
          });
          g.text('score = q(it) · k / √d', 320, 214, { size: 12, color: T.muted, a: s === 2 ? ease(p) : 0.6 });
        }
        if (s === 3 || s === 4) {
          toks.forEach((_, k) => {
            const t = s === 3 ? ease(clamp01(p * 1.6 - 0.2)) : 1;
            const hgt = A[Q][k] * 110 * t;
            g.rr(X(k) - 16, 350 - hgt, 32, hgt, 4, { fill: alpha(T.pal[k], 0.85), a: fadeRow });
            g.text(`${Math.round(A[Q][k] * 100)}%`, X(k), 350 - hgt - 12, { size: 12, color: T.ink, a: t * fadeRow });
          });
          g.text('attention weights of “it” (sum to 100%)', 320, 374, { size: 12, color: T.muted, a: fadeRow });
        }
        if (s === 4) {
          // values flow into the new "it"
          const ox = 556, oy = 196;
          toks.forEach((_, k) => g.flow([[X(k) + 24, QY + 10], [ox, oy]], time + k * 120, { n: 2, color: T.pal[k], speed: 0.0006, r: 2 + A[Q][k] * 6 }));
          g.rr(ox - 34, oy - 18, 68, 36, 8, { fill: '#0e0d16', stroke: T.amber });
          let x = ox - 30; A[Q].forEach((w, k) => { g.rr(x, oy - 8, 60 * w, 16, 2, { fill: T.pal[k] }); x += 60 * w; });
          g.text('new “it”', ox, oy + 30, { size: 11, color: T.amber });
        }
        // full matrix
        const grid = (M, gx, gy, cs, title, prog, a) => {
          g.text(title, gx + (cs * n) / 2, gy - 56, { size: 12, color: T.soft, a });
          for (let i = 0; i < n; i++) {
            g.text(toks[i], gx - 6, gy + i * cs + cs / 2, { size: 10, color: T.dim, align: 'right', a });
            for (let j = 0; j < n; j++) {
              const on = i * n + j < prog * n * n;
              g.rr(gx + j * cs + 1, gy + i * cs + 1, cs - 2, cs - 2, 3, { fill: on ? alpha(T.violet, 0.08 + 0.92 * Math.min(1, M[i][j] * 1.6)) : 'rgba(255,255,255,0.03)', a });
            }
          }
          for (let j = 0; j < n; j++) { g.c.save(); g.c.translate(gx + j * cs + cs / 2, gy - 8); g.c.rotate(-0.7); g.text(toks[j], 0, 0, { size: 10, color: T.dim, align: 'left', a }); g.c.restore(); }
        };
        if (s === 5) grid(A, 250, 150, 30, 'attention matrix: row = query, column = key', ease(clamp01((p - 0.2) * 1.6)), ease(clamp01((p - 0.1) * 3)));
        if (s === 6) {
          const a = ease(clamp01(p * 2));
          grid(A, 90, 150, 24, 'head 1: meaning', 1, a);
          grid(P, 330, 150, 24, 'head 2: previous word', 1, a);
          const sx = 548, sa = ease(clamp01((p - 0.35) * 2));
          for (let k = 3; k >= 0; k--) g.rr(sx - 36 + k * 6, 160 + k * 26, 72, 22, 6, { fill: alpha(k % 2 ? T.cyan : T.violet, 0.25), stroke: alpha(k % 2 ? T.cyan : T.violet, 0.9), a: sa });
          g.text('attention', sx + 2, 171, { size: 10, color: T.ink, a: sa }); g.text('feed-forward', sx + 8, 197, { size: 10, color: T.ink, a: sa });
          g.text('× N layers', sx + 6, 290, { size: 13, color: T.amber, a: sa });
        }
      },
    });
  };

  root.Labs = root.Labs || {};
  root.Labs.explainers = ex;
})(window);
