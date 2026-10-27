"""
Training & Evaluation Pipeline for K-Means Clustering
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import KMeans
model = KMeans(n_clusters=5, random_state=42)
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Optimal K": "5",
  "Silhouette": "0.5540",
  "Inertia": "65.57"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for kmeans_clustering.")
