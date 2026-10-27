const fs = require('fs');
const vm = require('vm');

let code = fs.readFileSync('visual-simulators.js', 'utf8');

const gdLabCode = `
  // ==========================================
  // Interactive Gradient Descent & Numerical Optimization Lab
  // Features: 2D Contour Ravine, Animated Trajectories, Optimizer Switcher (GD, Momentum, RMSprop, Adam),
  // Learning Rate Dynamics, Live Loss Convergence Curve, and Click-to-Place Coordinates.
  // ==========================================
  function initGradientDescentLab(containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;

    root.innerHTML = \`
      <div class="lab-card" style="margin-top:24px;">
        <div class="lab-header">
          <div class="lab-badge"><span class="pulse-dot"></span> Interactive Optimization Lab</div>
          <h3 class="lab-title">Gradient Descent Optimization Dynamics &amp; Trajectory Simulator</h3>
          <p class="lab-desc">
            Explore how first-order optimizers navigate an ill-conditioned anisotropic ravine $J(w_1, w_2) = \\\\frac{1}{2}(w_1^2 + \\\\kappa w_2^2)$. Observe how vanilla Gradient Descent oscillates across steep walls, while Momentum, RMSprop, and Adam accelerate smoothly toward the global minimum $(0, 0)$.
          </p>
        </div>

        <!-- Controls Bar -->
        <div class="lab-controls" style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; background:rgba(255,255,255,0.02); padding:16px; border-radius:12px; border:1px solid var(--line); margin-bottom:18px;">
          <!-- Optimizer Mode Buttons -->
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font:500 11.5px var(--mono); color:var(--muted); text-transform:uppercase; letter-spacing:.08em;">Optimizer Algorithm</label>
            <div style="display:flex; gap:6px; flex-wrap:wrap;" id="\${containerId}-opt-btns">
              <button class="filter on" data-opt="gd" style="padding:6px 12px; font-size:12px;">Batch GD</button>
              <button class="filter" data-opt="momentum" style="padding:6px 12px; font-size:12px;">Momentum</button>
              <button class="filter" data-opt="rmsprop" style="padding:6px 12px; font-size:12px;">RMSprop</button>
              <button class="filter" data-opt="adam" style="padding:6px 12px; font-size:12px;">Adam</button>
            </div>
          </div>

          <!-- Learning Rate Slider -->
          <div style="display:flex; flex-direction:column; gap:6px; min-width:180px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font:500 11.5px var(--mono); color:var(--muted); text-transform:uppercase; letter-spacing:.08em;">Learning Rate (&eta;)</label>
              <span id="\${containerId}-lr-val" style="font:600 12.5px var(--mono); color:var(--cyan);">0.080</span>
            </div>
            <input type="range" id="\${containerId}-lr-slider" min="0.01" max="0.25" step="0.005" value="0.080" style="width:100%;">
          </div>

          <!-- Ravine Curvature Slider -->
          <div style="display:flex; flex-direction:column; gap:6px; min-width:160px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font:500 11.5px var(--mono); color:var(--muted); text-transform:uppercase; letter-spacing:.08em;">Curvature (&kappa;)</label>
              <span id="\${containerId}-kappa-val" style="font:600 12.5px var(--mono); color:var(--violet-2);">8.0&times;</span>
            </div>
            <input type="range" id="\${containerId}-kappa-slider" min="1.0" max="15.0" step="0.5" value="8.0" style="width:100%;">
          </div>

          <!-- Playback Actions -->
          <div style="display:flex; gap:8px; align-items:flex-end; margin-left:auto;">
            <button class="button light small" id="\${containerId}-btn-play" style="padding:8px 14px; font-size:12.5px;">&#9654; Animate</button>
            <button class="button ghost small" id="\${containerId}-btn-step" style="padding:8px 14px; font-size:12.5px;">Step &rarr;</button>
            <button class="button ghost small" id="\${containerId}-btn-reset" style="padding:8px 14px; font-size:12.5px;">&#8634; Reset</button>
          </div>
        </div>

        <!-- Warning Callout for Overshooting -->
        <div id="\${containerId}-diverge-alert" style="display:none; padding:10px 14px; border-radius:8px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); margin-bottom:14px; font-size:13px; color:#fca5a5;">
          <strong>&#9888; Stability Alert:</strong> Learning rate $\\\\eta$ exceeds critical Lipschitz bound $\\\\frac{2}{\\\\lambda_{\\\\max}} = \\\\frac{2}{\\\\kappa}$! The optimizer is overshooting the valley and diverging toward infinity.
        </div>

        <!-- Dual Canvas Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px; margin-bottom:18px;">
          <!-- 2D Contour Canvas -->
          <div class="canvas-wrap" style="position:relative;">
            <span class="canvas-tag">2D Loss Surface Contours $J(w_1, w_2)$ &bull; Click to Reposition Start</span>
            <canvas id="\${containerId}-contour-canvas" height="300" style="width:100%; height:300px; cursor:crosshair;"></canvas>
          </div>

          <!-- Real-Time Convergence Loss Curve -->
          <div class="canvas-wrap">
            <span class="canvas-tag">Real-Time Loss Convergence Curve $\\\\ln J_t$ vs Iteration $t$</span>
            <canvas id="\${containerId}-loss-canvas" height="300" style="width:100%; height:300px;"></canvas>
          </div>
        </div>

        <!-- Live Diagnostics Telemetry -->
        <div class="telemetry-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px;">
          <div class="telem-card" style="background:#0e0e14; padding:12px 14px; border-radius:10px; border:1px solid var(--line);">
            <span style="font:500 10.5px var(--mono); color:var(--dim); text-transform:uppercase;">Iteration Step</span>
            <h4 id="\${containerId}-stat-step" style="font:600 17px var(--mono); color:var(--ink); margin-top:4px;">0 / 50</h4>
          </div>
          <div class="telem-card" style="background:#0e0e14; padding:12px 14px; border-radius:10px; border:1px solid var(--line);">
            <span style="font:500 10.5px var(--mono); color:var(--dim); text-transform:uppercase;">Weights (w1, w2)</span>
            <h4 id="\${containerId}-stat-w" style="font:600 15px var(--mono); color:var(--cyan); margin-top:4px;">(-3.50, 3.20)</h4>
          </div>
          <div class="telem-card" style="background:#0e0e14; padding:12px 14px; border-radius:10px; border:1px solid var(--line);">
            <span style="font:500 10.5px var(--mono); color:var(--dim); text-transform:uppercase;">Objective Loss J</span>
            <h4 id="\${containerId}-stat-loss" style="font:600 17px var(--mono); color:var(--violet-2); margin-top:4px;">47.090</h4>
          </div>
          <div class="telem-card" style="background:#0e0e14; padding:12px 14px; border-radius:10px; border:1px solid var(--line);">
            <span style="font:500 10.5px var(--mono); color:var(--dim); text-transform:uppercase;">Gradient Norm ||&nabla;J||</span>
            <h4 id="\${containerId}-stat-grad" style="font:600 17px var(--mono); color:var(--amber); margin-top:4px;">25.84</h4>
          </div>
          <div class="telem-card" style="background:#0e0e14; padding:12px 14px; border-radius:10px; border:1px solid var(--line);">
            <span style="font:500 10.5px var(--mono); color:var(--dim); text-transform:uppercase;">Convergence State</span>
            <h4 id="\${containerId}-stat-status" style="font:600 13.5px var(--mono); color:var(--green); margin-top:6px;">Ready</h4>
          </div>
        </div>
      </div>
    \`;

    const contourCanvas = document.getElementById(containerId + '-contour-canvas');
    const lossCanvas = document.getElementById(containerId + '-loss-canvas');
    if (!contourCanvas || !lossCanvas) return;

    const ctxContour = contourCanvas.getContext('2d');
    const ctxLoss = lossCanvas.getContext('2d');

    // State
    let currentOpt = 'gd';
    let lr = 0.080;
    let kappa = 8.0;
    let startW = { w1: -3.6, w2: 3.2 };
    let path = [{ w1: -3.6, w2: 3.2 }];
    let isPlaying = false;
    let animTimer = null;

    // Optimizer State Buffers
    let v_mom = { w1: 0, w2: 0 };
    let s_rms = { w1: 0, w2: 0 };
    let m_adam = { w1: 0, w2: 0 };
    let v_adam = { w1: 0, w2: 0 };
    let t_step = 0;

    function loss(w1, w2, k) {
      return 0.5 * (w1 * w1 + k * w2 * w2);
    }

    function grad(w1, w2, k) {
      return { dw1: w1, dw2: k * w2 };
    }

    function resetSimulation() {
      if (animTimer) clearInterval(animTimer);
      isPlaying = false;
      document.getElementById(containerId + '-btn-play').textContent = '▶ Animate';
      t_step = 0;
      path = [{ w1: startW.w1, w2: startW.w2 }];
      v_mom = { w1: 0, w2: 0 };
      s_rms = { w1: 0, w2: 0 };
      m_adam = { w1: 0, w2: 0 };
      v_adam = { w1: 0, w2: 0 };
      updateTelemetry();
      render();
    }

    function step() {
      if (path.length >= 60) return;
      t_step++;
      const cur = path[path.length - 1];
      const g = grad(cur.w1, cur.w2, kappa);
      let nextW = { w1: cur.w1, w2: cur.w2 };

      if (currentOpt === 'gd') {
        nextW.w1 = cur.w1 - lr * g.dw1;
        nextW.w2 = cur.w2 - lr * g.dw2;
      } else if (currentOpt === 'momentum') {
        const beta = 0.85;
        v_mom.w1 = beta * v_mom.w1 + lr * g.dw1;
        v_mom.w2 = beta * v_mom.w2 + lr * g.dw2;
        nextW.w1 = cur.w1 - v_mom.w1;
        nextW.w2 = cur.w2 - v_mom.w2;
      } else if (currentOpt === 'rmsprop') {
        const beta = 0.90;
        const eps = 1e-8;
        s_rms.w1 = beta * s_rms.w1 + (1 - beta) * (g.dw1 * g.dw1);
        s_rms.w2 = beta * s_rms.w2 + (1 - beta) * (g.dw2 * g.dw2);
        nextW.w1 = cur.w1 - (lr / (Math.sqrt(s_rms.w1) + eps)) * g.dw1;
        nextW.w2 = cur.w2 - (lr / (Math.sqrt(s_rms.w2) + eps)) * g.dw2;
      } else if (currentOpt === 'adam') {
        const b1 = 0.90, b2 = 0.999, eps = 1e-8;
        m_adam.w1 = b1 * m_adam.w1 + (1 - b1) * g.dw1;
        m_adam.w2 = b1 * m_adam.w2 + (1 - b1) * g.dw2;
        v_adam.w1 = b2 * v_adam.w1 + (1 - b2) * (g.dw1 * g.dw1);
        v_adam.w2 = b2 * v_adam.w2 + (1 - b2) * (g.dw2 * g.dw2);
        
        const m_hat1 = m_adam.w1 / (1 - Math.pow(b1, t_step));
        const m_hat2 = m_adam.w2 / (1 - Math.pow(b1, t_step));
        const v_hat1 = v_adam.w1 / (1 - Math.pow(b2, t_step));
        const v_hat2 = v_adam.w2 / (1 - Math.pow(b2, t_step));

        nextW.w1 = cur.w1 - (lr / (Math.sqrt(v_hat1) + eps)) * m_hat1;
        nextW.w2 = cur.w2 - (lr / (Math.sqrt(v_hat2) + eps)) * m_hat2;
      }

      // Check bounds
      if (Math.abs(nextW.w1) > 25 || Math.abs(nextW.w2) > 25) {
        // Diverged
        path.push(nextW);
        if (animTimer) clearInterval(animTimer);
        isPlaying = false;
        document.getElementById(containerId + '-btn-play').textContent = '▶ Animate';
        updateTelemetry(true);
        render();
        return;
      }

      path.push(nextW);
      updateTelemetry();
      render();
    }

    function updateTelemetry(diverged = false) {
      const cur = path[path.length - 1];
      const curLoss = loss(cur.w1, cur.w2, kappa);
      const g = grad(cur.w1, cur.w2, kappa);
      const gradNorm = Math.sqrt(g.dw1 * g.dw1 + g.dw2 * g.dw2);

      document.getElementById(containerId + '-stat-step').textContent = (path.length - 1) + ' / 60';
      document.getElementById(containerId + '-stat-w').textContent = '(' + cur.w1.toFixed(2) + ', ' + cur.w2.toFixed(2) + ')';
      document.getElementById(containerId + '-stat-loss').textContent = curLoss > 9999 ? '∞ (Diverged)' : curLoss.toFixed(3);
      document.getElementById(containerId + '-stat-grad').textContent = gradNorm > 9999 ? '∞' : gradNorm.toFixed(2);

      const statusEl = document.getElementById(containerId + '-stat-status');
      const alertEl = document.getElementById(containerId + '-diverge-alert');

      // Check stability limit
      const maxAllowedLr = 2.0 / kappa;
      if (lr > maxAllowedLr && currentOpt === 'gd') {
        alertEl.style.display = 'block';
      } else {
        alertEl.style.display = 'none';
      }

      if (diverged || curLoss > 500) {
        statusEl.textContent = 'Diverging (Unstable)';
        statusEl.style.color = '#ef4444';
      } else if (gradNorm < 0.05) {
        statusEl.textContent = 'Converged (Minimum)';
        statusEl.style.color = '#10b981';
      } else if (path.length > 8 && Math.abs(path[path.length-1].w2 - path[path.length-3].w2) > 1.0 && currentOpt === 'gd') {
        statusEl.textContent = 'Oscillating Across Ravine';
        statusEl.style.color = '#f59e0b';
      } else {
        statusEl.textContent = 'Descending Downhill';
        statusEl.style.color = '#56d9ff';
      }
    }

    function renderContour() {
      const dpr = window.devicePixelRatio || 1;
      const rect = contourCanvas.getBoundingClientRect();
      contourCanvas.width = rect.width * dpr;
      contourCanvas.height = rect.height * dpr;
      ctxContour.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;
      const cx = W / 2;
      const cy = H / 2;
      const scale = Math.min(W, H) / 9.5;

      // Background
      ctxContour.fillStyle = '#08080c';
      ctxContour.fillRect(0, 0, W, H);

      // Axes
      ctxContour.strokeStyle = 'rgba(255,255,255,0.06)';
      ctxContour.lineWidth = 1;
      ctxContour.beginPath();
      ctxContour.moveTo(0, cy); ctxContour.lineTo(W, cy);
      ctxContour.moveTo(cx, 0); ctxContour.lineTo(cx, H);
      ctxContour.stroke();

      // Draw Equipotential Elliptical Contours: 0.5 * (w1^2 + k*w2^2) = C
      const levels = [0.5, 2.0, 5.0, 10.0, 18.0, 30.0, 50.0];
      levels.forEach(L => {
        const r1 = Math.sqrt(2 * L) * scale;
        const r2 = Math.sqrt(2 * L / kappa) * scale;
        ctxContour.beginPath();
        ctxContour.ellipse(cx, cy, r1, r2, 0, 0, 2 * Math.PI);
        ctxContour.strokeStyle = 'rgba(140, 124, 255, 0.16)';
        ctxContour.lineWidth = 1.2;
        ctxContour.stroke();

        // Level text
        ctxContour.fillStyle = 'rgba(255,255,255,0.2)';
        ctxContour.font = '9px monospace';
        ctxContour.fillText('J=' + L, cx + r1 + 3, cy - 2);
      });

      // Target Minimum at (0, 0)
      ctxContour.beginPath();
      ctxContour.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctxContour.fillStyle = '#10b981';
      ctxContour.shadowColor = '#10b981';
      ctxContour.shadowBlur = 10;
      ctxContour.fill();
      ctxContour.shadowBlur = 0;

      // Draw Trajectory Trail
      if (path.length > 1) {
        ctxContour.beginPath();
        const p0x = cx + path[0].w1 * scale;
        const p0y = cy - path[0].w2 * scale;
        ctxContour.moveTo(p0x, p0y);

        for (let i = 1; i < path.length; i++) {
          const px = cx + path[i].w1 * scale;
          const py = cy - path[i].w2 * scale;
          ctxContour.lineTo(px, py);
        }

        const colorMap = {
          gd: '#ef4444',
          momentum: '#f59e0b',
          rmsprop: '#56d9ff',
          adam: '#8c7cff'
        };
        ctxContour.strokeStyle = colorMap[currentOpt] || '#8c7cff';
        ctxContour.lineWidth = 2.4;
        ctxContour.stroke();

        // Step Dots
        for (let i = 0; i < path.length; i++) {
          const px = cx + path[i].w1 * scale;
          const py = cy - path[i].w2 * scale;
          ctxContour.beginPath();
          ctxContour.arc(px, py, i === path.length - 1 ? 5 : 2.5, 0, 2 * Math.PI);
          ctxContour.fillStyle = i === path.length - 1 ? '#ffffff' : colorMap[currentOpt];
          if (i === path.length - 1) {
            ctxContour.shadowColor = colorMap[currentOpt];
            ctxContour.shadowBlur = 12;
          }
          ctxContour.fill();
          ctxContour.shadowBlur = 0;
        }
      }
    }

    function renderLossCurve() {
      const dpr = window.devicePixelRatio || 1;
      const rect = lossCanvas.getBoundingClientRect();
      lossCanvas.width = rect.width * dpr;
      lossCanvas.height = rect.height * dpr;
      ctxLoss.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;
      const pad = 36;

      ctxLoss.fillStyle = '#08080c';
      ctxLoss.fillRect(0, 0, W, H);

      // Axes
      ctxLoss.strokeStyle = 'rgba(255,255,255,0.08)';
      ctxLoss.lineWidth = 1;
      ctxLoss.beginPath();
      ctxLoss.moveTo(pad, H - pad); ctxLoss.lineTo(W - pad, H - pad);
      ctxLoss.moveTo(pad, pad); ctxLoss.lineTo(pad, H - pad);
      ctxLoss.stroke();

      // Axis labels
      ctxLoss.fillStyle = '#9a9aa5';
      ctxLoss.font = '10px monospace';
      ctxLoss.fillText('Step t', W - pad - 30, H - pad + 24);
      ctxLoss.fillText('Loss J_t', pad - 24, pad - 12);

      if (path.length <= 1) {
        ctxLoss.fillStyle = 'rgba(255,255,255,0.2)';
        ctxLoss.fillText('Press "Animate" or "Step" to track convergence', pad + 20, H / 2);
        return;
      }

      // Plot loss curve
      const losses = path.map(p => Math.min(loss(p.w1, p.w2, kappa), 100));
      const maxLoss = Math.max(...losses, 10);
      const stepWidth = (W - 2 * pad) / 50;

      ctxLoss.beginPath();
      losses.forEach((l, idx) => {
        const x = pad + idx * stepWidth;
        const normH = (l / maxLoss) * (H - 2 * pad);
        const y = (H - pad) - normH;
        if (idx === 0) ctxLoss.moveTo(x, y);
        else ctxLoss.lineTo(x, y);
      });

      ctxLoss.strokeStyle = '#56d9ff';
      ctxLoss.lineWidth = 2.2;
      ctxLoss.stroke();

      // Highlight current point
      const lastL = losses[losses.length - 1];
      const lx = pad + (losses.length - 1) * stepWidth;
      const ly = (H - pad) - (lastL / maxLoss) * (H - 2 * pad);
      ctxLoss.beginPath();
      ctxLoss.arc(lx, ly, 4.5, 0, 2 * Math.PI);
      ctxLoss.fillStyle = '#ffffff';
      ctxLoss.shadowColor = '#56d9ff';
      ctxLoss.shadowBlur = 8;
      ctxLoss.fill();
      ctxLoss.shadowBlur = 0;
    }

    function render() {
      renderContour();
      renderLossCurve();
    }

    // Event Listeners
    // Optimizer switch
    document.querySelectorAll('#' + containerId + '-opt-btns .filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#' + containerId + '-opt-btns .filter').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        currentOpt = btn.dataset.opt;
        resetSimulation();
      });
    });

    // Learning rate slider
    const lrSlider = document.getElementById(containerId + '-lr-slider');
    lrSlider.addEventListener('input', e => {
      lr = parseFloat(e.target.value);
      document.getElementById(containerId + '-lr-val').textContent = lr.toFixed(3);
      resetSimulation();
    });

    // Curvature slider
    const kappaSlider = document.getElementById(containerId + '-kappa-slider');
    kappaSlider.addEventListener('input', e => {
      kappa = parseFloat(e.target.value);
      document.getElementById(containerId + '-kappa-val').textContent = kappa.toFixed(1) + '×';
      resetSimulation();
    });

    // Buttons
    const btnPlay = document.getElementById(containerId + '-btn-play');
    btnPlay.addEventListener('click', () => {
      if (isPlaying) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlay.textContent = '▶ Animate';
      } else {
        if (path.length >= 60) resetSimulation();
        isPlaying = true;
        btnPlay.textContent = '⏸ Pause';
        animTimer = setInterval(() => {
          step();
          if (path.length >= 60) {
            clearInterval(animTimer);
            isPlaying = false;
            btnPlay.textContent = '▶ Animate';
          }
        }, 80);
      }
    });

    document.getElementById(containerId + '-btn-step').addEventListener('click', step);
    document.getElementById(containerId + '-btn-reset').addEventListener('click', resetSimulation);

    // Click to place start coordinates
    contourCanvas.addEventListener('click', e => {
      const rect = contourCanvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const scale = Math.min(rect.width, rect.height) / 9.5;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      startW = {
        w1: (mx - cx) / scale,
        w2: (cy - my) / scale
      };
      resetSimulation();
    });

    window.addEventListener('resize', render);
    resetSimulation();
  }
`;

// Insert initGradientDescentLab before the export object in visual-simulators.js
const exportMarker = '  // Export all simulators\n  return {';
const newExport = `    initGradientDescentLab,\n    initOptimizationSolversLab`;

if (code.includes(exportMarker)) {
  code = code.replace(exportMarker, gdLabCode + '\n' + exportMarker);
  code = code.replace('initOptimizationSolversLab', newExport);
  fs.writeFileSync('visual-simulators.js', code);
  console.log('Successfully inserted initGradientDescentLab into visual-simulators.js!');
  
  // Syntax check via Node VM
  try {
    new vm.Script(fs.readFileSync('visual-simulators.js', 'utf8'));
    console.log('Syntax OK! No parse errors in visual-simulators.js');
  } catch (err) {
    console.error('Syntax ERROR in visual-simulators.js:', err.message);
  }
} else {
  console.error('Could not find exportMarker in visual-simulators.js');
}
