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
      <div class="ex-cap" aria-live="polite"><small class="ex-part"></small><b></b><p></p></div>
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
      cap.querySelector('.ex-part').textContent = st.part || ''; cap.querySelector('b').textContent = st.t; cap.querySelector('p').innerHTML = st.d;
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

  // ================================================================== CNN (in depth)
  ex.cnn = el => {
    const IMG = ['00000000', '01111110', '00000110', '00001100', '00011000', '00110000', '00110000', '00000000'].map(r => [...r].map(Number));
    const FV = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
    const FH = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
    const FD = [[-1, -1, 2], [-1, 2, -1], [2, -1, -1]];
    const conv = (I, F, st = 1, pad = 0) => {
      const n = I.length + 2 * pad, k = F.length, o = Math.floor((n - k) / st) + 1;
      const at = (i, j) => (i < pad || j < pad || i >= I.length + pad || j >= I.length + pad ? 0 : I[i - pad][j - pad]);
      return Array.from({ length: o }, (_, i) => Array.from({ length: o }, (_, j) => { let s = 0; for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) s += at(i * st + a, j * st + b) * F[a][b]; return s; }));
    };
    const relu = M => M.map(r => r.map(v => Math.max(0, v)));
    const pool = M => Array.from({ length: M.length >> 1 }, (_, i) => Array.from({ length: M.length >> 1 }, (_, j) => Math.max(M[2 * i][2 * j], M[2 * i + 1][2 * j], M[2 * i][2 * j + 1], M[2 * i + 1][2 * j + 1])));
    const FM = conv(IMG, FV), FM2 = conv(IMG, FV, 2), FMP = conv(IMG, FV, 1, 1), RL = relu(FM), PL = pool(RL);
    const MH = conv(IMG, FH), MD = conv(IMG, FD);
    // the patch used for the one-by-one walkthrough: strongest positive response
    let best = [0, 0]; FM.forEach((r, i) => r.forEach((v, j) => { if (v > FM[best[0]][best[1]]) best = [i, j]; }));
    const [BR, BC] = best;
    const fmt = v => (v === 0 ? '0' : v > 0 ? `+${v}` : `−${-v}`);
    const sgn = v => (v < 0 ? `(−${-v})` : String(v));

    // draw a matrix as rounded cells
    const grid = (g, M, x, y, cs, o = {}) => {
      const a = o.a ?? 1, scale = o.scale || Math.max(1, ...M.flat().map(Math.abs));
      M.forEach((row, i) => row.forEach((v, j) => {
        let fill = o.fill ? o.fill(v, i, j) : o.binary ? (v ? alpha(T.violet2, 0.85) : 'rgba(255,255,255,0.05)') : v === 0 ? 'rgba(255,255,255,0.05)' : g.cellColor(v / scale);
        if (o.hide && o.hide(i, j)) fill = 'rgba(255,255,255,0.03)';
        g.rr(x + j * cs + 1, y + i * cs + 1, cs - 2, cs - 2, Math.min(4, cs / 6), { fill, a });
        if (o.text !== false && !(o.hide && o.hide(i, j))) g.text(o.label ? o.label(v, i, j) : (o.binary ? String(v) : fmt(v)), x + j * cs + cs / 2, y + i * cs + cs / 2 + 1, { size: o.size || Math.max(8, Math.min(13, cs * 0.42)), color: o.binary && v ? '#14121f' : T.ink, a: a * (o.textA ?? 1) });
      }));
    };
    const frame = (g, x, y, cs, r, c, k, color = T.amber, a = 1) => g.rr(x + c * cs - 1, y + r * cs - 1, cs * k + 2, cs * k + 2, 5, { stroke: color, w: 2.3, a });
    const label = (g, s, x, y, a = 1) => g.text(s, x, y, { size: 12, color: T.muted, a });
    const note = (g, lines, x, y, a = 1, o = {}) => lines.forEach((l, i) => g.text(l, x, y + i * (o.lh || 20), { size: o.size || 13, color: o.color || T.soft, align: 'left', a, sans: !o.mono }));

    const steps = [
      { part: 'Part 1 · The input', t: 'An image is a grid of brightness values', dur: 5200,
        d: 'A grayscale image is a table of numbers, one per pixel. Cameras store 0 (black) to 255 (white); before training we usually divide by 255 so every value is between 0 and 1. This tiny 8×8 “7” has shape <strong>8 × 8 × 1</strong>: height × width × channels.' },
      { part: 'Part 1 · The input', t: 'Colour images have three channels', dur: 4400,
        d: 'A colour image stacks three such grids: red, green and blue intensity for every pixel. Its shape is <strong>H × W × 3</strong>. Everything a CNN does works on these stacks, which deeper layers call <em>channels</em> or <em>feature maps</em>.' },
      { part: 'Part 2 · One convolution', t: 'A filter is a small grid of learnable weights', dur: 4400,
        d: 'This 3×3 filter (also called a kernel) has 9 weights plus one bias. Negative on the left, positive on the right: it will produce a big number wherever the image goes from dark (left) to bright (right), a <strong>vertical edge</strong>. In a trained CNN nobody designs these weights; they are learned.' },
      { part: 'Part 2 · One convolution', t: 'Multiply each pixel by the weight on top of it', dur: 9000,
        d: 'Place the filter on a 3×3 patch of the image. Take the pixel under each weight, multiply the two, and keep a running total. Nine multiplications, one sum: this is a <strong>dot product</strong> between the patch and the filter.' },
      { part: 'Part 2 · One convolution', t: 'Add the bias and write one output pixel', dur: 4200,
        d: 'output = Σ (pixel × weight) + bias. The bias (0 here) shifts how easily the filter “fires”. The result becomes one pixel of a new image called a <strong>feature map</strong>, at the same relative position as the patch.' },
      { part: 'Part 2 · One convolution', t: 'Slide the filter over every position', dur: 7600,
        d: 'Move one pixel at a time (stride 1) and repeat. The <strong>same 9 weights</strong> are used everywhere (weight sharing), so a vertical edge is detected wherever it appears. An 8×8 image and a 3×3 filter give 6×6 positions: output size = (8 − 3) / 1 + 1 = 6.' },
      { part: 'Part 3 · Stride and padding', t: 'Stride 2: jump two pixels at a time', dur: 6400,
        d: 'With <strong>stride 2</strong> the filter skips every other position, so there are only 3 × 3 positions: ⌊(8 − 3) / 2⌋ + 1 = 3. The feature map is about half as wide and half as tall, which saves computation and downsamples the image.' },
      { part: 'Part 3 · Stride and padding', t: 'Padding: add a border of zeros', dur: 7200,
        d: 'Add one ring of zeros around the image (<strong>padding = 1</strong>). Now the filter can also centre on edge pixels and the output keeps the input size: (8 + 2·1 − 3) / 1 + 1 = 8. This is called “same” padding; without it (“valid”) every layer shrinks the image. General rule: <strong>output = ⌊(n + 2p − k) / s⌋ + 1</strong>.' },
      { part: 'Part 4 · Filters and channels', t: 'Several filters give several feature maps', dur: 6000,
        d: 'One filter finds one kind of pattern. A layer uses many: here vertical, horizontal and diagonal edge filters. Each produces its own 6×6 map, and the maps are stacked into a 6 × 6 × <strong>3</strong> output. The number of filters is the number of output channels.' },
      { part: 'Part 4 · Filters and channels', t: 'On multi-channel input, a filter has one slice per channel', dur: 6400,
        d: 'If the input has 3 channels, each filter is 3 × 3 × <strong>3</strong>: one 3×3 slice per channel. All 27 products are added together (plus one bias) into a <em>single</em> number. So a layer with 16 such filters has 16 × (27 + 1) = 448 parameters, and outputs 16 channels.' },
      { part: 'Part 5 · Non-linearity and pooling', t: 'ReLU: keep the positive evidence', dur: 5200,
        d: 'After convolution, every value goes through ReLU: max(0, x). Negative responses (here: bright-to-dark edges) become 0. This non-linearity is essential: without it, stacking convolutions would be no more powerful than a single one.' },
      { part: 'Part 5 · Non-linearity and pooling', t: 'Max-pooling: keep the strongest value in each window', dur: 7000,
        d: 'Split the map into 2×2 windows and keep the maximum of each (stride 2, no overlap). 6×6 becomes 3×3. The exact position inside each window is forgotten, which makes the network tolerant to small shifts. Average pooling would keep the mean instead.' },
      { part: 'Part 6 · Going deeper', t: 'Deeper layers see larger parts of the image', dur: 6400,
        d: 'A neuron in layer 2 looks at a 3×3 patch of layer 1, and each of those looked at a 3×3 patch of the image. So it depends on a 5×5 region of the input: its <strong>receptive field</strong>. With more layers and pooling, late neurons see whole objects, which is why depth turns edges into shapes into digits.' },
      { part: 'Part 6 · Going deeper', t: 'Flatten, combine, and classify', dur: 6800,
        d: 'The final feature maps are unrolled into one vector (<strong>flatten</strong>), a fully connected layer combines evidence from all positions, and a last layer produces one score per class. <strong>Softmax</strong> turns the scores into probabilities that sum to 1. (Probabilities shown are illustrative.)' },
      { part: 'Part 6 · Going deeper', t: 'How the filters are learned', dur: 7400,
        d: 'Training starts with random filters. For each image, the loss measures how wrong the prediction is; backpropagation computes how the loss changes with each weight: <strong>∂L/∂w = Σ (error at each output pixel × input pixel under w)</strong>. Gradient descent nudges every weight downhill, and edge detectors emerge on their own.' },
      { part: 'Part 6 · Going deeper', t: 'The whole network', dur: 6000,
        d: 'Input → [convolution → ReLU → pooling] × a few → flatten → dense → softmax. Early layers find edges, middle layers combine them into strokes and corners, late layers recognise the digit. The architecture diagram above lets you inspect each of these parts.' },
    ];

    player(el, {
      title: 'Convolution in depth, step by step', steps,
      draw(g, s, p, time) {
        const P = ease(clamp01(p * 1.4));
        // ---------- part 1
        if (s === 0) {
          const cs = 30, x = 34, y = 64;
          label(g, 'pixel values', x + 120, y - 20);
          grid(g, IMG, x, y, cs, { binary: true, size: 10, label: v => (p < 0.45 ? (v ? '255' : '0') : (v ? '1.0' : '0')) });
          const a = ease(clamp01((p - 0.1) * 3));
          note(g, ['• one number per pixel', '• camera range: 0 (black) … 255 (white)', '• divide by 255 → 0 … 1', '', 'shape = 8 × 8 × 1'], 330, 110, a, { lh: 26 });
          g.text(p < 0.45 ? 'raw 0–255' : 'normalised ÷ 255', x + 120, y + 8 * cs + 20, { size: 12, color: T.amber, a });
          return;
        }
        if (s === 1) {
          const cs = 22, cols = [T.pink, T.green, '#7aa2ff'], names = ['red', 'green', 'blue'];
          for (let c = 2; c >= 0; c--) {
            const off = ease(clamp01(p * 2)) * c * 30;
            const x = 60 + off, y = 70 + off * 0.7;
            grid(g, IMG, x, y, cs, { text: false, fill: v => alpha(cols[c], v ? 0.75 : 0.12), a: 1 });
            g.text(names[c], x + 8 * cs + 22, y + 10, { size: 11, color: cols[c], a: ease(clamp01(p * 2 - 0.6)) });
          }
          note(g, ['three grids, one per colour', 'shape = 8 × 8 × 3', '', 'later layers have many more', 'channels: 16, 32, 64 …'], 400, 130, ease(clamp01(p * 2 - 0.4)), { lh: 24 });
          return;
        }
        // ---------- part 2 layout
        const IX = 24, IY = 70, IC = 24, FX = 248, FY = 108, FC = 36, MX = 430, MY = 70, MC = 30;
        if (s === 2) {
          grid(g, IMG, IX, IY, IC, { binary: true, size: 10 });
          label(g, 'input', IX + 96, IY - 20);
          const a = ease(clamp01(p * 2));
          label(g, 'filter (3×3)', FX + 54, FY - 20, a);
          grid(g, FV, FX, FY, FC, { a, size: 14, scale: 1.4 });
          g.text('+ bias b = 0', FX + 54, FY + 3 * FC + 20, { size: 12, color: T.muted, a });
          const b = ease(clamp01(p * 2 - 0.8));
          note(g, ['left column  −1', 'middle       0', 'right column +1', '', '→ big output on', '  dark | bright edges'], 410, 120, b, { mono: true, size: 13, lh: 22 });
          return;
        }
        if (s === 3 || s === 4) {
          grid(g, IMG, IX, IY, IC, { binary: true, size: 10 });
          label(g, 'input', IX + 96, IY - 20);
          frame(g, IX, IY, IC, BR, BC, 3);
          label(g, 'filter', FX + 54, FY - 20);
          grid(g, FV, FX, FY, FC, { size: 14, scale: 1.4 });
          const k = s === 3 ? Math.min(8, Math.floor(p * 10)) : 8;
          let run = 0; const lines = [];
          for (let q = 0; q <= k; q++) {
            const a = Math.floor(q / 3), b = q % 3, v = IMG[BR + a][BC + b], w = FV[a][b];
            run += v * w; lines.push(`${v} × ${sgn(w)} = ${fmt(v * w)}`);
          }
          if (s === 3) {
            const a = Math.floor(k / 3), b = k % 3;
            const ix = IX + (BC + b) * IC + IC / 2, iy = IY + (BR + a) * IC + IC / 2, fx = FX + b * FC + FC / 2, fy = FY + a * FC + FC / 2;
            g.ring(ix, iy, IC / 2, T.ink, 2); g.ring(fx, fy, FC / 2 - 1, T.ink, 2);
            g.c.beginPath(); g.c.moveTo(ix, iy); g.c.quadraticCurveTo((ix + fx) / 2, Math.min(iy, fy) - 50, fx, fy); g.c.strokeStyle = T.amber; g.c.lineWidth = 1.6; g.c.stroke();
            lines.forEach((l, i) => g.text(l, 420, 74 + i * 22, { size: 13, align: 'left', color: i === lines.length - 1 ? T.amber : T.soft }));
            g.text(`running sum = ${fmt(run)}`, 420, 74 + 9 * 22 + 12, { size: 15, align: 'left', color: T.cyan, weight: 500 });
          } else {
            const t = ease(clamp01(p / 0.55));
            g.text(`Σ = ${fmt(run)}`, FX + 54, FY + 3 * FC + 28, { size: 16, color: T.cyan });
            g.text(`+ b (0) = ${fmt(run)}`, FX + 54, FY + 3 * FC + 50, { size: 13, color: T.muted });
            label(g, 'feature map', MX + 90, MY - 20);
            grid(g, FM, MX, MY, MC, { hide: (i, j) => !(i === BR && j === BC && p > 0.55), size: 12 });
            frame(g, MX, MY, MC, BR, BC, 1, T.amber, 0.8);
            if (p < 0.56) { const x = lerp(FX + 54, MX + BC * MC + MC / 2, t), y = lerp(FY + 3 * FC + 28, MY + BR * MC + MC / 2, t); g.dot(x, y, 7, T.cyan); g.glow(x, y, 28, T.cyan); }
            g.line([[IX + (BC + 3) * IC + 4, IY + BR * IC + 4], [MX + BC * MC - 4, MY + BR * MC + 4]], { color: T.amber, a: 0.25, dash: [3, 5] });
            g.text('same relative position', MX + 90, MY + 6 * MC + 22, { size: 11, color: T.dim });
          }
          return;
        }
        if (s === 5) {
          const pos = Math.min(35, Math.floor(p * 37)), pr = Math.floor(pos / 6), pc = pos % 6;
          grid(g, IMG, IX, IY, IC, { binary: true, size: 10 });
          label(g, 'input 8×8', IX + 96, IY - 20);
          frame(g, IX, IY, IC, pr, pc, 3);
          label(g, 'filter', FX + 54, FY - 20);
          grid(g, FV, FX, FY, FC, { size: 14, scale: 1.4 });
          label(g, 'feature map 6×6', MX + 90, MY - 20);
          grid(g, FM, MX, MY, MC, { hide: (i, j) => i * 6 + j > pos, size: 12 });
          frame(g, MX, MY, MC, pr, pc, 1);
          g.text('(8 − 3) / 1 + 1 = 6', MX + 90, MY + 6 * MC + 24, { size: 13, color: T.amber });
          g.text(`position ${pos + 1} of 36`, FX + 54, FY + 3 * FC + 26, { size: 12, color: T.muted });
          return;
        }
        // ---------- part 3
        if (s === 6) {
          const pos = Math.min(8, Math.floor(p * 10)), pr = Math.floor(pos / 3) * 2, pc = (pos % 3) * 2;
          grid(g, IMG, IX, IY, IC, { binary: true, size: 10 });
          label(g, 'input 8×8', IX + 96, IY - 20);
          for (let q = 0; q < pos; q++) frame(g, IX, IY, IC, Math.floor(q / 3) * 2, (q % 3) * 2, 3, T.amber, 0.18);
          frame(g, IX, IY, IC, pr, pc, 3);
          if (pos % 3) g.text('→ 2', IX + (pc - 1) * IC + 4, IY + pr * IC - 8, { size: 11, color: T.amber });
          label(g, 'filter, stride 2', FX + 54, FY - 20);
          grid(g, FV, FX, FY, FC, { size: 14, scale: 1.4 });
          const MC2 = 44;
          label(g, 'feature map 3×3', MX + 66, MY - 20);
          grid(g, FM2, MX, MY + 10, MC2, { hide: (i, j) => i * 3 + j > pos, size: 13 });
          frame(g, MX, MY + 10, MC2, pr / 2, pc / 2, 1);
          g.text('⌊(8 − 3) / 2⌋ + 1 = 3', MX + 66, MY + 3 * MC2 + 40, { size: 13, color: T.amber });
          g.text('stride 1 would give 6 × 6', MX + 66, MY + 3 * MC2 + 62, { size: 12, color: T.dim });
          return;
        }
        if (s === 7) {
          const pos = Math.min(63, Math.floor(p * 66)), pr = Math.floor(pos / 8), pc = pos % 8;
          const PC = 20, PXX = 22, PY = 66;
          label(g, 'input with padding = 1 (10×10)', PXX + 100, PY - 20);
          const padded = Array.from({ length: 10 }, (_, i) => Array.from({ length: 10 }, (_, j) => (i === 0 || j === 0 || i === 9 || j === 9 ? -1 : IMG[i - 1][j - 1])));
          padded.forEach((row, i) => row.forEach((v, j) => {
            const border = v < 0;
            g.rr(PXX + j * PC + 1, PY + i * PC + 1, PC - 2, PC - 2, 3, { fill: border ? 'rgba(255,255,255,0.02)' : v ? alpha(T.violet2, 0.85) : 'rgba(255,255,255,0.06)', stroke: border ? 'rgba(255,255,255,0.22)' : null, w: 1 });
            if (border) g.text('0', PXX + j * PC + PC / 2, PY + i * PC + PC / 2 + 1, { size: 9, color: T.dim });
          }));
          frame(g, PXX, PY, PC, pr, pc, 3);
          label(g, 'filter', 290, 100);
          grid(g, FV, 254, 118, 24, { size: 11, scale: 1.4 });
          const OC = 22, OX = 400, OY = 66;
          label(g, 'output 8×8 (same size)', OX + 88, OY - 20);
          grid(g, FMP, OX, OY, OC, { hide: (i, j) => i * 8 + j > pos, size: 9 });
          frame(g, OX, OY, OC, pr, pc, 1);
          g.text('(8 + 2·1 − 3) / 1 + 1 = 8', OX + 88, OY + 8 * OC + 24, { size: 13, color: T.amber });
          g.text('out = ⌊(n + 2p − k) / s⌋ + 1', 288, 300, { size: 13, color: T.cyan });
          return;
        }
        // ---------- part 4
        if (s === 8) {
          const cs = 16;
          grid(g, IMG, 20, 140, cs, { binary: true, text: false });
          label(g, 'input', 84, 124);
          const rows = [[FV, FM, 'vertical'], [FH, MH, 'horizontal'], [FD, MD, 'diagonal']];
          rows.forEach(([F, M, name], r) => {
            const a = ease(clamp01(p * 2.2 - r * 0.45)), y = 46 + r * 116;
            g.line([[152, 204], [190, y + 30]], { color: 'rgba(255,255,255,0.25)', a, arrow: true });
            grid(g, F, 194, y + 6, 16, { a, size: 8, scale: 2 });
            g.text(name, 218, y - 2, { size: 11, color: T.muted, a });
            g.line([[248, y + 30], [278, y + 30]], { color: 'rgba(255,255,255,0.35)', a, arrow: true });
            grid(g, M, 284, y, 15, { a, text: false, scale: 3 });
          });
          const sa = ease(clamp01(p * 2 - 1.2));
          [MD, MH, FM].forEach((M, k) => grid(g, M, 470 + k * 16, 120 - k * 14, 14, { a: sa, text: false, scale: 3 }));
          g.line([[378, 204], [462, 190]], { color: 'rgba(255,255,255,0.35)', a: sa, arrow: true });
          g.text('stacked: 6 × 6 × 3', 534, 250, { size: 13, color: T.amber, a: sa });
          g.text('3 filters → 3 channels', 534, 272, { size: 12, color: T.muted, a: sa });
          return;
        }
        if (s === 9) {
          const cols = [T.pink, T.green, '#7aa2ff'], wts = [1, 0.6, 0.3], cs = 15;
          for (let c = 2; c >= 0; c--) {
            const x = 30 + c * 18, y = 80 + c * 22;
            grid(g, IMG, x, y, cs, { text: false, fill: v => alpha(cols[c], v ? 0.35 + 0.5 * wts[c] : 0.1) });
            frame(g, x, y, cs, BR, BC, 3, T.amber, 0.9);
          }
          label(g, 'input: 8 × 8 × 3', 100, 60);
          for (let c = 2; c >= 0; c--) {
            const x = 250 + c * 16, y = 96 + c * 26;
            FV.forEach((row, i) => row.forEach((v, j) => g.rr(x + j * 22 + 1, y + i * 22 + 1, 20, 20, 3, { fill: alpha(cols[c], v > 0 ? 0.8 : v < 0 ? 0.35 : 0.12) })));
          }
          label(g, 'filter: 3 × 3 × 3', 314, 70);
          const t = ease(clamp01(p * 1.8));
          [0, 1, 2].forEach(c => g.flow([[130 + c * 18, 120 + c * 22], [240 + c * 16, 120 + c * 26], [480, 200]], time + c * 300, { n: 3, color: cols[c], speed: 0.0005 }));
          g.dot(480, 200, 22, '#0d0c14'); g.ring(480, 200, 22, T.cyan, 2); g.text('Σ', 480, 201, { size: 20, color: T.cyan, sans: true });
          g.text('27 products + bias', 480, 238, { size: 12, color: T.muted, a: t });
          g.line([[504, 200], [566, 200]], { color: T.cyan, arrow: true, a: t });
          g.rr(572, 186, 28, 28, 5, { fill: alpha(T.cyan, 0.7), a: t });
          g.text('1 number', 586, 230, { size: 11, color: T.muted, a: t });
          g.text('params per filter = 3·3·3 + 1 = 28', 320, 330, { size: 13, color: T.amber, a: ease(clamp01(p * 2 - 0.8)) });
          g.text('16 filters → 16 × 28 = 448 params, 16 output channels', 320, 354, { size: 12, color: T.muted, a: ease(clamp01(p * 2 - 1)) });
          return;
        }
        // ---------- part 5
        if (s === 10) {
          const cs = 32, x1 = 30, x2 = 410, y = 74, t = ease(clamp01((p - 0.25) * 1.6));
          label(g, 'feature map (before)', x1 + 96, y - 20);
          grid(g, FM, x1, y, cs, { scale: 3 });
          label(g, 'after ReLU', x2 + 96, y - 20);
          grid(g, FM.map(r => r.map(v => (v < 0 ? v * (1 - t) : v))), x2, y, cs, { scale: 3, label: v => (Math.abs(v) < 0.05 ? '0' : fmt(Math.round(v))) });
          // relu graph
          const gx = 270, gy = 190, sz = 46;
          g.line([[gx - sz, gy], [gx + sz, gy]], { color: 'rgba(255,255,255,0.25)' }); g.line([[gx, gy + sz], [gx, gy - sz]], { color: 'rgba(255,255,255,0.25)' });
          g.line([[gx - sz, gy], [gx, gy], [gx + sz, gy - sz]], { color: T.amber, w: 2.4 });
          g.text('max(0, x)', gx, gy + sz + 18, { size: 12, color: T.amber });
          g.line([[x1 + 6 * cs + 8, y + 96], [gx - sz - 6, gy - 10]], { color: 'rgba(255,255,255,0.3)', arrow: true }); g.line([[gx + sz + 6, gy - 10], [x2 - 8, y + 96]], { color: 'rgba(255,255,255,0.3)', arrow: true });
          return;
        }
        if (s === 11) {
          const cs = 34, x1 = 30, y = 66, PC2 = 52, x2 = 440, y2 = 90;
          const win = Math.min(8, Math.floor(p * 10)), wi = Math.floor(win / 3), wj = win % 3;
          label(g, 'after ReLU (6×6)', x1 + 102, y - 18);
          grid(g, RL, x1, y, cs, { scale: 3 });
          for (let q = 0; q < 9; q++) frame(g, x1, y, cs, Math.floor(q / 3) * 2, (q % 3) * 2, 2, 'rgba(255,255,255,0.18)', 1);
          frame(g, x1, y, cs, wi * 2, wj * 2, 2);
          label(g, 'max-pooled (3×3)', x2 + 78, y2 - 22);
          grid(g, PL, x2, y2, PC2, { hide: (i, j) => i * 3 + j > win, scale: 3, size: 15 });
          frame(g, x2, y2, PC2, wi, wj, 1);
          const vals = [RL[2 * wi][2 * wj], RL[2 * wi][2 * wj + 1], RL[2 * wi + 1][2 * wj], RL[2 * wi + 1][2 * wj + 1]];
          g.text(`max(${vals.join(', ')}) = ${Math.max(...vals)}`, 320, 316, { size: 14, color: T.amber });
          g.text(`average pooling would give ${(vals.reduce((a, b) => a + b, 0) / 4).toFixed(2)}`, 320, 340, { size: 12, color: T.dim });
          g.line([[x1 + (wj * 2 + 2) * cs + 4, y + (wi * 2 + 1) * cs], [x2 - 6, y2 + wi * PC2 + PC2 / 2]], { color: T.amber, a: 0.5, dash: [3, 4], arrow: true });
          return;
        }
        // ---------- part 6
        if (s === 12) {
          const cs = 21, L0 = [24, 90], L1 = [250, 111], L2 = [456, 132];
          const a1 = ease(clamp01(p * 2)), a2 = ease(clamp01(p * 2 - 0.6));
          label(g, 'input 8×8', L0[0] + 84, L0[1] - 20); label(g, 'layer 1: 6×6', L1[0] + 63, L1[1] - 20); label(g, 'layer 2: 4×4', L2[0] + 42, L2[1] - 20);
          grid(g, IMG, L0[0], L0[1], cs, { binary: true, text: false });
          grid(g, FM, L1[0], L1[1], cs, { text: false, scale: 3 });
          grid(g, conv(relu(FM), [[0, 1, 0], [1, 1, 1], [0, 1, 0]]), L2[0], L2[1], cs, { text: false, scale: 6 });
          frame(g, L2[0], L2[1], cs, 1, 1, 1, T.amber);
          g.glow(L2[0] + 1.5 * cs, L2[1] + 1.5 * cs, 34, T.amber);
          frame(g, L1[0], L1[1], cs, 1, 1, 3, T.amber, a1);
          [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v]) => g.line([[L2[0] + (1 + u) * cs, L2[1] + (1 + v) * cs], [L1[0] + (1 + 3 * u) * cs, L1[1] + (1 + 3 * v) * cs]], { color: T.amber, a: a1 * 0.45 }));
          frame(g, L0[0], L0[1], cs, 1, 1, 5, T.cyan, a2);
          [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v]) => g.line([[L1[0] + (1 + 3 * u) * cs, L1[1] + (1 + 3 * v) * cs], [L0[0] + (1 + 5 * u) * cs, L0[1] + (1 + 5 * v) * cs]], { color: T.cyan, a: a2 * 0.4 }));
          g.text('1 neuron  ←  3×3 in layer 1  ←  5×5 in the image', 320, 330, { size: 13, color: T.soft, a: a2 });
          g.text('receptive field grows by (k − 1) per 3×3 layer, and doubles at each pooling', 320, 354, { size: 11, color: T.dim, a: a2 });
          return;
        }
        if (s === 13) {
          const maps = [relu(MH), RL, relu(MD)].map(pool);
          const pa = ease(clamp01(p * 2.5)), la = ease(clamp01(p * 2.5 - 0.9)), ba = ease(clamp01(p * 2.5 - 1.5));
          maps.forEach((M, k) => { grid(g, M, 26, 60 + k * 100, 22, { text: false, scale: 3 }); });
          label(g, '3 pooled maps', 59, 40);
          // flatten vector
          const VX = 170, VY = 52, VC = 10.5;
          const flat = maps.flatMap(M => M.flat());
          flat.forEach((v, i) => g.rr(VX, VY + i * VC, 18, VC - 1.5, 2, { fill: v ? g.cellColor(v / 3) : 'rgba(255,255,255,0.06)', a: pa }));
          label(g, 'flatten: 27', VX + 9, VY - 14, pa);
          g.line([[100, 200], [VX - 8, 200]], { color: 'rgba(255,255,255,0.35)', arrow: true, a: pa });
          // dense nodes
          const HX = 320, hid = 6;
          for (let h = 0; h < hid; h++) {
            const hy = 80 + h * 44;
            for (let i = 0; i < flat.length; i += 3) g.line([[VX + 18, VY + i * VC + 4], [HX - 10, hy]], { color: alpha(T.violet2, 0.12), a: la, w: 0.8 });
            g.dot(HX, hy, 9, alpha(T.violet, 0.5), la); g.ring(HX, hy, 9, T.violet2, 1.2, la);
          }
          label(g, 'dense', HX, 56, la);
          // outputs
          const probs = [0.01, 0.02, 0.03, 0.04, 0.01, 0.02, 0.01, 0.80, 0.03, 0.03], OX = 450;
          probs.forEach((pr, k) => {
            const oy = 56 + k * 29;
            for (let h = 0; h < hid; h++) g.line([[HX + 10, 80 + h * 44], [OX - 26, oy + 9]], { color: alpha(T.amber, 0.1), a: ba, w: 0.8 });
            g.text(String(k), OX - 14, oy + 10, { size: 12, color: k === 7 ? T.amber : T.muted, a: ba });
            g.rr(OX, oy + 2, Math.max(2, pr * 150 * ba), 16, 3, { fill: alpha(T.amber, k === 7 ? 0.95 : 0.35) });
            if (ba > 0.5) g.text(`${Math.round(pr * 100)}%`, OX + pr * 150 + 22, oy + 10, { size: 11, color: k === 7 ? T.amber : T.dim, a: ba });
          });
          label(g, 'softmax', OX + 50, 36, ba);
          return;
        }
        if (s === 14) {
          const t = ease(clamp01(p * 1.2));
          const R0 = [[0.3, -0.6, 0.1], [0.5, 0.2, -0.4], [-0.2, 0.7, 0.3]];
          const W = R0.map((r, i) => r.map((v, j) => lerp(v, FV[i][j], t)));
          label(g, 'filter weights', 104, 64);
          grid(g, W, 50, 84, 36, { scale: 1.1, label: v => v.toFixed(1).replace('-', '−'), size: 12 });
          g.text(t < 0.15 ? 'random at the start' : t > 0.9 ? 'a vertical-edge detector' : 'being updated…', 104, 210, { size: 12, color: T.amber });
          // loss curve
          const cx0 = 280, cy0 = 70, cw = 320, ch = 150;
          g.line([[cx0, cy0], [cx0, cy0 + ch], [cx0 + cw, cy0 + ch]], { color: 'rgba(255,255,255,0.25)' });
          const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; if (u > t) break; pts.push([cx0 + u * cw, cy0 + ch - (ch - 12) * (0.12 + 0.88 * Math.exp(-4.2 * u) + 0.03 * Math.sin(i * 1.7))]); }
          if (pts.length > 1) g.line(pts, { color: T.pink, w: 2.2 });
          g.text('loss', cx0 - 4, cy0 - 10, { size: 11, color: T.pink, align: 'left' });
          g.text('training steps →', cx0 + cw, cy0 + ch + 16, { size: 11, color: T.dim, align: 'right' });
          note(g, ['∂L/∂w = Σ (error at output pixel × input pixel under w)', 'w ← w − η · ∂L/∂w'], 50, 280, ease(clamp01(p * 2 - 0.3)), { mono: true, size: 13, lh: 28 });
          g.text('the same weight is used at every position, so its gradient adds up contributions from all 36 positions', 50, 344, { size: 11, color: T.dim, align: 'left', a: ease(clamp01(p * 2 - 0.6)) });
          return;
        }
        if (s === 15) {
          const y0 = 170;
          const stages = [
            { x: 46, label: 'image', sub: '28×28×1', draw: (x, a) => g.rr(x - 30, y0 - 30, 60, 60, 6, { fill: alpha(T.violet2, 0.5), stroke: T.violet2, a }) },
            { x: 160, label: 'conv + ReLU', sub: 'edges', draw: (x, a) => { for (let k = 3; k >= 0; k--) g.rr(x - 26 + k * 7, y0 - 30 - k * 7, 52, 52, 5, { fill: alpha(T.cyan, 0.18 + 0.1 * k), stroke: alpha(T.cyan, 0.8), a }); } },
            { x: 272, label: 'pool + conv', sub: 'strokes', draw: (x, a) => { for (let k = 5; k >= 0; k--) g.rr(x - 18 + k * 6, y0 - 22 - k * 6, 36, 36, 4, { fill: alpha(T.cyan, 0.14 + 0.08 * k), stroke: alpha(T.cyan, 0.8), a }); } },
            { x: 384, label: 'pool + conv', sub: 'parts', draw: (x, a) => { for (let k = 7; k >= 0; k--) g.rr(x - 11 + k * 5, y0 - 14 - k * 5, 22, 22, 3, { fill: alpha(T.green, 0.14 + 0.07 * k), stroke: alpha(T.green, 0.8), a }); } },
            { x: 494, label: 'flatten + dense', sub: 'combine', draw: (x, a) => { for (let k = 0; k < 10; k++) g.rr(x - 6, y0 - 50 + k * 10, 12, 8, 2, { fill: alpha(T.amber, 0.25 + (k === 7 ? 0.6 : 0)), a }); } },
            { x: 590, label: 'softmax', sub: '“7”', draw: (x, a) => g.text('7', x, y0, { size: 36, sans: true, weight: 600, color: T.amber, a }) },
          ];
          stages.forEach((st, i) => {
            const a = ease(clamp01(p * 2.4 - i * 0.22));
            st.draw(st.x, a);
            g.text(st.label, st.x, y0 + 64, { size: 12, color: T.soft, a });
            g.text(st.sub, st.x, y0 + 82, { size: 11, color: T.dim, a });
            if (i < stages.length - 1) g.line([[st.x + 40, y0], [stages[i + 1].x - 36, y0]], { color: 'rgba(255,255,255,0.4)', a, arrow: true });
          });
          g.flow([[86, y0], [556, y0]], time, { n: 6, color: T.amber, speed: 0.00025 });
          g.text('spatial size shrinks, channels grow: from “where” to “what”', 320, 320, { size: 13, color: T.muted, a: ease(clamp01(p * 2 - 1)) });
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
