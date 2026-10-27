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
    catLabel: 'Preprocessing',
    category: 'Feature Engineering & Selection',
    readingTime: '9 min read',
    modelsCount: '47',
    searchName: 'feature selection variance inflation factor vif multicollinearity filter wrapper embedded rfe lasso mutual information',
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
    searchName: 'precision recall specificity f1 score harmonic mean threshold tuning false positive false negative',
    lead: 'The fundamental tradeoff dynamics between positive predictive value, sensitivity, and their harmonic balance across classification threshold sweeps.'
  },
  {
    id: 'roc-auc',
    title: 'ROC Curve & Area Under the Curve (AUC)',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '6 min read',
    modelsCount: '16',
    searchName: 'roc auc receiver operating characteristic curve area under curve true positive rate false positive rate discrimination threshold',
    lead: 'Threshold-invariant evaluation of binary classifiers, quantifying rank-order discrimination capacity and probabilistic separation capacity.'
  },
  {
    id: 'regression-metrics',
    title: 'Regression Evaluation Metrics & Residual Diagnostics',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '8 min read',
    modelsCount: '17',
    searchName: 'regression metrics rmse mse mae r2 adjusted r2 residual analysis homoscedasticity normality gauss markov',
    lead: 'Comprehensive evaluation for continuous prediction: MSE, RMSE, MAE, R², Adjusted R², and verifying Gauss-Markov residual assumptions.'
  },
  {
    id: 'clustering-metrics',
    title: 'Clustering Evaluation Metrics & Cluster Validation',
    catGroup: 'diagnostics',
    catLabel: 'Diagnostics',
    category: 'Evaluation & Diagnostics',
    readingTime: '7 min read',
    modelsCount: '14',
    searchName: 'clustering metrics silhouette analysis elbow method inertia davies bouldin wcss unsupervised validation',
    lead: 'Internal and external cluster validation diagnostics: Silhouette Analysis s(i), Davies-Bouldin Index, Inertia, and the Elbow criterion.'
  },
  {
    id: 'bias-variance-tradeoff',
    title: 'The Bias-Variance Decomposition & Generalization',
    catGroup: 'theory',
    catLabel: 'Foundations',
    category: 'Foundational ML Theory',
    readingTime: '8 min read',
    modelsCount: '47',
    searchName: 'bias variance tradeoff underfitting overfitting irreducible error generalization model complexity',
    lead: 'The fundamental theoretical constraint governing predictive modeling: decomposing expected test error into underfitting, variance, and noise.'
  },
  {
    id: 'regularization',
    title: 'Regularization Techniques: L1, L2 & Elastic Net',
    catGroup: 'theory',
    catLabel: 'Foundations',
    category: 'Foundational ML Theory',
    readingTime: '8 min read',
    modelsCount: '47',
    searchName: 'regularization l1 lasso l2 ridge elastic net shrinkage weight decay sparsity tikhonov prior',
    lead: 'Constrained parameter shrinkage dynamics: geometry of L1 diamond sparsity versus L2 spherical weight decay and Bayesian prior interpretations.'
  },
  {
    id: 'cross-validation',
    title: 'Cross-Validation & Resampling Strategies',
    catGroup: 'theory',
    catLabel: 'Foundations',
    category: 'Foundational ML Theory',
    readingTime: '6 min read',
    modelsCount: '47',
    searchName: 'cross validation k fold stratified k fold time series split data leakage resampling out of fold',
    lead: 'Data hygiene, out-of-fold estimation, stratified resampling, time-series windows, and leak-free model evaluation strategies.'
  },
  {
    id: 'exploratory-data-analysis',
    title: 'Exploratory Data Analysis (EDA) Fundamentals',
    catGroup: 'preprocessing',
    catLabel: 'Preprocessing',
    category: 'Feature Engineering & Preprocessing',
    readingTime: '8 min read',
    modelsCount: '47',
    searchName: 'exploratory data analysis eda distributions skewness correlation outliers missing values imputation box cox',
    lead: 'The systematic pipeline for inspecting distributions, identifying outliers, validating collinearity, and assessing skewness before model training.'
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
  <title>Machine Learning Model Zoo & Learn Hub · Yogesh Awate</title>
  <meta name="description" content="The one-stop educational laboratory: Learn 47 machine learning architectures and 13 core theory & diagnostic concepts with interactive modular datasets, derivations, and EDA.">
  <meta property="og:title" content="Machine Learning Model Zoo & Learn Hub · Yogesh Awate">
  <meta property="og:description" content="Learn 47 ML models and 13 foundational concepts with modular datasets and derivations.">
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
      <span class="brand-sub">Model Zoo</span>
    </div>
    <div class="navlinks" id="navlinks">
      <a href="https://yogesh660.github.io/work/">Work</a>
      <a href="https://yogesh660.github.io/projects/">Projects</a>
      <a href="https://yogesh660.github.io/about/">About</a>
      <a href="#learn" class="active" aria-current="page">Learn</a>
      <a href="#contact">Contact</a>
      <a class="pill" href="https://github.com/yogesh660" target="_blank" rel="noopener">GitHub <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
    </div>
    <button class="menu" id="menu" aria-label="Open menu" aria-expanded="false" aria-controls="navlinks">
      <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </nav>

  <!-- Hero Section with glowing ambient backdrop -->
  <header class="hero">
    <div class="hero-stage" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="hero-name" aria-hidden="true">MODEL<br>ZOO</div>

    <div class="hero-card hero-intro">
      <p class="availability rise" style="--d:1"><i></i>60 Learning Units · 47 ML Models · 13 Core Concepts</p>
      <p class="kicker rise" style="--d:2">The One-Stop Machine Learning Laboratory</p>
      <h1><span class="line"><span class="rise" style="--d:3">Machine Learning</span></span><span class="line"><span class="rise dim" style="--d:4">Model Zoo.</span></span></h1>
      <p class="focus rise" style="--d:5">A pedagogical reference suite featuring step-by-step mathematical derivations, exploratory data analysis (EDA), feature selection comparisons with explicit technical justifications, interactive multi-dataset benchmarking, and hyperlinked concept deep dives.</p>
      <div class="actions rise" style="--d:6">
        <a class="button light" href="#learn">Explore &amp; Learn (60 Units) <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
        <a class="button ghost" href="https://github.com/yogesh660" target="_blank" rel="noopener">View GitHub Repo</a>
      </div>
    </div>

    <aside class="hero-card hero-side rise" style="--d:7">
      <small>Curriculum Scope</small>
      <p>Explore 47 end-to-end models and 13 foundational concepts with modular datasets, derivations, and diagnostic plots.</p>
      
      <div class="hero-stats-grid">
        <div class="stat-box">
          <strong data-count="47" data-suffix="">47</strong>
          <span>ML Models</span>
        </div>
        <div class="stat-box">
          <strong data-count="13" data-suffix="">13</strong>
          <span>Core Concepts</span>
        </div>
        <div class="stat-box">
          <strong data-count="${regressionCount}" data-suffix="">${regressionCount}</strong>
          <span>Regression</span>
        </div>
        <div class="stat-box">
          <strong data-count="${classificationCount + clusteringCount}" data-suffix="">${classificationCount + clusteringCount}</strong>
          <span>Classif &amp; Cluster</span>
        </div>
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
      <span class="where">Pune, India · Published on GitHub Pages</span>
    </aside>
  </header>

  <!-- Marquee Tech Banner -->
  <div class="marquee" aria-hidden="true">
    <div class="track">
      <span>Ordinary Least Squares</span><i></i>
      <span>Confusion Matrix</span><i></i>
      <span>Ridge &amp; Lasso</span><i></i>
      <span>VIF &amp; Multicollinearity</span><i></i>
      <span>XGBoost &amp; LightGBM</span><i></i>
      <span>ROC-AUC Curves</span><i></i>
      <span>Support Vector Machines</span><i></i>
      <span>Bias-Variance Tradeoff</span><i></i>
      <span>Random Forest</span><i></i>
      <span>Loss vs Cost vs Error</span><i></i>
      <span>Gaussian Mixture Models</span><i></i>
      <span>Precision &amp; Recall</span><i></i>
      <span>K-Means &amp; DBSCAN</span><i></i>
      <span>Exploratory Data Analysis</span><i></i>
      <span>Stratified Cross-Validation</span><i></i>
      <span>Ordinary Least Squares</span><i></i>
      <span>Confusion Matrix</span><i></i>
      <span>Ridge &amp; Lasso</span><i></i>
      <span>VIF &amp; Multicollinearity</span><i></i>
      <span>XGBoost &amp; LightGBM</span><i></i>
      <span>ROC-AUC Curves</span><i></i>
      <span>Support Vector Machines</span><i></i>
      <span>Bias-Variance Tradeoff</span><i></i>
      <span>Random Forest</span><i></i>
      <span>Loss vs Cost vs Error</span><i></i>
      <span>Gaussian Mixture Models</span><i></i>
      <span>Precision &amp; Recall</span><i></i>
      <span>K-Means &amp; DBSCAN</span><i></i>
      <span>Exploratory Data Analysis</span><i></i>
      <span>Stratified Cross-Validation</span><i></i>
    </div>
  </div>

  <!-- Methodology / Standards Section -->
  <section class="section band">
    <div class="inner">
      <div class="head reveal">
        <div>
          <span class="tag">01 / Pedagogy &amp; Methodology</span>
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

  <!-- UNIFIED LEARN SECTION (Models + Concepts) -->
  <section id="learn" class="section">
    <div class="head reveal">
      <div>
        <span class="tag">02 / Learn Hub</span>
        <h2>47 Models. 13 Concepts.</h2>
      </div>
      <p>Your one-stop curriculum: explore production ML architectures or dive into foundational mathematical theory and diagnostics.</p>
    </div>

    <!-- Primary Learn Switcher: [ Models ] vs [ Concepts ] -->
    <div class="learn-main-tabs reveal">
      <button class="learn-tab active" id="learnTabModels" onclick="switchLearnTab('models')">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <span>ML Models &amp; Architectures</span>
        <span class="learn-tab-count">47</span>
      </button>
      <button class="learn-tab" id="learnTabConcepts" onclick="switchLearnTab('concepts')">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>
        <span>Foundational Concepts</span>
        <span class="learn-tab-count">13</span>
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
        <button class="filter on" data-concept-cat="all">All Concepts <b>(13)</b></button>
        <button class="filter" data-concept-cat="diagnostics">Diagnostics &amp; Metrics <b>(5)</b></button>
        <button class="filter" data-concept-cat="optimization">Optimization &amp; Loss <b>(3)</b></button>
        <button class="filter" data-concept-cat="preprocessing">Preprocessing &amp; EDA <b>(2)</b></button>
        <button class="filter" data-concept-cat="theory">Foundational Theory <b>(3)</b></button>
      </div>

      <!-- Live Search Box -->
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="searchInput" class="search-input" placeholder="Search models, algorithms, concepts..." autocomplete="off">
        <button id="searchClear" class="search-clear" aria-label="Clear search">&times;</button>
      </div>
    </div>

    <div id="filterCount" class="filter-status reveal">Showing 47 of 47 architectures</div>

    <!-- Models Grid (47 models) -->
    <main class="models-grid" id="modelsContainer">
${cardsHtml}
    </main>

    <!-- Concepts Grid (13 concepts) -->
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
      <a href="#learn">Learn Hub (60)</a>
      <a href="https://yogesh660.github.io/work/">Work</a>
      <a href="https://yogesh660.github.io/projects/">Projects</a>
      <a href="https://yogesh660.github.io/about/">About</a>
      <a href="#nav">Top &uarr;</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>

  <script src="zoo.js" defer></script>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);
console.log('Successfully regenerated index.html with unified Learn Hub!');
