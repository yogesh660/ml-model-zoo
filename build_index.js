const fs = require('fs');

const models = JSON.parse(fs.readFileSync('extracted_models.json', 'utf8'));

console.log(`Loaded ${models.length} models for building index.html`);

const regressionCount = models.filter(m => m.cat === 'regression').length;
const classificationCount = models.filter(m => m.cat === 'classification').length;
const clusteringCount = models.filter(m => m.cat === 'clustering').length;

// Concept definitions for the Learn section
const concepts = [
  {
    id: 'confusion-matrix',
    title: 'Confusion Matrix & Diagnostic Error Analysis',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '6 min read',
    modelsCount: '16',
    searchName: 'confusion matrix true positive false positive type i type ii errors accuracy paradox precision recall f1 classification',
    lead: 'The foundational diagnostic grid for classification, isolating Type I (false alarm) and Type II (miss) errors and exposing the accuracy paradox on imbalanced datasets.'
  },
  {
    id: 'loss-functions',
    title: 'Loss Functions & Optimization Landscapes',
    catGroup: 'optimization',
    catLabel: 'Optimization',
    category: 'Optimization & Loss Theory',
    readingTime: '8 min read',
    modelsCount: '47',
    searchName: 'loss function mse mae huber cross entropy log loss hinge loss optimization convex gradient',
    lead: 'Mathematical formulations and gradients for MSE, MAE, Huber, Binary Cross-Entropy (Log Loss), and Hinge Loss across continuous and discrete models.'
  },
  {
    id: 'cost-vs-loss-vs-error',
    title: 'Loss Function vs. Cost Function vs. Error Function',
    catGroup: 'theory',
    catLabel: 'Foundations',
    category: 'Optimization & Loss Theory',
    readingTime: '5 min read',
    modelsCount: '47',
    searchName: 'cost function loss function error function metric difference definition objective',
    lead: 'Demystifying the formal mathematical taxonomy: instance-level loss L, aggregate cost J(theta), and non-differentiable evaluation error metrics.'
  },
  {
    id: 'feature-selection',
    title: 'Feature Selection & VIF Collinearity Techniques',
    catGroup: 'preprocessing',
    catLabel: 'Data Science',
    category: 'Feature Engineering & Selection',
    readingTime: '9 min read',
    modelsCount: '47',
    searchName: 'feature selection variance inflation factor vif multicollinearity filter wrapper embedded rfe lasso mutual information data science',
    lead: 'Comprehensive taxonomy comparing Filter (Correlation/Mutual Info), Wrapper (RFE), and Embedded (Lasso) techniques, plus diagnosing multicollinearity via VIF.'
  },
  {
    id: 'precision-recall-f1',
    title: 'Precision, Recall, Specificity & F1-Score',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '7 min read',
    modelsCount: '16',
    searchName: 'precision recall f1 score specificity sensitivity type i type ii trade-off harmonic mean evaluation',
    lead: 'Beyond accuracy: navigating the mathematical tension between precision (soundness) and recall (completeness) with the harmonic F1-score and PR curves.'
  },
  {
    id: 'roc-auc',
    title: 'ROC Curves & Area Under the Curve (AUC)',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '7 min read',
    modelsCount: '16',
    searchName: 'roc curve receiver operating characteristic auc threshold invariant rank ordering tpr fpr diagnostics',
    lead: 'Threshold-invariant evaluation analyzing True Positive Rate vs False Positive Rate across all decision cutoffs, establishing probabilistic ranking quality.'
  },
  {
    id: 'regression-metrics',
    title: 'Regression Evaluation: MSE, RMSE, MAE, R² & Adjusted R²',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '8 min read',
    modelsCount: '21',
    searchName: 'mse rmse mae r2 adjusted r-squared regression error metrics residuals evaluation',
    lead: 'Comprehensive diagnostic guide comparing absolute vs quadratic penalties, dimensional interpretability, and the penalty mechanism of Adjusted R² against feature bloat.'
  },
  {
    id: 'clustering-metrics',
    title: 'Clustering Evaluation: Silhouette, Davies-Bouldin & Elbow',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '7 min read',
    modelsCount: '10',
    searchName: 'silhouette score davies bouldin elbow method wcss inertia clustering unsupervised validation',
    lead: 'Diagnostic methodologies for unsupervised geometry: assessing cohesion and separation without ground-truth labels using Silhouette Analysis and WCSS.'
  },
  {
    id: 'bias-variance-tradeoff',
    title: 'The Bias-Variance Decomposition & Generalization',
    catGroup: 'theory',
    catLabel: 'Foundations',
    category: 'Generalization & Validation',
    readingTime: '9 min read',
    modelsCount: '47',
    searchName: 'bias variance tradeoff overfitting underfitting generalization error decomposition noise irreducible model complexity',
    lead: 'The central dilemma of statistical learning: decomposing expected generalization error into irreducible noise, bias squared, and parameter variance.'
  },
  {
    id: 'regularization',
    title: 'Regularization Landscapes: L1 Lasso, L2 Ridge & Elastic Net',
    catGroup: 'theory',
    catLabel: 'Foundations',
    category: 'Regularization & Shrinkage',
    readingTime: '8 min read',
    modelsCount: '21',
    searchName: 'regularization l1 l2 lasso ridge elastic net sparsity shrinkage norm penalty constrained optimization',
    lead: 'Geometric, Bayesian, and numerical mechanisms of parameter shrinkage: why L1 induces exact sparsity on coordinate axes while L2 shrinks isotropic weights smoothly.'
  },
  {
    id: 'cross-validation',
    title: 'Cross-Validation & Resampling Strategies',
    catGroup: 'preprocessing',
    catLabel: 'Data Science',
    category: 'Validation & Resampling',
    readingTime: '6 min read',
    modelsCount: '47',
    searchName: 'cross validation k-fold stratified time series repeated holdout data leakage validation data science',
    lead: 'Rigorous validation architectures: K-Fold, Stratified K-Fold, GroupKFold, and TimeSeriesSplit to prevent optimistic data leakage.'
  },
  {
    id: 'exploratory-data-analysis',
    title: 'Exploratory Data Analysis (EDA) & Preprocessing',
    catGroup: 'preprocessing',
    catLabel: 'Data Science',
    category: 'Exploratory Data Science',
    readingTime: '9 min read',
    modelsCount: '47',
    searchName: 'exploratory data analysis eda preprocessing missing values outliers skewness box cox standardization normalization data science',
    lead: 'The systematic scientific protocol for data investigation: handling missingness, target skewness, outlier clipping, and robust standardization.'
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent & Numerical Optimization',
    catGroup: 'optimization',
    catLabel: 'Optimization',
    category: 'Optimization & Loss Theory',
    readingTime: '7 min read',
    modelsCount: '47',
    searchName: 'gradient descent optimization batch sgd mini batch learning rate momentum rmsprop adam numerical solvers',
    lead: 'Iterative first-order optimization algorithms: Batch Gradient Descent, Stochastic (SGD), Mini-batch, Momentum, RMSprop, and Adam.'
  },
  {
    id: 'log-odds',
    title: 'Log-Odds & The Logit Function',
    catGroup: 'theory',
    catLabel: 'Statistics',
    category: 'Probability & Link Theory',
    readingTime: '6 min read',
    modelsCount: '6',
    searchName: 'log odds logit function odds ratio binary classification link function probability bounded linear logistic regression statistics',
    lead: 'The mathematical bridge mapping bounded probability space $[0, 1]$ to unbounded Euclidean space $(-\\infty, +\\infty)$, unlocking linear regression models for binary classification.'
  },
  {
    id: 'sigmoid-and-link-functions',
    title: 'The Sigmoid Function & Activation Link Mechanisms',
    catGroup: 'theory',
    catLabel: 'Statistics',
    category: 'Generalized Linear Models & Activations',
    readingTime: '7 min read',
    modelsCount: '12',
    searchName: 'sigmoid function logistic activation link function glm vanishing gradient derivative neural networks platt scaling statistics',
    lead: 'The canonical inverse link function converting unconstrained linear hyperplanes into calibrated posterior probabilities, and the mathematical backbone of neural activation layers.'
  },
  {
    id: 'maximum-likelihood-estimation',
    title: 'Maximum Likelihood Estimation & Bernoulli Log-Likelihood',
    catGroup: 'optimization',
    catLabel: 'Statistics',
    category: 'Statistical Estimation & Optimization',
    readingTime: '8 min read',
    modelsCount: '18',
    searchName: 'maximum likelihood estimation mle bernoulli log likelihood binary cross entropy bce score function hessian concavity statistics',
    lead: 'The principled statistical framework for fitting parametric models by finding parameter weights that maximize the joint probability of observing the empirical training data.'
  },
  {
    id: 'quasi-newton-and-lbfgs',
    title: 'Quasi-Newton Optimization & L-BFGS',
    catGroup: 'optimization',
    catLabel: 'Optimization',
    category: 'Second-Order Optimization & Solvers',
    readingTime: '9 min read',
    modelsCount: '14',
    searchName: 'quasi newton optimization l-bfgs bfgs hessian secant equation two-loop recursion convex solver logistic regression',
    lead: 'Scaling Newton-Raphson curvature acceleration to high-dimensional datasets by approximating the inverse Hessian through limited-memory gradient displacements.'
  }
];

const cardsHtml = models.map(m => {
  const metricChips = m.metrics.map(met => `<span><b>${met.label}</b> ${met.val}</span>`).join(' ');
  return `      <a href="${m.href}" class="model-card spot reveal" data-cat="${m.cat}" data-name="${m.searchName.toLowerCase()}">
        <div class="card-top">
          <span class="cat-badge ${m.cat}">${m.cat}</span>
          <span class="dataset-pill">Modular Benchmarks</span>
        </div>
        <div class="card-subfamily">${m.subfamily}</div>
        <h3>${m.title}</h3>
        <p>${m.desc}</p>
        <div class="card-metrics">
          <div class="chips">
            ${metricChips}
          </div>
          <span class="card-arrow">&rarr;</span>
        </div>
      </a>`;
}).join('\n');

const conceptCardsHtml = concepts.map(c => {
  return `      <a href="concepts/${c.id}/index.html" class="concept-card spot reveal" data-concept-cat="${c.catGroup}" data-name="${c.searchName.toLowerCase()}">
        <div class="card-top">
          <span class="cat-badge concept">${c.catLabel}</span>
          <span class="dataset-pill">${c.readingTime}</span>
        </div>
        <div class="card-subfamily">${c.category}</div>
        <h3>${c.title}</h3>
        <p>${c.lead}</p>
        <div class="card-metrics">
          <div class="chips">
            <span><b>Applied in:</b> ${c.modelsCount} Models</span>
          </div>
          <span class="card-arrow">&rarr;</span>
        </div>
      </a>`;
}).join('\n');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#070709">
  <title>Learn: Data Science, Machine Learning &amp; Statistics &bull; Yogesh Awate</title>
  <meta name="description" content="A comprehensive, mathematically rigorous learning platform covering Data Science, Statistical Foundations, and 47 Machine Learning Architectures with interactive laboratories, derivations, and modular EDA benchmarks.">
  <meta property="og:title" content="Learn: Data Science, Machine Learning &amp; Statistics &bull; Yogesh Awate">
  <meta property="og:description" content="Master 47 ML models, 17 foundational concepts, EDA workflows, and statistical inference with modular datasets and interactive simulations.">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script>document.documentElement.classList.add('js')</script>
</head>
<body class="page-zoo">
  <a class="skip" href="#learn">Skip to Learn</a>

  <!-- Fixed Navigation matching yogesh660.github.io -->
  <nav id="nav">
    <div class="brand-wrap">
      <a class="mark" href="https://yogesh660.github.io/" aria-label="Yogesh Awate, Home">YA<span>.</span></a>
      <span class="brand-divider">/</span>
      <span class="brand-sub">Learn</span>
    </div>
    <div class="navlinks" id="navlinks">
      <a href="#pillars">Pillars</a>
      <a href="#learn-models" onclick="switchLearnTab('models')">Models (47)</a>
      <a href="#learn-concepts" onclick="switchLearnTab('concepts')">Statistics &amp; Theory (17)</a>
      <a href="#datasets">Datasets &amp; EDA</a>
      <a href="#roadmap">Roadmap</a>
      <a href="https://yogesh660.github.io/about/">About</a>
      <a class="pill" href="https://github.com/yogesh660" target="_blank" rel="noopener">GitHub <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
    </div>
    <button class="menu" id="menu" aria-label="Open menu" aria-expanded="false" aria-controls="navlinks">
      <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </nav>

  <!-- Hero Section with glowing ambient backdrop -->
  <header class="hero">
    <div class="hero-stage" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="hero-name" aria-hidden="true">LEARN</div>

    <div class="hero-card hero-intro">
      <p class="availability rise" style="--d:1"><i></i>64 Active Learning Units &bull; Data Science, ML &amp; Statistics</p>
      <p class="kicker rise" style="--d:2">The Unified Knowledge Engine</p>
      <h1><span class="line"><span class="rise" style="--d:3">Data Science, ML</span></span><span class="line"><span class="rise dim" style="--d:4">&amp; Statistics.</span></span></h1>
      <p class="focus rise" style="--d:5">An exhaustive, mathematically rigorous, and code-verified learning platform. Explore foundational statistical theory, exploratory data science workflows, robust feature selection mechanisms, diagnostic evaluation matrices, and 47 production machine learning algorithms.</p>
      <div class="actions rise" style="--d:6">
        <a class="button light" href="#learn">Explore Curriculum (64 Units) <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
        <a class="button ghost" href="#pillars">View Core Pillars</a>
      </div>
    </div>

    <aside class="hero-card hero-side rise" style="--d:7">
      <small>Curriculum Scope</small>
      <p>Explore 47 end-to-end models and 17 foundational concepts with modular datasets, derivations, and diagnostic plots.</p>
      
      <div class="hero-stats-grid">
        <div class="stat-box">
          <strong data-count="47" data-suffix="">47</strong>
          <span>ML Models</span>
        </div>
        <div class="stat-box">
          <strong data-count="17" data-suffix="">17</strong>
          <span>Core Concepts</span>
        </div>
        <div class="stat-box">
          <strong data-count="6" data-suffix="">6</strong>
          <span>Modular Datasets</span>
        </div>
        <div class="stat-box">
          <strong data-count="4" data-suffix="">4</strong>
          <span>Core Pillars</span>
        </div>
      </div>

      <div style="margin: 14px 0 16px; display: flex; flex-wrap: wrap; gap: 6px;">
        <span class="roadmap-tech-pill" style="background: rgba(140, 124, 255, 0.15); color: var(--violet-2); border: 1px solid rgba(140, 124, 255, 0.3);">Data Science &bull; Active</span>
        <span class="roadmap-tech-pill" style="background: rgba(86, 217, 255, 0.15); color: var(--cyan); border: 1px solid rgba(86, 217, 255, 0.3);">Machine Learning &bull; Active</span>
        <span class="roadmap-tech-pill" style="background: rgba(116, 223, 155, 0.15); color: var(--green); border: 1px solid rgba(116, 223, 155, 0.3);">Statistics &bull; Active</span>
        <span class="roadmap-tech-pill" style="color: var(--dim);">Deep Learning &bull; Roadmap</span>
        <span class="roadmap-tech-pill" style="color: var(--dim);">NLP &bull; Roadmap</span>
        <span class="roadmap-tech-pill" style="color: var(--dim);">Agentic AI &bull; Roadmap</span>
      </div>

      <a class="side-cta" href="#learn">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>
        <span>Start Learning (Models &amp; Concepts)</span>
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>

      <div class="quick-links">
        <a href="https://www.linkedin.com/in/yogesh-s-awate/" target="_blank" rel="noopener">LinkedIn <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
        <a href="https://github.com/yogesh660" target="_blank" rel="noopener">GitHub <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
        <a href="https://medium.com/@yogeshinawate" target="_blank" rel="noopener">Medium <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
      </div>
      <span class="where">Pune, India &bull; Published on GitHub Pages</span>
    </aside>
  </header>

  <!-- Marquee Tech Banner -->
  <div class="marquee" aria-hidden="true">
    <div class="track">
      <span>Ordinary Least Squares</span><i></i>
      <span>Maximum Likelihood Estimation</span><i></i>
      <span>Exploratory Data Analysis</span><i></i>
      <span>Sigmoid &amp; Link Functions</span><i></i>
      <span>Confusion Matrix</span><i></i>
      <span>VIF &amp; Multicollinearity</span><i></i>
      <span>L-BFGS &amp; Quasi-Newton</span><i></i>
      <span>Gradient Descent</span><i></i>
      <span>XGBoost &amp; Ensembles</span><i></i>
      <span>Log-Odds &amp; Logit</span><i></i>
      <span>Bias-Variance Tradeoff</span><i></i>
      <span>Support Vector Machines</span><i></i>
      <span>Feature Selection</span><i></i>
      <span>ROC-AUC Curves</span><i></i>
      <span>Regularization L1/L2</span><i></i>
      <span>Random Forest</span><i></i>
      <span>Loss vs Cost vs Error</span><i></i>
      <span>Gaussian Mixture Models</span><i></i>
      <span>Precision &amp; Recall</span><i></i>
      <span>K-Means &amp; DBSCAN</span><i></i>
      <span>Bernoulli Log-Likelihood</span><i></i>
      <span>Cross-Validation</span><i></i>
    </div>
  </div>

  <!-- SECTION 01: The Three Core Pillars of Learning -->
  <section id="pillars" class="section">
    <div class="head reveal">
      <div>
        <span class="tag">01 / Foundational Pillars</span>
        <h2>Three interconnected disciplines. Zero gaps.</h2>
      </div>
      <p>True mastery in applied intelligence requires fluency across the entire mathematical and empirical pipeline, connecting statistics, data science, and algorithmic modeling.</p>
    </div>

    <div class="pillar-grid reveal">
      <!-- Pillar 1: Statistics -->
      <div class="pillar-card stats spot">
        <div class="pillar-header">
          <span class="pillar-num">Pillar 01</span>
          <span class="pillar-badge">Theory &amp; Inference</span>
        </div>
        <h3>Mathematical Statistics &amp; Probability</h3>
        <p>The formal calculus of uncertainty, parametric distributions, coordinate transformations, and parameter estimation governing machine learning.</p>
        <ul class="pillar-topics">
          <li><strong>Bounded vs Unbounded Spaces:</strong> Probability, Odds &amp; Log-Odds (Logit)</li>
          <li><strong>Generalized Linear Models (GLMs):</strong> Canonical Sigmoid Link functions</li>
          <li><strong>Parameter Estimation:</strong> Maximum Likelihood Estimation (MLE) &amp; Bernoulli Likelihood</li>
          <li><strong>Optimization Landscapes:</strong> Hessian matrices, convexity &amp; information geometry</li>
          <li><strong>Generalization Bounds:</strong> Bias-Variance decomposition &amp; irreducible noise</li>
        </ul>
        <div class="pillar-footer">
          <a href="#learn" onclick="switchLearnTab('stats')">Explore Statistical Concepts &rarr;</a>
          <span>5 Core Units</span>
        </div>
      </div>

      <!-- Pillar 2: Data Science -->
      <div class="pillar-card ds spot">
        <div class="pillar-header">
          <span class="pillar-num">Pillar 02</span>
          <span class="pillar-badge">Empirical Engineering</span>
        </div>
        <h3>Data Science &amp; Exploratory Analysis</h3>
        <p>Diagnostic investigation, distribution transformation, and disciplined feature selection before model fitting.</p>
        <ul class="pillar-topics">
          <li><strong>Systematic EDA Protocol:</strong> Handling missingness, target skewness &amp; power transforms</li>
          <li><strong>Missing Value Imputation:</strong> Mean, Median, MICE &amp; KNN imputation strategies</li>
          <li><strong>Outlier Diagnostics:</strong> Interquartile ranges (IQR), Z-scores &amp; robust clipping</li>
          <li><strong>Feature Selection Taxonomy:</strong> Filter (Correlation/MI), Wrapper (RFE), Embedded (Lasso)</li>
          <li><strong>Collinearity Diagnostics:</strong> Variance Inflation Factor (VIF) &amp; condition numbers</li>
        </ul>
        <div class="pillar-footer">
          <a href="#learn" onclick="switchLearnTab('ds')">Explore Data Science Workflows &rarr;</a>
          <span>3 Core Units</span>
        </div>
      </div>

      <!-- Pillar 3: Machine Learning -->
      <div class="pillar-card ml spot">
        <div class="pillar-header">
          <span class="pillar-num">Pillar 03</span>
          <span class="pillar-badge">47 Architectures</span>
        </div>
        <h3>Machine Learning Models &amp; Algorithms</h3>
        <p>Production mathematical algorithms spanning continuous regression, discrete classification, and unsupervised manifold clustering.</p>
        <ul class="pillar-topics">
          <li><strong>Linear &amp; Regularized Hyperplanes:</strong> OLS, Ridge, Lasso, ElasticNet, SGD</li>
          <li><strong>Margin Classifiers:</strong> Linear SVM, Kernel RBF Hilbert spaces, Platt scaling</li>
          <li><strong>Non-Linear Tree Ensembles:</strong> Random Forest, ExtraTrees, AdaBoost, XGBoost, LightGBM</li>
          <li><strong>Numerical Solvers:</strong> First-Order (SGD, Adam) vs Second-Order (Quasi-Newton L-BFGS)</li>
          <li><strong>Unsupervised Manifolds:</strong> K-Means, DBSCAN, Gaussian Mixture Models, PCA, t-SNE</li>
        </ul>
        <div class="pillar-footer">
          <a href="#learn" onclick="switchLearnTab('models')">Browse 47 ML Architectures &rarr;</a>
          <span>47 Production Models</span>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 02: Modular Benchmark Datasets Showcase -->
  <section id="datasets" class="section band">
    <div class="inner">
      <div class="head reveal">
        <div>
          <span class="tag">02 / Empirical Verification</span>
          <h2>Modular benchmark datasets.</h2>
        </div>
        <p>No model is an island. Switch real-world datasets inside model pages to inspect EDA transformations, collinearity, and feature selection choices.</p>
      </div>

      <div class="dataset-showcase-grid reveal">
        <!-- Dataset 1: California Housing -->
        <div class="dataset-card spot">
          <div class="dataset-card-top">
            <span class="dataset-type-pill regression">Continuous Regression</span>
            <span style="font:500 11px var(--mono); color:var(--soft);">20,640 Records</span>
          </div>
          <h4>California Housing</h4>
          <p>Predicting median house values from spatial coordinates, census block demographics, and room distributions.</p>
          <div class="dataset-meta-list">
            <span><strong>Key EDA:</strong> Right-skewed income target, spatial latitude/longitude clusters.</span>
            <span><strong>Feature Selection:</strong> VIF drops redundant AveBedrms collinearity with AveRooms.</span>
            <span><strong>Evaluated On:</strong> OLS, Ridge, Lasso, ElasticNet, SVR, Decision Trees, XGBoost.</span>
          </div>
        </div>

        <!-- Dataset 2: Titanic Survival -->
        <div class="dataset-card spot">
          <div class="dataset-card-top">
            <span class="dataset-type-pill classification">Binary Classification</span>
            <span style="font:500 11px var(--mono); color:var(--soft);">891 Records</span>
          </div>
          <h4>Titanic Passenger Survival</h4>
          <p>Binary outcome survival prediction modeling socioeconomic status, passenger demographics, and family size.</p>
          <div class="dataset-meta-list">
            <span><strong>Key EDA:</strong> Missing age median imputation, bimodal age curves, title extraction.</span>
            <span><strong>Feature Selection:</strong> Mutual information isolates Sex and Pclass as dominant factors.</span>
            <span><strong>Evaluated On:</strong> Logistic Regression, LDA, QDA, Naive Bayes, Random Forest.</span>
          </div>
        </div>

        <!-- Dataset 3: Breast Cancer Wisconsin -->
        <div class="dataset-card spot">
          <div class="dataset-card-top">
            <span class="dataset-type-pill classification">High-Dim Classification</span>
            <span style="font:500 11px var(--mono); color:var(--soft);">569 Records &bull; 30 Features</span>
          </div>
          <h4>Breast Cancer Wisconsin</h4>
          <p>Cell nucleus characteristics digitized from fine needle aspirate (FNA) images diagnosing malignant vs benign tissue.</p>
          <div class="dataset-meta-list">
            <span><strong>Key EDA:</strong> Strong geometric correlation between radius, perimeter, and area.</span>
            <span><strong>Feature Selection:</strong> Standard scaling and correlation thresholding eliminate redundant variance.</span>
            <span><strong>Evaluated On:</strong> SVM (Linear &amp; RBF), MLP Classifier, KNN, Logistic Regression.</span>
          </div>
        </div>

        <!-- Dataset 4: Wine Quality & Customer Segments -->
        <div class="dataset-card spot">
          <div class="dataset-card-top">
            <span class="dataset-type-pill clustering">Unsupervised &amp; Multi-Class</span>
            <span style="font:500 11px var(--mono); color:var(--soft);">178 - 1,599 Records</span>
          </div>
          <h4>Wine Quality &amp; Customer Segments</h4>
          <p>Physicochemical compositions and customer behavioral spending profiles for density geometry benchmarking.</p>
          <div class="dataset-meta-list">
            <span><strong>Key EDA:</strong> Varying attribute scales requiring z-score normalization and PCA projections.</span>
            <span><strong>Feature Selection:</strong> Silhouette score maximization and Elbow method (WCSS).</span>
            <span><strong>Evaluated On:</strong> K-Means, DBSCAN, Agglomerative Hierarchical, GMM, Mean Shift.</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 03: UNIFIED LEARN CURRICULUM (Models + Concepts) -->
  <section id="learn" class="section">
    <div class="head reveal">
      <div>
        <span class="tag">03 / Master Curriculum</span>
        <h2>64 Learning Units.</h2>
      </div>
      <p>Your one-stop curriculum: explore production ML architectures or dive into foundational mathematical theory and diagnostics.</p>
    </div>

    <!-- Quick Curriculum Domain Filter Pills -->
    <div class="curriculum-nav-pills reveal">
      <button class="curriculum-pill active" id="pillAll" onclick="switchLearnTab('all')">
        All Learning Units <span class="badge-count">(64)</span>
      </button>
      <button class="curriculum-pill" id="pillModels" onclick="switchLearnTab('models')">
        ML Architectures <span class="badge-count">(47)</span>
      </button>
      <button class="curriculum-pill" id="pillStats" onclick="switchLearnTab('stats')">
        Statistics &amp; Probability <span class="badge-count">(5)</span>
      </button>
      <button class="curriculum-pill" id="pillDS" onclick="switchLearnTab('ds')">
        Data Science &amp; EDA <span class="badge-count">(3)</span>
      </button>
      <button class="curriculum-pill" id="pillDiag" onclick="switchLearnTab('diagnostics')">
        Diagnostics &amp; Metrics <span class="badge-count">(5)</span>
      </button>
      <button class="curriculum-pill" id="pillOpt" onclick="switchLearnTab('optimization')">
        Optimization &amp; Solvers <span class="badge-count">(4)</span>
      </button>
    </div>

    <!-- Controls: Sub-filters & Live Search Box -->
    <div class="controls-wrap reveal">
      <!-- Sub-filters for Models -->
      <div class="filters" id="modelFilters">
        <button class="filter on" data-cat="all">All Models <b>(47)</b></button>
        <button class="filter" data-cat="regression">Regression <b>(${regressionCount})</b></button>
        <button class="filter" data-cat="classification">Classification <b>(${classificationCount})</b></button>
        <button class="filter" data-cat="clustering">Clustering <b>(${clusteringCount})</b></button>
      </div>

      <!-- Sub-filters for Concepts -->
      <div class="filters" id="conceptFilters" style="display:none;">
        <button class="filter on" data-concept-cat="all">All Concepts <b>(17)</b></button>
        <button class="filter" data-concept-cat="theory">Statistics &amp; Theory <b>(5)</b></button>
        <button class="filter" data-concept-cat="optimization">Optimization <b>(4)</b></button>
        <button class="filter" data-concept-cat="diagnostics">Diagnostics <b>(5)</b></button>
        <button class="filter" data-concept-cat="preprocessing">Data Science &amp; EDA <b>(3)</b></button>
      </div>

      <!-- Live Search Box -->
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="searchInput" class="search-input" placeholder="Search models, algorithms, statistical concepts..." autocomplete="off">
        <button id="searchClear" class="search-clear" aria-label="Clear search">&times;</button>
      </div>
    </div>

    <div id="filterCount" class="filter-status reveal">Showing 64 of 64 learning units</div>

    <!-- Models Grid (47 models) -->
    <main class="models-grid" id="modelsContainer">
${cardsHtml}
    </main>

    <!-- Concepts Grid (17 concepts) -->
    <div class="models-grid" id="conceptsContainer" style="display:none;">
${conceptCardsHtml}
    </div>

    <!-- Empty State -->
    <div id="emptyState" class="empty-state">
      <h3>No matching results found</h3>
      <p>Try modifying your search query or reset the filter.</p>
      <button class="button light small" onclick="resetZooFilters()">Reset Filters</button>
    </div>
  </section>

  <!-- SECTION 04: FUTURE CURRICULUM HORIZONS (ROADMAP PREVIEW) -->
  <section id="roadmap" class="section">
    <div class="head reveal">
      <div>
        <span class="tag">04 / Curriculum Roadmap</span>
        <h2>Future learning horizons.</h2>
      </div>
      <p>While Data Science, Machine Learning, and Statistics form our active core curriculum, these advanced specialization tracks are currently in design.</p>
    </div>

    <div class="roadmap-grid reveal">
      <!-- Roadmap Track 1: Deep Learning -->
      <div class="roadmap-card">
        <div class="roadmap-status">Phase 2 &bull; In Design</div>
        <h4>Deep Learning &amp; Neural Architectures</h4>
        <p>From multilayer perceptrons and backpropagation calculus to Convolutional Networks, Residual blocks, and Transformer attention heads.</p>
        <div class="roadmap-techs">
          <span class="roadmap-tech-pill">Backprop</span>
          <span class="roadmap-tech-pill">CNNs</span>
          <span class="roadmap-tech-pill">ResNet</span>
          <span class="roadmap-tech-pill">Transformers</span>
          <span class="roadmap-tech-pill">Attention</span>
        </div>
      </div>

      <!-- Roadmap Track 2: NLP -->
      <div class="roadmap-card">
        <div class="roadmap-status">Phase 2 &bull; In Design</div>
        <h4>NLP, NLU, NLG &amp; NER</h4>
        <p>Text processing pipelines, subword tokenization, Word2Vec, sequence models, Named Entity Recognition, and Large Language Model architectures.</p>
        <div class="roadmap-techs">
          <span class="roadmap-tech-pill">Tokenization</span>
          <span class="roadmap-tech-pill">Word2Vec</span>
          <span class="roadmap-tech-pill">BERT</span>
          <span class="roadmap-tech-pill">NER</span>
          <span class="roadmap-tech-pill">LLMs</span>
        </div>
      </div>

      <!-- Roadmap Track 3: Computer Vision -->
      <div class="roadmap-card">
        <div class="roadmap-status">Phase 3 &bull; Planned</div>
        <h4>Computer Vision</h4>
        <p>Spatial feature extractors, object detection bounding boxes, semantic segmentation, and Vision Transformers (ViT).</p>
        <div class="roadmap-techs">
          <span class="roadmap-tech-pill">Convolutions</span>
          <span class="roadmap-tech-pill">YOLO</span>
          <span class="roadmap-tech-pill">Segmentation</span>
          <span class="roadmap-tech-pill">ViT</span>
        </div>
      </div>

      <!-- Roadmap Track 4: Agentic AI -->
      <div class="roadmap-card">
        <div class="roadmap-status">Phase 3 &bull; Planned</div>
        <h4>Agentic AI &amp; Autonomous Agents</h4>
        <p>Reasoning-action loops (ReAct), multi-agent coordination, persistent memory, tool execution, and self-reflection architectures.</p>
        <div class="roadmap-techs">
          <span class="roadmap-tech-pill">ReAct Loop</span>
          <span class="roadmap-tech-pill">Tool Calling</span>
          <span class="roadmap-tech-pill">Multi-Agent</span>
          <span class="roadmap-tech-pill">Memory</span>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 05: Pedagogical Methodology & Standards -->
  <section class="section band">
    <div class="inner">
      <div class="head reveal">
        <div>
          <span class="tag">05 / Pedagogy &amp; Methodology</span>
          <h2>A true one-stop learning lab.</h2>
        </div>
        <p>No isolated formulas or naked charts. Every architecture is dissected through intuitive mental models, mathematical proofs, real EDA, and justified feature selection.</p>
      </div>

      <div class="standards reveal">
        <div class="standard">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>
          <span class="num">01</span>
          <h3>Step-by-Step Derivations</h3>
          <p>Analytical closed-form proofs and optimization steps rendered with KaTeX, linking directly to our <a href="concepts/loss-functions/index.html" style="color:var(--violet-2); text-decoration:underline;">Loss Functions Guide</a>.</p>
        </div>
        <div class="standard">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <span class="num">02</span>
          <h3>Modular Multi-Dataset EDA</h3>
          <p>Switch between real-world datasets directly inside model pages. Inspect target skewness, collinearity matrices, and outlier handling via our <a href="concepts/exploratory-data-analysis/index.html" style="color:var(--violet-2); text-decoration:underline;">EDA Guide</a>.</p>
        </div>
        <div class="standard">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>
          <span class="num">03</span>
          <h3>Feature Selection Trade-Offs</h3>
          <p>Detailed technical justifications for choosing Filter, Wrapper, or Embedded methods, linking to our comprehensive <a href="concepts/feature-selection/index.html" style="color:var(--violet-2); text-decoration:underline;">Feature Selection Guide</a>.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section matching yogesh660.github.io -->
  <section id="contact" class="contact">
    <span class="tag reveal">Let's connect</span>
    <h2 class="reveal">Have an ML or AI problem?<br><span>Let's talk architectures.</span></h2>
    <a class="email reveal" href="mailto:awateyogeshs@gmail.com">awateyogeshs@gmail.com <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
    
    <div class="socials reveal">
      <a href="https://www.linkedin.com/in/yogesh-s-awate/" target="_blank" rel="noopener">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        LinkedIn
      </a>
      <a href="https://github.com/yogesh660" target="_blank" rel="noopener">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.2-.3-2.5-1-3.5.3-1.1.3-2.4 0-3.5 0 0-1 0-3 1.5a10.5 10.5 0 0 0-8 0C6 2 5 2 5 2c-.3 1.1-.3 2.4 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.4.5-.7 1-.9 1.6-.2.6-.2 1.3-.1 1.9v4"/><path d="M9 18c-4.5 2-5-2-7-2"/></svg>
        GitHub
      </a>
      <a href="https://medium.com/@yogeshinawate" target="_blank" rel="noopener">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        Medium
      </a>
      <a href="https://twitter.com/YogeshSAwate1" target="_blank" rel="noopener">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
        X / Twitter
      </a>
    </div>
  </section>

  <!-- Footer matching yogesh660.github.io -->
  <footer>
    <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
    <div class="footlinks">
      <a href="#learn">Curriculum (64)</a>
      <a href="https://yogesh660.github.io/work/">Work</a>
      <a href="https://yogesh660.github.io/projects/">Projects</a>
      <a href="https://yogesh660.github.io/about/">About</a>
      <a href="#nav">Top &uarr;</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; LEARN PLATFORM &bull; DATA SCIENCE, ML &amp; STATISTICS</span>
  </footer>

  <script src="zoo.js" defer></script>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);
console.log('Successfully regenerated index.html as the Master Learn Home Page!');
