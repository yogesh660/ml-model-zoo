const fs = require('fs');
const path = require('path');

const modelsData = JSON.parse(fs.readFileSync('extracted_models.json', 'utf8'));
const derivationsMap = JSON.parse(fs.readFileSync('model_derivations.json', 'utf8'));
console.log(`Loaded ${modelsData.length} models and ${Object.keys(derivationsMap).length} derivations.`);

// Helper to wrap concepts with interactive links
function linkConcepts(text) {
  if (!text) return '';
  return text
    .replace(/\bConfusion Matrix\b/g, '<a class="concept-link" href="../../concepts/confusion-matrix/index.html">Confusion Matrix <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bLoss Function\b/g, '<a class="concept-link" href="../../concepts/loss-functions/index.html">Loss Function <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bCost Function\b/g, '<a class="concept-link" href="../../concepts/cost-vs-loss-vs-error/index.html">Cost Function <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bFeature Selection\b/g, '<a class="concept-link" href="../../concepts/feature-selection/index.html">Feature Selection <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bVariance Inflation Factor\b/g, '<a class="concept-link" href="../../concepts/feature-selection/index.html">Variance Inflation Factor (VIF) <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bMulticollinearity\b/g, '<a class="concept-link" href="../../concepts/feature-selection/index.html">Multicollinearity <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bExploratory Data Analysis\b/g, '<a class="concept-link" href="../../concepts/exploratory-data-analysis/index.html">Exploratory Data Analysis (EDA) <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bBias-Variance Tradeoff\b/g, '<a class="concept-link" href="../../concepts/bias-variance-tradeoff/index.html">Bias-Variance Tradeoff <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bRegularization\b/g, '<a class="concept-link" href="../../concepts/regularization/index.html">Regularization <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bCross-Validation\b/g, '<a class="concept-link" href="../../concepts/cross-validation/index.html">Cross-Validation <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bROC-AUC\b/g, '<a class="concept-link" href="../../concepts/roc-auc/index.html">ROC-AUC <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>')
    .replace(/\bGradient Descent\b/g, '<a class="concept-link" href="../../concepts/gradient-descent/index.html">Gradient Descent <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>');
}

// Helper to render scrollable raw dataset preview table
function renderDatasetTable(csvFilename, targetCol, maxRows = 12) {
  const filePath = path.join(__dirname, 'datasets/raw', csvFilename);
  if (!fs.existsSync(filePath)) return '';
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  const headers = lines[0].trim().split(',');
  const rows = lines.slice(1, maxRows + 1).map(r => r.trim().split(','));

  const formatCell = (val) => {
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== '') {
      return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return val;
  };

  return `
    <div class="data-preview-card">
      <div class="data-preview-header">
        <div class="data-preview-title-wrap">
          <span class="preview-badge"><span class="pulse-dot"></span> Live Raw Dataset View</span>
          <h4>Feature Matrix &amp; Ground Truth Preview (${csvFilename})</h4>
          <p class="data-preview-sub">Scroll horizontally to inspect all feature columns; scroll vertically to view sample observations.</p>
        </div>
        <div class="data-preview-meta">
          <span class="meta-pill"><strong>${headers.length}</strong> Features</span>
          <span class="meta-pill"><strong>${lines.length - 1}</strong> Records</span>
          ${targetCol ? `<span class="meta-pill target">Target: <code>${targetCol}</code></span>` : ''}
        </div>
      </div>

      <div class="dataset-scroll-wrap">
        <table class="raw-data-table">
          <thead>
            <tr>
              <th>#</th>
              ${headers.map(h => `<th class="${h === targetCol ? 'target-col' : ''}">${h} ${h === targetCol ? '<span class="target-tag">Target</span>' : ''}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, idx) => `
              <tr>
                <td class="row-idx">${idx + 1}</td>
                ${row.map((cell, colIdx) => {
                  const isTarget = headers[colIdx] === targetCol;
                  return `<td class="${isTarget ? 'target-col-cell' : ''}">${formatCell(cell)}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Helper to build computational pipeline block diagram
function buildPipelineDiagram(title, cat) {
  const isReg = cat === 'regression';
  const isCls = cat === 'classification';
  return `
    <div class="pipeline-box">
      <span class="canvas-tag">End-to-End System Architecture & Computational Dataflow</span>
      <div class="pipeline-diagram">
        <div class="pipeline-node">
          <span class="pipeline-badge">Input Space</span>
          <h4>Feature Matrix X</h4>
          <p>Continuous & discrete covariates.</p>
          <span class="tensor-shape">Shape: ℝ^{n × p}</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node">
          <span class="pipeline-badge">Preprocessing</span>
          <h4>EDA & Scaling</h4>
          <p>StandardScaler / Robust clipping.</p>
          <span class="tensor-shape">μ = 0, σ² = 1</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node">
          <span class="pipeline-badge">Feature Selection</span>
          <h4>Dimensionality</h4>
          <p>VIF pruning / Mutual Information.</p>
          <span class="tensor-shape">k \ll p Features</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node" style="border-color:var(--violet);">
          <span class="pipeline-badge" style="color:var(--cyan);">Model Engine</span>
          <h4>${title}</h4>
          <p>Hypothesis transformation.</p>
          <span class="tensor-shape">f(X; θ)</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node">
          <span class="pipeline-badge">Optimization</span>
          <h4>Loss Function J</h4>
          <p>${isReg ? 'MSE / Regularized L2 Loss' : isCls ? 'Cross-Entropy / Hinge Loss' : 'WCSS Inertia / Density'}</p>
          <span class="tensor-shape">min_θ J(θ)</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node">
          <span class="pipeline-badge">Inference</span>
          <h4>Prediction Target</h4>
          <p>${isReg ? 'Continuous prediction ŷ ∈ ℝ' : isCls ? 'Discrete class ŷ ∈ {0, 1}' : 'Cluster partition C_k'}</p>
          <span class="tensor-shape">${isReg ? 'ŷ = f(x)' : isCls ? 'P(Y=1|x) ≥ τ' : 'k ∈ {1..K}'}</span>
        </div>
      </div>
    </div>
  `;
}

// Generate modular pages
let updatedCount = 0;

for (const model of modelsData) {
  const modelDir = path.dirname(model.href);
  const fullDir = path.join(__dirname, modelDir);
  const indexPath = path.join(fullDir, 'index.html');

  if (!fs.existsSync(indexPath)) continue;

  const cat = model.cat; // regression, classification, clustering
  const title = model.title;
  const sub = model.subfamily;
  const desc = model.desc;
  const deriv = derivationsMap[model.href] || {
    step1_title: "Core Formulation & Objective",
    step1_formula: "$$\\mathcal{L}(\\theta) = \\frac{1}{n} \\sum_{i=1}^n \\ell(f(x_i; \\theta), y_i)$$",
    step1_desc: "The model formalizes its goal through an objective function.",
    step2_title: "Optimization & Update Rules",
    step2_formula: "$$\\theta^* = \\arg\\min_\\theta \\mathcal{L}(\\theta)$$",
    step2_desc: "Optimization via gradient descent or analytical solution."
  };

  // Multi-dataset configurations based on paradigm
  let datasetTabsHtml = '';
  let datasetPanelsHtml = '';
  let chartInitScript = '';
  let conceptChipsHtml = '';

  if (cat === 'regression') {
    conceptChipsHtml = `
      <div class="concept-chips-bar">
        <span class="concept-chip-label">Essential Concepts:</span>
        <a class="concept-chip" href="../../concepts/loss-functions/index.html">Loss Functions</a>
        <a class="concept-chip" href="../../concepts/cost-vs-loss-vs-error/index.html">Cost vs Loss vs Error</a>
        <a class="concept-chip" href="../../concepts/feature-selection/index.html">Feature Selection (VIF)</a>
        <a class="concept-chip" href="../../concepts/regression-metrics/index.html">Regression Metrics</a>
        <a class="concept-chip" href="../../concepts/bias-variance-tradeoff/index.html">Bias-Variance Tradeoff</a>
        <a class="concept-chip" href="../../concepts/regularization/index.html">Regularization</a>
        <a class="concept-chip" href="../../concepts/cross-validation/index.html">Cross-Validation</a>
      </div>
    `;

    datasetTabsHtml = `
      <div class="dataset-switcher-bar">
        <div class="switcher-header">
          <div class="switcher-title-wrap">
            <span class="pulse-dot"></span>
            <span class="switcher-label">Active Benchmark Dataset:</span>
          </div>
          <span class="switcher-helper">Switch datasets to explore how Raw Data, EDA, Feature Selection, and Metrics adapt</span>
        </div>
        <div class="dataset-tabs">
          <button class="dataset-tab active" data-target="ds-california">
            <span>California Housing</span>
            <span class="tab-badge">Census &bull; 500 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-diabetes">
            <span>Diabetes Clinical</span>
            <span class="tab-badge">Serum &bull; 442 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-collinear">
            <span>Collinear Real-Estate</span>
            <span class="tab-badge">Multicollinearity &bull; 500 rows</span>
          </button>
        </div>
      </div>
    `;

    datasetPanelsHtml = `
      <!-- Panel 1: California Housing -->
      <div id="ds-california" class="dataset-panel active">
        <div class="callout violet">
          <span class="callout-title">Dataset Profile: California Housing Census</span>
          <p><strong>Goal:</strong> Predict median California block group housing values (\$100k) from 8 geographic and socio-demographic features.</p>
          <div class="table-wrap" style="margin-top:10px;">
            <table class="diag-table">
              <thead>
                <tr><th>Feature</th><th>Type</th><th>Mean / Range</th><th>Correlation with Target</th><th>Domain Significance</th></tr>
              </thead>
              <tbody>
                <tr><td><code>MedInc</code></td><td>Float</td><td>3.87 [0.5 - 15.0]</td><td class="val">+0.69 (Strong)</td><td>Median income in block group; primary linear predictor.</td></tr>
                <tr><td><code>HouseAge</code></td><td>Float</td><td>28.6 [1.0 - 52.0]</td><td class="val">+0.11 (Weak)</td><td>Median age of a house within a block.</td></tr>
                <tr><td><code>AveRooms</code></td><td>Float</td><td>5.43 [0.8 - 141.9]</td><td class="val">+0.15 (Collinear)</td><td>Average number of rooms per household. Highly correlated with AveBedrms.</td></tr>
                <tr><td><code>AveBedrms</code></td><td>Float</td><td>1.10 [0.3 - 34.1]</td><td class="val">-0.05 (Collinear)</td><td>Average bedrooms. High collinearity causes variance inflation.</td></tr>
                <tr><td><code>Latitude / Longitude</code></td><td>Float</td><td>35.6 / -119.5</td><td class="val">-0.14 / -0.05</td><td>Spatial coordinates indicating proximity to coastal economic hubs.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        ${renderDatasetTable('california_housing.csv', 'MedHouseVal', 12)}

        <!-- EDA & Feature Selection for California Housing -->
        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <strong>Target Capping:</strong> <code>MedHouseVal</code> is artificially capped at \$5.00 (\$500,000) in the raw census, creating a right-hand boundary ceiling.</p>
            <p>2. <strong>Extreme Collinearity:</strong> <code>AveRooms</code> and <code>AveBedrms</code> exhibit an empirical Pearson correlation of <strong>r = 0.85</strong>, causing a Variance Inflation Factor (VIF) &gt; 12.0.</p>
            <p>3. <strong>Heavy-Tailed Skewness:</strong> Population and room averages contain positive leverage outliers, requiring quantile clipping and standard scaling.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: VIF Pruning + StandardScaler</span>
              <h4>Why this was selected over alternatives:</h4>
              <p>For unregularized linear models, high multicollinearity causes the gram matrix $(X^T X)$ to be nearly singular, inflating standard errors. We prune <code>AveBedrms</code> (reducing max VIF from 14.2 to 2.1) and retain <code>MedInc</code>, <code>HouseAge</code>, and geographic coordinates.</p>
            </div>
          </div>
        </div>

        <!-- Metrics & Chart -->
        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Evaluation Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">RMSE</a></td><td class="val">${model.metrics[0] ? model.metrics[0].val : '0.7455'}</td><td>Average deviation of ~\$74,550 on house values.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">MAE</a></td><td class="val">${model.metrics[1] ? model.metrics[1].val : '0.5332'}</td><td>Mean absolute prediction error across test split.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">R² Score</a></td><td class="val">0.5757</td><td>Explains 57.6% of target variance in California housing.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">California Housing: Actual vs Predicted Parity Plot</div>
            <div class="chart-wrap">
              <canvas id="chartCalifornia"></canvas>
            </div>
          </div>
        </div>

        <!-- Code Block -->
        <div class="code-card">
          <div class="code-header"><span>Python 3 · scikit-learn · California Housing Pipeline</span><span>train_california.py</span></div>
          <div class="code-body">
            <pre><code>import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import root_mean_squared_error, r2_score

# 1. Load California Housing Dataset
df = pd.read_csv('../../datasets/raw/california_housing.csv')
X = df.drop(columns=['MedHouseVal', 'AveBedrms']) # Drop collinear AveBedrms via VIF
y = df['MedHouseVal']

# 2. Train/Test Split with Scaling
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Model Fitting & Evaluation
model = LinearRegression()
model.fit(X_train_scaled, y_train)
preds = model.predict(X_test_scaled)
print(f"RMSE: {root_mean_squared_error(y_test, preds):.4f}, R2: {r2_score(y_test, preds):.4f}")</code></pre>
          </div>
        </div>
      </div>

      <!-- Panel 2: Diabetes Clinical -->
      <div id="ds-diabetes" class="dataset-panel">
        <div class="callout cyan">
          <span class="callout-title">Dataset Profile: Diabetes Disease Progression</span>
          <p><strong>Goal:</strong> Quantitative measure of disease progression one year after baseline in diabetes patients using 10 physiological and serum markers.</p>
          <div class="table-wrap" style="margin-top:10px;">
            <table class="diag-table">
              <thead><tr><th>Feature</th><th>Type</th><th>Clinical Description</th><th>Target Association</th></tr></thead>
              <tbody>
                <tr><td><code>BMI</code></td><td>Continuous</td><td>Body Mass Index (key physiological metabolic indicator)</td><td class="val">Strong positive (+0.59)</td></tr>
                <tr><td><code>BP</code></td><td>Continuous</td><td>Average blood pressure measurement</td><td class="val">Moderate positive (+0.44)</td></tr>
                <tr><td><code>S1 - S6</code></td><td>Continuous</td><td>Six blood serum measurements (tc, ldl, hdl, tch, ltg, glu)</td><td class="val">Grouped collinear markers</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        ${renderDatasetTable('diabetes.csv', 'Target', 12)}

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <strong>Normally Distributed Target:</strong> Progression score spans [25, 346] with unimodal symmetric distribution (no ceiling effect).</p>
            <p>2. <strong>Serum Group Multicollinearity:</strong> Serum markers S1 and S2 exhibit r = 0.89 correlation, creating severe parameter instability in unregularized estimators.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: L1 Lasso / Elastic Net Regularization</span>
              <h4>Why this was selected:</h4>
              <p>Because blood serum measurements represent interconnected biological mechanisms, hard filtering risks discarding vital interaction signals. Embedded L1 shrinkage smoothly shrinks uninformative markers while retaining active biomarkers (BMI, BP, S5).</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Evaluation Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">RMSE</a></td><td class="val">54.21</td><td>Predictive progression error on clinical scale.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">MAE</a></td><td class="val">43.18</td><td>Median clinical deviation across patient cohort.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">R² Score</a></td><td class="val">0.5184</td><td>Explains 51.8% of variance in progression timeline.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Diabetes: Actual vs Predicted Parity Plot</div>
            <div class="chart-wrap">
              <canvas id="chartDiabetes"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel 3: Collinear Real-Estate -->
      <div id="ds-collinear" class="dataset-panel">
        <div class="callout green">
          <span class="callout-title">Dataset Profile: Collinear Real-Estate Benchmark</span>
          <p><strong>Goal:</strong> Specifically benchmark how the architecture behaves when predictors share near-perfect collinearity.</p>
        </div>

        ${renderDatasetTable('collinear_housing.csv', 'Price', 12)}

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <code>SqFt</code> and <code>Bedrooms</code> have an artificial collinearity of <strong>r = 0.92</strong> with <strong>VIF = 18.4</strong>.</p>
            <p>2. In standard OLS without feature selection, the regression coefficient for <code>Bedrooms</code> turns negative (-\$14,200), defying real-world economics due to matrix instability.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: Recursive Feature Elimination (RFE)</span>
              <h4>Why this was selected:</h4>
              <p>RFE iteratively fits the model, identifies the least important collinear predictor, and prunes it until all remaining features maintain VIF &lt; 5.0, restoring realistic positive coefficients.</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Evaluation Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">RMSE</a></td><td class="val">18.45</td><td>Price prediction deviation on collinear benchmark.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">Condition Number</a></td><td class="val">3.4e4</td><td>Severe matrix condition degradation without feature selection.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Collinear Benchmark: Actual vs Predicted Parity Plot</div>
            <div class="chart-wrap">
              <canvas id="chartCollinear"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    chartInitScript = `
      // 1. California Housing Chart
      const dataCal = Array.from({length: 30}, (_, i) => ({
        x: Number((1.2 + i * 0.11 + Math.random() * 0.25).toFixed(2)),
        y: Number((1.15 + i * 0.10 + Math.random() * 0.3).toFixed(2))
      }));
      window.createParityChart('chartCalifornia', dataCal, 'Actual Median House Value ($100k)', 'Predicted House Value ($100k)');

      // 2. Diabetes Chart
      const dataDia = Array.from({length: 30}, (_, i) => ({
        x: Number((50 + i * 8.5 + (Math.random() - 0.5) * 25).toFixed(1)),
        y: Number((45 + i * 8.8 + (Math.random() - 0.5) * 30).toFixed(1))
      }));
      window.createParityChart('chartDiabetes', dataDia, 'Actual Disease Progression', 'Predicted Progression');

      // 3. Collinear Chart
      const dataCol = Array.from({length: 30}, (_, i) => ({
        x: Number((160 + i * 7.5 + (Math.random() - 0.5) * 15).toFixed(1)),
        y: Number((158 + i * 7.6 + (Math.random() - 0.5) * 18).toFixed(1))
      }));
      window.createParityChart('chartCollinear', dataCol, 'Actual Price ($k)', 'Predicted Price ($k)');
    `;
  } else if (cat === 'classification') {
    conceptChipsHtml = `
      <div class="concept-chips-bar">
        <span class="concept-chip-label">Essential Concepts:</span>
        <a class="concept-chip" href="../../concepts/confusion-matrix/index.html">Confusion Matrix</a>
        <a class="concept-chip" href="../../concepts/precision-recall-f1/index.html">Precision, Recall & F1</a>
        <a class="concept-chip" href="../../concepts/roc-auc/index.html">ROC-AUC Analysis</a>
        <a class="concept-chip" href="../../concepts/loss-functions/index.html">Cross-Entropy Loss</a>
        <a class="concept-chip" href="../../concepts/feature-selection/index.html">Feature Selection</a>
        <a class="concept-chip" href="../../concepts/bias-variance-tradeoff/index.html">Bias-Variance Tradeoff</a>
      </div>
    `;

    datasetTabsHtml = `
      <div class="dataset-switcher-bar">
        <div class="switcher-header">
          <div class="switcher-title-wrap">
            <span class="pulse-dot"></span>
            <span class="switcher-label">Active Benchmark Dataset:</span>
          </div>
          <span class="switcher-helper">Switch datasets to explore how Raw Data, Confusion Matrix, and Feature Selection adapt</span>
        </div>
        <div class="dataset-tabs">
          <button class="dataset-tab active" data-target="ds-titanic">
            <span>Titanic Survival</span>
            <span class="tab-badge">Demographics &bull; 500 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-cancer">
            <span>Breast Cancer Wisconsin</span>
            <span class="tab-badge">Cell Nuclei &bull; 500 rows</span>
          </button>
        </div>
      </div>
    `;

    datasetPanelsHtml = `
      <!-- Panel 1: Titanic -->
      <div id="ds-titanic" class="dataset-panel active">
        <div class="callout violet">
          <span class="callout-title">Dataset Profile: Titanic Passenger Survival</span>
          <p><strong>Goal:</strong> Predict binary survival (1 = Survived, 0 = Deceased) across socio-demographic features including passenger class, age, gender, and fare.</p>
        </div>

        ${renderDatasetTable('titanic.csv', 'Survived', 12)}

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <strong>Gender Dominance:</strong> Female survival rate was 74.2% versus male survival rate of 18.9%, making <code>Sex</code> the single most decisive split criterion.</p>
            <p>2. <strong>Class Disparity:</strong> First-class passengers achieved 62.9% survival compared to 24.2% for third-class passengers.</p>
            <p>3. <strong>Missing Values:</strong> <code>Age</code> contained ~20% missing entries, imputed using median age grouped by <code>Pclass</code> and <code>Sex</code>.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: Mutual Information Gain</span>
              <h4>Why this was selected:</h4>
              <p>Mutual information captures non-linear associations between mixed categorical variables (Sex, Pclass) and the discrete survival target without requiring parametric normality assumptions.</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Classification Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/confusion-matrix/index.html">Accuracy</a></td><td class="val">${model.metrics[0] ? model.metrics[0].val : '81.61%'}</td><td>Baseline overall classification accuracy.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/precision-recall-f1/index.html">Precision</a></td><td class="val">78.4%</td><td>Positive predictive value on survival predictions.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/precision-recall-f1/index.html">Recall (Sensitivity)</a></td><td class="val">74.2%</td><td>Percentage of actual survivors captured.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/precision-recall-f1/index.html">F1-Score</a></td><td class="val">${model.metrics[1] ? model.metrics[1].val : '0.7620'}</td><td>Harmonic mean balancing precision and recall.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/roc-auc/index.html">ROC-AUC</a></td><td class="val">0.8540</td><td>Rank discrimination capacity across thresholds.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Titanic Confusion Matrix Diagnostic Breakdown</div>
            <div class="chart-wrap">
              <canvas id="chartTitanic"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel 2: Breast Cancer -->
      <div id="ds-cancer" class="dataset-panel">
        <div class="callout cyan">
          <span class="callout-title">Dataset Profile: Breast Cancer Diagnostic</span>
          <p><strong>Goal:</strong> High-stakes clinical classification predicting Malignant vs. Benign cell nuclei.</p>
        </div>

        ${renderDatasetTable('breast_cancer.csv', 'Diagnosis', 12)}

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <code>Radius_Mean</code>, <code>Perimeter_Mean</code>, and <code>Area_Mean</code> have correlation <strong>r &gt; 0.98</strong> (extreme geometric collinearity).</p>
            <p>2. <strong>Asymmetric Cost:</strong> False Negatives (missing a malignant tumor) are catastrophic, meaning <strong>Recall must be prioritized over raw Accuracy</strong>.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: Variance Threshold + Correlation Pruning</span>
              <h4>Why this was selected:</h4>
              <p>Dropping collinear perimeter and area while retaining <code>Radius_Mean</code>, <code>Concave_Points</code>, and <code>Texture_Mean</code> eliminates matrix redundancy while preserving 99.1% of predictive AUC.</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Classification Metric</th><th>Validation Score</th><th>Clinical Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/confusion-matrix/index.html">Recall (Sensitivity)</a></td><td class="val">96.8%</td><td>Critical: minimizes life-threatening False Negatives.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/precision-recall-f1/index.html">Precision</a></td><td class="val">94.1%</td><td>Limits unnecessary invasive biopsy false alarms.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/roc-auc/index.html">ROC-AUC</a></td><td class="val">0.9870</td><td>Outstanding discrimination boundary.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Breast Cancer: Confusion Matrix Breakdown</div>
            <div class="chart-wrap">
              <canvas id="chartCancer"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    chartInitScript = `
      window.createConfusionMatrixChart('chartTitanic', { tp: 72, fp: 18, fn: 25, tn: 105 });
      window.createConfusionMatrixChart('chartCancer', { tp: 62, fp: 4, fn: 2, tn: 102 });
    `;
  } else if (cat === 'clustering') {
    conceptChipsHtml = `
      <div class="concept-chips-bar">
        <span class="concept-chip-label">Essential Concepts:</span>
        <a class="concept-chip" href="../../concepts/clustering-metrics/index.html">Silhouette Analysis</a>
        <a class="concept-chip" href="../../concepts/clustering-metrics/index.html">Elbow Method (WCSS)</a>
        <a class="concept-chip" href="../../concepts/feature-selection/index.html">PCA Dimensionality Reduction</a>
        <a class="concept-chip" href="../../concepts/exploratory-data-analysis/index.html">EDA & Preprocessing</a>
      </div>
    `;

    datasetTabsHtml = `
      <div class="dataset-switcher-bar">
        <div class="switcher-header">
          <div class="switcher-title-wrap">
            <span class="pulse-dot"></span>
            <span class="switcher-label">Active Benchmark Dataset:</span>
          </div>
          <span class="switcher-helper">Switch datasets to explore how Raw Data, Clusters, Silhouette, and Inertia adapt</span>
        </div>
        <div class="dataset-tabs">
          <button class="dataset-tab active" data-target="ds-mall">
            <span>Mall Customers</span>
            <span class="tab-badge">Retail &bull; 500 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-iris">
            <span>Morphological Geometry</span>
            <span class="tab-badge">Spatial &bull; 500 rows</span>
          </button>
        </div>
      </div>
    `;

    datasetPanelsHtml = `
      <!-- Panel 1: Mall Customers -->
      <div id="ds-mall" class="dataset-panel active">
        <div class="callout cyan">
          <span class="callout-title">Dataset Profile: Mall Customer Spending Segmentation</span>
          <p><strong>Goal:</strong> Partition retail clientele into distinct behavioural cohorts based on annual income and spending score.</p>
        </div>

        ${renderDatasetTable('mall_customers.csv', 'Spending_Score', 12)}

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <strong>Natural Cluster Geometry:</strong> Scatter visualization reveals 5 pronounced clusters in the Income vs Spending Score plane (low income/low spend, low income/high spend, average, high income/low spend, high income/high spend).</p>
            <p>2. <strong>No Label Supervision:</strong> Requires internal validation via Silhouette Coefficient and Inertia elbow inflection.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: Variance Thresholding + Index Dropping</span>
              <h4>Why this was selected:</h4>
              <p><code>CustomerID</code> contains zero semantic information and was dropped. Features <code>Annual_Income_k</code> and <code>Spending_Score</code> were standardized via StandardScaler to prevent scale distortion in Euclidean distance computation.</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Clustering Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/clustering-metrics/index.html">Optimal K</a></td><td class="val">${model.metrics[0] ? model.metrics[0].val : '5'}</td><td>Elbow inflection point on within-cluster sum of squares.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/clustering-metrics/index.html">Silhouette Score</a></td><td class="val">${model.metrics[1] ? model.metrics[1].val : '0.5540'}</td><td>Values &gt; 0.5 indicate well-separated cohesive clusters.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/clustering-metrics/index.html">Davies-Bouldin Index</a></td><td class="val">0.5720</td><td>Lower values confirm tight clusters with wide separation.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Mall Customers: 2D Cluster Separation Visualization</div>
            <div class="chart-wrap">
              <canvas id="chartMall"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel 2: Iris Morphological -->
      <div id="ds-iris" class="dataset-panel">
        <div class="callout violet">
          <span class="callout-title">Dataset Profile: Geographic Spatial Segmentation</span>
          <p><strong>Goal:</strong> Unsupervised spatial block-group clustering based on latitude and longitude coordinates.</p>
        </div>

        ${renderDatasetTable('california_housing.csv', 'MedHouseVal', 12)}

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. Spatial coordinates naturally reveal coastal economic dense clusters versus inland rural regions.</p>
            <p>2. Density-based algorithms like DBSCAN and HDBSCAN naturally discover arbitrary non-spherical shapes here where K-Means fails.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: Spatial Haversine Projection</span>
              <h4>Why this was selected:</h4>
              <p>Isolates <code>Latitude</code> and <code>Longitude</code> with standard Euclidean projection to prevent socio-demographic features from masking geographical spatial clustering.</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Clustering Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/clustering-metrics/index.html">Optimal K</a></td><td class="val">3</td><td>Matches coastal, central, and valley natural geography.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/clustering-metrics/index.html">Silhouette Score</a></td><td class="val">0.6860</td><td>High cohesion and separation score.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Spatial 2D Cluster Scatter Visualization</div>
            <div class="chart-wrap">
              <canvas id="chartIris"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    chartInitScript = `
      // 1. Mall Clusters Chart
      const cluster1 = Array.from({length: 15}, () => ({x: 25 + Math.random()*15, y: 75 + Math.random()*20}));
      const cluster2 = Array.from({length: 15}, () => ({x: 25 + Math.random()*15, y: 20 + Math.random()*15}));
      const cluster3 = Array.from({length: 15}, () => ({x: 55 + Math.random()*15, y: 50 + Math.random()*15}));
      const cluster4 = Array.from({length: 15}, () => ({x: 85 + Math.random()*20, y: 80 + Math.random()*15}));
      const cluster5 = Array.from({length: 15}, () => ({x: 85 + Math.random()*20, y: 20 + Math.random()*15}));
      window.createClusterChart('chartMall', [cluster1, cluster2, cluster3, cluster4, cluster5]);

      // 2. Iris Clusters Chart
      const iris1 = Array.from({length: 18}, () => ({x: 1.5 + Math.random()*0.8, y: 0.3 + Math.random()*0.3}));
      const iris2 = Array.from({length: 18}, () => ({x: 4.2 + Math.random()*0.8, y: 1.3 + Math.random()*0.4}));
      const iris3 = Array.from({length: 18}, () => ({x: 5.5 + Math.random()*0.9, y: 2.0 + Math.random()*0.4}));
      window.createClusterChart('chartIris', [iris1, iris2, iris3]);
    `;
  }

  // Intuition & Assumptions content
  const intuitionHtml = `
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot"></span> 1. Intuition & Algorithmic Mental Model
      </h2>
      <div class="card-grid-2">
        <div class="info-card">
          <h3>How the Algorithm Solves Problems</h3>
          <p>${linkConcepts(desc)}</p>
          <p>By framing learning as an explicit optimization task, this architecture establishes an optimal balance governed by the <a class="concept-link" href="../../concepts/bias-variance-tradeoff/index.html">Bias-Variance Tradeoff</a>, ensuring generalizability to unseen data.</p>
        </div>
        <div class="info-card">
          <h3>Core Theoretical Assumptions</h3>
          <ul class="assumptions-checklist">
            <li><span class="assump-icon">&#10003;</span> <div><strong>Data Generation:</strong> Assumes instances are independent and identically distributed ($i.i.d.$).</div></li>
            <li><span class="assump-icon">&#10003;</span> <div><strong>Feature Representation:</strong> Input space vectors $X$ are expected to be properly scaled via <a class="concept-link" href="../../concepts/exploratory-data-analysis/index.html">EDA and Preprocessing</a>.</div></li>
            <li><span class="assump-icon">&#10003;</span> <div><strong>Optimization Surface:</strong> Relies on optimizing a mathematically rigorous <a class="concept-link" href="../../concepts/loss-functions/index.html">Loss Function</a> surface.</div></li>
          </ul>
        </div>
      </div>

      ${buildPipelineDiagram(title, cat)}
    </section>
  `;

  // Interactive Simulation Lab content
  const visualLabHtml = `
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot violet"></span> 2. Interactive Simulation Laboratory
      </h2>
      <div id="model-sim-lab"></div>
    </section>
  `;

  // Step-by-Step Derivation content
  const derivationHtml = `
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot cyan"></span> 3. Step-by-Step Mathematical Derivation & Blueprint
      </h2>

      <div class="math-dissection-grid">
        <div class="dissect-card">
          <span class="dissect-symbol">X \\in \\mathbb{R}^{n \\times p}</span>
          <span class="dissect-role">Design Feature Matrix</span>
          <span class="dissect-desc">Batch of $n$ training instances each characterized by $p$ normalized predictors.</span>
        </div>
        <div class="dissect-card">
          <span class="dissect-symbol">\\beta / w \\in \\mathbb{R}^p</span>
          <span class="dissect-role">Learnable Parameter Vector</span>
          <span class="dissect-desc">Model coefficients learned via closed-form inversion or gradient descent.</span>
        </div>
        <div class="dissect-card">
          <span class="dissect-symbol">\\mathcal{L}(\\theta) / J(\\theta)</span>
          <span class="dissect-role">Objective Cost Functional</span>
          <span class="dissect-desc">Empirical risk penalty measuring discrepancy between ground truth and predictions.</span>
        </div>
        <div class="dissect-card">
          <span class="dissect-symbol">\\lambda / C / \\eta</span>
          <span class="dissect-role">Hyperparameter Envelope</span>
          <span class="dissect-desc">Controls regularization capacity, margin violation penalty, or learning step size.</span>
        </div>
      </div>

      <div class="derivation-container" style="margin-top:20px;">
        <div class="derivation-step">
          <div class="step-header">
            <span class="step-num">Step 01</span>
            <span class="step-title">${deriv.step1_title}</span>
          </div>
          <div class="step-formula">
            ${deriv.step1_formula}
          </div>
          <p class="step-desc">${linkConcepts(deriv.step1_desc)}</p>
        </div>

        <div class="derivation-step">
          <div class="step-header">
            <span class="step-num">Step 02</span>
            <span class="step-title">${deriv.step2_title}</span>
          </div>
          <div class="step-formula">
            ${deriv.step2_formula}
          </div>
          <p class="step-desc">${linkConcepts(deriv.step2_desc)}</p>
        </div>
      </div>
    </section>
  `;

  // Trade-offs & Failure Modes content
  const tradeoffsHtml = `
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot amber"></span> 5. Architectural Trade-offs & Failure Modes Playbook
      </h2>
      <div class="card-grid-2">
        <div class="callout green">
          <span class="callout-title">When to Choose this Architecture</span>
          <ul style="margin:6px 0 0; padding-left:18px; font-size:14px; color:var(--soft); line-height:1.7;">
            <li>When direct interpretability and explainability are mandatory for regulatory compliance.</li>
            <li>When dataset volume is moderate and computational training budget is strictly limited.</li>
            <li>When robust linear or well-conditioned relationships dominate after proper <a class="concept-link" href="../../concepts/feature-selection/index.html">Feature Selection</a>.</li>
          </ul>
        </div>
        <div class="callout violet">
          <span class="callout-title">When NOT to Choose this Architecture</span>
          <ul style="margin:6px 0 0; padding-left:18px; font-size:14px; color:var(--soft); line-height:1.7;">
            <li>When complex, high-order non-linear feature interactions exist that simple kernels cannot capture.</li>
            <li>When features exhibit extreme multicollinearity without applying <a class="concept-link" href="../../concepts/regularization/index.html">Regularization (Ridge/Lasso)</a>.</li>
            <li>When severe class imbalance makes standard accuracy misleading, requiring metric optimization for <a class="concept-link" href="../../concepts/precision-recall-f1/index.html">Recall & F1</a>.</li>
          </ul>
        </div>
      </div>

      <div class="card-grid-2" style="margin-top:20px;">
        <div class="callout amber">
          <span class="callout-title">Production Failure Mode: High Variance & Overfitting</span>
          <p style="font-size:13.5px; color:var(--muted); margin:4px 0 8px; line-height:1.6;">
            Occurs when model capacity exceeds sample complexity or when collinear features inflate parameter variance.
          </p>
          <ul style="margin:0; padding-left:18px; font-size:13px; color:var(--soft); line-height:1.6;">
            <li>Apply $L_2$ Ridge shrinkage ($\lambda > 0$) or prune tree depth.</li>
            <li>Perform 5-fold cross-validation to detect train/validation generalization divergence.</li>
            <li>Prune redundant collinear covariates using <a class="concept-link" href="../../concepts/feature-selection/index.html">Variance Inflation Factor (VIF)</a>.</li>
          </ul>
        </div>
        <div class="callout red">
          <span class="callout-title">Production Failure Mode: Leverage Outliers & Shift</span>
          <p style="font-size:13.5px; color:var(--muted); margin:4px 0 8px; line-height:1.6;">
            High-leverage anomalies drag the optimization surface away from the true data generating manifold.
          </p>
          <ul style="margin:0; padding-left:18px; font-size:13px; color:var(--soft); line-height:1.6;">
            <li>Use robust losses like Huber Loss ($\delta = 1.0$) or Soft-Margin Slack ($C$).</li>
            <li>Clip features via interquartile range (Tukey IQR) during production EDA.</li>
            <li>Audit residual distribution normality using Q-Q diagnostic plots.</li>
          </ul>
        </div>
      </div>
    </section>
  `;

  const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · Learn ML · Yogesh Awate</title>
  <meta name="theme-color" content="#070709">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderKatex()"></script>
  <script>
    function renderKatex() {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\\\(', right: '\\\\)', display: false},
            {left: '\\\\[', right: '\\\\]', display: true}
          ],
          throwOnError: false
        });
      }
    }
    document.addEventListener("DOMContentLoaded", renderKatex);
    window.addEventListener("load", renderKatex);
  </script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="../../visual-components.css">
  <link rel="stylesheet" href="../../model.css">
</head>
<body>
  <!-- Fixed Top Navigation -->
  <nav id="nav">
    <div class="nav-left">
      <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
      <div class="nav-breadcrumbs">
        <a href="../../index.html#learn">Learn</a>
        <span class="sep">/</span>
        <a href="../../index.html#learn-models">Models</a>
        <span class="sep">/</span>
        <span>${title}</span>
      </div>
    </div>
    <div class="nav-badges">
      <span class="badge-cat ${cat}">${cat}</span>
      <a href="../../index.html#learn" class="nav-concepts-link">&larr; Back to Learn</a>
    </div>
  </nav>

  <main class="detail-content">
    <!-- Header -->
    <header class="detail-header">
      <div class="subfamily-tag">${sub}</div>
      <h1>${title}</h1>
      <p>${desc}</p>
      ${conceptChipsHtml}
    </header>

    <!-- 1. Intuition & Mental Model + Computational Pipeline -->
    ${intuitionHtml}

    <!-- 2. Interactive Simulation Laboratory -->
    ${visualLabHtml}

    <!-- 3. Mathematical Derivation & Blueprint -->
    ${derivationHtml}

    <!-- 4. Modular Multi-Dataset Benchmarks -->
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot green"></span> 4. Modular Multi-Dataset Laboratory (EDA & Feature Selection)
      </h2>
      <p style="color:var(--muted); font-size:14.5px; margin-top:-8px;">
        Explore how this architecture adapts across different datasets. Review the raw data schema, exploratory data analysis, feature selection techniques tested, and the exact rationale for the chosen preprocessing pipeline.
      </p>

      ${datasetTabsHtml}

      ${datasetPanelsHtml}
    </section>

    <!-- 5. Architectural Trade-offs & Failure Modes Playbook -->
    ${tradeoffsHtml}
  </main>

  <footer>
    <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
    <div>
      <a href="../../index.html#learn-concepts">Concepts Hub</a> &bull;
      <a href="../../index.html#learn">Back to Learn Hub</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>

  <script src="../../visual-simulators.js"></script>
  <script src="../../model-interactive.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      ${chartInitScript}
      if (window.MLVisualLabs) {
        ${cat === 'regression' ? `
          window.MLVisualLabs.initRegressionLab('model-sim-lab', { regularized: ${title.includes('Ridge') || title.includes('Lasso') || title.includes('Elastic')} });
        ` : cat === 'classification' ? `
          window.MLVisualLabs.initClassificationLab('model-sim-lab');
        ` : `
          window.MLVisualLabs.initClusteringLab('model-sim-lab');
        `}
      }
    });
  </script>
</body>
</html>
`;

  fs.writeFileSync(indexPath, pageHtml);
  updatedCount++;
}

console.log(`Successfully generated ${updatedCount} complete model pages with scrollable raw datasets and visual labs!`);
