const { execSync } = require('child_process');
const fs = require('fs');

const models = JSON.parse(fs.readFileSync('extracted_models.json', 'utf8'));
const formulas = {};

for (const m of models) {
  try {
    const raw = execSync(`git show bba8a6c:${m.href}`, { maxBuffer: 10 * 1024 * 1024 }).toString();
    const match = raw.match(/<div class="math-card">\s*([\s\S]*?)\s*<\/div>/);
    if (match) {
      formulas[m.href] = match[1].trim();
    }
  } catch (e) {
    console.error(`Error on ${m.href}:`, e.message);
  }
}

console.log('Extracted unique formulas:', Object.keys(formulas).length);
fs.writeFileSync('model_formulas.json', JSON.stringify(formulas, null, 2));
