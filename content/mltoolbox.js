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
from scipy.optimise import linprog

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
    id: "poisson-and-tweedie-regression",
    short: "Poisson & Tweedie reg.",
    title: "Poisson and Tweedie Regression",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Model count data and zero-inflated continuous payouts: understand GLMs for non-negative responses, log link functions, overdispersion, and compound Poisson-gamma Tweedie distributions.",
    lead: "Ordinary least squares assumes constant Gaussian error variance and produces negative predictions for counts and costs. Poisson and Tweedie regression model positive, skewed, and zero-inflated targets using tailored exponential dispersion families.",
    intuition: [
      "Standard linear regression encounters serious failures when the target variable is a non-negative count (such as daily website sign-ups, hospital admissions, or insurance claims) or a continuous monetary payout with an exact point mass at zero (such as warranty repair payouts or customer credit defaults). OLS can produce negative predicted values, predicts fractional values for discrete events, and violates homoscedasticity because variance typically grows with the expected value.",
      "Poisson regression addresses discrete count data by placing the response within the generalised Linear Model (GLM) framework. Using a log link function $\\log(\\mu_i) = x_i^T \\beta$, the conditional mean $\\mu_i = \\exp(x_i^T \\beta)$ is guaranteed to remain strictly positive. The model assumes an equi-dispersion property: the conditional variance equals the conditional mean, $\\operatorname{Var}(Y_i \\mid x_i) = \\mu_i$. When empirical data violates this assumption—frequently due to unobserved heterogeneity causing overdispersion (variance exceeding the mean)—analysts upgrade to Quasi-Poisson or Negative Binomial regression.",
      "In insurance pricing and marketing spend modelling, target variables often exhibit a compound nature: many observations are exactly zero (no insurance claim filed), but when non-zero, the cost is a continuous, heavily right-skewed positive monetary sum. Modelling this requires a compound Poisson-gamma distribution, formalised as a Tweedie distribution with power parameter $p \\in (1, 2)$.",
      "Under the Tweedie family, variance scales as $\\operatorname{Var}(Y) = \\phi \\mu^p$. When $p = 0$, the family recovers the Gaussian distribution; $p = 1$ is the Poisson; $p = 2$ is the Gamma; and $p = 3$ is the Inverse Gaussian. For $1 < p < 2$, the Tweedie distribution seamlessly models zero-inflated continuous responses without requiring cumbersome two-stage hurdle models."
    ],
    analogy: "Imagine predicting insurance claims for a fleet of haulage trucks. Most trucks go an entire year without an incident (generating zero payouts). But when a crash occurs, repairs cost thousands of pounds with a long right-skewed tail. A Gaussian model predicts negative £500 payouts for safe drivers, while a pure Gamma model cannot tolerate exact zero payouts. A compound Poisson-gamma Tweedie model matches the reality: a Poisson draw determines how many accidents occur, and an independent Gamma draw sets the severity of each claim.",
    steps: [
      {
        "title": "1. Select response family and verify distribution",
        "body": "Inspect target variable: if integers $y \\in \\{0, 1, 2, \\dots\\}$, evaluate Poisson or Negative Binomial. If zero-inflated continuous sums $y \\ge 0$, specify a Tweedie GLM with $1 < p < 2$ (typically $p \\approx 1.5$)."
      },
      {
        "title": "2. Specify log link function and linear predictor",
        "body": "Relate features to expected response via log link: $\\eta_i = x_i^T \\beta$ and $\\mu_i = g^{-1}(\\eta_i) = \\exp(\\eta_i)$. For rate models over differing exposure periods $t_i$, include an offset term $\\log(t_i)$."
      },
      {
        "title": "3. Fit coefficients via Iteratively Reweighted Least Squares (IRLS)",
        "body": "Maximise the log-likelihood or quasi-likelihood using Fisher scoring / Newton–Raphson, iteratively updating working weights $W = \\operatorname{diag}(\\mu_i)$ and working responses $z_i = \\eta_i + (y_i - \\mu_i)/\\mu_i$."
      },
      {
        "title": "4. Check dispersion and evaluate deviance",
        "body": "Compute Pearson dispersion statistic $\\chi^2 / (n - p)$. If significantly greater than 1 in Poisson regression, fit a Negative Binomial or adjust standard errors with a quasi-likelihood dispersion parameter $\\hat{\\phi}$."
      }
    ],
    math: [
      {
        "h": "Poisson Log-Likelihood and Score Equation",
        "tex": "\\ell(\\beta) = \\sum_{i=1}^n \\left( y_i x_i^T \\beta - \\exp(x_i^T \\beta) - \\log(y_i!) \\right), \\quad \\nabla_\\beta \\ell(\\beta) = \\sum_{i=1}^n (y_i - \\mu_i) x_i = 0",
        "p": "The score equation shows that maximum likelihood estimates match the weighted sum of residuals to zero. The Hessian is strictly negative definite, guaranteeing a unique global optimum."
      },
      {
        "h": "Tweedie Variance Function and Power Parameter",
        "tex": "\\operatorname{Var}(Y) = \\phi \\cdot V(\\mu) = \\phi \\cdot \\mu^p, \\quad p = \\frac{q - 2}{q - 1} \\in (1, 2)",
        "p": "For p in (1, 2), Y is represented as the sum of N independent Gamma random variables where N is Poisson-distributed, creating a valid probability density with a positive point mass at Y = 0."
      },
      {
        "h": "Tweedie Deviance Function",
        "tex": "d(y, \\mu) = 2 \\left( \\frac{y^{2-p}}{(1-p)(2-p)} - \\frac{y \\mu^{1-p}}{1-p} + \\frac{\\mu^{2-p}}{2-p} \\right)",
        "p": "The unit deviance measures distance between observed response y and fitted expectation mu, replacing residual sum of squares during loss optimisation and cross-validation."
      }
    ],
    code: "import numpy as np\n\n# Poisson GLM via Iteratively Reweighted Least Squares (IRLS) from scratch\nnp.random.seed(42)\nn_samples = 500\n\n# Synthetic features and true rate parameters\nx1 = np.random.normal(0, 1, n_samples)\nx2 = np.random.uniform(-1, 1, n_samples)\nX = np.column_stack([np.ones(n_samples), x1, x2])\n\ntrue_beta = np.array([1.2, 0.6, -0.4])\nmu_true = np.exp(X @ true_beta)\n# Sample Poisson counts\ny = np.random.poisson(mu_true)\n\n# IRLS Algorithm for Poisson GLM with Log Link\nbeta = np.zeros(X.shape[1])\nmax_iters = 20\ntol = 1e-8\n\nfor it in range(max_iters):\n    eta = X @ beta\n    mu = np.exp(eta)\n    \n    # Weight matrix W and working response z\n    # For Poisson log link: W_ii = mu_i, z_i = eta_i + (y_i - mu_i) / mu_i\n    W = mu\n    z = eta + (y - mu) / mu\n    \n    # Weighted least squares update: (X^T W X) beta_new = X^T W z\n    XTW = X.T * W\n    beta_new = np.linalg.solve(XTW @ X, XTW @ z)\n    \n    diff = np.max(np.abs(beta_new - beta))\n    beta = beta_new\n    if diff < tol:\n        break\n\n# Compute standard errors from Fisher information matrix\ncov_matrix = np.linalg.inv(X.T @ (X * mu[:, None]))\nse_beta = np.sqrt(np.diag(cov_matrix))\n\n# Compute Pearson dispersion statistic to check for overdispersion\npearson_chi2 = np.sum((y - mu)**2 / mu)\ndispersion = pearson_chi2 / (n_samples - len(beta))\n\nprint(f\"True coefficients:     {true_beta}\")\nprint(f\"Estimated Poisson beta: {beta.round(4)}\")\nprint(f\"Standard errors:        {se_beta.round(4)}\")\nprint(f\"Pearson dispersion:     {dispersion:.3f} (approx 1 indicates no overdispersion)\")\n\n# Tweedie 1.5 Compound Poisson-Gamma Simulation\n# When y has point mass at zero and positive continuous payout\np = 1.5\nn_claims = np.random.poisson(lam=0.3, size=200)\nseverity = np.where(n_claims > 0, np.random.gamma(shape=2.0, scale=500.0, size=200), 0.0)\nprint(f\"Tweedie data zero fraction: {np.mean(severity == 0)*100:.1f}%\")\nprint(f\"Mean non-zero claim: £{np.mean(severity[severity > 0]):.2f}\")",
    keyPoints: [
      "Poisson regression models discrete non-negative counts $y \\in \\{0, 1, 2, \\dots\\}$ using a log link function that guarantees positive predicted means.",
      "Equi-dispersion assumption: Poisson assumes $\\operatorname{Var}(Y) = \\mathbb{E}[Y]$. Overdispersion (variance > mean) requires Quasi-Poisson or Negative Binomial models.",
      "Tweedie distributions parameterised by power parameter $p \\in (1, 2)$ represent a compound Poisson-gamma process with an exact point mass at zero and continuous positive tail.",
      "Eliminates the need for awkward log(y + 1) heuristics or separate two-stage classification/regression pipelines in insurance and marketing pricing.",
      "Estimated via Iteratively Reweighted Least Squares (IRLS), which converges rapidly due to global convexity of exponential dispersion deviance."
    ],
    pitfalls: [
      "Applying standard OLS to log(y + 1): Adding arbitrary pseudo-counts introduces arbitrary bias depending on measurement units, distorting slope estimates.",
      "Ignoring overdispersion in Poisson regression: When data has variance greater than the mean, Poisson point estimates remain consistent but standard errors are severely underestimated, producing false-positive p-values.",
      "Overlooking exposure periods: When observations span differing intervals (e.g. 1 month vs 12 months), failing to include $\\log(exposure)$ as an offset estimates average counts rather than true rates."
    ],
    quiz: [
      {
        "q": "Why is Tweedie regression with power parameter p = 1.5 particularly suited for insurance claim payouts?",
        "o": [
          "It naturally accommodates a point mass at zero (no claims) and a positive right-skewed continuous payout for claims in a single model",
          "It transforms count data into a standard uniform distribution",
          "It assumes errors are normally distributed with zero mean",
          "It requires no iterations or numerical optimisation to fit"
        ],
        "a": 0,
        "why": "Tweedie distributions with 1 < p < 2 represent compound Poisson-gamma distributions, giving a discrete probability at zero combined with continuous Gamma payouts for non-zero events."
      },
      {
        "q": "What should a modeller do if the Pearson dispersion statistic chi^2 / (n - p) for a fitted Poisson GLM equals 4.8?",
        "o": [
          "Switch to a Negative Binomial GLM or apply quasi-Poisson standard error adjustments to account for overdispersion",
          "Use ordinary linear regression with mean squared error loss instead",
          "Add 1 to all count observations and refit",
          "Assume the Poisson model is valid because 4.8 is greater than zero"
        ],
        "a": 0,
        "why": "A dispersion statistic of 4.8 indicates severe overdispersion (variance is almost 5 times the mean). Standard Poisson SEs are heavily underestimated; Negative Binomial or Quasi-Poisson correction is required."
      }
    ],
    usedBy: [],
    prereq: [
      "generalised-linear-models",
      "ols-inference-t-tests-f-test-r2-and-adjusted-r2"
    ],
    related: [
      "generalised-linear-models",
      "logistic-regression-inference-odds-ratios-wald-tests",
      "residual-diagnostics-and-heteroscedasticity"
    ],
    keywords: "poisson regression, tweedie regression, generalised linear models, overdispersion, negative binomial, compound poisson gamma, count data"
  },
  {
    id: "isotonic-regression",
    short: "Isotonic regression",
    title: "Isotonic Regression",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 14,
    noLab: true,
    summary: "Fit a non-parametric, monotonic increasing step function to 1D data: master the Pool Adjacent Violators Algorithm (PAVA) and probability calibration.",
    lead: "When physical domain knowledge dictates that response y must increase monotonically with predictor x, linear models enforce too much rigidity while splines can wiggle. Isotonic regression finds the exact least-squares monotonic fit using piecewise constant steps.",
    intuition: [
      "In many scientific and business applications, the relationship between a predictor $x$ and target $y$ is strictly monotonic: dose-response curves in clinical pharmacology (higher drug concentration never decreases toxicity), customer pricing sensitivity, credit score default risk, and probability calibration. However, the exact parametric mathematical form (whether linear, exponential, or sigmoidal) is completely unknown.",
      "Linear regression imposes a rigid straight line, which can fail catastrophically if the true relationship is non-linear. High-degree polynomials or unconstrained smoothing splines can capture curvature, but frequently oscillate or violate monotonicity on unobserved gaps, generating nonsense predictions.",
      "Isotonic regression solves this dilemma through non-parametric shape-constrained estimation. It finds a sequence of fitted values $\\hat{y}_i$ that minimises the sum of squared errors $\\sum_{i=1}^n w_i (y_i - \\hat{y}_i)^2$ subject strictly to the monotonicity ordering constraint: $x_i \\le x_j \\implies \\hat{y}_i \\le \\hat{y}_j$. The resulting model is a non-decreasing piecewise constant step function that conforms flexibly to arbitrary monotonic shapes without assuming any predefined mathematical curve.",
      "A premier modern application of isotonic regression is classifier calibration. Machine learning models such as Random Forests, Naive Bayes, or boosted trees output raw scores that rank samples effectively but do not represent well-calibrated probabilities. Isotonic regression maps raw classifier scores into calibrated posterior probabilities non-parametrically, outperforming Platt scaling when the distortion is non-sigmoidal."
    ],
    analogy: "Imagine constructing a wheelchair access ramp across a hillside terrain of jagged mounds and dips. You must grade the dirt such that every point on the path is at least as high as all preceding points (monotonic ascent). Whenever you encounter a downward dip, you must shovel soil from the peak into the valley until both settle into a single flat terrace. The Pool Adjacent Violators Algorithm performs exactly this earth-moving process: pooling violating dips into flat monotonic steps.",
    steps: [
      {
        "title": "1. Sort observations by predictor x",
        "body": "Order the dataset such that $x_1 \\le x_2 \\le \\dots \\le x_n$. Associate each point with observation $y_i$ and non-negative weight $w_i$ (default $w_i = 1$)."
      },
      {
        "title": "2. Initialise fitted values to raw responses",
        "body": "Set initial candidates $\\hat{y}_i = y_i$ for all $i = 1, \\dots, n$."
      },
      {
        "title": "3. Execute Pool Adjacent Violators Algorithm (PAVA)",
        "body": "Scan from left to right. Whenever a monotonicity violation $\\hat{y}_i > \\hat{y}_{i+1}$ occurs, merge the two adjacent groups into a pooled block, setting the joint value to their weighted average: $\\bar{y} = (w_i \\hat{y}_i + w_{i+1} \\hat{y}_{i+1}) / (w_i + w_{i+1})$."
      },
      {
        "title": "4. Back-track and propagate merges",
        "body": "After merging, check if the newly pooled value violates monotonicity with preceding blocks. Back-track and merge leftwards until the entire sequence up to the current point satisfies monotonicity. Continue to the end of the sequence."
      }
    ],
    math: [
      {
        "h": "Constrained Least-Squares Formulation",
        "tex": "\\min_{\\hat{y}_1, \\dots, \\hat{y}_n} \\sum_{i=1}^n w_i (y_i - \\hat{y}_i)^2 \\quad \\text{subject to} \\quad \\hat{y}_1 \\le \\hat{y}_2 \\le \\dots \\le \\hat{y}_n",
        "p": "The quadratic objective is strictly convex, and the constraint set is a closed convex cone (the isotonic cone). This guarantees the existence of a unique global minimiser."
      },
      {
        "h": "PAVA Pooling Condition",
        "tex": "\\bar{y}_{A \\cup B} = \\frac{\\sum_{i \\in A} w_i y_i + \\sum_{j \\in B} w_j y_j}{\\sum_{i \\in A} w_i + \\sum_{j \\in B} w_j}",
        "p": "When group A violates monotonicity with successor B (y_A > y_B), the constrained minimiser across their union is exactly the weighted sample mean of both groups combined."
      },
      {
        "h": "Probability Calibration Error (ECE)",
        "tex": "\\mathrm{ECE} = \\sum_{m=1}^M \\frac{|B_m|}{n} \\left| \\operatorname{acc}(B_m) - \\operatorname{conf}(B_m) \\right|",
        "p": "Expected Calibration Error measures calibration discrepancy across probability bins B_m. Isotonic calibration fits a non-decreasing mapping from raw model confidence to empirical accuracy."
      }
    ],
    code: "import numpy as np\n\n# Pool Adjacent Violators Algorithm (PAVA) from scratch\ndef isotonic_regression_pava(y, w=None):\n    n = len(y)\n    if w is None:\n        w = np.ones(n, dtype=float)\n    else:\n        w = np.array(w, dtype=float)\n        \n    # Stack stores: [weight, sum_wy, y_mean, start_idx, end_idx]\n    stack = []\n    \n    for i in range(n):\n        curr_w = w[i]\n        curr_sum = w[i] * y[i]\n        curr_mean = y[i]\n        start_idx = i\n        end_idx = i\n        \n        # Check for monotonicity violation with top of stack\n        while stack and stack[-1][2] >= curr_mean:\n            prev_w, prev_sum, _, prev_start, _ = stack.pop()\n            curr_w += prev_w\n            curr_sum += prev_sum\n            curr_mean = curr_sum / curr_w\n            start_idx = prev_start\n            \n        stack.append((curr_w, curr_sum, curr_mean, start_idx, end_idx))\n        \n    # Unpack fitted values\n    y_hat = np.zeros(n, dtype=float)\n    for block_w, block_sum, block_mean, s, e in stack:\n        y_hat[s:e+1] = block_mean\n        \n    return y_hat\n\n# Synthetic noisy monotonic dose-response curve\nnp.random.seed(42)\nn_samples = 40\nx = np.linspace(0, 10, n_samples)\ntrue_response = 1.0 / (1.0 + np.exp(-(x - 5)))  # Sigmoidal response\nnoise = np.random.normal(0, 0.15, n_samples)\ny_noisy = true_response + noise\n\n# Fit isotonic regression\ny_iso = isotonic_regression_pava(y_noisy)\n\n# Verify strict monotonicity\nis_monotonic = np.all(np.diff(y_iso) >= 0)\nmse_raw = np.mean((y_noisy - true_response)**2)\nmse_iso = np.mean((y_iso - true_response)**2)\n\nprint(f\"Number of samples:          {n_samples}\")\nprint(f\"Isotonic fit is monotonic:  {is_monotonic}\")\nprint(f\"Number of unique flat steps: {len(np.unique(y_iso))}\")\nprint(f\"Raw noisy MSE to truth:     {mse_raw:.4f}\")\nprint(f\"Isotonic MSE to truth:      {mse_iso:.4f} (noise filtered)\")\nprint(f\"First 5 fitted step values: {np.unique(y_iso)[:5].round(3)}\")",
    keyPoints: [
      "Non-parametric shape-constrained regression: enforces strict monotonicity ($x_i \\le x_j \\implies \\hat{y}_i \\le \\hat{y}_j$) without assuming any specific mathematical curve.",
      "Solved exactly in $O(n)$ time using the Pool Adjacent Violators Algorithm (PAVA).",
      "Yields a piecewise constant step function with horizontal plateaus wherever adjacent points were pooled.",
      "Widely utilised for classifier probability calibration, non-parametrically mapping raw classifier scores into true posterior probabilities.",
      "Highly prone to severe overfitting on small datasets ($n < 1000$) where steps capture noisy spikes; Platt scaling is safer when sample sizes are small."
    ],
    pitfalls: [
      "Overfitting on small sample sizes: In small datasets, isotonic calibration creates step-like over-fitting where probabilities are squashed onto zero or one plateaus.",
      "Out-of-sample extrapolation failure: Isotonic regression cannot extrapolate outside observed ranges of $x$; points below $\\min(x)$ or above $\\max(x)$ are clamped to boundary step values.",
      "Multivariate curse of dimensionality: True multi-dimensional isotonic regression is an NP-hard partial order problem; PAVA applies strictly to 1D ordered arrays."
    ],
    quiz: [
      {
        "q": "How does the Pool Adjacent Violators Algorithm (PAVA) resolve a monotonicity violation where y_i > y_{i+1}?",
        "o": [
          "It pools the adjacent violating observations and replaces both with their weighted average",
          "It deletes the offending observation from the dataset",
          "It sets the violating point to zero",
          "It rotates the coordinate axis until the slope becomes positive"
        ],
        "a": 0,
        "why": "When y_i > y_{i+1}, least-squares under ordering constraints forces hat{y}_i = hat{y}_{i+1}; the least-squares optimum for a pooled group is its weighted sample average."
      },
      {
        "q": "When should a practitioner choose Platt scaling over Isotonic regression for probability calibration?",
        "o": [
          "When the dataset is small (e.g. fewer than 1000 samples) to prevent isotonic step-fitting from overfitting",
          "When the true calibration curve is non-monotonic",
          "When the calibration dataset has over 1,000,000 samples",
          "When the target variable is continuous regression rather than binary classification"
        ],
        "a": 0,
        "why": "Platt scaling is parametric (fitting a 2-parameter logistic sigmoid), making it resistant to overfitting on small validation sets, whereas non-parametric isotonic regression overfits small samples."
      }
    ],
    usedBy: [],
    prereq: [
      "ols-inference-t-tests-f-test-r2-and-adjusted-r2"
    ],
    related: [
      "logistic-regression-inference-odds-ratios-wald-tests",
      "poisson-and-tweedie-regression",
      "pls-and-principal-component-regression"
    ],
    keywords: "isotonic regression, pava, pool adjacent violators, monotonicity, calibration, probability calibration, shape constrained regression"
  },
  {
    id: "pls-and-principal-component-regression",
    short: "PLS & PCR",
    title: "Partial Least Squares and Principal Component Regression",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Solve severe multicollinearity and high dimensions by projecting features onto low-dimensional latent subspaces: compare unsupervised PCR with covariance-maximising supervised PLS.",
    lead: "When predictors outnumber samples (p >> n) or exhibit collinearity, OLS is rank-deficient or unstable. PCR projects onto top variance directions without looking at the target; PLS finds latent components that simultaneously maximise covariance between predictors and the target.",
    intuition: [
      "In modern high-dimensional settings—such as spectroscopy in chemometrics, genomics, or financial factor models—we frequently encounter hundreds or thousands of features with high inter-correlation, often exceeding sample size ($p \\gg n$). Under these conditions, the ordinary least squares covariance matrix $X^T X$ is singular or ill-conditioned, blowing up coefficient variances and destroying generalisation.",
      "Principal Component Regression (PCR) addresses this problem via a two-stage pipeline: first, perform Principal Component Analysis (PCA) on feature matrix $X$ to extract the top $k$ orthogonal principal components; second, fit an ordinary least squares regression using these $k$ components as predictors. Because components are orthogonal, multicollinearity vanishes completely, and dimension is reduced from $p$ to $k$.",
      "However, PCR has a fundamental structural vulnerability: PCA is entirely unsupervised. It constructs components that maximise variance within $X$, paying zero attention to the response $y$. If the variance in $X$ is dominated by background sensor drift or irrelevant noise, PCR selects high-variance noise directions while discarding low-variance directions that actually contain the predictive signal.",
      "Partial Least Squares (PLS) regression resolves this flaw by making the latent component extraction supervised. Instead of maximising variance $\\operatorname{Var}(X w)$, PLS finds weight vectors $w$ that maximise squared sample covariance $\\operatorname{Cov}(X w, y)^2$. By balancing feature variance with target correlation, PLS achieves equal or superior predictive performance to PCR using significantly fewer latent components."
    ],
    analogy: "Imagine scouting a football team. PCR watches players practice alone in an empty field, selecting the players who run the greatest distance and move the fastest (unsupervised feature variance). But some of those players might be running aimlessly without passing or shooting at goal. PLS scouts players during an active match against an opponent, selecting the players whose runs directly result in goals and assists (covariance between player movement and match score).",
    steps: [
      {
        "title": "1. Standardise predictors and centre response",
        "body": "Standardise feature matrix $X$ to zero mean and unit variance ($Z$-scores); centre response vector $y$ to zero mean."
      },
      {
        "title": "2. PCR: compute principal components of X",
        "body": "Perform SVD on $X = U \\Sigma V^T$. Project $X$ onto top $k$ eigenvectors: $T = X V_k$. Fit OLS: $\\hat{\\gamma} = (T^T T)^{-1} T^T y$. Back-transform coefficients to original feature space: $\\hat{\\beta}_{\\mathrm{PCR}} = V_k \\hat{\\gamma}$."
      },
      {
        "title": "3. PLS: extract covariance-maximising components (NIPALS)",
        "body": "Compute cross-product $w_1 = X^T y / \\|X^T y\\|$. Construct score vector $t_1 = X w_1$. Regress $X$ and $y$ onto $t_1$ to compute loadings $p_1 = X^T t_1 / (t_1^T t_1)$ and $q_1 = y^T t_1 / (t_1^T t_1)$."
      },
      {
        "title": "4. Deflate matrices and iterate",
        "body": "Deflate feature matrix $X_{m+1} = X_m - t_m p_m^T$ and response $y_{m+1} = y_m - t_m q_m$. Repeat for $m = 1, \\dots, k$. Select optimal component count $k$ via cross-validation."
      }
    ],
    math: [
      {
        "h": "PCR Estimator",
        "tex": "T_k = X V_k, \\quad \\hat{\\gamma} = (T_k^T T_k)^{-1} T_k^T y, \\quad \\hat{\\beta}_{\\mathrm{PCR}} = V_k (T_k^T T_k)^{-1} T_k^T y",
        "p": "PCR projects predictors onto the first k eigenvectors of sample covariance X^T X, effectively performing OLS on orthogonal latent scores."
      },
      {
        "h": "PLS Objective Function",
        "tex": "\\max_{\\|w\\| = 1} \\operatorname{Cov}(X w, y)^2 = \\max_{\\|w\\| = 1} \\operatorname{Var}(X w) \\operatorname{Corr}(X w, y)^2",
        "p": "PLS simultaneously balances feature variance with response correlation, ensuring latent directions carry both strong descriptive spread and predictive power."
      },
      {
        "h": "NIPALS Deflation Equations",
        "tex": "t_m = X_m w_m, \\quad p_m = \\frac{X_m^T t_m}{t_m^T t_m}, \\quad X_{m+1} = X_m - t_m p_m^T, \\quad y_{m+1} = y_m - t_m \\frac{y_m^T t_m}{t_m^T t_m}",
        "p": "Subtracting the outer product of score t_m and loading p_m orthogonalises remaining feature space, preventing duplicate information in subsequent components."
      }
    ],
    code: "import numpy as np\n\n# Principal Component Regression (PCR) vs Partial Least Squares (PLS) from scratch\nnp.random.seed(42)\nn_samples = 80\nn_features = 20\n\n# Create collinear high-dimensional features\nlatent = np.random.normal(0, 1, (n_samples, 3))\n# Features: 10 correlate with latent 0, 5 with latent 1, 5 are high-variance noise\nX_signal = latent @ np.random.normal(0, 1, (3, 15))\nX_noise = np.random.normal(0, 3.0, (n_samples, 5))  # High variance noise!\nX = np.hstack([X_signal, X_noise])\n# True response depends ONLY on latent[0] (low total variance compared to noise)\ny = 3.0 * latent[:, 0] - 2.0 * latent[:, 1] + np.random.normal(0, 0.5, n_samples)\n\n# Standardise X and centre y\nX_std = (X - np.mean(X, axis=0)) / np.std(X, axis=0)\ny_std = y - np.mean(y)\n\n# 1. PCR Implementation (Unsupervised SVD)\ndef fit_pcr(X, y, k):\n    U, S, Vt = np.linalg.svd(X, full_matrices=False)\n    V_k = Vt[:k, :].T\n    T_k = X @ V_k\n    gamma = np.linalg.lstsq(T_k, y, rcond=None)[0]\n    beta_pcr = V_k @ gamma\n    return beta_pcr\n\n# 2. PLS Implementation (Supervised NIPALS)\ndef fit_pls(X, y, k):\n    n, p = X.shape\n    X_m = X.copy()\n    y_m = y.copy()\n    \n    W = np.zeros((p, k))\n    P = np.zeros((p, k))\n    q = np.zeros(k)\n    \n    for m in range(k):\n        # Weight vector: covariance with target\n        w_m = X_m.T @ y_m\n        w_m /= np.linalg.norm(w_m)\n        t_m = X_m @ w_m\n        t_norm_sq = t_m @ t_m\n        \n        p_m = (X_m.T @ t_m) / t_norm_sq\n        q_m = (y_m @ t_m) / t_norm_sq\n        \n        # Deflate\n        X_m -= np.outer(t_m, p_m)\n        y_m -= t_m * q_m\n        \n        W[:, m] = w_m\n        P[:, m] = p_m\n        q[m] = q_m\n        \n    # Compute regression coefficients beta_pls\n    # beta = W (P^T W)^{-1} q\n    beta_pls = W @ np.linalg.inv(P.T @ W) @ q\n    return beta_pls\n\n# Compare PCR and PLS with k=3 components\nk = 3\nbeta_pcr = fit_pcr(X_std, y_std, k)\nbeta_pls = fit_pls(X_std, y_std, k)\n\npred_pcr = X_std @ beta_pcr\npred_pls = X_std @ beta_pls\n\nr2_pcr = 1.0 - np.sum((y_std - pred_pcr)**2) / np.sum(y_std**2)\nr2_pls = 1.0 - np.sum((y_std - pred_pls)**2) / np.sum(y_std**2)\n\nprint(f\"Dataset shape: {X.shape} (high multicollinearity + high-variance noise)\")\nprint(f\"PCR (k={k}) R^2: {r2_pcr:.4f} (dragged down by high-variance noise features)\")\nprint(f\"PLS (k={k}) R^2: {r2_pls:.4f} (targets predictive covariance)\")",
    keyPoints: [
      "PCR performs unsupervised PCA on features followed by OLS on the top $k$ principal components, eliminating multicollinearity.",
      "Vulnerability of PCR: PCA maximises feature variance without regard to $y$; if predictors with high variance carry no signal, PCR fails.",
      "PLS performs supervised latent component extraction, finding directions that maximise squared covariance $\\operatorname{Cov}(X w, y)^2$.",
      "PLS typically matches or beats PCR using substantially fewer components because every extracted component is steered toward the response.",
      "Both methods require careful standardisation of features prior to decomposition and selection of component count $k$ via cross-validation."
    ],
    pitfalls: [
      "Failing to standardise features: PCA and PLS are scale-sensitive; features with large arbitrary numerical ranges dominate components regardless of predictive power.",
      "Assuming PCR components are predictive: The first principal component has maximal variance, but may have zero correlation with the response target.",
      "Information leakage in cross-validation: Decompositions (both PCA and PLS) must be computed strictly inside each training fold, not on the entire dataset."
    ],
    quiz: [
      {
        "q": "What is the fundamental difference in the objective function between PCR and PLS?",
        "o": [
          "PCR maximises variance Var(Xw) in an unsupervised manner, while PLS maximises squared covariance Cov(Xw, y)^2 with the target",
          "PCR is a non-linear method while PLS is strictly linear",
          "PCR can only be used for classification while PLS is only for regression",
          "PLS requires inverting the full p x p matrix while PCR never inverts matrices"
        ],
        "a": 0,
        "why": "PCR extracts components via PCA to maximise feature variance alone; PLS extracts components that simultaneously maximise feature variance and correlation with target y."
      },
      {
        "q": "Why might PCR perform poorly when high-variance sensor noise is added to a dataset?",
        "o": [
          "PCA prioritises the noise features due to their large variance, putting them into the top components rather than the true signal",
          "SVD fails to converge when noise is present",
          "The OLS stage will produce imaginary numbers",
          "The number of principal components cannot exceed the sample size"
        ],
        "a": 0,
        "why": "Because PCA is unsupervised, it orders components strictly by variance. High-variance noise dominates the first principal components, pushing the predictive signal into discarded lower components."
      }
    ],
    usedBy: [],
    prereq: [
      "ols-inference-t-tests-f-test-r2-and-adjusted-r2",
      "multicollinearity-and-vif"
    ],
    related: [
      "ols_linear_regression",
      "ridge_regression",
      "multicollinearity-and-vif",
      "poisson-and-tweedie-regression"
    ],
    keywords: "pls, partial least squares, pcr, principal component regression, nipals, dimensionality reduction, multicollinearity, high dimensional regression"
  },
  {
    id: "mars",
    short: "MARS",
    title: "Multivariate Adaptive Regression Splines",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Construct non-linear, non-parametric regression models using piecewise linear hinge functions: master forward basis selection and backward pruning via generalised cross-validation (GCV).",
    lead: "MARS automatically uncovers non-linear relationships and high-order feature interactions without requiring manual feature engineering, building an interpretable piecewise linear spline model.",
    intuition: [
      "Traditional linear models are constrained by rigid linearity. To capture non-linear patterns, data scientists frequently hand-engineer polynomial features ($x^2, x^3$) or interaction products ($x_1 x_2$). However, polynomial terms have notorious runaway behaviour at boundaries, and searching through all possible interactions among dozens of features creates combinatorial explosion.",
      "Jerome Friedman developed Multivariate Adaptive Regression Splines (MARS) in 1991 to automate non-linear regression and feature interaction discovery. MARS uses mirrored pairs of piecewise linear hinge functions (also known as truncated power functions or hockey-stick functions): $\\max(0, x - c)$ and $\\max(0, c - x)$, where $c$ is a candidate knot location placed at observed values of predictor $x$.",
      "The algorithm proceeds in two distinct stages. In the Forward Pass, MARS starts with an intercept and iteratively searches across all features and knot locations, greedily adding the pair of hinge functions (or interaction products of existing hinges with new hinges) that yields the greatest reduction in sum of squared errors. This forward greedy expansion intentionally overfits the training data.",
      "In the Backward Pruning Pass, MARS systematically removes basis functions one by one, using Generalised Cross-Validation (GCV) to penalise model complexity. The model that minimises GCV is selected. The resulting model is non-linear, continuous, easily interpretable as localized slopes and interaction terms, and computationally fast."
    ],
    analogy: "Imagine sculpting an irregular wooden contour using a set of wooden wedges and hinges. Rather than bending a stiff steel beam across the whole length (a linear model) or trying to carve an infinitely curved mathematical spiral (a high-degree polynomial), you place joint hinges at key stress points. Each hinge bends linearly in one direction and remains flat in the other. Once you have placed hinges everywhere, you remove the redundant joints until you are left with the cleanest structural framework.",
    steps: [
      {
        "title": "1. Initialise model with intercept",
        "body": "Set model $B_0(x) = 1$. The initial candidate basis set contains $\\mathcal{M} = \\{B_0\\}$."
      },
      {
        "title": "2. Forward pass: greedily add hinge pairs",
        "body": "At each step, search over all existing basis functions $B_m \\in \\mathcal{M}$, all features $x_j$, and all observed knots $c$. Find the pair $B_m(x) \\cdot \\max(0, x_j - c)$ and $B_m(x) \\cdot \\max(0, c - x_j)$ that minimises residual sum of squares. Add both to $\\mathcal{M}$ until reaching maximum basis count $M_{\\max}$."
      },
      {
        "title": "3. Backward pass: prune basis functions",
        "body": "Systematically remove basis functions one by one, choosing at each step the term whose deletion causes the smallest increase in RSS. Evaluate the GCV score for each sub-model."
      },
      {
        "title": "4. Select optimal sub-model via GCV",
        "body": "Select the model size $M^*$ that minimises the Generalised Cross-Validation criterion: $\\mathrm{GCV}(M) = \\frac{\\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{f}_M(x_i))^2}{(1 - \\tilde{C}(M)/n)^2}$, where $\\tilde{C}(M)$ penalises knot placement."
      }
    ],
    math: [
      {
        "h": "Reflected Hinge Functions",
        "tex": "(x - c)_+ = \\max(0, x - c), \\quad (c - x)_+ = \\max(0, c - x)",
        "p": "A pair of reflected hinge functions at knot c. For any x, one function is zero while the other is a linear ramp with slope +1 or -1, ensuring continuous piecewise linear approximations."
      },
      {
        "h": "MARS Model Formulation",
        "tex": "\\hat{f}(x) = \\beta_0 + \\sum_{m=1}^M \\beta_m B_m(x), \\quad B_m(x) = \\prod_{k=1}^{K_m} [s_{km} (x_{v(k, m)} - c_{km})]_+",
        "p": "The fitted function is a linear combination of basis functions, each consisting of an individual hinge or a product of multiple hinges representing multi-way feature interactions."
      },
      {
        "h": "Generalised Cross-Validation (GCV) Criterion",
        "tex": "\\mathrm{GCV}(M) = \\frac{\\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{f}_M(x_i))^2}{\\left(1 - \\frac{M + d \\cdot (M - 1) / 2}{n}\\right)^2}",
        "p": "GCV penalises model degrees of freedom, where d is an effective cost parameter per knot (typically d = 2 or 3) accounting for the forward search over knot locations."
      }
    ],
    code: "import numpy as np\n\n# Multivariate Adaptive Regression Splines (MARS) Forward Step from scratch\nnp.random.seed(42)\nn_samples = 150\n\n# True function: non-linear piecewise with a sharp bend and an interaction\nx1 = np.random.uniform(0, 10, n_samples)\nx2 = np.random.uniform(0, 10, n_samples)\n# Sharp bend at x1=5, interaction between (x1-5)+ and (x2-4)+\ny_clean = 2.0 + 1.5 * np.maximum(0, 5.0 - x1) + 3.0 * np.maximum(0, x1 - 5.0) + 1.2 * np.maximum(0, x1 - 5.0) * np.maximum(0, x2 - 4.0)\ny = y_clean + np.random.normal(0, 0.5, n_samples)\n\n# Simplified Forward MARS Search\nclass SimpleMARS:\n    def __init__(self, max_terms=7):\n        self.max_terms = max_terms\n        self.bases = [lambda X: np.ones(len(X))]\n        self.basis_names = [\"Intercept\"]\n        self.coef_ = None\n        \n    def fit(self, X, y):\n        n, p = X.shape\n        while len(self.bases) < self.max_terms:\n            best_rss = float(\"inf\")\n            best_pair = None\n            best_name = None\n            \n            # Current design matrix\n            B_curr = np.column_stack([b(X) for b in self.bases])\n            \n            # Search over parent bases, features, and candidate knots\n            for b_idx in range(len(self.bases)):\n                parent_b = self.bases[b_idx]\n                parent_vals = parent_b(X)\n                \n                for f_idx in range(p):\n                    col = X[:, f_idx]\n                    knots = np.percentile(col, [25, 50, 75])\n                    \n                    for c in knots:\n                        h_right = parent_vals * np.maximum(0, col - c)\n                        h_left = parent_vals * np.maximum(0, c - col)\n                        \n                        B_cand = np.column_stack([B_curr, h_right, h_left])\n                        coefs, residuals, _, _ = np.linalg.lstsq(B_cand, y, rcond=None)\n                        rss = np.sum((y - B_cand @ coefs)**2)\n                        \n                        if rss < best_rss:\n                            best_rss = rss\n                            best_pair = (\n                                lambda X, f=f_idx, c=c, pb=parent_b: pb(X) * np.maximum(0, X[:, f] - c),\n                                lambda X, f=f_idx, c=c, pb=parent_b: pb(X) * np.maximum(0, c - X[:, f])\n                            )\n                            best_name = (f\"h(x{f_idx+1}-{c:.1f})\", f\"h({c:.1f}-x{f_idx+1})\")\n                            \n            if best_pair is not None:\n                self.bases.extend(best_pair)\n                self.basis_names.extend(best_name)\n            else:\n                break\n                \n        # Final OLS fit\n        B_final = np.column_stack([b(X) for b in self.bases])\n        self.coef_, _, _, _ = np.linalg.lstsq(B_final, y, rcond=None)\n        \n    def predict(self, X):\n        B = np.column_stack([b(X) for b in self.bases])\n        return B @ self.coef_\n\nX_data = np.column_stack([x1, x2])\nmars = SimpleMARS(max_terms=7)\nmars.fit(X_data, y)\npreds = mars.predict(X_data)\nr2 = 1.0 - np.sum((y - preds)**2) / np.sum((y - np.mean(y))**2)\n\nprint(f\"MARS Model R^2: {r2:.4f}\")\nprint(\"Discovered Basis Functions and Coefficients:\")\nfor name, c in zip(mars.basis_names, mars.coef_):\n    print(f\"  {name:25s}: beta = {c:+.3f}\")",
    keyPoints: [
      "Automates non-linear modelling and interaction detection using reflected piecewise linear hinge functions $\\max(0, x - c)$ and $\\max(0, c - x)$.",
      "Two-stage architecture: greedy forward expansion to capture non-linear patterns followed by backward pruning via GCV to prevent overfitting.",
      "Continuous piecewise linearity ensures models do not exhibit wild polynomial runaway oscillations at outer boundaries.",
      "Provides inherent interpretability: variable importance can be measured by GCV drop upon removing all basis functions involving that feature.",
      "Serves as an effective, interpretable bridge between rigid linear models and black-box gradient-boosted trees."
    ],
    pitfalls: [
      "Computational scaling with sample size: Testing all candidate knot locations across every feature scales as $O(n \\cdot p \\cdot M)$, necessitating knot subsampling for large datasets.",
      "Collinearity among basis functions: Reflected hinge pairs and multi-way interaction terms can be highly correlated; backward pruning and SVD-based solvers are essential.",
      "Higher-order interaction degradation: Allowing interactions beyond degree 2 or 3 rapidly degrades statistical power and creates uninterpretable models."
    ],
    quiz: [
      {
        "q": "Why are reflected hinge functions max(0, x - c) and max(0, c - x) preferred over high-degree polynomials for non-linear regression?",
        "o": [
          "Hinge functions produce piecewise linear splines that are locally adaptive and do not oscillate wildly at data boundaries",
          "Hinge functions guarantee that the model is differentiable everywhere",
          "Polynomial features cannot represent linear relationships",
          "Hinge functions eliminate the need for training data"
        ],
        "a": 0,
        "why": "High-degree polynomials suffer from Runge phenomenon and extreme runaway oscillations at data boundaries. Reflected hinge functions are localized and bounded linearly."
      },
      {
        "q": "What role does Generalised Cross-Validation (GCV) play in the MARS algorithm?",
        "o": [
          "It penalises model degrees of freedom during backward pruning to find the optimal model size without requiring full k-fold CV",
          "It selects the learning rate for gradient descent",
          "It scales input features to zero mean and unit variance",
          "It generates synthetic training examples"
        ],
        "a": 0,
        "why": "GCV provides a fast analytical approximation to leave-one-out cross-validation, penalising the number of knots and basis functions to identify the optimal pruned sub-model."
      }
    ],
    usedBy: [],
    prereq: [
      "ols-inference-t-tests-f-test-r2-and-adjusted-r2"
    ],
    related: [
      "ols_linear_regression",
      "polynomial_regression",
      "residual-diagnostics-and-heteroscedasticity"
    ],
    keywords: "mars, multivariate adaptive regression splines, hinge functions, splines, gcv, non linear regression, piecewise linear, interaction terms"
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
centres = [[-1.5, -1.0], [1.5, -1.0], [0.0, 1.8]]
X = np.vstack([np.random.normal(c, 0.6, (n_per_class, 2)) for c in centres])
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
  {
    id: "ordinal-classification",
    short: "Ordinal classification",
    title: "Ordinal Classification",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Classify targets with natural ordering: master cumulative link proportional odds models, ordered probit, and ordinal threshold learning.",
    lead: "Rating scales (1 to 5 stars), disease staging (mild, moderate, severe), and credit ratings (AAA to D) have meaningful order but unequal interval spacing. Ordinal models preserve ranking without falsely assuming equal distances.",
    intuition: [
      "In supervised learning, target variables frequently possess an inherent ordering without possessing a strict metric scale: survey responses (strongly disagree, neutral, agree), customer satisfaction ratings (1 to 5 stars), disease severity stages, or credit bond ratings. Treating these targets with nominal multi-class classification (such as standard multinomial logistic regression) completely discards order information, penalising a 1-star predicted as 2-star identically to a 1-star predicted as 5-star.",
      "Conversely, treating ordinal categories as continuous numbers and applying standard regression falsely assumes that intervals between adjacent categories are identical: that the perceptual difference between 1 and 2 stars is identical to the difference between 4 and 5 stars. Ordinal classification provides the rigorous intermediate framework, respecting relative ranking without imposing arbitrary metric distances.",
      "The standard statistical workhorse is the Proportional Odds model (cumulative logit model). It posits an unobserved continuous latent variable $y^* = x^T \\beta + \\epsilon$. The observed ordinal category $k \\in \\{1, 2, \\dots, K\\}$ is determined by where this latent score falls across a sequence of strictly increasing cut-point thresholds: $\\theta_1 < \\theta_2 < \\dots < \\theta_{K-1}$.",
      "The proportional odds property states that feature coefficients $\\beta$ are invariant across all cut-points: an increase in feature $x$ shifts the latent distribution uniformly, changing the odds of exceeding threshold $k$ by the same multiplicative factor $\\exp(\\beta_j)$ regardless of which threshold $k$ is considered. This parsimonious parameterisation requires estimating only $p$ feature weights plus $K-1$ thresholds, avoiding parameter proliferation."
    ],
    analogy: "Imagine categorising runners in a marathon into three medal tiers: Bronze, Silver, and Gold. The underlying running time is a continuous latent variable. Rather than retraining three unrelated models, the race judges place two cut-off clocks along the course: finish before 3 hours for Gold, finish before 4 hours for Silver, otherwise Bronze. An athlete running faster shifts their latent position across all threshold clocks simultaneously.",
    steps: [
      {
        "title": "1. Verify target ordering and establish categories",
        "body": "Define the ordered categories $\\mathcal{Y} = \\{1, 2, \\dots, K\\}$. Confirm that relative ranking is strictly monotonic while category step sizes are non-metric."
      },
      {
        "title": "2. Formulate cumulative probabilities and cut-points",
        "body": "Model cumulative distribution $P(Y \\le k \\mid x) = \\sigma(\\theta_k - x^T \\beta)$, where $\\theta_1 \\le \\theta_2 \\le \\dots \\le \\theta_{K-1}$ are threshold cut-points and $\\sigma$ is the logistic or Gaussian CDF."
      },
      {
        "title": "3. Maximise cumulative log-likelihood",
        "body": "Express individual category probability as the difference between adjacent cumulative probabilities: $P(Y = k \\mid x) = P(Y \\le k \\mid x) - P(Y \\le k-1 \\mid x)$. Maximise log-likelihood jointly over $\\beta$ and ordered thresholds $\\theta$."
      },
      {
        "title": "4. Evaluate predictions with rank-sensitive metrics",
        "body": "Evaluate performance using Mean Absolute Error on ranks (MAE), quadratic weighted Kappa (QWK), or ordinal cross-entropy rather than raw 0-1 accuracy."
      }
    ],
    math: [
      {
        "h": "Cumulative Link / Proportional Odds Formulation",
        "tex": "P(Y \\le k \\mid x) = \\sigma(\\theta_k - x^T \\beta) = \\frac{1}{1 + \\exp(-(\\theta_k - x^T \\beta))}, \\quad k = 1, \\dots, K-1",
        "p": "The probability of falling into category k or below is governed by distance between threshold theta_k and linear predictor x^T beta. A positive beta shifts probability toward higher categories."
      },
      {
        "h": "Category Probabilities",
        "tex": "P(Y = k \\mid x) = P(Y \\le k \\mid x) - P(Y \\le k - 1 \\mid x), \\quad P(Y \\le 0) = 0, \\; P(Y \\le K) = 1",
        "p": "Each discrete category probability corresponds to the area under the latent logistic curve bounded between adjacent thresholds theta_{k-1} and theta_k."
      },
      {
        "h": "Quadratic Weighted Kappa (QWK)",
        "tex": "\\kappa = 1 - \\frac{\\sum_{i, j} w_{ij} O_{ij}}{\\sum_{i, j} w_{ij} E_{ij}}, \\quad w_{ij} = \\frac{(i - j)^2}{(K - 1)^2}",
        "p": "Measures agreement between predicted and true ranks penalising large category discrepancies quadratically, serving as standard evaluation metric in automated grading and disease staging."
      }
    ],
    code: "import numpy as np\nfrom scipy.optimise import minimise\n\n# Proportional Odds Ordinal Logistic Regression from scratch\nnp.random.seed(42)\nn_samples = 300\n\n# 1. Generate synthetic ordinal data (3 categories: Low, Medium, High)\nx1 = np.random.normal(0, 1, n_samples)\nx2 = np.random.uniform(-1, 1, n_samples)\nX = np.column_stack([x1, x2])\n\n# Latent variable y* = beta1*x1 + beta2*x2 + noise\ntrue_beta = np.array([1.5, -0.8])\nlatent_y = X @ true_beta + np.random.logistic(0, 1, n_samples)\n\n# True cut-points: theta_1 = -0.5, theta_2 = 1.2\ntrue_thetas = np.array([-0.5, 1.2])\ny = np.zeros(n_samples, dtype=int)\ny[latent_y > true_thetas[0]] = 1\ny[latent_y > true_thetas[1]] = 2\n\n# 2. Cumulative Logit Model Fitting via Maximum Likelihood\nK = 3  # Number of classes\ndef sigmoid(z):\n    return 1.0 / (1.0 + np.exp(-np.clip(z, -30, 30)))\n\ndef negative_log_likelihood(params, X, y):\n    beta = params[:2]\n    # Parameterise thresholds with increments to enforce theta_1 < theta_2\n    theta = np.array([params[2], params[2] + np.exp(params[3])])\n    \n    linear_pred = X @ beta\n    n = len(y)\n    nll = 0.0\n    \n    for i in range(n):\n        k = y[i]\n        # P(Y <= k)\n        prob_k = sigmoid(theta[k] - linear_pred[i]) if k < K - 1 else 1.0\n        prob_prev = sigmoid(theta[k-1] - linear_pred[i]) if k > 0 else 0.0\n        prob = max(prob_k - prob_prev, 1e-12)\n        nll -= np.log(prob)\n        \n    return nll\n\n# Initial guess: beta=[0, 0], theta_1=0, increment=0\ninit_params = np.array([0.0, 0.0, 0.0, 0.0])\nres = minimise(negative_log_likelihood, init_params, args=(X, y), method='BFGS')\n\nest_beta = res.x[:2]\nest_thetas = np.array([res.x[2], res.x[2] + np.exp(res.x[3])])\n\n# Compute predictions\nlin_preds = X @ est_beta\npred_probs = np.zeros((n_samples, K))\nfor k in range(K):\n    p_k = sigmoid(est_thetas[k] - lin_preds) if k < K - 1 else 1.0\n    p_prev = sigmoid(est_thetas[k-1] - lin_preds) if k > 0 else 0.0\n    pred_probs[:, k] = p_k - p_prev\npred_classes = np.argmax(pred_probs, axis=1)\n\nmae = np.mean(np.abs(y - pred_classes))\nacc = np.mean(y == pred_classes)\n\nprint(f\"True beta:             {true_beta}\")\nprint(f\"Estimated beta:        {est_beta.round(3)}\")\nprint(f\"True cut-points:       {true_thetas}\")\nprint(f\"Estimated cut-points:  {est_thetas.round(3)}\")\nprint(f\"Classification accuracy: {acc * 100:.1f}%\")\nprint(f\"Mean Absolute Error (ranks): {mae:.3f} (captures distance on ordered scale)\")",
    keyPoints: [
      "Preserves inherent rank ordering of discrete targets without assuming arbitrary metric Euclidean distance.",
      "Cumulative logit proportional odds model relates features to cumulative probability $P(Y \\le k \\mid x) = \\sigma(\\theta_k - x^T \\beta)$.",
      "Feature weights $\\beta$ are shared across all thresholds, requiring only $p + (K - 1)$ parameters compared to $(K - 1) \\cdot p$ in multinomial regression.",
      "Latent threshold formulation $\\theta_1 < \\theta_2 < \\dots < \\theta_{K-1}$ partitions continuous latent response into ordered discrete bins.",
      "Performance is best evaluated via distance-aware metrics like Mean Absolute Error (MAE) on ranks or Quadratic Weighted Kappa (QWK)."
    ],
    pitfalls: [
      "Violation of proportional odds assumption: If a feature affects the transition between Mild and Moderate differently than between Moderate and Severe, the assumption fails and partial proportional odds is needed.",
      "Threshold ordering collapse: Unconstrained numerical optimisation can allow thresholds to cross ($\\theta_{k+1} < \\theta_k$), resulting in negative probabilities; reparameterising with positive increments is vital.",
      "Evaluating with accuracy: A model predicting class 1 when truth is class 5 receives the exact same penalty as predicting class 2 under 0-1 loss, masking severe directional blunders."
    ],
    quiz: [
      {
        "q": "Why is standard multinomial logistic regression sub-optimal for customer satisfaction ratings (1 to 5 stars)?",
        "o": [
          "It treats classes as unordered categories, penalising a 1-star predicted as 2-star identically to a 1-star predicted as 5-star",
          "It cannot handle more than 2 classes",
          "It assumes the response variable is normally distributed",
          "It requires inverting a matrix of dimension n x n"
        ],
        "a": 0,
        "why": "Multinomial logistic regression is nominal; it ignores the ordering of ratings and assigns equal loss to near-misses and extreme ranking blunders."
      },
      {
        "q": "What is the key geometric interpretation of the cut-points theta_1 < theta_2 < ... < theta_{K-1} in an ordinal model?",
        "o": [
          "They represent threshold boundaries partitioning a continuous latent space into ordered discrete categories",
          "They are the weights of the input features",
          "They represent the eigenvalues of the Hessian matrix",
          "They define the learning rate schedule for stochastic gradient descent"
        ],
        "a": 0,
        "why": "In ordinal threshold models, an underlying continuous latent variable y* is partitioned into discrete bins by the ordered boundary thresholds theta_k."
      }
    ],
    usedBy: [],
    prereq: [
      "logistic-regression-inference-odds-ratios-wald-tests",
      "generalised-linear-models"
    ],
    related: [
      "logistic_regression",
      "multi-label-classification",
      "cost-sensitive-learning",
      "generalised-linear-models"
    ],
    keywords: "ordinal classification, proportional odds, cumulative logit, ordered probit, thresholds, cut points, rank prediction, quadratic weighted kappa"
  },
];
