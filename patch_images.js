import fs from 'fs';

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

// 1. Fix the logo globally by replacing /logo.jpg with /logo_olam.jpg
replaceInFile('src/pages/Admin.tsx', /\/logo\.jpg/g, '/logo_olam.jpg');
replaceInFile('src/pages/Invest.tsx', /\/logo\.jpg/g, '/logo_olam.jpg');
replaceInFile('src/pages/Dashboard.tsx', /\/logo\.jpg/g, '/logo_olam.jpg');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\/logo\.jpg/g, '/logo_olam.jpg');
fs.writeFileSync('index.html', html);

let vite = fs.readFileSync('vite.config.ts', 'utf8');
vite = vite.replace(/logo\.jpg/g, 'logo_olam.jpg');
fs.writeFileSync('vite.config.ts', vite);

// 2. Fix the large images on Register and Login to use the "l" thumbnail variant for faster loading
replaceInFile('src/pages/Register.tsx', 'https://i.imgur.com/I2qt7oH.jpg', 'https://i.imgur.com/I2qt7oHl.jpg');
replaceInFile('src/pages/Login.tsx', 'https://i.imgur.com/tCl7xi9.jpg', 'https://i.imgur.com/tCl7xi9l.jpg');

