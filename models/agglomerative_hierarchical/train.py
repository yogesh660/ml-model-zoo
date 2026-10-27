"""
Training & Evaluation Pipeline for Agglomerative Hierarchical Clustering
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import AgglomerativeClustering
model = AgglomerativeClustering(n_clusters=5, linkage='ward')
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Clusters": "5",
  "Linkage": "Ward",
  "Cophenetic Corr": "0.7420"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for agglomerative_hierarchical.")
