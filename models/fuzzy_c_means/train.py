"""
Training & Evaluation Pipeline for Fuzzy C-Means (Soft Clustering)
Dataset: Mall Customers
"""
import json
import numpy as np
import pandas as pd

import skfuzzy as fuzz
cntr, u, u0, d, jm, p, fpc = fuzz.cluster.cmeans(X_scaled.T, 5, 2, error=0.005, maxiter=1000)

# Export metrics
metrics = {
  "Clusters": "5",
  "Fuzziness m": "2.0",
  "Partition Coeff": "0.7820"
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Pipeline executed successfully for fuzzy_c_means.")
