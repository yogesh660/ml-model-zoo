// Lessons for this track. Conventions: see regression.js and CLAUDE.md.
const r = String.raw;

module.exports = [
  {
    id: 'quantile-regression',
    short: 'Quantile regression',
    title: 'Quantile Regression',
    task: 'concepts',
    module: 'Beyond the basics',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Quantile regression estimates conditional percentiles of a response variable using the asymmetric pinball loss, uncovering heteroscedasticity and modelling full risk distributions.`,
    lead: r`Ordinary Least Squares models only the conditional mean $\mathbb{E}[Y \mid X]$, which obscures data dispersion and proves fragile under heavy-tailed errors or outliers. Quantile regression replaces squared error with the asymmetric check (pinball) loss to estimate any conditional quantile $\tau \in (0, 1)$, mapping how the entire shape of the response distribution shifts with predictors.`,
    intuition: [
      r`Imagine predicting house prices based on living area. For entry-level flats, prices cluster tightly near \$200,000. For large detached properties, prices disperse dramatically: some sell for \$800,000 while others reach \$3,000,000 depending on architectural finishes and location. A single Ordinary Least Squares (OLS) line draws an average right through the middle, hiding the fact that error variance explodes with square footage. Furthermore, a single celebrity mansion selling for \$20,000,000 pulls the OLS line upward, distorting predictions for normal buyers.`,
      r`Quantile regression fits a line that leaves exactly $\tau \times 100\%$ of data points below it and $(1 - \tau) \times 100\%$ above it. For the median ($\tau = 0.5$), the penalty is simply absolute error $|y - \hat{y}|$; extreme luxury outliers exert zero leverage on the slope, providing robust predictions. To fit the 90th percentile ($\tau = 0.9$), under-predictions are penalised 9 times more heavily than over-predictions, tilting the fitted line upward to capture the upper echelon of the market.`,
      r`By fitting models across multiple quantiles—such as $\tau \in \{0.1, 0.5, 0.9\}$—practitioners reveal the entire conditional distribution. When the 90th percentile line diverges from the 10th percentile line, the data exhibits heteroscedasticity (expanding variance). When the distance between the 10th percentile and the median differs from that between the median and the 90th percentile, the conditional distribution is skewed. This delivers complete risk profiling without requiring distributional assumptions.`,
    ],
    analogy: r`If OLS summarises a mountain range solely by its average elevation, quantile regression provides topographic contours that delineate the valley floor, the median plateau, and the mountain ridge.`,
    steps: [
      r`Choose target quantile levels $\tau \in (0, 1)$, such as $\tau = 0.5$ for outlier-resistant median regression or $\tau \in \{0.05, 0.95\}$ for probabilistic risk boundaries.`,
      r`Specify the linear predictor $q_\tau(x) = x^T \beta_\tau$, recognising that each quantile level yields its own distinct coefficient vector $\beta_\tau$.`,
      r`Define the empirical objective via the asymmetric check (pinball) loss $\rho_\tau(u) = u(\tau - \mathbb{I}(u < 0))$.`,
      r`Reformulate the non-smooth optimisation problem as a linear program by decomposing residuals into positive and negative slack variables ($u_i^+ - u_i^-$).`,
      r`Solve the linear program using interior-point or simplex algorithms to obtain globally optimal parameter estimates $\hat{\beta}_\tau$.`,
      r`Verify quantile monotonicity: ensure lower quantile prediction hyperplanes do not cross above higher quantiles across the covariate domain.`,
    ],
    math: [
      {
        h: 'The pinball (check) loss function',
        tex: r`$$\rho_\tau(u) = u \cdot \big(\tau - \mathbb{I}(u < 0)\big) = \begin{cases} \tau \, u & \text{if } u \ge 0 \\ (\tau - 1) \, u & \text{if } u < 0 \end{cases}$$`,
        p: r`$u = y - \hat{y}$ denotes the prediction residual, $\tau \in (0, 1)$ specifies the target quantile, and $\mathbb{I}(\cdot)$ is the indicator function. Positive errors (under-prediction) incur slope $\tau$, while negative errors (over-prediction) incur slope $1 - \tau$. At $\tau = 0.5$, $\rho_{0.5}(u) = 0.5|u|$, recovering Least Absolute Deviations (LAD).`,
      },
      {
        h: 'Empirical risk minimisation for quantile regression',
        tex: r`$$\hat{\beta}_\tau = \arg\min_{\beta} \sum_{i=1}^n \rho_\tau\big(y_i - x_i^T \beta\big)$$`,
        p: r`Formulated by Koenker and Bassett (1978), the estimator minimises sample pinball loss. Unlike OLS, which differentiates the squared residual loss to yield closed-form normal equations, quantile loss has a non-differentiable kink at $u = 0$, requiring linear programming solutions.`,
      },
      {
        h: 'Linear programming reformulation',
        tex: r`$$\min_{\beta, u^+, u^-} \sum_{i=1}^n \big(\tau u_i^+ + (1 - \tau) u_i^-\big) \quad \text{subject to} \quad y_i - x_i^T \beta = u_i^+ - u_i^-, \quad u_i^+, u_i^- \ge 0$$`,
        p: r`Splitting each residual into positive slack $u_i^+ = \max(0, y_i - x_i^T\beta)$ and negative slack $u_i^- = \max(0, x_i^T\beta - y_i)$ yields a linear objective with linear equality constraints, solved efficiently via simplex or interior-point algorithms.`,
      },
    ],
    keyPoints: [
      r`Semi-parametric and distribution-free: quantile regression makes no assumptions of error normality, constant variance, or symmetry.`,
      r`Median regression ($\tau = 0.5$) provides breakdown resistance against extreme vertical outliers that distort conditional mean estimates.`,
      r`Diverging quantile slopes ($\beta_{0.9} \ne \beta_{0.1}$) provide a formal geometric test and visual proof of heteroscedasticity.`,
      r`Quantile crossing can occur when models are fitted independently per quantile; monotonicity constraints or post-hoc sorting resolve crossing.`,
    ],
    pitfalls: [
      r`Assuming extreme quantiles are robust: while median regression is outlier-resistant, estimating $\tau = 0.01$ or $\tau = 0.99$ depends heavily on sparse tail observations.`,
      r`Overlooking quantile crossing: independent linear fits can intersect in unpopulated regions of feature space, generating illogical negative interval widths.`,
      r`Applying standard gradient descent without smoothing: the discontinuous derivative of the pinball loss at zero can trap un-smoothed first-order optimisers in limit cycles.`,
      r`Interpreting quantile coefficients as mean effects: $\beta_\tau$ reflects the marginal change in the $\tau$-th percentile, not in the population average.`,
    ],
    code: r`import numpy as np
from scipy.optimize import linprog

np.random.seed(42)
n = 120
x = np.sort(np.random.uniform(1.0, 5.0, n))
# Heteroscedastic response: error spread expands with x
eps = np.random.normal(0, 1.0, n)
y = 3.0 * x + (0.8 * x) * eps

# Fit quantile regression for tau in [0.1, 0.5, 0.9] via linear programming
slopes = {}
for tau in [0.1, 0.5, 0.9]:
    c = np.concatenate([[0.0, 0.0], np.full(n, tau), np.full(n, 1.0 - tau)])
    A_eq = np.zeros((n, 2 + 2 * n))
    A_eq[:, 0] = 1.0
    A_eq[:, 1] = x
    A_eq[:, 2:2+n] = np.eye(n)
    A_eq[:, 2+n:] = -np.eye(n)
    b_eq = y
    bounds = [(None, None), (None, None)] + [(0, None)] * (2 * n)
    res = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    slopes[tau] = (res.x[0], res.x[1])

print("Fitted quantiles (intercept, slope):")
for tau, (b0, b1) in slopes.items():
    print(f"tau={tau}: intercept={round(float(b0), 3)}, slope={round(float(b1), 3)}")`,
    quiz: [
      {
        q: r`Why does quantile regression uncover heteroscedasticity that Ordinary Least Squares fails to reveal?`,
        o: [
          r`Quantile regression fits separate slopes across conditional percentiles, showing how spread widens or narrows with predictors`,
          r`Quantile regression automatically squares all negative residuals to make variances constant`,
          r`Quantile regression requires calculating higher-order polynomial terms for every feature`,
          r`Quantile regression drops all observations that exhibit high leverage`,
        ],
        a: 0,
        why: r`By fitting lines for different percentiles (e.g. $\tau = 0.1$ and $\tau = 0.9$), quantile regression reveals whether the distribution fans out or compresses as predictors change.`,
      },
      {
        q: r`In the pinball (check) loss function for quantile $\tau = 0.9$, how are forecast errors penalised?`,
        o: [
          r`Over-predictions and under-predictions are penalised symmetrically with weight 0.9`,
          r`All errors are squared and multiplied by 0.9`,
          r`Under-predictions ($y > \hat{y}$) receive weight 0.9, while over-predictions ($y < \hat{y}$) receive weight 0.1`,
          r`Errors between the 10th and 90th percentiles receive zero penalty`,
        ],
        a: 2,
        why: r`The pinball loss $\rho_\tau(u)$ assigns weight $\tau = 0.9$ to under-predictions ($u \ge 0$) and $1 - \tau = 0.1$ to over-predictions ($u < 0$).`,
      },
      {
        q: r`What is "quantile crossing" in quantile regression?`,
        o: [
          r`A statistical test comparing OLS residuals against median residuals`,
          r`A condition where independently estimated quantile planes intersect, producing illogical predictions where a lower quantile exceeds a higher quantile`,
          r`The point where the regression line crosses the horizontal x-axis`,
          r`The conversion of continuous variables into categorical quantile buckets`,
        ],
        a: 1,
        why: r`When separate linear quantile regressions are fitted independently, non-parallel slopes can intersect in sparse feature regions, causing estimated lower percentiles to exceed higher percentiles.`,
      },
      {
        q: r`What loss function does median regression ($\tau = 0.5$) minimise?`,
        o: [
          r`Mean squared error ($L_2$ loss)`,
          r`Kullback–Leibler divergence`,
          r`Binary cross-entropy loss`,
          r`Mean absolute error ($L_1$ loss / Least Absolute Deviations)`,
        ],
        a: 3,
        why: r`Setting $\tau = 0.5$ yields $\rho_{0.5}(u) = 0.5 |u|$, which minimises the sum of absolute deviations, making the median regression line robust against vertical outliers.`,
      },
    ],
    usedBy: [],
    prereq: ['ols_linear_regression', 'residual-diagnostics-and-heteroscedasticity', 'cost-vs-loss-vs-error'],
    related: ['gams-and-splines', 'robust_regression', 'ols-inference-t-tests-f-test-r2-and-adjusted-r2'],
    keywords: 'quantile regression pinball loss check loss median regression lad heteroscedasticity linear programming',
  },
  {
    id: 'gams-and-splines',
    short: 'GAMs and splines',
    title: 'Generalised Additive Models (GAMs) and Splines',
    task: 'concepts',
    module: 'Beyond the basics',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Generalised Additive Models replace rigid linear coefficients with smooth, penalised spline curves, capturing non-linear relationships while preserving additive interpretability.`,
    lead: r`Linear models are transparent but miss curved relationships; deep neural networks and tree ensembles model complex curvature but operate as black boxes. Generalised Additive Models (GAMs) strike a balance: each feature enters through a smooth, non-parametric spline function $f_j(x_j)$, enabling visual interpretability while roughness penalties prevent overfitting.`,
    intuition: [
      r`Consider how ambient temperature influences energy demand. On freezing winter days (-5°C), electricity demand surges as heating systems run. In mild spring weather (18°C), demand drops to a minimum. In sweltering summer heat (35°C), demand surges once again as air conditioning units operate at full capacity. A standard linear regression line $y = \beta x$ is ineffective: a positive slope ignores winter heating, while a negative slope ignores summer cooling. High-order polynomials ($x^2, x^3, x^4$) bend, but they oscillate wildly near boundaries (Runge's phenomenon).`,
      r`Splines resolve this tension by stitching simple, well-behaved cubic polynomials together at dividing boundaries called knots. By requiring the curve, its slope (first derivative), and its curvature (second derivative) to match continuously across every knot, cubic splines flow smoothly across complex landscapes without wild edge wobbles. To ensure the curve captures true underlying physics rather than chasing sample noise, a roughness penalty $\lambda \int [f''(x)]^2 dx$ penalises excessive curvature.`,
      r`Generalised Additive Models assemble these smooth univariate splines into an additive sum: $y = \beta_0 + f_1(x_1) + f_2(x_2) + \dots + f_p(x_p) + \epsilon$. Because the model is strictly additive, each function $f_j(x_j)$ can be plotted on a 2D graph holding other variables constant. A data scientist can show stakeholders the isolated curve for temperature, the separate curve for humidity, and a categorical shift for weekends, making GAMs a premier framework for transparent, audited machine learning.`,
    ],
    analogy: r`If linear regression is a rigid wooden yardstick and a neural network is flexible clay, a GAM is an architect's spline ruler: an elastic strip pinned at designated anchor points that flexes gracefully to match terrain without chaotic flapping.`,
    steps: [
      r`Examine bivariate relationships via scatter plots and partial dependence profiles to detect non-linear curves or non-monotonic trends.`,
      r`Select a spline basis expansion for continuous features, such as natural cubic splines or B-splines, placing interior knots across quantiles of $x_j$.`,
      r`Construct the basis design matrix $\mathbf{B}$ by evaluating the basis functions at each observed feature coordinate.`,
      r`Define the penalty matrix $\mathbf{S}$ corresponding to the integrated second derivative of the basis functions to penalise unnecessary curvature.`,
      r`Estimate spline coefficients and smoothing parameter $\lambda$ using Penalised Iteratively Reweighted Least Squares (P-IRLS) with Restricted Maximum Likelihood (REML) or Generalised Cross-Validation (GCV).`,
      r`Plot individual partial effect curves $f_j(x_j)$ alongside pointwise confidence intervals, inspecting Effective Degrees of Freedom (EDF) to assess whether non-linear flexibility is warranted.`,
    ],
    math: [
      {
        h: 'The Generalised Additive Model formulation',
        tex: r`$$g(\mathbb{E}[Y \mid X]) = \beta_0 + \sum_{j=1}^p f_j(x_j), \quad f_j(x_j) = \sum_{k=1}^K \beta_{jk} \, b_{jk}(x_j)$$`,
        p: r`$g(\cdot)$ denotes a monotonic link function (such as identity for regression or logit for classification), $f_j$ are smooth non-parametric functions, and $b_{jk}(x_j)$ represent pre-specified basis functions (e.g. cubic B-splines) weighted by estimated coefficients $\beta_{jk}$.`,
      },
      {
        h: 'Penalised spline objective (smoothing spline)',
        tex: r`$$\min_{\beta} \sum_{i=1}^n \Big(y_i - \beta_0 - \sum_{j=1}^p f_j(x_{ij})\Big)^2 + \sum_{j=1}^p \lambda_j \int \big(f_j''(t)\big)^2 \, dt$$`,
        p: r`The objective balances fidelity to training data against curve roughness. $\int [f_j''(t)]^2 dt$ quantifies total second-derivative curvature. Smoothing parameter $\lambda_j \ge 0$ controls the trade-off: as $\lambda \to 0$, the curve interpolates data; as $\lambda \to \infty$, the penalty forces $f_j''(t) = 0$, reducing the curve to a standard linear function.`,
      },
      {
        h: 'Penalised least squares and Effective Degrees of Freedom (EDF)',
        tex: r`$$\hat{\beta} = (\mathbf{B}^T \mathbf{B} + \lambda \mathbf{S})^{-1} \mathbf{B}^T \mathbf{y}, \quad \operatorname{EDF} = \operatorname{tr}\Big(\mathbf{B}(\mathbf{B}^T \mathbf{B} + \lambda \mathbf{S})^{-1} \mathbf{B}^T\Big)$$`,
        p: r`$\mathbf{B}$ is the basis evaluation matrix and $\mathbf{S}$ is the penalty matrix. Effective Degrees of Freedom ($\operatorname{EDF}$) measures the non-linear flexibility of the fitted term: $\operatorname{EDF} \approx 1$ represents a strict linear relationship, while higher $\operatorname{EDF}$ values indicate increasingly complex, multi-inflection curves.`,
      },
    ],
    keyPoints: [
      r`Additive transparency: each feature contribution $f_j(x_j)$ can be plotted and explained independently of all other inputs.`,
      r`Curvature penalisation: the smoothing penalty $\lambda$ adaptively contracts unnecessary wiggles, preventing overfitting without manual knot tuning.`,
      r`Effective Degrees of Freedom (EDF) provides a principled metric of non-linearity: an EDF near 1 justifies simplifying to a standard linear coefficient.`,
      r`Exponential family flexibility: GAMs seamlessly handle binary, count, and skewed outcomes through canonical GLM link functions.`,
    ],
    pitfalls: [
      r`Neglecting feature interactions: GAMs assume additivity by default; interacting features (e.g. temperature and humidity) require explicit 2D tensor-product smooths $f_{12}(x_1, x_2)$.`,
      r`Unbounded extrapolation: polynomial splines can diverge sharply outside the boundary knots; natural cubic splines mitigate this by enforcing linear extrapolation in the tails.`,
      r`Concurvity: the non-linear analogue of multicollinearity where one smooth curve can be approximated by a combination of other curves, destabilising parameter estimation.`,
      r`Under-smoothing ($\lambda$ too small): insufficient penalisation causes the spline to overfit random noise spikes rather than the underlying generative signal.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
n = 80
x = np.sort(np.random.uniform(0, 2 * np.pi, n))
y_true = np.sin(x)
y = y_true + np.random.normal(0, 0.25, n)

# Natural cubic spline / truncated power basis with 5 interior knots
knots = np.quantile(x, [0.15, 0.35, 0.55, 0.75, 0.9])
def build_basis(x_pts, k_pts):
    cols = [np.ones_like(x_pts), x_pts]
    for k in k_pts:
        cols.append(np.maximum(0.0, x_pts - k)**3)
    return np.column_stack(cols)

B = build_basis(x, knots)
p = B.shape[1]

# Roughness penalty matrix S approximating integrated second derivatives
grid = np.linspace(0, 2 * np.pi, 200)
dx = grid[1] - grid[0]
d2_cols = [np.zeros_like(grid), np.zeros_like(grid)]
for k in knots:
    d2_cols.append(6.0 * np.maximum(0.0, grid - k))
D2 = np.column_stack(d2_cols)
S = (D2.T @ D2) * dx

# Solve penalised least squares: (B^T B + lambda * S) beta = B^T y
lam = 0.05
A = B.T @ B + lam * S
beta = np.linalg.solve(A, B.T @ y)

# Effective degrees of freedom: trace of the hat matrix
H = B @ np.linalg.solve(A, B.T)
edf = np.trace(H)
y_pred = B @ beta
rmse = np.sqrt(np.mean((y - y_pred)**2))

pred_pi2 = (build_basis(np.array([np.pi/2]), knots) @ beta)[0]
pred_3pi2 = (build_basis(np.array([3*np.pi/2]), knots) @ beta)[0]

print("Number of basis functions:", p)
print("Smoothing penalty lambda:", lam)
print("Effective Degrees of Freedom (EDF):", round(float(edf), 2))
print("Fit RMSE:", round(float(rmse), 3))
print("Prediction at pi/2 (true=1.0):", round(float(pred_pi2), 3))
print("Prediction at 3pi/2 (true=-1.0):", round(float(pred_3pi2), 3))`,
    quiz: [
      {
        q: r`What is the primary advantage of Generalised Additive Models (GAMs) over multi-layer neural networks or gradient boosting?`,
        o: [
          r`GAMs guarantee lower training loss than deep neural networks on image datasets`,
          r`GAMs eliminate the need for training data by using mathematical priors`,
          r`Each feature contribution $f_j(x_j)$ is an isolated univariate curve that can be visualised and audited independently`,
          r`GAMs can only fit linear relationships, making computation instantaneous`,
        ],
        a: 2,
        why: r`Because GAMs are additive sums of smooth functions $f_j(x_j)$, each feature's marginal relationship with the target can be plotted on a 2D graph and directly audited.`,
      },
      {
        q: r`In penalised spline regression, what happens to the fitted curve as the smoothing parameter $\lambda \to \infty$?`,
        o: [
          r`The curve interpolates every training data point exactly`,
          r`The roughness penalty dominates, forcing the second derivative to zero everywhere and collapsing the curve into a standard linear regression line`,
          r`The fitted curve oscillates with infinite frequency between knots`,
          r`All coefficients $\beta$ are forced to zero, predicting a flat zero line`,
        ],
        a: 1,
        why: r`The roughness penalty penalises $\int [f''(t)]^2 dt$. As $\lambda \to \infty$, $f''(t)$ is forced to 0 for all $t$, which is the definition of a straight line.`,
      },
      {
        q: r`What does an Effective Degrees of Freedom (EDF) value close to 1.0 indicate for a fitted smooth term?`,
        o: [
          r`The term exhibits a complex, multi-modal non-linear shape`,
          r`The model has severely overfitted the training data`,
          r`The feature has zero explanatory power and should be dropped`,
          r`The relationship between that feature and the response is essentially linear`,
        ],
        a: 3,
        why: r`An EDF of 1 corresponds to a linear term with no curvature; higher EDF values (e.g. 3, 5, 8) represent increasing non-linear complexity and inflection points.`,
      },
      {
        q: r`What is "concurvity" in the context of Generalised Additive Models?`,
        o: [
          r`The non-linear analogue of multicollinearity, where one smooth function can be approximated by a combination of other smooth functions`,
          r`A metric measuring how many knots are placed inside the training data range`,
          r`The rate of convergence for Penalised Iteratively Reweighted Least Squares`,
          r`The difference between training RMSE and test RMSE`,
        ],
        a: 0,
        why: r`Concurvity occurs when a smooth curve of one predictor can be approximated by smooth functions of other predictors, destabilising coefficient estimation just like collinearity does in linear models.`,
      },
    ],
    usedBy: [],
    prereq: ['ols_linear_regression', 'polynomial_regression', 'generalised-linear-models'],
    related: ['quantile-regression', 'ridge_regression', 'bias-variance-tradeoff'],
    keywords: 'gams generalised additive models splines smoothing splines roughness penalty basis functions edf interpretability',
  },
  {
    id: 'bagging-and-extra-trees',
    short: 'Bagging and Extra-Trees',
    title: 'Bootstrap Aggregating and Extremely Randomised Trees',
    task: 'concepts',
    module: 'Beyond the basics',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Bagging reduces variance by averaging unpruned decision trees trained on bootstrap samples, while Extra-Trees adds split-threshold randomisation for faster training and greater decorrelation.`,
    lead: r`Individual decision trees suffer from high variance: minor fluctuations in training data can completely alter their tree architecture. Bootstrap aggregating (bagging) stabilises predictions by growing an ensemble of deep, low-bias trees on independent bootstrap resamples and aggregating their votes. Extremely Randomised Trees (Extra-Trees) pushes this decorrelation further by choosing split cut-points completely at random, significantly accelerating training speed while suppressing variance on noisy data.`,
    intuition: [
      r`Imagine seeking a medical diagnosis from 50 physicians rather than relying on a single doctor. If all 50 studied the exact same textbooks and evaluated the patient under identical hospital protocols, they might share the same diagnostic blind spots. However, if each doctor trained at a different hospital on a distinct mix of case files (bootstrap sampling), their individual errors tend to cancel out. Averaging their assessments produces a consensus diagnosis that is far more reliable than any individual prognosis.`,
      r`Bagging works because averaging $B$ independent, identically distributed estimators leaves bias unchanged while reducing variance by a factor of $1/B$. In practice, because all trees draw from the same finite training pool, their predictions remain positively correlated ($\\rho > 0$). When trees are correlated, variance reduction hits an irreducible floor of $\\rho \\sigma^2$. Decorrelating individual trees is therefore the primary mechanism for improving ensemble performance.`,
      r`Extra-Trees (Extremely Randomised Trees) tackles tree correlation directly. At each node, rather than scanning all possible threshold values to find the split that maximises the Gini impurity drop, Extra-Trees draws random cut-points from a uniform distribution for each candidate feature and selects the best among them. By abandoning exhaustive threshold searches, Extra-Trees trains drastically faster than standard Random Forests while producing highly diverse, decorrelated trees that often generalise better on noisy datasets.`,
    ],
    analogy: r`Bagging is like taking a consensus vote among independent analysts reviewing randomly shuffled case folders, while Extra-Trees speeds up the deliberation by forcing analysts to evaluate proposals against random benchmark hurdles.`,
    steps: [
      r`Draw $B$ independent bootstrap datasets $\\mathcal{D}_1, \\dots, \\mathcal{D}_B$ of size $n$ by sampling from the original dataset with replacement.`,
      r`For standard Bagging, grow deep, unpruned decision trees on each bootstrap resample using all available features.`,
      r`For Extra-Trees, train trees on the full dataset (or bootstrap draws) and, at each split node, draw split thresholds at random for each feature subset.`,
      r`Track Out-of-Bag (OOB) samples—the $\\approx 36.8\\%$ of instances omitted from each bootstrap draw—to compute honest cross-validation metrics on the fly.`,
      r`Aggregate tree outputs: compute majority voting (or soft probability averages) for classification, and arithmetic means for regression.`,
      r`Evaluate ensemble convergence: verify that test error stabilises asymptotically as tree count $B$ grows without risk of overfitting.`,
    ],
    math: [
      {
        h: 'Variance reduction in an ensemble of correlated estimators',
        tex: r`$$\\operatorname{Var}\\big(\\bar{f}(x)\\big) = \\rho \\, \\sigma^2 + \\frac{1 - \\rho}{B} \\, \\sigma^2$$`,
        p: r`$\\sigma^2$ is the variance of a single tree, $B$ is the number of trees in the ensemble, and $\\rho = \\operatorname{Corr}(f_i, f_j)$ is the average pairwise correlation between trees. As $B \\to \\infty$, the second term vanishes, leaving the irreducible variance floor $\\rho \\sigma^2$. Extra-Trees achieves superior variance reduction by actively driving down $\\rho$.`,
      },
      {
        h: 'Out-of-Bag (OOB) sample probability derivation',
        tex: r`$$P(\\text{point } i \\text{ is never selected in } n \\text{ draws}) = \\Big(1 - \\frac{1}{n}\\Big)^n \\xrightarrow{n \\to \\infty} \\frac{1}{e} \\approx 0.3679$$`,
        p: r`For a sample of size $n$, each observation has probability $1 - 1/n$ of being omitted in a single draw. Compounding over $n$ independent draws with replacement shows that roughly $36.8\\%$ of data points remain unused per tree, providing a free validation set.`,
      },
      {
        h: 'Aggregation rules (hard voting vs soft voting)',
        tex: r`$$\\hat{y}_{\\text{hard}} = \\operatorname{mode}\\big(\\{f_b(x)\\}_{b=1}^B\\big), \\quad \\hat{p}(k \\mid x) = \\frac{1}{B}\\sum_{b=1}^B p_b(k \\mid x)$$`,
        p: r`Hard voting selects the majority class label across all $B$ binary decision trees. Soft voting averages the continuous predicted class probability vectors across trees, yielding smoother decision boundaries and lower log-loss.`,
      },
    ],
    keyPoints: [
      r`Pure variance reduction: bagging cannot rectify high-bias models (e.g. linear models or depth-1 stumps); it requires flexible, low-bias base learners.`,
      r`Out-of-Bag (OOB) scoring: provides an unbiased cross-validation estimate without requiring an explicit held-out test split.`,
      r`Extra-Trees trades a small increase in individual tree bias for a significant reduction in ensemble variance and massive computational speed-ups.`,
      r`Ensemble size immunity: bagging cannot overfit by simply increasing the number of trees $B$; error asymptotically plateaus.`,
    ],
    pitfalls: [
      r`Bagging high-bias models: averaging multiple linear models or shallow trees produces essentially the same line, offering zero performance gain.`,
      r`Data pre-processing leakage: scaling, normalisation, or feature selection performed on the full dataset before bootstrap resampling leaks information across folds.`,
      r`Dominant feature masking: if one feature is overwhelmingly predictive, standard bagging trees will all select it at the root, maintaining high pairwise correlation $\\rho$.`,
      r`Applying standard bootstrap to temporal sequences: random sampling with replacement shuffles temporal order and destroys auto-regressive structure.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
n = 200
x = np.linspace(-3, 3, n)
y = (np.sin(x) > 0).astype(int)
noise = np.random.choice([0, 1], size=n, p=[0.85, 0.15])
y_noisy = np.bitwise_xor(y, noise)

B = 40
tree_preds = np.zeros((B, n))

for b in range(B):
    idx = np.random.choice(n, n, replace=True)
    best_gain, best_thresh, best_pred = -1, 0, (0, 1)
    for _ in range(6):
        th = np.random.uniform(-2.5, 2.5)
        left = idx[x[idx] < th]
        right = idx[x[idx] >= th]
        if len(left) < 5 or len(right) < 5: continue
        p1 = np.mean(y_noisy[left])
        p2 = np.mean(y_noisy[right])
        gain = len(left) * abs(p1 - 0.5) + len(right) * abs(p2 - 0.5)
        if gain > best_gain:
            best_gain = gain
            best_thresh = th
            best_pred = (int(p1 >= 0.5), int(p2 >= 0.5))
    tree_preds[b] = np.where(x < best_thresh, best_pred[0], best_pred[1])

single_acc = np.mean([np.mean(tree_preds[b] == y) for b in range(B)])
ensemble_pred = (np.mean(tree_preds, axis=0) >= 0.5).astype(int)
ens_acc = np.mean(ensemble_pred == y)

print("Single tree mean accuracy:", round(float(single_acc), 3))
print("Ensemble accuracy:", round(float(ens_acc), 3))
print("Theoretical OOB fraction 1/e:", round(float(1 / np.e), 3))`,
    quiz: [
      {
        q: r`Why does Bagging reduce prediction error when applied to deep decision trees?`,
        o: [
          r`It converts deep trees into linear support vector machines`,
          r`It averages unpruned, low-bias estimators, driving ensemble variance down by cancelling out idiosyncratic noise`,
          r`It prunes leaves that contain fewer than five training samples`,
          r`It forces all trees to use identical split criteria across all nodes`,
        ],
        a: 1,
        why: r`Deep decision trees have low bias but high variance; averaging across diverse bootstrap resamples cancels out random variance without inflating bias.`,
      },
      {
        q: r`What key algorithmic distinction differentiates Extra-Trees from standard Random Forests?`,
        o: [
          r`Extra-Trees only trains on neural network representations`,
          r`Extra-Trees uses gradient boosting rather than bootstrap aggregation`,
          r`Extra-Trees requires all features to follow a normal distribution`,
          r`Extra-Trees draws split thresholds completely at random rather than searching for optimal cut-points`,
        ],
        a: 3,
        why: r`At each node, Extra-Trees draws random cut-points for each candidate feature from a uniform distribution, avoiding the exhaustive search for the optimal Gini threshold.`,
      },
      {
        q: r`What is the theoretical proportion of unique training observations omitted from each bootstrap sample of size $n$ as $n \\to \\infty$?`,
        o: [
          r`Approximately $1/e \\approx 36.8\\%$`,
          r`Exactly $50.0\\%$`,
          r`Zero, because sampling is performed with replacement`,
          r`Approximately $5.0\\%$`,
        ],
        a: 0,
        why: r`The probability that an item is never selected in $n$ independent draws with replacement converges to $(1 - 1/n)^n \\to 1/e \\approx 0.3679$.`,
      },
      {
        q: r`Why does Bagging fail to improve performance when applied to shallow linear regression models?`,
        o: [
          r`Linear models cannot be evaluated using Out-of-Bag scoring`,
          r`Linear models are already non-linear, making bagging redundant`,
          r`Linear models are stable, low-variance estimators; averaging similar hyperplanes cannot reduce bias and yields virtually no variance benefit`,
          r`Linear models cannot be trained on bootstrap resamples`,
        ],
        a: 2,
        why: r`Bagging is strictly a variance-reduction tool. Because linear models have low variance and high bias, averaging multiple linear fits leaves the error unchanged.`,
      },
    ],
    usedBy: [],
    prereq: ['decision_tree_classifier', 'random_forest_classifier', 'bias-variance-tradeoff', 'bootstrap-and-jackknife'],
    related: ['random_forest_classifier', 'gradient_boosted_classifiers', 'stacking_voting_classifiers'],
    keywords: 'bagging bootstrap aggregating extra trees extremely randomised trees ensemble variance reduction out of bag oob',
  },
  {
    id: 'multiclass-strategies-one-vs-rest-one-vs-one-softmax',
    short: 'Multiclass strategies',
    title: 'Multiclass Strategies: One-vs-Rest, One-vs-One and Softmax',
    task: 'concepts',
    module: 'Beyond the basics',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Multiclass classification decomposes multi-category targets into binary sub-problems via One-vs-Rest or One-vs-One, or predicts class probabilities jointly via Softmax regression.`,
    lead: r`Many foundational classification algorithms—such as standard Support Vector Machines, perceptrons, and linear margins—are inherently binary. To predict among $K > 2$ classes, algorithms either adopt architectural reductions (One-vs-Rest or One-vs-One tournaments) or formulate a native multinomial likelihood using the Softmax function.`,
    intuition: [
      r`Imagine sorting incoming emails into three categories: Work, Personal, and Finance. If your classifier only knows how to answer yes-or-no queries, how do you proceed? The most common heuristic is **One-vs-Rest (OvR)**, also known as One-vs-All. You train three separate binary models: Model 1 asks "Is this Work or not?", Model 2 asks "Is this Personal or not?", and Model 3 asks "Is this Finance or not?". Each model scores the document, and you assign the email to whichever classifier reports the highest decision margin.`,
      r`An alternative decomposition is **One-vs-One (OvO)**. Instead of pitting each class against the pooled remainder of the dataset, you organise a round-robin tournament between every unique pair of classes. For 3 categories, you train $3(2)/2 = 3$ binary classifiers: Work vs Personal, Work vs Finance, and Personal vs Finance. Each classifier votes for its preferred class, and the class with the most aggregate votes wins. Although OvO trains $K(K-1)/2$ models, each model trains on a much smaller dataset ($2/K$ of the data), making it exceptionally fast for algorithms with super-linear computational scaling.`,
      r`Rather than decomposing multi-class problems into disconnected binary tasks, **Softmax regression** solves the problem natively. It maintains a separate weight vector for each class, computes linear logits $z_k = x^T w_k$, and exponentiates and normalises them so the resulting probabilities across all $K$ categories sum to exactly 1.0. By jointly optimising a single multinomial cross-entropy loss, Softmax accounts for direct competition between classes, avoiding the uncalibrated score comparisons that can compromise OvR.`,
    ],
    analogy: r`OvR is like holding separate individual referendum votes on every candidate, OvO is a round-robin boxing tournament where every contender fights every other contender, and Softmax is a single ballot where voters allocate a unified probability distribution across all contenders simultaneously.`,
    steps: [
      r`Determine the class count $K$ and establish whether base estimators natively support multinomial likelihoods or require binary reduction.`,
      r`For One-vs-Rest (OvR), construct $K$ binary classification tasks, setting class $k$ as positive (+1) and pooling all other $K-1$ classes as negative (0).`,
      r`For One-vs-One (OvO), train $K(K-1)/2$ binary models on paired subsets $\\mathcal{D}_{ij} = \\{ (x, y) \\mid y \\in \\{i, j\\} \\}.`,
      r`For Softmax regression, parameterise a weight matrix $W \\in \\mathbb{R}^{p \\times K}$ and compute class probabilities via normalised exponentials.`,
      r`Aggregate classifications: select $\\arg\\max$ of continuous decision margins in OvR, tally pairwise majority votes in OvO, or pick the maximum posterior probability in Softmax.`,
      r`Diagnose probability calibration and resolve ties or ambiguous multi-class boundaries.`,
    ],
    math: [
      {
        h: 'One-vs-Rest (OvR) decision rule',
        tex: r`$$\\hat{y} = \\arg\\max_{k \\in \\{1, \\dots, K\\}} f_k(x), \\quad f_k(x) = x^T w_k + b_k$$`,
        p: r`$f_k(x)$ represents the decision margin of binary classifier $k$ trained to separate class $k$ from all other classes. When binary models output uncalibrated scores, the $\\arg\\max$ operator can be skewed toward models with artificially wide margin scales.`,
      },
      {
        h: 'One-vs-One (OvO) model count and voting rule',
        tex: r`$$M = \\frac{K(K - 1)}{2}, \\quad \\hat{y} = \\arg\\max_{k} \\sum_{j \\ne k} \\mathbb{I}\\big(f_{kj}(x) = k\\big)$$`,
        p: r`$M$ is the number of pairwise binary classifiers. Each model $f_{kj}$ votes for either class $k$ or class $j$. The class accumulating the highest vote tally across all pairwise duels is selected, with ties broken by sum of decision margins.`,
      },
      {
        h: 'The Softmax function and categorical cross-entropy',
        tex: r`$$P(Y = k \\mid x) = \\frac{e^{x^T w_k}}{\\sum_{j=1}^K e^{x^T w_j}}, \\quad \\mathcal{L}_{\\text{CE}}(W) = -\\sum_{i=1}^n \\sum_{k=1}^K \\mathbb{I}(y_i = k) \\log P(Y = k \\mid x_i)$$`,
        p: r`Logits $z_k = x^T w_k$ are exponentiated and normalised by the partition denominator $\\sum_{j=1}^K e^{z_j}$, ensuring probabilities remain strictly positive and sum to 1.0. Gradient descent updates weights based on prediction error residuals $(p_{ik} - y_{ik}) x_i$.`,
      },
    ],
    keyPoints: [
      r`OvR trains $K$ classifiers on full dataset size $n$; OvO trains $K(K-1)/2$ classifiers on smaller sub-samples ($2n/K$).`,
      r`OvO is computationally advantageous for algorithms with super-linear scaling $\\mathcal{O}(n^2)$ (like kernel SVMs), as the sum of squared sub-sample sizes is smaller than $K n^2$.`,
      r`Softmax regression produces mutually exclusive, globally calibrated posterior probabilities that naturally sum to 1.0.`,
      r`OvR introduces severe class imbalance as $K$ increases: in a 20-class dataset, each OvR classifier faces a 1:19 imbalance ratio.`,
    ],
    pitfalls: [
      r`Comparing uncalibrated margins in OvR: binary SVM decision function values have different scales; taking $\\arg\\max$ directly favours classifiers with higher variance.`,
      r`OvO combinatorial explosion: for problems with $K > 100$ categories, OvO requires thousands of models, creating severe latency and memory bottlenecks.`,
      r`Softmax overconfidence: the exponential function in Softmax aggressively exaggerates logit gaps, often assigning >99% confidence to inputs far from the training data.`,
      r`Applying Softmax to multi-label problems: Softmax enforces a single mutually exclusive winner; multi-label classification requires independent sigmoid outputs.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
n_per_class, K = 60, 3
centers = [[-1.5, -1.0], [1.5, -1.0], [0.0, 1.8]]
X = np.vstack([np.random.normal(c, 0.6, (n_per_class, 2)) for c in centers])
y = np.repeat([0, 1, 2], n_per_class)
N, p = X.shape
X_b = np.column_stack([np.ones(N), X])

# 1. Softmax regression
W = np.zeros((p + 1, K))
lr = 0.1
for _ in range(250):
    logits = X_b @ W
    exp_z = np.exp(logits - np.max(logits, axis=1, keepdims=True))
    P = exp_z / np.sum(exp_z, axis=1, keepdims=True)
    Y_onehot = np.eye(K)[y]
    W -= lr * (X_b.T @ (P - Y_onehot)) / N

softmax_acc = np.mean(np.argmax(X_b @ W, axis=1) == y)

# 2. One-vs-Rest (OvR) binary logistic models
ovr_probs = np.zeros((N, K))
for k in range(K):
    y_bin = (y == k).astype(float)
    w_bin = np.zeros(p + 1)
    for _ in range(250):
        p_bin = 1.0 / (1.0 + np.exp(-np.clip(X_b @ w_bin, -15, 15)))
        w_bin -= lr * (X_b.T @ (p_bin - y_bin)) / N
    ovr_probs[:, k] = 1.0 / (1.0 + np.exp(-np.clip(X_b @ w_bin, -15, 15)))

ovr_acc = np.mean(np.argmax(ovr_probs, axis=1) == y)

print("Softmax classification accuracy:", round(float(softmax_acc), 3))
print("One-vs-Rest classification accuracy:", round(float(ovr_acc), 3))
print("Sample Softmax row sum:", round(float(np.sum(P[0])), 3))
print("Sample OvR row sum (not constrained to 1):", round(float(np.sum(ovr_probs[0])), 3))`,
    quiz: [
      {
        q: r`How many binary classifiers must be trained to solve a $K$-class problem using the One-vs-One (OvO) strategy?`,
        o: [
          r`$K$`,
          r`$2^K$`,
          r`$\\frac{K(K - 1)}{2}$`,
          r`$K^2$`,
        ],
        a: 2,
        why: r`OvO trains a separate binary classifier for every unique pair of classes, resulting in $\\binom{K}{2} = \\frac{K(K-1)}{2}$ models.`,
      },
      {
        q: r`Why can One-vs-One (OvO) train faster than One-vs-Rest (OvR) when using non-linear Support Vector Machines?`,
        o: [
          r`SVMs scale super-linearly with sample size ($\\mathcal{O}(n^2)$ to $\\mathcal{O}(n^3)$), so training many models on small sub-samples is much cheaper than training $K$ models on the full dataset`,
          r`OvO eliminates the need for computing kernel gram matrices`,
          r`OvO converts non-linear SVMs into linear decision trees`,
          r`OvO only trains on support vectors from the negative class`,
        ],
        a: 0,
        why: r`Because kernel SVM training complexity scales super-linearly with $n$, training $\\approx K^2/2$ models on small datasets of size $2n/K$ requires far less computation than training $K$ models on the full dataset of size $n$.`,
      },
      {
        q: r`What is a major limitation of One-vs-Rest (OvR) when the number of classes $K$ is large?`,
        o: [
          r`It requires all classes to have equal variance`,
          r`It cannot be parallelised across CPU cores`,
          r`It forces all predicted probabilities to sum to zero`,
          r`It induces severe class imbalance, as each binary model trains against $K-1$ pooled classes`,
        ],
        a: 3,
        why: r`In an OvR setup with $K$ classes, each binary classifier compares 1 class against $K-1$ combined classes, exposing the binary learner to severe label imbalance.`,
      },
      {
        q: r`How does Softmax regression ensure that predicted class probabilities are mutually consistent?`,
        o: [
          r`It rounds all negative logits up to zero`,
          r`It normalises exponentiated logits by a shared partition function, guaranteeing probabilities sum to exactly 1.0`,
          r`It trains independent threshold moving rules on each feature`,
          r`It requires each class to be strictly orthogonal in feature space`,
        ],
        a: 1,
        why: r`The Softmax denominator $\\sum_{j=1}^K e^{z_j}$ acts as a normalising partition function, ensuring all outputs are positive and sum to 1.0.`,
      },
    ],
    usedBy: [],
    prereq: ['logistic_regression', 'support_vector_classifier', 'loss-functions'],
    related: ['logistic_regression', 'mlp_classifier', 'confusion-matrix'],
    keywords: 'multiclass one vs rest one vs one ovo ovr softmax multinomial logistic regression categorical cross entropy',
  },
  {
    id: 'class-imbalance-weights-smote-threshold-moving',
    short: 'Class imbalance strategies',
    title: 'Class Imbalance: Sample Weights, SMOTE and Threshold Moving',
    task: 'concepts',
    module: 'Beyond the basics',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Class imbalance biases learning objectives toward majority examples; cost-sensitive sample weighting, synthetic over-sampling (SMOTE), and decision threshold moving restore minority detection.`,
    lead: r`In fraud detection, rare disease screening, and industrial failure monitoring, positive cases typically comprise less than 1% of observations. Conventional algorithms minimise global error, frequently defaulting to trivial majority predictions. Mitigating class imbalance requires targeted intervention: modifying the loss function with class weights, synthesizing minority examples in feature space via SMOTE, or adjusting the decision threshold post-hoc.`,
    intuition: [
      r`Imagine an automated security inspection where 1 in every 1,000 scanned parcels contains contraband. A lazy inspection system that approves every parcel without checking scores an impressive 99.9% accuracy. Under standard unweighted loss functions, machine learning algorithms emulate that lazy inspector: because misclassifying a rare positive carries the exact same penalty as misclassifying an ordinary negative, the optimiser easily minimises total error by sacrificing the minority class completely.`,
      r`Three distinct strategies counteract this majority bias:
1. **Algorithmic weighting**: penalise errors on rare classes proportionally to their scarcity. By weighting positive errors 999 times more heavily than negative errors, gradient updates are dominated by minority misclassifications.
2. **Resampling**: re-balance the training data before fitting. While random over-sampling causes exact duplicates to overfit and under-sampling discards valuable majority data, **SMOTE** (Synthetic Minority Over-sampling Technique) creates synthetic minority instances by interpolating along line segments connecting $k$-nearest minority neighbours.
3. **Threshold moving**: leave the trained model and data untouched, but modify the classification boundary. Standard classifiers assign positive labels when predicted probability $\\hat{P}(Y=1 \\mid x) \\ge 0.5$. In severe imbalance, the optimal threshold according to business costs often lies at $0.05$ or $0.10$.`,
      r`Selecting among these techniques depends on engineering context. Class weighting is computationally lightweight and preserves true posterior probability calibration. SMOTE expands minority coverage in sparse feature regions, though it can interpolate across noise in high-dimensional settings. Threshold moving provides unmatched operational agility: it enables real-time adjustments between Precision and Recall as business costs, fraud rates, and capacity constraints shift, without requiring model retraining.`,
    ],
    analogy: r`If class imbalance is an exam where 99 questions are trivial and 1 is critical, class weighting makes the critical question worth 99 points, SMOTE writes practice questions similar to the hard one, and threshold moving lowers the passing score so nobody fails to attempt it.`,
    steps: [
      r`Measure the imbalance ratio $r = N_{\\text{maj}} / N_{\\text{min}}$ and discard raw accuracy in favour of PR-AUC, balanced accuracy, or $F_\\beta$ scores.`,
      r`Assign inverse-frequency sample weights $w_k = n / (K \\cdot n_k)$ directly in the objective function to equilibrate class gradient contributions.`,
      r`If resampling is desired, apply SMOTE strictly inside cross-validation training folds; never over-sample validation or test data.`,
      r`Train a well-calibrated probabilistic classifier (such as logistic regression or gradient-boosted trees) on the weighted or resampled data.`,
      r`Plot the Precision-Recall curve on held-out validation data to identify the cost-optimal decision threshold $t^*$.`,
      r`Deploy threshold moving in production: classify an instance as positive whenever $\\hat{P}(Y=1 \\mid x) \\ge t^*$.`,
    ],
    math: [
      {
        h: 'Cost-sensitive weighted log-loss',
        tex: r`$$\\mathcal{L}_{\\text{weighted}}(w) = -\\sum_{i=1}^n \\Big[ w_1 \\, y_i \\log p_i + w_0 \\, (1 - y_i) \\log(1 - p_i) \\Big], \\quad w_k = \\frac{n}{K \\cdot n_k}$$`,
        p: r`$w_k$ denotes the class weight, $n$ is total sample size, $K$ is number of classes, and $n_k$ is the frequency of class $k$. Weighting scales gradients so that a rare minority instance exerts equal total influence as abundant majority points during parameter updates.`,
      },
      {
        h: 'SMOTE synthetic sample interpolation',
        tex: r`$$x_{\\text{new}} = x_i + \\lambda \\cdot (x_{(j)} - x_i), \\quad \\lambda \\sim \\mathcal{U}(0, 1)$$`,
        p: r`$x_i$ is a minority seed instance, $x_{(j)}$ is a randomly chosen neighbour from $x_i$'s $k$-nearest minority neighbours, and $\\lambda$ is a uniform random scalar. This generates convex combinations along the line segment connecting neighbouring minority examples in feature space.`,
      },
      {
        h: 'Bayes-optimal decision threshold with asymmetric costs',
        tex: r`$$t^* = \\frac{C_{\\text{FP}} - C_{\\text{TN}}}{(C_{\\text{FP}} - C_{\\text{TN}}) + (C_{\\text{FN}} - C_{\\text{TP}})}$$`,
        p: r`$C_{\\text{FP}}$ represents the cost of a false positive and $C_{\\text{FN}}$ is the cost of a false negative. When missing a positive is 20 times more costly than investigating a false alarm, the Bayes-optimal decision threshold shifts dramatically from $0.5$ down to $t^* \\approx 1 / (1 + 20) \\approx 0.048$.`,
      },
    ],
    keyPoints: [
      r`Accuracy is completely uninformative under severe imbalance; evaluate using Precision-Recall curves, PR-AUC, and cost curves.`,
      r`Never over-sample before splitting: applying SMOTE to the entire dataset before cross-validation causes massive data leakage and optimistic bias.`,
      r`Threshold moving operates entirely post-hoc, allowing real-time tuning of Precision-Recall trade-offs without costly model retraining.`,
      r`Class weighting and threshold moving do not modify input feature geometry, avoiding synthetic noise generation in high dimensions.`,
    ],
    pitfalls: [
      r`Pre-split SMOTE leakage: synthesizing data prior to train-test splitting allows synthetic points derived from test examples to infiltrate training sets.`,
      r`Applying SMOTE to noisy, high-dimensional spaces: linear interpolation between noisy minority outliers creates synthetic points deep inside majority class territory.`,
      r`Ignoring probability distortion from resampling: artificially inflating minority prevalence distorts posterior probability estimates, requiring post-hoc calibration.`,
      r`Optimising standard $F_1$ score without cost calibration: $F_1$ weights Precision and Recall equally ($\\beta=1$), which rarely matches real-world asymmetric business costs.`,
    ],
    code: r`import numpy as np
from scipy.spatial.distance import cdist

np.random.seed(42)
n_maj, n_min = 380, 20
X_maj = np.random.normal([0, 0], 1.0, (n_maj, 2))
X_min = np.random.normal([1.8, 1.8], 0.8, (n_min, 2))
X = np.vstack([X_maj, X_min])
y = np.concatenate([np.zeros(n_maj), np.ones(n_min)])
n_total = len(y)

# 1. SMOTE: generate 60 synthetic minority points via KNN interpolation
dists = cdist(X_min, X_min)
np.fill_diagonal(dists, np.inf)
knn_indices = np.argsort(dists, axis=1)[:, :5]

synthetic_pts = []
for i in range(len(X_min)):
    for _ in range(3):
        neighbor = X_min[np.random.choice(knn_indices[i])]
        synthetic_pts.append(X_min[i] + np.random.uniform(0, 1) * (neighbor - X_min[i]))

# 2. Train logistic regression on original data
X_b = np.column_stack([np.ones(n_total), X])
w = np.zeros(3)
for _ in range(300):
    p = 1.0 / (1.0 + np.exp(-X_b @ w))
    w -= 0.05 * (X_b.T @ (p - y)) / n_total

probs = 1.0 / (1.0 + np.exp(-X_b @ w))

def eval_thresh(t):
    pred = (probs >= t).astype(int)
    tp = np.sum((pred == 1) & (y == 1))
    fp = np.sum((pred == 1) & (y == 0))
    fn = np.sum((pred == 0) & (y == 1))
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0
    return prec, rec, f1

p_50, r_50, f1_50 = eval_thresh(0.5)
p_opt, r_opt, f1_opt = eval_thresh(0.12)

print("Imbalance ratio:", round(float(n_maj / n_min), 1), ": 1")
print("Threshold 0.50 -> Precision:", round(float(p_50), 3), "Recall:", round(float(r_50), 3), "F1:", round(float(f1_50), 3))
print("Threshold 0.12 -> Precision:", round(float(p_opt), 3), "Recall:", round(float(r_opt), 3), "F1:", round(float(f1_opt), 3))
print("Synthetic points generated via SMOTE:", len(synthetic_pts))`,
    quiz: [
      {
        q: r`Why is raw classification accuracy a deceptive metric in highly imbalanced datasets?`,
        o: [
          r`A trivial model that predicts the majority class exclusively achieves high accuracy while detecting zero minority instances`,
          r`Accuracy cannot be calculated when minority samples are fewer than 100`,
          r`Accuracy values oscillate wildly depending on random number seeds`,
          r`Accuracy is mathematically identical to Recall in imbalanced settings`,
        ],
        a: 0,
        why: r`When 99% of samples belong to the majority class, a model predicting majority everywhere scores 99% accuracy while offering zero practical utility.`,
      },
      {
        q: r`Why must resampling techniques like SMOTE only ever be applied inside cross-validation training folds?`,
        o: [
          r`SMOTE is computationally too slow to execute on full datasets`,
          r`Applying SMOTE to the whole dataset before splitting leaks test information into training folds, producing artificially optimistic scores`,
          r`Scikit-learn raises a syntax error if SMOTE is applied outside a pipeline`,
          r`Applying SMOTE to test sets changes feature names`,
        ],
        a: 1,
        why: r`Over-sampling the full dataset synthesises instances between future test points and training points, causing data leakage and unrealistic validation performance.`,
      },
      {
        q: r`How does the SMOTE algorithm generate new synthetic instances?`,
        o: [
          r`By duplicating minority examples and adding Gaussian noise to all columns`,
          r`By inverting the covariance matrix of the majority class`,
          r`By randomly interpolating along line segments connecting $k$-nearest minority neighbours in feature space`,
          r`By generating points using a deep generative adversarial network`,
        ],
        a: 2,
        why: r`SMOTE takes a minority sample, identifies its $k$-nearest minority neighbours, and creates synthetic points along the convex line segments joining them: $x_{\\text{new}} = x_i + \\lambda(x_{(j)} - x_i)$.`,
      },
      {
        q: r`What is the primary operational advantage of threshold moving over retraining with class weights or SMOTE?`,
        o: [
          r`Threshold moving guarantees 100% precision and recall simultaneously`,
          r`Threshold moving eliminates the need for computing predicted probabilities`,
          r`Threshold moving works without requiring any validation data`,
          r`It allows real-time adjustment of Precision and Recall trade-offs to match fluctuating business costs without retraining the model`,
        ],
        a: 3,
        why: r`Threshold moving adjusts the decision boundary $t^*$ post-hoc on predicted probabilities, allowing instant operational tuning as business conditions shift.`,
      },
    ],
    usedBy: [],
    prereq: ['logistic_regression', 'confusion-matrix', 'cross-validation'],
    related: ['cost-vs-loss-vs-error', 'probability-calibration-platt-scaling-isotonic-reliability-curves', 'decision_tree_classifier'],
    keywords: 'class imbalance smote sample weights threshold moving precision recall fraud detection cost sensitive learning',
  },
  {
    id: 'probability-calibration-platt-scaling-isotonic-reliability-curves',
    short: 'Probability calibration',
    title: 'Probability Calibration: Platt Scaling, Isotonic Regression and Reliability Curves',
    task: 'concepts',
    module: 'Beyond the basics',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Probability calibration aligns raw classifier confidence scores with true empirical event rates, diagnosed using reliability curves and corrected via Platt scaling or isotonic regression.`,
    lead: r`A classification model can achieve high accuracy and strong AUC while outputting completely uncalibrated confidence scores: when it outputs 0.90 probability, the positive outcome may occur only 50% of the time. In clinical risk estimation, insurance underwriting, and automated fraud routing, numerical probabilities must be reliable. Reliability diagrams diagnose miscalibration, while Platt scaling and Isotonic regression map distorted margins into calibrated posterior probabilities.`,
    intuition: [
      r`Imagine a meteorology app that announces an 80% chance of rain. If you review all 100 days across the year where the app posted an 80% forecast, did it actually rain on approximately 80 of those days? If it only rained on 45 of those days, the forecast is severely overconfident. Conversely, if it rained on 98 of those days, the forecast is underconfident. A classifier is well-calibrated if a predicted probability of $p$ directly corresponds to an empirical positive frequency of $p$.`,
      r`Different model architectures exhibit characteristic calibration flaws:
- **Support Vector Machines (SVMs)** output uncalibrated signed distances to the separating hyperplane; standard margins have no probabilistic meaning.
- **Naive Bayes** pushes probabilities toward 0.0 and 1.0 because multiplying correlated feature probabilities compounds evidence, producing a distinct sigmoidal distortion in reliability curves.
- **Deep Neural Networks** with modern regularisation (dropout, weight decay, cross-entropy over-parameterisation) are systematically overconfident: they achieve high accuracy while assigning 99% confidence to borderline instances (Guo et al., 2017).
- **Random Forests** struggle near 0 and 1 because tree leaf averaging pushes ensemble predictions inward toward the historical base rate.`,
      r`To calibrate a model, we fit a monotonic post-processing function $g(s)$ on held-out validation data. **Platt scaling** fits a two-parameter logistic sigmoid $1 / (1 + e^{A s + B})$, making it ideal for sigmoidal distortions (such as SVM margins) or modest validation sets ($n < 1,000$). **Isotonic regression** fits a non-parametric, piece-wise constant non-decreasing step function using the Pool Adjacent Violators Algorithm (PAVA). Isotonic regression can correct arbitrary monotonic distortions without parametric assumptions, but requires larger validation datasets to prevent step-fitting overfitting.`,
    ],
    analogy: r`Calibration is like zeroing and aligning a bathroom scale: the scale might accurately tell you that you weigh more than your friend (ranking discrimination), but until it is calibrated against certified weights, you cannot trust the actual number on the display.`,
    steps: [
      r`Generate uncalibrated decision scores or raw probabilities $s_i$ on a dedicated held-out validation set (never calibrate on training data).`,
      r`Construct a **Reliability Diagram (Calibration Curve)**: bin predictions into $M$ equal intervals (e.g. $[0, 0.1), [0.1, 0.2), \\dots$) and plot mean predicted confidence against observed fraction of positives.`,
      r`Compute the **Expected Calibration Error (ECE)** and **Brier Score** to quantify baseline calibration error.`,
      r`Select a calibrator: choose **Platt Scaling** if the miscalibration is sigmoidal or validation data is modest ($n < 1,000$), or **Isotonic Regression** if the distortion is non-sigmoidal and validation data is plentiful.`,
      r`Fit the post-processing calibration mapping $g(s)$ on validation scores using maximum likelihood or least squares.`,
      r`Apply the fitted calibrator to test predictions, verifying that ECE and Brier score improve while ROC-AUC ranking discrimination remains preserved.`,
    ],
    math: [
      {
        h: 'Definition of perfect calibration',
        tex: r`$$\\mathbb{P}\\big(Y = 1 \\mid \\hat{P} = p\\big) = p \\quad \\forall p \\in [0, 1]$$`,
        p: r`$\\hat{P}$ is the model's predicted probability, and $Y \\in \\{0, 1\\}$ is the true binary label. Perfect calibration guarantees that among all instances assigned probability $p$, exactly a fraction $p$ are positive outcomes.`,
      },
      {
        h: 'Expected Calibration Error (ECE)',
        tex: r`$$\\operatorname{ECE} = \\sum_{m=1}^M \\frac{|B_m|}{n} \\Big| \\operatorname{acc}(B_m) - \\operatorname{conf}(B_m) \\Big|$$`,
        p: r`Predictions are grouped into $M$ bins $B_m$. $|B_m|/n$ is the bin sample weight, $\\operatorname{acc}(B_m) = \\frac{1}{|B_m|}\\sum_{i \\in B_m} y_i$ is empirical bin accuracy, and $\\operatorname{conf}(B_m) = \\frac{1}{|B_m|}\\sum_{i \\in B_m} \\hat{p}_i$ is mean predicted confidence. ECE computes the weighted absolute divergence between confidence and reality.`,
      },
      {
        h: 'Platt scaling and Isotonic regression',
        tex: r`$$\\hat{P}_{\\text{Platt}} = \\frac{1}{1 + \\exp(A s + B)}, \\quad \\min_{g} \\sum_{i=1}^n \\big(y_i - g(s_i)\\big)^2 \\;\\; \\text{s.t.} \\;\\; g(s_i) \\le g(s_j) \\text{ for } s_i \\le s_j$$`,
        p: r`Platt scaling optimises parameters $A$ and $B$ via negative log-likelihood on validation margins $s_i$. Isotonic regression fits a non-parametric monotonic step function $g(s)$ via the Pool Adjacent Violators Algorithm (PAVA), preserving rank order while minimising mean squared error.`,
      },
    ],
    keyPoints: [
      r`Discrimination vs Calibration: ROC-AUC evaluates ranking discrimination, whereas calibration evaluates whether probability magnitudes match empirical event frequencies.`,
      r`Monotonicity preservation: monotonic calibrators (Platt scaling and Isotonic regression) do not alter prediction rank order, leaving ROC-AUC completely unchanged.`,
      r`The Brier Score ($\\frac{1}{n}\\sum (y_i - \\hat{p}_i)^2$) decomposes mathematically into uncertainty, reliability (calibration error), and resolution (discrimination).`,
      r`Always calibrate on held-out data: fitting calibration transformations on training sets perpetuates model overconfidence.`,
    ],
    pitfalls: [
      r`Calibrating on the training set: training predictions are naturally overconfident; calibrating on them freezes this overconfidence into production.`,
      r`Overfitting with Isotonic Regression on small samples ($n < 500$): unconstrained step functions fit sample noise, producing flat, discontinuous probability steps.`,
      r`Assuming high ROC-AUC implies good calibration: modern deep neural networks with 95% AUC frequently exhibit severe calibration drift.`,
      r`Class prevalence shifts: calibration parameters $A$ and $B$ are sensitive to the base rate of the calibration set; if test prevalence shifts, probabilities become biased.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
n = 300
z = np.random.normal(0, 1.2, n)
p_true = 1.0 / (1.0 + np.exp(-z))
y = (np.random.uniform(0, 1, n) < p_true).astype(int)

# Uncalibrated raw decision margins
raw_scores = 2.5 * z + 0.8

def compute_ece(probs, labels, M=5):
    bins = np.linspace(0, 1, M + 1)
    ece = 0.0
    for m in range(M):
        mask = (probs >= bins[m]) & (probs < bins[m+1] if m < M-1 else probs <= bins[m+1])
        if np.sum(mask) == 0: continue
        bin_acc = np.mean(labels[mask])
        bin_conf = np.mean(probs[mask])
        ece += (np.sum(mask) / len(labels)) * abs(bin_acc - bin_conf)
    return ece

# Raw min-max scaled scores
p_raw = (raw_scores - raw_scores.min()) / (raw_scores.max() - raw_scores.min())
ece_raw = compute_ece(p_raw, y)
brier_raw = np.mean((p_raw - y)**2)

# Platt scaling: fit A, B via gradient descent on validation log-loss
A, B = -1.0, 0.0
lr = 0.05
for _ in range(500):
    logits = A * raw_scores + B
    p_platt = 1.0 / (1.0 + np.exp(-np.clip(logits, -15, 15)))
    A -= lr * np.mean((p_platt - y) * raw_scores)
    B -= lr * np.mean(p_platt - y)

p_cal = 1.0 / (1.0 + np.exp(-np.clip(A * raw_scores + B, -15, 15)))
ece_cal = compute_ece(p_cal, y)
brier_cal = np.mean((p_cal - y)**2)

print("Fitted Platt parameters: A =", round(float(A), 3), "B =", round(float(B), 3))
print("Uncalibrated ECE:", round(float(ece_raw), 3), "Brier Score:", round(float(brier_raw), 3))
print("Platt Calibrated ECE:", round(float(ece_cal), 3), "Brier Score:", round(float(brier_cal), 3))`,
    quiz: [
      {
        q: r`When is Platt scaling generally preferred over Isotonic regression for probability calibration?`,
        o: [
          r`When the validation sample size is relatively small ($n < 1,000$) and the distortion is approximately sigmoidal`,
          r`When the base classifier is a decision tree with more than 100 leaves`,
          r`When the target variable is continuous rather than binary`,
          r`When training data contains missing values`,
        ],
        a: 0,
        why: r`Platt scaling fits only two parameters ($A$ and $B$), avoiding the step-function overfitting that Isotonic regression suffers from on small validation samples.`,
      },
      {
        q: r`What does it mean for a probabilistic classifier to be "well-calibrated"?`,
        o: [
          r`The classifier achieves 100% training accuracy`,
          r`When the model predicts probability $p$, the empirical relative frequency of the positive outcome is approximately $p$`,
          r`The decision boundary is strictly linear`,
          r`All false positives and false negatives have equal cost`,
        ],
        a: 1,
        why: r`Calibration evaluates whether predicted probability values match true observed event rates: an 80% prediction should be correct roughly 80% of the time.`,
      },
      {
        q: r`What effect does monotonic calibration (such as Platt scaling or Isotonic regression) have on a classifier's ROC-AUC score?`,
        o: [
          r`It drastically increases the ROC-AUC score`,
          r`It reduces the ROC-AUC score to exactly 0.5`,
          r`It leaves the ROC-AUC score completely unchanged because monotonic transformations preserve sample rank ordering`,
          r`It inverts the ROC curve across the diagonal`,
        ],
        a: 2,
        why: r`ROC-AUC depends purely on the relative rank order of predicted scores. Monotonic transformations preserve rank ordering, leaving the ROC curve and its AUC invariant.`,
      },
      {
        q: r`Why are raw decision margins from Support Vector Machines (SVMs) uncalibrated?`,
        o: [
          r`SVMs can only predict discrete integer labels`,
          r`SVM decision margins are always negative numbers`,
          r`SVM kernels eliminate variance across all data points`,
          r`SVM margins measure geometric perpendicular distances to the separating hyperplane rather than probabilistic likelihoods`,
        ],
        a: 3,
        why: r`Standard SVMs optimise geometric margins, not likelihoods. The output $w^T x + b$ represents distance to the hyperplane, which carries no direct probabilistic meaning without post-hoc scaling.`,
      },
    ],
    usedBy: [],
    prereq: ['support_vector_classifier', 'logistic_regression', 'confusion-matrix'],
    related: ['class-imbalance-weights-smote-threshold-moving', 'loss-functions', 'cross-validation'],
    keywords: 'probability calibration platt scaling isotonic regression reliability curves brier score expected calibration error ece',
  },
];
