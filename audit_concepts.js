const fs = require('fs');
const s = fs.readFileSync('build_concepts.js', 'utf8');
const idMatches = s.match(/id:\s*'([a-z0-9-]+)'/g);
for (const m of idMatches) {
  const id = m.split("'")[1];
  const start = s.indexOf("id: '" + id + "'");
  const end = s.indexOf("relatedModels:", start);
  const block = s.substring(start, end !== -1 ? end : start + 3000);
  const sections = block.match(/title:\s*'/g) || [];
  console.log(id.padEnd(32), 'sections: ' + sections.length, 'bytes: ' + block.length);
}
