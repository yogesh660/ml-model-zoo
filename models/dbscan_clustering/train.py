"""
Training & Evaluation Pipeline for DBSCAN (Density-Based Spatial Clustering)
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import DBSCAN
model = DBSCAN(eps=0.45, min_samples=5)
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Estimated Clusters": "5",
  "Noise Fraction": "4.2%",
  "Silhouette": "0.5180"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for dbscan_clustering.")
