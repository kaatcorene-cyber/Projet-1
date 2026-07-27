import fs from 'fs';

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

replaceInFile('src/pages/Admin.tsx', /\/logo\.svg\?v=2/g, '/logo.jpg');
replaceInFile('src/pages/Invest.tsx', /\/logo\.svg\?v=2/g, '/logo.jpg');
replaceInFile('src/pages/Dashboard.tsx', /\/logo\.svg\?v=2/g, '/logo.jpg');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\/logo\.svg\?v=2/g, '/logo.jpg');
html = html.replace(/type="image\/svg\+xml"/, 'type="image/jpeg"');
fs.writeFileSync('index.html', html);
