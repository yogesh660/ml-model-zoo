// Clustering path. See regression.js for conventions.
const r = String.raw;

const loadMall = r`import pandas as pd
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("datasets/raw/mall_customers.csv")
X = StandardScaler().fit_transform(df[["Annual_Income_k", "Spending_Score"]])`;

module.exports = [
  // ------------------------------------------------------------------ centroid
  {
    id: 'kmeans_clustering', short: 'k-means', title: 'k-Means Clustering',
    task: 'clustering', module: 'Centroid-based', level: 1, minutes: 16,
    summary: r`Splits data into k groups by alternating two steps: assign points to the nearest centre, move each centre to its points’ mean.`,
    lead: r`Pick $k$ centres. Assign every point to its nearest centre, move each centre to the average of its points, and repeat until nothing changes.`,
    intuition: [
      r`k-means minimises the within-cluster sum of squares (WCSS, also called inertia): the total squared distance from each point to its centre. Both steps can only lower it, so the algorithm always converges, though only to a local minimum. Different starting centres can give different answers, which is why it is run several times and why [[kmeans_plus_plus|k-means++]] seeding matters.`,
      r`The algorithm implicitly assumes clusters are round, similar in size and similar in spread. It will happily cut a banana-shaped cluster in half. You must choose $k$; the elbow of the WCSS curve and the [[clustering-metrics|silhouette score]] help.`,
    ],
    analogy: r`Placing $k$ shops in a town, letting every resident go to the closest one, then moving each shop to the centre of its customers, and repeating.`,
    steps: [r`Scale the features.`, r`Initialise $k$ centres (k-means++ by default).`, r`Assignment step: each point joins its nearest centre.`, r`Update step: each centre moves to the mean of its points.`, r`Repeat until assignments stop changing; keep the best of several runs.`],
    math: [
      { h: 'Objective (WCSS / inertia)', tex: r`$$J = \sum_{k=1}^K\sum_{x_i \in C_k}\lVert x_i - \mu_k\rVert^2$$`, p: r`For fixed assignments the best centre is the mean; for fixed centres the best assignment is the nearest centre. Alternating the two is coordinate descent on $J$.` },
      { h: 'Update', tex: r`$$\mu_k = \frac{1}{|C_k|}\sum_{x_i \in C_k}x_i$$`, p: r`The mean is what makes k-means sensitive to outliers; [[kmedoids_clustering|k-medoids]] uses actual data points instead.` },
    ],
    hyper: [[r`n_clusters`, r`k, the number of clusters.`, r`Choose with elbow and silhouette.`], [r`init`, r`Seeding method.`, r`"k-means++" (default).`], [r`n_init`, r`Independent restarts.`, r`10; the best run is kept.`], [r`max_iter, tol`, r`Convergence.`, r`Defaults are fine.`]],
    pros: ['Fast and scales to large datasets (mini-batch variant too).', 'Simple to explain and implement.', 'Centres are easy to interpret as prototypes.'],
    cons: ['You must choose k.', 'Assumes round, equal-sized clusters.', 'Sensitive to scaling, outliers and initialisation.'],
    use: r`Customer segmentation, vector quantisation, a first look at structure in numeric data.`,
    avoid: r`Non-convex shapes, very different cluster sizes, or lots of noise; see [[dbscan_clustering]] or [[gaussian_mixture_models]].`,
    complexity: [r`$O(n\,k\,p)$ per iteration`, r`$O(k\,p)$ to assign a new point`],
    glance: { learns: 'k centroids', family: 'Centroid, hard assignment' },
    code: loadMall + r`
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(k, round(km.inertia_, 1), round(silhouette_score(X, km.labels_), 3))`,
    pitfalls: [r`Not scaling features, so one feature decides the clusters.`, r`Picking k by inertia alone; it always falls as k grows.`, r`Treating cluster labels as stable across runs; they are arbitrary numbers.`],
    quiz: [
      {
        q: r`Why does k-means always converge?`,
        o: [
          r`It uses a learning rate`,
          r`Both steps can only lower or keep the WCSS, and there are finitely many assignments`,
          r`It finds the global optimum`,
          r`It stops after 10 iterations`,
        ],
        a: 1,
        why: r`A monotonically decreasing objective over a finite set of partitions must stop.`,
        d: 1,
      },
      {
        q: r`Which shape does k-means handle worst?`,
        o: [
          r`Round blobs of similar size`,
          r`Two interleaved crescents`,
          r`Well-separated clusters`,
          r`Clusters of equal spread`,
        ],
        a: 1,
        why: r`It partitions space into convex Voronoi cells around the centres.`,
        d: 1,
      },
      {
        q: r`What mathematical objective function does standard k-means clustering minimise?`,
        o: [
          r`The sum of Manhattan distances to the median`,
          r`The log-likelihood under a Dirichlet distribution`,
          r`The Within-Cluster Sum of Squares (WCSS / inertia), measuring squared Euclidean distances from points to their cluster centroids`,
          r`The maximum distance between any two points in the dataset`,
        ],
        a: 2,
        why: r`k-means minimises the within-cluster sum of squares $J = \sum_{k=1}^K \sum_{x_i \in C_k} \lVert x_i - \mu_k \rVert^2$, also referred to as inertia.`,
        d: 1,
      },
      {
        q: r`Why is feature standardisation (e.g. <code>StandardScaler</code>) essential before running k-means?`,
        o: [
          r`Because k-means fails to compile on non-zero centred inputs`,
          r`Because features with large numerical ranges dominate Euclidean distance calculations, rendering smaller-scale features irrelevant`,
          r`Because standardising forces the clusters to be non-convex`,
          r`Because the algorithm requires all values to be positive`,
        ],
        a: 1,
        why: r`k-means relies entirely on Euclidean distances. If salary is measured in tens of thousands and age in tens, salary will completely dictate cluster assignments unless features are scaled to equal variance.`,
        d: 1,
      },
      {
        q: r`In the update step of Lloyd's algorithm, why is the arithmetic mean $\mu_k = \frac{1}{|C_k|}\sum_{x_i \in C_k} x_i$ chosen as the new cluster centre?`,
        o: [
          r`Because the arithmetic mean is the unique point in Euclidean space that minimises the sum of squared distances to all points in that cluster`,
          r`Because it guarantees that the prototype is an actual observed data point`,
          r`Because it eliminates the influence of outliers`,
          r`Because it maximises the silhouette score automatically`,
        ],
        a: 0,
        why: r`Setting the derivative of $\sum \lVert x_i - \mu \rVert^2$ with respect to $\mu$ to zero yields $\mu = \frac{1}{|C|}\sum x_i$. The mean is the exact mathematical minimiser of squared Euclidean error.`,
        d: 2,
      },
      {
        q: r`Why can you NOT simply pick the optimal number of clusters $k$ by choosing the value that minimises inertia (WCSS)?`,
        o: [
          r`Because inertia is not computable for $k > 3$`,
          r`Because inertia monotonically decreases as $k$ increases, reaching exactly zero when $k = n$ (every point is its own cluster)`,
          r`Because inertia only applies to Gaussian mixtures`,
          r`Because scikit-learn does not expose the inertia value`,
        ],
        a: 1,
        why: r`Adding more centres always reduces or preserves squared distances to the nearest centre. At $k = n$, inertia is identically zero. Instead, the "elbow" where reduction rate flattens or silhouette scores are used.`,
        d: 2,
      },
      {
        q: r`What is the computational time complexity of assigning a single new, unseen query point to its nearest cluster in a fitted k-means model with $k$ clusters in $p$ dimensions?`,
        o: [
          r`$O(n \cdot p)$`,
          r`$O(k \cdot p)$`,
          r`$O(k^2)$`,
          r`$O(p^2)$`,
        ],
        a: 1,
        why: r`Assigning a new observation requires computing its Euclidean distance to each of the $k$ centroids in $p$-dimensional space, costing $O(k \cdot p)$ operations.`,
        d: 2,
      },
      {
        q: r`How does k-means partition the feature space between adjacent cluster centroids?`,
        o: [
          r`Into quadratic curved boundaries`,
          r`Into concentric spherical shells`,
          r`Into overlapping probabilistic contours`,
          r`Into linear Voronoi polyhedra (perpendicular bisecting hyperplanes between centres)`,
        ],
        a: 3,
        why: r`Assigning points to the nearest centre partitions Euclidean space into Voronoi cells bounded by linear hyperplanes equidistant between pairs of centres.`,
        d: 2,
      },
      {
        q: r`Why does running <code>KMeans(n_clusters=k, n_init=10)</code> execute the algorithm 10 times?`,
        o: [
          r`To compute a 10-fold cross-validation score`,
          r`To average the coordinates of 10 different runs`,
          r`To run 10 independent restarts from different initialisations and keep the model that achieves the lowest overall inertia`,
          r`To train an ensemble of 10 bagging models`,
        ],
        a: 2,
        why: r`k-means is only guaranteed to converge to a local minimum, which depends heavily on initial centroid placement. <code>n_init=10</code> runs 10 independent trials and outputs the best solution.`,
        d: 2,
      },
      {
        q: r`Consider 4 points on a 1D line assigned to a cluster: $\{2, 4, 6, 8\}$. What is the cluster centroid $\mu$, and what is the within-cluster sum of squared errors (inertia contribution) $\sum (x_i - \mu)^2$?`,
        o: [
          r`Centroid $\mu = 5.0$, inertia $= 20$`,
          r`Centroid $\mu = 5.0$, inertia $= 10$`,
          r`Centroid $\mu = 4.0$, inertia $= 16$`,
          r`Centroid $\mu = 5.0$, inertia $= 40$`,
        ],
        a: 0,
        why: r`The centroid is the mean $\mu = 20/4 = 5.0$. The squared deviations are $(-3)^2 + (-1)^2 + 1^2 + 3^2 = 9 + 1 + 1 + 9 = 20$.`,
        d: 3,
      },
      {
        q: r`Two clusters in 1D have centres at $\mu_1 = 4.0$ and $\mu_2 = 12.0$. At what coordinate $x$ lies the decision boundary between these two clusters, and to which cluster is a new point $x = 7.9$ assigned?`,
        o: [
          r`Boundary at $x = 6.0$, assigned to Cluster 2`,
          r`Boundary at $x = 8.0$, assigned to Cluster 1`,
          r`Boundary at $x = 8.0$, assigned to Cluster 2`,
          r`Boundary at $x = 10.0$, assigned to Cluster 1`,
        ],
        a: 1,
        why: r`In 1D, the Voronoi boundary between two centres is their exact midpoint: $(4.0 + 12.0)/2 = 8.0$. Because $7.9 < 8.0$, the point is closer to $\mu_1$ ($|7.9 - 4.0| = 3.9$ vs $|7.9 - 12.0| = 4.1$) and is assigned to Cluster 1.`,
        d: 3,
      },
      {
        q: r`In an iteration of 2-means clustering in 2D, Cluster 1 contains three points: $A = [1, 2]$, $B = [3, 4]$, and $C = [5, 6]$. What are the coordinates of the updated centroid $\mu_1$?`,
        o: [
          r`$[3.0, 4.0]$`,
          r`$[4.0, 5.0]$`,
          r`$[2.5, 3.5]$`,
          r`$[9.0, 12.0]$`,
        ],
        a: 0,
        why: r`The updated centroid is the component-wise mean: $\mu_x = (1 + 3 + 5)/3 = 3.0$ and $\mu_y = (2 + 4 + 6)/3 = 4.0$, yielding $[3.0, 4.0]$.`,
        d: 3,
      },
    ],
    related: ['kmeans_plus_plus', 'kmedoids_clustering', 'gaussian_mixture_models'],
    prereq: ['exploratory-data-analysis'],
    concepts: ['clustering-metrics', 'exploratory-data-analysis'],
    labIntro: r`Step through Lloyd’s algorithm. Each press alternates between the assignment step and the update step.`,
    tryThis: [r`Use "moons": k-means slices the crescents straight across.`, r`Re-seed a few times with random initialisation and compare the final WCSS.`, r`Slide k from 2 to 8 and look at the WCSS curve for an elbow.`],
    keywords: 'kmeans lloyd centroids inertia wcss elbow clustering',
  },
  {
    id: 'kmeans_plus_plus', short: 'k-means++', title: 'k-Means++ Initialisation',
    task: 'clustering', module: 'Centroid-based', level: 2, minutes: 12,
    summary: r`A smarter way to choose starting centres: spread them out in proportion to squared distance. Better and faster k-means.`,
    lead: r`k-means++ picks the first centre at random, then picks each next centre with probability proportional to its squared distance from the nearest centre already chosen. Starting centres end up spread across the data.`,
    intuition: [
      r`Random initialisation often drops two centres into the same cluster and none into another. k-means then has to drag them apart, often getting stuck. k-means++ makes far-away points much more likely to be chosen, so every real cluster tends to get a centre from the start.`,
      r`It comes with a guarantee: the expected WCSS after seeding alone is within $O(\log k)$ of the optimum. In practice it means fewer iterations and fewer bad local minima, which is why it is scikit-learn’s default.`,
    ],
    analogy: r`Choosing meeting points for a scattered group: each new spot is chosen near the people who are currently farthest from any meeting point.`,
    steps: [r`Choose the first centre uniformly at random from the data.`, r`For each point, compute $D(x)$: the distance to its nearest chosen centre.`, r`Pick the next centre with probability $\propto D(x)^2$.`, r`Repeat until $k$ centres are chosen, then run standard k-means.`],
    math: [
      { h: 'Seeding distribution', tex: r`$$P(x_i \text{ chosen next}) = \frac{D(x_i)^2}{\sum_j D(x_j)^2}$$`, p: r`Squared distance makes far points much more likely without making the choice deterministic (which would favour outliers).` },
      { h: 'Approximation guarantee', tex: r`$$\mathbb E[J_{\text{seed}}] \le 8(\ln k + 2)\,J_{\text{opt}}$$`, p: r`From Arthur and Vassilvitskii (2007).` },
    ],
    hyper: [[r`init`, r`"k-means++" or "random".`, r`k-means++.`], [r`n_init`, r`Restarts.`, r`Still useful; 1–10.`]],
    pros: ['Better solutions, fewer iterations.', 'Provable approximation bound.', 'Negligible extra cost.'],
    cons: ['Seeding is sequential ($k$ passes over the data).', 'Can still pick an outlier as a centre.'],
    use: r`Always, whenever you run k-means.`,
    avoid: r`Huge $k$ on huge data, where parallel variants (k-means‖) are faster.`,
    complexity: [r`$O(n\,k\,p)$ seeding`, r`—`],
    glance: { learns: 'Starting centroids', family: 'Centroid seeding' },
    code: loadMall + r`
from sklearn.cluster import KMeans

for init in ["random", "k-means++"]:
    runs = [KMeans(5, init=init, n_init=1, random_state=s).fit(X) for s in range(20)]
    print(init, "mean inertia", sum(r.inertia_ for r in runs) / 20, "mean iters", sum(r.n_iter_ for r in runs) / 20)`,
    pitfalls: [r`Assuming k-means++ removes the need to choose k. It only picks better starting points for the k you chose.`],
    quiz: [
      {
        q: r`k-means++ chooses the next centre with probability proportional to:`,
        o: [
          r`Distance to the data mean`,
          r`Squared distance to the nearest chosen centre`,
          r`Cluster size`,
          r`Uniformly`,
        ],
        a: 1,
        why: r`$D(x)^2$ weighting spreads centres while keeping some randomness.`,
        d: 1,
      },
      {
        q: r`What does k-means++ improve?`,
        o: [
          r`The objective being minimised`,
          r`The starting point, so k-means finds better local minima faster`,
          r`The number of clusters`,
          r`Robustness to non-convex shapes`,
        ],
        a: 1,
        why: r`Only the initialisation changes; Lloyd’s algorithm runs as before.`,
        d: 1,
      },
      {
        q: r`How is the very first initial centroid selected in the k-means++ algorithm?`,
        o: [
          r`Uniformly at random from all data observations`,
          r`The point closest to the dataset mean`,
          r`The point with the largest feature values`,
          r`The medoid of the entire dataset`,
        ],
        a: 0,
        why: r`Step 1 of k-means++ selects the first centre uniformly at random from the data points with equal probability $1/n$.`,
        d: 1,
      },
      {
        q: r`Does k-means++ change the objective function or update equations of standard k-means during Lloyd's iterations?`,
        o: [
          r`Yes, it replaces squared Euclidean distance with Manhattan distance`,
          r`Yes, it incorporates gradient descent with momentum`,
          r`No, it is strictly an initialisation algorithm; once $k$ centres are seeded, standard Lloyd's iterations run unchanged`,
          r`Yes, it dynamically adjusts the number of clusters $k$ at each iteration`,
        ],
        a: 2,
        why: r`k-means++ only modifies how initial centroids are seeded. Once the $k$ initial centres are chosen, standard Lloyd's assignment and update steps execute as normal.`,
        d: 1,
      },
      {
        q: r`What is the theoretical approximation guarantee proven by Arthur and Vassilvitskii (2007) for k-means++ seeding?`,
        o: [
          r`It guarantees finding the exact global minimum in polynomial time`,
          r`The expected inertia $\mathbb{E}[J]$ of the initial seeding is bounded by $O(\log k)$ times the optimal clustering inertia: $\mathbb{E}[J] \le 8(\ln k + 2) J_{\text{opt}}$`,
          r`It guarantees that the silhouette score will exceed 0.80`,
          r`It guarantees that no cluster will have fewer than 10 points`,
        ],
        a: 1,
        why: r`Arthur and Vassilvitskii proved that k-means++ seeding achieves an $O(\log k)$ approximation ratio in expectation relative to the global optimum, ensuring that the starting points are provably competitive.`,
        d: 2,
      },
      {
        q: r`Why does k-means++ sample with probability proportional to squared distance $D(x)^2$ rather than deterministically selecting the point with the maximum distance $\arg\max D(x)$?`,
        o: [
          r`Because deterministic selection always chooses extreme outliers or isolated noise points as cluster centres`,
          r`Because computing the maximum distance is NP-hard`,
          r`Because squared distance guarantees an even number of clusters`,
          r`Because deterministic selection cannot be implemented in Python`,
        ],
        a: 0,
        why: r`If the algorithm deterministically picked $\arg\max D(x)$, any single extreme outlier would be guaranteed to become an initial centroid. Sampling stochastically with $D(x)^2$ weights distant points heavily while preventing outliers from dominating.`,
        d: 2,
      },
      {
        q: r`Why does standard random initialisation (picking $k$ points uniformly at random) often lead to poor clustering outcomes?`,
        o: [
          r`Because random initialisation causes matrix inversion errors`,
          r`Because random initialisation frequently places multiple starting centres in the same large cluster while leaving other distinct clusters without any centre`,
          r`Because uniform sampling only selects points near the origin`,
          r`Because random initialisation forces $k$-means to run indefinitely`,
        ],
        a: 1,
        why: r`In dense regions with many points, uniform random selection is likely to place multiple centres in the same cluster. The algorithm then gets stuck in poor local minima trying to split one natural cluster while merging others.`,
        d: 2,
      },
      {
        q: r`What is a practical limitation of the k-means++ initialisation procedure on distributed computing frameworks with massive $k$?`,
        o: [
          r`It requires $k$ sequential passes over the dataset (each centre must be chosen before distances to it can be evaluated for the next centre)`,
          r`It cannot compute Euclidean distance in parallel`,
          r`It only works on datasets with fewer than 1,000 points`,
          r`It requires calculating the full $n \times n$ distance matrix`,
        ],
        a: 0,
        why: r`Because each new centre depends on distances to all previously selected centres, standard k-means++ requires $k$ sequential round-trip passes over the data. For large $k$ (e.g. $k = 1,000$) on distributed clusters, this serial dependency causes substantial network latency (prompting algorithms like k-means||).`,
        d: 2,
      },
      {
        q: r`How does k-means++ affect the number of Lloyd's iterations required until convergence compared to uniform random initialisation?`,
        o: [
          r`It requires significantly more iterations because centres start further apart`,
          r`It typically reduces the number of iterations required to converge because centroids start much closer to their true natural cluster locations`,
          r`It always converges in exactly 1 iteration`,
          r`It has no effect on convergence speed`,
        ],
        a: 1,
        why: r`Because starting centres are already well distributed across natural cluster locations, fewer assignment-update cycles are needed to reach equilibrium, saving computational time overall.`,
        d: 2,
      },
      {
        q: r`Suppose a 1D dataset has 4 points: $\{0, 2, 6, 10\}$. The first centre chosen at random is $c_1 = 0$. For $k = 2$, what is the sampling probability that the next centre chosen is $x = 10$?`,
        o: [
          r`$10/18 \approx 0.556$ (linear distance ratio)`,
          r`$1/4 = 0.250$ (uniform ratio)`,
          r`$5/7 \approx 0.714$`,
          r`$100/136 \approx 0.735$`,
        ],
        a: 2,
        why: r`The squared distances from $c_1 = 0$ are $D(0)^2 = 0$, $D(2)^2 = 4$, $D(6)^2 = 36$, and $D(10)^2 = 100$, summing to 140. The probability of picking $x = 10$ is $100 / 140 = 5/7 \approx 0.714$. Notice how $D(x)^2$ concentrates over 71% of the probability on the farthest point.`,
        d: 3,
      },
      {
        q: r`Three points lie in 1D: $x_1 = 0, x_2 = 2, x_3 = 6$. Two centres have already been chosen: $c_1 = 0$ and $c_2 = 6$. For the remaining point $x_2 = 2$, what is $D(x_2)$ (the distance to its nearest chosen centre), and what is $D(x_2)^2$?`,
        o: [
          r`$D(x_2) = 4, D(x_2)^2 = 16$`,
          r`$D(x_2) = 2, D(x_2)^2 = 4$`,
          r`$D(x_2) = 3, D(x_2)^2 = 9$`,
          r`$D(x_2) = 6, D(x_2)^2 = 36$`,
        ],
        a: 1,
        why: r`The distance to the nearest centre is $D(x_2) = \min(|2 - 0|, |2 - 6|) = \min(2, 4) = 2$. Its squared distance is $2^2 = 4$.`,
        d: 3,
      },
      {
        q: r`In a dataset with $n = 100$ points, suppose 90 points belong to a tight cluster at $(0, 0)$ and 10 points belong to a distant cluster at $(10, 0)$. The first centre $c_1$ is picked from the tight cluster at $(0, 0)$. How does the probability of picking the second centre from the distant cluster under k-means++ compare to uniform random initialisation?`,
        o: [
          r`It is roughly identical ($\approx 10\%$) in both methods`,
          r`Under k-means++ it rises from $\approx 10\%$ to nearly $100\%$, almost guaranteeing the second cluster is seeded`,
          r`Under k-means++ it drops to $0\%$ because the distant cluster has fewer points`,
          r`Under k-means++ it is exactly $50\%$`,
        ],
        a: 1,
        why: r`Under uniform sampling, the chance of picking from the 10-point cluster is only $10/99 \approx 10.1\%$. Under k-means++, each distant point has $D(x)^2 \approx 100$ while points near $c_1$ have $D(x)^2 \approx 0$, directing virtually all sampling probability ($\approx 100\%$) to the unrepresented cluster.`,
        d: 3,
      },
    ],
    related: ['kmeans_clustering', 'kmedoids_clustering'],
    prereq: ['kmeans_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Watch seeding step by step. The heat behind the points is the probability of each point being picked next.`,
    tryThis: [r`Press <em>Seed next</em> and watch probability drain away from points near chosen centres.`, r`Run 20 restarts with random and with ++ seeding and compare the average WCSS.`],
    keywords: 'kmeans++ initialisation seeding d squared sampling',
  },
  {
    id: 'kmedoids_clustering', short: 'k-medoids', title: 'k-Medoids (PAM)',
    task: 'clustering', module: 'Centroid-based', level: 2, minutes: 14,
    summary: r`Like k-means, but every centre must be an actual data point. More robust to outliers and works with any distance.`,
    lead: r`k-medoids chooses $k$ real data points as cluster representatives (medoids) and assigns every other point to its nearest medoid, minimising total distance rather than squared distance.`,
    intuition: [
      r`A mean can be dragged anywhere by an outlier and can land in empty space. A medoid is always one of the points, the most central one, so it is a real, readable prototype ("this customer is typical of the segment") and one wild point cannot pull it away.`,
      r`Because it only needs pairwise distances, k-medoids works with any dissimilarity: Manhattan, cosine, edit distance between strings, or a custom business metric.`,
    ],
    analogy: r`Picking a real person from each group as its spokesperson, rather than an imaginary "average person".`,
    steps: [r`Pick $k$ initial medoids (e.g. greedy BUILD step).`, r`Assign each point to its nearest medoid.`, r`SWAP step: try replacing each medoid with a non-medoid; keep any swap that lowers total distance.`, r`Repeat until no swap helps.`],
    math: [
      { h: 'Objective', tex: r`$$J = \sum_{k=1}^K\sum_{x_i \in C_k} d(x_i, m_k), \qquad m_k \in \{x_1, \dots, x_n\}$$`, p: r`Unsquared distance and medoids restricted to data points both add robustness.` },
    ],
    hyper: [[r`n_clusters`, r`k.`, r`As for k-means.`], [r`metric`, r`Any distance.`, r`euclidean, manhattan, cosine, precomputed.`], [r`method`, r`"alternate" (fast) or "pam" (thorough).`, r`pam for small data.`]],
    pros: ['Robust to outliers.', 'Works with any distance, including precomputed matrices.', 'Medoids are real, interpretable examples.'],
    cons: ['PAM costs $O(k(n-k)^2)$ per iteration: slow for large $n$.', 'Still needs k and favours compact clusters.'],
    use: r`Small to medium data with outliers, non-Euclidean distances, or when prototypes must be real records.`,
    avoid: r`Very large datasets (use CLARA/CLARANS or mini-batch k-means).`,
    complexity: [r`$O(k(n-k)^2)$ per PAM iteration`, r`$O(k)$`],
    glance: { learns: 'k medoid points', family: 'Centroid (medoid), robust' },
    code: loadMall + r`
# pip install scikit-learn-extra
from sklearn_extra.cluster import KMedoids

km = KMedoids(n_clusters=5, metric="manhattan", method="pam", random_state=0).fit(X)
print("medoid rows:", km.medoid_indices_)`,
    pitfalls: [r`Running PAM on 100k rows. Sample or use CLARA.`],
    quiz: [
      { q: r`Why is k-medoids more robust to outliers than k-means?`, o: [r`It uses more clusters`, r`Centres must be data points and the loss uses unsquared distance`, r`It removes outliers first`, r`It uses a Gaussian model`], a: 1, why: r`An outlier cannot drag a medoid into empty space, and its cost grows linearly, not quadratically.` },
    ],
    related: ['kmeans_clustering', 'affinity_propagation'],
    prereq: ['kmeans_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`k-means (crosses) and k-medoids (rings) on the same data. Drag the outlier slider and see which centres move.`,
    tryThis: [r`Add outliers: the k-means centre of the nearest cluster drifts toward them; the medoid stays put.`],
    keywords: 'kmedoids pam medoid robust clustering any distance',
  },
  {
    id: 'fuzzy_c_means', short: 'Fuzzy c-means', title: 'Fuzzy C-Means (Soft Clustering)',
    task: 'clustering', module: 'Centroid-based', level: 2, minutes: 14,
    summary: r`Every point belongs to every cluster to some degree. Useful when boundaries between groups are genuinely blurry.`,
    lead: r`Instead of a hard label, fuzzy c-means gives each point a membership weight for each cluster, and the weights sum to 1. Centres are membership-weighted means.`,
    intuition: [
      r`A customer between two segments is not fully one or the other. Fuzzy c-means captures that: memberships are high near a centre and fall off smoothly. The fuzzifier $m > 1$ sets how soft: $m \to 1$ recovers hard k-means; large $m$ makes every point belong to every cluster almost equally.`,
    ],
    analogy: r`Colour mixing: a point between a red and a blue centre is purple.`,
    steps: [r`Initialise memberships randomly (each row sums to 1).`, r`Compute centres as membership$^m$-weighted means.`, r`Update memberships from relative distances to all centres.`, r`Repeat until memberships change less than a tolerance.`],
    math: [
      { h: 'Objective', tex: r`$$J_m = \sum_{i=1}^n\sum_{k=1}^c u_{ik}^m\,\lVert x_i - \mu_k\rVert^2, \qquad \sum_k u_{ik} = 1$$`, p: r`The exponent $m$ on the memberships controls fuzziness.` },
      { h: 'Membership update', tex: r`$$u_{ik} = \Bigg[\sum_{j=1}^c\Big(\frac{\lVert x_i - \mu_k\rVert}{\lVert x_i - \mu_j\rVert}\Big)^{\frac{2}{m-1}}\Bigg]^{-1}$$`, p: r`A point’s membership in cluster $k$ depends on how close it is to $\mu_k$ relative to every other centre.` },
    ],
    hyper: [[r`c`, r`Number of clusters.`, r`As for k-means.`], [r`m`, r`Fuzzifier.`, r`2.0 is standard; 1.5–3.`], [r`error, maxiter`, r`Stopping criteria.`, r`1e-5, 1000.`]],
    pros: ['Expresses uncertainty in assignments.', 'Less brittle at boundaries than hard k-means.'],
    cons: ['Same shape assumptions as k-means.', 'Extra hyperparameter $m$.', 'No probabilistic model (unlike GMM).'],
    use: r`Overlapping groups where a soft score is more honest than a hard label (image segmentation, customer affinity).`,
    avoid: r`When you need calibrated probabilities; use [[gaussian_mixture_models]].`,
    complexity: [r`$O(n\,c^2\,p)$ per iteration`, r`$O(c\,p)$`],
    glance: { learns: 'c centres + membership matrix', family: 'Centroid, soft' },
    code: loadMall + r`
# pip install scikit-fuzzy
import skfuzzy as fuzz

centres, U, *_ = fuzz.cluster.cmeans(X.T, c=5, m=2.0, error=1e-5, maxiter=1000, seed=0)
hard_labels = U.argmax(axis=0)
uncertain = (U.max(axis=0) < 0.6).sum()
print(uncertain, "points have no cluster with membership above 0.6")`,
    pitfalls: [r`Thresholding memberships at 0.5 and calling it done; with $c > 2$ the maximum can be below 0.5 for everyone in the overlap.`],
    quiz: [
      { q: r`What happens as the fuzzifier $m \to 1$?`, o: [r`Memberships become uniform`, r`It becomes hard k-means`, r`It becomes a GMM`, r`It diverges`], a: 1, why: r`The exponent $2/(m-1)$ blows up, so the nearest centre takes all the membership.` },
    ],
    related: ['kmeans_clustering', 'gaussian_mixture_models'],
    prereq: ['kmeans_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Each point’s colour is a blend of its memberships. Washed-out points are the uncertain ones.`,
    tryThis: [r`Raise $m$ to 4: almost every point turns grey-ish.`, r`Lower $m$ toward 1.1: colours become pure, like k-means.`],
    keywords: 'fuzzy c means soft clustering membership fuzzifier',
  },
  // ------------------------------------------------------------------ hierarchical
  {
    id: 'agglomerative_hierarchical', short: 'Agglomerative clustering', title: 'Agglomerative Hierarchical Clustering',
    task: 'clustering', module: 'Hierarchical', level: 2, minutes: 18,
    summary: r`Starts with every point alone and repeatedly merges the two closest clusters, building a tree (dendrogram) of the whole hierarchy.`,
    lead: r`Begin with $n$ singleton clusters. At each step merge the two closest clusters. The full history of merges is a dendrogram; cut it at any height to get any number of clusters.`,
    intuition: [
      r`The interesting part is how "closest clusters" is defined, the <strong>linkage</strong>. Single linkage uses the closest pair of points, which follows chains and long shapes but is prone to chaining through noise. Complete linkage uses the farthest pair, giving compact clusters. Average linkage sits in between. Ward linkage merges the pair that increases total within-cluster variance the least, which behaves like a hierarchical k-means.`,
      r`You do not need to fix the number of clusters up front: inspect the dendrogram and cut where there is a big vertical gap.`,
    ],
    analogy: r`A family tree run backwards: individuals form families, families form clans, clans form tribes.`,
    steps: [r`Compute pairwise distances.`, r`Treat each point as its own cluster.`, r`Merge the two clusters with the smallest linkage distance; record the merge height.`, r`Update distances to the new cluster (Lance–Williams formula).`, r`Repeat until one cluster remains; cut the dendrogram to get labels.`],
    math: [
      { h: 'Linkage criteria', tex: r`$$d_{\text{single}} = \min_{a \in A, b \in B}d(a, b), \quad d_{\text{complete}} = \max_{a, b}d(a, b), \quad d_{\text{avg}} = \frac{1}{|A||B|}\sum_{a,b}d(a, b)$$`, p: r`Each choice produces a different hierarchy from the same distances.` },
      { h: 'Ward’s criterion', tex: r`$$\Delta(A, B) = \frac{|A||B|}{|A| + |B|}\lVert\mu_A - \mu_B\rVert^2$$`, p: r`The increase in within-cluster sum of squares caused by merging $A$ and $B$.` },
    ],
    hyper: [[r`linkage`, r`ward, complete, average, single.`, r`ward for compact, single for elongated shapes.`], [r`n_clusters or distance_threshold`, r`Where to cut.`, r`Inspect the dendrogram.`], [r`metric`, r`Distance (ward needs Euclidean).`, r`euclidean, manhattan, cosine.`]],
    pros: ['No need to fix k in advance; the dendrogram shows all scales.', 'Deterministic.', 'Any distance and linkage combination.'],
    cons: ['$O(n^2)$ memory and at least $O(n^2)$ time.', 'Greedy: a bad early merge is never undone.', 'Sensitive to linkage choice.'],
    use: r`Small to medium data where the hierarchy itself is interesting (taxonomies, gene expression, document topics).`,
    avoid: r`More than about 20k points.`,
    complexity: [r`$O(n^2\log n)$ to $O(n^3)$`, r`—`],
    glance: { learns: 'A merge tree (dendrogram)', family: 'Hierarchical, bottom-up' },
    code: loadMall + r`
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import linkage, dendrogram
import matplotlib.pyplot as plt

labels = AgglomerativeClustering(n_clusters=5, linkage="ward").fit_predict(X)
dendrogram(linkage(X, method="ward"), truncate_mode="lastp", p=20)
plt.show()`,
    pitfalls: [r`Using single linkage on noisy data: one bridge point chains two clusters together.`, r`Using ward with a non-Euclidean metric (not valid).`],
    quiz: [
      {
        q: r`Which linkage is most prone to "chaining"?`,
        o: [
          r`Ward`,
          r`Complete`,
          r`Single`,
          r`Average`,
        ],
        a: 2,
        why: r`Two clusters merge if any single pair of points is close, so a trail of points links distant groups.`,
        d: 1,
      },
      {
        q: r`How do you get 4 clusters from a dendrogram?`,
        o: [
          r`Retrain with k = 4`,
          r`Cut the tree at a height that crosses 4 vertical branches`,
          r`Take the top 4 leaves`,
          r`It is not possible`,
        ],
        a: 1,
        why: r`The hierarchy contains every number of clusters from 1 to $n$.`,
        d: 1,
      },
      {
        q: r`How does agglomerative hierarchical clustering begin its clustering process?`,
        o: [
          r`With all data points in a single giant cluster`,
          r`With $k$ randomly chosen centroids`,
          r`With every data point treated as its own independent singleton cluster`,
          r`By fitting a Gaussian distribution to the entire dataset`,
        ],
        a: 2,
        why: r`Agglomerative (bottom-up) clustering starts with $n$ distinct clusters of 1 observation each and iteratively merges the most similar pairs.`,
        d: 1,
      },
      {
        q: r`Which linkage criterion merges the two clusters that cause the smallest increase in total within-cluster variance (sum of squared errors)?`,
        o: [
          r`Single linkage`,
          r`Complete linkage`,
          r`Ward linkage`,
          r`Centroid linkage`,
        ],
        a: 2,
        why: r`Ward's criterion calculates the increase in within-cluster sum of squares $\Delta(A, B) = \frac{|A||B|}{|A| + |B|}\lVert\mu_A - \mu_B\rVert^2$ and merges the pair that minimises this variance inflation.`,
        d: 1,
      },
      {
        q: r`How is complete linkage distance defined between two clusters $A$ and $B$?`,
        o: [
          r`The distance between their closest pair of points`,
          r`The maximum distance between any point in $A$ and any point in $B$: $\max_{a \in A, b \in B} d(a, b)$`,
          r`The average of all pairwise distances between points in $A$ and $B$`,
          r`The distance between the cluster medoids`,
        ],
        a: 1,
        why: r`Complete linkage defines cluster dissimilarity as the maximum pairwise distance between their elements, ensuring that every point in the merged cluster will be within that distance of all other points.`,
        d: 2,
      },
      {
        q: r`Why can Ward linkage only be used with Euclidean distance?`,
        o: [
          r`Because other distance metrics are patent-protected`,
          r`Because Ward's criterion is defined mathematically as the increase in sum of squared Euclidean deviations from centroids`,
          r`Because scipy raises a warning on non-Euclidean metrics but executes anyway`,
          r`Because Manhattan distance cannot be computed between pairs of points`,
        ],
        a: 1,
        why: r`Ward linkage specifically minimises variance (sum of squared Euclidean distances to the mean). Conceptually and mathematically, variance is tied to Euclidean geometry; using other metrics breaks the variance objective.`,
        d: 2,
      },
      {
        q: r`What is the Lance-Williams formula used for in hierarchical clustering algorithms?`,
        o: [
          r`To update distances between a newly merged cluster $(A \cup B)$ and all other remaining clusters $C$ using only existing distances, without re-inspecting raw data points`,
          r`To calculate the optimal number of clusters $k$ using eigenvalues`,
          r`To project high-dimensional data into 2D`,
          r`To scale features to zero mean and unit variance`,
        ],
        a: 0,
        why: r`The Lance-Williams recurrence expresses the distance $d(A \cup B, C)$ as a linear combination of $d(A, C)$, $d(B, C)$, and $d(A, B)$, enabling fast $O(1)$ distance updates after each merge.`,
        d: 2,
      },
      {
        q: r`In a dendrogram, how do you identify a natural or robust clustering structure?`,
        o: [
          r`By finding the shortest vertical lines near the leaves`,
          r`By locating a large vertical distance (gap) between successive merge heights that is not crossed by any horizontal lines`,
          r`By counting how many leaves touch the bottom axis`,
          r`By checking if the tree is completely balanced`,
        ],
        a: 1,
        why: r`A tall vertical gap between merges indicates that clusters remained distinct and separated across a wide range of dissimilarity thresholds before being forced to merge, signalling natural cluster separation.`,
        d: 2,
      },
      {
        q: r`Why does agglomerative hierarchical clustering become impractical on datasets with more than 30,000 observations?`,
        o: [
          r`Because the algorithm requires storing an $n \times n$ distance matrix requiring $O(n^2)$ memory and at least $O(n^2)$ time`,
          r`Because trees cannot have more than 1,000 leaf nodes in Python`,
          r`Because the dendrogram becomes too wide to render on a screen`,
          r`Because Ward linkage only converges on small samples`,
        ],
        a: 0,
        why: r`Storing an $n \times n$ distance matrix for $n = 30,000$ requires $(30,000)^2 \times 8\text{ bytes} \approx 7.2\text{ GB}$ of RAM, and naive implementations scale as $O(n^3)$ or $O(n^2 \log n)$, making it computationally intractable for large datasets.`,
        d: 2,
      },
      {
        q: r`Suppose cluster $A = \{1\}$ and cluster $B = \{5, 9\}$ in 1D. What are the linkage distances between $A$ and $B$ under single linkage, complete linkage, and average linkage?`,
        o: [
          r`Single $= 4$, Complete $= 8$, Average $= 6$`,
          r`Single $= 8$, Complete $= 4$, Average $= 6$`,
          r`Single $= 4$, Complete $= 6$, Average $= 8$`,
          r`Single $= 2$, Complete $= 4$, Average $= 3$`,
        ],
        a: 0,
        why: r`The pairwise distances from 1 to $\{5, 9\}$ are 4 and 8. Single linkage is the minimum ($\min(4, 8) = 4$), complete linkage is the maximum ($\max(4, 8) = 8$), and average linkage is the arithmetic mean ($(4 + 8)/2 = 6$).`,
        d: 3,
      },
      {
        q: r`Two 1D clusters $A = \{2\}$ and $B = \{8\}$ have centroids $\mu_A = 2$ ($|A| = 1$) and $\mu_B = 8$ ($|B| = 1$). What is the increase in variance $\Delta(A, B) = \frac{|A||B|}{|A| + |B|}\lVert\mu_A - \mu_B\rVert^2$ under Ward's criterion if $A$ and $B$ are merged?`,
        o: [
          r`$36.0$`,
          r`$18.0$`,
          r`$9.0$`,
          r`$6.0$`,
        ],
        a: 1,
        why: r`The multiplier is $(1 \times 1) / (1 + 1) = 0.5$. The squared distance between centroids is $(2 - 8)^2 = 36$. Thus $\Delta(A, B) = 0.5 \times 36 = 18.0$.`,
        d: 3,
      },
      {
        q: r`In a dataset of $n = 50$ observations, how many merge steps occur from the initial singleton state until all points belong to a single root cluster?`,
        o: [
          r`25`,
          r`50`,
          r`49`,
          r`1,225`,
        ],
        a: 2,
        why: r`Each agglomerative merge step decreases the number of active clusters by exactly one ($n \to n - 1$). Reducing $n = 50$ initial clusters down to 1 single cluster requires exactly $n - 1 = 49$ merges.`,
        d: 3,
      },
    ],
    related: ['divisive_hierarchical', 'birch_clustering', 'kmeans_clustering'],
    prereq: ['kmeans_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Left: clusters after cutting the tree. Right: the dendrogram, with the cut line. Drag the slider to move the cut.`,
    tryThis: [r`Use single linkage on "moons": it follows the crescents perfectly. Now add noise.`, r`Switch to ward on the same data and compare.`],
    keywords: 'agglomerative hierarchical clustering dendrogram linkage ward single complete',
  },
  {
    id: 'divisive_hierarchical', short: 'Divisive clustering', title: 'Divisive Hierarchical Clustering (Bisecting k-Means)',
    task: 'clustering', module: 'Hierarchical', level: 2, minutes: 12,
    summary: r`Top-down: start with one cluster and keep splitting the worst one in two, usually with 2-means.`,
    lead: r`Divisive clustering works top-down. Put everything in one cluster, split it in two, then keep choosing a cluster to split (typically the one with the largest error) until you have $k$.`,
    intuition: [
      r`Agglomerative clustering makes many local decisions first; divisive makes the big decisions first, using the global structure. Bisecting k-means, the practical version, runs 2-means on one cluster at a time, which is fast and tends to produce clusters of more even size than plain k-means.`,
    ],
    analogy: r`Splitting a company into divisions, then each division into departments, always reorganising the largest or messiest unit next.`,
    steps: [r`Start with all points in one cluster.`, r`Pick the cluster to split (largest SSE or largest size).`, r`Split it with 2-means (several trials, keep the best).`, r`Repeat until there are $k$ clusters.`],
    math: [
      { h: 'Which cluster to split', tex: r`$$C^* = \arg\max_{C}\sum_{x \in C}\lVert x - \mu_C\rVert^2$$`, p: r`The "biggest inertia" strategy; scikit-learn also offers splitting the largest cluster.` },
    ],
    hyper: [[r`n_clusters`, r`Final number of clusters.`, r`As for k-means.`], [r`bisecting_strategy`, r`biggest_inertia or largest_cluster.`, r`biggest_inertia.`], [r`n_init`, r`2-means trials per split.`, r`1–5.`]],
    pros: ['Faster than agglomerative on large data.', 'Big decisions use global structure.', 'Produces a hierarchy as a by-product.'],
    cons: ['Greedy splits are never revisited.', 'Inherits k-means’ shape assumptions.'],
    use: r`Document clustering and large datasets where you want a hierarchy cheaply.`,
    avoid: r`Non-convex shapes.`,
    complexity: [r`$O(n\,k\,p)$ roughly`, r`$O(k\,p)$`],
    glance: { learns: 'A split tree + centroids', family: 'Hierarchical, top-down' },
    code: loadMall + r`
from sklearn.cluster import BisectingKMeans

bkm = BisectingKMeans(n_clusters=5, bisecting_strategy="biggest_inertia", random_state=0).fit(X)
print(bkm.labels_[:10])`,
    pitfalls: [r`Expecting identical results to agglomerative clustering; the trees are built very differently.`],
    quiz: [
      { q: r`Bisecting k-means splits which cluster next (default strategy)?`, o: [r`A random one`, r`The one with the largest within-cluster SSE`, r`The smallest`, r`The newest`], a: 1, why: r`It targets the cluster that explains the most remaining error.` },
    ],
    related: ['agglomerative_hierarchical', 'kmeans_clustering'],
    prereq: ['agglomerative_hierarchical'],
    concepts: ['clustering-metrics'],
    labIntro: r`Each press splits one cluster in two with 2-means. The split tree grows on the right.`,
    tryThis: [r`Step through 5 splits and see which cluster is chosen each time.`],
    keywords: 'divisive hierarchical bisecting kmeans top down',
  },
  {
    id: 'birch_clustering', short: 'BIRCH', title: 'BIRCH Clustering',
    task: 'clustering', module: 'Hierarchical', level: 3, minutes: 14,
    summary: r`Compresses a huge dataset into a tree of small summaries in one pass, then clusters the summaries.`,
    lead: r`BIRCH streams through the data once and builds a CF-tree: a hierarchy of tiny sub-clusters, each stored as a compact summary (count, linear sum, squared sum). A final step clusters those summaries.`,
    intuition: [
      r`Holding millions of points in memory is expensive. A Clustering Feature $(N, LS, SS)$ is enough to compute a sub-cluster’s centre and radius, and two CFs merge by simply adding them. So BIRCH absorbs each incoming point into the nearest leaf sub-cluster if it stays within a radius threshold, and starts a new sub-cluster otherwise.`,
      r`The threshold sets the granularity: small means many fine sub-clusters, large means few coarse ones. A global algorithm (agglomerative, or k-means) then groups the sub-clusters into the final $k$.`,
    ],
    analogy: r`Sorting a flood of letters into pigeonholes as they arrive, counting and summing as you go, and only organising the pigeonholes at the end.`,
    steps: [r`For each point, descend the CF-tree to the closest leaf entry.`, r`If adding it keeps the entry’s radius below the threshold, absorb it; otherwise create a new entry (splitting nodes if they exceed the branching factor).`, r`After one pass, cluster the leaf entries globally.`, r`Assign original points to the nearest final centre.`],
    math: [
      { h: 'Clustering Feature', tex: r`$$CF = (N,\; LS = \textstyle\sum_i x_i,\; SS = \sum_i\lVert x_i\rVert^2), \qquad CF_1 + CF_2 = (N_1 + N_2, LS_1 + LS_2, SS_1 + SS_2)$$`, p: r`Additivity is what makes the one-pass algorithm work.` },
      { h: 'Centre and radius from a CF', tex: r`$$\mu = \frac{LS}{N}, \qquad R = \sqrt{\frac{SS}{N} - \lVert\mu\rVert^2}$$`, p: r`No raw points need to be kept.` },
    ],
    hyper: [[r`threshold`, r`Max sub-cluster radius.`, r`Tune to the data scale (0.3–1 after standardising).`], [r`branching_factor`, r`Max children per node.`, r`50.`], [r`n_clusters`, r`Global clustering step.`, r`An int, or a clusterer.`]],
    pros: ['One pass; works on streams and data larger than memory.', 'Supports incremental updates (partial_fit).'],
    cons: ['Sensitive to the threshold and to data order.', 'Favours spherical clusters.', 'Only for numeric features.'],
    use: r`Very large or streaming numeric data where you need a quick, memory-light clustering.`,
    avoid: r`Small data (just use k-means or agglomerative) or non-convex shapes.`,
    complexity: [r`$O(n)$ single pass`, r`$O(\log n)$`],
    glance: { learns: 'A CF-tree of sub-clusters', family: 'Hierarchical, streaming' },
    code: loadMall + r`
from sklearn.cluster import Birch

birch = Birch(threshold=0.4, branching_factor=50, n_clusters=5).fit(X)
print("leaf sub-clusters:", len(birch.subcluster_centers_))`,
    pitfalls: [r`Using the default threshold on unscaled data.`],
    quiz: [
      { q: r`What makes BIRCH’s one-pass approach possible?`, o: [r`Random sampling`, r`Clustering Features can be merged by addition`, r`It stores every point`, r`It uses a GPU`], a: 1, why: r`$(N, LS, SS)$ summaries are additive, so sub-clusters update in constant time.` },
    ],
    related: ['agglomerative_hierarchical', 'kmeans_clustering'],
    prereq: ['agglomerative_hierarchical'],
    concepts: ['clustering-metrics'],
    labIntro: r`Rings are BIRCH leaf sub-clusters (radius ≤ threshold). Colours are the final global clusters.`,
    tryThis: [r`Lower the threshold and count the sub-clusters.`, r`Raise it until sub-clusters start swallowing whole blobs.`],
    keywords: 'birch cf tree clustering feature streaming large data',
  },
  // ------------------------------------------------------------------ density
  {
    id: 'dbscan_clustering', short: 'DBSCAN', title: 'DBSCAN (Density-Based Clustering)',
    task: 'clustering', module: 'Density-based', level: 2, minutes: 18,
    summary: r`Finds clusters as dense regions of any shape and labels sparse points as noise. No need to choose k.`,
    lead: r`DBSCAN calls a point a <em>core</em> point if at least <code>min_samples</code> points lie within distance $\varepsilon$ of it. Clusters are groups of core points that reach each other, plus their borders; everything else is noise.`,
    intuition: [
      r`Think of $\varepsilon$ as a radius you draw around each point. Where points are packed together, the circles overlap into a connected chain: that chain is a cluster, whatever its shape. Lonely points whose circle is nearly empty and that are not close to any core point are noise. That makes DBSCAN great for crescents, rings and data with outliers.`,
      r`The catch: one global $\varepsilon$ means one density level. Clusters of very different densities cannot all be captured with one setting. [[hdbscan_clustering|HDBSCAN]] and [[optics_clustering|OPTICS]] remove this limitation.`,
    ],
    analogy: r`Finding crowds at a festival: someone with enough people within arm’s reach is in a crowd, and crowds connect through people standing close together.`,
    steps: [r`Scale the features.`, r`For each point, count neighbours within $\varepsilon$.`, r`Mark core points (count ≥ min_samples).`, r`Connect core points within $\varepsilon$ of each other into clusters.`, r`Attach border points to a neighbouring core point’s cluster; label the rest as noise (−1).`],
    math: [
      { h: 'Neighbourhood and core points', tex: r`$$N_\varepsilon(p) = \{q : d(p, q) \le \varepsilon\}, \qquad p \text{ is core} \iff |N_\varepsilon(p)| \ge \text{minPts}$$`, p: r`The point itself counts toward minPts in scikit-learn.` },
      { h: 'Density-reachability', tex: r`$$q \text{ reachable from } p \iff \exists\, p = o_1, \dots, o_m = q:\; o_{i+1} \in N_\varepsilon(o_i),\; o_1..o_{m-1} \text{ core}$$`, p: r`A cluster is a maximal set of points that are density-connected to each other.` },
      { h: 'Choosing ε: the k-distance plot', tex: r`$$d_k(x) = \text{distance from } x \text{ to its } k\text{-th nearest neighbour}, \;\; k = \text{minPts} - 1$$`, p: r`Sort $d_k$ for all points and look for the knee: points left of it live in dense regions.` },
    ],
    hyper: [[r`eps`, r`Neighbourhood radius.`, r`From the k-distance knee.`], [r`min_samples`, r`Points needed for a core point.`, r`About 2 × dimensions; at least 4.`], [r`metric`, r`Distance.`, r`euclidean, haversine for lat/long.`]],
    pros: ['Finds arbitrary shapes.', 'Detects outliers explicitly.', 'No need to choose k.'],
    cons: ['One density level for the whole dataset.', 'Sensitive to eps; struggles in high dimensions.', 'Border points can be assigned differently depending on order.'],
    use: r`Spatial and GPS data, anomaly detection, non-convex clusters with noise.`,
    avoid: r`Clusters with very different densities (use HDBSCAN) or high-dimensional data.`,
    complexity: [r`$O(n\log n)$ with a spatial index; $O(n^2)$ worst`, r`—`],
    glance: { learns: 'Core points and their components', family: 'Density-based' },
    code: loadMall + r`
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
import numpy as np

k_dist = np.sort(NearestNeighbors(n_neighbors=5).fit(X).kneighbors(X)[0][:, -1])  # look for the knee
db = DBSCAN(eps=0.3, min_samples=5).fit(X)
print("clusters:", len(set(db.labels_)) - (-1 in db.labels_), "noise points:", (db.labels_ == -1).sum())`,
    pitfalls: [r`Running on unscaled features, which makes $\varepsilon$ meaningless.`, r`Treating noise points as a cluster in downstream metrics.`],
    quiz: [
      {
        q: r`A point with fewer than minPts neighbours but within $\varepsilon$ of a core point is:`,
        o: [
          r`A core point`,
          r`A border point`,
          r`Noise`,
          r`Its own cluster`,
        ],
        a: 1,
        why: r`It joins the core point’s cluster but cannot extend it further.`,
        d: 1,
      },
      {
        q: r`Why can DBSCAN find crescent-shaped clusters while k-means cannot?`,
        o: [
          r`It uses more iterations`,
          r`Clusters grow through chains of dense neighbourhoods, not around a centre`,
          r`It uses Gaussian components`,
          r`It uses a kernel`,
        ],
        a: 1,
        why: r`No centre, no convexity assumption.`,
        d: 1,
      },
      {
        q: r`In DBSCAN, what condition must a point satisfy to be classified as a core point?`,
        o: [
          r`It must have at least min_samples points (including itself) within distance $\varepsilon$`,
          r`It must have the smallest coordinate in its cluster`,
          r`Its distance to the dataset centroid must be less than $\varepsilon$`,
          r`It must be connected to at least two other clusters`,
        ],
        a: 0,
        why: r`A core point is defined as any point whose $\varepsilon$-neighbourhood contains at least <code>min_samples</code> observations: $|N_\varepsilon(p)| \ge \text{min\_samples}$.`,
        d: 1,
      },
      {
        q: r`What label does scikit-learn's <code>DBSCAN</code> assign to points classified as noise?`,
        o: [
          r`0`,
          r`None`,
          r`-1`,
          r`99`,
        ],
        a: 2,
        why: r`In scikit-learn, DBSCAN labels noise points with integer <code>-1</code>, distinguishing them from valid clusters (which are indexed $0, 1, 2, \dots$).`,
        d: 1,
      },
      {
        q: r`How does the k-distance graph help an analyst choose an appropriate value for $\varepsilon$ in DBSCAN?`,
        o: [
          r`It calculates the exact AIC score for each possible $\varepsilon$`,
          r`It sorts points by their distance to the $k$-th nearest neighbour and displays a "knee" where the curve bends sharply upward, separating dense points from sparse noise`,
          r`It finds the eigenvalue gap of the graph Laplacian`,
          r`It plots training loss across 100 epochs`,
        ],
        a: 1,
        why: r`In a k-distance plot, points in dense clusters have small distances to their $k$-th neighbour (flat lower part), while noise points have large distances (steep rise). The "knee" represents the optimal transition threshold $\varepsilon$.`,
        d: 2,
      },
      {
        q: r`What is the primary failure mode of DBSCAN when clustering datasets containing groups of widely varying densities?`,
        o: [
          r`The algorithm crashes because of unequal variances`,
          r`It produces only spherical clusters`,
          r`A single global $\varepsilon$ cannot capture both: an $\varepsilon$ large enough for the sparse cluster merges the dense cluster with noise, while a small $\varepsilon$ fragments the sparse cluster entirely into noise`,
          r`It forces all clusters to have equal sample sizes`,
        ],
        a: 2,
        why: r`DBSCAN applies one fixed $\varepsilon$ radius across the entire dataset. When clusters have different densities, no single global $\varepsilon$ works simultaneously for both tight and diffuse groups.`,
        d: 2,
      },
      {
        q: r`Why can border points in DBSCAN produce non-deterministic cluster assignments depending on the processing order of data?`,
        o: [
          r`Because random numbers are drawn at each step`,
          r`Because a border point lying within distance $\varepsilon$ of core points from two different clusters is assigned to whichever cluster reaches it first during traversal`,
          r`Because border points are dynamically converted into centroids`,
          r`Because floating-point arithmetic is non-associative`,
        ],
        a: 1,
        why: r`If a border point is reachable from core points belonging to two distinct clusters, it gets attached to the first cluster that processes it, making border assignments slightly order-dependent.`,
        d: 2,
      },
      {
        q: r`What is a common rule of thumb for setting the <code>min_samples</code> parameter in DBSCAN for a dataset with $p$ features?`,
        o: [
          r`$\text{min\_samples} \approx 2 \times p$ (and at least 4)`,
          r`$\text{min\_samples} = 1$`,
          r`$\text{min\_samples} = n / 2$`,
          r`$\text{min\_samples} = \sqrt{n}$`,
        ],
        a: 0,
        why: r`A widely adopted guideline (Ester et al., 1996) recommends choosing $\text{min\_samples} \ge 2 \times \text{dimensions}$, with a practical minimum of 4 to suppress noise.`,
        d: 2,
      },
      {
        q: r`Why is feature standardisation especially critical prior to fitting DBSCAN with Euclidean distance?`,
        o: [
          r`Because DBSCAN only accepts values between -1 and +1`,
          r`Because $\varepsilon$ is a fixed isotropic Euclidean radius; unscaled features with large scales would make $\varepsilon$ completely ineffective along smaller-scale dimensions`,
          r`Because standardising removes all noise points from the data`,
          r`Because unscaled data causes the spatial index tree to loop infinitely`,
        ],
        a: 1,
        why: r`The neighbourhood radius $\varepsilon$ defines a sphere in feature space. If one feature has variance 10,000 and another 0.1, the distance is driven solely by the first feature, rendering neighbourhood searches meaningless along the second.`,
        d: 2,
      },
      {
        q: r`Consider 4 points on a 1D line: $A = 1.0, B = 2.0, C = 3.0, D = 5.0$. DBSCAN is run with $\varepsilon = 1.0$ and <code>min_samples = 3</code> (where a point's count includes itself). Which points are core points?`,
        o: [
          r`All four points are core points`,
          r`Points $A, B$, and $C$ are core points`,
          r`Only point $B$ is a core point`,
          r`None of the points are core points`,
        ],
        a: 2,
        why: r`Point $B$ has three points in its $\varepsilon$-neighbourhood ($A, B, C$ are all within distance $1.0$), satisfying $\text{min\_samples} = 3$. Point $A$ only has 2 points ($A, B$), Point $C$ only has 2 points ($B, C$), and Point $D$ has 1 ($D$). Thus, only $B$ is a core point.`,
        d: 3,
      },
      {
        q: r`Following the previous 1D scenario ($A = 1.0, B = 2.0, C = 3.0, D = 5.0$ with $\varepsilon = 1.0$ and <code>min_samples = 3</code>), what are the resulting DBSCAN cluster labels for points $A, B, C, D$?`,
        o: [
          r`$[0, 0, 0, 0]$ (all points in cluster 0)`,
          r`$[0, 0, 0, -1]$ ($A, B, C$ in cluster 0; $D$ is noise)`,
          r`$[-1, 0, -1, -1]$ (only $B$ is clustered)`,
          r`$[0, 1, 2, -1]$ (each in its own cluster)`,
        ],
        a: 1,
        why: r`$B$ is a core point and establishes Cluster 0. $A$ and $C$ are within $\varepsilon = 1.0$ of $B$, so they join Cluster 0 as border points. $D$ is too far ($|5.0 - 2.0| = 3.0 > 1.0$) and has no core neighbours, so it is labelled as noise ($-1$).`,
        d: 3,
      },
      {
        q: r`In scikit-learn, what is the length of <code>set(db.labels_) - {-1}</code> for a fitted DBSCAN model where 100 points are assigned to Cluster 0, 80 points to Cluster 1, and 20 points are labelled as noise (-1)?`,
        o: [
          r`3`,
          r`2`,
          r`200`,
          r`180`,
        ],
        a: 1,
        why: r`The distinct labels in <code>db.labels_</code> are $0, 1$, and $-1$. Removing the noise label $\{-1\}$ leaves $\{0, 1\}$, whose length is 2 (representing the 2 genuine clusters found).`,
        d: 3,
      },
    ],
    related: ['hdbscan_clustering', 'optics_clustering', 'mean_shift_clustering'],
    prereq: ['kmeans_clustering'],
    concepts: ['clustering-metrics', 'exploratory-data-analysis'],
    labIntro: r`DBSCAN recomputed live. Filled dots are core points, hollow dots are border points, small grey dots are noise. Hover to see the ε-circle.`,
    tryThis: [r`On "moons", find an ε that separates the two crescents cleanly.`, r`Use "varied density": no single ε captures both the tight and the loose cluster.`, r`Raise min_samples and watch border points turn into noise.`],
    keywords: 'dbscan density clustering eps min samples core border noise outliers',
  },
  {
    id: 'hdbscan_clustering', short: 'HDBSCAN', title: 'HDBSCAN (Hierarchical DBSCAN)',
    task: 'clustering', module: 'Density-based', level: 3, minutes: 20,
    summary: r`Runs DBSCAN at every density level at once and keeps the clusters that persist longest. Handles varying densities.`,
    lead: r`HDBSCAN builds a hierarchy of DBSCAN-like clusterings across all values of $\varepsilon$, then picks the clusters that are most stable across that range. You set the smallest cluster size you care about; it figures out the rest.`,
    intuition: [
      r`It first measures density per point with the <em>core distance</em> (distance to the k-th neighbour) and defines a "mutual reachability" distance that pushes sparse points apart. A minimum spanning tree over these distances, cut at every level, gives a full hierarchy.`,
      r`Small fragments below <code>min_cluster_size</code> are treated as points falling out of a cluster, not new clusters. Each remaining cluster gets a stability score: roughly how long (in density terms) it survives with many points. The final answer selects the most stable non-overlapping clusters, which can come from different density levels.`,
    ],
    analogy: r`Watching islands appear as the tide goes out: some appear early and last, others are brief sandbars. Keep the islands that last.`,
    steps: [r`Compute each point’s core distance (min_samples neighbours).`, r`Compute mutual reachability distances and build their minimum spanning tree.`, r`Sort MST edges to build a single-linkage hierarchy.`, r`Condense it: ignore splits that shed fewer than min_cluster_size points.`, r`Select clusters by stability (excess of mass); the rest is noise.`],
    math: [
      { h: 'Mutual reachability distance', tex: r`$$d_{\text{mreach}}(a, b) = \max\{\text{core}_k(a),\; \text{core}_k(b),\; d(a, b)\}$$`, p: r`Points in sparse regions get pushed away from everything, which keeps noise from bridging clusters.` },
      { h: 'Cluster stability', tex: r`$$S(C) = \sum_{p \in C}\big(\lambda_p - \lambda_{\text{birth}}(C)\big), \qquad \lambda = 1/\varepsilon$$`, p: r`How much density "mass" a cluster accumulates between its birth and when its points leave.` },
    ],
    hyper: [[r`min_cluster_size`, r`Smallest group you would call a cluster.`, r`The main knob; think in business terms.`], [r`min_samples`, r`How conservative the density estimate is.`, r`Defaults to min_cluster_size; raise for more noise points.`], [r`cluster_selection_method`, r`eom or leaf.`, r`eom (default) for fewer, larger clusters.`]],
    pros: ['Handles clusters of varying density.', 'Few, intuitive parameters.', 'Gives membership strengths and outlier scores.'],
    cons: ['Slower than DBSCAN.', 'Can label many points as noise.', 'Hierarchy can be hard to explain.'],
    use: r`Exploratory clustering of real-world data, embeddings (often after UMAP), anything where density varies.`,
    avoid: r`When every point must be assigned to a cluster.`,
    complexity: [r`$O(n\log n)$ typical, $O(n^2)$ worst`, r`approximate_predict available`],
    glance: { learns: 'A condensed density hierarchy', family: 'Density-based, hierarchical' },
    code: loadMall + r`
from sklearn.cluster import HDBSCAN

hdb = HDBSCAN(min_cluster_size=15).fit(X)
print("clusters:", len(set(hdb.labels_)) - (-1 in hdb.labels_), "noise:", (hdb.labels_ == -1).sum())
print("membership strength of first rows:", hdb.probabilities_[:5].round(2))`,
    pitfalls: [r`Setting min_cluster_size to 2 or 3 and getting hundreds of micro-clusters.`],
    quiz: [
      { q: r`What problem of DBSCAN does HDBSCAN solve?`, o: [r`Needing k`, r`A single global density threshold`, r`Detecting noise`, r`Speed`], a: 1, why: r`It considers all density levels and picks stable clusters from different ones.` },
    ],
    related: ['dbscan_clustering', 'optics_clustering', 'agglomerative_hierarchical'],
    prereq: ['dbscan_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`HDBSCAN computed in your browser: mutual-reachability MST, condensed tree and stability-based selection. Point brightness is membership strength.`,
    tryThis: [r`On "varied density", HDBSCAN finds both the tight and the loose cluster, where DBSCAN could not.`, r`Raise min_cluster_size until small clusters merge into noise.`],
    keywords: 'hdbscan hierarchical density clustering stability varying density',
  },
  {
    id: 'optics_clustering', short: 'OPTICS', title: 'OPTICS (Ordering Points To Identify Clustering Structure)',
    task: 'clustering', module: 'Density-based', level: 3, minutes: 16,
    summary: r`Orders points so that dense regions appear as valleys in a reachability plot. Read clusters off the plot at any density.`,
    lead: r`OPTICS does not output clusters directly. It outputs an ordering of the points and a reachability distance for each, which, plotted, shows clusters as valleys. Cutting the plot at a height gives a DBSCAN clustering for that $\varepsilon$; the Xi method finds valleys automatically.`,
    intuition: [
      r`OPTICS walks through the data always moving to the closest unvisited point in density terms. Inside a cluster, the next point is close, so reachability is low; jumping to a new cluster requires a big step, which shows as a spike. The plot is a fingerprint of the data’s density structure at all scales at once.`,
    ],
    analogy: r`Walking through a city always to the nearest unvisited house and logging how far each step was; neighbourhoods are runs of short steps.`,
    steps: [r`Compute core distances.`, r`Start from an unvisited point; maintain a priority queue of reachability distances to its neighbours.`, r`Repeatedly visit the point with the smallest reachability, updating the queue.`, r`Plot reachability in visit order; extract clusters by a horizontal cut or with Xi.`],
    math: [
      { h: 'Reachability distance', tex: r`$$\text{reach}(o, p) = \max\{\text{core}(p),\; d(p, o)\}$$`, p: r`The distance at which $o$ becomes reachable from core point $p$.` },
    ],
    hyper: [[r`min_samples`, r`Density neighbourhood size.`, r`5–20.`], [r`max_eps`, r`Largest radius considered.`, r`Inf (default) or a limit for speed.`], [r`cluster_method, xi`, r`How clusters are extracted.`, r`xi with 0.01–0.1, or dbscan with eps.`]],
    pros: ['Reveals structure at all density scales in one run.', 'Handles varying densities better than DBSCAN.'],
    cons: ['Slower than DBSCAN.', 'Extracting clusters from the plot needs another parameter.'],
    use: r`Exploring data with unknown or varying density; when you want to look at the structure before committing.`,
    avoid: r`Large data with tight time budgets.`,
    complexity: [r`$O(n\log n)$ with an index`, r`—`],
    glance: { learns: 'An ordering + reachability distances', family: 'Density-based' },
    code: loadMall + r`
from sklearn.cluster import OPTICS
import matplotlib.pyplot as plt

opt = OPTICS(min_samples=10, xi=0.05).fit(X)
plt.plot(opt.reachability_[opt.ordering_]); plt.ylabel("reachability"); plt.show()
print("clusters:", len(set(opt.labels_)) - (-1 in opt.labels_))`,
    pitfalls: [r`Reading every small dip as a cluster; look for valleys with enough points.`],
    quiz: [
      { q: r`In a reachability plot, a cluster appears as:`, o: [r`A spike`, r`A valley of low reachability`, r`A flat line at the top`, r`A single point`], a: 1, why: r`Points inside a dense region are reached with small distances.` },
    ],
    related: ['dbscan_clustering', 'hdbscan_clustering'],
    prereq: ['dbscan_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Left: points coloured by the clusters extracted at your cut. Right: the reachability plot in OPTICS order, with the cut line.`,
    tryThis: [r`Move the cut down: deep valleys split into sub-clusters.`, r`Move it up: neighbouring valleys merge.`],
    keywords: 'optics reachability plot density ordering clustering',
  },
  {
    id: 'mean_shift_clustering', short: 'Mean shift', title: 'Mean Shift Clustering',
    task: 'clustering', module: 'Density-based', level: 2, minutes: 14,
    summary: r`Every point climbs uphill on the estimated density until it reaches a peak. Points sharing a peak form a cluster.`,
    lead: r`Mean shift places a window around each point, moves it to the mean of the points inside, and repeats. Windows drift toward density peaks (modes); the number of clusters is the number of peaks found.`,
    intuition: [
      r`Imagine the data as a landscape where height is density. Mean shift is a hill-climber: the mean of a neighbourhood is always a step uphill. The bandwidth sets the window size: small finds many little hills, large smooths the landscape into a few big ones.`,
    ],
    analogy: r`Raindrops running downhill into lakes, upside-down: every point flows to the top of its hill.`,
    steps: [r`Choose a bandwidth (estimate_bandwidth helps).`, r`For each point, repeatedly shift it to the kernel-weighted mean of its neighbours.`, r`Stop when shifts are tiny; merge modes closer than the bandwidth.`, r`Label points by the mode they reached.`],
    math: [
      { h: 'Mean shift update', tex: r`$$m(x) = \frac{\sum_i K\big(\tfrac{x_i - x}{h}\big)x_i}{\sum_i K\big(\tfrac{x_i - x}{h}\big)}, \qquad x \leftarrow m(x)$$`, p: r`$m(x) - x$ points along the gradient of a kernel density estimate.` },
    ],
    hyper: [[r`bandwidth`, r`Window size.`, r`estimate_bandwidth(X, quantile=0.2).`], [r`bin_seeding`, r`Seed from a grid to speed up.`, r`True on large data.`], [r`cluster_all`, r`Assign orphans or label them noise.`, r`True.`]],
    pros: ['No need to choose k.', 'Finds arbitrarily shaped density peaks.', 'One intuitive parameter.'],
    cons: ['Slow: $O(n^2)$ per iteration.', 'Single global bandwidth.', 'Struggles in high dimensions.'],
    use: r`Low-dimensional data such as image colour segmentation or object tracking.`,
    avoid: r`Large or high-dimensional data.`,
    complexity: [r`$O(T\,n^2)$`, r`$O(\text{modes})$`],
    glance: { learns: 'Density modes', family: 'Density-based, mode seeking' },
    code: loadMall + r`
from sklearn.cluster import MeanShift, estimate_bandwidth

bw = estimate_bandwidth(X, quantile=0.2, random_state=0)
ms = MeanShift(bandwidth=bw, bin_seeding=True).fit(X)
print("bandwidth", round(bw, 3), "clusters found:", len(ms.cluster_centers_))`,
    pitfalls: [r`Choosing the bandwidth by eye and then trusting the cluster count as a discovery.`],
    quiz: [
      {
        q: r`Increasing the bandwidth generally:`,
        o: [
          r`Finds more clusters`,
          r`Finds fewer, broader clusters`,
          r`Has no effect`,
          r`Increases noise points`,
        ],
        a: 1,
        why: r`A wider kernel smooths away small density peaks.`,
        d: 1,
      },
      {
        q: r`What statistical feature of the data distribution does each cluster centre represent in mean shift clustering?`,
        o: [
          r`A local mode (density peak) of the underlying probability density function`,
          r`The arithmetic mean of all points assigned to a Voronoi cell`,
          r`The medoid that minimises total Manhattan distance`,
          r`An eigenvector of the normalised graph Laplacian`,
        ],
        a: 0,
        why: r`Mean shift is a mode-seeking algorithm: points climb the gradient of a kernel density estimate, and cluster centres correspond to local density peaks (modes).`,
        d: 1,
      },
      {
        q: r`Why does mean shift clustering not require the user to specify the number of clusters $k$ in advance?`,
        o: [
          r`Because it always creates exactly one cluster per feature`,
          r`Because the number of clusters is determined automatically by how many distinct density modes are discovered`,
          r`Because it runs a deep neural network that optimises $k$ using backpropagation`,
          r`Because it forces $k = \log_2(n)$`,
        ],
        a: 1,
        why: r`In mean shift, each point flows to a stationary density mode. The number of unique modes after merging nearby peaks automatically becomes the number of clusters.`,
        d: 1,
      },
      {
        q: r`What role does the <code>bin_seeding=True</code> parameter play in scikit-learn's <code>MeanShift</code>?`,
        o: [
          r`It initialises points using k-means++`,
          r`It rounds feature values to the nearest integer`,
          r`It seeds search windows from a coarse grid rather than from every single data point, substantially accelerating convergence on large datasets`,
          r`It removes 50% of the features randomly`,
        ],
        a: 2,
        why: r`By default, mean shift starts a hill-climbing trajectory from every single data point ($n$ searches). <code>bin_seeding=True</code> quantises points onto a coarse grid and only seeds from occupied bins, drastically speeding up computation.`,
        d: 1,
      },
      {
        q: r`What does the mean shift vector $m(x) - x$ represent geometrically at any location $x$?`,
        o: [
          r`A vector perpendicular to the decision boundary`,
          r`A vector pointing directly along the normalised gradient of the kernel density estimate toward higher density`,
          r`The error residual between true and predicted labels`,
          r`The second derivative (curvature) of the density surface`,
        ],
        a: 1,
        why: r`Comaniciu and Meer proved that the mean shift vector $m(x) - x$ is proportional to the normalised gradient of the kernel density estimate, guaranteeing that moving along it climbs toward the nearest density mode.`,
        d: 2,
      },
      {
        q: r`How does scikit-learn's <code>estimate_bandwidth(X, quantile=0.2)</code> select a suggested bandwidth parameter?`,
        o: [
          r`It fits a linear regression and takes the residual standard deviation`,
          r`It tests every bandwidth from 0.1 to 10.0 and picks the one with highest silhouette score`,
          r`It calculates the variance of the first principal component`,
          r`It computes pairwise distances to neighbours and takes the specified quantile of nearest-neighbour distances`,
        ],
        a: 3,
        why: r`<code>estimate_bandwidth</code> uses a nearest-neighbour graph to calculate the distance distribution between sample points, returning the distance corresponding to the requested quantile (e.g. the 20th percentile).`,
        d: 2,
      },
      {
        q: r`What occurs during the post-processing phase of mean shift after all hill-climbing paths have stopped moving?`,
        o: [
          r`All clusters are split in two using 2-means`,
          r`Modes situated closer to each other than the bandwidth threshold are merged into a single cluster centre`,
          r`Points with negative coordinates are removed`,
          r`Centres are re-projected onto the unit sphere`,
        ],
        a: 1,
        why: r`Multiple points climbing the same broad peak may terminate at slightly different floating-point coordinates. The algorithm merges candidate modes that lie within distance $h$ of each other into a single consolidated mode.`,
        d: 2,
      },
      {
        q: r`What happens if an engineer sets <code>cluster_all=False</code> in <code>MeanShift</code>?`,
        o: [
          r`The algorithm converts into spectral clustering`,
          r`Points that do not converge close enough to any valid mode (or lie in low-density valleys) are labelled as noise ($-1$) rather than being forced into the nearest cluster`,
          r`The model fails to fit and raises an exception`,
          r`All points are assigned to cluster 0`,
        ],
        a: 1,
        why: r`When <code>cluster_all=True</code> (default), every point is assigned to a cluster, even isolated outliers. Setting <code>cluster_all=False</code> allows sparse orphan points to be marked with label <code>-1</code> (noise).`,
        d: 2,
      },
      {
        q: r`Why does mean shift become computationally prohibitive on high-dimensional datasets with many thousands of samples?`,
        o: [
          r`Because each iteration evaluates distances to all points ($O(n^2)$), and the curse of dimensionality causes density to disperse thinly, requiring massive bandwidths that blur all modes`,
          r`Because mean shift cannot compute matrices with more than 3 columns`,
          r`Because kernel density estimation is only defined in 1D`,
          r`Because the algorithm requires computing matrix inverses of shape $(n \times n)$`,
        ],
        a: 0,
        why: r`Mean shift scales quadratically $O(T \cdot n^2)$ with sample size. In high dimensions, data sparsity (the curse of dimensionality) flattens density gradients, meaning nearly all points become isolated local modes unless the bandwidth is inflated so large that all structure is obliterated.`,
        d: 2,
      },
      {
        q: r`Consider 3 points in 1D: $x_1 = 2$, $x_2 = 4$, and $x_3 = 10$. A mean shift window uses a flat (uniform) kernel with bandwidth $h = 3$ centred at current position $x = 3$. What is the updated mean position $m(x)$?`,
        o: [
          r`$m(x) = 5.33$ (mean of all 3 points)`,
          r`$m(x) = 3.00$`,
          r`$m(x) = 4.00$`,
          r`$m(x) = 2.00$`,
        ],
        a: 1,
        why: r`The window $[3 - 3, 3 + 3] = [0, 6]$ captures only $x_1 = 2$ and $x_2 = 4$ ($x_3 = 10$ is outside). With a flat kernel, the updated position is the arithmetic mean of points inside the window: $(2 + 4) / 2 = 3.00$.`,
        d: 3,
      },
      {
        q: r`Suppose two points $x_1 = 0$ and $x_2 = 2$ have weights $K_1 = 0.75$ and $K_2 = 0.25$ under a Gaussian kernel centred at $x = 0.5$. What is the kernel-weighted mean shift update $m(x) = \frac{\sum K_i x_i}{\sum K_i}$, and what is the mean shift vector $m(x) - x$?`,
        o: [
          r`$m(x) = 1.00$, shift vector $= +0.50$`,
          r`$m(x) = 0.50$, shift vector $= 0.00$ (stationary point)`,
          r`$m(x) = 0.25$, shift vector $= -0.25$`,
          r`$m(x) = 1.50$, shift vector $= +1.00$`,
        ],
        a: 1,
        why: r`The weighted mean is $m(x) = (0.75 \times 0 + 0.25 \times 2) / (0.75 + 0.25) = 0.50 / 1.00 = 0.50$. The mean shift vector is $m(x) - x = 0.50 - 0.50 = 0.00$, indicating this location is an equilibrium point.`,
        d: 3,
      },
      {
        q: r`In a 2D image segmentation task with $n = 100,000$ pixels, an engineer runs raw <code>MeanShift</code> with <code>bin_seeding=False</code>. If each hill-climbing trajectory takes an average of $T = 15$ iterations and evaluates all $n$ pixels, approximately how many distance calculations are performed?`,
        o: [
          r`$1.5 \times 10^6$ (1.5 million)`,
          r`$1.5 \times 10^8$ (150 million)`,
          r`$1.5 \times 10^{11}$ (150 billion)`,
          r`$3.0 \times 10^5$ (300 thousand)`,
        ],
        a: 2,
        why: r`Initiating trajectories from all $10^5$ points with 15 iterations each, where each iteration compares against all $10^5$ data points, requires $10^5 \times 15 \times 10^5 = 1.5 \times 10^{11}$ (150 billion) distance evaluations. This quadratic scaling is why bin seeding or downsampling is essential.`,
        d: 3,
      },
    ],
    related: ['dbscan_clustering', 'kmeans_clustering', 'gaussian_mixture_models'],
    prereq: ['kmeans_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Press <em>Shift</em> and watch every point climb toward its density peak. Colours are assigned once points settle.`,
    tryThis: [r`Small bandwidth: many tiny peaks. Large bandwidth: everything flows to one or two.`],
    keywords: 'mean shift mode seeking kernel density bandwidth',
  },
  // ------------------------------------------------------------------ probabilistic & graph
  {
    id: 'gaussian_mixture_models', short: 'Gaussian mixtures', title: 'Gaussian Mixture Models (EM)',
    task: 'clustering', module: 'Probabilistic and graph-based', level: 3, minutes: 20,
    summary: r`Models the data as a blend of Gaussian blobs and fits them with Expectation–Maximisation. Soft, probabilistic clusters.`,
    lead: r`A GMM says each point was generated by one of $K$ Gaussians, chosen with probabilities $\pi_k$. The EM algorithm alternates between estimating which Gaussian each point probably came from (E-step) and refitting each Gaussian to its weighted points (M-step).`,
    intuition: [
      r`It is k-means with three upgrades: clusters can be elliptical and tilted (full covariance), different sizes, and assignments are probabilities rather than hard labels. In fact k-means is a GMM with equal, spherical covariances shrunk to zero.`,
      r`Because it is a proper probability model, you can compare different $K$ values with BIC, compute the likelihood of new points (useful for anomaly detection), and sample new data.`,
    ],
    analogy: r`Explaining a crowd photo as several overlapping groups, each with its own centre and spread, and saying how likely each person belongs to each group.`,
    steps: [r`Initialise means (often with k-means), covariances and weights.`, r`E-step: compute responsibilities $\gamma_{ik}$, the probability point $i$ came from component $k$.`, r`M-step: update $\pi_k$, $\mu_k$, $\Sigma_k$ as responsibility-weighted estimates.`, r`Repeat until the log-likelihood stops improving; choose $K$ by BIC.`],
    math: [
      { h: 'Mixture density', tex: r`$$p(x) = \sum_{k=1}^K\pi_k\,\mathcal N(x;\,\mu_k, \Sigma_k)$$`, p: r`Weights $\pi_k$ sum to 1.` },
      { h: 'E-step', tex: r`$$\gamma_{ik} = \frac{\pi_k\mathcal N(x_i;\mu_k,\Sigma_k)}{\sum_j\pi_j\mathcal N(x_i;\mu_j,\Sigma_j)}$$`, p: r`Bayes’ rule for "which component produced this point".` },
      { h: 'M-step', tex: r`$$N_k = \sum_i\gamma_{ik},\quad \pi_k = \frac{N_k}{n},\quad \mu_k = \frac{1}{N_k}\sum_i\gamma_{ik}x_i,\quad \Sigma_k = \frac{1}{N_k}\sum_i\gamma_{ik}(x_i - \mu_k)(x_i - \mu_k)^\top$$`, p: r`Weighted versions of the usual mean and covariance. Each EM iteration never lowers the likelihood.` },
    ],
    hyper: [[r`n_components`, r`Number of Gaussians.`, r`Pick by BIC.`], [r`covariance_type`, r`full, tied, diag, spherical.`, r`full for small p; diag for larger.`], [r`n_init, init_params`, r`Restarts and initialisation.`, r`5; kmeans.`], [r`reg_covar`, r`Added to the diagonal for stability.`, r`1e-6.`]],
    pros: ['Soft, probabilistic assignments.', 'Elliptical clusters of different sizes.', 'Principled model selection with BIC; density estimation for free.'],
    cons: ['Assumes Gaussian components.', 'Local optima; sensitive to initialisation.', 'Full covariances need many parameters in high dimensions.'],
    use: r`Overlapping elliptical clusters, density estimation, anomaly scoring.`,
    avoid: r`Non-convex shapes or very high-dimensional data with few rows.`,
    complexity: [r`$O(n\,K\,p^2)$ per iteration (full)`, r`$O(K\,p^2)$`],
    glance: { learns: 'Weights, means, covariances', family: 'Probabilistic mixture' },
    code: loadMall + r`
from sklearn.mixture import GaussianMixture

bics = {k: GaussianMixture(k, covariance_type="full", n_init=5, random_state=0).fit(X).bic(X) for k in range(1, 9)}
best_k = min(bics, key=bics.get)
gmm = GaussianMixture(best_k, covariance_type="full", n_init=5, random_state=0).fit(X)
print("best k by BIC:", best_k, "soft memberships:", gmm.predict_proba(X[:3]).round(2))`,
    pitfalls: [r`Using full covariances with many features and few rows: singular matrices.`, r`Comparing log-likelihoods across different K without a penalty such as BIC.`],
    quiz: [
      { q: r`What does the E-step compute?`, o: [r`New means`, r`Responsibilities: the probability each point belongs to each component`, r`The number of components`, r`Distances to centroids`], a: 1, why: r`It fills in the hidden "which component" variable with probabilities.` },
      { q: r`k-means is a special case of a GMM with:`, o: [r`Full covariances`, r`Equal spherical covariances shrinking to zero (hard assignments)`, r`Diagonal covariances`, r`One component`], a: 1, why: r`As the shared variance goes to zero, responsibilities become 0/1 and the M-step becomes the mean update.` },
    ],
    related: ['kmeans_clustering', 'quadratic_discriminant_analysis', 'fuzzy_c_means'],
    prereq: ['kmeans_clustering', 'maximum-likelihood-estimation'],
    concepts: ['maximum-likelihood-estimation', 'clustering-metrics'],
    labIntro: r`EM step by step. Ellipses show each Gaussian at 1 and 2 standard deviations; point colour blends responsibilities.`,
    tryThis: [r`Use "elongated" blobs: GMM tilts its ellipses, k-means cannot.`, r`Switch covariance to spherical: it starts behaving like soft k-means.`],
    keywords: 'gmm gaussian mixture model em expectation maximisation bic soft clustering',
  },
  {
    id: 'spectral_clustering', short: 'Spectral clustering', title: 'Spectral Clustering',
    task: 'clustering', module: 'Probabilistic and graph-based', level: 3, minutes: 20,
    summary: r`Turns the data into a similarity graph, embeds it with eigenvectors of the graph Laplacian, then runs k-means there.`,
    lead: r`Build a graph where similar points are connected. The eigenvectors of its Laplacian give each point new coordinates in which tightly connected groups become compact blobs. Run k-means on those coordinates.`,
    intuition: [
      r`Two interleaved crescents defeat k-means in the original space, but in the graph each crescent is a chain of strong connections with only weak links between them. Spectral clustering finds a cut of the graph that separates groups while cutting as few strong edges as possible (normalised cut).`,
      r`Solving that exactly is NP-hard; relaxing it gives an eigenvector problem. The first few eigenvectors of the normalised Laplacian are nearly constant within each well-connected group, so plotted they look like tight, separate blobs.`,
    ],
    analogy: r`Finding communities in a social network by who talks to whom, not by where people live.`,
    steps: [r`Build an affinity matrix $W$ (RBF kernel or k-nearest-neighbour graph).`, r`Compute the normalised Laplacian $L_{\text{sym}} = I - D^{-1/2}WD^{-1/2}$.`, r`Take the $k$ eigenvectors with the smallest eigenvalues; normalise rows.`, r`Run k-means on the rows of this embedding.`],
    math: [
      { h: 'Graph Laplacian', tex: r`$$W_{ij} = e^{-\gamma\lVert x_i - x_j\rVert^2},\quad D_{ii} = \sum_jW_{ij},\quad L_{\text{sym}} = I - D^{-1/2}WD^{-1/2}$$`, p: r`$L$ is positive semi-definite; the number of zero eigenvalues equals the number of connected components.` },
      { h: 'Normalised cut relaxation', tex: r`$$\min_{A}\;\text{Ncut}(A, \bar A) = \frac{\text{cut}(A,\bar A)}{\text{vol}(A)} + \frac{\text{cut}(A,\bar A)}{\text{vol}(\bar A)} \;\;\leadsto\;\; \min_{U^\top U = I}\operatorname{tr}(U^\top L_{\text{sym}}U)$$`, p: r`The relaxed problem is solved by the bottom eigenvectors.` },
    ],
    hyper: [[r`n_clusters`, r`k.`, r`Look for a gap in the eigenvalues (eigengap).`], [r`affinity`, r`rbf or nearest_neighbors.`, r`nearest_neighbors is more robust to scale.`], [r`gamma / n_neighbors`, r`Graph locality.`, r`Tune; this is the key knob.`]],
    pros: ['Finds non-convex clusters.', 'Works from any similarity matrix (graphs, kernels).', 'Strong theory.'],
    cons: ['Dense eigendecomposition is $O(n^3)$; memory $O(n^2)$.', 'Sensitive to the affinity parameter.', 'Still needs k.'],
    use: r`Non-convex shapes in small to medium data, image segmentation, community detection.`,
    avoid: r`Large datasets without sparse graphs and approximate eigensolvers.`,
    complexity: [r`$O(n^3)$ dense; less with sparse kNN graphs`, r`No direct out-of-sample predict`],
    glance: { learns: 'A spectral embedding', family: 'Graph-based' },
    code: r`from sklearn.datasets import make_moons
from sklearn.cluster import SpectralClustering, KMeans

X, _ = make_moons(400, noise=0.06, random_state=0)
spec = SpectralClustering(2, affinity="nearest_neighbors", n_neighbors=10, random_state=0).fit_predict(X)
km = KMeans(2, n_init=10, random_state=0).fit_predict(X)   # compare: k-means cuts straight across`,
    pitfalls: [r`Using an RBF $\gamma$ so small that everything connects, or so large that nothing does.`],
    quiz: [
      { q: r`Why does spectral clustering succeed on two crescents?`, o: [r`It uses a deep network`, r`It clusters by graph connectivity, where each crescent is a well-connected chain`, r`It removes noise`, r`It uses Gaussian components`], a: 1, why: r`Points in a crescent are connected through neighbours even if the crescent’s ends are far apart.` },
      { q: r`The number of zero eigenvalues of a graph Laplacian equals:`, o: [r`The number of nodes`, r`The number of connected components`, r`k`, r`The rank of W`], a: 1, why: r`Each component contributes one constant-on-component eigenvector with eigenvalue 0.` },
    ],
    related: ['kmeans_clustering', 'dbscan_clustering', 'agglomerative_hierarchical'],
    prereq: ['kmeans_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Left: data coloured by spectral clustering. Right: the spectral embedding (first two non-trivial eigenvectors), where k-means is actually run.`,
    tryThis: [r`On "moons" and "circles" the embedding turns each shape into a tight blob.`, r`Make γ very small: the graph becomes fully connected and the embedding collapses.`],
    keywords: 'spectral clustering graph laplacian eigenvectors normalized cut affinity',
  },
  {
    id: 'affinity_propagation', short: 'Affinity propagation', title: 'Affinity Propagation',
    task: 'clustering', module: 'Probabilistic and graph-based', level: 3, minutes: 16,
    summary: r`Points send messages to each other until a set of exemplars emerges. The number of clusters is chosen by the data.`,
    lead: r`Every point considers every other point as a possible exemplar (representative). Two kinds of messages, responsibility and availability, are passed back and forth until each point settles on an exemplar.`,
    intuition: [
      r`<strong>Responsibility</strong> $r(i,k)$: how well-suited $k$ is to be $i$’s exemplar, compared with other candidates. <strong>Availability</strong> $a(i,k)$: how appropriate it would be for $i$ to pick $k$, given how many other points also support $k$. After convergence, exemplars are the points with positive $r(k,k) + a(k,k)$.`,
      r`The <em>preference</em> $s(k,k)$ is each point’s prior willingness to be an exemplar. Using the median similarity gives a moderate number of clusters; the minimum gives few. Damping keeps the messages from oscillating.`,
    ],
    analogy: r`An election where everyone nominates and endorses candidates in rounds until a natural set of leaders emerges.`,
    steps: [r`Compute similarities $s(i,k) = -\lVert x_i - x_k\rVert^2$; set the diagonal to the preference.`, r`Update responsibilities from similarities and current availabilities.`, r`Update availabilities from accumulated positive responsibilities.`, r`Damp the updates; repeat until exemplars stop changing.`],
    math: [
      { h: 'Message updates', tex: r`$$r(i,k) \leftarrow s(i,k) - \max_{k' \ne k}\{a(i,k') + s(i,k')\}$$ $$a(i,k) \leftarrow \min\Big\{0,\; r(k,k) + \sum_{i' \notin \{i,k\}}\max(0, r(i',k))\Big\}$$`, p: r`With $a(k,k) = \sum_{i' \ne k}\max(0, r(i',k))$ for self-availability.` },
    ],
    hyper: [[r`preference`, r`Willingness to become an exemplar.`, r`Median similarity (default); lower for fewer clusters.`], [r`damping`, r`Smoothing of messages.`, r`0.5–0.9.`], [r`max_iter, convergence_iter`, r`Stopping rules.`, r`200 / 15.`]],
    pros: ['No need to choose k.', 'Exemplars are real data points.', 'Works from any similarity matrix.'],
    cons: ['$O(n^2)$ memory and time per iteration.', 'Sensitive to preference and damping.', 'Can fail to converge.'],
    use: r`Small datasets where you want representative examples and do not know k.`,
    avoid: r`More than a few thousand points.`,
    complexity: [r`$O(T\,n^2)$`, r`$O(\text{exemplars})$`],
    glance: { learns: 'A set of exemplar points', family: 'Message passing' },
    code: loadMall + r`
from sklearn.cluster import AffinityPropagation
import numpy as np

ap = AffinityPropagation(damping=0.9, random_state=0).fit(X)
print("exemplars:", len(ap.cluster_centers_indices_))
fewer = AffinityPropagation(damping=0.9, preference=np.min(-((X[:, None] - X) ** 2).sum(-1)), random_state=0).fit(X)
print("with minimum preference:", len(fewer.cluster_centers_indices_))`,
    pitfalls: [r`Assuming the cluster count is "discovered": it is driven by the preference you set.`],
    quiz: [
      {
        q: r`Lowering the preference for all points tends to:`,
        o: [
          r`Create more clusters`,
          r`Create fewer clusters`,
          r`Make it converge faster`,
          r`Change nothing`,
        ],
        a: 1,
        why: r`Points become less willing to be exemplars.`,
        d: 1,
      },
      {
        q: r`In Affinity Propagation, what are the representative prototypes of clusters called, and what form do they take?`,
        o: [
          r`Exemplars, which are actual observations from the dataset`,
          r`Centroids, defined as arithmetic means of cluster features`,
          r`Eigenvectors, derived from the graph Laplacian`,
          r`Modes, computed from kernel density gradients`,
        ],
        a: 0,
        why: r`Affinity Propagation chooses actual data points from the sample to represent clusters; these representative instances are called exemplars.`,
        d: 1,
      },
      {
        q: r`What does the "responsibility" message $r(i, k)$ communicate from point $i$ to candidate exemplar $k$?`,
        o: [
          r`How many clusters exist in the current iteration`,
          r`Whether point $i$ is an outlier`,
          r`How well-suited candidate $k$ is to serve as the exemplar for point $i$, taking into account other competing candidates`,
          r`The Euclidean distance between point $i$ and the origin`,
        ],
        a: 2,
        why: r`Responsibility $r(i, k)$ quantifies how well-suited candidate $k$ is to be point $i$'s exemplar relative to all other candidate exemplars.`,
        d: 1,
      },
      {
        q: r`What does the "availability" message $a(i, k)$ communicate from candidate exemplar $k$ to point $i$?`,
        o: [
          r`The execution time remaining in the algorithm`,
          r`How appropriate it would be for point $i$ to choose candidate $k$ as its exemplar, based on evidence accumulated from other points that also favour $k$`,
          r`The number of features in the dataset`,
          r`The learning rate for gradient updates`,
        ],
        a: 1,
        why: r`Availability $a(i, k)$ reflects how appropriate it is for point $i$ to select $k$ as its exemplar, derived from the positive responsibilities that other points have sent to $k$.`,
        d: 1,
      },
      {
        q: r`What is the role of the <code>damping</code> parameter (typically between 0.5 and 0.9) in Affinity Propagation?`,
        o: [
          r`It scales the feature values between 0 and 1`,
          r`It blends new message values with values from the previous iteration to prevent numerical oscillations and limit cycles`,
          r`It determines the number of clusters $k$`,
          r`It stops the algorithm after a fixed number of seconds`,
        ],
        a: 1,
        why: r`Message-passing algorithms can enter periodic oscillations. Damping applies exponential smoothing: $M_t = \lambda M_{t-1} + (1 - \lambda) M_{\text{new}}$, stabilising convergence.`,
        d: 2,
      },
      {
        q: r`By default in scikit-learn, what value is assigned to the diagonal elements $s(k, k)$ (the preferences) of the similarity matrix?`,
        o: [
          r`The median of all pairwise similarities between points`,
          r`Zero`,
          r`Negative infinity`,
          r`The maximum distance in the dataset`,
        ],
        a: 0,
        why: r`In <code>AffinityPropagation</code>, setting <code>preference=None</code> defaults to the median of the input similarities, which yields a moderate number of clusters.`,
        d: 2,
      },
      {
        q: r`After convergence, how does Affinity Propagation decide whether a specific point $k$ is an exemplar?`,
        o: [
          r`If its silhouette score is greater than 0.5`,
          r`If the sum of its self-responsibility and self-availability is positive: $r(k, k) + a(k, k) > 0$`,
          r`If it is chosen by more than 50% of the points in the dataset`,
          r`If its Euclidean norm is less than 1.0`,
        ],
        a: 1,
        why: r`Point $k$ identifies as an exemplar when its self-belief $r(k, k) + a(k, k) > 0$. Points then choose the exemplar $k$ that maximises $r(i, k) + a(i, k)$.`,
        d: 2,
      },
      {
        q: r`Why is Affinity Propagation generally impractical for datasets with more than 10,000 observations?`,
        o: [
          r`Because it cannot handle continuous numeric features`,
          r`Because it only produces binary clusters`,
          r`Because it requires storing and updating full $n \times n$ responsibility and availability matrices, demanding $O(n^2)$ memory and $O(n^2)$ compute per iteration`,
          r`Because it requires GPU acceleration`,
        ],
        a: 2,
        why: r`Maintaining dense $n \times n$ similarity, responsibility, and availability matrices requires $O(n^2)$ memory. For $n = 20,000$, storing three $20,000 \times 20,000$ float64 matrices requires nearly 10 GB of RAM.`,
        d: 2,
      },
      {
        q: r`If an analyst sets <code>preference</code> to the minimum pairwise similarity $\min_{i \ne j} s(i, j)$, what effect does this have on the resulting clustering?`,
        o: [
          r`Every single point becomes its own exemplar`,
          r`Very few exemplars emerge, producing a small number of broad clusters`,
          r`The algorithm crashes due to negative numbers`,
          r`All points are labelled as unclustered noise`,
        ],
        a: 1,
        why: r`Setting low preference makes points reluctant to volunteer as exemplars. When $s(k, k)$ is set to the minimum similarity, only the strongest candidate exemplars emerge, yielding few, large clusters.`,
        d: 2,
      },
      {
        q: r`Suppose point $i$ evaluates two candidate exemplars $k_1$ and $k_2$ with similarities $s(i, k_1) = -2$ and $s(i, k_2) = -8$. The current availabilities are $a(i, k_1) = 0$ and $a(i, k_2) = 0$. Using the responsibility update formula $r(i, k) = s(i, k) - \max_{k' \ne k} \{a(i, k') + s(i, k')\}$, what is the updated responsibility $r(i, k_1)$?`,
        o: [
          r`$-10$`,
          r`$-2$`,
          r`$0$`,
          r`$+6$`,
        ],
        a: 3,
        why: r`For $k = k_1$, the competing candidate is $k_2$ with $a(i, k_2) + s(i, k_2) = 0 + (-8) = -8$. Then $r(i, k_1) = s(i, k_1) - (-8) = -2 + 8 = +6$. The positive responsibility indicates that $k_1$ is substantially more suitable for $i$ than its rival $k_2$.`,
        d: 3,
      },
      {
        q: r`Candidate exemplar $k$ receives positive responsibilities from other points: $r(1, k) = 3.0$, $r(2, k) = 1.5$, and $r(3, k) = -2.0$. Candidate $k$'s self-responsibility is $r(k, k) = -4.0$. What is the updated availability $a(4, k)$ sent to point 4 using $a(i, k) = \min\{0, \; r(k, k) + \sum_{i' \notin \{i, k\}} \max(0, r(i', k))\}$?`,
        o: [
          r`$+0.5$`,
          r`$0.0$`,
          r`$-4.0$`,
          r`$-2.5$`,
        ],
        a: 1,
        why: r`The positive support from other points is $\max(0, 3.0) + \max(0, 1.5) + \max(0, -2.0) = 4.5$. Adding self-responsibility gives $-4.0 + 4.5 = +0.5$. Because availability cannot exceed zero ($a(i, k) = \min\{0, \dots\}$), $a(4, k) = \min(0, 0.5) = 0.0$.`,
        d: 3,
      },
      {
        q: r`In an Affinity Propagation run with damping factor $\lambda = 0.8$, the old responsibility value was $r_{\text{old}} = 2.0$. The raw update calculation produces $r_{\text{new}} = 7.0$. What is the damped responsibility value $r_{\text{damped}} = \lambda r_{\text{old}} + (1 - \lambda) r_{\text{new}}$?`,
        o: [
          r`$4.5$`,
          r`$3.0$`,
          r`$6.0$`,
          r`$2.8$`,
        ],
        a: 1,
        why: r`Damping applies convex smoothing: $r_{\text{damped}} = (0.8 \times 2.0) + (0.2 \times 7.0) = 1.6 + 1.4 = 3.0$. This prevents wild jumps between iterations.`,
        d: 3,
      },
    ],
    related: ['kmedoids_clustering', 'spectral_clustering'],
    prereq: ['kmedoids_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Messages are passed for you; lines connect each point to its current exemplar (large rings).`,
    tryThis: [r`Lower the preference scale and watch exemplars disappear.`, r`Set damping to 0.5 and see if it oscillates.`],
    keywords: 'affinity propagation exemplars message passing responsibility availability preference',
  },
];
