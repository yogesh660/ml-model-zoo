"""Compare an LSTM and a small Transformer encoder on sequences.

Each 8x8 digit image from scikit-learn is read as a sequence of 8 rows (8 features per step), so both
models have to combine information across time steps. Nothing is downloaded.

Run from the repository root (needs PyTorch: pip install torch):

    python models/transformers_rnn_classifier/train.py
"""
import json
from datetime import date
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split

HERE = Path(__file__).resolve().parent
torch.manual_seed(0)

digits = load_digits()
X = (digits.images / 16.0).astype(np.float32)                 # (n, 8 steps, 8 features)
y = digits.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)


class LSTMClassifier(nn.Module):
    def __init__(self, d=64):
        super().__init__()
        self.lstm = nn.LSTM(8, d, batch_first=True)
        self.out = nn.Linear(d, 10)

    def forward(self, x):
        _, (h, _) = self.lstm(x)
        return self.out(h[-1])


class TinyTransformer(nn.Module):
    def __init__(self, d=64, heads=4, layers=2):
        super().__init__()
        self.embed = nn.Linear(8, d)
        self.pos = nn.Parameter(torch.zeros(1, 8, d))
        block = nn.TransformerEncoderLayer(d, heads, dim_feedforward=128, dropout=0.1, batch_first=True)
        self.encoder = nn.TransformerEncoder(block, layers)
        self.out = nn.Linear(d, 10)

    def forward(self, x):
        h = self.encoder(self.embed(x) + self.pos)
        return self.out(h.mean(dim=1))                           # mean-pool over time steps


def train_and_score(model, epochs=40):
    opt = torch.optim.AdamW(model.parameters(), lr=2e-3, weight_decay=1e-4)
    Xt, yt = torch.tensor(X_train), torch.tensor(y_train)
    for _ in range(epochs):
        model.train()
        for idx in torch.randperm(len(Xt)).split(64):
            opt.zero_grad()
            nn.functional.cross_entropy(model(Xt[idx]), yt[idx]).backward()
            opt.step()
    model.eval()
    with torch.no_grad():
        pred = model(torch.tensor(X_test)).argmax(1).numpy()
    return {"Accuracy": round(float(accuracy_score(y_test, pred)), 4),
            "Macro F1": round(float(f1_score(y_test, pred, average="macro")), 4),
            "Parameters": int(sum(p.numel() for p in model.parameters()))}


result = {
    "dataset": "scikit-learn digits read row by row",
    "summary": "Both models see each digit as 8 time steps of 8 pixels, are trained for 40 epochs on 80% of the "
               "images and scored on a stratified 20% hold-out.",
    "model_label": "Transformer encoder",
    "baseline_label": "LSTM",
    "metrics": train_and_score(TinyTransformer()),
    "baseline": train_and_score(LSTMClassifier()),
    "generated": f"generated {date.today().isoformat()}",
}
(HERE / "metrics.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
