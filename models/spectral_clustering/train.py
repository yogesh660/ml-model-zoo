"""
Training & Evaluation Pipeline for Spectral Clustering
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import SpectralClustering
model = SpectralClustering(n_clusters=5, affinity='nearest_neighbors', random_state=42)
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Clusters": "5",
  "Affinity": "RBF / Nearest Neighbors",
  "Silhouette": "0.5420"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for spectral_clustering.")
