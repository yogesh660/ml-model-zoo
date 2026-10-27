const fs = require('fs');
const path = require('path');

const conceptsDir = path.join(__dirname, 'concepts');
if (!fs.existsSync(conceptsDir)) {
  fs.mkdirSync(conceptsDir, { recursive: true });
}

// Concept definitions
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
              <code>J(\\theta) = \\frac{1}{n} \\sum_{i=1}^n \\mathcal{L}(\\hat{y}^{(i)}, y^{(i)}) + \\lambda \\Omega(\\theta)</code>
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
                  <td class="code-val">\\frac{1}{2}(y - \\hat{y})^2</td>
                  <td class="code-val">-(y - \\hat{y})</td>
                  <td>Low (errors grow quadratically)</td>
                  <td>OLS, Ridge, Polynomial Regression, Gaussian Process</td>
                </tr>
                <tr>
                  <td class="highlight">Mean Absolute Error (MAE / L1)</td>
                  <td class="code-val">|y - \\hat{y}|</td>
                  <td class="code-val">-\\text{sgn}(y - \\hat{y})</td>
                  <td>High (linear penalty on residuals)</td>
                  <td>Median regression, financial datasets with heavy tails</td>
                </tr>
                <tr>
                  <td class="highlight">Huber Loss (Smooth L1)</td>
                  <td class="code-val">\\begin{cases} \\frac{1}{2}e^2 & |e| \\le \\delta \\\\ \\delta(|e| - \\frac{1}{2}\\delta) & \\text{otherwise} \\end{cases}</td>
                  <td class="code-val">\\begin{cases} -e & |e| \\le \\delta \\\\ -\\delta\\text{sgn}(e) & \\text{otherwise} \\end{cases}</td>
                  <td>Optimal (quadratic for small errors, linear for anomalies)</td>
                  <td>Robust Regression, Gradient Boosting, Object Detection</td>
                </tr>
                <tr>
                  <td class="highlight">Epsilon-Insensitive Loss</td>
                  <td class="code-val">\\max(0, |y - \\hat{y}| - \\epsilon)</td>
                  <td class="code-val">0 \\text{ if } |e| \\le \\epsilon, \\text{ else } -\\text{sgn}(e)</td>
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
                  <td class="code-val">\\frac{TP + TN}{TP + TN + FP + FN}</td>
                  <td>What fraction of all predictions were correct?</td>
                  <td>Misleading on imbalanced datasets (e.g. 99% accuracy on 1% rare fraud).</td>
                </tr>
                <tr>
                  <td class="highlight">Precision (Positive Predictive Value)</td>
                  <td class="code-val">\\frac{TP}{TP + FP}</td>
                  <td>When the model claims Positive, how often is it right?</td>
                  <td>Critical when False Positives are expensive (spam filters, hiring candidate shortlisting).</td>
                </tr>
                <tr>
                  <td class="highlight">Recall (Sensitivity / True Positive Rate)</td>
                  <td class="code-val">\\frac{TP}{TP + FN}</td>
                  <td>What percentage of actual Positives did the model catch?</td>
                  <td>Crucial when False Negatives are catastrophic (cancer screening, defect detection, fraud).</td>
                </tr>
                <tr>
                  <td class="highlight">Specificity (True Negative Rate)</td>
                  <td class="code-val">\\frac{TN}{TN + FP}</td>
                  <td>What percentage of actual Negatives were correctly identified?</td>
                  <td>Evaluates the model's resistance to false alarms.</td>
                </tr>
                <tr>
                  <td class="highlight">F1-Score</td>
                  <td class="code-val">2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}</td>
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
            <p>However, its Recall is <strong>0.0%</strong>: it catches zero fraud cases, rendering it useless in practice. The Confusion Matrix immediately exposes this catastrophic failure by displaying $TP=0$ and $FN=20$.</p>
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
              $$F_1 = \\frac{2}{\\frac{1}{\\text{Precision}} + \\frac{1}{\\text{Recall}}} = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}} = \\frac{2 \\cdot TP}{2 \\cdot TP + FP + FN}$$
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
            $$\\text{TPR}(\\tau) = \\frac{TP(\\tau)}{TP(\\tau) + FN(\\tau)}, \\quad \\text{FPR}(\\tau) = \\frac{FP(\\tau)}{FP(\\tau) + TN(\\tau)}$$
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
                  <td class="code-val">\\frac{1}{n} \\sum (y_i - \\hat{y}_i)^2</td>
                  <td>$\\text{Unit}^2$</td>
                  <td>Extremely High</td>
                  <td>Differentiable; standard optimization loss.</td>
                </tr>
                <tr>
                  <td class="highlight">RMSE</td>
                  <td class="code-val">\\sqrt{\\frac{1}{n} \\sum (y_i - \\hat{y}_i)^2}</td>
                  <td>$\\text{Unit}$</td>
                  <td>High</td>
                  <td>Directly interpretable in target's natural units.</td>
                </tr>
                <tr>
                  <td class="highlight">MAE</td>
                  <td class="code-val">\\frac{1}{n} \\sum |y_i - \\hat{y}_i|</td>
                  <td>$\\text{Unit}$</td>
                  <td>Low / Robust</td>
                  <td>Represents expected absolute dollar/unit deviation.</td>
                </tr>
                <tr>
                  <td class="highlight">R² (Determination)</td>
                  <td class="code-val">1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2}</td>
                  <td>Unitless ($(-\\infty, 1]$)</td>
                  <td>Moderate</td>
                  <td>Proportion of variance explained by model.</td>
                </tr>
                <tr>
                  <td class="highlight">Adjusted R²</td>
                  <td class="code-val">1 - \\left( \\frac{1 - R^2}{n - p - 1} \\right)(n - 1)</td>
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
              <code>\\text{WCSS} = \\sum_{k=1}^K \\sum_{x \\in C_k} \\|x - \\mu_k\\|^2</code>
              <p>Used in the Elbow method to find inflection point where diminishing returns occur.</p>
            </div>
            <div class="feature-card">
              <span class="card-num">Metric 2 / Relative Cohesion</span>
              <h3>Silhouette Score</h3>
              <p>Measures how similar instance $i$ is to its own cluster versus the nearest neighboring cluster:</p>
              <code>s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))}</code>
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
                  <td class="code-val">\\lambda \\sum \\beta_j^2</td>
                  <td>Hypersphere / Smooth Circle</td>
                  <td>No (shrinks weights toward 0 asymptotically)</td>
                  <td>Gaussian Prior $\\beta_j \\sim \\mathcal{N}(0, \\tau^2)$</td>
                </tr>
                <tr>
                  <td class="highlight">Lasso (L1)</td>
                  <td class="code-val">\\lambda \\sum |\\beta_j|</td>
                  <td>Diamond / Polytope with sharp corners</td>
                  <td><strong>Yes</strong> (forces weights strictly to 0.0)</td>
                  <td>Laplace Prior $\\beta_j \\sim \\text{Laplace}(0, b)$</td>
                </tr>
                <tr>
                  <td class="highlight">Elastic Net</td>
                  <td class="code-val">\\lambda_1 \\|\\beta\\|_1 + \\lambda_2 \\|\\beta\\|_2^2</td>
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
                  <td class="code-val">\\frac{1}{2}(y_i - \\hat{y}_i)^2 \\quad \\text{or} \\quad -y_i \\log(p_i)</td>
                </tr>
                <tr>
                  <td class="highlight">Cost Function $J(\\theta)$</td>
                  <td>Full dataset or mini-batch</td>
                  <td>Direct mathematical objective being optimized by solver</td>
                  <td class="code-val">\\frac{1}{n} \\sum \\mathcal{L} + \\lambda \\|w\\|^2</td>
                </tr>
                <tr>
                  <td class="highlight">Error Function / Metric</td>
                  <td>Evaluation benchmark</td>
                  <td>Interpretable score for humans (often non-differentiable)</td>
                  <td class="code-val">\\text{Accuracy}, \\text{ROC-AUC}, \\text{F1-Score}, \\text{RMSE}</td>
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
  }
];

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
  <title>${c.title} · ML Concepts Hub · Yogesh Awate</title>
  <meta name="theme-color" content="#070709">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>
  <link rel="stylesheet" href="../../concept.css">
</head>
<body>
  <!-- Fixed Navigation -->
  <nav id="nav">
    <div class="nav-left">
      <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
      <div class="nav-breadcrumbs">
        <a href="../../index.html">Zoo</a>
        <span class="sep">/</span>
        <a href="../index.html">Concepts</a>
        <span class="sep">/</span>
        <span>${c.title}</span>
      </div>
    </div>
    <div class="nav-right">
      <a href="../index.html" class="nav-pill">All 13 Concepts</a>
      <a href="../../index.html" class="nav-pill">&larr; Model Zoo</a>
    </div>
  </nav>

  <main class="concept-content">
    <header class="concept-header">
      <div class="concept-kicker">${c.kicker}</div>
      <h1>${c.title}</h1>
      <p class="concept-lead">${c.lead}</p>
    </header>

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
      <a href="../index.html">All Concepts Hub</a> &bull;
      <a href="../../index.html">Model Zoo (47 Architectures)</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>
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
  <title>Machine Learning Concepts Hub · 13 Deep Dives · Yogesh Awate</title>
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
      <a href="../index.html" class="brand-sub">Model Zoo</a>
      <span class="brand-divider">/</span>
      <span class="brand-sub">Concepts Hub</span>
    </div>
    <div class="navlinks" id="navlinks">
      <a href="../index.html">Zoo Catalog (47)</a>
      <a href="#hub" class="active">Concepts</a>
      <a href="https://yogesh660.github.io/work/">Work</a>
      <a href="https://github.com/yogesh660" target="_blank" rel="noopener" class="pill">GitHub</a>
    </div>
  </nav>

  <header class="section" style="padding-top:120px; padding-bottom:30px;">
    <div class="head">
      <div>
        <span class="tag">Knowledge Graph & Theory</span>
        <h2>13 Essential ML Concepts.</h2>
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
      <a href="../index.html">Model Zoo (47)</a>
      <a href="https://yogesh660.github.io/about/">About</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>
</body>
</html>
`;

fs.writeFileSync(path.join(conceptsDir, 'index.html'), hubHtml);
console.log('Generated master concepts hub: concepts/index.html');
