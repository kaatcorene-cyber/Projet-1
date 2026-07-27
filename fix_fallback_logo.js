import fs from 'fs';

function replaceInFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/logo\.png/g, '/logo.svg?v=2');
  fs.writeFileSync(file, content);
}

replaceInFile('src/pages/Admin.tsx');
replaceInFile('src/pages/Invest.tsx');
