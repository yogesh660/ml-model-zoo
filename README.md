# Learn · machine learning from first principles

An interactive learning hub with 67 lessons: 50 machine learning models and 17 statistics and theory concepts, arranged into five learning paths. Every lesson explains the idea in plain words, works through the maths, shows runnable code and includes a live lab where the algorithm actually trains in your browser.

It is meant to sit at `yogesh660.github.io/ml-model-zoo/` and uses the same design system as the portfolio: same tokens, nav, reveals, card spotlight and footer.

## Learning paths

| Path | Lessons | What it covers |
|---|---|---|
| 01 Foundations | 17 | EDA, feature selection, loss functions, gradient descent, MLE, Newton/BFGS, bias–variance, regularisation, cross-validation, log-odds, link functions, metrics |
| 02 Regression | 17 | OLS to polynomial, ridge, lasso, elastic net, robust and Bayesian regression, k-NN, SVR, Gaussian processes, trees, random forests, GBM, XGBoost, LightGBM, CatBoost, MLP |
| 03 Classification | 12 | Logistic regression, LDA, QDA, naive Bayes, SVM, k-NN, trees, random forests, AdaBoost, gradient boosting, stacking |
| 04 Clustering | 14 | k-means, k-means++, k-medoids, fuzzy c-means, agglomerative, divisive, BIRCH, DBSCAN, HDBSCAN, OPTICS, mean shift, GMM, spectral, affinity propagation |
| 05 Neural networks | 7 | Perceptron, MLP, CNNs, RNNs, GRUs, LSTMs, Transformers |

Each lesson follows the same structure: the idea, how it works, an interactive architecture diagram and an animated walkthrough (for linear regression, CNNs and the sequence models), a live lab, the maths, hyperparameters (or key takeaways), when to use it, code with common pitfalls, results on a dataset (models), a short quiz and related lessons.

## Structure

```
content/              every word on the site
  curriculum.js       paths, modules and lesson order
  concepts.js         the 17 foundation lessons
  regression.js       classification.js  clustering.js  neural.js  sequences.js
assets/
  site.css, site.js   straight copies of the portfolio's stylesheet and script
  learn.css, learn.js what Learn adds: paths, syllabus, lesson layout, labs, quiz, progress
  labs/               the in-browser labs (no dependencies)
    core.js           canvas plotting, seeded datasets, controls
    algos.js          from-scratch implementations of every algorithm
    models.js         one lab per model lesson
    concepts.js       one lab per concept lesson
    sequences.js      labs for the RNN, GRU, LSTM and Transformer lessons
    explainers.js     step-by-step animated explainers shown above the labs (linear regression, CNN and sequence lessons)
    architecture.js   interactive architecture diagrams with hover/tap explanations (linear regression and CNN lessons)
scripts/build.js      content -> index.html, models/<id>/index.html, concepts/<id>/index.html
models/<id>/          train.py (scikit-learn or PyTorch) and the metrics.json it writes
datasets/raw/         small synthetic teaching samples modelled on well-known datasets
```

## Build and run

```bash
node scripts/build.js        # regenerates every page from content/
node server.js               # http://localhost:8000
```

No npm install is needed. Pages are plain HTML; KaTeX (for the maths) and Google Fonts load from CDNs, the same way the portfolio does.

To change a lesson, edit its entry in `content/` and rebuild. `[[lesson-id]]` or `[[lesson-id|text]]` inside any text becomes a link to that lesson; the build fails if the id does not exist, so links cannot rot.

## Training scripts

Every model has a self-contained `models/<id>/train.py` that trains on one of the CSVs, compares against a trivial baseline on a held-out split and writes `metrics.json`. The lesson page shows those numbers under "On real data".

```bash
pip install -r requirements.txt
python models/random_forest_regressor/train.py
node scripts/build.js        # pick up the new metrics
```

The XGBoost, LightGBM and CatBoost scripts need their libraries, and the CNN, RNN, GRU, LSTM and Transformer scripts need PyTorch (`pip install torch`); they train on scikit-learn's bundled digits so nothing is downloaded. Until they have been run, those eight lessons simply leave out the results section.

The CSVs are synthetic and deliberately easy, so some scores (Titanic in the mid-90s, breast cancer at 100%) are far higher than you would see on the original datasets. They are there to make the scripts runnable and comparable, not to benchmark models.

## Progress

"Mark as complete" and the path progress bars use `localStorage`, so progress stays in the visitor's browser and is never sent anywhere.
