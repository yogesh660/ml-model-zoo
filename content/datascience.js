// Lessons for this track. Conventions: see regression.js and CLAUDE.md.
const r = String.raw;

module.exports = [
  {
    id: 'sql-for-analysis-joins-and-window-functions',
    short: 'SQL joins & window functions',
    title: 'SQL for Analysis: Joins and Window Functions',
    task: 'concepts',
    module: 'Data wrangling',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Expressing complex relational logic with declarative SQL joins and analytical window partitions without collapsing row granularity.`,
    lead: r`Data extraction for machine learning and analytics rarely begins with clean flat files. Relational data stores demand sophisticated joins to link entity tables and window functions to compute running totals, temporal lags, and rank orders without collapsing row granularity. Mastering set-based query execution prevents insidious silent data duplication and preserves temporal integrity.`,
    intuition: [
      r`Imagine working at a retail bank where customer records live in one table and daily account transactions live in another. To calculate each customer's lifetime transaction balance, a standard GROUP BY customer_id works fine, collapsing hundreds of individual receipts into a single summary row per customer. But what if you need to know how each individual transaction compares to that customer's rolling 30-day average, or how long elapsed since their previous deposit? A standard GROUP BY destroys the individual transaction rows, making it impossible to evaluate transaction-level anomalies.`,
      r`Window functions solve this dilemma by performing calculations across a set of related table rows (the window) while keeping every original row intact in the output. Using the OVER (PARTITION BY customer_id ORDER BY transaction_date) clause, the database segments data into independent customer buckets, sorts transactions chronologically, and slides a calculation frame across them. Functions like LAG() look directly into previous rows to calculate inter-transaction arrival times, while ROW_NUMBER() or DENSE_RANK() index sequences for deduplication.`,
      r`Joining tables introduces another critical hazard: cardinality explosion. An INNER JOIN preserves only matching keys, an OUTER JOIN retains unattached records by padding with NULLs, and a LEFT JOIN keeps all left-hand records. However, if the joining key has non-unique duplicates on the right (e.g. joining customer accounts to multiple shipping addresses without filtering), the join silently multiplies rows ($m \times n$ Cartesian explosion), inflating downstream aggregates like sum of revenue and silently distorting predictive model features.`,
    ],
    analogy: r`Running a transparent magnifying glass along an organised chronological paper ledger to compute running totals in the margin, without cutting or combining any receipts.`,
    steps: [
      r`Inspect join key uniqueness: verify whether primary and foreign keys have 1-to-1, 1-to-many, or many-to-many cardinality before writing the JOIN predicate.`,
      r`Choose the appropriate join type: use LEFT JOIN to retain base observational cohorts with unattached entities, filtering NULLs explicitly where required.`,
      r`Formulate the window specification: define PARTITION BY to establish the boundary of aggregation (e.g. per user or per product category).`,
      r`Specify chronological ordering with ORDER BY inside the window clause to ensure deterministic sequential calculations (mandatory for LAG, LEAD, and running sums).`,
      r`Define the frame clause (ROWS BETWEEN ... PRECEDING AND CURRENT ROW) to prevent future leakage when computing rolling historical metrics for time-series and predictive modelling.`,
    ],
    math: [
      {
        h: 'Relational join cardinality and Cartesian expansion',
        tex: r`$$|R \bowtie_{R.k = S.k} S| = \sum_{v \in \text{dom}(k)} n_R(v) \cdot n_S(v)$$`,
        p: r`Here $n_R(v)$ and $n_S(v)$ are the occurrence counts of key value $v$ in tables $R$ and $S$. When key $v$ is non-unique in both tables ($n_R(v) > 1, n_S(v) > 1$), row counts expand multiplicatively, distorting downstream counts and metric sums.`,
      },
      {
        h: 'Window partition aggregation operator',
        tex: r`$$W_f(t) = f\Big(\{u \in R \mid \text{part}(u) = \text{part}(t) \;\wedge\; u \in \text{frame}(t)\}\Big)$$`,
        p: r`For each row $t$, $\text{part}(t)$ identifies its partition subset, $\text{frame}(t)$ defines the active evaluation window (e.g. preceding rows), and $f$ is the analytic operator (SUM, AVG, RANK). Crucially, row $t$ retains its distinct identity and granularity in the output relation.`,
      },
      {
        h: 'Discrete relative rank and dense rank',
        tex: r`$$\text{rank}(t) = 1 + \sum_{u \in \text{part}(t)} \mathbf{1}_{\text{ord}(u) < \text{ord}(t)}, \qquad \text{dense\_rank}(t) = 1 + \big|\{\text{ord}(u) \mid u \in \text{part}(t), \text{ord}(u) < \text{ord}(t)\}\big|$$`,
        p: r`Here $\text{ord}(t)$ represents the sorting key. Standard RANK() leaves gaps after duplicate ties (e.g. ranks 1, 2, 2, 4), whereas DENSE_RANK() advances sequentially without skipping integer positions (1, 2, 2, 3), making it preferable for pagination and top-$k$ filtering.`,
      },
    ],
    keyPoints: [
      r`Retention of row granularity: window functions evaluate aggregate statistics across partitions while preserving individual transaction-level rows.`,
      r`Join cardinality awareness: many-to-many joins silently duplicate rows, artificially inflating metrics and distorting model training sets.`,
      r`Leakage-safe framing: rolling window queries for machine learning must strictly bound frame windows to ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to avoid future leakage.`,
    ],
    pitfalls: [
      r`Accidental Cartesian fan-out: joining on non-unique columns causes row explosion, quietly multiplying calculated revenues and counts.`,
      r`Default window framing trap: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW treats identical timestamp ties as simultaneous, grouping them together instead of calculating row-by-row.`,
      r`NULL handling in joins: NULL = NULL evaluates to UNKNOWN in SQL three-valued logic, causing equality join conditions to drop matching NULL rows unless explicit IS NOT DISTINCT FROM is specified.`,
    ],
    code: r`import sqlite3

conn = sqlite3.connect(":memory:")
c = conn.cursor()
c.executescript("""
CREATE TABLE users (user_id INT, tier TEXT);
INSERT INTO users VALUES (101, 'Gold'), (102, 'Silver'), (103, 'Bronze');
CREATE TABLE tx (tx_id INT, user_id INT, amount REAL, dt TEXT);
INSERT INTO tx VALUES (1, 101, 50.0, '2026-01-01'), (2, 101, 120.0, '2026-01-03'),
                      (3, 102, 200.0, '2026-01-02'), (4, 101, 30.0, '2026-01-06');
""")

query = """
SELECT u.user_id, u.tier, t.dt, COALESCE(t.amount, 0.0) AS amt,
       SUM(t.amount) OVER (PARTITION BY u.user_id ORDER BY t.dt
                           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_amt,
       LAG(t.amount, 1, 0.0) OVER (PARTITION BY u.user_id ORDER BY t.dt) AS prev_amt
FROM users u
LEFT JOIN tx t ON u.user_id = t.user_id
ORDER BY u.user_id, t.dt;
"""
for row in c.execute(query).fetchall():
    print(row)`,
    quiz: [
      {
        q: r`What is the primary difference between an analytical window function and a standard GROUP BY aggregation?`,
        o: [
          r`Window functions calculate aggregates across partitions while preserving individual row granularity, whereas GROUP BY collapses rows into single summaries`,
          r`Window functions can only be executed on integer columns`,
          r`GROUP BY requires an indexed primary key, whereas window functions do not`,
          r`Window functions modify the underlying table on disk, whereas GROUP BY creates a temporary view`,
        ],
        a: 0,
        why: r`Standard GROUP BY collapses all rows belonging to a group into a single summary row. A window function computes the aggregate across the partition while returning every original row with its computed window value attached.`,
      },
      {
        q: r`When joining two tables where the join key appears 3 times in table A and 4 times in table B, how many rows will an INNER JOIN generate for that specific key?`,
        o: [
          r`12 rows`,
          r`7 rows`,
          r`4 rows`,
          r`3 rows`,
        ],
        a: 0,
        why: r`Relational joins perform a Cartesian product over matching key values. A key with 3 occurrences in table A and 4 occurrences in table B yields $3 \times 4 = 12$ rows, potentially multiplying metric sums by 4.`,
      },
      {
        q: r`Why is it critical to specify ROWS BETWEEN ... PRECEDING AND CURRENT ROW rather than relying on default window framing when computing rolling features for ML?`,
        o: [
          r`The default RANGE frame groups identical timestamp values together as ties, which can cause lookahead leakage across equal timestamps`,
          r`The default frame clause causes SQL syntax errors in relational engines`,
          r`ROWS framing automatically imputes missing NULL values with zero`,
          r`RANGE framing restricts the window calculation to a maximum of 10 rows`,
        ],
        a: 0,
        why: r`In standard SQL, specifying ORDER BY without an explicit frame defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. When multiple rows share the same order timestamp, RANGE includes all peer rows up to the end of the tie group, leaking concurrent or future information.`,
      },
    ],
    usedBy: ['pandas-and-polars-patterns', 'data-cleaning-and-validation'],
    prereq: ['sampling-and-standard-error', 'cross-validation'],
    related: ['pandas-and-polars-patterns', 'data-cleaning-and-validation', 'missing-data-mcar-mar-mnar-and-imputation'],
    keywords: 'sql window functions joins left join inner join partition by lead lag dense rank relational database analytical sql',
  },
  {
    id: 'pandas-and-polars-patterns',
    short: 'pandas & Polars patterns',
    title: 'pandas and Polars Patterns',
    task: 'concepts',
    module: 'Data wrangling',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Modern idiomatic tabular data manipulation, contrasting pandas eager in-memory index model with Polars lazy, multithreaded query optimisation.`,
    lead: r`Tabular data wrangling in Python has evolved from imperative loops and fragmented pandas operations to declarative expression chains and columnar execution engines. While pandas relies on an eager, index-oriented memory model, Polars uses Apache Arrow memory layouts and a Rust query engine to evaluate lazy expressions in parallel with query optimisation. Choosing the right paradigms eliminates copy overhead and prevents out-of-memory crashes on multi-gigabyte datasets.`,
    intuition: [
      r`Imagine preparing a complex five-course dinner from a written recipe. In an eager cooking approach, as soon as step 1 says "slice ten onions", you slice all ten, put them in a bowl, and store them. When step 2 says "dice ten potatoes", you dice all ten and store them. By step 4, your kitchen counter is overflowing with bowls of prepared food, consuming all available space. If step 5 suddenly says "throw away half the vegetables because only five portions are needed", all that earlier slicing and storage was completely wasted effort.`,
      r`This is eager execution, the default mode of pandas. Every intermediate transformation immediately allocates a new DataFrame in memory and computes values sequentially on a single CPU core. If your initial CSV is 5 GB, chaining three intermediate transformations can demand 20 GB of RAM, triggering an Out-of-Memory (OOM) operating system crash. Furthermore, pandas relies heavily on custom Index structures that add overhead and complicate joins.`,
      r`Polars introduces lazy execution and expression-based pipelining. Instead of executing transformations step by step, Polars builds a directed acyclic graph (logical plan) of the intended operations. When you call .collect(), the query optimiser inspects the entire graph: it pushes filters down to the file scan so unnecessary rows are never read from disk (predicate pushdown), discards unused columns before parsing (projection pushdown), and parallelises group aggregations across all CPU cores using lock-free Apache Arrow arrays.`,
    ],
    analogy: r`Handing an entire blueprint to an architect who reorganises the steps for maximum speed and minimum materials, rather than hiring bricklayers who immediately pour concrete before the site is cleared.`,
    steps: [
      r`Define pipelines using declarative method chaining rather than imperative for-loops or in-place mutations.`,
      r`Select columnar expressions: in Polars, leverage pl.col() to express parallel column projections without intermediate DataFrame copies.`,
      r`Construct a lazy query plan (df.lazy()) when processing large datasets, inspecting the execution strategy with .explain().`,
      r`Enable predicate and projection pushdowns by filtering rows and selecting target columns before resource-intensive joins or group-bys.`,
      r`Trigger execution via .collect(), converting query outputs back to eager memory only when final tabular results or ML features are required.`,
    ],
    math: [
      {
        h: 'Columnar contiguous memory addressing vs row-major stride',
        tex: r`$$\text{Address}(\text{col}_j, \text{row}_i) = \text{Base}_j + i \cdot w$$`,
        p: r`In Apache Arrow and Polars columnar memory layout, values for column $j$ are stored in a contiguous memory block with uniform byte width $w$. SIMD CPU vectorisation loads contiguous elements in single cache lines without cache misses, whereas row-major formats require strided memory jumps.`,
      },
      {
        h: 'Predicate pushdown filter reduction',
        tex: r`$$\text{Memory}_{\text{lazy}} = \int_{\sigma_P(D)} dD = \rho \cdot \text{Memory}_{\text{eager}}, \qquad \rho = \frac{|\sigma_P(D)|}{|D|} \ll 1$$`,
        p: r`Predicate pushdown applies selection condition $P$ directly at the storage scan layer ($\sigma_P(D)$). If only $5\%$ of rows match the filter ($\rho = 0.05$), $95\%$ of raw bytes are never loaded into memory, avoiding memory exhaustion during joins and aggregations.`,
      },
      {
        h: 'Multithreaded partition speedup (Amdahl\'s Law)',
        tex: r`$$S(p) = \frac{1}{(1 - f) + \frac{f}{p}}$$`,
        p: r`Here $p$ is the number of CPU execution cores and $f$ is the fraction of embarrassingly parallel partition hash calculations. Polars leverages lock-free chunked Arrow arrays to execute partition hash maps in parallel across all $p$ threads, delivering near-linear throughput scaling over single-threaded pandas.`,
      },
    ],
    keyPoints: [
      r`Declarative expressions: writing operations as functional expressions allows execution engines to reorder and optimise query evaluation plans.`,
      r`Arrow memory standard: contiguous columnar formats minimise memory fragmentation and enable zero-copy sharing between tools.`,
      r`Eager vs lazy distinction: eager systems compute intermediate tables immediately; lazy systems compile and optimise the execution plan before execution.`,
    ],
    pitfalls: [
      r`Iterating over rows with Python for-loops: row iteration in pandas is 100 to 1,000 times slower than vectorised columnar operations.`,
      r`SettingWithCopyWarning: modifying sliced pandas views without explicit .copy() causes unpredictable silent assignment failures.`,
      r`High memory churn from chained eager copies: calling multiple .drop() or .fillna() steps in eager pandas duplicates full DataFrames in RAM.`,
    ],
    code: r`import numpy as np

# Columnar representation: contiguous 1D arrays (Apache Arrow / Polars memory model)
data = {
    'user_id': np.array([101, 101, 102, 101, 102, 103]),
    'amount': np.array([45.0, 120.0, 80.0, 30.0, 150.0, 20.0]),
    'active': np.array([True, True, True, False, True, False]),
}

# Declarative expression: predicate pushdown + vectorised aggregation
# Filter active transactions > $40, then group sum by user_id
mask = data['active'] & (data['amount'] > 40.0)
filtered_users = data['user_id'][mask]
filtered_amts = data['amount'][mask]

# Group-by hash aggregation without python loops
unique_users, inverse_idx = np.unique(filtered_users, return_inverse=True)
group_sums = np.bincount(inverse_idx, weights=filtered_amts)

print(f"Total rows: {len(data['user_id'])}, Filtered rows: {np.sum(mask)}")
for u, s in zip(unique_users, group_sums):
    print(f"User {u}: aggregated total = {s:.2f}")`,
    quiz: [
      {
        q: r`Why does Polars lazy execution (LazyFrame) consume significantly less memory than pandas on large datasets?`,
        o: [
          r`It optimises the query plan, pushing filters down to the file scan so unnecessary rows and columns are never loaded into RAM`,
          r`It stores all numbers as 8-bit integers`,
          r`It executes calculations on a remote cloud cluster automatically`,
          r`It converts all text data into binary booleans`,
        ],
        a: 0,
        why: r`Polars query optimiser inspects the complete computation graph before execution, applying predicate pushdown (reading only rows that match filter criteria) and projection pushdown (loading only referenced columns), dramatically slashing memory usage.`,
      },
      {
        q: r`Why is iterating over DataFrame rows with a Python for-loop considered an anti-pattern in tabular data engineering?`,
        o: [
          r`Python-level loops bypass vectorised CPU instructions and Arrow memory locality, running up to 1,000 times slower`,
          r`Python loops cause the underlying CSV files to become read-only`,
          r`Python loops can only process up to 256 rows before overflowing`,
          r`Python loops automatically delete missing NULL values`,
        ],
        a: 0,
        why: r`Vectorised operations and expression engines dispatch batch operations directly to compiled C/Rust kernels using SIMD instructions. Python row iterations incur Python interpreter overhead and pointer indirection on every single cell.`,
      },
      {
        q: r`What causes the infamous SettingWithCopyWarning in pandas?`,
        o: [
          r`Modifying a DataFrame slice where pandas cannot determine if the slice is an independent copy or a view of original memory`,
          r`Writing a DataFrame to disk without specifying an index column`,
          r`Joining two tables with differing column numbers`,
          r`Sorting a DataFrame without ascending=True`,
        ],
        a: 0,
        why: r`Chained indexing like df[mask]['col'] = val creates ambiguity over whether the slice is a view or a copy. If it is a copy, mutations silently discard changes without updating the parent DataFrame.`,
      },
    ],
    usedBy: ['data-cleaning-and-validation'],
    prereq: ['sql-for-analysis-joins-and-window-functions'],
    related: ['sql-for-analysis-joins-and-window-functions', 'data-cleaning-and-validation', 'missing-data-mcar-mar-mnar-and-imputation'],
    keywords: 'pandas polars dataframe arrow columnar query optimisation lazy execution method chaining vectorisation',
  },
  {
    id: 'data-cleaning-and-validation',
    short: 'Data cleaning & validation',
    title: 'Data Cleaning and Validation',
    task: 'concepts',
    module: 'Data wrangling',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Systematic detection and correction of corrupted records, schema violations, invalid ranges, and duplicate keys before feature pipelines.`,
    lead: r`Machine learning pipelines follow a strict rule: garbage in, garbage out. Raw enterprise data arrives riddled with duplicated keys, negative ages, invalid categorical codes, and subtle floating-point corruptions. Establishing declarative data contracts and automated validation assertions verifies structural integrity and prevents silent predictive model degradation.`,
    intuition: [
      r`Imagine a flight reservation database where passenger age is stored as free-form user input. A passenger enters their birth year "1994" into the age field, another writes "-1" to indicate unknown, another enters "250", and a typo inputs "0". If you feed this raw column directly into a gradient boosted tree or linear model without validation, the model might infer that customers who are 1,994 years old never default on tickets or that negative age reduces churn. A single unvalidated anomalous value distorts split thresholds across hundreds of decision trees.`,
      r`Data cleaning is not about haphazardly deleting rows whenever an error appears; it is a systematic auditing process. We divide validation into four progressive tiers: structural schema validation (checking data types and non-null constraints), range and domain validation (asserting that probabilities lie in $[0, 1]$ and ages in $[0, 120]$), cross-field relational consistency (checking that checkout_date $\ge$ checkin_date), and distributional sanity (detecting sudden spikes in duplicate identifiers or category cardinality drift).`,
      r`In production machine learning, data cleaning should be encoded as explicit, automated assertions—data contracts—often using tools like Great Expectations, Pandera, or Pydantic. Instead of silently patching bad rows with ad-hoc heuristics, data contracts flag schema regressions at the ingestion boundary, distinguishing between recoverable sensor drift that requires imputation and upstream API pipeline breakages that require hard alerts.`,
    ],
    analogy: r`A stringent customs inspection checkpoint at an international port that verifies passports, weights, and cargo manifests before any shipping container enters the domestic highway system.`,
    steps: [
      r`Profile raw ingestion data: compute frequency tables, missingness percentages, uniqueness ratios, and quantile distributions.`,
      r`Validate schema and constraints: assert column existence, expected data types, and primary key uniqueness.`,
      r`Enforce domain and range boundaries: check that continuous variables fall within plausible physiological or physical bounds.`,
      r`Verify cross-column relational rules: check multi-attribute dependencies (e.g. cancellation_date can only exist if is_cancelled is True).`,
      r`Quarantine corrupted records into an audit dead-letter queue, separating recoverable values from fatal schema breaks.`,
    ],
    math: [
      {
        h: 'Primary key uniqueness ratio',
        tex: r`$$U(k) = \frac{|\text{distinct}(k)|}{|R|}$$`,
        p: r`The uniqueness ratio measures distinct candidate key occurrences relative to total row count $|R|$. A valid primary key demands $U(k) = 1.0$. Ratios strictly below $1.0$ indicate duplicate entity keys, which cause row-multiplication errors in downstream joins.`,
      },
      {
        h: 'Modified Z-score for robust anomaly detection',
        tex: r`$$M_i = \frac{0.6745 \cdot |x_i - \text{median}(X)|}{\text{MAD}(X)}, \qquad \text{MAD}(X) = \text{median}\big(|x_i - \text{median}(X)|\big)$$`,
        p: r`Standard z-scores fail because extreme outliers distort both the sample mean and variance. The modified Z-score uses the median and Median Absolute Deviation (MAD). Observations with $|M_i| > 3.5$ are flagged as robust statistical anomalies without suffering masking effects.`,
      },
      {
        h: 'Schema constraint satisfaction rate',
        tex: r`$$\text{CSR} = \frac{1}{N \cdot M} \sum_{i=1}^N \sum_{j=1}^M \mathbf{1}_{\mathcal{C}_j(x_{i, j})}$$`,
        p: r`The constraint satisfaction rate measures the fraction of dataset elements that satisfy assigned validation rules $\mathcal{C}_j$. Production data contracts enforce strict gating thresholds (e.g. $\text{CSR} \ge 0.999$) to halt pipeline execution upon upstream schema corruption.`,
      },
    ],
    keyPoints: [
      r`Declarative data contracts: validate data boundaries at ingestion before downstream transformations hide corruptions.`,
      r`Robust anomaly detection: use median-based statistics (MAD) rather than mean and standard deviation to detect invalid ranges resistant to extreme outliers.`,
      r`Deduplication strategy: define deterministic tie-breaking logic (e.g. latest updated_at timestamp) when removing duplicated keys.`,
    ],
    pitfalls: [
      r`Silent drop disaster: automatically dropping all rows with validation errors without logging shrinks sample sizes and introduces severe selection bias.`,
      r`Overfitting validation rules to training samples: setting min/max boundaries strictly to current historical bounds causes future valid seasonal extremes to fail.`,
      r`Ignoring silent type coercion: parsing string "None" or "N/A" as string text rather than NaN bypasses null checks.`,
    ],
    code: r`import numpy as np

# Seeded raw batch: [user_id, age, income, is_active]
raw_data = np.array([
    [101, 28, 55000, 1],
    [102, -5, 62000, 1],   # Invalid age (-5)
    [103, 42, 85000, 0],
    [101, 28, 55000, 1],   # Duplicate user_id (101)
    [104, 35, -1200, 1],   # Invalid income (-1200)
    [105, 190, 72000, 1],  # Impossible age (190)
], dtype=float)

n_rows = len(raw_data)
v_age = (raw_data[:, 1] >= 0) & (raw_data[:, 1] <= 120)
v_income = raw_data[:, 2] >= 0
_, first_idx = np.unique(raw_data[:, 0], return_index=True)
v_unique = np.zeros(n_rows, dtype=bool)
v_unique[first_idx] = True

valid_mask = v_age & v_income & v_unique
clean_data = raw_data[valid_mask]
rejected_data = raw_data[~valid_mask]

print(f"Total raw records: {n_rows}")
print(f"Passed validation: {len(clean_data)} ({len(clean_data)/n_rows*100:.1f}%)")
print(f"Rejected records: {len(rejected_data)}")
print(f" - Invalid age: {np.sum(~v_age)} rows")
print(f" - Negative income: {np.sum(~v_income)} rows")
print(f" - Duplicate keys: {np.sum(~v_unique)} rows")`,
    quiz: [
      {
        q: r`Why is Median Absolute Deviation (MAD) preferred over standard deviation when validating numeric bounds for outlier detection?`,
        o: [
          r`Extreme outliers pull the sample mean and inflate the standard deviation, masking genuine anomalies; the median and MAD remain robust`,
          r`MAD can only be computed on categorical data`,
          r`Standard deviation requires the dataset to have an odd number of rows`,
          r`MAD runs in $O(1)$ constant time on distributed clusters`,
        ],
        a: 0,
        why: r`A single extreme anomaly (e.g. age entered as 9999) heavily inflates the standard deviation, expanding the normal acceptance envelope so widely that other errors pass undetected. The median and MAD have a 50% breakdown point, resisting outlier corruption.`,
      },
      {
        q: r`What is a major risk of automatically dropping all rows that fail validation checks without logging or quarantine?`,
        o: [
          r`It introduces severe selection bias by systematically discarding specific customer segments without alert`,
          r`It converts all numeric columns to floating-point numbers`,
          r`It causes the database storage engine to crash`,
          r`It forces models to overfit on duplicate rows`,
        ],
        a: 0,
        why: r`Silently dropping failed rows hides upstream sensor or API breakages and creates survivorship bias. For instance, if an updated mobile app sends a new currency format that fails validation, all mobile users are quietly erased from the dataset.`,
      },
      {
        q: r`In production machine learning systems, where should data contracts and schema validation checks be placed?`,
        o: [
          r`At the ingestion boundary before downstream feature transformations and training pipelines execute`,
          r`Only after the final machine learning predictions are generated`,
          r`Inside the gradient descent optimiser step`,
          r`Validation should only be executed during offline annual audits`,
        ],
        a: 0,
        why: r`Validating at ingestion prevents corrupted records from propagating into feature pipelines and database tables, ensuring bad data is quarantined immediately at the boundary.`,
      },
    ],
    usedBy: ['missing-data-mcar-mar-mnar-and-imputation'],
    prereq: ['sampling-and-standard-error', 'sql-for-analysis-joins-and-window-functions'],
    related: ['pandas-and-polars-patterns', 'missing-data-mcar-mar-mnar-and-imputation', 'normality-tests-shapiro-wilk-kolmogorov-smirnov-anderson-darling'],
    keywords: 'data cleaning data validation data contracts schema validation data quality mad outlier detection pandera',
  },
  {
    id: 'missing-data-mcar-mar-mnar-and-imputation',
    short: 'Missing data: MCAR, MAR, MNAR',
    title: 'Missing Data: MCAR, MAR, MNAR and Imputation',
    task: 'concepts',
    module: 'Data wrangling',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Diagnosing missingness mechanisms—MCAR, MAR, and MNAR—and selecting statistically sound single, multiple, or model-based imputation strategies.`,
    lead: r`Blank cells and missing indicators occur across nearly every real-world dataset. Blindly dropping rows or imputing simple column means distorts feature distributions, collapses variance, and introduces severe sampling bias. Donald Rubin's taxonomy—Missing Completely at Random (MCAR), Missing at Random (MAR), and Missing Not at Random (MNAR)—governs whether missingness can be ignored, conditioned on observed covariates, or modelled as an informative signal.`,
    intuition: [
      r`Imagine administering a medical health survey measuring body weight and blood pressure. Suppose a lab technician accidentally drops five test tubes and their test results shatter on the floor. The missingness was caused by physical clumsiness completely unrelated to the patients' health or weight. This is Missing Completely at Random (MCAR): missing values are a random subsample of the true population. If you discard these rows (complete case analysis), your statistical estimators lose statistical power but remain unbiased.`,
      r`Now suppose younger patients are far less likely to report their annual blood pressure because they visit doctors less frequently, but among people of the same age, missingness is unrelated to their actual blood pressure. This is Missing at Random (MAR): missingness depends systematically on an observed variable (age), but not on the unobserved value itself. Dropping rows here causes severe bias (your sample over-represents older people). However, if you condition on age (e.g. imputing blood pressure using age-stratified models or regression imputation), unbiased estimates are recovered.`,
      r`Finally, suppose patients with severe clinical obesity deliberately skip the survey question asking for their weight. The probability that weight is missing depends directly on the unobserved weight itself. This is Missing Not at Random (MNAR). No standard imputation method that relies solely on observed data can fix this bias without explicitly modelling the censoring mechanism itself (e.g. Heckman selection models or adding explicit binary missingness indicator flags).`,
    ],
    analogy: r`Distinguishing between a phone call dropped because of random atmospheric static (MCAR), a call skipped because it rang during business hours (MAR), and a debtor refusing to answer calls from a debt-collection agency (MNAR).`,
    steps: [
      r`Quantify missingness topography: calculate the percentage of missing values per column and plot missingness co-occurrence patterns.`,
      r`Diagnose the missingness mechanism: test whether missingness correlates with other observed features (ruling out MCAR via logistic regression or Little's test).`,
      r`Select an imputation strategy: use median or mode for quick baseline models, or iterative multivariate imputation (MICE / MissForest / KNN) for MAR data.`,
      r`Preserve uncertainty with Multiple Imputation: generate $M$ imputed datasets, fit models on each, and pool parameters via Rubin's rules to avoid underestimating standard errors.`,
      r`Encode missingness as a feature: append binary indicator columns ($\mathbf{1}_{x \text{ is missing}}$) to allow tree models to learn informative MNAR patterns.`,
    ],
    math: [
      {
        h: 'Rubin\'s formal missingness mechanisms',
        tex: r`$$P(M \mid Y_{\text{obs}}, Y_{\text{mis}}) = \begin{cases} P(M) & \text{MCAR} \\ P(M \mid Y_{\text{obs}}) & \text{MAR} \\ P(M \mid Y_{\text{obs}}, Y_{\text{mis}}) & \text{MNAR} \end{cases}$$`,
        p: r`Here $M \in \{0, 1\}^n$ is the binary missingness indicator vector, $Y_{\text{obs}}$ are observed entries, and $Y_{\text{mis}}$ are missing values. Under MCAR, missingness is independent of all data. Under MAR, missingness depends only on observed covariates $Y_{\text{obs}}$. Under MNAR, missingness depends on the unobserved values $Y_{\text{mis}}$ themselves.`,
      },
      {
        h: 'Variance collapse under single mean imputation',
        tex: r`$$\mathbb{E}[s^2_{\text{imp}}] = \frac{n_{\text{obs}} - 1}{n - 1} \sigma^2 < \sigma^2$$`,
        p: r`Imputing missing values with the constant sample mean artificially pulls the empirical variance toward zero by factor $\frac{n_{\text{obs}} - 1}{n - 1}$. This deflation distorts confidence intervals and artificially inflates test statistics, generating false positive discoveries.`,
      },
      {
        h: 'Rubin\'s pooling rules for Multiple Imputation',
        tex: r`$$\bar{\theta} = \frac{1}{M} \sum_{m=1}^M \hat{\theta}^{(m)}, \qquad T = \bar{W} + \Big(1 + \frac{1}{M}\Big) B, \quad \bar{W} = \frac{1}{M}\sum W_m, \quad B = \frac{1}{M-1}\sum (\hat{\theta}^{(m)} - \bar{\theta})^2$$`,
        p: r`Multiple Imputation draws $M$ plausible values for each missing cell to create $M$ complete datasets. The pooled parameter $\bar{\theta}$ averages point estimates, while total variance $T$ combines within-imputation variance $\bar{W}$ and between-imputation variance $B$, accurately propagating imputation uncertainty into downstream inferences.`,
      },
    ],
    keyPoints: [
      r`Rubin's classification: understanding whether missingness is MCAR, MAR, or MNAR dictates whether complete-case deletion or imputation is valid.`,
      r`Variance deflation: single mean imputation artificially compresses variance and distorts covariance structures, inflating false positive rates.`,
      r`Informative missingness: in tree-based machine learning, adding binary missing indicators ($\mathbf{1}_{\text{missing}}$) allows models to leverage MNAR signals directly.`,
    ],
    pitfalls: [
      r`Defaulting to dropna() without inspection: dropping missing rows under MAR or MNAR introduces severe sample truncation and survivor bias.`,
      r`Imputing before train/test splitting: computing the mean or median over the entire dataset before splitting leaks test set statistics into training data.`,
      r`Believing MAR means "at random": despite its confusing name, MAR is NOT random; missingness depends systematically on other observed features.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
n = 100
age = np.random.uniform(20, 60, n)
true_income = 20000 + 1200 * age + np.random.normal(0, 5000, n)

# Missingness depends on age: younger people less likely to report income (MAR)
prob_missing = 1.0 / (1.0 + np.exp(0.15 * (age - 35)))
is_missing = np.random.binomial(1, prob_missing).astype(bool)

obs_income = true_income.copy()
obs_income[is_missing] = np.nan

mean_imputed = obs_income.copy()
mean_imputed[is_missing] = np.nanmean(obs_income)

poly = np.polyfit(age[~is_missing], obs_income[~is_missing], deg=1)
reg_imputed = obs_income.copy()
reg_imputed[is_missing] = np.polyval(poly, age[is_missing])

print(f"Missing records: {np.sum(is_missing)} / {n} ({np.sum(is_missing)/n*100:.1f}%)")
print(f"True population mean income:    {np.mean(true_income):.2f}")
print(f"Complete-case (dropped) mean:   {np.nanmean(obs_income):.2f} (Biased!)")
print(f"Mean imputed variance:          {np.var(mean_imputed):.2f} vs True: {np.var(true_income):.2f}")
print(f"Regression imputed mean income: {np.mean(reg_imputed):.2f} (Unbiased under MAR)")`,
    quiz: [
      {
        q: r`In Rubin's missing data taxonomy, what distinguishes Missing at Random (MAR) from Missing Completely at Random (MCAR)?`,
        o: [
          r`Under MAR, missingness depends systematically on observed covariates; under MCAR, missingness is entirely independent of all variables`,
          r`Under MAR, missingness cannot be corrected by any statistical method`,
          r`Under MCAR, missing values must be imputed with zero`,
          r`Under MAR, missing values only occur in text columns`,
        ],
        a: 0,
        why: r`MCAR means missingness is pure random noise ($P(M \mid Y) = P(M)$). MAR means missingness depends systematically on other observed variables ($P(M \mid Y_{\text{obs}}, Y_{\text{mis}}) = P(M \mid Y_{\text{obs}})$); conditioning on those observed variables resolves the bias.`,
      },
      {
        q: r`Why is imputing missing values with a single column mean considered hazardous for subsequent hypothesis testing?`,
        o: [
          r`It artificially reduces the sample variance, inflating test statistics and producing falsely narrow confidence intervals`,
          r`It causes the matrix determinant to become negative`,
          r`It converts continuous variables into discrete integers`,
          r`It violates the central limit theorem`,
        ],
        a: 0,
        why: r`Replacing varying unobserved points with an identical constant value clusters data around the mean, shrinking the estimated variance $\sigma^2$ and standard error, which leads to artificially small p-values and inflated Type I error rates.`,
      },
      {
        q: r`When evaluating a machine learning model, why must imputation transformers (like median or KNN imputers) be fitted strictly on the training split?`,
        o: [
          r`Fitting on the full dataset before splitting causes data leakage, allowing test set distribution statistics to contaminate training`,
          r`Imputers cannot process arrays with more than 1,000 rows`,
          r`Test sets are forbidden from containing missing values`,
          r`Scikit-learn raises a syntax error if an imputer is used on test sets`,
        ],
        a: 0,
        why: r`If you compute the imputation statistic (e.g. mean or median) across the entire dataset before train/test splitting, information from test labels and features leaks into the training pipeline, leading to over-optimistic performance estimates.`,
      },
    ],
    usedBy: [],
    prereq: ['sampling-and-standard-error', 'confidence-intervals', 'data-cleaning-and-validation'],
    related: ['data-cleaning-and-validation', 'pandas-and-polars-patterns', 'knn_regressor'],
    keywords: 'missing data mcar mar mnar imputation mice knn imputation rubin rules data wrangling',
  },
  {
    id: 'outlier-handling',
    short: 'Outlier handling',
    title: 'Outlier Handling',
    task: 'concepts',
    module: 'Data wrangling',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Detecting, evaluating, and transforming anomalous extreme observations using robust statistical thresholds, clipping, and power transforms.`,
    lead: r`Extreme outliers corrupt parametric estimators, inflate standard errors, and distort loss gradients during model training. Simply deleting every extreme row discards genuine black-swan signals and induces severe sample truncation. Systematic outlier handling diagnoses whether anomalies stem from measurement corruption or genuine heavy tails, deploying robust winsorisation, clipping, or loss reformulation.`,
    intuition: [
      r`Imagine calculating the average net worth of ten patrons enjoying coffee at a neighbourhood café. Nine patrons earn normal middle-class salaries around £50,000. Suddenly, a tech billionaire walks in with a net worth of £50,000,000,000. If you calculate the arithmetic mean, the café's average patron net worth rockets to £5,000,045,000. A standard linear regression or Ordinary Least Squares model trained on this sample will tilt its entire prediction surface to accommodate this single individual, rendering its predictions wildly inaccurate for the other nine ordinary patrons.`,
      r`What should an analyst do? The knee-jerk reaction—immediately deleting the billionaire's record—is often dangerous. If you are predicting luxury yacht purchases, the billionaire is your primary customer; deleting them erases the signal you exist to model. First, we must distinguish between error outliers (a human entering 999999 as a placeholder for unknown data) and valid extremes (rare but genuine high-value events). Error outliers should be quarantined or replaced with nulls; valid extremes require statistical treatment.`,
      r`To handle valid heavy tails without corrupting models, data scientists employ three robust strategies: trimming (removing observations beyond extreme quantile boundaries like the 1st and 99th percentiles), winsorisation or clipping (capping values exceeding a threshold $c$ at $c$, preserving rank order while bounding leverage), and monotonic transformations (such as logarithmic or Box-Cox transforms) that pull exponential right tails inward. Alternatively, switching from squared error loss ($L_2$) to robust Huber or pinball loss bounds the gradient influence of extreme residuals.`,
    ],
    analogy: r`Trimming the extreme high and low scores from Olympic judges to prevent a single biased score from deciding the medal.`,
    steps: [
      r`Profile tail behaviour: visualise distributions using box plots, histograms, and QQ plots to assess whether data exhibits Gaussian, log-normal, or Pareto heavy tails.`,
      r`Compute robust boundary thresholds: calculate the Interquartile Range ($\text{IQR} = Q_3 - Q_1$) or Median Absolute Deviation (MAD) to establish non-parametric fence limits.`,
      r`Classify outlier genesis: audit anomalous records against domain rules to separate sensor or keystroke errors from genuine natural extremes.`,
      r`Apply transformation or clipping: winsorise extreme values to lower and upper percentile fences ($[P_1, P_{99}]$) or apply $\log(1 + x)$ to compress positive right tails.`,
      r`Select robust downstream models: use tree ensembles or loss functions with linear tail penalties (Huber loss) when outliers carry valid predictive signal.`,
    ],
    math: [
      {
        h: 'Tukey\'s Interquartile Range (IQR) fence boundaries',
        tex: r`$$\text{Fence}_{\text{lower}} = Q_1 - 1.5 \cdot \text{IQR}, \qquad \text{Fence}_{\text{upper}} = Q_3 + 1.5 \cdot \text{IQR}$$`,
        p: r`Here $Q_1$ is the 25th percentile, $Q_3$ is the 75th percentile, and $\text{IQR} = Q_3 - Q_1$. For Gaussian distributions, the $1.5 \times \text{IQR}$ fence encompasses approximately $99.3\%$ of values. Observations outside this interval represent potential outliers; values beyond $3.0 \times \text{IQR}$ are classified as extreme outliers.`,
      },
      {
        h: 'Winsorisation (quantile clipping) operator',
        tex: r`$$\tilde{x}_i = \begin{cases} c_{\text{lower}} & \text{if } x_i < c_{\text{lower}} \\ x_i & \text{if } c_{\text{lower}} \le x_i \le c_{\text{upper}} \\ c_{\text{upper}} & \text{if } x_i > c_{\text{upper}} \end{cases}$$`,
        p: r`Cut-offs $c_{\text{lower}}$ and $c_{\text{upper}}$ are chosen percentiles (such as the 1st and 99th percentiles). Capping preserves sample size $n$ and monotonic rank order while strictly bounding maximum leverage $x_i^2$, preventing a single extreme observation from dictating squared-error loss gradients.`,
      },
      {
        h: 'Huber loss gradient saturation',
        tex: r`$$\frac{\partial L_\delta}{\partial r} = \begin{cases} r & \text{if } |r| \le \delta \\ \delta \cdot \text{sign}(r) & \text{if } |r| > \delta \end{cases}$$`,
        p: r`For residual $r = y - \hat{y}$, Huber loss scales quadratically for small errors ($|r| \le \delta$) but switches to linear scaling for large errors ($|r| > \delta$). The derivative saturates at constant $\pm \delta$, preventing extreme target outliers from dominating gradient updates.`,
      },
    ],
    keyPoints: [
      r`Distinction between error and signal: never delete extreme values without verifying whether they represent data corruption or genuine black-swan events.`,
      r`Non-parametric bounds: IQR and MAD fences detect outliers without assuming data follows a normal bell curve.`,
      r`Winsorisation preserves sample size: capping at extreme quantiles neutralises leverage while retaining valid observational rows.`,
    ],
    pitfalls: [
      r`Blind 3-sigma rule on non-normal distributions: applying mean $\pm 3\sigma$ to skewed log-normal or power-law data falsely flags valid high-volume transactions as outliers while corrupting the mean.`,
      r`Truncation bias: dropping high-value outliers when estimating financial totals systematically underestimates risk and expected revenue.`,
      r`Fitting outlier cut-offs on test data: computing winsorisation limits on test splits leaks distribution boundaries; boundaries must be fit on training data and applied to test.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
x = np.concatenate([np.random.normal(50, 5, 95), [180, 220, -40, 195, 210]])
q1, q3 = np.percentile(x, [25, 75])
iqr = q3 - q1
lower_fence, upper_fence = q1 - 1.5 * iqr, q3 + 1.5 * iqr

p1, p99 = np.percentile(x, [1, 99])
x_winsor = np.clip(x, p1, p99)

outliers = (x < lower_fence) | (x > upper_fence)
print(f"Total samples: {len(x)}, Outliers detected: {np.sum(outliers)}")
print(f"Raw mean: {np.mean(x):.2f}, std: {np.std(x):.2f}")
print(f"Winsorised mean: {np.mean(x_winsor):.2f}, std: {np.std(x_winsor):.2f}")`,
    quiz: [
      {
        q: r`Why does applying the standard 3-sigma rule (mean $\pm 3\sigma$) often fail on skewed financial transaction data?`,
        o: [
          r`Extreme outliers pull the sample mean upward and heavily inflate $\sigma$, masking valid outliers while misclassifying valid positive skewness as anomalous`,
          r`The 3-sigma rule can only be evaluated on integer values`,
          r`Standard deviations cannot be calculated when sample size exceeds 1,000`,
          r`Financial transactions must always follow a uniform distribution`,
        ],
        a: 0,
        why: r`The sample mean and standard deviation have a 0% breakdown point. In heavily right-skewed or heavy-tailed distributions, a few massive values drastically inflate $\sigma$, creating an artificially wide acceptance band that fails to flag anomalies while corrupting the centre.`,
      },
      {
        q: r`What is the primary operational advantage of winsorisation (clipping at quantiles) over row deletion?`,
        o: [
          r`It preserves the total sample size $n$ and rank ordering while bounding leverage on squared-error loss gradients`,
          r`It guarantees that all values become normally distributed`,
          r`It removes the need for cross-validation`,
          r`It converts continuous numbers into discrete categories`,
        ],
        a: 0,
        why: r`Row deletion discards observational evidence and induces truncation bias. Winsorisation caps extreme values at safe percentile limits (e.g. 1st and 99th percentiles), bounding outlier influence while retaining the record in training.`,
      },
      {
        q: r`When preparing data for a gradient boosted tree model, how should valid extreme outliers in predictor features be handled?`,
        o: [
          r`Tree models split on monotonic rank thresholds, making them inherently invariant to monotonic scaling and extreme outlier magnitudes`,
          r`Outliers must always be replaced with zero`,
          r`Features must be scaled using min-max normalisation between -1 and 1`,
          r`Decision trees crash when feature values exceed 100`,
        ],
        a: 0,
        why: r`Decision trees choose split points based on ordered partitions ($x_j \le \theta$). A value of 1,000,000 is placed on the exact same side of a split as a value of 100, making decision trees robust to monotonic feature outliers.`,
      },
    ],
    usedBy: ['scaling-and-transforms-standard-robust-box-cox-yeo-johnson'],
    prereq: ['sampling-and-standard-error', 'data-cleaning-and-validation'],
    related: ['data-cleaning-and-validation', 'robust_regression', 'isolation-forest'],
    keywords: 'outlier handling winsorisation tukey iqr mad clipping robust statistics huber loss data wrangling',
  },
  {
    id: 'encoding-categoricals-one-hot-ordinal-target-woe',
    short: 'Encoding categoricals',
    title: 'Encoding Categoricals: One-Hot, Ordinal, Target, WoE',
    task: 'concepts',
    module: 'Feature engineering',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Transforming discrete strings and high-cardinality levels into informative numerical representations while preventing target leakage and dimensionality explosion.`,
    lead: r`Mathematical models cannot multiply, divide, or take gradients over raw string labels. Encoding maps discrete categorical variables into numeric vectors, but each strategy balances distinct trade-offs between dimensionality, ordinal assumptions, and information retention. From sparse one-hot expansions to smoothed target encoding and Weight of Evidence (WoE), selecting the correct transformation prevents curse-of-dimensionality memory crashes and catastrophic target leakage.`,
    intuition: [
      r`Imagine predicting hotel booking cancellations using categorical columns like room type (Standard, Deluxe, Suite) and user nationality (195 countries). The simplest idea is assigning consecutive integers: Standard = 1, Deluxe = 2, Suite = 3. For room type, this ordinal encoding makes intuitive sense because there is a natural hierarchy of luxury and price. But if you apply arbitrary integers to nationalities (France = 1, Germany = 2, Japan = 3), a linear model or neural network assumes that Germany is twice France and Japan is three times France, inventing nonsensical mathematical arithmetic out of arbitrary alphabetical order.`,
      r`One-hot encoding avoids this false ordering by creating an independent binary flag for each level (e.g. [1, 0, 0] for France). For variables with few categories (low cardinality), one-hot encoding is clean and effective. But for UK postcodes or search queries with 50,000 unique levels, one-hot encoding explodes the feature space into a colossal 50,000-column sparse matrix. Tree models struggle because each individual binary split isolates only a tiny fraction of samples, diluting statistical split strength.`,
      r`Target encoding and Weight of Evidence (WoE) solve high cardinality by condensing each category into a single continuous number representing its historical association with the outcome $y$. For each nationality, target encoding replaces the label with the mean cancellation rate of that country. To prevent rare categories (like a country with only 1 customer who cancelled) from overfitting to 100%, empirical Bayes m-estimate smoothing pulls rare categories toward the global cancellation prior.`,
    ],
    analogy: r`Translating a foreign menu: giving each dish an arbitrary catalogue number (ordinal), creating 200 checkboxes for 200 ingredients (one-hot), or simply labelling each dish with its average customer spiciness rating (target encoding).`,
    steps: [
      r`Audit cardinality and ordering: determine whether levels possess an intrinsic natural hierarchy (ordinal) or arbitrary nominal identity.`,
      r`Apply one-hot encoding to low-cardinality nominals ($k < 10$): drop one reference dummy column when training unregularised linear models to avoid multicollinearity.`,
      r`Map ranked tiers via ordinal encoding: assign monotonic integer values when domain hierarchy is strict (e.g. Low, Medium, High to 0, 1, 2).`,
      r`Deploy smoothed target encoding for high-cardinality features: blend category target means with global priors using m-estimate or empirical Bayes weighting.`,
      r`Enforce leakage-safe cross-validation: compute target encodings strictly inside cross-validation folds or using out-of-fold leave-one-out calculation to prevent target leakage.`,
    ],
    math: [
      {
        h: 'Smoothed empirical Bayes target encoding (m-estimate)',
        tex: r`$$\hat{S}_c = \frac{n_c \cdot \bar{y}_c + m \cdot \bar{y}_{\text{global}}}{n_c + m}$$`,
        p: r`Here $n_c$ is the count of category $c$ in training data, $\bar{y}_c$ is the sample mean of the target for category $c$, $\bar{y}_{\text{global}}$ is the overall target mean across all rows, and $m > 0$ is the smoothing weight of the prior. When $n_c \gg m$, $\hat{S}_c \to \bar{y}_c$; when $n_c \to 0$, $\hat{S}_c \to \bar{y}_{\text{global}}$, preventing rare categories from producing overfit extreme values.`,
      },
      {
        h: 'Weight of Evidence (WoE) for binary classification',
        tex: r`$$\text{WoE}_c = \ln\left(\frac{P(Y=1 \mid X=c)}{P(Y=0 \mid X=c)} \Big/ \frac{P(Y=1)}{P(Y=0)}\right) = \ln\left(\frac{B_c / B_{\text{total}}}{G_c / G_{\text{total}}}\right)$$`,
        p: r`Here $B_c$ and $G_c$ are bad (events, $y=1$) and good (non-events, $y=0$) counts for category $c$. WoE represents the log-odds ratio relative to the population base rate. Because WoE possesses an exact linear relationship with log-odds, it is extensively used in credit risk scorecards with logistic regression.`,
      },
      {
        h: 'Dummy variable trap and rank deficiency',
        tex: r`$$\sum_{j=1}^k D_j = \mathbf{1}_n = X_0 \implies \text{rank}(X) < k$$`,
        p: r`The sum of all $k$ one-hot binary indicator columns equals the constant intercept column vector $\mathbf{1}_n$, creating perfect multicollinearity. For unregularised Ordinary Least Squares, one category must be omitted ($k-1$ dummy columns) to ensure the design matrix $X^T X$ is invertible.`,
      },
    ],
    keyPoints: [
      r`Cardinality dictates strategy: use one-hot for low cardinality ($<10$ levels), frequency or target encoding for high cardinality.`,
      r`Target leakage hazard: target encoding must never compute category statistics across the entire dataset before cross-validation splitting.`,
      r`Bayesian prior smoothing: blending category averages with global priors prevents rare levels with tiny sample sizes from producing extreme overfit predictions.`,
    ],
    pitfalls: [
      r`Catastrophic target leakage: calculating target means on training and validation data simultaneously causes near-perfect training scores and disastrous test performance.`,
      r`Unseen categories in production: new categories absent during training crash one-hot transformers unless handle_unknown='ignore' or fallback to global target prior is configured.`,
      r`Ordinal encoding on nominal variables: assigning sequential integers to arbitrary categories forces non-linear models to navigate artificial metric distances.`,
    ],
    code: r`import numpy as np

categories = np.array(['UK', 'FR', 'DE', 'UK', 'US', 'FR', 'UK', 'LUX'])
y = np.array([1, 0, 1, 1, 0, 0, 1, 0], dtype=float)
global_mean, m = np.mean(y), 2.0  # m-estimate prior weight

encoded = np.zeros_like(y)
for cat in np.unique(categories):
    idx = np.where(categories == cat)[0]
    n_c, y_c = len(idx), np.sum(y[idx])
    smoothed = (y_c + m * global_mean) / (n_c + m)
    encoded[idx] = smoothed

print(f"Global target mean: {global_mean:.3f}")
for c in ['UK', 'LUX']:
    print(f"Category {c} target encoded: {encoded[categories == c][0]:.3f}")`,
    quiz: [
      {
        q: r`Why does raw unsmoothed target encoding overfit heavily on categories with very few observations?`,
        o: [
          r`A category with a single observation will receive an encoding of exactly 0.0 or 1.0, memorising target noise instead of true population affinity`,
          r`It converts numbers into complex imaginary components`,
          r`It causes the matrix determinant to equal zero`,
          r`It only operates when the target is multi-class`,
        ],
        a: 0,
        why: r`If category 'LUX' appears only once with target $y=1$, unsmoothed target encoding assigns it 1.0 (100% cancellation rate), creating an over-confident feature based on zero statistical evidence. Smoothing pulls small-sample categories toward the global mean.`,
      },
      {
        q: r`What is the primary danger of applying ordinal integer encoding (e.g. 1, 2, 3, 4) to nominal variables like car colours?`,
        o: [
          r`It imposes an artificial metric distance and ordering, causing linear models and neural networks to assume colour 4 is mathematically four times colour 1`,
          r`It causes memory exhaustion in decision trees`,
          r`It is unsupported in Python`,
          r`It requires all colours to have equal row counts`,
        ],
        a: 0,
        why: r`Nominal categories possess no quantitative hierarchy. Assigning numbers implies metric distances ($|1 - 2| = |2 - 3|$) and mathematical ratios that corrupt linear regression, distance metrics, and neural weights.`,
      },
      {
        q: r`How must target encoding be calculated to completely eliminate data leakage during cross-validation?`,
        o: [
          r`Category target statistics must be computed strictly on the training fold, or calculated out-of-fold without using each row's own target value`,
          r`Target encoding should be computed across the test fold first`,
          r`The target variable must be binned into quintiles`,
          r`Target encoding cannot be used in cross-validation`,
        ],
        a: 0,
        why: r`If validation row targets are included when computing category means, the model learns to reconstruct the validation target directly from the encoding, producing severe over-optimistic leakage. Out-of-fold or strictly train-fold statistics prevent this.`,
      },
    ],
    usedBy: ['scaling-and-transforms-standard-robust-box-cox-yeo-johnson'],
    prereq: ['sampling-and-standard-error', 'cross-validation'],
    related: ['scaling-and-transforms-standard-robust-box-cox-yeo-johnson', 'multicollinearity-and-vif', 'logistic_regression'],
    keywords: 'categorical encoding one hot encoding target encoding woe weight of evidence ordinal encoding high cardinality feature engineering',
  },
  {
    id: 'scaling-and-transforms-standard-robust-box-cox-yeo-johnson',
    short: 'Scaling and transforms',
    title: 'Scaling and Transforms: Standard, Robust, Box–Cox, Yeo–Johnson',
    task: 'concepts',
    module: 'Feature engineering',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Standardising feature ranges and normalising skewed distributions to satisfy linear assumptions and accelerate gradient convergence.`,
    lead: r`Distance metrics, regularisation penalties, and gradient descent updates are acutely sensitive to feature scales. If one feature spans $[0, 1]$ while another ranges $[0, 1{,}000{,}000]$, the larger variable completely dominates Euclidean distances and distorts L1/L2 penalties. Transforming features via standard, robust, or power transformations aligns feature scales and normalises skewed distributions into symmetrical Gaussian-like shapes.`,
    intuition: [
      r`Imagine training a k-Nearest Neighbours or Support Vector Machine model to evaluate bank loan risk based on two customer attributes: age in years (ranging from 18 to 75) and annual income in pounds (ranging from £15,000 to £500,000). If you compute the Euclidean distance between two applicants, a difference of 30 years in age contributes $(30)^2 = 900$ to the squared distance, while a difference of £10,000 in income contributes $(10,000)^2 = 100,000,000$. The income feature is over 100,000 times more influential simply because of the arbitrary choice of measurement currency. Age becomes completely invisible to the algorithm.`,
      r`Scaling resolves this by transforming variables into comparable dimensionless numerical spaces. Standard scaling (Z-score normalisation) shifts the mean to 0 and rescales variance to 1. Min-max scaling squashes values into a bounded interval such as $[0, 1]$. However, both techniques are vulnerable to extreme outliers: a single massive outlier compresses all normal data points into a microscopic cluster near zero. Robust scaling replaces the sample mean and variance with the median and interquartile range (IQR), ensuring scale normalisation remains unaffected by rogue outliers.`,
      r`Beyond scaling spread, many linear algorithms and hypothesis tests assume underlying errors or features are normally distributed. Highly skewed variables (such as website visit durations or insurance claim amounts) violate these assumptions. Power transformations—such as the Box-Cox transform for strictly positive data and the Yeo-Johnson transform for data containing zero or negative values—estimate an optimal power parameter $\lambda$ that mathematically bends skewed probability distributions into symmetrical, near-Gaussian bell curves.`,
    ],
    analogy: r`Converting currencies from Yen, Pounds, and Dollars into a single standardised international credit unit so that prices can be compared on equal terms.`,
    steps: [
      r`Diagnose distribution characteristics: inspect feature skewness, presence of negative values, and outlier density using histograms and quantile plots.`,
      r`Select scaling mechanism: apply standard scaling ($z = (x - \mu)/\sigma$) for Gaussian features, Min-Max scaling for bounded bounds (e.g. neural network inputs), or robust scaling (median/IQR) for outlier-rich data.`,
      r`Fit scaler exclusively on training data: calculate $\mu$, $\sigma$, or median strictly on training folds to prevent distribution leakage.`,
      r`Evaluate power transformations for skewed data: apply Box-Cox for strictly positive features ($x > 0$) or Yeo-Johnson for real-valued features with zeros and negatives.`,
      r`Optimise transformation parameter $\lambda$: maximise profile log-likelihood across grid search to find the power that minimises distribution skewness.`,
    ],
    math: [
      {
        h: 'Standard scaling vs Robust scaling',
        tex: r`$$z_i = \frac{x_i - \bar{x}}{s}, \qquad r_i = \frac{x_i - \text{median}(X)}{\text{IQR}(X)}$$`,
        p: r`Standard scaling centres at sample mean $\bar{x}$ and scales by standard deviation $s$. Robust scaling centres at the sample median and divides by $\text{IQR} = Q_3 - Q_1$, maintaining a 50% breakdown point that resists distortion from extreme outliers.`,
      },
      {
        h: 'Box-Cox power transformation ($x > 0$)',
        tex: r`$$y^{(\lambda)} = \begin{cases} \frac{x^\lambda - 1}{\lambda} & \text{if } \lambda \ne 0 \\ \ln(x) & \text{if } \lambda = 0 \end{cases}$$`,
        p: r`Parametrised by power $\lambda$, Box-Cox continuous power scaling maps positive distributions into Gaussian profiles. At $\lambda = 1$, the transform is linear (shift); at $\lambda = 0.5$, it acts as a square root; at $\lambda = 0$, it becomes the natural logarithm, compressing heavy right tails.`,
      },
      {
        h: r`Yeo-Johnson power transformation (all $x \in \mathbb{R}$)`,
        tex: r`$$\psi(\lambda, x) = \begin{cases} \frac{(x + 1)^\lambda - 1}{\lambda} & \text{if } \lambda \ne 0, x \ge 0 \\ \ln(x + 1) & \text{if } \lambda = 0, x \ge 0 \\ -\frac{(-x + 1)^{2 - \lambda} - 1}{2 - \lambda} & \text{if } \lambda \ne 2, x < 0 \\ -\ln(-x + 1) & \text{if } \lambda = 2, x < 0 \end{cases}$$`,
        p: r`Yeo-Johnson generalises Box-Cox to accommodate zero and negative values, guaranteeing monotonic continuity across the entire real line without requiring arbitrary additive positive shifts.`,
      },
    ],
    keyPoints: [
      r`Distance and gradient invariance: scaling ensures features contribute proportionately to Euclidean distance calculations and prevents elongated, zig-zagging gradient descent trajectories.`,
      r`Robust scaling resistance: median/IQR scaling resists outlier contamination, preventing extreme observations from squashing normal feature distributions.`,
      r`Yeo-Johnson zero-handling: unlike Box-Cox, Yeo-Johnson operates over positive, zero, and negative values without requiring arbitrary positive offset shifts.`,
    ],
    pitfalls: [
      r`Data leakage by fitting on entire dataset: computing scaler parameters ($\mu, \sigma$) across training and test sets leaks test distribution bounds.`,
      r`Tree-based model misconception: applying monotonic scaling or power transforms to features fed into decision trees, Random Forests, or XGBoost is computationally superfluous, as trees are invariant to monotonic univariate transforms.`,
      r`Inverting predictions without inverse transformation: when transforming a continuous target variable $y$ with Box-Cox, predictions must be inverted via inverse power transform back to original monetary or physical units.`,
    ],
    code: r`import numpy as np
from scipy import stats

np.random.seed(42)
raw = np.random.exponential(scale=2.0, size=100)

standardised = (raw - np.mean(raw)) / np.std(raw)
med = np.median(raw)
iqr_val = np.percentile(raw, 75) - np.percentile(raw, 25)
robust = (raw - med) / iqr_val
boxcox_trans, opt_lambda = stats.boxcox(raw)

print(f"Raw skewness:        {stats.skew(raw):.3f}")
print(f"Standardised skew:   {stats.skew(standardised):.3f} (mean: {np.mean(standardised):.1f})")
print(f"Robust scaled skew:  {stats.skew(robust):.3f} (median: {np.median(robust):.1f})")
print(f"Box-Cox skew (lambda={opt_lambda:.2f}): {stats.skew(boxcox_trans):.3f}")`,
    quiz: [
      {
        q: r`Why does standardising or min-max scaling features have virtually zero effect on the predictive accuracy of a Random Forest or XGBoost model?`,
        o: [
          r`Decision trees split on monotonic rank thresholds, making split decisions completely invariant to monotonic univariate scaling`,
          r`Tree models internally normalise all columns to Gaussian distributions`,
          r`Ensemble algorithms only process categorical variables`,
          r`Gradient boosting automatically divides all numbers by 100`,
        ],
        a: 0,
        why: r`Decision trees evaluate splits of the form $x_j \le \theta$. Monotonically scaling $x_j$ by $a x_j + b$ simply transforms the threshold $\theta$ by the same factor, leaving sample partitions and impurity gains identical.`,
      },
      {
        q: r`What is the primary constraint that limits the use of the classic Box-Cox transformation?`,
        o: [
          r`All feature values must be strictly positive ($x > 0$)`,
          r`The dataset must have fewer than 100 rows`,
          r`It can only be applied to binary classification labels`,
          r`The data must already follow a normal distribution`,
        ],
        a: 0,
        why: r`Box-Cox relies on power functions and natural logarithms ($\ln x$), which are undefined for zero and negative real numbers. The Yeo-Johnson transform was developed specifically to overcome this constraint.`,
      },
      {
        q: r`Why is RobustScaler (median and IQR) preferred over StandardScaler when scaling data with severe unclipped outliers?`,
        o: [
          r`StandardScaler's mean and variance are heavily distorted by outliers, squashing normal data into a narrow band, whereas median and IQR resist outlier leverage`,
          r`RobustScaler guarantees all outputs fall strictly between 0 and 1`,
          r`RobustScaler eliminates the need for test set splitting`,
          r`StandardScaler cannot process floating-point data`,
        ],
        a: 0,
        why: r`In StandardScaler, an extreme outlier inflates the sample standard deviation, shrinking the scaled values of typical records into a tiny range near zero. RobustScaler's median and IQR have a 50% breakdown point, preserving normal variation.`,
      },
    ],
    usedBy: ['lag-and-rolling-window-features'],
    prereq: ['outlier-handling', 'sampling-and-standard-error'],
    related: ['outlier-handling', 'encoding-categoricals-one-hot-ordinal-target-woe', 'knn_classifier', 'ridge_regression'],
    keywords: 'feature scaling standardisation normalisation robust scaler box cox yeo johnson power transform skewness feature engineering',
  },
  {
    id: 'lag-and-rolling-window-features',
    short: 'Lag and rolling-window features',
    title: 'Lag and Rolling-Window Features',
    task: 'concepts',
    module: 'Feature engineering',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Constructing historical lag shifts, rolling summary statistics, and exponentially weighted moving averages for tabular time-series forecasting.`,
    lead: r`Tabular models like XGBoost and LightGBM cannot inherently process sequential dependencies without explicit temporal feature engineering. Lag features and rolling-window aggregations convert sequential time-series into standard supervised learning matrices, capturing momentum, seasonality, and volatility. Rigorous window construction prevents lookahead leakage and ensures predictive features reflect strictly historical information.`,
    intuition: [
      r`Imagine predicting tomorrow's electricity consumption for a large city. If you provide a gradient boosted tree only with the date "Thursday, 12th November", the model has no way of knowing whether the city is currently experiencing a sudden cold snap or how much power was consumed yesterday. However, if you provide the electricity consumption from 24 hours ago (lag 1 day), from 7 days ago (lag 7 days, capturing weekly seasonality), and the average consumption over the past 3 days (rolling mean), the model instantly grasps current demand momentum and baseline expectations.`,
      r`Constructing temporal tabular features relies on two primary primitives: lags and rolling windows. A lag feature shifts the time series backward by $k$ time steps ($y_{t-k}$), allowing standard tabular regression models to condition on previous state values. Rolling-window features pass a sliding aggregation frame over past observations, computing summary statistics such as rolling mean (trend), rolling standard deviation (volatility), rolling min/max (envelope range), and exponentially weighted moving averages (EWMA), which weight recent observations more heavily than distant history.`,
      r`The single most catastrophic error in time-series feature engineering is lookahead leakage (future leakage). If you calculate a rolling 7-day average using a centred window that includes $t-3$ to $t+3$, your model is trained using information from three days in the future. In offline cross-validation, the model appears to predict the future with supernatural precision. When deployed into production, tomorrow's data does not exist, causing model accuracy to collapse completely. Every rolling feature must be strictly left-aligned or shifted by at least the forecast horizon.`,
    ],
    analogy: r`Driving a car forward while glancing at the rear-view mirror to observe how fast traffic behind you is moving, rather than attempting to look through a crystal ball.`,
    steps: [
      r`Establish regular time index: verify uniform sampling frequency (hourly, daily) and resolve missing temporal timestamps via forward-filling or interpolation.`,
      r`Generate lag features: shift the target series backward by $k$ discrete steps ($y_{t-1}, y_{t-7}, y_{t-365}$) corresponding to domain seasonality cycles.`,
      r`Compute rolling window aggregates: slide fixed-length historical frames ($W \in \{7, 14, 30\}$) to compute rolling means, standard deviations, and quantiles.`,
      r`Enforce strict causal alignment: shift rolling calculations by at least the forecast horizon ($h \ge 1$) to eliminate lookahead leakage.`,
      r`Calculate momentum and divergence ratios: compute relative velocity features such as $(y_{t-1} - \text{mean}_{7}) / \text{std}_{7}$ to measure deviation from recent baseline trends.`,
    ],
    math: [
      {
        h: 'Discrete lag operator and difference transformations',
        tex: r`$$L^k y_t = y_{t-k}, \qquad \Delta^k y_t = (1 - L)^k y_t = y_t - y_{t-k}$$`,
        p: r`Here $L$ is the backshift lag operator. The term $y_{t-k}$ captures the historical value $k$ steps prior. First-order differences $\Delta y_t = y_t - y_{t-1}$ remove linear trends, while seasonal differences $y_t - y_{t-s}$ remove recurring periodicities (such as $s = 7$ for weekly patterns).`,
      },
      {
        h: 'Causal rolling window mean and variance',
        tex: r`$$\mu_{t, W} = \frac{1}{W} \sum_{i=1}^W y_{t-i}, \qquad \sigma_{t, W}^2 = \frac{1}{W - 1} \sum_{i=1}^W \big(y_{t-i} - \mu_{t, W}\big)^2$$`,
        p: r`Historical window $W$ is summed strictly over historical indices $i \in \{1, \dots, W\}$. The upper index is $t-1$, which strictly excludes the concurrent observation $y_t$ to prevent target leakage when training models to predict $y_t$.`,
      },
      {
        h: 'Exponentially Weighted Moving Average (EWMA)',
        tex: r`$$\hat{y}_t^{(\alpha)} = \alpha y_{t-1} + (1 - \alpha) \hat{y}_{t-1}^{(\alpha)} = \alpha \sum_{i=1}^\infty (1 - \alpha)^{i-1} y_{t-i}$$`,
        p: r`The smoothing parameter $\alpha \in (0, 1]$ dictates the geometric decay rate. Recent observations receive exponentially decaying weights $(1 - \alpha)^{i-1}$, adapting rapidly to structural trend shifts without requiring a sharp rectangular cut-off window.`,
      },
    ],
    keyPoints: [
      r`Tabularizing sequential data: lag and window features allow non-recurrent algorithms (like LightGBM) to capture temporal dependencies with exceptional speed.`,
      r`Strict causal lagging: rolling statistics must exclude the current time step $t$ when predicting $y_t$, strictly bounding historical inputs to $\{t-1, t-2, \dots\}$.`,
      r`Domain seasonal lags: alignment with natural cycles (e.g. 24 hours, 7 days, 52 weeks) captures periodic autocorrelation structures.`,
    ],
    pitfalls: [
      r`Centred window lookahead leakage: using default centred rolling windows incorporates future time points $t+1, \dots, t+k$, invalidating the model for live deployment.`,
      r`Multi-step forecast horizon mismatch: when forecasting $h$ steps ahead (e.g. predicting day $t+7$), lag features like $y_{t-1}$ are unobserved at prediction time, demanding recursive or direct forecasting strategies.`,
      r`Inadvertent training set NaN leakage: shifting by $k$ produces $k$ leading NaNs; dropping NaNs carelessly can truncate early training cohorts or cause row misalignment across multi-entity panels.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
series = 10.0 + np.sin(np.linspace(0, 10, 50)) + np.random.normal(0, 0.5, 50)
T = len(series)

# Lags: t-1 and t-3
lag1 = series[2:-1]
lag3 = series[0:-3]
# Causal rolling mean (window=3)
rolling_mean = np.array([np.mean(series[i-3:i]) for i in range(3, T)])
y_target = series[3:]

print(f"Constructed supervised samples: {len(y_target)}")
print(f"Sample 0 -> Target: {y_target[0]:.2f}, Lag-1: {series[2]:.2f}, 3-step Rolling Mean: {rolling_mean[0]:.2f}")`,
    quiz: [
      {
        q: r`Why is calculating a rolling mean using a centred window (e.g. including $t-2$ through $t+2$) considered fatal when building time-series features?`,
        o: [
          r`It introduces lookahead leakage by using future values ($t+1, t+2$) that are unobserved at inference time, rendering the model useless in production`,
          r`It causes the rolling standard deviation to become negative`,
          r`It converts daily time series into monthly data`,
          r`It forces the model to use linear regression`,
        ],
        a: 0,
        why: r`At test time, the model must forecast $y_t$ using only data available prior to $t$. A centred window incorporates future values that cannot exist at prediction time, producing deceptively high backtest scores that collapse in production.`,
      },
      {
        q: r`When building a multi-step forecasting model to predict sales 7 days into the future ($y_{t+7}$), which of the following lag features is valid without recursive chaining?`,
        o: [
          r`$y_t$ or earlier lags like $y_{t-1}, y_{t-7}$`,
          r`$y_{t+6}$`,
          r`$y_{t+1}$`,
          r`A centred 3-day average around $y_{t+7}$`,
        ],
        a: 0,
        why: r`When forecasting 7 steps ahead from origin $t$, only observations at or before time $t$ ($y_t, y_{t-1}, \dots$) are known. Features like $y_{t+1}$ or $y_{t+6}$ are in the future and cannot be observed directly without multi-step recursive forecasting.`,
      },
      {
        q: r`What structural role do lag differences ($\Delta y_t = y_t - y_{t-1}$) serve in time-series feature engineering?`,
        o: [
          r`They transform non-stationary trending series into stationary mean-reverting increments, highlighting short-term acceleration and momentum`,
          r`They eliminate all missing values automatically`,
          r`They ensure all target values are integers`,
          r`They double the number of rows in the dataset`,
        ],
        a: 0,
        why: r`Differencing removes secular non-stationary trends ($y_t - y_{t-1}$), capturing whether the process is accelerating or decelerating relative to its recent level.`,
      },
    ],
    usedBy: [],
    prereq: ['stationarity-acf-and-pacf', 'scaling-and-transforms-standard-robust-box-cox-yeo-johnson'],
    related: ['stationarity-acf-and-pacf', 'exponential-smoothing-ets', 'gradient_boosting_regressor'],
    keywords: 'lag features rolling window features time series feature engineering ewma lookahead leakage supervised forecasting autocorrelation',
  },
];
