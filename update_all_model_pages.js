const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const modelDirs = fs.readdirSync(modelsDir).filter(name => {
  return fs.statSync(path.join(modelsDir, name)).isDirectory();
});

console.log(`Found ${modelDirs.length} model directories to update.`);

let updatedCount = 0;

for (const dir of modelDirs) {
  const filePath = path.join(modelsDir, dir, 'index.html');
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');

  const titleMatch = content.match(/<title>([^<|]+)/);
  const catMatch = content.match(/<span class="[^"]*uppercase[^"]*">([^<]+)<\/span>/);
  const datasetMatch = content.match(/<span class="text-xs text-slate-400">([^<]+)<\/span>/);
  const subMatch = content.match(/<div class="text-xs font-mono text-indigo-400[^"]*">([^<]+)<\/div>/);
  const descMatch = content.match(/<p class="text-slate-400 text-sm[^"]*">([^<]+)<\/p>/);
  const mathMatch = content.match(/overflow-x-auto">\s*(\$\$[\s\S]*?\$\$)\s*<\/div>/);
  const edaMatch = content.match(/2\. Dataset & Exploratory Data Analysis[\s\S]*?<p class="text-slate-300 text-sm leading-relaxed">([\s\S]*?)<\/p>/);
  const rowsMatch = content.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
  const codeMatch = content.match(/<pre>([\s\S]*?)<\/pre>/);
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);

  if (!titleMatch || !rowsMatch || !codeMatch || !scriptMatch) {
    console.warn(`Skipping ${dir}: missing critical matches`);
    continue;
  }

  const title = titleMatch[1].trim();
  const cat = catMatch ? catMatch[1].trim() : 'model';
  const dataset = datasetMatch ? datasetMatch[1].trim() : '';
  const sub = subMatch ? subMatch[1].trim() : '';
  const desc = descMatch ? descMatch[1].trim() : '';
  const math = mathMatch ? mathMatch[1].trim() : '';
  const eda = edaMatch ? edaMatch[1].trim() : '';
  const code = codeMatch[1].trim();
  
  // Clean table rows: transform into clean class-based rows
  const rowRegex = /<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g;
  let rMatch;
  const rows = [];
  while ((rMatch = rowRegex.exec(rowsMatch[1])) !== null) {
    rows.push(`              <tr><td>${rMatch[1].trim()}</td><td class="val">${rMatch[2].trim()}</td></tr>`);
  }
  const cleanRows = rows.length > 0 ? rows.join('\n') : rowsMatch[1];

  // Update chart script colors to match Yogesh portfolio palette
  let chartScript = scriptMatch[1].trim();
  chartScript = chartScript.replace(/#6366f1/g, '#8c7cff');
  chartScript = chartScript.replace(/#818cf8/g, '#b3abff');
  chartScript = chartScript.replace(/#38bdf8/g, '#56d9ff');
  chartScript = chartScript.replace(/#34d399/g, '#74df9b');
  chartScript = chartScript.replace(/#94a3b8/g, '#9a9aa5');
  chartScript = chartScript.replace(/rgba\(255,255,255,0\.05\)/g, 'rgba(255,255,255,0.08)');

  const newHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · ML Model Zoo · Yogesh Awate</title>
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
      <a href="../../index.html" class="nav-back">&larr; Back to Model Zoo</a>
    </div>
    <div class="nav-badges">
      <span class="badge-cat ${cat.toLowerCase()}">${cat}</span>
      <span class="badge-dataset">${dataset}</span>
    </div>
  </nav>

  <main class="detail-content">
    <header class="detail-header">
      <div class="subfamily-tag">${sub}</div>
      <h1>${title}</h1>
      <p>${desc}</p>
    </header>

    <!-- 1. Math Formulation -->
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot"></span> 1. Mathematical Formulation & Optimization
      </h2>
      <div class="math-card">
        ${math}
      </div>
    </section>

    <!-- 2. Dataset & EDA -->
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot green"></span> 2. Dataset & Exploratory Data Analysis
      </h2>
      <div class="eda-card">
        ${eda}
      </div>
    </section>

    <!-- 3. Metrics & Diagnostics -->
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot cyan"></span> 3. Rigorous Evaluation Benchmarks
      </h2>
      <div class="diag-grid">
        <div class="table-card">
          <table class="diag-table">
            <thead>
              <tr>
                <th>Evaluation Metric</th>
                <th>Validation Score</th>
              </tr>
            </thead>
            <tbody>
${cleanRows}
            </tbody>
          </table>
        </div>
        <div class="chart-card">
          <div class="chart-title">Performance Diagnostic Visual</div>
          <div class="chart-wrap">
            <canvas id="modelChart"></canvas>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Implementation Code -->
    <section class="detail-section">
      <h2 class="section-title">
        <span class="section-dot"></span> 4. Production Training Pipeline (<code>train.py</code>)
      </h2>
      <div class="code-card">
        <div class="code-header">
          <span>Python 3 · scikit-learn / ML Architecture Pipeline</span>
          <span>train.py</span>
        </div>
        <div class="code-body">
          <pre><code>${code}</code></pre>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <a class="mark" href="https://yogesh660.github.io/">YA<span>.</span></a>
    <div>
      <a href="../../index.html">&larr; Back to Catalog</a>
    </div>
    <span>&copy; 2026 YOGESH AWATE &bull; MACHINE LEARNING MODEL ZOO</span>
  </footer>

  <script>
${chartScript}
  </script>
</body>
</html>
`;

  fs.writeFileSync(filePath, newHtml);
  updatedCount++;
}

console.log(`Successfully updated ${updatedCount} model detail pages to match yogesh660.github.io style!`);
