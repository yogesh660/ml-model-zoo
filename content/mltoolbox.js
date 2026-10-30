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
      r`Bagging works because averaging $B$ independent, identically distributed estimators leaves bias unchanged while reducing variance by a factor of $1/B$. In practice, because all trees draw from the same finite training pool, their predictions remain positively correlated ($\rho > 0$). When trees are correlated, variance reduction hits an irreducible floor of $\rho \sigma^2$. Decorrelating individual trees is therefore the primary mechanism for improving ensemble performance.`,
      r`Extra-Trees (Extremely Randomised Trees) tackles tree correlation directly. At each node, rather than scanning all possible threshold values to find the split that maximises the Gini impurity drop, Extra-Trees draws random cut-points from a uniform distribution for each candidate feature and selects the best among them. By abandoning exhaustive threshold searches, Extra-Trees trains drastically faster than standard Random Forests while producing highly diverse, decorrelated trees that often generalise better on noisy datasets.`,
    ],
    analogy: r`Bagging is like taking a consensus vote among independent analysts reviewing randomly shuffled case folders, while Extra-Trees speeds up the deliberation by forcing analysts to evaluate proposals against random benchmark hurdles.`,
    steps: [
      r`Draw $B$ independent bootstrap datasets $\mathcal{D}_1, \dots, \mathcal{D}_B$ of size $n$ by sampling from the original dataset with replacement.`,
      r`For standard Bagging, grow deep, unpruned decision trees on each bootstrap resample using all available features.`,
      r`For Extra-Trees, train trees on the full dataset (or bootstrap draws) and, at each split node, draw split thresholds at random for each feature subset.`,
      r`Track Out-of-Bag (OOB) samples—the $\approx 36.8\\%$ of instances omitted from each bootstrap draw—to compute honest cross-validation metrics on the fly.`,
      r`Aggregate tree outputs: compute majority voting (or soft probability averages) for classification, and arithmetic means for regression.`,
      r`Evaluate ensemble convergence: verify that test error stabilises asymptotically as tree count $B$ grows without risk of overfitting.`,
    ],
    math: [
      {
        h: 'Variance reduction in an ensemble of correlated estimators',
        tex: r`$$\operatorname{Var}\big(\bar{f}(x)\big) = \rho \\, \sigma^2 + \frac{1 - \rho}{B} \\, \sigma^2$$`,
        p: r`$\sigma^2$ is the variance of a single tree, $B$ is the number of trees in the ensemble, and $\rho = \operatorname{Corr}(f_i, f_j)$ is the average pairwise correlation between trees. As $B \to \infty$, the second term vanishes, leaving the irreducible variance floor $\rho \sigma^2$. Extra-Trees achieves superior variance reduction by actively driving down $\rho$.`,
      },
      {
        h: 'Out-of-Bag (OOB) sample probability derivation',
        tex: r`$$P(\text{point } i \text{ is never selected in } n \text{ draws}) = \Big(1 - \frac{1}{n}\Big)^n \xrightarrow{n \to \infty} \frac{1}{e} \approx 0.3679$$`,
        p: r`For a sample of size $n$, each observation has probability $1 - 1/n$ of being omitted in a single draw. Compounding over $n$ independent draws with replacement shows that roughly $36.8\\%$ of data points remain unused per tree, providing a free validation set.`,
      },
      {
        h: 'Aggregation rules (hard voting vs soft voting)',
        tex: r`$$\hat{y}_{\text{hard}} = \operatorname{mode}\big(\\{f_b(x)\\}_{b=1}^B\big), \quad \hat{p}(k \mid x) = \frac{1}{B}\sum_{b=1}^B p_b(k \mid x)$$`,
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
      r`Dominant feature masking: if one feature is overwhelmingly predictive, standard bagging trees will all select it at the root, maintaining high pairwise correlation $\rho$.`,
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
        q: r`What is the theoretical proportion of unique training observations omitted from each bootstrap sample of size $n$ as $n \to \infty$?`,
        o: [
          r`Approximately $1/e \approx 36.8\\%$`,
          r`Exactly $50.0\\%$`,
          r`Zero, because sampling is performed with replacement`,
          r`Approximately $5.0\\%$`,
        ],
        a: 0,
        why: r`The probability that an item is never selected in $n$ independent draws with replacement converges to $(1 - 1/n)^n \to 1/e \approx 0.3679$.`,
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
      r`For One-vs-One (OvO), train $K(K-1)/2$ binary models on paired subsets $\mathcal{D}_{ij} = \\{ (x, y) \mid y \in \\{i, j\\} \\}.`,
      r`For Softmax regression, parameterise a weight matrix $W \in \mathbb{R}^{p \times K}$ and compute class probabilities via normalised exponentials.`,
      r`Aggregate classifications: select $\arg\max$ of continuous decision margins in OvR, tally pairwise majority votes in OvO, or pick the maximum posterior probability in Softmax.`,
      r`Diagnose probability calibration and resolve ties or ambiguous multi-class boundaries.`,
    ],
    math: [
      {
        h: 'One-vs-Rest (OvR) decision rule',
        tex: r`$$\hat{y} = \arg\max_{k \in \\{1, \dots, K\\}} f_k(x), \quad f_k(x) = x^T w_k + b_k$$`,
        p: r`$f_k(x)$ represents the decision margin of binary classifier $k$ trained to separate class $k$ from all other classes. When binary models output uncalibrated scores, the $\arg\max$ operator can be skewed toward models with artificially wide margin scales.`,
      },
      {
        h: 'One-vs-One (OvO) model count and voting rule',
        tex: r`$$M = \frac{K(K - 1)}{2}, \quad \hat{y} = \arg\max_{k} \sum_{j \ne k} \mathbb{I}\big(f_{kj}(x) = k\big)$$`,
        p: r`$M$ is the number of pairwise binary classifiers. Each model $f_{kj}$ votes for either class $k$ or class $j$. The class accumulating the highest vote tally across all pairwise duels is selected, with ties broken by sum of decision margins.`,
      },
      {
        h: 'The Softmax function and categorical cross-entropy',
        tex: r`$$P(Y = k \mid x) = \frac{e^{x^T w_k}}{\sum_{j=1}^K e^{x^T w_j}}, \quad \mathcal{L}_{\text{CE}}(W) = -\sum_{i=1}^n \sum_{k=1}^K \mathbb{I}(y_i = k) \log P(Y = k \mid x_i)$$`,
        p: r`Logits $z_k = x^T w_k$ are exponentiated and normalised by the partition denominator $\sum_{j=1}^K e^{z_j}$, ensuring probabilities remain strictly positive and sum to 1.0. Gradient descent updates weights based on prediction error residuals $(p_{ik} - y_{ik}) x_i$.`,
      },
    ],
    keyPoints: [
      r`OvR trains $K$ classifiers on full dataset size $n$; OvO trains $K(K-1)/2$ classifiers on smaller sub-samples ($2n/K$).`,
      r`OvO is computationally advantageous for algorithms with super-linear scaling $\mathcal{O}(n^2)$ (like kernel SVMs), as the sum of squared sub-sample sizes is smaller than $K n^2$.`,
      r`Softmax regression produces mutually exclusive, globally calibrated posterior probabilities that naturally sum to 1.0.`,
      r`OvR introduces severe class imbalance as $K$ increases: in a 20-class dataset, each OvR classifier faces a 1:19 imbalance ratio.`,
    ],
    pitfalls: [
      r`Comparing uncalibrated margins in OvR: binary SVM decision function values have different scales; taking $\arg\max$ directly favours classifiers with higher variance.`,
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
          r`$\frac{K(K - 1)}{2}$`,
          r`$K^2$`,
        ],
        a: 2,
        why: r`OvO trains a separate binary classifier for every unique pair of classes, resulting in $\binom{K}{2} = \frac{K(K-1)}{2}$ models.`,
      },
      {
        q: r`Why can One-vs-One (OvO) train faster than One-vs-Rest (OvR) when using non-linear Support Vector Machines?`,
        o: [
          r`SVMs scale super-linearly with sample size ($\mathcal{O}(n^2)$ to $\mathcal{O}(n^3)$), so training many models on small sub-samples is much cheaper than training $K$ models on the full dataset`,
          r`OvO eliminates the need for computing kernel gram matrices`,
          r`OvO converts non-linear SVMs into linear decision trees`,
          r`OvO only trains on support vectors from the negative class`,
        ],
        a: 0,
        why: r`Because kernel SVM training complexity scales super-linearly with $n$, training $\approx K^2/2$ models on small datasets of size $2n/K$ requires far less computation than training $K$ models on the full dataset of size $n$.`,
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
        why: r`The Softmax denominator $\sum_{j=1}^K e^{z_j}$ acts as a normalising partition function, ensuring all outputs are positive and sum to 1.0.`,
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
      r`Measure the imbalance ratio $r = N_{\text{maj}} / N_{\text{min}}$ and discard raw accuracy in favour of PR-AUC, balanced accuracy, or $F_\beta$ scores.`,
      r`Assign inverse-frequency sample weights $w_k = n / (K \cdot n_k)$ directly in the objective function to equilibrate class gradient contributions.`,
      r`If resampling is desired, apply SMOTE strictly inside cross-validation training folds; never over-sample validation or test data.`,
      r`Train a well-calibrated probabilistic classifier (such as logistic regression or gradient-boosted trees) on the weighted or resampled data.`,
      r`Plot the Precision-Recall curve on held-out validation data to identify the cost-optimal decision threshold $t^*$.`,
      r`Deploy threshold moving in production: classify an instance as positive whenever $\hat{P}(Y=1 \mid x) \ge t^*$.`,
    ],
    math: [
      {
        h: 'Cost-sensitive weighted log-loss',
        tex: r`$$\mathcal{L}_{\text{weighted}}(w) = -\sum_{i=1}^n \Big[ w_1 \\, y_i \log p_i + w_0 \\, (1 - y_i) \log(1 - p_i) \Big], \quad w_k = \frac{n}{K \cdot n_k}$$`,
        p: r`$w_k$ denotes the class weight, $n$ is total sample size, $K$ is number of classes, and $n_k$ is the frequency of class $k$. Weighting scales gradients so that a rare minority instance exerts equal total influence as abundant majority points during parameter updates.`,
      },
      {
        h: 'SMOTE synthetic sample interpolation',
        tex: r`$$x_{\text{new}} = x_i + \lambda \cdot (x_{(j)} - x_i), \quad \lambda \sim \mathcal{U}(0, 1)$$`,
        p: r`$x_i$ is a minority seed instance, $x_{(j)}$ is a randomly chosen neighbour from $x_i$'s $k$-nearest minority neighbours, and $\lambda$ is a uniform random scalar. This generates convex combinations along the line segment connecting neighbouring minority examples in feature space.`,
      },
      {
        h: 'Bayes-optimal decision threshold with asymmetric costs',
        tex: r`$$t^* = \frac{C_{\text{FP}} - C_{\text{TN}}}{(C_{\text{FP}} - C_{\text{TN}}) + (C_{\text{FN}} - C_{\text{TP}})}$$`,
        p: r`$C_{\text{FP}}$ represents the cost of a false positive and $C_{\text{FN}}$ is the cost of a false negative. When missing a positive is 20 times more costly than investigating a false alarm, the Bayes-optimal decision threshold shifts dramatically from $0.5$ down to $t^* \approx 1 / (1 + 20) \approx 0.048$.`,
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
      r`Optimising standard $F_1$ score without cost calibration: $F_1$ weights Precision and Recall equally ($\beta=1$), which rarely matches real-world asymmetric business costs.`,
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
        why: r`SMOTE takes a minority sample, identifies its $k$-nearest minority neighbours, and creates synthetic points along the convex line segments joining them: $x_{\text{new}} = x_i + \lambda(x_{(j)} - x_i)$.`,
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
      r`Construct a **Reliability Diagram (Calibration Curve)**: bin predictions into $M$ equal intervals (e.g. $[0, 0.1), [0.1, 0.2), \dots$) and plot mean predicted confidence against observed fraction of positives.`,
      r`Compute the **Expected Calibration Error (ECE)** and **Brier Score** to quantify baseline calibration error.`,
      r`Select a calibrator: choose **Platt Scaling** if the miscalibration is sigmoidal or validation data is modest ($n < 1,000$), or **Isotonic Regression** if the distortion is non-sigmoidal and validation data is plentiful.`,
      r`Fit the post-processing calibration mapping $g(s)$ on validation scores using maximum likelihood or least squares.`,
      r`Apply the fitted calibrator to test predictions, verifying that ECE and Brier score improve while ROC-AUC ranking discrimination remains preserved.`,
    ],
    math: [
      {
        h: 'Definition of perfect calibration',
        tex: r`$$\mathbb{P}\big(Y = 1 \mid \hat{P} = p\big) = p \quad \forall p \in [0, 1]$$`,
        p: r`$\hat{P}$ is the model's predicted probability, and $Y \in \\{0, 1\\}$ is the true binary label. Perfect calibration guarantees that among all instances assigned probability $p$, exactly a fraction $p$ are positive outcomes.`,
      },
      {
        h: 'Expected Calibration Error (ECE)',
        tex: r`$$\operatorname{ECE} = \sum_{m=1}^M \frac{|B_m|}{n} \Big| \operatorname{acc}(B_m) - \operatorname{conf}(B_m) \Big|$$`,
        p: r`Predictions are grouped into $M$ bins $B_m$. $|B_m|/n$ is the bin sample weight, $\operatorname{acc}(B_m) = \frac{1}{|B_m|}\sum_{i \in B_m} y_i$ is empirical bin accuracy, and $\operatorname{conf}(B_m) = \frac{1}{|B_m|}\sum_{i \in B_m} \hat{p}_i$ is mean predicted confidence. ECE computes the weighted absolute divergence between confidence and reality.`,
      },
      {
        h: 'Platt scaling and Isotonic regression',
        tex: r`$$\hat{P}_{\text{Platt}} = \frac{1}{1 + \exp(A s + B)}, \quad \min_{g} \sum_{i=1}^n \big(y_i - g(s_i)\big)^2 \\;\\; \text{s.t.} \\;\\; g(s_i) \le g(s_j) \text{ for } s_i \le s_j$$`,
        p: r`Platt scaling optimises parameters $A$ and $B$ via negative log-likelihood on validation margins $s_i$. Isotonic regression fits a non-parametric monotonic step function $g(s)$ via the Pool Adjacent Violators Algorithm (PAVA), preserving rank order while minimising mean squared error.`,
      },
    ],
    keyPoints: [
      r`Discrimination vs Calibration: ROC-AUC evaluates ranking discrimination, whereas calibration evaluates whether probability magnitudes match empirical event frequencies.`,
      r`Monotonicity preservation: monotonic calibrators (Platt scaling and Isotonic regression) do not alter prediction rank order, leaving ROC-AUC completely unchanged.`,
      r`The Brier Score ($\frac{1}{n}\sum (y_i - \hat{p}_i)^2$) decomposes mathematically into uncertainty, reliability (calibration error), and resolution (discrimination).`,
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
  {
    id: "multi-label-classification",
    short: "Multi-label classification",
    title: "Multi-Label Classification",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Predict multiple non-mutually exclusive binary labels simultaneously: compare Binary Relevance, Classifier Chains, and label power-sets with Hamming loss.",
    lead: "A document can belong to Politics, Economics, and Tech simultaneously; an image can contain a dog, a frisbee, and a tree. Multi-label learning addresses non-exclusive target vectors while accounting for label correlations.",
    intuition: [
      "In conventional classification, classes are strictly mutually exclusive: an email is either spam or not spam (binary), or an image is either a cat, dog, or bird (multi-class). In contrast, real-world objects frequently possess multiple simultaneous attributes: a film can belong to Comedy, Drama, and Romance; a biomedical article can discuss Genetics, Oncology, and Immunology; a customer can be tagged as Churn-Risk, High-Spender, and Mobile-User.",
      "Multi-label learning maps feature vector $x$ to a binary target vector $y = [y_1, y_2, \\dots, y_L]^T \\in \\{0, 1\\}^L$. The fundamental algorithmic choice revolves around how to handle correlations among labels.",
      "The simplest strategy is Binary Relevance: decompose the problem into $L$ completely independent binary classification tasks, one per label. While embarrassingly parallel and scalable, Binary Relevance is blind to label dependencies: knowing an image contains a \"beach\" vastly increases the probability of \"ocean\" and \"sand\", but Binary Relevance cannot exploit this co-occurrence.",
      "Classifier Chains overcome this blind spot by ordering labels into a sequence and training each classifier with both original features $x$ and the ground-truth/predicted binary labels of all preceding classifiers in the chain. Label Powerset transforms the task into multi-class classification by treating every unique observed label combination as a distinct class, which models correlations perfectly but suffers from severe class explosion on rare combinations. Modern neural architectures employ independent sigmoid heads trained with binary cross-entropy loss."
    ],
    analogy: "Imagine assigning tags to songs in a music streaming library (e.g. Acoustic, Rock, Ballad, 90s, Instrumental). Binary Relevance hires five separate interns who sit in isolated soundproof booths and evaluate one tag each without speaking to each other. Classifier Chains seats the interns in a line: each intern listens to the song and glances at the tag decisions made by previous interns before making their own call.",
    steps: [
      {
        "title": "1. Formulate binary target indicator matrix",
        "body": "Structure targets as a binary matrix $Y \\in \\{0, 1\\}^{n \\times L}$, where $Y_{ij} = 1$ denotes presence of label $j$ on sample $i$."
      },
      {
        "title": "2. Select decomposition or neural architecture",
        "body": "Choose between Binary Relevance (fast, baseline), Classifier Chains (captures sequential correlations), or a shared deep neural backbone with $L$ independent sigmoid outputs."
      },
      {
        "title": "3. Train with Binary Cross-Entropy loss",
        "body": "Compute binary cross-entropy loss independently for each label head: $\\mathcal{L} = -\\frac{1}{L} \\sum_{j=1}^L [y_j \\log \\hat{p}_j + (1 - y_j) \\log (1 - \\hat{p}_j)]$. Average across all labels."
      },
      {
        "title": "4. Evaluate with label-specific and subset metrics",
        "body": "Evaluate predictions using Hamming Loss (fraction of incorrect individual label predictions), Subset Accuracy (fraction of instances where entire label set is 100% correct), and Macro/Micro F1 scores."
      }
    ],
    math: [
      {
        "h": "Hamming Loss",
        "tex": "\\operatorname{HL}(Y, \\hat{Y}) = \\frac{1}{n \\cdot L} \\sum_{i=1}^n \\sum_{j=1}^L \\mathbb{I}(Y_{ij} \\neq \\hat{Y}_{ij}) = \\frac{1}{n \\cdot L} \\|Y \\oplus \\hat{Y}\\|_1",
        "p": "Measures the fraction of individual label mistakes across all instances and labels. A lower Hamming loss indicates higher per-label accuracy."
      },
      {
        "h": "Subset Accuracy (Exact Match Ratio)",
        "tex": "\\operatorname{Acc}_{\\mathrm{subset}} = \\frac{1}{n} \\sum_{i=1}^n \\mathbb{I}(Y_i = \\hat{Y}_i)",
        "p": "The strictest metric: requires the entire predicted binary label vector to match ground truth exactly. Can be low even when individual label accuracy is above 95%."
      },
      {
        "h": "Classifier Chain Conditional Factorisation",
        "tex": "P(y_1, \\dots, y_L \\mid x) = \\prod_{j=1}^L P(y_j \\mid x, y_1, \\dots, y_{j-1})",
        "p": "By the probability chain rule, joint label probability factorises into a product of conditional probabilities, implemented by conditioning each classifier on previous predictions."
      }
    ],
    code: "import numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\n# Multi-label classification: Binary Relevance vs Classifier Chains from scratch\nnp.random.seed(42)\nn_samples = 300\nn_features = 8\nn_labels = 4\n\n# Generate synthetic correlated multi-label dataset\nX = np.random.normal(0, 1, (n_samples, n_features))\n# Latent signals generating co-occurring tags\nlatent_topic = X[:, 0] + X[:, 1]\n\n# Labels with strong dependencies (e.g. Label 2 often co-occurs with Label 0)\ny = np.zeros((n_samples, n_labels), dtype=int)\ny[:, 0] = (latent_topic + np.random.normal(0, 0.5, n_samples) > 0).astype(int)\ny[:, 1] = (X[:, 2] - X[:, 3] + np.random.normal(0, 0.5, n_samples) > 0).astype(int)\ny[:, 2] = (y[:, 0] * 0.7 + X[:, 4] + np.random.normal(0, 0.5, n_samples) > 0.3).astype(int)\ny[:, 3] = (y[:, 1] * 0.8 + X[:, 5] + np.random.normal(0, 0.5, n_samples) > 0.4).astype(int)\n\n# Train/Test Split\nn_train = 200\nX_train, X_test = X[:n_train], X[n_train:]\ny_train, y_test = y[:n_train], y[n_train:]\n\n# 1. Binary Relevance (L independent models)\nbr_models = [LogisticRegression(solver='liblinear') for _ in range(n_labels)]\nfor j in range(n_labels):\n    br_models[j].fit(X_train, y_train[:, j])\n\ny_pred_br = np.column_stack([m.predict(X_test) for m in br_models])\n\n# 2. Classifier Chains (Sequential conditioning)\nchain_order = [0, 1, 2, 3]\nchain_models = []\nX_train_augmented = X_train.copy()\n\nfor j in chain_order:\n    clf = LogisticRegression(solver='liblinear')\n    clf.fit(X_train_augmented, y_train[:, j])\n    chain_models.append(clf)\n    # Augment feature matrix with true labels during training\n    X_train_augmented = np.column_stack([X_train_augmented, y_train[:, j]])\n\n# Predict with Classifier Chain sequentially\nX_test_augmented = X_test.copy()\ny_pred_chain = np.zeros_like(y_test)\n\nfor idx, j in enumerate(chain_order):\n    preds_j = chain_models[idx].predict(X_test_augmented)\n    y_pred_chain[:, j] = preds_j\n    # Augment test features with PREDICTED labels\n    X_test_augmented = np.column_stack([X_test_augmented, preds_j])\n\n# Evaluation\ndef eval_multilabel(y_true, y_pred):\n    hamming_loss = np.mean(y_true != y_pred)\n    subset_acc = np.mean(np.all(y_true == y_pred, axis=1))\n    return hamming_loss, subset_acc\n\nhl_br, sa_br = eval_multilabel(y_test, y_pred_br)\nhl_chain, sa_chain = eval_multilabel(y_test, y_pred_chain)\n\nprint(f\"Binary Relevance  - Hamming Loss: {hl_br:.4f}, Subset Accuracy: {sa_br*100:.1f}%\")\nprint(f\"Classifier Chains - Hamming Loss: {hl_chain:.4f}, Subset Accuracy: {sa_chain*100:.1f}%\")\nprint(f\"Subset Accuracy Improvement: +{(sa_chain - sa_br)*100:.1f}% by capturing label correlations\")",
    keyPoints: [
      "Multi-label classification assigns instances multiple non-mutually exclusive binary labels $y \\in \\{0, 1\\}^L$.",
      "Binary Relevance trains $L$ independent binary models; fast and scalable but ignores label co-occurrence dependencies.",
      "Classifier Chains condition each label on predictions of preceding labels, capturing dependencies via the probability chain rule.",
      "Standard multi-class Softmax activation is replaced with independent Sigmoids $\\sigma(z_j)$ trained via binary cross-entropy loss.",
      "Evaluated via Hamming Loss (per-label error rate) and Subset Accuracy (fraction of instances where all labels match exactly)."
    ],
    pitfalls: [
      "Using Softmax instead of Sigmoid: Softmax enforces a sum-to-one constraint across classes, forcing classes to compete and failing on multi-label targets.",
      "Error propagation in Classifier Chains: If early classifiers in a chain make erroneous predictions, downstream classifiers receive corrupted features during inference.",
      "Evaluating multi-label models with multi-class accuracy: Multi-class accuracy assumes a single scalar output; multi-label problems require Hamming loss or Macro/Micro F1."
    ],
    quiz: [
      {
        "q": "Why is independent Sigmoid activation used instead of Softmax in multi-label neural network heads?",
        "o": [
          "Sigmoid outputs independent probabilities for each label in [0, 1], whereas Softmax forces all class probabilities to sum to 1",
          "Sigmoid is faster to compute than addition",
          "Softmax cannot be differentiated during backpropagation",
          "Sigmoids eliminate the need for hidden layers"
        ],
        "a": 0,
        "why": "Softmax forces probabilities across all classes to sum to 1, assuming mutual exclusivity. Multi-label problems require each label to possess an independent probability in [0, 1] via Sigmoid."
      },
      {
        "q": "What is the primary trade-off of Classifier Chains compared to Binary Relevance?",
        "o": [
          "Classifier Chains capture label correlations but are sensitive to chain ordering and test-time error propagation",
          "Classifier Chains have O(1) computational complexity",
          "Classifier Chains can only be used with decision trees",
          "Classifier Chains cannot predict zero labels for an instance"
        ],
        "a": 0,
        "why": "By feeding preceding predictions as features, Classifier Chains capture label correlations. However, early classification mistakes propagate down the chain, and training cannot be fully parallelised."
      }
    ],
    usedBy: [],
    prereq: [
      "logistic-regression-inference-odds-ratios-wald-tests"
    ],
    related: [
      "logistic_regression",
      "ordinal-classification",
      "cost-sensitive-learning",
      "confusion-matrix"
    ],
    keywords: "multi label classification, binary relevance, classifier chains, label powerset, hamming loss, subset accuracy, binary cross entropy, label correlation"
  },
  {
    id: "cost-sensitive-learning",
    short: "Cost-sensitive learning",
    title: "Cost-Sensitive Learning",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Minimise expected financial loss rather than error count: master cost matrices, Bayes decision theory threshold shifting, and cost-weighted loss functions.",
    lead: "In fraud detection, loan default, and cancer diagnosis, a false negative is vastly more catastrophic than a false positive. Cost-sensitive learning embeds domain cost asymmetry directly into model training and decision thresholds.",
    intuition: [
      "Standard machine learning algorithms treat all errors as equally harmful: misclassifying a legitimate £10 transaction as fraud (false positive) is assigned the identical loss as letting a £5,000 fraudulent wire transfer slip through undetected (false negative). In real-world enterprise environments—including fraud prevention, loan risk underwriting, medical pathology, and industrial turbine maintenance—costs are wildly asymmetric.",
      "Cost-Sensitive Learning replaces generic accuracy maximisation with expected cost minimisation. This asymmetry is formally captured in a Cost Matrix $C$, where $C(i, j)$ specifies the financial, clinical, or operational cost of predicting class $i$ when the ground truth is class $j$.",
      "Practitioners can incorporate cost asymmetry at three distinct levels of the machine learning pipeline: data-level, algorithm-level, and decision-level.",
      "Data-level methods apply cost-proportionate sampling, over-sampling high-cost instances. Algorithm-level methods modify objective functions, weighting loss terms by their relative cost during gradient updates (cost-weighted empirical risk minimisation). Decision-level methods train standard probabilistic models and apply Bayes decision theory post-processing: shifting the classification decision threshold $p^*$ from 0.5 to the exact theoretical Bayes optimal cut-off dictated by the cost matrix ratio."
    ],
    analogy: "Imagine a smoke detector in a chemical refinery. A false positive triggers a loud siren and requires five minutes to silence (cost: £50 in staff annoyance). A false negative fails to sound an alarm during a toxic chemical fire, destroying the facility (cost: £10,000,000). Tuning the alarm sensitivity to minimise total error count treats both mistakes equally, risking disaster. A cost-sensitive alarm triggers at the slightest whiff of smoke because the asymmetric penalty of silence is existential.",
    steps: [
      {
        "title": "1. Formulate the enterprise cost matrix",
        "body": "Define cost matrix $C(i, j)$ quantifying costs of True Positives ($C_{TP}$), False Positives ($C_{FP}$), True Negatives ($C_{TN}$), and False Negatives ($C_{FN}$)."
      },
      {
        "title": "2. Select incorporation strategy",
        "body": "Decide whether to embed costs into loss functions during training (e.g. weighted cross-entropy) or adjust classification decision threshold $p^*$ post-processing on calibrated probabilities."
      },
      {
        "title": "3. Derive Bayes risk-optimal decision threshold",
        "body": "Under Bayes decision theory, predict positive whenever $P(Y=1 \\mid x) > p^*$, where $p^* = \\frac{C_{FP} - C_{TN}}{(C_{FP} - C_{TN}) + (C_{FN} - C_{TP})}$."
      },
      {
        "title": "4. Calibrate probabilities and evaluate expected cost",
        "body": "Calibrate classifier output probabilities (via Platt scaling or isotonic regression) and evaluate total financial loss $\\sum C(\\hat{y}_i, y_i)$ on test data rather than 0-1 accuracy."
      }
    ],
    math: [
      {
        "h": "Expected Conditional Cost (Bayes Risk)",
        "tex": "R(\\alpha = 1 \\mid x) = C_{TP} P(Y=1 \\mid x) + C_{FP} P(Y=0 \\mid x), \\quad R(\\alpha = 0 \\mid x) = C_{FN} P(Y=1 \\mid x) + C_{TN} P(Y=0 \\mid x)",
        "p": "The expected risk of taking action alpha conditioned on feature vector x. Optimal Bayes decision selects the action minimising expected risk."
      },
      {
        "h": "Bayes Optimal Decision Threshold",
        "tex": "p^* = \\frac{C_{FP} - C_{TN}}{(C_{FP} - C_{TN}) + (C_{FN} - C_{TP})} \\approx \\frac{C_{FP}}{C_{FP} + C_{FN}} \\quad (\\text{when } C_{TP} = C_{TN} = 0)",
        "p": "When false negatives cost 9 times more than false positives (C_FN = 90, C_FP = 10), the optimal threshold drops to p* = 10 / (10 + 90) = 0.10."
      },
      {
        "h": "Cost-Weighted Cross-Entropy Loss",
        "tex": "\\mathcal{L}_{\\mathrm{cost}}(\\theta) = -\\frac{1}{n} \\sum_{i=1}^n \\left[ w_1 y_i \\log \\hat{p}_i + w_0 (1 - y_i) \\log(1 - \\hat{p}_i) \\right], \\quad w_1 = C_{FN}, \\; w_0 = C_{FP}",
        "p": "Directly penalises false negative gradient steps in proportion to financial penalty during backpropagation or IRLS updates."
      }
    ],
    code: "import numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\n# Cost-Sensitive Classification: Threshold Shifting vs Standard 0.5 Threshold\nnp.random.seed(42)\nn_samples = 2000\n\n# Synthetic fraudulent transactions: 95% legitimate (0), 5% fraud (1)\nX = np.random.normal(0, 1, (n_samples, 4))\nlatent = X[:, 0] * 1.2 - X[:, 1] * 0.8 + np.random.normal(0, 0.5, n_samples)\nprobs = 1.0 / (1.0 + np.exp(-latent))\ny = (probs > np.percentile(probs, 95)).astype(int)  # Exactly 5% fraud\n\n# Split into Train and Test\nn_train = 1200\nX_train, X_test = X[:n_train], X[n_train:]\ny_train, y_test = y[:n_train], y[n_train:]\n\n# Cost Matrix:\n# False Negative (missed fraud): £500\n# False Positive (manual fraud review): £20\n# True Positive / True Negative: £0\nC_FN = 500.0\nC_FP = 20.0\nC_TP = 0.0\nC_TN = 0.0\n\n# Bayes Optimal Threshold: p* = C_FP / (C_FP + C_FN)\nbayes_threshold = C_FP / (C_FP + C_FN)\nprint(f\"Theoretical Bayes optimal decision threshold: {bayes_threshold:.4f} (not 0.50!)\")\n\n# Fit standard probabilistic classifier\nmodel = LogisticRegression(solver='liblinear')\nmodel.fit(X_train, y_train)\ntest_probs = model.predict_proba(X_test)[:, 1]\n\n# Strategy 1: Standard Default Threshold (p = 0.50)\npreds_default = (test_probs >= 0.50).astype(int)\n\n# Strategy 2: Bayes Cost-Optimal Threshold (p = p*)\npreds_cost_optimal = (test_probs >= bayes_threshold).astype(int)\n\n# Financial Loss Calculation\ndef calculate_financial_cost(y_true, y_pred, c_fn, c_fp):\n    fn = np.sum((y_true == 1) & (y_pred == 0))\n    fp = np.sum((y_true == 0) & (y_pred == 1))\n    tp = np.sum((y_true == 1) & (y_pred == 1))\n    tn = np.sum((y_true == 0) & (y_pred == 0))\n    total_cost = fn * c_fn + fp * c_fp\n    return total_cost, fn, fp, tp, tn\n\ncost_def, fn_def, fp_def, tp_def, tn_def = calculate_financial_cost(y_test, preds_default, C_FN, C_FP)\ncost_opt, fn_opt, fp_opt, tp_opt, tn_opt = calculate_financial_cost(y_test, preds_cost_optimal, C_FN, C_FP)\n\nprint(\"\\n--- Performance Comparison on Test Set (800 samples) ---\")\nprint(f\"Default (p=0.50):       Total Cost: £{cost_def:,.2f} | Missed Frauds (FN): {fn_def} | False Alarms (FP): {fp_def}\")\nprint(f\"Cost-Optimal (p={bayes_threshold:.2f}): Total Cost: £{cost_opt:,.2f} | Missed Frauds (FN): {fn_opt} | False Alarms (FP): {fp_opt}\")\nprint(f\"Total Money Saved: £{cost_def - cost_opt:,.2f} ({((cost_def - cost_opt) / cost_def) * 100:.1f}% reduction in financial damage)\")",
    keyPoints: [
      "Replaces error count minimisation with expected loss minimisation based on a domain-specific cost matrix $C(i, j)$.",
      "Bayes Decision Theory proves the optimal decision threshold is $p^* = \\frac{C_{FP} - C_{TN}}{(C_{FP} - C_{TN}) + (C_{FN} - C_{TP})}$.",
      "Threshold tuning on well-calibrated probabilities avoids retraining and enables instant adaptation to fluctuating economic cost regimes.",
      "Cost-weighted loss functions inject cost weights directly into gradients during empirical risk minimisation.",
      "Evaluated using total enterprise cost, expected financial loss, or cost-sensitive profit curves rather than ROC AUC or 0-1 accuracy."
    ],
    pitfalls: [
      "Uncalibrated probabilities: Bayes optimal threshold shifting strictly assumes predicted probabilities match empirical event frequencies; uncalibrated scores corrupt threshold performance.",
      "Relying on accuracy as an evaluation metric: In asymmetric domains, a trivial model predicting \"Legitimate\" 100% of the time achieves 99% accuracy while bankrupting the firm.",
      "Assuming static costs: Operational costs (e.g. manual audit wage, regulatory fine per breach) shift over time; hard-coding thresholds into codebases creates silent economic loss."
    ],
    quiz: [
      {
        "q": "If a False Negative costs £450 and a False Positive costs £50 (with zero cost for correct predictions), what is the Bayes optimal decision threshold?",
        "o": [
          "p* = 50 / (50 + 450) = 0.10",
          "p* = 450 / (50 + 450) = 0.90",
          "p* = 0.50",
          "p* = 450 - 50 = 400"
        ],
        "a": 0,
        "why": "From Bayes decision theory p* = C_FP / (C_FP + C_FN) = 50 / 500 = 0.10. Any sample with predicted risk > 10% should be flagged to minimise expected financial loss."
      },
      {
        "q": "Why is probability calibration essential before applying Bayes decision threshold shifting?",
        "o": [
          "Because the theoretical optimal threshold p* relies on the model output representing true posterior probabilities P(Y=1|x)",
          "Because calibration scales all features to zero mean and unit variance",
          "Because uncalibrated models cannot compute predictions",
          "Because calibration makes the dataset completely balanced"
        ],
        "a": 0,
        "why": "The derivation of p* assumes hat{p} = P(Y=1|x). If model scores are uncalibrated (e.g. raw SVM margins or distorted tree scores), comparing them to p* destroys expected loss guarantees."
      }
    ],
    usedBy: [],
    prereq: [
      "logistic-regression-inference-odds-ratios-wald-tests",
      "confusion-matrix"
    ],
    related: [
      "logistic_regression",
      "multi-label-classification",
      "confusion-matrix",
      "cross-validation"
    ],
    keywords: "cost sensitive learning, bayes decision theory, cost matrix, optimal threshold, false negative cost, class imbalance, probability calibration"
  },
  {
    id: "self-organising-maps",
    short: "Self-organising maps",
    title: "Self-Organising Maps (Kohonen Networks)",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Unsupervised competitive neural network for non-linear dimensionality reduction and clustering: master Kohonen lattices, Best Matching Units (BMU), and topological neighbourhood adaptation.",
    lead: "Developed by Teuvo Kohonen, Self-Organising Maps map high-dimensional complex manifolds onto a discrete, low-dimensional (typically 2D) grid of neurons while preserving spatial topology.",
    intuition: [
      "Exploring high-dimensional datasets with dozens or hundreds of features is difficult because human visual perception is confined to two and three dimensions. Standard linear projection methods like PCA can obliterate non-linear manifolds, while k-means clustering segments data without revealing the geometric relationships between cluster centroids.",
      "Developed by Finnish neuroscientist Teuvo Kohonen in the 1980s, Self-Organising Maps (SOMs) provide a unique blend of vector quantisation, non-linear dimensionality reduction, and clustering. A SOM consists of a regular low-dimensional lattice of neurons (typically a 2D rectangular or hexagonal grid). Each neuron $i$ holds a weight vector $m_i$ possessing the identical dimensionality as the input data.",
      "Learning occurs through an unsupervised competitive learning process inspired by retinotopic mapping in the cerebral cortex. When an input vector $x$ is presented, all neurons compete. The neuron whose weight vector is closest to $x$ in Euclidean space is declared the Best Matching Unit (BMU).",
      "Unlike k-means—which updates only the winning centroid—a SOM updates both the BMU and its spatial topological neighbours on the 2D grid. The magnitude of the update decays with both topological grid distance (via a Gaussian neighbourhood kernel) and training iteration time. Consequently, neighbouring neurons on the 2D grid are pulled toward similar regions of high-dimensional space, preserving topological neighbourhood relations."
    ],
    analogy: "Imagine a flexible 2D rubber mesh laid out across a flat table. You drop points of molten solder in a 3D glass room above the table. For every drop of solder, you find the closest point on the rubber mesh (the BMU) and tug it upwards toward the solder drop. Because the rubber sheet is elastic, pulling the winning point also stretches neighbouring sections of the mesh upwards. Over thousands of tugs, the 2D rubber sheet drapes itself smoothly across the 3D contour of solder points.",
    steps: [
      {
        "title": "1. Initialise lattice geometry and neuron weights",
        "body": "Construct a 2D grid (e.g. $10 \\times 10$ rectangular or hexagonal neurons). Initialise weight vectors $m_i \\in \\mathbb{R}^d$ randomly or using the first two principal component axes."
      },
      {
        "title": "2. Find Best Matching Unit (BMU)",
        "body": "Present sample $x \\in \\mathbb{R}^d$. Calculate Euclidean distance to all neurons: $c = \\arg\\min_i \\|x - m_i\\|_2$."
      },
      {
        "title": "3. Update topological neighbourhood weights",
        "body": "Adjust weights of all neurons: $m_i(t+1) = m_i(t) + \\alpha(t) h_{ci}(t) [x - m_i(t)]$, where $\\alpha(t)$ is the decaying learning rate and $h_{ci}(t) = \\exp(-\\|r_c - r_i\\|^2 / (2 \\sigma(t)^2))$."
      },
      {
        "title": "4. Decay radius and evaluate U-matrix",
        "body": "Gradually reduce neighbourhood radius $\\sigma(t)$ and learning rate $\\alpha(t)$ over training epochs. Visualise clusters using the Unified Distance Matrix (U-matrix), displaying average distance between adjacent neurons."
      }
    ],
    math: [
      {
        "h": "Best Matching Unit (BMU) Selection",
        "tex": "c = \\arg\\min_{i \\in \\mathcal{V}} \\|x(t) - m_i(t)\\|_2",
        "p": "Competitive step: the winner c is the neuron in lattice V with minimal Euclidean distance to input vector x(t)."
      },
      {
        "h": "Weight Vector Update Rule",
        "tex": "m_i(t+1) = m_i(t) + \\alpha(t) h_{ci}(t) [x(t) - m_i(t)], \\quad h_{ci}(t) = \\exp\\left(-\\frac{\\|r_c - r_i\\|^2}{2 \\sigma(t)^2}\\right)",
        "p": "Neuron weights are pulled toward input x(t). The Gaussian spatial kernel h_ci(t) weights adaptation by the Euclidean distance between neuron coordinates r_c and r_i on the 2D lattice."
      },
      {
        "h": "Quantisation and Topographic Errors",
        "tex": "\\mathrm{QE} = \\frac{1}{n} \\sum_{k=1}^n \\|x_k - m_{c(k)}\\|, \\quad \\mathrm{TE} = \\frac{1}{n} \\sum_{k=1}^n u(x_k), \\quad u(x_k) = \\begin{cases} 0 & \\text{if 1st & 2nd BMU are adjacent} \\\\ 1 & \\text{otherwise} \\end{cases}",
        "p": "Quantisation error (QE) measures reconstruction fidelity. Topographic error (TE) measures the proportion of samples whose 1st and 2nd BMUs are not lattice neighbours, quantifying topology preservation."
      }
    ],
    code: "import numpy as np\n\n# 2D Self-Organising Map (SOM) from scratch\nclass SelfOrganisingMap:\n    def __init__(self, grid_size=(8, 8), input_dim=3, lr=0.5, sigma=2.0):\n        self.rows, self.cols = grid_size\n        self.n_neurons = self.rows * self.cols\n        self.input_dim = input_dim\n        self.lr_initial = lr\n        self.sigma_initial = sigma\n        \n        # Initialise weights randomly in [0, 1]\n        self.weights = np.random.uniform(0, 1, (self.rows, self.cols, self.input_dim))\n        \n        # 2D coordinates of neurons on the grid\n        self.grid_coords = np.array([[[r, c] for c in range(self.cols)] for r in range(self.rows)])\n        \n    def find_bmu(self, x):\n        # Compute Euclidean distance from x to all neurons\n        diff = self.weights - x\n        dist_sq = np.sum(diff**2, axis=-1)\n        bmu_idx = np.unravel_index(np.argmin(dist_sq), (self.rows, self.cols))\n        return bmu_idx\n        \n    def fit(self, X, n_epochs=100):\n        n_samples = len(X)\n        total_steps = n_epochs * n_samples\n        step = 0\n        \n        for epoch in range(n_epochs):\n            # Shuffle data\n            indices = np.random.permutation(n_samples)\n            for idx in indices:\n                x = X[idx]\n                step += 1\n                \n                # Decaying learning rate and radius\n                decay = np.exp(-step / total_steps)\n                lr = self.lr_initial * decay\n                sigma = max(self.sigma_initial * decay, 0.5)\n                \n                # Find BMU\n                bmu_r, bmu_c = self.find_bmu(x)\n                bmu_pos = np.array([bmu_r, bmu_c])\n                \n                # Compute grid distance from BMU to all neurons\n                grid_dist_sq = np.sum((self.grid_coords - bmu_pos)**2, axis=-1)\n                \n                # Gaussian neighbourhood kernel\n                h = np.exp(-grid_dist_sq / (2 * sigma**2))\n                \n                # Update weights\n                self.weights += lr * h[:, :, None] * (x - self.weights)\n\n# Synthetic 3D RGB colour cluster data (Red, Green, Blue, Yellow)\nnp.random.seed(42)\nreds = np.random.uniform([0.7, 0, 0], [1, 0.3, 0.3], (25, 3))\ngreens = np.random.uniform([0, 0.7, 0], [0.3, 1, 0.3], (25, 3))\nblues = np.random.uniform([0, 0, 0.7], [0.3, 0.3, 1], (25, 3))\nyellows = np.random.uniform([0.7, 0.7, 0], [1, 1, 0.3], (25, 3))\nX_colours = np.vstack([reds, greens, blues, yellows])\n\nsom = SelfOrganisingMap(grid_size=(6, 6), input_dim=3, lr=0.5, sigma=2.0)\nsom.fit(X_colours, n_epochs=50)\n\n# Calculate Quantisation Error\ndists = []\nfor x in X_colours:\n    bmu_r, bmu_c = som.find_bmu(x)\n    dists.append(np.linalg.norm(x - som.weights[bmu_r, bmu_c]))\nqe = np.mean(dists)\n\nprint(f\"SOM Lattice Dimensions: {som.rows}x{som.cols} ({som.n_neurons} neurons)\")\nprint(f\"Input Data: {X_colours.shape} (RGB colour vectors)\")\nprint(f\"Average Quantisation Error: {qe:.4f}\")\nprint(\"Top-left neuron weight (RGB):  \", som.weights[0, 0].round(3))\nprint(\"Bottom-right neuron weight (RGB):\", som.weights[-1, -1].round(3))",
    keyPoints: [
      "Unsupervised competitive neural network that projects high-dimensional data onto a low-dimensional topological grid (typically 2D).",
      "Best Matching Unit (BMU) competition: the neuron closest in Euclidean distance to the input sample wins the iteration.",
      "Topological preservation: the BMU and its spatial lattice neighbours are updated together via a decaying Gaussian neighbourhood kernel.",
      "U-matrix (Unified Distance Matrix) visualises clustering boundaries by calculating Euclidean distance between adjacent neurons.",
      "Quantisation error measures geometric distortion, while topographic error evaluates the proportion of broken neighbourhood relationships."
    ],
    pitfalls: [
      "Scale sensitivity: SOMs rely on Euclidean distance; unscaled features with large numerical magnitudes dominate BMU selection and corrupt maps.",
      "Dead neurons from poor initialisation: Random weight initialisation can leave peripheral neurons outside the data support that never win competition; PCA initialisation prevents dead neurons.",
      "Computational scaling: Standard SOM scales as $O(n \\cdot N_{\\mathrm{neurons}} \\cdot d)$ per epoch, becoming sluggish on massive datasets."
    ],
    quiz: [
      {
        "q": "What is the crucial mechanism that allows a Self-Organising Map to preserve topology unlike standard k-means clustering?",
        "o": [
          "Updating both the winning neuron (BMU) and its spatial neighbours on the 2D lattice using a neighbourhood function",
          "Using backpropagation and stochastic gradient descent",
          "Normalising all feature columns to zero mean and unit variance",
          "Fitting a linear regression model on the cluster labels"
        ],
        "a": 0,
        "why": "In k-means, only the winning centroid is updated. In a SOM, the BMU and its topological neighbours on the 2D lattice are pulled toward the sample, preserving spatial topology."
      },
      {
        "q": "What does the U-matrix (Unified Distance Matrix) represent in a trained SOM visualisation?",
        "o": [
          "The Euclidean distance between adjacent neurons on the lattice, where high values denote cluster boundaries and valleys denote cluster centres",
          "The training loss curve plotted over epochs",
          "The confusion matrix of classification predictions",
          "The variance explained by each principal component"
        ],
        "a": 0,
        "why": "The U-matrix displays distances between neighbouring neuron weight vectors; high-distance ridges signify boundaries separating distinct clusters."
      }
    ],
    usedBy: [],
    prereq: [
      "kmeans_clustering"
    ],
    related: [
      "kmeans_clustering",
      "affinity_propagation",
      "spectral_clustering",
      "cross-validation"
    ],
    keywords: "self organising maps, som, kohonen network, bmu, competitive learning, u matrix, topological mapping, unsupervised learning"
  },
  {
    id: "biclustering",
    short: "Biclustering",
    title: "Biclustering (Co-clustering)",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Simultaneously cluster rows and columns of a data matrix: master Spectral Co-clustering, Spectral Biclustering, and gene expression analysis.",
    lead: "Traditional clustering groups rows across all features or features across all samples. Biclustering identifies local sub-matrices where a specific subset of samples exhibits coherent behaviour across a specific subset of features.",
    intuition: [
      "Traditional clustering algorithms partition observations based on their values across all measured features: k-means or DBSCAN compares samples along the entirety of feature space $\\mathbb{R}^d$. However, in genomics, e-commerce, and text mining, relationships are often strictly localized: a group of 50 genes may be co-regulated only in a tiny subset of 12 cancer patients, while expressing unrelated random baseline noise across the other 500 patients.",
      "When classical clustering evaluates distance over all 20,000 genes, the localized 50-gene co-regulation is completely overwhelmed by the background noise of the other 19,950 uninformative genes. Similarly, in collaborative filtering, a group of 300 users may share identical preferences for French arthouse cinema, but have completely divergent preferences across Hollywood blockbusters and sports documentaries.",
      "Biclustering (also termed co-clustering or two-mode clustering) solves this by clustering rows and columns simultaneously. Rather than partitioning the entire row space or column space globally, biclustering identifies local sub-matrices (biclusters) where a specific subset of rows exhibits coherent, correlated, or constant values across a specific subset of columns.",
      "Spectral Co-clustering models the data matrix as an adjacency matrix of an undirected bipartite graph between row and column nodes. By computing singular vectors of the normalised data matrix, it solves a graph partition problem that rearranges rows and columns to expose block-diagonal and checkerboard structures."
    ],
    analogy: "Imagine a giant crossword puzzle grid filled with random jumbled letters. If you look at the whole grid at once, it appears completely chaotic. Biclustering is like finding hidden word rectangles: taking five specific rows and four specific columns, then sliding them together so their intersection forms a perfectly readable English word, even while all surrounding letters remain gibberish.",
    steps: [
      {
        "title": "1. Formulate data matrix and select bicluster model",
        "body": "Structure input matrix $A \\in \\mathbb{R}^{n \\times p}$. Determine whether seeking constant value blocks, constant row/column shifted blocks, or coherent scale/interaction sub-matrices."
      },
      {
        "title": "2. Normalise bipartite graph representation",
        "body": "For Spectral Co-clustering, compute row sums $R_i = \\sum_j A_{ij}$ and column sums $C_j = \\sum_i A_{ij}$. Construct normalised matrix $A_n = R^{-1/2} A C^{-1/2}$."
      },
      {
        "title": "3. Extract singular vectors via SVD",
        "body": "Compute Singular Value Decomposition $A_n = U \\Sigma V^T$. For $k$ biclusters, extract the second through $(1 + \\lceil \\log_2 k \\rceil)$ singular vectors from $U$ and $V$."
      },
      {
        "title": "4. Cluster concatenated singular vectors",
        "body": "Form matrix $Z = [R^{-1/2} U_k ; C^{-1/2} V_k]$. Apply k-means to $Z$ to simultaneously assign row labels and column labels, revealing block-diagonal structure."
      }
    ],
    math: [
      {
        "h": "Mean Squared Residue (Cheng and Church Score)",
        "tex": "H(I, J) = \\frac{1}{|I| |J|} \\sum_{i \\in I, j \\in J} (a_{ij} - a_{iJ} - a_{Ij} + a_{IJ})^2",
        "p": "Measures coherence of a bicluster sub-matrix formed by rows I and columns J. Here a_iJ is row mean, a_Ij is column mean, and a_IJ is overall bicluster mean. A residue of zero indicates perfect additive coherence."
      },
      {
        "h": "Normalised Bipartite Graph Laplacian",
        "tex": "A_n = R^{-1/2} A C^{-1/2}, \\quad R = \\operatorname{diag}(A \\mathbf{1}_p), \\; C = \\operatorname{diag}(\\mathbf{1}_n^T A)",
        "p": "Normalisation ensures degree-invariance on bipartite graph connecting row nodes to column nodes, mapping the problem directly into spectral graph theory."
      },
      {
        "h": "Spectral Co-clustering Partition",
        "tex": "z = \\begin{bmatrix} R^{-1/2} u \\\\ C^{-1/2} v \\end{bmatrix}, \\quad A_n v = \\sigma u, \\; A_n^T u = \\sigma v",
        "p": "The left and right singular vectors u and v of normalised matrix A_n define coordinates that minimise normalised cut on the bipartite graph."
      }
    ],
    code: "import numpy as np\nfrom sklearn.cluster import KMeans\n\n# Spectral Co-Clustering from scratch\ndef spectral_coclustering(A, n_clusters=2):\n    n_rows, n_cols = A.shape\n    \n    # 1. Row and Column marginals\n    R = np.sum(A, axis=1, keepdims=True)\n    C = np.sum(A, axis=0, keepdims=True)\n    \n    # Prevent division by zero\n    R[R == 0] = 1e-12\n    C[C == 0] = 1e-12\n    \n    # 2. Normalised matrix A_n = R^{-1/2} A C^{-1/2}\n    R_inv_sqrt = 1.0 / np.sqrt(R)\n    C_inv_sqrt = 1.0 / np.sqrt(C)\n    A_n = R_inv_sqrt * A * C_inv_sqrt\n    \n    # 3. SVD of normalised matrix\n    U, S, Vt = np.linalg.svd(A_n, full_matrices=False)\n    V = Vt.T\n    \n    # Use singular vectors corresponding to second largest singular values\n    # For n_clusters, take vectors 1 through n_clusters\n    n_vecs = int(np.ceil(np.log2(n_clusters))) + 1\n    U_sub = U[:, 1:n_vecs]\n    V_sub = V[:, 1:n_vecs]\n    \n    # Scale back by R^{-1/2} and C^{-1/2}\n    Z_rows = R_inv_sqrt * U_sub\n    Z_cols = C_inv_sqrt * V_sub\n    \n    # 4. Cluster rows and columns using k-means\n    km_rows = KMeans(n_clusters=n_clusters, random_state=42, n_init=10).fit(Z_rows)\n    km_cols = KMeans(n_clusters=n_clusters, random_state=42, n_init=10).fit(Z_cols)\n    \n    return km_rows.labels_, km_cols.labels_\n\n# Create synthetic matrix with 2 hidden block-diagonal biclusters\nnp.random.seed(42)\nn_r, n_c = 60, 40\ndata = np.random.uniform(1.0, 5.0, (n_r, n_c))\n\n# Bicluster 1: rows 0-24, cols 0-14 have elevated mean\ndata[0:25, 0:15] += 20.0\n# Bicluster 2: rows 25-59, cols 15-39 have elevated mean\ndata[25:60, 15:40] += 20.0\n\n# Shuffle rows and columns to scramble visual structure\nrow_perm = np.random.permutation(n_r)\ncol_perm = np.random.permutation(n_c)\nscrambled = data[row_perm, :][:, col_perm]\n\n# Run Spectral Co-clustering\nrow_labels, col_labels = spectral_coclustering(scrambled, n_clusters=2)\n\nprint(f\"Scrambled matrix shape: {scrambled.shape}\")\nprint(f\"Discovered row cluster sizes: {np.bincount(row_labels)}\")\nprint(f\"Discovered column cluster sizes: {np.bincount(col_labels)}\")\nprint(\"Row partition matches ground truth:\", len(np.unique(row_labels[row_perm < 25])) == 1)\nprint(\"Column partition matches ground truth:\", len(np.unique(col_labels[col_perm < 15])) == 1)",
    keyPoints: [
      "Simultaneously clusters rows and columns of a matrix, isolating local sub-matrices of coherent values.",
      "Vital when target patterns exist only across a subset of features for a subset of samples (e.g. gene pathways or niche product tastes).",
      "Spectral Co-clustering frames the task as finding a minimal normalised cut on a bipartite graph between rows and columns.",
      "Solved efficiently via Singular Value Decomposition (SVD) of the row- and column-normalised data matrix.",
      "Cheng-Church score (Mean Squared Residue) provides a standard quality benchmark for additive and constant biclusters."
    ],
    pitfalls: [
      "Sensitivity to negative values: Spectral co-clustering interprets elements as bipartite edge weights, requiring non-negative entries ($A_{ij} \\ge 0$).",
      "Overlapping biclusters: Standard spectral co-clustering produces disjoint partitions; soft or overlapping biclustering requires Plaid or iterative residue models.",
      "Sensitivity to background noise scale: When matrix sparsity is extreme or noise variance exceeds signal jump, singular vectors fail to separate."
    ],
    quiz: [
      {
        "q": "Why does traditional k-means clustering fail to detect localized gene expression pathways across patients?",
        "o": [
          "k-means measures distance across all 20,000 genes, so the localized 50-gene signal is overwhelmed by noise in the remaining genes",
          "k-means requires square symmetric matrices",
          "k-means cannot be applied to biological data",
          "k-means only works on binary zero-one data"
        ],
        "a": 0,
        "why": "Traditional clustering computes Euclidean distances globally across all features. When a pathway is active only in a tiny fraction of genes, global distance is dominated by irrelevant background genes."
      },
      {
        "q": "How does Spectral Co-clustering simultaneously assign cluster labels to both rows and columns?",
        "o": [
          "By representing the matrix as an undirected bipartite graph and clustering the concatenated left and right singular vectors",
          "By running k-means on rows and then running linear regression on columns",
          "By taking the inverse Fourier transform of the matrix",
          "By discarding all columns with variance below 1.0"
        ],
        "a": 0,
        "why": "Spectral Co-clustering frames rows and columns as bipartite graph nodes. SVD on the normalised matrix yields singular vectors corresponding to graph cuts for both rows and columns."
      }
    ],
    usedBy: [],
    prereq: [
      "kmeans_clustering",
      "svd-and-truncated-svd"
    ],
    related: [
      "kmeans_clustering",
      "spectral_clustering",
      "svd-and-truncated-svd",
      "self-organising-maps"
    ],
    keywords: "biclustering, co-clustering, two mode clustering, spectral coclustering, cheng church, gene expression, bipartite graph, singular value decomposition"
  },
  {
    id: "time-series-clustering-with-dtw",
    short: "Time-series DTW",
    title: "Time-Series Clustering with Dynamic Time Warping",
    task: "concepts",
    module: "Beyond the basics",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Cluster temporal sequences of varying lengths and phase shifts: master Dynamic Time Warping (DTW) distance, Sakoe–Chiba warping bands, and k-DBA centroid averaging.",
    lead: "Euclidean distance fails on time series when temporal patterns are out of phase or stretched in duration. Dynamic Time Warping non-linearly aligns the time axes of two sequences to measure true morphological similarity.",
    intuition: [
      "When clustering temporal sequences—such as electrocardiogram (ECG) heartbeats, smart-meter energy consumption profiles, gesture accelerometry, or financial stock trajectories—standard distance metrics fail. Euclidean distance strictly pairs sample $x_i(t)$ with sample $x_j(t)$ at the identical time index $t$. If one heartbeat is delayed by 50 milliseconds, or if one speaker pronounces a vowel twice as slowly, Euclidean distance reports a colossal distance even though the underlying morphological shapes are identical.",
      "Dynamic Time Warping (DTW) overcomes this rigid lock-step assumption by warping the time dimension non-linearly. It allows multiple consecutive points in one sequence to match a single point in another, accommodating local tempo variations, phase shifts, and differing sequence lengths.",
      "The optimal alignment is determined via dynamic programming, constructing an $n \\times m$ cost matrix where entry $(i, j)$ represents the minimal accumulated distance along a valid warping path from start $(1, 1)$ to end $(n, m)$. Valid paths must satisfy boundary conditions, monotonicity (time cannot flow backwards), and continuity (no time steps can be skipped).",
      "To prevent pathological warping (where a single point in one sequence is matched to an entire plateau in another) and to accelerate computation from $O(n^2)$ to $O(n \\cdot w)$, practitioners apply global window constraints like the Sakoe–Chiba band. When clustering collections of time series, k-means is adapted using DTW Barycentre Averaging (DBA) to iteratively compute the optimal average centroid sequence."
    ],
    analogy: "Imagine comparing two musicians playing the identical trumpet solo. The first musician plays briskly in 4/4 time; the second plays with rubato, lingering on the high notes and rushing through the arpeggios. Comparing their sound waves sample-by-sample with Euclidean distance concludes they are playing completely different songs. Dynamic Time Warping acts like an expert conductor, stretching and compressing the time axis so each note aligns with its counterpart, recognising the identical melody.",
    steps: [
      {
        "title": "1. Formulate pairwise distance cost matrix",
        "body": "Given two sequences $X = (x_1, \\dots, x_n)$ and $Y = (y_1, \\dots, y_m)$, compute local pairwise distances $d(x_i, y_j) = (x_i - y_j)^2$."
      },
      {
        "title": "2. Enforce Sakoe–Chiba warping window",
        "body": "Constrain the search space: allow alignment only when $|i - j| \\le w$, where $w$ is the warping window width (typically 5–10% of sequence length)."
      },
      {
        "title": "3. Fill dynamic programming accumulation table",
        "body": "Compute cumulative cost: $D(i, j) = d(x_i, y_j) + \\min(D(i-1, j), D(i, j-1), D(i-1, j-1))$. The overall DTW distance is $\\sqrt{D(n, m)}$."
      },
      {
        "title": "4. Cluster using k-medoids or k-DBA",
        "body": "Compute pairwise DTW distance matrix across all $N$ time series and cluster using k-medoids (PAM), or iteratively update synthetic cluster centroids via DTW Barycentre Averaging (DBA)."
      }
    ],
    math: [
      {
        "h": "Dynamic Programming Recurrence",
        "tex": "D(i, j) = (x_i - y_j)^2 + \\min \\begin{cases} D(i - 1, j) & \\text{(insertion / warp Y)} \\\\ D(i, j - 1) & \\text{(deletion / warp X)} \\\\ D(i - 1, j - 1) & \\text{(match)} \\end{cases}",
        "p": "Accumulated cost matrix recursion. Each step chooses the minimal cost preceding step to find the optimal global warping path."
      },
      {
        "h": "Warping Path Constraints",
        "tex": "W = (w_1, \\dots, w_K), \\quad w_1 = (1, 1), \\; w_K = (n, m), \\quad w_k = (i, j) \\implies w_{k+1} \\in \\{(i+1, j), (i, j+1), (i+1, j+1)\\}",
        "p": "Enforces boundary conditions (paths must start at beginning and finish at end) and step size conditions (monotonicity and continuity)."
      },
      {
        "h": "Sakoe–Chiba Warping Window Constraint",
        "tex": "|i - j| \\le w",
        "p": "Restricts the warping path to a corridor of width w around the main diagonal, preventing pathological time distortion and speeding up computation from O(nm) to O(nw)."
      }
    ],
    code: "import numpy as np\n\n# Dynamic Time Warping (DTW) with Sakoe-Chiba Band from scratch\ndef dtw_distance(x, y, window=None):\n    n, m = len(x), len(y)\n    if window is None:\n        window = max(n, m)\n    else:\n        window = max(window, abs(n - m))\n        \n    # Initialise cost matrix with infinity\n    dtw_matrix = np.full((n + 1, m + 1), float('inf'))\n    dtw_matrix[0, 0] = 0.0\n    \n    for i in range(1, n + 1):\n        for j in range(max(1, i - window), min(m + 1, i + window + 1)):\n            cost = (x[i - 1] - y[j - 1])**2\n            dtw_matrix[i, j] = cost + min(\n                dtw_matrix[i - 1, j],      # Insertion\n                dtw_matrix[i, j - 1],      # Deletion\n                dtw_matrix[i - 1, j - 1]   # Match\n            )\n            \n    return np.sqrt(dtw_matrix[n, m])\n\n# Generate synthetic time-series with phase shift and tempo differences\nnp.random.seed(42)\nt = np.linspace(0, 4 * np.pi, 60)\n\n# Class 1: Sine wave with random phase shifts\nclass1_series = [np.sin(t + np.random.uniform(-0.8, 0.8)) + np.random.normal(0, 0.1, len(t)) for _ in range(10)]\n\n# Class 2: Square/Triangle wave\nclass2_series = [np.sign(np.sin(t + np.random.uniform(-0.8, 0.8))) + np.random.normal(0, 0.1, len(t)) for _ in range(10)]\n\nall_series = class1_series + class2_series\nN = len(all_series)\n\n# Compute pairwise DTW distance matrix\ndist_matrix = np.zeros((N, N))\nfor i in range(N):\n    for j in range(i + 1, N):\n        d = dtw_distance(all_series[i], all_series[j], window=10)\n        dist_matrix[i, j] = d\n        dist_matrix[j, i] = d\n\n# Simple k-medoids clustering on DTW distance matrix\ndef k_medoids(dist_mat, k=2, max_iters=20):\n    n = dist_mat.shape[0]\n    # Initialise medoids randomly\n    medoids = np.array([0, N - 1])\n    labels = np.zeros(n, dtype=int)\n    \n    for _ in range(max_iters):\n        # Assign samples to closest medoid\n        labels = np.argmin(dist_mat[:, medoids], axis=1)\n        # Update medoids\n        new_medoids = medoids.copy()\n        for cluster_id in range(k):\n            members = np.where(labels == cluster_id)[0]\n            if len(members) > 0:\n                sub_dist = dist_mat[np.ix_(members, members)]\n                best_member = members[np.argmin(np.sum(sub_dist, axis=1))]\n                new_medoids[cluster_id] = best_member\n        if np.array_equal(new_medoids, medoids):\n            break\n        medoids = new_medoids\n    return labels, medoids\n\nlabels, medoids = k_medoids(dist_matrix, k=2)\ntrue_labels = np.array([0]*10 + [1]*10)\nclustering_acc = max(np.mean(labels == true_labels), np.mean(labels == (1 - true_labels)))\n\nprint(f\"Total time series clustered: {N}\")\nprint(f\"DTW distance between phase-shifted identical waves: {dist_matrix[0, 1]:.3f}\")\nprint(f\"DTW distance between Sine and Square waves:        {dist_matrix[0, 10]:.3f}\")\nprint(f\"k-medoids Clustering Accuracy: {clustering_acc * 100:.1f}%\")",
    keyPoints: [
      "Non-linearly aligns temporal sequences to measure morphological similarity invariant to tempo changes and phase shifts.",
      "Replaces rigid one-to-one Euclidean matching with one-to-many warping via dynamic programming in $O(n \\cdot m)$ time.",
      "Sakoe–Chiba band $|i - j| \\le w$ prevents pathological distortions and accelerates calculation to $O(n \\cdot w)$.",
      "Clustering is performed using k-medoids (PAM) on precomputed distance matrices or k-means with DTW Barycentre Averaging (DBA).",
      "Standard benchmark for human gesture recognition, sensor telemetry, ECG cardiology, and speech processing."
    ],
    pitfalls: [
      "Computational scaling: Pairwise DTW across $N$ time series of length $L$ requires $O(N^2 \\cdot L^2)$ operations; LB_Keogh lower bounding is necessary for large datasets.",
      "Pathological warping: Without a Sakoe-Chiba or Itakura window constraint, a flat plateau in one series can match dozens of peaks in another, producing artificially low distances.",
      "Triangular inequality violation: Standard DTW does not strictly satisfy the triangle inequality, meaning DTW is technically a semi-metric rather than a true metric."
    ],
    quiz: [
      {
        "q": "Why does Euclidean distance perform poorly compared to DTW when comparing audio speech signals of the same word?",
        "o": [
          "Euclidean distance requires exact lock-step temporal alignment, so speaking slightly slower or with a delayed start produces huge artificial distance",
          "Euclidean distance cannot be computed on floating point numbers",
          "Audio speech signals have infinite variance",
          "Euclidean distance only works on 2D images"
        ],
        "a": 0,
        "why": "Euclidean distance pairs points strictly by index t. If a speaker lingers on a syllable, waveforms fall out of phase, creating massive point-to-point Euclidean discrepancy."
      },
      {
        "q": "What is the purpose of enforcing a Sakoe–Chiba band constraint |i - j| <= w in DTW?",
        "o": [
          "It prevents excessive pathological time stretching and reduces computational complexity from O(n^2) to O(nw)",
          "It guarantees that the distance will always be zero",
          "It transforms the time series into frequency domain Fourier coefficients",
          "It eliminates the need for dynamic programming"
        ],
        "a": 0,
        "why": "The Sakoe-Chiba band restricts warping to a diagonal corridor of width w, preventing extreme time warping blunders and speeding up computation."
      }
    ],
    usedBy: [],
    prereq: [
      "kmedoids_clustering"
    ],
    related: [
      "kmedoids_clustering",
      "kmeans_clustering",
      "stationarity-acf-and-pacf",
      "biclustering"
    ],
    keywords: "dtw, dynamic time warping, time series clustering, sakoe chiba band, k-dba, k-medoids, phase shift, alignment"
  },
  {
    id: 'pca',
    short: 'PCA',
    title: 'Principal Component Analysis',
    task: 'concepts',
    module: 'Dimensionality reduction',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`Linear dimensionality reduction projecting data onto orthogonal axes of maximal variance using singular value decomposition, compressing features while preserving global geometric variance.`,
    lead: r`High-dimensional feature spaces suffer from multicollinearity, redundant measurements, and computational overhead. Principal Component Analysis (PCA) identifies an orthogonal sequence of linear projections that sequentially maximise variance, transforming correlated features into mutually uncorrelated principal components and compressing data with minimal reconstruction error.`,
    intuition: [
      r`Imagine holding a complex three-dimensional object—such as a teapot or a sculpture—in front of a blank wall under a single spotlight. If you align the light from a random angle, the cast shadow collapses into an unrecognisable blob where handles and spouts overlap. But as you rotate the object to its broadest, most characteristic orientation, the 2D shadow captures virtually all the defining contours of the 3D shape. PCA is the mathematical equivalent of finding that optimal orientation: it rotates high-dimensional coordinate axes until the projected shadow of the data exhibits the widest possible spread.`,
      r`The fundamental premise of PCA is that directions exhibiting large variance convey the most informative differences between data points, whereas directions with negligible variance correspond to redundant noise or flat dimensions. When two sensors measure closely coupled phenomena (such as indoor temperature in Celsius and Fahrenheit), the data forms an elongated ellipse in 2D space. Instead of keeping both redundant features, PCA aligns the first principal axis along the major axis of the ellipse (capturing the shared thermal trend) and the second principal axis along the minor axis (capturing minor sensor noise).`,
      r`Crucially, each consecutive principal component is constrained to be strictly orthogonal (perpendicular) to all preceding components. This guarantees that the newly created coordinates are completely decorrelated—their sample covariance is exactly zero. By selecting the top $k$ components that account for 90% or 95% of total variance, analysts dramatically compress datasets, eliminate multicollinearity for downstream linear models, and enable two- and three-dimensional exploratory scatter plots without discarding the primary patterns of variability.`,
    ],
    analogy: r`Rotating a 3D architectural model under a camera until you capture the single elevation angle that reveals the maximum building perimeter and room layout in a single 2D photograph.`,
    steps: [
      r`Centre the dataset by subtracting feature means: $X_c = X - \mathbf{1}\mu^T$, ensuring the origin lies at the geometric centroid. Optionally standardise features to unit variance if variables have unequal measurement scales.`,
      r`Compute the sample covariance matrix $\Sigma = \frac{1}{n-1} X_c^T X_c$, or apply Singular Value Decomposition directly to the centred matrix $X_c = U S V^T$ to avoid numerical squaring of condition numbers.`,
      r`Extract the right singular vectors $V$ (or eigenvectors of $\Sigma$) and their corresponding singular values $S$ (where eigenvalues $\lambda_j = S_j^2 / (n - 1)$).`,
      r`Sort eigenvalues and singular vectors in descending order of explained variance $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_d$.`,
      r`Select the top $k$ principal axes $V_k \in \mathbb{R}^{d \times k}$ based on cumulative explained variance ratio criteria (e.g. 95% threshold or scree plot elbow).`,
      r`Project the centred data onto the selected subspace to obtain lower-dimensional coordinates $Z = X_c V_k \in \mathbb{R}^{n \times k}$.`,
      r`Quantify information retention via reconstruction error $\|X_c - Z V_k^T\|_F^2$, which equals the sum of discarded eigenvalues $\sum_{j=k+1}^d \lambda_j$.`,
    ],
    math: [
      {
        h: 'Covariance matrix and principal axis objective',
        tex: r`$$\max_{w} \operatorname{Var}(X_c w) = \max_{w} \frac{1}{n-1} w^T X_c^T X_c w \quad \text{subject to} \quad w^T w = 1$$`,
        p: r`Formulating the Lagrangian $\mathcal{L}(w, \lambda) = w^T \Sigma w - \lambda(w^T w - 1)$ and differentiating yields $\Sigma w = \lambda w$. The principal direction $w$ is the eigenvector of covariance matrix $\Sigma$ corresponding to the largest eigenvalue $\lambda_1 = \operatorname{Var}(X_c w_1)$. Subsequent orthogonal components correspond to eigenvectors ordered by descending eigenvalues.`,
      },
      {
        h: 'SVD connection and computational efficiency',
        tex: r`$$X_c = U S V^T, \qquad \Sigma = \frac{1}{n-1} X_c^T X_c = \frac{1}{n-1} V S^2 V^T$$`,
        p: r`$U \in \mathbb{R}^{n \times d}$ and $V \in \mathbb{R}^{d \times d}$ are orthogonal matrices containing left and right singular vectors, and $S$ contains singular values $s_j$. Computing SVD directly on $X_c$ requires $O(n d \min(n, d))$ operations and preserves double-precision floating-point accuracy without forming the condition-squared product $X_c^T X_c$.`,
      },
      {
        h: 'Explained variance ratio and optimal reconstruction',
        tex: r`$$\operatorname{EVR}_k = \frac{\lambda_k}{\sum_{j=1}^d \lambda_j} = \frac{s_k^2}{\sum_{j=1}^d s_j^2}, \qquad \min_{\operatorname{rank}(\hat{X})=k} \|X_c - \hat{X}\|_F^2 = \sum_{j=k+1}^d \lambda_j$$`,
        p: r`By the Eckart-Young-Mirsky theorem, the truncated projection $\hat{X} = Z V_k^T = X_c V_k V_k^T$ provides the optimal rank-$k$ approximation of centred matrix $X_c$ under both Frobenius and spectral matrix norms.`,
      },
    ],
    code: r`import numpy as np

# Generate synthetic 3D data with correlated features
rng = np.random.default_rng(42)
n_samples = 150
z_true = rng.normal(0, 2, size=(n_samples, 1))
noise = rng.normal(0, 0.3, size=(n_samples, 3))
X = np.hstack([z_true * 2.0, z_true * -1.5, z_true * 0.5]) + noise

# 1. Centre the data (zero mean)
mu = np.mean(X, axis=0)
X_c = X - mu

# 2. Compute SVD: X_c = U * S * Vt
U, S, Vt = np.linalg.svd(X_c, full_matrices=False)
eigenvalues = (S ** 2) / (n_samples - 1)
evr = eigenvalues / np.sum(eigenvalues)

# 3. Project onto top k=2 principal components
k = 2
V_k = Vt[:k, :].T
Z = X_c @ V_k

# 4. Reconstruct and calculate reconstruction error
X_reconstructed = Z @ V_k.T + mu
rec_error = np.mean(np.sum((X - X_reconstructed) ** 2, axis=1))

print(f"Explained variance ratio: {evr[:k].round(4)}")
print(f"Total variance explained: {np.sum(evr[:k]) * 100:.2f}%")
print(f"Mean squared reconstruction error: {rec_error:.4f}")`,
    pitfalls: [
      r`Scale sensitivity: Features measured in large units (e.g. annual salary in pounds) dominate total variance over smaller features (e.g. age in years). Without standardisation, PCA simply projects onto the largest arbitrary units rather than meaningful patterns.`,
      r`Linearity restriction: PCA can only discover linear planar subspaces. Data arranged along non-linear manifolds (such as a Swiss roll, concentric rings, or helical curves) gets squashed and entangled.`,
      r`Assuming high variance equals relevance: PCA is unsupervised and blind to target labels. The direction of maximum variance might represent uninformative measurement noise or illumination differences rather than the target classification signal.`,
      r`Orthogonality constraint: Enforcing mutual orthogonality can force later principal components to blend distinct physical processes together, making individual components difficult to interpret as pure physical entities.`,
    ],
    keyPoints: [
      r`Maximises projected variance while simultaneously minimising mean squared orthogonal reconstruction error.`,
      r`Transforms correlated features into mutually orthogonal, linearly uncorrelated components.`,
      r`Direct SVD of centred data $X_c = U S V^T$ is numerically superior to explicit eigendecomposition of the covariance matrix $\Sigma$.`,
      r`Requires standardisation whenever input features carry differing units or non-comparable variance scales.`,
    ],
    quiz: [
      {
        q: r`Why must features usually be standardised before applying PCA?`,
        o: [
          r`Because PCA cannot run on negative numbers`,
          r`Features with larger numerical scales artificially dominate the covariance matrix and principal axes`,
          r`Because standardisation transforms non-linear relationships into linear ones`,
          r`Standardisation guarantees that the total explained variance reaches exactly 100%`,
        ],
        a: 1,
        why: r`Variance depends on the choice of units. If one feature is measured in millimetres and another in metres, the millimetre feature will display a million-fold greater variance and dominate the top principal component regardless of information content.`,
      },
      {
        q: r`If the eigenvalues of the sample covariance matrix for a 4D dataset are $\lambda = [6.0, 2.5, 1.0, 0.5]$, what percentage of total variance is explained by the first two principal components?`,
        o: [
          r`60.0%`,
          r`75.0%`,
          r`85.0%`,
          r`92.5%`,
        ],
        a: 2,
        why: r`Total variance is the sum of all eigenvalues: $6.0 + 2.5 + 1.0 + 0.5 = 10.0$. The sum of the top two is $6.0 + 2.5 = 8.5$. The explained variance ratio is $8.5 / 10.0 = 0.85$ (or 85%).`,
      },
      {
        q: r`How does Singular Value Decomposition ($X_c = U S V^T$) relate to the eigenvectors of the covariance matrix $\Sigma = \frac{1}{n-1}X_c^T X_c$?`,
        o: [
          r`The right singular vectors $V$ are the eigenvectors of $\Sigma$, and the eigenvalues are $\lambda_j = s_j^2 / (n-1)$`,
          r`The left singular vectors $U$ are the eigenvectors of $\Sigma$, and the singular values $S$ are the eigenvalues`,
          r`$V$ contains the principal scores, while $U$ contains the principal axes`,
          r`SVD cannot be used for PCA unless $X$ is a square matrix`,
        ],
        a: 0,
        why: r`Substituting $X_c = U S V^T$ into $\Sigma$ gives $\frac{1}{n-1} V S U^T U S V^T = \frac{1}{n-1} V S^2 V^T$ because $U^T U = I$. This proves $V$ are the orthonormal eigenvectors of $\Sigma$ with eigenvalues $\lambda_j = s_j^2 / (n-1)$.`,
      },
      {
        q: r`What does the Eckart-Young-Mirsky theorem guarantee about the PCA rank-$k$ reconstruction $\hat{X} = X_c V_k V_k^T$?`,
        o: [
          r`It proves the reconstructed data has zero residual noise`,
          r`It ensures the transformed components follow a multivariate normal distribution`,
          r`It guarantees that all out-of-sample test samples have zero reconstruction error`,
          r`It proves $\hat{X}$ is the optimal rank-$k$ approximation of $X_c$ minimising Frobenius reconstruction error`,
        ],
        a: 3,
        why: r`The Eckart-Young-Mirsky theorem establishes that the truncated SVD reconstruction minimises the Frobenius distance $\|X_c - \hat{X}\|_F$ among all matrices of rank at most $k$.`,
      },
    ],
    usedBy: ['linear_discriminant_analysis', 'logistic_regression'],
    prereq: ['expectation-variance-and-covariance', 'ols_linear_regression'],
    related: ['t-sne', 'umap', 'spectral_clustering'],
    keywords: 'pca principal component analysis dimensionality reduction svd singular value decomposition covariance eigenvalues eigenvectors explained variance',
  },
  {
    id: 't-sne',
    short: 't-SNE',
    title: 't-Distributed Stochastic Neighbour Embedding',
    task: 'concepts',
    module: 'Dimensionality reduction',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Non-linear dimensionality reduction that maps pairwise Euclidean distances to conditional probabilities, matching high-dimensional Gaussians to low-dimensional Student-t distributions via KL divergence.`,
    lead: r`Linear projections like PCA inevitably collapse curved or clustered non-linear manifolds because they prioritise preserving large pairwise distances over local neighbourhood relationships. t-Distributed Stochastic Neighbour Embedding (t-SNE) converts pairwise distances into probabilities of neighbourhood co-occurrence, matching high-dimensional Gaussian affinities with heavy-tailed low-dimensional Student-t distributions to resolve the crowding problem and reveal clustered structures.`,
    intuition: [
      r`In high-dimensional spaces, geometry behaves counter-intuitively: the volume of a sphere grows exponentially with dimension $d$. Points distributed uniformly across a high-dimensional manifold have ample room to stay mutually equidistant from their neighbours. When attempting to project such data onto a two-dimensional sheet, geometry encounters the crowding problem: there simply is not enough area in 2D to accommodate all the moderate-distance neighbours without crushing distinct clusters on top of each other.`,
      r`t-SNE solves this crowding problem through an elegant distribution mismatch. In the original high-dimensional space, pairwise proximity is modelled using a Gaussian distribution, which decays exponentially fast ($e^{-d^2}$). In the low-dimensional embedding space, t-SNE models proximity using a heavy-tailed Student-t distribution with 1 degree of freedom (the Cauchy distribution, decaying as $(1 + d^2)^{-1}$). Because the Student-t distribution has much heavier tails than the Gaussian, moderate-distance points must be pushed much further apart in 2D to yield the same probability match. This creates repulsive breathing room, allowing distinct clusters to separate cleanly.`,
      r`Instead of preserving rigid metric distances, t-SNE preserves neighbourhood topology. The perplexity parameter specifies the effective number of nearest neighbours each point considers when establishing its local bandwidth $\sigma_i$. Dense regions automatically adopt a narrow $\sigma_i$ while sparse regions broaden $\sigma_i$. The algorithm then minimises the Kullback-Leibler (KL) divergence between high-dimensional affinities $P$ and low-dimensional affinities $Q$ using gradient descent. Points that are close neighbours in high dimensions exert strong attractive forces, while low-dimensional normalisation creates global repulsion.`,
    ],
    analogy: r`Unravelling a tangled ball of wool onto a flat tabletop: short threads between neighbouring fibres act as elastic bands pulling nearby loops together, while an overall outward pressure forces separate skeins of yarn to unfurl into isolated clusters.`,
    steps: [
      r`Calculate pairwise Euclidean distances $\|x_i - x_j\|$ between all sample pairs in the original high-dimensional feature space.`,
      r`For each data point $x_i$, perform binary search to determine a unique Gaussian bandwidth $\sigma_i$ such that the Shannon entropy of its conditional probability distribution matches the user-defined perplexity: $\operatorname{Perp}(P_i) = 2^{H(P_i)}$.`,
      r`Compute asymmetric conditional probabilities $p_{j|i}$ and symmetrise them into joint probabilities $p_{ij} = \frac{p_{j|i} + p_{i|j}}{2n}$, setting diagonal self-affinities $p_{ii} = 0$.`,
      r`Initialise low-dimensional coordinates $y_i \in \mathbb{R}^2$ randomly from a Gaussian distribution with small variance (or using the first two PCA components for stable global layout).`,
      r`Compute low-dimensional affinities $q_{ij}$ using the Cauchy / Student-t kernel $(1 + \|y_i - y_j\|^2)^{-1}$, normalised over all pairs.`,
      r`Compute the analytical gradient of the KL divergence $\frac{\partial \mathcal{L}}{\partial y_i} = 4 \sum_j (p_{ij} - q_{ij})(y_i - y_j)(1 + \|y_i - y_j\|^2)^{-1}$.`,
      r`Update coordinates $y_i$ via gradient descent with momentum and early exaggeration (multiplying high-dimensional probabilities $p_{ij}$ by a factor of 4 to 12 during initial iterations to encourage compact cluster formation).`,
    ],
    math: [
      {
        h: 'High-dimensional conditional probabilities and perplexity',
        tex: r`$$p_{j \mid i} = \frac{\exp\left(-\frac{\|x_i - x_j\|^2}{2\sigma_i^2}\right)}{\sum_{k \ne i} \exp\left(-\frac{\|x_i - x_k\|^2}{2\sigma_i^2}\right)}, \qquad \operatorname{Perp}(P_i) = 2^{-\sum_{j} p_{j \mid i} \log_2 p_{j \mid i}}$$`,
        p: r`The variance $\sigma_i^2$ is determined independently for each sample via binary search so that the perplexity matches the user specification (typically between 5 and 50). This adapts to varying local data density.`,
      },
      {
        h: 'Symmetrisation and low-dimensional Student-t kernel',
        tex: r`$$p_{ij} = \frac{p_{j \mid i} + p_{i \mid j}}{2n}, \qquad q_{ij} = \frac{\left(1 + \|y_i - y_j\|^2\right)^{-1}}{\sum_{k} \sum_{l \ne k} \left(1 + \|y_k - y_l\|^2\right)^{-1}}$$`,
        p: r`Symmetrisation ensures that outliers (which have tiny $p_{j|i}$ for all $j$) still exert meaningful gradients. The low-dimensional Cauchy distribution decays as the inverse square of distance, preventing crowding.`,
      },
      {
        h: 'Cost function and analytical gradient',
        tex: r`$$\mathcal{L}_{KL} = \sum_{i} \sum_{j \ne i} p_{ij} \log \frac{p_{ij}}{q_{ij}}, \qquad \frac{\partial \mathcal{L}}{\partial y_i} = 4 \sum_{j} (p_{ij} - q_{ij})(y_i - y_j)\left(1 + \|y_i - y_j\|^2\right)^{-1}$$`,
        p: r`The asymmetry of KL divergence heavily penalises false negatives (large $p_{ij}$ modelled by small $q_{ij}$), which pulls high-dimensional neighbours together. False positives (small $p_{ij}$ with moderate $q_{ij}$) receive very mild penalties, allowing distant clusters to position themselves freely.`,
      },
    ],
    code: r`import numpy as np

# Synthetic dataset: two well-separated clusters in 4D space
rng = np.random.default_rng(42)
X = np.vstack([rng.normal(-3, 0.5, (20, 4)), rng.normal(3, 0.5, (20, 4))])
n = len(X)

# 1. High-dimensional pairwise Gaussian affinities and symmetrisation
D2 = np.sum((X[:, None, :] - X[None, :, :]) ** 2, axis=-1)
np.fill_diagonal(D2, np.inf)
P_cond = np.exp(-D2 / 2.0)
P_cond = P_cond / P_cond.sum(axis=1, keepdims=True)
P = np.maximum((P_cond + P_cond.T) / (2 * n), 1e-12)

# 2. Initialise low-dimensional embedding coordinates
Y = rng.normal(0, 1e-4, (n, 2))
lr, n_iter = 50.0, 120

# 3. Minimise KL divergence via gradient descent
for _ in range(n_iter):
    dist_y = np.sum((Y[:, None, :] - Y[None, :, :]) ** 2, axis=-1)
    inv = 1.0 / (1.0 + dist_y)
    np.fill_diagonal(inv, 0.0)
    Q = np.maximum(inv / np.sum(inv), 1e-12)
    grad = 4 * np.sum((P - Q)[:, :, None] * inv[:, :, None] * (Y[:, None, :] - Y[None, :, :]), axis=1)
    Y -= lr * grad

kl_div = np.sum(P * np.log(P / Q))
print(f"Final KL divergence: {kl_div:.4f}")
print(f"Cluster 1 centre in 2D: {Y[:20].mean(axis=0).round(2)}")
print(f"Cluster 2 centre in 2D: {Y[20:].mean(axis=0).round(2)}")`,
    pitfalls: [
      r`Inter-cluster distances are meaningless: t-SNE prioritises local neighbourhood preservation; the distance between two distant cluster centres in the 2D plot does not reflect true metric separation in high dimensions.`,
      r`Cluster sizes and densities reflect perplexity: t-SNE expands dense clusters and contracts sparse clusters so they appear to have similar spread in 2D. Apparent cluster radius cannot be interpreted as geometric variance.`,
      r`Non-parametric and non-inductive: Standard t-SNE does not learn a functional mapping $f(x) \to y$. New test samples cannot be projected without rerunning the entire optimisation from scratch.`,
      r`Stochastic non-convex optimisation: The KL divergence objective has many local minima. Different random initialisations and perplexity values can yield visually distinct layouts.`,
    ],
    keyPoints: [
      r`Replaces metric distance preservation with probability distribution matching via Kullback-Leibler divergence.`,
      r`Heavy-tailed Student-t kernel in low-dimensional space resolves the high-dimensional crowding problem.`,
      r`Adaptive Gaussian bandwidth $\sigma_i$ dynamically scales to match local density via the perplexity hyperparameter.`,
      r`Designed primarily as an exploratory visualisation technique rather than a feature extraction pipeline for downstream models.`,
    ],
    quiz: [
      {
        q: r`Why does t-SNE use a Student-t distribution in the low-dimensional space instead of a Gaussian distribution?`,
        o: [
          r`Because Student-t distributions are faster to evaluate computationally`,
          r`Because Student-t distributions ensure global linear orthogonality`,
          r`Because high-dimensional data always follows a Student-t distribution`,
          r`Because the heavy tails of the Student-t distribution alleviate the crowding problem by pushing moderate-distance points apart`,
        ],
        a: 3,
        why: r`In low dimensions, area is constrained. The heavy inverse-square tails of the Student-t distribution ($1/(1+d^2)$) require points with small to moderate affinities to be mapped further apart than a Gaussian would, preventing separate clusters from collapsing into a dense central clump.`,
      },
      {
        q: r`What is the primary role of the perplexity hyperparameter in t-SNE?`,
        o: [
          r`It sets the effective number of nearest neighbours used to adapt the local Gaussian bandwidth $\sigma_i$ for each point`,
          r`It determines the final number of clusters displayed in the 2D plot`,
          r`It specifies the learning rate of the gradient descent optimiser`,
          r`It controls the number of principal components retained during initialisation`,
        ],
        a: 0,
        why: r`Perplexity represents the effective continuous degrees of freedom or target neighbourhood size $2^{H(P_i)}$. Binary search tunes $\sigma_i$ per point so its conditional entropy matches $\log_2(\text{perplexity})$.`,
      },
      {
        q: r`Why can the distance between two widely separated clusters in a t-SNE plot NOT be interpreted as true high-dimensional geometric distance?`,
        o: [
          r`Because t-SNE strictly preserves metric distances using geodesic shortest paths`,
          r`Because t-SNE normalises all cluster centroids to lie on the unit circle`,
          r`Because the KL divergence penalty focuses almost entirely on preserving local neighbours, leaving distant clusters free to settle anywhere`,
          r`Because t-SNE introduces artificial random Gaussian jitter to cluster centroids at every iteration`,
        ],
        a: 2,
        why: r`The asymmetric term $p_{ij} \log(p_{ij}/q_{ij})$ approaches zero whenever $p_{ij} \approx 0$. When points belong to different clusters, their $p_{ij}$ is virtually zero, meaning the loss exerts negligible attractive or metric constraints on their relative positions.`,
      },
      {
        q: r`Why can standard t-SNE not directly transform a single new, unseen test sample into 2D coordinates?`,
        o: [
          r`Because t-SNE is a supervised algorithm requiring ground truth labels for transformation`,
          r`Because t-SNE is a non-parametric embedding that optimises sample coordinates directly rather than learning a parametric mapping function`,
          r`Because t-SNE coordinates are only valid when sample count is an exact power of two`,
          r`Because the Student-t distribution cannot be evaluated on individual points`,
        ],
        a: 1,
        why: r`t-SNE does not learn an encoder or projection matrix $W$; it directly optimises the array of 2D coordinates $Y \in \mathbb{R}^{n \times 2}$ via gradient descent over all pairs. Projecting a new point requires rerunning optimisation or using parametric extensions.`,
      },
    ],
    usedBy: [],
    prereq: ['pca', 'kl-divergence'],
    related: ['pca', 'umap', 'spectral_clustering'],
    keywords: 'tsne t-sne t-distributed stochastic neighbour embedding dimensionality reduction manifold learning perplexity kl divergence student-t',
  },
  {
    id: 'umap',
    short: 'UMAP',
    title: 'Uniform Manifold Approximation and Projection',
    task: 'concepts',
    module: 'Dimensionality reduction',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Non-linear manifold dimensionality reduction rooted in Riemannian geometry and algebraic topology, preserving both local and global structure with faster SGD optimisation.`,
    lead: r`While t-SNE produces compelling cluster visualisations, it suffers from quadratic computational scaling, loses broad global continuum arrangements, and cannot readily project out-of-sample observations. Uniform Manifold Approximation and Projection (UMAP) combines theoretical foundations in Riemannian geometry and fuzzy simplicial sets with negative-sampling stochastic gradient descent, delivering faster execution and superior preservation of global trajectory structures.`,
    intuition: [
      r`UMAP begins with three mathematical assumptions: first, that data lies on an underlying Riemannian manifold; second, that the Riemannian metric is locally constant (meaning space stretches or compresses depending on point density); and third, that the manifold is locally connected. Under these assumptions, the metric space around every point can be rescaled such that the distance to its first nearest neighbour is normalised to a baseline value. This ensures that even in extremely sparse regions of the dataset, no point is left isolated from the neighbourhood graph.`,
      r`In high dimensions, UMAP represents neighbourhood relationships as a fuzzy simplicial set—a topological structure where edges, triangles, and higher-order simplices have probabilistic degrees of membership. The fuzzy membership between two points reflects the probability that an edge exists between them. By computing the fuzzy set union across all points, UMAP creates a robust topological graph that models both tight local clusters and bridging corridors across distant groups.`,
      r`In low dimensions, UMAP places points to recreate the high-dimensional fuzzy simplicial set as closely as possible. Instead of using KL divergence (which only penalises false negatives), UMAP optimises the fuzzy set cross-entropy loss. This objective function includes both an attractive term (drawing high-probability neighbours together) and a repulsive term (pushing non-neighbours apart globally). Optimised via stochastic gradient descent with negative sampling (similar to Word2Vec), UMAP runs orders of magnitude faster than t-SNE and preserves broad global continuums.`,
    ],
    analogy: r`Constructing a flexible wire-mesh net over the folds and contours of an origami sculpture, then laying the mesh down flat by pulling interconnected wires taut while gentle repellers keep unrelated folds from tangling.`,
    steps: [
      r`Construct a $k$-nearest neighbour graph across the input dataset using approximate nearest neighbours (such as nearest neighbour descent).`,
      r`For each point $x_i$, compute the local distance $\rho_i$ to its immediate nearest neighbour, establishing the local connectivity constraint.`,
      r`Perform a binary search to find the local scale $\sigma_i$ such that the sum of directed fuzzy memberships satisfies $\sum_{j} \exp(-\max(0, d(x_i, x_j) - \rho_i)/\sigma_i) = \log_2(k)$.`,
      r`Symmetrise the directed affinities using the fuzzy set union formula: $p_{ij} = p_{j|i} + p_{i|j} - p_{j|i} p_{i|j}$.`,
      r`Formulate the low-dimensional affinity kernel $q_{ij} = (1 + a \|y_i - y_j\|^{2b})^{-1}$, fitting parameters $a$ and $b$ to match the chosen minimum distance hyperparameter min_dist.`,
      r`Initialise the low-dimensional layout using spectral embedding (the eigenvectors of the normalised Laplacian of the fuzzy graph) to preserve global macro-structure.`,
      r`Optimise the low-dimensional coordinates using stochastic gradient descent (SGD) on the fuzzy cross-entropy loss, alternating between attractive edge updates and negative-sampled repulsive updates.`,
    ],
    math: [
      {
        h: 'Local metric scaling and directed fuzzy membership',
        tex: r`$$p_{j \mid i} = \exp\left(-\frac{\max(0, d(x_i, x_j) - \rho_i)}{\sigma_i}\right), \qquad \sum_{j=1}^k \exp\left(-\frac{\max(0, d(x_i, x_j) - \rho_i)}{\sigma_i}\right) = \log_2(k)$$`,
        p: r`$\rho_i = \min_{j \ne i} d(x_i, x_j)$ represents the distance to $x_i$'s nearest neighbour. Subtracting $\rho_i$ ensures that $p_{j|i} = 1$ for the closest neighbour, guaranteeing local graph connectivity.`,
      },
      {
        h: 'Fuzzy set algebraic union',
        tex: r`$$p_{ij} = p_{j \mid i} + p_{i \mid j} - p_{j \mid i} p_{i \mid j}$$`,
        p: r`Because the local metrics defined by $\sigma_i$ and $\sigma_j$ differ, $p_{j|i} \ne p_{i|j}$. UMAP treats directed memberships as fuzzy probabilities and applies the standard algebraic t-conorm for fuzzy union to produce a symmetric graph.`,
      },
      {
        h: 'Fuzzy set cross-entropy and low-dimensional gradient',
        tex: r`$$\mathcal{L}_{CE} = \sum_{i \ne j} \left( p_{ij} \log \frac{p_{ij}}{q_{ij}} + (1 - p_{ij}) \log \frac{1 - p_{ij}}{1 - q_{ij}} \right), \quad q_{ij} = \frac{1}{1 + a \|y_i - y_j\|^{2b}}$$`,
        p: r`The first term exerts attractive forces along high-probability edges ($p_{ij} \to 1$). The second term exerts repulsive forces across non-connected pairs ($p_{ij} \to 0$), preserving global separation without requiring low-dimensional partition functions.`,
      },
    ],
    code: r`import numpy as np

# Synthetic 3D points forming two separate groups
rng = np.random.default_rng(42)
X = np.vstack([rng.normal(-4, 0.5, (15, 3)), rng.normal(4, 0.5, (15, 3))])
n = len(X)

# 1. High-dimensional distances, local connectivity rho, and scale sigma
D = np.linalg.norm(X[:, None, :] - X[None, :, :], axis=-1)
np.fill_diagonal(D, np.inf)
rho = np.min(D, axis=1)
sigma = np.mean(np.sort(D, axis=1)[:, :5], axis=1)
np.fill_diagonal(D, 0.0)

# 2. Fuzzy simplicial set: directed affinities and symmetric fuzzy union
P_cond = np.exp(-np.maximum(0.0, D - rho[:, None]) / sigma[:, None])
np.fill_diagonal(P_cond, 0.0)
P = P_cond + P_cond.T - P_cond * P_cond.T

# 3. Optimise low-dimensional coordinates via fuzzy cross-entropy gradient
Y = rng.normal(0, 1.0, (n, 2))
lr, a, b = 0.2, 1.0, 1.0
for _ in range(80):
    dist_sq = np.sum((Y[:, None, :] - Y[None, :, :]) ** 2, axis=-1)
    np.fill_diagonal(dist_sq, np.inf)
    inv = 1.0 / (1.0 + a * (dist_sq ** b))
    np.fill_diagonal(inv, 0.0)
    diff = Y[:, None, :] - Y[None, :, :]
    attract = -2.0 * b * (P * inv)[:, :, None] * diff
    repel = 2.0 * b * ((1.0 - P) * (1.0 - inv) * inv)[:, :, None] * diff
    Y += lr * np.sum(attract + repel, axis=1)

print(f"Cluster 1 centre in 2D: {Y[:15].mean(axis=0).round(2)}")
print(f"Cluster 2 centre in 2D: {Y[15:].mean(axis=0).round(2)}")`,
    pitfalls: [
      r`Hyperparameter sensitivity: The n_neighbours parameter dictates the scale of focus (small values highlight micro-structure, while large values capture global trajectories). The min_dist parameter controls how tightly clustered points pack together.`,
      r`Distances are not linear metrics: While UMAP preserves global relative arrangements substantially better than t-SNE, the Euclidean distance between distant clusters in the embedding cannot be interpreted as a calibrated metric.`,
      r`Stochastic layout variation: Although spectral initialisation provides deterministic macro-positioning, subsequent stochastic gradient descent with negative sampling introduces minor run-to-run variations unless a fixed random seed is set.`,
      r`Non-uniform density assumption: The fundamental premise that data is uniformly distributed on the manifold means UMAP actively normalises away differences in local cluster density.`,
    ],
    keyPoints: [
      r`Preserves both local neighbourhood clustering and global continuum trajectories more effectively than t-SNE.`,
      r`Uses fuzzy simplicial sets and fuzzy cross-entropy, eliminating the $O(n^2)$ partition function normalisation.`,
      r`Spectral graph Laplacian initialisation anchors global layout before stochastic gradient descent refinement.`,
      r`Supports inductive projection: new unseen samples can be embedded into an existing layout using local fuzzy set transforms.`,
    ],
    quiz: [
      {
        q: r`What is the primary purpose of the local connectivity parameter $\rho_i$ in UMAP?`,
        o: [
          r`It sets the learning rate for gradient descent`,
          r`It forces all points to lie on a hypersphere of radius $\rho_i$`,
          r`It ensures that the distance to the nearest neighbour is zero in the local metric, guaranteeing graph connectivity`,
          r`It controls the number of negative samples per edge update`,
        ],
        a: 2,
        why: r`By subtracting $\rho_i = \min_{j \ne i} d(x_i, x_j)$ inside the exponential kernel, the affinity to the immediate nearest neighbour evaluates to $\exp(0) = 1$. This ensures that every point connects to at least one neighbour with 100% fuzzy certainty.`,
      },
      {
        q: r`Why does UMAP's optimisation scale to millions of data points much faster than standard t-SNE?`,
        o: [
          r`UMAP only evaluates every tenth data point`,
          r`UMAP solves a closed-form matrix inversion instead of using iterative gradient descent`,
          r`UMAP computes exact Voronoi diagrams on CPU cores`,
          r`UMAP replaces the global $O(n^2)$ denominator normalisation with edge-wise stochastic gradient descent and negative sampling`,
        ],
        a: 3,
        why: r`t-SNE's denominator $\sum_{k \ne l} (1 + \|y_k - y_l\|^2)^{-1}$ couples all $n^2$ pairs. UMAP's fuzzy cross-entropy optimises individual graph edges with negative sampling, scaling as $O(n \log n)$ or $O(n)$ with approximate nearest neighbours.`,
      },
      {
        q: r`How does UMAP's objective function differ fundamentally from t-SNE's Kullback-Leibler divergence?`,
        o: [
          r`UMAP uses fuzzy cross-entropy, which includes an explicit repulsive term $(1 - p_{ij})\log(1 - q_{ij})$ for non-neighbours`,
          r`UMAP uses mean squared error between pairwise Euclidean distance matrices`,
          r`UMAP minimises the Wasserstein-1 (Earth Mover's) distance between point clouds`,
          r`UMAP has no objective function and relies solely on spectral decomposition`,
        ],
        a: 0,
        why: r`t-SNE's KL divergence only penalises large $p_{ij}$ with small $q_{ij}$. UMAP's fuzzy cross-entropy has two terms: $p_{ij}\log(p_{ij}/q_{ij})$ pulls neighbours together, and $(1 - p_{ij})\log((1 - p_{ij})/(1 - q_{ij}))$ pushes non-connected pairs apart.`,
      },
      {
        q: r`Which hyperparameter in UMAP directly controls how tightly packed embedded points appear within their clusters?`,
        o: [
          r`n_neighbours`,
          r`min_dist`,
          r`metric`,
          r`learning_rate`,
        ],
        a: 1,
        why: r`min_dist specifies the minimum allowable distance between points in the low-dimensional space, fitting the parameters $a$ and $b$ of the low-dimensional kernel. Lower values create densely packed clumps, while higher values preserve broader dispersion.`,
      },
    ],
    usedBy: [],
    prereq: ['pca', 't-sne'],
    related: ['t-sne', 'pca', 'spectral_clustering'],
    keywords: 'umap uniform manifold approximation projection dimensionality reduction fuzzy simplicial sets manifold learning topology sgd',
  },
  {
    id: "svd-and-truncated-svd",
    short: "SVD & truncated SVD",
    title: "Singular Value Decomposition and Truncated SVD",
    task: "concepts",
    module: "Dimensionality reduction",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Decompose any matrix into orthogonal rotation and scaling components: master the Eckart–Young–Mirsky low-rank theorem and Latent Semantic Analysis (LSA).",
    lead: "While eigendecomposition applies only to square matrices, Singular Value Decomposition (SVD) factors any rectangular matrix into orthonormal singular vectors and singular values, providing the optimal low-rank matrix approximation.",
    intuition: [
      "Every rectangular matrix $X \\in \\mathbb{R}^{n \\times p}$ represents a linear transformation mapping vectors from $\\mathbb{R}^p$ to $\\mathbb{R}^n$. Geometrically, any linear transformation maps an origin-centred unit hypersphere into a hyper-ellipsoid. The Singular Value Decomposition (SVD) formalises this geometric reality into three elementary operations: an initial orthogonal rotation in $\\mathbb{R}^p$, an axis-aligned stretching, and a secondary orthogonal rotation in $\\mathbb{R}^n$.",
      "Mathematically, SVD decomposes $X = U \\Sigma V^T$, where $U \\in \\mathbb{R}^{n \\times n}$ contains orthonormal left singular vectors (eigenvectors of $X X^T$), $V \\in \\mathbb{R}^{p \\times p}$ contains orthonormal right singular vectors (eigenvectors of $X^T X$), and $\\Sigma \\in \\mathbb{R}^{n \\times p}$ is a diagonal matrix of non-negative singular values $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge \\sigma_r > 0$ ordered by magnitude.",
      "The foundational power of SVD lies in the Eckart–Young–Mirsky theorem. It proves that keeping only the top $k$ singular values and their corresponding singular vectors—constructing Truncated SVD $X_k = \\sum_{i=1}^k \\sigma_i u_i v_i^T$—yields the mathematically optimal rank-$k$ approximation of $X$ under both the Frobenius norm and spectral norm.",
      "Truncated SVD is ubiquitous across machine learning: in text mining, applying Truncated SVD to sparse term-document matrices constitutes Latent Semantic Analysis (LSA), compressing thousands of vocabulary words into dense semantic concept vectors; in recommendation systems, it underpins matrix factorisation; in signal processing, it denoises data by truncating small noise singular values."
    ],
    analogy: "Imagine a complex orchestral recording featuring 100 instruments playing at once. SVD decomposes the master audio track into distinct, independent sonic layers ordered by volume. The first few singular vectors capture the massive booming rhythm section and lead vocals (the low-rank signal). The tiny 90th to 100th singular vectors capture the faint rustle of sheet music and background air conditioning (the noise). Truncating the matrix keeps the music intact while eliminating the hiss.",
    steps: [
      {
        "title": "1. Formulate rectangular data matrix",
        "body": "Structure matrix $X \\in \\mathbb{R}^{n \\times p}$ (e.g. document-term count matrix, user-item ratings, or sensor channels)."
      },
      {
        "title": "2. Compute SVD factorization",
        "body": "Compute $X = U \\Sigma V^T$. In thin/reduced SVD for $n > p$, $U \\in \\mathbb{R}^{n \\times p}$, $\\Sigma \\in \\mathbb{R}^{p \\times p}$, and $V \\in \\mathbb{R}^{p \\times p}$."
      },
      {
        "title": "3. Truncate to desired rank k",
        "body": "Select rank $k \\ll \\min(n, p)$. Retain the first $k$ columns of $U$ ($U_k$), the top $k \\times k$ block of $\\Sigma$ ($\\Sigma_k$), and the first $k$ columns of $V$ ($V_k$)."
      },
      {
        "title": "4. Project and reconstruct",
        "body": "Obtain low-dimensional sample coordinates: $Z = X V_k = U_k \\Sigma_k$. Reconstruct low-rank approximation: $\\hat{X}_k = U_k \\Sigma_k V_k^T$."
      }
    ],
    math: [
      {
        "h": "Full Singular Value Decomposition",
        "tex": "X = U \\Sigma V^T = \\sum_{i=1}^r \\sigma_i u_i v_i^T, \\quad U^T U = I_n, \\; V^T V = I_p, \\; \\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge 0",
        "p": "Decomposes matrix X into a sum of r rank-1 outer products u_i v_i^T, weighted by descending singular values sigma_i."
      },
      {
        "h": "Eckart–Young–Mirsky Low-Rank Approximation Theorem",
        "tex": "\\min_{\\operatorname{rank}(B) = k} \\|X - B\\|_F = \\|X - X_k\\|_F = \\sqrt{\\sum_{i=k+1}^r \\sigma_i^2}, \\quad X_k = U_k \\Sigma_k V_k^T",
        "p": "Truncated SVD provides the exact best rank-k approximation under Frobenius norm. The minimum achievable reconstruction error equals the square root of discarded singular values squared."
      },
      {
        "h": "Mathematical Equivalence to PCA",
        "tex": "\\operatorname{Cov}(X) = \\frac{1}{n - 1} X_c^T X_c = \\frac{1}{n - 1} V \\Sigma^2 V^T",
        "p": "When data matrix X_c is mean-centred across rows, the right singular vectors V of X_c are identical to the principal component loading vectors of Cov(X), with eigenvalues lambda_i = sigma_i^2 / (n - 1)."
      }
    ],
    code: "import numpy as np\n\n# Truncated SVD and Latent Semantic Analysis (LSA) from scratch\nnp.random.seed(42)\n\n# Synthetic Term-Document Matrix (6 terms x 8 documents)\n# Terms: [algorithm, coding, neural, python, finance, stocks, trading, investment]\nterms = ['neural', 'python', 'algorithm', 'finance', 'stocks', 'trading']\ndocs = [f\"Doc_{i+1}\" for i in range(8)]\n\n# Docs 0-3 are Tech articles; Docs 4-7 are Finance articles\nX = np.array([\n    # D1  D2  D3  D4  D5  D6  D7  D8\n    [ 3,  2,  4,  3,  0,  0,  0,  0],  # neural\n    [ 4,  5,  3,  4,  1,  0,  0,  0],  # python\n    [ 2,  3,  4,  2,  0,  1,  0,  0],  # algorithm\n    [ 0,  0,  0,  1,  4,  5,  3,  4],  # finance\n    [ 0,  0,  0,  0,  5,  4,  5,  3],  # stocks\n    [ 0,  1,  0,  0,  3,  4,  4,  5],  # trading\n], dtype=float)\n\n# 1. Compute Full SVD: X = U Sigma V^T\nU, S, Vt = np.linalg.svd(X, full_matrices=False)\nV = Vt.T\n\n# 2. Truncate to rank k=2 (discovering 2 latent concepts: Tech vs Finance)\nk = 2\nU_k = U[:, :k]\nS_k = np.diag(S[:k])\nV_k = V[:, :k]\n\n# Low-rank reconstruction\nX_reconstructed = U_k @ S_k @ V_k.T\n\n# Frobenius reconstruction error\nerr_actual = np.linalg.norm(X - X_reconstructed, 'fro')\nerr_theoretical = np.sqrt(np.sum(S[k:]**2))\n\n# Document representation in 2D latent concept space\ndoc_coords = V_k @ S_k\n\nprint(f\"Singular values of term-document matrix: {S.round(2)}\")\nprint(f\"Explained variance by top {k} components: {(np.sum(S[:k]**2) / np.sum(S**2))*100:.1f}%\")\nprint(f\"Actual Frobenius Error:      {err_actual:.4f}\")\nprint(f\"Theoretical Eckart-Young Error: {err_theoretical:.4f} (exact match!)\")\n\nprint(\"\\nDocument coordinates in 2D Latent Semantic Space:\")\nfor d_name, coord in zip(docs, doc_coords):\n    category = \"Tech\" if coord[0] > coord[1] else \"Finance\"\n    print(f\"  {d_name}: [{coord[0]:+5.2f}, {coord[1]:+5.2f}] -> Identified as {category}\")",
    keyPoints: [
      "Decomposes any rectangular matrix $X \\in \\mathbb{R}^{n \\times p}$ into orthonormal singular vectors and singular values: $X = U \\Sigma V^T$.",
      "Eckart–Young–Mirsky theorem guarantees that Truncated SVD $X_k = U_k \\Sigma_k V_k^T$ is the optimal rank-$k$ approximation under Frobenius and spectral norms.",
      "Underpins Latent Semantic Analysis (LSA), transforming sparse high-dimensional term-document matrices into dense low-dimensional semantic representations.",
      "Unlike PCA, Truncated SVD does not require centreing data to zero mean, preserving memory sparsity in massive term-document or rating matrices.",
      "Right singular vectors $V$ of mean-centred data correspond exactly to principal component directions in PCA."
    ],
    pitfalls: [
      "Confusing SVD with PCA: PCA requires column-centreing first; running SVD without centreing finds directions of maximum energy from the origin, not maximum variance around the mean.",
      "Negative values in semantic concepts: SVD generates both positive and negative entries, meaning latent components lack strict parts-based physical interpretability; Non-Negative Matrix Factorisation (NMF) solves this.",
      "High memory consumption with dense matrices: Full SVD of an $n \\times p$ matrix requires $O(\\min(n p^2, n^2 p))$ operations; randomized SVD or Lanczos iterations should be used for large matrices."
    ],
    quiz: [
      {
        "q": "What does the Eckart–Young–Mirsky theorem establish regarding Truncated SVD?",
        "o": [
          "Truncating SVD to rank k yields the mathematically optimal rank-k matrix approximation under both Frobenius and spectral norms",
          "SVD singular values must always sum to 1",
          "All rectangular matrices can be diagonalized using real numbers",
          "Truncating SVD guarantees zero reconstruction error"
        ],
        "a": 0,
        "why": "The Eckart-Young-Mirsky theorem is the bedrock result proving that X_k = U_k Sigma_k V_k^T minimises ||X - B||_F over all matrices B with rank <= k."
      },
      {
        "q": "Why is Truncated SVD preferred over standard PCA for high-dimensional sparse text data (e.g. TF-IDF matrices)?",
        "o": [
          "centreing the matrix for PCA destroys sparsity (turning zeros into non-zeros), exhausting RAM, whereas Truncated SVD operates directly on sparse matrices",
          "Truncated SVD cannot be computed on dense matrices",
          "PCA only works on images, not text",
          "Truncated SVD requires no matrix multiplications"
        ],
        "a": 0,
        "why": "Column-centreing in PCA subtracts the mean, converting a 99% sparse matrix into a 100% dense matrix that instantly blows up RAM. Truncated SVD operates directly on sparse formats."
      }
    ],
    usedBy: [],
    prereq: [
      "expectation-variance-and-covariance"
    ],
    related: [
      "ols-inference-t-tests-f-test-r2-and-adjusted-r2",
      "biclustering",
      "kernel-pca",
      "pls-and-principal-component-regression"
    ],
    keywords: "svd, singular value decomposition, truncated svd, eckart young mirsky, low rank approximation, latent semantic analysis, lsa, matrix factorisation"
  },
  {
    id: "kernel-pca",
    short: "Kernel PCA",
    title: "Kernel Principal Component Analysis",
    task: "concepts",
    module: "Dimensionality reduction",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Unfold non-linear manifolds by performing PCA in reproducing kernel Hilbert spaces: master the kernel trick, double centring, and pre-image challenges.",
    lead: "Linear PCA projects data onto straight hyperplanes, failing when data lies on concentric spheres, Swiss rolls, or curved manifolds. Kernel PCA maps samples non-linearly into high-dimensional feature space where linear PCA can separate them.",
    intuition: [
      "Principal Component Analysis (PCA) is inherently linear: it discovers orthogonal straight lines and flat hyperplanes that capture maximum variance. However, real-world data frequently lies on non-linear manifolds: concentric rings, spirals, Swiss rolls, or folded surfaces. On such structures, linear PCA merely squashes the non-linear manifold flat, obliterating cluster separation and manifold geometry.",
      "Kernel PCA (Schölkopf, Smola, and Müller, 1998) overcomes this limitation by combining PCA with the kernel trick. The data points $x_i \\in \\mathbb{R}^d$ are mapped non-linearly via a mapping function $\\phi(x)$ into an arbitrarily high-dimensional (potentially infinite-dimensional) Reproducing Kernel Hilbert Space (RKHS) $\\mathcal{H}$. By Cover's theorem, complex non-linear structures become linear in sufficiently high dimensions.",
      "Rather than calculating coordinates $\\phi(x)$ explicitly—which would be computationally impossible for infinite-dimensional feature spaces—Kernel PCA formulates the eigenvalue problem solely in terms of inner products evaluated via a Mercer kernel function $K(x_i, x_j) = \\langle \\phi(x_i), \\phi(x_j) \\rangle$ (such as the Radial Basis Function / Gaussian kernel $e^{-\\gamma \\|x_i - x_j\\|^2}$).",
      "Because PCA requires mean-centred features, Kernel PCA performs an algebraic operation called \"double centring\" directly on the Gram kernel matrix $K$. Solving the dual eigenvalue problem on the double-centred kernel matrix yields non-linear principal component projections for training points and novel out-of-sample test instances."
    ],
    analogy: "Imagine two concentric rings of iron filings sitting on a flat wooden tabletop: an inner circular ring surrounded by an outer ring. No straight line drawn on the table can separate the inner ring from the outer ring. Now place a strong magnet beneath the centre of the table. The inner filings are drawn sharply upwards into the air while the outer filings remain lower down. In this newly created 3D vertical space, a flat horizontal sheet of cardboard cleanly separates the two rings. Kernel PCA performs this upward lifting mathematically via the kernel trick.",
    steps: [
      {
        "title": "1. Select kernel function and compute Gram matrix",
        "body": "Choose a valid Mercer kernel (e.g. Gaussian RBF $K(x, x') = \\exp(-\\gamma \\|x - x'\\|^2)$). Compute $n \\times n$ Gram matrix $K_{ij} = K(x_i, x_j)$."
      },
      {
        "title": "2. Perform kernel double centring",
        "body": "Because feature vectors $\\phi(x)$ must be mean-centred in $\\mathcal{H}$, compute double-centred kernel matrix: $\\tilde{K} = K - \\mathbf{1}_n K - K \\mathbf{1}_n + \\mathbf{1}_n K \\mathbf{1}_n$, where $\\mathbf{1}_n$ has all entries equal to $1/n$."
      },
      {
        "title": "3. Solve dual eigenvalue problem",
        "body": "Solve $\\tilde{K} \\alpha_k = \\lambda_k \\alpha_k$. Normalise eigenvectors such that $\\lambda_k \\|\\alpha_k\\|^2 = 1$."
      },
      {
        "title": "4. Project novel test points",
        "body": "Project arbitrary sample $x$ onto $k$-th non-linear principal component: $y_k(x) = \\sum_{i=1}^n \\alpha_{ki} \\tilde{K}(x_i, x)$."
      }
    ],
    math: [
      {
        "h": "Dual Kernel PCA Eigenvalue Problem",
        "tex": "\\tilde{K} \\alpha_k = \\lambda_k \\alpha_k, \\quad \\text{subject to } \\lambda_k (\\alpha_k^T \\alpha_k) = 1",
        "p": "The primal PCA problem in feature space H translates into an n x n dual eigenvalue problem on the Gram matrix K, eliminating dependence on feature dimension."
      },
      {
        "h": "Gram Matrix Double Centring",
        "tex": "\\tilde{K} = K - \\frac{1}{n} J K - \\frac{1}{n} K J + \\frac{1}{n^2} J K J, \\quad J = \\mathbf{1}_n \\mathbf{1}_n^T",
        "p": "Ensures that implicit feature mappings phi(x) have zero mean in Hilbert space without ever computing phi(x) explicitly."
      },
      {
        "h": "Out-of-Sample Non-Linear Projection",
        "tex": "y_k(x) = \\langle v_k, \\phi(x) \\rangle = \\sum_{i=1}^n \\alpha_{ki} \\tilde{K}(x_i, x)",
        "p": "Projects novel input x onto the k-th non-linear principal component eigenvector v_k via linear combination of kernel evaluations."
      }
    ],
    code: "import numpy as np\n\n# Kernel PCA with Radial Basis Function (RBF) Kernel from scratch\nclass KernelPCA:\n    def __init__(self, n_components=2, gamma=1.0):\n        self.n_components = n_components\n        self.gamma = gamma\n        self.alphas = None\n        self.lambdas = None\n        self.X_fit = None\n        self.K_fit = None\n        \n    def _rbf_kernel(self, X1, X2):\n        # Pairwise squared Euclidean distance\n        dists_sq = np.sum(X1**2, axis=1)[:, None] + np.sum(X2**2, axis=1)[None, :] - 2 * (X1 @ X2.T)\n        return np.exp(-self.gamma * np.maximum(dists_sq, 0))\n        \n    def fit_transform(self, X):\n        self.X_fit = X\n        n = X.shape[0]\n        \n        # 1. Compute Gram Matrix\n        K = self._rbf_kernel(X, X)\n        self.K_fit = K\n        \n        # 2. Kernel Double Centring\n        one_n = np.ones((n, n)) / n\n        K_tilde = K - one_n @ K - K @ one_n + one_n @ K @ one_n\n        \n        # 3. Eigenvalue Decomposition\n        eigenvals, eigenvecs = np.linalg.eigh(K_tilde)\n        \n        # Sort eigenvalues in descending order\n        idx = np.argsort(eigenvals)[::-1]\n        eigenvals = eigenvals[idx]\n        eigenvecs = eigenvecs[:, idx]\n        \n        # Select top k components\n        top_evals = eigenvals[:self.n_components]\n        top_evecs = eigenvecs[:, :self.n_components]\n        \n        # Normalise eigenvectors: lambda_k * ||alpha_k||^2 = 1\n        for k in range(self.n_components):\n            if top_evals[k] > 1e-10:\n                top_evecs[:, k] /= np.sqrt(top_evals[k])\n                \n        self.alphas = top_evecs\n        self.lambdas = top_evals\n        \n        # Projected training coordinates\n        return K_tilde @ self.alphas\n\n# Generate non-linearly separable concentric circles\nnp.random.seed(42)\nn_per_ring = 100\n\n# Inner circle\nr_inner = np.random.normal(1.0, 0.1, n_per_ring)\ntheta_inner = np.random.uniform(0, 2 * np.pi, n_per_ring)\nX_inner = np.column_stack([r_inner * np.cos(theta_inner), r_inner * np.sin(theta_inner)])\n\n# Outer circle\nr_outer = np.random.normal(3.0, 0.1, n_per_ring)\ntheta_outer = np.random.uniform(0, 2 * np.pi, n_per_ring)\nX_outer = np.column_stack([r_outer * np.cos(theta_outer), r_outer * np.sin(theta_outer)])\n\nX = np.vstack([X_inner, X_outer])\ny = np.array([0]*n_per_ring + [1]*n_per_ring)\n\n# Fit Kernel PCA with gamma=0.5\nkpca = KernelPCA(n_components=2, gamma=0.5)\nX_kpca = kpca.fit_transform(X)\n\n# Evaluate linear separability along the 1st principal component\npc1 = X_kpca[:, 0]\n# Find optimal split threshold\nthresholds = np.linspace(np.min(pc1), np.max(pc1), 100)\nbest_acc = max(np.mean((pc1 > t) == y) for t in thresholds)\n\nprint(f\"Dataset: Concentric Circles ({X.shape[0]} samples)\")\nprint(f\"Top 2 Kernel PCA eigenvalues: {kpca.lambdas[:2].round(3)}\")\nprint(f\"Linear separability on 1st Kernel PC: {best_acc * 100:.1f}% (100% cleanly separated!)\")",
    keyPoints: [
      "Unfolds complex non-linear manifolds by projecting data into a high-dimensional Hilbert space where linear PCA applies.",
      "Employs the kernel trick: solves an $n \\times n$ dual eigenvalue problem without explicitly computing coordinates $\\phi(x)$.",
      "Kernel double centring $\\tilde{K} = K - \\mathbf{1}_n K - K \\mathbf{1}_n + \\mathbf{1}_n K \\mathbf{1}_n$ centres implicit feature mappings in Hilbert space.",
      "Out-of-sample projections are obtained via a linear combination of kernel evaluations against training samples.",
      "Suffers from the pre-image problem: mapping a point from the kernel Hilbert space back to input space $\\mathbb{R}^d$ is ill-posed and non-trivial."
    ],
    pitfalls: [
      "Hyperparameter sensitivity: Performance depends heavily on the kernel parameter (e.g. $\\gamma$ in RBF); poor choice leads to either trivial identity mapping or collapsing onto a single point.",
      "Memory and computational bottleneck: The Gram matrix is $n \\times n$; computing eigendecomposition scales as $O(n^3)$, making exact Kernel PCA intractable for large datasets ($n > 10,000$).",
      "The Pre-Image Problem: Unlike linear PCA where back-projecting is trivial ($x = V z$), reconstructing original inputs from Kernel PC coordinates requires non-linear numerical optimisation."
    ],
    quiz: [
      {
        "q": "Why does standard linear PCA fail on concentric circular datasets while Kernel PCA succeeds?",
        "o": [
          "Linear PCA only finds orthogonal straight lines, squashing both rings together, while Kernel PCA maps rings into a Hilbert space where they separate linearly",
          "Linear PCA requires that sample size n is smaller than feature count p",
          "Kernel PCA requires labels while linear PCA is unsupervised",
          "Linear PCA can only handle datasets with fewer than 50 samples"
        ],
        "a": 0,
        "why": "Linear PCA is restricted to linear coordinate rotations. Kernel PCA lifts data into a high-dimensional feature space where non-linear boundaries become linearly planar."
      },
      {
        "q": "What is the \"pre-image problem\" in Kernel PCA?",
        "o": [
          "Reconstructing an original input vector x from its low-dimensional Kernel PC projection is non-trivial because the inverse mapping from Hilbert space does not generally exist in closed form",
          "Initialising the Gram matrix takes too much time",
          "Finding the eigenvalues of a symmetric matrix produces complex numbers",
          "Kernel PCA cannot project out-of-sample test points"
        ],
        "a": 0,
        "why": "In linear PCA, reconstruction is x_hat = V_k z. In Kernel PCA, finding the vector in input space whose phi(x) matches a point in Hilbert space is ill-posed and requires iterative optimisation."
      }
    ],
    usedBy: [],
    prereq: [
      "expectation-variance-and-covariance",
      "svd-and-truncated-svd"
    ],
    related: [
      "svd-and-truncated-svd",
      "biclustering",
      "support_vector_classifier",
      "pls-and-principal-component-regression"
    ],
    keywords: "kernel pca, principal component analysis, non linear dimensionality reduction, rbf kernel, kernel trick, gram matrix, double centring, pre image problem"
  },
  {
    id: "independent-component-analysis",
    short: "ICA",
    title: "Independent Component Analysis",
    task: "concepts",
    module: "Dimensionality reduction",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Separate linear mixtures into statistically independent non-Gaussian sources: master the cocktail party problem, FastICA, negentropy, and kurtosis.",
    lead: "While PCA seeks orthogonal axes of maximal variance, Independent Component Analysis (ICA) searches for directions that are statistically independent by maximising non-Gaussianity.",
    intuition: [
      "The quintessential motivation for Independent Component Analysis (ICA) is the \"cocktail party problem\": several people speak simultaneously in a room, and multiple microphones record mixed acoustic signals. Each microphone captures a distinct linear superposition of the speakers voices. Given only the recorded mixtures without knowledge of the speakers locations or room acoustics, can we recover the original isolated vocal tracks? This challenge is known as Blind Source Separation (BSS).",
      "Principal Component Analysis (PCA) fails on this problem. PCA enforces orthogonality and seeks directions of maximum variance. However, uncorrelatedness is purely a second-order linear relationship: two variables can be completely uncorrelated yet strongly dependent. ICA demands statistical independence: the joint probability distribution must factorise into the product of marginals, $p(s_1, \\dots, s_m) = \\prod_{i=1}^m p_i(s_i)$.",
      "The algorithmic key to ICA is the Central Limit Theorem (CLT). According to the CLT, the sum of independent random variables tends toward a Gaussian distribution: any linear mixture of non-Gaussian source signals will be more Gaussian than the original individual sources. Therefore, to untangle the mixture and isolate the pure sources, we must search for unmixing vectors that maximise the non-Gaussianity of the recovered signals.",
      "Aapo Hyvärinen developed the FastICA algorithm, an efficient fixed-point iteration scheme that measures non-Gaussianity via negentropy (the entropy difference between a distribution and a Gaussian with identical covariance). FastICA whitens data via PCA, then uses fixed-point updates to extract statistically independent components."
    ],
    analogy: "Imagine blending a banana smoothie containing strawberries, blueberries, and bananas. A standard kitchen blender homogenises everything into a uniform purplish paste (the Gaussian mixture). PCA merely tells you the total volume and density of the paste. ICA is like a magical reverse centrifuge that examines the subtle non-uniform textures (non-Gaussianity), unmixing the smoothie back into discrete piles of whole strawberries, blueberries, and bananas.",
    steps: [
      {
        "title": "1. Mean-centre and whiten the observed data",
        "body": "Centre observations to zero mean: $x \\leftarrow x - \\mathbb{E}[x]$. Whiten data using eigenvalue decomposition of covariance $\\Sigma = E D E^T$, setting $\\tilde{x} = E D^{-1/2} E^T x$ such that $\\mathbb{E}[\\tilde{x} \\tilde{x}^T] = I$."
      },
      {
        "title": "2. Select contrast function for non-Gaussianity",
        "body": "Choose a non-quadratic contrast function $G(u)$ approximating negentropy (such as $G(u) = \\frac{1}{a} \\log \\cosh(a u)$ or $G(u) = -\\exp(-u^2 / 2)$), which are robust to outliers."
      },
      {
        "title": "3. Execute FastICA fixed-point iteration",
        "body": "For unmixing weight vector $w$, iterate: $w^+ = \\mathbb{E}[\\tilde{x} g(w^T \\tilde{x})] - \\mathbb{E}[g'(w^T \\tilde{x})] w$, where $g(u) = G'(u)$. Normalise $w \\leftarrow w^+ / \\|w^+\\|_2$."
      },
      {
        "title": "4. Decorrelate vectors and recover sources",
        "body": "Symmetrically or sequentially orthogonalise weight vectors (e.g. via Gram–Schmidt or $W \\leftarrow (W W^T)^{-1/2} W$) to prevent convergence to identical components. Reconstruct independent sources: $\\hat{s} = W \\tilde{x}$."
      }
    ],
    math: [
      {
        "h": "Linear Mixture and Unmixing Model",
        "tex": "x = A s = \\sum_{i=1}^m a_i s_i, \\quad \\hat{s} = W x = W A s",
        "p": "Observed signals x are formed by unknown mixing matrix A multiplying independent sources s. The objective is finding unmixing matrix W such that WA approximates a permutation and scaling matrix."
      },
      {
        "h": "Negentropy Measure of Non-Gaussianity",
        "tex": "J(y) = H(y_{\\mathrm{gauss}}) - H(y) \\approx k_1 [\\mathbb{E}\\{G_1(y)\\}]^2 + k_2 [\\mathbb{E}\\{G_2(y)\\} - \\mathbb{E}\\{G_2(\\nu)\\}]^2",
        "p": "Gaussian distributions have maximal entropy among all distributions with identical variance. Negentropy J(y) is strictly non-negative and zero if and only if y is Gaussian; maximising negentropy isolates independent components."
      },
      {
        "h": "FastICA Fixed-Point Update Rule",
        "tex": "w^+ = \\mathbb{E}[x g(w^T x)] - \\mathbb{E}[g'(w^T x)] w, \\quad w \\leftarrow \\frac{w^+}{\\|w^+\\|}",
        "p": "Fixed-point iteration derived from Newton-Raphson optimisation on Kuhn-Tucker conditions under constraint ||w|| = 1. Converges with cubic speed."
      }
    ],
    code: "import numpy as np\n\n# FastICA from scratch for Blind Source Separation\nnp.random.seed(42)\nn_samples = 2000\ntime = np.linspace(0, 8, n_samples)\n\n# 1. Generate two non-Gaussian independent sources\n# Source 1: Sinusoidal signal\ns1 = np.sin(2 * time)\n# Source 2: Square wave signal\ns2 = np.sign(np.sin(3 * time))\nS = np.column_stack([s1, s2])\n\n# 2. Mix sources with an arbitrary mixing matrix A\nA = np.array([[1.0, 1.5],\n              [0.8, -0.6]])\nX = S @ A.T  # Mixed observed signals\n\n# 3. FastICA Implementation\ndef fast_ica(X, n_components=2, max_iters=200, tol=1e-6):\n    n, p = X.shape\n    # Step A: Mean-centreing\n    X_mean = np.mean(X, axis=0)\n    X_centreed = X - X_mean\n    \n    # Step B: Whitening via SVD\n    cov = (X_centreed.T @ X_centreed) / n\n    U, D, _ = np.linalg.svd(cov)\n    whitening_matrix = U @ np.diag(1.0 / np.sqrt(D)) @ U.T\n    X_white = X_centreed @ whitening_matrix.T\n    \n    # Contrast function g(u) = tanh(u), g'(u) = 1 - tanh^2(u)\n    def g(u): return np.tanh(u)\n    def g_prime(u): return 1.0 - np.tanh(u)**2\n    \n    # Step C: Fixed-point iteration with Gram-Schmidt orthogonalisation\n    W = np.zeros((n_components, n_components))\n    \n    for i in range(n_components):\n        w = np.random.normal(size=n_components)\n        w /= np.linalg.norm(w)\n        \n        for it in range(max_iters):\n            # w+ = E[x * g(w^T x)] - E[g'(w^T x)] * w\n            wx = X_white @ w\n            w_new = np.mean(X_white * g(wx)[:, None], axis=0) - np.mean(g_prime(wx)) * w\n            \n            # Orthogonalise against previously found vectors\n            for j in range(i):\n                w_new -= (w_new @ W[j]) * W[j]\n            w_new /= np.linalg.norm(w_new)\n            \n            # Check convergence\n            if np.abs(np.abs(w_new @ w) - 1.0) < tol:\n                w = w_new\n                break\n            w = w_new\n            \n        W[i] = w\n        \n    # Reconstructed independent components\n    S_hat = X_white @ W.T\n    return S_hat, W\n\nS_recovered, W_est = fast_ica(X, n_components=2)\n\n# Normalise recovered signals to unit variance for correlation check\nS_norm = (S - np.mean(S, axis=0)) / np.std(S, axis=0)\nS_rec_norm = (S_recovered - np.mean(S_recovered, axis=0)) / np.std(S_recovered, axis=0)\n\n# Check correlation matrix between original and recovered\ncorr = np.abs(S_norm.T @ S_rec_norm) / len(S)\n\nprint(f\"Mixing Matrix A:\\n{A}\")\nprint(f\"\\nCorrelation between original and recovered sources:\")\nprint(f\"Source 1 max correlation: {np.max(corr[0]):.4f}\")\nprint(f\"Source 2 max correlation: {np.max(corr[1]):.4f} (clean separation!)\")",
    keyPoints: [
      "Decomposes linear mixtures of signals into statistically independent, non-Gaussian components.",
      "Exploits the Central Limit Theorem: mixtures are always more Gaussian than independent sources; maximising non-Gaussianity unmixes them.",
      "Requires that at most one source distribution is Gaussian (multiple Gaussian sources cannot be separated due to rotational symmetry).",
      "FastICA uses a fixed-point iteration derived from negentropy approximations, converging with cubic speed.",
      "Possesses intrinsic ambiguities: source variance (scaling) and component ordering cannot be uniquely determined from observed mixtures alone."
    ],
    pitfalls: [
      "Gaussian source limitation: If two or more independent sources are Gaussian, their joint distribution is spherically symmetric, making rotation indeterminate.",
      "Scale and sign ambiguity: The magnitude and sign of recovered sources are unidentifiable ($(-a) \\cdot (-s) = a s$); recovered signals must be standardised.",
      "Permutation ambiguity: ICA cannot infer the original ordering of sources; component 1 might correspond to source 2 or source 5."
    ],
    quiz: [
      {
        "q": "Why does Independent Component Analysis require that source distributions are non-Gaussian?",
        "o": [
          "Because the joint distribution of multiple Gaussian sources is spherically symmetric, making any orthogonal rotation equally valid and unidentifiable",
          "Because Gaussian distributions cannot be differentiated",
          "Because the Central Limit Theorem only applies to non-Gaussian variables",
          "Because Gaussian random variables cannot be multiplied by matrices"
        ],
        "a": 0,
        "why": "A multivariate Gaussian with identity covariance is spherically symmetric: rotating it yields an identical Gaussian. Without non-Gaussianity, independent directions cannot be distinguished."
      },
      {
        "q": "What is the relationship between uncorrelatedness and statistical independence in the context of PCA and ICA?",
        "o": [
          "Independence implies uncorrelatedness (zero covariance), but uncorrelatedness does not imply independence for non-Gaussian variables",
          "Uncorrelatedness and independence are mathematically identical in all cases",
          "PCA guarantees independence while ICA only guarantees uncorrelatedness",
          "Uncorrelated variables always have zero mutual information"
        ],
        "a": 0,
        "why": "Uncorrelatedness only means E[XY] = E[X]E[Y] (second-order orthogonality). Statistical independence requires p(X, Y) = p(X)p(Y) across all higher-order moments."
      }
    ],
    usedBy: [],
    prereq: [
      "expectation-variance-and-covariance",
      "svd-and-truncated-svd"
    ],
    related: [
      "svd-and-truncated-svd",
      "kernel-pca",
      "non-negative-matrix-factorisation",
      "mutual-information"
    ],
    keywords: "ica, independent component analysis, fastica, cocktail party problem, blind source separation, negentropy, non-gaussianity, central limit theorem"
  },
  {
    id: "non-negative-matrix-factorisation",
    short: "NMF",
    title: "Non-Negative Matrix Factorisation",
    task: "concepts",
    module: "Dimensionality reduction",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Decompose non-negative data into additive, parts-based representations: master multiplicative update rules, Lee & Seung convergence, and topic modelling.",
    lead: "PCA and SVD allow negative values, producing components that cancel each other out destructively. Non-Negative Matrix Factorisation (NMF) constrains factors to strictly non-negative values, yielding intuitive additive parts-based representations.",
    intuition: [
      "In countless machine learning domains, the quantities being analysed are physically non-negative: pixel brightness in facial imagery, word occurrence counts in documents, power spectral densities in audio spectrograms, or customer purchase counts. However, classical linear methods like PCA, SVD, and ICA compute basis components that contain negative values.",
      "When SVD reconstructs a facial image, it starts with an average \"eigenface\" and adds or subtracts strange ghostly basis patterns. These complex destructive cancellations lack human perceptual meaning: human brains recognise faces as additive combinations of parts (eyes, nose, mouth).",
      "Non-Negative Matrix Factorisation (NMF), popularised by Daniel Lee and H. Sebastian Seung in 1999, enforces strict non-negativity on both factor matrices: $V \\approx W H$, where $V \\in \\mathbb{R}_+^{n \\times p}$, $W \\in \\mathbb{R}_+^{n \\times k}$, and $H \\in \\mathbb{R}_+^{k \\times p}$.",
      "Because subtraction is mathematically forbidden, the columns of $W$ represent additive basis elements (parts or topics), while the columns of $H$ represent non-negative activation encodings. The resulting decomposition is sparse, highly interpretable, and naturally extracts meaningful parts-based representations without requiring explicit sparsity penalties."
    ],
    analogy: "Imagine painting a landscape with an artist palette. SVD is like an anti-matter paintbrush that can paint both opaque paint and \"negative anti-paint\" that deletes colour beneath it. NMF operates like real physical paint: you can only add pigment onto the canvas, never subtract. To render a face with NMF, you must layer a nose onto a face shape, then layer eyes and a mouth. Every component corresponds to a real, tangible physical part.",
    steps: [
      {
        "title": "1. Formulate non-negative data matrix",
        "body": "Structure input matrix $V \\in \\mathbb{R}_+^{n \\times p}$ such that all entries $V_{ij} \\ge 0$. Choose rank $k \\ll \\min(n, p)$."
      },
      {
        "title": "2. Initialise factor matrices W and H",
        "body": "Initialise $W \\in \\mathbb{R}_+^{n \\times k}$ and $H \\in \\mathbb{R}_+^{k \\times p}$ with positive random numbers or Non-negative Double SVD (NNDSVD)."
      },
      {
        "title": "3. Execute Lee–Seung multiplicative updates",
        "body": "Iterate multiplicative updates: $H \\leftarrow H \\odot \\frac{W^T V}{W^T W H}$ and $W \\leftarrow W \\odot \\frac{V H^T}{W H H^T}$, where division and multiplication are element-wise."
      },
      {
        "title": "4. Monitor convergence and inspect latent topics",
        "body": "Track Frobenius loss $\\|V - W H\\|_F^2$ or generalised KL divergence $D_{\\mathrm{KL}}(V \\parallel WH)$. Normalise columns of $W$ to inspect latent parts or topic vocabulary distributions."
      }
    ],
    math: [
      {
        "h": "Frobenius Matrix Factorisation Objective",
        "tex": "\\min_{W \\ge 0, \\; H \\ge 0} \\frac{1}{2} \\|V - W H\\|_F^2 = \\frac{1}{2} \\sum_{i=1}^n \\sum_{j=1}^p \\left(V_{ij} - (WH)_{ij}\\right)^2",
        "p": "Constrained optimisation problem. While non-convex jointly in (W, H), the objective is convex in W with fixed H, and convex in H with fixed W."
      },
      {
        "h": "Lee–Seung Multiplicative Update Rules",
        "tex": "H_{kj} \\leftarrow H_{kj} \\frac{(W^T V)_{kj}}{(W^T W H)_{kj}}, \\quad W_{ik} \\leftarrow W_{ik} \\frac{(V H^T)_{ik}}{(W H H^T)_{ik}}",
        "p": "Multiplicative scaling factor: when numerator equals denominator, the gradient is zero and the update reaches a stationary point. Guaranteed to preserve non-negativity automatically."
      },
      {
        "h": "Generalised Kullback–Leibler NMF Divergence",
        "tex": "D_{\\mathrm{KL}}(V \\parallel W H) = \\sum_{i, j} \\left( V_{ij} \\log \\frac{V_{ij}}{(WH)_{ij}} - V_{ij} + (WH)_{ij} \\right)",
        "p": "Alternative divergence used for count and audio spectrogram matrices, equivalent to maximum likelihood under Poisson noise assumptions."
      }
    ],
    code: "import numpy as np\n\n# Non-Negative Matrix Factorisation (NMF) from scratch via Lee & Seung Multiplicative Updates\ndef nmf_lee_seung(V, k, max_iters=200, tol=1e-5):\n    n, p = V.shape\n    # Initialise W and H with positive random values\n    np.random.seed(42)\n    W = np.random.uniform(0.1, 1.0, (n, k))\n    H = np.random.uniform(0.1, 1.0, (k, p))\n    eps = 1e-12\n    \n    loss_history = []\n    \n    for it in range(max_iters):\n        # 1. Update H: H <- H * (W^T V) / (W^T W H + eps)\n        numerator_H = W.T @ V\n        denominator_H = (W.T @ W) @ H + eps\n        H *= (numerator_H / denominator_H)\n        \n        # 2. Update W: W <- W * (V H^T) / (W H H^T + eps)\n        numerator_W = V @ H.T\n        denominator_W = W @ (H @ H.T) + eps\n        W *= (numerator_W / denominator_W)\n        \n        # Compute Frobenius reconstruction loss\n        loss = 0.5 * np.sum((V - W @ H)**2)\n        loss_history.append(loss)\n        \n        if it > 0 and abs(loss_history[-2] - loss) < tol:\n            break\n            \n    return W, H, loss_history\n\n# Synthetic Document-Topic Matrix (8 documents x 6 terms)\n# 3 documents about Machine Learning, 3 about Gardening, 2 about Cooking\nterms = ['gradient', 'neural', 'trees', 'soil', 'flowers', 'recipe']\nV = np.array([\n    # ML terms       Gardening terms   Cooking\n    [ 5,  4,  1,     0,  0,  0],  # Doc 1: ML\n    [ 4,  5,  0,     0,  0,  0],  # Doc 2: ML\n    [ 6,  4,  2,     0,  0,  1],  # Doc 3: ML\n    [ 0,  0,  4,     5,  4,  0],  # Doc 4: Gardening\n    [ 0,  0,  3,     4,  5,  0],  # Doc 5: Gardening\n    [ 0,  0,  5,     3,  4,  1],  # Doc 6: Gardening\n    [ 0,  0,  0,     1,  0,  5],  # Doc 7: Cooking\n    [ 0,  1,  0,     0,  1,  6],  # Doc 8: Cooking\n], dtype=float)\n\n# Fit NMF with k=3 topics\nk = 3\nW, H, losses = nmf_lee_seung(V, k=k, max_iters=250)\n\nprint(f\"Data Matrix V shape: {V.shape}\")\nprint(f\"Discovered Basis Matrix W (Docs x Topics): {W.shape}\")\nprint(f\"Discovered Component Matrix H (Topics x Terms): {H.shape}\")\nprint(f\"Initial Loss: {losses[0]:.2f} -> Final Loss: {losses[-1]:.2f}\")\nprint(\"All values non-negative:\", np.all(W >= 0) and np.all(H >= 0))\n\nprint(\"\\nDiscovered Topics (Top Terms in H):\")\nfor t_idx in range(k):\n    top_term_indices = np.argsort(H[t_idx])[::-1]\n    top_words = [f\"{terms[i]} ({H[t_idx, i]:.2f})\" for i in top_term_indices[:3]]\n    print(f\"  Topic {t_idx+1}: {', '.join(top_words)}\")",
    keyPoints: [
      "Factorises non-negative matrix $V \\approx W H$ with strictly non-negative factor matrices ($W, H \\ge 0$).",
      "Disallows destructive subtraction, yielding interpretable additive parts-based representations.",
      "Lee–Seung multiplicative update rules ensure non-negativity automatically without Lagrange multiplier projections.",
      "Naturally induces sparsity: many entries in $W$ and $H$ converge strictly to zero without $L_1$ penalties.",
      "Widely used in topic modelling, gene expression clustering, recommender systems, and audio source separation."
    ],
    pitfalls: [
      "Non-convexity and local minima: The joint objective is non-convex in $(W, H)$; different random initialisations converge to different local optima.",
      "Non-uniqueness of factorisation: If an invertible matrix $B$ exists such that $W B \\ge 0$ and $B^{-1} H \\ge 0$, then $(W B)(B^{-1} H) = W H$ is an alternative valid factorisation.",
      "Strict non-negativity requirement: Cannot process inputs containing negative values; features must be strictly non-negative."
    ],
    quiz: [
      {
        "q": "Why does Non-Negative Matrix Factorisation produce more interpretable parts-based representations than SVD/PCA on facial images?",
        "o": [
          "Because non-negativity forbids negative values, so components can only combine additively rather than cancelling each other out",
          "Because NMF is a supervised algorithm that uses facial landmark labels",
          "Because NMF computes exact orthogonal eigenvectors",
          "Because NMF always converges to a global minimum in one step"
        ],
        "a": 0,
        "why": "In SVD, components contain negative values that subtract features destructively. In NMF, all factors are non-negative, forcing parts to combine purely additively."
      },
      {
        "q": "How do the Lee–Seung multiplicative updates preserve non-negativity during optimisation?",
        "o": [
          "The update factor is a ratio of positive quantities, so multiplying an existing positive value by this ratio guarantees the result remains positive",
          "They project negative values to zero after each gradient step",
          "They take the absolute value of all matrices at each iteration",
          "They add a large positive constant to the matrix"
        ],
        "a": 0,
        "why": "Because V, W, and H are initialised with positive numbers, all matrix products in the numerator and denominator are positive. Multiplying a positive entry by a positive ratio can never produce a negative number."
      }
    ],
    usedBy: [],
    prereq: [
      "svd-and-truncated-svd"
    ],
    related: [
      "svd-and-truncated-svd",
      "biclustering",
      "independent-component-analysis",
      "biclustering"
    ],
    keywords: "nmf, non negative matrix factorisation, lee seung, multiplicative updates, topic modelling, parts based representation, frobenius loss"
  },
  {
    id: "mds-and-isomap",
    short: "MDS & Isomap",
    title: "Multidimensional Scaling and Isomap",
    task: "concepts",
    module: "Dimensionality reduction",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Preserve pairwise distances and uncover non-linear manifold geometry: compare Classical MDS with shortest-path geodesic distance in Isomap.",
    lead: "When high-dimensional data lives on a curved manifold, Euclidean straight-line distance cuts through empty space. Isomap uses a k-nearest-neighbour graph and Dijkstra shortest paths to estimate true geodesic distances along the manifold, embedding them via Classical MDS.",
    intuition: [
      "How can you construct a map of European cities if you only possess a table of driving distances between them, with zero knowledge of their GPS coordinates? This is the domain of Multidimensional Scaling (MDS): given an $n \\times n$ matrix of pairwise dissimilarities $D$, find a configuration of points in low-dimensional space $\\mathbb{R}^d$ (typically $d=2$) whose Euclidean distances match the input dissimilarities as closely as possible.",
      "Classical MDS (Principal Coordinate Analysis, PCoA) solves this in closed form: it squares the distances, performs double centring to construct an inner product Gram matrix $B = -\\frac{1}{2} H D^2 H$, and extracts coordinates via eigendecomposition. If the input dissimilarities are exact Euclidean distances, Classical MDS is mathematically identical to PCA.",
      "However, when data lies on a complex non-linear manifold (such as the famous \"Swiss roll\" or \"S-curve\"), Euclidean distance measured through ambient high-dimensional space is deceptive: two points on adjacent layers of the rolled spiral have a tiny straight-line distance through empty air, but are far apart along the surface of the manifold.",
      "Isomap (Isometric Feature Mapping, Tenenbaum et al., 2000) resolves this by replacing straight-line Euclidean distance with true geodesic distance (distance along the manifold surface). It builds a $k$-nearest neighbour graph connecting local adjacent points, computes all-pairs shortest paths through the graph via Dijkstra or Floyd–Warshall to estimate geodesic distances, and applies Classical MDS to embed the unrolled manifold into 2D."
    ],
    analogy: "Imagine a rolled-up silk carpet with two ants standing on it: Ant A on the outer layer, Ant B directly beneath it on the inner layer. A straight ruler piercing through the fabric says they are 5 millimetres apart (Euclidean distance). But to actually walk to each other without biting through the silk, Ant A must crawl 3 metres around the spiral (geodesic distance). Isomap measures the crawl distance along the fabric, then unrolls the carpet flat on the floor.",
    steps: [
      {
        "title": "1. Construct local neighbourhood graph",
        "body": "Construct an undirected graph $G$: connect sample $x_i$ to its $k$-nearest neighbours (or points within radius $\\epsilon$), weighting edges by local Euclidean distance $d_X(i, j)$."
      },
      {
        "title": "2. Compute all-pairs shortest paths",
        "body": "Estimate manifold geodesic distance $D_G(i, j)$ between all pairs of points using Dijkstra algorithm (or Floyd–Warshall), finding the shortest path across graph edges."
      },
      {
        "title": "3. Formulate centred Gram matrix",
        "body": "Compute squared distance matrix $D_G^2$. Apply double centring matrix $H = I - \\frac{1}{n} \\mathbf{1}\\mathbf{1}^T$ to obtain inner product matrix $B = -\\frac{1}{2} H D_G^2 H$."
      },
      {
        "title": "4. Extract low-dimensional coordinates",
        "body": "Compute top $d$ eigenvalues and eigenvectors of $B$: $B = V \\Lambda V^T$. Reconstruct coordinates $Y = V_d \\Lambda_d^{1/2}$."
      }
    ],
    math: [
      {
        "h": "Classical MDS Double Centring Formula",
        "tex": "B = -\\frac{1}{2} H D^2 H, \\quad H = I_n - \\frac{1}{n} \\mathbf{1}_n \\mathbf{1}_n^T",
        "p": "Converts a matrix of squared pairwise Euclidean distances D^2 into an origin-centred inner product Gram matrix B = X X^T."
      },
      {
        "h": "Classical MDS Coordinate Extraction",
        "tex": "Y = V_d \\Lambda_d^{1/2}, \\quad B = V \\Lambda V^T",
        "p": "Eigendecomposition of Gram matrix B yields optimal low-dimensional coordinates Y minimising the Strain objective function."
      },
      {
        "h": "Geodesic Graph Distance Approximation",
        "tex": "d_{\\mathcal{M}}(x_i, x_j) \\approx d_G(i, j) = \\min_{p = (v_0, \\dots, v_m)} \\sum_{k=0}^{m-1} \\|v_k - v_{k+1}\\|_2",
        "p": "In the limit of infinite data density, shortest path distance through the k-NN graph converges asymptotically to the true Riemannian geodesic distance along manifold M."
      }
    ],
    code: "import numpy as np\nfrom scipy.sparse.csgraph import floyd_warshall\n\n# Isomap from scratch (k-NN graph + Floyd-Warshall + Classical MDS)\ndef isomap_from_scratch(X, n_neighbors=8, n_components=2):\n    n = len(X)\n    \n    # 1. Compute pairwise Euclidean distances\n    dists_sq = np.sum(X**2, axis=1)[:, None] + np.sum(X**2, axis=1)[None, :] - 2 * (X @ X.T)\n    dists = np.sqrt(np.maximum(dists_sq, 0))\n    \n    # 2. Build k-NN adjacency graph\n    adj_matrix = np.full((n, n), np.inf)\n    for i in range(n):\n        # Find k nearest neighbors (excluding self)\n        nn_indices = np.argsort(dists[i])[1:n_neighbors+1]\n        for j in nn_indices:\n            adj_matrix[i, j] = dists[i, j]\n            adj_matrix[j, i] = dists[i, j]  # Undirected graph\n            \n    # 3. Compute all-pairs shortest paths (Geodesic distance approximation)\n    D_geo = floyd_warshall(adj_matrix, directed=False)\n    \n    # Check for disconnected components\n    if np.any(np.isinf(D_geo)):\n        raise ValueError(\"Graph is disconnected; increase n_neighbors.\")\n        \n    # 4. Classical MDS on geodesic distance matrix\n    # Double centreing: B = -0.5 * H (D^2) H\n    H = np.eye(n) - np.ones((n, n)) / n\n    B = -0.5 * H @ (D_geo**2) @ H\n    \n    # Eigendecomposition\n    eigenvals, eigenvecs = np.linalg.eigh(B)\n    idx = np.argsort(eigenvals)[::-1]\n    eigenvals = eigenvals[idx]\n    eigenvecs = eigenvecs[:, idx]\n    \n    # Extract top d coordinates: Y = V_d * sqrt(Lambda_d)\n    top_evals = np.maximum(eigenvals[:n_components], 0)\n    Y = eigenvecs[:, :n_components] * np.sqrt(top_evals)\n    \n    return Y, D_geo\n\n# Generate synthetic Swiss Roll manifold\nnp.random.seed(42)\nn_points = 250\nphi = np.random.uniform(1.5 * np.pi, 4.0 * np.pi, n_points)\nheight = np.random.uniform(0, 10, n_points)\nx = phi * np.cos(phi)\ny = height\nz = phi * np.sin(phi)\nX_swiss = np.column_stack([x, y, z])\n\n# Run Isomap\nY_embedded, D_geo = isomap_from_scratch(X_swiss, n_neighbors=10, n_components=2)\n\n# Verify correlation between unrolled 1st dimension and true manifold parameter phi\ncorr_with_phi = np.abs(np.corrcoef(Y_embedded[:, 0], phi)[0, 1])\n\nprint(f\"Swiss Roll 3D shape: {X_swiss.shape}\")\nprint(f\"Isomap 2D Embedding shape: {Y_embedded.shape}\")\nprint(f\"Max Euclidean distance through air:    {np.max(np.linalg.norm(X_swiss[0] - X_swiss, axis=1)):.2f}\")\nprint(f\"Max Geodesic distance along manifold: {np.max(D_geo[0]):.2f} (captures unrolling!)\")\nprint(f\"Correlation between 1st Isomap axis and true unrolled spiral (phi): {corr_with_phi:.4f}\")",
    keyPoints: [
      "Multidimensional Scaling (MDS) finds a low-dimensional Euclidean embedding that preserves a given matrix of pairwise distances.",
      "Classical MDS converts squared pairwise distances into an inner product Gram matrix via double centring $B = -\\frac{1}{2} H D^2 H$.",
      "Isomap unrolls non-linear manifolds by substituting straight-line Euclidean distances with shortest-path geodesic distances across a $k$-NN graph.",
      "Guaranteed to find true isometric manifold embeddings asymptotically as data density approaches infinity.",
      "Highly sensitive to topological short-circuiting: noisy points or an overly large $k$ bridge adjacent layers, collapsing the unrolled manifold."
    ],
    pitfalls: [
      "Topological short-circuiting: If $k$ is too large or noise bridges adjacent folds of a manifold, a false shortcut is created that corrupts all geodesic paths.",
      "Disconnected components: If $k$ is too small, the graph fragments into disconnected subgraphs, yielding infinite shortest path distances.",
      "Computational scaling: All-pairs shortest paths via Floyd-Warshall scales as $O(n^3)$; Landmark Isomap (L-Isomap) is required for datasets with $n > 5,000$."
    ],
    quiz: [
      {
        "q": "Why does Isomap construct a k-NN graph before applying Classical MDS?",
        "o": [
          "To estimate the true geodesic distance along the curved manifold via graph shortest paths rather than measuring straight-line Euclidean distance through empty air",
          "To perform supervised classification on the data points",
          "To filter out all outliers before dimensionality reduction",
          "To reduce the number of samples from n to k"
        ],
        "a": 0,
        "why": "Euclidean distance cuts through empty space across manifold folds. By traversing local nearest neighbours, graph shortest paths approximate the true manifold geodesic distance."
      },
      {
        "q": "What is the mathematical role of the double centring matrix H = I - (1/n) 1 1^T in Classical MDS?",
        "o": [
          "It converts a matrix of squared pairwise distances into an origin-centred inner product Gram matrix B = X X^T",
          "It standardises the columns to unit variance",
          "It removes imaginary numbers from the distance matrix",
          "It inverts the matrix using Cholesky factorisation"
        ],
        "a": 0,
        "why": "From the identity d_{ij}^2 = ||x_i||^2 + ||x_j||^2 - 2 x_i^T x_j, double centring cancels out the row and column squared norms, leaving exactly the inner product matrix B."
      }
    ],
    usedBy: [],
    prereq: [
      "svd-and-truncated-svd"
    ],
    related: [
      "svd-and-truncated-svd",
      "kernel-pca",
      "spectral_clustering",
      "random-projections-and-johnson-lindenstrauss"
    ],
    keywords: "isomap, mds, multidimensional scaling, geodesic distance, manifold learning, swiss roll, shortest path, floyd warshall"
  },
  {
    id: "random-projections-and-johnson-lindenstrauss",
    short: "Random projections & JL",
    title: "Random Projections and the Johnson–Lindenstrauss Lemma",
    task: "concepts",
    module: "Dimensionality reduction",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Compress high-dimensional vectors with minimal distortion using random matrices: master the Johnson–Lindenstrauss lemma and Achlioptas sparse projections.",
    lead: "Computing PCA on millions of points in 10,000 dimensions is computationally prohibitive. The Johnson–Lindenstrauss lemma proves that projecting onto a surprisingly small random subspace preserves all pairwise distances within a factor of (1 +- epsilon).",
    intuition: [
      "Modern machine learning applications routinely process data in ultra-high dimensions: 100,000-word TF-IDF document vectors, 1,536-dimensional neural embeddings, or high-throughput biological mass spectrometry. In these spaces, computing exact Principal Component Analysis (PCA) requires covariance matrix operations and SVD scaling as $O(n d^2)$, which is computationally crushing for large datasets.",
      "Remarkably, the geometry of high-dimensional Euclidean space contains an extraordinary mathematical property: two random vectors drawn uniformly in high dimensions are almost guaranteed to be nearly orthogonal to each other. This geometric phenomenon is the foundation of Random Projections.",
      "In 1984, William B. Johnson and Joram Lindenstrauss proved their celebrated lemma: any collection of $n$ points in Euclidean space $\\mathbb{R}^d$ can be projected into a lower-dimensional subspace $\\mathbb{R}^k$ such that all pairwise Euclidean distances are preserved within a factor of $(1 \\pm \\epsilon)$, provided that $k \\ge O(\\epsilon^{-2} \\log n)$.",
      "The most profound consequence of the Johnson–Lindenstrauss lemma is that target dimension $k$ depends strictly on the number of points $n$ and the tolerance $\\epsilon$, and is entirely independent of the original dimension $d$! Even more practically, Dimitris Achlioptas (2003) proved that the random projection matrix does not even need Gaussian entries: simple sparse ternary distributions ($R_{ij} \\in \\{-1, 0, +1\\}$) provide identical guarantees while replacing matrix multiplications with fast integer additions."
    ],
    analogy: "Imagine projecting 1,000 glass statues in a dark room by shining a lantern to cast their 2D shadows onto a flat wall. If you align the lantern along one specific axis, statues might block each other or cast squashed shadows. But if you position the lantern at a completely random angle in 3D space, the shadows cast on the wall almost never overlap, faithfully preserving the relative distances between every statue in the room.",
    steps: [
      {
        "title": "1. Determine target dimension k from JL bound",
        "body": "Given sample size $n$ and acceptable distortion tolerance $\\epsilon \\in (0, 1)$, calculate minimum target dimension: $k \\ge \\frac{4 \\log n}{\\epsilon^2 / 2 - \\epsilon^3 / 3}$."
      },
      {
        "title": "2. Generate random projection matrix R",
        "body": "Draw random matrix $R \\in \\mathbb{R}^{d \\times k}$. For Gaussian projection, sample $R_{ij} \\sim \\mathcal{N}(0, 1/k)$. For Achlioptas sparse projection, sample $R_{ij} \\in \\{+\\sqrt{s/k}, 0, -\\sqrt{s/k}\\}$ with probabilities $\\{1/(2s), 1 - 1/s, 1/(2s)\\}$ with $s=3$."
      },
      {
        "title": "3. Project data matrix into low-dimensional space",
        "body": "Compute projected representation: $X_{\\mathrm{proj}} = X R \\in \\mathbb{R}^{n \\times k}$. Note that $R$ requires zero training data or fitting."
      },
      {
        "title": "4. Verify pairwise distance preservation",
        "body": "Verify that for all pairs $(u, v)$, the ratio $\\|X_{\\mathrm{proj}, u} - X_{\\mathrm{proj}, v}\\|^2 / \\|X_u - X_v\\|^2 \\in [1 - \\epsilon, 1 + \\epsilon]$."
      }
    ],
    math: [
      {
        "h": "The Johnson–Lindenstrauss (JL) Lemma",
        "tex": "(1 - \\epsilon) \\|u - v\\|_2^2 \\le \\|f(u) - f(v)\\|_2^2 \\le (1 + \\epsilon) \\|u - v\\|_2^2 \\quad \\forall u, v \\in X",
        "p": "Guarantees that a linear mapping f preserves all pairwise Euclidean distances within a relative distortion factor epsilon."
      },
      {
        "h": "Theoretical Target Dimension Bound",
        "tex": "k \\ge \\frac{4 \\log n}{\\frac{\\epsilon^2}{2} - \\frac{\\epsilon^3}{3}} = O\\left(\\frac{\\log n}{\\epsilon^2}\\right)",
        "p": "The required target dimension k depends only on sample size n and tolerance epsilon, completely independent of original dimension d."
      },
      {
        "h": "Achlioptas Sparse Random Projection Matrix",
        "tex": "R_{ij} = \\sqrt{\\frac{3}{k}} \\times \\begin{cases} +1 & \\text{with prob } 1/6 \\\\ 0 & \\text{with prob } 2/3 \\\\ -1 & \\text{with prob } 1/6 \\end{cases}",
        "p": "Ternary random projection matrix where two-thirds of entries are zero, accelerating projection computation by 3x and enabling database sparse arithmetic."
      }
    ],
    code: "import numpy as np\n\n# Random Projections: Gaussian vs Achlioptas Sparse from scratch\nnp.random.seed(42)\n\n# Generate 500 samples in d = 2,000 dimensions\nn_samples = 500\nd_features = 2000\nX = np.random.normal(0, 1, (n_samples, d_features))\n\n# Calculate theoretical JL target dimension for epsilon = 0.20\nepsilon = 0.20\n# k >= 4 * log(n) / (eps^2 / 2 - eps^3 / 3)\nk_bound = int(np.ceil((4 * np.log(n_samples)) / (epsilon**2 / 2 - epsilon**3 / 3)))\nk = 300  # Target dimension (compressed from 2,000 to 300)\n\n# 1. Gaussian Random Projection Matrix: R_ij ~ N(0, 1/k)\nR_gaussian = np.random.normal(0, 1.0 / np.sqrt(k), (d_features, k))\nX_proj_gauss = X @ R_gaussian\n\n# 2. Achlioptas Sparse Random Projection Matrix (s = 3)\n# 2/3 of entries are 0, entries are +sqrt(3/k) or -sqrt(3/k)\ns = 3\nrand_draw = np.random.uniform(0, 1, (d_features, k))\nR_sparse = np.zeros((d_features, k))\nR_sparse[rand_draw < 1.0 / (2 * s)] = np.sqrt(s / k)\nR_sparse[rand_draw > 1.0 - 1.0 / (2 * s)] = -np.sqrt(s / k)\nX_proj_sparse = X @ R_sparse\n\n# Evaluate pairwise distance distortion across 1,000 random pairs\nn_pairs = 1000\nidx_u = np.random.choice(n_samples, n_pairs)\nidx_v = np.random.choice(n_samples, n_pairs)\nvalid = idx_u != idx_v\nidx_u, idx_v = idx_u[valid], idx_v[valid]\n\n# Original squared distances\ndist_orig_sq = np.sum((X[idx_u] - X[idx_v])**2, axis=1)\n\n# Projected squared distances\ndist_gauss_sq = np.sum((X_proj_gauss[idx_u] - X_proj_gauss[idx_v])**2, axis=1)\ndist_sparse_sq = np.sum((X_proj_sparse[idx_u] - X_proj_sparse[idx_v])**2, axis=1)\n\n# Distortion ratios: ||f(u) - f(v)||^2 / ||u - v||^2\nratio_gauss = dist_gauss_sq / dist_orig_sq\nratio_sparse = dist_sparse_sq / dist_orig_sq\n\nprint(f\"Original dimension: {d_features} -> Projected dimension: {k} ({(1 - k/d_features)*100:.1f}% reduction)\")\nprint(f\"Theoretical JL target bound (eps={epsilon}): k >= {k_bound}\")\nprint(f\"Target distortion range: [{1 - epsilon:.2f}, {1 + epsilon:.2f}]\")\n\nprint(f\"\\nGaussian Projection  - Mean ratio: {np.mean(ratio_gauss):.3f}, 99% interval: [{np.percentile(ratio_gauss, 0.5):.3f}, {np.percentile(ratio_gauss, 99.5):.3f}]\")\nprint(f\"Sparse Achlioptas   - Mean ratio: {np.mean(ratio_sparse):.3f}, 99% interval: [{np.percentile(ratio_sparse, 0.5):.3f}, {np.percentile(ratio_sparse, 99.5):.3f}]\")\nprint(f\"Sparse Matrix Sparsity: {np.mean(R_sparse == 0)*100:.1f}% zeros (3x faster multiplication!)\")",
    keyPoints: [
      "Embeds high-dimensional points into a lower-dimensional subspace while preserving pairwise distances within $(1 \\pm \\epsilon)$ distortion.",
      "The Johnson–Lindenstrauss lemma dictates target dimension $k = O(\\epsilon^{-2} \\log n)$, which is completely independent of input dimension $d$.",
      "Data-independent and training-free: the projection matrix is drawn purely at random, requiring zero optimisation or SVD factorisation.",
      "Achlioptas sparse projection achieves identical theoretical guarantees while keeping two-thirds of matrix entries at zero.",
      "Widely used in nearest-neighbour search indexing (Locality Sensitive Hashing, LSH), streaming algorithms, and compressed sensing."
    ],
    pitfalls: [
      "Inner product distortion vs Euclidean distance: While JL preserves Euclidean distances $|u - v|$, preserving dot products $u^T v$ requires normalising vectors to unit length.",
      "Only applies to Euclidean ($L_2$) norm: The JL lemma does not hold for Manhattan ($L_1$), Chebyshev ($L_\\infty$), or general $L_p$ norms.",
      "Extreme sample size scaling: Because $k \\propto \\log n$, if $n$ is hundreds of millions, the required $k$ might exceed the original dimension $d$."
    ],
    quiz: [
      {
        "q": "What is the most surprising property of the target dimension k in the Johnson–Lindenstrauss lemma?",
        "o": [
          "k depends only on sample size n and distortion tolerance epsilon, and is completely independent of the original dimension d",
          "k must always equal the rank of the covariance matrix",
          "k must be strictly greater than d",
          "k depends on the eigenvalues of the dataset"
        ],
        "a": 0,
        "why": "The JL lemma bound k >= O(log(n) / eps^2) contains no dependence on original dimension d, allowing 1,000,000-dimensional data to be compressed to the same k as 1,000-dimensional data."
      },
      {
        "q": "Why is Achlioptas sparse random projection computationally faster than Gaussian random projection?",
        "o": [
          "Two-thirds of its entries are exactly zero and non-zero entries are simple integers, accelerating matrix multiplication by 3x with sparse arithmetic",
          "It requires computing the SVD of the dataset",
          "It produces an exact zero distortion ratio",
          "It eliminates the need for test data"
        ],
        "a": 0,
        "why": "The Achlioptas ternary distribution has 2/3 zeros and entries in {-1, 0, +1}, turning dense floating-point matrix multiplications into fast sparse integer additions."
      }
    ],
    usedBy: [],
    prereq: [
      "svd-and-truncated-svd"
    ],
    related: [
      "svd-and-truncated-svd",
      "kernel-pca",
      "mds-and-isomap"
    ],
    keywords: "random projections, johnson lindenstrauss lemma, achlioptas, dimensionality reduction, euclidean distance preservation, lsh, sparse projection"
  },
  {
    id: 'isolation-forest',
    short: 'Isolation Forest',
    title: 'Isolation Forest',
    task: 'concepts',
    module: 'Anomaly detection',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Tree-based anomaly detection that isolates anomalies through random recursive partitioning, exploiting the fact that outliers require fewer random cuts to separate.`,
    lead: r`Traditional anomaly detection algorithms model the normal data profile using density estimation, distance clustering, or convex hulls, which causes quadratic computational bottlenecks and degrades in high dimensions. Isolation Forest inverts this paradigm: instead of constructing an expensive model of normality, it explicitly isolates anomalies by building an ensemble of completely randomised binary decision trees, isolating outliers near the root with linear time complexity.`,
    intuition: [
      r`Consider a large group of people gathered closely in the centre of a town square, with a solitary pedestrian wandering 50 metres away on the empty perimeter. If an observer draws random straight lines across the square, how many cuts will it take to isolate the solitary pedestrian from everyone else? A single random cut that falls between the wanderer and the square isolates them immediately. In contrast, isolating an individual standing shoulder-to-shoulder inside the central crowd requires dozens of precise, finely placed cuts.`,
      r`This geometric property forms the core intuition of Isolation Forest. Anomalies are "few and different": they occur in sparse regions of feature space far from normal data clusters. When a binary tree recursively chooses a feature at random and cuts it at a uniform random value between that feature's minimum and maximum, anomalies are isolated into individual leaf nodes after very few splits (short path length). Normal instances, packed together in high-density regions, require many recursive splits (long path length) to isolate.`,
      r`Because the algorithm relies solely on relative path lengths rather than pairwise Euclidean distances or probability densities, it eliminates the curse of dimensionality and distance distortion. Subsampling data into small subsets (typically 256 instances per tree) prevents two classic anomaly detection pathologies: swamping (falsely labelling inliers as anomalies because they sit near outlier clusters) and masking (clusters of outliers masking each other by appearing locally dense).`,
    ],
    analogy: r`Slicing through a wooden board with random saw cuts: a knothole protruding off the outer edge gets severed in one or two quick passes, whereas isolating a single wood grain deep within the centre requires countless cuts.`,
    steps: [
      r`Subsample the training dataset without replacement into small bags of size $\psi$ (typically $\psi = 256$), mitigating masking and swamping while dramatically accelerating tree construction.`,
      r`Build an ensemble of $t$ completely randomised isolation trees (iTrees), setting the maximum tree depth to $\lceil \log_2(\psi) \rceil$.`,
      r`At each tree node, randomly choose a feature $q$ uniformly from the available feature columns.`,
      r`Select a split value $p$ uniformly at random between the minimum and maximum values of feature $q$ in the current node's data subset.`,
      r`Partition the data into left ($x_q < p$) and right ($x_q \ge p$) child nodes, recursing until instances are isolated ($|X| \le 1$), all feature values are identical, or max depth is reached.`,
      r`Pass each evaluation sample $x$ through all $t$ trees, recording the path length $h_i(x)$ (edges traversed plus the average path length correction $c(n)$ if terminated at an un-isolated node).`,
      r`Compute the normalised anomaly score $s(x, \psi) = 2^{-\mathbb{E}[h(x)] / c(\psi)}$; flag instances with $s(x, \psi) > 0.6$ as anomalies.`,
    ],
    math: [
      {
        h: 'Recursive partitioning and path length h(x)',
        tex: r`$$h(x) = e + c(|X_{\text{leaf}}|)$$`,
        p: r`An isolation tree (iTree) is a proper binary tree where every node has either zero or two children. The path length $h(x)$ of sample $x$ is the number of edges $e$ traversed from the root node to a terminating leaf node, augmented by the unbuilt tree correction $c(|X_{\text{leaf}}|)$ if early stopping was reached.`,
      },
      {
        h: 'Average path length of unsuccessful search in a BST',
        tex: r`$$c(n) = 2 \left( \ln(n - 1) + \gamma \right) - \frac{2(n - 1)}{n}$$`,
        p: r`where $\gamma \approx 0.5772156649$ is Euler's constant. Because iTrees share the exact mathematical structure of random binary search trees, $c(n)$ provides the theoretical average path length of an instance across $n$ randomly inserted items, serving as an exact normalisation constant.`,
      },
      {
        h: 'Normalised anomaly score formulation',
        tex: r`$$s(x, n) = 2^{-\frac{\mathbb{E}[h(x)]}{c(n)}}$$`,
        p: r`where $\mathbb{E}[h(x)]$ is the average path length across all trees in the forest. When $\mathbb{E}[h(x)] \to 0$, $s \to 1$, indicating an unambiguous anomaly isolated in very few splits. When $\mathbb{E}[h(x)] \to c(n)$, $s \to 0.5$, representing an ordinary instance indistinguishable from random data. When $\mathbb{E}[h(x)] \to n - 1$, $s \to 0$, signifying a deeply embedded inlier.`,
      },
    ],
    code: r`import numpy as np

def c_factor(n):
    return 2.0 * (np.log(n - 1) + 0.5772156649) - 2.0 * (n - 1) / n if n > 2 else (1.0 if n == 2 else 0.0)

def build_tree(X, depth, max_depth, rng):
    if len(X) <= 1 or depth >= max_depth:
        return {'size': len(X)}
    feat = rng.integers(0, X.shape[1])
    f_min, f_max = X[:, feat].min(), X[:, feat].max()
    if f_min == f_max:
        return {'size': len(X)}
    split = rng.uniform(f_min, f_max)
    left = build_tree(X[X[:, feat] < split], depth + 1, max_depth, rng)
    right = build_tree(X[X[:, feat] >= split], depth + 1, max_depth, rng)
    return {'feat': feat, 'split': split, 'left': left, 'right': right}

def path_length(x, node, depth):
    if 'size' in node:
        return depth + c_factor(node['size'])
    return path_length(x, node['left'], depth + 1) if x[node['feat']] < node['split'] else path_length(x, node['right'], depth + 1)

rng = np.random.default_rng(42)
X_train = rng.normal(0, 1, size=(200, 2))
trees = [build_tree(X_train[rng.choice(len(X_train), 64, replace=False)], 0, 6, rng) for _ in range(50)]

test_pts = np.array([[0.1, 0.1], [4.5, 4.5]])
for pt, label in zip(test_pts, ['Normal inlier', 'Extreme outlier']):
    avg_path = np.mean([path_length(pt, t, 0) for t in trees])
    score = 2.0 ** (-avg_path / c_factor(64))
    print(f"{label} path: {avg_path:.2f} | score: {score:.3f}")`,
    pitfalls: [
      r`Axis-aligned partition bias: Standard iTrees use axis-parallel orthogonal cuts. Anomalies that reside in empty corners between correlated features (such as diagonal bands) may require more splits to isolate, though extended isolation forests address this with hyperplanes.`,
      r`Over-subsampling vs under-subsampling: Setting subsample size $\psi$ too large causes swamping and masking, whereas setting $\psi$ too small fails to capture the true multivariate structure. The default $\psi = 256$ is empirically proven optimal across diverse domains.`,
      r`Noise features: If a dataset contains hundreds of irrelevant, completely random features, uniformly selecting features at each split introduces noise and dilutes the path length separation of true anomalies.`,
      r`Global score interpretation: Anomaly scores are relative to the dataset; a fixed threshold like 0.5 or 0.6 must be calibrated against business requirements and false alarm tolerances.`,
    ],
    keyPoints: [
      r`Directly isolates anomalies instead of profiling normal instances, achieving linear $O(t \cdot \psi \log \psi)$ computational complexity.`,
      r`Employs subsampling ($\psi = 256$) to eliminate swamping and masking while keeping memory consumption negligible.`,
      r`Uses the average path length of a binary search tree $c(n)$ to normalise scores objectively between 0 and 1.`,
      r`Operates effectively without distance metrics, avoiding distance concentration in high-dimensional spaces.`,
    ],
    quiz: [
      {
        q: r`Why does Isolation Forest deliberately use small subsamples (such as $\psi = 256$) instead of training trees on the entire dataset?`,
        o: [
          r`Because decision trees cannot process more than 256 rows in memory`,
          r`To eliminate swamping and masking while dramatically speeding up tree construction`,
          r`To ensure all isolation trees have identical depth`,
          r`Because small samples guarantee zero false negative classifications`,
        ],
        a: 1,
        why: r`Subsampling prevents "swamping" (normal instances surrounded by outliers being falsely flagged) and "masking" (dense clusters of outliers hiding each other). It also makes tree training extraordinarily fast.`,
      },
      {
        q: r`If an instance $x$ yields an anomaly score $s(x, n) = 0.5$, what does this score indicate?`,
        o: [
          r`The instance is definitely a catastrophic anomaly`,
          r`The instance has an average path length of zero`,
          r`The instance's average path length equals the expected path length $c(n)$ of a random binary search tree, showing no anomalous characteristics`,
          r`The algorithm failed to converge and must be retrained`,
        ],
        a: 2,
        why: r`When $\mathbb{E}[h(x)] = c(n)$, the exponent is $-1$, yielding $s = 2^{-1} = 0.5$. This indicates the instance's path length is indistinguishable from that of an average sample in a random BST.`,
      },
      {
        q: r`What role does Euler's constant $\gamma \approx 0.5772$ play in the Isolation Forest algorithm?`,
        o: [
          r`It serves as the default learning rate for split threshold selection`,
          r`It determines the maximum number of trees to construct`,
          r`It specifies the random seed for NumPy's random number generator`,
          r`It appears in the formula $c(n)$ for the expected path length of unsuccessful searches in a random binary search tree`,
        ],
        a: 3,
        why: r`The harmonic number approximation $H_{n-1} = \ln(n-1) + \gamma$ yields the expected path length $c(n) = 2(\ln(n-1) + \gamma) - \frac{2(n-1)}{n}$ for binary search trees, which acts as the normalising denominator.`,
      },
      {
        q: r`How does an anomaly differ geometrically from an inlier during Isolation Forest recursive splitting?`,
        o: [
          r`Anomalies reside in low-density sparse regions and are isolated near the root with short path lengths $h(x)$`,
          r`Anomalies always fall into the left child node of every split`,
          r`Anomalies require significantly more recursive cuts to separate than dense inliers`,
          r`Anomalies have zero variance across all feature dimensions`,
        ],
        a: 0,
        why: r`Anomalies are few and topologically isolated. Random cuts readily separate them from the rest of the dataset within few splits, resulting in small path lengths $h(x) \ll c(n)$.`,
      },
    ],
    usedBy: [],
    prereq: ['decision_tree_classifier', 'random_forest_classifier'],
    related: ['bagging-and-extra-trees', 'random_forest_classifier'],
    keywords: 'isolation forest anomaly detection outlier detection itree path length recursive partitioning unsupervised learning',
  },
  {
    id: 'local-outlier-factor',
    short: 'Local Outlier Factor',
    title: 'Local Outlier Factor',
    task: 'concepts',
    module: 'Anomaly detection',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Density-based anomaly detection that quantifies how isolated a point is relative to the varying local densities of its surrounding $k$-nearest neighbours.`,
    lead: r`Global anomaly detection algorithms assume that anomalies always sit far away from all other data points according to a single distance threshold. In datasets containing multiple clusters of wildly differing densities, this global assumption collapses: points on the fringe of a sparse cluster look like anomalies, while outliers near a dense cluster remain undetected. Local Outlier Factor (LOF) solves this by computing a ratio of local reachability densities, evaluating each point's degree of isolation purely relative to its immediate neighbourhood.`,
    intuition: [
      r`Imagine comparing population densities in two different regions: central Tokyo and rural Scotland. In central Tokyo, houses sit centimetres apart; if a new house were built 50 metres from its closest neighbour, that house would be an extraordinary anomaly. In the Scottish Highlands, houses routinely sit two kilometres apart; a home separated by 50 metres from its neighbour is not an anomaly at all, but rather part of a tightly clustered village. A global distance threshold would either brand every home in Scotland an anomaly, or miss the isolated house in Tokyo completely.`,
      r`Local Outlier Factor resolves this by measuring relative density rather than absolute distance. For any candidate point $p$, LOF first finds its $k$-nearest neighbours and calculates its local reachability density ($\operatorname{lrd}$)—the reciprocal of the average distance required to reach $p$ from its neighbours. If $p$ is located in the middle of a dense cluster, its reachability density is high. If $p$ sits in a sparse cloud, its density is low.`,
      r`The critical breakthrough is the LOF score itself, which divides the average local reachability density of $p$'s neighbours by $p$'s own local density. If $p$ has roughly the same density as its neighbours, this ratio is approximately 1, identifying $p$ as an inlier regardless of whether the cluster is dense or sparse. If $p$ is isolated—meaning its neighbours enjoy high density while $p$ sits out in the cold—the ratio jumps significantly above 1 (typically 1.5 or higher). This relative formulation makes LOF uniquely adept at uncovering local anomalies across complex, multi-density manifolds.`,
    ],
    analogy: r`Judging whether an ambient sound is unusually loud not by measuring absolute decibels on an open highway, but by comparing the volume to the quiet whisper of the immediate library room you are sitting in.`,
    steps: [
      r`For every point $p$ in the dataset, determine its $k$-distance $d_k(p)$ (the distance to its $k$-th nearest neighbour) and identify its neighbourhood set $N_k(p)$.`,
      r`For each neighbour $o \in N_k(p)$, compute the reachability distance of $p$ from $o$: $\text{reach-dist}_k(p, o) = \max\\{d_k(o), d(p, o)\}$, which stabilises density estimates within dense clusters.`,
      r`Calculate the local reachability density $\operatorname{lrd}_k(p)$ as the inverse of the average reachability distance from $p$ to all points in $N_k(p)$.`,
      r`Compute the Local Outlier Factor $\operatorname{LOF}_k(p)$ by taking the average ratio between the neighbours' local reachability densities $\operatorname{lrd}_k(o)$ and $p$'s own density $\operatorname{lrd}_k(p)$.`,
      r`Flag observations with $\operatorname{LOF}_k(p) \gg 1$ as anomalies; points with $\operatorname{LOF}_k(p) \approx 1$ are confirmed inliers.`,
    ],
    math: [
      {
        h: 'k-distance and reachability distance',
        tex: r`$$\text{reach-dist}_k(p, o) = \max\big\\{d_k(o), \, d(p, o)\big}$$`,
        p: r`where $d(p, o)$ is Euclidean distance and $d_k(o)$ is the distance from neighbour $o$ to its $k$-th nearest neighbour. If $p$ is very close to $o$, the reachability distance is floored at $d_k(o)$, preventing tiny denominator fluctuations from destabilising density estimates.`,
      },
      {
        h: 'Local reachability density',
        tex: r`$$\operatorname{lrd}_k(p) = \frac{|N_k(p)|}{\sum_{o \in N_k(p)} \text{reach-dist}_k(p, o)}$$`,
        p: r`$\operatorname{lrd}_k(p)$ quantifies the number of neighbours per unit reachability distance. Dense regions produce small reachability distances and large $\operatorname{lrd}$, while sparse regions produce small $\operatorname{lrd}$.`,
      },
      {
        h: 'Local Outlier Factor score',
        tex: r`$$\operatorname{LOF}_k(p) = \frac{1}{|N_k(p)|} \sum_{o \in N_k(p)} \frac{\operatorname{lrd}_k(o)}{\operatorname{lrd}_k(p)}$$`,
        p: r`When $p$ is deep inside a cluster, its density matches its neighbours' ($\operatorname{lrd}_k(o) \approx \operatorname{lrd}_k(p)$), yielding $\operatorname{LOF} \approx 1$. When $p$ is an outlier, its density is much lower than its neighbours' ($\operatorname{lrd}_k(p) \ll \operatorname{lrd}_k(o)$), driving $\operatorname{LOF} \gg 1$.`,
      },
    ],
    code: r`import numpy as np

# Synthetic clusters with different densities plus one outlier
rng = np.random.default_rng(42)
c1 = rng.normal(0, 0.5, (30, 2))
c2 = rng.normal(5, 1.5, (30, 2))
outlier = np.array([[1.5, 1.5]])
X = np.vstack([c1, c2, outlier])
n, k = len(X), 5

# Pairwise distances and k-nearest neighbours
dist = np.linalg.norm(X[:, None, :] - X[None, :, :], axis=-1)
sorted_idx = np.argsort(dist, axis=1)
nbr_idx = sorted_idx[:, 1:k+1]
k_dist = dist[np.arange(n), sorted_idx[:, k]]

# Reachability distance and local reachability density (lrd)
reach_dist = np.maximum(dist, k_dist[None, :])
lrd = k / np.sum([reach_dist[i, nbr_idx[i]] for i in range(n)], axis=1)

# Local Outlier Factor (LOF) score
lof = np.array([np.mean(lrd[nbr_idx[i]] / lrd[i]) for i in range(n)])

print(f"Dense cluster inlier LOF: {lof[0]:.3f}")
print(f"Sparse cluster inlier LOF: {lof[30]:.3f}")
print(f"Outlier LOF: {lof[-1]:.3f}")`,
    pitfalls: [
      r`Quadratic computational scaling: Finding exact $k$-nearest neighbours across all pairs requires $O(n^2)$ distance calculations, which becomes computationally prohibitive on millions of rows without spatial tree indexing (like $k$-d trees).`,
      r`Selection of $k$: If $k$ is chosen smaller than the size of an outlier cluster, the outliers form a mutual neighbourhood and mask each other. If $k$ is too large, it dilutes micro-density contrasts.`,
      r`High-dimensional distance concentration: In spaces with hundreds of dimensions, Euclidean distances concentrate and become equidistant, eroding the contrast between local and distant densities.`,
      r`Lack of an absolute score threshold: Unlike a calibrated probability, there is no universal cutoff for LOF; a score of 1.3 might be an extreme outlier in one dataset and a normal border point in another.`,
    ],
    keyPoints: [
      r`Detects anomalies based on relative local density rather than global Euclidean distance cutoffs.`,
      r`Successfully identifies outliers in datasets containing multiple clusters of vastly different densities.`,
      r`Reachability distance $\max\\{d_k(o), d(p, o)\\}$ stabilises calculations within dense clusters.`,
      r`Points with $\operatorname{LOF} \approx 1$ are normal inliers; scores substantially greater than 1 indicate local outliers.`,
    ],
    quiz: [
      {
        q: r`Why does Local Outlier Factor use relative local density rather than absolute distance to the nearest cluster centre?`,
        o: [
          r`Because computing cluster centres requires supervised class labels`,
          r`To avoid falsely labelling normal points in sparse clusters as anomalies while missing true outliers near dense clusters`,
          r`Because absolute distances cannot be computed using Euclidean metrics`,
          r`To guarantee that all inlier scores are identically zero`,
        ],
        a: 1,
        why: r`In datasets with heterogeneous densities, points in a legitimate sparse cluster have large pairwise distances. Global metrics mistake them for outliers, whereas LOF's relative density ratio normalises for local cluster spread.`,
      },
      {
        q: r`What is the expected Local Outlier Factor ($\operatorname{LOF}$) score for a data point nestled securely deep inside a cluster?`,
        o: [
          r`Exactly 0.0`,
          r`Negative infinity`,
          r`Approximately 1.0`,
          r`Greater than 5.0`,
        ],
        a: 2,
        why: r`Deep inside a cluster, a point and all of its neighbours have virtually identical local reachability densities ($\operatorname{lrd}(o) \approx \operatorname{lrd}(p)$), so the ratio averages to approximately 1.0.`,
      },
      {
        q: r`What role does the reachability distance $\text{reach-dist}_k(p, o) = \max\\{d_k(o), d(p, o)\\}$ play in LOF?`,
        o: [
          r`It forces all distances to follow a normal distribution`,
          r`It eliminates the need to specify the neighbourhood size $k$`,
          r`It projects points into a lower-dimensional subspace`,
          r`It establishes a minimum distance floor based on neighbour density, preventing statistical instability from near-zero distances`,
        ],
        a: 3,
        why: r`By replacing tiny distances between identical or near-duplicate points with $d_k(o)$, reachability distance prevents near-zero divisions and stabilises local density estimates.`,
      },
      {
        q: r`What is a primary limitation of standard Local Outlier Factor when scaling to high-dimensional datasets?`,
        o: [
          r`Distance concentration diminishes the contrast between nearest and furthest neighbours, blurring local density differences`,
          r`LOF can only be evaluated on single-dimensional scalar values`,
          r`LOF requires training thousands of deep neural network weights`,
          r`LOF assumes that all features follow independent Bernoulli distributions`,
        ],
        a: 0,
        why: r`As dimensionality increases, Euclidean distances concentrate around a common mean (the curse of dimensionality), causing relative density ratios to flatten toward 1 and degrading outlier discrimination.`,
      },
    ],
    usedBy: [],
    prereq: ['isolation-forest', 'dbscan_clustering'],
    related: ['isolation-forest', 'dbscan_clustering', 'kmedoids_clustering'],
    keywords: 'local outlier factor lof anomaly detection density reachability distance outlier detection k nearest neighbours unsupervised',
  },
  {
    id: "one-class-svm",
    short: "One-class SVM",
    title: "One-Class Support Vector Machines",
    task: "concepts",
    module: "Anomaly detection",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Learn non-linear boundary around normal data to detect novel anomalies: master the Schölkopf hyperplane and Tax & Duin hypersphere formulations.",
    lead: "In anomaly detection, negative examples are rare, unknown, or infinitely varied. The One-Class SVM trains exclusively on nominal data, learning a tight decision boundary that envelops the normal data distribution.",
    intuition: [
      "Supervised classification requires representative training samples from all classes. However, in mission-critical applications—such as credit card fraud detection, industrial wind turbine vibration monitoring, network intrusion detection, or manufacturing defect inspection—anomalies are either exceedingly rare or take completely novel, unimagined forms. Trying to train a standard binary classifier fails because you cannot sample the infinite universe of potential anomalies.",
      "One-Class Classification addresses this challenge by learning strictly from positive, nominal data. Introduced by Bernhard Schölkopf et al. (2001), the One-Class Support Vector Machine (OC-SVM) maps normal training instances into a high-dimensional feature space $\\mathcal{H}$ via a kernel function (typically RBF) and seeks a maximum-margin hyperplane that separates the normal data cloud from the coordinate origin.",
      "Geometrically, the origin serves as a proxy for all anomalous patterns. In the dual formulation, the algorithm identifies a sparse subset of normal points as support vectors that define the outer perimeter of the normal data distribution.",
      "A hyperparameter $\\nu \\in (0, 1]$ controls the trade-off: it acts as an exact upper bound on the fraction of training outliers permitted outside the boundary, and a lower bound on the fraction of support vectors. Alternatively, David Tax and Robert Duin proposed Support Vector Data Description (SVDD), which encloses normal points within a minimum-volume hypersphere of radius $R$; for stationary RBF kernels, SVDD and Schölkopf One-Class SVM are mathematically equivalent."
    ],
    analogy: "Imagine an ancient walled city built on an open plain. The city guards do not know what future invaders will look like (whether bandits, foreign armies, or monsters). Instead of trying to identify enemies, the city architects build a circular stone fortress wall closely enclosing all the lawful citizens homes. Any individual found standing inside the fortress walls is considered a citizen; anyone found outside the perimeter wall is flagged as a stranger.",
    steps: [
      {
        "title": "1. Collect nominal training dataset",
        "body": "Assemble feature matrix $X \\in \\mathbb{R}^{n \\times p}$ composed exclusively (or predominantly) of normal, non-anomalous operational instances."
      },
      {
        "title": "2. Select kernel and configure outlier fraction nu",
        "body": "Choose a Gaussian RBF kernel $K(x, x') = \\exp(-\\gamma \\|x - x'\\|^2)$. Set hyperparameter $\\nu \\in (0, 1]$ representing the expected contamination rate (e.g. $\\nu = 0.05$ for 5% outliers)."
      },
      {
        "title": "3. Solve quadratic programming dual problem",
        "body": "Maximise dual objective: $\\min_\\alpha \\frac{1}{2} \\sum_{i, j} \\alpha_i \\alpha_j K(x_i, x_j)$ subject to $0 \\le \\alpha_i \\le \\frac{1}{\\nu n}$ and $\\sum_{i=1}^n \\alpha_i = 1$. Support vectors satisfy $\\alpha_i > 0$."
      },
      {
        "title": "4. Compute offset rho and evaluate decision function",
        "body": "Calculate threshold $\\rho = \\sum_{i=1}^n \\alpha_i K(x_i, x_{sv})$ for any support vector with $0 < \\alpha_{sv} < 1/(\\nu n)$. Score novel sample $x$: $f(x) = \\operatorname{sign}\\left(\\sum_{i=1}^n \\alpha_i K(x_i, x) - \\rho\\right)$. Points with $f(x) < 0$ are anomalies."
      }
    ],
    math: [
      {
        "h": "Schölkopf One-Class SVM Primal Formulation",
        "tex": "\\min_{w, \\xi, \\rho} \\frac{1}{2} \\|w\\|^2 + \\frac{1}{\\nu n} \\sum_{i=1}^n \\xi_i - \\rho \\quad \\text{subject to} \\quad \\langle w, \\phi(x_i) \\rangle \\ge \\rho - \\xi_i, \\; \\xi_i \\ge 0",
        "p": "Separates normal mapped data from origin with maximum margin rho. Slack variables xi_i penalise instances falling on the origin side of the separating boundary."
      },
      {
        "h": "Dual Quadratic Programming Problem",
        "tex": "\\min_\\alpha \\frac{1}{2} \\sum_{i=1}^n \\sum_{j=1}^n \\alpha_i \\alpha_j K(x_i, x_j) \\quad \\text{subject to} \\quad 0 \\le \\alpha_i \\le \\frac{1}{\\nu n}, \\; \\sum_{i=1}^n \\alpha_i = 1",
        "p": "Dual problem depends only on inner products evaluated via kernel function K(x_i, x_j). The upper bound on alpha_i prevents individual points from disproportionately warping the boundary."
      },
      {
        "h": "Tax & Duin SVDD Hypersphere Primal",
        "tex": "\\min_{R, c, \\xi} R^2 + \\frac{1}{\\nu n} \\sum_{i=1}^n \\xi_i \\quad \\text{subject to} \\quad \\|\\phi(x_i) - c\\|^2 \\le R^2 + \\xi_i, \\; \\xi_i \\ge 0",
        "p": "Encloses normal instances within a minimum-radius hypersphere of centre c and radius R. For RBF kernels with K(x, x) = 1, SVDD yields an identical boundary to Schölkopf formulation."
      }
    ],
    code: "import numpy as np\nfrom sklearn.svm import OneClassSVM\n\n# One-Class SVM for Novelty and Anomaly Detection\nnp.random.seed(42)\n\n# 1. Generate normal operational data (2 clusters in 2D space)\nn_normal = 300\ncluster1 = np.random.normal(loc=[-2, -2], scale=0.6, size=(n_normal // 2, 2))\ncluster2 = np.random.normal(loc=[2, 2], scale=0.7, size=(n_normal // 2, 2))\nX_train_normal = np.vstack([cluster1, cluster2])\n\n# 2. Generate novel test data containing normal points and extreme anomalies\nn_test_normal = 100\nn_anomalies = 20\ntest_normal = np.random.normal(loc=[-2, -2], scale=0.6, size=(n_test_normal, 2))\nanomalies = np.random.uniform(low=-6, high=6, size=(n_anomalies, 2))\n# Ensure anomalies are outside normal clusters\nanomalies = anomalies[np.linalg.norm(anomalies - np.array([-2, -2]), axis=1) > 2.0]\nanomalies = anomalies[np.linalg.norm(anomalies - np.array([2, 2]), axis=1) > 2.0][:n_anomalies]\n\nX_test = np.vstack([test_normal, anomalies])\ny_test = np.array([1]*len(test_normal) + [-1]*len(anomalies))  # 1 = normal, -1 = anomaly\n\n# 3. Fit One-Class SVM with RBF kernel and nu=0.05\nnu = 0.05\noc_svm = OneClassSVM(kernel='rbf', gamma=0.5, nu=nu)\noc_svm.fit(X_train_normal)\n\n# Evaluate predictions (-1 for anomaly, +1 for inlier)\npreds_train = oc_svm.predict(X_train_normal)\npreds_test = oc_svm.predict(X_test)\n\ntrain_outlier_rate = np.mean(preds_train == -1)\ntest_anomaly_detection_rate = np.mean(preds_test[y_test == -1] == -1)\ntest_normal_retention_rate = np.mean(preds_test[y_test == 1] == 1)\n\nprint(f\"One-Class SVM fitted with nu = {nu} (target max outlier fraction)\")\nprint(f\"Training support vectors count: {len(oc_svm.support_)} / {n_normal} ({len(oc_svm.support_)/n_normal*100:.1f}%)\")\nprint(f\"Empirical training outlier fraction: {train_outlier_rate*100:.1f}% (bounded by nu = {nu*100:.1f}%)\")\nprint(f\"Test Anomaly Detection Recall:       {test_anomaly_detection_rate*100:.1f}%\")\nprint(f\"Test Normal Inlier Precision:        {test_normal_retention_rate*100:.1f}%\")",
    keyPoints: [
      "Learns a non-linear decision boundary enclosing normal data, detecting anomalies as points falling outside the boundary.",
      "Trained exclusively on nominal data without requiring negative anomaly examples during training.",
      "Schölkopf formulation separates normal points from the coordinate origin in RKHS with maximum margin.",
      "Hyperparameter $\\nu \\in (0, 1]$ simultaneously bounds the fraction of training outliers and the fraction of support vectors.",
      "When paired with Gaussian RBF kernels, One-Class SVM models complex multi-modal and non-convex normal distributions."
    ],
    pitfalls: [
      "Sensitivity to RBF parameter gamma: If $\\gamma$ is too large, the kernel boundary tightly wraps each individual training sample into isolated islands, causing extreme overfitting and false alarm floods.",
      "Contamination in training set: If the training set contains unlabelled anomalies, the boundary expands to enclose them; robust trimming or robust covariance is needed.",
      "High-dimensional distance concentration: In ultra-high dimensions ($p > 1000$), Euclidean distances in RBF kernels concentrate, degrading boundary quality; dimensionality reduction should precede OC-SVM."
    ],
    quiz: [
      {
        "q": "What role does the hyperparameter nu play in the One-Class SVM?",
        "o": [
          "It acts as an upper bound on the fraction of training outliers and a lower bound on the fraction of support vectors",
          "It sets the learning rate of the gradient descent solver",
          "It specifies the number of clusters in the dataset",
          "It defines the dimensionality of the kernel Hilbert space"
        ],
        "a": 0,
        "why": "In the nu-SVM formulation, nu strictly upper-bounds the training margin errors (outlier fraction) and lower-bounds the fraction of support vectors."
      },
      {
        "q": "Why does the One-Class SVM separate data from the origin in feature space?",
        "o": [
          "The origin serves as a natural proxy representing anomalous or zero-signal states in reproducing kernel Hilbert spaces",
          "Because the origin has infinite variance",
          "Because kernel matrices are singular at the origin",
          "Because support vectors cannot have positive coordinates"
        ],
        "a": 0,
        "why": "In RKHS under an RBF kernel, mapped data points cluster away from the origin on a hypersphere. Separating data from the origin encloses the high-density normal region."
      }
    ],
    usedBy: [],
    prereq: [
      "support_vector_classifier",
      "kernel-pca"
    ],
    related: [
      "support_vector_classifier",
      "mahalanobis-distance-and-robust-covariance",
      "local-outlier-factor",
      "kernel-pca"
    ],
    keywords: "one class svm, anomaly detection, novelty detection, svdd, support vectors, schölkopf, rbf kernel, out of distribution"
  },
  {
    id: "mahalanobis-distance-and-robust-covariance",
    short: "Mahalanobis & robust cov",
    title: "Mahalanobis Distance and Robust Covariance Estimation",
    task: "concepts",
    module: "Anomaly detection",
    level: 2,
    minutes: 16,
    noLab: true,
    summary: "Detect multivariate outliers while accounting for feature covariance: master Mahalanobis distance, the masking effect, and the Minimum Covariance Determinant (MCD).",
    lead: "Univariate thresholds miss multivariate anomalies where individual features appear normal but violate cross-feature correlations. Mahalanobis distance measures deviation in statistical units, while robust estimators prevent outliers from masking themselves.",
    intuition: [
      "Detecting outliers using univariate rules (such as checking if a feature exceeds 3 standard deviations from its mean) fails catastrophically in multi-dimensional datasets. Consider human biometric telemetry: a height of 150 cm is completely normal, and a body weight of 105 kg is unexceptional. However, a person who is simultaneously 150 cm tall and weighs 105 kg is a severe physical anomaly.",
      "Euclidean distance is blind to this correlation: it measures distances as spherical bubbles, assuming features are independent and equally scaled. Prasanta Chandra Mahalanobis (1936) introduced the Mahalanobis Distance to measure the distance of a point $x$ from a distribution centre $\\mu$ while explicitly accounting for the covariance structure $\\Sigma$: $D_M(x) = \\sqrt{(x - \\mu)^T \\Sigma^{-1} (x - \\mu)}$.",
      "Geometrically, Mahalanobis distance transforms spherical distance bubbles into ellipsoids that stretch and rotate along the principal axes of the data covariance cloud. Under multivariate normality, the squared Mahalanobis distance follows a Chi-square distribution with $p$ degrees of freedom ($D_M^2 \\sim \\chi_p^2$), enabling exact statistical hypothesis tests for outliers.",
      "However, standard empirical sample mean and sample covariance suffer from a fatal flaw: the Masking Effect. A small cluster of extreme outliers artificially drags the sample mean toward themselves and massively inflates the covariance matrix, making their own Mahalanobis distance appear deceptively small. Peter Rousseeuw resolved this with the Minimum Covariance Determinant (MCD / FastMCD), which finds the subset of $h$ observations whose covariance has the minimum determinant, providing a robust estimator with up to 50% breakdown point."
    ],
    analogy: "Imagine an aerial photograph of a busy railway track cutting diagonally across a countryside meadow. If you measure distance using Euclidean metric, a train car parked on the tracks 500 metres down the line is judged to be far away. A cow standing only 5 metres off the track is judged to be close. Mahalanobis distance measures distance along the tracks: moving 500 metres along the rail line is expected normal variance, but being 5 metres off the rail is a dangerous derailment.",
    steps: [
      {
        "title": "1. Centre data and examine correlation structure",
        "body": "Inspect feature matrix $X \\in \\mathbb{R}^{n \\times p}$. Identify linear dependencies and check whether data conforms reasonably to unimodal elliptical contours."
      },
      {
        "title": "2. Fit robust covariance via FastMCD (C-steps)",
        "body": "Select subset size $h \\approx 0.75 n$. Randomly draw initial subsets, calculate covariance, compute Mahalanobis distances for all points, and select the $h$ smallest points (C-step). Iterate until determinant converges."
      },
      {
        "title": "3. Calculate robust Mahalanobis distances",
        "body": "Evaluate robust distance: $D_{\\mathrm{MCD}}(x) = \\sqrt{(x - \\hat{\\mu}_{\\mathrm{MCD}})^T \\hat{\\Sigma}_{\\mathrm{MCD}}^{-1} (x - \\hat{\\mu}_{\\mathrm{MCD}})}$."
      },
      {
        "title": "4. Apply Chi-Square distribution cutoff",
        "body": "Flag sample $x_i$ as a multivariate anomaly if $D_{\\mathrm{MCD}}^2(x_i) > \\chi_{p, 1-\\alpha}^2$, where $\\alpha$ is the significance threshold (e.g. $\\alpha = 0.001$)."
      }
    ],
    math: [
      {
        "h": "Mahalanobis Distance Formulation",
        "tex": "D_M(x) = \\sqrt{(x - \\mu)^T \\Sigma^{-1} (x - \\mu)} = \\|\\Sigma^{-1/2} (x - \\mu)\\|_2",
        "p": "Measures distance in units of statistical standard deviations along the ellipsoidal axes of covariance matrix Sigma."
      },
      {
        "h": "Chi-Square Distribution of Squared Distance",
        "tex": "x \\sim \\mathcal{N}_p(\\mu, \\Sigma) \\implies D_M^2(x) = (x - \\mu)^T \\Sigma^{-1} (x - \\mu) \\sim \\chi_p^2",
        "p": "Under multivariate Gaussian assumptions, the squared Mahalanobis distance is distributed as Chi-square with p degrees of freedom, providing rigorous analytical p-values."
      },
      {
        "h": "Minimum Covariance Determinant (MCD) Objective",
        "tex": "\\min_{H \\subset \\{1, \\dots, n\\}, \\; |H| = h} \\det\\left(\\frac{1}{h - 1} \\sum_{i \\in H} (x_i - \\bar{x}_H) (x_i - \\bar{x}_H)^T\\right)",
        "p": "Searches for the subset of h observations (typically h = 0.5n or 0.75n) yielding the minimal determinant, resisting masking by up to 50% adversarial outliers."
      }
    ],
    code: "import numpy as np\nfrom scipy.stats import chi2\n\n# Mahalanobis Distance: Standard Empirical Covariance vs FastMCD C-Step from scratch\nnp.random.seed(42)\nn_samples = 300\np_dim = 2\n\n# 1. Generate correlated 2D Gaussian data\nmean_true = np.array([0.0, 0.0])\ncov_true = np.array([[2.0, 1.6],\n                     [1.6, 2.0]])  # Strong correlation (corr = 0.8)\nX_clean = np.random.multivariate_normal(mean_true, cov_true, n_samples)\n\n# 2. Inject a masked cluster of 15 severe multivariate outliers\n# Outliers violate the correlation: x1 and x2 have opposite signs!\nn_outliers = 15\noutliers = np.random.multivariate_normal(mean=[4.0, -4.0], cov=np.eye(2)*0.2, size=n_outliers)\nX = np.vstack([X_clean, outliers])\nN = len(X)\n\n# 3. Standard Empirical Mahalanobis Distance\nmu_emp = np.mean(X, axis=0)\ncov_emp = np.cov(X, rowvar=False)\ncov_emp_inv = np.linalg.inv(cov_emp)\ndiff_emp = X - mu_emp\nd_emp = np.sqrt(np.sum(diff_emp @ cov_emp_inv * diff_emp, axis=1))\n\n# 4. FastMCD C-Step Algorithm from scratch\nh = int(0.80 * N)  # Keep 80% cleanest data points\n# Initialise with subset of smallest distances to coordinate median\nmed = np.median(X, axis=0)\ninit_dist = np.linalg.norm(X - med, axis=1)\nH_indices = np.argsort(init_dist)[:h]\n\nfor c_step in range(15):\n    X_sub = X[H_indices]\n    mu_sub = np.mean(X_sub, axis=0)\n    cov_sub = np.cov(X_sub, rowvar=False) + np.eye(p_dim)*1e-6\n    cov_sub_inv = np.linalg.inv(cov_sub)\n    \n    # Compute Mahalanobis distance for ALL points with current sub-covariance\n    diff = X - mu_sub\n    d_mcd = np.sqrt(np.sum(diff @ cov_sub_inv * diff, axis=1))\n    \n    # Select h points with smallest distances\n    new_H = np.argsort(d_mcd)[:h]\n    if np.array_equal(new_H, H_indices):\n        break\n    H_indices = new_H\n\nmu_mcd = np.mean(X[H_indices], axis=0)\ncov_mcd = np.cov(X[H_indices], rowvar=False)\n# Apply consistency factor for Gaussian data\ncov_mcd *= 1.25\ncov_mcd_inv = np.linalg.inv(cov_mcd)\ndiff_mcd = X - mu_mcd\nd_mcd_final = np.sqrt(np.sum(diff_mcd @ cov_mcd_inv * diff_mcd, axis=1))\n\n# Chi-Square Cutoff for p=2 degrees of freedom (alpha = 0.001)\ncutoff = np.sqrt(chi2.ppf(0.999, df=p_dim))\n\noutlier_indices = np.arange(n_samples, N)\nmasked_detected_emp = np.sum(d_emp[outlier_indices] > cutoff)\nmasked_detected_mcd = np.sum(d_mcd_final[outlier_indices] > cutoff)\n\nprint(f\"Dataset: {N} total samples ({n_outliers} masked correlation-violating outliers)\")\nprint(f\"Chi-square 99.9% distance threshold: {cutoff:.3f}\")\nprint(f\"\\nStandard Empirical Estimator:\")\nprint(f\"  Detected outliers: {masked_detected_emp} / {n_outliers} (masking effect failed!)\")\nprint(f\"  Max outlier distance: {np.max(d_emp[outlier_indices]):.2f}\")\nprint(f\"\\nRobust Minimum Covariance Determinant (MCD):\")\nprint(f\"  Detected outliers: {masked_detected_mcd} / {n_outliers} (100% detected!)\")\nprint(f\"  Max outlier distance: {np.max(d_mcd_final[outlier_indices]):.2f} (cleanly exposed!)\")",
    keyPoints: [
      "Measures statistical distance from a multivariate distribution centre, accounting for correlation and unequal variance.",
      "Follows a Chi-square distribution ($D_M^2 \\sim \\chi_p^2$) under normality, providing exact analytical hypothesis tests.",
      "Standard sample covariance is corrupted by the Masking Effect: outliers inflate covariance, hiding their own anomalousness.",
      "Minimum Covariance Determinant (MCD / FastMCD) searches for the subset of $h$ samples minimising covariance determinant, resisting up to 50% outliers.",
      "Essential for multivariate quality control, financial fraud detection, and robust feature standardisation."
    ],
    pitfalls: [
      "Singular covariance matrix: When features are collinear or $p > n$, the covariance matrix $\\Sigma$ is non-invertible; pseudo-inversion or shrinkage (Ledoit–Wolf) is required.",
      "Multivariate non-normality: If data has heavy tails or multimodal clusters, applying $\\chi_p^2$ cutoffs flags legitimate extreme points as false positives.",
      "High-dimensional breakdown: MCD requires $n > 2p$; when $p$ is large relative to $n$, robust covariance estimation requires regularisation or projection pursuit."
    ],
    quiz: [
      {
        "q": "Why can two observations have the identical Euclidean distance from the data mean but radically different Mahalanobis distances?",
        "o": [
          "Because Mahalanobis distance scales distance by variance and correlation: moving along the direction of high covariance is normal, while moving perpendicular to correlation is anomalous",
          "Because Mahalanobis distance uses Manhattan L1 distance",
          "Because Euclidean distance cannot be used in more than 2 dimensions",
          "Because Mahalanobis distance sets negative coordinates to zero"
        ],
        "a": 0,
        "why": "Mahalanobis distance accounts for covariance. If two features are 99% correlated, a point off the correlation axis is an extreme outlier, whereas a point along the axis is normal variance."
      },
      {
        "q": "What is the \"masking effect\" in outlier detection with standard empirical covariance?",
        "o": [
          "Outliers inflate the sample covariance matrix and shift the mean toward themselves, artificially reducing their own Mahalanobis distance and hiding their presence",
          "Outliers cause the eigenvalues to become negative",
          "The distance formula divides by zero",
          "Data points with zero values mask other features"
        ],
        "a": 0,
        "why": "Because sample mean and covariance are non-robust, extreme outliers stretch the covariance ellipse toward themselves, lowering their computed Mahalanobis distance below detection cutoffs."
      }
    ],
    usedBy: [],
    prereq: [
      "ols-inference-t-tests-f-test-r2-and-adjusted-r2",
      "expectation-variance-and-covariance"
    ],
    related: [
      "one-class-svm",
      "local-outlier-factor",
      "chi-square-tests",
      "residual-diagnostics-and-heteroscedasticity"
    ],
    keywords: "mahalanobis distance, robust covariance, mcd, minimum covariance determinant, fastmcd, masking effect, chi square distribution, multivariate outlier"
  },
  {
    id: 'em-algorithm',
    short: 'EM algorithm',
    title: 'Expectation-Maximisation Algorithm',
    task: 'concepts',
    module: 'Probabilistic models',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`General iterative framework for finding maximum likelihood parameter estimates in probabilistic models with hidden latent variables or incomplete observations.`,
    lead: r`In many machine learning problems, the observed data depends on unobserved latent variables, such as unknown cluster memberships, hidden states, or missing sensor values. Directly maximising the marginal log-likelihood is intractable because the sum over latent variables appears inside the logarithm. The Expectation-Maximisation (EM) algorithm circumvents this by alternating between estimating the posterior distribution over latent states (E-step) and maximising the expected complete-data log-likelihood (M-step), guaranteeing non-decreasing likelihood at every iteration.`,
    intuition: [
      r`Suppose you run a survey measuring heights, but the survey accidentally omits whether each participant is male or female. The pooled data forms a bimodal curve—a mixture of two separate normal distributions. If you knew everyone's sex, computing the average height and variance for each group would be trivial (standard maximum likelihood). Conversely, if you already knew the true male and female averages, you could easily calculate the probability that any given participant is male or female. The dilemma is that you know neither.`,
      r`The EM algorithm resolves this chicken-and-egg deadlock through clever alternation. First, make an educated guess for the parameters (the group means and variances). In the Expectation step (E-step), use these guessed parameters to assign each participant a soft probabilistic responsibility—such as 85% chance female and 15% chance male for someone who is 162 cm tall.`,
      r`Next, in the Maximisation step (M-step), use these soft weights to re-estimate the group parameters. Instead of a hard binary assignment, each data point contributes fractionally to updating the means and variances of both groups. These updated parameters yield a better model, which in turn produces more accurate responsibilities in the next E-step. Mathematically, the E-step constructs a tight lower bound (the Evidence Lower Bound, or ELBO) on the log-likelihood function, and the M-step climbs to the peak of that bound. Repeating this cycle guarantees steady progress until reaching a local maximum.`,
    ],
    analogy: r`Alternately sharpening the focus on a twin-lens microscope: adjusting lens A sharpens the contrast of the image, which reveals the exact alignment needed to sharpen lens B, repeating until the entire specimen comes into crystal-clear resolution.`,
    steps: [
      r`Initialise the model parameters $\theta^{(0)}$ randomly or using a fast heuristic (such as $k$-means for mixture model centroids).`,
      r`Perform the Expectation step (E-step): compute the posterior probability distribution over latent variables given current parameters: $q^{(t)}(Z) = p(Z \mid X, \theta^{(t)})$.`,
      r`Formulate the expected complete-data log-likelihood (the $Q$-function): $Q(\theta \mid \theta^{(t)}) = \mathbb{E}_{Z \mid X, \theta^{(t)}} [\ln p(X, Z \mid \theta)]$.`,
      r`Perform the Maximisation step (M-step): update parameters by maximising the $Q$-function: $\theta^{(t+1)} = \arg\max_\theta Q(\theta \mid \theta^{(t)})$.`,
      r`Evaluate the marginal log-likelihood $\ln p(X \mid \theta^{(t+1)})$ or check parameter convergence $\\|\theta^{(t+1)} - \theta^{(t)}\\| < \epsilon$.`,
      r`Repeat the E-step and M-step until the improvement in log-likelihood drops below the convergence tolerance.`,
    ],
    math: [
      {
        h: 'Marginal log-likelihood decomposition and ELBO',
        tex: r`$$\ln p(X \mid \theta) = \sum_{Z} q(Z) \ln \frac{p(X, Z \mid \theta)}{q(Z)} + \sum_{Z} q(Z) \ln \frac{q(Z)}{p(Z \mid X, \theta)} = \operatorname{ELBO}(q, \theta) + \operatorname{KL}\big(q(Z) \parallel p(Z \mid X, \theta)\big)$$`,
        p: r`By Jensen's inequality, the Kullback–Leibler divergence $\operatorname{KL} \ge 0$, establishing that $\operatorname{ELBO}(q, \theta) \le \ln p(X \mid \theta)$ is a rigorous lower bound. In the E-step, setting $q(Z) = p(Z \mid X, \theta^{(t)})$ makes $\operatorname{KL} = 0$, causing the lower bound to touch the true log-likelihood exactly at $\theta^{(t)}$.`,
      },
      {
        h: 'The Q-function in the E-step',
        tex: r`$$Q\big(\theta \mid \theta^{(t)}\big) = \sum_{Z} p\big(Z \mid X, \theta^{(t)}\big) \ln p(X, Z \mid \theta)$$`,
        p: r`Evaluating the complete-data log-likelihood $\ln p(X, Z \mid \theta)$ moves the summation outside the logarithm. For Gaussian Mixture Models, this simplifies to computing soft responsibilities $\gamma_{ik} = \frac{\pi_k \mathcal{N}(x_i \mid \mu_k, \Sigma_k)}{\sum_j \pi_j \mathcal{N}(x_i \mid \mu_j, \Sigma_j)}$.`,
      },
      {
        h: 'Parameter update in the M-step',
        tex: r`$$\theta^{(t+1)} = \arg\max_{\theta} Q\big(\theta \mid \theta^{(t)}\big)$$`,
        p: r`Differentiating $Q$ with respect to $\theta$ and setting to zero yields closed-form analytical updates for exponential family distributions: $\mu_k = \frac{\sum_i \gamma_{ik} x_i}{\sum_i \gamma_{ik}}$ and $\Sigma_k = \frac{\sum_i \gamma_{ik}(x_i - \mu_k)(x_i - \mu_k)^T}{\sum_i \gamma_{ik}}$.`,
      },
    ],
    code: r`import numpy as np

# 1D two-component Gaussian mixture data
rng = np.random.default_rng(42)
X = np.concatenate([rng.normal(-2.0, 0.8, 100), rng.normal(3.0, 1.2, 100)])

# Initial guesses for weights, means, and variances
pi = np.array([0.5, 0.5])
mu = np.array([-0.5, 0.5])
var = np.array([1.0, 1.0])

for _ in range(50):
    # E-step: calculate responsibilities (posterior over latent cluster)
    pdf = np.exp(-0.5 * (X[:, None] - mu) ** 2 / var) / np.sqrt(2 * np.pi * var)
    gamma = (pdf * pi) / np.sum(pdf * pi, axis=1, keepdims=True)
    
    # M-step: update parameters via weighted maximum likelihood
    N_k = np.sum(gamma, axis=0)
    pi = N_k / len(X)
    mu = np.sum(gamma * X[:, None], axis=0) / N_k
    var = np.sum(gamma * (X[:, None] - mu) ** 2, axis=0) / N_k

ll = np.sum(np.log(np.sum(pi * np.exp(-0.5 * (X[:, None] - mu) ** 2 / var) / np.sqrt(2 * np.pi * var), axis=1)))
print(f"Estimated weights: {pi.round(3)}")
print(f"Estimated means: {mu.round(3)}")
print(f"Estimated stds: {np.sqrt(var).round(3)}")
print(f"Final log-likelihood: {ll:.2f}")`,
    pitfalls: [
      r`Convergence to local optima: The marginal log-likelihood surface is non-convex. EM is guaranteed to monotonically increase likelihood, but it can converge to suboptimal local maxima depending on initialisation. Multiple random restarts or $k$-means seeding are essential.`,
      r`Singularities and variance collapse: In Gaussian mixture models, if a single component's mean collapses onto a single data point, its variance approaches zero and its likelihood explodes to infinity. Regularising the covariance diagonal with a small ridge ($\sigma^2 + \epsilon$) prevents numerical explosion.`,
      r`Slow convergence near saddle points: EM has a first-order convergence rate, meaning progress can crawl when components overlap heavily or eigenvalues of the Fisher information matrix are near-zero.`,
      r`Intractable E-step for complex priors: In deep probabilistic models or non-conjugate Bayesian networks, calculating exact posterior responsibilities $p(Z \mid X, \theta)$ is intractable, necessitating Variational EM or Monte Carlo approximations.`,
    ],
    keyPoints: [
      r`Solves maximum likelihood estimation in models with unobserved latent variables or incomplete observations.`,
      r`Guarantees monotonic non-decrease of the marginal log-likelihood at every iteration ($\ln p(X \mid \theta^{(t+1)}) \ge \ln p(X \mid \theta^{(t)})$).`,
      r`Tightens the Evidence Lower Bound (ELBO) in the E-step and climbs to its peak in the M-step.`,
      r`Forms the mathematical foundation for Gaussian Mixture Models, Hidden Markov Models, and topic models.`,
    ],
    quiz: [
      {
        q: r`What mathematical property guarantees that the EM algorithm's log-likelihood never decreases from one iteration to the next?`,
        o: [
          r`The Central Limit Theorem`,
          r`Mercer's condition on kernel functions`,
          r`Jensen's inequality and the non-negativity of Kullback–Leibler divergence ($\operatorname{KL} \ge 0$)`,
          r`The Gauss-Markov theorem`,
        ],
        a: 2,
        why: r`Jensen's inequality guarantees that the Evidence Lower Bound (ELBO) is a valid lower bound on the marginal log-likelihood. In the E-step, setting $q(Z) = p(Z \mid X, \theta)$ drives $\operatorname{KL} = 0$, and the M-step maximises the ELBO, ensuring the log-likelihood monotonically increases or stays constant.`,
      },
      {
        q: r`What occurs during the Expectation step (E-step) of the EM algorithm?`,
        o: [
          r`Model parameters $\theta$ are updated via stochastic gradient descent`,
          r`All missing data points are permanently deleted from the dataset`,
          r`The covariance matrix is inverted using Singular Value Decomposition`,
          r`The posterior probability distribution over latent variables $p(Z \mid X, \theta^{(t)})$ is computed using current parameter estimates`,
        ],
        a: 3,
        why: r`The E-step calculates the conditional distribution of the hidden latent variables given the observed data and current parameters, computing the expected values (responsibilities) needed for the M-step.`,
      },
      {
        q: r`Why is directly maximising the marginal log-likelihood $\ln p(X \mid \theta) = \sum_i \ln \big(\sum_z p(x_i, z \mid \theta)\big)$ analytically difficult without EM?`,
        o: [
          r`The summation over latent states $z$ appears inside the logarithm, preventing clean differentiation and closed-form solutions`,
          r`The marginal log-likelihood is always equal to zero`,
          r`The log-likelihood function has no gradient at any point`,
          r`Exponential distributions cannot be evaluated inside logarithms`,
        ],
        a: 0,
        why: r`When a sum appears inside a logarithm, expanding the derivative yields coupled equations where parameters cannot be isolated into independent closed-form maximum likelihood solutions.`,
      },
      {
        q: r`What is a well-known failure mode when fitting Gaussian Mixture Models with EM without covariance regularisation?`,
        o: [
          r`The algorithm always diverges to negative infinity in the first step`,
          r`A Gaussian component can collapse onto a single data point, driving its variance to zero and causing the likelihood to explode to infinity`,
          r`The mixture weights are forced to be negative`,
          r`The number of clusters $k$ automatically doubles at every iteration`,
        ],
        a: 1,
        why: r`If a Gaussian component centres exactly on an isolated sample and captures only that point, its sample variance shrinks toward 0. The normal density $\frac{1}{\sqrt{2\pi\sigma^2}} \to \infty$, creating a numerical singularity.`,
      },
    ],
    usedBy: ['gaussian_mixture_models'],
    prereq: ['maximum-likelihood-estimation', 'gaussian_mixture_models'],
    related: ['gaussian_mixture_models', 'maximum-likelihood-estimation', 'kmeans_clustering'],
    keywords: 'em expectation maximisation algorithm latent variables gmm gaussian mixture elbo posterior responsibilities maximum likelihood',
  },
  {
    id: "bayesian-networks",
    short: "Bayesian networks",
    title: "Bayesian Networks and Directed Graphical Models",
    task: "concepts",
    module: "Probabilistic models",
    level: 2,
    minutes: 18,
    noLab: true,
    summary: "Represent complex joint probability distributions compactly using Directed Acyclic Graphs: master conditional independence, d-separation, and belief propagation.",
    lead: "A joint distribution over N discrete variables requires 2^N - 1 parameters, causing exponential intractability. Bayesian Networks exploit conditional independence encoded in directed graphs to factorise joint probabilities into compact local conditional probability tables (CPTs).",
    intuition: [
      "A full joint probability distribution over $N$ binary random variables requires specifying $2^N - 1$ independent probability values. For a medical diagnostic system or financial risk engine with 50 variables, storing the joint distribution would require over $10^{15}$ parameters—vastly exceeding the capacity of any computer and requiring impossible amounts of training data.",
      "Fortunately, real-world random variables are not all directly dependent on each other: lung cancer depends directly on smoking and radon exposure, but is conditionally independent of age given smoking history and cellular DNA damage. Bayesian Networks (pioneered by Judea Pearl in the 1980s) formalise these structural independencies using Directed Acyclic Graphs (DAGs).",
      "In a Bayesian Network, each node represents a random variable, and directed edges represent direct probabilistic or causal dependencies. The fundamental local Markov property dictates that each node $X_i$ is conditionally independent of all its non-descendants given its parents: $P(X_1, \\dots, X_n) = \\prod_{i=1}^n P(X_i \\mid \\operatorname{Parents}(X_i))$.",
      "This factorization slashes parameter complexity from exponential $O(2^N)$ to linear or polynomial $O(N \\cdot 2^k)$, where $k$ is the maximum number of parents per node. Furthermore, Pearl's graphical d-separation criterion provides an exact topological algorithm to read off whether any two sets of variables are conditionally independent given observed evidence, enabling exact probabilistic inference via Variable Elimination or Belief Propagation."
    ],
    analogy: "Imagine a corporate hierarchy with a CEO, department managers, team leads, and interns. If an intern needs to know company policy on travel expenses, they ask their direct team lead. Once the team lead gives the instruction, knowing the personal mood of the CEO or the managers in other departments provides zero additional information. The team lead acts as the parent node, shielding the intern from all non-descendants.",
    steps: [
      {
        "title": "1. Define variables and construct DAG structure",
        "body": "Identify domain random variables and construct Directed Acyclic Graph $G = (V, E)$, ensuring no directed cyclical loops exist."
      },
      {
        "title": "2. Populate Conditional Probability Tables (CPTs)",
        "body": "For each node $X_i$, specify local distribution $P(X_i \\mid \\operatorname{Pa}(X_i))$. For discrete variables, populate CPTs empirically or via expert elicitation."
      },
      {
        "title": "3. Test conditional independence via d-separation",
        "body": "Evaluate whether query nodes $X$ and $Y$ are d-separated given evidence set $Z$ by checking paths across causal chains ($A \\to B \\to C$), forks ($A \\leftarrow B \\to C$), and colliders ($A \\to B \\leftarrow C$)."
      },
      {
        "title": "4. Perform probabilistic inference (Variable Elimination)",
        "body": "Compute posterior $P(Query \\mid Evidence)$ by setting observed variables to evidence values, multiplying relevant factors, and summing out (marginalising) unobserved nuisance variables."
      }
    ],
    math: [
      {
        "h": "Bayesian Network Joint Factorisation Chain Rule",
        "tex": "P(X_1, \\dots, X_n) = \\prod_{i=1}^n P(X_i \\mid \\operatorname{Pa}(X_i))",
        "p": "The joint probability factorises into the product of local conditional distributions for each node conditioned only on its immediate parent set Pa(X_i)."
      },
      {
        "h": "The Three Canonical d-Separation Motifs",
        "tex": "\\begin{aligned} \\text{Chain: } & A \\to B \\to C & (A \\perp C \\mid B) \\\\ \\text{Fork: } & A \\leftarrow B \\to C & (A \\perp C \\mid B) \\\\ \\text{Collider: } & A \\to B \\leftarrow C & (A \\perp C \\mid \\emptyset, \\; A \\not\\perp C \\mid B) \\end{aligned}",
        "p": "Chains and forks are blocked when middle node B is observed. Colliders are naturally blocked, but become UNBLOCKED (active) when collider B or its descendant is observed (explaining away)."
      },
      {
        "h": "Variable Elimination Factor Marginalisation",
        "tex": "\\phi_{\\mathrm{new}}(Y) = \\sum_{X} \\prod_{k \\in \\mathcal{F}_X} \\phi_k(X, Y)",
        "p": "Inference operation: multiplies all probability factors involving variable X and sums out X, leaving a reduced factor over remaining variables Y."
      }
    ],
    code: "import numpy as np\n\n# Exact Variable Elimination on a Classic 4-Node Bayesian Network\n# Structure: Burglar (B) -> Alarm (A) <- Earthquake (E)\n#                          Alarm (A) -> JohnCalls (J)\n\n# 1. Define Prior and Conditional Probability Tables (CPTs)\n# B in {0, 1}, E in {0, 1}, A in {0, 1}, J in {0, 1}\nP_B = np.array([0.999, 0.001])         # P(B=0), P(B=1)\nP_E = np.array([0.998, 0.002])         # P(E=0), P(E=1)\n\n# P(A=1 | B, E): shape (2, 2) where index is [B, E]\nP_A_given_BE = np.array([\n    [0.001, 0.290],  # B=0: E=0 -> 0.001, E=1 -> 0.29\n    [0.940, 0.950]   # B=1: E=0 -> 0.940, E=1 -> 0.95\n])\n\n# P(J=1 | A): shape (2,) where index is [A]\nP_J_given_A = np.array([0.05, 0.90])   # A=0 -> 0.05, A=1 -> 0.90\n\n# 2. Query: What is P(Burglary = 1 | JohnCalls = 1)?\n# P(B, J=1) = sum_E sum_A P(B) * P(E) * P(A | B, E) * P(J=1 | A)\n\njoint_B_J = np.zeros(2)\n\nfor b in [0, 1]:\n    prob_b = 0.0\n    for e in [0, 1]:\n        for a in [0, 1]:\n            # P(B=b)\n            p_b = P_B[b]\n            # P(E=e)\n            p_e = P_E[e]\n            # P(A=a | B=b, E=e)\n            p_a = P_A_given_BE[b, e] if a == 1 else (1.0 - P_A_given_BE[b, e])\n            # P(J=1 | A=a)\n            p_j = P_J_given_A[a]\n            \n            prob_b += p_b * p_e * p_a * p_j\n    joint_B_J[b] = prob_b\n\n# Normalise by P(J=1)\nposterior_B_given_J = joint_B_J / np.sum(joint_B_J)\n\n# 3. Demonstrate \"Explaining Away\" (Collider behaviour)\n# What if we now observe Earthquake = 1? Does P(Burglary = 1) drop?\njoint_B_J_E = np.zeros(2)\nfor b in [0, 1]:\n    prob_b = 0.0\n    e = 1  # Given Earthquake = 1\n    for a in [0, 1]:\n        p_b = P_B[b]\n        p_e = P_E[e]\n        p_a = P_A_given_BE[b, e] if a == 1 else (1.0 - P_A_given_BE[b, e])\n        p_j = P_J_given_A[a]\n        prob_b += p_b * p_e * p_a * p_j\n    joint_B_J_E[b] = prob_b\n\nposterior_B_given_J_E = joint_B_J_E / np.sum(joint_B_J_E)\n\nprint(f\"Prior P(Burglary = 1):                {P_B[1]:.4f} (0.1%)\")\nprint(f\"Posterior P(Burglary = 1 | JohnCalls=1): {posterior_B_given_J[1]:.4f} ({posterior_B_given_J[1]*100:.1f}%)\")\nprint(f\"Posterior P(Burglary = 1 | JohnCalls=1, Earthquake=1): {posterior_B_given_J_E[1]:.4f} ({posterior_B_given_J_E[1]*100:.1f}%)\")\nprint(f\"Explaining Away Effect: Learning Earthquake occurred reduced Burglary probability by {((posterior_B_given_J[1] - posterior_B_given_J_E[1])/posterior_B_given_J[1])*100:.1f}%\")",
    keyPoints: [
      "Compactly parameterises complex joint distributions using Directed Acyclic Graphs (DAGs) and local conditional probabilities.",
      "Reduces exponential parameter complexity $O(2^N)$ to polynomial scale by exploiting conditional independence.",
      "The local Markov property guarantees each variable is independent of non-descendants given its parents.",
      "d-separation provides a topological algorithm to determine conditional independence across chains, forks, and colliders.",
      "Colliders ($A \\to B \\leftarrow C$) exhibit \"explaining away\": observing $B$ induces conditional dependence between independent causes $A$ and $C$."
    ],
    pitfalls: [
      "Confusing conditional independence with marginal independence: In a collider ($A \\to B \\leftarrow C$), $A$ and $C$ are marginally independent, but conditioning on $B$ makes them dependent.",
      "Inference complexity on loopy graphs: Exact inference via variable elimination or junction tree is NP-hard in general graphs with high tree-width, requiring approximate MCMC or loopy belief propagation.",
      "Causal over-interpretation: A Bayesian network models statistical conditional independence; inferring true causal counterfactuals requires Pearl do-calculus and intervention assumptions."
    ],
    quiz: [
      {
        "q": "In the collider structure A -> B <- C, what happens to the independence between A and C when B is observed?",
        "o": [
          "A and C were marginally independent, but observing B (or any descendant of B) creates conditional dependence between them (explaining away)",
          "A and C become strictly independent",
          "A and C become identical variables",
          "B becomes independent of both A and C"
        ],
        "a": 0,
        "why": "In a collider, A and C are marginally independent. Observing the common effect B creates an explaining-away coupling: knowing A occurred explains B, lowering the probability of C."
      },
      {
        "q": "How does a Bayesian Network reduce the number of parameters required to specify a joint distribution over N binary variables?",
        "o": [
          "By factorising P(X_1, ..., X_N) into a product of local CPTs P(X_i | Parents(X_i)), scaling with parent count rather than total variable count",
          "By setting all probabilities to equal values",
          "By converting binary variables into continuous variables",
          "By computing the SVD of the graph adjacency matrix"
        ],
        "a": 0,
        "why": "Instead of storing all 2^N - 1 states, each node only stores probabilities conditioned on its immediate parents, reducing complexity to O(N * 2^k) where k is max parent count."
      }
    ],
    usedBy: [],
    prereq: [
      "probability-rules-and-bayes-theorem"
    ],
    related: [
      "probability-rules-and-bayes-theorem",
      "causal-graphs-dags-and-adjustment",
      "markov-random-fields",
      "markov-chains-and-stationary-distributions"
    ],
    keywords: "bayesian networks, directed graphical models, conditional independence, d-separation, variable elimination, explaining away, cpts, belief propagation"
  },
];
