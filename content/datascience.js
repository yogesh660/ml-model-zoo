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
  "id": "dates-time-zones-and-temporal-joins",
  "short": "Dates, time zones & joins",
  "title": "Dates, Time Zones, and Temporal Joins in Data Engineering",
  "task": "concepts",
  "level": 2,
  "minutes": 16,
  "noLab": true,
  "summary": "Mastering ISO 8601 timestamps, UTC normalisation, daylight saving edge cases, as-of joins, and point-in-time correct temporal feature lookups.",
  "lead": "Temporal data is ubiquitous in real-world machine learning, yet improper handling of time zones, daylight saving shifts, and non-aligned timestamps introduces subtle, silent data corruption and severe lookahead leakage. A single local time mix-up can make an event appear an hour before it actually occurred, or corrupt training targets when matching asynchronous market prices to client orders.",
  "analogy": "Imagine matching flight departure announcements in Tokyo with passenger bookings recorded in New York. If both systems record \"14:00\" without specifying time zones or offsets, you cannot know which happened first. Converting every event to Greenwich Mean Time (UTC) establishes a single unambiguous timeline, while an as-of join acts like looking at the departure board right at the moment you step up to the gate, ensuring you only see the latest scheduled boarding gate rather than tomorrow's update.",
  "intuition": [
    "Temporal information spans two concepts: physical time (an absolute point on the cosmic timeline, correctly measured in Unix epoch seconds or UTC ISO 8601 strings) and civil time (local wall-clock time subject to political boundaries, time zones, and daylight saving time adjustments).",
    "A fundamental rule of data engineering is: ingest and store all timestamps in UTC ($+00:00$), and only convert to local civil time at the presentation layer or when extracting calendar features (such as local hour of day or day of week). Daylight saving transitions create ambiguous times (an hour repeating during autumn fallback) and nonexistent times (an hour skipped during spring forward).",
    "Standard relational equijoins require exact timestamp matches ($t_A = t_B$), which almost never occurs across independent distributed telemetry streams. Instead, time-series workflows require temporal inequality joins, most notably the as-of join (or backward merge).",
    "An as-of join merges each record from a primary table with the most recent preceding record from a secondary reference table, strictly enforcing $t_{\\mathrm{ref}} \\le t_{\\mathrm{event}}$. This guarantees point-in-time correctness, preventing target leakage where future prices or status changes inadvertently leak into past feature states."
  ],
  "steps": [
    "Ingest and canonicalise: Parse input strings against ISO 8601 standard (`YYYY-MM-DDTHH:MM:SSZ`), resolve timezone offsets immediately, and store as UTC timestamps or epoch nanoseconds.",
    "Feature extraction in local time: When creating behavioural features (e.g. rush-hour indicators, morning vs evening shopping), convert UTC to user-local civil time using the regional timezone database (IANA tzdb).",
    "Index sorting: Ensure both event and reference tables are strictly sorted by entity ID and timestamp prior to temporal joining.",
    "Point-in-time as-of join: Execute backward matching (`join_asof`) on matching keys (e.g. `user_id`, `ticker`) matching the latest reference timestamp $\\le$ the query timestamp.",
    "Tolerance and lookahead audit: Configure a backward tolerance window (e.g. do not match reference data older than 24 hours) and assert zero forward-looking records."
  ],
  "math": [
    {
      "h": "Universal Time Normalisation",
      "tex": "t_{\\mathrm{UTC}} = t_{\\mathrm{local}} - \\Delta_{\\mathrm{tz}}(\\mathrm{date}, \\mathrm{location})",
      "p": "Physical time is invariant. Local civil time is adjusted by the historical offset $\\Delta_{\\mathrm{tz}}$ dictated by timezone rules and daylight saving time."
    },
    {
      "h": "As-Of Temporal Join Specification",
      "tex": "j^*(i) = \\operatorname*{arg\\,max}_{j \\in \\mathcal{R}_{k_i}} \\left\\{ t_j \\;\\middle|\\; t_j \\le t_i \\;\\land\\; t_i - t_j \\le \\tau_{\\max} \\right\\}",
      "p": "For query event $i$ with key $k_i$ at time $t_i$, the as-of join identifies reference index $j^*$ with the latest timestamp $t_j$ strictly before $t_i$, bounded by maximum lookback tolerance $\\tau_{\\max}$."
    },
    {
      "h": "Lookahead Leakage Violation Condition",
      "tex": "\\exists i, j : \\text{Joined}(i, j) \\implies t_j > t_i \\quad [\\text{Fatal Target Leakage}]",
      "p": "If any feature state incorporated at decision time $t_i$ derives from an event at $t_j > t_i$, the offline validation model evaluates with non-causal future information."
    }
  ],
  "code": "import pandas as pd\nimport numpy as np\n\n# Create trade execution events (primary table)\ntrades = pd.DataFrame({\n    'timestamp': pd.to_datetime([\n        '2026-03-15 10:00:02Z',\n        '2026-03-15 10:00:07Z',\n        '2026-03-15 10:00:15Z'\n    ]),\n    'symbol': ['AAPL', 'AAPL', 'AAPL'],\n    'shares': [100, 250, 50]\n})\n\n# Create asynchronous quote updates (reference table)\nquotes = pd.DataFrame({\n    'timestamp': pd.to_datetime([\n        '2026-03-15 10:00:00Z',\n        '2026-03-15 10:00:05Z',\n        '2026-03-15 10:00:12Z',\n        '2026-03-15 10:00:20Z'\n    ]),\n    'symbol': ['AAPL', 'AAPL', 'AAPL', 'AAPL'],\n    'bid_price': [182.10, 182.25, 182.15, 182.40]\n})\n\n# Sort both frames by timestamp (prerequisite for merge_asof)\ntrades = trades.sort_values('timestamp')\nquotes = quotes.sort_values('timestamp')\n\n# Point-in-time backward join: find the latest quote before each trade\nenriched_trades = pd.merge_asof(\n    trades,\n    quotes,\n    on='timestamp',\n    by='symbol',\n    direction='backward',\n    tolerance=pd.Timedelta('10s')\n)\n\nprint(enriched_trades[['timestamp', 'symbol', 'shares', 'bid_price']])\n# Output matches 10:00:02 -> 182.10, 10:00:07 -> 182.25, 10:00:15 -> 182.15",
  "keyPoints": [
    "Store and transport timestamps exclusively in UTC; convert to local civil time solely for domain features or reporting.",
    "As-of joins match each record with the most recent preceding entry from another table, preventing future data leakage.",
    "Temporal joins require both dataframes to be sorted chronologically on the join timestamp.",
    "Daylight saving transitions cause duplicate hours in autumn and missing hours in spring in naive local datetimes."
  ],
  "pitfalls": [
    "Using naive datetime objects without timezone metadata (`tz_localize(None)`), causing silent 1-to-5 hour offsets when merging across systems.",
    "Performing standard forward joins or nearest joins in trading or medical records, allowing future outcomes to leak into predictive features.",
    "Neglecting daylight saving shifts when aggregating by \"local hour of day\", resulting in artificial spikes or dips twice a year."
  ],
  "quiz": [
    {
      "q": "Why should database timestamps almost always be stored in UTC rather than local time?",
      "o": [
        "UTC stores smaller integer values that take half the disk space",
        "UTC provides an unambiguous, monotonic timeline free from daylight saving anomalies and timezone shifts",
        "Database engines cannot index columns that contain timezone offsets",
        "UTC automatically handles categorical variable encodings"
      ],
      "a": 1,
      "why": "UTC is an invariant, continuous reference standard without discontinuities caused by daylight saving changes or local government decree."
    },
    {
      "q": "What distinguishes an as-of join (`merge_asof`) with `direction=\"backward\"` from an inner join?",
      "o": [
        "It requires exact timestamp equivalence across both tables",
        "It pairs each row in the left table with the closest preceding timestamp in the right table",
        "It replaces missing values with the overall column mean",
        "It randomly samples rows from the secondary dataset"
      ],
      "a": 1,
      "why": "A backward as-of join matches each record with the most recent historical record that occurred at or before that record's timestamp."
    },
    {
      "q": "What critical machine learning error occurs if an analyst uses `direction=\"nearest\"` when enriching transaction data with reference prices?",
      "o": [
        "Multicollinearity in continuous predictors",
        "Lookahead leakage, because future reference prices after the transaction could be selected",
        "Underfitting due to excessive regularisation",
        "Covariate shift between train and test sets"
      ],
      "a": 1,
      "why": "`direction=\"nearest\"` can select a reference timestamp that occurred in the future relative to the transaction, leaking unavailable future information into features."
    }
  ],
  "related": [
    "data-leakage",
    "pandas-and-polars-patterns",
    "train-validation-test-splits-group-and-time-based"
  ],
  "keywords": "dates, time zones, temporal joins, as-of join, merge_asof, utc, daylight saving, lookahead leakage, point-in-time correctness",
  "usedBy": []
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
  {
  "id": "binning-and-discretisation",
  "short": "Binning & discretisation",
  "title": "Binning and Discretisation: Transforming Continuous Predictors",
  "task": "concepts",
  "level": 2,
  "minutes": 14,
  "noLab": true,
  "summary": "Converting continuous variables into discrete intervals using uniform, quantile, k-means, and supervised decision tree binning strategies.",
  "lead": "Continuous features often exhibit non-linear relationships, extreme outliers, or multimodal distributions that linear and generalised additive models struggle to capture directly. Discretisation maps continuous scales into discrete ordinal or categorical bins, introducing non-linear step responses, dampening outlier sensitivity, and producing interpretable scorecards.",
  "analogy": "Consider categorising human ages for life insurance. Rather than forcing a single rigid linear relationship across all ages from 0 to 100, insurers split ages into distinct brackets: 18–25, 26–40, 41–60, and 60+. Within each bucket, risk is relatively uniform, and the risk premium can step up discretely without requiring complex high-degree polynomial curves.",
  "intuition": [
    "Discretisation partitions the domain of a continuous variable $X$ into $K$ intervals $[b_{k-1}, b_k)$, assigning each observation a discrete bin index or one-hot indicator. This effectively replaces a single continuous parameter with $K$ piecewise constant basis functions.",
    "Unsupervised discretisation relies solely on feature distributions. Equal-width (uniform) binning divides the range into intervals of identical length, but is vulnerable to outliers compressing the vast majority of data into one bin. Equal-frequency (quantile) binning places an identical number of samples in every bin, making it robust against heavy tails and skewness.",
    "Clustering-based binning (e.g. 1D k-means) clusters values into natural density modes, setting cut points midway between cluster centroids.",
    "Supervised discretisation uses the target variable $y$ to determine optimal cutoffs. A single-variable decision tree finds split thresholds that maximise mutual information or minimise impurity with respect to $y$, directly isolating regions of differing risk or class probability."
  ],
  "steps": [
    "Assess variable distribution: Inspect histograms, skewness, and kurtosis to determine whether the feature is uniform, bell-shaped, or heavily tailed.",
    "Select binning strategy: Choose equal-frequency for skewed distributions, equal-width for uniformly bounded metrics, or decision tree binning for non-linear target associations.",
    "Compute cut points on training data only: Fit bin edges $\\{b_0, b_1, \\dots, b_K\\}$ strictly on the training partition to avoid data leakage.",
    "Handle boundary conditions: Ensure the outer edges extend to $(-\\infty, \\infty)$ so unseen minimum or maximum values in production do not produce missing values.",
    "Encode discrete intervals: Encode bins as ordinal integers (for tree models) or one-hot dummy variables (for linear models and credit scorecards)."
  ],
  "math": [
    {
      "h": "Equal-Width (Uniform) Interval Partitioning",
      "tex": "w = \\frac{\\max(X) - \\min(X)}{K}, \\quad b_k = \\min(X) + k \\cdot w, \\quad k \\in \\{0, 1, \\dots, K\\}",
      "p": "Equal-width binning divides the total observed range into $K$ intervals of fixed length $w$."
    },
    {
      "h": "Equal-Frequency (Quantile) Partitioning",
      "tex": "b_k = Q_X\\left(\\frac{k}{K}\\right), \\quad P(X \\in [b_{k-1}, b_k)) = \\frac{1}{K}",
      "p": "Quantile binning places bin edges at percentiles such that each of the $K$ bins contains exactly $1/K$ of the empirical probability mass."
    },
    {
      "h": "Piecewise Constant Basis Expansion",
      "tex": "f(X) = \\sum_{k=1}^K w_k \\cdot \\mathbb{I}(X \\in [b_{k-1}, b_k))",
      "p": "Linear models fit a separate weight $w_k$ to each bin indicator $\\mathbb{I}$, learning arbitrary piecewise constant step functions without explicit polynomial features."
    }
  ],
  "code": "import numpy as np\nfrom sklearn.preprocessing import KBinsDiscretizer\n\n# Generate skewed continuous data (e.g. income or transaction amounts)\nnp.random.seed(42)\nincome = np.random.exponential(scale=35000, size=1000).reshape(-1, 1)\n\n# Fit quantile-based discretisation (5 bins with equal sample frequency)\nquantile_bin = KBinsDiscretizer(n_bins=5, encode='ordinal', strategy='quantile')\nbinned_q = quantile_bin.fit_transform(income)\n\n# Fit uniform (equal-width) discretisation\nuniform_bin = KBinsDiscretizer(n_bins=5, encode='ordinal', strategy='uniform')\nbinned_u = uniform_bin.fit_transform(income)\n\nprint(\"Quantile cut points:\\n\", np.round(quantile_bin.bin_edges_[0], 1))\nprint(\"Quantile bin counts:\\n\", np.bincount(binned_q.flatten().astype(int)))\nprint(\"Uniform bin counts (heavily imbalanced):\\n\", np.bincount(binned_u.flatten().astype(int)))\n# Notice quantile creates balanced ~200 items/bin, while uniform starves upper bins",
  "keyPoints": [
    "Discretisation converts continuous variables into discrete bins, enabling linear models to learn non-linear step responses.",
    "Quantile (equal-frequency) binning handles heavy-tailed skewed distributions without collapsing all samples into one bin.",
    "Cut points must always be calculated strictly on the training set and applied unchanged to validation and test sets.",
    "Supervised binning using decision tree splits finds thresholds that directly optimise class separation."
  ],
  "pitfalls": [
    "Information loss: Discretisation discards fine-grained intra-bin variance, treating all values within an interval as completely identical.",
    "Arbitrary boundary artifacts: Two data points on opposite sides of a cut boundary (e.g. 49.9 and 50.1) receive different representations, while 50.1 and 69.9 receive the same.",
    "Calculating quantile thresholds on the combined dataset before train/test splitting, causing target leakage."
  ],
  "quiz": [
    {
      "q": "What is the primary vulnerability of equal-width (uniform) binning when applied to skewed distributions?",
      "o": [
        "It requires computationally expensive iterative matrix inversion",
        "Outliers stretch the range, crowding the vast majority of observations into a single bin",
        "It cannot be encoded into one-hot binary columns",
        "It violates the Gauss-Markov theorem for linear regression"
      ],
      "a": 1,
      "why": "In a skewed distribution with extreme outliers, the span $(\\max - \\min)$ is dominated by rare values, leaving nearly all normal observations compressed into the first interval."
    },
    {
      "q": "Why does quantile binning generally outperform equal-width binning for financial variables like wealth or income?",
      "o": [
        "It guarantees an equal number of samples in every bin, making it robust against extreme long tails",
        "It transforms categorical strings into continuous floating point numbers",
        "It eliminates the need for cross-validation",
        "It enforces normal Gaussianity on the output labels"
      ],
      "a": 0,
      "why": "Quantile binning places cutoffs at empirical percentiles, ensuring balanced sample support across all bins regardless of distribution skewness."
    },
    {
      "q": "What must an engineer ensure when deploying a fitted discretiser to production inference?",
      "o": [
        "Bin edges must be recomputed on each incoming production batch",
        "The first and last intervals must cover $(-\\infty, \\infty)$ to handle extreme values without generating NaNs",
        "Every bin must contain an odd number of samples",
        "The target variable must be passed alongside the test features"
      ],
      "a": 1,
      "why": "Production features may exhibit values lower than the training minimum or higher than the maximum. Infinite bounds prevent out-of-range errors."
    }
  ],
  "related": [
    "encoding-categoricals-one-hot-ordinal-target-woe",
    "scaling-and-transforms-standard-robust-box-cox-yeo-johnson",
    "outlier-handling"
  ],
  "keywords": "binning, discretisation, kbinsdiscretizer, equal width, equal frequency, quantile binning, step function, feature engineering",
  "usedBy": []
},
  {
  "id": "interactions-and-polynomial-features",
  "short": "Interactions & polynomials",
  "title": "Interactions and Polynomial Features: Capturing Non-Linear Synergies",
  "task": "concepts",
  "level": 2,
  "minutes": 15,
  "noLab": true,
  "summary": "Constructing multiplicative feature interactions and polynomial expansions to model non-linear synergies while managing combinatorial feature explosion.",
  "lead": "Linear models inherently assume that the effect of one feature on the target is entirely independent of all other features. In real-world phenomena, however, effects are deeply interactive: the impact of advertising depends on household income, and drug efficacy depends on patient body mass. Constructing interaction terms and polynomial features enables linear algorithms to capture multiplicative synergies and curved response surfaces.",
  "analogy": "Imagine baking bread. Flour and yeast each contribute weight, but their true effect on loaf height occurs through their interactive combination: yeast without flour yields zero bread, and flour without yeast yields flatbread. A model that only adds individual flour weight plus yeast weight misses the multiplicative reaction entirely.",
  "intuition": [
    "In a standard linear regression $\\hat{y} = w_1 x_1 + w_2 x_2 + b$, the marginal derivative $\\frac{\\partial \\hat{y}}{\\partial x_1} = w_1$ is constant. It never changes regardless of whether $x_2$ is tiny or massive.",
    "Adding an interaction term $x_1 x_2$ yields $\\hat{y} = w_1 x_1 + w_2 x_2 + w_{12} (x_1 x_2) + b$. Now the marginal effect $\\frac{\\partial \\hat{y}}{\\partial x_1} = w_1 + w_{12} x_2$ depends directly on the level of $x_2$, unlocking synergy or antagonism modelling.",
    "Polynomial features expand individual inputs to higher powers ($x_1^2, x_1^3$), allowing linear models to fit quadratic parabolas, cubic curves, and multi-dimensional saddle surfaces.",
    "The primary danger of polynomial and interaction expansion is combinatorial explosion. Expanding $d$ features to degree $p$ generates $\\binom{d+p}{p}$ terms. For 100 features at degree 2, this produces 5,151 columns, leading to extreme multicollinearity, memory bloat, and severe overfitting unless paired with L1 regularisation (Lasso) or domain-guided selection."
  ],
  "steps": [
    "Domain hypothesis generation: Identify intuitive pairwise synergies based on physical or business logic (e.g. $\\text{speed} \\times \\text{time} = \\text{distance}$, $\\text{price} \\times \\text{quantity} = \\text{revenue}$) before blind generation.",
    "Feature standardisation: Standardise raw continuous variables before creating polynomial terms to prevent high-degree powers from exploding to huge numerical scales.",
    "Polynomial expansion: Generate cross-products and powers up to degree 2 or 3 using matrix operations or `PolynomialFeatures`.",
    "Filter collinear columns: Check correlation matrices and variance inflation factors (VIF) to detect near-duplicate collinear interaction terms.",
    "Regularised model fitting: Train linear models with L1/L2 regularisation (e.g. ElasticNet) to drive irrelevant cross-products to zero."
  ],
  "math": [
    {
      "h": "Two-Way Multiplicative Interaction Model",
      "tex": "\\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + w_{12} (x_1 x_2)",
      "p": "The interaction coefficient $w_{12}$ represents the change in the slope of $x_1$ per unit increase in $x_2$."
    },
    {
      "h": "Combinatorial Dimensionality Expansion",
      "tex": "D_{\\mathrm{expanded}} = \\binom{d + p}{p} = \\frac{(d + p)!}{d! \\, p!}",
      "p": "Expanding a $d$-dimensional feature vector up to polynomial degree $p$ scales factorially, necessitating strict feature pruning."
    },
    {
      "h": "Marginal Rate of Substitution / Sensitivity",
      "tex": "\\frac{\\partial \\hat{y}}{\\partial x_1} = w_1 + w_{12} x_2 + 2 w_{11} x_1",
      "p": "With both interaction and quadratic terms, the sensitivity of predictions to changes in $x_1$ is a function of both $x_1$ and $x_2$."
    }
  ],
  "code": "import numpy as np\nfrom sklearn.preprocessing import PolynomialFeatures, StandardScaler\nfrom sklearn.linear_model import LassoCV\n\n# Generate synthetic non-linear interaction data: y = 2*x1 - 3*x2 + 4*(x1*x2) + noise\nnp.random.seed(42)\nX_raw = np.random.uniform(-2, 2, size=(200, 3))  # 3 features: x0, x1, x2\ny = 2.0 * X_raw[:, 0] - 3.0 * X_raw[:, 1] + 4.0 * (X_raw[:, 0] * X_raw[:, 1]) + np.random.normal(0, 0.5, 200)\n\n# Standardise before polynomial expansion\nscaler = StandardScaler()\nX_norm = scaler.fit_transform(X_raw)\n\n# Generate degree-2 interaction features (including bias and squares)\npoly = PolynomialFeatures(degree=2, include_bias=False)\nX_poly = poly.fit_transform(X_norm)\nfeature_names = poly.get_feature_names_out(['x0', 'x1', 'x2'])\n\n# Fit Lasso to automatically select the true interaction terms\nlasso = LassoCV(cv=5).fit(X_poly, y)\n\nprint(\"Expanded feature count:\", X_poly.shape[1])\nselected = [(name, round(coef, 2)) for name, coef in zip(feature_names, lasso.coef_) if abs(coef) > 0.1]\nprint(\"Lasso selected non-zero features:\", selected)\n# Output reveals strong weights on x0, x1, and the cross-product x0*x1",
  "keyPoints": [
    "Interaction terms allow the marginal effect of one predictor to depend on the magnitude of another.",
    "Polynomial features enable linear algorithms to fit smooth non-linear curves and saddle points.",
    "Combinatorial expansion generates thousands of features rapidly, creating multicollinearity and overfitting risks.",
    "Regularisation methods (Lasso, ElasticNet) are critical to prune redundant interaction terms."
  ],
  "pitfalls": [
    "Expanding unscaled features: Raising variables with large raw scales (e.g. salaries of 100,000) to powers causes extreme floating point overflow and gradient instability.",
    "Failing to keep main effects: Removing linear terms ($x_1, x_2$) while retaining their interaction ($x_1 x_2$) creates models whose interpretation changes drastically under simple coordinate shifts.",
    "Overfitting on small samples: Degree-3 or degree-4 expansions on modest datasets fit random noise patterns perfectly, collapsing test set generalisation."
  ],
  "quiz": [
    {
      "q": "What is the mathematical meaning of the coefficient $w_{12}$ on the interaction term $x_1 x_2$?",
      "o": [
        "The baseline prediction when all features are zero",
        "The rate at which the slope of $x_1$ with respect to $y$ changes as $x_2$ varies",
        "The correlation coefficient between $x_1$ and $x_2$",
        "The shrinkage factor applied to regularise the model"
      ],
      "a": 1,
      "why": "Differentiating $\\hat{y}$ with respect to $x_1$ yields $w_1 + w_{12} x_2$. Thus $w_{12}$ indicates how the impact of $x_1$ shifts per unit change in $x_2$."
    },
    {
      "q": "What severe issue arises when blindly generating degree-2 polynomial features on a dataset with 500 columns?",
      "o": [
        "The feature count balloons to over 125,000 columns, causing memory exhaustion and extreme overfitting",
        "Linear models can no longer compute convex loss gradients",
        "All correlation coefficients become exactly zero",
        "Decision tree algorithms will fail to split on the data"
      ],
      "a": 0,
      "why": "Formula $\\binom{500+2}{2} = 125{,}751$ terms (including the constant term). Such explosive dimensionality overwhelms memory and requires aggressive regularisation or domain pruning."
    },
    {
      "q": "Why should continuous variables be standardised prior to computing polynomial expansions?",
      "o": [
        "To ensure all target labels are strictly positive",
        "To prevent high powers from producing astronomical numerical scales and numerical overflow",
        "To convert categorical strings into integers",
        "To force all interaction coefficients to equal 1.0"
      ],
      "a": 1,
      "why": "Variables with large magnitudes ($10^4$) when squared become $10^8$, creating vast disparities in feature magnitudes that destabilise optimisation algorithms."
    }
  ],
  "related": [
    "scaling-and-transforms-standard-robust-box-cox-yeo-johnson",
    "binning-and-discretisation",
    "scikit-learn-pipelines-and-columntransformer"
  ],
  "keywords": "interactions, polynomial features, multiplicative synergy, cross-products, polynomial expansion, combinatorial explosion, feature engineering",
  "usedBy": []
},
  {
  "id": "date-and-text-features",
  "short": "Date & text features",
  "title": "Date and Text Features: Engineering Tabular Signals from Unstructured Inputs",
  "task": "concepts",
  "level": 2,
  "minutes": 16,
  "noLab": true,
  "summary": "Extracting high-value cyclical calendar signals and bag-of-words or embedding representations for tabular machine learning models.",
  "lead": "Tabular machine learning models cannot directly process raw timestamps or free-form text strings. Converting calendar timestamps into cyclical trigonometric components and holiday indicators, while extracting term statistics, TF-IDF weights, or dense pretrained embeddings from text fields, unlocks high-signal tabular predictors without full deep language model infrastructure.",
  "analogy": "Imagine a shopkeeper tracking sales notes. A timestamp like \"2026-12-25 09:30\" means little to an arithmetic equation until separated into \"Christmas Day\", \"Friday\", \"Morning rush\", and \"Month 12\". Similarly, a customer review saying \"the battery melted immediately\" is useless as a string, but highly predictive once flagged with high-severity sentiment terms and n-gram keyword counts.",
  "intuition": [
    "Raw dates contain rich multi-scale periodicity: intraday hour (24-hour cycle), day of week (7-day cycle), day of month (payday effects), month of year (seasonal cycle), and boolean holiday flags.",
    "Treating cyclical calendar variables as simple integers (e.g. mapping hours to $0, 1, \\dots, 23$) introduces a severe false discontinuity: hour 23 and hour 0 appear 23 units apart despite being consecutive 60-minute neighbours. Sine and cosine trigonometric encodings $\\sin(2\\pi t / T)$ and $\\cos(2\\pi t / T)$ map time onto a smooth continuous 2D circle where 23:59 wraps seamlessly into 00:00.",
    "Text fields in tabular datasets (product descriptions, customer support tickets, error logs) range from short categorical phrases to long paragraphs. Lightweight tabular text engineering uses token length, uppercase character ratios, punctuation counts, and n-gram TF-IDF representations.",
    "Alternatively, passing short text through a small pretrained sentence transformer generates dense 384-dimensional embeddings, which can be compressed via TruncatedSVD or PCA into 8–16 dense numerical columns for gradient boosted decision trees."
  ],
  "steps": [
    "Calendar component decomposition: Extract year, month, day, day of week, day of year, hour, and is_weekend booleans from canonical UTC timestamps.",
    "Trigonometric cyclical encoding: Transform periodic variables (hour, day of week, month) into paired sine and cosine coordinates to preserve circle topology.",
    "Calendar event enrichment: Join country-specific public holiday calendars, commercial sales events (e.g. Black Friday), and financial reporting period closes.",
    "Text surface feature extraction: Compute character lengths, word counts, uppercase letter ratios, exclamation frequencies, and language identification.",
    "Dense text representation: Compute TF-IDF matrices (with n-gram range (1, 2) and minimum document frequency threshold) or SVD-reduced sentence embeddings, concatenating them with tabular feature arrays."
  ],
  "math": [
    {
      "h": "Cyclical Periodic Coordinate Projection",
      "tex": "x_{\\sin} = \\sin\\left(\\frac{2\\pi t}{T}\\right), \\quad x_{\\cos} = \\cos\\left(\\frac{2\\pi t}{T}\\right)",
      "p": "Projects periodic index $t \\in [0, T)$ onto the 2D unit circle, ensuring Euclidean distance between boundary values $t=0$ and $t=T-1$ reflects true temporal proximity."
    },
    {
      "h": "Circular Euclidean Distance Invariance",
      "tex": "\\|(\\sin\\theta_1 - \\sin\\theta_2)^2 + (\\cos\\theta_1 - \\cos\\theta_2)^2\\| = 2 - 2\\cos(\\theta_1 - \\theta_2) = 4\\sin^2\\left(\\frac{\\theta_1 - \\theta_2}{2}\\right)",
      "p": "The Euclidean distance between two points in projected sinusoidal space is a monotonic function of the angular difference along the cycle."
    },
    {
      "h": "Term Frequency-Inverse Document Frequency (TF-IDF)",
      "tex": "\\mathrm{tfidf}(t, d, D) = \\mathrm{tf}(t, d) \\times \\ln\\left(\\frac{1 + |D|}{1 + |\\{d \\in D : t \\in d\\}|}\\right) + 1",
      "p": "Measures the informational specificity of token $t$ in document $d$ relative to the entire tabular corpus $D$."
    }
  ],
  "code": "import numpy as np\nimport pandas as pd\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.decomposition import TruncatedSVD\n\n# Sample tabular data with timestamps and customer support notes\ndf = pd.DataFrame({\n    'timestamp': pd.to_datetime([\n        '2026-01-01 23:45:00',\n        '2026-01-02 00:15:00',\n        '2026-07-15 14:30:00'\n    ]),\n    'ticket_text': [\n        'Payment gateway returned fatal timeout error',\n        'Unable to complete purchase during checkout timeout',\n        'How do I update my profile mailing address'\n    ]\n})\n\n# 1. Cyclical hour encoding\nhours = df['timestamp'].dt.hour + df['timestamp'].dt.minute / 60.0\ndf['hour_sin'] = np.sin(2 * np.pi * hours / 24.0)\ndf['hour_cos'] = np.cos(2 * np.pi * hours / 24.0)\n\n# 2. Text feature extraction: character count and TF-IDF\ndf['text_len'] = df['ticket_text'].str.len()\ntfidf = TfidfVectorizer(max_features=10, stop_words='english')\ntfidf_matrix = tfidf.fit_transform(df['ticket_text'])\n\n# Reduce text dimensionality for tabular inclusion\nsvd = TruncatedSVD(n_components=2, random_state=42)\ntext_dense = svd.fit_transform(tfidf_matrix)\ndf['text_svd_1'] = text_dense[:, 0]\ndf['text_svd_2'] = text_dense[:, 1]\n\nprint(df[['hour_sin', 'hour_cos', 'text_len', 'text_svd_1']])\n# Observe hour 23:45 and 00:15 have nearly identical trigonometric coordinates",
  "keyPoints": [
    "Trigonometric sine/cosine encodings eliminate artificial boundary gaps between consecutive cyclical times (e.g. 23:59 and 00:00).",
    "Decomposing dates into hierarchical calendar units (day of week, holiday flag, quarter) reveals seasonality to tree algorithms.",
    "Text fields can be efficiently represented using word counts, TF-IDF weights, or SVD-reduced sentence embeddings.",
    "Always fit text vectorisers and normalisers exclusively on training data to prevent out-of-fold vocabulary leakage."
  ],
  "pitfalls": [
    "Using only sine without cosine: Sine alone creates an ambiguous mapping where two distinct times of day (e.g. 06:00 and 18:00) share the exact same value.",
    "High-dimensional sparse text vectors in tree models: Passing raw 50,000-column TF-IDF matrices to LightGBM or XGBoost causes memory thrashing; reduce via SVD first.",
    "Ignoring local time when calculating \"hour of day\": UTC 02:00 corresponds to mid-morning in Tokyo but late evening in London."
  ],
  "quiz": [
    {
      "q": "Why is it necessary to include both sine and cosine terms when cyclically encoding hours of the day?",
      "o": [
        "Because linear regression requires even numbers of input variables",
        "A single trigonometric wave produces identical values for two distinct times within each 24-hour cycle",
        "Cosine removes the effect of leap years",
        "Decision trees cannot split on negative floating point numbers"
      ],
      "a": 1,
      "why": "The sine function is non-monotonic on $[0, 2\\pi)$, producing identical values for distinct hours (e.g. $\\sin(\\pi/4) = \\sin(3\\pi/4)$). Paired sine and cosine coordinates uniquely identify every point on the circle."
    },
    {
      "q": "What is the most effective way to include free-text descriptions into a gradient boosted tree model alongside tabular columns?",
      "o": [
        "Convert the entire text into a single integer hash",
        "Extract length/token metadata and reduce TF-IDF or embedding vectors to a small number of dense components via SVD",
        "Train an end-to-end 70-billion parameter LLM for every single tabular row",
        "Delete the text column because decision trees only support binary indicators"
      ],
      "a": 1,
      "why": "Gradient boosted trees handle a moderate number of continuous dense signals well. Compressing text representations with SVD or sentence embeddings preserves semantic variance without overwhelming tree splits."
    },
    {
      "q": "What issue arises when integer encoding the month of the year (1 to 12) in distance-based algorithms like k-NN?",
      "o": [
        "December (12) and January (1) appear maximally distant (distance 11) despite being consecutive months",
        "The algorithm will fail to converge to a global minimum",
        "The target distribution becomes multimodal",
        "Matrix inversion yields an ill-conditioned determinant"
      ],
      "a": 0,
      "why": "In linear integer encoding, 12 and 1 have an artificial distance of 11, obscuring winter seasonality across year boundaries."
    }
  ],
  "related": [
    "dates-time-zones-and-temporal-joins",
    "bag-of-words-and-tf-idf",
    "encoding-categoricals-one-hot-ordinal-target-woe"
  ],
  "keywords": "date features, text features, cyclical encoding, sine cosine encoding, tf-idf, truncated svd, calendar features, tabular feature engineering",
  "usedBy": []
},
  {
  "id": "feature-hashing-and-high-cardinality-columns",
  "short": "Feature hashing & cardinality",
  "title": "Feature Hashing and High-Cardinality Columns: The Hashing Trick",
  "task": "concepts",
  "level": 2,
  "minutes": 15,
  "noLab": true,
  "summary": "Handling massive categorical feature spaces with the hashing trick (MurmurHash) to bound memory, handle unseen categories, and avoid dictionary lookups.",
  "lead": "When categorical variables contain hundreds of thousands or millions of unique levels (such as user IDs, IP addresses, URL tokens, or search queries), standard one-hot encoding creates enormous, unmanageable sparse matrices that exhaust memory and break distributed pipelines. The hashing trick maps arbitrary string tokens into a fixed-size vector space using fast deterministic hash functions, bounding memory usage and effortlessly absorbing previously unseen levels.",
  "analogy": "Imagine a coat check room in a massive convention centre with 500,000 attendees. Building a dedicated numbered hook for every single potential person would require a vast warehouse. Instead, the cloakroom uses 4,096 pigeonholes numbered $0$ to $4095$. When you arrive, your name is converted into a pigeonhole number via a fixed mathematical formula. Occasionally two people share a pigeonhole, but coats take up vastly less physical room, and anyone arriving with an unexpected ticket can be accommodated immediately.",
  "intuition": [
    "Standard categorical encodings (one-hot, frequency, target encoding) require maintaining a global vocabulary mapping each token to an integer index. In streaming environments and massive datasets, maintaining this vocabulary causes memory growth, synchronisation bottlenecks across worker nodes, and failure on unseen out-of-vocabulary (OOV) tokens.",
    "The hashing trick (Weinberger et al., 2009) replaces the dictionary lookup with a deterministic hash function $h(x) \\pmod B$, which directly maps any arbitrary string token to an index in a fixed $B$-dimensional array.",
    "To prevent collision bias, a second independent sign hash function $\\xi(x) \\in \\{-1, +1\\}$ is applied. If two uncorrelated tokens happen to hash to the same bucket, their expected inner product remains zero because their signs cancel out in expectation.",
    "The trade-off is hash collision: multiple tokens mapped to the same index introduce slight variance into feature coefficients. By choosing bucket size $B$ sufficiently large relative to the number of active non-zero features per sample, collisions remain negligible while guaranteeing strict, constant memory bounds."
  ],
  "steps": [
    "Determine feature sparsity and budget: Choose bucket dimension $B = 2^b$ (typically $2^{18}$ to $2^{22}$ in production ad-tech) balancing memory constraints against collision probability.",
    "Select fast non-cryptographic hash: Use fast hash algorithms such as MurmurHash3 or xxHash for high-throughput string hashing.",
    "Compute bucket index and sign: For token $x$, compute index $j = |h(x)| \\pmod B$ and sign $\\xi(x) = 2 \\cdot (h_2(x) \\pmod 2) - 1$.",
    "Accumulate feature vector: Add $\\xi(x)$ (or $\\xi(x) \\times \\text{value}$) into index $j$ of the sparse sample vector.",
    "Fit online or linear model: Train models such as Vowpal Wabbit, SGDClassifier, or sparse linear networks directly on the hashed sparse arrays."
  ],
  "math": [
    {
      "h": "Hashing Trick Feature Mapping",
      "tex": "\\phi_j(x) = \\sum_{i : h(x_i) = j} \\xi(x_i) \\cdot v_i, \\quad j \\in \\{0, 1, \\dots, B-1\\}",
      "p": "Maps an arbitrary token $x_i$ with value $v_i$ into bucket $j$ using primary hash $h$ and signed hash $\\xi$."
    },
    {
      "h": "Unbiased Inner Product Preservation",
      "tex": "\\mathbb{E}[\\langle \\phi(u), \\phi(v) \\rangle] = \\langle u, v \\rangle, \\quad \\operatorname{Var}(\\langle \\phi(u), \\phi(v) \\rangle) = \\frac{1}{B} \\left( \\|u\\|^2 \\|v\\|^2 + \\langle u, v \\rangle^2 \\right)",
      "p": "Under independent sign hashing $\\xi$, the expected inner product is completely unbiased, with collision variance decaying inversely with bucket size $B$."
    },
    {
      "h": "Birthday Paradox Collision Expectation",
      "tex": "P(\\text{collision}) \\approx 1 - \\exp\\left( -\\frac{k(k - 1)}{2B} \\right)",
      "p": "Estimates the probability of at least one collision when hashing $k$ distinct active tokens into $B$ discrete buckets."
    }
  ],
  "code": "import numpy as np\nfrom sklearn.feature_extraction import FeatureHasher\n\n# High-cardinality categorical records (e.g. ad impressions with millions of user IDs and domains)\nrecords = [\n    {'user_id': 'usr_948271', 'domain': 'techcrunch.com', 'country': 'GB'},\n    {'user_id': 'usr_102938', 'domain': 'github.com', 'country': 'US'},\n    {'user_id': 'usr_948271', 'domain': 'reddit.com', 'country': 'GB'},\n    {'user_id': 'usr_unseen_9999', 'domain': 'bbc.co.uk', 'country': 'GB'}  # Unseen user at inference\n]\n\n# Set fixed hash space to 2^10 = 1024 buckets (strictly bounded memory)\nhasher = FeatureHasher(n_features=1024, input_type='dict')\nsparse_hashed = hasher.fit_transform(records)\n\nprint(\"Hashed sparse matrix shape:\", sparse_hashed.shape)\nprint(\"Non-zero entries in first row:\", sparse_hashed[0].nnz)\nprint(\"Memory bound: Exactly 1024 columns regardless of how many millions of new users arrive!\")\n# Handles unseen user 'usr_unseen_9999' instantly without re-fitting or vocabulary lookup",
  "keyPoints": [
    "The hashing trick maps unbounded categorical strings to a fixed $B$-dimensional space using fast hash functions.",
    "Eliminates vocabulary storage and inter-worker dictionary synchronisation in distributed clusters.",
    "Handles out-of-vocabulary tokens seamlessly at inference time without re-indexing.",
    "Signed hashing ensures the expected inner product between samples is mathematically unbiased."
  ],
  "pitfalls": [
    "Irreversible representation: Once hashed, feature names cannot be recovered from bucket indices, making coefficient interpretation difficult.",
    "Bucket undersizing: If $B$ is set too small relative to the number of distinct categories, excessive collisions corrupt signal and degrade accuracy.",
    "Hashing noise features: Hashing pure random identifiers that possess zero predictive power still consumes bucket capacity and increases collision noise."
  ],
  "quiz": [
    {
      "q": "What is the primary benefit of the hashing trick over standard one-hot encoding for massive categorical columns?",
      "o": [
        "It guarantees zero feature collisions under all circumstances",
        "It bounds memory usage to a constant size and requires no vocabulary dictionary lookup",
        "It forces gradient boosted trees to converge in a single iteration",
        "It automatically converts non-linear relationships into linear ones"
      ],
      "a": 1,
      "why": "Feature hashing allocates a fixed number of buckets, requiring zero vocabulary storage in memory and absorbing unseen tokens without schema updates."
    },
    {
      "q": "Why does the hashing trick employ a secondary sign hash function $\\xi(x) \\in \\{-1, +1\\}$?",
      "o": [
        "To ensure all output matrix entries are positive",
        "To make the expected inner product unbiased so random collisions cancel out in expectation",
        "To encrypt private customer identifiers against cyber attacks",
        "To accelerate matrix multiplication by avoiding floating point arithmetic"
      ],
      "a": 1,
      "why": "Independent sign hashing ensures $\\mathbb{E}[\\xi(u)\\xi(v)] = 0$ for distinct tokens $u \\ne v$, meaning collision interference averages to zero."
    },
    {
      "q": "What is a major operational downside of using feature hashing in production systems?",
      "o": [
        "It cannot process string inputs",
        "Loss of feature interpretability: you cannot trace a learned weight back to a specific category name",
        "It requires calculating the full Hessian matrix during inference",
        "It cannot be implemented in streaming Python pipelines"
      ],
      "a": 1,
      "why": "Hash functions are one-way projections. When a model assigns a large weight to bucket #4912, you cannot determine which original category produced it."
    }
  ],
  "related": [
    "encoding-categoricals-one-hot-ordinal-target-woe",
    "scikit-learn-pipelines-and-columntransformer",
    "bag-of-words-and-tf-idf"
  ],
  "keywords": "feature hashing, hashing trick, high-cardinality, featurehasher, murmurhash, collision, signed hashing, memory-bounded encoding",
  "usedBy": []
},
  {
    id: 'train-validation-test-splits-group-and-time-based',
    short: 'Splits: group and time-based',
    title: 'Train/Validation/Test Splits: Group and Time-Based',
    task: 'concepts',
    module: 'Pipelines and validation',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Partitioning data to mirror true production inference constraints, preventing optimistic bias caused by grouped customer records or temporal lookahead.`,
    lead: r`A naive random 80/20 split assumes observations are independent and identically distributed. In real-world data science, multiple rows often originate from the same patient, device, or customer, and data arrives chronologically over time. Group-aware and time-based splits enforce strict boundaries across clusters and time horizons, ensuring validation scores accurately reflect generalisation to unseen entities and future events.`,
    intuition: [
      r`Imagine building a diagnostic computer vision system to detect skin lesions. You collect 10,000 dermatoscopic images across 200 patients. If you shuffle the images uniformly into a standard 80/20 train/test split, photos from almost every patient appear in both the training set and the test set. The model can easily achieve 98% test accuracy simply by memorising patient-specific skin tones, hair patterns, lighting conditions, or hospital background tags. When you ship the model to a new clinic and test it on patient #201, performance collapses to 65% because the model learned patient identity rather than medical pathology. Group-based splitting prevents this by allocating all observations from any single patient exclusively to train or test.`,
      r`A parallel disaster unfolds in temporal forecasting. Suppose you predict daily supermarket sales. If you shuffle transactions randomly across a year, the training set will contain transactions from Monday, Wednesday, and Friday, while the validation set contains Tuesday and Thursday. The model predicts Tuesday's sales using information from Wednesday and Thursday—an impossible lookahead scenario in deployment. Time-based splitting enforces the chronological arrow of time: training on historical months (e.g. January through September) and validating strictly on subsequent months (e.g. October through December).`,
      r`The classic three-way partition separates concerns across the modelling lifecycle: the training set optimises internal model parameters; the validation set compares architectures, calibrates thresholds, and tunes hyperparameters; and the test set remains locked in an untouchable vault until final sign-off. Repeatedly consulting test metrics during model iteration leaks test information into human design decisions, turning the final evaluation into a disguised validation set.`,
    ],
    analogy: r`Testing a trainee doctor on new patients they have never examined before, rather than quizzing them on the exact same patients they observed during morning rounds.`,
    steps: [
      r`Audit structural dependencies: identify whether records cluster within entities (user ID, hospital, vehicle) or follow a continuous timeline.`,
      r`Select splitting architecture: use GroupKFold or GroupShuffleSplit for clustered entities, and TimeSeriesSplit or chronological holdout for sequential processes.`,
      r`Enforce temporal embargo gaps: when features use rolling lookback windows or labels take time to resolve, insert an embargo buffer between train and test.`,
      r`Isolate the final test vault: seal test data prior to exploratory analysis, feature extraction, and preprocessing fitment.`,
      r`Verify disjoint entity boundaries: programmatically assert that the intersection between training entity identifiers and validation entity identifiers is strictly empty.`,
    ],
    math: [
      {
        h: 'Disjoint group partition constraint',
        tex: r`\mathcal{G}_{\text{train}} \cap \mathcal{G}_{\text{val}} = \emptyset, \qquad \mathcal{G}_{\text{train}} \cup \mathcal{G}_{\text{val}} \subseteq \mathcal{G}`,
        p: r`Where $\mathcal{G}$ represents the universe of unique entity identifiers (such as user or device IDs), and $\mathcal{G}_{\text{train}}$ and $\mathcal{G}_{\text{val}}$ are the subsets allocated to training and validation. Enforcing zero intersection ensures that no entity-specific idiosyncrasies can leak across partition boundaries.`,
      },
      {
        h: 'Chronological split with purge and embargo gap',
        tex: r`\max_{i \in \mathcal{D}_{\text{train}}} t_i < t_{\text{split}} < t_{\text{split}} + \Delta t_{\text{embargo}} \le \min_{j \in \mathcal{D}_{\text{val}}} t_j`,
        p: r`Where $t_i$ is the event timestamp for record $i$, $t_{\text{split}}$ is the historical cutoff, and $\Delta t_{\text{embargo}}$ is an enforced purge window. Purging eliminates records whose rolling aggregations or future outcome resolutions span across the split boundary.`,
      },
      {
        h: 'Expected generalisation risk under cluster shift',
        tex: r`\mathcal{R}_{\text{group}}(\hat{f}) = \mathbb{E}_{G \sim \mathcal{P}_G} \left[ \mathbb{E}_{(X, Y) \sim \mathcal{P}_{XY|G}} [L(Y, \hat{f}(X))] \right]`,
        p: r`Validation evaluates expected loss across newly drawn groups $G \sim \mathcal{P}_G$ rather than repeated draws from known training groups. This provides an unbiased estimator of true out-of-distribution performance when deploying to fresh customers or environments.`,
      },
    ],
    keyPoints: [
      r`Random shuffling on clustered or longitudinal data creates severe optimistic bias by rewarding models that memorise entity identities.`,
      r`Chronological splits preserve the causal arrow of time, replicating true forward-looking production conditions.`,
      r`Purging and embargo gaps prevent subtle leakage caused by multi-day rolling features or forward-looking label windows near split cutoffs.`,
    ],
    pitfalls: [
      r`Randomly splitting panel datasets where multiple rows originate from the same user, machine, or household.`,
      r`Evaluating time series with standard k-fold cross-validation, allowing future information to train models predicting past events.`,
      r`Peeking at the final test set: adjusting hyperparameters or feature selections based on test feedback invalidates unbiased generalisation guarantees.`,
    ],
    code: r`import numpy as np

# 1. Simulate longitudinal data: 8 entities, 5 measurements each
np.random.seed(42)
n_groups, n_obs = 8, 5
group_ids = np.repeat(np.arange(n_groups), n_obs)
# Entity random intercepts induce strong intra-group correlation
group_effects = np.random.normal(0, 5.0, size=n_groups)
X = np.random.normal(0, 1.0, size=(n_groups * n_obs, 1))
y = 2.0 * X[:, 0] + group_effects[group_ids] + np.random.normal(0, 0.5, size=n_groups * n_obs)

# Standard random split: same groups appear in both train and test
perm = np.random.permutation(len(y))
train_idx_rand, test_idx_rand = perm[:24], perm[24:]
rand_overlap = len(set(group_ids[train_idx_rand]) & set(group_ids[test_idx_rand]))

# Group-aware split: groups are partitioned disjointly
unique_groups = np.unique(group_ids)
np.random.shuffle(unique_groups)
train_groups, test_groups = unique_groups[:5], unique_groups[5:]
train_idx_grp = np.isin(group_ids, train_groups)
test_idx_grp = np.isin(group_ids, test_groups)
grp_overlap = len(set(group_ids[train_idx_grp]) & set(group_ids[test_idx_grp]))

print(f"Random split shared entity overlap: {rand_overlap} groups")
print(f"Group split shared entity overlap:  {grp_overlap} groups")
print(f"Train groups: {[int(g) for g in train_groups]}, Test groups: {[int(g) for g in test_groups]}")`,
    quiz: [
      {
        q: r`Why does standard random k-fold cross-validation yield misleadingly optimistic accuracy when applied to multi-visit hospital patient records?`,
        o: [
          r`Because patient records can only be validated using leave-one-out cross-validation`,
          r`Because images and measurements from the same patient appear in both train and test folds, allowing models to memorise patient traits`,
          r`Because k-fold cross-validation forces all features to follow Gaussian distributions`,
          r`Because random splitting removes rows with missing values automatically`,
        ],
        a: 1,
        why: r`When multi-row records from the same patient are scattered randomly across folds, the model learns patient-specific quirks (skin tone, background artifacts) rather than generalisable disease patterns, producing false confidence.`,
      },
      {
        q: r`When splitting time-series data for a model forecasting demand 7 days ahead, why is an embargo or purge gap necessary at the split boundary?`,
        o: [
          r`To prevent rolling window features computed near the boundary from incorporating future post-split information`,
          r`To ensure the training dataset contains an even number of samples`,
          r`To artificially boost the variance of the validation predictions`,
          r`Because scikit-learn models crash if time steps are strictly contiguous`,
        ],
        a: 0,
        why: r`If features compute rolling multi-day averages or if target labels take several days to materialize, observations immediately preceding the split line may incorporate or overlap with target period data unless an embargo buffer is enforced.`,
      },
      {
        q: r`What is the primary role of the holdout test set compared to the validation set in a supervised learning project?`,
        o: [
          r`The test set is used to optimise gradient descent learning rates`,
          r`The test set is used for feature selection, while validation is used for training`,
          r`The test set provides an untouched, unbiased assessment of final generalisation after all model and tuning decisions are frozen`,
          r`The test set must be three times larger than the training set`,
        ],
        a: 2,
        why: r`Iterating on models, features, and hyperparameters against a validation set causes subtle validation overfitting. An untouched test set serves as the final arbiter of performance.`,
      },
    ],
    usedBy: [],
    prereq: ['cross-validation', 'bias-variance-tradeoff'],
    related: ['data-leakage', 'scikit-learn-pipelines-and-columntransformer', 'lag-and-rolling-window-features'],
    keywords: 'train test split group kfold time based split validation data leakage embargo purge temporal holdout',
  },
  {
    id: 'data-leakage',
    short: 'Data leakage',
    title: 'Data Leakage',
    task: 'concepts',
    module: 'Pipelines and validation',
    level: 2,
    minutes: 15,
    noLab: true,
    summary: r`Diagnosing and preventing the insidious contamination of training data with information available only at inference or in the future.`,
    lead: r`Data leakage occurs when information from outside the training partition—or information unavailable at the real-time moment of prediction—inadvertently contaminates model training. Leakage produces deceptively flawless cross-validation scores that abruptly collapse into catastrophic failures in production. Recognizing target leakage, feature leakage, and preprocessing leakage is essential for reliable machine learning.`,
    intuition: [
      r`Imagine training a machine learning model to predict whether a hospital patient will develop severe pneumonia. During feature engineering, you include a column called "Antibiotic IV Dosage Administered". In offline validation, the model achieves a miraculous 99.8% ROC-AUC. But in clinical practice, doctors only prescribe high-dose IV antibiotics after pneumonia has already been diagnosed! The model did not predict pneumonia; it merely detected the physician's reaction to pneumonia. This is classic target leakage—including a feature that is a downstream consequence of the target rather than a genuine antecedent predictor.`,
      r`A subtler, pervasive trap is preprocessing leakage. Suppose you standardise a dataset by subtracting the mean and dividing by the standard deviation. If you compute the mean and variance across the entire table before splitting into training and test sets, the training data has absorbed statistical parameters derived from the test set. If you perform feature selection or target encoding across the entire table, test labels directly influence the features selected for training, manufacturing artificial predictive power out of pure noise.`,
      r`The diagnostic hallmark of data leakage is performance that appears "too good to be true". Whenever a model achieves near-perfect metrics on a notoriously noisy or uncertain task, the cause is almost never an algorithmic breakthrough—it is almost always data leakage. Building strict isolation firewalls around the point of prediction ensures models rely solely on information that genuinely exists at decision time.`,
    ],
    analogy: r`Studying for a medical licensing exam with a stolen copy of the answer key: you score 100% on practice exams, but fail in the clinic when answers are no longer provided.`,
    steps: [
      r`Define the point of prediction: fix the exact real-world timestamp $T_{\text{pred}}$ when inference executes in production.`,
      r`Audit feature timelines: systematically eliminate any feature created, updated, or recorded after $T_{\text{pred}}$ (downstream consequence of the target).`,
      r`Fit all transformers inside cross-validation: enforce that scalers, imputers, and encoders call fit strictly on training folds and transform on validation folds.`,
      r`Isolate target encoding out-of-fold: ensure target-based categorical encodings exclude the current record's label to prevent self-referential leakage.`,
      r`Stress-test with temporal holdouts: validate models on a strictly future time block; a dramatic divergence between cross-validation and holdout exposes leakage.`,
    ],
    math: [
      {
        h: 'Mutual information target leakage condition',
        tex: r`I(X_{\text{leaked}}; Y \mid T_{\text{pred}}) \gg I(X_{\text{valid}}; Y \mid T_{\text{pred}})`,
        p: r`Where $X_{\text{leaked}}$ represents information generated chronologically after decision timestamp $T_{\text{pred}}$. Such features exhibit spurious high mutual information with target $Y$ during backtesting that disappears under true live inference.`,
      },
      {
        h: 'Global preprocessing parameter mismatch',
        tex: r`\hat{\mu}_{\text{leaked}} = \frac{1}{n_{\text{tr}} + n_{\text{val}}} \sum_{i \in \mathcal{D}_{\text{tr}} \cup \mathcal{D}_{\text{val}}} x_i \ne \hat{\mu}_{\text{train}} = \frac{1}{n_{\text{tr}}} \sum_{i \in \mathcal{D}_{\text{tr}}} x_i`,
        p: r`Estimating transformation parameters (such as mean $\hat{\mu}$ or variance $\hat{\sigma}^2$) across the pooled dataset introduces an out-of-fold bias of order $\mathcal{O}(n_{\text{val}} / n)$, breaking the statistical independence assumption between training and validation partitions.`,
      },
      {
        h: 'Out-of-fold target encoding formulation',
        tex: r`\hat{S}_{i, c} = \frac{\sum_{j \in \mathcal{D}_{\text{tr}} \setminus \{i\}, X_j = c} y_j + m \bar{y}_{\text{tr}}}{n_{c, \text{tr},-i} + m}`,
        p: r`Target encoding must be computed by explicitly excluding sample $i$ (or via out-of-fold cross-fitting), preventing observation $i$'s own target label $y_i$ from leaking directly into its feature representation.`,
      },
    ],
    keyPoints: [
      r`Target leakage introduces features that are downstream effects or proxies of the outcome rather than causes.`,
      r`Preprocessing leakage occurs whenever transformation parameters (means, medians, vocabularies) are learned on pooled train and test data.`,
      r`Feature selection leakage across the entire dataset can make pure noise appear 80%+ accurate in cross-validation.`,
    ],
    pitfalls: [
      r`Calling fit_transform on the full dataset before splitting into train, validation, and test partitions.`,
      r`Performing unsupervised or supervised feature selection on the entire dataset prior to cross-validation.`,
      r`Including database record update timestamps, transaction IDs, or account closure dates that are logged concurrently with the target event.`,
    ],
    code: r`import numpy as np

# Simulate feature selection leakage on pure noise (100 samples, 500 noise features)
np.random.seed(42)
n_samples, n_features = 100, 500
X = np.random.normal(0, 1, size=(n_samples, n_features))
y = np.random.binomial(1, 0.5, size=n_samples)  # independent random binary targets

# 1. LEAKED: Select top 5 correlated features using the FULL dataset before splitting
corrs = np.array([np.abs(np.corrcoef(X[:, j], y)[0, 1]) for j in range(n_features)])
top_leaked = np.argsort(corrs)[-5:]

# Nearest centroid classification on test set using leaked features
train_idx, test_idx = np.arange(70), np.arange(70, 100)
c1_leak = np.mean(X[train_idx][y[train_idx] == 1][:, top_leaked], axis=0)
c0_leak = np.mean(X[train_idx][y[train_idx] == 0][:, top_leaked], axis=0)
preds_leak = (np.linalg.norm(X[test_idx][:, top_leaked] - c1_leak, axis=1) <
              np.linalg.norm(X[test_idx][:, top_leaked] - c0_leak, axis=1)).astype(int)
acc_leak = np.mean(preds_leak == y[test_idx])

# 2. CLEAN: Select features using ONLY training partition
corrs_clean = np.array([np.abs(np.corrcoef(X[train_idx, j], y[train_idx])[0, 1]) for j in range(n_features)])
top_clean = np.argsort(corrs_clean)[-5:]
c1_clean = np.mean(X[train_idx][y[train_idx] == 1][:, top_clean], axis=0)
c0_clean = np.mean(X[train_idx][y[train_idx] == 0][:, top_clean], axis=0)
preds_clean = (np.linalg.norm(X[test_idx][:, top_clean] - c1_clean, axis=1) <
               np.linalg.norm(X[test_idx][:, top_clean] - c0_clean, axis=1)).astype(int)
acc_clean = np.mean(preds_clean == y[test_idx])

print(f"Test accuracy with feature selection leakage: {acc_leak:.2f}")
print(f"Test accuracy with clean in-fold selection:   {acc_clean:.2f}")`,
    quiz: [
      {
        q: r`A machine learning engineer achieves 99.5% accuracy predicting loan defaults, but in production the model performs no better than random guessing. What is the most probable cause?`,
        o: [
          r`The learning rate in gradient descent was set too low`,
          r`A feature such as 'Collection Agency Referral Date' was included, which is only populated after a borrower defaults (target leakage)`,
          r`The dataset was scaled using RobustScaler instead of StandardScaler`,
          r`The model had too few tree estimators`,
        ],
        a: 1,
        why: r`Features that are populated or updated as a consequence of the target event (like referral to collections) leak future outcome knowledge into training, creating deceptive offline performance that fails live.`,
      },
      {
        q: r`Why is computing StandardScaler mean and standard deviation across an entire dataset prior to cross-validation considered data leakage?`,
        o: [
          r`It inflates the training set with test distribution statistics, violating the assumption that test data is unseen`,
          r`It forces continuous features to become discrete integers`,
          r`It causes the matrix inverse to become singular during regression`,
          r`It converts the target variable into a normal distribution`,
        ],
        a: 0,
        why: r`Fitting transformers on the full dataset allows test set statistical information to seep into the training set, causing optimistic validation scores.`,
      },
      {
        q: r`How does out-of-fold target encoding prevent target leakage in high-cardinality categorical variables?`,
        o: [
          r`By replacing all categorical strings with random Gaussian noise`,
          r`By ensuring each observation's target encoding is calculated exclusively from other rows, excluding its own target value`,
          r`By converting categorical columns into one-hot binary columns`,
          r`By calculating category means only on the test partition`,
        ],
        a: 1,
        why: r`If a row's own target label is included when calculating its category's mean target value, the feature directly leaks the label, especially for rare categories with sample count 1.`,
      },
    ],
    usedBy: [],
    prereq: ['train-validation-test-splits-group-and-time-based', 'cross-validation'],
    related: ['scikit-learn-pipelines-and-columntransformer', 'missing-data-mcar-mar-mnar-and-imputation', 'encoding-categoricals-one-hot-ordinal-target-woe'],
    keywords: 'data leakage target leakage preprocessing leakage feature leakage lookahead bias out of fold cross validation',
  },
];
