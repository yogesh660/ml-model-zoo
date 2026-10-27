"""
Training & Evaluation Pipeline for OPTICS (Ordering Points To Identify Cluster Structure)
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import OPTICS
model = OPTICS(min_samples=5, xi=0.05)
model.fit(X_scaled)

# Export metrics
metrics = {
  "Clusters": "Variable",
  "Xi Threshold": "0.05",
  "Min Samples": "5"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for optics_clustering.")
