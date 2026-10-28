// The order things are taught in. Each lesson id appears in exactly one path; the build fails
// loudly if a lesson is missing here or listed twice.
module.exports = [
  {
    id: 'foundations', num: '01', title: 'Foundations', kicker: 'Statistics and theory',
    blurb: 'The ideas every model rests on: how models measure mistakes, how they learn, why they overfit and how to judge them honestly.',
    tasks: ['concepts'],
    modules: [
      { title: 'Data first', lessons: ['exploratory-data-analysis', 'feature-selection'] },
      { title: 'Learning as optimisation', lessons: ['cost-vs-loss-vs-error', 'loss-functions', 'gradient-descent', 'maximum-likelihood-estimation', 'quasi-newton-and-lbfgs'] },
      { title: 'Generalisation', lessons: ['bias-variance-tradeoff', 'regularization', 'cross-validation'] },
      { title: 'Probability for classifiers', lessons: ['log-odds', 'sigmoid-and-link-functions'] },
      { title: 'Evaluation', lessons: ['regression-metrics', 'confusion-matrix', 'precision-recall-f1', 'roc-auc', 'clustering-metrics'] },
    ],
  },
  {
    id: 'regression', num: '02', title: 'Regression', kicker: 'Predicting numbers',
    blurb: 'From a straight line to gradient-boosted trees: seventeen ways to predict a number, and when each one is the right call.',
    tasks: ['regression'],
    modules: [
      { title: 'Linear models', lessons: ['ols_linear_regression', 'polynomial_regression', 'ridge_regression', 'lasso_regression', 'elastic_net', 'robust_regression', 'bayesian_linear_regression'] },
      { title: 'Kernel and instance-based', lessons: ['knn_regressor', 'support_vector_regression', 'gaussian_process_regressor'] },
      { title: 'Trees and ensembles', lessons: ['decision_tree_regressor', 'random_forest_regressor', 'gradient_boosting_regressor', 'xgboost_regressor', 'lightgbm_regressor', 'catboost_regressor'] },
      { title: 'Neural networks', lessons: ['mlp_regressor'] },
    ],
  },
  {
    id: 'classification', num: '03', title: 'Classification', kicker: 'Predicting categories',
    blurb: 'Probabilistic, margin-based and tree-based classifiers, built up from logistic regression to stacked ensembles.',
    tasks: ['classification'],
    modules: [
      { title: 'Linear and probabilistic', lessons: ['logistic_regression', 'linear_discriminant_analysis', 'quadratic_discriminant_analysis', 'gaussian_naive_bayes', 'multinomial_bernoulli_nb'] },
      { title: 'Margin and instance-based', lessons: ['support_vector_classifier', 'knn_classifier'] },
      { title: 'Trees and ensembles', lessons: ['decision_tree_classifier', 'random_forest_classifier', 'adaboost_classifier', 'gradient_boosted_classifiers', 'stacking_voting_classifiers'] },
    ],
  },
  {
    id: 'clustering', num: '04', title: 'Clustering', kicker: 'Finding structure without labels',
    blurb: 'Centroids, hierarchies, density and graphs: fourteen ways to group data when nobody has told you the answer.',
    tasks: ['clustering'],
    modules: [
      { title: 'Centroid-based', lessons: ['kmeans_clustering', 'kmeans_plus_plus', 'kmedoids_clustering', 'fuzzy_c_means'] },
      { title: 'Hierarchical', lessons: ['agglomerative_hierarchical', 'divisive_hierarchical', 'birch_clustering'] },
      { title: 'Density-based', lessons: ['dbscan_clustering', 'hdbscan_clustering', 'optics_clustering', 'mean_shift_clustering'] },
      { title: 'Probabilistic and graph-based', lessons: ['gaussian_mixture_models', 'spectral_clustering', 'affinity_propagation'] },
    ],
  },
  {
    id: 'neural', num: '05', title: 'Neural networks', kicker: 'From one neuron to attention',
    blurb: 'From a single neuron to CNNs, RNNs, GRUs, LSTMs and Transformers: the ideas behind modern deep learning, one step at a time.',
    tasks: ['classification'],
    modules: [
      { title: 'From neurons to networks', lessons: ['perceptron', 'mlp_classifier'] },
      { title: 'Seeing: convolution', lessons: ['convolutional_neural_networks'] },
      { title: 'Sequences', lessons: ['recurrent_neural_networks', 'gru_networks', 'lstm_networks', 'transformer_networks'] },
    ],
  },
];
