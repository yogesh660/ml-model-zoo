/**
 * ML Model Zoo - Interactive Visual Simulation Engine
 * Powers live educational laboratories for machine learning models and concepts.
 * Zero-dependency, responsive HTML5 Canvas & SVG visualizations.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MLVisualLabs = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const THEME = {
    bg: '#09090e',
    panel: '#0e0e13',
    line: 'rgba(255, 255, 255, 0.1)',
    ink: '#f5f5f7',
    muted: '#9a9aa5',
    dim: '#75757f',
    violet: '#8c7cff',
    violetAlpha: 'rgba(140, 124, 255, 0.25)',
    cyan: '#56d9ff',
    cyanAlpha: 'rgba(86, 217, 255, 0.25)',
    green: '#74df9b',
    greenAlpha: 'rgba(116, 223, 155, 0.25)',
    amber: '#f59e0b',
    amberAlpha: 'rgba(245, 158, 11, 0.25)',
    red: '#ef4444',
    redAlpha: 'rgba(239, 68, 68, 0.25)'
  };

  // Helper to setup retina-sharp canvas
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 600;
    const height = rect.height || canvas.height || 360;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
  }

  // =========================================================================
  // 1. REGRESSION & RESIDUAL LOSS LABORATORY
  // =========================================================================
  function initRegressionLab(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isRegularized = options.regularized || false;

    container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Laboratory</div>
          <h3 class="lab-title">${isRegularized ? 'Regularized Shrinkage & Cost Surface' : 'Ordinary Least Squares & Residual Optimization'}</h3>
          <p class="lab-desc">Drag the slope and intercept sliders or click "Run Gradient Descent" to watch the optimization path converge to the minimum of the residual sum of squares.</p>
        </div>

        <div class="lab-canvas-grid">
          <div class="canvas-wrap">
            <span class="canvas-tag">Feature Space: Points & Fitted Hyperplane</span>
            <canvas id="${containerId}-data-canvas" height="340" style="width:100%; height:340px;"></canvas>
          </div>
          <div class="canvas-wrap">
            <span class="canvas-tag">Optimization Surface: Parameter Space J(w, b)</span>
            <canvas id="${containerId}-cost-canvas" height="340" style="width:100%; height:340px;"></canvas>
          </div>
        </div>

        <div class="lab-controls">
          <div class="control-group">
            <label>Slope Weight (w): <span id="${containerId}-w-val" class="ctrl-val">1.20</span></label>
            <input type="range" id="${containerId}-w-slider" min="-2.0" max="4.0" step="0.05" value="1.2">
          </div>
          <div class="control-group">
            <label>Intercept Bias (b): <span id="${containerId}-b-val" class="ctrl-val">1.00</span></label>
            <input type="range" id="${containerId}-b-slider" min="-3.0" max="5.0" step="0.1" value="1.0">
          </div>
          ${isRegularized ? `
          <div class="control-group">
            <label>Regularization Penalty (&lambda;): <span id="${containerId}-lambda-val" class="ctrl-val">0.50</span></label>
            <input type="range" id="${containerId}-lambda-slider" min="0.0" max="5.0" step="0.1" value="0.5">
          </div>
          ` : ''}
          <div class="btn-group">
            <button class="lab-btn primary" id="${containerId}-btn-optimal">Solve Closed-Form (OLS)</button>
            <button class="lab-btn secondary" id="${containerId}-btn-gd">Run Gradient Descent Step</button>
            <button class="lab-btn ghost" id="${containerId}-btn-reset">Randomize Dataset</button>
          </div>
        </div>

        <div class="lab-hud">
          <div class="hud-item">
            <span class="hud-label">Mean Squared Error (MSE)</span>
            <span class="hud-val" id="${containerId}-hud-mse">0.000</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Coefficient of Determination (R²)</span>
            <span class="hud-val" id="${containerId}-hud-r2">0.000</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Total Loss J(w, b)</span>
            <span class="hud-val" id="${containerId}-hud-cost">0.000</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Gradient Vector ∇J</span>
            <span class="hud-val" id="${containerId}-hud-grad">[0.00, 0.00]</span>
          </div>
        </div>
      </div>
    `;

    const dataCanvas = document.getElementById(`${containerId}-data-canvas`);
    const costCanvas = document.getElementById(`${containerId}-cost-canvas`);
    const wSlider = document.getElementById(`${containerId}-w-slider`);
    const bSlider = document.getElementById(`${containerId}-b-slider`);
    const lambdaSlider = document.getElementById(`${containerId}-lambda-slider`);
    const wVal = document.getElementById(`${containerId}-w-val`);
    const bVal = document.getElementById(`${containerId}-b-val`);
    const lambdaVal = document.getElementById(`${containerId}-lambda-val`);
    const btnOptimal = document.getElementById(`${containerId}-btn-optimal`);
    const btnGD = document.getElementById(`${containerId}-btn-gd`);
    const btnReset = document.getElementById(`${containerId}-btn-reset`);
    const hudMse = document.getElementById(`${containerId}-hud-mse`);
    const hudR2 = document.getElementById(`${containerId}-hud-r2`);
    const hudCost = document.getElementById(`${containerId}-hud-cost`);
    const hudGrad = document.getElementById(`${containerId}-hud-grad`);

    // State
    let points = [];
    let trueW = 1.8;
    let trueB = 0.8;
    let currentW = parseFloat(wSlider.value);
    let currentB = parseFloat(bSlider.value);
    let currentLambda = lambdaSlider ? parseFloat(lambdaSlider.value) : 0;
    let gdAnimation = null;

    function generatePoints() {
      points = [];
      const n = 28;
      for (let i = 0; i < n; i++) {
        const x = -2.5 + (5.0 * i) / (n - 1) + (Math.random() - 0.5) * 0.2;
        const noise = (Math.random() - 0.5) * 1.6;
        const y = trueW * x + trueB + noise;
        points.push({ x, y });
      }
    }
    generatePoints();

    // Compute stats
    function computeMetrics(w, b, lambda = 0) {
      const n = points.length;
      let sumSq = 0;
      let meanY = 0;
      points.forEach(p => meanY += p.y);
      meanY /= n;

      let totSq = 0;
      let gradW = 0;
      let gradB = 0;

      points.forEach(p => {
        const yHat = w * p.x + b;
        const diff = yHat - p.y;
        sumSq += diff * diff;
        totSq += (p.y - meanY) * (p.y - meanY);
        gradW += diff * p.x;
        gradB += diff;
      });

      const mse = sumSq / n;
      gradW = (2 / n) * gradW + (2 * lambda * w);
      gradB = (2 / n) * gradB;
      const r2 = Math.max(0, 1 - (sumSq / (totSq || 1)));
      const cost = mse + lambda * (w * w);

      return { mse, r2, cost, gradW, gradB };
    }

    // Solve OLS closed form
    function solveOLS(lambda = 0) {
      const n = points.length;
      let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
      points.forEach(p => {
        sumX += p.x;
        sumY += p.y;
        sumXX += p.x * p.x;
        sumXY += p.x * p.y;
      });
      const meanX = sumX / n;
      const meanY = sumY / n;

      // Ridge closed form for 1D: w = sum((x - meanX)*(y - meanY)) / (sum((x - meanX)^2) + n*lambda)
      let num = 0, den = 0;
      points.forEach(p => {
        num += (p.x - meanX) * (p.y - meanY);
        den += (p.x - meanX) * (p.x - meanX);
      });
      const optW = num / (den + n * lambda);
      const optB = meanY - optW * meanX;
      return { w: optW, b: optB };
    }

    function render() {
      // 1. Render Feature Space
      const { ctx: dCtx, width: dW, height: dH } = setupCanvas(dataCanvas);
      dCtx.clearRect(0, 0, dW, dH);

      // Coordinate transforms: x in [-3, 3], y in [-6, 8]
      const minX = -3.5, maxX = 3.5, minY = -6.5, maxY = 8.5;
      const toX = x => ((x - minX) / (maxX - minX)) * dW;
      const toY = y => dH - ((y - minY) / (maxY - minY)) * dH;

      // Grid lines
      dCtx.strokeStyle = THEME.line;
      dCtx.lineWidth = 1;
      for (let gx = -3; gx <= 3; gx++) {
        dCtx.beginPath();
        dCtx.moveTo(toX(gx), 0);
        dCtx.lineTo(toX(gx), dH);
        dCtx.stroke();
      }
      for (let gy = -6; gy <= 8; gy += 2) {
        dCtx.beginPath();
        dCtx.moveTo(0, toY(gy));
        dCtx.lineTo(dW, toY(gy));
        dCtx.stroke();
      }

      // Draw Axes
      dCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      dCtx.lineWidth = 1.5;
      dCtx.beginPath();
      dCtx.moveTo(toX(0), 0);
      dCtx.lineTo(toX(0), dH);
      dCtx.moveTo(0, toY(0));
      dCtx.lineTo(dW, toY(0));
      dCtx.stroke();

      // Draw Residual drops
      points.forEach(p => {
        const yHat = currentW * p.x + currentB;
        const px = toX(p.x);
        const py = toY(p.y);
        const pyHat = toY(yHat);

        dCtx.beginPath();
        dCtx.strokeStyle = p.y >= yHat ? THEME.green : THEME.red;
        dCtx.lineWidth = 1.2;
        dCtx.setLineDash([3, 3]);
        dCtx.moveTo(px, py);
        dCtx.lineTo(px, pyHat);
        dCtx.stroke();
        dCtx.setLineDash([]);
      });

      // Draw Regression Line
      const lineX1 = minX;
      const lineY1 = currentW * lineX1 + currentB;
      const lineX2 = maxX;
      const lineY2 = currentW * lineX2 + currentB;

      dCtx.strokeStyle = THEME.violet;
      dCtx.lineWidth = 2.5;
      dCtx.beginPath();
      dCtx.moveTo(toX(lineX1), toY(lineY1));
      dCtx.lineTo(toX(lineX2), toY(lineY2));
      dCtx.stroke();

      // Draw Data points
      points.forEach(p => {
        dCtx.beginPath();
        dCtx.arc(toX(p.x), toY(p.y), 4.5, 0, Math.PI * 2);
        dCtx.fillStyle = THEME.cyan;
        dCtx.shadowColor = THEME.cyan;
        dCtx.shadowBlur = 6;
        dCtx.fill();
        dCtx.shadowBlur = 0;
        dCtx.strokeStyle = '#070709';
        dCtx.lineWidth = 1;
        dCtx.stroke();
      });

      // 2. Render Cost Surface Contours J(w, b)
      const { ctx: cCtx, width: cW, height: cH } = setupCanvas(costCanvas);
      cCtx.clearRect(0, 0, cW, cH);

      const wMin = -1.5, wMax = 3.5, bMin = -2.5, bMax = 3.5;
      const cToX = w => ((w - wMin) / (wMax - wMin)) * cW;
      const cToY = b => cH - ((b - bMin) / (bMax - bMin)) * cH;

      const opt = solveOLS(currentLambda);
      const optPx = cToX(opt.w);
      const optPy = cToY(opt.b);

      // Draw elliptical loss contours centered at optimal
      for (let r = 1; r <= 8; r++) {
        const radiusX = r * (cW / 14);
        const radiusY = r * (cH / 18);
        cCtx.beginPath();
        cCtx.ellipse(optPx, optPy, radiusX, radiusY, 0.2, 0, Math.PI * 2);
        cCtx.strokeStyle = `rgba(140, 124, 255, ${0.12 + r * 0.03})`;
        cCtx.lineWidth = 1;
        cCtx.stroke();
      }

      // Draw Global Minimum Marker
      cCtx.beginPath();
      cCtx.arc(optPx, optPy, 5, 0, Math.PI * 2);
      cCtx.fillStyle = THEME.green;
      cCtx.shadowColor = THEME.green;
      cCtx.shadowBlur = 8;
      cCtx.fill();
      cCtx.shadowBlur = 0;

      // Draw Current Parameter Position Marker
      const curPx = cToX(currentW);
      const curPy = cToY(currentB);

      cCtx.beginPath();
      cCtx.arc(curPx, curPy, 7, 0, Math.PI * 2);
      cCtx.fillStyle = THEME.amber;
      cCtx.shadowColor = THEME.amber;
      cCtx.shadowBlur = 10;
      cCtx.fill();
      cCtx.shadowBlur = 0;
      cCtx.strokeStyle = '#fff';
      cCtx.lineWidth = 1.5;
      cCtx.stroke();

      // Draw Trajectory arrow from Current to Optimum
      cCtx.beginPath();
      cCtx.strokeStyle = THEME.dim;
      cCtx.setLineDash([4, 4]);
      cCtx.moveTo(curPx, curPy);
      cCtx.lineTo(optPx, optPy);
      cCtx.stroke();
      cCtx.setLineDash([]);

      // Update HUD
      const metrics = computeMetrics(currentW, currentB, currentLambda);
      hudMse.textContent = metrics.mse.toFixed(4);
      hudR2.textContent = metrics.r2.toFixed(4);
      hudCost.textContent = metrics.cost.toFixed(4);
      hudGrad.textContent = `[${metrics.gradW.toFixed(2)}, ${metrics.gradB.toFixed(2)}]`;
    }

    // Event Listeners
    wSlider.addEventListener('input', e => {
      currentW = parseFloat(e.target.value);
      wVal.textContent = currentW.toFixed(2);
      render();
    });

    bSlider.addEventListener('input', e => {
      currentB = parseFloat(e.target.value);
      bVal.textContent = currentB.toFixed(2);
      render();
    });

    if (lambdaSlider) {
      lambdaSlider.addEventListener('input', e => {
        currentLambda = parseFloat(e.target.value);
        lambdaVal.textContent = currentLambda.toFixed(2);
        render();
      });
    }

    btnOptimal.addEventListener('click', () => {
      const opt = solveOLS(currentLambda);
      currentW = opt.w;
      currentB = opt.b;
      wSlider.value = currentW.toFixed(2);
      bSlider.value = currentB.toFixed(2);
      wVal.textContent = currentW.toFixed(2);
      bVal.textContent = currentB.toFixed(2);
      render();
    });

    btnGD.addEventListener('click', () => {
      const metrics = computeMetrics(currentW, currentB, currentLambda);
      const alpha = 0.08;
      currentW -= alpha * metrics.gradW;
      currentB -= alpha * metrics.gradB;
      wSlider.value = currentW.toFixed(2);
      bSlider.value = currentB.toFixed(2);
      wVal.textContent = currentW.toFixed(2);
      bVal.textContent = currentB.toFixed(2);
      render();
    });

    btnReset.addEventListener('click', () => {
      trueW = 0.8 + Math.random() * 1.8;
      trueB = (Math.random() - 0.5) * 2.5;
      generatePoints();
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  // =========================================================================
  // 2. CLASSIFICATION & DECISION BOUNDARY LABORATORY
  // =========================================================================
  function initClassificationLab(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Laboratory</div>
          <h3 class="lab-title">Decision Boundary & Confusion Matrix Dynamics</h3>
          <p class="lab-desc">Adjust the classification threshold &tau; and rotate the separating hyperplane. Observe how false positives and false negatives trade off in real time.</p>
        </div>

        <div class="lab-canvas-grid">
          <div class="canvas-wrap">
            <span class="canvas-tag">2D Decision Space: Logit Heatmap & Hyperplane</span>
            <canvas id="${containerId}-cls-canvas" height="340" style="width:100%; height:340px;"></canvas>
          </div>
          <div class="canvas-wrap">
            <span class="canvas-tag">Live Confusion Matrix & Trade-off Metrics</span>
            <div class="matrix-hud-container" id="${containerId}-matrix-hud"></div>
          </div>
        </div>

        <div class="lab-controls">
          <div class="control-group">
            <label>Decision Probability Threshold (&tau;): <span id="${containerId}-tau-val" class="ctrl-val">0.50</span></label>
            <input type="range" id="${containerId}-tau-slider" min="0.05" max="0.95" step="0.02" value="0.50">
          </div>
          <div class="control-group">
            <label>Hyperplane Angle (&theta;): <span id="${containerId}-angle-val" class="ctrl-val">45&deg;</span></label>
            <input type="range" id="${containerId}-angle-slider" min="-90" max="90" step="2" value="45">
          </div>
          <div class="btn-group">
            <button class="lab-btn primary" id="${containerId}-btn-imbalance">Toggle 95% Class Imbalance</button>
            <button class="lab-btn ghost" id="${containerId}-btn-reseed">Reseed Clusters</button>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById(`${containerId}-cls-canvas`);
    const hudContainer = document.getElementById(`${containerId}-matrix-hud`);
    const tauSlider = document.getElementById(`${containerId}-tau-slider`);
    const angleSlider = document.getElementById(`${containerId}-angle-slider`);
    const tauVal = document.getElementById(`${containerId}-tau-val`);
    const angleVal = document.getElementById(`${containerId}-angle-val`);
    const btnImbalance = document.getElementById(`${containerId}-btn-imbalance`);
    const btnReseed = document.getElementById(`${containerId}-btn-reseed`);

    let tau = 0.5;
    let angleDeg = 45;
    let imbalanced = false;
    let points = [];

    function seedPoints() {
      points = [];
      const count0 = imbalanced ? 75 : 35;
      const count1 = imbalanced ? 5 : 35;

      // Class 0 (Negative / Cyan) centered at (-1.2, -0.8)
      for (let i = 0; i < count0; i++) {
        points.push({
          x: -1.2 + (Math.random() - 0.5) * 2.2 + (Math.random() - 0.5) * 1.0,
          y: -0.8 + (Math.random() - 0.5) * 2.2 + (Math.random() - 0.5) * 1.0,
          label: 0
        });
      }

      // Class 1 (Positive / Violet) centered at (1.2, 0.8)
      for (let i = 0; i < count1; i++) {
        points.push({
          x: 1.2 + (Math.random() - 0.5) * 2.0 + (Math.random() - 0.5) * 1.0,
          y: 0.8 + (Math.random() - 0.5) * 2.0 + (Math.random() - 0.5) * 1.0,
          label: 1
        });
      }
    }
    seedPoints();

    function render() {
      const { ctx, width, height } = setupCanvas(canvas);
      ctx.clearRect(0, 0, width, height);

      const rad = (angleDeg * Math.PI) / 180;
      const nx = Math.cos(rad);
      const ny = Math.sin(rad);

      // Offset determined by tau (logistic logit threshold offset)
      // logit(tau) = ln(tau / (1 - tau))
      const logitOffset = Math.log(tau / (1 - tau)) * 0.45;

      const minX = -3.5, maxX = 3.5, minY = -3.0, maxY = 3.0;
      const toX = x => ((x - minX) / (maxX - minX)) * width;
      const toY = y => height - ((y - minY) / (maxY - minY)) * height;

      // 1. Draw Sigmoid Probability Landscape Heatmap
      const step = 8;
      for (let px = 0; px < width; px += step) {
        const x = minX + (px / width) * (maxX - minX);
        for (let py = 0; py < height; py += step) {
          const y = minY + ((height - py) / height) * (maxY - minY);
          const rawScore = x * nx + y * ny - logitOffset;
          const prob = 1 / (1 + Math.exp(-2.5 * rawScore));

          // Interpolate between cyan (prob 0) and violet (prob 1)
          ctx.fillStyle = prob >= tau
            ? `rgba(140, 124, 255, ${Math.min(0.28, prob * 0.28)})`
            : `rgba(86, 217, 255, ${Math.min(0.28, (1 - prob) * 0.28)})`;
          ctx.fillRect(px, py, step, step);
        }
      }

      // 2. Draw Hyperplane Separating Boundary: x*nx + y*ny - logitOffset = 0
      // y = (logitOffset - x*nx) / ny
      ctx.strokeStyle = THEME.ink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (Math.abs(ny) > 0.05) {
        const y1 = (logitOffset - minX * nx) / ny;
        const y2 = (logitOffset - maxX * nx) / ny;
        ctx.moveTo(toX(minX), toY(y1));
        ctx.lineTo(toX(maxX), toY(y2));
      } else {
        const xFixed = logitOffset / nx;
        ctx.moveTo(toX(xFixed), 0);
        ctx.lineTo(toX(xFixed), height);
      }
      ctx.stroke();

      // 3. Classify points and build Confusion Matrix counts
      let tp = 0, fp = 0, tn = 0, fn = 0;

      points.forEach(p => {
        const rawScore = p.x * nx + p.y * ny - logitOffset;
        const prob = 1 / (1 + Math.exp(-2.5 * rawScore));
        const pred = prob >= tau ? 1 : 0;

        if (p.label === 1 && pred === 1) tp++;
        else if (p.label === 0 && pred === 1) fp++;
        else if (p.label === 0 && pred === 0) tn++;
        else if (p.label === 1 && pred === 0) fn++;

        // Draw Point
        ctx.beginPath();
        ctx.arc(toX(p.x), toY(p.y), 5, 0, Math.PI * 2);

        if (p.label === 1) {
          ctx.fillStyle = pred === 1 ? THEME.violet : THEME.amber;
          ctx.shadowColor = THEME.violet;
        } else {
          ctx.fillStyle = pred === 0 ? THEME.cyan : THEME.red;
          ctx.shadowColor = THEME.cyan;
        }

        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = pred === p.label ? 'transparent' : '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 4. Update HUD Matrix & Diagnostic Metrics
      const total = tp + fp + tn + fn;
      const acc = total ? (tp + tn) / total : 0;
      const prec = (tp + fp) ? tp / (tp + fp) : 0;
      const recall = (tp + fn) ? tp / (tp + fn) : 0;
      const spec = (tn + fp) ? tn / (tn + fp) : 0;
      const f1 = (prec + recall) ? (2 * prec * recall) / (prec + recall) : 0;

      hudContainer.innerHTML = `
        <div class="matrix-mini-grid">
          <div class="m-cell tp">
            <span class="m-tag">True Positive (TP)</span>
            <span class="m-count">${tp}</span>
          </div>
          <div class="m-cell fp">
            <span class="m-tag">False Positive (FP / Type I)</span>
            <span class="m-count">${fp}</span>
          </div>
          <div class="m-cell fn">
            <span class="m-tag">False Negative (FN / Type II)</span>
            <span class="m-count">${fn}</span>
          </div>
          <div class="m-cell tn">
            <span class="m-tag">True Negative (TN)</span>
            <span class="m-count">${tn}</span>
          </div>
        </div>

        <div class="matrix-meter-list">
          <div class="meter-row">
            <span class="meter-label">Accuracy: ${(acc * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${acc * 100}%; background:var(--green);"></div></div>
          </div>
          <div class="meter-row">
            <span class="meter-label">Precision: ${(prec * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${prec * 100}%; background:var(--violet);"></div></div>
          </div>
          <div class="meter-row">
            <span class="meter-label">Recall (TPR): ${(recall * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${recall * 100}%; background:var(--cyan);"></div></div>
          </div>
          <div class="meter-row">
            <span class="meter-label">Specificity: ${(spec * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${spec * 100}%; background:var(--dim);"></div></div>
          </div>
          <div class="meter-row">
            <span class="meter-label">F1-Score: ${(f1 * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${f1 * 100}%; background:var(--amber);"></div></div>
          </div>
        </div>
      `;
    }

    tauSlider.addEventListener('input', e => {
      tau = parseFloat(e.target.value);
      tauVal.textContent = tau.toFixed(2);
      render();
    });

    angleSlider.addEventListener('input', e => {
      angleDeg = parseInt(e.target.value, 10);
      angleVal.innerHTML = `${angleDeg}&deg;`;
      render();
    });

    btnImbalance.addEventListener('click', () => {
      imbalanced = !imbalanced;
      btnImbalance.textContent = imbalanced ? 'Revert to Balanced Classes' : 'Toggle 95% Class Imbalance';
      seedPoints();
      render();
    });

    btnReset.addEventListener('click', () => {
      seedPoints();
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  // =========================================================================
  // 3. CLUSTERING & VORONOI STEP ENGINE (K-MEANS)
  // =========================================================================
  function initClusteringLab(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Laboratory</div>
          <h3 class="lab-title">Lloyd's Expectation-Maximization Iterative Clustering</h3>
          <p class="lab-desc">Experience the two-step dance of K-Means: (1) Assign every data point to its closest centroid, then (2) relocate each centroid to the center of mass of its cluster.</p>
        </div>

        <div class="lab-canvas-grid">
          <div class="canvas-wrap">
            <span class="canvas-tag">Voronoi Partition & Centroid Trajectory</span>
            <canvas id="${containerId}-km-canvas" height="340" style="width:100%; height:340px;"></canvas>
          </div>
          <div class="canvas-wrap">
            <span class="canvas-tag">Inertia (Within-Cluster Sum of Squares) Convergence</span>
            <canvas id="${containerId}-wcss-canvas" height="340" style="width:100%; height:340px;"></canvas>
          </div>
        </div>

        <div class="lab-controls">
          <div class="control-group">
            <label>Number of Clusters (K): <span id="${containerId}-k-val" class="ctrl-val">3</span></label>
            <input type="range" id="${containerId}-k-slider" min="2" max="6" step="1" value="3">
          </div>
          <div class="btn-group">
            <button class="lab-btn primary" id="${containerId}-btn-step">Execute Next Step</button>
            <button class="lab-btn secondary" id="${containerId}-btn-auto">Auto-Play Convergence</button>
            <button class="lab-btn ghost" id="${containerId}-btn-reseed">Reseed Centroids</button>
          </div>
        </div>

        <div class="lab-hud">
          <div class="hud-item">
            <span class="hud-label">Current Phase</span>
            <span class="hud-val" id="${containerId}-hud-phase">Assignment (E-Step)</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Iteration Step</span>
            <span class="hud-val" id="${containerId}-hud-iter">0</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">WCSS (Inertia)</span>
            <span class="hud-val" id="${containerId}-hud-wcss">0.00</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Convergence Status</span>
            <span class="hud-val" id="${containerId}-hud-status" style="color:var(--amber);">Iterating</span>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById(`${containerId}-km-canvas`);
    const wcssCanvas = document.getElementById(`${containerId}-wcss-canvas`);
    const kSlider = document.getElementById(`${containerId}-k-slider`);
    const kVal = document.getElementById(`${containerId}-k-val`);
    const btnStep = document.getElementById(`${containerId}-btn-step`);
    const btnAuto = document.getElementById(`${containerId}-btn-auto`);
    const btnReseed = document.getElementById(`${containerId}-btn-reseed`);
    const hudPhase = document.getElementById(`${containerId}-hud-phase`);
    const hudIter = document.getElementById(`${containerId}-hud-iter`);
    const hudWcss = document.getElementById(`${containerId}-hud-wcss`);
    const hudStatus = document.getElementById(`${containerId}-hud-status`);

    const CLUSTER_COLORS = [
      '#8c7cff', // Violet
      '#56d9ff', // Cyan
      '#74df9b', // Green
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#a855f7'  // Purple
    ];

    let K = 3;
    let points = [];
    let centroids = [];
    let currentStep = 'assign'; // 'assign' or 'update'
    let iteration = 0;
    let wcssHistory = [];
    let isAutoPlaying = false;
    let autoTimer = null;

    function generateClusters() {
      points = [];
      const centers = [
        { x: -1.8, y: 1.2 },
        { x: 1.5, y: 1.5 },
        { x: 0.0, y: -1.6 },
        { x: -2.0, y: -1.5 },
        { x: 2.2, y: -1.0 }
      ];

      for (let c = 0; c < 5; c++) {
        for (let i = 0; i < 22; i++) {
          points.push({
            x: centers[c].x + (Math.random() - 0.5) * 1.5 + (Math.random() - 0.5) * 0.5,
            y: centers[c].y + (Math.random() - 0.5) * 1.5 + (Math.random() - 0.5) * 0.5,
            cluster: -1
          });
        }
      }
      initCentroids();
    }

    function initCentroids() {
      centroids = [];
      for (let k = 0; k < K; k++) {
        // Pick random point as initial seed
        const p = points[Math.floor(Math.random() * points.length)];
        centroids.push({
          x: p.x + (Math.random() - 0.5) * 0.2,
          y: p.y + (Math.random() - 0.5) * 0.2,
          prevX: p.x,
          prevY: p.y
        });
      }
      currentStep = 'assign';
      iteration = 0;
      wcssHistory = [];
      hudStatus.textContent = 'Iterating';
      hudStatus.style.color = 'var(--amber)';
    }
    generateClusters();

    function computeWCSS() {
      let total = 0;
      points.forEach(p => {
        if (p.cluster >= 0 && p.cluster < centroids.length) {
          const c = centroids[p.cluster];
          const dx = p.x - c.x;
          const dy = p.y - c.y;
          total += dx * dx + dy * dy;
        }
      });
      return total;
    }

    function step() {
      if (currentStep === 'assign') {
        // Step 1: Assign each point to closest centroid
        points.forEach(p => {
          let minDist = Infinity;
          let bestK = 0;
          centroids.forEach((c, idx) => {
            const dist = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
            if (dist < minDist) {
              minDist = dist;
              bestK = idx;
            }
          });
          p.cluster = bestK;
        });

        const currentWcss = computeWCSS();
        wcssHistory.push(currentWcss);

        currentStep = 'update';
        iteration++;
        hudPhase.textContent = 'Centroid Relocation (M-Step)';
      } else {
        // Step 2: Update centroids to cluster mean
        let maxShift = 0;
        centroids.forEach((c, idx) => {
          c.prevX = c.x;
          c.prevY = c.y;

          const assigned = points.filter(p => p.cluster === idx);
          if (assigned.length > 0) {
            let sumX = 0, sumY = 0;
            assigned.forEach(p => {
              sumX += p.x;
              sumY += p.y;
            });
            c.x = sumX / assigned.length;
            c.y = sumY / assigned.length;

            const shift = Math.hypot(c.x - c.prevX, c.y - c.prevY);
            if (shift > maxShift) maxShift = shift;
          }
        });

        currentStep = 'assign';
        hudPhase.textContent = 'Point Assignment (E-Step)';

        if (maxShift < 0.005) {
          hudStatus.textContent = 'Converged (Optimal Local Minimum)';
          hudStatus.style.color = 'var(--green)';
          if (isAutoPlaying) {
            clearInterval(autoTimer);
            isAutoPlaying = false;
            btnAuto.textContent = 'Auto-Play Convergence';
          }
        }
      }
      render();
    }

    function render() {
      // 1. Render Cluster Canvas
      const { ctx, width, height } = setupCanvas(canvas);
      ctx.clearRect(0, 0, width, height);

      const minX = -3.5, maxX = 3.5, minY = -3.5, maxY = 3.5;
      const toX = x => ((x - minX) / (maxX - minX)) * width;
      const toY = y => height - ((y - minY) / (maxY - minY)) * height;

      // Draw connection lines from points to assigned centroids
      points.forEach(p => {
        if (p.cluster >= 0 && p.cluster < centroids.length) {
          const c = centroids[p.cluster];
          ctx.beginPath();
          ctx.moveTo(toX(p.x), toY(p.y));
          ctx.lineTo(toX(c.x), toY(c.y));
          ctx.strokeStyle = `rgba(255, 255, 255, 0.04)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw Data Points
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(toX(p.x), toY(p.y), 4.5, 0, Math.PI * 2);
        ctx.fillStyle = p.cluster >= 0 ? CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length] : THEME.dim;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Centroids
      centroids.forEach((c, idx) => {
        const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
        const cx = toX(c.x);
        const cy = toY(c.y);

        // Halo
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crosshairs
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.font = 'bold 11px "DM Mono"';
        ctx.fillText(`C${idx + 1}`, cx + 16, cy + 4);
      });

      // 2. Render WCSS History Graph
      const { ctx: wCtx, width: wW, height: wH } = setupCanvas(wcssCanvas);
      wCtx.clearRect(0, 0, wW, wH);

      if (wcssHistory.length > 1) {
        const maxWcss = Math.max(...wcssHistory) * 1.1;
        const minWcss = 0;

        wCtx.strokeStyle = THEME.cyan;
        wCtx.lineWidth = 2.5;
        wCtx.beginPath();
        wcssHistory.forEach((val, idx) => {
          const x = 30 + (idx / (wcssHistory.length - 1)) * (wW - 50);
          const y = wH - 30 - ((val - minWcss) / (maxWcss - minWcss)) * (wH - 50);
          if (idx === 0) wCtx.moveTo(x, y);
          else wCtx.lineTo(x, y);
        });
        wCtx.stroke();

        wcssHistory.forEach((val, idx) => {
          const x = 30 + (idx / (wcssHistory.length - 1)) * (wW - 50);
          const y = wH - 30 - ((val - minWcss) / (maxWcss - minWcss)) * (wH - 50);
          wCtx.beginPath();
          wCtx.arc(x, y, 4, 0, Math.PI * 2);
          wCtx.fillStyle = THEME.violet;
          wCtx.fill();
        });
      } else {
        wCtx.fillStyle = THEME.dim;
        wCtx.font = '12px "DM Mono"';
        wCtx.fillText('Click "Execute Next Step" to record WCSS inertia...', 30, wH / 2);
      }

      // Update HUD
      hudIter.textContent = iteration;
      const latestWcss = wcssHistory.length ? wcssHistory[wcssHistory.length - 1] : computeWCSS();
      hudWcss.textContent = latestWcss.toFixed(1);
    }

    btnStep.addEventListener('click', step);

    btnAuto.addEventListener('click', () => {
      if (isAutoPlaying) {
        clearInterval(autoTimer);
        isAutoPlaying = false;
        btnAuto.textContent = 'Auto-Play Convergence';
      } else {
        isAutoPlaying = true;
        btnAuto.textContent = 'Pause Simulation';
        autoTimer = setInterval(step, 600);
      }
    });

    btnReseed.addEventListener('click', () => {
      initCentroids();
      render();
    });

    kSlider.addEventListener('input', e => {
      K = parseInt(e.target.value, 10);
      kVal.textContent = K;
      initCentroids();
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  // =========================================================================
  // 4. CONFUSION MATRIX & THRESHOLD INTERACTIVE LAB (Concept)
  // =========================================================================
  function initConfusionMatrixLab(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Laboratory</div>
          <h3 class="lab-title">Dual Distribution Threshold & The Accuracy Paradox</h3>
          <p class="lab-desc">Drag the classification cutoff &tau; across the overlapping probability densities of Negative vs. Positive classes to see how TP, FP, TN, and FN shift.</p>
        </div>

        <div class="canvas-wrap" style="margin-bottom:18px;">
          <span class="canvas-tag">Probability Density Functions & Cutoff &tau;</span>
          <canvas id="${containerId}-dist-canvas" height="240" style="width:100%; height:240px;"></canvas>
        </div>

        <div class="lab-controls">
          <div class="control-group">
            <label>Classification Cutoff Threshold (&tau;): <span id="${containerId}-tau-text" class="ctrl-val">0.50</span></label>
            <input type="range" id="${containerId}-tau-bar" min="0.05" max="0.95" step="0.01" value="0.50">
          </div>
          <div class="btn-group">
            <button class="lab-btn primary" id="${containerId}-btn-fraud">Load 99.8% Fraud Imbalance Scenario</button>
            <button class="lab-btn secondary" id="${containerId}-btn-balanced">Reset Balanced 50:50 Distribution</button>
          </div>
        </div>

        <div id="${containerId}-hud-out" style="margin-top:18px;"></div>
      </div>
    `;

    const canvas = document.getElementById(`${containerId}-dist-canvas`);
    const tauBar = document.getElementById(`${containerId}-tau-bar`);
    const tauText = document.getElementById(`${containerId}-tau-text`);
    const hudOut = document.getElementById(`${containerId}-hud-out`);
    const btnFraud = document.getElementById(`${containerId}-btn-fraud`);
    const btnBalanced = document.getElementById(`${containerId}-btn-balanced`);

    let tau = 0.50;
    let isImbalanced = false;

    // Normal PDF
    function gaussian(x, mu, sigma) {
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
    }

    function render() {
      const { ctx, width, height } = setupCanvas(canvas);
      ctx.clearRect(0, 0, width, height);

      const nNeg = isImbalanced ? 998 : 500;
      const nPos = isImbalanced ? 2 : 500;
      const total = nNeg + nPos;

      const muNeg = 0.32, sigmaNeg = 0.14;
      const muPos = 0.68, sigmaPos = 0.14;

      const toX = x => x * width;
      const toY = y => height - y * (height - 30);

      // Area calculations via numerical integration
      let tn = 0, fp = 0, fn = 0, tp = 0;
      const steps = 300;

      for (let i = 0; i < steps; i++) {
        const x = i / steps;
        const dx = 1 / steps;
        const pNeg = gaussian(x, muNeg, sigmaNeg) * dx;
        const pPos = gaussian(x, muPos, sigmaPos) * dx;

        if (x < tau) {
          tn += pNeg * nNeg;
          fn += pPos * nPos;
        } else {
          fp += pNeg * nNeg;
          tp += pPos * nPos;
        }
      }

      // Draw Negative Class Distribution (Cyan)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let px = 0; px <= width; px += 2) {
        const x = px / width;
        const yVal = gaussian(x, muNeg, sigmaNeg) * (nNeg / total) * 0.45;
        ctx.lineTo(px, toY(yVal));
      }
      ctx.lineTo(width, height);
      ctx.fillStyle = 'rgba(86, 217, 255, 0.15)';
      ctx.fill();
      ctx.strokeStyle = THEME.cyan;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Positive Class Distribution (Violet)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let px = 0; px <= width; px += 2) {
        const x = px / width;
        const yVal = gaussian(x, muPos, sigmaPos) * (nPos / total) * 0.45;
        ctx.lineTo(px, toY(yVal));
      }
      ctx.lineTo(width, height);
      ctx.fillStyle = 'rgba(140, 124, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = THEME.violet;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Threshold Line (tau)
      const tauPx = toX(tau);
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(tauPx, 0);
      ctx.lineTo(tauPx, height);
      ctx.strokeStyle = THEME.amber;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = THEME.amber;
      ctx.font = 'bold 12px "DM Mono"';
      ctx.fillText(`Cutoff \u03c4 = ${tau.toFixed(2)}`, tauPx + 8, 20);

      // Compute metrics
      const acc = (tp + tn) / total;
      const prec = (tp + fp) ? tp / (tp + fp) : 0;
      const recall = (tp + fn) ? tp / (tp + fn) : 0;
      const f1 = (prec + recall) ? (2 * prec * recall) / (prec + recall) : 0;

      hudOut.innerHTML = `
        <div class="matrix-mini-grid">
          <div class="m-cell tp">
            <span class="m-tag">True Positive (TP)</span>
            <span class="m-count">${Math.round(tp)}</span>
          </div>
          <div class="m-cell fp">
            <span class="m-tag">False Positive (FP / False Alarm)</span>
            <span class="m-count">${Math.round(fp)}</span>
          </div>
          <div class="m-cell fn">
            <span class="m-tag">False Negative (FN / Missed Fraud)</span>
            <span class="m-count">${Math.round(fn)}</span>
          </div>
          <div class="m-cell tn">
            <span class="m-tag">True Negative (TN)</span>
            <span class="m-count">${Math.round(tn)}</span>
          </div>
        </div>

        <div class="matrix-meter-list" style="margin-top:14px;">
          <div class="meter-row">
            <span class="meter-label">Accuracy: ${(acc * 100).toFixed(2)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${acc * 100}%; background:var(--green);"></div></div>
          </div>
          <div class="meter-row">
            <span class="meter-label">Precision (Positive Predictive Value): ${(prec * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${prec * 100}%; background:var(--violet);"></div></div>
          </div>
          <div class="meter-row">
            <span class="meter-label">Recall (Sensitivity / True Positive Rate): ${(recall * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${recall * 100}%; background:var(--cyan);"></div></div>
          </div>
          <div class="meter-row">
            <span class="meter-label">Harmonic F1-Score: ${(f1 * 100).toFixed(1)}%</span>
            <div class="meter-track"><div class="meter-fill" style="width:${f1 * 100}%; background:var(--amber);"></div></div>
          </div>
        </div>
      `;
    }

    tauBar.addEventListener('input', e => {
      tau = parseFloat(e.target.value);
      tauText.textContent = tau.toFixed(2);
      render();
    });

    btnFraud.addEventListener('click', () => {
      isImbalanced = true;
      render();
    });

    btnBalanced.addEventListener('click', () => {
      isImbalanced = false;
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  // =========================================================================
  // 5. LOSS FUNCTIONS & OPTIMIZATION LANDSCAPES LAB (Concept)
  // =========================================================================
  function initLossFunctionsLab(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Laboratory</div>
          <h3 class="lab-title">Loss Function Penalty Curves & Robustness Analyzer</h3>
          <p class="lab-desc">Drag the residual error slider e = y - ŷ across [-4.0, +4.0]. See how MSE explodes quadratically for outliers while MAE remains linear and Huber balances both.</p>
        </div>

        <div class="canvas-wrap" style="margin-bottom:18px;">
          <span class="canvas-tag">Curvature Profiles: MSE (L2) vs MAE (L1) vs Huber Loss (&delta; = 1.0)</span>
          <canvas id="${containerId}-loss-canvas" height="260" style="width:100%; height:260px;"></canvas>
        </div>

        <div class="lab-controls">
          <div class="control-group">
            <label>Residual Error e = (y - ŷ): <span id="${containerId}-e-val" class="ctrl-val">1.50</span></label>
            <input type="range" id="${containerId}-e-slider" min="-4.0" max="4.0" step="0.05" value="1.50">
          </div>
          <div class="control-group">
            <label>Huber Transition Threshold (&delta;): <span id="${containerId}-delta-val" class="ctrl-val">1.00</span></label>
            <input type="range" id="${containerId}-delta-slider" min="0.2" max="3.0" step="0.1" value="1.00">
          </div>
        </div>

        <div class="lab-hud">
          <div class="hud-item">
            <span class="hud-label">MSE (L2) Penalty</span>
            <span class="hud-val" id="${containerId}-hud-mse" style="color:var(--violet);">0.00</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">MAE (L1) Penalty</span>
            <span class="hud-val" id="${containerId}-hud-mae" style="color:var(--cyan);">0.00</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Huber Loss Penalty</span>
            <span class="hud-val" id="${containerId}-hud-huber" style="color:var(--green);">0.00</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Huber Gradient dL/de</span>
            <span class="hud-val" id="${containerId}-hud-grad" style="color:var(--amber);">0.00</span>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById(`${containerId}-loss-canvas`);
    const eSlider = document.getElementById(`${containerId}-e-slider`);
    const deltaSlider = document.getElementById(`${containerId}-delta-slider`);
    const eVal = document.getElementById(`${containerId}-e-val`);
    const deltaVal = document.getElementById(`${containerId}-delta-val`);
    const hudMse = document.getElementById(`${containerId}-hud-mse`);
    const hudMae = document.getElementById(`${containerId}-hud-mae`);
    const hudHuber = document.getElementById(`${containerId}-hud-huber`);
    const hudGrad = document.getElementById(`${containerId}-hud-grad`);

    let curE = 1.5;
    let delta = 1.0;

    function render() {
      const { ctx, width, height } = setupCanvas(canvas);
      ctx.clearRect(0, 0, width, height);

      const minE = -4.5, maxE = 4.5, minL = 0, maxL = 10;
      const toX = e => ((e - minE) / (maxE - minE)) * width;
      const toY = l => height - ((l - minL) / (maxL - minL)) * (height - 30) - 15;

      // Draw Grid
      ctx.strokeStyle = THEME.line;
      ctx.lineWidth = 1;
      for (let ge = -4; ge <= 4; ge += 1) {
        ctx.beginPath();
        ctx.moveTo(toX(ge), 0);
        ctx.lineTo(toX(ge), height);
        ctx.stroke();
      }

      // Axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(toX(0), 0);
      ctx.lineTo(toX(0), height);
      ctx.moveTo(0, toY(0));
      ctx.lineTo(width, toY(0));
      ctx.stroke();

      // 1. Draw MSE: L = 0.5 * e^2
      ctx.beginPath();
      for (let px = 0; px <= width; px += 3) {
        const e = minE + (px / width) * (maxE - minE);
        const l = 0.5 * e * e;
        if (px === 0) ctx.moveTo(px, toY(l));
        else ctx.lineTo(px, toY(l));
      }
      ctx.strokeStyle = THEME.violet;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Draw MAE: L = |e|
      ctx.beginPath();
      for (let px = 0; px <= width; px += 3) {
        const e = minE + (px / width) * (maxE - minE);
        const l = Math.abs(e);
        if (px === 0) ctx.moveTo(px, toY(l));
        else ctx.lineTo(px, toY(l));
      }
      ctx.strokeStyle = THEME.cyan;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Draw Huber Loss
      ctx.beginPath();
      for (let px = 0; px <= width; px += 3) {
        const e = minE + (px / width) * (maxE - minE);
        const absE = Math.abs(e);
        const l = absE <= delta ? 0.5 * absE * absE : delta * (absE - 0.5 * delta);
        if (px === 0) ctx.moveTo(px, toY(l));
        else ctx.lineTo(px, toY(l));
      }
      ctx.strokeStyle = THEME.green;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Current Error Drop Line
      const curPx = toX(curE);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(curPx, 0);
      ctx.lineTo(curPx, height);
      ctx.strokeStyle = THEME.amber;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Compute Values
      const mseVal = 0.5 * curE * curE;
      const maeVal = Math.abs(curE);
      const absE = Math.abs(curE);
      const hubVal = absE <= delta ? 0.5 * absE * absE : delta * (absE - 0.5 * delta);
      const hubGradVal = absE <= delta ? curE : delta * Math.sign(curE);

      // Points on curves
      [
        { val: mseVal, color: THEME.violet },
        { val: maeVal, color: THEME.cyan },
        { val: hubVal, color: THEME.green }
      ].forEach(p => {
        ctx.beginPath();
        ctx.arc(curPx, toY(p.val), 5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      hudMse.textContent = mseVal.toFixed(3);
      hudMae.textContent = maeVal.toFixed(3);
      hudHuber.textContent = hubVal.toFixed(3);
      hudGrad.textContent = hubGradVal.toFixed(3);
    }

    eSlider.addEventListener('input', e => {
      curE = parseFloat(e.target.value);
      eVal.textContent = curE.toFixed(2);
      render();
    });

    deltaSlider.addEventListener('input', e => {
      delta = parseFloat(e.target.value);
      deltaVal.textContent = delta.toFixed(2);
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  // =========================================================================
  // 6. BIAS-VARIANCE TRADEOFF LABORATORY (Concept)
  // =========================================================================
  function initBiasVarianceLab(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Laboratory</div>
          <h3 class="lab-title">Polynomial Model Complexity & Error Decomposition</h3>
          <p class="lab-desc">Adjust polynomial degree d from 1 to 9. Witness underfitting (high bias) at low degrees, optimal generalization at degree 3, and runaway oscillation (high variance overfitting) at high degrees.</p>
        </div>

        <div class="lab-canvas-grid">
          <div class="canvas-wrap">
            <span class="canvas-tag">Polynomial Fit & Out-of-Sample Test Evaluation</span>
            <canvas id="${containerId}-fit-canvas" height="300" style="width:100%; height:300px;"></canvas>
          </div>
          <div class="canvas-wrap">
            <span class="canvas-tag">Total Error = Bias² + Variance + Irreducible Noise</span>
            <canvas id="${containerId}-bv-canvas" height="300" style="width:100%; height:300px;"></canvas>
          </div>
        </div>

        <div class="lab-controls">
          <div class="control-group">
            <label>Polynomial Degree (Model Complexity d): <span id="${containerId}-deg-val" class="ctrl-val">3</span></label>
            <input type="range" id="${containerId}-deg-slider" min="1" max="9" step="1" value="3">
          </div>
          <div class="btn-group">
            <button class="lab-btn primary" id="${containerId}-btn-new-noise">Resample Training Split</button>
          </div>
        </div>

        <div class="lab-hud">
          <div class="hud-item">
            <span class="hud-label">Training Error (Empirical)</span>
            <span class="hud-val" id="${containerId}-hud-train">0.00</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Generalization Test Error</span>
            <span class="hud-val" id="${containerId}-hud-test">0.00</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Model State</span>
            <span class="hud-val" id="${containerId}-hud-state" style="color:var(--green);">Optimal Generalization</span>
          </div>
        </div>
      </div>
    `;

    const fitCanvas = document.getElementById(`${containerId}-fit-canvas`);
    const bvCanvas = document.getElementById(`${containerId}-bv-canvas`);
    const degSlider = document.getElementById(`${containerId}-deg-slider`);
    const degVal = document.getElementById(`${containerId}-deg-val`);
    const btnNewNoise = document.getElementById(`${containerId}-btn-new-noise`);
    const hudTrain = document.getElementById(`${containerId}-hud-train`);
    const hudTest = document.getElementById(`${containerId}-hud-test`);
    const hudState = document.getElementById(`${containerId}-hud-state`);

    let degree = 3;
    let trainPoints = [];
    let testPoints = [];

    // Underlying true function: f(x) = sin(1.8 * x)
    function trueFn(x) {
      return Math.sin(1.8 * x);
    }

    function generatePoints() {
      trainPoints = [];
      testPoints = [];
      const nTrain = 14;
      const nTest = 20;

      for (let i = 0; i < nTrain; i++) {
        const x = -2.2 + (4.4 * i) / (nTrain - 1) + (Math.random() - 0.5) * 0.15;
        const y = trueFn(x) + (Math.random() - 0.5) * 0.45;
        trainPoints.push({ x, y });
      }

      for (let i = 0; i < nTest; i++) {
        const x = -2.2 + (4.4 * i) / (nTest - 1);
        const y = trueFn(x) + (Math.random() - 0.5) * 0.45;
        testPoints.push({ x, y });
      }
    }
    generatePoints();

    // Polynomial least squares fit via normal equation
    function fitPoly(deg) {
      const p = deg + 1;
      const A = Array.from({ length: p }, () => Array(p).fill(0));
      const b = Array(p).fill(0);

      trainPoints.forEach(pt => {
        const powers = [];
        let val = 1;
        for (let i = 0; i <= 2 * deg; i++) {
          powers.push(val);
          val *= pt.x;
        }

        for (let r = 0; r < p; r++) {
          for (let c = 0; c < p; c++) {
            A[r][c] += powers[r + c];
          }
          b[r] += pt.y * powers[r];
        }
      });

      // Regularize slightly to prevent numeric singular crash at deg 9
      for (let r = 0; r < p; r++) A[r][r] += 1e-6;

      // Gauss-Jordan elimination
      for (let i = 0; i < p; i++) {
        let maxRow = i;
        for (let k = i + 1; k < p; k++) {
          if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
        }
        const tempRow = A[i]; A[i] = A[maxRow]; A[maxRow] = tempRow;
        const tempB = b[i]; b[i] = b[maxRow]; b[maxRow] = tempB;

        const pivot = A[i][i] || 1e-6;
        for (let j = i; j < p; j++) A[i][j] /= pivot;
        b[i] /= pivot;

        for (let k = 0; k < p; k++) {
          if (k !== i) {
            const factor = A[k][i];
            for (let j = i; j < p; j++) A[k][j] -= factor * A[i][j];
            b[k] -= factor * b[i];
          }
        }
      }
      return b; // coefficients [c0, c1, ..., c_deg]
    }

    function evalPoly(coeffs, x) {
      let sum = 0;
      let power = 1;
      for (let i = 0; i < coeffs.length; i++) {
        sum += coeffs[i] * power;
        power *= x;
      }
      return sum;
    }

    function render() {
      const coeffs = fitPoly(degree);

      // Compute Train & Test Errors
      let trainErr = 0;
      trainPoints.forEach(p => {
        const diff = evalPoly(coeffs, p.x) - p.y;
        trainErr += diff * diff;
      });
      trainErr /= trainPoints.length;

      let testErr = 0;
      testPoints.forEach(p => {
        const diff = evalPoly(coeffs, p.x) - p.y;
        testErr += diff * diff;
      });
      testErr /= testPoints.length;

      // 1. Render Fit Canvas
      const { ctx, width, height } = setupCanvas(fitCanvas);
      ctx.clearRect(0, 0, width, height);

      const minX = -2.5, maxX = 2.5, minY = -2.2, maxY = 2.2;
      const toX = x => ((x - minX) / (maxX - minX)) * width;
      const toY = y => height - ((y - minY) / (maxY - minY)) * height;

      // Draw True Ground Truth curve
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 2) {
        const x = minX + (px / width) * (maxX - minX);
        const y = trueFn(x);
        if (px === 0) ctx.moveTo(px, toY(y));
        else ctx.lineTo(px, toY(y));
      }
      ctx.stroke();

      // Draw Fitted Polynomial
      ctx.strokeStyle = THEME.violet;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 2) {
        const x = minX + (px / width) * (maxX - minX);
        const y = Math.max(minY - 1, Math.min(maxY + 1, evalPoly(coeffs, x)));
        if (px === 0) ctx.moveTo(px, toY(y));
        else ctx.lineTo(px, toY(y));
      }
      ctx.stroke();

      // Draw Training Points
      trainPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(toX(p.x), toY(p.y), 4.5, 0, Math.PI * 2);
        ctx.fillStyle = THEME.cyan;
        ctx.shadowColor = THEME.cyan;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Render Bias-Variance Curves
      const { ctx: bCtx, width: bW, height: bH } = setupCanvas(bvCanvas);
      bCtx.clearRect(0, 0, bW, bH);

      // Pre-calculated representative curves
      const degrees = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const biasSq = [0.85, 0.40, 0.12, 0.08, 0.05, 0.04, 0.03, 0.02, 0.02];
      const variance = [0.03, 0.06, 0.10, 0.18, 0.32, 0.55, 0.88, 1.35, 1.95];
      const totalCurve = biasSq.map((b, i) => b + variance[i] + 0.05);

      const toBx = d => 35 + ((d - 1) / 8) * (bW - 60);
      const toBy = val => bH - 30 - (val / 2.2) * (bH - 50);

      // Bias Curve
      bCtx.strokeStyle = THEME.cyan;
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      degrees.forEach((d, i) => {
        if (i === 0) bCtx.moveTo(toBx(d), toBy(biasSq[i]));
        else bCtx.lineTo(toBx(d), toBy(biasSq[i]));
      });
      bCtx.stroke();

      // Variance Curve
      bCtx.strokeStyle = THEME.amber;
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      degrees.forEach((d, i) => {
        if (i === 0) bCtx.moveTo(toBx(d), toBy(variance[i]));
        else bCtx.lineTo(toBx(d), toBy(variance[i]));
      });
      bCtx.stroke();

      // Total Test Error Curve (U-Shape)
      bCtx.strokeStyle = THEME.red;
      bCtx.lineWidth = 2.5;
      bCtx.beginPath();
      degrees.forEach((d, i) => {
        if (i === 0) bCtx.moveTo(toBx(d), toBy(totalCurve[i]));
        else bCtx.lineTo(toBx(d), toBy(totalCurve[i]));
      });
      bCtx.stroke();

      // Active Degree Vertical Marker
      const curDx = toBx(degree);
      bCtx.beginPath();
      bCtx.setLineDash([4, 4]);
      bCtx.moveTo(curDx, 10);
      bCtx.lineTo(curDx, bH - 25);
      bCtx.strokeStyle = '#fff';
      bCtx.stroke();
      bCtx.setLineDash([]);

      // Legend
      bCtx.font = '11px "DM Mono"';
      bCtx.fillStyle = THEME.cyan;
      bCtx.fillText('Bias²', 40, 25);
      bCtx.fillStyle = THEME.amber;
      bCtx.fillText('Variance', 95, 25);
      bCtx.fillStyle = THEME.red;
      bCtx.fillText('Total Test Error', 170, 25);

      // Update HUD
      hudTrain.textContent = trainErr.toFixed(4);
      hudTest.textContent = testErr.toFixed(4);

      if (degree <= 2) {
        hudState.textContent = 'Underfitting (High Bias)';
        hudState.style.color = 'var(--cyan)';
      } else if (degree >= 6) {
        hudState.textContent = 'Overfitting (High Variance)';
        hudState.style.color = 'var(--red)';
      } else {
        hudState.textContent = 'Optimal Generalization Balance';
        hudState.style.color = 'var(--green)';
      }
    }

    degSlider.addEventListener('input', e => {
      degree = parseInt(e.target.value, 10);
      degVal.textContent = degree;
      render();
    });

    btnNewNoise.addEventListener('click', () => {
      generatePoints();
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  // =========================================================================
  // 7. FEATURE SELECTION & MULTICOLLINEARITY (VIF) LAB (Concept)
  // =========================================================================
  function initFeatureSelectionLab(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Laboratory</div>
          <h3 class="lab-title">Multicollinearity & Variance Inflation Factor (VIF) Gauge</h3>
          <p class="lab-desc">Drag the inter-feature correlation r between X₁ and X₂ from 0.0 to 0.98. Watch how the Gram matrix determinant collapses and coefficient standard errors explode to infinity.</p>
        </div>

        <div class="canvas-wrap" style="margin-bottom:18px;">
          <span class="canvas-tag">Collinearity Gauge: VIF = 1 / (1 - R²)</span>
          <canvas id="${containerId}-vif-canvas" height="220" style="width:100%; height:220px;"></canvas>
        </div>

        <div class="lab-controls">
          <div class="control-group">
            <label>Pearson Correlation r(X₁, X₂): <span id="${containerId}-r-val" class="ctrl-val">0.70</span></label>
            <input type="range" id="${containerId}-r-slider" min="0.0" max="0.98" step="0.02" value="0.70">
          </div>
        </div>

        <div class="lab-hud">
          <div class="hud-item">
            <span class="hud-label">Correlation Coefficient (r)</span>
            <span class="hud-val" id="${containerId}-hud-r">0.70</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">R² Explanation</span>
            <span class="hud-val" id="${containerId}-hud-r2">0.490</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Variance Inflation Factor (VIF)</span>
            <span class="hud-val" id="${containerId}-hud-vif" style="color:var(--amber);">1.96</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Matrix Condition / Health</span>
            <span class="hud-val" id="${containerId}-hud-status" style="color:var(--green);">Stable Inversion</span>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById(`${containerId}-vif-canvas`);
    const rSlider = document.getElementById(`${containerId}-r-slider`);
    const rVal = document.getElementById(`${containerId}-r-val`);
    const hudR = document.getElementById(`${containerId}-hud-r`);
    const hudR2 = document.getElementById(`${containerId}-hud-r2`);
    const hudVif = document.getElementById(`${containerId}-hud-vif`);
    const hudStatus = document.getElementById(`${containerId}-hud-status`);

    let r = 0.70;

    function render() {
      const { ctx, width, height } = setupCanvas(canvas);
      ctx.clearRect(0, 0, width, height);

      const r2 = r * r;
      const vif = 1 / Math.max(0.001, 1 - r2);

      // Draw Semi-Circular Gauge
      const cx = width / 2;
      const cy = height - 30;
      const radius = Math.min(cx - 40, cy - 30);

      // Track Arc: Green (VIF 1-5), Amber (VIF 5-10), Red (VIF 10-25)
      const startAngle = Math.PI;
      const endAngle = 2 * Math.PI;

      ctx.lineWidth = 16;
      ctx.lineCap = 'round';

      // Green zone: 0 to 40%
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, Math.PI + Math.PI * 0.4);
      ctx.strokeStyle = THEME.green;
      ctx.stroke();

      // Amber zone: 40% to 65%
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI + Math.PI * 0.4, Math.PI + Math.PI * 0.65);
      ctx.strokeStyle = THEME.amber;
      ctx.stroke();

      // Red zone: 65% to 100%
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI + Math.PI * 0.65, 2 * Math.PI);
      ctx.strokeStyle = THEME.red;
      ctx.stroke();

      // Needle Angle
      // VIF range: 1 to 25 mapping to [PI, 2*PI]
      const normalizedVif = Math.min(25, vif);
      const needleAngle = Math.PI + ((normalizedVif - 1) / 24) * Math.PI;

      // Draw Needle
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(needleAngle) * (radius - 10), cy + Math.sin(needleAngle) * (radius - 10));
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Labels on Gauge
      ctx.font = '11px "DM Mono"';
      ctx.fillStyle = THEME.green;
      ctx.fillText('VIF = 1 (Orthogonal)', cx - radius - 15, cy + 18);
      ctx.fillStyle = THEME.amber;
      ctx.fillText('VIF = 5 (Threshold)', cx - 55, cy - radius - 8);
      ctx.fillStyle = THEME.red;
      ctx.fillText('VIF > 10 (Danger)', cx + radius - 60, cy + 18);

      // Update HUD
      hudR.textContent = r.toFixed(2);
      hudR2.textContent = r2.toFixed(3);
      hudVif.textContent = vif.toFixed(2);

      if (vif < 5.0) {
        hudStatus.textContent = 'Low Collinearity (Safe)';
        hudStatus.style.color = 'var(--green)';
        hudVif.style.color = 'var(--green)';
      } else if (vif <= 10.0) {
        hudStatus.textContent = 'Moderate Collinearity (Caution)';
        hudStatus.style.color = 'var(--amber)';
        hudVif.style.color = 'var(--amber)';
      } else {
        hudStatus.textContent = 'Severe Collinearity (Prune Feature!)';
        hudStatus.style.color = 'var(--red)';
        hudVif.style.color = 'var(--red)';
      }
    }

    rSlider.addEventListener('input', e => {
      r = parseFloat(e.target.value);
      rVal.textContent = r.toFixed(2);
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  // Export all simulators
  return {
    initRegressionLab,
    initClassificationLab,
    initClusteringLab,
    initConfusionMatrixLab,
    initLossFunctionsLab,
    initBiasVarianceLab,
    initFeatureSelectionLab
  };
}));
