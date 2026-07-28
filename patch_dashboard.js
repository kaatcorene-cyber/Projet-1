import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Default fallback to the provided telegram link
content = content.replace(
  /const groupLink = config\?\.group_link \|\| '#';/,
  "const groupLink = config?.group_link || 'https://t.me/+ojAqyDFSzRJhZjVk';"
);

// If they need to fallback for supportLink as well, we can do it, but groupLink is the one they asked for
fs.writeFileSync('src/pages/Dashboard.tsx', content);

let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminContent = adminContent.replace(
  /const grp = settingsRes\.data\.find\(s => s\.key === 'group_link'\);/,
  "const grp = settingsRes.data.find(s => s.key === 'group_link');\n        if (!grp) setGroupLink('https://t.me/+ojAqyDFSzRJhZjVk');"
);
fs.writeFileSync('src/pages/Admin.tsx', adminContent);

