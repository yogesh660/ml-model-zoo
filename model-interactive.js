/**
 * Interactive Modular Dataset Switcher & Chart Manager
 * Machine Learning Model Zoo - Yogesh Awate Portfolio
 */

(function () {
  'use strict';

  // 1. Dataset Tab Switcher
  function initDatasetSwitcher() {
    const tabs = document.querySelectorAll('.dataset-tab');
    const panels = document.querySelectorAll('.dataset-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.target;

        // Update active tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active panels
        panels.forEach(p => {
          if (p.id === targetId) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });

        // Trigger resize for any Chart.js canvases inside the newly active panel
        window.dispatchEvent(new Event('resize'));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDatasetSwitcher);
  } else {
    initDatasetSwitcher();
  }

  // 2. Global chart builder helper
  window.createParityChart = function (canvasId, dataPoints, xLabel, yLabel) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const ctx = el.getContext('2d');
    
    // Find min and max for line
    let minVal = Infinity, maxVal = -Infinity;
    dataPoints.forEach(p => {
      minVal = Math.min(minVal, p.x, p.y);
      maxVal = Math.max(maxVal, p.x, p.y);
    });

    return new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Predicted vs Ground Truth',
            data: dataPoints,
            backgroundColor: '#8c7cff',
            borderColor: '#8c7cff',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointStyle: 'circle'
          },
          {
            label: 'Parity Line (y = x)',
            type: 'line',
            data: [{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }],
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            pointStyle: 'line',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: xLabel || 'Actual Value', color: '#9a9aa5', font: { family: 'DM Mono', size: 11 } },
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#9a9aa5', font: { family: 'DM Mono', size: 10 } }
          },
          y: {
            title: { display: true, text: yLabel || 'Predicted Value', color: '#9a9aa5', font: { family: 'DM Mono', size: 11 } },
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#9a9aa5', font: { family: 'DM Mono', size: 10 } }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              pointStyleWidth: 26,
              boxWidth: 26,
              boxHeight: 10,
              padding: 16,
              color: '#9a9aa5',
              font: { family: 'DM Mono', size: 11 },
              generateLabels: function(chart) {
                const vis0 = chart.isDatasetVisible(0);
                const vis1 = chart.isDatasetVisible(1);
                return [
                  {
                    text: 'Predicted vs Ground Truth',
                    fillStyle: vis0 ? '#8c7cff' : 'rgba(140, 124, 255, 0.2)',
                    strokeStyle: vis0 ? '#8c7cff' : 'rgba(140, 124, 255, 0.2)',
                    lineWidth: 0,
                    pointStyle: 'circle',
                    hidden: !vis0,
                    datasetIndex: 0
                  },
                  {
                    text: 'Parity Line (y = x)',
                    fillStyle: 'transparent',
                    strokeStyle: vis1 ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                    lineWidth: 2,
                    lineDash: [6, 4],
                    pointStyle: 'line',
                    hidden: !vis1,
                    datasetIndex: 1
                  }
                ];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return `Actual: ${ctx.parsed.x.toFixed(2)}, Pred: ${ctx.parsed.y.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  };

  window.createConfusionMatrixChart = function (canvasId, matrix) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const ctx = el.getContext('2d');

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['True Positives (TP)', 'False Positives (FP)', 'True Negatives (TN)', 'False Negatives (FN)'],
        datasets: [{
          label: 'Prediction Counts',
          data: [matrix.tp, matrix.fp, matrix.tn, matrix.fn],
          backgroundColor: ['#74df9b', '#f59e0b', '#56d9ff', '#f43f5e'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#9a9aa5', font: { family: 'DM Mono', size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#9a9aa5', font: { family: 'DM Mono', size: 10 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  };

  window.createClusterChart = function (canvasId, clusters) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const ctx = el.getContext('2d');

    const colors = ['#8c7cff', '#56d9ff', '#74df9b', '#f59e0b', '#f43f5e'];
    const datasets = clusters.map((pts, i) => ({
      label: `Cluster ${i + 1}`,
      data: pts,
      backgroundColor: colors[i % colors.length],
      borderColor: colors[i % colors.length],
      pointRadius: 4,
      pointStyle: 'circle'
    }));

    return new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#9a9aa5', font: { family: 'DM Mono', size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#9a9aa5', font: { family: 'DM Mono', size: 10 } }
          }
        },
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyleWidth: 10,
              boxWidth: 10,
              padding: 16,
              color: '#9a9aa5',
              font: { family: 'DM Mono', size: 11 }
            }
          }
        }
      }
    });
  };
})();
