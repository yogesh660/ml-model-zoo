const fs = require('fs');
const readline = require('readline');

async function extractStep() {
  const fileStream = fs.createReadStream('C:/Users/Yogesh/.gemini/antigravity/brain/551c4f69-a42d-4317-bf70-83e7e5657af8/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"step_index":888')) {
      const obj = JSON.parse(line);
      fs.writeFileSync('extracted_step_888.json', JSON.stringify(obj, null, 2));
      console.log('Saved extracted_step_888.json');
      break;
    }
  }
}
extractStep();
