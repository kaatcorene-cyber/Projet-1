import fs from 'fs';

function replaceInFile(file, search, replace) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

// 1. Dashboard: Avatar logic
let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dash = dash.replace(/setAvatar\('\/olam_logo_final\.png'\)/g, "setAvatar('/avatar_orange.jpg')");
dash = dash.replace(/useState<string>\('\/olam_logo_final\.png'\)/g, "useState<string>('/avatar_orange.jpg')");
dash = dash.replace(/currentTarget\.src = "\/olam_logo_final\.png"/g, 'currentTarget.src = "/avatar_orange.jpg"');
fs.writeFileSync('src/pages/Dashboard.tsx', dash);

// 2. Admin & Invest pages: App Icon
replaceInFile('src/pages/Admin.tsx', /\/olam_logo_final\.png/g, '/app_icon_orange.jpg');
replaceInFile('src/pages/Invest.tsx', /\/olam_logo_final\.png/g, '/app_icon_orange.jpg');

// 3. index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\/olam_logo_final\.png/g, '/app_icon_orange.jpg');
html = html.replace(/type="image\/png"/g, 'type="image/jpeg"');
fs.writeFileSync('index.html', html);

// 4. vite.config.ts
let vite = fs.readFileSync('vite.config.ts', 'utf8');
vite = vite.replace(/olam_logo_final\.png/g, 'app_icon_orange.jpg');
vite = vite.replace(/type: 'image\/png'/g, "type: 'image/jpeg'");
fs.writeFileSync('vite.config.ts', vite);

console.log('done');
