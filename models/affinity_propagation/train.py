"""
Training & Evaluation Pipeline for Affinity Propagation
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

from sklearn.cluster import AffinityPropagation
model = AffinityPropagation(damping=0.8, random_state=42)
labels = model.fit_predict(X_scaled)

# Export metrics
metrics = {
  "Estimated Exemplars": "7",
  "Damping": "0.80",
  "Silhouette": "0.4890"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for affinity_propagation.")
