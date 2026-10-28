// Interactive architecture diagrams. Every part of the network is a hotspot: hover (mouse),
// tap (touch) or focus (keyboard) to open its explanation card below the diagram.
(function (root) {
  'use strict';
  const { T, alpha } = root.Lab;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // a small inline picture used inside some info cards
  const strideSVG = `<svg viewBox="0 0 260 74" class="arch-mini" aria-hidden="true">
    ${[0, 1].map(r => `<g transform="translate(${r * 132},0)">
      <text x="2" y="10" fill="${T.muted}" font-size="10" font-family="DM Mono, monospace">stride ${r + 1}</text>
      ${Array.from({ length: 7 }, (_, i) => `<rect x="${2 + i * 16}" y="18" width="14" height="14" rx="2" fill="rgba(255,255,255,0.06)"/>`).join('')}
      ${(r ? [0, 2, 4] : [0, 1, 2, 3, 4]).map((p, j, arr) => `<rect x="${1 + p * 16}" y="${36 + (r ? 0 : 0)}" width="46" height="14" rx="3" fill="none" stroke="${T.amber}" stroke-opacity="${0.35 + 0.65 * (j / (arr.length - 1 || 1))}" transform="translate(0,${j * 6})"/>`).join('')}
    </g>`).join('')}
  </svg>`;
  const paddingSVG = `<svg viewBox="0 0 260 90" class="arch-mini" aria-hidden="true">
    ${[0, 1].map(r => `<g transform="translate(${r * 132},0)">
      <text x="2" y="10" fill="${T.muted}" font-size="10" font-family="DM Mono, monospace">${r ? 'same (pad 1): 5 → 5' : 'valid (no pad): 5 → 3'}</text>
      ${Array.from({ length: r ? 7 : 5 }, (_, i) => Array.from({ length: r ? 7 : 5 }, (_, j) => {
        const border = r && (i === 0 || j === 0 || i === 6 || j === 6);
        return `<rect x="${2 + j * 10}" y="${18 + i * 10}" width="9" height="9" rx="1.5" fill="${border ? 'rgba(255,255,255,0.03)' : alpha(T.violet2, 0.45)}" stroke="${border ? 'rgba(255,255,255,0.18)' : 'none'}" stroke-dasharray="2 2"/>`;
      }).join('')).join('')}
      <rect x="1" y="17" width="31" height="31" rx="3" fill="none" stroke="${T.amber}" stroke-width="1.4"/>
    </g>`).join('')}
  </svg>`;

  // ------------------------------------------------------------------ CNN for 28x28 digits
  const CNN = {
    title: 'A small CNN for handwritten digits',
    total: '207,214 parameters (206,922 without the optional attention block)',
    items: [
      { id: 'input', kind: 'input', label: 'Input', shape: '28×28×1', color: T.violet2, w: 70, h: 70, d: 4,
        info: { title: 'Input image', tag: 'Data', io: '28 × 28 × 1', params: '0',
          body: 'A grayscale handwritten digit: 28 pixels tall, 28 wide, 1 channel. Every pixel is a brightness number, usually scaled from 0–255 down to 0–1 before training.',
          more: 'A colour photo would be H × W × <strong>3</strong> (red, green, blue). The network never sees “a 7”: only this grid of 784 numbers.' } },
      { id: 'conv1', kind: 'block', label: 'Conv 1', shape: '28×28×16', color: T.cyan, w: 70, h: 70, d: 30,
        badges: [['kernel', '3×3 kernel'], ['stride', 'stride 1'], ['padding', 'pad same']],
        info: { title: 'Convolution layer 1', tag: 'Conv2d(1 → 16, kernel 3×3)', io: '28×28×1 → 28×28×16', params: '160 = (3·3·1 + 1) × 16',
          body: 'Sixteen small filters slide across the image. At every position each filter multiplies a 3×3 patch by its 9 weights, adds them up plus a bias, and writes one number. One filter → one feature map; sixteen filters → sixteen maps stacked as channels.',
          more: 'The filters start as random numbers and are learned by backpropagation. In a first layer they usually become edge, stroke and blob detectors.' } },
      { id: 'relu1', kind: 'op', label: 'ReLU', color: T.amber, info: 'relu' },
      { id: 'pool1', kind: 'block', label: 'Max pool', shape: '14×14×16', color: T.green, w: 46, h: 46, d: 30,
        badges: [['poolstride', '2×2, stride 2']],
        info: { title: 'Max pooling 2×2', tag: 'MaxPool2d(2)', io: '28×28×16 → 14×14×16', params: '0 (nothing to learn)',
          body: 'Looks at each 2×2 window of every feature map and keeps only the largest value. Height and width are halved; the number of channels stays the same.',
          more: 'It keeps the strongest evidence (“there is an edge somewhere here”) and makes the network a little tolerant to small shifts. Average pooling takes the mean instead; some modern networks use a stride-2 convolution in place of pooling.' } },
      { id: 'conv2', kind: 'block', label: 'Conv 2', shape: '14×14×32', color: T.cyan, w: 46, h: 46, d: 48,
        badges: [['kernel', '3×3 kernel']],
        info: { title: 'Convolution layer 2', tag: 'Conv2d(16 → 32, kernel 3×3)', io: '14×14×16 → 14×14×32', params: '4,640 = (3·3·16 + 1) × 32',
          body: 'Each of the 32 filters is now 3×3×<strong>16</strong>: one 3×3 slice per input channel. It looks at all sixteen edge maps at once and combines them into something richer: corners, curves, stroke endings.',
          more: 'A neuron here sees a 3×3 window of layer-1 maps, which already summarise pooled regions of the image, so its <strong>receptive field</strong> on the original digit is about 8×8 pixels. Depth = larger view.' } },
      { id: 'relu2', kind: 'op', label: 'ReLU', color: T.amber, info: 'relu' },
      { id: 'pool2', kind: 'block', label: 'Max pool', shape: '7×7×32', color: T.green, w: 30, h: 30, d: 48,
        badges: [['poolstride', '2×2, stride 2']],
        info: { title: 'Max pooling 2×2', tag: 'MaxPool2d(2)', io: '14×14×32 → 7×7×32', params: '0',
          body: 'Halves the maps again. After two pool layers each of the 7×7 positions summarises a 4×4 region of the original image.',
          more: 'Spatial size shrinks (28 → 14 → 7) while the number of channels grows (1 → 16 → 32): the network trades “where” for “what”.' } },
      { id: 'attn', kind: 'attn', label: 'Attention', shape: 'optional', color: T.pink,
        info: { title: 'Channel attention (optional)', tag: 'Squeeze-and-Excitation block', io: '7×7×32 → 7×7×32', params: '292 (32 → 4 → 32)',
          body: 'Not part of a classic CNN, but common in modern ones (SE-Net, EfficientNet, CBAM). It <strong>squeezes</strong> each of the 32 channels to one number by averaging, passes those 32 numbers through a tiny two-layer network, and outputs a weight between 0 and 1 per channel. Every feature map is then multiplied by its weight.',
          more: 'So, for this particular image, the network can turn up the useful channels and turn down the noisy ones. Spatial attention (in CBAM) does the same per location. Vision Transformers go further and replace convolution with self-attention between image patches.' } },
      { id: 'flatten', kind: 'vec', label: 'Flatten', shape: '1,568', color: T.violet2, h: 110,
        info: { title: 'Flatten', tag: 'reshape', io: '7×7×32 → 1,568', params: '0',
          body: 'Unrolls the 3-D block of numbers into one long vector (7 × 7 × 32 = 1,568) so an ordinary dense layer can read it.',
          more: 'Many modern CNNs use <strong>global average pooling</strong> here instead: one average per channel (32 numbers), which removes most of the weights in the next layer.' } },
      { id: 'dense', kind: 'nodes', label: 'Dense', shape: '128', color: T.violet, h: 110,
        info: { title: 'Fully connected layer', tag: 'Linear(1568 → 128) + ReLU', io: '1,568 → 128', params: '200,832 = 1,568 × 128 + 128',
          body: 'Every one of the 1,568 inputs connects to every one of 128 neurons. This is where evidence from all over the image is combined: “a horizontal stroke at the top and a diagonal below” → probably a 7.',
          more: 'This single layer holds about 97% of all the weights in this network, which is exactly why global average pooling became popular.' } },
      { id: 'output', kind: 'out', label: 'Softmax', shape: '10 classes', color: T.amber, h: 110,
        info: { title: 'Output layer + softmax', tag: 'Linear(128 → 10) + softmax', io: '128 → 10', params: '1,290 = 128 × 10 + 10',
          body: 'One score (a logit) per digit 0–9. Softmax turns the ten scores into probabilities that are positive and add up to 1; the prediction is the most probable class.',
          more: 'During training, cross-entropy loss compares these probabilities with the true label, and its gradient flows back through every layer to adjust all 207k weights.' } },
    ],
    extra: {
      relu: { title: 'ReLU activation', tag: 'max(0, x), applied to every value', io: 'same shape in and out', params: '0',
        body: 'Replaces every negative number with zero and leaves positive numbers alone. A feature map then only says where a pattern <em>is</em>, not where its opposite is.',
        more: 'Without a non-linearity, two convolution layers in a row would collapse into one bigger linear filter, and depth would add nothing.' },
      kernel: { title: 'Kernel (filter) size', tag: 'hyperparameter', io: '3 × 3 here', params: 'weights per filter = k × k × input channels',
        body: 'How large a patch each filter looks at. 3×3 is the modern default.',
        more: 'Two stacked 3×3 layers see a 5×5 area with 18 weights per channel; a single 5×5 layer needs 25, and has one non-linearity fewer.' },
      stride: { title: 'Stride', tag: 'hyperparameter', io: 'output = ⌊(n + 2p − k) / s⌋ + 1', params: 'here: (28 + 2 − 3) / 1 + 1 = 28',
        body: 'How many pixels the filter moves between positions. Stride 1 visits every position; stride 2 skips every other one, so the output is about half as wide and half as tall.',
        more: strideSVG + '<br>Larger strides are a cheap way to downsample, at the cost of detail.' },
      padding: { title: 'Padding', tag: 'hyperparameter', io: '“same”: 1 pixel of zeros for a 3×3 kernel', params: 'here: output stays 28 × 28',
        body: 'Extra zeros added around the border so the filter can also sit on edge pixels. With “same” padding the output keeps the input size; with “valid” (no padding) a 3×3 kernel shrinks each side by 2.',
        more: paddingSVG + '<br>Without padding, pixels at the border are seen by fewer filter positions and the maps shrink layer after layer.' },
      poolstride: { title: 'Pooling window and stride', tag: '2 × 2, stride 2', io: 'halves height and width', params: '0',
        body: 'The pooling window is 2×2 and moves 2 pixels at a time, so windows do not overlap and every value is looked at exactly once.',
        more: 'Overlapping pooling (for example 3×3 with stride 2) was used in AlexNet; non-overlapping 2×2 is the usual choice today.' },
    },
  };


  // ------------------------------------------------------------------ linear regression pipeline (California housing sample)
  const box = (g, x, y, w, h, c, dashed) => el('rect', { x, y, width: w, height: h, rx: 10, fill: alpha(c, 0.12), stroke: c, 'stroke-width': 1.2, 'stroke-dasharray': dashed ? '4 3' : 'none' }, g);
  const txt = (g, x, y, s, cls = 'arch-shape', anchor = 'middle', fill) => { const t = el('text', { x, y, 'text-anchor': anchor, class: cls }, g); if (fill) t.setAttribute('style', `fill:${fill}`); t.textContent = s; return t; };
  const LINREG = {
    title: 'The linear regression workflow, end to end',
    labels: ['At a glance', 'In this fit'],
    total: 'Fitted on 400 rows of the California housing sample · test R² = 0.792 · test RMSE = 0.436 ($100k units)',
    items: [
      { id: 'data', kind: 'custom', label: 'Data', shape: '400 rows × 8 + y', color: T.violet2, w: 78, h: 66,
        badges: [['features', 'features X'], ['target', 'target y']],
        draw: (g, l, t) => { box(g, l, t, 78, 66, T.violet2); for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) el('rect', { x: l + 7 + j * 11, y: t + 8 + i * 10.5, width: 9, height: 8, rx: 1.5, fill: j === 5 ? alpha(T.amber, 0.8) : alpha(T.violet2, 0.35 + ((i * 7 + j * 3) % 5) * 0.1) }, g); },
        info: { title: 'The data', tag: 'table: one row per example', io: '400 training rows · 8 numeric features + 1 target', params: '—',
          body: 'Each row is one district: median income, house age, average rooms, bedrooms, population, occupancy, latitude and longitude. The column we want to predict, the <strong>target</strong> y, is the median house value (in $100,000s).',
          more: 'Linear regression needs numeric features. Categories are one-hot encoded first; missing values are imputed. 100 further rows are kept aside as a test set and never used for fitting.' } },
      { id: 'design', kind: 'custom', label: 'Design matrix', shape: '400 × 9', color: T.cyan, w: 70, h: 66,
        badges: [['ones', 'column of 1s'], ['scaling', 'scaling']],
        draw: (g, l, t) => { box(g, l, t, 70, 66, T.cyan); for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) el('rect', { x: l + 7 + j * 11.5, y: t + 8 + i * 10.5, width: 9.5, height: 8, rx: 1.5, fill: j === 0 ? alpha(T.amber, 0.9) : alpha(T.cyan, 0.35) }, g); txt(g, l + 11.5, t + 62, '1', 'arch-small'); },
        info: { title: 'Design matrix X', tag: 'n × (p + 1)', io: '400 × 8 → 400 × 9', params: '—',
          body: 'The features are stacked into a matrix X with one row per example, and a <strong>column of 1s</strong> is added in front. That column lets the model learn an intercept with the same maths as every other weight.',
          more: 'Plain OLS predictions do not change if you rescale features, but scaling makes coefficients comparable and is required once you add a penalty (ridge, lasso).' } },
      { id: 'model', kind: 'custom', label: 'Model', shape: 'ŷ = Xβ', color: T.violet, w: 76, h: 66,
        badges: [['weights', 'weights β'], ['intercept', 'intercept β₀']],
        draw: (g, l, t) => { box(g, l, t, 76, 66, T.violet); txt(g, l + 38, t + 26, 'ŷ = Xβ', 'arch-label'); [0.8, 0.2, 0.5, 0.35, 0.1, 0.6].forEach((v, k) => el('rect', { x: l + 10 + k * 9.5, y: t + 58 - v * 20, width: 6.5, height: v * 20, rx: 1.5, fill: alpha(T.violet2, 0.85) }, g)); },
        info: { title: 'The model', tag: 'a weighted sum', io: 'one row of X → one prediction ŷ', params: '9 = 8 weights + 1 intercept',
          body: 'Every prediction is ŷ = β₀ + β₁x₁ + β₂x₂ + … + β₈x₈: multiply each feature by its weight, add them up, add the intercept. In matrix form, all 400 predictions at once: <strong>ŷ = Xβ</strong>.',
          more: 'That is the entire model. Its flexibility is limited to straight lines (hyperplanes), which is both its weakness and why it is so easy to read.' } },
      { id: 'residuals', kind: 'custom', label: 'Residuals', shape: 'e = y − ŷ', color: T.amber, w: 70, h: 66,
        draw: (g, l, t) => { box(g, l, t, 70, 66, T.amber); el('line', { x1: l + 6, y1: t + 54, x2: l + 64, y2: t + 14, stroke: T.cyan, 'stroke-width': 1.6 }, g); [[14, 34], [26, 52], [38, 26], [50, 40], [58, 14]].forEach(([dx, dy]) => { const ly = t + 54 - (dx - 6) * 40 / 58; el('line', { x1: l + dx, y1: t + dy, x2: l + dx, y2: ly, stroke: T.amber, 'stroke-dasharray': '2 2' }, g); el('circle', { cx: l + dx, cy: t + dy, r: 3, fill: T.violet2 }, g); }); },
        info: { title: 'Residuals', tag: 'the errors', io: '400 predictions → 400 residuals', params: '—',
          body: 'For every training row, the residual is what the model got wrong: <strong>e = y − ŷ</strong>, the vertical distance from the point to the line. Positive means the model predicted too low, negative too high.',
          more: 'Good residuals look like structureless noise. A pattern (a curve, a funnel) means the model is missing something.' } },
      { id: 'loss', kind: 'custom', label: 'Loss', shape: 'MSE', color: T.pink, w: 70, h: 66,
        badges: [['squared', 'why squared?']],
        draw: (g, l, t) => { box(g, l, t, 70, 66, T.pink); el('path', { d: `M${l + 10} ${t + 12} Q${l + 35} ${t + 100} ${l + 60} ${t + 12}`, fill: 'none', stroke: T.pink, 'stroke-width': 2 }, g); el('circle', { cx: l + 35, cy: t + 56, r: 3.5, fill: T.amber }, g); },
        info: { title: 'Loss: mean squared error', tag: 'one number to minimise', io: '400 residuals → 1 number', params: '—',
          body: 'All errors are combined into one score: <strong>MSE = (1/n) Σ eᵢ²</strong> (or the sum, RSS; same minimum). Fitting the model means finding the β that makes this number as small as possible.',
          more: 'As a function of β, MSE is a smooth bowl with a single lowest point, which is why linear regression always has one best answer (when features are not perfectly collinear).' } },
      { id: 'solver', kind: 'custom', label: 'Solver', shape: 'find best β', color: T.green, w: 70, h: 66,
        badges: [['normal', 'normal equation'], ['gd', 'gradient descent']],
        draw: (g, l, t) => { box(g, l, t, 70, 66, T.green); el('path', { d: `M${l + 12} ${t + 50} C${l + 26} ${t + 14} ${l + 40} ${t + 60} ${l + 58} ${t + 18}`, fill: 'none', stroke: alpha(T.green, 0.5), 'stroke-dasharray': '3 3' }, g); [[12, 50], [24, 34], [34, 38], [44, 33], [58, 18]].forEach(([dx, dy], k) => el('circle', { cx: l + dx, cy: t + dy, r: 2.5 + k * 0.4, fill: T.green }, g)); },
        info: { title: 'Solver', tag: 'how β is found', io: 'X, y → β', params: '—',
          body: 'For linear regression the bowl’s bottom can be computed exactly with the <strong>normal equation</strong>, or approached step by step with <strong>gradient descent</strong>. Both give the same answer on this data.',
          more: 'scikit-learn’s LinearRegression uses a least-squares solver based on matrix decompositions (not an explicit inverse), which is fast and numerically stable for thousands of features.' } },
      { id: 'fitted', kind: 'custom', label: 'Fitted model', shape: '9 numbers', color: T.cyan, w: 76, h: 66,
        badges: [['coef', 'reading β']],
        draw: (g, l, t) => { box(g, l, t, 76, 66, T.cyan); const v = [0.36, 0.01, -0.01, 0.06, 0, 0, -0.1, -0.01]; v.forEach((c, k) => { const h = Math.abs(c) * 70; el('rect', { x: l + 8 + k * 8, y: c >= 0 ? t + 36 - h : t + 36, width: 5.5, height: Math.max(1, h), rx: 1, fill: c >= 0 ? alpha(T.cyan, 0.9) : alpha(T.pink, 0.9) }, g); }); el('line', { x1: l + 6, y1: t + 36, x2: l + 70, y2: t + 36, stroke: 'rgba(255,255,255,0.3)' }, g); },
        info: { title: 'The fitted model', tag: 'β learned from 400 rows', io: 'intercept 2.04 + 8 weights', params: 'MedInc +0.363 · Latitude −0.096 · AveBedrms +0.060 …',
          body: 'This is all a trained linear regression stores. MedInc +0.363 means: with all other features held fixed, one extra unit of median income ($10k) goes with +0.363 × $100k ≈ <strong>$36,000</strong> higher predicted house value.',
          more: 'Coefficients are in the units of their features, so raw sizes are not comparable (Population’s weight looks like 0 only because it is measured in people). Standardise first to compare, and never read them as causal effects.' } },
      { id: 'eval', kind: 'custom', label: 'Evaluation', shape: 'on held-out data', color: T.amber, w: 70, h: 66,
        badges: [['r2', 'R²'], ['rmse', 'RMSE'], ['resplot', 'residual plot']],
        draw: (g, l, t) => { box(g, l, t, 70, 66, T.amber); el('path', { d: `M${l + 12} ${t + 50} A23 23 0 0 1 ${l + 58} ${t + 50}`, fill: 'none', stroke: 'rgba(255,255,255,0.15)', 'stroke-width': 6 }, g); el('path', { d: `M${l + 12} ${t + 50} A23 23 0 0 1 ${l + 52} ${t + 36}`, fill: 'none', stroke: T.amber, 'stroke-width': 6 }, g); txt(g, l + 35, t + 60, '0.79', 'arch-small', 'middle', T.amber); },
        info: { title: 'Evaluation', tag: 'on the 100 test rows', io: 'test R² 0.792 · RMSE 0.436', params: 'baseline (predict the mean): R² 0.00 · RMSE 0.957',
          body: 'The model is judged on rows it never saw. It explains about 79% of the variance in house values and is off by about $44k on a typical district, against $96k for always guessing the average.',
          more: 'Training R² (0.82) is a little higher than test R² (0.79): a small, healthy gap. A large gap would mean overfitting.' } },
      { id: 'assume', kind: 'custom', label: 'Assumptions', shape: 'check before trusting', color: T.green, w: 70, h: 66,
        badges: [['linearity', 'linearity'], ['independence', 'independence'], ['equalvar', 'equal variance'], ['normality', 'normal errors'], ['collinear', 'multicollinearity']],
        draw: (g, l, t) => { box(g, l, t, 70, 66, T.green, true); for (let k = 0; k < 4; k++) { el('path', { d: `M${l + 12} ${t + 14 + k * 13} l3 3 l6 -6`, fill: 'none', stroke: T.green, 'stroke-width': 1.6 }, g); el('rect', { x: l + 26, y: t + 13 + k * 13, width: 32 - (k % 2) * 8, height: 4, rx: 2, fill: alpha(T.green, 0.45) }, g); } },
        info: { title: 'Assumptions', tag: 'what OLS takes for granted', io: 'L · I · N · E + no multicollinearity', params: '—',
          body: 'Predictions can be useful even when these are bent a little, but the coefficients, their standard errors and confidence intervals are only trustworthy when they roughly hold. Tap each tag to see how to check it.',
          more: 'A handy mnemonic is <strong>LINE</strong>: Linearity, Independence, Normal errors, Equal variance.' } },
    ],
    extra: {
      features: { title: 'Features X', tag: 'inputs, also called predictors', io: '8 columns', params: '—', body: 'The measurable things we predict from: here income, house age, rooms, bedrooms, population, occupancy, latitude and longitude.', more: 'More features are not always better: irrelevant or near-duplicate features add noise and instability.' },
      target: { title: 'Target y', tag: 'what we predict', io: 'MedHouseVal, in $100,000s', params: '—', body: 'A continuous number. That is what makes this a regression problem (a category would make it classification).', more: 'Heavily skewed targets (prices, incomes) often fit better after a log transform.' },
      ones: { title: 'The column of 1s', tag: 'the intercept trick', io: 'x₀ = 1 for every row', params: 'its weight is β₀', body: 'Multiplying β₀ by a constant 1 adds the same number to every prediction, so the intercept becomes just another weight and the whole model is ŷ = Xβ.', more: 'Libraries add this column for you (fit_intercept=True).' },
      scaling: { title: 'Feature scaling', tag: 'optional for OLS', io: 'x → (x − mean) / std', params: '—', body: 'Plain OLS gives identical predictions with or without scaling; only the coefficients change units. Scaling matters for gradient descent (faster, more stable) and for regularised models.', more: 'Fit the scaler on training data only, then apply it to test data.' },
      weights: { title: 'Weights β₁ … βₚ', tag: 'one per feature', io: '8 numbers', params: 'learned', body: 'Each weight says how much the prediction moves when its feature rises by one unit, with every other feature held fixed.', more: 'The sign tells the direction; the size depends on the feature’s units.' },
      intercept: { title: 'Intercept β₀', tag: 'the baseline', io: '2.04 here', params: 'learned', body: 'The prediction when every feature is 0. Often not meaningful by itself (nobody has 0 rooms at latitude 0), but it lets the line sit at the right height.', more: 'With standardised features, β₀ equals the mean of y.' },
      squared: { title: 'Why square the errors?', tag: 'design choice', io: 'error 2 → cost 4, error 10 → cost 100', params: '—', body: 'Squaring makes every error positive, punishes big errors much more than small ones, and gives a smooth bowl with a closed-form minimum. Under Gaussian noise it is also exactly maximum likelihood.', more: 'The price: a few outliers can drag the line. Absolute error (MAE) or Huber loss are more robust alternatives.' },
      normal: { title: 'Normal equation', tag: 'closed form', io: 'β = (XᵀX)⁻¹ Xᵀy', params: 'cost O(np² + p³)', body: 'Setting the gradient of the loss to zero gives XᵀXβ = Xᵀy, which can be solved in one go. Geometrically, Xβ is the projection of y onto the space spanned by the columns of X.', more: 'In practice it is solved with a QR or SVD decomposition, not by inverting XᵀX, which can be numerically unstable.' },
      gd: { title: 'Gradient descent', tag: 'iterative', io: 'β ← β − η · (2/n) Xᵀ(Xβ − y)', params: 'needs a learning rate η', body: 'Start from any β and repeatedly step downhill along the gradient of the loss. Because the bowl has a single minimum, it reaches the same answer as the normal equation.', more: 'Preferred when there are too many rows to fit in memory (stochastic / mini-batch versions) or many features. Scale the features first.' },
      coef: { title: 'Reading a coefficient', tag: 'interpretation', io: 'MedInc: +0.363', params: '“all else held fixed”', body: 'One more unit of median income, with the other seven features unchanged, goes with a 0.363 higher predicted value ($36k). That is an association in this data, not a causal effect.', more: 'With correlated features, “holding the others fixed” may describe situations that never occur in the data, and coefficients can flip sign.' },
      r2: { title: 'R² (coefficient of determination)', tag: 'share of variance explained', io: 'R² = 1 − RSS / TSS', params: 'test: 0.792', body: 'Compares the model’s squared errors (RSS) with those of always predicting the mean (TSS). 1 is perfect, 0 is no better than the mean, and on test data it can even be negative.', more: 'A high R² does not mean the model is right, only that it fits the variance well.' },
      rmse: { title: 'RMSE', tag: 'typical error size', io: '√(mean of e²)', params: 'test: 0.436 → about $44k', body: 'Root mean squared error is in the target’s own units, so it answers “how far off is a typical prediction?”.', more: 'Report it next to a baseline: here, always predicting the mean gives 0.957.' },
      resplot: { title: 'Residual plot', tag: 'the most useful diagnostic', io: 'residuals vs predictions', params: '—', body: 'Plot each residual against its prediction. A healthy model gives a shapeless cloud around 0. A curve means a missing non-linearity; a funnel means the errors grow with the prediction.', more: 'Patterns here tell you what to fix: add a transformed feature, use a log target, or switch model.' },
      linearity: { title: 'Linearity', tag: 'assumption L', io: 'E[y | x] is a straight-line function of x', params: 'check: residual plot', body: 'The true relationship should be (close to) linear in the features. If it curves, the residual plot shows a U shape.', more: 'Fix: add squared or interaction terms, transform features, or use a non-linear model.' },
      independence: { title: 'Independence', tag: 'assumption I', io: 'errors do not depend on each other', params: 'check: residuals vs time or group', body: 'One row’s error should tell you nothing about another’s. Time series and repeated measurements on the same customer often violate this.', more: 'Violations make standard errors too small, so effects look more certain than they are.' },
      equalvar: { title: 'Equal variance (homoscedasticity)', tag: 'assumption E', io: 'Var(e) is the same everywhere', params: 'check: funnel in residual plot', body: 'The spread of errors should be similar for small and large predictions. Prices often violate it: expensive houses have larger errors.', more: 'Fix: log-transform the target, or use robust (heteroscedasticity-consistent) standard errors.' },
      normality: { title: 'Normal errors', tag: 'assumption N', io: 'e ~ Normal(0, σ²)', params: 'check: Q–Q plot of residuals', body: 'Needed for exact confidence intervals and p-values, especially in small samples. Predictions themselves do not require it.', more: 'With hundreds of rows the central limit theorem makes this the least critical assumption.' },
      collinear: { title: 'No multicollinearity', tag: 'features should not duplicate each other', io: 'VIF = 1 / (1 − R²ⱼ)', params: 'here every VIF ≈ 1.0', body: 'If one feature can be predicted from the others, coefficients become unstable and can swing wildly or flip sign. Predictions may still be fine.', more: 'In this repo’s collinear housing sample, SqFt and LotSize have VIFs above 1,000. Fix: drop or combine features, or use ridge regression.' },
    },
  };

  function build(container, spec) {
    container.classList.add('arch');
    container.innerHTML = `
      <div class="arch-head"><small class="kicker"><i></i>${spec.title}</small><span class="arch-hint">Hover or tap any part</span></div>
      <div class="arch-stage"></div>
      <div class="arch-card" aria-live="polite"></div>
      <div class="arch-foot">${spec.total}</div>`;
    const stage = container.querySelector('.arch-stage'), card = container.querySelector('.arch-card');
    let current = spec.items[0].id;

    const show = key => {
      current = key;
      const it = spec.items.find(i => i.id === key);
      const info = it ? (typeof it.info === 'string' ? spec.extra[it.info] : it.info) : spec.extra[key];
      card.innerHTML = `
        <div class="arch-card-top"><b>${info.title}</b><span class="tagline">${info.tag}</span></div>
        <dl><div><dt>${(spec.labels || ['Shape', 'Parameters'])[0]}</dt><dd>${info.io}</dd></div><div><dt>${(spec.labels || ['Shape', 'Parameters'])[1]}</dt><dd>${info.params}</dd></div></dl>
        <p>${info.body}</p><p class="arch-more">${info.more}</p>`;
      stage.querySelectorAll('[data-k]').forEach(n => n.classList.toggle('on', n.dataset.k === key));
    };

    const render = () => {
      const width = stage.getBoundingClientRect().width || 700;
      const rowW = width < 520 ? 400 : width < 900 ? 640 : 1000;
      const gap = 30, labelH = 44;
      // measure each item
      const items = spec.items.map(it => {
        let w, h;
        if (it.kind === 'input' || it.kind === 'block') { w = it.w + it.d * 0.7; h = it.h + it.d * 0.5; }
        else if (it.kind === 'op') { w = 30; h = 30; }
        else if (it.kind === 'attn') { w = 52; h = 52; }
        else if (it.kind === 'custom') { w = it.w; h = it.h; }
        else if (it.kind === 'vec') { w = 14; h = it.h; }
        else if (it.kind === 'nodes') { w = 20; h = it.h; }
        else { w = 56; h = it.h; }
        const bw = (it.badges || []).length ? Math.max(...it.badges.map(b => Math.max(64, b[1].length * 6.6 + 16))) : 0;
        return { ...it, bw: w, bh: h, slot: Math.max(w, bw, it.kind === 'op' ? 30 : 58) };
      });
      // flow into rows
      const rows = [[]]; let x = 0;
      items.forEach(it => { if (x + it.slot > rowW - 20 && rows[rows.length - 1].length) { rows.push([]); x = 0; } rows[rows.length - 1].push(it); x += it.slot + gap; });
      const rowH = rows.map(r => Math.max(...r.map(i => i.bh)) + labelH + Math.max(0, ...r.map(i => (i.badges || []).length)) * 22 + 34);
      const H = rowH.reduce((a, b) => a + b, 0) + 10;
      stage.innerHTML = '';
      const svg = el('svg', { viewBox: `0 0 ${rowW} ${H}`, role: 'img', 'aria-label': spec.title }, stage);
      const defs = el('defs', {}, svg);
      const mk = el('marker', { id: `ah-${spec.id || 'a'}`, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'rgba(255,255,255,0.4)' }, mk);
      const links = el('g', {}, svg), nodes = el('g', {}, svg);
      let y0 = 6; const placed = [], rowTop = [];
      rows.forEach((r, ri) => {
        rowTop.push(y0);
        const total = r.reduce((a, i) => a + i.slot, 0) + gap * (r.length - 1);
        let cx = (rowW - total) / 2;
        const midY = y0 + Math.max(...r.map(i => i.bh)) / 2 + 26;
        r.forEach(it => { placed.push({ it, x: cx, mid: midY, row: ri, cxm: cx + it.slot / 2 }); cx += it.slot + gap; });
        y0 += rowH[ri];
      });
      // connectors
      placed.forEach((p, i) => {
        const q = placed[i + 1]; if (!q) return;
        const ax = p.cxm + p.it.bw / 2 + 4, bx = q.cxm - q.it.bw / 2 - 6;
        let d;
        if (p.row === q.row) d = `M${ax} ${p.mid} L${bx} ${q.mid}`;
        else { const yb = rowTop[q.row] - 4; d = `M${ax} ${p.mid} L${Math.min(rowW - 6, ax + 12)} ${p.mid} L${Math.min(rowW - 6, ax + 12)} ${yb} L8 ${yb} L8 ${q.mid} L${bx} ${q.mid}`; }
        el('path', { d, fill: 'none', stroke: 'rgba(255,255,255,0.22)', 'stroke-width': 1.4, 'marker-end': `url(#ah-${spec.id || 'a'})` }, links);
        if (!reduced) {
          const dot = el('circle', { r: 2.6, fill: T.cyan, opacity: 0.85 }, links);
          el('animateMotion', { dur: `${1.6 + i * 0.05}s`, repeatCount: 'indefinite', path: d, begin: `-${(i * 0.37) % 1.6}s` }, dot);
        }
      });
      // nodes
      placed.forEach(({ it, cxm, mid }) => {
        const g = el('g', { class: 'arch-node', 'data-k': it.id, tabindex: 0, role: 'button', 'aria-label': `${it.label}: ${it.shape || ''}` }, nodes);
        const left = cxm - it.bw / 2, top = mid - it.bh / 2;
        const c = it.color;
        el('rect', { x: left - 8, y: top - 8, width: it.bw + 16, height: it.bh + 16 + labelH, rx: 12, class: 'arch-hit' }, g);
        if (it.kind === 'input' || it.kind === 'block') {
          const fx = left, fy = top + it.d * 0.5, dx = it.d * 0.7, dy = it.d * 0.5;
          el('path', { d: `M${fx} ${fy} L${fx + dx} ${fy - dy} L${fx + dx + it.w} ${fy - dy} L${fx + it.w} ${fy} Z`, fill: alpha(c, 0.32), stroke: c, 'stroke-width': 1 }, g);
          el('path', { d: `M${fx + it.w} ${fy} L${fx + it.w + dx} ${fy - dy} L${fx + it.w + dx} ${fy - dy + it.h} L${fx + it.w} ${fy + it.h} Z`, fill: alpha(c, 0.2), stroke: c, 'stroke-width': 1 }, g);
          el('rect', { x: fx, y: fy, width: it.w, height: it.h, fill: alpha(c, 0.16), stroke: c, 'stroke-width': 1.2 }, g);
          if (it.kind === 'input') {
            const px = ['0000000', '0111110', '0000110', '0001100', '0011000', '0011000', '0000000'];
            const s = it.w / 7;
            px.forEach((row, i) => [...row].forEach((v, j) => { if (v === '1') el('rect', { x: fx + j * s + 0.5, y: fy + i * s + 0.5, width: s - 1, height: s - 1, fill: alpha(T.ink, 0.85) }, g); }));
          } else {
            for (let k = 1; k < 4; k++) el('line', { x1: fx + it.w + (dx * k) / 4, y1: fy - (dy * k) / 4, x2: fx + it.w + (dx * k) / 4, y2: fy - (dy * k) / 4 + it.h, stroke: alpha(c, 0.35) }, g);
          }
        } else if (it.kind === 'op') {
          el('circle', { cx: cxm, cy: mid, r: 15, fill: alpha(c, 0.18), stroke: c, 'stroke-width': 1.2 }, g);
          el('path', { d: `M${cxm - 9} ${mid + 5} L${cxm} ${mid + 5} L${cxm + 9} ${mid - 7}`, fill: 'none', stroke: c, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
        } else if (it.kind === 'attn') {
          el('rect', { x: left, y: top, width: 52, height: 52, rx: 10, fill: alpha(c, 0.12), stroke: c, 'stroke-dasharray': '4 3', 'stroke-width': 1.3 }, g);
          [0.9, 0.3, 0.7, 0.15, 0.55].forEach((v, k) => el('rect', { x: left + 8 + k * 7.6, y: top + 42 - v * 30, width: 5, height: v * 30, rx: 1.5, fill: alpha(c, 0.4 + 0.6 * v) }, g));
        } else if (it.kind === 'custom') {
          it.draw(g, left, top, cxm, mid);
        } else if (it.kind === 'vec') {
          for (let k = 0; k < 14; k++) el('rect', { x: left, y: top + k * (it.h / 14), width: 14, height: it.h / 14 - 1.5, rx: 1.5, fill: alpha(c, 0.25 + 0.5 * ((k * 37) % 10) / 10) }, g);
        } else if (it.kind === 'nodes') {
          for (let k = 0; k < 8; k++) el('circle', { cx: cxm, cy: top + 7 + k * ((it.h - 14) / 7), r: 6, fill: alpha(c, 0.3), stroke: c, 'stroke-width': 1 }, g);
        } else {
          const probs = [0.01, 0.02, 0.03, 0.04, 0.01, 0.02, 0.01, 0.8, 0.03, 0.03];
          probs.forEach((p, k) => {
            const yy = top + k * (it.h / 10);
            el('rect', { x: left + 12, y: yy + 1, width: Math.max(2, p * 44), height: it.h / 10 - 3, rx: 1.5, fill: alpha(c, k === 7 ? 0.95 : 0.4) }, g);
            const t = el('text', { x: left + 6, y: yy + it.h / 20 + 3, 'text-anchor': 'middle', class: 'arch-small' }, g); t.textContent = k;
          });
        }
        const lt = el('text', { x: cxm, y: mid + it.bh / 2 + 20, 'text-anchor': 'middle', class: 'arch-label' }, g); lt.textContent = it.label;
        if (it.shape) { const st = el('text', { x: cxm, y: mid + it.bh / 2 + 36, 'text-anchor': 'middle', class: 'arch-shape' }, g); st.textContent = it.shape; }
        (it.badges || []).forEach(([key, text], k) => {
          const bg = el('g', { class: 'arch-node arch-badge', 'data-k': key, tabindex: 0, role: 'button', 'aria-label': text }, nodes);
          const by = mid + it.bh / 2 + 46 + k * 22, bw2 = Math.max(64, text.length * 6.6 + 16);
          el('rect', { x: cxm - bw2 / 2, y: by, width: bw2, height: 18, rx: 9, fill: alpha(T.amber, 0.08), stroke: alpha(T.amber, 0.55) }, bg);
          const bt = el('text', { x: cxm, y: by + 12.5, 'text-anchor': 'middle', class: 'arch-badge-t' }, bg); bt.textContent = text;
        });
      });
      stage.querySelectorAll('[data-k]').forEach(n => {
        const k = n.dataset.k;
        n.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(k); });
        n.addEventListener('click', () => show(k));
        n.addEventListener('focus', () => show(k));
        n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(k); } });
      });
      show(current);
    };
    let lastW = 0;
    new ResizeObserver(() => { const w = stage.getBoundingClientRect().width; const bucket = w < 520 ? 0 : w < 900 ? 1 : 2; if (bucket !== lastW) { lastW = bucket; render(); } }).observe(stage);
    lastW = -1;
    render();
  }

  root.Labs = root.Labs || {};
  root.Labs.architectures = { cnn: elx => build(elx, { ...CNN, id: 'cnn' }), linreg: elx => build(elx, { ...LINREG, id: 'linreg' }) };
})(window);
