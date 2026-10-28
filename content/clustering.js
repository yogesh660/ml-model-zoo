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
