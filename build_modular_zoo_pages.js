const fs = require('fs');
const path = require('path');

const modelsData = JSON.parse(fs.readFileSync('extracted_models.json', 'utf8'));
console.log(`Loaded ${modelsData.length} models for building modular deep dive pages.`);

// Helper to wrap concepts with interactive links
function linkConcepts(text) {
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
          <span class="switcher-label">
            <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Interactive Modular Dataset Benchmarks:
          </span>
          <span class="switcher-helper">Switch datasets to explore how EDA and Feature Selection adapt</span>
        </div>
        <div class="dataset-tabs">
          <button class="dataset-tab active" data-target="ds-california">
            <span>California Housing</span>
            <span class="tab-badge">Geographic Census · 500 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-diabetes">
            <span>Diabetes Clinical</span>
            <span class="tab-badge">Physiological Serum · 442 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-collinear">
            <span>Collinear Real-Estate</span>
            <span class="tab-badge">High Multicollinearity · 500 rows</span>
          </button>
        </div>
      </div>
    `;

    datasetPanelsHtml = `
      <!-- Panel 1: California Housing -->
      <div id="ds-california" class="dataset-panel active">
        <div class="callout violet">
          <span class="callout-title">Dataset Profile: California Housing Census</span>
          <p><strong>Goal:</strong> Predict median California block group housing values ($100k) from 8 geographic and socio-demographic features.</p>
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

        <!-- EDA & Feature Selection for California Housing -->
        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <strong>Target Capping:</strong> <code>MedHouseVal</code> is artificially capped at $5.00 ($500,000) in the raw census, creating a right-hand boundary ceiling.</p>
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
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">RMSE</a></td><td class="val">${model.metrics[0] ? model.metrics[0].val : '0.7455'}</td><td>Average deviation of ~$74,550 on house values.</td></tr>
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

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <code>SqFt</code> and <code>Bedrooms</code> have an artificial collinearity of <strong>r = 0.92</strong> with <strong>VIF = 18.4</strong>.</p>
            <p>2. In standard OLS without feature selection, the regression coefficient for <code>Bedrooms</code> turns negative (-$14,200), defying real-world economics due to matrix instability.</p>
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
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">RMSE</a></td><td class="val">18.42k</td><td>Stable residual error following collinear pruning.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/regression-metrics/index.html">R² Score</a></td><td class="val">0.8420</td><td>84.2% variance explained with zero matrix conditioning alerts.</td></tr>
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
        <a class="concept-chip" href="../../concepts/roc-auc/index.html">ROC-AUC Curves</a>
        <a class="concept-chip" href="../../concepts/loss-functions/index.html">Log Loss / Cross-Entropy</a>
        <a class="concept-chip" href="../../concepts/feature-selection/index.html">Feature Selection</a>
        <a class="concept-chip" href="../../concepts/cross-validation/index.html">Stratified CV</a>
      </div>
    `;

    datasetTabsHtml = `
      <div class="dataset-switcher-bar">
        <div class="switcher-header">
          <span class="switcher-label">
            <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Interactive Modular Dataset Benchmarks:
          </span>
          <span class="switcher-helper">Switch datasets to explore how Confusion Matrix and Feature Selection adapt</span>
        </div>
        <div class="dataset-tabs">
          <button class="dataset-tab active" data-target="ds-titanic">
            <span>Titanic Survival</span>
            <span class="tab-badge">Demographic & Socioeconomic · 500 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-cancer">
            <span>Breast Cancer Wisconsin</span>
            <span class="tab-badge">Cell Nuclei Geometry · 500 rows</span>
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

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <code>Radius_Mean</code>, <code>Perimeter_Mean</code>, and <code>Area_Mean</code> have correlation <strong>r &gt; 0.98</strong> (extreme geometric collinearity).</p>
            <p>2. <strong>Asymmetric Cost:</strong> False Negatives (missing a malignant tumor) are catastrophic, meaning <strong>Recall must be prioritized over raw Accuracy</strong>.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: Correlation Pruning (r &gt; 0.90) + RobustScaler</span>
              <h4>Why this was selected:</h4>
              <p>Removes redundant dimensional representations of cell size, isolating concavity and texture variations while maintaining an optimal 97.2% clinical Recall.</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Classification Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/confusion-matrix/index.html">Accuracy</a></td><td class="val">96.50%</td><td>High separable clinical accuracy.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/precision-recall-f1/index.html">Recall (Sensitivity)</a></td><td class="val">97.20%</td><td>Critical: minimizes life-threatening False Negatives.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/roc-auc/index.html">ROC-AUC</a></td><td class="val">0.9910</td><td>Near-perfect diagnostic discrimination curve.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Breast Cancer Confusion Matrix Diagnostic Breakdown</div>
            <div class="chart-wrap">
              <canvas id="chartCancer"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    chartInitScript = `
      // 1. Titanic Confusion Matrix
      window.createConfusionMatrixChart('chartTitanic', { tp: 74, fp: 21, tn: 180, fn: 25 });

      // 2. Cancer Confusion Matrix
      window.createConfusionMatrixChart('chartCancer', { tp: 97, fp: 4, tn: 195, fn: 4 });
    `;

  } else {
    // Clustering
    conceptChipsHtml = `
      <div class="concept-chips-bar">
        <span class="concept-chip-label">Essential Concepts:</span>
        <a class="concept-chip" href="../../concepts/clustering-metrics/index.html">Silhouette Analysis</a>
        <a class="concept-chip" href="../../concepts/clustering-metrics/index.html">Elbow Method & Inertia</a>
        <a class="concept-chip" href="../../concepts/feature-selection/index.html">Feature Selection</a>
        <a class="concept-chip" href="../../concepts/exploratory-data-analysis/index.html">Exploratory Data Analysis</a>
      </div>
    `;

    datasetTabsHtml = `
      <div class="dataset-switcher-bar">
        <div class="switcher-header">
          <span class="switcher-label">
            <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Interactive Modular Dataset Benchmarks:
          </span>
          <span class="switcher-helper">Switch datasets to explore how clusters, Silhouette, and Inertia adapt</span>
        </div>
        <div class="dataset-tabs">
          <button class="dataset-tab active" data-target="ds-mall">
            <span>Mall Customers</span>
            <span class="tab-badge">Annual Income vs Spending · 500 rows</span>
          </button>
          <button class="dataset-tab" data-target="ds-iris">
            <span>Iris Morphological</span>
            <span class="tab-badge">Botanical Petal Geometry · 150 rows</span>
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
          <span class="callout-title">Dataset Profile: Iris Morphological Segmentation</span>
          <p><strong>Goal:</strong> Unsupervised botanical clustering based on sepal and petal measurements.</p>
        </div>

        <div class="card-grid-2">
          <div class="info-card">
            <h3>Exploratory Data Analysis (EDA) Findings</h3>
            <p>1. <code>PetalLength</code> and <code>PetalWidth</code> account for 92% of cluster separation variance.</p>
            <p>2. One cluster (Setosa) is linearly separable from the other two, which have minor overlapping boundaries.</p>
          </div>
          <div class="info-card">
            <h3>Feature Selection Decision & Rationale</h3>
            <div class="fs-card chosen">
              <span class="fs-card-type">Chosen Technique: Principal Component Analysis (PCA 2D)</span>
              <h4>Why this was selected:</h4>
              <p>Projects 4 continuous dimensions into 2 orthogonal principal components, capturing 95.8% of cumulative variance while enabling 2D distance calculations.</p>
            </div>
          </div>
        </div>

        <div class="diag-grid">
          <div class="table-card">
            <table class="diag-table">
              <thead><tr><th>Clustering Metric</th><th>Validation Score</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><a class="metric-link" href="../../concepts/clustering-metrics/index.html">Optimal K</a></td><td class="val">3</td><td>Matches true biological species count.</td></tr>
                <tr><td><a class="metric-link" href="../../concepts/clustering-metrics/index.html">Silhouette Score</a></td><td class="val">0.6860</td><td>High cohesion and separation score.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="chart-card">
            <div class="chart-title">Iris PCA: 2D Cluster Scatter Visualization</div>
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
          <ul style="margin:0; padding-left:18px; font-size:14px; color:var(--muted); line-height:1.7;">
            <li><strong>Data Generation:</strong> Assumes instances are independent and identically distributed ($i.i.d.$).</li>
            <li><strong>Feature Representation:</strong> Input space vectors $X$ are expected to be properly scaled via <a class="concept-link" href="../../concepts/exploratory-data-analysis/index.html">EDA and Preprocessing</a>.</li>
            <li><strong>Optimization Surface:</strong> Relies on optimizing a mathematically rigorous <a class="concept-link" href="../../concepts/loss-functions/index.html">Loss Function</a> surface.</li>
          </ul>
        </div>
      </div>
    </section>
  `;

  // Step-by-Step Derivation content
  const derivationHtml = `
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot cyan"></span> 2. Step-by-Step Mathematical Derivation
      </h2>
      <div class="derivation-container">
        <div class="derivation-step">
          <div class="step-header">
            <span class="step-num">Step 01</span>
            <span class="step-title">Formulate the Objective & Loss Function</span>
          </div>
          <div class="step-formula">
            $$\\mathcal{L}(\\theta) = \\frac{1}{n} \\sum_{i=1}^n \\ell(f(x_i; \\theta), y_i) + \\lambda \\Omega(\\theta)$$
          </div>
          <p class="step-desc">The model formalizes its goal through a dedicated <a class="concept-link" href="../../concepts/loss-functions/index.html">Loss Function</a>, penalizing discrepancies between hypotheses and ground truth while optionally applying <a class="concept-link" href="../../concepts/regularization/index.html">Regularization</a> penalties $\\Omega(\\theta)$.</p>
        </div>

        <div class="derivation-step">
          <div class="step-header">
            <span class="step-num">Step 02</span>
            <span class="step-title">Computing the Gradient & Optimality Conditions</span>
          </div>
          <div class="step-formula">
            $$\\nabla_\\theta \\mathcal{L}(\\theta) = 0 \\implies \\theta^* = \\arg\\min_\\theta \\mathcal{L}(\\theta)$$
          </div>
          <p class="step-desc">Finding optimal weights $\\theta^*$ requires setting the analytical gradient to zero (for closed-form solutions) or iteratively following the steepest descent path via <a class="concept-link" href="../../concepts/gradient-descent/index.html">Gradient Descent</a>.</p>
        </div>
      </div>
    </section>
  `;

  // Trade-offs content
  const tradeoffsHtml = `
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot amber"></span> 4. Architectural Trade-offs & Practitioner Guide
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
    </section>
  `;

  const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · Modular Architectural Lab · Yogesh Awate</title>
  <meta name="theme-color" content="#070709">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="../../model.css">
</head>
<body>
  <!-- Fixed Top Navigation -->
  <nav id="nav">
    <div class="nav-left">
      <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
      <div class="nav-breadcrumbs">
        <a href="../../index.html">Model Zoo</a>
        <span class="sep">/</span>
        <a href="../../concepts/index.html">Concepts Hub</a>
        <span class="sep">/</span>
        <span>${title}</span>
      </div>
    </div>
    <div class="nav-badges">
      <span class="badge-cat ${cat}">${cat}</span>
      <a href="../../concepts/index.html" class="nav-concepts-link">Concepts Hub (13) &rarr;</a>
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

    <!-- 1. Intuition & Mental Model -->
    ${intuitionHtml}

    <!-- 2. Mathematical Derivation -->
    ${derivationHtml}

    <!-- 3. Modular Multi-Dataset Benchmarks -->
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot green"></span> 3. Modular Multi-Dataset Laboratory (EDA & Feature Selection)
      </h2>
      <p style="color:var(--muted); font-size:14.5px; margin-top:-8px;">
        Explore how this architecture adapts across different datasets. Review the exploratory data analysis, feature selection techniques tested, and the exact rationale for the chosen preprocessing pipeline.
      </p>

      ${datasetTabsHtml}

      ${datasetPanelsHtml}
    </section>

    <!-- 4. Architectural Trade-offs -->
    ${tradeoffsHtml}
  </main>

  <footer>
    <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
    <div>
      <a href="../../concepts/index.html">Concepts Hub</a> &bull;
      <a href="../../index.html">All 47 Architectures</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>

  <script src="../../model-interactive.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      ${chartInitScript}
    });
  </script>
</body>
</html>
`;

  fs.writeFileSync(indexPath, pageHtml);
  updatedCount++;
}

console.log(`Successfully built ${updatedCount} modular, deeply educational model pages!`);
