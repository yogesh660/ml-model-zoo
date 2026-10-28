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
      { q: r`Elastic net with l1_ratio = 1 is equivalent to:`, o: [r`Ridge`, r`Lasso`, r`OLS`, r`Bayesian ridge`], a: 1, why: r`The L2 share is $1 - 1 = 0$, leaving only the L1 penalty.` },
      { q: r`What does the L2 part add over plain lasso?`, o: [r`Exact zeros`, r`Grouping: correlated features share weight instead of one being picked`, r`Faster prediction`, r`Non-linearity`], a: 1, why: r`The strictly convex L2 term rewards splitting weight evenly among similar features.` },
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
      { q: r`How does the Huber loss limit an outlier’s influence?`, o: [r`It deletes points beyond $\delta$`, r`Its gradient is capped at $\pm\delta$ for large residuals`, r`It squares residuals twice`, r`It uses the median target`], a: 1, why: r`Beyond $\delta$ the loss grows linearly, so its derivative stays constant: an outlier pulls with fixed force no matter how far away it is.` },
      { q: r`RANSAC’s final model is fitted on:`, o: [r`All points`, r`The largest consensus set of inliers`, r`A random subset`, r`Only the outliers`], a: 1, why: r`After finding the best minimal sample, RANSAC refits on all points within the residual threshold of it.` },
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
      { q: r`The posterior mean of Bayesian linear regression with a zero-mean Gaussian prior equals:`, o: [r`The OLS solution`, r`The ridge solution with $\lambda = \alpha/\beta$`, r`The lasso solution`, r`Zero`], a: 1, why: r`Maximising Gaussian likelihood times a Gaussian prior is the same as minimising squared error plus an L2 penalty.` },
      { q: r`Why does the prediction band widen away from the data?`, o: [r`The noise level increases there`, r`The term $x_*^\top S_N x_*$ grows when $x_*$ points in directions the data did not pin down`, r`The prior mean changes`, r`It is a plotting artefact`], a: 1, why: r`Weight uncertainty matters more for inputs far from where training data constrained the line.` },
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
      { q: r`What does increasing $k$ do to k-NN regression?`, o: [r`Increases variance`, r`Smooths predictions: more bias, less variance`, r`Makes training slower`, r`Nothing`], a: 1, why: r`Averaging more neighbours irons out noise, but also real local structure.` },
      { q: r`Why is k-NN poor at extrapolation?`, o: [r`It uses squared loss`, r`A prediction is an average of training targets, so it can never leave their range`, r`It needs scaling`, r`It overfits`], a: 1, why: r`Averages of observed targets are bounded by the observed targets.` },
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
      { q: r`Which training points are support vectors in SVR?`, o: [r`All points`, r`Points strictly inside the tube`, r`Points on or outside the ε-tube`, r`Only outliers`], a: 2, why: r`Points comfortably inside the tube incur no loss and get zero dual weight.` },
      { q: r`Increasing ε usually leads to:`, o: [r`More support vectors`, r`Fewer support vectors and a smoother fit`, r`A narrower tube`, r`Higher C`], a: 1, why: r`A wider tube contains more points for free, so fewer points constrain the solution.` },
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
      { q: r`What does the RBF length scale $\ell$ control?`, o: [r`The noise level`, r`How quickly the function can change with the input`, r`The number of support vectors`, r`The prior mean`], a: 1, why: r`Small $\ell$ means correlations die off quickly, so the function can wiggle; large $\ell$ means a smooth, slowly varying function.` },
      { q: r`Why do exact GPs not scale to millions of rows?`, o: [r`They need an $n \times n$ matrix factorisation, $O(n^3)$`, r`They use gradient descent`, r`They need categorical features`, r`They store only support vectors`], a: 0, why: r`Inverting (or factorising) $K + \sigma^2 I$ is cubic in $n$ and quadratic in memory.` },
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
