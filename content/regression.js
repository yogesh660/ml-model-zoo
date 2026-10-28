// Regression path. Every string is String.raw so LaTeX backslashes survive.
// Inline links: [[lesson-id]] or [[lesson-id|text]] are turned into links at build time.
const r = String.raw;

module.exports = [
  // ------------------------------------------------------------------ linear models
  {
    id: 'ols_linear_regression', short: 'Linear regression (OLS)', title: 'Ordinary Least Squares Linear Regression',
    task: 'regression', module: 'Linear models', level: 1, minutes: 18,
    summary: r`The baseline every regression model is measured against: a straight-line fit chosen to minimise squared error.`,
    lead: r`Draw the line (or hyperplane) that makes the sum of squared vertical distances to the data as small as possible. That is the whole idea, and it has a closed-form answer.`,
    intuition: [
      r`Imagine every data point is tied to a rigid rod by a spring that only stretches vertically. The rod settles where the total spring energy is smallest. Because spring energy grows with the <em>square</em> of the stretch, a point twice as far away pulls four times as hard. That is why OLS is sensitive to outliers, and why it has such clean maths.`,
      r`With $p$ features the prediction is $\hat y = \beta_0 + \beta_1 x_1 + \dots + \beta_p x_p$. Each coefficient reads as "how much $\hat y$ moves when this feature moves by one unit and every other feature stays put". That reading is the main reason linear regression is still the first model people reach for: it explains itself.`,
    ],
    analogy: r`Fitting a ruler to a scatter of pins, where every pin is attached to the ruler by a spring.`,
    steps: [
      r`Stack the features into a design matrix $X$ (one row per example) and add a column of ones for the intercept.`,
      r`Write the loss as the residual sum of squares: $\lVert y - X\beta \rVert^2$.`,
      r`Take the gradient with respect to $\beta$ and set it to zero. This gives the normal equations $X^\top X\beta = X^\top y$.`,
      r`Solve them, in practice with a QR or SVD decomposition rather than an explicit matrix inverse, because that is numerically safer.`,
      r`Check the residuals: they should look like structureless noise. A pattern in the residuals means the model is missing something.`,
    ],
    math: [
      { h: 'The objective', tex: r`$$\hat\beta = \arg\min_\beta \; \lVert y - X\beta\rVert_2^2 = \arg\min_\beta \sum_{i=1}^n \big(y_i - x_i^\top \beta\big)^2$$`, p: r`Squared error is smooth and convex, so there is exactly one minimum when the columns of $X$ are linearly independent.` },
      { h: 'Setting the gradient to zero', tex: r`$$\nabla_\beta = -2X^\top(y - X\beta) = 0 \;\;\Longrightarrow\;\; \hat\beta = (X^\top X)^{-1}X^\top y$$`, p: r`Geometrically, $\hat y = X\hat\beta$ is the orthogonal projection of $y$ onto the space spanned by the columns of $X$. The residual vector is perpendicular to every feature.` },
      { h: 'How good is the fit?', tex: r`$$R^2 = 1 - \frac{\sum_i (y_i - \hat y_i)^2}{\sum_i (y_i - \bar y)^2}$$`, p: r`$R^2$ is the share of the variance in $y$ that the model explains. 0 means "no better than predicting the mean", 1 means a perfect fit. See [[regression-metrics]] for when it misleads.` },
    ],
    hyper: [
      ['fit_intercept', r`Whether to learn $\beta_0$.`, 'Keep it on unless the data is already centred.'],
      ['Feature scaling', 'Does not change predictions for plain OLS.', 'Still useful for reading coefficient sizes side by side, and required once you add a penalty.'],
    ],
    pros: ['Closed-form, fast and deterministic.', 'Coefficients are directly interpretable.', 'Comes with standard errors and confidence intervals under its assumptions.', 'A strong, honest baseline for any regression problem.'],
    cons: ['Only captures linear relationships unless you engineer features.', 'Squared loss lets a few outliers drag the line.', 'Coefficients become unstable when features are highly correlated (multicollinearity).', 'Breaks down when there are more features than rows.'],
    use: r`You need an interpretable baseline, the relationship is roughly linear, or stakeholders need to read the coefficients.`,
    avoid: r`The signal is clearly non-linear, there are strong outliers, or features far outnumber examples. Reach for [[ridge_regression]], [[robust_regression]] or a tree model instead.`,
    complexity: [r`$O(np^2 + p^3)$`, r`$O(p)$ per row`],
    glance: { learns: 'One weight per feature + intercept', family: 'Linear, closed form' },
    code: r`import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

df = pd.read_csv("datasets/raw/california_housing.csv")
X, y = df.drop(columns="MedHouseVal"), df["MedHouseVal"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression().fit(X_tr, y_tr)
pred = model.predict(X_te)
print("RMSE", mean_squared_error(y_te, pred) ** 0.5, "R2", r2_score(y_te, pred))
print(dict(zip(X.columns, model.coef_.round(3))))`,
    pitfalls: [
      r`Reading coefficients as causal effects. A coefficient tells you about association with everything else held fixed in <em>this</em> data, nothing more.`,
      r`Comparing raw coefficient sizes across features measured in different units. Standardise first if you want to compare them.`,
      r`Ignoring correlated features. Two near-duplicate columns can get huge coefficients with opposite signs; check the variance inflation factor (VIF).`,
    ],
    quiz: [
      { q: r`Why does one far-away outlier move an OLS line so much?`, o: [r`Because the loss squares each residual, so large errors dominate`, r`Because OLS uses gradient descent with a large learning rate`, r`Because the intercept is fixed at zero`, r`Because OLS ignores points far from the mean`], a: 0, why: r`A residual of 10 contributes 100 to the loss while ten residuals of 1 contribute 10 in total. The fit bends toward the outlier to shrink that one huge term.` },
      { q: r`In the normal equation $\hat\beta = (X^\top X)^{-1}X^\top y$, what makes $X^\top X$ hard to invert?`, o: [r`Too many rows`, r`Features that are (nearly) linear combinations of each other`, r`A target with a large variance`, r`Using an intercept`], a: 1, why: r`Collinear columns make $X^\top X$ (nearly) singular. Small changes in the data then produce wild swings in $\hat\beta$. Ridge regression fixes this by adding $\lambda I$.` },
      { q: r`An $R^2$ of 0 on the test set means:`, o: [r`The model is perfect`, r`The model does no better than always predicting the mean`, r`The model predicts the exact opposite of the target`, r`The features are uncorrelated with each other`], a: 1, why: r`$R^2$ compares your errors with the errors of the constant mean prediction. It can even go negative on test data when the model is worse than that.` },
    ],
    related: ['polynomial_regression', 'ridge_regression', 'robust_regression'],
    prereq: ['cost-vs-loss-vs-error', 'loss-functions'],
    concepts: ['regression-metrics', 'bias-variance-tradeoff', 'gradient-descent'],
    explainer: 'ols', architecture: 'linreg',
    archIntro: r`The full workflow of a linear regression, from raw table to a model you can trust, fitted on this repository’s California housing sample. Hover over any stage or tag (or tap it on a phone) for what it does, its shape and the real numbers from the fit.`,
    labIntro: r`Click on the plot to add points and drag them around. The line is refitted instantly with the closed-form solution; dashed lines are the residuals being squared.`,
    tryThis: [r`Add one point far above the others and watch how far the line tilts toward it.`, r`Press <em>Run gradient descent</em> to watch the same answer being found iteratively.`, r`Make the cloud vertical: $R^2$ falls even though the line still minimises squared error.`],
    keywords: 'least squares normal equation linear baseline coefficients residuals',
  },
  {
    id: 'polynomial_regression', short: 'Polynomial regression', title: 'Polynomial Regression',
    task: 'regression', module: 'Linear models', level: 1, minutes: 15,
    summary: r`Still linear regression, but on powers of the input, so the fitted curve can bend. The classic way to see overfitting happen.`,
    lead: r`Add $x^2, x^3, \dots, x^d$ as new features and run ordinary least squares on them. The model is linear in its weights, but the curve it draws is not.`,
    intuition: [
      r`A straight line cannot follow a hump. Give the model $x^2$ as an extra column and it can learn a parabola; give it $x^3$ and it can learn an S-bend. The fitting machinery does not change at all: it is still [[ols_linear_regression|OLS]], solved with the same normal equations.`,
      r`The degree $d$ is a dial between underfitting and overfitting. Low degrees are too stiff to follow the signal. High degrees have enough freedom to pass through every noisy point and then swing wildly between them. Watching training error fall while test error rises as you turn this dial is the clearest picture of the [[bias-variance-tradeoff]].`,
    ],
    analogy: r`A flexible ruler: the higher the degree, the bendier the ruler, until it can be bent to touch every pin, including the ones that are just noise.`,
    steps: [
      r`Expand each input into $[1, x, x^2, \dots, x^d]$ (with several inputs, also include interaction terms such as $x_1x_2$).`,
      r`Scale the expanded features; high powers have wildly different ranges.`,
      r`Fit ordinary least squares, or ridge if the degree is high.`,
      r`Choose $d$ with [[cross-validation]], not with training error, which always falls as $d$ grows.`,
    ],
    math: [
      { h: 'The model', tex: r`$$\hat y = \beta_0 + \beta_1 x + \beta_2 x^2 + \dots + \beta_d x^d = \phi(x)^\top \beta$$`, p: r`$\phi(x)$ is the feature map. Because $\hat y$ is linear in $\beta$, the OLS solution $\hat\beta = (\Phi^\top\Phi)^{-1}\Phi^\top y$ still applies, with $\Phi$ the expanded design matrix.` },
      { h: 'Why high degree explodes', tex: r`$$\text{features for } p \text{ inputs at degree } d: \;\binom{p+d}{d}$$`, p: r`With 10 inputs and degree 3 that is already 286 columns. The columns $x^7, x^8, x^9$ are also nearly collinear, which makes $\Phi^\top\Phi$ ill-conditioned and the coefficients huge. Regularisation is the usual cure.` },
    ],
    hyper: [
      ['degree', 'Maximum power of each input.', '2–4 is typical. Pick by cross-validation.'],
      ['interaction_only', 'Keep only cross terms like $x_1x_2$, no pure powers.', 'Useful when effects combine but do not curve.'],
      ['include_bias', 'Adds the constant column.', 'Turn off if the regressor fits its own intercept.'],
    ],
    pros: ['Captures smooth curvature with a model you already understand.', 'Still closed-form and fast for low degrees.', 'Great teaching tool for under- and overfitting.'],
    cons: ['Feature count explodes with many inputs.', 'Wild behaviour at the edges of the data and beyond (Runge’s phenomenon).', 'High-degree terms are collinear and unstable without regularisation.'],
    use: r`One or two inputs with a smooth, curved relationship, and you want something interpretable.`,
    avoid: r`Many inputs, or you need to extrapolate. Splines, GAMs or tree ensembles are safer.`,
    complexity: [r`$O(n\,m^2 + m^3)$, $m$ = expanded features`, r`$O(m)$`],
    glance: { learns: 'One weight per polynomial term', family: 'Linear in a feature map' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import Ridge
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(PolynomialFeatures(include_bias=False), StandardScaler(), Ridge(alpha=1.0))
search = GridSearchCV(pipe, {"polynomialfeatures__degree": [1, 2, 3, 4]}, cv=5,
                      scoring="neg_root_mean_squared_error")
search.fit(X_tr, y_tr)
print(search.best_params_, -search.best_score_)`,
    pitfalls: [r`Choosing the degree by training error. It always prefers the highest degree.`, r`Forgetting to scale: $x^5$ for $x = 100$ is $10^{10}$, which wrecks numerical precision.`, r`Extrapolating. A degree-6 polynomial heads to $\pm\infty$ just outside the training range.`],
    quiz: [
      { q: r`Is polynomial regression a linear model?`, o: [r`No, it fits curves so it is non-linear`, r`Yes: it is linear in the coefficients, so OLS still applies`, r`Only when the degree is 1`, r`Only with regularisation`], a: 1, why: r`"Linear" refers to the parameters. The curve in $x$ bends, but $\hat y$ is a weighted sum of fixed features, so all of linear regression’s machinery still works.` },
      { q: r`You raise the degree from 3 to 12. Training RMSE drops sharply, test RMSE rises. This is:`, o: [r`Underfitting`, r`Overfitting (high variance)`, r`Data leakage`, r`A bug in the solver`], a: 1, why: r`The model now has enough freedom to fit noise in the training set, and that noise does not repeat in new data.` },
      { q: r`Why is ridge often paired with high-degree polynomial features?`, o: [r`It makes training faster`, r`It shrinks the large, unstable coefficients caused by collinear power terms`, r`It removes the need for scaling`, r`It selects the best degree automatically`], a: 1, why: r`Columns like $x^8$ and $x^9$ are almost collinear. The $\lambda I$ term keeps $\Phi^\top\Phi + \lambda I$ well conditioned and the curve calm.` },
    ],
    related: ['ols_linear_regression', 'ridge_regression', 'gaussian_process_regressor'],
    prereq: ['ols_linear_regression'],
    concepts: ['bias-variance-tradeoff', 'cross-validation', 'regularization'],
    labIntro: r`A noisy sine wave, split into training points (filled) and held-out test points (hollow). Turn the degree up and watch the two error curves part ways.`,
    tryThis: [r`Find the degree where test RMSE is lowest. That is the sweet spot of the bias–variance trade-off.`, r`Push the degree to 15 and look at the edges of the plot.`, r`Switch on ridge with a small $\lambda$ at degree 15: the curve calms down without lowering the degree.`],
    keywords: 'polynomial features degree overfitting curve fitting runge',
  },
  {
    id: 'ridge_regression', short: 'Ridge regression', title: 'Ridge Regression (L2 Regularisation)',
    task: 'regression', module: 'Linear models', level: 2, minutes: 16,
    summary: r`Linear regression with a penalty on the size of the coefficients. Trades a little bias for a big drop in variance.`,
    lead: r`Ridge is OLS with one extra term: it also pays for large coefficients, $\lambda\lVert\beta\rVert_2^2$. The result is a smoother, more stable model that copes with correlated features.`,
    intuition: [
      r`When two features carry almost the same information, OLS can give one a coefficient of $+50$ and the other $-49$: they cancel on the training data, but the model is fragile. Ridge says "big weights cost money", so it prefers spreading the effect evenly, $+0.5$ and $+0.5$.`,
      r`The penalty strength $\lambda$ (called <code>alpha</code> in scikit-learn) slides the model from plain OLS ($\lambda = 0$) toward predicting a constant ($\lambda \to \infty$). Somewhere in between, test error is lowest. Coefficients shrink smoothly toward zero but never reach it exactly; for exact zeros, see [[lasso_regression]].`,
    ],
    analogy: r`A budget on how loudly each feature is allowed to speak. Nobody is silenced, but nobody gets to shout.`,
    steps: [
      r`Standardise the features. The penalty treats every coefficient equally, so features must be on comparable scales.`,
      r`Minimise squared error plus $\lambda$ times the sum of squared coefficients (the intercept is not penalised).`,
      r`Solve in closed form: $(X^\top X + \lambda I)\beta = X^\top y$.`,
      r`Pick $\lambda$ by cross-validation on a log grid, e.g. $10^{-3}$ to $10^{3}$.`,
    ],
    math: [
      { h: 'Penalised objective', tex: r`$$\hat\beta_{\text{ridge}} = \arg\min_\beta \;\lVert y - X\beta\rVert_2^2 + \lambda \lVert\beta\rVert_2^2$$`, p: r`The second term is a [[regularization|regulariser]]. Its only job is to punish complexity.` },
      { h: 'Closed form', tex: r`$$\hat\beta_{\text{ridge}} = (X^\top X + \lambda I)^{-1} X^\top y$$`, p: r`Adding $\lambda I$ lifts every eigenvalue of $X^\top X$ by $\lambda$, so the matrix is always invertible, even with more features than rows.` },
      { h: 'Shrinkage in the eigenbasis', tex: r`$$\hat y = \sum_j u_j \frac{d_j^2}{d_j^2 + \lambda} u_j^\top y$$`, p: r`Using the SVD $X = UDV^\top$: directions with small singular values $d_j$ (the noisy, collinear ones) get shrunk the most. That is exactly where OLS was unstable.` },
      { h: 'Bayesian reading', tex: r`$$\beta \sim \mathcal N(0, \tau^2 I) \;\Rightarrow\; \text{MAP estimate} = \hat\beta_{\text{ridge}},\;\; \lambda = \sigma^2/\tau^2$$`, p: r`Ridge is the most likely $\beta$ under a Gaussian prior centred at zero. See [[bayesian_linear_regression]].` },
    ],
    hyper: [
      [r`alpha ($\lambda$)`, 'Penalty strength.', 'Search a log grid; RidgeCV does it efficiently.'],
      ['solver', 'How the system is solved.', '"auto" is fine. "svd" or "cholesky" for small data, "sag"/"saga" for large.'],
    ],
    pros: ['Stable when features are correlated.', 'Always has a unique solution, even when $p > n$.', 'Still closed-form and very fast.', 'Usually beats OLS on test data.'],
    cons: ['Keeps every feature: no automatic selection.', 'Coefficients are biased toward zero, so they are harder to read as effect sizes.', 'Needs feature scaling.'],
    use: r`Many correlated features, or more features than you would like for the number of rows, and you want to keep all of them.`,
    avoid: r`You believe only a handful of features matter and want the model to pick them: use [[lasso_regression]] or [[elastic_net]].`,
    complexity: [r`$O(np^2 + p^3)$`, r`$O(p)$`],
    glance: { learns: 'Shrunken weights + intercept', family: 'Linear, L2 penalty' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import RidgeCV
import numpy as np

model = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 25)))
model.fit(X_tr, y_tr)
print("chosen alpha:", model[-1].alpha_)`,
    pitfalls: [r`Skipping standardisation, so the penalty unfairly crushes features measured in small units.`, r`Penalising the intercept (scikit-learn does not, but hand-written code often does).`, r`Choosing alpha on the test set. Use cross-validation on the training data.`],
    quiz: [
      { q: r`What happens to ridge coefficients as $\lambda \to \infty$?`, o: [r`They become exactly zero one by one`, r`They all shrink toward zero, and the model predicts the mean`, r`They grow without bound`, r`They equal the OLS coefficients`], a: 1, why: r`The penalty dominates, so every slope is squeezed toward 0 (smoothly, never exactly), leaving only the unpenalised intercept: the mean of $y$.` },
      { q: r`Why can ridge be solved when there are more features than rows?`, o: [r`It drops the extra features`, r`Adding $\lambda I$ makes $X^\top X + \lambda I$ invertible`, r`It uses gradient descent instead`, r`It cannot`], a: 1, why: r`$X^\top X$ is singular when $p > n$, but adding $\lambda > 0$ to its diagonal makes every eigenvalue positive.` },
      { q: r`Which statement about ridge vs lasso is right?`, o: [r`Ridge sets weak features exactly to zero`, r`Lasso shrinks but never zeroes coefficients`, r`Ridge shrinks smoothly; lasso can produce exact zeros`, r`They give identical models`], a: 2, why: r`The L2 penalty is smooth at zero, so there is no pull to land exactly on it. The L1 penalty has a corner at zero that captures coefficients.` },
    ],
    related: ['lasso_regression', 'elastic_net', 'bayesian_linear_regression'],
    prereq: ['ols_linear_regression', 'regularization'],
    concepts: ['regularization', 'bias-variance-tradeoff', 'cross-validation'],
    labIntro: r`A degree-9 polynomial fitted to 14 noisy points. On the left, the curve; on the right, the size of each coefficient. Slide $\lambda$ and watch both calm down.`,
    tryThis: [r`At $\lambda \approx 0$ the curve whips around and coefficients are enormous. Increase $\lambda$ until test RMSE bottoms out.`, r`Notice that no coefficient bar ever hits exactly zero, however high you go.`, r`Compare with the lasso lesson using the same slider position.`],
    keywords: 'ridge l2 shrinkage tikhonov multicollinearity penalty alpha',
  },
  {
    id: 'lasso_regression', short: 'Lasso regression', title: 'Lasso Regression (L1 Regularisation)',
    task: 'regression', module: 'Linear models', level: 2, minutes: 16,
    summary: r`A linear model that switches off unhelpful features by driving their coefficients to exactly zero.`,
    lead: r`Lasso swaps ridge’s squared penalty for an absolute-value one, $\lambda\lVert\beta\rVert_1$. That small change means weak features get coefficients of exactly zero: built-in feature selection.`,
    intuition: [
      r`Think of each coefficient as having to pay a flat fee per unit of size. For a feature that only helps a little, the fee is never worth it, so the cheapest choice is to set its weight to precisely zero. Ridge’s fee grows with the square, so it is almost free near zero and nothing ever gets switched off completely.`,
      r`The geometric picture: the L1 constraint region is a diamond with corners on the axes. The elliptical contours of the squared error usually touch the diamond first at a corner, and a corner means some coefficients are zero. With the round L2 ball there are no corners to hit.`,
    ],
    analogy: r`A strict editor with a word budget: weak sentences are not shortened, they are cut entirely.`,
    steps: [
      r`Standardise features so the penalty is fair across them.`,
      r`Minimise squared error plus $\lambda\sum_j|\beta_j|$.`,
      r`There is no closed form; solve with coordinate descent, cycling through the coefficients and applying soft-thresholding to each one.`,
      r`Choose $\lambda$ by cross-validation; the non-zero coefficients that remain are your selected features.`,
    ],
    math: [
      { h: 'Objective', tex: r`$$\hat\beta_{\text{lasso}} = \arg\min_\beta \;\frac{1}{2n}\lVert y - X\beta\rVert_2^2 + \lambda\lVert\beta\rVert_1$$`, p: r`The absolute value is not differentiable at zero, which is precisely what lets solutions sit at zero.` },
      { h: 'Coordinate update: soft-thresholding', tex: r`$$\beta_j \leftarrow \frac{S\!\left(\tfrac1n x_j^\top r_{(j)},\; \lambda\right)}{\tfrac1n x_j^\top x_j}, \qquad S(z,\lambda) = \operatorname{sign}(z)\max(|z| - \lambda, 0)$$`, p: r`$r_{(j)}$ is the residual ignoring feature $j$. If the feature’s correlation with that residual is smaller than $\lambda$, its coefficient is set to exactly 0.` },
    ],
    hyper: [
      [r`alpha ($\lambda$)`, 'Penalty strength; higher means fewer features.', 'LassoCV scans a path of values automatically.'],
      ['max_iter / tol', 'Coordinate-descent stopping rules.', 'Raise max_iter if you see convergence warnings.'],
      ['selection', '"cyclic" or "random" coordinate order.', '"random" can converge faster with many features.'],
    ],
    pros: ['Automatic feature selection gives a sparse, readable model.', r`Works when $p \gg n$.`, 'The regularisation path shows the order in which features enter.'],
    cons: ['Among a group of correlated features it picks one, somewhat arbitrarily.', 'Selects at most $n$ features when $p > n$.', 'Shrinks the coefficients it keeps, so they are biased.'],
    use: r`You suspect only a few features matter and want the model to tell you which.`,
    avoid: r`Groups of strongly correlated features that should stay together: prefer [[elastic_net]].`,
    complexity: [r`$O(np)$ per coordinate-descent sweep`, r`$O(\text{non-zeros})$`],
    glance: { learns: 'Sparse weights (many exactly 0)', family: 'Linear, L1 penalty' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LassoCV

model = make_pipeline(StandardScaler(), LassoCV(cv=5, random_state=0)).fit(X_tr, y_tr)
lasso = model[-1]
kept = [c for c, w in zip(X.columns, lasso.coef_) if w != 0]
print(f"alpha={lasso.alpha_:.4f}, kept {len(kept)} of {X.shape[1]} features:", kept)`,
    pitfalls: [r`Treating the selected set as "the true features". With correlated inputs, a slightly different sample can pick a different member of the group.`, r`Forgetting to scale, which turns the penalty into a units contest.`, r`Reading kept coefficients as unbiased effect sizes. Refit OLS on the selected features if you need that.`],
    quiz: [
      { q: r`Why does lasso produce exact zeros while ridge does not?`, o: [r`Lasso uses gradient descent`, r`The L1 penalty has a sharp corner at zero that solutions get stuck on`, r`Lasso has a bigger $\lambda$`, r`Ridge drops the intercept`], a: 1, why: r`At zero, the L1 penalty’s slope jumps from $-\lambda$ to $+\lambda$. If the data’s pull on a coefficient is weaker than $\lambda$, zero is the optimum.` },
      { q: r`Two features are almost identical. Lasso will most likely:`, o: [r`Keep both with equal weights`, r`Keep one and zero the other`, r`Zero both`, r`Fail to converge`], a: 1, why: r`For lasso, splitting weight across duplicates costs as much as putting it on one, with no benefit, so the solution usually concentrates on one of them. Elastic net spreads it.` },
      { q: r`Soft-thresholding $S(z, \lambda)$ with $z = 0.3, \lambda = 0.5$ returns:`, o: [r`0.3`, r`-0.2`, r`0`, r`0.8`], a: 2, why: r`$|z| < \lambda$, so $\max(|z| - \lambda, 0) = 0$.` },
    ],
    related: ['ridge_regression', 'elastic_net', 'ols_linear_regression'],
    prereq: ['ridge_regression'],
    concepts: ['regularization', 'feature-selection', 'cross-validation'],
    labIntro: r`The same degree-9 polynomial as in the ridge lesson, now with an L1 penalty, solved live with coordinate descent. Watch coefficient bars snap to zero.`,
    tryThis: [r`Increase $\lambda$ slowly and count how many bars are still non-zero.`, r`Find a $\lambda$ that keeps 3–4 terms and still fits the shape well.`, r`Compare which powers survive at high $\lambda$: lasso keeps the most useful terms, not the lowest ones.`],
    keywords: 'lasso l1 sparsity feature selection soft thresholding coordinate descent',
  },
  {
    id: 'elastic_net', short: 'Elastic net', title: 'Elastic Net Regression',
    task: 'regression', module: 'Linear models', level: 2, minutes: 14,
    summary: r`A blend of ridge and lasso: sparse like lasso, but keeps groups of correlated features together like ridge.`,
    lead: r`Elastic net adds both penalties, $\lambda\big(\alpha\lVert\beta\rVert_1 + \tfrac{1-\alpha}{2}\lVert\beta\rVert_2^2\big)$. One dial ($\lambda$) controls how strong the penalty is; the other ($\alpha$, <code>l1_ratio</code>) controls the mix.`,
    intuition: [
      r`Lasso has two known weaknesses: with correlated features it picks one at random, and when there are more features than rows it can keep at most $n$ of them. Adding a little L2 fixes both. The L2 part makes the problem strictly convex, so correlated features share weight; the L1 part still zeroes out the ones that do not help.`,
      r`In practice elastic net is the safe default for wide data (genomics, text, many engineered features): you get sparsity without lasso’s instability.`,
    ],
    analogy: r`An editor who cuts weak sentences (L1) but, when two sentences say the same thing well, keeps both in shortened form (L2).`,
    steps: [r`Standardise the features.`, r`Pick a grid for <code>l1_ratio</code> (e.g. 0.1, 0.5, 0.9, 1.0) and for $\lambda$.`, r`Fit by coordinate descent; each update is a soft-threshold divided by $(1 + \lambda(1-\alpha))$.`, r`Cross-validate both dials together (ElasticNetCV does this).`],
    math: [
      { h: 'Objective', tex: r`$$\min_\beta \frac{1}{2n}\lVert y - X\beta\rVert_2^2 + \lambda\Big(\alpha\lVert\beta\rVert_1 + \frac{1-\alpha}{2}\lVert\beta\rVert_2^2\Big)$$`, p: r`$\alpha = 1$ gives lasso, $\alpha = 0$ gives ridge.` },
      { h: 'Coordinate update', tex: r`$$\beta_j \leftarrow \frac{S\!\left(\tfrac1n x_j^\top r_{(j)},\; \lambda\alpha\right)}{\tfrac1n x_j^\top x_j + \lambda(1-\alpha)}$$`, p: r`The numerator is lasso’s soft-threshold; the extra term in the denominator is ridge’s shrinkage.` },
    ],
    hyper: [[r`alpha ($\lambda$)`, 'Overall penalty strength.', 'Log grid via ElasticNetCV.'], [r`l1_ratio ($\alpha$)`, 'Share of L1 in the mix.', 'Try [.1, .5, .7, .9, .95, 1].']],
    pros: ['Sparse and stable at the same time.', r`Handles $p \gg n$ and correlated groups.`, 'Includes ridge and lasso as special cases, so tuning can only help.'],
    cons: ['Two hyperparameters to tune.', 'Still linear.', 'Coefficients are doubly shrunk, so less interpretable as effect sizes.'],
    use: r`Wide data with correlated feature groups where you still want a compact model.`,
    avoid: r`Small, clean, low-dimensional problems where OLS or ridge is enough.`,
    complexity: [r`$O(np)$ per sweep`, r`$O(p)$`],
    glance: { learns: 'Sparse, grouped weights', family: 'Linear, L1 + L2' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import ElasticNetCV

model = make_pipeline(StandardScaler(),
                      ElasticNetCV(l1_ratio=[.1, .5, .7, .9, .95, 1], cv=5, random_state=0))
model.fit(X_tr, y_tr)
enet = model[-1]
print("alpha", enet.alpha_, "l1_ratio", enet.l1_ratio_)`,
    pitfalls: [r`Confusing the names: scikit-learn calls the strength <code>alpha</code> and the mix <code>l1_ratio</code>, while many papers use $\lambda$ and $\alpha$.`, r`Tuning only one dial while leaving the other at its default.`],
    quiz: [
      {
        q: r`Elastic net with l1_ratio = 1 is equivalent to:`,
        o: [
          r`Ridge`,
          r`Lasso`,
          r`OLS`,
          r`Bayesian ridge`,
        ],
        a: 1,
        why: r`The L2 share is $1 - 1 = 0$, leaving only the L1 penalty.`,
        d: 1,
      },
      {
        q: r`What does the L2 part add over plain lasso?`,
        o: [
          r`Exact zeros`,
          r`Grouping: correlated features share weight instead of one being picked`,
          r`Faster prediction`,
          r`Non-linearity`,
        ],
        a: 1,
        why: r`The strictly convex L2 term rewards splitting weight evenly among similar features.`,
        d: 1,
      },
      {
        q: r`What does setting l1_ratio = 0 correspond to in Elastic Net regression?`,
        o: [
          r`Lasso regression (pure L1 penalty)`,
          r`Ordinary least squares with no regularisation`,
          r`Ridge regression (pure L2 penalty)`,
          r`Principal component regression`,
        ],
        a: 2,
        why: r`Setting l1_ratio = 0 zeroes out the L1 regularisation component, leaving solely the quadratic $\frac{1}{2}\lVert\beta\rVert_2^2$ penalty, which is standard Ridge regression.`,
        d: 1,
      },
      {
        q: r`In the mathematical formulation of Elastic Net, what is the role of the overall penalty strength $\lambda$ (called alpha in scikit-learn)?`,
        o: [
          r`It controls the total regularisation penalty weight applied relative to the squared reconstruction loss`,
          r`It determines the ratio between the number of training samples and features`,
          r`It specifies the degree of polynomial expansion applied to the inputs`,
          r`It sets the convergence tolerance threshold for the coordinate descent solver`,
        ],
        a: 0,
        why: r`The multiplier $\lambda$ dictates the overall penalty scale; setting $\lambda = 0$ reduces Elastic Net to unregularised OLS, while increasing $\lambda$ shrinks all coefficients towards zero.`,
        d: 1,
      },
      {
        q: r`What limitation does standard Lasso encounter when features outnumber samples ($p > n$), and how does Elastic Net resolve it?`,
        o: [
          r`Lasso cannot select more than $n$ non-zero features, whereas Elastic Net can select more than $n$ predictors due to its strictly convex L2 penalty`,
          r`Lasso diverges to infinity, whereas Elastic Net forces all coefficients strictly to zero`,
          r`Lasso requires matrix inversion of $X^\top X$, whereas Elastic Net uses stochastic gradient descent`,
          r`Lasso causes severe underfitting by selecting all $p$ features, whereas Elastic Net selects at most one`,
        ],
        a: 0,
        why: r`Because of the geometry of the L1 ball, standard Lasso cannot select more than $n$ non-zero predictors when $p > n$. The strictly convex L2 penalty in Elastic Net removes this rank constraint, allowing it to select all relevant correlated features.`,
        d: 2,
      },
      {
        q: r`Why is feature standardisation essential before fitting an Elastic Net model?`,
        o: [
          r`Standardisation converts skewed target distributions into standard normal distributions`,
          r`Without standardisation, features with large numerical magnitudes receive disproportionate penalty shrinkage, distorting feature selection`,
          r`Coordinate descent fails to converge mathematically unless all feature columns have zero variance`,
          r`Standardisation guarantees that all resulting regression coefficients are strictly positive`,
        ],
        a: 1,
        why: r`The regularisation penalty treats all coefficient magnitudes identically. An unscaled feature measured in large units will have artificially tiny coefficients that get penalised unfairly compared to features on smaller scales.`,
        d: 2,
      },
      {
        q: r`In the coordinate descent update for Elastic Net, how does the soft-thresholding operator interact with the L2 regularisation term?`,
        o: [
          r`The L2 parameter multiplies the soft-threshold value by $(1 + \lambda(1-\alpha))$`,
          r`The soft-thresholded numerator is divided by the denominator term $(\frac{1}{n} x_j^\top x_j + \lambda(1 - \alpha))$`,
          r`The L2 penalty completely bypasses the soft-thresholding operator and acts only on the intercept`,
          r`The L2 penalty replaces the soft-thresholding operator with hard truncation`,
        ],
        a: 1,
        why: r`In coordinate descent, L1 provides the soft-thresholding numerator $S(\frac{1}{n}x_j^\top r_{(j)}, \lambda\alpha)$, while the quadratic curvature from L2 adds $\lambda(1-\alpha)$ to the denominator, shrinking the non-zero updates smoothly.`,
        d: 2,
      },
      {
        q: r`When tuning an Elastic Net model in scikit-learn using ElasticNetCV, why is it best practice to cross-validate l1_ratio and alpha jointly?`,
        o: [
          r`Scikit-learn raises an error if alpha is tuned without fixing l1_ratio at 0.5`,
          r`Sequential tuning always results in all feature coefficients collapsing to zero`,
          r`Joint tuning guarantees that the objective function becomes strictly non-convex`,
          r`The optimal regularisation strength alpha depends intimately on l1_ratio, as L1 and L2 penalties operate on different effective shrinkage scales`,
        ],
        a: 3,
        why: r`The amount of shrinkage needed to balance bias and variance changes dramatically depending on whether the penalty is predominantly L1 or L2; tuning them on a 2D grid captures their strong mutual interaction.`,
        d: 2,
      },
      {
        q: r`Suppose two features $x_1$ and $x_2$ are perfectly collinear ($x_1 = x_2$). How do pure Lasso ($\alpha = 1$) and Elastic Net ($\alpha = 0.5$) distribute their coefficients?`,
        o: [
          r`Both models assign 0 to both features because the Gram matrix is singular`,
          r`Lasso drops both features, whereas Elastic Net retains both with opposite signs`,
          r`Lasso arbitrarily assigns all weight to either $x_1$ or $x_2$ while setting the other to 0, whereas Elastic Net splits the weight equally ($\beta_1 = \beta_2$)`,
          r`Lasso assigns identical weights $\beta_1 = \beta_2$, whereas Elastic Net arbitrarily zeroes one of them out`,
        ],
        a: 2,
        why: r`Lasso's non-strictly-convex objective is indifferent to any split satisfying $\beta_1 + \beta_2 = c$, often assigning all weight to whichever feature appears first. The strictly convex L2 term in Elastic Net uniquely minimises $\beta_1^2 + \beta_2^2$ by splitting weight equally ($\beta_1 = \beta_2 = c/2$).`,
        d: 2,
      },
      {
        q: r`Consider a standardised feature with $\frac{1}{n} x_1^\top x_1 = 1$ and correlation with the partial residual $\frac{1}{n} x_1^\top r_{(1)} = 3.0$. If Elastic Net is fitted with penalty $\lambda = 2.0$ and mixing ratio $\alpha = 0.5$, what is the updated coefficient $\beta_1$?`,
        o: [
          r`$\beta_1 = 1.0$`,
          r`$\beta_1 = 1.5$`,
          r`$\beta_1 = 0.5$`,
          r`$\beta_1 = 2.0$`,
        ],
        a: 0,
        why: r`The threshold is $\lambda\alpha = 2.0 \times 0.5 = 1.0$. The soft-thresholded numerator is $S(3.0, 1.0) = \operatorname{sign}(3.0)\max(|3.0| - 1.0, 0) = 2.0$. The denominator is $\frac{1}{n}x_1^\top x_1 + \lambda(1-\alpha) = 1.0 + 2.0(1 - 0.5) = 2.0$. Thus $\beta_1 = 2.0 / 2.0 = 1.0$.`,
        d: 3,
      },
      {
        q: r`For a standardised feature with $\frac{1}{n} x_j^\top x_j = 1$ and inner product $\frac{1}{n} x_j^\top r_{(j)} = 1.2$, what is the minimum value of $\lambda$ under mixing parameter $\alpha = 0.8$ that forces coefficient $\beta_j$ to zero?`,
        o: [
          r`$\lambda = 0.96$`,
          r`$\lambda = 1.20$`,
          r`$\lambda = 1.50$`,
          r`$\lambda = 2.40$`,
        ],
        a: 2,
        why: r`The soft-thresholding condition sets $\beta_j = 0$ if and only if $|\frac{1}{n} x_j^\top r_{(j)}| \le \lambda\alpha$. Here $1.2 \le \lambda \times 0.8 \iff \lambda \ge 1.2 / 0.8 = 1.50$.`,
        d: 3,
      },
      {
        q: r`Why does naive Elastic Net suffer from double shrinkage, and how did Zou & Hastie (2005) correct this in the final Elastic Net estimator?`,
        o: [
          r`Double shrinkage occurs because the intercept is regularised alongside slopes; it is corrected by centring the response variable`,
          r`Both L1 thresholding and L2 curvature shrink coefficients, causing excessive prediction bias; coefficients are rescaled by multiplying by $(1 + \lambda(1 - \alpha))$`,
          r`Coefficients are squared before being thresholded; it is corrected by taking the square root of all predictions`,
          r`Double shrinkage means features are dropped twice during cross-validation; it is resolved by using bagging`,
        ],
        a: 1,
        why: r`In naive Elastic Net, the L1 penalty shrinks estimates towards zero and the L2 denominator divides them further. To undo this excessive shrinkage and bias while keeping the grouping effect and sparsity, the solution is rescaled by $(1 + \lambda(1-\alpha))$.`,
        d: 3,
      },
    ],
    related: ['lasso_regression', 'ridge_regression'],
    prereq: ['lasso_regression'],
    concepts: ['regularization', 'feature-selection'],
    labIntro: r`Same polynomial set-up as ridge and lasso. Two sliders: the penalty strength and the L1/L2 mix.`,
    tryThis: [r`Set the mix to 1.0 (pure lasso), note the zero bars, then slide toward 0 and watch them come back as small values.`, r`Find a mix where the fit is good and only about half the terms are active.`],
    keywords: 'elastic net l1 ratio sparse grouping regularisation',
  },
  {
    id: 'robust_regression', short: 'Robust regression', title: 'Robust Regression (Huber, RANSAC, Theil–Sen)',
    task: 'regression', module: 'Linear models', level: 2, minutes: 15,
    summary: r`Linear fits that refuse to be bullied by outliers, using a gentler loss or by ignoring points that do not fit.`,
    lead: r`OLS squares residuals, so a single bad point can take over. Robust regression changes the rules: Huber caps how hard outliers can pull, RANSAC fits only to points that agree, and Theil–Sen takes a median of slopes.`,
    intuition: [
      r`<strong>Huber</strong> uses squared loss for small residuals and absolute loss beyond a threshold $\delta$. Near the line it behaves like OLS; far away, an outlier’s pull stops growing.`,
      r`<strong>RANSAC</strong> (random sample consensus) repeatedly fits a line to a tiny random subset, counts how many points lie close to it, and keeps the line with the largest consensus. Outliers are simply never in the winning subset.`,
      r`<strong>Theil–Sen</strong> computes the slope between every pair of points and takes the median. Up to about 29% of the data can be garbage before the estimate breaks.`,
    ],
    analogy: r`Asking a room for a consensus: Huber lets loud people speak but caps their volume; RANSAC listens only to the largest group that agrees; Theil–Sen takes the median opinion.`,
    steps: [r`Choose the strategy: down-weight (Huber), exclude (RANSAC), or median-based (Theil–Sen).`, r`Huber: solve iteratively, re-weighting points by how large their residual is (IRLS).`, r`RANSAC: sample minimal subsets, fit, count inliers within a residual threshold, keep the best, refit on its inliers.`, r`Inspect which points were flagged; they are often the most interesting part of the data.`],
    math: [
      { h: 'Huber loss', tex: r`$$L_\delta(r) = \begin{cases} \tfrac12 r^2 & |r| \le \delta \\ \delta\big(|r| - \tfrac12\delta\big) & |r| > \delta \end{cases}$$`, p: r`Its derivative (the "pull" a point exerts) is $r$ inside the threshold and capped at $\pm\delta$ outside it.` },
      { h: 'RANSAC iterations needed', tex: r`$$N = \frac{\log(1 - p)}{\log\big(1 - w^s\big)}$$`, p: r`To find an all-inlier sample with probability $p$ when a fraction $w$ of points are inliers and each sample has $s$ points. For a line ($s = 2$), $w = 0.6$, $p = 0.99$: $N \approx 11$.` },
      { h: 'Theil–Sen slope', tex: r`$$\hat\beta_1 = \operatorname{median}_{i<j} \frac{y_j - y_i}{x_j - x_i}$$`, p: r`The median of all pairwise slopes, then the intercept is the median of $y_i - \hat\beta_1 x_i$.` },
    ],
    hyper: [['epsilon (Huber)', 'Where squared loss turns linear, in units of scale.', '1.35 gives 95% efficiency on clean Gaussian data.'], ['residual_threshold (RANSAC)', 'Max residual to count as an inlier.', 'Default is the MAD of $y$; set it from domain knowledge if you can.'], ['max_trials (RANSAC)', 'Number of random subsets.', 'Increase when outliers are common.']],
    pros: ['Resistant to outliers and gross errors.', 'RANSAC also tells you which points are outliers.', 'Theil–Sen needs no tuning.'],
    cons: ['Less efficient than OLS on perfectly clean data.', 'RANSAC is random; results vary between runs without a seed.', 'Theil–Sen gets slow with many rows or features.'],
    use: r`Sensor data, manual entry errors, or any data where a few points are plainly wrong.`,
    avoid: r`The "outliers" are real and important (fraud, failures). Then you need to model them, not ignore them.`,
    complexity: [r`Huber: IRLS, a few OLS solves`, r`$O(p)$`],
    glance: { learns: 'Linear weights fitted to the inliers', family: 'Linear, robust loss' },
    code: r`from sklearn.linear_model import HuberRegressor, RANSACRegressor, TheilSenRegressor, LinearRegression

models = {
    "OLS": LinearRegression(),
    "Huber": HuberRegressor(epsilon=1.35),
    "RANSAC": RANSACRegressor(random_state=0),
    "Theil-Sen": TheilSenRegressor(random_state=0),
}
for name, m in models.items():
    m.fit(X_tr, y_tr)
    print(name, round(m.score(X_te, y_te), 3))

inliers = models["RANSAC"].inlier_mask_   # which training rows RANSAC trusted`,
    pitfalls: [r`Using robust regression to hide data-quality problems instead of investigating them.`, r`Forgetting to scale before Huber; epsilon is defined relative to the residual scale.`],
    quiz: [
      {
        q: r`How does the Huber loss limit an outlier’s influence?`,
        o: [
          r`It deletes points beyond $\delta$`,
          r`Its gradient is capped at $\pm\delta$ for large residuals`,
          r`It squares residuals twice`,
          r`It uses the median target`,
        ],
        a: 1,
        why: r`Beyond $\delta$ the loss grows linearly, so its derivative stays constant: an outlier pulls with fixed force no matter how far away it is.`,
        d: 1,
      },
      {
        q: r`RANSAC’s final model is fitted on:`,
        o: [
          r`All points`,
          r`The largest consensus set of inliers`,
          r`A random subset`,
          r`Only the outliers`,
        ],
        a: 1,
        why: r`After finding the best minimal sample, RANSAC refits on all points within the residual threshold of it.`,
        d: 1,
      },
      {
        q: r`How does the Theil–Sen estimator compute the slope for a simple univariate regression?`,
        o: [
          r`By computing the median of the slopes between all pairs of distinct data points`,
          r`By minimising the sum of squared distances to the median target value`,
          r`By averaging the gradients of the first and last observations`,
          r`By running coordinate descent with an L1 regularisation penalty`,
        ],
        a: 0,
        why: r`Theil–Sen calculates pairwise slopes $s_{ij} = (y_j - y_i) / (x_j - x_i)$ for all $i < j$ and takes their median, making it highly robust against outliers in the dependent variable.`,
        d: 1,
      },
      {
        q: r`What is the breakdown point of an estimator in robust statistics?`,
        o: [
          r`The number of iterations required before gradient descent diverges`,
          r`The fraction of arbitrary bad data (outliers) an estimator can tolerate before its estimate can be forced to infinity`,
          r`The threshold where a linear model transitions to a piecewise polynomial spline`,
          r`The proportion of variance unexplained ($1 - R^2$) on held-out test data`,
        ],
        a: 1,
        why: r`The breakdown point measures resistance to data corruption; OLS has a breakdown point of $0\%$ (a single outlier can corrupt the slope arbitrarily), whereas Theil–Sen reaches $\approx 29.3\%$ for simple regression and RANSAC can tolerate over $50\%$ contamination.`,
        d: 1,
      },
      {
        q: r`Why does Ordinary Least Squares (OLS) have a breakdown point of 0%, whereas Huber regression is more robust?`,
        o: [
          r`OLS loss grows quadratically ($\frac{1}{2}r^2$), so a single extreme residual creates an arbitrarily large derivative that dominates the fit, whereas Huber's derivative is bounded by $\pm\delta$`,
          r`OLS requires the data to follow a Cauchy distribution, which has infinite variance`,
          r`Huber regression completely ignores all residuals less than $\delta$`,
          r`OLS is an unsupervised learning algorithm that does not use target labels`,
        ],
        a: 0,
        why: r`In OLS, the gradient is proportional to the residual $r$; as $|r| \to \infty$, the gradient pulls with unbounded force. Huber's loss transitions to linear growth for $|r| > \delta$, capping its influence at $\pm\delta$.`,
        d: 2,
      },
      {
        q: r`What is a key vulnerability of Huber regression when dealing with leverage points (outliers in the feature space $X$)?`,
        o: [
          r`Huber loss cannot compute gradients when features are negative`,
          r`While Huber is robust to target outliers, leverage points with extreme $x_i$ can still exert unbounded influence because the weight gradient is $x_i \cdot \operatorname{clip}(r_i, -\delta, \delta)$`,
          r`Huber regression automatically deletes all leverage points regardless of residual size`,
          r`Huber regression requires the sample size $n$ to be smaller than the number of features $p$`,
        ],
        a: 1,
        why: r`The loss gradient with respect to weight $\beta$ is $\sum x_i L_\delta'(r_i)$. Even though $L_\delta'(r_i)$ is bounded by $\delta$, extreme $x_i$ can make the product arbitrarily large. High-breakdown estimators like RANSAC handle high-leverage points much more effectively.`,
        d: 2,
      },
      {
        q: r`Why must residuals be scaled properly before setting the parameter $\epsilon$ (or $\delta$) in Huber regression?`,
        o: [
          r`$\delta$ represents a physical residual threshold; if targets are unscaled or measured in thousands, a fixed threshold like 1.35 will treat almost every normal residual as an outlier`,
          r`Scikit-learn's HuberRegressor crashes if features are not strictly between 0 and 1`,
          r`Feature scaling guarantees that the residuals follow a uniform distribution`,
          r`Unscaled features convert Huber loss into an L1 lasso penalty`,
        ],
        a: 0,
        why: r`The threshold $\delta$ defines where the loss switches from quadratic to linear. In HuberRegressor(epsilon=1.35), $\delta = 1.35 \times \hat{\sigma}$; if residual scale $\hat{\sigma}$ is misestimated, the threshold cannot distinguish normal noise from genuine outliers.`,
        d: 2,
      },
      {
        q: r`In RANSAC, what is the role of the residual threshold parameter?`,
        o: [
          r`It decides the maximum number of iterations the algorithm will execute`,
          r`It specifies the minimum number of features required to train the model`,
          r`It sets the learning rate for the iterative refitting step`,
          r`It determines the maximum residual distance a data point can have from the candidate model to be classified as an inlier`,
        ],
        a: 3,
        why: r`RANSAC classifies any point with residual $|y_i - \hat{y}_i| \le \text{threshold}$ as an inlier supporting the candidate model. A threshold set too tight rejects true inliers; set too loose, it admits outliers into the consensus set.`,
        d: 2,
      },
      {
        q: r`How does Iteratively Reweighted Least Squares (IRLS) solve the Huber regression problem?`,
        o: [
          r`By randomly sampling subsets until the consensus set size exceeds 90%`,
          r`By repeatedly solving a weighted least squares problem where points with residual $|r_i| > \delta$ receive weights $w_i = \delta / |r_i|$, down-weighting outliers at each step`,
          r`By sorting pairwise slopes and updating coefficients using the median`,
          r`By adding an L1 penalty to all weights and applying coordinate descent`,
        ],
        a: 1,
        why: r`The Huber loss can be viewed as weighted least squares where the effective weight is $w_i = 1$ when $|r_i| \le \delta$ and $w_i = \delta / |r_i|$ when $|r_i| > \delta$. Iteratively updating weights and refitting weighted least squares converges to the Huber minimum.`,
        d: 2,
      },
      {
        q: r`A Huber loss function uses threshold $\delta = 2.0$. For an observation with true target $y = 15.0$ and prediction $\hat{y} = 9.0$, what is the exact Huber loss $L_\delta(r)$ and the magnitude of its derivative $|L'_\delta(r)|$?`,
        o: [
          r`Loss $= 18.0$, derivative magnitude $= 6.0$`,
          r`Loss $= 10.0$, derivative magnitude $= 2.0$`,
          r`Loss $= 8.0$, derivative magnitude $= 2.0$`,
          r`Loss $= 16.0$, derivative magnitude $= 4.0$`,
        ],
        a: 1,
        why: r`The residual is $r = 15.0 - 9.0 = 6.0$. Since $|r| = 6.0 > \delta = 2.0$, we use the linear branch: $L_\delta(r) = \delta(|r| - \frac{1}{2}\delta) = 2.0 \times (6.0 - 1.0) = 10.0$. The derivative magnitude is capped at $\delta = 2.0$.`,
        d: 3,
      },
      {
        q: r`You are fitting a line (minimal sample size $s = 2$ points) using RANSAC. Outliers make up 40% of the dataset (inlier ratio $w = 0.60$). What is the minimum number of iterations $N = \frac{\log(1 - p)}{\log(1 - w^s)}$ needed to guarantee finding at least one outlier-free sample with probability $p = 0.99$? (Use $\log(0.01) \approx -4.605$ and $\log(1 - 0.60^2) = \log(0.64) \approx -0.446$).`,
        o: [
          r`$N = 5$`,
          r`$N = 8$`,
          r`$N = 11$`,
          r`$N = 25$`,
        ],
        a: 2,
        why: r`The probability of picking two inliers is $w^2 = 0.60^2 = 0.36$. The probability of picking at least one contaminated point is $1 - 0.36 = 0.64$. To ensure $(0.64)^N \le 0.01$, $N \ge \frac{-4.605}{-0.446} \approx 10.32$. Rounding up gives $N = 11$ iterations.`,
        d: 3,
      },
      {
        q: r`Consider 5 data points: $(1, 2), (2, 4), (3, 6), (4, 8)$ and an outlier $(5, 50)$. What is the Theil–Sen slope estimate $\hat{\beta}_1$, and what is the OLS slope?`,
        o: [
          r`Theil–Sen slope $= 10.0$, OLS slope $= 2.0$`,
          r`Theil–Sen slope $= 2.0$, OLS slope $= 10.0$`,
          r`Both estimators produce slope $= 6.0$`,
          r`Theil–Sen slope $= 4.0$, OLS slope $= 8.0$`,
        ],
        a: 1,
        why: r`There are $\binom{5}{2} = 10$ pairs. The 4 inliers form $\binom{4}{2} = 6$ pairs that all have slope $(y_j - y_i)/(x_j - x_i) = 2.0$. In the sorted list of 10 slopes, positions 1 through 6 are all $2.0$, giving a median of $2.0$. In contrast, OLS minimises squared error and yields slope $\frac{\sum(x - \bar{x})(y - \bar{y})}{\sum(x - \bar{x})^2} = \frac{100}{10} = 10.0$, heavily corrupted by the single outlier.`,
        d: 3,
      },
    ],
    related: ['ols_linear_regression', 'support_vector_regression'],
    prereq: ['ols_linear_regression', 'loss-functions'],
    concepts: ['loss-functions', 'exploratory-data-analysis'],
    labIntro: r`A clean linear trend with a cluster of corrupted points. Compare the OLS line (grey) with the robust method you pick.`,
    tryThis: [r`Drag the outlier slider up and watch OLS swing while Huber barely moves.`, r`Switch to RANSAC and look at which points are marked as outliers.`, r`Shrink Huber’s $\delta$ toward 0: it starts behaving like least absolute deviations.`],
    keywords: 'robust huber ransac theil sen outliers median',
  },
  {
    id: 'bayesian_linear_regression', short: 'Bayesian linear regression', title: 'Bayesian Linear Regression',
    task: 'regression', module: 'Linear models', level: 3, minutes: 20,
    summary: r`Linear regression that returns a distribution over lines, so every prediction comes with honest uncertainty.`,
    lead: r`Instead of one best set of weights, Bayesian regression keeps a whole distribution over them. Predictions come with error bars that are wide where data is scarce and narrow where it is plentiful.`,
    intuition: [
      r`Start with a prior: before seeing any data, you believe the weights are probably small, $\beta \sim \mathcal N(0, \alpha^{-1}I)$. Each data point then updates that belief using Bayes’ rule. With a Gaussian prior and Gaussian noise, the posterior is also Gaussian, so the update has a closed form.`,
      r`The payoff is the predictive distribution. Far from the training data, many different lines are still plausible, so the prediction band fans out. That is the model saying "I don’t know", which plain OLS can never do.`,
    ],
    analogy: r`A detective with a list of suspects (possible lines). Each clue rules some out; the remaining spread is how sure the detective is.`,
    steps: [r`Choose a prior precision $\alpha$ for the weights and a noise precision $\beta$.`, r`Compute the posterior covariance $S_N$ and mean $m_N$ in closed form.`, r`For a new $x$, the predictive mean is $m_N^\top x$ and the variance is $1/\beta + x^\top S_N x$.`, r`Optionally learn $\alpha$ and $\beta$ from the data by maximising the evidence (what BayesianRidge does).`],
    math: [
      { h: 'Posterior over weights', tex: r`$$S_N^{-1} = \alpha I + \beta X^\top X, \qquad m_N = \beta S_N X^\top y$$`, p: r`The posterior mean $m_N$ equals the ridge solution with $\lambda = \alpha/\beta$. The new ingredient is $S_N$, the uncertainty.` },
      { h: 'Predictive distribution', tex: r`$$p(y_* \mid x_*, \mathcal D) = \mathcal N\!\big(m_N^\top x_*,\; \tfrac{1}{\beta} + x_*^\top S_N x_*\big)$$`, p: r`Two sources of uncertainty: irreducible noise $1/\beta$, and uncertainty about the weights $x_*^\top S_N x_*$, which shrinks as data accumulates.` },
    ],
    hyper: [['alpha_1, alpha_2, lambda_1, lambda_2', 'Gamma hyper-priors on the precisions (BayesianRidge).', 'Defaults (1e-6) are deliberately vague; rarely need changing.'], ['fit_intercept', 'Learn an intercept.', 'Usually on.']],
    pros: ['Calibrated uncertainty for every prediction.', 'Regularisation strength learned from the data.', 'Natural for sequential updating as new data arrives.'],
    cons: ['Still a linear model.', 'Uncertainty is only as good as the Gaussian assumptions.', 'Full covariance costs $O(p^3)$.'],
    use: r`Small data, decisions that depend on how sure the prediction is, or active learning (sample where the band is widest).`,
    avoid: r`Very high-dimensional data or clearly non-linear signal; see [[gaussian_process_regressor]] for a non-linear Bayesian model.`,
    complexity: [r`$O(np^2 + p^3)$`, r`$O(p^2)$ with variance`],
    glance: { learns: 'A Gaussian over weights', family: 'Bayesian linear' },
    code: r`from sklearn.linear_model import BayesianRidge

model = BayesianRidge().fit(X_tr, y_tr)
mean, std = model.predict(X_te, return_std=True)
print("learned noise precision:", model.alpha_, "weight precision:", model.lambda_)
print("first prediction: %.2f ± %.2f" % (mean[0], 1.96 * std[0]))`,
    pitfalls: [r`Mixing up scikit-learn’s names: in BayesianRidge <code>alpha_</code> is the noise precision and <code>lambda_</code> the weight precision, the reverse of many textbooks.`, r`Trusting the band far outside the data when the true relationship is not linear: the model is confidently wrong about the shape.`],
    quiz: [
      {
        q: r`The posterior mean of Bayesian linear regression with a zero-mean Gaussian prior equals:`,
        o: [
          r`The OLS solution`,
          r`The ridge solution with $\lambda = \alpha/\beta$`,
          r`The lasso solution`,
          r`Zero`,
        ],
        a: 1,
        why: r`Maximising Gaussian likelihood times a Gaussian prior is the same as minimising squared error plus an L2 penalty.`,
        d: 1,
      },
      {
        q: r`Why does the prediction band widen away from the data?`,
        o: [
          r`The noise level increases there`,
          r`The term $x_*^\top S_N x_*$ grows when $x_*$ points in directions the data did not pin down`,
          r`The prior mean changes`,
          r`It is a plotting artefact`,
        ],
        a: 1,
        why: r`Weight uncertainty matters more for inputs far from where training data constrained the line.`,
        d: 2,
      },
      {
        q: r`What mathematical property makes the posterior weight distribution Gaussian in standard Bayesian linear regression?`,
        o: [
          r`The central limit theorem guarantees normality for any sample size`,
          r`The Laplacian prior distribution cancels out the quadratic likelihood`,
          r`Conjugacy: the Gaussian prior is conjugate to the Gaussian likelihood, producing an exact Gaussian posterior`,
          r`The target variable $y$ is always normalised between 0 and 1`,
        ],
        a: 2,
        why: r`When a linear model has Gaussian observation noise and a Gaussian prior on the weights, the prior is conjugate to the likelihood, resulting in an exact closed-form Gaussian posterior $\mathcal{N}(m_N, S_N)$.`,
        d: 1,
      },
      {
        q: r`In the Bayesian linear regression predictive variance $\sigma_*^2 = \frac{1}{\beta} + x_*^\top S_N x_*$, what do the two components represent?`,
        o: [
          r`The first is irreducible observation noise (aleatoric); the second is parameter uncertainty (epistemic) from having finite data`,
          r`The first is model bias; the second is parameter estimation variance`,
          r`The first is training error; the second is test cross-validation error`,
          r`Both terms represent regularisation shrinkage parameters`,
        ],
        a: 0,
        why: r`$\frac{1}{\beta}$ is the intrinsic data noise variance ($\sigma^2$), which persists even with infinite data. The second term $x_*^\top S_N x_*$ is the epistemic uncertainty about the true weights, which shrinks towards zero as more training data pins down the parameters.`,
        d: 1,
      },
      {
        q: r`What does setting a very large prior precision $\alpha \to \infty$ for the weights $\beta \sim \mathcal{N}(0, \alpha^{-1}I)$ express?`,
        o: [
          r`Strong prior belief that the weights are close to zero, shrinking the posterior mean heavily towards zero`,
          r`Strong prior belief that the weights have infinite variance and can take any value`,
          r`Total indifference to the weights, making the estimate identical to unregularised OLS`,
          r`That the observation noise is zero`,
        ],
        a: 0,
        why: r`Precision is the reciprocal of variance ($\alpha = 1/\sigma_0^2$). As $\alpha \to \infty$, the prior variance collapses to 0 around the origin, exerting infinite shrinkage and forcing posterior weights to 0.`,
        d: 1,
      },
      {
        q: r`In scikit-learn's BayesianRidge, what do the fitted attributes model.alpha_ and model.lambda_ represent?`,
        o: [
          r`alpha_ is the L1 mixing ratio and lambda_ is the overall penalty strength`,
          r`alpha_ is the estimated noise precision ($\beta = 1/\sigma^2$) and lambda_ is the estimated weight precision ($\alpha = 1/\sigma_w^2$)`,
          r`alpha_ is the number of support vectors and lambda_ is the kernel bandwidth`,
          r`alpha_ is the intercept and lambda_ is the slope`,
        ],
        a: 1,
        why: r`In scikit-learn's notation for BayesianRidge, alpha_ denotes the precision of the Gaussian noise and lambda_ denotes the precision of the weight prior (the reverse of Christopher Bishop's PRML notation where $\alpha$ is weight precision and $\beta$ is noise precision).`,
        d: 2,
      },
      {
        q: r`How does BayesianRidge estimate its regularisation hyperparameters without requiring cross-validation?`,
        o: [
          r`By maximising the marginal likelihood (evidence) $p(y \mid X, \alpha, \lambda)$ integrated over all possible weights`,
          r`By running 10-fold cross-validation automatically in the background`,
          r`By setting them to the sample variance of the training labels`,
          r`By running a grid search over 100 fixed values`,
        ],
        a: 0,
        why: r`Empirical Bayes (or type-II maximum likelihood) integrates out the model weights $\beta$ to compute the marginal likelihood of the observations given the precision parameters, updating them iteratively until convergence.`,
        d: 2,
      },
      {
        q: r`Why can the predictive uncertainty band of a Bayesian linear regression model be deceptive when extrapolating far from training data?`,
        o: [
          r`The variance collapses to zero far away from data`,
          r`The model assumes the relationship is strictly linear; if the underlying truth is non-linear, the prediction band fans out around an incorrect straight line with high confidence in the linear shape`,
          r`The posterior covariance matrix $S_N$ becomes singular for any test point $|x_*| > 10$`,
          r`The predictive distribution transitions into a Cauchy distribution`,
        ],
        a: 1,
        why: r`Bayesian linear regression only models uncertainty over linear slopes and intercepts. It cannot represent uncertainty about whether the linear model family itself is correct.`,
        d: 2,
      },
      {
        q: r`What makes Bayesian linear regression naturally suited for online (streaming) learning?`,
        o: [
          r`The posterior distribution after seeing a batch of data serves directly as the prior distribution for the next incoming data point`,
          r`It uses stochastic gradient descent with constant learning rate`,
          r`It stores all previous raw training points in memory forever`,
          r`It recomputes OLS from scratch using recursive feature elimination`,
        ],
        a: 0,
        why: r`By Bayes' theorem, $p(\mathbf{w} \mid \mathcal{D}_1, \mathcal{D}_2) \propto p(\mathcal{D}_2 \mid \mathbf{w}) p(\mathbf{w} \mid \mathcal{D}_1)$. The posterior after data $\mathcal{D}_1$ becomes the prior for $\mathcal{D}_2$, allowing exact recursive Bayesian updating without storing past raw data.`,
        d: 2,
      },
      {
        q: r`In a 1D Bayesian linear model without intercept ($y = w x + \epsilon$), the prior on $w$ is $\mathcal{N}(0, \alpha^{-1})$ with prior precision $\alpha = 2.0$. The noise precision is $\beta = 1.0$. You observe two data points: $(x_1=1, y_1=3)$ and $(x_2=2, y_2=5)$. What is the posterior precision $S_N^{-1}$ and the posterior variance $S_N$ of $w$?`,
        o: [
          r`$S_N^{-1} = 5.0$, $S_N = 0.20$`,
          r`$S_N^{-1} = 7.0$, $S_N = 1/7 \approx 0.143$`,
          r`$S_N^{-1} = 12.0$, $S_N = 1/12 \approx 0.083$`,
          r`$S_N^{-1} = 3.0$, $S_N = 0.333$`,
        ],
        a: 1,
        why: r`In 1D, the posterior precision is $S_N^{-1} = \alpha + \beta \sum x_i^2$. Here $\sum x_i^2 = 1^2 + 2^2 = 1 + 4 = 5$. With $\alpha = 2.0$ and $\beta = 1.0$, $S_N^{-1} = 2.0 + 1.0(5) = 7.0$. The posterior variance is the inverse of precision: $S_N = 1 / 7.0 \approx 0.143$.`,
        d: 3,
      },
      {
        q: r`Continuing from the previous problem with prior precision $\alpha = 2.0$, noise precision $\beta = 1.0$, and data points $(1, 3)$ and $(2, 5)$, what is the posterior mean $m_N$ of the weight $w$?`,
        o: [
          r`$m_N = 1.857$`,
          r`$m_N = 2.600$`,
          r`$m_N = 2.000$`,
          r`$m_N = 1.250$`,
        ],
        a: 0,
        why: r`The posterior mean is $m_N = \beta S_N \sum x_i y_i$. The cross-product sum is $\sum x_i y_i = (1)(3) + (2)(5) = 3 + 10 = 13$. With $\beta = 1.0$ and $S_N = 1/7$, $m_N = 1.0 \times \frac{1}{7} \times 13 = \frac{13}{7} \approx 1.857$. (The unregularised OLS slope would be $13/5 = 2.600$).`,
        d: 3,
      },
      {
        q: r`For the model with posterior mean $m_N = \frac{13}{7}$, posterior variance $S_N = \frac{1}{7}$, and noise precision $\beta = 1.0$ (noise variance $\sigma^2 = 1.0$), what is the predictive distribution (mean and variance) for a new query point at $x_* = 3$?`,
        o: [
          r`$\mu_* = 5.571$, $\sigma_*^2 = 1.286$`,
          r`$\mu_* = 7.800$, $\sigma_*^2 = 1.000$`,
          r`$\mu_* = 5.571$, $\sigma_*^2 = 2.286$`,
          r`$\mu_* = 6.000$, $\sigma_*^2 = 1.500$`,
        ],
        a: 2,
        why: r`The predictive mean is $\mu_* = m_N x_* = \frac{13}{7} \times 3 = \frac{39}{7} \approx 5.571$. The predictive variance is $\sigma_*^2 = \frac{1}{\beta} + x_*^2 S_N = 1.0 + 3^2 \times \frac{1}{7} = 1.0 + \frac{9}{7} = \frac{16}{7} \approx 2.286$.`,
        d: 3,
      },
    ],
    related: ['ridge_regression', 'gaussian_process_regressor', 'ols_linear_regression'],
    prereq: ['ridge_regression', 'maximum-likelihood-estimation'],
    concepts: ['maximum-likelihood-estimation', 'regularization'],
    labIntro: r`Points arrive one at a time. The shaded band is the 95% predictive interval; thin lines are samples from the posterior over lines.`,
    tryThis: [r`Start with 1–2 points: the sampled lines fan out in every direction.`, r`Add points and watch the band pinch where data is, while staying wide at the edges.`, r`Raise the prior precision $\alpha$: lines are pulled toward flat, even with data.`],
    keywords: 'bayesian posterior prior uncertainty credible interval bayesian ridge',
  },
  // ------------------------------------------------------------------ kernel & instance-based
  {
    id: 'knn_regressor', short: 'k-NN regressor', title: 'k-Nearest Neighbours Regression',
    task: 'regression', module: 'Kernel and instance-based', level: 1, minutes: 12,
    summary: r`Predict by averaging the targets of the k most similar training examples. No training step at all.`,
    lead: r`k-NN does not learn a formula. It memorises the training set and, for each new point, averages the targets of its $k$ closest neighbours.`,
    intuition: [
      r`To price a house, look at the five most similar houses that sold recently and average their prices. That is k-NN regression. "Similar" means close in feature space, so the choice of distance and the scaling of features matter a lot.`,
      r`Small $k$ follows the data closely, noise included (low bias, high variance). Large $k$ averages over a wide neighbourhood and flattens real structure (high bias, low variance). Weighting neighbours by $1/\text{distance}$ lets close points count more.`,
    ],
    analogy: r`Estimating a house price from the five most similar recent sales.`,
    steps: [r`Scale the features (otherwise the feature with the largest range dominates the distance).`, r`Store the training set, usually in a KD-tree or ball tree for fast lookup.`, r`For a query, find the $k$ nearest training points.`, r`Return their mean target, or a distance-weighted mean.`],
    math: [
      { h: 'Prediction', tex: r`$$\hat y(x) = \frac{\sum_{i \in N_k(x)} w_i\, y_i}{\sum_{i \in N_k(x)} w_i}, \qquad w_i = 1 \;\text{or}\; \frac{1}{d(x, x_i)}$$`, p: r`$N_k(x)$ is the set of the $k$ closest training points under a distance $d$, usually Euclidean.` },
      { h: 'The curse of dimensionality', tex: r`$$\text{edge of a cube holding a fraction } r \text{ of the data in } p \text{ dims} = r^{1/p}$$`, p: r`To capture 10% of uniformly spread data in 10 dimensions you need a cube spanning 80% of each axis. "Neighbours" stop being local, which is why k-NN struggles with many features.` },
    ],
    hyper: [['n_neighbors (k)', 'How many neighbours to average.', 'Odd values from 3 to 30; tune by CV.'], ['weights', 'uniform or distance.', '"distance" helps when density varies.'], ['metric / p', 'Distance function.', 'Euclidean (p=2) default; Manhattan (p=1) is more robust in high dimensions.']],
    pros: ['No training, trivially updatable with new data.', 'Captures any shape given enough data.', 'Easy to explain: "these are the examples I used".'],
    cons: ['Slow prediction on large datasets.', 'Very sensitive to feature scaling and irrelevant features.', 'Degrades in high dimensions.', 'Cannot extrapolate beyond the range of training targets.'],
    use: r`Low-dimensional data with plenty of rows and a non-linear but smooth relationship.`,
    avoid: r`Many features, very large datasets with tight latency budgets, or the need to extrapolate.`,
    complexity: [r`$O(1)$ (or $O(n\log n)$ to build a tree)`, r`$O(\log n)$ to $O(n)$ per query`],
    glance: { learns: 'Nothing: stores the data', family: 'Instance-based' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(StandardScaler(), KNeighborsRegressor())
grid = {"kneighborsregressor__n_neighbors": [3, 5, 9, 15, 25],
        "kneighborsregressor__weights": ["uniform", "distance"]}
search = GridSearchCV(pipe, grid, cv=5, scoring="neg_root_mean_squared_error").fit(X_tr, y_tr)
print(search.best_params_)`,
    pitfalls: [r`Forgetting to scale. A feature measured in thousands silently decides who the neighbours are.`, r`Including irrelevant features, each of which adds noise to every distance.`, r`Using k = 1 and reporting training error (which is always zero).`],
    quiz: [
      {
        q: r`What does increasing $k$ do to k-NN regression?`,
        o: [
          r`Increases variance`,
          r`Smooths predictions: more bias, less variance`,
          r`Makes training slower`,
          r`Nothing`,
        ],
        a: 1,
        why: r`Averaging more neighbours irons out noise, but also real local structure.`,
        d: 1,
      },
      {
        q: r`Why is k-NN poor at extrapolation?`,
        o: [
          r`It uses squared loss`,
          r`A prediction is an average of training targets, so it can never leave their range`,
          r`It needs scaling`,
          r`It overfits`,
        ],
        a: 1,
        why: r`Averages of observed targets are bounded by the observed targets.`,
        d: 2,
      },
      {
        q: r`What is the training time complexity of a standard brute-force k-Nearest Neighbours regressor?`,
        o: [
          r`$\mathcal{O}(n^3)$ due to covariance matrix inversion`,
          r`$\mathcal{O}(\text{epochs} \cdot n \cdot p)$ via backpropagation`,
          r`$\mathcal{O}(1)$ or $\mathcal{O}(n \cdot p)$ to merely store the data, as it has no parameter training phase`,
          r`$\mathcal{O}(n \log n)$ to sort all trees`,
        ],
        a: 2,
        why: r`k-NN is an instance-based lazy learner; training consists solely of memorising or storing the $n$ training instances with $p$ features, so there is no parameter optimisation phase.`,
        d: 1,
      },
      {
        q: r`If you train a 1-Nearest Neighbour regressor ($k = 1$) on a dataset with unique input points, what is its training Mean Squared Error (MSE)?`,
        o: [
          r`Exactly 0, because every training point is its own nearest neighbour with distance 0`,
          r`Equal to the empirical variance of the target variable $y$`,
          r`Half of the test set error`,
          r`Undefined, because at least 2 neighbours are required for MSE`,
        ],
        a: 0,
        why: r`For $k = 1$, each training point queries itself as its closest neighbour, perfectly predicting its own exact target value $y_i$, yielding zero training residuals.`,
        d: 1,
      },
      {
        q: r`Why does distance weighting (weights='distance') modify the behaviour of k-NN regression compared to uniform weighting?`,
        o: [
          r`It assigns larger weights to neighbours that are closer to the query point, usually proportional to $1/d(x, x_i)$`,
          r`It discards all neighbours whose distance exceeds 1.0`,
          r`It forces the model to fit a globally linear plane`,
          r`It converts k-NN into an unsupervised dimensionality reduction method`,
        ],
        a: 0,
        why: r`Under inverse-distance weighting, neighbours immediately adjacent to the query point have much greater influence on the predicted average than distant neighbours on the outer edge of the neighbourhood.`,
        d: 1,
      },
      {
        q: r`Suppose feature 1 is annual income in pounds (£20,000 to £150,000) and feature 2 is age in years (18 to 70). What happens if k-NN regression is fitted without feature scaling?`,
        o: [
          r`Age completely dominates the Euclidean distance calculations because its values are smaller`,
          r`Income completely dominates Euclidean distances because differences in thousands overwhelm differences of a few years, making age practically irrelevant`,
          r`The KD-tree algorithm fails to build and raises an exception`,
          r`Predictions become identical to uniform random guesses`,
        ],
        a: 1,
        why: r`Euclidean distance squares coordinate differences. A difference of £5,000 income produces $(5000)^2 = 25,000,000$, which completely dwarfs a 40-year age gap $(40)^2 = 1,600$. Features must be standardised so each dimension contributes fairly.`,
        d: 2,
      },
      {
        q: r`How does the curse of dimensionality impact k-NN regression in high-dimensional spaces?`,
        o: [
          r`Data points become sparsely distributed and almost equidistant from one another, so nearest neighbours are no longer locally close`,
          r`The number of neighbours $k$ must be multiplied by the number of dimensions $p$`,
          r`The model always predicts 0 for any query point`,
          r`KD-trees become infinitely fast at locating nearest neighbours`,
        ],
        a: 0,
        why: r`In high dimensions, the volume of the space grows exponentially ($r^{1/p}$). To capture even a small fraction of data, the neighbourhood must span almost the entire range of every feature, destroying locality.`,
        d: 2,
      },
      {
        q: r`When does using a KD-tree or Ball tree provide substantial speedups over brute-force search during k-NN inference?`,
        o: [
          r`When feature dimensionality $p$ is very high ($p > 100$)`,
          r`When sample size $n$ is large and feature dimensionality $p$ is low to moderate ($p \le 20$)`,
          r`Only when $k$ equals the total number of training rows $n$`,
          r`Only when the target variable is binary`,
        ],
        a: 1,
        why: r`Spatial partitioning trees achieve $\mathcal{O}(p \log n)$ query time for low dimensions, but their performance degrades to brute-force $\mathcal{O}(n \cdot p)$ as dimension $p$ exceeds roughly 20 because almost all branches must be inspected.`,
        d: 2,
      },
      {
        q: r`How does the choice of $k$ affect the bias-variance tradeoff in k-NN regression?`,
        o: [
          r`Small $k$ has high bias and low variance; large $k$ has low bias and high variance`,
          r`Small $k$ has low bias and high variance; large $k$ has high bias and low variance`,
          r`The bias and variance of k-NN are both completely independent of $k$`,
          r`Increasing $k$ always increases both bias and variance simultaneously`,
        ],
        a: 1,
        why: r`A small $k$ (e.g. $k=1$) adapts sharply to every local wiggle and noise point (low bias, high variance). A large $k$ averages over a vast region, smoothing out local peaks and valleys towards the global mean (high bias, low variance).`,
        d: 2,
      },
      {
        q: r`You have training data points on a 1D line: $(1.0, 3.0)$, $(2.0, 5.0)$, $(4.0, 9.0)$, $(7.0, 15.0)$. For a query point at $x_* = 3.0$, what is the prediction of a uniform $k$-NN regressor with $k = 3$?`,
        o: [
          r`$\hat{y} = 5.67$`,
          r`$\hat{y} = 6.33$`,
          r`$\hat{y} = 7.00$`,
          r`$\hat{y} = 8.00$`,
        ],
        a: 0,
        why: r`Distances from $x_* = 3.0$ are: $|3-2|=1.0$ (target 5.0), $|3-4|=1.0$ (target 9.0), and $|3-1|=2.0$ (target 3.0). The 3 closest points have targets $5.0, 9.0, 3.0$. Their uniform mean is $(5.0 + 9.0 + 3.0) / 3 = 17.0 / 3 \approx 5.67$.`,
        d: 3,
      },
      {
        q: r`For the same query point at $x_* = 3.0$ and training points $(1.0, 3.0)$, $(2.0, 5.0)$, $(4.0, 9.0)$, $(7.0, 15.0)$ with $k = 3$, what is the prediction using inverse distance weighting $w_i = 1 / d(x_*, x_i)$?`,
        o: [
          r`$\hat{y} = 5.67$`,
          r`$\hat{y} = 7.00$`,
          r`$\hat{y} = 6.20$`,
          r`$\hat{y} = 7.60$`,
        ],
        a: 2,
        why: r`Distances are $d_1 = 1.0$ ($y=5.0$), $d_2 = 1.0$ ($y=9.0$), and $d_3 = 2.0$ ($y=3.0$). Weights are $w_1 = 1.0, w_2 = 1.0, w_3 = 0.5$, summing to $2.5$. Weighted target sum is $1.0(5.0) + 1.0(9.0) + 0.5(3.0) = 15.5$. Prediction is $15.5 / 2.5 = 6.20$.`,
        d: 3,
      },
      {
        q: r`In a $p$-dimensional unit hypercube $[0, 1]^p$ with uniformly distributed points, what must the edge length $e$ of a sub-cube be to capture a fraction $r = 0.10$ (10%) of the data when $p = 10$? (Given $0.10^{0.1} \approx 0.794$).`,
        o: [
          r`$e = 0.010$`,
          r`$e = 0.100$`,
          r`$e = 0.794$`,
          r`$e = 0.990$`,
        ],
        a: 2,
        why: r`The volume of a hypercube of edge length $e$ in $p$ dimensions is $e^p$. To capture a fraction $r$ of the uniform volume, $e^p = r \implies e = r^{1/p}$. For $r = 0.10$ and $p = 10$, $e = 0.10^{1/10} \approx 0.794$, showing that the neighbourhood must span nearly $80\%$ of each coordinate range.`,
        d: 3,
      },
    ],
    related: ['knn_classifier', 'decision_tree_regressor', 'gaussian_process_regressor'],
    prereq: ['exploratory-data-analysis'],
    concepts: ['bias-variance-tradeoff', 'feature-selection'],
    labIntro: r`A noisy curve. The prediction at each x is the average of its k nearest training points. Hover to highlight the neighbours used.`,
    tryThis: [r`Set $k = 1$: the prediction becomes a staircase through every point.`, r`Raise $k$ to 40: the curve flattens toward the overall mean.`, r`Switch to distance weighting and compare the edges of the plot.`],
    keywords: 'knn nearest neighbours instance based lazy learning distance',
  },
  {
    id: 'support_vector_regression', short: 'Support vector regression', title: 'Support Vector Regression (SVR)',
    task: 'regression', module: 'Kernel and instance-based', level: 3, minutes: 20,
    summary: r`Fits a tube of width ε around the data and only penalises points outside it. Kernels make the tube bend.`,
    lead: r`SVR looks for the flattest function that keeps most points inside a tube of half-width $\varepsilon$. Errors inside the tube are free; only points on or outside it, the support vectors, shape the model.`,
    intuition: [
      r`Most regression losses punish every error. SVR’s ε-insensitive loss says "being within $\varepsilon$ is good enough". This makes the model ignore small noise and depend on only a subset of the data.`,
      r`$C$ sets the price of points outside the tube. Small $C$ prefers a flat, simple function and tolerates violations; large $C$ bends hard to pull every point inside. With an RBF kernel the function can follow curves, with $\gamma$ controlling how local each support vector’s influence is.`,
    ],
    analogy: r`Laying a flexible pipe of fixed diameter through a scatter of points: you want it as straight as possible while keeping most points inside it.`,
    steps: [r`Scale the features and usually the target.`, r`Pick a kernel (RBF by default) and set $\varepsilon$ to the noise level you are happy to ignore.`, r`Solve the convex dual problem; only points on or outside the tube get non-zero coefficients.`, r`Predict with a weighted sum of kernel similarities to the support vectors.`],
    math: [
      { h: 'Primal problem', tex: r`$$\min_{w,b,\xi,\xi^*} \frac12\lVert w\rVert^2 + C\sum_i(\xi_i + \xi_i^*) \;\;\text{s.t.}\;\; |y_i - w^\top\phi(x_i) - b| \le \varepsilon + \xi_i^{(*)}$$`, p: r`$\tfrac12\lVert w\rVert^2$ asks for flatness; the slack variables $\xi$ measure how far each point sits outside the tube.` },
      { h: 'Dual form and prediction', tex: r`$$f(x) = \sum_{i \in SV} (\alpha_i - \alpha_i^*)\, K(x_i, x) + b, \qquad K(x, x') = e^{-\gamma\lVert x - x'\rVert^2}$$`, p: r`Points strictly inside the tube have $\alpha_i = \alpha_i^* = 0$ and drop out. The kernel trick means $\phi$ is never computed explicitly.` },
    ],
    hyper: [['C', 'Penalty for points outside the tube.', 'Log grid 0.1–1000.'], ['epsilon', 'Half-width of the free zone, in target units.', 'About the noise level of $y$ (after scaling, 0.05–0.2).'], ['kernel, gamma', 'Shape and reach of the similarity function.', 'RBF; gamma via log grid or "scale".']],
    pros: ['Robust to small noise by design.', 'Sparse: depends only on support vectors.', 'Flexible non-linear fits via kernels.'],
    cons: ['Training scales roughly $O(n^2)$–$O(n^3)$: impractical beyond tens of thousands of rows.', 'Three interacting hyperparameters.', 'No native uncertainty estimates.'],
    use: r`Small to medium tabular data with non-linear structure and noise of known size.`,
    avoid: r`Large datasets; prefer gradient boosting, or approximate kernels (Nystroem) plus a linear model.`,
    complexity: [r`$O(n^2)$–$O(n^3)$`, r`$O(n_{SV})$`],
    glance: { learns: 'Dual weights on support vectors', family: 'Kernel method' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR
from sklearn.compose import TransformedTargetRegressor

svr = make_pipeline(StandardScaler(), SVR(kernel="rbf", C=10, epsilon=0.1, gamma="scale"))
model = TransformedTargetRegressor(regressor=svr, transformer=StandardScaler()).fit(X_tr, y_tr)
print("support vectors:", len(model.regressor_[-1].support_))`,
    pitfalls: [r`Leaving the target unscaled, so $\varepsilon = 0.1$ means something very different from what you intended.`, r`Tuning $C$ and $\gamma$ separately; they interact, so search them jointly.`],
    quiz: [
      {
        q: r`Which training points are support vectors in SVR?`,
        o: [
          r`All points`,
          r`Points strictly inside the tube`,
          r`Points on or outside the ε-tube`,
          r`Only outliers`,
        ],
        a: 2,
        why: r`Points comfortably inside the tube incur no loss and get zero dual weight.`,
        d: 1,
      },
      {
        q: r`Increasing ε usually leads to:`,
        o: [
          r`More support vectors`,
          r`Fewer support vectors and a smoother fit`,
          r`A narrower tube`,
          r`Higher C`,
        ],
        a: 1,
        why: r`A wider tube contains more points for free, so fewer points constrain the solution.`,
        d: 2,
      },
      {
        q: r`What is the $\varepsilon$-insensitive loss function used in Support Vector Regression?`,
        o: [
          r`$L_\varepsilon(y, f(x)) = \max(0, |y - f(x)| - \varepsilon)$`,
          r`$L_\varepsilon(y, f(x)) = \frac{1}{2}(y - f(x))^2$`,
          r`$L_\varepsilon(y, f(x)) = -\log(1 + e^{-y f(x)})$`,
          r`$L_\varepsilon(y, f(x)) = \max(0, 1 - y f(x))$`,
        ],
        a: 0,
        why: r`The $\varepsilon$-insensitive loss assigns zero penalty to any prediction error smaller than or equal to $\varepsilon$, and penalises errors linearly as $|y - f(x)| - \varepsilon$ beyond the tube boundary.`,
        d: 1,
      },
      {
        q: r`What does regularisation parameter $C$ control in Support Vector Regression?`,
        o: [
          r`The half-width of the tube`,
          r`The tradeoff between model flatness ($\frac{1}{2}\lVert w\rVert^2$) and penalising errors that exceed $\varepsilon$`,
          r`The degree of the polynomial kernel`,
          r`The number of features dropped during recursive elimination`,
        ],
        a: 1,
        why: r`$C$ governs how heavily points lying outside the $\varepsilon$-tube are penalised. A large $C$ forces the model to fit every point strictly, while a small $C$ prioritises a flatter, smoother function.`,
        d: 1,
      },
      {
        q: r`In the dual prediction formula $f(x) = \sum_{i \in SV} (\alpha_i - \alpha_i^*) K(x_i, x) + b$, what do the dual variables $\alpha_i$ and $\alpha_i^*$ represent?`,
        o: [
          r`Lagrange multipliers associated with points above ($y_i - f(x_i) \ge \varepsilon$) and below ($f(x_i) - y_i \ge \varepsilon$) the tube`,
          r`The learning rates for forward and backward passes`,
          r`The variance and mean of the Gaussian kernel`,
          r`The eigenvalues of the Gram matrix`,
        ],
        a: 0,
        why: r`SVR uses two sets of non-negative Lagrange multipliers: $\alpha_i$ for points lying on or above the upper tube boundary, and $\alpha_i^*$ for points lying on or below the lower tube boundary. At most one can be non-zero for any given point.`,
        d: 1,
      },
      {
        q: r`Why is target scaling particularly crucial in SVR when using a fixed default $\varepsilon = 0.1$?`,
        o: [
          r`SVR throws a runtime error if targets have non-zero mean`,
          r`$\varepsilon$ is measured in the native units of the target variable; if targets are in millions, $\varepsilon = 0.1$ requires impossibly tight fitting and turns almost every sample into a support vector`,
          r`Scaling the target forces the kernel Gram matrix to be positive definite`,
          r`Unscaled targets cause dual coefficients $\alpha_i$ to become complex numbers`,
        ],
        a: 1,
        why: r`Because $\varepsilon$ is an absolute threshold in target units, $\varepsilon = 0.1$ is microscopic if targets range in hundreds of thousands, forcing nearly all data points to become support vectors. Standardising $y$ ensures $\varepsilon = 0.1$ represents $0.1$ standard deviations.`,
        d: 2,
      },
      {
        q: r`In SVR with an RBF kernel $K(x, x') = \exp(-\gamma \lVert x - x'\rVert^2)$, what happens when $\gamma$ is set to an excessively large value?`,
        o: [
          r`The model approaches a linear straight line`,
          r`The kernel radius becomes tiny, so each support vector exerts only a sharp, narrow spike of influence around itself, leading to severe overfitting`,
          r`All support vectors receive identical dual weights`,
          r`The dual problem becomes unconstrained and solves in a single iteration`,
        ],
        a: 1,
        why: r`Large $\gamma$ means kernel similarity decays rapidly with distance. Each support vector acts only within an isolated narrow neighbourhood, producing a jagged function that collapses to the bias $b$ almost everywhere between training points.`,
        d: 2,
      },
      {
        q: r`In the SVR dual formulation, what determines whether a support vector lies exactly on the boundary of the $\varepsilon$-tube versus strictly outside it?`,
        o: [
          r`A point lies on the tube boundary when $0 < \alpha_i^{(*)} < C$, and strictly outside when $\alpha_i^{(*)} = C$`,
          r`Points on the tube boundary have $\alpha_i^{(*)} = 0$, while points outside have $\alpha_i^{(*)} = C$`,
          r`Boundary points have slack variable $\xi_i > 1$, while exterior points have $\xi_i = 0$`,
          r`Boundary points are always clustered at the origin`,
        ],
        a: 0,
        why: r`By the Karush–Kuhn–Tucker conditions, points strictly inside have $\alpha_i^{(*)} = 0$. Points exactly on the boundary have zero slack $\xi_i = 0$ but non-zero dual weight $0 < \alpha_i^{(*)} < C$ (free support vectors). Points violating the tube have positive slack $\xi_i > 0$ and their dual weight is capped at the box constraint $\alpha_i^{(*)} = C$.`,
        d: 2,
      },
      {
        q: r`What is the computational bottleneck when training an SVR model on large datasets?`,
        o: [
          r`Computing the inverse of the target vector`,
          r`Solving the quadratic programming problem, which scales between $\mathcal{O}(n^2)$ and $\mathcal{O}(n^3)$ in time and requires $\mathcal{O}(n^2)$ kernel evaluations`,
          r`Standardising the features before training`,
          r`Performing recursive tree splits on continuous features`,
        ],
        a: 1,
        why: r`Standard SVR solves a quadratic program with $2n$ variables and an $n \times n$ kernel matrix. While decomposition algorithms like SMO help, training time still scales roughly quadratically with sample size $n$, making exact kernel SVR slow for massive datasets.`,
        d: 2,
      },
      {
        q: r`An SVR model with $\varepsilon = 1.5$ predicts the following values for three training samples: Sample 1 ($y_1 = 10.0, \hat{y}_1 = 11.0$), Sample 2 ($y_2 = 5.0, \hat{y}_2 = 1.0$), Sample 3 ($y_3 = 8.0, \hat{y}_3 = 9.5$). What is the total $\varepsilon$-insensitive loss $\sum_{i=1}^3 L_\varepsilon(y_i, \hat{y}_i)$?`,
        o: [
          r`$5.0$`,
          r`$4.0$`,
          r`$2.5$`,
          r`$1.0$`,
        ],
        a: 2,
        why: r`Sample 1 error is $|10.0 - 11.0| = 1.0 \le 1.5$, so loss is $0$. Sample 2 error is $|5.0 - 1.0| = 4.0 > 1.5$, giving loss $4.0 - 1.5 = 2.5$. Sample 3 error is $|8.0 - 9.5| = 1.5 \le 1.5$, so loss is $0$. Total loss is $0 + 2.5 + 0 = 2.5$.`,
        d: 3,
      },
      {
        q: r`An SVR model with bias $b = 1.0$ has two support vectors: $x_1 = 0.0$ with $(\alpha_1 - \alpha_1^*) = +2.0$, and $x_2 = 2.0$ with $(\alpha_2 - \alpha_2^*) = -1.0$. Using a Gaussian RBF kernel $K(x, x') = \exp(-\gamma (x - x')^2)$ with $\gamma = 0.5$, what is the predicted value $f(x_*)$ at query point $x_* = 0.0$? (Note: $e^{-2.0} \approx 0.135$).`,
        o: [
          r`$f(x_*) = 2.865$`,
          r`$f(x_*) = 3.000$`,
          r`$f(x_*) = 1.865$`,
          r`$f(x_*) = 2.135$`,
        ],
        a: 0,
        why: r`$K(0, 0) = \exp(0) = 1.0$, and $K(2, 0) = \exp(-0.5 \times (2-0)^2) = \exp(-2.0) \approx 0.135$. The prediction is $(\alpha_1 - \alpha_1^*) K(x_1, 0) + (\alpha_2 - \alpha_2^*) K(x_2, 0) + b = (+2.0)(1.0) + (-1.0)(0.135) + 1.0 = 2.0 - 0.135 + 1.0 = 2.865$.`,
        d: 3,
      },
      {
        q: r`Under the KKT conditions for SVR, why is it mathematically impossible for both $\alpha_i > 0$ and $\alpha_i^* > 0$ to hold simultaneously for the same training point $x_i$?`,
        o: [
          r`Because the solver terminates if both dual variables are positive`,
          r`Because a single observation cannot lie simultaneously above the upper tube boundary ($y_i - f(x_i) \ge \varepsilon$) and below the lower tube boundary ($f(x_i) - y_i \ge \varepsilon$) for any $\varepsilon > 0$`,
          r`Because the kernel matrix would lose its positive semi-definiteness`,
          r`Because C is restricted to integer values`,
        ],
        a: 1,
        why: r`By KKT complementarity, $\alpha_i > 0 \implies y_i - f(x_i) = \varepsilon + \xi_i$ and $\alpha_i^* > 0 \implies f(x_i) - y_i = \varepsilon + \xi_i^*$. Adding these equations yields $0 = 2\varepsilon + \xi_i + \xi_i^*$. Because $\varepsilon > 0$ and slacks are non-negative, $2\varepsilon + \xi_i + \xi_i^* > 0$, creating a contradiction. Thus at most one can be non-zero.`,
        d: 3,
      },
    ],
    related: ['support_vector_classifier', 'gaussian_process_regressor', 'robust_regression'],
    prereq: ['ridge_regression', 'loss-functions'],
    concepts: ['loss-functions', 'regularization'],
    labIntro: r`An RBF-kernel SVR fitted live. The shaded band is the ε-tube; ringed points are support vectors.`,
    tryThis: [r`Widen ε and count how many support vectors remain.`, r`Lower C to 0.1: the fit flattens and many points sit outside the tube.`, r`Raise γ: each support vector’s influence gets local and the curve wiggles.`],
    keywords: 'svr support vector epsilon insensitive kernel rbf tube',
  },
  {
    id: 'gaussian_process_regressor', short: 'Gaussian process regression', title: 'Gaussian Process Regression',
    task: 'regression', module: 'Kernel and instance-based', level: 3, minutes: 22,
    summary: r`A distribution over functions. Predicts a mean curve plus calibrated uncertainty that grows away from the data.`,
    lead: r`A Gaussian process puts a prior directly on functions: any finite set of function values is jointly Gaussian, with correlations set by a kernel. Conditioning on data gives a posterior mean and a band of uncertainty.`,
    intuition: [
      r`The kernel encodes what kinds of functions you expect. The RBF kernel says "nearby inputs have similar outputs", with the length scale $\ell$ deciding how near is near. Before seeing data, the GP can draw any smooth wiggle; each observation pins the function down locally.`,
      r`Between observations the mean interpolates smoothly and the uncertainty bulges; at the observations it pinches (down to the noise level). This makes GPs a favourite for small, expensive experiments and for Bayesian optimisation.`,
    ],
    analogy: r`A tent held up by poles at each data point: the fabric is pinned at the poles and sags (uncertainty) between them, by an amount set by how stiff the fabric is (the length scale).`,
    steps: [r`Choose a kernel, e.g. RBF plus a white-noise term.`, r`Build the covariance matrix $K$ between all training points.`, r`Fit kernel hyperparameters by maximising the marginal likelihood.`, r`Predict: mean $k_*^\top (K + \sigma^2 I)^{-1}y$, variance $k_{**} - k_*^\top (K + \sigma^2 I)^{-1}k_*$.`],
    math: [
      { h: 'Prior over functions', tex: r`$$f \sim \mathcal{GP}(0, k), \qquad k(x, x') = \sigma_f^2 \exp\!\Big(-\frac{\lVert x - x'\rVert^2}{2\ell^2}\Big)$$`, p: r`$\sigma_f^2$ sets how far the function strays from zero; $\ell$ sets how quickly it can change.` },
      { h: 'Posterior predictive', tex: r`$$\mu_* = k_*^\top (K + \sigma_n^2 I)^{-1} y, \qquad \sigma_*^2 = k(x_*, x_*) - k_*^\top (K + \sigma_n^2 I)^{-1} k_*$$`, p: r`Computed with a Cholesky factorisation of the $n \times n$ matrix, which is where the $O(n^3)$ cost comes from.` },
      { h: 'Learning the kernel', tex: r`$$\log p(y \mid X) = -\tfrac12 y^\top K_y^{-1} y - \tfrac12 \log|K_y| - \tfrac n2 \log 2\pi$$`, p: r`A data-fit term and a complexity penalty: the marginal likelihood automatically balances smoothness against fit.` },
    ],
    hyper: [['kernel', 'Prior over function shapes.', 'RBF/Matérn + WhiteKernel is a strong default.'], ['alpha', 'Extra noise added to the diagonal.', 'Small (1e-10) if a WhiteKernel models noise.'], ['n_restarts_optimizer', 'Restarts of the hyperparameter search.', '5–10 avoids poor local optima.']],
    pros: ['Principled uncertainty for every prediction.', 'Very data-efficient on small problems.', 'Kernels can encode prior knowledge (periodicity, trends).'],
    cons: ['$O(n^3)$ training and $O(n^2)$ memory: a few thousand points at most for exact GPs.', 'Kernel choice matters and takes thought.', 'Struggles in high dimensions.'],
    use: r`Small datasets, expensive experiments, Bayesian optimisation, anything where knowing "how sure" matters.`,
    avoid: r`More than about 10k rows (unless you use sparse approximations) or very high-dimensional inputs.`,
    complexity: [r`$O(n^3)$`, r`$O(n)$ mean, $O(n^2)$ variance`],
    glance: { learns: 'Kernel hyperparameters; keeps the data', family: 'Bayesian non-parametric' },
    code: r`from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel, ConstantKernel as C

kernel = C(1.0) * RBF(length_scale=1.0) + WhiteKernel(noise_level=0.1)
gp = GaussianProcessRegressor(kernel=kernel, normalize_y=True, n_restarts_optimizer=5, random_state=0)
gp.fit(X_tr[:1000], y_tr[:1000])          # exact GPs scale as O(n^3)
mean, std = gp.predict(X_te, return_std=True)
print(gp.kernel_)                          # the fitted kernel`,
    pitfalls: [r`Fitting on all rows of a large dataset and waiting forever. Subsample or use sparse GPs.`, r`Forgetting a noise term, which forces the mean to pass exactly through every noisy point.`],
    quiz: [
      {
        q: r`What does the RBF length scale $\ell$ control?`,
        o: [
          r`The noise level`,
          r`How quickly the function can change with the input`,
          r`The number of support vectors`,
          r`The prior mean`,
        ],
        a: 1,
        why: r`Small $\ell$ means correlations die off quickly, so the function can wiggle; large $\ell$ means a smooth, slowly varying function.`,
        d: 1,
      },
      {
        q: r`Why do exact GPs not scale to millions of rows?`,
        o: [
          r`They need an $n \times n$ matrix factorisation, $O(n^3)$`,
          r`They use gradient descent`,
          r`They need categorical features`,
          r`They store only support vectors`,
        ],
        a: 0,
        why: r`Inverting (or factorising) $K + \sigma^2 I$ is cubic in $n$ and quadratic in memory.`,
        d: 2,
      },
      {
        q: r`What is the formal definition of a Gaussian Process (GP)?`,
        o: [
          r`A neural network with infinitely many hidden layers trained using RMSprop`,
          r`A collection of random variables, any finite subset of which has a joint multivariate Gaussian distribution`,
          r`An iterative clustering algorithm that fits multivariate normal distributions`,
          r`A linear regression model whose input features are guaranteed to be normally distributed`,
        ],
        a: 1,
        why: r`By definition, a Gaussian Process is a collection of infinitely many random variables such that any finite sub-collection $(f(x_1), \dots, f(x_k))$ has a joint Gaussian distribution fully specified by a mean function $m(x)$ and covariance function $k(x, x')$.`,
        d: 1,
      },
      {
        q: r`What is the effect of adding a WhiteKernel to an RBF kernel in Gaussian Process Regression?`,
        o: [
          r`It models independent, identically distributed observation noise $\sigma_n^2$, adding $\sigma_n^2$ to the diagonal of the covariance matrix`,
          r`It forces the mean prediction function to be strictly linear`,
          r`It restricts the kernel output to black-and-white image pixels`,
          r`It reduces the computational complexity from $\mathcal{O}(n^3)$ to $\mathcal{O}(n)$`,
        ],
        a: 0,
        why: r`A white-noise kernel models observation error $\epsilon \sim \mathcal{N}(0, \sigma_n^2)$. Adding it modifies the covariance to $K(x, x') + \sigma_n^2 \delta_{x, x'}$, allowing the GP mean function to smoothly approximate noisy points rather than being forced to interpolate through every noise spike.`,
        d: 1,
      },
      {
        q: r`What happens to the posterior predictive uncertainty (variance $\sigma_*^2$) of a noise-free GP at an exact training location $x_* = x_i$?`,
        o: [
          r`It equals the prior variance $\sigma_f^2$`,
          r`It drops to zero, because the true function value is known with absolute certainty`,
          r`It expands to infinity due to division by zero`,
          r`It oscillates between $-1$ and $+1$`,
        ],
        a: 1,
        why: r`Without observation noise, observing $y_i = f(x_i)$ pins down the function completely at that coordinate, collapsing posterior uncertainty at $x_i$ to 0.`,
        d: 1,
      },
      {
        q: r`How does Gaussian Process Regression learn its kernel hyperparameters (such as length scale $\ell$ and signal variance $\sigma_f^2$)?`,
        o: [
          r`By running 5-fold cross-validation on a grid of fixed values`,
          r`By setting $\ell$ to the average Euclidean distance between all points`,
          r`By maximising the log marginal likelihood $\log p(y \mid X)$, which naturally balances data fit against model complexity`,
          r`By training a separate random forest to predict the hyperparameters`,
        ],
        a: 2,
        why: r`The log marginal likelihood decomposes into a data-fit term ($-\frac{1}{2}y^\top K_y^{-1}y$), a complexity penalty term ($-\frac{1}{2}\log|K_y|$), and a normalisation constant. Maximising it via gradient-based optimisers finds optimal hyperparameters without cross-validation.`,
        d: 2,
      },
      {
        q: r`Suppose you train a GP with an RBF kernel where the learned length scale $\ell$ is extremely small relative to the spacing between data points. How will the predictive mean behave between training points?`,
        o: [
          r`It quickly reverts to the prior mean (usually 0), creating isolated bumps at data points rather than smooth interpolation`,
          r`It connects all points with a global straight line`,
          r`It diverges towards positive infinity`,
          r`It oscillates with infinite frequency`,
        ],
        a: 0,
        why: r`When $\ell$ is much smaller than the distance between points, covariance $k(x_i, x_*)$ vanishes as soon as $x_*$ moves slightly away from a training point. As cross-correlations vanish, the predictive mean reverts to the prior mean ($0$), and variance returns to prior variance $\sigma_f^2$.`,
        d: 2,
      },
      {
        q: r`Why does scikit-learn's GaussianProcessRegressor provide an n_restarts_optimizer parameter?`,
        o: [
          r`Because the kernel matrix must be inverted multiple times to prevent roundoff errors`,
          r`Because the log marginal likelihood surface can have multiple local optima, so restarting the optimiser from different initial hyperparameter points helps find a better solution`,
          r`Because scikit-learn trains an ensemble of independent GPs and averages their predictions`,
          r`Because gradient descent fails to terminate unless restarted every 10 iterations`,
        ],
        a: 1,
        why: r`The marginal likelihood objective function is typically non-convex in kernel hyperparameters, often containing multiple local maxima (e.g. one representing short-scale noisy variations and another representing long-scale smooth trends). Random restarts help escape poor local optima.`,
        d: 2,
      },
      {
        q: r`Why are Gaussian Processes widely used as surrogate models in Bayesian optimisation for hyperparameter tuning?`,
        o: [
          r`Because GPs can train in less than a millisecond on millions of rows`,
          r`Because GPs are non-probabilistic models that ignore noisy evaluations`,
          r`Because GPs convert black-box optimisation problems into convex linear programs`,
          r`Because GPs provide both a predictive mean and an exact analytic predictive variance, enabling acquisition functions (like Expected Improvement) to trade off exploration and exploitation`,
        ],
        a: 3,
        why: r`In Bayesian optimisation, evaluating the objective function is expensive. GPs provide full posterior predictive distributions $\mathcal{N}(\mu(x), \sigma^2(x))$, allowing acquisition functions to mathematically quantify both where the objective is expected to be good (exploitation) and where uncertainty is large (exploration).`,
        d: 2,
      },
      {
        q: r`You have a single training point $(x_1 = 0.0, y_1 = 4.0)$ and a GP with zero prior mean, RBF kernel $k(x, x') = \exp(-\frac{1}{2}(x - x')^2)$, and observation noise variance $\sigma_n^2 = 1.0$. What is the posterior predictive mean $\mu_*$ at $x_* = 1.0$? (Note: $e^{-0.5} \approx 0.607$).`,
        o: [
          r`$\mu_* = 4.000$`,
          r`$\mu_* = 1.213$`,
          r`$\mu_* = 2.426$`,
          r`$\mu_* = 0.607$`,
        ],
        a: 1,
        why: r`The training covariance scalar is $K = k(0, 0) + \sigma_n^2 = 1.0 + 1.0 = 2.0$. The cross-covariance is $k_* = k(1, 0) = \exp(-0.5) \approx 0.607$. The predictive mean is $\mu_* = k_* K^{-1} y = 0.607 \times (1 / 2.0) \times 4.0 = 0.607 \times 2.0 \approx 1.214$ (or $1.213$).`,
        d: 3,
      },
      {
        q: r`For the same single-observation GP setup ($x_1 = 0.0, y_1 = 4.0, k(x, x') = \exp(-\frac{1}{2}(x - x')^2), \sigma_n^2 = 1.0$), what is the posterior predictive variance $\sigma_*^2$ at $x_* = 1.0$? (Using $e^{-0.5} \approx 0.607$, so $(e^{-0.5})^2 = e^{-1.0} \approx 0.368$).`,
        o: [
          r`$\sigma_*^2 = 0.816$`,
          r`$\sigma_*^2 = 0.632$`,
          r`$\sigma_*^2 = 1.000$`,
          r`$\sigma_*^2 = 0.448$`,
        ],
        a: 0,
        why: r`Prior variance at $x_*$ is $k(1, 1) = 1.0$. The variance reduction term is $k_*^2 / (k(0, 0) + \sigma_n^2) = (e^{-0.5})^2 / (1.0 + 1.0) = e^{-1.0} / 2.0 \approx 0.3679 / 2.0 \approx 0.1840$. Thus $\sigma_*^2 = 1.0 - 0.184 = 0.816$.`,
        d: 3,
      },
      {
        q: r`In the log marginal likelihood formula $\log p(y \mid X) = -\frac{1}{2}y^\top K_y^{-1}y - \frac{1}{2}\log|K_y| - \frac{n}{2}\log 2\pi$, what happens if a model becomes overly complex by choosing an excessively tiny length scale $\ell \to 0$?`,
        o: [
          r`The data fit term drops to $-\infty$ while the complexity term approaches zero`,
          r`The covariance matrix $K_y \to \sigma_n^2 I$, causing the model to treat all data points as uncorrelated noise, which severely penalises the complexity penalty $-\frac{1}{2}\log|K_y|$ and fails to explain data covariance`,
          r`The determinant $|K_y|$ diverges to infinity, making log marginal likelihood positive`,
          r`The constant term drops to zero`,
        ],
        a: 1,
        why: r`As $\ell \to 0$, all off-diagonal correlations vanish and $K_y \to \sigma_n^2 I$. The model loses all capacity to generalise or predict across points. Because it treats structured data as pure uncorrelated white noise, its marginal likelihood is substantially lower than that of a properly tuned length scale.`,
        d: 3,
      },
    ],
    related: ['bayesian_linear_regression', 'support_vector_regression', 'knn_regressor'],
    prereq: ['bayesian_linear_regression'],
    concepts: ['maximum-likelihood-estimation', 'bias-variance-tradeoff'],
    labIntro: r`Click to add observations. The line is the posterior mean, the band is ±2 standard deviations, and the faint lines are functions sampled from the posterior.`,
    tryThis: [r`Start with 3 points and watch the band balloon in the gaps.`, r`Shrink the length scale: the mean snaps between points and the band bulges quickly.`, r`Raise the noise: the mean no longer has to pass through each point.`],
    keywords: 'gaussian process gp kernel rbf uncertainty bayesian optimisation',
  },
  // ------------------------------------------------------------------ trees & ensembles
  {
    id: 'decision_tree_regressor', short: 'Decision tree regressor', title: 'Decision Tree Regression (CART)',
    task: 'regression', module: 'Trees and ensembles', level: 1, minutes: 16,
    summary: r`Splits the input space into boxes with yes/no questions and predicts the average target in each box.`,
    lead: r`A regression tree asks a sequence of yes/no questions ("is income > 4.2?") and predicts the average target of the training rows that land in the same leaf. The result is a step function.`,
    intuition: [
      r`At each node the tree tries every feature and every threshold, and keeps the split that most reduces the squared error of the two children. It repeats this recursively on each side. Greedy, simple, and surprisingly effective.`,
      r`Unchecked, a tree keeps splitting until each leaf holds one row: perfect on training data, poor on new data. Depth limits, minimum leaf sizes or cost-complexity pruning stop it early. Trees need no feature scaling and handle interactions naturally, which is why they are the building block of [[random_forest_regressor|forests]] and [[gradient_boosting_regressor|boosting]].`,
    ],
    analogy: r`A game of twenty questions where every answer narrows down the price range.`,
    steps: [r`For every feature and candidate threshold, compute the drop in squared error from splitting there.`, r`Make the best split and send rows left or right.`, r`Repeat on each child until a stopping rule triggers (max depth, min samples per leaf).`, r`Each leaf predicts the mean target of its training rows.`, r`Optionally prune back branches that do not pay for their complexity.`],
    math: [
      { h: 'Split criterion (variance reduction)', tex: r`$$\Delta = \sum_{i \in P}(y_i - \bar y_P)^2 - \Big[\sum_{i \in L}(y_i - \bar y_L)^2 + \sum_{i \in R}(y_i - \bar y_R)^2\Big]$$`, p: r`The tree picks the feature and threshold that maximise $\Delta$: the biggest drop in squared error from parent $P$ to children $L$ and $R$.` },
      { h: 'Cost-complexity pruning', tex: r`$$R_\alpha(T) = \sum_{\text{leaves } m} \sum_{i \in m} (y_i - \bar y_m)^2 + \alpha\,|T|$$`, p: r`$|T|$ is the number of leaves. Larger $\alpha$ prefers smaller trees; scikit-learn exposes it as <code>ccp_alpha</code>.` },
    ],
    hyper: [['max_depth', 'Maximum number of questions on any path.', '3–10; the strongest regulariser.'], ['min_samples_leaf', 'Minimum rows per leaf.', '5–50 smooths predictions.'], ['ccp_alpha', 'Pruning strength.', 'Use cost_complexity_pruning_path to scan.'], ['max_features', 'Features considered per split.', 'All for a single tree.']],
    pros: ['Readable: the model is a flowchart.', 'No scaling needed; handles mixed feature types and interactions.', 'Fast to train and predict.'],
    cons: ['High variance: small data changes can change the whole tree.', 'Predictions are piecewise constant (blocky).', 'Cannot extrapolate beyond the training range.'],
    use: r`You need an explainable model, or as the base learner for ensembles.`,
    avoid: r`You need the best accuracy from a single model: use an ensemble instead.`,
    complexity: [r`$O(p\,n\log n)$ per level`, r`$O(\text{depth})$`],
    glance: { learns: 'Split rules + leaf means', family: 'Tree' },
    code: r`from sklearn.tree import DecisionTreeRegressor, export_text

tree = DecisionTreeRegressor(max_depth=4, min_samples_leaf=20, random_state=0).fit(X_tr, y_tr)
print("test R2:", round(tree.score(X_te, y_te), 3))
print(export_text(tree, feature_names=list(X.columns)))   # the whole model as rules`,
    pitfalls: [r`Growing the tree to full depth and being surprised by poor test scores.`, r`Reading feature importances from a single deep tree; they are unstable.`],
    quiz: [
      { q: r`What does a leaf of a regression tree predict?`, o: [r`The median of all targets`, r`The mean target of the training rows in that leaf`, r`A linear function`, r`The most common target`], a: 1, why: r`The mean minimises squared error within the leaf.` },
      { q: r`Why don’t trees need feature scaling?`, o: [r`They normalise internally`, r`Splits are thresholds on one feature at a time, so the units do not matter`, r`They only use binary features`, r`They do need it`], a: 1, why: r`"Income > 4.2" and "income > 4200" partition the rows identically.` },
    ],
    related: ['decision_tree_classifier', 'random_forest_regressor', 'gradient_boosting_regressor'],
    prereq: ['regression-metrics'],
    concepts: ['bias-variance-tradeoff', 'regression-metrics'],
    labIntro: r`A CART tree fitted to a noisy curve. Each flat segment is a leaf. Vertical lines mark split thresholds.`,
    tryThis: [r`Depth 1 gives a single split (a "stump"). Step up one level at a time.`, r`At depth 10 the tree chases noise; watch test RMSE rise.`, r`Raise the minimum leaf size instead of lowering depth: a different way to regularise.`],
    keywords: 'decision tree cart regression splits variance reduction pruning',
  },
  {
    id: 'random_forest_regressor', short: 'Random forest regressor', title: 'Random Forest Regression',
    task: 'regression', module: 'Trees and ensembles', level: 2, minutes: 18,
    summary: r`Averages hundreds of deep, decorrelated trees. Little tuning, strong accuracy, hard to overfit by adding trees.`,
    lead: r`Grow many deep trees, each on a bootstrap sample of the rows and with a random subset of features at every split, then average their predictions. Averaging cancels out the trees’ individual mistakes.`,
    intuition: [
      r`A single deep tree has low bias but high variance. Averaging $B$ independent estimates divides variance by $B$, but trees trained on the same data are correlated, and correlation limits the gain. Random forests attack the correlation by forcing each split to consider only a random subset of features.`,
      r`Each tree only sees about 63% of the rows. The rest are "out-of-bag", a free validation set for that tree. Combining them gives an honest error estimate without a separate hold-out.`,
    ],
    analogy: r`Asking many independent appraisers who each looked at different houses and focused on different details, then averaging their estimates.`,
    steps: [r`For $b = 1..B$: draw a bootstrap sample of rows.`, r`Grow a deep tree on it; at each split, consider only a random subset of <code>max_features</code> features.`, r`Predict by averaging all trees.`, r`Use out-of-bag predictions to estimate test error and permutation importance.`],
    math: [
      { h: 'Variance of an average of correlated trees', tex: r`$$\operatorname{Var}\Big(\frac1B\sum_b T_b(x)\Big) = \rho\,\sigma^2 + \frac{1-\rho}{B}\,\sigma^2$$`, p: r`As $B$ grows the second term vanishes, leaving $\rho\sigma^2$. Feature subsampling lowers the correlation $\rho$, which is where the forest’s strength comes from.` },
      { h: 'Out-of-bag fraction', tex: r`$$P(\text{row not in a bootstrap sample}) = \Big(1 - \tfrac1n\Big)^n \to e^{-1} \approx 0.368$$`, p: r`About a third of the rows are left out of each tree and serve as its validation set.` },
    ],
    hyper: [['n_estimators', 'Number of trees.', '200–1000; more never overfits, just costs time.'], ['max_features', 'Features tried per split.', '1.0 (regression default), or 0.3–0.5 for more decorrelation.'], ['min_samples_leaf', 'Leaf size.', '1–5; larger smooths.'], ['max_depth', 'Depth cap.', 'Usually None.']],
    pros: ['Strong accuracy with almost no tuning.', 'Robust to outliers and irrelevant features.', 'Free out-of-bag error estimate; parallel training.'],
    cons: ['Large models with slower prediction than a single tree.', 'Cannot extrapolate.', 'Less interpretable than one tree; impurity importances are biased toward high-cardinality features.'],
    use: r`A reliable, low-effort baseline for almost any tabular problem.`,
    avoid: r`You need the last few percent of accuracy (try boosting) or tiny, fast models.`,
    complexity: [r`$O(B\,p'\,n\log n)$`, r`$O(B \cdot \text{depth})$`],
    glance: { learns: 'B deep trees', family: 'Bagging ensemble' },
    code: r`from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance

rf = RandomForestRegressor(n_estimators=500, max_features=0.5, oob_score=True,
                           n_jobs=-1, random_state=0).fit(X_tr, y_tr)
print("OOB R2:", round(rf.oob_score_, 3), "test R2:", round(rf.score(X_te, y_te), 3))
imp = permutation_importance(rf, X_te, y_te, n_repeats=10, random_state=0)
print(sorted(zip(imp.importances_mean.round(3), X.columns), reverse=True)[:5])`,
    pitfalls: [r`Trusting impurity-based <code>feature_importances_</code>; prefer permutation importance on held-out data.`, r`Tuning <code>n_estimators</code> as if it could overfit. It cannot; it only costs time.`],
    quiz: [
      { q: r`Why does a random forest sample features at each split?`, o: [r`To speed up training only`, r`To decorrelate the trees, so averaging reduces variance more`, r`To reduce bias`, r`To handle missing values`], a: 1, why: r`Without it, every tree would split on the same strong feature first and they would make similar mistakes.` },
      { q: r`Adding more trees to a random forest generally:`, o: [r`Causes overfitting`, r`Stabilises predictions; test error plateaus`, r`Increases bias`, r`Lowers training time`], a: 1, why: r`More trees means the average converges; it does not add flexibility to each tree.` },
    ],
    related: ['decision_tree_regressor', 'gradient_boosting_regressor', 'random_forest_classifier'],
    prereq: ['decision_tree_regressor'],
    concepts: ['bias-variance-tradeoff', 'cross-validation', 'feature-selection'],
    labIntro: r`Each faint line is one tree trained on a bootstrap sample; the bright line is their average.`,
    tryThis: [r`With 1 tree the fit is blocky and noisy. Add trees and watch the average smooth out.`, r`Note how test RMSE stops improving after a few dozen trees.`, r`Lower max depth and compare: shallower trees average into a less detailed curve.`],
    keywords: 'random forest bagging bootstrap out of bag ensemble trees',
  },
  {
    id: 'gradient_boosting_regressor', short: 'Gradient boosting regressor', title: 'Gradient Boosting Regression (GBM)',
    task: 'regression', module: 'Trees and ensembles', level: 2, minutes: 20,
    summary: r`Builds shallow trees one at a time, each fitting the errors the ensemble still makes. The idea behind XGBoost, LightGBM and CatBoost.`,
    lead: r`Start with a constant prediction. Fit a small tree to the residuals, add a shrunken copy of it to the model, recompute the residuals, and repeat. Each tree fixes a bit of what the previous ones got wrong.`,
    intuition: [
      r`For squared error, the residuals $y - \hat y$ are exactly the negative gradient of the loss with respect to the prediction. So fitting a tree to residuals is gradient descent, not on weights, but in "function space". Swap the loss and you get boosting for absolute error, quantiles or classification, with the same algorithm.`,
      r`The learning rate $\eta$ shrinks each tree’s contribution. Small $\eta$ with many trees almost always generalises better than large $\eta$ with few. Unlike a random forest, boosting can overfit if you add too many trees, so early stopping on a validation set is standard.`,
    ],
    analogy: r`A team of editors working in sequence, each one fixing only the mistakes the previous editors left behind.`,
    steps: [r`Initialise $F_0(x) = \bar y$.`, r`Compute pseudo-residuals $r_i = -\partial L/\partial F(x_i)$; for squared error that is $y_i - F(x_i)$.`, r`Fit a shallow regression tree to the pseudo-residuals.`, r`Update $F_m = F_{m-1} + \eta \cdot \text{tree}_m$.`, r`Repeat; stop when validation error stops improving.`],
    math: [
      { h: 'Stage-wise additive model', tex: r`$$F_M(x) = F_0(x) + \eta\sum_{m=1}^M h_m(x)$$`, p: r`Each $h_m$ is a small tree. Nothing is ever refitted; the model only grows.` },
      { h: 'Gradient in function space', tex: r`$$r_{im} = -\left.\frac{\partial L(y_i, F(x_i))}{\partial F(x_i)}\right|_{F = F_{m-1}}, \qquad L = \tfrac12(y - F)^2 \Rightarrow r_{im} = y_i - F_{m-1}(x_i)$$`, p: r`Each tree approximates the direction of steepest descent of the loss, evaluated at the training points.` },
    ],
    hyper: [['n_estimators', 'Number of boosting rounds.', 'Hundreds to thousands, with early stopping.'], ['learning_rate', 'Shrinkage per tree.', '0.01–0.1; lower needs more trees.'], ['max_depth', 'Size of each tree.', '3–6; controls interaction depth.'], ['subsample', 'Row fraction per tree (stochastic GB).', '0.5–0.8 regularises.']],
    pros: ['State-of-the-art on tabular data.', 'Flexible loss functions.', 'Handles mixed features and interactions without scaling.'],
    cons: ['Sequential, so slower to train than a forest.', 'Several interacting hyperparameters.', 'Can overfit with too many rounds.'],
    use: r`Tabular problems where accuracy matters and you can afford some tuning.`,
    avoid: r`Very small data where a simpler model is easier to trust, or when you need extrapolation.`,
    complexity: [r`$O(M\,p\,n\log n)$`, r`$O(M \cdot \text{depth})$`],
    glance: { learns: 'M small trees, added in sequence', family: 'Boosting ensemble' },
    code: r`from sklearn.ensemble import GradientBoostingRegressor

gbr = GradientBoostingRegressor(n_estimators=2000, learning_rate=0.05, max_depth=3,
                                subsample=0.8, validation_fraction=0.1,
                                n_iter_no_change=50, random_state=0).fit(X_tr, y_tr)
print("trees actually used:", gbr.n_estimators_, "test R2:", round(gbr.score(X_te, y_te), 3))`,
    pitfalls: [r`Using a large learning rate to save time; it usually costs accuracy.`, r`Running without early stopping and over-fitting quietly.`],
    quiz: [
      { q: r`For squared-error loss, each new tree in gradient boosting is fitted to:`, o: [r`The original targets`, r`The residuals of the current ensemble`, r`A bootstrap sample`, r`The previous tree’s predictions`], a: 1, why: r`Residuals are the negative gradient of squared error with respect to the predictions.` },
      { q: r`Lower learning rate, same number of trees: what typically happens?`, o: [r`Underfits; you need more trees`, r`Overfits`, r`No change`, r`Trees get deeper`], a: 0, why: r`Each tree contributes less, so more rounds are needed to reach the same fit, though the final model usually generalises better.` },
    ],
    related: ['xgboost_regressor', 'lightgbm_regressor', 'catboost_regressor'],
    prereq: ['decision_tree_regressor', 'gradient-descent'],
    concepts: ['gradient-descent', 'loss-functions', 'bias-variance-tradeoff'],
    labIntro: r`Boosting rounds play out one by one. The top plot shows the ensemble; the bottom shows the residuals the next tree will fit.`,
    tryThis: [r`Press <em>Step</em> a few times: each tree targets what is left in the residual plot.`, r`Set the learning rate to 1.0 and watch training error fall fast while the fit gets jagged.`, r`Use depth 1 trees (stumps): many more rounds are needed, but the result is smooth.`],
    keywords: 'gradient boosting gbm residuals additive trees learning rate',
  },
  {
    id: 'xgboost_regressor', short: 'XGBoost', title: 'XGBoost Regression',
    task: 'regression', module: 'Trees and ensembles', level: 3, minutes: 20,
    summary: r`Gradient boosting with second-order gradients, explicit regularisation of the trees, and heavy engineering for speed.`,
    lead: r`XGBoost is gradient boosting made precise and fast. It uses both the gradient and the curvature (Hessian) of the loss, and penalises tree complexity directly in the split gain.`,
    intuition: [
      r`Classic boosting fits a tree to gradients and then works out leaf values. XGBoost uses a second-order Taylor expansion of the loss, which gives a closed-form optimal value for each leaf and an exact formula for how much a split improves the objective, penalty included.`,
      r`Two regularisers are built in: $\lambda$ shrinks leaf values (like ridge on the tree’s outputs), and $\gamma$ is a minimum gain required to make a split at all, so splits that do not pay for themselves are never made. Add column subsampling, sparsity-aware split finding for missing values, and a cache-aware implementation, and you get the library that dominated Kaggle for years.`,
    ],
    analogy: r`Boosting with a more careful editor: each correction is sized using both the slope and the curvature of the error, and small corrections that are not worth the ink are skipped.`,
    steps: [r`Compute gradients $g_i$ and Hessians $h_i$ of the loss for every row.`, r`Grow a tree level by level; for each candidate split compute the exact gain from sums of $g$ and $h$.`, r`Skip splits with gain below $\gamma$; set each leaf to $-G/(H+\lambda)$.`, r`Add the tree scaled by $\eta$; repeat with early stopping.`],
    math: [
      { h: 'Second-order objective for one tree', tex: r`$$\tilde{\mathcal L} = \sum_i \Big[g_i f(x_i) + \tfrac12 h_i f(x_i)^2\Big] + \gamma T + \tfrac{\lambda}{2}\sum_{j=1}^T w_j^2$$`, p: r`$T$ is the number of leaves and $w_j$ the leaf values. For squared error, $g_i = \hat y_i - y_i$ and $h_i = 1$.` },
      { h: 'Optimal leaf and split gain', tex: r`$$w_j^* = -\frac{G_j}{H_j + \lambda}, \qquad \text{Gain} = \tfrac12\Big[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{H_L + H_R + \lambda}\Big] - \gamma$$`, p: r`$G$ and $H$ are sums of gradients and Hessians in a node. A split is kept only if its gain is positive.` },
    ],
    hyper: [['n_estimators + early_stopping_rounds', 'Boosting rounds.', 'Set high and let early stopping decide.'], ['learning_rate (eta)', 'Shrinkage.', '0.01–0.1.'], ['max_depth', 'Tree depth.', '3–8.'], ['reg_lambda, gamma', 'Leaf L2 penalty, min split gain.', 'lambda 1–10; gamma 0–5.'], ['subsample, colsample_bytree', 'Row and column sampling.', '0.6–0.9.']],
    pros: ['Excellent accuracy on tabular data.', 'Built-in regularisation and missing-value handling.', 'Fast, parallel, GPU support, mature tooling.'],
    cons: ['Many hyperparameters.', 'Level-wise growth can be slower than LightGBM on very large data.', 'Categorical features need encoding (native support is newer and more limited).'],
    use: r`Tabular competitions and production models where accuracy is the priority.`,
    avoid: r`Tiny datasets or when a linear model is good enough and easier to explain.`,
    complexity: [r`$O(M \cdot \text{depth} \cdot p\,n)$ with pre-sorted/hist splits`, r`$O(M \cdot \text{depth})$`],
    glance: { learns: 'Regularised trees with optimal leaf values', family: 'Boosting (2nd order)' },
    code: r`import xgboost as xgb

model = xgb.XGBRegressor(n_estimators=3000, learning_rate=0.03, max_depth=5,
                         subsample=0.8, colsample_bytree=0.8, reg_lambda=1.0, gamma=0.0,
                         early_stopping_rounds=100, eval_metric="rmse", random_state=0)
model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)
print("best iteration:", model.best_iteration)`,
    pitfalls: [r`Early-stopping on the test set you then report. Use a separate validation split.`, r`Cranking up depth instead of rounds; deep trees overfit fast.`],
    quiz: [
      { q: r`What is $\gamma$ in XGBoost?`, o: [r`Learning rate`, r`Minimum gain required to make a split`, r`Leaf L2 penalty`, r`Column sample rate`], a: 1, why: r`It is subtracted from each split’s gain, so splits must improve the objective by at least $\gamma$.` },
      { q: r`With squared error, the optimal leaf value $-G/(H+\lambda)$ reduces to:`, o: [r`The mean residual in the leaf, shrunk toward 0 by $\lambda$`, r`The median target`, r`Zero`, r`The maximum residual`], a: 0, why: r`$h_i = 1$, so $H$ is the count; $-G/(n+\lambda)$ is the mean residual with ridge-like shrinkage.` },
    ],
    related: ['gradient_boosting_regressor', 'lightgbm_regressor', 'catboost_regressor'],
    prereq: ['gradient_boosting_regressor'],
    concepts: ['regularization', 'gradient-descent'],
    labIntro: r`A small XGBoost-style booster written in the browser: second-order leaf values with $\lambda$, and splits pruned when gain is below $\gamma$.`,
    tryThis: [r`Raise $\gamma$: watch the leaf count per tree fall as weak splits are refused.`, r`Raise $\lambda$: leaf values shrink, so each round moves the fit less.`, r`Compare final test RMSE at $\gamma = 0$ and $\gamma = 0.5$.`],
    keywords: 'xgboost extreme gradient boosting hessian regularised trees gamma lambda',
  },
  {
    id: 'lightgbm_regressor', short: 'LightGBM', title: 'LightGBM Regression',
    task: 'regression', module: 'Trees and ensembles', level: 3, minutes: 18,
    summary: r`Gradient boosting built for speed: histogram binning, leaf-wise tree growth and gradient-based row sampling.`,
    lead: r`LightGBM gets its speed from three ideas: bucket each feature into a small number of bins, grow trees leaf-wise (always splitting the most useful leaf), and sample rows smartly by gradient size.`,
    intuition: [
      r`<strong>Histograms:</strong> instead of sorting every value, each feature is bucketed into at most 255 bins once. Split search then scans bins, not rows. It is a lot faster and barely less accurate.`,
      r`<strong>Leaf-wise growth:</strong> level-wise trees (XGBoost’s default) split every node at a depth. LightGBM always splits the single leaf with the largest gain. For the same number of leaves, this reduces loss more, but it can grow deep, lopsided branches, so <code>num_leaves</code> and <code>min_data_in_leaf</code> matter.`,
      r`<strong>GOSS</strong> keeps all rows with large gradients (the ones the model gets wrong) and a random sample of the rest, up-weighted to stay unbiased. <strong>EFB</strong> bundles mutually exclusive sparse features into one.`,
    ],
    analogy: r`Instead of sorting every house by exact price, sort them into 255 price bands, and always spend effort on the neighbourhood where predictions are worst.`,
    steps: [r`Bin each feature into histograms once.`, r`For each round, compute gradients; optionally apply GOSS row sampling.`, r`Grow a tree leaf-wise: repeatedly split the leaf with the best gain until <code>num_leaves</code> is reached.`, r`Add the shrunken tree and repeat with early stopping.`],
    math: [
      { h: 'Histogram split search', tex: r`$$\text{Gain}(b) = \frac{G_{\le b}^2}{H_{\le b} + \lambda} + \frac{G_{>b}^2}{H_{>b} + \lambda} - \frac{G^2}{H + \lambda}$$`, p: r`Gradient sums per bin are accumulated once; every candidate threshold $b$ is then a cumulative sum. Cost per feature is $O(\text{bins})$ instead of $O(n)$.` },
      { h: 'GOSS re-weighting', tex: r`$$\tilde G = \sum_{i \in A} g_i + \frac{1 - a}{b}\sum_{i \in B} g_i$$`, p: r`$A$ is the top-$a$ fraction by $|g|$; $B$ is a random $b$ fraction of the rest, up-weighted so the gradient estimate stays unbiased.` },
    ],
    hyper: [['num_leaves', 'Max leaves per tree (main complexity knob).', '15–255; keep below 2^max_depth.'], ['min_child_samples', 'Min rows per leaf.', '20–100 to curb deep branches.'], ['learning_rate / n_estimators', 'Shrinkage and rounds.', '0.03–0.1 with early stopping.'], ['max_bin', 'Histogram resolution.', '255 default; lower is faster and more regularised.'], ['feature_fraction, bagging_fraction', 'Column and row sampling.', '0.7–0.9.']],
    pros: ['Very fast on large data; low memory.', 'Native categorical support.', 'Accuracy on par with XGBoost.'],
    cons: ['Leaf-wise growth overfits small datasets more easily.', 'Many parameters, with aliases that can confuse.'],
    use: r`Large tabular datasets where training speed matters.`,
    avoid: r`Very small datasets (a few thousand rows), unless you constrain num_leaves and leaf size.`,
    complexity: [r`$O(M \cdot \text{leaves} \cdot p \cdot \text{bins})$ after binning`, r`$O(M \cdot \text{depth})$`],
    glance: { learns: 'Leaf-wise trees on histograms', family: 'Boosting (histogram)' },
    code: r`import lightgbm as lgb

model = lgb.LGBMRegressor(n_estimators=5000, learning_rate=0.03, num_leaves=31,
                          min_child_samples=30, feature_fraction=0.8, bagging_fraction=0.8,
                          bagging_freq=1, random_state=0, verbose=-1)
model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], callbacks=[lgb.early_stopping(100, verbose=False)])
print("best iteration:", model.best_iteration_)`,
    pitfalls: [r`Setting num_leaves to $2^{\text{max\_depth}}$ by habit: that is far more complex than an equivalent XGBoost tree.`, r`Passing categorical columns as plain integers without telling LightGBM they are categorical.`],
    quiz: [
      { q: r`Leaf-wise growth differs from level-wise growth because it:`, o: [r`Splits every leaf at the current depth`, r`Always splits the single leaf with the largest gain`, r`Never splits leaves`, r`Uses random splits`], a: 1, why: r`It greedily spends the leaf budget where it reduces loss most, which can produce deep, asymmetric trees.` },
      { q: r`What does histogram binning trade away?`, o: [r`Nothing`, r`A little split precision for a large speed-up`, r`Support for missing values`, r`Regularisation`], a: 1, why: r`Thresholds can only fall on bin edges, which rarely matters in practice.` },
    ],
    related: ['xgboost_regressor', 'catboost_regressor', 'gradient_boosting_regressor'],
    prereq: ['gradient_boosting_regressor'],
    concepts: ['regularization'],
    labIntro: r`A browser booster with LightGBM’s two signature ideas: features bucketed into a set number of bins, and leaf-wise tree growth limited by a leaf budget.`,
    tryThis: [r`Drop the bin count to 4: thresholds snap to coarse bin edges and the fit gets blocky.`, r`Switch between leaf-wise and level-wise growth at the same leaf budget and compare training loss.`],
    keywords: 'lightgbm histogram leaf wise goss efb boosting',
  },
  {
    id: 'catboost_regressor', short: 'CatBoost', title: 'CatBoost Regression',
    task: 'regression', module: 'Trees and ensembles', level: 3, minutes: 18,
    summary: r`Gradient boosting with symmetric trees and leak-free handling of categorical features. Strong defaults, little tuning.`,
    lead: r`CatBoost’s two ideas: oblivious (symmetric) trees, which use the same split at every node of a level, and ordered target statistics, which encode categories without leaking the target.`,
    intuition: [
      r`<strong>Oblivious trees:</strong> every node at the same depth asks the same question. A depth-6 tree is just 6 yes/no questions, giving 64 leaves indexed by a 6-bit code. They are less flexible individually but very regular, fast to evaluate and hard to overfit.`,
      r`<strong>Ordered target statistics:</strong> replacing a category (say, a city) with the mean target for that city leaks the label into the feature: a city that appears once gets exactly its own target. CatBoost imagines the rows arriving in a random order and encodes each row using only the rows <em>before</em> it, plus a prior. The same trick ("ordered boosting") is used for the residuals.`,
    ],
    analogy: r`A quiz where every contestant on a given round gets the same question, and when judging someone you only use answers given before theirs.`,
    steps: [r`Shuffle rows into several random permutations.`, r`Encode categorical features with ordered target statistics (and their combinations).`, r`Grow oblivious trees: at each depth pick the one split that best reduces loss across all nodes of that level.`, r`Compute leaf values with ordered boosting to avoid prediction shift; repeat.`],
    math: [
      { h: 'Ordered target statistic', tex: r`$$\hat x_k^{(i)} = \frac{\sum_{j < i,\; x_j = x_i} y_j + a\,P}{\sum_{j < i,\; x_j = x_i} 1 + a}$$`, p: r`Only rows earlier in the permutation contribute. $P$ is a prior (often the global mean) and $a$ its weight, which keeps rare categories near the prior.` },
      { h: 'Oblivious tree as a lookup', tex: r`$$\text{leaf}(x) = \sum_{d=1}^{D} 2^{d-1}\,\mathbb 1[x_{f_d} > t_d]$$`, p: r`One feature–threshold pair per level; the leaf index is a $D$-bit number, so evaluation is a few comparisons and a table lookup.` },
    ],
    hyper: [['iterations, learning_rate', 'Rounds and shrinkage.', 'Defaults are tuned; use early stopping.'], ['depth', 'Levels in each symmetric tree.', '4–8 (default 6).'], ['l2_leaf_reg', 'L2 on leaf values.', '1–10.'], ['cat_features', 'Which columns are categorical.', 'Pass them; do not one-hot encode.']],
    pros: ['Best-in-class categorical handling without manual encoding.', 'Strong defaults; often good without tuning.', 'Fast inference thanks to symmetric trees.'],
    cons: ['Slower training than LightGBM on large numeric data.', 'Oblivious trees can need more depth for some interactions.'],
    use: r`Data with many or high-cardinality categorical features.`,
    avoid: r`Purely numeric, very large data where LightGBM trains faster.`,
    complexity: [r`$O(M \cdot D \cdot p\,n)$`, r`$O(M \cdot D)$`],
    glance: { learns: 'Symmetric trees + ordered encodings', family: 'Boosting (ordered)' },
    code: r`from catboost import CatBoostRegressor

cat_cols = [c for c in X_tr.columns if X_tr[c].dtype == "object"]
model = CatBoostRegressor(iterations=3000, learning_rate=0.05, depth=6, l2_leaf_reg=3,
                          loss_function="RMSE", random_seed=0, verbose=0)
model.fit(X_tr, y_tr, cat_features=cat_cols, eval_set=(X_te, y_te), early_stopping_rounds=100)
print("best iteration:", model.get_best_iteration())`,
    pitfalls: [r`One-hot encoding categories yourself and losing CatBoost’s main advantage.`, r`Using naive target encoding elsewhere in the pipeline and reintroducing leakage.`],
    quiz: [
      { q: r`What makes a tree "oblivious"?`, o: [r`It ignores categorical features`, r`All nodes at the same depth use the same split`, r`It has a single split`, r`It is grown on random data`], a: 1, why: r`One feature–threshold pair per level, so the tree is symmetric.` },
      { q: r`Why is naive target encoding leaky?`, o: [r`It uses the median`, r`A row’s own target is included in the encoding of its category`, r`It is too slow`, r`It needs scaling`], a: 1, why: r`For rare categories the encoding nearly equals the row’s own label, which the model then exploits.` },
    ],
    related: ['xgboost_regressor', 'lightgbm_regressor', 'gradient_boosting_regressor'],
    prereq: ['gradient_boosting_regressor'],
    concepts: ['feature-selection', 'exploratory-data-analysis'],
    labIntro: r`A browser booster that grows oblivious trees: one threshold per level, shared by every node. With one input, a depth-$D$ tree can still place $D$ cuts.`,
    tryThis: [r`Compare depth 2 and depth 4: each extra level adds one shared cut per tree.`, r`Raise l2_leaf_reg and watch each round’s correction shrink.`],
    keywords: 'catboost categorical ordered target statistics oblivious symmetric trees',
  },
  // ------------------------------------------------------------------ neural
  {
    id: 'mlp_regressor', short: 'MLP regressor', title: 'Multi-Layer Perceptron Regression',
    task: 'regression', module: 'Neural networks', level: 2, minutes: 20,
    summary: r`A small neural network: layers of weighted sums and non-linear activations, trained by backpropagation.`,
    lead: r`An MLP stacks layers of "weighted sum, then a non-linear squash". With enough hidden units, it can approximate any smooth function. It learns its own features instead of you engineering them.`,
    intuition: [
      r`Each hidden unit computes $\text{ReLU}(w^\top x + b)$: a hinge that is flat on one side and sloped on the other. A layer of such hinges, added together, can trace any piecewise-linear curve; a second layer can combine those into more complex shapes.`,
      r`Training uses [[gradient-descent]]: run a batch forward, measure squared error, use the chain rule (backpropagation) to get the gradient of the loss for every weight, nudge the weights downhill, repeat. Scaling inputs, a sensible learning rate and early stopping make or break the result.`,
    ],
    analogy: r`Building a curve out of many small adjustable hinges and letting the data decide where each hinge bends.`,
    steps: [r`Scale inputs (and often the target).`, r`Forward pass: $h = \sigma(W_1x + b_1)$, $\hat y = W_2h + b_2$.`, r`Compute the loss, e.g. mean squared error plus an L2 penalty.`, r`Backward pass: chain rule from the output to every weight.`, r`Update weights with Adam or SGD; repeat for many epochs with early stopping.`],
    math: [
      { h: 'Forward pass (one hidden layer)', tex: r`$$h = \sigma(W_1 x + b_1), \qquad \hat y = W_2 h + b_2$$`, p: r`$\sigma$ is the activation: ReLU $\max(0, z)$, tanh, or logistic.` },
      { h: 'Backpropagation', tex: r`$$\frac{\partial L}{\partial W_2} = (\hat y - y)\,h^\top, \qquad \frac{\partial L}{\partial W_1} = \big[(W_2^\top(\hat y - y)) \odot \sigma'(z_1)\big]\,x^\top$$`, p: r`The error signal flows backwards and is multiplied by each layer’s local derivative.` },
    ],
    hyper: [['hidden_layer_sizes', 'Width and depth.', '(64,), (128, 64) for tabular data.'], ['alpha', 'L2 penalty.', '1e-5 to 1e-2.'], ['learning_rate_init', 'Step size for Adam.', '1e-3 default.'], ['early_stopping', 'Stop when validation score stalls.', 'Turn on.']],
    pros: ['Learns non-linear features automatically.', 'Scales to large data with mini-batches.', 'The foundation for every deep learning model.'],
    cons: ['Needs scaling and tuning; sensitive to initialisation.', 'Usually beaten by gradient boosting on small tabular data.', 'Hard to interpret.'],
    use: r`Large datasets, smooth non-linear signal, or as a stepping stone to deep learning.`,
    avoid: r`Small tabular datasets where boosting is faster and stronger.`,
    complexity: [r`$O(\text{epochs} \cdot n \cdot \text{weights})$`, r`$O(\text{weights})$`],
    glance: { learns: 'Weights of every layer', family: 'Neural network' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor

mlp = make_pipeline(StandardScaler(),
                    MLPRegressor(hidden_layer_sizes=(64, 32), alpha=1e-3, learning_rate_init=1e-3,
                                 early_stopping=True, max_iter=2000, random_state=0))
mlp.fit(X_tr, y_tr)
print("test R2:", round(mlp.score(X_te, y_te), 3))`,
    pitfalls: [r`Not scaling inputs, which makes training slow or unstable.`, r`Judging by one random seed; results vary with initialisation.`],
    quiz: [
      { q: r`Why does an MLP need a non-linear activation?`, o: [r`To speed up training`, r`Without it, stacked layers collapse into one linear map`, r`To normalise the inputs`, r`It does not need one`], a: 1, why: r`A product of linear maps is linear, so depth would add nothing.` },
      { q: r`Backpropagation computes:`, o: [r`The optimal learning rate`, r`Gradients of the loss for every weight via the chain rule`, r`The number of hidden units`, r`A closed-form solution`], a: 1, why: r`It reuses intermediate results from the forward pass to get all gradients in one backward sweep.` },
    ],
    related: ['mlp_classifier', 'perceptron', 'gaussian_process_regressor'],
    prereq: ['gradient-descent', 'loss-functions'],
    concepts: ['gradient-descent', 'regularization'],
    labIntro: r`A tiny network trained live in your browser on a wiggly curve. The faint lines show what individual hidden units contribute.`,
    tryThis: [r`With 2 hidden units, the network can only make a couple of bends.`, r`Switch activation to tanh and compare the shape of the fit.`, r`Set the learning rate very high and watch the loss curve oscillate.`],
    keywords: 'mlp neural network backpropagation relu hidden layer regression',
  },
];
