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
  {
    id: 'central-limit-theorem-and-law-of-large-numbers',
    short: 'CLT and LLN',
    title: 'Central Limit Theorem and Law of Large Numbers',
    task: 'concepts',
    module: 'Probability',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`Why averages converge and bell curves appear everywhere: the Law of Large Numbers pins down the mean, while the Central Limit Theorem dictates the shape of sample sums.`,
    lead: r`The Law of Large Numbers guarantees that sample averages converge to the true population expectation as sample size grows. The Central Limit Theorem goes further, proving that the standardised sum or mean of independent random variables converges to a Gaussian distribution, regardless of the underlying distribution's shape.`,
    intuition: [
      r`Imagine rolling a fair six-sided die. A single roll has a completely flat, discrete uniform distribution: 1, 2, 3, 4, 5, or 6 each appear with equal probability 1/6. The true expected value is 3.5. If you roll the die 10 times, your average might be 2.9 or 4.1. But roll it 10,000 times, and the average will be virtually indistinguishable from 3.5. That stability is the Law of Large Numbers (LLN): random noise cancels out across large samples.`,
      r`Now, instead of one long run, imagine taking 1,000 separate players. Each player rolls 30 dice and computes their own average. If you plot the histogram of those 1,000 averages, something remarkable emerges: the flat uniform distribution has completely vanished. In its place sits a smooth, bell-shaped Gaussian curve centred at 3.5.`,
      r`This is the Central Limit Theorem (CLT). Even if the original population is skewed, bimodal, or uniform, the distribution of sample averages becomes approximately normal once sample size $n$ is sufficiently large (typically $n \ge 30$). This explains why Gaussian assumptions dominate machine learning: measurement errors and composite features are usually sums of many small, independent underlying effects.`,
    ],
    analogy: r`The Law of Large Numbers tells you that a fleet of ships will on average reach their port; the Central Limit Theorem describes the bell-shaped dispersion pattern of their arrival times.`,
    steps: [
      r`Draw independent, identically distributed (i.i.d.) observations $X_1, X_2, \dots, X_n$ from any population with finite mean $\mu$ and variance $\sigma^2$.`,
      r`Compute the sample average $\bar{X}_n = \frac{1}{n}\sum_{i=1}^n X_i$.`,
      r`Observe the Law of Large Numbers in action: as $n \to \infty$, the sample mean $\bar{X}_n$ converges in probability to the true population mean $\mu$.`,
      r`Apply the Central Limit Theorem: standardise the sum or mean to form $Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}}$.`,
      r`Approximate probabilities of sample averages using the standard Gaussian CDF $\Phi(z)$ whenever $n$ is adequately large.`,
    ],
    math: [
      {
        h: 'Weak and Strong Laws of Large Numbers',
        tex: r`$$\text{Weak Law (WLLN): } \lim_{n \to \infty} P(|\bar{X}_n - \mu| \ge \varepsilon) = 0, \qquad \text{Strong Law (SLLN): } P\left(\lim_{n \to \infty} \bar{X}_n = \mu\right) = 1$$`,
        p: r`The Weak Law (Khinchin's theorem) guarantees convergence in probability: for any margin $\varepsilon > 0$, the probability of a discrepancy larger than $\varepsilon$ decays to 0. The Strong Law (Kolmogorov's theorem) guarantees almost sure convergence: the sample trajectory itself converges to the constant $\mu$ with probability 1.`,
      },
      {
        h: 'The Lindeberg–Lévy Central Limit Theorem',
        tex: r`$$\sqrt{n}\left(\frac{\bar{X}_n - \mu}{\sigma}\right) \xrightarrow{d} \mathcal{N}(0, 1) \quad \text{as } n \to \infty$$`,
        p: r`For any sequence of i.i.d. random variables with finite variance $\sigma^2 < \infty$, the distribution of the normalised error converges in distribution ($\xrightarrow{d}$) to a standard Gaussian. Equivalently, the unstandardised sample mean follows approximately $\bar{X}_n \sim \mathcal{N}\left(\mu, \frac{\sigma^2}{n}\right)$.`,
      },
      {
        h: 'Berry–Esseen Rate of Convergence',
        tex: r`$$\sup_{z \in \mathbb{R}} \big| F_n(z) - \Phi(z) \big| \le \frac{C \cdot \mathbb{E}\big[|X - \mu|^3\big]}{\sigma^3 \sqrt{n}}$$`,
        p: r`The Berry–Esseen theorem bounds the maximum discrepancy between the actual CDF of the standardised sample mean $F_n(z)$ and the standard normal CDF $\Phi(z)$. The convergence rate is $O(1/\sqrt{n})$, scaled by the population skewness. Heavily skewed distributions require larger $n$ before the normal approximation becomes accurate.`,
      },
    ],
    keyPoints: [
      r`LLN guarantees that empirical risk converges to expected risk in machine learning as training set size grows.`,
      r`CLT applies to the sum or average of random variables, not to the raw data distribution itself; raw data does not magically become normal.`,
      r`Finite variance is an absolute requirement; heavy-tailed distributions like Cauchy have no finite variance and violate the CLT entirely.`,
      r`The spread of sample averages shrinks at the rate $1/\sqrt{n}$, meaning halving estimation error requires quadrupling the sample size.`,
    ],
    pitfalls: [
      r`Believing the raw data becomes normally distributed with more samples; only sample sums and averages become normal.`,
      r`Applying CLT to Cauchy or Pareto distributions with infinite variance where averages wander erratically forever.`,
      r`Assuming $n = 30$ is always sufficient; heavily skewed or zero-inflated distributions can require hundreds or thousands of samples for good Gaussian fits.`,
      r`Confusing standard deviation of the population ($\sigma$) with standard error of the mean ($\sigma / \sqrt{n}$).`,
    ],
    code: r`import numpy as np

rng = np.random.default_rng(42)
# Draw from a heavily skewed Exponential distribution (scale = 2.0)
scale = 2.0
n_samples = 50
n_experiments = 5000

# True parameters: mean = scale, var = scale^2
true_mean = scale
true_se = scale / np.sqrt(n_samples)

# Simulate 5,000 separate sample means of size n = 50
means = rng.exponential(scale=scale, size=(n_experiments, n_samples)).mean(axis=1)

empirical_mean = np.mean(means)
empirical_se = np.std(means, ddof=1)
# Fraction of sample averages falling within 1.96 standard errors of the mean
coverage = np.mean(np.abs(means - true_mean) <= 1.96 * true_se)

print(f"True Mean: {true_mean:.2f}, Simulated Mean: {empirical_mean:.4f}")
print(f"Theoretical SE: {true_se:.4f}, Simulated SE: {empirical_se:.4f}")
print(f"95% Gaussian Coverage: {coverage * 100:.2f}%")`,
    quiz: [
      {
        q: r`What happens to the distribution of individual data points $X_i$ as the sample size $n$ increases?`,
        o: [r`It approaches a standard normal distribution`, r`It remains exactly the true population distribution from which it is drawn`, r`Its variance drops to zero`, r`It becomes uniform`],
        a: 1,
        why: r`The CLT applies exclusively to sample sums and averages. The raw individual observations continue to reflect their true underlying population distribution regardless of sample size.`,
      },
      {
        q: r`If you wish to cut the standard error of a sample mean in half, by what factor must you increase the sample size?`,
        o: [r`2`, r`$\sqrt{2}$`, r`4`, r`8`],
        a: 2,
        why: r`The standard error is $\sigma / \sqrt{n}$. To divide the error by 2, $n$ must increase by a factor of $2^2 = 4$.`,
      },
      {
        q: r`Which fundamental condition must a probability distribution satisfy for the classical Lindeberg–Lévy CLT to hold?`,
        o: [r`The population must be symmetric`, r`The sample size must exceed 100,000`, r`The observations must be correlated`, r`The population must have finite variance`],
        a: 3,
        why: r`The classical CLT requires independent, identically distributed observations with finite mean and finite variance ($\sigma^2 < \infty$). Distributions with infinite variance (like Cauchy) violate CLT.`,
      },
      {
        q: r`What is the conceptual difference between the Law of Large Numbers (LLN) and the Central Limit Theorem (CLT)?`,
        o: [r`LLN shows the sample mean converges to the true mean; CLT describes the distribution of errors around that mean`, r`LLN describes the limiting Gaussian shape; CLT proves the mean converges to a point`, r`LLN applies only to continuous variables; CLT applies only to discrete variables`, r`There is no difference; they are alternative names for the same theorem`],
        a: 0,
        why: r`LLN pins down the destination ($\bar{X}_n \to \mu$), whereas CLT provides the rate and probability distribution of the fluctuations around that destination ($\sqrt{n}(\bar{X}_n - \mu) \to \mathcal{N}(0, \sigma^2)$).`,
      },
    ],
    usedBy: ['ols_linear_regression', 'linear_discriminant_analysis'],
    prereq: ['random-variables-and-distributions', 'expectation-variance-and-covariance'],
    related: ['sampling-and-standard-error', 'confidence-intervals'],
    keywords: 'central limit theorem law large numbers clt lln gaussian convergence normal distribution standard error',
  },
  {
    id: 'sampling-and-standard-error',
    short: 'Sampling & standard error',
    title: 'Sampling and Standard Error',
    task: 'concepts',
    module: 'Estimation',
    level: 1,
    minutes: 15,
    noLab: true,
    summary: r`Distinguishing population variability from estimation uncertainty: standard deviation measures individual spread, standard error measures how much sample statistics fluctuate.`,
    lead: r`Statistical inference hinges on distinguishing between the spread of individual observations and the uncertainty of a summary statistic. While standard deviation quantifies the dispersion of the raw population, standard error measures the variability of an estimator across hypothetical repeated samples.`,
    intuition: [
      r`Suppose you want to know the average income in a city of 1,000,000 residents. Asking every resident is prohibitively expensive, so you draw a random sample of 100 people. Some make £25,000, some £60,000, and a few make £150,000. The standard deviation of your sample—say £20,000—describes the broad diversity of incomes among individual citizens. It will not shrink if you survey 1,000 people instead; people's salaries remain just as diverse.`,
      r`Now consider the sample mean income, which turns out to be £45,000. If your colleague surveys a completely different random sample of 100 residents, they might find a mean of £43,200. A third sample might yield £47,100. The spread of these hypothetical sample averages is the standard error (SE). Because averages are far more stable than individual measurements, the standard error for $n = 100$ is much smaller than the standard deviation: roughly $£20,000 / \sqrt{100} = £2,000$.`,
      r`Crucially, while population standard deviation stays constant as sample size grows, standard error shrinks steadily at rate $1/\sqrt{n}$. If you expand your survey to 10,000 residents, your sample standard deviation remains £20,000, but your standard error plunges to $£20,000 / \sqrt{10,000} = £200$. Standard error directly measures the precision of your estimate.`,
    ],
    analogy: r`Standard deviation is the size of the waves in the ocean; standard error is the slight bobbing of a massive cargo ship resting on those waves.`,
    steps: [
      r`Identify the population parameter of interest (e.g. population mean $\mu$ or proportion $p$).`,
      r`Draw a representative random sample of size $n$ using independent, identically distributed sampling.`,
      r`Compute the sample statistic (the point estimate), such as the sample mean $\bar{x}$ or sample proportion $\hat{p}$.`,
      r`Compute the sample standard deviation $s$ as a measure of raw observational scatter.`,
      r`Calculate the estimated standard error of the estimator: $\operatorname{SE}(\bar{x}) = s / \sqrt{n}$.`,
      r`Use the standard error to construct confidence intervals or evaluate statistical significance in hypothesis testing.`,
    ],
    math: [
      {
        h: 'Standard Deviation vs. Standard Error',
        tex: r`$$\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2} \qquad \text{vs.} \qquad \operatorname{SE}(\bar{X}) = \frac{\sigma}{\sqrt{n}} \approx \frac{s}{\sqrt{n}}$$`,
        p: r`The standard deviation $\sigma$ describes the inherent variability of individual observations in the population. The standard error $\operatorname{SE}(\bar{X})$ is the standard deviation of the sampling distribution of the sample mean $\bar{X}$. When the population $\sigma$ is unknown, we substitute the sample standard deviation $s = \sqrt{\frac{1}{n-1}\sum (x_i - \bar{x})^2}$.`,
      },
      {
        h: 'Standard Error of a Proportion',
        tex: r`$$\operatorname{SE}(\hat{p}) = \sqrt{\frac{p(1 - p)}{n}} \approx \sqrt{\frac{\hat{p}(1 - \hat{p})}{n}}$$`,
        p: r`For binary outcomes (Bernoulli trials with probability of success $p$), the variance is $p(1-p)$. The standard error of the sample proportion $\hat{p}$ peaks at $p = 0.5$ and decays symmetrically toward the boundaries 0 and 1.`,
      },
      {
        h: 'Finite Population Correction (FPC)',
        tex: r`$$\operatorname{SE}_{\text{finite}}(\bar{X}) = \frac{\sigma}{\sqrt{n}} \sqrt{\frac{N - n}{N - 1}}$$`,
        p: r`When sampling without replacement from a finite population of size $N$, observations are not strictly independent. The finite population correction factor $\sqrt{(N-n)/(N-1)}$ shrinks the standard error toward zero as the sample size $n$ approaches the full population size $N$.`,
      },
    ],
    keyPoints: [
      r`Standard deviation describes data spread; standard error describes estimator precision.`,
      r`Standard error always decreases as sample size increases, scaling strictly with $1/\sqrt{n}$.`,
      r`Reporting an estimate without its standard error gives an illusion of certainty without context.`,
      r`In linear regression, every coefficient $\beta_j$ has a dedicated standard error used to compute $t$-statistics.`,
    ],
    pitfalls: [
      r`Reporting standard deviation when asked for estimation uncertainty, or reporting standard error to describe population diversity.`,
      r`Assuming non-random convenience samples can be cured with standard error formulas; selection bias invalidates standard error entirely.`,
      r`Forgetting the $1/\sqrt{n}$ diminishing returns; doubling precision requires a fourfold increase in data.`,
      r`Omitting Bessel's correction ($n-1$) when computing sample standard deviation on small samples.`,
    ],
    code: r`import numpy as np

rng = np.random.default_rng(42)
true_mu, true_sigma = 50.0, 12.0

sample_sizes = [25, 100, 400, 1600]
print("True Population SD:", true_sigma)

for n in sample_sizes:
    # Draw 1,000 independent samples of size n
    samples = rng.normal(loc=true_mu, scale=true_sigma, size=(1000, n))
    sample_means = samples.mean(axis=1)
    
    single_sample = samples[0]
    s = np.std(single_sample, ddof=1)
    estimated_se = s / np.sqrt(n)
    empirical_se = np.std(sample_means, ddof=1)
    
    print(f"n={n:4d} | Sample SD: {s:.2f} | Est SE: {estimated_se:.3f} | Empirical SE: {empirical_se:.3f}")`,
    quiz: [
      {
        q: r`What is the primary conceptual difference between standard deviation and standard error?`,
        o: [r`Standard deviation measures dispersion of individual observations; standard error measures the variability of a sample statistic across samples`, r`Standard error is for discrete data; standard deviation is for continuous data`, r`Standard error is always larger than standard deviation`, r`Standard deviation decreases with sample size, while standard error remains constant`],
        a: 0,
        why: r`Standard deviation describes the spread of individual observations in a population or sample. Standard error describes the spread of the sampling distribution of an estimator (e.g. sample mean).`,
      },
      {
        q: r`If a sample of 64 observations has a sample standard deviation of $s = 16$, what is the estimated standard error of the mean?`,
        o: [r`0.25`, r`2.0`, r`4.0`, r`8.0`],
        a: 1,
        why: r`$\operatorname{SE}(\bar{x}) = s / \sqrt{n} = 16 / \sqrt{64} = 16 / 8 = 2.0$.`,
      },
      {
        q: r`What happens to the population standard deviation $\sigma$ and the standard error of the mean $\operatorname{SE}(\bar{X})$ as the sample size $n$ grows arbitrarily large?`,
        o: [r`Both converge to zero`, r`$\sigma$ grows toward infinity; $\operatorname{SE}(\bar{X})$ remains constant`, r`$\sigma$ remains fixed (it is a population constant); $\operatorname{SE}(\bar{X})$ converges toward zero`, r`Both remain constant`],
        a: 2,
        why: r`The population standard deviation $\sigma$ is a fixed physical attribute of the population. The standard error $\sigma / \sqrt{n}$ measures sampling uncertainty and converges to 0 as $n \to \infty$.`,
      },
      {
        q: r`For a binary classification test set of $n = 400$ instances with an observed accuracy of $\hat{p} = 0.80$, what is the estimated standard error of the accuracy estimate?`,
        o: [r`0.04`, r`0.16`, r`0.20`, r`0.02`],
        a: 3,
        why: r`$\operatorname{SE}(\hat{p}) = \sqrt{\hat{p}(1 - \hat{p}) / n} = \sqrt{(0.80 \times 0.20) / 400} = \sqrt{0.16 / 400} = \sqrt{0.0004} = 0.02$ (or 2 percentage points).`,
      },
    ],
    usedBy: ['ols_linear_regression', 'logistic_regression'],
    prereq: ['expectation-variance-and-covariance', 'central-limit-theorem-and-law-of-large-numbers'],
    related: ['confidence-intervals', 'bootstrap-and-jackknife'],
    keywords: 'sampling standard error standard deviation population sample mean proportion bessel',
  },
  {
    id: 'confidence-intervals',
    short: 'Confidence intervals',
    title: 'Confidence Intervals',
    task: 'concepts',
    module: 'Estimation',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`Quantifying parameter uncertainty with frequentist coverage: margin of error, critical values, Student's t distribution, and proper probabilistic interpretation.`,
    lead: r`A point estimate alone provides an incomplete picture of an unknown population parameter. Confidence intervals construct a calibrated range around the estimate, guaranteeing that a chosen percentage of such intervals across repeated sampling will trap the true parameter value.`,
    intuition: [
      r`Imagine an archer shooting arrows at a bullseye hidden in thick fog. You cannot see where the bullseye is, but you can see where each arrow lands. If you only look at one arrow, you have a point estimate of where the target might be. But if you draw a circle around that arrow with a radius based on the archer's known spread, you create an interval. If the radius is calibrated for 95% confidence, then across 100 shots in the fog, exactly 95 of your circles will capture the hidden bullseye.`,
      r`Notice what this means: the bullseye is fixed in one spot; it does not move. It is your circles that shift with each new shot. This is the heart of the frequentist confidence interval. You cannot say "there is a 95% probability the true target lies inside this specific circle"—either it does or it does not (0 or 1). What you can say is that the procedure used to draw the circle captures the target 95% of the time under repeated sampling.`,
      r`In machine learning and statistics, we build these intervals by taking our point estimate (like a regression coefficient or validation accuracy) and adding and subtracting a margin of error: $\text{Estimate} \pm (\text{Critical Value} \times \text{Standard Error})$. If the population variance is known, we use the standard normal $z$-distribution; when estimating variance from a small sample, we switch to Student's $t$-distribution with heavier tails to account for extra uncertainty.`,
    ],
    analogy: r`A confidence interval is like tossing a ring around a fixed peg: the peg does not move, but 95 out of 100 tossed rings will successfully encircle it.`,
    steps: [
      r`Specify the desired confidence level $1 - \alpha$ (most commonly 95%, where $\alpha = 0.05$).`,
      r`Compute the point estimate (e.g. sample mean $\bar{x}$) from the empirical sample.`,
      r`Compute the estimated standard error of the estimator: $\operatorname{SE} = s / \sqrt{n}$.`,
      r`Select the appropriate critical value: $z_{1 - \alpha/2}$ for large samples or known $\sigma$; $t_{1 - \alpha/2, n-1}$ for unknown $\sigma$ on small samples.`,
      r`Calculate the margin of error: $m = \text{Critical Value} \times \operatorname{SE}$.`,
      r`Construct the interval boundaries: $[\bar{x} - m, \, \bar{x} + m]$.`,
    ],
    math: [
      {
        h: 'Gaussian and Student\'s t Confidence Intervals',
        tex: r`$$\text{Known } \sigma: \quad \bar{x} \pm z_{1-\alpha/2} \frac{\sigma}{\sqrt{n}}, \qquad \text{Unknown } \sigma: \quad \bar{x} \pm t_{1-\alpha/2, \, n-1} \frac{s}{\sqrt{n}}$$`,
        p: r`When $\sigma$ is unknown and estimated by $s$, the ratio follows Student's $t$-distribution with $n - 1$ degrees of freedom. The $t$-distribution has heavier tails than the standard normal distribution, widening the interval to reflect uncertainty in estimating the standard deviation. As $n \to \infty$, $t_{n-1} \to \mathcal{N}(0, 1)$.`,
      },
      {
        h: 'Margin of Error and Sample Size Determination',
        tex: r`$$m = z_{1-\alpha/2} \frac{\sigma}{\sqrt{n}} \implies n = \left(\frac{z_{1-\alpha/2} \cdot \sigma}{m}\right)^2$$`,
        p: r`The margin of error $m$ is half the interval width. To achieve a specified target precision $m$ with $(1 - \alpha)$ confidence, the required sample size scales inversely with the square of the margin of error.`,
      },
      {
        h: 'Confidence Interval for a Population Proportion',
        tex: r`$$\hat{p} \pm z_{1-\alpha/2} \sqrt{\frac{\hat{p}(1 - \hat{p})}{n}}$$`,
        p: r`The Wald interval for a Bernoulli proportion approximates the binomial distribution with a normal distribution. When $n\hat{p} < 10$ or $n(1-\hat{p}) < 10$, the Wilson score interval or Agresti–Coull adjustment is preferred to prevent coverage breakdown near 0 and 1.`,
      },
    ],
    keyPoints: [
      r`Confidence is a property of the sampling procedure over infinite hypothetical replications, not a Bayesian posterior probability on a single interval.`,
      r`Student's $t$-distribution automatically compensates for small sample sizes by expanding critical values.`,
      r`Narrower intervals indicate higher precision, achieved by increasing sample size $n$ or accepting a lower confidence level.`,
      r`If a 95% confidence interval for a treatment effect includes 0, the effect is not statistically significant at the $\alpha = 0.05$ level.`,
    ],
    pitfalls: [
      r`Interpreting a 95% CI as "there is a 95% probability the true parameter lies in this specific calculated interval" (that is a Bayesian credible interval).`,
      r`Using the standard normal $z$-distribution on small samples ($n < 30$) when the population standard deviation is unknown, leading to undercoverage.`,
      r`Overlapping confidence intervals: two groups whose 95% CIs slightly overlap can still be statistically significantly different.`,
      r`Ignoring the independence assumption; correlated or clustered data produces artificially narrow confidence intervals that fail to cover at the nominal rate.`,
    ],
    code: r`import numpy as np
from scipy import stats

rng = np.random.default_rng(42)
true_mu, true_sigma = 75.0, 10.0
n = 20
alpha = 0.05

# Simulate 1,000 independent 95% confidence intervals
trials = 1000
captured = 0

for _ in range(trials):
    sample = rng.normal(loc=true_mu, scale=true_sigma, size=n)
    mean = np.mean(sample)
    se = stats.sem(sample)
    # Student's t critical value for df = n - 1
    t_crit = stats.t.ppf(1.0 - alpha / 2.0, df=n - 1)
    ci_lower = mean - t_crit * se
    ci_upper = mean + t_crit * se
    if ci_lower <= true_mu <= ci_upper:
        captured += 1

print(f"Sample Size n={n}, Degrees of Freedom={n - 1}")
print(f"t Critical Value: {t_crit:.3f} (vs normal z = 1.960)")
print(f"Empirical Coverage: {captured / trials * 100:.1f}% (Nominal: 95.0%)")`,
    quiz: [
      {
        q: r`Which statement correctly reflects the frequentist meaning of a 95% confidence interval $[12.4, 18.2]$ for a population mean $\mu$?`,
        o: [r`There is a 95% probability that $\mu$ is between 12.4 and 18.2`, r`Across many hypothetical random samples, 95% of the intervals computed using this exact method will contain $\mu$`, r`95% of individual data points in the population lie between 12.4 and 18.2`, r`The probability that $\mu = 15.3$ (the midpoint) is 0.95`],
        a: 1,
        why: r`In frequentist statistics, the population parameter $\mu$ is a fixed constant, not a random variable. The 95% confidence level describes the long-run success rate of the interval-generating procedure.`,
      },
      {
        q: r`Why is Student's $t$-distribution used instead of the standard normal $z$-distribution when constructing confidence intervals for small samples?`,
        o: [r`Because the data is guaranteed to be non-normal`, r`Because $t$-critical values are smaller than $z$-critical values`, r`To account for the additional sampling uncertainty introduced by estimating $\sigma$ with the sample standard deviation $s$`, r`To force the confidence interval to be symmetric`],
        a: 2,
        why: r`Estimating the unknown population variance introduces extra randomness. Student's $t$-distribution has heavier tails, producing wider intervals that preserve the correct nominal coverage.`,
      },
      {
        q: r`If a 95% confidence interval for the difference between two model accuracies $(\text{Acc}_A - \text{Acc}_B)$ is $[-0.015, +0.062]$, what can you conclude at the $\alpha = 0.05$ significance level?`,
        o: [r`Model A is significantly better than Model B`, r`Model B is significantly better than Model A`, r`Both models have exactly identical accuracy`, r`The difference is not statistically significant because the interval contains 0`],
        a: 3,
        why: r`Because the 95% confidence interval spans across zero (from negative to positive), the null hypothesis of equal performance ($\text{Acc}_A - \text{Acc}_B = 0$) cannot be rejected at $\alpha = 0.05$.`,
      },
      {
        q: r`How does increasing the confidence level from 90% to 99% affect the width of a confidence interval (all else being equal)?`,
        o: [r`The interval becomes wider`, r`The interval becomes narrower`, r`The width remains unchanged`, r`The interval shifts to the right`],
        a: 0,
        why: r`A higher confidence level requires a larger critical value (e.g. $z = 2.576$ for 99% vs $z = 1.645$ for 90%), expanding the margin of error and widening the interval to guarantee higher coverage.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'bayesian_linear_regression'],
    prereq: ['sampling-and-standard-error', 'central-limit-theorem-and-law-of-large-numbers'],
    related: ['bootstrap-and-jackknife', 'cross-validation'],
    keywords: 'confidence interval student t distribution margin error critical value coverage frequentist estimation',
  },
  {
    id: 'bootstrap-and-jackknife',
    short: 'Bootstrap & jackknife',
    title: 'Bootstrap and Jackknife',
    task: 'concepts',
    module: 'Estimation',
    level: 2,
    minutes: 17,
    noLab: true,
    summary: r`Non-parametric resampling for uncertainty estimation: sample with replacement to bootstrap any statistic, or leave one out with the jackknife.`,
    lead: r`When analytical formulas for standard errors do not exist—such as for medians, complex ratios, or pipeline metrics—resampling methods provide a universal computational solution. The bootstrap treats the empirical sample as a proxy population and resamples with replacement, while the jackknife systematically leaves out one observation at a time.`,
    intuition: [
      r`Imagine you calculate the median household wealth in a small sample of 50 families. Calculating the standard error of a mean is trivial ($s / \sqrt{n}$), but what is the formula for the standard error of a sample median? Under arbitrary or skewed distributions, there is no simple textbook formula. Historically, statisticians were forced to make rigid parametric assumptions or give up on interval estimates entirely.`,
      r`In 1979, Bradley Efron proposed the bootstrap: "pulling yourself up by your own bootstraps". If your sample of 50 families is the best representation of the population you have, treat it as the population. Put all 50 values into an imaginary urn, draw 50 families with replacement (so some appear multiple times and others not at all), and compute the median. Repeat this computational drawing 2,000 times. The spread of those 2,000 recomputed medians gives you an accurate standard error, and their 2.5th and 97.5th percentiles give you an empirical 95% confidence interval.`,
      r`The jackknife is an older, deterministic cousin pioneered by Maurice Quenouille and John Tukey. Instead of random sampling with replacement, the jackknife leaves out observation 1 and recalculates the statistic on the remaining $n - 1$ points, then leaves out observation 2, and so on. This produces $n$ leave-one-out replicates, offering a fast, non-random diagnostic for estimator bias and variance.`,
    ],
    analogy: r`Bootstrapping is like photocopying your sample, cutting it into slips of paper, and drawing new random datasets from the hat to see how sensitive your conclusion is.`,
    steps: [
      r`Given an original dataset $\mathbf{x} = (x_1, x_2, \dots, x_n)$, compute the point estimate of interest $\hat{\theta} = T(\mathbf{x})$.`,
      r`For each of $B$ bootstrap iterations (typically $B \in [1000, 5000]$), draw a sample $\mathbf{x}^{*b}$ of size $n$ with replacement from $\mathbf{x}$.`,
      r`Compute the replicate estimate $\hat{\theta}^{*b} = T(\mathbf{x}^{*b})$ on each resampled dataset.`,
      r`Estimate the bootstrap standard error as the sample standard deviation of the $B$ replicates: $\widehat{\operatorname{SE}}_B = \sqrt{\frac{1}{B-1}\sum (\hat{\theta}^{*b} - \bar{\theta}^*)^2}$.`,
      r`Construct confidence intervals: use the percentile method ($[\hat{\theta}^*_{\alpha/2}, \, \hat{\theta}^*_{1-\alpha/2}]$) or bias-corrected accelerated ($\text{BC}_a$) intervals.`,
      r`For the jackknife, compute $n$ leave-one-out replicates $\hat{\theta}_{(-i)} = T(\mathbf{x} \setminus \{x_i\})$ to estimate bias $\widehat{\text{Bias}}_{\text{jack}} = (n-1)(\bar{\theta}_{(\cdot)} - \hat{\theta})$.`,
    ],
    math: [
      {
        h: 'Bootstrap Standard Error and Percentile Interval',
        tex: r`$$\widehat{\operatorname{SE}}_{\text{boot}} = \sqrt{\frac{1}{B - 1} \sum_{b=1}^B \left(\hat{\theta}^{*b} - \bar{\theta}^*\right)^2}, \qquad \text{CI}_{1-\alpha} = \left[ q_{\alpha/2}\left(\{\hat{\theta}^{*b}\}\right), \; q_{1-\alpha/2}\left(\{\hat{\theta}^{*b}\}\right) \right]$$`,
        p: r`The empirical bootstrap standard error is the standard deviation across all $B$ bootstrap estimates $\hat{\theta}^{*b}$. The percentile confidence interval takes the empirical quantiles of the bootstrap distribution directly, requiring zero normality assumptions.`,
      },
      {
        h: 'The 63.2% Rule of Sampling with Replacement',
        tex: r`$$P(\text{observation } i \text{ selected}) = 1 - \left(1 - \frac{1}{n}\right)^n \xrightarrow{n \to \infty} 1 - e^{-1} \approx 0.6321$$`,
        p: r`When drawing $n$ items with replacement from a set of size $n$, each observation has probability $1/n$ of being picked on any single draw. In the limit, each bootstrap sample contains roughly 63.2% unique original observations, leaving approximately 36.8% out-of-bag (OOB).`,
      },
      {
        h: 'Jackknife Variance and Bias Estimators',
        tex: r`$$\widehat{\operatorname{Var}}_{\text{jack}}(\hat{\theta}) = \frac{n - 1}{n} \sum_{i=1}^n \left(\hat{\theta}_{(-i)} - \bar{\theta}_{(\cdot)}\right)^2, \qquad \widehat{\text{Bias}}_{\text{jack}} = (n - 1)(\bar{\theta}_{(\cdot)} - \hat{\theta})$$`,
        p: r`The jackknife leaves out each observation $i$ sequentially to compute $\hat{\theta}_{(-i)}$. The scale factor $\frac{n-1}{n}$ corrects for the fact that the leave-one-out subsamples are heavily overlapping and far more similar to each other than independent samples would be.`,
      },
    ],
    keyPoints: [
      r`Bootstrapping requires no parametric distribution assumptions; it works for medians, ratios, eigenvalues, and complex ML metric pipelines.`,
      r`Roughly 63.2% of distinct samples appear in each bootstrap sample, leaving 36.8% out-of-bag (the foundation of Random Forest OOB error).`,
      r`The standard jackknife fails on non-smooth statistics (such as the sample median); the delete-$d$ jackknife or bootstrap must be used instead.`,
      r`Percentile bootstrap intervals can be biased for skewed distributions; the $\text{BC}_a$ (bias-corrected and accelerated) method adjusts for skewness and acceleration.`,
    ],
    pitfalls: [
      r`Bootstrapping time series data with simple i.i.d. resampling, which destroys serial autocorrelation; block bootstrap must be used instead.`,
      r`Using the standard leave-one-out jackknife for the median; removing one point changes the median in discrete jumps, leading to inconsistent variance estimates.`,
      r`Believing the bootstrap creates new information; if the original sample is small or unrepresentative, the bootstrap simply replicates that bias.`,
      r`Using too few bootstrap replications; while $B = 200$ suffices for standard errors, confidence interval tails require $B \ge 1,000$ to $2,000$.`,
    ],
    code: r`import numpy as np

rng = np.random.default_rng(42)
# Skewed sample of 50 observations (e.g. server latencies in ms)
data = rng.lognormal(mean=3.0, sigma=0.8, size=50)

# Non-parametric statistic: sample median
sample_median = np.median(data)

# Bootstrap estimation (B = 2,000 resamples)
B = 2000
boot_medians = np.zeros(B)
n = len(data)

for b in range(B):
    resample = rng.choice(data, size=n, replace=True)
    boot_medians[b] = np.median(resample)

boot_se = np.std(boot_medians, ddof=1)
ci_lower = np.percentile(boot_medians, 2.5)
ci_upper = np.percentile(boot_medians, 97.5)

print(f"Sample Median: {sample_median:.2f}")
print(f"Bootstrap SE: {boot_se:.3f}")
print(f"95% Percentile CI: [{ci_lower:.2f}, {ci_upper:.2f}]")`,
    quiz: [
      {
        q: r`What approximate percentage of unique original training instances are included in any single standard bootstrap sample of size $n$?`,
        o: [r`50.0%`, r`63.2%`, r`95.0%`, r`100.0%`],
        a: 1,
        why: r`Because sampling is done with replacement, each point has probability $1 - (1 - 1/n)^n \approx 1 - e^{-1} \approx 0.6321$ (or 63.2%) of appearing at least once.`,
      },
      {
        q: r`For which of the following statistics does the classical leave-one-out jackknife fail to provide a consistent variance estimate?`,
        o: [r`Sample mean`, r`Sample variance`, r`Sample median`, r`Linear regression slope`],
        a: 2,
        why: r`The jackknife requires the estimator to be smooth (differentiable). The sample median is non-smooth; deleting a single point causes discontinuous jumps in rank.`,
      },
      {
        q: r`Why is naive i.i.d. bootstrapping inappropriate for time-series forecasting models?`,
        o: [r`Because time-series data cannot be averaged`, r`Because bootstrap samples must be larger than $n$`, r`Because time-series data is always strictly Gaussian`, r`Because random resampling with replacement destroys temporal ordering and autocorrelation`],
        a: 3,
        why: r`Independent resampling scrambles the sequence of observations, destroying serial dependence. Time-series data requires block bootstrapping to preserve local autocorrelation.`,
      },
      {
        q: r`What is the primary advantage of the bootstrap over classical asymptotic normal confidence intervals?`,
        o: [r`It does not require deriving analytical formulas or assuming a specific parametric distribution`, r`It guarantees narrower confidence intervals`, r`It eliminates all sampling bias automatically`, r`It works with zero data`],
        a: 0,
        why: r`The bootstrap is fully non-parametric and computational: it estimates standard errors and quantiles directly from empirical resampling without requiring closed-form calculus derivations or Gaussian assumptions.`,
      },
    ],
    usedBy: ['random_forest_regressor', 'random_forest_classifier', 'cross-validation'],
    prereq: ['sampling-and-standard-error', 'confidence-intervals'],
    related: ['cross-validation', 'bias-variance-tradeoff'],
    keywords: 'bootstrap jackknife resampling replacement out-of-bag oob non-parametric percentile',
  },
];
