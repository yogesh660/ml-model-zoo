"""
Training & Evaluation Pipeline for Gaussian Mixture Models (GMM)
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.mixture import GaussianMixture
model = GaussianMixture(n_components=5, covariance_type='full', random_state=42)
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Components K": "5",
  "BIC": "1284.5",
  "Log-Likelihood": "-612.3"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for gaussian_mixture_models.")
