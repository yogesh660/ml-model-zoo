# Machine Learning Model Zoo (47 Architectures)

A comprehensive architectural benchmark suite and educational laboratory featuring 47 distinct machine learning algorithms spanning regression, classification, and unsupervised clustering.

## Structure
- **Root `index.html`**: Interactive dark-themed landing hub with instant real-time search, category filtering, and metrics overview.
- **`models/<model_id>/`**: Each of the 47 models has its own isolated subfolder containing:
  - `index.html`: Deep technical dive featuring KaTeX mathematical formulations, dataset breakdown, EDA, benchmark evaluation, and interactive Chart.js visualization.
  - `train.py`: Self-contained Python training and evaluation pipeline.
  - `metrics.json`: Exported validation metrics.
- **`datasets/raw/`**: Standardized benchmarking datasets (California Housing, Titanic, Mall Customers).

## Learn Hub: Models & Concepts (60 Units)

The unified **Learn** curriculum consists of **47 Models** and **13 Foundational Concepts**:
- **47 Algorithmic Models**: Step-by-step mathematical derivations, modular multi-dataset benchmarking, EDA insights, and justified feature selection.
- **13 Core Concept Guides**: Loss functions, Confusion Matrix, Bias-Variance Tradeoff, VIF Multicollinearity, Feature Selection, and ROC-AUC.

### 1. Regression Models (17)
- Ordinary Least Squares (OLS) Linear Regression
- Ridge Regression (L2)
- Lasso Regression (L1)
- Elastic Net
- Polynomial Regression
- Robust Regression (Huber / RANSAC / Theil-Sen)
- Support Vector Regression (SVR)
- K-Nearest Neighbors Regressor (KNN)
- Decision Tree Regressor (CART)
- Random Forest Regressor
- Gradient Boosting Regressor (GBM)
- XGBoost Regressor
- LightGBM Regressor
- CatBoost Regressor
- Bayesian Linear Regression
- Gaussian Process Regression (GPR)
- Multi-Layer Perceptron (MLP) Regressor

### 2. Classification Models (16)
- Logistic Regression
- Linear Discriminant Analysis (LDA)
- Quadratic Discriminant Analysis (QDA)
- Perceptron
- Gaussian Naive Bayes
- Multinomial & Bernoulli Naive Bayes
- Support Vector Classifier (SVC)
- K-Nearest Neighbors Classifier (KNN)
- Decision Tree Classifier (CART / C4.5)
- Random Forest Classifier
- AdaBoost Classifier
- Gradient Boosted Classifiers (XGBoost / LightGBM / CatBoost)
- Stacking & Voting Classifiers
- Multi-Layer Perceptron (MLP) Classifier
- Convolutional Neural Networks (CNNs)
- Transformers & Recurrent Networks (RNNs / LSTMs)

### 3. Clustering Models (14)
- K-Means
- K-Means++
- K-Medoids (PAM)
- Fuzzy C-Means (Soft Clustering)
- Agglomerative Hierarchical Clustering
- Divisive Hierarchical Clustering
- DBSCAN
- HDBSCAN
- OPTICS
- Mean Shift
- Gaussian Mixture Models (GMM)
- Spectral Clustering
- Affinity Propagation
- BIRCH

---
## Running Locally
Start the built-in HTTP server:
```bash
node server.js
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

## UI & Theme Design
Crafted to seamlessly integrate with Yogesh Awate's portfolio site ([yogesh660.github.io](https://yogesh660.github.io/)):
- **Typography**: Manrope for editorial headings and DM Mono for code, metrics, and tags.
- **Palette**: Deep near-black background (`#070709`), electric violet (`#8c7cff`), cyan (`#56d9ff`), and terminal green (`#74df9b`).
- **Interactive Features**: Dynamic cursor spotlight glow on cards, live search filter, category toggles, animated counters, KaTeX equations, and Chart.js diagnostic plots.

Published with GitHub Pages: `https://yogesh660.github.io/ml-model-zoo/`
