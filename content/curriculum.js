// The order things are taught in. Each live lesson id appears in exactly one path; the build fails
// loudly if a lesson is missing here or listed twice.
//
// A module's `lessons` holds live lesson ids (strings) and planned lessons (arrays: [title, tier]).
// Planned lessons get a "coming soon" page at concepts/<slug of the title>/. To turn one into a real
// lesson, write it in content/*.js with that same slug as its id and replace the array with the id.
// A trailing " ⚙" in a title means the lesson will have a live algorithm lab.
const C = (...t) => t.map(x => [x, 'Core']);
const X = (...t) => t.map(x => [x, 'Extended']);
const K = (...t) => t.map(x => [x, 'Capstone']);

module.exports = [
  {
    id: 'foundations', num: '01', title: 'Foundations', kicker: 'Theory behind every model', track: 'ml',
    blurb: 'The ideas every model rests on: how models measure mistakes, how they learn, why they overfit and how to judge them honestly.',
    tasks: ['ml'],
    modules: [
      { title: 'Data first', lessons: ['exploratory-data-analysis', 'feature-selection'] },
      { title: 'Learning as optimisation', lessons: ['cost-vs-loss-vs-error', 'loss-functions', 'gradient-descent', 'maximum-likelihood-estimation', 'quasi-newton-and-lbfgs'] },
      { title: 'Generalisation', lessons: ['bias-variance-tradeoff', 'regularization', 'cross-validation'] },
      { title: 'Probability for classifiers', lessons: ['log-odds', 'sigmoid-and-link-functions'] },
      { title: 'Evaluation', lessons: ['regression-metrics', 'confusion-matrix', 'precision-recall-f1', 'roc-auc', 'clustering-metrics'] },
    ],
  },
  {
    id: 'statistics', num: '02', title: 'Statistics', kicker: 'Probability, inference and experiments', track: 'stats',
    blurb: 'From probability rules to hypothesis tests, divergences, A/B testing and Bayesian methods: the statistics a data scientist is expected to know cold.',
    tasks: ['stats'],
    modules: [
      { title: 'Probability', lessons: ['probability-rules-and-bayes-theorem', 'random-variables-and-distributions', 'expectation-variance-and-covariance', 'correlation-pearson-spearman-kendall', 'central-limit-theorem-and-law-of-large-numbers', 'joint-marginal-and-conditional-distributions'] },
      { title: 'Estimation', lessons: ['sampling-and-standard-error', 'confidence-intervals', 'bootstrap-and-jackknife', 'map-and-bayesian-estimation', 'estimator-properties-bias-consistency-cramer-rao-bound'] },
      { title: 'Hypothesis testing', lessons: ['hypothesis-testing-and-p-values', 'type-i-ii-errors-power-and-sample-size', 'z-test-and-t-tests', 'chi-square-tests', 'anova-and-post-hoc-tests', 'non-parametric-tests-mann-whitney-wilcoxon-kruskal-wallis', 'normality-tests-shapiro-wilk-kolmogorov-smirnov-anderson-darling', 'multiple-testing-bonferroni-holm-benjamini-hochberg', 'effect-sizes-cohens-d-cramers-v', 'permutation-tests', 'likelihood-ratio-wald-and-score-tests'] },
      { title: 'Information theory', lessons: ['entropy-and-cross-entropy', 'kl-divergence', 'jensen-shannon-divergence', 'mutual-information', 'wasserstein-earth-movers-distance', 'total-variation-hellinger-and-bhattacharyya-distances'] },
      { title: 'Regression inference', lessons: ['ols-inference-t-tests-f-test-r2-and-adjusted-r2', 'residual-diagnostics-and-heteroscedasticity', 'multicollinearity-and-vif', 'generalised-linear-models', 'logistic-regression-inference-odds-ratios-wald-tests', 'mixed-effects-models'] },
      { title: 'Experiments and causality', lessons: ['a-b-testing-end-to-end', 'simpsons-paradox-and-confounding', 'sequential-testing-and-the-peeking-problem', 'bayesian-a-b-testing', 'causal-graphs-dags-and-adjustment', 'propensity-scores-and-matching', 'difference-in-differences'] },
      { title: 'Bayesian and stochastic', lessons: ['conjugate-priors-beta-binomial', 'mcmc-metropolis-hastings-and-gibbs', 'hamiltonian-monte-carlo', 'variational-inference', 'markov-chains-and-stationary-distributions'] },
      { title: 'Time series and survival', lessons: ['stationarity-acf-and-pacf', 'arima-and-sarima', 'exponential-smoothing-ets', 'state-space-models-and-the-kalman-filter', 'survival-analysis-kaplan-meier-and-cox'] },
    ],
  },
  {
    id: 'regression', num: '03', title: 'Regression', kicker: 'Predicting numbers', track: 'ml',
    blurb: 'From a straight line to gradient-boosted trees: ways to predict a number, and when each one is the right call.',
    tasks: ['ml'],
    modules: [
      { title: 'Linear models', lessons: ['ols_linear_regression', 'polynomial_regression', 'ridge_regression', 'lasso_regression', 'elastic_net', 'robust_regression', 'bayesian_linear_regression'] },
      { title: 'Kernel and instance-based', lessons: ['knn_regressor', 'support_vector_regression', 'gaussian_process_regressor'] },
      { title: 'Trees and ensembles', lessons: ['decision_tree_regressor', 'random_forest_regressor', 'gradient_boosting_regressor', 'xgboost_regressor', 'lightgbm_regressor', 'catboost_regressor'] },
      { title: 'Neural networks', lessons: ['mlp_regressor'] },
      { title: 'Beyond the basics', lessons: ['quantile-regression', 'gams-and-splines', 'poisson-and-tweedie-regression', 'isotonic-regression', 'pls-and-principal-component-regression', 'mars'] },
    ],
  },
  {
    id: 'classification', num: '04', title: 'Classification', kicker: 'Predicting categories', track: 'ml',
    blurb: 'Probabilistic, margin-based and tree-based classifiers, built up from logistic regression to stacked ensembles.',
    tasks: ['ml'],
    modules: [
      { title: 'Linear and probabilistic', lessons: ['logistic_regression', 'linear_discriminant_analysis', 'quadratic_discriminant_analysis', 'gaussian_naive_bayes', 'multinomial_bernoulli_nb'] },
      { title: 'Margin and instance-based', lessons: ['support_vector_classifier', 'knn_classifier'] },
      { title: 'Trees and ensembles', lessons: ['decision_tree_classifier', 'random_forest_classifier', 'adaboost_classifier', 'gradient_boosted_classifiers', 'stacking_voting_classifiers'] },
      { title: 'Beyond the basics', lessons: ['bagging-and-extra-trees', 'multiclass-strategies-one-vs-rest-one-vs-one-softmax', 'class-imbalance-weights-smote-threshold-moving', 'probability-calibration-platt-scaling-isotonic-reliability-curves', 'ordinal-classification', 'multi-label-classification', 'cost-sensitive-learning'] },
    ],
  },
  {
    id: 'clustering', num: '05', title: 'Clustering', kicker: 'Finding structure without labels', track: 'ml',
    blurb: 'Centroids, hierarchies, density and graphs: ways to group data when nobody has told you the answer.',
    tasks: ['ml'],
    modules: [
      { title: 'Centroid-based', lessons: ['kmeans_clustering', 'kmeans_plus_plus', 'kmedoids_clustering', 'fuzzy_c_means'] },
      { title: 'Hierarchical', lessons: ['agglomerative_hierarchical', 'divisive_hierarchical', 'birch_clustering'] },
      { title: 'Density-based', lessons: ['dbscan_clustering', 'hdbscan_clustering', 'optics_clustering', 'mean_shift_clustering'] },
      { title: 'Probabilistic and graph-based', lessons: ['gaussian_mixture_models', 'spectral_clustering', 'affinity_propagation'] },
      { title: 'Beyond the basics', lessons: ['self-organising-maps', 'biclustering', 'time-series-clustering-with-dtw'] },
    ],
  },
  {
    id: 'ml-toolbox', num: '06', title: 'Machine learning toolbox', kicker: 'Everything around the models', track: 'ml',
    blurb: 'Dimensionality reduction, anomaly detection, optimisation, tuning, interpretability, recommenders and the theory that explains why learning works.',
    tasks: ['ml'],
    modules: [
      { title: 'Dimensionality reduction', lessons: ['pca', 't-sne', 'umap', 'svd-and-truncated-svd', 'kernel-pca', 'independent-component-analysis', 'non-negative-matrix-factorisation', 'mds-and-isomap', 'random-projections-and-johnson-lindenstrauss'] },
      { title: 'Anomaly detection', lessons: ['isolation-forest', 'local-outlier-factor', 'one-class-svm', 'mahalanobis-distance-and-robust-covariance'] },
      { title: 'Probabilistic models', lessons: ['em-algorithm', 'bayesian-networks', 'markov-random-fields', 'gaussian-process-classifier'] },
      { title: 'Optimisation', lessons: ['convex-optimisation-and-duality', 'lagrange-multipliers-and-kkt-conditions', 'coordinate-descent', 'newtons-method', 'proximal-gradient-methods'] },
      { title: 'Model selection', lessons: ['hyperparameter-search-grid-random-successive-halving', 'bayesian-optimisation-and-optuna', 'learning-curves-and-diagnosing-fit', 'nested-cross-validation', 'ensemble-theory-bagging-boosting-stacking-compared', 'conformal-prediction'] },
      { title: 'Interpretability and fairness', lessons: ['permutation-and-impurity-feature-importance', 'shap', 'pdp-ice-and-ale-plots', 'lime', 'counterfactual-explanations', 'fairness-metrics-and-mitigation'] },
      { title: 'Learning theory', lessons: ['kernel-trick-and-mercers-condition', 'svm-dual-formulation', 'vc-dimension-and-pac-learning', 'no-free-lunch-and-inductive-bias'] },
      { title: 'Semi-supervised and active', lessons: ['label-propagation', 'self-training-and-pseudo-labels', 'active-learning', 'weak-supervision'] },
      { title: 'Recommender systems', lessons: ['collaborative-filtering', 'matrix-factorisation-and-als', 'ranking-metrics-ndcg-map-learning-to-rank', 'content-based-and-hybrid-recommenders', 'implicit-feedback-and-bpr', 'two-tower-retrieval'] },
      { title: 'Pattern mining', lessons: ['apriori-and-association-rules', 'fp-growth'] },
    ],
  },
  {
    id: 'data-science', num: '07', title: 'Data science', kicker: 'The craft around the model', track: 'ds',
    blurb: 'Wrangling, feature engineering, leakage-safe validation, forecasting at scale, drift monitoring, product analytics and shipping models.',
    tasks: ['ds'],
    modules: [
      { title: 'Data wrangling', lessons: ['sql-for-analysis-joins-and-window-functions', 'pandas-and-polars-patterns', 'data-cleaning-and-validation', 'missing-data-mcar-mar-mnar-and-imputation', 'outlier-handling', 'dates-time-zones-and-temporal-joins'] },
      { title: 'Feature engineering', lessons: ['encoding-categoricals-one-hot-ordinal-target-woe', 'scaling-and-transforms-standard-robust-box-cox-yeo-johnson', 'lag-and-rolling-window-features', 'binning-and-discretisation', 'interactions-and-polynomial-features', 'date-and-text-features', 'feature-hashing-and-high-cardinality-columns'] },
      { title: 'Pipelines and validation', lessons: ['train-validation-test-splits-group-and-time-based', 'data-leakage', 'scikit-learn-pipelines-and-columntransformer', 'experiment-tracking', 'reproducibility'] },
      { title: 'Forecasting at scale', lessons: ['forecast-metrics-mae-mase-smape-wape', 'time-series-cross-validation', 'global-vs-local-models-gradient-boosting-for-forecasting', 'hierarchical-forecasting-and-reconciliation', 'intermittent-demand-croston-and-tsb', 'prophet-and-trend-seasonality-decomposition', 'probabilistic-forecasts-and-quantile-loss'] },
      { title: 'Monitoring and drift', lessons: ['data-drift-psi-ks-and-jensen-shannon', 'concept-drift-and-performance-monitoring', 'model-decay-and-retraining-policies', 'data-quality-checks'] },
      { title: 'Product analytics', lessons: ['metric-design-and-north-star-metrics', 'cohort-and-funnel-analysis', 'customer-segmentation-with-rfm', 'churn-and-retention-modelling', 'customer-lifetime-value', 'uplift-modelling'] },
      { title: 'Communication', lessons: ['data-visualisation-principles', 'dashboards-and-storytelling', 'communicating-uncertainty'] },
      { title: 'MLOps and engineering', lessons: ['docker-and-reproducible-environments', 'serving-models-with-fastapi', 'batch-vs-online-inference', 'ci-cd-for-ml', 'model-registry-and-versioning', 'feature-stores', 'orchestration-with-airflow-and-databricks', 'data-formats-parquet-and-delta', 'spark-essentials'] },
    ],
  },
  {
    id: 'neural', num: '08', title: 'Deep learning', kicker: 'From one neuron to diffusion', track: 'dl',
    blurb: 'From a single neuron to CNNs, RNNs, GRUs and LSTMs, then how networks are trained, the main architecture families and how to make them small and reliable.',
    tasks: ['dl'],
    modules: [
      { title: 'From neurons to networks', lessons: ['perceptron', 'mlp_classifier'] },
      { title: 'Training fundamentals', lessons: ['backpropagation-and-autodiff', 'activation-functions', 'weight-initialisation-xavier-and-he', 'optimisers-sgd-momentum-rmsprop-adam-adamw', 'learning-rate-schedules-and-warm-up', 'vanishing-and-exploding-gradients-clipping', 'normalisation-batch-layer-rms', 'regularisation-dropout-weight-decay-early-stopping', 'mixed-precision-and-training-stability'] },
      { title: 'Practical deep learning', lessons: ['the-pytorch-training-loop', 'reading-loss-curves-and-debugging-training', 'transfer-learning-and-fine-tuning', 'data-augmentation-and-mixup', 'distributed-training-ddp-and-fsdp'] },
      { title: 'Seeing: convolution', lessons: ['convolutional_neural_networks'] },
      { title: 'Sequences', lessons: ['recurrent_neural_networks', 'gru_networks', 'lstm_networks'] },
      { title: 'Architectures', lessons: ['residual-networks-and-skip-connections', 'the-attention-mechanism', 'autoencoders', 'variational-autoencoders', 'gans', 'diffusion-models', 'graph-neural-networks-gcn-gat-graphsage', 'mixture-of-experts', 'state-space-models-and-mamba', 'normalising-flows'] },
      { title: 'Representation learning', lessons: ['contrastive-learning-simclr-and-infonce', 'clip-and-multimodal-embeddings', 'self-supervised-learning-byol-dino-mae', 'metric-learning-and-triplet-loss'] },
      { title: 'Efficiency and scale', lessons: ['quantisation', 'lora-and-parameter-efficient-fine-tuning', 'knowledge-distillation', 'pruning-and-sparsity', 'scaling-laws'] },
      { title: 'Reliability', lessons: ['uncertainty-mc-dropout-and-deep-ensembles', 'interpretability-saliency-grad-cam-probing', 'adversarial-examples'] },
    ],
  },
  {
    id: 'vision', num: '09', title: 'Computer vision', kicker: 'Teaching machines to see', track: 'cv',
    blurb: 'From pixels and filters to detection, segmentation, vision transformers and 3D. It picks up from the convolutional network lesson in Deep learning.',
    tasks: ['cv'],
    modules: [
      { title: 'Image basics', lessons: ['pixels-channels-and-colour-spaces', ...C('Image filtering and convolution ⚙'), 'edge-detection-sobel-and-canny', 'thresholding-histograms-and-morphology', 'classical-segmentation-k-means-watershed-grabcut'] },
      { title: 'Classical features', lessons: ['corners-and-keypoints-harris-fast', 'sift-orb-and-feature-matching', 'hog-with-svm', 'image-pyramids-and-scale-space', 'bag-of-visual-words'] },
      { title: 'Geometry', lessons: ['geometric-transforms-and-homography', 'ransac', 'camera-model-and-calibration', 'stereo-vision-and-depth', 'optical-flow'] },
      { title: 'CNN foundations', lessons: ['receptive-field-stride-and-pooling', 'cnn-architecture-tour-lenet-to-resnet-to-efficientnet', 'depthwise-separable-convolutions-and-convnext'] },
      { title: 'Detection and segmentation', lessons: ['iou-nms-and-map', 'one-stage-detectors-ssd-and-yolo', 'semantic-segmentation-fcn-and-u-net', 'two-stage-detectors-the-r-cnn-family', 'anchor-free-detection-and-detr', 'instance-segmentation-mask-r-cnn', 'segment-anything'] },
      { title: 'Modern vision', lessons: ['vision-transformer', 'swin-and-hierarchical-transformers', 'vision-language-models-and-vqa', 'latent-diffusion-and-controlnet'] },
      { title: 'Applications', lessons: ['ocr-and-document-ai', 'face-detection-and-recognition', 'pose-estimation', 'object-tracking-sort-and-deepsort', 'video-models-3d-cnn-and-slowfast', '3d-vision-nerf-and-gaussian-splatting', 'medical-imaging', 'edge-deployment-of-vision-models'] },
    ],
  },
  {
    id: 'nlp', num: '10', title: 'Natural language processing', kicker: 'Words, syntax, meaning and language models', track: 'nlp',
    blurb: 'From regular expressions and TF-IDF to Word2Vec, parsing, BERT and GPT, taught on one running corpus with every algorithm runnable step by step.',
    tasks: ['nlp'],
    modules: [
      { title: '1 · Words and text', lessons: ['text-normalisation-unicode-and-regex', 'word-and-sentence-tokenization', 'tokenization', 'stop-words-and-n-grams', 'stemming-vs-lemmatisation', ...C('Edit distance and spelling correction ⚙'), 'bag-of-words-and-tf-idf', 'bm25-and-search-ranking', 'phonetic-matching-soundex', 'collocations-and-pmi', 'multilingual-text-scripts-and-the-tokenisation-tax'] },
      { title: '2 · Syntax', lessons: ['part-of-speech-tagging', ...C('Hidden Markov models and Viterbi ⚙', 'Context-free grammars and CKY parsing ⚙'), 'dependency-parsing', 'named-entity-recognition-and-iob-tagging', 'conditional-random-fields'] },
      { title: '3 · Meaning', lessons: ['distributional-semantics', 'lsa-and-svd-for-text', ...C('Word2Vec: CBOW ⚙', 'Word2Vec: skip-gram with negative sampling ⚙'), 'glove-and-fasttext', 'embeddings', ...C('Topic models: LDA ⚙'), 'sentence-embeddings-and-sbert', 'contextual-embeddings-elmo-to-bert', 'word-sense-disambiguation-and-lesk', 'semantic-role-labelling', 'evaluating-embeddings-similarity-analogy-bias'] },
      { title: '4 · Language models', lessons: [...C('N-gram models, smoothing and perplexity ⚙', 'Sequence-to-sequence with attention ⚙'), 'transformer_networks', 'bert-and-masked-language-models', 'gpt-and-decoder-only-models', ...C('Decoding: greedy, beam, top-k, top-p ⚙'), 'neural-language-models', 'instruction-tuning-rlhf-and-dpo', 'long-context-and-efficient-attention', 'hallucination-and-factuality'] },
      { title: '5 · Tasks and evaluation', lessons: ['text-classification-and-sentiment', 'machine-translation', 'semantic-search-and-dense-retrieval', 'evaluation-bleu-rouge-bertscore-llm-as-judge', 'summarisation', 'question-answering', 'information-and-relation-extraction', 'dialogue-systems', 'coreference-resolution', 'bias-and-fairness-in-nlp'] },
      { title: '6 · Capstones', lessons: [...K('Build a search engine', 'Build a mini-GPT in the browser', 'NLP error-analysis clinic')] },
    ],
  },
  {
    id: 'ai', num: '11', title: 'AI', kicker: 'Agents, retrieval and systems', track: 'ai',
    blurb: 'Classical search and planning, reinforcement learning, and the LLM application stack: retrieval, agents, serving and safety.',
    tasks: ['ai'],
    modules: [
      { title: 'Classical AI', lessons: ['intelligent-agents-and-environments', ...C('Search: BFS, DFS, A* ⚙', 'Adversarial search: minimax and alpha–beta ⚙'), 'monte-carlo-tree-search', 'constraint-satisfaction', 'logic-and-knowledge-representation', 'planning-strips'] },
      { title: 'Reinforcement learning', lessons: [...C('Multi-armed bandits ⚙'), 'mdps-and-bellman-equations', 'dynamic-programming-value-and-policy-iteration', ...C('Q-learning and SARSA ⚙'), 'policy-gradient-reinforce', 'deep-q-networks', 'actor-critic-and-ppo', 'model-based-rl-and-alphazero'] },
      { title: 'LLM foundations', lessons: ['prompting-and-in-context-learning', 'tool-use-and-function-calling', 'evaluating-llms-benchmarks-and-judges', 'hallucination-and-grounding', 'context-windows-and-memory'] },
      { title: 'Retrieval and RAG', lessons: ['chunking-and-embeddings-for-retrieval', ...C('Vector search: HNSW, IVF, PQ ⚙'), 'hybrid-search-and-reranking', 'rag-architecture-end-to-end', 'rag-evaluation', 'graphrag-and-multi-hop-retrieval'] },
      { title: 'Agents', lessons: ['the-agent-loop-react', 'agent-evaluation-and-test-harnesses', 'planning-and-task-decomposition', 'memory-and-state', 'multi-agent-systems', 'agent-protocols-mcp'] },
      { title: 'LLM systems', lessons: ['inference-kv-cache-batching-paged-attention', 'serving-latency-and-cost', 'speculative-decoding', 'caching-and-model-routing', 'observability-and-tracing'] },
      { title: 'Safety and society', lessons: ['prompt-injection-and-jailbreaks', 'guardrails-and-red-teaming', 'privacy-differential-privacy-and-federated-learning', 'ai-governance-and-regulation', 'alignment-and-interpretability-overview'] },
    ],
  },
];
