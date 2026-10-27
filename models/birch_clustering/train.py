"""
Training & Evaluation Pipeline for BIRCH Clustering
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import Birch
model = Birch(n_clusters=5, threshold=0.5, branching_factor=50)
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Clusters": "5",
  "Branching Factor": "50",
  "Threshold": "0.5"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for birch_clustering.")
