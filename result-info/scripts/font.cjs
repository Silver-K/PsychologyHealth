const fs = require('node:fs');
const path = require('node:path');

const filePath = path.resolve(__dirname, '../src/assets/font/font-awesome.css');
const outputPath = path.resolve(__dirname, '../src/assets/font/font-id.json');
function main() {
  const content = fs.readFileSync(filePath, 'utf-8');
  const arr = [];
  content.replace(/--fa:\s*?\"(.+?)\"/g, (_, $1) => {
    arr.push($1);
  });

  fs.writeFileSync(outputPath, JSON.stringify(arr), 'utf-8');
}
main();