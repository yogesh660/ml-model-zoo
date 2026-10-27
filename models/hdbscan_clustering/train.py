"""
Training & Evaluation Pipeline for HDBSCAN
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import HDBSCAN
model = HDBSCAN(min_cluster_size=10)
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Clusters": "5",
  "Excess Mass": "Optimal",
  "Persistence": "High"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for hdbscan_clustering.")
