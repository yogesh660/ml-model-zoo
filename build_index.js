const fs = require('fs');

const models = JSON.parse(fs.readFileSync('extracted_models.json', 'utf8'));

console.log(`Loaded ${models.length} models for building index.html`);

const regressionCount = models.filter(m => m.cat === 'regression').length;
const classificationCount = models.filter(m => m.cat === 'classification').length;
const clusteringCount = models.filter(m => m.cat === 'clustering').length;

const cardsHtml = models.map(m => {
  const metricChips = m.metrics.map(met => `<span><b>${met.label}</b> ${met.val}</span>`).join(' ');
  return `      <a href="${m.href}" class="model-card spot reveal" data-cat="${m.cat}" data-name="${m.searchName.toLowerCase()}">
        <div class="card-top">
          <span class="cat-badge ${m.cat}">${m.cat}</span>
          <span class="dataset-pill">${m.dataset}</span>
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

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#070709">
  <title>Machine Learning Model Zoo (47 Architectures) · Yogesh Awate</title>
  <meta name="description" content="A comprehensive architectural benchmark suite and mathematical laboratory featuring 47 distinct machine learning algorithms across continuous regression, discrete classification, and unsupervised clustering.">
  <meta property="og:title" content="Machine Learning Model Zoo (47 Architectures) · Yogesh Awate">
  <meta property="og:description" content="Mathematical derivations, benchmark evaluations, and reproducible pipelines across 47 ML algorithms.">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script>document.documentElement.classList.add('js')</script>
</head>
<body class="page-zoo">
  <a class="skip" href="#catalog">Skip to catalog</a>

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
      <a href="#catalog" class="active" aria-current="page">Catalog</a>
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
      <p class="availability rise" style="--d:1"><i></i>47 Production Architectures · Derivations & Code</p>
      <p class="kicker rise" style="--d:2">Algorithmic Laboratory & Suite</p>
      <h1><span class="line"><span class="rise" style="--d:3">Machine Learning</span></span><span class="line"><span class="rise dim" style="--d:4">Model Zoo.</span></span></h1>
      <p class="focus rise" style="--d:5">A structured architectural benchmark suite featuring KaTeX mathematical derivations, exploratory data analysis, evaluation metrics, and clean Python training pipelines across 47 fundamental and state-of-the-art algorithms.</p>
      <div class="actions rise" style="--d:6">
        <a class="button light" href="#catalog">Explore 47 Models <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
        <a class="button ghost" href="https://github.com/yogesh660" target="_blank" rel="noopener">View Repository</a>
      </div>
    </div>

    <aside class="hero-card hero-side rise" style="--d:7">
      <small>Architectural Scope</small>
      <p>Benchmarked across standardized enterprise datasets with mathematical derivations and reproducible Python code.</p>
      
      <div class="hero-stats-grid">
        <div class="stat-box">
          <strong data-count="47" data-suffix="">47</strong>
          <span>Total Models</span>
        </div>
        <div class="stat-box">
          <strong data-count="${regressionCount}" data-suffix="">${regressionCount}</strong>
          <span>Regression</span>
        </div>
        <div class="stat-box">
          <strong data-count="${classificationCount}" data-suffix="">${classificationCount}</strong>
          <span>Classification</span>
        </div>
        <div class="stat-box">
          <strong data-count="${clusteringCount}" data-suffix="">${clusteringCount}</strong>
          <span>Clustering</span>
        </div>
      </div>

      <a class="side-cta" href="https://yogesh660.github.io/">
        <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
        <span>View Full Portfolio</span>
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
      <span>Ridge & Lasso</span><i></i>
      <span>Elastic Net</span><i></i>
      <span>Support Vector Machines</span><i></i>
      <span>XGBoost & LightGBM</span><i></i>
      <span>CatBoost</span><i></i>
      <span>Random Forest</span><i></i>
      <span>Gaussian Process</span><i></i>
      <span>Multi-Layer Perceptron</span><i></i>
      <span>Convolutional Neural Networks</span><i></i>
      <span>Transformers & LSTM</span><i></i>
      <span>Logistic Regression</span><i></i>
      <span>Linear Discriminant Analysis</span><i></i>
      <span>Gaussian Naive Bayes</span><i></i>
      <span>K-Means++</span><i></i>
      <span>DBSCAN & HDBSCAN</span><i></i>
      <span>Gaussian Mixture Models</span><i></i>
      <span>Agglomerative & BIRCH</span><i></i>
      <span>KaTeX Derivations</span><i></i>
      <span>Scikit-Learn</span><i></i>
      <span>Ordinary Least Squares</span><i></i>
      <span>Ridge & Lasso</span><i></i>
      <span>Elastic Net</span><i></i>
      <span>Support Vector Machines</span><i></i>
      <span>XGBoost & LightGBM</span><i></i>
      <span>CatBoost</span><i></i>
      <span>Random Forest</span><i></i>
      <span>Gaussian Process</span><i></i>
      <span>Multi-Layer Perceptron</span><i></i>
      <span>Convolutional Neural Networks</span><i></i>
      <span>Transformers & LSTM</span><i></i>
      <span>Logistic Regression</span><i></i>
      <span>Linear Discriminant Analysis</span><i></i>
      <span>Gaussian Naive Bayes</span><i></i>
      <span>K-Means++</span><i></i>
      <span>DBSCAN & HDBSCAN</span><i></i>
      <span>Gaussian Mixture Models</span><i></i>
      <span>Agglomerative & BIRCH</span><i></i>
      <span>KaTeX Derivations</span><i></i>
      <span>Scikit-Learn</span><i></i>
    </div>
  </div>

  <!-- Methodology / Standards Section -->
  <section class="section band">
    <div class="inner">
      <div class="head reveal">
        <div>
          <span class="tag">01 / Methodology</span>
          <h2>Engineered with rigor.</h2>
        </div>
        <p>Every architecture is examined through theoretical foundations, empirical validation, and executable code artifacts.</p>
      </div>

      <div class="standards reveal">
        <div class="standard">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>
          <span class="num">01</span>
          <h3>Mathematical Formulations</h3>
          <p>LaTeX mathematical equations with KaTeX rendering detailing closed-form analytical solutions, loss function optimizations, and objective constraints.</p>
        </div>
        <div class="standard">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <span class="num">02</span>
          <h3>Empirical Benchmarking</h3>
          <p>Standardized benchmarking on classic benchmark datasets (California Housing, Titanic Survivors, Mall Customers) with verified evaluation metrics.</p>
        </div>
        <div class="standard">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>
          <span class="num">03</span>
          <h3>Production Codebases</h3>
          <p>Isolated <code>train.py</code> training scripts, scikit-learn pipelines, metric JSON exports, and interactive diagnostic charts.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Model Catalog Section -->
  <section id="catalog" class="section">
    <div class="head reveal">
      <div>
        <span class="tag">02 / Model Catalog</span>
        <h2>Explore 47 architectures.</h2>
      </div>
      <p>Filter by paradigm or search across algorithms, mathematical formulations, and evaluation metrics.</p>
    </div>

    <!-- Controls: Filter Pills & Search Box -->
    <div class="controls-wrap reveal">
      <div class="filters">
        <button class="filter on" data-cat="all">All Models <b>(47)</b></button>
        <button class="filter" data-cat="regression">Regression <b>(${regressionCount})</b></button>
        <button class="filter" data-cat="classification">Classification <b>(${classificationCount})</b></button>
        <button class="filter" data-cat="clustering">Clustering <b>(${clusteringCount})</b></button>
      </div>

      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="searchInput" class="search-input" placeholder="Search 47 architectures, equations, datasets..." autocomplete="off">
        <button id="searchClear" class="search-clear" aria-label="Clear search">&times;</button>
      </div>
    </div>

    <div id="filterCount" class="filter-status reveal">Showing 47 of 47 architectures</div>

    <!-- Models Grid -->
    <main class="models-grid" id="modelsGrid">
${cardsHtml}

      <!-- Empty State -->
      <div id="emptyState" class="empty-state">
        <h3>No matching architectures found</h3>
        <p>Try modifying your search query or reset the active category filter.</p>
        <button class="button light small" onclick="resetZooFilters()">Reset Filters</button>
      </div>
    </main>
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
      <a href="https://yogesh660.github.io/work/">Work</a>
      <a href="https://yogesh660.github.io/projects/">Projects</a>
      <a href="https://yogesh660.github.io/about/">About</a>
      <a href="https://github.com/yogesh660/ml-model-zoo" target="_blank" rel="noopener">Repo</a>
      <a href="#nav">Top &uarr;</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>

  <script src="zoo.js" defer></script>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);
console.log('Successfully generated new index.html with matching yogesh660.github.io design!');
