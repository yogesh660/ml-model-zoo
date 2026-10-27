const fs = require('fs');
const path = require('path');

const rawDir = path.join(__dirname, 'datasets', 'raw');

// 1. Diabetes Dataset (Standard benchmark with physiological markers)
const diabetesHeader = 'Age,Sex,BMI,BP,S1,S2,S3,S4,S5,S6,Target\n';
let diabetesRows = '';
for (let i = 0; i < 442; i++) {
  const age = (20 + (i % 55) + Math.random() * 5).toFixed(1);
  const sex = (i % 2 === 0 ? 1 : 2);
  const bmi = (19 + (i % 18) + Math.random() * 4).toFixed(1);
  const bp = (80 + (i % 50) + Math.random() * 10).toFixed(1);
  const s1 = (130 + (i % 120) + Math.random() * 20).toFixed(1);
  const s2 = (s1 * 0.75 + (Math.random() - 0.5) * 15).toFixed(1); // Collinear with S1
  const s3 = (30 + (i % 40) + Math.random() * 8).toFixed(1);
  const s4 = (s1 / s3 + (Math.random() - 0.5) * 0.5).toFixed(2);
  const s5 = (4.0 + (i % 2.5) + Math.random() * 0.5).toFixed(2);
  const s6 = (70 + (i % 45) + Math.random() * 10).toFixed(1);
  const target = Math.round(25 + bmi * 3.8 + bp * 0.8 + s5 * 14 + (Math.random() - 0.5) * 20);
  diabetesRows += `${age},${sex},${bmi},${bp},${s1},${s2},${s3},${s4},${s5},${s6},${target}\n`;
}
fs.writeFileSync(path.join(rawDir, 'diabetes.csv'), diabetesHeader + diabetesRows);
console.log('Created datasets/raw/diabetes.csv');

// 2. Breast Cancer Diagnostic (Cell nuclei features)
const cancerHeader = 'Radius_Mean,Texture_Mean,Perimeter_Mean,Area_Mean,Smoothness_Mean,Compactness_Mean,Concavity_Mean,Concave_Points,Diagnosis\n';
let cancerRows = '';
for (let i = 0; i < 500; i++) {
  const isMalignant = (i % 3 === 0);
  const base = isMalignant ? 1.4 : 1.0;
  const radius = (12 * base + (Math.random() - 0.5) * 3).toFixed(2);
  const texture = (18 * base + (Math.random() - 0.5) * 4).toFixed(2);
  const perimeter = (radius * 6.28 + (Math.random() - 0.5) * 5).toFixed(2); // High collinearity with radius
  const area = (3.1415 * radius * radius * 0.25).toFixed(1);
  const smoothness = (0.09 * base + (Math.random() - 0.5) * 0.02).toFixed(4);
  const compactness = (0.10 * base + (Math.random() - 0.5) * 0.03).toFixed(4);
  const concavity = (0.08 * base + (Math.random() - 0.5) * 0.04).toFixed(4);
  const concavePts = (0.04 * base + (Math.random() - 0.5) * 0.02).toFixed(4);
  const diagnosis = isMalignant ? 'Malignant' : 'Benign';
  cancerRows += `${radius},${texture},${perimeter},${area},${smoothness},${compactness},${concavity},${concavePts},${diagnosis}\n`;
}
fs.writeFileSync(path.join(rawDir, 'breast_cancer.csv'), cancerHeader + cancerRows);
console.log('Created datasets/raw/breast_cancer.csv');

// 3. Collinear Real Estate Benchmark (Engineered collinearity for VIF testing)
const collinearHeader = 'SqFt,Bedrooms,Bathrooms,LotSize,EnergyRating,Age,TaxRate,Price\n';
let collinearRows = '';
for (let i = 0; i < 500; i++) {
  const sqft = Math.round(900 + (i * 7) + (Math.random() - 0.5) * 80);
  const bedrooms = Math.max(1, Math.round(sqft / 550 + (Math.random() - 0.5) * 0.6)); // High VIF with sqft
  const bathrooms = Math.max(1, (bedrooms * 0.8 + (Math.random() - 0.5) * 0.4).toFixed(1));
  const lotSize = Math.round(sqft * 2.8 + (Math.random() - 0.5) * 300);
  const energyRating = Math.round(50 + (i % 45) + (Math.random() - 0.5) * 10);
  const age = Math.round(2 + (i % 40) + Math.random() * 5);
  const taxRate = (1.1 + (Math.random() - 0.5) * 0.3).toFixed(2);
  const price = Math.round(150 + sqft * 0.22 - age * 0.9 + (Math.random() - 0.5) * 25);
  collinearRows += `${sqft},${bedrooms},${bathrooms},${lotSize},${energyRating},${age},${taxRate},${price}\n`;
}
fs.writeFileSync(path.join(rawDir, 'collinear_housing.csv'), collinearHeader + collinearRows);
console.log('Created datasets/raw/collinear_housing.csv');
