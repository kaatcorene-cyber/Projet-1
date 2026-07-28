import fs from 'fs';

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

replaceInFile('src/pages/Admin.tsx', /\/logo_olam\.jpg/g, '/logo_olam.png');
replaceInFile('src/pages/Invest.tsx', /\/logo_olam\.jpg/g, '/logo_olam.png');
replaceInFile('src/pages/Dashboard.tsx', /\/logo_olam\.jpg/g, '/logo_olam.png');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\/logo_olam\.jpg/g, '/logo_olam.png');
html = html.replace(/type="image\/jpeg"/g, 'type="image/png"');
fs.writeFileSync('index.html', html);

let vite = fs.readFileSync('vite.config.ts', 'utf8');
vite = vite.replace(/logo_olam\.jpg/g, 'logo_olam.png');
vite = vite.replace(/type: 'image\/jpeg'/g, "type: 'image/png'");
fs.writeFileSync('vite.config.ts', vite);
