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
      { q: r`Why does k-means always converge?`, o: [r`It uses a learning rate`, r`Both steps can only lower or keep the WCSS, and there are finitely many assignments`, r`It finds the global optimum`, r`It stops after 10 iterations`], a: 1, why: r`A monotonically decreasing objective over a finite set of partitions must stop.` },
      { q: r`Which shape does k-means handle worst?`, o: [r`Round blobs of similar size`, r`Two interleaved crescents`, r`Well-separated clusters`, r`Clusters of equal spread`], a: 1, why: r`It partitions space into convex Voronoi cells around the centres.` },
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
      { q: r`k-means++ chooses the next centre with probability proportional to:`, o: [r`Distance to the data mean`, r`Squared distance to the nearest chosen centre`, r`Cluster size`, r`Uniformly`], a: 1, why: r`$D(x)^2$ weighting spreads centres while keeping some randomness.` },
      { q: r`What does k-means++ improve?`, o: [r`The objective being minimised`, r`The starting point, so k-means finds better local minima faster`, r`The number of clusters`, r`Robustness to non-convex shapes`], a: 1, why: r`Only the initialisation changes; Lloyd’s algorithm runs as before.` },
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
      {
        q: r`Why is k-medoids more robust to outliers than k-means?`,
        o: [
          r`It uses more clusters`,
          r`Centres must be data points and the loss uses unsquared distance`,
          r`It removes outliers first`,
          r`It uses a Gaussian model`,
        ],
        a: 1,
        why: r`An outlier cannot drag a medoid into empty space, and its cost grows linearly, not quadratically.`,
        d: 1,
      },
      {
        q: r`Unlike k-means centroids, what is guaranteed about cluster prototypes in k-medoids?`,
        o: [
          r`They are always normalised to unit length`,
          r`They must be actual data points from the dataset`,
          r`They lie strictly along the principal coordinate axes`,
          r`They represent the arithmetic mean of all cluster members`,
        ],
        a: 1,
        why: r`By definition, a medoid is chosen from the existing data observations ($\{x_1, \dots, x_n\}$), guaranteeing that prototypes represent real, interpretable instances rather than synthetic averages.`,
        d: 1,
      },
      {
        q: r`What distance metrics can k-medoids accept that standard k-means cannot natively support without coordinate embedding?`,
        o: [
          r`Only Euclidean distance`,
          r`Only Mahalanobis distance`,
          r`Any arbitrary dissimilarity matrix, such as Manhattan, cosine, or string edit distance`,
          r`Only distances between binary integers`,
        ],
        a: 2,
        why: r`Standard k-means requires computing arithmetic means $\mu = \frac{1}{|C|}\sum x_i$, which requires Euclidean vector space coordinates. K-medoids only requires pair-wise distances $d(x_i, x_j)$, making it compatible with non-Euclidean metrics and precomputed dissimilarity matrices.`,
        d: 1,
      },
      {
        q: r`In the classic PAM (Partitioning Around Medoids) algorithm, what occurs during the SWAP step?`,
        o: [
          r`Clusters with low silhouette scores are deleted`,
          r`Each medoid is candidate-swapped with non-medoids, keeping any swap that decreases total dissimilarity`,
          r`Data points are randomly reassigned to new cluster labels`,
          r`The number of clusters $k$ is automatically incremented`,
        ],
        a: 1,
        why: r`The PAM SWAP phase systematically tests swapping each current medoid with every candidate non-medoid, calculating whether replacing the prototype lowers the total cost objective $J$.`,
        d: 2,
      },
      {
        q: r`Why is the standard PAM algorithm generally unsuitable for datasets with hundreds of thousands of observations?`,
        o: [
          r`Because it cannot converge on non-linear data`,
          r`Because its SWAP step has a computational complexity of $O(k(n - k)^2)$ per iteration`,
          r`Because medoids cannot be computed in parallel on multi-core processors`,
          r`Because it produces only spherical clusters`,
        ],
        a: 1,
        why: r`Testing every candidate swap between $k$ medoids and $n - k$ non-medoids costs $O(k(n - k)^2)$ per iteration. For $n = 100,000$, $(n - k)^2 \approx 10^{10}$, making each iteration prohibitively expensive. CLARA or mini-batch methods are used instead.`,
        d: 2,
      },
      {
        q: r`What scaling approach does the CLARA (Clustering LARge Applications) algorithm use to extend k-medoids to large datasets?`,
        o: [
          r`It draws small random sub-samples of the dataset, runs PAM on each sample, and selects the best medoids based on total dataset cost`,
          r`It projects data into 2D using PCA before running PAM`,
          r`It replaces medoids with arithmetic centroids`,
          r`It clusters features rather than sample points`,
        ],
        a: 0,
        why: r`CLARA draws multiple independent random samples of size $40 + 2k$, runs PAM on each sample to identify candidate medoids, and evaluates which set of medoids gives the lowest total dissimilarity across the entire dataset.`,
        d: 2,
      },
      {
        q: r`Consider the following Python snippet using scikit-learn-extra:
<code>from sklearn_extra.cluster import KMedoids
km = KMedoids(n_clusters=3, metric="precomputed", method="pam")
km.fit(D)</code>
What shape and structure must the input array <code>D</code> have?`,
        o: [
          r`A 1D array of cluster labels of length $n$`,
          r`A 2D feature matrix of shape $(n, p)$ containing numerical coordinates`,
          r`A square symmetric dissimilarity matrix of shape $(n, n)$ where $D_{ij}$ is the distance between point $i$ and point $j$`,
          r`A binary adjacency matrix containing only 0 and 1`,
        ],
        a: 2,
        why: r`When <code>metric="precomputed"</code> is specified, the input to <code>.fit()</code> must be a square $(n \times n)$ pairwise dissimilarity matrix where entry $(i, j)$ represents $d(x_i, x_j)$.`,
        d: 2,
      },
      {
        q: r`Which attribute of a fitted scikit-learn-extra <code>KMedoids</code> model returns the row indices of the selected exemplar instances?`,
        o: [
          r`km.cluster_centers_`,
          r`km.medoid_indices_`,
          r`km.exemplar_points_`,
          r`km.prototypes_`,
        ],
        a: 1,
        why: r`In scikit-learn-extra, <code>km.medoid_indices_</code> contains the integer row indices in the training dataset corresponding to the $k$ chosen medoids.`,
        d: 1,
      },
      {
        q: r`How does k-medoids behave when one cluster has a single extreme outlier with a feature value $100\times$ larger than all other points?`,
        o: [
          r`The medoid shifts directly to the outlier, creating an empty cluster`,
          r`The medoid stays near the dense bulk of real points because minimising sum of unsquared distances is resistant to single extreme values`,
          r`The algorithm crashes because distance calculation overflows`,
          r`The outlier is automatically assigned to a new $(k + 1)$-th cluster`,
        ],
        a: 1,
        why: r`Unlike the mean (which shifts substantially toward extreme outliers due to squared distance penalties), the medoid minimises unsquared distances $\sum d(x_i, m)$. The single outlier contributes linearly and is easily outvoted by the majority of dense points.`,
        d: 2,
      },
      {
        q: r`Consider 5 points on a 1D line: $\{1, 2, 4, 8, 10\}$. If $k = 1$ medoid is chosen from these points under Manhattan distance $d(x_i, m) = |x_i - m|$, which point is the medoid and what is the minimum total distance?`,
        o: [
          r`Medoid is $m = 2$, total distance $= 17$`,
          r`Medoid is $m = 5$, total distance $= 14$`,
          r`Medoid is $m = 4$, total distance $= 15$`,
          r`Medoid is $m = 8$, total distance $= 19$`,
        ],
        a: 2,
        why: r`For Manhattan distance in 1D, the sum of absolute deviations is minimised at the sample median. Here the median is 4. The distances are $|1-4| + |2-4| + |4-4| + |8-4| + |10-4| = 3 + 2 + 0 + 4 + 6 = 15$.`,
        d: 3,
      },
      {
        q: r`Suppose four customers $\{A, B, C, D\}$ have the following pairwise distance matrix:
$d(A, B) = 2, d(A, C) = 5, d(A, D) = 6$
$d(B, C) = 4, d(B, D) = 5$
$d(C, D) = 3$
(with all $d(X, X) = 0$).
If you must select $k = 1$ medoid to represent all four customers, which customer yields the minimum total distance, and what is that total distance?`,
        o: [
          r`Customer $A$ with total distance 13`,
          r`Customer $B$ with total distance 11`,
          r`Customer $C$ with total distance 12`,
          r`Customer $D$ with total distance 14`,
        ],
        a: 1,
        why: r`The sum of distances for each candidate is: $A: 0+2+5+6 = 13$; $B: 2+0+4+5 = 11$; $C: 5+4+0+3 = 12$; $D: 6+5+3+0 = 14$. Customer $B$ minimises total dissimilarity with a sum of 11.`,
        d: 3,
      },
      {
        q: r`In a dataset with $n = 50$ points and $k = 3$ clusters, how many candidate swaps must the classic PAM algorithm evaluate in a single full pass of the SWAP step?`,
        o: [
          r`47`,
          r`141`,
          r`1,176`,
          r`19,600`,
        ],
        a: 1,
        why: r`In PAM, each of the $k = 3$ current medoids is considered for replacement by each of the $n - k = 47$ non-medoids. The number of candidate swap pairs tested in one pass is $k(n - k) = 3 \times 47 = 141$.`,
        d: 3,
      },
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
      {
        q: r`What happens as the fuzzifier $m \to 1$?`,
        o: [
          r`Memberships become uniform`,
          r`It becomes hard k-means`,
          r`It becomes a GMM`,
          r`It diverges`,
        ],
        a: 1,
        why: r`The exponent $2/(m-1)$ blows up, so the nearest centre takes all the membership.`,
        d: 2,
      },
      {
        q: r`What fundamental constraint must the membership values $u_{ik}$ satisfy for each data point $i$ in fuzzy c-means?`,
        o: [
          r`All $u_{ik}$ must equal either 0 or 1`,
          r`The memberships across all clusters must sum to 1: $\sum_{k=1}^c u_{ik} = 1$`,
          r`The sum of squared memberships must equal $m$`,
          r`Each membership must exceed $1/c$`,
        ],
        a: 1,
        why: r`In fuzzy c-means, each observation has a distribution of degrees of belonging across clusters, constrained such that $\sum_{k=1}^c u_{ik} = 1$ with $u_{ik} \ge 0$.`,
        d: 1,
      },
      {
        q: r`How are cluster centres computed in fuzzy c-means during each iteration?`,
        o: [
          r`As the unweighted median of the nearest points`,
          r`By picking random points from the dataset`,
          r`As weighted averages of all data points, where each point is weighted by its membership raised to the fuzzifier: $u_{ik}^m$`,
          r`Using gradient descent on Gaussian covariance matrices`,
        ],
        a: 2,
        why: r`The cluster centre $\mu_k = \frac{\sum_i u_{ik}^m x_i}{\sum_i u_{ik}^m}$ is a weighted average of every point in the dataset, giving most influence to points with high membership in cluster $k$.`,
        d: 1,
      },
      {
        q: r`What is the commonly accepted default value for the fuzzifier parameter $m$ in fuzzy c-means?`,
        o: [
          r`$m = 0.5$`,
          r`$m = 1.0$`,
          r`$m = 2.0$`,
          r`$m = 10.0$`,
        ],
        a: 2,
        why: r`Across machine learning and pattern recognition literature, $m = 2.0$ is the standard textbook baseline setting for the fuzzifier parameter.`,
        d: 1,
      },
      {
        q: r`What happens to the cluster memberships $u_{ik}$ when the fuzzifier $m$ is made very large ($m \to \infty$)?`,
        o: [
          r`Each point assigns 100% membership to its closest centre`,
          r`Memberships become completely uniform: every point belongs equally to every cluster ($u_{ik} \to 1/c$)`,
          r`All cluster centres collapse to the origin $(0, 0)$`,
          r`The algorithm fails to execute due to division by zero`,
        ],
        a: 1,
        why: r`As $m \to \infty$, the exponent $2/(m-1) \to 0$, causing all distance ratios in the update formula to approach 1. Consequently, every point shares equal membership $u_{ik} = 1/c$ across all $c$ clusters.`,
        d: 1,
      },
      {
        q: r`In a 3-cluster fuzzy c-means model ($c = 3$), a customer situated midway between all three centres has memberships $u = [0.35, 0.33, 0.32]$. If an engineer uses a rule "assign to a cluster only if membership $> 0.50$", what mistake occurs?`,
        o: [
          r`The point is assigned to all three clusters simultaneously`,
          r`The customer is incorrectly discarded as an unassigned outlier, even though 0.35 is their clear majority affinity`,
          r`The fuzzifier automatically increases to 3.0`,
          r`The memberships fail to sum to 1.0`,
        ],
        a: 1,
        why: r`With $c > 2$ clusters, a point in the central overlap region can easily have its highest membership below 0.50 while still having a dominant cluster. Using a fixed 0.50 cutoff wrongly leaves many valid boundary points unlabelled.`,
        d: 2,
      },
      {
        q: r`How does fuzzy c-means differ fundamentally from a Gaussian Mixture Model (GMM), even though both produce soft assignments?`,
        o: [
          r`FCM is an objective function optimisation heuristic based on distances, whereas GMM is a probabilistic generative model with likelihoods and covariance matrices`,
          r`FCM requires knowing the true labels, whereas GMM is unsupervised`,
          r`GMM only works with 2 clusters, whereas FCM works with any $c$`,
          r`FCM can only be applied to categorical data`,
        ],
        a: 0,
        why: r`FCM minimises an empirical objective $J_m$ without defining a statistical data-generating distribution. GMM models the data as a mixture of probability density functions $\mathcal{N}(\mu_k, \Sigma_k)$ fitted via Expectation-Maximisation, providing calibrated posterior probabilities and ellipsoidal cluster shapes.`,
        d: 2,
      },
      {
        q: r`Consider the skfuzzy library call:
<code>centres, U, *_ = fuzz.cluster.cmeans(data, c=4, m=2.0, error=1e-5, maxiter=1000)</code>
What shape does skfuzzy require for the input array <code>data</code> when clustering $n$ samples with $p$ features?`,
        o: [
          r`$(n, p)$`,
          r`$(p, n)$ (features along rows, samples along columns)`,
          r`$(n, n)$ (pairwise distance matrix)`,
          r`$(p, p)$ (covariance matrix)`,
        ],
        a: 1,
        why: r`Unlike scikit-learn (which expects $(n, p)$), the <code>skfuzzy.cluster.cmeans</code> API expects features along rows and samples along columns, requiring shape $(p, n)$ (hence typically passed as <code>X.T</code>).`,
        d: 2,
      },
      {
        q: r`What shape assumptions does fuzzy c-means share with standard k-means?`,
        o: [
          r`It can discover arbitrary crescent and ring shapes`,
          r`It assumes clusters are hyper-spherical (isotropic) and roughly equal in scale because it uses Euclidean distance to spherical centres`,
          r`It assumes clusters follow hierarchical tree branches`,
          r`It assumes clusters are separated by linear support vector hyperplanes`,
        ],
        a: 1,
        why: r`Because the objective function uses Euclidean distance $\lVert x_i - \mu_k \rVert^2$, fuzzy c-means inherently favours circular/spherical clusters of comparable sizes and struggles with elongated or complex manifold shapes.`,
        d: 2,
      },
      {
        q: r`Suppose a 1D dataset is clustered with $c = 2$ centres at $\mu_1 = 0$ and $\mu_2 = 10$ using fuzzifier $m = 2$. What is the membership $u_{i1}$ of a point located at $x_i = 2$?`,
        o: [
          r`$u_{i1} = 0.800$`,
          r`$u_{i1} = 0.500$`,
          r`$u_{i1} = 4/5 = 0.800$`,
          r`$u_{i1} = 16/17 \approx 0.941$`,
        ],
        a: 3,
        why: r`$d(x, \mu_1) = 2$ and $d(x, \mu_2) = 8$. With $m = 2$, the exponent is $2/(m-1) = 2$. Then $u_{i1} = [ (2/2)^2 + (2/8)^2 ]^{-1} = [ 1 + 1/16 ]^{-1} = 16/17 \approx 0.941$. Notice it is higher than the linear ratio $8/(2+8) = 0.80$ due to the quadratic exponent.`,
        d: 3,
      },
      {
        q: r`In fuzzy c-means with $c = 2$ centres and $m = 3$, what is the exponent $2 / (m - 1)$ in the membership update formula, and what is the membership $u_{i1}$ for a point at $x_i = 3$ between centres $\mu_1 = 0$ and $\mu_2 = 6$?`,
        o: [
          r`Exponent is $1$, and $u_{i1} = 0.50$`,
          r`Exponent is $2$, and $u_{i1} = 0.75$`,
          r`Exponent is $0.5$, and $u_{i1} = 0.25$`,
          r`Exponent is $3$, and $u_{i1} = 0.50$`,
        ],
        a: 0,
        why: r`The exponent is $2/(m-1) = 2/(3-1) = 1$. Because $x_i = 3$ is equidistant from $\mu_1 = 0$ and $\mu_2 = 6$ ($d_1 = d_2 = 3$), the membership splits symmetrically: $u_{i1} = [1^1 + 1^1]^{-1} = 0.50$.`,
        d: 3,
      },
      {
        q: r`Consider two points $x_1 = [0, 0]$ and $x_2 = [10, 0]$ with memberships in cluster 1 of $u_{11} = 0.80$ and $u_{21} = 0.20$. If fuzzifier $m = 2$, what is the $x$-coordinate of the updated centre $\mu_1$?`,
        o: [
          r`2.00`,
          r`$10/17 \approx 0.588$`,
          r`5.00`,
          r`0.20`,
        ],
        a: 1,
        why: r`The weights are $u_{11}^2 = 0.64$ and $u_{21}^2 = 0.04$. The denominator is $0.64 + 0.04 = 0.68$. The numerator is $(0.64 \times 0) + (0.04 \times 10) = 0.40$. Thus $\mu_1 = 0.40 / 0.68 = 10/17 \approx 0.588$.`,
        d: 3,
      },
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
      { q: r`Which linkage is most prone to "chaining"?`, o: [r`Ward`, r`Complete`, r`Single`, r`Average`], a: 2, why: r`Two clusters merge if any single pair of points is close, so a trail of points links distant groups.` },
      { q: r`How do you get 4 clusters from a dendrogram?`, o: [r`Retrain with k = 4`, r`Cut the tree at a height that crosses 4 vertical branches`, r`Take the top 4 leaves`, r`It is not possible`], a: 1, why: r`The hierarchy contains every number of clusters from 1 to $n$.` },
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
      {
        q: r`Bisecting k-means splits which cluster next (default strategy)?`,
        o: [
          r`A random one`,
          r`The one with the largest within-cluster SSE`,
          r`The smallest`,
          r`The newest`,
        ],
        a: 1,
        why: r`It targets the cluster that explains the most remaining error.`,
        d: 1,
      },
      {
        q: r`What is the top-down nature of divisive hierarchical clustering compared to agglomerative clustering?`,
        o: [
          r`Divisive starts with every point as a separate cluster and merges them, whereas agglomerative splits`,
          r`Divisive starts with all observations in a single cluster and recursively splits them into smaller clusters`,
          r`Divisive can only produce exactly 2 clusters`,
          r`Divisive requires pre-specifying a neural network architecture`,
        ],
        a: 1,
        why: r`Divisive (top-down) clustering begins with one root cluster containing the entire dataset and iteratively partitions clusters until $k$ leaves or singletons remain.`,
        d: 1,
      },
      {
        q: r`What core algorithm is typically executed at each step of bisecting k-means to partition a selected cluster?`,
        o: [
          r`Standard k-means with $k = 2$ (2-means)`,
          r`DBSCAN with $\varepsilon = 0.5$`,
          r`Principal Component Analysis`,
          r`Hierarchical single linkage`,
        ],
        a: 0,
        why: r`Bisecting k-means works by running 2-means ($k = 2$) on the selected cluster, splitting it into exactly two sub-clusters at each step.`,
        d: 1,
      },
      {
        q: r`In scikit-learn's <code>BisectingKMeans</code>, which two strategies can be specified via the <code>bisecting_strategy</code> parameter to choose the next cluster to split?`,
        o: [
          r`"random" and "sequential"`,
          r`"biggest_inertia" and "largest_cluster"`,
          r`"ward" and "complete"`,
          r`"silhouette" and "calinski"`,
        ],
        a: 1,
        why: r`<code>BisectingKMeans</code> offers two splitting strategies: <code>"biggest_inertia"</code> (splits the cluster with largest sum of squared errors) and <code>"largest_cluster"</code> (splits the cluster containing the most data points).`,
        d: 1,
      },
      {
        q: r`Why does bisecting k-means often scale much better to large datasets than agglomerative hierarchical clustering?`,
        o: [
          r`Because bisecting k-means does not construct a tree`,
          r`Because it eliminates the need for computing Euclidean distances`,
          r`Because its time complexity is roughly $O(n \cdot k \cdot p)$ instead of $O(n^2)$ or $O(n^3)$ required to compute and update pairwise distance matrices`,
          r`Because it guarantees global optimality in a single iteration`,
        ],
        a: 2,
        why: r`Agglomerative clustering requires storing and updating an $n \times n$ distance matrix ($O(n^2)$ space, $O(n^2 \log n)$ time). Bisecting k-means only runs fast linear-time 2-means iterations, scaling as $O(n \cdot k \cdot p)$.`,
        d: 2,
      },
      {
        q: r`What happens when bisecting k-means makes a poor split near the top of the tree?`,
        o: [
          r`The algorithm backtracks and undoes the split during the final phase`,
          r`Points trapped on the wrong branch can never be reassigned to the other branch, as splits are permanently locked`,
          r`The algorithm switches to agglomerative linkage`,
          r`The number of clusters automatically doubles`,
        ],
        a: 1,
        why: r`Like all greedy hierarchical methods, divisive splits are permanent. A point separated into branch A can never be grouped with points in branch B at subsequent levels.`,
        d: 2,
      },
      {
        q: r`Why does bisecting k-means often produce more evenly sized clusters than standard Lloyd's k-means?`,
        o: [
          r`Because it enforces a strict constraint that all clusters must have equal cardinality`,
          r`Because splitting the highest-inertia or largest cluster targets sprawling clusters and breaks them down before touching compact groups`,
          r`Because it uses Manhattan distance instead of squared Euclidean distance`,
          r`Because it runs in reverse from leaves to root`,
        ],
        a: 1,
        why: r`By prioritising clusters with large SSE or large member counts for the next bisection, the algorithm repeatedly breaks down large, dispersed groups while preserving tight, naturally small clusters.`,
        d: 2,
      },
      {
        q: r`What is the role of the <code>n_init</code> parameter in <code>BisectingKMeans</code>?`,
        o: [
          r`The number of times 2-means is run with different random seeds for each split, keeping the bisection with the lowest SSE`,
          r`The number of initial clusters to create at the root`,
          r`The maximum tree depth allowed`,
          r`The learning rate for gradient updates`,
        ],
        a: 0,
        why: r`Because standard k-means is sensitive to centroid initialisation, running 2-means multiple times (e.g. <code>n_init=3</code>) at each split ensures a robust, high-quality local bisection.`,
        d: 2,
      },
      {
        q: r`In what scenario would you avoid using bisecting k-means?`,
        o: [
          r`When clustering large text document collections into a topical hierarchy`,
          r`When clusters have non-convex, manifold geometries like intertwined rings or crescents`,
          r`When you need a quick hierarchical summary of customer transaction data`,
          r`When the feature space has more than 10 dimensions`,
        ],
        a: 1,
        why: r`Because bisecting k-means uses 2-means at each step, it inherits k-means' linear Voronoi boundary assumption. It cannot trace non-convex shapes like concentric circles or crescents.`,
        d: 2,
      },
      {
        q: r`To produce a final clustering with $k = 6$ clusters using bisecting k-means, how many individual 2-means bisection splits must be performed?`,
        o: [
          r`3`,
          r`6`,
          r`5`,
          r`8`,
        ],
        a: 2,
        why: r`Every binary split adds exactly one net cluster to the pool. Starting from 1 initial root cluster, achieving $k = 6$ clusters requires exactly $k - 1 = 5$ bisections.`,
        d: 3,
      },
      {
        q: r`Suppose an intermediate step of bisecting k-means has three active clusters with the following properties:
Cluster 1: $n_1 = 100$, SSE $= 240$
Cluster 2: $n_2 = 250$, SSE $= 180$
Cluster 3: $n_3 = 50$, SSE $= 310$
If <code>bisecting_strategy="biggest_inertia"</code> is used, which cluster is chosen for the next split; and which would be chosen if <code>bisecting_strategy="largest_cluster"</code> were used?`,
        o: [
          r`Cluster 1 under both strategies`,
          r`Cluster 3 under biggest_inertia, and Cluster 2 under largest_cluster`,
          r`Cluster 2 under biggest_inertia, and Cluster 3 under largest_cluster`,
          r`Cluster 3 under both strategies`,
        ],
        a: 1,
        why: r`<code>biggest_inertia</code> selects the cluster with the highest within-cluster SSE, which is Cluster 3 ($\text{SSE} = 310$). <code>largest_cluster</code> selects the cluster with the largest number of observations, which is Cluster 2 ($n = 250$).`,
        d: 3,
      },
      {
        q: r`Consider 6 points on a line: $\{0, 2, 4, 20, 22, 24\}$. In the first bisection of bisecting k-means, a 2-means split partitions the data into $\{0, 2, 4\}$ and $\{20, 22, 24\}$. What is the total sum of squared errors (SSE) of this 2-cluster partition?`,
        o: [
          r`8`,
          r`16`,
          r`32`,
          r`64`,
        ],
        a: 1,
        why: r`The centroid of the first group is $\mu_1 = 2$, giving $\text{SSE}_1 = (-2)^2 + 0^2 + 2^2 = 8$. The centroid of the second group is $\mu_2 = 22$, giving $\text{SSE}_2 = (-2)^2 + 0^2 + 2^2 = 8$. Total inertia is $8 + 8 = 16$.`,
        d: 3,
      },
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
      {
        q: r`What makes BIRCH’s one-pass approach possible?`,
        o: [
          r`Random sampling`,
          r`Clustering Features can be merged by addition`,
          r`It stores every point`,
          r`It uses a GPU`,
        ],
        a: 1,
        why: r`$(N, LS, SS)$ summaries are additive, so sub-clusters update in constant time.`,
        d: 1,
      },
      {
        q: r`What three statistical components comprise a Clustering Feature (CF) triplet $(N, LS, SS)$ in BIRCH?`,
        o: [
          r`Number of points $N$, Linear Sum of points $LS$, and Squared Sum of points $SS$`,
          r`Number of clusters $N$, Linkage Score $LS$, and Silhouette Score $SS$`,
          r`Neighbourhood size $N$, Leaf Size $LS$, and Split Step $SS$`,
          r`Normal vector $N$, Latent Space $LS$, and Singular values $SS$`,
        ],
        a: 0,
        why: r`A Clustering Feature is defined as $CF = (N, LS, SS)$ where $N$ is the count of observations, $LS = \sum x_i$ is the vector sum, and $SS = \sum \lVert x_i \rVert^2$ is the sum of squared magnitudes.`,
        d: 1,
      },
      {
        q: r`What does the <code>threshold</code> parameter represent in BIRCH?`,
        o: [
          r`The maximum number of clusters permitted in the final partition`,
          r`The maximum allowable radius for any leaf sub-cluster in the CF-tree`,
          r`The minimum distance between two non-adjacent nodes`,
          r`The minimum p-value required to split a node`,
        ],
        a: 1,
        why: r`The <code>threshold</code> parameter sets the maximum allowable spatial radius (or diameter) for sub-clusters stored in the leaf nodes of the CF-tree.`,
        d: 1,
      },
      {
        q: r`What does the <code>branching_factor</code> hyperparameter govern in a BIRCH CF-tree?`,
        o: [
          r`The maximum number of CF entries allowed in any internal or leaf node before it must be split`,
          r`The total number of iterations in the global clustering phase`,
          r`The number of features randomly sampled at each split`,
          r`The percentage of data points discarded as noise`,
        ],
        a: 0,
        why: r`The branching factor specifies the maximum capacity (number of CF entries) of any node. When adding a new entry causes the node count to exceed the branching factor, the node splits in two.`,
        d: 1,
      },
      {
        q: r`Why must features be standard-scaled before fitting a BIRCH model with a fixed threshold?`,
        o: [
          r`Because BIRCH fails to compile on non-zero centred data`,
          r`Because the radius calculation $R = \sqrt{SS/N - \lVert\mu\rVert^2}$ uses Euclidean distance, so unscaled features with large numerical ranges dominate the sub-cluster radius`,
          r`Because scikit-learn's BIRCH requires inputs between 0 and 1`,
          r`Because standardising converts the CF-tree into a binary search tree`,
        ],
        a: 1,
        why: r`The sub-cluster radius $R$ is calculated using Euclidean norms. If one feature has scale $10,000$ and another $0.1$, the large feature completely controls the radius check against <code>threshold</code>.`,
        d: 2,
      },
      {
        q: r`What happens during Phase 4 (the final phase) of the complete BIRCH clustering pipeline?`,
        o: [
          r`The CF-tree is deleted and k-means is run on the raw dataset`,
          r`A global clustering algorithm (such as agglomerative clustering or k-means) clusters the leaf sub-cluster centres into the desired final $k$ clusters`,
          r`Each leaf entry is split into individual data points`,
          r`Points with small memberships are labelled as noise`,
        ],
        a: 1,
        why: r`After compressing millions of points into a modest number of leaf CF summaries in one pass, Phase 4 runs a standard clustering algorithm (like agglomerative clustering) on those sub-cluster centroids to produce the final $k$ clusters.`,
        d: 2,
      },
      {
        q: r`Which scikit-learn method allows BIRCH to process streaming data or massive datasets in sequential chunks larger than system memory?`,
        o: [
          r`birch.fit_predict_stream()`,
          r`birch.append_leaf()`,
          r`birch.stream_absorb()`,
          r`birch.partial_fit()`,
        ],
        a: 3,
        why: r`<code>Birch.partial_fit()</code> absorbs incoming batches of data into the existing CF-tree incrementally without reloading previous data into RAM.`,
        d: 2,
      },
      {
        q: r`What is a primary limitation of BIRCH regarding the shapes of clusters it can discover?`,
        o: [
          r`It can only discover perfectly linear clusters`,
          r`Because sub-cluster absorption is governed by a spherical radius threshold, it inherently favours spherical/convex clusters and struggles with arbitrary shapes`,
          r`It cannot cluster datasets with more than 3 features`,
          r`It forces all clusters to have identical counts $N$`,
        ],
        a: 1,
        why: r`The sub-cluster condition $R \le \text{threshold}$ enforces spherical boundaries around sub-cluster centroids, making BIRCH ill-suited for complex non-convex shapes like spirals or concentric rings.`,
        d: 2,
      },
      {
        q: r`How does increasing the <code>threshold</code> parameter affect the CF-tree produced by BIRCH?`,
        o: [
          r`It produces a deeper tree with far more leaf sub-clusters`,
          r`It allows leaf sub-clusters to expand to larger radii, resulting in fewer, coarser sub-clusters`,
          r`It increases the required memory linearly with sample size`,
          r`It forces every point into its own separate leaf node`,
        ],
        a: 1,
        why: r`A larger threshold permits individual leaf entries to cover wider spatial areas before splitting, resulting in fewer, coarser sub-clusters that absorb more observations.`,
        d: 2,
      },
      {
        q: r`Given a 1D sub-cluster with $N = 4$ points $\{2, 4, 6, 8\}$, what are its Linear Sum $LS$, Squared Sum $SS$, centroid $\mu$, and radius $R$?`,
        o: [
          r`$LS = 20, SS = 100, \mu = 5.0, R = 0.0$`,
          r`$LS = 20, SS = 120, \mu = 4.0, R = 5.0$`,
          r`$LS = 20, SS = 120, \mu = 5.0, R = \sqrt{5} \approx 2.24$`,
          r`$LS = 16, SS = 120, \mu = 5.0, R = 2.0$`,
        ],
        a: 2,
        why: r`$LS = 2+4+6+8 = 20$, $SS = 4+16+36+64 = 120$, $\mu = 20/4 = 5.0$. The radius is $R = \sqrt{SS/N - \mu^2} = \sqrt{120/4 - 25} = \sqrt{30 - 25} = \sqrt{5} \approx 2.24$.`,
        d: 3,
      },
      {
        q: r`Sub-cluster $CF_1$ has $N_1 = 3, LS_1 = [6.0, 9.0], SS_1 = 45.0$. Sub-cluster $CF_2$ has $N_2 = 2, LS_2 = [4.0, 6.0], SS_2 = 30.0$. If $CF_1$ and $CF_2$ are merged into $CF_{\text{new}} = CF_1 + CF_2$, what is the centroid $\mu_{\text{new}}$ of the merged sub-cluster?`,
        o: [
          r`$\mu_{\text{new}} = [5.0, 7.5]$`,
          r`$\mu_{\text{new}} = [2.0, 3.0]$`,
          r`$\mu_{\text{new}} = [10.0, 15.0]$`,
          r`$\mu_{\text{new}} = [1.5, 2.0]$`,
        ],
        a: 1,
        why: r`By the additivity theorem of Clustering Features, $N_{\text{new}} = 3 + 2 = 5$ and $LS_{\text{new}} = [6+4, 9+6] = [10.0, 15.0]$. The merged centroid is $\mu_{\text{new}} = LS_{\text{new}} / N_{\text{new}} = [10/5, 15/5] = [2.0, 3.0]$.`,
        d: 3,
      },
      {
        q: r`A leaf sub-cluster currently holds $N = 2$ points at coordinates $[0, 0]$ and $[2, 0]$ (so $LS = [2, 0]$, $SS = 4$, $\mu = [1, 0]$, $R = 1.0$). A new point arrives at $[4, 0]$. If the threshold is set to $\text{threshold} = 1.6$, can this leaf sub-cluster absorb the new point?`,
        o: [
          r`Yes, because $R_{\text{new}} = 1.20$, which is below the threshold`,
          r`Yes, because any sub-cluster with fewer than 5 points absorbs unconditionally`,
          r`No, because the new radius would be $\sqrt{8/3} \approx 1.63$, exceeding the threshold of $1.60$`,
          r`No, because the new point has an even coordinate`,
        ],
        a: 2,
        why: r`With the new point, $N = 3$, $LS = [6, 0]$, $SS = 4 + 16 = 20$, and $\mu = [2, 0]$. The updated radius is $R = \sqrt{20/3 - 2^2} = \sqrt{8/3} \approx 1.633$. Because $1.633 > 1.60$, the threshold is breached, so a new sub-cluster entry must be created.`,
        d: 3,
      },
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
      { q: r`A point with fewer than minPts neighbours but within $\varepsilon$ of a core point is:`, o: [r`A core point`, r`A border point`, r`Noise`, r`Its own cluster`], a: 1, why: r`It joins the core point’s cluster but cannot extend it further.` },
      { q: r`Why can DBSCAN find crescent-shaped clusters while k-means cannot?`, o: [r`It uses more iterations`, r`Clusters grow through chains of dense neighbourhoods, not around a centre`, r`It uses Gaussian components`, r`It uses a kernel`], a: 1, why: r`No centre, no convexity assumption.` },
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
      {
        q: r`What problem of DBSCAN does HDBSCAN solve?`,
        o: [
          r`Needing k`,
          r`A single global density threshold`,
          r`Detecting noise`,
          r`Speed`,
        ],
        a: 1,
        why: r`It considers all density levels and picks stable clusters from different ones.`,
        d: 1,
      },
      {
        q: r`What is the primary hyperparameter in HDBSCAN that specifies the smallest grouping an analyst considers a legitimate cluster?`,
        o: [
          r`eps`,
          r`min_cluster_size`,
          r`n_clusters`,
          r`max_leaf_nodes`,
        ],
        a: 1,
        why: r`<code>min_cluster_size</code> is HDBSCAN's primary intuitive parameter, setting the minimum number of observations required to form a distinct cluster rather than being treated as noise.`,
        d: 1,
      },
      {
        q: r`What label does HDBSCAN assign to points deemed unclustered noise or background clutter?`,
        o: [
          r`NaN`,
          r`0`,
          r`-1`,
          r`999`,
        ],
        a: 2,
        why: r`Following the scikit-learn density-based convention, HDBSCAN assigns label <code>-1</code> to points classified as noise.`,
        d: 1,
      },
      {
        q: r`What transformation is applied to density scale $\varepsilon$ to define $\lambda$ in HDBSCAN's condensed tree?`,
        o: [
          r`$\lambda = \varepsilon^2$`,
          r`$\lambda = 1 / \varepsilon$`,
          r`$\lambda = \log(\varepsilon)$`,
          r`$\lambda = \exp(-\varepsilon)$`,
        ],
        a: 1,
        why: r`In HDBSCAN, $\lambda = 1/\varepsilon$ represents inverse distance (density). As $\varepsilon$ shrinks toward zero, density $\lambda$ increases toward infinity.`,
        d: 1,
      },
      {
        q: r`How is the mutual reachability distance $d_{\text{mreach}}(a, b)$ calculated between two points $a$ and $b$?`,
        o: [
          r`As $\max\{\text{core}_k(a), \; \text{core}_k(b), \; d(a, b)\}$`,
          r`As the average of their Euclidean distance and their core distances`,
          r`As $\min\{\text{core}_k(a), \; \text{core}_k(b)\} \times d(a, b)$`,
          r`As the cosine distance between their feature vectors`,
        ],
        a: 0,
        why: r`Mutual reachability distance takes the maximum of point $a$'s core distance, point $b$'s core distance, and the raw distance between them. This artificially pushes points in sparse regions far apart, preventing noise from bridging clusters.`,
        d: 2,
      },
      {
        q: r`What happens during the tree condensation step in HDBSCAN when a cluster splits into two components?`,
        o: [
          r`Both components are always registered as new independent clusters`,
          r`If one component has fewer than min_cluster_size points, it is treated as points falling out of the parent cluster rather than a genuine split`,
          r`The algorithm restarts with a smaller sample size`,
          r`The larger component is discarded as background noise`,
        ],
        a: 1,
        why: r`The condensed tree ignores splits where one branch has fewer than <code>min_cluster_size</code> points, recording them as points gradually detaching from the cluster as density increases.`,
        d: 2,
      },
      {
        q: r`How does HDBSCAN select the final flat clusters from the condensed tree under the default "eom" (Excess of Mass) method?`,
        o: [
          r`It cuts the tree with a single horizontal line at a fixed $\lambda$`,
          r`It navigates the tree from the bottom up, comparing the stability of parent clusters against the sum of stabilities of their child clusters to maximise overall persistent mass`,
          r`It selects only the individual leaf nodes of the tree`,
          r`It picks the top $k$ clusters with the highest centroid variance`,
        ],
        a: 1,
        why: r`The Excess of Mass (EOM) criterion compares parent stability $S(\text{parent})$ with the sum of children stabilities. If the children's combined stability is greater, the children are selected; otherwise the parent is retained.`,
        d: 2,
      },
      {
        q: r`What does the <code>hdb.probabilities_</code> attribute quantify in a fitted HDBSCAN model?`,
        o: [
          r`The probability that the entire dataset is normally distributed`,
          r`The p-value of a statistical test against the null hypothesis of randomness`,
          r`The posterior probability under a fitted Gaussian mixture`,
          r`The degree of cluster membership strength for each point, reflecting how persistently the point remained in its assigned cluster across density levels`,
        ],
        a: 3,
        why: r`<code>hdb.probabilities_</code> indicates how tightly bound each point is to its assigned cluster, evaluated as $\frac{\lambda_p - \lambda_{\text{birth}}}{\lambda_{\text{death}} - \lambda_{\text{birth}}}$. Noise points have probability 0.0.`,
        d: 2,
      },
      {
        q: r`If an analyst wants HDBSCAN to produce smaller, more fine-grained sub-clusters rather than broad aggregate clusters, which setting should they change?`,
        o: [
          r`Switch cluster_selection_method from "eom" to "leaf"`,
          r`Increase min_cluster_size to a much larger number`,
          r`Set metric="precomputed"`,
          r`Set algorithm="brute"`,
        ],
        a: 0,
        why: r`Setting <code>cluster_selection_method="leaf"</code> selects the finest, homogeneous leaf sub-clusters at the tips of the condensed tree rather than merging them into broad parent clusters under Excess of Mass.`,
        d: 2,
      },
      {
        q: r`Points $a$ and $b$ are separated by Euclidean distance $d(a, b) = 1.8$. In a 5-nearest neighbour density estimate, point $a$ has core distance $\text{core}_5(a) = 1.2$ and point $b$ has core distance $\text{core}_5(b) = 2.5$. What is their mutual reachability distance $d_{\text{mreach}}(a, b)$?`,
        o: [
          r`1.2`,
          r`1.8`,
          r`2.5`,
          r`5.5`,
        ],
        a: 2,
        why: r`The mutual reachability distance is $\max\{\text{core}(a), \text{core}(b), d(a, b)\} = \max\{1.2, 2.5, 1.8\} = 2.5$. Because point $b$ sits in a sparser neighbourhood ($\text{core} = 2.5$), the effective distance between them is widened to 2.5.`,
        d: 3,
      },
      {
        q: r`A cluster $C$ is born at density $\lambda_{\text{birth}} = 0.50$ (corresponding to $\varepsilon = 2.0$). The cluster contains 3 points whose disappearance densities are $\lambda_1 = 1.50$, $\lambda_2 = 2.00$, and $\lambda_3 = 2.50$. What is the stability $S(C) = \sum_{p \in C} (\lambda_p - \lambda_{\text{birth}})$ of this cluster?`,
        o: [
          r`1.50`,
          r`3.00`,
          r`4.50`,
          r`6.00`,
        ],
        a: 2,
        why: r`Stability measures the cumulative persistence of points in the cluster above the birth threshold: $(1.50 - 0.50) + (2.00 - 0.50) + (2.50 - 0.50) = 1.00 + 1.50 + 2.00 = 4.50$.`,
        d: 3,
      },
      {
        q: r`In the condensed tree of an HDBSCAN model, a parent cluster has stability $S(\text{parent}) = 8.5$. At a higher density, the parent splits into two child clusters with stabilities $S(\text{child}_1) = 4.0$ and $S(\text{child}_2) = 5.2$. Under the Excess of Mass (EOM) selection algorithm, which cluster(s) are selected?`,
        o: [
          r`The parent cluster is selected because an individual cluster with stability 8.5 is larger than either child alone`,
          r`Both child clusters are selected because their combined stability (9.2) exceeds the parent's stability (8.5)`,
          r`All three clusters are selected simultaneously`,
          r`All points in the parent cluster are reclassified as noise`,
        ],
        a: 1,
        why: r`EOM compares the parent's stability against the sum of the children's stabilities: $S(\text{children}) = 4.0 + 5.2 = 9.2 > 8.5$. Because the children accumulate more persistence mass, the algorithm selects the two children.`,
        d: 3,
      },
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
      {
        q: r`In a reachability plot, a cluster appears as:`,
        o: [
          r`A spike`,
          r`A valley of low reachability`,
          r`A flat line at the top`,
          r`A single point`,
        ],
        a: 1,
        why: r`Points inside a dense region are reached with small distances.`,
        d: 1,
      },
      {
        q: r`What two primary outputs does the OPTICS algorithm compute to represent the multi-scale density structure of a dataset?`,
        o: [
          r`A specific ordering of points and a corresponding reachability distance for each point`,
          r`A set of $k$ centroids and a covariance matrix`,
          r`A decision tree with entropy thresholds`,
          r`A 2D projection using t-SNE`,
        ],
        a: 0,
        why: r`OPTICS does not output explicit flat clusters directly; it generates an ordering of observations (<code>ordering_</code>) alongside reachability distances (<code>reachability_</code>) whose plot displays the entire density landscape.`,
        d: 1,
      },
      {
        q: r`How is reachability distance $\text{reach}(o, p)$ defined from a core point $p$ to an observation $o$?`,
        o: [
          r`$\text{reach}(o, p) = \min\{\text{core}(p), \; d(p, o)\}$`,
          r`$\text{reach}(o, p) = \text{core}(p) + d(p, o)$`,
          r`$\text{reach}(o, p) = \max\{\text{core}(p), \; d(p, o)\}$`,
          r`$\text{reach}(o, p) = \sqrt{\text{core}(p) \cdot d(p, o)}$`,
        ],
        a: 2,
        why: r`The reachability distance from core point $p$ to $o$ is $\max\{\text{core}(p), d(p, o)\}$. It cannot be smaller than $p$'s core distance, which prevents sparse points from appearing prematurely close.`,
        d: 1,
      },
      {
        q: r`In a reachability plot, what do sharp peaks (spikes of high reachability distance) between two valleys signify?`,
        o: [
          r`The exact centre of a dense cluster`,
          r`Noise points or boundaries transitioning between different clusters`,
          r`Errors in algorithm convergence`,
          r`Duplicate data points`,
        ],
        a: 1,
        why: r`Inside a cluster, reachability is low because neighbouring points are close. Moving to a new cluster or jumping across sparse noise requires a large step, creating a sharp upward spike in the plot.`,
        d: 1,
      },
      {
        q: r`How can flat clusters equivalent to DBSCAN clusterings at a specific radius $\varepsilon$ be extracted from an OPTICS ordering?`,
        o: [
          r`By drawing a horizontal threshold line across the reachability plot at height $\varepsilon$`,
          r`By taking the derivative of the ordering index`,
          r`By pruning leaf nodes with fewer than $k$ elements`,
          r`By running k-means on the ordering array`,
        ],
        a: 0,
        why: r`Cutting an OPTICS reachability plot with a horizontal threshold line at height $\varepsilon$ directly extracts the connected components that DBSCAN would find with that same $\varepsilon$.`,
        d: 2,
      },
      {
        q: r`What is the purpose of the $\xi$ (Xi) parameter in scikit-learn's <code>OPTICS(cluster_method="xi")</code>?`,
        o: [
          r`It defines the number of clusters $k$`,
          r`It sets the minimum steepness percentage of the downward and upward slopes required to define a valley as a cluster`,
          r`It specifies the maximum iterations for priority queue traversal`,
          r`It determines the learning rate for gradient updates`,
        ],
        a: 1,
        why: r`The $\xi$ (Xi) extraction method detects clusters as valleys bounded by steep downward and upward slopes. $\xi$ defines the minimum relative steepness ($1 - \xi$) required to recognise a cluster boundary.`,
        d: 2,
      },
      {
        q: r`What happens if a point $p$ has fewer than <code>min_samples</code> neighbours within <code>max_eps</code>?`,
        o: [
          r`The algorithm crashes with a memory fault`,
          r`It is automatically merged into the nearest cluster`,
          r`It is duplicated to satisfy the minimum sample count`,
          r`Its core distance is undefined (set to infinity), so it cannot be used as a core point to pass reachability to neighbours`,
        ],
        a: 3,
        why: r`If a point does not have at least <code>min_samples</code> neighbours within <code>max_eps</code>, it is not a core point; its core distance is undefined (infinity), so it cannot establish reachability to other points.`,
        d: 2,
      },
      {
        q: r`Consider this Python snippet:
<code>from sklearn.cluster import OPTICS
opt = OPTICS(min_samples=10, xi=0.05).fit(X)</code>
In which order must the reachability array be indexed to correctly display the classic reachability plot?`,
        o: [
          r`opt.reachability_ directly without reindexing`,
          r`opt.reachability_[opt.ordering_]`,
          r`np.sort(opt.reachability_)`,
          r`opt.ordering_[opt.reachability_]`,
        ],
        a: 1,
        why: r`<code>opt.reachability_</code> stores distances in the original dataset order. To view the characteristic valleys of dense clusters, it must be indexed by the traversal order: <code>opt.reachability_[opt.ordering_]</code>.`,
        d: 2,
      },
      {
        q: r`How does nested hierarchical clustering appear visually in an OPTICS reachability plot?`,
        o: [
          r`As a straight diagonal line from bottom-left to top-right`,
          r`As a shallow broad valley that contains one or more deeper, narrower sub-valleys separated by minor rises`,
          r`As a sequence of completely flat horizontal plates`,
          r`As a periodic sinusoidal wave`,
        ],
        a: 1,
        why: r`A broad, shallow valley represents a large diffuse cluster, while deeper depressions nested within that valley represent tighter, higher-density sub-clusters embedded inside it.`,
        d: 2,
      },
      {
        q: r`Suppose <code>min_samples=4</code>. For a point $p$, the distances to its nearest neighbours (including itself at distance 0) are: $[0.0, 0.4, 0.7, 1.1, 1.6]$. For another point $o$, the distance to $p$ is $d(p, o) = 0.8$. What is $\text{core}(p)$, and what is the reachability distance $\text{reach}(o, p)$?`,
        o: [
          r`$\text{core}(p) = 0.8, \text{reach}(o, p) = 0.8$`,
          r`$\text{core}(p) = 1.1, \text{reach}(o, p) = 0.8$`,
          r`$\text{core}(p) = 1.1, \text{reach}(o, p) = 1.1$`,
          r`$\text{core}(p) = 1.6, \text{reach}(o, p) = 1.6$`,
        ],
        a: 2,
        why: r`The 4th nearest neighbour distance is $\text{core}(p) = 1.1$. The reachability distance from $p$ to $o$ is $\max\{\text{core}(p), d(p, o)\} = \max\{1.1, 0.8\} = 1.1$. Even though $o$ is only $0.8$ units away, reachability cannot drop below $p$'s core distance.`,
        d: 3,
      },
      {
        q: r`Point $p$ has core distance $\text{core}(p) = 1.5$. Two candidate neighbours $A$ and $B$ have distances $d(p, A) = 1.2$ and $d(p, B) = 2.1$. What are the reachability distances $\text{reach}(A, p)$ and $\text{reach}(B, p)$?`,
        o: [
          r`$\text{reach}(A, p) = 1.2$ and $\text{reach}(B, p) = 2.1$`,
          r`$\text{reach}(A, p) = 1.5$ and $\text{reach}(B, p) = 2.1$`,
          r`$\text{reach}(A, p) = 1.5$ and $\text{reach}(B, p) = 1.5$`,
          r`$\text{reach}(A, p) = 2.7$ and $\text{reach}(B, p) = 3.6$`,
        ],
        a: 1,
        why: r`$\text{reach}(A, p) = \max\{1.5, 1.2\} = 1.5$ because $d(p, A) < \text{core}(p)$. For point $B$, $d(p, B) = 2.1 > 1.5$, so $\text{reach}(B, p) = \max\{1.5, 2.1\} = 2.1$.`,
        d: 3,
      },
      {
        q: r`In an OPTICS reachability plot, points 60 to 170 inclusive all have reachability distance $\le 0.8$, while the surrounding points have reachability exceeding $1.5$. If clusters are extracted using a horizontal cut at $\varepsilon = 0.8$ with min_samples = 10, how many points form this cluster?`,
        o: [
          r`111`,
          r`110`,
          r`170`,
          r`60`,
        ],
        a: 0,
        why: r`Points 60 through 170 inclusive have reachability distances at or below the cut threshold $\varepsilon = 0.8$. The number of observations in this contiguous cluster segment is $170 - 60 + 1 = 111$.`,
        d: 3,
      },
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
      { q: r`Increasing the bandwidth generally:`, o: [r`Finds more clusters`, r`Finds fewer, broader clusters`, r`Has no effect`, r`Increases noise points`], a: 1, why: r`A wider kernel smooths away small density peaks.` },
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
      { q: r`Lowering the preference for all points tends to:`, o: [r`Create more clusters`, r`Create fewer clusters`, r`Make it converge faster`, r`Change nothing`], a: 1, why: r`Points become less willing to be exemplars.` },
    ],
    related: ['kmedoids_clustering', 'spectral_clustering'],
    prereq: ['kmedoids_clustering'],
    concepts: ['clustering-metrics'],
    labIntro: r`Messages are passed for you; lines connect each point to its current exemplar (large rings).`,
    tryThis: [r`Lower the preference scale and watch exemplars disappear.`, r`Set damping to 0.5 and see if it oscillates.`],
    keywords: 'affinity propagation exemplars message passing responsibility availability preference',
  },
];
