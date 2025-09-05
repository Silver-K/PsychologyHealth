const fs = require('fs');
const path = require('path');

function main() {
  const st = path.resolve(__dirname, './streets.json');
  const cm = path.resolve(__dirname, './communities.json');
  const cmArr = JSON.parse(fs.readFileSync(cm, 'utf-8'));
  const stArr = JSON.parse(fs.readFileSync(st, 'utf-8'));
  cmArr.forEach((cm) => {
    const f = stArr.find((it) => it.id === cm.street);
    if (f && !f.communities.includes(cm.id)) {
      f.communities.push(cm.id);
    }
  });
  fs.writeFileSync(st, JSON.stringify(stArr), 'utf-8');
}

main();