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
      { title: 'Probability', lessons: ['probability-rules-and-bayes-theorem', 'random-variables-and-distributions', 'expectation-variance-and-covariance', 'correlation-pearson-spearman-kendall', 'central-limit-theorem-and-law-of-large-numbers', ...X('Joint, marginal and conditional distributions')] },
      { title: 'Estimation', lessons: ['sampling-and-standard-error', 'confidence-intervals', 'bootstrap-and-jackknife', ...X('MAP and Bayesian estimation', 'Estimator properties: bias, consistency, Cramér–Rao bound')] },
      { title: 'Hypothesis testing', lessons: ['hypothesis-testing-and-p-values', 'type-i-ii-errors-power-and-sample-size', 'z-test-and-t-tests', 'chi-square-tests', 'anova-and-post-hoc-tests', 'non-parametric-tests-mann-whitney-wilcoxon-kruskal-wallis', 'normality-tests-shapiro-wilk-kolmogorov-smirnov-anderson-darling', 'multiple-testing-bonferroni-holm-benjamini-hochberg', 'effect-sizes-cohens-d-cramers-v', ...X('Permutation tests', 'Likelihood-ratio, Wald and score tests')] },
      { title: 'Information theory', lessons: ['entropy-and-cross-entropy', 'kl-divergence', 'jensen-shannon-divergence', 'mutual-information', ...X('Wasserstein (earth mover\'s) distance', 'Total variation, Hellinger and Bhattacharyya distances')] },
      { title: 'Regression inference', lessons: ['ols-inference-t-tests-f-test-r2-and-adjusted-r2', 'residual-diagnostics-and-heteroscedasticity', 'multicollinearity-and-vif', 'generalised-linear-models', ...X('Logistic regression inference: odds ratios, Wald tests', 'Mixed-effects models')] },
      { title: 'Experiments and causality', lessons: ['a-b-testing-end-to-end', 'simpsons-paradox-and-confounding', ...X('Sequential testing and the peeking problem', 'Bayesian A/B testing', 'Causal graphs (DAGs) and adjustment', 'Propensity scores and matching', 'Difference-in-differences')] },
      { title: 'Bayesian and stochastic', lessons: ['conjugate-priors-beta-binomial', ...X('MCMC: Metropolis–Hastings and Gibbs', 'Hamiltonian Monte Carlo', 'Variational inference', 'Markov chains and stationary distributions')] },
      { title: 'Time series and survival', lessons: ['stationarity-acf-and-pacf', 'arima-and-sarima', 'exponential-smoothing-ets', ...X('State-space models and the Kalman filter', 'Survival analysis: Kaplan–Meier and Cox')] },
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
      { title: 'Beyond the basics', lessons: ['quantile-regression', 'gams-and-splines', ...X('Poisson and Tweedie regression', 'Isotonic regression', 'PLS and principal component regression', 'MARS')] },
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
      { title: 'Beyond the basics', lessons: ['bagging-and-extra-trees', 'multiclass-strategies-one-vs-rest-one-vs-one-softmax', 'class-imbalance-weights-smote-threshold-moving', 'probability-calibration-platt-scaling-isotonic-reliability-curves', ...X('Ordinal classification', 'Multi-label classification', 'Cost-sensitive learning')] },
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
      { title: 'Beyond the basics', lessons: [...X('Self-organising maps', 'Biclustering', 'Time-series clustering with DTW')] },
    ],
  },
  {
    id: 'ml-toolbox', num: '06', title: 'Machine learning toolbox', kicker: 'Everything around the models', track: 'ml',
    blurb: 'Dimensionality reduction, anomaly detection, optimisation, tuning, interpretability, recommenders and the theory that explains why learning works.',
    tasks: ['ml'],
    modules: [
      { title: 'Dimensionality reduction', lessons: ['pca', 't-sne', 'umap', ...X('SVD and truncated SVD', 'Kernel PCA', 'Independent component analysis', 'Non-negative matrix factorisation', 'MDS and Isomap', 'Random projections and Johnson–Lindenstrauss')] },
      { title: 'Anomaly detection', lessons: ['isolation-forest', 'local-outlier-factor', ...X('One-class SVM', 'Mahalanobis distance and robust covariance')] },
      { title: 'Probabilistic models', lessons: ['em-algorithm', ...X('Bayesian networks', 'Markov random fields', 'Gaussian process classifier')] },
      { title: 'Optimisation', lessons: ['convex-optimisation-and-duality', 'lagrange-multipliers-and-kkt-conditions', ...X('Coordinate descent', 'Newton\'s method', 'Proximal gradient methods')] },
      { title: 'Model selection', lessons: ['hyperparameter-search-grid-random-successive-halving', 'bayesian-optimisation-and-optuna', 'learning-curves-and-diagnosing-fit', 'nested-cross-validation', ...X('Ensemble theory: bagging, boosting, stacking compared', 'Conformal prediction')] },
      { title: 'Interpretability and fairness', lessons: ['permutation-and-impurity-feature-importance', 'shap', 'pdp-ice-and-ale-plots', ...X('LIME', 'Counterfactual explanations', 'Fairness metrics and mitigation')] },
      { title: 'Learning theory', lessons: ['kernel-trick-and-mercers-condition', ...X('SVM dual formulation', 'VC dimension and PAC learning', 'No free lunch and inductive bias')] },
      { title: 'Semi-supervised and active', lessons: [...X('Label propagation', 'Self-training and pseudo-labels', 'Active learning', 'Weak supervision')] },
      { title: 'Recommender systems', lessons: ['collaborative-filtering', 'matrix-factorisation-and-als', 'ranking-metrics-ndcg-map-learning-to-rank', ...X('Content-based and hybrid recommenders', 'Implicit feedback and BPR', 'Two-tower retrieval')] },
      { title: 'Pattern mining', lessons: [...X('Apriori and association rules', 'FP-growth')] },
    ],
  },
  {
    id: 'data-science', num: '07', title: 'Data science', kicker: 'The craft around the model', track: 'ds',
    blurb: 'Wrangling, feature engineering, leakage-safe validation, forecasting at scale, drift monitoring, product analytics and shipping models.',
    tasks: ['ds'],
    modules: [
      { title: 'Data wrangling', lessons: ['sql-for-analysis-joins-and-window-functions', 'pandas-and-polars-patterns', 'data-cleaning-and-validation', 'missing-data-mcar-mar-mnar-and-imputation', 'outlier-handling', ...X('Dates, time zones and temporal joins')] },
      { title: 'Feature engineering', lessons: ['encoding-categoricals-one-hot-ordinal-target-woe', 'scaling-and-transforms-standard-robust-box-cox-yeo-johnson', 'lag-and-rolling-window-features', ...X('Binning and discretisation', 'Interactions and polynomial features', 'Date and text features', 'Feature hashing and high-cardinality columns')] },
      { title: 'Pipelines and validation', lessons: ['train-validation-test-splits-group-and-time-based', 'data-leakage', 'scikit-learn-pipelines-and-columntransformer', ...X('Experiment tracking', 'Reproducibility')] },
      { title: 'Forecasting at scale', lessons: ['forecast-metrics-mae-mase-smape-wape', 'time-series-cross-validation', 'global-vs-local-models-gradient-boosting-for-forecasting', ...X('Hierarchical forecasting and reconciliation', 'Intermittent demand: Croston and TSB', 'Prophet and trend/seasonality decomposition', 'Probabilistic forecasts and quantile loss')] },
      { title: 'Monitoring and drift', lessons: ['data-drift-psi-ks-and-jensen-shannon', 'concept-drift-and-performance-monitoring', ...X('Model decay and retraining policies', 'Data quality checks')] },
      { title: 'Product analytics', lessons: ['metric-design-and-north-star-metrics', 'cohort-and-funnel-analysis', 'customer-segmentation-with-rfm', ...X('Churn and retention modelling', 'Customer lifetime value', 'Uplift modelling')] },
      { title: 'Communication', lessons: ['data-visualisation-principles', ...X('Dashboards and storytelling', 'Communicating uncertainty')] },
      { title: 'MLOps and engineering', lessons: ['docker-and-reproducible-environments', 'serving-models-with-fastapi', 'batch-vs-online-inference', ...X('CI/CD for ML', 'Model registry and versioning', 'Feature stores', 'Orchestration with Airflow and Databricks', 'Data formats: Parquet and Delta', 'Spark essentials')] },
    ],
  },
  {
    id: 'neural', num: '08', title: 'Deep learning', kicker: 'From one neuron to diffusion', track: 'dl',
    blurb: 'From a single neuron to CNNs, RNNs, GRUs and LSTMs, then how networks are trained, the main architecture families and how to make them small and reliable.',
    tasks: ['dl'],
    modules: [
      { title: 'From neurons to networks', lessons: ['perceptron', 'mlp_classifier'] },
      { title: 'Training fundamentals', lessons: ['backpropagation-and-autodiff', 'activation-functions', 'weight-initialisation-xavier-and-he', 'optimisers-sgd-momentum-rmsprop-adam-adamw', 'learning-rate-schedules-and-warm-up', 'vanishing-and-exploding-gradients-clipping', 'normalisation-batch-layer-rms', 'regularisation-dropout-weight-decay-early-stopping', ...X('Mixed precision and training stability')] },
      { title: 'Practical deep learning', lessons: ['the-pytorch-training-loop', 'reading-loss-curves-and-debugging-training', 'transfer-learning-and-fine-tuning', ...X('Data augmentation and mixup', 'Distributed training: DDP and FSDP')] },
      { title: 'Seeing: convolution', lessons: ['convolutional_neural_networks'] },
      { title: 'Sequences', lessons: ['recurrent_neural_networks', 'gru_networks', 'lstm_networks'] },
      { title: 'Architectures', lessons: ['residual-networks-and-skip-connections', 'the-attention-mechanism', 'autoencoders', 'variational-autoencoders', 'gans', 'diffusion-models', ...X('Graph neural networks: GCN, GAT, GraphSAGE', 'Mixture of experts', 'State-space models and Mamba', 'Normalising flows')] },
      { title: 'Representation learning', lessons: ['contrastive-learning-simclr-and-infonce', 'clip-and-multimodal-embeddings', ...X('Self-supervised learning: BYOL, DINO, MAE', 'Metric learning and triplet loss')] },
      { title: 'Efficiency and scale', lessons: ['quantisation', 'lora-and-parameter-efficient-fine-tuning', ...X('Knowledge distillation', 'Pruning and sparsity', 'Scaling laws')] },
      { title: 'Reliability', lessons: [...X('Uncertainty: MC dropout and deep ensembles', 'Interpretability: saliency, Grad-CAM, probing', 'Adversarial examples')] },
    ],
  },
  {
    id: 'vision', num: '09', title: 'Computer vision', kicker: 'Teaching machines to see', track: 'cv',
    blurb: 'From pixels and filters to detection, segmentation, vision transformers and 3D. It picks up from the convolutional network lesson in Deep learning.',
    tasks: ['cv'],
    modules: [
      { title: 'Image basics', lessons: ['pixels-channels-and-colour-spaces', ...C('Image filtering and convolution ⚙'), 'edge-detection-sobel-and-canny', 'thresholding-histograms-and-morphology', ...X('Classical segmentation: k-means, watershed, GrabCut')] },
      { title: 'Classical features', lessons: ['corners-and-keypoints-harris-fast', 'sift-orb-and-feature-matching', ...X('HOG with SVM', 'Image pyramids and scale space', 'Bag of visual words')] },
      { title: 'Geometry', lessons: ['geometric-transforms-and-homography', 'ransac', ...X('Camera model and calibration', 'Stereo vision and depth', 'Optical flow')] },
      { title: 'CNN foundations', lessons: ['receptive-field-stride-and-pooling', 'cnn-architecture-tour-lenet-to-resnet-to-efficientnet', ...X('Depthwise-separable convolutions and ConvNeXt')] },
      { title: 'Detection and segmentation', lessons: ['iou-nms-and-map', 'one-stage-detectors-ssd-and-yolo', 'semantic-segmentation-fcn-and-u-net', ...X('Two-stage detectors: the R-CNN family', 'Anchor-free detection and DETR', 'Instance segmentation: Mask R-CNN', 'Segment Anything')] },
      { title: 'Modern vision', lessons: ['vision-transformer', ...X('Swin and hierarchical transformers', 'Vision-language models and VQA', 'Latent diffusion and ControlNet')] },
      { title: 'Applications', lessons: ['ocr-and-document-ai', ...X('Face detection and recognition', 'Pose estimation', 'Object tracking: SORT and DeepSORT', 'Video models: 3D CNN and SlowFast', '3D vision: NeRF and Gaussian splatting', 'Medical imaging', 'Edge deployment of vision models')] },
    ],
  },
  {
    id: 'nlp', num: '10', title: 'Natural language processing', kicker: 'Words, syntax, meaning and language models', track: 'nlp',
    blurb: 'From regular expressions and TF-IDF to Word2Vec, parsing, BERT and GPT, taught on one running corpus with every algorithm runnable step by step.',
    tasks: ['nlp'],
    modules: [
      { title: '1 · Words and text', lessons: ['text-normalisation-unicode-and-regex', 'word-and-sentence-tokenization', 'tokenization', 'stop-words-and-n-grams', 'stemming-vs-lemmatisation', ...C('Edit distance and spelling correction ⚙'), 'bag-of-words-and-tf-idf', 'bm25-and-search-ranking', ...X('Phonetic matching: Soundex', 'Collocations and PMI', 'Multilingual text: scripts and the tokenisation tax')] },
      { title: '2 · Syntax', lessons: ['part-of-speech-tagging', ...C('Hidden Markov models and Viterbi ⚙', 'Context-free grammars and CKY parsing ⚙'), 'dependency-parsing', 'named-entity-recognition-and-iob-tagging', ...X('Conditional random fields')] },
      { title: '3 · Meaning', lessons: ['distributional-semantics', 'lsa-and-svd-for-text', ...C('Word2Vec: CBOW ⚙', 'Word2Vec: skip-gram with negative sampling ⚙'), 'glove-and-fasttext', 'embeddings', ...C('Topic models: LDA ⚙'), 'sentence-embeddings-and-sbert', ...X('Contextual embeddings: ELMo to BERT', 'Word sense disambiguation and Lesk', 'Semantic role labelling', 'Evaluating embeddings: similarity, analogy, bias')] },
      { title: '4 · Language models', lessons: [...C('N-gram models, smoothing and perplexity ⚙', 'Sequence-to-sequence with attention ⚙'), 'transformer_networks', ...C('BERT and masked language models', 'GPT and decoder-only models', 'Decoding: greedy, beam, top-k, top-p ⚙'), ...X('Neural language models', 'Instruction tuning, RLHF and DPO', 'Long context and efficient attention', 'Hallucination and factuality')] },
      { title: '5 · Tasks and evaluation', lessons: [...C('Text classification and sentiment', 'Machine translation', 'Semantic search and dense retrieval', 'Evaluation: BLEU, ROUGE, BERTScore, LLM-as-judge'), ...X('Summarisation', 'Question answering', 'Information and relation extraction', 'Dialogue systems', 'Coreference resolution', 'Bias and fairness in NLP')] },
      { title: '6 · Capstones', lessons: [...K('Build a search engine', 'Build a mini-GPT in the browser', 'NLP error-analysis clinic')] },
    ],
  },
  {
    id: 'ai', num: '11', title: 'AI', kicker: 'Agents, retrieval and systems', track: 'ai',
    blurb: 'Classical search and planning, reinforcement learning, and the LLM application stack: retrieval, agents, serving and safety.',
    tasks: ['ai'],
    modules: [
      { title: 'Classical AI', lessons: [...C('Intelligent agents and environments', 'Search: BFS, DFS, A* ⚙', 'Adversarial search: minimax and alpha–beta ⚙'), ...X('Monte Carlo tree search', 'Constraint satisfaction', 'Logic and knowledge representation', 'Planning: STRIPS')] },
      { title: 'Reinforcement learning', lessons: [...C('Multi-armed bandits ⚙', 'MDPs and Bellman equations', 'Dynamic programming: value and policy iteration', 'Q-learning and SARSA ⚙', 'Policy gradient: REINFORCE'), ...X('Deep Q-networks', 'Actor–critic and PPO', 'Model-based RL and AlphaZero')] },
      { title: 'LLM foundations', lessons: [...C('Prompting and in-context learning', 'Tool use and function calling', 'Evaluating LLMs: benchmarks and judges', 'Hallucination and grounding'), ...X('Context windows and memory')] },
      { title: 'Retrieval and RAG', lessons: [...C('Chunking and embeddings for retrieval', 'Vector search: HNSW, IVF, PQ ⚙', 'Hybrid search and reranking', 'RAG architecture end to end', 'RAG evaluation'), ...X('GraphRAG and multi-hop retrieval')] },
      { title: 'Agents', lessons: [...C('The agent loop: ReAct', 'Agent evaluation and test harnesses'), ...X('Planning and task decomposition', 'Memory and state', 'Multi-agent systems', 'Agent protocols: MCP')] },
      { title: 'LLM systems', lessons: [...C('Inference: KV cache, batching, paged attention', 'Serving, latency and cost'), ...X('Speculative decoding', 'Caching and model routing', 'Observability and tracing')] },
      { title: 'Safety and society', lessons: [...C('Prompt injection and jailbreaks', 'Guardrails and red-teaming'), ...X('Privacy: differential privacy and federated learning', 'AI governance and regulation', 'Alignment and interpretability overview')] },
    ],
  },
];
