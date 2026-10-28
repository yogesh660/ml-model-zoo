// Classification path (non-neural). See regression.js for conventions.
const r = String.raw;

module.exports = [
  // ------------------------------------------------------------------ linear & probabilistic
  {
    id: 'logistic_regression', short: 'Logistic regression', title: 'Logistic Regression',
    task: 'classification', module: 'Linear and probabilistic', level: 1, minutes: 20,
    summary: r`The workhorse classifier: a linear score turned into a probability by the sigmoid, fitted by maximum likelihood.`,
    lead: r`Compute a linear score $z = w^\top x + b$, squash it into a probability with the sigmoid $\sigma(z) = 1/(1 + e^{-z})$, and choose the weights that make the observed labels most likely.`,
    intuition: [
      r`Linear regression can output any number, but a probability has to live between 0 and 1. Logistic regression models the [[log-odds]] as linear: $\log\frac{p}{1-p} = w^\top x + b$. Every unit increase in a feature multiplies the odds by $e^{w_j}$, which is why doctors and risk teams love it.`,
      r`The decision boundary $w^\top x + b = 0$ is a straight line (a hyperplane). Points far from it on either side get confident probabilities; points near it get probabilities near 0.5. The model is trained by minimising log-loss (cross-entropy), which is the same as [[maximum-likelihood-estimation|maximum likelihood]] under a Bernoulli model.`,
    ],
    analogy: r`A weighted checklist that adds up evidence for "yes", then converts the total into a calibrated chance.`,
    steps: [r`Compute $z_i = w^\top x_i + b$ for every row.`, r`Turn scores into probabilities $p_i = \sigma(z_i)$.`, r`Measure log-loss: heavily penalise confident wrong answers.`, r`Minimise it with L-BFGS or gradient descent (the loss is convex, so there is one optimum).`, r`Predict class 1 when $p \ge \tau$; pick the threshold $\tau$ for your costs, not by default.`],
    math: [
      { h: 'Model', tex: r`$$P(y = 1 \mid x) = \sigma(w^\top x + b) = \frac{1}{1 + e^{-(w^\top x + b)}}$$`, p: r`Equivalently $\log\frac{p}{1-p} = w^\top x + b$: linear in the log-odds.` },
      { h: 'Loss: negative log-likelihood', tex: r`$$\mathcal L(w) = -\frac1n\sum_i \big[y_i\log p_i + (1 - y_i)\log(1 - p_i)\big] + \frac{1}{2C}\lVert w\rVert^2$$`, p: r`The second term is scikit-learn’s default L2 penalty; $C$ is the inverse regularisation strength.` },
      { h: 'Gradient', tex: r`$$\nabla_w \mathcal L = \frac1n X^\top(p - y) + \frac{w}{C}$$`, p: r`The same "prediction minus truth" form as linear regression. No closed form exists, but the loss is convex, so [[quasi-newton-and-lbfgs|L-BFGS]] converges reliably.` },
    ],
    hyper: [[r`C`, r`Inverse regularisation strength.`, r`Log grid 0.001–100.`], [r`penalty`, r`l2, l1, elasticnet or none.`, r`l1 (with saga or liblinear) for sparse models.`], [r`class_weight`, r`Re-weights classes in the loss.`, r`"balanced" for imbalanced data.`], [r`threshold`, r`Not a parameter: you choose it after training.`, r`Pick from the precision–recall curve.`]],
    pros: ['Outputs well-calibrated probabilities (usually).', 'Coefficients are interpretable as log-odds ratios.', 'Fast, convex, and a strong baseline.'],
    cons: ['Linear boundary unless you engineer features.', 'Struggles with perfect separation (weights diverge) without regularisation.', 'Sensitive to correlated features, like linear regression.'],
    use: r`You need probabilities, interpretability, or a solid baseline, especially in regulated settings.`,
    avoid: r`Strongly non-linear class boundaries with no clear features to engineer.`,
    complexity: [r`$O(n\,p)$ per iteration`, r`$O(p)$`],
    glance: { learns: 'One weight per feature + bias', family: 'Linear, probabilistic' },
    code: r`import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score

df = pd.read_csv("datasets/raw/titanic.csv")
X, y = df.drop(columns="Survived"), df["Survived"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

prep = make_column_transformer((OneHotEncoder(), ["Sex", "Pclass"]), remainder=StandardScaler())
model = make_pipeline(prep, LogisticRegression(C=1.0, max_iter=1000)).fit(X_tr, y_tr)
proba = model.predict_proba(X_te)[:, 1]
print(classification_report(y_te, proba >= 0.5), "AUC", roc_auc_score(y_te, proba))`,
    pitfalls: [r`Using 0.5 as the threshold by default. The right threshold depends on the cost of each kind of mistake.`, r`Reading coefficients without scaling, or without remembering they are on the log-odds scale.`, r`Judging an imbalanced problem by accuracy. Look at [[precision-recall-f1|precision, recall]] and [[roc-auc|AUC]].`],
    quiz: [
      { q: r`A coefficient of $w_j = 0.7$ means that one unit more of $x_j$ (others fixed):`, o: [r`Raises the probability by 0.7`, r`Multiplies the odds by $e^{0.7} \approx 2$`, r`Raises the log-odds by 7%`, r`Has no direct interpretation`], a: 1, why: r`The model is linear in log-odds, so a change of 0.7 in log-odds multiplies the odds by $e^{0.7}$.` },
      { q: r`Why is log-loss used instead of squared error?`, o: [r`It is faster`, r`It is the Bernoulli negative log-likelihood and keeps the problem convex`, r`It ignores confident mistakes`, r`It needs no regularisation`], a: 1, why: r`Squared error on a sigmoid output is non-convex and penalises confident mistakes too weakly.` },
      { q: r`On perfectly separable data with no regularisation, the weights:`, o: [r`Converge to a unique value`, r`Grow without bound`, r`Become zero`, r`Equal the LDA solution`], a: 1, why: r`Scaling the weights up always makes the sigmoid sharper and the likelihood higher, so there is no finite optimum.` },
    ],
    related: ['linear_discriminant_analysis', 'support_vector_classifier', 'perceptron'],
    prereq: ['log-odds', 'sigmoid-and-link-functions'],
    concepts: ['maximum-likelihood-estimation', 'confusion-matrix', 'roc-auc'],
    labIntro: r`Logistic regression trained live by gradient descent. Background colour is the predicted probability; the dashed line is where it equals your threshold.`,
    tryThis: [r`Lower C (more regularisation) and watch the probability gradient spread out: less confident predictions.`, r`On the "circles" dataset a line cannot work. Turn on squared features and see the boundary close into a ring.`, r`Move the threshold and watch precision and recall trade places.`],
    keywords: 'logistic regression sigmoid log odds probability binary classification log loss',
  },
  {
    id: 'linear_discriminant_analysis', short: 'LDA', title: 'Linear Discriminant Analysis (LDA)',
    task: 'classification', module: 'Linear and probabilistic', level: 2, minutes: 16,
    summary: r`Models each class as a Gaussian with a shared covariance. The result is a linear boundary and a handy projection.`,
    lead: r`LDA assumes each class is a Gaussian blob with its own centre but the same shape. Under that assumption, Bayes’ rule gives a linear decision boundary, and the same maths gives the best projection for separating classes.`,
    intuition: [
      r`Logistic regression models $P(y\mid x)$ directly (discriminative). LDA models how the data in each class is generated, $P(x\mid y)$, and flips it with Bayes’ rule (generative). Because all classes share one covariance matrix, the quadratic terms cancel and the boundary is a hyperplane.`,
      r`LDA also finds the directions that maximise between-class spread relative to within-class spread (Fisher’s criterion). With $K$ classes that gives up to $K-1$ dimensions, a supervised alternative to PCA for visualisation.`,
    ],
    analogy: r`Each class is a cloud of the same shape, just in a different place. Classify a point by asking which cloud it most plausibly came from.`,
    steps: [r`Estimate each class prior $\pi_k$ and mean $\mu_k$.`, r`Estimate one pooled covariance matrix $\Sigma$ from all classes.`, r`Compute a linear score $\delta_k(x)$ for every class.`, r`Predict the class with the highest score; or project onto the top discriminant directions.`],
    math: [
      { h: 'Generative model', tex: r`$$x \mid y = k \sim \mathcal N(\mu_k, \Sigma), \qquad P(y = k) = \pi_k$$`, p: r`One shared covariance $\Sigma$ for all classes is the key assumption.` },
      { h: 'Linear discriminant', tex: r`$$\delta_k(x) = x^\top\Sigma^{-1}\mu_k - \tfrac12\mu_k^\top\Sigma^{-1}\mu_k + \log\pi_k$$`, p: r`The $x^\top\Sigma^{-1}x$ term is the same for every class and cancels, so the boundary between two classes is linear.` },
      { h: 'Fisher’s criterion', tex: r`$$w^* = \arg\max_w \frac{w^\top S_B w}{w^\top S_W w}$$`, p: r`Maximise separation between class means relative to spread within classes. For two classes, $w^* \propto \Sigma^{-1}(\mu_1 - \mu_0)$.` },
    ],
    hyper: [[r`solver`, r`svd, lsqr or eigen.`, r`svd (default) does not compute $\Sigma$ explicitly; needed for many features.`], [r`shrinkage`, r`Shrinks $\Sigma$ toward a diagonal.`, r`"auto" (Ledoit–Wolf) with lsqr/eigen when $p$ is large.`], [r`priors`, r`Class priors $\pi_k$.`, r`Defaults to class frequencies.`]],
    pros: ['Closed-form, fast, no tuning in the basic form.', 'Works well with small samples when the assumption holds.', 'Doubles as supervised dimensionality reduction.'],
    cons: ['Assumes Gaussian classes with equal covariance.', 'Sensitive to outliers (means and covariances are not robust).', 'Linear boundary only.'],
    use: r`Small datasets, roughly Gaussian features, or when you want a supervised 2-D projection.`,
    avoid: r`Classes with very different spreads (use [[quadratic_discriminant_analysis|QDA]]) or heavy outliers.`,
    complexity: [r`$O(np^2 + p^3)$`, r`$O(Kp)$`],
    glance: { learns: 'Class means + one shared covariance', family: 'Generative, linear' },
    code: r`from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

lda = LinearDiscriminantAnalysis(solver="lsqr", shrinkage="auto").fit(X_tr, y_tr)
print("test accuracy:", round(lda.score(X_te, y_te), 3))

projector = LinearDiscriminantAnalysis(n_components=1).fit(X_tr, y_tr)  # supervised projection
Z = projector.transform(X_te)`,
    pitfalls: [r`Applying LDA to categorical features coded as numbers; the Gaussian assumption makes no sense there.`, r`Forgetting shrinkage when features outnumber samples.`],
    quiz: [
      { q: r`Why is the LDA boundary linear?`, o: [r`It uses a sigmoid`, r`The shared covariance makes the quadratic terms cancel`, r`It projects to one dimension`, r`It uses hinge loss`], a: 1, why: r`With equal $\Sigma$, $x^\top\Sigma^{-1}x$ appears in every class’s score and drops out of the comparison.` },
      { q: r`How many discriminant directions can LDA find for 4 classes?`, o: [r`1`, r`3`, r`4`, r`As many as features`], a: 1, why: r`The between-class scatter matrix has rank at most $K - 1$.` },
    ],
    related: ['quadratic_discriminant_analysis', 'logistic_regression', 'gaussian_naive_bayes'],
    prereq: ['logistic_regression'],
    concepts: ['maximum-likelihood-estimation'],
    labIntro: r`LDA fitted live. The ellipses show the shared covariance, drawn around each class mean. The boundary is always a straight line.`,
    tryThis: [r`Choose "different spreads": LDA still draws one shape for both classes and the line misses.`, r`Compare with the QDA lesson on the same data.`],
    keywords: 'lda linear discriminant analysis fisher gaussian generative projection',
  },
  {
    id: 'quadratic_discriminant_analysis', short: 'QDA', title: 'Quadratic Discriminant Analysis (QDA)',
    task: 'classification', module: 'Linear and probabilistic', level: 2, minutes: 14,
    summary: r`Like LDA, but every class gets its own covariance, so boundaries can curve into ellipses and parabolas.`,
    lead: r`Give each class its own covariance matrix and the quadratic terms no longer cancel. The boundary becomes a conic: an ellipse, parabola or hyperbola.`,
    intuition: [
      r`If one class is a tight cluster and the other is spread out, the natural boundary wraps around the tight one. LDA cannot do that; QDA can.`,
      r`The cost is parameters: each class needs a full $p \times p$ covariance, about $Kp^2/2$ numbers. With few rows per class those estimates are noisy, so QDA overfits faster than LDA. <code>reg_param</code> blends each covariance with the identity to stabilise it.`,
    ],
    analogy: r`Each class is a cloud with its own shape. A tight cloud gets a tight fence around it.`,
    steps: [r`Estimate each class prior, mean and its own covariance $\Sigma_k$.`, r`Score each class with a quadratic function of $x$.`, r`Predict the highest score.`],
    math: [
      { h: 'Quadratic discriminant', tex: r`$$\delta_k(x) = -\tfrac12\log|\Sigma_k| - \tfrac12(x - \mu_k)^\top\Sigma_k^{-1}(x - \mu_k) + \log\pi_k$$`, p: r`The middle term is the squared Mahalanobis distance to class $k$’s centre, measured in that class’s own shape.` },
    ],
    hyper: [[r`reg_param`, r`Shrinks each covariance toward the identity.`, r`0–0.5; raise when classes are small.`], [r`priors`, r`Class priors.`, r`Defaults to class frequencies.`]],
    pros: ['Captures classes with different spreads and orientations.', 'Closed-form and fast.', 'Gives class probabilities.'],
    cons: ['Many parameters; needs enough rows per class.', 'Still assumes Gaussian classes.', 'Unstable when features are collinear.'],
    use: r`Moderate number of features, plenty of rows per class, and classes that clearly differ in spread.`,
    avoid: r`Many features or small classes; prefer LDA or regularised logistic regression.`,
    complexity: [r`$O(Knp^2 + Kp^3)$`, r`$O(Kp^2)$`],
    glance: { learns: 'Mean + covariance per class', family: 'Generative, quadratic' },
    code: r`from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis

qda = QuadraticDiscriminantAnalysis(reg_param=0.1).fit(X_tr, y_tr)
print("test accuracy:", round(qda.score(X_te, y_te), 3))`,
    pitfalls: [r`Using QDA with more features than rows in a class: the covariance is singular.`],
    quiz: [
      { q: r`QDA differs from LDA by:`, o: [r`Using a sigmoid`, r`Estimating a separate covariance per class`, r`Ignoring the priors`, r`Using kernels`], a: 1, why: r`Separate covariances keep the quadratic term in each score, so boundaries curve.` },
      { q: r`QDA with 50 features and 2 classes estimates roughly how many covariance numbers?`, o: [r`50`, r`100`, r`2,550`, r`2`], a: 2, why: r`Each symmetric $50\times 50$ matrix has $50\cdot 51/2 = 1275$ free numbers; two classes give 2,550.` },
    ],
    related: ['linear_discriminant_analysis', 'gaussian_naive_bayes', 'gaussian_mixture_models'],
    prereq: ['linear_discriminant_analysis'],
    concepts: ['bias-variance-tradeoff'],
    labIntro: r`QDA fitted live, with one covariance ellipse per class. The boundary curves to wrap around the tighter class.`,
    tryThis: [r`On "different spreads", the boundary closes into an ellipse around the tight class.`, r`Raise reg_param to 1: both ellipses become circles and the boundary straightens.`],
    keywords: 'qda quadratic discriminant analysis covariance gaussian conic boundary',
  },
  {
    id: 'gaussian_naive_bayes', short: 'Gaussian Naive Bayes', title: 'Gaussian Naive Bayes',
    task: 'classification', module: 'Linear and probabilistic', level: 1, minutes: 12,
    summary: r`Assumes features are independent within each class and Gaussian. Wrong in theory, fast and decent in practice.`,
    lead: r`Naive Bayes applies Bayes’ rule with one bold simplification: given the class, every feature is independent. For continuous features, each one gets its own 1-D Gaussian per class.`,
    intuition: [
      r`Estimating a full joint distribution over many features needs huge amounts of data. Assuming independence breaks it into one tiny 1-D problem per feature and class: just a mean and a variance. Training is a single pass over the data.`,
      r`The assumption is almost never true, but for classification you only need the <em>ranking</em> of class probabilities to be right, not the probabilities themselves. That is why Naive Bayes often classifies well while being badly calibrated.`,
    ],
    analogy: r`Judging each piece of evidence separately and multiplying the odds together, as if no two clues were related.`,
    steps: [r`For each class, compute the prior $\pi_k$.`, r`For each class and feature, compute the mean and variance.`, r`For a new point, add up the log-likelihood of each feature under each class plus the log prior.`, r`Predict the class with the highest total.`],
    math: [
      { h: 'Naive Bayes decision rule', tex: r`$$\hat y = \arg\max_k \;\log\pi_k + \sum_{j=1}^p \log \mathcal N(x_j;\, \mu_{kj}, \sigma_{kj}^2)$$`, p: r`Independence turns the joint likelihood into a product, so the log-likelihood is a sum over features.` },
    ],
    hyper: [[r`var_smoothing`, r`Adds a fraction of the largest variance to every variance.`, r`1e-9 default; raise if some features are nearly constant.`], [r`priors`, r`Class priors.`, r`Leave as class frequencies unless you know better.`]],
    pros: ['Extremely fast; one pass to train.', 'Works with very little data.', 'Handles many features gracefully.'],
    cons: ['Independence assumption ignores correlated features (they are double-counted).', 'Probabilities are poorly calibrated.', 'Each feature must be roughly Gaussian within a class.'],
    use: r`A fast baseline, streaming data, or very small datasets.`,
    avoid: r`Strongly correlated features or when you need trustworthy probabilities.`,
    complexity: [r`$O(np)$`, r`$O(Kp)$`],
    glance: { learns: 'Mean and variance per feature per class', family: 'Generative, independent' },
    code: r`from sklearn.naive_bayes import GaussianNB
from sklearn.calibration import CalibratedClassifierCV

nb = GaussianNB().fit(X_tr, y_tr)
print("accuracy:", round(nb.score(X_te, y_te), 3))
calibrated = CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5).fit(X_tr, y_tr)`,
    pitfalls: [r`Feeding it duplicated or highly correlated features: their evidence is counted twice.`, r`Trusting <code>predict_proba</code> as real probabilities without calibration.`],
    quiz: [
      { q: r`The "naive" assumption is that:`, o: [r`Classes are balanced`, r`Features are independent given the class`, r`Features are Gaussian`, r`The prior is uniform`], a: 1, why: r`Conditional independence lets the joint likelihood factor into per-feature terms.` },
      { q: r`Why can Naive Bayes classify well even when its probabilities are off?`, o: [r`It uses regularisation`, r`Only the ranking of class scores needs to be right for the decision`, r`It is a deep model`, r`It ignores the prior`], a: 1, why: r`The arg max can be correct even if the scores are overconfident.` },
    ],
    related: ['multinomial_bernoulli_nb', 'quadratic_discriminant_analysis', 'logistic_regression'],
    prereq: ['maximum-likelihood-estimation'],
    concepts: ['maximum-likelihood-estimation', 'log-odds'],
    labIntro: r`Gaussian Naive Bayes fitted live. Ellipses are always axis-aligned: independence means no tilted correlations.`,
    tryThis: [r`Use the "correlated" dataset: the true clouds are tilted, but NB can only draw upright ellipses.`, r`Compare with QDA, which can tilt.`],
    keywords: 'naive bayes gaussian independence bayes rule generative fast baseline',
  },
  {
    id: 'multinomial_bernoulli_nb', short: 'Multinomial & Bernoulli NB', title: 'Multinomial and Bernoulli Naive Bayes',
    task: 'classification', module: 'Linear and probabilistic', level: 1, minutes: 14,
    summary: r`Naive Bayes for counts and on/off features. The classic, still-competitive baseline for text classification.`,
    lead: r`For text, the features are word counts (multinomial) or word presence (Bernoulli). Naive Bayes learns how often each word appears in each class and scores new documents by adding up word log-probabilities.`,
    intuition: [
      r`A spam filter learns that "winner" and "free" are far more common in spam than in normal mail. A new email is scored by summing, for each word, the log of how much more likely that word is under spam than under ham. Words never seen in a class would give $\log 0 = -\infty$, so [[maximum-likelihood-estimation|counts]] are smoothed with a small $\alpha$ (Laplace smoothing).`,
      r`<strong>Multinomial NB</strong> uses how many times each word appears. <strong>Bernoulli NB</strong> only uses whether it appears, but also counts the <em>absence</em> of words as evidence. Bernoulli tends to suit short texts; multinomial suits longer ones.`,
    ],
    analogy: r`Every word casts a weighted vote; rare-in-ham, common-in-spam words vote loudest.`,
    steps: [r`Turn documents into word counts (or 0/1 presence).`, r`For each class, count how often each word appears, plus $\alpha$.`, r`Normalise into per-class word probabilities.`, r`Score a new document: log prior plus the sum of log word probabilities.`],
    math: [
      { h: 'Smoothed word probabilities', tex: r`$$\hat\theta_{kw} = \frac{N_{kw} + \alpha}{N_k + \alpha V}$$`, p: r`$N_{kw}$ is the count of word $w$ in class $k$, $N_k$ the total words in class $k$ and $V$ the vocabulary size.` },
      { h: 'Multinomial score', tex: r`$$\log P(k \mid d) \propto \log\pi_k + \sum_w x_{dw}\log\hat\theta_{kw}$$`, p: r`This is linear in the word counts, which is why Naive Bayes is a linear classifier in disguise.` },
    ],
    hyper: [[r`alpha`, r`Smoothing added to every count.`, r`0.01–1; tune by CV.`], [r`fit_prior`, r`Learn class priors from data.`, r`On by default.`], [r`binarize (Bernoulli)`, r`Threshold for presence.`, r`0.0 for counts.`]],
    pros: ['Very fast to train and predict, even with huge vocabularies.', 'Strong text baseline with little data.', 'Easy to inspect: the most indicative words per class.'],
    cons: ['Independence between words is clearly false.', 'Probabilities are overconfident.', 'Beaten by linear SVMs or transformers when data is plentiful.'],
    use: r`Text classification baselines: spam, topic tagging, sentiment, especially with little labelled data.`,
    avoid: r`When word order and context matter; see [[transformers_rnn_classifier]].`,
    complexity: [r`$O(\text{non-zeros})$`, r`$O(\text{words in doc})$`],
    glance: { learns: 'Word probabilities per class', family: 'Generative, discrete' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, BernoulliNB

texts = ["win a free prize now", "meeting moved to monday", "free entry to win cash",
         "lunch on friday?", "claim your free reward", "notes from the team meeting"]
labels = [1, 0, 1, 0, 1, 0]                       # 1 = spam

mnb = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0)).fit(texts, labels)
bnb = make_pipeline(CountVectorizer(binary=True), BernoulliNB(alpha=1.0)).fit(texts, labels)
print(mnb.predict_proba(["free lunch meeting"]), bnb.predict_proba(["free lunch meeting"]))`,
    pitfalls: [r`Setting alpha to 0: one unseen word sets the class probability to zero.`, r`Using Bernoulli NB on long documents where counts carry real information.`],
    quiz: [
      { q: r`Why is Laplace smoothing needed?`, o: [r`To speed up training`, r`An unseen word would give probability 0 and veto the class`, r`To balance the classes`, r`To normalise document length`], a: 1, why: r`A single zero in a product makes the whole product zero.` },
      { q: r`What does Bernoulli NB use that Multinomial NB ignores?`, o: [r`Word counts`, r`The absence of words`, r`Word order`, r`Document length`], a: 1, why: r`Bernoulli multiplies in $1 - \theta$ for every vocabulary word that does not appear.` },
    ],
    related: ['gaussian_naive_bayes', 'logistic_regression', 'transformers_rnn_classifier'],
    prereq: ['gaussian_naive_bayes'],
    concepts: ['log-odds', 'maximum-likelihood-estimation'],
    labIntro: r`A tiny spam filter trained on 16 short messages. Type your own message to see how each word votes.`,
    tryThis: [r`Type "free meeting tomorrow" and see which word wins.`, r`Set α close to 0 and type a word the filter has never seen.`, r`Switch to Bernoulli and notice that missing words now count too.`],
    keywords: 'multinomial bernoulli naive bayes text spam word counts laplace smoothing',
  },
  // ------------------------------------------------------------------ margin & instance-based
  {
    id: 'support_vector_classifier', short: 'Support vector classifier', title: 'Support Vector Machines for Classification',
    task: 'classification', module: 'Margin and instance-based', level: 3, minutes: 22,
    summary: r`Finds the boundary with the widest margin between classes. Kernels let that boundary curve.`,
    lead: r`Of all the lines that separate two classes, pick the one that leaves the widest empty street between them. Only the points on the edge of the street, the support vectors, determine where it goes.`,
    intuition: [
      r`A wide margin is a safety buffer: small perturbations of the data do not flip predictions. Real data overlaps, so a soft margin lets some points sit inside the street or on the wrong side, at a cost set by $C$. Small $C$ means a wide, tolerant street; large $C$ means a narrow street that tries hard to classify every training point.`,
      r`The kernel trick replaces dot products with a similarity function $K(x, x')$. The RBF kernel makes the boundary a weighted sum of bumps centred on support vectors, so it can wrap around any shape. $\gamma$ sets how wide each bump is.`,
    ],
    analogy: r`Laying the widest possible road between two villages; only the houses at the roadside matter.`,
    steps: [r`Scale features (distances drive everything).`, r`Choose a kernel: linear for many features, RBF otherwise.`, r`Solve the convex dual problem (SMO-style algorithms).`, r`Keep only the support vectors; predict with the sign of their weighted kernel sum.`, r`Use Platt scaling if you need probabilities.`],
    math: [
      { h: 'Soft-margin primal', tex: r`$$\min_{w,b,\xi}\;\frac12\lVert w\rVert^2 + C\sum_i\xi_i \;\;\text{s.t.}\;\; y_i(w^\top x_i + b) \ge 1 - \xi_i,\;\; \xi_i \ge 0$$`, p: r`The margin width is $2/\lVert w\rVert$, so minimising $\lVert w\rVert$ widens it. Equivalent to minimising [[loss-functions|hinge loss]] plus an L2 penalty.` },
      { h: 'Dual and the kernel trick', tex: r`$$\max_\alpha \sum_i\alpha_i - \tfrac12\sum_{i,j}\alpha_i\alpha_j y_iy_j K(x_i, x_j), \quad 0 \le \alpha_i \le C,\; \sum_i\alpha_iy_i = 0$$`, p: r`Only dot products appear, so any valid kernel can be swapped in. Points with $\alpha_i > 0$ are the support vectors.` },
      { h: 'Decision function', tex: r`$$f(x) = \operatorname{sign}\Big(\sum_{i \in SV}\alpha_i y_i K(x_i, x) + b\Big)$$`, p: r`Prediction cost grows with the number of support vectors, not the training set size.` },
    ],
    hyper: [[r`C`, r`Cost of margin violations.`, r`Log grid 0.01–1000.`], [r`kernel`, r`linear, rbf, poly.`, r`rbf default; linear for text and very wide data.`], [r`gamma`, r`RBF width (higher = more local).`, r`"scale" or log grid; tune jointly with C.`], [r`class_weight`, r`Re-weights $C$ per class.`, r`"balanced" for imbalance.`]],
    pros: ['Strong on medium-sized, high-dimensional data.', 'Convex: one global optimum.', 'Kernels give flexible boundaries with good generalisation.'],
    cons: ['Training cost grows quickly with $n$ (roughly $n^2$ to $n^3$).', 'Needs scaling and joint tuning of C and γ.', 'No native probabilities.'],
    use: r`Text classification (linear), small to medium tabular or image-feature data (RBF).`,
    avoid: r`Hundreds of thousands of rows (use LinearSVC or gradient boosting).`,
    complexity: [r`$O(n^2)$–$O(n^3)$`, r`$O(n_{SV}\,p)$`],
    glance: { learns: 'Dual weights on support vectors', family: 'Kernel, max-margin' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf"))
grid = {"svc__C": [0.1, 1, 10, 100], "svc__gamma": ["scale", 0.01, 0.1, 1]}
search = GridSearchCV(pipe, grid, cv=5).fit(X_tr, y_tr)
print(search.best_params_, "support vectors:", search.best_estimator_[-1].n_support_)`,
    pitfalls: [r`Forgetting to scale; the RBF kernel is meaningless when one feature dominates distances.`, r`Turning on <code>probability=True</code> and assuming the probabilities are consistent with <code>predict</code>; they come from a separate internal CV.`],
    quiz: [
      { q: r`Which points determine an SVM’s decision boundary?`, o: [r`All training points equally`, r`Only the support vectors on or inside the margin`, r`The class means`, r`The outliers`], a: 1, why: r`Points with $\alpha_i = 0$ could be removed without changing the solution.` },
      { q: r`Increasing $\gamma$ in an RBF SVM tends to:`, o: [r`Smooth the boundary`, r`Make the boundary more local and wiggly, risking overfitting`, r`Widen the margin`, r`Remove support vectors`], a: 1, why: r`Each support vector’s influence narrows, so the boundary can curve around individual points.` },
      { q: r`The SVM objective is equivalent to minimising:`, o: [r`Log-loss with L1 penalty`, r`Hinge loss with an L2 penalty`, r`Squared error`, r`Cross-entropy with no penalty`], a: 1, why: r`$\xi_i = \max(0, 1 - y_if(x_i))$ is the hinge loss.` },
    ],
    related: ['support_vector_regression', 'logistic_regression', 'knn_classifier'],
    prereq: ['logistic_regression', 'loss-functions'],
    concepts: ['loss-functions', 'regularization'],
    labIntro: r`An SVM trained live with the SMO algorithm. Ringed points are support vectors; dashed lines are the margins (where $f(x) = \pm 1$).`,
    tryThis: [r`With a linear kernel, drop C to 0.01: the margin widens and more points become support vectors.`, r`Switch to RBF on "moons" and raise γ until the boundary hugs individual points.`, r`Count the support vectors: they are usually a small fraction of the data.`],
    keywords: 'svm svc support vector machine margin kernel rbf hinge loss',
  },
  {
    id: 'knn_classifier', short: 'k-NN classifier', title: 'k-Nearest Neighbours Classification',
    task: 'classification', module: 'Margin and instance-based', level: 1, minutes: 12,
    summary: r`Classify a point by a vote among its k closest training examples.`,
    lead: r`To classify a point, find the $k$ training points nearest to it and let them vote. That is the entire algorithm.`,
    intuition: [
      r`k-NN draws boundaries that follow the data exactly. With $k = 1$ every training point owns the region closest to it (a Voronoi cell), so the boundary is jagged and every training point is classified correctly. Larger $k$ smooths the boundary by letting more neighbours outvote isolated points.`,
      r`Because everything rests on distance, feature scaling and the choice of metric dominate performance. In high dimensions, distances between all points become similar and "nearest" loses its meaning.`,
    ],
    analogy: r`You are probably like the people who live closest to you.`,
    steps: [r`Scale the features.`, r`Store the training data (often in a KD-tree or ball tree).`, r`For a query, find the $k$ nearest neighbours.`, r`Return the majority class (or class proportions as probabilities).`],
    math: [
      { h: 'Vote', tex: r`$$\hat y(x) = \arg\max_c \sum_{i \in N_k(x)} w_i\,\mathbb 1[y_i = c], \qquad \hat P(c \mid x) = \frac{\sum_{i \in N_k(x)} w_i\mathbb 1[y_i = c]}{\sum_{i \in N_k(x)} w_i}$$`, p: r`$w_i = 1$ for a plain vote, or $1/d(x, x_i)$ to let close neighbours count more.` },
      { h: 'Asymptotic error', tex: r`$$R^* \le R_{1\text{NN}} \le 2R^*(1 - R^*)$$`, p: r`With infinite data, 1-NN’s error is at most twice the Bayes-optimal error $R^*$: a remarkable guarantee for such a simple rule.` },
    ],
    hyper: [[r`n_neighbors`, r`Number of voters.`, r`Odd values 3–31 for binary problems; tune by CV.`], [r`weights`, r`uniform or distance.`, r`distance when densities vary.`], [r`metric`, r`Distance function.`, r`Euclidean default; cosine for text embeddings.`]],
    pros: ['No training, easy to update.', 'Naturally multi-class.', 'Flexible boundaries; predictions are explainable by example.'],
    cons: ['Slow prediction on large data.', 'Needs scaling; hurt by irrelevant features.', 'Weak in high dimensions.'],
    use: r`Low-dimensional data, recommendation by similarity, or a quick non-parametric baseline.`,
    avoid: r`Large, high-dimensional datasets or strict latency budgets.`,
    complexity: [r`$O(1)$ / $O(n\log n)$ tree build`, r`$O(\log n)$–$O(n)$ per query`],
    glance: { learns: 'Nothing: stores the data', family: 'Instance-based' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

for k in [1, 5, 15, 31]:
    model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    print(k, cross_val_score(model, X_tr, y_tr, cv=5).mean().round(3))`,
    pitfalls: [r`Evaluating on the training set with $k = 1$: always 100%.`, r`Even $k$ in binary problems: ties.`],
    quiz: [
      { q: r`With $k = 1$, training accuracy is:`, o: [r`About 50%`, r`100% (each point is its own nearest neighbour)`, r`Equal to test accuracy`, r`Undefined`], a: 1, why: r`Every training point finds itself at distance 0.` },
      { q: r`What usually happens to the boundary as $k$ grows?`, o: [r`More jagged`, r`Smoother; small islands disappear`, r`Unchanged`, r`It becomes exactly linear`], a: 1, why: r`More voters mean isolated points get outvoted.` },
    ],
    related: ['knn_regressor', 'support_vector_classifier', 'decision_tree_classifier'],
    prereq: ['exploratory-data-analysis'],
    concepts: ['bias-variance-tradeoff', 'cross-validation'],
    labIntro: r`k-NN decision regions computed live. Hover over the plot to see which neighbours vote for that spot.`,
    tryThis: [r`$k = 1$: tiny islands around every stray point.`, r`Raise $k$ until the islands vanish and test accuracy peaks.`, r`Push $k$ near the dataset size: the majority class takes over.`],
    keywords: 'knn k nearest neighbours vote voronoi instance based classifier',
  },
  // ------------------------------------------------------------------ trees & ensembles
  {
    id: 'decision_tree_classifier', short: 'Decision tree classifier', title: 'Decision Tree Classification (CART)',
    task: 'classification', module: 'Trees and ensembles', level: 1, minutes: 16,
    summary: r`A flowchart of yes/no questions learned from data. Interpretable, fast, and the base of every tree ensemble.`,
    lead: r`A classification tree splits the data with yes/no questions chosen to make each side as pure as possible, then predicts the majority class in each leaf.`,
    intuition: [
      r`"Purity" is measured by Gini impurity or entropy. A node with 50/50 classes is maximally impure; a node with one class is pure. At each step the tree picks the question that reduces impurity the most. Splits are always axis-aligned, so boundaries look like staircases.`,
      r`Left alone, a tree grows until every leaf is pure, memorising noise. Depth limits, minimum leaf sizes and pruning keep it honest. The pay-off is a model you can print and read.`,
    ],
    analogy: r`A doctor’s triage flowchart, learned from past patients.`,
    steps: [r`For each feature and threshold, compute the impurity of the two children.`, r`Choose the split with the largest impurity decrease.`, r`Recurse until a stopping rule triggers.`, r`Each leaf predicts its majority class (and class proportions as probabilities).`],
    math: [
      { h: 'Impurity measures', tex: r`$$\text{Gini}(t) = 1 - \sum_c p_c^2, \qquad H(t) = -\sum_c p_c\log_2 p_c$$`, p: r`Both are 0 for a pure node and largest for an even mix. They usually choose the same splits.` },
      { h: 'Information gain', tex: r`$$\Delta I = I(\text{parent}) - \frac{n_L}{n}I(L) - \frac{n_R}{n}I(R)$$`, p: r`A weighted average, so a pure but tiny child does not win by default.` },
    ],
    hyper: [[r`max_depth`, r`Maximum depth.`, r`3–10.`], [r`min_samples_leaf`, r`Minimum rows per leaf.`, r`1–50.`], [r`criterion`, r`gini, entropy or log_loss.`, r`Rarely matters.`], [r`ccp_alpha`, r`Cost-complexity pruning.`, r`Scan with cost_complexity_pruning_path.`]],
    pros: ['Interpretable rules.', 'No scaling; handles interactions and mixed types.', 'Fast.'],
    cons: ['High variance: unstable to small data changes.', 'Axis-aligned boundaries struggle with diagonal patterns.', 'Greedy: no guarantee of the best tree.'],
    use: r`When people need to read the model, or as a base learner.`,
    avoid: r`As your final model when accuracy matters; use a forest or boosting.`,
    complexity: [r`$O(p\,n\log n)$ per level`, r`$O(\text{depth})$`],
    glance: { learns: 'Split rules + leaf class counts', family: 'Tree' },
    code: r`from sklearn.tree import DecisionTreeClassifier, plot_tree
import matplotlib.pyplot as plt

tree = DecisionTreeClassifier(max_depth=3, min_samples_leaf=10, random_state=0).fit(X_tr, y_tr)
print("test accuracy:", round(tree.score(X_te, y_te), 3))
plot_tree(tree, feature_names=list(X_tr.columns), class_names=["no", "yes"], filled=True)
plt.show()`,
    pitfalls: [r`Unlimited depth: perfect training accuracy, disappointing test accuracy.`, r`Assuming the top split is the "most important feature" in a causal sense.`],
    quiz: [
      { q: r`Gini impurity of a node with 80% class A and 20% class B?`, o: [r`0.2`, r`0.32`, r`0.5`, r`0.8`], a: 1, why: r`$1 - (0.8^2 + 0.2^2) = 1 - 0.68 = 0.32$.` },
      { q: r`Why do decision-tree boundaries look like staircases?`, o: [r`They use kernels`, r`Every split is a threshold on a single feature`, r`They are trained with gradient descent`, r`They use a sigmoid`], a: 1, why: r`Each split is perpendicular to one feature axis.` },
    ],
    related: ['decision_tree_regressor', 'random_forest_classifier', 'adaboost_classifier'],
    prereq: ['confusion-matrix'],
    concepts: ['bias-variance-tradeoff', 'confusion-matrix'],
    labIntro: r`A CART tree grown live. Boxes are leaves; the background shows each leaf’s majority class.`,
    tryThis: [r`Grow depth one level at a time and watch each new split appear.`, r`On "diagonal", the tree needs many steps to approximate a slanted line.`, r`Switch between Gini and entropy: the splits barely change.`],
    keywords: 'decision tree classifier cart gini entropy information gain flowchart',
  },
  {
    id: 'random_forest_classifier', short: 'Random forest classifier', title: 'Random Forest Classification',
    task: 'classification', module: 'Trees and ensembles', level: 2, minutes: 16,
    summary: r`Hundreds of decorrelated trees vote. Robust, accurate and hard to break: the default tabular classifier.`,
    lead: r`Train many deep trees on bootstrap samples, each split considering only a random subset of features, and let them vote. The crowd is far more reliable than any single tree.`,
    intuition: [
      r`One deep tree overfits in its own particular way. A different tree trained on a slightly different sample overfits differently. Averaging their votes keeps the signal they share and cancels the noise they do not. Random feature selection at each split makes the trees disagree more, which makes the average better. See [[random_forest_regressor]] for the variance maths.`,
      r`The vote share is a probability-like score. Out-of-bag rows give a free validation estimate, and permutation importance shows which features the forest relies on.`,
    ],
    analogy: r`A committee of experts, each trained on different cases and told to focus on different symptoms.`,
    steps: [r`Draw a bootstrap sample for each tree.`, r`Grow each tree deep, sampling $\sqrt p$ features at each split.`, r`Predict by majority vote, or average the trees’ class probabilities.`, r`Check out-of-bag accuracy.`],
    math: [
      { h: 'Soft voting', tex: r`$$\hat P(c \mid x) = \frac1B\sum_{b=1}^B \hat P_b(c \mid x)$$`, p: r`scikit-learn averages each tree’s leaf class proportions rather than counting hard votes.` },
      { h: 'Default feature sampling', tex: r`$$m = \lfloor\sqrt p\rfloor \text{ features considered per split}$$`, p: r`The classification default; fewer features means more decorrelated trees.` },
    ],
    hyper: [[r`n_estimators`, r`Number of trees.`, r`300–1000.`], [r`max_features`, r`Features tried per split.`, r`"sqrt" default.`], [r`min_samples_leaf`, r`Leaf size.`, r`1–5.`], [r`class_weight`, r`Handles imbalance.`, r`"balanced_subsample".`]],
    pros: ['Excellent out-of-the-box accuracy.', 'Robust to noise, outliers and irrelevant features.', 'Parallel training; free OOB estimate.'],
    cons: ['Large models; slower prediction.', 'Probabilities can be poorly calibrated near 0 and 1.', 'Less interpretable than a single tree.'],
    use: r`Almost any tabular classification problem, as a first serious model.`,
    avoid: r`Very high-dimensional sparse data like text (linear models do better).`,
    complexity: [r`$O(B\sqrt p\,n\log n)$`, r`$O(B\cdot\text{depth})$`],
    glance: { learns: 'B deep trees', family: 'Bagging ensemble' },
    code: r`from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=500, min_samples_leaf=2, oob_score=True,
                            class_weight="balanced_subsample", n_jobs=-1, random_state=0)
rf.fit(X_tr, y_tr)
print("OOB accuracy:", round(rf.oob_score_, 3), "test:", round(rf.score(X_te, y_te), 3))`,
    pitfalls: [r`Trusting impurity importances for high-cardinality features.`, r`Calibrating nothing and treating vote shares as true probabilities.`],
    quiz: [
      { q: r`Why does a random forest generalise better than one deep tree?`, o: [r`Its trees are shallower`, r`Averaging decorrelated trees reduces variance`, r`It uses boosting`, r`It drops noisy rows`], a: 1, why: r`Each tree overfits differently; averaging cancels the parts that are not shared.` },
      { q: r`Out-of-bag accuracy is computed on:`, o: [r`The test set`, r`For each row, only trees that did not see it in training`, r`A random 10% split`, r`The training set`], a: 1, why: r`About 37% of rows are left out of each bootstrap sample.` },
    ],
    related: ['random_forest_regressor', 'decision_tree_classifier', 'gradient_boosted_classifiers'],
    prereq: ['decision_tree_classifier'],
    concepts: ['bias-variance-tradeoff', 'roc-auc'],
    labIntro: r`A forest grown in your browser. The background is the average vote; ragged single-tree boundaries smooth out as trees are added.`,
    tryThis: [r`Start with 1 tree and compare its jagged boundary with 50 trees.`, r`Restrict depth to 2: the forest gets smoother but may underfit.`],
    keywords: 'random forest classifier bagging voting trees out of bag',
  },
  {
    id: 'adaboost_classifier', short: 'AdaBoost', title: 'AdaBoost Classification',
    task: 'classification', module: 'Trees and ensembles', level: 2, minutes: 16,
    summary: r`The original boosting algorithm: weak learners trained in sequence, each focusing on the examples the last ones got wrong.`,
    lead: r`AdaBoost trains a sequence of weak classifiers, usually one-split trees. After each round it increases the weight of misclassified examples, so the next learner pays more attention to them.`,
    intuition: [
      r`A decision stump on its own is barely better than guessing. AdaBoost combines many of them with weights: stumps that did well get a bigger say. Because each new stump is trained on re-weighted data, the ensemble gradually carves out a complex boundary from simple pieces.`,
      r`It turns out AdaBoost is gradient boosting with an exponential loss. That loss punishes confident mistakes very hard, which makes AdaBoost sensitive to mislabelled examples and outliers.`,
    ],
    analogy: r`A tutor who notes which questions you got wrong and makes sure the next lesson focuses on them.`,
    steps: [r`Start with equal weights $w_i = 1/n$.`, r`Fit a weak learner on the weighted data; compute its weighted error $\varepsilon_m$.`, r`Give it a say $\alpha_m = \tfrac12\log\frac{1 - \varepsilon_m}{\varepsilon_m}$.`, r`Multiply the weights of misclassified rows by $e^{\alpha_m}$ and renormalise.`, r`Final prediction: the sign of $\sum_m \alpha_m h_m(x)$.`],
    math: [
      { h: 'Learner weight', tex: r`$$\alpha_m = \frac12\log\frac{1 - \varepsilon_m}{\varepsilon_m}$$`, p: r`A learner with 50% error gets zero weight; a perfect one gets infinite weight.` },
      { h: 'Re-weighting', tex: r`$$w_i \leftarrow w_i\,e^{-\alpha_m y_i h_m(x_i)}$$`, p: r`Correct points ($y_ih_m = 1$) are down-weighted, mistakes up-weighted. This is the exponential loss $e^{-yF(x)}$ in action.` },
    ],
    hyper: [[r`n_estimators`, r`Number of weak learners.`, r`50–500.`], [r`learning_rate`, r`Shrinks each $\alpha_m$.`, r`0.1–1; trade-off with n_estimators.`], [r`estimator`, r`The weak learner.`, r`Depth-1 or depth-2 trees.`]],
    pros: ['Simple, few hyperparameters.', 'Turns very weak learners into a strong model.', 'Weight history shows which examples are hard.'],
    cons: ['Sensitive to label noise and outliers (exponential loss).', 'Sequential training.', 'Usually beaten by modern gradient boosting.'],
    use: r`Clean data and a desire to understand boosting from its roots.`,
    avoid: r`Noisy labels; prefer gradient boosting with log-loss.`,
    complexity: [r`$O(M\,p\,n\log n)$ with stumps`, r`$O(M)$`],
    glance: { learns: 'M weighted stumps', family: 'Boosting (exponential loss)' },
    code: r`from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier

ada = AdaBoostClassifier(estimator=DecisionTreeClassifier(max_depth=1),
                         n_estimators=300, learning_rate=0.5, random_state=0).fit(X_tr, y_tr)
print("test accuracy:", round(ada.score(X_te, y_te), 3))`,
    pitfalls: [r`Running it on noisy labels and watching it chase the mislabelled points.`],
    quiz: [
      { q: r`What happens to the weight of a misclassified training example after a round?`, o: [r`It goes down`, r`It goes up, so the next learner focuses on it`, r`It is removed`, r`Nothing`], a: 1, why: r`It is multiplied by $e^{\alpha_m} > 1$.` },
      { q: r`AdaBoost is gradient boosting with which loss?`, o: [r`Squared error`, r`Exponential loss`, r`Hinge loss`, r`Log-loss`], a: 1, why: r`Its weight update follows from minimising $\sum_i e^{-y_iF(x_i)}$ stage by stage.` },
    ],
    related: ['gradient_boosted_classifiers', 'decision_tree_classifier', 'random_forest_classifier'],
    prereq: ['decision_tree_classifier'],
    concepts: ['loss-functions'],
    labIntro: r`Each round adds one stump. Point size shows the current weight: big points are the ones the ensemble keeps getting wrong.`,
    tryThis: [r`Step through rounds and watch the misclassified points grow.`, r`Turn on label noise: a few flipped points end up with huge weights.`],
    keywords: 'adaboost boosting stumps weights exponential loss weak learners',
  },
  {
    id: 'gradient_boosted_classifiers', short: 'Gradient boosted classifiers', title: 'Gradient Boosted Trees for Classification (XGBoost, LightGBM, CatBoost)',
    task: 'classification', module: 'Trees and ensembles', level: 3, minutes: 20,
    summary: r`Boosted trees on the log-odds scale: the strongest general-purpose classifier for tabular data.`,
    lead: r`For classification, boosting builds an additive model of the log-odds. Each tree is fitted to the gradient of log-loss, $y - p$, so it focuses on the examples the model is most wrong about.`,
    intuition: [
      r`The model keeps a running score $F(x)$ for each row, starting from the log-odds of the base rate. Each tree nudges $F$ toward the truth; the [[sigmoid-and-link-functions|sigmoid]] of $F$ is the probability. The pseudo-residual $y - p$ is large for confident mistakes and small for easy rows.`,
      r`XGBoost, LightGBM and CatBoost all implement this with different engineering: second-order leaf values and explicit regularisation (XGBoost), histogram binning and leaf-wise growth (LightGBM), symmetric trees and ordered categorical encoding (CatBoost). The regression lessons go through each in detail; the classification versions only change the loss.`,
    ],
    analogy: r`Adjusting a running score for every applicant, with each new rule written specifically for the applicants the current score misjudges.`,
    steps: [r`Initialise $F_0 = \log\frac{\bar y}{1 - \bar y}$.`, r`Compute $p_i = \sigma(F(x_i))$, gradients $g_i = p_i - y_i$, Hessians $h_i = p_i(1 - p_i)$.`, r`Fit a tree to the gradients; set leaf values $-G/(H + \lambda)$.`, r`Update $F \leftarrow F + \eta\cdot\text{tree}$; repeat with early stopping.`],
    math: [
      { h: 'Gradient and Hessian of log-loss', tex: r`$$L = -[y\log p + (1-y)\log(1-p)], \;\; p = \sigma(F) \;\Rightarrow\; \frac{\partial L}{\partial F} = p - y, \;\; \frac{\partial^2 L}{\partial F^2} = p(1-p)$$`, p: r`Rows the model is unsure about ($p \approx 0.5$) have the largest Hessian, so they carry the most weight in leaf values.` },
    ],
    hyper: [[r`n_estimators + early stopping`, r`Boosting rounds.`, r`Set high; stop on validation log-loss.`], [r`learning_rate`, r`Shrinkage.`, r`0.02–0.1.`], [r`max_depth / num_leaves`, r`Tree complexity.`, r`depth 3–8; leaves 15–127.`], [r`scale_pos_weight / class_weight`, r`Imbalance handling.`, r`≈ negatives / positives.`]],
    pros: ['Top accuracy on tabular classification.', 'Handles missing values, mixed types and interactions.', 'Mature libraries with GPU support and SHAP explanations.'],
    cons: ['Needs tuning and early stopping.', 'Can overfit small data.', 'Probabilities may still need calibration.'],
    use: r`Tabular classification when accuracy matters: credit risk, churn, fraud, ranking.`,
    avoid: r`Raw images, audio or text, where neural networks shine.`,
    complexity: [r`$O(M\cdot\text{depth}\cdot p\,n)$`, r`$O(M\cdot\text{depth})$`],
    glance: { learns: 'Trees on the log-odds scale', family: 'Boosting (log-loss)' },
    code: r`from sklearn.ensemble import HistGradientBoostingClassifier   # scikit-learn's LightGBM-style booster
# import xgboost as xgb; import lightgbm as lgb; from catboost import CatBoostClassifier

hgb = HistGradientBoostingClassifier(learning_rate=0.05, max_iter=1000, max_leaf_nodes=31,
                                     early_stopping=True, validation_fraction=0.15,
                                     random_state=0).fit(X_tr, y_tr)
print("rounds used:", hgb.n_iter_, "test accuracy:", round(hgb.score(X_te, y_te), 3))`,
    pitfalls: [r`Early stopping on accuracy instead of log-loss; accuracy is too coarse.`, r`Reporting AUC from the same data used for early stopping.`],
    quiz: [
      { q: r`In boosting for binary classification, each tree is fitted to:`, o: [r`The labels`, r`The negative gradient $y - p$`, r`Bootstrap samples`, r`The previous tree’s errors in accuracy`], a: 1, why: r`$y - p$ is the negative gradient of log-loss with respect to the raw score $F$.` },
      { q: r`Which rows have the largest Hessian $p(1-p)$?`, o: [r`Confidently correct rows`, r`Rows where $p \approx 0.5$`, r`Confidently wrong rows`, r`All rows equally`], a: 1, why: r`$p(1-p)$ peaks at 0.25 when $p = 0.5$.` },
    ],
    related: ['xgboost_regressor', 'lightgbm_regressor', 'catboost_regressor'],
    prereq: ['gradient_boosting_regressor', 'logistic_regression'],
    concepts: ['loss-functions', 'roc-auc', 'precision-recall-f1'],
    labIntro: r`Gradient boosting with log-loss, trained round by round in your browser.`,
    tryThis: [r`Watch the boundary sharpen as rounds accumulate.`, r`Use depth-1 trees: boundaries stay axis-aligned and additive, with no interactions.`, r`Raise the learning rate to 1 and compare test accuracy.`],
    keywords: 'xgboost lightgbm catboost gradient boosting classifier log loss',
  },
  {
    id: 'stacking_voting_classifiers', short: 'Stacking & voting', title: 'Stacking and Voting Ensembles',
    task: 'classification', module: 'Trees and ensembles', level: 3, minutes: 16,
    summary: r`Combine different kinds of model. Voting averages them; stacking trains a model to learn how to combine them.`,
    lead: r`Different model families make different mistakes. A voting ensemble averages their predictions; a stacking ensemble trains a small "meta-model" on their out-of-fold predictions to learn whom to trust, and when.`,
    intuition: [
      r`A linear model, a k-NN and a tree see the problem differently. Where one is confidently wrong the others may be right. <strong>Hard voting</strong> takes the majority label; <strong>soft voting</strong> averages probabilities, which usually works better because confidence counts.`,
      r`<strong>Stacking</strong> goes further: it generates each base model’s predictions with cross-validation (so they are honest), then fits a meta-learner, usually logistic regression, on those predictions. Using in-sample predictions instead would leak, because the base models have already seen those labels.`,
    ],
    analogy: r`A panel of specialists. Voting counts their opinions; stacking hires a chair who has learned which specialist to believe on which kind of case.`,
    steps: [r`Pick diverse base models.`, r`Voting: average their probabilities (soft) or labels (hard).`, r`Stacking: get out-of-fold predictions for each base model with K-fold CV.`, r`Fit the meta-model on those predictions; refit base models on all data for inference.`],
    math: [
      { h: 'Soft voting', tex: r`$$\hat P(c \mid x) = \sum_m w_m\,\hat P_m(c \mid x), \quad \sum_m w_m = 1$$`, p: r`Equal weights by default.` },
      { h: 'Stacking', tex: r`$$\hat y = g\big(\hat f_1^{(-k)}(x), \dots, \hat f_M^{(-k)}(x)\big)$$`, p: r`$\hat f_m^{(-k)}$ is base model $m$ trained without the fold containing $x$; $g$ is the meta-learner.` },
    ],
    hyper: [[r`estimators`, r`The base models.`, r`Diversity matters more than individual strength.`], [r`voting`, r`hard or soft.`, r`soft when models give probabilities.`], [r`final_estimator, cv`, r`Meta-model and folds for stacking.`, r`LogisticRegression, cv=5.`]],
    pros: ['Often squeezes out extra accuracy.', 'Combines strengths of different families.', 'Voting is trivial to set up.'],
    cons: ['More models to train, store and serve.', 'Gains are often small over one strong booster.', 'Stacking is easy to leak if done by hand.'],
    use: r`Competitions, or when you already have several decent, different models.`,
    avoid: r`Latency- or maintenance-constrained production systems where the gain is marginal.`,
    complexity: [r`$\sum$ base costs $\times$ (cv + 1)`, r`$\sum$ base prediction costs`],
    glance: { learns: 'Base models + combiner', family: 'Heterogeneous ensemble' },
    code: r`from sklearn.ensemble import StackingClassifier, VotingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

base = [("lr", make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))),
        ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15))),
        ("rf", RandomForestClassifier(300, random_state=0))]
vote = VotingClassifier(base, voting="soft").fit(X_tr, y_tr)
stack = StackingClassifier(base, final_estimator=LogisticRegression(), cv=5).fit(X_tr, y_tr)
print("vote", vote.score(X_te, y_te), "stack", stack.score(X_te, y_te))`,
    pitfalls: [r`Training the meta-model on in-sample base predictions: classic leakage.`, r`Stacking three near-identical models; without diversity there is nothing to gain.`],
    quiz: [
      { q: r`Why does stacking use out-of-fold predictions?`, o: [r`To save time`, r`In-sample predictions are overconfident and leak labels into the meta-model`, r`To balance classes`, r`It does not need them`], a: 1, why: r`Base models have memorised their training labels; the meta-model would learn to trust them too much.` },
      { q: r`Soft voting averages:`, o: [r`Class labels`, r`Predicted probabilities`, r`Feature importances`, r`Model weights`], a: 1, why: r`Averaging probabilities lets confident models outweigh uncertain ones.` },
    ],
    related: ['random_forest_classifier', 'gradient_boosted_classifiers', 'logistic_regression'],
    prereq: ['cross-validation', 'random_forest_classifier'],
    concepts: ['cross-validation', 'bias-variance-tradeoff'],
    labIntro: r`Three base models (logistic regression, k-NN, a shallow tree) and the ensemble you choose, all trained live.`,
    tryThis: [r`Compare each base model’s test accuracy with the soft-voting ensemble.`, r`Switch to stacking and look at the meta-model weights: which model does it trust most on this dataset?`],
    keywords: 'stacking voting ensemble meta learner blending heterogeneous',
  },
];
