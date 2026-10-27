const fs = require('fs');
const path = require('path');

const conceptsDir = path.join(__dirname, 'concepts');
if (!fs.existsSync(conceptsDir)) {
  fs.mkdirSync(conceptsDir, { recursive: true });
}

// Concept definitions with properly delimited mathematical formulas ($$ for block, $ for inline)
const concepts = [
  {
    id: 'loss-functions',
    title: 'Loss Functions & Optimization Landscapes',
    category: 'Optimization & Loss Theory',
    badgeClass: 'violet',
    lead: 'A rigorous mathematical exploration of loss, cost, and objective functions spanning continuous regression, discrete classification, and margin-based algorithms.',
    kicker: 'Foundational Theory · 01',
    sections: [
      {
        title: 'Loss Function vs. Cost Function vs. Objective Function',
        dot: 'violet',
        content: `
          <p>While often used interchangeably in casual discussion, mathematical optimization enforces strict distinctions between these core formulations:</p>
          <div class="card-grid-3">
            <div class="feature-card">
              <span class="card-num">01 / Instance Loss</span>
              <h3>Loss Function $\\mathcal{L}(\\hat{y}^{(i)}, y^{(i)})$</h3>
              <p>Measures the prediction error on a <strong>single training instance</strong>. It quantifies the penalty incurred when the model predicts $\\hat{y}^{(i)}$ instead of true ground truth $y^{(i)}$.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">02 / Aggregate Cost</span>
              <h3>Cost Function $J(\\theta)$</h3>
              <p>The aggregate empirical expectation computed over the <strong>entire training dataset</strong> (or mini-batch), frequently augmented with a regularization penalty $\\Omega(\\theta)$:</p>
              <div class="math-card" style="padding:14px; margin-top:8px;">$$J(\\theta) = \\frac{1}{n} \\sum_{i=1}^n \\mathcal{L}(\\hat{y}^{(i)}, y^{(i)}) + \\lambda \\Omega(\\theta)$$</div>
            </div>
            <div class="feature-card">
              <span class="card-num">03 / Optimization Goal</span>
              <h3>Objective Function</h3>
              <p>The most general mathematical formulation being minimized (loss) or maximized (reward, likelihood). In ML, our objective is to find $\\hat{\\theta} = \\arg\\min_\\theta J(\\theta)$.</p>
            </div>
          </div>
        `
      },
      {
        title: 'Canonical Regression Loss Functions',
        dot: 'cyan',
        content: `
          <p>The choice of loss function directly shapes the model's sensitivity to anomalies and the geometric properties of the optimization surface.</p>
          <div class="table-wrap">
            <table class="concept-table">
              <thead>
                <tr>
                  <th>Loss Function</th>
                  <th>Mathematical Formulation</th>
                  <th>Gradient $\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}$</th>
                  <th>Robustness to Outliers</th>
                  <th>Primary Use Cases</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="highlight">Mean Squared Error (MSE / L2)</td>
                  <td class="code-val">$$\\mathcal{L} = \\frac{1}{2}(y - \\hat{y})^2$$</td>
                  <td class="code-val">$$-(y - \\hat{y})$$</td>
                  <td>Low (errors grow quadratically)</td>
                  <td>OLS, Ridge, Polynomial Regression, Gaussian Process</td>
                </tr>
                <tr>
                  <td class="highlight">Mean Absolute Error (MAE / L1)</td>
                  <td class="code-val">$$\\mathcal{L} = |y - \\hat{y}|$$</td>
                  <td class="code-val">$$-\\text{sgn}(y - \\hat{y})$$</td>
                  <td>High (linear penalty on residuals)</td>
                  <td>Median regression, financial datasets with heavy tails</td>
                </tr>
                <tr>
                  <td class="highlight">Huber Loss (Smooth L1)</td>
                  <td class="code-val">$$\\begin{cases} \\frac{1}{2}e^2 & |e| \\le \\delta \\\\ \\delta(|e| - \\frac{1}{2}\\delta) & \\text{otherwise} \\end{cases}$$</td>
                  <td class="code-val">$$\\begin{cases} -e & |e| \\le \\delta \\\\ -\\delta\\text{sgn}(e) & \\text{otherwise} \\end{cases}$$</td>
                  <td>Optimal (quadratic for small errors, linear for anomalies)</td>
                  <td>Robust Regression, Gradient Boosting, Object Detection</td>
                </tr>
                <tr>
                  <td class="highlight">Epsilon-Insensitive Loss</td>
                  <td class="code-val">$$\\max(0, |y - \\hat{y}| - \\epsilon)$$</td>
                  <td class="code-val">$$\\begin{cases} 0 & |e| \\le \\epsilon \\\\ -\\text{sgn}(e) & \\text{otherwise} \\end{cases}$$</td>
                  <td>High (ignores errors within margin tube $\\epsilon$)</td>
                  <td>Support Vector Regression (SVR)</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        title: 'Canonical Classification Loss Functions',
        dot: 'green',
        content: `
          <p>Classification models map continuous logits $z = w^T x + b$ to discrete probabilities or margin boundaries:</p>
          <div class="callout violet">
            <span class="callout-title">Binary Cross-Entropy (Log Loss)</span>
            <p>Derived directly from the negative log-likelihood of a Bernoulli distribution under maximum likelihood estimation (MLE):</p>
            <div class="math-card">
              $$\\mathcal{L}_{\\text{BCE}}(y, p) = - \\left[ y \\log(p) + (1 - y) \\log(1 - p) \\right], \\quad p = \\sigma(z) = \\frac{1}{1 + e^{-z}}$$
            </div>
            <p>When the true label is $y=1$ and predicted probability $p \\to 0$, $\\mathcal{L} \\to \\infty$, heavily penalizing overconfident incorrect predictions.</p>
          </div>
          <div class="callout cyan" style="margin-top: 14px;">
            <span class="callout-title">Hinge Loss (Support Vector Machines)</span>
            <p>Enforces maximum-margin separation by penalizing points that violate or breach the margin boundary:</p>
            <div class="math-card">
              $$\\mathcal{L}_{\\text{Hinge}}(y, f(x)) = \\max(0, 1 - y \\cdot f(x)), \\quad y \\in \\{-1, +1\\}$$
            </div>
            <p>If $y \\cdot f(x) \\ge 1$, the instance is correctly classified beyond the margin boundary and incurs <strong>zero loss</strong>.</p>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Ordinary Least Squares', url: '../../models/ols_linear_regression/index.html', cat: 'regression' },
      { name: 'Ridge Regression', url: '../../models/ridge_regression/index.html', cat: 'regression' },
      { name: 'Lasso Regression', url: '../../models/lasso_regression/index.html', cat: 'regression' },
      { name: 'Logistic Regression', url: '../../models/logistic_regression/index.html', cat: 'classification' },
      { name: 'Support Vector Classifier', url: '../../models/support_vector_classifier/index.html', cat: 'classification' },
      { name: 'Support Vector Regression', url: '../../models/support_vector_regression/index.html', cat: 'regression' },
      { name: 'MLP Classifier', url: '../../models/mlp_classifier/index.html', cat: 'classification' }
    ]
  },
  {
    id: 'confusion-matrix',
    title: 'Confusion Matrix & Diagnostic Error Analysis',
    category: 'Evaluation & Diagnostics',
    badgeClass: 'violet',
    lead: 'The fundamental diagnostic grid for discrete classification, mapping ground truth against model hypotheses to isolate Type I and Type II errors.',
    kicker: 'Evaluation & Diagnostics · 02',
    sections: [
      {
        title: 'Anatomy of the 2×2 Confusion Matrix',
        dot: 'violet',
        content: `
          <p>For any binary classification problem predicting class Positive ($1$) versus Negative ($0$), four mutually exclusive diagnostic outcomes arise:</p>
          <div class="matrix-grid">
            <div class="matrix-header">Actual \\ Predicted</div>
            <div class="matrix-header">Predicted Positive (1)</div>
            <div class="matrix-header">Predicted Negative (0)</div>

            <div class="matrix-header">Actual Positive (1)</div>
            <div class="matrix-cell tp">
              <span class="cell-title">True Positive (TP)</span>
              <span class="cell-desc">Ground truth is Positive; model correctly classified it as Positive. Hit.</span>
            </div>
            <div class="matrix-cell fn">
              <span class="cell-title">False Negative (FN)</span>
              <span class="cell-desc">Ground truth is Positive; model mistakenly classified it as Negative. <strong>Type II Error (Miss)</strong>.</span>
            </div>

            <div class="matrix-header">Actual Negative (0)</div>
            <div class="matrix-cell fp">
              <span class="cell-title">False Positive (FP)</span>
              <span class="cell-desc">Ground truth is Negative; model mistakenly classified it as Positive. <strong>Type I Error (False Alarm)</strong>.</span>
            </div>
            <div class="matrix-cell tn">
              <span class="cell-title">True Negative (TN)</span>
              <span class="cell-desc">Ground truth is Negative; model correctly classified it as Negative. Correct Rejection.</span>
            </div>
          </div>
        `
      },
      {
        title: 'Derived Diagnostic Metrics',
        dot: 'cyan',
        content: `
          <p>Every standard classification metric is derived as a ratio of elements from the confusion matrix:</p>
          <div class="table-wrap">
            <table class="concept-table">
              <thead>
                <tr>
                  <th>Diagnostic Metric</th>
                  <th>Formula</th>
                  <th>Conceptual Question Answered</th>
                  <th>Critical Domain Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="highlight">Accuracy</td>
                  <td class="code-val">$$\\frac{\\text{TP} + \\text{TN}}{\\text{TP} + \\text{TN} + \\text{FP} + \\text{FN}}$$</td>
                  <td>What fraction of all predictions were correct?</td>
                  <td>Misleading on imbalanced datasets (e.g. 99% accuracy on 1% rare fraud).</td>
                </tr>
                <tr>
                  <td class="highlight">Precision (Positive Predictive Value)</td>
                  <td class="code-val">$$\\frac{\\text{TP}}{\\text{TP} + \\text{FP}}$$</td>
                  <td>When the model claims Positive, how often is it right?</td>
                  <td>Critical when False Positives are expensive (spam filters, hiring candidate shortlisting).</td>
                </tr>
                <tr>
                  <td class="highlight">Recall (Sensitivity / True Positive Rate)</td>
                  <td class="code-val">$$\\frac{\\text{TP}}{\\text{TP} + \\text{FN}}$$</td>
                  <td>What percentage of actual Positives did the model catch?</td>
                  <td>Crucial when False Negatives are catastrophic (cancer screening, defect detection, fraud).</td>
                </tr>
                <tr>
                  <td class="highlight">Specificity (True Negative Rate)</td>
                  <td class="code-val">$$\\frac{\\text{TN}}{\\text{TN} + \\text{FP}}$$</td>
                  <td>What percentage of actual Negatives were correctly identified?</td>
                  <td>Evaluates the model's resistance to false alarms.</td>
                </tr>
                <tr>
                  <td class="highlight">F1-Score</td>
                  <td class="code-val">$$2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$</td>
                  <td>Harmonic mean balancing Precision and Recall.</td>
                  <td>Primary benchmark metric for skewed class distributions.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        title: 'The Accuracy Paradox',
        dot: 'green',
        content: `
          <div class="callout violet">
            <span class="callout-title">Why Accuracy Fails in Production</span>
            <p>Consider a credit card fraud detection dataset with 10,000 transactions, where only 20 transactions ($0.2\\%$) are fraudulent. A naive "dummy" model that blindly predicts <strong>Negative (No Fraud)</strong> for every single transaction achieves an impressive <strong>99.8% Accuracy</strong>.</p>
            <p>However, its Recall is <strong>0.0%</strong>: it catches zero fraud cases, rendering it useless in practice. The Confusion Matrix immediately exposes this catastrophic failure by displaying $\\text{TP}=0$ and $\\text{FN}=20$.</p>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Logistic Regression', url: '../../models/logistic_regression/index.html', cat: 'classification' },
      { name: 'Support Vector Classifier', url: '../../models/support_vector_classifier/index.html', cat: 'classification' },
      { name: 'Random Forest Classifier', url: '../../models/random_forest_classifier/index.html', cat: 'classification' },
      { name: 'Gaussian Naive Bayes', url: '../../models/gaussian_naive_bayes/index.html', cat: 'classification' },
      { name: 'Decision Tree Classifier', url: '../../models/decision_tree_classifier/index.html', cat: 'classification' },
      { name: 'AdaBoost Classifier', url: '../../models/adaboost_classifier/index.html', cat: 'classification' }
    ]
  },
  {
    id: 'feature-selection',
    title: 'Feature Selection & Dimensionality Reduction',
    category: 'Feature Engineering & Preprocessing',
    badgeClass: 'green',
    lead: 'Filter, wrapper, and embedded techniques to isolate informative signals, eliminate multicollinearity, and prevent the curse of dimensionality.',
    kicker: 'Preprocessing & Feature Engineering · 03',
    sections: [
      {
        title: 'Taxonomy of Feature Selection Methods',
        dot: 'violet',
        content: `
          <p>Selecting an optimal subset of features improves model interpretability, accelerates training, mitigates overfitting, and removes noisy collinear predictors.</p>
          <div class="card-grid-3">
            <div class="feature-card">
              <span class="card-num">Type 1 / Independent</span>
              <h3>Filter Methods</h3>
              <p>Evaluate feature relevance using statistical scores independent of model training. Extremely fast and computationally scalable.</p>
              <ul style="padding-left:18px; margin:0; font-size:13px; color:var(--muted);">
                <li>Pearson & Spearman Correlation</li>
                <li>Mutual Information Gain</li>
                <li>ANOVA F-statistic (Classification)</li>
                <li>Variance Thresholding</li>
              </ul>
            </div>
            <div class="feature-card">
              <span class="card-num">Type 2 / Iterative</span>
              <h3>Wrapper Methods</h3>
              <p>Treat model training as a black-box evaluation metric, iteratively adding or pruning features to maximize cross-validation performance.</p>
              <ul style="padding-left:18px; margin:0; font-size:13px; color:var(--muted);">
                <li>Recursive Feature Elimination (RFE)</li>
                <li>Sequential Forward Selection (SFS)</li>
                <li>Sequential Backward Elimination</li>
                <li>Genetic Algorithm Search</li>
              </ul>
            </div>
            <div class="feature-card">
              <span class="card-num">Type 3 / Built-In</span>
              <h3>Embedded Methods</h3>
              <p>Feature selection is naturally embedded into the model objective function during loss optimization.</p>
              <ul style="padding-left:18px; margin:0; font-size:13px; color:var(--muted);">
                <li>L1 Lasso Regularization Shrinkage</li>
                <li>Elastic Net Group Sparsity</li>
                <li>Tree Feature Importance (Gini / Gain)</li>
                <li>Gradient Boosted Feature Importances</li>
              </ul>
            </div>
          </div>
        `
      },
      {
        title: 'Diagnosing Multicollinearity: Variance Inflation Factor (VIF)',
        dot: 'cyan',
        content: `
          <p>In linear models ($OLS$, Ridge, Logistic Regression), high collinearity between predictors inflates standard errors of coefficients, making parameter estimates wildly erratic and unstable.</p>
          <div class="callout violet">
            <span class="callout-title">The VIF Formulation</span>
            <p>The Variance Inflation Factor for predictor $X_j$ measures how much of its variance is explained by all other predictors in the dataset:</p>
            <div class="math-card">
              $$\\text{VIF}_j = \\frac{1}{1 - R_j^2}$$
            </div>
            <p>Where $R_j^2$ is the coefficient of determination obtained from regressing feature $X_j$ against all other remaining features.</p>
            <ul style="margin: 6px 0 0; padding-left: 18px; font-size: 13.5px; color: var(--soft);">
              <li><strong>$\\text{VIF} = 1$</strong>: Complete orthogonality (no correlation with other features).</li>
              <li><strong>$\\text{VIF} > 5$</strong>: Moderate multicollinearity; requires monitoring.</li>
              <li><strong>$\\text{VIF} > 10$</strong>: Severe multicollinearity; inversion $(X^T X)^{-1}$ becomes ill-conditioned. Feature pruning or L2 Ridge shrinkage is required.</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Decision Framework: Which Technique to Choose?',
        dot: 'green',
        content: `
          <div class="table-wrap">
            <table class="concept-table">
              <thead>
                <tr>
                  <th>Data & Architecture Scenario</th>
                  <th>Recommended Feature Selection Technique</th>
                  <th>Core Engineering Justification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="highlight">Linear Models (OLS, Ridge, Logistic)</td>
                  <td class="code-val">VIF Filtering + Pearson Correlation + Lasso (L1)</td>
                  <td>Linear models are vulnerable to matrix singularity when features are collinear. VIF eliminates linear dependencies.</td>
                </tr>
                <tr>
                  <td class="highlight">High-Dimensional Data ($p \\gg n$)</td>
                  <td class="code-val">Mutual Information + L1 Lasso Shrinkage</td>
                  <td>Filters zero-information noise quickly, then Lasso forces uninformative weights strictly to zero.</td>
                </tr>
                <tr>
                  <td class="highlight">Tree Ensembles (Random Forest, XGBoost)</td>
                  <td class="code-val">Permutation Importance / SHAP Values</td>
                  <td>Captures non-linear dependencies and feature interactions without assuming monotonic relationships.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Ordinary Least Squares', url: '../../models/ols_linear_regression/index.html', cat: 'regression' },
      { name: 'Lasso Regression', url: '../../models/lasso_regression/index.html', cat: 'regression' },
      { name: 'Elastic Net', url: '../../models/elastic_net/index.html', cat: 'regression' },
      { name: 'Random Forest Regressor', url: '../../models/random_forest_regressor/index.html', cat: 'regression' },
      { name: 'XGBoost Regressor', url: '../../models/xgboost_regressor/index.html', cat: 'regression' }
    ]
  },
  {
    id: 'precision-recall-f1',
    title: 'Precision, Recall, Specificity & F1-Score',
    category: 'Evaluation & Diagnostics',
    badgeClass: 'violet',
    lead: 'The fundamental tradeoff dynamics between positive predictive value, sensitivity, and their harmonic balance across classification models.',
    kicker: 'Evaluation & Diagnostics · 04',
    sections: [
      {
        title: 'The Inherent Precision vs. Recall Tension',
        dot: 'violet',
        content: `
          <p>Every probabilistic classifier generates a continuous score $p = P(y=1|x) \\in [0, 1]$. Class assignment requires choosing a decision threshold $\\tau$:</p>
          <div class="math-card">
            $$\\hat{y} = \\begin{cases} 1 & \\text{if } p \\ge \\tau \\\\ 0 & \\text{if } p < \\tau \\end{cases}$$
          </div>
          <div class="card-grid-2">
            <div class="feature-card">
              <span class="card-num">High Threshold (e.g. $\\tau = 0.85$)</span>
              <h3>High Precision, Lower Recall</h3>
              <p>The model only predicts Positive when exceptionally confident. Reduces False Positives to near zero, but misses borderline true positive cases.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Low Threshold (e.g. $\\tau = 0.15$)</span>
              <h3>High Recall, Lower Precision</h3>
              <p>The model casts a wide diagnostic net. Captures almost every true positive instance, but incurs higher false alarms (False Positives).</p>
            </div>
          </div>
        `
      },
      {
        title: 'Mathematical Derivations: F1-Score & Harmonic Mean',
        dot: 'cyan',
        content: `
          <p>Why do we use the <strong>harmonic mean</strong> instead of a simple arithmetic average $(\\text{Precision} + \\text{Recall})/2$?</p>
          <div class="callout violet">
            <span class="callout-title">The Harmonic Mean Proof</span>
            <p>The arithmetic mean is dominated by large values. If Precision = 1.0 and Recall = 0.0, the arithmetic mean is $0.50$ (suggesting decent performance), despite the model failing completely on recall.</p>
            <p>The harmonic mean takes the reciprocal of values, heavily penalizing extreme disparities:</p>
            <div class="math-card">
              $$F_1 = \\frac{2}{\\frac{1}{\\text{Precision}} + \\frac{1}{\\text{Recall}}} = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}} = \\frac{2 \\cdot \\text{TP}}{2 \\cdot \\text{TP} + \\text{FP} + \\text{FN}}$$
            </div>
            <p>If either Precision or Recall drops to zero, $F_1 \\to 0$.</p>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Logistic Regression', url: '../../models/logistic_regression/index.html', cat: 'classification' },
      { name: 'Random Forest Classifier', url: '../../models/random_forest_classifier/index.html', cat: 'classification' },
      { name: 'Support Vector Classifier', url: '../../models/support_vector_classifier/index.html', cat: 'classification' }
    ]
  },
  {
    id: 'roc-auc',
    title: 'ROC Curve & Area Under the Curve (AUC)',
    category: 'Evaluation & Diagnostics',
    badgeClass: 'violet',
    lead: 'Threshold-invariant evaluation of binary classifiers, quantifying rank-order discrimination capacity across all possible decision boundaries.',
    kicker: 'Evaluation & Diagnostics · 05',
    sections: [
      {
        title: 'Receiver Operating Characteristic (ROC) Mechanics',
        dot: 'violet',
        content: `
          <p>The ROC curve plots the <strong>True Positive Rate (Sensitivity)</strong> against the <strong>False Positive Rate (1 - Specificity)</strong> across every possible classification threshold $\\tau \\in [0, 1]$:</p>
          <div class="math-card">
            $$\\text{TPR}(\\tau) = \\frac{\\text{TP}(\\tau)}{\\text{TP}(\\tau) + \\text{FN}(\\tau)}, \\quad \\text{FPR}(\\tau) = \\frac{\\text{FP}(\\tau)}{\\text{FP}(\\tau) + \\text{TN}(\\tau)}$$
          </div>
          <div class="callout cyan">
            <span class="callout-title">Probabilistic Interpretation of AUC</span>
            <p>The Area Under the ROC Curve (AUC) has an elegant statistical interpretation: it is the exact probability that the classifier will rank a randomly chosen positive instance higher than a randomly chosen negative instance:</p>
            <div class="math-card">
              $$\\text{AUC} = P\\left( f(x^+) > f(x^-) \\right)$$
            </div>
            <ul style="margin:0; padding-left:18px; font-size:13.5px; color:var(--soft);">
              <li><strong>$\\text{AUC} = 1.0$</strong>: Perfect separable classification.</li>
              <li><strong>$\\text{AUC} = 0.5$</strong>: Diagonal line, equivalent to random coin tossing.</li>
              <li><strong>$\\text{AUC} < 0.5$</strong>: Worse than random (invert predictions to obtain $1 - \\text{AUC}$).</li>
            </ul>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Logistic Regression', url: '../../models/logistic_regression/index.html', cat: 'classification' },
      { name: 'Gradient Boosted Classifiers', url: '../../models/gradient_boosted_classifiers/index.html', cat: 'classification' }
    ]
  },
  {
    id: 'regression-metrics',
    title: 'Regression Evaluation Metrics & Residual Diagnostics',
    category: 'Evaluation & Diagnostics',
    badgeClass: 'green',
    lead: 'Comprehensive evaluation framework for continuous prediction: MSE, RMSE, MAE, R², Adjusted R², and Gauss-Markov residual diagnostics.',
    kicker: 'Evaluation & Diagnostics · 06',
    sections: [
      {
        title: 'Continuous Error Metrics Compared',
        dot: 'violet',
        content: `
          <div class="table-wrap">
            <table class="concept-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Formula</th>
                  <th>Units</th>
                  <th>Sensitivity to Outliers</th>
                  <th>Key Strength</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="highlight">MSE</td>
                  <td class="code-val">$$\\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{y}_i)^2$$</td>
                  <td>$\\text{Unit}^2$</td>
                  <td>Extremely High</td>
                  <td>Differentiable; standard optimization loss.</td>
                </tr>
                <tr>
                  <td class="highlight">RMSE</td>
                  <td class="code-val">$$\\sqrt{\\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{y}_i)^2}$$</td>
                  <td>$\\text{Unit}$</td>
                  <td>High</td>
                  <td>Directly interpretable in target's natural units.</td>
                </tr>
                <tr>
                  <td class="highlight">MAE</td>
                  <td class="code-val">$$\\frac{1}{n} \\sum_{i=1}^n |y_i - \\hat{y}_i|$$</td>
                  <td>$\\text{Unit}$</td>
                  <td>Low / Robust</td>
                  <td>Represents expected absolute dollar/unit deviation.</td>
                </tr>
                <tr>
                  <td class="highlight">R² (Determination)</td>
                  <td class="code-val">$$1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2}$$</td>
                  <td>Unitless ($(-\\infty, 1]$)</td>
                  <td>Moderate</td>
                  <td>Proportion of variance explained by model.</td>
                </tr>
                <tr>
                  <td class="highlight">Adjusted R²</td>
                  <td class="code-val">$$1 - \\left( \\frac{1 - R^2}{n - p - 1} \\right)(n - 1)$$</td>
                  <td>Unitless</td>
                  <td>Moderate</td>
                  <td>Penalizes introduction of irrelevant features.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        title: 'Residual Diagnostics & Gauss-Markov Assumptions',
        dot: 'cyan',
        content: `
          <p>A low RMSE is insufficient for model validation; reliable inference requires verifying residual assumptions:</p>
          <div class="callout violet">
            <span class="callout-title">The Four Classical Residual Checks</span>
            <ul style="margin:0; padding-left:18px; font-size:14px; color:var(--soft);">
              <li><strong>1. Zero Mean</strong>: $\\mathbb{E}[e_i] = 0$. Residuals must center around zero without systematic bias.</li>
              <li><strong>2. Homoscedasticity</strong>: Constant error variance $\\text{Var}(e_i|X) = \\sigma^2$. Funnel-shaped residual plots indicate heteroscedasticity.</li>
              <li><strong>3. Independence</strong>: $\\text{Cov}(e_i, e_j) = 0$ for $i \\ne j$. Checked via Durbin-Watson statistic for autocorrelation.</li>
              <li><strong>4. Normality</strong>: Residuals follow a Gaussian distribution $e \\sim \\mathcal{N}(0, \\sigma^2)$, validated using Q-Q plots.</li>
            </ul>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Ordinary Least Squares', url: '../../models/ols_linear_regression/index.html', cat: 'regression' },
      { name: 'Ridge Regression', url: '../../models/ridge_regression/index.html', cat: 'regression' },
      { name: 'Polynomial Regression', url: '../../models/polynomial_regression/index.html', cat: 'regression' },
      { name: 'Gradient Boosting Regressor', url: '../../models/gradient_boosting_regressor/index.html', cat: 'regression' }
    ]
  },
  {
    id: 'clustering-metrics',
    title: 'Clustering Evaluation Metrics & Cluster Validation',
    category: 'Evaluation & Diagnostics',
    badgeClass: 'cyan',
    lead: 'Internal and external cluster validation diagnostics: Silhouette Analysis, Davies-Bouldin Index, Inertia, and the Elbow criterion.',
    kicker: 'Evaluation & Diagnostics · 07',
    sections: [
      {
        title: 'Internal Cluster Validity Diagnostics',
        dot: 'violet',
        content: `
          <p>Unsupervised clustering lacks ground truth labels. Validation relies on measuring intra-cluster cohesion versus inter-cluster separation.</p>
          <div class="card-grid-3">
            <div class="feature-card">
              <span class="card-num">Metric 1 / Tightness</span>
              <h3>Inertia (WCSS)</h3>
              <p>Within-Cluster Sum of Squares:</p>
              <div class="math-card" style="padding:12px; margin-top:6px;">$$\\text{WCSS} = \\sum_{k=1}^K \\sum_{x \\in C_k} \\|x - \\mu_k\\|^2$$</div>
              <p>Used in the Elbow method to find inflection point where diminishing returns occur.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Metric 2 / Relative Cohesion</span>
              <h3>Silhouette Score</h3>
              <p>Measures how similar instance $i$ is to its own cluster versus the nearest neighboring cluster:</p>
              <div class="math-card" style="padding:12px; margin-top:6px;">$$s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))}$$</div>
              <p>Range $[-1, +1]$. Values $> 0.5$ indicate robust, separable cluster boundaries.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Metric 3 / Dispersion Ratio</span>
              <h3>Davies-Bouldin Index</h3>
              <p>Ratio of within-cluster scatter to separation between cluster centroids. <strong>Lower scores indicate superior clustering</strong>.</p>
            </div>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'K-Means Clustering', url: '../../models/kmeans_clustering/index.html', cat: 'clustering' },
      { name: 'DBSCAN', url: '../../models/dbscan_clustering/index.html', cat: 'clustering' },
      { name: 'Gaussian Mixture Models', url: '../../models/gaussian_mixture_models/index.html', cat: 'clustering' }
    ]
  },
  {
    id: 'bias-variance-tradeoff',
    title: 'The Bias-Variance Decomposition & Generalization',
    category: 'Foundational ML Theory',
    badgeClass: 'violet',
    lead: 'The fundamental theoretical constraint governing predictive modeling: decomposing expected test error into underfitting, sensitivity, and irreducible noise.',
    kicker: 'Foundational ML Theory · 08',
    sections: [
      {
        title: 'Mathematical Derivation of the Decomposition',
        dot: 'violet',
        content: `
          <p>For true data generation process $y = f(x) + \\epsilon$ with noise $\\epsilon \\sim \\mathcal{N}(0, \\sigma^2)$, the expected prediction error of estimator $\\hat{f}(x)$ at point $x$ decomposes cleanly into three components:</p>
          <div class="math-card">
            $$\\mathbb{E}\\left[(y - \\hat{f}(x))^2\\right] = \\underbrace{\\left(f(x) - \\mathbb{E}[\\hat{f}(x)]\\right)^2}_{\\text{Bias}^2} + \\underbrace{\\mathbb{E}\\left[(\\hat{f}(x) - \\mathbb{E}[\\hat{f}(x)])^2\\right]}_{\\text{Variance}} + \\underbrace{\\sigma^2}_{\\text{Irreducible Error}}$$
          </div>
          <div class="card-grid-2">
            <div class="feature-card">
              <span class="card-num">High Bias (Underfitting)</span>
              <h3>Erroneous Assumptions</h3>
              <p>The model is overly rigid and fails to capture genuine nonlinear relationships (e.g. fitting OLS to quadratic data). High training error, high test error.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">High Variance (Overfitting)</span>
              <h3>Extreme Sensitivity to Noise</h3>
              <p>The model fits random fluctuations and noise in the training sample (e.g. unpruned Decision Tree). Near-zero training error, large test error.</p>
            </div>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'OLS Regression', url: '../../models/ols_linear_regression/index.html', cat: 'regression' },
      { name: 'Ridge Regression', url: '../../models/ridge_regression/index.html', cat: 'regression' },
      { name: 'Decision Tree Regressor', url: '../../models/decision_tree_regressor/index.html', cat: 'regression' },
      { name: 'Random Forest Regressor', url: '../../models/random_forest_regressor/index.html', cat: 'regression' }
    ]
  },
  {
    id: 'regularization',
    title: 'Regularization Techniques: L1, L2 & Elastic Net',
    category: 'Foundational ML Theory',
    badgeClass: 'violet',
    lead: 'Constrained parameter shrinkage dynamics: geometry of L1 diamond sparsity versus L2 spherical weight decay.',
    kicker: 'Foundational ML Theory · 09',
    sections: [
      {
        title: 'L1 Lasso vs. L2 Ridge Geometry',
        dot: 'violet',
        content: `
          <p>Unconstrained empirical risk minimization often yields large, unstable coefficients. Regularization introduces a constraint ball on the parameter space:</p>
          <div class="table-wrap">
            <table class="concept-table">
              <thead>
                <tr>
                  <th>Regularizer</th>
                  <th>Penalty Term $\\Omega(\\beta)$</th>
                  <th>Constraint Geometry</th>
                  <th>Sparsity</th>
                  <th>Bayesian Prior Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="highlight">Ridge (L2 / Tikhonov)</td>
                  <td class="code-val">$$\\lambda \\sum_{j=1}^p \\beta_j^2$$</td>
                  <td>Hypersphere / Smooth Circle</td>
                  <td>No (shrinks weights toward 0 asymptotically)</td>
                  <td>Gaussian Prior $\\beta_j \\sim \\mathcal{N}(0, \\tau^2)$</td>
                </tr>
                <tr>
                  <td class="highlight">Lasso (L1)</td>
                  <td class="code-val">$$\\lambda \\sum_{j=1}^p |\\beta_j|$$</td>
                  <td>Diamond / Polytope with sharp corners</td>
                  <td><strong>Yes</strong> (forces weights strictly to 0.0)</td>
                  <td>Laplace Prior $\\beta_j \\sim \\text{Laplace}(0, b)$</td>
                </tr>
                <tr>
                  <td class="highlight">Elastic Net</td>
                  <td class="code-val">$$\\lambda_1 \\|\\beta\\|_1 + \\lambda_2 \\|\\beta\\|_2^2$$</td>
                  <td>Convex combination of diamond and circle</td>
                  <td>Selective (groups correlated predictors)</td>
                  <td>Mixed Gaussian-Laplace prior</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Ridge Regression', url: '../../models/ridge_regression/index.html', cat: 'regression' },
      { name: 'Lasso Regression', url: '../../models/lasso_regression/index.html', cat: 'regression' },
      { name: 'Elastic Net', url: '../../models/elastic_net/index.html', cat: 'regression' }
    ]
  },
  {
    id: 'cross-validation',
    title: 'Cross-Validation & Resampling Strategies',
    category: 'Foundational ML Theory',
    badgeClass: 'violet',
    lead: 'Data hygiene, out-of-fold estimation, stratified resampling, and leak-free model evaluation strategies.',
    kicker: 'Foundational ML Theory · 10',
    sections: [
      {
        title: 'The Core Resampling Methodologies',
        dot: 'violet',
        content: `
          <div class="card-grid-3">
            <div class="feature-card">
              <span class="card-num">Strategy 01</span>
              <h3>k-Fold Cross-Validation</h3>
              <p>Partitions training data into $k$ equal subsets. The model trains on $k-1$ folds and tests on the remaining fold, repeating $k$ times to produce an unbiased mean metric.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Strategy 02</span>
              <h3>Stratified k-Fold</h3>
              <p>Preserves the exact percentage of target classes in every fold. Crucial for imbalanced datasets (e.g. Titanic survival rate or medical diagnosis).</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Strategy 03</span>
              <h3>Time-Series Split</h3>
              <p>Enforces strict temporal ordering ($t < t+1$) using rolling or expanding windows, strictly preventing look-ahead data leakage.</p>
            </div>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Random Forest Classifier', url: '../../models/random_forest_classifier/index.html', cat: 'classification' },
      { name: 'LightGBM Regressor', url: '../../models/lightgbm_regressor/index.html', cat: 'regression' }
    ]
  },
  {
    id: 'exploratory-data-analysis',
    title: 'Exploratory Data Analysis (EDA) Fundamentals',
    category: 'Feature Engineering & Preprocessing',
    badgeClass: 'green',
    lead: 'The systematic pipeline for inspecting distributions, identifying outliers, validating collinearity, and assessing skewness before model training.',
    kicker: 'Preprocessing & Feature Engineering · 11',
    sections: [
      {
        title: 'The 4 Pillars of Production EDA',
        dot: 'violet',
        content: `
          <div class="card-grid-2">
            <div class="feature-card">
              <span class="card-num">Pillar 1 / Univariate</span>
              <h3>Distribution & Skewness</h3>
              <p>Examine mean, median, IQR, and skewness coefficients. Features with skewness $> 1.0$ (e.g. income or prices) benefit from logarithmic or Box-Cox power transforms.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Pillar 2 / Multivariate</span>
              <h3>Correlation Matrices</h3>
              <p>Compute Pearson $r$ for linear interactions and Spearman $\\rho$ for monotonic rank associations to identify predictive features and flag multicollinearity.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Pillar 3 / Data Hygiene</span>
              <h3>Missingness Mechanisms</h3>
              <p>Differentiate Missing Completely at Random (MCAR), Missing at Random (MAR), and Missing Not at Random (MNAR) to apply appropriate imputation pipelines.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Pillar 4 / Robustness</span>
              <h3>Outlier Detection</h3>
              <p>Isolate high-leverage anomalies using Tukey's Interquartile Range ($1.5 \\times \\text{IQR}$) or Z-score criteria ($|z| > 3.0$).</p>
            </div>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'OLS Regression', url: '../../models/ols_linear_regression/index.html', cat: 'regression' },
      { name: 'Logistic Regression', url: '../../models/logistic_regression/index.html', cat: 'classification' },
      { name: 'K-Means Clustering', url: '../../models/kmeans_clustering/index.html', cat: 'clustering' }
    ]
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent & Numerical Optimization',
    category: 'Optimization & Loss Theory',
    badgeClass: 'violet',
    lead: 'Iterative first-order optimization algorithms: Batch, Stochastic, Mini-batch, Momentum, RMSprop, and Adam.',
    kicker: 'Optimization & Loss Theory · 12',
    sections: [
      {
        title: 'The Update Rule & Variants',
        dot: 'violet',
        content: `
          <p>For parameterized model with loss $J(\\theta)$, gradient descent updates parameters along the negative direction of steepest gradient:</p>
          <div class="math-card">
            $$\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta J(\\theta_t)$$
          </div>
          <p>Where $\\eta > 0$ represents the learning rate.</p>
        `
      }
    ],
    relatedModels: [
      { name: 'OLS Regression', url: '../../models/ols_linear_regression/index.html', cat: 'regression' },
      { name: 'Perceptron', url: '../../models/perceptron/index.html', cat: 'classification' },
      { name: 'MLP Classifier', url: '../../models/mlp_classifier/index.html', cat: 'classification' }
    ]
  },
  {
    id: 'cost-vs-loss-vs-error',
    title: 'Loss Function vs. Cost Function vs. Error Function',
    category: 'Optimization & Loss Theory',
    badgeClass: 'violet',
    lead: 'Demystifying the precise mathematical taxonomy between instance loss, aggregate cost, and evaluation error in machine learning.',
    kicker: 'Optimization & Loss Theory · 13',
    sections: [
      {
        title: 'Side-by-Side Mathematical Comparison',
        dot: 'violet',
        content: `
          <div class="table-wrap">
            <table class="concept-table">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Mathematical Scope</th>
                  <th>Optimization Role</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="highlight">Loss Function $\\mathcal{L}(y, \\hat{y})$</td>
                  <td>Single sample $(x_i, y_i)$</td>
                  <td>Differentiable target evaluated per instance</td>
                  <td class="code-val">$$\\frac{1}{2}(y_i - \\hat{y}_i)^2 \\quad \\text{or} \\quad -y_i \\log(p_i)$$</td>
                </tr>
                <tr>
                  <td class="highlight">Cost Function $J(\\theta)$</td>
                  <td>Full dataset or mini-batch</td>
                  <td>Direct mathematical objective being optimized by solver</td>
                  <td class="code-val">$$\\frac{1}{n} \\sum_{i=1}^n \\mathcal{L} + \\lambda \\|w\\|^2$$</td>
                </tr>
                <tr>
                  <td class="highlight">Error Function / Metric</td>
                  <td>Evaluation benchmark</td>
                  <td>Interpretable score for humans (often non-differentiable)</td>
                  <td class="code-val">$$\\text{Accuracy}, \\quad \\text{ROC-AUC}, \\quad \\text{F1-Score}, \\quad \\text{RMSE}$$</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      }
    ],
    relatedModels: [
      { name: 'Ordinary Least Squares', url: '../../models/ols_linear_regression/index.html', cat: 'regression' },
      { name: 'Logistic Regression', url: '../../models/logistic_regression/index.html', cat: 'classification' },
      { name: 'Support Vector Classifier', url: '../../models/support_vector_classifier/index.html', cat: 'classification' }
    ]
  },
  {
    "id": "log-odds",
    "title": "Log-Odds & The Logit Function",
    "category": "Probability & Link Theory",
    "badgeClass": "violet",
    "lead": "The mathematical bridge mapping bounded probability space $[0, 1]$ to unbounded Euclidean space $(-\\infty, +\\infty)$, unlocking linear regression models for binary classification.",
    "kicker": "Probabilistic Modeling • 14",
    "sections": [
      {
        "title": "From Probability to Odds to Log-Odds",
        "dot": "violet",
        "content": "\n          <p>A standard posterior probability $p = P(Y=1|X)$ is strictly constrained to the unit interval $p \\in [0, 1]$. If we attempt to fit an unconstrained linear model directly to probabilities ($p = \\mathbf{w}^T \\mathbf{x} + b$), extreme feature values inevitably predict nonsensical probabilities $p < 0$ or $p > 1$, violating the Kolmogorov probability axioms.</p>\n          <div class=\"card-grid-3\">\n            <div class=\"feature-card\">\n              <span class=\"card-num\">01 / Probability</span>\n              <h3>Bounded Interval $[0, 1]$</h3>\n              <p>Measures absolute event likelihood: $p = \\frac{n_{\\text{success}}}{n_{\\text{total}}}$. As $p \\to 0$, event is impossible; as $p \\to 1$, event is guaranteed.</p>\n            </div>\n            <div class=\"feature-card\">\n              <span class=\"card-num\">02 / Odds Ratio</span>\n              <h3>Semi-Infinite $[0, +\\infty)$</h3>\n              <p>Ratio of favorable to unfavorable outcomes:</p>\n              <div class=\"math-card\" style=\"padding:10px; margin-top:6px;\">$\\text{Odds} = \\frac{p}{1 - p}$</div>\n              <p>When $p=0.8$, $\\text{Odds} = 4.0$ (4-to-1 in favor). When $p=0.5$, $\\text{Odds} = 1.0$. Removes upper bound but retains zero floor.</p>\n            </div>\n            <div class=\"feature-card\">\n              <span class=\"card-num\">03 / Logit (Log-Odds)</span>\n              <h3>Unbounded $(-\\infty, +\\infty)$</h3>\n              <p>Taking the natural logarithm yields the logit:</p>\n              <div class=\"math-card\" style=\"padding:10px; margin-top:6px;\">$\\text{logit}(p) = \\ln\\left(\\frac{p}{1 - p}\\right)$</div>\n              <p>Maps $[0, 1] \\to \\mathbb{R}$, perfectly aligning with real-valued linear hyperplanes $\\mathbf{w}^T \\mathbf{x} + b$.</p>\n            </div>\n          </div>\n        "
      },
      {
        "title": "Interpreting Weights as Multiplicative Odds Ratios",
        "dot": "cyan",
        "content": "\n          <p>In Logistic Regression, the systematic component models the log-odds directly as a linear combination:</p>\n          <div class=\"math-card\">\n            $\\ln\\left(\\frac{p}{1 - p}\\right) = w_0 + w_1 x_1 + w_2 x_2 + \\dots + w_p x_p$\n          </div>\n          <p>Consider an increment of $\\Delta x_1 = 1$ while holding all other features strictly constant:</p>\n          <div class=\"math-card\">\n            $\\text{logit}(p_{\\text{new}}) - \\text{logit}(p_{\\text{old}}) = w_1 \\implies \\frac{\\text{Odds}_{\\text{new}}}{\\text{Odds}_{\\text{old}}} = e^{w_1}$\n          </div>\n          <div class=\"table-wrap\">\n            <table class=\"concept-table\">\n              <thead>\n                <tr>\n                  <th>Weight Value $w_j$</th>\n                  <th>Odds Ratio $\\text{OR} = e^{w_j}$</th>\n                  <th>Directional Effect</th>\n                  <th>Clinical / Practical Interpretation</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr>\n                  <td class=\"highlight\">$w_j = +0.693$</td>\n                  <td class=\"code-val\">$e^{0.693} \\approx 2.00$</td>\n                  <td>Doubles Odds (+100%)</td>\n                  <td>Every unit increase doubles the odds of the positive outcome.</td>\n                </tr>\n                <tr>\n                  <td class=\"highlight\">$w_j = 0.000$</td>\n                  <td class=\"code-val\">$e^0 = 1.00$</td>\n                  <td>Neutral (No Change)</td>\n                  <td>Feature has zero statistical association with the class label.</td>\n                </tr>\n                <tr>\n                  <td class=\"highlight\">$w_j = -0.693$</td>\n                  <td class=\"code-val\">$e^{-0.693} \\approx 0.50$</td>\n                  <td>Halves Odds (-50%)</td>\n                  <td>Every unit increase cuts the odds of the outcome in half.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        "
      },
      {
        "title": "Mathematical Symmetry & Asymptotic Saturation",
        "dot": "green",
        "content": "\n          <div class=\"callout violet\">\n            <span class=\"callout-title\">Point Symmetry around the Decision Threshold</span>\n            <p>The logit function exhibits exact antisymmetric reflection about $p = 0.5$ ($\text{logit} = 0$):</p>\n            <div class=\"math-card\">\n              $\\text{logit}(1 - p) = \\ln\\left(\\frac{1 - p}{p}\\right) = -\\ln\\left(\\frac{p}{1 - p}\\right) = -\\text{logit}(p)$\n            </div>\n            <p>A probability of $0.90$ produces $\\text{logit}(0.90) = +2.197$, while its complementary error $0.10$ produces $\\text{logit}(0.10) = -2.197$.</p>\n          </div>\n          <div class=\"callout cyan\" style=\"margin-top:14px;\">\n            <span class=\"callout-title\">Asymptotic Compression & Certainty Penalties</span>\n            <p>As $p \\to 1$, $\\text{logit}(p) \\to +\\infty$; as $p \\to 0$, $\\text{logit}(p) \\to -\\infty$. Increasing probability from $50\\%$ to $60\\%$ requires $\\Delta z = 0.405$, but pushing from $98\\%$ to $99\\%$ requires $\\Delta z = 0.704$, and moving from $99.9\\%$ to $99.99\\%$ requires massive parameter shifts. This guarantees infinite penalties for confident false predictions.</p>\n          </div>\n        "
      }
    ],
    "relatedModels": [
      {
        "name": "Logistic Regression",
        "url": "../../models/logistic_regression/index.html",
        "cat": "classification"
      },
      {
        "name": "Linear Discriminant Analysis",
        "url": "../../models/linear_discriminant_analysis/index.html",
        "cat": "classification"
      },
      {
        "name": "Quadratic Discriminant Analysis",
        "url": "../../models/quadratic_discriminant_analysis/index.html",
        "cat": "classification"
      },
      {
        "name": "Naive Bayes (Gaussian)",
        "url": "../../models/gaussian_naive_bayes/index.html",
        "cat": "classification"
      }
    ]
  },
  {
    "id": "sigmoid-and-link-functions",
    "title": "The Sigmoid Function & Activation Link Mechanisms",
    "category": "Generalized Linear Models & Activations",
    "badgeClass": "cyan",
    "lead": "The canonical inverse link function converting unconstrained linear hyperplanes into calibrated posterior probabilities, and the mathematical backbone of neural activation layers.",
    "kicker": "Functional Mapping • 15",
    "sections": [
      {
        "title": "Definition & Inversion of the Logit Transformation",
        "dot": "cyan",
        "content": "\n          <p>The standard Logistic Sigmoid function $\\sigma(z)$ is the exact algebraic inverse of the logit transformation. Solving for probability $p$ in terms of linear score $z$:</p>\n          <div class=\"math-card\">\n            $z = \\ln\\left(\\frac{p}{1 - p}\\right) \\implies e^z = \\frac{p}{1 - p} \\implies p = e^z(1 - p) \\implies p = \\frac{e^z}{1 + e^z} = \\frac{1}{1 + e^{-z}}$\n          </div>\n          <p>Key mathematical checkpoints on the real number line:</p>\n          <div class=\"card-grid-3\">\n            <div class=\"feature-card\">\n              <span class=\"card-num\">Lower Asymptote</span>\n              <h3>$\\lim_{z \\to -\\infty} \\sigma(z) = 0$</h3>\n              <p>Predicts zero probability for overwhelmingly negative linear scores.</p>\n            </div>\n            <div class=\"feature-card\">\n              <span class=\"card-num\">Inflection Threshold</span>\n              <h3>$\\sigma(0) = 0.50$</h3>\n              <p>The exact decision hyperplane boundary where class odds are $1:1$.</p>\n            </div>\n            <div class=\"feature-card\">\n              <span class=\"card-num\">Upper Asymptote</span>\n              <h3>$\\lim_{z \\to +\\infty} \\sigma(z) = 1$</h3>\n              <p>Predicts guaranteed certainty for strong positive linear evidence.</p>\n            </div>\n          </div>\n        "
      },
      {
        "title": "The Derivative & The Vanishing Gradient Problem",
        "dot": "violet",
        "content": "\n          <p>One of the most computational useful properties of the sigmoid function in calculus and backpropagation is that its first derivative is expressed entirely in terms of its output:</p>\n          <div class=\"math-card\">\n            $\\frac{d}{dz}\\sigma(z) = \\sigma(z)(1 - \\sigma(z))$\n          </div>\n          <p><strong>Proof via Quotient / Chain Rule:</strong></p>\n          <div class=\"math-card\">\n            $\\frac{d}{dz}(1 + e^{-z})^{-1} = -(1 + e^{-z})^{-2} \\cdot (-e^{-z}) = \\frac{e^{-z}}{(1 + e^{-z})^2} = \\left(\\frac{1}{1 + e^{-z}}\\right) \\left(\\frac{e^{-z}}{1 + e^{-z}}\\right) = \\sigma(z)(1 - \\sigma(z))$\n          </div>\n          <div class=\"callout amber\">\n            <span class=\"callout-title\">The Vanishing Gradient Bottleneck in Deep Architectures</span>\n            <p>Because $\\sigma(z) \\in [0, 1]$, the quadratic product $\\sigma(1 - \\sigma)$ reaches an absolute maximum at $\\sigma(z) = 0.5$ ($z=0$):</p>\n            <div class=\"math-card\">$\\max \\sigma'(z) = 0.5 \\times (1 - 0.5) = 0.25$</div>\n            <p>When $|z| \\ge 4$, $\\sigma'(z) < 0.017 \\to 0$. In deep neural networks, computing gradients via the chain rule multiplies these factors across $L$ layers: $\\prod_{l=1}^L \\sigma' \\le (0.25)^L$. For a 10-layer network, $(0.25)^{10} \\approx 9.5 \\times 10^{-7}$, extinguishing parameter updates entirely. This prompted modern deep learning to adopt ReLU/GELU for hidden layers while retaining Sigmoid for binary probability heads.</p>\n          </div>\n        "
      },
      {
        "title": "Generalized Linear Models (GLMs) & Link Functions",
        "dot": "green",
        "content": "\n          <p>In Generalized Linear Models (Nelder & Wedderburn, 1972), models are unified through three formal components:</p>\n          <div class=\"card-grid-3\">\n            <div class=\"feature-card\">\n              <span class=\"card-num\">Component A</span>\n              <h3>Random Component</h3>\n              <p>Target $Y$ drawn from an exponential family distribution (Bernoulli, Poisson, Gaussian, Gamma).</p>\n            </div>\n            <div class=\"feature-card\">\n              <span class=\"card-num\">Component B</span>\n              <h3>Systematic Linear Score</h3>\n              <p>Linear combination of predictors:</p>\n              <div class=\"math-card\" style=\"padding:8px; margin-top:4px;\">$\\eta = \\mathbf{w}^T \\mathbf{x} + b$</div>\n            </div>\n            <div class=\"feature-card\">\n              <span class=\"card-num\">Component C</span>\n              <h3>Link Function $g(\\mu) = \\eta$</h3>\n              <p>Transforms distribution mean $\\mu = \\mathbb{E}[Y]$ to linear space $\\eta$.</p>\n            </div>\n          </div>\n          <p style=\"margin-top:16px;\">For Bernoulli distributions, the <strong>canonical link</strong> is the logit link $g(p) = \\ln(p / (1-p))$, and its inverse link $g^{-1}(\\eta) = \\sigma(\\eta)$ is the Logistic Sigmoid. Alternative link functions include the <strong>Probit Link</strong> (inverse normal CDF $\\Phi^{-1}(p)$) and the asymmetric <strong>Complementary Log-Log (cloglog)</strong> link $\\ln(-\\ln(1 - p))$.</p>\n        "
      }
    ],
    "relatedModels": [
      {
        "name": "Logistic Regression",
        "url": "../../models/logistic_regression/index.html",
        "cat": "classification"
      },
      {
        "name": "Multilayer Perceptron",
        "url": "../../models/multilayer_perceptron_classifier/index.html",
        "cat": "classification"
      },
      {
        "name": "Support Vector Machine (Platt Scaling)",
        "url": "../../models/linear_svm_classifier/index.html",
        "cat": "classification"
      },
      {
        "name": "Elastic Net Classifier",
        "url": "../../models/elastic_net_regression/index.html",
        "cat": "regression"
      }
    ]
  },
  {
    "id": "maximum-likelihood-estimation",
    "title": "Maximum Likelihood Estimation & Bernoulli Log-Likelihood",
    "category": "Statistical Estimation & Optimization",
    "badgeClass": "green",
    "lead": "The principled statistical framework for fitting parametric models by finding parameter weights that maximize the joint probability of observing the empirical training data.",
    "kicker": "Statistical Inference • 16",
    "sections": [
      {
        "title": "The Principle of Maximum Likelihood",
        "dot": "green",
        "content": "\n          <p>Given an observed dataset $\\mathcal{D} = \\{(\\mathbf{x}_1, y_1), \\dots, (\\mathbf{x}_n, y_n)\\}$ drawn independently and identically distributed ($i.i.d.$) from a data generation process parameterized by unknown weights $\\mathbf{w}$, the <strong>Likelihood function</strong> $L(\\mathbf{w})$ quantifies the probability of observing this exact sample:</p>\n          <div class=\"math-card\">\n            $L(\\mathbf{w}) = P(\\mathcal{D}; \\mathbf{w}) = \\prod_{i=1}^n P(y_i \\mid \\mathbf{x}_i; \\mathbf{w})$\n          </div>\n          <p>The Maximum Likelihood principle seeks optimal weights $\\hat{\\mathbf{w}}_{\\text{MLE}}$ that make the empirical data most plausible:</p>\n          <div class=\"math-card\">\n            $\\hat{\\mathbf{w}}_{\\text{MLE}} = \\arg\\max_{\\mathbf{w}} L(\\mathbf{w})$\n          </div>\n          <div class=\"callout cyan\">\n            <span class=\"callout-title\">Why the Log-Likelihood Transformation is Mandatory</span>\n            <p>Multiplying thousands of probabilities $p_i \\in (0, 1)$ precipitates severe numerical arithmetic underflow ($p_1 \\times p_2 \\dots < 10^{-308} \\to 0$). Since the natural logarithm is strictly monotonically increasing, $\\arg\\max L(\\mathbf{w}) \\equiv \\arg\\max \\ln L(\\mathbf{w})$. Taking the logarithm converts product chains into numerically stable summations:</p>\n            <div class=\"math-card\">\n              $\\ell(\\mathbf{w}) = \\ln L(\\mathbf{w}) = \\sum_{i=1}^n \\ln P(y_i \\mid \\mathbf{x}_i; \\mathbf{w})$\n            </div>\n          </div>\n        "
      },
      {
        "title": "Derivation of Bernoulli Log-Likelihood & Binary Cross-Entropy",
        "dot": "violet",
        "content": "\n          <p>In binary classification with labels $y_i \\in \\{0, 1\\}$, each observation is a Bernoulli trial with success probability $p_i = \\sigma(\\mathbf{w}^T \\mathbf{x}_i)$. The unified Probability Mass Function (PMF) is:</p>\n          <div class=\"math-card\">\n            $P(Y = y_i \\mid \\mathbf{x}_i) = p_i^{y_i} (1 - p_i)^{1 - y_i}$\n          </div>\n          <p>Under the $i.i.d.$ assumption, the joint likelihood is:</p>\n          <div class=\"math-card\">\n            $L(\\mathbf{w}) = \\prod_{i=1}^n p_i^{y_i} (1 - p_i)^{1 - y_i}$\n          </div>\n          <p>Taking the natural logarithm yields the <strong>Bernoulli Log-Likelihood</strong>:</p>\n          <div class=\"math-card\">\n            $\\ell(\\mathbf{w}) = \\sum_{i=1}^n \\left[ y_i \\ln(p_i) + (1 - y_i) \\ln(1 - p_i) \\right]$\n          </div>\n          <div class=\"callout green\" style=\"margin-top:14px;\">\n            <span class=\"callout-title\">The Exact Identity with Binary Cross-Entropy (BCE)</span>\n            <p>In machine learning, algorithms minimize loss rather than maximizing likelihood. Multiplying by $-\\frac{1}{n}$ defines the empirical cost function:</p>\n            <div class=\"math-card\">\n              $J(\\mathbf{w}) = -\\frac{1}{n}\\ell(\\mathbf{w}) = -\\frac{1}{n}\\sum_{i=1}^n \\left[ y_i \\ln(p_i) + (1 - y_i) \\ln(1 - p_i) \\right] = \\mathcal{L}_{\\text{BCE}}(\\mathbf{w})$\n            </div>\n            <p>Maximizing Bernoulli log-likelihood is mathematically and computationally equivalent to minimizing Binary Cross-Entropy loss.</p>\n          </div>\n        "
      },
      {
        "title": "Score Function, Hessian Matrix & Strict Concavity",
        "dot": "cyan",
        "content": "\n          <p>Applying the chain rule $\\frac{\\partial \\ell}{\\partial w_j} = \\sum_{i=1}^n \\frac{\\partial \\ell}{\\partial p_i} \\frac{\\partial p_i}{\\partial z_i} \\frac{\\partial z_i}{\\partial w_j}$ yields the <strong>Score Vector (Gradient)</strong>:</p>\n          <div class=\"math-card\">\n            $\\nabla_{\\mathbf{w}} \\ell(\\mathbf{w}) = \\sum_{i=1}^n (y_i - p_i) \\mathbf{x}_i = \\mathbf{X}^T (\\mathbf{y} - \\mathbf{p})$\n          </div>\n          <p>Notice the exact structural parallel to Ordinary Least Squares (OLS) normal equations $\\mathbf{X}^T (\\mathbf{y} - \\hat{\\mathbf{y}})$!</p>\n          <p>Differentiating a second time yields the <strong>Hessian Matrix</strong>:</p>\n          <div class=\"math-card\">\n            $\\mathbf{H} = \\nabla_{\\mathbf{w}}^2 \\ell(\\mathbf{w}) = -\\sum_{i=1}^n p_i(1 - p_i) \\mathbf{x}_i \\mathbf{x}_i^T = -\\mathbf{X}^T \\mathbf{W} \\mathbf{X}$\n          </div>\n          <p>where $\\mathbf{W} = \\text{diag}(p_i(1 - p_i))$ is a diagonal weighting matrix with strictly positive diagonal elements $p_i(1 - p_i) > 0$.</p>\n          <div class=\"callout violet\" style=\"margin-top:14px;\">\n            <span class=\"callout-title\">Guarantee of Unique Global Optimum</span>\n            <p>For any non-zero vector $\\mathbf{v} \\in \\mathbb{R}^p$, $\\mathbf{v}^T \\mathbf{H} \\mathbf{v} = -(\\mathbf{X} \\mathbf{v})^T \\mathbf{W} (\\mathbf{X} \\mathbf{v}) \\le 0$. Hence, $\\mathbf{H}$ is <strong>negative semi-definite everywhere</strong>. The Bernoulli log-likelihood surface is strictly concave with <strong>zero local minima or saddle points</strong>: every stationary point $\\nabla \\ell = \\mathbf{0}$ is the unique global maximum!</p>\n          </div>\n        "
      }
    ],
    "relatedModels": [
      {
        "name": "Logistic Regression",
        "url": "../../models/logistic_regression/index.html",
        "cat": "classification"
      },
      {
        "name": "Ordinary Least Squares (OLS)",
        "url": "../../models/ols_linear_regression/index.html",
        "cat": "regression"
      },
      {
        "name": "Gaussian Naive Bayes",
        "url": "../../models/gaussian_naive_bayes/index.html",
        "cat": "classification"
      },
      {
        "name": "Linear Discriminant Analysis",
        "url": "../../models/linear_discriminant_analysis/index.html",
        "cat": "classification"
      }
    ]
  },
  {
    "id": "quasi-newton-and-lbfgs",
    "title": "Quasi-Newton Optimization & L-BFGS",
    "category": "Second-Order Optimization & Solvers",
    "badgeClass": "amber",
    "lead": "Scaling Newton-Raphson curvature acceleration to high-dimensional datasets by approximating the inverse Hessian through limited-memory gradient displacements.",
    "kicker": "Numerical Solvers • 17",
    "sections": [
      {
        "title": "First-Order vs. Second-Order Optimization",
        "dot": "amber",
        "content": "\n          <p>Optimization algorithms balance convergence speed against computational cost per step:</p>\n          <div class=\"card-grid-2\">\n            <div class=\"feature-card\">\n              <span class=\"card-num\">First-Order / Gradient Descent</span>\n              <h3>$\\boldsymbol{\\theta}_{k+1} = \\boldsymbol{\\theta}_k - \\alpha \\nabla f(\\boldsymbol{\\theta}_k)$</h3>\n              <p>Relies strictly on first derivatives (steepest descent). In ill-conditioned ravines (anisotropic curvature), the gradient points almost perpendicularly to the optimal basin, causing violent oscillations and glacial progress.</p>\n              <div class=\"math-card\" style=\"padding:8px; margin-top:8px;\">$\\text{Complexity: } O(p) \\text{ time, } O(p) \\text{ memory}$</div>\n            </div>\n            <div class=\"feature-card\">\n              <span class=\"card-num\">Second-Order / Newton-Raphson</span>\n              <h3>$\\boldsymbol{\\theta}_{k+1} = \\boldsymbol{\\theta}_k - \\mathbf{H}_k^{-1} \\nabla f(\\boldsymbol{\\theta}_k)$</h3>\n              <p>Incorporates local curvature via the Hessian $\\mathbf{H}_k = \\nabla^2 f$. Steps directly target the center of the quadratic osculating bowl, exhibiting quadratic convergence (doubling accurate digits each step).</p>\n              <div class=\"math-card\" style=\"padding:8px; margin-top:8px;\">$\\text{Complexity: } O(p^3) \\text{ time, } O(p^2) \\text{ memory}$</div>\n            </div>\n          </div>\n          <div class=\"callout violet\" style=\"margin-top:16px;\">\n            <span class=\"callout-title\">The Computational Roadblock</span>\n            <p>For modern datasets with $p = 10,000$ features, storing $\\mathbf{H} \\in \\mathbb{R}^{p \\times p}$ demands $10^8$ floats ($400\\text{ MB}$), and computing $\\mathbf{H}^{-1}$ via Gaussian elimination requires $O(p^3) = 10^{12}$ floating-point operations <em>every single iteration</em>. Full Newton is completely intractable for high-dimensional models.</p>\n          </div>\n        "
      },
      {
        "title": "The Quasi-Newton Paradigm & The Secant Condition",
        "dot": "cyan",
        "content": "\n          <p>Quasi-Newton methods eliminate both the computation and inversion of the Hessian. Instead, they build an iterative approximation $\\mathbf{B}_k \\approx \\mathbf{H}_k$ (or directly $\\mathbf{H}_k \\approx \\mathbf{B}_k^{-1}$) utilizing only changes in parameter positions $\\mathbf{s}_k$ and gradient differences $\\mathbf{y}_k$:</p>\n          <div class=\"math-card\">\n            $\\mathbf{s}_k = \\boldsymbol{\\theta}_{k+1} - \\boldsymbol{\\theta}_k, \\qquad \\mathbf{y}_k = \\nabla f(\\boldsymbol{\\theta}_{k+1}) - \\nabla f(\\boldsymbol{\\theta}_k)$\n          </div>\n          <p>The core mathematical requirement is the <strong>Secant Equation</strong>:</p>\n          <div class=\"math-card\">\n            $\\mathbf{H}_{k+1} \\mathbf{y}_k = \\mathbf{s}_k$\n          </div>\n          <p><strong>The BFGS Update Formula</strong> (Broyden-Fletcher-Goldfarb-Shanno, 1970) provides the rank-2 update preserving positive definiteness and symmetry:</p>\n          <div class=\"math-card\">\n            $\\mathbf{H}_{k+1} = (\\mathbf{I} - \\rho_k \\mathbf{s}_k \\mathbf{y}_k^T) \\mathbf{H}_k (\\mathbf{I} - \\rho_k \\mathbf{y}_k \\mathbf{s}_k^T) + \\rho_k \\mathbf{s}_k \\mathbf{s}_k^T, \\quad \\rho_k = \\frac{1}{\\mathbf{y}_k^T \\mathbf{s}_k}$\n          </div>\n        "
      },
      {
        "title": "L-BFGS & Two-Loop Recursion: The Industry Standard",
        "dot": "green",
        "content": "\n          <p>While BFGS eliminates the $O(p^3)$ inversion, storing the dense $p \\times p$ matrix $\\mathbf{H}_k$ still consumes prohibitive $O(p^2)$ memory. <strong>Limited-Memory BFGS (L-BFGS)</strong> (Nocedal, 1980) completely discards the matrix $\\mathbf{H}_k$!</p>\n          <div class=\"callout green\">\n            <span class=\"callout-title\">The Limited-Memory History Buffer</span>\n            <p>Instead of maintaining a full matrix, L-BFGS retains only the $m$ most recent displacement pairs:</p>\n            <div class=\"math-card\">\n              $\\{(\\mathbf{s}_i, \\mathbf{y}_i)\\}_{i=k-m}^{k-1}, \\quad m \\in [5, 20]$\n            </div>\n            <p>Using the legendary <strong>Two-Loop Recursion algorithm</strong>, L-BFGS computes the exact descent direction $\\mathbf{d}_k = -\\mathbf{H}_k \\mathbf{g}_k$ using only $4mp$ operations and $2mp$ memory storage!</p>\n          </div>\n          <div class=\"table-wrap\" style=\"margin-top:14px;\">\n            <table class=\"concept-table\">\n              <thead>\n                <tr>\n                  <th>Algorithm</th>\n                  <th>Iteration Complexity</th>\n                  <th>Memory Footprint</th>\n                  <th>Convergence Rate</th>\n                  <th>Role in Scikit-Learn</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr>\n                  <td class=\"highlight\">Gradient Descent (SGD)</td>\n                  <td class=\"code-val\">$O(p)$</td>\n                  <td class=\"code-val\">$O(p)$</td>\n                  <td>Linear (Slow in ravines)</td>\n                  <td>Deep learning, online streaming data</td>\n                </tr>\n                <tr>\n                  <td class=\"highlight\">Newton-Raphson</td>\n                  <td class=\"code-val\">$O(p^3)$</td>\n                  <td class=\"code-val\">$O(p^2)$</td>\n                  <td>Quadratic (Extremely fast)</td>\n                  <td>Small GLMs with few features ($p < 500$)</td>\n                </tr>\n                <tr>\n                  <td class=\"highlight\">BFGS</td>\n                  <td class=\"code-val\">$O(p^2)$</td>\n                  <td class=\"code-val\">$O(p^2)$</td>\n                  <td>Superlinear</td>\n                  <td>Medium problems ($p < 2,000$)</td>\n                </tr>\n                <tr>\n                  <td class=\"highlight\">L-BFGS</td>\n                  <td class=\"code-val\">$O(mp)$</td>\n                  <td class=\"code-val\">$O(mp)$</td>\n                  <td>Superlinear</td>\n                  <td><strong>Default gold-standard solver for Logistic Regression & MLP</strong></td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        "
      }
    ],
    "relatedModels": [
      {
        "name": "Logistic Regression",
        "url": "../../models/logistic_regression/index.html",
        "cat": "classification"
      },
      {
        "name": "Multilayer Perceptron (MLP)",
        "url": "../../models/multilayer_perceptron_classifier/index.html",
        "cat": "classification"
      },
      {
        "name": "Ridge Regression",
        "url": "../../models/ridge_regression/index.html",
        "cat": "regression"
      },
      {
        "name": "Elastic Net Regression",
        "url": "../../models/elastic_net_regression/index.html",
        "cat": "regression"
      }
    ]
  }
];

// Helper to build conceptual architecture block diagrams
function getConceptDiagram(id) {
  if (id === 'log-odds') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">Log-Odds Coordinate Transformation: From Bounded Interval to Real Line</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node">
            <span class="pipeline-badge">Bounded Unit Interval</span>
            <h4>Probability p</h4>
            <p>Constrained likelihood.</p>
            <span class="tensor-shape">$p \in [0, 1]$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--cyan);">
            <span class="pipeline-badge" style="color:var(--cyan-2);">Ratio of Outcomes</span>
            <h4>Odds Ratio</h4>
            <p>Success relative to failure.</p>
            <span class="tensor-shape">$\frac{p}{1-p} \in [0, +\infty)$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--violet);">
            <span class="pipeline-badge" style="color:var(--violet-2);">Logarithmic Mapping</span>
            <h4>Log-Odds (Logit)</h4>
            <p>Natural log mapping.</p>
            <span class="tensor-shape">$\ln\left(\frac{p}{1-p}\right) \in \mathbb{R}$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--green);">
            <span class="pipeline-badge" style="color:var(--green-2);">Linear Modeling</span>
            <h4>Hyperplane Predictor</h4>
            <p>Unconstrained inner product.</p>
            <span class="tensor-shape">$\mathbf{w}^T \mathbf{x} + b$</span>
          </div>
        </div>
      </div>
    `;
  }
  if (id === 'sigmoid-and-link-functions') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">Generalized Linear Model (GLM) Canonical Activation Pathway</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node">
            <span class="pipeline-badge">Input Predictors</span>
            <h4>Features & Weights</h4>
            <p>Dot product summation.</p>
            <span class="tensor-shape">$z = \mathbf{w}^T \mathbf{x} + b$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--cyan);">
            <span class="pipeline-badge" style="color:var(--cyan-2);">Inverse Link Function</span>
            <h4>Logistic Sigmoid &sigma;(z)</h4>
            <p>Non-linear saturation curve.</p>
            <span class="tensor-shape">$\sigma(z) = \frac{1}{1 + e^{-z}}$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--violet);">
            <span class="pipeline-badge" style="color:var(--violet-2);">Posterior Probability</span>
            <h4>Calibrated Mean &mu;</h4>
            <p>Expectation $\mathbb{E}[Y|X]$.</p>
            <span class="tensor-shape">$P(Y=1|X) \in [0, 1]$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--amber);">
            <span class="pipeline-badge" style="color:var(--amber-2);">Decision Rule</span>
            <h4>Binary Classification</h4>
            <p>Threshold cutoff $\tau=0.5$.</p>
            <span class="tensor-shape">$\hat{y} = \mathbb{I}(\sigma(z) \ge 0.5)$</span>
          </div>
        </div>
      </div>
    `;
  }
  if (id === 'maximum-likelihood-estimation') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">Maximum Likelihood Optimization Pipeline: From Samples to Global Maximum</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node">
            <span class="pipeline-badge">Empirical Data</span>
            <h4>i.i.d. Samples</h4>
            <p>Observations & labels.</p>
            <span class="tensor-shape">$\{(\mathbf{x}_i, y_i)\}_{i=1}^n$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--green);">
            <span class="pipeline-badge" style="color:var(--green-2);">Joint Likelihood</span>
            <h4>Bernoulli Product</h4>
            <p>Joint sample probability.</p>
            <span class="tensor-shape">$\prod p_i^{y_i} (1-p_i)^{1-y_i}$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--violet);">
            <span class="pipeline-badge" style="color:var(--violet-2);">Log Transformation</span>
            <h4>Log-Likelihood &ell;(w)</h4>
            <p>Numerically stable sum.</p>
            <span class="tensor-shape">$\sum [y_i \ln p_i + (1-y_i)\ln(1-p_i)]$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--cyan);">
            <span class="pipeline-badge" style="color:var(--cyan-2);">Convex Solver</span>
            <h4>Newton / L-BFGS</h4>
            <p>Score $\mathbf{X}^T(\mathbf{y}-\mathbf{p}) = \mathbf{0}$.</p>
            <span class="tensor-shape">$\hat{\mathbf{w}}_{\text{MLE}} = \arg\max \ell(\mathbf{w})$</span>
          </div>
        </div>
      </div>
    `;
  }
  if (id === 'quasi-newton-and-lbfgs') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">Optimization Hierarchy: First-Order vs Full Newton vs L-BFGS</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node">
            <span class="pipeline-badge">First-Order</span>
            <h4>Gradient Descent</h4>
            <p>Steepest gradient only.</p>
            <span class="tensor-shape">$O(p) \text{ ops} \;\cdot\; \text{Oscillates}$</span>
          </div>
          <div class="pipeline-arrow">vs</div>
          <div class="pipeline-node" style="border-color:var(--amber);">
            <span class="pipeline-badge" style="color:var(--amber-2);">Full Second-Order</span>
            <h4>Newton-Raphson</h4>
            <p>Exact Hessian inversion.</p>
            <span class="tensor-shape">$O(p^3) \text{ ops} \;\cdot\; \text{Memory heavy}$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--green);">
            <span class="pipeline-badge" style="color:var(--green-2);">Quasi-Newton</span>
            <h4>BFGS Secant</h4>
            <p>Rank-2 curvature update.</p>
            <span class="tensor-shape">$O(p^2) \text{ ops} \;\cdot\; \text{No inversion}$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--violet);">
            <span class="pipeline-badge" style="color:var(--violet-2);">Industry Benchmark</span>
            <h4>L-BFGS (Two-Loop)</h4>
            <p>History buffer $m \in [5, 20]$.</p>
            <span class="tensor-shape">$O(mp) \text{ ops} \;\cdot\; \text{Optimal}$</span>
          </div>
        </div>
      </div>
    `;
  }
  if (id === 'confusion-matrix') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">Diagnostic Decision Pipeline: From Probabilities to Error Quadrants</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node">
            <span class="pipeline-badge">Input</span>
            <h4>Continuous Logits z</h4>
            <p>Raw model output score.</p>
            <span class="tensor-shape">$z = \\mathbf{w}^T \\mathbf{x} + b$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node">
            <span class="pipeline-badge">Probability</span>
            <h4>Sigmoid Link &sigma;(z)</h4>
            <p>Mapped to unit interval [0, 1].</p>
            <span class="tensor-shape">$p \\in [0, 1]$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--amber);">
            <span class="pipeline-badge" style="color:var(--amber);">Decision Boundary</span>
            <h4>Cutoff Threshold &tau;</h4>
            <p>Separates positive vs negative.</p>
            <span class="tensor-shape">$\\tau = 0.50$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--violet);">
            <span class="pipeline-badge" style="color:var(--violet-2);">Diagnostic Grid</span>
            <h4>Confusion Matrix</h4>
            <p>Maps True Labels vs Preds.</p>
            <span class="tensor-shape">2 &times; 2 Grid</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node">
            <span class="pipeline-badge">Derived Rates</span>
            <h4>Metric Calculus</h4>
            <p>Precision, Recall, F1-Score.</p>
            <span class="tensor-shape">$\\text{F1} = \\frac{2PR}{P + R}$</span>
          </div>
        </div>
      </div>
    `;
  }
  if (id === 'loss-functions') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">Loss Function Taxonomy & Optimization Dynamics</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node">
            <span class="pipeline-badge">Residual</span>
            <h4>Prediction Error e</h4>
            <p>Distance between hypothesis & truth.</p>
            <span class="tensor-shape">$e_i = y_i - \\hat{y}_i$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--cyan);">
            <span class="pipeline-badge" style="color:var(--cyan);">Continuous</span>
            <h4>Regression Losses</h4>
            <p>MSE (L2), MAE (L1), Huber (&delta;).</p>
            <span class="tensor-shape">$\\mathcal{L}_{\\text{MSE}} = \\frac{1}{2} e^2$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--violet);">
            <span class="pipeline-badge" style="color:var(--violet-2);">Discrete</span>
            <h4>Classification Losses</h4>
            <p>Binary Log-loss, Hinge, Softmax.</p>
            <span class="tensor-shape">$\\mathcal{L}_{\\text{BCE}} = -y \\ln p$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node">
            <span class="pipeline-badge">Aggregate</span>
            <h4>Cost Function J(&theta;)</h4>
            <p>Empirical risk + Regularizer.</p>
            <span class="tensor-shape">$J = \\frac{1}{n}\\sum \\mathcal{L} + \\lambda \\Omega$</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node">
            <span class="pipeline-badge">Optimization</span>
            <h4>Gradient Descent</h4>
            <p>Backpropagation parameter update.</p>
            <span class="tensor-shape">$\\theta \\leftarrow \\theta - \\eta \\nabla J$</span>
          </div>
        </div>
      </div>
    `;
  }
  if (id === 'feature-selection') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">Feature Selection Taxonomy: Filter vs. Wrapper vs. Embedded</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node">
            <span class="pipeline-badge">Input</span>
            <h4>Raw Features X</h4>
            <p>High-dimensional candidate predictors.</p>
            <span class="tensor-shape">p features</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--cyan);">
            <span class="pipeline-badge" style="color:var(--cyan);">1. Filter Methods</span>
            <h4>Statistical Scoring</h4>
            <p>VIF, Pearson r, Mutual Information.</p>
            <span class="tensor-shape">Independent of model</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--amber);">
            <span class="pipeline-badge" style="color:var(--amber);">2. Wrapper Methods</span>
            <h4>Iterative Search</h4>
            <p>Recursive Feature Elimination (RFE).</p>
            <span class="tensor-shape">Greedy subset search</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--violet);">
            <span class="pipeline-badge" style="color:var(--violet-2);">3. Embedded</span>
            <h4>Intrinsic Selection</h4>
            <p>Lasso L1 Sparsity, Tree Gain.</p>
            <span class="tensor-shape">Trained during fit</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node">
            <span class="pipeline-badge">Output</span>
            <h4>Optimal Subset k</h4>
            <p>Minimal collinearity, max signal.</p>
            <span class="tensor-shape">$k \\ll p \\text{ (VIF } < 5.0)$</span>
          </div>
        </div>
      </div>
    `;
  }
  if (id === 'bias-variance-tradeoff') {
    return `
      <div class="pipeline-box">
        <span class="canvas-tag">The Bias-Variance Continuum & Error Decomposition</span>
        <div class="pipeline-diagram">
          <div class="pipeline-node" style="border-color:var(--cyan);">
            <span class="pipeline-badge" style="color:var(--cyan);">Underfitting</span>
            <h4>High Bias ($d = 1$)</h4>
            <p>Oversimplified linear hypothesis.</p>
            <span class="tensor-shape">High Train & Test Error</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--green);">
            <span class="pipeline-badge" style="color:var(--green);">Optimal Balance</span>
            <h4>Sweet Spot ($d = 3$)</h4>
            <p>Captures true latent data manifold.</p>
            <span class="tensor-shape">Minimal Expected Risk</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node" style="border-color:var(--red);">
            <span class="pipeline-badge" style="color:var(--red);">Overfitting</span>
            <h4>High Variance ($d \\ge 9$)</h4>
            <p>Memorizes noise & spurious variance.</p>
            <span class="tensor-shape">Low Train, Explosive Test</span>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-node">
            <span class="pipeline-badge">Remediation</span>
            <h4>Regularization & CV</h4>
            <p>L2/L1 penalties, Cross-Validation.</p>
            <span class="tensor-shape">Shrinks parameter norm</span>
          </div>
        </div>
      </div>
    `;
  }
  // Universal Architecture Block Diagram
  return `
    <div class="pipeline-box">
      <span class="canvas-tag">Conceptual Architecture & Operational Lifecycle</span>
      <div class="pipeline-diagram">
        <div class="pipeline-node">
          <span class="pipeline-badge">Phase 01</span>
          <h4>Mathematical Definition</h4>
          <p>Analytical formulation & core theory.</p>
          <span class="tensor-shape">Foundational Axioms</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node" style="border-color:var(--cyan);">
          <span class="pipeline-badge" style="color:var(--cyan);">Phase 02</span>
          <h4>Geometric Intuition</h4>
          <p>Loss surfaces, hyperplanes & metrics.</p>
          <span class="tensor-shape">Euclidean Manifolds</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node" style="border-color:var(--violet);">
          <span class="pipeline-badge" style="color:var(--violet-2);">Phase 03</span>
          <h4>Algorithmic Execution</h4>
          <p>Optimization, thresholding & diagnostics.</p>
          <span class="tensor-shape">Empirical Convergence</span>
        </div>
        <div class="pipeline-arrow">&rarr;</div>
        <div class="pipeline-node">
          <span class="pipeline-badge">Phase 04</span>
          <h4>Production Diagnostics</h4>
          <p>Validation metrics & failure prevention.</p>
          <span class="tensor-shape">Generalization Audit</span>
        </div>
      </div>
    </div>
  `;
}

// 1. Generate each concept page
for (const c of concepts) {
  const dirPath = path.join(conceptsDir, c.id);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const sectionsHtml = c.sections.map((s, idx) => `
    <section class="concept-section">
      <h2 class="section-title">
        <span class="section-dot ${s.dot}"></span> ${idx + 1}. ${s.title}
      </h2>
      <div class="concept-body">
        ${s.content}
      </div>
    </section>
  `).join('\n');

  const relatedHtml = c.relatedModels.map(m => `
    <a href="${m.url}" class="model-badge ${m.cat}">
      <span class="dot"></span> ${m.name}
    </a>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${c.title} · Learn ML · Yogesh Awate</title>
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
  <link rel="stylesheet" href="../../visual-components.css">
  <link rel="stylesheet" href="../../concept.css">
</head>
<body>
  <!-- Fixed Navigation -->
  <nav id="nav">
    <div class="nav-left">
      <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
      <div class="nav-breadcrumbs">
        <a href="../../index.html#learn">Learn</a>
        <span class="sep">/</span>
        <a href="../../index.html#learn-concepts">Concepts</a>
        <span class="sep">/</span>
        <span>${c.title}</span>
      </div>
    </div>
    <div class="nav-right">
      <a href="../../index.html#learn-models" class="nav-pill">47 Models</a>
      <a href="../../index.html#learn" class="nav-pill">&larr; Back to Learn</a>
    </div>
  </nav>

  <main class="concept-content">
    <header class="concept-header">
      <div class="concept-kicker">${c.kicker}</div>
      <h1>${c.title}</h1>
      <p class="concept-lead">${c.lead}</p>
    </header>

    ${getConceptDiagram(c.id)}

    ${c.id === 'confusion-matrix' ? '<div id="lab-confusion-matrix"></div>' : ''}
    ${c.id === 'loss-functions' ? '<div id="lab-loss-functions"></div>' : ''}
    ${c.id === 'bias-variance-tradeoff' ? '<div id="lab-bias-variance"></div>' : ''}
    ${c.id === 'feature-selection' ? '<div id="lab-feature-selection"></div>' : ''}
    ${c.id === 'log-odds' ? '<div id="lab-log-odds"></div>' : ''}
    ${c.id === 'sigmoid-and-link-functions' ? '<div id="lab-sigmoid"></div>' : ''}
    ${c.id === 'maximum-likelihood-estimation' ? '<div id="lab-mle-bernoulli"></div>' : ''}
    ${c.id === 'quasi-newton-and-lbfgs' ? '<div id="lab-optimization-solvers"></div>' : ''}

${sectionsHtml}

    <!-- Related Model Implementations in Zoo -->
    <section class="linked-models-wrap">
      <h3>Architectures Using This Concept in the Zoo</h3>
      <div class="model-badges">
        ${relatedHtml}
      </div>
    </section>
  </main>

  <footer>
    <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
    <div>
      <a href="../../index.html#learn-concepts">All 17 Concepts</a> &bull;
      <a href="../../index.html#learn">Back to Learn Hub</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>

  <script src="../../visual-simulators.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      if (window.MLVisualLabs) {
        if ('${c.id}' === 'confusion-matrix') window.MLVisualLabs.initConfusionMatrixLab('lab-confusion-matrix');
        if ('${c.id}' === 'loss-functions') window.MLVisualLabs.initLossFunctionsLab('lab-loss-functions');
        if ('${c.id}' === 'bias-variance-tradeoff') window.MLVisualLabs.initBiasVarianceLab('lab-bias-variance');
        if ('${c.id}' === 'feature-selection') window.MLVisualLabs.initFeatureSelectionLab('lab-feature-selection');
        if ('${c.id}' === 'log-odds') window.MLVisualLabs.initLogOddsLab('lab-log-odds');
        if ('${c.id}' === 'sigmoid-and-link-functions') window.MLVisualLabs.initSigmoidLab('lab-sigmoid');
        if ('${c.id}' === 'maximum-likelihood-estimation') window.MLVisualLabs.initMleBernoulliLab('lab-mle-bernoulli');
        if ('${c.id}' === 'quasi-newton-and-lbfgs') window.MLVisualLabs.initOptimizationSolversLab('lab-optimization-solvers');
      }
    });
  </script>
</body>
</html>
`;

  fs.writeFileSync(path.join(dirPath, 'index.html'), html);
  console.log(`Generated concept page: concepts/${c.id}/index.html`);
}

// 2. Generate Master Concepts Hub page (concepts/index.html)
const conceptsCardsHtml = concepts.map(c => `
  <a href="${c.id}/index.html" class="feature-card spot reveal">
    <span class="card-num">${c.category}</span>
    <h3>${c.title}</h3>
    <p>${c.lead}</p>
    <div style="margin-top:auto; padding-top:14px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center;">
      <span style="font:500 11.5px var(--mono); color:var(--violet-2);">${c.relatedModels.length} Linked Models</span>
      <span style="font-size:14px; color:var(--soft);">&rarr;</span>
    </div>
  </a>
`).join('\n');

const hubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Machine Learning Concepts Hub · 17 Deep Dives · Yogesh Awate</title>
  <meta name="theme-color" content="#070709">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
</head>
<body class="page-concepts">
  <nav id="nav">
    <div class="brand-wrap">
      <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
      <span class="brand-divider">/</span>
      <a href="../index.html#learn" class="brand-sub">Learn</a>
      <span class="brand-divider">/</span>
      <span class="brand-sub">Concepts Hub</span>
    </div>
    <div class="navlinks" id="navlinks">
      <a href="../index.html#learn-models">Models (47)</a>
      <a href="#hub" class="active">Concepts (17)</a>
      <a href="https://yogesh660.github.io/work/">Work</a>
      <a href="https://github.com/yogesh660" target="_blank" rel="noopener" class="pill">GitHub</a>
    </div>
  </nav>

  <header class="section" style="padding-top:120px; padding-bottom:30px;">
    <div class="head">
      <div>
        <span class="tag">Knowledge Graph & Theory</span>
        <h2>17 Essential ML Concepts.</h2>
      </div>
      <p>A structured compendium of evaluation metrics, optimization theory, feature selection mechanisms, and diagnostic criteria interconnecting all 47 architectures.</p>
    </div>
  </header>

  <main class="section tight" id="hub">
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
      ${conceptsCardsHtml}
    </div>
  </main>

  <footer>
    <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
    <div class="footlinks">
      <a href="../index.html#learn">Back to Learn Hub</a> &bull;
      <a href="https://yogesh660.github.io/about/">About</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>
</body>
</html>
`;

fs.writeFileSync(path.join(conceptsDir, 'index.html'), hubHtml);
console.log('Generated master concepts hub: concepts/index.html');
