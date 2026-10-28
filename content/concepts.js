// Foundations path: statistics and theory. Same fields as model lessons, minus hyperparameters.
const r = String.raw;

module.exports = [
  // ------------------------------------------------------------------ data first
  {
    id: 'exploratory-data-analysis', short: 'Exploratory data analysis', title: 'Exploratory Data Analysis (EDA)',
    task: 'concepts', module: 'Data first', level: 1, minutes: 16,
    summary: r`Look before you model: distributions, missing values, outliers, relationships and leakage, checked systematically.`,
    lead: r`EDA is the habit of understanding the data before fitting anything. Most modelling failures are data problems that a few plots and counts would have revealed.`,
    intuition: [
      r`A model only learns what is in the data, including its mistakes. EDA asks a fixed set of questions: What does each column look like? What is missing, and is it missing at random? Are there impossible values? How does each feature relate to the target, and to each other? Is anything suspiciously predictive, the kind of feature that would not be available at prediction time?`,
      r`Skewed targets (house prices, incomes) often model better after a log transform. Heavy correlations between features warn of multicollinearity. Class imbalance changes which metric you should use. EDA finds these things early, when they are cheap to handle.`,
    ],
    analogy: r`A doctor taking a history and doing basic checks before ordering surgery.`,
    steps: [r`Shape and types: rows, columns, dtypes, ID columns, dates.`, r`Missingness: share missing per column, and whether it correlates with the target.`, r`Univariate distributions: histograms, skew, impossible values, outliers (IQR rule).`, r`Target: balance for classification; skew for regression.`, r`Bivariate: each feature against the target; correlation matrix; VIF for collinearity.`, r`Leakage check: anything recorded after the outcome, or too good to be true.`],
    math: [
      { h: 'Skewness', tex: r`$$g_1 = \frac{\frac1n\sum_i(x_i - \bar x)^3}{\big(\frac1n\sum_i(x_i - \bar x)^2\big)^{3/2}}$$`, p: r`Above about 1 in absolute value is strongly skewed; a log or Box-Cox transform often helps.` },
      { h: 'IQR outlier rule', tex: r`$$x < Q_1 - 1.5\,\mathrm{IQR} \;\;\text{or}\;\; x > Q_3 + 1.5\,\mathrm{IQR}, \qquad \mathrm{IQR} = Q_3 - Q_1$$`, p: r`A flag for inspection, not an automatic delete.` },
      { h: 'Variance inflation factor', tex: r`$$\mathrm{VIF}_j = \frac{1}{1 - R_j^2}$$`, p: r`$R_j^2$ comes from regressing feature $j$ on all the others. VIF above 5–10 signals collinearity that will destabilise linear models.` },
    ],
    keyPoints: [r`Every EDA finding should become a decision: drop, transform, impute, engineer, or note as a risk.`, r`Split off the test set <em>before</em> deep EDA, so its quirks do not leak into your choices.`, r`Missing values are information: "missing income" may itself predict the target.`],
    code: r`import pandas as pd, numpy as np

df = pd.read_csv("datasets/raw/california_housing.csv")
print(df.shape, df.dtypes.value_counts().to_dict())
print(df.isna().mean().sort_values(ascending=False).head())       # missing share
print(df.skew(numeric_only=True).sort_values())                     # skew per column
q1, q3 = df.quantile(0.25), df.quantile(0.75)
print(((df < q1 - 1.5 * (q3 - q1)) | (df > q3 + 1.5 * (q3 - q1))).mean().round(3))  # outlier share
print(df.corr(numeric_only=True)["MedHouseVal"].sort_values())      # relation to target`,
    pitfalls: [r`Doing EDA on the full dataset, then being surprised the test score is optimistic.`, r`Deleting outliers that are real and important (fraud, failures).`, r`Imputing with the mean before splitting, which leaks test information into training.`],
    quiz: [
      { q: r`A feature has VIF = 12. What does that suggest?`, o: [r`It is irrelevant`, r`It is highly predictable from the other features (collinearity)`, r`It has many missing values`, r`It is skewed`], a: 1, why: r`$R_j^2 = 1 - 1/12 \approx 0.92$ of its variance is explained by other features.` },
      { q: r`Why should the test set be split off before detailed EDA?`, o: [r`To save time`, r`To avoid choices that are tuned, even unknowingly, to the test data`, r`Because EDA needs fewer rows`, r`It should not`], a: 1, why: r`Decisions informed by test data make the final score optimistic.` },
    ],
    usedBy: ['ols_linear_regression', 'kmeans_clustering', 'dbscan_clustering', 'knn_classifier'],
    prereq: [],
    related: ['feature-selection', 'regression-metrics'],
    labIntro: r`A real dataset from this repository, loaded in your browser. Pick a column to see its distribution, summary statistics and IQR outliers, then try a log transform.`,
    tryThis: [r`Look at <code>Population</code>: long right tail. Apply the log transform and watch the skew drop.`, r`Find the column with the most IQR outliers.`],
    keywords: 'eda exploratory data analysis distribution missing values outliers skew vif leakage',
  },
  {
    id: 'feature-selection', short: 'Feature selection', title: 'Feature Selection: Filter, Wrapper and Embedded Methods',
    task: 'concepts', module: 'Data first', level: 2, minutes: 18,
    summary: r`Choosing which inputs a model sees. Fewer, better features mean faster, more robust and more explainable models.`,
    lead: r`Feature selection removes inputs that add noise, cost or risk without adding signal. Three families: filters score features independently, wrappers search subsets with a model, and embedded methods select during training.`,
    intuition: [
      r`<strong>Filter</strong> methods are fast and model-agnostic: correlation with the target, mutual information, chi-squared, variance thresholds. They can miss features that only matter in combination.`,
      r`<strong>Wrapper</strong> methods such as recursive feature elimination (RFE) or forward selection train the model on candidate subsets and keep what helps. They respect interactions but are expensive and can overfit the selection to the validation data.`,
      r`<strong>Embedded</strong> methods select as part of training: [[lasso_regression|L1]] zeroes coefficients, trees rank features by how much they reduce impurity or by permutation importance. Usually the best trade-off.`,
    ],
    analogy: r`Packing for a trip: filters weigh each item alone, wrappers try packing different bags, embedded methods pack as you go and leave behind what you never used.`,
    steps: [r`Remove obvious junk: IDs, constants, near-duplicates, leaky columns.`, r`Filter by a cheap score to cut a very wide set down.`, r`Use an embedded or wrapper method with cross-validation on what remains.`, r`Check stability: does the same set survive across CV folds?`, r`Keep selection inside the CV pipeline so it does not see validation data.`],
    math: [
      { h: 'Mutual information', tex: r`$$I(X; Y) = \sum_{x,y}p(x,y)\log\frac{p(x,y)}{p(x)\,p(y)}$$`, p: r`Zero when the feature and target are independent; captures non-linear relationships that correlation misses.` },
      { h: 'Permutation importance', tex: r`$$\mathrm{PI}_j = \text{score}(X) - \mathbb E\big[\text{score}(X^{\pi_j})\big]$$`, p: r`The drop in held-out score when feature $j$’s column is shuffled. Model-agnostic and honest, but shared between correlated features.` },
    ],
    keyPoints: [r`Selection done outside cross-validation leaks: the selected set has already seen the validation folds.`, r`Correlated features split importance between them; dropping one can make the other look more important.`, r`Fewer features are worth a small accuracy loss when they make the model cheaper, more stable or easier to explain.`],
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.feature_selection import SelectKBest, mutual_info_regression, RFECV
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

filt = make_pipeline(SelectKBest(mutual_info_regression, k=5), LinearRegression())
print("filter CV R2:", cross_val_score(filt, X, y, cv=5).mean().round(3))

rfe = RFECV(LinearRegression(), step=1, cv=5).fit(X, y)                   # wrapper
print("RFE keeps:", list(X.columns[rfe.support_]))`,
    pitfalls: [r`Selecting on the full dataset and then cross-validating the model. Put selection inside the pipeline.`, r`Trusting impurity importances for high-cardinality features.`, r`Dropping a feature because it is weakly correlated with the target, when it matters through an interaction.`],
    quiz: [
      { q: r`Which family uses the model itself to evaluate subsets of features?`, o: [r`Filter`, r`Wrapper`, r`Embedded`, r`None`], a: 1, why: r`Wrappers (RFE, forward/backward selection) train and score the model on candidate subsets.` },
      { q: r`Lasso is an example of:`, o: [r`A filter method`, r`A wrapper method`, r`An embedded method`, r`Dimensionality reduction`], a: 2, why: r`Selection happens inside training via the L1 penalty.` },
    ],
    usedBy: ['lasso_regression', 'elastic_net', 'random_forest_regressor', 'catboost_regressor'],
    prereq: ['exploratory-data-analysis'],
    related: ['regularization', 'cross-validation'],
    labIntro: r`Ten candidate features, three of which actually drive the target. Compare what a filter (correlation), an embedded method (lasso) and a wrapper (greedy forward selection) pick.`,
    tryThis: [r`Find the feature that only matters through an interaction: the filter misses it, forward selection may not.`, r`Raise the noise and see which method still finds the true three.`],
    keywords: 'feature selection filter wrapper embedded rfe mutual information permutation importance',
  },
  // ------------------------------------------------------------------ learning as optimisation
  {
    id: 'cost-vs-loss-vs-error', short: 'Cost vs loss vs error', title: 'Error, Loss and Cost: Three Words, Three Meanings',
    task: 'concepts', module: 'Learning as optimisation', level: 1, minutes: 10,
    summary: r`Error is a single mistake, loss scores one prediction, cost (the objective) aggregates loss over data plus any penalty.`,
    lead: r`People use these words loosely, but the distinction is useful: <strong>error</strong> is the raw difference for one example, <strong>loss</strong> turns it into a penalty, and <strong>cost</strong> averages the loss over the dataset and adds regularisation. Training minimises the cost.`,
    intuition: [
      r`For one house, the error is $y - \hat y = 30$k. The squared loss of that prediction is $900$ (in k²). The cost is the average squared loss over all houses plus, say, $\lambda\lVert w\rVert^2$. The optimiser only ever sees the cost.`,
      r`The <em>metric</em> you report (RMSE, accuracy, AUC) can differ from the loss you train on. You train with log-loss because it is smooth and convex, then report accuracy because people understand it. Keeping the four words apart avoids a lot of confusion.`,
    ],
    analogy: r`Error is how far one dart missed; loss is the points you lose for that miss; cost is your total penalty for the round, plus a fine for an overly fancy throwing style.`,
    steps: [r`Error: $e_i = y_i - \hat y_i$ (or a 0/1 mistake for classification).`, r`Loss: $\ell(y_i, \hat y_i)$, e.g. $e_i^2$, $|e_i|$, log-loss.`, r`Cost: $J(\theta) = \frac1n\sum_i\ell(y_i, \hat y_i) + \lambda R(\theta)$.`, r`Metric: what you report on held-out data, chosen for the business question.`],
    math: [
      { h: 'Empirical risk with a regulariser', tex: r`$$J(\theta) = \underbrace{\frac1n\sum_{i=1}^n\ell\big(y_i, f_\theta(x_i)\big)}_{\text{average loss (empirical risk)}} + \underbrace{\lambda R(\theta)}_{\text{penalty}}$$`, p: r`Minimising the first term alone is empirical risk minimisation; the second term is what [[regularization]] adds.` },
    ],
    keyPoints: [r`The optimiser sees the cost; you report a metric. They are often different on purpose.`, r`Loss is per example; cost is per dataset.`, r`A model can lower its training cost and still get worse on the metric you care about: that is overfitting.`],
    code: r`import numpy as np

y, y_hat, w, lam = np.array([3., 5., 2.]), np.array([2.5, 6., 2.]), np.array([0.8, -1.2]), 0.1
error = y - y_hat                       # [ 0.5, -1. ,  0. ]
loss = error ** 2                       # per-example squared loss
cost = loss.mean() + lam * (w ** 2).sum()
rmse = np.sqrt(loss.mean())             # the metric you might report
print(error, loss, round(cost, 3), round(rmse, 3))`,
    pitfalls: [r`Tuning hyperparameters on training cost instead of a validation metric.`, r`Reporting log-loss to stakeholders who expect accuracy, or the reverse.`],
    quiz: [
      { q: r`Which quantity does gradient descent actually minimise?`, o: [r`The error of one example`, r`The cost: average loss plus any penalty`, r`The test metric`, r`Accuracy`], a: 1, why: r`It follows the gradient of the training objective.` },
    ],
    usedBy: ['ols_linear_regression', 'ridge_regression', 'logistic_regression'],
    prereq: [],
    related: ['loss-functions', 'regularization'],
    labIntro: r`Five predictions, their errors and losses, and the cost they add up to. Drag the predictions, switch the loss, and add a penalty.`,
    tryThis: [r`Switch from squared to absolute loss and see how the biggest error’s share of the cost drops.`, r`Raise λ: the cost rises even though no prediction changed.`],
    keywords: 'cost function loss function error objective empirical risk metric',
  },
  {
    id: 'loss-functions', short: 'Loss functions', title: 'Loss Functions: How Models Measure Mistakes',
    task: 'concepts', module: 'Learning as optimisation', level: 1, minutes: 18,
    summary: r`MSE, MAE, Huber, log-loss and hinge: what each one punishes, and how that choice shapes the model you get.`,
    lead: r`The loss function is where you tell the model what a mistake costs. Squared loss hates big errors, absolute loss treats all errors evenly, log-loss hates confident wrong answers, hinge loss only cares about getting the margin right.`,
    intuition: [
      r`Minimising squared error gives the conditional <em>mean</em>; minimising absolute error gives the conditional <em>median</em>. That is why MSE is pulled by outliers and MAE is not. Huber is squared near zero and absolute far away: the best of both.`,
      r`For classification, log-loss (cross-entropy) penalises a 0.99 prediction for the wrong class with $-\log 0.01 \approx 4.6$, a huge penalty, which pushes models toward calibrated probabilities. Hinge loss is zero once a point is correctly classified with margin at least 1, so it ignores easy points, which is why SVMs depend only on support vectors.`,
    ],
    analogy: r`A teacher’s marking scheme: does a big mistake cost a lot more than a small one, the same, or does only being on the right side of the line matter?`,
    steps: [r`Regression: start with squared error; switch to Huber or MAE when outliers matter; use quantile (pinball) loss for prediction intervals.`, r`Classification: log-loss when you need probabilities; hinge for maximum-margin classifiers.`, r`Make sure the loss you train on matches what the business penalises.`],
    math: [
      { h: 'Regression losses', tex: r`$$\ell_{\text{MSE}} = (y - \hat y)^2, \quad \ell_{\text{MAE}} = |y - \hat y|, \quad \ell_\delta = \begin{cases}\tfrac12 e^2 & |e| \le \delta\\ \delta(|e| - \tfrac12\delta) & \text{otherwise}\end{cases}$$`, p: r`Their gradients tell the story: $2e$ grows without limit, $\operatorname{sign}(e)$ is constant, Huber is capped at $\pm\delta$.` },
      { h: r`Classification losses (margin $m = y\,f(x)$, $y \in \{-1, 1\}$)`, tex: r`$$\ell_{\text{log}} = \log(1 + e^{-m}), \quad \ell_{\text{hinge}} = \max(0, 1 - m), \quad \ell_{0/1} = \mathbb 1[m \le 0]$$`, p: r`Both log and hinge are convex upper bounds of the 0/1 loss, which we cannot optimise directly.` },
      { h: 'Quantile (pinball) loss', tex: r`$$\ell_\tau(e) = \max(\tau e,\; (\tau - 1)e)$$`, p: r`Minimised by the $\tau$-th conditional quantile; used for prediction intervals with boosting.` },
    ],
    keyPoints: [r`MSE → mean, MAE → median, pinball → quantile.`, r`Convex surrogate losses make classification trainable.`, r`The loss decides which errors the model will sacrifice to fix others.`],
    code: r`import numpy as np

e = np.linspace(-3, 3, 7)
mse, mae = e ** 2, np.abs(e)
huber = np.where(np.abs(e) <= 1, 0.5 * e ** 2, np.abs(e) - 0.5)
m = np.linspace(-2, 2, 5)                         # classification margins y*f(x)
log_loss, hinge = np.log1p(np.exp(-m)), np.maximum(0, 1 - m)
print(np.c_[e, mse, mae, huber]); print(np.c_[m, log_loss, hinge])`,
    pitfalls: [r`Training with MSE on data with heavy outliers and blaming the model.`, r`Using accuracy as a training signal; it has zero gradient almost everywhere.`],
    quiz: [
      { q: r`Which loss is minimised by predicting the median?`, o: [r`MSE`, r`MAE`, r`Log-loss`, r`Hinge`], a: 1, why: r`The derivative of $\sum|y_i - c|$ is zero where half the points are above $c$ and half below.` },
      { q: r`Hinge loss for a correctly classified point with margin 2 is:`, o: [r`2`, r`1`, r`0`, r`−1`], a: 2, why: r`$\max(0, 1 - 2) = 0$: points beyond the margin contribute nothing.` },
    ],
    usedBy: ['robust_regression', 'support_vector_classifier', 'logistic_regression', 'gradient_boosting_regressor'],
    prereq: ['cost-vs-loss-vs-error'],
    related: ['maximum-likelihood-estimation', 'gradient-descent'],
    labIntro: r`Left: regression losses against the residual. Right: classification losses against the margin. Move the probe to compare values and gradients.`,
    tryThis: [r`At residual 3, compare the gradient of MSE (6) with Huber’s (capped at δ).`, r`Find the margin where log-loss and hinge loss are equal.`],
    keywords: 'loss functions mse mae huber log loss cross entropy hinge quantile pinball',
  },
  {
    id: 'gradient-descent', short: 'Gradient descent', title: 'Gradient Descent and Its Variants',
    task: 'concepts', module: 'Learning as optimisation', level: 1, minutes: 22,
    summary: r`Walk downhill on the loss surface in small steps. Batch, stochastic and mini-batch GD, momentum, RMSprop and Adam.`,
    lead: r`Gradient descent repeatedly moves the parameters a small step against the gradient: $\theta \leftarrow \theta - \eta\nabla J(\theta)$. Almost every model you will train in practice is fitted by some version of this rule.`,
    intuition: [
      r`The gradient points uphill, so its negative points downhill. The learning rate $\eta$ is the step size: too small and training crawls; too large and you overshoot the valley and bounce or diverge. On elongated valleys (badly scaled features), plain GD zig-zags across the narrow direction while creeping along the long one, which is why scaling matters.`,
      r`<strong>Stochastic</strong> and <strong>mini-batch</strong> GD estimate the gradient from a few examples: noisier, but far cheaper per step. <strong>Momentum</strong> accumulates a velocity that damps the zig-zag. <strong>RMSprop</strong> divides each coordinate’s step by a running average of its squared gradients, so steep directions take smaller steps. <strong>Adam</strong> combines both with bias correction, and is the default for neural networks.`,
    ],
    analogy: r`Finding the bottom of a foggy valley by feeling the slope under your feet and taking a step downhill, again and again.`,
    steps: [r`Initialise parameters.`, r`Compute the gradient of the cost on all data (batch), one example (SGD) or a mini-batch.`, r`Update parameters by a step against the gradient (with momentum/adaptive scaling if used).`, r`Repeat until the improvement is negligible or a validation metric stops improving.`],
    math: [
      { h: 'Vanilla update', tex: r`$$\theta_{t+1} = \theta_t - \eta\,\nabla_\theta J(\theta_t)$$`, p: r`For a convex quadratic with largest curvature $L$, any $\eta < 2/L$ converges; $\eta = 1/L$ is a safe choice.` },
      { h: 'Momentum', tex: r`$$v_{t+1} = \beta v_t + \nabla J(\theta_t), \qquad \theta_{t+1} = \theta_t - \eta\,v_{t+1}$$`, p: r`$\beta \approx 0.9$: gradients that keep pointing the same way build speed; oscillating ones cancel.` },
      { h: 'Adam', tex: r`$$m_t = \beta_1m_{t-1} + (1-\beta_1)g_t,\;\; v_t = \beta_2v_{t-1} + (1-\beta_2)g_t^2,\;\; \theta_{t+1} = \theta_t - \eta\frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon}$$`, p: r`$\hat m_t, \hat v_t$ are bias-corrected by dividing by $1 - \beta^t$. Defaults: $\beta_1 = 0.9$, $\beta_2 = 0.999$.` },
    ],
    keyPoints: [r`The learning rate is the single most important knob; tune it on a log scale.`, r`Scale features: GD on elongated contours zig-zags.`, r`SGD noise is a feature: it helps escape poor regions and regularises.`],
    code: r`import numpy as np

def gd(X, y, lr=0.1, epochs=200, batch=None, seed=0):
    rng, w = np.random.default_rng(seed), np.zeros(X.shape[1])
    for _ in range(epochs):
        idx = rng.permutation(len(y))
        for start in range(0, len(y), batch or len(y)):
            b = idx[start:start + (batch or len(y))]
            grad = 2 * X[b].T @ (X[b] @ w - y[b]) / len(b)    # gradient of MSE
            w -= lr * grad
    return w

X = np.c_[np.ones(100), np.random.default_rng(1).normal(size=100)]
y = X @ np.array([1.0, 3.0]) + np.random.default_rng(2).normal(scale=0.3, size=100)
print(gd(X, y), gd(X, y, batch=8, lr=0.05))`,
    pitfalls: [r`Comparing optimisers at their default learning rates; tune each one.`, r`Forgetting to shuffle data between epochs with SGD.`, r`Stopping on training loss instead of validation loss.`],
    quiz: [
      { q: r`Your loss explodes after a few steps. The most likely fix is:`, o: [r`More epochs`, r`A smaller learning rate`, r`A larger batch only`, r`Removing the bias`], a: 1, why: r`Steps larger than about $2/L$ overshoot and diverge.` },
      { q: r`What does momentum mainly help with?`, o: [r`Choosing the batch size`, r`Damping oscillations and speeding progress along consistent directions`, r`Avoiding the need for gradients`, r`Regularisation`], a: 1, why: r`The velocity averages gradients over time; alternating components cancel.` },
      { q: r`Adam divides each parameter’s step by:`, o: [r`The learning rate`, r`The square root of a running average of its squared gradients`, r`The number of examples`, r`The previous step size`], a: 1, why: r`That per-parameter scaling is the adaptive part.` },
    ],
    usedBy: ['logistic_regression', 'mlp_classifier', 'mlp_regressor', 'perceptron', 'gradient_boosting_regressor'],
    prereq: ['loss-functions'],
    related: ['quasi-newton-and-lbfgs', 'cost-vs-loss-vs-error'],
    labIntro: r`A loss surface with a long, narrow valley. Click anywhere to place the starting point, pick an optimiser and press <em>Run</em>. The right panel tracks the loss.`,
    tryThis: [r`Plain GD at a high learning rate zig-zags across the valley. Add momentum and compare.`, r`Find the learning rate where plain GD starts to diverge.`, r`Race Adam against GD from the same start.`],
    keywords: 'gradient descent sgd mini batch momentum rmsprop adam learning rate optimisation',
  },
  {
    id: 'quasi-newton-and-lbfgs', short: 'Newton, BFGS & L-BFGS', title: 'Second-Order Optimisation: Newton, BFGS and L-BFGS',
    task: 'concepts', module: 'Learning as optimisation', level: 3, minutes: 18,
    summary: r`Use curvature, not just slope, to choose the step. Newton is fast but expensive; quasi-Newton methods approximate it cheaply.`,
    lead: r`Gradient descent only knows the slope. Newton’s method also uses the curvature (the Hessian), so on a bowl-shaped function it jumps straight to the bottom. Quasi-Newton methods like BFGS and L-BFGS build up an approximation of the curvature from successive gradients.`,
    intuition: [
      r`In a long, narrow valley, the right step is long along the valley and short across it. The Hessian encodes exactly this: inverting it rescales the gradient so every direction is equally easy. Newton converges in a handful of iterations near the optimum (quadratically).`,
      r`The catch is cost: a Hessian has $p^2$ entries and inverting it costs $p^3$. BFGS keeps an approximation of the inverse Hessian and updates it from how the gradient changed after each step. L-BFGS goes further and stores only the last $m$ (say 10) pairs of changes, so memory is $O(mp)$. That is why it is scikit-learn’s default solver for logistic regression.`,
    ],
    analogy: r`Gradient descent feels the slope underfoot; Newton also knows how the slope is changing, so it can guess where the bottom is and jump there.`,
    steps: [r`Compute the gradient $g_t$.`, r`Newton: solve $H_t d = -g_t$. Quasi-Newton: $d = -B_t^{-1}g_t$ using the current approximation.`, r`Line search along $d$ for a step that sufficiently decreases the loss.`, r`Update the curvature approximation from $s_t = \theta_{t+1} - \theta_t$ and $y_t = g_{t+1} - g_t$.`],
    math: [
      { h: 'Newton step', tex: r`$$\theta_{t+1} = \theta_t - H(\theta_t)^{-1}\nabla J(\theta_t)$$`, p: r`Exact for quadratics in one step. Needs $H$ to be positive definite to be a descent direction.` },
      { h: 'Secant condition and BFGS update', tex: r`$$B_{t+1}s_t = y_t, \qquad B_{t+1} = B_t - \frac{B_ts_ts_t^\top B_t}{s_t^\top B_ts_t} + \frac{y_ty_t^\top}{y_t^\top s_t}$$`, p: r`The approximation is corrected so it reproduces the gradient change actually observed along the last step.` },
    ],
    keyPoints: [r`Second-order methods need far fewer iterations, each more expensive.`, r`L-BFGS suits smooth, deterministic, medium-sized problems (logistic regression, CRFs).`, r`For huge data and mini-batches, first-order methods (SGD, Adam) win.`],
    code: r`import numpy as np
from scipy.optimize import minimize

def rosen(t): return (1 - t[0]) ** 2 + 100 * (t[1] - t[0] ** 2) ** 2
def grad(t): return np.array([-2 * (1 - t[0]) - 400 * t[0] * (t[1] - t[0] ** 2), 200 * (t[1] - t[0] ** 2)])

for method in ["CG", "BFGS", "L-BFGS-B"]:
    res = minimize(rosen, x0=[-1.2, 1.0], jac=grad, method=method)
    print(method, res.nit, "iterations ->", res.x.round(4))`,
    pitfalls: [r`Using L-BFGS with mini-batches; its curvature estimates need consistent gradients.`, r`Expecting Newton to work from far away on non-convex functions without safeguards.`],
    quiz: [
      { q: r`Why is L-BFGS practical where Newton’s method is not?`, o: [r`It avoids gradients`, r`It stores only a few recent gradient changes instead of a full $p\times p$ Hessian`, r`It uses random steps`, r`It needs no line search`], a: 1, why: r`Memory and compute stay linear in $p$.` },
      { q: r`On a convex quadratic, Newton’s method converges in:`, o: [r`One step`, r`About $p$ steps`, r`Many steps`, r`Never`], a: 0, why: r`The quadratic model is exact, so the Newton step lands on the minimum.` },
    ],
    usedBy: ['logistic_regression', 'gaussian_process_regressor'],
    prereq: ['gradient-descent'],
    related: ['gradient-descent', 'maximum-likelihood-estimation'],
    labIntro: r`The Rosenbrock "banana" function, a classic stress test. Compare the paths of gradient descent, Newton’s method and BFGS from the same start.`,
    tryThis: [r`Count iterations to reach the minimum for each method.`, r`Move the start point to the far side of the banana and watch GD crawl along the curved valley.`],
    keywords: 'newton method bfgs lbfgs quasi newton hessian curvature optimisation',
  },
  {
    id: 'maximum-likelihood-estimation', short: 'Maximum likelihood', title: 'Maximum Likelihood Estimation',
    task: 'concepts', module: 'Learning as optimisation', level: 2, minutes: 18,
    summary: r`Choose the parameters under which the observed data is most probable. Where most loss functions come from.`,
    lead: r`Maximum likelihood estimation (MLE) asks: of all possible parameter values, which one makes the data we actually observed most probable? Many familiar losses are just negative log-likelihoods in disguise.`,
    intuition: [
      r`Flip a coin 10 times and see 7 heads. If the coin’s bias were $p = 0.5$, that outcome has probability 0.117; if $p = 0.7$, it is 0.267, the highest of any $p$. So the MLE is $\hat p = 0.7$: the observed frequency.`,
      r`We maximise the <em>log</em>-likelihood because products of many small probabilities underflow, and logs turn products into sums without moving the maximum. Assume Gaussian noise and the negative log-likelihood becomes squared error, so OLS is MLE. Assume Bernoulli labels and you get log-loss, so [[logistic_regression]] is MLE.`,
    ],
    analogy: r`A detective choosing the explanation that makes the evidence least surprising.`,
    steps: [r`Write down a probability model $p(x \mid \theta)$ for one observation.`, r`Assume independence: the likelihood is the product over observations.`, r`Take logs: the log-likelihood is a sum.`, r`Maximise it, analytically (set derivative to zero) or numerically (gradient-based).`],
    math: [
      { h: 'Likelihood and log-likelihood', tex: r`$$L(\theta) = \prod_{i=1}^n p(x_i \mid \theta), \qquad \ell(\theta) = \sum_{i=1}^n\log p(x_i \mid \theta)$$`, p: r`$\hat\theta_{\text{MLE}} = \arg\max_\theta\ell(\theta)$.` },
      { h: 'Bernoulli example', tex: r`$$\ell(p) = k\log p + (n - k)\log(1 - p), \qquad \frac{d\ell}{dp} = \frac kp - \frac{n-k}{1-p} = 0 \;\Rightarrow\; \hat p = \frac kn$$`, p: r`The MLE is the sample proportion. Its negative per-example version is exactly binary cross-entropy.` },
      { h: 'Gaussian noise gives least squares', tex: r`$$y_i = x_i^\top\beta + \varepsilon_i,\;\varepsilon_i \sim \mathcal N(0, \sigma^2) \;\Rightarrow\; -\ell(\beta) = \frac{1}{2\sigma^2}\sum_i(y_i - x_i^\top\beta)^2 + \text{const}$$`, p: r`Maximising likelihood is minimising squared error.` },
    ],
    keyPoints: [r`MLE is consistent and efficient for large samples, but can overfit small ones (7/10 heads is not strong evidence of a biased coin).`, r`Adding a prior and maximising the posterior (MAP) gives regularisation.`, r`Choosing a loss is choosing a noise model.`],
    code: r`import numpy as np
from scipy.optimize import minimize_scalar

flips = np.array([1, 1, 0, 1, 1, 1, 0, 1, 0, 1])        # 7 heads out of 10
nll = lambda p: -(flips.sum() * np.log(p) + (len(flips) - flips.sum()) * np.log(1 - p))
res = minimize_scalar(nll, bounds=(1e-6, 1 - 1e-6), method="bounded")
print("numerical MLE:", round(res.x, 4), "closed form:", flips.mean())`,
    pitfalls: [r`Treating the MLE from a tiny sample as reliable.`, r`Forgetting the independence assumption behind the product.`],
    quiz: [
      { q: r`Why maximise the log-likelihood instead of the likelihood?`, o: [r`It gives a different answer`, r`Logs turn products into sums and avoid numerical underflow, without moving the maximum`, r`It is required by the data`, r`It adds regularisation`], a: 1, why: r`$\log$ is monotonic, so the arg max is unchanged.` },
      { q: r`Minimising binary cross-entropy is equivalent to:`, o: [r`MLE under a Gaussian model`, r`MLE under a Bernoulli model`, r`Minimising MAE`, r`Bayesian inference with a flat prior over functions`], a: 1, why: r`Cross-entropy is the negative Bernoulli log-likelihood per example.` },
    ],
    usedBy: ['logistic_regression', 'gaussian_mixture_models', 'gaussian_naive_bayes', 'bayesian_linear_regression'],
    prereq: ['loss-functions'],
    related: ['log-odds', 'sigmoid-and-link-functions'],
    labIntro: r`Flip a virtual coin. The curve is the log-likelihood of every possible bias $p$; its peak is the MLE.`,
    tryThis: [r`Flip 5 times, then 100 times: the peak sharpens as evidence accumulates.`, r`Drag the probe to $p = 0.5$ and compare its log-likelihood with the peak.`],
    keywords: 'maximum likelihood estimation mle log likelihood bernoulli gaussian',
  },
  // ------------------------------------------------------------------ generalisation
  {
    id: 'bias-variance-tradeoff', short: 'Bias–variance trade-off', title: 'The Bias–Variance Trade-off',
    task: 'concepts', module: 'Generalisation', level: 1, minutes: 18,
    summary: r`Test error = bias² + variance + noise. Too simple underfits, too flexible overfits; the art is finding the middle.`,
    lead: r`A model’s expected error on new data splits into three parts: bias (systematic error from wrong assumptions), variance (sensitivity to the particular training sample) and irreducible noise. Making a model more flexible lowers bias and raises variance.`,
    intuition: [
      r`Train the same model on many different samples of the same size. If the average prediction is far from the truth, that is bias: a straight line cannot follow a curve no matter how much data you give it. If individual predictions scatter widely around their average, that is variance: a degree-15 polynomial bends differently for every sample.`,
      r`Every regularisation knob in this curriculum (depth of a tree, $k$ in k-NN, $\lambda$ in ridge, number of boosting rounds) slides along this trade-off. Ensembles attack it directly: bagging averages away variance, boosting chips away at bias.`,
    ],
    analogy: r`Darts: bias is aiming at the wrong spot; variance is a shaky hand. You want neither.`,
    steps: [r`Diagnose: compare training and validation error.`, r`High bias (both high, close together): add features, use a more flexible model, reduce regularisation.`, r`High variance (training low, validation much higher): get more data, regularise, simplify, ensemble.`, r`Tune complexity with cross-validation.`],
    math: [
      { h: 'Decomposition for squared error', tex: r`$$\mathbb E\big[(y - \hat f(x))^2\big] = \underbrace{\big(\mathbb E[\hat f(x)] - f(x)\big)^2}_{\text{bias}^2} + \underbrace{\mathbb E\big[(\hat f(x) - \mathbb E[\hat f(x)])^2\big]}_{\text{variance}} + \underbrace{\sigma^2}_{\text{noise}}$$`, p: r`Expectations are over training sets drawn from the same distribution. The noise term sets a floor no model can beat.` },
    ],
    keyPoints: [r`Training error alone tells you nothing about variance.`, r`More data reduces variance, not bias.`, r`Modern over-parameterised models can show "double descent", but the classical trade-off still guides everyday tuning.`],
    code: r`import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0); x_test = np.linspace(0, 1, 50)[:, None]; truth = np.sin(2 * np.pi * x_test).ravel()
for degree in [1, 4, 12]:
    preds = []
    for _ in range(200):                                   # many training sets
        x = rng.uniform(0, 1, (25, 1)); y = np.sin(2 * np.pi * x).ravel() + rng.normal(0, .3, 25)
        preds.append(make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(x, y).predict(x_test))
    preds = np.array(preds)
    print(degree, "bias2=%.3f var=%.3f" % (((preds.mean(0) - truth) ** 2).mean(), preds.var(0).mean()))`,
    pitfalls: [r`Fighting a bias problem with more data.`, r`Concluding "the model is bad" from one train/test split when variance is high.`],
    quiz: [
      {
        q: r`Training error 2%, validation error 25%. The problem is mostly:`,
        o: [
          r`Bias`,
          r`Variance`,
          r`Noise`,
          r`Data leakage`,
        ],
        a: 1,
        why: r`The model fits the training data but does not generalise.`,
        d: 1,
      },
      {
        q: r`Which change reduces variance?`,
        o: [
          r`Deeper trees`,
          r`Bagging (averaging many models)`,
          r`Lowering regularisation`,
          r`Adding polynomial features`,
        ],
        a: 1,
        why: r`Averaging reduces the spread of predictions across training samples.`,
        d: 1,
      },
      {
        q: r`What is "irreducible error" ($\sigma^2$) in the bias–variance decomposition?`,
        o: [
          r`The variance introduced when features are not standardised before training`,
          r`The training error of a fully grown decision tree`,
          r`The inherent noise in the data-generating process or measurement that no model, regardless of complexity or training data size, can predict`,
          r`The error caused by choosing gradient descent instead of Newton's method`,
        ],
        a: 2,
        why: r`Irreducible error represents unobserved variables, inherent randomness, and measurement noise in the true system. It represents the absolute theoretical lower bound on expected test loss.`,
        d: 1,
      },
      {
        q: r`If both training error and validation error are high and close to each other (e.g. 35% and 36%), which diagnosis and remedy are most appropriate?`,
        o: [
          r`High bias (underfitting); increase model capacity, add relevant features, or decrease regularisation`,
          r`High variance (overfitting); collect more training data or increase regularisation`,
          r`Data leakage; remove the most predictive feature`,
          r`Label noise; drop 50% of the training rows`,
        ],
        a: 0,
        why: r`When training error is high, the model lacks the expressiveness or features to capture the underlying pattern. This is high bias (underfitting). Collecting more data will not help a model that cannot fit the training data.`,
        d: 1,
      },
      {
        q: r`Why does collecting more training data help resolve high variance, but fail to resolve high bias?`,
        o: [
          r`More data automatically adds non-linear polynomial features to the model`,
          r`More data averages out sample-specific noise and pins down parameters firmly, but it cannot expand the representational capacity of an overly rigid model (e.g. a linear model fitting a cubic curve)`,
          r`More data shrinks the irreducible noise term $\sigma^2$ to zero`,
          r`Collecting more data is only effective when using deep neural networks`,
        ],
        a: 1,
        why: r`Variance stems from estimating parameters on a finite sample; larger datasets make parameter estimates more stable. Bias stems from structural model assumptions: a straight line cannot bend to fit a parabola regardless of whether you train on 100 points or 10 million points.`,
        d: 2,
      },
      {
        q: r`How does changing the number of neighbours $k$ in a $k$-Nearest Neighbours ($k$-NN) classifier alter the bias–variance trade-off?`,
        o: [
          r`Small $k$ has high bias and low variance; large $k$ has low bias and high variance`,
          r`Changing $k$ only changes the irreducible error $\sigma^2$`,
          r`$k$-NN has constant bias and variance regardless of $k$`,
          r`Small $k$ (e.g. $k = 1$) creates complex, jagged decision boundaries with low bias and high variance; large $k$ smooths predictions by averaging over large neighbourhoods, increasing bias and reducing variance`,
        ],
        a: 3,
        why: r`At $k = 1$, the decision boundary tightly wraps around every individual training point (100% training accuracy, extreme variance). As $k$ grows, the boundary becomes smoother and simpler, trading flexibility (higher bias) for stability (lower variance).`,
        d: 2,
      },
      {
        q: r`In ensemble learning, what is the fundamental difference in how Bagging (e.g. Random Forest) and Boosting (e.g. AdaBoost) affect the bias–variance trade-off?`,
        o: [
          r`Bagging primarily reduces variance by averaging decorrelated, high-variance trees; Boosting primarily reduces bias by sequentially training weak learners to correct previous residuals`,
          r`Bagging reduces bias, whereas Boosting reduces variance`,
          r`Both Bagging and Boosting only reduce the irreducible noise $\sigma^2$`,
          r`Bagging increases both bias and variance simultaneously`,
        ],
        a: 0,
        why: r`Bagging trains independent deep trees and averages their predictions, which cancels out random sample noise (variance reduction). Boosting fits sequential shallow trees to unexplained errors, progressively lowering bias.`,
        d: 2,
      },
      {
        q: r`When increasing the regularisation hyperparameter $\lambda$ from $0.001$ to $1{,}000$ in Ridge regression, how do bias and variance behave?`,
        o: [
          r`Bias decreases while variance increases`,
          r`Both bias and variance increase simultaneously`,
          r`Bias increases while variance decreases`,
          r`Both bias and variance decrease simultaneously`,
        ],
        a: 2,
        why: r`Stronger regularisation constrains weights towards zero, restricting model flexibility. This makes predictions more stable across training sets (lower variance) at the cost of being less capable of fitting the true relationship (higher bias).`,
        d: 2,
      },
      {
        q: r`What is the phenomenon of "double descent" observed in modern over-parameterised machine learning models?`,
        o: [
          r`As model capacity increases past the interpolation threshold (where training error reaches zero), test error can peak and then decrease again as regularisation or inductive bias kicks in`,
          r`Test error decreases twice during training before diverging to infinity`,
          r`Both training and validation error drop to zero simultaneously in two epochs`,
          r`A model requires exactly two gradient descent passes over the dataset`,
        ],
        a: 0,
        why: r`Classically, increasing capacity past the point of zero training error causes explosive variance. In modern deep learning and kernel methods, extreme over-parameterisation can lead to an implicit minimum-norm fit that smooths predictions, causing test error to decrease again after the interpolation peak.`,
        d: 2,
      },
      {
        q: r`Suppose the true function is $f(x) = 10.0$ and irreducible noise is $\sigma^2 = 2.0$. An estimator evaluated at $x$ across many training sets has expected prediction $\mathbb{E}[\hat{f}(x)] = 8.0$ and variance $\operatorname{Var}(\hat{f}(x)) = 5.0$. What is the expected test Mean Squared Error $\mathbb{E}[(y - \hat{f}(x))^2]$?`,
        o: [
          r`$7.0$`,
          r`$11.0$`,
          r`$15.0$`,
          r`$29.0$`,
        ],
        a: 1,
        why: r`$\text{Bias} = \mathbb{E}[\hat{f}(x)] - f(x) = 8.0 - 10.0 = -2.0$. Squared bias $= (-2.0)^2 = 4.0$. By the bias–variance decomposition: $\mathbb{E}[(y - \hat{f}(x))^2] = \text{Bias}^2 + \text{Variance} + \sigma^2 = 4.0 + 5.0 + 2.0 = 11.0$.`,
        d: 3,
      },
      {
        q: r`An ensemble averages the predictions of $B = 4$ identical, unbiased estimators $\hat{f}_1, \dots, \hat{f}_4$. Each individual estimator has variance $\operatorname{Var}(\hat{f}_i) = 12.0$, and the pairwise correlation between estimators is $\rho = 0.25$. Using $\operatorname{Var}(\bar{f}) = \rho \sigma^2 + \frac{1 - \rho}{B}\sigma^2$, what is the ensemble variance?`,
        o: [
          r`$3.0$`,
          r`$5.25$`,
          r`$6.0$`,
          r`$12.0$`,
        ],
        a: 1,
        why: r`$\operatorname{Var}(\bar{f}) = \rho \sigma^2 + \frac{1 - \rho}{B}\sigma^2 = 0.25(12.0) + \frac{1 - 0.25}{4}(12.0) = 3.0 + \frac{0.75}{4}(12.0) = 3.0 + 0.1875(12.0) = 3.0 + 2.25 = 5.25$. Averaging reduces variance from $12.0$ down to $5.25$.`,
        d: 3,
      },
      {
        q: r`You evaluate a model on a training set of 500 rows and a validation set of 100 rows. With degree 1 (linear), training MSE is 45 and validation MSE is 46. With degree 10, training MSE is 4 and validation MSE is 120. With degree 3 with L2 regularisation, training MSE is 18 and validation MSE is 22. What are the dominant error sources for degrees 1 and 10?`,
        o: [
          r`Degree 1 is dominated by variance; degree 10 is dominated by bias`,
          r`Both degrees 1 and 10 are dominated by irreducible noise`,
          r`Both degrees 1 and 10 suffer from data leakage`,
          r`Degree 1 is dominated by bias; degree 10 is dominated by variance; degree 3 achieves the best trade-off`,
        ],
        a: 3,
        why: r`For degree 1, training error is high and matches validation error (45 vs 46), characteristic of underfitting (high bias). For degree 10, training error drops to 4 while validation explodes to 120 (gap of 116), characteristic of overfitting (high variance). Regularised degree 3 strikes the optimal compromise.`,
        d: 3,
      },
    ],
    usedBy: ['polynomial_regression', 'knn_regressor', 'random_forest_regressor', 'decision_tree_regressor'],
    prereq: ['regression-metrics'],
    related: ['regularization', 'cross-validation'],
    labIntro: r`Twenty training sets drawn from the same noisy sine wave, each fitted with the degree you choose. The faint lines are the twenty fits; the bright line is their average.`,
    tryThis: [r`Degree 1: the fits agree with each other but miss the curve (bias).`, r`Degree 12: the average is close to the truth but individual fits scatter wildly (variance).`, r`Find the degree where bias² + variance is smallest.`],
    keywords: 'bias variance tradeoff overfitting underfitting complexity decomposition',
  },
  {
    id: 'regularization', short: 'Regularisation', title: 'Regularisation: L1, L2 and Beyond',
    task: 'concepts', module: 'Generalisation', level: 2, minutes: 18,
    summary: r`Penalising complexity so models generalise. L2 shrinks, L1 selects, and early stopping, dropout and pruning do the same job.`,
    lead: r`Regularisation adds a cost for complexity to the training objective. The model then has to justify every bit of flexibility with a real improvement in fit, which keeps it from memorising noise.`,
    intuition: [
      r`<strong>L2</strong> (ridge, weight decay) adds $\lambda\lVert w\rVert_2^2$: weights shrink smoothly toward zero, and correlated features share the load. <strong>L1</strong> (lasso) adds $\lambda\lVert w\rVert_1$: weights hit exactly zero, so it selects features. The geometry explains the difference: the L1 ball has corners on the axes, the L2 ball is round.`,
      r`Many other techniques are regularisation in disguise: limiting tree depth, pruning, early stopping, dropout, data augmentation, and averaging models. Each one restricts how much the model can adapt to the training sample.`,
    ],
    analogy: r`A spending limit on complexity: the model may only buy flexibility it can pay for with genuinely better predictions.`,
    steps: [r`Standardise features so the penalty is fair.`, r`Choose the penalty type (L2 by default, L1 for selection, both for elastic net).`, r`Tune $\lambda$ on a log grid with cross-validation.`, r`Never penalise the intercept.`],
    math: [
      { h: 'Penalised objective', tex: r`$$\min_w \;\frac1n\sum_i\ell(y_i, w^\top x_i) + \lambda\,\Omega(w), \qquad \Omega_{L2} = \lVert w\rVert_2^2, \;\; \Omega_{L1} = \lVert w\rVert_1$$`, p: r`Equivalently, minimise the loss subject to $\Omega(w) \le t$: a constraint region in weight space.` },
      { h: 'Bayesian view', tex: r`$$\text{L2} \leftrightarrow w_j \sim \mathcal N(0, \tau^2), \qquad \text{L1} \leftrightarrow w_j \sim \text{Laplace}(0, b)$$`, p: r`The penalised solution is the MAP estimate under these priors. The Laplace prior’s sharp peak at zero is why L1 produces exact zeros.` },
    ],
    keyPoints: [r`Regularisation trades a little bias for a lot less variance.`, r`Always tune its strength with validation data.`, r`Scale matters: unscaled features make the penalty arbitrary.`],
    code: r`import numpy as np
from sklearn.linear_model import Ridge, Lasso
from sklearn.preprocessing import StandardScaler

Xs = StandardScaler().fit_transform(X_tr)
for lam in [0.001, 0.1, 1, 10]:
    r, l = Ridge(alpha=lam).fit(Xs, y_tr), Lasso(alpha=lam / 10, max_iter=10000).fit(Xs, y_tr)
    print(lam, "ridge |w|=%.2f" % np.abs(r.coef_).sum(), "lasso nonzero=%d" % (l.coef_ != 0).sum())`,
    pitfalls: [r`Penalising without scaling features first.`, r`Tuning λ on the test set.`],
    quiz: [
      {
        q: r`Which penalty can set weights exactly to zero?`,
        o: [
          r`L2`,
          r`L1`,
          r`Both`,
          r`Neither`,
        ],
        a: 1,
        why: r`The L1 constraint region has corners on the axes.`,
        d: 1,
      },
      {
        q: r`Early stopping in gradient descent acts like:`,
        o: [
          r`More data`,
          r`A form of regularisation`,
          r`A larger learning rate`,
          r`Feature selection`,
        ],
        a: 1,
        why: r`It limits how far weights move from their initialisation, similar to an L2 penalty.`,
        d: 1,
      },
      {
        q: r`Why must the intercept (bias term $w_0$) NOT be penalised in regularised regression?`,
        o: [
          r`Penalising the intercept makes the objective function non-convex`,
          r`The intercept always has zero gradient in gradient descent`,
          r`The intercept reflects the baseline average of the target; penalising it forces the model predictions towards zero even if the true target mean is $1{,}000{,}000$`,
          r`Scikit-learn crashes with a LinAlgError if the intercept is regularised`,
        ],
        a: 2,
        why: r`The intercept merely centres the regression plane at the target mean. Penalising it shifts predictions towards zero without providing any protection against overfitting feature slopes.`,
        d: 1,
      },
      {
        q: r`Why is feature standardisation (e.g. using StandardScaler) mandatory before applying L1 or L2 regularisation?`,
        o: [
          r`Without standardisation, features measured in larger units have smaller coefficients and escape penalisation, while features in smaller units receive unfairly harsh penalties`,
          r`Standardisation ensures that all features have strictly positive values`,
          r`Matrix inversion fails if features have non-zero means`,
          r`L1 regularisation cannot compute absolute values on unstandardised numbers`,
        ],
        a: 0,
        why: r`If feature 1 is in metres ($w_1 = 1$) and feature 2 is in millimetres ($w_2 = 0.001$), the penalty $\lambda w_1^2 = \lambda$ penalises feature 1 a million times more than feature 2 despite measuring the exact same physical quantity.`,
        d: 1,
      },
      {
        q: r`Geometric intuition: why does the L1 penalty (Lasso) set coefficients exactly to zero, while the L2 penalty (Ridge) only shrinks them smoothly?`,
        o: [
          r`The L1 penalty uses a non-convex optimisation algorithm that drops features randomly`,
          r`The L1 norm constraint region $\{\lVert w\rVert_1 \le t\}$ has sharp vertices located on the coordinate axes where contours of the loss function naturally intersect first, setting coordinates to zero`,
          r`The L2 ball has sharp corners on the coordinate axes that prevent sparsity`,
          r`L1 regularisation requires computing matrix eigenvalues`,
        ],
        a: 1,
        why: r`The diamond-shaped $L_1$ ball has sharp corners where one or more coordinates are zero. As smooth elliptical loss contours expand from the unconstrained OLS minimum, they almost always touch an $L_1$ vertex first.`,
        d: 2,
      },
      {
        q: r`From a Bayesian perspective, L2 regularisation (Ridge) corresponds to Maximum A Posteriori (MAP) estimation under which prior distribution on the weights?`,
        o: [
          r`A uniform prior over the interval $[-1, 1]$`,
          r`A Laplace prior centered at zero`,
          r`A Poisson distribution`,
          r`A zero-mean Gaussian (normal) prior $w_j \sim \mathcal{N}(0, \tau^2)$`,
        ],
        a: 3,
        why: r`Under a Gaussian prior $p(w) \propto \exp\left(-\frac{\lVert w\rVert_2^2}{2\tau^2}\right)$, taking the negative logarithm yields $\frac{1}{2\tau^2}\lVert w\rVert_2^2$, which is identical to the L2 penalty with $\lambda = 1/\tau^2$.`,
        d: 2,
      },
      {
        q: r`When two input features $X_1$ and $X_2$ are strongly collinear, how do L1 (Lasso) and L2 (Ridge) regularisation handle them differently?`,
        o: [
          r`Ridge tends to shrink their coefficients equally and share the weight between them, whereas Lasso tends to arbitrarily pick one feature and force the other to zero`,
          r`Lasso retains both features with equal weights, while Ridge zeroes out both features`,
          r`Ridge always sets one feature to zero, while Lasso retains both`,
          r`Both penalties cause the weights to diverge to infinity`,
        ],
        a: 0,
        why: r`The quadratic $L_2$ penalty prefers two moderate weights over one large weight (since $1^2 + 1^2 = 2 < 2^2 + 0^2 = 4$). The linear $L_1$ penalty has no preference between $(1, 1)$ and $(2, 0)$, so numerical noise leads it to pick one arbitrarily.`,
        d: 2,
      },
      {
        q: r`What is Elastic Net regularisation, and when is it preferred over pure Lasso?`,
        o: [
          r`It applies regularisation only to the first principal component`,
          r`It combines decision trees with linear models to avoid overfitting`,
          r`It linearly combines both L1 and L2 penalties ($\lambda_1 \lVert w\rVert_1 + \lambda_2 \lVert w\rVert_2^2$); it is preferred when there are groups of correlated features, allowing feature selection while retaining grouped predictive variables together`,
          r`It sets all weights strictly to either $+1$ or $-1$`,
        ],
        a: 2,
        why: r`Pure Lasso struggles with multicollinear groups by selecting one at random. Elastic Net's L2 component encourages grouped selection (correlated features enter together), while its L1 component maintains overall sparsity.`,
        d: 2,
      },
      {
        q: r`How does Dropout in deep neural networks act as a form of regularisation?`,
        o: [
          r`By randomly deactivating a fraction of neurons during each training pass, it prevents co-adaptation of features and approximates training an ensemble of exponentially many subnetworks`,
          r`By setting the learning rate to zero for 50% of the epochs`,
          r`By pruning 50% of the input data rows`,
          r`By forcing the network weights to follow a Laplace distribution`,
        ],
        a: 0,
        why: r`Dropout prevents neurons from relying on idiosyncratic co-dependencies with specific neighbours. Each iteration trains a thinned network, and testing averages their collective behaviour.`,
        d: 2,
      },
      {
        q: r`For a 2D weight vector $w = [3.0, -4.0]$, what are the L1 norm $\lVert w\rVert_1$, the L2 norm squared $\lVert w\rVert_2^2$, and the Elastic Net penalty with $\lambda_1 = 2.0$ and $\lambda_2 = 0.5$ ($\Omega(w) = \lambda_1 \lVert w\rVert_1 + \lambda_2 \lVert w\rVert_2^2$)?`,
        o: [
          r`$\lVert w\rVert_1 = 5.0$, $\lVert w\rVert_2^2 = 25.0$, and total penalty $= 22.5$`,
          r`$\lVert w\rVert_1 = 7.0$, $\lVert w\rVert_2^2 = 25.0$, and total penalty $= 26.5$`,
          r`$\lVert w\rVert_1 = 7.0$, $\lVert w\rVert_2^2 = 49.0$, and total penalty $= 38.5$`,
          r`$\lVert w\rVert_1 = 1.0$, $\lVert w\rVert_2^2 = 7.0$, and total penalty $= 5.5$`,
        ],
        a: 1,
        why: r`$\lVert w\rVert_1 = |3.0| + |-4.0| = 3.0 + 4.0 = 7.0$. $\lVert w\rVert_2^2 = 3.0^2 + (-4.0)^2 = 9.0 + 16.0 = 25.0$. Elastic Net penalty $= \lambda_1 \lVert w\rVert_1 + \lambda_2 \lVert w\rVert_2^2 = 2.0(7.0) + 0.5(25.0) = 14.0 + 12.5 = 26.5$.`,
        d: 3,
      },
      {
        q: r`In coordinate descent for Lasso regression with orthonormal features, the update rule uses the soft-thresholding operator $S_\lambda(\hat{w}) = \operatorname{sign}(\hat{w})\max(0, |\hat{w}| - \lambda)$. If the unregularised OLS coefficients are $\hat{w}_1 = 2.50$ and $\hat{w}_2 = -0.60$, what are their Lasso estimates when penalty threshold is $\lambda = 1.00$?`,
        o: [
          r`$w_1 = 1.50$ and $w_2 = 0.00$`,
          r`$w_1 = 1.50$ and $w_2 = -0.60$`,
          r`$w_1 = 2.50$ and $w_2 = 0.00$`,
          r`$w_1 = 0.50$ and $w_2 = -1.60$`,
        ],
        a: 0,
        why: r`For $\hat{w}_1 = 2.50$: $|\hat{w}_1| = 2.50 > 1.00$, so $S_1(2.50) = \operatorname{sign}(2.50)(2.50 - 1.00) = +1.50$. For $\hat{w}_2 = -0.60$: $|\hat{w}_2| = 0.60 \le 1.00$, so $\max(0, 0.60 - 1.00) = 0$, giving $S_1(-0.60) = 0.00$. The parameter whose unregularised magnitude is smaller than $\lambda$ is truncated exactly to zero.`,
        d: 3,
      },
      {
        q: r`In a 1D linear regression with orthonormal data ($x^\top x = 1$), the OLS estimate is $\hat{w}_{\text{OLS}} = 6.0$. In Ridge regression, the estimate is $\hat{w}_{\text{Ridge}} = \frac{\hat{w}_{\text{OLS}}}{1 + \lambda}$. If $\lambda = 2.0$, what is the Ridge estimate, and by what percentage is the OLS weight shrunk?`,
        o: [
          r`$\hat{w}_{\text{Ridge}} = 3.0$, shrunk by $50.0\%$`,
          r`$\hat{w}_{\text{Ridge}} = 4.0$, shrunk by $33.3\%$`,
          r`$\hat{w}_{\text{Ridge}} = 1.0$, shrunk by $83.3\%$`,
          r`$\hat{w}_{\text{Ridge}} = 2.0$, shrunk by $66.7\%$`,
        ],
        a: 3,
        why: r`$\hat{w}_{\text{Ridge}} = \frac{6.0}{1 + 2.0} = \frac{6.0}{3.0} = 2.0$. The weight is reduced from $6.0$ to $2.0$, a drop of $4.0$, which corresponds to a shrinkage of $\frac{4.0}{6.0} = \frac{2}{3} \approx 66.7\%$.`,
        d: 3,
      },
    ],
    usedBy: ['ridge_regression', 'lasso_regression', 'elastic_net', 'xgboost_regressor', 'mlp_classifier'],
    prereq: ['bias-variance-tradeoff'],
    related: ['bias-variance-tradeoff', 'feature-selection'],
    labIntro: r`Two weights, one loss. The ellipses are the loss contours; the shaded shape is the penalty’s constraint region. The solution is where they first touch.`,
    tryThis: [r`With L1, shrink the budget until the solution lands on a corner: one weight becomes exactly 0.`, r`Switch to L2 with the same budget: both weights shrink, neither hits zero.`],
    keywords: 'regularization l1 l2 ridge lasso weight decay dropout early stopping penalty',
  },
  {
    id: 'cross-validation', short: 'Cross-validation', title: 'Cross-Validation',
    task: 'concepts', module: 'Generalisation', level: 1, minutes: 16,
    summary: r`Estimate how a model will do on new data by rotating which part of the data is held out. The honest way to tune.`,
    lead: r`K-fold cross-validation splits the data into $K$ folds, trains on $K-1$ and validates on the remaining one, rotating through all $K$. The average score estimates performance on unseen data; the spread tells you how much to trust it.`,
    intuition: [
      r`One train/validation split gives one noisy number: a lucky split flatters the model. Rotating the hold-out uses every row for validation exactly once and averages the luck away. With $K = 5$ or $10$, each model trains on 80–90% of the data, so the estimate is only slightly pessimistic.`,
      r`The split must mimic how the model will be used. Stratify by class for imbalanced classification. Group by entity (customer, patient) when rows from one entity are correlated. Respect time order for forecasting: never train on the future.`,
    ],
    analogy: r`Instead of one exam, a student sits five exams, each made of questions they did not practise on, and the average grade is recorded.`,
    steps: [r`Hold out a final test set and do not touch it.`, r`Split the rest into $K$ folds (stratified, grouped or time-ordered as appropriate).`, r`For each fold: fit everything (scaling, selection, the model) on the other folds, score on this one.`, r`Report the mean and standard deviation; pick hyperparameters by the mean.`, r`Refit on all non-test data and evaluate once on the test set.`],
    math: [
      { h: 'K-fold estimate', tex: r`$$\widehat{\text{Err}}_{\text{CV}} = \frac1K\sum_{k=1}^K\frac{1}{|F_k|}\sum_{i \in F_k}\ell\big(y_i, \hat f^{(-k)}(x_i)\big)$$`, p: r`$\hat f^{(-k)}$ is trained without fold $F_k$.` },
    ],
    keyPoints: [r`Every preprocessing step that learns from data must happen inside the CV loop (use pipelines).`, r`Nested CV (tuning inside, evaluation outside) is needed for an unbiased estimate of a tuned model.`, r`Time series need forward-chaining splits.`],
    code: r`from sklearn.model_selection import cross_validate, StratifiedKFold, TimeSeriesSplit, GroupKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))   # scaling inside CV
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_validate(model, X, y, cv=cv, scoring=["accuracy", "roc_auc"])
print({k: v.mean().round(3) for k, v in scores.items() if k.startswith("test_")})`,
    pitfalls: [r`Scaling or selecting features on all data before CV: leakage.`, r`Shuffled K-fold on time series.`, r`Random splits when the same customer appears in many rows.`],
    quiz: [
      {
        q: r`Why put the scaler inside the cross-validation pipeline?`,
        o: [
          r`It is faster`,
          r`So the validation fold’s statistics never influence training`,
          r`Scaling is optional`,
          r`To stratify classes`,
        ],
        a: 1,
        why: r`Fitting the scaler on all data leaks validation information.`,
        d: 1,
      },
      {
        q: r`For forecasting next month’s sales, which split is right?`,
        o: [
          r`Shuffled K-fold`,
          r`Stratified K-fold`,
          r`Forward-chaining time series split`,
          r`Leave-one-out`,
        ],
        a: 2,
        why: r`Training must only use data from before the validation period.`,
        d: 1,
      },
      {
        q: r`What is Stratified $K$-fold cross-validation, and when is it essential?`,
        o: [
          r`It splits the dataset so that each fold contains approximately the same percentage of each target class as the complete dataset; it is essential for imbalanced classification`,
          r`It splits data by sorting rows by date to prevent lookahead bias`,
          r`It clusters features into strata using $k$-means before training`,
          r`It trains on 100% of the data and validates on out-of-bag samples`,
        ],
        a: 0,
        why: r`In imbalanced datasets (e.g. 5% positive class), standard random splitting can produce folds with almost zero positive examples. Stratification guarantees representative class proportions across all folds.`,
        d: 1,
      },
      {
        q: r`What is Group $K$-fold cross-validation, and what kind of leakage does it prevent?`,
        o: [
          r`It groups continuous features into categorical bins before training`,
          r`It ensures all rows belonging to the same entity (e.g. medical patient or hospital) remain strictly in the same fold, preventing the model from memorising patient-specific traits to predict held-out records of that same patient`,
          r`It forces the model to train exclusively on group averages`,
          r`It prevents memory overflow during large batch gradient descent`,
        ],
        a: 1,
        why: r`If a patient has 20 medical records scattered across both train and validation folds, the model memorises patient-specific quirks rather than generalising pathology. GroupKFold keeps entire groups intact in either train or test.`,
        d: 1,
      },
      {
        q: r`Why is Nested Cross-Validation used when tuning hyperparameters?`,
        o: [
          r`To speed up grid search by skipping 50% of the hyperparameter combinations`,
          r`To eliminate the need for an independent test set entirely`,
          r`To produce an unbiased estimate of model performance: the inner loop tunes hyperparameters, while the outer loop evaluates the generalisation error of the tuned model on untouched validation folds`,
          r`To convert a regression model into a classification model`,
        ],
        a: 2,
        why: r`If you tune hyperparameters on the same CV folds used to report performance, you pick the configuration that got lucky on those folds, producing an optimistically biased score. Nested CV decouples tuning from evaluation.`,
        d: 2,
      },
      {
        q: r`What is the main theoretical drawback of Leave-One-Out Cross-Validation (LOOCV, where $K = n$) compared to 5-fold or 10-fold CV?`,
        o: [
          r`LOOCV has higher bias than 5-fold CV`,
          r`LOOCV can only be used on linear models`,
          r`LOOCV requires all target labels to be continuous`,
          r`The $n$ training sets are almost identical (each sharing $n-2$ examples), causing the validation errors to be strongly positively correlated, which can yield a higher variance estimate of test error despite low bias`,
        ],
        a: 3,
        why: r`In LOOCV, each of the $n$ models is trained on $(n-1)/n$ of the data. Because the models are nearly identical, their test errors are highly correlated. The variance of the mean of correlated variables is higher than that of less correlated folds in 10-fold CV.`,
        d: 2,
      },
      {
        q: r`After completing $K$-fold cross-validation and choosing the optimal hyperparameters, what is the standard next step before deploying the model?`,
        o: [
          r`Refit the model with the chosen hyperparameters on the entire dataset (all $K$ folds combined)`,
          r`Deploy the model from whichever individual fold achieved the highest validation score`,
          r`Average the weight vectors of the $K$ separate models arithmetically`,
          r`Discard the hyperparameters and retrain with default settings`,
        ],
        a: 0,
        why: r`Cross-validation serves to evaluate the modelling process and select hyperparameters. Once chosen, refitting on 100% of the non-test data uses all available information, producing the best final model for production.`,
        d: 2,
      },
      {
        q: r`What is the "one-standard-error rule" (1-SE rule) often used when selecting hyperparameters in cross-validation?`,
        o: [
          r`Reject any model whose training error is more than one standard error above zero`,
          r`Choose the simplest or most parsimonious model whose mean CV score is within one standard error of the best-performing model's mean score`,
          r`Multiply the chosen regularisation penalty $\lambda$ by the standard error of the folds`,
          r`Select the model with the largest standard error across folds`,
        ],
        a: 1,
        why: r`The best numerical score often overfits fold noise slightly. The 1-SE rule (Breiman et al.) prefers the simpler, more regularised model whose performance is statistically indistinguishable from the absolute peak.`,
        d: 2,
      },
      {
        q: r`Why does applying a standard shuffled $K$-fold cross-validation to chronological time series data (e.g. daily stock prices) produce invalid results?`,
        o: [
          r`Shuffled K-fold cannot handle floating-point date stamps`,
          r`Time series data cannot be evaluated with Mean Squared Error`,
          r`It causes temporal leakage: future data is shuffled into the training set and used to predict past validation samples, creating unrealistically high validation accuracy that fails completely in real-world deployment`,
          r`The number of folds $K$ must be equal to the number of months in the year`,
        ],
        a: 2,
        why: r`Autocorrelated time series let future points leak information backward. A model that knows tomorrow's price can trivially interpolate today's price. Rolling-origin / forward-chaining splits are required.`,
        d: 2,
      },
      {
        q: r`In a 5-fold cross-validation on a regression dataset of $n = 500$ samples, how many samples are in the training set and validation set for each fold?`,
        o: [
          r`Training: $400$ samples; Validation: $100$ samples`,
          r`Training: $450$ samples; Validation: $50$ samples`,
          r`Training: $250$ samples; Validation: $250$ samples`,
          r`Training: $100$ samples; Validation: $400$ samples`,
        ],
        a: 0,
        why: r`Each fold holds out $1/K = 1/5 = 20\%$ of the data for validation ($500 / 5 = 100$ samples) and trains on the remaining $(K-1)/K = 4/5 = 80\%$ ($4 \times 100 = 400$ samples).`,
        d: 3,
      },
      {
        q: r`A 5-fold cross-validation produces accuracy scores across the five folds of: $[0.80, 0.82, 0.85, 0.84, 0.89]$. What are the mean cross-validation accuracy and the sample variance $s^2 = \frac{1}{K-1}\sum (x_i - \bar{x})^2$?`,
        o: [
          r`Mean $= 0.840$ and sample variance $s^2 = 0.00440$`,
          r`Mean $= 0.840$ and sample variance $s^2 = 0.00115$`,
          r`Mean $= 0.850$ and sample variance $s^2 = 0.00150$`,
          r`Mean $= 0.820$ and sample variance $s^2 = 0.00220$`,
        ],
        a: 1,
        why: r`Sum $= 0.80 + 0.82 + 0.85 + 0.84 + 0.89 = 4.20$. Mean $\bar{x} = 4.20 / 5 = 0.840$. Deviations: $[-0.04, -0.02, +0.01, 0.00, +0.05]$. Squared deviations: $[0.0016, 0.0004, 0.0001, 0.0000, 0.0025]$. Sum of squared deviations $= 0.0046$. Sample variance $s^2 = 0.0046 / (5 - 1) = 0.0046 / 4 = 0.00115$.`,
        d: 3,
      },
      {
        q: r`You perform nested cross-validation with 5 outer folds and 4 inner folds to evaluate a grid of 6 hyperparameter combinations. How many total model fits are executed across the entire nested cross-validation process?`,
        o: [
          r`$20$ fits`,
          r`$30$ fits`,
          r`$24$ fits`,
          r`$120$ fits`,
        ],
        a: 3,
        why: r`For each of the 5 outer folds, the inner cross-validation evaluates all 6 hyperparameter settings across 4 inner folds ($6 \times 4 = 24$ fits). Across all 5 outer folds, this requires $5 \times 24 = 120$ inner fits.`,
        d: 3,
      },
    ],
    usedBy: ['polynomial_regression', 'ridge_regression', 'stacking_voting_classifiers', 'knn_classifier'],
    prereq: ['bias-variance-tradeoff'],
    related: ['bias-variance-tradeoff', 'feature-selection'],
    labIntro: r`Each row is one round of K-fold cross-validation: violet blocks train, cyan blocks validate. Scores come from a real model trained on synthetic data in your browser.`,
    tryThis: [r`Compare K = 2 and K = 10: the mean is similar, the spread changes.`, r`Switch to time-series split and see how the training window only ever grows forward.`],
    keywords: 'cross validation k fold stratified group time series nested leakage',
  },
  // ------------------------------------------------------------------ probability for classifiers
  {
    id: 'log-odds', short: 'Log-odds (logit)', title: 'Odds and Log-Odds (the Logit)',
    task: 'concepts', module: 'Probability for classifiers', level: 1, minutes: 12,
    summary: r`Probability, odds and log-odds are three views of the same number. Log-odds is the scale on which logistic regression is linear.`,
    lead: r`A probability of 0.8 is odds of 4 to 1 and log-odds of $\ln 4 \approx 1.39$. Log-odds stretch the 0–1 range of probability onto the whole real line, which is what makes a linear model of probabilities possible.`,
    intuition: [
      r`Probabilities are cramped near 0 and 1: going from 0.98 to 0.99 is a big change in certainty but looks tiny. Odds $p/(1-p)$ spread the upper end out to infinity. Taking the log makes the scale symmetric: $p = 0.5$ maps to 0, $p = 0.9$ to $+2.2$, $p = 0.1$ to $-2.2$.`,
      r`On the log-odds scale, independent pieces of evidence <em>add</em>. That is why [[logistic_regression]] models log-odds as a weighted sum and why its coefficients read as "each unit adds $w$ to the log-odds, multiplying the odds by $e^w$".`,
    ],
    analogy: r`A betting slip: "4 to 1 on" is odds; log-odds is the same bet on a scale where evidence for and against simply adds up.`,
    steps: [r`Probability: $p \in [0, 1]$.`, r`Odds: $p / (1 - p) \in [0, \infty)$.`, r`Log-odds (logit): $\log\frac{p}{1-p} \in (-\infty, \infty)$.`, r`Invert with the sigmoid: $p = 1/(1 + e^{-z})$.`],
    math: [
      { h: 'The logit and its inverse', tex: r`$$z = \operatorname{logit}(p) = \log\frac{p}{1 - p}, \qquad p = \sigma(z) = \frac{1}{1 + e^{-z}}$$`, p: r`Each is the inverse of the other.` },
      { h: 'Odds ratio', tex: r`$$\frac{\text{odds}(x_j + 1)}{\text{odds}(x_j)} = e^{w_j}$$`, p: r`In logistic regression, a coefficient of 0.69 doubles the odds ($e^{0.69} \approx 2$).` },
    ],
    keyPoints: [r`Log-odds is symmetric around 0 (p = 0.5).`, r`Evidence adds on the log-odds scale.`, r`Odds ratios, not probability differences, are constant per unit in logistic regression.`],
    code: r`import numpy as np
p = np.array([0.1, 0.5, 0.8, 0.99])
odds = p / (1 - p)
logit = np.log(odds)
back = 1 / (1 + np.exp(-logit))
print(np.c_[p, odds.round(2), logit.round(2), back])`,
    pitfalls: [r`Reading a logistic coefficient as a change in probability. It is a change in log-odds; the probability change depends on where you start.`],
    quiz: [
      {
        q: r`What are the log-odds of $p = 0.5$?`,
        o: [
          r`0.5`,
          r`1`,
          r`0`,
          r`−1`,
        ],
        a: 2,
        why: r`Odds are 1, and $\log 1 = 0$.`,
        d: 1,
      },
      {
        q: r`A log-odds increase of $\ln 3$ means the odds:`,
        o: [
          r`Increase by 3`,
          r`Triple`,
          r`Increase by 3 percentage points`,
          r`Fall by a third`,
        ],
        a: 1,
        why: r`Adding $\ln 3$ to log-odds multiplies odds by 3.`,
        d: 2,
      },
      {
        q: r`What is the range of the logit (log-odds) function $\operatorname{logit}(p) = \ln\left(\frac{p}{1 - p}\right)$ for probability $p \in (0, 1)$?`,
        o: [
          r`The open interval $(0, 1)$`,
          r`The non-negative real numbers $[0, \infty)$`,
          r`The entire real line $(-\infty, \infty)$`,
          r`The interval $[-1, 1]$`,
        ],
        a: 2,
        why: r`As $p \to 0$, $p/(1-p) \to 0$ and $\ln(p/(1-p)) \to -\infty$. As $p \to 1$, $p/(1-p) \to \infty$ and $\ln(p/(1-p)) \to +\infty$. Mapping $(0, 1)$ to $(-\infty, \infty)$ allows linear models to output unbounded real scores without violating probability bounds.`,
        d: 1,
      },
      {
        q: r`If an event has a probability of $p = 0.80$, what are the odds of the event occurring?`,
        o: [
          r`$4.0$ (or 4 to 1)`,
          r`$0.80$`,
          r`$1.25$`,
          r`$0.20$`,
        ],
        a: 0,
        why: r`$\text{Odds} = \frac{p}{1 - p} = \frac{0.80}{1 - 0.80} = \frac{0.80}{0.20} = 4.0$. For every 1 time the event fails to occur, it occurs 4 times.`,
        d: 1,
      },
      {
        q: r`How do the log-odds of complementary probabilities $p$ and $1 - p$ relate to each other?`,
        o: [
          r`$\operatorname{logit}(1 - p) = 1 / \operatorname{logit}(p)$`,
          r`$\operatorname{logit}(1 - p) = -\operatorname{logit}(p)$: they are exact negatives, symmetrically mirrored around zero`,
          r`$\operatorname{logit}(1 - p) = 1 - \operatorname{logit}(p)$`,
          r`$\operatorname{logit}(1 - p) = \operatorname{logit}(p)^2$`,
        ],
        a: 1,
        why: r`$\operatorname{logit}(1 - p) = \ln\left(\frac{1 - p}{1 - (1 - p)}\right) = \ln\left(\frac{1 - p}{p}\right) = -\ln\left(\frac{p}{1 - p}\right) = -\operatorname{logit}(p)$.`,
        d: 1,
      },
      {
        q: r`If the odds of a horse winning a race are given as $3$ (that is, 3 to 1 in favour), what is the probability that the horse wins?`,
        o: [
          r`$0.333$`,
          r`$0.667$`,
          r`$0.750$`,
          r`$3.000$`,
        ],
        a: 2,
        why: r`To convert odds to probability: $p = \frac{\text{odds}}{1 + \text{odds}} = \frac{3}{1 + 3} = \frac{3}{4} = 0.750$ (or 75%). A common mistake is dividing by the odds ($1/3$) rather than odds $+ 1$.`,
        d: 2,
      },
      {
        q: r`In a logistic regression model, feature $x_1$ has a coefficient of $w_1 = -0.693$ (where $e^{-0.693} \approx 0.50$). For each 1-unit increase in $x_1$ (holding other features constant), what happens to the odds of the positive outcome?`,
        o: [
          r`The odds are halved (multiplied by $0.50$)`,
          r`The odds decrease by 0.693 percentage points`,
          r`The probability decreases by 50 percentage points`,
          r`The log-odds are halved`,
        ],
        a: 0,
        why: r`In logistic regression, coefficients represent changes in log-odds. Adding $-0.693$ to the log-odds multiplies the odds by $e^{-0.693} \approx 0.50$, effectively halving the odds.`,
        d: 2,
      },
      {
        q: r`Why does a constant 1-unit increase in a feature $x_j$ NOT produce a constant percentage-point increase in probability in logistic regression?`,
        o: [
          r`Because probabilities cannot be exponentiated`,
          r`Because the regularisation penalty changes for every row`,
          r`Because scikit-learn standardises probabilities to sum to zero`,
          r`Because the logistic sigmoid is non-linear (S-shaped): the change in probability per unit of log-odds is steepest at $p = 0.50$ (slope $0.25$) and flattens out towards zero near $p = 0$ or $p = 1$`,
        ],
        a: 3,
        why: r`Logistic regression is linear in log-odds, but probability is passed through the sigmoid. Adding $+1$ to log-odds moves $p$ from $0.50$ to $0.73$ ($+23$ points), but moving from $p = 0.98$ to $p = 0.99$ requires a much larger log-odds jump.`,
        d: 2,
      },
      {
        q: r`How does Bayes' theorem naturally simplify when expressed on the log-odds scale?`,
        o: [
          r`The likelihood ratio becomes zero`,
          r`$\ln(\text{posterior odds}) = \ln(\text{prior odds}) + \ln(\text{likelihood ratio})$: independent evidence terms add linearly rather than multiplying`,
          r`Posterior odds always equal prior odds`,
          r`The prior probability must equal $0.50$`,
        ],
        a: 1,
        why: r`Bayes' rule in odds form is $\frac{P(A \mid B)}{P(\neg A \mid B)} = \frac{P(A)}{P(\neg A)} \times \frac{P(B \mid A)}{P(B \mid \neg A)}$. Taking logarithms turns multiplication into addition, showing why linear models add evidence terms directly in log-odds space.`,
        d: 2,
      },
      {
        q: r`A patient has a baseline predicted probability of disease of $p = 0.20$ (baseline odds $= 0.20 / 0.80 = 0.25$). A clinical test has a positive likelihood ratio of $8.0$. Using the odds formulation of Bayes' rule, what are the updated posterior odds and the updated posterior probability of disease?`,
        o: [
          r`Posterior odds $= 2.0$, and posterior probability $= 2/3 \approx 66.7\%$`,
          r`Posterior odds $= 1.6$, and posterior probability $= 80.0\%$`,
          r`Posterior odds $= 2.0$, and posterior probability $= 50.0\%$`,
          r`Posterior odds $= 0.32$, and posterior probability $= 24.2\%$`,
        ],
        a: 0,
        why: r`$\text{Posterior odds} = \text{prior odds} \times \text{likelihood ratio} = 0.25 \times 8.0 = 2.0$ (or 2 to 1 in favour). Converting back to probability: $p = \frac{\text{odds}}{1 + \text{odds}} = \frac{2.0}{1 + 2.0} = \frac{2}{3} \approx 0.6667 = 66.7\%$.`,
        d: 3,
      },
      {
        q: r`For a logistic regression model with intercept $w_0 = -1.0$ and single coefficient $w_1 = 0.50$, what is the predicted probability $p$ for an observation with input $x = 2.0$?`,
        o: [
          r`$p = 0.00$`,
          r`$p = 0.731$`,
          r`$p = 0.50$`,
          r`$p = 0.269$`,
        ],
        a: 2,
        why: r`Log-odds score $z = w_0 + w_1 x = -1.0 + 0.50(2.0) = -1.0 + 1.0 = 0.0$. Applying the sigmoid function: $p = \sigma(0) = \frac{1}{1 + e^0} = \frac{1}{1 + 1} = \frac{1}{2} = 0.50$.`,
        d: 3,
      },
      {
        q: r`A logistic regression model has two features with weights $w_1 = \ln(2) \approx 0.6931$ and $w_2 = \ln(3) \approx 1.0986$, and intercept $w_0 = 0$. If an instance has $x_1 = 1$ and $x_2 = 1$, what are the exact odds and the exact probability $P(y=1)$?`,
        o: [
          r`$\text{Odds} = 6.0$, and probability $= 6/7 \approx 85.7\%$`,
          r`$\text{Odds} = 5.0$, and probability $= 5/6 \approx 83.3\%$`,
          r`$\text{Odds} = 6.0$, and probability $= 60.0\%$`,
          r`$\text{Odds} = 2.5$, and probability $= 2.5 / 3.5 \approx 71.4\%$`,
        ],
        a: 0,
        why: r`Log-odds $z = w_0 + w_1 x_1 + w_2 x_2 = 0 + \ln(2) + \ln(3) = \ln(2 \times 3) = \ln(6)$. Exponentiating to get odds: $\text{odds} = e^{\ln(6)} = 6.0$. Converting to probability: $p = \frac{\text{odds}}{1 + \text{odds}} = \frac{6}{1 + 6} = \frac{6}{7} \approx 0.8571 = 85.7\%$.`,
        d: 3,
      },
    ],
    usedBy: ['logistic_regression', 'gradient_boosted_classifiers', 'multinomial_bernoulli_nb'],
    prereq: [],
    related: ['sigmoid-and-link-functions', 'maximum-likelihood-estimation'],
    labIntro: r`Three linked scales. Drag the marker on any one of them and the other two follow.`,
    tryThis: [r`Move probability from 0.9 to 0.99 and watch log-odds jump.`, r`Add +1 to log-odds starting from 0, then from 3: compare the probability changes.`],
    keywords: 'log odds logit odds ratio probability scale',
  },
  {
    id: 'sigmoid-and-link-functions', short: 'Sigmoid & link functions', title: 'The Sigmoid and Other Link Functions',
    task: 'concepts', module: 'Probability for classifiers', level: 2, minutes: 14,
    summary: r`Functions that map an unbounded linear score to a valid prediction: sigmoid, softmax, probit, log, and the activations of neural nets.`,
    lead: r`A linear model produces a score $z$ anywhere on the real line. A link function connects that score to the kind of quantity you are predicting: a probability (sigmoid, probit), a count (exponential) or a set of class probabilities (softmax).`,
    intuition: [
      r`In generalised linear models (GLMs), $g(\mathbb E[y]) = w^\top x$: the link $g$ is chosen so the linear predictor lives on an unbounded scale. Logistic regression uses the logit link (inverse: sigmoid). Poisson regression uses the log link (inverse: exponential) so counts stay positive.`,
      r`The sigmoid saturates: for large $|z|$ its slope $\sigma(z)(1 - \sigma(z))$ is nearly zero. That is fine at a model’s output with the right loss, but stacked in hidden layers it starves gradients, which is why neural nets moved to ReLU. Softmax generalises the sigmoid to many classes.`,
    ],
    analogy: r`An adapter plug: the linear model always speaks "real numbers"; the link converts that into the socket the target needs.`,
    steps: [r`Decide the target type: binary, multi-class, count, positive real.`, r`Pick the canonical link: logit, softmax, log, identity.`, r`Train with the matching loss (log-loss, cross-entropy, Poisson deviance, squared error).`],
    math: [
      { h: 'Sigmoid and its derivative', tex: r`$$\sigma(z) = \frac{1}{1 + e^{-z}}, \qquad \sigma'(z) = \sigma(z)\big(1 - \sigma(z)\big) \le \tfrac14$$`, p: r`The maximum slope is 0.25, at $z = 0$.` },
      { h: 'Softmax', tex: r`$$\operatorname{softmax}(z)_c = \frac{e^{z_c}}{\sum_{c'}e^{z_{c'}}}$$`, p: r`With two classes, softmax reduces to the sigmoid of the difference of the scores.` },
      { h: 'Probit', tex: r`$$p = \Phi(z) = \int_{-\infty}^z\frac{1}{\sqrt{2\pi}}e^{-t^2/2}\,dt$$`, p: r`Uses the normal CDF instead; very similar to the sigmoid with $z$ scaled by about 1.7.` },
    ],
    keyPoints: [r`Pair each link with its matching loss for convex, well-behaved training.`, r`Sigmoid in hidden layers causes vanishing gradients; ReLU fixed that.`, r`Temperature (dividing $z$ by $T$) sharpens or softens a sigmoid or softmax.`],
    code: r`import numpy as np
z = np.linspace(-6, 6, 7)
sigmoid = 1 / (1 + np.exp(-z))
tanh = np.tanh(z)
logits = np.array([2.0, 1.0, 0.1])
softmax = np.exp(logits - logits.max()); softmax /= softmax.sum()      # subtract max for stability
print(sigmoid.round(3), tanh.round(3), softmax.round(3))`,
    pitfalls: [r`Computing softmax without subtracting the max: overflow.`, r`Using sigmoid activations in deep hidden layers.`],
    quiz: [
      {
        q: r`What is the maximum slope of the sigmoid?`,
        o: [
          r`1`,
          r`0.5`,
          r`0.25`,
          r`Unbounded`,
        ],
        a: 2,
        why: r`$\sigma(0)(1 - \sigma(0)) = 0.5 \times 0.5$.`,
        d: 1,
      },
      {
        q: r`Which link keeps predicted counts positive in Poisson regression?`,
        o: [
          r`Identity`,
          r`Log (inverse: exp)`,
          r`Logit`,
          r`Probit`,
        ],
        a: 1,
        why: r`$\mathbb E[y] = e^{w^\top x} > 0$ for any score.`,
        d: 1,
      },
      {
        q: r`What is the fundamental purpose of a "link function" in Generalised Linear Models (GLMs)?`,
        o: [
          r`It maps the expected value of the target distribution from its constrained domain (such as probabilities in $(0, 1)$ or counts in $(0, \infty)$) to the unbounded real line $(-\infty, \infty)$ where the linear predictor operates`,
          r`It connects neural network layers without using matrix multiplication`,
          r`It joins separate SQL tables before training an estimator`,
          r`It normalises feature variances to exactly 1.0`,
        ],
        a: 0,
        why: r`In GLMs, the linear combination $w^\top x$ can evaluate to any real number in $(-\infty, \infty)$. The link function $g(\mu) = w^\top x$ transforms the parameter $\mu = \mathbb{E}[y \mid x]$ so that predictions respect the natural bounds of the response distribution.`,
        d: 1,
      },
      {
        q: r`Why did deep neural networks largely replace sigmoid activation functions in hidden layers with Rectified Linear Units (ReLU)?`,
        o: [
          r`The sigmoid function cannot be computed on GPUs`,
          r`The sigmoid activation function is non-deterministic`,
          r`The sigmoid's derivative saturates near 0 for inputs far from zero ($|z| \gg 0$) and has a maximum value of only $0.25$, causing gradients to vanish exponentially across successive backpropagation layers`,
          r`The sigmoid requires 100 times more memory than ReLU`,
        ],
        a: 2,
        why: r`Because $\sigma'(z) \le 0.25$, multiplying through $L$ hidden layers scales gradients by at most $(0.25)^L$. By layer 10, gradients shrink by a factor of $10^{-6}$ (vanishing gradient). ReLU's derivative is 1 for positive inputs, eliminating saturation.`,
        d: 1,
      },
      {
        q: r`When computing the softmax function $\operatorname{softmax}(z)_c = \frac{e^{z_c}}{\sum_{j} e^{z_j}}$ on a vector like $z = [1000, 1001, 1002]$, what computational problem occurs, and how is it resolved?`,
        o: [
          r`The denominator becomes zero; resolved by adding a large positive constant to $z$`,
          r`$e^{1000}$ triggers floating-point overflow; subtracting the maximum value $m = \max(z)$ from every element before exponentiating ($\frac{e^{z_c - m}}{\sum e^{z_j - m}}$) yields identical results with zero overflow risk`,
          r`The probabilities do not sum to 1.0; resolved by dividing by $N$`,
          r`The exponential function converts negative numbers to NaN; resolved by taking absolute values`,
        ],
        a: 1,
        why: r`In IEEE 754 float64, $e^{710} = \infty$. Computing $\exp(1000)$ gives infinity, causing invalid arithmetic. Because shifting logits by $\max(z)$ leaves the softmax ratio unchanged, subtracting $\max(z)$ guarantees that the maximum exponent is $e^0 = 1$, preventing overflow.`,
        d: 2,
      },
      {
        q: r`How does temperature scaling $T > 0$ affect the softmax probability distribution $\operatorname{softmax}(z / T)$?`,
        o: [
          r`As $T \to \infty$, it becomes an argmax distribution; as $T \to 0$, it becomes uniform`,
          r`Temperature scales the learning rate during backpropagation`,
          r`Temperature changes the number of classes in the output layer`,
          r`As $T \to \infty$, the distribution flattens into a uniform distribution; as $T \to 0$, it sharpens towards a one-hot distribution (argmax)`,
        ],
        a: 3,
        why: r`Dividing by large $T$ compresses logits toward zero ($z/T \approx 0$), making all exponentials $e^0 = 1$ and yielding uniform probabilities ($1/K$). Dividing by small $T \to 0$ magnifies logit differences, so the largest logit dominates completely.`,
        d: 2,
      },
      {
        q: r`How does the Probit link function $p = \Phi(w^\top x)$ differ from the Logit link function $p = \sigma(w^\top x)$ in binary classification?`,
        o: [
          r`Probit uses the standard normal cumulative distribution function (CDF) $\Phi(z)$ instead of the logistic function; its tails decay faster, but its shape is very close to a sigmoid with inputs rescaled by $\approx 1.7$`,
          r`Probit can only be used for multi-class classification`,
          r`Probit produces probabilities outside the interval $[0, 1]$`,
          r`Probit does not require computing integrals or exponentials`,
        ],
        a: 0,
        why: r`Probit models binary outcomes via a latent Gaussian variable: $y^* = w^\top x + \varepsilon$ with $\varepsilon \sim \mathcal{N}(0, 1)$, whereas logit corresponds to $\varepsilon$ following a standard logistic distribution. They produce near-identical decision boundaries up to a scale factor of $\approx 1.7$.`,
        d: 2,
      },
      {
        q: r`For a multi-class problem with $K = 2$ classes and logit outputs $z = [z_1, z_2]$, what does the softmax probability $\operatorname{softmax}(z)_1$ simplify to?`,
        o: [
          r`$\sigma(z_1 + z_2)$`,
          r`The standard logistic sigmoid of the score difference: $\sigma(z_1 - z_2)$`,
          r`$\frac{1}{2}(z_1 - z_2)$`,
          r`$\sigma(z_1) \times \sigma(z_2)$`,
        ],
        a: 1,
        why: r`$\operatorname{softmax}(z)_1 = \frac{e^{z_1}}{e^{z_1} + e^{z_2}} = \frac{e^{z_1}/e^{z_2}}{e^{z_1}/e^{z_2} + 1} = \frac{e^{z_1 - z_2}}{1 + e^{z_1 - z_2}} = \sigma(z_1 - z_2)$. Binary logistic regression is precisely the two-class case of softmax regression.`,
        d: 2,
      },
      {
        q: r`Why does Generalised Linear Model theory advise pairing each distribution family with its "canonical link" function (such as Bernoulli with logit, Poisson with log, Gaussian with identity)?`,
        o: [
          r`Canonical links eliminate the need for intercept terms`,
          r`Canonical links force the model residuals to equal exactly zero`,
          r`The canonical link ensures the Hessian matrix of the negative log-likelihood is positive semi-definite everywhere, guaranteeing a strictly convex optimisation problem with no sub-optimal local minima`,
          r`Canonical links ensure the model trains in a single epoch`,
        ],
        a: 2,
        why: r`The canonical link equates the linear predictor $w^\top x$ to the natural parameter of the exponential family distribution. This ensures that the log-likelihood is strictly concave in $w$, making gradient-based fitting reliably fast and globally optimal.`,
        d: 2,
      },
      {
        q: r`For a neuron with standard logistic sigmoid activation $\sigma(z) = \frac{1}{1 + e^{-z}}$, suppose the current output is $\sigma(z) = 0.80$. What is the exact value of the derivative $\sigma'(z)$?`,
        o: [
          r`$0.16$`,
          r`$0.25$`,
          r`$0.80$`,
          r`$0.04$`,
        ],
        a: 0,
        why: r`The derivative of the sigmoid is $\sigma'(z) = \sigma(z)(1 - \sigma(z))$. With $\sigma(z) = 0.80$, $\sigma'(z) = 0.80 \times (1 - 0.80) = 0.80 \times 0.20 = 0.16$.`,
        d: 3,
      },
      {
        q: r`A 3-class model outputs raw logits $z = [1.0, 2.0, 3.0]$. Using the numerically stable softmax formulation with $m = \max(z) = 3.0$, the shifted logits are $z - 3.0 = [-2.0, -1.0, 0.0]$. Given $e^{-2} \approx 0.1353$, $e^{-1} \approx 0.3679$, and $e^0 = 1.0$, what is the softmax probability of Class 3?`,
        o: [
          r`$0.500$ (or $50.0\%$)`,
          r`$0.665$ (or $66.5\%$)`,
          r`$0.750$ (or $75.0\%$)`,
          r`$0.333$ (or $33.3\%$)`,
        ],
        a: 1,
        why: r`The sum of exponentiated shifted logits is $S = e^{-2} + e^{-1} + e^0 \approx 0.1353 + 0.3679 + 1.0000 = 1.5032$. The probability for Class 3 is $\frac{e^0}{S} = \frac{1.0000}{1.5032} \approx 0.6652 = 66.5\%$.`,
        d: 3,
      },
      {
        q: r`In Poisson regression, the expected count is modelled as $\mu = \mathbb{E}[y \mid x] = e^{w_0 + w_1 x_1}$. If intercept $w_0 = 1.0$ and $w_1 = 0.6931$ (where $e^{0.6931} \approx 2.0$), what is the expected count $\mu$ when $x_1 = 2$? (Given $e \approx 2.718$).`,
        o: [
          r`$\mu = 2e \approx 5.44$`,
          r`$\mu = 2.386$`,
          r`$\mu = 8e \approx 21.75$`,
          r`$\mu = 4e \approx 10.87$`,
        ],
        a: 3,
        why: r`Linear predictor $\eta = w_0 + w_1 x_1 = 1.0 + 0.6931(2) = 1.0 + 2\ln(2) = 1.0 + \ln(4)$. Expected count $\mu = e^{1.0 + \ln(4)} = e^{1.0} \times e^{\ln(4)} = e \times 4 = 4e \approx 4 \times 2.71828 = 10.873$.`,
        d: 3,
      },
    ],
    usedBy: ['logistic_regression', 'mlp_classifier', 'lstm_networks', 'transformer_networks'],
    prereq: ['log-odds'],
    related: ['log-odds', 'loss-functions'],
    labIntro: r`Plot of the link (or activation) you choose, with its derivative. Slide the input and the temperature.`,
    tryThis: [r`At z = 6 the sigmoid’s slope is almost zero: this is gradient saturation.`, r`Lower the temperature: the curve becomes a step.`],
    keywords: 'sigmoid logistic softmax probit link function glm activation tanh relu',
  },
  // ------------------------------------------------------------------ evaluation
  {
    id: 'regression-metrics', short: 'Regression metrics', title: 'Regression Metrics: MAE, RMSE, R², MAPE',
    task: 'concepts', module: 'Evaluation', level: 1, minutes: 14,
    summary: r`How to score a regression model, and what each metric hides. Pick the one that matches the cost of being wrong.`,
    lead: r`MAE is the average absolute miss. RMSE is the square root of the average squared miss, so big misses count more. $R^2$ compares your errors with always predicting the mean. MAPE expresses errors as percentages.`,
    intuition: [
      r`If every miss costs the same per unit, report MAE. If large misses are disproportionately bad, RMSE. If you need a scale-free number to compare across datasets, $R^2$, but remember a high $R^2$ can still mean large absolute errors when $y$ varies a lot.`,
      r`MAPE is popular in business because percentages are intuitive, but it explodes when actual values are near zero and penalises over-forecasts more than under-forecasts. Weighted or symmetric versions (WAPE, sMAPE) are safer.`,
    ],
    analogy: r`Grading archers by average distance from the bullseye (MAE), by punishing wild shots extra (RMSE), or by how much better they are than someone aiming at the centre of the wall (R²).`,
    steps: [r`Decide what a unit of error costs, and whether big errors cost more.`, r`Pick a primary metric accordingly; report a second for context.`, r`Always compare against a naive baseline (mean, last value).`, r`Look at residual plots, not just one number.`],
    math: [
      { h: 'Definitions', tex: r`$$\mathrm{MAE} = \frac1n\sum|y_i - \hat y_i|, \;\; \mathrm{RMSE} = \sqrt{\frac1n\sum(y_i - \hat y_i)^2}, \;\; R^2 = 1 - \frac{\sum(y_i - \hat y_i)^2}{\sum(y_i - \bar y)^2}$$`, p: r`RMSE ≥ MAE always; a large gap means a few big errors.` },
      { h: 'MAPE and WAPE', tex: r`$$\mathrm{MAPE} = \frac{100}{n}\sum\Big|\frac{y_i - \hat y_i}{y_i}\Big|, \qquad \mathrm{WAPE} = 100\frac{\sum|y_i - \hat y_i|}{\sum|y_i|}$$`, p: r`WAPE weights errors by volume and does not blow up on small actuals.` },
    ],
    keyPoints: [r`$R^2$ can be negative on test data.`, r`RMSE and MAE are in the target’s units; $R^2$ and MAPE are unitless.`, r`The training loss and the reported metric need not be the same.`],
    code: r`import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error

y = np.array([100, 120, 90, 300, 110]); pred = np.array([105, 115, 100, 220, 112])
print("MAE", mean_absolute_error(y, pred), "RMSE", round(mean_squared_error(y, pred) ** .5, 2),
      "R2", round(r2_score(y, pred), 3), "MAPE", round(100 * mean_absolute_percentage_error(y, pred), 1))`,
    pitfalls: [r`Using MAPE when actuals can be zero or tiny.`, r`Celebrating a high $R^2$ without checking error size in real units.`],
    quiz: [
      {
        q: r`RMSE is much larger than MAE. This suggests:`,
        o: [
          r`The model is unbiased`,
          r`A few large errors dominate`,
          r`All errors are similar`,
          r`$R^2$ is negative`,
        ],
        a: 1,
        why: r`Squaring amplifies large errors; with equal errors RMSE = MAE.`,
        d: 1,
      },
      {
        q: r`Why is MAPE risky for intermittent demand?`,
        o: [
          r`It is too slow`,
          r`Division by actuals near zero blows it up`,
          r`It ignores large errors`,
          r`It is unitless`,
        ],
        a: 1,
        why: r`One week with demand 1 and forecast 5 contributes 400%.`,
        d: 1,
      },
      {
        q: r`What does the Coefficient of Determination ($R^2$) measure in regression?`,
        o: [
          r`The percentage of predictions that are within 5% of the true target value`,
          r`The probability that the regression coefficients are non-zero`,
          r`The proportion of variance in the dependent variable explained by the model relative to a naive baseline that always predicts the mean $\bar{y}$`,
          r`The ratio of training loss to validation loss`,
        ],
        a: 2,
        why: r`$R^2 = 1 - \frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}}$ compares the residual sum of squares against the total variance around the mean $\bar{y}$. An $R^2$ of $0.80$ means 80% of target variance is captured by the model.`,
        d: 1,
      },
      {
        q: r`Under what condition does Root Mean Squared Error (RMSE) equal Mean Absolute Error (MAE) exactly?`,
        o: [
          r`When all individual absolute prediction errors $|y_i - \hat{y}_i|$ are identical across all samples`,
          r`When the dataset has zero outliers`,
          r`When $R^2 = 1.0$`,
          r`When the target follows a standard normal distribution`,
        ],
        a: 0,
        why: r`By the Cauchy-Schwarz inequality, $\sqrt{\frac{1}{n}\sum e_i^2} \ge \frac{1}{n}\sum |e_i|$. Equality holds if and only if all $|e_i|$ are identical constants (e.g. every prediction misses by exactly 3.0 units).`,
        d: 1,
      },
      {
        q: r`Why can $R^2$ be negative when evaluated on unseen held-out test data?`,
        o: [
          r`Because $R^2$ is only defined between $-1$ and $+1$ like Pearson correlation`,
          r`If the model's test predictions have a higher residual sum of squares than simply predicting the training target mean $\bar{y}$, $\mathrm{SS}_{\text{res}} > \mathrm{SS}_{\text{tot}}$, driving $R^2 = 1 - \mathrm{SS}_{\text{res}}/\mathrm{SS}_{\text{tot}} < 0$`,
          r`Because test data always contains negative values`,
          r`A negative $R^2$ indicates that the learning rate was too high`,
        ],
        a: 1,
        why: r`A naive dummy baseline predicting $\bar{y}$ achieves $R^2 = 0$. If an overfitted model makes severe errors on test data such that $\mathrm{SS}_{\text{res}} > \mathrm{SS}_{\text{tot}}$, it performs worse than the flat mean, resulting in a negative $R^2$.`,
        d: 2,
      },
      {
        q: r`Why is Weighted Absolute Percentage Error ($\mathrm{WAPE} = 100 \frac{\sum |y_i - \hat{y}_i|}{\sum |y_i|}$) preferred over standard MAPE for retail inventory forecasting with intermittent demand?`,
        o: [
          r`WAPE squares errors to penalise stockouts more heavily`,
          r`WAPE is bounded strictly between 0% and 100%`,
          r`WAPE can only be computed when sales are strictly negative`,
          r`WAPE divides the total absolute error by total volume, avoiding catastrophic division by zero and preventing small actual values from distorting the overall metric`,
        ],
        a: 3,
        why: r`If actual sales on Tuesday are $y = 0$, MAPE divides by zero and fails. If sales are $y = 1$ and forecast is $4$, MAPE adds $300\%$. WAPE aggregates errors across all days before dividing by total sales, providing a robust, volume-weighted percentage.`,
        d: 2,
      },
      {
        q: r`A business stakeholder asks: "Can our regression model have an impressive $R^2 = 0.95$ and still be unacceptable for production deployment?" What is the correct response?`,
        o: [
          r`Yes: if the target variable has massive overall variance (e.g. house prices ranging from \$100k to \$10M), the unexplained 5% of variance can still translate to large absolute errors (e.g. RMSE of \$150k) that violate business requirements`,
          r`No: $R^2 = 0.95$ guarantees that 95% of predictions are within 1 unit of the actuals`,
          r`No: $R^2 \ge 0.90$ is mathematically guaranteed to meet all production criteria`,
          r`Yes: because $R^2$ ignores all positive errors`,
        ],
        a: 0,
        why: r`$R^2$ is a relative measure of variance explained, not an absolute error metric. A high $R^2$ on highly dispersed data can still conceal absolute errors that are unacceptable in real-world dollar terms.`,
        d: 2,
      },
      {
        q: r`What asymmetry bias is inherent in Mean Absolute Percentage Error (MAPE)?`,
        o: [
          r`Over-forecasting is capped at $50\%$, while under-forecasting is unbounded`,
          r`Under-forecasting is capped at a maximum error of $100\%$ (when $\hat{y} = 0$), whereas over-forecasting has no upper bound and can exceed $1{,}000\%$, systematically penalising over-prediction much more severely`,
          r`MAPE ignores errors when predictions are greater than actuals`,
          r`MAPE is only symmetric when actuals follow a Poisson distribution`,
        ],
        a: 1,
        why: r`For actual $y = 100$: if forecast is $\hat{y} = 0$, error is $|100 - 0| / 100 = 100\%$. But if forecast is $\hat{y} = 300$, error is $|100 - 300| / 100 = 200\%$. If forecast is $1000$, error is $900\%$. MAPE heavily punishes models that forecast above actuals.`,
        d: 2,
      },
      {
        q: r`You train two regression models on the same test set. Model A has $\mathrm{MAE} = 10.0$ and $\mathrm{RMSE} = 12.0$. Model B has $\mathrm{MAE} = 8.0$ and $\mathrm{RMSE} = 25.0$. If large individual prediction errors carry catastrophic commercial costs, which model should you choose?`,
        o: [
          r`Model B, because its MAE is 2.0 units lower`,
          r`Model B, because lower MAE always guarantees lower maximum error`,
          r`Model A, because its much lower RMSE ($12.0$ vs $25.0$) shows it avoids rare, severe large errors that dominate quadratic penalties`,
          r`Either model, as RMSE and MAE convey identical information`,
        ],
        a: 2,
        why: r`Model B has a lower median/average error on typical points (lower MAE), but its high RMSE ($25.0$) indicates it makes several huge, catastrophic blunders. When severe misses must be avoided, RMSE is the primary selection criterion.`,
        d: 2,
      },
      {
        q: r`A test set has $n = 4$ observations with actual values $y = [10, 20, 30, 40]$ and predictions $\hat{y} = [10, 22, 28, 44]$. What are the Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE)?`,
        o: [
          r`$\mathrm{MAE} = 2.0$ and $\mathrm{RMSE} \approx 2.45$`,
          r`$\mathrm{MAE} = 2.0$ and $\mathrm{RMSE} = 2.00$`,
          r`$\mathrm{MAE} = 8.0$ and $\mathrm{RMSE} = 6.00$`,
          r`$\mathrm{MAE} = 2.5$ and $\mathrm{RMSE} \approx 3.16$`,
        ],
        a: 0,
        why: r`Errors: $e_1 = 10 - 10 = 0$, $e_2 = 20 - 22 = -2$, $e_3 = 30 - 28 = 2$, $e_4 = 40 - 44 = -4$. Absolute errors: $[0, 2, 2, 4]$. $\mathrm{MAE} = (0 + 2 + 2 + 4) / 4 = 8 / 4 = 2.0$. Squared errors: $[0, 4, 4, 16]$. Mean squared error $= (0 + 4 + 4 + 16) / 4 = 24 / 4 = 6.0$. $\mathrm{RMSE} = \sqrt{6.0} \approx 2.449 \approx 2.45$.`,
        d: 3,
      },
      {
        q: r`For a test set of 3 samples, the true values are $y = [2, 4, 6]$ (mean $\bar{y} = 4.0$, total sum of squares $\mathrm{SS}_{\text{tot}} = (2-4)^2 + (4-4)^2 + (6-4)^2 = 4 + 0 + 4 = 8$). A flawed model predicts $\hat{y} = [6, 4, 2]$. What is the Coefficient of Determination ($R^2$) of this model?`,
        o: [
          r`$R^2 = 0.0$`,
          r`$R^2 = -3.0$`,
          r`$R^2 = 1.0$`,
          r`$R^2 = -1.0$`,
        ],
        a: 1,
        why: r`Residuals: $y - \hat{y} \in \{2 - 6, 4 - 4, 6 - 2\} = \{-4, 0, 4\}$. Squared residuals: $(-4)^2 + 0^2 + 4^2 = 16 + 0 + 16 = 32$. $\mathrm{SS}_{\text{res}} = 32$. Therefore $R^2 = 1 - \frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}} = 1 - \frac{32}{8} = 1 - 4.0 = -3.0$.`,
        d: 3,
      },
      {
        q: r`A forecast is evaluated across two periods: Period 1 has actual $y_1 = 100$ and prediction $\hat{y}_1 = 120$. Period 2 has actual $y_2 = 10$ and prediction $\hat{y}_2 = 15$. What are the Mean Absolute Percentage Error (MAPE) and the Weighted Absolute Percentage Error (WAPE)?`,
        o: [
          r`$\mathrm{MAPE} = 22.7\%$ and $\mathrm{WAPE} = 35.0\%$`,
          r`$\mathrm{MAPE} = 25.0\%$ and $\mathrm{WAPE} = 25.0\%$`,
          r`$\mathrm{MAPE} = 70.0\%$ and $\mathrm{WAPE} \approx 45.5\%$`,
          r`$\mathrm{MAPE} = 35.0\%$ and $\mathrm{WAPE} \approx 22.7\%$`,
        ],
        a: 3,
        why: r`Percentage errors: Period 1: $\frac{|100 - 120|}{100} = \frac{20}{100} = 20.0\%$. Period 2: $\frac{|10 - 15|}{10} = \frac{5}{10} = 50.0\%$. $\mathrm{MAPE} = \frac{20.0\% + 50.0\%}{2} = 35.0\%$. Total absolute errors $= 20 + 5 = 25$. Total actuals $= 100 + 10 = 110$. $\mathrm{WAPE} = 100 \times \frac{25}{110} \approx 22.727\% \approx 22.7\%$.`,
        d: 3,
      },
    ],
    usedBy: ['ols_linear_regression', 'decision_tree_regressor', 'random_forest_regressor'],
    prereq: ['loss-functions'],
    related: ['loss-functions', 'bias-variance-tradeoff'],
    labIntro: r`A fitted line and its residuals. Drag any point and watch MAE, RMSE, $R^2$ and MAPE react differently.`,
    tryThis: [r`Drag one point far away: RMSE jumps much more than MAE.`, r`Drag a point toward y = 0: MAPE explodes.`],
    keywords: 'regression metrics mae rmse mse r squared mape wape residuals',
  },
  {
    id: 'confusion-matrix', short: 'Confusion matrix', title: 'The Confusion Matrix',
    task: 'concepts', module: 'Evaluation', level: 1, minutes: 14,
    summary: r`The 2×2 table of true and false positives and negatives that every classification metric is built from.`,
    lead: r`For a binary classifier at a chosen threshold, every prediction is a true positive (TP), false positive (FP), false negative (FN) or true negative (TN). Accuracy, precision, recall, specificity and F1 are all ratios of these four counts.`,
    intuition: [
      r`The matrix forces you to look at the two kinds of mistake separately. In fraud detection a false negative (missed fraud) may cost a thousand times a false positive (an extra check). In spam filtering a false positive (a lost real email) is the expensive one. Accuracy blends them together and hides this.`,
      r`The counts depend on the threshold. Moving it trades FPs for FNs. That is the idea behind [[roc-auc|ROC]] and [[precision-recall-f1|precision–recall]] curves.`,
    ],
    analogy: r`A smoke alarm: it can ring for a real fire (TP), ring for toast (FP), stay silent in a fire (FN) or stay silent when all is well (TN).`,
    steps: [r`Pick a threshold and turn scores into labels.`, r`Count TP, FP, FN, TN on held-out data.`, r`Compute the rates that matter for your costs.`, r`Repeat across thresholds to choose the operating point.`],
    math: [
      { h: 'Rates from the matrix', tex: r`$$\text{Accuracy} = \frac{TP + TN}{N}, \;\; \text{Recall (TPR)} = \frac{TP}{TP + FN}, \;\; \text{Specificity} = \frac{TN}{TN + FP}, \;\; \text{FPR} = \frac{FP}{FP + TN}$$`, p: r`Recall asks "of the real positives, how many did we catch?". FPR asks "of the real negatives, how many did we wrongly flag?".` },
    ],
    keyPoints: [r`With 1% positives, predicting "negative" always gives 99% accuracy and catches nothing.`, r`Always state the threshold alongside the matrix.`, r`Normalise rows to read per-class rates.`],
    code: r`from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

proba = model.predict_proba(X_te)[:, 1]
cm = confusion_matrix(y_te, proba >= 0.5)          # [[TN, FP], [FN, TP]]
tn, fp, fn, tp = cm.ravel()
print(f"TP={tp} FP={fp} FN={fn} TN={tn}")
ConfusionMatrixDisplay(cm, display_labels=["negative", "positive"]).plot(); plt.show()`,
    pitfalls: [r`Reporting accuracy on imbalanced data.`, r`Forgetting scikit-learn’s layout: rows are true labels, columns predicted, negatives first.`],
    quiz: [
      { q: r`A model flags 100 transactions; 20 are fraud. Total fraud is 50. Recall is:`, o: [r`20%`, r`40%`, r`80%`, r`50%`], a: 1, why: r`$TP / (TP + FN) = 20/50$.` },
      { q: r`Raising the decision threshold generally:`, o: [r`Increases FPs`, r`Decreases FPs and increases FNs`, r`Changes nothing`, r`Increases both`], a: 1, why: r`Fewer points are called positive.` },
    ],
    usedBy: ['logistic_regression', 'decision_tree_classifier', 'random_forest_classifier'],
    prereq: [],
    related: ['precision-recall-f1', 'roc-auc'],
    labIntro: r`Two overlapping score distributions: real negatives (violet) and real positives (cyan). Slide the threshold and watch the four cells of the matrix update.`,
    tryThis: [r`Find the threshold that catches 90% of positives. How many false positives does it cost?`, r`Turn on imbalance (5% positives) and see how accuracy stays high while recall collapses.`],
    keywords: 'confusion matrix true positive false positive false negative accuracy recall specificity',
  },
  {
    id: 'precision-recall-f1', short: 'Precision, recall & F1', title: 'Precision, Recall, F1 and the PR Curve',
    task: 'concepts', module: 'Evaluation', level: 1, minutes: 14,
    summary: r`Precision: how many flagged items are right. Recall: how many right items were flagged. F1 balances the two.`,
    lead: r`Precision is the share of predicted positives that are real; recall is the share of real positives that were found. They pull against each other as the threshold moves. F1 is their harmonic mean, and the precision–recall curve shows the whole trade-off.`,
    intuition: [
      r`A search engine that returns one perfect result has precision 1 and terrible recall. One that returns the whole internet has recall 1 and terrible precision. Most real systems need a point in between, chosen by what each kind of mistake costs.`,
      r`The harmonic mean in F1 punishes imbalance: precision 1.0 and recall 0.1 give F1 = 0.18, not 0.55. $F_\beta$ lets you weight recall $\beta$ times as much as precision. For rare positives, the area under the PR curve (average precision) is more informative than ROC-AUC.`,
    ],
    analogy: r`A fishing net: precision is how much of your catch is the fish you wanted; recall is how many of those fish in the lake you caught.`,
    steps: [r`Get predicted probabilities on held-out data.`, r`Sweep the threshold; compute precision and recall at each.`, r`Plot the PR curve; compute average precision.`, r`Choose the threshold that meets your precision or recall target.`],
    math: [
      { h: 'Definitions', tex: r`$$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}, \quad F_\beta = (1 + \beta^2)\frac{PR}{\beta^2P + R}$$`, p: r`$\beta = 1$ gives F1; $\beta = 2$ weights recall more.` },
    ],
    keyPoints: [r`A random classifier’s precision equals the positive rate, so PR baselines depend on prevalence.`, r`Report precision and recall at the chosen threshold, not just F1.`, r`Macro vs micro averaging matters for multi-class problems.`],
    code: r`from sklearn.metrics import precision_recall_curve, average_precision_score, f1_score

proba = model.predict_proba(X_te)[:, 1]
prec, rec, thr = precision_recall_curve(y_te, proba)
print("average precision:", round(average_precision_score(y_te, proba), 3))
ok = prec[:-1] >= 0.9                                     # thresholds giving ≥ 90% precision
print("best recall at ≥90% precision:", rec[:-1][ok].max() if ok.any() else "none")`,
    pitfalls: [r`Optimising F1 when the business has a clear asymmetric cost.`, r`Comparing PR-AUC across datasets with different positive rates.`],
    quiz: [
      { q: r`Precision 0.9, recall 0.3. F1 is:`, o: [r`0.6`, r`0.45`, r`0.3`, r`0.9`], a: 1, why: r`$2 \cdot 0.9 \cdot 0.3 / 1.2 = 0.45$.` },
      { q: r`For a cancer screening test you would usually prioritise:`, o: [r`Precision`, r`Recall`, r`Accuracy`, r`Specificity only`], a: 1, why: r`Missing a case (FN) is far worse than a follow-up test (FP).` },
    ],
    usedBy: ['logistic_regression', 'gradient_boosted_classifiers', 'support_vector_classifier'],
    prereq: ['confusion-matrix'],
    related: ['confusion-matrix', 'roc-auc'],
    labIntro: r`The same score distributions as the confusion matrix lesson. The right panel draws the precision–recall curve, with your threshold marked.`,
    tryThis: [r`Slide the threshold from 0 to 1 and trace the curve.`, r`Set β = 2 and see where the best $F_\beta$ threshold moves.`],
    keywords: 'precision recall f1 f beta pr curve average precision threshold',
  },
  {
    id: 'roc-auc', short: 'ROC and AUC', title: 'ROC Curves and AUC',
    task: 'concepts', module: 'Evaluation', level: 2, minutes: 14,
    summary: r`The ROC curve plots true-positive rate against false-positive rate at every threshold. AUC is the chance a random positive outranks a random negative.`,
    lead: r`Sweep the threshold from high to low and plot recall (TPR) against FPR. A perfect model hugs the top-left corner; a random one follows the diagonal. The area under the curve summarises ranking quality in one number.`,
    intuition: [
      r`AUC has a lovely interpretation: pick one positive and one negative at random; AUC is the probability the model scores the positive higher. It does not depend on any threshold or on the class balance, which is both its strength (ranking quality) and its weakness (it can look great on highly imbalanced problems where precision is poor).`,
    ],
    analogy: r`A sorting test: line everyone up by the model’s score and check how often the people who should be ahead actually are.`,
    steps: [r`Score held-out data.`, r`For every threshold compute TPR and FPR.`, r`Plot the curve; integrate it for AUC (or compute the rank statistic directly).`, r`Pick an operating point from the curve, given your FPR budget.`],
    math: [
      { h: 'AUC as a probability', tex: r`$$\mathrm{AUC} = P\big(s(x^+) > s(x^-)\big) = \frac{1}{n_+n_-}\sum_{i \in +}\sum_{j \in -}\mathbb 1[s_i > s_j]$$`, p: r`Equivalent to the Mann–Whitney U statistic, scaled.` },
    ],
    keyPoints: [r`AUC 0.5 = random; 1.0 = perfect ranking.`, r`AUC ignores calibration: multiplying all scores by 2 does not change it.`, r`On rare positives, also report precision–recall.`],
    code: r`from sklearn.metrics import roc_curve, roc_auc_score
proba = model.predict_proba(X_te)[:, 1]
fpr, tpr, thr = roc_curve(y_te, proba)
print("AUC:", round(roc_auc_score(y_te, proba), 3))
print("TPR at 5% FPR:", tpr[fpr <= 0.05].max().round(3))`,
    pitfalls: [r`Treating a high AUC as proof the model is useful at the threshold you deploy.`, r`Comparing AUCs computed on different test sets.`],
    quiz: [
      { q: r`AUC = 0.8 means:`, o: [r`80% accuracy`, r`An 80% chance a random positive scores above a random negative`, r`80% recall`, r`80% of predictions are calibrated`], a: 1, why: r`That is the ranking interpretation of AUC.` },
      { q: r`Doubling every predicted score changes AUC by:`, o: [r`Doubling it`, r`Nothing`, r`Halving it`, r`Making it 1`], a: 1, why: r`AUC depends only on the ranking of scores.` },
    ],
    usedBy: ['logistic_regression', 'random_forest_classifier', 'gradient_boosted_classifiers'],
    prereq: ['confusion-matrix'],
    related: ['precision-recall-f1', 'confusion-matrix'],
    labIntro: r`Control how far apart the two classes’ scores are. The ROC curve and its AUC update live; your threshold is the marked point.`,
    tryThis: [r`Set separation to 0: the curve collapses to the diagonal, AUC ≈ 0.5.`, r`Push separation up and watch the curve bend toward the corner.`],
    keywords: 'roc curve auc tpr fpr ranking threshold mann whitney',
  },
  {
    id: 'clustering-metrics', short: 'Clustering metrics', title: 'Evaluating Clusters: Inertia, Silhouette, Davies–Bouldin',
    task: 'concepts', module: 'Evaluation', level: 2, minutes: 14,
    summary: r`With no labels, judge clusters by how tight and how separate they are, and choose k with the elbow and silhouette.`,
    lead: r`Clustering has no ground truth, so internal metrics score the geometry: compact clusters that are far from each other. Inertia measures compactness, silhouette compares cohesion with separation, Davies–Bouldin compares cluster spread with centre distance.`,
    intuition: [
      r`Inertia always falls as $k$ grows (more centres, shorter distances), so we look for the "elbow" where adding clusters stops paying off. Silhouette is self-normalising: for each point, $a$ is the average distance to its own cluster, $b$ to the nearest other cluster, and $s = (b - a)/\max(a, b)$ runs from −1 (wrong cluster) to +1 (well placed).`,
      r`All of these metrics favour round, convex clusters, so they can rate k-means above a better DBSCAN result on crescent-shaped data. When labels exist for a sample, external metrics like the adjusted Rand index are more trustworthy.`,
    ],
    analogy: r`Judging seating at a wedding: guests should be close to their own table and far from the others.`,
    steps: [r`Fit the clustering for several k (or settings).`, r`Compute inertia, silhouette and Davies–Bouldin for each.`, r`Look for an elbow in inertia and a peak in silhouette.`, r`Sanity-check clusters with domain knowledge: are they useful?`],
    math: [
      { h: 'Silhouette', tex: r`$$s(i) = \frac{b(i) - a(i)}{\max\{a(i), b(i)\}}$$`, p: r`The overall score is the mean over points. Above about 0.5 is a reasonable structure; below 0.25 is weak.` },
      { h: 'Davies–Bouldin index', tex: r`$$DB = \frac1K\sum_{k=1}^K\max_{j \ne k}\frac{s_k + s_j}{d(\mu_k, \mu_j)}$$`, p: r`$s_k$ is the average distance of points to their centre. Lower is better.` },
    ],
    keyPoints: [r`Never pick k from inertia alone.`, r`Internal metrics are biased toward convex clusters.`, r`The best clustering is the one that is useful for the decision at hand.`],
    code: r`from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score

for k in range(2, 9):
    labels = KMeans(k, n_init=10, random_state=0).fit_predict(X)
    print(k, round(silhouette_score(X, labels), 3), round(davies_bouldin_score(X, labels), 3))`,
    pitfalls: [r`Computing silhouette with DBSCAN noise points included as a cluster.`, r`Treating the silhouette-optimal k as the "true" number of groups.`],
    quiz: [
      { q: r`A point with silhouette −0.4 is most likely:`, o: [r`Well clustered`, r`On a boundary`, r`Assigned to the wrong cluster`, r`Noise`], a: 2, why: r`It is on average closer to another cluster than to its own.` },
      { q: r`Why can’t you choose k by minimising inertia?`, o: [r`It is slow`, r`It always decreases as k increases`, r`It is undefined for k > 5`, r`It needs labels`], a: 1, why: r`With k = n inertia is zero.` },
    ],
    usedBy: ['kmeans_clustering', 'dbscan_clustering', 'gaussian_mixture_models', 'agglomerative_hierarchical'],
    prereq: [],
    related: ['exploratory-data-analysis'],
    labIntro: r`k-means with the k you choose. Silhouette values per point are shown as a bar chart, sorted within each cluster.`,
    tryThis: [r`Find the k with the highest mean silhouette. Does it match the number of blobs?`, r`Look for points with negative silhouette at the boundary between two clusters.`],
    keywords: 'clustering metrics silhouette inertia elbow davies bouldin calinski adjusted rand',
  },
];
