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
  {
    id: 'hypothesis-testing-and-p-values',
    short: 'Hypothesis Tests & p-Values',
    title: r`Hypothesis Testing and p-Values`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`Establish null and alternative hypotheses, choose test statistics, and compute p-values to make principled scientific decisions under uncertainty.`,
    lead: r`Hypothesis testing formalises empirical decision-making by evaluating whether observed data can be credibly explained by pure random chance. The p-value quantifies how extreme the observed evidence is under an assumed null hypothesis, providing an objective benchmark for rejecting baseline models.`,
    intuition: [
      r`Suppose an online store tests a checkout redesign intended to improve purchase completion above the historic 10% rate. In a test run of 500 shoppers using the new design, 65 complete their orders (13.0%). Is this 3 percentage point uplift genuine evidence that the new checkout converts better, or could it easily be a streak of good luck from 500 random customer decisions?`,
      r`Hypothesis testing tackles this by adopting a sceptical devil's advocate stance known as the null hypothesis ($H_0$): assume the redesign made no difference and the true conversion probability remains exactly 10%, giving an expected count of 50 purchasers. We then construct the sampling distribution of outcomes that pure chance would generate under $H_0$ and ask: how likely is it to see 65 or more purchasers purely by random sampling noise?`,
      r`Using the standard normal approximation with standard error $\sqrt{0.10 \times 0.90 / 500} \approx 0.0134$, an observed 13% rate sits $2.236$ standard errors above expectation. Under the null hypothesis, obtaining an outcome at least this extreme in either direction occurs with a probability of approximately 0.0253 (a p-value of 2.53%). Because this p-value falls below our pre-established significance threshold of 5% ($\alpha = 0.05$), we reject the null hypothesis and conclude that the conversion increase is statistically significant.`,
    ],
    analogy: r`A hypothesis test operates like a criminal trial: the defendant is presumed innocent (null hypothesis) until the prosecution presents evidence so improbable under innocence that guilt is established beyond reasonable doubt (the significance threshold $\alpha$).`,
    steps: [
      r`State the null hypothesis $H_0$ (baseline equality or absence of effect) and the alternative hypothesis $H_1$ (presence of an effect or difference).`,
      r`Choose a significance threshold $\alpha$ (conventionally 0.05 or 0.01) before inspecting or collecting the experimental data.`,
      r`Select an appropriate test statistic $T$ whose exact or asymptotic sampling distribution is known when $H_0$ is true.`,
      r`Compute the observed test statistic $t_{\text{obs}}$ from the collected sample data.`,
      r`Calculate the p-value: the probability under the null distribution of obtaining a test statistic at least as extreme as $t_{\text{obs}}$.`,
      r`Make a formal decision: if $p \le \alpha$, reject $H_0$ in favour of $H_1$; if $p > \alpha$, fail to reject $H_0$.`,
    ],
    math: [
      {
        h: 'Null and Alternative Hypotheses',
        tex: r`$$H_0: \theta = \theta_0 \quad \text{versus} \quad H_1: \theta \ne \theta_0 \quad (\text{or } H_1: \theta > \theta_0)$$`,
        p: r`Here $\theta$ denotes the true population parameter and $\theta_0$ is the baseline null value. A two-sided alternative ($H_1: \theta \ne \theta_0$) tests for departures in either direction, whereas a one-sided alternative ($H_1: \theta > \theta_0$ or $\theta < \theta_0$) concentrates statistical power entirely on one pre-specified direction. One-sided tests must be justified on rigorous theoretical grounds prior to seeing the data.`,
      },
      {
        h: 'The p-Value Definition',
        tex: r`$$p = P(T(\mathbf{X}) \ge t_{\text{obs}} \mid H_0) \quad \text{or} \quad p = 2 \cdot \min\left(P(T \ge t_{\text{obs}} \mid H_0), \, P(T \le t_{\text{obs}} \mid H_0)\right)$$`,
        p: r`The p-value is the conditional probability of obtaining a test statistic $T(\mathbf{X})$ at least as contradictory to $H_0$ as the observed value $t_{\text{obs}}$, calculated assuming $H_0$ is true. For symmetric distributions, a two-sided p-value doubles the one-sided tail probability. Crucially, the p-value is $P(\text{data} \mid H_0)$, not the posterior probability $P(H_0 \mid \text{data})$ of the hypothesis being true.`,
      },
      {
        h: 'Uniformity under the Null',
        tex: r`$$p \sim \text{Uniform}(0, 1) \quad \text{when } H_0 \text{ holds}$$`,
        p: r`When the null hypothesis is true and the test statistic is continuous with cumulative distribution function $F_0$, the probability integral transform ensures that the p-value is uniformly distributed across the interval $[0, 1]$. Consequently, the probability of falsely rejecting a true null hypothesis at threshold $\alpha$ is identically $P(p \le \alpha \mid H_0) = \alpha$.`,
      },
    ],
    keyPoints: [
      r`The p-value measures compatibility between observed data and the null model; it is never the probability that the null hypothesis is true.`,
      r`Statistical significance is not practical significance: massive datasets make negligible, irrelevant differences yield $p < 0.001$.`,
      r`The decision threshold $\alpha$ must be fixed strictly in advance of data collection to prevent post-hoc rationalisation.`,
      r`Failing to reject the null hypothesis does not prove the null is true; absence of evidence is not evidence of absence.`,
    ],
    pitfalls: [
      r`The prosecutor's fallacy: treating $p = 0.02$ as a 2% probability that the null hypothesis is correct. Inverting conditional probabilities requires Bayes' theorem and prior odds.`,
      r`Data dredging and p-hacking: testing dozens of subgroup combinations or stopping data collection early as soon as $p < 0.05$ emerges.`,
      r`Treating $\alpha = 0.05$ as an ontological cliff: interpreting $p = 0.049$ as scientific truth and $p = 0.051$ as complete absence of an effect.`,
      r`Reporting p-values without confidence intervals or effect sizes, hiding whether an effect is commercially or scientifically meaningful.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

# Test whether new checkout conversion exceeds historic 10%
n = 500
p0 = 0.10
observed_conversions = 65
p_hat = observed_conversions / n

# Standard error under the null hypothesis H0
se_null = np.sqrt(p0 * (1.0 - p0) / n)
z_stat = (p_hat - p0) / se_null

# Two-sided p-value from standard normal distribution
p_value = 2.0 * (1.0 - stats.norm.cdf(abs(z_stat)))
alpha = 0.05

print(f"Observed rate: {p_hat:.1%} (n={n})")
print(f"z-statistic: {z_stat:.3f}")
print(f"p-value: {p_value:.4f}")
print(f"Decision at alpha={alpha}: {'Reject H0' if p_value <= alpha else 'Fail to reject H0'}")`,
    quiz: [
      {
        q: r`What does a p-value of 0.03 strictly mean in an experimental hypothesis test?`,
        o: [
          r`There is a 3% probability that the null hypothesis is true`,
          r`If the null hypothesis were true, there is a 3% probability of observing data at least as extreme as the actual result`,
          r`There is a 97% probability that the experimental intervention is effective`,
          r`The experiment has an error rate of 3% across repeated trials`,
        ],
        a: 1,
        why: r`The p-value is the conditional probability $P(\text{data as or more extreme} \mid H_0)$. It says nothing about $P(H_0 \mid \text{data})$ without specifying prior probabilities via Bayes' theorem.`,
      },
      {
        q: r`Why does collecting an enormous sample size (e.g. $n = 1,000,000$) create a challenge for interpreting p-values?`,
        o: [
          r`Standard errors expand, making p-values unreliable`,
          r`The central limit theorem ceases to apply`,
          r`Tiny, practically meaningless differences between groups become statistically significant with $p < 0.001$`,
          r`The test statistic no longer follows its theoretical null distribution`,
        ],
        a: 2,
        why: r`Standard error shrinks as $1/\sqrt{n}$. With millions of observations, trivial deviations with zero practical importance easily generate massive test statistics and tiny p-values.`,
      },
      {
        q: r`If an analyst carries out a hypothesis test at $\alpha = 0.05$ and finds $p = 0.22$, which conclusion is formally valid?`,
        o: [
          r`The null hypothesis is proven true`,
          r`The sample data provides insufficient evidence to reject the null hypothesis at the 5% level`,
          r`The probability that the alternative hypothesis is true is 0.22`,
          r`The test should be switched to a one-sided test to achieve significance`,
        ],
        a: 1,
        why: r`Failing to reject $H_0$ means the observed data is reasonably consistent with chance; it never proves the null hypothesis holds true.`,
      },
      {
        q: r`Under the null hypothesis for a continuous test statistic, what probability distribution does the p-value follow?`,
        o: [
          r`Standard normal distribution $\mathcal{N}(0, 1)$`,
          r`Student's $t$-distribution with $n-1$ degrees of freedom`,
          r`Uniform distribution on $[0, 1]$`,
          r`Exponential distribution with parameter $\lambda = 1$`,
        ],
        a: 2,
        why: r`By the probability integral transform, any continuous random variable transformed by its own cumulative distribution function follows $\text{Uniform}(0, 1)$. Hence $P(p \le \alpha \mid H_0) = \alpha$.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'logistic_regression'],
    prereq: ['random-variables-and-distributions', 'sampling-and-standard-error', 'confidence-intervals'],
    related: ['type-i-ii-errors-power-and-sample-size', 'z-test-and-t-tests', 'chi-square-tests'],
    keywords: 'hypothesis testing p-value null hypothesis alternative test statistic significance alpha level two-sided one-sided',
  },
  {
    id: 'type-i-ii-errors-power-and-sample-size',
    short: 'Errors, Power and Sample Size',
    title: r`Type I/II Errors, Power and Sample Size`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Master the trade-off between false alarms (Type I error) and missed detections (Type II error). Size experiments to guarantee adequate statistical power.`,
    lead: r`Every statistical decision risks two fundamental mistakes: raising a false alarm when no effect exists (Type I error), or missing a genuine effect when one is present (Type II error). Statistical power measures a test's ability to detect true differences, and pre-experiment sample size planning guarantees that studies are neither underpowered nor wastefully oversized.`,
    intuition: [
      r`Think of a commercial smoke alarm system installed in an office. A Type I error ($\alpha$) is a false alarm: someone burns toast in the kitchen, triggering sirens and evacuating the entire building even though there is no actual blaze. A Type II error ($\beta$) is a missed detection: a genuine electrical fire starts in the server room, but the sensor fails to register the smoke. Statistical power ($1 - \beta$) is the system's true positive rate: the probability that the siren sounds given that a real fire has erupted.`,
      r`Dialling up sensor sensitivity makes the alarm trigger at the faintest wisp of smoke, reducing missed detections (lowering $\beta$, boosting power) but causing more false alarms from routine cooking (increasing $\alpha$). Conversely, making the sensor less sensitive suppresses false alarms but leaves real fires undetected. In hypothesis testing, researchers fix the maximum acceptable false alarm rate in advance, typically setting $\alpha = 0.05$.`,
      r`Once $\alpha$ is locked at 5%, how can an experimenter detect subtle effects without increasing false alarms? The only universal lever is collecting more data. Increasing sample size shrinks standard errors, sharpening the separation between the null and alternative distributions. For example, detecting a subtle uplift of Cohen's $d = 0.35$ with 80% power at $\alpha = 0.05$ requires exactly 129 participants per group. With only 30 participants per group, power plunges below 28%, meaning you are more than twice as likely to miss the true effect as to detect it.`,
    ],
    analogy: r`Balancing Type I and Type II errors is like setting the sensitivity on an airport metal detector: tune it too high and every belt buckle triggers an inspection; tune it too low and contraband passes through unnoticed.`,
    steps: [
      r`Specify the significance threshold $\alpha$ (the maximum tolerable false positive rate, typically 0.05).`,
      r`Determine the minimum detectable effect (MDE) $\delta$ that is commercially or scientifically worthwhile to discover.`,
      r`Choose the desired statistical power $1 - \beta$ (typically 0.80 or 0.90, accepting a 10% to 20% risk of a false negative).`,
      r`Estimate baseline variance $\sigma^2$ from historical records or an exploratory pilot sample.`,
      r`Calculate the required per-group sample size $n$ using the analytical power equation prior to collecting any live data.`,
      r`Run the experiment to the full calculated sample size without early stopping or opportunistic peeking.`,
    ],
    math: [
      {
        h: 'The Decision Matrix and Error Probabilities',
        tex: r`$$\alpha = P(\text{Reject } H_0 \mid H_0 \text{ true}), \qquad \beta = P(\text{Fail to reject } H_0 \mid H_1 \text{ true})$$`,
        p: r`Type I error ($\alpha$, false positive rate) occurs when we reject a true null hypothesis. Type II error ($\beta$, false negative rate) occurs when we fail to reject a false null hypothesis. Statistical power is defined as the complement $1 - \beta = P(\text{Reject } H_0 \mid H_1 \text{ true})$, which corresponds to sensitivity or recall in binary classification.`,
      },
      {
        h: 'Two-Sample Mean Sample Size Formula',
        tex: r`$$n = \frac{2\left(z_{1 - \alpha/2} + z_{1 - \beta}\right)^2 \sigma^2}{\delta^2}$$`,
        p: r`For a two-sample $z$-test comparing means with common variance $\sigma^2$ and true difference $\delta = |\mu_1 - \mu_2|$, the required sample size per group $n$ scales with the squared critical normal quantiles. At $\alpha = 0.05$ ($z_{0.975} \approx 1.960$) and 80% power ($z_{0.80} \approx 0.842$), the numerator multiplier $(1.960 + 0.842)^2 \approx 7.85$.`,
      },
      {
        h: 'Standardised Effect Size (Cohen\'s d)',
        tex: r`$$d = \frac{|\mu_1 - \mu_2|}{\sigma} \implies n \approx \frac{2\left(z_{1 - \alpha/2} + z_{1 - \beta}\right)^2}{d^2}$$`,
        p: r`Cohen's $d$ expresses the effect size in units of standard deviations. Because $n$ is inversely proportional to $d^2$, detecting an effect half as large requires four times as many observations per group. Sizing studies to detect tiny effects without adequate sample sizes guarantees severe underpowering.`,
      },
    ],
    keyPoints: [
      r`Statistical power depends on four interconnected parameters: significance level $\alpha$, sample size $n$, effect size $\delta$, and population variance $\sigma^2$.`,
      r`Required sample size scales inversely with the square of effect size: halving the target effect quadruples the required sample size.`,
      r`Underpowered studies suffer from the winner's curse: when a small study does reach significance, its estimated effect size is substantially exaggerated.`,
      r`Never compute retrospective or post-hoc power using observed p-values; power is an essential pre-experiment design tool, not an after-the-fact diagnostic.`,
    ],
    pitfalls: [
      r`Interpreting a non-significant result ($p > 0.05$) in an underpowered study as evidence of "no difference", when the study was simply blind to realistic effect sizes.`,
      r`The winner's curse: deploying an algorithm or feature based on a tiny significant pilot test, only to discover performance collapses in production.`,
      r`Continuous peeking: repeatedly checking p-values as users arrive and stopping the test the moment $p < 0.05$, which multiplies the true Type I error rate substantially above $\alpha$.`,
      r`Confusing statistical power with sample representativeness: a huge sample size provides high power to detect differences, but cannot fix selection bias.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

# Required sample size for two-sample test (Cohen's d = 0.35)
alpha = 0.05
target_power = 0.80
d = 0.35

z_alpha = stats.norm.ppf(1.0 - alpha / 2.0)  # ~1.960
z_beta = stats.norm.ppf(target_power)         # ~0.842
n_required = int(np.ceil(2.0 * ((z_alpha + z_beta) / d) ** 2))

# Verify statistical power through Monte Carlo simulation
rng = np.random.default_rng(42)
n_simulations = 2000
group_a = rng.normal(loc=0.0, scale=1.0, size=(n_simulations, n_required))
group_b = rng.normal(loc=d, scale=1.0, size=(n_simulations, n_required))

# Independent two-sample t-tests across all simulated trials
_, p_values = stats.ttest_ind(group_b, group_a, axis=1)
empirical_power = float(np.mean(p_values < alpha))

print(f"Cohen's d: {d}, alpha: {alpha}, target power: {target_power}")
print(f"Required sample size per group: {n_required}")
print(f"Empirical power ({n_simulations} trials): {empirical_power:.3f}")`,
    quiz: [
      {
        q: r`In hypothesis testing, what constitutes a Type II error ($\beta$)?`,
        o: [
          r`Rejecting the null hypothesis when the null hypothesis is true`,
          r`Failing to reject the null hypothesis when the alternative hypothesis is true`,
          r`Choosing a significance threshold $\alpha$ that is too conservative`,
          r`Calculating a p-value using the wrong test statistic`,
        ],
        a: 1,
        why: r`Type II error is a false negative: failing to reject $H_0$ despite a real effect existing in the underlying population.`,
      },
      {
        q: r`If you want to detect an effect size half as large as in a previous study (e.g. $d = 0.20$ instead of $0.40$) while keeping $\alpha$ and power constant, how does the required sample size change?`,
        o: [
          r`It doubles ($2\times$)`,
          r`It quadruples ($4\times$)`,
          r`It increases by $\sqrt{2}\approx 1.41\times$`,
          r`It remains unchanged`,
        ],
        a: 1,
        why: r`Because the required sample size is proportional to $1/d^2$, halving the effect size ($d \to d/2$) multiplies the required sample size by $(2)^2 = 4$.`,
      },
      {
        q: r`What is the primary danger of the "winner's curse" in severely underpowered experiments?`,
        o: [
          r`Significant results from small studies systematically overestimate the true magnitude of the effect`,
          r`The Type I error rate drops to zero`,
          r`p-values become completely impossible to calculate`,
          r`Computations take excessive time to converge`,
        ],
        a: 0,
        why: r`When power is low, only sample estimates that randomly overshoot the true mean by a huge margin cross the significance threshold, leading to severe upward bias in published effect estimates.`,
      },
      {
        q: r`How does continuous data peeking (checking p-values after every observation and stopping when $p < 0.05$) affect the experiment?`,
        o: [
          r`It improves statistical power without affecting Type I error`,
          r`It drastically inflates the actual Type I error rate far above the nominal 5% level`,
          r`It reduces the required sample size with zero statistical penalty`,
          r`It converts a two-sided test into a paired t-test`,
        ],
        a: 1,
        why: r`Repeatedly testing accumulating data provides multiple opportunities for random noise to cross the threshold, inflating false positive rates well beyond nominal $\alpha$.`,
      },
    ],
    usedBy: ['confusion-matrix', 'precision-recall-f1'],
    prereq: ['hypothesis-testing-and-p-values', 'sampling-and-standard-error', 'confidence-intervals'],
    related: ['z-test-and-t-tests', 'chi-square-tests', 'confusion-matrix'],
    keywords: 'type i error type ii error statistical power sample size beta alpha false positive false negative mde cohens d winners curse',
  },
  {
    id: 'z-test-and-t-tests',
    short: 'z-Test and Student\'s t-Tests',
    title: r`z-Test and t-Tests`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`Compare population means against benchmarks or between independent and paired groups using normal z-tests and Student's and Welch's t-tests.`,
    lead: r`When testing hypotheses about population means, the choice of test statistic hinges on whether population variance is known and whether sample sizes justify asymptotic normal approximations. The z-test applies when variance is known or sample sizes are large, whereas Student's and Welch's t-tests account for the extra uncertainty of estimating variance from small samples.`,
    intuition: [
      r`Imagine an engineering team modifies a database query engine to reduce latency below the historic benchmark of 120 ms. They benchmark 25 query runs and record a sample mean latency of 112 ms with a sample standard deviation $s = 15$ ms. Is this 8 ms reduction convincing evidence of improvement, or could it be routine variance in server load?`,
      r`If we knew with absolute certainty from millions of historic runs that the true population standard deviation was $\sigma = 15$ ms, the standard error would be exactly $\sigma / \sqrt{25} = 3.0$ ms. The standard score would be $z = (112 - 120) / 3.0 = -2.67$, giving a two-sided p-value of approximately 0.0076 under the standard normal distribution.`,
      r`However, in realistic settings we do not know the true $\sigma$; we must estimate it using $s$ from the very same 25 queries. When William Gosset analysed this problem at the Guinness Brewery in 1908 (publishing under the pen name "Student"), he proved that dividing by an estimated $s$ inflates sampling variability. The resulting $t$-distribution has heavier tails than the normal curve. For 24 degrees of freedom, $t = -2.67$ yields a p-value of approximately 0.0134—nearly double the normal p-value! Relying naively on a $z$-test when $s$ is estimated causes overconfidence and elevated false alarms.`,
    ],
    analogy: r`Using a normal z-test when you only have sample variance s is like driving at top speed on a foggy morning: it assumes clarity where there is hidden uncertainty, which the t-distribution's heavier tails properly account for.`,
    steps: [
      r`Determine the test design: one-sample (mean vs standard), two-sample independent (group A vs group B), or paired (repeated measures on the same subjects).`,
      r`Verify assumptions: continuous data, random independent sampling, and approximate normality of sample means (guaranteed by CLT for $n \ge 30$).`,
      r`If population standard deviation $\sigma$ is known, compute the $z$-statistic; if estimated via $s$, compute the $t$-statistic.`,
      r`For two independent groups, adopt Welch's $t$-test by default to guard against unequal variances ($\sigma_1^2 \ne \sigma_2^2$).`,
      r`For paired observations, compute unit-level differences $D_i = X_{1,i} - X_{2,i}$ and perform a one-sample $t$-test on the differences.`,
      r`Evaluate the p-value against degrees of freedom $\nu$ and decide whether to reject the null hypothesis at threshold $\alpha$.`,
    ],
    math: [
      {
        h: 'One-Sample z-Statistic and Student\'s t-Statistic',
        tex: r`$$z = \frac{\bar{X} - \mu_0}{\sigma / \sqrt{n}} \sim \mathcal{N}(0, 1), \qquad t = \frac{\bar{X} - \mu_0}{s / \sqrt{n}} \sim t(n - 1)$$`,
        p: r`Here $\bar{X}$ is the sample mean, $\mu_0$ is the hypothesised benchmark, $\sigma$ is the known population standard deviation, and $s = \sqrt{\frac{1}{n-1}\sum (X_i - \bar{X})^2}$ is the sample standard deviation. Gosset's $t$-statistic follows Student's $t$-distribution with $\nu = n - 1$ degrees of freedom, converging to $\mathcal{N}(0, 1)$ as $n \to \infty$.`,
      },
      {
        h: 'Welch\'s Two-Sample t-Test (Unequal Variances)',
        tex: r`$$t = \frac{\bar{X}_1 - \bar{X}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}, \qquad \nu \approx \frac{\left(\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}\right)^2}{\frac{(s_1^2 / n_1)^2}{n_1 - 1} + \frac{(s_2^2 / n_2)^2}{n_2 - 1}}$$`,
        p: r`Welch's $t$-test compares two independent group means without assuming equal population variances ($\sigma_1^2 = \sigma_2^2$). The Welch–Satterthwaite equation approximates the effective degrees of freedom $\nu$. Welch's test maintains robust Type I error control under heteroscedasticity where Student's pooled $t$-test breaks down.`,
      },
      {
        h: 'Paired t-Test for Dependent Samples',
        tex: r`$$D_i = X_{1,i} - X_{2,i}, \qquad t = \frac{\bar{D} - 0}{s_D / \sqrt{n}} \sim t(n - 1)$$`,
        p: r`For matched pairs or repeated measures (such as pre- and post-treatment values for the same users), between-subject variability is removed by taking differences $D_i$. Here $\bar{D}$ is the average difference and $s_D$ is the sample standard deviation of differences. Subtracting out subject baseline variation dramatically increases statistical power.`,
      },
    ],
    keyPoints: [
      r`Gosset's $t$-distribution accounts for the joint uncertainty of estimating both the population mean $\mu$ and population standard deviation $\sigma$.`,
      r`Always prefer Welch's $t$-test over Student's pooled $t$-test for two independent samples; testing for equality of variances first creates pre-test bias.`,
      r`Paired $t$-tests eliminate subject-to-subject variability by analysing intra-subject differences, providing far greater statistical power for matched cohorts.`,
      r`Thanks to the central limit theorem, $t$-tests are remarkably robust to non-normal data once sample sizes exceed roughly 30 observations per group.`,
    ],
    pitfalls: [
      r`Applying an independent two-sample $t$-test to paired or before-and-after data, throwing away subject pairing and crippling statistical power.`,
      r`Using Student's pooled $t$-test when group sample sizes and variances are unequal, which severely inflates the false positive rate.`,
      r`Running a $t$-test on small samples ($n < 20$) with extreme skewness or severe outliers where the sample mean is not approximately normal.`,
      r`Using a $z$-test when sample size is small and $\sigma$ is estimated from the sample, producing falsely narrow confidence bounds and deflated p-values.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n_users = 30

# Paired experiment: latency before and after database indexing
pre_latency = rng.normal(loc=72.0, scale=8.0, size=n_users)
# Each user improves by ~3.5 ms, plus individual variation
post_latency = pre_latency - rng.normal(loc=3.5, scale=4.0, size=n_users)

# 1. Paired t-test (correct: accounts for within-subject correlation)
t_pair, p_pair = stats.ttest_rel(pre_latency, post_latency)

# 2. Independent Welch t-test (incorrect: ignores pairing)
t_welch, p_welch = stats.ttest_ind(pre_latency, post_latency, equal_var=False)

mean_improvement = float(np.mean(pre_latency - post_latency))
print(f"Mean improvement: {mean_improvement:.2f} ms")
print(f"Paired t-test:    t={t_pair:.3f}, p-value={p_pair:.4e}")
print(f"Welch t-test:     t={t_welch:.3f}, p-value={p_welch:.4f}")`,
    quiz: [
      {
        q: r`Why does Student's $t$-distribution have heavier tails than the standard normal distribution?`,
        o: [
          r`Because data points in small samples are inherently non-normal`,
          r`Because estimating the unknown population variance with the sample variance introduces additional random variability into the denominator`,
          r`Because the degrees of freedom increase the variance of the numerator`,
          r`Because Student's test assumes an exponential distribution`,
        ],
        a: 1,
        why: r`The sample standard deviation $s$ fluctuates from sample to sample. Dividing the sample mean by a random denominator fattens the tails of the test statistic distribution.`,
      },
      {
        q: r`When comparing means between two independent groups of different sizes, why is Welch's $t$-test preferred over Student's pooled $t$-test?`,
        o: [
          r`Welch's test does not require the assumption of equal population variances ($\sigma_1^2 = \sigma_2^2$)`,
          r`Welch's test always produces a smaller p-value`,
          r`Welch's test works on categorical data`,
          r`Welch's test eliminates the need for random sampling`,
        ],
        a: 0,
        why: r`Student's pooled test assumes homoscedasticity ($\sigma_1^2 = \sigma_2^2$). When variances differ and group sizes are unequal, the pooled test has severely distorted Type I error rates. Welch's test does not require equal variances.`,
      },
      {
        q: r`In an experiment where 40 users complete tasks using Interface A and then Interface B, which test is appropriate to compare task completion times?`,
        o: [
          r`One-sample z-test`,
          r`Independent two-sample Welch t-test`,
          r`Paired t-test on the difference scores for each user`,
          r`Chi-square goodness-of-fit test`,
        ],
        a: 2,
        why: r`Because the same 40 users were tested under both conditions, observations are paired. Taking within-user differences removes user-to-user variability and isolates the interface effect.`,
      },
      {
        q: r`As the degrees of freedom $\nu$ in Student's $t$-distribution approach infinity ($\nu \to \infty$), what does the distribution become?`,
        o: [
          r`A uniform distribution $\text{Uniform}(-1, 1)$`,
          r`A chi-square distribution $\chi^2(1)$`,
          r`The standard normal distribution $\mathcal{N}(0, 1)$`,
          r`A Cauchy distribution`,
        ],
        a: 2,
        why: r`As $n \to \infty$, the sample standard deviation $s$ converges in probability to the true population standard deviation $\sigma$ by the law of large numbers, so $t(\nu)$ converges to $\mathcal{N}(0, 1)$.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'logistic_regression'],
    prereq: ['hypothesis-testing-and-p-values', 'type-i-ii-errors-power-and-sample-size', 'central-limit-theorem-and-law-of-large-numbers'],
    related: ['sampling-and-standard-error', 'confidence-intervals', 'chi-square-tests'],
    keywords: 'z-test t-test students t welchs t paired t test degrees of freedom two sample one sample difference in means',
  },
  {
    id: 'chi-square-tests',
    short: 'Chi-Square Tests',
    title: r`Chi-Square Tests`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Test categorical distributions using goodness-of-fit and contingency table tests of independence, comparing observed counts against expected frequencies.`,
    lead: r`While t-tests evaluate continuous measurements, many empirical problems involve counts of categorical occurrences. Pearson's chi-square ($\chi^2$) tests assess whether observed categorical frequencies conform to a theoretical distribution (goodness-of-fit) or whether two categorical variables are statistically independent.`,
    intuition: [
      r`Suppose an engineering team tests whether user device type (Desktop vs Mobile) is independent of subscription tier choice (Free, Pro, Enterprise). Over a week, 500 new users register: Desktop users comprise 120 Free, 80 Pro, and 50 Enterprise (250 total); Mobile users comprise 180 Free, 50 Pro, and 20 Enterprise (250 total). Overall, 300 users choose Free (60%), 130 choose Pro (26%), and 70 choose Enterprise (14%).`,
      r`If device type had zero influence on subscription choice (the null hypothesis of independence), both Desktop and Mobile users should mirror these overall 60%, 26%, and 14% shares. We would expect $250 \times 0.60 = 150.0$ Free Desktop users, $250 \times 0.26 = 65.0$ Pro Desktop users, and $250 \times 0.14 = 35.0$ Enterprise Desktop users. The exact same expected counts would apply to Mobile users.`,
      r`Comparing observed counts to expected frequencies reveals clear discrepancies: Free Desktop count is 120 (30 fewer than expected), while Enterprise Desktop is 50 (15 more than expected). Pearson's chi-square test tallies the normalised squared discrepancy $(O - E)^2 / E$ across all six table cells. Squaring prevents positive and negative deviations from cancelling out, while dividing by $E$ scales each residual relative to its baseline magnitude. For this table, the sum of residuals yields $\chi^2 = 31.78$ with 2 degrees of freedom, producing a p-value of $1.26 \times 10^{-7}$. Because this is vastly smaller than $\alpha = 0.05$, we reject independence and confirm that subscription choice is strongly linked to device type.`,
    ],
    analogy: r`Pearson's chi-square test is like auditing a casino roulette wheel: you compare how often the ball lands in each pocket against how often it should land if the wheel were perfectly balanced.`,
    steps: [
      r`Compile observed data into a two-way contingency table of raw frequency counts across $R$ rows and $C$ columns.`,
      r`Compute row totals $R_i$, column totals $C_j$, and the grand total sample size $N = \sum O_{ij}$.`,
      r`Under the null hypothesis of independence, calculate expected cell frequencies: $E_{ij} = (R_i \times C_j) / N$.`,
      r`Check Cochran's sample size criteria: ensure all $E_{ij} \ge 1$ and at least 80% of cells have $E_{ij} \ge 5$.`,
      r`Sum Pearson residuals $\sum (O_{ij} - E_{ij})^2 / E_{ij}$ to obtain the test statistic $\chi^2$ with degrees of freedom $\nu = (R - 1)(C - 1)$.`,
      r`Calculate the p-value from the $\chi^2(\nu)$ distribution and decide whether to reject the null hypothesis of independence.`,
    ],
    math: [
      {
        h: 'Pearson\'s Chi-Square Test Statistic',
        tex: r`$$\chi^2 = \sum_{i=1}^R \sum_{j=1}^C \frac{(O_{ij} - E_{ij})^2}{E_{ij}} \sim \chi^2(\nu)$$`,
        p: r`Here $O_{ij}$ is the observed integer frequency in row $i$ and column $j$, and $E_{ij}$ is the expected frequency under $H_0$. Under the null hypothesis, as sample size $N \to \infty$, this sum of normalised squared deviations converges asymptotically to a chi-square distribution with $\nu$ degrees of freedom.`,
      },
      {
        h: 'Expected Frequencies and Degrees of Freedom',
        tex: r`$$E_{ij} = \frac{R_i C_j}{N}, \qquad \nu = (R - 1)(C - 1)$$`,
        p: r`Here $R_i$ is the $i$-th row marginal sum, $C_j$ is the $j$-th column marginal sum, and $N$ is total sample size. In an $R \times C$ contingency table, fixing row and column totals leaves $(R - 1)(C - 1)$ cells free to vary independently, determining the degrees of freedom $\nu$. For a 1D goodness-of-fit test with $K$ categories, $\nu = K - 1$.`,
      },
      {
        h: 'Goodness-of-Fit Test Statistic',
        tex: r`$$\chi^2 = \sum_{k=1}^K \frac{(O_k - n p_k)^2}{n p_k} \sim \chi^2(K - 1 - m)$$`,
        p: r`In goodness-of-fit testing, observed counts $O_k$ across $K$ categories are compared to theoretical expected counts $n p_k$, where $p_k$ is the hypothesised probability of category $k$. If $m$ parameters of the theoretical distribution are estimated from the sample data (such as fitting a Poisson rate $\lambda$), the degrees of freedom are reduced to $\nu = K - 1 - m$.`,
      },
    ],
    keyPoints: [
      r`Chi-square tests require raw integer counts; never run chi-square calculations on percentages, fractions, or normalised rates.`,
      r`Degrees of freedom in contingency tables depend exclusively on table dimensions $(R - 1)(C - 1)$, entirely independent of sample size $N$.`,
      r`Cochran's guideline requires expected cell counts to equal or exceed 5 in at least 80% of cells; when counts are smaller, use Fisher's exact test.`,
      r`A significant chi-square test confirms an association exists, but standardised residuals must be examined to identify which specific cells drive the divergence.`,
    ],
    pitfalls: [
      r`Inputting percentages or conversion rates instead of raw integer counts, which destroys the underlying multinomial sampling variance model.`,
      r`Applying standard chi-square tests to repeated measures or paired categorical data (such as user choices before and after an update); use McNemar's test instead.`,
      r`Ignoring low expected cell frequencies ($E_{ij} < 5$), where the continuous chi-square approximation fails and produces inaccurate p-values.`,
      r`Confusing statistical association with causal direction: a significant chi-square test indicates dependence between variables, not that one variable causes the other.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

# Contingency table: Device (Desktop, Mobile) vs Tier (Free, Pro, Enterprise)
observed = np.array([
    [120, 80, 50],   # Desktop
    [180, 50, 20],   # Mobile
])

# Pearson's chi-square test of independence
chi2_stat, p_val, dof, expected = stats.chi2_contingency(observed)

print("Observed table:\n", observed)
print(f"Expected counts:\n{np.round(expected, 1)}")
print(f"Chi-square statistic: {chi2_stat:.3f}")
print(f"Degrees of freedom:   {dof}")
print(f"p-value:              {p_val:.4e}")
print(f"Independence rejected at alpha=0.05: {p_val <= 0.05}")`,
    quiz: [
      {
        q: r`Why is it invalid to run a chi-square test on percentages or proportions (e.g. 0.40 and 0.60) rather than raw counts?`,
        o: [
          r`Because chi-square algorithms only accept floating-point numbers`,
          r`Because percentages disguise sample size, destroying the relationship between count variance and expected frequencies`,
          r`Because percentages always sum to 100`,
          r`Because proportions follow a Student's t-distribution`,
        ],
        a: 1,
        why: r`Chi-square test statistics rely on Poisson or multinomial sampling variance, where the variance of a count is proportional to $N$. Converting counts to proportions eliminates sample size information.`,
      },
      {
        q: r`How many degrees of freedom does a $3 \times 4$ contingency table have in a test of independence?`,
        o: [
          r`12`,
          r`11`,
          r`6`,
          r`7`,
        ],
        a: 2,
        why: r`Degrees of freedom for an $R \times C$ table are $(R - 1)(C - 1)$. For a $3 \times 4$ table, $(3 - 1)(4 - 1) = 2 \times 3 = 6$.`,
      },
      {
        q: r`When expected cell counts $E_{ij}$ in a $2 \times 2$ table fall below 5, which test should be used instead of Pearson's chi-square test?`,
        o: [
          r`Paired t-test`,
          r`Fisher's exact test`,
          r`One-way ANOVA`,
          r`Mann-Whitney U test`,
        ],
        a: 1,
        why: r`When cell counts are small ($E_{ij} < 5$), the continuous chi-square approximation breaks down. Fisher's exact test computes exact hypergeometric probabilities without relying on asymptotic approximations.`,
      },
      {
        q: r`What does a statistically significant result ($p < 0.001$) in a chi-square test of independence demonstrate?`,
        o: [
          r`One categorical variable directly causes the other`,
          r`The two categorical variables are statistically dependent in the sampled population`,
          r`All categories have identical frequencies`,
          r`The expected cell counts are all greater than 5`,
        ],
        a: 1,
        why: r`Rejecting the null hypothesis of independence indicates that the row and column classifications are statistically dependent, though it does not imply causal direction.`,
      },
    ],
    usedBy: ['decision_tree_classifier', 'feature-selection'],
    prereq: ['hypothesis-testing-and-p-values', 'random-variables-and-distributions'],
    related: ['type-i-ii-errors-power-and-sample-size', 'z-test-and-t-tests', 'confusion-matrix'],
    keywords: 'chi-square test contingency table goodness of fit independence pearsons test expected frequencies categorical',
  },
  {
    id: 'anova-and-post-hoc-tests',
    short: 'ANOVA and Post-Hoc Tests',
    title: r`ANOVA and Post-Hoc Tests`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Compare means across three or more groups simultaneously with the F-test, and pinpoint specific differences using Tukey's HSD post-hoc procedure.`,
    lead: r`Running repeated pair-wise t-tests across multiple groups rapidly inflates the false alarm rate to unacceptable levels. Analysis of Variance (ANOVA) solves this multi-group dilemma with a single omnibus F-test that partitions total variability into between-group signal and within-group noise. When the omnibus test reveals significant variance, post-hoc procedures like Tukey's Honest Significant Difference (HSD) safely isolate which specific pairs differ.`,
    intuition: [
      r`Imagine an e-commerce platform testing three landing page layouts: A, B, and C. They recruit 30 users per layout (90 users total) and measure session duration in seconds. Average engagement is 45.2 seconds for Layout A, 49.1 seconds for Layout B, and 54.0 seconds for Layout C.`,
      r`A novice analyst might test Layout A vs B, A vs C, and B vs C with three separate two-sample $t$-tests. However, conducting three independent tests at a 5% false positive threshold gives a combined risk of at least one false alarm of $1 - (1 - 0.05)^3 \approx 14.3\%$. With 10 groups, there are 45 pairwise comparisons, pushing the chance of at least one false discovery over 90%!`,
      r`ANOVA prevents this multiplicity trap by evaluating all groups at once. It asks a single question: is the variance between group averages substantially larger than the natural random variance among users within each group? For our landing page data, the ratio of between-group variance to within-group variance produces an $F$-statistic of 10.18, with an omnibus p-value of $0.0001$. This establishes that the layouts do not perform identically. Next, Tukey's HSD examines the pairs with family-wise error protection: it reveals that Layout C significantly outperforms Layout A ($p < 0.0001$) and Layout B ($p = 0.0399$), while Layouts A and B do not significantly differ from each other ($p = 0.1114$).`,
    ],
    analogy: r`ANOVA is like a stadium metal detector that first checks whether anyone in a crowd is carrying metal; only when the master alarm rings do guards search individuals one by one.`,
    steps: [
      r`Define the omnibus hypotheses: $H_0: \mu_1 = \mu_2 = \dots = \mu_K$ versus $H_1$: at least one group mean differs.`,
      r`Verify ANOVA assumptions: independent observations, approximately normal distributions within each group, and homogeneity of variances (homoscedasticity).`,
      r`Calculate the sum of squares between groups ($SS_B$) and sum of squares within groups ($SS_W$).`,
      r`Divide each sum of squares by its respective degrees of freedom to obtain Mean Square Between ($MS_B$) and Mean Square Within ($MS_W$).`,
      r`Compute the variance ratio $F = MS_B / MS_W$ and obtain the omnibus p-value from the $F(K-1, N-K)$ distribution.`,
      r`If the omnibus test rejects $H_0$, run Tukey's HSD to identify which pairwise differences are statistically significant while preserving family-wise error control.`,
    ],
    math: [
      {
        h: 'Total Variance Partitioning',
        tex: r`$$SS_T = SS_B + SS_W \implies \sum_{i=1}^K \sum_{j=1}^{n_i} (X_{ij} - \bar{X}_{\cdot\cdot})^2 = \sum_{i=1}^K n_i (\bar{X}_{i\cdot} - \bar{X}_{\cdot\cdot})^2 + \sum_{i=1}^K \sum_{j=1}^{n_i} (X_{ij} - \bar{X}_{i\cdot})^2$$`,
        p: r`Here $X_{ij}$ is observation $j$ in group $i$, $\bar{X}_{i\cdot}$ is the sample mean of group $i$, $\bar{X}_{\cdot\cdot}$ is the grand mean across all observations, and $n_i$ is group size. The total sum of squares $SS_T$ splits cleanly into between-group explained variation $SS_B$ and within-group residual variation $SS_W$.`,
      },
      {
        h: 'The ANOVA F-Statistic',
        tex: r`$$F = \frac{MS_B}{MS_W} = \frac{SS_B / (K - 1)}{SS_W / (N - K)} \sim F(K - 1, \, N - K)$$`,
        p: r`Mean squares divide sums of squares by their degrees of freedom: $K - 1$ for groups and $N - K$ for residuals. Under the null hypothesis of equal means, both $MS_B$ and $MS_W$ provide independent, unbiased estimates of the common population variance $\sigma^2$, yielding $F \approx 1$. When true differences exist between group means, $MS_B$ inflates, pushing $F \gg 1$.`,
      },
      {
        h: 'Tukey\'s Honest Significant Difference (HSD)',
        tex: r`$$q = \frac{\bar{X}_i - \bar{X}_j}{\sqrt{MS_W / n}} \sim q(K, \, N - K) \implies \text{HSD} = q_{\alpha, K, N-K} \sqrt{\frac{MS_W}{n}}$$`,
        p: r`Tukey's post-hoc procedure evaluates studentised range statistics $q$ across all group pairs. Comparing mean differences against the critical HSD threshold guarantees that the family-wise error rate across all $K(K-1)/2$ pairwise comparisons is strictly capped at $\alpha$.`,
      },
    ],
    keyPoints: [
      r`ANOVA prevents multiple-testing error inflation by evaluating group differences in a single omnibus test.`,
      r`Rejecting the null hypothesis in ANOVA indicates that at least one group mean differs, but does not identify which specific groups drive the difference.`,
      r`Tukey's HSD controls the family-wise error rate across all pairwise contrasts while providing greater statistical power than Bonferroni correction.`,
      r`When group variances are substantially unequal, standard ANOVA breaks down; Welch's ANOVA should be used instead.`,
    ],
    pitfalls: [
      r`Conducting multiple independent two-sample $t$-tests instead of ANOVA, drastically inflating false discovery rates.`,
      r`Running post-hoc pairwise comparisons after a non-significant omnibus ANOVA $F$-test (data dredging).`,
      r`Ignoring severe heteroscedasticity: when group sample sizes are unequal and variances differ, standard ANOVA false positive rates become untrustworthy.`,
      r`Using standard one-way ANOVA on repeated-measures data, failing to remove between-subject variance.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n = 30

# User engagement duration (seconds) across three landing page layouts
layout_a = rng.normal(loc=45.0, scale=10.0, size=n)
layout_b = rng.normal(loc=48.0, scale=10.0, size=n)
layout_c = rng.normal(loc=55.0, scale=10.0, size=n)

# 1. One-way ANOVA omnibus test
f_stat, p_anova = stats.f_oneway(layout_a, layout_b, layout_c)

# 2. Tukey's HSD post-hoc test
tukey = stats.tukey_hsd(layout_a, layout_b, layout_c)

print(f"ANOVA F-statistic: {f_stat:.3f}, p-value: {p_anova:.4e}")
print(f"Layout A mean: {np.mean(layout_a):.1f}s, B: {np.mean(layout_b):.1f}s, C: {np.mean(layout_c):.1f}s")
print(f"Tukey p-values -> A vs B: {tukey.pvalue[0, 1]:.4f}")
print(f"                 A vs C: {tukey.pvalue[0, 2]:.4e}")
print(f"                 B vs C: {tukey.pvalue[1, 2]:.4f}")`,
    quiz: [
      {
        q: r`Why is conducting multiple independent two-sample $t$-tests problematic when comparing five experimental groups?`,
        o: [
          r`Because Student's t-distribution cannot handle more than 20 observations`,
          r`Because running 10 pairwise tests compounds the probability of making at least one Type I error to over 40%`,
          r`Because two-sample t-tests cannot compute standard errors`,
          r`Because degrees of freedom become negative`,
        ],
        a: 1,
        why: r`With 5 groups there are $\binom{5}{2} = 10$ pairs. Testing each at $\alpha = 0.05$ produces an overall family-wise error rate of $1 - (1 - 0.05)^{10} \approx 40.1\%$.`,
      },
      {
        q: r`Under the null hypothesis that all group means are identical ($\mu_1 = \mu_2 = \dots = \mu_K$), what value is the ANOVA $F$-statistic expected to take on average?`,
        o: [
          r`Approximately 0`,
          r`Approximately 1`,
          r`Equal to the sample size $N$`,
          r`Equal to the number of groups $K$`,
        ],
        a: 1,
        why: r`Under $H_0$, both between-group mean square $MS_B$ and within-group mean square $MS_W$ estimate the same population variance $\sigma^2$, so their ratio $F = MS_B / MS_W \approx 1$.`,
      },
      {
        q: r`What is the primary role of a post-hoc procedure like Tukey's HSD following a significant ANOVA test?`,
        o: [
          r`To determine whether the data is normally distributed`,
          r`To identify exactly which specific pairs of group means differ while controlling the family-wise error rate`,
          r`To recalculate the degrees of freedom for the F-statistic`,
          r`To transform skewed data into Gaussian distributions`,
        ],
        a: 1,
        why: r`The omnibus ANOVA test only indicates that at least one group mean differs. Tukey's HSD isolates the specific differing pairs without inflating the false positive rate.`,
      },
      {
        q: r`An experiment compares 4 treatments with 25 participants per treatment (total $N = 100$). What are the numerator and denominator degrees of freedom for the ANOVA $F$-test?`,
        o: [
          r`3 and 96`,
          r`4 and 96`,
          r`3 and 100`,
          r`4 and 25`,
        ],
        a: 0,
        why: r`Numerator degrees of freedom are $K - 1 = 4 - 1 = 3$. Denominator degrees of freedom are $N - K = 100 - 4 = 96$.`,
      },
    ],
    usedBy: ['feature-selection', 'decision_tree_regressor'],
    prereq: ['hypothesis-testing-and-p-values', 'z-test-and-t-tests', 'type-i-ii-errors-power-and-sample-size'],
    related: ['non-parametric-tests-mann-whitney-wilcoxon-kruskal-wallis', 'multiple-testing-bonferroni-holm-benjamini-hochberg', 'confidence-intervals'],
    keywords: 'anova analysis of variance f-test f-statistic tukey hsd post-hoc between-group within-group one-way anova',
  },
  {
    id: 'non-parametric-tests-mann-whitney-wilcoxon-kruskal-wallis',
    short: 'Non-Parametric Rank Tests',
    title: r`Non-Parametric Tests: Mann–Whitney, Wilcoxon, Kruskal–Wallis`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Replace fragile parametric assumptions with robust rank-based inference for skewed, heavy-tailed or ordinal data.`,
    lead: r`When data violates normality through heavy skewness, severe outliers or ordinal scales, classical t-tests and ANOVA produce unreliable p-values and lose statistical power. Non-parametric rank tests discard absolute numerical values in favour of relative order, providing exact, distribution-free hypothesis tests. The Mann–Whitney U test, Wilcoxon signed-rank test, and Kruskal–Wallis H-test form the complete non-parametric counterpart to two-sample, paired, and multi-group parametric inference.`,
    intuition: [
      r`Consider measuring web service response times. Out of 35 requests, 34 complete in 40 to 90 milliseconds, but one request suffers a database lock timeout and hangs for 45,000 milliseconds (45 seconds). In a standard parametric $t$-test, this single massive outlier drastically distorts both the sample mean and the sample standard deviation, inflating the denominator and destroying our ability to detect genuine improvements in typical user experience.`,
      r`Non-parametric tests solve this by replacing raw milliseconds with ranks: the fastest request gets rank 1, the second fastest rank 2, and the 45,000 ms timeout simply receives rank 35. Whether that timeout took 200 ms or 200,000 ms, its rank is exactly 35. By working with ranks, extreme values can never pull the test statistic off course.`,
      r`If we have two independent services, the Mann–Whitney $U$ test pools all observations, ranks them from 1 to $N$, and sums the ranks for each service. If one service systematically responds faster than the other, its rank sum will be much smaller than expected by chance. Similarly, for before-and-after paired data, the Wilcoxon signed-rank test ranks the absolute differences, attaching positive or negative signs. And for three or more independent groups, the Kruskal–Wallis $H$-test generalises rank sums to evaluate whether any group dominates stochastically.`,
    ],
    analogy: r`Non-parametric tests are like ranking marathon runners by their finish place rather than their stopwatch times: a runner who stumbles and finishes an hour late does not disrupt who came first, second, and third.`,
    steps: [
      r`Inspect the measurement scale and distribution: choose rank tests when data is ordinal, heavily skewed, or contaminated with outliers that invalidate normality.`,
      r`Select the appropriate rank design: Mann–Whitney $U$ for two independent groups, Wilcoxon signed-rank for paired samples, or Kruskal–Wallis $H$ for three or more independent groups.`,
      r`Pool observations and assign ascending integer ranks from 1 to $N$, replacing ties with their average rank.`,
      r`Compute the test statistic by summing ranks per group (or summing positive and negative ranks of paired differences).`,
      r`Evaluate the p-value: using exact permutation distributions for small sample sizes, or asymptotic normal or chi-square approximations for $N > 20$.`,
      r`Interpret the test as an assessment of stochastic dominance or median shift under the assumption of similarly shaped distributions.`,
    ],
    math: [
      {
        h: 'Mann–Whitney U Statistic (Two Independent Samples)',
        tex: r`$$U_1 = R_1 - \frac{n_1(n_1 + 1)}{2}, \qquad U_2 = n_1 n_2 - U_1, \qquad U = \min(U_1, U_2)$$`,
        p: r`Here $R_1$ is the sum of ranks for group 1, and $n_1, n_2$ are sample sizes. The statistic $U_1$ directly counts the number of times an observation from group 1 is smaller than an observation from group 2. Under the null hypothesis of equal distributions, $E[U] = n_1 n_2 / 2$ and $\text{Var}(U) = n_1 n_2 (n_1 + n_2 + 1) / 12$.`,
      },
      {
        h: 'Wilcoxon Signed-Rank Statistic (Paired Samples)',
        tex: r`$$D_i = X_{1,i} - X_{2,i}, \qquad W = \min\left(\sum_{D_i > 0} \text{rank}(|D_i|), \, \sum_{D_i < 0} \text{rank}(|D_i|)\right)$$`,
        p: r`For paired observations, non-zero differences $D_i$ are ranked by absolute magnitude $|D_i|$. Ranks for positive differences and negative differences are summed separately. Under the null hypothesis of symmetric, zero-median differences, positive and negative rank sums are balanced with expectation $E[W] = n(n + 1) / 4$.`,
      },
      {
        h: 'Kruskal–Wallis H-Statistic (K Independent Groups)',
        tex: r`$$H = \frac{12}{N(N + 1)} \sum_{k=1}^K \frac{R_k^2}{n_k} - 3(N + 1) \sim \chi^2(K - 1)$$`,
        p: r`Here $N = \sum n_k$ is the total pooled sample size, and $R_k$ is the rank sum of the $k$-th group. The statistic $H$ measures how far average group ranks deviate from the overall expected average rank $(N + 1) / 2$. Under $H_0$, $H$ converges asymptotically to a chi-square distribution with $K - 1$ degrees of freedom.`,
      },
    ],
    keyPoints: [
      r`Non-parametric tests do not assume Gaussian distributions; they operate on ranks, making them invariant to monotonic transformations.`,
      r`The Mann–Whitney U test tests whether one distribution stochastically dominates another ($P(X > Y) \ne 0.5$); it is only a test of medians if distributions share identical shape and spread.`,
      r`The asymptotic relative efficiency of the Mann–Whitney test compared to Student's t-test is 95.5% on perfect Gaussian data, and can be substantially higher on heavy-tailed distributions.`,
      r`When sample sizes are small ($n < 20$), exact permutation p-values should be computed rather than normal approximations.`,
    ],
    pitfalls: [
      r`Claiming a significant Mann–Whitney U test proves a difference in medians when group variances or distributional shapes differ substantially.`,
      r`Discarding zero differences in the Wilcoxon signed-rank test without realising it reduces effective sample size and can induce bias.`,
      r`Using parametric tests on ordinal survey ratings (e.g. Likert 1–5 scales) where spacing between numbers is not metric or uniform.`,
      r`Forgetting that non-parametric tests still require independent and identically distributed observations within groups.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n = 35

# Skewed latency distributions for two services (exponential)
service_a = rng.exponential(scale=150.0, size=n)
service_b = rng.exponential(scale=80.0, size=n)

# 1. Mann-Whitney U test (two independent samples)
u_stat, p_mann = stats.mannwhitneyu(service_b, service_a, alternative='less')

# 2. Wilcoxon signed-rank test (paired benchmark on same 35 workload queries)
latency_before = rng.exponential(scale=120.0, size=n)
latency_after = latency_before * rng.uniform(0.70, 0.95, size=n)
w_stat, p_wilc = stats.wilcoxon(latency_after, latency_before, alternative='less')

# 3. Kruskal-Wallis H-test (three independent groups)
service_c = rng.exponential(scale=200.0, size=n)
h_stat, p_kruskal = stats.kruskal(service_a, service_b, service_c)

print(f"Mann-Whitney U: stat={u_stat:.1f}, p={p_mann:.4f}")
print(f"Wilcoxon signed-rank: stat={w_stat:.1f}, p={p_wilc:.4e}")
print(f"Kruskal-Wallis H: stat={h_stat:.3f}, p={p_kruskal:.4e}")`,
    quiz: [
      {
        q: r`Why are rank-based tests like Mann–Whitney and Wilcoxon robust against severe outliers?`,
        o: [
          r`Because outliers are deleted before calculation begins`,
          r`Because data points are converted into ranks, bounding the influence of any extreme value to its ordinal position`,
          r`Because rank tests automatically apply a log transform`,
          r`Because ranks follow a Student's t-distribution`,
        ],
        a: 1,
        why: r`Converting measurements to ranks ensures that whether an extreme value is 100 or 1,000,000, its impact on the test statistic is limited strictly to its position in the sorted list.`,
      },
      {
        q: r`What does the Mann–Whitney $U$ test formally evaluate without making any distributional shape assumptions?`,
        o: [
          r`Equality of population variances`,
          r`Stochastic dominance: the probability that a random draw from one distribution exceeds a draw from the other ($P(X > Y) = 0.5$)`,
          r`Strict equality of sample means`,
          r`Linear correlation between two variables`,
        ],
        a: 1,
        why: r`Mann–Whitney U evaluates stochastic dominance. It only reflects a pure shift in population medians if one assumes the two distributions possess identical shape and variance.`,
      },
      {
        q: r`How does the statistical efficiency of the Mann–Whitney test compare to Student's $t$-test on purely Gaussian data?`,
        o: [
          r`It has an asymptotic relative efficiency of roughly 95.5% ($3/\pi$), sacrificing minimal power`,
          r`It loses more than 50% of statistical power`,
          r`It cannot be computed on Gaussian data`,
          r`It always has higher power than the t-test on Gaussian data`,
        ],
        a: 0,
        why: r`The Hodges–Lehmann asymptotic relative efficiency (ARE) of Mann–Whitney relative to the t-test on normal data is $3/\pi \approx 0.955$, meaning very little efficiency is lost even when normality holds.`,
      },
      {
        q: r`Which non-parametric test serves as the distribution-free counterpart to one-way ANOVA for three or more independent groups?`,
        o: [
          r`Wilcoxon signed-rank test`,
          r`Kruskal–Wallis H-test`,
          r`McNemar's test`,
          r`Pearson's chi-square test`,
        ],
        a: 1,
        why: r`The Kruskal–Wallis H-test generalises the two-sample Mann–Whitney rank test to three or more independent groups, evaluating whether group rank sums differ significantly.`,
      },
    ],
    usedBy: ['feature-selection', 'decision_tree_classifier'],
    prereq: ['hypothesis-testing-and-p-values', 'z-test-and-t-tests', 'random-variables-and-distributions'],
    related: ['anova-and-post-hoc-tests', 'normality-tests-shapiro-wilk-kolmogorov-smirnov-anderson-darling', 'bootstrap-and-jackknife'],
    keywords: 'non-parametric mann whitney wilcoxon signed rank kruskal wallis ranks median test distribution free',
  },
  {
    id: 'normality-tests-shapiro-wilk-kolmogorov-smirnov-anderson-darling',
    short: 'Normality Tests',
    title: r`Normality Tests: Shapiro–Wilk, Kolmogorov–Smirnov, Anderson–Darling`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 2,
    minutes: 17,
    noLab: true,
    summary: r`Verify whether data satisfies Gaussian assumptions using the correlation-based Shapiro–Wilk test, empirical CDF Kolmogorov–Smirnov test, and tail-sensitive Anderson–Darling test.`,
    lead: r`Many classical statistical procedures—from linear regression inference to Student's t-tests and ANOVA—rely on assumptions of underlying normality. Rather than relying on wishful thinking or visual inspection of histograms alone, formal normality tests quantify whether sample data deviates significantly from a Gaussian distribution. Understanding the distinct mathematical mechanics of Shapiro–Wilk, Kolmogorov–Smirnov, and Anderson–Darling tests enables practitioners to diagnose skewness, kurtosis, and tail anomalies accurately.`,
    intuition: [
      r`Imagine training a regression model and checking whether its residuals conform to the standard assumption of normally distributed errors. You generate 60 residual values. Visually, a histogram or Q-Q plot might look "roughly bell-shaped", but human eyes are notoriously prone to subjective bias.`,
      r`How can we mathematically evaluate Gaussian adherence? There are three distinct perspectives:`,
      r`First, correlation with normal order statistics: if data is truly normal, plotting sorted sample values against expected standard normal quantiles should form an almost perfect straight line. The Shapiro–Wilk test computes this exact correlation squared ($W$). For a genuine normal sample of size 60, $W \approx 0.982$ with $p = 0.502$ (no deviation detected). For exponential or skewed data, points curl away from the line, dropping $W$ to $0.833$ with $p \approx 10^{-6}$ (overwhelming rejection). Second, maximum gap between cumulative curves: the Kolmogorov–Smirnov (KS) test compares the empirical step-function distribution against the theoretical smooth normal cumulative curve, measuring the single largest vertical gap ($D$). Third, weighted tail sensitivity: the KS test is insensitive in the extreme tails because cumulative curves are anchored to 0 and 1 at the boundaries. The Anderson–Darling test solves this by weighting discrepancies by $1 / [F(x)(1 - F(x))]$, placing heavy mathematical emphasis on the tails where critical anomalies occur.`,
    ],
    analogy: r`Testing normality with these three methods is like inspecting a tailor-made suit: Shapiro–Wilk checks if the overall silhouette matches the pattern, Kolmogorov–Smirnov checks the single widest seam gap, and Anderson–Darling inspects the hems and cuffs where wear and tear happen first.`,
    steps: [
      r`Inspect the sample visually with a Q-Q (quantile-quantile) plot to develop an initial diagnostic intuition of skewness and tail weight.`,
      r`State the formal null hypothesis $H_0$: the sample was drawn from a normally distributed population, versus $H_1$: the parent population is non-normal.`,
      r`For general univariate data ($n \le 5,000$), run the Shapiro–Wilk test as the most statistically powerful omnibus test of normality.`,
      r`If tail discrepancies or extreme events are the primary operational risk (such as latency SLAs), evaluate the Anderson–Darling test.`,
      r`If parameters $(\mu, \sigma)$ are estimated from the sample data rather than known beforehand, do not use standard Kolmogorov–Smirnov tables; use the Lilliefors correction.`,
      r`Synthesise test results with sample size: in very large samples, slight harmless departures trigger $p < 0.05$; in small samples, low power can mask severe non-normality.`,
    ],
    math: [
      {
        h: 'Shapiro–Wilk Test Statistic',
        tex: r`$$W = \frac{\left(\sum_{i=1}^n a_i X_{(i)}\right)^2}{\sum_{i=1}^n (X_i - \bar{X})^2}$$`,
        p: r`Here $X_{(1)} \le X_{(2)} \le \dots \le X_{(n)}$ are ordered sample statistics, and $\mathbf{a} = \frac{\mathbf{m}^T \mathbf{V}^{-1}}{\sqrt{\mathbf{m}^T \mathbf{V}^{-1}\mathbf{V}^{-1}\mathbf{m}}}$ incorporates the expected values $\mathbf{m}$ and covariance matrix $\mathbf{V}$ of standard normal order statistics. The statistic $W$ lies in $(0, 1]$, where $W = 1$ indicates perfect linearity between sample quantiles and normal quantiles.`,
      },
      {
        h: 'Kolmogorov–Smirnov Test Statistic',
        tex: r`$$D = \sup_{x} |F_n(x) - F_0(x)|$$`,
        p: r`Here $F_n(x) = \frac{1}{n}\sum_{i=1}^n \mathbf{1}_{X_i \le x}$ is the empirical cumulative distribution function, and $F_0(x)$ is the reference continuous cumulative distribution function. $D$ represents the supremum absolute vertical distance between the empirical step function and theoretical curve.`,
      },
      {
        h: 'Anderson–Darling Test Statistic',
        tex: r`$$A^2 = -n - \sum_{i=1}^n \frac{2i - 1}{n} \left[\ln F_0(X_{(i)}) + \ln(1 - F_0(X_{(n+1-i)}))\right]$$`,
        p: r`The Anderson–Darling statistic weights squared discrepancies by the inverse variance function $[F_0(x)(1 - F_0(x))]^{-1}$. This weighting amplifies discrepancies in the lower and upper tails, making $A^2$ far more sensitive to heavy tails and skewness than the unweighted Kolmogorov–Smirnov statistic.`,
      },
    ],
    keyPoints: [
      r`The Shapiro–Wilk test exhibits the highest overall statistical power across a broad range of non-normal distributions for sample sizes up to several thousand.`,
      r`Standard Kolmogorov–Smirnov assumes a fully specified reference distribution; plugging in sample mean and sample variance requires the Lilliefors correction to avoid conservative bias.`,
      r`Anderson–Darling prioritises tail deviations, making it the preferred diagnostic when detecting heavy tails or extreme-value risk.`,
      r`In huge datasets ($n > 10,000$), tiny, practically trivial deviations from Gaussian perfection will trigger $p < 0.001$; always combine formal tests with Q-Q plots.`,
    ],
    pitfalls: [
      r`Plugging sample estimates of $\mu$ and $\sigma$ into the standard Kolmogorov–Smirnov test without using Lilliefors critical values, producing falsely inflated p-values.`,
      r`Mistaking a non-significant normality test in a small sample ($n < 25$) as positive confirmation that the population is normal.`,
      r`Discarding linear regression models when a massive sample fails a normality test, overlooking that regression coefficient estimators remain asymptotically normal via the central limit theorem.`,
      r`Testing normality exclusively with numbers while skipping graphical Q-Q plots, missing the structural nature of departures (skewness vs kurtosis vs outliers).`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n = 60

# Normal sample vs skewed exponential sample
normal_data = rng.normal(loc=10.0, scale=2.5, size=n)
skewed_data = rng.exponential(scale=2.5, size=n)

# 1. Shapiro-Wilk test (highest omnibus power)
w_norm, p_sw_norm = stats.shapiro(normal_data)
w_skew, p_sw_skew = stats.shapiro(skewed_data)

# 2. Kolmogorov-Smirnov test against fitted normal distribution
ks_skew, p_ks_skew = stats.kstest(skewed_data, 'norm',
    args=(np.mean(skewed_data), np.std(skewed_data, ddof=1)))

# 3. Anderson-Darling test (tail-weighted)
ad_skew = stats.anderson(skewed_data, dist='norm', method='interpolate')

print(f"Normal data: Shapiro W={w_norm:.4f}, p={p_sw_norm:.4f}")
print(f"Skewed data: Shapiro W={w_skew:.4f}, p={p_sw_skew:.4e}")
print(f"Skewed data: KS stat={ks_skew:.4f}, p={p_ks_skew:.4f}")
print(f"Skewed data: Anderson A2={ad_skew.statistic:.3f}, p={ad_skew.pvalue:.4f}")`,
    quiz: [
      {
        q: r`Which normality test is empirically proven to deliver the highest statistical power against the widest variety of non-normal alternative distributions for moderate sample sizes?`,
        o: [
          r`Standard Kolmogorov–Smirnov test`,
          r`Shapiro–Wilk test`,
          r`Pearson's chi-square goodness-of-fit test`,
          r`Student's t-test`,
        ],
        a: 1,
        why: r`Extensive Monte Carlo studies confirm that the Shapiro–Wilk test, which evaluates the squared correlation between sample order statistics and normal quantiles, offers superior statistical power across diverse alternatives.`,
      },
      {
        q: r`What occurs if you test normality with the standard Kolmogorov–Smirnov test after estimating $\mu$ and $\sigma$ from the sample?`,
        o: [
          r`The test becomes overly conservative, underestimating discrepancies and yielding p-values that are too large`,
          r`The test statistic becomes undefined`,
          r`The test automatically converts into an Anderson–Darling test`,
          r`The p-value is always zero`,
        ],
        a: 0,
        why: r`Estimating parameters from the sample forces the theoretical CDF closer to the empirical CDF than an independent reference curve would be, shrinking $D$ and inflating p-values unless the Lilliefors correction is applied.`,
      },
      {
        q: r`What is the primary advantage of the Anderson–Darling test over the Kolmogorov–Smirnov test?`,
        o: [
          r`It requires no sample data`,
          r`It places inverse variance weights on discrepancies, providing much greater sensitivity to departures in the distribution tails`,
          r`It only applies to uniform distributions`,
          r`It eliminates all Type I errors`,
        ],
        a: 1,
        why: r`Anderson–Darling divides deviations by $F_0(x)(1 - F_0(x))$, which prevents tail discrepancies from being compressed to zero near the boundaries and magnifies sensitivity to heavy tails.`,
      },
      {
        q: r`Why is a formal normality test often unhelpful when analysing huge datasets ($n = 100,000$)?`,
        o: [
          r`Computational algorithms fail on arrays larger than 1,000 items`,
          r`The test becomes so powerful that trivial, practically inconsequential imperfections trigger $p < 0.0001$`,
          r`Large samples can never follow normal distributions`,
          r`The central limit theorem ceases to operate`,
        ],
        a: 1,
        why: r`With huge sample sizes, test power approaches 100% for microscopic departures that have zero practical impact on downstream estimation or model validity.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'linear_discriminant_analysis'],
    prereq: ['hypothesis-testing-and-p-values', 'random-variables-and-distributions', 'sampling-and-standard-error'],
    related: ['non-parametric-tests-mann-whitney-wilcoxon-kruskal-wallis', 'z-test-and-t-tests', 'exploratory-data-analysis'],
    keywords: 'normality tests shapiro wilk kolmogorov smirnov anderson darling goodness of fit gaussian q-q plot lilliefors',
  },
  {
    id: 'multiple-testing-bonferroni-holm-benjamini-hochberg',
    short: 'Multiple Testing Corrections',
    title: r`Multiple Testing: Bonferroni, Holm, Benjamini–Hochberg`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Control family-wise error rates and false discovery rates across multiple hypothesis tests using Bonferroni, Holm step-down, and Benjamini–Hochberg procedures.`,
    lead: r`When testing hundreds of features, genome variants, or concurrent A/B test variations, standard significance thresholds collapse under the weight of multiplicity. Testing 100 null hypotheses at $\alpha = 0.05$ produces an average of five false discoveries by pure chance. Multiple testing corrections adjust p-values to control either the strict probability of even a single false alarm (Family-Wise Error Rate) or the expected proportion of false alarms among all declared discoveries (False Discovery Rate).`,
    intuition: [
      r`Suppose a machine learning team evaluates 10 new candidate features for a credit scoring model, running an individual hypothesis test for each feature at the conventional $\alpha = 0.05$ threshold. The resulting raw p-values from smallest to largest are: $[0.001, 0.006, 0.012, 0.024, 0.038, 0.082, 0.150, 0.290, 0.440, 0.810]$. Without any adjustment, five features pass the threshold ($p \le 0.05$). But if all 10 candidate features were actually useless noise, the probability of finding at least one false positive is $1 - (1 - 0.05)^{10} \approx 40.1\%$.`,
      r`To protect against false discoveries, we can choose between two paradigms:`,
      r`First, Family-Wise Error Rate (FWER): if a single false claim is unacceptable (such as approving an ineffective drug), we require that the probability of any false positive across all 10 tests remains $\le 5\%$. The Bonferroni correction multiplies each p-value by $m = 10$. Now only the first feature survives ($0.001 \times 10 = 0.010 \le 0.05$), while the second becomes $0.006 \times 10 = 0.060 > 0.05$. The Holm step-down method improves on Bonferroni by stepping down the multiplier $(10, 9, 8, \dots)$, but still declares only 1 discovery. Second, False Discovery Rate (FDR): in exploratory data science and feature selection, demanding zero false positives is overly conservative and discards valuable signal. Benjamini and Hochberg (1995) proposed controlling the expected proportion of false positives among all declared discoveries. Applying the Benjamini–Hochberg procedure declares three discoveries ($p \le [0.010, 0.030, 0.040]$), recovering three legitimate features while strictly capping false discoveries.`,
    ],
    analogy: r`FWER methods are like a zero-tolerance airport security checkpoint where a single false alarm grounds all flights; FDR methods are like an automated spam filter that accepts a small, manageable percentage of spam in the inbox in exchange for never missing important emails.`,
    steps: [
      r`Assemble all $m$ raw p-values from the family of tests and sort them in ascending order: $p_{(1)} \le p_{(2)} \le \dots \le p_{(m)}$.`,
      r`Choose the appropriate error control criterion: FWER for confirmatory decisions, or FDR for exploratory screening and feature selection.`,
      r`For conservative FWER control, apply Bonferroni: reject hypotheses where $p_{(i)} \le \alpha / m$.`,
      r`For uniformly superior FWER control without additional assumptions, apply Holm's step-down method: compare $p_{(i)}$ against $\alpha / (m - i + 1)$ sequentially, stopping at the first non-rejection.`,
      r`For balanced FDR control, apply Benjamini–Hochberg: find the largest rank $k$ where $p_{(k)} \le \frac{k}{m} Q$, and reject all hypotheses from rank 1 through $k$.`,
      r`Report adjusted p-values alongside original unadjusted statistics to maintain full scientific transparency.`,
    ],
    math: [
      {
        h: 'Family-Wise Error Rate and Bonferroni Inequality',
        tex: r`$$\text{FWER} = P(V \ge 1) \le \sum_{i=1}^{m_0} P(\text{Reject } H_{0,i} \mid H_{0,i} \text{ true}) \le m_0 \frac{\alpha}{m} \le \alpha$$`,
        p: r`Here $V$ is the number of false rejections (Type I errors), $m$ is total hypotheses tested, and $m_0 \le m$ is the number of true nulls. By Boole's union bound, testing each hypothesis at significance level $\alpha / m$ ensures the family-wise error rate remains $\le \alpha$ under any dependency structure.`,
      },
      {
        h: 'Holm\'s Sequentially Rejective Step-Down Method',
        tex: r`$$\text{Step } i: \quad p_{(i)} \le \frac{\alpha}{m - i + 1}$$`,
        p: r`Holm's method sorts p-values in ascending order and tests sequentially: $p_{(1)}$ against $\alpha / m$, $p_{(2)}$ against $\alpha / (m - 1)$, and so on. As soon as a p-value fails its criterion, testing terminates and all remaining hypotheses are retained. Holm controls FWER at level $\alpha$ under arbitrary dependence while being strictly more powerful than Bonferroni.`,
      },
      {
        h: 'Benjamini–Hochberg False Discovery Rate (FDR)',
        tex: r`$$\text{FDR} = E\left[\frac{V}{\max(R, 1)}\right] \le Q \implies k = \max\left\{i : p_{(i)} \le \frac{i}{m} Q\right\}, \quad \text{Reject } H_{(1)}, \dots, H_{(k)}$$`,
        p: r`Here $V$ is false rejections, $R$ is total rejections, and $Q$ is target FDR level. Sorting p-values and finding the largest index $k$ whose p-value falls below the rank line $\frac{i}{m} Q$ guarantees that the expected proportion of false discoveries does not exceed $Q$ under independent or positively dependent test statistics.`,
      },
    ],
    keyPoints: [
      r`The family-wise error rate (FWER) controls the probability of making at least one false discovery; the false discovery rate (FDR) controls the expected proportion of false discoveries among rejected hypotheses.`,
      r`Bonferroni is universally valid under any dependence structure, but becomes severely underpowered when testing hundreds or thousands of hypotheses.`,
      r`Holm's step-down procedure is always at least as powerful as Bonferroni and carries zero extra assumptions; there is virtually no statistical reason to use classic Bonferroni over Holm.`,
      r`The Benjamini–Hochberg procedure dramatically increases statistical power in high-dimensional settings by tolerating a controlled rate of false positives.`,
    ],
    pitfalls: [
      r`Using Bonferroni correction in large-scale feature selection ($m > 1,000$), which obliterates statistical power and results in severe Type II errors.`,
      r`Failing to apply any multiplicity correction when examining dozens of subgroup breakdowns or metrics in A/B tests.`,
      r`Interpreting FDR adjusted p-values as posterior probabilities that a specific hypothesis is null; FDR is a property of the collective discovery set.`,
      r`Applying multiple testing corrections after cherry-picking which tests to report; corrections require knowing the total number of tests executed.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

# Raw p-values from 10 parallel A/B tests or candidate features
p_vals = np.array([0.001, 0.006, 0.012, 0.024, 0.038, 0.082, 0.150, 0.290, 0.440, 0.810])
m = len(p_vals)
alpha = 0.05

# 1. Bonferroni: multiply by total tests m
p_bonf = np.minimum(p_vals * m, 1.0)

# 2. Holm step-down: multiply by (m - rank) and enforce monotonicity
p_holm = np.maximum.accumulate(np.minimum(p_vals * (m - np.arange(m)), 1.0))

# 3. Benjamini-Hochberg (FDR control)
p_bh = stats.false_discovery_control(p_vals, method='bh')

print(f"Raw p-values:        {p_vals}")
print(f"Bonferroni adjusted: {np.round(p_bonf, 3)}")
print(f"Holm adjusted:       {np.round(p_holm, 3)}")
print(f"BH adjusted (FDR):   {np.round(p_bh, 3)}")
print(f"Discoveries at alpha={alpha} -> Unadjusted: {np.sum(p_vals <= alpha)}, "
      f"Bonferroni: {np.sum(p_bonf <= alpha)}, Holm: {np.sum(p_holm <= alpha)}, "
      f"Benjamini-Hochberg: {np.sum(p_bh <= alpha)}")`,
    quiz: [
      {
        q: r`What is the crucial difference between Family-Wise Error Rate (FWER) and False Discovery Rate (FDR)?`,
        o: [
          r`FWER controls the probability of making at least one false positive, while FDR controls the expected fraction of false positives among declared discoveries`,
          r`FWER is only for medical trials, while FDR is only for computer science`,
          r`FWER always yields more discoveries than FDR`,
          r`FDR assumes all null hypotheses are true`,
        ],
        a: 0,
        why: r`FWER bounds $P(V \ge 1) \le \alpha$, demanding near-certainty of zero false discoveries. FDR bounds $E[V / \max(R, 1)] \le Q$, tolerating a small fraction of false discoveries to boost power.`,
      },
      {
        q: r`Why should practitioners generally prefer Holm's step-down procedure over the classical Bonferroni correction?`,
        o: [
          r`Holm's method requires assuming normal distributions`,
          r`Holm's method controls FWER at the exact same level $\alpha$ under arbitrary dependence while being strictly more powerful`,
          r`Holm's method computes p-values faster`,
          r`Holm's method can be run without sorting p-values`,
        ],
        a: 1,
        why: r`Holm's step-down method guarantees the same FWER protection as Bonferroni without any additional assumptions, but uses smaller multipliers for subsequent ranks, making it uniformly more powerful.`,
      },
      {
        q: r`In the Benjamini–Hochberg procedure with $m$ tests and target FDR $Q$, what is the rejection criterion for the sorted p-values $p_{(1)} \le \dots \le p_{(m)}$?`,
        o: [
          r`Reject all $p_{(i)} \le Q / m$`,
          r`Find the largest rank $k$ such that $p_{(k)} \le \frac{k}{m} Q$, and reject all hypotheses from rank 1 to $k$`,
          r`Reject only hypotheses with $p_{(i)} \le Q$`,
          r`Reject the single smallest p-value`,
        ],
        a: 1,
        why: r`The Benjamini–Hochberg step-up procedure identifies the largest index $k$ satisfying $p_{(k)} \le \frac{k}{m} Q$ and declares all hypotheses $1, \dots, k$ significant.`,
      },
      {
        q: r`If you evaluate 20 orthogonal features with independent tests at $\alpha = 0.05$ without multiplicity correction, what is the probability of at least one false positive if all features are pure noise?`,
        o: [
          r`5.0%`,
          r`20.0%`,
          r`Approximately 64.2%`,
          r`100%`,
        ],
        a: 2,
        why: r`The probability of at least one false alarm across 20 independent true null tests is $1 - (1 - 0.05)^{20} = 1 - 0.95^{20} \approx 1 - 0.3585 = 0.6415$ (or 64.2%).`,
      },
    ],
    usedBy: ['feature-selection', 'decision_tree_classifier'],
    prereq: ['hypothesis-testing-and-p-values', 'type-i-ii-errors-power-and-sample-size', 'probability-rules-and-bayes-theorem'],
    related: ['anova-and-post-hoc-tests', 'normality-tests-shapiro-wilk-kolmogorov-smirnov-anderson-darling', 'cross-validation'],
    keywords: 'multiple testing bonferroni holm benjamini hochberg fdr fwer false discovery rate family wise error p-value adjustment',
  },
  {
    id: 'effect-sizes-cohens-d-cramers-v',
    short: 'Effect Sizes: Cohen\'s d & V',
    title: r`Effect Sizes: Cohen's d, Cramér's V`,
    task: 'concepts',
    module: 'Hypothesis testing',
    level: 1,
    minutes: 15,
    noLab: true,
    summary: r`Quantify the practical magnitude of experimental findings beyond mere p-values using standardised metrics for continuous and categorical differences.`,
    lead: r`A tiny p-value tells you an effect is unlikely to be pure noise, but says nothing about whether it actually matters. Effect size metrics decouple statistical significance from sample size, quantifying the real-world strength of relationships on standardised scales. Cohen's d, Hedges' g, and Cramér's V provide universal, scale-free benchmarks for comparing continuous mean shifts and categorical associations across experiments.`,
    intuition: [
      r`Suppose an online education platform evaluates a new tutorial on test scores. In a massive sample of 100,000 students, the new tutorial improves the average score from 75.00 to 75.15 points (a 0.15 point lift out of 100), with a pooled standard deviation $s = 15.0$ points. Because the sample size is enormous ($N = 100,000$), the standard error is $\approx 0.067$, producing $z = 2.24$ and $p = 0.025$. A naive team might announce a "statistically significant breakthrough".`,
      r`However, dividing the 0.15 point difference by the standard deviation of 15.0 yields a Cohen's $d$ of just $0.01$—a minuscule shift of one-hundredth of a standard deviation. Over 99% of student scores overlap completely between the two cohorts. The effect is practically indistinguishable from zero. Conversely, a tiny pilot study of 20 users might show a massive 12-point jump ($d = 0.80$), but have $p = 0.08$ due to low sample size.`,
      r`Effect sizes protect teams from both traps. For continuous two-group comparisons, Cohen's $d$ expresses the difference in terms of pooled standard deviations ($0.2$ is small, $0.5$ is medium, $0.8$ is large). Hedges' $g$ applies an exact small-sample correction. For categorical contingency tables, Cramér's $V$ bounds association between 0 (complete independence) and 1 (perfect correlation), converting unscaled chi-square statistics into interpretable association strengths.`,
    ],
    analogy: r`A p-value is like a telescope telling you whether a celestial body exists; the effect size is the measurement that tells you whether it is a pebble or a planet.`,
    steps: [
      r`Determine the data type: continuous measurements between two groups (Cohen's $d$ or Hedges' $g$) or categorical counts in a contingency table (Cramér's $V$).`,
      r`For continuous variables, compute the mean difference $\bar{X}_1 - \bar{X}_2$ and the pooled standard deviation $s_{\text{pooled}}$.`,
      r`Divide the mean difference by $s_{\text{pooled}}$ to obtain Cohen's $d$; if $n < 20$, multiply by the Hedges correction factor $J \approx 1 - \frac{3}{4(n_1 + n_2) - 9}$.`,
      r`For categorical contingency tables, compute the Pearson chi-square statistic $\chi^2$ and total sample size $N$.`,
      r`Compute Cramér's $V = \sqrt{\frac{\chi^2}{N \min(R - 1, C - 1)}}$.`,
      r`Interpret the magnitude against established domain standards rather than treating p-values as proxies for impact.`,
    ],
    math: [
      {
        h: 'Cohen\'s d and Pooled Standard Deviation',
        tex: r`$$d = \frac{\bar{X}_1 - \bar{X}_2}{s_{\text{pooled}}}, \qquad s_{\text{pooled}} = \sqrt{\frac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2}{n_1 + n_2 - 2}}$$`,
        p: r`Here $\bar{X}_1, \bar{X}_2$ are group sample means, $s_1^2, s_2^2$ are sample variances, and $n_1, n_2$ are sample sizes. The pooled standard deviation $s_{\text{pooled}}$ weights variances by their degrees of freedom, standardising the mean difference into units of population standard deviations.`,
      },
      {
        h: 'Hedges\' g Small-Sample Correction',
        tex: r`$$g = d \cdot \left(1 - \frac{3}{4(n_1 + n_2) - 9}\right)$$`,
        p: r`Cohen's $d$ exhibits a slight positive bias when estimated from small sample sizes ($n_1 + n_2 < 30$). Larry Hedges introduced this exact scaling factor to produce an unbiased estimator $g$, which converges to $d$ as sample sizes increase.`,
      },
      {
        h: 'Cramér\'s V for Categorical Association',
        tex: r`$$V = \sqrt{\frac{\chi^2}{N \cdot \min(R - 1, C - 1)}}$$`,
        p: r`Here $\chi^2$ is Pearson's chi-square test statistic, $N$ is total observations, and $R$ and $C$ are the row and column dimensions of the contingency table. Dividing by $N \cdot \min(R - 1, C - 1)$ normalises the metric into the interval $[0, 1]$, where 0 indicates statistical independence and 1 indicates perfect complete association.`,
      },
    ],
    keyPoints: [
      r`Effect sizes measure the substantive magnitude of a difference or relationship completely independent of sample size.`,
      r`A finding can achieve statistical significance ($p < 0.05$) while remaining practically negligible ($d < 0.05$), or carry huge real-world impact ($d > 0.80$) while lacking significance in a small study.`,
      r`Jacob Cohen's classic thresholds ($0.2$ small, $0.5$ medium, $0.8$ large) provide general heuristics, but must always be interpreted in domain-specific context.`,
      r`Reporting effect sizes with confidence intervals gives readers both the magnitude of an effect and the precision of its estimation.`,
    ],
    pitfalls: [
      r`Equating a small p-value with a large effect size: with huge datasets, trivial noise differences yield $p < 0.0001$.`,
      r`Using unpooled standard deviations when computing Cohen's $d$ on groups with unequal variances; use Glass's delta or Welch-standardised metrics instead.`,
      r`Ignoring Hedges' small-sample correction ($g$) when reporting results from pilot studies with fewer than 20 observations per group.`,
      r`Comparing raw Cramér's V values across tables of different dimensions without accounting for the degrees of freedom scaling factor.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)

# Continuous comparison: tutorial vs control test scores
scores_tut = rng.normal(loc=78.5, scale=12.0, size=25)
scores_ctrl = rng.normal(loc=71.2, scale=11.5, size=25)
n1, n2 = len(scores_tut), len(scores_ctrl)
s1, s2 = np.std(scores_tut, ddof=1), np.std(scores_ctrl, ddof=1)
s_pooled = np.sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))

cohens_d = (np.mean(scores_tut) - np.mean(scores_ctrl)) / s_pooled
hedges_g = cohens_d * (1.0 - 3.0 / (4.0 * (n1 + n2) - 9.0))

# Categorical association: 2x3 contingency table
table = np.array([[120, 80, 50], [180, 50, 20]])
chi2_val, _, _, _ = stats.chi2_contingency(table)
cramers_v = np.sqrt(chi2_val / (np.sum(table) * (min(table.shape) - 1)))

print(f"Mean difference: {np.mean(scores_tut) - np.mean(scores_ctrl):.2f}")
print(f"Cohen's d:       {cohens_d:.3f} (medium effect)")
print(f"Hedges' g:       {hedges_g:.3f} (bias-corrected)")
print(f"Cramér's V:      {cramers_v:.3f} (moderate association)")`,
    quiz: [
      {
        q: r`Why is it dangerous to rely exclusively on p-values without reporting effect sizes?`,
        o: [
          r`Because p-values cannot be computed on continuous data`,
          r`Because massive sample sizes can make minuscule, practically meaningless differences achieve $p < 0.001$`,
          r`Because p-values only apply to non-parametric distributions`,
          r`Because effect sizes eliminate experimental variance`,
        ],
        a: 1,
        why: r`The p-value conflates effect size and sample size: with large enough $N$, even an imperceptible difference of 0.01 standard deviations will produce a tiny p-value.`,
      },
      {
        q: r`Under Jacob Cohen's conventional benchmarks for continuous mean comparisons ($d$), what value represents a "medium" effect size?`,
        o: [
          r`0.1`,
          r`0.5`,
          r`0.8`,
          r`1.5`,
        ],
        a: 1,
        why: r`Cohen's widely adopted guidelines define $d = 0.2$ as small, $d = 0.5$ as medium, and $d = 0.8$ as large.`,
      },
      {
        q: r`When should an analyst report Hedges' $g$ instead of Cohen's $d$?`,
        o: [
          r`When sample sizes are small ($N < 30$), to correct for positive small-sample bias in estimated pooled variance`,
          r`When data is categorical`,
          r`When comparing more than two groups simultaneously`,
          r`When population standard deviations are known exactly`,
        ],
        a: 0,
        why: r`Cohen's $d$ slightly overestimates the true effect size in small samples. Hedges' $g$ applies an exact correction factor that removes this small-sample bias.`,
      },
      {
        q: r`What range of values can Cramér's $V$ take in an $R \times C$ contingency table?`,
        o: [
          r`$[-1, 1]$`,
          r`$[0, 1]$`,
          r`$[0, \infty)$`,
          r`$[-0.5, 0.5]$`,
        ],
        a: 1,
        why: r`Cramér's $V$ is normalised by dividing by $N \cdot \min(R - 1, C - 1)$, constraining the metric strictly to $[0, 1]$, where 0 reflects independence and 1 reflects complete association.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'logistic_regression'],
    prereq: ['hypothesis-testing-and-p-values', 'type-i-ii-errors-power-and-sample-size', 'z-test-and-t-tests'],
    related: ['chi-square-tests', 'anova-and-post-hoc-tests', 'confidence-intervals'],
    keywords: 'effect size cohens d cramers v hedges g standardized difference magnitude practical significance',
  },
  {
    id: 'entropy-and-cross-entropy',
    short: 'Entropy and Cross-Entropy',
    title: r`Entropy and Cross-Entropy`,
    task: 'concepts',
    module: 'Information theory',
    level: 1,
    minutes: 16,
    noLab: true,
    summary: r`Quantify information content, uncertainty and coding cost with Shannon entropy, and optimise probabilistic classifiers using cross-entropy loss.`,
    lead: r`Information theory formalises uncertainty by measuring how many bits are required to encode events drawn from a probability distribution. Shannon entropy quantifies the intrinsic unpredictability of a system, while cross-entropy measures the expected coding length when events from a true distribution are encoded using an estimated model. Cross-entropy serves as the standard loss function for training modern classification models and neural networks.`,
    intuition: [
      r`Imagine receiving daily weather forecasts for the Sahara Desert in July, where it is sunny 99% of days and rains 1%. A message stating "Tomorrow will be sunny" carries almost zero surprise—you could have guessed it with 99% accuracy before opening the email. But a message stating "Tomorrow will rain" carries enormous surprise and high information value.`,
      r`Claude Shannon formalised this in 1948: an event with probability $p$ yields surprise (information content) proportional to $\log_2(1/p) = -\log_2(p)$ bits. A fair coin flip has $p = 0.5$, providing exactly $-\log_2(0.5) = 1$ bit of surprise. The expected surprise over all possible outcomes is the distribution's entropy $H(P)$. For a fair coin, entropy is $1.0$ bit (maximum uncertainty for two states). For a heavily biased coin with 90% heads and 10% tails, entropy drops to $-0.90\log_2(0.90) - 0.10\log_2(0.10) \approx 0.469$ bits. If a coin lands heads 100% of the time, entropy is $0$ bits—complete certainty.`,
      r`Now suppose the true coin has $P(\text{Heads}) = 0.90$, but a machine learning model predicts $Q(\text{Heads}) = 0.60$. If we design a communication code optimised for the model's beliefs $Q$, the average number of bits required to transmit outcomes from reality $P$ is the cross-entropy $H(P, Q) = -0.90\log_2(0.60) - 0.10\log_2(0.40) \approx 0.796$ bits. Notice that $0.796 > 0.469$: using the wrong probability model wastes $0.327$ bits per message. Minimising cross-entropy forces the model $Q$ to match ground reality $P$.`,
    ],
    analogy: r`Entropy is the minimum storage space required to pack an uncompressed file; cross-entropy is the actual storage consumed when you compress the file using a compression dictionary tailored for a different language.`,
    steps: [
      r`Define a discrete probability distribution $P$ over $K$ outcomes, ensuring non-negativity and $\sum p_k = 1$.`,
      r`Compute Shannon information content for each event: $I(x) = -\log_2(p(x))$ bits (or nats using natural logarithm).`,
      r`Calculate Shannon entropy $H(P) = -\sum p(x) \log p(x)$ as the expected information content across the distribution.`,
      r`For classification models predicting probabilities $Q$, compute cross-entropy $H(P, Q) = -\sum p(x) \log q(x)$.`,
      r`For one-hot ground truth labels where $p_c = 1$ for true class $c$, simplify cross-entropy to the negative log-likelihood $-\log q_c$.`,
      r`Compute gradients of cross-entropy loss with respect to model logits to train neural networks via gradient descent.`,
    ],
    math: [
      {
        h: 'Shannon Entropy',
        tex: r`$$H(P) = -\sum_{x \in \mathcal{X}} P(x) \log_2 P(x) = E_P[-\log_2 P(X)]$$`,
        p: r`Here $P(x)$ is the probability mass function. When using base 2 logarithm, entropy is measured in bits (shannons); when using natural logarithm $\ln$, it is measured in nats. For $K$ discrete outcomes, entropy is bounded: $0 \le H(P) \le \log_2 K$, achieving zero for deterministic events and maximum entropy for a uniform distribution.`,
      },
      {
        h: 'Cross-Entropy',
        tex: r`$$H(P, Q) = -\sum_{x \in \mathcal{X}} P(x) \log_2 Q(x) = E_P[-\log_2 Q(X)]$$`,
        p: r`Here $P(x)$ is the true reference distribution and $Q(x)$ is the approximating model distribution. Cross-entropy quantifies the average number of bits required to encode data from $P$ when using an encoding scheme optimised for $Q$. By Gibbs' inequality, $H(P, Q) \ge H(P)$, with equality if and only if $Q = P$.`,
      },
      {
        h: 'Categorical Cross-Entropy Loss in Machine Learning',
        tex: r`$$\mathcal{L}_{\text{CE}} = -\sum_{k=1}^K y_k \ln \hat{y}_k = -\ln \hat{y}_{\text{true}}$$`,
        p: r`In supervised classification, the ground truth distribution $\mathbf{y}$ is a one-hot vector where $y_c = 1$ for the true class and $y_k = 0$ for all $k \ne c$. Cross-entropy simplifies directly to the negative log-likelihood of the true class under model softmax predictions $\hat{\mathbf{y}}$, establishing that minimising cross-entropy is equivalent to maximum likelihood estimation.`,
      },
    ],
    keyPoints: [
      r`Entropy measures the fundamental unpredictability of a probability distribution; uniform distributions maximise entropy, while deterministic outcomes minimise it to zero.`,
      r`Cross-entropy measures the expected coding length when reality follows $P$ but messages are compressed using a model distribution $Q$.`,
      r`In machine learning, minimising cross-entropy loss is mathematically identical to maximising the likelihood of the training labels.`,
      r`The difference between cross-entropy and entropy is the Kullback–Leibler divergence: $H(P, Q) = H(P) + D_{\text{KL}}(P \parallel Q)$.`,
    ],
    pitfalls: [
      r`Taking the logarithm of zero when model predicted probabilities reach exact 0.0; always clamp probabilities with an epsilon $\epsilon \approx 10^{-15}$.`,
      r`Mixing up base 2 logarithms (bits) with natural logarithms (nats); machine learning libraries universally compute losses in nats.`,
      r`Confusing entropy with variance: high-variance continuous variables can have low differential entropy if concentrated into disjoint sharp spikes.`,
      r`Assuming cross-entropy is symmetric: $H(P, Q) \ne H(Q, P)$ because expectations are taken with respect to different reference distributions.`,
    ],
    code: r`import numpy as np

# True distribution P vs approximating model Q
p = np.array([0.70, 0.20, 0.10])
q = np.array([1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0])

# Shannon entropy H(P) in bits
entropy_p = -np.sum(p * np.log2(p))

# Cross-entropy H(P, Q) in bits
cross_entropy_pq = -np.sum(p * np.log2(q))
divergence_bits = cross_entropy_pq - entropy_p

# Binary cross-entropy in nats (standard ML classification loss)
y_true = np.array([1, 0, 1, 1])
y_prob = np.array([0.92, 0.15, 0.78, 0.65])
bce = -np.mean(y_true * np.log(y_prob) + (1 - y_true) * np.log(1.0 - y_prob))

print(f"Entropy H(P):         {entropy_p:.4f} bits")
print(f"Cross-Entropy H(P,Q): {cross_entropy_pq:.4f} bits")
print(f"Excess code length:   {divergence_bits:.4f} bits")
print(f"Sample Binary CE loss: {bce:.4f} nats")`,
    quiz: [
      {
        q: r`What probability distribution over $K$ discrete outcomes achieves the maximum possible Shannon entropy?`,
        o: [
          r`A deterministic distribution with probability 1.0 on a single state`,
          r`A uniform distribution where every outcome has probability $1/K$`,
          r`A Poisson distribution`,
          r`A Gaussian distribution`,
        ],
        a: 1,
        why: r`When all $K$ outcomes are equally likely, uncertainty is maximised and entropy reaches its upper bound $H(P) = \log_2 K$.`,
      },
      {
        q: r`Why is minimising categorical cross-entropy the standard objective for training classification neural networks?`,
        o: [
          r`Because cross-entropy ignores incorrect predictions`,
          r`Because minimising cross-entropy is mathematically equivalent to maximising the log-likelihood of the true classes`,
          r`Because cross-entropy is always strictly negative`,
          r`Because it eliminates the need for gradient descent`,
        ],
        a: 1,
        why: r`For one-hot target vectors, cross-entropy reduces to $-\ln \hat{y}_{\text{true}}$, which is the negative log-likelihood. Minimising it is exact maximum likelihood estimation.`,
      },
      {
        q: r`What is the relationship connecting entropy $H(P)$, cross-entropy $H(P, Q)$, and Kullback–Leibler divergence $D_{\text{KL}}(P \parallel Q)$?`,
        o: [
          r`$H(P, Q) = H(P) + D_{\text{KL}}(P \parallel Q)$`,
          r`$H(P, Q) = H(P) - D_{\text{KL}}(P \parallel Q)$`,
          r`$D_{\text{KL}}(P \parallel Q) = H(P) \times H(P, Q)$`,
          r`$H(P) = H(P, Q) + D_{\text{KL}}(P \parallel Q)$`,
        ],
        a: 0,
        why: r`Cross-entropy decomposes into the intrinsic entropy of reality $H(P)$ plus the inefficiency penalty $D_{\text{KL}}(P \parallel Q)$ caused by approximating $P$ with $Q$.`,
      },
      {
        q: r`If a fair coin flip has entropy $H = 1.0$ bit, what is the entropy of a completely rigged coin that always lands heads?`,
        o: [
          r`0.5 bits`,
          r`0 bits`,
          r`-1.0 bit`,
          r`Infinite bits`,
        ],
        a: 1,
        why: r`When an outcome is certain ($p = 1$), there is zero surprise: $-1 \log_2(1) = 0$ bits.`,
      },
    ],
    usedBy: ['logistic_regression', 'decision_tree_classifier'],
    prereq: ['random-variables-and-distributions', 'probability-rules-and-bayes-theorem'],
    related: ['kl-divergence', 'jensen-shannon-divergence', 'loss-functions'],
    keywords: 'entropy cross-entropy shannon information theory bits nats log-loss surprise uncertainty negative log-likelihood',
  },
  {
    id: 'kl-divergence',
    short: 'Kullback–Leibler Divergence',
    title: r`KL Divergence`,
    task: 'concepts',
    module: 'Information theory',
    level: 2,
    minutes: 17,
    noLab: true,
    summary: r`Measure the informational divergence and excess code length between probability distributions with relative entropy.`,
    lead: r`How much information is lost when an estimated probability distribution is substituted for ground truth? The Kullback–Leibler (KL) divergence, or relative entropy, quantifies the asymmetric statistical distance between two probability distributions over the same sample space. It acts as the mathematical cornerstone of variational autoencoders, Bayesian inference, and modern policy gradient reinforcement learning algorithms.`,
    intuition: [
      r`Imagine transmitting messages about daily financial market movements where the true probabilities are 70% Bull market, 20% Neutral, and 10% Bear market ($P = [0.70, 0.20, 0.10]$). The optimal Shannon code length for these true states requires an average of $H(P) = -0.7\log_2(0.7) - 0.2\log_2(0.2) - 0.1\log_2(0.1) \approx 1.157$ bits per message.`,
      r`Now suppose an inexperienced analyst assumes a uniform prior, believing all three outcomes are equally likely at 33.3% each ($Q = [1/3, 1/3, 1/3]$). If you build your transmission code using the analyst's uniform model $Q$, each outcome requires $-\log_2(1/3) \approx 1.585$ bits. When reality sends messages drawn from $P$, the expected message length is $1.585$ bits.`,
      r`The excess storage wasted per transmission is $1.585 - 1.157 = 0.428$ bits. This exact excess cost—the penalty for using an incorrect distribution $Q$ instead of true distribution $P$—is the Kullback–Leibler divergence $D_{\text{KL}}(P \parallel Q)$. Notice what happens if we reverse the roles: if reality were uniform $Q$, but we mistakenly coded with the analyst's skewed beliefs $P$, the penalty would be $D_{\text{KL}}(Q \parallel P) \approx 0.468$ bits. Because $0.428 \ne 0.468$, KL divergence is not a true mathematical distance metric: it is strictly asymmetric and violates the triangle inequality.`,
    ],
    analogy: r`KL divergence is like the fuel penalty of navigating a ship with an outdated nautical map: if the map slightly misjudges open waters the penalty is modest, but if the map assumes deep ocean where a reef exists, disaster strikes.`,
    steps: [
      r`Define discrete probability distributions $P$ and $Q$ over the identical support set $\mathcal{X}$.`,
      r`Verify absolute continuity: ensure $Q(x) > 0$ whenever $P(x) > 0$; if $P(x) > 0$ and $Q(x) = 0$, $D_{\text{KL}}$ is infinite.`,
      r`Calculate the log-likelihood ratio (information gain) for each state: $\ln(P(x) / Q(x))$.`,
      r`Compute the expected log-ratio under distribution $P$: $D_{\text{KL}}(P \parallel Q) = \sum P(x) \ln(P(x) / Q(x))$.`,
      r`Check Gibbs' inequality: verify that $D_{\text{KL}}(P \parallel Q) \ge 0$, with equality if and only if $P = Q$ almost everywhere.`,
      r`Use $D_{\text{KL}}$ to regularise model posteriors towards priors, such as in variational autoencoders and trust-region policy optimisation.`,
    ],
    math: [
      {
        h: 'Discrete and Continuous KL Divergence',
        tex: r`$$D_{\text{KL}}(P \parallel Q) = \sum_{x \in \mathcal{X}} P(x) \ln\left(\frac{P(x)}{Q(x)}\right) = \int_{-\infty}^{\infty} p(x) \ln\left(\frac{p(x)}{q(x)}\right) dx$$`,
        p: r`Here $P(x)$ is the true or target reference distribution and $Q(x)$ is the approximating distribution. KL divergence can be rewritten as the cross-entropy minus the entropy: $D_{\text{KL}}(P \parallel Q) = H(P, Q) - H(P)$. When using base 2 logarithms, the result is in bits; when using natural logarithms, it is in nats.`,
      },
      {
        h: 'Gibbs\' Inequality and Non-Negativity',
        tex: r`$$D_{\text{KL}}(P \parallel Q) \ge 0, \qquad D_{\text{KL}}(P \parallel Q) = 0 \iff P = Q \text{ almost everywhere}$$`,
        p: r`By Jensen's inequality and the strict convexity of $-\ln(t)$, $E_P[-\ln(Q/P)] \ge -\ln(E_P[Q/P]) = -\ln(1) = 0$. This fundamental property guarantees that approximating a distribution never reduces expected coding length below the true entropy.`,
      },
      {
        h: 'KL Divergence Between Univariate Gaussians',
        tex: r`$$D_{\text{KL}}\left(\mathcal{N}(\mu_1, \sigma_1^2) \parallel \mathcal{N}(\mu_2, \sigma_2^2)\right) = \ln\left(\frac{\sigma_2}{\sigma_1}\right) + \frac{\sigma_1^2 + (\mu_1 - \mu_2)^2}{2\sigma_2^2} - \frac{1}{2}$$`,
        p: r`For continuous Gaussian distributions, KL divergence has a closed-form analytic solution. In Variational Autoencoders (VAEs), this formula measures the divergence between an encoder's latent Gaussian posterior $\mathcal{N}(\mu, \sigma^2)$ and a standard Gaussian prior $\mathcal{N}(0, 1)$, simplifying to $\frac{1}{2}(\sigma^2 + \mu^2 - 1 - \ln \sigma^2)$.`,
      },
    ],
    keyPoints: [
      r`KL divergence measures the expected excess surprise or coding inefficiency of using distribution $Q$ to model reality $P$.`,
      r`KL divergence is strictly non-negative ($D_{\text{KL}} \ge 0$) and equals zero if and only if the two distributions are identical.`,
      r`KL divergence is asymmetric: $D_{\text{KL}}(P \parallel Q) \ne D_{\text{KL}}(Q \parallel P)$, meaning it cannot serve as a true distance metric.`,
      r`Forward KL ($D_{\text{KL}}(P \parallel Q)$) penalises $Q$ heavily where $P > 0$, forcing $Q$ to cover all modes (mean-seeking); reverse KL ($D_{\text{KL}}(Q \parallel P)$) penalises $Q > 0$ where $P = 0$, forcing $Q$ to concentrate on a single mode (mode-seeking).`,
    ],
    pitfalls: [
      r`Dividing by zero when $Q(x) = 0$ while $P(x) > 0$, causing divergence to explode to infinity.`,
      r`Treating KL divergence as a symmetric distance metric, causing errors in generative modelling and loss design.`,
      r`Confusing forward KL (zero-avoiding) with reverse KL (zero-forcing) in variational inference and policy optimisation.`,
      r`Overlooking that continuous KL divergence is invariant under coordinate reparameterisation, whereas differential entropy is coordinate-dependent.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

# Discrete distributions: true market states vs uniform belief
p = np.array([0.70, 0.20, 0.10])
q = np.array([1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0])

# Forward and reverse KL divergence in bits
kl_forward = stats.entropy(p, q, base=2)
kl_reverse = stats.entropy(q, p, base=2)

# Analytic KL divergence between two univariate Gaussians (nats)
mu1, sig1 = 0.0, 1.0
mu2, sig2 = 1.0, 1.5
kl_gauss = np.log(sig2 / sig1) + (sig1**2 + (mu1 - mu2)**2) / (2.0 * sig2**2) - 0.5

print(f"Forward KL D(P || Q): {kl_forward:.4f} bits")
print(f"Reverse KL D(Q || P): {kl_reverse:.4f} bits")
print(f"Asymmetry delta:      {abs(kl_forward - kl_reverse):.4f} bits")
print(f"Gaussian KL divergence: {kl_gauss:.4f} nats")`,
    quiz: [
      {
        q: r`Why is the Kullback–Leibler divergence not considered a true distance metric in mathematics?`,
        o: [
          r`Because it can take negative values`,
          r`Because it is asymmetric ($D_{\text{KL}}(P \parallel Q) \ne D_{\text{KL}}(Q \parallel P)$) and violates the triangle inequality`,
          r`Because it only applies to discrete distributions`,
          r`Because it requires continuous differentiability`,
        ],
        a: 1,
        why: r`A formal metric must be symmetric ($d(x,y)=d(y,x)$) and satisfy the triangle inequality ($d(x,z) \le d(x,y)+d(y,z)$). KL divergence violates both properties.`,
      },
      {
        q: r`What happens to $D_{\text{KL}}(P \parallel Q)$ if there exists an outcome $x$ where $P(x) > 0$ but $Q(x) = 0$?`,
        o: [
          r`It evaluates to 0`,
          r`It evaluates to $+\infty$`,
          r`It equals 1.0 bit`,
          r`It is undefined and defaults to $-1$`,
        ],
        a: 1,
        why: r`Because the formula involves $\ln(P(x) / Q(x))$, dividing a positive probability by zero causes the logarithm—and hence the divergence—to become infinite.`,
      },
      {
        q: r`In variational inference, how does minimising reverse KL divergence ($D_{\text{KL}}(Q \parallel P)$) affect the approximating distribution $Q$?`,
        o: [
          r`It forces $Q$ to spread out over all modes of $P$`,
          r`It acts as a mode-seeking objective, penalising $Q$ heavily whenever $Q > 0$ where $P \approx 0$, causing $Q$ to focus on a single dominant mode`,
          r`It turns $Q$ into a uniform distribution`,
          r`It prevents the model from updating parameters`,
        ],
        a: 1,
        why: r`Reverse KL penalises positive density in $Q$ where $P$ has low density, forcing $Q$ to compress tightly onto one of the major modes of $P$.`,
      },
      {
        q: r`What is the minimum possible value of the Kullback–Leibler divergence $D_{\text{KL}}(P \parallel Q)$?`,
        o: [
          r`$-\infty$`,
          r`$-1.0$`,
          r`0, achieved if and only if $P = Q$ almost everywhere`,
          r`0.5`,
        ],
        a: 2,
        why: r`Gibbs' inequality guarantees $D_{\text{KL}}(P \parallel Q) \ge 0$, with equality holding strictly if and only if $P$ and $Q$ are identical probability distributions.`,
      },
    ],
    usedBy: ['logistic_regression', 'decision_tree_classifier'],
    prereq: ['entropy-and-cross-entropy', 'probability-rules-and-bayes-theorem'],
    related: ['jensen-shannon-divergence', 'loss-functions', 'maximum-likelihood-estimation'],
    keywords: 'kl divergence kullback leibler relative entropy information divergence information theory asymmetry variational',
  },
  {
    id: 'jensen-shannon-divergence',
    short: 'Jensen–Shannon Divergence',
    title: r`Jensen–Shannon Divergence`,
    task: 'concepts',
    module: 'Information theory',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Establish symmetric, bounded statistical distances between probability distributions using mixture averages and the square-root metric property.`,
    lead: r`While the Kullback–Leibler divergence is fundamental to information theory, its asymmetry and unbounded nature create severe numerical instability when distributions have non-overlapping support. The Jensen–Shannon divergence (JSD) resolves these flaws by averaging KL divergences to a shared mixture distribution. Symmetrical, always finite, and bounded between 0 and 1, the square root of Jensen–Shannon divergence forms a true mathematical metric widely used in generative adversarial networks (GANs) and distribution drift monitoring.`,
    intuition: [
      r`Imagine auditing data drift between two model deployment environments. In training, user age follows distribution $P$; in production, user age follows distribution $Q$.`,
      r`If there is even a single age category present in production that never occurred in training (say, users aged 95+), $P(95+) = 0$ while $Q(95+) > 0$. If you compute the forward KL divergence $D_{\text{KL}}(Q \parallel P)$, the ratio $Q(x) / P(x)$ divides by zero, blowing the score up to infinity! A single rare event completely blinds the metric to how closely the remaining 99.9% of the distribution matches.`,
      r`The Jensen–Shannon divergence solves this by introducing a midpoint: the balanced mixture distribution $M = \frac{1}{2}(P + Q)$. Because $M$ contains half of $P$ and half of $Q$, $M(x)$ is strictly positive whenever either $P(x) > 0$ or $Q(x) > 0$. Neither distribution can ever divide by zero against $M$. JSD then measures the average divergence from both distributions to this midpoint: $\text{JSD}(P \parallel Q) = \frac{1}{2} D_{\text{KL}}(P \parallel M) + \frac{1}{2} D_{\text{KL}}(Q \parallel M)$. For our financial market example ($P = [0.70, 0.20, 0.10]$ and $Q = [1/3, 1/3, 1/3]$), $M = [0.517, 0.267, 0.217]$. The divergences to $M$ produce $\text{JSD} \approx 0.108$ bits. Taking the base 2 logarithm guarantees JSD is bounded between 0 (identical) and 1 bit (completely disjoint). Furthermore, $\sqrt{\text{JSD}}$ satisfies the triangle inequality, creating a true metric distance between probability distributions.`,
    ],
    analogy: r`If KL divergence is like measuring the elevation difference between two hikers on a mountain where one hiker cannot see the other's cliff, Jensen–Shannon divergence is like finding the exact halfway basecamp and measuring how far each hiker must walk to meet in the middle.`,
    steps: [
      r`Given two distributions $P$ and $Q$ over the same space, construct the equal-weight midpoint mixture $M = \frac{1}{2}(P + Q)$.`,
      r`Compute the forward KL divergence from $P$ to the mixture: $D_{\text{KL}}(P \parallel M)$.`,
      r`Compute the forward KL divergence from $Q$ to the mixture: $D_{\text{KL}}(Q \parallel M)$.`,
      r`Average the two divergences to obtain the Jensen–Shannon divergence: $\text{JSD}(P \parallel Q) = \frac{1}{2} D_{\text{KL}}(P \parallel M) + \frac{1}{2} D_{\text{KL}}(Q \parallel M)$.`,
      r`If using logarithm base 2, note that JSD is bounded in $[0, 1]$; if using natural logarithm $\ln$, JSD is bounded in $[0, \ln 2]$.`,
      r`Compute the Jensen–Shannon distance $\sqrt{\text{JSD}}$ whenever a true mathematical metric satisfying the triangle inequality is required.`,
    ],
    math: [
      {
        h: 'Jensen–Shannon Divergence Definition',
        tex: r`$$\text{JSD}(P \parallel Q) = \frac{1}{2} D_{\text{KL}}(P \parallel M) + \frac{1}{2} D_{\text{KL}}(Q \parallel M), \qquad M = \frac{1}{2}(P + Q)$$`,
        p: r`Here $M$ is the equal-weight mixture distribution. Because $M(x) > 0$ wherever either $P(x) > 0$ or $Q(x) > 0$, the ratio never divides by zero, ensuring JSD is always well-defined and finite even for distributions with disjoint supports. Furthermore, JSD is strictly symmetric: $\text{JSD}(P \parallel Q) = \text{JSD}(Q \parallel P)$.`,
      },
      {
        h: 'Entropy Formulation and Boundedness',
        tex: r`$$\text{JSD}(P \parallel Q) = H(M) - \frac{1}{2}\left[H(P) + H(Q)\right]$$`,
        p: r`JSD equals the Shannon entropy of the mixture distribution minus the average entropies of the individual distributions. By the strict concavity of Shannon entropy, $\text{JSD} \ge 0$, with equality if and only if $P = Q$. When measured in base 2 logarithm, JSD is bounded in $[0, 1]$ bit, reaching its theoretical maximum of $1.0$ bit when $P$ and $Q$ have completely disjoint support.`,
      },
      {
        h: 'The Jensen–Shannon Distance Metric',
        tex: r`$$d_{\text{JS}}(P, Q) = \sqrt{\text{JSD}(P \parallel Q)}$$`,
        p: r`In 2003, Endres and Schindelin proved that the square root of the Jensen–Shannon divergence satisfies the triangle inequality: $d_{\text{JS}}(P, R) \le d_{\text{JS}}(P, Q) + d_{\text{JS}}(Q, R)$. Combined with non-negativity, symmetry, and identity of indiscernibles, $d_{\text{JS}}$ forms a true mathematical metric.`,
      },
    ],
    keyPoints: [
      r`Jensen–Shannon divergence is strictly symmetric: $\text{JSD}(P \parallel Q) = \text{JSD}(Q \parallel P)$.`,
      r`JSD is bounded in $[0, 1]$ (when measured in bits) and remains finite even when distributions have completely disjoint support.`,
      r`The square root $\sqrt{\text{JSD}}$ is a valid mathematical metric satisfying the triangle inequality.`,
      r`The original formulation of Generative Adversarial Networks (Goodfellow et al., 2014) showed that an optimal discriminator minimax game is mathematically equivalent to minimising the Jensen–Shannon divergence between real and generated distributions.`,
    ],
    pitfalls: [
      r`Using natural logarithm instead of $\log_2$ and assuming the upper bound is 1.0 (with natural log $\ln$, the upper bound is $\ln 2 \approx 0.6931$).`,
      r`Forgetting that when distributions have disjoint support with zero overlap, JSD saturates at its maximum value (1.0), causing vanishing gradients in GAN training.`,
      r`Confusing JSD (which is not a metric, but a squared distance) with the Jensen–Shannon distance $\sqrt{\text{JSD}}$ (a true metric).`,
      r`Applying JSD to unnormalised weight vectors without ensuring $\sum p_i = 1$ and $\sum q_i = 1$.`,
    ],
    code: r`import numpy as np
import scipy.spatial.distance as dist
import scipy.stats as stats

p = np.array([0.70, 0.20, 0.10])
q = np.array([1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0])

# Midpoint mixture distribution M
m = 0.5 * (p + q)

# Jensen-Shannon divergence in bits
jsd = 0.5 * stats.entropy(p, m, base=2) + 0.5 * stats.entropy(q, m, base=2)

# Jensen-Shannon distance metric: sqrt(JSD)
js_distance = dist.jensenshannon(p, q, base=2)

# Completely disjoint distributions (maximal JSD)
p_disjoint = np.array([1.0, 0.0])
q_disjoint = np.array([0.0, 1.0])
m_disjoint = 0.5 * (p_disjoint + q_disjoint)
jsd_max = 0.5 * stats.entropy(p_disjoint, m_disjoint, base=2) + \
          0.5 * stats.entropy(q_disjoint, m_disjoint, base=2)

print(f"JSD(P || Q):          {jsd:.4f} bits")
print(f"JS distance metric:   {js_distance:.4f}")
print(f"Disjoint support JSD: {jsd_max:.4f} bits (bounded maximum = 1.0)")`,
    quiz: [
      {
        q: r`Why is the Jensen–Shannon divergence preferred over the Kullback–Leibler divergence for monitoring data drift in production pipelines?`,
        o: [
          r`Because JSD is always symmetric and stays finite even when new categories appear that had zero probability in training`,
          r`Because JSD requires only one distribution`,
          r`Because JSD does not use logarithms`,
          r`Because JSD cannot be computed on categorical data`,
        ],
        a: 0,
        why: r`If a production distribution has an outcome unseen in training, KL divergence divides by zero and explodes to infinity. JSD compares against the average mixture $M$, remaining bounded and stable.`,
      },
      {
        q: r`When calculated using base 2 logarithms, what is the maximum possible value of the Jensen–Shannon divergence $\text{JSD}(P \parallel Q)$?`,
        o: [
          r`$0.5$ bits`,
          r`$1.0$ bit`,
          r`$\infty$`,
          r`$\ln 2$ bits`,
        ],
        a: 1,
        why: r`When distributions $P$ and $Q$ have completely disjoint support (no shared non-zero states), $\text{JSD} = \log_2(2) = 1.0$ bit.`,
      },
      {
        q: r`Which mathematical transformation turns the Jensen–Shannon divergence into a true distance metric that satisfies the triangle inequality?`,
        o: [
          r`Taking the square root ($\sqrt{\text{JSD}}$)`,
          r`Squaring it ($\text{JSD}^2$)`,
          r`Multiplying by 2`,
          r`Inverting it ($1 / \text{JSD}$)`,
        ],
        a: 0,
        why: r`By the Endres–Schindelin theorem (2003), the square root of the Jensen–Shannon divergence satisfies the triangle inequality, making $\sqrt{\text{JSD}}$ a true metric.`,
      },
      {
        q: r`What issue arises in generative adversarial network (GAN) training when real and generated distributions have disjoint support under Jensen–Shannon divergence?`,
        o: [
          r`JSD becomes negative`,
          r`JSD saturates at its constant maximum (1.0 bit), yielding zero gradients and halting generator learning`,
          r`The discriminator loss oscillates uncontrollably`,
          r`The mixture distribution cannot be formed`,
        ],
        a: 1,
        why: r`When supports do not overlap, JSD is constantly 1.0 regardless of how far apart the distributions are in space, producing vanishing gradients that motivated Wasserstein GANs.`,
      },
    ],
    usedBy: ['clustering-metrics', 'decision_tree_classifier'],
    prereq: ['entropy-and-cross-entropy', 'kl-divergence'],
    related: ['clustering-metrics', 'loss-functions'],
    keywords: 'jensen shannon divergence jsd jensen shannon distance symmetric divergence information theory drift monitoring gans',
  },
  {
    id: 'mutual-information',
    short: 'Mutual Information',
    title: r`Mutual Information`,
    task: 'concepts',
    module: 'Information theory',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Measure linear and non-linear dependence between random variables using information gain and entropy reduction.`,
    lead: r`While Pearson correlation measures strictly linear associations and fails on curved dependencies, Mutual Information (MI) quantifies all forms of statistical dependence—linear, non-linear, and non-monotonic. Grounded in information theory, MI measures how much uncertainty about one random variable is eliminated by knowing the value of another. It serves as a foundational technique for non-linear feature selection, decision tree splitting, and representation learning.`,
    intuition: [
      r`Suppose you analyse the relationship between outdoor temperature $X$ and electricity demand $Y$. On freezing winter days and scorching summer days, electricity demand surges to power heating and air conditioning, while on mild spring days demand is low. The relationship forms a parabolic U-shape ($Y \approx X^2$).`,
      r`If you compute Pearson's linear correlation coefficient $r$, the positive slope on the hot side cancels out the negative slope on the cold side, yielding $r \approx -0.058$ ($p = 0.193$). An analyst relying solely on linear correlation would mistakenly conclude that temperature has zero statistical relationship with electricity demand!`,
      r`Mutual information avoids this blind spot entirely. It does not look for straight lines; it compares the joint distribution $P(X, Y)$ against the product of the marginals $P(X)P(Y)$ (what the joint distribution would look like if $X$ and $Y$ were completely independent). When temperature strongly dictates electricity demand, knowing $X$ removes substantial uncertainty from $Y$, yielding a high mutual information of $1.722$ bits. If two variables are truly statistically independent, $P(X, Y) = P(X)P(Y)$ everywhere, and mutual information drops to identically $0.0$ bits.`,
    ],
    analogy: r`Pearson correlation is like a rigid wooden ruler that can only measure straight paths; mutual information is like a flexible measuring tape that wraps around every curve and bend to measure true connection.`,
    steps: [
      r`Estimate the joint probability distribution $P(X, Y)$ and compute individual marginal distributions $P(X)$ and $P(Y)$.`,
      r`For continuous variables, discretise features into two-dimensional grid bins or employ $k$-nearest neighbours estimators.`,
      r`Compute the individual Shannon marginal entropies $H(X)$ and $H(Y)$.`,
      r`Compute the joint entropy $H(X, Y)$ or the conditional entropy $H(Y \mid X)$.`,
      r`Calculate mutual information: $I(X; Y) = H(X) + H(Y) - H(X, Y) = H(Y) - H(Y \mid X)$.`,
      r`Rank candidate explanatory features by mutual information with the target label to perform non-linear feature selection.`,
    ],
    math: [
      {
        h: 'Mutual Information Definition via KL Divergence',
        tex: r`$$I(X; Y) = D_{\text{KL}}\left(P(X, Y) \parallel P(X)P(Y)\right) = \sum_{x \in \mathcal{X}}\sum_{y \in \mathcal{Y}} P(x, y) \log_2\left(\frac{P(x, y)}{P(x)P(y)}\right)$$`,
        p: r`Here $P(x, y)$ is the joint probability mass function, and $P(x)P(y)$ is the product of independent marginal distributions. Mutual information measures the Kullback–Leibler divergence between joint reality and the independent null baseline. By Gibbs' inequality, $I(X; Y) \ge 0$, with equality holding if and only if $X$ and $Y$ are statistically independent.`,
      },
      {
        h: 'Entropy Decomposition and Symmetry',
        tex: r`$$I(X; Y) = H(X) - H(X \mid Y) = H(Y) - H(Y \mid X) = H(X) + H(Y) - H(X, Y)$$`,
        p: r`Here $H(Y)$ is the initial uncertainty in $Y$, and $H(Y \mid X)$ is the remaining uncertainty in $Y$ after observing $X$. Their difference represents the information gain about $Y$ provided by $X$. Because entropy Venn diagrams are symmetric, $I(X; Y) = I(Y; X)$.`,
      },
      {
        h: 'Continuous Mutual Information and Gaussian Equivalence',
        tex: r`$$I(X; Y) = -\frac{1}{2} \ln\left(1 - \rho^2\right) \quad \text{for jointly Gaussian variables}$$`,
        p: r`When $X$ and $Y$ follow a bivariate normal distribution with correlation coefficient $\rho$, mutual information is an exact monotonic function of $\rho^2$. For non-Gaussian variables, $I(X; Y) \ge -\frac{1}{2}\ln(1 - \rho^2)$, capturing higher-order non-linear associations that linear correlation misses.`,
      },
    ],
    keyPoints: [
      r`Mutual information detects all forms of statistical association, including non-linear, non-monotonic, and periodic relationships.`,
      r`$I(X; Y)$ is strictly non-negative and symmetric: $I(X; Y) = I(Y; X) \ge 0$, with $I(X; Y) = 0$ if and only if $X$ and $Y$ are independent.`,
      r`In decision trees, the information gain splitting criterion is mathematically identical to the mutual information between the candidate split feature and the target class.`,
      r`Unlike Pearson correlation, mutual information is invariant under any invertible, monotonic transformation of the variables.`,
    ],
    pitfalls: [
      r`Naive binning on continuous data: too few bins underestimates true dependence; too many bins overestimates MI due to finite-sample sampling noise.`,
      r`Expecting an upper bound of 1.0: unnormalised mutual information is bounded by $\min(H(X), H(Y))$; use normalised mutual information (NMI) if a $[0, 1]$ metric is required.`,
      r`Feature redundancy in greedy selection: picking top features by individual MI can select highly collinear duplicates; use minimum redundancy maximum relevance (mRMR).`,
      r`High computational cost: estimating high-dimensional joint mutual information suffers from the curse of dimensionality.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n = 500

# Parabolic non-linear relationship: Y = X^2 + noise
x = rng.uniform(-3.0, 3.0, size=n)
y = x**2 + rng.normal(loc=0.0, scale=0.5, size=n)

# 1. Pearson linear correlation (fails on non-linear curves)
r_val, p_r = stats.pearsonr(x, y)

# 2. Discrete mutual information via 2D binning (Shannon formula in bits)
bins = 12
hist_2d, _, _ = np.histogram2d(x, y, bins=bins)
p_xy = hist_2d / np.sum(hist_2d)
p_x = np.sum(p_xy, axis=1, keepdims=True)
p_y = np.sum(p_xy, axis=0, keepdims=True)

# I(X; Y) = sum P(x,y) * log2(P(x,y) / (P(x)*P(y)))
nonzero = p_xy > 0
mi_bits = np.sum(p_xy[nonzero] * np.log2(p_xy[nonzero] / (p_x @ p_y)[nonzero]))

print(f"Pearson correlation r: {r_val:.3f} (p-value: {p_r:.3f})")
print(f"Mutual Information:    {mi_bits:.3f} bits")`,
    quiz: [
      {
        q: r`Why does Pearson's correlation coefficient evaluate to approximately zero on a perfect parabolic relationship ($Y = X^2$ on $[-3, 3]$)?`,
        o: [
          r`Because parabolic data violates the central limit theorem`,
          r`Because the positive linear trend on $X > 0$ cancels out the negative linear trend on $X < 0$`,
          r`Because Pearson correlation can only be computed on positive values`,
          r`Because the variance of $Y$ is zero`,
        ],
        a: 1,
        why: r`Pearson correlation evaluates strictly linear slope. In symmetric U-shaped curves, positive and negative slopes cancel out, yielding $r \approx 0$ despite complete deterministic dependence.`,
      },
      {
        q: r`Under what condition is the mutual information $I(X; Y)$ strictly equal to zero?`,
        o: [
          r`When $X$ and $Y$ are statistically independent`,
          r`When $X$ and $Y$ have a negative linear correlation`,
          r`When $X$ and $Y$ follow standard normal distributions`,
          r`When the covariance of $X$ and $Y$ is positive`,
        ],
        a: 0,
        why: r`By definition, $I(X; Y) = D_{\text{KL}}(P(X, Y) \parallel P(X)P(Y))$. The divergence is zero if and only if $P(X, Y) = P(X)P(Y)$, which is the exact definition of statistical independence.`,
      },
      {
        q: r`In decision tree induction algorithms like ID3 and C4.5, what information-theoretic quantity corresponds to "information gain"?`,
        o: [
          r`Gini impurity difference`,
          r`Mutual information between the candidate split feature and the target label`,
          r`Kullback–Leibler divergence between tree branches`,
          r`Cramér's V statistic`,
        ],
        a: 1,
        why: r`Information gain is defined as $H(Y) - H(Y \mid X)$, which is mathematically identical to the mutual information $I(X; Y)$.`,
      },
      {
        q: r`What is the theoretical upper bound on the mutual information $I(X; Y)$ between two discrete random variables?`,
        o: [
          r`1.0 bit`,
          r`$\min(H(X), H(Y))$`,
          r`$H(X) + H(Y)$`,
          r`$\infty$ for any discrete variable`,
        ],
        a: 1,
        why: r`Because knowing $X$ cannot eliminate more uncertainty than exists in $X$ itself or in $Y$, $I(X; Y) \le \min(H(X), H(Y))$.`,
      },
    ],
    usedBy: ['decision_tree_classifier', 'feature-selection'],
    prereq: ['entropy-and-cross-entropy', 'kl-divergence', 'probability-rules-and-bayes-theorem'],
    related: ['correlation-pearson-spearman-kendall', 'feature-selection', 'decision_tree_classifier'],
    keywords: 'mutual information mi entropy information gain non-linear dependence feature selection ksg contingency table',
  },
  {
    id: 'ols-inference-t-tests-f-test-r2-and-adjusted-r2',
    short: 'OLS Inference: t, F & R-Squared',
    title: r`OLS Inference: t-Tests, F-Test, R² and Adjusted R²`,
    task: 'concepts',
    module: 'Regression inference',
    level: 1,
    minutes: 18,
    noLab: true,
    summary: r`Conduct rigorous hypothesis tests on regression coefficients with t-tests, evaluate overall model significance with the F-test, and penalise overfitting with adjusted R².`,
    lead: r`Fitting an ordinary least squares (OLS) regression line is only the first step in linear modelling. To determine whether estimated slopes represent genuine population relationships rather than sampling noise, we must perform statistical inference. Individual coefficient t-tests evaluate specific predictors, the omnibus F-test assesses whether the model explains more variance than a simple average, and adjusted R² prevents the deceptive inflation of goodness-of-fit as redundant variables are added.`,
    intuition: [
      r`Suppose an analyst fits an OLS regression predicting house prices using three features: square footage, number of bedrooms, and the homeowner's lucky lottery number. Least squares outputs estimated slopes: square footage has $\hat{\beta}_1 = 3.350$ (£3,350 per unit), bedrooms has $\hat{\beta}_2 = 12.901$ (£12,900 per bedroom), and lucky number has $\hat{\beta}_3 = -0.031$.`,
      r`Did the owner's lucky number genuinely influence property price? The estimated slope is $-0.031$, but its standard error is $0.036$. Dividing the coefficient by its standard error gives a $t$-statistic of $t = -0.856$, producing a p-value of $p = 0.394$. Because this p-value is far above the conventional significance threshold $\alpha = 0.05$, we fail to reject the null hypothesis $\beta_3 = 0$ and conclude that lucky number has zero statistical relationship with house prices. Conversely, square footage achieves $t = 25.91$ ($p < 10^{-15}$), demonstrating an overwhelmingly reliable effect.`,
      r`Next, look at the overall model: the coefficient of determination $R^2$ indicates that the model accounts for $90.7\%$ of total price variance ($R^2 = 0.907$). However, least squares mathematically guarantees that adding any extra variable—even pure random noise—will never decrease $R^2$. Adjusted $R^2$ corrects for this by penalising model complexity: for our model, adjusted $R^2$ is $0.904$. Finally, the omnibus $F$-test evaluates whether all three predictors jointly explain significant variance compared to an intercept-only baseline: an $F$-statistic of $310.4$ ($p < 10^{-15}$) decisively rejects the global null hypothesis.`,
    ],
    analogy: r`The coefficient t-test is like interviewing individual job candidates to verify each person pulls their weight; the omnibus F-test checks whether the team as a whole beats random noise; and adjusted R² penalises the manager for hiring unnecessary staff.`,
    steps: [
      r`Fit the OLS regression model $\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \boldsymbol{\epsilon}$ via normal equations: $\hat{\boldsymbol{\beta}} = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\mathbf{y}$.`,
      r`Compute the residual variance estimate $s^2 = \frac{\mathbf{e}^T\mathbf{e}}{n - p - 1}$ and the covariance matrix $\widehat{\text{Var}}(\hat{\boldsymbol{\beta}}) = s^2 (\mathbf{X}^T\mathbf{X})^{-1}$.`,
      r`Extract standard errors $\text{SE}(\hat{\beta}_j) = s\sqrt{[(\mathbf{X}^T\mathbf{X})^{-1}]_{jj}}$ and compute $t$-statistics $t_j = \hat{\beta}_j / \text{SE}(\hat{\beta}_j)$ with $n - p - 1$ degrees of freedom.`,
      r`Calculate the unadjusted coefficient of determination $R^2 = 1 - SS_{\text{res}} / SS_{\text{tot}}$.`,
      r`Calculate adjusted $R^2 = 1 - \left(1 - R^2\right)\frac{n - 1}{n - p - 1}$ to penalise over-parameterisation.`,
      r`Compute the omnibus $F$-statistic $F = \frac{(SS_{\text{tot}} - SS_{\text{res}}) / p}{SS_{\text{res}} / (n - p - 1)}$ to assess the collective significance of all predictors.`,
    ],
    math: [
      {
        h: 'Coefficient t-Statistic and Standard Errors',
        tex: r`$$t_j = \frac{\hat{\beta}_j - 0}{\text{SE}(\hat{\beta}_j)} = \frac{\hat{\beta}_j}{s \sqrt{[(\mathbf{X}^T\mathbf{X})^{-1}]_{jj}}} \sim t(n - p - 1)$$`,
        p: r`Here $\hat{\beta}_j$ is the estimated slope, $s = \sqrt{SS_{\text{res}} / (n - p - 1)}$ is the residual standard error, and $[(\mathbf{X}^T\mathbf{X})^{-1}]_{jj}$ is the $j$-th diagonal element of the inverted Gram matrix. Under the null hypothesis $H_0: \beta_j = 0$, $t_j$ follows Student's $t$-distribution with $n - p - 1$ degrees of freedom ($n$ observations, $p$ predictors, 1 intercept).`,
      },
      {
        h: 'R-Squared and Adjusted R-Squared',
        tex: r`$$R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}, \qquad R_{\text{adj}}^2 = 1 - \left(1 - R^2\right)\frac{n - 1}{n - p - 1}$$`,
        p: r`Here $SS_{\text{res}} = \sum (y_i - \hat{y}_i)^2$ is the residual sum of squares and $SS_{\text{tot}} = \sum (y_i - \bar{y})^2$ is the total sum of squares. Unadjusted $R^2$ measures the proportion of variance explained by the model, but monotonically increases whenever a new feature is added. Adjusted $R^2$ divides sums of squares by their degrees of freedom, increasing only if the added feature improves model fit by more than expected by chance ($t^2 > 1$).`,
      },
      {
        h: 'Omnibus F-Statistic',
        tex: r`$$F = \frac{(SS_{\text{tot}} - SS_{\text{res}}) / p}{SS_{\text{res}} / (n - p - 1)} = \frac{R^2 / p}{(1 - R^2) / (n - p - 1)} \sim F(p, \, n - p - 1)$$`,
        p: r`The omnibus $F$-test evaluates the joint null hypothesis $H_0: \beta_1 = \beta_2 = \dots = \beta_p = 0$ against the alternative that at least one coefficient is non-zero. It tests whether the regression model as a whole explains significantly more variance than a flat horizontal line through the sample mean.`,
      },
    ],
    keyPoints: [
      r`Individual $t$-tests assess the marginal contribution of each predictor given that all other predictors are already included in the model.`,
      r`$R^2$ never decreases when adding variables; adjusted $R^2$ penalises degrees of freedom to protect against spurious model complexity.`,
      r`The omnibus $F$-test guards against false discovery by evaluating whether all explanatory variables jointly explain significant outcome variance.`,
      r`In the presence of multicollinearity, the omnibus $F$-test can be highly significant even if no individual $t$-test achieves significance.`,
    ],
    pitfalls: [
      r`Mistaking high $R^2$ for causal validity: an overfitted model with 50 irrelevant polynomial terms can achieve $R^2 > 0.98$ while failing completely on new data.`,
      r`Interpreting a non-significant $t$-test as proof that a feature has no relationship with $Y$; collinearity with another feature can inflate standard errors.`,
      r`Comparing unadjusted $R^2$ values across models with different numbers of predictors.`,
      r`Trusting standard OLS p-values when errors are heteroscedastic or serially correlated, which violates Gauss–Markov assumptions.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n = 100
p = 3

# Predict house prices using sqft (x1), bedrooms (x2), and lucky number (x3)
x1 = rng.uniform(10.0, 40.0, size=n)
x2 = rng.integers(1, 6, size=n)
x3 = rng.uniform(1.0, 100.0, size=n)  # Pure noise variable
y = 50.0 + 3.5 * x1 + 12.0 * x2 + rng.normal(0.0, 10.0, size=n)

# OLS normal equations: beta = (X^T X)^(-1) X^T y
X = np.column_stack([np.ones(n), x1, x2, x3])
beta = np.linalg.inv(X.T @ X) @ X.T @ y
residuals = y - X @ beta

# Inference: standard errors, t-statistics, p-values
s2 = np.sum(residuals**2) / (n - p - 1)
se_beta = np.sqrt(np.diag(s2 * np.linalg.inv(X.T @ X)))
t_stats = beta / se_beta
p_vals = 2.0 * (1.0 - stats.t.cdf(np.abs(t_stats), df=n - p - 1))

# Goodness-of-fit: R2, Adjusted R2, F-statistic
ss_tot = np.sum((y - np.mean(y))**2)
ss_res = np.sum(residuals**2)
r2 = 1.0 - ss_res / ss_tot
r2_adj = 1.0 - (ss_res / (n - p - 1)) / (ss_tot / (n - 1))
f_stat = ((ss_tot - ss_res) / p) / (ss_res / (n - p - 1))

print(f"R2: {r2:.3f}, Adjusted R2: {r2_adj:.3f}, F-stat: {f_stat:.1f}")
print(f"SqFt:   beta={beta[1]:.3f}, SE={se_beta[1]:.3f}, t={t_stats[1]:.2f}, p={p_vals[1]:.4e}")
print(f"Lucky:  beta={beta[3]:.3f}, SE={se_beta[3]:.3f}, t={t_stats[3]:.2f}, p={p_vals[3]:.3f}")`,
    quiz: [
      {
        q: r`Why does adding a completely random noise feature to a linear regression model always increase (or leave unchanged) the unadjusted $R^2$?`,
        o: [
          r`Because random noise always correlates with the target variable`,
          r`Because least squares minimises residual sum of squares over an expanded parameter space, making $SS_{\text{res}}$ weakly decrease`,
          r`Because degrees of freedom increase`,
          r`Because the F-statistic forces $R^2$ upward`,
        ],
        a: 1,
        why: r`Adding any column to $\mathbf{X}$ gives least squares an extra dimension to fit the training points, so $SS_{\text{res}}$ cannot increase and $R^2 = 1 - SS_{\text{res}} / SS_{\text{tot}}$ never decreases.`,
      },
      {
        q: r`What does a non-significant coefficient t-test ($p = 0.45$) for predictor $X_1$ strictly indicate in a multiple regression model?`,
        o: [
          r`$X_1$ has zero correlation with the response variable $Y$`,
          r`Given the other predictors already in the model, $X_1$ provides no statistically significant marginal explanatory power`,
          r`The entire regression model is statistically invalid`,
          r`$X_1$ should be replaced with its logarithm`,
        ],
        a: 1,
        why: r`Regression $t$-tests measure marginal significance conditioned on all other included variables; $X_1$ might have strong univariate correlation with $Y$, but be redundant in the presence of other features.`,
      },
      {
        q: r`Under what condition does adding a new explanatory variable cause the adjusted $R^2$ to increase?`,
        o: [
          r`Whenever the new variable has a positive slope`,
          r`Only when the new variable's individual $t$-statistic has $|t| > 1$`,
          r`Whenever sample size $n > 100$`,
          r`Adjusted $R^2$ always increases when features are added`,
        ],
        a: 1,
        why: r`Mathematically, adjusted $R^2$ increases if and only if the absolute $t$-statistic of the added variable exceeds 1.0 (or its partial $F$-statistic exceeds 1.0).`,
      },
      {
        q: r`In an OLS regression with 100 observations and 3 predictors (plus intercept), how many degrees of freedom does the residual variance estimator possess?`,
        o: [
          r`100`,
          r`97`,
          r`96`,
          r`3`,
        ],
        a: 2,
        why: r`Residual degrees of freedom are $n - p - 1 = 100 - 3 - 1 = 96$, where $p = 3$ is the number of predictors and 1 accounts for the intercept.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'polynomial_regression', 'regression-metrics'],
    prereq: ['hypothesis-testing-and-p-values', 'z-test-and-t-tests', 'anova-and-post-hoc-tests'],
    related: ['ols_linear_regression', 'residual-diagnostics-and-heteroscedasticity', 'multicollinearity-and-vif'],
    keywords: 'ols linear regression inference t-test f-test r-squared adjusted r-squared coefficients standard errors p-value',
  },
  {
    id: 'residual-diagnostics-and-heteroscedasticity',
    short: 'Residuals & Heteroscedasticity',
    title: r`Residual Diagnostics and Heteroscedasticity`,
    task: 'concepts',
    module: 'Regression inference',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Diagnose regression failure modes with residual plots, detect non-constant variance using the Breusch–Pagan test, and correct inference with robust standard errors.`,
    lead: r`The Gauss–Markov theorem guarantees that ordinary least squares estimators are the Best Linear Unbiased Estimator (BLUE) only when errors are homoscedastic and uncorrelated. When residual variance expands or contracts across predictor ranges (heteroscedasticity), OLS coefficient estimates remain unbiased, but standard errors become severely distorted, invalidating confidence intervals and hypothesis tests. Systematic residual diagnostics and White's heteroscedasticity-consistent standard errors restore valid statistical inference.`,
    intuition: [
      r`Imagine predicting annual household expenditure on restaurant dining based on household income. For families earning £25,000 per year, dining spending is tightly constrained between £500 and £1,500 (small error variance). For affluent families earning £250,000 per year, dining spending varies wildly: some families cook gourmet meals at home and spend £2,000, while others dine out constantly and spend £30,000 (huge error variance).`,
      r`If you plot residuals ($y - \hat{y}$) against fitted values $\hat{y}$, the points do not form a uniform horizontal band. Instead, they fan outward like an opening megaphone—classic heteroscedasticity.`,
      r`What is the danger? Standard OLS assumes every single data point has identical error variance $\sigma^2$. It treats high-income households (where noise is £15,000) with the exact same credibility as low-income households (where noise is £300). While the estimated slope is still unbiased on average, the standard OLS formula underestimates the true standard error, producing artificially narrow confidence intervals and falsely low p-values. A formal test like the Breusch–Pagan test regresses squared residuals against predictors: if variance scales with income, it yields a significant chi-square statistic ($p < 0.001$). Switching to Huber–White heteroscedasticity-robust standard errors (HC1) corrects the standard error without needing to throw away the linear model.`,
    ],
    analogy: r`Fitting standard OLS under heteroscedasticity is like judging an archer's skill on windy days and calm days equally: it mistakes erratic, windblown shots for reliable evidence unless you account for changing conditions.`,
    steps: [
      r`Fit the OLS regression model and compute raw residuals $e_i = y_i - \hat{y}_i$.`,
      r`Plot residuals against fitted values $\hat{y}_i$ to visually check for non-linearity (curved patterns) and heteroscedasticity (fan shapes).`,
      r`Plot standardised residuals against theoretical normal quantiles (Q-Q plot) to check for heavy-tailed or skewed errors.`,
      r`Perform the Breusch–Pagan test: regress squared residuals $e_i^2$ on predictors and compute the LM test statistic $n R^2 \sim \chi^2(p)$.`,
      r`If heteroscedasticity is detected, compute Huber–White heteroscedasticity-consistent (HC) sandwich covariance matrices (e.g. HC1).`,
      r`Alternatively, apply variance-stabilising transforms (such as $\log y$) or Weighted Least Squares (WLS) if variance weights are known.`,
    ],
    math: [
      {
        h: 'The Homoscedasticity Assumption vs Heteroscedasticity',
        tex: r`$$\text{Homoscedasticity: } \text{Var}(\epsilon_i \mid \mathbf{x}_i) = \sigma^2, \qquad \text{Heteroscedasticity: } \text{Var}(\epsilon_i \mid \mathbf{x}_i) = \sigma_i^2$$`,
        p: r`Under homoscedasticity, the covariance matrix of disturbances is $\boldsymbol{\Sigma} = \sigma^2 \mathbf{I}$, producing the classic textbook variance formula $\text{Var}(\hat{\boldsymbol{\beta}}) = \sigma^2 (\mathbf{X}^T\mathbf{X})^{-1}$. Under heteroscedasticity, the diagonal elements $\sigma_i^2$ vary, turning the true variance into the sandwich form $(\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\boldsymbol{\Sigma}\mathbf{X}(\mathbf{X}^T\mathbf{X})^{-1}$.`,
      },
      {
        h: 'The Breusch–Pagan Lagrange Multiplier Test',
        tex: r`$$e_i^2 = \gamma_0 + \gamma_1 x_{i1} + \dots + \gamma_p x_{ip} + u_i \implies \text{LM} = n R_{e^2}^2 \sim \chi^2(p)$$`,
        p: r`The Breusch–Pagan test fits an auxiliary regression of squared residuals $e_i^2$ on the original predictors. Under the null hypothesis of homoscedasticity ($H_0: \gamma_1 = \dots = \gamma_p = 0$), the sample size $n$ multiplied by the auxiliary determination coefficient $R_{e^2}^2$ converges asymptotically to a chi-square distribution with $p$ degrees of freedom.`,
      },
      {
        h: 'Huber–White Heteroscedasticity-Consistent (HC1) Standard Errors',
        tex: r`$$\widehat{\text{Var}}_{\text{HC1}}(\hat{\boldsymbol{\beta}}) = \frac{n}{n - p - 1} (\mathbf{X}^T\mathbf{X})^{-1} \left(\sum_{i=1}^n e_i^2 \mathbf{x}_i \mathbf{x}_i^T\right) (\mathbf{X}^T\mathbf{X})^{-1}$$`,
        p: r`The White sandwich estimator places squared sample residuals along the diagonal of the central "meat" matrix. Multiplying by degrees-of-freedom correction $\frac{n}{n - p - 1}$ yields HC1. This estimator converges asymptotically to the true covariance matrix without requiring knowledge of the functional form of heteroscedasticity.`,
      },
    ],
    keyPoints: [
      r`Heteroscedasticity does not bias OLS slope estimates; it invalidates standard error formulas, making confidence intervals and p-values untrustworthy.`,
      r`Residual-versus-fitted scatter plots serve as the primary diagnostic: homoscedastic errors display an even horizontal cloud with constant vertical spread.`,
      r`The Breusch–Pagan test provides an objective hypothesis test for linear variance dependence on predictors.`,
      r`Huber–White robust standard errors (HC1) fix inferential hypothesis testing without altering point estimates or discarding data.`,
    ],
    pitfalls: [
      r`Believing that heteroscedasticity makes regression coefficients biased; coefficients remain completely unbiased and consistent.`,
      r`Throwing away linear regression models upon detecting heteroscedasticity instead of reporting heteroscedasticity-robust standard errors.`,
      r`Running standard Breusch–Pagan tests on non-normal errors without Koenker's studentisation, which inflates false positive rates.`,
      r`Confusing non-linearity with heteroscedasticity: an omitted quadratic term often produces both a curved residual pattern and apparent variance changes.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n = 150

# Heteroscedastic data: error variance scales proportionally with x
x = rng.uniform(1.0, 10.0, size=n)
y = 2.0 + 3.0 * x + rng.normal(0.0, 0.8 * x, size=n)
X = np.column_stack([np.ones(n), x])

# OLS point estimates
beta = np.linalg.inv(X.T @ X) @ X.T @ y
e = y - X @ beta

# 1. Breusch-Pagan test for heteroscedasticity
e2 = e**2
beta_aux = np.linalg.inv(X.T @ X) @ X.T @ e2
r2_aux = 1.0 - np.sum((e2 - X @ beta_aux)**2) / np.sum((e2 - np.mean(e2))**2)
lm_stat = n * r2_aux
p_bp = 1.0 - stats.chi2.cdf(lm_stat, df=1)

# 2. Standard OLS SE vs Huber-White HC1 robust SE
cov_ols = (np.sum(e**2) / (n - 2)) * np.linalg.inv(X.T @ X)
cov_hc1 = (n / (n - 2)) * np.linalg.inv(X.T @ X) @ (X.T @ np.diag(e2) @ X) @ np.linalg.inv(X.T @ X)

se_ols = np.sqrt(np.diag(cov_ols))[1]
se_hc1 = np.sqrt(np.diag(cov_hc1))[1]

print(f"Breusch-Pagan LM: {lm_stat:.2f} (p-value: {p_bp:.4e})")
print(f"Slope beta_1:     {beta[1]:.3f}")
print(f"Standard OLS SE:  {se_ols:.3f}")
print(f"Robust HC1 SE:    {se_hc1:.3f}")`,
    quiz: [
      {
        q: r`What is the primary statistical consequence of ignoring heteroscedasticity in an OLS regression model?`,
        o: [
          r`The estimated regression coefficients become biased and inconsistent`,
          r`Standard errors are computed incorrectly, invalidating t-tests, confidence intervals, and p-values`,
          r`The model cannot compute fitted values`,
          r`The $R^2$ becomes negative`,
        ],
        a: 1,
        why: r`OLS coefficient estimates remain unbiased under heteroscedasticity, but the textbook formula for $\text{Var}(\hat{\boldsymbol{\beta}})$ is wrong, distorting standard errors and hypothesis tests.`,
      },
      {
        q: r`How does a classic residual-versus-fitted values plot look when heteroscedasticity is present?`,
        o: [
          r`A uniform rectangular band with constant vertical thickness`,
          r`A widening cone or funnel shape where vertical scatter expands across fitted values`,
          r`A single straight 45-degree diagonal line`,
          r`A circle centered at the origin`,
        ],
        a: 1,
        why: r`A widening cone (megaphone shape) indicates that error variance is not constant, but scales with the magnitude of predictions.`,
      },
      {
        q: r`What does the Breusch–Pagan test evaluate?`,
        o: [
          r`Whether the errors are normally distributed`,
          r`Whether squared residuals can be predicted by the independent variables, indicating non-constant variance`,
          r`Whether two predictors are collinear`,
          r`Whether the true relationship is non-linear`,
        ],
        a: 1,
        why: r`The Breusch–Pagan test regresses squared residuals on the explanatory variables; a significant $R^2$ demonstrates that error variance depends on predictor values.`,
      },
      {
        q: r`How do Huber–White robust standard errors (HC1) resolve the problem of heteroscedasticity?`,
        o: [
          r`They delete outliers from the dataset`,
          r`They recalculate the parameter covariance matrix using a sandwich estimator that provides asymptotically consistent standard errors without changing point estimates`,
          r`They force residuals to follow a normal distribution`,
          r`They apply a polynomial transformation to $Y$`,
        ],
        a: 1,
        why: r`Huber–White sandwich estimators substitute squared sample residuals into the covariance calculation, restoring consistent standard errors without altering regression coefficients.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'robust_regression'],
    prereq: ['ols-inference-t-tests-f-test-r2-and-adjusted-r2', 'normality-tests-shapiro-wilk-kolmogorov-smirnov-anderson-darling'],
    related: ['ols_linear_regression', 'multicollinearity-and-vif', 'robust_regression'],
    keywords: 'residual diagnostics heteroscedasticity breusch pagan test robust standard errors huber white hc1 sandwich estimator homoscedasticity',
  },
  {
    id: 'multicollinearity-and-vif',
    short: 'Multicollinearity & VIF',
    title: r`Multicollinearity and VIF`,
    task: 'concepts',
    module: 'Regression inference',
    level: 2,
    minutes: 17,
    noLab: true,
    summary: r`Diagnose redundant predictor correlations in regression models using the Variance Inflation Factor and condition indices.`,
    lead: r`When two or more explanatory variables in a multiple regression model are strongly correlated with each other, ordinary least squares faces multicollinearity. While multicollinearity does not reduce the model's overall predictive capacity, it inflates coefficient variances dramatically, turning regression estimates erratic, unstable, and uninterpretable. The Variance Inflation Factor (VIF) quantifies how much parameter variance is magnified by linear dependencies among predictors.`,
    intuition: [
      r`Imagine an athletic trainer building a regression model to predict sprinting speed using two features: left leg length and right leg length. Naturally, an athlete's left leg and right leg lengths are almost perfectly correlated ($r = 0.957$).`,
      r`When both variables enter the regression simultaneously, least squares attempts to answer: "What is the effect of lengthening the left leg while keeping the right leg length strictly fixed?" Because this scenario is physically impossible in the data, the algorithm cannot partition credit between the two limbs. The model might assign $+15.0$ to the left leg and $-14.2$ to the right leg. The overall model predicts sprint speed reasonably well, but the standard errors on both coefficients balloon dramatically. Both $t$-statistics drop to near zero, giving non-significant p-values.`,
      r`An analyst inspecting the p-values might naively conclude that neither leg matters for sprinting! This is the essence of multicollinearity. It does not mean the features lack predictive power; it means the features share redundant information, making it impossible to isolate individual effects. The Variance Inflation Factor (VIF) measures how much the variance of an estimated slope is inflated compared to when predictors are orthogonal. A VIF of 1 means zero collinearity; a VIF of 11.77 means variance is inflated nearly twelve-fold. Dropping one redundant leg from the model instantly collapses VIF and restores stable, significant estimates.`,
    ],
    analogy: r`Multicollinearity is like two singers harmonizing into the exact same microphone: the audience hears a rich sound, but the sound engineer cannot determine which singer was singing louder.`,
    steps: [
      r`Examine the pairwise correlation matrix of all predictors to identify obvious bivariate correlations ($|r| > 0.8$).`,
      r`For each predictor $X_j$, fit an auxiliary OLS regression predicting $X_j$ from all remaining $p - 1$ predictors.`,
      r`Extract the auxiliary determination coefficient $R_j^2$ from the auxiliary regression.`,
      r`Compute the Variance Inflation Factor: $\text{VIF}_j = \frac{1}{1 - R_j^2}$.`,
      r`Evaluate VIF against diagnostic thresholds: $\text{VIF} = 1$ is orthogonal, $\text{VIF} > 5$ warrants caution, and $\text{VIF} > 10$ indicates severe, harmful multicollinearity.`,
      r`Remediate collinearity: remove redundant features, combine correlated features via dimensionality reduction, or apply ridge regularisation.`,
    ],
    math: [
      {
        h: 'Variance Inflation Factor Formula',
        tex: r`$$\text{Var}(\hat{\beta}_j) = \frac{\sigma^2}{(n - 1)s_j^2} \cdot \frac{1}{1 - R_j^2} = \frac{\sigma^2}{(n - 1)s_j^2} \cdot \text{VIF}_j$$`,
        p: r`Here $\sigma^2$ is the residual variance, $s_j^2$ is the sample variance of predictor $X_j$, and $R_j^2$ is the coefficient of determination obtained by regressing $X_j$ on all other predictors. $\text{VIF}_j$ directly measures the factor by which the variance of $\hat{\beta}_j$ is multiplied due to correlation with other explanatory variables.`,
      },
      {
        h: 'Tolerance and Condition Number',
        tex: r`$$\text{Tolerance}_j = \frac{1}{\text{VIF}_j} = 1 - R_j^2, \qquad \kappa(\mathbf{X}^T\mathbf{X}) = \sqrt{\frac{\lambda_{\max}}{\lambda_{\min}}}$$`,
        p: r`Tolerance expresses the fraction of variance in $X_j$ that is unique and independent of all other predictors; a tolerance below $0.10$ signifies $\text{VIF} > 10$. The condition number $\kappa$ evaluates the ratio of maximum to minimum eigenvalues of $\mathbf{X}^T\mathbf{X}$; $\kappa > 30$ indicates severe ill-conditioning and numerical instability in matrix inversion.`,
      },
      {
        h: 'Regularisation as a Collinearity Remedy',
        tex: r`$$\hat{\boldsymbol{\beta}}_{\text{ridge}} = \left(\mathbf{X}^T\mathbf{X} + \lambda \mathbf{I}\right)^{-1}\mathbf{X}^T\mathbf{y}$$`,
        p: r`When predictors are collinear, $\mathbf{X}^T\mathbf{X}$ is nearly singular with eigenvalues near zero, causing $(\mathbf{X}^T\mathbf{X})^{-1}$ to explode. Ridge regression adds a positive constant $\lambda$ along the diagonal, bounding eigenvalues away from zero and dramatically contracting parameter variance.`,
      },
    ],
    keyPoints: [
      r`Multicollinearity does not bias OLS slope estimates or reduce overall $R^2$; it inflates standard errors and makes individual coefficients erratic and uninterpretable.`,
      r`High pairwise correlation signals collinearity, but multi-variable collinearity can also emerge from linear combinations of three or more variables with low pairwise correlations.`,
      r`VIF quantifies the degree of variance inflation; $\text{VIF} > 10$ is the standard empirical threshold denoting severe collinearity.`,
      r`Regularisation techniques like [[ridge_regression]] directly resolve multicollinearity by trading small bias for large variance reduction.`,
    ],
    pitfalls: [
      r`Dropping important control variables from a causal model without verifying whether their omission creates omitted variable bias.`,
      r`Relying exclusively on pairwise correlation matrices, failing to detect multi-variable collinearity where $X_1 \approx X_2 + X_3$.`,
      r`Believing that multicollinearity degrades out-of-sample prediction accuracy when test data follows the same joint predictor distribution.`,
      r`Confusing multicollinearity (linear dependence among features) with high correlation between features and the target label.`,
    ],
    code: r`import numpy as np
import scipy.stats as stats

rng = np.random.default_rng(42)
n = 100

# Collinear features x1 and x2 (r ~ 0.968) and independent feature x3
x1 = rng.normal(loc=10.0, scale=2.0, size=n)
x2 = x1 + rng.normal(loc=0.0, scale=0.5, size=n)
x3 = rng.normal(loc=5.0, scale=1.5, size=n)

X_all = np.column_stack([x1, x2, x3])
vifs = []

# Compute VIF for each predictor via auxiliary regressions
for j in range(3):
    y_aux = X_all[:, j]
    X_others = np.column_stack([np.ones(n), np.delete(X_all, j, axis=1)])
    b_aux = np.linalg.inv(X_others.T @ X_others) @ X_others.T @ y_aux
    res_aux = y_aux - X_others @ b_aux
    r2_j = 1.0 - np.sum(res_aux**2) / np.sum((y_aux - np.mean(y_aux))**2)
    vifs.append(1.0 / (1.0 - r2_j))

r_12, _ = stats.pearsonr(x1, x2)
print(f"Pairwise correlation r(x1, x2): {r_12:.3f}")
print(f"VIF x1: {vifs[0]:.2f} (severe collinearity)")
print(f"VIF x2: {vifs[1]:.2f} (severe collinearity)")
print(f"VIF x3: {vifs[2]:.2f} (orthogonal)")`,
    quiz: [
      {
        q: r`What is the primary consequence of multicollinearity in an ordinary least squares regression?`,
        o: [
          r`The model's overall $R^2$ collapses to zero`,
          r`Coefficient variances and standard errors are inflated, making individual slope estimates erratic and unstable`,
          r`The regression coefficients become systematically biased`,
          r`Residuals no longer sum to zero`,
        ],
        a: 1,
        why: r`Multicollinearity does not bias estimates or reduce $R^2$, but inflates coefficient variances, leading to wide confidence intervals and non-significant t-tests.`,
      },
      {
        q: r`If an auxiliary regression of predictor $X_j$ on all other predictors yields $R_j^2 = 0.90$, what is the Variance Inflation Factor $\text{VIF}_j$?`,
        o: [
          r`0.9`,
          r`1.0`,
          r`10.0`,
          r`90.0`,
        ],
        a: 2,
        why: r`$\text{VIF}_j = \frac{1}{1 - R_j^2} = \frac{1}{1 - 0.90} = \frac{1}{0.10} = 10.0$.`,
      },
      {
        q: r`Why does Ridge regression effectively resolve numerical problems caused by severe multicollinearity?`,
        o: [
          r`It removes correlated variables from the dataset completely`,
          r`It adds a penalty $\lambda \mathbf{I}$ to $\mathbf{X}^T\mathbf{X}$, bounding eigenvalues away from zero and stabilising matrix inversion`,
          r`It converts continuous variables into discrete categories`,
          r`It forces all slopes to be positive`,
        ],
        a: 1,
        why: r`Adding $\lambda \mathbf{I}$ guarantees that the eigenvalues of $\mathbf{X}^T\mathbf{X} + \lambda \mathbf{I}$ are at least $\lambda > 0$, preventing matrix singularity and shrinking inflated variances.`,
      },
      {
        q: r`Why is inspecting only the pairwise correlation matrix insufficient to rule out multicollinearity?`,
        o: [
          r`Because correlation matrices cannot be computed for more than two variables`,
          r`Because multicollinearity can arise from linear combinations of three or more variables even when all pairwise correlations are moderate`,
          r`Because Pearson correlation is insensitive to linear relationships`,
          r`Because pairwise correlation depends on sample size`,
        ],
        a: 1,
        why: r`Three or more variables can be almost perfectly collinear ($X_1 \approx X_2 + X_3$) even when each individual pairwise correlation is modest (e.g. $r \approx 0.5$). VIF detects this multi-variable dependence.`,
      },
    ],
    usedBy: ['ols_linear_regression', 'ridge_regression'],
    prereq: ['ols-inference-t-tests-f-test-r2-and-adjusted-r2', 'correlation-pearson-spearman-kendall'],
    related: ['ols_linear_regression', 'ridge_regression', 'feature-selection'],
    keywords: 'multicollinearity vif variance inflation factor tolerance condition number ridge regression collinear predictors auxiliary regression',
  },
];
