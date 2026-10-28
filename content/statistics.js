// Lessons for this track. Conventions: see regression.js and CLAUDE.md.
const r = String.raw;
module.exports = [
  {
    id: 'probability-rules-and-bayes-theorem',
    short: 'Probability and Bayes',
    title: r`Probability Rules and Bayes' Theorem`,
    task: 'concepts',
    module: 'Probability',
    level: 1,
    minutes: 15,
    noLab: true,
    summary: r`The calculus of uncertainty: addition, multiplication, conditional probability and Bayes' theorem. Invert probabilities to update beliefs as new evidence arrives.`,
    lead: r`Probability quantifies uncertainty on a principled scale from 0 to 1. Bayes' theorem provides the mathematical machinery to invert conditional probabilities, updating prior beliefs into posterior distributions in the light of fresh empirical data.`,
    intuition: [
      r`Suppose a clinic screens 1,000 patients for a rare disease affecting 1% of the population (10 people). A diagnostic test boasts a 90% true positive rate (detecting 9 of the 10 sick patients) and an 8% false positive rate (falsely flagging roughly 79 of the 990 healthy patients). If a patient tests positive, what is the chance they actually have the disease? Most people guess 90%, yet the actual probability is only 9 out of (9 + 79) = 88 positive tests, which is roughly 10.2%.`,
      r`This counter-intuitive outcome is known as the base rate fallacy. Because healthy individuals vastly outnumber sick individuals, even a modest false positive rate creates far more false alarms than true cases. To compute the probability of disease after seeing a positive test, you cannot evaluate the test in a vacuum; you must weigh the likelihood of the test against the prior prevalence of the disease.`,
      r`This exact reasoning powers probabilistic machine learning. A spam filter assessing an email does not merely check how often the word "lottery" appears in junk mail; it balances that evidence against the base rate of spam in your inbox. In models like [[gaussian_naive_bayes]] and Bayesian inference, Bayes' theorem is the formal engine that turns likelihoods into actionable class probabilities.`,
    ],
    analogy: r`Updating beliefs with Bayes' theorem is like spotting dark clouds: they strongly indicate rain in Manchester, but rarely mean rain in the Atacama desert.`,
    steps: [
      r`Define the sample space $\Omega$ and assign valid prior probabilities $P(A_k)$ that sum to 1 over all mutually exclusive outcomes.`,
      r`Calculate conditional probabilities using the multiplication rule: $P(A \cap B) = P(A \mid B)P(B)$.`,
      r`Sum across all mutually exclusive scenarios via the law of total probability to establish the marginal evidence $P(B)$.`,
      r`Invert the conditional direction with Bayes' theorem: multiply the prior $P(A)$ by the likelihood $P(B \mid A)$ and divide by $P(B)$.`,
      r`Use the resulting posterior distribution $P(A \mid B)$ to drive decision thresholds or serve as the prior for future observations.`,
    ],
    math: [
      {
        h: 'Probability Axioms and Fundamental Rules',
        tex: r`$$P(A \cup B) = P(A) + P(B) - P(A \cap B), \qquad P(A \cap B) = P(A \mid B)P(B)$$`,
        p: r`Kolmogorov's axioms require probabilities to be non-negative, bounded in $[0, 1]$, and sum to 1 over the sample space. The addition rule subtracts the intersection $P(A \cap B)$ so overlapping events are not counted twice. When events are mutually exclusive, $P(A \cap B) = 0$. When events are statistically independent, conditional conditioning vanishes: $P(A \mid B) = P(A)$, reducing the intersection to $P(A)P(B)$.`,
      },
      {
        h: 'The Law of Total Probability',
        tex: r`$$P(B) = \sum_{k=1}^K P(B \mid A_k)P(A_k)$$`,
        p: r`If the events $\{A_1, A_2, \dots, A_K\}$ form a partition of the sample space (meaning they are mutually exclusive and collectively exhaustive, $\bigcup_k A_k = \Omega$), the total marginal probability of any event $B$ is the weighted average of its conditional probabilities across all possible states $A_k$.`,
      },
      {
        h: 'Bayes\' Theorem',
        tex: r`$$P(A_j \mid B) = \frac{P(B \mid A_j)P(A_j)}{P(B)} = \frac{P(B \mid A_j)P(A_j)}{\sum_{k=1}^K P(B \mid A_k)P(A_k)}$$`,
        p: r`Bayes' theorem translates the prior probability $P(A_j)$ into the posterior probability $P(A_j \mid B)$ by multiplying by the likelihood $P(B \mid A_j)$ and normalising by the total probability of the evidence $P(B)$. It allows us to infer hidden causes from observed effects.`,
      },
    ],
    keyPoints: [
      r`Conditional probability $P(A \mid B)$ is mathematically distinct from $P(B \mid A)$; confusing them is the prosecutor's fallacy.`,
      r`A rare prior requires overwhelming likelihood evidence to produce a convincing posterior probability.`,
      r`Statistical independence is a property of probabilities ($P(A \cap B) = P(A)P(B)$), not of physical separation.`,
      r`Bayes' theorem is the foundation for updating models sequentially as streaming batches of data arrive.`,
    ],
    pitfalls: [
      r`Base rate neglect: evaluating the diagnostic accuracy of a classifier or test while ignoring class imbalance.`,
      r`Assuming events are independent when latent confounding factors or serial correlations link them together.`,
      r`Confusing mutually exclusive events ($P(A \cap B) = 0$) with independent events ($P(A \cap B) = P(A)P(B)$); mutually exclusive events with non-zero probability can never be independent.`,
      r`Forgetting to normalise by the denominator $P(B)$, which is essential whenever absolute posterior probabilities are required.`,
    ],
    code: r`import numpy as np

# Medical screening base-rate calculation
prior_disease = 0.01          # P(D) = 1%
prior_healthy = 1.0 - prior_disease  # P(~D) = 99%

# Test characteristics: sensitivity and false positive rate
sensitivity = 0.90            # P(+ | D) = 90%
false_positive_rate = 0.08    # P(+ | ~D) = 8%

# Total evidence: Law of total probability
p_positive = (sensitivity * prior_disease) + (false_positive_rate * prior_healthy)

# Bayes' theorem: Posterior P(D | +)
posterior = (sensitivity * prior_disease) / p_positive
print(f"P(Positive Test) = {p_positive:.4f}")
print(f"P(Disease | Positive) = {posterior:.4f}")`,
    quiz: [
      {
        q: r`A rare condition has a prevalence of 0.1%. A test has 99% sensitivity and a 2% false positive rate. If someone tests positive, their posterior probability of having the condition is closest to:`,
        o: [r`4.7%`, r`98.0%`, r`50.0%`, r`99.0%`],
        a: 0,
        why: r`$P(+) = (0.99 \times 0.001) + (0.02 \times 0.999) = 0.00099 + 0.01998 = 0.02097$. The posterior $P(\text{condition} \mid +) = 0.00099 / 0.02097 \approx 0.0472$ (or 4.7%).`,
      },
      {
        q: r`Two events $A$ and $B$ both have probability 0.5 and are mutually exclusive. What is $P(A \cap B)$?`,
        o: [r`0.25`, r`0.50`, r`0`, r`1.0`],
        a: 2,
        why: r`Mutually exclusive events cannot occur simultaneously by definition, so their intersection is the empty set with probability 0.`,
      },
      {
        q: r`Under what condition does $P(A \mid B) = P(A)$?`,
        o: [r`When $A$ and $B$ are mutually exclusive`, r`When $A$ and $B$ are statistically independent`, r`When $P(B) = 1$ only`, r`When $A$ is a subset of $B$`],
        a: 1,
        why: r`By definition of statistical independence, knowledge that $B$ has occurred provides zero information about the occurrence of $A$.`,
      },
      {
        q: r`Why does the denominator in Bayes' theorem sum over all hypotheses $A_k$?`,
        o: [r`To ensure the posterior probabilities across all hypotheses sum to 1`, r`To remove the effect of the prior`, r`To maximise the likelihood function`, r`To penalise overly complex models`],
        a: 0,
        why: r`The denominator is the marginal probability of the evidence across the full partition, acting as the normalising constant so the posteriors form a valid probability distribution.`,
      },
    ],
    usedBy: ['gaussian_naive_bayes', 'multinomial_bernoulli_nb', 'bayesian_linear_regression'],
    prereq: ['confusion-matrix'],
    related: ['random-variables-and-distributions', 'log-odds', 'maximum-likelihood-estimation'],
    keywords: 'probability bayes theorem conditional prior posterior likelihood addition multiplication law total',
  },
  {
    id: 'random-variables-and-distributions',
    short: 'Random variables',
    title: 'Random Variables and Distributions',
    task: 'concepts',
    module: 'Probability',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`Mapping random outcomes to real numbers: discrete PMFs, continuous PDFs, CDFs, and canonical distributions from Bernoulli to Gaussian.`,
    lead: r`A random variable is not a variable in the algebraic sense, but a deterministic function mapping outcomes of a random process to real numbers. Probability mass functions (PMFs) and probability density functions (PDFs) formalise where those numbers land and how likelihood concentrates across continuous and discrete domains.`,
    intuition: [
      r`Consider rolling a pair of standard dice. The actual physical outcome is an ordered pair like $(3, 5)$ or $(1, 6)$. But as a game designer or gambler, you rarely care about the individual dice faces; you care about their sum. The rule that maps the outcome $(3, 5)$ to the number 8 is a random variable. It turns messy physical events into numbers we can analyse mathematically.`,
      r`Random variables split into two families. Discrete random variables take separate, countable values: the number of website visits today, or whether an email is spam (0 or 1). We describe them with a Probability Mass Function (PMF), where each individual value has an exact probability, such as $P(X = 3) = 0.25$. Continuous random variables take values on a continuous continuum: the response time of a server in milliseconds, or the height of a person.`,
      r`For continuous variables, the probability of hitting any single exact number—like a latency of precisely 142.385921... milliseconds—is technically 0. Instead, we use a Probability Density Function (PDF) where the area under the curve between two points gives the probability of landing in that interval. Cumulative Distribution Functions (CDFs) bridge both worlds by reporting the probability of being less than or equal to any threshold.`,
    ],
    analogy: r`A probability density function is like the elevation profile of a mountain: height at a single point does not give you volume, but integrating over an area gives the total mass of rock.`,
    steps: [
      r`Define the random variable $X: \Omega \to \mathbb{R}$ by specifying what numeric quantity is extracted from each event.`,
      r`Determine whether the support of $X$ is discrete (countable integers) or continuous (real intervals).`,
      r`Assign the appropriate distribution model: PMF $p(x)$ for discrete cases or PDF $f(x)$ for continuous cases.`,
      r`Verify normalisation: discrete probabilities must sum to 1 ($\sum p(x) = 1$), while continuous density must integrate to 1 ($\int f(x)dx = 1$).`,
      r`Compute probabilities of intervals by integrating the PDF or evaluating the difference in CDF values: $P(a \le X \le b) = F(b) - F(a)$.`,
    ],
    math: [
      {
        h: 'Discrete PMF and Continuous PDF',
        tex: r`$$P(X = x) = p(x), \quad \sum_{x} p(x) = 1 \qquad \text{vs.} \qquad P(a \le X \le b) = \int_a^b f(x)\,dx, \quad \int_{-\infty}^\infty f(x)\,dx = 1$$`,
        p: r`For a discrete variable, $p(x)$ represents the exact point probability. For a continuous variable, $f(x)$ represents probability density; individual points have zero measure ($P(X = x) = 0$), so probabilities are non-zero only over intervals of non-zero width.`,
      },
      {
        h: 'Cumulative Distribution Function (CDF)',
        tex: r`$$F(x) = P(X \le x) = \begin{cases} \sum_{t \le x} p(t) & \text{discrete} \\[6pt] \int_{-\infty}^x f(t)\,dt & \text{continuous} \end{cases}$$`,
        p: r`The CDF $F(x)$ is non-decreasing, right-continuous, and satisfies $\lim_{x \to -\infty} F(x) = 0$ and $\lim_{x \to +\infty} F(x) = 1$. By the Fundamental Theorem of Calculus, for continuous variables the PDF is the derivative of the CDF: $f(x) = F'(x)$.`,
      },
      {
        h: 'The Gaussian (Normal) Distribution',
        tex: r`$$f(x \mid \mu, \sigma^2) = \frac{1}{\sigma \sqrt{2\pi}} \exp\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)$$`,
        p: r`The bell-shaped normal distribution is parameterised by its mean $\mu$ (centre of mass) and variance $\sigma^2$ (dispersion). By the 68–95–99.7 empirical rule, approximately 68.3% of the density lies within $\mu \pm \sigma$, and 95.4% lies within $\mu \pm 2\sigma$.`,
      },
    ],
    keyPoints: [
      r`A probability density $f(x)$ can exceed 1 (unlike a discrete probability), provided the total area under the curve remains 1.`,
      r`The CDF $F(x) = P(X \le x)$ exists for both discrete and continuous variables, making it the most general representation.`,
      r`The Gaussian distribution arises naturally in errors and residuals because sums of independent random variables converge to normality.`,
      r`Quantiles and percentiles are found by inverting the CDF: $x_q = F^{-1}(q)$.`,
    ],
    pitfalls: [
      r`Interpreting a continuous PDF value $f(x)$ as the probability of observing $x$; point probabilities in continuous distributions are always 0.`,
      r`Forgetting that changing scale or units alters continuous density values, while probabilities remain invariant.`,
      r`Assuming non-negative data is Gaussian, leading to negative predictions or distorted tail estimates where a Poisson, Gamma or Log-normal distribution is appropriate.`,
      r`Confusing the parameter $\sigma$ (standard deviation) with $\sigma^2$ (variance) in software library arguments.`,
    ],
    code: r`import numpy as np
from scipy import stats

# Continuous Gaussian distribution
mu, sigma = 100.0, 15.0
dist = stats.norm(loc=mu, scale=sigma)

# Probability of falling within 1 standard deviation [85, 115]
p_1sigma = dist.cdf(mu + sigma) - dist.cdf(mu - sigma)
# Exact density at the mode
density_mode = dist.pdf(mu)
# 95th percentile
p95 = dist.ppf(0.95)

print(f"P(mu - sigma <= X <= mu + sigma) = {p_1sigma:.4f}")
print(f"Density at mode f({mu}) = {density_mode:.5f}")
print(f"95th percentile = {p95:.2f}")`,
    quiz: [
      {
        q: r`For a continuous random variable $X$ with PDF $f(x)$, what is $P(X = 5)$?`,
        o: [r`$f(5)$`, r`0`, r`$F(5)$`, r`$1 - F(5)$`],
        a: 1,
        why: r`The probability of any single real point in a continuous distribution is zero, because the integral of a density over an interval of width zero evaluates to 0.`,
      },
      {
        q: r`Can the probability density function $f(x)$ of a continuous distribution ever exceed 1.0?`,
        o: [r`No, probabilities can never exceed 1.0`, r`Yes, because density is probability per unit length and can be arbitrarily large if concentrated in a tiny interval`, r`Only for discrete distributions`, r`Only if the variance is negative`],
        a: 1,
        why: r`$f(x)$ is a density, not a probability. For example, a uniform distribution on $[0, 0.5]$ has constant density $f(x) = 2.0$, which integrates to 1.0 over its support.`,
      },
      {
        q: r`If $F(x)$ is the cumulative distribution function (CDF) of $X$, how do you compute $P(a < X \le b)$?`,
        o: [r`$F(b) - F(a)$`, r`$F(b) / F(a)$`, r`$F(a) + F(b)$`, r`$f(b) - f(a)$`],
        a: 0,
        why: r`$P(a < X \le b) = P(X \le b) - P(X \le a) = F(b) - F(a)$ by definition of the cumulative distribution function.`,
      },
      {
        q: r`What proportion of probability mass lies within two standard deviations ($\mu \pm 2\sigma$) of the mean for any Gaussian distribution?`,
        o: [r`Roughly 50.0%`, r`Roughly 68.3%`, r`Roughly 95.4%`, r`Roughly 99.7%`],
        a: 2,
        why: r`The empirical rule for Gaussian distributions states that approximately 68.3% lies within $\pm 1\sigma$, 95.4% within $\pm 2\sigma$, and 99.7% within $\pm 3\sigma$.`,
      },
    ],
    usedBy: ['gaussian_naive_bayes', 'gaussian_mixture_models', 'bayesian_linear_regression'],
    prereq: ['probability-rules-and-bayes-theorem'],
    related: ['expectation-variance-and-covariance', 'maximum-likelihood-estimation'],
    keywords: 'random variable probability distribution pdf pmf cdf normal gaussian bernoulli continuous discrete',
  },
  {
    id: 'expectation-variance-and-covariance',
    short: 'Expectation and variance',
    title: 'Expectation, Variance and Covariance',
    task: 'concepts',
    module: 'Probability',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`The three pillars of summary statistics: expected value as centre of mass, variance as spread, and covariance as joint linear co-movement.`,
    lead: r`Expectation measures the long-run average outcome of a random process, variance quantifies the dispersion around that average, and covariance tracks how two variables move together. Together, they form the algebraic backbone of loss functions, risk analysis, and matrix methods in machine learning.`,
    intuition: [
      r`Imagine a roulette game where you bet £10 on red. Eighteen out of 37 slots are red, 18 are black, and 1 is green (zero). If red hits, you win £10; otherwise, you lose your £10. On any single spin, you either gain £10 or lose £10—you never see a fractional amount. But if you play 1,000 times, your average outcome per spin converges toward $(18/37)(+10) + (19/37)(-10) \approx -£0.27$. That long-run average is the expected value $\mathbb{E}[X]$.`,
      r`Now compare two investments. Asset A returns 5% every single year without fail. Asset B returns 45% in good years and loses 35% in bad years, averaging 5%. Both assets have the exact same expected return of 5%, yet Asset B is dramatically riskier. Variance $\operatorname{Var}(X)$ captures this risk by measuring the average squared deviation from the mean, while its square root—standard deviation $\sigma$—puts the spread back into original units like pounds or percentage points.`,
      r`When we track multiple variables, we need to know whether they move in sympathy. If temperature rises and ice cream sales climb while hot tea sales drop, temperature shares positive covariance with ice cream and negative covariance with tea. In linear regression and PCA, covariance matrices summarise all pairwise relationships to find optimal projections and regression slopes.`,
    ],
    analogy: r`Expectation is the fulcrum where a seesaw balances; variance is how widely the weights are distributed along the plank; covariance is whether two passengers lean in unison.`,
    steps: [
      r`Calculate expected value $\mathbb{E}[X]$ by weighting every possible outcome by its probability (or integrating $x f(x) dx$).`,
      r`Exploit linearity of expectation: $\mathbb{E}[aX + bY] = a\mathbb{E}[X] + b\mathbb{E}[Y]$ holds whether variables are independent or not.`,
      r`Compute variance via the computational shortcut: $\operatorname{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$.`,
      r`Evaluate covariance $\operatorname{Cov}(X, Y) = \mathbb{E}[(X - \mathbb{E}[X])(Y - \mathbb{E}[Y])] = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y]$.`,
      r`Assemble pairwise covariances into a symmetric, positive semi-definite covariance matrix $\boldsymbol{\Sigma}$ for multivariate modelling.`,
    ],
    math: [
      {
        h: 'Expected Value and Linearity',
        tex: r`$$\mathbb{E}[X] = \begin{cases} \sum_x x\,p(x) & \text{discrete} \\[6pt] \int_{-\infty}^\infty x\,f(x)\,dx & \text{continuous} \end{cases}, \qquad \mathbb{E}[aX + bY + c] = a\mathbb{E}[X] + b\mathbb{E}[Y] + c$$`,
        p: r`The expected value is the probability-weighted average (first moment). Linearity of expectation is an unconditional property that holds regardless of correlation or non-linear dependence between $X$ and $Y$.`,
      },
      {
        h: 'Variance and Standard Deviation',
        tex: r`$$\operatorname{Var}(X) = \mathbb{E}\big[(X - \mathbb{E}[X])^2\big] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2, \qquad \operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$$`,
        p: r`Variance is the second central moment, quantifying dispersion around the mean in squared units. Adding a constant shift $b$ leaves spread unchanged, while multiplying by a scale factor $a$ magnifies variance by $a^2$. Standard deviation is $\sigma = \sqrt{\operatorname{Var}(X)}$.`,
      },
      {
        h: 'Covariance and Sum of Correlated Variables',
        tex: r`$$\operatorname{Cov}(X, Y) = \mathbb{E}[(X - \mu_X)(Y - \mu_Y)] = \mathbb{E}[XY] - \mu_X\mu_Y, \quad \operatorname{Var}(X \pm Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) \pm 2\operatorname{Cov}(X, Y)$$`,
        p: r`Covariance measures joint linear tendency. If high values of $X$ coincide with high values of $Y$, covariance is positive; if they coincide with low values, it is negative. If $X$ and $Y$ are independent, $\operatorname{Cov}(X, Y) = 0$, though zero covariance does not necessarily imply independence.`,
      },
    ],
    keyPoints: [
      r`Linearity of expectation requires zero assumptions about independence; it holds universally across all random variables.`,
      r`Variance scales quadratically ($\operatorname{Var}(aX) = a^2\operatorname{Var}(X)$), which is why standard deviation is preferred for intuitive scale comparisons.`,
      r`Zero covariance indicates absence of linear association, but strong non-linear relationships (such as $Y = X^2$ for symmetric $X$) can still exist.`,
      r`Sample variance divides by $n - 1$ (Bessel's correction) rather than $n$ to guarantee an unbiased estimator of population variance.`,
    ],
    pitfalls: [
      r`Writing $\operatorname{Var}(aX + b) = a\operatorname{Var}(X) + b$; constants vanish under variance and scalar multipliers are squared ($a^2\operatorname{Var}(X)$).`,
      r`Assuming that $\operatorname{Cov}(X, Y) = 0$ implies $X$ and $Y$ are independent; covariance only checks for linear co-movement.`,
      r`Confusing sample variance (divided by $n-1$) with population variance (divided by $n$) when computing degrees of freedom.`,
      r`Comparing raw covariances across different features without standardising; features with larger numerical units naturally produce artificially massive covariances.`,
    ],
    code: r`import numpy as np

# Seeded inline data generation
rng = np.random.default_rng(42)
x = rng.normal(loc=10.0, scale=2.0, size=1000)
# y shares linear co-movement with x plus noise
y = 1.5 * x + rng.normal(loc=0.0, scale=1.0, size=1000)

mean_x, mean_y = np.mean(x), np.mean(y)
var_x = np.var(x, ddof=1)
cov_xy = np.cov(x, y)[0, 1]
var_sum = np.var(x + y, ddof=1)
theoretical_sum = var_x + np.var(y, ddof=1) + 2 * cov_xy

print(f"E[X] = {mean_x:.2f}, E[Y] = {mean_y:.2f}")
print(f"Var(X) = {var_x:.3f}, Cov(X, Y) = {cov_xy:.3f}")
print(f"Var(X + Y) empirical = {var_sum:.3f}, identity = {theoretical_sum:.3f}")`,
    quiz: [
      {
        q: r`If $X$ is a random variable with $\mathbb{E}[X] = 4$ and $\operatorname{Var}(X) = 9$, what is $\mathbb{E}[X^2]$?`,
        o: [r`16`, r`25`, r`13`, r`81`],
        a: 1,
        why: r`Using the identity $\operatorname{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$, we have $\mathbb{E}[X^2] = \operatorname{Var}(X) + (\mathbb{E}[X])^2 = 9 + 4^2 = 9 + 16 = 25$.`,
      },
      {
        q: r`If $\operatorname{Var}(X) = 4$, what is $\operatorname{Var}(-3X + 5)$?`,
        o: [r`-12`, r`41`, r`36`, r`9`],
        a: 2,
        why: r`Constants shift the distribution without changing spread, and scalar multipliers are squared: $\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X) = (-3)^2 \times 4 = 9 \times 4 = 36$.`,
      },
      {
        q: r`If two random variables $X$ and $Y$ have $\operatorname{Cov}(X, Y) = 0$, which statement is strictly true?`,
        o: [r`$X$ and $Y$ are independent`, r`There is no linear association between $X$ and $Y$`, r`$X$ and $Y$ must be Gaussian`, r`$Y$ cannot be predicted from $X$`],
        a: 1,
        why: r`Zero covariance guarantees zero linear correlation. However, they can still share a deterministic non-linear relationship (e.g. $Y = X^2$ for symmetric $X$).`,
      },
      {
        q: r`Why does sample variance use $n - 1$ in the denominator instead of $n$?`,
        o: [r`To correct for the degrees of freedom consumed when estimating the sample mean`, r`To make the variance larger on large datasets`, r`Because of the central limit theorem`, r`To match the formula for standard deviation`],
        a: 0,
        why: r`Using the sample mean $\bar{x}$ instead of the true population mean $\mu$ slightly underestimates squared deviations; dividing by $n - 1$ (Bessel's correction) yields an unbiased estimator.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'linear_discriminant_analysis', 'gaussian_process_regressor'],
    prereq: ['random-variables-and-distributions'],
    related: ['correlation-pearson-spearman-kendall', 'bias-variance-tradeoff'],
    keywords: 'expectation variance covariance standard deviation expected value moments dispersion bessel',
  },
  {
    id: 'correlation-pearson-spearman-kendall',
    short: 'Correlation coefficients',
    title: 'Correlation: Pearson, Spearman, Kendall',
    task: 'concepts',
    module: 'Probability',
    level: 1,
    minutes: 15,
    noLab: true,
    summary: r`Measuring linear vs monotonic dependence: Pearson r for straight lines, Spearman rho for rank trends, and Kendall tau for concordant pairs.`,
    lead: r`Correlation standardises covariance into a dimensionless scale between -1 and +1, making associations comparable across features of completely different units. Choosing between Pearson, Spearman and Kendall determines whether your model looks for straight linear lines, rank monotonicity, or robust ordinal agreement in noisy data.`,
    intuition: [
      r`Suppose you track study hours and exam scores for 100 students. If every additional hour of studying reliably adds 3 percentage points to a score, the relationship is linear and Pearson's $r$ approaches $+1.0$. But now imagine an exponential learning curve: going from 1 to 2 hours doubles your score, but going from 20 to 21 hours barely registers a change. The relationship is strictly increasing (more study always helps), yet it is not a straight line. Pearson's $r$ drops because the line bends, but Spearman's rank correlation remains exactly $+1.0$.`,
      r`This distinction between linear and monotonic relationships is crucial in feature selection and exploratory data analysis. Pearson assumes both variables are interval-scaled, roughly normal, and free of extreme outliers. A single outlier—such as a rogue data point with 100 study hours and a score of 0—can pull a strong Pearson correlation of $+0.85$ down to zero or even flip its sign.`,
      r`Spearman and Kendall protect against this by discarding raw numerical distances and looking only at order. Spearman converts raw numbers to ranks ($1\text{st}, 2\text{nd}, 3\text{rd}\dots$) before applying Pearson's formula. Kendall takes an even cleaner combinatorial approach: it looks at every possible pair of students and counts whether the student with more study hours also got the higher exam score. This makes Kendall exceptionally robust on small sample sizes with heavy ties.`,
    ],
    analogy: r`Pearson checks if two runners maintain a constant speed ratio; Spearman checks if the first runner always finishes ahead of the second, regardless of the gap.`,
    steps: [
      r`Inspect a scatter plot to diagnose whether the expected relationship is strictly linear, non-linear monotonic, or contaminated by outliers.`,
      r`Compute Pearson's $r$ to assess linear association when both features are continuous and approximately Gaussian: $r = \frac{\operatorname{Cov}(X, Y)}{\sigma_X \sigma_Y}$.`,
      r`If the trend is curved or heavily skewed, convert values to fractional ranks and compute Spearman's $\rho$.`,
      r`On small samples or data with frequent tied ranks, compute Kendall's $\tau$ by evaluating the proportion of concordant versus discordant pairs.`,
      r`Test statistical significance via hypothesis tests ($t$-test for Pearson, permutation or asymptotic $z$ for ranks) against the null hypothesis $H_0: \rho = 0$.`,
    ],
    math: [
      {
        h: 'Pearson Product-Moment Correlation',
        tex: r`$$r = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^n (x_i - \bar{x})^2}\sqrt{\sum_{i=1}^n (y_i - \bar{y})^2}} = \frac{\operatorname{Cov}(X, Y)}{\sigma_X \sigma_Y}$$`,
        p: r`Pearson's $r \in [-1, 1]$ standardises covariance by dividing by the product of both standard deviations. It measures the strength and direction of a purely linear relationship. $r = \pm 1$ indicates that points lie exactly along a straight line with positive or negative slope.`,
      },
      {
        h: 'Spearman Rank Correlation',
        tex: r`$$\rho = 1 - \frac{6 \sum_{i=1}^n d_i^2}{n(n^2 - 1)}, \qquad d_i = \operatorname{rank}(x_i) - \operatorname{rank}(y_i)$$`,
        p: r`Spearman's $\rho$ is Pearson's $r$ computed on the ordinal ranks of $X$ and $Y$. The simplified difference formula applies when there are no tied ranks ($d_i$ is the rank discrepancy). It measures monotonic relationships: whether one variable increases when the other increases, regardless of linearity.`,
      },
      {
        h: 'Kendall\'s Tau',
        tex: r`$$\tau = \frac{C - D}{\frac{1}{2} n (n - 1)}$$`,
        p: r`Kendall's $\tau$ counts pairwise concordance across all $\binom{n}{2}$ distinct observation pairs $(x_i, y_i)$ and $(x_j, y_j)$. A pair is concordant ($C$) if $(x_i - x_j)(y_i - y_j) > 0$, and discordant ($D$) if negative. It offers superior small-sample efficiency and intuitive probabilistic interpretation: $P(\text{concordance}) - P(\text{discordance})$.`,
      },
    ],
    keyPoints: [
      r`Correlation measures association, never causation: a third lurking variable can induce strong spurious correlations.`,
      r`Pearson is highly sensitive to outliers; a single distant rogue point can artificially inflate or destroy linear correlation.`,
      r`Spearman and Kendall are invariant to any strictly monotonic transformation, such as taking logarithms or square roots.`,
      r`Kendall's $\tau$ converges to a normal distribution much faster than Spearman's $\rho$ on small samples, making hypothesis testing more reliable.`,
    ],
    pitfalls: [
      r`Relying on Pearson's $r$ for non-linear associations (e.g. Anscombe's quartet or quadratic curves where $r \approx 0$ despite perfect dependence).`,
      r`Confusing statistical significance ($p$-value) with practical significance; with a million rows, even $r = 0.01$ will have $p < 0.001$.`,
      r`Computing Pearson correlation on ordinal survey responses (e.g. Likert scales) instead of rank-based Spearman or Kendall.`,
      r`Assuming correlation implies zero multicollinearity; two features can have modest pairwise correlation yet cause severe multicollinearity in a multivariate regression.`,
    ],
    code: r`import numpy as np
from scipy import stats

rng = np.random.default_rng(42)
x = np.linspace(1, 10, 50)
# Strictly monotonic non-linear relationship: y = exp(x / 3) + noise
y = np.exp(x / 3.0) + rng.normal(0, 0.5, size=50)

# Add an extreme outlier to demonstrate robustness
x_out = np.append(x, [10.0])
y_out = np.append(y, [0.0])

r_clean, _ = stats.pearsonr(x, y)
rho_clean, _ = stats.spearmanr(x, y)
r_dirty, _ = stats.pearsonr(x_out, y_out)
rho_dirty, _ = stats.spearmanr(x_out, y_out)
tau_clean, _ = stats.kendalltau(x, y)

print(f"Clean Data   -> Pearson r: {r_clean:.3f}, Spearman rho: {rho_clean:.3f}, Kendall tau: {tau_clean:.3f}")
print(f"With Outlier -> Pearson r: {r_dirty:.3f}, Spearman rho: {rho_dirty:.3f}")`,
    quiz: [
      {
        q: r`If $Y = \exp(X)$ for strictly positive $X$, what are the Pearson and Spearman correlations?`,
        o: [r`Pearson $r = 1.0$, Spearman $\rho = 1.0$`, r`Pearson $r < 1.0$, Spearman $\rho = 1.0$`, r`Pearson $r = 1.0$, Spearman $\rho < 1.0$`, r`Both are 0 because the relationship is non-linear`],
        a: 1,
        why: r`The relationship is perfectly monotonic but non-linear. Spearman's rank correlation is strictly $1.0$, whereas Pearson's linear correlation is strictly less than $1.0$ due to curvature.`,
      },
      {
        q: r`How does a single extreme outlier typically affect Pearson's $r$ compared to Spearman's $\rho$?`,
        o: [r`Pearson can be heavily distorted, while Spearman only changes by a predictable rank displacement`, r`Pearson is unaffected; Spearman fluctuates wildly`, r`Both change by the exact same amount`, r`Neither can change if $n > 30$`],
        a: 0,
        why: r`Pearson calculates squared Euclidean distances from the mean, so an outlier has immense leverage. Spearman ranks observations, so an outlier moves at most to the end of the ranking.`,
      },
      {
        q: r`What does a Kendall tau ($\tau$) of $+0.6$ mean probabilistically?`,
        o: [r`60% of the variance in $Y$ is explained by $X$`, r`60% of the data points lie on the regression line`, r`The probability of drawing a concordant pair is 60 percentage points higher than drawing a discordant pair`, r`The slope of the line is 0.6`],
        a: 2,
        why: r`Kendall's $\tau = P(\text{concordant}) - P(\text{discordant})$, so $\tau = 0.6$ means the concordance probability exceeds discordance by 0.6.`,
      },
      {
        q: r`Which correlation metric is most suitable for evaluating rank orderings on small samples with tied ranks?`,
        o: [r`Pearson's $r$`, r`Coefficient of determination $R^2$`, r`Mutual information`, r`Kendall's $\tau$`],
        a: 3,
        why: r`Kendall's $\tau$ has smaller gross error sensitivity, handles tied ranks cleanly via Kendall's tau-b, and has well-characterised small-sample variance.`,
      },
    ],
    usedBy: ['feature-selection', 'ols_linear_regression', 'ridge_regression'],
    prereq: ['expectation-variance-and-covariance'],
    related: ['feature-selection', 'exploratory-data-analysis', 'ols_linear_regression'],
    keywords: 'correlation pearson spearman kendall rank linear monotonic association collinearity',
  },
];
